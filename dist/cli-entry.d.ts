import { IJsonIncOptions } from './json-inc';
export declare class CliEntry {
    static execute(options: ICompileOptions): Promise<IResult>;
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
    error?: Error;
}
