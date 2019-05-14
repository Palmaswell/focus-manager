import * as React from 'react';
import { FocusContainerContext } from './focus-container';
import { sortTabIndex } from './sort';
import { ContainerActions } from './focus-lifecycle';

export class FocusManagerContext
  implements ContainerActions<FocusContainerContext> {
  private readonly containers: FocusContainerContext[] = [];

  public addContainer(fmcc: FocusContainerContext): void {
    this.containers.push(
      fmcc.setTabPosition((this.containers.length + 1) * -1)
    );
  }

  public deleteContainer(fmcc: FocusContainerContext): void {
    const idx = this.containers.indexOf(fmcc);
    console.log('delete:', idx, fmcc, this.containers);
    if (idx >= 0) {
      this.containers.splice(idx, 1);
    }
  }

  public getContainers(): FocusContainerContext[] {
    return sortTabIndex(this.containers);
  }
  public clearContainers() {
    this.containers.splice(0);
  }

  public add(e: FocusContainerContext): void {
    this.addContainer(e);
  }

  public del(e: FocusContainerContext): void {
    this.deleteContainer(e);
  }
}

const focusManagerContext = new FocusManagerContext();

const FocusManagerCtx = React.createContext<FocusManagerContext | Error>(
  new Error('Missing FocusManager')
);

export type FocusManagerProps = React.PropsWithChildren<{
  readonly reset?: boolean;
}>;
export const FocusManagerConsumer = FocusManagerCtx.Consumer;

export function FocusManager(props: FocusManagerProps): JSX.Element {
  return (
    <FocusManagerProvider
      reset={props.reset}
      focusManagerContext={focusManagerContext}>
      {props.children}
    </FocusManagerProvider>
  );
}

export interface FocusManagerProviderProps {
  // readonly focusContainerContext: FocusContainerContext;
  readonly focusManagerContext: FocusManagerContext;
  readonly reset?: boolean;
}

export class FocusManagerProvider extends React.Component<
  FocusManagerProviderProps
> {
  constructor(props: FocusManagerProviderProps) {
    super(props);
    if (props.reset) {
      props.focusManagerContext.clearContainers();
    }
  }
  public render(): JSX.Element {
    return (
      <FocusManagerCtx.Provider value={this.props.focusManagerContext}>
        {this.props.children}
      </FocusManagerCtx.Provider>
    );
  }
}
