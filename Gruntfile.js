/*
 * grunt-responsive-videos
 * https://github.com/sjwilliams/grunt-responsive-videos
 *
 * Copyright (c) 2013 Josh Williams
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    responsive_videos: {
      default_options: {
        options: {
        },
        files: {
          'tmp/default_options/big_buck_bunny.mov': 'test/assets/default_options/big_buck_bunny.mov',
        },
      },
      custom_options: {
        options: {
          sizes: [{
            width: 240,
            poster: true
          }],
          encodes:[{
            webm: [
              {'-vcodec': 'libvpx'},
              {'-acodec': 'libvorbis'},
              {'-crf': '15'},
              {'-q:a': '80'}
            ]
          }]
        },
        files: [{
          expand: true,
          src: ['custom_options/**.{mp4,mov}'],
          cwd: 'test/assets/',
          dest: 'tmp/'
        }],
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'responsive_videos', 'nodeunit']);
  // grunt.registerTask('test', ['nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
