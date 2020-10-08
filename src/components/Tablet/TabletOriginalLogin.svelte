<script lang="ts">
  import TextButton from '../UI/TextButton.svelte';
  import useFirebase from './use/useFirebase'

  let id: string = ""
  const { original } = useFirebase()
  const confirm = () => {
    if (id === "") {
      alert("idを入力してください")
      return
    }
    original(id)
  }
</script>

<style>
  .inputs {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .input {
    margin-right: 1rem;
  }
</style>

<div>
  <h3>IDを指定してログイン</h3>
  <div>PC側も同じIDを入力して下さい</div>
  <div>IDが重複したときあなたのPCと他のユーザーがつながる可能性があります</div>
  <div class="inputs">
    <input bind:value="{id}" class="input" />
    <TextButton label="確定" on:click="{confirm}" />
  </div>
</div>
