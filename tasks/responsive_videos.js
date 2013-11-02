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
        encodes:[{
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
        return (_.isNumber(obj.width) && obj.width%2===0);
    }


    // create a name to suffix to our file.
    function getName(name, width, separator, suffix) {

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
            return separator + width + suffix;
        }
    }

    grunt.registerMultiTask('responsive_videos', 'Videos at various responsive sizes', function() {

        // Merge task-specific and/or target-specific options with these defaults.
        var that = this;
        var done = this.async();
        var series = [];
        var options = this.options(DEFAULT_OPTIONS);
        var sizeTally = {};  // track number of files per size
        var encodeTally = {}; // track number of files by codec
        var count = 0; // track total number of files

        if (!isValidArray(options.sizes)) {
            return grunt.fail.warn('No sizes have been defined.');
        }

        // build encode settings for each size
        options.sizes.forEach(function(size) {

            if (!isValidSize(size)) {
                return grunt.fail.warn('Width is invalid. It must be an integer and divisible by 2 (libx264 requirement)');
            }

            // create a name suffix for our image
            size.name = getName(size.name, size.width, options.separator, size.suffix);

            sizeTally[size.name] = 0;

            // build encode settings for each input file
            that.files.forEach(function(f) {
                var extName = path.extname(f.dest),
                    srcPath = f.src[0],
                    baseName = path.basename(srcPath, extName), // filename without extension
                    dirName = path.dirname(f.dest),
                    dstPath = path.join(dirName, baseName + size.name),
                    posterPath = dstPath + '.jpg';

                // more than 1 source.
                if (f.src.length > 1) {
                    return grunt.fail.warn('Unable to encode more than one video in compact or files object format.\n' + 
                        'For multiple files please use the files array format.\nSee http://gruntjs.com/configuring-tasks');
                }

                // Make directory if it doesn't exist.
                if (!grunt.file.isDir(dirName)) {
                    grunt.file.mkdir(dirName);
                }

                // queue poster creation
                if (size.poster) {
                    series.push(function(callback){
                        var flags = [];
                        flags.push('-i', srcPath);
                        flags.push('-vframes', '1');
                        flags.push('-vf', 'scale='+size.width+':-1');
                        flags.push(posterPath);
                        ffmpeg.exec(flags, function(error, info) {
                            grunt.verbose.ok('Responsive Video: ' + srcPath + ' now ' + posterPath);
                            return callback();
                        });
                    });
                }

                // generate encode settings for each output encode type
                options.encodes.forEach(function(encodeSettings){
                    _.each(encodeSettings, function(codecSettings, codecName){
                        var outPath = dstPath + '.' + codecName;

                        if (encodeTally[codecName]) {
                            encodeTally[codecName]++;
                        } else {
                            encodeTally[codecName] = 1;
                        }

                        // build up flags array ffmpeg-node expects.
                        // ex: ['-i', srcPath, '-vcodec', 'libx264', '-acodec', 'libfaac', '-pix_fmt', 'yuv420p', '-q:v', '4',  '-q:a', '100', '-threads', '0', dstPath]
                        var flags = [];

                        // input file first
                        flags.push('-i', srcPath);

                        // encode settings next
                        _.each(codecSettings, function(codecSetting){
                            for (var key in codecSetting){
                                flags.push(key,codecSetting[key]);
                            }
                        });

                        // set size
                        flags.push('-vf', 'scale='+size.width+':-1');

                        // output file
                        flags.push(outPath);

                        // if an output file already exist, delete it.
                        // ffmpeg-node fails otherwise
                        if (grunt.file.exists(outPath)) {
                            grunt.file.delete(outPath);
                        }

                        // update tallies
                        sizeTally[size.name]++;
                        count++;

                        // queue encode jobs
                        series.push(function(callback){
                            ffmpeg.exec(flags, function(error, info) {
                                // if (error) {
                                //     grunt.fail.warn(error.message);
                                // } else {
                                //     grunt.verbose.ok('Responsive Video: ' + srcPath + ' now ' + outPath);
                                // }
                                // console.log(error);
                                grunt.verbose.ok('Responsive Video: ' + srcPath + ' now ' + outPath);
                                return callback();
                            });
                        });

                    });

                    series.push(function(callback) {
                        if (sizeTally[size.name]) {
                            grunt.log.writeln('Created ' + sizeTally[size.name].toString().cyan + ' files for size ' + size.name);
                        }
                        return callback();
                    });
                });
            });
        });

        grunt.log.writeln('Starting ' + count.toString().cyan + ' encodes jobs.');

        // run encode jobs async
        async.series(series, done);
    });
};