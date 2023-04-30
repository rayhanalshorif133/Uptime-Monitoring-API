/*
* Title: Check Handler
* Description: Handler to handle user defined checks
* Author: Rayhan Al Shorif
* Date: 30/04/2023
*/

// Dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../lib/utilities');
const validation = require('../../helpers/validations');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environment');


// module scaffolding

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

// sub module scaffolding 
handler._check = {};


handler._check.post = (requestProperties, callback) => {


   

    // validate inputs
    const protocol = validation.protocol(requestProperties.body.protocol);
    const url = validation.text(requestProperties.body.url);
    const method = validation.method(requestProperties.body.method.toUpperCase());
    const successCodes = validation.successCode(requestProperties.body.successCodes);
    const timeOutSeconds = validation.timeOutSecond(requestProperties.body.timeOutSeconds);

   
    
    if(protocol && url && method && successCodes && timeOutSeconds) {
       
        // verify token
        const token = validation.text(requestProperties.headersObject.token);
        // lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData){
                const userPhone = parseJSON(tokenData).phone;
                // lookup the user data
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData){
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if(tokenIsValid){
                                let userObject = parseJSON(userData);
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                if (userChecks.length < maxChecks){
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeOutSeconds,
                                    };

                                    // save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3){
                                            // add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4){
                                                    // return the data about the new check
                                                    callback(200, checkObject);
                                                }else{
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });

                                            callback(200, {
                                                info: checkObject,
                                                message: 'Check created successfully',
                                            });
                                        }else{
                                            callback(500, {
                                                error: 'There was a problem in the server side!',
                                            });
                                        }
                                    });
                                }else{
                                    callback(401, {
                                        error: 'User has already reached max check limit!',
                                    });
                                }
                            }else{
                                callback(403, {
                                    error: 'Token is not valid, Authentication failure',
                                });
                            }
                        });
                    }else{
                        callback(403, {
                            error: 'User Not Found!',
                        });
                    }
                });

            }else{
                callback(403, {
                    error: 'Authentication failure!',
                });
            }
        });

    }
    else{
        callback(400, {
            error: 'There is a problem in your request',
        });
    }
};

handler._check.get = (requestProperties, callback) => {
    const id = validation.number(requestProperties.queryStringObject.id, 20);
    if (id) {
        // lookup the token
        data.read('checks', id, (err, checkData) => {
            const check = { ...parseJSON(checkData) };
            if (!err && check) {
                // verify token
                const token = validation.text(requestProperties.headersObject.token);

                tokenHandler._token.verify(token, check.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, check);
                    } else {
                        callback(403, {
                            error: 'Authentication failure!',
                        });
                    }
                });
                

            } else {
                callback(500, {
                    error: 'Requested check was not found',
                });
            }
        });
    }
    else {
        callback(500, {
            error: 'Requested token was not found',
        });
    }
   
};

handler._check.put = (requestProperties, callback) => {

    // validate inputs
    const id = validation.text(requestProperties.body.id, 20);
    const protocol = validation.protocol(requestProperties.body.protocol);
    const url = validation.text(requestProperties.body.url);
    const method = validation.method(requestProperties.body.method);
    const successCodes = validation.successCode(requestProperties.body.successCodes);
    const timeOutSeconds = validation.timeOutSecond(requestProperties.body.timeOutSeconds);


    if (id) {
        if(protocol || url || method || successCodes || timeOutSeconds) {

            // lookup the check
            data.read('checks', id, (err1, checkData) => {
                if(!err1 && checkData){
                    let checkObject = parseJSON(checkData);
                    let userPhone = checkObject.userPhone;
                    const token = validation.text(requestProperties.headersObject.token);
                    tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                        if (tokenIsValid){

                            if(protocol){
                                checkObject.protocol = protocol;
                            }
                            if(url){
                                checkObject.url = url;
                            }
                            if(method){
                                checkObject.method = method;
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;
                            }

                            if(timeOutSeconds){
                                checkObject.timeOutSeconds = timeOutSeconds;
                            }

                            // store the new updates
                            data.update('checks', id, checkObject, (err2) => {
                                if(!err2){
                                    callback(200, {
                                        message: 'Check updated successfully!',
                                    });
                                }else{
                                    callback(500, {
                                        error: 'There was a problem in the server side!',
                                    });
                                }
                            });
                        }else{
                            callback(403, {
                                error: 'Authentication failure!',
                            });
                        }
                    });
                }else{
                    callback(500, {
                        error: 'There was a problem in the server side!',
                    });
                }
            });

        }else{
            callback(400, {
                error: 'You have to provide at least one field to update',
            });
        }
    }else{
        callback(400, {
            error: 'There is a problem in your request',
        });
    }
};


handler._check.delete = (requestProperties, callback) => {
    const id = validation.number(requestProperties.queryStringObject.id, 20);
    if (id) {
        // lookup the token
        data.read('checks', id, (err, checkData) => {
            const check = { ...parseJSON(checkData) };
            if (!err && check) {
                // verify token
                const token = validation.text(requestProperties.headersObject.token);

                tokenHandler._token.verify(token, check.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        
                        // delete the check data
                        data.delete('checks', id, (err2) => {
                            if(!err2){

                                data.read('users', check.userPhone, (err3, userData) => {
                                    userObject = parseJSON(userData);
                                    if(!err3 && userData){
                                        const userChecks = typeof userObject.checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        const checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            userObject.checks = userChecks;
                                            data.update('users', check.userPhone, userObject, (err4) => {
                                                if(!err4){
                                                    callback(200, {
                                                        message: 'Check deleted successfully!',
                                                    });
                                                }else{
                                                    callback(500, {
                                                        error: 'There was a problem in the server side!',
                                                    });
                                                }
                                            });

                                        }else{
                                            callback(500, {
                                                error: 'The check id that you are trying to remove is not found in user!',
                                            });
                                        }

                                    }else{
                                        callback(500, {
                                            error: 'There was a problem in the server side!',
                                        });
                                    }

                                });

                                callback(200, {
                                    message: 'Check deleted successfully!',
                                });
                            }else{
                                callback(500, {
                                    error: 'There was a problem in the server side!',
                                });
                            }
                        });

                    } else {
                        callback(403, {
                            error: 'Authentication failure!',
                        });
                    }
                });


            } else {
                callback(500, {
                    error: 'Requested check was not found',
                });
            }
        });
    }
    else {
        callback(500, {
            error: 'Requested token was not found',
        });
    }

};

module.exports = handler;