import * as React from 'react';
import { mount } from 'enzyme';
import {
  FocusContainer,
  FocusContainerContext,
  FocusContainerConsumer,
} from './focus-container';
import { FocusManager, FocusManagerConsumer, FocusManagerContext } from './focus-manager';
import { FocusElement } from './focus-element';

describe('FocusElement', () => {
  test('Missing FocusManager and FocusContainer', () => {
    spyOn(console, 'error');
    expect(() =>
      mount(<FocusElement>{_ => <></>}</FocusElement>)
    ).toThrowError();
  });
  test('Includes FocusManager and FocusContainer', () => {
    const container = mount(
      <FocusManager>
        <FocusContainer>
          <FocusElement>{_ => <></>}</FocusElement>
        </FocusContainer>
      </FocusManager>
    );
    expect(
      container.contains(<FocusElement>{_ => <></>}</FocusElement>)
    ).toBeTruthy();
  });
  test('FocusContainer registers 6 FocusElements missing tabIndex', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusContainer>
          <FocusContainerConsumer>{fn}</FocusContainerConsumer>
          <FocusElement>{_ => <></>}</FocusElement>
          <FocusElement>{_ => <></>}</FocusElement>
          <FocusElement>{_ => <></>}</FocusElement>
          <FocusElement>{_ => <></>}</FocusElement>
          <FocusElement>{_ => <></>}</FocusElement>
          <FocusElement>{_ => <></>}</FocusElement>
        </FocusContainer>
      </FocusManager>
    );
    const fnCtx: FocusContainerContext = fn.mock.calls[0][0];
    expect(fnCtx.getElements().length).toBe(6);
    expect(fnCtx.getElements().map(a => a.tabPosition)).toEqual([
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
          <FocusContainerConsumer>{fn}</FocusContainerConsumer>
          <FocusElement tabIndex={7}>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={5}>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={0}>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={3}>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={2}>{_ => <></>}</FocusElement>
        </FocusContainer>
      </FocusManager>
    );
    const fnCtx: FocusContainerContext = fn.mock.calls[0][0];
    expect(fnCtx.getElements().length).toBe(5);
    expect(fnCtx.getElements().map(a => a.tabPosition)).toEqual([
      0,
      2,
      3,
      5,
      7,
    ]);
  });
  test('FocusContainer registers 7 FocusElements with and without tabIndex', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusContainer>
          <FocusContainerConsumer>{fn}</FocusContainerConsumer>

          <FocusElement tabIndex={3}>{_ => <></>}</FocusElement>
          <FocusElement>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={0}>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={10}>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={2}>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={15}>{_ => <></>}</FocusElement>
          <FocusElement tabIndex={11}>{_ => <></>}</FocusElement>
        </FocusContainer>
      </FocusManager>
    );
    const fnCtx: FocusContainerContext = fn.mock.calls[0][0];
    expect(fnCtx.getElements().length).toBe(7);
    expect(fnCtx.getElements().map(a => a.tabPosition)).toEqual([
      0,
      2,
      3,
      10,
      11,
      15,
      -2,
    ]);
  });

  test('test lifdecycle', () => {
    const fn = jest.fn();
    const dom = mount(
      <FocusManager reset={true}>
        <FocusContainer>
          <FocusContainerConsumer>{fn}</FocusContainerConsumer>
          <FocusElement>{() => <></>}</FocusElement>
        </FocusContainer>
      </FocusManager>
    );
    const focusContainerContext: FocusContainerContext = fn.mock.calls[0][0];
    expect(focusContainerContext.getElements().length).toBe(1);
    dom.unmount();

    expect(focusContainerContext.getElements().length).toBe(0);
  });
  test('test ref collection', () => {
    const fn = jest.fn();
    const dom = mount(
      <FocusManager reset={true}>
        <FocusContainer>
          <FocusContainerConsumer>{fn}</FocusContainerConsumer>
          <FocusElement>
            {focusElContext => {
              return (
                <label>
                  <input ref={focusElContext.refFunc()} type="radio" />
                </label>
              );
            }}
          </FocusElement>
          <FocusElement>
            {focusElContext => {
              return (
                <label>
                  <input ref={focusElContext.refFunc()} type="text" />
                </label>
              );
            }}
          </FocusElement>
        </FocusContainer>
      </FocusManager>
    );
    const ctx: FocusContainerContext = fn.mock.calls[0][0];
    expect(ctx.getElements()[0].getRef()).toBe(
      dom.find('[type="radio"]').getDOMNode()
    );
    expect(ctx.getElements()[1].getRef()).toBe(
      dom.find('[type="text"]').getDOMNode()
    );
  });
  test('test double ref error', () => {
    const fn = jest.fn();
    spyOn(console, 'error');
    expect(() =>
      mount(
        <FocusManager reset={true}>
          <FocusContainer>
            <FocusContainerConsumer>{fn}</FocusContainerConsumer>
            <FocusElement>
              {focusElContext => {
                return (
                  <label ref={focusElContext.refFunc()}>
                    <input ref={focusElContext.refFunc()} type="radio" />
                  </label>
                );
              }}
            </FocusElement>
          </FocusContainer>
        </FocusManager>
      )
    ).toThrowError();
  });

  test('regression multiple focuselement have get a doubleref exception', () => {
    const fn = jest.fn();
    const dom = mount(
      <FocusManager reset={true}>
        <FocusManagerConsumer>{fn}</FocusManagerConsumer>
        <FocusContainer>
          <FocusElement>{ctx => <li ref={ctx.refFunc()}>Eins</li>}</FocusElement>
          <FocusElement>{ctx => <li ref={ctx.refFunc()}>Zwei</li>}</FocusElement>
        </FocusContainer>
      </FocusManager>
    );
    const fnCtx: FocusManagerContext = fn.mock.calls[0][0];
    expect(fnCtx.getElements().map(i => i.getRef<HTMLLIElement>()!.innerHTML)).toEqual(['Eins', 'Zwei']);
    dom.unmount();
  });
});
