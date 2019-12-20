import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { graphql } from 'gatsby';
import { Link } from 'gatsby';

const BlogPostItem = styled(Link)`
    display: block;
    text-decoration: none;
    color: black;
    margin-top: 10px;
    margin-bottom: 50px;
    .post-title {
        font-size: 24px;
        margin: 5px 0;
    }
    .date {
        color: gray;
        margin: 15px 0;
    }
    .description {
        margin: 5px 0;
        font-size: 15px;
    }
`;

function Home({ data }) {
    const posts = data.allMarkdownRemark.edges.map(edges => edges.node);
    return (
        <Layout>
            <SEO />
            {posts.map(post => (
                <BlogPostItem
                    key={post.frontmatter.title}
                    to={post.frontmatter.path}
                >
                    <h3 className="post-title">{post.frontmatter.title}</h3>
                    <p className="date">{post.frontmatter.date}</p>
                    <p className="description">{post.excerpt}</p>
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
                        date(formatString: "MMMM DD, YYYY")
                        path
                    }
                }
            }
        }
    }
`;

export default Home;
