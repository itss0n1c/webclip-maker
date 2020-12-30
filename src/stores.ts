/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { Config } from './mcgen';
import { writable, Writable } from 'svelte/store';

function loadConfigs() {
	const configs: Config[] = [];
	const keys = Object.keys(localStorage).filter(key => key.startsWith('mconfig-'));
	if (keys.length > 0) {
		for (const key of keys) {
			const mconfigs = localStorage.getItem(key);
			const id = key.split('mconfig-')[1];
			const config = new Config(id);
			config.load(mconfigs);
			configs.push(config);
		}
	}
	//	console.log(configs, localStorage);
	return configs;
}

export function removeConfigLS(id: string): void {
	if (typeof localStorage[`mconfig-${id}`] === 'undefined') {
		throw 404;
	}
	localStorage.removeItem(`mconfig-${id}`);
}

export const Configs: Writable<Config[]> = writable(loadConfigs());

/*
 * export class Configs extends BaseStore<string, Config> {
 * 	ls: Storage
 * 	evts: {evt: string, cb: (configs: any) => void}[] = []
 * 	constructor() {
 * 		super();
 * 		this.load();
 * 	}
 */

/*
 * 	on(evt: 'added', cb: (configs: this) => void): void {
 * 		this.evts.push({ evt,
 * 			cb });
 * 		console.log(this.evts);
 * 	}
 */

/*
 * 	load(): void {
 * 		this.ls = localStorage;
 */

/*
 * 		const keys = Object.keys(this.ls).filter(key => key.startsWith('mconfig-'));
 * 		if (keys.length > 0) {
 * 			for (const key of keys) {
 * 				const mconfig = this.ls[key];
 * 				const id = key.split('mconfig-')[1];
 * 				const config = new Config(id);
 * 				config.load(mconfig);
 * 				this.set(config.id, config);
 * 			}
 * 		}
 * 	}
 */

/*
 * 	set(k: string, v: Config): this {
 * 		this.ls.setItem(`mconfig-${v.id}`, v.compile());
 * 		this.evts.filter(evt => evt.evt === 'added').forEach(evt => evt.cb.bind(this, this));
 * 		return super.set(k, v);
 * 	}
 */

/*
 * 	add(): Config {
 * 		const config = new Config();
 * 		this.set(config.id, config);
 * 		return this.get(config.id);
 * 	}
 * }
 */
