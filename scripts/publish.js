const { version } = require("../package.json");
const { join } = require("path");
const { readFileSync, writeFileSync } = require("fs");
const { execSync } = require("child_process");
const chalk = require("chalk");
const args = process.argv.slice(2);

console.log(chalk.blueBright("[Publishing] Preparing to publish..."));

const dry = args.includes("--dry") || args.includes("-d");
const verbose = args.includes("--verbose");

// The version string ("version"="x.x.x")

const versionIdx =
    args.find((str) => str.startsWith("--setv")) || // If we have -v use it
    `"-v="` + // Otherwise add 1 to the final x
        version.slice(0, version.lastIndexOf(".")) +
        "." +
        (parseInt(version.slice(version.lastIndexOf(".") + 1)) + 1) +
        '"';

const newVersion = versionIdx.split("=")[1];
console.log(
    chalk.blueBright("[Publishing] Updating version to "),
    chalk.cyanBright('"' + newVersion + '"')
);

if (version === newVersion && !dry) {
    console.log(
        chalk.bold(
            chalk.redBright(
                "[Publishing] Versions match, refusing to publish (v"
            ),
            chalk.cyan(version),
            chalk.redBright(")")
        )
    );
    process.kill();
}

const filePath = join(__dirname, "..", "package.json");
const file = readFileSync(filePath).toString();
const newStr = file.replace(
    `"version": "${version}",`,
    `"version": ${newVersion},`
);
writeFileSync(filePath, newStr);

console.log(chalk.blueBright("[Publishing] Uploading to npm..."));

const stdout = execSync(`npm publish${dry ? " --dry-run" : ""}`, {
    cwd: join(__dirname, ".."),
});

console.log(chalk.greenBright("[Publishing] Finished uploading to npm..."));
if (verbose) console.log(stdout);
