---
layout: article-layout.11ty.js
date: 2024-07-07
title: "Intlにおけるロケール識別子のマッチング"
tags: post
---

この記事では `Intl.Segmenter` のような `Intl` の下に存在しているコンストラクタの中で `Intl.Locale` を除くものを「`Intl` のコンストラクタ」と呼ぶ。

## Intl のコンストラクタとロケール

`Intl` のコンストラクタは、ロケールを表す文字列か `Intl.Locale` オブジェクト（あるいはそれらのみを含む配列）を受け取る。これは省略することもでき（つまり `undefined` を受けることができる）、その場合は規定のロケールが使われる。

```js
const s1 = new Intl.Segmenter("en-US");
const s2 = new Intl.Segmenter(new Intl.Locale("en-US"));
const s3 = new Intl.Segmenter(["en-US", new Intl.Locale("en-US")]);
const s4 = new Intl.Segmenter();
```

`Intl` のコンストラクタに、ロケール識別子として不正な文字列や `Intl.Locale` ではないオブジェクトを渡すと RangeError を throw する。

```js
try {
    new Intl.Segmenter("invalid-locale-id");
} catch (e) {
    console.log(e.name); // RangeError
}

try {
    new Intl.Segmenter({});
} catch (e) {
    console.log(e.name); // RangeError
}
```

## ロケールのマッチング

`Intl` のコンストラクタは受け取ったロケール情報が不正でないことを確認したら、受け取ったロケール情報とその環境で使えるロケールの情報をマッチングし、適切なロケールを選択する処理を行う。

このときに行われるロケールのマッチングのアルゴリズムを `Intl` のコンストラクタの `localeMatcher` オプションで指定できる。`localeMatcher` オプションは `"lookup"` もしくは `"best fit"` という文字列を受け取る。`"lookup"` と `"best fit"` 以外の値を受け取ったら RangeError を throw する。省略した場合は `"best fit"` として扱われる。

```js
const s1 = new Intl.Segmenter("en-US", { localeMatcher: "lookup" });
const s2 = new Intl.Segmenter("en-US", { localeMatcher: "bestfit" });
try {
    new Intl.Segmenter("en-US", { localeMatcher: "invalid-matcher" });
} catch (e) {
    console.log(e.name); // RangeError
}
```

`Intl` のコンストラクタに配列を渡した場合はその中でもっともマッチしたものを一つだけ選ぶ。

### 仕様で動作が定められている lookup

`localeMatcher` の値が `"lookup"` のときは、ECMA402 の [LookupMatchingLocaleByPrefix](https://tc39.es/ecma402/#sec-lookupmatchinglocalebyprefix) という abstract operation で規定されたアルゴリズムによってマッチングを行う。

具体的には以下の手順に従う:

1. まず、利用可能なロケール情報の一覧 `availableLocales` と、コンストラクタの引数として受け取った `requestedLocales` の２つの値が存在する
2. `requestedLocales` を一つずつ見ていく（配列ではなく単体の文字列やオブジェクトを渡した場合は要素数が1の配列ようのように扱う）
3. `requestedLocales` の各ロケール情報に含まれるUnicode locale extension sequenceの部分と、拡張を含まないロケール識別子の部分を分ける[^1]
4. 分けたあとのロケール識別子が `availableLocales` に含まれていたら、それと拡張の部分をくっつけて返す
5. ロケール識別子が `availableLocales` に含まれていなかった場合、ロケール識別子から一つサブタグを取り除いて、step 4 を繰り返す（たとえば `en-US-California` が `availableLocales` に含まれていなかったら、`-California` の部分を取り除いて `en-US` が `availableLocales` に含まれているかを再度チェックする）。

詳細な動作は ECMA402 を参照してほしい。

### 実装依存の best fit

一方で `localeMatcher` の値が `"best fit"` のときにどのようにマッチングを行うかは実装依存である。仕様上は [LookupMatchingLocaleByBestFit](https://tc39.es/ecma402/#sec-lookupmatchinglocalebybestfit) という abstract operation が呼び出されているが、冒頭で implementation-defined であることが明記されている。

JavaScriptCore[^2]とSpiderMonkey[^3]は、`"lookup"` のときと全く同じ動きをする。これはあくまで暫定的にこうなっているだけで、より良い実装があればそちらが採用されるだろう。

V8では、ICU 67.1 から実装されている[`icu::LocaleMatcher`](https://unicode-org.github.io/icu-docs/apidoc/dev/icu4c/classicu_1_1LocaleMatcher.html)が使われているようだ[^4]。

[^1]: Unicode locale extension sequence は簡単に言えば `en-US-u-ca-buddhist` の `u-ca-buddhist` の部分のことだ。`ca` 以外にも `cf` や `fw` などたくさんの種類がある。詳細は [UTS#35](https://unicode.org/reports/tr35/#u_Extension) を参照してほしい。
[^2]: https://github.com/WebKit/WebKit/blob/c994460e362bfdfa5706e5fb55b79eef38f51527/Source/JavaScriptCore/runtime/IntlObject.cpp#L928-L935
[^3]: https://searchfox.org/mozilla-central/rev/dea459eb01a4c38b696ae3d31c1540e86365a937/js/src/builtin/intl/CommonFunctions.js#314-326
[^4]: https://chromestatus.com/feature/5407573287108608
