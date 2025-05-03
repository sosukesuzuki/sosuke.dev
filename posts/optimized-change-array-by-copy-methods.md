---
layout: article-layout.11ty.js
date: 2025-05-03
title: "JSCのchange array by copy系メソッドを全部速くした"
tags: post
---

前に[Array.prototype.fillを高速化した件について書きました](https://sosukesuzuki.dev/posts/optimize-array-fill-in-cpp/)が、同じノリでchange array by copy系のメソッドを全部速くしてみたので紹介します。

まじめな技術記事っていうよりかは日記くらいの感覚で読んでください。

## Change array by copy 系メソッド？

change array by copy系のメソッドっていうのは正式名称ではないですが、https://github.com/tc39/proposal-change-array-by-copy によって追加された以下の４つのメソッドのことを指しています。

- `Array.prototype.toReversed()`
- `Array.prototype.with(index, value)`
- `Array.prototype.toSorted(compareFn)`
- `Array.prototype.toSpliced(start, deleteCount, ...items)`

実際にはTypedArray用の`toReversed`、`toSorted`、`with`もあるんですがそっちは特に触ってません。

## 最適化アプローチと性能

ということで、各メソッドに対する最適化のアプローチと性能を紹介していきます。といっても、アプローチはどのメソッドでも大体同じなんですけどね。

### `Array#toReversed()`

`Array#toReversed()`は[仕様](https://tc39.es/ecma262/#sec-array.prototype.toreversed)を読んでナイーブに実装すると、新しい配列を作って、もとの配列の要素を一個ずつ取得して逆順に新しい配列にプッシュしていくような感じになります。

これは配列のサイズが大きくなると結構遅いんですよね。ということで、配列の要素がメモリ上に連続して並んでいるとわかるときに限り、もとの配列をmemcpyしてからC++のstd::reverseでひっくり返す実装にしました。

これでマイクロベンチマークで1.5~2倍くらい速くなりました。パッチは https://commits.webkit.org/287431@main です。

### `Array#with(index, value)`

`Array#with(index ,value)`は[仕様](https://tc39.es/ecma262/#sec-array.prototype.with)どおりに実装すると、新しい配列を作って、もとの配列の要素を一個ずつ取得して新しい配列にプッシュしつつ、引数の`index`番目だけのときのみ引数の`value`をプッシュするような感じなります。

これもサイズが大きくなると遅いんで、`toReversed`と同じように配列の要素がメモリ上に連続して並んでいるとわかっているときに限って、もとの配列をmemcpyしてから、メモリ上連続した要素の`index`番目を`value`で直接上書きするような実装にしました。

これでマイクロベンチマークで1.8~2倍くらい速くなりました。パッチは https://commits.webkit.org/284332@main と https://commits.webkit.org/288360@main です。

### `Array#toSorted(compareFn)`

`Array#toSorted`の最適化は、JSで書かれていたのをC++に移植しただけです。

これでDFG JITを無効にしたときにマイクロベンチで1.2倍くらい速くなりました。DFG/FTLを有効にすると前の実装とほぼ一緒くらいでした。パッチは https://commits.webkit.org/287734@main です。

### `Array#toSpliced(start, deleteCount, ...items)`

`Array#toSpliced`の最適化はちょっと複雑なんですが、memcpyできるところはmemcpyできないところはメモリに直接ドカドカ詰めるって感じです。

`items`の部分はmemcpyできないので（データソースがもとの配列ではなくて引数だから）、`items`がめっちゃ多い呼び出しだとあんまり速くならないです。

これでマイクロベンチマークで1.2~1.4倍くらい速くなりました。パッチは https://commits.webkit.org/294096@main です。

## 感想

こういう、新しい配列作る系のメソッド、昔からあるやつは穴あき配列の穴をそのままコピーするんですが、最近追加されたやつは穴じゃなくてundefinedで埋めるんですよねえ。その動作のせいで結構遅くなっちゃってます。

JSCのデータの持ち方の都合上、穴あき配列をそのままmemcpyするとそのまま穴あき配列としてコピーされてしまうんですよね。だから事前に配列をチェックして穴が空いているかを確かめる必要があるんですが、それが遅いんですよ。配列に穴が空いているかどうかを確かめる高速な方法がほしいなあと思います。

今日紹介したメソッドの実装はすべて、穴あき配列だったらスローパスにフォールバックするようになっているのですが、穴あき配列用の高速パスを作ることもできるはずなので、そのへんもやれると良いですね。

