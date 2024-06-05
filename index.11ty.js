const { format, getYear } = require("date-fns");

function getPostsWithYear(posts) {
  /** @type {Array<any>} */
  const postsWithYear = [];
  posts.forEach((post) => {
    const year = getYear(post.data.date, "yyyy-MM-dd");
    if (!postsWithYear.find((postWithYear) => postWithYear.year === year)) {
      postsWithYear.push({ year, posts: [] });
    }
    postsWithYear.forEach((postWithYear) => {
      if (postWithYear.year === year) {
        postWithYear.posts.push(post);
      }
    });
  });
  return postsWithYear;
}

module.exports = class {
  data() {
    return {
      title: "sosukesuzuki.dev",
      layout: "layout.11ty.js",
      styles: ["/styles/top.css"],
    };
  }
  render({ collections }) {
    const posts = collections.post.sort((a, b) =>
      a.date > b.date ? -1 : a.date < b.date ? 1 : 0,
    );
    const postsWithYear = getPostsWithYear(posts);
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
      <div>
        ${postsWithYear
          .map((postWithYear) => {
            return `<h2>${postWithYear.year}</h2>
            ${postWithYear.posts
              .map((post) => {
                return `<h3 class="blog-post-item">
              ${format(post.data.date, "yyyy-MM-dd")}: <a href=${post.url}>${
                post.data.title
              }</a>
            </h3>`;
              })
              .join("\n")}`;
          })
          .join("\n")}
        </div>
     </div>`;
  }
};
