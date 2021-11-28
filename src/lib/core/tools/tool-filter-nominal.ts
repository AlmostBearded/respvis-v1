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

  selection.each((d, i, g) => {
    const s = select(g[i]);
    s.selectAll('.text').text(d.text);
    s.selectAll<HTMLUListElement, SeriesCheckbox>('.items')
      .datum(
        seriesCheckboxData({
          container: () => create('li').node()!,
          labels: d.options,
          keys: d.keys,
        })
      )
      .call((s) => seriesCheckbox(s));
  });
}
