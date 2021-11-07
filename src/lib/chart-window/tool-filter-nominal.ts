import { create, select, Selection } from 'd3-selection';
import { SeriesCheckboxCheckedEvent } from '.';
import { DataHydrateFn } from '../core/utility/data';
import { menuDropdownRender } from './menu-dropdown';
import { SeriesCheckbox, seriesCheckboxData, seriesCheckboxRender } from './series-checkbox';

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

export function toolFilterNominalData(data: Partial<ToolFilterNominal>): ToolFilterNominal {
  const options = data.options || [];
  const text = data.text || 'Filter';
  const active = data.active || options.map(() => true);
  const minActive = data.minActive || 1;
  const maxActive = data.maxActive || Infinity;
  return { text, options, active, minActive, maxActive };
}

export type ToolFilterNominalActiveEvent = CustomEvent<{
  active: boolean[];
  changedIndex: number;
  changedValue: boolean;
}>;

export function toolFilterNominalRender(
  selection: Selection<HTMLLIElement, Partial<ToolFilterNominal>>,
  dataHydrate: DataHydrateFn<ToolFilterNominal> = toolFilterNominalData
): void {
  selection
    .classed('tool-filter-nominal', true)
    .call((s) => menuDropdownRender(s))
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
        .call((s) => seriesCheckboxRender(s))
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
