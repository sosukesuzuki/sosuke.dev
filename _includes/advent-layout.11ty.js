const { format } = require("date-fns");
const base = require("./article-layout.11ty");

module.exports = {
  ...base,
  render(data) {
    const date = data.date.getDate();
    const year = data.date.getFullYear();
    return `
    <p style="margin-bottom: 24px;">
      <a href="/advent/2022">2022年 sosukesuzuki １人アドベントカレンダー</a>
    </p>
    <p class="date-text">${format(data.date, "MMMM, dd yyyy")}</p>
    <div class="post">
      <h1>${data.title}</h1>
      <p style="margin-bottom: 24px;">
        <b>${year}年の sosukesuzuki 1人アドベントカレンダー ${date} 日目です。</b>
      </p>
      <div>${data.content}</div>
    </div>`;
  },
};
