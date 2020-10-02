<script lang="ts">
  import { onMount } from 'svelte';
  import { ControlType } from '../useSetting';
  import useKey from './use/useKey';
  import useScroll from './use/useScroll';
  import useTouch from './use/useTouch'

  export let style: string
  export let ws: WebSocket
  export let type: ControlType
  let container: HTMLElement

  onMount(() => {
    switch (type) {
      case ControlType.Panel: {
        const { init } = useTouch(ws)
        init(container)
        break
      }
      case ControlType.Scroll: {
        const { init } = useScroll(ws)
        init(container)
        break
      }
      default: {
        const { init } = useKey(ws)
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
          default: {
            console.error('this control type not supported')
          }
        }
      }
    }
  })
</script>

<div style="{style}" bind:this="{container}" />
