<script lang="ts">
import { generateConfig } from "./commons";
import type { Config } from './commons'
import AddApp from "./addApp.svelte";
import { onMount } from "svelte";

let generate: (evt: Event) => Promise<void>
let modaldata: {form: HTMLFormElement}
let showModal = true

function createProfile() {
	showModal = true;
}

function clearProfile() {
	showModal = false;
}





</script>

<main>
	<section class="header">
		<h1>Webclip Maker</h1>
	</section>
	<section>
		<p>You don't seem to have any saved web app profiles... Make one below!</p>
		<div class="button" on:click={createProfile}>Create</div>
	</section>
	<div class="modal-overlay" hidden={!showModal}></div>
	<div class="modal" hidden={!showModal}>
		<div class="buttons">
			<div on:click={modaldata.form.requestSubmit()}>Generate</div>
			<div class="red" on:click={clearProfile}>&#10005;</div>
		</div>
		<svelte:component this={AddApp} bind:generate={generate} bind:exported={modaldata} />
	</div>
	
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

	.modal {
		top: 5%;
		left: 30%;
		right:30%;
		position: absolute;
		padding: 2rem;
		background: #1f1f1f;
		border-radius: 0.5rem;
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
