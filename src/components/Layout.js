import React from "react";
import Helmet from "react-helmet";
import styled, { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import github from "../images/GitHub-Mark-120px-plus.png";
import twitter from "../images/Twitter_Logo_Blue.png";
import Anchor from "./Anchor";

const MAX_WIDTH = "800px";
const HEADER_HEIGHT = "70px";

const GlobalStyle = createGlobalStyle`
  ${reset}
  body {
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
  }
  h1 {
    font-size: 27px;
    margin: 16px 0;
    font-weight: bold
  }
  h2 {
    font-size: 25px;
    margin: 16px 0;
    font-weight: bold;
  }
  h3 {
    font-size: 20px;
    margin: 16px 0;
    font-weight: bold;
  }
  p {
    margin-bottom: 8px;
    line-height: 20px;
  }
  ul {
    list-style: inside;
  }
  p,
  li {
    line-height: 27px;
  }
`;
const Container = styled.div`
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
  align-items: center;
  padding: 20px 0;
  .about-link {
    line-height: ${HEADER_HEIGHT};
    align-self: center;
  }
  .icon {
    margin-left: 10px;
  }
  .github-icon {
    height: 30px;
  }
  .twitter-icon {
    height: 50px;
  }
`;
const Main = styled.main`
  max-width: ${MAX_WIDTH};
  margin: 0 auto;
  word-wrap: break-word;
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
    <>
      <GlobalStyle />
      <Container>
        <Helmet>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Helmet>
        <Header>
          <Anchor href="/" className="heading-link" gatsby>
            <h1>Sosuke Suzuki</h1>
          </Anchor>
          <IconList>
            <Anchor href="https://github.com/sosukesuzuki">
              <img src={github} alt="github" className="github-icon" />
            </Anchor>
            <Anchor href="https://twitter.com/__sosukesuzuki">
              <img src={twitter} alt="twitter" className="twitter-icon" />
            </Anchor>
          </IconList>
        </Header>
        <Main>{children}</Main>
        <Footer>
          <small>© 2019 Sosuke Suzuki</small>
        </Footer>
      </Container>
    </>
  );
}
