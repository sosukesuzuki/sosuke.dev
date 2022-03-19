---
layout: article-layout.11ty.js
date: 2022-03-19
title: "Prettier のサイズを減らすテクニック"
tags: post
description: "Tree Shaking に頼れない環境でバンドルサイズをへらす泥臭いテクニックです"
---

実は先日リリースした Prettier 2.6 では前のバージョンである 2.5.1 と比べてバンドルサイズが 3MB ほど減っています。

<figure>
<img src="/img/prettier-2.5.1-size.jpg" width="420" height="342"/>
<figcaption>Prettier 2.5.1 のサイズ(20.0MB)</figcaption>
</figure>

<figure>
<img src="/img/prettier-2.6-size.jpg" width="420" height="355" />
<figcaption>Prettier 2.6.0 のサイズ(16.9MB)</figcaption>
</figure>

[リリースブログ](https://prettier.io/blog/2022/03/16/2.6.0.html#switch-to-esbuild-12055httpsgithubcomprettierprettierpull12055-by-fiskerhttpsgithubcomfisker)で言及したとおり Prettier 2.6 ではモジュールバンドラーを Rollup から esbuild に移行したので、その影響かと思われるかもしれませんが実はそれだけではありません。esbuild への移行によって減ったバンドルサイズはそれほど大きくはありませんでした。

バンドルサイズが 3 MB 減ったのは泥臭いチューニングをいくつか行った結果なのです。

この記事では Prettier 2.6 で実施したバンドルサイズを減らすテクニックを紹介します。

## きっかけ

ライブラリのサイズは大きいより小さい方が当然良いですが、その重要度はライブラリによって異なります。たとえばブラウザで動かす目的で開発された UI ライブラリにっとてはサイズが小さいことは重要です。

しかし Prettier のようなコードフォーマッターにとってはそれほど重要なことではないと考えています。ブラウザ上ではなく開発を行うマシンか CI のためのマシンの上で実行されることが多いためそれほどクリティカルな問題ではないのです。

そのような状況の中で、我々が Prettier のバンドルサイズを減らすための努力を始めたのにはきっかけがあります。

それは Chrome DevToolss が Pretty Print 機能のためのコードフォーマッターとして Prettier を採用しようと試みたことです。

https://github.com/prettier/prettier/issues/12144

この issue は Chrome DevToolss の開発チームのメンバーだった [Tim van der Lippe](https://twitter.com/TimvdLippe) 氏によって作成されたものです。要約すると「Chrome DevTools のコードフォーマッターとして Prettier を使うことを考えたんだけど、バンドルサイズが大きすぎる。なんとかして減らしていけないか。」というような内容です。

この issue が作成されたすぐあと Tim van der Lippe 氏によって Prettier のバンドルサイズをへらすためのいくつかの Pull Request が作成されました。

これを受けて私と、もう一人のメンテナーである [fisker Cheung](https://github.com/fisker) 氏は Prettier のバンドルサイズを減らすために動き出しました。

(私も fisker 氏もバンドルサイズのチューニングがもともと好きだという事情もあります。)

## Tree Shaking には頼れない

esbuild は今のところ CommonJS の Tree Shaking をサポートしていません。そして残念なことに Prettier のソースコードは CommonJS で記述されています。

つまりモジュールバンドラーによる Tree Shaking には頼れません。つまり Tree Shaking 相当のことを自分たちでやるしかありませんでした。

### ファイルを適切に分割する

たとえば次のような `utils.js` というファイルがあるとします。

```js
// utils.js
const foo = function () {
  console.log("Foo");
};
const bar = function () {
  console.log("Bar");
};
module.exports = { foo, bar };
```

この `utils.js` を `require` する `main.js` があるとします。

```js
// main.js
const { foo } = require("./utils.js");

foo();
```

このとき Tree Shaking が適切に機能していれば最終的なバンドルから `bar` は取り除かれます。

Tree Shaking なしでこれを実現するためには、単純に `foo` と `bar` を別のファイルで宣言する必要があります。

```js
// utils/foo.js
const foo = function () {
  console.log("Foo");
};
module.exports = { foo };
```

```js
// utils/bar.js
const bar = function () {
  console.log("Bar");
};
module.exports = { bar };
```

そのような修正をいくつか行いました。

- https://github.com/prettier/prettier/pull/12156
- https://github.com/prettier/prettier/pull/12164
- https://github.com/prettier/prettier/pull/12176
- https://github.com/prettier/prettier/pull/12204
- https://github.com/prettier/prettier/pull/12203

これは退屈でつらい作業でした。

### 要らないものはビルド時に抹消する

自分たちの管理しているコードに対しては上記のようなファイルを分割する方法で十分です。しかし依存しているライブラリのコードに対してはファイルをあとから分割することはできません。

なので依存しているライブラリに関しては、未使用の API が esbuild の minifier によって抹消されるように設定する必要がありました。

そのために [esbuild-plugin-replace-text](https://github.com/prettier/prettier/blob/ae080df3e7c38e22ddb47699f71bd2bbca3d822e/scripts/build/esbuild-plugins/replace-text.mjs) と [esbuild-plugin-replace-module](https://github.com/prettier/prettier/blob/ae080df3e7c38e22ddb47699f71bd2bbca3d822e/scripts/build/esbuild-plugins/replace-module.mjs) という２つの esbuild プラグインが fisker 氏によって実装されました。

これらのプラグインを泥臭く設定することで、バンドルサイズを大幅に減らすことができました。

#### esbuild-plugin-replace-text

esbuild-plugin-repleace-text はバンドルする前のコードの中のある文字列を、指定の文字列で置換します。[`@rollup/plugin-replace`](https://github.com/rollup/plugins/tree/master/packages/replace)を知っている人はそれと同じだと考えてもらって大丈夫だと思います。(ちゃんと調べてないのでわかりませんが webpack の [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) もこの用途に使えそうです)

さきほどの `utils.js` と `main.js` を思い出してください。`utils.js` を分割することなく最終的なバンドルから `bar` を取り除くことを考えます。esbuild-plugin-replace-text を使うと次のようにして実現できます。

```js
import { build } from "esbuild";
import esbuildPluginReplaceText from "./esbuild-plugin-replace-text";

const options = {
  entryPoints: ["./src/main.js"],
  minify: true,
  bundle: true,
  outfile: "./dist/main.js",
  // その他のオプション...
  plugins: [
    esbuildPluginReplaceText([
      {
        file: "./src/utils.js",
        find: "const bar = ",
        replacement: "const bar = undefined && ",
      },
    ]),
  ],
};

build(options);
```

このように指定することで、 `utils.js` の `const = bar ` の部分をバンドル前に `const bar = undefined && ` に置き換えることができます。これによって minifier の Dead Code Elimination により `&&` の右辺が消されます。これでファイルを分割することなく、`bar` の実装を最終的なバンドルから消し去ることができます。

#### esbuild-plugin-replace-module

esbuild-plugin-replace-module も似たような機能を持つプラグインです。特定のモジュールに対する `require` / `import` を指定した別のモジュールへ置換します。

次のような `sub-lib.js` があるとします。`sub-lib.js` は `foo` という関数をエクスポートしています。引数として与えられた `kind` が `"A"` のときに限り `largeFunction` という関数を呼び出します。

```js
// sub-lib.js
const largeFunction = require("./largeFunction");

const foo = function (kind) {
  if (kind === "A") {
    largeFunction(options);
  } else {
    console.log("Foo");
  }
};

module.exports = { foo };
```

ここで次のような `lib.js` があるとします。`lib.js` は `bar` という関数をエクスポートしています。`bar` は `foo` に `"B"` を渡しています。

```js
// lib.js
const { foo } = require("./sub-lib.js");

const bar = function () {
  foo("B");
};

module.exports = { bar };
```

そして次のような `main.js` があるとします。

```js
// main.js
const { bar } = require("./lib.js");

bar();
```

このとき `main.js` をバンドルすると、最終的な結果には `largeFunction` の実装が含まれることになります。しかし `foo` の引数として `"B"` を渡してはいるため `largeFunction` が実際に呼び出されることはありません。

このような状況で最終的なバンドルから `largeFunction` を取り除くことを考えます。esbuild-plugin-replace-module を次のように設定することで実現できます。

(次のような `largeFunctionShim.js` を作成しておきます。)

```js
// largeFunctionShim.js
module.exports = () => {};
```

```js
import { build } from "esbuild";
import esbuildPluginReplaceModule from "./esbuild-plugin-replace-module";

const options = {
  entryPoints: ["./src/main.js"],
  minify: true,
  bundle: true,
  outfile: "./dist/main.js",
  // その他のオプション...
  plugins: [
    esbuildPluginReplaceModule([
      {
        "./largeFunction.js": "./largeFunctionShim.js",
      },
    ]),
  ],
};

build(options);
```

esbuild-plugin-replace-module のオプションとして `largeFunction.js` を `largeFunctionShim.js` に置き換えることで、バンドルから実装を抹消できます(`() => {}` に置き換えられる)。

## ビルドのデバッグがしやすい環境を整える

快適にビルドのチューニングを行うためにはビルドスクリプトの開発を快適に行う環境を整える必要があります。

### esbuild

まず、esbuild の圧倒的な速さがなければ快適にビルドスクリプトを改善することは到底できなかったでしょう。

この記事の冒頭で esbuild のおかげでバンドルサイズが小さくなったわけではないと書きましたが、esbuild なしでは無理でした。たしかに esbuild に移行したからバンドルサイズが小さくなったわけではありませんが、esbuild に移行したからこそバンドルサイズを減らすための作業に取り掛かることができたのです。

### esbuild-visualizer

[esbuild-visualizer](https://github.com/btd/esbuild-visualizer) というライブラリによって、ビルド結果を可視化することができます。(webpack の [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) のようなものです。)

この仕組みによって、余計なライブラリが含まれていることにすぐ気がつけるようになりました。

### CLI オプション

デバッグを行うにあたって便利ないくつかの CLI オプションが追加されました。たとえば minify の有無や、esbuild-visualizer によるレポートの作成の有無などを CLI オプションで切り替えられるようになっています。

### ドキュメンテーション

Prettier のビルドスクリプトは複雑です。しかしその複雑さに反してドキュメントが存在しませんでした。レビューは行われるとはいえ、メンテナー個人の意思によって CLI オプションが追加されるため、当人以外それを覚えていないような状況でした。

これでは便利な環境を整えても他のメンテナーはその環境の恩恵を受けることができません。そこで CLI オプションについてはきちんとドキュメントを残すことにしました。

https://github.com/prettier/prettier/tree/ae080df3e7c38e22ddb47699f71bd2bbca3d822e/scripts/build

## 今後

### ECMAScript Modules への移行

この記事を読んで、バンドルサイズのチューニングをしたことがある人は「なんて不毛な！」と思ったことでしょう。私もそう思います。

ここまで紹介したテクニックのほとんどはソースコードを CommonJS から ECMAScript Modules に移行することによって不要になる可能性が高いです。ECMAScript Modules は性質上静的解析がしやすく CommonJS に比べて Tree Shaking などの最適化がよく働きます。

Prettier は次のメジャーバージョンである v3 から ECMAScript Modules へ移行します。

### Chrome DevTools

Chrome DevTools のコードフォーマッターとして Prettier が使われるかもしれないという話を紹介しましたが、おそらく当面はそのようなことはないでしょう。

というのも、そのために色々と動いていくれていた Tim van der Lippe 氏はすでに Google を退職されているようなのです。

いつか Chrome DevTools 上で Prettier が動くようになったら嬉しいですね。

## おわりに

### Q. 3 MB 減ってもまだ 16.9 MB なので十分でかいですよね？何がうれしいんですか？

A. でかいですね。あんまりうれしくないかも。

でもブラウザで JavaScript のコードをフォーマットするために必要なサイズ(`standalone.js` + `parser-espree.js`)は 783 kb から 595 kb になっているので、約 200 kb のダイエットと考えるとちょっとはうれしいかも？
