import TitleTextMixin from '../text/title-text-mixin.js';

export default function BottomAxisMixin(GroupComponentConstructor) {
  return class BottomAxisMixin extends GroupComponentConstructor {
    init() {
      super.init();
      this.attr('grid-template', 'auto 5 auto / auto');
      this._ticks = this.append(
        respVis.BottomTicksComponent.create().attr('grid-area', '1 / 1 / 2 / 2')
      );
      this._title = this.append(
        TitleTextMixin(respVis.TextComponent)
          .create()
          .attr('grid-area', '3 / 1 / 4 / 2')
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
