
import {
    createSecureServer,
    Http2SecureServer,
    IncomingHttpHeaders,
    ServerHttp2Stream, ServerStreamFileResponseOptionsWithError
} from 'http2';
import {resolve} from "path";
import {existsSync, readFileSync} from "fs";
import bind from "../common/decorators/bind";
import {lookup} from 'mime-types';

export interface WebServerOptions
{
    port: number;
    keyPath: string;
    certPath: string;
    allowHttp1: boolean;
    frontendRoot: string;
}

export default class WebServer
{
    options: WebServerOptions;
    http2Server: Http2SecureServer;

    constructor(options: Partial<WebServerOptions> = {})
    {
        this.options = Object.assign({
            port: 1337,
            keyPath: resolve(__dirname, '..', '..', 'certs', 'key.pem'),
            certPath: resolve(__dirname, '..', '..', 'certs', 'server.crt'),
            allowHttp1: true,
            frontendRoot: resolve(__dirname, '..', '..', 'dist', 'frontend')
        }, options);
        this.http2Server = createSecureServer({
            key: readFileSync(this.options.keyPath),
            cert: readFileSync(this.options.certPath),
            allowHTTP1: this.options.allowHttp1
        });
        this.http2Server.on('stream', this.onStream);
    }

    listen(): Promise<void>
    {
        return new Promise(fulfill => this.http2Server.listen(this.options.port, fulfill));
    }

    private respondError(stream: ServerHttp2Stream, errorCode: number): void
    {
        stream.respond({':status': errorCode});
        stream.end();
    }

    private createErrorHandler(stream: ServerHttp2Stream, errorCode: number): ServerStreamFileResponseOptionsWithError
    {
        return {
            onError: (err) =>
            {
                console.log(`--> Error ${errorCode}`);
                console.error(err);
                this.respondError(stream, errorCode);
            }
        };
    }

    private pushFile(stream: ServerHttp2Stream, path: string): void
    {
        const fullPath = resolve(this.options.frontendRoot, `.${path}`);
        console.log(`--> Pushing ${path} -> ${fullPath}`);
        stream.pushStream({':path': path}, (err, pushStream) =>
        {
            if (!existsSync(fullPath)) {
                this.respondError(pushStream, 404);
                return;
            }
            const mimeType = lookup(fullPath);
            if (mimeType === false) {
                this.respondError(pushStream, 404);
                return;
            }
            pushStream.respondWithFile(fullPath, {'content-type': mimeType}, this.createErrorHandler(pushStream, 500));
        });
    }

    @bind private async onStream(stream: ServerHttp2Stream, headers: IncomingHttpHeaders): Promise<void>
    {
        let path = headers[':path'];
        const method = headers[':method'];

        console.log(`onStream: ${method} ${path}`);

        if (method !== 'GET') {
            this.respondError(stream, 404);
            return;
        }

        if (path === '/') {
            path = '/index.html';
        }

        const fullPath = resolve(this.options.frontendRoot, `.${path}`);
        console.log(`-> Serving ${path} -> ${fullPath}`);
        if (!fullPath.startsWith(this.options.frontendRoot)
            || !(fullPath.endsWith('.html') || fullPath.endsWith('.js'))
            || !existsSync(fullPath)) {
            this.respondError(stream, 404);
            return;
        }

        const mimeType = lookup(fullPath);
        if (mimeType === false) {
            this.respondError(stream, 404);
            return;
        }
        stream.respondWithFile(fullPath, {'content-type': mimeType}, this.createErrorHandler(stream, 500));

        if (path === '/index.html') {
            this.pushFile(stream, '/index.css');
            this.pushFile(stream, '/index.js');
        }
    }
}