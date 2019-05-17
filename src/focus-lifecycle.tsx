import * as React from 'react';

export interface ContainerActions<EC> {
  add(e: EC): void;
  del(e: EC): void;
}

export interface FocusLifeCycleProviderProps<
  CC extends ContainerActions<EC>,
  EC
> {
  readonly elementContext: EC;
  readonly containerContext: CC;
  readonly provider?: React.ExoticComponent<React.ProviderProps<EC>>;
}

const DefaultProvider: React.ExoticComponent<
  React.ProviderProps<{}>
> = (() => {
  const fn = (props: React.ProviderProps<{}>) => {
    return <>{props.children}</>;
  };
  fn.$$typeof = Symbol();
  return fn;
})();

export class FocusLifeCycleProvider<
  CC extends ContainerActions<EC>,
  EC
> extends React.Component<FocusLifeCycleProviderProps<CC, EC>> {
  private readonly provider: React.ExoticComponent<React.ProviderProps<EC>>;
  public constructor(props: FocusLifeCycleProviderProps<CC, EC>) {
    super(props);
    if (props.provider) {
      this.provider = props.provider;
    } else {
      this.provider = DefaultProvider;
    }
  }
  public componentDidMount(): void {
    this.props.containerContext.add(this.props.elementContext);
  }
  public componentWillUnmount(): void {
    this.props.containerContext.del(this.props.elementContext);
  }
  public render(): JSX.Element {
    return (
      <this.provider value={this.props.elementContext}>
        <>{this.props.children}</>
      </this.provider>
    );
  }
}
