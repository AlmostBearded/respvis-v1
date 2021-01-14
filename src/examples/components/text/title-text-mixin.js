export default function TitleTextMixin(ComponentConstructor) {
  return class TitleTextMixin extends ComponentConstructor {
    init() {
      return super.init().attr('letter-spacing', '0.5em').attr('font-weight', 'bold');
    }
  };
}
