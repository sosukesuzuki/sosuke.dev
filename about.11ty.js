const education = [
  {
    name: "University of Tsukuba",
    period: "Apr 2019 – Mar 2025",
    description: "B.E. in Information Science",
  },
];

const work = [
  {
    name: "Anthropic",
    url: "https://www.anthropic.com",
    role: "Member of Technical Staff",
    period: "Dec 2025 – present",
    description:
      "Working on the Claude Code and Bun JS runtime teams, focusing on Claude Code CLI performance, upstream JavaScriptCore optimizations and bug fixes, and Bun–JavaScriptCore integration.",
  },
  {
    name: "Bun",
    url: "https://bun.sh",
    role: "Systems Engineer",
    period: "Aug 2025 – Dec 2025",
    description:
      "Worked on upstream JavaScriptCore optimization and bug fixes, and Bun–JavaScriptCore integration. Acquired by Anthropic.",
  },
  {
    name: "Ubie",
    url: "https://ubie.life",
    role: "Product Engineer",
    period: "Mar 2022 – Aug 2025",
    description:
      "Contributed to product development within a scrum team, worked as a full-stack engineer on a new business, integrated two Next.js applications, and more.",
  },
];

const activities = [
  {
    name: "WebKit",
    url: "https://webkit.org",
    role: "Reviewer (Feb 2025 – present), Committer (Aug 2024 – Feb 2025)",
    period: "Feb 2024 – present",
    description:
      "Working on JavaScriptCore. Merged 600+ patches covering spec-compliance fixes, JIT compiler optimizations, builtin function optimizations, and new ECMAScript feature implementations (e.g., <code>using</code>, <code>import defer</code>).",
  },
  {
    name: "Prettier",
    url: "https://prettier.io",
    role: "Maintainer",
    period: "Sep 2019 – Aug 2025",
    description:
      "Worked across bug fixes, new feature implementation, code review, issue triage, release blog writing, release management, and shipping releases.",
  },
];

function renderEntries(entries) {
  return entries
    .map(
      (e) => `<li class="entry">
        <div class="entry-head">
          <span class="entry-name">${
            e.url ? `<a href="${e.url}">${e.name}</a>` : e.name
          }</span>
          <span class="entry-period">${e.period}</span>
        </div>
        ${e.role ? `<div class="entry-role">${e.role}</div>` : ""}
        <p class="entry-desc">${e.description}</p>
      </li>`,
    )
    .join("\n");
}

function renderSection(title, entries) {
  return `<section class="about-section">
    <h2>${title}</h2>
    <ul class="entries">${renderEntries(entries)}</ul>
  </section>`;
}

module.exports = class {
  data() {
    return {
      title: "About - sosukesuzuki.dev",
      layout: "layout.11ty.js",
      styles: ["/styles/about.css"],
      permalink: "/about/",
    };
  }
  render() {
    return `<div class="about">
      <div class="about-hero">
        <img src="/img/logo.jpeg" width="80" height="80" alt="sosukesuzuki logo">
        <div class="about-hero-body">
          <h1>Sosuke Suzuki</h1>
          <ul class="about-links">
            <li><a href="mailto:aosukeke@gmail.com">aosukeke@gmail.com</a></li>
            <li><a href="https://sosukesuzuki.dev">sosukesuzuki.dev</a></li>
            <li><a href="https://github.com/sosukesuzuki">github.com/sosukesuzuki</a></li>
            <li><a href="https://twitter.com/__sosukesuzuki">@__sosukesuzuki</a></li>
          </ul>
        </div>
      </div>
      ${renderSection("Work Experience", work)}
      ${renderSection("Activities", activities)}
      ${renderSection("Education", education)}
    </div>`;
  }
};
