var http = require('http');

http.createServer(function (req, res) {
    if (req.url === "/redirect")
        res.writeHead(302, { 'location': '/asdasdadadsdasdas' })
    else
        res.write('Hello World!');
    res.end();
}).listen(8080);