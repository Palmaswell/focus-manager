import * as React from 'react';
import {
  FocusManager,
  FocusManagerConsumer,
  FocusManagerContext,
} from './focus-manager';
import { render } from 'react-testing-library';
import { DefaultFocusActions } from './focus-actions';
import {
  KeyboardManager,
  simulateKeyDown,
} from '@palmaswelll/keyboard-manager';
import { FocusContainer } from './focus-container';
import { FocusElement, FocusElementContext } from './focus-element';

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
    // const my2 = jest.fn();
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
});
