const fs = require("node:fs");
const path = require("node:path");

const dir = path.join(__dirname, "..", "data");
const file = path.join(dir, "store.json");

function load() {
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({
      warnings: {},
      invites: {},
      social: {},
      settings: {}
    }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { warnings: {}, invites: {}, social: {}, settings: {} };
  }
}

function save(data) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
