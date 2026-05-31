const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

test("frontend does not contain demo password or Gemini key controls", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

  assert.doesNotMatch(app, /Triploom@123/);
  assert.doesNotMatch(app, /GEMINI_API_KEY/);
  assert.doesNotMatch(html, /Paste Gemini API key/i);
  assert.doesNotMatch(html, /Save key/i);
});

test("real env file remains ignored by git", () => {
  const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^!\.env\.example$/m);
});
