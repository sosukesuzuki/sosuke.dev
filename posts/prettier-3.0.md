---
layout: article-layout.11ty.js
date: 2023-07-26
title: "Prettier 3.0 をリリースしました"
description: "Prettier 3.0 の主要な変更の紹介"
tags: post
---

2023 年 7 月 5 日に Prettier 3.0 をリリースしました。Prettier 2.0 がリリースされたのが 2020 年 3 月 21 日だったので、実に 3 年以上ぶりのメジャーアップデートとなります。

本当はもっと早くこのブログを書きたかったんですが、やる気が出ずだいぶ遅れてしまいました。

この記事では Prettier 3.0 の主要な変更点を紹介します。

## Prettier 3.0 の主要な変更点

Prettier 3.0 はメジャーアップデートということもあって大きな変更がいくつか含まれています。ここでは、そのうちユーザーに直接的な影響がありそうなものを紹介します。

ここで紹介する以外にも大きな変更はありますが、プラグイン開発者向けのものとか、Prettier のソースコード自体が全部 ECMAScript Modules で書かれるようになったとか、ユーザーからしたらどうでもいいような変更が多いのでここでは紹介しません。

興味がある方は公式のリリースブログを参照してください( https://prettier.io/blog/2023/07/05/3.0.0.html )。

### 日本語/中国語とラテン文字の間にスペースを入れないようにする

この変更は、日本語を日常的に書く人たちにとって影響が大きいと思います。Prettier 2.0 までは Markdown をフォーマットするときに、日本語/中国語の文字とラテン文字の間に空白を挿入していました。

たとえば、以下のような Markdown のテキストがあったとします。

<!-- prettier-ignore -->
```markdown
私はJavaScriptを書きます。
```

Prettier 2.0 はこれを以下のようにフォーマットしていました。

<!-- prettier-ignore -->
```markdown
私は JavaScript を書きます。
```

Prettier 3.0 からはこのようなスペースを挿入しなくなります。

この挙動には賛否両論あると思います。

日本語/中国語とラテン文字の間に空白を挿入しないスタイルを好む人からしたら鬱陶しい機能だったと思います。この挙動を回避するために Prettier を Markdown に対しては適用しない、というユーザーがいたことも知っています。

しかし、逆にそれを好む人からしたら便利な機能だったようです。実際 Prettier 3.0 をリリースした後に、この挙動を元に戻してほしいという意見を聞きました。

このブログ記事を見れば分かる通り、私自身は日本語とラテン文字の間に空白を入れるスタイルを好みます（好んでいるというよりは手癖でそう書いてしまうのですが）。しかし、私個人としてはそれは Prettier の責務ではない、と考えています。

日本語とラテン文字の間の空白は、視覚的な調整のための目的で使われることがほとんどでしょう。であれば、それはテキスト情報に含まれるべきではなく、文字をレンダリングする側のソフトウェアが対応するべきで、少なくとも Prettier によってそれを強制されるのは間違っている、というのが私の考えです。

もちろん、私が一人で決定したわけではありませんが、Prettier 3.0 ではこの考え方を優先しました。ユーザーのことを考えると難しい意思決定でした。

### `trailingComma` オプションをデフォルトで `all` にする

Prettier には `trailingComma` というオプションがあります。このオプションは `none` と `es5` と `all` の 3 つの値のどれかを取ります。

`none` は一切の末尾カンマを取り除きます。`es5` は ECMAScript 5 として妥当になるように末尾カンマを追加します。`all` はすべての箇所にできる限り末尾カンマを追加します。

具体的な挙動を全部は覚えていないのですが、たとえば `es5` だと関数の引数リストの末尾カンマは削除されます。

このような古い挙動をする最後の有名なブラウザである Internet Expolorer がその役目を終えサポート終了となったことから、`trailingComma` のデフォルト値が `es5` から `all` に変更されました。

### `.gitignore` に入っているファイルを Prettier も無視する

もともとは Prettier はデフォルトでは `.prettierignore` に書かれているファイルのみ無視していました。

Prettier 3.0 からは `.gitignore` に含まれているファイルもデフォルトで無視するようになります。個人的にはやりすぎじゃないかなあと思っていますが...

### 型定義ファイル(`*.d.ts`)を Definitely Typed から本体に移す

Definitely Typed はもともと静的な型の概念がない JavaScript のパッケージに対して後から型を付けるための仕組みとしては優れていると思います。

しかし、リポジトリがデカくて開発がしにくすぎるという問題があります。また、bot によって仕組み化されているとはいえ、自分が普段見ていないリポジトリを見に行くのが単純に面倒くさいとか、色々思うところがありました。

なので、型定義ファイルを Definitely Typed から Prettier のリポジトリに移しました。JavaScript の API を使う場合に `@types/prettier` をインストールする必要はもうありません。

## おわりに

もともとのリリース予定から 1 年以上遅れてのリリースになってしまいましたが、リリースできて良かったです。上手くやれたこともあったし、反省していることも多々ありますが、大きな達成感は感じています。

ちなみに、Prettier 1.0 がリリースされたときは私はまだ開発に関わっていませんでしたし、Prettier 2.0 は Georgii Dolzhykov さんが主にリリースの管理を行っていました。つまり、Prettier 3.0 は私がリリースの管理を担当した初めてのメジャーバージョンになりました。

かなり普及している OSS のメジャーバージョンのリリースを管理する経験は得難いものであると思うので、そういった意味でも良かったと思います。

ただ、一部の作業は本当につらくて、自分のプログラミング人生 10 年くらいの中でも最も辛かったと言っても過言ではないような作業もありました。それについては別途ブログを書きたいと思います。
