"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pa = require("path");
var fs = require("fs");
var qs = require("querystring");
var dot = require("dot-object");
var glob = require("glob-promise");
var maxDepthLimit = 100;
var JsonInc = /** @class */ (function () {
    function JsonInc(options) {
        this.options = {
            maxDepth: 4,
            debugLineLength: 255,
            resumeOnError: false,
            fileExtension: '.inc.json'
        };
        Object.assign(this.options, options);
        if (this.options.maxDepth > maxDepthLimit) {
            this.options.maxDepth = maxDepthLimit;
            console.warn('It looks like you\'re trying to set a silly maximum depth. Resetting it to', maxDepthLimit);
        }
    }
    JsonInc.prototype.transpile = function (input, baseDir, level) {
        if (baseDir === void 0) { baseDir = null; }
        if (level === void 0) { level = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (level > this.options.maxDepth) {
                            throw new Error('To many recursive calls deep. Maximum depth: ' + this.options.maxDepth);
                        }
                        if (!baseDir) {
                            baseDir = process.cwd();
                            console.warn('No base directory for JSON file provided, defaulting to current process directory:', baseDir);
                        }
                        if (!input) {
                            return [2 /*return*/, null];
                        }
                        output = this.normalizeLineTerminator(input);
                        output = this.checkJson(output);
                        return [4 /*yield*/, this.includeStringsAsValue(output, baseDir)];
                    case 1:
                        output = _a.sent();
                        return [4 /*yield*/, this.includeStringsAsPart(output, baseDir)];
                    case 2:
                        output = _a.sent();
                        return [4 /*yield*/, this.includeJsonAsValue(output, baseDir, level)];
                    case 3:
                        output = _a.sent();
                        return [4 /*yield*/, this.includeJsonAsPart(output, baseDir, level)];
                    case 4:
                        output = _a.sent();
                        output = this.checkJson(output);
                        return [2 /*return*/, output];
                }
            });
        });
    };
    JsonInc.prototype.includeStringsAsValue = function (input, baseDir) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var replaceOperations_1, i, replaceOperation, replace, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        replaceOperations_1 = [];
                        input = input.replace(/(?:"\{\$)(.*?)(?:\}")(?:[\s\n\r]*?)(,|]|})/ig, function (all, path, end) {
                            var operation = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var fullImportPath, output, files, parts, f, file, contents, jsonSafe;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            fullImportPath = pa.join(baseDir, path);
                                            output = '';
                                            return [4 /*yield*/, glob(fullImportPath)];
                                        case 1:
                                            files = _a.sent();
                                            parts = [];
                                            for (f = 0; f < files.length; f++) {
                                                file = files[f];
                                                contents = fs.readFileSync(file).toString();
                                                jsonSafe = JSON.stringify(contents);
                                                parts.push(jsonSafe);
                                            }
                                            output = parts.join(',\n');
                                            output += end;
                                            return [2 /*return*/, output];
                                    }
                                });
                            }); };
                            replaceOperations_1.push({ match: all, operation: operation });
                            return all;
                        });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < replaceOperations_1.length)) return [3 /*break*/, 4];
                        replaceOperation = replaceOperations_1[i];
                        return [4 /*yield*/, replaceOperation.operation()];
                    case 2:
                        replace = _a.sent();
                        input = input.split(replaceOperation.match).join(replace);
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        console.error('Error Including Strings as Value:', err_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, input];
                }
            });
        });
    };
    JsonInc.prototype.includeStringsAsPart = function (input, baseDir) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var replaceOperations_2, i, replaceOperation, replace, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        replaceOperations_2 = [];
                        input = input.replace(/(?:"\{\$)(.*?)(?:\}")(?::\s*")(.*?)(?:")(?:[\s\n\r]*?)(,|]|})/ig, function (all, path, argsString, end) {
                            var match = '"%%MATCH.' + Math.random().toString() + '%%"';
                            var operation = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var options, fullImportPath, files, parts, f, file, contents, jsonSafe, key, contents;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            options = this.getPartIncludeOptions(argsString);
                                            fullImportPath = pa.join(baseDir, path);
                                            return [4 /*yield*/, glob(fullImportPath)];
                                        case 1:
                                            files = _a.sent();
                                            parts = [];
                                            for (f = 0; f < files.length; ++f) {
                                                file = files[f];
                                                contents = fs.readFileSync(file).toString();
                                                jsonSafe = JSON.stringify(contents);
                                                key = this.getPartKey(file, options);
                                                parts.push('"' + key + '": ' + jsonSafe);
                                            }
                                            contents = parts.join(',\n');
                                            contents += end;
                                            return [2 /*return*/, contents];
                                    }
                                });
                            }); };
                            replaceOperations_2.push({ match: all, operation: operation });
                            return all;
                        });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < replaceOperations_2.length)) return [3 /*break*/, 4];
                        replaceOperation = replaceOperations_2[i];
                        return [4 /*yield*/, replaceOperation.operation()];
                    case 2:
                        replace = _a.sent();
                        input = input.split(replaceOperation.match).join(replace);
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_2 = _a.sent();
                        console.error('Error Including Strings as Part:', err_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, input];
                }
            });
        });
    };
    JsonInc.prototype.includeJsonAsValue = function (input, baseDir, level) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var replaceOperations_3, i, replaceOperation, replace, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        replaceOperations_3 = [];
                        input = input.replace(/(?:"\{\:)(.*?)(@.+?)?(?:\}")(?:[\s\n\r]*?)(,|]|})/ig, function (all, filePath, objectPath, end) {
                            var match = '"%%MATCH.' + Math.random().toString() + '%%"' + end;
                            var operation = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var fullImportPath, output, files, parts, f, file, contents, importDir, obj, json;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            fullImportPath = pa.join(baseDir, filePath);
                                            output = '';
                                            return [4 /*yield*/, glob(fullImportPath)];
                                        case 1:
                                            files = _a.sent();
                                            parts = [];
                                            f = 0;
                                            _a.label = 2;
                                        case 2:
                                            if (!(f < files.length)) return [3 /*break*/, 5];
                                            file = files[f];
                                            contents = fs.readFileSync(file).toString();
                                            importDir = pa.dirname(fullImportPath);
                                            return [4 /*yield*/, this.transpile(contents, importDir, level + 1)];
                                        case 3:
                                            contents = _a.sent();
                                            obj = JSON.parse(contents);
                                            if (objectPath) {
                                                objectPath = objectPath.substr(1);
                                                obj = dot.pick(objectPath, obj);
                                            }
                                            json = JSON.stringify(obj, null, 4);
                                            parts.push(json);
                                            _a.label = 4;
                                        case 4:
                                            f++;
                                            return [3 /*break*/, 2];
                                        case 5:
                                            output = parts.join(',\n');
                                            output += end;
                                            return [2 /*return*/, output];
                                    }
                                });
                            }); };
                            replaceOperations_3.push({ match: all, operation: operation });
                            return all;
                        });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < replaceOperations_3.length)) return [3 /*break*/, 4];
                        replaceOperation = replaceOperations_3[i];
                        return [4 /*yield*/, replaceOperation.operation()];
                    case 2:
                        replace = _a.sent();
                        input = input.split(replaceOperation.match).join(replace);
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_3 = _a.sent();
                        console.error('Error Including JSON as Value:', err_3);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, input];
                }
            });
        });
    };
    JsonInc.prototype.includeJsonAsPart = function (input, baseDir, level) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var replaceOperations_4, i, replaceOperation, replace, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        replaceOperations_4 = [];
                        input = input.replace(/(?:"\{\#)(.*?)(@.+?)?(?:\}")(?::\s*")(.*?)(?:")(?:[\s\n\r]*?)(,|]|})/ig, function (all, filePath, objectPath, argsString, end) {
                            var operation = function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var options, fullImportPath, files, parts, f, file, contents, importDir, obj, json, lines, key, contents;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            options = this.getPartIncludeOptions(argsString);
                                            fullImportPath = pa.join(baseDir, filePath);
                                            return [4 /*yield*/, glob(fullImportPath)];
                                        case 1:
                                            files = _a.sent();
                                            parts = [];
                                            f = 0;
                                            _a.label = 2;
                                        case 2:
                                            if (!(f < files.length)) return [3 /*break*/, 5];
                                            file = files[f];
                                            contents = fs.readFileSync(file).toString();
                                            importDir = pa.dirname(fullImportPath);
                                            return [4 /*yield*/, this.transpile(contents, importDir, level + 1)];
                                        case 3:
                                            contents = _a.sent();
                                            obj = JSON.parse(contents);
                                            if (objectPath) {
                                                objectPath = objectPath.substr(1);
                                                obj = dot.pick(objectPath, obj);
                                            }
                                            json = JSON.stringify(obj, null, 4);
                                            lines = json.split(/\n/ig);
                                            lines.shift();
                                            lines.pop();
                                            json = lines.join('\n');
                                            key = this.getPartKey(file, options);
                                            parts.push('"' + key + '": ' + json);
                                            _a.label = 4;
                                        case 4:
                                            ++f;
                                            return [3 /*break*/, 2];
                                        case 5:
                                            contents = parts.join(',\n');
                                            contents += end;
                                            return [2 /*return*/, contents];
                                    }
                                });
                            }); };
                            replaceOperations_4.push({ match: all, operation: operation });
                            return all;
                        });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < replaceOperations_4.length)) return [3 /*break*/, 4];
                        replaceOperation = replaceOperations_4[i];
                        return [4 /*yield*/, replaceOperation.operation()];
                    case 2:
                        replace = _a.sent();
                        input = input.split(replaceOperation.match).join(replace);
                        _a.label = 3;
                    case 3:
                        ++i;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_4 = _a.sent();
                        console.error('Error Including JSON as Part:', err_4);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, input];
                }
            });
        });
    };
    JsonInc.prototype.checkJson = function (input) {
        var err, obj;
        try {
            obj = JSON.parse(input);
        }
        catch (err) {
            var character = err.message.match(/(?:position\s)(\d+)/)[0] || null;
            character = character.replace(/[^\d]/g, '');
            var position = this.getJsonErrorPostion(input, Number(character));
            var lines = input.split(/\n/g);
            var debugStartLine = Math.max(position.row - 50, 0);
            var debugEndLine = Math.min(position.row + 50, lines.length - 1);
            var debugMessage = [];
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
    };
    JsonInc.prototype.getJsonErrorPostion = function (input, position) {
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
    };
    JsonInc.prototype.normalizeLineTerminator = function (input) {
        var output = input.replace(/\r\n/g, '\n');
        return output;
    };
    JsonInc.prototype.getPartKey = function (path, options) {
        var stringPath = pa.parse(path);
        var key = options.stripExtension ? stringPath.name : stringPath.base;
        if (options.includePathDepth > 0) {
            var pathParts = stringPath.dir.split('/');
            var relevantParts = pathParts.slice(pathParts.length - options.includePathDepth);
            key = relevantParts.join(options.pathDelimiter) + options.pathDelimiter + key;
        }
        return key;
    };
    JsonInc.prototype.getPartIncludeOptions = function (argsString) {
        var args = qs.parse(argsString);
        var options = {
            includePathDepth: 0,
            pathDelimiter: '_',
            stripExtension: true
        };
        if (args.includePathDepth) {
            if (Array.isArray(args.includePathDepth)) {
                options.includePathDepth = Number(args.includePathDepth[0]) || 0;
            }
            else {
                options.includePathDepth = Number(args.includePathDepth) || 0;
            }
        }
        if (args.pathDelimiter) {
            if (Array.isArray(args.pathDelimiter)) {
                options.pathDelimiter = args.pathDelimiter[0] || '';
            }
            else {
                options.pathDelimiter = args.pathDelimiter || '';
            }
        }
        if (Object.prototype.hasOwnProperty.call(args, 'stripExtension')) {
            if (Array.isArray(args.stripExtension)) {
                options.stripExtension = Boolean(args.stripExtension[0]);
            }
            else {
                options.stripExtension = Boolean(args.stripExtension);
            }
        }
        return options;
    };
    return JsonInc;
}());
exports.JsonInc = JsonInc;
//# sourceMappingURL=json-inc.js.map