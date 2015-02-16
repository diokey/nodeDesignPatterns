var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var path = require('path');

var utilities = {
  urlToFileName : function (url) {
    var re = /^(https:\/\/)?(www)?\.?(.*?)\.(?:com|au\.uk|co\.in*)(.*)$/; 
    var m;
    
    m = re.exec(url);
    return m.splice(3).join('');
  }
};

function spider(url, callback) {
  var filename = utilities.urlToFileName(url);
  fs.exists(filename, function (exists) { 
    if(!exists) {
      console.log('Downloading' + url);
      request(url, function (err, response, body) {
        if(err) {
          callback(err);
        } else {
          mkdirp(path.dirname(filename), function (err) {
            if(err) {
              callback(err);
            } else {
              fs.writeFile(filename, body, function (err) {
                if(err) {
                  callback (err);
                } else {
                  callback(null, filename, true);
                }
              });
            }
          });
        }
      });
    } else {
      callback(null, filename, false);
    }
  });
}

spider(process.argv[2], function(error, filename, downloaded) {
  if( error ) {
    console.log('an error occured : ');
    console.log(error);
  } else {
    if (downloaded) {
      console.log('Complete downloading file '+ filename);
    } else {
      console.log('File '+filename+' was already downloaded');
    }
  }
});
