<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { controlStyles } from './useSetting';
  import useSort, { overIndex } from './useSort'
  import { push } from 'svelte-spa-router'
  import SettingToggleButton from '../UI/SettingToggleButton.svelte'
  import TabletSettingSortItem from './TabletSettingSortItem.svelte'
  import TextButton from '../UI/TextButton.svelte'
  import useDB from '../../lib/useDB'
  import { store } from '../../store';
  import type { TabletSetting } from './useSetting';

  let container: HTMLElement
  const set: TabletSetting | null = get(store.setting)
  let elements: (null | HTMLElement)[] = set ? set.controlTemplates.map(() => null) : Array(999).map(() => null)
  onMount(async () => {
    const { init, setupElements } = useSort(container)
    await init()
    for (const [i, ele] of Object.values(elements).entries()) {
      if (ele) {
        setupElements(ele, i)
      }
    }
  })
  const confirm = async () => {
    const { sortTemplate } = useDB()
    await sortTemplate()
    push('/client')
  }
</script>

<style>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .thumbnailContainer {
    height: 64px;
    padding: 16px;
    display: flex;
    align-items: center;
    max-width: 100%;
    width: 480px;
  }
  .over {
    border: #0099CC dashed 2px;
  }
</style>

<SettingToggleButton iconName="close" />
<div class="container" bind:this="{container}">
  <div class="thumbnailContainer"></div>
  {#each $controlStyles as controlStyle, i}
    <div class="{$overIndex === i ? 'over' : ''}">
      <div class="thumbnailContainer" bind:this="{elements[i]}">
        <TabletSettingSortItem {controlStyle} />
      </div>
    </div>
  {/each}
  <TextButton on:click="{confirm}" on:touchstart="{confirm}" label="確定" />
</div>
