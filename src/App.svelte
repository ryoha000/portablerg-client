<script>
	import { onMount } from 'svelte';
	import Router from 'svelte-spa-router'
	import Tablet from './components/Tablet/Tablet.svelte'
	import Login from './components/Tablet/TabletLogin.svelte'
	import TabletSettingLayout from './components/Tablet/TabletSettingLayout.svelte'
	import TabletSettingSort from './components/Tablet/TabletSettingSort.svelte';
	import TabletSettingTemplate from './components/Tablet/TabletSettingTemplate.svelte';
	import useSetting from './components/Tablet/useSetting'
	import useWebRTC from './lib/webRTC'
	import { store } from './store';

	onMount(async () => {
		const { init } = useSetting()
		await init()
		const { setupWS } = useWebRTC()
		setupWS()
	})
	const routes = {
		'/': Login,
		'/login': Login,
		'/client': Tablet,
		'/setting/layout': TabletSettingLayout,
		'/setting/template': TabletSettingTemplate,
		'/setting/sort': TabletSettingSort,
	}
</script>

<main>
	<Router {routes} />
</main>

<style>
	main {
		margin: 0 auto;
		width: 100%;
		height: 100%;
	}
</style>
