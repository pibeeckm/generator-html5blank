'use strict'

var Generator = require('yeoman-generator');
var request = require('request');
var fs = require('fs');
var unzip = require('unzip');
var glob = require('glob');
var async = require('async');
var mv = require('mv');
var rimraf = require('rimraf');
var replace = require('replace-in-file');
var prompt = require('prompt');



//https://codeload.github.com/toddmotto/html5blank/zip/stable

var tmpDir = './test';

var getDirectories = function(callback) {
  glob(tmpDir + '/**/*', callback);
};


module.exports = class extends Generator {
  prompting() {


    prompt.start();

    // 
    // Get two properties from the user: username and email 
    // 
    prompt.get(['templateName', 'author', 'safe'], function(err, result) {
      // 
      // Log the results. 
      // 
      console.log('Command-line input received:');
      console.log('  templateName: ' + result.templateName);
      console.log('  author: ' + result.author);



      var options = {
        files: './**.*',
        encoding: 'utf8',
        from: [/Todd Motto/g,/toddmotto/g,/Theme Name: HTML5 Blank/g, /html5blank/g],
        to: [result.author, result.author,"Theme Name: " + result.templateName, result.safe],
      }

      console.log('method 1 just ran');
      var test = unzip.Extract({
        path: tmpDir
      });
      test.on('close', function() {
        console.log('File written!');
        getDirectories(function(err, res) {
          if (err) {
            console.log('Error', err);
          } else {
            console.log(res);
            async.map(res, function(item, cb) {
              var dest = item.replace('./test/html5blank-stable', '.');
              if (dest != ".") {
                mv(item, dest, function(err) {
                  // done. it tried fs.rename first, and then falls back to
                  // piping the source file to the dest file and then unlinking
                  // the source file.
                  //if (err && err.code == 'ENOTEMPTY')
                  cb();
                  //else
                  //cb(err);
                });
              } else {
                cb();
              }

            }, function(err) {
              if (!err) {
                rimraf('./test', function() {
                  console.log('all done');
                  replace(options, (error, changedFiles) => {
                    if (error) {
                      return console.error('Error occurred:', error);
                    }
                    console.log('Modified files:', changedFiles.join(', '));
                    //done();

                  });

                });

              } else {
                console.log("something went wrong", err);
              }
            })
          }
        });
      });
      request('https://codeload.github.com/toddmotto/html5blank/zip/stable')
        .on('close', function() {
          console.log('req done!');
        })
        //.pipe(fs.createWriteStream('temp.zip'))
        .pipe(test);



    });



  };
};