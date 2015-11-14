'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const Code = require('code');
const FormData = require('form-data');
const Hapi = require('hapi');
const Lab = require('lab');
const streamToPromise = require('stream-to-promise');

const lab = exports.lab = Lab.script();
const Blaine = require('../lib/');

lab.experiment('blaine', () => {

    let server;

    lab.before((done) => {

        server = new Hapi.Server();
        server.connection();

        const plugin = {
            register: Blaine,
            options: {
                whitelist: ['png']
            }
        };

        const main = {
            config: {
                handler: (request, reply) => reply(),
                payload: {
                    output: 'data',
                    parse: false
                }
            },
            method: '*',
            path: '/main'
        };

        const ignore = {
            config: {
                handler: (request, reply) => reply(),
                payload: {
                    output: 'stream',
                    parse: true
                }
            },
            method: '*',
            path: '/ignore'
        };

        server.register(plugin, (err) => {

            if (err) {
                return done(err);
            }

            server.route([main, ignore]);
            done();
        });
    });

    lab.test('should return control to the server if the route parses or does not handle in-memory request payload', (done) => {

        server.inject({ method: 'POST', url: '/ignore' }, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.headers['magic-pattern']).to.not.exist();
            done();
        });
    });

    lab.test('should return control to the server if the payload does not contain any file', (done) => {

        const form = new FormData();
        form.append('foo', 'bar');

        streamToPromise(form).then((payload) => {

            server.inject({ method: 'POST', payload: payload, url: '/main' }, (response) => {

                Code.expect(response.statusCode).to.equal(200);
                Code.expect(response.headers['magic-pattern']).to.not.exist();
                done();
            });
        });
    });

    lab.test('should return error if the payload cannot be parsed', (done) => {

        const png = path.join(os.tmpdir(), 'foo.png');
        fs.createWriteStream(png).end(new Buffer([0x89, 0x50]));

        const form = new FormData();
        form.append('file', fs.createReadStream(png));

        streamToPromise(form).then((payload) => {

            server.inject({ headers: { 'Content-Type': 'application/json' }, method: 'POST', payload: payload, url: '/main' }, (response) => {

                Code.expect(response.statusCode).to.equal(400);
                Code.expect(response.headers['magic-pattern']).to.not.exist();
                done();
            });
        });
    });
});
