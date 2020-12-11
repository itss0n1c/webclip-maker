/* eslint-disable no-undef */
import type * as plist from 'plist';
import { v4 } from 'uuid';


const { parse, build } = globalThis.plist;

interface WebClip {
	name: string
	url: string
	iconurl: string
	icon?: Uint8Array
}

interface MC {
	[k: string]: any
}

export class Config {
	config_name: string
	config_author: string
	webclips: WebClip[]
	id: string
	constructor(id?: string) {
		this.config_name = '';
		this.config_author = '';
		this.webclips = [];
		this.id = id || this.genString();
	}

	async loadIcon(index: number): Promise<Uint8Array> {
		if (typeof this.webclips[index] === 'undefined') {
			throw 404;
		}
		const webclip = this.webclips[index];
		const icondata = await fetch(webclip.iconurl).then(r => r.arrayBuffer());
		this.webclips[index].icon = new Uint8Array(icondata);
		return this.webclips[index].icon;
	}

	load(mobileconfig: string): Config {
		const data = parse(mobileconfig) as MC;
		this.config_name = data.PayloadDisplayName;
		this.config_author = data.PayloadOrganization;
		for (const payload of data.PayloadContent) {
			this.webclips = [ ...this.webclips, {
				name: payload.Label,
				iconurl: `data:image/png;base64,${payload.Icon}`,
				url: payload.URL
			} ];
		}
		return this;
	}

	compile(): string {
		const app_uuid = v4().toUpperCase();

		const PayloadContent = [];

		for (const p of this.webclips) {
			const payload_uuid = v4().toUpperCase();
			PayloadContent.push({
				FullScreen: true,
				Icon: p.icon,
				IsRemovable: true,
				Label: p.name,
				PayloadDescription: 'Web app bundled into a config, generated by @S0n1c_Dev',
				PayloadIdentifier: `com.apple.webClip.managed.${payload_uuid}`,
				PayloadType: 'com.apple.webClip.managed',
				PayloadUUID: payload_uuid,
				PayloadVersion: 1,
				Precomposed: true,
				URL: p.url
			});
		}

		const payload = {
			PayloadContent,
			PayloadDescription: 'This config was generated via WebClip Maker by @S0n1c_Dev.',
			PayloadDisplayName: this.config_name,
			PayloadIdentifier: `ca.s0n1c.ios.webclip.${app_uuid}`,
			PayloadOrganization: this.config_author,
			PayloadRemovalDisallowed: false,
			PayloadType: 'Configuration',
			PayloadUUID: app_uuid,
			PayloadVersion: 1
		};


		let res: string;
		try {
			res = build(payload as plist.PlistValue);
		} catch (e) {
			console.log(e);
			throw e;
		}
		console.log(res);
		return res;
	}

	genString(length = 10): string {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	async generate(): Promise<void> {
		const gen = this.compile();
		const blob = new Blob([ gen ], { type: 'application/x-apple-aspen-config' });
		const url = URL.createObjectURL(blob);
		window.open(url, '_blank');
	}
}
