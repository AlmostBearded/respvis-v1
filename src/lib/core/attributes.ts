import { BaseType, select, Selection } from 'd3-selection';
import { Transition } from 'd3-transition';
import { calculateSpecificity } from './utils';

export interface IAttributes {
  [name: string]: string | number | boolean | null;
}

export interface INestedAttributes {
  [name: string]: string | number | boolean | null | INestedAttributes;
}

function _setAttributes(
  selection: Selection<BaseType, unknown, BaseType, unknown>,
  attributes: IAttributes
) {
  for (const name in attributes) {
    const value = attributes[name];
    if (value === null) selection.attr(name, null);
    else selection.attr(name, value);
  }
}

export function setAttributes(selection: Selection<BaseType, IAttributes, BaseType, unknown>) {
  selection.each((attributes, i, groups) => select(groups[i]).call(_setAttributes, attributes));
}

export function setUniformAttributes(
  selection: Selection<BaseType, IAttributes, BaseType, unknown>
) {
  selection.call(_setAttributes, selection.datum());
}

function _transitionAttributes(
  transition: Transition<BaseType, unknown, BaseType, unknown>,
  attributes: IAttributes
) {
  for (const name in attributes) {
    const value = attributes[name];
    if (value === null) transition.attr(name, null);
    else transition.attr(name, value);
  }
}

export function transitionAttributes(
  transition: Transition<BaseType, IAttributes, BaseType, unknown>
) {
  transition.each((attributes, i, groups) =>
    select(groups[i]).transition(transition).call(_transitionAttributes, attributes)
  );
}

export function transitionUniformAttributes(
  transition: Transition<BaseType, IAttributes, BaseType, unknown>
) {
  transition.call(_transitionAttributes, transition.selection().datum());
}

export function _setNestedAttributes(
  selection: Selection<BaseType, unknown, BaseType, unknown>,
  attributes: INestedAttributes
) {
  const selectors: string[] = [];

  for (const name in attributes) {
    const value = attributes[name];
    if (value === null) selection.attr(name, null);
    else if (typeof value === 'object') selectors.push(name);
    else selection.attr(name, value);
  }

  selectors
    .sort((a, b) => calculateSpecificity(a) - calculateSpecificity(b))
    .forEach((selector) =>
      selection.selectAll(selector).call(_setNestedAttributes, attributes[selector])
    );
}

export function setNestedAttributes(
  selection: Selection<BaseType, INestedAttributes, BaseType, unknown>
) {
  selection.each((attributes, i, groups) =>
    select(groups[i]).call(_setNestedAttributes, attributes)
  );
}

export function setUniformNestedAttributes(
  selection: Selection<BaseType, INestedAttributes, BaseType, unknown>
) {
  const attributes = selection.datum();
  selection.call(_setNestedAttributes, attributes);
}

function _transitionNestedAttributes(
  transition: Transition<BaseType, unknown, BaseType, unknown>,
  attributes: INestedAttributes
) {
  const selectors: string[] = [];

  for (const name in attributes) {
    const value = attributes[name];
    if (value === null) transition.attr(name, null);
    else if (typeof value === 'object') selectors.push(name);
    else transition.attr(name, value);
  }

  selectors
    .sort((a, b) => calculateSpecificity(a) - calculateSpecificity(b))
    .forEach((selector) =>
      transition.selectAll(selector).call(_transitionNestedAttributes, attributes[selector])
    );
}

export function transitionNestedAttributes(
  transition: Transition<BaseType, INestedAttributes, BaseType, unknown>
) {
  transition.each((attributes, i, groups) =>
    select(groups[i]).transition(transition).call(_transitionNestedAttributes, attributes)
  );
}

export function transitionUniformNestedAttributes(
  transition: Transition<BaseType, INestedAttributes, BaseType, unknown>
) {
  transition.call(_transitionNestedAttributes, transition.selection().datum());
}
