import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { graphql } from 'gatsby';
import Anchor from '../components/Anchor';
import logo from '../images/logo.jpeg';

const Profile = styled.div`
    display: flex;
    margin-top: 10px;
    margin-bottom: 30px;
    h2,
    p {
        margin: 0;
        font-size: 15px;
    }
    img {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        margin-right: 10px;
    }
`;
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
            <Profile>
                <img src={logo} alt="sosukesuzuki" />
                <div>
                    <h2>鈴木 颯介</h2>
                    <p>
                        JavaScript と TypeScript と OSS が好きな大学生です。
                        <Anchor gatsby href="/about">
                            詳しくはこちら。
                        </Anchor>
                    </p>
                </div>
            </Profile>
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
