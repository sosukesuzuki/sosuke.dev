import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { graphql } from 'gatsby';
import Anchor from '../components/Anchor';

const BlogPostItem = styled.h3`
    font-size: 15px;
    font-weight: normal;
    margin: 5px 0;
`;

export default function Index({ data }) {
    const posts = data.allMarkdownRemark.edges.map(edges => edges.node);
    return (
        <Layout>
            <SEO />
            {posts.map(post => (
                <BlogPostItem>
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
    query IndexQuery {
        allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
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
