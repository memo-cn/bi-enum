# BiEnum <a href="https://github.com/memo-cn/bi-enum/blob/main/README.en-US.md"><img src="https://img.shields.io/npm/v/bi-enum.svg" /></a> <a href="https://github.com/memo-cn/bi-enum/blob/main/README.en-US.md"><img src="https://packagephobia.now.sh/badge?p=bi-enum" /></a>

[简体中文](README.md) | [English](README.en-US.md)

## 1. Introduction

BiEnum is a web front-end static enumeration scheme, which is an enhanced version of TypeScript's native enum.

BiEnum strengthens the compile-time type checking of enumeration labels and values, and makes the code editor more accurate in IntelliSense.

BiEnum supports any value as an enumeration label or value, making it easy to design and implement heterogeneous enumerations or even nested enumerations.

<table>
  <tr>
    <th>
      definition
    </th>
    <th>
      runtime object
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

## 2. Native enumeration

### 2.1 Loose type
[TypeScript enum](https://www.typescriptlang.org/docs/handbook/enums.html) with enumeration labels and values of different JavaScript primitive types (such as string, number) are JavaScript that are bidirectional mapped between enumeration labels and values at runtime.

```typescript
enum Direction {
    Up = 1,
    Down = 2,
}

Direction.Up // 1
Direction[2] // 'Down'
```

The native enum type check is not strict, the compiler only roughly determines that the enumeration label and value of `Direction` are string and number.

In the following case, neither 3 nor 4 is a legal enumeration value in business, but it can be compiled and passed, burying hidden dangers for the runtime stage.

```typescript
let direction: Direction; // Actually, number
direction = 1; // ok
direction = true; // As expected: error, TS2322: Type 'true' is not assignable to type 'Direction'.
direction = 3; // Not as expected: compilation passed.

Direction[4]; // Not as expected: compilation passed.
```

TypeScript supports using values as types, so you might temporarily write as follows:

```typescript
type DirectionValue = 1 | 2;
let direction2: DirectionValue = 3; // As expected: error, TS2322: Type '3' is not assignable to type 'DirectionValue'.
```

But this requires that every time you modify the definition of `Direction`, you also need to modify the definition of `DirectionValue`. Your brain needs to keep this in mind, or write it in a comment to remind the next developer not to forget. The risks involved are self-evident.


### 2.2 Restricted value range

It is impossible that enumerations in all business scenarios are simple mappings between strings and values. Static attributes that can be determined at the compilation stage can be enumerations in business and should also be implemented technically.

The following sample code will fail to compile:
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

Did you notice the compiler prompts? "<b>Computed values</b> are not permitted"。

We just said that TypeScript supports values as types. In theory, all literals and all attributes that can be determined at the compilation stage should and can be used as enumeration values.

If you have a certain understanding of TypeScript and listen to my analysis above, you may have some ideas.

It's too late, you will definitely not be anxious to look down at the design of BiEnum, but open the editor and write it yourself first.

## 3. BiEnum

### 3.1 Get started quickly

Install the `bi-enum` package:

```bash
npm i bi-enum
```

This time we use `toBiEnum` to create a bidirectional enumeration object:

```typescript
import { toBiEnum } from "bi-enum";

// Create a BiEnum instance
const Direction = toBiEnum({
    Up: 1,
    Down: 2,
} as const); // Don't omit 'as const'
```

Write on the left side of the colon as the enumeration label, and write on the right side of the colon as the enumeration value. `as const` ensures that the types of 1 and 2 are not narrowed to number.

### 3.2 Precise type

Its prototype object provides two arrays, `allLabels` and `allValues`, whose values are also directly used as types.

```typescript
// Value and type are both ['Up ',' Down ']
Direction.allLabels;

// Value and type are both [1, 2]
Direction.allValues;

// Equivalent to: type Direction = 1 | 2
type Direction = typeof Direction.allValues[number];
```

So now strict type checking will be performed at compile time:

```typescript
let direction: Direction;
direction = 1; // ok
direction = true; // As expected: error, TS2322: Type 'true' is not assignable to type '2 | 1'.
direction = 3; // As expected: TS2322: Type '3' is not assignable to type '2 | 1'.

Direction[4]; // As expected: error, TS7053: ... Property '4' does not exist on type ... .
```

Again, all literals on the BiEnum construction parameter object will be directly used as types.

The BiEnum prototype object also provides two methods, `isLabel` and `isValue`, to determine whether the input parameter is a legal enumeration label or value.

```typescript
let test: number = 1;
direction = test; // TS2322: Type 'number' is not assignable to type '2 | 1'.

if (Direction.isValue(test)) {
    direction = test; // ok, compilation passed.
}
```

### 3.3 Free value 

Now migrate the previous Color case from enum to BiEnum:
- ① Replace the equal sign between the enumeration label and value with a colon;
- ② Replace `enum` with a call to `toBiEnum`;
- ③ Add `as const` at the end of the constructor parameter object;
- ④ In general, it is also necessary to define a type with the same name as the enumeration mapping object for the enumeration value range (`allValues`) (to comply with developers' usage habits of native `enum`)。

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
The type system treats all literals as types, and the compiler does not report errors now.

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

## 4. Other instructions
### 4.1 Type restrictions on enumeration elements
BiEnum requires the enumeration label to be a classic primitive type (string | number | boolean | null | undefined).

There are no requirements for enumeration values, but if you set the value to a non-classic primitive type, BiEnum will only retain the one-way mapping from the enumeration label to the value.

The runtime BiEnum object does not preserve a reverse mapping where the enumeration value is a non-classic primitive types. You also won't see a reverse mapping of `[object Object]` to enumeration label in the editor's prompt list.

### 4.2 Enumeration elements hit keywords

If the business enumeration label or enumeration value has the same name as `allLabels`, `allValues`, `isLabel`, `isValue`, it will not affect the creation of bidirectional mapping objects, just get their references from the prototype.

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
