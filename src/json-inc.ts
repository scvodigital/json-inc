import * as pa from 'path';
import * as fs from 'fs';
import * as qs from 'querystring';

import * as dot from 'dot-object';
import * as glob from 'glob-promise';

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

  async transpile(input: string, baseDir: string = null, level: number = 1): Promise<string> {
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

    output = await this.includeStringsAsValue(output, baseDir);
    output = await this.includeStringsAsPart(output, baseDir);
    output = await this.includeJsonAsValue(output, baseDir, level);
    output = await this.includeJsonAsPart(output, baseDir, level);

    output = this.checkJson(output);

    return output;
  }

  async includeStringsAsValue(input: string, baseDir: string): Promise<string> {
    try {
      const replaceOperations: AsyncReplaceOperation[] = [];
      input = input.replace(/(?:"\{\$)(.*?)(?:\}")(?:[\s\n\r]*?)(,|]|})/ig, (all, path, end) => {
        const operation = async (resolve, reject): Promise<string> => {
          var fullImportPath = pa.join(baseDir, path);
          var output = '';
          var files = await glob(fullImportPath);
          var parts = [];
          for (var f = 0; f < files.length; f++) {
            var file = files[f];
            var contents = fs.readFileSync(file).toString();
            var jsonSafe = JSON.stringify(contents);
            parts.push(jsonSafe);
          }
          output = parts.join(',\n');
          output += end;
          return output;
        };
        replaceOperations.push({match: all, operation});
        return all;
      });
      for (var i = 0; i < replaceOperations.length; ++i) {
        const replaceOperation = replaceOperations[i];
        const replace = await replaceOperation.operation();
        input = input.split(replaceOperation.match).join(replace);
      }
    } catch(err) {
      console.error('Error Including Strings as Value:', err);
    }
    return input;
  }
  
  async includeStringsAsPart(input: string, baseDir: string): Promise<string> {
    try {
      const replaceOperations: AsyncReplaceOperation[] = [];
      input = input.replace(/(?:"\{\$)(.*?)(?:\}")(?::\s*")(.*?)(?:")(?:[\s\n\r]*?)(,|]|})/ig, (all, path, argsString, end) => {
        const match = '"%%MATCH.' + Math.random().toString() + '%%"';
        const operation = async (resolve, reject): Promise<string> => {
          var options = this.getPartIncludeOptions(argsString);
          var fullImportPath = pa.join(baseDir, path);
          var files = await glob(fullImportPath);
          var parts = [];
          for (var f = 0; f < files.length; ++f) {
            var file = files[f];
            var contents = fs.readFileSync(file).toString();
            var jsonSafe = JSON.stringify(contents);
            var key = this.getPartKey(file, options);
            parts.push('"' + key + '": ' + jsonSafe);
          }
          var contents = parts.join(',\n');
          contents += end;
          return contents;
        };
        replaceOperations.push({match: all, operation});
        return all;
      });
      for (var i = 0; i < replaceOperations.length; ++i) {
        const replaceOperation = replaceOperations[i];
        const replace = await replaceOperation.operation();
        input = input.split(replaceOperation.match).join(replace);
      }
    } catch(err) {
      console.error('Error Including Strings as Part:', err);
    }
    return input;
  }

  async includeJsonAsValue(input: string, baseDir: string, level: number): Promise<string> {
    try {
      const replaceOperations: AsyncReplaceOperation[] = [];
      input = input.replace(/(?:"\{\:)(.*?)(@.+?)?(?:\}")(?:[\s\n\r]*?)(,|]|})/ig, (all, filePath, objectPath, end) => {
        const match = '"%%MATCH.' + Math.random().toString() + '%%"' + end;
        const operation = async (resolve, reject): Promise<string> => {
          var fullImportPath = pa.join(baseDir, filePath);
          var output = '';
          var files = await glob(fullImportPath);
          var parts = [];
          for (var f = 0; f < files.length; f++) {
            var file = files[f];
            var contents = fs.readFileSync(file).toString();
            var importDir = pa.dirname(fullImportPath);

            contents = await this.transpile(contents, importDir, level + 1);

            var obj = JSON.parse(contents);

            if (objectPath) {
              objectPath = objectPath.substr(1);
              obj = dot.pick(objectPath, obj);
            }

            var json = JSON.stringify(obj, null, 4);
            parts.push(json);
          }
          output = parts.join(',\n');
          output += end;
          return output;
        };
        replaceOperations.push({match: all, operation});
        return all;
      });
      for (var i = 0; i < replaceOperations.length; ++i) {
        const replaceOperation = replaceOperations[i];
        const replace = await replaceOperation.operation();
        input = input.split(replaceOperation.match).join(replace);
      }
    } catch(err) {
      console.error('Error Including JSON as Value:', err);
    }
    return input;
  }

  async includeJsonAsPart(input: string, baseDir: string, level: number): Promise<string> {
    try {
      const replaceOperations: AsyncReplaceOperation[] = [];
      input = input.replace(/(?:"\{\#)(.*?)(@.+?)?(?:\}")(?::\s*")(.*?)(?:")(?:[\s\n\r]*?)(,|]|})/ig, (all, filePath, objectPath, argsString, end) => {
        const operation = async (resolve, reject): Promise<string> => {
          var options = this.getPartIncludeOptions(argsString);
          var fullImportPath = pa.join(baseDir, filePath);
          var files = await glob(fullImportPath);
          var parts = [];
          for (var f = 0; f < files.length; ++f) {
            var file = files[f];
            var contents = fs.readFileSync(file).toString();
            var importDir = pa.dirname(fullImportPath);
            contents = await this.transpile(contents, importDir, level + 1);

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
            var key = this.getPartKey(file, options);
            parts.push('"' + key + '": ' + json);
          }
          var contents = parts.join(',\n');
          contents += end;
          return contents;
        };
        replaceOperations.push({match: all, operation});
        return all;
      });
      for (var i = 0; i < replaceOperations.length; ++i) {
        const replaceOperation = replaceOperations[i];
        const replace = await replaceOperation.operation();
        input = input.split(replaceOperation.match).join(replace);
      }
    } catch(err) {
      console.error('Error Including JSON as Part:', err);
    }
    return input;
  }

  private checkJson(input: string): string {
    var err, obj;
    try {
      obj = JSON.parse(input);
    } catch (err) {
      var character = err.message.match(/(?:position\s)(\d+)/)[0] || null;
      character = character.replace(/[^\d]/g, '');
      var position = this.getJsonErrorPostion(input, Number(character));
      var lines = input.split(/\n/g);
      var debugStartLine = Math.max(position.row - 50, 0);
      var debugEndLine = Math.min(position.row + 50, lines.length -1);

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
    var colNo = position - (lastLineBreak || inputToPos.length);
    return {
      row: lineNo,
      col: colNo,
    };
  }

  private normalizeLineTerminator(input: string): string {
    var output = input.replace(/\r\n/g, '\n');
    return output;
  }

  private getPartKey(path: string, options: PartIncludeOptions): string {
    var stringPath = pa.parse(path);
    var key = options.stripExtension ? stringPath.name : stringPath.base;

    if (options.includePathDepth > 0) {
      var pathParts = stringPath.dir.split('/');
      var relevantParts = pathParts.slice(pathParts.length - options.includePathDepth);
      key = relevantParts.join(options.pathDelimiter) + options.pathDelimiter + key;
    }

    return key;
  }

  private getPartIncludeOptions(argsString: string): PartIncludeOptions {
    let args = qs.parse(argsString);
    const options: PartIncludeOptions = {
      includePathDepth: 0,
      pathDelimiter: '_',
      stripExtension: true
    };
    if (args.includePathDepth) {
      if (Array.isArray(args.includePathDepth)) {
        options.includePathDepth = Number(args.includePathDepth[0]) || 0;
      } else {
        options.includePathDepth = Number(args.includePathDepth) || 0;
      }
    }
    if (args.pathDelimiter) {
      if (Array.isArray(args.pathDelimiter)) {
        options.pathDelimiter = args.pathDelimiter[0] || '';
      } else {
        options.pathDelimiter = args.pathDelimiter || '';
      }
    }
    if (Object.prototype.hasOwnProperty.call(args, 'stripExtension')) {
      if (Array.isArray(args.stripExtension)) {
        options.stripExtension = Boolean(args.stripExtension[0]);
      } else {
        options.stripExtension = Boolean(args.stripExtension);
      }
    }
    return options;
  }
}

export interface IJsonIncOptions {
  maxDepth ? : number;
  debugLineLength ? : number;
  resumeOnError ? : boolean;
  fileExtension ? : string;
}

export interface ICellPosition {
  row: number;
  col: number;
}

export interface PartIncludeOptions {
  pathDelimiter: string;
  includePathDepth: number;
  stripExtension: boolean; 
}

export interface AsyncReplaceOperation {
  match: string;
  operation: (...args: any[]) => Promise<string>;
}
