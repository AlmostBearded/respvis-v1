import { select, Selection } from 'd3-selection';

const resizeEventDispatcher = new ResizeObserver((entries) => {
  entries.forEach((entry) =>
    select(entry.target).dispatch('resize', {
      detail: { size: entry.target.getBoundingClientRect() },
    })
  );
});

export function resizeEventListener(selection: Selection<Element>): void {
  selection.each((d, i, g) => resizeEventDispatcher.observe(g[i]));
}
