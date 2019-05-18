import * as React from 'react';
import {
  FocusManager,
  FocusManagerConsumer,
  FocusManagerContext,
} from './focus-manager';
import { render } from 'react-testing-library';
import { DefaultFocusActions, HTMLInputElementAction, listBoxAction } from './focus-actions';
import {
  KeyboardManager,
  simulateKeyDown,
} from '@palmaswelll/keyboard-manager';
import { FocusContainer } from './focus-container';
import { FocusElement, FocusElementContext } from './focus-element';

type TestListBoxProps = React.PropsWithChildren<{
  activedescendant?: string;
}>
function TestListBox(props: TestListBoxProps): JSX.Element {
  return(
  <ul
    aria-activedescendant={props.activedescendant}
    role="listbox"
    data-testid='section'
    tabIndex={0}>
    {props.children}
  </ul>
  )
}

type TestListBoxItemProps = React.PropsWithChildren<{
  id: string;
  ref: React.RefForwardingComponent<HTMLLIElement>;
  focused?: boolean;
  selected?: boolean;
}>

const TestListBoxItem = React.forwardRef<HTMLLIElement, TestListBoxItemProps>((props, ref) => (
  <li
    ref={ref}
    id={props.id}
    data-testid={`test${props.id}`}
    role="options"
    aria-selected={props.selected}>
    {props.children}
  </li>
))

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
    function my2(elem: FocusElementContext, action: boolean) {
      const dom = elem.getRef();
      if (dom instanceof HTMLInputElement) {
        dom.setAttribute('testAttribute', '' + action);
      }
    }
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
              {
                items.map(i => (
                  <FocusElement key={`${i}-focus-element`}>
                    {ctx => (
                      <TestListBoxItem
                        ref={ctx.refFunc()}
                        focused={ctx.focus}
                        id={i}>
                        {`box${i}`}
                      </TestListBoxItem>
                    )
                  }
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
    expect(listBox.getAttribute('aria-activedescendant')).toBeNull();

    simulateKeyDown(dom);
    console.log(dom.getByTestId('testItem-0').getAttribute('aria-selected'))
    expect(dom.getByTestId('testItem-0').getAttribute('aria-selected')).toEqual('false');

    simulateKeyDown(dom);
    console.log(fmCtx.getElements())
    expect(dom.getByTestId('testItem-1').getAttribute('aria-selected')).toEqual('false');

    simulateKeyDown(dom);
    simulateKeyDown(dom, 'section', 'Space');
    expect(fmCtx.getElements().map(i => i.selected)).toEqual([false, false, true, false, false, false]);
    dom.unmount();
  })
});
