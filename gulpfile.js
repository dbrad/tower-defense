var fs = require('fs');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify-es').default;
const compiler = require('google-closure-compiler-js').gulp();
var imagemin = require('gulp-imagemin');
var preprocess = require("gulp-preprocess");
var express = require('express');
var path = require('path');
var ts = require("gulp-typescript");
var debugProject = ts.createProject("./tsconfig.debug.json");
var preReleaseProject = ts.createProject("./tsconfig.pre.release.json");
var releaseProject = ts.createProject("./tsconfig.release.json");

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

//#region DEBUG BUILD

let debugContext = {
    DEBUG: true
};

gulp.task('debug:clean:html', function () {
    return gulp.src('build/debug/*.html', {
            read: false
        })
        .pipe(clean());
});

gulp.task('debug:copy:html', ['debug:clean:html'], function () {
    return gulp.src('src/*.html')
        .pipe(preprocess({
            context: debugContext
        }))
        .pipe(gulp.dest('build/debug'));
});

gulp.task('debug:clean:css', function () {
    return gulp.src('build/debug/css/*.css', {
            read: false
        })
        .pipe(clean());
});

gulp.task('debug:copy:css', ['debug:clean:css'], function () {
    return gulp.src('src/css/*.css')
        .pipe(preprocess({
            context: debugContext
        }))
        .pipe(gulp.dest('build/debug/css'));
});

gulp.task('debug:clean:res', function () {
    return gulp.src('build/debug/res/*.*', {
            read: false
        })
        .pipe(clean());
});

gulp.task('debug:copy:res', ['debug:clean:res'], function () {
    return gulp.src('src/res/*.*')
        .pipe(gulp.dest('build/debug/res'));
});

gulp.task("debug:copy", ['debug:copy:html', 'debug:copy:css', 'debug:copy:res'])

gulp.task('debug:clean:js', function () {
    return gulp.src('build/debug/js/*.js', {
            read: false
        })
        .pipe(clean());
});

gulp.task('debug:build:js', ['debug:clean:js'], function () {
    return debugProject.src()
        .pipe(preprocess({
            context: debugContext
        }))
        .on('error', handleError)
        .pipe(debugProject())
        .on('error', handleError)
        .pipe(gulp.dest('build/debug/js'));
});

gulp.task("debug:build", ['debug:copy', 'debug:build:js']);

gulp.task('debug:serve', ['debug:build'], function () {
    var htdocs = path.resolve(__dirname, 'build/debug');
    var app = express();

    app.use(express.static(htdocs));
    app.listen(3000, function () {
        console.log("Server started on http://localhost:3000");
    });
});

gulp.task("debug:watch", function () {
    gulp.watch('src/*.html', ['debug:copy:html']);
    gulp.watch('src/css/*.css', ['debug:copy:css']);
    gulp.watch('src/res/*.*', ['debug:copy:res']);
    gulp.watch('src/ts/**/*.ts', ['debug:build:js']);
});

gulp.task("debug", ['debug:build', 'debug:serve', 'debug:watch']);

//#endregion

//#region RELEASE BUILD

gulp.task('release:clean:html', function () {
    return gulp.src('build/release/*.html', {
            read: false
        })
        .pipe(clean());
});

gulp.task('release:minify:html', ['release:clean:html'], function () {
    return gulp.src('src/*.html')
        .pipe(preprocess())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true
        }))
        .pipe(gulp.dest('build/release'));
});

gulp.task('release:clean:css', function () {
    return gulp.src('build/release/css/*.css', {
            read: false
        })
        .pipe(clean());
});

gulp.task('release:minify:css', ['release:clean:css'], function () {
    return gulp.src('src/css/*.css')
        .pipe(preprocess())
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('build/release/css'));
});

gulp.task('release:clean:res', function () {
    return gulp.src('build/release/res/*.*', {
            read: false
        })
        .pipe(clean());
});

gulp.task('release:copy:res', ['release:clean:res'], function () {
    return gulp.src('src/res/*.*')
        .pipe(gulp.dest('build/release/res'));
});

gulp.task('release:minify:png', ['release:copy:res'], function () {
    return gulp.src('src/res/*.png')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('build/release/res'));
});

gulp.task('release:preprocess:ts', function () {
    return preReleaseProject.src()
        .on('error', handleError)
        .pipe(preprocess({
            options: {
                type: 'ts'
            }
        }))
        .on('error', handleError)
        .pipe(gulp.dest('build/tmp'));
});

gulp.task('release:clean:js', function () {
    return gulp.src('build/release/js/*.js', {
            read: false
        })
        .pipe(clean());
});

gulp.task('release:build:js', ['release:preprocess:ts', 'release:clean:js'], function () {
    return releaseProject.src()
        .on('error', handleError)
        .pipe(releaseProject())
        .on('error', handleError)
        .pipe(uglify())
        .on('error', handleError)
        .pipe(compiler({
            languageIn: 'ECMASCRIPT6',
            languageOut: 'ECMASCRIPT6',
            compilationLevel: "SIMPLE",
            assumeFunctionWrapper: true,
            outputWrapper: '(function(){\n%output%\n})()',
            jsOutputFile: 'app.js',
            rewritePolyfills: false,
            warningLevel: "QUIET"
        }))
        .on('error', handleError)
        .pipe(gulp.dest('build/release/js'));
});

gulp.task('release:clean:tmp', ['release:build:js'], function () {
    return gulp.src('build/tmp', {
            read: false
        })
        .pipe(clean());
});

gulp.task("release:build", ['release:minify:html', 'release:minify:css', 'release:minify:png', 'release:build:js', 'release:clean:tmp']);

gulp.task('zip', ['release:build'], function () {
    return gulp.src('build/release/**/*')
        .pipe(zip('js13k.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('report', ['zip'], function (done) {
    var stat = fs.statSync('dist/js13k.zip'),
        limit = 1024 * 13,
        size = stat.size,
        remaining = limit - size,
        percentage = (remaining / limit) * 100;

    //percentage = Math.round(percentage * 100) / 100;

    console.log('\n\n-------------');
    console.log('ZIP SIZE (BYTES): ' + stat.size);
    //console.log('BYTES REMAINING: ' + remaining);
    //console.log(percentage + '%');
    console.log('-------------\n\n');
    done();
});


gulp.task('release:serve', ['release:build'], function () {
    var htdocs = path.resolve(__dirname, 'build/release');
    var app = express();

    app.use(express.static(htdocs));
    app.listen(3001, function () {
        console.log("Server started on http://localhost:3001");
    });
});

gulp.task("release:watch", function () {
    gulp.watch('src/css/*.css', ['release:minify:css', 'zip', 'report']);
    gulp.watch('src/res/*.res', ['release:copy:res', 'zip', 'report']);
    gulp.watch('src/res/png.res', ['release:minify:png', 'zip', 'report']);
    gulp.watch('src/*.html', ['release:minify:html', 'zip', 'report']);
    gulp.watch('src/ts/**/*.ts', ['release:build:js', 'zip', 'report']);
});

gulp.task("release", ['release:build', 'zip', 'report', 'release:serve', 'release:watch'])

//#endregion

gulp.task('default', ['debug', 'release']);