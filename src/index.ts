import * as pa from 'path';
import * as fs from 'fs';

import * as dot from 'dot-object';

const maxDepthLimit: number = 100;

export class JsonInc {
    options: IJsonIncOptions = {
        maxDepth: 4,
        debugLineLength: 255,
        resumeOnError: false,
        fileExtension: '.inc.json'
    }

    constructor(options: IJsonIncOptions) {
        Object.assign(this.options, options);

        if (this.options.maxDepth > maxDepthLimit) {
            this.options.maxDepth = maxDepthLimit;
            console.warn('It looks like you\'re trying to set a silly maximum depth. Resetting it to', maxDepthLimit);
        }
    }

    transpile(input: string, baseDir: string = null, level: number = 1): string {
        if (level > this.options.maxDepth) {
            throw new Error('To many recursive calls deep. Maximum depth: ' + this.options.maxDepth);
        }

        if (!baseDir) {
            baseDir = process.cwd();
            console.warn('No base directory for JSON file provided, defaulting to current process directory:', baseDir);
        }

        if (!input) {
            return null;
        }

        var output = this.normalizeLineTerminator(input);
        output = this.checkJson(output);

        output = this.includeStrings(output, baseDir);
        output = this.includeJsonAsValue(output, baseDir, level);
        output = this.includeJsonAsPart(output, baseDir, level);

        output = this.checkJson(output);

        return output;
    }

    includeStrings(input: string, baseDir: string): string {
        input = input.replace(/(?:"\{\$)(.*?)(?:\}")/ig, (all, match) => {
            var fullImportPath = pa.join(baseDir, match);
            var contents = fs.readFileSync(fullImportPath).toString();
            var jsonSafe = JSON.stringify(contents);
            return jsonSafe;
        });
        return input;
    }

    includeJsonAsValue(input: string, baseDir: string, level: number): string {
        input = input.replace(/(?:"\{\:)(.*?)(@.+?)?(?:\}")/ig, (all, filePath, objectPath, value) => {
            var fullImportPath = pa.join(baseDir, filePath);
            var contents = fs.readFileSync(fullImportPath).toString();

            if (filePath.lastIndexOf(this.options.fileExtension) === filePath.length - this.options.fileExtension.length) {
                var importDir = pa.dirname(fullImportPath);
                contents = this.transpile(contents, importDir, level + 1);
            }

            var obj = JSON.parse(contents);

            if (objectPath) {
                objectPath = objectPath.substr(1);
                obj = dot.pick(objectPath, obj);
            }

            var json = JSON.stringify(obj, null, 4);

            return json;
        });
        return input;
    }
    
    includeJsonAsPart(input: string, baseDir: string, level: number): string {
        input = input.replace(/(?:"\{\#)(.*?)(@.+?)?(?:\}")(: ?"")?/ig, (all, filePath, objectPath, value) => {
            var fullImportPath = pa.join(baseDir, filePath);
            var contents = fs.readFileSync(fullImportPath).toString();
            
            if (filePath.lastIndexOf(this.options.fileExtension) === filePath.length - this.options.fileExtension.length) {
                var importDir = pa.dirname(fullImportPath);
                contents = this.transpile(contents, importDir, level + 1);
            }
            
            var obj = JSON.parse(contents);

            if (objectPath) {
                objectPath = objectPath.substr(1);
                obj = dot.pick(objectPath, obj);
            }

            var json = JSON.stringify(obj, null, 4);

            var lines = json.split(/\n/ig);
            lines.shift();
            lines.pop();
            json = lines.join('\n');

            return json;
        });
        return input;

    }

    private checkJson(input: string): string {
        var err, obj;
        try {
            obj = JSON.parse(input);
        } catch(err) {
            var character = err.message.match(/(?:position\s)(\d+)/)[0] || null;
            var position = this.getJsonErrorPostion(input, character);
            var lines = input.split(/\n/g);
            var debugStartLine = Math.max(position.row - 2, 0);
            var debugEndLine = Math.min(position.row + 2, lines.length);

            var debugMessage: string[] = [];
            debugMessage.push(err.message);
            debugMessage.push('----------------------');

            for (var l = debugStartLine; l <= debugEndLine; l++) {
                var line = lines[l];
                line = line.substr(0, Math.min(this.options.debugLineLength, line.length));
                var lineNo = l + ': ';
                debugMessage.push(lineNo + line);
                if (l === position.row) {
                    var spaces = Array(position.col).join(' ');
                    debugMessage.push(spaces + '^-- ' + err.message);
                }
            }

            debugMessage.push('----------------------');
            throw new Error(debugMessage.join('\n'));
        }
        var output = JSON.stringify(obj, null, 4);
        return output;
    }

    private getJsonErrorPostion(input: string, position: number): ICellPosition {
        var inputToPos = input.substr(0, position);
        var lineBreaks = inputToPos.match(/\n/g) || [];
        var totalLines = input.split(/\n/g).length || 0;
        var lineNo = lineBreaks.length;
        var lastLineBreak = inputToPos.lastIndexOf('\n');
        var colNo = position - lastLineBreak;
        return {
            row: lineNo,
            col: colNo,
        };
    }

    private normalizeLineTerminator(input: string): string {
        var output = input.replace(/\r\n/g, '\n');
        return output;
    }
}

export interface IJsonIncOptions {
    maxDepth?: number;
    debugLineLength?: number;
    resumeOnError?: boolean;
    fileExtension?: string;
}

export interface ICellPosition {
    row: number;
    col: number;
}

