const { execSync } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const chalk = require("chalk");
const { version } = require("../package.json");

const options = [
    "out-file",
    "typings/types.d.ts",
    "project",
    "tsconfig.types.json",
    "no-check",
    "",
    "no-banner",
    "",
];

let optionsStr = "";
for (let i = 0; i < options.length; i += 2) {
    if (options[i + 1] == "") optionsStr += `--${options[i]} `;
    else optionsStr += `--${options[i]}=${options[i + 1]} `;
}

console.log(chalk.blueBright("[Typings] Starting to build typings..."));

execSync(
    `dts-bundle-generator src/exports.ts ${optionsStr}`,
    {
        cwd: join(__dirname, ".."),
    },
    (err) => {
        console.error("Error", err);
    }
);

console.log(chalk.greenBright("[Typings] Finished building typings"));
console.log(chalk.blueBright("[Typings] Processing typings..."));

// Add the banner
const banner = `\tDoge Engine v${version} ©Bagel03 2022
    Thanks to "dts-bundle-generator" for deceleration merging: https://www.npmjs.com/package/dts-bundle-generator`;

const path = join(__dirname, "..", "typings", "types.d.ts");
const file = readFileSync(path);
const str = "/*\n" + banner + "\n*/\n" + file;
writeFileSync(path, str);

console.log(chalk.greenBright("[Typings] Finished processing typings"));
console.log(chalk.bold(chalk.greenBright("[Typings] Finished typings")));
