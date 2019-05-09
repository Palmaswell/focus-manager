import * as React from 'react';

export interface ListProps {
  tabIndex: number;
  onKeyPress?: () => void;
}

export class List extends React.Component<ListProps> {
  private readonly refList: React.RefObject<
    HTMLUListElement
  > = React.createRef();
  // private attachKeyPress = (c: HTMLUListElement) => {
  //   console.log('attach')
  //   c.addEventListener('keypress', () => {
  //     console.log('hi^^^^^')
  //     return this.props.onKeyPress || (() => {})
  //   })
  // }

  public render(): JSX.Element {
    const { tabIndex } = this.props;
    return (
      <ul ref={this.refList} role="listbox" tabIndex={tabIndex}>
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
    <li aria-selected={props.selected} role="option" tabIndex={0}>
      {props.children}
    </li>
  );
}
