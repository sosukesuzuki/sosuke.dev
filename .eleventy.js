const rss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("styles");
  eleventyConfig.addPlugin(rss);
  eleventyConfig.setLibrary(
    "md",
    require("markdown-it")({
      html: true,
      linkify: true,
    }).use(require('markdown-it-footnote')),
  );

  // Configuration for using Shiki
  eleventyConfig.amendLibrary("md", (md) => {});
  eleventyConfig.on('eleventy.before', async () => {
    const Shiki = (await import("@shikijs/markdown-it")).default;
    const shiki = await Shiki({ theme: 'one-dark-pro' });
    eleventyConfig.amendLibrary("md", (md) => md.use(shiki));
  })
};
