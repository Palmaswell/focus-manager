import * as React from 'react';
import {
  FocusManager,
  FocusManagerConsumer,
  FocusManagerContext,
} from '../focus-manager';
import { render } from '@testing-library/react';
import {
  DefaultFocusActions,
  HTMLInputElementAction,
  listBoxAction,
} from '../focus-actions';
import {
  KeyboardManager,
  simulateKeyDown,
} from '@palmaswelll/keyboard-manager';
import { FocusContainer } from '../focus-container';
import { FocusElement, FocusElementContext } from '../focus-element';

type TestListBoxProps = React.PropsWithChildren<{
  activedescendant?: string;
}>;

type TestListBoxItemProps = React.PropsWithChildren<{
  id: string;
  ref: React.RefForwardingComponent<HTMLLIElement>;
  focused?: boolean;
  selected?: boolean;
}>;

function TestListBox(props: TestListBoxProps): JSX.Element {
  return (
    <ul
      aria-activedescendant={props.activedescendant}
      role="listbox"
      data-testid="section"
      tabIndex={0}>
      {props.children}
    </ul>
  );
}

const TestListBoxItem = React.forwardRef<HTMLLIElement, TestListBoxItemProps>(
  (props, ref) => (
    <li
      ref={ref}
      id={props.id}
      data-testid={`test${props.id}`}
      role="options"
      aria-selected={props.selected || false}>
      {props.children}
    </li>
  )
);

describe('focus actions', () => {
  test('defaultActions', () => {
    const fn = jest.fn();
    const dom = render(
      <KeyboardManager>
        <FocusManager>
          <FocusManager>
            <FocusManagerConsumer>{fn}</FocusManagerConsumer>
          </FocusManager>
        </FocusManager>
        <FocusManager />
      </KeyboardManager>
    );
    const fmCtx: FocusManagerContext = fn.mock.calls[0][0];
    expect(Array.from(fmCtx.focusActions)).toEqual(DefaultFocusActions);
    dom.unmount();
  });

  test('defaultActions add actions', () => {
    const fn = jest.fn();
    const my1 = jest.fn();
    function my2(elem: FocusElementContext, action: boolean) {
      const dom = elem.getRef();
      if (dom instanceof HTMLInputElement) {
        dom.setAttribute('testAttribute', '' + action);
      }
    }

    const dom = render(
      <KeyboardManager>
        <FocusManager>
          <FocusManagerConsumer>{fn}</FocusManagerConsumer>
          <FocusContainer>
            <FocusElement>
              {ctx => <div ref={ctx.refFunc()}>mo</div>}
            </FocusElement>
          </FocusContainer>
        </FocusManager>
        <section data-testid="section">Uhu</section>
        <FocusManager focusActions={[my1, my2]}>
          <FocusContainer>
            <FocusElement>
              {ctx => <input ref={ctx.refFunc()} data-testid="input" />}
            </FocusElement>
          </FocusContainer>
        </FocusManager>
      </KeyboardManager>
    );

    const fmCtx: FocusManagerContext = fn.mock.calls[0][0];
    expect(Array.from(fmCtx.focusActions)).toEqual(
      DefaultFocusActions.concat([my1, my2])
    );
    expect(fmCtx.getElements().map(i => i.focus)).toEqual([false, false]);
    const htmlInput = dom.getByTestId('input');
    expect(htmlInput.getAttribute('testAttribute')).toBeFalsy();
    simulateKeyDown(dom);
    simulateKeyDown(dom);
    expect(fmCtx.getElements().map(i => i.focus)).toEqual([false, true]);
    expect(my1.mock.calls.length).toBe(4);
    expect(htmlInput.getAttribute('testAttribute')).toEqual('true');
    simulateKeyDown(dom);
    expect(htmlInput.getAttribute('testAttribute')).toEqual('false');
    dom.unmount();
  });

  test('follows the tab sequence and sets the test attributes', () => {
    function my2(elem: FocusElementContext, action: boolean) {
      const dom = elem.getRef();

      if (dom instanceof HTMLInputElement) {
        if (action) {
          dom.setAttribute('testAttribute', '' + action);
        }
        if (dom.hasAttribute('testAttribute') && !action) {
          dom.removeAttribute('testAttribute')
        }
      }
    }

    const dom = render(
      <KeyboardManager>
        <FocusManager focusActions={[my2]}>
          <section data-testid="section">
          <FocusContainer>
            <FocusElement>
              {ctx => <input ref={ctx.refFunc()} data-testid="input" />}
            </FocusElement>
            <FocusElement>
              {ctx => <input ref={ctx.refFunc()} data-testid="input" />}
            </FocusElement>
            <FocusElement>
              {ctx => <input ref={ctx.refFunc()} data-testid="input" />}
            </FocusElement>
          </FocusContainer>
          </section>
        </FocusManager>
      </KeyboardManager>
    );

    const inputNodeList = dom.getAllByTestId('input');
    simulateKeyDown(dom, 'section', 'Tab');
    inputNodeList.forEach((node: HTMLElement, idx: number) => {
      idx === 0
        ? expect(node.getAttribute('testAttribute')).toBe('true')
        : expect(node.getAttribute('testAttribute')).toBeNull()
    });

    simulateKeyDown(dom, 'section', 'Tab');
    inputNodeList.forEach((node: HTMLElement, idx: number) => {
      idx === 1
        ? expect(node.getAttribute('testAttribute')).toBe('true')
        : expect(node.getAttribute('testAttribute')).toBeNull()
    });

    simulateKeyDown(dom, 'section', 'Tab');
    inputNodeList.forEach((node: HTMLElement, idx: number) => {
      idx === 2
        ? expect(node.getAttribute('testAttribute')).toBe('true')
        : expect(node.getAttribute('testAttribute')).toBeNull()
    });

    dom.unmount();
  });

  test('Default input element action', () => {
    const fn = jest.fn();
    const dom = render(
      <KeyboardManager>
        <section data-testid="section">
          <FocusManager>
            <FocusManagerConsumer>{fn}</FocusManagerConsumer>
            <FocusContainer>
              <FocusElement>
                {ctx => <div ref={ctx.refFunc()}>mo</div>}
              </FocusElement>
            </FocusContainer>
          </FocusManager>
          <FocusManager focusActions={[HTMLInputElementAction]}>
            <FocusContainer>
              <FocusElement>
                {ctx => <input ref={ctx.refFunc()} data-testid="input" />}
              </FocusElement>
            </FocusContainer>
          </FocusManager>
        </section>
      </KeyboardManager>
    );
    const fmCtx: FocusManagerContext = fn.mock.calls[0][0];
    const htmlInput = dom.getByTestId('input');
    expect(htmlInput.getAttribute('focusAction')).toBeNull();
    simulateKeyDown(dom);
    expect(fmCtx.getElements().map(e => e.focus)).toEqual([true, false]);
    simulateKeyDown(dom);
    expect(htmlInput.getAttribute('focusAction')).toEqual('hasFocus');
    simulateKeyDown(dom);
    expect(htmlInput.getAttribute('focusAction')).toBeNull();
    dom.unmount();
  });

  test('Aria ListBox behaviour actions', () => {
    const items = new Array(6).fill('').map((_, i) => `Item-${i}`);
    const fn = jest.fn();
    const dom = render(
      <KeyboardManager>
        <FocusManager focusActions={[listBoxAction]}>
          <FocusManagerConsumer>{fn}</FocusManagerConsumer>
          <FocusContainer>
            <TestListBox>
              {items.map(i => (
                <FocusElement key={`${i}-focus-element`}>
                  {ctx => (
                    <TestListBoxItem
                      ref={ctx.refFunc()}
                      focused={ctx.focus}
                      id={i}>
                      {`box`}
                    </TestListBoxItem>
                  )}
                </FocusElement>
              ))}
              }
            </TestListBox>
          </FocusContainer>
        </FocusManager>
      </KeyboardManager>
    );
    const listBox = dom.getByTestId('section');
    const fmCtx: FocusManagerContext = fn.mock.calls[0][0];
    const listItems: HTMLElement[] = dom.getAllByText('box');
    expect(listBox.getAttribute('aria-activedescendant')).toBeNull();

    listItems.forEach(el => {
      expect(el.getAttribute('aria-selected')).toMatch('false');
    });
    for (let i = 0; i <= Math.floor(listItems.length / 2 - 1); i++) {
      simulateKeyDown(dom);
    }
    simulateKeyDown(dom, 'section', 'Space');
    expect(fmCtx.getElements().map(i => i.selected)).toEqual([
      false,
      false,
      true,
      false,
      false,
      false,
    ]);
    expect(listItems[2].getAttribute('aria-selected')).toMatch('true');
    simulateKeyDown(dom);
    simulateKeyDown(dom, 'section', 'Space');
    expect(listItems[2].getAttribute('aria-selected')).toMatch('false');
    expect(listItems[3].getAttribute('aria-selected')).toMatch('true');
    dom.unmount();
  });
});
