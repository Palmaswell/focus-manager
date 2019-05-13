import * as React from 'react';
import { FocusContainerCtx } from './focus-container';

export interface FocusElementContextProps {
  tabIndex?: number;
}

export class FocusElementContext {
  public readonly tabIndex?: number;
  public constructor(props: FocusElementContextProps = {}) {
    this.tabIndex = props.tabIndex;
  }
  public clone(tabIndex: number): FocusElementContext {
    if (typeof this.tabIndex === 'number') {
      tabIndex = this.tabIndex;
    }
    return new FocusElementContext({ tabIndex });
  }
}

export type FocusElementProps = React.PropsWithChildren<
  FocusElementContextProps
>;

export class FocusElement extends React.Component<FocusElementProps> {
  private readonly elementCtx: FocusElementContext;
  public constructor(props: FocusElementProps) {
    super(props);
    this.elementCtx = new FocusElementContext(props);
  }
  public render(): JSX.Element {
    return (
      <FocusContainerCtx.Consumer>
        {value => {
          if (value instanceof Error) {
            throw value;
          }
          value.addElement(this.elementCtx);
          return this.props.children;
        }}
      </FocusContainerCtx.Consumer>
    );
  }
}
