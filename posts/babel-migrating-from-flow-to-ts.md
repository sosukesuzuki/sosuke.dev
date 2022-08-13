---
layout: article-layout.11ty.js
date: 2022-08-13
title: "Babel が Flow から TypeScript に移行した"
description: "JavaScript のトランスコンパイラである Babel のソースコードが Flow から TypeScript へと完全に移行した"
tags: post
---

先日 Babel のメンテナーとして知られる Nicolò Ribaudo 氏が次のツイートを投稿した。

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">We finally finished migrating the Babel monorepo from Flow to TypeScript!<br><br>It has been a very long process started by <a href="https://twitter.com/z_bodya?ref_src=twsrc%5Etfw">@z_bodya</a>, and after migrating package-by-package <a href="https://twitter.com/JLHwung?ref_src=twsrc%5Etfw">@JLHwung</a> just opened this PR 😄 <a href="https://t.co/WKXxV8x2MY">pic.twitter.com/WKXxV8x2MY</a></p>&mdash; Nicolò Ribaudo 🏳️‍🌈 • 💙💛 (@NicoloRibaudo) <a href="https://twitter.com/NicoloRibaudo/status/1550785025561575427?ref_src=twsrc%5Etfw">July 23, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

そう、JavaScript のトランスコンパイラである Babel のソースコードが Flow から TypeScript へと完全に移行したのだ。

## ユーザーには何の影響もない

最初に名言しておくが、Babel のソースコードが Flow から TypeScript に移行したことによる Babel のユーザーへの影響はない。

もしこの変更によって何かしらユーザーに影響があったとしたら、偶然バグが発生したか偶然バグが修正されてしまったかのどちらかである。

## Flow の現在と使い続けるリスク

もしかしたら最近フロントエンドを触り始めた人は Flow についてほとんど知らないかもしれない。ちなみに筆者も Babel を開発する目的以外で使ったことはない。

Flow は Meta(旧 Facebook)によって開発されている JavaScript に静的型を導入するための型チェッカである。

わかりやすく言えば TypeScript と同じようなものだ。JavaScript のコード中に型アノテーションを記述すると、Flow が型チェックと型の消去を行う。

昔は一世を風靡していた(?)ようだが今では TypeScript にその立場を譲っている。

多くのユーザーが Flow から TypeScript への移行を行っていることがパブリックインターネットからも見て取れる。下記の記事らは「Flow TypeScript 移行」と Google 検索した結果上位に表示されたものだ。探せばもっとあるだろう。

- [開発を止めずに Flow を TypeScript に移行する手法 - freee Developers Hub](https://developers.freee.co.jp/entry/flow-to-typescript)
- [Flow から TypeScript に移行しました - てくすた](https://texta.pixta.jp/entry/2018/06/07/120000)
- [ママリの WebView を JavaScript + Flow から TypeScript に移行しました - コネヒト開発者ブログ](https://tech.connehito.com/entry/2021-12-11-flow-to-typescript)
- [Flow/PostCSS の大規模プロジェクトを TypeScript/emotion に移行して数万行のプルリクを投げた話 - JX 通信社エンジニアブログ](https://tech.jxpress.net/entry/flow-postcss-to-typescript-emotion)

その一方で Meta 社内ではまだまだ現役で使われているようである。

2021 年 5 月に Flow チームの Engineering Manager である[Vladan Djeric 氏](https://twitter.com/djeric3)によって投稿されたブログ記事で今後の Flow の方向性と OSS としてのあり方が説明されている。

[Clarity on Flow’s Direction and Open Source Engagement](https://medium.com/flow-type/clarity-on-flows-direction-and-open-source-engagement-e721a4eb4d8b)

この記事によると、最近の Flow は Meta 社内の大規模な JavaScript コードベースの開発からの要求に耐えられるような高い型安全性とパフォーマンスを実現するために単なる「型付き JavaScript」ではなくなっており、型アノテーション以外の構文も追加してくとのことである。

さらに、外部の開発者のみからの要求を受け入れるだけのリソースがないため基本的にはそのような要求は受け入れない方針のようだ。

つまり、実質的に Meta の社内専用言語になっていると言えるだろう。

(余談だが、Prettier は Flow をサポートしているものの、Flow の新しい言語機能に対応するための Pull Request のほとんどは Meta の Flow チームの開発者によって実装されている。)

筆者個人としてはこの決定は残念だと思うが、もちろん悪いものではない。

しかしながら、Babel のようなオープンソースのプロジェクトが Flow を使い続けるという判断をするのはリスクが高い。

## Babel の TypeScript 移行の流れ

Babel には強力なプラグインの仕組みが備わっており、ほとんどの機能が公式からのプラグインという形で提供されている。そして、それらの 150 を超えるプラグインはすべて https://github.com/babel/babel のリポジトリで管理されている。

Babel のソースコードをすべて Flow から TypeScript に移行するということは、150 を超えるパッケージに対して手を加える必要がある大規模な作業になる。

この大規模な作業は Babel のコントリビューターの一人である [@zxbodya](https://github.com/zxbodya) 氏によって開始された。

2020 年 5 月に、`@babel/parser` 以外の全てのパッケージを一気に Flow から TypeScript へと移行する一つの巨大な Pull Request が作成された(`@babel/parser` は実装が複雑なので他のパッケージと比べて Flow から TypeScript に移行するのが困難だった)。

[Migrate Babel from Flow to TypeScript (except Babel parser) by zxbodya · Pull Request #11578 · babel/babel](https://github.com/babel/babel/pull/11578)

全ての Flow のコードを TypeScript に移行するのは途方もない作業である。そこでこの Pull Request では、@zxbodya 氏が開発した [flowts](https://github.com/zxbodya/flowts) というツールが使われている。

この Pull Request は巨大でレビューが困難であったためパッケージごとに Pull Request が分割されることになった。その結果として [50 個以上の Pull Request](https://github.com/babel/babel/issues?q=label%3A%22Flow+-%3E+TS%22+is%3Aclosed) が作成された。

最後には `@babel/parser` を TypeScript に移行する Pull Request が Babel のコアチームメンバーである [Huáng Jùnliàng](https://github.com/JLHwung) 氏によって作成され、Babel の TypeScript の移行作業が完了した。

[Convert `@babel/parser` to TypeScript by JLHwung · Pull Request #14783 · babel/babel](https://github.com/babel/babel/pull/14783)

その後には Flow での型チェックのためのスクリプトを消し、 `flow-bin` を依存から削除する Pull Request が作成された。

[chore: remove flow check scripts by JLHwung · Pull Request #14785 · babel/babel](https://github.com/babel/babel/pull/14785)

<figure>
<img style="border: 1px solid black" src="/img/remove-flow-bin.png" width="505" width="446" alt="">
<figcaption>BabelからFlowに関する依存が削除されたときの差分</figcaption>
</figure>

## おわりに

Babel が Flow から TypeScript に移行したことはユーザーへの影響はないが、Babel の開発に関わる人からしたら大きな一歩だろう。

そして、Babel はまだまだ開発されている。最近では SWC や esbuild などが開発され、近い未来に Babel はその役目を他のソフトウェアに明け渡すのかもしれない。しかし、個人的には現段階における Babel のクォリティは高いと思っている。もし Babel を使って後方互換性を維持しているプロジェクトから大きな利益を得ている人がいたら、Babel への寄付を検討してほしい。

- https://github.com/sponsors/babel
- https://opencollective.com/babel
