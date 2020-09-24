---
layout: article-layout.11ty.js
date: 2020-01-05
title: "Prettier がファイルパスからパーサを推測するときの情報源"
tags: post
---

Prettier の`.cjs`対応をしようとおもって、すでに対応されている`mjs`とかで grep してもヒットしないからどこに情報持ってるんだろうって思って調べたメモをちょっとちゃんと書いたものです。

## 前提

### 1: Prettier はファイル名からパーサーを推測する

Prettier を CLI から使うとき、`parser`オプションを使ってパーサーを指定することができます。

```bash
# パーサーオプションを指定してみる
$ prettier foo.js parser=babel
```

ただし、ファイル名からパーサーを推測できるときは、`parser`オプションを省略できます。「`foo.js`は拡張子が`.js`だから、JavaScript としてパースすればいいよね」といった具合に、Prettier がパーサーを推測してくれます。

```bash
# これもオッケー
$ prettier foo.js
```

もっとも多いユースケースであるソースコードのフォーマットにおいては、パーサーを明示的に指定せずに使っている人が大半だと思います。

### 2: JavaScript としてパースしてほしいいろんなファイル

`.js` ファイルはもちろんですが`.jsx` や `.es6` など、JavaScript としてパースしたいファイルが他にもいくつかあります。

`.cjs`も JavaScript としてパースしたいファイル拡張子の一つなのですが、現時点で Prettier は対応していませんでした。(`.mjs`は対応しています。)

```shell
$ prettier test.mjs
console.log("Hello, ECMAScript Modules!");

$ prettier test.cjs
test.cjs[error] No parser could be inferred for file: test.cjs
```

(補足)
一応 `.cjs` について大雑把に解説しておきます。Node.js は CommonJS と ECMAScript Modules という２つのモジュールシステムをサポートしていて、あるファイルがそのどちらのモジュールシステムを使って書かれているのかを Node.js になんらかの方法で伝える必要があります。その方法の一つがファイル拡張子であり、`.cjs`の場合は CommonJS、`.mjs`の場合は ECMAScript Modules となります。詳しく知りたい人は https://nodejs.org/api/esm.html を読んでください。

## Prettier Plugins

https://prettier.io/docs/en/plugins.html

Prettier にはプラグインという機能があり、コアで対応できていない言語でも外部のプラグインとして対応することができます。

例えば、GitHub の Prettier オーガナイゼーション下には https://github.com/prettier/plugin-php や https://github.com/prettier/plugin-ruby といったプラグインが存在しており、コミュニティによって管理されています。

Prettier のプラグインは次の５つを named export することで実装できます。(`options`と`defaultOptions`は必須ではなかった気がする)

- `languages`
- `parsers`
- `printers`
- `options`
- `defaultOptions`

この`languages`というのは、当然ですが決められた形をしたオブジェクトの配列で、そのオブジェクトには`extensions`というプロパティを含めることができます。**そして`extensions`に渡す配列で、言語と拡張子の対応付け行っています。**

実は、JavaScript や HTML などのコアでサポートしている言語も、内部的にはプラグインとして実装されています。(これらは Prettier のソースコード内では`internalPlugins`と呼ばれています。)
https://github.com/prettier/prettier/blob/master/src/common/internal-plugins.js

なので、前述の`languages`はコアでサポートしている言語にも存在し、`extensions`も存在します。

## linguist-languages

`internalPlugins`の実装を読むと、`extensions`は[`linguist-languages`](https://github.com/ikatyang/linguist-languages)というライブラリからひっぱってきていることがわかります。どうりでどれだけ grep してもヒットしないわけです。ソースコードに含まれていないのですから。
https://github.com/prettier/prettier/blob/master/src/language-js/index.js#L9

これは Prettier のメンテナの一人である[ika 氏](https://github.com/ikatyang)が、[github/linguist](https://github.com/github/linguist)の[languages.yaml](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml)を JSON に自動でフォーマットしたものみたいです。

本家 linguist の`.cjs`追加は、https://github.com/github/linguist/pull/4703 で行われており、それに追従した`linguist-languages`が v7.7 としてリリースされていました。(Prettier が依存しているのは 7.6)

つまり、依存している`linguist-langages`のバージョンを 7.6=>7.7 にしたら直ったよっていう話でした。
