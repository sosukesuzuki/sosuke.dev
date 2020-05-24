---
path: "/posts/oss-2020-04"
date: 2020-04-30
title: "4 月の OSS 活動"
tags:
  - "Prettier"
  - "OSS"
  - "ESLint"
---

4 月の OSS 活動です。今月は仕事と大学の方がそこそこ忙しく思うように OSS に時間をとれませんでしたが、カスタムブロックのサポートやずっと放置していたパイプラインオペレータのサポートができたのでそこは良かったかなと思います。

## Prettier

### Smart / F# スタイルのパイプラインオペレータのサポート

https://github.com/prettier/prettier/pull/6319

ECMAScript のパイプライン演算子のプロポーザルには３種類ありますが、Prettier がサポートしているのは[Minimal Pipeline](https://github.com/tc39/proposal-pipeline-operator/)のみでした。この PR では、それ以外の[Smart Pipeline](https://github.com/js-choi/proposal-smart-pipelines)、[F#-style Pipeline](https://github.com/valtech-nyc/proposal-fsharp-pipelines)のサポートを追加します。

この PR は実は 2019 年の 6 月に作成していたのですが、実装が難しい箇所があり約 10 ヶ月放置していました。しかし、唐突に良い実装を思いついたので実装してマージしました。

### Vue のカスタムブロックのサポート

https://github.com/prettier/prettier/pull/8023

Vue の SFC の中にはカスタムブロックとして任意の言語を記述することができます。しかし、渡されたテキストを見てもどの言語で書かれているのか判別できないという理由で、いままで Prettier はその中に書かれたコードをフォーマットしていませんでした。それでは不便なので `lang` や `type` 属性をカスタムブロックタグにつけた場合、それに対応した言語としてフォーマットを行う機能を追加しました。

<!-- prettier-ignore -->
```html
<template>
  <p>foo</p>
</template>
<custom-block lang="javascript">
const foo =     "foo";
</custom-block>
```

↑ このコード中の`custom-block` の中身は JavaScript としてフォーマットされるようになります。将来的には、2.1 から追加される `embeddedLanguageFormatting` オプションを使って属性なしでのフォーマットができるようにしたいと考えています。

### (DefenitelyTyped) 型定義を 2.0 用に更新

https://github.com/DefinitelyTyped/DefinitelyTyped/pull/43576

2.0 でいくつか API が更新されたけど追従できてなかったので修正します。

## typescript-eslint

### explicit-module-boundary-types ルールに `shouldTrackReferences` オプションを追加

https://github.com/typescript-eslint/typescript-eslint/pull/1778

`explicit-module-boundary-types` ルールは、export されている関数の型を明示することを強制します。しかし、変数に代入された関数の場合は警告が出ません。

**これは警告が出る**

```ts
export const foo = (arg) => arg;
```

**これは警告が出ない(よくない)**

```ts
const foo = (arg) => arg;
export default foo;
```

なので、`shouldTrackReferences`オプションを追加して、それが `true` のときは変数の参照を追って警告を出すようにしました。以前までとの挙動が変わることはありませんが、このオプションはデフォルトで `true` になります。
