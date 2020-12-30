<script lang="ts">
import { createEventDispatcher } from "svelte";


	let iconel: HTMLInputElement
	export let icon: string = ""
	export let index: number

	function editIcon() {
		iconel.click()
	}

	const dispatch = createEventDispatcher()

	function handleIcon() {
		let val = iconel.files[0]
		let reader = new FileReader()
		reader.onload = (e) => {
			icon = e.target.result as string;

			dispatch("message", { icon, index })
		}
		reader.readAsDataURL(val)
		console.log(icon)
		
	}

</script>
<main>
	<div class="icon" on:click={editIcon}>
		<input bind:this={iconel} on:change={handleIcon} type="file" accept="image/*" name="icon[{index}]" style="display: none" required/>
		{#if icon != ""}
			<img src={icon} alt="Click to add Icon" />
		{:else}
			<p>Click to add Icon</p>
		{/if}
	</div>
</main>

<style>
	.icon {
		padding: 0.5rem 1.5rem;
		background: #333;
		display:flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		margin-bottom: 1rem;
		border-radius: 0.5rem;
	}

	.icon img {
		max-width: 6rem;
		max-height: 6rem;
		border-radius: 1rem;
	}
</style>
