/*
* Title: Sample Handler
* Description: Sample Handler
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/

// Dependencies


// module scaffolding

const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        message: 'This is a sample url',
    });
};

module.exports = handler;