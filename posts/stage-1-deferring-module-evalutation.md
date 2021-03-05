---
layout: article-layout.11ty.js
date: 2021-03-05
title: "JavaScript の Deferring Module Evaluation について"
tags: post
---

先日筆者のブログに Module Fragments について解説する記事を投稿した。Module Fragments はモジュールを使って開発されたウェブサイトのパフォーマンスを改善するためのプロポーザルである。

https://sosukesuzuki.dev/posts/stage-0-module-fragments/

実は、Module Fragments 以外にも最近活発なモジュールに関するパフォーマンスを向上させるための興味深いプロポーザルが存在する。それが Deferring Module Evaluation だ。

Defering Module Evaluation は 2021 年 1 月の TC39 ミーティングで初めて発表され、Stage 1 になったばかりだ。

この記事では Deferring Module Evalutation のモチベーションや仕様について解説する。

## 概要

Deferring Module Evalutation はモジュールの評価を遅延させるための提案である。

## モチベーション

現代のウェブアプリケーション開発では、ECMAScript Modules(ESM)を使った大規模な JavaScript のコードベースを扱うことがある。そういったコードベースでは、実行時のモジュールの読み込みのパフォーマンス上の影響が懸念される。

そのようなパフォーマンス上の悪影響はアプリケーションがローンチされたあと、成熟してきたころにボトルネックになってくることが多い。そのようなタイミングでモジュール読み込みのパフォーマンスを改善させようとした場合、かなり大幅な変更が必要になってしまう。

具体的な例を示す。次の JavaScript のプログラムを見てほしい。

```js
import { someMethod } from "./my-module";

function rarelyUsed() {
  // 他の何らかの処理
  // ここにたどり着くまでに return されているかもしれない
  someMethod();
}

function definatelyCalled() {
  // 他の何らかの処理
  // ここにたどり着くまでに return されているかもしれない
  rarelyUsed();
}
```

名前の通り `rarelyUsed` 関数は滅多に呼び出されることがなく、`definatelyCalled` 関数は必ず呼び出されるものとする。

`rarelyUsed` 関数の中で呼び出されている `someMethod` は滅多に呼び出さることはない。しかし、`someMethod`はトップレベルで import されている。なので、`someMethod` が呼び出されるかどうかは関係なくモジュールを読み込んでしまっている。

ほとんどの場合 `someMethod` が呼び出されないので`my-module`の読み込みコストは無駄になってしまう。

次のように dynamic import を使うことで、この状況を改善することができる。

```js
async function lazySomeMethod() {
  const { someMethod } = await import("./my-module");
  return someMethod();
}

async function rarelyUsed() {
  // 他の何らかの処理
  // ここにたどり着くまでに return されているかもしれない
  await lazySomeMethod();
}

async function definatelyCalled() {
  // 他の何らかの処理
  // ここにたどり着くまでに return されているかもしれない
  await rarelyUsed();
}
```

`lazySomeMethod` という関数を新たに追加した。この関数は dynamic import を使って動的に `my-module` から `someMethod` を読み込み、実行して返す。

修正されたバージョンでは、`lazySomeMethod` が呼び出されない限り `my-module` がロードされることはない。

しかし、この方法にもいくつかの問題がある。

まず import する関数が増えるたびにそれを動的に import し実行するラッパー関数を定義する必要がある。例でいう `lazySomeMethod` のことだ。

さらに`import(...)` が Promise を返すため async 関数が増えてしまい、`someMethod` が直接または間接的に呼び出されるすべての箇所を非同期として扱う必要がある。

Deferring Module Evaluation はこのような問題を解決するための遅延 import を実現するための構文を導入する。

## 構文

Deferring Module Evalutation が導入する構文はまだ確定されていない。

現時点では次の 3 つの方法が提案されており、それぞれに利点と欠点が存在する。大きく分類すると「import する側で明示するタイプ」と「import される側で明示するタイプ」がある。

1 つめは Import Assertions で言及されている[evalutators attributes]()の構文を使う方法である。これは「import する側で明示するタイプ」の方法だ。

```js
import {x} from "y" with { lazyInit: true }
import defaultName from "y" with { lazyInit: true }
import * as ns from "y" with { lazyInit: true }
```

この方法は可読性が高く import される側から見てどのモジュールを遅延させているのかをひと目で判別できるという利点がある。一方で欠点としては、多くの場合一箇所で遅延 import した場合他の箇所で import するときも遅延させる必要がありそのたびに明示する必要があるということと、evaluator attributes の進捗に依存するということが挙げられる。

２つめは通常の import ステートメントの直前に`lazy`キーワードを置くことで明示する方法である。これも「import する側で明示するタイプ」の方法だ。

```js
lazy import {x} from "y";
lazy import defaultName from "y";
lazy import * as ns from "y";
```

この方法は evaluator attributes を使った方法と同じく可読性が高いという点に加えて、他の提案を待つ必要がないという利点がある。しかし evaluator attributes を使った方法と同様に、一箇所で遅延 import した場合他の箇所で import するときも遅延させる必要がありそのたびに明示する必要があるという欠点もある。

3 つめの方法はディレクティブを使う方法である。これは「import される側で明示するタイプ」である。

```js

```
