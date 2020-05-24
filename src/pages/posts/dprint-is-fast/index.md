---
path: "/posts/dprint-is-fast"
date: 2020-05-25
title: "Deno に採用されたコードフォーマッター dprint が速い"
---

Deno では以下のようにサブコマンドを実行することで、ソースコードのフォーマットをすることができます。

ref: https://deno.land/manual/tools/formatter

```sh
$ deno fmt example.ts
```

オフィシャルにコードフォーマッターを提供することによって、少なくとも Deno の世界のために記述されるコードのスタイルが開発者によってバラバラになったり、そのために議論が生まれるということはなさそうです。これは大変良いことです。

この `deno fmt` コマンドの内部では以前までは Prettier が使用されていたのですが、 deno v 0.32.0 から dprint という Rust で書かれたコードフォーマッターが使われるようになりました。

ref: https://github.com/denoland/deno/pull/3820

この dprint、どうやら実行速度がとても速いという噂を聞いたので、実際のコードでためして Prettier と比較してどの程度速いのか試してみようと思います。

## 実行マシンとベンチマーク方法

以下の性能の MacBook Pro で計測を行います。

```
MacBook Pro (13-inch, 2019, Four Thunderbolt 3 ports)
プロセッサ 2.4 GHz Intel Core i5
メモリ 16 GB 2133 MHz LPDDR3
グラフィックス Intel Iris Plus Graphics 655 1536 MB
```

以下のような形のディレクトリを作り、`dprint`と`prettier`をローカルインストールします。`/repositories`下には https://github.com/prettier/prettier と https://github.com/mictosoft/typescript がクローンされています。`dprint.config.js` と `prettierrc` はデフォルトのままにします。

```
.
├── dprint.config.js
├── package.json
├── repositories
│   ├── prettier
│   └── typescript
└── yarn.lock
```

[hyperfine](https://github.com/sharkdp/hyperfine)を使って、それぞれ`node_modules/.bin/`下にある bin を叩いて計測をします。

## 計測してみる

まず、そこまでコード量が多くない https://github.com/prettier/prettier の `/src` ディレクトリ下の JavaScript ファイルを対象にして時間を計測してみます。

```
対象ファイル数: 117
対象コード行数: 29205
```

```
$  hyperfine "./node_modules/.bin/dprint \"repositories/prettier/src/**/**/*.js\"" "./node_modules/.bin/prettier \"repositories/prettier/src/**/**/*.js\" --write" --ignore-failure
Benchmark #1: ./node_modules/.bin/dprint "repositories/prettier/src/**/**/*.js"
  Time (mean ± σ):      1.209 s ±  0.206 s    [User: 4.046 s, System: 0.139 s]
  Range (min … max):    1.003 s …  1.663 s    10 runs

Benchmark #2: ./node_modules/.bin/prettier "repositories/prettier/src/**/**/*.js" --write
  Time (mean ± σ):      2.519 s ±  0.135 s    [User: 4.123 s, System: 0.136 s]
  Range (min … max):    2.318 s …  2.709 s    10 runs

Summary
  './node_modules/.bin/dprint "repositories/prettier/src/**/**/*.js"' ran
    2.08 ± 0.37 times faster than './node_modules/.bin/prettier "repositories/prettier/src/**/**/*.js" --write'
```

平均値を見てみます。

```
dprint: 1.209 s
prettier: 2.519
```

この規模のプロジェクトでも、 dprint のほうが 2 倍くらい速くなっています。

少し大きめのコードでも試すために、 https://github.com/microsoft/typescript の `/src` 下の TypeScript ファイルに対してもやってみます。

```
対象ファイル数: 430
対象コード行数: 438366
```

```
$  hyperfine "./node_modules/.bin/dprint \"repositories/TypeScript/src/**/**/*.ts\"" "./node_modules/.bin/prettier \"repositories/TypeScript/src/**/**/*.ts\" --write" --ignore-failure
Benchmark #1: ./node_modules/.bin/dprint "repositories/TypeScript/src/**/**/*.ts"
  Time (mean ± σ):      5.295 s ±  0.143 s    [User: 7.884 s, System: 0.213 s]
  Range (min … max):    5.132 s …  5.548 s    10 runs

Benchmark #2: ./node_modules/.bin/prettier "repositories/TypeScript/src/**/**/*.ts" --write
  Time (mean ± σ):     22.387 s ±  0.242 s    [User: 38.089 s, System: 1.103 s]
  Range (min … max):   22.121 s … 22.848 s    10 runs

  Warning: Ignoring non-zero exit code.

Summary
  './node_modules/.bin/dprint "repositories/TypeScript/src/**/**/*.ts"' ran
    4.23 ± 0.12 times faster than './node_modules/.bin/prettier "repositories/TypeScript/src/**/**/*.ts" --write'
```

平均値を見てみます。

```
dprint: 5.295
prettier: 22.387
```

この規模になってくると差が顕著になってきますね。

## 速い

体感でわかるくらい速いし、測ってみたら速かったです。今後 Deno や dprint がどうなっていくかはわかりませんが、1.0 がリリースされる前の段階で dprint のような Rust 製のコードフォーマッターに移行したのは英断だったように思います。

コードフォーマッターとしての性能はまだ見れていないのでなんとも言えませんが、もしかしたら通常の TypeScript/JavaScript プロジェクトにも採用できるかもしれません。今度は、 dprint に Prettier のテストケースを食わせてちゃんとフォーマットできるかやってみようと思います。
