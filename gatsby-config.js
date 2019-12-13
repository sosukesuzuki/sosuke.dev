module.exports = {
    siteMetadata: {
        title: '鈴木颯介 / Sosuke Suzuki',
        description: "sosukesuzuki's personal website",
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
    ],
};
