---
path: "/posts/oss-2020-03"
date: 2020-04-04
title: "3 月の OSS 活動"
tags:
  - "OSS"
  - "Prettier"
  - "ESLint"
---

誰かがこれを見てなにかを参考にしてくれたらいいなぁっていう気持ちと、自分のための活動の記録として、OSS 活動を毎月適当なタイミングでまとめていこうと思います。その３月分です。

## Prettier

最近レビューばかりでバグ修正とかがあんまりできてなかったんですが、３月は結構できました。

### [7709: 改行を含む変数代入・宣言のときのコメントの位置の修正](https://github.com/prettier/prettier/pull/7709)

改行とブロックコメントを含む変数の代入・宣言が壊れちゃうやつです。このバグによって Closure Compiler や JSDoc など、式の直前にコメントが存在することに意味があるツールでは、意味を破壊されてしまいます。

<!-- prettier-ignore -->
```js
// Input
const foo = /* comments */
  bar;

// Output
const foo /* comments */ = bar;

// This PR
const foo = /* comments */ bar;
```

### [7729: 空の型パラメータの中にコメントいれるとエラーが出る](https://github.com/prettier/prettier/pull/7729)

これは一体誰が困るんですかね。

<!-- prettier-ignore -->
```ts
// Input
const a: T</* comment */> = 1;

// Output
Error: Comment "comment" was not printed. Please report this error!

// This PR
const a: T</* comment */> = 1;
```

### [7764：TypeScript 3.8 の `export * as ns` 構文のサポート](https://github.com/prettier/prettier/pull/7764)

[`export * as ns`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#export-star-as-namespace-syntax) のサポートです。

これで、TS 3.8 から入るすべての構文のサポートが完了しました。

### [7804: Babel パーサーでの TypeScript 3.8 type only import/export の対応](https://github.com/prettier/prettier/pull/7804)

2.0 から `parser=babel-ts` オプションをつけることで Babel を使って TypeScript のパースができるようになったのですが、TypeScript 3.8 で追加された type only import/export のサポートができていませんでした。この PR はそれを修正します。

ちなみに、type only import/export は Babel 7.9 から入っているんですが、リリース直後にそれ周りのバグを見つけたのでツイッターで Babel のメンテナチームの方に確認したら、一瞬で Issue が作られて一瞬で直されて一瞬でリリースされていました。ありがたい。

### [7869: TypeScript の as を二項演算子としてフォーマットする](https://github.com/prettier/prettier/pull/7869)

今まで TypeScript の as は行の幅が長いときにうまいことフォーマットされないことがありました。例えば、下の例の場合は、`=` に直後に改行が入ることが期待されると思います。

<!-- prettier-ignore -->
```ts
// Input
const varibale = foooooooooooooooooooooooooooooooooooooooooooooooooooo as SomeType;

// Output
const varibale = foooooooooooooooooooooooooooooooooooooooooooooooooooo as SomeType;
```

これは、`as` に対してあまり凝ったロジックを使わずにフォーマットしていたので、想定通りといえば想定通りの挙動でした。ただ、TypeScript の `as` は基本的に JavaScript の二項演算子(`3 + 3` の `+` とか)と同様のフォーマットをして問題なさそうということになったので、そのように修正しました。

これは、もともと Babel や ESLint のメンテナの[kaicataldo](https://github.com/kaicataldo)が実装しかけていたアイデアを引き継いだものになります。

<!-- prettier-ignore -->
```ts
// This RP
const varibale =
　　foooooooooooooooooooooooooooooooooooooooooooooooooooo as SomeType;
```

### [7892: Flow の inexact object type で他にプロパティがないときにコメント入れるとエラーが出る](https://github.com/prettier/prettier/pull/7892)

これも誰が困るんだろうシリーズかもしれない。Flow 書かないからよくわかんないけど。

<!-- prettier-ignore -->
```js
// Input
type Foo = {
  // comment
  ...,
};

// Output
Error: Comment "comment" was not printed. Please report this error!

// This PR
type Foo = {
  // comment
  ...,
};
```

## eslint-plugin-vue

### [1086: `no-template-target-blank`ルールの追加](https://github.com/vuejs/eslint-plugin-vue/pull/1086)

まだマージされてません。

eslint-plugin-react の[jsx-no-target-blank](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-target-blank.md)相当のことを Vue のテンプレートでやります。これによって、`rel='noreferrer noopener'` なしで `target='_blank'` を使ったときに警告がでるようになります。

このルールはもともと会社で必要だったので社内向けに作ったのですが、せっかくだから eslint-plugin-vue に追加してみようと思い PR を投げました。
