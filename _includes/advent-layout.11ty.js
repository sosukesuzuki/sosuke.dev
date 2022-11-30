const { format } = require("date-fns");
const base = require("./article-layout.11ty");

module.exports = {
  ...base,
  render(data) {
    console.log({ data });
    return `<p class="date-text">${format(data.date, "MMMM, dd yyyy")}</p>
    <div class="post">
      <h1>${data.title}</h1>
      <p>
      <b">${format(
        data.date,
        "yyyy 年の一人アドベントカレンダー dd 日目です。"
      )}</b>
      </p>
      <div>${data.content}</div>
    </div>`;
  },
};
