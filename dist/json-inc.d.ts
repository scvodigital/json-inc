export declare class JsonInc {
    options: IJsonIncOptions;
    constructor(options: IJsonIncOptions);
    transpile(input: string, baseDir?: string, level?: number): Promise<string>;
    includeStringsAsValue(input: string, baseDir: string): Promise<string>;
    includeStringsAsPart(input: string, baseDir: string): Promise<string>;
    includeJsonAsValue(input: string, baseDir: string, level: number): Promise<string>;
    includeJsonAsPart(input: string, baseDir: string, level: number): Promise<string>;
    private checkJson(input);
    private getJsonErrorPostion(input, position);
    private normalizeLineTerminator(input);
    private getPartKey(path, options, glob);
    private getPartIncludeOptions(argsString);
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
export interface PartIncludeOptions {
    pathDelimiter: string;
    includeRelativePath: boolean;
    stripExtension: boolean;
}
export interface AsyncReplaceOperation {
    match: string;
    operation: (...args: any[]) => Promise<string>;
}
