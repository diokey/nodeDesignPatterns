var http = require('http');
var zlib = require('zlib');
var fs = require('fs');

var server = http.createServer(function(req, res) {
  
  var filename = req.headers.filename;
  console.log('filename received' +filename);

  req.pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream(filename))
    .on('finish', function() {
      res.writeHead(201, {'Content-Type':'text/plain'});
      res.end('That\'s it \n');
      console.log('File saved '+filename);
    });


});


server.listen(3000, function(){
  console.log('Server started. Listening on port 3000');
});
