/*
* Title: Not Found Handler
* Description: Not Found Handler 
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/

// Dependencies


// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties,callback) => {
    console.log('Not Found');    
    callback(404, {
        message: 'Your requested URL was not found!',
    });
};

module.exports = handler;