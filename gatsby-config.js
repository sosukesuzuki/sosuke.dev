module.exports = {
    siteMetadata: {
        title: '鈴木颯介 / Sosuke Suzuki',
        description: 'Sosuke Suzuki のブログです。JavaScript 等についてです。',
    },
    plugins: [
        `gatsby-plugin-styled-components`,
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: '鈴木颯介 / Sosuke Suzuki',
                short_name: 'starter',
                start_url: '/',
                display: `standalone`,
                icon: 'src/images/logo.jpeg',
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/src/pages/posts`,
                name: 'pages',
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: `gatsby-remark-external-links`,
                        options: {
                            target: '_blank',
                        },
                    },
                    `gatsby-remark-autolink-headers`,
                    `gatsby-remark-prismjs`,
                ],
            },
        },
    ],
};
