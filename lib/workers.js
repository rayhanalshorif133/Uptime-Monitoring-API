/*
* Title: Workers Library
* Description: Workers related files
* Author: Rayhan Al Shorif
* Date: 30/04/2023
*/


// Dependencies
const url = require('url');
const https = require('https');
const http = require('http');
const data = require('./data');
const  { parseJSON } = require('./utilities');
const { sendTwilioSms } = require('./notifications');

// App object - module scaffolding
const worker = {};

//  performance check
worker._performCheck = (originalData) => {
    // prepare the initial check outcome
    let checkOutcome = {
        'error': false,
        'responseCode': false,
    };

    let outcomeSent = false;

    // parse the hostname and full url from original data
    const parseUrl = url.parse(`${originalData.protocol}://${originalData.url}`,true);
    const hostname = parseUrl.hostname;
    const path = parseUrl.path; // using path and not "pathname" because we want the query string



    // construct the request
    const requestDetails = {
        'protocol': `${originalData.protocol}:`,
        'hostname': hostname,
        'method': originalData.method.toUpperCase(),
        'path': path,
        'timeout': originalData.timeOutSeconds * 1000,
    };

    const protocolToUse = originalData.protocol === 'http' ? http : https;


    // instantiate the request object (using either the http or https module)


    const req = protocolToUse.request(requestDetails,(res) => {
        // grab the status of the sent request
        const status = res.statusCode;

        // // update the check outcome and pass to the next process
        checkOutcome.responseCode = status;
        if (!outcomeSent){
        outcomeSent = true;

            worker._processCheckOutcome(originalData,checkOutcome);
        }
        
    });

    req.on('error',(e) => {
        checkOutcome = {
            'error': true,
            'value': e,
        };
        if (!outcomeSent) {
            outcomeSent = true;
            worker._processCheckOutcome(originalData, checkOutcome);
        }
    });

   

    req.on('timeout',() => {
        checkOutcome = {
            'error': true,
            'value':  'timeout',
        };
        if (!outcomeSent) {
            outcomeSent = true;
            worker._processCheckOutcome(originalData, checkOutcome);
        }
    });

    req.end();
};

// process check outcome
// success or failure
worker._processCheckOutcome = (originalData,checkOutcome) => {
    // check if check outcome is up or down
    const state = !checkOutcome.error && checkOutcome.responseCode && originalData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    // decide if an alert is warranted
    const alertWarranted = originalData.lastChecked && originalData.state !== state ? true : false;

    // update the check data
    const newCheckData = originalData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

//    update the check to disk
data.update('checks',newCheckData.id,newCheckData,(err) => {
    if (!err){
        // send the new check data to the next phase in the process if needed
        if (alertWarranted){
            worker._alertUserToStatusChange(newCheckData);
        }else{
            console.log('Check outcome has not changed, no alert needed');
        }
    }else{
        console.log('Error trying to save updates to one of the checks');
    }
});
};


// alert the user as to a change in their check status
worker._alertUserToStatusChange = (newCheckData) => {
    let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone,msg,(err) => {
        if (!err){
            console.log(`Success: User was alerted to a status change in their check, via sms: ${msg}`);
        }else{
            console.log('Error: Could not send sms alert to user who had a state change in their check');
        }
    });
};

// validate individual check data
worker._validatedCheckData = (originalCheckData) => {
    let originalData = originalCheckData;
    if (originalData && originalData.id){
        originalData.state = typeof(originalData.state) === 'string' && ['up','down'].indexOf(originalData.state) > -1 ? originalData.state : 'down';

        originalData.lastChecked = typeof(originalData.lastChecked) === 'number' && originalData.lastChecked > 0 ? originalData.lastChecked : false;
        // pass to the next process

        worker._performCheck(originalData);
    }else{
        console.log('Error: Check was invalid or not properly formatted');
    }
};

// lookup all checks, get their data
worker.gatherAllChecks = () => {
    // get all the checks
    data.list('checks',(err,checks) => {
        if (!err && checks && checks.length > 0){
            checks.forEach((check) => {
                data.read('checks',check,(err2,originalCheckData) => {
                    if(!err2 && originalCheckData){
                        // pass the data to the check validator, and let that function continue or log errors as needed
                        worker._validatedCheckData(parseJSON(originalCheckData));
                    }else{
                        console.log('Error reading one of the check\'s data');
                    }
                });
            });


        }else{
            console.log('Error: Could not find any checks to process');
        }
    });
};
// timer to execute the worker-process once per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};

// start the worker

worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();
    // call the loop so that checks continue
    worker.loop();
}

module.exports = worker;
