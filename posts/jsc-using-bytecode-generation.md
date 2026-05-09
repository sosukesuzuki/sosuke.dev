---
layout: article-layout.11ty.js
date: 2026-05-09
title: "JavaScriptCoreのusing/await usingにおけるバイトコード生成の実装"
tags: post
---

この記事はJavaScriptCoreにおける `using` / `await using` 構文の実装について、特にバイトコードの生成に焦点をあてて解説するものです。

該当のコミットは以下の二つです:

- https://commits.webkit.org/308955@main
- https://commits.webkit.org/309389@main

## using / await using 構文とは

`using` / `await using` 構文は、現在Stage3の[Explicit Resource Managementプロポーザル](https://github.com/tc39/proposal-explicit-resource-management)によって導入されるECMAScriptの新しい構文です。ファイルハンドラやネットワークのコネクションなど、ライフタイムを持つリソースを明示的に管理するための機能です。

`using` と `await using` は `var` `let` `const` に次ぐ新たな変数宣言のキーワードで、`using foo = resource;` のように変数を宣言することができます。`using` や `await using` で変数を宣言すると、そのスコープを抜けるときに `using` なら `resource[Symbol.dispose]`、`await using` なら `resource[Symbol.asyncDispose]` メソッドが呼び出されます。これによって、管理するべきリソースとその解放処理を一つのオブジェクトに記述できるようになり、さらにその解放処理が自動で呼び出されるようになります。

Explicit Resource Management プロポーザルについてはすでに多くの解説記事が公開されているため、詳細が気になる人は別の記事をあたることを推奨します。たとえばV8開発チームによる [JavaScript's New Superpower: Explicit Resource Management](https://v8.dev/features/explicit-resource-management) はわかりやすくよくまとめられた記事だと思います。

この記事ではバイトコードの生成に焦点をあてて解説しますが、パーサーの実装における複雑さについては baseballyama さんと ota-meshi さんによる [JavaScript パーサーに using 対応をする過程で与えたエコシステムへの影響](https://speakerdeck.com/baseballyama/javascript-pasani-using-dui-ying-wosuruguo-cheng-deyu-etaekosisutemuhenoying-xiang) が詳しいです。

## 実装の方針

JSCにおける `using` と `await using` の実装の大まかな方針について説明します。

JavaScriptCoreはパーサーによって生成された抽象構文木からバイトコードを生成し、インタプリタ（LLInt）がそれを実行します。さらにBaseline JIT、DFG、FTLという三つのtierのJITコンパイラが存在し、それらはすべてバイトコードを入力として受け取り、それぞれ異なる最適化を経て最終的には実行マシンに依存したマシンコードを生成します。つまり新しい言語機能を実装する場合であっても既存のバイトコード命令の組み合わせによって実装できるなら、パーサーとバイトコードのジェネレータさえ実装すればよく、インタプリタやJITコンパイラに手を加える必要はありません[^1]。

`using` と `await using` は通常の変数宣言とスコープごとに自動で実行される `finally` ブロックの組み合わせと捉えることができます。スコープを抜けるときに必ず dispose を呼び出すという動作は、JSCがすでに持っている try-finally のためのバイトコードによってそのまま実現できます。また `await using` も従来の await 処理に使われているバイトコードによって表現できます。そのため今回の実装では新しいバイトコード命令は追加せず既存の命令の組み合わせとして表現する方針をとりました。

さらに今回の実装では、仕様上の [`[[DisposableResourceStack]]`](https://tc39.es/proposal-explicit-resource-management/#table-disposecapability-record-fields) をランタイムのリストとして表現する代わりに、バイトコード生成時に展開する方針をとっています。仕様では Environment Record が dispose されるリソースのリストを保持し、スコープを抜けるときに [`DisposeResources` abstract operation](https://tc39.es/proposal-explicit-resource-management/#sec-disposeresources) がそのリストを逆順にループして各リソースの dispose 処理を呼び出すことになっています。しかし `using` 宣言は必ず一つのリソースに対応し、ブロックに含まれる `using` の数はパース時に静的に確定します。JSCではこの性質を利用して、dispose の呼び出しをループで表現せずに宣言の個数分直列に並べたバイトコードとして表現しています。

例を示します。以下のような `using` を使ったブロックについて考えます。

```js
{
    using a = resource1;
    using b = resource2;
    doSomething();
}
```

このブロックは、JSCでは概念的には以下のコードに近いバイトコードへと展開されます。

```js
{
    let _a, _a_dispose;
    let _b, _b_dispose;
    try {
        _a = resource1;
        _a_dispose = GetDisposeMethod(_a); // Symbol.dispose メソッドを取得
        _b = resource2;
        _b_dispose = GetDisposeMethod(_b);
        doSomething();
    } finally {
        // 宣言と逆順にdisposeする、途中で例外が投げられた場合はSuppressedErrorに包んで投げられる
        if (_b_dispose !== undefined) _b_dispose.call(_b);
        if (_a_dispose !== undefined) _a_dispose.call(_a);
    }
}
```

ここで `GetDisposeMethod` は[仕様の同名の abstract operation](https://tc39.es/proposal-explicit-resource-management/#sec-getdisposemethod) とその周辺の処理をまとめたもので、引数が `null` か `undefined` なら `undefined` を返し、そうでなければ `Symbol.dispose` メソッドを取得して、それが callable でなければ `TypeError` を投げます。JSCではこれを builtin の JS 関数として実装し、通常の関数呼び出しのバイトコードで呼び出しています。

もし仕様に忠実に実装した場合は、概念的には以下のコードに近いバイトコードが生成されることになります。

```js
{
    const stack = [];
    try {
        const a = resource1;
        stack.push({ value: a, dispose: GetDisposeMethod(a) });
        const b = resource2;
        stack.push({ value: b, dispose: GetDisposeMethod(b) });
        doSomething();
    } finally {
        // 逆順にdispose、途中で例外が投げられた場合はSuppressedErrorに包んで投げられる
        for (let i = stack.length - 1; i >= 0; i--)
            stack[i].dispose.call(stack[i].value);
    }
}
```

実際の `finally` ブロックに相当する処理は `SuppressedError` を使ったエラーハンドリングを含むためにもう少し複雑なのですが、それについては後述します。

## tryブロックの生成

前述の通り、JSCではループの代わりに展開された dispose 処理を生成します。そのためには各リソースの値と dispose メソッドを保持するためのレジスタ（バイトコードマシン上の仮想レジスタ、実際のマシンレジスタではない）を `using` 宣言ごとに固定で割り当てる必要があります。

ここで問題になるのは、`using` の初期化子は任意の式なのでその評価中に例外が投げられる可能性があるということです。

さきほどの例で考えてみると、もし `resource2` の評価中に例外が投げられた場合、`b` の dispose メソッドはまだ取得できていませんが、`a` は正常に取得できているため `finally` ブロックの中で `a` に関しては dispose を行い `b` に対しては何もせず（というかリソースの取得ができていないため何もできない）にスキップする必要があります。

そのため、JSCでは `try` ブロックに入る前にすべてのリソースのためのレジスタのペアを確保し `undefined` で初期化しています。これなら `finally` ブロック側は単純に「dispose メソッドを入れるレジスタが `undefined` ならその呼び出しをスキップ」するだけで良いわけです。さきほどの擬似的なJSコードで `try` の外で変数を宣言していたのはこのためです。ちなみにこの仕組みだと「実行が到達しなかった宣言」と「`null` や `undefined` を代入した宣言」はどちらも method レジスタが `undefined` のままなので、同じ分岐でスキップできます。

このレジスタのペアをJSCでは `UsingSlot` という構造体として表現し、バイトコード生成時に `UsingScope` という構造体で管理しています。

```cpp
struct UsingSlot {
    RefPtr<RegisterID> value;
    RefPtr<RegisterID> method;
};
```

```cpp
struct UsingScope {
    Vector<UsingSlot> slots;
    unsigned nextSlot { 0 };
};
```

関数やトップレベルブロックごとのバイトコード生成を担うクラス `BytecodeGenerator` はこれを `Vector<UsingScope> m_usingScopeStack` として保持します。`using` を含むブロックに対するコード生成を開始するときに、そのブロックに含まれる `using` 宣言の個数分だけ `UsingSlot` を確保した `UsingScope` を `m_usingScopeStack` にプッシュします。そして実際にブロックのコード生成中に `using a = resource1` に到達すると、確保しておいた `UsingSlot` のうち先頭のものに対して `_a = resource1` と `_a_dispose = GetDisposeMethod(_a)` に相当するバイトコードが生成されます。次の `using b = resource2` では二番目の slot、というように宣言順に `UsingSlot` が埋められていきます。

ちなみに `UsingScope` がスタックとして管理されているのはネストしたブロックを表現するためです。なお `using` を一つも含まないブロックに対してはこれらの処理はすべてスキップされるため、既存の通常のブロックに対するオーバーヘッドはありません。

## finallyブロックの生成

ここまでで slot の事前確保と `try` ブロックのバイトコード生成について説明したので、ここからは `finally` ブロック側、つまり実際に dispose を呼び出す部分について説明します。

JSCにはもともと try-finally のバイトコードを生成するための `FinallyContext` という仕組みが存在します。これは `try` ブロックをどのように抜けたか（正常終了したのか、throw / return / break / continue のどれで抜けたのか）を completion type と呼ばれるレジスタに記録しておいて、`finally` を実行し終わったあとにそのレジスタをみて元の制御フローを再開する、というものです。`using` の dispose もこの `FinallyContext` を使っているだけなので、ブロックの途中で `return` や `break` で抜けても dispose が必ず実行されるという動作を簡単に実現できます。

`finally` の中身は仕様の `DisposeResources` に相当します。仕様では各リソースの dispose を逆順に呼び出し、途中で例外が投げられても残りのリソースの dispose は実行し、複数の例外が出た場合には `SuppressedError` を使って入れ子にして最後にまとめて throw する、ということになっています。`SuppressedError` はこの `using` と一緒に仕様に入る新しいエラー型で、`error`（新しく発生した例外）と `suppressed`（それによって握りつぶされることになった例外）という二つのプロパティを持っています。dispose の途中で何度例外が発生しても、すべてのエラー情報が `SuppressedError` のチェインの中に残ります。

ただし、`try` の中で例外が投げられたあとに `finally`（つまり dispose 処理）でエラーが発生しなかった場合は `SuppressedError` でラップせずに `try` で発生した例外をそのまま throw する必要があります。

JSCではこのエラーハンドリングを適切に実装するために三つのレジスタを用意しています。最終的に throw する候補を保持するための `pendingError`、その候補がすでにあるかどうかの `hasError`、そして dispose 処理の中で一回でも例外が投げられたかどうかを表す `disposeThrew` です。さきほどの「`try` だけで例外が投げられて `finally` は成功した」ケースを区別するためには `hasError` だけでは足りないので、`disposeThrew` を別に持っています。

そして各 `UsingSlot` に対して「method レジスタが `undefined` ならスキップ、そうでなければ `method.call(value)` を呼ぶ、その呼び出し自体は try-catch で囲っておき catch したらこの三つのレジスタを適切に更新する」というパターンのバイトコードを、宣言と逆順に `UsingSlot` の数だけ並べます。すべての slot を処理し終えたとき `disposeThrew` が true なら `pendingError` を throw、そうでなければもとの completion から再開して終わりです。

さて、さきほどの例に戻ります。

```js
{
    using a = resource1;
    using b = resource2;
    doSomething();
}
```

このコードに対して生成されるバイトコードを擬似的に書き下すと以下のようになります。

```asm
// --- try の前: slot を確保して undefined で初期化 ---
mov   slot[0].method, Undefined
mov   slot[1].method, Undefined
mov   completionType, Normal

// --- try 本体 ---
mov   slot[0].value, resource1
call  slot[0].method, getDisposeMethod(resource1)
mov   slot[1].value, resource2
call  slot[1].method, getDisposeMethod(resource2)
...   doSomething()

// --- finally ---
mov   pendingError, Undefined
mov   hasError, False
mov   disposeThrew, False

// try 本体が throw していたら pendingError に入れておく
jneq  completionType, Throw, skip_body_error
mov   pendingError, thrownValue
mov   hasError, True
skip_body_error:

// slot[1] (b) を先に dispose
jeq   slot[1].method, Undefined, skip_slot1
try:
  call_ignore_result  slot[1].method.call(slot[1].value)
  jmp   skip_slot1
catch (e):
  jfalse hasError, first_error_1
  call  pendingError, SuppressedError(e, pendingError)
  jmp   done_1
first_error_1:
  mov   pendingError, e
  mov   hasError, True
done_1:
  mov   disposeThrew, True
skip_slot1:

// slot[0] (a) も同様に dispose
...

// 後処理
jfalse disposeThrew, no_dispose_error
throw  pendingError
no_dispose_error:
// 元の completion (正常 / return / break / 元の throw) を再開
```

## await using への拡張

ここまでは通常の同期的な `using` についての話でした。ここからは `await using` への拡張についての説明をします。

`await using` も基本的な構造は変わりません。つまり slot を事前に確保して `try` ブロックでそれを埋めて `finally` ブロックでリソースを逆順に dispose するという流れは同じです。

違うのは `Symbol.dispose` の代わりに `Symbol.asyncDispose` を呼び出すこと、そしてその戻り値を await することです。await 自体はJSCの async 関数がもともと使っている `op_yield` というバイトコード命令を生成するだけなので、ここは既存の仕組みで素直に実装できます。

厄介なのは `await using x = null;` の扱いです。通常の `using` では、実行されなかった `using` 宣言や `null` や `undefined` を代入する `using` 宣言は、どちらも method のためのレジスタが `undefined` のままなので、それを条件としてスキップできます。さきほどの擬似的なバイトコードでいう `jeq   slot[1].method, Undefined, skip_slot1` に該当します。

しかし `await using` では少しめんどくさい振る舞いがあります。`await using x = null` は `Symbol.asyncDispose` が呼び出されることはありませんが、スコープを抜けるときに仕様上の `Await(undefined)` を一回発生させるのです。つまり「到達された `await using` で宣言された変数に代入された値が `null` である」場合は await が必要であるのに対して、「そもそも `await using` 宣言に到達しない」場合は await が不要、という区別をしなければならないのです。

そのため、`UsingSlot` に `reached` という boolean を入れておくレジスタを追加し、`await using` 宣言のバイトコード生成時に「`Symbol.asyncDispose` メソッドの取得が（戻り値に関わらず）例外を投げずに完了したら `reached` を `true` にする」という命令を生成します。`finally` 側では「`reached` が `false` なら完全にスキップ、`reached` が `true` で method が `undefined` なら await が必要だという印を付ける」という分岐になります。

`await using` にはさらにもう一つややこしい仕様があります。`await using x = null; await using y = null;` のように `null` を代入する `await using` 宣言が複数あった場合でも発生する Await は合計で一回まで、また実際に `Symbol.asyncDispose` の戻り値を await した場合には `null` 由来の Await は不要、ということになっています。

仕様の `DisposeResources` ではこれを `needsAwait` と `hasAwaited` という二つの変数によって管理しています。`needsAwait` は「`null` を代入する `await using` 宣言に到達したため、どこかで `Await(undefined)` を一回発生させる必要がある」ことを表すフラグで、`hasAwaited` は「dispose 処理の中ですでに何かを Await した」ことを表すフラグです。実際に `Await(undefined)` を発生させるのは `needsAwait && !hasAwaited` を満たすときだけです。JSCでもこの二つをそのままレジスタとして持って、仕様通りに分岐を生成しています。

ここで、具体的な例として以下の `await using` を使ったコードを考えます。

```js
{
    await using a = null;
    doSomething(); // ここで throw するかもしれない
    await using b = null;
}
```

JSCでは、このブロックは概念的には以下のJSコードに近いバイトコードへと展開されます。

```js
{
    let _a, _a_dispose, _a_reached = false;
    let _b, _b_dispose, _b_reached = false;
    try {
        _a = null;
        _a_dispose = GetAsyncDisposeMethod(_a); // null なので undefined が返る
        _a_reached = true;
        doSomething();
        _b = null;
        _b_dispose = GetAsyncDisposeMethod(_b);
        _b_reached = true;
    } finally {
        let needsAwait = false, hasAwaited = false;
        // b から処理
        if (_b_reached) {
            if (_b_dispose !== undefined) {
                const r = _b_dispose.call(_b);
                hasAwaited = true;
                await r;
            } else {
                needsAwait = true;
            }
        }
        // a を処理
        if (_a_reached) {
            if (_a_dispose !== undefined) {
                const r = _a_dispose.call(_a);
                hasAwaited = true;
                await r;
            } else {
                needsAwait = true;
            }
        }
        // 保留中の Await を消化
        if (needsAwait && !hasAwaited) await undefined;
    }
}
```

`doSomething()` が throw した場合、`_a_reached` は `true` ですが `_b_reached` は `false` のままなので、`b` の処理は完全にスキップされ `a` の処理で `needsAwait` が立ち、最後に `await undefined` が一回だけ実行されます。一方 throw しなかった場合は `a` `b` ともに到達済みで両方とも `needsAwait` を立てますが、こちらも最後の `await undefined` は一回だけです。もし `b` に実際のリソースが代入されていて `Symbol.asyncDispose` を await した場合は `hasAwaited` が `true` になるため、`a` が `null` でも追加の Await は発生しません。

## まとめ

JSCにおける `using` / `await using` のバイトコード生成についてまとめます。

- 新しいバイトコード命令は追加せず、既存の try-finally の機構と `op_yield` の組み合わせで表現した
- 仕様の `[[DisposableResourceStack]]` をランタイムのリストとして持たず、`using` の個数がパース時に確定することを利用してバイトコード生成時に展開した。リソースは固定のレジスタペア（slot）に置き、`DisposeResources` のループは宣言の個数分の直列なバイトコードとして並べた
- 初期化子が途中で throw しても安全に処理できるよう、slot は `try` に入る前にすべて確保して `undefined` で初期化しておく
- `finally` 側のエラーハンドリングは `pendingError` / `hasError` / `disposeThrew` の三つのレジスタで管理し、`SuppressedError` のチェインを構築する
- `await using` では「到達したが `null` だった」と「未到達」を区別するために `reached` レジスタを追加し、Await の回数制御は仕様の `needsAwait` / `hasAwaited` をそのままレジスタとして持つことで実現した

## 他の処理系の実装

最後に、V8とSpiderMonkeyがどのように `using` を実装しているのかを簡単に見ておきます。

結論から言うと、どちらも「実装の方針」のセクションで示した「仕様に忠実な実装」の擬似コード、つまりランタイムでリストを作って `using` ごとに push し `finally` でそれをループして dispose するという形に近い実装になっており、JSCのようにバイトコード生成時に展開する方式はとっていません。一方で、既存の try-finally の機構に乗せるという点は三者とも共通しています。違いが出るのは「リストをどこに置くか」と「dispose のループをどこで回すか」の二点です。

### V8

V8では `using` を含むブロックに入るときに `JSDisposableStackBase` というGC管理されるオブジェクトをヒープにアロケートし、その参照をインタプリタのレジスタ一つに保持します。`using` 宣言ごとにこのオブジェクトの内部の配列へリソースと dispose メソッドを push していきます。

新しいバイトコード命令は追加されておらず、これらはすべて既存の `CallRuntime` 命令でランタイム関数（`InitializeDisposableStack` / `AddDisposableValue` / `DisposeDisposableStack` など）を呼び出すことで実現されています。`finally` での dispose も、同期的な `using` だけのスコープであれば C++ のランタイム関数を一回呼び出すだけで、ループや `SuppressedError` の構築はすべて C++ 側で行われます。三つのエンジンの中では最もランタイム側に処理を寄せた実装で、バイトコード側の仕事が一番少ないです。

### SpiderMonkey

SpiderMonkeyではレキシカル環境オブジェクトの予約スロットに `ArrayObject` をぶら下げてそれをリストとして使い、`using` 宣言ごとにそこへ push していきます。

JSCやV8と違い、SpiderMonkeyは `using` のために新しいバイトコード命令を三つ追加しています。リソースを環境のリストに登録する `AddDisposable`、`finally` の入口で環境からリストを取り出す `TakeDisposeCapability`、そして `SuppressedError` を構築する `CreateSuppressedError` です。仕様の abstract operation をほぼそのまま命令にしたような粒度です。

`finally` での dispose は、取り出した `ArrayObject` を逆順に回す while ループをバイトコードとして生成し、その中でメソッド呼び出しや `SuppressedError` の構築まで行います。dispose 処理をバイトコードで完結させる点はJSCと同じですが、ループを展開せずランタイムのリストを回す点ではV8寄りです。

[^1]: JSCのアーキテクチャについて詳しく知りたい場合は Filip Pizlo による [Speculation in JavaScriptCore](https://webkit.org/blog/10308/speculation-in-javascriptcore/) がおすすめです。
