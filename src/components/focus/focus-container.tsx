import * as React from 'react';
import { FocusManagerCtx } from './focus-manager';
import { FocusElementContext } from './focus-element';
import { sortTabIndex } from './sort';
export interface FocusContainerContextProps {
  readonly tabIndex?: number;
}
export class FocusContainerContext implements FocusContainerContextProps {
  private readonly elements: FocusElementContext[] = [];
  public readonly tabIndex?: number;

  public constructor(props: FocusContainerContextProps = {}) {
    this.tabIndex = props.tabIndex;
  }

  public addElement(fmec: FocusElementContext): void {
    this.elements.push(fmec.clone((this.elements.length + 1) * -1));
  }

  public getElements(): FocusElementContext[] {
    return sortTabIndex(this.elements);
  }

  public clone(tabIndex: number): FocusContainerContext {
    if (typeof this.tabIndex === 'number') {
      tabIndex = this.tabIndex;
    }
    return new FocusContainerContext({ tabIndex });
  }
}
export type FocusContainerProps = React.PropsWithChildren<
  FocusContainerContextProps
>;

export const FocusContainerCtx = React.createContext<
  FocusContainerContext | Error
>(new Error('missing FocusContainer'));

export class FocusContainer extends React.Component<FocusContainerProps> {
  private readonly containerCtx: FocusContainerContext;
  public constructor(props: FocusContainerProps) {
    super(props);
    this.containerCtx = new FocusContainerContext(props);
  }

  public render(): JSX.Element {
    return (
      <FocusManagerCtx.Consumer>
        {value => {
          if (value instanceof Error) {
            throw value;
          }
          value.addContainer(this.containerCtx);
          return (
            <FocusContainerCtx.Provider value={this.containerCtx}>
              {this.props.children}
            </FocusContainerCtx.Provider>
          );
        }}
      </FocusManagerCtx.Consumer>
    );
  }
}
