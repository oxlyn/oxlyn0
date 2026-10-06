/* Hanzi Writer v3.5.0 (MIT License, https://chanind.github.io/hanzi-writer) 内置离线版 */
/**
 * Hanzi Writer v3.5.0 | https://chanind.github.io/hanzi-writer
 */

var HanziWriter=function(){"use strict";var t;const e="undefined"==typeof window?global:window,r=e.performance&&(()=>e.performance.now())||(()=>Date.now()),i=e.requestAnimationFrame||(t=>setTimeout(()=>t(r()),1e3/60)),s=e.cancelAnimationFrame||clearTimeout;function o(t){return t[t.length-1]}const n=(t,e)=>t<0?e+t:t;function a(t,e){const r={...t};for(const i in e){const s=t[i],o=e[i];s!==o&&(s&&o&&"object"==typeof s&&"object"==typeof o&&!Array.isArray(o)?r[i]=a(s,o):r[i]=o)}return r}let h=0;function l(){return h++,h}function c(t){return t.reduce((t,e)=>e+t,0)/t.length}function d(t){const e=t.toUpperCase().trim();if(/^#([A-F0-9]{3}){1,2}$/.test(e)){let t=e.substring(1).split("");3===t.length&&(t=[t[0],t[0],t[1],t[1],t[2],t[2]]);const r=""+t.join("");return{r:parseInt(r.slice(0,2),16),g:parseInt(r.slice(2,4),16),b:parseInt(r.slice(4,6),16),a:1}}const r=e.match(/^RGBA?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d*\.?\d+))?\)$/);if(r)return{r:parseInt(r[1],10),g:parseInt(r[2],10),b:parseInt(r[3],10),a:parseFloat(r[4]||1,10)};throw new Error("Invalid color: "+t)}function u(t,e){const r={};for(let i=0;i<e;i++)r[i]=t;return r}function _(t,e){const r={};for(let i=0;i<t;i++)r[i]=e(i);return r}const p=(null===(t=e.navigator)||void 0===t?void 0:t.userAgent)||"",g=p.indexOf("MSIE ")>0||p.indexOf("Trident/")>0||p.indexOf("Edge/")>0,k=()=>{};class m{constructor(t,e,r=k){this._mutationChains=[],this._onStateChange=r,this.state={options:{drawingFadeDuration:e.drawingFadeDuration,drawingWidth:e.drawingWidth,drawingColor:d(e.drawingColor),strokeColor:d(e.strokeColor),outlineColor:d(e.outlineColor),radicalColor:d(e.radicalColor||e.strokeColor),highlightColor:d(e.highlightColor)},character:{main:{opacity:e.showCharacter?1:0,strokes:{}},outline:{opacity:e.showOutline?1:0,strokes:{}},highlight:{opacity:1,strokes:{}}},userStrokes:null};for(let e=0;e<t.strokes.length;e++)this.state.character.main.strokes[e]={opacity:1,displayPortion:1},this.state.character.outline.strokes[e]={opacity:1,displayPortion:1},this.state.character.highlight.strokes[e]={opacity:0,displayPortion:1}}overwriteOnStateChange(t){this._onStateChange=t}updateState(t){const e=a(this.state,t);this._onStateChange(e,this.state),this.state=e}run(t,e={}){const r=t.map(t=>t.scope);return this.cancelMutations(r),new Promise(i=>{const s={_isActive:!0,_index:0,_resolve:i,_mutations:t,_loop:e.loop,_scopes:r};this._mutationChains.push(s),this._run(s)})}_run(t){if(!t._isActive)return;const e=t._mutations;if(t._index>=e.length){if(!t._loop)return t._isActive=!1,this._mutationChains=this._mutationChains.filter(e=>e!==t),void t._resolve({canceled:!1});t._index=0}t._mutations[t._index].run(this).then(()=>{t._isActive&&(t._index++,this._run(t))})}_getActiveMutations(){return this._mutationChains.map(t=>t._mutations[t._index])}pauseAll(){this._getActiveMutations().forEach(t=>t.pause())}resumeAll(){this._getActiveMutations().forEach(t=>t.resume())}cancelMutations(t){for(const e of this._mutationChains)for(const r of e._scopes)for(const i of t)(r.startsWith(i)||i.startsWith(r))&&this._cancelMutationChain(e)}cancelAll(){this.cancelMutations([""])}_cancelMutationChain(t){var e;t._isActive=!1;for(let e=t._index;e<t._mutations.length;e++)t._mutations[e].cancel(this);null===(e=t._resolve)||void 0===e||e.call(t,{canceled:!0}),this._mutationChains=this._mutationChains.filter(e=>e!==t)}}const f=(t,e)=>({x:t.x-e.x,y:t.y-e.y}),v=t=>Math.sqrt(Math.pow(t.x,2)+Math.pow(t.y,2)),y=(t,e)=>v(f(t,e)),C=(t,e=1)=>{const r=10*e;return{x:Math.round(r*t.x)/r,y:Math.round(r*t.y)/r}},w=t=>{let e=t[0];return t.slice(1).reduce((t,r)=>{const i=y(r,e);return e=r,t+i},0)},S=(t,e,r)=>{const i=f(e,t),s=r/v(i);return{x:e.x+s*i.x,y:e.y+s*i.y}},P=t=>{const e=((t,e=30)=>{const r=w(t)/(e-1),i=[t[0]],s=o(t),n=t.slice(1);for(let t=0;t<e-2;t++){let t=o(i),e=r,s=!1;for(;!s;){const r=y(t,n[0]);if(r<e)e-=r,t=n.shift();else{const o=S(t,n[0],e-r);i.push(o),s=!0}}}return i.push(s),i})(t),r={x:c(e.map(t=>t.x)),y:c(e.map(t=>t.y))},i=e.map(t=>f(t,r)),s=Math.sqrt(c([Math.pow(i[0].x,2)+Math.pow(i[0].y,2),Math.pow(o(i).x,2)+Math.pow(o(i).y,2)]));return((t,e=.05)=>{const r=t.slice(0,1);for(const i of t.slice(1)){const t=r[r.length-1],s=y(i,t);if(s>e){const o=Math.ceil(s/e),n=s/o;for(let e=0;e<o;e++)r.push(S(i,t,-1*n*(e+1)))}else r.push(i)}return r})(i.map(t=>({x:t.x/s,y:t.y/s})))};function D(t,e=!1){const r=C(t[0]),i=t.slice(1);let s=`M ${r.x} ${r.y}`;return i.forEach(t=>{const e=C(t);s+=` L ${e.x} ${e.y}`}),e&&(s+="Z"),s}const x=(t,e)=>{const r=(t=>{if(t.length<3)return t;const e=[t[0],t[1]];return t.slice(2).forEach(t=>{const r=e.length,i=f(t,e[r-1]),s=f(e[r-1],e[r-2]);i.y*s.x-i.x*s.y==0&&e.pop(),e.push(t)}),e})(t);if(r.length<2)return r;const i=r[1],s=r[0],o=S(i,s,e),n=r.slice(1);return n.unshift(o),n};class M{constructor(t,e,r,i=!1){this.path=t,this.points=e,this.strokeNum=r,this.isInRadical=i}getStartingPoint(){return this.points[0]}getEndingPoint(){return this.points[this.points.length-1]}getLength(){return w(this.points)}getVectors(){let t=this.points[0];return this.points.slice(1).map(e=>{const r=f(e,t);return t=e,r})}getDistance(t){const e=this.points.map(e=>y(e,t));return Math.min(...e)}getAverageDistance(t){return t.reduce((t,e)=>t+this.getDistance(e),0)/t.length}}class R{constructor(t,e){this.symbol=t,this.strokes=e}}function T({radStrokes:t,strokes:e,medians:r}){return e.map((e,i)=>{const s=r[i].map(t=>{const[e,r]=t;return{x:e,y:r}});return new M(e,s,i,(o=i,(null!==(n=null==t?void 0:t.indexOf(o))&&void 0!==n?n:-1)>=0));var o,n})}const[A,O]=[{x:0,y:-124},{x:1024,y:900}],b=O.x-A.x,$=O.y-A.y;class L{constructor(t){const{padding:e,width:r,height:i}=t;this.padding=e,this.width=r,this.height=i;const s=r-2*e,o=i-2*e,n=s/b,a=o/$;this.scale=Math.min(n,a);const h=e+(s-this.scale*b)/2,l=e+(o-this.scale*$)/2;this.xOffset=-1*A.x*this.scale+h,this.yOffset=-1*A.y*this.scale+l}convertExternalPoint(t){return{x:(t.x-this.xOffset)/this.scale,y:(this.height-this.yOffset-t.y)/this.scale}}}const z=(t,e)=>{const r=(t=>{const e=[];let r=t[0];return t.slice(1).forEach(t=>{e.push(f(t,r)),r=t}),e})(t),i=e.getVectors();return c(r.map(t=>{const e=i.map(e=>{return i=t,((r=e).x*i.x+r.y*i.y)/v(r)/v(i);var r,i});return Math.max(...e)}))>0},E=t=>{if(t.length<2)return t;const[e,...r]=t,i=[e];for(const t of r)s=t,o=i[i.length-1],(s.x!==o.x||s.y!==o.y)&&i.push(t);var s,o;return i},W=[Math.PI/16,Math.PI/32,0,-1*Math.PI/32,-1*Math.PI/16],F=(t,e,r)=>{const i=P(t),s=P(e);let o=1/0;return W.forEach(t=>{const e=((t,e)=>{const r=t.length>=e.length?t:e,i=t.length>=e.length?e:t,s=(t,e,s,o)=>{if(0===t&&0===e)return y(r[0],i[0]);if(t>0&&0===e)return Math.max(s[0],y(r[t],i[0]));const n=o[o.length-1];return 0===t&&e>0?Math.max(n,y(r[0],i[e])):Math.max(Math.min(s[e],s[e-1],n),y(r[t],i[e]))};let o=[];for(let t=0;t<r.length;t++){const e=[];for(let r=0;r<i.length;r++)e.push(s(t,r,o,e));o=e}return o[i.length-1]})(i,((t,e)=>t.map(t=>({x:Math.cos(e)*t.x-Math.sin(e)*t.y,y:Math.sin(e)*t.x+Math.cos(e)*t.y})))(s,t));e<o&&(o=e)}),o<=.4*r},H=(t,e,r)=>{const{leniency:i=1,isOutlineVisible:s=!1,checkBackwards:o=!0}=r,n=e.getAverageDistance(t),a=n<=350*(s||e.strokeNum>0?.5:1)*i;if(!a)return{isMatch:!1,avgDist:n,meta:{isStrokeBackwards:!1}};const h=((t,e,r)=>{const i=y(e.getStartingPoint(),t[0]),s=y(e.getEndingPoint(),t[t.length-1]);return i<=250*r&&s<=250*r})(t,e,i),l=z(t,e),c=F(t,e.points,i),d=((t,e,r)=>r*(w(t)+25)/(e.getLength()+25)>=.35)(t,e,i),u=a&&h&&l&&c&&d;if(o&&!u){if(H([...t].reverse(),e,{...r,checkBackwards:!1}).isMatch)return{isMatch:u,avgDist:n,meta:{isStrokeBackwards:!0}}}return{isMatch:u,avgDist:n,meta:{isStrokeBackwards:!1}}};class I{constructor(t,e,r){this.id=t,this.points=[e],this.externalPoints=[r]}appendPoint(t,e){this.points.push(t),this.externalPoints.push(e)}}class B{constructor(t,e,r={}){this._tick=t=>{if(null!==this._startPauseTime)return;const e=Math.min(1,(t-this._startTime-this._pausedDuration)/this._duration);if(1===e)this._renderState.updateState(this._values),this._frameHandle=void 0,this.cancel(this._renderState);else{const t=j(e),r=q(this._startState,this._values,t);this._renderState.updateState(r),this._frameHandle=i(this._tick)}},this.scope=t,this._valuesOrCallable=e,this._duration=r.duration||0,this._force=r.force,this._pausedDuration=0,this._startPauseTime=null}run(t){return this._values||this._inflateValues(t),0===this._duration&&t.updateState(this._values),0===this._duration||N(t.state,this._values)?Promise.resolve():(this._renderState=t,this._startState=t.state,this._startTime=performance.now(),this._frameHandle=i(this._tick),new Promise(t=>{this._resolve=t}))}_inflateValues(t){let e=this._valuesOrCallable;"function"==typeof this._valuesOrCallable&&(e=this._valuesOrCallable(t.state)),this._values=function(t,e){const r=t.split("."),i={};let s=i;for(let t=0;t<r.length;t++){const i=t===r.length-1?e:{};s[r[t]]=i,s=i}return i}(this.scope,e)}pause(){null===this._startPauseTime&&(this._frameHandle&&s(this._frameHandle),this._startPauseTime=performance.now())}resume(){null!==this._startPauseTime&&(this._frameHandle=i(this._tick),this._pausedDuration+=performance.now()-this._startPauseTime,this._startPauseTime=null)}cancel(t){var e;null===(e=this._resolve)||void 0===e||e.call(this),this._resolve=void 0,s(this._frameHandle||-1),this._frameHandle=void 0,this._force&&(this._values||this._inflateValues(t),t.updateState(this._values))}}function q(t,e,r){const i={};for(const s in e){const o=e[s],n=null==t?void 0:t[s];i[s]="number"==typeof n&&"number"==typeof o&&o>=0?r*(o-n)+n:q(n,o,r)}return i}function N(t,e){for(const r in e){const i=e[r],s=null==t?void 0:t[r];if(i>=0){if(i!==s)return!1}else if(!N(s,i))return!1}return!0}B.Delay=class{constructor(t){this._duration=t,this._startTime=null,this._paused=!1,this.scope="delay."+t}run(){return this._startTime=r(),this._runningPromise=new Promise(t=>{this._resolve=t,this._timeout=setTimeout(()=>this.cancel(),this._duration)}),this._runningPromise}pause(){if(this._paused)return;const t=performance.now()-(this._startTime||0);this._duration=Math.max(0,this._duration-t),clearTimeout(this._timeout),this._paused=!0}resume(){this._paused&&(this._startTime=performance.now(),this._timeout=setTimeout(()=>this.cancel(),this._duration),this._paused=!1)}cancel(){clearTimeout(this._timeout),this._resolve&&this._resolve(),this._resolve=void 0}};const j=t=>-Math.cos(t*Math.PI)/2+.5,U=(t,e,r)=>[new B(`character.${t}.strokes`,u({opacity:1,displayPortion:1},e.strokes.length),{duration:r,force:!0})],V=(t,e,r)=>[new B("character."+t,{opacity:1,strokes:u({opacity:1,displayPortion:1},e.strokes.length)},{duration:r,force:!0})],Q=(t,e,r)=>[new B(`character.${t}.opacity`,0,{duration:r,force:!0}),...U(t,e,0)],G=(t,e,r)=>[new B("options."+t,e,{duration:r})],X=(t,e,r)=>{const i=t.strokeNum,s=(t.getLength()+600)/(3*r);return[new B("options.highlightColor",e),new B("character.highlight",{opacity:1,strokes:{[i]:{displayPortion:0,opacity:0}}}),new B("character.highlight.strokes."+i,{displayPortion:1,opacity:1},{duration:s}),new B(`character.highlight.strokes.${i}.opacity`,0,{duration:s,force:!0})]},K=(t,e,r)=>{const i=e.strokeNum,s=(e.getLength()+600)/(3*r);return[new B("character."+t,{opacity:1,strokes:{[i]:{displayPortion:0,opacity:1}}}),new B(`character.${t}.strokes.${i}.displayPortion`,1,{duration:s})]},Y=(t,e,r,i,s)=>{let o=Q(t,e,r);return o=o.concat(U(t,e,0)),o.push(new B("character."+t,{opacity:1,strokes:u({opacity:0},e.strokes.length)},{force:!0})),e.strokes.forEach((e,r)=>{r>0&&o.push(new B.Delay(s)),o=o.concat(K(t,e,i))}),o},J=(t,e)=>[new B(`userStrokes.${t}.opacity`,0,{duration:e}),new B("userStrokes."+t,null,{force:!0})];class Z{constructor(t,e,r){this._currentStrokeIndex=0,this._mistakesOnStroke=0,this._totalMistakes=0,this._character=t,this._renderState=e,this._isActive=!1,this._positioner=r}startQuiz(t){this._isActive=!0,this._options=t;const e=n(t.quizStartStrokeNum,this._character.strokes.length);return this._currentStrokeIndex=Math.min(e,this._character.strokes.length-1),this._mistakesOnStroke=0,this._totalMistakes=0,this._renderState.run((r=this._character,i=t.strokeFadeDuration,s=this._currentStrokeIndex,[...Q("main",r,i),new B("character.highlight",{opacity:1,strokes:u({opacity:0},r.strokes.length)},{force:!0}),new B("character.main",{opacity:1,strokes:_(r.strokes.length,t=>({opacity:t<s?1:0}))},{force:!0})]));var r,i,s}startUserStroke(t){if(!this._isActive)return null;if(this._userStroke)return this.endUserStroke();const e=this._positioner.convertExternalPoint(t),r=l();return this._userStroke=new I(r,e,t),this._renderState.run(((t,e)=>[new B("quiz.activeUserStrokeId",t,{force:!0}),new B("userStrokes."+t,{points:[e],opacity:1},{force:!0})])(r,e))}continueUserStroke(t){if(!this._userStroke)return Promise.resolve();const e=this._positioner.convertExternalPoint(t);this._userStroke.appendPoint(e,t);const r=this._userStroke.points.slice(0);return this._renderState.run((i=this._userStroke.id,[new B(`userStrokes.${i}.points`,r,{force:!0})]));var i}setPositioner(t){this._positioner=t}endUserStroke(){var t;if(!this._userStroke)return;if(this._renderState.run(J(this._userStroke.id,null!==(t=this._options.drawingFadeDuration)&&void 0!==t?t:300)),1===this._userStroke.points.length)return void(this._userStroke=void 0);const{acceptBackwardsStrokes:e,markStrokeCorrectAfterMisses:r}=this._options,i=this._getCurrentStroke(),{isMatch:s,meta:o}=function(t,e,r,i={}){const s=e.strokes,o=E(t.points);if(o.length<2)return{isMatch:!1,meta:{isStrokeBackwards:!1}};const{isMatch:n,meta:a,avgDist:h}=H(o,s[r],i);if(!n)return{isMatch:n,meta:a};const l=s.slice(r+1);let c=h;for(let t=0;t<l.length;t++){const{isMatch:e,avgDist:r}=H(o,l[t],{...i,checkBackwards:!1});e&&r<c&&(c=r)}if(c<h){const t=.6*(c+h)/(2*h),{isMatch:e,meta:n}=H(o,s[r],{...i,leniency:(i.leniency||1)*t});return{isMatch:e,meta:n}}return{isMatch:n,meta:a}}(this._userStroke,this._character,this._currentStrokeIndex,{isOutlineVisible:this._renderState.state.character.outline.opacity>0,leniency:this._options.leniency}),n=r&&this._mistakesOnStroke+1>=r;if(s||n||o.isStrokeBackwards&&e)this._handleSuccess(o);else{this._handleFailure(o);const{showHintAfterMisses:t,highlightColor:e,strokeHighlightSpeed:r}=this._options;!1!==t&&this._mistakesOnStroke>=t&&this._renderState.run(X(i,d(e),r))}this._userStroke=void 0}cancel(){this._isActive=!1,this._userStroke&&this._renderState.run(J(this._userStroke.id,this._options.drawingFadeDuration))}_getStrokeData({isCorrect:t,meta:e}){return{character:this._character.symbol,strokeNum:this._currentStrokeIndex,mistakesOnStroke:this._mistakesOnStroke,totalMistakes:this._totalMistakes,strokesRemaining:this._character.strokes.length-this._currentStrokeIndex-(t?1:0),drawnPath:(r=this._userStroke,{pathString:D(r.externalPoints),points:r.points.map(t=>C(t))}),isBackwards:e.isStrokeBackwards};var r}_handleSuccess(t){if(!this._options)return;const{strokes:e,symbol:r}=this._character,{onCorrectStroke:i,onComplete:s,highlightOnComplete:o,strokeFadeDuration:n,highlightCompleteColor:a,highlightColor:h,strokeHighlightDuration:l}=this._options;null==i||i({...this._getStrokeData({isCorrect:!0,meta:t})});let c=(u="main",_=this._currentStrokeIndex,[new B(`character.${u}.strokes.${_}`,{displayPortion:1,opacity:1},{duration:n,force:!0})]);var u,_;this._mistakesOnStroke=0,this._currentStrokeIndex+=1;this._currentStrokeIndex===e.length&&(this._isActive=!1,null==s||s({character:r,totalMistakes:this._totalMistakes}),o&&(c=c.concat(((t,e,r)=>[new B("options.highlightColor",e),...Q("highlight",t),...V("highlight",t,r/2),...Q("highlight",t,r/2)])(this._character,d(a||h),2*(l||0))))),this._renderState.run(c)}_handleFailure(t){var e,r;this._mistakesOnStroke+=1,this._totalMistakes+=1,null===(e=(r=this._options).onMistake)||void 0===e||e.call(r,this._getStrokeData({isCorrect:!1,meta:t}))}_getCurrentStroke(){return this._character.strokes[this._currentStrokeIndex]}}function tt(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function et(t,e,r){t.setAttributeNS(null,e,r)}function rt(t,e){Object.keys(e).forEach(r=>et(t,r,e[r]))}function it(t){var e;null==t||null===(e=t.parentNode)||void 0===e||e.removeChild(t)}class st{constructor(t){this.stroke=t,this._pathLength=t.getLength()+st.STROKE_WIDTH/2}_getStrokeDashoffset(t){return.999*this._pathLength*(1-t)}_getColor({strokeColor:t,radicalColor:e}){return e&&this.stroke.isInRadical?e:t}}st.STROKE_WIDTH=200;class ot extends st{constructor(t){super(t),this._oldProps=void 0}mount(t){this._animationPath=tt("path"),this._clip=tt("clipPath"),this._strokePath=tt("path");const e="mask-"+l();et(this._clip,"id",e),et(this._strokePath,"d",this.stroke.path),this._animationPath.style.opacity="0",et(this._animationPath,"clip-path",function(t){let e="";return window.location&&window.location.href&&(e=window.location.href.replace(/#[^#]*$/,"").replace(/"/gi,"%22")),`url("${e}#${t}")`}(e));const r=x(this.stroke.points,100);return et(this._animationPath,"d",D(r)),rt(this._animationPath,{stroke:"#FFFFFF","stroke-width":200..toString(),fill:"none","stroke-linecap":"round","stroke-linejoin":"miter","stroke-dasharray":`${this._pathLength},${this._pathLength}`}),this._clip.appendChild(this._strokePath),t.defs.appendChild(this._clip),t.svg.appendChild(this._animationPath),this}render(t){var e,r;if(t===this._oldProps||!this._animationPath)return;t.displayPortion!==(null===(e=this._oldProps)||void 0===e?void 0:e.displayPortion)&&(this._animationPath.style.strokeDashoffset=this._getStrokeDashoffset(t.displayPortion).toString());const i=this._getColor(t);if(!this._oldProps||i!==this._getColor(this._oldProps)){const{r:t,g:e,b:r,a:s}=i;rt(this._animationPath,{stroke:`rgba(${t},${e},${r},${s})`})}t.opacity!==(null===(r=this._oldProps)||void 0===r?void 0:r.opacity)&&(this._animationPath.style.opacity=t.opacity.toString()),this._oldProps=t}}class nt{constructor(t){this._oldProps=void 0,this._strokeRenderers=t.strokes.map(t=>new ot(t))}mount(t){const e=t.createSubRenderTarget();this._group=e.svg,this._strokeRenderers.forEach(t=>{t.mount(e)})}render(t){var e,r;if(t===this._oldProps||!this._group)return;const{opacity:i,strokes:s,strokeColor:o,radicalColor:n=null}=t;var a;i!==(null===(e=this._oldProps)||void 0===e?void 0:e.opacity)&&(this._group.style.opacity=i.toString(),g||(0===i?this._group.style.display="none":0===(null===(a=this._oldProps)||void 0===a?void 0:a.opacity)&&this._group.style.removeProperty("display")));const h=!this._oldProps||o!==this._oldProps.strokeColor||n!==this._oldProps.radicalColor;if(h||s!==(null===(r=this._oldProps)||void 0===r?void 0:r.strokes))for(let t=0;t<this._strokeRenderers.length;t++){var l;!h&&null!==(l=this._oldProps)&&void 0!==l&&l.strokes&&s[t]===this._oldProps.strokes[t]||this._strokeRenderers[t].render({strokeColor:o,radicalColor:n,opacity:s[t].opacity,displayPortion:s[t].displayPortion})}this._oldProps=t}}class at{constructor(){this._oldProps=void 0}mount(t){this._path=tt("path"),t.svg.appendChild(this._path)}render(t){var e,r,i,s;if(this._path&&t!==this._oldProps){if(t.strokeColor!==(null===(e=this._oldProps)||void 0===e?void 0:e.strokeColor)||t.strokeWidth!==(null===(r=this._oldProps)||void 0===r?void 0:r.strokeWidth)){const{r:e,g:r,b:i,a:s}=t.strokeColor;rt(this._path,{fill:"none",stroke:`rgba(${e},${r},${i},${s})`,"stroke-width":t.strokeWidth.toString(),"stroke-linecap":"round","stroke-linejoin":"round"})}t.opacity!==(null===(i=this._oldProps)||void 0===i?void 0:i.opacity)&&et(this._path,"opacity",t.opacity.toString()),t.points!==(null===(s=this._oldProps)||void 0===s?void 0:s.points)&&et(this._path,"d",D(t.points)),this._oldProps=t}}destroy(){it(this._path)}}class ht{constructor(t){this.node=t}addPointerStartListener(t){this.node.addEventListener("mousedown",e=>{t(this._eventify(e,this._getMousePoint))}),this.node.addEventListener("touchstart",e=>{t(this._eventify(e,this._getTouchPoint))})}addPointerMoveListener(t){this.node.addEventListener("mousemove",e=>{t(this._eventify(e,this._getMousePoint))}),this.node.addEventListener("touchmove",e=>{t(this._eventify(e,this._getTouchPoint))})}addPointerEndListener(t){document.addEventListener("mouseup",t),document.addEventListener("touchend",t)}getBoundingClientRect(){return this.node.getBoundingClientRect()}updateDimensions(t,e){this.node.setAttribute("width",""+t),this.node.setAttribute("height",""+e)}_eventify(t,e){return{getPoint:()=>e.call(this,t),preventDefault:()=>t.preventDefault()}}_getMousePoint(t){const{left:e,top:r}=this.getBoundingClientRect();return{x:t.clientX-e,y:t.clientY-r}}_getTouchPoint(t){const{left:e,top:r}=this.getBoundingClientRect();return{x:t.touches[0].clientX-e,y:t.touches[0].clientY-r}}}class lt extends ht{constructor(t,e){super(t),this.svg=t,this.defs=e,"createSVGPoint"in t&&(this._pt=t.createSVGPoint())}static init(t,e="100%",r="100%"){const i="string"==typeof t?document.getElementById(t):t;if(!i)throw new Error("HanziWriter target element not found: "+t);const s=i.nodeName.toUpperCase(),o=(()=>{if("SVG"===s||"G"===s)return i;{const t=tt("svg");return i.appendChild(t),t}})();rt(o,{width:e,height:r});const n=tt("defs");return o.appendChild(n),new lt(o,n)}createSubRenderTarget(){const t=tt("g");return this.svg.appendChild(t),new lt(t,this.defs)}_getMousePoint(t){if(this._pt&&(this._pt.x=t.clientX,this._pt.y=t.clientY,"getScreenCTM"in this.node)){var e;const t=this._pt.matrixTransform(null===(e=this.node.getScreenCTM())||void 0===e?void 0:e.inverse());return{x:t.x,y:t.y}}return super._getMousePoint.call(this,t)}_getTouchPoint(t){if(this._pt&&(this._pt.x=t.touches[0].clientX,this._pt.y=t.touches[0].clientY,"getScreenCTM"in this.node)){var e;const t=this._pt.matrixTransform(null===(e=this.node.getScreenCTM())||void 0===e?void 0:e.inverse());return{x:t.x,y:t.y}}return super._getTouchPoint(t)}}var ct={HanziWriterRenderer:class{constructor(t,e){this._character=t,this._positioner=e,this._mainCharRenderer=new nt(t),this._outlineCharRenderer=new nt(t),this._highlightCharRenderer=new nt(t),this._userStrokeRenderers={}}mount(t){const e=t.createSubRenderTarget(),r=e.svg,{xOffset:i,yOffset:s,height:o,scale:n}=this._positioner;et(r,"transform",`translate(${i}, ${o-s}) scale(${n}, ${-1*n})`),this._outlineCharRenderer.mount(e),this._mainCharRenderer.mount(e),this._highlightCharRenderer.mount(e),this._positionedTarget=e}render(t){const{main:e,outline:r,highlight:i}=t.character,{outlineColor:s,radicalColor:o,highlightColor:n,strokeColor:a,drawingWidth:h,drawingColor:l}=t.options;this._outlineCharRenderer.render({opacity:r.opacity,strokes:r.strokes,strokeColor:s}),this._mainCharRenderer.render({opacity:e.opacity,strokes:e.strokes,strokeColor:a,radicalColor:o}),this._highlightCharRenderer.render({opacity:i.opacity,strokes:i.strokes,strokeColor:n});const c=t.userStrokes||{};for(const t in this._userStrokeRenderers){var d;if(!c[t])null===(d=this._userStrokeRenderers[t])||void 0===d||d.destroy(),delete this._userStrokeRenderers[t]}for(const t in c){const e=c[t];if(!e)continue;const r={strokeWidth:h,strokeColor:l,...e};(()=>{if(this._userStrokeRenderers[t])return this._userStrokeRenderers[t];const e=new at;return e.mount(this._positionedTarget),this._userStrokeRenderers[t]=e,e})().render(r)}}destroy(){it(this._positionedTarget.svg),this._positionedTarget.defs.innerHTML=""}},createRenderTarget:lt.init};const dt=(t,e)=>{t.beginPath();const r=e[0],i=e.slice(1);t.moveTo(r.x,r.y);for(const e of i)t.lineTo(e.x,e.y);t.stroke()};class ut extends st{constructor(t,e=!0){super(t),e&&Path2D?this._path2D=new Path2D(this.stroke.path):this._pathCmd=(t=>{const e=t.split(/(^|\s+)(?=[A-Z])/).filter(t=>" "!==t),r=[t=>t.beginPath()];for(const t of e){const[e,...i]=t.split(/\s+/),s=i.map(t=>parseFloat(t));"M"===e?r.push(t=>t.moveTo(...s)):"L"===e?r.push(t=>t.lineTo(...s)):"C"===e?r.push(t=>t.bezierCurveTo(...s)):"Q"===e&&r.push(t=>t.quadraticCurveTo(...s))}return t=>r.forEach(e=>e(t))})(this.stroke.path),this._extendedMaskPoints=x(this.stroke.points,st.STROKE_WIDTH/2)}render(t,e){if(e.opacity<.05)return;var r;(t.save(),this._path2D)?t.clip(this._path2D):(null===(r=this._pathCmd)||void 0===r||r.call(this,t),t.globalAlpha=0,t.stroke(),t.clip());const{r:i,g:s,b:o,a:n}=this._getColor(e),a=1===n?`rgb(${i},${s},${o})`:`rgb(${i},${s},${o},${n})`,h=this._getStrokeDashoffset(e.displayPortion);t.globalAlpha=e.opacity,t.strokeStyle=a,t.fillStyle=a,t.lineWidth=st.STROKE_WIDTH,t.lineCap="round",t.lineJoin="round",t.setLineDash([this._pathLength,this._pathLength],h),t.lineDashOffset=h,dt(t,this._extendedMaskPoints),t.restore()}}class _t{constructor(t){this._strokeRenderers=t.strokes.map(t=>new ut(t))}render(t,e){if(e.opacity<.05)return;const{opacity:r,strokeColor:i,radicalColor:s,strokes:o}=e;for(let e=0;e<this._strokeRenderers.length;e++)this._strokeRenderers[e].render(t,{strokeColor:i,radicalColor:s,opacity:o[e].opacity*r,displayPortion:o[e].displayPortion||0})}}function pt(t,e){if(e.opacity<.05)return;const{opacity:r,strokeWidth:i,strokeColor:s,points:o}=e,{r:n,g:a,b:h,a:l}=s;t.save(),t.globalAlpha=r,t.lineWidth=i,t.strokeStyle=`rgba(${n},${a},${h},${l})`,t.lineCap="round",t.lineJoin="round",dt(t,o),t.restore()}class gt extends ht{constructor(t){super(t)}static init(t,e="100%",r="100%"){const i="string"==typeof t?document.getElementById(t):t;if(!i)throw new Error("HanziWriter target element not found: "+t);const s=i.nodeName.toUpperCase(),o=(()=>{if("CANVAS"===s)return i;const t=document.createElement("canvas");return i.appendChild(t),t})();return o.setAttribute("width",e),o.setAttribute("height",r),new gt(o)}getContext(){return this.node.getContext("2d")}}var kt={HanziWriterRenderer:class{constructor(t,e){this.destroy=k,this._character=t,this._positioner=e,this._mainCharRenderer=new _t(t),this._outlineCharRenderer=new _t(t),this._highlightCharRenderer=new _t(t)}mount(t){this._target=t}_animationFrame(t){const{width:e,height:r,scale:i,xOffset:s,yOffset:o}=this._positioner,n=this._target.getContext();n.clearRect(0,0,e,r),n.save(),n.translate(s,r-o),n.transform(1,0,0,-1,0,0),n.scale(i,i),t(n),n.restore(),n.draw&&n.draw()}render(t){const{outline:e,main:r,highlight:i}=t.character,{outlineColor:s,strokeColor:o,radicalColor:n,highlightColor:a,drawingColor:h,drawingWidth:l}=t.options;this._animationFrame(c=>{this._outlineCharRenderer.render(c,{opacity:e.opacity,strokes:e.strokes,strokeColor:s}),this._mainCharRenderer.render(c,{opacity:r.opacity,strokes:r.strokes,strokeColor:o,radicalColor:n}),this._highlightCharRenderer.render(c,{opacity:i.opacity,strokes:i.strokes,strokeColor:a});const d=t.userStrokes||{};for(const t in d){const e=d[t];if(e){pt(c,{strokeWidth:l,strokeColor:h,...e})}}})}},createRenderTarget:gt.init};const mt={charDataLoader:(t,e,r)=>{const i=new XMLHttpRequest;i.overrideMimeType&&i.overrideMimeType("application/json"),i.open("GET",(t=>`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${t}.json`)(t),!0),i.onerror=t=>{r(i,t)},i.onreadystatechange=()=>{4===i.readyState&&(200===i.status?e(JSON.parse(i.responseText)):0!==i.status&&r&&r(i))},i.send(null)},onLoadCharDataError:null,onLoadCharDataSuccess:null,showOutline:!0,showCharacter:!0,renderer:"svg",width:0,height:0,padding:20,strokeAnimationSpeed:1,strokeFadeDuration:400,strokeHighlightDuration:200,strokeHighlightSpeed:2,delayBetweenStrokes:1e3,delayBetweenLoops:2e3,strokeColor:"#555",radicalColor:null,highlightColor:"#AAF",outlineColor:"#DDD",drawingColor:"#333",leniency:1,showHintAfterMisses:3,highlightOnComplete:!0,highlightCompleteColor:null,markStrokeCorrectAfterMisses:!1,acceptBackwardsStrokes:!1,quizStartStrokeNum:0,drawingFadeDuration:300,drawingWidth:4,strokeWidth:2,outlineWidth:2,rendererOverride:{}};class ft{constructor(t){this._loadCounter=0,this._isLoading=!1,this.loadingFailed=!1,this._options=t}_debouncedLoad(t,e){const r=t=>{var r;e===this._loadCounter&&(null===(r=this._resolve)||void 0===r||r.call(this,t))},i=t=>{var r;e===this._loadCounter&&(null===(r=this._reject)||void 0===r||r.call(this,t))},s=this._options.charDataLoader(t,r,i);s&&("then"in s?s.then(r).catch(i):r(s))}_setupLoadingPromise(){return new Promise((t,e)=>{this._resolve=t,this._reject=e}).then(t=>{var e,r;return this._isLoading=!1,null===(e=(r=this._options).onLoadCharDataSuccess)||void 0===e||e.call(r,t),t}).catch(t=>{if(this._isLoading=!1,this.loadingFailed=!0,this._options.onLoadCharDataError)return void this._options.onLoadCharDataError(t);if(t instanceof Error)throw t;const e=new Error("Failed to load char data for "+this._loadingChar);throw e.reason=t,e})}loadCharData(t){this._loadingChar=t;const e=this._setupLoadingPromise();return this.loadingFailed=!1,this._isLoading=!0,this._loadCounter++,this._debouncedLoad(t,this._loadCounter),e}}class vt{constructor(t,e={}){const{HanziWriterRenderer:r,createRenderTarget:i}="canvas"===e.renderer?kt:ct,s=e.rendererOverride||{};this._renderer={HanziWriterRenderer:s.HanziWriterRenderer||r,createRenderTarget:s.createRenderTarget||i},this.target=this._renderer.createRenderTarget(t,e.width,e.height),this._options=this._assignOptions(e),this._loadingManager=new ft(this._options),this._setupListeners()}static create(t,e,r){const i=new vt(t,r);return i.setCharacter(e),i}static loadCharacterData(t,e={}){const r=(()=>{const{_loadingManager:r,_loadingOptions:i}=vt;return(null==r?void 0:r._loadingChar)===t&&i===e?r:new ft({...mt,...e})})();return vt._loadingManager=r,vt._loadingOptions=e,r.loadCharData(t)}static getScalingTransform(t,e,r=0){const i=new L({width:t,height:e,padding:r});return{x:i.xOffset,y:i.yOffset,scale:i.scale,transform:(s=`\n        translate(${i.xOffset}, ${i.height-i.yOffset})\n        scale(${i.scale}, ${-1*i.scale})\n      `,s.replace(/^\s+/,"").replace(/\s+$/,"")).replace(/\s+/g," ")};var s}showCharacter(t={}){return this._options.showCharacter=!0,this._withData(()=>{var e;return null===(e=this._renderState)||void 0===e?void 0:e.run(V("main",this._character,"number"==typeof t.duration?t.duration:this._options.strokeFadeDuration)).then(e=>{var r;return null===(r=t.onComplete)||void 0===r||r.call(t,e),e})})}hideCharacter(t={}){return this._options.showCharacter=!1,this._withData(()=>{var e;return null===(e=this._renderState)||void 0===e?void 0:e.run(Q("main",this._character,"number"==typeof t.duration?t.duration:this._options.strokeFadeDuration)).then(e=>{var r;return null===(r=t.onComplete)||void 0===r||r.call(t,e),e})})}animateCharacter(t={}){return this.cancelQuiz(),this._withData(()=>{var e;return null===(e=this._renderState)||void 0===e?void 0:e.run(Y("main",this._character,this._options.strokeFadeDuration,this._options.strokeAnimationSpeed,this._options.delayBetweenStrokes)).then(e=>{var r;return null===(r=t.onComplete)||void 0===r||r.call(t,e),e})})}animateStroke(t,e={}){return this.cancelQuiz(),this._withData(()=>{var r;return null===(r=this._renderState)||void 0===r?void 0:r.run(((t,e,r,i)=>{const s=e.strokes[r];return[new B("character."+t,r=>{const i=r.character[t],s={opacity:1,strokes:{}};for(let t=0;t<e.strokes.length;t++)s.strokes[t]={opacity:i.opacity*i.strokes[t].opacity};return s}),...K(t,s,i)]})("main",this._character,n(t,this._character.strokes.length),this._options.strokeAnimationSpeed)).then(t=>{var r;return null===(r=e.onComplete)||void 0===r||r.call(e,t),t})})}highlightStroke(t,e={}){return this._withData(()=>{var r,i;if(this._character&&this._renderState)return this._renderState.run(X((r=this._character.strokes,i=t,r[n(i,r.length)]),d(this._options.highlightColor),this._options.strokeHighlightSpeed)).then(t=>{var r;return null===(r=e.onComplete)||void 0===r||r.call(e,t),t})})}async loopCharacterAnimation(){return this.cancelQuiz(),this._withData(()=>this._renderState.run(((t,e,r,i,s,o)=>{const n=Y(t,e,r,i,s);return n.push(new B.Delay(o)),n})("main",this._character,this._options.strokeFadeDuration,this._options.strokeAnimationSpeed,this._options.delayBetweenStrokes,this._options.delayBetweenLoops),{loop:!0}))}pauseAnimation(){return this._withData(()=>{var t;return null===(t=this._renderState)||void 0===t?void 0:t.pauseAll()})}resumeAnimation(){return this._withData(()=>{var t;return null===(t=this._renderState)||void 0===t?void 0:t.resumeAll()})}showOutline(t={}){return this._options.showOutline=!0,this._withData(()=>{var e;return null===(e=this._renderState)||void 0===e?void 0:e.run(V("outline",this._character,"number"==typeof t.duration?t.duration:this._options.strokeFadeDuration)).then(e=>{var r;return null===(r=t.onComplete)||void 0===r||r.call(t,e),e})})}hideOutline(t={}){return this._options.showOutline=!1,this._withData(()=>{var e;return null===(e=this._renderState)||void 0===e?void 0:e.run(Q("outline",this._character,"number"==typeof t.duration?t.duration:this._options.strokeFadeDuration)).then(e=>{var r;return null===(r=t.onComplete)||void 0===r||r.call(t,e),e})})}updateDimensions({width:t,height:e,padding:r}){if(void 0!==t&&(this._options.width=t),void 0!==e&&(this._options.height=e),void 0!==r&&(this._options.padding=r),this.target.updateDimensions(this._options.width,this._options.height),this._character&&this._renderState&&this._hanziWriterRenderer&&this._positioner){this._hanziWriterRenderer.destroy();const t=this._initAndMountHanziWriterRenderer(this._character);this._renderState.overwriteOnStateChange(e=>t.render(e)),t.render(this._renderState.state),this._quiz&&this._quiz.setPositioner(this._positioner)}}updateColor(t,e,r={}){var i;let s=[];const o=d((()=>"radicalColor"!==t||e?e:this._options.strokeColor)());this._options[t]=e;const n=null!==(i=r.duration)&&void 0!==i?i:this._options.strokeFadeDuration;return s=s.concat(G(t,o,n)),"radicalColor"!==t||e||(s=s.concat(G(t,null,0))),this._withData(()=>{var t;return null===(t=this._renderState)||void 0===t?void 0:t.run(s).then(t=>{var e;return null===(e=r.onComplete)||void 0===e||e.call(r,t),t})})}quiz(t={}){return this._withData(async()=>{this._character&&this._renderState&&this._positioner&&(this.cancelQuiz(),this._quiz=new Z(this._character,this._renderState,this._positioner),this._options={...this._options,...t},this._quiz.startQuiz(this._options))})}cancelQuiz(){this._quiz&&(this._quiz.cancel(),this._quiz=void 0)}setCharacter(t){return this.cancelQuiz(),this._char=t,this._hanziWriterRenderer&&this._hanziWriterRenderer.destroy(),this._renderState&&this._renderState.cancelAll(),this._hanziWriterRenderer=null,this._withDataPromise=this._loadingManager.loadCharData(t).then(e=>{if(!e||this._loadingManager.loadingFailed)return;this._character=function(t,e){const r=T(e);return new R(t,r)}(t,e),this._renderState=new m(this._character,this._options,t=>r.render(t));const r=this._initAndMountHanziWriterRenderer(this._character);r.render(this._renderState.state)}),this._withDataPromise}_initAndMountHanziWriterRenderer(t){const{width:e,height:r,padding:i}=this._options;this._positioner=new L({width:e,height:r,padding:i});const s=new this._renderer.HanziWriterRenderer(t,this._positioner);return s.mount(this.target),this._hanziWriterRenderer=s,s}async getCharacterData(){if(!this._char)throw new Error("setCharacter() must be called before calling getCharacterData()");return await this._withData(()=>this._character)}_assignOptions(t){const e={...mt,...t};return t.strokeAnimationDuration&&!t.strokeAnimationSpeed&&(e.strokeAnimationSpeed=500/t.strokeAnimationDuration),t.strokeHighlightDuration&&!t.strokeHighlightSpeed&&(e.strokeHighlightSpeed=500/e.strokeHighlightDuration),t.highlightCompleteColor||(e.highlightCompleteColor=e.highlightColor),this._fillWidthAndHeight(e)}_fillWidthAndHeight(t){const e={...t};if(e.width&&!e.height)e.height=e.width;else if(e.height&&!e.width)e.width=e.height;else if(!e.width&&!e.height){const{width:t,height:r}=this.target.getBoundingClientRect(),i=Math.min(t,r);e.width=i,e.height=i}return e}_withData(t){if(this._loadingManager.loadingFailed)throw Error("Failed to load character data. Call setCharacter and try again.");return this._withDataPromise?this._withDataPromise.then(()=>{if(!this._loadingManager.loadingFailed)return t()}):Promise.resolve().then(t)}_setupListeners(){this.target.addPointerStartListener(t=>{this._quiz&&(t.preventDefault(),this._quiz.startUserStroke(t.getPoint()))}),this.target.addPointerMoveListener(t=>{this._quiz&&(t.preventDefault(),this._quiz.continueUserStroke(t.getPoint()))}),this.target.addPointerEndListener(()=>{var t;null===(t=this._quiz)||void 0===t||t.endUserStroke()})}}return vt._loadingManager=null,vt._loadingOptions=null,vt}();
//# sourceMappingURL=hanzi-writer.min.js.map
/* 内置拼音数据：pinyin-data v0.15 (MIT, github.com/mozillazg/pinyin-data)，GB2312 一级常用字 */
window.HANZI_PINYIN = {"一":"yī","丁":"dīng","七":"qī","万":"wàn","丈":"zhàng","三":"sān","上":"shàng","下":"xià","丌":"jī","不":"bù","与":"yǔ","丐":"gài","丑":"chǒu","专":"zhuān","且":"qiě","丕":"pī","世":"shì","丘":"qiū","丙":"bǐng","业":"yè","丛":"cóng","东":"dōng","丝":"sī","丞":"chéng","丢":"diū","两":"liǎng","严":"yán","丧":"sàng","丨":"gǔn","个":"gè","丫":"yā","中":"zhōng","丰":"fēng","串":"chuàn","临":"lín","丶":"zhǔ","丸":"wán","丹":"dān","为":"wèi","主":"zhǔ","丽":"lì","举":"jǔ","丿":"piě","乃":"nǎi","久":"jiǔ","乇":"tuō","么":"me","义":"yì","之":"zhī","乌":"wū","乍":"zhà","乎":"hū","乏":"fá","乐":"lè","乒":"pīng","乓":"pāng","乔":"qiáo","乖":"guāi","乘":"chéng","乙":"yǐ","乜":"miē","九":"jiǔ","乞":"qǐ","也":"yě","习":"xí","乡":"xiāng","书":"shū","乩":"jī","买":"mǎi","乱":"luàn","乳":"rǔ","乾":"qián","了":"le","予":"yǔ","争":"zhēng","事":"shì","二":"èr","亍":"chù","于":"yú","亏":"kuī","云":"yún","互":"hù","亓":"qí","五":"wǔ","井":"jǐng","亘":"gèn","亚":"yà","些":"xiē","亟":"jí","亠":"tóu","亡":"wáng","亢":"kàng","交":"jiāo","亥":"hài","亦":"yì","产":"chǎn","亨":"hēng","亩":"mǔ","享":"xiǎng","京":"jīng","亭":"tíng","亮":"liàng","亲":"qīn","亳":"bó","亵":"xiè","人":"rén","亻":"rén","亿":"yì","什":"shén","仁":"rén","仂":"lè","仃":"dīng","仄":"zè","仅":"jǐn","仆":"pū","仇":"chóu","仉":"zhǎng","今":"jīn","介":"jiè","仍":"réng","从":"cóng","仑":"lún","仓":"cāng","仔":"zǎi","仕":"shì","他":"tā","仗":"zhàng","付":"fù","仙":"xiān","仝":"tóng","仞":"rèn","仟":"qiān","仡":"gē","代":"dài","令":"lìng","以":"yǐ","仨":"sā","仪":"yí","仫":"mù","们":"men","仰":"yǎng","仲":"zhòng","仳":"pǐ","仵":"wǔ","件":"jiàn","价":"jià","任":"rèn","份":"fèn","仿":"fǎng","企":"qǐ","伉":"kàng","伊":"yī","伍":"wǔ","伎":"jì","伏":"fú","伐":"fá","休":"xiū","众":"zhòng","优":"yōu","伙":"huǒ","会":"huì","伛":"yǔ","伞":"sǎn","伟":"wěi","传":"chuán","伢":"yá","伤":"shāng","伥":"chāng","伦":"lún","伧":"cāng","伪":"wěi","伫":"zhù","伯":"bó","估":"gū","伲":"nì","伴":"bàn","伶":"líng","伸":"shēn","伺":"cì","似":"shì","伽":"gā","佃":"diàn","但":"dàn","位":"wèi","低":"dī","住":"zhù","佐":"zuǒ","佑":"yòu","体":"tǐ","何":"hé","佗":"tuó","佘":"shé","余":"yú","佚":"yì","佛":"fú","作":"zuò","佝":"gōu","佞":"nìng","佟":"tóng","你":"nǐ","佣":"yōng","佤":"wǎ","佥":"qiān","佧":"kǎ","佩":"pèi","佬":"lǎo","佯":"yáng","佰":"bǎi","佳":"jiā","佴":"èr","佶":"jí","佻":"tiāo","佼":"jiǎo","佾":"yì","使":"shǐ","侃":"kǎn","侄":"zhí","侈":"chǐ","侉":"kuǎ","例":"lì","侍":"shì","侏":"zhū","侑":"yòu","侔":"móu","侗":"dòng","供":"gōng","依":"yī","侠":"xiá","侣":"lǚ","侥":"jiǎo","侦":"zhēn","侧":"cè","侨":"qiáo","侩":"kuài","侪":"chái","侬":"nóng","侮":"wǔ","侯":"hóu","侵":"qīn","便":"biàn","促":"cù","俄":"é","俅":"qiú","俊":"jùn","俎":"zǔ","俏":"qiào","俐":"lì","俑":"yǒng","俗":"sú","俘":"fú","俚":"lǐ","俜":"pīng","保":"bǎo","俞":"yú","俟":"qí","信":"xìn","俣":"yǔ","俦":"chóu","俨":"yǎn","俩":"liǎ","俪":"lì","俭":"jiǎn","修":"xiū","俯":"fǔ","俱":"jù","俳":"pái","俸":"fèng","俺":"ǎn","俾":"bǐ","倌":"guān","倍":"bèi","倏":"shū","倒":"dào","倔":"jué","倘":"tǎng","候":"hòu","倚":"yǐ","倜":"tì","借":"jiè","倡":"chàng","倥":"kōng","倦":"juàn","倨":"jù","倩":"qiàn","倪":"ní","倬":"zhuō","倭":"wō","倮":"luǒ","债":"zhài","值":"zhí","倾":"qīng","偃":"yǎn","假":"jiǎ","偈":"jì","偌":"ruò","偎":"wēi","偏":"piān","偕":"xié","做":"zuò","停":"tíng","健":"jiàn","偬":"zǒng","偶":"ǒu","偷":"tōu","偻":"lóu","偾":"fèn","偿":"cháng","傀":"guī","傅":"fù","傈":"lì","傍":"bàng","傣":"dǎi","傥":"tǎng","傧":"bīn","储":"chǔ","傩":"nuó","催":"cuī","傲":"ào","傺":"chì","傻":"shǎ","像":"xiàng","僖":"xī","僚":"liáo","僦":"jiù","僧":"sēng","僬":"jiāo","僭":"jiàn","僮":"tóng","僳":"sù","僵":"jiāng","僻":"pì","儆":"jǐng","儇":"xuān","儋":"dān","儒":"rú","儡":"lěi","儿":"ér","兀":"wù","允":"yǔn","元":"yuán","兄":"xiōng","充":"chōng","兆":"zhào","先":"xiān","光":"guāng","克":"kè","免":"miǎn","兑":"duì","兔":"tù","兕":"sì","兖":"yǎn","党":"dǎng","兜":"dōu","兢":"jīng","入":"rù","全":"quán","八":"bā","公":"gōng","六":"liù","兮":"xī","兰":"lán","共":"gòng","关":"guān","兴":"xīng","兵":"bīng","其":"qí","具":"jù","典":"diǎn","兹":"zī","养":"yǎng","兼":"jiān","兽":"shòu","冀":"jì","冁":"chǎn","冂":"jiōng","内":"nèi","冈":"gāng","冉":"rǎn","册":"cè","再":"zài","冒":"mào","冕":"miǎn","冗":"rǒng","写":"xiě","军":"jūn","农":"nóng","冠":"guān","冤":"yuān","冫":"bīng","冬":"dōng","冯":"féng","冰":"bīng","冱":"hù","冲":"chōng","决":"jué","况":"kuàng","冶":"yě","冷":"lěng","冻":"dòng","冼":"xiǎn","冽":"liè","净":"jìng","凄":"qī","准":"zhǔn","凉":"liáng","凋":"diāo","凌":"líng","减":"jiǎn","凑":"còu","凛":"lǐn","凝":"níng","几":"jǐ","凡":"fán","凤":"fèng","凫":"fú","凭":"píng","凯":"kǎi","凰":"huáng","凳":"dèng","凶":"xiōng","凸":"tū","凹":"āo","出":"chū","击":"jī","函":"hán","凿":"záo","刀":"dāo","刁":"diāo","刂":"dāo","刃":"rèn","分":"fēn","切":"qiè","刈":"yì","刊":"kān","刎":"wěn","刑":"xíng","划":"huà","列":"liè","刘":"liú","则":"zé","刚":"gāng","创":"chuàng","初":"chū","删":"shān","判":"pàn","刨":"páo","利":"lì","别":"bié","刭":"jǐng","刮":"guā","到":"dào","刳":"kū","制":"zhì","刷":"shuā","券":"quàn","刹":"shā","刺":"cì","刻":"kè","刽":"guì","刿":"guì","剀":"kǎi","剁":"duò","剂":"jì","剃":"tì","削":"xuē","剌":"lá","前":"qián","剐":"guǎ","剑":"jiàn","剔":"tī","剖":"pōu","剜":"wān","剞":"jī","剡":"shàn","剥":"bō","剧":"jù","剩":"shèng","剪":"jiǎn","副":"fù","割":"gē","剽":"piāo","剿":"jiǎo","劁":"qiāo","劂":"jué","劈":"pī","劐":"huō","劓":"yì","力":"lì","劝":"quàn","办":"bàn","功":"gōng","加":"jiā","务":"wù","劣":"liè","动":"dòng","助":"zhù","努":"nǔ","劫":"jié","励":"lì","劲":"jìn","劳":"láo","势":"shì","勃":"bó","勇":"yǒng","勉":"miǎn","勋":"xūn","勒":"lēi","勘":"kān","募":"mù","勤":"qín","勹":"bāo","勺":"sháo","勾":"gōu","勿":"wù","匀":"yún","包":"bāo","匆":"cōng","匈":"xiōng","匍":"pú","匐":"fú","匕":"bǐ","化":"huà","北":"běi","匙":"shi","匚":"fāng","匝":"zā","匠":"jiàng","匡":"kuāng","匣":"xiá","匦":"guǐ","匪":"fěi","匮":"kuì","匹":"pǐ","区":"qū","医":"yī","匾":"biǎn","匿":"nì","十":"shí","千":"qiān","卅":"sà","升":"shēng","午":"wǔ","卉":"huì","半":"bàn","华":"huá","协":"xié","卑":"bēi","卒":"zú","卓":"zhuó","单":"dān","卖":"mài","南":"nán","博":"bó","卜":"bo","卞":"biàn","占":"zhàn","卡":"kǎ","卢":"lú","卣":"yǒu","卤":"lǔ","卦":"guà","卧":"wò","卫":"wèi","卮":"zhī","卯":"mǎo","印":"yìn","危":"wēi","即":"jí","却":"què","卵":"luǎn","卷":"juǎn","卸":"xiè","卿":"qīng","厂":"chǎng","厄":"è","厅":"tīng","历":"lì","厉":"lì","压":"yā","厌":"yàn","厍":"shè","厕":"cè","厘":"lí","厚":"hòu","厝":"cuò","原":"yuán","厢":"xiāng","厣":"yǎn","厥":"jué","厦":"shà","厨":"chú","厩":"jiù","厮":"sī","去":"qù","县":"xiàn","叁":"sān","参":"cān","又":"yòu","叉":"chā","及":"jí","友":"yǒu","双":"shuāng","反":"fǎn","发":"fā","叔":"shū","取":"qǔ","受":"shòu","变":"biàn","叙":"xù","叛":"pàn","叠":"dié","口":"kǒu","古":"gǔ","句":"jù","另":"lìng","只":"zhǐ","叫":"jiào","召":"zhào","叭":"bā","叮":"dīng","可":"kě","台":"tái","史":"shǐ","右":"yòu","叵":"pǒ","叶":"yè","号":"hào","司":"sī","叹":"tàn","叼":"diāo","吁":"xū","吃":"chī","各":"gè","合":"hé","吉":"jí","吊":"diào","同":"tóng","名":"míng","后":"hòu","吏":"lì","吐":"tǔ","向":"xiàng","吓":"xià","吕":"lǚ","吗":"ma","君":"jūn","吝":"lìn","吞":"tūn","吟":"yín","吠":"fèi","否":"fǒu","吧":"ba","吨":"dūn","吩":"fēn","含":"hán","听":"tīng","吭":"kēng","吮":"shǔn","启":"qǐ","吱":"zhī","吴":"wú","吵":"chǎo","吸":"xī","吹":"chuī","吻":"wěn","吼":"hǒu","吾":"wú","呀":"ya","呆":"dāi","呈":"chéng","告":"gào","呐":"nà","呕":"ǒu","员":"yuán","呛":"qiāng","呜":"wū","呢":"ne","周":"zhōu","味":"wèi","呵":"hē","呸":"pēi","呻":"shēn","呼":"hū","命":"mìng","咀":"jǔ","咆":"páo","咋":"zǎ","和":"hé","咎":"jiù","咏":"yǒng","咐":"fù","咒":"zhòu","咕":"gū","咖":"kā","咙":"lóng","咨":"zī","咬":"yǎo","咯":"gē","咱":"zán","咳":"ké","咸":"xián","咽":"yàn","哀":"āi","品":"pǐn","哄":"hǒng","哆":"duō","哇":"wa","哈":"hā","哉":"zāi","响":"xiǎng","哎":"āi","哑":"yǎ","哗":"huā","哟":"yō","哥":"gē","哦":"ó","哨":"shào","哩":"lī","哪":"nǎ","哭":"kū","哮":"xiāo","哲":"zhé","哺":"bǔ","哼":"hēng","唁":"yàn","唆":"suō","唇":"chún","唉":"āi","唐":"táng","唤":"huàn","唬":"hǔ","售":"shòu","唯":"wéi","唱":"chàng","唾":"tuò","啃":"kěn","啄":"zhuó","商":"shāng","啊":"a","啡":"fēi","啤":"pí","啥":"shá","啦":"la","啪":"pā","啬":"sè","啮":"niè","啸":"xiào","啼":"tí","喀":"kā","喂":"wèi","善":"shàn","喇":"lǎ","喉":"hóu","喊":"hǎn","喘":"chuǎn","喜":"xǐ","喝":"hē","喧":"xuān","喳":"zhā","喷":"pēn","喻":"yù","嗅":"xiù","嗓":"sǎng","嗜":"shì","嗡":"wēng","嗣":"sì","嗽":"sòu","嘉":"jiā","嘎":"gā","嘏":"gǔ","嘘":"xū","嘛":"ma","嘱":"zhǔ","嘲":"cháo","嘴":"zuǐ","嘶":"sī","嘻":"xī","嘿":"hēi","噎":"yē","器":"qì","噩":"è","噪":"zào","噬":"shì","噶":"gá","嚎":"háo","嚏":"tì","嚣":"xiāo","嚷":"rǎng","嚼":"jué","囊":"náng","囚":"qiú","四":"sì","回":"huí","囟":"xìn","因":"yīn","团":"tuán","囤":"dùn","园":"yuán","困":"kùn","囱":"cōng","围":"wéi","固":"gù","国":"guó","图":"tú","圃":"pǔ","圆":"yuán","圈":"quān","土":"tǔ","圣":"shèng","在":"zài","圭":"guī","地":"dì","场":"chǎng","圾":"jī","址":"zhǐ","均":"jūn","坊":"fāng","坍":"tān","坎":"kǎn","坏":"huài","坐":"zuò","坑":"kēng","块":"kuài","坚":"jiān","坛":"tán","坝":"bà","坞":"wù","坟":"fén","坠":"zhuì","坡":"pō","坤":"kūn","坦":"tǎn","坪":"píng","坯":"pī","坷":"kě","垂":"chuí","垃":"lā","垄":"lǒng","型":"xíng","垒":"lěi","垛":"duǒ","垢":"gòu","垣":"yuán","垦":"kěn","垫":"diàn","垮":"kuǎ","埂":"gěng","埃":"āi","埋":"mái","城":"chéng","埔":"pǔ","域":"yù","埠":"bù","培":"péi","基":"jī","堂":"táng","堆":"duī","堑":"qiàn","堕":"duò","堡":"bǎo","堤":"dī","堪":"kān","堰":"yàn","堵":"dǔ","塌":"tā","塑":"sù","塔":"tǎ","塘":"táng","塞":"sāi","填":"tián","境":"jìng","墅":"shù","墒":"shāng","墓":"mù","墙":"qiáng","增":"zēng","墟":"xū","墨":"mò","墩":"dūn","壁":"bì","壕":"háo","壤":"rǎng","士":"shì","壬":"rén","壮":"zhuàng","声":"shēng","壳":"ké","壶":"hú","壹":"yī","处":"chù","备":"bèi","复":"fù","夏":"xià","夔":"kuí","夕":"xī","外":"wài","夙":"sù","多":"duō","夜":"yè","够":"gòu","大":"dà","天":"tiān","太":"tài","夫":"fū","夭":"yāo","央":"yāng","夯":"hāng","失":"shī","头":"tóu","夷":"yí","夸":"kuā","夹":"jiā","夺":"duó","奄":"yǎn","奇":"qí","奈":"nài","奉":"fèng","奋":"fèn","奎":"kuí","奏":"zòu","契":"qì","奔":"bēn","奖":"jiǎng","套":"tào","奠":"diàn","奢":"shē","奥":"ào","女":"nǚ","奴":"nú","奶":"nǎi","奸":"jiān","她":"tā","好":"hǎo","如":"rú","妄":"wàng","妆":"zhuāng","妇":"fù","妈":"mā","妊":"rèn","妒":"dù","妓":"jì","妖":"yāo","妙":"miào","妥":"tuǒ","妨":"fáng","妮":"nī","妹":"mèi","妻":"qī","姆":"mǔ","始":"shǐ","姐":"jiě","姑":"gū","姓":"xìng","委":"wěi","姚":"yáo","姜":"jiāng","姥":"lǎo","姨":"yí","姬":"jī","姻":"yīn","姿":"zī","威":"wēi","娃":"wá","娄":"lóu","娇":"jiāo","娘":"niáng","娜":"nà","娟":"juān","娠":"shēn","娥":"é","娩":"miǎn","娱":"yú","娶":"qǔ","婆":"pó","婉":"wǎn","婚":"hūn","婪":"lán","婴":"yīng","婶":"shěn","婿":"xù","媒":"méi","媚":"mèi","媳":"xí","嫁":"jià","嫂":"sǎo","嫉":"jí","嫌":"xián","嫡":"dí","嫩":"nèn","嬴":"yíng","子":"zi","孔":"kǒng","孕":"yùn","字":"zì","存":"cún","孙":"sūn","孛":"bèi","孜":"zī","孝":"xiào","孟":"mèng","季":"jì","孤":"gū","学":"xué","孩":"hái","孪":"luán","孬":"nāo","孰":"shú","孵":"fū","孺":"rú","孽":"niè","宁":"níng","它":"tā","宅":"zhái","宇":"yǔ","守":"shǒu","安":"ān","宋":"sòng","完":"wán","宏":"hóng","宗":"zōng","官":"guān","宙":"zhòu","定":"dìng","宛":"wǎn","宜":"yí","宝":"bǎo","实":"shí","宠":"chǒng","审":"shěn","客":"kè","宣":"xuān","室":"shì","宦":"huàn","宪":"xiàn","宫":"gōng","宰":"zǎi","害":"hài","宴":"yàn","宵":"xiāo","家":"jiā","容":"róng","宽":"kuān","宾":"bīn","宿":"sù","寂":"jì","寄":"jì","寅":"yín","密":"mì","寇":"kòu","富":"fù","寐":"mèi","寒":"hán","寓":"yù","寝":"qǐn","寞":"mò","察":"chá","寡":"guǎ","寥":"liáo","寨":"zhài","寸":"cùn","对":"duì","寺":"sì","寻":"xún","导":"dǎo","寿":"shòu","封":"fēng","射":"shè","将":"jiāng","尉":"wèi","尊":"zūn","小":"xiǎo","少":"shǎo","尔":"ěr","尖":"jiān","尘":"chén","尚":"shàng","尝":"cháng","尤":"yóu","尧":"yáo","就":"jiù","尸":"shī","尹":"yǐn","尺":"chǐ","尼":"ní","尽":"jǐn","尾":"wěi","尿":"niào","局":"jú","屁":"pì","层":"céng","居":"jū","屈":"qū","屉":"tì","届":"jiè","屋":"wū","屎":"shǐ","屏":"píng","屑":"xiè","展":"zhǎn","属":"shǔ","屠":"tú","屡":"lǚ","履":"lǚ","屯":"tún","山":"shān","屹":"yì","屿":"yǔ","岁":"suì","岂":"qǐ","岔":"chà","岗":"gǎng","岛":"dǎo","岩":"yán","岭":"lǐng","岳":"yuè","岸":"àn","岿":"kuī","峙":"zhì","峡":"xiá","峦":"luán","峨":"é","峪":"yù","峭":"qiào","峰":"fēng","峻":"jùn","崇":"chóng","崎":"qí","崔":"cuī","崖":"yá","崩":"bēng","崭":"zhǎn","嵌":"qiàn","巍":"wēi","川":"chuān","州":"zhōu","巡":"xún","巢":"cháo","工":"gōng","左":"zuǒ","巧":"qiǎo","巨":"jù","巩":"gǒng","巫":"wū","差":"chà","己":"jǐ","已":"yǐ","巳":"sì","巴":"bā","巷":"xiàng","巽":"xùn","巾":"jīn","币":"bì","市":"shì","布":"bù","帅":"shuài","帆":"fān","师":"shī","希":"xī","帐":"zhàng","帕":"pà","帖":"tiē","帘":"lián","帚":"zhǒu","帛":"bó","帜":"zhì","帝":"dì","带":"dài","帧":"zhēn","席":"xí","帮":"bāng","常":"cháng","帽":"mào","幂":"mì","幅":"fú","幌":"huǎng","幕":"mù","幢":"chuáng","干":"gàn","平":"píng","年":"nián","并":"bìng","幸":"xìng","幻":"huàn","幼":"yòu","幽":"yōu","广":"guǎng","庄":"zhuāng","庆":"qìng","庇":"bì","床":"chuáng","序":"xù","庐":"lú","库":"kù","应":"yīng","底":"dǐ","店":"diàn","庙":"miào","庚":"gēng","府":"fǔ","庞":"páng","废":"fèi","度":"dù","座":"zuò","庭":"tíng","庶":"shù","康":"kāng","庸":"yōng","廉":"lián","廊":"láng","廓":"kuò","廖":"liào","延":"yán","廷":"tíng","建":"jiàn","廿":"niàn","开":"kāi","异":"yì","弃":"qì","弄":"nòng","弊":"bì","式":"shì","弓":"gōng","引":"yǐn","弗":"fú","弘":"hóng","弛":"chí","弟":"dì","张":"zhāng","弥":"mí","弦":"xián","弧":"hú","弯":"wān","弱":"ruò","弹":"dàn","强":"qiáng","归":"guī","当":"dāng","录":"lù","彝":"yí","形":"xíng","彤":"tóng","彦":"yàn","彩":"cǎi","彪":"biāo","彬":"bīn","彭":"péng","彰":"zhāng","影":"yǐng","役":"yì","彻":"chè","彼":"bǐ","往":"wǎng","征":"zhēng","径":"jìng","待":"dài","很":"hěn","徊":"huái","律":"lǜ","徐":"xú","徒":"tú","得":"dé","徘":"pái","御":"yù","循":"xún","微":"wēi","德":"dé","徽":"huī","心":"xīn","必":"bì","忆":"yì","忌":"jì","忍":"rěn","志":"zhì","忘":"wàng","忙":"máng","忠":"zhōng","忧":"yōu","快":"kuài","忱":"chén","念":"niàn","忻":"xīn","忽":"hū","忿":"fèn","怀":"huái","态":"tài","怂":"sǒng","怎":"zěn","怒":"nù","怔":"zhēng","怕":"pà","怖":"bù","怜":"lián","思":"sī","怠":"dài","急":"jí","性":"xìng","怨":"yuàn","怪":"guài","怯":"qiè","总":"zǒng","恃":"shì","恋":"liàn","恍":"huǎng","恐":"kǒng","恒":"héng","恕":"shù","恢":"huī","恤":"xù","恨":"hèn","恩":"ēn","恫":"dòng","恬":"tián","恭":"gōng","息":"xī","恰":"qià","恳":"kěn","恶":"è","恼":"nǎo","恿":"yǒng","悄":"qiāo","悉":"xī","悍":"hàn","悔":"huǐ","悟":"wù","悠":"yōu","患":"huàn","悦":"yuè","您":"nín","悬":"xuán","悯":"mǐn","悲":"bēi","悸":"jì","悼":"dào","情":"qíng","惊":"jīng","惋":"wǎn","惑":"huò","惕":"tì","惜":"xī","惟":"wéi","惠":"huì","惦":"diàn","惧":"jù","惨":"cǎn","惩":"chéng","惫":"bèi","惭":"cán","惮":"dàn","惯":"guàn","惰":"duò","想":"xiǎng","惶":"huáng","惹":"rě","惺":"xīng","愁":"chóu","愈":"yù","愉":"yú","意":"yì","愚":"yú","感":"gǎn","愤":"fèn","愧":"kuì","愿":"yuàn","慈":"cí","慌":"huāng","慎":"shèn","慑":"shè","慕":"mù","慢":"màn","慧":"huì","慨":"kǎi","慰":"wèi","慷":"kāng","憋":"biē","憎":"zēng","憨":"hān","憾":"hàn","懂":"dǒng","懈":"xiè","懊":"ào","懒":"lǎn","懦":"nuò","戈":"gē","戊":"wù","戌":"xū","戍":"shù","戎":"róng","戏":"xì","成":"chéng","我":"wǒ","戒":"jiè","或":"huò","战":"zhàn","戚":"qī","截":"jié","戮":"lù","戳":"chuō","戴":"dài","户":"hù","房":"fáng","所":"suǒ","扁":"biǎn","扇":"shàn","手":"shǒu","才":"cái","扎":"zhā","扑":"pū","扒":"bā","打":"dǎ","扔":"rēng","托":"tuō","扛":"káng","扣":"kòu","扦":"qiān","执":"zhí","扩":"kuò","扫":"sǎo","扬":"yáng","扭":"niǔ","扮":"bàn","扯":"chě","扰":"rǎo","扳":"bān","扶":"fú","批":"pī","扼":"è","找":"zhǎo","承":"chéng","技":"jì","抄":"chāo","抉":"jué","把":"bǎ","抑":"yì","抒":"shū","抓":"zhuā","投":"tóu","抖":"dǒu","抗":"kàng","折":"zhé","抚":"fǔ","抛":"pāo","抠":"kōu","抡":"lūn","抢":"qiǎng","护":"hù","报":"bào","抨":"pēng","披":"pī","抬":"tái","抱":"bào","抵":"dǐ","抹":"mǒ","押":"yā","抽":"chōu","抿":"mǐn","拂":"fú","拄":"zhǔ","担":"dān","拆":"chāi","拇":"mǔ","拈":"niān","拉":"lā","拌":"bàn","拍":"pāi","拎":"līn","拐":"guǎi","拒":"jù","拓":"tuò","拔":"bá","拖":"tuō","拘":"jū","拙":"zhuō","招":"zhāo","拜":"bài","拟":"nǐ","拢":"lǒng","拣":"jiǎn","拥":"yōng","拦":"lán","拧":"níng","拨":"bō","择":"zé","括":"kuò","拭":"shì","拯":"zhěng","拱":"gǒng","拳":"quán","拴":"shuān","拷":"kǎo","拼":"pīn","拽":"zhuāi","拾":"shí","拿":"ná","持":"chí","挂":"guà","指":"zhǐ","按":"àn","挎":"kuà","挑":"tiāo","挖":"wā","挚":"zhì","挛":"luán","挝":"wō","挞":"tà","挟":"xié","挠":"náo","挡":"dǎng","挣":"zhēng","挤":"jǐ","挥":"huī","挨":"āi","挪":"nuó","挫":"cuò","振":"zhèn","挺":"tǐng","挽":"wǎn","捂":"wǔ","捅":"tǒng","捆":"kǔn","捉":"zhuō","捌":"bā","捍":"hàn","捎":"shāo","捏":"niē","捐":"juān","捕":"bǔ","捞":"lāo","损":"sǔn","捡":"jiǎn","换":"huàn","捣":"dǎo","捧":"pěng","据":"jù","捶":"chuí","捷":"jié","捻":"niǎn","掀":"xiān","掂":"diān","掇":"duō","授":"shòu","掉":"diào","掌":"zhǎng","掏":"tāo","掐":"qiā","排":"pái","掖":"yē","掘":"jué","掠":"lüè","探":"tàn","掣":"chè","接":"jiē","控":"kòng","推":"tuī","掩":"yǎn","措":"cuò","掳":"lǔ","掷":"zhì","掸":"dǎn","掺":"càn","揉":"róu","揍":"zòu","描":"miáo","提":"tí","插":"chā","揖":"yī","握":"wò","揣":"chuāi","揩":"kāi","揪":"jiū","揭":"jiē","援":"yuán","揽":"lǎn","搀":"chān","搁":"gē","搂":"lǒu","搅":"jiǎo","搏":"bó","搐":"chù","搓":"cuō","搔":"sāo","搜":"sōu","搞":"gǎo","搪":"táng","搬":"bān","搭":"dā","携":"xié","搽":"chá","摄":"shè","摆":"bǎi","摇":"yáo","摈":"bìn","摊":"tān","摔":"shuāi","摘":"zhāi","摧":"cuī","摩":"mó","摸":"mō","摹":"mó","撂":"liào","撅":"juē","撇":"piē","撑":"chēng","撒":"sā","撕":"sī","撞":"zhuàng","撤":"chè","撩":"liāo","撬":"qiào","播":"bō","撮":"cuō","撰":"zhuàn","撵":"niǎn","撼":"hàn","擂":"léi","擅":"shàn","操":"cāo","擎":"qíng","擒":"qín","擞":"sǒu","擦":"cā","攀":"pān","攒":"zǎn","攘":"rǎng","攫":"jué","支":"zhī","收":"shōu","攸":"yōu","改":"gǎi","攻":"gōng","放":"fàng","政":"zhèng","故":"gù","效":"xiào","敌":"dí","敏":"mǐn","救":"jiù","敖":"áo","教":"jiào","敛":"liǎn","敝":"bì","敞":"chǎng","敢":"gǎn","散":"sàn","敦":"dūn","敬":"jìng","数":"shù","敲":"qiāo","整":"zhěng","敷":"fū","文":"wén","斋":"zhāi","斌":"bīn","斑":"bān","斗":"dòu","料":"liào","斜":"xié","斟":"zhēn","斡":"wò","斤":"jīn","斥":"chì","斧":"fǔ","斩":"zhǎn","断":"duàn","斯":"sī","新":"xīn","方":"fāng","施":"shī","旁":"páng","旅":"lǚ","旋":"xuán","族":"zú","旗":"qí","无":"wú","既":"jì","日":"rì","旦":"dàn","旧":"jiù","旨":"zhǐ","早":"zǎo","旬":"xún","旭":"xù","旱":"hàn","时":"shí","旷":"kuàng","旺":"wàng","昂":"áng","昆":"kūn","昌":"chāng","明":"míng","昏":"hūn","易":"yì","昔":"xī","星":"xīng","映":"yìng","春":"chūn","昧":"mèi","昨":"zuó","昭":"zhāo","是":"shì","昼":"zhòu","显":"xiǎn","晃":"huǎng","晋":"jìn","晌":"shǎng","晒":"shài","晓":"xiǎo","晕":"yūn","晚":"wǎn","晤":"wù","晦":"huì","晨":"chén","普":"pǔ","景":"jǐng","晰":"xī","晴":"qíng","晶":"jīng","智":"zhì","晾":"liàng","暂":"zàn","暇":"xiá","暑":"shǔ","暖":"nuǎn","暗":"àn","暮":"mù","暴":"bào","曙":"shǔ","曝":"pù","曰":"yuē","曲":"qū","曳":"yè","更":"gèng","曹":"cáo","曼":"màn","曾":"céng","替":"tì","最":"zuì","月":"yuè","有":"yǒu","朋":"péng","服":"fú","朔":"shuò","朗":"lǎng","望":"wàng","朝":"cháo","期":"qī","木":"mù","未":"wèi","末":"mò","本":"běn","札":"zhá","术":"shù","朱":"zhū","朴":"pǔ","朵":"duǒ","机":"jī","朽":"xiǔ","杀":"shā","杂":"zá","权":"quán","杆":"gān","杉":"shān","李":"lǐ","杏":"xìng","材":"cái","村":"cūn","杖":"zhàng","杜":"dù","束":"shù","杠":"gāng","条":"tiáo","来":"lái","杨":"yáng","杭":"háng","杯":"bēi","杰":"jié","松":"sōng","板":"bǎn","极":"jí","构":"gòu","枉":"wǎng","析":"xī","枕":"zhěn","林":"lín","枚":"méi","果":"guǒ","枝":"zhī","枢":"shū","枣":"zǎo","枪":"qiāng","枫":"fēng","枯":"kū","架":"jià","枷":"jiā","柄":"bǐng","柏":"bǎi","某":"mǒu","柑":"gān","柒":"qī","染":"rǎn","柔":"róu","柜":"guì","柞":"zhà","柠":"níng","查":"chá","柬":"jiǎn","柯":"kē","柱":"zhù","柳":"liǔ","柴":"chái","柿":"shì","栅":"zhà","标":"biāo","栈":"zhàn","栋":"dòng","栏":"lán","树":"shù","栓":"shuān","栖":"qī","栗":"lì","校":"xiào","株":"zhū","样":"yàng","核":"hé","根":"gēn","格":"gé","栽":"zāi","桂":"guì","桃":"táo","桅":"wéi","框":"kuāng","案":"àn","桌":"zhuō","桐":"tóng","桑":"sāng","桓":"huán","桔":"jú","档":"dàng","桥":"qiáo","桨":"jiǎng","桩":"zhuāng","桶":"tǒng","梁":"liáng","梅":"méi","梆":"bāng","梗":"gěng","梢":"shāo","梦":"mèng","梧":"wú","梨":"lí","梭":"suō","梯":"tī","械":"xiè","梳":"shū","检":"jiǎn","棉":"mián","棋":"qí","棍":"gùn","棒":"bàng","棕":"zōng","棘":"jí","棚":"péng","棠":"táng","森":"sēn","棱":"léng","棵":"kē","棺":"guān","椅":"yǐ","植":"zhí","椎":"chuí","椒":"jiāo","椭":"tuǒ","椰":"yē","椽":"chuán","椿":"chūn","楔":"xiē","楚":"chǔ","楞":"léng","楷":"kǎi","楼":"lóu","概":"gài","榆":"yú","榔":"láng","榜":"bǎng","榨":"zhà","榴":"liú","榷":"què","槐":"huái","槛":"kǎn","槽":"cáo","樊":"fán","樟":"zhāng","模":"mó","横":"héng","樱":"yīng","橇":"qiāo","橙":"chéng","橡":"xiàng","橱":"chú","檀":"tán","檄":"xí","檬":"méng","欠":"qiàn","次":"cì","欢":"huān","欣":"xīn","欧":"ōu","欲":"yù","欺":"qī","款":"kuǎn","歇":"xiē","歉":"qiàn","歌":"gē","止":"zhǐ","正":"zhèng","此":"cǐ","步":"bù","武":"wǔ","歧":"qí","歪":"wāi","歹":"dǎi","死":"sǐ","歼":"jiān","殃":"yāng","殆":"dài","殉":"xùn","殊":"shū","残":"cán","殖":"zhí","殴":"ōu","段":"duàn","殷":"yīn","殿":"diàn","毁":"huǐ","毅":"yì","毋":"wú","母":"mǔ","每":"měi","毒":"dú","毓":"yù","比":"bǐ","毕":"bì","毖":"bì","毗":"pí","毙":"bì","毛":"máo","毡":"zhān","毫":"háo","毯":"tǎn","氏":"shì","氐":"dī","民":"mín","氓":"máng","气":"qì","氖":"nǎi","氛":"fēn","氟":"fú","氢":"qīng","氦":"hài","氧":"yǎng","氨":"ān","氮":"dàn","氯":"lǜ","氰":"qíng","水":"shuǐ","永":"yǒng","氽":"tǔn","汀":"tīng","汁":"zhī","求":"qiú","汆":"cuān","汇":"huì","汉":"hàn","汐":"xī","汕":"shàn","汗":"hàn","汛":"xùn","汝":"rǔ","汞":"gǒng","江":"jiāng","池":"chí","污":"wū","汤":"tāng","汪":"wāng","汰":"tài","汲":"jí","汹":"xiōng","汽":"qì","汾":"fén","沁":"qìn","沂":"yí","沃":"wò","沈":"shěn","沉":"chén","沏":"qī","沙":"shā","沛":"pèi","沟":"gōu","没":"méi","沤":"ōu","沥":"lì","沦":"lún","沧":"cāng","沪":"hù","沫":"mò","沮":"jǔ","河":"hé","沸":"fèi","油":"yóu","治":"zhì","沼":"zhǎo","沽":"gū","沾":"zhān","沿":"yán","泄":"xiè","泅":"qiú","泉":"quán","泊":"pō","泌":"mì","法":"fǎ","泛":"fàn","泞":"nìng","泡":"pào","波":"bō","泣":"qì","泥":"ní","注":"zhù","泪":"lèi","泰":"tài","泳":"yǒng","泵":"bèng","泻":"xiè","泼":"pō","泽":"zé","洁":"jié","洋":"yáng","洒":"sǎ","洗":"xǐ","洛":"luò","洞":"dòng","津":"jīn","洪":"hóng","洱":"ěr","洲":"zhōu","活":"huó","洼":"wā","洽":"qià","派":"pài","流":"liú","浅":"qiǎn","浆":"jiāng","浇":"jiāo","浊":"zhuó","测":"cè","济":"jì","浑":"hún","浓":"nóng","浙":"zhè","浚":"jùn","浦":"pǔ","浩":"hào","浪":"làng","浮":"fú","浴":"yù","海":"hǎi","浸":"jìn","涂":"tú","涅":"niè","消":"xiāo","涉":"shè","涌":"yǒng","涎":"xián","涕":"tì","涛":"tāo","涝":"lào","涟":"lián","涡":"wō","涣":"huàn","涤":"dí","润":"rùn","涧":"jiàn","涨":"zhǎng","涩":"sè","涪":"fú","涯":"yá","液":"yè","涵":"hán","涸":"hé","淀":"diàn","淄":"zī","淆":"xiáo","淋":"lín","淌":"tǎng","淑":"shū","淖":"nào","淘":"táo","淡":"dàn","淤":"yū","淫":"yín","淬":"cuì","淮":"huái","深":"shēn","淳":"chún","混":"hùn","淹":"yān","添":"tiān","清":"qīng","渊":"yuān","渍":"zì","渐":"jiàn","渔":"yú","渗":"shèn","渝":"yú","渠":"qú","渡":"dù","渣":"zhā","渤":"bó","温":"wēn","渭":"wèi","港":"gǎng","渴":"kě","游":"yóu","渺":"miǎo","湃":"pài","湍":"tuān","湖":"hú","湘":"xiāng","湛":"zhàn","湾":"wān","湿":"shī","溃":"kuì","溅":"jiàn","溉":"gài","源":"yuán","溜":"liū","溢":"yì","溪":"xī","溯":"sù","溶":"róng","溺":"nì","滁":"chú","滇":"diān","滋":"zī","滑":"huá","滓":"zǐ","滔":"tāo","滚":"gǔn","滞":"zhì","满":"mǎn","滤":"lǜ","滥":"làn","滦":"luán","滨":"bīn","滩":"tān","滴":"dī","漂":"piāo","漆":"qī","漏":"lòu","漓":"lí","演":"yǎn","漠":"mò","漫":"màn","漱":"shù","漳":"zhāng","漾":"yàng","潍":"wéi","潘":"pān","潜":"qián","潞":"lù","潦":"lǎo","潭":"tán","潮":"cháo","澄":"chéng","澈":"chè","澎":"pēng","澜":"lán","澡":"zǎo","澳":"ào","激":"jī","濒":"bīn","瀑":"pù","灌":"guàn","火":"huǒ","灭":"miè","灯":"dēng","灰":"huī","灵":"líng","灶":"zào","灸":"jiǔ","灼":"zhuó","灾":"zāi","灿":"càn","炉":"lú","炊":"chuī","炎":"yán","炒":"chǎo","炔":"guì","炕":"kàng","炙":"zhì","炬":"jù","炭":"tàn","炮":"pào","炯":"jiǒng","炳":"bǐng","炸":"zhà","点":"diǎn","炼":"liàn","炽":"chì","烁":"shuò","烂":"làn","烃":"tīng","烈":"liè","烘":"hōng","烙":"lào","烛":"zhú","烟":"yān","烤":"kǎo","烦":"fán","烧":"shāo","烩":"huì","烫":"tàng","烬":"jìn","热":"rè","烯":"xī","烷":"wán","烹":"pēng","烽":"fēng","焉":"yān","焊":"hàn","焕":"huàn","焙":"bèi","焚":"fén","焦":"jiāo","焰":"yàn","然":"rán","煌":"huáng","煎":"jiān","煞":"shā","煤":"méi","照":"zhào","煮":"zhǔ","煽":"shān","熄":"xī","熊":"xióng","熏":"xūn","熔":"róng","熙":"xī","熟":"shú","熬":"áo","燃":"rán","燎":"liáo","燕":"yàn","燥":"zào","爆":"bào","爪":"zhǎo","爬":"pá","爱":"ài","爵":"jué","父":"fù","爷":"yé","爸":"bà","爹":"diē","爻":"yáo","爽":"shuǎng","片":"piàn","版":"bǎn","牌":"pái","牙":"yá","牛":"niú","牟":"móu","牡":"mǔ","牢":"láo","牧":"mù","物":"wù","牲":"shēng","牵":"qiān","特":"tè","牺":"xī","犀":"xī","犁":"lí","犊":"dú","犬":"quǎn","犯":"fàn","状":"zhuàng","犹":"yóu","狂":"kuáng","狄":"dí","狈":"bèi","狐":"hú","狗":"gǒu","狙":"jū","狞":"níng","狠":"hěn","狡":"jiǎo","独":"dú","狭":"xiá","狮":"shī","狰":"zhēng","狱":"yù","狸":"lí","狼":"láng","猎":"liè","猖":"chāng","猛":"měng","猜":"cāi","猩":"xīng","猪":"zhū","猫":"māo","献":"xiàn","猴":"hóu","猾":"huá","猿":"yuán","獭":"tǎ","玄":"xuán","率":"lǜ","玉":"yù","王":"wáng","玖":"jiǔ","玛":"mǎ","玩":"wán","玫":"méi","环":"huán","现":"xiàn","玲":"líng","玻":"bō","珊":"shān","珍":"zhēn","珐":"fà","珠":"zhū","班":"bān","球":"qiú","琅":"láng","理":"lǐ","琉":"liú","琐":"suǒ","琢":"zuó","琳":"lín","琴":"qín","琵":"pí","琶":"pá","琼":"qióng","瑚":"hú","瑞":"ruì","瑟":"sè","瑰":"guī","瑶":"yáo","璃":"lí","瓜":"guā","瓢":"piáo","瓣":"bàn","瓤":"ráng","瓦":"wǎ","瓮":"wèng","瓶":"píng","瓷":"cí","甄":"zhēn","甘":"gān","甚":"shèn","甜":"tián","生":"shēng","甥":"shēng","用":"yòng","甩":"shuǎi","甫":"fǔ","甭":"béng","田":"tián","由":"yóu","甲":"jiǎ","申":"shēn","电":"diàn","男":"nán","甸":"diān","画":"huà","畅":"chàng","界":"jiè","畏":"wèi","畔":"pàn","留":"liú","畜":"chù","略":"lüè","畦":"qí","番":"fān","畴":"chóu","畸":"jī","疆":"jiāng","疏":"shū","疑":"yí","疗":"liáo","疙":"gē","疚":"jiù","疟":"nüè","疡":"yáng","疤":"bā","疥":"jiè","疫":"yì","疮":"chuāng","疯":"fēng","疲":"pí","疵":"cī","疹":"zhěn","疼":"téng","疽":"jū","疾":"jí","病":"bìng","症":"zhèng","痈":"yōng","痉":"jìng","痊":"quán","痒":"yǎng","痔":"zhì","痕":"hén","痘":"dòu","痛":"tòng","痞":"pǐ","痢":"lì","痪":"huàn","痰":"tán","痴":"chī","痹":"bì","瘁":"cuì","瘟":"wēn","瘤":"liú","瘦":"shòu","瘩":"dā","瘪":"biě","瘫":"tān","瘴":"zhàng","瘸":"qué","癌":"ái","癣":"xuǎn","癸":"guǐ","登":"dēng","白":"bái","百":"bǎi","皂":"zào","的":"de","皆":"jiē","皇":"huáng","皋":"gāo","皑":"ái","皖":"wǎn","皮":"pí","皱":"zhòu","皿":"mǐn","盂":"yú","盅":"zhōng","盆":"pén","盈":"yíng","益":"yì","盎":"àng","盏":"zhǎn","盐":"yán","监":"jiān","盒":"hé","盔":"kuī","盖":"gài","盗":"dào","盘":"pán","盛":"shèng","盟":"méng","目":"mù","盯":"dīng","盲":"máng","直":"zhí","相":"xiāng","盼":"pàn","盾":"dùn","省":"shěng","眉":"méi","看":"kàn","真":"zhēn","眠":"mián","眨":"zhǎ","眩":"xuàn","眯":"mī","眶":"kuàng","眷":"juàn","眺":"tiào","眼":"yǎn","着":"zhe","睁":"zhēng","睛":"jīng","睡":"shuì","督":"dū","睦":"mù","睫":"jié","睬":"cǎi","睹":"dǔ","睾":"gāo","瞄":"miáo","瞅":"chǒu","瞎":"xiā","瞒":"mán","瞥":"piē","瞧":"qiáo","瞩":"zhǔ","瞪":"dèng","瞬":"shùn","瞳":"tóng","瞻":"zhān","矗":"chù","矛":"máo","矢":"shǐ","矣":"yǐ","知":"zhī","矩":"jǔ","矫":"jiǎo","短":"duǎn","矮":"ǎi","石":"shí","矽":"xì","矾":"fán","矿":"kuàng","码":"mǎ","砂":"shā","砌":"qì","砍":"kǎn","砒":"pī","研":"yán","砖":"zhuān","砚":"yàn","砧":"zhēn","砰":"pēng","破":"pò","砷":"shēn","砸":"zá","砾":"lì","础":"chǔ","硅":"guī","硒":"xī","硕":"shuò","硝":"xiāo","硫":"liú","硬":"yìng","确":"què","硷":"jiǎn","硼":"péng","碉":"diāo","碌":"lù","碍":"ài","碎":"suì","碑":"bēi","碗":"wǎn","碘":"diǎn","碟":"dié","碧":"bì","碰":"pèng","碱":"jiǎn","碳":"tàn","碴":"chá","碾":"niǎn","磁":"cí","磅":"bàng","磊":"lěi","磋":"cuō","磐":"pán","磕":"kē","磨":"mó","磷":"lín","磺":"huáng","礁":"jiāo","示":"shì","礼":"lǐ","社":"shè","祁":"qí","祈":"qí","祖":"zǔ","祝":"zhù","神":"shén","祟":"suì","祥":"xiáng","票":"piào","祭":"jì","祷":"dǎo","祸":"huò","禀":"bǐng","禁":"jìn","禄":"lù","福":"fú","禹":"yǔ","禺":"yú","离":"lí","禽":"qín","禾":"hé","秀":"xiù","私":"sī","秃":"tū","秆":"gǎn","秉":"bǐng","秋":"qiū","种":"zhǒng","科":"kē","秒":"miǎo","秘":"mì","租":"zū","秤":"chèng","秦":"qín","秧":"yāng","秩":"zhì","积":"jī","称":"chēng","秸":"jiē","移":"yí","秽":"huì","稀":"xī","程":"chéng","稍":"shāo","税":"shuì","稗":"bài","稚":"zhì","稠":"chóu","稳":"wěn","稻":"dào","稼":"jià","稽":"jī","稿":"gǎo","穆":"mù","穗":"suì","穴":"xué","究":"jiū","穷":"qióng","空":"kōng","穿":"chuān","突":"tū","窃":"qiè","窄":"zhǎi","窍":"qiào","窑":"yáo","窒":"zhì","窖":"jiào","窗":"chuāng","窘":"jiǒng","窜":"cuàn","窝":"wō","窟":"kū","窥":"kuī","窿":"lóng","立":"lì","竖":"shù","站":"zhàn","竞":"jìng","竟":"jìng","章":"zhāng","竣":"jùn","童":"tóng","竭":"jié","端":"duān","竹":"zhú","竿":"gān","笆":"bā","笋":"sǔn","笑":"xiào","笔":"bǐ","笛":"dí","符":"fú","笨":"bèn","第":"dì","笺":"jiān","笼":"lóng","等":"děng","筋":"jīn","筏":"fá","筐":"kuāng","筑":"zhù","筒":"tǒng","答":"dá","策":"cè","筛":"shāi","筷":"kuài","筹":"chóu","签":"qiān","简":"jiǎn","箍":"gū","箔":"bó","箕":"jī","算":"suàn","管":"guǎn","箩":"luó","箭":"jiàn","箱":"xiāng","篆":"zhuàn","篇":"piān","篓":"lǒu","篙":"gāo","篡":"cuàn","篮":"lán","篱":"lí","篷":"péng","簇":"cù","簧":"huáng","簿":"bù","籍":"jí","米":"mǐ","籴":"dí","类":"lèi","籽":"zǐ","粉":"fěn","粒":"lì","粕":"pò","粗":"cū","粘":"zhān","粟":"sù","粤":"yuè","粥":"zhōu","粪":"fèn","粮":"liáng","粱":"liáng","粳":"jīng","粹":"cuì","精":"jīng","糊":"hú","糕":"gāo","糖":"táng","糙":"cāo","糜":"mí","糟":"zāo","糠":"kāng","糯":"nuò","系":"xì","紊":"wěn","素":"sù","索":"suǒ","紧":"jǐn","紫":"zǐ","累":"lèi","絮":"xù","繁":"fán","纂":"zuǎn","纠":"jiū","红":"hóng","纤":"xiān","约":"yuē","级":"jí","纪":"jì","纫":"rèn","纬":"wěi","纯":"chún","纱":"shā","纲":"gāng","纳":"nà","纵":"zòng","纶":"lún","纷":"fēn","纸":"zhǐ","纹":"wén","纺":"fǎng","纽":"niǔ","线":"xiàn","练":"liàn","组":"zǔ","绅":"shēn","细":"xì","织":"zhī","终":"zhōng","绊":"bàn","绍":"shào","绎":"yì","经":"jīng","绑":"bǎng","绒":"róng","结":"jié","绕":"rào","绘":"huì","给":"gěi","绚":"xuàn","络":"luò","绝":"jué","绞":"jiǎo","统":"tǒng","绢":"juàn","绣":"xiù","绥":"suí","绦":"tāo","继":"jì","绩":"jì","绪":"xù","续":"xù","绰":"chuò","绳":"shéng","维":"wéi","绵":"mián","绷":"bēng","绸":"chóu","综":"zōng","绽":"zhàn","绿":"lǜ","缀":"zhuì","缄":"jiān","缅":"miǎn","缆":"lǎn","缉":"jī","缎":"duàn","缓":"huǎn","缔":"dì","缕":"lǚ","编":"biān","缘":"yuán","缚":"fù","缝":"fèng","缠":"chán","缨":"yīng","缩":"suō","缮":"shàn","缴":"jiǎo","缸":"gāng","缺":"quē","罐":"guàn","网":"wǎng","罔":"wǎng","罕":"hǎn","罗":"luó","罚":"fá","罢":"bà","罩":"zhào","罪":"zuì","置":"zhì","署":"shǔ","羊":"yáng","羌":"qiāng","美":"měi","羔":"gāo","羚":"líng","羞":"xiū","羡":"xiàn","群":"qún","羸":"léi","羹":"gēng","羽":"yǔ","翁":"wēng","翅":"chì","翌":"yì","翔":"xiáng","翘":"qiào","翟":"dí","翠":"cuì","翰":"hàn","翱":"áo","翻":"fān","翼":"yì","耀":"yào","老":"lǎo","考":"kǎo","者":"zhě","而":"ér","耍":"shuǎ","耐":"nài","耕":"gēng","耗":"hào","耘":"yún","耙":"bà","耪":"pǎng","耳":"ěr","耶":"yé","耸":"sǒng","耻":"chǐ","耽":"dān","耿":"gěng","聂":"niè","聊":"liáo","聋":"lóng","职":"zhí","联":"lián","聘":"pìn","聚":"jù","聪":"cōng","肃":"sù","肄":"yì","肆":"sì","肇":"zhào","肉":"ròu","肋":"lē","肌":"jī","肖":"xiào","肘":"zhǒu","肚":"dù","肛":"gāng","肝":"gān","肠":"cháng","股":"gǔ","肢":"zhī","肤":"fū","肥":"féi","肩":"jiān","肪":"fáng","肮":"āng","肯":"kěn","育":"yù","肺":"fèi","肾":"shèn","肿":"zhǒng","胀":"zhàng","胁":"xié","胃":"wèi","胆":"dǎn","背":"bèi","胎":"tāi","胖":"pàng","胚":"pēi","胜":"shèng","胞":"bāo","胡":"hú","胤":"yìn","胯":"kuà","胰":"yí","胳":"gē","胶":"jiāo","胸":"xiōng","胺":"àn","能":"néng","脂":"zhī","脆":"cuì","脉":"mài","脊":"jí","脏":"zàng","脐":"qí","脑":"nǎo","脓":"nóng","脔":"luán","脖":"bó","脚":"jiǎo","脯":"pú","脱":"tuō","脸":"liǎn","脾":"pí","腆":"tiǎn","腊":"là","腋":"yè","腐":"fǔ","腑":"fǔ","腔":"qiāng","腕":"wàn","腥":"xīng","腮":"sāi","腰":"yāo","腹":"fù","腺":"xiàn","腻":"nì","腾":"téng","腿":"tuǐ","膀":"bǎng","膊":"bó","膏":"gāo","膘":"biāo","膛":"táng","膜":"mó","膝":"xī","膨":"péng","膳":"shàn","臀":"tún","臂":"bì","臃":"yōng","臆":"yì","臣":"chén","自":"zì","臭":"chòu","至":"zhì","致":"zhì","臻":"zhēn","臼":"jiù","舀":"yǎo","舅":"jiù","舆":"yú","舌":"shé","舍":"shě","舒":"shū","舔":"tiǎn","舜":"shùn","舞":"wǔ","舟":"zhōu","航":"háng","般":"bān","舰":"jiàn","舱":"cāng","舵":"duò","舶":"bó","舷":"xián","船":"chuán","艇":"tǐng","艘":"sōu","良":"liáng","艰":"jiān","色":"sè","艳":"yàn","艺":"yì","艾":"ài","节":"jié","芈":"mǐ","芋":"yù","芍":"sháo","芒":"máng","芜":"wú","芝":"zhī","芥":"jiè","芦":"lú","芬":"fēn","芭":"bā","芯":"xīn","花":"huā","芳":"fāng","芹":"qín","芽":"yá","苇":"wěi","苍":"cāng","苏":"sū","苑":"yuàn","苔":"tái","苗":"miáo","苛":"kē","苞":"bāo","苟":"gǒu","若":"ruò","苦":"kǔ","苫":"shān","苯":"běn","英":"yīng","苹":"píng","茁":"zhuó","茂":"mào","范":"fàn","茄":"jiā","茅":"máo","茎":"jīng","茧":"jiǎn","茨":"cí","茫":"máng","茬":"chá","茵":"yīn","茶":"chá","茸":"rōng","茹":"rú","荆":"jīng","草":"cǎo","荐":"jiàn","荒":"huāng","荔":"lì","荚":"jiá","荡":"dàng","荣":"róng","荤":"hūn","荧":"yíng","荫":"yīn","药":"yào","荷":"hé","莆":"pú","莉":"lì","莎":"shā","莫":"mò","莱":"lái","莲":"lián","获":"huò","莹":"yíng","莽":"mǎng","菇":"gū","菊":"jú","菌":"jūn","菏":"hé","菜":"cài","菠":"bō","菩":"pú","菱":"líng","菲":"fēi","萄":"táo","萌":"méng","萍":"píng","萎":"wēi","萝":"luó","萤":"yíng","营":"yíng","萧":"xiāo","萨":"sà","落":"luò","著":"zhù","葛":"gé","葡":"pú","董":"dǒng","葫":"hú","葬":"zàng","葱":"cōng","葵":"kuí","蒂":"dì","蒋":"jiǎng","蒙":"méng","蒜":"suàn","蒯":"kuǎi","蒲":"pú","蒸":"zhēng","蓄":"xù","蓉":"róng","蓑":"suō","蓖":"bì","蓝":"lán","蓟":"jì","蓬":"péng","蔑":"miè","蔓":"màn","蔗":"zhè","蔚":"wèi","蔡":"cài","蔫":"niān","蔬":"shū","蔷":"qiáng","蔼":"ǎi","蔽":"bì","蕉":"jiāo","蕊":"ruǐ","蕴":"yùn","蕾":"lěi","薄":"báo","薛":"xuē","薪":"xīn","薯":"shǔ","藉":"jí","藏":"cáng","藐":"miǎo","藕":"ǒu","藤":"téng","藩":"fān","藻":"zǎo","蘑":"mó","蘸":"zhàn","虎":"hǔ","虏":"lǔ","虐":"nüè","虑":"lǜ","虚":"xū","虞":"yú","虫":"chóng","虱":"shī","虹":"hóng","虽":"suī","虾":"xiā","蚀":"shí","蚁":"yǐ","蚂":"mǎ","蚊":"wén","蚌":"bàng","蚕":"cán","蚜":"yá","蚤":"zǎo","蛀":"zhù","蛆":"qū","蛇":"shé","蛊":"gǔ","蛋":"dàn","蛔":"huí","蛙":"wā","蛛":"zhū","蛤":"há","蛮":"mán","蛰":"zhé","蛹":"yǒng","蛾":"é","蜀":"shǔ","蜂":"fēng","蜒":"yán","蜕":"tuì","蜗":"wō","蜘":"zhī","蜜":"mì","蜡":"là","蝇":"yíng","蝉":"chán","蝎":"xiē","蝗":"huáng","蝴":"hú","蝶":"dié","融":"róng","螟":"míng","螺":"luó","蟹":"xiè","蠃":"luǒ","蠕":"rú","蠢":"chǔn","血":"xuè","衅":"xìn","行":"xíng","衍":"yǎn","衔":"xián","街":"jiē","衙":"yá","衡":"héng","衣":"yī","补":"bǔ","表":"biǎo","衫":"shān","衬":"chèn","衮":"gǔn","衰":"shuāi","衷":"zhōng","袁":"yuán","袄":"ǎo","袋":"dài","袍":"páo","袒":"tǎn","袖":"xiù","袜":"wà","袤":"mào","被":"bèi","袭":"xí","袱":"fú","裁":"cái","裂":"liè","装":"zhuāng","裒":"póu","裔":"yì","裕":"yù","裙":"qún","裤":"kù","裳":"shang","裴":"péi","裸":"luǒ","裹":"guǒ","褂":"guà","褐":"hè","褒":"bāo","褥":"rù","褪":"tuì","襄":"xiāng","襟":"jīn","西":"xī","要":"yào","覆":"fù","见":"jiàn","观":"guān","规":"guī","觅":"mì","视":"shì","览":"lǎn","觉":"jué","角":"jiǎo","解":"jiě","触":"chù","言":"yán","訇":"hōng","詹":"zhān","誉":"yù","誊":"téng","誓":"shì","警":"jǐng","譬":"pì","计":"jì","订":"dìng","讣":"fù","认":"rèn","讥":"jī","讨":"tǎo","让":"ràng","讫":"qì","训":"xùn","议":"yì","讯":"xùn","记":"jì","讲":"jiǎng","讳":"huì","讶":"yà","许":"xǔ","讹":"é","论":"lùn","讼":"sòng","讽":"fěng","设":"shè","访":"fǎng","诀":"jué","证":"zhèng","评":"píng","诅":"zǔ","识":"shí","诈":"zhà","诉":"sù","诊":"zhěn","诌":"zhōu","词":"cí","译":"yì","试":"shì","诗":"shī","诚":"chéng","诛":"zhū","话":"huà","诞":"dàn","诡":"guǐ","询":"xún","诣":"yì","该":"gāi","详":"xiáng","诧":"chà","诫":"jiè","诬":"wū","语":"yǔ","误":"wù","诱":"yòu","诲":"huì","说":"shuō","诵":"sòng","请":"qǐng","诸":"zhū","诺":"nuò","读":"dú","诽":"fěi","课":"kè","谁":"shuí","调":"diào","谅":"liàng","谆":"zhūn","谈":"tán","谊":"yì","谋":"móu","谍":"dié","谎":"huǎng","谐":"xié","谓":"wèi","谗":"chán","谚":"yàn","谜":"mí","谢":"xiè","谣":"yáo","谤":"bàng","谦":"qiān","谨":"jǐn","谩":"mán","谬":"miù","谭":"tán","谰":"lán","谱":"pǔ","谴":"qiǎn","谷":"gǔ","豁":"huō","豆":"dòu","豌":"wān","象":"xiàng","豢":"huàn","豪":"háo","豫":"yù","豹":"bào","豺":"chái","貉":"háo","貌":"mào","贝":"bèi","贞":"zhēn","负":"fù","贡":"gòng","财":"cái","责":"zé","贤":"xián","败":"bài","账":"zhàng","货":"huò","质":"zhì","贩":"fàn","贪":"tān","贫":"pín","贬":"biǎn","购":"gòu","贮":"zhù","贯":"guàn","贰":"èr","贱":"jiàn","贴":"tiē","贵":"guì","贷":"dài","贸":"mào","费":"fèi","贺":"hè","贼":"zéi","贾":"jiǎ","贿":"huì","赁":"lìn","赂":"lù","赃":"zāng","资":"zī","赊":"shē","赋":"fù","赌":"dǔ","赎":"shú","赏":"shǎng","赐":"cì","赔":"péi","赖":"lài","赘":"zhuì","赚":"zhuàn","赛":"sài","赜":"zé","赝":"yàn","赞":"zàn","赠":"zèng","赡":"shàn","赢":"yíng","赣":"gàn","赤":"chì","赦":"shè","赫":"hè","走":"zǒu","赴":"fù","赵":"zhào","赶":"gǎn","起":"qǐ","趁":"chèn","超":"chāo","越":"yuè","趋":"qū","趟":"tàng","趣":"qù","足":"zú","趴":"pā","趾":"zhǐ","跃":"yuè","跋":"bá","跌":"diē","跑":"pǎo","距":"jù","跟":"gēn","跨":"kuà","跪":"guì","路":"lù","跳":"tiào","践":"jiàn","跺":"duò","踊":"yǒng","踌":"chóu","踏":"tà","踞":"jù","踢":"tī","踩":"cǎi","踪":"zōng","蹄":"tí","蹈":"dǎo","蹋":"tà","蹦":"bèng","蹬":"dēng","蹭":"cèng","蹲":"dūn","蹿":"cuān","躁":"zào","躇":"chú","身":"shēn","躬":"gōng","躯":"qū","躲":"duǒ","躺":"tǎng","车":"chē","轧":"yà","轨":"guǐ","轩":"xuān","转":"zhuǎn","轮":"lún","软":"ruǎn","轰":"hōng","轴":"zhóu","轻":"qīng","载":"zài","轿":"jiào","较":"jiào","辅":"fǔ","辆":"liàng","辈":"bèi","辉":"huī","辊":"gǔn","辐":"fú","辑":"jí","输":"shū","辕":"yuán","辖":"xiá","辗":"niǎn","辙":"zhé","辛":"xīn","辜":"gū","辞":"cí","辟":"pì","辣":"là","辨":"biàn","辩":"biàn","辫":"biàn","辰":"chén","辱":"rǔ","边":"biān","辽":"liáo","达":"dá","迁":"qiān","迂":"yū","迄":"qì","迅":"xùn","过":"guò","迈":"mài","迎":"yíng","运":"yùn","近":"jìn","返":"fǎn","还":"hái","这":"zhè","进":"jìn","远":"yuǎn","违":"wéi","连":"lián","迟":"chí","迢":"tiáo","迪":"dí","迫":"pò","迭":"dié","述":"shù","迷":"mí","迸":"bèng","迹":"jì","追":"zhuī","退":"tuì","送":"sòng","适":"shì","逃":"táo","逆":"nì","选":"xuǎn","逊":"xùn","透":"tòu","逐":"zhú","递":"dì","途":"tú","逗":"dòu","通":"tōng","逛":"guàng","逝":"shì","逞":"chěng","速":"sù","造":"zào","逢":"féng","逮":"dǎi","逸":"yì","逻":"luó","逼":"bī","逾":"yú","遁":"dùn","遂":"suì","遇":"yù","遍":"biàn","遏":"è","道":"dào","遗":"yí","遣":"qiǎn","遥":"yáo","遭":"zāo","遮":"zhē","遵":"zūn","避":"bì","邀":"yāo","邑":"yì","邓":"dèng","邢":"xíng","那":"nà","邦":"bāng","邪":"xié","邮":"yóu","邯":"hán","邱":"qiū","邵":"shào","邹":"zōu","邻":"lín","郁":"yù","郊":"jiāo","郎":"láng","郑":"zhèng","郝":"hǎo","郡":"jùn","郧":"yún","部":"bù","郭":"guō","郴":"chēn","郸":"dān","都":"dōu","鄂":"è","鄙":"bǐ","酉":"yǒu","酋":"qiú","酌":"zhuó","配":"pèi","酒":"jiǔ","酗":"xù","酚":"fēn","酝":"yùn","酞":"tài","酣":"hān","酥":"sū","酪":"lào","酬":"chóu","酮":"tóng","酱":"jiàng","酵":"jiào","酶":"méi","酷":"kù","酸":"suān","酿":"niàng","醇":"chún","醉":"zuì","醋":"cù","醒":"xǐng","醚":"mí","醛":"quán","采":"cǎi","釉":"yòu","释":"shì","里":"lǐ","重":"zhòng","野":"yě","量":"liàng","金":"jīn","釜":"fǔ","鉴":"jiàn","针":"zhēn","钉":"dīng","钎":"qiān","钒":"fán","钓":"diào","钙":"gài","钝":"dùn","钞":"chāo","钟":"zhōng","钠":"nà","钡":"bèi","钢":"gāng","钥":"yào","钦":"qīn","钧":"jūn","钨":"wū","钩":"gōu","钮":"niǔ","钱":"qián","钳":"qián","钵":"bō","钻":"zuān","钾":"jiǎ","铀":"yóu","铁":"tiě","铂":"bó","铃":"líng","铅":"qiān","铆":"mǎo","铜":"tóng","铝":"lǚ","铡":"zhá","铣":"xǐ","铬":"gè","铭":"míng","铰":"jiǎo","铱":"yī","铲":"chǎn","银":"yín","铸":"zhù","铺":"pù","链":"liàn","销":"xiāo","锁":"suǒ","锄":"chú","锅":"guō","锈":"xiù","锋":"fēng","锌":"xīn","锐":"ruì","锑":"tī","锗":"zhě","错":"cuò","锚":"máo","锡":"xī","锣":"luó","锤":"chuí","锥":"zhuī","锦":"jǐn","锨":"xiān","锭":"dìng","键":"jiàn","锯":"jù","锰":"měng","锹":"qiāo","锻":"duàn","镀":"dù","镁":"měi","镇":"zhèn","镊":"niè","镍":"niè","镐":"gǎo","镑":"bàng","镜":"jìng","镣":"liào","镭":"léi","镰":"lián","镶":"xiāng","长":"cháng","门":"mén","闪":"shǎn","闭":"bì","问":"wèn","闯":"chuǎng","闰":"rùn","闲":"xián","间":"jiān","闷":"mèn","闸":"zhá","闹":"nào","闺":"guī","闻":"wén","闽":"mǐn","阀":"fá","阁":"gé","阂":"hé","阅":"yuè","阉":"yān","阎":"yán","阐":"chǎn","阑":"lán","阔":"kuò","阜":"fù","队":"duì","阮":"ruǎn","防":"fáng","阳":"yáng","阴":"yīn","阵":"zhèn","阶":"jiē","阻":"zǔ","阿":"ā","陀":"tuó","附":"fù","际":"jì","陆":"lù","陇":"lǒng","陈":"chén","陋":"lòu","陌":"mò","降":"jiàng","限":"xiàn","陕":"shǎn","陛":"bì","陡":"dǒu","院":"yuàn","除":"chú","陨":"yǔn","险":"xiǎn","陪":"péi","陵":"líng","陶":"táo","陷":"xiàn","隅":"yú","隆":"lóng","隋":"suí","随":"suí","隐":"yǐn","隔":"gé","隘":"ài","隙":"xì","障":"zhàng","隧":"suì","隶":"lì","难":"nán","雀":"què","雁":"yàn","雄":"xióng","雅":"yǎ","集":"jí","雇":"gù","雌":"cí","雍":"yōng","雏":"chú","雕":"diāo","雨":"yǔ","雪":"xuě","零":"líng","雷":"léi","雹":"báo","雾":"wù","需":"xū","霄":"xiāo","震":"zhèn","霉":"méi","霍":"huò","霓":"ní","霖":"lín","霜":"shuāng","霞":"xiá","露":"lù","霸":"bà","霹":"pī","青":"qīng","靖":"jìng","静":"jìng","靛":"diàn","非":"fēi","靠":"kào","靡":"mí","面":"miàn","靥":"yè","革":"gé","靳":"jìn","靴":"xuē","靶":"bǎ","鞋":"xié","鞍":"ān","鞘":"qiào","鞠":"jū","鞭":"biān","韦":"wéi","韧":"rèn","韩":"hán","韭":"jiǔ","音":"yīn","韵":"yùn","韶":"sháo","页":"yè","顶":"dǐng","顷":"qǐng","项":"xiàng","顺":"shùn","须":"xū","顽":"wán","顾":"gù","顿":"dùn","颁":"bān","颂":"sòng","预":"yù","颅":"lú","领":"lǐng","颇":"pǒ","颈":"jǐng","颊":"jiá","颐":"yí","频":"pín","颓":"tuí","颖":"yǐng","颗":"kē","题":"tí","颜":"yán","额":"é","颠":"diān","颤":"chàn","颧":"quán","风":"fēng","飘":"piāo","飞":"fēi","食":"shí","餐":"cān","饥":"jī","饭":"fàn","饮":"yǐn","饯":"jiàn","饰":"shì","饱":"bǎo","饲":"sì","饵":"ěr","饶":"ráo","饺":"jiǎo","饼":"bǐng","饿":"è","馁":"něi","馅":"xiàn","馆":"guǎn","馈":"kuì","馋":"chán","馏":"liú","馒":"mán","首":"shǒu","馗":"kuí","馘":"guó","香":"xiāng","马":"mǎ","驭":"yù","驮":"tuó","驯":"xùn","驰":"chí","驱":"qū","驳":"bó","驴":"lǘ","驶":"shǐ","驹":"jū","驻":"zhù","驼":"tuó","驾":"jià","骂":"mà","骄":"jiāo","骆":"luò","骇":"hài","骋":"chěng","验":"yàn","骏":"jùn","骑":"qí","骗":"piàn","骚":"sāo","骡":"luó","骤":"zhòu","骨":"gǔ","骸":"hái","髓":"suǐ","高":"gāo","鬃":"zōng","鬲":"gé","鬼":"guǐ","魁":"kuí","魂":"hún","魄":"pò","魏":"wèi","魔":"mó","鱼":"yú","鲁":"lǔ","鲍":"bào","鲜":"xiān","鲤":"lǐ","鲸":"jīng","鳃":"sāi","鳖":"biē","鳞":"lín","鸟":"niǎo","鸡":"jī","鸣":"míng","鸥":"ōu","鸦":"yā","鸭":"yā","鸯":"yāng","鸳":"yuān","鸵":"tuó","鸽":"gē","鸿":"hóng","鹃":"juān","鹅":"é","鹊":"què","鹏":"péng","鹤":"hè","鹰":"yīng","鹿":"lù","麓":"lù","麦":"mài","麻":"má","黄":"huáng","黉":"hóng","黍":"shǔ","黎":"lí","黑":"hēi","黔":"qián","默":"mò","鼎":"dǐng","鼐":"nài","鼓":"gǔ","鼗":"táo","鼠":"shǔ","鼻":"bí","齐":"qí","齿":"chǐ","龄":"líng","龋":"qǔ","龙":"lóng","龚":"gōng","龟":"guī","龠":"yuè"};
/* 内置笔顺数据：hanzi-writer-data v2.0（48 字，离线可用） */
window.HANZI_DATA = {"春":{"strokes":["M 508 681 Q 569 694 634 703 Q 686 713 694 721 Q 703 728 699 736 Q 692 748 664 756 Q 636 763 606 752 Q 563 739 518 727 L 454 714 Q 394 704 326 699 Q 290 695 315 678 Q 351 654 422 667 Q 434 670 449 670 L 508 681 Z","M 480 562 Q 666 596 674 602 Q 681 609 678 617 Q 672 627 646 636 Q 618 643 591 633 Q 540 618 489 605 L 434 594 Q 373 585 310 581 Q 276 577 299 561 Q 329 542 410 551 Q 414 552 422 552 L 480 562 Z","M 435 442 Q 457 446 484 449 Q 521 453 560 457 L 595 461 Q 715 479 851 471 Q 873 470 878 477 Q 885 490 873 500 Q 810 552 759 536 Q 690 518 463 483 Q 457 483 453 481 L 393 473 Q 326 466 286 457 Q 220 444 121 440 Q 109 440 108 429 Q 108 419 125 405 Q 167 378 198 390 Q 253 408 371 430 L 435 442 Z","M 344 303 Q 371 333 430 432 Q 431 436 435 442 L 453 481 Q 469 521 480 562 L 489 605 Q 496 644 508 681 L 518 727 Q 525 755 540 781 Q 550 800 533 811 Q 484 853 453 844 Q 437 840 444 822 Q 459 786 454 714 L 449 670 Q 445 634 434 594 L 422 552 Q 404 495 393 473 L 371 430 Q 284 277 143 202 Q 127 190 108 178 Q 93 168 107 165 Q 156 162 266 235 Q 309 271 330 289 L 344 303 Z","M 560 457 Q 651 351 750 254 Q 775 229 816 228 Q 891 225 969 241 Q 988 244 990 249 Q 993 256 976 262 Q 786 331 772 338 Q 762 345 752 350 Q 691 384 595 461 C 572 480 540 480 560 457 Z","M 372 291 Q 359 298 344 303 C 319 312 319 312 330 289 Q 330 288 333 284 Q 364 205 340 65 Q 316 44 349 -18 Q 350 -21 354 -25 Q 364 -37 373 -24 Q 380 -14 386 5 L 392 42 Q 393 61 394 130 L 395 161 Q 395 236 399 260 C 401 277 399 278 372 291 Z","M 555 18 Q 583 -18 604 -52 Q 614 -70 624 -69 Q 640 -68 656 -34 Q 674 3 671 51 Q 664 112 656 225 Q 655 256 671 278 Q 680 291 671 301 Q 652 320 600 344 Q 582 353 567 343 Q 501 313 372 291 C 342 286 369 256 399 260 Q 415 261 439 268 Q 574 298 587 289 Q 599 271 600 64 Q 599 58 599 53 Q 595 38 581 40 C 554 26 550 24 555 18 Z","M 394 130 Q 395 130 399 130 Q 477 140 533 146 Q 558 150 549 164 Q 539 180 511 184 Q 481 190 395 161 C 367 151 364 130 394 130 Z","M 386 5 Q 393 5 402 6 Q 451 15 555 18 C 585 19 600 19 581 40 Q 574 49 556 61 Q 538 71 506 64 Q 443 51 392 42 C 362 37 356 4 386 5 Z"],"medians":[[[317,690],[326,685],[392,683],[632,731],[687,732]],[[302,572],[343,565],[397,568],[491,582],[625,615],[668,612]],[[119,429],[143,418],[195,417],[368,451],[773,506],[809,504],[868,485]],[[455,830],[481,809],[495,787],[494,777],[460,589],[432,497],[410,448],[340,337],[284,278],[246,244],[195,211],[112,171]],[[566,452],[593,444],[725,326],[796,278],[867,263],[984,251]],[[337,290],[357,277],[371,250],[374,171],[360,32],[363,-20]],[[382,291],[393,282],[414,280],[585,319],[611,307],[623,293],[629,284],[626,225],[635,65],[635,42],[621,6],[624,-54]],[[397,138],[412,150],[477,162],[515,164],[538,158]],[[390,11],[408,26],[517,42],[574,39]]],"radStrokes":[5,6,7,8]},"花":{"strokes":["M 628 661 Q 842 661 852 668 Q 853 669 855 671 Q 861 683 844 697 Q 786 742 719 724 Q 686 718 647 711 L 588 701 Q 509 695 413 678 L 364 672 Q 270 663 169 651 Q 147 650 163 631 Q 178 616 196 611 Q 218 605 235 609 Q 299 627 372 637 L 416 643 Q 455 653 577 659 L 628 661 Z","M 413 678 Q 409 718 408 750 Q 409 771 389 777 Q 344 795 325 789 Q 306 780 322 760 Q 353 720 364 672 L 372 637 Q 384 568 399 552 Q 412 542 417 553 Q 420 565 416 643 L 413 678 Z","M 647 711 Q 657 741 679 781 Q 695 797 683 808 Q 670 826 633 844 Q 615 854 596 844 Q 586 837 594 825 Q 606 792 588 701 L 577 659 Q 550 554 550 544 Q 551 528 568 541 Q 587 557 628 661 L 647 711 Z","M 323 338 Q 398 425 417 438 Q 427 448 425 461 Q 422 474 398 501 Q 374 523 356 525 Q 337 526 342 504 Q 351 474 337 453 Q 294 378 235 313 Q 178 249 103 181 Q 91 172 89 167 Q 83 157 98 157 Q 143 157 296 309 L 323 338 Z","M 296 309 Q 326 243 290 83 Q 278 34 313 -7 L 314 -9 Q 330 -24 342 1 Q 355 40 355 83 Q 358 230 363 263 Q 370 288 361 298 Q 333 331 323 338 C 300 358 285 337 296 309 Z","M 572 247 Q 728 350 819 396 Q 841 399 838 413 Q 834 432 814 458 Q 795 483 767 489 Q 749 490 747 468 Q 748 452 734 433 Q 670 372 575 293 L 527 255 Q 472 213 409 164 Q 402 157 406 147 Q 416 143 425 148 Q 477 185 527 217 L 572 247 Z","M 939 93 Q 924 121 905 211 Q 905 229 897 234 Q 890 238 886 218 Q 856 122 836 93 Q 824 77 788 67 Q 704 46 630 76 Q 602 89 593 108 Q 572 151 572 247 L 575 293 Q 579 369 593 456 Q 599 477 585 487 Q 570 502 544 511 Q 531 515 521 510 Q 514 506 519 486 Q 535 443 532 401 Q 528 319 527 255 L 527 217 Q 528 126 540 86 Q 546 61 569 38 Q 654 -29 817 -2 Q 833 2 850 6 Q 892 19 932 48 Q 953 64 939 93 Z"],"medians":[[[166,641],[218,632],[485,672],[747,696],[810,690],[848,675]],[[331,774],[373,746],[408,557]],[[602,834],[619,824],[640,792],[603,658],[559,543]],[[354,511],[368,495],[382,460],[339,399],[221,264],[154,204],[97,165]],[[322,330],[325,302],[336,281],[332,160],[320,59],[325,-2]],[[766,470],[782,427],[765,410],[412,153]],[[529,501],[553,476],[561,453],[549,249],[555,141],[574,81],[603,53],[647,35],[716,24],[802,32],[855,52],[888,80],[896,227]]],"radStrokes":[0,1,2]},"树":{"strokes":["M 315 510 Q 331 516 353 521 Q 387 531 393 537 Q 400 544 396 553 Q 389 563 359 569 Q 337 572 316 565 L 275 548 Q 191 518 114 505 Q 80 496 106 482 Q 151 461 204 479 Q 228 486 257 493 L 315 510 Z","M 313 397 Q 313 449 315 510 L 316 565 Q 316 662 336 733 Q 345 746 342 760 Q 335 769 283 801 Q 261 817 242 803 Q 238 799 243 783 Q 274 737 275 690 Q 275 623 275 548 L 271 414 Q 268 222 258 168 Q 237 77 241 64 Q 247 40 257 17 Q 264 1 271 -3 Q 277 -9 284 -2 Q 291 2 301 22 Q 311 46 310 75 Q 309 112 312 369 L 313 397 Z","M 257 493 Q 208 358 50 144 Q 46 134 56 134 Q 62 133 70 141 Q 196 258 271 414 C 323 519 268 521 257 493 Z","M 312 369 Q 351 315 373 311 Q 383 310 389 323 Q 390 333 385 349 Q 372 379 313 397 C 285 406 294 393 312 369 Z","M 548 382 Q 572 452 594 550 Q 601 575 615 595 Q 630 611 617 621 Q 604 630 575 636 Q 553 639 532 624 Q 490 603 426 591 Q 414 590 410 584 Q 407 577 423 571 Q 456 559 498 573 Q 513 585 516 586 Q 544 587 542 557 Q 532 479 514 419 L 498 370 Q 449 243 329 183 Q 319 176 330 172 Q 334 165 368 169 Q 461 185 527 326 L 548 382 Z","M 527 326 Q 549 295 572 257 Q 581 239 591 234 Q 598 231 605 238 Q 615 245 613 281 Q 613 311 548 382 L 514 419 Q 456 477 423 505 Q 417 511 414 501 Q 411 491 418 482 Q 455 433 498 370 L 527 326 Z","M 806 505 Q 818 509 835 512 Q 878 519 913 527 Q 923 526 931 539 Q 931 549 909 558 Q 882 576 806 550 L 760 536 Q 720 526 685 519 Q 655 515 622 507 Q 595 503 617 487 Q 650 469 687 476 Q 718 485 760 494 L 806 505 Z","M 760 494 Q 761 349 764 107 Q 763 82 750 73 Q 744 70 691 82 Q 661 95 663 85 Q 664 78 682 63 Q 736 14 749 -14 Q 762 -45 777 -48 Q 792 -49 806 -15 Q 824 28 823 100 Q 807 302 806 505 L 806 550 Q 806 698 822 756 Q 838 784 784 805 Q 751 823 733 815 Q 717 808 732 787 Q 753 762 755 729 Q 758 710 760 536 L 760 494 Z","M 633 365 Q 691 290 699 289 Q 708 288 713 297 Q 720 307 717 331 Q 714 361 637 402 Q 625 408 620 406 Q 616 405 615 394 Q 616 385 633 365 Z"],"medians":[[[107,494],[130,490],[178,495],[319,539],[385,547]],[[253,797],[302,746],[292,306],[275,77],[277,10]],[[271,491],[263,485],[249,416],[189,310],[119,212],[60,143]],[[321,390],[327,375],[352,355],[374,326]],[[416,582],[458,581],[534,604],[571,597],[553,479],[504,325],[464,262],[413,210],[382,191],[338,178]],[[422,496],[570,313],[592,271],[595,248]],[[617,498],[665,494],[871,542],[921,540]],[[740,801],[765,786],[786,760],[781,549],[793,91],[787,61],[773,33],[669,83]],[[623,398],[693,329],[702,298]]],"radStrokes":[0,1,2,3]},"叶":{"strokes":["M 160 553 Q 147 560 115 566 Q 102 570 97 564 Q 90 557 99 539 Q 132 464 148 343 Q 151 306 171 281 Q 190 256 196 274 Q 205 296 200 338 L 194 374 Q 176 495 174 525 C 172 548 172 548 160 553 Z","M 338 411 Q 351 508 377 540 Q 399 568 374 581 Q 353 591 324 608 Q 303 620 264 591 Q 224 572 160 553 C 131 544 146 514 174 525 Q 175 528 264 552 Q 289 559 296 549 Q 306 542 299 500 Q 293 457 284 406 C 279 376 334 381 338 411 Z","M 200 338 Q 224 350 359 376 Q 369 379 370 388 Q 370 395 338 411 C 321 420 312 416 284 406 Q 235 388 194 374 C 166 364 172 326 200 338 Z","M 666 443 Q 751 455 877 457 Q 940 457 945 468 Q 951 481 932 496 Q 866 541 804 520 Q 746 508 667 491 L 608 480 Q 506 464 389 445 Q 367 442 384 423 Q 400 408 420 403 Q 444 399 461 404 Q 528 423 608 435 L 666 443 Z","M 608 435 Q 614 330 605 150 Q 602 -30 623 -68 Q 639 -84 649 -61 Q 665 -12 666 443 L 667 491 Q 668 722 689 756 Q 698 783 679 798 Q 652 819 606 830 Q 585 836 571 821 Q 561 812 574 799 Q 605 774 607 737 Q 608 646 608 480 L 608 435 Z"],"medians":[[[105,556],[134,532],[142,518],[184,280]],[[172,533],[190,548],[286,578],[309,579],[328,566],[338,555],[315,434],[290,414]],[[200,344],[214,362],[267,379],[333,391],[362,387]],[[387,434],[441,427],[604,458],[840,492],[935,475]],[[580,811],[608,803],[646,768],[637,563],[635,-60]]],"radStrokes":[0,1,2]},"河":{"strokes":["M 253 745 Q 275 726 301 701 Q 317 686 335 688 Q 347 689 352 704 Q 356 722 345 755 Q 338 774 308 785 Q 233 807 220 799 Q 214 795 217 780 Q 221 767 253 745 Z","M 149 549 Q 195 503 231 490 Q 249 489 258 504 Q 264 520 259 539 Q 249 566 227 579 Q 191 597 143 597 Q 134 597 129 593 Q 122 592 126 577 Q 129 564 149 549 Z","M 145 194 Q 132 190 135 172 Q 147 97 184 75 Q 191 68 202 71 Q 211 72 211 99 Q 217 142 309 383 Q 316 399 315 406 Q 314 416 305 409 Q 295 402 282 385 Q 230 303 183 232 Q 171 213 145 194 Z","M 743 662 Q 813 668 927 669 Q 948 670 952 679 Q 958 691 940 705 Q 883 744 846 734 Q 711 703 344 647 Q 322 644 339 627 Q 370 599 411 608 Q 537 644 690 658 L 743 662 Z","M 419 504 Q 406 508 380 512 Q 368 516 365 510 Q 358 504 367 488 Q 392 437 409 353 Q 413 328 428 311 Q 446 289 451 305 Q 455 315 454 332 L 451 365 Q 436 450 435 475 C 433 500 433 500 419 504 Z","M 583 385 Q 601 455 622 477 Q 646 504 621 518 Q 602 530 573 548 Q 552 558 511 533 Q 472 517 419 504 C 390 497 406 467 435 475 Q 457 482 517 494 Q 538 498 543 490 Q 550 486 543 454 Q 536 423 528 384 C 522 355 575 356 583 385 Z","M 454 332 Q 461 331 471 333 Q 511 342 601 349 Q 611 350 612 360 Q 612 367 583 385 C 568 395 557 392 528 384 Q 483 372 451 365 C 422 359 424 334 454 332 Z","M 661 92 Q 639 102 609 111 Q 597 115 597 108 Q 596 101 606 89 Q 667 29 705 -19 Q 717 -29 732 -12 Q 775 42 774 125 Q 762 422 769 544 Q 770 572 773 600 Q 780 628 773 639 Q 766 649 743 662 C 718 678 677 685 690 658 Q 691 654 697 645 Q 709 620 708 577 Q 711 441 709 132 Q 708 101 698 90 Q 688 84 661 92 Z"],"medians":[[[226,791],[311,742],[332,708]],[[134,584],[206,548],[235,514]],[[196,83],[184,113],[182,165],[308,402]],[[341,637],[389,629],[544,660],[857,702],[940,685]],[[374,502],[407,467],[440,310]],[[427,502],[445,495],[548,520],[558,519],[576,504],[585,494],[562,411],[535,391]],[[458,338],[475,353],[535,364],[582,366],[602,359]],[[697,653],[736,630],[741,615],[742,135],[737,86],[712,45],[663,66],[604,105]]],"radStrokes":[0,1,2]},"海":{"strokes":["M 246 711 Q 267 686 289 655 Q 302 639 320 636 Q 333 635 340 649 Q 349 665 343 700 Q 339 730 249 767 Q 233 773 224 771 Q 218 768 218 753 Q 219 740 246 711 Z","M 154 542 Q 191 493 228 471 Q 244 467 255 481 Q 262 494 260 512 Q 254 537 236 553 Q 188 586 150 586 Q 146 587 142 585 Q 135 584 137 570 Q 138 557 154 542 Z","M 123 190 Q 111 186 113 168 Q 131 89 165 72 Q 172 65 183 68 Q 190 69 191 95 Q 197 141 293 399 Q 300 415 299 422 Q 298 432 289 425 Q 273 415 163 232 Q 151 211 123 190 Z","M 520 686 Q 593 788 594 793 Q 593 796 593 798 Q 589 810 563 832 Q 538 848 520 849 Q 502 848 510 827 Q 525 793 458 683 Q 427 632 383 577 Q 373 567 371 561 Q 367 551 381 553 Q 420 559 500 661 L 520 686 Z","M 500 661 Q 548 640 599 650 Q 687 666 778 684 Q 820 694 826 699 Q 836 706 831 716 Q 824 728 794 736 Q 770 742 661 710 Q 579 692 520 686 C 490 683 472 672 500 661 Z","M 754 149 Q 809 139 863 120 Q 884 113 894 115 Q 904 119 898 137 Q 889 156 843 189 Q 825 205 762 196 L 694 195 Q 550 196 422 187 Q 409 186 413 196 Q 449 281 474 343 L 488 379 Q 506 428 517 460 Q 527 497 535 517 Q 538 524 538 529 C 541 538 541 538 521 557 Q 487 594 475 586 Q 468 577 467 568 Q 488 514 443 375 L 430 336 Q 388 227 345 190 Q 338 183 339 169 Q 343 151 360 132 Q 367 122 382 129 Q 419 147 493 154 Q 578 166 685 158 L 754 149 Z","M 685 158 Q 667 80 651 53 Q 641 37 619 45 Q 553 64 557 68 Q 526 80 548 50 Q 582 7 607 -37 Q 629 -68 649 -56 Q 728 -11 754 149 L 762 196 Q 775 311 780 365 L 785 413 Q 794 503 812 525 Q 831 549 819 561 Q 795 583 758 598 Q 740 607 718 599 Q 669 583 631 574 Q 589 564 521 557 C 491 554 508 528 538 529 Q 545 528 551 528 Q 572 528 688 560 Q 709 564 723 556 Q 739 544 726 405 L 722 365 Q 710 262 694 195 L 685 158 Z","M 579 484 Q 595 426 617 415 Q 630 411 641 424 Q 647 436 645 457 Q 635 488 592 507 Q 585 511 580 502 Q 576 495 579 484 Z","M 780 365 Q 859 368 941 362 Q 960 362 966 370 Q 972 380 956 395 Q 896 440 855 424 Q 822 420 785 413 L 726 405 Q 677 401 621 393 Q 557 387 488 379 L 443 375 Q 382 371 317 365 Q 296 364 311 347 Q 324 334 341 327 Q 360 321 377 325 Q 402 331 430 336 L 474 343 Q 568 362 722 365 L 780 365 Z","M 552 292 Q 567 253 590 231 Q 602 225 612 234 Q 619 243 622 256 Q 622 277 611 291 Q 599 306 571 319 Q 559 326 551 326 Q 545 326 545 316 Q 544 306 552 292 Z"],"medians":[[[229,762],[301,700],[321,656]],[[147,575],[210,530],[235,493]],[[177,78],[165,108],[161,162],[292,418]],[[519,836],[542,813],[549,793],[530,752],[463,648],[402,578],[379,561]],[[508,661],[530,670],[632,679],[754,707],[820,710]],[[480,577],[505,524],[492,462],[449,331],[385,194],[384,171],[416,164],[592,179],[775,172],[824,164],[888,126]],[[531,556],[548,544],[559,545],[715,580],[743,575],[772,543],[735,230],[710,107],[683,34],[668,14],[642,-4],[548,61]],[[590,495],[620,450],[623,432]],[[314,356],[368,346],[631,379],[883,397],[955,376]],[[554,317],[589,277],[599,247]]],"radStrokes":[0,1,2]},"跑":{"strokes":["M 210 677 Q 200 683 165 688 Q 155 691 151 686 Q 145 680 153 665 Q 180 613 198 529 Q 201 504 216 487 Q 234 466 238 481 Q 239 488 241 498 L 239 526 Q 239 532 238 537 Q 222 622 218 650 C 214 675 214 675 210 677 Z","M 377 551 Q 399 632 424 656 Q 446 678 425 693 Q 407 703 382 721 Q 364 731 320 707 Q 277 689 210 677 C 181 672 189 642 218 650 Q 240 657 319 675 Q 347 682 354 671 Q 361 664 351 629 Q 341 595 329 554 C 321 525 369 522 377 551 Z","M 303 509 Q 337 518 388 525 Q 397 526 397 534 Q 397 541 377 551 C 355 562 355 562 329 554 Q 280 538 239 526 C 210 518 211 499 241 498 Q 250 497 261 500 Q 262 501 266 501 L 303 509 Z","M 320 227 Q 321 297 325 358 L 326 390 Q 326 436 330 464 Q 337 486 303 509 C 279 527 254 529 266 501 Q 278 482 281 378 Q 281 320 282 214 C 282 184 320 197 320 227 Z","M 325 358 Q 324 359 327 359 Q 379 372 418 380 Q 440 386 430 397 Q 418 410 394 411 Q 348 411 326 390 C 304 370 297 346 325 358 Z","M 220 193 Q 204 328 207 361 Q 208 382 195 392 Q 173 407 147 413 Q 134 417 127 411 Q 120 404 127 391 Q 146 363 156 330 Q 163 300 183 180 C 188 150 224 163 220 193 Z","M 183 180 Q 155 173 128 162 Q 109 155 76 155 Q 63 154 62 143 Q 61 130 70 122 Q 92 106 126 89 Q 136 86 148 95 Q 188 126 231 148 Q 298 179 365 212 Q 390 224 409 239 Q 422 246 422 256 Q 416 262 404 258 Q 364 243 320 227 L 282 214 Q 251 204 220 193 L 183 180 Z","M 552 592 Q 589 644 629 718 Q 647 755 663 774 Q 670 786 665 798 Q 661 811 630 831 Q 602 847 584 845 Q 565 841 575 820 Q 587 799 573 748 Q 534 637 444 499 Q 435 489 433 482 Q 432 470 445 474 Q 472 483 539 574 L 552 592 Z","M 539 574 Q 543 570 552 564 Q 574 549 597 557 Q 783 608 789 586 Q 792 576 792 552 Q 785 390 750 354 Q 740 344 716 350 Q 697 353 678 356 Q 657 363 672 343 Q 703 303 721 272 Q 727 256 744 259 Q 757 260 774 279 Q 825 327 847 516 Q 851 558 869 582 Q 884 601 876 611 Q 861 627 829 642 Q 807 654 781 643 Q 681 598 552 592 C 522 590 517 590 539 574 Z","M 639 325 Q 657 398 680 419 Q 699 441 678 454 Q 621 482 613 480 Q 607 480 604 476 Q 576 452 510 430 C 482 420 494 396 522 406 Q 582 427 592 429 Q 610 435 615 428 Q 622 422 613 392 Q 606 364 596 332 C 587 303 632 296 639 325 Z","M 503 270 Q 510 270 521 273 Q 560 285 647 299 Q 657 300 658 309 Q 657 316 639 325 C 618 336 618 336 596 332 Q 589 331 584 329 Q 539 313 506 303 C 477 294 473 268 503 270 Z","M 949 100 Q 934 134 917 236 Q 916 252 909 258 Q 903 262 898 243 Q 871 134 851 99 Q 806 51 659 50 Q 604 51 560 66 Q 523 82 513 105 Q 489 153 503 270 L 506 303 Q 512 349 522 401 Q 522 404 522 406 C 524 421 524 421 510 430 Q 500 440 484 446 Q 472 450 464 446 Q 458 443 463 427 Q 473 391 470 357 Q 454 146 470 88 Q 474 61 501 39 Q 588 -25 798 2 Q 817 6 839 11 Q 891 26 942 58 Q 961 73 949 100 Z"],"medians":[[[159,679],[191,649],[228,486]],[[220,658],[228,666],[337,697],[372,694],[391,672],[389,663],[359,575],[335,561]],[[246,505],[255,515],[326,534],[388,534]],[[273,500],[298,482],[303,461],[302,250],[297,233],[286,223]],[[334,365],[344,381],[372,391],[422,390]],[[135,403],[176,365],[199,207],[186,192]],[[75,142],[131,126],[416,253]],[[586,830],[602,818],[621,787],[604,739],[517,576],[442,482]],[[545,576],[607,575],[796,618],[811,613],[829,596],[807,426],[794,377],[772,331],[744,309],[683,346]],[[521,428],[531,421],[616,455],[638,444],[648,433],[643,409],[623,350],[604,338]],[[507,275],[528,293],[595,311],[649,308]],[[470,439],[490,417],[496,398],[480,236],[483,131],[499,80],[512,63],[548,42],[622,24],[705,22],[798,34],[858,56],[901,91],[908,251]]],"radStrokes":[0,1,2,3,4,5,6]},"跳":{"strokes":["M 214 664 Q 202 670 164 676 Q 152 679 149 673 Q 143 666 152 651 Q 180 602 200 519 Q 204 494 219 479 Q 238 457 243 474 Q 244 478 245 483 L 244 513 Q 231 582 221 637 C 216 663 216 663 214 664 Z","M 371 534 Q 390 619 416 643 Q 438 668 415 682 Q 352 715 350 715 Q 340 715 332 709 Q 298 688 214 664 C 185 656 192 628 221 637 Q 227 640 309 660 Q 334 666 341 656 Q 348 650 340 617 Q 333 580 322 538 C 315 509 364 505 371 534 Z","M 297 494 Q 328 501 380 509 Q 389 510 389 518 Q 389 525 371 534 L 322 538 L 321 538 Q 278 523 244 513 C 215 504 215 482 245 483 Q 249 483 257 484 L 297 494 Z","M 317 203 Q 318 293 321 366 L 322 400 Q 322 424 324 447 Q 333 471 297 494 C 272 511 246 512 257 484 Q 269 460 272 361 Q 272 300 275 188 C 276 158 317 173 317 203 Z","M 321 366 Q 369 376 405 380 Q 427 386 418 397 Q 406 410 382 412 Q 360 413 322 400 C 294 390 292 360 321 366 Z","M 213 169 Q 197 295 201 330 Q 202 352 188 362 Q 166 378 138 385 Q 125 389 117 382 Q 110 375 117 362 Q 136 334 146 302 Q 153 274 174 156 C 179 126 217 139 213 169 Z","M 174 156 Q 152 152 132 143 Q 114 137 84 137 Q 71 136 69 124 Q 68 111 78 102 Q 102 86 137 68 Q 147 65 160 75 Q 194 103 232 123 Q 292 151 350 182 Q 372 192 389 207 Q 402 214 402 224 Q 396 230 383 227 Q 350 217 317 203 L 275 188 Q 244 179 213 169 L 174 156 Z","M 534 360 Q 518 251 470 178 Q 430 127 344 74 Q 332 67 332 62 Q 333 58 344 59 Q 360 55 397 72 Q 524 117 562 268 Q 577 334 583 596 Q 583 624 597 666 Q 603 679 592 690 Q 570 706 534 714 Q 510 718 503 712 Q 496 705 502 694 Q 544 631 536 404 Q 536 401 536 395 L 534 360 Z","M 438 494 Q 454 475 470 452 Q 480 440 494 439 Q 504 438 509 449 Q 515 461 510 488 Q 507 503 486 516 Q 431 541 420 539 Q 416 536 415 525 Q 416 515 438 494 Z","M 536 395 Q 407 320 378 312 Q 368 308 368 299 Q 369 287 379 283 Q 401 274 433 266 Q 443 266 451 276 Q 461 292 534 360 C 556 380 562 410 536 395 Z","M 977 83 Q 990 96 974 122 Q 955 167 947 226 Q 946 236 938 244 Q 928 248 926 226 Q 919 205 909 170 Q 897 118 867 110 Q 795 94 747 111 Q 723 120 710 151 Q 692 212 704 459 Q 716 688 744 731 Q 757 771 676 799 Q 673 800 671 800 Q 652 804 645 795 Q 636 786 643 777 Q 656 764 664 743 Q 668 716 661 555 Q 637 141 691 92 Q 742 41 903 55 Q 913 58 924 59 Q 961 69 977 83 Z","M 789 569 Q 777 545 726 474 Q 717 458 733 461 Q 775 485 797 502 Q 857 548 873 555 Q 892 565 882 583 Q 869 599 842 612 Q 818 624 806 621 Q 793 618 798 606 Q 802 587 789 569 Z","M 737 383 Q 780 349 832 300 Q 847 284 860 282 Q 867 281 873 290 Q 882 302 868 338 Q 858 372 796 391 Q 757 404 736 409 Q 727 413 727 402 Q 727 390 737 383 Z"],"medians":[[[158,666],[192,637],[231,479]],[[221,644],[231,655],[326,683],[347,686],[369,671],[380,659],[379,651],[352,559],[329,544]],[[250,491],[266,504],[320,518],[380,518]],[[264,483],[291,464],[296,441],[296,227],[291,209],[279,198]],[[328,371],[334,383],[352,391],[408,391]],[[127,373],[165,340],[170,329],[191,184],[177,168]],[[84,122],[142,107],[396,221]],[[512,703],[548,676],[556,666],[557,651],[556,384],[540,276],[508,193],[475,148],[423,104],[338,62]],[[423,530],[476,490],[495,453]],[[382,299],[428,300],[519,367],[525,378]],[[652,785],[678,773],[704,741],[687,592],[676,387],[681,191],[697,125],[724,96],[781,79],[869,80],[913,95],[933,113],[936,236]],[[806,611],[825,592],[831,572],[737,472]],[[737,399],[823,348],[840,332],[860,297]]],"radStrokes":[0,1,2,3,4,5,6]},"唱":{"strokes":["M 155 565 Q 143 571 113 577 Q 100 581 97 575 Q 90 569 99 553 Q 130 480 146 363 Q 149 329 168 304 Q 186 282 191 297 Q 198 318 194 354 L 190 385 Q 171 500 167 535 C 164 561 164 561 155 565 Z","M 333 412 Q 351 517 378 549 Q 402 577 376 592 Q 354 602 324 621 Q 302 633 262 604 Q 217 583 155 565 C 126 556 139 526 167 535 Q 186 542 263 562 Q 288 569 294 559 Q 303 552 296 512 Q 289 467 278 413 C 272 384 328 382 333 412 Z","M 194 354 Q 203 353 216 356 Q 256 368 346 381 Q 356 382 357 392 Q 357 399 333 412 C 312 424 307 422 278 413 Q 229 397 190 385 C 161 376 164 355 194 354 Z","M 478 730 Q 457 742 436 746 Q 429 747 425 743 Q 419 739 428 728 Q 465 671 479 536 Q 479 485 517 459 L 519 458 Q 529 457 533 469 L 533 497 Q 532 519 523 543 Q 519 567 513 596 L 510 612 Q 503 661 500 699 C 498 719 498 719 478 730 Z","M 702 487 Q 718 465 733 457 Q 743 450 759 471 Q 775 499 809 650 Q 818 681 842 706 Q 855 719 844 733 Q 828 751 785 778 Q 766 788 749 781 Q 719 774 683 768 Q 634 759 570 748 Q 518 738 478 730 C 449 724 472 690 500 699 Q 527 712 707 736 Q 735 740 745 731 Q 758 713 756 696 Q 728 540 711 522 C 697 495 696 494 702 487 Z","M 513 596 Q 519 592 587 599 Q 632 606 671 611 Q 693 615 685 628 Q 675 643 649 647 Q 625 650 584 638 Q 545 625 511 613 Q 510 613 510 612 C 488 601 488 601 513 596 Z","M 533 469 Q 534 469 538 469 Q 629 481 702 487 C 732 489 738 510 711 522 Q 710 523 704 525 Q 683 529 533 497 C 504 491 503 468 533 469 Z","M 441 365 Q 419 381 393 388 Q 386 391 380 385 Q 371 379 381 367 Q 418 301 423 133 Q 423 67 461 37 L 464 35 Q 482 28 484 61 Q 484 62 484 63 L 482 101 Q 476 149 471 196 L 469 226 Q 465 280 465 323 C 465 349 465 349 441 365 Z","M 740 81 Q 752 54 775 6 Q 784 -13 795 -12 Q 811 -9 822 19 Q 852 80 868 262 Q 874 314 898 347 Q 917 369 903 383 Q 879 407 828 429 Q 809 439 772 427 Q 634 379 441 365 C 411 363 435 319 465 323 Q 472 323 481 324 Q 587 346 754 371 Q 784 377 796 363 Q 820 318 786 126 Q 785 108 777 106 Q 773 103 755 113 C 726 121 728 108 740 81 Z","M 471 196 Q 478 195 491 197 Q 618 218 713 231 Q 738 234 729 248 Q 719 264 691 269 Q 666 273 623 262 Q 539 243 469 226 C 440 219 441 197 471 196 Z","M 484 63 Q 494 62 505 63 Q 581 76 740 81 C 770 82 779 95 755 113 Q 745 120 738 126 Q 720 138 685 131 Q 573 109 482 101 C 452 98 454 65 484 63 Z"],"medians":[[[106,567],[131,545],[139,528],[180,303]],[[169,541],[176,555],[282,590],[309,590],[327,577],[338,565],[311,439],[285,420]],[[199,363],[215,375],[285,393],[326,396],[347,391]],[[433,737],[463,712],[475,687],[503,528],[522,466]],[[486,728],[506,719],[735,757],[764,754],[775,746],[797,718],[754,545],[736,494],[718,489]],[[514,609],[535,607],[643,628],[675,622]],[[536,476],[550,488],[687,505],[705,517]],[[387,376],[420,346],[434,312],[452,110],[469,45]],[[450,363],[477,346],[495,348],[788,401],[812,396],[833,382],[849,363],[819,124],[812,96],[794,64],[794,2]],[[475,204],[494,215],[650,245],[684,249],[718,242]],[[489,70],[502,83],[746,111]]],"radStrokes":[0,1,2]},"歌":{"strokes":["M 452 723 Q 461 727 471 728 Q 513 738 519 743 Q 528 750 523 760 Q 516 772 486 779 Q 455 786 424 773 Q 378 757 326 745 Q 268 732 202 726 Q 165 720 191 702 Q 234 678 291 691 Q 352 704 419 717 L 452 723 Z","M 204 610 Q 194 614 180 615 Q 170 616 168 613 Q 164 609 171 596 Q 190 562 205 505 Q 208 487 219 477 Q 234 461 237 473 Q 238 479 239 487 L 236 512 Q 226 573 224 589 C 222 604 222 604 204 610 Z","M 351 533 Q 364 576 379 590 Q 398 612 378 623 Q 362 633 339 647 Q 323 656 308 647 Q 287 634 261 625 Q 239 618 204 610 C 175 603 195 581 224 589 Q 224 590 290 604 Q 309 608 314 601 Q 317 598 305 532 C 300 502 342 504 351 533 Z","M 239 487 Q 248 486 258 488 Q 291 498 364 507 Q 371 508 373 516 Q 373 522 351 533 C 335 541 334 541 305 532 Q 265 520 236 512 C 207 504 209 489 239 487 Z","M 419 717 Q 434 669 416 576 Q 401 513 431 483 L 432 482 Q 447 473 455 501 Q 464 529 464 568 Q 473 640 484 670 Q 488 682 479 697 Q 466 712 452 723 C 429 742 411 746 419 717 Z","M 427 404 Q 458 408 494 411 Q 512 412 512 420 Q 515 433 496 443 Q 469 458 445 453 Q 175 408 68 403 Q 55 403 51 395 Q 47 385 62 371 Q 101 340 144 352 Q 285 389 386 400 L 427 404 Z","M 193 306 Q 183 312 155 316 Q 145 319 142 314 Q 138 310 144 295 Q 166 255 179 187 Q 182 168 194 154 Q 210 135 214 149 Q 217 159 216 174 L 212 204 Q 202 264 202 283 C 201 302 201 302 193 306 Z","M 329 219 Q 345 271 362 286 Q 381 307 362 319 Q 310 347 308 347 Q 299 348 292 343 Q 264 325 193 306 C 164 298 173 274 202 283 Q 208 286 274 300 Q 293 304 298 297 Q 302 293 287 225 C 281 196 320 190 329 219 Z","M 216 174 Q 220 174 225 175 Q 261 185 339 193 Q 348 194 349 202 Q 349 208 329 219 L 287 225 Q 281 225 281 224 Q 242 212 212 204 C 183 196 186 172 216 174 Z","M 454 89 Q 454 260 459 321 Q 468 376 427 404 C 404 423 378 429 386 400 Q 386 397 388 393 Q 401 356 401 239 Q 402 101 389 69 Q 385 56 360 59 Q 338 63 313 67 Q 300 67 299 61 Q 298 54 308 44 Q 369 -8 389 -40 Q 404 -53 414 -52 Q 427 -48 439 -12 Q 455 21 454 79 L 454 89 Z","M 622 555 Q 625 561 629 567 Q 662 621 696 702 Q 709 739 723 758 Q 730 770 724 782 Q 717 794 687 810 Q 659 823 640 819 Q 624 815 634 795 Q 649 774 645 753 Q 632 683 604 615 Q 577 549 537 474 Q 530 464 528 457 Q 527 445 540 450 Q 561 459 605 527 L 622 555 Z","M 605 527 Q 620 517 648 525 Q 759 570 791 562 Q 801 550 796 543 Q 797 537 755 464 Q 748 454 753 449 Q 757 443 768 455 Q 862 524 904 541 Q 914 544 914 552 Q 915 565 887 578 Q 820 617 806 609 Q 736 579 622 555 C 593 549 577 538 605 527 Z","M 659 302 Q 659 303 660 304 Q 672 370 685 395 Q 694 411 678 420 Q 636 454 610 445 Q 597 441 603 427 Q 631 382 597 263 Q 566 163 484 111 Q 471 101 455 90 Q 454 90 454 89 C 439 78 439 78 454 79 Q 508 79 568 135 Q 625 184 651 270 L 659 302 Z","M 651 270 Q 717 173 798 68 Q 817 49 847 51 Q 949 55 981 62 Q 991 63 992 69 Q 993 73 980 82 Q 838 142 759 211 Q 711 253 659 302 C 637 323 634 295 651 270 Z"],"medians":[[[194,715],[252,708],[452,753],[512,754]],[[175,608],[193,594],[206,572],[228,477]],[[213,609],[226,603],[313,626],[333,621],[347,603],[334,557],[312,543]],[[244,494],[258,504],[313,516],[344,520],[365,515]],[[425,713],[446,699],[455,678],[438,561],[438,489]],[[62,390],[113,377],[437,430],[470,431],[500,424]],[[149,309],[174,288],[204,153]],[[202,290],[210,299],[306,321],[331,300],[311,241],[296,236]],[[220,182],[229,192],[287,206],[340,201]],[[393,398],[423,371],[429,344],[427,122],[420,54],[402,19],[360,32],[308,59]],[[643,805],[669,789],[684,768],[671,722],[632,619],[586,527],[537,458]],[[612,529],[751,575],[814,581],[839,554],[758,456]],[[612,434],[625,428],[649,399],[638,319],[609,225],[579,175],[550,141],[510,109],[460,84]],[[663,295],[663,284],[677,261],[748,181],[833,101],[984,69]]],"radStrokes":[10,11,12,13]},"笑":{"strokes":["M 336 680 Q 358 716 378 744 Q 388 757 374 770 Q 335 801 309 799 Q 299 796 300 783 Q 313 687 205 567 Q 196 564 161 520 Q 154 505 168 509 Q 186 513 210 531 Q 280 586 321 654 L 336 680 Z","M 321 654 Q 360 641 404 653 Q 449 665 496 677 Q 518 683 521 686 Q 528 693 523 701 Q 516 711 489 717 Q 474 718 388 692 Q 364 686 336 680 C 307 674 292 663 321 654 Z","M 342 586 Q 384 526 406 522 Q 419 521 425 537 Q 428 549 420 568 Q 413 583 392 591 Q 361 607 348 611 Q 339 612 338 602 Q 337 595 342 586 Z","M 623 722 Q 642 762 661 796 Q 670 809 655 821 Q 610 848 590 842 Q 580 838 583 825 Q 602 738 519 625 Q 498 600 488 583 Q 482 568 495 574 Q 511 578 530 597 Q 579 643 610 697 L 623 722 Z","M 610 697 Q 652 676 707 691 Q 756 701 809 714 Q 831 720 836 723 Q 845 732 840 740 Q 833 752 802 758 Q 771 762 741 750 Q 714 741 686 733 Q 656 727 623 722 C 593 717 583 710 610 697 Z","M 646 587 Q 670 568 696 545 Q 709 535 723 535 Q 733 536 737 548 Q 741 561 731 589 Q 722 614 640 631 Q 625 634 620 631 Q 616 627 617 615 Q 621 605 646 587 Z","M 507 432 Q 673 472 675 473 Q 684 480 679 489 Q 672 499 644 507 Q 620 513 496 476 Q 394 457 353 452 Q 319 446 343 430 Q 382 406 439 419 Q 445 420 455 422 L 507 432 Z","M 524 282 Q 614 294 807 295 Q 826 296 832 304 Q 836 316 820 330 Q 766 367 730 359 Q 651 341 520 319 L 464 311 Q 353 296 228 278 Q 207 277 223 259 Q 254 231 313 246 Q 379 264 454 272 L 524 282 Z","M 520 319 Q 529 376 541 394 Q 548 407 540 416 Q 530 426 507 432 C 479 442 440 448 455 422 Q 467 410 470 379 Q 476 351 464 311 L 454 272 Q 411 149 264 66 Q 225 48 178 26 Q 162 16 183 15 Q 318 18 415 107 Q 463 153 505 263 L 520 319 Z","M 505 263 Q 601 139 708 26 Q 730 -1 772 -4 Q 847 -11 925 -1 Q 944 0 947 5 Q 950 12 934 19 Q 733 110 733 111 Q 636 171 527 280 Q 524 281 524 282 C 502 302 487 287 505 263 Z"],"medians":[[[313,786],[338,751],[292,648],[219,557],[172,519]],[[329,658],[473,694],[512,695]],[[348,600],[396,559],[407,538]],[[595,830],[622,799],[600,726],[553,644],[498,583]],[[619,700],[694,711],[793,735],[829,734]],[[625,625],[704,578],[721,551]],[[672,481],[635,486],[413,437],[346,442]],[[225,269],[284,263],[532,303],[747,328],[822,309]],[[462,420],[492,404],[502,391],[500,355],[479,263],[435,176],[398,131],[344,86],[280,51],[188,24]],[[518,273],[552,230],[640,142],[750,50],[840,25],[941,7]]],"radStrokes":[0,1,2,3,4,5]},"快":{"strokes":["M 143 510 Q 130 449 107 392 Q 95 355 118 323 Q 130 307 148 323 Q 193 377 181 456 Q 180 490 168 515 Q 161 522 155 522 Q 146 519 143 510 Z","M 312 518 Q 319 511 333 502 Q 357 483 382 461 Q 395 451 408 452 Q 418 453 421 464 Q 425 477 415 503 Q 409 519 383 530 Q 323 546 313 543 C 288 540 290 538 312 518 Z","M 313 543 Q 313 646 334 716 Q 349 741 323 759 Q 307 771 278 789 Q 254 807 233 791 Q 229 787 234 770 Q 265 722 266 674 Q 267 604 268 523 Q 264 384 259 231 Q 255 155 234 85 Q 222 45 248 -18 Q 254 -36 262 -39 Q 268 -46 276 -37 Q 303 -21 304 45 Q 303 93 312 518 L 313 543 Z","M 749 404 Q 773 506 815 544 Q 833 565 816 584 Q 734 641 679 613 Q 640 598 606 587 L 556 575 Q 501 563 443 555 Q 424 554 427 543 Q 430 533 450 528 Q 478 516 515 529 Q 534 533 555 537 L 603 547 Q 697 574 712 562 Q 724 550 721 526 Q 709 453 693 394 C 685 365 742 375 749 404 Z","M 543 372 Q 459 362 368 349 Q 347 348 363 331 Q 376 318 394 313 Q 413 307 430 312 Q 481 327 539 334 L 589 343 Q 643 361 919 361 Q 938 361 943 370 Q 949 380 932 394 Q 875 436 803 415 Q 778 411 749 404 L 693 394 Q 630 388 592 379 L 543 372 Z","M 555 537 Q 552 455 543 372 L 539 334 Q 518 181 434 103 Q 394 70 334 35 Q 321 28 321 23 Q 322 19 334 19 Q 350 15 389 29 Q 524 72 566 218 Q 576 251 582 290 L 588 336 Q 588 340 589 343 L 592 379 Q 598 466 603 547 L 606 587 Q 609 648 634 729 Q 641 744 631 755 Q 607 774 567 787 Q 542 794 532 787 Q 522 780 530 767 Q 552 728 555 679 Q 556 627 556 575 L 555 537 Z","M 582 290 Q 759 2 812 0 Q 882 4 942 9 Q 967 10 968 17 Q 969 24 941 39 Q 791 105 732 167 Q 648 257 588 336 C 570 360 566 316 582 290 Z"],"medians":[[[157,510],[153,429],[133,333]],[[316,537],[329,525],[378,502],[407,466]],[[245,784],[297,729],[283,212],[267,62],[267,-26]],[[438,544],[503,544],[611,566],[695,592],[734,587],[765,558],[728,427],[699,399]],[[365,340],[413,332],[625,369],[843,392],[889,388],[931,376]],[[539,776],[566,758],[590,728],[568,375],[547,245],[521,174],[473,105],[405,55],[328,23]],[[589,328],[605,284],[663,205],[716,139],[790,67],[818,47],[962,18]]],"radStrokes":[0,1,2]},"乐":{"strokes":["M 340 603 Q 497 651 596 702 Q 644 721 685 731 Q 704 732 707 740 Q 711 752 698 763 Q 676 779 628 798 Q 612 805 598 804 Q 591 800 589 788 Q 589 742 331 622 C 304 609 311 594 340 603 Z","M 331 622 Q 309 647 277 659 Q 261 665 252 655 Q 246 649 257 630 Q 276 599 273 555 Q 270 447 232 395 Q 219 379 225 367 Q 232 345 252 328 Q 265 316 283 331 Q 346 374 511 392 L 566 398 Q 669 408 799 396 Q 823 392 833 399 Q 840 405 835 418 Q 829 431 788 456 Q 764 471 690 458 Q 656 457 565 445 L 510 438 Q 422 428 334 408 Q 315 402 312 408 Q 303 415 308 435 Q 324 558 338 592 Q 339 598 340 603 C 342 612 342 612 331 622 Z","M 511 392 Q 517 116 494 97 Q 484 90 469 94 Q 423 104 379 116 Q 366 117 367 110 Q 368 103 380 94 Q 471 24 504 -19 Q 520 -38 537 -22 Q 577 20 573 94 Q 569 137 566 398 L 565 445 Q 566 491 578 523 Q 588 544 569 558 Q 541 580 508 592 Q 489 599 479 590 Q 473 583 485 566 Q 510 524 509 478 Q 509 459 510 438 L 511 392 Z","M 292 261 Q 249 203 196 154 Q 166 124 175 84 Q 179 63 204 71 Q 232 81 255 111 Q 291 153 303 194 Q 318 227 317 255 Q 314 265 308 268 Q 299 269 292 261 Z","M 692 252 Q 752 185 822 90 Q 838 65 854 59 Q 864 56 873 67 Q 889 80 880 131 Q 871 200 696 287 Q 687 294 683 280 Q 682 265 692 252 Z"],"medians":[[[696,746],[620,754],[508,686],[362,621],[348,621],[347,612]],[[263,648],[284,630],[304,599],[276,380],[321,379],[447,407],[636,429],[767,431],[824,408]],[[489,584],[517,561],[541,528],[540,169],[533,83],[524,58],[514,48],[448,71],[375,109]],[[305,257],[268,185],[208,112],[194,86]],[[695,274],[790,191],[830,147],[847,117],[858,76]]],"radStrokes":[0]},"读":{"strokes":["M 282 735 Q 313 708 345 676 Q 360 660 378 661 Q 391 662 396 677 Q 402 693 392 728 Q 386 750 351 767 Q 267 800 252 791 Q 246 787 248 772 Q 252 759 282 735 Z","M 153 493 Q 104 477 78 475 Q 63 476 61 468 Q 57 461 68 452 Q 107 428 139 442 Q 229 491 241 482 Q 248 476 242 371 Q 239 259 207 155 Q 192 124 234 76 Q 244 64 254 71 Q 261 78 273 101 Q 307 152 381 239 Q 393 251 390 258 Q 389 265 378 256 Q 341 231 305 200 Q 268 167 273 215 Q 273 281 298 442 Q 302 466 323 489 Q 336 499 326 511 Q 316 527 278 544 Q 266 550 249 539 Q 188 505 153 493 Z","M 607 691 Q 555 681 497 676 Q 463 670 487 654 Q 521 633 593 646 Q 599 647 609 648 L 656 657 Q 699 667 746 675 Q 785 684 791 689 Q 800 696 795 704 Q 788 716 760 723 Q 727 729 660 704 L 607 691 Z","M 660 704 Q 661 713 662 720 Q 665 739 668 753 Q 672 763 674 773 Q 677 782 659 795 Q 628 811 607 815 Q 594 819 586 811 Q 579 804 587 791 Q 602 769 607 691 L 609 648 Q 610 603 610 554 C 610 524 646 531 648 561 Q 652 610 656 657 L 660 704 Z","M 610 554 Q 561 547 508 535 Q 468 526 426 521 Q 396 517 416 502 Q 447 477 478 487 Q 587 529 737 547 Q 767 551 777 550 Q 796 541 794 533 Q 782 493 768 450 L 769 449 Q 776 445 790 457 Q 838 493 878 505 Q 911 518 909 525 Q 908 535 841 581 Q 819 596 739 578 Q 670 569 648 561 L 610 554 Z","M 480 412 Q 519 364 539 365 Q 551 364 556 380 Q 557 392 548 409 Q 530 430 483 436 Q 474 437 474 427 Q 473 420 480 412 Z","M 455 328 Q 497 274 519 273 Q 531 272 537 288 Q 538 300 529 317 Q 522 330 502 337 Q 471 350 459 352 Q 450 353 450 343 Q 449 336 455 328 Z","M 638 211 Q 689 224 853 246 Q 863 245 873 258 Q 874 270 851 280 Q 821 301 732 275 Q 698 268 663 257 Q 656 256 649 253 L 599 243 L 412 217 Q 384 213 406 196 Q 418 186 432 178 Q 445 171 467 177 Q 521 190 588 202 L 638 211 Z","M 649 253 Q 656 299 664 370 Q 665 395 676 425 Q 682 435 673 443 Q 625 486 589 476 Q 570 469 585 453 Q 609 426 610 377 Q 610 293 599 243 L 588 202 Q 552 121 463 63 Q 432 47 389 25 Q 377 21 374 17 Q 370 13 384 9 Q 445 5 559 78 Q 578 94 593 112 Q 636 172 638 211 L 649 253 Z","M 694 141 Q 746 95 808 26 Q 824 7 840 2 Q 850 1 857 11 Q 870 24 856 69 Q 846 109 771 143 Q 722 164 694 172 Q 685 178 683 165 Q 683 152 694 141 Z"],"medians":[[[257,783],[350,724],[376,681]],[[71,464],[108,458],[142,465],[234,507],[270,507],[278,497],[245,185],[255,152],[289,163],[384,254]],[[490,666],[546,660],[629,673],[723,697],[783,699]],[[597,802],[634,767],[630,583],[615,562]],[[419,512],[467,505],[666,552],[753,567],[791,567],[821,554],[836,534],[773,454]],[[485,425],[522,401],[539,382]],[[461,341],[499,314],[519,291]],[[407,207],[454,199],[616,226],[785,263],[823,266],[862,260]],[[590,464],[633,435],[639,411],[629,274],[604,177],[579,134],[521,78],[460,42],[380,14]],[[693,161],[802,85],[829,51],[842,19]]],"radStrokes":[0,1]},"写":{"strokes":["M 306 718 Q 306 719 306 720 Q 293 745 279 755 Q 257 771 256 742 Q 260 712 238 672 Q 187 603 188 593 Q 182 571 207 527 Q 225 499 246 530 Q 265 560 278 603 Q 293 657 307 691 L 306 718 Z","M 307 691 Q 328 675 377 683 Q 465 711 671 730 Q 699 733 711 730 Q 729 723 728 715 Q 728 709 683 638 Q 676 625 681 620 Q 688 616 705 626 Q 766 660 813 670 Q 853 680 853 689 Q 852 699 783 759 Q 761 780 687 768 Q 659 765 402 730 Q 356 723 308 720 Q 307 720 306 718 C 276 713 280 703 307 691 Z","M 426 496 Q 475 484 516 496 Q 672 535 676 537 Q 686 547 680 555 Q 671 568 640 574 Q 607 580 575 565 Q 544 553 507 544 Q 473 537 434 529 C 405 523 397 503 426 496 Z","M 387 308 Q 471 353 680 366 Q 705 367 714 359 Q 733 340 727 301 Q 702 102 661 70 Q 649 64 566 94 Q 550 103 547 94 Q 546 84 565 67 Q 608 18 625 -21 Q 644 -52 668 -33 Q 720 1 732 28 Q 750 68 788 276 Q 795 319 815 339 Q 831 355 824 367 Q 793 398 749 413 Q 731 419 655 405 Q 568 399 427 367 Q 400 363 406 380 Q 416 447 426 496 L 434 529 Q 441 565 452 588 Q 459 604 449 616 Q 433 632 416 639 Q 392 649 383 644 Q 374 638 380 625 Q 401 588 365 413 Q 362 397 328 361 Q 316 346 325 333 Q 335 321 357 305 Q 369 295 387 308 Z","M 407 180 Q 435 183 463 188 Q 541 200 610 196 Q 632 195 637 204 Q 643 217 631 226 Q 601 248 560 263 Q 547 267 523 258 Q 480 246 357 222 Q 293 212 261 204 Q 225 195 171 191 Q 158 190 158 180 Q 159 168 177 157 Q 216 133 252 145 Q 294 163 407 180 Z"],"medians":[[[268,748],[281,716],[279,695],[228,582],[225,533]],[[314,712],[328,702],[366,703],[495,728],[699,752],[745,743],[759,733],[773,707],[686,625]],[[435,500],[451,511],[524,521],[621,550],[672,546]],[[389,634],[412,612],[420,594],[373,347],[428,346],[542,372],[692,389],[735,383],[768,354],[730,141],[709,73],[690,39],[659,20],[554,91]],[[169,180],[194,171],[239,170],[320,191],[551,230],[625,212]]],"radStrokes":[0,1]},"画":{"strokes":["M 310 713 Q 268 709 297 688 Q 339 658 406 667 Q 533 685 666 702 Q 727 712 736 720 Q 746 729 743 738 Q 736 753 703 763 Q 676 770 559 742 Q 400 715 310 713 Z","M 337 544 Q 312 560 286 566 Q 279 569 274 563 Q 267 557 276 546 Q 313 489 324 339 Q 325 276 363 250 Q 364 249 367 247 Q 383 243 385 267 L 385 296 Q 382 318 375 345 Q 372 376 367 415 Q 361 469 359 512 C 358 531 358 531 337 544 Z","M 620 296 Q 636 272 653 265 Q 663 258 679 279 Q 697 309 729 470 Q 739 501 763 528 Q 776 541 764 555 Q 748 573 704 600 Q 688 609 606 590 Q 602 590 337 544 C 307 539 330 505 359 512 Q 408 525 477 536 L 516 543 Q 645 570 664 550 Q 680 531 676 514 Q 646 340 627 328 C 613 305 613 305 620 296 Z","M 537 415 Q 576 422 610 425 Q 632 429 625 441 Q 615 454 591 460 Q 572 463 539 456 L 490 443 Q 447 433 407 424 Q 391 421 410 406 Q 420 399 440 402 Q 465 406 491 409 L 537 415 Z","M 539 456 Q 545 516 540 523 Q 528 535 516 543 C 492 560 462 562 477 536 Q 480 530 484 525 Q 487 518 490 443 L 491 409 Q 491 372 492 315 C 493 285 532 293 533 323 Q 534 372 537 415 L 539 456 Z","M 385 267 Q 415 277 620 296 C 650 299 653 313 627 328 Q 612 343 533 323 L 492 315 Q 434 305 385 296 C 355 291 356 259 385 267 Z","M 782 186 Q 487 170 264 118 Q 233 109 239 147 Q 243 222 246 299 Q 249 327 236 344 Q 217 363 186 378 Q 173 385 160 381 Q 147 375 158 353 Q 195 280 188 203 Q 184 130 156 97 Q 122 67 177 27 Q 192 18 207 30 Q 234 60 422 101 Q 593 140 709 143 Q 754 146 773 138 C 802 132 812 188 782 186 Z","M 773 138 Q 755 83 780 27 Q 790 8 805 21 Q 835 49 841 150 Q 865 321 871 332 Q 874 339 877 344 Q 887 362 875 379 Q 853 398 814 421 Q 799 430 785 422 Q 775 418 778 402 Q 805 354 783 192 Q 782 191 782 186 L 773 138 Z"],"medians":[[[300,702],[324,694],[378,690],[664,733],[728,734]],[[282,555],[317,525],[329,502],[355,306],[371,257]],[[351,546],[366,532],[620,577],[659,578],[691,570],[717,535],[676,364],[655,305],[659,285]],[[408,415],[564,440],[593,442],[614,436]],[[484,533],[510,517],[515,503],[513,348],[497,324]],[[386,274],[423,290],[602,313],[620,324]],[[168,368],[211,316],[217,231],[206,112],[208,92],[222,86],[251,86],[373,116],[539,146],[670,161],[756,164],[773,181]],[[792,408],[809,396],[835,356],[794,30]]],"radStrokes":[1,2,3,4,5]},"想":{"strokes":["M 378 600 Q 403 607 431 612 Q 473 622 479 629 Q 488 636 483 645 Q 476 655 448 663 Q 424 666 380 652 L 338 638 Q 220 611 165 604 Q 129 598 155 582 Q 197 558 249 573 Q 280 580 319 587 L 378 600 Z","M 376 537 Q 376 567 378 600 L 380 652 Q 380 730 396 782 Q 403 795 401 806 Q 395 813 351 842 Q 332 855 315 844 Q 311 840 316 827 Q 337 794 338 709 Q 338 675 338 638 L 333 518 Q 333 424 315 361 Q 306 330 326 278 Q 330 265 337 261 Q 343 257 348 262 Q 355 266 363 283 Q 372 302 371 328 Q 371 352 375 509 L 376 537 Z","M 319 587 Q 265 479 123 317 Q 117 307 128 306 Q 143 303 251 408 Q 294 451 333 518 C 385 606 333 614 319 587 Z","M 375 509 Q 442 449 451 447 Q 452 447 454 447 Q 461 447 466 457 Q 469 467 463 489 Q 459 505 434 519 Q 409 529 380 537 Q 377 538 376 537 C 346 537 353 529 375 509 Z","M 563 703 Q 553 716 527 725 Q 518 729 508 725 Q 501 721 506 709 Q 527 654 525 501 Q 525 450 514 399 Q 501 348 535 309 Q 545 296 554 308 Q 561 320 564 332 L 567 362 Q 567 374 568 452 L 568 479 Q 568 527 568 561 L 569 590 Q 569 668 572 677 C 574 693 574 693 563 703 Z","M 725 348 Q 726 341 732 333 Q 745 305 754 306 Q 767 307 783 339 Q 796 364 796 384 Q 784 474 786 613 Q 786 653 808 688 Q 818 704 810 713 Q 783 735 739 753 Q 727 756 642 724 Q 606 714 563 703 C 534 696 543 671 572 677 Q 641 692 713 708 Q 716 708 720 706 Q 730 681 735 615 Q 736 429 727 382 L 725 348 Z","M 568 561 Q 640 576 692 584 Q 714 588 705 601 Q 695 614 671 617 Q 638 620 569 590 C 541 578 539 555 568 561 Z","M 568 452 Q 569 452 572 452 Q 642 462 695 469 Q 717 473 709 485 Q 699 498 675 503 Q 650 506 568 479 C 539 470 538 451 568 452 Z","M 564 332 Q 655 344 725 348 C 755 350 754 370 727 382 Q 726 383 720 385 Q 699 389 567 362 C 538 356 534 328 564 332 Z","M 229 227 Q 201 160 163 98 Q 141 62 160 26 Q 167 7 191 20 Q 215 38 230 72 Q 254 121 257 164 Q 261 200 255 226 Q 249 236 243 237 Q 233 236 229 227 Z","M 325 196 Q 340 85 420 27 Q 516 -39 719 -40 Q 762 -36 798 -23 Q 825 -13 828 3 Q 834 13 798 45 Q 746 105 709 164 Q 699 183 692 177 Q 686 171 701 86 Q 701 41 692 33 Q 677 27 642 25 Q 476 28 410 97 Q 380 125 369 175 Q 362 200 350 207 Q 337 214 328 211 Q 322 210 325 196 Z","M 481 225 Q 529 165 559 152 Q 574 148 583 161 Q 590 173 588 189 Q 576 238 496 261 L 495 262 Q 479 266 470 264 Q 463 263 465 251 Q 466 239 481 225 Z","M 751 243 Q 796 209 849 158 Q 865 139 882 137 Q 889 136 897 147 Q 907 160 892 203 Q 880 240 813 259 Q 773 269 750 273 Q 740 277 739 265 Q 740 252 751 243 Z"],"medians":[[[157,594],[182,588],[219,590],[423,637],[473,639]],[[324,838],[364,793],[356,497],[342,350],[342,272]],[[333,584],[325,578],[310,522],[267,459],[229,410],[129,313]],[[378,530],[391,515],[436,488],[453,455]],[[515,716],[540,688],[543,676],[547,472],[539,352],[545,313]],[[572,699],[581,693],[726,729],[747,718],[765,695],[759,628],[762,386],[755,317]],[[576,568],[584,581],[619,591],[666,599],[696,594]],[[570,459],[584,470],[639,481],[678,485],[699,479]],[[571,339],[583,352],[704,366],[721,377]],[[242,227],[221,135],[187,67],[177,32]],[[333,202],[345,186],[374,108],[419,58],[490,20],[602,-4],[709,-2],[747,20],[731,81],[696,173]],[[476,254],[543,203],[565,171]],[[750,262],[846,208],[866,185],[881,155]]],"radStrokes":[9,10,11,12]},"说":{"strokes":["M 278 746 Q 306 722 335 694 Q 350 681 367 681 Q 379 682 384 696 Q 390 712 379 745 Q 367 779 272 799 Q 256 803 248 799 Q 242 795 244 781 Q 248 768 278 746 Z","M 147 487 Q 98 474 71 472 Q 56 472 54 465 Q 50 458 60 449 Q 100 422 132 437 Q 243 483 249 482 Q 250 482 253 479 Q 260 475 253 368 Q 252 256 219 155 Q 203 127 245 75 Q 255 63 265 70 Q 272 77 284 100 Q 323 151 405 240 Q 417 250 414 258 Q 413 265 402 257 Q 360 229 320 198 Q 278 162 285 215 Q 285 279 310 438 Q 314 462 336 484 Q 349 494 339 507 Q 329 523 291 540 Q 279 547 262 536 Q 189 499 147 487 Z","M 490 720 Q 526 663 555 647 Q 568 643 579 653 Q 586 665 587 681 Q 580 724 507 755 Q 492 762 482 759 Q 476 759 477 747 Q 477 735 490 720 Z","M 723 790 Q 708 763 634 663 Q 624 645 642 650 Q 699 690 768 748 Q 787 766 810 777 Q 831 789 819 806 Q 804 822 777 836 Q 752 848 739 844 Q 726 843 732 828 Q 736 810 723 790 Z","M 484 566 Q 472 570 452 572 Q 440 575 437 570 Q 430 564 439 548 Q 467 494 484 407 Q 488 380 504 363 Q 522 341 527 357 Q 528 364 530 375 L 528 409 Q 521 424 508 535 C 505 560 505 560 484 566 Z","M 738 437 Q 766 524 800 545 Q 816 564 802 582 Q 786 597 731 622 Q 713 629 691 621 Q 618 588 484 566 C 454 561 479 527 508 535 Q 523 541 676 572 Q 695 576 703 570 Q 716 554 684 443 C 676 414 728 409 738 437 Z","M 651 393 Q 691 400 748 405 Q 758 406 760 415 Q 760 422 738 437 L 684 443 L 683 443 Q 598 421 528 409 C 498 404 500 376 530 375 Q 537 374 547 376 Q 572 383 611 388 L 651 393 Z","M 490 303 Q 500 204 416 112 Q 394 84 335 32 Q 328 25 335 23 Q 342 20 351 25 Q 450 65 512 169 Q 527 197 543 234 Q 550 252 561 270 Q 568 279 563 288 Q 557 297 529 312 Q 510 322 501 321 Q 488 317 490 303 Z","M 973 108 Q 960 136 941 224 Q 940 240 933 246 Q 927 250 922 231 Q 894 137 875 108 Q 865 95 834 88 Q 764 73 705 95 Q 683 107 676 121 Q 649 172 682 347 Q 686 372 651 393 C 627 411 603 417 611 388 Q 611 384 614 376 Q 627 336 624 297 Q 614 144 627 101 Q 631 79 651 60 Q 726 -4 882 26 Q 888 29 894 29 Q 931 39 966 65 Q 987 81 973 108 Z"],"medians":[[[255,790],[346,733],[365,700]],[[64,461],[101,454],[138,460],[245,504],[266,507],[291,494],[257,184],[264,149],[301,159],[408,254]],[[488,749],[543,699],[563,667]],[[739,835],[760,815],[768,797],[686,703],[646,669],[644,660]],[[446,562],[466,547],[482,523],[516,362]],[[494,565],[518,555],[695,597],[727,591],[751,562],[719,467],[692,453]],[[534,381],[552,396],[684,421],[729,421],[750,415]],[[504,307],[525,275],[505,210],[480,160],[433,100],[367,44],[339,28]],[[618,383],[645,365],[652,352],[641,187],[649,117],[667,86],[693,67],[738,53],[782,49],[866,59],[907,79],[925,98],[932,239]]],"radStrokes":[0,1]},"话":{"strokes":["M 296 748 Q 333 717 373 679 Q 388 666 404 666 Q 414 667 421 681 Q 425 696 416 727 Q 404 769 291 798 Q 275 802 268 799 Q 262 795 264 781 Q 268 771 296 748 Z","M 160 487 Q 109 471 81 469 Q 66 469 64 461 Q 60 452 71 445 Q 107 423 147 434 Q 250 488 262 480 Q 272 474 267 447 Q 260 261 226 158 Q 208 125 252 73 Q 262 60 273 67 Q 282 74 293 99 Q 333 151 420 243 Q 433 255 430 262 Q 429 271 417 261 Q 374 233 332 201 Q 287 164 296 219 Q 296 283 322 439 Q 326 464 349 487 Q 362 497 352 511 Q 340 527 302 545 Q 289 552 272 541 Q 202 501 160 487 Z","M 629 633 Q 725 681 772 693 Q 791 694 794 703 Q 798 716 783 727 Q 759 743 709 759 Q 693 766 677 764 Q 670 760 670 747 Q 671 705 468 593 Q 464 583 470 580 Q 486 580 578 614 Q 582 615 589 618 L 629 633 Z","M 658 445 Q 775 464 913 464 Q 932 465 937 474 Q 941 486 925 498 Q 870 537 809 516 Q 749 503 662 483 L 607 473 Q 511 457 403 438 Q 384 435 399 419 Q 412 406 430 402 Q 451 398 466 403 Q 530 424 605 436 L 658 445 Z","M 635 285 Q 647 367 658 445 L 662 483 Q 662 505 686 585 Q 690 595 672 611 Q 648 626 629 633 C 601 644 577 645 589 618 Q 589 617 591 612 Q 610 581 609 561 Q 609 519 607 473 L 605 436 Q 601 361 594 277 C 592 247 631 255 635 285 Z","M 510 266 Q 497 272 467 277 Q 454 280 451 274 Q 444 268 453 251 Q 484 190 502 90 Q 505 60 523 40 Q 542 18 547 34 Q 551 47 551 67 L 546 106 Q 528 206 525 235 C 522 261 522 261 510 266 Z","M 792 132 Q 819 214 851 236 Q 869 255 854 275 Q 778 333 718 308 Q 673 296 635 285 L 594 277 Q 554 271 510 266 C 480 263 496 229 525 235 Q 534 238 718 269 Q 740 273 749 264 Q 759 254 757 233 Q 748 181 736 136 C 729 107 782 104 792 132 Z","M 551 67 Q 560 67 569 68 Q 645 83 809 90 Q 821 91 823 101 Q 823 110 792 132 C 776 144 765 142 736 136 Q 630 115 546 106 C 516 103 521 66 551 67 Z"],"medians":[[[274,791],[377,724],[401,684]],[[75,456],[113,452],[150,458],[258,506],[279,509],[302,497],[266,192],[274,151],[318,165],[424,259]],[[781,709],[704,714],[661,681],[589,639],[496,596],[482,597],[472,587]],[[402,428],[456,424],[602,455],[824,491],[881,491],[926,479]],[[597,617],[631,600],[646,582],[618,310],[600,285]],[[461,266],[489,243],[496,228],[536,40]],[[518,263],[528,255],[550,255],[652,271],[715,289],[764,288],[803,254],[772,162],[743,141]],[[555,74],[568,89],[732,111],[789,111],[814,101]]],"radStrokes":[0,1]},"朋":{"strokes":["M 253 393 Q 253 394 254 396 Q 263 453 266 509 L 268 544 Q 269 563 270 583 Q 273 685 279 697 C 282 714 282 714 261 726 Q 248 735 228 742 Q 209 751 197 745 Q 187 738 194 725 Q 212 698 218 645 Q 218 432 191 318 Q 188 311 187 301 Q 157 192 84 62 Q 80 55 79 49 Q 78 39 87 42 Q 100 45 136 96 Q 212 193 248 365 L 253 393 Z","M 279 697 Q 297 701 364 721 Q 382 727 387 718 Q 406 666 397 319 Q 390 198 382 185 Q 379 182 314 194 Q 295 201 296 192 Q 345 146 372 112 Q 385 93 399 88 Q 408 85 416 94 Q 456 140 455 191 Q 434 662 459 705 Q 471 724 459 734 Q 440 752 405 765 Q 386 774 340 748 Q 310 736 261 726 C 232 719 250 689 279 697 Z","M 266 509 Q 315 518 352 523 Q 376 529 366 540 Q 354 553 328 557 Q 304 558 268 544 C 240 533 236 504 266 509 Z","M 248 365 Q 251 365 256 365 Q 314 375 356 380 Q 378 384 369 397 Q 359 410 335 413 Q 298 416 253 393 C 226 380 218 365 248 365 Z","M 617 399 Q 626 448 629 525 L 630 556 Q 631 578 631 600 Q 628 672 634 707 Q 635 710 635 711 C 638 732 638 732 617 743 Q 604 752 584 758 Q 565 765 553 760 Q 543 753 550 740 Q 571 710 577 651 Q 577 638 578 620 Q 585 449 556 315 Q 529 213 460 74 Q 456 67 454 61 Q 453 51 463 54 Q 481 57 510 110 Q 583 209 612 372 L 617 399 Z","M 635 711 Q 641 714 744 735 Q 766 739 771 727 Q 799 639 787 208 Q 783 126 773 110 Q 769 104 746 109 Q 713 116 680 123 Q 658 129 661 119 Q 728 68 767 30 Q 780 11 798 5 Q 808 2 816 12 Q 856 63 855 122 Q 843 315 840 627 Q 839 688 853 716 Q 866 737 853 747 Q 831 766 792 783 Q 773 790 756 783 Q 698 753 617 743 C 587 738 606 704 635 711 Z","M 629 525 Q 690 534 736 543 Q 758 547 750 560 Q 738 575 712 577 Q 670 580 630 556 C 604 541 599 521 629 525 Z","M 612 372 Q 615 371 623 372 Q 690 382 739 387 Q 761 391 753 404 Q 743 419 717 423 Q 675 429 617 399 C 590 385 582 375 612 372 Z"],"medians":[[[205,734],[238,703],[245,672],[239,476],[224,361],[208,294],[177,206],[148,144],[87,50]],[[270,725],[288,716],[384,745],[404,739],[425,716],[424,285],[417,173],[400,146],[306,189]],[[273,514],[280,526],[298,535],[357,534]],[[252,372],[267,383],[306,392],[339,396],[360,390]],[[561,749],[594,720],[602,693],[605,517],[594,396],[575,300],[549,224],[493,107],[463,64]],[[625,741],[649,731],[774,760],[799,744],[813,726],[819,260],[815,109],[795,68],[764,75],[671,117]],[[637,533],[647,546],[693,557],[740,554]],[[618,378],[631,389],[699,404],[743,398]]],"radStrokes":[0,1,2,3]},"友":{"strokes":["M 485 583 Q 585 604 691 625 Q 767 643 778 653 Q 788 662 783 671 Q 776 684 744 692 Q 713 699 679 686 Q 592 656 500 632 L 433 618 Q 357 605 271 596 Q 231 589 260 571 Q 302 546 388 564 Q 401 567 417 569 L 485 583 Z","M 419 422 Q 458 500 485 583 L 500 632 Q 521 707 553 759 Q 563 769 554 781 Q 538 805 502 830 Q 481 846 461 844 Q 436 841 450 817 Q 474 777 466 743 Q 450 676 433 618 L 417 569 Q 318 290 132 130 Q 113 115 92 98 Q 77 91 74 87 Q 70 80 87 78 Q 97 77 144 103 Q 178 119 236 169 Q 317 239 404 392 L 419 422 Z","M 594 174 Q 642 252 684 373 Q 697 404 718 425 Q 739 443 724 458 Q 709 471 675 482 Q 651 488 570 456 Q 452 428 419 422 C 390 416 374 396 404 392 Q 441 382 488 397 Q 582 428 600 428 Q 625 425 620 397 Q 602 313 552 212 L 529 178 Q 447 76 288 25 Q 273 19 286 11 Q 293 4 344 8 Q 464 23 565 134 L 594 174 Z","M 565 134 Q 694 -14 741 -16 Q 832 -19 906 -10 Q 943 -6 941 5 Q 941 8 757 69 Q 693 96 594 174 L 552 212 Q 516 248 480 288 Q 443 328 409 328 Q 391 329 387 324 Q 386 318 401 307 Q 446 279 529 178 L 565 134 Z"],"medians":[[[262,585],[302,578],[358,582],[560,623],[724,665],[771,665]],[[459,829],[491,801],[506,777],[508,760],[434,527],[375,397],[294,269],[234,198],[169,138],[111,96],[81,84]],[[411,395],[431,406],[494,417],[587,446],[628,448],[663,434],[645,359],[610,268],[574,194],[539,146],[489,100],[428,58],[332,21],[293,17]],[[392,322],[422,311],[452,289],[610,124],[728,35],[797,18],[938,2]]],"radStrokes":[2,3]},"雪":{"strokes":["M 513 714 Q 574 726 644 736 Q 687 743 693 749 Q 703 758 699 767 Q 692 780 661 789 Q 631 795 529 768 Q 415 750 368 747 Q 328 743 356 723 Q 401 696 461 707 Q 464 708 469 707 L 513 714 Z","M 257 587 Q 247 609 236 617 Q 217 633 214 605 Q 220 563 149 489 Q 125 464 155 403 Q 170 375 193 403 Q 212 431 227 471 Q 257 550 261 554 C 267 566 267 566 257 587 Z","M 532 593 Q 706 626 761 617 Q 777 608 776 601 Q 754 556 731 508 Q 731 507 733 505 Q 740 501 757 511 Q 815 548 863 559 Q 903 571 902 580 Q 901 590 831 646 Q 809 665 723 650 Q 611 638 534 624 L 487 618 Q 432 612 371 601 Q 313 592 257 587 C 227 584 232 562 261 554 Q 286 542 318 551 Q 420 582 489 587 L 532 593 Z","M 489 587 Q 489 500 472 392 Q 460 350 492 314 Q 501 304 510 314 Q 531 344 531 442 Q 531 517 532 593 L 534 624 Q 535 649 540 672 Q 547 694 527 705 Q 520 709 513 714 C 488 731 460 736 469 707 Q 469 706 470 702 Q 486 663 487 618 L 489 587 Z","M 331 478 Q 368 445 395 437 Q 407 437 412 448 Q 415 458 411 471 Q 404 489 389 497 Q 364 509 325 510 Q 319 510 316 507 Q 312 506 315 496 Q 316 487 331 478 Z","M 316 365 Q 353 332 378 328 Q 391 328 396 340 Q 399 350 394 365 Q 385 383 369 391 Q 321 407 300 395 Q 296 394 299 383 Q 302 374 316 365 Z","M 597 512 Q 648 481 676 475 Q 688 476 692 488 Q 693 498 689 511 Q 668 542 599 543 Q 586 543 579 539 Q 575 536 579 528 Q 583 519 597 512 Z","M 587 406 Q 635 370 659 365 Q 671 364 676 376 Q 679 386 675 399 Q 660 426 592 437 Q 579 438 572 435 Q 568 434 571 424 Q 574 415 587 406 Z","M 687 60 Q 718 190 764 225 Q 783 246 767 266 Q 748 282 690 311 Q 671 321 645 311 Q 513 268 325 257 Q 306 256 307 245 Q 310 236 330 228 Q 358 213 398 225 Q 510 240 617 256 Q 645 260 655 249 Q 668 236 665 210 Q 652 131 634 67 C 626 38 680 31 687 60 Z","M 293 143 Q 265 140 286 123 Q 316 98 344 104 Q 467 126 597 137 Q 607 136 616 147 Q 617 157 596 169 Q 566 191 490 169 Q 474 168 456 163 Q 405 153 360 149 Q 329 148 293 143 Z","M 634 67 Q 631 68 628 67 Q 445 33 299 23 Q 275 22 289 0 Q 296 -10 308 -16 Q 321 -20 336 -17 Q 453 5 703 16 Q 716 17 718 27 Q 719 37 687 60 L 634 67 Z"],"medians":[[[359,737],[395,728],[449,730],[630,762],[685,762]],[[225,610],[233,595],[234,568],[213,516],[179,460],[172,407]],[[265,582],[284,568],[679,632],[760,637],[792,629],[808,618],[821,595],[738,511]],[[477,706],[510,679],[508,493],[497,362],[501,320]],[[323,501],[379,473],[396,454]],[[308,388],[353,369],[379,346]],[[586,534],[653,510],[675,492]],[[578,429],[649,394],[661,381]],[[317,246],[373,240],[633,282],[672,280],[712,243],[667,89],[641,72]],[[288,134],[335,125],[538,155],[566,157],[606,149]],[[296,11],[327,3],[624,40],[684,38],[708,28]]],"radStrokes":[0,1,2,3,4,5,6,7]},"风":{"strokes":["M 312 661 Q 263 697 237 686 Q 224 677 232 664 Q 253 637 254 570 Q 254 372 227 275 Q 199 179 133 56 Q 129 49 127 43 Q 126 31 136 34 Q 154 37 186 86 Q 315 254 316 536 Q 316 584 323 625 C 327 651 327 651 312 661 Z","M 956 10 Q 949 89 947 222 Q 948 235 941 241 Q 934 245 930 230 Q 900 119 884 102 Q 878 93 854 104 Q 802 128 764 209 Q 731 282 721 375 Q 711 472 732 597 Q 736 640 766 674 Q 785 687 772 700 Q 760 719 725 745 Q 704 760 653 738 Q 611 732 312 661 C 283 654 294 617 323 625 Q 333 626 345 631 Q 478 668 645 692 Q 664 695 673 688 Q 676 685 677 654 Q 623 239 781 75 Q 835 9 923 -19 Q 942 -26 952 -16 Q 959 -9 956 10 Z","M 524 347 Q 552 408 583 496 Q 602 541 603 543 Q 602 546 602 547 Q 590 566 564 587 Q 548 602 534 600 Q 521 596 525 581 Q 540 536 483 386 L 463 339 Q 415 240 316 140 Q 310 136 307 129 Q 303 119 313 119 Q 346 116 434 209 Q 441 218 450 228 Q 475 259 497 296 L 524 347 Z","M 497 296 Q 540 238 590 170 Q 600 151 614 145 Q 621 142 629 150 Q 642 160 636 200 Q 633 248 524 347 L 483 386 Q 411 452 369 486 Q 362 492 358 481 Q 357 469 364 459 Q 412 405 463 339 L 497 296 Z"],"medians":[[[244,673],[274,649],[286,622],[283,456],[270,342],[248,254],[222,187],[168,85],[137,44]],[[327,633],[335,648],[449,677],[672,718],[704,712],[720,690],[703,617],[692,515],[692,387],[706,292],[746,177],[785,118],[821,82],[867,55],[899,50],[922,109],[938,233]],[[537,587],[555,560],[562,537],[532,439],[492,340],[466,291],[411,214],[356,158],[316,128]],[[367,476],[566,259],[604,204],[617,160]]]},"雨":{"strokes":["M 502 676 Q 587 689 679 701 Q 743 711 753 719 Q 763 726 758 736 Q 752 749 723 758 Q 692 767 661 756 Q 588 737 509 722 Q 422 709 321 705 Q 284 701 308 682 Q 350 655 424 667 Q 440 670 458 670 L 502 676 Z","M 219 488 Q 191 512 164 517 Q 158 520 153 513 Q 149 506 153 492 Q 184 438 187 392 Q 196 284 185 165 Q 181 140 192 118 Q 205 97 224 84 Q 239 75 241 87 Q 248 91 250 115 Q 256 142 246 231 Q 234 390 234 450 C 234 476 234 476 219 488 Z","M 529 507 Q 559 514 789 532 Q 808 533 814 524 Q 824 517 822 466 Q 816 258 783 141 Q 773 105 742 111 Q 703 120 668 127 Q 655 131 654 125 Q 653 118 664 107 Q 740 49 761 17 Q 771 -1 784 2 Q 800 3 815 33 Q 843 76 852 129 Q 868 199 882 446 Q 885 491 899 515 Q 917 537 903 542 Q 887 558 849 576 Q 825 592 799 581 Q 763 571 672 560 Q 596 553 530 543 L 485 536 Q 430 529 386 519 Q 301 501 219 488 C 189 483 206 440 234 450 Q 255 468 486 500 L 529 507 Z","M 530 543 Q 531 589 541 623 Q 548 636 546 646 Q 540 653 502 676 C 476 692 443 696 458 670 Q 458 669 460 665 Q 482 635 483 604 Q 484 573 485 536 L 486 500 Q 486 281 474 230 Q 459 203 485 142 Q 491 127 497 125 Q 503 119 508 126 Q 515 130 523 147 Q 530 166 530 193 Q 529 224 529 507 L 530 543 Z","M 327 380 Q 378 347 405 341 Q 415 341 420 352 Q 423 362 418 373 Q 399 409 331 409 L 330 409 Q 317 410 312 406 Q 308 405 311 396 Q 314 389 327 380 Z","M 319 246 Q 370 206 395 201 Q 407 201 412 212 Q 415 222 411 235 Q 404 253 388 260 Q 369 270 324 277 Q 311 278 304 275 Q 300 274 303 264 Q 306 255 319 246 Z","M 611 413 Q 669 383 697 382 Q 709 383 712 395 Q 713 407 707 418 Q 689 445 632 445 Q 598 445 591 439 Q 587 436 592 428 Q 596 419 611 413 Z","M 609 269 Q 658 233 686 228 Q 699 228 704 240 Q 707 252 702 264 Q 684 297 633 300 Q 600 304 592 299 Q 588 298 591 287 Q 594 278 609 269 Z"],"medians":[[[312,695],[343,687],[396,686],[520,701],[698,734],[747,730]],[[162,506],[196,471],[209,425],[217,303],[218,146],[232,89]],[[232,457],[246,475],[259,479],[510,523],[813,557],[845,540],[855,530],[858,511],[840,271],[826,174],[808,104],[780,69],[679,109],[661,123]],[[465,670],[498,651],[511,625],[507,312],[499,210],[502,136]],[[318,400],[372,381],[405,357]],[[310,269],[373,239],[396,218]],[[598,434],[670,415],[697,398]],[[598,292],[663,266],[687,246]]]},"云":{"strokes":["M 351 652 Q 311 645 339 627 Q 382 600 444 615 Q 546 634 651 656 Q 700 666 707 673 Q 716 682 711 691 Q 704 704 672 712 Q 648 718 540 685 Q 444 661 351 652 Z","M 512 420 Q 633 436 814 438 Q 893 435 900 448 Q 906 461 887 476 Q 830 518 772 506 Q 613 473 146 409 Q 122 406 140 387 Q 156 372 176 366 Q 198 360 217 366 Q 323 397 446 411 L 512 420 Z","M 689 193 Q 535 174 377 151 Q 364 148 362 152 Q 359 156 367 167 Q 482 339 527 384 Q 543 399 532 409 Q 525 416 512 420 C 486 435 448 441 446 411 Q 446 305 322 179 Q 298 160 266 138 Q 221 122 244 75 Q 254 53 268 47 Q 277 43 288 49 Q 417 122 698 169 Q 701 170 705 171 C 734 177 719 197 689 193 Z","M 705 171 Q 736 128 771 75 Q 784 51 799 44 Q 808 41 817 50 Q 833 62 827 110 Q 823 176 643 294 Q 636 301 631 288 Q 627 275 637 262 Q 662 231 689 193 L 705 171 Z"],"medians":[[[342,641],[365,634],[416,634],[645,684],[699,684]],[[143,398],[197,389],[410,428],[775,472],[816,473],[890,455]],[[521,398],[496,391],[475,374],[421,274],[344,172],[325,121],[374,120],[575,163],[652,176],[700,176]],[[642,281],[776,136],[796,97],[804,61]]],"radStrokes":[0,1]},"天":{"strokes":["M 499 681 Q 581 697 671 713 Q 726 725 734 732 Q 744 741 739 750 Q 732 763 699 773 Q 666 780 562 747 Q 439 719 336 709 Q 294 703 324 684 Q 369 659 430 668 L 499 681 Z","M 509 439 Q 615 454 771 455 Q 843 455 848 465 Q 854 478 836 493 Q 781 532 739 524 Q 652 505 506 478 L 447 470 Q 323 452 181 432 Q 159 429 175 411 Q 208 381 250 391 Q 340 416 442 430 L 509 439 Z","M 506 478 Q 512 583 534 637 Q 540 650 530 658 Q 518 670 499 681 C 474 698 413 693 430 668 Q 455 637 455 606 Q 454 531 447 470 L 442 430 Q 412 253 320 176 Q 232 113 145 75 Q 130 71 127 66 Q 121 60 138 57 Q 214 51 362 143 Q 390 167 413 194 Q 470 267 494 405 L 506 478 Z","M 494 405 Q 629 144 722 51 Q 740 33 762 31 Q 847 30 920 27 Q 951 26 952 33 Q 953 42 920 59 Q 752 134 710 180 Q 601 294 515 430 Q 511 434 509 439 C 493 464 473 446 494 405 Z"],"medians":[[[326,698],[350,691],[403,691],[654,741],[700,747],[727,744]],[[179,421],[204,414],[238,414],[519,462],[749,490],[800,484],[839,472]],[[438,664],[485,643],[491,633],[466,401],[450,336],[424,268],[394,216],[340,158],[212,87],[134,63]],[[505,431],[510,408],[533,366],[596,270],[714,122],[771,78],[947,35]]],"radStrokes":[1,2,3]},"地":{"strokes":["M 292 431 Q 376 461 382 466 Q 389 475 384 482 Q 377 492 349 495 Q 321 496 295 483 Q 294 483 294 482 L 244 459 Q 154 429 124 423 Q 91 413 117 401 Q 151 389 224 409 Q 233 412 245 415 L 292 431 Z","M 286 229 Q 290 334 292 431 L 294 482 Q 294 599 315 684 Q 318 696 296 711 Q 259 730 232 734 Q 214 738 206 728 Q 199 721 207 704 Q 237 662 237 634 Q 241 550 244 459 L 245 415 Q 245 318 242 211 C 241 181 285 199 286 229 Z","M 242 211 Q 190 190 134 167 Q 118 160 88 157 Q 75 154 74 143 Q 73 130 84 122 Q 109 109 146 93 Q 156 92 168 102 Q 195 129 346 223 Q 367 236 382 250 Q 394 260 393 269 Q 387 273 375 270 Q 332 251 286 229 L 242 211 Z","M 473 369 Q 513 393 580 428 L 627 454 Q 675 482 738 514 Q 757 521 762 510 Q 772 494 735 332 Q 731 289 700 300 Q 681 306 661 310 Q 648 311 651 304 Q 657 294 719 240 Q 741 216 757 237 Q 791 280 798 343 Q 808 406 818 470 Q 825 504 853 535 Q 863 551 848 562 Q 829 572 780 579 Q 761 582 749 569 Q 724 545 630 489 L 583 463 Q 541 444 497 421 Q 485 417 475 411 L 432 391 Q 377 369 341 355 Q 328 352 328 343 Q 328 336 369 326 Q 394 319 415 334 Q 419 338 432 345 L 473 369 Z","M 580 428 Q 565 263 574 233 Q 580 220 590 226 Q 612 250 617 331 Q 621 395 627 454 L 630 489 Q 643 699 658 753 Q 668 774 655 787 Q 639 803 609 819 Q 585 829 560 820 Q 547 811 562 794 Q 586 742 589 696 Q 593 597 583 463 L 580 428 Z","M 973 161 Q 958 201 944 318 Q 944 334 937 338 Q 931 341 927 324 Q 905 201 885 162 Q 869 135 811 120 Q 682 86 560 140 Q 512 165 497 197 Q 476 234 473 300 Q 472 333 473 369 L 475 411 Q 478 472 487 539 Q 491 557 479 566 Q 466 579 442 586 Q 429 590 421 585 Q 414 581 420 563 Q 435 526 433 488 Q 432 436 432 391 L 432 345 Q 433 221 451 176 Q 460 139 493 108 Q 604 20 811 49 Q 836 55 862 62 Q 916 80 966 121 Q 985 136 973 161 Z"],"medians":[[[118,413],[175,416],[321,468],[375,475]],[[219,718],[270,677],[272,657],[265,244],[247,219]],[[90,142],[147,133],[388,265]],[[335,345],[397,351],[603,456],[729,531],[774,545],[798,533],[786,439],[754,290],[738,270],[728,270],[657,305]],[[570,808],[594,793],[616,767],[619,730],[610,502],[584,235]],[[429,577],[451,555],[458,535],[451,313],[463,217],[490,155],[548,110],[634,81],[693,74],[797,81],[880,108],[929,151],[936,332]]],"radStrokes":[0,1,2]},"山":{"strokes":["M 536 209 Q 546 407 552 587 Q 556 633 562 664 Q 569 691 574 710 Q 578 723 554 740 Q 512 762 484 767 Q 465 771 456 760 Q 447 751 457 734 Q 488 688 489 655 Q 499 444 488 200 C 487 170 534 179 536 209 Z","M 796 244 Q 657 232 536 209 L 488 200 Q 379 182 284 155 Q 256 148 263 180 Q 267 253 272 329 Q 275 357 263 373 Q 220 416 190 409 Q 178 403 188 382 Q 224 309 215 236 Q 211 166 182 133 Q 161 112 170 96 Q 183 78 203 66 Q 219 57 230 67 Q 243 83 283 99 Q 440 151 606 182 Q 757 210 789 197 C 819 193 826 247 796 244 Z","M 789 197 Q 783 166 774 145 Q 756 118 785 55 Q 795 36 809 49 Q 837 73 846 173 Q 868 386 890 427 Q 900 443 889 460 Q 867 479 831 501 Q 816 510 802 503 Q 793 499 796 484 Q 823 435 796 244 L 789 197 Z"],"medians":[[[472,748],[525,700],[514,235],[493,208]],[[196,398],[217,379],[239,340],[243,263],[233,126],[282,127],[380,155],[575,197],[710,218],[772,221],[788,237]],[[810,490],[826,477],[849,433],[798,57]]]},"水":{"strokes":["M 535 506 Q 538 699 560 762 Q 578 793 520 817 Q 486 836 465 830 Q 447 823 463 799 Q 485 771 486 736 Q 490 697 478 121 Q 477 97 463 88 Q 454 81 432 88 Q 407 94 382 99 Q 348 111 351 100 Q 352 93 373 78 Q 440 24 457 -5 Q 476 -41 493 -42 Q 508 -43 524 -7 Q 543 41 541 117 Q 531 294 534 470 L 535 506 Z","M 154 501 Q 141 501 139 492 Q 138 485 153 477 Q 199 452 227 461 Q 333 489 343 489 Q 359 486 347 456 Q 296 326 249 262 Q 201 190 114 119 Q 99 106 110 103 Q 120 102 141 113 Q 217 153 281 224 Q 342 288 419 454 Q 429 478 441 489 Q 456 501 447 511 Q 437 524 399 537 Q 378 549 336 530 Q 270 509 154 501 Z","M 590 446 Q 630 476 766 584 Q 787 603 814 615 Q 838 627 825 647 Q 809 666 779 681 Q 752 696 738 692 Q 723 691 729 675 Q 735 639 659 553 Q 620 508 577 459 C 557 436 566 428 590 446 Z","M 577 459 Q 555 484 535 506 C 515 528 516 494 534 470 Q 756 161 817 160 Q 898 169 967 175 Q 995 178 996 185 Q 997 192 964 205 Q 810 253 753 295 Q 690 346 590 446 L 577 459 Z"],"medians":[[[473,814],[500,795],[521,770],[508,455],[507,91],[485,42],[442,56],[371,91],[369,98],[358,98]],[[147,491],[209,482],[354,512],[381,505],[392,495],[384,459],[353,387],[280,261],[187,160],[113,110]],[[737,682],[750,671],[766,637],[721,583],[591,461],[590,452]],[[539,500],[550,465],[618,387],[729,271],[782,229],[820,207],[990,185]]]},"火":{"strokes":["M 226 483 Q 254 443 285 393 Q 295 375 312 372 Q 324 369 333 381 Q 342 396 342 430 Q 342 472 235 536 Q 220 543 213 543 Q 206 540 204 526 Q 205 513 226 483 Z","M 690 568 Q 677 547 584 441 Q 571 422 592 425 Q 638 449 738 513 Q 762 532 791 543 Q 816 553 805 575 Q 789 597 759 615 Q 731 633 715 629 Q 700 628 704 612 Q 708 590 690 568 Z","M 511 382 Q 520 439 529 618 Q 530 669 548 728 Q 554 741 543 750 Q 521 769 479 785 Q 454 795 434 789 Q 410 779 430 759 Q 464 725 465 690 Q 469 500 448 374 Q 427 209 284 106 Q 244 81 186 49 Q 170 43 167 39 Q 160 32 179 29 Q 197 28 258 48 Q 301 61 365 101 Q 414 131 442 172 Q 484 232 504 341 L 511 382 Z","M 504 341 Q 597 175 715 40 Q 740 9 767 9 Q 843 13 911 17 Q 939 18 940 25 Q 941 32 910 48 Q 753 117 709 157 Q 592 268 511 382 C 493 406 489 367 504 341 Z"],"medians":[[[216,534],[299,440],[316,391]],[[714,618],[736,593],[744,571],[696,522],[587,433]],[[436,773],[475,753],[497,733],[503,713],[488,443],[470,321],[456,275],[418,195],[368,138],[279,78],[174,36]],[[513,375],[521,341],[606,223],[689,127],[745,76],[768,60],[934,25]]]},"土":{"strokes":["M 535 428 Q 602 441 673 451 Q 739 464 749 472 Q 759 481 755 490 Q 748 505 715 514 Q 681 523 647 511 Q 592 495 537 481 L 483 470 Q 395 454 293 449 Q 251 445 280 424 Q 320 397 409 409 Q 445 415 483 420 L 535 428 Z","M 521 151 Q 528 293 535 428 L 537 481 Q 538 595 566 720 Q 570 733 546 751 Q 504 773 475 779 Q 456 783 446 773 Q 436 763 447 746 Q 481 694 481 658 Q 484 567 483 470 L 483 420 Q 480 290 471 145 C 469 115 520 121 521 151 Z","M 471 145 Q 314 130 132 111 Q 107 110 125 87 Q 162 50 211 60 Q 452 121 842 114 Q 875 113 903 112 Q 928 111 935 122 Q 942 137 922 154 Q 847 212 795 192 Q 689 176 521 151 L 471 145 Z"],"medians":[[[283,438],[312,430],[379,430],[486,445],[692,487],[741,485]],[[461,760],[517,714],[518,685],[498,173],[476,153]],[[129,99],[188,87],[378,115],[818,156],[866,149],[922,129]]]},"日":{"strokes":["M 349 664 Q 348 665 347 666 Q 322 687 292 696 Q 282 697 274 689 Q 270 682 279 670 Q 331 531 294 261 Q 287 216 271 169 Q 262 141 267 118 Q 277 81 291 65 Q 304 50 314 66 Q 324 79 332 102 L 339 137 Q 349 186 350 238 Q 350 316 351 391 L 352 420 Q 353 576 361 626 C 364 652 364 652 349 664 Z","M 608 120 Q 641 78 665 39 Q 675 18 688 19 Q 707 20 724 59 Q 745 104 740 157 Q 728 310 721 593 Q 720 629 738 654 Q 748 669 738 681 Q 716 703 656 730 Q 635 740 617 729 Q 512 684 349 664 C 319 660 332 620 361 626 Q 410 635 590 672 Q 624 679 640 666 Q 691 615 658 164 Q 657 163 657 159 Q 653 143 640 144 C 621 121 602 128 608 120 Z","M 351 391 Q 390 378 433 387 Q 493 399 554 411 Q 582 417 587 421 Q 596 428 591 437 Q 584 447 556 455 Q 531 461 450 435 Q 375 423 352 420 C 322 416 322 400 351 391 Z","M 332 102 Q 345 98 361 100 Q 440 115 608 120 C 638 121 661 122 640 144 Q 633 153 614 166 Q 596 178 561 170 Q 438 146 339 137 C 309 134 303 108 332 102 Z"],"medians":[[[284,684],[321,646],[328,617],[332,516],[323,261],[302,136],[302,70]],[[359,660],[374,648],[388,650],[635,703],[668,687],[690,665],[699,450],[699,159],[685,105],[688,37]],[[357,413],[369,404],[398,404],[534,432],[581,431]],[[340,106],[355,119],[432,130],[585,147],[632,143]]]},"月":{"strokes":["M 398 390 Q 410 502 412 535 L 414 566 Q 417 717 420 735 C 422 758 422 758 405 766 Q 405 767 404 767 Q 353 791 337 787 Q 316 783 334 760 Q 373 697 357 455 Q 353 356 304 239 Q 271 154 155 37 Q 140 24 137 16 Q 136 9 148 10 Q 164 11 186 26 Q 246 69 281 112 Q 333 173 363 244 Q 382 296 394 361 L 398 390 Z","M 420 735 Q 429 735 609 769 Q 631 773 637 762 Q 656 713 657 390 Q 657 128 640 101 Q 634 94 612 99 Q 581 105 549 111 Q 527 117 528 107 Q 595 55 633 16 Q 649 -3 665 -9 Q 675 -13 685 -2 Q 730 53 725 113 Q 712 321 709 657 Q 708 721 723 750 Q 736 772 723 783 Q 698 804 658 820 Q 639 827 621 820 Q 569 793 536 785 Q 493 773 405 766 C 375 763 390 730 420 735 Z","M 412 535 Q 442 529 533 542 Q 587 551 594 554 Q 603 561 599 569 Q 592 579 566 587 Q 538 594 511 583 Q 487 576 462 572 Q 440 568 414 566 C 384 564 382 540 412 535 Z","M 394 361 Q 428 351 561 374 Q 564 375 568 375 Q 590 379 594 382 Q 603 389 599 397 Q 592 407 566 415 Q 538 421 511 411 Q 484 404 456 397 Q 428 393 398 390 C 368 387 365 368 394 361 Z"],"medians":[[[339,773],[379,742],[387,685],[385,504],[366,342],[341,259],[296,169],[236,93],[184,43],[145,17]],[[415,764],[429,752],[503,762],[634,796],[666,780],[681,758],[687,291],[683,93],[664,56],[632,63],[538,104]],[[417,542],[430,550],[535,566],[588,564]],[[399,368],[413,375],[535,394],[588,392]]]},"星":{"strokes":["M 303 760 Q 290 763 287 757 Q 280 750 290 734 Q 326 667 349 555 Q 353 521 374 499 Q 395 477 399 494 Q 400 504 402 516 L 400 542 Q 399 555 396 568 Q 390 590 386 610 L 380 637 Q 367 695 363 719 C 358 749 333 757 303 760 Z","M 619 544 Q 619 540 621 533 Q 627 517 640 517 Q 655 518 663 533 Q 676 549 703 628 Q 722 683 763 713 Q 784 729 767 747 Q 748 766 696 796 Q 681 805 610 792 Q 574 792 442 769 Q 351 756 303 760 C 273 761 333 715 363 719 Q 370 719 376 720 Q 449 741 619 755 Q 649 756 659 751 Q 669 744 662 712 Q 635 594 624 570 Q 623 570 623 569 C 616 552 616 552 619 544 Z","M 386 610 Q 390 609 399 610 Q 505 629 582 640 Q 606 644 597 656 Q 587 671 561 676 Q 545 679 380 637 C 351 630 356 612 386 610 Z","M 402 516 Q 406 516 414 517 Q 532 535 619 544 C 649 547 652 560 623 569 Q 599 582 409 544 Q 405 544 400 542 C 371 534 372 514 402 516 Z","M 344 371 Q 362 395 379 415 Q 389 425 377 441 Q 337 477 314 475 Q 304 474 304 459 Q 310 384 214 281 Q 208 281 174 243 Q 165 230 180 233 Q 196 234 217 248 Q 284 291 326 347 L 344 371 Z","M 542 350 Q 602 360 666 368 Q 724 378 733 385 Q 742 392 738 400 Q 732 413 704 421 Q 676 428 646 419 Q 595 406 543 393 L 488 384 Q 419 375 344 371 C 314 369 298 357 326 347 Q 368 329 440 336 Q 462 339 489 342 L 542 350 Z","M 536 199 Q 545 202 669 215 Q 679 214 688 226 Q 689 238 667 248 Q 630 270 543 245 Q 540 245 538 244 L 487 234 Q 472 233 341 216 Q 313 213 334 196 Q 367 168 395 176 Q 437 185 487 191 L 536 199 Z","M 532 79 Q 533 142 536 199 L 538 244 Q 539 299 542 350 L 543 393 Q 543 412 546 443 Q 553 462 544 473 Q 519 497 496 508 Q 483 512 474 507 Q 464 503 468 492 Q 487 453 488 384 L 489 342 Q 488 300 487 234 L 487 191 Q 486 140 486 76 C 486 46 531 49 532 79 Z","M 486 76 Q 407 72 331 58 Q 187 37 127 40 Q 117 41 109 35 Q 100 28 107 17 Q 117 2 173 -29 Q 188 -35 209 -27 Q 444 57 632 44 Q 750 40 918 7 Q 937 3 945 12 Q 952 24 933 41 Q 852 107 812 97 Q 794 94 543 80 Q 537 80 532 79 L 486 76 Z"],"medians":[[[296,749],[338,699],[387,499]],[[320,756],[368,740],[624,776],[683,769],[712,731],[685,672],[641,537]],[[393,619],[400,627],[446,638],[550,656],[587,650]],[[407,523],[424,535],[450,540],[606,557],[618,563]],[[317,462],[330,446],[338,422],[316,380],[260,304],[184,242]],[[334,351],[493,363],[682,398],[725,396]],[[336,207],[386,198],[611,234],[677,228]],[[477,497],[492,488],[515,455],[510,103],[493,84]],[[116,25],[188,5],[372,44],[464,57],[558,66],[682,66],[837,59],[934,19]]],"radStrokes":[0,1,2,3]},"光":{"strokes":["M 517 448 Q 541 721 558 764 Q 562 777 540 793 Q 501 815 475 820 Q 457 824 448 815 Q 439 806 448 790 Q 470 759 470 737 Q 477 601 470 441 C 469 411 514 418 517 448 Z","M 298 572 Q 337 517 375 495 Q 391 491 402 505 Q 411 518 409 538 Q 397 589 316 613 L 315 614 Q 297 621 286 617 Q 279 616 281 602 Q 282 589 298 572 Z","M 672 660 Q 656 636 576 548 Q 563 529 583 532 Q 634 556 717 605 Q 739 621 769 632 Q 794 642 783 664 Q 770 685 740 703 Q 713 721 698 718 Q 683 718 687 702 Q 690 680 672 660 Z","M 550 412 Q 646 422 777 423 Q 850 423 856 433 Q 862 446 844 461 Q 789 500 747 492 Q 659 473 517 448 L 470 441 Q 331 422 169 400 Q 147 397 164 379 Q 179 364 198 359 Q 220 353 238 359 Q 388 401 506 408 L 550 412 Z","M 368 357 Q 369 188 110 15 Q 100 8 107 4 Q 116 0 128 4 Q 189 22 244 57 Q 340 114 418 260 Q 431 284 449 306 Q 459 316 453 328 Q 447 340 416 362 Q 394 378 383 376 Q 368 373 368 357 Z","M 962 51 Q 940 109 929 210 Q 926 229 918 234 Q 908 240 905 217 Q 889 93 870 69 Q 840 35 713 30 Q 644 30 614 41 Q 587 54 582 71 Q 570 104 573 190 Q 580 286 600 329 Q 615 363 593 383 Q 568 402 550 412 C 525 428 497 437 506 408 Q 528 339 526 299 Q 517 283 521 142 Q 521 43 564 10 Q 619 -32 817 -25 Q 907 -21 942 -2 Q 976 16 962 51 Z"],"medians":[[[461,803],[511,760],[498,490],[495,469],[477,449]],[[293,606],[372,540],[382,517]],[[696,707],[717,683],[724,661],[639,585],[578,540]],[[167,389],[219,381],[390,413],[757,458],[808,452],[847,440]],[[385,359],[406,318],[369,234],[334,178],[247,88],[174,38],[113,8]],[[514,400],[543,383],[564,350],[551,270],[545,156],[556,68],[571,39],[613,14],[667,5],[759,2],[846,13],[902,33],[912,40],[914,54],[915,225]]]},"明":{"strokes":["M 191 698 Q 190 699 189 700 Q 161 721 144 713 Q 137 709 143 696 Q 144 687 149 678 Q 177 630 156 403 Q 132 315 168 267 L 170 265 Q 180 252 191 265 Q 198 277 205 323 L 206 358 Q 206 425 207 493 L 208 524 Q 209 641 212 651 Q 213 663 212 670 C 212 683 212 683 191 698 Z","M 322 335 Q 346 304 363 275 Q 370 259 381 260 Q 396 261 410 290 Q 426 324 423 366 Q 416 460 412 634 Q 411 662 426 681 Q 433 691 426 701 Q 410 719 363 740 Q 347 747 333 740 Q 291 719 191 698 C 162 692 182 665 212 670 Q 227 671 247 677 Q 343 696 351 691 Q 375 670 359 376 Q 358 373 358 369 Q 357 363 354 360 C 346 331 304 359 322 335 Z","M 207 493 Q 268 502 312 511 Q 334 515 326 528 Q 314 543 288 545 Q 248 548 208 524 C 182 509 177 489 207 493 Z","M 205 323 Q 211 323 219 324 Q 253 331 322 335 C 352 337 376 340 354 360 Q 347 367 334 375 Q 318 385 287 376 Q 244 366 206 358 C 177 352 175 322 205 323 Z","M 586 396 Q 586 400 587 403 Q 597 469 602 551 L 604 581 Q 610 711 613 724 C 616 753 616 753 608 757 Q 604 761 599 763 Q 550 788 535 785 Q 514 781 531 759 Q 568 690 545 442 Q 538 340 484 220 Q 444 127 324 16 Q 309 3 306 -4 Q 305 -11 316 -10 Q 362 -10 454 91 Q 553 203 581 369 L 586 396 Z","M 613 724 Q 617 727 625 728 Q 682 740 737 753 Q 759 757 764 746 Q 782 701 789 376 Q 790 115 778 95 Q 774 88 754 93 Q 720 103 684 114 Q 663 121 664 111 Q 731 54 769 13 Q 782 -8 799 -12 Q 809 -16 818 -6 Q 860 52 858 103 Q 842 311 834 648 Q 831 709 846 736 Q 858 757 845 768 Q 823 787 783 802 Q 764 809 747 801 Q 693 771 608 757 C 579 751 584 717 613 724 Z","M 602 551 Q 626 545 732 566 Q 748 570 751 572 Q 758 579 755 586 Q 748 596 723 602 Q 705 605 637 587 Q 619 586 604 581 C 575 572 572 556 602 551 Z","M 581 369 Q 608 360 733 381 Q 752 385 755 388 Q 762 395 759 402 Q 752 412 727 418 Q 702 424 676 414 Q 654 407 631 402 Q 609 398 586 396 C 556 393 552 376 581 369 Z"],"medians":[[[152,704],[170,688],[185,658],[188,538],[176,353],[181,270]],[[201,698],[220,688],[350,718],[376,704],[390,687],[391,368],[379,327],[381,276]],[[215,501],[225,514],[270,525],[316,522]],[[212,329],[229,345],[346,359]],[[536,772],[576,735],[581,666],[572,468],[547,318],[503,205],[460,133],[388,51],[335,7],[313,-3]],[[618,730],[624,743],[760,779],[792,764],[806,742],[820,210],[818,88],[806,60],[794,52],[767,59],[674,108]],[[606,558],[652,573],[744,581]],[[586,375],[599,382],[708,399],[748,397]]],"radStrokes":[0,1,2,3]},"亮":{"strokes":["M 467 804 Q 518 758 558 742 Q 574 741 583 756 Q 587 771 583 788 Q 565 831 501 842 Q 462 851 448 845 Q 442 844 446 830 Q 449 817 467 804 Z","M 252 669 Q 231 668 247 651 Q 260 638 278 632 Q 297 628 314 632 Q 480 677 779 677 Q 798 677 803 686 Q 809 696 792 710 Q 741 747 705 739 Q 600 717 252 669 Z","M 393 584 Q 383 588 358 592 Q 348 595 345 590 Q 339 584 347 570 Q 368 533 382 469 Q 386 450 397 438 Q 413 419 418 433 Q 421 440 421 451 L 418 481 Q 409 536 408 555 C 406 580 406 580 393 584 Z","M 631 506 Q 652 548 677 563 Q 693 579 680 596 Q 664 609 618 632 Q 602 639 582 633 Q 536 614 491 603 Q 443 593 393 584 C 363 579 379 549 408 555 Q 417 556 428 560 Q 500 573 568 587 Q 586 591 593 584 Q 599 572 582 513 C 574 484 617 479 631 506 Z","M 421 451 Q 430 450 440 452 Q 503 465 640 476 Q 650 477 651 485 Q 651 492 631 506 L 582 513 Q 581 513 580 513 Q 490 492 418 481 C 388 476 391 452 421 451 Z","M 255 369 Q 254 372 254 374 Q 241 399 229 407 Q 210 422 208 395 Q 214 362 178 319 Q 136 273 165 220 Q 165 219 167 215 Q 183 188 203 217 Q 219 241 229 276 Q 239 310 248 332 C 258 358 258 358 255 369 Z","M 248 332 Q 272 322 304 331 Q 424 367 674 395 Q 726 401 743 397 Q 762 384 758 375 Q 758 374 733 299 Q 726 286 733 281 Q 740 277 758 290 Q 812 330 857 344 Q 894 357 894 366 Q 893 376 816 430 Q 792 448 705 432 Q 618 423 355 382 Q 306 375 255 369 C 225 365 219 339 248 332 Z","M 434 286 Q 428 290 419 293 Q 391 306 377 301 Q 367 297 375 282 Q 402 147 321 48 Q 320 48 319 46 Q 297 22 242 -12 Q 221 -25 248 -23 Q 281 -26 340 10 Q 415 50 443 234 Q 444 247 447 256 C 452 277 452 277 434 286 Z","M 447 256 Q 466 257 482 265 Q 510 275 540 283 Q 558 289 563 282 Q 569 278 566 257 Q 538 88 584 18 Q 641 -57 788 -43 Q 858 -36 914 -4 Q 936 9 924 34 Q 896 91 889 155 Q 885 164 879 164 Q 876 164 869 150 Q 845 60 818 38 Q 758 11 670 23 Q 649 27 637 39 Q 613 58 605 104 Q 596 150 614 216 Q 624 253 647 274 Q 663 286 651 300 Q 636 316 601 330 Q 576 340 560 330 Q 526 308 434 286 C 405 279 418 250 447 256 Z"],"medians":[[[455,836],[526,800],[563,765]],[[249,660],[280,652],[305,653],[438,677],[721,709],[791,692]],[[353,583],[374,567],[384,549],[408,438]],[[401,582],[418,573],[582,611],[600,610],[614,603],[634,579],[616,536],[590,523]],[[426,459],[436,468],[576,492],[642,485]],[[219,400],[231,367],[222,335],[191,274],[183,219]],[[256,337],[273,349],[433,379],[742,418],[786,404],[807,376],[738,288]],[[383,291],[402,274],[413,253],[408,186],[390,117],[372,78],[340,36],[295,3],[253,-13]],[[445,285],[457,274],[555,306],[579,306],[597,293],[604,282],[591,242],[579,164],[584,87],[608,30],[633,8],[666,-6],[757,-13],[818,-2],[854,14],[873,29],[876,136],[882,157]]],"radStrokes":[0,1]},"亲":{"strokes":["M 450 784 Q 481 762 514 737 Q 530 725 546 728 Q 556 729 561 744 Q 564 760 551 790 Q 536 821 438 833 Q 422 834 416 831 Q 412 827 414 813 Q 418 803 450 784 Z","M 308 677 Q 271 673 296 654 Q 338 630 412 641 Q 529 659 652 677 Q 712 687 721 695 Q 731 702 726 712 Q 719 725 691 733 Q 654 742 573 715 Q 443 685 308 677 Z","M 331 569 Q 373 487 397 481 Q 410 477 419 493 Q 423 505 419 526 Q 412 545 390 560 Q 356 587 340 593 Q 333 597 329 586 Q 325 579 331 569 Z","M 564 464 Q 649 575 667 592 Q 683 602 676 613 Q 669 631 642 653 Q 630 665 613 661 Q 603 657 607 646 Q 614 610 542 486 Q 532 471 530 459 C 522 430 546 440 564 464 Z","M 494 420 Q 581 430 845 430 Q 866 430 871 439 Q 877 451 860 465 Q 806 507 767 498 Q 686 482 564 464 L 530 459 Q 508 458 487 454 Q 330 435 145 415 Q 123 414 139 395 Q 154 380 172 375 Q 194 369 211 373 Q 371 415 454 415 L 494 420 Z","M 530 281 Q 600 288 695 288 Q 749 288 755 297 Q 759 307 745 319 Q 696 356 634 338 Q 589 331 531 319 L 481 310 Q 477 311 475 310 Q 369 294 243 276 Q 224 275 238 259 Q 251 246 267 242 Q 286 238 300 242 Q 378 264 482 276 L 530 281 Z","M 442 60 Q 399 67 358 76 Q 345 77 347 70 Q 348 64 359 57 Q 446 2 479 -36 Q 492 -52 507 -38 Q 540 -4 536 62 Q 533 93 530 281 L 531 319 Q 532 346 541 365 Q 550 383 534 395 Q 515 411 494 420 C 467 433 440 441 454 415 Q 455 411 460 404 Q 479 371 481 310 L 482 276 Q 483 78 466 63 Q 456 56 442 60 Z","M 327 203 Q 285 154 236 115 Q 209 97 213 55 Q 214 36 238 41 Q 301 63 333 143 Q 348 171 349 196 Q 348 205 342 208 Q 335 209 327 203 Z","M 618 177 Q 676 128 744 57 Q 760 38 777 33 Q 786 32 793 43 Q 805 56 791 101 Q 775 159 622 208 Q 619 209 618 209 Q 609 213 607 201 Q 607 188 618 177 Z"],"medians":[[[422,825],[508,783],[542,747]],[[300,667],[369,659],[665,708],[715,706]],[[340,581],[388,527],[402,499]],[[616,651],[626,642],[638,611],[560,482],[535,464]],[[142,405],[202,396],[394,428],[777,465],[824,458],[859,445]],[[240,268],[285,261],[397,282],[660,316],[694,315],[747,302]],[[461,412],[491,396],[508,370],[507,140],[497,38],[487,21],[458,26],[354,70]],[[337,197],[307,144],[246,80],[230,55]],[[617,198],[740,113],[764,83],[778,50]]],"radStrokes":[0,1,2,3,4]},"爱":{"strokes":["M 517 808 Q 466 771 334 728 Q 328 719 334 716 Q 358 709 501 742 Q 564 763 615 767 Q 633 766 637 774 Q 641 784 631 796 Q 577 844 543 845 Q 536 842 533 832 Q 532 817 517 808 Z","M 319 634 Q 338 613 358 588 Q 368 575 382 574 Q 392 574 397 585 Q 403 597 398 624 Q 392 648 319 676 Q 306 680 300 679 Q 296 676 295 664 Q 298 654 319 634 Z","M 448 676 Q 481 607 508 600 Q 521 596 531 614 Q 535 627 529 648 Q 522 664 502 676 Q 471 697 457 702 Q 448 705 445 694 Q 442 685 448 676 Z","M 641 701 Q 635 689 574 605 Q 565 589 580 593 Q 626 621 679 664 Q 695 679 715 688 Q 734 698 723 713 Q 711 728 688 739 Q 666 749 656 747 Q 644 746 649 733 Q 653 717 641 701 Z","M 246 511 Q 246 533 221 552 Q 202 567 199 540 Q 205 510 166 459 Q 133 423 135 402 Q 141 369 151 351 Q 167 323 187 352 Q 205 377 217 415 Q 229 452 239 477 L 246 511 Z","M 464 516 Q 710 561 755 551 Q 770 544 768 537 Q 768 533 730 462 Q 723 449 729 445 Q 736 441 753 451 Q 810 487 856 497 Q 895 507 894 516 Q 893 526 823 580 Q 799 601 725 584 Q 614 571 351 526 Q 299 519 246 511 C 216 507 210 484 239 477 Q 261 468 284 474 Q 353 496 428 510 L 464 516 Z","M 460 383 Q 499 392 666 418 Q 676 417 685 430 Q 686 442 663 451 Q 633 475 569 451 Q 527 442 484 430 L 409 414 Q 391 413 374 409 Q 334 403 288 397 Q 260 393 282 376 Q 315 352 346 359 Q 365 365 391 369 L 460 383 Z","M 419 301 Q 437 335 454 369 Q 457 376 460 383 L 484 430 Q 487 437 492 443 Q 505 453 502 468 Q 493 486 464 516 C 444 538 425 540 428 510 Q 435 486 420 441 Q 414 429 410 415 Q 409 415 409 414 L 391 369 Q 312 195 204 106 Q 177 81 151 59 Q 144 55 140 49 Q 134 39 145 38 Q 181 35 284 121 Q 293 131 303 140 Q 345 182 403 273 L 419 301 Z","M 570 131 Q 598 171 620 227 Q 630 260 651 275 Q 667 288 651 304 Q 632 322 602 337 Q 581 347 560 337 Q 502 310 423 302 Q 420 302 419 301 C 389 297 373 277 403 273 Q 425 266 458 275 Q 504 284 551 293 Q 567 299 568 279 Q 568 225 529 161 L 506 130 Q 490 112 471 95 Q 413 52 266 17 Q 250 16 259 6 Q 266 -1 294 0 Q 390 9 446 30 Q 501 52 542 97 L 570 131 Z","M 542 97 Q 675 -36 723 -32 Q 805 -25 872 -9 Q 906 -2 903 8 Q 902 12 866 21 Q 685 61 645 83 Q 620 95 570 131 L 529 161 Q 502 182 476 205 Q 437 239 404 236 Q 388 235 385 230 Q 384 223 399 214 Q 435 198 506 130 L 542 97 Z"],"medians":[[[627,780],[561,797],[461,752],[338,722]],[[304,669],[371,616],[382,590]],[[456,690],[499,644],[512,620]],[[660,736],[679,704],[603,622],[585,612],[583,602]],[[211,545],[221,510],[202,458],[172,402],[168,355]],[[248,481],[264,492],[364,514],[466,532],[475,529],[484,536],[499,534],[554,547],[740,570],[785,564],[809,541],[811,529],[734,451]],[[283,387],[337,380],[604,435],[639,438],[674,432]],[[435,506],[455,489],[463,464],[419,361],[367,263],[321,197],[262,129],[188,70],[148,46]],[[410,275],[433,287],[574,316],[594,305],[607,284],[580,201],[560,162],[528,118],[490,80],[410,39],[354,23],[265,10]],[[391,228],[421,220],[458,198],[586,87],[682,26],[720,11],[898,6]]],"radStrokes":[0,1,2,3]},"师":{"strokes":["M 179 617 Q 209 536 188 411 Q 169 342 199 311 Q 209 299 216 311 Q 237 338 237 461 Q 237 566 242 592 Q 243 607 230 615 Q 211 630 188 636 Q 181 637 175 631 Q 172 627 179 617 Z","M 330 721 Q 366 661 350 435 Q 346 344 299 233 Q 269 155 159 45 Q 144 32 141 25 Q 140 18 152 18 Q 168 18 190 34 Q 247 74 280 113 Q 352 198 381 314 Q 411 470 411 662 Q 415 684 416 695 Q 422 717 400 727 Q 349 751 333 748 Q 312 744 330 721 Z","M 653 665 Q 678 671 857 700 Q 867 699 877 712 Q 878 725 854 735 Q 817 756 758 735 Q 632 704 571 694 Q 531 690 488 682 Q 458 678 481 660 Q 520 636 549 643 Q 571 649 599 654 L 653 665 Z","M 509 492 Q 509 493 508 493 Q 483 505 466 504 Q 454 500 460 489 Q 493 426 464 315 Q 440 281 474 236 Q 474 235 477 231 Q 483 219 492 225 Q 516 243 520 319 Q 521 428 524 456 C 526 483 526 483 509 492 Z","M 675 481 Q 718 488 762 492 Q 795 496 798 474 Q 810 327 792 306 Q 783 297 720 301 Q 704 302 701 297 Q 698 291 711 283 Q 772 250 809 223 Q 825 211 836 226 Q 857 259 859 324 Q 853 436 861 483 Q 864 504 854 513 Q 826 538 806 548 Q 793 554 783 545 Q 777 536 678 516 Q 675 516 675 515 L 626 507 Q 581 503 509 492 C 479 488 494 452 524 456 Q 530 456 537 457 Q 580 467 626 474 L 675 481 Z","M 622 -7 Q 628 -32 634 -41 Q 640 -48 647 -46 Q 665 -34 668 21 Q 677 105 675 188 Q 671 252 675 481 L 675 515 Q 675 566 688 623 Q 691 641 677 650 Q 664 660 653 665 C 627 680 586 681 599 654 Q 623 606 626 576 Q 625 575 626 571 Q 626 541 626 507 L 626 474 Q 620 12 622 -7 Z"],"medians":[[[184,626],[202,611],[215,584],[217,449],[205,354],[208,314]],[[335,734],[363,714],[380,686],[381,521],[373,412],[361,340],[342,270],[292,167],[251,113],[201,62],[149,26]],[[483,672],[532,665],[800,718],[866,714]],[[467,495],[491,476],[499,453],[498,353],[485,282],[486,233]],[[518,489],[540,477],[786,517],[806,514],[816,506],[829,483],[831,334],[816,276],[811,271],[787,273],[706,295]],[[607,648],[651,626],[653,604],[643,-36]]]},"学":{"strokes":["M 311 681 Q 332 656 354 626 Q 364 611 380 610 Q 390 609 397 621 Q 404 634 399 664 Q 395 694 313 727 Q 298 733 292 731 Q 288 728 287 715 Q 288 705 311 681 Z","M 456 744 Q 475 717 495 685 Q 504 672 517 669 Q 526 668 533 677 Q 540 689 539 715 Q 536 745 462 785 Q 450 792 444 791 Q 440 788 438 777 Q 439 767 456 744 Z","M 669 770 Q 642 724 586 650 Q 580 643 587 635 Q 594 634 603 639 Q 700 721 749 752 Q 768 759 763 770 Q 756 786 734 806 Q 712 824 688 825 Q 672 824 674 802 Q 678 787 669 770 Z","M 241 550 Q 231 569 222 576 Q 203 589 201 564 Q 207 527 148 466 Q 129 445 155 387 Q 170 360 190 388 Q 217 454 246 522 C 251 533 251 533 241 550 Z","M 246 522 Q 276 504 310 515 Q 472 560 708 577 Q 745 580 761 577 Q 776 570 775 563 Q 775 562 727 483 Q 720 470 725 464 Q 732 460 750 470 Q 813 507 862 516 Q 904 526 903 536 Q 902 546 832 605 Q 808 626 745 613 Q 598 600 365 564 Q 307 555 248 551 Q 244 551 241 550 C 211 547 218 534 246 522 Z","M 516 320 Q 519 321 599 382 Q 636 410 663 419 Q 682 425 676 441 Q 673 457 610 492 Q 592 502 570 494 Q 510 472 420 447 Q 396 440 339 442 Q 317 443 324 423 Q 331 411 350 400 Q 378 384 411 402 Q 433 411 546 449 Q 559 455 570 448 Q 582 441 576 427 Q 546 382 508 326 C 493 304 493 304 516 320 Z","M 538 295 Q 529 310 516 320 L 508 326 Q 502 330 498 332 Q 488 339 483 331 Q 479 327 486 314 Q 490 304 495 290 L 506 247 Q 518 163 508 105 Q 502 68 492 60 Q 489 57 408 73 Q 398 76 392 72 Q 388 71 402 59 Q 454 11 482 -28 Q 498 -46 516 -37 Q 538 -25 555 27 Q 579 117 557 250 L 538 295 Z","M 557 250 Q 701 269 878 253 Q 902 250 908 259 Q 915 272 903 284 Q 875 312 831 332 Q 816 338 790 330 Q 742 321 538 295 L 495 290 Q 384 281 328 274 Q 264 264 170 264 Q 157 264 155 253 Q 154 240 173 226 Q 189 213 220 201 Q 232 197 249 205 Q 265 211 332 221 Q 408 239 506 247 L 557 250 Z"],"medians":[[[296,725],[307,710],[358,671],[381,628]],[[447,782],[500,728],[518,686]],[[690,808],[712,774],[619,668],[590,643]],[[212,568],[221,546],[220,525],[175,444],[171,391]],[[245,544],[279,532],[586,582],[759,597],[800,586],[821,553],[730,469]],[[334,430],[355,420],[383,417],[557,471],[593,467],[617,442],[615,437],[577,388],[514,326]],[[491,326],[514,296],[534,237],[540,136],[528,53],[504,17],[396,71]],[[168,251],[231,233],[449,265],[815,296],[896,268]]],"radStrokes":[5,6,7]},"生":{"strokes":["M 324 495 Q 328 502 332 509 Q 357 558 382 599 Q 392 615 375 630 Q 318 663 296 657 Q 283 654 287 638 Q 308 536 204 397 Q 200 396 160 342 Q 153 324 169 330 Q 188 334 213 357 Q 273 409 311 471 L 324 495 Z","M 556 479 Q 748 518 754 521 Q 764 530 759 539 Q 752 552 721 561 Q 688 568 656 557 Q 607 544 558 529 L 500 516 Q 418 501 324 495 C 294 493 284 484 311 471 L 312 471 Q 351 447 432 459 Q 463 465 499 469 L 556 479 Z","M 549 276 Q 702 307 710 313 Q 720 322 715 331 Q 708 344 676 353 Q 649 359 551 329 L 495 315 Q 428 303 347 295 Q 308 291 336 271 Q 378 244 484 265 Q 488 266 495 267 L 549 276 Z","M 543 92 Q 546 186 549 276 L 551 329 Q 552 405 556 479 L 558 529 Q 567 718 580 760 Q 593 782 578 797 Q 538 828 506 838 Q 490 842 473 829 Q 467 820 474 808 Q 507 751 504 688 Q 503 604 500 516 L 499 469 Q 498 394 495 315 L 495 267 Q 492 179 492 86 C 492 56 542 62 543 92 Z","M 492 86 Q 330 70 144 51 Q 119 48 137 27 Q 173 -9 220 1 Q 520 73 900 54 Q 901 54 904 54 Q 929 53 935 63 Q 942 78 922 95 Q 856 144 785 129 Q 688 113 543 92 L 492 86 Z"],"medians":[[[299,644],[334,603],[309,529],[279,467],[247,420],[219,385],[171,341]],[[320,474],[402,478],[502,492],[690,536],[750,531]],[[338,285],[366,278],[417,279],[558,302],[664,328],[703,325]],[[486,820],[518,796],[535,776],[538,759],[518,115],[498,94]],[[141,39],[198,27],[411,58],[811,95],[886,85],[923,70]]]},"知":{"strokes":["M 271 565 Q 304 608 327 654 Q 354 709 380 754 Q 390 767 373 782 Q 327 815 299 809 Q 287 805 291 790 Q 312 679 194 529 Q 188 526 144 469 Q 137 453 152 458 Q 188 468 259 549 L 271 565 Z","M 373 537 Q 535 579 540 583 Q 549 592 544 600 Q 537 612 506 618 Q 475 622 444 609 Q 410 596 370 584 Q 327 574 276 566 Q 273 566 271 565 C 245 560 245 560 259 549 Q 278 530 326 529 L 373 537 Z","M 387 342 Q 454 358 535 369 Q 553 370 554 379 Q 555 392 536 403 Q 500 418 395 388 L 338 376 Q 191 345 98 334 Q 85 333 81 324 Q 77 312 94 300 Q 139 270 181 285 Q 268 315 329 329 L 387 342 Z","M 329 329 Q 293 152 119 41 Q 106 31 119 28 Q 134 28 169 43 Q 224 68 264 108 Q 310 148 333 193 Q 343 214 353 233 Q 377 284 387 342 L 395 388 Q 407 460 421 486 Q 430 505 413 514 Q 398 524 373 537 C 347 551 315 557 326 529 Q 326 526 329 520 Q 350 484 338 376 L 329 329 Z","M 410 240 Q 447 197 492 135 Q 505 113 520 107 Q 529 106 537 114 Q 550 126 543 170 Q 537 212 476 242 Q 436 261 414 271 Q 407 277 403 265 Q 402 252 410 240 Z","M 601 466 Q 591 472 564 478 Q 551 482 547 477 Q 540 470 548 453 Q 582 362 596 218 Q 597 175 620 145 Q 636 121 643 137 Q 652 159 649 197 L 645 235 Q 623 392 619 434 C 616 459 616 459 601 466 Z","M 848 260 Q 869 398 912 442 Q 930 463 913 481 Q 826 541 775 510 Q 706 485 601 466 C 572 461 589 432 619 434 Q 635 434 656 440 Q 798 467 805 460 Q 821 447 819 419 Q 810 335 796 267 C 790 238 843 230 848 260 Z","M 649 197 Q 658 196 670 198 Q 731 211 862 221 Q 874 222 876 233 Q 876 242 848 260 L 796 267 Q 792 268 788 266 Q 709 245 645 235 C 615 230 619 198 649 197 Z"],"medians":[[[303,796],[335,756],[307,672],[238,553],[153,467]],[[267,550],[330,552],[382,561],[460,588],[510,596],[534,593]],[[93,319],[126,311],[166,312],[452,380],[519,387],[542,382]],[[334,527],[368,504],[379,486],[357,326],[333,250],[286,164],[226,99],[170,58],[123,35]],[[413,260],[498,186],[515,157],[522,122]],[[554,469],[581,443],[593,410],[632,143]],[[610,464],[634,453],[809,491],[851,470],[862,457],[827,289],[803,273]],[[654,204],[666,218],[786,240],[839,241],[866,233]]],"radStrokes":[0,1,2,3,4]},"道":{"strokes":["M 482 766 Q 533 697 557 694 Q 570 693 577 709 Q 580 722 571 742 Q 562 758 539 769 Q 503 788 488 791 Q 479 792 478 782 Q 477 775 482 766 Z","M 699 802 Q 684 772 633 701 Q 626 685 641 690 Q 686 720 740 764 Q 756 780 777 791 Q 796 801 785 817 Q 772 832 747 843 Q 725 853 713 850 Q 701 849 706 836 Q 710 820 699 802 Z","M 598 615 Q 682 630 819 635 Q 868 635 876 645 Q 880 655 865 667 Q 814 703 747 682 Q 597 651 398 616 Q 379 613 394 599 Q 407 587 423 583 Q 442 579 457 584 Q 508 600 566 609 L 598 615 Z","M 576 516 Q 589 529 602 546 Q 609 553 619 562 Q 632 571 626 581 Q 620 596 598 615 C 575 635 565 639 566 609 Q 569 594 537 508 C 527 480 555 495 576 516 Z","M 506 502 Q 505 505 500 506 Q 493 513 480 517 Q 471 521 461 518 Q 455 514 460 502 Q 475 439 475 353 Q 474 340 474 323 Q 474 292 464 252 Q 451 203 483 165 Q 493 153 502 164 Q 509 174 511 186 L 515 219 Q 515 256 515 294 L 515 320 Q 516 357 517 385 L 518 406 Q 519 458 521 463 Q 522 470 522 475 C 523 489 523 489 506 502 Z","M 686 203 Q 713 169 733 135 Q 742 119 753 119 Q 768 120 783 152 Q 799 189 795 233 Q 788 308 779 446 Q 778 474 793 495 Q 802 507 793 516 Q 775 534 728 555 Q 712 564 697 555 Q 654 534 587 519 Q 580 518 576 516 L 537 508 Q 518 505 506 502 C 477 496 493 468 522 475 Q 534 478 551 482 Q 620 495 678 510 Q 702 514 713 506 Q 743 470 727 238 Q 727 237 727 235 Q 723 216 705 225 Q 704 226 701 227 C 671 232 668 227 686 203 Z","M 517 385 L 664 405 Q 686 409 677 421 Q 667 434 643 438 Q 615 441 518 406 C 490 396 487 381 517 385 Z","M 515 294 Q 519 294 524 294 Q 609 307 671 313 Q 693 317 685 329 Q 675 342 651 348 Q 621 352 515 320 C 486 311 485 294 515 294 Z","M 511 186 Q 518 186 524 187 Q 576 197 686 203 C 716 205 725 208 701 227 Q 671 254 595 232 Q 552 225 515 219 C 485 214 481 185 511 186 Z","M 236 706 Q 261 679 289 647 Q 302 632 319 632 Q 329 631 337 645 Q 343 660 336 692 Q 332 713 301 730 Q 228 766 212 759 Q 206 755 207 742 Q 210 730 236 706 Z","M 302 180 Q 320 190 328 209 Q 340 246 300 309 Q 267 364 346 465 Q 368 483 348 499 Q 329 514 293 528 Q 271 541 253 523 Q 225 502 187 488 Q 136 467 120 470 Q 113 470 110 465 Q 109 461 117 456 Q 154 438 243 470 Q 253 473 262 460 Q 284 438 264 409 Q 218 360 264 289 Q 289 241 288 216 Q 285 200 281 182 C 276 161 278 162 302 180 Z","M 281 182 Q 239 183 200 170 Q 161 157 101 154 Q 94 154 90 146 Q 87 139 95 128 Q 111 109 135 96 Q 147 90 165 103 Q 246 154 315 138 Q 379 125 510 69 Q 735 -33 815 -5 Q 873 16 924 52 Q 946 67 923 66 Q 721 59 562 100 Q 483 122 384 159 Q 344 177 302 180 L 281 182 Z"],"medians":[[[489,779],[541,737],[558,712]],[[718,839],[732,824],[738,805],[643,700]],[[396,608],[440,602],[618,638],[776,661],[812,662],[868,650]],[[572,606],[592,579],[566,534],[554,522],[541,519]],[[467,511],[489,483],[495,454],[495,314],[488,239],[493,170]],[[514,498],[540,493],[713,534],[740,518],[755,501],[761,224],[749,191],[717,199],[700,219]],[[524,390],[530,400],[602,415],[646,421],[668,415]],[[520,301],[552,316],[630,329],[653,330],[675,323]],[[517,191],[530,205],[692,224]],[[217,751],[290,697],[318,652]],[[117,463],[173,465],[263,496],[277,496],[302,477],[297,433],[266,359],[270,323],[302,260],[308,236],[308,212],[287,187]],[[102,142],[145,127],[249,160],[332,156],[594,63],[752,29],[824,33],[914,58]]],"radStrokes":[9,10,11]},"问":{"strokes":["M 313 760 Q 338 729 365 698 Q 386 679 405 677 Q 421 676 429 697 Q 432 713 421 737 Q 409 756 381 768 Q 338 789 319 792 Q 309 795 307 781 Q 304 771 313 760 Z","M 189 661 Q 244 529 205 243 Q 198 197 182 149 Q 163 86 202 42 Q 215 26 227 42 Q 261 84 263 251 Q 263 539 276 625 Q 279 646 260 657 Q 233 679 203 688 Q 191 689 184 680 Q 180 673 189 661 Z","M 518 742 Q 502 742 506 732 Q 513 719 536 709 Q 551 700 574 706 Q 766 761 786 732 Q 796 716 802 657 Q 820 416 807 143 Q 806 103 791 91 Q 772 78 678 103 Q 660 104 662 95 Q 663 88 677 82 Q 759 33 804 -7 Q 826 -28 840 -24 Q 853 -21 864 9 Q 880 57 877 126 Q 856 508 858 651 Q 859 691 871 715 Q 883 737 872 749 Q 862 765 813 789 Q 791 801 728 780 Q 599 750 518 742 Z","M 412 483 Q 399 487 371 493 Q 358 497 355 491 Q 348 485 357 468 Q 385 405 403 303 Q 406 273 423 252 Q 442 230 447 245 Q 453 261 451 286 L 447 320 Q 431 420 429 451 C 427 479 427 479 412 483 Z","M 648 346 Q 672 433 705 458 Q 721 477 707 495 Q 638 552 580 523 Q 508 499 412 483 C 382 478 400 445 429 451 L 585 482 Q 603 486 610 479 Q 620 470 618 450 Q 611 395 598 349 C 590 320 640 317 648 346 Z","M 451 286 Q 455 286 463 287 Q 527 300 663 310 Q 673 311 675 320 Q 675 327 648 346 C 633 357 627 356 598 349 Q 514 330 447 320 C 417 315 421 284 451 286 Z"],"medians":[[[316,783],[387,725],[405,702]],[[195,675],[204,671],[239,626],[242,577],[244,430],[237,263],[213,108],[215,48]],[[516,733],[549,725],[582,727],[687,754],[780,766],[808,757],[832,726],[829,671],[842,224],[837,87],[820,48],[772,56],[670,95]],[[364,483],[389,462],[399,443],[436,252]],[[421,481],[431,473],[449,471],[595,506],[634,500],[660,474],[630,372],[605,354]],[[457,292],[470,307],[603,327],[641,328],[666,319]]],"radStrokes":[0,1,2]},"答":{"strokes":["M 338 714 Q 354 742 370 767 Q 380 780 364 794 Q 316 827 293 822 Q 281 819 285 804 Q 303 708 199 580 Q 189 576 157 528 Q 150 512 164 518 Q 218 530 298 642 Q 322 684 325 690 L 338 714 Z","M 325 690 Q 353 675 424 685 Q 455 691 492 696 Q 511 700 515 702 Q 522 709 519 717 Q 512 727 486 735 Q 470 738 388 721 Q 364 717 338 714 C 308 710 298 703 325 690 Z","M 332 604 Q 356 576 389 556 Q 401 555 408 565 Q 412 575 410 588 Q 406 606 391 615 Q 373 627 341 634 Q 328 638 321 634 Q 317 633 318 624 Q 319 615 332 604 Z","M 639 747 Q 657 774 674 796 Q 684 808 670 822 Q 631 853 605 851 Q 595 850 596 835 Q 609 757 518 652 Q 496 630 485 616 Q 478 601 492 605 Q 507 608 527 623 Q 588 668 625 724 L 639 747 Z","M 625 724 Q 662 706 737 715 Q 774 721 815 726 Q 837 730 842 733 Q 851 740 847 748 Q 840 760 812 768 Q 784 775 754 765 Q 729 758 700 753 Q 672 749 639 747 C 609 745 597 736 625 724 Z","M 626 627 Q 665 582 697 567 Q 710 564 719 577 Q 725 589 722 604 Q 713 641 637 663 Q 621 667 613 663 Q 607 662 610 651 Q 611 641 626 627 Z","M 507 508 Q 534 539 532 548 Q 528 561 501 570 Q 470 582 457 578 Q 450 577 446 562 Q 416 429 93 185 Q 71 169 100 173 Q 224 191 429 416 Q 435 425 490 488 L 507 508 Z","M 490 488 Q 736 239 796 230 Q 889 230 964 249 Q 983 252 985 258 Q 986 265 971 270 Q 764 339 739 351 Q 651 396 563 464 Q 529 492 507 508 C 483 526 469 509 490 488 Z","M 372 326 Q 335 319 363 303 Q 399 284 476 298 Q 518 307 565 318 Q 587 324 592 327 Q 601 336 596 344 Q 589 356 558 362 Q 527 366 497 354 Q 470 345 442 337 Q 411 330 372 326 Z","M 358 194 Q 357 195 356 196 Q 343 203 302 208 Q 289 211 285 205 Q 278 198 289 181 Q 319 129 340 39 Q 344 12 362 -4 Q 383 -28 387 -10 Q 388 -3 390 6 L 387 40 Q 380 62 366 157 C 362 187 361 192 358 194 Z","M 641 70 Q 665 145 694 167 Q 712 188 696 207 Q 609 267 555 237 Q 473 210 358 194 C 328 190 337 150 366 157 Q 373 160 559 193 Q 581 197 589 189 Q 599 182 598 162 Q 592 114 584 73 C 578 44 631 42 641 70 Z","M 390 6 Q 396 5 403 6 Q 482 22 655 34 Q 665 35 667 44 Q 667 51 641 70 C 626 81 613 79 584 73 Q 475 51 387 40 C 357 36 360 7 390 6 Z"],"medians":[[[296,810],[313,794],[326,768],[292,680],[239,598],[166,527]],[[332,694],[477,715],[508,712]],[[327,627],[374,597],[393,574]],[[607,839],[624,821],[633,800],[620,769],[594,719],[559,672],[495,614]],[[632,727],[648,733],[726,735],[779,746],[835,744]],[[620,655],[680,614],[701,586]],[[520,546],[480,537],[402,425],[261,287],[180,225],[103,183]],[[507,499],[527,470],[633,382],[718,321],[771,291],[820,274],[979,259]],[[364,316],[417,311],[525,336],[585,338]],[[294,198],[331,169],[375,-5]],[[365,163],[389,181],[579,220],[606,215],[644,184],[620,101],[591,79]],[[395,35],[405,24],[590,51],[633,52],[658,43]]],"radStrokes":[0,1,2,3,4,5]},"听":{"strokes":["M 134 572 Q 124 576 101 581 Q 88 585 85 580 Q 78 574 86 558 Q 116 485 128 368 Q 129 332 148 308 Q 164 286 171 301 Q 180 322 176 361 L 171 396 Q 155 514 154 544 C 153 566 153 566 134 572 Z","M 314 425 Q 330 521 356 551 Q 378 578 354 592 Q 333 602 305 621 Q 286 631 266 619 Q 223 589 134 572 C 105 566 126 534 154 544 Q 167 550 243 566 Q 268 573 274 562 Q 284 555 276 515 Q 269 472 260 421 C 255 391 309 395 314 425 Z","M 176 361 Q 185 370 334 389 Q 344 390 345 400 Q 345 407 314 425 C 302 432 289 429 260 421 Q 211 408 171 396 C 142 387 149 347 176 361 Z","M 500 623 Q 608 651 684 689 Q 733 710 774 718 Q 792 719 796 728 Q 800 740 786 751 Q 764 767 716 785 Q 700 792 685 791 Q 678 787 677 775 Q 677 739 494 642 C 468 628 471 615 500 623 Z","M 488 492 Q 495 619 500 623 C 503 636 503 636 494 642 Q 491 646 484 650 Q 433 675 417 673 Q 396 669 413 646 Q 455 574 420 347 Q 408 292 382 228 Q 355 165 260 69 Q 245 56 241 49 Q 240 42 252 42 Q 291 42 369 122 Q 465 228 485 453 Q 485 457 486 460 L 488 492 Z","M 695 486 Q 785 499 893 500 Q 912 501 917 510 Q 921 522 905 534 Q 848 573 801 555 Q 708 531 488 492 C 458 487 458 472 486 460 Q 507 448 538 455 Q 581 468 634 476 L 695 486 Z","M 658 -35 Q 664 -60 670 -69 Q 676 -76 683 -74 Q 701 -62 704 -7 Q 711 57 709 120 Q 702 369 720 451 Q 723 469 709 478 Q 702 484 695 486 C 669 501 621 503 634 476 Q 649 457 654 368 Q 655 265 654 117 Q 653 3 658 -35 Z"],"medians":[[[92,572],[114,553],[126,531],[160,308]],[[144,572],[161,562],[275,593],[294,589],[317,566],[292,449],[266,429]],[[179,369],[190,384],[257,400],[309,406],[336,398]],[[784,733],[710,743],[606,679],[521,641],[510,641],[507,630]],[[419,659],[462,621],[463,605],[464,507],[455,407],[435,303],[404,218],[364,151],[304,86],[249,50]],[[495,465],[507,473],[603,493],[816,528],[856,528],[906,515]],[[642,476],[682,444],[679,-64]]],"radStrokes":[0,1,2]},"看":{"strokes":["M 493 738 Q 622 771 657 772 Q 675 771 679 777 Q 685 787 674 800 Q 629 848 588 853 Q 581 850 578 839 Q 574 808 393 748 Q 347 735 291 719 Q 284 712 289 708 Q 307 702 428 726 Q 435 727 444 728 L 493 738 Z","M 478 589 Q 554 605 635 618 Q 690 630 698 637 Q 707 644 703 652 Q 696 664 668 672 Q 640 679 610 668 Q 553 650 495 636 L 429 624 Q 377 617 318 611 Q 282 607 307 590 Q 346 563 401 576 Q 407 577 414 577 L 478 589 Z","M 427 456 Q 463 474 691 483 Q 746 486 809 487 Q 890 487 896 497 Q 902 510 884 525 Q 821 568 756 549 Q 650 528 486 500 Q 464 497 442 492 L 380 484 Q 256 468 117 448 Q 95 445 112 427 Q 127 412 146 407 Q 168 401 186 407 Q 271 432 364 447 L 427 456 Z","M 391 383 Q 410 420 427 456 L 442 492 Q 460 540 478 589 L 495 636 Q 495 637 496 637 Q 503 656 515 676 Q 527 688 523 703 Q 513 722 493 738 C 471 759 442 758 444 728 Q 450 692 434 642 Q 431 635 429 624 L 414 577 Q 398 529 380 484 L 364 447 Q 295 278 154 141 Q 118 104 82 69 Q 75 65 71 58 Q 67 48 77 47 Q 110 46 222 146 Q 252 176 283 212 Q 331 273 374 350 L 391 383 Z","M 417 368 Q 405 378 391 383 C 366 394 369 380 374 350 Q 402 194 368 76 Q 353 27 386 -8 Q 396 -21 405 -8 Q 415 4 420 26 L 426 59 Q 429 89 430 127 L 430 152 Q 430 189 431 228 L 431 254 Q 431 317 435 337 C 437 353 437 353 417 368 Z","M 604 46 Q 637 9 660 -28 Q 670 -46 681 -45 Q 697 -44 711 -9 Q 727 30 723 76 Q 713 157 702 306 Q 701 337 716 360 Q 725 373 715 382 Q 696 401 644 424 Q 625 433 611 423 Q 554 396 417 368 C 388 362 405 332 435 337 Q 453 338 597 372 Q 619 376 631 368 Q 650 352 651 79 Q 651 78 651 76 Q 648 66 640 63 C 624 38 589 63 604 46 Z","M 431 228 Q 435 227 444 228 Q 526 243 587 251 Q 609 255 601 268 Q 591 283 565 287 Q 540 290 431 254 C 403 245 401 231 431 228 Z","M 430 127 Q 436 126 448 127 Q 530 140 590 148 Q 614 152 605 164 Q 595 179 569 183 Q 547 187 430 152 C 401 143 400 129 430 127 Z","M 420 26 Q 426 26 432 27 Q 487 39 604 46 C 634 48 652 49 640 63 Q 636 70 616 84 Q 601 93 572 86 Q 493 68 426 59 C 396 55 390 24 420 26 Z"],"medians":[[[670,784],[605,805],[499,761],[389,730],[293,713]],[[309,602],[334,595],[388,595],[646,648],[691,648]],[[115,437],[167,429],[515,490],[793,521],[851,515],[888,504]],[[451,723],[483,697],[481,687],[410,484],[349,355],[277,243],[231,188],[148,106],[80,56]],[[395,374],[406,327],[409,264],[407,160],[393,37],[396,-4]],[[428,367],[437,359],[456,358],[629,399],[655,386],[673,367],[687,67],[675,31],[613,43]],[[438,235],[448,245],[523,262],[556,267],[591,262]],[[434,133],[447,144],[527,159],[573,165],[595,158]],[[426,31],[440,45],[477,52],[584,67],[632,64]]],"radStrokes":[4,5,6,7,8]}};

'use strict';
/* ============================================================
   乐学二年级 · 单文件离线版（数据仅保存在本设备浏览器中）
   ============================================================ */

/* ---------- 小工具 ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function todayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return todayStr(d); }
const CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十'];
function toCn(n) {
  if (n <= 10) return CN_NUM[n];
  if (n < 20) return '十' + (n % 10 ? CN_NUM[n % 10] : '');
  return CN_NUM[Math.floor(n / 10)] + '十' + (n % 10 ? CN_NUM[n % 10] : '');
}
function kjText(a, b) { const p = a * b; if (p < 10) return toCn(a) + toCn(b) + '得' + toCn(p); if (p === 10) return toCn(a) + toCn(b) + '一十'; return toCn(a) + toCn(b) + toCn(p); }

/* ---------- 本地存储 ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const K_SET = 'lx2.settings', K_KIDS = 'lx2.children', K_ACT = 'lx2.active', K_C = id => 'lx2.c.' + id;

let settings = Object.assign({ sound: true, tts: true, rate: 0.95, pinyin: true, restMin: 20, dayLimit: 45 }, LS.get(K_SET, {}));
function saveSettings() { LS.set(K_SET, settings); }

let children = LS.get(K_KIDS, []);      // [{id,name,av,created}]
let activeId = LS.get(K_ACT, null);
let child = null, cdata = null;         // 当前孩子及其数据

function newChildData() {
  return { stars: 0, days: {}, wrong: [], checkins: {}, medals: [], readOnce: [], poemDone: [], xpoem: [],
           chars: {}, counters: { calc: 0, redoOk: 0 }, extraMin: 0, extDate: '',
           calcMax: 0, dictChars: [], works: [], workBonus: '' };
}
function saveChild() { if (child) LS.set(K_C(child.id), cdata); }
function loadChild(id) {
  child = children.find(k => k.id === id) || null;
  activeId = child ? child.id : null; LS.set(K_ACT, activeId);
  cdata = child ? Object.assign(newChildData(), LS.get(K_C(child.id), {})) : null;
}
function day() {
  const t = todayStr();
  if (!cdata.days[t]) cdata.days[t] = { min: 0, calc: 0, read: 0, chars: 0, q: 0, c: 0, byKp: {} };
  return cdata.days[t];
}
function statKp(kp, ok) {
  const d = day(); d.q++; if (ok) d.c++;
  d.byKp[kp] = d.byKp[kp] || { q: 0, c: 0 };
  d.byKp[kp].q++; if (ok) d.byKp[kp].c++;
  saveChild();
}
function addStars(n, silent) {
  cdata.stars += n; $('#starN').textContent = cdata.stars; saveChild();
  if (!silent) toast('⭐ +' + n);
}
function streak() {
  let s = 0; const d = new Date();
  if (!cdata.checkins[todayStr(d)]) d.setDate(d.getDate() - 1);
  while (cdata.checkins[todayStr(d)]) { s++; d.setDate(d.getDate() - 1); }
  return s;
}
function checkin() {
  const t = todayStr();
  if (!cdata.checkins[t]) {
    cdata.checkins[t] = true; addStars(2, true);
    checkMedals(); saveChild();
  }
}

/* ---------- 音效（WebAudio 合成，无外部资源） ---------- */
let AC = null;
function ac() { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); return AC; }
function tone(f, t0, dur, type, g) {
  try {
    const c = ac(), o = c.createOscillator(), ga = c.createGain();
    o.type = type || 'sine'; o.frequency.value = f; ga.gain.value = g || 0.16;
    o.connect(ga); ga.connect(c.destination);
    const s = c.currentTime + t0;
    o.start(s); ga.gain.exponentialRampToValueAtTime(0.001, s + dur); o.stop(s + dur + 0.05);
  } catch (e) {}
}
const sfx = {
  ok()   { if (settings.sound) { tone(660, 0, .12); tone(880, .1, .2); } },
  bad()  { if (settings.sound) tone(220, 0, .22, 'triangle', .1); },
  star() { if (settings.sound) { tone(880, 0, .08); tone(1100, .07, .08); tone(1320, .14, .22); } },
  tada() { if (settings.sound) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .09, .25)); }
};

/* ---------- 语音朗读 ---------- */
let voice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v => /zh[-_]CN/i.test(v.lang) && /Xiaoxiao|Tingting|Meijia| female|女/i.test(v.name))
       || vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); }
function speak(text, cb) {
  if (!settings.tts || !('speechSynthesis' in window)) { cb && cb(); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[？?！!。.，,、：:]/g, m => m + ' '));
    if (voice) u.voice = voice;
    u.lang = 'zh-CN'; u.rate = settings.rate; u.pitch = 1.05;
    u.onend = () => cb && cb(); u.onerror = () => cb && cb();
    speechSynthesis.speak(u);
  } catch (e) { cb && cb(); }
}

/* ---------- 轻提示 ---------- */
let toastT = null;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 1600);
}

/* ---------- 勋章 ---------- */
const MEDALS = [
  { id: 'first',   em: '🎉', nm: '第一天',     ds: '完成第一次打卡' },
  { id: 'calc100', em: '🧮', nm: '口算新星',   ds: '累计口算100题' },
  { id: 'calc500', em: '🚀', nm: '口算达人',   ds: '累计口算500题' },
  { id: 'streak7', em: '🔥', nm: '坚持一周',   ds: '连续打卡7天' },
  { id: 'chars30', em: '✍️', nm: '识字小博士', ds: '学会30个生字' },
  { id: 'read10',  em: '📖', nm: '朗读之星',   ds: '朗读10篇次' },
  { id: 'poem3',   em: '🏮', nm: '背诵小能手', ds: '完成3首古诗填空' },
  { id: 'xpoem5',  em: '📜', nm: '课外诗仙',   ds: '学会5首课外古诗' },
  { id: 'redo10',  em: '💪', nm: '错题克星',   ds: '重做对10道错题' }
];
function checkMedals() {
  const c = cdata.counters, learned = Object.keys(cdata.chars).length;
  const got = n => cdata.medals.includes(n);
  const cond = {
    first: Object.keys(cdata.checkins).length >= 1,
    calc100: c.calc >= 100, calc500: c.calc >= 500,
    streak7: streak() >= 7, chars30: learned >= 30,
    read10: c.read >= 10, poem3: cdata.poemDone.length >= 3,
    xpoem5: (cdata.xpoem || []).length >= 5,
    redo10: c.redoOk >= 10
  };
  MEDALS.forEach(m => { if (cond[m.id] && !got(m.id)) { cdata.medals.push(m.id); toast(m.em + ' 获得勋章「' + m.nm + '」！'); sfx.tada(); } });
  saveChild();
}

/* ---------- 防沉迷 ---------- */
let contSec = 0, restLock = false, dayLock = false;
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true }));
setInterval(() => {
  if (!child || !cdata || restLock || dayLock) return;
  if (document.visibilityState !== 'visible') return;
  if (screenName === 'parent') return;
  if (Date.now() - lastAct > 60000) return;
  const d = day(); d.min += 1 / 60; contSec++;
  if (++tickCount % 15 === 0) saveChild();
  /* 时间限制已按需求移除 */
}, 1000);
function showRest() {
  restLock = true; contSec = 0; saveChild(); speak('');
  let n = 20;
  const tips = ['看看窗外远处的绿色，让眼睛休息一下 🌳', '伸个懒腰，喝口水 💧', '站起来跳一跳，活动一下 🤸', '眨眨眼睛，做一次深呼吸 😌'];
  const tip = pick(tips);
  openSheet('<h3>🌈 休息一下</h3><p style="font-size:18px">' + tip + '</p><div style="font-size:40px;font-weight:900;color:var(--pri-d)" id="restN">20</div><p class="muted">休息结束自动继续</p>', true);
  const iv = setInterval(() => {
    n--; const el = $('#restN'); if (el) el.textContent = n;
    if (n <= 0) { clearInterval(iv); closeSheet(); restLock = false; }
  }, 1000);
}
function showDayLock() {
  if (dayLock) return; dayLock = true;
  openSheet('<h3>🌙 今天的休息时间到啦</h3><p style="font-size:17px">你已经学习 <b>' + Math.round(day().min) + '</b> 分钟，<br>明天继续加油哦！</p>' +
    '<div class="row" style="justify-content:center;gap:10px;margin-top:14px">' +
    '<button class="btn small ghost" id="lockParent">家长解锁</button></div>', true);
  $('#lockParent').onclick = () => { closeSheet(); dayLock = false; parentGate(() => go('parent')); };
}

/* ---------- 家长验证门 ---------- */
function parentGate(cb) {
  const a = 11 + rnd(78), b = 11 + rnd(78);
  openSheet('<h3>👨‍👩‍👧 家长验证</h3><p class="muted">请家长计算下面这道题</p>' +
    '<div class="qText">' + a + ' + ' + b + ' = ?</div>' +
    '<input type="number" id="gateIn" inputmode="numeric" style="width:140px;text-align:center;font-size:26px">' +
    '<div style="margin-top:14px"><button class="btn" id="gateOk">确定</button></div>');
  $('#gateOk').onclick = () => {
    if (parseInt($('#gateIn').value, 10) === a + b) { closeSheet(); cb(); }
    else { sfx.bad(); toast('答案不对哦，请家长来操作'); $('#gateIn').value = ''; }
  };
  $('#gateIn').focus();
}

/* ---------- 浮层 ---------- */
let sheetClosable = false;
function openSheet(html, noClose) {
  $('#sheet').innerHTML = html; $('#overlay').hidden = false;
  sheetClosable = !noClose;
}
function closeSheet() { $('#overlay').hidden = true; $('#sheet').innerHTML = ''; }
$('#overlay').addEventListener('click', e => { if (e.target.id === 'overlay' && sheetClosable) closeSheet(); });

/* ---------- 错题本 ---------- */
function pushWrong(meta) {
  const key = meta.key;
  let w = cdata.wrong.find(x => x.key === key);
  if (w) { w.wrongCount++; w.rightStreak = 0; w.nextReview = todayStr(); }
  else {
    cdata.wrong.push({ key, subj: meta.subj, kp: meta.kp, label: meta.label, type: meta.type,
      payload: meta.payload, wrongCount: 1, rightStreak: 0, nextReview: todayStr(), addedAt: todayStr() });
  }
  saveChild();
}
function wrongDue() { const t = todayStr(); return cdata.wrong.filter(w => w.nextReview <= t).length; }

/* ============================================================
   内置内容数据（数学：苏教版二上 ｜ 语文：统编版二上）
   ============================================================ */

/* ---------- 数学：单元与题库 ---------- */
const MATH_UNITS = [
  { id: 'u1', bk: '上', nm: '100以内的加法和减法', em: '➕' },
  { id: 'u2', bk: '上', nm: '平行四边形的初步认识', em: '🔷' },
  { id: 'u3', bk: '上', nm: '表内乘法（一）', em: '✖️' },
  { id: 'u4', bk: '上', nm: '表内除法（一）', em: '➗' },
  { id: 'u5', bk: '上', nm: '厘米和米', em: '📏' },
  { id: 'u6', bk: '上', nm: '表内乘法和表内除法（二）', em: '🧠' },
  { id: 'u7', bk: '上', nm: '观察物体', em: '👀' },
  { id: 'u8', bk: '下', nm: '有余数的除法', em: '🔢' },
  { id: 'u9', bk: '下', nm: '时、分、秒', em: '⏱️' },
  { id: 'u10', bk: '下', nm: '认识方向', em: '🧭' },
  { id: 'u11', bk: '下', nm: '认识万以内的数', em: '💯' },
  { id: 'u12', bk: '下', nm: '分米和毫米', em: '📐' },
  { id: 'u13', bk: '下', nm: '两、三位数的加法和减法', em: '💰' },
  { id: 'u14', bk: '下', nm: '角的初步认识', em: '📏' },
  { id: 'u15', bk: '下', nm: '数据的收集和整理', em: '📊' }
];
const MATH_QS = [
  { id: 'm01', u: 'u1', kp: '连加连减', kind: 'num', text: '24 + 18 + 9 = ?', ans: 51, exp: '先算 24+18=42，再算 42+9=51。' },
  { id: 'm02', u: 'u1', kp: '加减混合', kind: 'num', text: '45 - 17 + 8 = ?', ans: 36, exp: '先算 45-17=28，再算 28+8=36。' },
  { id: 'm03', u: 'u1', kp: '加减混合', kind: 'num', text: '83 - 26 - 19 = ?', ans: 38, exp: '先算 83-26=57，再算 57-19=38。' },
  { id: 'm04', u: 'u1', kp: '连加连减', kind: 'num', text: '车上原来有35人，下车18人，又上来9人。现在车上有多少人？', ans: 26, exp: '35-18=17，17+9=26（人）。' },
  { id: 'm05', u: 'u1', kp: '连加连减', kind: 'choice', text: '妈妈买了8个苹果，吃掉3个，又买了6个，现在有几个？', opts: ['11 个', '10 个', '9 个', '14 个'], ans: 0, exp: '8-3+6=11（个）。' },
  { id: 'm06', u: 'u1', kp: '加减混合', kind: 'judge', text: '计算 72-38+14 时，要先算 72-38。', ans: true, exp: '加减混合从左往右依次计算。' },
  { id: 'm07', u: 'u2', kp: '认识四边形', kind: 'judge', text: '长方形、正方形都是四边形。', ans: true, exp: '它们都有四条边和四个角。' },
  { id: 'm08', u: 'u2', kp: '认识四边形', kind: 'judge', text: '三角形也是四边形。', ans: false, exp: '三角形只有三条边，是三角形，不是四边形。' },
  { id: 'm09', u: 'u2', kp: '平行四边形', kind: 'judge', text: '平行四边形的对边相等。', ans: true, exp: '平行四边形两组对边分别相等。' },
  { id: 'm10', u: 'u2', kp: '平行四边形', kind: 'choice', text: '把长方形的框架轻轻拉动，它会变成什么？', opts: ['三角形', '平行四边形', '圆', '正方形'], ans: 1, exp: '拉动长方形框架，边长不变、角度变化，变成平行四边形。' },
  { id: 'm11', u: 'u2', kp: '认识四边形', kind: 'choice', text: '下面的图形，哪一个有四条边？', opts: ['三角形', '五角星', '梯形', '圆'], ans: 2, exp: '梯形有四条边，是四边形。' },
  { id: 'm12', u: 'u3', kp: '乘法的意义', kind: 'choice', text: '3 + 3 + 3 + 3 写成乘法算式是：', opts: ['3 + 4', '4 + 3', '3 × 4', '4 × 4'], ans: 2, exp: '4 个 3 相加，写成 3×4（也可以说 4 个 3）。' },
  { id: 'm13', u: 'u3', kp: '乘法的意义', kind: 'choice', text: '5 × 2 表示：', opts: ['5 和 2 相加', '2 个 5 相加', '5 加 2', '5 个 2 相加'], ans: 3, exp: '5×2 就是 2 个 5 相加，也等于 5 个 2 相加。' },
  { id: 'm14', u: 'u3', kp: '乘法口诀', kind: 'choice', text: '口诀“三五十五”对应的算式是：', opts: ['3 + 5', '3 × 5', '3 + 5 + 15', '5 - 3'], ans: 1, exp: '三五十五 → 3×5=15。' },
  { id: 'm15', u: 'u3', kp: '乘法口诀', kind: 'num', text: '6 × 5 + 5 = ?', ans: 35, exp: '6×5=30，30+5=35；也可以想 7 个 5 是 35。' },
  { id: 'm16', u: 'u3', kp: '乘法的意义', kind: 'judge', text: '4 × 6 和 6 × 4 的得数相同。', ans: true, exp: '乘法交换位置，得数不变，都用“四六二十四”。' },
  { id: 'm17', u: 'u4', kp: '平均分', kind: 'num', text: '把12个苹果平均分给3个小朋友，每人分几个？', ans: 4, exp: '12÷3=4（个）。' },
  { id: 'm18', u: 'u4', kp: '除法的意义', kind: 'choice', text: '12 ÷ 3 = 4 读作：', opts: ['12 除 3 等于 4', '12 除以 3 等于 4', '3 除以 12 等于 4', '12 乘 3 等于 4'], ans: 1, exp: '÷ 读作“除以”。' },
  { id: 'm19', u: 'u4', kp: '除法口诀求商', kind: 'num', text: '15 ÷ 5 = ?', ans: 3, exp: '想口诀：三五十五，所以 15÷5=3。' },
  { id: 'm20', u: 'u4', kp: '除法的意义', kind: 'judge', text: '10 ÷ 2 = 5 表示把10平均分成2份，每份是5。', ans: true, exp: '这就是除法的平均分意义。' },
  { id: 'm21', u: 'u4', kp: '平均分', kind: 'choice', text: '哪一种分法是“平均分”？', opts: ['每份同样多', '随便分', '分给个子高的', '一次分完'], ans: 0, exp: '每份分得同样多，才叫平均分。' },
  { id: 'm22', u: 'u5', kp: '厘米和米', kind: 'choice', text: '1 米 = ? 厘米', opts: ['10', '50', '100', '1000'], ans: 2, exp: '1 米 = 100 厘米。' },
  { id: 'm23', u: 'u5', kp: '厘米和米', kind: 'choice', text: '一支铅笔的长度约是18（　）。', opts: ['米', '厘米', '元', '千克'], ans: 1, exp: '铅笔很短，用厘米作单位。' },
  { id: 'm24', u: 'u5', kp: '厘米和米', kind: 'choice', text: '教室门的高度约是2（　）。', opts: ['厘米', '米', '毫米', '分米'], ans: 1, exp: '门比小朋友高，约2米。' },
  { id: 'm25', u: 'u5', kp: '线段', kind: 'judge', text: '线段可以量出长度。', ans: true, exp: '线段有两个端点，长度可以测量。' },
  { id: 'm26', u: 'u5', kp: '厘米和米', kind: 'judge', text: '量数学课本的宽，用“米”作单位比较合适。', ans: false, exp: '课本很窄，应该用厘米。' },
  { id: 'm27', u: 'u6', kp: '7-9的乘法口诀', kind: 'num', text: '7 × 8 = ?', ans: 56, exp: '七八五十六。' },
  { id: 'm28', u: 'u6', kp: '7-9的乘法口诀', kind: 'num', text: '63 ÷ 9 = ?', ans: 7, exp: '想口诀：七九六十三。' },
  { id: 'm29', u: 'u6', kp: '7-9的乘法口诀', kind: 'num', text: '9 × 9 = ?', ans: 81, exp: '九九八十一。' },
  { id: 'm30', u: 'u6', kp: '7-9的乘法口诀', kind: 'num', text: '8 × 6 + 8 = ?', ans: 56, exp: '8×6=48，48+8=56；也可以想 7 个 8 是 56。' },
  { id: 'm31', u: 'u6', kp: '除法口诀求商', kind: 'choice', text: '“七八五十六”可以计算哪道除法？', opts: ['56 ÷ 7', '56 ÷ 8', '都可以', '都不可以'], ans: 2, exp: '同一句口诀可以算 56÷7 和 56÷8。' },
  { id: 'm32', u: 'u7', kp: '观察物体', kind: 'judge', text: '从不同的位置观察同一个物体，看到的形状可能不同。', ans: true, exp: '前后左右看到的常常不一样。' },
  { id: 'm33', u: 'u7', kp: '观察物体', kind: 'judge', text: '从上面看一个正方体，看到的是正方形。', ans: true, exp: '正方体每个面都是正方形。' },
  { id: 'm34', u: 'u7', kp: '观察物体', kind: 'judge', text: '观察一个球，从哪个方向看都是圆形。', ans: true, exp: '球从任何方向看都是圆的。' },
  /* ---- 二上薄弱单元补充 ---- */
  { id: 'm35', u: 'u2', kp: '平行四边形', kind: 'judge', text: '两个完全一样的三角形，可以拼成一个平行四边形。', ans: true, exp: '动手拼一拼：还能拼成更大的三角形。' },
  { id: 'm36', u: 'u2', kp: '认识四边形', kind: 'judge', text: '正方形是特殊的长方形。', ans: true, exp: '正方形四条边都相等，是长方形的特例。' },
  { id: 'm37', u: 'u2', kp: '认识四边形', kind: 'choice', text: '平行四边形有几条边？', opts: ['3 条', '4 条', '5 条', '6 条'], ans: 1, exp: '平行四边形和长方形一样，都有 4 条边。' },
  { id: 'm38', u: 'u2', kp: '平行四边形', kind: 'judge', text: '拉动平行四边形框架时，它的边长会变长。', ans: false, exp: '边长不变，变的是角的大小。' },
  { id: 'm39', u: 'u7', kp: '观察物体', kind: 'judge', text: '从前面和后面观察同一个水壶，看到的画面是一样的。', ans: false, exp: '前后看到的画面通常不同，比如壶嘴的方向。' },
  { id: 'm40', u: 'u7', kp: '观察物体', kind: 'choice', text: '观察一个长方体盒子，一次最多能看到它的几个面？', opts: ['1 个', '2 个', '3 个', '4 个'], ans: 2, exp: '一次最多能看到 3 个面。' },
  { id: 'm41', u: 'u7', kp: '观察物体', kind: 'choice', text: '小明站在小猴的前面，他看到的是小猴的（　）。', opts: ['正面', '背面', '侧面', '上面'], ans: 0, exp: '在前面看到的是正面。' },
  { id: 'm42', u: 'u5', kp: '厘米和米', kind: 'choice', text: '量操场的长度，用（　）作单位比较合适。', opts: ['厘米', '米', '时', '元'], ans: 1, exp: '操场很长，用米作单位。' },
  { id: 'm43', u: 'u5', kp: '厘米和米', kind: 'num', text: '50 厘米 + 50 厘米 = ? 米', ans: 1, exp: '50+50=100 厘米，100 厘米 = 1 米。' },
  { id: 'm44', u: 'u5', kp: '厘米和米', kind: 'judge', text: '二年级小朋友的身高约 128 厘米。', ans: true, exp: '一米多的小朋友，用厘米表示更准确。' },
  /* ---- 二下：有余数的除法 ---- */
  { id: 'm45', u: 'u8', kp: '有余数的除法', kind: 'num', text: '17 ÷ 5 = 3 余 ?', ans: 2, exp: '三五十五，17 - 15 = 2，余数是 2。' },
  { id: 'm46', u: 'u8', kp: '有余数的除法', kind: 'choice', text: '□ × 4 ＜ 23，□ 最大填几？', opts: ['4', '5', '6', '7'], ans: 1, exp: '5×4=20＜23，6×4=24 就超过 23 了。' },
  { id: 'm47', u: 'u8', kp: '有余数的除法', kind: 'judge', text: '在有余数的除法里，余数一定要比除数小。', ans: true, exp: '余数如果比除数大，说明还能再分一次。' },
  { id: 'm48', u: 'u8', kp: '有余数的除法', kind: 'choice', text: '22 个球，每 5 个装一袋，能装满几袋还剩几个？', opts: ['4 袋剩 2 个', '5 袋剩 2 个', '4 袋剩 3 个', '3 袋剩 7 个'], ans: 0, exp: '4×5=20，装满 4 袋，22-20=2，剩 2 个。' },
  /* ---- 二下：时、分、秒 ---- */
  { id: 'm49', u: 'u9', kp: '时分秒', kind: 'choice', text: '1 时 = （　）分', opts: ['30', '60', '100', '24'], ans: 1, exp: '1 时 = 60 分。' },
  { id: 'm50', u: 'u9', kp: '时分秒', kind: 'choice', text: '秒针走一圈是（　）。', opts: ['1 分', '1 时', '1 秒', '半时'], ans: 0, exp: '秒针走一圈是 60 秒，正好 1 分钟。' },
  { id: 'm51', u: 'u9', kp: '时分秒', kind: 'choice', text: '小明跑 50 米大约用 10（　）。', opts: ['时', '分', '秒'], ans: 2, exp: '跑 50 米很快，用秒作单位。' },
  { id: 'm52', u: 'u9', kp: '时分秒', kind: 'judge', text: '分针从 12 走到 6，经过了 30 分钟。', ans: true, exp: '分针走一大格是 5 分钟，走 6 大格是 30 分钟。' },
  { id: 'm53', u: 'u9', kp: '时分秒', kind: 'choice', text: '看一集动画片大约 20（　）。', opts: ['时', '分', '秒'], ans: 1, exp: '一集动画约 20 分钟。' },
  { id: 'm54', u: 'u9', kp: '时分秒', kind: 'num', text: '120 分 = ? 时', ans: 2, exp: '60 分是 1 时，120 分是 2 时。' },
  /* ---- 二下：认识方向 ---- */
  { id: 'm55', u: 'u10', kp: '认识方向', kind: 'choice', text: '太阳每天从（　）边升起。', opts: ['东', '西', '南', '北'], ans: 0, exp: '太阳从东方升起，西方落下。' },
  { id: 'm56', u: 'u10', kp: '认识方向', kind: 'judge', text: '面向南时，背面是北。', ans: true, exp: '南和北相对。' },
  { id: 'm57', u: 'u10', kp: '认识方向', kind: 'choice', text: '看地图时，通常是上（　）、下南、左西、右东。', opts: ['北', '东', '南', '西'], ans: 0, exp: '地图规则：上北下南，左西右东。' },
  /* ---- 二下：万以内的数 ---- */
  { id: 'm58', u: 'u11', kp: '万以内的数', kind: 'choice', text: '2070 读作：', opts: ['二千零七十', '二千七十', '两千七百', '二万零七十'], ans: 0, exp: '中间的 0 要读出来：二千零七十。' },
  { id: 'm59', u: 'u11', kp: '万以内的数', kind: 'num', text: '10 个一百是（　）', ans: 1000, exp: '10 个一百是一千。' },
  { id: 'm60', u: 'u11', kp: '万以内的数', kind: 'choice', text: '8080 中左边的 8 表示（　）。', opts: ['8 个千', '8 个百', '8 个十', '8 个一'], ans: 0, exp: '左边的 8 在千位，表示 8 个千。' },
  { id: 'm61', u: 'u11', kp: '万以内的数', kind: 'choice', text: '比 999 大 1 的数是（　）。', opts: ['998', '1000', '1009', '10000'], ans: 1, exp: '999 + 1 = 1000。' },
  { id: 'm62', u: 'u11', kp: '万以内的数', kind: 'judge', text: '3050 读作“三千零五十”。', ans: true, exp: '百位是 0，要读“零”。' },
  { id: 'm63', u: 'u11', kp: '万以内的数', kind: 'choice', text: '最小的四位数是（　）。', opts: ['999', '1000', '1111', '9000'], ans: 1, exp: '1000 是最小的四位数。' },
  /* ---- 二下：分米和毫米 ---- */
  { id: 'm64', u: 'u12', kp: '分米和毫米', kind: 'choice', text: '1 分米 = （　）厘米', opts: ['1', '10', '100', '1000'], ans: 1, exp: '1 分米 = 10 厘米。' },
  { id: 'm65', u: 'u12', kp: '分米和毫米', kind: 'choice', text: '1 厘米 = （　）毫米', opts: ['1', '10', '100', '1000'], ans: 1, exp: '1 厘米 = 10 毫米。' },
  { id: 'm66', u: 'u12', kp: '分米和毫米', kind: 'choice', text: '数学课本的厚度约 6（　）。', opts: ['米', '厘米', '毫米', '分米'], ans: 2, exp: '课本很薄，用毫米作单位。' },
  { id: 'm67', u: 'u12', kp: '分米和毫米', kind: 'num', text: '3 分米 = ? 厘米', ans: 30, exp: '1 分米 = 10 厘米，3 分米 = 30 厘米。' },
  { id: 'm68', u: 'u12', kp: '分米和毫米', kind: 'judge', text: '一枚一元硬币的厚度约 2 毫米。', ans: true, exp: '硬币很薄，2 毫米左右。' },
  { id: 'm69', u: 'u12', kp: '分米和毫米', kind: 'choice', text: '跑道一圈 400 米，跑两圈是（　）米。', opts: ['600', '800', '1000', '400'], ans: 1, exp: '400×2=800 米。' },
  /* ---- 二下：角的初步认识 ---- */
  { id: 'm70', u: 'u14', kp: '角的认识', kind: 'judge', text: '一个角有 1 个顶点和 2 条边。', ans: true, exp: '这就是角的组成。' },
  { id: 'm71', u: 'u14', kp: '角的认识', kind: 'judge', text: '角的两边张口越大，角就越大。', ans: true, exp: '角的大小看张口。' },
  { id: 'm72', u: 'u14', kp: '角的认识', kind: 'judge', text: '角的边画得越长，角就越大。', ans: false, exp: '角的大小与边的长短没有关系。' },
  { id: 'm73', u: 'u14', kp: '角的认识', kind: 'choice', text: '每块三角板上有（　）个直角。', opts: ['0 个', '1 个', '2 个', '3 个'], ans: 1, exp: '每块三角板有 1 个直角和 2 个锐角。' },
  { id: 'm74', u: 'u14', kp: '角的认识', kind: 'judge', text: '长方形的四个角都是直角。', ans: true, exp: '用三角板的直角量一量就知道。' },
  { id: 'm75', u: 'u14', kp: '角的认识', kind: 'choice', text: '几时整，钟面上时针和分针正好成直角？', opts: ['3 时', '6 时', '12 时', '1 时'], ans: 0, exp: '3 时整，时针指 3、分针指 12，正好成直角。' },
  /* ---- 二下：数据的收集和整理 ---- */
  { id: 'm76', u: 'u15', kp: '数据整理', kind: 'choice', text: '统计班里同学最喜欢的季节，用（　）方法记录最方便。', opts: ['画“正”字计数', '每个人写一篇作文', '唱歌', '跑步'], ans: 0, exp: '画“正”字是常用的计数方法，一个“正”字 5 画。' },
  { id: 'm77', u: 'u15', kp: '数据整理', kind: 'judge', text: '收集数据时，可以先分类，再数一数。', ans: true, exp: '分类整理是统计的好方法。' },
  { id: 'm78', u: 'u15', kp: '数据整理', kind: 'choice', text: '喜欢晴天 15 人，喜欢雨天 6 人，喜欢（　）的人多。', opts: ['晴天', '雨天', '一样多', '不能比较'], ans: 0, exp: '15 比 6 大。' },
  /* ---- 二下：两三位数加减（应用题） ---- */
  { id: 'm79', u: 'u13', kp: '两三位数加减', kind: 'num', text: '小明有 350 元，买书用去 120 元，还剩多少元？', ans: 230, exp: '350 - 120 = 230（元）。' },
  { id: 'm80', u: 'u13', kp: '两三位数加减', kind: 'num', text: '电风扇 298 元，书包 105 元，一共要多少元？', ans: 403, exp: '298 + 105 = 403（元）。' },

{id: "m81",u: "u1",kp: "两位数加法",kind: "num",text: "34 + 25 = ?",ans: 59,exp: "个位 4+5=9，满十向十位进一，所以 34+25=59。"},
{id: "m82",u: "u1",kp: "两位数加法",kind: "num",text: "46 + 28 = ?",ans: 74,exp: "个位 6+8=14，满十向十位进一，所以 46+28=74。"},
{id: "m83",u: "u1",kp: "两位数加法",kind: "num",text: "57 + 16 = ?",ans: 73,exp: "个位 7+6=13，满十向十位进一，所以 57+16=73。"},
{id: "m84",u: "u1",kp: "两位数加法",kind: "num",text: "63 + 19 = ?",ans: 82,exp: "个位 3+9=12，满十向十位进一，所以 63+19=82。"},
{id: "m85",u: "u1",kp: "两位数加法",kind: "num",text: "72 + 9 = ?",ans: 81,exp: "个位 2+9=11，满十向十位进一，所以 72+9=81。"},
{id: "m86",u: "u1",kp: "两位数加法",kind: "num",text: "18 + 47 = ?",ans: 65,exp: "个位 8+7=15，满十向十位进一，所以 18+47=65。"},
{id: "m87",u: "u1",kp: "两位数减法",kind: "num",text: "52 - 27 = ?",ans: 25,exp: "先算个位 2-7，再算十位，得 25。"},
{id: "m88",u: "u1",kp: "两位数减法",kind: "num",text: "61 - 24 = ?",ans: 37,exp: "先算个位 1-4，再算十位，得 37。"},
{id: "m162",u: "u10",kp: "辨认方向",kind: "choice",text: "当你面向东时，你的后面是（　）。",opts: ["南","西","北"],ans: 1,exp: "东和西相对，南和北相对。"},
{id: "m163",u: "u10",kp: "辨认方向",kind: "choice",text: "当你面向南时，你的后面是（　）。",opts: ["东","西","北"],ans: 2,exp: "东和西相对，南和北相对。"},
{id: "m164",u: "u10",kp: "辨认方向",kind: "choice",text: "当你面向西时，你的后面是（　）。",opts: ["东","南","北"],ans: 0,exp: "东和西相对，南和北相对。"},
{id: "m165",u: "u10",kp: "辨认方向",kind: "choice",text: "当你面向北时，你的后面是（　）。",opts: ["东","南","西"],ans: 1,exp: "东和西相对，南和北相对。"},
{id: "m166",u: "u10",kp: "辨认方向",kind: "judge",text: "太阳每天从东方升起。",ans: true,exp: "太阳东升西落。"},
{id: "m167",u: "u10",kp: "辨认方向",kind: "judge",text: "面对北极星的方向就是南方。",ans: false,exp: "面对北极星时，面向的是北方。"},
{id: "m168",u: "u10",kp: "辨认方向",kind: "choice",text: "指南针的指针一头指南，一头指（　）。",opts: ["北","东","西"],ans: 0,exp: "指南针一头指南、一头指北。"},
{id: "m169",u: "u10",kp: "辨认方向",kind: "choice",text: "面向东时，你的右面是（　）。",opts: ["南","北","西"],ans: 0,exp: "面向东时，右面是南，左面是北。"},
{id: "m170",u: "u11",kp: "万以内数的认识",kind: "num",text: "“三千五百二十六”写作？",ans: 3526,exp: "从高位写起：千位 3，百位 5，十位 2，个位 6。"},
{id: "m171",u: "u11",kp: "万以内数的认识",kind: "num",text: "“一千八百零七”写作？",ans: 1807,exp: "从高位写起：千位 1，百位 8，十位 0，个位 7。"},
{id: "m172",u: "u11",kp: "万以内数的认识",kind: "num",text: "“二千九百”写作？",ans: 2900,exp: "从高位写起：千位 2，百位 9，十位 0，个位 0。"},
{id: "m173",u: "u11",kp: "数的顺序",kind: "num",text: "999 再数 1 个数是？",ans: 1000,exp: "999+1=1000。"},
{id: "m174",u: "u11",kp: "数的顺序",kind: "num",text: "2000 再数 1 个数是？",ans: 2001,exp: "2000+1=2001。"},
{id: "m175",u: "u11",kp: "比大小",kind: "choice",text: "下面三个数中最大的是（　）。",opts: ["989","1001","899"],ans: 1,exp: "1001 是四位数，比任何三位数都大。"},
{id: "m176",u: "u11",kp: "比大小",kind: "choice",text: "8060 中的“8”表示（　）。",opts: ["8 个千","8 个百","8 个十"],ans: 0,exp: "8 在千位上，表示 8 个千。"},
{id: "m177",u: "u11",kp: "数的组成",kind: "num",text: "3 个千、5 个百和 2 个一组成的数是多少？",ans: 3502,exp: "千位 3、百位 5、十位 0、个位 2，组成 3502。"},
{id: "m178",u: "u12",kp: "分米和厘米",kind: "num",text: "1 分米 = ? 厘米",ans: 10,exp: "1 分米 = 10 厘米，所以 1 分米 = 10 厘米。"},
{id: "m179",u: "u12",kp: "分米和厘米",kind: "num",text: "3 分米 = ? 厘米",ans: 30,exp: "1 分米 = 10 厘米，所以 3 分米 = 30 厘米。"},
{id: "m180",u: "u12",kp: "分米和厘米",kind: "num",text: "7 分米 = ? 厘米",ans: 70,exp: "1 分米 = 10 厘米，所以 7 分米 = 70 厘米。"},
{id: "m181",u: "u12",kp: "厘米和毫米",kind: "num",text: "2 厘米 = ? 毫米",ans: 20,exp: "1 厘米 = 10 毫米，所以 2 厘米 = 20 毫米。"},
{id: "m182",u: "u12",kp: "厘米和毫米",kind: "num",text: "5 厘米 = ? 毫米",ans: 50,exp: "1 厘米 = 10 毫米，所以 5 厘米 = 50 毫米。"},
{id: "m183",u: "u12",kp: "长度单位",kind: "choice",text: "数学课本的厚约 6（　）。",opts: ["毫米","厘米","米"],ans: 0,exp: "结合生活经验选择合适的长度单位。"},
{id: "m184",u: "u12",kp: "长度单位",kind: "choice",text: "一根跳绳长约 2（　）。",opts: ["米","分米","毫米"],ans: 0,exp: "结合生活经验选择合适的长度单位。"},
{id: "m185",u: "u12",kp: "长度单位",kind: "choice",text: "1 米 = 10（　）。",opts: ["分米","厘米","毫米"],ans: 0,exp: "1 米 = 10 分米 = 100 厘米。"},
{id: "m187",u: "u13",kp: "三位数加法",kind: "num",text: "345 + 213 = ?",ans: 558,exp: "相同数位对齐，从个位加起：345+213=558。"},
{id: "m188",u: "u13",kp: "三位数加法",kind: "num",text: "508 + 291 = ?",ans: 799,exp: "相同数位对齐，从个位加起：508+291=799。"},
{id: "m189",u: "u13",kp: "三位数加法",kind: "num",text: "627 + 158 = ?",ans: 785,exp: "相同数位对齐，从个位加起：627+158=785。"},
{id: "m190",u: "u13",kp: "三位数加法",kind: "num",text: "760 + 139 = ?",ans: 899,exp: "相同数位对齐，从个位加起：760+139=899。"},
{id: "m191",u: "u13",kp: "三位数减法",kind: "num",text: "612 - 345 = ?",ans: 267,exp: "相同数位对齐，从个位减起：612-345=267。"},
{id: "m192",u: "u13",kp: "三位数减法",kind: "num",text: "830 - 426 = ?",ans: 404,exp: "相同数位对齐，从个位减起：830-426=404。"},
{id: "m193",u: "u13",kp: "三位数减法",kind: "num",text: "902 - 517 = ?",ans: 385,exp: "相同数位对齐，从个位减起：902-517=385。"},
{id: "m194",u: "u13",kp: "三位数减法",kind: "num",text: "700 - 263 = ?",ans: 437,exp: "相同数位对齐，从个位减起：700-263=437。"},
{id: "m195",u: "u14",kp: "认识角",kind: "judge",text: "一个角有 1 个顶点和 2 条边。",ans: true,exp: "说法正确。"},
{id: "m196",u: "u14",kp: "认识角",kind: "judge",text: "角的两条边越长，这个角就越大。",ans: false,exp: "说法错误：角的大小与边的长短无关，只与两边张开的程度有关。"},
{id: "m197",u: "u14",kp: "认识角",kind: "judge",text: "直角是 90 度。",ans: true,exp: "说法正确。"},
{id: "m198",u: "u14",kp: "认识角",kind: "judge",text: "黑板面上的直角比三角尺上的直角大。",ans: false,exp: "说法错误：角的大小与边的长短无关，只与两边张开的程度有关。"},
{id: "m199",u: "u14",kp: "认识角",kind: "num",text: "一个长方形有（　）个角。",ans: 4,exp: "长方形有 4 个角，每个角都是直角。"},
{id: "m200",u: "u14",kp: "认识角",kind: "num",text: "一个三角形有（　）个角。",ans: 3,exp: "三角形有 3 条边、3 个角。"},
{id: "m201",u: "u14",kp: "认识角",kind: "choice",text: "三角尺上有（　）个直角。",opts: [1,2,3],ans: 0,exp: "每把三角尺上都有 1 个直角。"},
{id: "m202",u: "u14",kp: "认识角",kind: "choice",text: "拿一张纸，先上下对折，再左右对折，折出的角是（　）。",opts: ["直角","锐角","钝角"],ans: 0,exp: "两次对折折出的是直角。"},
{id: "m203",u: "u15",kp: "统计与整理",kind: "choice",text: "全班喜欢水果人数如下：苹果 12 人、香蕉 8 人、橘子 6 人。喜欢（　）的人数最多。",opts: ["苹果","香蕉","橘子"],ans: 0,exp: "把收集到的数据整理后比较或计算。"},
{id: "m204",u: "u15",kp: "统计与整理",kind: "choice",text: "二（1）班有男生 24 人，女生 18 人，全班共（　）人。",opts: ["42","40","6"],ans: 0,exp: "把收集到的数据整理后比较或计算。"},
{id: "m205",u: "u15",kp: "统计与整理",kind: "num",text: "喜欢苹果 12 人、香蕉 8 人，喜欢苹果的比喜欢香蕉的多几人？",ans: 4,exp: "12-8=4 人。"},
{id: "m206",u: "u15",kp: "统计与整理",kind: "num",text: "气象小组记录了一周晴天 4 天、雨天 3 天，一周共记录几天？",ans: 7,exp: "4+3=7 天。"},
{id: "m207",u: "u15",kp: "统计与整理",kind: "choice",text: "用画“正”字的方法统计数据，一个“正”字表示（　）。",opts: ["5 个数据","6 个数据","10 个数据"],ans: 0,exp: "一个“正”字有 5 画，表示 5 个数据。"},
{id: "m208",u: "u15",kp: "统计与整理",kind: "judge",text: "收集数据前，要先确定要调查的内容。",ans: true,exp: "先确定调查内容，再收集和整理数据。"},
{id: "m209",u: "u15",kp: "统计与整理",kind: "choice",text: "投票记录：春 15 票、夏 10 票、秋 12 票、冬 3 票，得票最多的是（　）。",opts: ["春","秋","夏"],ans: 0,exp: "15 > 12 > 10 > 3，春季得票最多。"},
{id: "m210",u: "u15",kp: "统计与整理",kind: "num",text: "记录本上画了 3 个“正”字，又添了 4 画，一共记录了 ? 个数据。",ans: 19,exp: "一个“正”字 5 画，3×5+4=19 个数据。"},
{id: "m95",u: "u2",kp: "认识图形",kind: "judge",text: "长方形是特殊的平行四边形。",ans: true,exp: "说法正确。"},
{id: "m96",u: "u2",kp: "认识图形",kind: "judge",text: "平行四边形的对边一样长。",ans: true,exp: "说法正确。"},
{id: "m97",u: "u2",kp: "认识图形",kind: "judge",text: "三角形有三条边和三个角。",ans: true,exp: "说法正确。"},
{id: "m98",u: "u2",kp: "认识图形",kind: "judge",text: "平行四边形有 5 条边。",ans: false,exp: "说法错误，想一想图形的特征。"},
{id: "m99",u: "u2",kp: "认识图形",kind: "judge",text: "平行四边形容易变形。",ans: true,exp: "说法正确。"},
{id: "m100",u: "u2",kp: "认识图形",kind: "judge",text: "数学书的封面是长方形。",ans: true,exp: "说法正确。"},
{id: "m101",u: "u2",kp: "认识图形",kind: "choice",text: "拉动长方形的框架，它会变成（　）。",opts: ["平行四边形","三角形","圆"],ans: 0,exp: "长方形框架拉动后变成平行四边形，说明四边形容易变形。"},
{id: "m102",u: "u2",kp: "认识图形",kind: "choice",text: "下面的图形中，属于四边形的是（　）。",opts: ["长方形","三角形","圆"],ans: 0,exp: "长方形有四条边，是四边形。"},
{id: "m105",u: "u3",kp: "乘法口诀",kind: "num",text: "3 × 4 = ?",ans: 12,exp: "口诀：三四十二。"},
{id: "m106",u: "u3",kp: "乘法口诀",kind: "num",text: "5 × 2 = ?",ans: 10,exp: "口诀：五二十。"},
{id: "m107",u: "u3",kp: "乘法口诀",kind: "num",text: "6 × 3 = ?",ans: 18,exp: "口诀：六三十八。"},
{id: "m108",u: "u3",kp: "乘法口诀",kind: "num",text: "4 × 5 = ?",ans: 20,exp: "口诀：四五二十。"},
{id: "m109",u: "u3",kp: "乘法口诀",kind: "num",text: "2 × 6 = ?",ans: 12,exp: "口诀：二六十二。"},
{id: "m110",u: "u3",kp: "乘法口诀",kind: "num",text: "5 × 5 = ?",ans: 25,exp: "口诀：五五二十五。"},
{id: "m111",u: "u3",kp: "乘加乘减",kind: "num",text: "4 × 3 + 2 = ?",ans: 14,exp: "先算 4×3=12，再加 2 得 14。"},
{id: "m112",u: "u3",kp: "乘加乘减",kind: "num",text: "5 × 4 - 3 = ?",ans: 17,exp: "先算 5×4=20，再减 3 得 17。"},
{id: "m113",u: "u4",kp: "表内除法",kind: "num",text: "12 ÷ 3 = ?",ans: 4,exp: "想乘法口诀：3 × 4 = 12，所以 12÷3=4。"},
{id: "m114",u: "u4",kp: "表内除法",kind: "num",text: "15 ÷ 5 = ?",ans: 3,exp: "想乘法口诀：5 × 3 = 15，所以 15÷5=3。"},
{id: "m115",u: "u4",kp: "表内除法",kind: "num",text: "18 ÷ 6 = ?",ans: 3,exp: "想乘法口诀：6 × 3 = 18，所以 18÷6=3。"},
{id: "m116",u: "u4",kp: "表内除法",kind: "num",text: "20 ÷ 4 = ?",ans: 5,exp: "想乘法口诀：4 × 5 = 20，所以 20÷4=5。"},
{id: "m117",u: "u4",kp: "表内除法",kind: "num",text: "24 ÷ 6 = ?",ans: 4,exp: "想乘法口诀：6 × 4 = 24，所以 24÷6=4。"},
{id: "m118",u: "u4",kp: "表内除法",kind: "num",text: "10 ÷ 2 = ?",ans: 5,exp: "想乘法口诀：2 × 5 = 10，所以 10÷2=5。"},
{id: "m119",u: "u4",kp: "平均分",kind: "num",text: "把 12 个苹果平均分给 3 个小朋友，每人分得几个？",ans: 4,exp: "12÷3=4，每人分得 4 个。"},
{id: "m120",u: "u4",kp: "平均分",kind: "judge",text: "把 8 颗糖平均分给 2 个人，每人分 4 颗。",ans: true,exp: "8÷2=4，每人分得 4 颗。"},
{id: "m121",u: "u5",kp: "长度单位",kind: "choice",text: "旗杆的高约 8（　）。",opts: ["米","厘米"],ans: 0,exp: "结合生活经验选择合适的长度单位。"},
{id: "m122",u: "u5",kp: "长度单位",kind: "choice",text: "橡皮的长约 3（　）。",opts: ["米","厘米"],ans: 1,exp: "结合生活经验选择合适的长度单位。"},
{id: "m123",u: "u5",kp: "长度单位",kind: "choice",text: "小明身高约 128（　）。",opts: ["厘米","米"],ans: 0,exp: "结合生活经验选择合适的长度单位。"},
{id: "m124",u: "u5",kp: "米和厘米",kind: "num",text: "1 米 = ? 厘米",ans: 100,exp: "1 米 = 100 厘米，所以 1 米 = 100 厘米。"},
{id: "m125",u: "u5",kp: "米和厘米",kind: "num",text: "2 米 = ? 厘米",ans: 200,exp: "1 米 = 100 厘米，所以 2 米 = 200 厘米。"},
{id: "m126",u: "u5",kp: "米和厘米",kind: "num",text: "3 米 = ? 厘米",ans: 300,exp: "1 米 = 100 厘米，所以 3 米 = 300 厘米。"},
{id: "m127",u: "u5",kp: "比长短",kind: "choice",text: "1 米和 90 厘米比，哪个长？",opts: ["1 米","90 厘米"],ans: 0,exp: "1 米 = 100 厘米 > 90 厘米，所以 1 米长。"},
{id: "m128",u: "u5",kp: "比长短",kind: "num",text: "一根绳子长 1 米，用去 30 厘米，还剩多少厘米？",ans: 70,exp: "1 米 = 100 厘米，100-30=70 厘米。"},
{id: "m129",u: "u6",kp: "乘法口诀",kind: "num",text: "7 × 3 = ?",ans: 21,exp: "口诀：七三二十一。"},
{id: "m130",u: "u6",kp: "乘法口诀",kind: "num",text: "8 × 4 = ?",ans: 32,exp: "口诀：八四三十二。"},
{id: "m131",u: "u6",kp: "乘法口诀",kind: "num",text: "9 × 2 = ?",ans: 18,exp: "口诀：九二十八。"},
{id: "m132",u: "u6",kp: "乘法口诀",kind: "num",text: "7 × 5 = ?",ans: 35,exp: "口诀：七五三十五。"},
{id: "m133",u: "u6",kp: "乘法口诀",kind: "num",text: "8 × 8 = ?",ans: 64,exp: "口诀：八八六十四。"},
{id: "m134",u: "u6",kp: "乘法口诀",kind: "num",text: "9 × 9 = ?",ans: 81,exp: "口诀：九九八十一。"},
{id: "m135",u: "u6",kp: "表内除法",kind: "num",text: "56 ÷ 8 = ?",ans: 7,exp: "七八五十六，所以 56÷8=7。"},
{id: "m136",u: "u6",kp: "表内除法",kind: "num",text: "63 ÷ 9 = ?",ans: 7,exp: "七九六十三，所以 63÷9=7。"},
{id: "m137",u: "u7",kp: "观察物体",kind: "judge",text: "从不同的方向观察同一个物体，看到的形状可能不同。",ans: true,exp: "说法正确。"},
{id: "m138",u: "u7",kp: "观察物体",kind: "judge",text: "蝴蝶的翅膀左右两边是对称的。",ans: true,exp: "说法正确。"},
{id: "m139",u: "u7",kp: "观察物体",kind: "judge",text: "从前面和后面观察一个杯子，看到的画面完全相同。",ans: false,exp: "说法错误，换个方向想一想。"},
{id: "m140",u: "u7",kp: "观察物体",kind: "judge",text: "观察一个球体，从任何方向看都是圆形。",ans: true,exp: "说法正确。"},
{id: "m141",u: "u7",kp: "观察物体",kind: "choice",text: "观察一个圆柱形水杯，从上面看到的形状是（　）。",opts: ["圆形","长方形","三角形"],ans: 0,exp: "圆柱从上面看是圆形，从侧面看是长方形。"},
{id: "m142",u: "u7",kp: "观察物体",kind: "choice",text: "观察一个长方体牙膏盒，从侧面看到的形状是（　）。",opts: ["长方形","圆形","梯形"],ans: 0,exp: "长方体每个面都是长方形。"},
{id: "m143",u: "u7",kp: "对称",kind: "choice",text: "下面的汉字中，属于轴对称的是（　）。",opts: ["田","我","了"],ans: 0,exp: "“田”字沿中线对折两边完全重合。"},
{id: "m144",u: "u7",kp: "观察物体",kind: "num",text: "一个正方体有几个面？",ans: 6,exp: "正方体有 6 个完全相同的面。"},
{id: "m145",u: "u8",kp: "有余数的除法",kind: "num",text: "17 ÷ 5 = 3 余 ?",ans: 2,exp: "口诀：5 × 3 = 15，17 - 15 = 2，所以余 2。"},
{id: "m146",u: "u8",kp: "有余数的除法",kind: "num",text: "23 ÷ 4 = 5 余 ?",ans: 3,exp: "口诀：4 × 5 = 20，23 - 20 = 3，所以余 3。"},
{id: "m147",u: "u8",kp: "有余数的除法",kind: "num",text: "38 ÷ 7 = 5 余 ?",ans: 3,exp: "口诀：7 × 5 = 35，38 - 35 = 3，所以余 3。"},
{id: "m148",u: "u8",kp: "有余数的除法",kind: "num",text: "50 ÷ 8 = 6 余 ?",ans: 2,exp: "口诀：8 × 6 = 48，50 - 48 = 2，所以余 2。"},
{id: "m149",u: "u8",kp: "有余数的除法",kind: "num",text: "29 ÷ 6 = 4 余 ?",ans: 5,exp: "口诀：6 × 4 = 24，29 - 24 = 5，所以余 5。"},
{id: "m150",u: "u8",kp: "有余数的除法",kind: "num",text: "41 ÷ 8 = 5 余 ?",ans: 1,exp: "口诀：8 × 5 = 40，41 - 40 = 1，所以余 1。"},
{id: "m151",u: "u8",kp: "有余数的除法",kind: "num",text: "17 个气球平均分给 5 个小朋友，每人分得几个？",ans: 3,exp: "17÷5=3 余 2，每人分 3 个，还剩 2 个。"},
{id: "m152",u: "u8",kp: "有余数的除法",kind: "judge",text: "在有余数的除法里，余数一定要比除数小。",ans: true,exp: "余数如果等于或大于除数，说明还能再分一次。"},
{id: "m153",u: "u9",kp: "时间单位",kind: "num",text: "1 时 = ? 分",ans: 60,exp: "1 时 = 60 分。"},
{id: "m154",u: "u9",kp: "时间单位",kind: "num",text: "1 分 = ? 秒",ans: 60,exp: "1 分 = 60 秒。"},
{id: "m155",u: "u9",kp: "认识钟面",kind: "num",text: "钟面上，分针走 1 大格是 ? 小格。",ans: 5,exp: "分针走 1 大格是 5 小格，走一圈 60 小格。"},
{id: "m156",u: "u9",kp: "认识钟面",kind: "num",text: "时针从一个数走到下一个数，经过了 ? 时。",ans: 1,exp: "时针走 1 大格是 1 时，分针正好走一圈 60 分。"},
{id: "m157",u: "u9",kp: "时间单位",kind: "choice",text: "完成“跑 50 米”这件事，所用的时间大约是 1（　）。",opts: ["时","分","秒"],ans: 2,exp: "结合生活经验选择合适的时间单位。"},
{id: "m158",u: "u9",kp: "时间单位",kind: "choice",text: "完成“上一节数学课”这件事，所用的时间大约是 1（　）。",opts: ["时","分","秒"],ans: 1,exp: "结合生活经验选择合适的时间单位。"},
{id: "m159",u: "u9",kp: "时间单位",kind: "choice",text: "完成“看一场电影”这件事，所用的时间大约是 1（　）。",opts: ["时","分","秒"],ans: 0,exp: "结合生活经验选择合适的时间单位。"},
{id: "m160",u: "u9",kp: "时间计算",kind: "num",text: "动画片 8 时开始，看了 30 分钟后结束，结束的时刻是 8 时 ? 分。",ans: 30,exp: "8 时 + 30 分 = 8 时 30 分。"},

];

/* ---------- 语文：题库（统编版二上知识点） ---------- */
const CHN_QS = [
  { id: 'c01', kp: '识字辨音', kind: 'choice', py: true, text: '“春”的读音是：', opts: ['chūn', 'cūn', 'chún', 'cūng'], ans: 0, exp: '春天（chūn tiān）。' },
  { id: 'c02', kp: '识字辨音', kind: 'choice', py: true, text: '“唱歌”的“唱”读音是：', opts: ['chàng', 'càng', 'chāng', 'zàng'], ans: 0, exp: '唱歌（chàng gē）。' },
  { id: 'c03', kp: '识字辨音', kind: 'choice', py: true, text: '“雪”的读音是：', opts: ['xuě', 'xiě', 'xué', 'suě'], ans: 0, exp: '下雪（xià xuě）。' },
  { id: 'c04', kp: '部首', kind: 'choice', text: '“河”的部首是：', opts: ['口', '氵', '木', '日'], ans: 1, exp: '河、海、湖都和水有关，部首是三点水“氵”。' },
  { id: 'c05', kp: '部首', kind: 'choice', text: '“跑”和“跳”的部首都是：', opts: ['⻊（足）', '口', '手', '土'], ans: 0, exp: '跑、跳都用脚，部首是足字旁。' },
  { id: 'c06', kp: '部首', kind: 'choice', text: '“读、说、话”的部首是：', opts: ['讠', '口', '日', '木'], ans: 0, exp: '和说话有关的字，部首常是言字旁“讠”。' },
  { id: 'c07', kp: '组词', kind: 'choice', text: '下面哪个是正确的词语？', opts: ['太阳', '大阳', '太杨', '态阳'], ans: 0, exp: '太阳，日字旁的“阳”。' },
  { id: 'c08', kp: '组词', kind: 'choice', text: '“唱”可以组词：', opts: ['唱歌', '喝歌', '吃歌', '看歌'], ans: 0, exp: '唱歌要用口，所以是口字旁的“唱”。' },
  { id: 'c09', kp: '组词', kind: 'choice', text: '“快”可以组词：', opts: ['快乐', '块乐', '筷乐', '会乐'], ans: 0, exp: '快乐，竖心旁的“快”。' },
  { id: 'c10', kp: '量词', kind: 'choice', text: '一（　）小河', opts: ['条', '座', '只', '个'], ans: 0, exp: '细细长长的东西常用“条”。' },
  { id: 'c11', kp: '量词', kind: 'choice', text: '一（　）大山', opts: ['条', '座', '朵', '棵'], ans: 1, exp: '山用“座”，一座大山。' },
  { id: 'c12', kp: '量词', kind: 'choice', text: '一（　）白云', opts: ['朵', '条', '头', '本'], ans: 0, exp: '云像花朵，一朵白云。' },
  { id: 'c13', kp: '量词', kind: 'choice', text: '一（　）大树', opts: ['棵', '只', '条', '把'], ans: 0, exp: '树用“棵”，一棵大树。' },
  { id: 'c14', kp: '反义词', kind: 'choice', text: '“快”的反义词是：', opts: ['慢', '乐', '跑', '好'], ans: 0, exp: '快 ⇄ 慢。' },
  { id: 'c15', kp: '反义词', kind: 'choice', text: '“大”的反义词是：', opts: ['多', '小', '高', '长'], ans: 1, exp: '大 ⇄ 小。' },
  { id: 'c16', kp: '反义词', kind: 'choice', text: '“开”的反义词是：', opts: ['关', '来', '去', '合上书'], ans: 0, exp: '开 ⇄ 关，如开门、关门。' },
  { id: 'c17', kp: '近义词', kind: 'choice', text: '“高兴”的近义词是：', opts: ['开心', '难过', '生气', '害怕'], ans: 0, exp: '高兴和开心意思相近。' },
  { id: 'c18', kp: '近义词', kind: 'choice', text: '“美丽”的近义词是：', opts: ['漂亮', '丑陋', '难看', '干净'], ans: 0, exp: '美丽 ⇋ 漂亮。' },
  { id: 'c19', kp: '写字笔顺', kind: 'choice', text: '写“火”字，第二笔是：', opts: ['点（丶）', '撇（丿）', '捺（㇏）', '横（一）'], ans: 1, exp: '火：点、撇（短撇）、撇、捺，第二笔是短撇。' },
  { id: 'c20', kp: '写字笔顺', kind: 'choice', text: '“先横后竖”的字是：', opts: ['十', '二', '人', '八'], ans: 0, exp: '十：先写横，再写竖。' },
  { id: 'c21', kp: '标点', kind: 'choice', text: '“你吃饭了吗”后面应加什么标点？', opts: ['。', '？', '！', '，'], ans: 1, exp: '问句末尾用问号。' },
  { id: 'c22', kp: '标点', kind: 'choice', text: '“我爱我的妈妈”后面应加：', opts: ['？', '。', '，', '、'], ans: 1, exp: '陈述句末尾用句号。' },
  { id: 'c23', kp: '句子', kind: 'choice', text: '下面哪句是完整的话？', opts: ['小鸟在天上飞。', '在天上小鸟。', '飞小鸟天上。', '小鸟天上。'], ans: 0, exp: '谁＋在哪里＋做什么，句子才完整。' },
  { id: 'c24', kp: '积累', kind: 'choice', text: '“一年之计在于春”是说：', opts: ['春天要早做计划', '春天很短', '春天很冷', '春天要多睡觉'], ans: 0, exp: '一年的打算要在春天就安排好，提醒我们做事要趁早。' }
];

/* ---------- 识字卡片（48 个常用字） ---------- */
const CHARS = [
  { c: '春', py: 'chūn', r: '日', w: ['春天', '春雨'] },
  { c: '花', py: 'huā', r: '艹', w: ['花朵', '花开'] },
  { c: '树', py: 'shù', r: '木', w: ['大树', '树叶'] },
  { c: '叶', py: 'yè', r: '口', w: ['叶子', '树叶'] },
  { c: '河', py: 'hé', r: '氵', w: ['小河', '河水'] },
  { c: '海', py: 'hǎi', r: '氵', w: ['大海', '海边'] },
  { c: '跑', py: 'pǎo', r: '足', w: ['跑步', '快跑'] },
  { c: '跳', py: 'tiào', r: '足', w: ['跳高', '跳绳'] },
  { c: '唱', py: 'chàng', r: '口', w: ['唱歌', '合唱'] },
  { c: '歌', py: 'gē', r: '欠', w: ['歌曲', '唱歌'] },
  { c: '笑', py: 'xiào', r: '竹', w: ['大笑', '笑话'] },
  { c: '快', py: 'kuài', r: '忄', w: ['快乐', '飞快'] },
  { c: '乐', py: 'lè', r: '丿', w: ['快乐', '乐园'] },
  { c: '读', py: 'dú', r: '讠', w: ['读书', '朗读'] },
  { c: '写', py: 'xiě', r: '冖', w: ['写字', '写话'] },
  { c: '画', py: 'huà', r: '田', w: ['画画', '图画'] },
  { c: '想', py: 'xiǎng', r: '心', w: ['想念', '理想'] },
  { c: '说', py: 'shuō', r: '讠', w: ['说话', '小说'] },
  { c: '话', py: 'huà', r: '讠', w: ['说话', '电话'] },
  { c: '朋', py: 'péng', r: '月', w: ['朋友', '亲朋好友'] },
  { c: '友', py: 'yǒu', r: '又', w: ['朋友', '好友'] },
  { c: '雪', py: 'xuě', r: '雨', w: ['雪花', '下雪'] },
  { c: '风', py: 'fēng', r: '风', w: ['大风', '春风'] },
  { c: '雨', py: 'yǔ', r: '雨', w: ['下雨', '雨点'] },
  { c: '云', py: 'yún', r: '二', w: ['白云', '云朵'] },
  { c: '天', py: 'tiān', r: '大', w: ['天空', '白天'] },
  { c: '地', py: 'dì', r: '土', w: ['大地', '草地'] },
  { c: '山', py: 'shān', r: '山', w: ['大山', '山水'] },
  { c: '水', py: 'shuǐ', r: '水', w: ['水果', '喝水'] },
  { c: '火', py: 'huǒ', r: '火', w: ['火苗', '生火'] },
  { c: '土', py: 'tǔ', r: '土', w: ['泥土', '土地'] },
  { c: '日', py: 'rì', r: '日', w: ['生日', '日子'] },
  { c: '月', py: 'yuè', r: '月', w: ['月亮', '月光'] },
  { c: '星', py: 'xīng', r: '日', w: ['星星', '星空'] },
  { c: '光', py: 'guāng', r: '儿', w: ['月光', '灯光'] },
  { c: '明', py: 'míng', r: '日', w: ['明天', '明亮'] },
  { c: '亮', py: 'liàng', r: '亠', w: ['明亮', '月亮'] },
  { c: '亲', py: 'qīn', r: '立', w: ['母亲', '亲人'] },
  { c: '爱', py: 'ài', r: '爫', w: ['爱心', '可爱'] },
  { c: '师', py: 'shī', r: '巾', w: ['老师', '教师'] },
  { c: '学', py: 'xué', r: '子', w: ['学习', '学校'] },
  { c: '生', py: 'shēng', r: '生', w: ['学生', '生日'] },
  { c: '知', py: 'zhī', r: '矢', w: ['知道', '知识'] },
  { c: '道', py: 'dào', r: '辶', w: ['知道', '道路'] },
  { c: '问', py: 'wèn', r: '门', w: ['问好', '问题'] },
  { c: '答', py: 'dá', r: '竹', w: ['回答', '答案'] },
  { c: '听', py: 'tīng', r: '口', w: ['听讲', '好听'] },
  { c: '看', py: 'kàn', r: '目', w: ['看见', '看书'] }
];

/* ---------- 课文朗读（人教版（统编）二年级上册课文） ---------- */
const TEXTS = [
  /* ===== 人教版（统编）二年级上册 · 第一单元 ===== */
  { id: 'k1', title: '小蝌蚪找妈妈', em: '🐸', note: '人教版二上 第1课', paras: [
    '池塘里有一群小蝌蚪，大大的脑袋，黑灰色的身子，甩着长长的尾巴，快活地游来游去。',
    '小蝌蚪游哇游，过了几天，长出了两条后腿。他们看见鲤鱼妈妈在教小鲤鱼捕食，就迎上去问：“鲤鱼阿姨，我们的妈妈在哪里？”鲤鱼妈妈说：“你们的妈妈四条腿，宽嘴巴。你们到那边去找吧！”',
    '小蝌蚪游哇游，过了几天，长出了两条前腿。他们看见一只乌龟摆动着四条腿在水里游，连忙追上去叫：“妈妈，妈妈！”乌龟笑着说：“我不是你们的妈妈。你们的妈妈头顶上有两只大眼睛，披着绿衣裳。你们到那边去找吧！”',
    '小蝌蚪游哇游，过了几天，尾巴变短了。他们游到荷花旁边，看见荷叶上蹲着一只大青蛙，披着碧绿的衣裳，露着雪白的肚皮，鼓着一对大眼睛。',
    '小蝌蚪游过去，叫道：“妈妈，妈妈！”青蛙妈妈低头一看，笑着说：“好孩子，你们已经长成青蛙了，快跳上来吧！”他们后腿一蹬，向前一跳，蹦到了荷叶上。',
    '不知什么时候，小青蛙的尾巴已经不见了。他们跟着妈妈，天天去捉害虫。'] },
  { id: 'k2', title: '我是什么', em: '💧', note: '人教版二上 第2课', paras: [
    '我会变。太阳一晒，我就变成汽，升到天空，我又变成无数极小极小的点儿，连成一片，在空中飘浮。有时我穿着白衣服，有时候我穿着黑衣服，早晨和傍晚我又把红袍披在身上。人们叫我“云”。',
    '我在空中飘浮着，碰到冷风，就变成水珠落下来。人们就叫我“雨”。有时我变成小硬球打下来，人们就叫我“雹子”。到了冬天，我又变成雪花飘下来。',
    '平常我在池子里睡觉，在小溪里散步，在江河里奔跑，在海洋里跳舞、唱歌、开大会。',
    '有时候我很温和，有时候我很暴躁。我做过许多好事，灌溉田地，发动机器，帮助人们工作。我也做过许多坏事，淹没庄稼，冲毁房屋，给人们带来灾害。人们想出种种办法管住我，让我光做好事，不做坏事。',
    '小朋友，你们猜猜，我是什么？'] },
  { id: 'k3', title: '植物妈妈有办法', em: '🌻', note: '人教版二上 第3课', paras: [
    '孩子如果已经长大，就得告别妈妈，四海为家。牛马有脚，鸟有翅膀，植物旅行又用什么办法？',
    '蒲公英妈妈准备了降落伞，把它送给自己的娃娃。只要有风轻轻吹过，孩子们就乘着风纷纷出发。',
    '苍耳妈妈有个好办法，她给孩子穿上带刺的铠甲。只要挂住动物的皮毛，孩子们就能去田野、山洼。',
    '豌豆妈妈更有办法，她让豆荚晒在太阳底下。啪的一声，豆荚炸开，孩子们就蹦着跳着离开妈妈。',
    '植物妈妈的办法很多很多，不信你就仔细观察。那里有许许多多的知识，粗心的小朋友却得不到它。'] },
  { id: 'k4', title: '场景歌', em: '⛵', note: '人教版二上 识字1', paras: [
    '一只海鸥，一片沙滩。一艘军舰，一条帆船。',
    '一畦秧苗，一块稻田。一方鱼塘，一座花园。',
    '一道小溪，一孔石桥。一丛翠竹，一群飞鸟。',
    '一面队旗，一把铜号。一队“红领巾”，一片欢笑。'] },
  { id: 'k5', title: '树之歌', em: '🌳', note: '人教版二上 识字2', paras: [
    '杨树高，榕树壮，梧桐树叶像手掌。',
    '枫树秋天叶儿红，松柏四季披绿装。',
    '木棉喜暖在南方，桦树耐寒守北疆。',
    '银杏水杉活化石，金桂开花满院香。'] },
  { id: 'k6', title: '拍手歌', em: '👏', note: '人教版二上 识字3', paras: [
    '你拍一，我拍一，动物世界很新奇。',
    '你拍二，我拍二，孔雀锦鸡是伙伴。',
    '你拍三，我拍三，雄鹰翱翔云彩间。',
    '你拍四，我拍四，天空雁群会写字。',
    '你拍五，我拍五，丛林深处有猛虎。',
    '你拍六，我拍六，黄鹂百灵唱不休。',
    '你拍七，我拍七，竹林熊猫在嬉戏。',
    '你拍八，我拍八，大小动物都有家。',
    '你拍九，我拍九，人和动物是朋友。',
    '你拍十，我拍十，保护动物是大事。'] },
  { id: 'k7', title: '田家四季歌', em: '🌾', note: '人教版二上 识字4', paras: [
    '春季里，春风吹，花开草长蝴蝶飞。麦苗儿多嫩，桑叶儿正肥。',
    '夏季里，农事忙，采了蚕桑又插秧。早起勤耕作，归来戴月光。',
    '秋季里，稻上场，谷像黄金粒粒香。身体虽辛苦，心里喜洋洋。',
    '冬季里，雪初晴，新制棉衣暖又轻。一年农事了，大家笑盈盈。'] },
  { id: 'k8', title: '曹冲称象', em: '🐘', note: '人教版二上 第4课', paras: [
    '古时候有个人叫曹操，别人送他一头大象。他很想知道这头大象有多重，就问身边的人：“这么大的象，怎么称呢？”',
    '有的说：“得造一杆大秤，砍一棵大树做秤杆。”有的说：“有了大秤也不成啊，谁有那么大的力气提得起这杆大秤呢？”也有的说：“办法倒有一个，就是把大象宰了，割成一块一块的再称。”曹操听了直摇头。',
    '曹操的儿子曹冲才七岁，他站出来，说：“我有个办法。把大象赶到一艘大船上，看船身下沉多少，就沿着水面，在船舷上画一条线。再把大象牵上岸，往船上装石头，装到船下沉到画线的地方为止。然后称一称船上的石头。石头有多重，大象就有多重。”',
    '曹操微笑着点了点头。他叫人照曹冲说的办法去做，果然称出了大象的重量。'] },
  { id: 'k9', title: '玲玲的画', em: '🎨', note: '人教版二上 第5课', paras: [
    '玲玲得意地端详着自己画的《我家的一角》。这幅画明天就要参加评奖了。',
    '“玲玲，时间不早了，快去睡吧！”妈妈又在催她了。',
    '就在这时候，水彩笔啪的一声掉到了纸上，把画弄脏了。玲玲伤心地哭了起来。',
    '“怎么了，玲玲？”爸爸放下报纸问。“我的画脏了，另画一张也来不及了。”',
    '“弄脏的地方，让它开了几朵小花，不就行了？”爸爸说。',
    '玲玲想了想，拿起画笔，在弄脏的地方画了一只小花狗。小花狗懒洋洋地趴在楼梯上。整张画看上去更好了。玲玲满意地笑了。',
    '“看到了吧，孩子。好多事情并不像我们想象的那么糟。只要肯动脑筋，坏事也能变成好事。”'] },
  { id: 'k10', title: '一封信', em: '✉️', note: '人教版二上 第6课', paras: [
    '露西放学回到家，妈妈还没有下班。她拿出纸和笔，想给出国工作的爸爸写一封信。爸爸要过半年才能回来。',
    '她写道：“亲爱的爸爸，你过得好吗？我们非常想你。家里的台灯坏了，修了好久才修好。”写着写着，她觉得不开心的事太多了。',
    '妈妈回来了，看到信，笑着说：“我们是不是也可以告诉爸爸一些开心的事？这样爸爸在外地工作才放心呀。”',
    '露西想了想，把信纸翻过来，重新写：“亲爱的爸爸：我们非常想你！家里的花开了，我还学会了帮妈妈做家务。妈妈说，家里一切都好，你安心工作。盼着你早点回家！”',
    '露西把信装进信封。她相信，爸爸读了这封信，一定会开心的。'] },
  { id: 'k11', title: '妈妈睡了', em: '😴', note: '人教版二上 第7课', paras: [
    '妈妈睡了。妈妈哄我午睡的时候，自己先睡着了，睡得好熟，好香。',
    '睡梦中的妈妈真美丽。明亮的眼睛闭上了，紧紧地闭着；弯弯的眉毛，也在睡觉，睡在妈妈红润的脸上。',
    '睡梦中的妈妈好温柔。妈妈微微地笑着。是的，她在微微地笑着，嘴巴、眼角都笑弯了，好像在睡梦中，妈妈又想好了一个故事，等会儿讲给我听……',
    '睡梦中的妈妈好累。妈妈的呼吸那么深沉。她干了好多活儿，累了，乏了，让她美美地睡一觉吧。'] },
  /* ===== 第四单元 ===== */
  { id: 't4', title: '登鹳雀楼', em: '🏯', note: '人教版二上 第8课', author: '唐 · 王之涣', paras: [
    '白日依山尽，黄河入海流。',
    '欲穷千里目，更上一层楼。'] },
  { id: 't6', title: '望庐山瀑布', em: '⛰️', note: '人教版二上 第8课', author: '唐 · 李白', paras: [
    '日照香炉生紫烟，遥看瀑布挂前川。',
    '飞流直下三千尺，疑是银河落九天。'] },
  { id: 'k12', title: '黄山奇石', em: '🪨', note: '人教版二上 第9课', paras: [
    '闻名中外的黄山风景区在我国安徽省南部。那里景色秀丽神奇，尤其是那些怪石，有趣极了。',
    '就说“仙桃石”吧，它好像从天上飞下来的一个大桃子，落在山顶的石盘上。',
    '在一座陡峭的山峰上，有一只“猴子”。它两只胳膊抱着腿，一动不动地蹲在山头，望着翻滚的云海。这就是有趣的“猴子观海”。',
    '“仙人指路”就更有趣了！远远望去，那巨石真像一位仙人站在高高的山峰上，伸着手臂指向前方。',
    '每当太阳升起，有座山峰上的几块巨石，就变成了一只金光闪闪的雄鸡。它伸着脖子，对着天都峰不住地啼叫。不用说，这就是著名的“金鸡叫天都”了。',
    '黄山的奇石还有很多，像“天狗望月”“狮子抢球”“仙女弹琴”……那些叫不出名字的奇形怪状的岩石，正等你去给它们起名字呢！'] },
  { id: 'k13', title: '日月潭', em: '🚣', note: '人教版二上 第10课', paras: [
    '日月潭是我国台湾省最大的一个湖。它在台中附近的高山上。那里群山环绕，树木茂盛，周围有许多名胜古迹。',
    '日月潭很深，湖水碧绿。湖中央有个美丽的小岛，叫光华岛。小岛把湖水分成两半，北边像圆圆的太阳，叫日潭；南边像弯弯的月亮，叫月潭。',
    '清晨，湖面上还有薄薄的雾。天边的晨星和山上的点点灯光，隐隐约约地倒映在湖水中。',
    '中午，太阳高照，整个日月潭的美景和周围的建筑，都清晰地展现在眼前。要是下起蒙蒙细雨，日月潭好像披上轻纱，周围的景物一片朦胧，就像童话中的仙境。',
    '日月潭风光秀丽，吸引了许许多多的中外游客。'] },
  { id: 'k14', title: '葡萄沟', em: '🍇', note: '人教版二上 第11课', paras: [
    '新疆吐鲁番有个地方叫葡萄沟，那里出产水果。五月有杏子，七八月有香梨、蜜桃、沙果，到九十月份，人们最喜爱的葡萄成熟了。',
    '葡萄种在山坡的梯田里。茂密的枝叶向四面展开，就像搭起了一个个绿色的凉棚。葡萄一大串一大串地挂在绿叶底下，有红的、白的、紫的、暗红的、淡绿的，五光十色，美丽极了。',
    '要是这时候你到葡萄沟去，热情好客的维吾尔族老乡，准会摘下最甜的葡萄，让你吃个够。',
    '收下来的葡萄有的运到城市去，有的运到阴房里制成葡萄干。阴房修在山坡上，样子很像碉堡，四周留着许多小孔，里面钉着许多木架子。成串的葡萄挂在架子上，利用流动的热空气，把水分蒸发掉，就成了葡萄干。这里生产的葡萄干颜色鲜，味道甜，非常有名。',
    '葡萄沟真是个好地方。'] },
  /* ===== 第五单元 ===== */
  { id: 'k15', title: '坐井观天', em: '🐸', note: '人教版二上 第12课', paras: [
    '青蛙坐在井里。小鸟飞来，落在井沿上。',
    '青蛙问小鸟：“你从哪儿来呀？”',
    '小鸟回答说：“我从天上来，飞了一百多里，口渴了，下来找点水喝。”',
    '青蛙说：“朋友，别说大话了！天不过井口那么大，还用飞那么远吗？”',
    '小鸟说：“你弄错了。天无边无际，大得很哪！”',
    '青蛙笑了，说：“朋友，我天天坐在井里，一抬头就能看见天。我不会弄错的。”',
    '小鸟也笑了，说：“朋友，你是弄错了。不信，你跳出井来看一看吧。”'] },
  { id: 'k16', title: '寒号鸟', em: '🐦', note: '人教版二上 第13课', paras: [
    '山脚下有一堵石崖，崖上有一道缝，寒号鸟就把这道缝当做自己的窝。石崖前面有一条河，河边有一棵大杨树，杨树上住着喜鹊。寒号鸟和喜鹊面对面住着，成了邻居。',
    '几阵秋风，树叶落尽，冬天快要到了。',
    '有一天，天气晴朗。喜鹊一早飞出去，东寻西找，衔回来一些枯草，就忙着做窝，准备过冬。寒号鸟却整天飞出去玩，累了就回来睡觉。喜鹊说：“寒号鸟，别睡了。天气暖和，赶快做窝。”',
    '寒号鸟不听劝告，躺在崖缝里对喜鹊说：“傻喜鹊，不要吵。太阳暖和，正好睡觉。”',
    '冬天说到就到，寒风呼呼地刮着。喜鹊住在温暖的窝里。寒号鸟在崖缝里冻得直打哆嗦，不停地叫着：“哆啰啰，哆啰啰，寒风冻死我，明天就做窝。”',
    '第二天清早，风停了，太阳暖暖的，好像又是春天了。喜鹊来到崖缝前劝寒号鸟：“趁天晴，快做窝。现在懒惰，将来难过。”',
    '寒号鸟还是不听劝告，伸伸懒腰，答道：“傻喜鹊，别啰嗦。天气暖和，得过且过。”',
    '寒冬腊月，大雪纷飞。北风像狮子一样狂吼，崖缝里冷得像冰窖。寒号鸟重复着哀号：“哆啰啰，哆啰啰，寒风冻死我，明天就做窝。”',
    '天亮了，太阳出来了，喜鹊在枝头呼唤寒号鸟。可是，寒号鸟已经在半夜里冻死了。'] },
  { id: 'k17', title: '我要的是葫芦', em: '🥒', note: '人教版二上 第14课', paras: [
    '从前，有个人种了一棵葫芦。细长的葫芦藤上长满了绿叶，开出了几朵雪白的小花。花谢以后，藤上挂了几个小葫芦。多么可爱的小葫芦哇！那个人每天都要去看几次。',
    '有一天，他看见叶子上爬着一些蚜虫，心里想，有几个虫子怕什么！他盯着小葫芦自言自语地说：“我的小葫芦，快长啊，快长啊！长得赛过大南瓜才好呢！”',
    '一个邻居看见了，对他说：“别光盯着葫芦了，叶子上生了蚜虫，快治一治吧！”那个人感到很奇怪，说：“什么？叶子上的虫还用治？我要的是葫芦。”',
    '没过几天，叶子上的蚜虫更多了。小葫芦慢慢地变黄了，一个一个都落了。'] },
  /* ===== 第六单元 ===== */
  { id: 'k18', title: '大禹治水', em: '🌊', note: '人教版二上 第15课', paras: [
    '很久很久以前，洪水经常泛滥。大水淹没了田地，冲毁了房屋，毒蛇猛兽到处伤害人们和牲畜，人们的生活痛苦极了。',
    '洪水给百姓带来了无数的灾难，必须治好它。当时，一个名叫鲧的人领着大家治水。他只知道筑坝挡水，九年过去了，洪水仍然没有消退。他的儿子禹继续治水。',
    '禹离开了家乡，一去就是十三年。这十三年里，他到处奔走，曾经三次路过自己家门口。可是他认为治水要紧，一次也没有走进家门看一看。',
    '禹吸取了鲧治水失败的教训，采用疏导的办法治水。他和千千万万的人一起，疏通了很多河道，让洪水通过河道，最后流到大海里去。洪水终于退了，毒蛇猛兽被驱赶走了，人们把家搬了回来。大家在被水淹过的土地上耕种，农业生产渐渐恢复了，百姓重新过上了安居乐业的生活。'] },
  { id: 'k19', title: '朱德的扁担', em: '🧺', note: '人教版二上 第16课', paras: [
    '1928年，朱德同志带领队伍到井冈山，跟毛泽东同志带领的队伍会师了。红军在山上，山下不远处就是敌人。',
    '红军要巩固井冈山根据地，粉碎敌人的围攻，需要储备足够的粮食。井冈山上生产的粮食不多，常常要抽出一些人到山下去挑粮。从井冈山到茅坪，来回有五六十里，山高路陡，非常难走。可是每次挑粮，大家都争着去。',
    '朱德同志也跟战士们一块儿去挑粮。他穿着草鞋，戴着斗笠，挑起粮食，跟大家一块儿爬山。白天挑粮爬山，晚上还常常整夜整夜地研究怎样跟敌人打仗。大家看了心疼，就把他那根扁担藏了起来。不料，朱德同志又找来一根扁担，写上“朱德的扁担”五个字。',
    '大家见了，越发敬爱朱德同志，不好意思再藏他的扁担了。'] },
  { id: 'k20', title: '难忘的泼水节', em: '💦', note: '人教版二上 第17课', paras: [
    '火红火红的凤凰花开了，傣族人民一年一度的泼水节又到了。',
    '今年的泼水节，傣族人民特别高兴，因为敬爱的周恩来总理和他们一起过泼水节。',
    '周总理身穿对襟白褂，咖啡色长裤，头上包着一条水红色头巾，笑容满面地来到人群中间。他一手端着盛满清水的银碗，一手拿着柏树枝蘸了水，向人们泼洒，为人们祝福。',
    '开始泼水了。傣族人民一边欢呼，一边向周总理泼水，祝福他健康长寿。清清的水，泼呀，洒呀。周总理和傣族人民笑哇，跳哇，是那么开心。',
    '多么幸福哇，1961年的泼水节！多么令人难忘啊，1961年的泼水节！'] },
  /* ===== 第七、八单元 ===== */
  { id: 't10', title: '夜宿山寺', em: '🌌', note: '人教版二上 第18课', author: '唐 · 李白', paras: [
    '危楼高百尺，手可摘星辰。',
    '不敢高声语，恐惊天上人。'] },
  { id: 't11', title: '敕勒歌', em: '🐎', note: '人教版二上 第18课', author: '北朝民歌', paras: [
    '敕勒川，阴山下。',
    '天似穹庐，笼盖四野。',
    '天苍苍，野茫茫，风吹草低见牛羊。'] },
  { id: 'k21', title: '雾在哪里', em: '🌫️', note: '人教版二上 第19课', paras: [
    '从前有一片雾，他是个又淘气又顽皮的孩子。',
    '有一天，雾飞到海上。“我要把大海藏起来。”于是，他把大海藏了起来。无论是海水、船只，还是蓝色的远方，都看不见了。',
    '“现在我要把天空连同太阳一起藏起来。”于是，他把天空连同太阳一起藏了起来。霎时，四周变暗了，无论是天空，还是天空中的太阳，都看不见了。',
    '雾来到了岸边。“现在我要把海岸藏起来。”雾把海岸藏了起来，同时也把城市藏了起来。房屋、街道、树木、桥梁，甚至行人和小黑猫，雾把一切都藏了起来，什么都看不见了。',
    '他躲在城市的上空，说道：“现在，我该把谁藏起来呢？看来，再也没有可藏的了。我要把自己藏起来。”雾把自己藏了起来。',
    '不久，大海连同船只和远方，天空连同太阳，海岸连同城市，街道连同房屋和桥梁，都露出来了。行人和小黑猫也出现了。雾呢？消失了。'] },
  { id: 'k22', title: '雪孩子', em: '⛄', note: '人教版二上 第20课', paras: [
    '雪，下个不停，一连下了好几天。这天早上，天晴了，兔妈妈要出门去。她对小白兔说：“你乖乖在家里，妈妈去买萝卜，一会儿就回来。”',
    '兔妈妈在门外堆了个雪孩子，让小白兔有个小伙伴。小白兔跳舞给雪孩子看，唱歌给雪孩子听。他玩累了，就回家去睡午觉。',
    '不料，火把旁边的柴堆烧着了！小白兔睡得正香，一点儿也不知道。',
    '雪孩子看见小白兔家着火了，就飞快地跑去救火。他冲进屋里，冒着呛人的烟、烫人的火，找哇找哇，终于找到了小白兔。他一把抱起小白兔，冲了出来。',
    '雪孩子浑身水淋淋的。小白兔得救了，雪孩子却化成了一摊水。',
    '“雪孩子怎么不见了呢？”小白兔伤心极了。',
    '瞧，太阳公公暖暖地照着，那摊水慢慢地变成了一缕很轻很轻的水汽，飞上天空，变成了一朵美丽的白云，一朵美丽的白云，飘飘悠悠地飞向高空，飞向远方……'] },
  { id: 'k23', title: '狐假虎威', em: '🦊', note: '人教版二上 第21课', paras: [
    '在茂密的森林里，有一只老虎正在寻找食物。一只狐狸从老虎身边窜过。老虎扑过去，把狐狸逮住了。',
    '狐狸眼珠子骨碌一转，扯着嗓子问老虎：“你敢吃我？”',
    '“为什么不敢？”老虎一愣。',
    '“老天爷派我来做你们的首领，你敢吃我？”狐狸摇了摇尾巴，“不信，你就跟在我后面到森林里走一趟，看百兽见了我是不是都吓跑。”',
    '老虎跟着狐狸朝森林深处走去。狐狸神气活现，摇头摆尾；老虎半信半疑，东张西望。',
    '森林里的野猪啦，小鹿啦，兔子啦，看见狐狸大摇大摆地走过来，跟往常很不一样，都很纳闷。再往狐狸身后一看，呀，一只大老虎！大大小小的野兽吓得撒腿就跑。',
    '老虎信以为真。其实他受骗了。原来，狐狸是借着老虎的威风把百兽吓跑的。'] },
  { id: 'k24', title: '狐狸分奶酪', em: '🧀', note: '人教版二上 第22课', paras: [
    '熊哥哥和熊弟弟在路上捡到一块奶酪，很高兴，可是他们不知道怎么分这块奶酪，哥儿俩开始拌起嘴来。',
    '这时有只狐狸跑了过来，笑着说：“好啦好啦，别吵了，我来帮你们分吧。”',
    '狐狸接过奶酪，真的开始分了，分成了两半。可是左边的大了点儿，狐狸说：“真的分得不匀吗？那我把大的这边咬一口。”于是他咬了左边一口。右边又大了点儿，他又把右边咬了一口。就这样轮流的，狐狸咬着咬着，两半奶酪都只剩下一点点了。',
    '哥儿俩着急了：“这块奶酪就剩这么一点儿了呀！”狐狸却说：“这可不能怪我。你们为半块奶酪吵个不停，我只好都帮你们吃掉啦。”',
    '两只小熊你看看我，我看看你，都后悔极了。'] },
  { id: 'k25', title: '纸船和风筝', em: '⛵', note: '人教版二上 第23课', paras: [
    '松鼠和小熊住在一座山上。松鼠的家在山顶，小熊的家在山脚。一条小溪从山上流下来，正好从小熊家门口流过。',
    '松鼠折了一只纸船，放在小溪里。纸船漂哇漂，漂到了小熊家门口。小熊拿起纸船一看，乐坏了。纸船里放着一个小松果，松果上挂着一张纸条，上面写着：“祝你快乐！”',
    '小熊也想折一只纸船送给松鼠。可是纸船不能漂到山上去。他扎了一只风筝。风筝乘着风，飘哇飘，飘到了松鼠家门口。松鼠一把抓住风筝的线一看，也乐坏了。风筝上挂着一个草莓，风筝的翅膀上写着：“祝你幸福！”',
    '纸船和风筝让他们俩成了好朋友。',
    '可是，有一天，他们俩为了一点儿小事吵了一架。山顶上再也看不到飘荡的风筝，小溪里再也看不到漂流的纸船了。',
    '小熊很难过。他还是每天扎一只风筝，但是不好意思把风筝放起来，就把风筝挂在了高高的树枝上。松鼠也很难过。他还是每天折一只纸船，但是不好意思把纸船放进小溪，就把纸船放在了屋顶上。',
    '过了几天，松鼠再也受不了啦。他在一只折好的纸船上写了一句话：“如果你愿意和好，就放一只风筝吧！”然后把纸船放进了小溪里。',
    '傍晚，松鼠看见一只美丽的风筝朝他飞来，高兴得哭了。他连忙爬上屋顶，把一只只纸船放到了小溪里。'] },
  { id: 'k26', title: '风娃娃', em: '🌬️', note: '人教版二上 第24课', paras: [
    '风妈妈有个可爱的风娃娃。风娃娃长大了，他想像妈妈一样去帮助人。风妈妈说：“到田野里去吧，在那里，你可以帮人们做很多事情。”',
    '风娃娃来到田野，看见一架大风车正在慢慢转动，抽上来的水断断续续地流着。他深深地吸了一口气，鼓起腮帮，使劲向风车吹去。哈哈，风车转得飞快！抽上来的水奔跑着，向田里流去。秧苗喝足了水，笑着不住地点头，风娃娃也高兴极了。',
    '河边，许多纤夫正拉着一艘船。他们弯着腰，流着汗，喊着号子，船却走得很慢。风娃娃看见，赶紧过去用力吹。船飞快地跑了起来，纤夫们笑了，一边收起纤绳，一边向风娃娃表示感谢。',
    '风娃娃想：帮助人们做事，原来这么容易，只要有力气就行。他这么想着，来到一个村子里。他看见几个孩子在放风筝，就过去使劲吹。风筝被吹得无影无踪，孩子们伤心极了。',
    '风娃娃却一点儿也不知道，他仍然东吹吹，西吹吹。就这样，他吹跑了人们晒的衣服，折断了路边新栽的小树……人们都责怪他。',
    '风娃娃不敢再去帮忙了，他委屈地在天上转着、想着：我帮人们做事情，为什么他们还责怪我呢？风娃娃回家去问妈妈。妈妈说：“孩子，做事情光有好的愿望还不行，还要看是不是真的对别人有用。”'] },

{id: "c25",kp: "量词",kind: "choice",text: "一（　）小鸟",opts: ["只","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c26",kp: "量词",kind: "choice",text: "一（　）鱼",opts: ["条","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c27",kp: "量词",kind: "choice",text: "一（　）山",opts: ["座","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c28",kp: "量词",kind: "choice",text: "一（　）花",opts: ["朵","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c29",kp: "量词",kind: "choice",text: "一（　）书",opts: ["本","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c30",kp: "量词",kind: "choice",text: "一（　）树",opts: ["棵","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c31",kp: "量词",kind: "choice",text: "一（　）牛",opts: ["头","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c32",kp: "量词",kind: "choice",text: "一（　）马",opts: ["匹","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c33",kp: "量词",kind: "choice",text: "一（　）伞",opts: ["把","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c34",kp: "量词",kind: "choice",text: "一（　）船",opts: ["艘","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c35",kp: "量词",kind: "choice",text: "一（　）画",opts: ["幅","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c36",kp: "量词",kind: "choice",text: "一（　）飞机",opts: ["架","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c37",kp: "量词",kind: "choice",text: "一（　）车",opts: ["辆","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c38",kp: "量词",kind: "choice",text: "一（　）纸",opts: ["张","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c39",kp: "量词",kind: "choice",text: "一（　）井",opts: ["口","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c40",kp: "量词",kind: "choice",text: "一（　）衣服",opts: ["件","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c41",kp: "量词",kind: "choice",text: "一（　）鞋",opts: ["双","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c42",kp: "量词",kind: "choice",text: "一（　）旗",opts: ["面","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c43",kp: "量词",kind: "choice",text: "一（　）星星",opts: ["颗","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c44",kp: "量词",kind: "choice",text: "一（　）葡萄",opts: ["串","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c45",kp: "量词",kind: "choice",text: "一（　）门",opts: ["扇","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c46",kp: "量词",kind: "choice",text: "一（　）歌",opts: ["首","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c47",kp: "量词",kind: "choice",text: "一（　）桥",opts: ["座","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c48",kp: "量词",kind: "choice",text: "一（　）帽子",opts: ["顶","个","条","片"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c49",kp: "量词",kind: "choice",text: "一（　）刀",opts: ["把","条","个","座"],ans: 0,exp: "量词要和事物搭配。"},
{id: "c50",kp: "反义词",kind: "choice",text: "“大”的反义词是（　）。",opts: ["小","长","一样","多"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c51",kp: "反义词",kind: "choice",text: "“上”的反义词是（　）。",opts: ["下","里","外","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c52",kp: "反义词",kind: "choice",text: "“高”的反义词是（　）。",opts: ["低","胖","一样","远"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c53",kp: "反义词",kind: "choice",text: "“长”的反义词是（　）。",opts: ["短","细","宽","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c54",kp: "反义词",kind: "choice",text: "“多”的反义词是（　）。",opts: ["少","半","一样","整"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c55",kp: "反义词",kind: "choice",text: "“开”的反义词是（　）。",opts: ["关","拉","推","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c56",kp: "反义词",kind: "choice",text: "“来”的反义词是（　）。",opts: ["去","回","一样","到"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c57",kp: "反义词",kind: "choice",text: "“白”的反义词是（　）。",opts: ["黑","红","蓝","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c58",kp: "反义词",kind: "choice",text: "“快”的反义词是（　）。",opts: ["慢","跑","一样","走"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c59",kp: "反义词",kind: "choice",text: "“远”的反义词是（　）。",opts: ["近","东","西","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c60",kp: "反义词",kind: "choice",text: "“左”的反义词是（　）。",opts: ["右","前","一样","后"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c61",kp: "反义词",kind: "choice",text: "“前”的反义词是（　）。",opts: ["后","左","右","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c62",kp: "反义词",kind: "choice",text: "“里”的反义词是（　）。",opts: ["外","上","一样","中"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c63",kp: "反义词",kind: "choice",text: "“东”的反义词是（　）。",opts: ["西","南","北","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c64",kp: "反义词",kind: "choice",text: "“南”的反义词是（　）。",opts: ["北","上","一样","下"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c65",kp: "反义词",kind: "choice",text: "“胖”的反义词是（　）。",opts: ["瘦","高","矮","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c66",kp: "反义词",kind: "choice",text: "“细”的反义词是（　）。",opts: ["粗","长","一样","短"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c67",kp: "反义词",kind: "choice",text: "“深”的反义词是（　）。",opts: ["浅","高","低","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c68",kp: "反义词",kind: "choice",text: "“冷”的反义词是（　）。",opts: ["热","凉","一样","温"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c69",kp: "反义词",kind: "choice",text: "“苦”的反义词是（　）。",opts: ["甜","酸","辣","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c70",kp: "反义词",kind: "choice",text: "“忙”的反义词是（　）。",opts: ["闲","累","一样","快"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c71",kp: "反义词",kind: "choice",text: "“黑”的反义词是（　）。",opts: ["白","灰","蓝","一样"],ans: 0,exp: "反义词就是意思相反的词。"},
{id: "c72",kp: "近义词",kind: "choice",text: "“高兴”的近义词是（　）。",opts: ["开心","生气","相反","难过"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c73",kp: "近义词",kind: "choice",text: "“美丽”的近义词是（　）。",opts: ["漂亮","丑陋","难看","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c74",kp: "近义词",kind: "choice",text: "“立刻”的近义词是（　）。",opts: ["马上","等待","相反","迟到"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c75",kp: "近义词",kind: "choice",text: "“著名”的近义词是（　）。",opts: ["有名","无名","普通","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c76",kp: "近义词",kind: "choice",text: "“帮助”的近义词是（　）。",opts: ["帮忙","捣乱","相反","破坏"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c77",kp: "近义词",kind: "choice",text: "“寒冷”的近义词是（　）。",opts: ["冰冷","炎热","温暖","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c78",kp: "近义词",kind: "choice",text: "“赶快”的近义词是（　）。",opts: ["连忙","缓慢","相反","迟疑"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c79",kp: "近义词",kind: "choice",text: "“仔细”的近义词是（　）。",opts: ["认真","马虎","粗心","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c80",kp: "近义词",kind: "choice",text: "“盼望”的近义词是（　）。",opts: ["希望","放弃","相反","失望"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c81",kp: "近义词",kind: "choice",text: "“保护”的近义词是（　）。",opts: ["爱护","伤害","破坏","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c82",kp: "近义词",kind: "choice",text: "“常常”的近义词是（　）。",opts: ["经常","偶尔","相反","从来"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c83",kp: "近义词",kind: "choice",text: "“喜爱”的近义词是（　）。",opts: ["喜欢","讨厌","厌恶","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c84",kp: "近义词",kind: "choice",text: "“办法”的近义词是（　）。",opts: ["方法","问题","相反","答案"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c85",kp: "近义词",kind: "choice",text: "“忽然”的近义词是（　）。",opts: ["突然","慢慢","渐渐","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c86",kp: "近义词",kind: "choice",text: "“开心”的近义词是（　）。",opts: ["快乐","伤心","相反","痛苦"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c87",kp: "近义词",kind: "choice",text: "“温暖”的近义词是（　）。",opts: ["暖和","寒冷","冰凉","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c88",kp: "近义词",kind: "choice",text: "“明亮”的近义词是（　）。",opts: ["亮堂","黑暗","相反","昏暗"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c89",kp: "近义词",kind: "choice",text: "“好像”的近义词是（　）。",opts: ["仿佛","确定","肯定","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c90",kp: "近义词",kind: "choice",text: "“礼物”的近义词是（　）。",opts: ["礼品","奖励","相反","惩罚"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c91",kp: "近义词",kind: "choice",text: "“表扬”的近义词是（　）。",opts: ["夸奖","批评","责怪","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c92",kp: "近义词",kind: "choice",text: "“着急”的近义词是（　）。",opts: ["焦急","安心","相反","放心"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c93",kp: "近义词",kind: "choice",text: "“中心”的近义词是（　）。",opts: ["中间","边缘","四周","相反"],ans: 0,exp: "近义词就是意思相近的词。"},
{id: "c94",kp: "多音字与辨音",kind: "choice",text: "“行”在“行走”中读：",opts: ["xíng","háng"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c95",kp: "多音字与辨音",kind: "choice",text: "“行”在“银行”中读：",opts: ["háng","xíng"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c96",kp: "多音字与辨音",kind: "choice",text: "“长”在“长短”中读：",opts: ["cháng","zhǎng"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c97",kp: "多音字与辨音",kind: "choice",text: "“长”在“长大”中读：",opts: ["zhǎng","cháng"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c98",kp: "多音字与辨音",kind: "choice",text: "“好”在“好人”中读：",opts: ["hǎo","hào"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c99",kp: "多音字与辨音",kind: "choice",text: "“好”在“爱好”中读：",opts: ["hào","hǎo"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c100",kp: "多音字与辨音",kind: "choice",text: "“乐”在“快乐”中读：",opts: ["lè","yuè"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c101",kp: "多音字与辨音",kind: "choice",text: "“乐”在“音乐”中读：",opts: ["yuè","lè"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c102",kp: "多音字与辨音",kind: "choice",text: "“发”在“发现”中读：",opts: ["fā","fà"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c103",kp: "多音字与辨音",kind: "choice",text: "“还”在“还有”中读：",opts: ["hái","huán"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c104",kp: "多音字与辨音",kind: "choice",text: "“种”在“种树”中读：",opts: ["zhòng","zhǒng"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c105",kp: "多音字与辨音",kind: "choice",text: "“空”在“天空”中读：",opts: ["kōng","kòng"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c106",kp: "多音字与辨音",kind: "choice",text: "“教”在“教书”中读：",opts: ["jiāo","jiào"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c107",kp: "多音字与辨音",kind: "choice",text: "“为”在“因为”中读：",opts: ["wèi","wéi"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c108",kp: "多音字与辨音",kind: "choice",text: "“曲”在“歌曲”中读：",opts: ["qǔ","qū"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c109",kp: "多音字与辨音",kind: "choice",text: "“春”的读音是：",opts: ["chūn","cūn","chún"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c110",kp: "多音字与辨音",kind: "choice",text: "“晒”的读音是：",opts: ["shài","sài"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c111",kp: "多音字与辨音",kind: "choice",text: "“察”的读音是：",opts: ["chá","cá"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c112",kp: "多音字与辨音",kind: "choice",text: "“邻”的读音是：",opts: ["lín","líng"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c113",kp: "多音字与辨音",kind: "choice",text: "“毯”的读音是：",opts: ["tǎn","dǎn"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c114",kp: "多音字与辨音",kind: "choice",text: "“疆”的读音是：",opts: ["jiāng","qiāng"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c115",kp: "多音字与辨音",kind: "choice",text: "“维”的读音是：",opts: ["wéi","wěi"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c116",kp: "多音字与辨音",kind: "choice",text: "“仙”的读音是：",opts: ["xiān","qiān"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c117",kp: "多音字与辨音",kind: "choice",text: "“巨”的读音是：",opts: ["jù","zhù"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c118",kp: "多音字与辨音",kind: "choice",text: "“啪”的读音是：",opts: ["pā","pá"],ans: 0,py: true,exp: "注意多音字在不同词语里的读音。"},
{id: "c119",kp: "部首",kind: "choice",text: "“河”字的部首是（　）。",opts: ["氵","木","氵","口"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c120",kp: "部首",kind: "choice",text: "“海”字的部首是（　）。",opts: ["氵","艹","女","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c121",kp: "部首",kind: "choice",text: "“花”字的部首是（　）。",opts: ["艹","虫","氵","口"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c122",kp: "部首",kind: "choice",text: "“菜”字的部首是（　）。",opts: ["艹","木","扌","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c123",kp: "部首",kind: "choice",text: "“吃”字的部首是（　）。",opts: ["口","氵","氵","日"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c124",kp: "部首",kind: "choice",text: "“唱”字的部首是（　）。",opts: ["口","讠","日","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c125",kp: "部首",kind: "choice",text: "“跑”字的部首是（　）。",opts: ["足","口","氵","走"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c126",kp: "部首",kind: "choice",text: "“跳”字的部首是（　）。",opts: ["足","兆","口","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c127",kp: "部首",kind: "choice",text: "“打”字的部首是（　）。",opts: ["扌","丁","氵","手"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c128",kp: "部首",kind: "choice",text: "“拍”字的部首是（　）。",opts: ["扌","白","足","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c129",kp: "部首",kind: "choice",text: "“妈”字的部首是（　）。",opts: ["女","马","氵","口"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c130",kp: "部首",kind: "choice",text: "“姑”字的部首是（　）。",opts: ["女","古","氵","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c131",kp: "部首",kind: "choice",text: "“树”字的部首是（　）。",opts: ["木","又","氵","寸"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c132",kp: "部首",kind: "choice",text: "“桥”字的部首是（　）。",opts: ["木","乔","车","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c133",kp: "部首",kind: "choice",text: "“晴”字的部首是（　）。",opts: ["日","青","氵","目"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c134",kp: "部首",kind: "choice",text: "“晒”字的部首是（　）。",opts: ["日","西","氵","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c135",kp: "部首",kind: "choice",text: "“鸡”字的部首是（　）。",opts: ["鸟","又","氵","鸡"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c136",kp: "部首",kind: "choice",text: "“说”字的部首是（　）。",opts: ["讠","兑","口","氵"],ans: 0,exp: "部首是汉字字典里归类的偏旁。"},
{id: "c137",kp: "形近字",kind: "choice",text: "（　）天白云",opts: ["青","清","晴","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c138",kp: "形近字",kind: "choice",text: "河水很（　）。",opts: ["清","青","情","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c139",kp: "形近字",kind: "choice",text: "（　）你帮帮我。",opts: ["请","情","清","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c140",kp: "形近字",kind: "choice",text: "我（　）家里看书。",opts: ["在","再","坐","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c141",kp: "形近字",kind: "choice",text: "（　）见！",opts: ["再","在","早","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c142",kp: "形近字",kind: "choice",text: "（　）步走。",opts: ["进","近","远","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c143",kp: "形近字",kind: "choice",text: "公园离我家很（　）。",opts: ["近","进","远","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c144",kp: "形近字",kind: "choice",text: "认真（　）作业。",opts: ["做","作","坐","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c145",kp: "形近字",kind: "choice",text: "今天的（　）业很少。",opts: ["作","做","昨","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c146",kp: "形近字",kind: "choice",text: "大（　）的鼻子像钩子。",opts: ["象","像","相","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c147",kp: "形近字",kind: "choice",text: "她长得（　）妈妈。",opts: ["像","象","相","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c148",kp: "形近字",kind: "choice",text: "果（　）熟了。",opts: ["园","圆","远","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c149",kp: "形近字",kind: "choice",text: "公（　）里开满了花。",opts: ["园","圆","远","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c150",kp: "形近字",kind: "choice",text: "泡泡（　）了。",opts: ["破","泡","跑","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c151",kp: "形近字",kind: "choice",text: "小（　）跑得快。",opts: ["猫","描","锚","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c152",kp: "形近字",kind: "choice",text: "（　）音很准。",opts: ["发","友","反","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c153",kp: "形近字",kind: "choice",text: "（　）相看一看。",opts: ["互","工","上","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c154",kp: "形近字",kind: "choice",text: "（　）伞真好看。",opts: ["花","画","话","都不对"],ans: 0,exp: "形近字要结合词语意思来选。"},
{id: "c155",kp: "词语补全",kind: "choice",text: "四（　）八方",opts: ["面","红","都","天"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c156",kp: "词语补全",kind: "choice",text: "山（　）水秀",opts: ["清","青","绿","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c157",kp: "词语补全",kind: "choice",text: "五（　）六色",opts: ["颜","言","都","盐"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c158",kp: "词语补全",kind: "choice",text: "（　）发百中",opts: ["百","四","万","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c159",kp: "词语补全",kind: "choice",text: "七（　）八下",opts: ["上","下","都","左"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c160",kp: "词语补全",kind: "choice",text: "九（　）一毛",opts: ["牛","马","羊","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c161",kp: "词语补全",kind: "choice",text: "（　）张西望",opts: ["东","南","都","北"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c162",kp: "词语补全",kind: "choice",text: "南（　）北往",opts: ["来","去","上","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c163",kp: "词语补全",kind: "choice",text: "井底之（　）",opts: ["蛙","鱼","都","鸟"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c164",kp: "词语补全",kind: "choice",text: "（　）高云淡",opts: ["天","地","山","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c165",kp: "词语补全",kind: "choice",text: "花红（　）绿",opts: ["柳","桃","都","树"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c166",kp: "词语补全",kind: "choice",text: "春暖（　）开",opts: ["花","冷","雨","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c167",kp: "词语补全",kind: "choice",text: "（　）回大地",opts: ["春","夏","都","秋"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c168",kp: "词语补全",kind: "choice",text: "万物复（　）",opts: ["苏","醒","动","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c169",kp: "词语补全",kind: "choice",text: "（　）象更新",opts: ["万","千","都","百"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c170",kp: "词语补全",kind: "choice",text: "一（　）当先",opts: ["马","牛","象","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c171",kp: "词语补全",kind: "choice",text: "心（　）手巧",opts: ["灵","手","都","眼"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c172",kp: "词语补全",kind: "choice",text: "（　）实累累",opts: ["硕","果","丰","都"],ans: 0,exp: "把词语补充完整，平时要多积累。"},
{id: "c173",kp: "标点符号",kind: "choice"},
{id: "c174",kp: "标点符号",kind: "choice"},
{id: "c175",kp: "标点符号",kind: "choice"},
{id: "c176",kp: "标点符号",kind: "choice"},
{id: "c177",kp: "标点符号",kind: "choice",text: "空处应填：这是多么美好的礼物（　）",opts: ["。","？","！"],ans: 2,exp: "根据句子的语气选择标点。"},
{id: "c178",kp: "标点符号",kind: "choice",text: "空处应填：你叫什么名字（　）",opts: ["。","？","！"],ans: 1,exp: "根据句子的语气选择标点。"},
{id: "c179",kp: "标点符号",kind: "choice",text: "空处应填：今天天气真好（　）",opts: ["。","？","！"],ans: 0,exp: "根据句子的语气选择标点。"},
{id: "c180",kp: "标点符号",kind: "choice",text: "空处应填：我们一起去公园玩（　）",opts: ["。","？","！"],ans: 2,exp: "根据句子的语气选择标点。"},
{id: "c181",kp: "标点符号",kind: "choice",text: "空处应填：为什么天空是蓝色的（　）",opts: ["。","？","！"],ans: 1,exp: "根据句子的语气选择标点。"},
{id: "c182",kp: "标点符号",kind: "choice",text: "空处应填：小树慢慢长大了（　）",opts: ["。","？","！"],ans: 0,exp: "根据句子的语气选择标点。"},
{id: "c183",kp: "标点符号",kind: "choice",text: "空处应填：（　），小明终于到了终点。",opts: ["。","？","！"],ans: -1,exp: "根据句子的语气选择标点。"},
{id: "c184",kp: "标点符号",kind: "choice",text: "空处应填：读书要用心（　）不能三心二意。",opts: ["。","？","！"],ans: -1,exp: "根据句子的语气选择标点。"},
{id: "c185",kp: "积累与课文",kind: "choice",text: "白日依山尽，黄河入海（　）。",opts: ["流","大海","高山","天空"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c186",kp: "积累与课文",kind: "choice",text: "欲穷千里目，更上（　）。",opts: ["一层楼","远方","大海","高山"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c187",kp: "积累与课文",kind: "choice",text: "飞流直下三千尺，疑是银河落（　）。",opts: ["九天","大海","高山","天空"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c188",kp: "积累与课文",kind: "choice",text: "危楼高百尺，手可摘（　）。",opts: ["星辰","远方","大海","高山"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c189",kp: "积累与课文",kind: "choice",text: "天苍苍，野茫茫，风吹草低（　）。",opts: ["见牛羊","大海","高山","天空"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c190",kp: "积累与课文",kind: "choice",text: "孩子如果已经长大，就得告别妈妈，（　）。",opts: ["四海为家","远方","大海","高山"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c191",kp: "积累与课文",kind: "choice",text: "蒲公英妈妈准备了（　），把它送给自己的娃娃。",opts: ["降落伞","大海","高山","天空"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c192",kp: "积累与课文",kind: "choice",text: "苍耳妈妈给孩子穿上带刺的（　）。",opts: ["铠甲","远方","大海","高山"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c193",kp: "积累与课文",kind: "choice",text: "大青蛙披着碧绿的衣裳，露着（　）的肚皮。",opts: ["雪白","大海","高山","天空"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c194",kp: "积累与课文",kind: "choice",text: "日月潭湖中央有个美丽的小岛，叫（　）。",opts: ["光华岛","远方","大海","高山"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c195",kp: "积累与课文",kind: "choice",text: "曹冲是（　）的儿子。",opts: ["曹操","大海","高山","天空"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c196",kp: "积累与课文",kind: "choice",text: "朱德的扁担上写着“（　）”五个字。",opts: ["朱德的扁担","远方","大海","高山"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c197",kp: "积累与课文",kind: "choice",text: "狐狸是借着（　）的威风把百兽吓跑的。",opts: ["老虎","大海","高山","天空"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c198",kp: "积累与课文",kind: "choice",text: "小蝌蚪的妈妈头顶上有两只（　）。",opts: ["大眼睛","远方","大海","高山"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c199",kp: "积累与课文",kind: "choice",text: "豌豆妈妈让豆荚晒在太阳底下，豆荚（　）开，孩子们就蹦着跳着离开妈妈。",opts: ["炸","大海","高山","天空"],ans: 0,exp: "课文和古诗要熟读成诵。"},
{id: "c200",kp: "积累与课文",kind: "choice",text: "雾是个又淘气又（　）的孩子。",opts: ["顽皮","远方","大海","高山"],ans: 0,exp: "课文和古诗要熟读成诵。"},

];

/* ---------- 古诗填空 ---------- */
const POEMS = [
  { title: '登鹳雀楼', author: '唐 · 王之涣', lines: ['白日依山尽', '黄河入海流', '欲穷千里目', '更上一层楼'],
    blanks: [
      { li: 0, ch: '尽', opts: ['尽', '进', '近', '远'] },
      { li: 2, ch: '穷', opts: ['穷', '究', '容', '劳'] },
      { li: 3, ch: '楼', opts: ['楼', '流', '留', '搂'] }] },
  { title: '望庐山瀑布', author: '唐 · 李白', lines: ['日照香炉生紫烟', '遥看瀑布挂前川', '飞流直下三千尺', '疑是银河落九天'],
    blanks: [
      { li: 0, ch: '烟', opts: ['烟', '因', '音', '银'] },
      { li: 2, ch: '尺', opts: ['尺', '迟', '赤', '吃'] },
      { li: 3, ch: '疑', opts: ['疑', '拟', '以', '义'] }] },
  { title: '夜宿山寺', author: '唐 · 李白', lines: ['危楼高百尺', '手可摘星辰', '不敢高声语', '恐惊天上人'],
    blanks: [
      { li: 1, ch: '摘', opts: ['摘', '滴', '嘀', '商'] },
      { li: 3, ch: '惊', opts: ['惊', '京', '经', '睛'] }] },
  { title: '咏柳', author: '唐 · 贺知章', lines: ['碧玉妆成一树高', '万条垂下绿丝绦', '不知细叶谁裁出', '二月春风似剪刀'],
    blanks: [
      { li: 1, ch: '绦', opts: ['绦', '条', '调', '掉'] },
      { li: 2, ch: '裁', opts: ['裁', '栽', '载', '截'] },
      { li: 3, ch: '剪', opts: ['剪', '箭', '前', '煎'] }] },
  { title: '村居', author: '清 · 高鼎', lines: ['草长莺飞二月天', '拂堤杨柳醉春烟', '儿童散学归来早', '忙趁东风放纸鸢'],
    blanks: [
      { li: 0, ch: '莺', opts: ['莺', '萤', '荧', '莹'] },
      { li: 3, ch: '鸢', opts: ['鸢', '冤', '园', '远'] }] },
  { title: '绝句', author: '唐 · 杜甫', lines: ['两个黄鹂鸣翠柳', '一行白鹭上青天', '窗含西岭千秋雪', '门泊东吴万里船'],
    blanks: [
      { li: 0, ch: '鹂', opts: ['鹂', '丽', '力', '立'] },
      { li: 1, ch: '鹭', opts: ['鹭', '路', '露', '录'] },
      { li: 2, ch: '含', opts: ['含', '寒', '汗', '韩'] },
      { li: 3, ch: '泊', opts: ['泊', '伯', '柏', '百'] }] },
  { title: '晓出净慈寺送林子方', author: '宋 · 杨万里', lines: ['毕竟西湖六月中', '风光不与四时同', '接天莲叶无穷碧', '映日荷花别样红'],
    blanks: [
      { li: 1, ch: '同', opts: ['同', '桐', '铜', '童'] },
      { li: 2, ch: '碧', opts: ['碧', '壁', '璧', '必'] },
      { li: 3, ch: '映', opts: ['映', '应', '硬', '影'] }] }
];

/* ---------- 听写小达人（同音/形近字辨析） ---------- */
const DICTS = [
  { w: '清水', opts: ['清水', '晴水', '请水', '情水'] },
  { w: '天晴', opts: ['天晴', '天清', '天情', '天请'] },
  { w: '跑步', opts: ['跑步', '泡步', '抱步', '饱步'] },
  { w: '再见', opts: ['再见', '在见', '载见', '栽见'] },
  { w: '好像', opts: ['好像', '好象', '号向', '好向'] },
  { w: '进来', opts: ['进来', '近来', '近莱', '进莱'] },
  { w: '歌声', opts: ['歌声', '歌生', '哥声', '歌升'] },
  { w: '名字', opts: ['名字', '明字', '铭字', '鸣字'] },
  { w: '公园', opts: ['公园', '公圆', '公元', '公员'] },
  { w: '时候', opts: ['时候', '时猴', '石候', '时后'] },
  { w: '做事', opts: ['做事', '作事', '坐事', '做是'] },
  { w: '在家', opts: ['在家', '再家', '载家', '在佳'] }
];

/* ============================================================
   路由与页面骨架
   ============================================================ */
const TITLES = { home: '乐学二年级', calc: '口算训练', koujue: '乘法口诀', mquiz: '数学章节练习', clock: '认识钟表',
  cards: '识字卡片', card: '识字卡片', read: '课文朗读', dict: '听写小达人', py: '拼音专项', poem: '古诗填空', xpoem: '古诗学堂', xh: '看图写话', pquiz: '语文闯关',
  wrong: '错题本', me: '我的奖励', parent: '家长角', settings: '设置', profiles: '选择小朋友' };
const RENDER = {};
let screenName = '', curParams = null, navStack = [];

let cleanupFns = [], readSeq = 0, lastAct = Date.now(), tickCount = 0, storageOK = true;
function onLeave(fn) { cleanupFns.push(fn); }
function render(name, params) {
  screenName = name; curParams = params || {};
  while (cleanupFns.length) { try { cleanupFns.pop()(); } catch (e) {} }
  readSeq++;
  activePad = null;
  closeSheet();
  document.body.classList.remove('sideOpen');
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
  renderSide();
  const hdr = $('#hdr');
  if (name === 'profiles') { hdr.hidden = true; }
  else {
    hdr.hidden = false;
    $('#hdrTitle').textContent = TITLES[name] || '';
    $('#backBtn').hidden = (name === 'home');
    $('#hdrStar').hidden = !child || name === 'parent';
    if (child) $('#starN').textContent = cdata.stars;
  }
  const v = $('#view'); v.innerHTML = '';
  if (RENDER[name]) RENDER[name](v, curParams);
  window.scrollTo(0, 0);
}
function go(name, params) { navStack.push({ name: screenName, params: curParams }); render(name, params); }
function goHome() { navStack = []; render('home'); }
function goBack() { const p = navStack.pop(); render(p ? p.name : 'home', p ? p.params : null); }
$('#backBtn').onclick = goBack;

/* ---------- 左侧导航栏 ---------- */
$('#menuBtn').onclick = () => document.body.classList.toggle('sideOpen');
function renderSide() {
  const el = $('#side');
  if (!child) {
    el.innerHTML = '<div class="logo">🎒 乐学二年级</div>' +
      '<p class="muted" style="text-align:center;font-size:13px;padding:10px 8px">请先选择小朋友<br>开始学习哦</p>';
    return;
  }
  const navDefs = [
    null,
    { g: 'home', em: '🏠', nm: '首页' },
    '数学',
    { g: 'calc', em: '🧮', nm: '口算训练' },
    { g: 'koujue', em: '🎯', nm: '乘法口诀' },
    { g: 'mquiz', em: '📚', nm: '数学章节' },
    { g: 'clock', em: '🕐', nm: '认识钟表' },
    { g: 'exam', em: '📝', nm: '期末模拟卷' },
    '语文',
    { g: 'cards', em: '✍️', nm: '识字卡片' },
    { g: 'read', em: '📖', nm: '课文朗读' },
    { g: 'dict', em: '🎧', nm: '听写小达人' },
    { g: 'py', em: '🔤', nm: '拼音专项' },
    { g: 'poem', em: '🏮', nm: '古诗填空' },
    { g: 'xpoem', em: '📜', nm: '古诗学堂' },
    { g: 'xh', em: '🖍️', nm: '看图写话' },
    { g: 'pquiz', em: '🧩', nm: '语文闯关' },
    '我的',
    { g: 'wrong', em: '📒', nm: '错题本', badge: wrongDue() },
    { g: 'me', em: '🏅', nm: '我的奖励' },
    { g: 'settings', em: '⚙️', nm: '设置' },
    { g: 'parent', em: '👨‍👩‍👧', nm: '家长角', gate: true }
  ];
  el.innerHTML = '<div class="logo">🎒 乐学二年级</div>' +
    '<div class="who">' + child.av + ' ' + esc(child.name) + ' · ⭐' + cdata.stars + '</div>' +
    navDefs.map(it => {
      if (!it) return '<div style="height:2px"></div>';
      if (typeof it === 'string') return '<div class="grp">' + it + '</div>';
      return '<button class="snav' + (screenName === it.g ? ' on' : '') + '" data-n="' + it.g + '">' +
        '<span>' + it.em + '</span><span style="flex:1">' + it.nm + '</span>' +
        (it.badge ? '<span class="bdg">' + it.badge + '</span>' : '') + '</button>';
    }).join('');
  $$('#side [data-n]').forEach(b => b.onclick = () => {
    document.body.classList.remove('sideOpen');
    const g = b.dataset.n;
    if (g === 'parent') { parentGate(() => go('parent')); return; }
    if (g === screenName) return;
    go(g);
  });
}

/* ---------- 结算浮层 ---------- */
function showResult(ok, total, extra, cb) {
  const acc = total ? Math.round(ok / total * 100) : 0;
  const em = acc === 100 ? '🏆' : acc >= 80 ? '🎉' : acc >= 60 ? '🌟' : '💪';
  const msg = acc === 100 ? '全部答对，太棒了！' : acc >= 60 ? '做得不错，继续加油！' : '没关系，练一练就更好！';
  openSheet('<div class="bigResult"><span class="em">' + em + '</span><b>' + msg + '</b>' +
    '<div class="muted" style="font-size:17px">答对 ' + ok + ' / ' + total + ' 题　正确率 ' + acc + '%</div>' +
    (extra ? '<div style="margin-top:6px;font-weight:800;color:var(--pri-d)">' + extra + '</div>' : '') +
    '</div><div style="margin-top:12px"><button class="btn block" id="rsGo">好的！</button></div>', true);
  sfx.tada();
  $('#rsGo').onclick = () => { closeSheet(); cb && cb(); };
}

/* ---------- 孩子档案 ---------- */
const AVATARS = ['🐰', '🐱', '🐼', '🦊', '🐯', '🐸', '🦉', '🐨'];
RENDER.profiles = function (v) {
  loadChild(activeId);
  let html = '<div style="text-align:center;margin:30px 0 18px"><div style="font-size:44px">🎒</div>' +
    '<h2 style="margin:6px 0">乐学二年级</h2><p class="muted">语文 · 数学 同步练习（苏教版数学 / 统编版语文）</p></div>';
  if (children.length) {
    html += children.map(k => {
      const d = LS.get(K_C(k.id), {});
      return '<button class="itemRow" data-sel="' + k.id + '"><span class="em">' + k.av + '</span>' +
        '<span class="tx"><b>' + esc(k.name) + '</b><small>⭐ ' + (d.stars || 0) + ' 颗星星</small></span>' +
        '<span class="chip g">进入</span></button>';
    }).join('');
  }
  html += '<div class="card" style="margin-top:18px"><b>添加小朋友</b>' +
    '<div style="margin:12px 0 6px"><input type="text" id="nkName" placeholder="名字或昵称" style="width:100%"></div>' +
    '<div class="avatarPick" id="nkAvs">' + AVATARS.map((a, i) =>
      '<button class="avBtn' + (i === 0 ? ' sel' : '') + '" data-av="' + a + '">' + a + '</button>').join('') + '</div>' +
    '<button class="btn block" id="nkGo">开始学习 →</button></div>' +
    '<p class="muted" style="text-align:center;margin-top:16px">数据只保存在这台设备的浏览器里<br>请勿清理浏览器缓存，或到「设置」里导出备份</p>';
  v.innerHTML = html;
  let selAv = AVATARS[0];
  $$('#nkAvs .avBtn').forEach(b => b.onclick = () => {
    $$('#nkAvs .avBtn').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); selAv = b.dataset.av;
  });
  $$('[data-sel]').forEach(b => b.onclick = () => { loadChild(b.dataset.sel); goHome(); });
  $('#nkGo').onclick = () => {
    const nm = $('#nkName').value.trim();
    if (!nm) { toast('先写一个名字吧'); return; }
    const kid = { id: 'k' + Date.now(), name: nm, av: selAv, created: todayStr() };
    children.push(kid); LS.set(K_KIDS, children); loadChild(kid.id); goHome();
  };
};

/* ---------- 首页 ---------- */
RENDER.home = function (v) {
  if (!child) { render('profiles'); return; }
  checkin();
  const d = day(), st = streak();
  const tasks = [
    { em: '🧮', tx: '口算 20 题', sub: '打开「口算训练」完成', done: d.calc >= 20 },
    { em: '📖', tx: '朗读 1 篇', sub: '打开「课文朗读」读一读', done: d.read >= 1 },
    { em: '✍️', tx: '学 5 个生字', sub: '打开「识字卡片」描一描', done: d.chars >= 5 }
  ];
  const allDone = tasks.every(t => t.done);
  if (allDone && cdata.taskBonus !== todayStr()) {
    cdata.taskBonus = todayStr(); addStars(5, true); sfx.tada(); toast('🎉 今日任务全部完成，奖励 5 ⭐！'); saveChild();
  }
  const hour = new Date().getHours();
  const greet = hour < 9 ? '早上好' : hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好';
  const doneN = tasks.filter(t => t.done).length;
  const tasksWithP = [
    { em: '🧮', tx: '口算 20 题', sub: '已完成 ' + Math.min(d.calc, 20) + ' / 20 题', done: d.calc >= 20 },
    { em: '📖', tx: '朗读 1 篇', sub: '已朗读 ' + Math.min(d.read, 1) + ' / 1 篇', done: d.read >= 1 },
    { em: '✍️', tx: '学 5 个生字', sub: '已学会 ' + Math.min(d.chars, 5) + ' / 5 个', done: d.chars >= 5 }
  ];
  v.innerHTML =
    '<div class="homeTop"><div class="av">' + child.av + '</div>' +
    '<div class="grow"><b style="font-size:21px">' + esc(child.name) + '</b>' +
    '<div class="muted">' + greet + '，今天也要开心学习哦</div></div>' +
    '<div class="st">🔥 连续打卡<br>' + st + ' 天</div></div>' +
    '<div class="card"><div class="row"><b style="font-size:19px">🎯 今日任务</b>' +
    '<span class="chip' + (allDone ? ' g' : '') + '">' + (allDone ? '已完成' : '进行中') + '</span></div>' +
    '<div class="prog" style="margin:10px 0 6px"><i style="width:' + Math.round(doneN / 3 * 100) + '%"></i></div>' +
    '<div class="muted" style="font-size:13px;margin-bottom:4px">完成 ' + doneN + ' / 3 个任务' + (allDone ? '，奖励已到手 🎁' : '，全部完成得 5 ⭐') + '</div>' +
    tasksWithP.map(t => '<div class="task' + (t.done ? ' done' : '') + '"><div class="ico">' + t.em + '</div>' +
      '<div class="tx">' + t.tx + '<small>' + t.sub + '</small></div><div class="ck">' + (t.done ? '✓' : '') + '</div></div>').join('') + '</div>' +
    '<p class="muted" style="text-align:center;margin-top:10px">👈 从左边（小屏幕点 ☰）选一个开始吧</p>' +
    '<p class="muted" style="text-align:center">苏教版数学 · 人教版语文（二上）</p>';
};

/* ============================================================
   答题引擎（选择 / 填数 / 判断，含"再试一次"、讲解、错题收集）
   ============================================================ */
function runQuiz(host, list, onDone, onOne) {
  let i = 0, ok = 0;
  (function step() {
    if (i >= list.length) { onDone(ok, list.length); return; }
    host.innerHTML = '<div class="prog"><i style="width:' + Math.round(i / list.length * 100) + '%"></i></div>' +
      '<div class="muted" style="text-align:center;margin-bottom:6px">第 ' + (i + 1) + ' / ' + list.length + ' 题</div>' +
      '<div id="qHolder"></div>';
    askQuestion($('#qHolder'), list[i].q, list[i].meta, good => { if (good) ok++; if (onOne) onOne(good, list[i]); i++; step(); });
  })();
}
function askQuestion(host, q, meta, done) {
  let attempts = 0;
  const say = q.say || (q.kind === 'num' ? q.text.replace(/=\s*\?/, '等于多少？') : q.text);
  let opts = q.opts, ansIdx = q.ans;
  if (q.kind === 'choice') { const correct = q.opts[q.ans]; opts = shuffle(q.opts); ansIdx = opts.indexOf(correct); }
  let html = '<div class="qKp"><span class="chip">' + esc(q.kp) + '</span></div>' +
    '<div class="qText">' + q.text + '</div>' +
    '<div class="qSay"><button class="speakBtn" id="qSpk">🔊</button></div>';
  if (q.kind === 'choice') {
    html += '<div class="choices">' + opts.map((o, i) =>
      '<button class="choice' + (q.py ? ' py' : '') + '" data-i="' + i + '">' + o + '</button>').join('') + '</div>';
  } else if (q.kind === 'judge') {
    html += '<div class="choices" style="flex-direction:row"><button class="choice" data-j="1" style="flex:1">✔ 对</button>' +
      '<button class="choice" data-j="0" style="flex:1">✘ 不对</button></div>';
  } else {
    html += '<div class="numShow" id="numShow">&nbsp;</div><div class="keypad" id="padBox"></div>';
  }
  html += '<div class="fb" id="fb"></div><div id="expBox"></div>';
  host.innerHTML = html;
  $('#qSpk').onclick = () => speak(say);
  speak(say);
  const ansText = q.kind === 'choice' ? String(q.opts[q.ans]) : q.kind === 'judge' ? (q.ans ? '对' : '不对') : String(q.ans);
  const finish = good => {
    statKp(q.kp, good);
    if (good) { addStars(1); sfx.star(); $('#fb').className = 'fb good'; $('#fb').textContent = '答对啦！'; }
    else {
      sfx.bad();
      pushWrong({ key: meta.key, subj: q.subj, kp: q.kp, label: q.text.slice(0, 50), type: meta.type, payload: meta.payload });
      $('#fb').className = 'fb bad'; $('#fb').textContent = '正确答案是：' + ansText;
      if (q.exp) $('#expBox').innerHTML = '<div class="expBox">💡 ' + q.exp + '</div>';
    }
    $$('#qHolder .choice').forEach(b => b.disabled = true);
    const nb = document.createElement('button');
    nb.className = 'btn block'; nb.style.marginTop = '14px';
    nb.textContent = good ? '继续 →' : '我知道了';
    nb.onclick = () => done(good);
    host.appendChild(nb);
  };
  const judge = (good, el) => {
    if (good) { if (el) el.classList.add('ok'); finish(true); return; }
    attempts++;
    if (attempts === 1 && !q.once) {
      sfx.bad();
      if (el) { el.classList.add('no'); setTimeout(() => el.classList.remove('no'), 600); }
      $('#fb').className = 'fb bad'; $('#fb').textContent = '再试一次，你可以的！💪';
    } else {
      if (q.kind === 'choice') $$('#qHolder .choice').forEach((b, i) => { if (i === ansIdx) b.classList.add('ok'); else b.classList.add('dim'); });
      finish(false);
    }
  };
  if (q.kind === 'choice') $$('#qHolder .choice').forEach(b => b.onclick = () => judge(+b.dataset.i === ansIdx, b));
  else if (q.kind === 'judge') $$('#qHolder .choice').forEach(b => b.onclick = () => judge((b.dataset.j === '1') === !!q.ans, b));
  else bindKeypad(host, val => judge(val === q.ans, null));
}
let activePad = null;
function bindKeypad(host, onOK) {
  let buf = '';
  host.querySelector('#padBox').innerHTML = [1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k =>
    '<button class="key" data-k="' + k + '">' + k + '</button>').join('');
  const show = () => host.querySelector('#numShow').textContent = buf === '' ? '\u00a0' : buf;
  activePad = {
    push(ch) { if (buf.length < 4) { buf += ch; show(); } },
    back() { buf = buf.slice(0, -1); show(); },
    ok() { if (buf !== '') onOK(parseInt(buf, 10)); }
  };
  host.querySelector('#padBox').addEventListener('click', e => {
    const k = e.target.dataset.k; if (k === undefined) return;
    if (k === '⌫') activePad.back();
    else if (k === 'OK') activePad.ok();
    else activePad.push(k);
  });
}
document.addEventListener('keydown', e => {
  if (!activePad || !$('#overlay').hidden) return;
  if (/^[0-9]$/.test(e.key)) activePad.push(e.key);
  else if (e.key === 'Backspace') { activePad.back(); e.preventDefault(); }
  else if (e.key === 'Enter') activePad.ok();
});

/* ---------- 题目重建（错题本用） ---------- */
function calcFrom(type, a, b) {
  const kp = '口算' + ({ add: '加法', sub: '减法', mul: '乘法', div: '除法' })[type];
  if (type === 'add') return { a, b, type, text: a + ' + ' + b + ' = ?', ans: a + b, kp };
  if (type === 'sub') return { a, b, type, text: a + ' - ' + b + ' = ?', ans: a - b, kp };
  if (type === 'mul') return { a, b, type, text: a + ' × ' + b + ' = ?', ans: a * b, kp };
  return { a, b, type, text: a + ' ÷ ' + b + ' = ?', ans: a / b, kp };
}
function genCalc(type) {
  if (type === 'mix' || !type) type = pick(['add', 'sub', 'mul', 'div']);
  let a, b;
  if (type === 'add') { a = 12 + rnd(86); const mx = Math.min(99 - a, 87); b = mx > 11 ? 11 + rnd(mx - 10) : 10 + rnd(9); }
  else if (type === 'sub') { a = 21 + rnd(78); b = 11 + rnd(a - 11); }
  else if (type === 'mul') { a = 1 + rnd(9); b = 1 + rnd(9); }
  else { b = 2 + rnd(8); a = b * (1 + rnd(9)); }
  return calcFrom(type, a, b);
}
/* 二下生成器：两三位数加减 / 有余数除法 / 认识方向 */
function calc3From(type, a, b) {
  const kp = '两三位数加减';
  if (type === 'add') return { a, b, type, text: a + ' + ' + b + ' = ?', ans: a + b, kp };
  return { a, b, type, text: a + ' - ' + b + ' = ?', ans: a - b, kp };
}
function genCalc3() {
  if (rnd(2) === 0) { const a = 100 + rnd(799); const mx = Math.min(899, 999 - a); const b = 100 + rnd(mx - 99); return calc3From('add', a, b); }
  const a = 200 + rnd(799); const b = 100 + rnd(a - 100); return calc3From('sub', a, b);
}
function remItem() {
  const b = 2 + rnd(8), q = 1 + rnd(9), r = 1 + rnd(b - 1), a = b * q + r;
  return { q: { kind: 'num', text: a + ' ÷ ' + b + ' = ' + q + ' 余 ?', ans: r, kp: '有余数的除法', subj: 'math',
    exp: b + '×' + q + '=' + (b * q) + '，' + a + '-' + (b * q) + '=' + r + '，余数是 ' + r + '。' },
    meta: { key: 'rem:' + a + ':' + b, type: 'gen', payload: { g: 'rem', a, b } } };
}
function dirBuild(i, kName) {
  const D = ['东', '南', '西', '北'];
  const map = { '后面': (i + 2) % 4, '左面': (i + 3) % 4, '右面': (i + 1) % 4 };
  const opts = shuffle(D);
  return { kind: 'choice', text: '小明面向' + D[i] + '，他的' + kName + '是（　）', opts, ans: opts.indexOf(D[map[kName]]),
    kp: '认识方向', subj: 'math', say: '小明面向' + D[i] + '，他的' + kName + '是哪个方向？',
    exp: '面向' + D[i] + '时：后面是' + D[(i + 2) % 4] + '，左面是' + D[(i + 3) % 4] + '，右面是' + D[(i + 1) % 4] + '。' };
}
function dirItem() {
  const i = rnd(4), kName = pick(['后面', '左面', '右面']);
  return { q: dirBuild(i, kName), meta: { key: 'dir:' + i + ':' + kName, type: 'gen', payload: { g: 'dir', i, k: kName } } };
}
function calcItem(c) {
  return { q: { kind: 'num', text: c.text, ans: c.ans, kp: c.kp, subj: 'math' },
           meta: { key: 'calc:' + c.text, type: 'gen', payload: { g: 'calc', type: c.type, a: c.a, b: c.b } } };
}
const UNIT_GEN = {
  u1: () => calcItem(genCalc(pick(['add', 'sub']))),
  u3: () => calcItem(genCalc('mul')),
  u4: () => calcItem(genCalc('div')),
  u6: () => calcItem(genCalc(pick(['mul', 'div']))),
  u8: remItem,
  u10: dirItem,
  u13: () => calcItem(genCalc3())
};
function staticQ(id) {
  let x = MATH_QS.find(t => t.id === id);
  if (x) return { q: { kind: x.kind, text: x.text, opts: x.opts, ans: x.ans, exp: x.exp, py: x.py, kp: x.kp, subj: 'math' },
                  meta: { key: 'q:' + id, type: 'static', payload: { g: 'qid', id } } };
  x = CHN_QS.find(t => t.id === id);
  if (x) return { q: { kind: x.kind, text: x.text, opts: x.opts, ans: x.ans, exp: x.exp, py: x.py, kp: x.kp, subj: 'chn' },
                  meta: { key: 'q:' + id, type: 'static', payload: { g: 'qid', id } } };
  return null;
}
function rebuild(payload) {
  if (payload.g === 'qid') return staticQ(payload.id);
  if (payload.g === 'calc') { const c = calcFrom(payload.type, payload.a, payload.b);
    return { q: { kind: 'num', text: c.text, ans: c.ans, kp: c.kp, subj: 'math' },
             meta: { key: 'calc:' + c.text, type: 'gen', payload } }; }
  if (payload.g === 'kj') { const p = payload.a * payload.b;
    return { q: { kind: 'num', text: payload.a + ' × ' + payload.b + ' = ?', ans: p, kp: '口诀', subj: 'math' },
             meta: { key: 'kj:' + payload.a + 'x' + payload.b, type: 'gen', payload } }; }
  if (payload.g === 'dict') { const d = DICTS[payload.i];
    return { q: { kind: 'choice', text: '听一听，选出正确的词语', opts: d.opts, ans: d.opts.indexOf(d.w), kp: '听写', subj: 'chn', say: d.w },
             meta: { key: 'dict:' + payload.i, type: 'dict', payload } }; }
  if (payload.g === 'poem') { const p = POEMS[payload.pi], b = p.blanks[payload.bi], line = p.lines[b.li], pos = line.indexOf(b.ch);
    const t = pos < 0 ? line : line.slice(0, pos) + '（　）' + line.slice(pos + 1);
    return { q: { kind: 'choice', text: t, opts: b.opts, ans: b.opts.indexOf(b.ch), kp: '古诗', subj: 'chn', say: line },
             meta: { key: 'poem:' + payload.pi + ':' + payload.bi, type: 'poem', payload } }; }
  if (payload.g === 'xp') {
    if (payload.k === 'blank') return { q: xpBlankQ(payload.i), meta: { key: 'xp:blank:' + payload.i, type: 'gen', payload } };
    if (payload.k === 'quiz') return { q: xpQuizQ(payload.i), meta: { key: 'xp:quiz:' + payload.i, type: 'gen', payload } };
    return { q: xpAuthorQ(payload.i), meta: { key: 'xp:auth:' + payload.i, type: 'gen', payload } };
  }
  if (payload.g === 'pyid') { const x = PY_QS.find(t => t.id === payload.id);
    return { q: { kind: x.kind, text: x.text, opts: x.opts, ans: x.ans, exp: x.exp, kp: '拼音', subj: 'chn' },
             meta: { key: 'py:' + payload.id, type: 'static', payload } }; }
  if (payload.g === 'pyw') { const it = pyWordItem(payload.w); return { q: it.q, meta: { key: 'pyw:' + payload.w, type: 'gen', payload } }; }
  if (payload.g === 'cdict') { const w = payload.w, opts = payload.opts;
    return { q: { kind: 'choice', text: '听一听，选出你听到的词语', opts, ans: opts.indexOf(w), kp: '听写', subj: 'chn', say: w, exp: '这个词是「' + w + '」' },
             meta: { key: 'cd:' + w, type: 'dict', payload } }; }
  if (payload.g === 'rem') { const a = payload.a, b = payload.b;
    return { q: { kind: 'num', text: a + ' ÷ ' + b + ' = ' + Math.floor(a / b) + ' 余 ?', ans: a % b, kp: '有余数的除法', subj: 'math' },
             meta: { key: 'rem:' + a + ':' + b, type: 'gen', payload } }; }
  if (payload.g === 'dir') { return { q: dirBuild(payload.i, payload.k), meta: { key: 'dir:' + payload.i + ':' + payload.k, type: 'gen', payload } }; }
  if (payload.g === 'calc3') { const c = calc3From(payload.type, payload.a, payload.b);
    return { q: { kind: 'num', text: c.text, ans: c.ans, kp: c.kp, subj: 'math' },
             meta: { key: 'calc3:' + c.text, type: 'gen', payload } }; }
  if (payload.g === 'clock') { const os = timeOpts(payload.h, payload.m);
    return { q: { kind: 'choice', text: '钟面上是几时？', opts: os, ans: os.indexOf(timeLabel(payload.h, payload.m)), kp: '认识钟表', subj: 'math' },
             meta: { key: 'clock:' + payload.h + ':' + payload.m, type: 'gen', payload } }; }
  return null;
}

/* ============================================================
   数学模块
   ============================================================ */
RENDER.calc = function (v, p) {
  if (!p.mode) {
    let type = 'mix', count = 20, limit = false;
    const types = [['mix', '🎲 混合'], ['add', '➕ 加法'], ['sub', '➖ 减法'], ['mul', '✖️ 乘法'], ['div', '➗ 除法']];
    v.innerHTML = '<div class="card"><b style="font-size:19px">选一选练什么</b>' +
      '<div class="choices" id="tyRow" style="flex-direction:row;flex-wrap:wrap">' +
      types.map(t => '<button class="choice' + (t[0] === 'mix' ? ' ok' : '') + '" data-t="' + t[0] + '" style="padding:10px;font-size:17px;flex:1;min-width:100px">' + t[1] + '</button>').join('') + '</div>' +
      '<div class="choices" id="ctRow" style="flex-direction:row">' +
      [10, 20, 50].map(c => '<button class="choice' + (c === 20 ? ' ok' : '') + '" data-c="' + c + '" style="flex:1">' + c + ' 题</button>').join('') + '</div>' +
      '<div class="settingRow"><span>⏱️ 限时挑战</span><button class="switch" id="limSw"></button></div>' +
      '<button class="btn block" id="start" style="margin-top:14px">开始口算 →</button></div>' +
      '<p class="muted" style="text-align:center">答对 5 题得 1 ⭐ · 100 以内加减法和表内乘除法' +
      (cdata.calcMax ? '<br>🔥 历史连对纪录：' + cdata.calcMax + ' 题' : '') + '</p>';
    $$('#tyRow .choice').forEach(b => b.onclick = () => { $$('#tyRow .choice').forEach(x => x.classList.remove('ok')); b.classList.add('ok'); type = b.dataset.t; });
    $$('#ctRow .choice').forEach(b => b.onclick = () => { $$('#ctRow .choice').forEach(x => x.classList.remove('ok')); b.classList.add('ok'); count = +b.dataset.c; });
    $('#limSw').onclick = e => { limit = !limit; e.target.classList.toggle('on', limit); };
    $('#start').onclick = () => go('calc', { mode: 'run', type, count, limit });
    return;
  }
  /* --- 训练进行中 --- */
  const sess = { i: 0, ok: 0, streak: 0, max: 0, t0: Date.now(), iv: null };
  const total = p.count;
  onLeave(() => { if (sess.iv) { clearInterval(sess.iv); sess.iv = null; } });
  if (p.limit) {
    let left = total <= 10 ? 90 : total <= 20 ? 180 : 420;
    sess.iv = setInterval(() => {
      left--; const el = $('#tmLeft');
      if (el) el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      if (left <= 0) { clearInterval(sess.iv); sess.iv = null; finish(); }
    }, 1000);
  }
  function finish() {
    if (sess.iv) { clearInterval(sess.iv); sess.iv = null; }
    cdata.counters.calc += sess.i;
    let newRec = false;
    if (sess.max > (cdata.calcMax || 0)) { cdata.calcMax = sess.max; newRec = true; }
    checkMedals(); saveChild();
    if (screenName !== 'calc') return;
    showResult(sess.ok, sess.i, '🔥 本组连对 ' + sess.max + ' 题' + (newRec ? ' 🎉 新纪录！' : ' · 历史纪录 ' + cdata.calcMax), () => goHome());
  }
  function step() {
    if (sess.i >= total) { finish(); return; }
    const c = genCalc(p.type);
    v.innerHTML = '<div class="prog"><i style="width:' + Math.round(sess.i / total * 100) + '%"></i></div>' +
      '<div class="timer" id="tmWrap">' + (p.limit ? '⏱️ <span id="tmLeft"></span>' : '第 ' + (sess.i + 1) + ' / ' + total + ' 题') + '</div>' +
      '<div class="card"><div class="qText" style="font-size:40px">' + c.text + '</div>' +
      '<div class="numShow" id="numShow">&nbsp;</div><div class="keypad" id="padBox"></div>' +
      '<div class="fb" id="fb"></div></div>';
    if (p.limit) $('#tmLeft').textContent = '';
    let attempts = 0, buf = '', counted = false;
    const show = () => $('#numShow').textContent = buf === '' ? '\u00a0' : buf;
    $('#padBox').innerHTML = [1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k => '<button class="key" data-k="' + k + '">' + k + '</button>').join('');
    activePad = {
      push(ch) { if (buf.length < 4) { buf += ch; show(); } },
      back() { buf = buf.slice(0, -1); show(); },
      ok() { if (buf !== '') check(parseInt(buf, 10)); }
    };
    $('#padBox').addEventListener('click', e => {
      const k = e.target.dataset.k; if (k === undefined) return;
      if (k === '⌫') activePad.back();
      else if (k === 'OK') activePad.ok();
      else activePad.push(k);
    });
    function check(val) {
      if (!counted) { counted = true; day().calc++; saveChild(); }
      if (val === c.ans) {
        sess.ok++; sess.streak++; sess.max = Math.max(sess.max, sess.streak);
        sfx.ok();
        if (sess.ok % 5 === 0) addStars(1);
        statKp(c.kp, true);
        $('#fb').className = 'fb good'; $('#fb').textContent = '✓ 答对啦';
        buf = ''; show();
        setTimeout(() => { sess.i++; step(); }, 420);
      } else {
        sess.streak = 0;
        attempts++; sfx.bad();
        if (attempts === 1) { $('#fb').className = 'fb bad'; $('#fb').textContent = '再试一次 💪'; }
        else {
          statKp(c.kp, false);
          pushWrong({ key: 'calc:' + c.text, subj: 'math', kp: c.kp, label: c.text, type: 'gen', payload: { g: 'calc', type: c.type, a: c.a, b: c.b } });
          buf = ''; show();
          $('#fb').className = 'fb bad'; $('#fb').textContent = '答案是 ' + c.ans;
          setTimeout(() => { sess.i++; step(); }, 1100);
        }
      }
    }
  }
  step();
};

RENDER.koujue = function (v, p) {
  if (!p.mode) {
    v.innerHTML = '<div class="card" style="text-align:center">' +
      '<div style="font-size:46px">🎯</div><b style="font-size:20px">乘法口诀乐园</b>' +
      '<p class="muted">1~9 的乘法口诀（苏教版二上第三、六单元）</p>' +
      '<div class="choices">' +
      '<div><button class="choice" id="kjQuiz">🔥 口诀对对碰</button>' +
      '<div class="muted" style="text-align:center;margin-top:4px">考一考你：三七（　）？</div></div>' +
      '<div><button class="choice" id="kjTable">👀 口诀点读表</button>' +
      '<div class="muted" style="text-align:center;margin-top:4px">一张乘法表，点格子听口诀</div></div></div></div>';
    $('#kjQuiz').onclick = () => go('koujue', { mode: 'quiz' });
    $('#kjTable').onclick = () => go('koujue', { mode: 'table' });
    return;
  }
  if (p.mode === 'table') {
    let g = '<div class="kjTable">';
    g += '<button class="hd">×</button>' + [1,2,3,4,5,6,7,8,9].map(i => '<button class="hd">' + i + '</button>').join('');
    for (let r = 1; r <= 9; r++) {
      g += '<button class="hd">' + r + '</button>';
      for (let c = 1; c <= 9; c++) g += '<button data-r="' + r + '" data-c="' + c + '">' + (r * c) + '</button>';
    }
    g += '</div>' +
      '<p class="muted" style="text-align:center;margin-top:10px">竖着数（左边）× 横着数（上边）＝ 格子里的数<br><b>点任意格子，听听它的口诀</b></p>' +
      '<div class="kjShow" id="kjShow">👆 点一个格子试试</div>';
    v.innerHTML = '<div class="card">' + g + '</div>';
    $$('.kjTable [data-r]').forEach(b => b.onclick = () => {
      const r = +b.dataset.r, c = +b.dataset.c;
      $$('.kjTable button.on').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      $('#kjShow').textContent = r + ' × ' + c + ' = ' + (r * c) + '　' + kjText(r, c);
      speak(kjText(r, c));
    });
    return;
  }
  const list = [];
  for (let n = 0; n < 8; n++) {
    const a = 1 + rnd(9), b = 1 + rnd(9), pr = a * b;
    if (n % 2 === 0) {
      const ws = [pr + a, pr - a, pr + b, pr - b, pr + 1, pr - 1].filter(x => x > 1 && x <= 81 && x !== pr);
      const opts = shuffle([toCn(pr)].concat(shuffle(ws).slice(0, 3).map(toCn)));
      list.push({ q: { kind: 'choice', text: toCn(a) + toCn(b) + '（　）', opts, ans: opts.indexOf(toCn(pr)), kp: '口诀', subj: 'math', say: toCn(a) + '乘' + toCn(b) + '等于多少？' },
                  meta: { key: 'kj:' + a + 'x' + b, type: 'gen', payload: { g: 'kj', a, b } } });
    } else {
      list.push({ q: { kind: 'num', text: a + ' × ' + b + ' = ?', ans: pr, kp: '口诀', subj: 'math', say: toCn(a) + '乘' + toCn(b) + '等于多少？' },
                  meta: { key: 'kj:' + a + 'x' + b, type: 'gen', payload: { g: 'kj', a, b } } });
    }
  }
  runQuiz($('#view'), list, (ok, total) => showResult(ok, total, '', () => go('koujue')));
};

RENDER.mquiz = function (v) {
  cdata.units = cdata.units || {};
  v.innerHTML = '<p class="muted" style="margin:4px 2px 10px">苏教版 · 点开单元开始闯关（计算类单元无限出题）</p>' +
    [['上', '📖 二年级上册'], ['下', '📖 二年级下册']].map(b =>
      '<h2 class="sec">' + b[1] + '</h2>' +
      MATH_UNITS.filter(u => u.bk === b[0]).map(u => {
        const s = cdata.units[u.id] || { q: 0, c: 0 };
        const acc = s.q ? Math.round(s.c / s.q * 100) + '%' : '未开始';
        return '<button class="itemRow" data-u="' + u.id + '"><span class="em">' + u.em + '</span>' +
          '<span class="tx"><b>' + u.nm + '</b><small>已练 ' + s.q + ' 题 · ' + acc + '</small></span><span class="chip b">开始</span></button>';
      }).join('')).join('');
  $$('[data-u]').forEach(b => b.onclick = () => startUnit(b.dataset.u));
  function startUnit(uid) {
    const gen = UNIT_GEN[uid];
    const pool = shuffle(MATH_QS.filter(q => q.u === uid));
    const items = pool.slice(0, gen ? 4 : 8).map(q => staticQ(q.id));
    while (items.length < 8 && gen) items.push(gen());
    runQuiz($('#view'), items, (ok, total) => {
      cdata.units[uid] = cdata.units[uid] || { q: 0, c: 0 };
      cdata.units[uid].q += total; cdata.units[uid].c += ok;
      checkMedals(); saveChild();
      showResult(ok, total, '', () => go('mquiz'));
    });
  }
};

/* ---------- 认识钟表 ---------- */
function clockSVG(h, m) {
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  return '<svg width="210" height="210" viewBox="0 0 220 220">' +
    '<circle cx="110" cy="110" r="100" fill="#fff" stroke="#4A3B2A" stroke-width="8"/>' +
    '<text x="110" y="36" text-anchor="middle" font-size="19" font-weight="700" fill="#4A3B2A">12</text>' +
    '<text x="193" y="117" text-anchor="middle" font-size="19" font-weight="700" fill="#4A3B2A">3</text>' +
    '<text x="110" y="202" text-anchor="middle" font-size="19" font-weight="700" fill="#4A3B2A">6</text>' +
    '<text x="27" y="117" text-anchor="middle" font-size="19" font-weight="700" fill="#4A3B2A">9</text>' +
    '<line x1="110" y1="110" x2="110" y2="60" stroke="#4A3B2A" stroke-width="10" stroke-linecap="round" transform="rotate(' + ha + ' 110 110)"/>' +
    '<line x1="110" y1="110" x2="110" y2="40" stroke="#FF8A3D" stroke-width="6" stroke-linecap="round" transform="rotate(' + ma + ' 110 110)"/>' +
    '<circle cx="110" cy="110" r="8" fill="#4A3B2A"/></svg>';
}
function timeLabel(h, m) { return m === 0 ? h + '时' : m === 30 ? h + '时半' : h + '时' + m + '分'; }
function timeOpts(h, m) {
  const set = new Set([timeLabel(h, m)]);
  while (set.size < 4) {
    const h2 = 1 + rnd(12), m2 = pick([0, 30, 15, 45]);
    if (h2 !== h || m2 !== m) set.add(timeLabel(h2, m2));
  }
  return shuffle(Array.from(set));
}
RENDER.clock = function (v, p) {
  if (!p.mode) {
    v.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:46px">🕐</div>' +
      '<b style="font-size:20px">认识钟表</b><p class="muted">时 · 半时（苏教版二下）</p>' +
      '<div class="choices"><button class="choice" id="ckRead">👀 看时间选一选</button>' +
      '<button class="choice" id="ckSet">🖐️ 拨一拨小闹钟</button></div></div>';
    $('#ckRead').onclick = () => go('clock', { mode: 'read' });
    $('#ckSet').onclick = () => go('clock', { mode: 'set' });
    return;
  }
  if (p.mode === 'read') {
    let i = 0, ok = 0;
    function step() {
      if (i >= 5) { showResult(ok, 5, '', () => go('clock')); return; }
      const h = 1 + rnd(12), m = pick([0, 0, 30, 30, 15, 45]);
      const opts = timeOpts(h, m);
      v.innerHTML = '<div class="muted" style="text-align:center">第 ' + (i + 1) + ' / 5 题</div>' +
        '<div class="card"><div class="clockWrap">' + clockSVG(h, m) + '</div>' +
        '<div class="qSay"><button class="speakBtn" id="ckSpk">🔊</button></div>' +
        '<div class="choices">' + opts.map(o => '<button class="choice" data-o="' + esc(o) + '">' + o + '</button>').join('') + '</div>' +
        '<div class="fb" id="fb"></div></div>';
      $('#ckSpk').onclick = () => speak('钟面上是几时？');
      let attempts = 0;
      $$('.choices .choice').forEach(b => b.onclick = () => {
        if (b.dataset.o === timeLabel(h, m)) {
          ok++; i++; sfx.ok(); addStars(1); statKp('认识钟表', true);
          b.classList.add('ok'); $('#fb').className = 'fb good'; $('#fb').textContent = '答对啦！';
          setTimeout(step, 600);
        } else {
          attempts++; sfx.bad(); b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 600);
          if (attempts === 1) { $('#fb').className = 'fb bad'; $('#fb').textContent = '再试一次：短针是时针，长针是分针'; }
          else {
            i++; statKp('认识钟表', false);
            pushWrong({ key: 'clock:' + h + ':' + m, subj: 'math', kp: '认识钟表', label: '认识钟表：' + timeLabel(h, m), type: 'gen', payload: { g: 'clock', h, m } });
            $$('.choices .choice').forEach(x => { if (x.dataset.o === timeLabel(h, m)) x.classList.add('ok'); x.disabled = true; });
            $('#fb').className = 'fb bad'; $('#fb').textContent = '正确答案：' + timeLabel(h, m);
            setTimeout(step, 1200);
          }
        }
      });
    }
    step();
    return;
  }
  /* 拨一拨 */
  const targets = [];
  for (let n = 0; n < 5; n++) { const h = 1 + rnd(12), m = pick([0, 30]); if (!targets.some(t => t.h === h && t.m === m)) targets.push({ h, m }); }
  let ti = 0, cur = { h: 12, m: 0 }, tries = 0;
  function draw() {
    const tg = targets[ti];
    v.innerHTML = '<div class="muted" style="text-align:center">第 ' + (ti + 1) + ' / ' + targets.length + ' 个</div>' +
      '<div class="card"><div class="poemTitle">请拨出：<span style="color:var(--pri-d)">' + timeLabel(tg.h, tg.m) + '</span></div>' +
      '<div class="clockWrap">' + clockSVG(cur.h, cur.m) + '</div>' +
      '<div class="clockBtns">' +
      '<button class="btn small ghost" id="hm">时针 −</button><button class="btn small ghost" id="hp">时针 ＋</button>' +
      '<button class="btn small ghost" id="mm">分针 −</button><button class="btn small ghost" id="mp">分针 ＋</button></div>' +
      '<div class="clockBtns"><button class="btn grn" id="ckOk">✓ 检查</button><button class="btn small ghost" id="ckSay">🔊 再听一遍</button></div>' +
      '<div class="fb" id="fb"></div></div>';
    speak('请拨出，' + timeLabel(tg.h, tg.m));
    $('#ckSay').onclick = () => speak('请拨出，' + timeLabel(tg.h, tg.m));
    $('#hm').onclick = () => { cur.h = cur.h === 1 ? 12 : cur.h - 1; redrawClock(); };
    $('#hp').onclick = () => { cur.h = cur.h === 12 ? 1 : cur.h + 1; redrawClock(); };
    $('#mm').onclick = () => { cur.m = cur.m === 0 ? 30 : 0; redrawClock(); };
    $('#mp').onclick = () => { cur.m = cur.m === 30 ? 0 : 30; redrawClock(); };
    $('#ckOk').onclick = () => {
      if (cur.h === tg.h && cur.m === tg.m) {
        ti++; sfx.ok(); addStars(1); statKp('认识钟表', true);
        toast('🎉 拨对啦！');
        if (ti >= targets.length) showResult(targets.length, targets.length, '', () => go('clock'));
        else { tries = 0; setTimeout(draw, 500); }
      } else {
        tries++; sfx.bad();
        $('#fb').className = 'fb bad';
        $('#fb').textContent = tries >= 2 ? '小提示：分针指 12 是整时，指 6 是半时；时针过了几就是几时' + (tg.m === 30 ? '，再走过半格' : '') : '不对哦，再调一调';
        if (tries === 3) statKp('认识钟表', false);
      }
    };
  }
  function redrawClock() {
    const tg = targets[ti];
    v.querySelector('.clockWrap').innerHTML = clockSVG(cur.h, cur.m);
  }
  draw();
};

/* ---------- 逐字拼音标注 ---------- */
const PY_PHRASE = { '高兴地': 'gāo xìng de', '长歌行': 'cháng gē xíng', '知了': 'zhī liāo', '见牛羊': 'xiàn niú yáng' };
function toPinyinArr(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    let hit = null;
    for (const ph in PY_PHRASE) { if (s.startsWith(ph, i)) { hit = [ph, PY_PHRASE[ph]]; break; } }
    if (hit) { hit[1].split(' ').forEach(p => out.push(p)); i += hit[0].length; continue; }
    out.push((window.HANZI_PINYIN && HANZI_PINYIN[s[i]]) || '');
    i++;
  }
  return out;
}
function pinyinLine(s) {
  const pys = toPinyinArr(s);
  let html = '';
  let idx = 0;
  for (const ch of Array.from(s)) {
    if (/[，。！？；：、""''…—,.!?;:\s]/.test(ch)) { html += '<span class="pyp">' + ch + '</span>'; idx++; continue; }
    const p = pys[idx] || '';
    html += '<span class="pyc"><i>' + p + '</i>' + ch + '</span>';
    idx++;
  }
  return html;
}

/* ============================================================
   语文模块
   ============================================================ */
/* ---------- 识字卡片 + 笔顺 ---------- */
let curWriter = null;
function hwDataLoader(char, onLoad, onError) {
  if (window.HANZI_DATA && HANZI_DATA[char]) return onLoad(HANZI_DATA[char]);
  const bases = ['https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/',
    'https://registry.npmmirror.com/hanzi-writer-data/2.0.0/files/'];
  (function tryBase(i) {
    if (i >= bases.length) { onError && onError(); return; }
    fetch(bases[i] + encodeURIComponent(char) + '.json')
      .then(r => { if (!r.ok) throw 0; return r.json(); })
      .then(d => { try { window.HANZI_DATA = window.HANZI_DATA || {}; HANZI_DATA[char] = d; } catch (e) {} onLoad(d); })
      .catch(() => tryBase(i + 1));
  })(0);
}
RENDER.cards = function (v) {
  const learned = Object.keys(cdata.chars).length;
  v.innerHTML = '<div class="row" style="margin:2px 2px 10px"><span class="chip g">已学 ' + learned + ' / ' + CHARS.length + ' 字</span>' +
    (settings.pinyin ? '' : '<span class="chip">拼音已隐藏</span>') + '</div>' +
    '<div class="card"><div class="charGrid">' + CHARS.map((c, i) =>
      '<button class="charCell' + (cdata.chars[c.c] ? ' learned' : '') + '" data-i="' + i + '">' + c.c +
      (settings.pinyin ? '<small>' + c.py + '</small>' : '<small>&nbsp;</small>') + '</button>').join('') + '</div></div>' +
    '<p class="muted" style="text-align:center">点一个字 → 看笔顺 · 描红 · 听组词</p>';
  $$('.charCell').forEach(b => b.onclick = () => go('card', { i: +b.dataset.i }));
};
RENDER.card = function (v, p) {
  const c = CHARS[p.i]; if (!c) { go('cards'); return; }
  v.innerHTML = '<div class="card" style="text-align:center">' +
    '<div class="pyLine">' + (settings.pinyin ? c.py : '&nbsp;') + '</div>' +
    '<div class="charBig">' + c.c + '</div>' +
    '<div style="margin:4px 0"><span class="chip">部首：' + c.r + '</span></div>' +
    '<div id="hwTarget" class="hwBox" style="min-height:180px;width:180px;margin:0 auto"></div>' +
    '<div class="row" style="justify-content:center;gap:10px;flex-wrap:wrap;margin-top:10px">' +
    '<button class="btn small blu" id="btnAnim">▶️ 看笔顺</button>' +
    '<button class="btn small grn" id="btnQuiz">✍️ 我来写</button>' +
    '<button class="btn small" id="btnSay">🔊 读一读</button></div>' +
    '<div class="muted" id="hwMsg" style="margin-top:8px"></div></div>' +
    '<div class="card"><b>组词</b><div style="margin-top:8px">' +
    c.w.map(w => '<button class="wordChip" data-w="' + w + '">' + w + '</button>').join('') + '</div></div>' +
    '<div class="row" style="justify-content:space-between"><button class="btn small ghost" id="prevC">← 上一个</button>' +
    '<button class="btn small ghost" id="backList">回到字表</button><button class="btn small ghost" id="nextC">下一个 →</button></div>';
  $$('.wordChip').forEach(b => b.onclick = () => speak(b.dataset.w));
  $('#btnSay').onclick = () => speak(c.c + '，' + c.w.join('，'));
  $('#backList').onclick = () => go('cards');
  $('#prevC').onclick = () => go('card', { i: (p.i + CHARS.length - 1) % CHARS.length });
  $('#nextC').onclick = () => go('card', { i: (p.i + 1) % CHARS.length });
  speak(c.c);
  $('#hwTarget').innerHTML = '';
  if (window.HanziWriter) {
    $('#hwMsg').textContent = '';
    curWriter = HanziWriter.create($('#hwTarget'), c.c, {
      width: 180, height: 180, padding: 8, strokeColor: '#4A3B2A', highlightColor: '#FF8A3D',
      radicalColor: '#E86F1F', delay: { strokeAnimation: 350 }, showOutline: true,
      charDataLoader: hwDataLoader
    });
    $('#btnAnim').onclick = () => curWriter.animateCharacter();
    $('#btnQuiz').onclick = () => {
      $('#btnQuiz').disabled = true;
      curWriter.quiz({
        showHintAfterMisses: 2,
        onMistake: () => sfx.bad(),
        onComplete: () => {
          sfx.tada();
          if (cdata.chars[c.c] !== todayStr()) {
            cdata.chars[c.c] = todayStr();
            day().chars++; addStars(1);
            checkMedals(); saveChild();
            const cell = $$('.charCell')[p.i]; if (cell) cell.classList.add('learned');
            toast('✍️ 又学会一个字！');
          }
          $('#btnQuiz').disabled = false;
        }
      });
    };
  } else {
    $('#hwMsg').innerHTML = '此文件缺少内置笔顺引擎，请重新导出完整版';
    $('#btnAnim').disabled = true; $('#btnQuiz').disabled = true;
  }
};

/* ---------- 课文朗读 ---------- */
RENDER.read = function (v, p) {
  if (!p.id) {
    v.innerHTML = '<p class="muted" style="margin:4px 2px 10px">点一句读一句，读完记得点「朗读全文」哦</p>' +
      TEXTS.map(t => '<button class="itemRow" data-t="' + t.id + '"><span class="em">' + t.em + '</span>' +
        '<span class="tx"><b>' + t.title + '</b><small>' + (t.note ? t.note : '短文朗读') + (t.author ? ' · ' + t.author : '') + (cdata.readOnce.includes(t.id) ? ' · 已读过 ⭐' : '') + '</small></span>' +
        '<span class="chip b">朗读</span></button>').join('');
    $$('[data-t]').forEach(b => b.onclick = () => go('read', { id: b.dataset.t }));
    return;
  }
  const t = TEXTS.find(x => x.id === p.id); if (!t) { go('read'); return; }
  v.innerHTML = '<div class="card"><div class="poemTitle">' + t.em + ' ' + t.title + '</div>' +
    (t.author ? '<div class="poemAuthor">' + t.author + '</div>' : '') +
    t.paras.map((s, i) => '<div class="para" data-i="' + i + '">' + (settings.pinyin ? pinyinLine(s) : s) + '</div>').join('') +
    '<div class="row" style="justify-content:center;gap:10px;margin-top:12px;flex-wrap:wrap">' +
    '<button class="btn" id="readAll">▶️ 朗读全文</button>' +
    '<button class="btn small blu" id="btnRec">🎙️ 跟读录音</button>' +
    '<button class="btn small ghost" id="btnMine">🎧 听我读的</button>' +
    '<button class="btn small ghost" id="stopRead">⏹ 停止</button>' +
    '<button class="btn small ghost" id="pyToggle">🔤 拼音：' + (settings.pinyin ? '开' : '关') + '</button></div></div>' +
    '<p class="muted" style="text-align:center">点任意一句，跟着读一读</p>';
  const tapped = new Set();
  function markRead() {
    day().read = 1;
    if (!cdata.readOnce.includes(t.id)) {
      cdata.readOnce.push(t.id); cdata.counters.read++;
      addStars(2); checkMedals();
    }
    saveChild();
  }
  function say(i, next) {
    $$('.para').forEach(x => x.classList.remove('active'));
    const el = $$('.para')[i]; if (el) el.classList.add('active');
    speak(t.paras[i], () => { if (el) el.classList.remove('active'); next && next(); });
  }
  $$('.para').forEach(el => el.onclick = () => {
    const i = +el.dataset.i; tapped.add(i);
    if (tapped.size >= t.paras.length) markRead();
    say(i);
  });
  $('#readAll').onclick = () => {
    const token = readSeq;
    let i = 0;
    (function next() {
      if (token !== readSeq) return;
      if (i >= t.paras.length) { markRead(); toast('📖 朗读完成！'); return; }
      say(i, next); i++;
    })();
  };
  $('#stopRead').onclick = () => { try { speechSynthesis.cancel(); } catch (e) {} $$('.para').forEach(x => x.classList.remove('active')); };
  $('#pyToggle').onclick = () => { settings.pinyin = !settings.pinyin; saveSettings(); render('read', { id: t.id }); };
  onLeave(() => { if (recState) { try { recState.rec.stop(); } catch (e) {} } });
  $('#btnRec').onclick = () => recToggle(t.id, $('#btnRec'));
  $('#btnMine').onclick = () => recPlay(t.id);
};

/* ---------- 听写小达人 ---------- */
RENDER.dict = function (v) {
  const custom = (cdata.dictChars || []).length >= 4;
  const list = custom ? customDictItems() : shuffle(DICTS.map((d, i) => i)).slice(0, 5).map(dictItem);
  v.innerHTML = (custom ? '<div class="muted" style="text-align:center;margin-bottom:6px">📋 使用家长选定的生字表（' + (cdata.dictChars || []).length + ' 字）</div>' : '') +
    '<div id="dictHolder"></div>';
  runQuiz($('#dictHolder'), list, (ok, total) => showResult(ok, total, '', () => go('dict')));
};

/* ---------- 古诗填空 ---------- */
RENDER.poem = function (v, p) {
  if (p.pi === undefined) {
    v.innerHTML = '<p class="muted" style="margin:4px 2px 10px">把空缺的字填出来，背会一首得 3 ⭐</p>' +
      POEMS.map((pm, i) => '<button class="itemRow" data-p="' + i + '"><span class="em">🏮</span>' +
        '<span class="tx"><b>' + pm.title + '</b><small>' + pm.author + (cdata.poemDone.includes(pm.title) ? ' · 已完成 ⭐' : '') + '</small></span>' +
        '<span class="chip">挑战</span></button>').join('');
    $$('[data-p]').forEach(b => b.onclick = () => go('poem', { pi: +b.dataset.p }));
    return;
  }
  const pm = POEMS[p.pi];
  v.innerHTML = '<div class="card" style="text-align:center"><b style="font-size:20px">' + pm.title + '</b>' +
    '<div class="poemAuthor">' + pm.author + '</div><div class="muted">先听一遍整首诗</div>' +
    '<button class="btn small" id="pmSay">🔊 听一听</button><div id="pmHolder" style="margin-top:10px"></div></div>';
  $('#pmSay').onclick = () => speak(pm.title + '。' + pm.lines.join('。') + '。');
  const items = pm.blanks.map((b, bi) => rebuild({ g: 'poem', pi: p.pi, bi }));
  runQuiz($('#pmHolder'), items, (ok, total) => {
    if (ok === total && !cdata.poemDone.includes(pm.title)) {
      cdata.poemDone.push(pm.title); addStars(3); checkMedals(); saveChild();
    }
    showResult(ok, total, ok === total ? '古诗完成，⭐ +3' : '', () => go('poem'));
  });
};

/* ---------- 语文闯关 ---------- */
RENDER.pquiz = function (v) {
  const items = shuffle(CHN_QS).slice(0, 10).map(q => staticQ(q.id));
  runQuiz($('#view'), items, (ok, total) => showResult(ok, total, '', () => go('pquiz')));
};

/* ---------- 古诗学堂（课外诗词，适合 2~3 年级） ---------- */
const POEM_EXTRA = [
  { title: '梅花', author: '王安石', dyn: '宋',
    lines: ['墙角数枝梅', '凌寒独自开', '遥知不是雪', '为有暗香来'],
    meaning: ['墙角有几枝梅花', '冒着严寒独自开放', '远远就知道那不是雪', '因为有一阵淡淡的清香飘过来'],
    blank: { li: 0, ch: '梅', opts: ['梅', '莓', '眉', '媒'] },
    quiz: { q: '「遥知不是雪」是因为什么？', opts: ['有淡淡的清香', '特别白', '会飘动', '很凉'], ans: 0 } },
  { title: '江雪', author: '柳宗元', dyn: '唐',
    lines: ['千山鸟飞绝', '万径人踪灭', '孤舟蓑笠翁', '独钓寒江雪'],
    meaning: ['群山里看不到一只飞鸟', '条条路上没有人的脚印', '江上只有一条小船，披蓑衣的老爷爷', '在大雪的江面上独自钓鱼'],
    blank: { li: 3, ch: '钓', opts: ['钓', '钩', '沟', '鱼'] },
    quiz: { q: '这首诗写的是哪个季节？', opts: ['冬天', '夏天', '春天', '秋天'], ans: 0 } },
  { title: '悯农', author: '李绅', dyn: '唐',
    lines: ['锄禾日当午', '汗滴禾下土', '谁知盘中餐', '粒粒皆辛苦'],
    meaning: ['中午顶着大太阳锄地', '汗水一滴一滴落进禾苗下的泥土', '谁知道碗里的每一口饭', '每一粒都是辛苦换来的'],
    blank: { li: 3, ch: '辛', opts: ['辛', '幸', '新', '心'] },
    quiz: { q: '「粒粒皆辛苦」告诉我们什么？', opts: ['要爱惜粮食', '要多吃饭', '种田很快乐', '米饭很好吃'], ans: 0 } },
  { title: '寻隐者不遇', author: '贾岛', dyn: '唐',
    lines: ['松下问童子', '言师采药去', '只在此山中', '云深不知处'],
    meaning: ['松树下我问小童子', '他说师傅采药去了', '只知道就在这座山里', '山高云深，找不到在哪里'],
    blank: { li: 3, ch: '知', opts: ['知', '之', '支', '只'] },
    quiz: { q: '「我」为什么没有见到隐者？', opts: ['童子说师傅采药去了', '隐者在家睡觉', '下大雨了', '童子不肯说'], ans: 0 } },
  { title: '所见', author: '袁枚', dyn: '清',
    lines: ['牧童骑黄牛', '歌声振林樾', '意欲捕鸣蝉', '忽然闭口立'],
    meaning: ['牧童骑在黄牛背上', '响亮的歌声在树林里回荡', '想要捉树上鸣叫的蝉', '忽然闭上嘴巴站住了'],
    blank: { li: 2, ch: '蝉', opts: ['蝉', '禅', '单', '蚕'] },
    quiz: { q: '牧童为什么忽然闭上嘴站住了？', opts: ['想捉树上叫的蝉', '唱歌累了', '看见陌生人', '天黑了'], ans: 0 } },
  { title: '舟夜书所见', author: '查慎行', dyn: '清',
    lines: ['月黑见渔灯', '孤光一点萤', '微微风簇浪', '散作满河星'],
    meaning: ['夜里没有月亮，能看见江上的渔灯', '孤单的灯光像一点萤火', '微微的风吹起层层波浪', '灯光散开来，像满河的星星'],
    blank: { li: 3, ch: '星', opts: ['星', '醒', '腥', '猩'] },
    quiz: { q: '微风吹起波浪后，渔灯的光变成了什么样？', opts: ['像满河的星星', '像一轮圆月', '像一条小蛇', '什么也看不见'], ans: 0 } },
  { title: '画鸡', author: '唐寅', dyn: '明',
    lines: ['头上红冠不用裁', '满身雪白走将来', '平生不敢轻言语', '一叫千门万户开'],
    meaning: ['头上的红冠子不用剪裁', '浑身雪白地走过来', '平时不敢随便啼叫', '一叫呀，千家万户都开门啦'],
    blank: { li: 0, ch: '裁', opts: ['裁', '栽', '载', '截'] },
    quiz: { q: '大公鸡一叫，发生了什么？', opts: ['千家万户都开门了', '天下起雨来', '太阳下山了', '小朋友上学了'], ans: 0 } },
  { title: '游子吟', author: '孟郊', dyn: '唐',
    lines: ['慈母手中线', '游子身上衣', '临行密密缝', '意恐迟迟归', '谁言寸草心', '报得三春晖'],
    meaning: ['慈爱的妈妈手里拿着针线', '给要出远门的孩子缝衣服', '临走前缝得又密又牢', '怕孩子在外面回来得太晚', '孩子像小草一样的孝心', '怎么报答得了妈妈像春天阳光般的爱呢'],
    blank: { li: 5, ch: '晖', opts: ['晖', '辉', '挥', '浑'] },
    quiz: { q: '这首诗写的是谁的爱？', opts: ['妈妈对孩子的爱', '老师对学生的爱', '朋友之间的爱', '对大自然的喜爱'], ans: 0 } },
  { title: '回乡偶书', author: '贺知章', dyn: '唐',
    lines: ['少小离家老大回', '乡音无改鬓毛衰', '儿童相见不相识', '笑问客从何处来'],
    meaning: ['年轻时离开家乡，老了才回来', '乡音没有变，头发却白了、少了', '村里的孩子见了我都不认识', '笑着问：客人从哪里来呀'],
    blank: { li: 3, ch: '处', opts: ['处', '楚', '触', '础'] },
    quiz: { q: '村里的孩子为什么笑着问诗人？', opts: ['把他当成了外来的客人', '认识他，很喜欢他', '他穿着奇怪的衣服', '他在表演节目'], ans: 0 } },
  { title: '忆江南', author: '白居易', dyn: '唐',
    lines: ['江南好', '风景旧曾谙', '日出江花红胜火', '春来江水绿如蓝', '能不忆江南'],
    meaning: ['江南真好呀', '那里的风景我以前就很熟悉', '太阳升起，江边的花开得比火还红', '春天来了，江水绿得像蓝草一样', '怎么能不怀念江南呢'],
    blank: { li: 2, ch: '胜', opts: ['胜', '性', '姓', '星'] },
    quiz: { q: '「日出江花红胜火」是说江边的花怎么样？', opts: ['红得比火还鲜艳', '被太阳晒干了', '像火一样会燃烧', '掉进江里了'], ans: 0 } },
  { title: '长歌行（节选）', author: '汉乐府', dyn: '汉',
    lines: ['百川东到海', '何时复西归', '少壮不努力', '老大徒伤悲'],
    meaning: ['许多大江大河向东流进大海', '什么时候才回头向西流呢', '年少的时候不抓紧努力', '老了以后只能白白地悲伤'],
    blank: { li: 2, ch: '力', opts: ['力', '立', '丽', '利'] },
    quiz: { q: '「少壮不努力，老大徒伤悲」提醒我们什么？', opts: ['小时候要努力学习', '老了再学也不迟', '不要长大', '多睡觉身体好'], ans: 0 } },
  { title: '古朗月行（节选）', author: '李白', dyn: '唐',
    lines: ['小时不识月', '呼作白玉盘', '又疑瑶台镜', '飞在青云端'],
    meaning: ['小时候不认识月亮', '把它叫作白玉做的盘子', '又怀疑是仙女住的瑶台上的镜子', '飞挂在青色的云端'],
    blank: { li: 1, ch: '盘', opts: ['盘', '搬', '般', '扮'] },
    quiz: { q: '小时候的李白把月亮比作什么？', opts: ['白玉盘和瑶台镜', '金元宝', '大灯笼', '小白船'], ans: 0 } },
  { title: '风', author: '李峤', dyn: '唐',
    lines: ['解落三秋叶', '能开二月花', '过江千尺浪', '入竹万竿斜'],
    meaning: ['能吹落秋天的树叶', '能吹开春天的花朵', '刮过江面能掀起千尺巨浪', '吹进竹林能让万竿翠竹倾斜'],
    blank: { li: 3, ch: '斜', opts: ['斜', '鞋', '协', '谢'] },
    quiz: { q: '诗里的「风」做过哪些事？', opts: ['吹落秋叶、吹开春花、掀起巨浪', '下雨、下雪、打雷', '唱歌、跳舞、画画', '生火、做饭、洗衣'], ans: 0 } },
  { title: '塞下曲', author: '卢纶', dyn: '唐',
    lines: ['月黑雁飞高', '单于夜遁逃', '欲将轻骑逐', '大雪满弓刀'],
    meaning: ['没有月亮，大雁惊飞高空', '敌军的首领趁黑夜逃跑了', '将军正想带领轻骑兵去追赶', '纷飞的大雪落满了弓和刀'],
    blank: { li: 3, ch: '刀', opts: ['刀', '到', '岛', '道'] },
    quiz: { q: '「单于夜遁逃」是说谁在夜里逃跑了？', opts: ['敌人的首领', '大雁', '将军', '小鹿'], ans: 0 } }
];
const AUTHOR_POOL = Array.from(new Set(POEM_EXTRA.map(p => p.author)));
function xpAuthorQ(i) {
  const p = POEM_EXTRA[i];
  const wrong = shuffle(AUTHOR_POOL.filter(a => a !== p.author)).slice(0, 3);
  const opts = shuffle([p.author].concat(wrong));
  return { kind: 'choice', text: '《' + p.title + '》的作者是谁？', opts, ans: opts.indexOf(p.author), kp: '课外古诗', subj: 'chn', say: '《' + p.title + '》的作者是谁？' };
}
function xpBlankQ(i) {
  const p = POEM_EXTRA[i], b = p.blank, line = p.lines[b.li], pos = line.indexOf(b.ch);
  const t = line.slice(0, pos) + '（　）' + line.slice(pos + 1);
  return { kind: 'choice', text: t, opts: b.opts, ans: b.opts.indexOf(b.ch), kp: '课外古诗', subj: 'chn', say: line, exp: '这句诗是「' + line + '」' };
}
function xpQuizQ(i) {
  const p = POEM_EXTRA[i];
  return { kind: 'choice', text: p.quiz.q, opts: p.quiz.opts, ans: p.quiz.ans, kp: '课外古诗', subj: 'chn', say: p.quiz.q };
}
RENDER.xpoem = function (v, p) {
  if (p.i === undefined) {
    const n = (cdata.xpoem || []).length;
    v.innerHTML = '<div class="row" style="margin:4px 2px 10px"><span class="chip g">已学 ' + n + ' / ' + POEM_EXTRA.length + ' 首</span>' +
      '<span class="muted">学完一首得 3 ⭐</span></div>' +
      POEM_EXTRA.map((pm, i) => '<button class="itemRow" data-x="' + i + '"><span class="em">📜</span>' +
        '<span class="tx"><b>' + pm.title + '</b><small>' + pm.dyn + ' · ' + pm.author + ((cdata.xpoem || []).includes(pm.title) ? ' · 已学会 ⭐' : '') + '</small></span>' +
        '<span class="chip">学一学</span></button>').join('') +
      '<p class="muted" style="text-align:center;margin-top:8px">听一听 → 读一读 → 看意思 → 小挑战</p>';
    $$('[data-x]').forEach(b => b.onclick = () => go('xpoem', { i: +b.dataset.x }));
    return;
  }
  const pm = POEM_EXTRA[p.i];
  const learned = (cdata.xpoem || []).includes(pm.title);
  v.innerHTML = '<div class="card" style="text-align:center">' +
    '<span class="chip' + (learned ? ' g' : '') + '">' + (learned ? '已学会 ⭐' : '课外诗词') + '</span>' +
    '<div class="poemTitle" style="margin-top:6px">' + pm.title + '</div>' +
    '<div class="poemAuthor">' + pm.dyn + ' · ' + pm.author + '</div>' +
    pm.lines.map((s, i) => '<div class="para" data-li="' + i + '">' + (settings.pinyin ? pinyinLine(s) : '<b style="font-size:22px">' + s + '</b>') + '</div>').join('') +
    '<div class="row" style="justify-content:center;gap:10px;margin-top:12px;flex-wrap:wrap">' +
    '<button class="btn" id="xpAll">▶️ 听整首</button>' +
    '<button class="btn small blu" id="xpMean">📖 看意思</button>' +
    '<button class="btn small ghost" id="xpRec">🎙️ 跟读录音</button>' +
    '<button class="btn small ghost" id="xpMine">🎧 听我读的</button>' +
    '<button class="btn small ghost" id="xpPy">🔤 拼音：' + (settings.pinyin ? '开' : '关') + '</button></div>' +
    '<div class="expBox" id="meanCard" style="text-align:left;display:none">' +
    pm.lines.map((s, i) => '<div style="margin:4px 0"><b>' + s + '</b><br>' + pm.meaning[i] + '</div>').join('') + '</div>' +
    '<button class="btn grn block" id="xpQuiz" style="margin-top:14px">🎯 小挑战（3 道题）</button>' +
    '<div id="xpHolder" style="margin-top:12px"></div></div>' +
    '<p class="muted" style="text-align:center">点任意一句，听一句读一句</p>';
  speak(pm.title + '，' + pm.author);
  $$('.para').forEach(el => el.onclick = () => {
    $$('.para').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
    speak(pm.lines[+el.dataset.li], () => el.classList.remove('active'));
  });
  $('#xpAll').onclick = () => {
    const token = readSeq;
    let i = 0;
    (function next() {
      if (token !== readSeq) return;
      if (i >= pm.lines.length) return;
      $$('.para').forEach(x => x.classList.remove('active'));
      const el = $$('.para')[i];
      el.classList.add('active');
      speak(pm.lines[i], () => { if (token !== readSeq) return; el.classList.remove('active'); next(); });
      i++;
    })();
  };
  $('#xpMean').onclick = () => {
    const c = $('#meanCard');
    c.style.display = c.style.display === 'none' ? 'block' : 'none';
  };
  onLeave(() => { if (recState) { try { recState.rec.stop(); } catch (e) {} } });
  $('#xpRec').onclick = () => recToggle('xp:' + pm.title, $('#xpRec'));
  $('#xpMine').onclick = () => recPlay('xp:' + pm.title);
  $('#xpPy').onclick = () => { settings.pinyin = !settings.pinyin; saveSettings(); render('xpoem', { i: p.i }); };
  $('#xpQuiz').onclick = () => {
    const items = [
      { q: xpAuthorQ(p.i), meta: { key: 'xp:auth:' + p.i, type: 'gen', payload: { g: 'xp', i: p.i, k: 'auth' } } },
      { q: xpBlankQ(p.i), meta: { key: 'xp:blank:' + p.i, type: 'gen', payload: { g: 'xp', i: p.i, k: 'blank' } } },
      { q: xpQuizQ(p.i), meta: { key: 'xp:quiz:' + p.i, type: 'gen', payload: { g: 'xp', i: p.i, k: 'quiz' } } }
    ];
    runQuiz($('#xpHolder'), items, (ok, total) => {
      if (ok === total && !(cdata.xpoem || []).includes(pm.title)) {
        cdata.xpoem = cdata.xpoem || [];
        cdata.xpoem.push(pm.title);
        addStars(3); checkMedals(); saveChild();
      }
      showResult(ok, total, ok === total && !learned ? '古诗学会，⭐ +3' : '', () => go('xpoem'));
    });
  };
};

/* ============================================================
   扩展功能：期末模拟卷 / 自定义听写 / 拼音专项 / 看图写话 / 录音 / 打印
   ============================================================ */
const APP_VERSION = '1.3.2';

/* ---------- 听写题目构造 ---------- */
function dictItem(i) {
  const d = DICTS[i];
  return { q: { kind: 'choice', text: '听一听，选出你听到的词语', opts: d.opts, ans: d.opts.indexOf(d.w), kp: '听写', subj: 'chn', say: d.w, exp: '这个词是「' + d.w + '」' },
           meta: { key: 'dict:' + i, type: 'dict', payload: { g: 'dict', i } } };
}
function customDictItems() {
  const sel = cdata.dictChars || [];
  const pool = CHARS.filter(c => sel.includes(c.c) && c.w.length);
  const allWords = CHARS.flatMap(c => c.w).filter((w, i, a) => a.indexOf(w) === i);
  const items = [];
  shuffle(pool).slice(0, 5).forEach(ch => {
    const w = pick(ch.w);
    const opts = shuffle([w].concat(shuffle(allWords.filter(x => x !== w)).slice(0, 3)));
    items.push({ q: { kind: 'choice', text: '听一听，选出你听到的词语', opts, ans: opts.indexOf(w), kp: '听写', subj: 'chn', say: w, exp: '这个词是「' + w + '」' },
                 meta: { key: 'cd:' + w, type: 'dict', payload: { g: 'cdict', w, opts } } });
  });
  return items;
}

/* ---------- 看拼音写词（拼音由生字库合成） ---------- */
const PY_WORDS = ['春天', '春雨', '树叶', '河水', '快跑', '唱歌', '笑话', '快乐', '写话', '画画', '说话', '朋友', '雪花', '春风', '生日', '月亮', '月光', '星星', '明天', '明亮', '山水', '学生', '知道'];
function pyWordItem(w) {
  const pys = w.split('').map(ch => { const c = CHARS.find(x => x.c === ch); return c ? c.py : '?'; }).join(' ');
  const opts = shuffle([w].concat(shuffle(PY_WORDS.filter(x => x !== w)).slice(0, 3)));
  return { q: { kind: 'choice', py: true, text: pys, opts, ans: opts.indexOf(w), kp: '看拼音写词', subj: 'chn', say: '看拼音，选出正确的词语', exp: '“' + pys + '”就是「' + w + '」' },
           meta: { key: 'pyw:' + w, type: 'gen', payload: { g: 'pyw', w } } };
}

/* ---------- 期末模拟卷 ---------- */
function examStatic(id) { const it = staticQ(id); it.q.once = true; return it; }
function buildExam(bk) {
  const items = [];
  for (let i = 0; i < 8; i++) {
    let it;
    if (bk === '上') it = calcItem(genCalc(pick(['add', 'sub', 'mul', 'div'])));
    else it = i < 4 ? remItem() : calcItem(genCalc3());
    it.q.once = true; items.push(it);
  }
  MATH_UNITS.filter(u => u.bk === bk).forEach(u => {
    const pool = shuffle(MATH_QS.filter(q => q.u === u.id));
    if (pool.length) items.push(examStatic(pool[0].id));
  });
  return shuffle(items);
}
function buildExamChn() {
  const items = [];
  shuffle(CHN_QS).slice(0, 5).forEach(q => items.push(examStatic(q.id)));
  shuffle(DICTS.map((d, i) => i)).slice(0, 3).forEach(i => { const it = dictItem(i); it.q.once = true; items.push(it); });
  shuffle(PY_WORDS).slice(0, 4).forEach(w => { const it = pyWordItem(w); it.q.once = true; items.push(it); });
  shuffle(POEMS.map((p, i) => i)).slice(0, 3).forEach(pi => {
    const bi = rnd(POEMS[pi].blanks.length);
    const it = rebuild({ g: 'poem', pi, bi }); it.q.once = true; items.push(it);
  });
  return shuffle(items);
}
RENDER.exam = function (v) {
  v.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:44px">📝</div>' +
    '<b style="font-size:20px">期末模拟卷</b>' +
    '<p class="muted">整卷作答 · 每题一次机会 · 全对奖励 5 ⭐</p>' +
    '<div class="choices">' +
    '<button class="choice" data-e="ms">🧮 数学 · 上册卷（15 题）</button>' +
    '<button class="choice" data-e="mx">🧮 数学 · 下册卷（16 题）</button>' +
    '<button class="choice" data-e="yw">📖 语文 · 综合卷（15 题）</button></div>' +
    '<p class="muted" style="margin-top:8px">内容从各单元题库随机抽取，每次都不一样</p></div>';
  $$('[data-e]').forEach(b => b.onclick = () => {
    const items = b.dataset.e === 'ms' ? buildExam('上') : b.dataset.e === 'mx' ? buildExam('下') : buildExamChn();
    runQuiz($('#view'), items, (ok, total) => {
      if (ok === total) addStars(5);
      showResult(ok, total, ok === total ? '🎉 全卷通过，⭐ +5' : '', () => go('exam'));
    });
  });
};

/* ---------- 拼音专项 ---------- */
const PINYIN = {
  '声母': ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'],
  '韵母': ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'],
  '整体认读': ['zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si', 'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying']
};
const PY_SOUND = { b: '波', p: '坡', m: '摸', f: '佛', d: '得', t: '特', n: '讷', l: '勒', g: '哥', k: '科', h: '喝', j: '鸡', q: '七', x: '西', zh: '知', ch: '吃', sh: '诗', r: '日', z: '资', c: '刺', s: '丝', y: '衣', w: '乌',
  a: '啊', o: '喔', e: '鹅', i: '衣', u: '乌', 'ü': '迂', ai: '爱', ei: '诶', ui: '威', ao: '奥', ou: '欧', iu: '优', ie: '耶', 'üe': '约', er: '耳', an: '安', en: '恩', in: '因', un: '温', 'ün': '晕', ang: '昂', eng: '鞥', ing: '英', ong: '翁',
  zhi: '知', chi: '吃', shi: '诗', ri: '日', zi: '资', ci: '刺', si: '丝', yi: '一', wu: '五', yu: '鱼', ye: '夜', yue: '月', yuan: '圆', yin: '因', yun: '云', ying: '鹰' };
const PY_QS = [
  { id: 'p01', kind: 'choice', text: '下面全是声母的一组是：', opts: ['b  p  m  f', 'a  o  e', 'an  en  ang', 'zhi  chi  shi'], ans: 0, exp: 'a/o/e 是韵母，an/en/ang 是韵母，zhi/chi/shi 是整体认读音节。' },
  { id: 'p02', kind: 'choice', text: '下面哪个是韵母？', opts: ['ang', 'zh', 'b', 'shi'], ans: 0, exp: 'ang 是后鼻韵母。' },
  { id: 'p03', kind: 'choice', text: '下面哪个是整体认读音节？', opts: ['yuan', 'an', 'b', 'ou'], ans: 0, exp: 'yuan 是整体认读音节，要整体记。' },
  { id: 'p04', kind: 'judge', text: 'a、o、e 是三个单韵母。', ans: true, exp: '单韵母一共 6 个：a、o、e、i、u、ü。' },
  { id: 'p05', kind: 'choice', text: 'i 和 u 并排时，声调标在谁头上？', opts: ['标在后面的字母上', '标在 i 上', '标在 u 上', '两个都标'], ans: 0, exp: '标调规则：i、u 并列标在后，如 liú 标在 u 上、guì 标在 i 上。' },
  { id: 'p06', kind: 'choice', text: '“qī”的声母是：', opts: ['q', 'i', 'qi', 'p'], ans: 0, exp: '声母在最前面，qī 的声母是 q，韵母是 i。' },
  { id: 'p07', kind: 'judge', text: 'zhi、chi、shi、ri 是整体认读音节。', ans: true, exp: '这四个要整体记忆，不能拼读。' },
  { id: 'p08', kind: 'choice', text: '下面哪个不是声母？', opts: ['yuan', 'b', 'p', 'm'], ans: 0, exp: 'yuan 是整体认读音节。' },
  { id: 'p09', kind: 'choice', text: '“shān”（山）的韵母是：', opts: ['an', 'a', 'ang', 'sh'], ans: 0, exp: 'sh 是声母，an 是韵母。' },
  { id: 'p10', kind: 'judge', text: 'ü 见到 j、q、x 要脱帽，写成 u。', ans: true, exp: 'ju、qu、xu 里的 u 其实都读 ü。' },
  { id: 'p11', kind: 'choice', text: '下面哪个是三拼音节？', opts: ['gua', 'ba', 'ma', 'yi'], ans: 0, exp: 'gua 由声母 g + 介母 u + 韵母 a 组成，是三拼音节。' },
  { id: 'p12', kind: 'judge', text: '一个音节可以没有声母，但不能没有韵母。', ans: true, exp: '如“爱（ài）”没有声母，只有韵母。' },
  { id: 'p13', kind: 'choice', text: '“二（èr）”的韵母 er 是：', opts: ['特殊韵母', '前鼻韵母', '后鼻韵母', '声母'], ans: 0, exp: 'er 不能和其他声母相拼，是特殊韵母。' },
  { id: 'p14', kind: 'choice', text: '声母表 b、p、m、f 的下一个是：', opts: ['d', 't', 'n', 'g'], ans: 0, exp: '声母表顺序：b p m f d t n l……' }
];
RENDER.py = function (v) {
  const tabs = Object.keys(PINYIN);
  v.innerHTML = '<div class="card"><b style="font-size:19px">🔤 拼音点读表</b>' +
    '<div class="choices" style="flex-direction:row" id="pyTabs">' + tabs.map((t, i) =>
      '<button class="choice' + (i === 0 ? ' ok' : '') + '" data-t="' + t + '" style="padding:8px;font-size:15px;flex:1">' + t + '</button>').join('') + '</div>' +
    '<div id="pyGrid" style="margin-top:10px"></div>' +
    '<p class="muted" style="text-align:center">点一个拼音，听它的读音</p></div>' +
    '<div class="card" style="text-align:center"><b>🎯 拼音闯关</b><p class="muted">声母韵母 · 标调规则 · 整体认读</p>' +
    '<button class="btn grn block" id="pyQuiz">开始闯关（8 题）</button><div id="pyHolder" style="margin-top:10px"></div></div>';
  function showTab(t) {
    $('#pyGrid').innerHTML = '<div class="charGrid" style="grid-template-columns:repeat(6,1fr)">' +
      PINYIN[t].map(x => '<button class="charCell" data-py="' + x + '" style="font-size:20px">' + x +
        '<small>' + (PY_SOUND[x] || '') + '</small></button>').join('') + '</div>';
    $$('#pyGrid [data-py]').forEach(b => b.onclick = () => {
      const x = b.dataset.py;
      speak(PY_SOUND[x] || x);
      toast(x + ' · ' + (PY_SOUND[x] || ''));
    });
  }
  showTab(tabs[0]);
  $$('#pyTabs .choice').forEach(b => b.onclick = () => {
    $$('#pyTabs .choice').forEach(x => x.classList.remove('ok')); b.classList.add('ok'); showTab(b.dataset.t);
  });
  $('#pyQuiz').onclick = () => {
    const items = shuffle(PY_QS).slice(0, 8).map(q => ({
      q: { kind: q.kind, text: q.text, opts: q.opts, ans: q.ans, exp: q.exp, kp: '拼音', subj: 'chn' },
      meta: { key: 'py:' + q.id, type: 'static', payload: { g: 'pyid', id: q.id } }
    }));
    runQuiz($('#pyHolder'), items, (ok, total) => showResult(ok, total, '', () => go('py')));
  };
};

/* ---------- 看图写话 ---------- */
const XH_PROMPTS = [
  { id: 'p1', em: '🪁', title: '放风筝', hint: '天上有什么？地上有什么？小朋友们玩得怎么样？' },
  { id: 'p2', em: '☔', title: '下雨了', hint: '雨中的街道什么样？谁没带伞？谁帮助了谁？' },
  { id: 'p3', em: '🎂', title: '我的生日', hint: '生日那天发生了什么？收到了什么礼物？最想感谢谁？' }
];
RENDER.xh = function (v, p) {
  if (p.edit === undefined && p.view === undefined) {
    const works = cdata.works || [];
    v.innerHTML = '<h2 class="sec">🖍️ 选一幅图，先画一画，再写几句话</h2>' +
      XH_PROMPTS.map(x => '<button class="itemRow" data-p="' + x.id + '"><span class="em">' + x.em + '</span>' +
        '<span class="tx"><b>' + x.title + '</b><small>' + x.hint + '</small></span><span class="chip b">写话</span></button>').join('') +
      '<h2 class="sec">📁 我的作品（' + works.length + '）</h2>' +
      (works.length ? works.map(w =>
        '<button class="itemRow" data-w="' + w.id + '"><span class="em">' + (XH_PROMPTS.find(x => x.id === w.promptId) || { em: '📄' }).em + '</span>' +
        '<span class="tx"><b>' + esc(w.text.slice(0, 16)) + (w.text.length > 16 ? '…' : '') + '</b><small>' + w.date + ' · ' + w.promptTitle + '</small></span><span class="chip g">查看</span></button>').join('')
        : '<p class="muted" style="text-align:center">还没有作品，快写第一篇吧！每天第一篇 +2 ⭐</p>');
    $$('[data-p]').forEach(b => b.onclick = () => go('xh', { edit: b.dataset.p }));
    $$('[data-w]').forEach(b => b.onclick = () => go('xh', { view: b.dataset.w }));
    return;
  }
  if (p.view) {
    const w = (cdata.works || []).find(x => x.id === p.view);
    if (!w) { go('xh'); return; }
    const x = XH_PROMPTS.find(t => t.id === w.promptId) || { em: '📄', title: w.promptTitle };
    v.innerHTML = '<div class="card"><div class="poemTitle">' + x.em + ' ' + x.title + '</div>' +
      '<div class="poemAuthor">' + w.date + '</div>' +
      (w.img ? '<img src="' + w.img + '" style="width:100%;max-width:320px;border-radius:14px;border:3px solid var(--line)">' : '') +
      '<p style="font-size:19px;line-height:1.9;text-align:left;white-space:pre-wrap">' + esc(w.text) + '</p>' +
      '<div class="row" style="justify-content:center;gap:10px">' +
      '<button class="btn small ghost" id="wBack">返回</button>' +
      '<button class="btn small ghost" id="wDel">🗑️ 删除</button></div></div>';
    $('#wBack').onclick = () => go('xh');
    $('#wDel').onclick = () => {
      if (!confirm('确定删除这篇作品吗？')) return;
      cdata.works = (cdata.works || []).filter(x => x.id !== w.id); saveChild(); go('xh');
    };
    return;
  }
  const x = XH_PROMPTS.find(t => t.id === p.edit);
  if (!x) { go('xh'); return; }
  v.innerHTML = '<div class="card" style="text-align:center">' +
    '<div style="font-size:38px">' + x.em + '</div><b style="font-size:20px">' + x.title + '</b>' +
    '<p class="muted">' + x.hint + '</p>' +
    '<canvas id="xhCv" width="520" height="300" style="width:100%;max-width:420px;border:3px solid var(--line);border-radius:16px;touch-action:none;background:#fff"></canvas>' +
    '<div class="row" style="justify-content:center;gap:8px;margin-top:8px">' +
    '<button class="wordChip" data-c="#333">⚫ 黑</button><button class="wordChip" data-c="#E84A3F">🔴 红</button>' +
    '<button class="wordChip" data-c="#2E6FD8">🔵 蓝</button><button class="wordChip" data-c="#2E8B57">🟢 绿</button>' +
    '<button class="wordChip" id="xhClr">🧽 清空</button></div>' +
    '<textarea id="xhText" placeholder="在这里写几句话……" style="width:100%;max-width:420px;min-height:110px;margin-top:12px;font-size:19px;line-height:1.8;padding:12px;border:3px solid var(--line);border-radius:16px;font-family:inherit;color:var(--ink);background:#fff"></textarea>' +
    '<div><button class="btn grn" id="xhSave">💾 保存作品</button></div>' +
    '<p class="muted" style="margin-top:6px">每天第一篇作品 +2 ⭐ · 最多保存 12 篇</p></div>';
  const cv = $('#xhCv'), ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let drawing = false, color = '#333';
  function pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
  cv.addEventListener('pointerdown', e => { drawing = true; const q = pos(e); ctx.beginPath(); ctx.moveTo(q.x, q.y); });
  cv.addEventListener('pointermove', e => { if (!drawing) return; e.preventDefault(); const q = pos(e); ctx.strokeStyle = color; ctx.lineTo(q.x, q.y); ctx.stroke(); });
  window.addEventListener('pointerup', () => drawing = false);
  $$('.wordChip[data-c]').forEach(b => b.onclick = () => { color = b.dataset.c; toast('已换画笔'); });
  $('#xhClr').onclick = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); };
  $('#xhSave').onclick = () => {
    const text = $('#xhText').value.trim();
    if (text.length < 4) { toast('写一句话再保存吧（4 个字以上）'); return; }
    cdata.works = cdata.works || [];
    cdata.works.unshift({ id: 'w' + Date.now(), promptId: x.id, promptTitle: x.title, text, img: cv.toDataURL('image/jpeg', 0.6), date: todayStr() });
    if (cdata.works.length > 12) cdata.works.length = 12;
    if (cdata.workBonus !== todayStr()) { cdata.workBonus = todayStr(); addStars(2); }
    checkMedals(); saveChild();
    toast('🖍️ 作品已保存！'); go('xh');
  };
};

/* ---------- 跟读录音（IndexedDB 保存） ---------- */
function idb() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open('lx2', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('rec');
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
async function idbSet(k, v) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('rec', 'readwrite'); tx.objectStore('rec').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }
async function idbGet(k) { const db = await idb(); return new Promise((res, rej) => { const rq = db.transaction('rec').objectStore('rec').get(k); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); }); }
let recState = null;
function recSupported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); }
async function recToggle(key, btn) {
  if (!recSupported()) { toast('此打开方式不支持录音（需要本地服务或 https）'); return; }
  if (recState) { try { recState.rec.stop(); } catch (e) {} return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream); const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      recState = null; btn.textContent = '🎙️ 跟读录音';
      try { await idbSet('rec:' + key, blob); toast('录音已保存，马上回放'); } catch (e) { toast('录音保存失败'); }
      recPlay(key);
    };
    rec.start(); recState = { rec };
    btn.textContent = '⏹ 结束录音';
    toast('开始录音，读完点一下结束');
  } catch (e) {
    toast(e && e.name === 'NotAllowedError' ? '麦克风未授权，请在浏览器设置里允许' : '麦克风不可用');
  }
}
async function recPlay(key) {
  try {
    const blob = await idbGet('rec:' + key);
    if (!blob) { toast('还没有录音，先录一段吧'); return; }
    const au = new Audio(URL.createObjectURL(blob));
    au.play();
  } catch (e) { toast('回放失败'); }
}

/* ---------- 错题打印卷 ---------- */
function printWrong() {
  const rows = [], answers = [];
  let n = 0;
  (cdata.wrong || []).forEach(w => {
    const it = rebuild(w.payload); if (!it) return;
    const q = it.q; n++;
    let body = '<div class="pq"><b>' + n + '. ' + q.text + '</b>';
    if (q.kind === 'choice') body += '<div style="margin-top:4px">' + q.opts.map((o, i) => '（　）' + String.fromCharCode(65 + i) + '. ' + o).join('　　') + '</div>';
    else if (q.kind === 'judge') body += '<div style="margin-top:4px">（　　）对　　（　　）错</div>';
    else body += '<div style="margin-top:4px">（　　　　　）</div>';
    body += '</div>';
    rows.push(body);
    answers.push(n + '. ' + (q.kind === 'choice' ? String.fromCharCode(65 + q.ans) + ' ' + q.opts[q.ans] : q.kind === 'judge' ? (q.ans ? '对' : '错') : q.ans));
  });
  if (!n) { toast('错题本是空的，先去练习吧'); return; }
  $('#printArea').innerHTML = '<h2 style="text-align:center">错题练习卷（' + todayStr() + ' 共 ' + n + ' 题）</h2>' + rows.join('') +
    '<h3 style="margin-top:18px">参考答案</h3><p style="line-height:1.8">' + answers.join('　　') + '</p>';
  window.print();
}

/* ---------- 题库数据自检 ---------- */
function dataCheck() {
  const errs = [];
  const ckChoice = (tag, q) => { if (q.kind === 'choice' && !(q.ans >= 0 && q.ans < q.opts.length)) errs.push(tag + ' 选项索引越界'); if (q.kind === 'choice' && q.opts && new Set(q.opts).size !== q.opts.length) errs.push(tag + ' 有重复选项'); };
  MATH_QS.forEach(q => ckChoice('数学' + q.id, q));
  CHN_QS.forEach(q => ckChoice('语文' + q.id, q));
  PY_QS.forEach(q => ckChoice('拼音' + q.id, q));
  const seen = new Set();
  CHARS.forEach(c => { if (seen.has(c.c)) errs.push('生字重复：' + c.c); seen.add(c.c); });
  POEMS.forEach(p => p.blanks.forEach(b => {
    const line = p.lines[b.li] || '';
    if (!line.includes(b.ch)) errs.push(p.title + ' 挖空字不在句中');
    if (!b.opts.includes(b.ch)) errs.push(p.title + ' 选项缺少正确字');
  }));
  DICTS.forEach((d, i) => { if (!d.opts.includes(d.w)) errs.push('听写词库 ' + i + ' 缺少正确词'); });
  PY_WORDS.forEach(w => w.split('').forEach(ch => { if (!CHARS.find(x => x.c === ch)) errs.push('看拼音写词「' + w + '」有生字库没有的字'); }));
  POEM_EXTRA.forEach(p => {
    if (!p.lines[p.blank.li].includes(p.blank.ch)) errs.push(p.title + ' 填空字不在句中');
    if (!p.blank.opts.includes(p.blank.ch)) errs.push(p.title + ' 填空选项缺正确字');
    ckChoice(p.title + ' 理解题', p.quiz);
  });
  return errs;
}

/* ============================================================
   错题本 / 我的 / 家长角 / 设置 / 启动
   ============================================================ */
function wrongRow(w) {
  const due = w.nextReview <= todayStr();
  return '<button class="itemRow" data-k="' + esc(w.key) + '"><span class="em">' + (w.subj === 'math' ? '➗' : '📖') + '</span>' +
    '<span class="tx"><b>' + esc(w.label) + '</b><small>' + esc(w.kp) + ' · 错 ' + w.wrongCount + ' 次' +
    (w.rightStreak ? ' · 重做对 ' + w.rightStreak + '/2' : '') + '</small></span>' +
    '<span class="chip ' + (due ? 'r' : '') + '">' + (due ? '该复习了' : w.nextReview + ' 复习') + '</span></button>';
}
function wrongSolved(key, good) {
  const w = cdata.wrong.find(x => x.key === key);
  if (!w) return;
  if (good) {
    w.rightStreak++;
    if (w.rightStreak >= 2) {
      cdata.wrong = cdata.wrong.filter(x => x.key !== key);
      cdata.counters.redoOk++; sfx.tada(); toast('💪 错题消灭，移出错题本！');
    } else { w.nextReview = addDays(3); toast('很棒，3 天后再来复习一次'); }
  } else { w.rightStreak = 0; w.nextReview = todayStr(); }
  checkMedals(); saveChild();
}
RENDER.wrong = function (v) {
  const t = todayStr();
  const sorted = cdata.wrong.slice().sort((a, b) =>
    ((a.nextReview <= t ? 0 : 1) - (b.nextReview <= t ? 0 : 1)) || (b.wrongCount - a.wrongCount));
  const dueList = sorted.filter(w => w.nextReview <= t).slice(0, 10);
  v.innerHTML = '<div class="row" style="margin:4px 2px 12px"><span class="chip r">待复习 ' + wrongDue() + ' 题</span>' +
    '<span class="chip">共 ' + cdata.wrong.length + ' 题</span>' +
    (dueList.length ? '<button class="btn small grn" id="redoAll" style="margin-left:auto">💪 全部重做</button>' : '') + '</div>' +
    '<div id="wHolder"></div>' +
    (sorted.length ? sorted.map(wrongRow).join('') :
      '<div class="card" style="text-align:center;padding:40px 20px"><div style="font-size:50px">🎈</div>' +
      '<b>错题本是空的！</b><p class="muted">做错的题会自动收集到这里<br>重做对 2 次就会移出去</p></div>');
  $$('[data-k]').forEach(b => b.onclick = () => {
    const w = cdata.wrong.find(x => x.key === b.dataset.k);
    if (!w) { render('wrong'); return; }
    const it = rebuild(w.payload);
    if (!it) { cdata.wrong = cdata.wrong.filter(x => x.key !== w.key); saveChild(); render('wrong'); return; }
    runQuiz($('#wHolder'), [it], () => render('wrong'), good => wrongSolved(w.key, good));
  });
  if ($('#redoAll')) $('#redoAll').onclick = () => {
    const items = dueList.map(w => ({ w, it: rebuild(w.payload) })).filter(x => x.it);
    runQuiz($('#wHolder'), items.map(x => x.it), (ok, total) => {
      showResult(ok, total, '', () => render('wrong'));
    }, (good, item) => wrongSolved(item.meta.key, good));
  };
};

/* ---------- 我的奖励 ---------- */
RENDER.me = function (v) {
  const st = streak(), learned = Object.keys(cdata.chars).length;
  const now = new Date(), y = now.getFullYear(), mo = now.getMonth();
  const firstDay = new Date(y, mo, 1).getDay(), nDays = new Date(y, mo + 1, 0).getDate();
  let cal = ['日', '一', '二', '三', '四', '五', '六'].map(h => '<div class="h">' + h + '</div>').join('');
  for (let i = 0; i < firstDay; i++) cal += '<div></div>';
  for (let d = 1; d <= nDays; d++) {
    const ds = y + '-' + String(mo + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    cal += '<div class="d' + (cdata.checkins[ds] ? ' on' : '') + (ds === todayStr() ? ' today' : '') + '">' + d + '</div>';
  }
  v.innerHTML =
    '<div class="card" style="text-align:center"><div style="font-size:44px">' + child.av + '</div>' +
    '<b style="font-size:22px">' + esc(child.name) + '</b>' +
    '<div style="font-size:34px;font-weight:900;color:var(--pri-d);margin-top:6px">⭐ ' + cdata.stars + '</div>' +
    '<div class="muted">连续打卡 ' + st + ' 天</div></div>' +
    '<div class="card"><div class="row" style="justify-content:space-around;text-align:center">' +
    '<div><b style="font-size:22px">🧮 ' + cdata.counters.calc + '</b><div class="muted">口算累计</div></div>' +
    '<div><b style="font-size:22px">✍️ ' + learned + '</b><div class="muted">学会生字</div></div>' +
    '<div><b style="font-size:22px">📖 ' + cdata.counters.read + '</b><div class="muted">朗读篇次</div></div></div></div>' +
    '<h2 class="sec">🏅 勋章墙</h2><div class="medalGrid">' +
    MEDALS.map(m => '<div class="medal' + (cdata.medals.includes(m.id) ? ' got' : '') + '"><div class="em">' + m.em + '</div>' +
      '<b>' + m.nm + '</b><div class="muted" style="font-size:11px">' + m.ds + '</div></div>').join('') + '</div>' +
    '<h2 class="sec">📅 ' + (mo + 1) + ' 月打卡日历</h2><div class="card"><div class="cal">' + cal + '</div></div>' +
    '<button class="btn ghost block" id="swKid" style="margin-top:6px">🔄 切换小朋友</button>';
  $('#swKid').onclick = () => { navStack = []; render('profiles'); };
};

/* ---------- 家长角 ---------- */
RENDER.parent = function (v) {
  let weekMin = 0, weekQ = 0, weekC = 0;
  const kps = {};
  for (let i = 6; i >= 0; i--) {
    const ds = addDays(-i), d = cdata.days[ds];
    if (!d) continue;
    weekMin += d.min; weekQ += d.q; weekC += d.c;
    Object.keys(d.byKp || {}).forEach(k => {
      kps[k] = kps[k] || { q: 0, c: 0 };
      kps[k].q += d.byKp[k].q; kps[k].c += d.byKp[k].c;
    });
  }
  const maxMin = Math.max(10, ...Array.from({ length: 7 }, (_, i) => (cdata.days[addDays(-i)] || {}).min || 0));
  let daysHtml = '';
  for (let i = 6; i >= 0; i--) {
    const d = cdata.days[addDays(-i)] || { min: 0, q: 0, c: 0 };
    const acc = d.q ? Math.round(d.c / d.q * 100) : 0;
    daysHtml += '<div class="barRow"><span class="lb">' + addDays(-i).slice(5).replace('-', '/') + '</span>' +
      '<div class="tr"><i style="width:' + Math.round(d.min / maxMin * 100) + '%"></i></div>' +
      '<span class="vl">' + Math.round(d.min) + '分</span></div>';
  }
  const kpList = Object.keys(kps).map(k => ({ k, ...kps[k] })).sort((a, b) => b.q - a.q).slice(0, 10);
  const kpHtml = kpList.map(x => {
    const acc = x.q ? Math.round(x.c / x.q * 100) : 0;
    const col = acc >= 85 ? 'var(--grn)' : acc >= 60 ? 'var(--gold)' : '#F56A6A';
    return '<div class="barRow"><span class="lb">' + esc(x.k) + '</span>' +
      '<div class="tr"><i style="width:' + acc + '%;background:' + col + '"></i></div>' +
      '<span class="vl">' + acc + '%</span></div>';
  }).join('') || '<p class="muted">暂无数据，让孩子先做几道题吧</p>';
  const dErrs = window.__dataErrs || [];
  v.innerHTML =
    (dErrs.length ? '<div class="card" style="border:3px solid #F56A6A"><b style="color:#D64545">⚠️ 题库自检发现 ' + dErrs.length + ' 个问题</b><p class="muted">' + esc(dErrs.slice(0, 5).join('；')) + '</p></div>' : '') +
    '<div class="card"><b style="font-size:19px">📊 近 7 天学习情况</b>' +
    '<div class="muted" style="margin:4px 0 8px">总时长 ' + Math.round(weekMin) + ' 分钟 · 练题 ' + weekQ + ' · 正确率 ' + (weekQ ? Math.round(weekC / weekQ * 100) : 0) + '%</div>' +
    daysHtml + '</div>' +
    '<div class="card"><b style="font-size:19px">🎯 知识点掌握度</b>' + kpHtml +
    '<p class="muted" style="margin-top:6px">低于 60% 的知识点建议每天专项练 10 题</p></div>' +
    '<div class="card"><b style="font-size:19px">🎧 听写生字表</b>' +
    '<p class="muted" style="margin:6px 0">勾选生字后，「听写小达人」会用它们的组词出题；一个都不选则用默认易错词库（至少选 4 个）。</p>' +
    '<div class="charGrid" style="grid-template-columns:repeat(8,1fr)">' +
    CHARS.map(c => '<button class="charCell' + ((cdata.dictChars || []).includes(c.c) ? ' learned' : '') + '" data-dc="' + c.c + '" style="font-size:19px">' + c.c + '</button>').join('') + '</div></div>' +
    '<div class="card"><b style="font-size:19px">💾 数据管理</b>' +
    '<p class="muted" style="margin:6px 0">所有数据只保存在本设备浏览器中，清缓存会丢失！建议每周导出一次备份。</p>' +
    '<div class="row" style="flex-wrap:wrap">' +
    '<button class="btn small grn" id="btnExp">⬇️ 导出备份</button>' +
    '<button class="btn small blu" id="btnImp">⬆️ 导入备份</button>' +
    '<button class="btn small blu" id="btnPrint">🖨️ 打印错题卷</button>' +
    '<button class="btn small ghost" id="btnClr">清空本孩子数据</button>' +
    '<button class="btn small ghost" id="btnDel">删除本孩子档案</button>' +
    '<input type="file" id="impFile" accept=".json" hidden></div></div>' +
    '<button class="btn ghost block" id="btnBack">返回</button>';
  $$('[data-dc]').forEach(b => b.onclick = () => {
    cdata.dictChars = cdata.dictChars || [];
    const ch = b.dataset.dc;
    if (cdata.dictChars.includes(ch)) cdata.dictChars = cdata.dictChars.filter(x => x !== ch);
    else cdata.dictChars.push(ch);
    b.classList.toggle('learned');
    saveChild();
    toast('已选 ' + cdata.dictChars.length + ' 个字');
  });
  $('#btnPrint').onclick = printWrong;
  $('#btnExp').onclick = () => {
    const all = { version: APP_VERSION, settings, children, activeId, data: {} };
    children.forEach(k => all.data[k.id] = LS.get(K_C(k.id), {}));
    const blob = new Blob([JSON.stringify(all, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = '乐学二年级备份-' + todayStr() + '.json'; a.click();
    toast('备份已导出');
  };
  $('#btnImp').onclick = () => $('#impFile').click();
  $('#impFile').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if (!obj.children || !obj.data) throw 0;
        if (!confirm('导入会覆盖现有全部数据，确定吗？')) return;
        settings = Object.assign(settings, obj.settings || {}); saveSettings();
        children = obj.children; LS.set(K_KIDS, children);
        Object.keys(obj.data).forEach(k => LS.set(K_C(k), obj.data[k]));
        LS.set(K_ACT, obj.activeId || null);
        location.reload();
      } catch (err) { toast('文件不对哦，请选择导出的备份'); }
    };
    r.readAsText(f);
  };
  $('#btnClr').onclick = () => {
    if (!confirm('确定清空「' + child.name + '」的星星、错题等全部学习数据吗？')) return;
    cdata = newChildData(); saveChild(); toast('已清空'); render('parent');
  };
  $('#btnDel').onclick = () => parentGate(() => {
    if (!confirm('确定删除孩子档案「' + child.name + '」吗？数据将无法恢复。')) return;
    LS.del(K_C(child.id));
    children = children.filter(k => k.id !== child.id); LS.set(K_KIDS, children);
    loadChild(null); render('profiles');
  });
  $('#btnBack').onclick = () => goHome();
};

/* ---------- 设置 ---------- */
RENDER.settings = function (v) {
  const sw = (label, key, note) => '<div class="settingRow"><div><b>' + label + '</b>' +
    (note ? '<div class="muted">' + note + '</div>' : '') + '</div>' +
    '<button class="switch' + (settings[key] ? ' on' : '') + '" data-sw="' + key + '"></button></div>';
  v.innerHTML =
    '<div class="card">' + sw('🔊 语音朗读', 'tts', '朗读课文、念题、报听写') +
    sw('🎵 音效', 'sound', '答对和奖励的提示音') +
    sw('🔤 拼音显示', 'pinyin', '识字卡片、课文朗读、古诗学堂显示拼音') +
    '<div class="settingRow"><div><b>语速</b><div class="muted">稍慢更适合跟读</div></div>' +
    '<input type="range" id="rateR" min="0.7" max="1.2" step="0.05" value="' + settings.rate + '"></div>' +
    '<div class="row" style="margin-top:10px"><button class="btn small blu" id="testSay">🔊 试听一下</button></div></div>' +
    '<div class="card"><b>关于</b><p class="muted" style="margin-top:6px">乐学二年级 v' + APP_VERSION + ' · 单文件离线版<br>数学：苏教版二年级上/下册 ｜ 语文：人教版二年级上册<br>数据仅保存在本设备，可在「家长角」导出备份<br>笔顺引擎与 48 字笔画数据已内置，描红完全离线可用；字表外生字自动联网按需加载</p></div>';
  $$('[data-sw]').forEach(b => b.onclick = () => {
    settings[b.dataset.sw] = !settings[b.dataset.sw];
    b.classList.toggle('on'); saveSettings();
  });
  $('#rateR').oninput = e => { settings.rate = +e.target.value; saveSettings(); };
  $('#testSay').onclick = () => speak('你好呀！我是你的学习小伙伴，今天也要开心学习哦。');
};

/* ---------- 启动 ---------- */
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveChild(); });
(function boot() {
  window.__dataErrs = dataCheck();
  if (window.__dataErrs.length) console.warn('题库自检发现问题：', window.__dataErrs);
  try { localStorage.setItem('lx2.t', '1'); localStorage.removeItem('lx2.t'); } catch (e) {
    storageOK = false;
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99;background:#D64545;color:#fff;padding:10px 14px;font-size:15px;font-weight:700;text-align:center';
    bar.textContent = '⚠️ 当前浏览器无法保存进度（常见于无痕/隐私模式），请换正常模式打开，否则练习记录不会保留';
    document.body.appendChild(bar);
  }
  if (!children.length || !activeId || !children.find(k => k.id === activeId)) { render('profiles'); return; }
  loadChild(activeId);
  goHome();
})();
