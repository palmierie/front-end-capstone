/* configure Grunt to lint, compile Sass, and watch for changes */

module.exports = function(grunt) {

  grunt.initConfig({
    browserify: {
      js: {
        src: ['../app/**/*.js'],
        dest: '../build/app.js'
      },
      options: {
        paths: ["./node_modules"]
      }
    },
    jshint: {
      options: {
        predef: [ "document", "console", "$", "$scope", "firebase", "alert", "module", "prompt", "FirebaseFactory","localStorage", "location", "require", "window", 'Materialize'],
        esnext: true,
        globalstrict: true,
        globals: {"angular": true, "app": true}
      },
      files: ['../app/**/*.js']
    },
    sass: {
      dist: {
        files: {
          '../css/main.css': '../sass/main.scss'
        }
      }
    },
    watch: {
      html:{
        files: ["../index.html", "../**/*.html"]
      },
      javascripts: {
        files: ['../app/**/*.js'],
        tasks: ['jshint', 'browserify']
      },
      sass: {
        files: ['../sass/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.registerTask('default', ['jshint', 'sass','browserify', 'watch']);
};