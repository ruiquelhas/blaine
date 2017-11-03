'use strict';

const Fs = require('fs');
const Os = require('os');
const Path = require('path');

const Code = require('code');
const Content = require('content');
const Form = require('multi-part');
const Hapi = require('hapi');
const Lab = require('lab');

const Blaine = require('../lib/');

const lab = exports.lab = Lab.script();

lab.experiment('blaine', () => {

    let server;
    let png;

    lab.before(async () => {

        server = new Hapi.Server();

        const plugin = {
            plugin: Blaine,
            options: {
                whitelist: ['image/png']
            }
        };

        const main = {
            options: {
                handler: (request) => request.payload,
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
                handler: (request) => null,
                payload: {
                    output: 'stream',
                    parse: true
                }
            },
            method: '*',
            path: '/ignore'
        };

        await server.register(plugin);

        server.route([main, ignore]);
    });

    lab.beforeEach(() => {
        // Create fake png file
        png = Path.join(Os.tmpdir(), 'foo.png');

        return new Promise((resolve, reject) => {

            Fs.createWriteStream(png)
                .on('error', reject)
                .end(Buffer.from('89504e470d0a1a0a', 'hex'), resolve);
        });
    });

    lab.test('should return control to the server if the route parses or does not handle in-memory request payloads', async () => {

        const { headers, statusCode } = await server.inject({
            method: 'POST',
            url: '/ignore'
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.equal('success');
        Code.expect(headers['content-type']).to.not.exist();
    });

    lab.test('should return control to the server if the payload does not contain any file', async () => {

        const form = new Form();
        form.append('foo', 'bar');

        const { headers, statusCode } = await server.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/main'
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.equal('success');
        Code.expect(Content.type(headers['content-type']).mime).to.equal('application/octet-stream');
    });

    lab.test('should return error if the payload cannot be parsed', async () => {

        const form = new Form();
        form.append('file', Fs.createReadStream(png));

        const { headers, statusCode } = await server.inject({
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            payload: form.stream(),
            url: '/main'
        });

        Code.expect(statusCode).to.equal(415);
        Code.expect(headers['content-validation']).to.not.exist();
        Code.expect(Content.type(headers['content-type']).mime).to.equal('application/json');
    });

    lab.test('should return control to the server if all files the in payload are allowed', async () => {

        const form = new Form();
        form.append('file1', Fs.createReadStream(png));
        form.append('file2', Fs.createReadStream(png));
        form.append('foo', 'bar');

        const { headers, statusCode } = await server.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/main'
        });

        Code.expect(statusCode).to.equal(200);
        Code.expect(headers['content-validation']).to.equal('success');
        Code.expect(Content.type(headers['content-type']).mime).to.equal('application/octet-stream');
    });
});
