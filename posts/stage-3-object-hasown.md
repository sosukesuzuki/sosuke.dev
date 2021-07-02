---
layout: article-layout.11ty.js
date: 2021-07-02
title: "JavaScript の Object.hasOwn について"
tags: post
---

この記事では、現在 Stage 3 の Object.hasOwn プロポーザルの概要や、経緯について解説する。

プロポーザルの詳細については https://github.com/tc39/proposal-accessible-object-hasownproperty を参照してほしい。

また Object.hasOwn は現在 Stage 3 であり、細かい仕様については今後更新される可能性がある。

## 概要

Object.hasOwn プロポーザルは、`Object.hasOwn` という新しいメソッドを導入する。

`Object.hasOwn` メソッドは、[`Object.prototype.hasOwnProperty()`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty)を`Object`のスタティックメソッドにしたものだ。

つまり、次の２つのプログラムは同じ挙動になる。

```js
let hasOwnProperty = Object.prototype.hasOwnProperty;

if (hasOwnProperty.call(object, "foo")) {
  console.log("has property foo");
}
```

```js
if (Object.hasOwn(object, "foo")) {
  console.log("has property foo");
}
```

## 経緯とモチベーション

`Object.prototype.hasOwnProperty` はライブラリ開発者であれば使ったことがあるだろう。

たとえば、for in 等でオブジェクトのプロパティを走査するときに意図しないものを参照しないために使うことがある。

たとえば次のようなコードを考える。

```js
const foo = { prop1: 1 };

for (const prop in foo) {
  console.log(prop);
}
```

このようなコードを書いたとき、多くの場合 `prop1` が表示されることを期待するだろう。実際、これをそのまま実行すれば現在のほとんどの JavaScript エンジンでは `prop1` と表示される。

しかしこのコードより前に、次のような `Object.prototype` を変更するようなコードがあった場合、結果が変わってしまう。

```js
Object.prototype.prop2 = 2;

const foo = { prop1: 1 };

for (const prop in foo) {
  console.log(prop);
}
```

これを実行すると、次のように`prop2`も表示される。

<!-- prettier-ignore -->
```js
prop1
prop2
```

「そんなコード書かないよ」と思うかもしれないが、依存の奥深くのライブラリに `Object.prototype` を更新するコードが入っていたらどうだろうか（そのようなライブラリは使いたくはないが）。

そのような懸念から、for in を使う場合には`Object.prototype.hasOwnProperty` 等を使ってガードすることが多い。`Object.prototype.hasOwnProperty`を使えば、プロトタイプをさかのぼらずにそのオブジェクトに特定のプロパティが存在するかどうかを確かめることができる。

なので、次のように`hasOwnProperty`を使うことで継承されている`prop2`を除いて`foo`に存在する`prop1`だけを表示することができる。

```js
Object.prototype.prop2 = 2;

const foo = { prop1: 1 };

for (const prop in foo) {
  if (foo.hasOwnProperty(prop)) {
    console.log(prop);
  }
}
```

しかし、実際には`foo`に必ず`hasOwnProperty`が存在するという保証はない。`hasOwnProperty`自体を上書きすることができるからだ。

```js
Object.prototype.prop2 = 2;

const foo = {
  prop1: 1,
  hasOwnProperty: () => true,
};

for (const prop in foo) {
  if (foo.hasOwnProperty(prop)) {
    console.log(prop);
  }
}
```

このコードを実行すると、次のように継承された`prop2`も表示されてしまう。

<!-- prettier-ignore -->
```js
prop1
hasOwnProperty
prop2
```

これを避けるため、多くの場合次のようにして必ず `Object.prototype.hasOwnProperty` を参照するパターンがよく知られている。

```js
Object.prototype.hasOwnProperty.call(foo, key);
{}.hasOwnProperty.call(foo, key);

```

ESLint にはそれを強制するためのルールが存在する(参照: https://eslint.org/docs/rules/guard-for-in)。

このパターンはよく知られており、ESLint のルールの存在もあって浸透しているように思う。しかし、記述量が多くなる上に直感的でなく面倒くさい。さらにこのパターンを理解するためには、[`Function.prototype.call`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Function/call)や、現在ではあまり使われなくなったプロトタイプについての理解が求められるため、JavaScript 初心者にとってややハードルが高いようにも思う。

そこで、`Object`のスタティックメソッドとして同等の機能を実装することで、使いやすくしようというのが Object.hasOwn プロポーザルの目的である。

## 命名について

実は`Object.hasOwn` はもともと `Object.has` という名前で提案されていた。

しかし、`Object.has` という名前ではプロトタイプをさかのぼる挙動が想像されるということから改名されることになった。

JavaScript には [Reflect](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Reflect) というトップレベルのオブジェクトが存在する。そして、Reflect には Object と同じようなセマンティクスを持つスタティックメソッドがいくつか存在している。さらに Reflect には [`Reflect.has`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Reflect/has) というスタティックメソッドが存在する。`Reflect.has` は `in` 演算子と同じようなセマンティクスを持ち、つまりプロトタイプをさかのぼってプロパティの有無をチェックする。

なので、JavaScript プログラマーから「Reflect と Object には同じようなセマンティクスのメソッドがいくつか生えていて、両方とも `has` が存在するなら、`Object.has` も `Reflect.has` と同じようにプロトタイプをさかのぼりそう」と思われてしまう可能性がある。そこで、`Object.has` ではなく `Object.hasOwn` という名前に変更された。

この改名に関する議論は以下のリンクを参照してほしい

- https://github.com/tc39/proposal-accessible-object-hasownproperty/issues/3
- https://github.com/tc39/notes/blob/master/meetings/2021-04/apr-20.md#objecthas-for-stage-1

## 提案の進化の速さ

プロポーザルにとって本質的なことではないが、このプロポーザルは異様な速さで Stage を進んでいる。

2021 年 4 月の TC39 のミーティングで初めて議題にあがり、そのミーティング内で Stage 1 を飛ばしていきなり Stage 2 になった。

さらに、2021 年 5 月の TC39 ミーティングでは Stage 3 になった。

現在では、V8 と SpiderMonkery ではすでにフラグ付きで実装されている。

2021 年 7 月のミーティングでも、"Accessible Object hasOwnProperty update" で議題にあがる予定だ。

このままいけば ES2022 に入る可能性もあるだろう。

## おわりに

数年前 JavaScript を始めたころ `Object.prototype.hasOwnProperty.call(foo, key);` というコードを見て困惑したことがある身としては、よく使われるこのパターンが言語に入ってくれるのは喜ばしいことだと考えている。

また、Stage を駆け上がっていく様を見るのも楽しいので、今後も注目しておきたいプロポーザルの一つである。
