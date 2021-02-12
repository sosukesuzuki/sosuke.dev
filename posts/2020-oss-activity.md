---
layout: article-layout.11ty.js
date: 2020-12-24
title: "2020年 OSS 活動振り返り"
tags: post
---

https://sosuke.dev をブログにしていたんですが、わけあってドメインを失効してしまったのでしばらくの間ははてなブログに書くことになりそうです。

2020 年ももうすぐ終わります。今年は OSS の開発に多くの時間を費やしてきた実感があるので、実際どのプロジェクトで何ができて逆に何ができなかったのか振り返り、そして来年はどのように OSS と向き合っていくのか考えていこうと思います。

(GitHub Sponsors できない(免許もパスポートもない)ので、僕の活動を応援してくれる人がいたら下のほしいものリストからアマギフを `aosukeke[at]gmail.com` まで送ってくれるととても嬉しいです)

https://www.amazon.jp/hz/wishlist/ls/2VMKXAI8J8278?ref_=wl_share

## 主に関わったプロジェクト

ずっと JavaScript ツールチェイン系のプロジェクトに関わっていて、主に Prettier と Babel の 2 つの開発に関わっていました。

### Prettier

去年の 9 月にコミット権限をもらってからアクティブに活動をしています。

去年から引き続きバグ修正や機能追加など「みんなが求める Prettier」のクォリティを維持するための開発をしています。

長く関わっているといろいろと自分の意見が出来てくるもので、様々な決定に関わったりとある程度重要な立場になってきたと感じています。

また、アクティブなメンテナーの数は減る一方という状況もあり、 2.1 からはリリースブログとリリースを担当するようになりました。

2.1 のリリースのときは大変緊張しましたが、パッチリリース含めて何度かリリースを繰り返す度に慣れてきていて、リリーススクリプトの改善等もできるようになってきました。

2020 年のコントリビューションの数を見るとこんな感じです。コードレビューが多いので、コードを書いた数はそんなに多くありません。

![2020-prettier-contributions01](/img/2020-prettier-contributions01.png)

2020 年のコミットの数を見るとこんな感じです。まあ、そこそこやっているという感じでしょうか。

![2020-prettier-contributions02](/img/2020-prettier-contributions02.png)

質を劣化させないことは出来たと思うけど、プロジェクトを先に進める開発は全然できなかったなと思います。来年はもう少し大きな開発をやりたいと思っています。

### Babel

9 月末頃から「パーサーの実装が気になって仕方がない！！！」という気持ちが出てきて、Babel のパーサーの実装を読み始めました。

そこからバグを見つけ次第コミットしまくっていたら、10 月頃に Org に招待されました。

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I&#39;ve joined <a href="https://twitter.com/babeljs?ref_src=twsrc%5Etfw">@babeljs</a> ! <a href="https://t.co/Fvp5KsmndB">pic.twitter.com/Fvp5KsmndB</a></p>&mdash; Sosuke Suzuki (@__sosukesuzuki) <a href="https://twitter.com/__sosukesuzuki/status/1317837431207440385?ref_src=twsrc%5Etfw">October 18, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

招待されるまでがかなり早かったように思えますが、Prettier メンテナーとしての活動で Babel と関わることもあったのでそのあたりで認知されていたのも影響しているのかなーと思っています。

Babel 側のバグ修正を大量にやった結果、Babel のパーサーに依存している Prettier 側のタスク量がめっちゃ増えたのは大変でしたが「エコシステムを改善しているんだ」という感覚を持ててよかったです。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Babel のシンタックスエラー直しまくったら Prettier の方の作業量めっちゃ多くなってびびってる <a href="https://t.co/TrUzTaqLMH">https://t.co/TrUzTaqLMH</a></p>&mdash; Sosuke Suzuki (@__sosukesuzuki) <a href="https://twitter.com/__sosukesuzuki/status/1316634129786499075?ref_src=twsrc%5Etfw">October 15, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

最近はバグ修正だけではなくて、新しいプロポーザルの実装なども自らお願いして担当したりしてます。

https://zenn.dev/sosukesuzuki/articles/432588a7c8287d

2020 年のコントリビューションを見るとこんな感じです。数は全然多くないですね。

![2020-babel-contributions01](/img/2020-babel-contributions01.png)

2020 年のコミット数はこんな感じです。こちらも全然多くはないですね。とはいえ、2020 年に限ればコアチームのメンバーたちの次に多いみたいです。

![2020-babel-contributions02](/img/2020-babel-contributions02.png)

Babel ではまだまだ新人コントリビューターという感じなので、引き続き貢献しつつもっと価値を出していけるようになると良いなと思ってます。

あんまり Babel にとって役に立つことはできませんでしたが、得たものは大きかったように思います。Babel の開発をしていると ECMAScript の仕様をちゃんと眺めつつ実装していくことがよくあるので、そういった仕様を読む力がついたと思うし、なにより以前に比べて JavaScript に詳しくなったと感じています。

## その他のプロジェクト

ガッツリ時間を使ったのは Prettier と Babel だけでしたが、暇なときにその他にもいくつか自分が使っている OSS にちょこちょこ PR や Issue を出していたような気がするので見てみます。

- typescript-eslint
  - Prettier が依存していたり Babel の AST との互換性を意識しているのもあってたまにコミットしていた
  - AST の型がキレイについてて開発体験が良い
- Excalidraw
  - 出たばかりの頃に小さなバグをいくつか直したりした
  - 最近は全然やってなくてわからないけど、大学の課題で木書くときとかにたまに使ってる
- DefinitelyTyped
  - Prettier の型定義が壊れがちなのでたまに直したりしていた
  - 他のライブラリはほとんどやってないと思う
  - リポジトリが巨大なのであまり好きではない
- eslint-plugin-vue
  - 一時期インターンで Vue を使っていたので新しいルールを追加したりバグを直したりした
  - 最近は Vue を使ってないし全然やってないけど一応ウォッチしている
- mizchi/mdbuf
  - Markdown を書くときに使っているエディタ
  - ブラウザで動くしシンプルだしそこそこ速いので便利
  - バグを修正したりダークモード追加したりした

こんな感じです。どれも楽しかったです。

## 来年どうしていくのか

今年関わったプロジェクトには関わり続けていくつもりです。特に Prettier は自分がいなくなるとちょっとやばそうだし。

ただ同じことばっかりやっていても飽きるので、でも JavaScript は好きなので、来年は C++ を勉強して V8 や JavaScriptCore みたいな実用エンジンを読んだりできそうだったら貢献したりしたいなーと思ってます。

あと、OSS プロジェクト内で価値を出していくにはやはり英語で議論する力が必要だと感じることも多かったので、コーディングの時間を減らして英語学習に使ったほうがいいかなとも思っています。
