/*
import { mount } from 'enzyme';
import * as React from 'react';

import { List, ListItem } from './list';

interface Focus {
  focus(): void;
}

describe('React Keyboard Manager', () => {
  test('Focus management', () => {
    const wrapper = mount(
      <List tabIndex={0}>
        <ListItem selected={false}>Item One</ListItem>
        <ListItem selected={false}>Item Two</ListItem>
      </List>
    );
    const firstLi = wrapper.find(ListItem).first();
    const foo = (firstLi.getDOMNode() as unknown) as Focus;
    foo.focus();
    expect(document.activeElement).toBe(foo);
  });
});

// test('', done => {
//    function handleArrowDown({ liItems }: LiContainer) {
//       return () => {
//         ((liItems!.last().getDOMNode() as unknown) as Focus).focus();
//       };
//     }
//     const liContainer: LiContainer = { liItems: undefined };
//     const testList = mount(
//       <List onKeyPress={handleArrowDown(liContainer)}>
//         <ListItem>Item One</ListItem>
//         <ListItem>Item Two</ListItem>
//       </List>
//     );
//     liContainer.liItems = testList.find(List).find(ListItem);
//     const { liItems } = liContainer;
//     const firstLiDOM = (liItems.first().getDOMNode() as unknown) as Focus;
//     firstLiDOM.focus();

//     expect(document.activeElement).toBe(firstLiDOM);
//     liItems.first().simulate('keypress', { key: 'ArrowDown' });
//     testList
//       .find(List)
//       .first()
//       .simulate('keypress', { key: 'ArrowDown' });
//     setTimeout(() => {
//       expect(document.activeElement).toBe(liItems.last().getDOMNode());
//       done();
//     }, 500);
// })
*/
