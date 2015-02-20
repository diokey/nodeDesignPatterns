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
  },
  getPageLinks : function (url, body) {
  }
};

function saveFile(filename, body, callback) {
  mkdirp(path.dirname(filename),function(err){
    if (err) {
      return callback(err);
    }

    fs.writeFile(filename, body, 'utf8', function(err){
      if (err) {
        return callback(err);
      }
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

function spiderLinks(currentUrl, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback);
  }

  var links = utilities.getPageLinks(currentUrl, body);

  function iterate(index) {
    if (index === links.length) {
      return callback();
    }

    spider(links[index], nesting -1, function(err) {
      if (err) {
        return callback(err);
      }
      iterate (index + 1);
    });
  }

  iterate(0);
}

function spider(url, nesting, callback) {
  var filename = utilities.urlToFilename(url);
  fs.readFile(filename, 'utf8', function(err, body) {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err);
      }

      return download(url, filename, function (err, body) {
        if (err) {
          return callback(err);
        }
        spiderLinks(url, body, nesting, callback);
      });
    }
    spiderLinks(url, body, nesting, callback);
  });
}
