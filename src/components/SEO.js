import React from "react";
import Helmet from "react-helmet";
import { StaticQuery, graphql } from "gatsby";

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

export default function SEO({ title, description }) {
  return (
    <StaticQuery
      query={query}
      render={(data) => {
        const { siteMetadata } = data.site;
        return (
          <Helmet
            title={title || siteMetadata.title}
            meta={[
              {
                name: "description",
                content: description || siteMetadata.description,
              },
              {
                property: "og:url",
                content: "https://sosuke.dev",
              },
              {
                property: "og:title",
                content: title || siteMetadata.title,
              },
              {
                property: "og:description",
                content: description || siteMetadata.description,
              },
              {
                name: "twitter:card",
                content: "summary",
              },
              {
                name: "twitter:creator",
                content: "@__sosukesuzuki",
              },
              {
                name: "twitter:title",
                content: title || siteMetadata.title,
              },
              {
                name: "twitter:description",
                content: description || siteMetadata.description,
              },
            ]}
          />
        );
      }}
    />
  );
}
