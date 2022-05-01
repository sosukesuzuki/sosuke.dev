const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const rss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(rss);
  eleventyConfig.setLibrary(
    "md",
    require("markdown-it")({
      html: true,
      breaks: true,
      linkify: true,
    })
  );
};
