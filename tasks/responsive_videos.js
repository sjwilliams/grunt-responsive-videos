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
            filter: '',
            poster: true
        },{
            name: 'large',
            width: 640,
            filter: '',
            poster: true
        }
        ],
        encodes:[{
            webm: [
               {'-vcodec': 'libvpx'},
               {'-acodec': 'libvorbis'},
               {'-q:a': '100'},
               {'-quality': 'good'},
               {'-cpu-used': '0'},
               {'-b:v': '500k'},
               {'-qmax': '42'},
               {'-maxrate': '500k'},
               {'-bufsize': '1000k'},
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
    function getName(name, width, separator) {

        // handle empty separator as no separator
        if (typeof separator === 'undefined') {
            separator = '';
        }

        if (name) {
            return separator + name;
        } else {
            return separator + width;
        }
    }

    // if a file exist, delete it.
    // otherwise ffmpeg will fail
    function deleteFile(path) {
        if (grunt.file.exists(path)) {
            grunt.file.delete(path);
        }
    }


    // Build filter graph flag, giving preference to a custom
    // filter. If none, construct the filter with the given width.
    // http://ffmpeg.org/ffmpeg-filters.html#Filtering-Introduction
    function getFilterGraphFlags(sizeObj) {
        if (sizeObj.filter && typeof sizeObj.filter === 'string') {
            return sizeObj.filter;
        } else {
            return 'scale='+sizeObj.width+':trunc(ow/a/2)*2';
        }
    }


    grunt.registerMultiTask('responsive_videos', 'Videos at various responsive sizes', function() {
        var that = this;

        // Merge task-specific and/or target-specific options with these defaults.
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
            size.name = getName(size.name, size.width, options.separator);

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

                // determine which type of poster to create for
                // the given video size and related options.
                //
                // The default will be to use the first frame, but also options to 'fastseek'
                // and 'accurateseek' to a specific portion of the video
                //
                // Based on:
                // https://github.com/sjwilliams/grunt-responsive-videos/issues/3#issuecomment-31206990
                // https://trac.ffmpeg.org/wiki/Seeking%20with%20FFmpeg
                if (size.poster) {
                    deleteFile(posterPath);

                    series.push(function(callback){
                        var flags = [];
                        var posterConfigType = typeof size.poster;
                        var seektime;

                        // accurateseek object contains an 'accurateseek' property
                        if (posterConfigType === 'object' && typeof size.poster.accurateseek === 'string') {

                            // -ss param after input
                            flags.push('-i', srcPath);
                            flags.push('-ss', size.poster.accurateseek);

                        // string is assumed to be format '00:02:00' and will fast seek.
                        // if object with fastseek propery, same settings
                        } else if (posterConfigType === 'string' || (posterConfigType === 'object' && typeof size.poster.fastseek === 'string')) {
                            seektime = (posterConfigType === 'string') ? size.poster : size.poster.fastseek;

                            // -ss param before input
                            flags.push('-ss', seektime);
                            flags.push('-i', srcPath);

                         // boolean true or something configured wrong.
                         // just grab the first frame. warn if misconfigured.
                        } else {
                            if (posterConfigType !== 'boolean') {
                                grunt.log.writeln('Poster option invalid. Using first frame.');
                            }
                            flags.push('-i', srcPath);
                        }

                        flags.push('-vframes', '1'); //grab only one frame
                        flags.push('-vf', getFilterGraphFlags(size));
                        flags.push(posterPath);
                        grunt.log.debug('ffmpeg ' + flags.join(' '));
                        ffmpeg.exec(flags, function() {
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

                        // set size with given width or custom filtergraph
                        flags.push('-vf', getFilterGraphFlags(size));

                        // output file
                        flags.push(outPath);

                        // delete older versions
                        deleteFile(outPath);

                        // update tallies
                        sizeTally[size.name]++;
                        count++;

                        // queue encode jobs
                        series.push(function(callback){
                            grunt.log.debug('ffmpeg ' + flags.join(' '));
                            ffmpeg.exec(flags, function() {
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
