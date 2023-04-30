/*
* Title: Environment Variables
* Description: Handle all environment variables
* Author: Rayhan Al Shorif
* Date: 26/04/2023
*/

// dependencies


// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'skdjfhsdkjfhskdjfh',
    maxChecks: 5,
    twilio:{
        fromPhone: '+16206590651',
        accountSid: 'AC5155523674c951446f99d2375d28ba8d',
        authToken:"511e44e4fa57bfa386f05f6246460214"
    }
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'sdckjsdcnsdkcjnjn',
    maxChecks: 5,
    twilio: {
        fromPhone: '+16206590651',
        accountSid: 'AC5155523674c951446f99d2375d28ba8d',
        authToken: "511e44e4fa57bfa386f05f6246460214"
    }
};

// determine which environment was passed
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;