'use strict';

var request = require('request');
var pkg = require('./package.json');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35731, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'app.js'
      }
    },
    sass: {
      dist: {
        files: {
          'public/css/style.css': 'public/css/style.scss'
        }
      }
    },
    uglify: {
      options: {
        beautify: true,
        compress: {
          drop_console: false
        }
      },
      dist: {
        files: {
          'public/js/app.min.js': [
            'public/app/app.js',
            'public/app/config/*',
            'public/app/controller/*',
            'public/app/service/*',
            'public/app/directive/*',
            'public/app/filter/*'
          ],
          'public/js/lib.min.js': [
            'public/components/angular/angular.min.js',
            'public/components/angular-animate/angular-animate.min.js',
            'public/components/angular-sanitize/angular-sanitize.min.js',
            'public/components/angular-ui-router/release/angular-ui-router.min.js',
            'public/components/cookies-js/dist/cookies.min.js',
            'public/components/underscore/underscore-min.js',
            'public/components/moment/min/moment.min.js',
            'public/components/moment/locale/tr.js',
            'public/components/angularytics/dist/angularytics.min.js'
          ]
        }
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      uglify: {
        files: ['public/app/**', 'public/components/**'],
        tasks: ['uglify:dist'],
        options: { livereload: reloadPort }
      },
      js: {
        files: [
          'app.js',
          'app/**/*.js',
          'config/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      css: {
        files: [
          'public/css/**',
          'public/css/*.scss'
        ],
        tasks: ['sass'],
        options: {
          livereload: reloadPort
        }
      },
      views: {
        files: [
          'app/views/*.ejs',
          'app/views/**/*.ejs',
          'public/templates/**/*'
        ],
        options: { livereload: reloadPort }
      }
    },
    shipit: {
      options: {
        workspace: '/tmp/geyik-workspace',
        deployTo: '/projects/geyik',
        repositoryUrl: pkg.repository.url,
        ignores: ['.git', 'node_modules', 'u'],
        keepReleases: 3
      },
      test: {
        key: '/Users/alican/geyik-key-pair.pem',
        servers: ['52.28.56.231']
      },
      production: {
        key: '/Users/alican/geyik-key-pair.pem',
        servers: ['54.93.102.109']
      },
      self: {
        servers: ['deploy@127.0.0.1:27022']
      }
          'app/views/*.handlebars',
          'app/views/**/*.handlebars'
        ],
        options: { livereload: reloadPort }
      }
    }
  });

  grunt.config.requires('watch.js.files');
  files = grunt.config('watch.js.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function(err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded)
            grunt.log.ok('Delayed live reload successful.');
          else
            grunt.log.error('Unable to make a delayed live reload.');
          done(reloaded);
        });
    }, 500);
  });

  grunt.registerTask('default', [
    'sass',
    'develop',
    'uglify',
    'watch'
  ]);
};
