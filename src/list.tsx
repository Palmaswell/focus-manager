import * as React from 'react'

export interface ListProps {
  onKeyPress?: () => void
}

export class List extends React.Component<ListProps> {
  private attachKeyPress = (c: HTMLUListElement) => {
    console.log('attach')
    c.addEventListener('keypress', () => {
      console.log('hi^^^^^')
      return this.props.onKeyPress || (() => {})
    })
  }

  public render(): JSX.Element {
    return <ul ref={this.attachKeyPress}>{this.props.children}</ul>
  }
}

export function ListItem(props: React.PropsWithChildren<unknown>): JSX.Element {
  // tabIndex JSDOM Fuckup
  return <li tabIndex={0}>{props.children}</li>
}
