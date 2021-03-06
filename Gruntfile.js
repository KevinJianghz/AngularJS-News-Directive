// Generated on 2015-02-17 using
// generator-webapp 0.5.1
// Modified on 2015-02-17 by Kevin Jiang
'use strict';


module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    pkg: grunt.file.readJSON('package.json'),

    // Empties folders to start fresh
    clean: {
          src: '<%= config.dist %>'
    },

    copy: {
      dist: {
           expand: true,
           flatten: true,
           src: 'README.md',
           dest: '<%= config.dist %>'
      },
      vendors: {
        expand: true,
        flatten: true,
        cwd: 'bower_components',
        dest: '<%= config.app %>/scripts/vendor/',
        src: ['angular/angular.min.js','jquery/jquery.js']
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      files: {
        src:['<%= config.app %>/scripts/<%= pkg.name %>.js',
             '!<%= config.app %>/scripts/vendor/*']
      }
    },
 
   // The following *-min tasks produce minified files in the dist folder
    cssmin: {
      files: {
          src: '<%= config.app %>/styles/<%= pkg.name %>.css',
          dest: '<%= config.dist %>/<%= pkg.name %>.min.css'
      }
    },
    uglify: {
      options: {
        banner: '/*! Generated by Kevin Jiang on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      files: {
          src: '<%= config.app %>/scripts/<%= pkg.name %>.js',
          dest: '<%= config.dist %>/<%= pkg.name %>.min.js'
      }
    }

  });

  grunt.registerTask('runsetup', [
     'copy:vendors'
  ]);

  grunt.registerTask('build', [
    'clean',
    'cssmin',
    'uglify',
    'copy:dist'
  ]);

  grunt.registerTask('default', [
     'build'
  ]);
};
