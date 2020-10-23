const { format } = require("date-fns");
const { readCSSFiles } = require("../utils");

module.exports = {
  data: {
    layout: "layout.11ty.js",
    css: readCSSFiles(["/styles/post.css", "/styles/prism-dracula.css"]),
  },
  render: function (data) {
    return `<p class="date-text">${format(data.date, "MMMM, dd yyyy")}</p>
      <h1>${data.title}</h1>
      <div class="markdown-body">${data.content}</div>`;
  },
};
