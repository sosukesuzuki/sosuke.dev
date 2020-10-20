---
layout: article-layout.11ty.js
date: 2020-10-17
title: "Import Assertions とは何なのか"
tags: post
---

Import Assertions は現在 Stage 3 の ECMAScript のプロポーザルである。2020 年 9 月に行われた TC39 のミーティングで Stage 3 になった(ミーティングノートは https://github.com/tc39/notes/blob/master/meetings/2020-09/sept-22.md#import-assertions-for-stage-3 にて公開されている)。なので、正式に ECMAScript の仕様に含まれることになるだろう。

Babel では つい先日リリースされた [7.12 から Import Assertions を使えるようになった](https://babeljs.io/blog/2020/10/15/7.12.0#import-assertions-parsing-12139httpsgithubcombabelbabelpull12139)。

この記事では Import Assertions について解説する。

## 概要

このプロポーザルは従来の import 文 にインラインの構文を追加し、モジュール指定子とは別に詳細情報を指定することを可能にする。主に想定される用途は JavaScript 以外のタイプのモジュールのサポートだ。

Import Assertions で追加される構文を使って JSON modules を import する例を考える。

```js
import json from "./foo.json" assert { type: "json" };

```

`import json from "./foo.json"` までは従来の import 文と同様の形をとっている。その直後にある `assert { type: "json" }` の部分が Import Assertions だ。この例では import されるモジュールが JSON modules であることを示している。

ちなみに、[JSON modules](https://github.com/tc39/proposal-json-modules) というのは Import Assertions とは別の Stage 2 の ECMAScript のプロポーザルである。もともとは Import Assertions のプロポーザルに含まれていたが、個別のプロポーザルとして分離された。

JSON modules は JSON のモジュールとしての扱いを統一することを目的としている。現状では、それぞれの環境(例えば webpack や Node.js など)が JSON の扱いを自由に実装することができる。そこで JSON modules を仕様として定めることで、ECMAScript の仕様の準拠したすべての場所で一貫して動作させることが可能になる。

Import Assertions の話題とはそれてしまうのでここでは JSON modules について詳しく解説はしない。

## 構文

構文について詳しく見ていこう。

上述の通り基本的には import 文の後ろに `assert` というキーワードが続き、更にその後ろに詳細情報をオブジェクトリテラルのように記述する。

```js
import json from "./foo.json" assert { type: "json" };
```

この Import Aserttions が中括弧を採用したのには二つの理由がある。一つは、JavaScript を使う開発者はすでにオブジェクトリテラルの記法に慣れているため。もう一つは、将来的に`assert`以外の属性を指定できるようになる可能性があり、その場合に様々な属性に対してグルーピングを行うためである。以下の例を見てほしい。

```js
import json from "./foo.json" assert { type: "json" } with { transformA: "value" };
```

この例では、`assert { type: "json" }` の後ろに `with { transformA: "value" }` という他の属性が続いている。この`with`という属性は現在の Import Assertions の仕様には含まれてはいない。しかし、将来的にこういった他の属性が追加されることが想定されている。このとき中括弧を使ったオブジェクトリテラルのような構文のおかげでそれぞれが属性に対応するグループだということがわかる。

Import Assertions は `import` のみではなく `export` に対しても使うことができる。

```js
export { val } from './foo.js' assert { type: "javascript" };
```

しかし、現在 Babel 7.12 ではシンタックスエラーとして扱われてしまう。

また、Import Assertions は dynamic import もサポートしている。その場合、関数の第 2 引数にオブジェクトリテラルを渡すようにして指定する。

```js
import("foo.json", { assert: { type: "json" } });
```

## 経緯

次に、このプロポーザルが生まれたモチベーションや経緯について解説する。

当初は、新しい構文を追加することなく JSON をモジュールとして読み込むための、**Import Assertion とは異なる**仕様[提案されていた](https://github.com/w3c/webcomponents/issues/770)。この提案では、次のようにして JSON をモジュールとして import できる。

```js
import json from "./foo.json";
```

これは多くの非標準の環境での JSON の読み込みと似ている。たとえば、Node.js では `----experimental-json-modules` フラグをつければ上記のコードをそのまま実行できるはずだ。

この提案は多くの開発者からの支持を受けた。<!-- TODO: 詳しく -->

しかし、あとになって[セキュリティ上の問題が指摘されてしまった](https://github.com/w3c/webcomponents/issues/839)。<!-- TODO: 詳しく-->
