---
layout: article-layout.11ty.js
date: 2025-02-24
title: "WebKitのReviewerになった"
tags: post
---

先日WebKitのReviewerになりました。担当はJavaScriptCoreです、WebCoreのことは何も知りません。

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I&#39;m officially a WebKit Reviewer! I would like to thank all the JSC Reviewers who reviewed my patches and <a href="https://twitter.com/Constellation?ref_src=twsrc%5Etfw">@Constellation</a> for nominating me.</p>&mdash; sosuke (@__sosukesuzuki) <a href="https://twitter.com/__sosukesuzuki/status/1893139635523723695?ref_src=twsrc%5Etfw">February 22, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Reviwerというのは、WebKit開発者の中でもっとも強い権限を持つ人たちです。人のパッチを正式にrejectしたりapproveしたりできます。

去年の8月にWebKit Committerになったときは、やるべきことを投げ出してWebKitに向き合っていた罪悪感があったため、ポジティブな気持ちだけではなく、大きなネガティブな気持ちを持っていました。しかし、最近はやるべきこととWebKitをうまく両立できるようになってきたので、割とポジティブな気持ちです。

あと、23歳のうちにWebKit Reviwerになることを目標にしていたので、ギリギリ達成できたのも嬉しいです。

CommitterやReviwerになるための条件は https://webkit.org/commit-and-review-policy/ にあるので興味がある人はそちらを読んでください。そんなに激ムズってわけではないですが、まあまあハードルは高いと思います。

ちなみに、WebKit Reviwerは現在114人います。https://webkit.org/team/ にリストがあるので見ればわかるんですが、82人がAppleの人、23人がIgaliaの人、4人がSonyの人です。残りがGoogleとかNokiaとかの人なので、ほとんどの人が仕事でやっていそうな雰囲気があります（というか、自分の知る限り自分以外の全員がWebKitと関係ある仕事をしている、あるいはしていた）。私の仕事は WebKitとは全く関係ないので、労働とは関係ないWebKit Reviewerという珍しい存在になることができました[^1][^2]。

そして、JavaScriptCoreのReviwerは自分を含めて11人しかいないようです。代表的なJavaScriptの処理系の一つであってもこんな感じなんですね。

ところで、本当にマジでどうでもいいことなのですが、自分を含めてWebKit ReviwerにはSuzukiという姓を持つ人が3人いるのですが、全員名前がsuke（すけ）で終わるという謎の偶然があります。つまり「任意のWebKit Reviwerについて、姓がSuzukiならば名がsukeで終わる」という命題は真ということですね。だから何だ。

今後は、引き続き貢献を続けつつ、貢献の内容をブログとかに書いていこうと思っています。よろしくお願いします。

[^1]: 仕事とは関係なくWebKit Reviewerになってから、WebKitを開発する会社に入った人は何人かいる
[^2]: この情報は、このブログ投稿時点でのWebKitリポジトリの `/metadata/contributors.json` ファイルに基づくもので、更新されていない情報もあると思う
