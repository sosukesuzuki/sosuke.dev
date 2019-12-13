import React from 'react';
import Layout from '../components/Layout';
import Anchor from '../components/Anchor';
import SEO from '../components/SEO';

function Home() {
    return (
        <Layout>
            <SEO />
            <section>
                <h2>About me</h2>
                <p>
                    JavaScript と TypeScript と OSS
                    が好きなフロントエンドエンジニアで、筑波大学の学生です。
                </p>
            </section>
            <section>
                <h2>OSS</h2>
                <ul>
                    <li>
                        <Anchor href="https://github.com/prettier/prettier">
                            Prettier
                        </Anchor>
                        (maintainer) An opinionated code formatter
                    </li>
                    <li>
                        ex-
                        <Anchor href="https://github.com/BoostIO/Boostnote">
                            Boostnote
                        </Anchor>
                        (maintainer) A markdown editor for developers on Mac,
                        Windows and Linux.{' '}
                    </li>
                </ul>
            </section>
            <section>
                <h2>Works</h2>
                <ul>
                    <li>
                        <Anchor href="https://ubie.life">Ubie, inc</Anchor>{' '}
                        ソフトウェアエンジニア(インターン) (2018/ 12 ~ 現在)
                    </li>
                    <li>
                        <Anchor href="https://boostio.co">BoostIO, inc</Anchor>{' '}
                        ソフトウェアエンジニア (2017/01 ~ 2018/12)
                    </li>
                </ul>
            </section>
        </Layout>
    );
}

export default Home;
