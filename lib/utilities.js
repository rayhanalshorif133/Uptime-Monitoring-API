/*
* Title: Handle Utilities for Nodejs
* Description: Important utilities for Nodejs
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/



// Dependencies
const crypto = require('crypto');
const environments = require('../helpers/environment');



// module scaffolding
const utilities = {};

// parse JSON string to object

utilities.parseJSON = (jsonString) => {
    let output;

    if(typeof jsonString === 'string'){
        output = JSON.parse(jsonString);
    }else{
        output = {};
    }
    return output;
};

// hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac("sha256", environments.secretKey)
            .update(str)
            .digest("hex");
        return hash;
    }
    else {
        return false;
    }
};

// create random string
utilities.createRandomString = (strLength) => {
    let length = strLength;
    length = typeof strLength === 'number' && strLength > 0 ? strLength : false;
    if (length) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let output = '';
        for (let i = 1; i <= length; i++) {
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacter;
        }
        return output;
    }
    else {
        return false;
    }
};



module.exports = utilities;