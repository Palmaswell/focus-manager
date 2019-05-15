import * as React from 'react';
import { mount } from 'enzyme';
import {
  FocusManager,
  FocusManagerConsumer,
  FocusManagerContext,
} from './focus-manager';
import { FocusContainer } from './focus-container';
import { simulateKeyDown } from '../keyboard/keyboard.test';
import { render } from 'react-testing-library';

describe('FocusManager', () => {
  test('Initiate simple Context', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusManagerConsumer>{fn}</FocusManagerConsumer>
      </FocusManager>
    );
    expect(fn).toBeCalled();
  });
  test('Initiate nested Context', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusManagerConsumer>{fn}</FocusManagerConsumer>
        <FocusManager>
          <FocusManagerConsumer>{fn}</FocusManagerConsumer>
        </FocusManager>
      </FocusManager>
    );
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).toBe(fn.mock.calls[1][0]);
  });

  test('FocusManager registers 5 mixed FocusContainers with and without tabIndex', () => {
    const fn = jest.fn();
    mount(
      <FocusManager reset={true}>
        <FocusManagerConsumer>{fn}</FocusManagerConsumer>
        <FocusContainer />
        <FocusContainer tabIndex={3} />
        <div>
          <FocusContainer tabIndex={0} />
        </div>
        <div>
          <FocusContainer>
            <FocusContainer tabIndex={1} />
          </FocusContainer>
        </div>
      </FocusManager>
    );
    const fnCtx: FocusManagerContext = fn.mock.calls[0][0];
    expect(fnCtx.getContainers().length).toBe(5);
    expect(fnCtx.getContainers().map(a => a.tabPosition)).toEqual([
      0,
      1,
      3,
      -1,
      -5,
    ]);
  });
  test('FocusManager registers 7  FocusContainers without tabIndex', () => {
    const fn = jest.fn();
    mount(
      <FocusManager reset={true}>
        <FocusManagerConsumer>{fn}</FocusManagerConsumer>
        <FocusContainer />
        <FocusContainer />
        <div>
          <FocusContainer />
        </div>
        <div>
          <FocusContainer>
            <FocusContainer />
          </FocusContainer>
        </div>
        <FocusContainer>
          <FocusContainer />
        </FocusContainer>
      </FocusManager>
    );
    const fnCtx: FocusManagerContext = fn.mock.calls[0][0];
    expect(fnCtx.getContainers().length).toBe(7);
    expect(fnCtx.getContainers().map(a => a.tabPosition)).toEqual([
      -1,
      -2,
      -3,
      -4,
      -5,
      -6,
      -7,
    ]);
  });
  test('FocusManager captures key events', () => {
    const fn = jest.fn();
    const dom = render(
      <>
        <FocusManager keyAction={fn}>
          <section data-testid="section">
            <FocusManager />
            <FocusManager />
          </section>
        </FocusManager>
        <FocusManager />
      </>
    );
    simulateKeyDown(dom);
    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0].key).toBe('ArrowDown');
  });
  test('FocusManager send actions', () => {
    const dom = render(
      <FocusManager>
        <ul data-testid="list">
          <li data-testid="item1">Item One</li>
          <li data-testid="item2">Item Two</li>
          <li data-testid="item3">Item Three</li>
          <li data-testid="item4">Item Four</li>
        </ul>
      </FocusManager>
    );
  });
});
