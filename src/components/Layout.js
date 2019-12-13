import React from 'react';
import FA from 'react-fontawesome';
import styled from 'styled-components';
import 'normalize.css';
import 'font-awesome/css/font-awesome.min.css';
import 'typeface-lato';
import Anchor from './Anchor';

const Container = styled.div`
    font-size: 14px;
    width: 100vw;
    font-family: Lato;
    a {
        color: #1971c2;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
`;
const Header = styled.header`
    width: 600px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    height: 70px;
    h1 {
        margin: 0;
        line-height: 70px;
    }
`;
const IconList = styled.div`
    display: flex;
    padding: 20px 0;
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
    width: 600px;
    margin: 0 auto;
`;

function Layout({ children }) {
    return (
        <Container>
            <Header>
                <h1>鈴木 颯介 / Sosuke Suzuki</h1>
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
        </Container>
    );
}

export default Layout;
