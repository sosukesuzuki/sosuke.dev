---
layout: article-layout.11ty.js
date: 2025-08-31
title: "typeof x > 'u' は typeof x === 'undefined' より小さいけど遅い"
tags: post
---

こないだuhyoさんがこういうツイートをしていた。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">typeof x === &quot;undefined&quot; が typeof x&gt;&quot;u&quot; にminifyされるのを見たんだけど、<br>これってのちのちtypeofの結果が増えたら壊れるやつではないか。いいのかな。もう増えない読みか（？）</p>&mdash; 🈚️うひょ🤪✒📘 TypeScript本発売🫐 (@uhyo_) <a href="https://twitter.com/uhyo_/status/1961272105183711278?ref_src=twsrc%5Etfw">August 29, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

確かに `typeof` 演算子で得られる結果の中で辞書準比較で最も大きいのは "undefined" だから、`typeof x > "u"` は `typeof x === "undefined"` と同じ意味になる。なので、この minification は一見理にかなっているように見える。実際esbuildがこの方法でminifyをしている([Webのplaygroundでの実行結果](https://esbuild.github.io/try/#dAAwLjI1LjkALS1taW5pZnkAdHlwZW9mIHggPT09ICJ1bmRlZmluZWQi))。

しかし少なくともJSCにおいては `typeof x > "u"` は `typeof x === "undefined"` よりかなり遅い。

JSC は `typeof x === "undefined"` に対して専用のバイトコードを持っているため、LLIntだけでなくDFG/FTLにおいても強く最適化される。一方で `typeof x > "u"` は通常の typeof のバイトコードと文字列との大小比較のバイトコードとの組み合わせとして表現されるため、専用の最適化の恩恵を受けることはできない。

これは面白い性能特性なのだが、real worldで人気のminifierであるesbuildがそのようなコードを生成するのであれば、あまり良い状況ではない。ということで `typeof x>"u"` に対しても `typeof x === "undefined"` と同じ専用のバイトコードが生成されるように修正した([commit](https://commits.webkit.org/299368@main))。

このコミットによって、以下のマイクロベンチマークが約2.3倍速く動くようになった（現実的なユースケースでどのくらい性能に影響があるのかはめんどくさいので計測していない）。

```js
function test(x) {
    return typeof x > "u";
}
noInline(test);

for (let i = 0; i < 1e6; i++) {
    test(i % 2 === 0 ? undefined : i);
}
```

当然だがこのパッチが取り込まれたバージョンのSafariおよびBunではこの性能の問題は発生しなくなるはずだなので、この面白い特性を体験したい人は今のうちに試しておくことをお勧めする。

