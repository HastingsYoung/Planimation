'use strict';

var http = require("http");
var fs = require('fs');
var url = require('url');

var start = function start() {
    http.createServer(function (request, response) {
        var pathname = url.parse(request.url).pathname;
        var ext = pathname.match(/(\.[^.]+|)$/)[0]; //get affix
        switch (ext) {
            case ".css":
            case ".js":
                fs.readFile("." + request.url, 'utf-8', function (err, data) {
                    if (err) throw err;
                    response.writeHead(200, {
                        "Content-Type": {
                            ".css": "text/css",
                            ".js": "application/javascript"
                        }[ext]
                    });
                    response.write(data);
                    response.end();
                });
                break;
            case "":
                fs.readFile("./index.html", function (err, data) {
                    if (err) throw err;
                    response.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    response.write(data);
                    response.end();
                });
                break;
            default:
                fs.readFile("." + request.url, function (err, data) {
                    if (err) throw err;
                    response.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    response.write(data);
                    response.end();
                });
        }
    }).listen(8888);
    console.log("server start...");
};

start();

//# sourceMappingURL=main-compiled.js.map