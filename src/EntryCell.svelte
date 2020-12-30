<script lang="ts">
import { createEventDispatcher } from "svelte";


	export var title = ""
	export let cellid: number
	const dispatch = createEventDispatcher()

	function requestRemoval() {
		dispatch("message", {
			remove: true,
			id: cellid
		})
	}

</script>

<main>
	<div class="header">
		<p class="title">{title}</p>
		<div class="controls">
			<!-- <div>Save</div> -->
			<div class="red" on:click={requestRemoval}>Remove</div>
		</div>
	</div>
	<slot class="body"></slot>
	
</main>


<style>

	.header {
		display:flex;
		justify-content: space-between;
		align-items: center;
	}

	.header .title {
		font-size: 1.2rem;
	}

	.header .controls > div {
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

	.header .controls > div:active {
		opacity: 0.5;
	}

	.header .controls > div.red {
		background-color: rgb(225, 57, 57);
		color: white;
	}



</style>
