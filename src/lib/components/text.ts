import { Selection, BaseType } from 'd3-selection';
import { IComponent } from '../component';
import { ILayout, ILayoutElement } from '../layout/layout';
import { Alignment, IAlignable } from '../layout/utils';
import { Aligner, IAligner } from '../legend/legend';

export interface IText extends IComponent, IAlignable {
  text(text: string): this;
  text(): string;
}

export class Text implements IText {
  private _selection: Selection<ILayoutElement, unknown, BaseType, unknown>;
  private _text: string = '';
  private _aligner: IAligner = new Aligner();

  text(text: string): this;
  text(): string;
  text(text?: string): any {
    if (text === undefined) return this._text;
    this._text = text;
    return this;
  }

  alignSelf(alignment: Alignment): this {
    this._aligner.alignSelf(alignment);
    if (this._selection) {
      this._aligner.apply(this._selection);
    }
    return this;
  }

  justifySelf(alignment: Alignment): this {
    this._aligner.justifySelf(alignment);
    if (this._selection) {
      this._aligner.apply(this._selection);
    }
    return this;
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = selection.append('text');
    this._selection.node()!.layoutStyle = { width: 'min-content', height: 'min-content' };
    this._aligner.apply(this._selection);
    this.render(0);
    return this;
  }

  fitInLayout(layout: ILayout): this {
    return this;
  }

  render(transitionDuration: number): this {
    this._selection.text(this._text);
    return this;
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }

  renderOrder(): number {
    return 0;
  }
}

export function text(): Text {
  return new Text();
}
