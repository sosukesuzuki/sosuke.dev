---
layout: article-layout.11ty.js
date: 2022-05-01
title: "JavaScript に TypeScript のような型注釈を書ける Type Annotations プロポーザル"
tags: post
---

この記事では Type Annotations プロポーザルの概要とモチベーションについて説明する。

## 概要

Type Annotations プロポーザルは 2022 年の 3 月 9 日に Microsoft の TypeScript チームの Program Manager である [Daniel Rosenwasser](https://twitter.com/drosenwasser) 氏のブログ記事 [A Proposal For Type Syntax in JavaScript](https://devblogs.microsoft.com/typescript/a-proposal-for-type-syntax-in-javascript/) で発表され、2022 年 3 月の TC39 ミーティングで Stage 1 になった。

Type Annotations プロポーザルは JavaScript に TypeScript のような型注釈の構文を導入する。

たとえば、次のような型注釈を持つ関数宣言などが可能になる。

```js
function hello(name: string): void {
  console.log(`Hello, ${name}`);
}
```

現段階では [Enum](https://www.typescriptlang.org/docs/handbook/enums.html) や [Namespace](https://www.typescriptlang.org/docs/handbook/namespaces.html)、[Parameter Properties](https://www.typescriptlang.org/docs/handbook/2/classes.html#parameter-properties) などの一部の機能を除くほとんどの TypeScript の型の構文が仕様に含まれている。

このプロポーザルの重要な点は**型注釈の記述は可能になるが、実のところそれらはコメントのように振る舞い、実際に動作には全く影響を及ぼさない**というところである。

したがって、上で定義した `hello` 関数を次のように呼び出しても問題なく動作する。

```js
hello({ prop: 1 });
```

型注釈に基づいた実際の型チェックについては外部のツール(テキストエディタや CLI)で行うことになる。

## モチベーション

### Flow/TS のトランスパイルなしでの実行

このプロポーザルの主なモチベーションは、開発者が書いた TypeScript や Flow などの静的型付け JavaScript をトランスパイルなしで実行できるようにすることである。

我々が普段 TypeScript コンパイラで行っているトランスパイルは大きく２つに分けられる。

1 つはダウンレベルコンパイルである。たとえば `const foo = "foo";` を `var foo = "foo";` にするような処理だ。

もう 1 つが型の消去である。たとえば `const foo: string = "foo";` を `const foo = "foo";` にするような処理だ。

そして近年、ダウンレベルコンパイルの必要性は低くなってきている。

なぜなら、フロントエンドではエバーグリーンブラウザが主流になっており、バックエンドでは Node.js や Deno が十分に新しい V8 を使っているからだ。JavaScript が動作する環境では、大体の場合新しい JavaScript が動作するような世界になってきている。

そして Type Annotations プロポーザルによって型の消去も不要になれば、トランスパイルそのものが不要になるというわけだ。

### JSDoc コメントの延長線としての Type Annotations

これとは別の文脈として、JSDoc コメント的な使い方における利便性の向上といったモチベーションもある。

実は TypeScript コンパイラは JavaScript 中に書かれた JSDoc コメントを使った型チェックができる。

これによって TypeScript の環境を本格的に構築しなくても型チェックの恩恵にあずかることができる。

たとえば筆者がメンテナンスしている Prettier は JavaScript で書かれているが、一部のコードでは JSDoc コメントを使って型を明示して TypeScript コンパイラを使って型チェックを行っている。

しかし JSDoc コメントは冗長であり、複雑な型を表現するのが難しいなどの問題がある。

Type Annoatations プロポーザルがあればこれらの問題を解消できる。

## 感想

筆者個人としては「理想としては共感できなくはないが、現実的には不可能に近いのではないだろうか」というような印象を受けた。

まず、トランスパイルというかビルドステップを消し去るにはモジュールバンドラーをどうにかしないといけない。ブラウザが ECMAScript Modules を解釈できるようになった今、モジュールバンドラーの役割はダウンレベルコンパイルではなくパフォーマンスの改善になっている。そこに関しては Type Annoataions ではカバーできない([Subresource loading with Web Bundles](https://github.com/WICG/webpackage/blob/7d2c409443b566e4d117541f6ced2e4b348d497a/explainers/subresource-loading.md) に期待したい)。

さらにガバナンスの問題もある。TypeScript のサブセットの構文が TC39 によって ECMA-262 に組み込まれたとして、その後の TypeScript と TC39 の関係はどのようになっていくのだろうか。標準化が足かせとなり TypeScript 側の進化が遅れることも考えられるし、TypeScript 側だけが進化して標準化が遅れてしまい結局みんな TypeScript をコンパイルして使うような未来も考えられる。

「開発者の書いたコードがそのまま動く世界」を実現するためには Type Annotations プロポーザルは必要なステップだと思う。しかしそのために解消しなければならない難しく現実的な課題が多い。

ちなみに筆者は書き捨てのスクリプトを書くときに JavaScript + JSDoc で書くことが多いのでそういうときに Type Annotations があったら便利だとは思う(この記事を書きながら思ったがそういうときは Deno を使えばいいかもしれない)。

この記事ではざっくりと Type Annotations についか解説したが、詳細については https://github.com/tc39/proposal-type-annotations を自分自身で読んでほしい。FAQ には結構興味深いことが書かれている。

## 参考リンク

- https://devblogs.microsoft.com/typescript/a-proposal-for-type-syntax-in-javascript/
- https://github.com/tc39/proposal-type-annotations
- https://github.com/tc39/notes/tree/main/meetings/2022-03
