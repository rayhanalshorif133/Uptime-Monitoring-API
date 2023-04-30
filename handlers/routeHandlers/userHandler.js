/*
* Title: User Handler
* Description: Route Handler for User
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/

// Dependencies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../lib/utilities');
const validation = require('../../helpers/validations');
const tokenHandler = require('./tokenHandler');


// module scaffolding

const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._user[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

// sub module scaffolding 
handler._user = {};


handler._user.post = (requestProperties, callback) => {


    const firstName = validation.text(requestProperties.body.firstName);
    const lastName = validation.text(requestProperties.body.lastName);
    const phone = validation.number(requestProperties.body.phone);
    const password = validation.text(requestProperties.body.password);
    const tosAgreement = typeof (requestProperties.body.tosAgreement) === 'boolean' ? requestProperties.body.tosAgreement : false;


    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn't already exist
        data.read('users', phone, (err1) => {
            if(err1){
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                data.create('users', phone, userObject, (err2) => {
                    if(!err2){
                        callback(200, {
                            message: 'You have successfully created a user',
                        });
                    }else{
                        callback(500, {
                            error: 'There was a problem in the server side',
                        });
                    }
                });
            }else{
                callback(400, {
                    error: 'User already exist',
                });
            }
        });
         
    }else{
        callback(400, {
            message: 'You have a problem in your request',
        });
    }


};

handler._user.get = (requestProperties, callback) => {

    // check the phone number if valid
    const phone = validation.number(requestProperties.queryStringObject.phone);
    if(phone)
    {
        let givenToken = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
        tokenHandler._token.verify(givenToken, phone, (tokenId) => {
            if(tokenId){
                // lookup the user
                data.read('users', phone, (err, u) => {
                    const user = { ...parseJSON(u) };
                    if(!err && user){
                        // remove the password from the user object before sending
                        delete user.password;
                        callback(200, user);
                    }else{
                        callback(404, {
                            error: 'Requested user was not found',
                        });
                    }
                });
            }else{
                callback(403, {
                    error: 'Authentication failure',
                });
            }
        });
    }
    else{
        callback(404, {
            error: 'Requested user was not found',
        });
    }
};

handler._user.put = (requestProperties, callback) => {


    const firstName = validation.text(requestProperties.body.firstName);
    const lastName = validation.text(requestProperties.body.lastName);
    const phone = validation.number(requestProperties.body.phone);
    const password = validation.text(requestProperties.body.password);

    if(phone){
        if (firstName || lastName || password){

            let givenToken = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
            tokenHandler._token.verify(givenToken, phone, (tokenId) => {
                if (tokenId) {
                    data.read('users', phone, (err1, uData) => {
                        const userData = { ...parseJSON(uData) };
                        if (!err1 && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }

                            data.update('users', phone, userData, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message: 'User was updated successfully',
                                    });
                                } else {
                                    callback(400, {
                                        error: 'You have a problem in your request',
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'User not found',
                            });
                        }
                    });
                }
                else{
                    callback(403, {
                        error: 'Authentication failure',
                    });
                }
            });
                // lookup the user
            
        }else{
            callback(400, {
                error: 'You have nothing to update',
            });
        }
    }else{
        callback(400, {
            error: 'Invalid phone number, please try again',
        });
    }
};


handler._user.delete = (requestProperties, callback) => {
    // check the phone number if valid
    const phone = validation.number(requestProperties.body.phone);
         
    if(phone){
        let givenToken = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
        tokenHandler._token.verify(givenToken, phone, (tokenId) => {
            if (tokenId) {
                data.read('users', phone, (err1, uData) => {
                    if (!err1 && uData) {
                        data.delete('users', phone, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: 'User was successfully deleted',
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a server side error',
                                });
                            }
                        });
                    }
                    else {
                        callback(400, {
                            error: 'User not found',
                        });
                    }
                });
            }
            else{
                callback(403, {
                    error: 'Authentication failure',
                });
            }
        });
    }
    else{
        callback(400, {
            error: 'Invalid phone number, please try again',
        });
    }

};

module.exports = handler;