/* global describe, it */
const {should, expect} = require('chai');
const {filterObjectKeys} = require('../src/utils.js');
should();

describe('UTILS', () => {
    describe('filterObjectKeys', () => {
        it('should be a function', () => {
            filterObjectKeys.should.be.a('function');
        });
        const testObject = {a: 1, b: 1, c: 1};
        it('should accept limiter array', () => {
            expect(filterObjectKeys(testObject, ['a', 'c']))
                .to.deep.equal({a: 1, c: 1});
        });
        it('should accept limiter object', () => {
            expect(filterObjectKeys(testObject, {a: 2, c: 2}))
                .to.deep.equal({a: 1, c: 1});
        });
    });
});
