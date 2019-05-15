import * as React from 'react';

interface TestKeyDown {
  (ev: KeyboardEvent): boolean;
}
class KeyboardManagerContext {
  private testKeyDowns: TestKeyDown[] = [];
  private document?: Document;

  public injectDocument(document: Document) {
    if (this.document !== document) {
      console.log('blub,', document.body);
      document.body.addEventListener('keydown', (ev: KeyboardEvent) => {
        console.log('fooooooooo', ev, ev.key, ev.keyCode);
        this.testKeyDowns.forEach(t => t(ev));
      });
      this.document = document;
    }
  }

  public registerKeyDownTest(t: TestKeyDown) {
    this.testKeyDowns.push(t);
  }
}
const keyboardManagerContext = new KeyboardManagerContext();
const KeyboardManagerCtx = React.createContext<KeyboardManagerContext>(
  keyboardManagerContext
);

export const KeyboardManagerConsumer = KeyboardManagerCtx.Consumer;

export type KeyboardManagerProps = React.PropsWithChildren<{
  readonly document?: Document;
}>;

export function KeyboardManager(props: KeyboardManagerProps) {
  return (
    <KeyboardManagerCtx.Provider value={keyboardManagerContext}>
      {props.children}
    </KeyboardManagerCtx.Provider>
  );
}
