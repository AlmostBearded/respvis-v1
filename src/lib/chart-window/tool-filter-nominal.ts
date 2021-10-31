import { create, select, Selection } from 'd3-selection';
import { SeriesCheckboxCheckedEvent } from '.';
import { DataHydrateFn } from '../core/utility/data';
import { menuDropdown } from './menu-dropdown';
import { SeriesCheckbox, seriesCheckboxDataHydrate, seriesCheckbox } from './series-checkbox';

export interface FilterNominalOption {
  name: string;
  shown: boolean;
}

export interface ToolFilterNominal {
  text: string;
  options: string[];
  active: boolean[];
  minActive: number;
  maxActive: number;
}

export function toolFilterNominalDataHydrate(data: Partial<ToolFilterNominal>): ToolFilterNominal {
  const options = data.options || [];
  return {
    text: data.text || 'Filter',
    options: options,
    active: data.active || options.map(() => true),
    minActive: data.minActive || 1,
    maxActive: data.maxActive || Infinity,
  };
}

export type ToolFilterNominalActiveEvent = CustomEvent<{
  active: boolean[];
  changedIndex: number;
  changedValue: boolean;
}>;

export function toolFilterNominal(
  selection: Selection<HTMLLIElement, Partial<ToolFilterNominal>>,
  dataHydrate: DataHydrateFn<ToolFilterNominal> = toolFilterNominalDataHydrate
): void {
  selection
    .classed('tool-filter-nominal', true)
    .call((s) => menuDropdown(s))
    .each(function (d) {
      const toolS = select(this);
      const toolD = dataHydrate(d);
      toolS.selectAll('.text').text(`${toolD.text}`);
      toolS
        .selectAll<HTMLUListElement, SeriesCheckbox>('.items')
        .datum({
          container: 'li',
          labels: toolD.options,
          checked: toolD.active,
          minChecked: toolD.minActive,
          maxChecked: toolD.maxActive,
        })
        .call((s) => seriesCheckbox(s))
        .on(
          'checked.toolfilternominal',
          function ({
            detail: { checked, changedIndex, changedValue },
          }: SeriesCheckboxCheckedEvent) {
            toolS.dispatch('active', {
              detail: { active: checked, changedIndex, changedValue },
            });
          }
        );
    });

  // selection
  //   .on('change.toolfilternominal', (e, d) => {
  //     d.shown = [...items.datum().checked];
  // });
}
