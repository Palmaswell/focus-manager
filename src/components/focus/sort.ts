// import { FocusContainerContext } from './focus-container';
// import { FocusElementContext } from './focus-element';

export function sortTabIndex(arr: any[]): any[] {
  return arr.sort((ax, bx) => {
    const a = ax.tabIndex;
    const b = bx.tabIndex;
    if (typeof a !== 'number') {
      return -1;
    }
    if (typeof b !== 'number') {
      return 1;
    }
    if (a >= 0 && b >= 0) {
      return a - b;
    }
    if (a < 0 && b < 0) {
      return -1 * a - -1 * b;
    }
    if (a < 0 && b >= 0) {
      return 1;
    }
    if (a >= 0 && b < 0) {
      return -1;
    }
    throw new Error('Should neve reach');
  });
}
