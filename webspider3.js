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
    nesting = nesting || 5;
    var $ = cheerio.load(body);
    var links = []; 
    $('a').each(function(index, element) {
       if (links.length <= nesting) {
         var currentUrl = $(element).attr('href');
         //use only url starting with https or www && check if it's not the same url
         if (currentUrl && url != currentUrl && (currentUrl.indexOf("https") === 0 || currentUrl.indexOf("www") === 0 )) {
            links.push(currentUrl);
          }
       }
    }); 
    return links;
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
    if (err) {
      return callback(err);
    }
    saveFile(filename, body, callback);
  });
}

function spiderLinks(currentUrl, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback);
  }

  var links = utilities.getPageLinks(currentUrl, body);
  if (links.length === 0) {
    return process.nextTick(callback);
  }
  var completed = 0, errored = false;

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
      return callback(null, null, true);
    }
  }

  /*
   * We iteratate trough all links and start running them immediately
   * The done callback is responsible for checking wether all tasks
   * have completed successfully
   */
  links.forEach(function(link){
    spider(link,nesting -1, done);
  });

}

var spiderLinksDownloaded = {};

function spider(url, nesting, callback) {
  /*
   * Fix race condition that may happen if 2 proccess access the same url
   */
  if(spiderLinksDownloaded [url]) {
    return callback(null, null, true);
  }
  //set this url to true to mean that it has already been treated
  spiderLinksDownloaded[url] = true;
  var filename = utilities.urlToFilename(url);
  fs.readFile(filename, 'utf8', function(err, body) {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err);
      }
      //if we can't read the file, download it first
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


spider(process.argv[2], 3, function(error, filename, downloaded) {
  if ( error ) {
    console.log('an error occured : ');
    console.log(error);
  } else {
    if (downloaded) {
      console.log('All files have Completed downloading');
    }   
  }
});
