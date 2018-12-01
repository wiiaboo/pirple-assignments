/**
 * Configuration for the REST JSON API Server
 *
 * Assume the end user will change it to their needs,
 * so avoid doing too many changes after adding it.
 */

const configs = {
    staging: {
        ports: {
            http: 3000,
            https: 3001
        },
        name: 'Staging'
    },
    production: {
        ports: {
            http: 5000,
            https: 5001
        },
        name: 'Production'
    }
};

 module.exports = (typeof configs[process.env.NODE_ENV] === 'object') ?
    configs[process.env.NODE_ENV] : configs.staging;
