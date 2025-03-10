---
layout: article-layout.11ty.js
date: 2024-10-22
title: "VueFes Japan 2024の「次世代フロントエンドクロストーク」の感想ともっと聞きたかったこと"
tags: post
---

2024年10月19日に開催されたVueFes Japan 2024で、「次世代フロントエンドクロストーク」というイベントに出演した。このイベントは、Vueの作者であるEvan You、Oxcの作者であるBoshenの二人の海外ゲストに対して、BiomeのCore Contributorであるunvalleyさん、ESLint周りのエコシステムで活躍されているota-meshiさん、そしてPrettierのメンテナーである筆者(sosuke suzuki)が各々の立場から色々とコメントを挟みつつ、今後のフロントエンドツールチェインについて話していく、というものだった。通訳とモデレータはKiakingさんが行っていた。

まず雑に感想としては、全体的には貴重な経験[^1]だったし、楽しかったと思う。あとKiakingさんが通訳とモデレータという難しい二つの役割を完璧に果たしていて素直にびっくりしてしまった。すごすぎた。

ということで全体的には楽しかったしポジティブなのだが、消化不良感がないとは言えない。

<figure>
<img style="border: 1px solid gray" src="/img/vuefes2024.jpg" width="1024" height="768"/>
<figcaption>登壇時の写真、@kazuponさんが撮影したものを許可を得て掲載しています</figcaption>
</figure>

## もっと聞きたかったこと

このイベントは、割と聴衆のことを意識した設計になっていたと思っていて、登壇者としてはやや物足りなかった。次世代Webカンファレンスなどのように聴衆おいてけぼりで話しまくって良いやつとは勝手がだいぶ違う（当然）。本当はもっとEvanやBoshenに通訳つきで聞きたいことがあった。ということで、まだ記憶があるうちに、聞こうと思っていたことを書いてみようと思う。

### リモートキャッシュについて

まず、リモートキャッシュについて。VercelはTurborepoを持っていて、Turborepoの目玉機能の一つはリモートキャッシュだと思っている。あんまり経験はないけど、大規模プロジェクトだとリモートキャッシュは効くんじゃないかと思っていて、Turborepoがそれをやりたいというのはまあそうだよね、と思っている。 一方で、これはホスティングプラットフォームを持っているVercelだから気軽にできるんじゃないかと思っていて、VoidZeroはそのへんなにか考えてるんですか？というのを聞きたかった。

### oxcのlinterのメンテナンスについて

次に、oxcのlinterの開発方針について。ESLintは、いつからか忘れたけど、新しいルールは新しいECMAScriptの言語機能に関するものだけ受け入れていて、基本的にはコアには新しいルールを追加しない方針になっている。代わりにESLintエコシステムが勝手にやってね～ということだと思う。実際eslint-plugin-unicornとかeslint-plugin-importとかは、JavaScriptに関する機能がほとんどだけど、プラグインとして実現されている。これはOSSのメンテナーという有限リソースの扱い方の問題だと思っている。oxcも、今はまだユーザーが少ないからいいかもしれないけど、ユーザーが増えていったらメンテナンスのコストが増えていくはずで、そうなったときに、そういうエコシステムの構築をどういうふうにやっていきたいとかなにか考えあるんですか？というのを聞きたかった。

### Rustについて

次に、Rustについて。Rust以外にも、C/C++、Zig、Goなど、実行速度が速いプログラミング言語っていくつかあると思うけど、なんでRustなんですか？って聞きたかったけど、これはまあ納得できるから聞かなくて良かったかもしれない。Boshenがどう思っているのかは知らないが、モダンなビルドシステムやパッケージマネージャがほしくなったらまずC/C++は多分しんどくて、oxcみたいに自分でメモリアロケータを書きたいという人たちだったらGoも多分しんどくて[^2]、その上で安全なプログラミングとかユーザーが多いとかを考えるとZigがダメで[^2]、そしたらRustかなあとは思う。

### Romeについて

次に、Romeについて。フロントエンド大統一ツールチェインと聞くと、Romeのことを思い出すけど、RomeとVoidZeroは何が違って、なんで成功できると思っていますか？と聞きたかった。話を聞いていく中で、Viteとoxcという基盤、そしてそれらのコア開発者を抱えているっていうのが一番の違いかな、とは思った。

### webpackやBabelについて

次に、webpackやBabelについて。今多くの人たちはまだwebpackやBabelを使っているはずで、そういう人たちの一部はこれからもwebpackやBabelを使い続けていくのだと思う。それを考えると、webpackやBabelの方をドラスティックに改善していくことは考えられないかな？ということを聞きたかった。けど、どこかでめっちゃ大きな変更を入れたらPython2/3みたいにコミュニティの分断が起こるだけで、それってViteを新しく作るのと何が違うの？って言われると、何も違わないどころか悪化するのかもしれない。

## おわり

と、こんな感じのことを聞きたかった。一部は自分で答えが出ているけど、彼らの言葉で答えを聞きたかったなーとは少し思う。

とはいえ、冒頭にもいったとおり登壇も、VueFes Japan 2024全体もとても楽しかったです。関係者の皆さま、本当にお疲れ様でした。

[^1]: このブログを読んでいる皆さんの中に、ふと左を向いたら1mもないくらいの範囲に登壇中のEvan Youがいたという経験をしたことがある人はいるだろか、なんとおれはある。
[^2]: あんまり知らないからてきとう言ってる。しんどくなかったらごめん。
