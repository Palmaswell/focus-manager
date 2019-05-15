import * as React from 'react';
import { FocusContainerContext } from './focus-container';
import { sortTabIndex } from './sort';
import { ContainerActions } from './focus-lifecycle';
import {
  KeyboardManagerConsumer,
  KeyboardManagerContext,
  TestKeyDown,
} from '../keyboard/keyboard';

export class FocusManagerContext
  implements ContainerActions<FocusContainerContext> {
  private readonly containers: FocusContainerContext[] = [];
  private readonly registerKeyTest: Map<
    string,
    { count: number; kCtx: KeyboardManagerContext }
  > = new Map();
  // Testing only
  private readonly keyActions: TestKeyDown[] = [];

  public addContainer(fmcc: FocusContainerContext): void {
    this.containers.push(
      fmcc.setTabPosition((this.containers.length + 1) * -1)
    );
  }

  public deleteContainer(fmcc: FocusContainerContext): void {
    const idx = this.containers.indexOf(fmcc);
    // console.log('delete:', idx, fmcc, this.containers);
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

  public readonly keyAction = (ev: KeyboardEvent) => {
    this.keyActions.forEach(fn => fn(ev));
    return false;
  };

  public registerKeyboard(
    kCtx: KeyboardManagerContext,
    keyAction?: TestKeyDown
  ) {
    if (keyAction) {
      this.keyActions.push(keyAction);
    }
    const my = this.registerKeyTest.get(kCtx.id);
    if (!my) {
      kCtx.registerKeyDownTest(this.keyAction);
      this.registerKeyTest.set(kCtx.id, {
        count: 0,
        kCtx,
      });
    } else {
      my.count++;
    }
  }

  public unregisterKeyboard(
    kCtx: KeyboardManagerContext,
    keyAction?: TestKeyDown
  ) {
    if (keyAction) {
      const idx = this.keyActions.indexOf(keyAction);
      if (idx >= 0) {
        this.keyActions.splice(idx, 1);
      }
    }
    const my = this.registerKeyTest.get(kCtx.id);
    if (!my) {
      throw new Error('unregister called before register');
    }
    my.count--;
    if (my.count === 0) {
      kCtx.unregisterKeyTest(this.keyAction);
      this.registerKeyTest.delete(kCtx.id);
    }
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
  readonly keyAction?: TestKeyDown;
}>;
export const FocusManagerConsumer = FocusManagerCtx.Consumer;

// export function FocusManager(props: FocusManagerProps): JSX.Element {
//   return (
//     <FocusManagerProvider
//       reset={props.reset}
//       focusManagerContext={focusManagerContext}>
//       {props.children}
//     </FocusManagerProvider>
//   );
// }

export type FocusManagerProviderProps = React.PropsWithChildren<
  FocusManagerProps
>;

interface InternalFocusManagerProviderProps extends FocusManagerProviderProps {
  readonly keyboardManagerContext: KeyboardManagerContext;
}

class InternalFocusManagerProvider extends React.Component<
  InternalFocusManagerProviderProps
> {
  constructor(props: InternalFocusManagerProviderProps) {
    super(props);
    if (props.reset) {
      focusManagerContext.clearContainers();
    }
  }
  public componentWillMount() {
    focusManagerContext.registerKeyboard(
      this.props.keyboardManagerContext,
      this.props.keyAction
    );
  }
  public componentWillUnmount() {
    focusManagerContext.unregisterKeyboard(
      this.props.keyboardManagerContext,
      this.props.keyAction
    );
  }

  public render(): JSX.Element {
    return (
      <FocusManagerCtx.Provider value={focusManagerContext}>
        {this.props.children}
      </FocusManagerCtx.Provider>
    );
  }
}

export function FocusManager(props: FocusManagerProps) {
  return (
    <KeyboardManagerConsumer>
      {keyboardManagerContext => (
        <InternalFocusManagerProvider
          {...props}
          keyboardManagerContext={keyboardManagerContext}>
          {props.children}
        </InternalFocusManagerProvider>
      )}
    </KeyboardManagerConsumer>
  );
}
