'use strict';

const Copperfield = require('copperfield');
const Recourier = require('recourier');
const Subtext = require('subtext');
const Wreck = require('wreck');

const internals = {};

internals.onPostAuth = function (options) {

    return function (request, reply) {

        if (!Buffer.isBuffer(request.payload)) {
            return reply.continue();
        }

        const readable = Wreck.toReadableStream(request.payload);
        readable.headers = request.headers;

        const config = {
            allow: 'multipart/form-data',
            output: 'data',
            parse: true
        };

        Subtext.parse(readable, null, config, (err, parsed) => {

            if (err) {
                return reply(err);
            }

            request.payload = parsed.payload;

            reply.continue();
        });
    };
};

exports.register = function (server, options, next) {

    const plugins = [{
        register: Copperfield,
        options
    }, {
        register: Recourier,
        options: {
            namespace: 'blaine',
            properties: ['payload']
        }
    }];

    server.register(plugins, (err) => {

        server.ext('onPostAuth', internals.onPostAuth(options));
        next(err);
    });
};

exports.register.attributes = {
    pkg: require('../package.json')
};
