var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var path = require('path');
var cheerio = require('cheerio');

var utilities = {
  urlToFileName : function (url) {
    var re = /^(https:\/\/)?(www)?\.?(.*?)\.(?:com|au\.uk|co\.in*)(.*)$/; 
    var m;
    
    m = re.exec(url);
    return m.splice(3).join('') + '.html';
  },
  getPageLinks : function (url, body, nesting) {
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
      callback(null, body, true);
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
  var links = utilities.getPageLinks(currentUrl, body, nesting);

  function iterate(index) {
    if (index === links.length) {
      return callback(null, true);
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
  var filename = utilities.urlToFileName(url);
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
