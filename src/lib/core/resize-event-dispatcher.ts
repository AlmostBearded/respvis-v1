import { select, Selection } from 'd3-selection';
import { Rect } from './utility/rect';

export type ResizeEvent = CustomEvent<{ bounds: Rect }>;

const resizeEventDispatcher = new ResizeObserver((entries) => {
  entries.forEach((entry) =>
    select(entry.target).dispatch('resize', {
      detail: { bounds: entry.target.getBoundingClientRect() },
    })
  );
});

export function resizeEventListener(selection: Selection<Element>): void {
  selection.each((d, i, g) => resizeEventDispatcher.observe(g[i]));
}
