import * as React from 'react';
import { FocusManagerConsumer, FocusManagerContext } from './focus-manager';
import { FocusElementContext } from './focus-element';
import { sortTabIndex } from './sort';
import * as uuid from 'uuid';
import { FocusLifeCycleProvider, ContainerActions } from './focus-lifecycle';
export interface FocusContainerContextProps {
  readonly tabIndex?: number;
}
export class FocusContainerContext
  implements FocusContainerContextProps, ContainerActions<FocusElementContext> {
  private readonly elements: FocusElementContext[] = [];
  public readonly tabIndex?: number;
  public tabPosition: number = 0xeac7;
  public readonly id = uuid.v4();

  public constructor(props: FocusContainerContextProps = {}) {
    this.tabIndex = props.tabIndex;
  }

  public addElement(fmec: FocusElementContext): void {
    this.elements.push(fmec.setTabPosition((this.elements.length + 1) * -1));
  }

  public deleteElement(fmcc: FocusElementContext): void {
    const idx = this.elements.indexOf(fmcc);
    if (idx >= 0) {
      this.elements.splice(idx, 1);
    }
  }

  public getElements(): FocusElementContext[] {
    return sortTabIndex(this.elements);
  }

  public setTabPosition(tabPosition: number): FocusContainerContext {
    if (typeof this.tabIndex === 'number') {
      this.tabPosition = this.tabIndex;
    } else {
      this.tabPosition = tabPosition;
    }
    return this;
  }

  public add(fmec: FocusElementContext) {
    this.addElement(fmec);
  }

  public del(fmec: FocusElementContext) {
    this.deleteElement(fmec);
  }
}
export type FocusContainerProps = React.PropsWithChildren<
  FocusContainerContextProps
>;

const FocusContainerCtx = React.createContext<FocusContainerContext | Error>(
  new Error('missing FocusContainer')
);

export const FocusContainerConsumer = FocusContainerCtx.Consumer;

export class FocusContainerProvider extends FocusLifeCycleProvider<
  FocusManagerContext,
  FocusContainerContext
> {}

export class FocusContainer extends React.Component<FocusContainerProps> {
  private readonly containerCtx: FocusContainerContext;
  public constructor(props: FocusContainerProps) {
    super(props);
    this.containerCtx = new FocusContainerContext(props);
  }

  public render(): JSX.Element {
    return (
      <FocusManagerConsumer>
        {focusManagerContext => {
          if (focusManagerContext instanceof Error) {
            throw focusManagerContext;
          }
          return (
            <FocusContainerProvider
              containerContext={focusManagerContext}
              elementContext={this.containerCtx}
              provider={FocusContainerCtx.Provider}>
              {this.props.children}
            </FocusContainerProvider>
          );
        }}
      </FocusManagerConsumer>
    );
  }
}

// export interface FocusContainerProviderProps {
//   // readonly focusContainerContext: FocusContainerContext;
//   readonly focusManagerContext: FocusManagerContext | Error;
// }

// export class FocusContainerProvider extends React.Component<
//   FocusContainerProviderProps
// > {
//   constructor(props: FocusContainerProviderProps) {
//     super(props);
//     if (props.focusManagerContext instanceof Error) {
//       throw props.focusManagerContext;
//     }
//   }
//   public componentDidMount() {}
//   public componentWillUnmount() {}
//   public render(): JSX.Element {
//     return (
//       <FocusManagerConsumer>
//         {_ => (
//           <FocusContainerProvider value={focusContainerContext}>
//             {this.props.children}
//           </FocusContainerProvider>
//         )}
//       </FocusManagerConsumer>
//     );
//   }
// }
