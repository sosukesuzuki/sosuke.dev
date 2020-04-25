---
path: "/posts/why-prettier-ts3.8-support-delay"
date: 2020-03-06
title: "Prettier の TypeScript 3.8 対応遅れてそうだけどどうしたの？"
---

**追記:**

3 月 21 日に[Prettier 2.0](https://prettier.io/blog/2020/03/21/2.0.0.html)はリリースされ、無事 TypeScript 3.8 のサポートも行われました〜

---

**ここから本文:**

TypeScript 3.8 の正式版が 2 月 20 日 にリリースされましたね。([リリースノート](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/))

type only import/export や ECMAScript private field、top-level await など、いくつかの便利な新しい構文がサポートされるようになりました。

でもまだ、 Prettier はそれらをサポートできていません。

## ベータ版リリース直後から Issue はつくられていた

3.8 のベータ版がリリースされたのが 1 月 10 日です。([リリースノート](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/))

実はその翌日の 1 月 11 日に Prettier に Issue が作られています。([prettier/prettier#7263-Support TypeScript 3.8](https://github.com/prettier/prettier/issues/7263))

対応するのを忘れていたとか、必要だと思っていなかったとかそういうわけではなく、きちんと認識した上でまだサポートできていません。

## 新しい構文のサポートはパーサーライブラリに依存する

Prettier は自分でパーサーを実装しておらず、外部パーサーライブラリに依存しています。(JavaScript のパースには @babel/parser を使っているし、 Markdown のパースには remark を使っています。)

TypeScript のパースには、typescript-eslint チームが開発している typescript-estree を使っています。これは、 TypeScript Compiler API を使って TS コードをパースし、それを ESTree っぽい AST に変換するためのライブラリです。

そして、新しい構文のサポートをするときはこの依存するパーサーの負担が大きくなります。

Prettier 側が大変なことも構文の種類によってはあると思いますが、今回追加される構文たちの場合、すでに(見た目の上では)似た構文が存在するので printer の修正は難しくないと思います。

## Babel や ESTree との兼ね合い

[typescript-eslint/typescript-eslint#1465-WIP: feat: new ast for typescript 3.8-comment](https://github.com/typescript-eslint/typescript-eslint/pull/1465#issuecomment-591562659)

新しい構文のサポートをするとき、 typescript-eslint チームだけでそれを行うことはできません。

各々が勝手に実装すると、ツール間で扱う AST のノードの形がずれてしまうため、Babel や ESTree と相談しつつ決定する必要があります。

以前、TypeScript 3.7 で実装された Optional Chaining と Nullish Coalescing のときにこのあたりで若干失敗しているようです。

3.7 がリリースされたあと typescript-estree は Babel と同様の形のノードを採用する決定をしました。([Babel の AST の仕様](https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md))

しかし、 ESTree はそれとは異なる形のノードを採用しようとしているので、ESLint は Babel/typescript-eslint とは違った AST を扱うことになります。([estree/estree#204-Update es2020.md for Dec 2019](https://github.com/estree/estree/pull/204)で Optional Chaining と Nullish Coalescing のノードの形が議論されていて、まだマージされていないみたいですが。)

こういった自体を避けるため、今回は慎重になっているようです。

あと typescript-eslint チームはだいたいみんなボランティアだから時間がないみたいです。

## 待っててね

つまり、Prettier チームとしては typescrit-estree の更新を待つ必要があり、それを開発している typescript-eslint チームとしては Babel や ESTree との兼ね合いがあるので全体的に遅れているという感じです。

誰も悪くないので気長に待ちましょう。
