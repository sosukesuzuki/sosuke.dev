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

Import Assertions で追加される構文を使って JSON module を import する例を考える。

```js
import json from "./foo.json" assert { type: "json" };

```

`import json from "./foo.json"` までは従来の import 文と同様の形をとっている。その直後にある `assert { type: "json" }` の部分が Import Assertions だ。この例では import されるモジュールが JSON module であることを示している。

また、Import Assertions は dynamic import に対しても使うことができる。その場合は、関数呼び出しの第2引数のように詳細情報を指定する。

```js
import("foo.json", { assert: { type: "json" } });
```

ちなみに、[JSON module](https://github.com/tc39/proposal-json-modules) というのは Import Assertions とは別の Stage 2 の ECMAScript のプロポーザルである。もともとは Import Assertions のプロポーザルに含まれていたが、個別のプロポーザルとして分離された。

JSON をどのようにモジュールとして扱うかを、それぞれの環境(例えばウェブブラウザ、Node.js、webpack 等)に実装させる自由を与えるのではなく、仕様として定めることで ECMAScript の仕様に準拠したすべての場所で一貫して動作させることを目的としている。

Import Assertions の話題とはそれてしまうのでここでは JSON module について詳しく解説はしない。

## 構文

構文について詳しく見ていこう。

上述の通り基本的には import 文の後ろに `assert` というキーワードが続き、更にその後ろに詳細情報をオブジェクトリテラルのように記述する。

```js
import json from "./foo.json" assert { type: "json" };
```

この`assert`の構文が中括弧を採用したのには二つの理由がある。一つは、JavaScript を使う開発者はすでにオブジェクトリテラルの記法に慣れているため。もう一つは、
