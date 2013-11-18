'use strict';

var grunt = require('grunt'),
  crypto = require('crypto');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.responsive_videos = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  // compare hashes of expected and actual encodes
  default_options: function(test) {
    var actual,
      expected;

    var files = [{
        filename: 'big_buck_bunny-small.jpg',
        expected: 'test/expected/default_options/',
        actual: 'tmp/default_options/'
      }, {
        filename: 'big_buck_bunny-small.mp4',
        expected: 'test/expected/default_options/',
        actual: 'tmp/default_options/'
      },
      // {
      //   filename: 'big_buck_bunny-small.webm',
      //   expected: 'test/expected/default_options/',
      //   actual: 'tmp/default_options/'
      // }, 
      {
        filename: 'big_buck_bunny-large.jpg',
        expected: 'test/expected/default_options/',
        actual: 'tmp/default_options/'
      }, {
        filename: 'big_buck_bunny-large.mp4',
        expected: 'test/expected/default_options/',
        actual: 'tmp/default_options/'
      }
      // {
      //   filename: 'big_buck_bunny-large.webm',
      //   expected: 'test/expected/default_options/',
      //   actual: 'tmp/default_options/'
      // }
    ];

    test.expect(files.length);

    for (var i = 0, l = files.length; i < l; i++) {
      actual = crypto.createHash('md5').update(grunt.file.read(files[i].actual + files[i].filename)).digest("hex");
      expected = crypto.createHash('md5').update(grunt.file.read(files[i].expected + files[i].filename)).digest("hex");
      test.equal(actual, expected, 'should be the same video for ' + files[i].filename);
    }

    test.done();
  },

  // compare hashes of expected and actual encodes
  custom_options: function(test) {
    var actual,
      expected;

    var files = [{
        filename: 'big_buck_bunny-240.jpg',
        expected: 'test/expected/custom_options/',
        actual: 'tmp/custom_options/'
      },
      // {
      //   filename: 'big_buck_bunny-240.webm',
      //   expected: 'test/expected/custom_options/',
      //   actual: 'tmp/custom_options/'
      // }, 
      {
        filename: 'cappadocia-240.jpg',
        expected: 'test/expected/custom_options/',
        actual: 'tmp/custom_options/'
      }
      // {
      //   filename: 'cappadocia-240.webm',
      //   expected: 'test/expected/custom_options/',
      //   actual: 'tmp/custom_options/'
      // }
    ];

    test.expect(files.length);

    for (var i = 0, l = files.length; i < l; i++) {
      actual = crypto.createHash('md5').update(grunt.file.read(files[i].actual + files[i].filename)).digest("hex");
      expected = crypto.createHash('md5').update(grunt.file.read(files[i].expected + files[i].filename)).digest("hex");
      test.equal(actual, expected, 'should be the same video for ' + files[i].filename);
    }

    test.done();
  },
};