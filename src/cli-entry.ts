import * as pa from 'path';
import * as fs from 'fs';

import {
  JsonInc,
  IJsonIncOptions
} from './json-inc';

export class CliEntry {
    static async execute(options: ICompileOptions): Promise<IResult> {
      const jsonInc = new JsonInc(options);
      
      const fullInputPath = options.input.indexOf('/') === -1 ? pa.join(process.cwd(), options.input || '') : options.input;
      const inputPath = pa.parse(fullInputPath);
      
      options.output = options.output || inputPath.dir;
      let fullOutputPath = options.output.indexOf('/') === -1 ? pa.join(process.cwd(), options.output || '') : options.output;
      try {
        const outputStat = fs.lstatSync(fullOutputPath);
        if (outputStat.isDirectory()) {
          fullOutputPath = pa.join(fullOutputPath, 'transpiled-' + inputPath.base);
        }
      } catch(err) {

      }
      
      const contents = fs.readFileSync(fullInputPath).toString();
      const transpiled = await jsonInc.transpile(contents, inputPath.dir);

      fs.writeFileSync(fullOutputPath, transpiled);

      const result: IResult = {
        error: null,
        inputPath: fullInputPath,
        outputPath: fullOutputPath
      }

      return result;
    }
  }

  export interface ICompileOptions extends IJsonIncOptions {
    input: string;
    output: string;
    force: boolean;
    createDirectory: boolean;
  }

  export interface IResult {
    inputPath: string;
    outputPath: string;
    error ? : Error;
  }
