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
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'sdckjsdcnsdkcjnjn',
    maxChecks: 5,
};

// determine which environment was passed
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;