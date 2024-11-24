---
layout: article-layout.11ty.js
date: 2024-11-24
title: "[JSConf JP 2024 感想] Unicode 15.1でU+200CとU+2004がID_Continueに入ったことによってECMAScriptがちょっと更新されていたことに気がついた"
tags: post
---

JSConf JP 2024 の [Yuji Sugiura](https://x.com/leaysgur) さんの発表 [「30 Minutes to Understand All of `RegExp` Syntax」](https://leaysgur.github.io/slides/jsconf_jp-2024/) を現地で聞いた。発表で気になったことがあったので、発表の直後に Sugiura さんに直接聞きにいった。

Sugiura さんの発表の中で、JavaScript における識別子にマッチする正規表現として、以下の例が紹介されていた。

```js
let re = /^(?!(?:break|case|...)$)[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/v;
```

これはあくまで否定先読みの例として提示されたもので、その内容は発表自体にはあんまり関係ないのだが、私はこの正規表現が少し気になった。

その時点で私は、JavaScript の識別子について以下のように認識していた:

- 非終端記号 IdentifierStart のあとに IdentifierContinue が続く形をしている
- IdentifierStart に含まれる文字は ID_Start もしくは `$` もしくは `\_`
- IdentifierContinue に含まれる文字は ID_Continue もしくは `$`

しかし、この正規表現を見ると、非終端記号 IdentifierPart に該当する箇所に、ID_Continue、`$` 以外に U+200C と U+200D という文字も含まれている。

気になったので現在の ECMAScript の仕様の該当箇所を確認したところ、私の認識は合っているようだった（これは過去に調べたことがあったから覚えていた）。

発表後に Sugiura さんに聞きにいったところ、[MDN の Lookahead Assertions のページ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookahead_assertion#pattern_subtraction_and_intersection)に記載されている例を参考にしたと教えてくれた。

MDN が必ずしも正しいとは限らないが、MDN に書いてあるということは少なくとも過去のある時点において U+200C と U+200D という二つの文字が仕様内に明確に書かれていた可能性が高いと考えた。

そこで ECMAScript 2023 を調べたところ、実際に[IdentifierPart に含まれる文字を表す IdentifierPartChar は、以下のように定義されていた](https://tc39.es/ecma262/2023/#prod-IdentifierPartChar):

```
IdentifierPartChar ::
    UnicodeIDContinue
    $
    <ZWNJ>
    <ZWJ>
```

`<ZWNJ>` と `<ZWJ>` は U+200C と U+200D のことである。[しかし、現在の最新の仕様ではこれらの文字は指定されていない](https://tc39.es/ecma262/#prod-IdentifierPartChar)。

ということで https://github.com/tc39/ecma262 リポジトリ内で検索したところ https://github.com/tc39/ecma262/pull/3074 で、この記述が削除されていることがわかった。

そして、この Pull Request に紐づけられている https://github.com/tc39/ecma262/issues/3073 によって、Unicode 15.1 で ID_Continue に U+200C と U+200D の二つの文字が追加されたことがわかった。

つまり、Unicode 15.1 において ID_Continue に変更が入ったため、それに追従する形で ECMAScript 仕様内の冗長な記述を削除した、ということだった。ECMAScript に意味論は全く変わっていない。

ということで、Sugiura さんがスライド内に掲載した例は間違っていなかったし、私がそれに対して違和感を持ったのも妥当だった。

私と Sugiura さんの二人、JSConf JP 2024 会場の Room C 内の床でこの調査を行って、楽しかったので記事にした。そういうことができるのもカンファレンスの面白いところである。
