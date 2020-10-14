<script>
  import Slider from 'svelte-slider'
  import { onMount } from 'svelte';
  import { store } from '../../store';
  import { push } from 'svelte-spa-router'
  import { controlStyles, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import TabletSetting from './TabletSetting.svelte'
  import { getNextIndex } from './useControl'
  import { get } from 'svelte/store';

  let srcURL = ''
  let video
  store.editableMovie.subscribe((v) => {
    if (v) {
      srcURL = URL.createObjectURL(new Blob([v.buffer], { type: 'video/mp4' }))
    } else {
      srcURL = ''
    }
  })
  onMount(() => {
    if (!srcURL) {
      push('/client')
      return
    }
    
  })
  const a = (e) => {
    console.log(e)
  }
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<style>
  .container {
    position: absolute;
    max-width: 100%;
    max-height: 90%;
  }
  .sliderContainer {
    transform: translateY(-64px);
  }
  :root {
    --sliderPrimary: #FF9800;
    --sliderSecondary: rgba(0, 0, 0, 0.05);
  }
  video {
    width: 100%;
    height: 100%;
  }
</style>

<div class="container">
  <video src="{srcURL}" bind:this="{video}" />
  <div class="sliderContainer">
    <!-- svelte-ignore a11y-media-has-caption -->
    <Slider value={[0, 1]} on:change="{(e) => a(e)}" />
  </div>
</div>
