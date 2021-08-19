const { Octokit } = require("@octokit/rest");
const { format } = require("date-fns");

require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

module.exports = class {
  async data() {
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q:
        "involves:sosukesuzuki -user:sosukesuzuki author:sosukesuzuki is:public ",
      per_page: 100,
      page: 1,
    });
    const items = data.items.map(({ html_url, title, number }) => {
      const splitted = html_url.split("/");
      const repo = `${splitted[3]}/${splitted[4]}`;
      return {
        repo,
        number,
        url: html_url,
        title,
      };
    });
    return {
      title: "sosukesuzuki's GitHub activities",
      layout: "layout.11ty.js",
      description:
        "Latest 100 Issues and Pull Requests created by @sosukesuzuki",
      items,
    };
  }
  render({ items, description }) {
    return `<div>
    <div>
    <h2>My GitHub activities</h2>
    <p>${description}(last fetched: ${format(new Date(), "yyyy/MM/dd")})</p>
    </div>
    <div>
    <ul>
    ${items
      .map(({ title, url, number, repo }) => {
        return `<li>
      <a href="${url}" target="_blank" rel="noopener">${repo}#${number}: ${title}</a>
      </li>`;
      })
      .join("")}
    </ul>
    </div>
    </div>`;
  }
};
