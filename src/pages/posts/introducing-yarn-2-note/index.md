---
path: "/posts/introducing-yarn-2note"
date: 2020-01-25
title: "Introducing Yarn 2 ! メモ"
---

https://dev.to/arcanis/introducing-yarn-2-4eh1

コアにかなり大きな変更が入ったらしい。

## v1 からのマイグレーションについて

[マイグレーションガイド](https://next.yarnpkg.com/advanced/migration)があるらしい。あとで読む。一応、メジャーなツールでは最新版を使っていれば特に問題は起こらないそう。

ただ、Flow と React-Native は現時点では Plug’n’Play (PnP)環境では動かない。(PnP ってなんだろう)それぞれのチームと協力して頑張っていくらしい。

## v1 のメンテについて

来週 1.22 がリリースされる予定で、それ以降は完全にメンテナンスモードに入る。つまり、脆弱性にパッチあてる以外のリリースはしない。新機能は Yarn v2 に対してのみ開発される。

- v1 のコードベースは、`yarnpkg/legacy` に移行される。数年後にアーカイブされるかも。
- v2 のコードベースが `yarnpkg/yarn` になることはない。履歴が消えるのが痛いから。当面は `yarnpkg/berry` のままで開発する。
- これまでのウェブサイトは legacy.yarnpkg.com に移動し、 v2 用のウェブサイト(今の next.yarnpkg.com)がメインドメインに移動する。
- Node の Docker イメージは、2020 年 4 月リリース予定の Node 14 から、Yarn 2 を出荷する。それまでは [yarnPath](https://next.yarnpkg.com/configuration/yarnrc#yarnPath)を使ってすべての Node イメージで Yarn 2 をシームレスに使えるらしい。

## 変更の詳細

### CLI の出力

- ほぼすべてのメッセージには独自のエラーコードが含まれていて、ドキュメントで検索できる。
- 行ごとに色をつけるのではなく、各メッセージの重要な部分につける(通常はパッケージ名とバージョン)
- これからの数ヶ月の間に調整が入る(特に色覚異常へのアクセシビリティとか)

### ワークスペース周り

- `yarn up <name>` ですべてのワークスペースで使われているパッケージを更新できる。
- `yarn add -i <name>` で他のワークスペースで使われているパッケージと同じバージョンを再利用する。
- [version plugin](https://next.yarnpkg.com/features/release-workflow)ってのがあるらしい。あとで読む。

### ゼロインストール

- ゼロインストール機能はないけど、そのために調整された Yarn の機能が多くある。
- ベンダーファイルをキャッシュから直接読むから、リポジトリにキャッシュが含まれている場合 `yarn install` が不要。リポジトリサイズに大きな影響が出るけど、yarn 1 のオフラインミラー機能と同様に合理的らしい。
- yarn 1 のオフラインミラーを知らないのであとで読む。
- 詳細は[ゼロインストールのドキュメント](https://next.yarnpkg.com/features/zero-installs)を読むと良いらしい。

### `yarn dlx`

- `dlx`は`download and execute の略)
- `npx` と同じことを脆弱性低めにやる。

### `yarn workspaces foreach`

- yarn workspaces foreach run build` みたいなことができるようになるらしい。
- [オプション](https://next.yarnpkg.com/cli/workspaces/foreach)で、並列実行するかとかスキップするワークスペースを選んだりすることができる。

### `patch:`プロトコル

- 依存関係ツリーの特定のパッケージに変更を適用したいときに使える。

```json
{
  "dependencies": {
    "left-pad": "patch:left-pad@1.3.0#./my- patch.patch"
  }
}
```

### `portal:` プロトコル

- `link:`と似てる。
- `portal:`は推移的な依存解決をするけど`link:`はそうじゃないらしい。このあたりはよくわからん。

### ワークスペースのリリース

- 全く新しいワークフローを設計したらしい(https://next.yarnpkg.com/features/release-workflow)
- あとで読む

### ワークスペースの Constraints (日本語でこれを翻訳するべきなのかしないでそのまま書くべきなのかわかんない)

- [Constraints](https://next.yarnpkg.com/features/constraints)という新しいコンセプトが導入された。
- ワークスペースに対してバリデーションを Prolog を書くことができる
- 例えば、次の Prolog で書かれたルールはアンダースコアに依存しないことを検証する

```prolog
gen_enforced_dependency(WorkspaceCwd, 'underscore', null, DependencyType) :-
workspace_has_dependency(WorkspaceCwd, 'underscore', _, DependencyType).
```

### パッケージごとのビルド設定

- ビルドスクリプトをパッケージごとに実行するかどうかを指定できるようになった。
- 現時点ではデフォルトではすべて実行する。
- `enableScripts`ですべてをオフにして明示的に実行するパッケージを選ぶこともできる。

### シェルのノーマライズ

- Yarn 2 の開発当初、Windowns 勢から PR をもらうことがよくあり、それらの多くは Bash でしか動かないとかの問題だった
- なので、`scripts`に記述されるであろうものの 90%をカバーできるような簡易的なインタープリタを実装した。
- これによって OSX でも Windows でも関係なく実行できるようになった。

### Peer Dependency のリンクの改善

### Lock ファイルのフォーマット

- Yarn 1 のときは、YAML ライクだけど YAML じゃない記法を使っていた。
- でもサードパーティ開発者にとっては厳しいので、YAML の標準にした。

### TypeScript で書かれた

- ユーザーには影響はないが、Flow をやめて TypeScript で書かれている。

### Moduler Architecture

- [これを読めばわかりそう](https://dev.to/arcanis/plugin-systems-when-why-58pp)
- プラグインが作れるようになったから依存関係にアクセスしたいサードパーティツールの開発が楽になった。

### 設定のノーマライズ

- パーッケージの境界が厳密になった
- `dependencies`にないパッケージは使えない。

### Buncle Dependencies の除去

- `bundleDependencies`が使えなくなったらしいけど名前しか知らなかった
- 使いたい場合は、マイグレーションガイドをよんで代替案を考えるべき

### Read-Only パッケージ

- 安全性のためにパッケージが読み取り専用になった
- こういうことはできない:

```js
const { writeFileSync } = require(`fs`);
const lodash = require.resolve(`lodash`);
writeFileSync(lodash, `module.exports = 42;`);
```
