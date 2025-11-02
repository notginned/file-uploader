import gulp from "gulp";
import { deleteAsync } from "del";
import ts from "gulp-typescript";
import nodemon from "nodemon";

const { src, dest, series, parallel, watch } = gulp;

const clean = () => deleteAsync(["dist/**", "!dist"]);

// Setup TS project
const tsProject = ts.createProject("tsconfig.json");

const compileTsProject = () =>
  tsProject.src().pipe(tsProject()).js.pipe(dest("dist"));

const copyViews = () => src("src/views/**").pipe(dest("dist/views"));

const copyAssets = () =>
  src("assets/**/*.{jpg,png,svg}").pipe(dest("dist/public/assets"));

// Copy files in parallel
// Run build tasks in serial
const copyFiles = parallel(copyViews, copyAssets);

const build = series(clean, compileTsProject, copyFiles);

export { clean, build };

// Watch files
const watchTsProject = () => watch("src/**/*.ts", compileTsProject);

const watchAssets = () => watch("assets/**/*", copyAssets);

const watchViews = () => watch("src/views/**", copyViews);

const start = () =>
  nodemon({
    script: "dist/app.js",
    watch: "dist",
    ext: "js, json, ejs, css",
    // Debouncing
    delay: 500,
  });

const watchSrc = series(
  build,
  parallel(watchTsProject, watchAssets, watchViews, start)
);

export { watchSrc };
