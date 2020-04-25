import React from "react";
import Layout from "../components/Layout";
import Anchor from "../components/Anchor";
import SEO from "../components/SEO";

export default function About() {
  return (
    <Layout>
      <SEO />
      <section>
        <p>
          JavaScript と TypeScript と OSS が好きなフロントエンドエンジニアです。
        </p>
        <p>
          現在、業務委託でのお仕事を探しています。
          <Anchor href="https://gist.github.com/sosukesuzuki/8a2263713a781141600041935a5c90ae">
            詳しいレジュメ
          </Anchor>
          をご覧になった上で記載されているメールアドレスまでご連絡ください。
        </p>
      </section>
      <section>
        <h2>Open Source</h2>
        <ul>
          <li>
            <Anchor href="https://github.com/prettier/prettier">
              Prettier
            </Anchor>{" "}
            An opinionated code formatter
          </li>
          <li>
            ex-
            <Anchor href="https://github.com/BoostIO/Boostnote">
              Boostnote
            </Anchor>{" "}
            A markdown editor for developers on Mac, Windows and Linux.{" "}
          </li>
        </ul>
      </section>
      <section>
        <h2>Work History</h2>
        <ul>
          <li>
            <Anchor href="https://ubie.life">Ubie, inc</Anchor>{" "}
            ソフトウェアエンジニア(インターン) (2018/ 12 ~ 現在)
          </li>
          <li>
            <Anchor href="https://boostio.co">BoostIO, inc</Anchor>{" "}
            ソフトウェアエンジニア (2017/01 ~ 2018/12)
          </li>
        </ul>
      </section>
    </Layout>
  );
}
