const { format } = require("date-fns");
const { readCSSFiles } = require("./utils");

module.exports = class {
  data() {
    return {
      title: "sosuke.dev",
      layout: "layout.11ty.js",
      css: readCSSFiles(["/styles/top.css"]),
    };
  }
  render({ collections }) {
    return `<div>
      <div class="profile">
        <img src="/img/logo.jpeg" alt="sosukesuzuki">
        <div>
          <a href="/about">
            <h2>Sosuke Suzuki</h2>
          </a>
          <p>Undergraduate student / Web developer / Maintainer of Prettier</p>
        </div>
      </div>
      <div>
        ${collections.post
          .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
          .map(
            (post) =>
              `<h3 class="blog-post-item">
                ${format(post.data.date, "yyyy-MM-dd")}: <a href=${post.url}>${
                post.data.title
              }</a>
              </h3>`
          )
          .join("\n")}
        </div>
     </div>`;
  }
};
