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

function saveFile(filename, body, callback) {
  mkdirp(path.dirname(filename),function(err){
    if (err) {
      return callback(err);
    }

    fs.write(filename, body, function(err){
      if (err) 
        return callback(err);
      callback(null, filename, true);
    });
  });  
}

function download(url,filename,callback) {
  request(url, function (err, response, body) {
    if (err)
      return callback(err);
    saveFile(filename, body, callback);
  });
}

function spider(url, callback) {
  var filename = utilities.urlToFileName(url);
  fs.exists(filename, function (exists) { 
    if(!exists) {
      console.log('Downloading' + url);
      download(url, filename, callback);
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
