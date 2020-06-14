import React from "react";
import styled from "styled-components";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { graphql } from "gatsby";
import Anchor from "../components/Anchor";

const BlogPostItem = styled.h3`
  font-size: 15px;
  font-weight: normal;
  margin: 5px 0;
`;
const TagTitle = styled.h2`
  margin: 0;
  margin-bottom: 30px;
`;

export default function Tag({ data, pageContext }) {
  const posts = data.allMarkdownRemark.edges.map((e) => e.node);
  const { tag } = pageContext;
  return (
    <Layout>
      <SEO />
      <TagTitle>{tag}</TagTitle>
      {posts.map((post) => (
        <BlogPostItem key={post.frontmatter.path}>
          <span>{post.frontmatter.date}: </span>
          <Anchor gatsby href={post.frontmatter.path}>
            {post.frontmatter.title}
          </Anchor>
        </BlogPostItem>
      ))}
    </Layout>
  );
}

export const pageQuery = graphql`
  query($tag: String) {
    allMarkdownRemark(
      filter: { frontmatter: { tags: { in: [$tag] } } }
      sort: { order: DESC, fields: [frontmatter___date] }
    ) {
      edges {
        node {
          excerpt(pruneLength: 250)
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
            path
          }
        }
      }
    }
  }
`;
