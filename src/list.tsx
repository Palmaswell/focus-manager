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

export interface ItemProps {
  selected: boolean;
  children: any;
}

export const Item = React.forwardRef<HTMLLIElement, ItemProps>(
  (props: ItemProps, ref): JSX.Element => (
    <li aria-selected={props.selected} role="option" ref={ref}>
      {props.children}
    </li>
  )
);
