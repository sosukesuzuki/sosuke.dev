---
layout: article-layout.11ty.js
date: 2024-12-10
title: "WebKit(JavaScriptCore)に100個のPull Requestがマージされた"
tags: post
---

今年の 2 月から WebKit の JavaScript 処理系である JavaScriptCore に Pull Request を投げ続けています。

JavaScriptCore のソースコードは WebKit のリポジトリ https://github.com/webkit/webkit に完全に含まれています。なので、僕が Pull Request を投げる先も WebKit のリポジトリということになります。そして先日、WebKit リポジトリにマージされた自分の Pull Request の数が 100 に達しました。

Pull Request を作るという活動をやめなければ当然いつかは 100 個に達するので別に偉業ということはないんですが、どちらかというと大して意味のないことをやめられなかったというネガティブな気持ちの方が強くあります。[^1]

とはいえ、JavaScriptCorr に対して１年足らずで 100 個の Pull Request を作成してマージされる、というのはまあまあ珍しいことのようです。実際に、2024 年内にマージされた JavaScriptCore に対する PR の作者を円グラフで表すと、以下のようになっています。

<figure>
<img style="border: 1px solid gray; height: 400px; width: 643px;" src="/img/jsc-contributions-2024.jpg"  />
<figcaption>2024年にマージされたJSCのコントリビューション数</figcaption>
</figure>

これを見ると、自分は Constellation さんに次いで 2 番目のようです[^2]。

こういうことをしている人は良くも悪くも珍しいだろうと思うし、再現性がなくはないと思うので、モチベーションや学習、具体的な Pull Request の内容について記録しておきます。

## モチベーション

私が JavaScriptCore への貢献を始めた一番の理由は、好きな言語のことをもっとよく知りたいからです。私が JavaScript を好きな理由は今度どこかで書くとして、JavaScript をもっとよく知るための方法として、その処理系に継続して貢献するというのが効果的なのではないかと考えました。

なぜV8やSpiderMonkeyではなくJavaScriptCoreなのかと聞かれることがよくありますが、GitHubで開発されている唯一のメジャーJS処理系だったからという安直な理由です。

また、言語処理系の実装についてもっと知りたかったというモチベーションもあります。過去に CRuby のソースコードを読んだときに、面白かったのですが、自分が Ruby のことを知らなさすぎるせいでそこまでのめり込むことができませんでした。JavaScript であれば仕様レベルである程度把握しているので面白く読めるのではないかと思ったのです（結果としてこれはあたっていました）。

## 勉強したこと

WebKit（JavaScriptCore）のソースコードを読むにあたっていくつかのことを勉強しました。

### C++

JavaScriptCore のほとんどの部分は C++で書かれているため、JavaScriptCore に対して Pull Request を作成するためには C++を読み書きできる必要があります。

自分は C++を書いたことがほとんどなかったので C++の勉強を始めました（C 言語はなんとなくだが書ける）。どこから勉強して良いかわからなかったので、とりあえず以下の書籍を読みました。

- [Effective C++](https://www.maruzen-publishing.co.jp/item/b294734.html)
- [Effective Modern C++](https://www.oreilly.co.jp/books/9784873117362/)

これは結果として良かったと思います。C 言語と比べたときの C++の考え方がある程度わかった気がします。特にEffective Modern C++。自分の感覚として難しかったのはやはりムーブセマンティクスあたりかなと思います。C++にありがちな、一見不自然に見える挙動はそういうものだと覚えてしまえばいいのですが、ムーブセマンティクスはちゃんと理解の努力をする必要があったかなと思います。

C++を使って自分の手でプロジェクトを設計したわけではないし、JavaScriptCore 内で大規模なコードの変更を行ったわけでもないので、今でも C++のことはあんまりわかりません。ググりながら試行錯誤しているのが現状です。[cpprefjp](https://cpprefjp.github.io/) には大変お世話になっています。

### コンパイラ一般

自分はコンパイラがどのように動いているのかなんとなくは知っていましたが、詳細は知りませんでした。特にコンパイラの最適化についてはほとんど知りませんでした。そこで、中田育男先生の「[コンパイラの構成と最適化](https://www.asakura.co.jp/detail.php?book_code=12177)」を読みました。高額な書籍ですが、大学にあったので無料で読むことができました。ありがとう筑波大学。

それはそれとして、この書籍は割と分厚く内容も重厚です。今回は構文解析については関心がなかったのでそのへんはスキップして後半だけ読みました。それでもまあまあヘビーでしたが、なんとか読みました。

これによって、制御フローグラフや静的単一代入形式の概要や、それを使った最適化手法などの概要を把握できました。これらの知識は、後述する JSC に関するブログ記事を読むときにも役にたちました。

ガベージコレクションに関しては「[ガベージコレクション　自動的メモリ管理を構成する理論と実装](https://www.shoeisha.co.jp/book/detail/9784798134208)」を過去に読んだことがあったので、今回特に新しく勉強することはありませんでした。

### JSC

大規模なソースコードを読むときは、詳細なコードを読む前にもっと抽象的なアーキテクチャを把握するべきです。そこで、まず JSC のアーキテクチャについて勉強しました。幸いなことに Apple の JSC チームのメンバーが書いてくれたブログがいくつかあり、それらを読むことでアーキテクチャの外観を掴むことができます。

自分が読んだブログは以下です:

- Filip Pizlo. 2022. [Speculation in JavaScriptCore](https://webkit.org/blog/10308/speculation-in-javascriptcore/)
- Filip Pizlo. 2017. [Introducing Riptide: WebKit's Retreating Wavefront Concurrent Garbage Collector](https://webkit.org/blog/7122/introducing-riptide-webkits-retreating-wavefront-concurrent-garbage-collector/)
- Haoran Xu. 2022. [Understanding Garbage Collection in JavaScriptCore From Scratch](https://webkit.org/blog/12967/understanding-gc-in-jsc-from-scratch/)
- Justin Michaud. 2020. [A Tour of Inline Caching with Delete](https://webkit.org/blog/10298/inline-caching-delete/)
- Filip Pizlo. 2016. [Introducing the B3 JIT Compiler](https://webkit.org/blog/5852/introducing-the-b3-jit-compiler/)

これらのブログ記事の中にはとても長いものもあり、読むのに時間がかかります。

これらのブログ記事は JavaScriptCore に限らず、コンパイラや GC の勉強として興味深いものばかりです。特に、Riptide のライトバリアは面白すぎて、テンションがめちゃくちゃ上がってしまい、研究室の同期に面白さを力説してしまいました。単純に趣味としてオススメです。

### コードの読み方

「どうやってでっかいコードベースを読むんですか？」という質問をもらったことが何度かあるので、コードの読み方について。

前述のとおり全体的なアーキテクチャや用語を把握するのは前提として、その上で自分は基本的にはめちゃくちゃprint debugしてます。あとJavaScriptCoreではlldb、gdbなどのデバッガが割と動くのでめっちゃブレークポイント貼って変数の中身とかみてます。

あと、オプションをつけるとバイトコード列や、JITのディスアセンブル結果が見られるのでそれを睨むこともあります。

再現性のあるアプローチとしては、やはりそのプロジェクトでのprint debugのやり方を最初に見つけることが重要だと思います。特に、JSCではJITコンパイル後のコードからprintするための特別な関数があったりする[^4]ので、そういうのを先に見つけておいたのは良かったと思います。FTL JITの中間表現レイヤでprintする方法がどうしてもわからなかったときはWebKit Slackで聞いたらAppleの人が教えてくれました[^3]。

https://blog.jxck.io/entries/2024-03-26/chromium-contribution.html みたいな感じでどこかにまとめておくべきかとも思っています。

やや情報が古いこともありますが、[JavaScriptCore CSI: A Crash Site Investigation Story](https://webkit.org/blog/6411/javascriptcore-csi-a-crash-site-investigation-story/) にいくつかprint debuggingのやり方が載っています。

## 具体的な貢献

JavaScriptCore のようにフルタイムのコミッターがいてちゃんとメンテナンスされている言語処理系に対して、外部の人間が貢献できるような箇所を見つけるのは難しいと思う人もいるかもしれません。が、実際はそんなことはなく、頑張って探せばたくさん見つかります。

それぞれの種類ごとに、実際のコミットへのリンクをいくつか載せています。

### バグ修正

JavaScriptは仕様と実装が明確に分かれているので、仕様と実際の動作に違いがあったらそれはバグです。test262でコケているのを見つけたり、仕様や実装を睨むことで見つけることができます。Bugzillaに記載されているものもありますが、簡単なものは大体修正されているので自分で見つける方が早いかもしれません。

修正が簡単なものは直しましたが、修正することによって大幅に性能が悪くなったり、そもそも修正するのが難しかったりして諦めたものも結構あります。

- [[JSC] RegExp quantifier should allow 2^53 - 1](https://commits.webkit.org/280953@main)
- [[JSC] Object.assign shouldn't do batching when sources argument contains target object](https://commits.webkit.org/284486@main)

### test262やUCDの更新

test262[^5]やUCD(Unicode Character Database)の更新が滞っているようだったので適宜手動で更新しています。

- [[JSC] Update test262 to 09/17/2024 version](https://commits.webkit.org/283705@main)
- [[JSC] Update RegExp UCD to 16.0.0](https://commits.webkit.org/283741@main)

### リファクタリング

継続的にコミットしているとリファクタリングするべき箇所もわかってくるので、明らかにリファクタリングするべきときはしています。

- [[JSC] Add JSAsyncFromSyncIterator](https://commits.webkit.org/283311@main)
- [[JSC] Add JSRegExpStringIterator](https://commits.webkit.org/283542@main)

### パフォーマンス改善

JITの新しい最適化フェーズの導入ややGCアルゴリズムの改善のような多くのケースに適用できる最適化を行うのは難しいですが、特定のビルトイン関数の実行を速くすることは割と簡単にできます。最近はArrayのメソッドを高速化することに熱中しています。ナイーブなforループで実装されている配列のコピーを`memcpy`とか`memset`にしたり、C++の`std::reverse`とか使うだけで割と速くなります。

配列の内部表現を理解する必要はあるけど、一回わかってしまえば色々な関数に対して似た方法が適用できるかなという印象。とはいえ、自分の手でブラウザ上で動く`memset`とか書くのはちょっと緊張しますね。

DFG、FTL JITをいじるような最適化も一個進めているのですが、なかなか難しくてまだマージできていません。

- [[JSC] Add fast path for array.concat()](https://commits.webkit.org/284060@main)
- [[JSC] Implement Array.prototype.fill in C++](https://commits.webkit.org/287215@main)
- [[JSC] Implement Array.prototype.toReversed in C++](https://commits.webkit.org/287431@main)

### Normative Changeの実装

Normative Changeというのはざっくりいえば、仕様のリファクタリングを除くJavaScriptの仕様への変更のことです。新しい提案の追加もNormative Changeに含まれます。新しいものとか地味なものは実装されていないことがよくありますので、簡単にできそうなやつは結構やっています。デカいのだとIterator Helpersを半分くらい実装しました。あとは `Intl.DurationFormat` とか `Intl.Locale` の未実装だったNormative Changeを何個か実装しました。

- [[JSC] Implement some/every/find from Iterator Helpers Proposal](https://commits.webkit.org/283677@main)
- [[JSC] Limits values for Intl.DurationFormat and Temporal.Duration](https://commits.webkit.org/285131@main)

## 今後

あんまり手が回っていなさそうなNormative Changeへの対応やビルトイン関数のパフォーマンス改善を中心に継続していこうと思っています。

ただ、JSCへの貢献をやめる気はないですけど、もう少し現実と向き合う時間を増やすべきだと思っています。

[^1]: やりたくないことへの現実逃避としてJavaScriptCoreに貢献しているきらいがある
[^2]: 本当にどうでもいいが、筆者とConstellationさんは本名が良く似ている
[^3]: 私が貢献を始めた当初はWebKit Slackはフリープランだったため90日で記録が消えていたが、最近有料プランになった。ありがとうAppleとSlack。
[^4]: 特定のレジスタの中身をさくっと見れたりして大変便利。
[^5]: [Web Developer Conference 2024](https://web-study.connpass.com/event/321711/) で[このへんの話](https://docs.google.com/presentation/d/1jGIYGRoyNxTO8P6thtp_u1NPv3RD_xyuRaTph9icpyM/edit?usp=sharing)をしました。
