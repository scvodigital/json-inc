export declare class JsonInc {
    options: IJsonIncOptions;
    constructor(options: IJsonIncOptions);
    transpile(input: string, baseDir?: string, level?: number): string;
    includeStrings(input: string, baseDir: string): string;
    includeJsonAsValue(input: string, baseDir: string, level: number): string;
    includeJsonAsPart(input: string, baseDir: string, level: number): string;
    private checkJson(input);
    private getJsonErrorPostion(input, position);
    private normalizeLineTerminator(input);
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
