
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
