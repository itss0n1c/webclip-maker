<script lang="ts">
import AddApp from "./addApp.svelte";
import { onMount } from "svelte";
import { Configs, removeConfigLS } from "./stores";
import { Config } from "./mcgen";

onMount(() => {
	console.log($Configs)
})

let currentConfig: Config

let configs = $Configs;

let showModal = false
let save_button: HTMLDivElement
let import_input: HTMLInputElement

function createProfile() {
	const config = new Config();
	$Configs.push(config)
	config.save()
	configs = [...$Configs];
	currentConfig = config;
	showModal = true;
}

function closeProfile() {
	currentConfig = undefined;
	showModal = false;
}

function getConfig(id): Config {
	let found: Config[] = []
	for(let config of $Configs) {
		if(config.id == id) {
			found.push(config)
		}
	}
	return found[0]
}

function loadConfig(id: string): Config {
	if(typeof localStorage[`mconfig-${id}`] === "undefined") throw 404;
	let config = new Config(id)
	config.load(localStorage.getItem(`mconfig-${id}`))
	$Configs.push(config)
	configs = [...$Configs]
	return config;
}

function openConfig(e: MouseEvent) {
	let el = e.target as HTMLDivElement;
	//console.log(el, el.parentElement)
	if(el.id.length == 0 && el.parentElement.id.length > 0) {
		el = el.parentElement as HTMLDivElement;
	}
	//console.log(el)
	let id = [...el.attributes].find(el => el.name == "id").value
	let config = getConfig(id)
	console.log(config)
	currentConfig = config;
	//console.log(currentConfig)
	showModal = true;
}

function saveCurrent() {
	if(typeof currentConfig === "undefined") return;
	save_button.innerHTML = "Saving...";
	let id = currentConfig.id;
	for(let config of $Configs) {
		if(config.id == id) {
			config.save();
		}
	}
	save_button.innerHTML = "Saved!";
	configs = [...$Configs]
	setTimeout(() => save_button.innerHTML = '<i class="far fa-save"></i>', 1000)
}

function ClickForConfig(e: MouseEvent): Config {
	let el = e.target as HTMLDivElement;
	if(el.id.length == 0 && el.parentElement.id.length > 0) {
		el = el.parentElement as HTMLDivElement;
	}

	let id = [...el.attributes].find(el => el.name == "id").value
	let config = getConfig(id)
	return config;
}

function downloadConfig(e: MouseEvent) {
	let config = ClickForConfig(e)
	let compiled = config.compile()
	let blob = new Blob([compiled], {type: "application/xml"})
	let url = URL.createObjectURL(blob)
	window.open(url, "_blank")
}

function installConfig(e: MouseEvent) {
	let config = ClickForConfig(e)
	console.log(config)
	let compiled = config.compile()
	let blob = new Blob([compiled], {type: "application/x-apple-aspen-config"})
	let url = URL.createObjectURL(blob)
	window.open(url, "_blank")
}

function deleteConfig(e: MouseEvent) {
	let config = ClickForConfig(e)
	if(confirm(`Are you sure you would like to remove the Config "${config.config_name}"? This action cannot be undone`)) {
		console.log(config)
		$Configs.splice($Configs.findIndex(c => c.id == config.id), 1)
		removeConfigLS(config.id)
		configs = [...$Configs]
	}
}

function genString(length = 10): string {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

async function importProfile() {
	let file = import_input.files[0]
	let reader = new FileReader()
	let data: string
	reader.onload = async (e) => {
		data = e.target.result as string;
		let id = genString();
		let mconfig = await (await fetch(data)).text()
		//console.log(mconfig)
		localStorage.setItem(`mconfig-${id}`, mconfig)
		let config = loadConfig(id)
		console.log(config)
	}
	reader.readAsDataURL(file)
}

function openImport() {
	import_input.click()
}

</script>

<main>
	<section class="header">
		<h1>Webclip Maker</h1>
	</section>
	<section>
		<input type="file" accept=".mobileconfig" bind:this={import_input} on:change={importProfile} hidden/>
		<div class="button" on:click={createProfile}>Create</div>
		<div class="button" on:click={openImport}>Import</div>
		<h3>Saved Configurations</h3>
		{#each configs as config}
			<div class="cell">
				<div class="info">
					<p>{config.config_name || "Untitled Config"}</p>
					<p>Web App count: {config.webclips.length}</p>
				</div>
				<div class="buttons">
					<div class="blue" id={config.id} on:click={installConfig}><i class="fas fa-mobile"></i></div>
					<div class="blue" id={config.id} on:click={downloadConfig}><i class="fas fa-long-arrow-alt-down"></i></div>
					<div class="blue" id={config.id} on:click={openConfig}><i class="far fa-edit"></i></div>
					<div class="red" id={config.id} on:click={deleteConfig}><i class="fas fa-trash"></i></div>
				</div>
			</div>
		{:else}
			<p>You don't seem to have any saved web app profiles... Make one above!</p>
		{/each}
	</section>
	{#if showModal}
		<div class="modal-overlay" on:click={closeProfile}></div>
		<div class="modal show">
			<div class="header">
				<div class="title">Config Settings</div>
				<div class="buttons">
					<div class="blue" on:click={saveCurrent} bind:this={save_button}><i class="far fa-save"></i></div>
					<div class="red" on:click={closeProfile}><i class="fas fa-times"></i></div>
				</div>
			</div>
			
			<AddApp id={currentConfig.id}/>
		</div>
	{/if}
	
</main>

<style>
	section {
		margin-bottom: 2rem;
	}

	.button {
		background: rgb(72, 72, 223);
		color: white;
		border:0;
		padding: 0.5rem 1.5rem;
		width: 10rem;
		display:flex;
		justify-content: center;
		border-radius: 0.5rem;
		text-decoration: none;
		margin-bottom: 1rem;
	}

	.cell {
		padding: 0.5rem 1rem;
		background: #2a2a2a;
		border-radius: 0.5rem;
		cursor: pointer;
		width: 30rem;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
	}

	.cell .buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.cell .buttons div:not(:last-child) {
		margin-right: 0.5rem;
	}

	.cell .buttons div {
		background: #2a2a2a;
		border-radius: 100%;
		cursor: pointer;
		color: #666;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.3rem;
		height: 2.3rem;
	}

	

	
	.cell .buttons > div:active {
		opacity: 0.5;
	}

	.cell .buttons > div.red {
		background-color: rgb(225, 57, 57);
		color: white;
	}
	
	.cell .buttons > div.blue {
		background-color: rgb(72, 72, 223);
		color: white;
	}


	.modal {
		top: 5%;
		left: 30%;
		right:30%;
		bottom: 5%;
		position: absolute;
		padding: 2rem;
		background: #1f1f1f;
		border-radius: 0.5rem;
		overflow: auto;
		z-index: 2;
		visibility: hidden;
		opacity: 0;
		transition: visibility 0s, opacity 0.5s ease-in-out;
		-webkit-transition: visibility 0s, opacity 0.5s ease-in-out;
	}

	.modal.show {
		visibility: visible;
		opacity:1;
	}

	.modal .header {
		display:flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal .header .title {
		font-size: 1.2rem;
	}

	.modal .header .buttons > div {
		display: inline;
		background: #2a2a2a;
		padding-left: 1rem;
		padding-right: 1rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		color: #666;
		cursor: pointer;
	}

	.modal .buttons > div:active {
		opacity: 0.5;
	}

	.modal .buttons > div.red {
		background-color: rgb(225, 57, 57);
		color: white;
	}
	
	.modal .buttons > div.blue {
		background-color: rgb(72, 72, 223);
		color: white;
	}

	.modal-overlay {
		top:0;
		left:0;
		right:0;
		bottom:0;
		position: absolute;
		background: #111;
		opacity: 0.6;
	}
	

	@media only screen and (max-width: 1000px) {
		.modal {
			top:0;
			left:0;
			right:0;
			bottom:0;

		}
		.modal-overlay {
			position: unset;
			display:none;
		}

		.cell {
			width: unset;
		}
	}
</style>
