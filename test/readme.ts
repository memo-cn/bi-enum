/**
 * Cases in readme documents.
 */
import {toBiEnum} from "../src/bi-enum";

// 原生枚举
NativeEnum : {

    enum Direction {
        Up = 1,
        Down = 2,
    }

    Direction.Up // 1
    Direction[2] // 'Down'

    let direction: Direction;
    direction = 1; // ok
    direction = true; // As expected: error, TS2322: Type 'true' is not assignable to type 'Direction'.
    direction = 3; // Not as expected: compilation passed.

    Direction[4]; // Not as expected: compilation passed.

    type DirectionValue = 1 | 2;
    let direction2: DirectionValue = 3; // As expected: error, TS2322: Type '3' is not assignable to type 'DirectionValue'.
}

// 异构枚举
HeterogeneousEnum : {

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

}

BiEnum : {

    MyFirstBiEnum : {

        const myFirstBiEnum = toBiEnum({
            1234: /^(fe)?male$/, // The mapping of the non-classic enum value to label is not preserved.
            female: '♀',
            male: '♂',
        } as const);

        console.log(myFirstBiEnum);

    }

    // Create a BiEnum instance
    const Direction = toBiEnum({
        Up: 1,
        Down: 2,
    } as const); // Don't omit 'as const'

    // Value and type are both ['Up ',' Down ']
    Direction.allLabels;

    // Value and type are both [1, 2]
    Direction.allValues;

    // Equivalent to: type Direction = 1 | 2
    type Direction = typeof Direction.allValues[number];

    let direction: Direction;
    direction = 1; // ok
    direction = true; // As expected: error, TS2322: Type 'true' is not assignable to type '2 | 1'.
    direction = 3; // As expected: TS2322: Type '3' is not assignable to type '2 | 1'.
    Direction[4]; // As expected: error, TS7053: ... Property '4' does not exist on type ... .


    let test: number = 1;
    direction = test; // error, TS2322: Type 'number' is not assignable to type '2 | 1'.

    if (Direction.isValue(test)) {
        direction = test; // ok, compilation passed.
    }


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


    const HitKeyword = toBiEnum({
        allLabels: 1,
        2: 'isLabel',
    });
    type HitKeywordLabel = typeof HitKeyword.allLabels[number];
    type HitKeywordValue = typeof HitKeyword.allValues[number];

    if (Reflect.getPrototypeOf(HitKeyword).isLabel(2)) {/* ... */}

    for (const label of Reflect.getPrototypeOf(HitKeyword).allLabels) {/* ... */}

}
