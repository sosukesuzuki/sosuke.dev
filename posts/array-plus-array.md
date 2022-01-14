---
layout: article-layout.11ty.js
date: 2022-01-13
title: "なぜ JavaScript の [1, 2, 3] + [4, 5, 6] は \"1,2,34,5,6\" なのか"
description: "なぜ JavaScript の [1, 2, 3] + [4, 5, 6] は \"1,2,34,5,6\" なのか"
tags: post
---

先日次のツイートを見かけた。

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I have been writing Javascript since roughly 1997 but it still manages to occasionally do something that absolutely shocks me <a href="https://t.co/JyYOo4wGOu">pic.twitter.com/JyYOo4wGOu</a></p>&mdash; mcc (@mcclure111) <a href="https://twitter.com/mcclure111/status/1481027678362902528?ref_src=twsrc%5Etfw">January 11, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

JavaScript では `[1, 2, 3] + [4, 5, 6]` の結果が `"1,2,34,5,6"` であり、この挙動が直感に反しているというツイートである。

実際のところ筆者も直感に反していると思う。しかしこの挙動は至って ECMAScript の仕様通りである。

この記事では、なぜこの挙動が ECMAScript の仕様に従っていると言えるのか仕様を引用して説明する。

## 大雑把な答え

まず大雑把な答えを示しておこう。

JavaScript で `[1, 2, 3] + [4, 5, 6]` が `"1,2,34,5,6"` になるのは、オペランドの配列の `Array.prototype.toString` が呼び出され、それらが文字列として結合されるからだ。

しかしこれではつまらないのでちゃんと仕様をたどっていく。

## + 演算子

まずは `+` 演算子の挙動がどのように定められているか見ていこう。

`+` 演算子は The Addition Operator として https://tc39.es/ecma262/#sec-addition-operator-plus に定義されている。

構文については多くの人の想像する通りだと思うし今回の本題ではないので無視するとして、セマンティクスを見てみよう。ここでは次のようにセマンティクスが定義されている。

```text
1. Return ? EvaluateStringOrNumericBinaryExpression(AdditiveExpression, +, MultiplicativeExpression).
```

`AdditiveExpression` と `MultiplicativeExpression` とはここではそれぞれ左辺と右辺のことである。

つまり `+` 演算子は `EvaluateStringOrNumericBinaryExpression` という Abstract Operation に左辺と`+`、そして右辺を渡した結果を返す。

## EvaluateStringOrNumericBinaryExpression

`EvaluateStringOrNumericBinaryExpression` は https://tc39.es/ecma262/#sec-evaluatestringornumericbinaryexpression に定義されている。

この Abstract Operation は `leftOperand`、`opText`、`rightOperand` という次の３つの引数を取る。

そしてその３つの引数を次のステップに従って実行する。

```text
1. Let lref be the result of evaluating leftOperand.
2. Let lval be ? GetValue(lref).
3. Let rref be the result of evaluating rightOperand.
4. Let rval be ? GetValue(rref).
5. Return ? ApplyStringOrNumericBinaryOperator(lval, opText, rval).
```

これらのステップを大雑把に説明する。まず `leftOperand` を評価した結果を `lref` とする。そして `GetValue(lref)` の結果を `lval` とする(`GetValue` は https://tc39.es/ecma262/#sec-getvalue で定義されている。今回考えている場合のように `[1, 2, 3]` のような単純な配列を渡す場合はそのままの配列が返ってくると考えてよい。)。次に`leftOperand` に対しての処理と同じことを `rightOperand` に対しても行う。

そうして `lval` と `rval` が得られる。

最後に `ApplyStringOrNumericBinaryOperator` という Abstract Operation に対して `lval` と、引数として受け取っていた `opText`、そして `rval` を渡し、その結果を返す。

つまり `EvaluateStringOrNumericBinaryExpression` はオペランドと演算子の種類を引数として受け取り、オペランドを評価し `GetValue` した上で、そのまま `ApplyStringOrNumericBinaryOperator` に渡すだけの Abstract Operation である。

## ApplyStringOrNumericBinaryOperator

`ApplyStringOrNumericBinaryOperator` は https://tc39.es/ecma262/#sec-applystringornumericbinaryoperator に定義されている。

`ApplyStringOrNumbericBinaryOperator` は `lval`、`opText`、`rval` という３つの引数を受け取る。

`ApplyStringOrNumbericBinaryOperator` のステップをすべて掲載すると長いの関連するステップのみ説明していく。

まずは最初のステップでは引数で受け取った `opText` のバリデーションを行う。

```text
1. Assert: opText is present in the table in step 7.
```

step 7 に掲載されている表によると `opText` は次のいずれかである必要がある。

- `**`
- `*`
- `/`
- `%`
- `+`
- `-`
- `<<`
- `>>`
- `>>>`
- `&`
- `^`
- `|`

もちろんこの記事の対象である `+` もここに含まれており妥当な `opText` である。

次のステップは `opText` が `+` であるときのみ実行される。

```text
2. If opText is +, then
    a. Let lprim be ? ToPrimitive(lval).
    b. Let rprim be ? ToPrimitive(rval).
    c. If Type(lprim) is String or Type(rprim) is String, then
        i. Let lstr be ? ToString(lprim).
        ii. Let rstr be ? ToString(rprim).
        iii. Return the string-concatenation of lstr and rstr.
    d. Set lval to lprim.
    e. Set rval to rprim.
```

`a` と `b` で `lval` と `rval` をそれぞれ `ToPrimitive` に渡してその結果を `lprim`、`rprim` とする。

`c` では、`lprim` と `rprim` の少なくともどちらかの型が `String` であればもう片方も `String` に変換し、それぞれ `lstr`、`rstr` とする。**そして `lstr` と `rstr` を文字列として結合した結果を `ApplyStringOrNumericBinaryOperator` 全体の結果とする**。この場合には後続の `d` と `e` は実行されない。

結論からいえば `[1, 2, 3] + [3, 4, 5]` では、このステップ `c` が実行されることで文字列の結合が行われ `"1,2,34,5,6"` が出来上がるというわけだ。

`c` が実行されるのは、 `lprim` と `rprim` の少なくともどちらかの型が `String` であるときだけだ。そして `lprim` と `rprim` は `ToPrimitive` によって返された値である。すなわち、配列に対する `ToPrimitive` の結果が `String` であるために、冒頭で紹介した直感的でない挙動が引き起こされているのだ。

## ToPrimitive

`ToPrimitive` は https://tc39.es/ecma262/#sec-toprimitive に定義されている。

`ToPrimitive` は `input` という１つの必須の引数と `preferedType` という１つのオプショナルの引数を受け取る。

`ToPrimitive` は `input` が Object 型だったときにそれを非 Object 型(つまりプリミティブ型)に変換する Abstract Operation である。

`ToPrimitive` は次のステップに従って実行される。

```text
1. If Type(input) is Object, then
    a. Let exoticToPrim be ? GetMethod(input, @@toPrimitive).
    b. If exoticToPrim is not undefined, then
        i. If preferredType is not present, let hint be "default".
        ii. Else if preferredType is string, let hint be "string".
        iii. Else,
            1. Assert: preferredType is number.
            2. Let hint be "number".
        iv. Let result be ? Call(exoticToPrim, input, « hint »).
        v. If Type(result) is not Object, return result.
        vi. Throw a TypeError exception.
    c. If preferredType is not present, let preferredType be number.
    d. Return ? OrdinaryToPrimitive(input, preferredType).
2. Return input.
```

`1` は `input` が Object 型のときのみ実行される(`input` が最初から非 Object 型のときは `2` に進みそのまま `input` を返す)。

次に `1` の各ステップ `a`、`b`、`c` について説明する。

ステップ `a` では `GetMethod` を使って `input` の`@@ToPrimitive` を取得し `exoticToPrim` とする(`GetMethod` は https://tc39.es/ecma262/#sec-getmethod に定義されている。名前の通りオブジェクトからメソッドを取得するための Abstract Operation である。)。

`@@ToPrimitive` は Well-known Symbols の１つで、Object 型の値がプリミティブに変換されるときの挙動を制御できる。[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive) にドキュメントがあるので詳しくはそちらを参照してほしい。

配列にはデフォルトの `@@ToPrimitive` は存在しないので今回の場合は `exoticToPrim` は `undefined` になる。

そしてステップ `b` は `If exoticToPrim is not undefined, then` という条件付きで実行されるので、`exoticToPrim` が `undefined` である今回は `b` は実行されない。

次にステップ `c` では `preferedType` が存在しないときに `preferedType` を `number` とする。今回 `ToPrimitive` は `ApplyStringOrNumbericBinaryOperator` から呼び出されているが、`preferedType` は指定されていないためこの `c` により `preferedType` は `number` になる。

最後のステップ `d` では `input` と `preferedType` を `OrdinaryToPrimitive` という別の Abstract Operation に渡し、その結果を返す。

つまり `ToPrimitive` は `input` に `@@ToPrimitive` が存在すればそれに基づいて `input` を非 Object 型に変換するが、`@@ToPrimitive` が存在しない場合は `OrdinaryToPrimitive` を呼び出し、その結果を返す Abstract Operation である。

## OrdinaryToPrimitive

`OrdinaryToPrimitive` は https://tc39.es/ecma262/#sec-ordinarytoprimitive に定義されている。

`OrdinaryToPrimitive` は `O` と `hint` という２つの引数を受け取る。`O` は Object であり、`hint` は `string` もしくは `number` である。`ToPrimitive` から渡された `input` が `O` で、`preferedType` が `hint` だ。

`OrdinaryToPrimitive` は次のステップに従って実行される。

```text
1. If hint is string, then
    a. Let methodNames be « "toString", "valueOf" ».
2. Else,
    a. Let methodNames be « "valueOf", "toString" ».
3. For each element name of methodNames, do
    a. Let method be ? Get(O, name).
    b. If IsCallable(method) is true, then
        i. Let result be ? Call(method, O).
        ii. If Type(result) is not Object, return result.
4. Throw a TypeError exception.
```

まずステップ `1` と `2` によって `methodNames` が決定する。`hint` が `string` のときは `methodNames` は `"toString", "valueOf"` になり `number` のときは `"valueOf", "toString"` になる。今回は `ToPrimitive` の `1` の `c` によって `preferedType` が `number` になっているので、`methodNames` は `"valueOf", "toString"` である。

ステップ `3` では `methodNames` の各要素(今回の場合 `"valueOf"` と `"toString"`)に対して順にステップ `a` と `b` を実行する。各ループごとに `methodNames` の要素は `name` という名前に格納される。

まず `a` では `Get` を使って `O` から `name` に対応するメソッドを取得し `method` とする(`Get` は https://tc39.es/ecma262/#sec-get-o-p に定義されている)。

次に `b` では `IsCallable` を使い `method` が呼び出し可能かどうかを調べる(`IsCallable` は https://tc39.es/ecma262/#sec-iscallable に定義されている)。もし呼び出し可能であれば `method` を呼び出しその結果を `result` とする。そしてその結果が非 Object 型であれば `result` を返す。

そしてステップ `1`、`2`、`3`を実行しての何も返すことができなかった場合、ステップ `4` で `TypeError` をスローする。

`OrdinaryToPrimitive` を JavaScript で簡単に表現すると次のようになる。当然厳密ではないので疑似コードだと考えてほしい。

<!-- prettier-ignore -->
```js
function OrdinaryToPrimitive(O, hint) {
    const methodNames =
        // 1.
        hint === "string" ? ["toString", "valueOf"]
        // 2.
        : ["valueOf", "toString"];
    // 3.
    for (const name of methodNames) {
        // a.
        const method = Get(O, name);
        // b.
        if (IsCallable(method)) {
            // i.
            const result = method(O);
            // ii.
            if (typeof result !== "object") {
                return result;
            }
        }
    }
    // 4.
    throw TypeError();
}
```

今回の場合は `methodNames` は `"valueOf", "toString"` なので、その順番でループが実行される。

1回目のループでは `Get` を使って `O`(今回は配列)から `valueOf` を取得し `method` とする。`method` には配列の `valueOf` が格納され、`IsCallable(method)` をパスする。しかし配列の `valueOf` はその配列を返す。つまり配列の `valueOf` は Object 型の値を返すのだ。そのため `ii` の `If Type(result) is not Object` という条件はパスできない。したがって値を何も返さず次のループへ進む。

2回目のループでは、`Get` を使って `O` から `toString` を取得し `method` とする。配列には `toString` が定義されているので、`method` はその配列の `toString` になる。今回のループでは `method` に 配列の `toString` が格納されているので `IsCallable(method)` は `true` になる。次に `i` でその `method` を呼び出した結果を `result` とする。配列のデフォルトの `toString` は `String` を返す。`String` は非 Object 型なので `If Type(result) is not Object` という条件をパスし `result` が `OrdinaryToPrimitive` の返り値となる。

## つまりなんだっけ？

`ApplyStringOrNumericBinaryOperator` を思い出してほしい。

`ApplyStringOrNumericBinaryOperator` では `ToPrimitive` によって左辺と右辺をプリミティブ化した値(`lprim` と `rprim`)が `String` であれば、それを結合して返すのだった。

配列に対する `ToPrimitive` は結局のところ配列の `toString` を呼び出したものを返す。配列の `toString` の挙動は簡単に確認できる。(仕様では https://tc39.es/ecma262/#sec-array.prototype.tostring で定義されている)

```js
const arrStr = [1, 2, 3].toString();
console.log(arrStr); // "1,2,3"
```

つまり、単純にそれを結合したものが `ApplyStringOrNumericBinaryOperator` の返り値になり、それはそのまま `+` 演算子の返り値になるのだ。

**`[1, 2, 3] + [4, 5, 6]` の場合は、`ToPrimitive([1, 2, 3])` が `"1,2,3"` であり `ToPrimitive([4, 5, 6])` が `"4,5,6"` なので `ApplyStringOrNumericBinaryOperator` によってその２つが文字列として結合され `+` 演算子全体の結果が `"1,2,34,5,6"` になったということである。**

## ここからハック

さて、この仕様がわかればいくつかのハックが思いつくだろう。

まずは `ToPrimitive` によって `OrdinaryToPrimitive` よりも先に実行される `@@ToPrimitive` を上書きすればその挙動を変更できる。

```js
const arr = [1, 2, 3];
arr[Symbol.toPrimitive] = () => "hello!!";
console.log(arr + [4, 5, 6]); // "hello!!4,5,6"
```

また、配列の場合 `toString` よりも `valueOf` の方が優先される。なので `valueOf` が非 Object 型を返すように上書きしてもその挙動を変更できる。

```js
const arr = [1, 2, 3];
arr.valueOf = () => "hello!!";
console.log(arr + [4, 5, 6]); // "hello!!4,5,6"
```

もしくは `toString` 自体を上書きしてもその挙動を変更できる。

```js
const arr = [1, 2, 3];
arr.toString = () => "hello!!";
console.log(arr + [4, 5, 6]); // "hello!!4,5,6"
```

## まとめ

The Addition Operator の仕様には次のような記述がある。

> Note: The addition operator either performs string concatenation or numeric addition.

つまり `+` 演算子というのは数値の加算もしくは文字列の結合を行う演算子なのだ。したがって直感的でない挙動を避けるためにはそれ以外の用途では使わない方がよいだろう。

当然だが TypeScript では  `[1, 2, 3] + [4, 5, 6]` のような式はコンパイルエラーになる。TypeScript を使おう。
