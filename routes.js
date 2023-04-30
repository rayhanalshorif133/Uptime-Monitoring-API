/*
* Title: Routes
* Description: Application Routes
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/


// Dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');

// module scaffolding

const routes = {
   sample: sampleHandler,
   user: userHandler,
   token: tokenHandler,
   check: checkHandler
};

module.exports = routes;