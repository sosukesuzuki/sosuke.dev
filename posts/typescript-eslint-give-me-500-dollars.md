---
layout: article-layout.11ty.js
date: 2023-03-22
title: "TypeScript-ESLintから $500 いただきました"
tags: post
---

先日、[TypeScript-ESLint](https://typescript-eslint.io/)という OSS プロジェクトから \$500 いただきました。ちなみに筆者は TypeScript-ESLint のチームに所属しているわけではありません。

この記事では、改めて TypeScript-ESLint というプロジェクトの概要を説明すると共に、筆者が \$500 いただいた経緯や、TypeScript-ESLint の運営状況について説明します。

## TL;DR

資金に余裕があり、TypeScript-ESLint を使っている個人や企業は TypeScript-ESLint プロジェクトに寄付することを検討してください。

TypeScript-ESLint への寄付は https://opencollective.com/typescript-eslint から行うことができます。

一応明記しておきますが、筆者は今回 \$500 いただきましたが今後も継続的にいただくわけではありません。筆者の収入をを安定させる目的でこの記事を書いているわけではありません。筆者の収入を安定させたい方は筆者の GitHub Sponsors から支援してください。

## TypeScript-ESLint とは

ESLint で TypeScript を扱うための一連のツールを含む OSS プロジェクトです。

プロジェクトは GitHub で開発されており https://github.com/typescript-eslint/typescript-eslint から確認できます(一連のツールのほとんどは Nx を使った monorepo として管理されています)。

ESLint はデフォルトの状態では ECMA-262 として標準化された JavaScript の構文と、JSX しか扱えません。したがって TypeScript で記述されたコードを扱うことはできません。

ESLint には JavaScript 以外のコードを扱うためのカスタムパーサという仕組みがあります。そして、TypeScript-ESLint プロジェクトは ESLint で TypeScript を扱うためのカスタムパーサを提供します。これによって、我々は ESLint を使って TypeScript で記述されたコードを解析できるのです。

また TypeScript-ESLint プロジェクトは、カスタムパーサの他にも TypeScript 用の ESLint プラグインなども提供しています。この ESLint プラグインには、TypeScript のための ESLint ルールが多く実装されています。このプラグインを使うことで、TypeScript を使った開発をより安全にできます。

ESLint と TypeScript を併用する方法をより詳しく知りたい場合は、2 月 24 日発売の WEB+DB PRESS Vol.133 に詳しく書かせていただいたので、よろしければそちらを読んでみてください。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">WEB+DB PRESS Vol.133、どこよりも早い表紙画像です！<br>TypeScript最新活用、速習Ruby 3.2、Tailwind CSS実践入門を大特集！2月24日発売です！<a href="https://twitter.com/hashtag/wdpress?src=hash&amp;ref_src=twsrc%5Etfw">#wdpress</a> <a href="https://t.co/TaHmqI7eyq">pic.twitter.com/TaHmqI7eyq</a></p>&mdash; WEB+DB PRESS編集部 (@wdpress) <a href="https://twitter.com/wdpress/status/1622416916987129857?ref_src=twsrc%5Etfw">February 6, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## \$500 いただいた経緯

筆者は TypeScript 4.5 以降、TypeScript の新しいバージョンがリリースされるたびに TypeScript-ESLint に対してそのバージョンをサポートするための PR を送っています。

先日リリースされた 5.0 のサポートも実装しました。

新しい構文をサポートする部分が大変なのはもちろんですが、TypeScript-ESLint は TypeScript の Compiler API を使っているので、ただバージョンを上げるだけだと壊れることが多いです。そのあたりを気合で修正していく作業をしています。

場合によっては作業範囲が TypeScript 本体へのバグ報告や Microsoft の [Rushstack](https://github.com/microsoft/rushstack) に及ぶこともあり、面倒くさいことも多いです。

その貢献が認められたため、今回 \$500 いただきました(いきなりメールが来ました)。

## TypeScript-ESLint の運営状況

少なくとも外部からは TypeScript-ESLint は 2~4 人のメンテナによって維持されているように見えます。またウェブサイトを主として見るメンバーも別にいるように見えます。

TypeScript-ESLint は多くのルールが実装された ESLint プラグインをメンテナンスしているという都合があるため、issue のトリアージやバグ修正に対するコストが大きいようです。

https://opencollective.com/typescript-eslint を見ると、総調達金額は \$34,424 となっています。

これを少ないと見るか多いと見るかは主観に依りますが、Babel は \$1,127,389、ESLint は \$572,857、webpack は \$1,391,904 です。Prettier ですら \$88,695 です。

個人的な見解としては、TypeScript-ESLint をメンテナンスする作業へ報酬を支払うための十分な金額だとは思えません。

## まとめ

経済的な余裕があり、TypeScript-ESLint を使っている個人や企業は TypeScript-ESLint プロジェクトに寄付することを検討してください。

TypeScript-ESLint への寄付は https://opencollective.com/typescript-eslint から行うことができます。

TypeScript-ESLint に集まった資金は、TypeScript-ESLint のメンテナたちに報酬として支払われる他、チームメンバではない貢献者に対しても一部支払われます(今回の筆者のように)。

また https://typescript-eslint.io/ の下部を見ると Financial Contributors として企業のロゴが掲載されています。一定の額を超える寄付をした企業のロゴを掲載してくれているのだと思います(筆者はロゴ掲載のロジックを把握していないので、もし寄付するとなったら事前に確認すると良いと思います)。

一応明記しておきますが、筆者は今回 \$500 いただきましたが、今後も継続的にいただくわけではありません。筆者の収入をを安定させる目的でこの記事を書いているわけではありません。筆者の収入を安定させたい方は筆者の GitHub Sponsors から支援してください。
