import { expect } from 'chai';

import { dest, src, symlink } from '.';

context('@kjots/vinyl-fs-observable', () => {
  describe('src()', () => {
    it('should exist', () => {
      expect(src).not.to.be.undefined;
    });
  });

  describe('dest()', () => {
    it('should exist', () => {
      expect(dest).not.to.be.undefined;
    });
  });

  describe('symlink()', () => {
    it('should exist', () => {
      expect(symlink).not.to.be.undefined;
    });
  });
});
