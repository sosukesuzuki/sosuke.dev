---
layout: article-layout.11ty.js
date: 2023-05-26
title: "フレームグラフを眺めて無駄な正規表現を消してPrettierのパフォーマンスをちょっとだけ改善する"
tags: post
---

最近、[Kohta Ito](https://twitter.com/koh110) さんのブログ記事 [0 から始める Node.js パフォーマンスチューニング](https://blog.koh.dev/2020-03-04-nodejs-performance/) を読みました。Kohta Ito さんは、[実践 Node.js 入門](https://gihyo.jp/book/2023/978-4-297-12956-9) という書籍を執筆されたことでも知られています。

このブログ記事の「framegraph 編」という節では、 Node.js でのフレームグラフの生成方法や見方が説明されています。私はフレームグラフというものを知ってはいましたが、それを見てパフォーマンスの改善に活かしたことはありませんでした。

ということで、Prettier のフレームグラフを眺めてみて、実際にちょっとだけパフォーマンスを改善してみました。この記事では、そのパフォーマンス改善について説明します。

## フレームグラフを生成するツール 0x

[0 から始める Node.js パフォーマンスチューニング](https://blog.koh.dev/2020-03-04-nodejs-performance/) では、フレームグラフを生成するためのツールとして [0x](https://github.com/davidmarkclements/0x) が紹介されています。

0x のリポジトリを見ると、Node.js の Technical Steering Committee の一人であり Web フレームワークの [Fastify](https://github.com/fastify/fastify) のメンテナーとして知られてる [Matteo Collina](https://twitter.com/matteocollina) さんによってメンテナンスされていることがわかります。

0x の使い方は簡単です。基本的には、Node.js のスクリプトを実行するときに、`node` コマンドではなく `0x` コマンドを使うだけでフレームグラフを生成できます。

たとえば、`my-app.js` というファイルがあるとします。普通に Node.js で実行するときは次のコマンドを実行します。

```text
node ./my-app.js
```

それに対して、0x で実行してフレームグラフを生成するときは次のコマンドを実行します。

```text
0x ./my-app.js
```

このように 0x 経由で Prettier を実行し、そのフレームグラフを見てパフォーマンスに悪影響を及ぼしていそうな箇所を見つけました。

## Prettier のフレームグラフを見る

フレームグラフを眺めることによって Prettier のパフォーマンスを改善しようと考えたときに、どのようなコードをフォーマットするときのフレームグラフを使うべきか、というのは悩みどころです。実用的で、それなりに量が多いコードが望ましいと考えました。

その条件を満たすコードとして最初に思いついたのは [TypeScript コンパイラの `checker.ts`](https://raw.githubusercontent.com/microsoft/TypeScript/main/src/compiler/checker.ts) です。`checker.ts` は TypeScript の型チェックにおけるコア部分が実装されたファイルで、巨大であることで有名で知られています。今確認したところ、なんと 49,000 行を超えています。

まずは、Prettier の `main` ブランチでプロダクションビルドを生成します。Prettier ではプロダクション用のビルドを生成するときに `yarn build` を実行します。しかし、minify されているとフレームグラフから関数の名前が消えて、ボトルネックを見つけるのが困難になります。そのようなときのために、Prettier のビルドスクリプトには `--no-minify` というオプションが存在します。したがって、今回は `yarn build --no-minify` を実行します。

次は、実際に `checker.ts` をフォーマットするフレームグラフを生成してみます。

```text
0x ./dist/bin/prettier.cjs checker.ts
```

これで、`*****.0x/flamegraph.html` のような名前の HTML ファイルが生成されます。この HTML をブラウザで開くとフレームグラフが表示されます。

以下の画像が、実際に生成されたフレームグラフです。この記事には関係ないので上部を切り取っています。

<figure>
<img style="border: 1px solid gray" src="/img/prettier-framegraph-1.png" width="700" height="321" />
<figcaption>0xによって生成されたフレームグラフ</figcaption>
</figure>

このフレームグラフを少し見てみると、奇妙な点が見つかります。

まず、Prettier の内部処理を大まかに説明します。Prettier では、以下の順番で処理を実行し、入力の文字列から出力の文字列まで変換します。

1. 文字列を AST にする(パース)
2. AST を Doc と呼ばれる pretty print のための中間表現にする
3. Doc を文字列にする

フレームグラフ上でこの 3 つの処理を色分けしてみます。そして、それぞれをよくみて見ると、パース処理の先頭で重い関数が呼び出されていることがわかります。この関数呼び出しは他の関数を呼び出すわけでもなく、それ単体でそこそこ長い間実行されていて、奇妙です。

<figure>
<img style="border: 1px solid gray" src="/img/prettier-framegraph-1-2.png" width="700" height="321" />
<figcaption>0xによって生成されたフレームグラフを塗り分けた</figcaption>
</figure>

この奇妙な赤いブロックにマウスのカーソルを乗せると、`isProbablyJsx` という関数が呼び出されていることがわかります。

<figure>
<img style="border: 1px solid gray" src="/img/prettier-framegraph-1-3.png" width="345" height="88" />
<figcaption>奇妙な赤いブロックにマウスのカーソルを乗せた</figcaption>
</figure>

この記事のタイトルも合わせると、なんとなくこの関数の中身が想像できますね...？

## 奇妙な関数 `isProbablyJsx` を探る

`isProbablyJsx` という名前でコードを検索すると、すぐにその実装が見つかりました。`isProbablyJsx` は、引数で受け取った文字列が JSX っぽいかどうかを正規表現を使って判定する関数であるということがわかります。

```js
/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(?:^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(?:^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}
```

この `isProbablyJsx` は TypeScript のコードをパースする直前に、Prettier の入力の文字列全体に対して実行されています。そして、その戻り値によってパーサーに渡すオプションを切り替えます。

まとめると「Prettier で TypeScript のコードをフォーマットするとき、入力の文字列全体に対して、JSX っぽいかどうかを判定する正規表現が実行されている」ということになります。

(この関数の計算量は知らないですがおそらく)入力の文字列が大きくなると、それに伴ってこの関数の実行時間が増えます。

## `isProbablyJsx` を取り除く？

`isProbablyJsx` という関数は無駄なわけではなく、明確な存在意義があります。なぜなら、TypeScript のパーサーや Prettier は、入力のコードが、通常の TypeScript なのかそれとも TSX なのかを知っている必要があるからです。

したがって、ただ `isProbablyJsx` を取り除くことはできません。少なくともなんらかの方法で入力のコードが TSX であるかどうかを判定しなければいけません。

Prettier の他の箇所では、TSX であるかどうかを判定するためにファイルの拡張子を使っています。単純に `*.ts` であれば通常の TypeScript、`*.tsx` であれば TSX、という風に判定しています。そこで `isProbablyJsx` を使っている箇所を、拡張子を使った判定に切り替えることを考えました。

この方法は `*.ts` と `*.tsx` のファイルに限った場合、上手く機能します。

しかし、TypeScript には `*.mts` と `*.cts` という拡張子もあります。これはそれぞれ Node.js における `*.mjs` と `*.cjs` に対応するものです。詳しくは [teppeis](https://twitter.com/teppeis) さんの [TypeScript 4.5 以降で ESM 対応はどうなるのか？](https://zenn.dev/teppeis/articles/2021-10-typescript-45-esm) などの記事を参照してください。

実はこの `*.mts` と `*.cts` には、TSX を書くこともできます。

また、Prettier を API を使って呼び出した場合は拡張子がそもそも存在しません。

これらの事情があるため、`isProbablyJsx` を完全に取り除くことはできませんでした。最終的には、次のようなロジックが採用されました。

- ファイルの拡張子が `.ts` の場合、通常の TypeScript のコードとしてパースする
- ファイルの拡張子が `.tsx` の場合、TSX のコードとしてパースする
- ファイルの拡張子が `.mts` や `.cts` の場合、まず通常の TypeScript のコードとしてパースし、失敗したら TSX のコードとしてパースする
- それ以外の場合、`isProbablyJsx` で TSX かどうかを判定してパースする

これによって、ほとんどのユースケースにおいては `isProbablyJsx` が呼び出されることはなくなりました。この修正を実装した PR は [Fix trailing coma print in type prameters, improve jsx parse by sosukesuzuki · Pull Request #14688 · prettier/prettier](https://github.com/prettier/prettier/pull/14688) です。

## 結果

この PR の後で、さきほどと同様の手順で 0x を使って生成したフレームグラフが以下です。さきほどのフレームグラフと見比べると、奇妙な赤いブロック、つまり `isProbablyJsx` の呼び出しがなくなっていることがわかります。

<figure>
<img style="border: 1px solid gray" src="/img/prettier-framegraph-2.png" width="700" height="321" />
<figcaption>0xによって生成されたフレームグラフ</figcaption>
</figure>

## おわりに

`isProbablyJsx` の呼び出しにかかっていた時間は、パースなどの他の重い処理と比べると大したものではありません。ですので、この改善は正直に言うとそれほど有意なものではなかったと思います。

ですが、フレームグラフを眺めて、パフォーマンスに悪影響を及ぼしているであろう箇所を特定し修正する、という体験は楽しかったです。
