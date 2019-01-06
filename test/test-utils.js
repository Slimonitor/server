/* global describe, it */
const {should, expect} = require('chai');
const {filterObjectKeys, generateRandomColor, fillGapsInArray} = require('../src/utils.js');
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

    describe('generateRandomColor', () => {
        it('should be a function', () => {
            generateRandomColor.should.be.a('function');
        });
        const result = generateRandomColor();
        it('should returns array', () => {
            result.should.be.an('array');
        });
        it('should returns array of 3 items', () => {
            expect(result).to.have.lengthOf(3)
        });
        it('should returns array of numbers', () => {
            result.forEach(value => value.should.be.a('number'));
        });
    });

    describe('fillGapsInArray', () => {
        it('should be a function', () => {
            fillGapsInArray.should.be.a('function');
        });
        const testArray = [null, null, 1, 2, null, null, 3, 4, 5, null, null];
        it('should close only internal gaps', () => {
            expect(fillGapsInArray(testArray)).to.deep.equal(
                [null, null, 1, 2, 2, 2, 3, 4, 5, null, null]
            );
        });
    });
});
