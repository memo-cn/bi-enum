export type {
    UnionToTuple
}

type UnionToIntersection<Union> = (Union extends unknown ? (arg: Union) => void : never) extends (arg: infer Intersection) => void ? Intersection : never

type LastInUnion<Union> = UnionToIntersection<Union extends unknown ? (arg: Union) => 0 : never> extends (arg: infer Last) => 0 ? Last : never;

type UnionToTuple<Union, Last = LastInUnion<Union>> = [Union] extends [never] ? [] : [...UnionToTuple<Exclude<Union, Last>>, Last];
