const http = require('http');

const port = 80;
let id = 0;

const server = http.createServer((req, res) => {
    if (req.url === '/redirect') {
        id += 1;
        res.writeHead(302, {
            'Location': `http://localhost/ITS.Usolia.Process.Web_TRAINING/application/P5AdIKanri${id}/P5AdIKanri.application?RootEndPoint=https://test.test/ITS.Usolia.Process.Web_TRAINING/&ProgramCode=121002&StartUpKey=4bb41a77-afad-41ae-bf93-ebc40d4c354a&Timeout=6000000&Expect100Continue=False`,
            'Cache-Control': 'no-store'
        });
        res.end();
    }
    else if (req.url === `/ITS.Usolia.Process.Web_TRAINING/application/P5AdIKanri${id}/P5AdIKanri.application`) {
        res.writeHead(200);
        res.end('program');
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<a href="/redirect">/redirect</a>');
    }
});

server.listen(port, () => {
    console.log(`localhost:${port}`);
});
