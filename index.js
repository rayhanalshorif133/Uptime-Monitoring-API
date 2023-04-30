/*
* Title: Project Initial File
* Description: Initial file to start the node server and workers
* Author: Rayhan Al Shorif
* Date: 30/04/2023
*/


// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// App object - module scaffolding
const app = {};

// initialization

app.init = () => {
    // start the server
    server.init();

    // start the workers
    workers.init();
};

// execute
app.init();

module.exports = app;
