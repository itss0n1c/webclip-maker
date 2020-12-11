<script lang="ts">
import AddApp from "./addApp.svelte";
import { onMount } from "svelte";
import { Configs } from "./stores";
import type { Config } from "./mcgen";
let configs = new Configs()
$: mconfigs = configs.array()
onMount(() => {
	console.log(mconfigs)
})
globalThis.configs = configs;
let currentConfig: Config



let modaldata: {form: HTMLFormElement}
let showModal = false

function createProfile() {
	currentConfig = configs.add()
	showModal = true;
}

function closeProfile() {
	modaldata = undefined;
	currentConfig = undefined;
	showModal = false;
}


function openConfig(e: MouseEvent) {
	let el = e.target as HTMLDivElement;
	console.log(el)
	let id = [...el.attributes].find(el => el.name == "id").value
	console.log(configs.get(id))
	let currentConfig = configs.get(id)
	showModal = true;
}



</script>

<main>
	<section class="header">
		<h1>Webclip Maker</h1>
	</section>
	<section>
		<div class="button" on:click={createProfile}>Create</div>
		<h3>Saved Configurations</h3>
		{#each configs.array() as config}
			<div class="cell" id={config.id} on:click={openConfig}>
				<p id={config.id}>{config.id}</p>
			</div>
		{:else}
			<p>You don't seem to have any saved web app profiles... Make one below!</p>
		{/each}
	</section>
	{#if showModal}
		<div class="modal-overlay" on:click={closeProfile}></div>
		<div class="modal show">
			<div class="buttons">
				<div on:click={modaldata.form.requestSubmit()}>Generate</div>
				<div class="red" on:click={closeProfile}>&#10005;</div>
			</div>
			<svelte:component this={AddApp} bind:config={currentConfig} bind:exported={modaldata} />
		</div>
	{/if}
	
</main>

<style>
	section {
		margin-bottom: 2rem;
	}

	.button {
		background: #007aff;
		color: white;
		border:0;
		padding: 0.5rem 1.5rem;
		width: 10rem;
		display:flex;
		justify-content: center;
		border-radius: 0.5rem;
		text-decoration: none;
	}

	.cell {
		padding: 0.5rem 1rem;
		background: #2a2a2a;
		border-radius: 0.5rem;
		cursor: pointer;
	}

	.cell:hover {
		opacity: 0.9;
	}

	.cell:active {
		opacity: 0.7;
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
	
	.modal .buttons {
		float:right;
		
	}

	.modal .buttons > div {
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
	}
</style>
