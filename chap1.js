var fs = require('fs');

var cache = {};

/*
 * This is a bad implementation because this function behave sometime synchroniously and sometimes asynchroniously
 */

function inconsistentRead(filename, callback) {
   
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
 * Unlike the function above,  this function sticks with a synchronous API. 
 * 
 */
function consistentRead(filename, callback) {
    if (cache[filename]) {
        callback(cache[filename]);
    }else {
        cache[filename] = fs.readFileSync(filename, 'utf8');
        callback(cache[filename]);
    }
}

/*
 * This function achieve asynchronous consistency by using process.nextTick() 
 * to invoke the callback a little later asynchroniously
 */

function consistentReadAsync(filename, callback) {
    if (cache[filename]) {
        process.nextTick(function() {
            callback(cache[filename]);
        });
    } else {
        fs.readFile(filename,'utf8', function (err, data) {
           cache[filename] = data;
           callback(cache[filename]);
        });
    }
}


/*
 * Reading the file using the defined api
 */

function createFileReader(filename) {
   var listeners = [];
   var fileData;

   consistentReadAsync(filename, function(data) {
        listeners.forEach(function (listener) {
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

