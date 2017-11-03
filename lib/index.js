'use strict';

const Copperfield = require('copperfield');
const Recourier = require('recourier');
const Subtext = require('subtext');
const Wreck = require('wreck');

const internals = {};

internals.onPostAuth = function (options) {

    return async function (request, h) {

        if (!Buffer.isBuffer(request.payload)) {
            return h.continue;
        }

        const readable = Wreck.toReadableStream(request.payload);
        readable.headers = request.headers;

        const { payload } = await Subtext.parse(readable, null, {
            allow: 'multipart/form-data',
            output: 'data',
            parse: true
        });

        request.payload = payload;

        return h.continue;
    };
};

internals.register = async function (server, options) {

    const plugins = [{
        plugin: Copperfield,
        options
    }, {
        plugin: Recourier,
        options: {
            namespace: 'blaine',
            properties: ['payload']
        }
    }];

    await server.register(plugins);

    server.ext('onPostAuth', internals.onPostAuth(options));
};

module.exports = {
    pkg: require('../package.json'),
    register: internals.register
};
