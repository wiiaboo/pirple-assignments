/**
 * Main entry point to REST JSON API server
 */

const http = require('http'),
    https = require('https'),
    url = require('url'),
    fs = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder;

const config = require('./config'),
    routes = require('./routes'),
    sd = new StringDecoder('utf-8');

//  Initiate a server for each protocol and assign them the request handler
for (const [protoName, protocol] of Object.entries({http, https})) {
    const serverArgs = [];

    // special behavior for HTTPS
    //
    if (protoName === 'https') {
        try {
            serverArgs.push({
                'key': fs.readFileSync('./certs/key.pem'),
                'cert': fs.readFileSync('./certs/cert.pem')
            });
        } catch (err) {
            console.log('[WARN] Failed to open https certificate files. Skipping HTTPS server.');
            continue;
        }
    }

    serverArgs.push(requestHandler);

    const server = protocol.createServer(...serverArgs);

    server.listen(config.ports[protoName], () => {
        console.log(`⇒ Listening on port ${config.ports[protoName]} for ${protoName.toUpperCase()}`);
    });
}

function requestHandler(req, res) {
    // get request URL and query arguments
    const parsedUrl = url.parse(req.url, true);
    const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    let reqBody = '';
    req.on('data', buffer => reqBody += sd.write(buffer));

    req.on('end', () => {
        reqBody += sd.end();

        const data = {
            parsedUrl,
            method: req.method.toLowerCase(),
            headers: req.headers,
            payload: reqBody
        };

        console.log(`→ Received ${req.method.toUpperCase()} /${trimmedPath} payload:\n${reqBody}`);

        const sendResponse = (statusCode = 200, payload = {}) => {
            let payloadString;
            if (typeof payload === 'object') {
                res.setHeader('content-type', 'application/json;charset=utf-8');
                payloadString = JSON.stringify(payload, null, 4);
            } else if (typeof payload === 'string') {
                res.setHeader('content-type', 'text/plain;charset=utf-8');
                payloadString = payload;
            }

            res.writeHeader(typeof statusCode !== 'number' ? 200 : statusCode);

            res.end(payloadString);

            console.log(`→ Responded with ${statusCode} :\n${payloadString}`);
        };

        let method = req.method.toLowerCase();

        for (const [path, route] of Object.entries(routes)) {
            if (route.internal) continue;
            if (route.path instanceof RegExp && route.path.test(trimmedPath)) {
                let matches = route.path.exec(trimmedPath);
                if (matches && matches[1])
                    data.params = matches.slice(1);
            }
            let pathIsMatch = ((route.path instanceof RegExp &&
                    route.path.test(trimmedPath)) ||
                path === trimmedPath);
            if (pathIsMatch &&
                typeof route[method] === 'function') {
                return route[method](data, sendResponse);
            } else if (pathIsMatch &&
                typeof route['any'] === 'function') {
                return route['any'](data, sendResponse);
            }
        }
        return routes['404']['any'](data, sendResponse);
    });
}
