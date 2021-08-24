import { Result } from "../types";
import stripAnsi from "strip-ansi";

export function printResults(results: Result[]) {
    results.forEach(result=> result.errors?.forEach(error => error.message = stripAnsi(error.message)));
    process.stdout.write(JSON.stringify(results));
}
