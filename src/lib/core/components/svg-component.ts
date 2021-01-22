import { BaseComponent } from '../base-component';
import { Chart } from '../chart';
import { Component } from '../component';
import { ContainerComponent } from './container-component';

export class SVGComponent extends ContainerComponent {
  constructor() {
    super('svg');
  }
}
