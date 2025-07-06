const http = require('http');

const port = 80;
let id = 0;

const server = http.createServer((req, res) => {
    if (req.url === '/redirect') {
        id += 1;
        res.writeHead(302, {
            'Location': `http://localhost/program${id}`,
            'Cache-Control': 'no-store'
        });
        res.end();
    }
    else if (req.url === `/program${id}`) {
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
