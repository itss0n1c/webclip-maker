<script lang="ts">
import { generateConfig } from "./commons";
import type { Config } from './commons'
	let form: HTMLFormElement
	let genbutton: HTMLInputElement
	let icon: string
	let iconel = HTMLInputElement.prototype

	function handleIcon() {
		let val = iconel.files[0]
		let reader = new FileReader()
		reader.onload = (e) => {
			icon = e.target.result as string;
		}
		reader.readAsDataURL(val)
		console.log(icon)
	}

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

	function editIcon() {
		iconel.click()
	}	

	function generate(evt: Event) {
		evt.preventDefault()
		genbutton.value = "Generating..."
		let formdata = new FormData(form)
		let data: Config = {}
		formdata.forEach((v, k) => {
			data[k] = v;
		})

		let parseddataurl = parsedDataURL(icon)
		data.icon = parseddataurl.data; 
		
	 	let config = generateConfig(data as Config)
	 	let blob = new Blob([config], {type: "application/x-apple-aspen-config"})
	 	let url = URL.createObjectURL(blob)
	 	genbutton.value = "Generate"
	
	 	window.open(url, "_blank")
	}

	

</script>

<main>
	<section class="header">
		<h1>Webclip Maker</h1>
	</section>
	<section class="form">
		<p>Fill in the form below to create a webclip:</p>
		<form bind:this={form} on:submit={generate} enctype="multipart/form-data">
			<div class="formgroup">
				<h3>Config Settings</h3>
				<input type="text" name="config_name" placeholder="Profile Name" required/>
				<input type="text" name="config_author" placeholder="Profile Author" required/>
			</div>
			<div class="formgroup">
				<h3>Web App Settings</h3>
				<input type="text" name="name" placeholder="Name" required/>
				<div class="icon" on:click={editIcon}>
					<input bind:this={iconel} on:change={handleIcon} type="file" name="icon" style="display: none" required/>
					<img src={icon} alt="Click to add Icon" />
				</div>
				<input type="url" name="url" placeholder="URL" required/>
			</div>

			<input bind:this={genbutton} type="submit" class="submit" value="Generate" />
		

		</form>
	</section>
</main>

<style>
	section {
		margin-bottom: 2rem;
	}

	section.form form .formgroup {
		margin-bottom: 2rem;
	}

	section.form form .formgroup input {
		display:block;
		width: 20rem;
		background: #333;
		border-radius: 0.5rem;
		border:0;
		box-shadow: 0px 0px 5px #1a1a1a;
		padding: 0.5rem;
		margin-bottom: 1rem;
		color: #efefef;
	}


	section.form form .submit {
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
