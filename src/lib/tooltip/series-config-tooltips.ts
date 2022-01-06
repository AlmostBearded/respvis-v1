import { select, Selection } from 'd3';
import {
  tooltipContent,
  tooltipHide,
  tooltipPosition,
  TooltipPositionConfig,
  tooltipShow,
} from './tooltip';

export interface SeriesConfigTooltips<ItemElement extends Element, ItemDatum> {
  tooltipsEnabled: boolean;
  tooltips: (item: ItemElement, data: ItemDatum) => string | Element;
  tooltipPosition: (
    item: ItemElement,
    data: ItemDatum,
    mouseEvent: MouseEvent
  ) => TooltipPositionConfig;
}

export function seriesConfigTooltipsData<ItemElement extends Element, ItemDatum>(
  data: Partial<SeriesConfigTooltips<ItemElement, ItemDatum>>
): SeriesConfigTooltips<Element, any> {
  return {
    tooltipsEnabled: data.tooltipsEnabled ?? true,
    tooltips: data.tooltips || ((data) => 'Tooltip'),
    tooltipPosition:
      data.tooltipPosition ||
      ((item, data, mouseEvent) => ({
        position: { x: mouseEvent.clientX, y: mouseEvent.clientY },
      })),
  };
}

export function seriesConfigTooltipsHandleEvents<ItemElement extends Element, ItemDatum>(
  seriesSelection: Selection<Element, SeriesConfigTooltips<ItemElement, ItemDatum>>,
  seriesItemFinder?: (eventTarget: Element) => ItemElement | null
): void {
  seriesSelection
    .on('mouseover.tooltip', (e, d) => {
      const { tooltips, tooltipsEnabled } = d;
      const item = seriesItemFinder ? seriesItemFinder(<Element>e.target) : <ItemElement>e.target;
      if (!tooltipsEnabled || !item) return;
      const data = select<ItemElement, ItemDatum>(item).datum();
      tooltipShow(null);
      tooltipContent(null, tooltips(item, data));
    })
    .on('mousemove.tooltip', (e: MouseEvent, d) => {
      const { tooltipsEnabled, tooltipPosition: position } = d;
      const item = seriesItemFinder ? seriesItemFinder(<Element>e.target) : <ItemElement>e.target;
      if (!tooltipsEnabled || !item) return;
      const data = select<ItemElement, ItemDatum>(item).datum();
      tooltipPosition(null, position(item, data, e));
    })
    .on('mouseout.tooltip', (e: MouseEvent, d) => {
      const { tooltipsEnabled } = d;
      if (tooltipsEnabled) tooltipHide(null);
    });
}
