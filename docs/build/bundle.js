
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.30.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    var getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);
    var rnds8 = new Uint8Array(16);
    function rng() {
      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }

      return getRandomValues(rnds8);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    function v4(options, buf, offset) {
      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    const { parse, build } = globalThis.plist;
    let mobileconfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
        <key>PayloadContent</key>
        <array>
                <dict>
                        <key>FullScreen</key>
                        <true/>
                        <key>Icon</key>
                        <data>
                        iconData
                        </data>
                        <key>IsRemovable</key>
                        <true/>
                        <key>Label</key>
                        <string></string>
                        <key>PayloadDescription</key>
                        <string></string>
                        <key>PayloadDisplayName</key>
                        <string></string>
                        <key>PayloadIdentifier</key>
                        <string></string>
                        <key>PayloadType</key>
                        <string>com.apple.webClip.managed</string>
                        <key>PayloadUUID</key>
                        <string></string>
                        <key>PayloadVersion</key>
                        <integer>1</integer>
                        <key>Precomposed</key>
                        <true/>
                        <key>URL</key>
                        <string></string>
                </dict>
        </array>
        <key>PayloadDescription</key>
        <string></string>
        <key>PayloadDisplayName</key>
        <string></string>
        <key>PayloadIdentifier</key>
        <string></string>
        <key>PayloadOrganization</key>
        <string></string>
        <key>PayloadRemovalDisallowed</key>
        <false/>
        <key>PayloadType</key>
        <string>Configuration</string>
        <key>PayloadUUID</key>
        <string></string>
        <key>PayloadVersion</key>
        <integer>1</integer>
</dict>
</plist>`;
    function generateConfig(config) {
        let mc = parse(mobileconfig);
        let payload_uuid = v4().toUpperCase();
        let app_uuid = v4().toUpperCase();
        // mc.PayloadContent[0].Icon = 
        mc.PayloadContent[0].Label = config.name;
        mc.PayloadContent[0].Icon = config.icon;
        mc.PayloadContent[0].PayloadDescription = `Web app bundled into a config, generated by @S0n1c_Dev`;
        mc.PayloadContent[0].PayloadIdentifier = `com.apple.webClip.managed.${payload_uuid}`;
        mc.PayloadContent[0].PayloadUUID = payload_uuid;
        mc.PayloadContent[0].URL = config.url;
        mc.PayloadDisplayName = config.config_name;
        mc.PayloadDescription = `This config was generated via WebClip Maker by @S0n1c_Dev.`;
        mc.PayloadIdentifier = `ca.s0n1c.ios.webclip.${app_uuid}`;
        mc.PayloadOrganization = config.config_author;
        mc.PayloadUUID = app_uuid;
        console.log(mc);
        let res;
        try {
            res = build(mc);
        }
        catch (e) {
            console.log(e);
            throw e;
        }
        console.log(res);
        return res;
    }

    /* src/App.svelte generated by Svelte v3.30.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (88:3) {#if dlset}
    function create_if_block(ctx) {
    	let p;
    	let t0;
    	let a;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Download: ");
    			a = element("a");
    			t1 = text("install.mobileconfig");
    			attr_dev(a, "href", /*dlurl*/ ctx[3]);
    			add_location(a, file, 88, 17, 3105);
    			add_location(p, file, 88, 4, 3092);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, a);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dlurl*/ 8) {
    				attr_dev(a, "href", /*dlurl*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(88:3) {#if dlset}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let section0;
    	let h1;
    	let t1;
    	let section1;
    	let p;
    	let t3;
    	let form_1;
    	let div0;
    	let h30;
    	let t5;
    	let input0;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let h31;
    	let t9;
    	let input2;
    	let t10;
    	let div1;
    	let input3;
    	let t11;
    	let img;
    	let img_src_value;
    	let t12;
    	let input4;
    	let t13;
    	let input5;
    	let t14;
    	let mounted;
    	let dispose;
    	let if_block = /*dlset*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section0 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Webclip Maker";
    			t1 = space();
    			section1 = element("section");
    			p = element("p");
    			p.textContent = "Fill in the form below to create a webclip:";
    			t3 = space();
    			form_1 = element("form");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Config Settings";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Web App Settings";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			div1 = element("div");
    			input3 = element("input");
    			t11 = space();
    			img = element("img");
    			t12 = space();
    			input4 = element("input");
    			t13 = space();
    			input5 = element("input");
    			t14 = space();
    			if (if_block) if_block.c();
    			add_location(h1, file, 65, 2, 2161);
    			attr_dev(section0, "class", "header svelte-1cilvoc");
    			add_location(section0, file, 64, 1, 2134);
    			add_location(p, file, 68, 2, 2222);
    			add_location(h30, file, 71, 4, 2381);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "config_name");
    			attr_dev(input0, "placeholder", "Profile Name");
    			input0.required = true;
    			attr_dev(input0, "class", "svelte-1cilvoc");
    			add_location(input0, file, 72, 4, 2410);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "config_author");
    			attr_dev(input1, "placeholder", "Profile Author");
    			input1.required = true;
    			attr_dev(input1, "class", "svelte-1cilvoc");
    			add_location(input1, file, 73, 4, 2490);
    			attr_dev(div0, "class", "formgroup svelte-1cilvoc");
    			add_location(div0, file, 70, 3, 2353);
    			add_location(h31, file, 76, 4, 2611);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "name");
    			attr_dev(input2, "placeholder", "Name");
    			input2.required = true;
    			attr_dev(input2, "class", "svelte-1cilvoc");
    			add_location(input2, file, 77, 4, 2641);
    			attr_dev(input3, "type", "file");
    			attr_dev(input3, "name", "icon");
    			set_style(input3, "display", "none");
    			input3.required = true;
    			attr_dev(input3, "class", "svelte-1cilvoc");
    			add_location(input3, file, 79, 5, 2750);
    			if (img.src !== (img_src_value = /*icon*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Click to add Icon");
    			attr_dev(img, "class", "svelte-1cilvoc");
    			add_location(img, file, 80, 5, 2861);
    			attr_dev(div1, "class", "icon svelte-1cilvoc");
    			add_location(div1, file, 78, 4, 2706);
    			attr_dev(input4, "type", "url");
    			attr_dev(input4, "name", "url");
    			attr_dev(input4, "placeholder", "URL");
    			input4.required = true;
    			attr_dev(input4, "class", "svelte-1cilvoc");
    			add_location(input4, file, 82, 4, 2919);
    			attr_dev(div2, "class", "formgroup svelte-1cilvoc");
    			add_location(div2, file, 75, 3, 2583);
    			attr_dev(input5, "type", "submit");
    			attr_dev(input5, "class", "submit svelte-1cilvoc");
    			input5.value = "Generate";
    			add_location(input5, file, 85, 3, 2991);
    			attr_dev(form_1, "enctype", "multipart/form-data");
    			add_location(form_1, file, 69, 2, 2275);
    			attr_dev(section1, "class", "form svelte-1cilvoc");
    			add_location(section1, file, 67, 1, 2197);
    			add_location(main, file, 63, 0, 2126);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			append_dev(section0, h1);
    			append_dev(main, t1);
    			append_dev(main, section1);
    			append_dev(section1, p);
    			append_dev(section1, t3);
    			append_dev(section1, form_1);
    			append_dev(form_1, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			append_dev(div0, t6);
    			append_dev(div0, input1);
    			append_dev(form_1, t7);
    			append_dev(form_1, div2);
    			append_dev(div2, h31);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div1, input3);
    			/*input3_binding*/ ctx[9](input3);
    			append_dev(div1, t11);
    			append_dev(div1, img);
    			append_dev(div2, t12);
    			append_dev(div2, input4);
    			append_dev(form_1, t13);
    			append_dev(form_1, input5);
    			/*input5_binding*/ ctx[10](input5);
    			append_dev(form_1, t14);
    			if (if_block) if_block.m(form_1, null);
    			/*form_1_binding*/ ctx[11](form_1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input3, "change", /*handleIcon*/ ctx[6], false, false, false),
    					listen_dev(div1, "click", /*editIcon*/ ctx[7], false, false, false),
    					listen_dev(form_1, "submit", /*generate*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*icon*/ 16 && img.src !== (img_src_value = /*icon*/ ctx[4])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (/*dlset*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(form_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*input3_binding*/ ctx[9](null);
    			/*input5_binding*/ ctx[10](null);
    			if (if_block) if_block.d();
    			/*form_1_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function parsedDataURL(url) {
    	let start = url.indexOf("data:") + 5;
    	let end = url.indexOf(";base64,");
    	let mime = url.substring(start, end);
    	let data = url.substr(end + 8, url.length);
    	return { mime, data };
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let form;
    	let genbutton;
    	let dlset = false;
    	let dlurl;
    	let icon;
    	let iconel = HTMLInputElement.prototype;

    	function handleIcon() {
    		let val = iconel.files[0];
    		let reader = new FileReader();

    		reader.onload = e => {
    			$$invalidate(4, icon = e.target.result);
    		};

    		reader.readAsDataURL(val);
    		console.log(icon);
    	}

    	function editIcon() {
    		iconel.click();
    	}

    	function generate(evt) {
    		return __awaiter(this, void 0, void 0, function* () {
    			evt.preventDefault();
    			$$invalidate(1, genbutton.value = "Generating...", genbutton);
    			$$invalidate(3, dlurl = "");
    			$$invalidate(2, dlset = false);
    			let formdata = new FormData(form);
    			let data = {};

    			formdata.forEach((v, k) => {
    				data[k] = v;
    			});

    			let icondata = yield fetch(icon).then(r => r.arrayBuffer());
    			data.icon = new Uint8Array(icondata);
    			let config = generateConfig(data);
    			let blob = new Blob([config], { type: "application/x-apple-aspen-config" });
    			let url = URL.createObjectURL(blob);
    			$$invalidate(1, genbutton.value = "Generate", genbutton);
    			$$invalidate(3, dlurl = url);
    			$$invalidate(2, dlset = true);
    		}); //	window.open(url, "_blank")
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			iconel = $$value;
    			$$invalidate(5, iconel);
    		});
    	}

    	function input5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			genbutton = $$value;
    			$$invalidate(1, genbutton);
    		});
    	}

    	function form_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			form = $$value;
    			$$invalidate(0, form);
    		});
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		generateConfig,
    		form,
    		genbutton,
    		dlset,
    		dlurl,
    		icon,
    		iconel,
    		handleIcon,
    		parsedDataURL,
    		editIcon,
    		generate
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("form" in $$props) $$invalidate(0, form = $$props.form);
    		if ("genbutton" in $$props) $$invalidate(1, genbutton = $$props.genbutton);
    		if ("dlset" in $$props) $$invalidate(2, dlset = $$props.dlset);
    		if ("dlurl" in $$props) $$invalidate(3, dlurl = $$props.dlurl);
    		if ("icon" in $$props) $$invalidate(4, icon = $$props.icon);
    		if ("iconel" in $$props) $$invalidate(5, iconel = $$props.iconel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		form,
    		genbutton,
    		dlset,
    		dlurl,
    		icon,
    		iconel,
    		handleIcon,
    		editIcon,
    		generate,
    		input3_binding,
    		input5_binding,
    		form_1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
