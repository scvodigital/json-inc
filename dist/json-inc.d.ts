export declare class JsonInc {
    options: IJsonIncOptions;
    constructor(options: IJsonIncOptions);
    transpile(input: string, baseDir?: string, level?: number): Promise<string>;
    includeStringsAsValue(input: string, baseDir: string): Promise<string>;
    includeStringsAsPart(input: string, baseDir: string): Promise<string>;
    includeJsonAsValue(input: string, baseDir: string, level: number): Promise<string>;
    includeJsonAsPart(input: string, baseDir: string, level: number): Promise<string>;
    private checkJson;
    private getJsonErrorPostion;
    private normalizeLineTerminator;
    private getPartKey;
    private getPartIncludeOptions;
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
    regexExpression?: string;
    regexOptions?: string;
    regexReplace?: string;
}
export interface AsyncReplaceOperation {
    match: string;
    operation: (...args: any[]) => Promise<string>;
}
