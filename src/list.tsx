import * as React from 'react';

export interface ListProps {
  tabIndex: number;
  activedescendant?: string;
  onKeyPress?: () => void;
}

export class List extends React.Component<ListProps> {
  private readonly refList: React.RefObject<
    HTMLUListElement
  > = React.createRef();

  public render(): JSX.Element {
    const { activedescendant, tabIndex } = this.props;
    return (
      <ul
        aria-activedescendant={activedescendant}
        ref={this.refList}
        role="listbox"
        tabIndex={tabIndex}>
        {this.props.children}
      </ul>
    );
  }
}

export interface ListItemProps {
  selected: boolean;
  children: any;
}

export function ListItem(props: ListItemProps): JSX.Element {
  return (
    <li aria-selected={props.selected} role="option">
      {props.children}
    </li>
  );
}
