module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
        'node_modules/angular/angular.js',
        'node_modules/angular-translate/dist/angular-translate.js',
        'node_modules/angular-resource/angular-resource.js',
        'node_modules/angular-mocks/angular-mocks.js',
        'node_modules/underscore/underscore.js',
        'app/common/**/*.js',
        'app/post/**/*.js',
        'app/user/**/*.js',
        'app/user-profile/**/*.js',
        'app/controllers/**/*.js',
        'app/directives/**/*.js',
        'app/locales/**/*.json',
        'app/services/**/*.js',
        'app/locale-config.js',
        'test/unit/**/*.js'
    ],

    // we don't want to include the sub module manifest files
    // (like for user-profile or post),
    // because we want to compose our own test specific module definitions
    // and its dependencies
    // (especially when it comes to external libraries which we often want to
    // replace with mocks, like for angular-xeditable)
    exclude: [
        'app/**/*-module.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine', 'commonjs'],

    browsers: ['Chrome', 'Firefox'],

    reporters: ['progress', 'coverage'],

    plugins : [
        'karma-jasmine',
        'karma-coverage',
        'karma-chrome-launcher',
        'karma-firefox-launcher',
        'karma-commonjs'
    ],

    preprocessors: {
        'app/**/*.js': ['commonjs', 'coverage'],
        'app/locales/**/*.json': ['commonjs'],
        'test/unit/**/*.js': ['commonjs']
    },

    coverageReporter: {
        reporters: [
            {
                type : 'text'
            },
            {
                type : 'lcov',
                dir : 'test/coverage/',
                file : 'lcov.info'
            }
        ]
    },

    logLevel: config.LOG_INFO,

  });
};
