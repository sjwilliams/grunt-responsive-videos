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
          'tmp/default_options/big_buck_bunny.mov': 'test/assets/big_buck_bunny.mov',
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
          src: ['**.{mp4,mov}'],
          cwd: 'test/assets/',
          dest: 'tmp/custom_options/'
        }],
      },
      filter_options: {
        options: {
          sizes:[{
            width: 640,
            name: 'filtered',
            filter: 'scale=640:trunc(ow/a/2)*2,crop=360:360:140:0',
            poster: true
          }],
          encodes:[{
            mp4: [
              {'-vcodec':'libx264'},
              {'-acodec': 'libfaac'},
              {'-pix_fmt': 'yuv420p'},
              {'-q:v': '4'},
              {'-q:a': '100'},
              {'-threads': '0'}
            ]
          }]
        },
        files: [{
          expand: true,
          src: ['cappadocia.mp4'],
          cwd: 'test/assets/',
          dest: 'tmp/filter_options/'
        }],
      },
      poster_options: {
        options: {
          sizes: [{
            width: 200,
            name: 'poster_boolean',
            poster: true
          },{
            width: 200,
            name: 'poster_object_fastseek',
            poster: {
              fastseek: '1'
            }
          },{
            width: 200,
            name: 'poster_string_fastseek',
            poster: {
              fastseek: '1'
            }
          },{
            width: 200,
            name: 'poster_object_accurateseek',
            poster: {
              accurateseek: '1'
            }
          },{
            width: 200,
            name: 'poster_object_accurateseek_altstring',
            poster: {
              accurateseek: '00:00:01'
            }
          }
          ],
          encodes:[{
            mp4: [
              {'-vcodec':'libx264'},
              {'-acodec': 'libfaac'},
              {'-pix_fmt': 'yuv420p'},
              {'-q:v': '4'},
              {'-q:a': '100'},
              {'-threads': '0'}
            ]
          }]
        },
        files: [{
          expand: true,
          src: ['cappadocia.mp4'],
          cwd: 'test/assets/',
          dest: 'tmp/poster_options/'
        }],
      }
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

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);
};
