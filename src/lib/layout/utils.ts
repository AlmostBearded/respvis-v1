export enum Alignment {
  Start = 'start',
  Center = 'center',
  End = 'end',
  Stretch = 'stretch',
}

export interface IAlignable {
  alignSelf(alignment: Alignment): this;
  justifySelf(alignment: Alignment): this;
}
