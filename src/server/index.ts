
import WebServer from './WebServer';

async function main(argv: string[])
{
    let webServer = new WebServer();
    console.log('Starting webserver...');
    await webServer.listen();
}

main(process.argv).then(() => console.log('Application started'));
