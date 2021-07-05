---
layout: article-layout.11ty.js
date: 2020-06-09
title: "Prettier の中間表現 Doc をシュッと試せる JavaScript のサブセットを作ってブラウザで動かす"
tags: post
---

- https://github.com/sosukesuzuki/prettier-doc-interpreter

Prettier ではコードを整形する過程で Doc という中間表現を使うのですが、それをシュッと試せる JavaScript の(構文的には)サブセットを作ってブラウザで動かしてみました。

これがあると、Prettier を開発するときに Doc の挙動をすぐに確かめられるので嬉しくなります。

## Prettier のしくみ

まず、Prettier のしくみをざっくり説明します。

フォーマットしたいコードを受け取ったら、それをパースします。

パースしたら、AST を再帰的に見ていってこの記事の主役である Doc と呼ばれる中間表現に変換します。Doc はフォーマットの対象の言語に依らず、テキストの形を表現するためのデータ構造で、最終的に文字列に変換されます。

そして変換された文字列を返します。

![prettier-flow](/img/prettier-flow.png)

## Doc の作り方と形

Prettier のソースコード内には Doc を生成するための関数や変数(doc builder)が定義されていて、次のように使われています。(`"foo"`と`"bar"`は通常の JavaScript の文字列リテラルです)

```js
const doc = group(concat(["foo", hardline, "bar"]));
```

ちなみに、doc builder のドキュメントは https://github.com/prettier/prettier/blob/master/commands.md にあります。

このとき変数`doc`は次のようなオブジェクトになっています。

```js
// 変数 doc の中身
{
  "type": "group",
  "contents": {
    "type": "concat",
    "parts": [
      "foo",
      {
        "type": "concat",
        "parts": [
          {
            "type": "line",
            "hard": true
          },
          {
            "type": "break-parent"
          }
        ]
      },
      "bar"
    ]
  },
  "break": false
}
```

このオブジェクトを`printDocToString`という関数に渡すと文字列に変換できます。

```js
const { formatted } = printDocToString(doc);
console.log(formatted); // => foo\nbar
```

このあたりのロジックは Prettier のコアとなる部分で、開発初期のころからほとんど変更されていません。

プラグイン作る人くらいしか使わないと思いますが、doc builder や`printDocToString`は`prettier`パッケージで export されています。

## 作ったもの

- https://github.com/sosukesuzuki/prettier-doc-interpreter

Doc を生成するための式(e.g. `group(concat(["foo", hardline, "bar"]))`)を文字列として受け取って、変換した結果の文字列(e.g. `"foo\nbar"`)を返す関数です。

まだちょっとバギーだし機能不足なんですが...。

```shell
$ npm install prettier-doc-interpreter
```

で入ります。

こんな感じで使えます。

```js
import { evaluate } from "prettier-doc-interpreter";
const source = `group(concat(["foo", hardline, "bar"]))`;
const formatted = evaluate(source);
console.log(formatted); // => foo\nbar
```

## しくみ

(受け取った JavaScript のコードを実行して返すものなので、最初は`eval`でやっちゃおうかなーとも思ったんですが、危険だったりエラーを丁寧に吐けなかったりするし、おもしろくないのでやめました。)

まず、受け取ったコードを acorn でパースします。

そしたら AST を上から見ていって、`prettier/standalone`から import した doc builder に渡して Doc を作ります。このときに不正なノードや変な形をした Doc があったらエラーを投げます。

最後に、作った Doc を`prettier/standalone`から import した`printDocToString`に渡して文字列に変換して、返します。

パーサーに acorn を使った理由ですが、ブラウザで動かすことを考えるとできるだけ軽量なものが望ましいというのと、TS とか JSX とかをパースするつもりはなかったので @babel/parser みたいな高機能なものは不要だったというのがあります。

ただ、acorn の型定義はちょっと弱いので、型定義だけは`@types/estree`を使ってみました。

```ts
const ast = (acorn.parse(code, { locations: true }) as any) as ESTree.Node;
```

多分本当は acron の吐く AST と ESTree の型定義は異なると思うけど、とりあえず問題なく動いたのでよし！問題がでたら直すかも。

## ブラウザで動く Playground もあるよ

- https://prettier-doc-playground.netlify.app/
- https://github.com/sosukesuzuki/prettier-doc-playground

preact と TypeScript でできています。

`prettier-doc-interpreter`の実行は Web Worker でやってます。`comlink-loader`便利ですね。

人に共有できると便利なので、状態を URL ハッシュにもたせています。こういうやつにはよくある機能ですね。
