<script lang="ts">
  import Dialog from './Dialog.svelte'
  import LoginButton from '../UI/LoginButton.svelte';
  import { ControlType, getAddControlWords } from './useSetting';

  let style = ''

  let isOpenDialog = false
  const openDialog = (e: MouseEvent) => {
    isOpenDialog = true
    style = `top: ${e.y}; left: ${e.x};`
    e.stopPropagation()
  }
  const closeDialog = (e: Event) => {
    isOpenDialog = false
    e.stopPropagation()
  }

  const existed = Object.values(ControlType).map(() => false)
  const addControlItem = (type: ControlType) => {
    if (existed[type]) return
    // moromoro
    existed[type] = true
  }
</script>

<style>
  .settingItem {
    border-bottom: rgba(0, 0, 0, 0.7) solid 1px;
    padding: 1rem;
    cursor: pointer;
  }
  .disable {
    opacity: 0.5;
  }
  .settingItem:last-of-type {
    border-bottom: 0;
  }
</style>

<LoginButton label="アイテムを追加" iconName="plus-thick" on:click="{openDialog}" />
{#if isOpenDialog}
  <Dialog style="{style}" on:close="{closeDialog}">
    {#each Object.values(ControlType) as type}
      <div
        on:click="{() => {addControlItem(type)}}"
        class="settingItem {existed[type] ? 'disable' : ''}"
      >
        {getAddControlWords(type)}
      </div>
    {/each}
  </Dialog>
{/if}
