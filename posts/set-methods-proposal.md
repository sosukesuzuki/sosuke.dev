---
layout: article-layout.11ty.js
date: 2024-03-26
title: "ECMAScript の Set Methods プロポーザル"
tags: post
---

ECMAScript の Set にいくつかのメソッドを追加する Set Methods プロポーザルについて解説する。

## 免責事項

筆者は集合の用語に慣れているわけではないので、もし用語の使い方が不適切である場合は Twitter 等で連絡をいただきたい。

また、Set Methods は本記事執筆時点で Stage 3 である。

## 追加されるメソッド

### Set.prorotype.intersection(other)

`this` と `other` の共通部分となる新しい `Set` を返す。

```js
const foo = new Set([1, 2, 3]);
const bar = new Set([3, 4, 5]);

console.log(foo.intersection(bar));
// Set(1) {3}
```

### Set.prototype.union(other)

`this` と `other` の和となる新しい `Set` を返す。

```js
const foo = new Set([1, 2, 3]);
const bar = new Set([3, 4, 5]);

console.log(foo.union(bar));
// Set(5) {1, 2, 3, 4, 5}
```

### Set.prototype.difference(other)

`this` と `other` の差となる新しい `Set` を返す。対称でないことに注意。

```js
const foo = new Set([1, 2, 3]);
const bar = new Set([3, 4, 5]);

console.log(foo.difference(bar));
// Set(2) {1, 2}

console.log(bar.difference(foo));
// Set(2) {4, 5}
```

### Set.prototype.symmetricDifference(other)

`this` と `other` の[対称差](https://ja.wikipedia.org/wiki/%E5%AF%BE%E7%A7%B0%E5%B7%AE)となる新しい `Set` を返す。

```js
const foo = new Set([1, 2, 3]);
const bar = new Set([3, 4, 5]);

console.log(foo.symmetricDifference(bar));
// Set(4) {1, 2, 4, 5}
```

### Set.prototype.isSubsetOf(other)

`this` が `other` の部分集合であるかどうかを真偽値で返す。

```js
const foo = new Set([1, 2, 3]);
const bar = new Set([1, 2]);
const baz = new Set([4, 5]);

console.log(bar.isSubsetOf(foo));
// true
console.log(baz.isSubsetOf(foo));
// false
```

### Set.prototype.isSupersetOf(other)

`this` が `other` の上位集合(superset)であるかどうかを真偽値で返す。

```js
const foo = new Set([1, 2, 3]);
const bar = new Set([1, 2]);
const baz = new Set([4, 5]);

console.log(foo.isSupersetOf(bar));
// true
console.log(foo.isSupersetOf(baz));
// false
```

### Set.prototype.isDisjointFrom(other)

`this` と `other` が[互いに素](https://ja.wikipedia.org/wiki/%E7%B4%A0%E9%9B%86%E5%90%88)であるかどうかを真偽値で返す。

```js
const foo = new Set([1, 2, 3]);
const bar = new Set([3, 4]);
const baz = new Set([4, 5]);

console.log(foo.isDisjointFrom(bar));
// false
console.log(foo.isDisjointFrom(baz));
// true
```

## 参考

- TC39
  - https://github.com/tc39/proposal-set-methods
  - https://tc39.es/proposal-set-methods/
- WebKit
  - https://github.com/WebKit/WebKit/blob/main/Source/JavaScriptCore/builtins/SetPrototype.js
