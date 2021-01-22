import { BaseComponent } from '../base-component';
import { Chart } from '../chart';
import { Component } from '../component';
import { ContainerComponent } from './container-component';

export class GroupComponent extends ContainerComponent {
  constructor() {
    super('g');
  }
}
