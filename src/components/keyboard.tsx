import * as React from 'react';
import * as uuid from 'uuid';

export interface TestKeyDown {
  (ev: KeyboardEvent): boolean;
}
export class KeyboardManagerContext {
  public readonly id = uuid.v4();
  private testKeyDowns: TestKeyDown[] = [];
  private document?: Document;

  public injectDocument(document: Document) {
    if (this.document !== document) {
      document.body.addEventListener('keydown', (ev: KeyboardEvent) => {
        this.testKeyDowns.forEach(t => t(ev));
      });
      this.document = document;
    }
  }

  public registerKeyDownTest(t: TestKeyDown) {
    this.testKeyDowns.push(t);
  }
  public unregisterKeyTest(t: TestKeyDown) {
    const found = this.testKeyDowns.indexOf(t);
    if (found < 0) {
      throw new Error('Try unregister does not exists');
    }
    this.testKeyDowns.splice(found, 1);
  }
}
const keyboardManagerContext = new KeyboardManagerContext();
const KeyboardManagerCtx = React.createContext<KeyboardManagerContext>(
  keyboardManagerContext
);

export const KeyboardManagerConsumer = KeyboardManagerCtx.Consumer;

export type KeyboardInjectDocumentProps = React.PropsWithChildren<{
  readonly document: Document;
}>;

export function KeyboardInjectDocument(props: KeyboardInjectDocumentProps) {
  return (
    <KeyboardManagerCtx.Consumer>
      {ctx => {
        ctx.injectDocument(props.document);
        return props.children;
      }}
    </KeyboardManagerCtx.Consumer>
  );
}

export type KeyboardManagerProps = React.PropsWithChildren<{
  readonly document?: Document;
}>;

export type RegisterKeyDownTestProps = React.PropsWithChildren<{
  readonly testFn: TestKeyDown;
}>;
interface InternalRegisterKeyDownTestProps extends RegisterKeyDownTestProps {
  readonly keyboardManagerContext: KeyboardManagerContext;
}
class InternalRegisterKeyDownTest extends React.Component<
  InternalRegisterKeyDownTestProps
> {
  public componentDidMount() {
    this.props.keyboardManagerContext.registerKeyDownTest(this.props.testFn);
  }
  public componentWillUnmount() {
    this.props.keyboardManagerContext.unregisterKeyTest(this.props.testFn);
  }
  public render() {
    return <>{this.props.children}</>;
  }
}

export function RegisterKeyDownTest(props: RegisterKeyDownTestProps) {
  return (
    <KeyboardManagerConsumer>
      {ctx => (
        <InternalRegisterKeyDownTest {...props} keyboardManagerContext={ctx}>
          {props.children}
        </InternalRegisterKeyDownTest>
      )}
    </KeyboardManagerConsumer>
  );
}

export function KeyboardManager(props: KeyboardManagerProps) {
  return (
    <KeyboardManagerCtx.Provider value={keyboardManagerContext}>
      {props.children}
    </KeyboardManagerCtx.Provider>
  );
}
