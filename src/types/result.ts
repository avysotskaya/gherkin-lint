export type ResultError = {
    line: number;
    message: string;
    rule: string;
};
export type Result = {
    errors: null | ResultError[];
    filePath: string;
};
export type FatalError = { data: any; };
