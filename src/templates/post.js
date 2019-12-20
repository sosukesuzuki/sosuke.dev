import React from 'react';
import styled from 'styled-components';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import 'github-markdown-css';

const BlogPost = styled.div`
    .markdonw-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
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
