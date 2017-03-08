// package metadata file for Meteor.js
var packageName = 'tallyb:ngmap';
var where = 'client'; // where to install: 'client' or 'server'. For both, pass nothing.
var version = '1.18.1';
var summary = '"The Simplest AngularJs Google Maps V3 Directive Module"';
var gitLink = 'https://github.com/allenhwkim/angularjs-google-maps';
var documentationFile = 'README.md';

// Meta-data
Package.describe({
    name: packageName,
    version: version,
    summary: summary,
    git: gitLink,
    documentation: documentationFile
});

Package.onUse(function(api) {
    api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']); // Meteor versions

    api.use('angular:angular@1.2.0', where); // Dependencies

    api.addFiles('build/scripts/ng-map.js', where); // Files in use
});
