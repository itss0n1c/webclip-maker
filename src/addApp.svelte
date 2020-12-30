<script lang="ts">

import EntryCell from "./EntryCell.svelte";
import IconHandler from "./IconHandler.svelte";
import { Configs } from "./stores";

	
	let genbutton: HTMLInputElement

	export let id: string
	
	let config = $Configs.find(config => config.id == id)
	
	globalThis.config = config;
	$: payloads = config.webclips;


	
	function parsedDataURL(url: string): {mime: string, data: string} {
		let start = url.indexOf("data:") + 5
		let end = url.indexOf(";base64,")
		let mime = url.substring(start, end)
		let data = url.substr(end + 8, url.length)
		return {
			mime,
			data
		}
	}

	interface IconEvent extends Event {
		detail: {
			icon: string,
			index: number
		}	
	}

	function handleIcon(e: IconEvent) {
		if(typeof e.detail.icon !== "string" || typeof e.detail.index !== "number") return false;
		config.loadIcon(e.detail.index)
	}

	function addPayload() {
		config.webclips = [...config.webclips, {
			name: "",
			icon: null,
			iconurl: "",
			url: ""
		}]
	}

	function removePayload(index: number) { 
		let webclips = [...config.webclips]
		webclips.splice(index, 1)
		config.webclips = [...webclips];
	}

	interface DispatchEvent extends Event {
		detail: {
			[k: string]: any
		}
	}

	function handleCell(event: DispatchEvent) {
		console.log(event)
		if(typeof event.detail.remove !== "boolean") return;
		if(event.detail.remove) {
			console.log(`removing payload ${event.detail.id}`, event.detail, config.webclips[event.detail.id])
			removePayload(event.detail.id)
		}
	}
</script>

<main>
	<form enctype="multipart/form-data">
		<div class="formgroup">
			<input type="text" name="config_name" placeholder="Profile Name" bind:value={config.config_name} required/>
			<input type="text" name="config_author" placeholder="Profile Author" bind:value={config.config_author} required/>
		</div>
			{#each payloads as payload, index}
				<div class="formgroup">
						<EntryCell title="Web App Settings" on:message={handleCell} cellid={index}>
							<input type="text" name="name[{index}]" placeholder="Name" bind:value={config.webclips[index].name} required/>
							<IconHandler index={index} on:message={handleIcon} bind:icon={config.webclips[index].iconurl} />
							<input type="url" name="url[{index}]" placeholder="URL" bind:value={config.webclips[index].url} required/>
						</EntryCell>
				</div>
			{/each}
			<div class="button" on:click={addPayload}>Add App</div>
			<br /><br />

		
	</form>
</main>


<style>
	main {
		margin-top: 1.5rem;
	}	

	.button {
		display: inline;
		background: rgb(72, 72, 223);
		padding-left: 1rem;
		padding-right: 1rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		color: #fff;
		cursor: pointer;
	}
	
</style>
