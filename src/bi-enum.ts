export {
    toBiEnum,
};

import {UnionToTuple} from './utils';

/*! 经典基础类型 */
type ClassicPrimitive = string | number | boolean | null | undefined;

/*! 枚举定义对象 */
type DefinitionMap = Record<string | number, any>;

/*! 标签类型 */
type LabelOf<T extends DefinitionMap> = ToString<keyof T>;

/*! 值类型 */
type ValueOf<T extends DefinitionMap> = T[keyof T];

/*! 双向枚举对象 */
type BiEnum<T extends DefinitionMap = DefinitionMap> = BiMap<T> & BiEnumPrototype<T>;

/*! 反转了 key 和 value 的 map */
type FlippedMap<T extends DefinitionMap> = {
    [K in keyof T  as `${T[K]}`]: K
};

/*! 确保 ts 编译器把对象的 key 识别为字符串, 而不是数值 */
type EnsureKeyRecognizedAsString<T extends DefinitionMap> = {
    [K in keyof T as ToString<K>]: T[K]
}

/*! 把 经典基础类型 转换为字符串形式的类型 */
type ToString<T> = T extends ClassicPrimitive ? `${T}` : never;

/*! key 和 value 双向映射的 map */
type BiMap<T extends DefinitionMap> = T & FlippedMap<T>;

/*! 原型对象 */
type BiEnumPrototype<T extends DefinitionMap> = {

    /*! 入参是否为标签 */
    isLabel: (arg: any) => arg is LabelOf<T>;

    /*! 入参是否为值 */
    isValue: (arg: any) => arg is ValueOf<T>;

    /*! 所有标签组成的数组 */
    allLabels: UnionToTuple<LabelOf<T>>;

    /*! 所有值组成的数组 */
    allValues: UnionToTuple<ValueOf<T>>;

};

/**
 * 计算并返回 BiEnum 对象
 * @param definitionMap {DefinitionMap} 枚举定义对象
 */
function toBiEnum<T extends DefinitionMap>(definitionMap: T): BiEnum<T> {

    /*! 存储标签、值的数组 */
    const allLabels: any = [];
    const allValues: any = [];

    /*! BiEnum 原型对象 */
    const biEnumPrototype: BiEnumPrototype<T> | any = {
        allLabels,
        allValues,
        isLabel(arg: any) {
            return allLabels.includes(arg);
        },
        isValue(arg: any) {
            return allValues.includes(arg);
        },
    };

    /*! 将 BiEnum 原型对象 上的属性设为不可枚举 */
    for (const key of Object.keys(biEnumPrototype)) {
        Reflect.defineProperty(biEnumPrototype, key, {
            enumerable: false,
            configurable: true,
        });
    }

    /*! BiEnum 实例 */
    const biEnum: BiEnum<T> = Object.create(biEnumPrototype);

    for (const [label, value] of Object.entries(definitionMap)) {
        if (isClassicPrimitive(value)) {
            biEnum[value as any] = label;
        }
        biEnum[label as any] = value;
        allLabels.push(label);
        allValues.push(value as any);
    }

    return biEnum;
}

/*! 判断入参是否为经典基础类型，入参为 object、bigint、symbol 时返回 false。*/
function isClassicPrimitive(arg: any): arg is ClassicPrimitive {
    if (typeof arg === 'string' || typeof arg === 'number') {
        return true;
    }
    if (arg === true || arg === false) {
        return true;
    }
    if (arg === null || arg === void 0) {
        return true;
    }
    return false;
}
