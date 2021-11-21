import { create, EnterElement, select, Selection, ValueFn } from 'd3-selection';
import { siblingIndexSameClasses } from './utility';
import { v4 as uuid } from 'uuid';

export interface Checkbox {
  container: string | ValueFn<EnterElement, Checkbox, HTMLElement>;
  label: string;
  checked: boolean;
  disabled: boolean;
}

export interface SeriesCheckbox {
  container: string | ValueFn<EnterElement, Checkbox, HTMLElement>;
  labels: string[];
  checked: boolean[];
  disabled?: boolean[];
  minChecked: number;
  maxChecked: number;
}

export function seriesCheckboxData(data: Partial<SeriesCheckbox>): SeriesCheckbox {
  return {
    container: data.container || 'div',
    labels: data.labels || [],
    checked: data.checked || [],
    disabled: data.disabled,
    minChecked: data.minChecked || 0,
    maxChecked: data.maxChecked || Infinity,
  };
}

export function seriesCheckboxCreateCheckboxes(seriesData: SeriesCheckbox): Checkbox[] {
  const { labels, checked, disabled, minChecked, maxChecked, container } = seriesData;
  const checkedCount = checked.reduce((count, checked) => count + (checked ? 1 : 0), 0);
  return labels.map((l, i) => {
    return {
      container: container,
      label: l,
      checked: checked[i],
      disabled:
        disabled?.[i] ||
        (checked[i] && checkedCount <= minChecked) ||
        (!checked[i] && checkedCount >= maxChecked),
    };
  });
}

export function seriesCheckbox(selection: Selection<HTMLElement, SeriesCheckbox>): void {
  selection
    .classed('series-checkbox', true)
    .on('change.seriescheckbox', function (e, d) {
      const checkbox = <HTMLInputElement>e.target;
      const index = siblingIndexSameClasses(checkbox.closest('.checkbox')!);
      select<Element, SeriesCheckbox>(this).datum((d) => {
        d.checked[index] = checkbox.checked;
        return d;
      });
    })
    .on(
      'click.seriescheckbox',
      (e) => e.target.classList.contains('checkbox') && e.target.querySelector('input').click()
    )
    .on('datachange.seriescheckbox', function (e, d) {
      const series = select<HTMLElement, SeriesCheckbox>(this);
      series
        .selectAll<Element, Checkbox>('.checkbox')
        .data(seriesCheckboxCreateCheckboxes(d), (d) => d.label)
        .call((s) => seriesCheckboxJoin(series, s));
    })
    .dispatch('datachange');
}

export function seriesCheckboxJoin(
  seriesSelection: Selection,
  joinSelection: Selection<Element, Checkbox>
): void {
  joinSelection
    .join(
      (enter) =>
        enter
          .append((d, i, g) =>
            d.container instanceof Function
              ? d.container.call(g[i], d, i, g)
              : create(d.container).node()!
          )
          .classed('checkbox', true)
          .each((d, i, g) => {
            const s = select(g[i]),
              id = uuid();
            s.append('input').attr('type', 'checkbox').attr('id', id);
            s.append('label').attr('for', id);
          })
          .call((s) => seriesSelection.dispatch('enter', { detail: { selection: s } })),
      undefined,
      (exit) =>
        exit.remove().call((s) => seriesSelection.dispatch('exit', { detail: { selection: s } }))
    )
    .each((d, i, g) => {
      const s = select(g[i]);
      s.selectChildren('input')
        .attr('checked', <any>d.checked || null)
        .attr('disabled', <any>d.disabled || null);
      s.selectChildren('label').text(d.label);
    })
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}
