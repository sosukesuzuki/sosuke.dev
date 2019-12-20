import React from 'react';
import styled from 'styled-components';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const BlogPost = styled.div`
    a {
        color: #1971c2;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
`;
const DateText = styled.p`
    color: gray;
`;

export default function PostTemplate({ data }) {
    const { markdownRemark: post } = data;
    return (
        <Layout>
            <SEO title={post.frontmatter.title} description={post.excerpt} />
            <BlogPost>
                <div className="markdown-body">
                    <DateText>{post.frontmatter.date}</DateText>
                    <h1>{post.frontmatter.title}</h1>
                    <div
                        className="blog-post-content"
                        dangerouslySetInnerHTML={{ __html: post.html }}
                    />
                </div>
            </BlogPost>
        </Layout>
    );
}
export const pageQuery = graphql`
    query BlogPostByPath($path: String!) {
        markdownRemark(frontmatter: { path: { eq: $path } }) {
            html
            frontmatter {
                date(formatString: "MMMM DD, YYYY")
                path
                title
            }
        }
    }
`;
