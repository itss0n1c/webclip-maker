
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src\EntryCell.svelte generated by Svelte v3.30.0 */
    const file = "src\\EntryCell.svelte";
    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ class: "body" });

    function create_fragment(ctx) {
    	let main;
    	let div2;
    	let h3;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Remove";
    			t3 = space();
    			if (default_slot) default_slot.c();
    			add_location(h3, file, 14, 1, 310);
    			attr_dev(div0, "class", "red svelte-107lul");
    			add_location(div0, file, 17, 3, 386);
    			attr_dev(div1, "class", "controls svelte-107lul");
    			add_location(div1, file, 15, 2, 330);
    			attr_dev(div2, "class", "header svelte-107lul");
    			add_location(div2, file, 13, 1, 287);
    			add_location(main, file, 12, 0, 278);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, h3);
    			append_dev(h3, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(main, t3);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*requestRemoval*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EntryCell", slots, ['default']);
    	var { title = "" } = $$props;
    	let { cellid } = $$props;
    	const dispatch = createEventDispatcher();

    	function requestRemoval() {
    		dispatch("message", { remove: true, id: cellid });
    	}

    	const writable_props = ["title", "cellid"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EntryCell> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("cellid" in $$props) $$invalidate(2, cellid = $$props.cellid);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		title,
    		cellid,
    		dispatch,
    		requestRemoval
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("cellid" in $$props) $$invalidate(2, cellid = $$props.cellid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, requestRemoval, cellid, $$scope, slots];
    }

    class EntryCell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { title: 0, cellid: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EntryCell",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cellid*/ ctx[2] === undefined && !("cellid" in props)) {
    			console.warn("<EntryCell> was created without expected prop 'cellid'");
    		}
    	}

    	get title() {
    		throw new Error("<EntryCell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<EntryCell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cellid() {
    		throw new Error("<EntryCell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cellid(value) {
    		throw new Error("<EntryCell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\IconHandler.svelte generated by Svelte v3.30.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\IconHandler.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let div;
    	let input;
    	let input_name_value;
    	let t;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			input = element("input");
    			t = space();
    			img = element("img");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "name", input_name_value = "icon[" + /*index*/ ctx[1] + "]");
    			set_style(input, "display", "none");
    			input.required = true;
    			add_location(input, file$1, 21, 2, 544);
    			if (img.src !== (img_src_value = /*icon*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Click to add Icon");
    			attr_dev(img, "class", "svelte-1qmhx7o");
    			add_location(img, file$1, 22, 2, 662);
    			attr_dev(div, "class", "icon svelte-1qmhx7o");
    			add_location(div, file$1, 20, 1, 502);
    			add_location(main, file$1, 19, 0, 493);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, input);
    			/*input_binding*/ ctx[5](input);
    			append_dev(div, t);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*handleIcon*/ ctx[4], false, false, false),
    					listen_dev(div, "click", /*editIcon*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 2 && input_name_value !== (input_name_value = "icon[" + /*index*/ ctx[1] + "]")) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*icon*/ 1 && img.src !== (img_src_value = /*icon*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*input_binding*/ ctx[5](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconHandler", slots, []);
    	let iconel;
    	let { icon = "" } = $$props;
    	let { index } = $$props;

    	function editIcon() {
    		iconel.click();
    	}

    	const dispatch = createEventDispatcher();

    	function handleIcon() {
    		let val = iconel.files[0];
    		let reader = new FileReader();

    		reader.onload = e => {
    			$$invalidate(0, icon = e.target.result);
    			dispatch("message", { icon, index });
    		};

    		reader.readAsDataURL(val);
    		console.log(icon);
    	}

    	const writable_props = ["icon", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<IconHandler> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			iconel = $$value;
    			$$invalidate(2, iconel);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		iconel,
    		icon,
    		index,
    		editIcon,
    		dispatch,
    		handleIcon
    	});

    	$$self.$inject_state = $$props => {
    		if ("iconel" in $$props) $$invalidate(2, iconel = $$props.iconel);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [icon, index, iconel, editIcon, handleIcon, input_binding];
    }

    class IconHandler extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { icon: 0, index: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconHandler",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console_1.warn("<IconHandler> was created without expected prop 'index'");
    		}
    	}

    	get icon() {
    		throw new Error("<IconHandler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<IconHandler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<IconHandler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<IconHandler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
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
    class Config {
        constructor(id) {
            this.config_name = 'Config Name';
            this.config_author = 'Unknown';
            this.webclips = [];
            this.id = id || this.genString();
        }
        async loadIcon(index) {
            if (typeof this.webclips[index] === 'undefined') {
                throw 404;
            }
            const webclip = this.webclips[index];
            const icondata = await fetch(webclip.iconurl).then(r => r.arrayBuffer());
            this.webclips[index].icon = new Uint8Array(icondata);
            return this.webclips[index].icon;
        }
        load(mobileconfig) {
            const data = parse(mobileconfig);
            this.config_name = data.PayloadDisplayName;
            this.config_author = data.PayloadOrganization;
            for (const payload of data.PayloadContent) {
                console.log(payload.Icon);
                const imageblob = new Blob([payload.Icon], { type: 'image/png' });
                const url = URL.createObjectURL(imageblob);
                console.log(payload);
                this.webclips = [...this.webclips, {
                        name: payload.Label,
                        icon: payload.Icon,
                        iconurl: url,
                        url: payload.URL
                    }];
            }
            return this;
        }
        compile() {
            const app_uuid = v4().toUpperCase();
            const PayloadContent = [];
            if (typeof this.webclips !== 'undefined' && this.webclips.length > 0) {
                for (const p of this.webclips) {
                    if (p.icon === null) {
                        continue;
                    }
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
            let res;
            try {
                res = build(payload);
            }
            catch (e) {
                console.log(e);
                throw e;
            }
            console.log(res);
            return res;
        }
        genString(length = 10) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        async save() {
            console.log(this);
            const gen = this.compile();
            localStorage.setItem(`mconfig-${this.id}`, gen);
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* eslint-disable no-unused-vars */
    function loadConfigs() {
        const configs = [];
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
    function removeConfigLS(id) {
        if (typeof localStorage[`mconfig-${id}`] === 'undefined') {
            throw 404;
        }
        localStorage.removeItem(`mconfig-${id}`);
    }
    const Configs = writable(loadConfigs());
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

    /* src\addApp.svelte generated by Svelte v3.30.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\addApp.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[18] = list;
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (60:6) <EntryCell title="Web App Settings" on:message={handleCell} cellid={index}>
    function create_default_slot(ctx) {
    	let input0;
    	let input0_name_value;
    	let t0;
    	let iconhandler;
    	let updating_icon;
    	let t1;
    	let input1;
    	let input1_name_value;
    	let current;
    	let mounted;
    	let dispose;

    	function input0_input_handler_1() {
    		/*input0_input_handler_1*/ ctx[10].call(input0, /*index*/ ctx[19]);
    	}

    	function iconhandler_icon_binding(value) {
    		/*iconhandler_icon_binding*/ ctx[11].call(null, value, /*index*/ ctx[19]);
    	}

    	let iconhandler_props = { index: /*index*/ ctx[19] };

    	if (/*config*/ ctx[0].webclips[/*index*/ ctx[19]].iconurl !== void 0) {
    		iconhandler_props.icon = /*config*/ ctx[0].webclips[/*index*/ ctx[19]].iconurl;
    	}

    	iconhandler = new IconHandler({ props: iconhandler_props, $$inline: true });
    	binding_callbacks.push(() => bind(iconhandler, "icon", iconhandler_icon_binding));
    	iconhandler.$on("message", /*handleIcon*/ ctx[4]);

    	function input1_input_handler_1() {
    		/*input1_input_handler_1*/ ctx[12].call(input1, /*index*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			create_component(iconhandler.$$.fragment);
    			t1 = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", input0_name_value = "name[" + /*index*/ ctx[19] + "]");
    			attr_dev(input0, "placeholder", "Name");
    			input0.required = true;
    			add_location(input0, file$2, 60, 7, 1932);
    			attr_dev(input1, "type", "url");
    			attr_dev(input1, "name", input1_name_value = "url[" + /*index*/ ctx[19] + "]");
    			attr_dev(input1, "placeholder", "URL");
    			input1.required = true;
    			add_location(input1, file$2, 62, 7, 2156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*config*/ ctx[0].webclips[/*index*/ ctx[19]].name);
    			insert_dev(target, t0, anchor);
    			mount_component(iconhandler, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*config*/ ctx[0].webclips[/*index*/ ctx[19]].url);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler_1),
    					listen_dev(input1, "input", input1_input_handler_1)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*config*/ 1 && input0.value !== /*config*/ ctx[0].webclips[/*index*/ ctx[19]].name) {
    				set_input_value(input0, /*config*/ ctx[0].webclips[/*index*/ ctx[19]].name);
    			}

    			const iconhandler_changes = {};

    			if (!updating_icon && dirty & /*config*/ 1) {
    				updating_icon = true;
    				iconhandler_changes.icon = /*config*/ ctx[0].webclips[/*index*/ ctx[19]].iconurl;
    				add_flush_callback(() => updating_icon = false);
    			}

    			iconhandler.$set(iconhandler_changes);

    			if (dirty & /*config*/ 1) {
    				set_input_value(input1, /*config*/ ctx[0].webclips[/*index*/ ctx[19]].url);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconhandler.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconhandler.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t0);
    			destroy_component(iconhandler, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(60:6) <EntryCell title=\\\"Web App Settings\\\" on:message={handleCell} cellid={index}>",
    		ctx
    	});

    	return block;
    }

    // (58:3) {#each payloads as payload, index}
    function create_each_block(ctx) {
    	let div;
    	let entrycell;
    	let current;

    	entrycell = new EntryCell({
    			props: {
    				title: "Web App Settings",
    				cellid: /*index*/ ctx[19],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	entrycell.$on("message", /*handleCell*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(entrycell.$$.fragment);
    			attr_dev(div, "class", "formgroup");
    			add_location(div, file$2, 58, 4, 1817);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(entrycell, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const entrycell_changes = {};

    			if (dirty & /*$$scope, config*/ 1048577) {
    				entrycell_changes.$$scope = { dirty, ctx };
    			}

    			entrycell.$set(entrycell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(entrycell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(entrycell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(entrycell);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(58:3) {#each payloads as payload, index}",
    		ctx
    	});

    	return block;
    }

    // (72:2) {#if dlset}
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
    			add_location(a, file$2, 72, 16, 2512);
    			add_location(p, file$2, 72, 3, 2499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, a);
    			append_dev(a, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(72:2) {#if dlset}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let form;
    	let div0;
    	let h3;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let t4;
    	let div1;
    	let t6;
    	let br0;
    	let br1;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*payloads*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*dlset*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			form = element("form");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Config Settings";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			div1.textContent = "Add App";
    			t6 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t7 = space();
    			if (if_block) if_block.c();
    			add_location(h3, file$2, 53, 3, 1508);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "config_name");
    			attr_dev(input0, "placeholder", "Profile Name");
    			input0.required = true;
    			add_location(input0, file$2, 54, 3, 1537);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "config_author");
    			attr_dev(input1, "placeholder", "Profile Author");
    			input1.required = true;
    			add_location(input1, file$2, 55, 3, 1649);
    			attr_dev(div0, "class", "formgroup");
    			add_location(div0, file$2, 52, 2, 1480);
    			attr_dev(div1, "class", "button svelte-1lwujg1");
    			add_location(div1, file$2, 66, 3, 2311);
    			add_location(br0, file$2, 67, 3, 2371);
    			add_location(br1, file$2, 67, 9, 2377);
    			attr_dev(form, "enctype", "multipart/form-data");
    			add_location(form, file$2, 51, 1, 1440);
    			add_location(main, file$2, 50, 0, 1431);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, form);
    			append_dev(form, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*config*/ ctx[0].config_name);
    			append_dev(div0, t2);
    			append_dev(div0, input1);
    			set_input_value(input1, /*config*/ ctx[0].config_author);
    			append_dev(form, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(form, t6);
    			append_dev(form, br0);
    			append_dev(form, br1);
    			append_dev(form, t7);
    			if (if_block) if_block.m(form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(div1, "click", /*addPayload*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*config*/ 1 && input0.value !== /*config*/ ctx[0].config_name) {
    				set_input_value(input0, /*config*/ ctx[0].config_name);
    			}

    			if (dirty & /*config*/ 1 && input1.value !== /*config*/ ctx[0].config_author) {
    				set_input_value(input1, /*config*/ ctx[0].config_author);
    			}

    			if (dirty & /*handleCell, config, handleIcon, payloads*/ 83) {
    				each_value = /*payloads*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(form, t4);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*dlset*/ ctx[2]) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
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

    function instance$2($$self, $$props, $$invalidate) {
    	let $Configs;
    	validate_store(Configs, "Configs");
    	component_subscribe($$self, Configs, $$value => $$invalidate(13, $Configs = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddApp", slots, []);
    	let genbutton;
    	let dlset = false;
    	let dlurl;
    	let { id } = $$props;
    	let config = $Configs.find(config => config.id == id);
    	globalThis.config = config;
    	let icon;

    	function handleIcon(e) {
    		if (typeof e.detail.icon !== "string" || typeof e.detail.index !== "number") return false;
    		config.loadIcon(e.detail.index);
    	}

    	function addPayload() {
    		$$invalidate(
    			0,
    			config.webclips = [
    				...config.webclips,
    				{
    					name: "",
    					icon: null,
    					iconurl: "",
    					url: ""
    				}
    			],
    			config
    		);
    	}

    	function removePayload(index) {
    		let webclips = [...config.webclips];
    		webclips.splice(index, 1);
    		$$invalidate(0, config.webclips = [...webclips], config);
    	}

    	function handleCell(event) {
    		console.log(event);
    		if (typeof event.detail.remove !== "boolean") return;

    		if (event.detail.remove) {
    			console.log(`removing payload ${event.detail.id}`, event.detail, config.webclips[event.detail.id]);
    			removePayload(event.detail.id);
    		}
    	}

    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<AddApp> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		config.config_name = this.value;
    		$$invalidate(0, config);
    	}

    	function input1_input_handler() {
    		config.config_author = this.value;
    		$$invalidate(0, config);
    	}

    	function input0_input_handler_1(index) {
    		config.webclips[index].name = this.value;
    		$$invalidate(0, config);
    	}

    	function iconhandler_icon_binding(value, index) {
    		config.webclips[index].iconurl = value;
    		$$invalidate(0, config);
    	}

    	function input1_input_handler_1(index) {
    		config.webclips[index].url = this.value;
    		$$invalidate(0, config);
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		EntryCell,
    		IconHandler,
    		Configs,
    		genbutton,
    		dlset,
    		dlurl,
    		id,
    		config,
    		icon,
    		parsedDataURL,
    		handleIcon,
    		addPayload,
    		removePayload,
    		handleCell,
    		$Configs,
    		payloads
    	});

    	$$self.$inject_state = $$props => {
    		if ("genbutton" in $$props) genbutton = $$props.genbutton;
    		if ("dlset" in $$props) $$invalidate(2, dlset = $$props.dlset);
    		if ("dlurl" in $$props) $$invalidate(3, dlurl = $$props.dlurl);
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    		if ("config" in $$props) $$invalidate(0, config = $$props.config);
    		if ("icon" in $$props) icon = $$props.icon;
    		if ("payloads" in $$props) $$invalidate(1, payloads = $$props.payloads);
    	};

    	let payloads;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*config*/ 1) {
    			 $$invalidate(1, payloads = config.webclips);
    		}
    	};

    	return [
    		config,
    		payloads,
    		dlset,
    		dlurl,
    		handleIcon,
    		addPayload,
    		handleCell,
    		id,
    		input0_input_handler,
    		input1_input_handler,
    		input0_input_handler_1,
    		iconhandler_icon_binding,
    		input1_input_handler_1
    	];
    }

    class AddApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { id: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddApp",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[7] === undefined && !("id" in props)) {
    			console_1$1.warn("<AddApp> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<AddApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<AddApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.30.0 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (116:2) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "You don't seem to have any saved web app profiles... Make one below!";
    			add_location(p, file$3, 116, 3, 3676);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(116:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (103:2) {#each configs as config}
    function create_each_block$1(ctx) {
    	let div6;
    	let div0;
    	let p0;
    	let t0_value = /*config*/ ctx[15].config_name + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let t3_value = /*config*/ ctx[15].webclips.length + "";
    	let t3;
    	let t4;
    	let div5;
    	let div1;
    	let i0;
    	let div1_id_value;
    	let t5;
    	let div2;
    	let i1;
    	let div2_id_value;
    	let t6;
    	let div3;
    	let i2;
    	let div3_id_value;
    	let t7;
    	let div4;
    	let i3;
    	let div4_id_value;
    	let t8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Web App count: ");
    			t3 = text(t3_value);
    			t4 = space();
    			div5 = element("div");
    			div1 = element("div");
    			i0 = element("i");
    			t5 = space();
    			div2 = element("div");
    			i1 = element("i");
    			t6 = space();
    			div3 = element("div");
    			i2 = element("i");
    			t7 = space();
    			div4 = element("div");
    			i3 = element("i");
    			t8 = space();
    			add_location(p0, file$3, 105, 5, 3112);
    			add_location(p1, file$3, 106, 5, 3146);
    			attr_dev(div0, "class", "info svelte-l0qpl9");
    			add_location(div0, file$3, 104, 4, 3087);
    			attr_dev(i0, "class", "fas fa-mobile");
    			add_location(i0, file$3, 109, 63, 3296);
    			attr_dev(div1, "class", "blue svelte-l0qpl9");
    			attr_dev(div1, "id", div1_id_value = /*config*/ ctx[15].id);
    			add_location(div1, file$3, 109, 5, 3238);
    			attr_dev(i1, "class", "fas fa-long-arrow-alt-down");
    			add_location(i1, file$3, 110, 64, 3397);
    			attr_dev(div2, "class", "blue svelte-l0qpl9");
    			attr_dev(div2, "id", div2_id_value = /*config*/ ctx[15].id);
    			add_location(div2, file$3, 110, 5, 3338);
    			attr_dev(i2, "class", "far fa-edit");
    			add_location(i2, file$3, 111, 60, 3507);
    			attr_dev(div3, "class", "blue svelte-l0qpl9");
    			attr_dev(div3, "id", div3_id_value = /*config*/ ctx[15].id);
    			add_location(div3, file$3, 111, 5, 3452);
    			attr_dev(i3, "class", "fas fa-trash");
    			add_location(i3, file$3, 112, 61, 3603);
    			attr_dev(div4, "class", "red svelte-l0qpl9");
    			attr_dev(div4, "id", div4_id_value = /*config*/ ctx[15].id);
    			add_location(div4, file$3, 112, 5, 3547);
    			attr_dev(div5, "class", "buttons svelte-l0qpl9");
    			add_location(div5, file$3, 108, 4, 3210);
    			attr_dev(div6, "class", "cell svelte-l0qpl9");
    			add_location(div6, file$3, 103, 3, 3063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, i0);
    			append_dev(div5, t5);
    			append_dev(div5, div2);
    			append_dev(div2, i1);
    			append_dev(div5, t6);
    			append_dev(div5, div3);
    			append_dev(div3, i2);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, i3);
    			append_dev(div6, t8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*installConfig*/ ctx[9], false, false, false),
    					listen_dev(div2, "click", /*downloadConfig*/ ctx[8], false, false, false),
    					listen_dev(div3, "click", /*openConfig*/ ctx[6], false, false, false),
    					listen_dev(div4, "click", /*deleteConfig*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*configs*/ 2 && t0_value !== (t0_value = /*config*/ ctx[15].config_name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*configs*/ 2 && t3_value !== (t3_value = /*config*/ ctx[15].webclips.length + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*configs*/ 2 && div1_id_value !== (div1_id_value = /*config*/ ctx[15].id)) {
    				attr_dev(div1, "id", div1_id_value);
    			}

    			if (dirty & /*configs*/ 2 && div2_id_value !== (div2_id_value = /*config*/ ctx[15].id)) {
    				attr_dev(div2, "id", div2_id_value);
    			}

    			if (dirty & /*configs*/ 2 && div3_id_value !== (div3_id_value = /*config*/ ctx[15].id)) {
    				attr_dev(div3, "id", div3_id_value);
    			}

    			if (dirty & /*configs*/ 2 && div4_id_value !== (div4_id_value = /*config*/ ctx[15].id)) {
    				attr_dev(div4, "id", div4_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(103:2) {#each configs as config}",
    		ctx
    	});

    	return block;
    }

    // (120:1) {#if showModal}
    function create_if_block$1(ctx) {
    	let div0;
    	let t0;
    	let div4;
    	let div3;
    	let div1;
    	let t2;
    	let div2;
    	let t4;
    	let addapp;
    	let current;
    	let mounted;
    	let dispose;

    	addapp = new AddApp({
    			props: { id: /*currentConfig*/ ctx[0].id },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div1.textContent = "Save Changes";
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "✕";
    			t4 = space();
    			create_component(addapp.$$.fragment);
    			attr_dev(div0, "class", "modal-overlay svelte-l0qpl9");
    			add_location(div0, file$3, 120, 2, 3797);
    			attr_dev(div1, "class", "blue svelte-l0qpl9");
    			add_location(div1, file$3, 123, 4, 3914);
    			attr_dev(div2, "class", "red svelte-l0qpl9");
    			add_location(div2, file$3, 124, 4, 4003);
    			attr_dev(div3, "class", "buttons svelte-l0qpl9");
    			add_location(div3, file$3, 122, 3, 3887);
    			attr_dev(div4, "class", "modal show svelte-l0qpl9");
    			add_location(div4, file$3, 121, 2, 3858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			/*div1_binding*/ ctx[11](div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div4, t4);
    			mount_component(addapp, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*closeProfile*/ ctx[5], false, false, false),
    					listen_dev(div1, "click", /*saveCurrent*/ ctx[7], false, false, false),
    					listen_dev(div2, "click", /*closeProfile*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const addapp_changes = {};
    			if (dirty & /*currentConfig*/ 1) addapp_changes.id = /*currentConfig*/ ctx[0].id;
    			addapp.$set(addapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			/*div1_binding*/ ctx[11](null);
    			destroy_component(addapp);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(120:1) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let section0;
    	let h1;
    	let t1;
    	let section1;
    	let div;
    	let t3;
    	let h3;
    	let t5;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*configs*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	let if_block = /*showModal*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section0 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Webclip Maker";
    			t1 = space();
    			section1 = element("section");
    			div = element("div");
    			div.textContent = "Create";
    			t3 = space();
    			h3 = element("h3");
    			h3.textContent = "Saved Configurations";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			t6 = space();
    			if (if_block) if_block.c();
    			add_location(h1, file$3, 97, 2, 2888);
    			attr_dev(section0, "class", "header svelte-l0qpl9");
    			add_location(section0, file$3, 96, 1, 2860);
    			attr_dev(div, "class", "button svelte-l0qpl9");
    			add_location(div, file$3, 100, 2, 2939);
    			add_location(h3, file$3, 101, 2, 3000);
    			attr_dev(section1, "class", "svelte-l0qpl9");
    			add_location(section1, file$3, 99, 1, 2926);
    			add_location(main, file$3, 95, 0, 2851);
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
    			append_dev(section1, div);
    			append_dev(section1, t3);
    			append_dev(section1, h3);
    			append_dev(section1, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section1, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(section1, null);
    			}

    			append_dev(main, t6);
    			if (if_block) if_block.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*createProfile*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*configs, deleteConfig, openConfig, downloadConfig, installConfig*/ 1858) {
    				each_value = /*configs*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(section1, null);
    				}
    			}

    			if (/*showModal*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $Configs;
    	validate_store(Configs, "Configs");
    	component_subscribe($$self, Configs, $$value => $$invalidate(12, $Configs = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		console.log($Configs);
    	});

    	let currentConfig;
    	let configs = $Configs;
    	let showModal = false;
    	let save_button;

    	function createProfile() {
    		const config = new Config();
    		$Configs.push(config);
    		config.save();
    		$$invalidate(1, configs = [...$Configs]);
    		$$invalidate(0, currentConfig = config);
    		$$invalidate(2, showModal = true);
    	}

    	function closeProfile() {
    		$$invalidate(0, currentConfig = undefined);
    		$$invalidate(2, showModal = false);
    	}

    	function getConfig(id) {
    		let found = [];

    		for (let config of $Configs) {
    			if (config.id == id) {
    				found.push(config);
    			}
    		}

    		return found[0];
    	}

    	function openConfig(e) {
    		let el = e.target;

    		//console.log(el, el.parentElement)
    		if (el.id.length == 0 && el.parentElement.id.length > 0) {
    			el = el.parentElement;
    		}

    		//console.log(el)
    		let id = [...el.attributes].find(el => el.name == "id").value;

    		let config = getConfig(id);
    		console.log(config);
    		$$invalidate(0, currentConfig = config);

    		//console.log(currentConfig)
    		$$invalidate(2, showModal = true);
    	}

    	function saveCurrent() {
    		if (typeof currentConfig === "undefined") return;
    		$$invalidate(3, save_button.innerHTML = "Saving...", save_button);
    		let id = currentConfig.id;

    		for (let config of $Configs) {
    			if (config.id == id) {
    				config.save();
    			}
    		}

    		$$invalidate(3, save_button.innerHTML = "Saved!", save_button);
    		$$invalidate(1, configs = [...$Configs]);
    		setTimeout(() => $$invalidate(3, save_button.innerHTML = "Save Changes", save_button), 1000);
    	}

    	function ClickForConfig(e) {
    		let el = e.target;

    		if (el.id.length == 0 && el.parentElement.id.length > 0) {
    			el = el.parentElement;
    		}

    		let id = [...el.attributes].find(el => el.name == "id").value;
    		let config = getConfig(id);
    		return config;
    	}

    	function downloadConfig(e) {
    		let config = ClickForConfig(e);
    		let compiled = config.compile();
    		let blob = new Blob([compiled], { type: "application/xml" });
    		let url = URL.createObjectURL(blob);
    		window.open(url, "_blank");
    	}

    	function installConfig(e) {
    		let config = ClickForConfig(e);
    		console.log(config);
    		let compiled = config.compile();
    		let blob = new Blob([compiled], { type: "application/x-apple-aspen-config" });
    		let url = URL.createObjectURL(blob);
    		window.open(url, "_blank");
    	}

    	function deleteConfig(e) {
    		let config = ClickForConfig(e);

    		if (confirm(`Are you sure you would like to remove the Config "${config.config_name}"? This action cannot be undone`)) {
    			console.log(config);
    			$Configs.splice($Configs.findIndex(c => c.id == config.id), 1);
    			removeConfigLS(config.id);
    			$$invalidate(1, configs = [...$Configs]);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			save_button = $$value;
    			$$invalidate(3, save_button);
    		});
    	}

    	$$self.$capture_state = () => ({
    		AddApp,
    		onMount,
    		Configs,
    		removeConfigLS,
    		Config,
    		currentConfig,
    		configs,
    		showModal,
    		save_button,
    		createProfile,
    		closeProfile,
    		getConfig,
    		openConfig,
    		saveCurrent,
    		ClickForConfig,
    		downloadConfig,
    		installConfig,
    		deleteConfig,
    		$Configs
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentConfig" in $$props) $$invalidate(0, currentConfig = $$props.currentConfig);
    		if ("configs" in $$props) $$invalidate(1, configs = $$props.configs);
    		if ("showModal" in $$props) $$invalidate(2, showModal = $$props.showModal);
    		if ("save_button" in $$props) $$invalidate(3, save_button = $$props.save_button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentConfig,
    		configs,
    		showModal,
    		save_button,
    		createProfile,
    		closeProfile,
    		openConfig,
    		saveCurrent,
    		downloadConfig,
    		installConfig,
    		deleteConfig,
    		div1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* eslint-disable no-undef */
    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
