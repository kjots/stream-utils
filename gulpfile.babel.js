import 'babel-polyfill';

import chalk from 'chalk';
import chokidar from 'chokidar';
import del from 'del';
import glob from 'glob';
import gulp from 'gulp';
import gulpBabel from 'gulp-babel';
import gulpEslint from 'gulp-eslint';
import gulpMocha from 'gulp-mocha';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpUtil from 'gulp-util';
import path from 'path';

const [ srcFilesPattern, specFilesPattern ] = [ '!(*.spec).mjs', '*.spec.mjs' ]
    .map(pattern => `{,!(node_modules|coverage|tmp)/**/}${ pattern }`);

function compile(pattern, logErrors) {
    function compileError(error) {
        if (!logErrors) throw error;

        gulpUtil.log(error.toString());

        this.end();
    }

    gulpUtil.log('Compiling', chalk.magenta(pattern));

    return gulp.src(pattern, { base: __dirname })
        .pipe(gulpSourcemaps.init())
        .pipe(gulpBabel()).on('error', compileError)
        .pipe(gulpSourcemaps.write('.', { includeContent: false, sourceRoot: '.' }))
        .pipe(gulp.dest('.'));
}

gulp.task('test', [ 'test:eslint', 'test:mocha' ]);

gulp.task('test:eslint', [ 'test:eslint:gulpfile', 'test:eslint:src', 'test:eslint:spec' ]);

gulp.task('test:eslint:gulpfile', () => {
    return gulp.src(__filename)
        .pipe(gulpEslint())
        .pipe(gulpEslint.format())
        .pipe(gulpEslint.failAfterError());
});

gulp.task('test:eslint:src', () => {
    return gulp.src(srcFilesPattern)
        .pipe(gulpEslint())
        .pipe(gulpEslint.format())
        .pipe(gulpEslint.failAfterError());
});

gulp.task('test:eslint:spec', () => {
    return gulp.src(specFilesPattern)
        .pipe(gulpEslint())
        .pipe(gulpEslint.format())
        .pipe(gulpEslint.failAfterError());
});

gulp.task('test:mocha', [ 'compile' ], () => {
    return gulp.src(specFilesPattern, { read: false })
        .pipe(gulpMocha({ require: [ 'babel-core/register', 'babel-polyfill' ] }));
});

gulp.task('compile', () => compile(srcFilesPattern));

gulp.task('clean', [ 'clean:compile', 'clean:coverage' ]);

gulp.task('clean:compile', () => del(
    glob.sync(path.resolve(__dirname, srcFilesPattern))
        .map(srcFile => srcFile.replace(/\.mjs$/, '.js'))
        .reduce((libFiles, srcFile) => libFiles.concat(srcFile, srcFile + '.map'), [])
));

gulp.task('clean:coverage', () => del([ '.nyc_output', 'coverage' ]));

// eslint-disable-next-line no-unused-vars
gulp.task('watch', [ 'compile' ], done => {
    chokidar.watch(srcFilesPattern, { ignoreInitial: true })
        .on('add', srcFile => compile(srcFile, true))
        .on('change', srcFile => compile(srcFile, true))
        .on('unlink', srcFile => {
            let libFile = srcFile.replace(/\.mjs$/, '.js');

            del([ libFile, libFile + '.map' ]);
        });
});