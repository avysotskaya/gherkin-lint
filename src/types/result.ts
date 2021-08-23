export type ResultError = {
    errorLevel?: ErrorLevel;
    line: number;
    message: string;
    rule: string;
};

export type Result = {
    errors: null | ResultError[];
    filePath: string;
};
export type FatalError = { data: any; };

export enum ErrorLevel {
    Error = 0,
    Warn = 1
}
