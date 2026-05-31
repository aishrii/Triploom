const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

test("page includes keyboard skip navigation", () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /href="#planner"/);
  assert.match(css, /\.skip-link:focus/);
});

test("major sections have labelled headings", () => {
  assert.match(html, /aria-labelledby="heroTitle"/);
  assert.match(html, /id="heroTitle"/);
  assert.match(html, /aria-labelledby="plannerTitle"/);
  assert.match(html, /id="plannerTitle"/);
  assert.match(html, /aria-labelledby="featuresTitle"/);
  assert.match(html, /id="featuresTitle"/);
});

test("active navigation exposes aria-current", () => {
  assert.match(app, /aria-current/);
  assert.match(css, /a\[aria-current="true"\]/);
});

test("motion-sensitive users get reduced animation", () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /scroll-behavior: auto/);
});

test("voice input controls are labelled and script supports fallback", () => {
  assert.match(html, /id="heroVoiceBtn"/);
  assert.match(html, /aria-label="Use voice input for trip prompt"/);
  assert.match(html, /id="chatVoiceBtn"/);
  assert.match(html, /aria-label="Use voice input for chat"/);
  assert.match(app, /SpeechRecognition/);
  assert.match(app, /Voice input is not supported/);
});
