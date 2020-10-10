<script>
	import Router from 'svelte-spa-router'
	import Tablet from './components/Tablet/Tablet.svelte'
	import Login from './components/Tablet/TabletLogin.svelte'
	import TabletSettingLayout from './components/Tablet/TabletSettingLayout.svelte'
	import TabletSettingSort from './components/Tablet/TabletSettingSort.svelte';
	import TabletSettingTemplate from './components/Tablet/TabletSettingTemplate.svelte';
	import { store } from './store';

	let id = ""
	store.me.subscribe(v => id = v)
	const routes = {
		'/': Tablet,
		'/login': Login,
		'/setting/layout': TabletSettingLayout,
		'/setting/template': TabletSettingTemplate,
		'/setting/sort': TabletSettingSort,
	}
</script>

<main>
	<div>id: {id}</div>
	<Router {routes} />
</main>

<style>
	main {
		margin: 0 auto;
		width: 100%;
		height: 100%;
	}
</style>
