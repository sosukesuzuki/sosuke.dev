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

`Object.prototype.hasOwnProperty` は使ったことがあるだろう。

たとえば、for in 等でオブジェクトのプロパティを走査するときに意図しないものを参照しないために使うことがある。

たとえば次のようなコードを考える。

```js
const foo = { prop1: 1 };

for (const prop in foo) {
  console.log(prop);
}
```

このようなコードを書いたとき、多くの場合 `prop1` が表示されることを期待するだろう。実際、これをそのまま実行すれば `prop1` と表示される。

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

「そんなコード書かないよ」という人もいるだろう。しかし、依存の奥深くのライブラリに `Object.prototype` を更新するコードが入っていたらどうだろうか。

そのような懸念から、for in を使う場合には`Object.prototype.hasOwnProperty` 等を使ってガードすることが多い。`Object.prototype.hasOwnProperty`を使えば、プロトタイプをさかのぼることなく、そのオブジェクトに特定のプロパティが存在するかどうかを確かめることができる。

なので、次のように`hasOwnProperty`を使うことで、継承されている`prop2`を除いて`foo`に存在する`prop1`だけを表示できる。

```js
Object.prototype.prop2 = 2;

const foo = { prop1: 1 };

for (const prop in foo) {
  if (foo.hasOwnProperty(prop)) {
    console.log(prop);
  }
}
```

しかし、実際には`foo`に必ず`hasOwnProperty`が存在するという保証はない。なぜなら、`hasOwnProperty`自体を上書きできるからだ。

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

また、たとえば`Object.create(null)`で生成されたオブジェクトには`hasOwnProperty`が存在しない。

```js
Object.create(null).hasOwnProperty("foo");
// Uncaught TypeError: Object.create(...).hasOwnProperty is not a function
```

このようなことを避けるため多くの場合次のようにして、必ず `Object.prototype.hasOwnProperty` を参照するパターンがよく使われている。

```js
Object.prototype.hasOwnProperty.call(foo, key);
{}.hasOwnProperty.call(foo, key);

```

ESLint にはそれを強制するためのルールが存在する（ 参照: https://eslint.org/docs/rules/guard-for-in ）。

このパターンはよく知られており、ESLint のルールの存在もあって浸透しているよう。しかし、記述量が多くなる上に直感的でない。
さらに、このパターンを理解するためには、[`Function.prototype.call`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Function/call)や、現在ではあまり使われなくなったプロトタイプについての理解が求められる。そのため、JavaScript 初心者にとってはややハードルが高いように感じる。

そこで、`Object`のスタティックメソッドとして同等の機能を実装することで、使いやすくしようというのが Object.hasOwn プロポーザルの目的である。

## 命名について

実は`Object.hasOwn` はもともと `Object.has` という名前で提案されていた。

しかし、`Object.has` という名前ではプロトタイプをさかのぼる挙動が想像されるということから改名されることになった。

JavaScript には [Reflect](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Reflect) というトップレベルのオブジェクトが存在する。そして、Reflect には Object と同じようなセマンティクスを持つスタティックメソッドがいくつか存在している。さらに Reflect には [`Reflect.has`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Reflect/has) というスタティックメソッドが存在する。`Reflect.has` は `in` 演算子と同じようなセマンティクスを持ち、つまりプロトタイプをさかのぼってプロパティの有無をチェックする。

なので、JavaScript プログラマーが次のように推測してしまう可能性が高い。

- Reflect と Object には似たセマンティクスのメソッドがいくつか存在する。
- Reflect には `has` というスタティックメソッドが存在する。
- ならば、`Object.has` も `Reflect.has` と同じようにプロトタイプをさかのぼるだろう。

このような懸念から、`Object.has` ではなく `Object.hasOwn` という名前に変更された。

この改名に関する議論は以下のリンクを参照してほしい。

- https://github.com/tc39/proposal-accessible-object-hasownproperty/issues/3
- https://github.com/tc39/notes/blob/master/meetings/2021-04/apr-20.md#objecthas-for-stage-1

## 提案の進化の速さ

プロポーザルにとって本質的なことではないが、このプロポーザルは異様な速さで Stage を進んでいる。

2021 年 4 月の TC39 のミーティングで初めて議題にあがり、そのミーティング内で Stage 1 を飛ばしていきなり Stage 2 になった。そして、2021 年 5 月の TC39 ミーティングでは Stage 3 になった。

現在 V8 と SpiderMonkery ではすでにフラグ付きで実装されている。

2021 年 7 月のミーティングでも、"Accessible Object hasOwnProperty update" として議題にあがる予定だ。

このままいけば ES2022 に入る可能性もあるだろう。

## おわりに

筆者自身、数年前に JavaScript を始めたころは `Object.prototype.hasOwnProperty.call` を使ったコードを見て困惑した記憶がある。なので、よく使われるこのパターンが言語に入ってくれるのは喜ばしいことだと考えている。

また、Stage を駆け上がっていく様を見るのも楽しいので、今後も注目しておきたいプロポーザルの1つである。
