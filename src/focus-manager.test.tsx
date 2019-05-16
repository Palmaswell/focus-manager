import * as React from 'react';
import { mount } from 'enzyme';
import {
  FocusManager,
  FocusManagerConsumer,
  FocusManagerContext,
} from './focus-manager';
import { FocusContainer } from './focus-container';
import { simulateKeyDown, KeyboardManager } from '@palmaswell/keyboard-manager';
import { render, RenderResult } from 'react-testing-library';
import { FocusElement } from './focus-element';

type LIProps = React.PropsWithChildren<{
  readonly id: string;
  readonly focus?: boolean;
}>;

function LI(props: LIProps) {
  return <FocusElement focus={props.focus}>{ctx =>
    <li ref={ctx.refFunc()} id={props.id} data-testid={props.id}>{props.children}</li>
  }</FocusElement>
}

function TestSet(action: (fmCtx: FocusManagerContext, dom: RenderResult) => void) {
  const fn = jest.fn();
  const items = new Array(6).fill('').map((_, i) => `Item${i}`);
  const dom = render(
    <KeyboardManager>
      <FocusManager>
        <FocusManagerConsumer>{fn}</FocusManagerConsumer>
        <section data-testid='section'>Wurst</section>
        <FocusContainer>
          <ul data-testid="list1">
            {items.map(i => <LI key={`list1.${i}`} id={`list1.${i}`}>{`list1.${i}`}</LI>)}
          </ul>
          <FocusContainer>
            <ul data-testid="list2">
              {items.map(i => <LI key={`list2.${i}`} id={`list2.${i}`}>{`list2.${i}`}</LI>)}
            </ul>
          </FocusContainer>
        </FocusContainer>
        <FocusContainer>
            <ul data-testid="list3">
              {items.map(i => <LI key={`list3.${i}`} id={`list3.${i}`}>
                 <ul data-testid={`list3.${i}`}>
                  {items.map(j => <LI key={`list3.${i}.${j}`} id={`list3.${i}.${j}`}>{`list3.${i}.${j}`}</LI>)}
                  </ul>
              </LI>)}
            </ul>
        </FocusContainer>
      </FocusManager>
    </KeyboardManager>
  );
  action(fn.mock.calls[0][0], dom);
  dom.unmount();
}

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
      <KeyboardManager>
        <FocusManager keyAction={fn}>
          <section data-testid="section">
            Socken
            <FocusManager />
            <FocusManager />
          </section>
        </FocusManager>
        <FocusManager />
      </KeyboardManager>
    );
    simulateKeyDown(dom);
    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0].key).toBe('ArrowDown');
    dom.unmount();
  });

  test('FocusManager default unfocused', () => {
    const fn = jest.fn();
    const dom = render(
      <KeyboardManager>
        <FocusManager>
          <FocusManagerConsumer>{fn}</FocusManagerConsumer>
          <FocusContainer>
            <ul>
              <LI id={`list1.1`}>{`list1.1`}</LI>
              <LI id={`list1.2`}>{`list1.2`}</LI>
            </ul>
          </FocusContainer>
        </FocusManager>
      </KeyboardManager>
    );
    const fmCtx: FocusManagerContext = fn.mock.calls[0][0];
    expect(fmCtx.getElements().map(i => i.focus)).toEqual([false, false])
    dom.unmount();
  });

  test('FocusManager default focused', () => {
    const fn = jest.fn();
    const dom = render(
      <KeyboardManager>
        <FocusManager>
          <FocusManagerConsumer>{fn}</FocusManagerConsumer>
          <FocusContainer>
            <ul>
              <LI id={`list1.1`}>{`list1.1`}</LI>
              <LI focus={true} id={`list1.2`}>{`list1.2`}</LI>
            </ul>
          </FocusContainer>
        </FocusManager>
      </KeyboardManager>
    );
    const fmCtx: FocusManagerContext = fn.mock.calls[0][0];
    expect(fmCtx.getElements().map(i => i.focus)).toEqual([false, true])
    dom.unmount();
  });

  test('FocusManager send actions Next', () => {
    TestSet((fmCtx, dom) => {
      const elements = fmCtx.getElements();
      expect(elements.reduce((p, c) => p = p || c.focus, false)).toEqual(false);
      ['ArrowDown', 'Tab'].forEach(key => {
        elements.concat(elements).forEach((_, idx) => {
          const shouldBe = elements.map((_, jo) => (idx%elements.length) === jo);
          simulateKeyDown(dom, 'section', key);
          expect(elements.map(i => i.focus)).toEqual(shouldBe);
        });
      });
    });
  });

  test('FocusManager send actions Up', () => {
    TestSet((fmCtx, dom) => {
      const elements = fmCtx.getElements();
      expect(elements.reduce((p, c) => p = p || c.focus, false)).toEqual(false);
      ['ArrowUp', 'Shift^Tab'].forEach(key => {
        elements.concat(elements).forEach((_, idx) => {
          simulateKeyDown(dom, 'section', key);
          expect(elements.map(i => i.focus)).toEqual(
            elements.map((_, jo) => (idx%elements.length) === ((elements.length-1) - jo)));
        });
      });
    });
  });



});
