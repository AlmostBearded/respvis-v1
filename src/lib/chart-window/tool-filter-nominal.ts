import { create, select, Selection } from 'd3-selection';
import { menuDropdown, menuDropdownItem } from './menu-dropdown';
import { DataSeriesCheckbox, dataSeriesCheckbox, seriesCheckbox } from './series-checkbox';

export interface DataFilterNominalOption {
  name: string;
  shown: boolean;
}

export interface DataToolFilterNominal {
  text: string;
  options: string[];
  shown: boolean[];
}

export function dataToolFilterNominal(data: Partial<DataToolFilterNominal>): DataToolFilterNominal {
  const options = data.options || [];
  return {
    text: data.text || 'Filter',
    options: options,
    shown: data.shown || options.map(() => true),
  };
}

export function toolFilterNominal(
  selection: Selection<HTMLLIElement, DataToolFilterNominal>
): void {
  selection.classed('tool-filter-nominal', true).call((s) => menuDropdown(s));

  const items = selection
    .selectAll<HTMLUListElement, DataSeriesCheckbox>('.items')
    .datum(
      dataSeriesCheckbox({
        container: () =>
          create('li')
            .call((s) => menuDropdownItem(s))
            .node()!,
      })
    )
    .call((s) => seriesCheckbox(s));

  selection
    .on('change.toolfilternominal', (e, d) => (d.shown = [...items.datum().checked]))
    .on('datachange.toolfilternominal', function (e, toolD) {
      const s = select(this);
      s.selectAll('.text').text(`${toolD.text}`);
      s.selectAll<HTMLUListElement, DataSeriesCheckbox>('.items').datum((d) => {
        d.labels = toolD.options;
        d.checked = toolD.shown;
        return d;
      });
    })
    .dispatch('datachange');
}
