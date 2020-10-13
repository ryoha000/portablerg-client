<script lang="ts">
  import { onMount } from 'svelte';
  import { playVideo, confirm} from '../../lib/utils'
  import { controlStyles, windowStyle } from './useSetting'
  import TabletControl from './TabletControl.svelte'
  import { store } from '../../store';
  import TabletSetting from './TabletSetting.svelte'
  import { getNextIndex } from './useControl'
  import { get } from 'svelte/store';

  let remoteVideo: HTMLMediaElement
  let dc: RTCDataChannel | null = null
  store.dataChannel.subscribe(v => dc = v)
  let isTabletMode = false
  store.isTabletMode.subscribe(v => isTabletMode = v)
  let index = 0
  let isIOS = false
  store.isIOS.subscribe(v => isIOS = v)

  onMount(() => {
    store.remoteVideoElement.set(remoteVideo)
    const remoteVideoStream: MediaStream | null = get(store.remoteVideoStream)
    if (remoteVideoStream) {
      if (!isIOS) {
        playVideo(remoteVideo, remoteVideoStream)
      } else {
        confirm(remoteVideo, remoteVideoStream)
      }
    }
  })
  const trans = async (e: CustomEvent<{ num: 1 | -1}>) => {
    const next = getNextIndex(index, e.detail.num)
    index = next
  }
  const play = () => {
    store.remoteVideoElement.set(remoteVideo)
    const remoteVideoStream: MediaStream | null = get(store.remoteVideoStream)
    if (remoteVideoStream) {
      playVideo(remoteVideo, remoteVideoStream)
    }
  }
</script>

<style>
  .container {
    position: relative;
    user-select: none;
    width: 100%;
    height: 100%;
  }
  .window {
    z-index: -1;
  }
  button {
    position: absolute;
    z-index: 10;
  }
</style>

<div class="container">
  {#if dc && !isTabletMode}
    {#each $controlStyles as controlStyle, i}
      {#if i === index}
        <TabletControl {dc} {controlStyle} on:trans="{trans}" />
      {/if}
    {/each}
  {/if}
  {#if isIOS}
    <button on:click="{play}" on:touchstart="{play}">play</button>
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
  <TabletSetting />
</div>
