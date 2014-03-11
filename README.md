# grunt-responsive-videos

> Generate multiple video encodes at varying sizes for responsive, HTML5 video applications.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-responsive-videos --save-dev
```

Additionally, this plugin requries ffmpeg with libx264 and libvpx to encode .mp4 and .webm, which are common HTML5 codecs, and required for the unit tests.
```shell
brew install ffmpeg --with-libvorbis --with-nonfree --with-gpl --with-libvpx --with-pthreads --with-libx264 --with-libfaac --with-theora --with-libogg
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-responsive-videos');
```

## The "responsive_videos" task

### Overview

The responsive_videos task will take source video and generate any number of output resolutions in any codec supported by FFMPEG.

In your project's Gruntfile, add a section named `responsive_videos` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  responsive_videos: {
    myTask:{
      options: {
        // Task-specific options go here.
      },
      files[
      ]
    }
  },
})
```

### Options

#### options.sizes
Type: `Array`

Default value:

```js
[{
  name: "small",
  width: 320,
  filter: '',
  poster: true
},{
  name: "large",
  width: 1024,
  filter: '',
  poster: false
}]
```

An array of objects containing the sizes we want to resize our video to.

If a `name` is specified, then the file will be suffixed with this name. e.g. my-video-small.mp4

If a `name` is not specified, then the file will be suffixed with the width. e.g. my-video-320.jpg

`filter` is used when custom [filtergraphs](http://ffmpeg.org/ffmpeg-filters.html#Filtering-Introduction) are needed, like for cropping. The `width` propety will only be used for naming purpose if a `filter` is specified.

If `poster` is true, create an image from the first frame of the video at this output size. e.g. my-video-320.jpg.

The poster option may also be used to seek to a particular time, using FFMPEG's `fastseek` or `accurateseek` [options](https://trac.ffmpeg.org/wiki/Seeking%20with%20FFmpeg)

`fastseek` like:

```js
{
  name: "large",
  width: 1024,
  poster: '00:00:02'
}
```

or

```js
{
  name: "large",
  width: 1024,
  poster: {
    fastseek: '00:00:02'
  }
}
```

`accurateseek` like:

```js
{
  name: "large",
  width: 1024,
  poster: {
    accurateseek: '00:00:02'
  }
```

Poster seek time can be in "HH:MM:SS" format (example: "00:00:05" for 5 seconds) or "S" (example: "5", for 5 seconds);

#### options.encodes
Type: `Array`

Default value:

```js
[{
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
```

An array of objects containing the codecs you'd like to produce. The keys are used as the extension, and the array of objects will be converted to flags passed into ffmpeg.

The above are the defaults for an encode job and should give reasonable results for HTML5 video.

##### Encode Resources
* [x264 encoding guide from FFMPEG](https://ffmpeg.org/trac/ffmpeg/wiki/x264EncodingGuide)
* [VBR settings guide](http://slhck.info/video-encoding.html) explains many of the important flags.
* [MP4 examples](https://www.virag.si/2012/01/web-video-encoding-tutorial-with-ffmpeg-0-9/)
* [WebM examples](https://www.virag.si/2012/01/webm-web-video-encoding-tutorial-with-ffmpeg-0-9/)

#### options.separator
Type: `String`
Default value: `-`

The character used to separate the video filename from the size name.

### Usage Examples

#### Default Options
The default options will produce a .mp4 and a .webm with an poster image at 320px and 640px wide. They will be named my-video-small.ext and my-video-large.ext.

```js
grunt.initConfig({
  responsive_videos: {
    myTask{
      options: {},
      files: {
        ...
      }
    }
  },
})
```

#### Custom Option Examples
##### Customized encode and size settings
In this example, we specify custom sizes and a source path. We'll only generate .webm files and poster images at 320px wide, and we'll not using custom naming, falling back to -320.web names instead of -small.webm, etc.

```js
grunt.initConfig({
  responsive_videos: {
    myTask: {
      options: {
        sizes: [{
          width: 320,
          poster: true
        }],
        encodes:[{
          webm: [
            {'-vcodec': 'libvpx'},
            {'-acodec': 'libvorbis'},
            {'-crf': '12'},
            {'-b:v': '1.5M',},
            {'-q:a': '100'}
          ]
        }]
      },
      files: [{
        expand: true,
        src: ['video/**.{mov,mp4}'],
        cwd: 'assets/',
        dest: 'tmp/'
      }]
    }
  },
})
```
##### Custom size with filter
In this example, we specify a custom filtergraph to crop the video to a square.
```js
grunt.initConfig({
  responsive_videos: {
    myTask: {
      options: {
        sizes: [{
          width: 360,
          filter: 'scale=640:trunc(ow/a/2)*2,crop=360:360:140:0',
          poster: true
        }]
      },
      files: [{
        expand: true,
        src: ['*.{mov,mp4}'],
        cwd: srcVideos,
        dest: tmpFolder
      }]
    }
  },
})
```


## Known Issues
- Generated .webm files in unit tests are returning different checksums on every run, making reliable test impossible. ffmpeg settings issue?

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
*0.1.0*

* Better default WebM settings

*0.0.4*

* Enhancement [issue 3](https://github.com/sjwilliams/grunt-responsive-videos/issues/3): More robust poster options. Thanks to [@johncmckim](https://github.com/johncmckim)
* Enhancement: --debug logs
* Fixed [issue 5](https://github.com/sjwilliams/grunt-responsive-videos/issues/5): Occasional zero byte h.246 encodes.
* Fixed [issue 4](https://github.com/sjwilliams/grunt-responsive-videos/issues/4): Freezing on some task re-run. 

*0.0.3*

* Much smaller test media

*0.0.2*

* Dependency fix

*0.0.1*

* Initial Release

## Additional Credit 
This plugin is *heavily* inspired by andismith's [grunt-responsive-images](https://github.com/andismith/grunt-responsive-images)

[Big Buck Bunny](http://www.bigbuckbunny.org/) trailer in test assets is (c) copyright 2008, Blender Foundation. It is released under the [Creative Commons Attribution 3.0](http://creativecommons.org/licenses/by/3.0/) license.

[Hot air ballon ride over Cappadocia, Turkey](http://www.youtube.com/watch?v=xIR8TxSBgyg) in test assets is (c) copyright 2012, Josh Williams. It is released under the [Creative Commons Attribution 3.0](http://creativecommons.org/licenses/by/3.0/) license.
