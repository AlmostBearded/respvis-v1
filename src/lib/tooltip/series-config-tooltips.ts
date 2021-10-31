import { select, Selection } from 'd3-selection';
import { DataHydrateFn } from '../core/utility/data';
import {
  tooltipContent,
  tooltipHide,
  tooltipPosition,
  TooltipPositionConfig,
  tooltipShow,
} from './tooltip';

export interface SeriesConfigTooltipsHydrated<ItemElement extends Element, ItemDatum> {
  tooltipsEnabled: boolean;
  tooltips: (item: ItemElement, data: ItemDatum) => string | Element;
  tooltipPosition: (
    item: ItemElement,
    data: ItemDatum,
    mouseEvent: MouseEvent
  ) => TooltipPositionConfig;
}

export type SeriesConfigTooltips<ItemElement extends Element, ItemDatum> = Partial<
  SeriesConfigTooltipsHydrated<ItemElement, ItemDatum>
>;

export function seriesConfigTooltipsDataHydrate<ItemElement extends Element, ItemDatum>(
  data: SeriesConfigTooltips<ItemElement, ItemDatum>
): SeriesConfigTooltipsHydrated<Element, any> {
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
  seriesSelection: Selection<Element, Partial<SeriesConfigTooltips<ItemElement, ItemDatum>>>,
  dataHydrate: DataHydrateFn<
    SeriesConfigTooltips<ItemElement, ItemDatum>,
    SeriesConfigTooltipsHydrated<ItemElement, ItemDatum>
  > = seriesConfigTooltipsDataHydrate,
  seriesItemFinder?: (eventTarget: Element) => ItemElement | null
): void {
  seriesSelection
    .on('mouseover.tooltip', (e, d) => {
      const { tooltips, tooltipsEnabled } = dataHydrate(d);
      const item = seriesItemFinder ? seriesItemFinder(<Element>e.target) : <ItemElement>e.target;
      if (!tooltipsEnabled || !item) return;
      const data = select<ItemElement, ItemDatum>(item).datum();
      tooltipShow(null);
      tooltipContent(null, tooltips(item, data));
    })
    .on('mousemove.tooltip', (e: MouseEvent, d) => {
      const { tooltipsEnabled, tooltipPosition: position } = dataHydrate(d);
      const item = seriesItemFinder ? seriesItemFinder(<Element>e.target) : <ItemElement>e.target;
      if (!tooltipsEnabled || !item) return;
      const data = select<ItemElement, ItemDatum>(item).datum();
      tooltipPosition(null, position(item, data, e));
    })
    .on('mouseout.tooltip', (e: MouseEvent, d) => {
      const { tooltipsEnabled } = dataHydrate(d);
      if (tooltipsEnabled) tooltipHide(null);
    });
}
