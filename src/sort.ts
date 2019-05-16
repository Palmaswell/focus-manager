export interface SortTabPosition {
  readonly tabPosition?: number;
}
export function sortTabIndex<T extends SortTabPosition>(arr: T[]): T[] {
  return arr.sort((ax, bx) => {
    const a = ax.tabPosition;
    const b = bx.tabPosition;
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
