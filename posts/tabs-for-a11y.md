---
layout: article-layout.11ty.js
date: 2023-02-11
title: "インデントにタブを使うアクセシビリティ上の利点"
tags: post
---

この記事には誰かを攻撃したり差別したりする意図はありません。もし不適切な表現を見つけた場合は修正しますのでご連絡ください。

---

「インデントにタブとスペースのどちらを使うのか」というのは昔から何度も議論されてきた問題です。

最初に明確にしておきますが、私個人としてはタブを使おうがスペースを使おうが、プロジェクト内で統一されていれば構わないという立場です。

しかしタブには、スペースにはないアクセシビリティ上の利点が存在します。

タブの最大の特徴は、表示幅を自由に設定できることです。

ご存知のとおり、一つのタブに対して実際の見た目としてどのくらいの幅が確保されるかは、テキストエディタなどのコードを閲覧する環境の設定次第です。

たとえば、一つのタブに対して GitHub はデフォルトではスペース 8 個分の幅を確保しますが、 https://github.com/settings/appearance から自由に変更できます。

大きなサイズのフォントを使っていてインデントを小さくしたい人はタブ表示幅を 1 にすることができますし、横幅の大きなディスプレイを使っていてインデントを大きくしたい人はタブ表示幅を 8 にすることができます。

この性質は、視覚に障害がある人たちにとって重要なのだそうです。

また、点字ディスプレイを使ってコードを書いている人にとっては、より大きな問題になるそうです。インデントのために使われる一つ一つのスペースは、点字の領域一つ分を消費するので、1 レベルのインデントあたり 4 スペース使うプロジェクトの場合、3 レベルのインデントがあるコードを読み書きするとき、インデントのためだけに 12 個の点字のための領域を消費することになります。タブを使っている場合はそのレベル分の必要最小限の消費で済みます。

私には視覚障害はなく、点字ディスプレイを使ったこともありません。ですので実際にそのような立場の人々にとって、インデントのためにスペースを使うことがどのくらい難しくアクセシビリティを毀損してしまっているのかはわかりません。

もしもこの記事を読んでくれた人の中でそのような環境でコードを書いたことがある人がいたら、お話を聞かせていただきたいので私に連絡をください。(Twitter の DM かメール)。

## 参考

- [Default to tabs instead of spaces for an 'accessible first' environment · Alexander Sandberg](https://alexandersandberg.com/articles/default-to-tabs-instead-of-spaces-for-an-accessible-first-environment/)
- [Nobody talks about the real reason to use Tabs over Spaces : javascript](https://www.reddit.com/r/javascript/comments/c8drjo/nobody_talks_about_the_real_reason_to_use_tabs/)
- [Change `useTabs` to `true` by default · Issue #7475 · prettier/prettier](https://github.com/prettier/prettier/issues/7475#issuecomment-668544890)
