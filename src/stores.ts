/* eslint-disable no-undef */
import BaseStore from './BaseStore';
import { Config } from './mcgen';

export class Configs extends BaseStore<string, Config> {
	ls: Storage
	constructor() {
		super();
		this.load();
	}

	load(): void {
		this.ls = localStorage;

		const keys = Object.keys(this.ls).filter(key => key.startsWith('mconfig-'));
		if (keys.length > 0) {
			for (const key of keys) {
				const mconfig = this.ls[key];
				const id = key.split('mconfig-')[1];
				const config = new Config(id);
				config.load(mconfig);
				this.set(config.id, config);
			}
		}
	}

	set(k: string, v: Config): this {
		this.ls.setItem(`mconfig-${v.id}`, v.compile());
		return super.set(k, v);
	}

	add(): Config {
		const config = new Config();
		this.set(config.id, config);
		return this.get(config.id);
	}
}
