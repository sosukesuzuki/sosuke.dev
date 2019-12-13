import React from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';

const query = graphql`
    query GetSiteMetadata {
        site {
            siteMetadata {
                title
                description
            }
        }
    }
`;

function SEO({ title, description }) {
    return (
        <StaticQuery
            query={query}
            render={data => {
                const { siteMetadata } = data.site;
                return (
                    <Helmet
                        title={title || siteMetadata.title}
                        description={description || siteMetadata.description}
                    />
                );
            }}
        />
    );
}

export default SEO;
