/* global describe, it */
const {should, expect} = require('chai');
const utils = require('../src/utils.js');
should();

describe('filterObjectKeys', () => {
    it('should be a function', () => {
        utils.filterObjectKeys.should.be.a('function');
    });
    it('should accept limiter array', () => {
        expect(utils.filterObjectKeys({a: 1, b: 1, c: 1}, ['a', 'c'])).to.deep.equal({a: 1, c: 1});
    });
    it('should accept limiter object', () => {
        expect(utils.filterObjectKeys({a: 1, b: 1, c: 1}, {a: 2, c: 2})).to.deep.equal({a: 1, c: 1});
    });
});

