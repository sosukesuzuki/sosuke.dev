---
layout: article-layout.11ty.js
date: 2023-03-04
title: "Node.js と ECMAScript の Import Specifier は違うらしい"
tags: post
---

## Node.js の import specifier と ECMAScript の `ImportSpecifier`

先日 Firefox の JavaScript エンジンである SpiderMonkey の公式ブログに Import Maps についての記事が投稿された。

https://spidermonkey.dev/blog/2023/02/23/javascript-import-maps-part-1-introduction.html

この記事は、そもそも ECMAScript Modules とは何かというところから入り、Node.js のモジュールシステムの歴史やブラウザの ECMAScript Modules との関係などを説明した後、本題である Import Maps について解説している。短い時間で読める面白い記事なので、まだ読んでいない人はぜひ読んでほしい。

この記事の脚注に興味深いことが書かれていた。

> In Node.js, it’s called import specifier, but in ECMAScript, ImportSpecifier has a different meaning.

日本語に翻訳すれば「それは、Node.js では import specifier と呼ばれていますが、ECMAScript での ImportSpecifier とは別の意味です」ということである。

この脚注の文脈における「それ(it)」とは `import foo from "bar"` における `"bar"` の部分、すなわち JavaScript の Import 宣言のモジュールを指定する部分のことである。

つまり、Node.js では `import foo from "bar"` における `"bar"` の部分のことを import specifier と呼ぶが、ECMAScript の仕様での [`ImportSpecifier`](https://tc39.es/ecma262/#prod-ImportSpecifier) は別のものを指しているということだ。

では、ECMAScript の仕様の `ImportSpecifier` は何を指しているのだろうか。先に答えを言ってしまうと `import foo from "bar"` における `foo` の部分である。

## 具体的なコードで見る

簡単に言ってしまえばこれで終わりだが、ECMAScript にはいくつかの Import の書き方がある。ここからは更に詳しく、それぞれの書き方の中で `ImportSpecifier` が具体的なコードのどの部分に対応するのかを解説する。

ECMAScript ではこのあたりの構文を表現する要素として、`ImportSpecifier` の他に [`ImportList`](https://tc39.es/ecma262/#prod-ImportsList)、[`ImportBinding`](https://tc39.es/ecma262/#prod-ImportedBinding)、[`ModuleExportName`](https://tc39.es/ecma262/#prod-ModuleExportName) などがある。実際には他にももっと多くの構文の要素があるのだが、ここではこれらの 4 つに絞り具体的なコードのどの部分にどの構文の要素が対応するのかを画像として見ていく。

<div style="display: flex; flex-flow: column; align-items: center;">

<img src="/img/import-specifier-01.png" style="border: 1px solid gray; margin-bottom: 36px;" width="600px" height="194px" />

<img src="/img/import-specifier-02.png" style="border: 1px solid gray; margin-bottom: 36px;" width="600px" height="190px" />

<img src="/img/import-specifier-03.png" style="border: 1px solid gray; margin-bottom: 36px;" width="600px" height="182px" />

<img src="/img/import-specifier-04.png" style="border: 1px solid gray; margin-bottom: 36px;" width="600px" height="200px" />

<img src="/img/import-specifier-05.png" style="border: 1px solid gray; margin-bottom: 36px;" width="600px" height="185px" />

</div>

(画像を作ってから思ったがやや見にくいので頑張って見てほしい)

ちなみに、Node.js での import specifier に相当するのは ECMAScript では [`ModuleSpecifier`](https://tc39.es/ecma262/#prod-ModuleSpecifier) である。

## おわりに

筆者は ECMAScript の `ImportSpecifier` のことはもとから知っていたので、Node.js の import specifier のことを知って驚いた。

この違いによって困ることはなさそうだが。

## 参考

- ECMA-262
  - https://tc39.es/ecma262/#prod-ImportSpecifier
  - https://tc39.es/ecma262/#prod-ImportedBinding
  - https://tc39.es/ecma262/#prod-ImportsList
  - https://tc39.es/ecma262/#prod-ModuleExportName
  - https://tc39.es/ecma262/#prod-ModuleSpecifier
- Node.js
  - https://nodejs.org/api/esm.html#import-specifiers
- SpiderMonkey
  - https://spidermonkey.dev/blog/2023/02/23/javascript-import-maps-part-1-introduction.html
