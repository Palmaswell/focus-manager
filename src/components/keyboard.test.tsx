import * as React from 'react';
// import { mount } from 'enzyme';
import { KeyboardManager, KeyboardManagerConsumer } from './keyboard';
import { render } from 'react-testing-library';

describe('KeyboardManager', () => {
  test('Registers DOM events', () => {
    const fn = jest.fn();
    const dom = render(
      <KeyboardManager>
        <KeyboardManagerConsumer>
          {ctx => {
            console.log('WWWWW');
            ctx.injectDocument(document);
            ctx.registerKeyDownTest((ev: KeyboardEvent) => {
              fn(ev);
              return ev.key == 'A';
            });
            return (
              <>
                <input type="button" data-testid="dummy" value="wurst" />
                Dummy
                <KeyboardManagerConsumer>
                  {ctx => {
                    ctx.registerKeyDownTest((ev: KeyboardEvent) => {
                      fn(ev);
                      return ev.key == 'B';
                    });
                    return <></>;
                  }}
                </KeyboardManagerConsumer>
              </>
            );
          }}
        </KeyboardManagerConsumer>
      </KeyboardManager>
    );
    const input = dom.queryByTestId('dummy');
    // const input = dom.find('input').first();
    // input.simulate('keypress', {
    //   key: 'A',
    //   code: '65',
    //   keyCode: 65,
    //   bubbles: true,
    // });
    input!.dispatchEvent(
      new (window as any).KeyboardEvent('keydown', {
        key: 'A',
        code: '65',
        keyCode: 65,
        bubbles: true,
      } as any)
    );
    console.log(fn.mock.calls);
    expect(fn.mock.calls.length).toBe(2);
    expect(fn.mock.calls.map((k: KeyboardEvent[]) => k[0].key)).toEqual([
      'A',
      'A',
    ]);
  });
});
