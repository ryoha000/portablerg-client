<script lang="ts">
  import { onMount } from 'svelte';
  import { playVideo } from '../../lib/utils'
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
  let container: HTMLDivElement

  onMount(() => {
    if (!get(store.me)) {
      window.location.href = '/'
    }
    store.container.set(container)
    store.remoteVideoElement.set(remoteVideo)
    const remoteVideoStream: MediaStream | null = get(store.remoteVideoStream)
    if (remoteVideoStream && !isIOS) {
      playVideo(remoteVideo, remoteVideoStream)
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

<div class="container" bind:this="{container}">
  {#if dc && container && !isTabletMode}
    {#each $controlStyles as controlStyle, i}
      {#if i === index}
        <TabletControl {dc} {controlStyle} on:trans="{trans}" {container} />
      {/if}
    {/each}
  {/if}
  {#if isIOS}
    <button on:click="{play}" on:touchstart="{play}">play</button>
  {/if}
  {#if !dc}
    接続中
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this="{remoteVideo}" autoplay style="{$windowStyle}" class="window"></video>
  <TabletSetting />
</div>
