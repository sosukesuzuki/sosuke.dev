---
path: "/posts/oss-2020-05"
date: 2020-06-01
title: "5月のOSS活動"
tags:
  - "Prettier"
  - "OSS"
  - "ESLint"
---

5 月のオープンソース活動です。意外とちゃんとやってた。

## Prettier

Vue や HTML の改善をやっていたような気がします。あと Babel 7.10 や TypeScript 3.9 の対応も若干。ここに載せた以外にも細かな改善もしました。

### Vue の SFC のパース改善

https://github.com/prettier/prettier/pull/8153

Prettier は HTML をパースするために[angular-html-parser](https://github.com/ikatyang/angular-html-parser/tree/master/packages/angular-html-parser)という Angular の HTML パーサーのフォークを使っているんですが、Vue の SFC のような HTML ではないけど HTML っぽいものにもそれを使用しています。

今までは Vue の SFC をそのまんま HTML としてパースしていました。なのでカスタムブロック内や pug 等の HTML 以外の言語を使った template 内に HTML タグとして認識されちゃう文字のパターンを入れるとシンタックスエラーになっていました。([Playground Link](https://prettier.io/playground/#N4Igxg9gdgLgprEAuEAeAhAWkwAkMoMgMQyBJDAAoBOcMMAlnGYOYMgqwyCVDID8MgewyDDDIBMMg6gyARDIDEGQBYMgTQZA0QzDA7QyBnhkD9DJ0D1DIE6GQBUMgS4ZWgawZAVgzic2AHwAdKKjABXAM4wIAW0wAjADYQwAaxNRIUGzgBmEBA4ALw44TjGaAD0UQDcpqjRljb2Tq4ehiAANCAQAA400FbIoACGZGQQAO4kFQglKGXO1WUAniW5jmRlHpQAyvm91FAA5sgwZBZwuQAWMHbOAOqz1PBWQ2Bw-Q1r1ABua23I4FadICNWdDDkZaN2Zcj+zVe5AFZWAB4AQj19MP0ynY4AAZEZwJ4vGYgD6ffojUbOOAARQsEHgkOcrxAQzIVzIJ320xyOLIIxgS2oABMYLNkAAOAAMuXyVSuSx6+ROrLg+P2ENyAEc0fByAVGiAylZMFA4HAqfKSRRhdQKLd7o8kM8sdCrnZqBMprqEUjUeiIVqobkYGVHJSaXSkAAma09ajOBEAYXsDxOvIArCTrHAACq2xra7FEuAASSgCtg-TAZMKAEF4-0YG0kZirgBfPNAA))

```
<!-- これをPrettierでフォーマットしようとするとシンタックスエラーになる -->
<custom-block>
const foo =    "</";
</custom-block>
```

これを解消するためにいくつか方法を考えました。[vue-eslint-parser](https://github.com/mysticatea/vue-eslint-parser)を使うか？とか、[Vue 公式の SFC コンパイラのパーサー](https://github.com/vuejs/vue-next/tree/master/packages/compiler-sfc)を使うか？とか。しかし、前者はカスタムブロックのサポートを公式にはしていないようで今回のニーズを満たすパース結果が得られず、後者はルートのコメント情報がパース結果に残らずフォーマッターに使うには不十分でした。

なので angular-html-parser を修正してもらって、最終的に少々トリッキーな方法で解決しました。気が向いたらそのお話もどこかに書くかもしれません。

### Stage-1 プロポーザル private filed in `in` の対応

https://github.com/prettier/prettier/pull/8431

[Babel 7.10 で対応された Stage-1 のプロポーザル](https://babeljs.io/blog/2020/05/25/7.10.0#private-fields-in-in-11372-https-githubcom-babel-babel-pull-11372)の対応です。次のようなコードはいままでシンタックスエラーだったんですが、フォーマットできるようになります。Prettier 側の対応はパーサーのバージョンアップとオプションの指定だけだったので楽でした。

```js
#prop in obj;
```

### TypeScript 3.9 で入った Non Null Assertion と Optional Chaining の解釈の変更の対応

https://github.com/prettier/prettier/pull/8450

リリースノートを見て TypeScript 3.9 は新しい構文ないから Prettier の対応ないじゃん！って思ってたらありましたね。

Babel 7.10 も同様の修正が入っているので、`babel-ts`パーサーにも対応しています。

TypeScript 3.8 までは

```ts
x?.y!.z;
```

は

```js
(x === null || x === void 0 ? void 0 : x.y).z;
```

という JavaScript にコンパイルされていたんですが、TypeScript 3.9 からは

```js
x === null || x === void 0 ? void 0 : x.y.z;
```

にコンパイルされるようになりました。なので以前までの挙動を再現したい場合にカッコを補ってあげなくてはいけないんですが、Prettier はそのカッコをはずすようにフォーマットをしていたので、維持するようにしました。

<!-- prettier-ignore -->
```ts
// Input
(a?.b)!.c;

// Prettier stable
a?.b!.c;

// Prettier master
(a?.b)!.c;
```

## eslint-plugin-vue

### `no-arrow-functions-in-watch` ルールの追加

https://github.com/vuejs/eslint-plugin-vue/pull/1155

[ドキュメント](https://vuejs.org/v2/api/#watch)に書いてあるんですが、Vue の`watch`にアロー関数を使うのはアンチパターンです。`this`で束縛される値が変わってしまって、Vue インスタンスを指さなくなります。

なので、`watch`にアロー関数を使っているときに警告を出すルールを追加しました。

詳しくは eslint-plugin-vue のドキュメントの https://eslint.vuejs.org/rules/no-arrow-functions-in-watch.html を見ていただけると。

## typescript-eslint

### `method-signature-style`ルールの自動修正のバグの修正

https://github.com/typescript-eslint/typescript-eslint/pull/1966

TypeScript では interface の関数プロパティを二通りの方法で書くことができます。

```ts
// メソッドのショートハンド
interface T1 {
  func(arg: string): number;
}

// 通常の関数プロパティ
interface T2 {
  func: (arg: string) => number;
}
```

`method-signagure-style`ルールはこれをどちらかに強制することができます。

ただ、メソッドのオーバーロードがあったときにメソッドのショートハンドから通常の関数プロパティに強制すると、ルールの自動修正の結果がエラーになってしまうバグがありました。

例えば、次のコードを通常の関数プロパティに強制することを考えます。

```ts
interface T {
  method(): void;
  method(arg: string): void;
  method(arg: number): string;
}
```

今までの実装だと、このように修正されていました。

```ts
interface T {
  method: () => void;
  method: (arg: string) => void;
  method: (arg: number) => string;
}
```

実際試してみるとわかりますが([Playground link](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgCrIN4ChnILYRgAWA9gCYBcAFAJTIC8AfMgG4nBkDcO+hplyKnCgBzCsgDOYKKBF0mrdlx4Fi5cUNHiQAVzwAjaPOZSZIEdwC+QA))、これは`Duplicate identifier 'method'.`でコンパイラに怒られてしまいます。なので、これを intersection types としてフォーマットすることでこれを回避します。

```ts
interface T {
  method: (() => void) & ((arg: string) => void) & ((arg: number) => string);
}
```

これはセーフになります([Playground link](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgCrIN4ChnILYRgAWA9gCYBcAFFQJTIC8AfMgG4nBn0BkyNcUAOYVkAZzBRQg+szYcuyXvyEiQAVzwAjaDJbjJIaQG4sAXyxA))。
