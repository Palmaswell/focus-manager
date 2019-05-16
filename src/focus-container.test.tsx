import * as React from 'react';
import { mount } from 'enzyme';
import { FocusContainer, FocusContainerConsumer } from './focus-container';
import {
  FocusManager,
  FocusManagerConsumer,
  FocusManagerContext,
} from './focus-manager';

describe('FocusContainer', () => {
  test('Check for missing Focus Manager', () => {
    spyOn(console, 'error');
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
          <FocusContainerConsumer>{fn}</FocusContainerConsumer>
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
          <FocusContainerConsumer>{fn}</FocusContainerConsumer>
          <FocusContainer>
            <FocusContainerConsumer>{fn}</FocusContainerConsumer>
          </FocusContainer>
        </FocusContainer>
      </FocusManager>
    );
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).not.toBe(fn.mock.calls[1][0]);
  });

  test('test lifdecycle', () => {
    const fn = jest.fn();
    const dom = mount(
      <FocusManager reset={true}>
        <FocusManagerConsumer>{fn}</FocusManagerConsumer>
        <FocusContainer>Hello</FocusContainer>
      </FocusManager>
    );
    const focusManagerContext: FocusManagerContext = fn.mock.calls[0][0];
    expect(focusManagerContext.getContainers().length).toBe(1);
    dom.unmount();
    expect(focusManagerContext.getContainers().length).toBe(0);
  });
});
