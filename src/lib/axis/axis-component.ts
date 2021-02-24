import { Component, TextComponent } from '../core';
import { TicksComponent } from './ticks-component';

export interface AxisComponent extends Component {
  title(): TextComponent;
  ticks(): TicksComponent;
}
