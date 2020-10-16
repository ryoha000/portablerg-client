<script lang="ts">
  import Slider from 'svelte-slider'
  import { onMount } from 'svelte';
  import { store } from '../../store';
  import { push } from 'svelte-spa-router'
  import useTabletMovie, { movieDuration } from './use/useTabletMovie'
  import TextButton from '../UI/TextButton.svelte'

  let srcURL = ''
  let video: HTMLMediaElement
  store.editableMovie.subscribe((v) => {
    if (v) {
      srcURL = URL.createObjectURL(new Blob([v.buffer], { type: 'video/mp4' }))
    }
  })
  const { init, change, confirmSave, togglePlay } = useTabletMovie()
  onMount(() => {
    init(video)
  })
  let m = ''
  store.message.subscribe(v => m = v)
  
  let played = false
  const firstPlay = (e: Event) => {
    e.stopPropagation()
    played = true
    togglePlay()
  }
</script>

<style>
  .container {
    position: relative;
    max-width: 100%;
    max-height: 90%;
  }
  .sliderContainer {
    transform: translateY(-64px);
    --sliderPrimary: #efd562;
		--sliderSecondary: rgba(0, 0, 0, 0.05);
    width: 90%;
    position: absolute;
    left: 5%;
  }
  .duration {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btnContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  video {
    width: 100%;
    height: 100%;
  }
  .layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>

{#if !played}
  <div class="layer" on:click="{firstPlay}"></div>
{/if}
<!-- svelte-ignore a11y-media-has-caption -->
<div class="container">
  <div>{m}</div>
  <video src="{srcURL}" bind:this="{video}" on:click="{togglePlay}" />
  <div class="sliderContainer">
    <Slider value={[0, 1]} on:change="{change}" />
  </div>
  <div class="duration">
    <div>動画時間: {Math.floor($movieDuration / 60)}:{('0' + Math.floor($movieDuration % 60)).slice(-2)}</div>
  </div>
  <div class="btnContainer">
    <TextButton label="キャンセル" on:click="{() => push('/client')}" />
    <TextButton label="確定" on:click="{confirmSave}" />
  </div>
</div>
