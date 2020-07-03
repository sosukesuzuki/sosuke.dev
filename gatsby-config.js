module.exports = {
  siteMetadata: {
    title: "sosuke.dev",
    description: "Sosuke Suzuki のブログです。JavaScript 等についてです。",
  },
  plugins: [
    `gatsby-plugin-sharp`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-twitter`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "sosuke.dev",
        short_name: "sosuke.dev",
        start_url: "/",
        display: `standalone`,
        icon: "src/images/logo.jpeg",
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages/posts`,
        name: "pages",
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-external-links`,
            options: {
              target: "_blank",
            },
          },
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-prismjs`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
        ],
      },
    },
  ],
};
