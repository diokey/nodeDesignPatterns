var fs = require('fs');

var cache = {};

/*
 * This is a bad implementation because this function behave sometime synchroniously and sometimes asynchroniously
 */

function inconsistendRead(filename, callback) {
   
    if ( cache [ filename ]) {
        callback(cache[filename]);
    }else {
       fs.readFile(filename, 'UTF-8', function (err, data) {
         //cache the file for future use 
         if (!err) {
            cache[filename] = data;
            callback(data);
         }
       });
    }
}

/*
 * Unleashing Zalgo. Now let's try to use this function as see what happens
 */

function createFileReader(filename) {
   var listeners = [];

   inconsistendRead(filename, function(data) {
        listeners.forEach(function(listener) {
            listener(data);
        });
   });

   return {
        onDataReady : function (listener) {
           listeners.push(listener);
        }
   };
}

var reader1 = createFileReader('data.txt');

reader1.onDataReady(function(data) {
    console.log('The first call ' + data);

    var reader2 = createFileReader('data.txt');

    reader2.onDataReady(function(data) {
        console.log('The second call '+ data);
    });
});

