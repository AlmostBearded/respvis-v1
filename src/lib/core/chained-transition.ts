import { select, BaseType } from 'd3-selection';
import { active, Transition } from 'd3-transition';

export function chainedTransition(
  node: BaseType
): Transition<BaseType, unknown, BaseType, unknown> {
  const activeTransition = active(node);
  return activeTransition ? activeTransition.transition() : select(node).transition();
}
