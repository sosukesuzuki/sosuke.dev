const { readCSSFiles } = require("../utils");

exports.data = {
  title: "sosuke.dev",
  description: "sosukesuzuki's personal website",
};

exports.render = function (data) {
  const description = data.page.url.startsWith("/posts")
    ? data.content
        .replace(/.+<\/p>/, "")
        .replace(/(<([^>]+)>)/gi, "")
        .slice(0, 120)
    : "sosukesuzuki's personal website";
  return `<!doctype html>
  <html lang="ja">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <link rel="shortcut icon" href="/img/favicon.ico">
      <title>${data.title}</title>

      <style>${readCSSFiles(["/styles/styles.css"])}</style>
      ${data.css ? `<style>${data.css}</style>` : ""}
      <meta name=author content="Sosuke Suzuki">

      <meta name=description content="${description}">

      <meta name=twitter:card content=summary>
      <meta name=twitter:site content=@__sosukesuzuki>
      <meta name=twitter:url content=https://sosuke.dev>
      <meta name=twitter:description content="${description}">
      <meta name=twitter:image content=https://sosuke.dev/img/logo.jpeg>

      <meta property=og:type content=article>
      <meta property=og:url content=https://sosuke.dev>
      <meta property=og:title content=${data.title}>
      <meta property=og:site_name content=sosuke.dev>
      <meta property=og:description content="${description}">
      <meta property=og:image content=https://sosuke.dev/img/logo.jpeg>
    </head>
    <body>
      <header>
        <h1><a href="/">sosuke.dev</a></h1>
        <div class="icons">
          <a href="https://github.com/sosukesuzuki">
            <img src="/img/github-icon.png" class="icon github-icon">
          </a>
          <a href="https://twitter.com/__sosukesuzuki">
            <img src="/img/twitter-icon.png" class="icon twitter-icon">
          </a>
        </div>
      </header>
      <main>
        ${data.content}
      </main>
      <footer>
        <small>© 2019 Sosuke Suzuki</small>
      </footer>
    </body>
  </html>`;
};
