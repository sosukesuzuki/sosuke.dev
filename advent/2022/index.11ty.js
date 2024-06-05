const { getDate } = require("date-fns");

module.exports = class {
  data() {
    return {
      title: "2022年 sosukesuzuki 1人アドベントカレンダー",
      layout: "layout.11ty.js",
      styles: ["/styles/top.css"],
    };
  }
  render(data) {
    const posts = data.collections.advent2022.sort((a, b) =>
      a.date > b.date ? 1 : a.date < b.date ? -1 : 0,
    );
    return `<div>
    <div class="profile">
        <img src="/img/logo.jpeg" alt="sosukesuzuki">
        <div>
          <a href="/about">
            <h2>Sosuke Suzuki</h2>
          </a>
          <p>Software Enginner at <a href="https://ubie.life">Ubie,inc</a></p>
        </div>
      </div>
      <h3>2022年 sosukesuzuki 1人アドベントカレンダー</h3>
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
