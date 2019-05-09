import * as React from 'react';
import { render, cleanup, fireEvent } from 'react-testing-library';
import 'jest-dom/extend-expect';

import { List, ListItem } from './list';

afterEach(cleanup);

describe('Keyboard Manager', () => {
  test('should render without crashing', () => {
    const { getByRole } = render(
      <List tabIndex={0}>
        <ListItem selected={false}>Item One</ListItem>
        <ListItem selected={false}>Item Two</ListItem>
      </List>
    );
    expect(getByRole('listbox')).toMatchSnapshot();
    
  });
  test('First list element gets the focus', () => {
    const { getByText } = render(
      <List tabIndex={0}>
        <ListItem selected={false}>Item One</ListItem>
        <ListItem selected={false}>Item Two</ListItem>
      </List>
    );
    const firstLi = getByText('Item One');
    firstLi.focus();
    expect(document.activeElement).toBe(firstLi);
    expect(firstLi.getAttribute('aria-selected')).toBe(true);
  });
  test('OnKeydown the next element on the bottom gets the focus', () => {
    const { getByRole, getByText } = render(
      <List tabIndex={0}>
        <ListItem selected={false}>Item One</ListItem>
        <ListItem selected={false}>Item Two</ListItem>
      </List>
    );
    const firstLi = getByText('Item One');
    firstLi.focus();
    fireEvent.keyDown(getByRole('listbox'), { key: 'ArrowDown', code: 40 });

  });
});
