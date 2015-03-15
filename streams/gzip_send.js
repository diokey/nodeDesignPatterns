var fs = require('fs');
var http = require('http');
var zlib = require('zlib');
var path = require('path');

var filename = process.argv[2];
var server = process.argv[3];

//read a filename, compress it and send it to the server

var serverOptions = {
  host : server,
  port : 3000,
  path : '/',
  method : 'PUT',
  headers : {
    filename : path.basename(filename),
    'Content-Type' : 'application/octet-stream',
    'Contnet-Encoding' : 'gzip'
  }
};

var request = http.request(serverOptions, function(res){
  console.log('Response from the server : '+res.statusCode);
});

fs.createReadStream(filename)
.pipe(zlib.createGzip())
.pipe(request)
.on('finish', function () {
  console.log('File finished uploading');
});
