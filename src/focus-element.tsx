import * as React from 'react';
import {
  FocusContainerConsumer,
  FocusContainerContext,
} from './focus-container';
import { FocusLifeCycleProvider } from './focus-lifecycle';

export interface FocusElementContextProps {
  readonly focus?: boolean;
  readonly selected?: boolean;
  readonly tabIndex?: number;
}

type DoubleSetErrorRefFunc<T> = (t: T) => void;
export type FocusElementProps = React.ConsumerProps<FocusElementContext> & FocusElementContextProps;

class DoubleSetErrorRef<T = unknown> implements React.RefObject<T> {
  private _current: T | null = null;


  public static create<T>() {
    return new DoubleSetErrorRef<T>();
  }

  public readonly refFunc: DoubleSetErrorRefFunc<T> = (t: T) => {
    this.current = t;
  }

  public get current(): T | null {
    return this._current;
  }

  public set current(c: T | null) {
    if (this._current && c && this._current !== c) {
      throw new Error(`Double Assign Ref:${this._current}:${c}`);
    }
    this._current = c;
  }
}

export class FocusElementContext implements FocusElementContextProps {
  public readonly tabIndex?: number;
  private _focus: boolean = false;
  public selected: boolean;
  public tabPosition: number = 0xeac7;
  private ref = DoubleSetErrorRef.create();

  public constructor(props: FocusElementContextProps = {}) {
    this.selected = props.selected || false;
    this.tabIndex = props.tabIndex;
    this.focus = !!props.focus;
  }

  public get focus(): boolean {
    return this._focus;
  }

  public set focus(f: boolean) {
    this._focus = f;
  }

  public select(): void {
    this.selected = true;
  }

  public deSelect(): void {
    this.selected = false;
  }

  public setTabPosition(tabPosition: number): FocusElementContext {
    if (typeof this.tabIndex === 'number') {
      this.tabPosition = this.tabIndex;
    } else {
      this.tabPosition = tabPosition;
    }
    return this;
  }

  public refFunc<T>(): DoubleSetErrorRefFunc<T> {
    return this.ref.refFunc;
  }

  public getRef<T>(): T | null {
    return this.ref.current as T | null;
  }

  public getSelect(): boolean {
    return this.selected;
  }
}

export class FocusElementProvider extends FocusLifeCycleProvider<
  FocusContainerContext,
  FocusElementContext
> {}
const FocusElementCtx = React.createContext<FocusElementContext>(new FocusElementContext());

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
              elementContext={this.elementCtx}
              provider={FocusElementCtx.Provider}
             >
              <FocusElementCtx.Consumer>
                {this.props.children}
              </FocusElementCtx.Consumer>
            </FocusElementProvider>
          );
        }}
      </FocusContainerConsumer>
    );
  }
}
