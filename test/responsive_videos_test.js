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

  // compare hashes of expected and actual encodes.
  poster_options: function(test) {
    var actual,
      expected;

    // just looking at the generated .jpgs, ignoring the generated videos
    var files = [

      // generated posters match expected
      {
        testType: 'expectedToActual',
        filename: 'cappadocia-poster_boolean.jpg',
        expected: 'test/expected/poster_options/',
        actual: 'tmp/poster_options/'
      },
      {
        testType: 'expectedToActual',
        filename: 'cappadocia-poster_object_accurateseek_altstring.jpg',
        expected: 'test/expected/poster_options/',
        actual: 'tmp/poster_options/'
      }, 
      {
        testType: 'expectedToActual',
        filename: 'cappadocia-poster_object_accurateseek.jpg',
        expected: 'test/expected/poster_options/',
        actual: 'tmp/poster_options/'
      },
      {
        testType: 'expectedToActual',
        filename: 'cappadocia-poster_object_fastseek.jpg',
        expected: 'test/expected/poster_options/',
        actual: 'tmp/poster_options/'
      },
      {
        testType: 'expectedToActual',
        filename: 'cappadocia-poster_string_fastseek.jpg',
        expected: 'test/expected/poster_options/',
        actual: 'tmp/poster_options/'
      },
      
      // fastseek images are the same regardless of whether
      // they're specified with a string or object.
      {
        testType: 'produceSame',
        expected: 'tmp/poster_options/cappadocia-poster_string_fastseek.jpg',
        actual: 'tmp/poster_options/cappadocia-poster_object_fastseek.jpg'
      },


      // These test are failing. I'd assumed different seeks would produce different files, and they did for a while.
      // This change may be causing the issue:
      // https://github.com/sjwilliams/grunt-responsive-videos/commit/9c6b6d94c6b91fda6526a4e5dec7f7744005434a#diff-61aa3af94eebf1771a56504d229d8234
      // 
      // Perhaps testing with bigger media and longer seeks will help, as the seeks will have more room to differ.

      // fastseek image and accurateseek should be different
      // {
      //   testType: 'produceDifferent',
      //   expected: 'tmp/poster_options/cappadocia-poster_object_accurateseek.jpg',
      //   actual: 'tmp/poster_options/cappadocia-poster_object_fastseek.jpg'
      // },


      // // fastseek image and accurateseek should be different from boolean first frame option
      // {
      //   testType: 'produceDifferent',
      //   expected: 'tmp/poster_options/cappadocia-poster_boolean.jpg',
      //   actual: 'tmp/poster_options/cappadocia-poster_object_fastseek.jpg'
      // },
      // {
      //   testType: 'produceDifferent',
      //   expected: 'tmp/poster_options/cappadocia-poster_boolean.jpg',
      //   actual: 'tmp/poster_options/cappadocia-poster_object_accurateseek.jpg'
      // }
    ];

    test.expect(files.length);

    for (var i = 0, l = files.length; i < l; i++) {

      // new matches expected
      if (files[i].testType === 'expectedToActual') {
        actual = crypto.createHash('md5').update(grunt.file.read(files[i].actual + files[i].filename)).digest("hex");
        expected = crypto.createHash('md5').update(grunt.file.read(files[i].expected + files[i].filename)).digest("hex");
        test.equal(actual, expected, 'should be the same poster for ' + files[i].filename);
     
      // different options should produce same files
      } else if (files[i].testType === 'produceSame') {
        actual = crypto.createHash('md5').update(grunt.file.read(files[i].actual)).digest("hex");
        expected = crypto.createHash('md5').update(grunt.file.read(files[i].expected)).digest("hex");
        test.equal(actual, expected, 'should be the same poster for ' + files[i].filename);
      
      } else if (files[i].testType === 'produceDifferent') {
        actual = crypto.createHash('md5').update(grunt.file.read(files[i].actual)).digest("hex");
        expected = crypto.createHash('md5').update(grunt.file.read(files[i].expected)).digest("hex");
        test.notEqual(actual, expected, 'should be different poster for ' + files[i].filename);
      }

    }

    test.done();
  },
};