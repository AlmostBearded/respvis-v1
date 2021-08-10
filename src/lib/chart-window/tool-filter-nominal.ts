import { create, select, Selection } from 'd3-selection';
import { menuDropdown } from './menu-dropdown';
import { SeriesCheckbox, seriesCheckboxData, seriesCheckbox } from './series-checkbox';

export interface FilterNominalOption {
  name: string;
  shown: boolean;
}

export interface ToolFilterNominal {
  text: string;
  options: string[];
  shown: boolean[];
  minShown: number;
  maxShown: number;
}

export function toolFilterNominalData(data: Partial<ToolFilterNominal>): ToolFilterNominal {
  const options = data.options || [];
  return {
    text: data.text || 'Filter',
    options: options,
    shown: data.shown || options.map(() => true),
    minShown: data.minShown || 1,
    maxShown: data.maxShown || Infinity,
  };
}

export function toolFilterNominal(selection: Selection<HTMLLIElement, ToolFilterNominal>): void {
  selection.classed('tool-filter-nominal', true).call((s) => menuDropdown(s));

  const items = selection
    .selectAll<HTMLUListElement, SeriesCheckbox>('.items')
    .datum(
      seriesCheckboxData({
        container: () => create('li').node()!,
      })
    )
    .call((s) => seriesCheckbox(s));

  selection
    .on('change.toolfilternominal', (e, d) => {
      d.shown = [...items.datum().checked];
    })
    .on('datachange.toolfilternominal', function (e, toolD) {
      const s = select(this);
      s.selectAll('.text').text(`${toolD.text}`);
      s.selectAll<HTMLUListElement, SeriesCheckbox>('.items').datum((d) => {
        d.labels = toolD.options;
        d.checked = toolD.shown;
        d.minChecked = toolD.minShown;
        d.maxChecked = toolD.maxShown;
        return d;
      });
    })
    .dispatch('datachange');
}
