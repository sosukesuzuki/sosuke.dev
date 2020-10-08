---
layout: article-layout.11ty.js
date: 2020-10-05
title: "GitHub Actions で Prettier がバグってないか確認する"
tags: post
---

## 背景

Prettier をリリースする前には実際に Prettier を使っているプロジェクトのソースコードに対して新しいバージョンの Prettier を実行し、リグレッションが起きていないかを確認する必要がある。

前回のリリースを担当したので、この作業も自分でやったのだけどかなり面倒くさかった。というのも、次のような作業を手動で行う必要があったから。

- そのタイミングでの最新バージョンの Prettier を使っているプロジェクトを GitHub で探す。
- フォークする。
- クローンして、Prettier のバージョンを master(`prettier/prettier`)に更新する。
- `package.json` を読んで Prettier を実行するスクリプトを探して実行する。
- 差分をコミットしてフォークに Pull Request を投げて他のメンテナーに共有する。

これらの工程を手動でやるのは、難しくはないけどとても面倒くさい。できればもうやりたくないので、よしなに自動化できたらいいなーなんて思ってた。

そして、これとは別の文脈で、「Prettier のリリース頻度遅くない？」みたいな話がユーザーからもメンテナーからもあがっていた。それはそうで、一回のマイナーリリースに約半年かかることもある。これは別に意図しているわけではなくて、人手が足りなかったりしてそのバージョンでやりたいことが達成できず、ユーザーに急かされてリリースする、といった流れになっていた。

なので、「月に一回マイナーリリースしたいねー」みたいな話を自分から提案してみた。

https://github.com/prettier/prettier/issues/9095

まだ決まったわけではないけど、個人的には月に一度のマイナーリリースを実現したいと考えている。月に一度マイナーリリースをするということは、上記のリグレッションチェックの工程を月に一回しなければならないということで、それは本当に面倒くさいし楽しくないので、やはり自動化をしなければと思い立ちそういう Issue を作った。(ついでに、自分のプライベート的にも 10 月からはオフラインとはいえ大学も普通に始まるし、最近自動車教習所に通い始めてしまったので、Prettier に割く**無駄な**時間は積極的に減らしていきたいと考えていた。)

https://github.com/prettier/prettier/issues/9290

この Issue で、自分は「自動化したいなー」というくらいの話しかしていなくて具体的な手法については全然考えていなかったのだけど、他のメンテナーから、別リポジトリに切り出して git submodule と GitHub Actions を使って Pull Request 上で差分を確認したいみたいな提案があった。

確かに Prettier 本体のリポジトリで色々いじるより小回り聞くし別リポジトリでさっくりやってみるかーと思い作り始めた。

## 概要

開発したものは [sosukesuzuki/prettier-regression-testing](https://github.com/sosukesuzuki/prettier-regression-testing) においてあって使い方も書いてあるので先にみたい人はそちらを見てください。

使い方は簡単で、基本的には Issue に `run` という内容でコメントするだけ。それをトリガーにして GitHub Actions のワークフローが実行される。

そのワークフローでは、 git submodule として事前に登録してあるリポジトリのソースコードに対して、新しい Prettier(これも submodule として追加されている)を実行する。実行した結果なにか差分があればそれを Issue コメントとして返す。なければない旨を表示する。

![prettier-regression-checker-01](/img/prettier-regression-checker-01.png)

Prettier のコミットハッシュやブランチを指定できると便利なので、`run with checking out 36c35be2109e4d4d4b0e89862c993e15e22cc6d1` みたいなコメントをするとそこにチェックアウトした上で実行し、差分をコメントしてくれる。

![prettier-regression-checker-02](/img/prettier-regression-checker-02.png)

当初 Pull Request で差分を確認するつもりだったが、submodule 内の差分を Pull Request で確認する方法がわからなかったから Issue コメントとして実装してみたら意外にもいい感じだったのでそのままいくことにした。どうしても Pull Request 上で確認したくなったら git submodule じゃなくて git clone することになりそう。

## しくみ

まず、`prettier/prettier` が git submodule として `./prettier` に置いてある。ワークフローで実行する Prettier はこの submodule です。

そして、Prettier を実行する対象のリポジトリは submodule として `./repos` 下ににおいてある。現在は自分が過去に何度か貢献していてなんとなく勝手がわかっている `typescript-eslint/typescript-eslint` と `vuejs/eslint-plugin-vue` がある。

そして、ワークフローがトリガーされると次のような順番で処理が行われる。

- `./prettier` の依存をインストールする。
- (`run with checking out ...` で実行されていた場合、チェックアウトする)
- `./repos` 下においてあるリポジトリに対して `./prettier/bin/prettier.js` を実行する(Prettier は素の JavaScript で書かれているので、GitHub から落としてきたものをそのまま実行できる)
- `git diff --submodule=difff ./repos` で対象のリポジトリに生まれた差分をテキストで得る。
- 差分のテキストを含めた Issue コメントを作成する。

簡単に言えばこのような感じ。ちなみに自分はシェルスクリプトや YAML を書くのが苦手なので、上記の工程は全部 JavaScript で書いた。([sindresorhus/execa](https://github.com/sindresorhus/execa)を多用した。) https://github.com/sosukesuzuki/prettier-regression-testing/blob/97c104bab18ce9683532e0b76c9585034e5890f5/index.js にこの記事を書いている時点でのコードがあります。

## 所感

まだ対象にしているリポジトリが少なすぎるので、追加していきたいと思っている。できれば、TypeScript と JavaScript 以外のものをどんどん追加していきたい(その２つは得意なメンテナーが多い)。Vue の SFC とか GraphQL とかのコードを Prettier でフォーマットしているプロジェクトをご存知の人がいたら教えてくれると嬉しいです。

それにまだ実際にリリース時のリグレッションチェックの作業に使ったわけではないので、本当に便利なのかはまだ正直わからない。でも手動でやるよりは明らかに楽になるのでリリースの頻度をあげられるんじゃないかなーとは思ってる。
