import * as React from 'react';
import { mount } from 'enzyme';
import {
  FocusManager,
  FocusManagerCtx,
  FocusManagerContext,
} from './focus-manager';
import { FocusContainer } from './focus-container';

describe('FocusManager', () => {
  test('Initiate simple Context', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusManagerCtx.Consumer>{fn}</FocusManagerCtx.Consumer>
      </FocusManager>
    );
    expect(fn).toBeCalled();
  });
  test('Initiate nested Context', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusManagerCtx.Consumer>{fn}</FocusManagerCtx.Consumer>
        <FocusManager>
          <FocusManagerCtx.Consumer>{fn}</FocusManagerCtx.Consumer>
        </FocusManager>
      </FocusManager>
    );
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).toBe(fn.mock.calls[1][0]);
  });

  test('FocusManager registers 5 mixed FocusContainers with and without tabIndex', () => {
    const fn = jest.fn();
    mount(
      <FocusManager>
        <FocusManagerCtx.Consumer>{fn}</FocusManagerCtx.Consumer>
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
    expect(fnCtx.getContainers().map(a => a.tabIndex)).toEqual([
      0,
      1,
      3,
      -1,
      -4,
    ]);
  });
  // test('FocusManager registers 7  FocusContainers without tabIndex', () => {
  //   const fn = jest.fn();
  //   mount(
  //     <FocusManager>
  //       <FocusManagerCtx.Consumer>{fn}</FocusManagerCtx.Consumer>
  //       <FocusContainer />
  //       <FocusContainer />
  //       <div>
  //         <FocusContainer />
  //       </div>
  //       <div>
  //         <FocusContainer>
  //           <FocusContainer />
  //         </FocusContainer>
  //       </div>
  //       <FocusContainer>
  //         <FocusContainer />
  //       </FocusContainer>
  //     </FocusManager>
  //   );
  //   const fnCtx: FocusManagerContext = fn.mock.calls[0][0];
  //   expect(fnCtx.getContainers().length).toBe(7);
  //   expect(fnCtx.getContainers().map(a => a.tabIndex)).toEqual([
  //     -1,
  //     -2,
  //     -3,
  //     -4,
  //     -5,
  //     -6,
  //     -7,
  //   ]);
  // });
});
