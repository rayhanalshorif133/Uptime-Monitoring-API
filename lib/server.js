/*
* Title: Server Library
* Description: Server related files
* Author: Rayhan Al Shorif
* Date: 30/04/2023
*/


// Dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environment');

// App object - module scaffolding
const server = {};




// Create server
server.createServer = () => {
    const createServer = http.createServer(server.handleReqRes);
    createServer.listen(environment.port, () => {
        console.log(`Listening to port ${environment.port} in ${environment.envName} mode`);
    });
};

// handle request response
server.handleReqRes = handleReqRes;

// start the server


server.init = () => {
    server.createServer();
}

module.exports = server;
