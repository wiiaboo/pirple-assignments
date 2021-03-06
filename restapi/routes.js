/**
 * Routes handling object
 *
 * Each route should contain a key corresponding to an HTTP Method,
 * or 'any' if it should respond to any method.
 */
const routes = {};
routes['welcome'] = {
    path: /^(?:|welcome(?:\/([^\/]+))?)$/,
    any: (data, sendResponse) => {
        const recipient = typeof data['params'] !== 'undefined'
            ? `, ${data['params'][0]}` : '';
        sendResponse(200, {'message': `Welcome to my REST API${recipient}!`});
    }
};
routes['echo'] = {
    any: (data, sendResponse) => {
        sendResponse(200, data);
    }
};
routes['ping'] = {
    any: (data, sendResponse) => {
        sendResponse(200, {'message': 'pong'});
    }
};
routes['hello'] = {
    get: (data, sendResponse) => {
        const hello_message = 'こんにちは';
        sendResponse(200, {'message': hello_message});
    }
};
routes['404'] = {
    internal: true,
    any: (data, sendResponse) => {
        sendResponse(404, {'error': `Path ${data.parsedUrl.pathname} not found.`});
    }
};

module.exports = routes;
