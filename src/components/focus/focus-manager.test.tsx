import * as React from 'react';
import { mount } from 'enzyme';
import { FocusManager, FocusManagerCtx } from './focus-manager';

describe('Focus Container', () => {
  test('Init simple Context', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusManagerCtx.Consumer>{fn}</FocusManagerCtx.Consumer>
      </FocusManager>
    );
    expect(fn).toBeCalled();
  });
  test('nested context', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusManagerCtx.Consumer>{fn}</FocusManagerCtx.Consumer>
        <FocusManager>
          <FocusManagerCtx.Consumer>{fn}</FocusManagerCtx.Consumer>
        </FocusManager>
      </FocusManager>
    );
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).toBe(fn.mock.calls[1][0]);
  });
});
