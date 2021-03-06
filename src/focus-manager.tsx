import * as React from 'react';
import * as uuid from 'uuid';
import { FocusContainerContext } from './focus-container';
import { sortTabIndex } from './sort';
import { ContainerActions } from './focus-lifecycle';
import {
  KeyboardManagerConsumer,
  KeyboardManagerContext,
  KeydownEv,
} from '@palmaswelll/keyboard-manager';
import { FocusElementContext } from './focus-element';
import { FocusAction, DefaultFocusActions } from './focus-actions';

export type FocusManagerProps = React.PropsWithChildren<{
  readonly reset?: boolean;
  readonly keyAction?: KeydownEv;
  readonly focusActions?: FocusAction[];
}>;

export type FocusManagerProviderProps = React.PropsWithChildren<
  FocusManagerProps
>;

interface InternalFocusManagerProviderProps extends FocusManagerProviderProps {
  readonly keyboardManagerContext: KeyboardManagerContext;
}

export class FocusManagerContext
  implements ContainerActions<FocusContainerContext> {
  public readonly id: string = uuid.v4();
  private readonly containers: FocusContainerContext[] = [];
  private readonly registerKeyTest: Map<
    string,
    { count: number; kCtx: KeyboardManagerContext }
  > = new Map();
  public readonly focusActions: Set<FocusAction> = new Set(DefaultFocusActions);
  // This property for testing
  private readonly keyActions: KeydownEv[] = [];

  public addContainer(fmcc: FocusContainerContext): void {
    this.containers.push(
      fmcc.setTabPosition((this.containers.length + 1) * -1)
    );
  }

  public deleteContainer(fmcc: FocusContainerContext): void {
    const idx = this.containers.indexOf(fmcc);
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

  public getElements(): FocusElementContext[] {
    return this.getContainers().reduce((p: FocusElementContext[], c) => {
      return p.concat(c.getElements());
    }, []);
  }

  public mergeFocusActions(actions: FocusAction[]) {
    actions.forEach(a => this.focusActions.add(a));
  }

  private setFocus(element: FocusElementContext, action: boolean) {
    element.focus = action;
    this.focusActions.forEach(ac => {
      ac(element, action);
    });
  }

  private setSelect(element: FocusElementContext, action: boolean) {
    this.focusActions.forEach(ac => {
      ac(element, action);
    });
  }

  private handleSelect(): void {
    const elements: FocusElementContext[] = this.getElements();
    const idx = elements.findIndex(i => i.focus);
    if (elements.length <= 0) {
      return;
    }
    if (idx < 0) {
      return;
    }
    const prevIdx = elements.findIndex(i => i.selected);
    const element = elements[idx];
    if (element.selected) {
      return;
    }
    if (prevIdx >= 0) {
      elements[prevIdx].deSelect();
      this.setSelect(element, false);
    }
    element.select();
    this.setSelect(element, true);
  }

  private focusDirection(dir: 1 | -1) {
    const elements = this.getElements();
    if (elements.length <= 0) {
      return;
    }
    if (elements.length === 1) {
      elements[0].focus = true;
      return;
    }

    let idx = elements.findIndex(i => i.focus);
    let prevIdx = idx;
    if (idx < 0 && dir > 0) {
      prevIdx = idx = 0;
    } else if (idx < 0 && dir < 0) {
      prevIdx = idx = elements.length - 1;
    } else if (idx + dir === elements.length) {
      idx = 0;
    } else if (idx + dir < 0) {
      idx = elements.length - 1;
    } else {
      idx += dir;
    }
    this.setFocus(elements[prevIdx], false);
    this.setFocus(elements[idx], true);
  }

  public readonly keyAction = (ev: KeyboardEvent) => {
    this.keyActions.forEach(fn => fn(ev));
    let action = ev.key;

    if (ev.key === 'Tab') {
      if (ev.shiftKey) {
        action = 'ArrowUp';
      } else {
        action = 'ArrowDown';
      }
    }

    switch (action) {
      case 'ArrowDown':
        this.focusDirection(1);
        break;
      case 'ArrowUp':
        this.focusDirection(-1);
        break;
      case 'Space':
        this.handleSelect();
        break;
      case 'Enter':
        this.handleSelect();
        break;
      default:
        break;

    }
    return false;
  };

  public registerKeyboard(
    keyCtx: KeyboardManagerContext,
    keyAction?: KeydownEv
  ) {
    if (keyAction) {
      this.keyActions.push(keyAction);
    }

    const my = this.registerKeyTest.get(keyCtx.id);
    if (!my) {
      keyCtx.registerKeyDownTest(this.keyAction);
      this.registerKeyTest.set(keyCtx.id, {
        count: 0,
        kCtx: keyCtx,
      });
    } else {
      my.count++;
    }
  }

  public unregisterKeyboard(
    keyCtx: KeyboardManagerContext,
    keyAction?: KeydownEv
  ) {
    if (keyAction) {
      const idx = this.keyActions.indexOf(keyAction);
      if (idx >= 0) {
        this.keyActions.splice(idx, 1);
      }
    }

    const my = this.registerKeyTest.get(keyCtx.id);

    if (!my) {
      throw new Error('unregister called before register');
    }

    my.count--;
    if (my.count < 0) {
      keyCtx.unregisterKeyTest(this.keyAction);
      this.registerKeyTest.delete(keyCtx.id);
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
export const FocusManagerConsumer = FocusManagerCtx.Consumer;

class InternalFocusManagerProvider extends React.Component<
  InternalFocusManagerProviderProps
> {
  constructor(props: InternalFocusManagerProviderProps) {
    super(props);
    focusManagerContext.mergeFocusActions(props.focusActions || []);
    if (props.reset) {
      focusManagerContext.clearContainers();
    }
  }

  public componentDidMount() {
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
