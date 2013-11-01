/*
 * grunt-responsive-videos
 * https://github.com/sjwilliams/grunt-responsive-videos
 *
 * Based on the very handy grunt-responsive-images
 * by andismith: https://github.com/andismith/grunt-responsive-images
 * and ffmpeg-node by xonecase: https://github.com/xonecas/ffmpeg-node
 * 
 * Copyright (c) 2013 Josh Williams
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore'),
    async = require('async'),
    path = require('path'),
    ffmpeg = require('ffmpeg-node');

module.exports = function(grunt) {

    var DEFAULT_OPTIONS = {
        separator: '-',
        sizes: [{
            name: 'small',
            width: 320,
            poster: false
        },{
            name: 'large',
            width: 640,
            poster: true
        }
        ],
        encode:[{
            webm: [
                {'-vcodec': 'libvpx'},
                {'-acodec': 'libvorbis'},
                {'-crf': '12'},
                {'-b:v': '1.5M',},
                {'-q:a': '100'},
                {'-threads': '0'}
            ],
            mp4: [
                {'-vcodec':'libx264'},
                {'-acodec': 'libfaac'},
                {'-pix_fmt': 'yuv420p'},
                {'-q:v': '4'},
                {'-q:a': '100'},
                {'-threads': '0'}
            ]
        }]
    };


    // check if there are any items in our array
    function isValidArray(obj) {
        return (_.isArray(obj) && obj.length > 0);
    }


    // check whether we've been given any valid size values
    function isValidSize(obj) {
        return (_.isNumber(obj.width) || _.isNumber(obj.height));
    }


    // create a name to suffix to our file.
    function getName(name, width, height, separator, suffix) {

        // handle empty separator as no separator
        if (typeof separator === 'undefined') {
            separator = '';
        }

        // handle empty suffix as no suffix
        if (typeof suffix === 'undefined') {
            suffix = '';
        }

        if (name) {
            return separator + name + suffix;
        } else {
            if (width && height) {
                return separator + width + 'x' + height + suffix;
            } else {
                return separator + (width || height) + suffix;
            }
        }
    }

    grunt.registerMultiTask('responsive_videos', 'Videos at various resonsive sizes', function() {

        // Merge task-specific and/or target-specific options with these defaults.
        var that = this;
        var done = this.async();
        var series = [];
        var options = this.options(DEFAULT_OPTIONS);
        var tally = {};

        if (!isValidArray(options.sizes)) {
            return grunt.fail.warn('No sizes have been defined.');
        }

        options.sizes.forEach(function(s) {

            // consts
            var DEFAULT_SIZE_OPTIONS = {
                quality: 1
            };

            // variable
            var sizeOptions = _.clone(_.extend(DEFAULT_SIZE_OPTIONS, s));
            var sizingMethod = 'resize';

            if (!isValidSize(s)) {
                return grunt.fail.warn('Size is invalid');
            }

            // use crop if both width and height are specified.
            if (s.width && s.height) {
                sizingMethod = 'crop';
            }

            // create a name suffix for our image
            sizeOptions.name = getName(s.name, s.width, s.height, options.separator, s.suffix);

            tally[sizeOptions.name] = 0;

            console.log(sizeOptions);

            that.files.forEach(function(f) {

                var extName = path.extname(f.dest),
                    srcPath = f.src[0],
                    baseName = path.basename(srcPath, extName), // filename without extension
                    dirName = path.dirname(f.dest),
                    dstPath = path.join(dirName, baseName + sizeOptions.name + '.mp4');

                var encodeOptions = {};


                // more than 1 source.
                if (f.src.length > 1) {
                    return grunt.fail.warn('Unable to resize more than one image in compact or files object format.\n'+ 'For multiple files please use the files array format.\nSee http://gruntjs.com/configuring-tasks');
                }

                // Make directory if it doesn't exist.
                if (!grunt.file.isDir(dirName)) {
                    grunt.file.mkdir(dirName);
                }
                console.log(f,extName, srcPath, dirName, baseName, dstPath);

                // series.push(function(callback) {
                //     im[sizingMethod](imageOptions, function(error, stdout, stderr) {
                //         if (error) {
                //             grunt.fail.warn(error.message);
                //         } else {
                //             grunt.verbose.ok('Responsive Image: ' + srcPath + ' now ' + dstPath);
                //             tally[sizeOptions.name]++;
                //         }
                //         return callback();
                //     });


                // });



                // ffmpeg.exec(['-i', srcPath, '-vcodec', 'libx264', '-acodec', 'libfaac', '-pix_fmt', 'yuv420p', '-q:v', '4',  '-q:a', '100', '-threads', '0', dstPath], function() {
                //     done.apply();
                // });
            });

             done.apply();

        });
    });
};