import { EnterElement, select, Selection, ValueFn } from 'd3-selection';
import { DataSeriesGenerator, siblingIndexSameClasses, uuid } from '../core';

export interface DataCheckbox {
  label: string;
  checked: boolean;
  disabled: boolean;
}

export interface DataSeriesCheckbox extends DataSeriesGenerator<DataCheckbox> {
  container: string | ValueFn<EnterElement, DataCheckbox, HTMLElement>;
  labels: string[];
  checked: boolean[];
  disabled?: boolean[];
  minChecked: number;
  maxChecked: number;
}

export function dataSeriesCheckbox(data: Partial<DataSeriesCheckbox>): DataSeriesCheckbox {
  return {
    container: data.container || 'div',
    labels: data.labels || [],
    checked: data.checked || [],
    disabled: data.disabled,
    minChecked: data.minChecked || 0,
    maxChecked: data.maxChecked || Infinity,
    dataGenerator: data.dataGenerator || dataSeriesCheckboxGenerator,
  };
}

export function dataSeriesCheckboxGenerator(
  selection: Selection<Element, DataSeriesCheckbox>
): DataCheckbox[] {
  const { labels, checked, disabled, minChecked, maxChecked } = selection.datum();
  const checkedCount = checked.reduce((count, checked) => count + (checked ? 1 : 0), 0);
  return labels.map((l, i) => {
    return {
      label: l,
      checked: checked[i],
      disabled:
        disabled?.[i] ||
        (checked[i] && checkedCount <= minChecked) ||
        (!checked[i] && checkedCount >= maxChecked),
    };
  });
}

export function seriesCheckbox(selection: Selection<HTMLElement, DataSeriesCheckbox>): void {
  selection
    .classed('series-checkbox', true)
    .on('change.seriescheckbox', function (e, d) {
      const checkbox = <HTMLInputElement>e.target;
      const index = siblingIndexSameClasses(checkbox.closest('.checkbox')!);
      select<Element, DataSeriesCheckbox>(this).datum((d) => {
        d.checked[index] = checkbox.checked;
        return d;
      });
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
              .call((s) => series.dispatch('enter', { detail: { selection: s } })),
          undefined,
          (exit) => exit.remove().call((s) => series.dispatch('exit', { detail: { selection: s } }))
        )
        .each((d, i, g) => {
          const s = select(g[i]);
          s.selectChildren('input')
            .attr('checked', <any>d.checked || null)
            .attr('disabled', <any>d.disabled || null);
          s.selectChildren('label').text(d.label);
        })
        .call((s) => series.dispatch('update', { detail: { selection: s } }));
    })
    .dispatch('datachange');
}

// function seriesCheckboxEnsureConstraints(series: Selection<Element, DataSeriesCheckbox>) : void {
//   const checkboxS = select(this).selectAll('input[type=checkbox]'),
//   checkedCheckboxS = checkboxS.filter('[checked=true]'),
//   uncheckedCheckboxS = checkboxS.filter(':not[checked=true]');
// series.checked = checkboxS.properties('checked');
// const checkedCount = d.checked.reduce((count, checked) => count + (checked ? 1 : 0), 0);
// if (checkedCount === d.minChecked) checkedCheckboxS.;

// }
