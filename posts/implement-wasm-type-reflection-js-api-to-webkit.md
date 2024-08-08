---
layout: article-layout.11ty.js
date: 2024-08-09
title: "WebKitにWebAssembly Type Reflection JS API（の一部）を実装してみた"
tags: post
---

WebAssembly Type Reflection JavaScript APIの一部をWebKitに実装したので紹介します。

## WebAssembly Type Reflection JavaScript API とは

WebAssembly Type Reflection JavaScript APIは、Memory・Table・Global・関数の型に関する情報をJavaScriptから取得するAPIを追加する提案です。https://github.com/WebAssembly/js-types で管理されています。

たとえば、MemoryやTableであればサイズの制限、Globalであれば値の型とミュータビリティ、FunctionであればそのシグネチャをJavaScriptから取得できます。

この提案は、既存のAPIに対して３つの変更を加えます。

### 1. Memory、Global、Tableに対するtypeメソッドの追加

以下の３つの関数が追加されます:

- `WebAssembly.Memory.prototype.type`
- `WebAssembly.Table.prototype.type`
- `WebAssembly.Global.prototype.type`

これらのメソッドを呼び出すことでそれぞれの型の情報を取得できます。以下に具体的な使い方を示します:

```js
const memory = new WebAssembly.Memory({ initial: 10, maximum: 100 });
console.log(memory.type()); // {"maximum":100,"minimum":10,"shared":false}

const table = new WebAssembly.Table({ initial: 10, element: "anyfunc" });
console.log(table.type()); // {"minimum":10,"element":"funcref"}

const global = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
console.log(global.type()); // {"mutable":true,"value":"i32"}
```

### 2. Module.importsとModule.exportsの返り値の要素のtypeプロパティの追加

以下の２つの既存の関数の返り値が変更されます:

- `WebAssembly.Module.imports`
- `WebAssembly.Module.exports`

この２つの関数は、WebAssemblyのモジュールのインスタンスを引数にとって、そのモジュールがimportあるいはexportしているそれぞれの値に関する情報を配列として返します。

以下に具体的な例を示します:

```js
// このwatに対応するバイナリ:
//   (module
//     (import "mod" "fn1" (func $log1 (param i64) (param i32) (result i32)))
//   )
const buffer = new Uint8Array([0,97,115,109,1,0,0,0,1,7,1,96,2,126,127,1,127,2,11,1,3,109,111,100,3,102,110,49,0,0]);

const module = new WebAssembly.Module(buffer);
const imported = WebAssembly.Module.imports(module);
console.log(imported[0]);
// {
//   "module":"mod",
//   "name":"fn1",
//   "kind":"function",
//   "type":{"parameters":["i64","i32"],"results":["i32"]}
// }
```

この提案以前は、モジュールの名前を表す `module`、インポートする値の名前を表す `name`、インポートする値の種類を表す `kind` という３つのプロパティがありました。この提案は、さらに型の情報を表す `type` というプロパティを追加します。

`type` プロパティの値は、この例で示したようにインポートした値が関数であればこの例のようにそのシグネチャになります。インポートした値がMemoryやTable、Globalであればそれぞれ`WebAssembly.Memory.prototype.type`、`WebAssembly.Table.prototype.type`、`WebAssembly.Global.prototype.type`の返り値の型の値になります。

### 3. MemoryとTableのコンストラクタの引数の変更

`WebAssembly.Memory` と `WebAssembly.Table` のコンストラクタが受け取るオブジェクトのプロパティの名前として、`initial` の代わりに `minimum` が使えるようになります。

## WebKitでの実装

このType Reflection JavaScript APIは４年ほど前から存在していて、ChromiumとFirefoxには実装されています。WebKitには 1 は実装されていましたが、2 と 3 は実装されていませんでした。

RubyのWasm周りやSwiftWasmのメンテナーである[@kateinoigakukun](https://x.com/kateinoigakukun)と話していたときに「Type Reflection JS APIの一部がWebKitにだけなくて困って、polyfil書いたんだよね～～」という話を聞きました[^1]。

筆者はここ半年くらいWebKitに継続的に貢献していますが、WebAssemblyに関連する部分は全く触ったことがなかったし、そもそもWebAssemblyのことを全く知りませんでした。いずれWebAssemblyもやりたいと思ってはいたのですが、きっかけを上手く見つけられずにいたところだったので、この機会に実装してみることにしました。

WebKitに実装されていないType Reflection JavaScript APIの変更のうち3の「MemoryとTableのコンストラクタの引数の変更」の方は、些細なので別途やろうということで、今回は２の「Module.importsとModule.exportsの返り値の要素のtypeプロパティの追加」の方に取り組みました。

### コードリーディングと実装

ここからはWebKitのコードリーディングと具体的な実装の手順の説明になります。

`WebAssembly.Module.imports`と`WebAssembly.Module.exports`の返り値の要素に追加するべきである`type`プロパティが持っている情報は、明らかにモジュールをコンパイルするときにすでにわかっている情報です。なので、引数として渡されるWebAssemblyモジュールインスタンスから取得できると考えました。

`imports`と`exports`で考えることはほとんど変わらないので、とりあえず`imports`について説明します。

WebKitで、`WebAssembly.Module.imports`関数の実装に対応するコードは [Source/JavaScriptCore/wasm/js/WebAssemblyModuleConstructor.cpp#L202-L234](https://github.com/WebKit/WebKit/blob/6880a8bf71b04bf75da5ecb783a1dcea6dd08e20/Source/JavaScriptCore/wasm/js/WebAssemblyModuleConstructor.cpp#L202-L234) です。ここでは引数として渡されたモジュールインスタンスを [`JSWebAssemblyModule`](https://github.com/WebKit/WebKit/blob/main/Source/JavaScriptCore/wasm/js/JSWebAssemblyModule.h) 型の変数 `module` として扱っています。なので、ここではこの `module` 変数から上手くデータをひっぱってきて返り値の `type` プロパティにつっこんでやれば良いわけです。さらに、周辺のコードからモジュールに関するデータは `module->moduleInformation()` で取得できることがわかります。

ではどうやって `module->moduleInformation()` からひっぱってくるべきデータを探すのかということになります。WebAssemblyモジュールのバイナリフォーマットのインポートセクションを解析する部分があり、そこでモジュールのデータをセットしているはずだと考えました。

実際、[Source/JavaScriptCore/wasm/WasmSectionParser.cpp#L147-L231](https://github.com/WebKit/WebKit/blob/e66ab86f1ac5269a25adc388f7efee404a2b07f3/Source/JavaScriptCore/wasm/WasmSectionParser.cpp#L147-L231)でモジュールのインポートセクションを解析して、`kind` に応じて `m_info` というフィールドに色々とセットしていることがわかりました。`module->moduleInformation()` は基本的に `WasmSectionParser.cpp` で作られた `m_info` を返すだけなので、そこでセットされた情報を `WebAssembly.Module.imports` の方から読み出せば良いということになります。

ということで、`module->moduleInformation()` からほしいデータを取得してオブジェクトを作成する `createTypeReflectionObject` 関数を書いて、`type` プロパティにセットするようにしたら、意図した通りに動作しました。コードは [Source/JavaScriptCore/wasm/js/WebAssemblyModuleConstructor.cpp#L104-L200](https://github.com/WebKit/WebKit/blob/6880a8bf71b04bf75da5ecb783a1dcea6dd08e20/Source/JavaScriptCore/wasm/js/WebAssemblyModuleConstructor.cpp#L104-L200) にあります。

ちなみに `createTypeReflectionObject` 関数は `WebAssembly.Module.imports` と `WebAssembly.Module.exports` の両方のために使うことを想定して作っています。WebKit でインポートのエントリを表す型は `Wasm::Import` で、エクスポートのエントリを表す型で `Wasm::Export` で、それらは異なる型です。WebKitではC++20を使うことができるので[コンセプト](https://cpprefjp.github.io/lang/cpp20/concepts.html)使うことができます。

それを使って、`Wasm::Import`と`Wasm::Export`のどちらかのみを受け付けるようにしてみました。コンセプトって初めて使いましたがTypeScriptみたいで面白いですね。

```cpp
template<typename T>
concept IsImportOrExport = std::same_as<T, Wasm::Import> || std::same_as<T, Wasm::Export>;

template <IsImportOrExport T>
static JSObject* createTypeReflectionObject(JSGlobalObject* globalObject, JSWebAssemblyModule* module, const T& impOrExp)
{
    // ...
}
```

Pull Request は https://github.com/WebKit/WebKit/pull/31702 です。

## Function Referenceとの関係

ここに書いたところまでは割とサクッとできたのですが、このあと難しい箇所がありました。

Type Reflectionの提案ではなく、[Function Reference](https://github.com/WebAssembly/function-references)という別の提案の方に、Type Reflectionとの相互運用についての言及があります[^2]。WebKitはすでにFunction Referenceをフラグ付きでサポートしているので、Type Reflectionを実装するなら、そこを気にする必要がありました。

そのための実装自体は簡単だったものの、この提案のことは理解できていないので、もうちょっとちゃんと勉強する必要がありそうです。

また、このFunction Referenceで追加された機能を使ったwatを、[wabt](https://github.com/WebAssembly/wabt)を使ってwasmにしようとしたら構文エラーが起きてしまいました。どうやらまだFunction Referenceをちゃんとサポートできていないようだったので途中から[wasm-tools](https://github.com/bytecodealliance/wasm-tools)に切り替えました。

## おわりに

WebAssemblyの世界に入門できた気がするのでやってみて良かったと思います。今回はJavaScript APIの実装でしたが、WebAssemblyのランタイム自体も触っていけるようになると良いですね。

[^1]: https://zenn.dev/katei/articles/wasm-js-types-polyfill
[^2]: https://github.com/WebAssembly/function-references/blob/main/proposals/function-references/Overview.md#type-reflection
