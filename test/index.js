'use strict';

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const plugin = require('../lib/');

lab.experiment('blaine', () => {

    let server;

    const setup = {
        register: plugin,
        options: {
            whitelist: ['png']
        }
    };

    lab.before((done) => {

        server = new Hapi.Server();
        server.connection();

        server.register(setup, (err) => {

            if (err) {
                return done(err);
            }

            done();
        });
    });

    lab.test('should be registered as server plugin', (done) => {

        Code.expect(server.registrations).to.include(['blaine']);
        Code.expect(server.registrations.blaine.options).to.deep.equal(setup.options);
        return done();
    });
});
