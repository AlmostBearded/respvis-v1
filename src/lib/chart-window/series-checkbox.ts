import { EnterElement, select, Selection, ValueFn } from 'd3-selection';
import { DataSeriesGenerator, uuid } from '../core';

export interface DataCheckbox {
  label: string;
  checked: boolean;
}

export interface DataSeriesCheckbox extends DataSeriesGenerator<DataCheckbox> {
  container: string | ValueFn<EnterElement, DataCheckbox, HTMLElement>;
  labels: string[];
  checked: boolean[];
}

export function dataSeriesCheckbox(data: Partial<DataSeriesCheckbox>): DataSeriesCheckbox {
  return {
    container: data.container || 'div',
    labels: data.labels || [],
    checked: data.checked || [],
    dataGenerator: data.dataGenerator || dataSeriesCheckboxGenerator,
  };
}

export function dataSeriesCheckboxGenerator(
  selection: Selection<Element, DataSeriesCheckbox>
): DataCheckbox[] {
  const seriesDatum = selection.datum();
  return seriesDatum.labels.map((l, i) => ({ label: l, checked: seriesDatum.checked[i] }));
}

export function seriesCheckbox(selection: Selection<HTMLElement, DataSeriesCheckbox>): void {
  selection
    .classed('series-checkbox', true)
    .on('change.seriescheckbox', function (e, d) {
      d.checked = select(this).selectAll('input[type=checkbox]').properties('checked');
    })
    // toggle checkbox by clicking on on containers
    .on(
      'click.seriescheckbox',
      (e) => e.target.classList.contains('checkbox') && e.target.querySelector('input').click()
    )
    .on('datachange.seriescheckbox', function (e, d) {
      const series = select<HTMLElement, DataSeriesCheckbox>(this);
      series
        .selectAll<Element, DataCheckbox>('.checkbox')
        .data(d.dataGenerator(series), (d) => d.label)
        .join(
          (enter) =>
            enter
              .append(d.container as any)
              .classed('checkbox', true)
              .each((d, i, g) => {
                const s = select(g[i]),
                  id = uuid();
                s.append('input').attr('type', 'checkbox').attr('id', id);
                s.append('label').attr('for', id);
              })
              .call((s) => series.dispatch('checkboxenter', { detail: { selection: s } })),
          undefined,
          (exit) =>
            exit.remove().call((s) => series.dispatch('checkboxexit', { detail: { selection: s } }))
        )
        .each((d, i, g) => {
          const s = select(g[i]);
          s.selectChildren('input').property('checked', d.checked);
          s.selectChildren('label').text(d.label);
        })
        .call((s) => series.dispatch('checkboxupdate', { detail: { selection: s } }));
    })
    .dispatch('datachange');
}
