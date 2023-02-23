---
layout: article-layout.11ty.js
date: 2023-02-24
title: "DefinitelyTyped がつらいので Prettier の型定義を本体のリポジトリに移すことにした"
tags: post
---

つい先程、https://github.com/prettier/prettier/pull/14212 という Pull Request を `next` ブランチにマージした。

これは DefinitelyTyped で管理されていた Prettier の TypeScript 用の型定義を Prettier 本体のリポジトリへと移す Pull Request だ。この Pull Request によって、v3 からは `@types/prettier` をインストールする必要がなくなる。

JavaScript で書かれたライブラリをメンテナンスしている他の人の意思決定の参考になるように、この記事ではこの変更を行ったモチベーションや手法について説明する。

## Prettier の JavaScript API の型定義の現状

Prettier は JavaScript から使える API を提供している。

たとえば、次のようにして Node.js や Web ブラウザの JavaScript から Prettier を使ってコードをフォーマットできる。

```js
// これは v3 で予定されている API であり、v2 とは若干異なることに注意
import * as prettier from "prettier";

const formatted = await prettier.format(
  `console.log("Hello, Worlld");`,
  { parser: "babe"; }
);
```

Prettier のソースコードは TypeScript ではなく JavaScript で記述されている。そのため、TypeScript 用の型定義ファイル(`*.d.ts`)を生成できず、npm で配布している `prettier` パッケージには型定義ファイルが含まれていない。一応、ソースコードの一部は JSDoc コメントを使って型が明示されているが型定義の生成に使えるほどちゃんとした運用はされていない。

しかしそれでは TypeScript から Prettier の JavaScript API を呼び出すときに不便なので、DefinitelyTyped に型定義ファイルを置いている。DefinitelyTyped に置かれている他のパッケージの型定義と同じように `npm i @types/prettier` でインストールできる。

## DefinitelyTyped のデメリット

DefinitelyTyped は JavaScript で書かれているパッケージに対して型定義ファイルを定義し、別のパッケージとして配布できる仕組みである。

これは、リポジトリ本体側がすでにメンテナンスされていなかったり、TypeScript に対応することに後ろ向きであったりする場合にも型定義ファイルを提供できるため便利である。

しかしながら、いくつかの大きなデメリットがある。

まず、リポジトリが巨大すぎる。DefinitelyTyped のリポジトリには無数の JavaScript ライブラリの型定義が含まれている。そのため `git clone` や `git pull` の実行には時間がかかるし、テキストエディタや GitHub での閲覧体験が悪い。これは、積極的に型定義をメンテナンスすることの妨げになる。

次に、alpha バージョンや beta バージョンのための型定義を配布するのが難しい。Prettier は現在 v3 の開発を進めていて、すでに alpha バージョンとして npm に配布されている。以前書いた記事で紹介したように、Prettier の v3 では API が破壊的に変更される予定だ。これはプラグイン開発者にとっては大きな影響がある。そのためいくつかのプラグインの開発者はすでに alpha バージョンを使って v3 対応の準備を進めてくれている。

TypeScript で実装されたプラグインの開発者は当然ながら v3 用の型定義を使って開発を進めたいと考えるが、`@types/prettier` として配布されているのは v2 用の型定義である。DefinitelyTyped の仕組みの上で alpha バージョン用の型定義を配布する方法があればよかったのだが、見つけられなかった。

これらの理由から Prettier の型定義を DefinitelyTyped から本体リポジトリに移すことを決定した。特に、プラグイン開発の体験は重要なので 2 つめの理由が決め手となった。

## 型定義ファイルを本体のリポジトリに移す

https://github.com/prettier/prettier/issues/14033 という issue を作成した。この issue では、この記事ですでに述べたような DefinitelyTyped を使った型定義の管理のメリットやデメリットなどの概略が説明されている。インターナルなチャットで共有したところ他のメンテナーからの支持が得られたので作業を始めた。

作業としては、DefinitelyTyped に含まれている Prettier の型定義ファイルを本体のリポジトリに移し、v3 で予定されている破壊的変更を反映するだけである。

型定義ファイルの内容はほとんどコピペで良いのだが、他にいくつか考えなくてはならないことがあった。

### 型定義ファイルをどこに配置するか、どうビルドするか

バンドルせずに JavaScript ファイルをそのまま配布するようなパッケージであれば、対応する JavaScript ファイルと同じ階層に型定義ファイルを配置してそのまま配信すれば良いだろう(たとえば、Sindre Sorhus の提供する Node.js 用ライブラリの多くはそのような構成になっている)。

しかし Prettier はソースコードをバンドルし `./dist` 以下に吐き出し、それを npm にパブリッシュしている。そのため `*.d.ts` ファイルをどこに配置するか考える必要があった。

自分が最初に考えたのは、ビルドスクリプトが置かれている `./scripts/build` 配下に適当なディレクトリを切って `*.d.ts` を置き、ビルド時にそれをそのまま `./dist` 以下にコピーするという方法だった。

その方法でも上手く機能したが、コードレビューの段階で「`*.d.ts` ファイルは、それに対応する各 JavaScript ファイルの隣において、そこからビルド時に `./dist` に移動するほうが良い」という指摘を受けた。その場合 `./src` 以下に型定義ファイルが配置されることになり、開発するときにも型定義ファイルに注意が向くだろうと考えたため、最終的にはその方法を採用した。

また、Prettier では `./dist` に吐き出す `package.json` もビルド時に生成するため、型定義ファイルのコピーの他に、[TypeScript 4.7 からサポートされた Conditional Exports の `types` フィールド](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#packagejson-exports-imports-and-self-referencing)を使って各エントリポイントに対応する型定義ファイルを指定するようにしている。

### テストはどうするか

DefinitelyTyped には型定義をテストする仕組みがある。

型定義を本体リポジトリに移すにあたって、自分たちでそのテストの仕組みを考える必要があった。

最初に検討したのは https://github.com/SamVerschueren/tsd というツールだ。これは `*.d.ts` ファイルをテストするためのツールで、自分たちの目的にぴったりだろうと考えた。しかし実際にはディレクトリの構成が縛られてしまうなどの制約があった。前述のとおり Prettier はやや特殊な構成をとっているため、このツールをそのまま使うことはできなかった。

最終的には、Jest から TypeScript Compiler API を実行し https://github.com/TypeStrong/ts-expect というライブラリを使って型を検証するという方法を選んだ。

`ts-expect` を使うと、次のようにしてある値がある型であることをチェックできる。

```ts
import { expectType } from "ts-expect";

expectType<string>("test");
expectType<string>(333); // コンパイルエラーになる
```

`ts-expect` を使った TypeScript のコードに対して TypeScript Compiler API を使って型チェックを行い、diagnostics メッセージの数が 0 であれば型エラーが存在しないということなので、テストをパスしたとみなす。

実際のコードは https://github.com/prettier/prettier/blob/next/tests/dts/unit/run.js にあるので、詳細に興味がある人はそちらを参照してほしい。

## おわりに

これでプラグインの開発体験が多少改善されるだろう。

最後に、Prettier が継続して開発されることに関心があり、金銭的に余裕がある企業や個人は https://opencollective.com/prettier から Prettier に寄付することを検討してほしい。
