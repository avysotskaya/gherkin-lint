import { Result } from "../types";

export function printResults(results: Result[]) {
    process.stdout.write(JSON.stringify(results));
}
