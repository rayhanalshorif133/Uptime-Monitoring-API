/*
* Title: UpTime Monitoring Application
* Description: A RESTFul API to monitor up or down time of user defined links
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/


// Dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environment');
const { sendTwilioSms } = require('./lib/notifications');

// App object - module scaffolding
const app = {};

// sendTwilioSms('01923988380','Hello world',(err) => {
//     console.log(`this is the error`, err);
// });

// Configuration

// Create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Listening to port ${environment.port}`);
    });
};

// handle request response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();
