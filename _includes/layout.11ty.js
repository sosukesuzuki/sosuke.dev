const { readCSSFiles } = require("../utils");

function getDescription(data) {
  if (data.description) {
    return data.description;
  } else if (data.page.url.startsWith("/posts")) {
    return data.content
      .replace(/.+<\/p>/, "")
      .replace(/(<([^>]+)>)/gi, "")
      .slice(0, 120);
  } else {
    return "Sosuke Suzuki's personal website";
  }
}

exports.data = {
  title: "sosukesuzuki.dev",
  description: "sosukesuzuki's personal website",
};

exports.render = function (data) {
  const description = getDescription(data);
  const baseUrl = "https://sosukesuzuki.dev";
  const absoluteUrl = data.page.url ? `${baseUrl}${data.page.url}` : baseUrl;
  const year = new Date().getFullYear();
  return /* HTML */ `<!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="shortcut icon" href="/img/favicon.ico" />
        <title>${data.title}</title>

        <style>
          ${readCSSFiles(["/styles/styles.css"])}
        </style>
        ${data.css ? `<style>${data.css}</style>` : ""}
        <meta name="author" content="Sosuke Suzuki" />

        <meta name="description" content="${description}" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@__sosukesuzuki" />
        <meta name="twitter:url" content="${absoluteUrl}" />
        <meta name="twitter:description" content="${description}" />
        <meta
          name="twitter:image"
          content="https://sosukesuzuki.dev/img/large-logo.jpeg"
        />

        <meta property="og:type" content="article" />
        <meta property="og:url" content="${absoluteUrl}" />
        <meta property="og:title" content="${data.title}" />
        <meta property="og:site_name" content="sosukesuzuki.dev" />
        <meta property="og:description" content="${description}" />
        <meta
          property="og:image"
          content="https://sosukesuzuki.dev/img/large-logo.jpeg"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="Atom Feed"
          href="https://sosukesuzuki.dev/feed.xml"
        />
      </head>
      <body>
        <header>
          <h1><a href="/">sosukesuzuki.dev</a></h1>
          <div class="icons">
            <a href="https://github.com/sosukesuzuki">
              <img
                src="/img/github-icon.png"
                class="icon github-icon"
                width="30"
                height="30"
              />
            </a>
            <a href="https://twitter.com/__sosukesuzuki">
              <img
                src="/img/twitter-icon.png"
                class="icon twitter-icon"
                width="50"
                height="50"
              />
            </a>
          </div>
        </header>
        <main>${data.content}</main>
        <footer>
          <small>© ${year} Sosuke Suzuki</small>
        </footer>
      </body>
    </html>`;
};
