import { select, Selection } from 'd3-selection';
import { Position } from '../core/utility/position';
import { Size } from '../core/utils';

export function tooltip(selection: Selection<HTMLDivElement>): void {
  selection
    .classed('tooltip', true)
    .style('opacity', 0)
    .style('background-color', '#fff')
    .style('border', 'solid')
    .style('border-width', '1px')
    .style('border-radius', '5px')
    .style('padding', '0.5em')
    .style('position', 'fixed')
    .style('pointer-events', 'none');
}

export function tooltipSelectOrCreate(): Selection<HTMLDivElement> {
  const tooltipSelection = select<HTMLDivElement, unknown>('.tooltip');
  return tooltipSelection.size() > 0
    ? tooltipSelection
    : select(document.body)
        .append('div')
        .call((s) => tooltip(s));
}

export function tooltipShow(tooltipSelection: Selection<HTMLDivElement> | null) {
  tooltipSelection = tooltipSelection || tooltipSelectOrCreate();
  tooltipSelection.style('opacity', 1);
}

export function tooltipHide(tooltipSelection: Selection<HTMLDivElement> | null) {
  tooltipSelection = tooltipSelection || tooltipSelectOrCreate();
  tooltipSelection.style('opacity', 0);
}

export function tooltipContent(
  tooltipSelection: Selection<HTMLDivElement> | null,
  content: string | Element
) {
  tooltipSelection = tooltipSelection || tooltipSelectOrCreate();
  if (typeof content === 'string') tooltipSelection.html(content);
  else tooltipSelection.html('').append(() => content);
}

export interface TooltipPositionConfig {
  position: Position;
  offset?: number;
  offsetDirection?: Position;
}

export function tooltipPosition(
  tooltipSelection: Selection<HTMLDivElement> | null,
  config: TooltipPositionConfig
) {
  let { position, offset, offsetDirection } = config;
  tooltipSelection = tooltipSelection || tooltipSelectOrCreate();

  offset = offset || 8;

  const windowSize: Size = { width: window.innerWidth, height: window.innerHeight };
  offsetDirection = config.offsetDirection || {
    x: position.x <= windowSize.width / 2 ? 1 : -1,
    y: position.y <= windowSize.height / 2 ? 1 : -1,
  };

  const left = offsetDirection.x >= 0;
  const top = offsetDirection.y >= 0;
  const leftOffset = position.x + offsetDirection.x * offset;
  const rightOffset = windowSize.width - leftOffset;
  const topOffset = position.y + offsetDirection.y * offset;
  const bottomOffset = windowSize.height - topOffset;

  tooltipSelection
    .style(left ? 'right' : 'left', null)
    .style(left ? 'left' : 'right', `${left ? leftOffset : rightOffset}px`)
    .style(top ? 'bottom' : 'top', null)
    .style(top ? 'top' : 'bottom', `${top ? topOffset : bottomOffset}px`);
}
