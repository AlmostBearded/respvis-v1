import { select, Selection } from 'd3-selection';
import { uuid } from '.';

export function clipByItself(selection: Selection<SVGElement, unknown, SVGElement, unknown>): void {
  selection.each((d, i, groups) => {
    const element = groups[i];
    const parentElement = element.parentNode! as SVGElement;

    let elementId = element.getAttribute('id');
    if (!elementId) {
      elementId = uuid.v4();
      element.setAttribute('id', elementId);
    }

    let clipId = uuid.v4();

    select(parentElement)
      .append('clipPath')
      .attr('id', clipId)
      .append('use')
      .attr('xlink:href', `#${elementId}`);

    select(element).attr('clip-path', `url(#${clipId})`);
  });
}
