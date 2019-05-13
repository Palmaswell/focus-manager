import * as React from 'react';

export type FocusManagerProps = React.PropsWithChildren<{}>;

const focusManagerContext = {};

export const FocusManagerCtx = React.createContext(focusManagerContext);

export function FocusManager(props: FocusManagerProps): JSX.Element {
  return (
    <FocusManagerCtx.Provider value={focusManagerContext}>
      {props.children}
    </FocusManagerCtx.Provider>
  );
}
