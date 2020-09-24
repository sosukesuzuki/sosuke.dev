const { format } = require("date-fns");

exports.data = {
  layout: "layout.11ty.js",
};

exports.render = function (data) {
  return `<main>
    <p class="date-text">${format(data.date, "MMMM, dd yyyy")}</p>
    <h1>${data.title}</h1>
    <div>${data.content}</div>
  </main>`;
};
