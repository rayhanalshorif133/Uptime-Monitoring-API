/*
* Title: Handle Request Response
* Description: Handle Request Response
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/

// Dependencies
const { StringDecoder } = require('string_decoder');
const url = require('url');
const routes = require('./../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('../lib/utilities');


// Module scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
    // request handling
    // get the url and parse it
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = "";

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;



    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        requestProperties.body = realData.length > 0 ? parseJSON(realData) : {};

        chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            // return the final response
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
};

module.exports = handler;