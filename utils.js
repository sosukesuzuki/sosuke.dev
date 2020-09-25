const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");

function readCSSFiles(pathes) {
  const css = pathes.reduce((content, currentPath) => {
    const css = fs.readFileSync(path.join(".", currentPath), "utf-8");
    return `${content}\n${css}`;
  }, "");
  return new CleanCSS({}).minify(css).styles;
}

module.exports = { readCSSFiles };
