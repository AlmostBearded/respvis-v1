import { Component, nullComponent } from '../component';
import { Selection } from 'd3-selection';
import { nullFunction } from '../utils';

// The CSS properties that are needed for layouting
var layoutProperties = [
  'width',
  'height',
  'display',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridColumnStart',
  'gridColumnEnd',
  'gridRowStart',
  'gridRowEnd',
  'justifyItems',
  'alignItems',
  'justifySelf',
  'alignSelf',
];

export interface Layout extends Component {
  components(components?: Component[]): Component[] | Layout;
}

export function layout(): Layout {
  let _components: Component[] = [nullComponent()];
  let _updateComponents = nullFunction;
  let _resize = nullFunction;

  function renderedLayout(selection: Selection<SVGElement, unknown, HTMLElement, unknown>) {
    for (let i = 0; i < _components.length; ++i) {
      _components[i](selection);
    }

    _resize = function (): void {
      for (let i = 0; i < _components.length; ++i) {
        _components[i].resize();
      }
    };

    _updateComponents = function (): void {};
  }

  renderedLayout.resize = function resize() : void {
    _resize();
  };

  renderedLayout.components = function (components?: Component[]): Component[] | Layout {
    if (!arguments.length) return _components;
    _components = components || [nullComponent()];
    _updateComponents();
    return renderedLayout;
  };

  return renderedLayout;
}
