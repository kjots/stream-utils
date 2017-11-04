import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import index from './index';

const { expect } = chai
    .use(chaiAsPromised)
    .use(sinonChai);

describe('index', () => {
    let sandbox;

    beforeEach(() => sandbox = sinon.sandbox.create());

    it('should exist', () => {
        expect(index).to.not.be.undefined;
    });

    afterEach(() => sandbox.restore());
});