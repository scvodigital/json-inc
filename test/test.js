const pa = require('path');
const fs = require('fs');

const assert = require('assert');
const JsonInc = require('../dist/json-inc.js').JsonInc;

var jsonInc = new JsonInc({});

var test1Path = pa.join(process.cwd(), 'test-data/test1.inc.json');
var test1Dir = pa.dirname(test1Path);
var test1Json = fs.readFileSync(test1Path).toString();
var test1Expected = fs.readFileSync(test1Path + '-expected').toString();

describe('JsonInc', function() {
    describe('#transpile()', function() {
        it('should return a match to expected outcome for test1.inc.json', function() {
            var output = jsonInc.transpile(test1Json, test1Dir);
            assert.equal(output, test1Expected);
        });
    });
});
