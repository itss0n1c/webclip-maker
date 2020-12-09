<script lang="ts">
	let iconel: HTMLInputElement
	export let icon: string = ""
	export let index: number

	function editIcon() {
		iconel.click()
	}

	function handleIcon() {
		let val = iconel.files[0]
		let reader = new FileReader()
		reader.onload = (e) => {
			icon = e.target.result as string;
		}
		reader.readAsDataURL(val)
		console.log(icon)
	}

</script>
<main>
	<div class="icon" on:click={editIcon}>
		<input bind:this={iconel} on:change={handleIcon} type="file" name="icon[{index}]" style="display: none" required/>
		<img src={icon} alt="Click to add Icon" />
	</div>
</main>

<style>
	.icon {
		padding: 0.5rem 1.5rem;
		background: #333;
		display:flex;
		justify-content: center;
		align-items: center;
		width: 18rem;
		margin-bottom: 1rem;
		border-radius: 0.5rem;
	}

	.icon img {
		max-width: 10rem;
		max-height: 10rem;
		border-radius: 1.5rem;
	}
</style>
