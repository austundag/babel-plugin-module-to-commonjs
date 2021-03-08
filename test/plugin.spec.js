/* global describe, it */

import path from 'path';
import { readFile } from 'fs/promises';
import url from 'url';
import babel from '@babel/core';

import chai from 'chai';

const { expect } = chai;

describe('module to commonjs unit tests', function moduleToCommonJsUnitTests() {
    const cases = [{
        code: 'import _ from \'lodash\';',
        expected: 'const _ = require(\'lodash\');',
        description: 'basic import',
    }, {
        code: 'export default class A {}',
        expected: 'module.exports = class A {};',
        description: 'basic export default class',
    }];

    cases.forEach(({ code, expected, description}) => {
        it(description, async () => {
            const result = await babel.transformAsync(code, {
                rootMode: 'upward',
            });

            expect(result.code).to.equal(`'use strict';\n\n${expected}`);
        });
    });
});

describe('full file tests', function fullFileTests() {
    const cases = [{
        description: 'export default class',
        fileroot: 'export-default-class',
    }];

    const getFixturePath = function () {
        const metaUrl = import.meta.url;
        const thispath = url.fileURLToPath(metaUrl);
        const dirpath = path.dirname(thispath);
        return path.join(dirpath, 'fixtures');
    };

    const fixturePath = getFixturePath();

    cases.forEach(({ description, fileroot }) => {
        it(description, async () => {
            const filepath = path.join(fixturePath, `${fileroot}.js`);
            const code = await readFile(filepath, 'utf8' );
            const result = await babel.transformAsync(code, {
                rootMode: 'upward',
            });

            const expectedPath = path.join(fixturePath, `${fileroot}.expected.js`);
            const expected = await readFile(expectedPath, 'utf8' );

            expect(result.code).to.equal(expected);
        });
    });
});
