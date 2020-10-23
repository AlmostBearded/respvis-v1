import { select, BaseType } from 'd3-selection';
import { active, Transition } from 'd3-transition';

export function chainedTransition<T extends BaseType>(node: T): Transition<T, unknown, BaseType, unknown> {
  const activeTransition = active(node);
  return activeTransition ? activeTransition.transition() : select(node).transition();
}
