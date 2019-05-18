import { FocusElementContext } from './focus-element';

export interface FocusAction {
  (elem: FocusElementContext, action: boolean): void;
}

export function HTMLInputElementAction(elem: FocusElementContext, action: boolean) {
  const dom = elem.getRef<HTMLInputElement>();
  if (!(dom instanceof HTMLInputElement)) {
    return;
  }
  if (action) {
    dom.setAttribute('focusAction', 'hasFocus');
  } else {
    dom.removeAttribute('focusAction');
  }
}


export function listBoxAction(elem: FocusElementContext, action: boolean): void {
  const dom = elem.getRef<HTMLLIElement>();
  if (!(dom instanceof HTMLLIElement)) {
    return;
  }
  if (action) {
    dom.setAttribute('aria-selected', 'true');
  } else {
    dom.setAttribute('aria-selected', 'false');
  }
}

export const DefaultFocusActions: FocusAction[] = [];
