import { create, select, Selection } from 'd3-selection';
import { menuDropdown } from '../menu-dropdown';
import { SeriesCheckbox, seriesCheckboxData, seriesCheckbox } from '../series-checkbox';

export interface ToolFilterNominal {
  text: string;
  options: string[];
  keys: string[];
}

export function toolFilterNominalData(data: Partial<ToolFilterNominal>): ToolFilterNominal {
  const options = data.options || [];
  return {
    text: data.text || 'Filter',
    options: options,
    keys: data.keys || options,
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
    .on('datachange.toolfilternominal', function (e, toolD) {
      const s = select(this);
      s.selectAll('.text').text(`${toolD.text}`);
      s.selectAll<HTMLUListElement, SeriesCheckbox>('.items').datum((d) => {
        d.labels = toolD.options;
        d.keys = toolD.keys;
        return d;
      });
    })
    .dispatch('datachange');
}
