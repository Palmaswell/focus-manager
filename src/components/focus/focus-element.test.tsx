import * as React from 'react';
import { mount } from 'enzyme';
import {
  FocusContainer,
  FocusContainerContext,
  FocusContainerCtx,
} from './focus-container';
import { FocusManager } from './focus-manager';
import { FocusElement } from './focus-element';

describe('FocusElement', () => {
  test('Missing FocusManager and FocusContainer', () => {
    expect(() => mount(<FocusElement />)).toThrowError();
  });
  test('Includes FocusManager and FocusContainer', () => {
    const container = mount(
      <FocusManager>
        <FocusContainer>
          <FocusElement />
        </FocusContainer>
      </FocusManager>
    );
    expect(container.contains(<FocusElement />)).toBeTruthy();
  });
  test('FocusContainer registers 6 FocusElements missing tabIndex', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusContainer>
          <FocusContainerCtx.Consumer>{fn}</FocusContainerCtx.Consumer>
          <FocusElement />
          <FocusElement />
          <FocusElement />
          <FocusElement />
          <FocusElement />
          <FocusElement />
        </FocusContainer>
      </FocusManager>
    );
    const fnCtx: FocusContainerContext = fn.mock.calls[0][0];
    expect(fnCtx.getElements().length).toBe(6);
    expect(fnCtx.getElements().map(a => a.tabIndex)).toEqual([
      -1,
      -2,
      -3,
      -4,
      -5,
      -6,
    ]);
  });
  test('FocusContainer registers 4 FocusElements with tabIndex', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusContainer>
          <FocusContainerCtx.Consumer>{fn}</FocusContainerCtx.Consumer>
          <FocusElement tabIndex={7} />
          <FocusElement tabIndex={5} />
          <FocusElement tabIndex={0} />
          <FocusElement tabIndex={3} />
          <FocusElement tabIndex={2} />
        </FocusContainer>
      </FocusManager>
    );
    const fnCtx: FocusContainerContext = fn.mock.calls[0][0];
    expect(fnCtx.getElements().length).toBe(5);
    expect(fnCtx.getElements().map(a => a.tabIndex)).toEqual([0, 2, 3, 5, 7]);
  });
  test('FocusContainer registers 7 FocusElements with and without tabIndex', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusContainer>
          <FocusContainerCtx.Consumer>{fn}</FocusContainerCtx.Consumer>
          <FocusElement tabIndex={3} />
          <FocusElement />
          <FocusElement tabIndex={0} />
          <FocusElement tabIndex={10} />
          <FocusElement tabIndex={2} />
          <FocusElement tabIndex={15} />
          <FocusElement tabIndex={11} />
        </FocusContainer>
      </FocusManager>
    );
    const fnCtx: FocusContainerContext = fn.mock.calls[0][0];
    expect(fnCtx.getElements().length).toBe(7);
    expect(fnCtx.getElements().map(a => a.tabIndex)).toEqual([
      0,
      2,
      3,
      10,
      11,
      15,
      -2,
    ]);
  });
});
