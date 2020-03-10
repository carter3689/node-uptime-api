/*
 *
 *Creating General Config file
 */

 //Containter for all of the environments
 let environments = {};

// Staging (default) environment

environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName':'staging'
}

//Production envirionment
environments.production = {
    'httpPort': 5000,
    'httpsPort':5001,
    'envName':'production'
}

// Determine which will be exported out as command-line arguments
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check current environments is one of the environments we've created/defined

let envToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export the module

module.exports = envToExport;