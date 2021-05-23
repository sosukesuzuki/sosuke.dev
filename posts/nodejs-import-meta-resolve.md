---
layout: article-layout.11ty.js
date: 2021-05-23
title: "Node.js の import.meta.resolve について"
tags: post
---

先日 import.meta について調査して人に話す機会があり HTML(Web) と Node.js の各ホストの import.meta がどのようなオブジェクトを返すのかを調査していた。そのときは、「HTML でも Node.js でも `import.meta.url` だけが生えていて〜〜」という話をしてしまった。

後になって知ったのだが、Node.js には `import.meta.url` 以外にも `import.meta.resolve` というプロパティが実装されている。

この記事では Node.js に実装されている `import.meta.resolve` について解説する。

なお、`import.meta.url` はまだ Stability 1 の API なので、今後仕様が変わる可能性があることに注意してほしい。

## `import.meta` について

まず `import.meta` について軽く触れておこうと思う。

`import.meta` については知っているよという人は飛ばしてほしい。

`import.meta` は ECMAScript 2020 から入った機能で、現在実行中のモジュールに対してホスト固有のメタデータをオブジェクトとして提供する(現在は ECMAScript に入っているのでリポジトリはアーカイブされているが、プロポーザルは https://github.com/tc39/proposal-import-meta にある)。

大事なルールとして、`import.meta` はモジュールに対してのみ機能するのでスクリプトの環境では使うことができない。

そして、`import.meta`は現在の ECMAScript には２つしかない Meta Property と呼ばれる構文の１つである(ref: https://tc39.es/ecma262/#prod-MetaProperty)。

`import.meta` は、ECMAScript の範囲内ではそれがオブジェクトであるということしか決まっていない。

なので、実際にどのようなメタデータをモジュールに対して提供するかはホストの実装者に委ねられている。

現在 HTML と Node.js の両方に実装されているのが `import.meta.url` である。これは現在実行中のモジュールの URL を表す。HTML では http スキームだが、Node.js では file スキームの URL になる。

## Node.js の `import.meta.url`

Node.js では `import.meta.url` はよく使われるだろう。

Node.js 10 が EOL となった今、Node.js でも ECMAScript Modules を使ったプログラムを書くことが増えてきた。ECMAScript Modules では、今まで Node.js のプログラム内でよく使われてきた`__filename`や`__dirname`を使うことができない。

そこで`import.meta.url`を使うことでそれに相当する値を簡単に作ることができる。

```js
import url from "node:url";
import path from "node:path";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
```

また、Node.js の `module` モジュールには CommonJS Modules での `require` に相当する関数を作るための関数 `createRequire` が実装されている。`createRequire` の引数に`import.meta.url`を渡すことで`require`関数を取得するのもよくあるパターンだと思う。

```js
import module from "node:module";

const require = module.createRequire(import.meta.url);
```

## Node.js の `import.meta.resolve`

実は Node.js には `import.meta.url` の他に `import.meta.resolve` というプロパティが実装されている。

ECMAScript Modules 界隈では有名な Guy Bedford による https://github.com/nodejs/node/pull/31032 によって実装されたようで、この Pull Request は 2019年の12月に作成されている。

ドキュメントは https://nodejs.org/api/esm.html#esm_import_meta_resolve_specifier_parent にある。

`import.meta.resolve` は CommonJS Modules でいう `require.resolve` に相当する関数である。つまり、モジュールの specifier を引数に渡すと、そのモジュールの URL が返ってくる。

ECMAScript Modules でのモジュール解決は非同期に行われるため、`import.meta.resolve`の返り値は Promise になっている。

また、`import.meta.resolve`は現在 Stability 1 の experimental な API なので、実行するには`--experimental-import-meta-resolve`オプションをつける必要がある。

```js
// index.js
const lodashUrl = await import.meta.resolve("lodash");
console.log({ lodashUrl });
```

```shell
node --experimental-import-meta-resolve ./index.js
{
  lodashUrl: 'file:///Users/hoge/development/import-meta-resolve-example/node_modules/lodash/lodash.js'
}
```

`import.meta.resolve`にはオプショナルな第二引数が存在し、解決元となるファイルの絶対パスURLを指定することができる。デフォルトでは`import.meta.url`が指定されている。つまり、デフォルトでは`import.meta.resolve`が実行されるファイルのURLが指定されている。

この第二引数を使うことで現在実行中ではないファイルをもとに解決されたモジュールのURLを取得できる。

たとえば、次のようなディレクトリ構造があるとする。

```shell
.
├── pkg1
│   ├── index.js
│   └── package.json
└── pkg2
    ├── index.js
    ├── node_modules
    │   └── lodash
    ├── package-lock.json
    └── package.json
```

このとき、`pkg1/index.js` から `pkg2` の `lodash` の URL を取得する場合、次のように `import.meta.resolve` を使うことができる。

```js
// ./pkg1/index.js
const lodashUrlFromPkg2 = await import.meta.resolve(
  "lodash",
  "file:///Users/foo/import-meta-resolve-examples/pkg2/index.js"
);
console.log({ lodashUrlFromPkg2 });
```

```shell
node --experimental-import-meta-resolve ./pkg1/index.js
{
  lodashUrlFromPkg2: 'file:///Users/foo/import-meta-resolve-examples/pkg2/node_modules/lodash/lodash.js'
}
```

## おわりに

自分はまだあまり Node.js の ECMAScript Modules で複雑なプログラムを書いたことがなく、この機能を知らなかった。しかし、今後様々なパッケージが ECMAScript Modules で書かれていくことを考えると、`import.meta.resolve` も安定に向かっていくのだろう。
