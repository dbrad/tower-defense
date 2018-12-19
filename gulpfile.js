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

gulp.task('debug:copy:html', gulp.series('debug:clean:html', function () {
    return gulp.src('src/*.html')
        .pipe(preprocess({
            context: debugContext
        }))
        .pipe(gulp.dest('build/debug'));
}));

gulp.task('debug:clean:css', function () {
    return gulp.src('build/debug/css/*.css', {
            read: false
        })
        .pipe(clean());
});

gulp.task('debug:copy:css', gulp.series('debug:clean:css', function () {
    return gulp.src('src/css/*.css')
        .pipe(preprocess({
            context: debugContext
        }))
        .pipe(gulp.dest('build/debug/css'));
}));

gulp.task('debug:clean:res', function () {
    return gulp.src('build/debug/res/*.*', {
            read: false
        })
        .pipe(clean());
});

gulp.task('debug:copy:res', gulp.series('debug:clean:res', function () {
    return gulp.src('src/res/*.*')
        .pipe(gulp.dest('build/debug/res'));
}));

gulp.task("debug:copy", gulp.series('debug:copy:html', 'debug:copy:css', 'debug:copy:res'));

gulp.task('debug:clean:js', function () {
    return gulp.src('build/debug/js/*.js', {
            read: false
        })
        .pipe(clean());
});

gulp.task('debug:build:js', gulp.series('debug:clean:js', function () {
    return debugProject.src()
        .pipe(preprocess({
            context: debugContext
        }))
        .on('error', handleError)
        .pipe(debugProject())
        .on('error', handleError)
        .pipe(gulp.dest('build/debug/js'));
}));

gulp.task("debug:build", gulp.series('debug:copy', 'debug:build:js'));

gulp.task('debug:serve', gulp.series('debug:build', function () {
    var htdocs = path.resolve(__dirname, 'build/debug');
    var app = express();

    app.use(express.static(htdocs));
    app.listen(3000, function () {
        console.log("Server started on http://localhost:3000");
    });
}));

gulp.task("debug:watch", function () {
    gulp.watch('src/*.html', gulp.series('debug:copy:html'));
    gulp.watch('src/css/*.css', gulp.series('debug:copy:css'));
    gulp.watch('src/res/*.*', gulp.series('debug:copy:res'));
    gulp.watch('src/ts/**/*.ts', gulp.series('debug:build:js'));
});

gulp.task("debug", gulp.parallel('debug:serve', 'debug:watch'));

//#endregion