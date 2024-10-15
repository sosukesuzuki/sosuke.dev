---
layout: article-layout.11ty.js
date: 2024-10-16
title: "Intl.DurationFormatの最大値を規定する仕様について"
tags: post
---

この記事では、以下のトピックについて解説します。

- `Intl.DurationFormat`の概要
- `Intl.DurationFormat`の最大値を規定する仕様
- JavaScriptCoreにおける`Intl.DurationFormat`の最大値の実装

## Intl.DurationFormatの概要

`Intl.DurationFormat`は現在ステージ3のプロポーザルです[^1]。

このプロポーザルは指定されたロケール情報に応じてdurationを適切にフォーマットするAPIを提供します。durationというのは、つまり経過時間のことです。たとえば、日本語でいえば「3時間46分25秒」のようなものです。これは当然タイムゾーンの考え方を持たないし、`Temporal.Instant`などで表現されるExact Time[^2]とも異なる概念です。

例を示します。

```js
const formatted = new Intl.DurationFormat("ja-JP").format({
    hours: 3,
    minutes: 46,
    seconds: 25,
});
console.log(formatted); // 3 時間 46 分 25 秒
```

他のIntl系のAPIと同じように、コンストラクタの第一引数にロケール識別子を渡し、`DurationFormat`インスタンスのメソッドのにdurationを表すオブジェクトに渡してやると、フォーマットされた文字列を返します。

durationに使える単位は、年(year)、月(months)、週(weeks)、日(days)、時間(hours)、分(minutes)、秒(seconds)、ミリ秒(milliseconds)、マイクロ秒(microseconds)、ナノ秒(nanoseconds)です。

詳細なAPIについてはプロポーザルのREADME[^1]もしくはMDN[^3]を参照してください。

## Intl.DurationFormatの最大値について

`Intl.DurationFormat`は2023年の10月にステージ3に到達しました。この時点で、durationの最大値を規定する仕様が取り込まれていました[^4]。この仕様では、duration内の単位ごとに最大値が規定されています。ちなみにこの動作は`Temporal.Duration`と一致しています。

まず、この仕様では、年、月、週はそれぞれ 2^32 未満でなくてはならないと規定しています。

次に、normalizeされた秒が、2^53 - 1 以下でなくてはならないと規定しています。normalizeされた秒というのは、日、時間、分、秒、ミリ秒、マイクロ秒、ナノ秒を、秒に合わせた値のことです。normalizeされた秒は、以下のように計算されます。

> normalizeされた秒 = 日 x 86,400 + 時間 x 3600 + 分 x 60 + 秒 + ミリ秒 x 10^-3 + マイクロ秒 x 10^-6 + ナノ秒 x 10^-9

仕様では、この値が2^53 - 1[^5]以下でなければならないと規定されている、ということです。

### test262の更新

Firefoxの貢献者である[@anba](https://github.com/anba)によって、この仕様のためのテストを追加するPRがtest262リポジトリに作成されました[^6]。このPRはすぐにapproveされたのですが、コンフリクトのためにマージされませんでした。

V8の`Intl.DurationFormat`の実装に関心を持っているGoogleの[@FTang](https://github.com/ftang)と、JSCの実装に関心を持っている筆者が、たびたび催促のために@anbaをメンションしていたのですが、対応されることはありませんでした。

ECMA-402のミーティングの議事録[^7]によると、このtest262の更新が、`Intl.DurationFormat`をステージ4に進めるための実質的なブロッカーになってしまっていたようです。最近になっても@anbaからの反応がなかったため、関係するコミットのみをcherry-pickして筆者がPRを作成したところ[^8]すぐにマージされました。

これによって各処理系で`Intl.DurationFormat`の最大値を実装できるようになりました[^9]。

## JavaScriptCoreにおけるIntl.DurationFormatの最大値の実装

筆者は、この`Intl.DurationFormat`の最大値を規定する仕様をJavaScriptCoreに実装しました[^10]。

最大値は`IsValidDuartion`というabstract operation[^11]で規定されています。このabstract operationはdurationの各単位の値を引数として受け取って真偽値を返します。引数の値は事前の処理によって整数であることが保証されています。

年、月、週のバリデーションは単純に実装できます。単純にそれぞれの値が2^32より小さいことを確認すれば良いだけです。問題なのは日、時間、分、秒、ミリ秒、マイクロ秒、ナノ秒のバリデーションです。これらの単位の値は、前述した以下の式に従ってnormalizeした値が2^53未満であることを確認する必要があります。

> normalizeされた秒 = 日 x 86,400 + 時間 x 3600 + 分 x 60 + 秒 + ミリ秒 x 10^-3 + マイクロ秒 x 10^-6 + ナノ秒 x 10^-9

JSCではdurationの各単位の値はdoubleで表現されているのですが[^12]、この計算を単純にdoubleに対して適用すると丸め誤差が発生してしまい、正確な値を計算できません。そこで、秒を基準とした浮動小数点数として表現するのではなく、ナノ秒を基準とした整数で表現することとにしました。最初は`uint64_t`を使おうと考えたのですが、値が大きいときには`uint64_t`に収まりきらないためWTFの`Int128`を使って実装しました。


[^1]: https://github.com/tc39/proposal-intl-duration-format
[^2]: ようはUnix Timeのこと
[^3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat
[^4]: https://github.com/tc39/proposal-intl-duration-format/pull/173
[^5]: 2^53 - 1というのは、`Number.MAX_SAFE_INTEGER`と同じ値であり、つまりNumber型（double）で正確に表現できる整数の最大値です
[^6]: https://github.com/tc39/test262/pull/3988
[^7]: https://github.com/tc39/ecma402/blob/main/meetings/notes-2024-09-26.md#durationformat-for-stage-4
[^8]: https://github.com/tc39/test262/pull/4254
[^9]: 実際には、test262にテストがなくても実装はできるが、あったほうが楽に実装できる。特に、おれみたいな仕様読み力に自信がない実装者にとっては...
[^10]: https://commits.webkit.org/285131@main
[^11]: https://tc39.es/proposal-intl-duration-format/#sec-isvalidduration
[^12]: https://github.com/WebKit/WebKit/blob/2e7e9d53c9d0b2143450c9bb95be1d35fa1c09bd/Source/JavaScriptCore/runtime/ISO8601.h#L37-L86
