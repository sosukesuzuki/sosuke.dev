---
layout: article-layout.11ty.js
date: 2021-04-28
title: "JavaScript の Symbols as WeakMap keys について"
tags: post
---

この記事では現在 Stage 2 の Symbols as WeakMap keys 提案について解説する。

プロポーザルの詳細については[tc39/proposal-symbols-as-weakmap-keys](https://github.com/tc39/proposal-symbols-as-weakmap-keys)を参照してほしい。

また、ここで紹介した仕様に関しては今後更新されていく可能性がある。

## 概要

Symbols as WeakMap keys は、WeakMap のキーとしてシンボルを使えるようにするための提案である。

現在の WeakMap では、キーとしてオブジェクトのみを使用することができる。

```js
const weak = new WeakMap();

const key = {};
const value = "";

weak.set(key, value);
```

たとえば、キーとして数字や文字列などのプリミティブな値を使用すると実行時エラーが発生する。

```js
const weak = new WeakMap();

const key = 3;
const value = "";

weak.set(key, value); // Uncaught TypeError: Invalid value used as weak map key
```

JavaScript のシンボルは数字や文字列と同様にプリミティブな値なので、現在の仕様では WeakMap のキーとして使うことができない。

```js
const weak = new WeakMap();

const key = Symbol("key");
const value = "";

weak.set(key, value); // Uncaught TypeError: Invalid value used as weak map key
```

## モチベーション

### シンボルは WeakMap のキーに必要な性質を満たす

そもそも WeakMap は GC 可能なユニークな値をキーとして扱いたいだけなので、シンボルをキーとして使用できても問題がない、ということらしい。

現在の WeakMap がオブジェクトをキーとして扱うようになっているのも、オブジェクトがユニークかつ GC によって不要になったら回収されるからである。

```js
{} === {}; // false
```

シンボルもユニークであり、不要になったら GC によって回収されるのでこの性質を満たす。

```js
Symbol("foo") === Symbol("foo"); // false
```

### シンボルを WeakMap のキーとして扱えると人間にわかりやすい

単純に、シンボルを WeakMap のキーとして使えると人間にとってわかりやすい。

### Records and Tuples の制限のため

Records and Tuples という現在 Stage 2 の提案がある。

Records and Tuples プロポーザルは Record と Tuple という新しい２つのデータ構造を導入する。これはかんたんに説明すると、それぞれイミュータブルなオブジェクトと配列である。

Record と Tuple の構文は、ぞれぞれオブジェクトリテラルと配列リテラルの先頭に`#`をつけたものになっている。

```js
const record = #{ x: 1, y: 2 };
const tuple = #[1, 2, 3];
```

このとき`record`と`tuple`の中身はイミュータブルになっており、あとから変更することはできない。

そして Record と Tuple には、プリミティブな値もしくは Record と Tuple しかプロパティの値として持てないという制約がある。つまり、Record と Tuple の中にはイミュータブルな値しかいれることしかできないということである。

これはイミュータブルなデータ構造を導入する以上妥当な制約であり、むしろこの制約が存在しなかった場合、イミュータブルと呼ぶことはできないだろう。

しかし、Record や Tuple は関数をプロパティの値として持つことができないということでもある。

```js
// 関数はオブジェクトであり、Recordはオブジェクトを持てないのでこれはできない
const record = #{
  func: () => {
    console.log("foo");
  },
};
```

これが不便だというのは、容易に想像ができるだろう。

この制限を保ったまま、擬似的に Record や Tuple に関数を保持させるために、Symbols as WeakMap keys を使用することができる。

シンボルはあくまでイミュータブルなプリミティブな値であるため、Record と Tuple は他のプリミティブな値と同様にシンボルくをプロパティの値として持つことができる。

```js
// シンボルはプリミティブな値なので Record はプロパティの値としてシンボル持つことができる。
const record = #{ x: Symbol("foo") };
```

つまり、Record にはシンボルをもたせておき、そのシンボルを使って WeakMap から関数を取得するようなことは可能なのだ。

```js
const weak = new WeakMap();

const key = Symbol("function key");
weak.set(key, () => {
  console.log("HI!!");
});

const record = #{ x: key };

weak.get(record.x)(); // HI!!
```

そしてこの操作をよりかんたんにするためのラッパーを書くことができる。

```js
class RefBookkeeper {
  #references = new WeakMap();
  ref(obj) {
    const sym = Symbol();
    this.#references.set(sym, obj);
    return sym;
  }
  deref(sym) {
    return this.#references.get(sym);
  }
}

const refs = new RefBookkeeper();

const record = #{
  x: refs.ref(() => {
    console.log("HI!!");
  }),
};
refs.deref(record.x)(); // HI!!
```

## 現在の懸念点

### well-known な Symbol も WeakMap のキーとして使えるようにするのか？

JavaScript には、well-known なシンボルと呼ばれる特別なシンボルがいくつかある。`Symbol.iterator`は使ったことがある人もいるのではないだろうか。その他のものについては、 https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Symbol#static_properties や https://tc39.es/ecma262/#sec-well-known-symbols などをを参照してほしい。

このようなシンボルを WeakMap のキーとして許容するかどうかは TC39 のメンバーの中でも意見が割れているようだ。

現在は、許容することも禁止することも現実的な選択肢として考えられている。

### グローバルシンボルレジストリに登録されたシンボルも WeakMap のキーとして使えるようにするのか？

`Symbol`には`Symbol.for`と`Symbol.keyFor`という２つの静的メソッドが存在する。

これらのメソッドは、グローバルシンボルレジストリに関連するものである。

グローバルシンボルレジストリは、その名の通り、グローバルにシンボルが登録される場所である。

普通にシンボルを作成した場合はグローバルシンボルレジストリには登録されない。

```js
// グローバルシンボルレジストリには登録されない
const sym = Symbol("sym");
```

`Symbol.for`を使うことで、グローバルシンボルレジストリにシンボルを登録することができる。

```js
// グローバルシンボルレジストリに登録される。
const sym = Symbol.for("sym");
```

`Symbol.for`は、引数として key と呼ばれる文字列を受け取り、グローバルシンボルレジストリから key にマッチするシンボルを検索し、存在した場合そのシンボルを返し、存在しない場合は新しく key を使ってグローバルシンボルレジストリに新しいシンボルを作成し、そのシンボルを返す。

```js
// まだグローバルシンボルレジストリに、key `sym` に対応するシンボルが存在しないため、
// 新しくグローバルシンボルレジストリにシンボルを作成し、そのシンボルを返す
const sym1 = Symbol.for("sym");

// すでにグローバルシンボルレジストリに key `sym` に対応するシンボルが存在するため、
// そのシンボルを返す
const sym2 = Symbol.for("sym");

console.log(sym1 === sym2); // true;
```

もう一つの静的メソッドである`Symbol.keyFor`は、`Symbol.for`とは逆にシンボルを引数として受け取り、そのシンボルに対応するキーの文字列を返す。

```js
const sym1 = Symbol.for("sym");
console.log(Symbol.keyFor(sym1)); // sym
```

つまり、これらの静的メソッドを使えばどこからでも取得可能なシンボルを作成することができる。

このようなシンボルを WeakMap のキーとして許容するのかというのが論点である。

### WeakRef 等でも同様にシンボルをサポートするのか？

WeakRef や WeakSet、FinalizationRegistry 等の弱参照に関係するその他のデータ構造でも同様にシンボルをサポートするかどうかについては、それをすることもできるししないこともできるということらしい。

今の所明確なユースケースは存在しないが、WeakMap のキーとしてシンボルを追加することと一貫させるためにそのような仕様の修正が行われることはあるのかもしれない。

## おわりに

提案のタイトルからわかりやすい仕様ではあるが、細かい部分でまだ決まりきっていないところもあるので引き続き議論を追っていきたい。

また、Prettier や Babel などの開発では実際にこの仕様を使うようなシーンもありそうなので頭に入れておきたい。
