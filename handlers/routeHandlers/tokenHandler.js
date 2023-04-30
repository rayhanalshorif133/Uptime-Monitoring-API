/*
* Title: Token Handler
* Description: Token Related Route Handler
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/

// Dependencies
const data = require('../../lib/data');
const validations = require('../../helpers/validations');
const { hash, parseJSON, createRandomString } = require('../../lib/utilities');


// module scaffolding

const handler = {};


// token handler
handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

// sub module scaffolding
handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone = validations.number(requestProperties.body.phone);
    const password = validations.text(requestProperties.body.password);

    if (phone && password) {
        data.read('users', phone, (err1, userData) => {
            if(!err1 && userData){
                const hashedPassword = hash(password);
                if(hashedPassword === parseJSON(userData).password){
                    const tokenId = createRandomString(20);
                    const expires = Date.now() + (60 * 60 * 1000);
                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires,
                    };
                    // store the token
                    data.create('tokens', tokenId, tokenObject, (err2) => {
                        if(!err2){
                            callback(200, tokenObject);
                        }else{
                            callback(500, {
                                error: 'There was a problem in the server side',
                            });
                        }
                    });
                }else{
                    callback(400, {
                        error: 'Password is not valid',
                    });
                }

            }else{
                callback(400, {
                    error: 'You have a problem in your request',
                });
            }
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    const id = validations.number(requestProperties.queryStringObject.id,20);
    if (id) {
        // lookup the token
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Requested token was not found',
                });
            }
        });
    }
    else {
        callback(404, {
            error: 'Requested token was not found',
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    const id = validations.number(requestProperties.body.id, 20);
    const extend = validations.boolean(requestProperties.body.extend);
    if (id && extend) {
        data.read('tokens', id, (err1, tokenData) => {
            const tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + (60 * 60 * 1000);
                // store the updated token
                data.update('tokens', id, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200,{
                            token_info: tokenObject,
                            message: 'Token updated successfully',
                        });
                    } else {
                        callback(500, {
                            error: 'There was a server side error!',
                        });
                    }
                });
            }else{
                callback(400, {
                    error: 'Token already expired',
                });
            }
        });
    }
    else {
        callback(404, {
            error: 'There was a problem in your request',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    // check the phone number if valid
    const id = validations.number(requestProperties.queryStringObject.id,20);

    if (id) {
        data.read('tokens', id, (err1, tokenData) => {
            if (!err1 && tokenData) {
                data.delete('tokens', id, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'Token was successfully deleted',
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
                    error: 'Token not found',
                });
            }
        });
    }
    else {
        callback(400, {
            error: 'Invalid Token, please try again',
        });
    }

};


handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err1, tokenData) => {
        console.log("given", phone,"tokenData",tokenData);
        if(!err1 && tokenData){
            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }

    });
};

module.exports = handler;