#!/usr/bin/env node
'use strict';

const fs = require('fs');
const pa = require('path');

const CliEntry = require('../dist/cli-entry').CliEntry;

var args = require('coa').Cmd()
    .name(process.argv[1])
    .title('JSON inc. For splitting up JSON files into smaller components')
    .helpful()
    .opt()
        .name('version').title('Version')
        .short('v').long('version')
        .flag()
        .act(function(opts) {
            var packagePath = pa.join(__dirname, '../package.json');
            var packageJson = fs.readFileSync(packagePath).toString();
            var packageObj = JSON.parse(packageJson);
            return packageObj.version;
        })
        .end()
    .cmd()
        .name('compile').title('Compile JSON inc. files').helpful()
        .opt()
            .name('output').title('Output directory or file [default: same as input directory]')
            .short('o').long('output')
            .end()
        .opt()
            .name('maxDepth').title('Maximum recursion level [default: 4]')
            .short('d').long('max-depth')
            .def(4)
            .end()
        .opt()
            .name('fileExtension').title('File extension [default: .inc.json]')
            .short('e').long('ext')
            .def('.inc.json')
            .end()
        .opt()
            .name('resumeOnError').title('Resume on error [default: true]')
            .short('r').long('resume')
            .flag().def(true)
            .end()
        .opt()
            .name('input').title('Input file')
            .short('input').long('input')
            .req().end()
        .act(function(opts) {
            CliEntry.execute(opts).then((results) => {
                console.log('Done:', results);
            });
        })
        .end()
    .run(process.argv.slice(2));
