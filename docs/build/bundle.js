var app=function(){"use strict";function e(){}function n(e){return e()}function t(){return Object.create(null)}function o(e){e.forEach(n)}function i(e){return"function"==typeof e}function r(e,n){return e!=e?n==n:e!==n||e&&"object"==typeof e||"function"==typeof e}function l(e,n,t,o){return e[1]&&o?function(e,n){for(const t in n)e[t]=n[t];return e}(t.ctx.slice(),e[1](o(n))):t.ctx}function c(e,n,t,o,i,r,c){const a=function(e,n,t,o){if(e[2]&&o){const i=e[2](o(t));if(void 0===n.dirty)return i;if("object"==typeof i){const e=[],t=Math.max(n.dirty.length,i.length);for(let o=0;o<t;o+=1)e[o]=n.dirty[o]|i[o];return e}return n.dirty|i}return n.dirty}(n,o,i,r);if(a){const i=l(n,t,o,c);e.p(i,a)}}function a(e,n){e.appendChild(n)}function s(e,n,t){e.insertBefore(n,t||null)}function u(e){e.parentNode.removeChild(e)}function f(e){return document.createElement(e)}function d(e){return document.createTextNode(e)}function p(){return d(" ")}function g(e,n,t,o){return e.addEventListener(n,t,o),()=>e.removeEventListener(n,t,o)}function y(e,n,t){null==t?e.removeAttribute(n):e.getAttribute(n)!==t&&e.setAttribute(n,t)}function m(e,n){e.value=null==n?"":n}let h;function $(e){h=e}function v(){const e=function(){if(!h)throw new Error("Function called outside component initialization");return h}();return(n,t)=>{const o=e.$$.callbacks[n];if(o){const i=function(e,n){const t=document.createEvent("CustomEvent");return t.initCustomEvent(e,!1,!1,n),t}(n,t);o.slice().forEach((n=>{n.call(e,i)}))}}}const b=[],w=[],k=[],x=[],P=Promise.resolve();let _=!1;function C(e){k.push(e)}function D(e){x.push(e)}let U=!1;const R=new Set;function E(){if(!U){U=!0;do{for(let e=0;e<b.length;e+=1){const n=b[e];$(n),I(n.$$)}for($(null),b.length=0;w.length;)w.pop()();for(let e=0;e<k.length;e+=1){const n=k[e];R.has(n)||(R.add(n),n())}k.length=0}while(b.length);for(;x.length;)x.pop()();_=!1,U=!1,R.clear()}}function I(e){if(null!==e.fragment){e.update(),o(e.before_update);const n=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,n),e.after_update.forEach(C)}}const L=new Set;let T;function S(){T={r:0,c:[],p:T}}function A(){T.r||o(T.c),T=T.p}function q(e,n){e&&e.i&&(L.delete(e),e.i(n))}function N(e,n,t,o){if(e&&e.o){if(L.has(e))return;L.add(e),T.c.push((()=>{L.delete(e),o&&(t&&e.d(1),o())})),e.o(n)}}function V(e,n,t){const o=e.$$.props[n];void 0!==o&&(e.$$.bound[o]=t,t(e.$$.ctx[o]))}function j(e){e&&e.c()}function O(e,t,r){const{fragment:l,on_mount:c,on_destroy:a,after_update:s}=e.$$;l&&l.m(t,r),C((()=>{const t=c.map(n).filter(i);a?a.push(...t):o(t),e.$$.on_mount=[]})),s.forEach(C)}function M(e,n){const t=e.$$;null!==t.fragment&&(o(t.on_destroy),t.fragment&&t.fragment.d(n),t.on_destroy=t.fragment=null,t.ctx=[])}function B(e,n){-1===e.$$.dirty[0]&&(b.push(e),_||(_=!0,P.then(E)),e.$$.dirty.fill(0)),e.$$.dirty[n/31|0]|=1<<n%31}function F(n,i,r,l,c,a,s=[-1]){const f=h;$(n);const d=i.props||{},p=n.$$={fragment:null,ctx:null,props:a,update:e,not_equal:c,bound:t(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:[]),callbacks:t(),dirty:s,skip_bound:!1};let g=!1;if(p.ctx=r?r(n,d,((e,t,...o)=>{const i=o.length?o[0]:t;return p.ctx&&c(p.ctx[e],p.ctx[e]=i)&&(!p.skip_bound&&p.bound[e]&&p.bound[e](i),g&&B(n,e)),t})):[],p.update(),g=!0,o(p.before_update),p.fragment=!!l&&l(p.ctx),i.target){if(i.hydrate){const e=function(e){return Array.from(e.childNodes)}(i.target);p.fragment&&p.fragment.l(e),e.forEach(u)}else p.fragment&&p.fragment.c();i.intro&&q(n.$$.fragment),O(n,i.target,i.anchor),E()}$(f)}class W{$destroy(){M(this,1),this.$destroy=e}$on(e,n){const t=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return t.push(n),()=>{const e=t.indexOf(n);-1!==e&&t.splice(e,1)}}$set(e){var n;this.$$set&&(n=e,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}var z="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),Y=new Uint8Array(16);function G(){if(!z)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return z(Y)}var H=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;function J(e){return"string"==typeof e&&H.test(e)}for(var K=[],Q=0;Q<256;++Q)K.push((Q+256).toString(16).substr(1));function X(e,n,t){var o=(e=e||{}).random||(e.rng||G)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,n){t=t||0;for(var i=0;i<16;++i)n[t+i]=o[i];return n}return function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,t=(K[e[n+0]]+K[e[n+1]]+K[e[n+2]]+K[e[n+3]]+"-"+K[e[n+4]]+K[e[n+5]]+"-"+K[e[n+6]]+K[e[n+7]]+"-"+K[e[n+8]]+K[e[n+9]]+"-"+K[e[n+10]]+K[e[n+11]]+K[e[n+12]]+K[e[n+13]]+K[e[n+14]]+K[e[n+15]]).toLowerCase();if(!J(t))throw TypeError("Stringified UUID is invalid");return t}(o)}const{parse:Z,build:ee}=globalThis.plist;console.log(Z('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n        <key>PayloadContent</key>\n        <array>\n                <dict>\n                        <key>FullScreen</key>\n                        <true/>\n                        <key>Icon</key>\n                        <data>\n                        iconData\n                        </data>\n                        <key>IsRemovable</key>\n                        <true/>\n                        <key>Label</key>\n                        <string></string>\n                        <key>PayloadDescription</key>\n                        <string></string>\n                        <key>PayloadDisplayName</key>\n                        <string></string>\n                        <key>PayloadIdentifier</key>\n                        <string></string>\n                        <key>PayloadType</key>\n                        <string>com.apple.webClip.managed</string>\n                        <key>PayloadUUID</key>\n                        <string></string>\n                        <key>PayloadVersion</key>\n                        <integer>1</integer>\n                        <key>Precomposed</key>\n                        <true/>\n                        <key>URL</key>\n                        <string></string>\n                </dict>\n        </array>\n        <key>PayloadDescription</key>\n        <string></string>\n        <key>PayloadDisplayName</key>\n        <string></string>\n        <key>PayloadIdentifier</key>\n        <string></string>\n        <key>PayloadOrganization</key>\n        <string></string>\n        <key>PayloadRemovalDisallowed</key>\n        <false/>\n        <key>PayloadType</key>\n        <string>Configuration</string>\n        <key>PayloadUUID</key>\n        <string></string>\n        <key>PayloadVersion</key>\n        <integer>1</integer>\n</dict>\n</plist>'));const ne=e=>({}),te=e=>({class:"body"});function oe(e){let n,t,o,i,r,m,h,$,v,b,w;const k=e[4].default,x=function(e,n,t,o){if(e){const i=l(e,n,t,o);return e[0](i)}}(k,e,e[3],te);return{c(){n=f("main"),t=f("div"),o=f("h3"),i=d(e[0]),r=p(),m=f("div"),h=f("div"),h.textContent="Remove",$=p(),x&&x.c(),y(h,"class","red svelte-107lul"),y(m,"class","controls svelte-107lul"),y(t,"class","header svelte-107lul")},m(l,c){s(l,n,c),a(n,t),a(t,o),a(o,i),a(t,r),a(t,m),a(m,h),a(n,$),x&&x.m(n,null),v=!0,b||(w=g(h,"click",e[1]),b=!0)},p(e,[n]){(!v||1&n)&&function(e,n){n=""+n,e.wholeText!==n&&(e.data=n)}(i,e[0]),x&&x.p&&8&n&&c(x,k,e,e[3],n,ne,te)},i(e){v||(q(x,e),v=!0)},o(e){N(x,e),v=!1},d(e){e&&u(n),x&&x.d(e),b=!1,w()}}}function ie(e,n,t){let{$$slots:o={},$$scope:i}=n;var{title:r=""}=n;let{cellid:l}=n;const c=v();return e.$$set=e=>{"title"in e&&t(0,r=e.title),"cellid"in e&&t(2,l=e.cellid),"$$scope"in e&&t(3,i=e.$$scope)},[r,function(){c("message",{remove:!0,id:l})},l,i,o]}class re extends W{constructor(e){super(),F(this,e,ie,oe,r,{title:0,cellid:2})}}function le(n){let t,i,r,l,c,d,m,h,$;return{c(){var e,o,a;t=f("main"),i=f("div"),r=f("input"),c=p(),d=f("img"),y(r,"type","file"),y(r,"name",l="icon["+n[1]+"]"),e="display",o="none",r.style.setProperty(e,o,a?"important":""),r.required=!0,d.src!==(m=n[0])&&y(d,"src",m),y(d,"alt","Click to add Icon"),y(d,"class","svelte-1qmhx7o"),y(i,"class","icon svelte-1qmhx7o")},m(e,o){s(e,t,o),a(t,i),a(i,r),n[5](r),a(i,c),a(i,d),h||($=[g(r,"change",n[4]),g(i,"click",n[3])],h=!0)},p(e,[n]){2&n&&l!==(l="icon["+e[1]+"]")&&y(r,"name",l),1&n&&d.src!==(m=e[0])&&y(d,"src",m)},i:e,o:e,d(e){e&&u(t),n[5](null),h=!1,o($)}}}function ce(e,n,t){let o,{icon:i=""}=n,{index:r}=n;return e.$$set=e=>{"icon"in e&&t(0,i=e.icon),"index"in e&&t(1,r=e.index)},[i,r,o,function(){o.click()},function(){let e=o.files[0],n=new FileReader;n.onload=e=>{t(0,i=e.target.result)},n.readAsDataURL(e),console.log(i)},function(e){w[e?"unshift":"push"]((()=>{o=e,t(2,o)}))}]}class ae extends W{constructor(e){super(),F(this,e,ce,le,r,{icon:0,index:1})}}function se(e,n,t){const o=e.slice();return o[19]=n[t],o[20]=n,o[21]=t,o}function ue(e){let n,t,i,r,l,c,a,d,h,$,v;function b(){e[10].call(n,e[21])}function k(n){e[11].call(null,n,e[21])}let x={index:e[21]};function P(){e[12].call(a,e[21])}return void 0!==e[2].webclips[e[21]].iconurl&&(x.icon=e[2].webclips[e[21]].iconurl),r=new ae({props:x}),w.push((()=>V(r,"icon",k))),{c(){n=f("input"),i=p(),j(r.$$.fragment),c=p(),a=f("input"),y(n,"type","text"),y(n,"name",t="name["+e[21]+"]"),y(n,"placeholder","Name"),n.required=!0,y(a,"type","url"),y(a,"name",d="url["+e[21]+"]"),y(a,"placeholder","URL"),a.required=!0},m(t,o){s(t,n,o),m(n,e[2].webclips[e[21]].name),s(t,i,o),O(r,t,o),s(t,c,o),s(t,a,o),m(a,e[2].webclips[e[21]].url),h=!0,$||(v=[g(n,"input",b),g(a,"input",P)],$=!0)},p(t,o){e=t,4&o&&n.value!==e[2].webclips[e[21]].name&&m(n,e[2].webclips[e[21]].name);const i={};!l&&4&o&&(l=!0,i.icon=e[2].webclips[e[21]].iconurl,D((()=>l=!1))),r.$set(i),4&o&&m(a,e[2].webclips[e[21]].url)},i(e){h||(q(r.$$.fragment,e),h=!0)},o(e){N(r.$$.fragment,e),h=!1},d(e){e&&u(n),e&&u(i),M(r,e),e&&u(c),e&&u(a),$=!1,o(v)}}}function fe(e){let n,t,o;return t=new re({props:{title:"Web App Settings",cellid:e[21],$$slots:{default:[ue]},$$scope:{ctx:e}}}),t.$on("message",e[7]),{c(){n=f("div"),j(t.$$.fragment),y(n,"class","formgroup")},m(e,i){s(e,n,i),O(t,n,null),o=!0},p(e,n){const o={};4194308&n&&(o.$$scope={dirty:n,ctx:e}),t.$set(o)},i(e){o||(q(t.$$.fragment,e),o=!0)},o(e){N(t.$$.fragment,e),o=!1},d(e){e&&u(n),M(t)}}}function de(e){let n,t,o,i;return{c(){n=f("p"),t=d("Download: "),o=f("a"),i=d("install.mobileconfig"),y(o,"href",e[4])},m(e,r){s(e,n,r),a(n,t),a(n,o),a(o,i)},p(e,n){16&n&&y(o,"href",e[4])},d(e){e&&u(n)}}}function pe(e){let n,t,i,r,l,c,d,h,$,v,b,w,k,x,P,_,C,D,U=e[5],R=[];for(let n=0;n<U.length;n+=1)R[n]=fe(se(e,U,n));const E=e=>N(R[e],1,1,(()=>{R[e]=null}));let I=e[3]&&de(e);return{c(){n=f("main"),t=f("form"),i=f("div"),r=f("h3"),r.textContent="Config Settings",l=p(),c=f("input"),d=p(),h=f("input"),$=p();for(let e=0;e<R.length;e+=1)R[e].c();v=p(),b=f("div"),b.textContent="Add App",w=p(),k=f("br"),x=f("br"),P=p(),I&&I.c(),y(c,"type","text"),y(c,"name","config_name"),y(c,"placeholder","Profile Name"),c.required=!0,y(h,"type","text"),y(h,"name","config_author"),y(h,"placeholder","Profile Author"),h.required=!0,y(i,"class","formgroup"),y(b,"class","button svelte-1lwujg1"),y(t,"enctype","multipart/form-data")},m(o,u){s(o,n,u),a(n,t),a(t,i),a(i,r),a(i,l),a(i,c),m(c,e[2].config_name),a(i,d),a(i,h),m(h,e[2].config_author),a(t,$);for(let e=0;e<R.length;e+=1)R[e].m(t,null);a(t,v),a(t,b),a(t,w),a(t,k),a(t,x),a(t,P),I&&I.m(t,null),e[13](t),_=!0,C||(D=[g(c,"input",e[8]),g(h,"input",e[9]),g(b,"click",e[6]),g(t,"submit",e[1])],C=!0)},p(e,[n]){if(4&n&&c.value!==e[2].config_name&&m(c,e[2].config_name),4&n&&h.value!==e[2].config_author&&m(h,e[2].config_author),164&n){let o;for(U=e[5],o=0;o<U.length;o+=1){const i=se(e,U,o);R[o]?(R[o].p(i,n),q(R[o],1)):(R[o]=fe(i),R[o].c(),q(R[o],1),R[o].m(t,v))}for(S(),o=U.length;o<R.length;o+=1)E(o);A()}e[3]?I?I.p(e,n):(I=de(e),I.c(),I.m(t,null)):I&&(I.d(1),I=null)},i(e){if(!_){for(let e=0;e<U.length;e+=1)q(R[e]);_=!0}},o(e){R=R.filter(Boolean);for(let e=0;e<R.length;e+=1)N(R[e]);_=!1},d(t){t&&u(n),function(e,n){for(let t=0;t<e.length;t+=1)e[t]&&e[t].d(n)}(R,t),I&&I.d(),e[13](null),C=!1,o(D)}}}function ge(e,n,t){var o=this&&this.__awaiter||function(e,n,t,o){return new(t||(t=Promise))((function(i,r){function l(e){try{a(o.next(e))}catch(e){r(e)}}function c(e){try{a(o.throw(e))}catch(e){r(e)}}function a(e){var n;e.done?i(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(l,c)}a((o=o.apply(e,n||[])).next())}))};const i={form:null};let r,l,c=!1,a={config_name:"",config_author:"",webclips:[]};return e.$$.update=()=>{e.$$.dirty,4&e.$$.dirty&&t(5,l=a.webclips)},[i,function(e){return o(this,void 0,void 0,(function*(){e.preventDefault();let n=a;for(let e in n.webclips){let t=n.webclips[e],o=yield fetch(t.iconurl).then((e=>e.arrayBuffer()));n.webclips[e].icon=new Uint8Array(o)}let o=function(e){const n=X().toUpperCase(),t=[];for(const n of e.webclips){const e=X().toUpperCase();t.push({FullScreen:!0,Icon:n.icon,IsRemovable:!0,Label:n.name,PayloadDescription:"Web app bundled into a config, generated by @S0n1c_Dev",PayloadIdentifier:`com.apple.webClip.managed.${e}`,PayloadType:"com.apple.webClip.managed",PayloadUUID:e,PayloadVersion:1,Precomposed:!0,URL:n.url})}const o={PayloadContent:t,PayloadDescription:"This config was generated via WebClip Maker by @S0n1c_Dev.",PayloadDisplayName:e.config_name,PayloadIdentifier:`ca.s0n1c.ios.webclip.${n}`,PayloadOrganization:e.config_author,PayloadRemovalDisallowed:!1,PayloadType:"Configuration",PayloadUUID:n,PayloadVersion:1};let i;try{i=ee(o)}catch(e){throw console.log(e),e}return console.log(i),i}(n),i=new Blob([o],{type:"application/x-apple-aspen-config"}),l=URL.createObjectURL(i);t(4,r=l),t(3,c=!0)}))},a,c,r,l,function(){t(2,a.webclips=[...a.webclips,{name:"",icon:null,iconurl:"",url:""}],a)},function(e){console.log(e),"boolean"==typeof e.detail.remove&&e.detail.remove&&(console.log(`removing payload ${e.detail.id}`,e.detail,a.webclips[e.detail.id]),function(e){let n=[...a.webclips];n.splice(e,1),t(2,a.webclips=[...n],a)}(e.detail.id))},function(){a.config_name=this.value,t(2,a)},function(){a.config_author=this.value,t(2,a)},function(e){a.webclips[e].name=this.value,t(2,a)},function(e,n){a.webclips[n].iconurl=e,t(2,a)},function(e){a.webclips[e].url=this.value,t(2,a)},function(e){w[e?"unshift":"push"]((()=>{i.form=e,t(0,i)}))}]}class ye extends W{constructor(e){super(),F(this,e,ge,pe,r,{exported:0,generate:1})}get exported(){return this.$$.ctx[0]}get generate(){return this.$$.ctx[1]}}function me(e){let n,t,r,l,c,d,m,h,$,v,b,k,x,P,_,C,U,R,E,I,L,T,B,F;function W(n){e[5].call(null,n)}function z(n){e[6].call(null,n)}var Y=ye;function G(e){let n={};return void 0!==e[0]&&(n.generate=e[0]),void 0!==e[1]&&(n.exported=e[1]),{props:n}}return Y&&(R=new Y(G(e)),w.push((()=>V(R,"generate",W))),w.push((()=>V(R,"exported",z)))),{c(){n=f("main"),t=f("section"),t.innerHTML="<h1>Webclip Maker</h1>",r=p(),l=f("section"),c=f("p"),c.textContent="You don't seem to have any saved web app profiles... Make one below!",d=p(),m=f("div"),m.textContent="Create",h=p(),$=f("div"),b=p(),k=f("div"),x=f("div"),P=f("div"),P.textContent="Generate",_=p(),C=f("div"),C.textContent="✕",U=p(),R&&j(R.$$.fragment),y(t,"class","header svelte-15wa1ro"),y(m,"class","button svelte-15wa1ro"),y(l,"class","svelte-15wa1ro"),y($,"class","modal-overlay svelte-15wa1ro"),$.hidden=v=!e[2],y(P,"class","svelte-15wa1ro"),y(C,"class","red svelte-15wa1ro"),y(x,"class","buttons svelte-15wa1ro"),y(k,"class",L="modal "+(e[2]?"show":"")+" svelte-15wa1ro")},m(o,u){s(o,n,u),a(n,t),a(n,r),a(n,l),a(l,c),a(l,d),a(l,m),a(n,h),a(n,$),a(n,b),a(n,k),a(k,x),a(x,P),a(x,_),a(x,C),a(k,U),R&&O(R,k,null),T=!0,B||(F=[g(m,"click",e[3]),g($,"click",e[4]),g(P,"click",(function(){i(e[1].form.requestSubmit())&&e[1].form.requestSubmit().apply(this,arguments)})),g(C,"click",e[4])],B=!0)},p(n,[t]){e=n,(!T||4&t&&v!==(v=!e[2]))&&($.hidden=v);const o={};if(!E&&1&t&&(E=!0,o.generate=e[0],D((()=>E=!1))),!I&&2&t&&(I=!0,o.exported=e[1],D((()=>I=!1))),Y!==(Y=ye)){if(R){S();const e=R;N(e.$$.fragment,1,0,(()=>{M(e,1)})),A()}Y?(R=new Y(G(e)),w.push((()=>V(R,"generate",W))),w.push((()=>V(R,"exported",z))),j(R.$$.fragment),q(R.$$.fragment,1),O(R,k,null)):R=null}else Y&&R.$set(o);(!T||4&t&&L!==(L="modal "+(e[2]?"show":"")+" svelte-15wa1ro"))&&y(k,"class",L)},i(e){T||(R&&q(R.$$.fragment,e),T=!0)},o(e){R&&N(R.$$.fragment,e),T=!1},d(e){e&&u(n),R&&M(R),B=!1,o(F)}}}function he(e,n,t){let o,i,r=!0;return[o,i,r,function(){t(2,r=!0)},function(){t(2,r=!1)},function(e){o=e,t(0,o)},function(e){i=e,t(1,i)}]}return new class extends W{constructor(e){super(),F(this,e,he,me,r,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
