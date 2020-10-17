<script lang="ts">
  import Dialog from './Dialog.svelte'
  import LoginButton from '../UI/LoginButton.svelte';
  import { createEventDispatcher } from 'svelte';
  import { HsvPicker } from 'svelte-color-picker';

  let style = ''

  let isOpenDialog = false
  const openDialog = (e: MouseEvent) => {
    style = `top: ${e.y}px; left: ${e.x}px;`
    isOpenDialog = true
    e.stopPropagation()
  }
  const closeDialog = (e: Event) => {
    console.log('close')
    isOpenDialog = false
    e.stopPropagation()
  }

  const dispatch = createEventDispatcher();
  const colorCallback = (e: CustomEvent<{ r: number, g: number, b: number, a: number}>) => {
    const rgba = [e.detail.r, e.detail.g, e.detail.b, e.detail.a]
    dispatch('color', { rgba: rgba })
  }
  const stop = (e: Event) => {
    e.stopPropagation()
  }
</script>

<LoginButton label="色を変更" iconName="palette" on:click="{openDialog}" />
{#if isOpenDialog}
  <Dialog style="{style}" on:close="{closeDialog}">
    <div on:click="{stop}">
      <HsvPicker on:colorChange={colorCallback} startColor={"#FBFBFB"}/>
    </div>
  </Dialog>
{/if}
