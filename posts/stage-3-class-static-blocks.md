---
layout: article-layout.11ty.js
date: 2021-07-06
title: "JavaScript の Class Static Blocks について"
tags: post
---

この記事では現在 Stage 3 の [Class Static Blocks](https://github.com/tc39/proposal-class-static-block) について解説する。

なお、まだ現時点で Stage 3 であるため実装状況や細かい仕様は今後変更される可能性がある。

## 概要

Class Static Blocks プロポーザルは、クラス内でスタティックなメンバにアクセスできるブロックの構文を導入する。

次のコードの `static {` から始まるブロックが新たに導入される構文である。このとき、スタティックブロック内の`this.foo`はスタティックなメンバである。

```js
class C {
  static foo;
  static {
    this.foo = "foo";
  }
}
```

スタティックブロックはクラス`C`が評価されるタイミングで実行される即時実行関数のようなものと見ることもできる。また、クラスは複数のスタティックブロックを持つことができ、その場合は上から順に実行される。

## モチベーション

2021年4月のTC39ミーティングで [Static Class Features](https://github.com/tc39/proposal-static-class-features) というプロポーザルが Stage 4 になった。Static Class Features は、次のようにスタティックなメンバをクラス内に列挙して定義するための構文を導入する。

```js
class C {
  static foo = "foo";
}
```

このとき、`C.foo` は `"foo"` である。

この Static Class Features の構文によって容易にクラスのスタティックなメンバを定義できるようになった。

しかし、JavaScript の制御構文のほとんどは文である。そのため、Static Class Features の構文のみでは、複雑な計算の結果をスティックメンバの初期値として設定するのは難しい。

たとえば、典型的な例として try catch について考えてみよう。try catch を使って次のような処理を記述したいとする。

- try 内でなんらかの計算をする
- 計算が成功した場合はその結果をクラス`C`のスタティックメンバ`foo`に入れる
- 計算が失敗した場合はフォールバックの値をクラス`C`のスタティックメンバ`foo`に入れる

このような場合に Static Class Features の機能だけではクラス内に書くことができない。

```js
class C {
  static foo;
}
try {
  const result = calculate();
  C.foo = result;
} catch {
  C.foo = -1;
}
```

ここで Class Static Blocks を使うと次のようにクラス内に書くことができる。

```js
class C {
  static foo;
  static {
    try {
      const result = calculate();
      this.foo = result;
    } catch {
      this.foo = -1;
    }
  }
}
```

また、Class Static Blocks はクラス内に閉じているためプライベートなメンバにもアクセスできる。そのため、次のようにしてクラス外からの書き込みはできないが読み込みはできる値を作ることができる。

```js
let getFooOfC;
class C {
  #foo;
  constructor(foo) {
    this.#foo = foo;
  }
  static {
    getFooOfC = (c) => c.#foo;
  }
}
const c = new C("private value");
getFooOfC(c); // -> "private value"

```

## TypeScript 4.4

実は Class Static Blocks は、先日ベータ版が公開された TypeScript 4.4 に実装される予定である。公式のベータ版アナウンス記事では Class Static Blocks についての言及がなかったので気づかなかった人も多いのではないだろうか。

実際に TypeScript の Playground で試してみることもできる([Playground link](https://www.typescriptlang.org/play?ts=4.4.0-dev.20210705#code/DYUwLgBA5uBiD28DyAzAwgLggCgMZbQEoIBeAPggGcwAnASwDsoBuAKFd2AENLKI0IAb1YQIAYhSI2o3PAbUaAV1xh4NbJPhYFjKMWGjRYABZ1KAOgmJSETdIgBfEVTBcwdXEOeiYYBMnQbPGJyCFxLO2cnJw45ajCbBhAAd35sACIAB3oANzcQCDzgRRB0wjZff1Q0AEJg5ggAekaIAFoKLNz8wq5i0tYgA))。

- ref: https://devblogs.microsoft.com/typescript/announcing-typescript-4-4-beta/
- ref: https://github.com/microsoft/TypeScript/pull/43370
- ref: https://twitter.com/robpalmer2/status/1410855524770406403

## おわりに

現代のフロントエンド開発ではそもそもクラスを使う機会が少なくなっているように感じる。そのため、Class Static Blocks が使えるようになっても実際に使うウェブ開発者はそこまで多くないだろう。

しかしながら、ライブラリ開発などには役に立つ可能性が高いので、覚えておくとよいだろう。
