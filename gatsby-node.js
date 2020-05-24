const path = require("path");

async function createEntryPages({ actions, graphql, reporter }) {
  const { createPage } = actions;
  const blogPostTemplate = path.resolve(`src/templates/post.js`);
  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `);
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.path,
      component: blogPostTemplate,
      context: {}, // additional data can be passed via context
    });
  });
}

async function createTagPages({ actions, graphql, reporter }) {
  const { createPage } = actions;
  const tagTemplate = path.resolve("./src/templates/tag.js");

  const result = await graphql(`
    {
      allMarkdownRemark {
        group(field: frontmatter___tags) {
          tag: fieldValue
          totalCount
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  const tags = result.data.allMarkdownRemark.group;

  for (const { tag } of tags) {
    const slug = `/tags/${tag}/`;
    createPage({
      path: slug,
      component: tagTemplate,
      context: {
        tag,
        slug,
      },
    });
  }
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  await createEntryPages({ actions, graphql, reporter });
  await createTagPages({ actions, graphql, reporter });
};
