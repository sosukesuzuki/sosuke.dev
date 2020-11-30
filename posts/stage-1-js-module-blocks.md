---
layout: article-layout.11ty.js
date: 2020-11-28
title: "JavaScript の JS Module Blocks について"
tags: post
---

## はじめに

JS Module Blocks は現在 Stage 1 の ECMAScript のプロポーザルである。

2020 年 11 月の TC39 のミーティングで提案され Stage 1 になった。

このプロポーザルは Google のエンジニアである[Surma](https://github.com/surma)氏と Igalia の[
Daniel Ehrenberg](https://github.com/littledan)氏によって進められている。

この記事では、現在の JS Module Blocks について解説する。なお、現在 Stage 1 であるため今後仕様が変更される可能性は高い。

## 概要

JS Module Blocks はシンプルに言えば「ファイルをまたがずにモジュールを定義する」ための提案である。

次のようなインラインモジュール式(`InlineModuleExpression`)と呼ばれる構文を導入し、ファイル内でのモジュールの定義を可能にする。

```js
const m = module {
  export let y = 1;
}
```

このとき、変数 `m` を ダイナミックインポート(`import(...)`) でインポートできる。

```js
const m = module {
  export let y = 1;
}
const module = await import(m);
```

モジュール式で作られたモジュールはダイナミックインポートでのみインポートできる。通常のインポート文(`import foo from "foo"`)では、モジュールブロックを文字列として指定する方法が存在しないためインポートできない。

## 構文

構文は比較的シンプルである。

`module {...}` という形の `InlineModuleExpression` を追加する。これは式なので、任意の式が現れうる場所に使うことができる(厳密には、`InlineModuleExpression` を [`PrimaryExpression`](https://www.ecma-international.org/ecma-262/#prod-PrimaryExpression)に追加する)。

また注意として、`module`と`{`の間には改行を含むことができない。これは、`module`が JavaScript ではキーワードではないためである。

この制約がない場合、例えば次のような変数宣言とブロック文を組み合わせたときの解釈と衝突する。

<!-- prettier-ignore -->
```js
const m = module
{}
```
