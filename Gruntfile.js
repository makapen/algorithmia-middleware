'use strict';

var request = require('request'),
path = require('path');

function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35730, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'bin/www'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'bin/www',
          'app.js',
          'routes/*.js',
          'lib/**/*.js'
        ],
        tasks: ['develop']
      }
    },
    env : {
      dev : {
        src : getUserHome() + "/.algorithmia/dev.json"
      },
      // prod : {
      //   src : getUserHome() + "/.starter-kit/prod.json",
      //   host: 'localhost:4200'
      // }
    }
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  // grunt.registerTask('asProd', [
  // 'env:prod',
  // 'develop',
  // 'watch'
  // ]);

  grunt.registerTask('default', [
  'env:dev',
  'develop',
  'watch'
  ]);
};
