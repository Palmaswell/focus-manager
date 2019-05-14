import * as React from 'react';
import {
  FocusContainerConsumer,
  FocusContainerContext,
} from './focus-container';
import { FocusLifeCycleProvider } from './focus-lifecycle';

// export interface FocusElementContextProps extends SortTabPosition {}
export interface FocusElementContextProps {
  tabIndex?: number;
}

export class FocusElementContext implements FocusElementContextProps {
  public readonly tabIndex?: number;
  public tabPosition: number = 0xeac7;
  public constructor(props: FocusElementContextProps = {}) {
    this.tabIndex = props.tabIndex;
  }

  public setTabPosition(tabPosition: number): FocusElementContext {
    if (typeof this.tabIndex === 'number') {
      this.tabPosition = this.tabIndex;
    } else {
      this.tabPosition = tabPosition;
    }
    return this;
  }

  public setRef(): () => void {
    return () => {};
  }
}

export type FocusElementProps = {
  readonly tabIndex?: number;
  readonly children?: (cb: FocusElementContext) => JSX.Element;
};

export class FocusElementProvider extends FocusLifeCycleProvider<
  FocusContainerContext,
  FocusElementContext,
  { readonly value: FocusElementContext }
> {
  public children: (cb: FocusElementContext) => JSX.Element = () => <></>;
}

// const FocusElementCtx = React.createContext({});

export class FocusElement extends React.Component<FocusElementProps> {
  private readonly elementCtx: FocusElementContext;
  public constructor(props: FocusElementProps) {
    super(props);
    this.elementCtx = new FocusElementContext(props);
  }

  public render(): JSX.Element {
    return (
      <FocusContainerConsumer>
        {focusContainerContext => {
          if (focusContainerContext instanceof Error) {
            throw focusContainerContext;
          }

          return (
            <FocusElementProvider
              containerContext={focusContainerContext}
              elementContext={this.elementCtx}>
              {/* <FocusElementCtx.Consumer>
              {this.props.children}
              </FocusElementCtx.Consumer> */}
            </FocusElementProvider>
          );
        }}
      </FocusContainerConsumer>
    );
  }
}
