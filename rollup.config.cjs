const typescript = require('@rollup/plugin-typescript');
const dts = require('rollup-plugin-dts').default;
const pkg = require('./package.json');

module.exports = [
    {
        input: "./src/index.ts",
        output: [
            {
                format: "es",
                file: pkg.module,
            },
            {
                name: 'BiEnum',
                format: "umd",
                file: pkg.main,
            },
            {
                format: "commonjs",
                file: "./dist/bi-enum.common.js"
            },
        ],
        plugins: [
            typescript(),
        ],
    },
    {
        input: "./src/index.ts",
        output: [
            {
                file: pkg.types,
            }
        ],
        plugins: [dts()]
    },
];
