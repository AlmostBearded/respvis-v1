import TitleTextMixin from '../text/title-text-mixin.js';
import VerticalTextMixin from '../text/vertical-text-mixin.js';

export default function RightAxisMixin(GroupComponentConstructor) {
  return class RightAxisMixin extends GroupComponentConstructor {
    init() {
      super.init();
      this.attr('grid-template', 'auto / auto 5 auto');
      this._ticks = this.append(
        respVis.RightTicksComponent.create().attr('grid-area', '1 / 1 / 2 / 2')
      );
      this._title = this.append(
        VerticalTextMixin(TitleTextMixin(respVis.TextComponent))
          .create()
          .attr('grid-area', '1 / 3 / 2 / 4')
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
