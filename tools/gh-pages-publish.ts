const { cd, exec, echo, touch } = require("shelljs");
const fs = require("fs");
const url = require("url");

let repoUrl;
let package = JSON.parse(fs.readFileSync("package.json") as any);
if (typeof package.repository === "object") {
    if (!package.repository.hasOwnProperty("url")) {
        throw new Error("URL does not exist in repository section");
    }
    repoUrl = package.repository.url;
} else {
    repoUrl = package.repository;
}

let parsedUrl = url.parse(repoUrl);
let repository = (parsedUrl.host || "") + (parsedUrl.path || "");
let ghToken = process.env.GH_TOKEN;

echo("Deploying docs!!!");
cd("docs");
touch(".nojekyll");
exec("git init");
exec("git add .");
exec('git config user.name "str"');
exec('git config user.email "str_ie@yahoo.co.uk"');
exec('git commit -m "docs(docs): update gh-pages"');
exec(`git push --force --quiet "https://${ghToken}@${repository}" master:gh-pages`);
echo("Docs deployed!!");
