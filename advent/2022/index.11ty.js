const { getDate } = require("date-fns");
const { readCSSFiles } = require("../../utils");

module.exports = class {
  data() {
    return {
      title: "2022年 sosukesuzuki 1人アドベントカレンダー",
      layout: "layout.11ty.js",
      css: readCSSFiles(["/styles/top.css"]),
    };
  }
  render(data) {
    const posts = data.collections.advent2022.sort((a, b) =>
      a.date > b.date ? -1 : a.date < b.date ? 1 : 0
    );
    console.log(posts);
    return `<div>
      <h1>2022年 sosukesuzuki 1人アドベントカレンダー</h1>
      <div>
      ${posts
        .map((post) => {
          return `<h3 class="blog-post-item">
        ${getDate(post.data.date)}日目: <a href=${post.url}>${
            post.data.title
          }</a>
      </h3>`;
        })
        .join("\n")}
      </div>
    </div>`;
  }
};
