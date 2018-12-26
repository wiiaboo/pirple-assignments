/**
 * Main entry point to REST JSON API server
 */

import http from 'http';
import https from 'https';
import { parse } from 'url';
import { readFileSync } from 'fs';
import { StringDecoder } from 'string_decoder';

import { ports } from './config';
import routes from './routes';
const sd = new StringDecoder('utf-8');

//  Initiate a server for each protocol and assign them the request handler
for (const [protoName, protocol] of Object.entries({http, https})) {
    const serverArgs = [];

    // special behavior for HTTPS
    // if cert reading fails, HTTPS server is not used
    if (protoName === 'https') {
        try {
            serverArgs.push({
                'key': readFileSync('./certs/key.pem'),
                'cert': readFileSync('./certs/cert.pem')
            });
        } catch (err) {
            console.log('[WARN] Failed to open https certificate files. Skipping HTTPS server.');
            continue;
        }
    }

    serverArgs.push(requestHandler);

    const server = protocol.createServer(...serverArgs);

    server.listen(ports[protoName], () => {
        console.log(`⇒ Listening on port ${ports[protoName]} for ${protoName.toUpperCase()}`);
    });
}

/**
 * Request Handler for each incoming request from http/https servers
 *
 * @param {Object} req - http/https Request object
 * @param {Object} res - http/https Response object
 */
function requestHandler(req, res) {
    // get request URL and query arguments
    const parsedUrl = parse(req.url, true);
    const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    // read the request body
    let reqBody = '';
    req.on('data', buffer => reqBody += sd.write(buffer));

    req.on('end', () => {
        reqBody += sd.end();

        // object to be passed to the route handlers
        const data = {
            parsedUrl,
            method: req.method.toLowerCase(),
            headers: req.headers,
            payload: reqBody
        };

        console.log(`→ Received ${req.method.toUpperCase()} /${trimmedPath} payload:\n${reqBody}`);

        // function to be called by each route handler to prepare the response
        const sendResponse = (statusCode = 200, payload = {}) => {
            let payloadString;
            if (typeof payload === 'object') {
                res.setHeader('Content-Type', 'application/json;charset=utf-8');
                payloadString = JSON.stringify(payload, null, 4);
            } else if (typeof payload === 'string') {
                res.setHeader('Content-Type', 'text/plain;charset=utf-8');
                payloadString = payload;
            }

            res.writeHeader(typeof statusCode !== 'number' ? 200 : statusCode);

            res.end(payloadString);

            console.log(`→ Responded with ${statusCode} :\n${payloadString}`);
        };

        let method = req.method.toLowerCase();

        for (const [path, route] of Object.entries(routes)) {
            if (route.internal) continue;

            // schmancy way of using regex to handle the routes instead of just text matching
            if (route.path instanceof RegExp && route.path.test(trimmedPath)) {
                let matches = route.path.exec(trimmedPath);
                if (matches && matches[1])
                    data.params = matches.slice(1);
            }
            let pathIsMatch = ((route.path instanceof RegExp &&
                    route.path.test(trimmedPath)) ||
                path === trimmedPath);

            // if path is a match to both path and method used
            if (pathIsMatch &&
                typeof route[method] === 'function') {
                return route[method](data, sendResponse);
            // if only path is a match and the route handler has an 'any' fallback
            } else if (pathIsMatch &&
                typeof route['any'] === 'function') {
                return route['any'](data, sendResponse);
            }
        }

        // if no route has been found
        return routes['404']['any'](data, sendResponse);
    });
}
