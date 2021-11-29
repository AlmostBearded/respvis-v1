import { create, EnterElement, select, Selection, ValueFn } from 'd3-selection';
import { v4 as uuid } from 'uuid';

export interface Checkbox {
  container: string | ValueFn<EnterElement, Checkbox, HTMLElement>;
  label: string;
  key: string;
}

export interface SeriesCheckbox {
  container: string | ValueFn<EnterElement, Checkbox, HTMLElement>;
  labels: string[];
  keys: string[];
}

export function seriesCheckboxData(data: Partial<SeriesCheckbox>): SeriesCheckbox {
  const labels = data.labels || [];
  return {
    container: data.container || 'div',
    labels,
    keys: data.keys || labels,
  };
}

export function seriesCheckboxCreateCheckboxes(seriesData: SeriesCheckbox): Checkbox[] {
  const { labels, container, keys } = seriesData;
  return labels.map((l, i) => {
    return {
      container: container,
      label: l,
      key: keys[i],
    };
  });
}

export function seriesCheckbox(selection: Selection<HTMLElement, SeriesCheckbox>): void {
  selection
    .classed('series-checkbox', true)
    .on(
      'click.seriescheckbox',
      (e) => e.target.classList.contains('checkbox') && e.target.querySelector('input').click()
    )
    .each((d, i, g) => {
      const seriesS = select<HTMLElement, SeriesCheckbox>(g[i]);
      seriesS
        .selectAll<Element, Checkbox>('.checkbox')
        .data(seriesCheckboxCreateCheckboxes(d), (d) => d.label)
        .call((s) => seriesCheckboxJoin(seriesS, s));
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
            s.append('input').attr('type', 'checkbox').attr('id', id).attr('checked', true);
            s.append('label').attr('for', id);
          })
          .call((s) => seriesSelection.dispatch('enter', { detail: { selection: s } })),
      undefined,
      (exit) =>
        exit.remove().call((s) => seriesSelection.dispatch('exit', { detail: { selection: s } }))
    )
    .each((d, i, g) => {
      const s = select(g[i]).attr('data-key', d.key);
      s.selectChildren('label').text(d.label);
    })
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}
