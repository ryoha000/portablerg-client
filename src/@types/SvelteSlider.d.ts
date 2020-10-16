declare module 'svelte-slider' {
  type SliderEvent = CustomEvent<SliderData>
  type SliderData = [number, number]
  export default class Slider {
    constructor (change: () => SliderEvent, value: SliderData)
    $on
    $$prop_def
  }
}
