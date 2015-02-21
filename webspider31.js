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
  var concurrency = 2, //we limit concurrency to 2
  running = 0, completed = 0, index = 0;

  function next() {
    while (running < concurrency && index < links.length) {
      spider(links[index++], nesting-1, done);
      running++;
    }
  }

  next();

  /*
   * The done callback check wether the queued tasks have completed and
   * call the final callback if that's the case
   */
  function done(err) {
    if (err) {
      errored = true;
      return callback(err);
    }
    if (++completed === links.length && !errored) {
      return callback();
    }
  }
}

var spiderLinksDownloaded = {};

function spider(url, nesting, callback) {
  /*
   * Fix race condition that may happen if 2 proccess access the same url
   */
  if(spiderLinksDownloaded [url]) {
    return callback(err);
  }
  //set this url to true to mean that it has already been treated
  spiderLinksDownloaded[url] = true;
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
