import * as React from 'react';
import {
  FocusManager,
  FocusManagerConsumer,
} from './focus-manager';
import { render } from 'react-testing-library';
import { listBoxAction } from './focus-actions';
import {
  KeyboardManager, simulateKeyDown,
} from '@palmaswelll/keyboard-manager';
import { FocusContainer } from './focus-container';
import { FocusElement } from './focus-element';

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
  expect(listBox.getAttribute('aria-activedescendant')).toBeNull();
  simulateKeyDown(dom);
  expect(dom.getByTestId('testItem-0').getAttribute('focusAction')).toEqual('hasFocus');
  simulateKeyDown(dom);
  expect(dom.getByTestId('testItem-0').getAttribute('focusAction')).toBeNull();
  expect(dom.getByTestId('testItem-1').getAttribute('focusAction')).toEqual('hasFocus');
})
