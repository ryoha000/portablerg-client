<script lang="ts">
  import { onMount } from 'svelte';
  import { ControlType } from '../useSetting';
  import useKey from './use/useKey';
  import useScroll from './use/useScroll';
  import useTouch from './use/useTouch'

  export let style: string
  export let dc: RTCDataChannel | null
  export let type: ControlType
  export let rootContainer: HTMLDivElement
  let container: HTMLElement

  onMount(() => {
    if (!dc) return
    switch (type) {
      case ControlType.Panel: {
        const { init } = useTouch(dc, rootContainer)
        init(container)
        break
      }
      case ControlType.Scroll: {
        const { init } = useScroll(dc, rootContainer)
        init(container)
        break
      }
      default: {
        const { init } = useKey(dc, rootContainer)
        switch (type) {
          case ControlType.Enter: {
            init(container, 'enter')
            break
          }
          case ControlType.Up: {
            init(container, 'up')
            break
          }
          case ControlType.Down: {
            init(container, 'down')
            break
          }
          case ControlType.Left: {
            init(container, 'left')
            break
          }
          case ControlType.Right: {
            init(container, 'right')
            break
          }
          case ControlType.Control: {
            init(container, 'control')
            break
          }
          default: {
            console.error('this control type not supported')
          }
        }
      }
    }
  })
</script>

<div style="{style}" bind:this="{container}" />
