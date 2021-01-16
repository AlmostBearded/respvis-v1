import TitleTextMixin from '../text/title-text-mixin.js';

export default function TopAxisMixin(GroupComponentConstructor) {
  return class TopAxisMixin extends GroupComponentConstructor {
    init() {
      super.init();
      this.attr('grid-template', 'auto 5 auto / auto');
      this._ticks = this.append(
        respVis.TopTicksComponent.create().attr('grid-area', '3 / 1 / 4 / 2')
      );
      this._title = this.append(
        TitleTextMixin(respVis.TextComponent)
          .create()
          .attr('grid-area', '1 / 1 / 2 / 2')
          .attr('place-self', 'center')
      );
      return this;
    }

    ticks() {
      return this._ticks;
    }

    title() {
      return this._title;
    }
  };
}
