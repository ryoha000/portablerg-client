<script lang="ts">
  import useSetting, { getControlKeyName } from './useSetting'
  import type { ControlStyle } from "./useSetting";
  import Icon from '../UI/Icon.svelte'

  export let controlStyle: ControlStyle

  const deleteTemplate = async () => {
    if (window.confirm('このテンプレートを削除してもいいですか？')) {
      const { deleteTemplateByID } = useSetting()
      deleteTemplateByID(controlStyle.id)
    }
  }
</script>

<style>
  .deleteButton {
    margin-left: auto;
    color: #CC0000;
    padding: 16px;
    cursor: pointer;
  }
  .types {
    margin-left: 1rem;
  }
  .controlContainer {
    position: relative;
    height: 100%;
    width: 114px; /* height / 9 * 16 */
    border: #2E2E2E solid 1px;
  }
</style>

<div class="controlContainer">
  {#each controlStyle.controls as control}
    <div style="{control.style}" />
  {/each}
</div>
<div class="types">
  {controlStyle.controls.map(v => getControlKeyName(v.type)).join(', ')}
</div>
<div class="deleteButton" on:click="{deleteTemplate}">
  <Icon name="trash-can" size="{32}" />
</div>
