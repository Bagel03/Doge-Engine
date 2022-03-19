const { readdirSync, writeFileSync } = require("fs");
const { resolve, join } = require("path");
const chalk = require("chalk");

console.log(chalk.blueBright("[Exports] Starting to build exports..."));

const enginePath = resolve(__dirname, "..", "src");

const subDirs = readdirSync(enginePath).filter(
    (str) => str !== "exports.ts" && str !== "types"
);

let files = [];
for (const subDir of subDirs) {
    if (subDir === "types") continue;
    const subFiles = readdirSync(resolve(enginePath, subDir)).map((str) =>
        join("./", subDir, str)
    );
    files = files.concat(
        subFiles
            .filter((str) => !str.endsWith(".json"))
            .map((str) => str.slice(0, str.lastIndexOf(".")).replace("\\", "/"))
    );
}

const str = files.map((str) => `export * from "./${str}";`).join("\n");
writeFileSync(join(enginePath, "exports.ts"), str);
console.log(
    chalk.bold(
        chalk.greenBright("[Exports] Finished building exports, loaded "),
        chalk.cyan(files.length),
        chalk.greenBright(" exports from "),
        chalk.cyan(subDirs.length),
        chalk.greenBright("subdirectories")
    )
);
