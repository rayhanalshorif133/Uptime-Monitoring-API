/*
* Title: Validation Handler
* Description: Server Side Validation Handler
* Author: Rayhan Al Shorif
* Email: rayhanalshorif@gmail.com
* Date: 27/04/2021
*/

// Dependencies

// Validation object - module scaffolding
const validation = {};

// Configuration


validation.text = (text, text_length = 0) => {
    let returnText = typeof (text) === 'string' && text.trim().length >= text_length ? text : false;
    return returnText;
};

validation.number = (num, num_length = 11) => {
    let number = typeof (num) === 'string' && num.trim().length === num_length ? num : false;
    return number;
};

validation.boolean = (bool) => {
    let boolean = typeof (bool) === 'boolean' ? bool : false;
    return boolean;
};

validation.protocol = (protocol) => {
    let returnProtocol = typeof (protocol) === 'string' && ['http', 'https'].indexOf(protocol) > -1 ? protocol : false;
    return returnProtocol;
};

validation.method = (method) => {
    method = typeof (method) === 'string' ? method.toUpperCase() : false;
    let returnMethod = typeof (method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) > -1 ? method : false;
    return returnMethod;
};

validation.successCode = (successCode) => {
    let returnSuccessCode = typeof (successCode) === 'object' && successCode instanceof Array && successCode.length > 0 ? successCode : false;
    return returnSuccessCode;
};

validation.timeOutSecond = (timeOutSecond) => {
    let returnTimeOutSecond = typeof (timeOutSecond) === 'number' && timeOutSecond % 1 === 0 && timeOutSecond >= 1 && timeOutSecond <= 5 ? timeOutSecond : false;
    return returnTimeOutSecond;
};

module.exports = validation;