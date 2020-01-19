import React from 'react';
import Helmet from 'react-helmet';
import FA from 'react-fontawesome';
import styled from 'styled-components';
import 'normalize.css';
import 'font-awesome/css/font-awesome.min.css';
import Anchor from './Anchor';

const MAX_WIDTH = '800px';
const HEADER_HEIGHT = '70px';

const Container = styled.div`
    font-family: 'Noto Sans JP', sans-serif;
    padding: 0 10px;
`;
const Header = styled.header`
    max-width: ${MAX_WIDTH};
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    height: ${HEADER_HEIGHT};
    .heading-link {
        color: black;
    }
    h1 {
        margin: 0;
        font-size: 25px;
        line-height: ${HEADER_HEIGHT};
    }
`;
const IconList = styled.div`
    display: flex;
    padding: 20px 0;
    .about-link {
        line-height: ${HEADER_HEIGHT};
        align-self: center;
    }
    .icon {
        margin-left: 10px;
    }
    .github-icon {
        color: #24292e;
    }
    .twitter-icon {
        color: #1da1f2;
    }
`;
const Main = styled.main`
    max-width: ${MAX_WIDTH};
    margin: 0 auto;
    word-wrap: break-word;
    p {
        line-height: 25px;
    }
`;
const Footer = styled.footer`
    max-width: ${MAX_WIDTH};
    margin: 0 auto;
    border-top: 1px solid gray;
    padding: 20px 0;
    margin-top: 30px;
    color: gray;
`;

export default function Layout({ children }) {
    return (
        <Container>
            <Helmet>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <link
                    href="https://fonts.googleapis.com/css?family=Noto+Sans+JP:400,700&display=swap"
                    rel="stylesheet"
                />
            </Helmet>
            <Header>
                <Anchor href="/" className="heading-link" gatsby>
                    <h1>Sosuke Suzuki</h1>
                </Anchor>
                <IconList>
                    <Anchor href="https://github.com/sosukesuzuki">
                        <FA
                            name="github"
                            className="github-icon icon"
                            size="2x"
                        />
                    </Anchor>
                    <Anchor href="https://twitter.com/__sosukesuzuki">
                        <FA
                            name="twitter"
                            className="twitter-icon icon"
                            size="2x"
                        />
                    </Anchor>
                </IconList>
            </Header>
            <Main>{children}</Main>
            <Footer>
                <small>© 2019 Sosuke Suzuki</small>
            </Footer>
        </Container>
    );
}
