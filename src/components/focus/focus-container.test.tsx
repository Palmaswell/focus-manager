import * as React from 'react';
import { mount } from 'enzyme';
import { FocusContainer, FocusContainerCtx } from './focus-container';
import { FocusManager } from './focus-manager';

describe('FocusContainer', () => {
  test('Check for missing Focus Manager', () => {
    expect(() => mount(<FocusContainer />)).toThrowError();
  });
  test('Check with Focus Manager', () => {
    expect(() =>
      mount(
        <FocusManager>
          <FocusContainer />
        </FocusManager>
      )
    ).not.toThrowError();
  });
  test('Init simple Context', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusContainer>
          <FocusContainerCtx.Consumer>{fn}</FocusContainerCtx.Consumer>
        </FocusContainer>
      </FocusManager>
    );
    expect(fn).toBeCalled();
  });
  test('nested context', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusContainer>
          <FocusContainerCtx.Consumer>{fn}</FocusContainerCtx.Consumer>
          <FocusContainer>
            <FocusContainerCtx.Consumer>{fn}</FocusContainerCtx.Consumer>
          </FocusContainer>
        </FocusContainer>
      </FocusManager>
    );
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).not.toBe(fn.mock.calls[1][0]);
  });
});
