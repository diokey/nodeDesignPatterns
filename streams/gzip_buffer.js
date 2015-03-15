var fs = require('fs');
var zlib = require('zlib');

var file = process.argv[2];

console.log('gzipping '+file);

fs.readFile(file, function(err, buffer) {
  if(err) {
    console.log('Can not read file'+file);
    return;
  }
  zlib.gzip(buffer, function(err, buffer) {
    if(err) {
      console.log('Can not gzip the file'+file);
      return;
    }
    fs.writeFile(file+'.gz',buffer, function(err) {
      if (err) {
        console.log('An error occured while saving the file');
        return;
      } else {
        console.log('File '+file+' gzipped successfully');
      }
    });
  });
});
