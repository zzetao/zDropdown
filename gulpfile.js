var gulp = require("gulp"),
		pump = require("pump"),
		sourcemaps = require("gulp-sourcemaps"),
		rename = require("gulp-rename"),
		uglify = require("gulp-uglify");

gulp.task("jsmin", function (cb) {
  pump([
    gulp.src("src/zDropdown.js"),
    sourcemaps.init(),
    uglify(),
    rename({ suffix: ".min" }),
    sourcemaps.write("/"),
    gulp.dest("dist/")
  ],
  cb
  );
});

gulp.task("default", ["jsmin"])