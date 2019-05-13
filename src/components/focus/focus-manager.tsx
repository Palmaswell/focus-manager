import * as React from 'react';
import { FocusContainerContext } from './focus-container';
import { sortTabIndex } from './sort';

export class FocusManagerContext {
  private readonly containers: FocusContainerContext[] = [];
  public addContainer(fmcc: FocusContainerContext): void {
    this.containers.push(fmcc.clone((this.containers.length + 1) * -1));
  }
  public getContainers(): FocusContainerContext[] {
    return sortTabIndex(this.containers);
  }
}

export type FocusManagerProps = React.PropsWithChildren<{}>;

const focusManagerContext = new FocusManagerContext();

export const FocusManagerCtx = React.createContext<FocusManagerContext | Error>(
  new Error('Missing FocusManager')
);

export function FocusManager(props: FocusManagerProps): JSX.Element {
  return (
    <FocusManagerCtx.Provider value={focusManagerContext}>
      {props.children}
    </FocusManagerCtx.Provider>
  );
}
