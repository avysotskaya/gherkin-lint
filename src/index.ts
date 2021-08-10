import * as logger from "./utils/logger";
import { getArgumentsParsed } from "./utils/argsParser";
import { getFeatureFiles } from "./utils/feature-finder";
import { getConfiguration } from "./config/config-parser";
import { isErrorInResults, lint } from "./linter";
import { Format } from "./types";

async function run() {
    const _a = getArgumentsParsed();
    const [args, ignore, dirs, config, format] = [_a._, _a.ignore, _a.dirs, _a.config, _a.format];
    const files = getFeatureFiles(args, ignore);
    const lintConfig = getConfiguration(config, dirs);
    const results = await lint(files, lintConfig, dirs);
    const formatter = await getFormatter(format);
    formatter.printResults(results);
    process.exit(isErrorInResults(results) ? 1 : 0);
}

function getFormatter(format: Format) {
    switch (format) {
    case "json":
        return import("./formatters/json");
    case "xunit":
        return import("./formatters/xunit");
    case "stylish":
        return import("./formatters/stylish");
    default:
        logger.boldError("Unsupported format. The supported formats are json, xunit and stylish.");
        process.exit(1);
        break;
    }
}

run().catch(e => {
    logger.boldError(e);
    process.exit(1);
});
