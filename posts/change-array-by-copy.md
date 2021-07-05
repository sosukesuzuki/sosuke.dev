---
layout: article-layout.11ty.js
date: 2021-05-02
title: "JavaScript にイミュータブルな配列操作メソッドを導入するプロポーザルについて"
tags: post
---

この記事では、現在 Stage 1 のプロポーザル Change Array by copy について解説する。

プロポーザルの詳細については、https://github.com/tc39/proposal-change-array-by-copy を参照してほしい。

また、ここで紹介した仕様に関しては今後更新されていく可能性がある。

## 概要

Change Array by copy は、簡単にいえばイミュータブルな配列操作メソッドを導入するプロポーザルである。

JavaScript の配列には多くのインスタンスメソッドがあり、それらを使って配列を操作することができる。

配列のインスタンスメソッドには、ミュータブルなもの、つまりもとの配列を変更することによって配列を操作するタイプのものがいくつかある。

たとえば、`Array.prototype.push` や `Array.prototype.pop`、`Array.prototype.reverse`などはミュータブルなメソッドである。

```js
// もとの配列を破壊する例
const array1 = [1, 2, 3, 4, 5];
array1.push(6);
console.log(array1); // [1, 2, 3, 4, 5, 6]

const array2 = [1, 2, 3, 4, 5];
array2.pop();
console.log(array.2); // [1, 2, 3, 4]

const array3 = [1, 2, 3, 4, 5];
array3.reverse();
console.log(array3); // [5, 4, 3, 2, 1]

```

Change Array by copy プロポーザルは、これらのミュータブルなメソッドたちに対して、同じような操作をするためのイミュータブルなメソッドを導入する
提案である。

具体的には、次の 10 個のインスタンスメソッドを導入する。

- `Array.prototype.filled(value, start, end) -> Array`
- `Array.prototype.copiedWithin(copiedTarget, start, end) -> Array`
- `Array.prototype.popped() -> Array`
- `Array.prototype.pushed(values...) -> Array`
- `Array.prototype.reversed() -> Array`
- `Array.prototype.shifted() -> Array`
- `Array.prototype.sorted(compareFn) -> Array`
- `Array.prototype.spliced(start, deleteCount, ...items) -> Array`
- `Array.prototype.unshifted(...values) -> Array`
- `Array.prototype.with(index, value) -> Array`

また、`Array`のみではなく`TypedArray`についても同様のメソッドたちを導入する。

みればわかるとおりこれらのメソッドは、基本的には既存のミュータブルなメソッドの名前を過去形(というより意図されているのはおそらく過去分詞系)にした名前になっている。

## モチベーション

根本的にミュータブルな配列操作というのは扱いが難しい。ある配列が現在どのような状態であるのかを把握するのが難しくなってしまう。

たとえば、定数として扱いたい値を配列として確保する例を考える。

```ts
const USER_NAMES = ["Suzuki Sosuke", "Javascript Taro", "Ecmascript Hanako"];
```

この`USER_NAMES`をアルファベット順にソートして関数`someOperation`に渡したい。

```js
// 整列済みの配列を引数に受け取るなんらかの操作
someOperation(USER_NAMES.sort());
```

このように関数に渡してしまうことがあるだろう。しかし、`Array.prototype.sort`は整列された新しい配列を返すだけではなく、もとの配列も変更してしまう。

つまり、上記の`someOperation`実行後は`USER_NAMES`という配列自体がソートされたものになってしまう。

```js
someOperation(USER_NAMES.sort());
console.log(USER_NAMES); // ["Ecmascript Hanako", "Javascript Taro", "Suzuki Sosuke"]
```

これはそのあとのプログラムで想定外の挙動を引き起こす可能性がある。

そういったことを防ぐ手段がいくつかある。

- `Object.freeze` を使って配列を凍結する。`Object.freeze`で配列を凍結すれば、ミュータブルなメソッドをそもそも使うことができなくなる(むりやり使うと実行時エラーになる)。
- TypeScript を使っている場合`USER_NAMES`の定義の時点で`as const`をつける。`as const`をつければその配列は型上は凍結されたようなものとして扱われ、ミュータブルなメソッドを使うとコンパイルエラーになる。

そのうえで、もとの配列を変更することなく整列済みの配列を手に入れる必要がある。たとえば`Array.prototype.sort`をそのまま使ったり、`someOperation`を呼び出すときにスプレッド構文等でコピーしてからソートしたり、lodash 等のライブラリを使用することが考えられるが、いずれも面倒くさい。

ここで Change array by copy によって導入される`Array.prototype.sorted`を使うことで、安全かつ簡単に配列をソートできる。

```js
// USER_NAMES は変更されない
someOperation(USER_NAMES.sorted());
```

ほかにも様々なケースが考えられる。ある程度 JavaScript を書いたことがあるひとなら、イミュータブルな配列操作メソッドがほしくなったことがあるだろう。

## 経緯

Change Array by copy プロポーザルが生まれた経緯には、現在 Stage 2 の [Records and Tuples](https://github.com/tc39/proposal-record-tuple) という別のプロポーザルが関係している。

Records and Tuples は簡単にいえば、イミュータブルなオブジェクトと配列のようなデータ構造である Record と Tuple を導入するプロポーザルである。

次のような構文で Record と Tuple を作ることができる。

```js
const record = #{ x: "x" };
const tuple = #[1, 2, 3];
```

Records and Tuples は 2019 年ごろから議論されていた提案であり、当初から「Record と Tuple に対して記述したコードはオブジェクトと配列に対しても同じように動作するべき」という方針があった。

しかし、最近になって配列と Tuple の挙動の一貫性について調査したところ、`Tuple.prototype` にあって `Array.prototype` にはないインスタンスメソッドが存在することに気づいたらしい。

それが `pushed`や`popped`や`revesed`のようなイミュータブルなメソッドたちである。

当初の方針にしたがうと、Tuple に対して記述したコードを配列に対しても動作させるために、配列にも同様のインスタンスメソッドを導入するべきというということになる。

もともとは、それらのメソッドの仕様策定は Records and Tuples 提案の中に行うという考えもあったようだ。

しかし、そういったイミュータブルな操作というのは一般的に Tuple だけではなく配列に対して実装されていても有益であるという判断がされたため、Records and Tuples とは異なる別のプロポーザルとして提案されるとことになった。

その判断が行われたのが 2021 年 3 月のミーティングであり、実際にこの Change Array by copy プロポーザルが提案されたのが 2021 年 4 月のミーティングである。Tuple のために仕様が決まっていたとはいえ、かなりのスピードでミーティングまでいったことになる。

ちなみに、該当するミーティングの議事は https://github.com/tc39/notes/blob/master/meetings/2021-03/mar-9.md#records-and-tuples-update に公開されている。

## おわりに

Change Array by copy プロポーザルはわかりやすく実用的な機能であり、個人的にも ECMAScript に入るのが待ち遠しい。
