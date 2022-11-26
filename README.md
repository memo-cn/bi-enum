# BiEnum <a href="https://github.com/memo-cn/bi-enum/blob/main/README.md"><img src="https://img.shields.io/npm/v/bi-enum.svg" /></a> <a href="https://github.com/memo-cn/bi-enum/blob/main/README.md"><img src="https://packagephobia.now.sh/badge?p=bi-enum" /></a>

[简体中文](README.md) | [English](README.en-US.md)

## 1. 简介

BiEnum 是一种 Web 前端静态枚举方案，是 TypeScript 原生枚举（enum）的加强版。

BiEnum 加强了枚举标签和枚举值的编译时类型检查，也使代码编辑器有更精确的智能感知（IntelliSense）。

BiEnum 支持将任何值作为枚举标签或枚举值，使设计与实现异构枚举（Heterogeneous Enum）甚至是嵌套枚举成为易事。

<table>
  <tr>
    <th>
      定义
    </th>
    <th>
      运行时对象
    </th>
  </tr>
  <tr>
    <td>
      <img src="https://github.com/memo-cn/bi-enum/blob/main/resources/figure.1.my-first-bi-enum-code.png?raw=true">
    </td>
    <td>
      <img src="https://github.com/memo-cn/bi-enum/blob/main/resources/figure.2.my-first-bi-enum-console.png?raw=true">
    </td>
  </tr>
</table>

## 2. 原生枚举

### 2.1 类型过宽

枚举标签和枚举值为不同 JavaScript 基础类型（例如 string、number）的
[TypeScript 枚举](https://www.tslang.cn/docs/handbook/enums.html) 在运行时是枚举标签和枚举值双向映射的 JavaScript 对象。

```typescript
enum Direction {
    Up = 1,
    Down = 2,
}

Direction.Up // 1
Direction[2] // 'Down'
```

原生的 enum 类型检查不严格，编译器只粗略地判定 `Direction` 的枚举标签和枚举值是 string 和 number。

下面的示例中，3、4 都不是业务上的合法枚举值，但能编译通过，给运行时阶段埋下隐患。

```typescript
let direction: Direction; // Actually, number
direction = 1; // ok
direction = true; // As expected: error, TS2322: Type 'true' is not assignable to type 'Direction'.
direction = 3; // Not as expected: compilation passed.

Direction[4]; // Not as expected: compilation passed.
```

TypeScript 支持把值作为类型使用，你可能会临时这么写：

```typescript
type DirectionValue = 1 | 2;
let direction2: DirectionValue = 3; // As expected: error, TS2322: Type '3' is not assignable to type 'DirectionValue'.
```

但这要求你每一次修改 `Direction` 的定义，也需要连带修改 `DirectionValue` 的定义。大脑需要一直记着这件事，或者写在注释里提醒下一个开发者千万别忘了。其中的风险不言而喻。

### 2.2 值域受限

不可能所有业务场景下的枚举都是字符串和数值之间的简单映射。能在编译阶段就确定的静态属性，在业务上就可以是枚举，在技术上也应该被实现。

下面的示例代码编译会不通过：
```typescript
enum BlueLikeColor {
    skyBlue = '#B2FFFF',
    royalBlue = '#002366',
}

enum Color {
    red = 0xff0000,
    green = 'rgb(0, 255, 0)',
    blueLike = [BlueLikeColor.skyBlue, BlueLikeColor.royalBlue], // error, Array is not allowed.
    unset = null, // error, TS2553: Computed values are not permitted in an enum with string valued members.
}

enum ColorDescription {
    [Color.red] = 'description about red', // error, TS1164: Computed property names are not allowed in enums.
    [Color.green] = 'description about red', // error, TS1164: Computed property names are not allowed in enums.
    [BlueLikeColor.skyBlue] = 1234, // error, TS1164: Computed property names are not allowed in enums.
}
```

注意到编译器的提示信息了吗？"<b>Computed values</b> are not permitted"。

我们刚刚说过 TypeScript 支持把值作为类型使用。理论上，所有字面量、所有在编译阶段就能确定的属性都应该和可以作为枚举值。

如果你对 TypeScript 有一定的了解，并且听信了我上面巧言令色的分析，可能会产生一些想法。

来不及了，你肯定不会不着急往下看 BiEnum 的设计，而打开编辑器自己先动手写写看。

## 3. BiEnum

### 3.1 快速上手

安装 `bi-enum` 包：

```bash
npm i bi-enum
```

这次我们用 `toBiEnum` 创建出双向枚举对象：

```typescript
import { toBiEnum } from "bi-enum";

// Create a BiEnum instance
const Direction = toBiEnum({
    Up: 1,
    Down: 2,
} as const); // Don't omit 'as const'
```

写在冒号左边的作为枚举标签，写在冒号右边作为枚举值。`as const` 确保 1 和 2 的类型不会被收窄到 number 。

### 3.2 类型精准

BiEnum 自身是一个枚举标签和枚举值双向映射的对象实例，其原型对象上提供了 `allLabels` 和 `allValues` 两个数组，它们的值也直接作为类型。

```typescript
// Value and type are both ['Up ',' Down ']
Direction.allLabels;

// Value and type are both [1, 2]
Direction.allValues;

// Equivalent to: type Direction = 1 | 2
type Direction = typeof Direction.allValues[number];
```

因此现在在编译阶段会进行严格的类型检查了：

```typescript
let direction: Direction;
direction = 1; // ok
direction = true; // As expected: error, TS2322: Type 'true' is not assignable to type '2 | 1'.
direction = 3; // As expected: TS2322: Type '3' is not assignable to type '2 | 1'.

Direction[4]; // As expected: error, TS7053: ... Property '4' does not exist on type ... .
```

再强调一次, BiEnum 构造参数对象上的所有字面量会直接作为类型。

BiEnum 原型对象上还提供了 `isLabel` 和 `isValue` 两个方法来判断入参是否为合法的枚举标签或枚举值。

```typescript
let test: number = 1;
direction = test; // TS2322: Type 'number' is not assignable to type '2 | 1'.

if (Direction.isValue(test)) {
    direction = test; // ok, compilation passed.
}
```

### 3.3 取值自由

现在把之前的 Color 案例从 enum 迁移到 BiEnum：
- ① 将枚举标签和枚举值之间的等号换成冒号；
- ② 将 `enum` 换成对 `toBiEnum` 的调用；
- ③ 在构造参数对象结尾加上 `as const`；
- ④ 一般来说，还需要为枚举值值域（`allValues`）定义一个与枚举映射对象同名的类型（以符合开发者对原生 `enum` 的使用习惯）。

```typescript
enum BlueLikeColor {
    skyBlue = '#B2FFFF',
    royalBlue = '#002366',
}

const Color = toBiEnum({
    red: 0xff0000,
    green: 'rgb(0, 255, 0)',
    blueLike: [BlueLikeColor.skyBlue, BlueLikeColor.royalBlue],
    unset: null,
} as const);
type Color = typeof Color.allValues[number];

const ColorDescription = toBiEnum({
    [Color.red]: 'description about red',
    [Color.green]: 'description about green',
    [BlueLikeColor.skyBlue]: 1234,
} as const);
type ColorDescription = typeof ColorDescription.allValues[number];

// Value and type are both 'description about red'.
ColorDescription[Color.red];

// Value and type are both 1234.
ColorDescription[BlueLikeColor.skyBlue];
```
类型系统把所有的字面量也视为了类型，编译器现在不报错了。

<table>
  <tr>
    <th>
      native enum
    </th>
    <th>
      bi-enum
    </th>
  </tr>
  <tr>
    <td>
      <img src="https://github.com/memo-cn/bi-enum/blob/main/resources/figure.3.color-native-enum.png?raw=true">
    </td>
    <td>
      <img src="https://github.com/memo-cn/bi-enum/blob/main/resources/figure.4.color-bi-enum.png?raw=true">
    </td>
  </tr>
</table>

## 4. 其它说明
### 4.1 枚举元素类型限制
BiEnum 要求枚举标签为经典基础类型（string | number | boolean | null | undefined）。

对枚举值没有要求，不过如果你把值设为了非经典基础类型，BiEnum 只会保留从枚举标签到枚举值的单向映射。

无论是运行时的 BiEnum 对象，还是你在编辑器的提示列表里，都没有保留和不会看到类似 `[object Object]` 到枚举标签的反向映射。

### 4.2 枚举元素命中关键词
如果业务上的枚举标签或枚举值和 `allLabels`, `allValues`, `isLabel`, `isValue` 重名了，不影响创建出双向映射对象，从原型上获取对它们的引用即可。

```typescript
const HitKeyword = toBiEnum({
    allLabels: 1,
    2: 'isLabel',
});
type HitKeywordLabel = typeof HitKeyword.allLabels[number]; 
type HitKeywordValue = typeof HitKeyword.allValues[number];

if (Reflect.getPrototypeOf(HitKeyword).isLabel(2)) {/* ... */}

for (const label of Reflect.getPrototypeOf(HitKeyword).allLabels) {/* ... */}
```
