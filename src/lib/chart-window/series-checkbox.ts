import { create, EnterElement, select, Selection, ValueFn } from 'd3-selection';
import { siblingIndexSameClasses, uuid } from '../core';
import { DataHydrateFn } from '../core/utility/data';

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
  const container = data.container ?? 'div';
  const labels = data.labels ?? [];
  const checked = data.checked ?? labels.map((l) => true);
  const disabled = data.disabled;
  const minChecked = data.minChecked || 0;
  const maxChecked = data.maxChecked || Infinity;

  return {
    container,
    labels,
    checked,
    disabled,
    minChecked,
    maxChecked,
  };
}

function checkboxes(seriesData: SeriesCheckbox): Checkbox[] {
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

export type SeriesCheckboxCheckedEvent = CustomEvent<{
  checked: boolean[];
  changedIndex: number;
  changedValue: boolean;
}>;

export function seriesCheckboxRender(selection: Selection<HTMLElement, SeriesCheckbox>): void {
  selection
    .classed('series-checkbox', true)
    .each(function (d) {
      const seriesS = select<HTMLElement, SeriesCheckbox>(this);
      seriesS
        .selectAll<Element, Checkbox>('.checkbox')
        .data(checkboxes(d), (d) => d.label)
        .call((s) => seriesCheckboxJoin(seriesS, s));

      seriesS;
    })
    .on('change.seriescheckbox', function (e, d) {
      const { checked } = d;
      const checkbox = <HTMLInputElement>e.target;
      const changedIndex = siblingIndexSameClasses(checkbox.closest('.checkbox')!);
      const changedValue = checkbox.checked;
      checked[changedIndex] = changedValue;
      select(this).dispatch('checked', { detail: { checked, changedIndex, changedValue } });
    })
    .on('click.seriescheckbox', function (e) {
      if (e.target.classList.contains('checkbox')) e.target.querySelector('input').click();
    });
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
