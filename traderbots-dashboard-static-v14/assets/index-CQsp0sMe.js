(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))s(l);new MutationObserver(l=>{for(const u of l)if(u.type==="childList")for(const h of u.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&s(h)}).observe(document,{childList:!0,subtree:!0});function i(l){const u={};return l.integrity&&(u.integrity=l.integrity),l.referrerPolicy&&(u.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?u.credentials="include":l.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function s(l){if(l.ep)return;l.ep=!0;const u=i(l);fetch(l.href,u)}})();var hp={exports:{}},Zl={};var xx;function Eb(){if(xx)return Zl;xx=1;var o=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function i(s,l,u){var h=null;if(u!==void 0&&(h=""+u),l.key!==void 0&&(h=""+l.key),"key"in l){u={};for(var d in l)d!=="key"&&(u[d]=l[d])}else u=l;return l=u.ref,{$$typeof:o,type:s,key:h,ref:l!==void 0?l:null,props:u}}return Zl.Fragment=t,Zl.jsx=i,Zl.jsxs=i,Zl}var Sx;function bb(){return Sx||(Sx=1,hp.exports=Eb()),hp.exports}var z=bb(),dp={exports:{}},Te={};var yx;function Tb(){if(yx)return Te;yx=1;var o=Symbol.for("react.transitional.element"),t=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),l=Symbol.for("react.profiler"),u=Symbol.for("react.consumer"),h=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),m=Symbol.for("react.suspense"),p=Symbol.for("react.memo"),S=Symbol.for("react.lazy"),g=Symbol.for("react.activity"),_=Symbol.for("react.view_transition"),x=Symbol.iterator;function b(D){return D===null||typeof D!="object"?null:(D=x&&D[x]||D["@@iterator"],typeof D=="function"?D:null)}var A={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},y=Object.assign,M={};function N(D,$,xt){this.props=D,this.context=$,this.refs=M,this.updater=xt||A}N.prototype.isReactComponent={},N.prototype.setState=function(D,$){if(typeof D!="object"&&typeof D!="function"&&D!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,D,$,"setState")},N.prototype.forceUpdate=function(D){this.updater.enqueueForceUpdate(this,D,"forceUpdate")};function P(){}P.prototype=N.prototype;function L(D,$,xt){this.props=D,this.context=$,this.refs=M,this.updater=xt||A}var I=L.prototype=new P;I.constructor=L,y(I,N.prototype),I.isPureReactComponent=!0;var U=Array.isArray;function E(){}var C={H:null,A:null,T:null,S:null},W=Object.prototype.hasOwnProperty;function H(D,$,xt){var At=xt.ref;return{$$typeof:o,type:D,key:$,ref:At!==void 0?At:null,props:xt}}function K(D,$){return H(D.type,$,D.props)}function J(D){return typeof D=="object"&&D!==null&&D.$$typeof===o}function ut(D){var $={"=":"=0",":":"=2"};return"$"+D.replace(/[=:]/g,function(xt){return $[xt]})}var V=/\/+/g;function st(D,$){return typeof D=="object"&&D!==null&&D.key!=null?ut(""+D.key):$.toString(36)}function k(D){switch(D.status){case"fulfilled":return D.value;case"rejected":throw D.reason;default:switch(typeof D.status=="string"?D.then(E,E):(D.status="pending",D.then(function($){D.status==="pending"&&(D.status="fulfilled",D.value=$)},function($){D.status==="pending"&&(D.status="rejected",D.reason=$)})),D.status){case"fulfilled":return D.value;case"rejected":throw D.reason}}throw D}function Y(D,$,xt,At,Ct){var qt=typeof D;(qt==="undefined"||qt==="boolean")&&(D=null);var le=!1;if(D===null)le=!0;else switch(qt){case"bigint":case"string":case"number":le=!0;break;case"object":switch(D.$$typeof){case o:case t:le=!0;break;case S:return le=D._init,Y(le(D._payload),$,xt,At,Ct)}}if(le)return Ct=Ct(D),le=At===""?"."+st(D,0):At,U(Ct)?(xt="",le!=null&&(xt=le.replace(V,"$&/")+"/"),Y(Ct,$,xt,"",function(de){return de})):Ct!=null&&(J(Ct)&&(Ct=K(Ct,xt+(Ct.key==null||D&&D.key===Ct.key?"":(""+Ct.key).replace(V,"$&/")+"/")+le)),$.push(Ct)),1;le=0;var wt=At===""?".":At+":";if(U(D))for(var Wt=0;Wt<D.length;Wt++)At=D[Wt],qt=wt+st(At,Wt),le+=Y(At,$,xt,qt,Ct);else if(Wt=b(D),typeof Wt=="function")for(D=Wt.call(D),Wt=0;!(At=D.next()).done;)At=At.value,qt=wt+st(At,Wt++),le+=Y(At,$,xt,qt,Ct);else if(qt==="object"){if(typeof D.then=="function")return Y(k(D),$,xt,At,Ct);throw $=String(D),Error("Objects are not valid as a React child (found: "+($==="[object Object]"?"object with keys {"+Object.keys(D).join(", ")+"}":$)+"). If you meant to render a collection of children, use an array instead.")}return le}function dt(D,$,xt){if(D==null)return D;var At=[],Ct=0;return Y(D,At,"","",function(qt){return $.call(xt,qt,Ct++)}),At}function ot(D){if(D._status===-1){var $=D._result,xt=$();xt.then(function(At){(D._status===0||D._status===-1)&&(D._status=1,D._result=At,xt.status===void 0&&(xt.status="fulfilled",xt.value=At))},function(At){(D._status===0||D._status===-1)&&(D._status=2,D._result=At,xt.status===void 0&&(xt.status="rejected",xt.reason=At))}),D._status===-1&&(D._status=0,D._result=xt)}if(D._status===1)return D._result.default;throw D._result}var ht=typeof reportError=="function"?reportError:function(D){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var $=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof D=="object"&&D!==null&&typeof D.message=="string"?String(D.message):String(D),error:D});if(!window.dispatchEvent($))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",D);return}console.error(D)};function Tt(D){var $=C.T,xt={};xt.types=$!==null?$.types:null,C.T=xt;try{var At=D(),Ct=C.S;Ct!==null&&Ct(xt,At),typeof At=="object"&&At!==null&&typeof At.then=="function"&&At.then(E,ht)}catch(qt){ht(qt)}finally{$!==null&&xt.types!==null&&($.types=xt.types),C.T=$}}function Vt(D){var $=C.T;if($!==null){var xt=$.types;xt===null?$.types=[D]:xt.indexOf(D)===-1&&xt.push(D)}else Tt(Vt.bind(null,D))}var ae={map:dt,forEach:function(D,$,xt){dt(D,function(){$.apply(this,arguments)},xt)},count:function(D){var $=0;return dt(D,function(){$++}),$},toArray:function(D){return dt(D,function($){return $})||[]},only:function(D){if(!J(D))throw Error("React.Children.only expected to receive a single React element child.");return D}};return Te.Activity=g,Te.Children=ae,Te.Component=N,Te.Fragment=i,Te.Profiler=l,Te.PureComponent=L,Te.StrictMode=s,Te.Suspense=m,Te.ViewTransition=_,Te.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=C,Te.__COMPILER_RUNTIME={__proto__:null,c:function(D){return C.H.useMemoCache(D)}},Te.addTransitionType=Vt,Te.cache=function(D){return function(){return D.apply(null,arguments)}},Te.cacheSignal=function(){return null},Te.cloneElement=function(D,$,xt){if(D==null)throw Error("The argument must be a React element, but you passed "+D+".");var At=y({},D.props),Ct=D.key;if($!=null)for(qt in $.key!==void 0&&(Ct=""+$.key),$)!W.call($,qt)||qt==="key"||qt==="__self"||qt==="__source"||qt==="ref"&&$.ref===void 0||(At[qt]=$[qt]);var qt=arguments.length-2;if(qt===1)At.children=xt;else if(1<qt){for(var le=Array(qt),wt=0;wt<qt;wt++)le[wt]=arguments[wt+2];At.children=le}return H(D.type,Ct,At)},Te.createContext=function(D){return D={$$typeof:h,_currentValue:D,_currentValue2:D,_threadCount:0,Provider:null,Consumer:null},D.Provider=D,D.Consumer={$$typeof:u,_context:D},D},Te.createElement=function(D,$,xt){var At,Ct={},qt=null;if($!=null)for(At in $.key!==void 0&&(qt=""+$.key),$)W.call($,At)&&At!=="key"&&At!=="__self"&&At!=="__source"&&(Ct[At]=$[At]);var le=arguments.length-2;if(le===1)Ct.children=xt;else if(1<le){for(var wt=Array(le),Wt=0;Wt<le;Wt++)wt[Wt]=arguments[Wt+2];Ct.children=wt}if(D&&D.defaultProps)for(At in le=D.defaultProps,le)Ct[At]===void 0&&(Ct[At]=le[At]);return H(D,qt,Ct)},Te.createRef=function(){return{current:null}},Te.forwardRef=function(D){return{$$typeof:d,render:D}},Te.isValidElement=J,Te.lazy=function(D){return{$$typeof:S,_payload:{_status:-1,_result:D},_init:ot}},Te.memo=function(D,$){return{$$typeof:p,type:D,compare:$===void 0?null:$}},Te.startTransition=Tt,Te.unstable_useCacheRefresh=function(){return C.H.useCacheRefresh()},Te.use=function(D){return C.H.use(D)},Te.useActionState=function(D,$,xt){return C.H.useActionState(D,$,xt)},Te.useCallback=function(D,$){return C.H.useCallback(D,$)},Te.useContext=function(D){return C.H.useContext(D)},Te.useDebugValue=function(){},Te.useDeferredValue=function(D,$){return C.H.useDeferredValue(D,$)},Te.useEffect=function(D,$){return C.H.useEffect(D,$)},Te.useEffectEvent=function(D){return C.H.useEffectEvent(D)},Te.useId=function(){return C.H.useId()},Te.useImperativeHandle=function(D,$,xt){return C.H.useImperativeHandle(D,$,xt)},Te.useInsertionEffect=function(D,$){return C.H.useInsertionEffect(D,$)},Te.useLayoutEffect=function(D,$){return C.H.useLayoutEffect(D,$)},Te.useMemo=function(D,$){return C.H.useMemo(D,$)},Te.useOptimistic=function(D,$){return C.H.useOptimistic(D,$)},Te.useReducer=function(D,$,xt){return C.H.useReducer(D,$,xt)},Te.useRef=function(D){return C.H.useRef(D)},Te.useState=function(D){return C.H.useState(D)},Te.useSyncExternalStore=function(D,$,xt){return C.H.useSyncExternalStore(D,$,xt)},Te.useTransition=function(){return C.H.useTransition()},Te.version="19.3.1",Te}var Mx;function Qm(){return Mx||(Mx=1,dp.exports=Tb()),dp.exports}var fe=Qm(),pp={exports:{}},Kl={},mp={exports:{}},gp={};var Ex;function Ab(){return Ex||(Ex=1,(function(o){function t(k,Y){var dt=k.length;k.push(Y);t:for(;0<dt;){var ot=dt-1>>>1,ht=k[ot];if(0<l(ht,Y))k[ot]=Y,k[dt]=ht,dt=ot;else break t}}function i(k){return k.length===0?null:k[0]}function s(k){if(k.length===0)return null;var Y=k[0],dt=k.pop();if(dt!==Y){k[0]=dt;t:for(var ot=0,ht=k.length,Tt=ht>>>1;ot<Tt;){var Vt=2*(ot+1)-1,ae=k[Vt],D=Vt+1,$=k[D];if(0>l(ae,dt))D<ht&&0>l($,ae)?(k[ot]=$,k[D]=dt,ot=D):(k[ot]=ae,k[Vt]=dt,ot=Vt);else if(D<ht&&0>l($,dt))k[ot]=$,k[D]=dt,ot=D;else break t}}return Y}function l(k,Y){var dt=k.sortIndex-Y.sortIndex;return dt!==0?dt:k.id-Y.id}if(o.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var u=performance;o.unstable_now=function(){return u.now()}}else{var h=Date,d=h.now();o.unstable_now=function(){return h.now()-d}}var m=[],p=[],S=1,g=null,_=3,x=!1,b=!1,A=!1,y=!1,M=typeof setTimeout=="function"?setTimeout:null,N=typeof clearTimeout=="function"?clearTimeout:null,P=typeof setImmediate<"u"?setImmediate:null;function L(k){for(var Y=i(p);Y!==null;){if(Y.callback===null)s(p);else if(Y.startTime<=k)s(p),Y.sortIndex=Y.expirationTime,t(m,Y);else break;Y=i(p)}}function I(k){if(A=!1,L(k),!b)if(i(m)!==null)b=!0,U||(U=!0,J());else{var Y=i(p);Y!==null&&st(I,Y.startTime-k)}}var U=!1,E=-1,C=5,W=-1;function H(){return y?!0:!(o.unstable_now()-W<C)}function K(){if(y=!1,U){var k=o.unstable_now();W=k;var Y=!0;try{t:{b=!1,A&&(A=!1,N(E),E=-1),x=!0;var dt=_;try{e:{for(L(k),g=i(m);g!==null&&!(g.expirationTime>k&&H());){var ot=g.callback;if(typeof ot=="function"){g.callback=null,_=g.priorityLevel;var ht=ot(g.expirationTime<=k);if(k=o.unstable_now(),typeof ht=="function"){g.callback=ht,L(k),Y=!0;break e}g===i(m)&&s(m),L(k)}else s(m);g=i(m)}if(g!==null)Y=!0;else{var Tt=i(p);Tt!==null&&st(I,Tt.startTime-k),Y=!1}}break t}finally{g=null,_=dt,x=!1}Y=void 0}}finally{Y?J():U=!1}}}var J;if(typeof P=="function")J=function(){P(K)};else if(typeof MessageChannel<"u"){var ut=new MessageChannel,V=ut.port2;ut.port1.onmessage=K,J=function(){V.postMessage(null)}}else J=function(){M(K,0)};function st(k,Y){E=M(function(){k(o.unstable_now())},Y)}o.unstable_IdlePriority=5,o.unstable_ImmediatePriority=1,o.unstable_LowPriority=4,o.unstable_NormalPriority=3,o.unstable_Profiling=null,o.unstable_UserBlockingPriority=2,o.unstable_cancelCallback=function(k){k.callback=null},o.unstable_forceFrameRate=function(k){0>k||125<k?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):C=0<k?Math.floor(1e3/k):5},o.unstable_getCurrentPriorityLevel=function(){return _},o.unstable_next=function(k){switch(_){case 1:case 2:case 3:var Y=3;break;default:Y=_}var dt=_;_=Y;try{return k()}finally{_=dt}},o.unstable_requestPaint=function(){y=!0},o.unstable_runWithPriority=function(k,Y){switch(k){case 1:case 2:case 3:case 4:case 5:break;default:k=3}var dt=_;_=k;try{return Y()}finally{_=dt}},o.unstable_scheduleCallback=function(k,Y,dt){var ot=o.unstable_now();switch(typeof dt=="object"&&dt!==null?(dt=dt.delay,dt=typeof dt=="number"&&0<dt?ot+dt:ot):dt=ot,k){case 1:var ht=-1;break;case 2:ht=250;break;case 5:ht=1073741823;break;case 4:ht=1e4;break;default:ht=5e3}return ht=dt+ht,k={id:S++,callback:Y,priorityLevel:k,startTime:dt,expirationTime:ht,sortIndex:-1},dt>ot?(k.sortIndex=dt,t(p,k),i(m)===null&&k===i(p)&&(A?(N(E),E=-1):A=!0,st(I,dt-ot))):(k.sortIndex=ht,t(m,k),b||x||(b=!0,U||(U=!0,J()))),k},o.unstable_shouldYield=H,o.unstable_wrapCallback=function(k){var Y=_;return function(){var dt=_;_=Y;try{return k.apply(this,arguments)}finally{_=dt}}}})(gp)),gp}var bx;function Rb(){return bx||(bx=1,mp.exports=Ab()),mp.exports}var vp={exports:{}},hi={};var Tx;function wb(){if(Tx)return hi;Tx=1;var o=Qm();function t(S){var g="https://react.dev/errors/"+S;if(1<arguments.length){g+="?args[]="+encodeURIComponent(arguments[1]);for(var _=2;_<arguments.length;_++)g+="&args[]="+encodeURIComponent(arguments[_])}return"Minified React error #"+S+"; visit "+g+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function i(){}var s={d:{f:i,r:function(){throw Error(t(522))},D:i,C:i,L:i,m:i,X:i,S:i,M:i},p:0,findDOMNode:null},l=Symbol.for("react.portal"),u=Symbol.for("react.recoverable"),h=Symbol.for("react.optimistic_key");function d(S,g,_){var x=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:l,key:x==null?null:x===h?h:""+x,children:S,containerInfo:g,implementation:_}}var m=o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function p(S,g){if(S==="font")return"";if(typeof g=="string")return g==="use-credentials"?g:""}return hi.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=s,hi.browser=function(S){return{$$typeof:u,_reason:S}},hi.createPortal=function(S,g){var _=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!g||g.nodeType!==1&&g.nodeType!==9&&g.nodeType!==11)throw Error(t(299));return d(S,g,null,_)},hi.flushSync=function(S){var g=m.T,_=s.p;try{if(m.T=null,s.p=2,S)return S()}finally{m.T=g,s.p=_,s.d.f()}},hi.preconnect=function(S,g){typeof S=="string"&&(g?(g=g.crossOrigin,g=typeof g=="string"?g==="use-credentials"?g:"":void 0):g=null,s.d.C(S,g))},hi.prefetchDNS=function(S){typeof S=="string"&&s.d.D(S)},hi.preinit=function(S,g){if(typeof S=="string"&&g&&typeof g.as=="string"){var _=g.as,x=p(_,g.crossOrigin),b=typeof g.integrity=="string"?g.integrity:void 0,A=typeof g.fetchPriority=="string"?g.fetchPriority:void 0;_==="style"?s.d.S(S,typeof g.precedence=="string"?g.precedence:void 0,{crossOrigin:x,integrity:b,fetchPriority:A}):_==="script"&&s.d.X(S,{crossOrigin:x,integrity:b,fetchPriority:A,nonce:typeof g.nonce=="string"?g.nonce:void 0})}},hi.preinitModule=function(S,g){if(typeof S=="string")if(typeof g=="object"&&g!==null){if(g.as==null||g.as==="script"){var _=p(g.as,g.crossOrigin);s.d.M(S,{crossOrigin:_,integrity:typeof g.integrity=="string"?g.integrity:void 0,nonce:typeof g.nonce=="string"?g.nonce:void 0,fetchPriority:typeof g.fetchPriority=="string"?g.fetchPriority:void 0})}}else g==null&&s.d.M(S)},hi.preload=function(S,g){if(typeof S=="string"&&typeof g=="object"&&g!==null&&typeof g.as=="string"){var _=g.as,x=p(_,g.crossOrigin);s.d.L(S,_,{crossOrigin:x,integrity:typeof g.integrity=="string"?g.integrity:void 0,nonce:typeof g.nonce=="string"?g.nonce:void 0,type:typeof g.type=="string"?g.type:void 0,fetchPriority:typeof g.fetchPriority=="string"?g.fetchPriority:void 0,referrerPolicy:typeof g.referrerPolicy=="string"?g.referrerPolicy:void 0,imageSrcSet:typeof g.imageSrcSet=="string"?g.imageSrcSet:void 0,imageSizes:typeof g.imageSizes=="string"?g.imageSizes:void 0,media:typeof g.media=="string"?g.media:void 0})}},hi.preloadModule=function(S,g){if(typeof S=="string")if(g){var _=p(g.as,g.crossOrigin);s.d.m(S,{as:typeof g.as=="string"&&g.as!=="script"?g.as:void 0,crossOrigin:_,integrity:typeof g.integrity=="string"?g.integrity:void 0,nonce:typeof g.nonce=="string"?g.nonce:void 0,fetchPriority:typeof g.fetchPriority=="string"?g.fetchPriority:void 0})}else s.d.m(S)},hi.requestFormReset=function(S){s.d.r(S)},hi.unstable_batchedUpdates=function(S,g){return S(g)},hi.useFormState=function(S,g,_){return m.H.useFormState(S,g,_)},hi.useFormStatus=function(){return m.H.useHostTransitionStatus()},hi.version="19.3.1",hi}var Ax;function Cb(){if(Ax)return vp.exports;Ax=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(t){console.error(t)}}return o(),vp.exports=wb(),vp.exports}var Rx;function Nb(){if(Rx)return Kl;Rx=1;var o=Rb(),t=Qm(),i=Cb();function s(e){var n="https://react.dev/errors/"+e;if(1<arguments.length){n+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)n+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function l(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function u(e){for(var n=e,a=n;a&&!a.alternate;)n=a,(n.flags&4098)!==0&&(e=n.return),a=n.return;for(;n.return;)n=n.return;return n.tag===3?e:null}function h(e){if(e.tag===13){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function d(e){if(e.tag===31){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function m(e){if(u(e)!==e)throw Error(s(188))}function p(e){var n=e.alternate;if(!n){if(n=u(e),n===null)throw Error(s(188));return n!==e?null:e}for(var a=e,r=n;;){var c=a.return;if(c===null)break;var f=c.alternate;if(f===null){if(r=c.return,r!==null){a=r;continue}break}if(c.child===f.child){for(f=c.child;f;){if(f===a)return m(c),e;if(f===r)return m(c),n;f=f.sibling}throw Error(s(188))}if(a.return!==r.return)a=c,r=f;else{for(var v=!1,w=c.child;w;){if(w===a){v=!0,a=c,r=f;break}if(w===r){v=!0,r=c,a=f;break}w=w.sibling}if(!v){for(w=f.child;w;){if(w===a){v=!0,a=f,r=c;break}if(w===r){v=!0,r=f,a=c;break}w=w.sibling}if(!v)throw Error(s(189))}}if(a.alternate!==r)throw Error(s(190))}if(a.tag!==3)throw Error(s(188));return a.stateNode.current===a?e:n}function S(e){var n=e.tag;if(n===5||n===26||n===27||n===6)return e;for(e=e.child;e!==null;){if(n=S(e),n!==null)return n;e=e.sibling}return null}function g(e,n,a,r,c,f){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,r,c,f)||(e.tag!==22||e.memoizedState===null)&&(n||e.tag!==5&&e.tag!==27)&&g(e.child,n,a,r,c,f))return!0;e=e.sibling}return!1}function _(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function x(e){var n=!1;for(e=e.return;e!==null&&(e.tag===4&&(n=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return n}function b(e){var n=[null,null],a=_(e);return a===null||A(n,e,a.child,{foundSelf:!1}),n}function A(e,n,a,r){for(;a!==null;){if(a===n)r.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(r.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&A(e,n,a.child,r))return!0;a=a.sibling}return!1}function y(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(s(559))}}var M=null,N=null;function P(e,n,a){return e===a?!0:e===n?(M=e,!0):!1}function L(e,n,a){return e===a?(N=e,!1):e===n?(N!==null&&(M=e),!0):!1}function I(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function U(e,n,a){for(var r=0,c=e;c;c=a(c))r++;c=0;for(var f=n;f;f=a(f))c++;for(;0<r-c;)e=a(e),r--;for(;0<c-r;)n=a(n),c--;for(;r--;){if(e===n||n!==null&&e===n.alternate)return e;e=a(e),n=a(n)}return null}var E=Object.assign,C=Symbol.for("react.element"),W=Symbol.for("react.transitional.element"),H=Symbol.for("react.portal"),K=Symbol.for("react.fragment"),J=Symbol.for("react.strict_mode"),ut=Symbol.for("react.profiler"),V=Symbol.for("react.consumer"),st=Symbol.for("react.context"),k=Symbol.for("react.forward_ref"),Y=Symbol.for("react.suspense"),dt=Symbol.for("react.suspense_list"),ot=Symbol.for("react.memo"),ht=Symbol.for("react.lazy"),Tt=Symbol.for("react.activity"),Vt=Symbol.for("react.legacy_hidden"),ae=Symbol.for("react.memo_cache_sentinel"),D=Symbol.for("react.view_transition"),$=Symbol.for("react.recoverable"),xt=Symbol.iterator;function At(e){return e===null||typeof e!="object"?null:(e=xt&&e[xt]||e["@@iterator"],typeof e=="function"?e:null)}var Ct=Symbol.for("react.client.reference");function qt(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===Ct?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case K:return"Fragment";case ut:return"Profiler";case J:return"StrictMode";case Y:return"Suspense";case dt:return"SuspenseList";case Tt:return"Activity";case D:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case H:return"Portal";case st:return e.displayName||"Context";case V:return(e._context.displayName||"Context")+".Consumer";case k:var n=e.render;return e=e.displayName,e||(e=n.displayName||n.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case ot:return n=e.displayName||null,n!==null?n:qt(e.type)||"Memo";case ht:n=e._payload,e=e._init;try{return qt(e(n))}catch{}}return null}var le=Array.isArray,wt=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Wt=i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,de={pending:!1,data:null,method:null,action:null},Me=[],Ge=-1;function Pe(e){return{current:e}}function ze(e){0>Ge||(e.current=Me[Ge],Me[Ge]=null,Ge--)}function re(e,n){Ge++,Me[Ge]=e.current,e.current=n}var gn=Pe(null),Ne=Pe(null),vn=Pe(null),Cn=Pe(null);function An(e,n){switch(re(vn,n),re(Ne,e),re(gn,null),n.nodeType){case 9:case 11:e=(e=n.documentElement)&&(e=e.namespaceURI)?w_(e):0;break;default:if(e=n.tagName,n=n.namespaceURI)n=w_(n),e=C_(n,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}ze(gn),re(gn,e)}function j(){ze(gn),ze(Ne),ze(vn)}function _n(e){var n=e.memoizedState;n!==null&&(yo._currentValue=n.memoizedState,re(Cn,e)),n=gn.current;var a=C_(n,e.type);n!==a&&(re(Ne,e),re(gn,a))}function Ye(e){Ne.current===e&&(ze(gn),ze(Ne)),Cn.current===e&&(ze(Cn),yo._currentValue=de)}var Ue,Ht;function Be(e){if(Ue===void 0)try{throw Error()}catch(a){var n=a.stack.trim().match(/\n( *(at )?)/);Ue=n&&n[1]||"",Ht=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Ue+e+Ht}var se=!1;function ie(e,n){if(!e||se)return"";se=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(n){var Et=function(){throw Error()};if(Object.defineProperty(Et.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(Et,[])}catch(Yt){var Q=Yt}Reflect.construct(e,[],Et)}else{try{Et.call()}catch(Yt){Q=Yt}Et=!1;try{var ct=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),Et=!0,new e}finally{Et&&(ct!==void 0?Object.defineProperty(e.prototype,"props",ct):delete e.prototype.props)}}}else{try{throw Error()}catch(Yt){Q=Yt}(Et=e())&&typeof Et.catch=="function"&&Et.catch(function(){})}}catch(Yt){if(Yt&&Q&&typeof Yt.stack=="string")return[Yt.stack,Q.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var c=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,"name");c&&c.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var f=r.DetermineComponentFrameRoot(),v=f[0],w=f[1];if(v&&w){var B=v.split(`
`),et=w.split(`
`);for(c=r=0;r<B.length&&!B[r].includes("DetermineComponentFrameRoot");)r++;for(;c<et.length&&!et[c].includes("DetermineComponentFrameRoot");)c++;if(r===B.length||c===et.length)for(r=B.length-1,c=et.length-1;1<=r&&0<=c&&B[r]!==et[c];)c--;for(;1<=r&&0<=c;r--,c--)if(B[r]!==et[c]){if(r!==1||c!==1)do if(r--,c--,0>c||B[r]!==et[c]){var ft=`
`+B[r].replace(" at new "," at ");return e.displayName&&ft.includes("<anonymous>")&&(ft=ft.replace("<anonymous>",e.displayName)),ft}while(1<=r&&0<=c);break}}}finally{se=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Be(a):""}function O(e,n){switch(e.tag){case 26:case 27:case 5:return Be(e.type);case 16:return Be("Lazy");case 13:return e.child!==n&&n!==null?Be("Suspense Fallback"):Be("Suspense");case 19:return Be("SuspenseList");case 0:case 15:return ie(e.type,!1);case 11:return ie(e.type.render,!1);case 1:return ie(e.type,!0);case 31:return Be("Activity");case 30:return Be("ViewTransition");default:return""}}function R(e){try{var n="",a=null;do n+=O(e,a),a=e,e=e.return;while(e);return n}catch(r){return`
Error generating stack: `+r.message+`
`+r.stack}}var it=Object.prototype.hasOwnProperty,Nt=o.unstable_scheduleCallback,yt=o.unstable_cancelCallback,zt=o.unstable_shouldYield,Bt=o.unstable_requestPaint,mt=o.unstable_now,_t=o.unstable_getCurrentPriorityLevel,Ot=o.unstable_ImmediatePriority,F=o.unstable_UserBlockingPriority,vt=o.unstable_NormalPriority,gt=o.unstable_LowPriority,Ft=o.unstable_IdlePriority,X=o.log,pt=o.unstable_setDisableYieldValue,Rt=null,Xt=null;function bt(e){if(typeof X=="function"&&pt(e),Xt&&typeof Xt.setStrictMode=="function")try{Xt.setStrictMode(Rt,e)}catch{}}var Zt=Math.clz32?Math.clz32:Ze,oe=Math.log,Pt=Math.LN2;function Ze(e){return e>>>=0,e===0?32:31-(oe(e)/Pt|0)|0}var Lt=256,Dt=262144,ce=4194304;function be(e){var n=e&42;if(n!==0)return n;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function xe(e,n,a){var r=e.pendingLanes;if(r===0)return 0;var c=0,f=e.suspendedLanes,v=e.pingedLanes;e=e.warmLanes;var w=r&134217727;return w!==0?(r=w&~f,r!==0?c=be(r):(v&=w,v!==0?c=be(v):a||(a=w&~e,a!==0&&(c=be(a))))):(w=r&~f,w!==0?c=be(w):v!==0?c=be(v):a||(a=r&~e,a!==0&&(c=be(a)))),c===0?0:n!==0&&n!==c&&(n&f)===0&&(f=c&-c,a=n&-n,f>=a||f===32&&(a&4194048)!==0)?n:c}function pe(e,n){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&n)===0}function Re(e,n){(n&8)!==0&&(n|=n&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=n;0<a;){var r=31-Zt(a),c=1<<r;n|=e[r],a&=~c}return n}function nn(e,n){switch(e){case 1:case 2:case 4:case 8:case 64:return n+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function zn(){var e=ce;return ce<<=1,(ce&62914560)===0&&(ce=4194304),e}function St(e){for(var n=[],a=0;31>a;a++)n.push(e);return n}function jt(e,n){e.pendingLanes|=n,n!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function we(e,n,a,r,c,f){var v=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var w=e.entanglements,B=e.expirationTimes,et=e.hiddenUpdates;for(a=v&~a;0<a;){var ft=31-Zt(a),Et=1<<ft;w[ft]=0,B[ft]=-1;var Q=et[ft];if(Q!==null)for(et[ft]=null,ft=0;ft<Q.length;ft++){var ct=Q[ft];ct!==null&&(ct.lane&=-536870913)}a&=~Et}r!==0&&dn(e,r,0),f!==0&&c===0&&e.tag!==0&&(e.suspendedLanes|=f&~(v&~n))}function dn(e,n,a){e.pendingLanes|=n,e.suspendedLanes&=~n;var r=31-Zt(n);e.entangledLanes|=n,e.entanglements[r]=e.entanglements[r]|1073741824|a&261930}function ln(e,n){var a=e.entangledLanes|=n;for(e=e.entanglements;a;){var r=31-Zt(a),c=1<<r;c&n|e[r]&n&&(e[r]|=n),a&=~c}}function rn(e,n){var a=n&-n;return a=(a&42)!==0?1:Jn(a),(a&(e.suspendedLanes|n))!==0?0:a}function Jn(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Bi(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function ba(){var e=Wt.p;return e!==0?e:(e=window.event,e===void 0?32:hx(e.type))}function Fn(e,n){var a=Wt.p;try{return Wt.p=e,n()}finally{Wt.p=a}}var Ln=Math.random().toString(36).slice(2),$e="__reactFiber$"+Ln,Rn="__reactProps$"+Ln,T="__reactContainer$"+Ln,G="__reactEvents$"+Ln,lt="__reactListeners$"+Ln,nt="__reactHandles$"+Ln,at="__reactResources$"+Ln,Ut="__reactMarker$"+Ln,Qt="__reactLoad$"+Ln;function It(e){delete e[$e],delete e[Rn],delete e[lt],delete e[nt]}function Gt(e){var n;if(n=e[$e])return n;for(var a=e.parentNode;a;){if(n=a[T]||a[$e]){if(a=n.alternate,n.child!==null||a!==null&&a.child!==null)for(e=W_(e);e!==null;){if(a=e[$e])return a;e=W_(e)}return n}e=a,a=e.parentNode}return null}function Jt(e){if(e=e[$e]||e[T]){var n=e.tag;if(n===5||n===6||n===13||n===31||n===26||n===27||n===3)return e}return null}function me(e){var n=e.tag;if(n===5||n===26||n===27||n===6)return e.stateNode;throw Error(s(33))}function Ee(e){var n=e[at];return n||(n=e[at]={hoistableStyles:new Map,hoistableScripts:new Map}),n}function kt(e){e[Ut]=!0}function Se(e){e[Qt]=void 0}var yn=new Set,Ve={};function Fe(e,n){bn(e,n),bn(e+"Capture",n)}function bn(e,n){for(Ve[e]=n,e=0;e<n.length;e++)yn.add(n[e])}var ee=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Un={},Xe={};function Qi(e){return it.call(Xe,e)?!0:it.call(Un,e)?!1:ee.test(e)?Xe[e]=!0:(Un[e]=!0,!1)}var ge=!1;function Ta(){var e=ge;return ge=!1,e}function $n(e,n,a){if(Qi(n))if(a===null)e.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(n);return;case"boolean":var r=n.toLowerCase().slice(0,5);if(r!=="data-"&&r!=="aria-"){e.removeAttribute(n);return}}e.setAttribute(n,a)}}function wi(e,n,a){if(a===null)e.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttribute(n,a)}}function ye(e,n,a,r){if(r===null)e.removeAttribute(a);else{switch(typeof r){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(n,a,r)}}function tn(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Hn(e){var n=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function pn(e,n,a){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,n);if(!e.hasOwnProperty(n)&&typeof r<"u"&&typeof r.get=="function"&&typeof r.set=="function"){var c=r.get,f=r.set;return Object.defineProperty(e,n,{configurable:!0,get:function(){return c.call(this)},set:function(v){a=""+v,f.call(this,v)}}),Object.defineProperty(e,n,{enumerable:r.enumerable}),{getValue:function(){return a},setValue:function(v){a=""+v},stopTracking:function(){e._valueTracker=null,delete e[n]}}}}function xn(e){if(!e._valueTracker){var n=Hn(e)?"checked":"value";e._valueTracker=pn(e,n,""+e[n])}}function ri(e){if(!e)return!1;var n=e._valueTracker;if(!n)return!0;var a=n.getValue(),r="";return e&&(r=Hn(e)?e.checked?"true":"false":e.value),e=r,e!==a?(n.setValue(e),!0):!1}var gs=/[\n"\\]/g;function Ci(e){return e.replace(gs,function(n){return"\\"+n.charCodeAt(0).toString(16)+" "})}function nl(e,n,a,r,c,f,v,w){e.name="",v!=null&&typeof v!="function"&&typeof v!="symbol"&&typeof v!="boolean"?e.type=v:e.removeAttribute("type"),n!=null?v==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+tn(n)):e.value!==""+tn(n)&&(e.value=""+tn(n)):v!=="submit"&&v!=="reset"||e.removeAttribute("value"),n!=null?v==="number"&&e.value==n?al(e,tn(e.value)):al(e,tn(n)):a!=null?al(e,tn(a)):r!=null&&e.removeAttribute("value"),c==null&&f!=null&&(e.defaultChecked=!!f),c!=null&&(e.checked=c&&typeof c!="function"&&typeof c!="symbol"),w!=null&&typeof w!="function"&&typeof w!="symbol"&&typeof w!="boolean"?e.name=""+tn(w):e.removeAttribute("name")}function il(e,n,a,r,c,f,v,w){if(f!=null&&typeof f!="function"&&typeof f!="symbol"&&typeof f!="boolean"&&(e.type=f),n!=null||a!=null){if(!(f!=="submit"&&f!=="reset"||n!=null)){xn(e);return}a=a!=null?""+tn(a):"",n=n!=null?""+tn(n):a,w||n===e.value||(e.value=n),e.defaultValue=n}r=r??c,r=typeof r!="function"&&typeof r!="symbol"&&!!r,e.checked=w?e.checked:!!r,e.defaultChecked=!!r,v!=null&&typeof v!="function"&&typeof v!="symbol"&&typeof v!="boolean"&&(e.name=v),xn(e)}function al(e,n){e.defaultValue!==""+n&&(e.defaultValue=""+n)}function ka(e,n,a,r){if(e=e.options,n){n={};for(var c=0;c<a.length;c++)n["$"+a[c]]=!0;for(a=0;a<e.length;a++)c=n.hasOwnProperty("$"+e[a].value),e[a].selected!==c&&(e[a].selected=c),c&&r&&(e[a].defaultSelected=!0)}else{for(a=""+tn(a),n=null,c=0;c<e.length;c++){if(e[c].value===a){e[c].selected=!0,r&&(e[c].defaultSelected=!0);return}n!==null||e[c].disabled||(n=e[c])}n!==null&&(n.selected=!0)}}function vs(e,n,a){if(n!=null&&(n=""+tn(n),n!==e.value&&(e.value=n),a==null)){e.defaultValue!==n&&(e.defaultValue=n);return}e.defaultValue=a!=null?""+tn(a):""}function sl(e,n,a,r){if(n==null){if(r!=null){if(a!=null)throw Error(s(92));if(le(r)){if(1<r.length)throw Error(s(93));r=r[0]}a=r}a==null&&(a=""),n=a}a=tn(n),e.defaultValue=a,r=e.textContent,r===a&&r!==""&&r!==null&&(e.value=r),xn(e)}function Tn(e,n){if(n){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=n;return}}e.textContent=n}var ti=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function ua(e,n,a){var r=n.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?r?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="":r?e.setProperty(n,a):typeof a!="number"||a===0||ti.has(n)?n==="float"?e.cssFloat=a:e[n]=(""+a).trim():e[n]=a+"px"}function Ir(e,n,a){if(n!=null&&typeof n!="object")throw Error(s(62));if(e=e.style,a!=null){for(var r in a)!a.hasOwnProperty(r)||n!=null&&n.hasOwnProperty(r)||(r.indexOf("--")===0?e.setProperty(r,""):r==="float"?e.cssFloat="":e[r]="",ge=!0);for(var c in n)r=n[c],n.hasOwnProperty(c)&&a[c]!==r&&(ua(e,c,r),ge=!0)}else for(var f in n)n.hasOwnProperty(f)&&ua(e,f,n[f])}function zr(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Br=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Fr=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Tc(e){return Fr.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Aa(){}var Wf=null;function Yf(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Hr=null,Gr=null;function M0(e){var n=Jt(e);if(n&&(e=n.stateNode)){var a=e[Rn]||null;t:switch(e=n.stateNode,n.type){case"input":if(nl(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),n=a.name,a.type==="radio"&&n!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Ci(""+n)+'"][type="radio"]'),n=0;n<a.length;n++){var r=a[n];if(r!==e&&r.form===e.form){var c=r[Rn]||null;if(!c)throw Error(s(90));nl(r,c.value,c.defaultValue,c.defaultValue,c.checked,c.defaultChecked,c.type,c.name)}}for(n=0;n<a.length;n++)r=a[n],r.form===e.form&&ri(r)}break t;case"textarea":vs(e,a.value,a.defaultValue);break t;case"select":n=a.value,n!=null&&ka(e,!!a.multiple,n,!1)}}}var Zf=!1;function E0(e,n,a){if(Zf)return e(n,a);Zf=!0;try{var r=e(n);return r}finally{if(Zf=!1,(Hr!==null||Gr!==null)&&(Tu(),Hr&&(n=Hr,e=Gr,Gr=Hr=null,M0(n),e)))for(n=0;n<e.length;n++)M0(e[n])}}function rl(e,n){var a=e.stateNode;if(a===null)return null;var r=a[Rn]||null;if(r===null)return null;a=r[n];t:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break t;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(s(231,n,typeof a));return a}var qa=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Kf=!1;if(qa)try{var ol={};Object.defineProperty(ol,"passive",{get:function(){Kf=!0}}),window.addEventListener("test",ol,ol),window.removeEventListener("test",ol,ol)}catch{Kf=!1}var _s=null,jf=null,Ac=null;function b0(){if(Ac)return Ac;var e,n=jf,a=n.length,r,c="value"in _s?_s.value:_s.textContent,f=c.length;for(e=0;e<a&&n[e]===c[e];e++);var v=a-e;for(r=1;r<=v&&n[a-r]===c[f-r];r++);return Ac=c.slice(e,1<r?1-r:void 0)}function Rc(e){var n=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&n===13&&(e=13)):e=n,e===10&&(e=13),32<=e||e===13?e:0}function wc(){return!0}function T0(){return!1}function xi(e){function n(a,r,c,f,v){this._reactName=a,this._targetInst=c,this.type=r,this.nativeEvent=f,this.target=v,this.currentTarget=null;for(var w in e)e.hasOwnProperty(w)&&(a=e[w],this[w]=a?a(f):f[w]);return this.isDefaultPrevented=(f.defaultPrevented!=null?f.defaultPrevented:f.returnValue===!1)?wc:T0,this.isPropagationStopped=T0,this}return E(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=wc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=wc)},persist:function(){},isPersistent:wc}),n}var xs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Cc=xi(xs),ll=E({},xs,{view:0,detail:0}),Zy=xi(ll),Qf,Jf,cl,Nc=E({},ll,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:th,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==cl&&(cl&&e.type==="mousemove"?(Qf=e.screenX-cl.screenX,Jf=e.screenY-cl.screenY):Jf=Qf=0,cl=e),Qf)},movementY:function(e){return"movementY"in e?e.movementY:Jf}}),A0=xi(Nc),Ky=E({},Nc,{dataTransfer:0}),jy=xi(Ky),Qy=E({},ll,{relatedTarget:0}),$f=xi(Qy),Jy=E({},xs,{animationName:0,elapsedTime:0,pseudoElement:0}),$y=xi(Jy),tM=E({},xs,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),eM=xi(tM),nM=E({},xs,{data:0}),R0=xi(nM),iM={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},aM={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},sM={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function rM(e){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(e):(e=sM[e])?!!n[e]:!1}function th(){return rM}var oM=E({},ll,{key:function(e){if(e.key){var n=iM[e.key]||e.key;if(n!=="Unidentified")return n}return e.type==="keypress"?(e=Rc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?aM[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:th,charCode:function(e){return e.type==="keypress"?Rc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Rc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),lM=xi(oM),cM=E({},Nc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),w0=xi(cM),uM=E({},xs,{submitter:0}),fM=xi(uM),hM=E({},ll,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:th}),dM=xi(hM),pM=E({},xs,{propertyName:0,elapsedTime:0,pseudoElement:0}),mM=xi(pM),gM=E({},Nc,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),vM=xi(gM),_M=E({},xs,{newState:0,oldState:0,source:0}),xM=xi(_M),SM=[9,13,27,32],eh=qa&&"CompositionEvent"in window,ul=null;qa&&"documentMode"in document&&(ul=document.documentMode);var yM=qa&&"TextEvent"in window&&!ul,C0=qa&&(!eh||ul&&8<ul&&11>=ul),N0=" ",D0=!1;function L0(e,n){switch(e){case"keyup":return SM.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function U0(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Vr=!1;function MM(e,n){switch(e){case"compositionend":return U0(n);case"keypress":return n.which!==32?null:(D0=!0,N0);case"textInput":return e=n.data,e===N0&&D0?null:e;default:return null}}function EM(e,n){if(Vr)return e==="compositionend"||!eh&&L0(e,n)?(e=b0(),Ac=jf=_s=null,Vr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return C0&&n.locale!=="ko"?null:n.data;default:return null}}var bM={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function O0(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n==="input"?!!bM[e.type]:n==="textarea"}function P0(e,n,a,r){Hr?Gr?Gr.push(r):Gr=[r]:Hr=r,n=Du(n,"onChange"),0<n.length&&(a=new Cc("onChange","change",null,a,r),e.push({event:a,listeners:n}))}var fl=null,hl=null;function TM(e){M_(e,0)}function Dc(e){var n=me(e);if(ri(n))return e}function I0(e,n){if(e==="change")return n}var z0=!1;if(qa){var nh;if(qa){var ih="oninput"in document;if(!ih){var B0=document.createElement("div");B0.setAttribute("oninput","return;"),ih=typeof B0.oninput=="function"}nh=ih}else nh=!1;z0=nh&&(!document.documentMode||9<document.documentMode)}function F0(){fl&&(fl.detachEvent("onpropertychange",H0),hl=fl=null)}function H0(e){if(e.propertyName==="value"&&Dc(hl)){var n=[];P0(n,hl,e,Yf(e)),E0(TM,n)}}function AM(e,n,a){e==="focusin"?(F0(),fl=n,hl=a,fl.attachEvent("onpropertychange",H0)):e==="focusout"&&F0()}function RM(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Dc(hl)}function wM(e,n){if(e==="click")return Dc(n)}function CM(e,n){if(e==="input"||e==="change")return Dc(n)}function NM(e,n){return e===n&&(e!==0||1/e===1/n)||e!==e&&n!==n}var Fi=typeof Object.is=="function"?Object.is:NM;function dl(e,n){if(Fi(e,n))return!0;if(typeof e!="object"||e===null||typeof n!="object"||n===null)return!1;var a=Object.keys(e),r=Object.keys(n);if(a.length!==r.length)return!1;for(r=0;r<a.length;r++){var c=a[r];if(!it.call(n,c)||!Fi(e[c],n[c]))return!1}return!0}function ah(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function G0(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function V0(e,n){var a=G0(e);e=0;for(var r;a;){if(a.nodeType===3){if(r=e+a.textContent.length,e<=n&&r>=n)return{node:a,offset:n-e};e=r}t:{for(;a;){if(a.nextSibling){a=a.nextSibling;break t}a=a.parentNode}a=void 0}a=G0(a)}}function X0(e,n){return e&&n?e===n?!0:e&&e.nodeType===3?!1:n&&n.nodeType===3?X0(e,n.parentNode):"contains"in e?e.contains(n):e.compareDocumentPosition?!!(e.compareDocumentPosition(n)&16):!1:!1}function k0(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var n=ah(e.document);n instanceof e.HTMLIFrameElement;){try{var a=typeof n.contentWindow.location.href=="string"}catch{a=!1}if(a)e=n.contentWindow;else break;n=ah(e.document)}return n}function sh(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n&&(n==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||n==="textarea"||e.contentEditable==="true")}var DM=qa&&"documentMode"in document&&11>=document.documentMode,Xr=null,rh=null,pl=null,oh=!1;function q0(e,n,a){var r=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;oh||Xr==null||Xr!==ah(r)||(r=Xr,"selectionStart"in r&&sh(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),pl&&dl(pl,r)||(pl=r,r=Du(rh,"onSelect"),0<r.length&&(n=new Cc("onSelect","select",null,n,a),e.push({event:n,listeners:r}),n.target=Xr)))}function ar(e,n){var a={};return a[e.toLowerCase()]=n.toLowerCase(),a["Webkit"+e]="webkit"+n,a["Moz"+e]="moz"+n,a}var kr={animationend:ar("Animation","AnimationEnd"),animationiteration:ar("Animation","AnimationIteration"),animationstart:ar("Animation","AnimationStart"),transitionrun:ar("Transition","TransitionRun"),transitionstart:ar("Transition","TransitionStart"),transitioncancel:ar("Transition","TransitionCancel"),transitionend:ar("Transition","TransitionEnd")},lh={},W0={};qa&&(W0=document.createElement("div").style,"AnimationEvent"in window||(delete kr.animationend.animation,delete kr.animationiteration.animation,delete kr.animationstart.animation),"TransitionEvent"in window||delete kr.transitionend.transition);function sr(e){if(lh[e])return lh[e];if(!kr[e])return e;var n=kr[e],a;for(a in n)if(n.hasOwnProperty(a)&&a in W0)return lh[e]=n[a];return e}var Y0=sr("animationend"),Z0=sr("animationiteration"),K0=sr("animationstart"),LM=sr("transitionrun"),UM=sr("transitionstart"),OM=sr("transitioncancel"),j0=sr("transitionend"),Q0=new Map,ch="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");ch.push("scrollEnd");function fa(e,n){Q0.set(e,n),Fe(n,[e])}var PM=0;function Wa(e,n){if(e.name!=null&&e.name!=="auto")return e.name;if(n.autoName!==null)return n.autoName;e=ma.identifierPrefix;var a=PM++;return e="_"+e+"t_"+a.toString(32)+"_",n.autoName=e}function J0(e){if(e==null||typeof e=="string")return e;var n=null,a=uo;if(a!==null)for(var r=0;r<a.length;r++){var c=e[a[r]];if(c!=null){if(c==="none")return"none";n=n==null?c:n+(" "+c)}}return n??e.default}function Ya(e,n){return e=J0(e),n=J0(n),n==null?e==="auto"?null:e:n==="auto"?null:n}var Lc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var n=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(n))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},Ji=[],qr=0,uh=0;function Uc(){for(var e=qr,n=uh=qr=0;n<e;){var a=Ji[n];Ji[n++]=null;var r=Ji[n];Ji[n++]=null;var c=Ji[n];Ji[n++]=null;var f=Ji[n];if(Ji[n++]=null,r!==null&&c!==null){var v=r.pending;v===null?c.next=c:(c.next=v.next,v.next=c),r.pending=c}f!==0&&$0(a,c,f)}}function Oc(e,n,a,r){Ji[qr++]=e,Ji[qr++]=n,Ji[qr++]=a,Ji[qr++]=r,uh|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function fh(e,n,a,r){return Oc(e,n,a,r),Pc(e)}function rr(e,n){return Oc(e,null,null,n),Pc(e)}function $0(e,n,a){e.lanes|=a;var r=e.alternate;r!==null&&(r.lanes|=a);for(var c=!1,f=e.return;f!==null;)f.childLanes|=a,r=f.alternate,r!==null&&(r.childLanes|=a),f.tag===22&&(e=f.stateNode,e===null||e._visibility&1||(c=!0)),e=f,f=f.return;return e.tag===3?(f=e.stateNode,c&&n!==null&&(c=31-Zt(a),e=f.hiddenUpdates,r=e[c],r===null?e[c]=[n]:r.push(n),n.lane=a|536870912),f):null}function Pc(e){if(50<Il)throw Il=0,bu=null,Error(s(185));for(var n=e.return;n!==null;)e=n,n=e.return;return e.tag===3?e.stateNode:null}var Wr={};function IM(e,n,a,r){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ni(e,n,a,r){return new IM(e,n,a,r)}function hh(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Za(e,n){var a=e.alternate;return a===null?(a=Ni(e.tag,n,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=n,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,n=e.dependencies,a.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function tg(e,n){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=n,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,n=a.dependencies,e.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),e}function Ic(e,n,a,r,c,f){var v=0;if(r=e,typeof r=="function")hh(r)&&(v=1);else if(typeof r=="string")v=ub(e,a,gn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(r){case Tt:return e=Ni(31,a,n,c),e.elementType=Tt,e.lanes=f,e;case K:return or(a.children,c,f,n);case J:v=8,c|=24;break;case ut:return e=Ni(12,a,n,c|2),e.elementType=ut,e.lanes=f,e;case Y:return e=Ni(13,a,n,c),e.elementType=Y,e.lanes=f,e;case dt:return e=Ni(19,a,n,c),e.elementType=dt,e.lanes=f,e;case Vt:case D:return e=c|32,e=Ni(30,a,n,e),e.elementType=D,e.lanes=f,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof r=="object"&&r!==null)switch(r.$$typeof){case st:v=10;break t;case V:v=9;break t;case k:v=11;break t;case ot:v=14;break t;case ht:v=16,r=null;break t}v=29,a=Error(s(130,e===null?"null":typeof e,"")),r=null}return n=Ni(v,a,n,c),n.elementType=e,n.type=r,n.lanes=f,n}function or(e,n,a,r){return e=Ni(7,e,r,n),e.lanes=a,e}function dh(e,n,a){return e=Ni(6,e,null,n),e.lanes=a,e}function eg(e){var n=Ni(18,null,null,0);return n.stateNode=e,n}function ph(e,n,a){return n=Ni(4,e.children!==null?e.children:[],e.key,n),n.lanes=a,n.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},n}var ng=new WeakMap;function $i(e,n){if(typeof e=="object"&&e!==null){var a=ng.get(e);return a!==void 0?a:(n={value:e,source:n,stack:R(n)},ng.set(e,n),n)}return{value:e,source:n,stack:R(n)}}var Yr=[],Zr=0,zc=null,ml=0,ta=[],ea=0,Ss=null,Ra=1,wa="";function Ka(e,n){Yr[Zr++]=ml,Yr[Zr++]=zc,zc=e,ml=n}function ig(e,n,a){ta[ea++]=Ra,ta[ea++]=wa,ta[ea++]=Ss,Ss=e;var r=Ra;e=wa;var c=32-Zt(r)-1;r&=~(1<<c),a+=1;var f=32-Zt(n)+c;if(30<f){var v=c-c%5;f=(r&(1<<v)-1).toString(32),r>>=v,c-=v,Ra=1<<32-Zt(n)+c|a<<c|r,wa=f+e}else Ra=1<<f|a<<c|r,wa=e}function Bc(e){e.return!==null&&(Ka(e,1),ig(e,1,0))}function mh(e){for(;e===zc;)zc=Yr[--Zr],Yr[Zr]=null,ml=Yr[--Zr],Yr[Zr]=null;for(;e===Ss;)Ss=ta[--ea],ta[ea]=null,wa=ta[--ea],ta[ea]=null,Ra=ta[--ea],ta[ea]=null}function ag(e,n){ta[ea++]=Ra,ta[ea++]=wa,ta[ea++]=Ss,Ra=n.id,wa=n.overflow,Ss=e}var ei=null,Mn=null,Ie=!1,ys=null,na=!1,gh=Error(s(519));function Ms(e){var n=Error(s(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw gl($i(n,e)),gh}function sg(e){var n=e.stateNode,a=e.type,r=e.memoizedProps;switch(n[$e]=e,n[Rn]=r,a){case"dialog":qe("cancel",n),qe("close",n);break;case"iframe":case"object":case"embed":qe("load",n);break;case"video":case"audio":for(a=0;a<Bl.length;a++)qe(Bl[a],n);break;case"source":qe("error",n);break;case"img":case"image":case"link":qe("error",n),qe("load",n);break;case"details":qe("toggle",n);break;case"input":qe("invalid",n),il(n,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case"select":qe("invalid",n);break;case"textarea":qe("invalid",n),sl(n,r.value,r.defaultValue,r.children)}a=r.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||n.textContent===""+a||r.suppressHydrationWarning===!0||A_(n.textContent,a)?(r.popover!=null&&(qe("beforetoggle",n),qe("toggle",n)),r.onScroll!=null&&qe("scroll",n),r.onScrollEnd!=null&&qe("scrollend",n),r.onClick!=null&&(n.onclick=Aa),n=!0):n=!1,n||Ms(e,!0)}function Fc(e){for(ei=e.return;ei;)switch(ei.tag){case 5:case 31:case 13:na=!1;return;case 27:case 3:na=!0;return;default:ei=ei.return}}function Kr(e){if(e!==ei)return!1;if(!Ie)return Fc(e),Ie=!0,!1;var n=e.tag,a;if((a=n!==3&&n!==27)&&((a=n===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Wd(e.type,e.memoizedProps)),a=!a),a&&Mn&&Ms(e),Fc(e),n===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(317));Mn=q_(e)}else if(n===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(317));Mn=q_(e)}else n===27?(n=Mn,Bs(e.type)?(e=ep,ep=null,Mn=e):Mn=n):Mn=ei?aa(e.stateNode.nextSibling):null;return!0}function lr(){Mn=ei=null,Ie=!1}function vh(){var e=ys;return e!==null&&(Ui===null?Ui=e:Ui.push.apply(Ui,e),ys=null),e}function gl(e){ys===null?ys=[e]:ys.push(e)}var _h=Pe(null),cr=null,ja=null;function Es(e,n,a){re(_h,n._currentValue),n._currentValue=a}function Qa(e){e._currentValue=_h.current,ze(_h)}function Hc(e,n,a){for(;e!==null;){var r=e.alternate;if((e.childLanes&n)!==n?(e.childLanes|=n,r!==null&&(r.childLanes|=n)):r!==null&&(r.childLanes&n)!==n&&(r.childLanes|=n),e===a)break;e=e.return}}function xh(e,n,a,r){var c=e.child;for(c!==null&&(c.return=e);c!==null;){var f=c.dependencies;if(f!==null){var v=c.child;f=f.firstContext;t:for(;f!==null;){var w=f;f=c;for(var B=0;B<n.length;B++)if(w.context===n[B]){f.lanes|=a,w=f.alternate,w!==null&&(w.lanes|=a),Hc(f.return,a,e),r||(v=null);break t}f=w.next}}else if(c.tag===18){if(v=c.return,v===null)throw Error(s(341));v.lanes|=a,f=v.alternate,f!==null&&(f.lanes|=a),Hc(v,a,e),v=null}else c.tag===13&&c.memoizedState!==null&&c.memoizedState.dehydrated===null?(c.lanes|=a,v=c.alternate,v!==null&&(v.lanes|=a),Hc(c.return,a,e),v=c.child,v=v!==null?v.sibling:null):v=c.child;if(v!==null)v.return=c;else for(v=c;v!==null;){if(v===e){v=null;break}if(c=v.sibling,c!==null){c.return=v.return,v=c;break}v=v.return}c=v}}function ur(e,n,a,r){e=null;for(var c=n,f=!1;c!==null;){if(!f){if((c.flags&524288)!==0)f=!0;else if((c.flags&262144)!==0)break}if(c.tag===10){var v=c.alternate;if(v===null)throw Error(s(387));if(v=v.memoizedProps,v!==null){var w=c.type;Fi(c.pendingProps.value,v.value)||(e!==null?e.push(w):e=[w])}}else if(c===Cn.current){if(v=c.alternate,v===null)throw Error(s(387));v.memoizedState.memoizedState!==c.memoizedState.memoizedState&&(e!==null?e.push(yo):e=[yo])}c=c.return}return e!==null&&xh(n,e,a,r),n.flags|=262144,e!==null}function Gc(e){for(e=e.firstContext;e!==null;){if(!Fi(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function fr(e){cr=e,ja=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function oi(e){return rg(cr,e)}function Vc(e,n){return cr===null&&fr(e),rg(e,n)}function rg(e,n){var a=n._currentValue;if(n={context:n,memoizedValue:a,next:null},ja===null){if(e===null)throw Error(s(308));ja=n,e.dependencies={lanes:0,firstContext:n},e.flags|=524288}else ja=ja.next=n;return a}var zM=typeof AbortController<"u"?AbortController:function(){var e=[],n=this.signal={aborted:!1,addEventListener:function(a,r){e.push(r)}};this.abort=function(){n.aborted=!0,e.forEach(function(a){return a()})}},BM=o.unstable_scheduleCallback,FM=o.unstable_NormalPriority,Gn={$$typeof:st,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Sh(){return{controller:new zM,data:new Map,refCount:0}}function vl(e){e.refCount--,e.refCount===0&&BM(FM,function(){e.controller.abort()})}function og(e,n){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<n.length;e++){var r=n[e];a.indexOf(r)===-1&&a.push(r)}}}var _l=null;function HM(e){var n=e.transitionTypes;return e.transitionTypes=null,n}var xl=null,yh=0,hr=0,jr=null;function GM(e,n){if(xl===null){var a=xl=[];yh=0,hr=zd(),jr={status:"pending",value:void 0,then:function(r){a.push(r)}}}return yh++,n.then(lg,lg),n}function lg(){if(--yh===0&&(_l=null,xl!==null)){jr!==null&&(jr.status="fulfilled");var e=xl;xl=null,hr=0,jr=null;for(var n=0;n<e.length;n++)(0,e[n])()}}function VM(e,n){var a=[],r={status:"pending",value:null,reason:null,then:function(c){a.push(c)}};return e.then(function(){r.status="fulfilled",r.value=n;for(var c=0;c<a.length;c++)(0,a[c])(n)},function(c){for(r.status="rejected",r.reason=c,c=0;c<a.length;c++)(0,a[c])(void 0)}),r}var cg=wt.S;wt.S=function(e,n){if(e_=mt(),typeof n=="object"&&n!==null&&typeof n.then=="function"&&GM(e,n),_l!==null)for(var a=mo;a!==null;)og(a,_l),a=a.next;if(a=e.types,a!==null){for(var r=mo;r!==null;)og(r,a),r=r.next;if(hr!==0){r=_l,r===null&&(r=_l=[]);for(var c=0;c<a.length;c++){var f=a[c];r.indexOf(f)===-1&&r.push(f)}}}cg!==null&&cg(e,n)};var dr=Pe(null);function Mh(){var e=dr.current;return e!==null?e:Sn.pooledCache}function Xc(e,n){n===null?re(dr,dr.current):re(dr,n.pool)}function ug(){var e=Mh();return e===null?null:{parent:Gn._currentValue,pool:e}}var Qr=Error(s(460)),Eh=Error(s(474)),kc=Error(s(542)),qc={then:function(){}};function fg(e){return e=e.status,e==="fulfilled"||e==="rejected"}function hg(e,n,a){switch(a=e[a],a===void 0?e.push(n):a!==n&&(n.then(Aa,Aa),n=a),n.status){case"fulfilled":return n.value;case"rejected":throw e=n.reason,pg(e),e===void 0&&!("reason"in n)?Error(s(600)):e;default:if(typeof n.status=="string")n.then(Aa,Aa);else{if(e=Sn,e!==null&&100<e.shellSuspendCounter)throw Error(s(482));e=n,e.status="pending",e.then(function(r){if(n.status==="pending"){var c=n;c.status="fulfilled",c.value=r}},function(r){if(n.status==="pending"){var c=n;c.status="rejected",c.reason=r}})}switch(n.status){case"fulfilled":return n.value;case"rejected":throw e=n.reason,pg(e),e}throw mr=n,Qr}}function pr(e){try{var n=e._init;return n(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(mr=a,Qr):a}}var mr=null;function dg(){if(mr===null)throw Error(s(459));var e=mr;return mr=null,e}function pg(e){if(e===Qr||e===kc)throw Error(s(483))}var Jr=null,Sl=0;function Wc(e){var n=Sl;return Sl+=1,Jr===null&&(Jr=[]),hg(Jr,e,n)}function bs(e,n){n=n.props.ref,e.ref=n!==void 0?n:null}function Yc(e,n){throw n.$$typeof===C?Error(s(525)):(e=Object.prototype.toString.call(n),Error(s(31,e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e)))}function mg(e){function n(tt,q){if(e){var rt=tt.deletions;rt===null?(tt.deletions=[q],tt.flags|=16):rt.push(q)}}function a(tt,q){if(!e)return null;for(;q!==null;)n(tt,q),q=q.sibling;return null}function r(tt){for(var q=new Map;tt!==null;)tt.key===null?q.set(tt.index,tt):q.set(tt.key,tt),tt=tt.sibling;return q}function c(tt,q){return tt=Za(tt,q),tt.index=0,tt.sibling=null,tt}function f(tt,q,rt){return tt.index=rt,e?(rt=tt.alternate,rt!==null?(rt=rt.index,rt<q?(tt.flags|=2,q):rt):(tt.flags|=134217730,q)):(tt.flags|=1048576,q)}function v(tt){return e&&tt.alternate===null&&(tt.flags|=134217730),tt}function w(tt,q,rt,Mt){return q===null||q.tag!==6?(q=dh(rt,tt.mode,Mt),q.return=tt,q):(q=c(q,rt),q.return=tt,q)}function B(tt,q,rt,Mt){var $t=rt.type;return $t===K?(tt=ft(tt,q,rt.props.children,Mt,rt.key),bs(tt,rt),tt):q!==null&&(q.elementType===$t||typeof $t=="object"&&$t!==null&&$t.$$typeof===ht&&pr($t)===q.type)?(q=c(q,rt.props),bs(q,rt),q.return=tt,q):(q=Ic(rt.type,rt.key,rt.props,null,tt.mode,Mt),bs(q,rt),q.return=tt,q)}function et(tt,q,rt,Mt){return q===null||q.tag!==4||q.stateNode.containerInfo!==rt.containerInfo||q.stateNode.implementation!==rt.implementation?(q=ph(rt,tt.mode,Mt),q.return=tt,q):(q=c(q,rt.children||[]),q.return=tt,q)}function ft(tt,q,rt,Mt,$t){return q===null||q.tag!==7?(q=or(rt,tt.mode,Mt,$t),q.return=tt,q):(q=c(q,rt),q.return=tt,q)}function Et(tt,q,rt){if(typeof q=="string"&&q!==""||typeof q=="number"||typeof q=="bigint")return q=dh(""+q,tt.mode,rt),q.return=tt,q;if(typeof q=="object"&&q!==null){switch(q.$$typeof){case W:return rt=Ic(q.type,q.key,q.props,null,tt.mode,rt),bs(rt,q),rt.return=tt,rt;case H:return q=ph(q,tt.mode,rt),q.return=tt,q;case ht:return q=pr(q),Et(tt,q,rt)}if(le(q)||At(q))return q=or(q,tt.mode,rt,null),q.return=tt,q;if(typeof q.then=="function")return Et(tt,Wc(q),rt);if(q.$$typeof===st)return Et(tt,Vc(tt,q),rt);Yc(tt,q)}return null}function Q(tt,q,rt,Mt){var $t=q!==null?q.key:null;if(typeof rt=="string"&&rt!==""||typeof rt=="number"||typeof rt=="bigint")return $t!==null?null:w(tt,q,""+rt,Mt);if(typeof rt=="object"&&rt!==null){switch(rt.$$typeof){case W:return rt.key===$t?B(tt,q,rt,Mt):null;case H:return rt.key===$t?et(tt,q,rt,Mt):null;case ht:return rt=pr(rt),Q(tt,q,rt,Mt)}if(le(rt)||At(rt))return $t!==null?null:ft(tt,q,rt,Mt,null);if(typeof rt.then=="function")return Q(tt,q,Wc(rt),Mt);if(rt.$$typeof===st)return Q(tt,q,Vc(tt,rt),Mt);Yc(tt,rt)}return null}function ct(tt,q,rt,Mt,$t){if(typeof Mt=="string"&&Mt!==""||typeof Mt=="number"||typeof Mt=="bigint")return tt=tt.get(rt)||null,w(q,tt,""+Mt,$t);if(typeof Mt=="object"&&Mt!==null){switch(Mt.$$typeof){case W:return tt=tt.get(Mt.key===null?rt:Mt.key)||null,B(q,tt,Mt,$t);case H:return tt=tt.get(Mt.key===null?rt:Mt.key)||null,et(q,tt,Mt,$t);case ht:return Mt=pr(Mt),ct(tt,q,rt,Mt,$t)}if(le(Mt)||At(Mt))return tt=tt.get(rt)||null,ft(q,tt,Mt,$t,null);if(typeof Mt.then=="function")return ct(tt,q,rt,Wc(Mt),$t);if(Mt.$$typeof===st)return ct(tt,q,rt,Vc(q,Mt),$t);Yc(q,Mt)}return null}function Yt(tt,q,rt,Mt){for(var $t=null,je=null,ue=q,ve=q=0,kn=null;ue!==null&&ve<rt.length;ve++){ue.index>ve?(kn=ue,ue=null):kn=ue.sibling;var Je=Q(tt,ue,rt[ve],Mt);if(Je===null){ue===null&&(ue=kn);break}e&&ue&&Je.alternate===null&&n(tt,ue),q=f(Je,q,ve),je===null?$t=Je:je.sibling=Je,je=Je,ue=kn}if(ve===rt.length)return a(tt,ue),Ie&&Ka(tt,ve),$t;if(ue===null){for(;ve<rt.length;ve++)ue=Et(tt,rt[ve],Mt),ue!==null&&(q=f(ue,q,ve),je===null?$t=ue:je.sibling=ue,je=ue);return Ie&&Ka(tt,ve),$t}for(ue=r(ue);ve<rt.length;ve++)kn=ct(ue,tt,ve,rt[ve],Mt),kn!==null&&(e&&(Je=kn.alternate,Je!==null&&ue.delete(Je.key===null?ve:Je.key)),q=f(kn,q,ve),je===null?$t=kn:je.sibling=kn,je=kn);return e&&ue.forEach(function(Xs){return n(tt,Xs)}),Ie&&Ka(tt,ve),$t}function ne(tt,q,rt,Mt){if(rt==null)throw Error(s(151));for(var $t=null,je=null,ue=q,ve=q=0,kn=null,Je=rt.next();ue!==null&&!Je.done;ve++,Je=rt.next()){ue.index>ve?(kn=ue,ue=null):kn=ue.sibling;var Xs=Q(tt,ue,Je.value,Mt);if(Xs===null){ue===null&&(ue=kn);break}e&&ue&&Xs.alternate===null&&n(tt,ue),q=f(Xs,q,ve),je===null?$t=Xs:je.sibling=Xs,je=Xs,ue=kn}if(Je.done)return a(tt,ue),Ie&&Ka(tt,ve),$t;if(ue===null){for(;!Je.done;ve++,Je=rt.next())Je=Et(tt,Je.value,Mt),Je!==null&&(q=f(Je,q,ve),je===null?$t=Je:je.sibling=Je,je=Je);return Ie&&Ka(tt,ve),$t}for(ue=r(ue);!Je.done;ve++,Je=rt.next())Je=ct(ue,tt,ve,Je.value,Mt),Je!==null&&(e&&(kn=Je.alternate,kn!==null&&ue.delete(kn.key===null?ve:kn.key)),q=f(Je,q,ve),je===null?$t=Je:je.sibling=Je,je=Je);return e&&ue.forEach(function(Mb){return n(tt,Mb)}),Ie&&Ka(tt,ve),$t}function Le(tt,q,rt,Mt){if(typeof rt=="object"&&rt!==null&&rt.type===K&&rt.key===null&&rt.props.ref===void 0&&(rt=rt.props.children),typeof rt=="object"&&rt!==null){switch(rt.$$typeof){case W:t:{for(var $t=rt.key;q!==null;){if(q.key===$t){if($t=rt.type,$t===K){if(q.tag===7){a(tt,q.sibling),Mt=c(q,rt.props.children),bs(Mt,rt),Mt.return=tt,tt=Mt;break t}}else if(q.elementType===$t||typeof $t=="object"&&$t!==null&&$t.$$typeof===ht&&pr($t)===q.type){a(tt,q.sibling),Mt=c(q,rt.props),bs(Mt,rt),Mt.return=tt,tt=Mt;break t}a(tt,q);break}else n(tt,q);q=q.sibling}rt.type===K?(Mt=or(rt.props.children,tt.mode,Mt,rt.key),bs(Mt,rt),Mt.return=tt,tt=Mt):(Mt=Ic(rt.type,rt.key,rt.props,null,tt.mode,Mt),bs(Mt,rt),Mt.return=tt,tt=Mt)}return v(tt);case H:t:{for($t=rt.key;q!==null;){if(q.key===$t)if(q.tag===4&&q.stateNode.containerInfo===rt.containerInfo&&q.stateNode.implementation===rt.implementation){a(tt,q.sibling),Mt=c(q,rt.children||[]),Mt.return=tt,tt=Mt;break t}else{a(tt,q);break}else n(tt,q);q=q.sibling}Mt=ph(rt,tt.mode,Mt),Mt.return=tt,tt=Mt}return v(tt);case ht:return rt=pr(rt),Le(tt,q,rt,Mt)}if(le(rt))return Yt(tt,q,rt,Mt);if(At(rt)){if($t=At(rt),typeof $t!="function")throw Error(s(150));return rt=$t.call(rt),ne(tt,q,rt,Mt)}if(typeof rt.then=="function")return Le(tt,q,Wc(rt),Mt);if(rt.$$typeof===st)return Le(tt,q,Vc(tt,rt),Mt);Yc(tt,rt)}return typeof rt=="string"&&rt!==""||typeof rt=="number"||typeof rt=="bigint"?(rt=""+rt,q!==null&&q.tag===6?(a(tt,q.sibling),Mt=c(q,rt),Mt.return=tt,tt=Mt):(a(tt,q),Mt=dh(rt,tt.mode,Mt),Mt.return=tt,tt=Mt),v(tt)):a(tt,q)}return function(tt,q,rt,Mt){try{Sl=0;var $t=Le(tt,q,rt,Mt);return Jr=null,$t}catch(ue){if(ue===Qr||ue===kc)throw ue;var je=Ni(29,ue,null,tt.mode);return je.lanes=Mt,je.return=tt,je}}}var gr=mg(!0),gg=mg(!1),Ts=!1;function bh(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Th(e,n){e=e.updateQueue,n.updateQueue===e&&(n.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function As(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Rs(e,n,a){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,(an&2)!==0){var c=r.pending;return c===null?n.next=n:(n.next=c.next,c.next=n),r.pending=n,n=Pc(e),$0(e,null,a),n}return Oc(e,r,n,a),Pc(e)}function yl(e,n,a){if(n=n.updateQueue,n!==null&&(n=n.shared,(a&4194048)!==0)){var r=n.lanes;r&=e.pendingLanes,a|=r,n.lanes=a,ln(e,a)}}function Ah(e,n){var a=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,a===r)){var c=null,f=null;if(a=a.firstBaseUpdate,a!==null){do{var v={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};f===null?c=f=v:f=f.next=v,a=a.next}while(a!==null);f===null?c=f=n:f=f.next=n}else c=f=n;a={baseState:r.baseState,firstBaseUpdate:c,lastBaseUpdate:f,shared:r.shared,callbacks:r.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=n:e.next=n,a.lastBaseUpdate=n}var Rh=!1;function Ml(){if(Rh){var e=jr;if(e!==null)throw e}}function El(e,n,a,r){Rh=!1;var c=e.updateQueue;Ts=!1;var f=c.firstBaseUpdate,v=c.lastBaseUpdate,w=c.shared.pending;if(w!==null){c.shared.pending=null;var B=w,et=B.next;B.next=null,v===null?f=et:v.next=et,v=B;var ft=e.alternate;ft!==null&&(ft=ft.updateQueue,w=ft.lastBaseUpdate,w!==v&&(w===null?ft.firstBaseUpdate=et:w.next=et,ft.lastBaseUpdate=B))}if(f!==null){var Et=c.baseState;v=0,ft=et=B=null,w=f;do{var Q=w.lane&-536870913,ct=Q!==w.lane;if(ct?(Ke&Q)===Q:(r&Q)===Q){Q!==0&&Q===hr&&(Rh=!0),ft!==null&&(ft=ft.next={lane:0,tag:w.tag,payload:w.payload,callback:null,next:null});t:{var Yt=e,ne=w;Q=n;var Le=a;switch(ne.tag){case 1:if(Yt=ne.payload,typeof Yt=="function"){Et=Yt.call(Le,Et,Q);break t}Et=Yt;break t;case 3:Yt.flags=Yt.flags&-65537|128;case 0:if(Yt=ne.payload,Q=typeof Yt=="function"?Yt.call(Le,Et,Q):Yt,Q==null)break t;Et=E({},Et,Q);break t;case 2:Ts=!0}}Q=w.callback,Q!==null&&(e.flags|=64,ct&&(e.flags|=8192),ct=c.callbacks,ct===null?c.callbacks=[Q]:ct.push(Q))}else ct={lane:Q,tag:w.tag,payload:w.payload,callback:w.callback,next:null},ft===null?(et=ft=ct,B=Et):ft=ft.next=ct,v|=Q;if(w=w.next,w===null){if(w=c.shared.pending,w===null)break;ct=w,w=ct.next,ct.next=null,c.lastBaseUpdate=ct,c.shared.pending=null}}while(!0);ft===null&&(B=Et),c.baseState=B,c.firstBaseUpdate=et,c.lastBaseUpdate=ft,f===null&&(c.shared.lanes=0),Os|=v,e.lanes=v,e.memoizedState=Et}}function vg(e,n){if(typeof e!="function")throw Error(s(191,e));e.call(n)}function _g(e,n){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)vg(a[e],n)}var ws=Pe(null),Zc=Pe(0);function xg(e,n){e=ns,re(Zc,e),re(ws,n),ns=e|n.baseLanes}function wh(){re(Zc,ns),re(ws,ws.current)}function Ch(){ns=Zc.current,ze(ws),ze(Zc)}var li=Pe(null),mi=null;function Cs(e){var n=e.alternate;re(ci,ci.current&1),re(li,e),mi===null&&(n===null||ws.current!==null||n.memoizedState!==null)&&(mi=e)}function Nh(e){re(ci,ci.current),re(li,e),mi===null&&(mi=e)}function Sg(e){e.tag===22?(re(ci,ci.current),re(li,e),mi===null&&(mi=e)):Ns()}function Ns(){re(ci,ci.current),re(li,li.current)}function Hi(e){ze(li),mi===e&&(mi=null),ze(ci)}var ci=Pe(0);function bl(e,n){re(li,li.current),re(ci,n)}function Dh(e){ze(ci),ze(li),mi===e&&(mi=null)}function Kc(e){for(var n=e;n!==null;){if(n.tag===13){var a=n.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||$d(a)||tp(a)))return n}else if(n.tag===19&&n.memoizedProps.revealOrder!=="independent"){if((n.flags&128)!==0)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}var Ja=0,De=null,mn=null,Vn=null,jc=!1,$r=!1,vr=!1,Qc=0,Tl=0,to=null,XM=0;function On(){throw Error(s(321))}function Lh(e,n){if(n===null)return!1;for(var a=0;a<n.length&&a<e.length;a++)if(!Fi(e[a],n[a]))return!1;return!0}function Uh(e,n,a,r,c,f){return Ja=f,De=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,wt.H=e===null||e.memoizedState===null?iv:av,vr=!1,f=a(r,c),vr=!1,$r&&(f=Mg(n,a,r,c)),yg(e),f}function yg(e){wt.H=au;var n=mn!==null&&mn.next!==null;if(Ja=0,Vn=mn=De=null,jc=!1,Tl=0,to=null,n)throw Error(s(300));e===null||Xn||(e=e.dependencies,e!==null&&Gc(e)&&(Xn=!0))}function Mg(e,n,a,r){De=e;var c=0;do{if($r&&(to=null),Tl=0,$r=!1,25<=c)throw Error(s(301));if(c+=1,Vn=mn=null,e.updateQueue!=null){var f=e.updateQueue;f.lastEffect=null,f.events=null,f.stores=null,f.memoCache!=null&&(f.memoCache.index=0)}wt.H=QM,f=n(a,r)}while($r);return f}function kM(){var e=wt.H,n=e.useState()[0];return n=typeof n.then=="function"?Al(n):n,e=e.useState()[0],(mn!==null?mn.memoizedState:null)!==e&&(De.flags|=1024),n}function Oh(){var e=Qc!==0;return Qc=0,e}function Ph(e,n,a){n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~a}function Ih(e){if(jc){for(e=e.memoizedState;e!==null;){var n=e.queue;n!==null&&(n.pending=null),e=e.next}jc=!1}Ja=0,Vn=mn=De=null,$r=!1,Tl=Qc=0,to=null}function Si(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Vn===null?De.memoizedState=Vn=e:Vn=Vn.next=e,Vn}function Bn(){if(mn===null){var e=De.alternate;e=e!==null?e.memoizedState:null}else e=mn.next;var n=Vn===null?De.memoizedState:Vn.next;if(n!==null)Vn=n,mn=e;else{if(e===null)throw De.alternate===null?Error(s(467)):Error(s(310));mn=e,e={memoizedState:mn.memoizedState,baseState:mn.baseState,baseQueue:mn.baseQueue,queue:mn.queue,next:null},Vn===null?De.memoizedState=Vn=e:Vn=Vn.next=e}return Vn}function Jc(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Al(e){var n=Tl;return Tl+=1,to===null&&(to=[]),e=hg(to,e,n),n=De,(Vn===null?n.memoizedState:Vn.next)===null&&(n=n.alternate,wt.H=n===null||n.memoizedState===null?iv:av),e}function $c(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Al(e);if(e.$$typeof===$)return;if(e.$$typeof===st)return oi(e)}throw Error(s(438,String(e)))}function zh(e){var n=null,a=De.updateQueue;if(a!==null&&(n=a.memoCache),n==null){var r=De.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(n={data:r.data.map(function(c){return c.slice()}),index:0})))}if(n==null&&(n={data:[],index:0}),a===null&&(a=Jc(),De.updateQueue=a),a.memoCache=n,a=n.data[n.index],a===void 0)for(a=n.data[n.index]=Array(e),r=0;r<e;r++)a[r]=ae;return n.index++,a}function $a(e,n){return typeof n=="function"?n(e):n}function tu(e){var n=Bn();return Bh(n,mn,e)}function Bh(e,n,a){var r=e.queue;if(r===null)throw Error(s(311));r.lastRenderedReducer=a;var c=e.baseQueue,f=r.pending;if(f!==null){if(c!==null){var v=c.next;c.next=f.next,f.next=v}n.baseQueue=c=f,r.pending=null}if(f=e.baseState,c===null)e.memoizedState=f;else{n=c.next;var w=v=null,B=null,et=n,ft=!1;do{var Et=et.lane&-536870913;if(Et!==et.lane?(Ke&Et)===Et:(Ja&Et)===Et){var Q=et.revertLane;if(Q===0)B!==null&&(B=B.next={lane:0,revertLane:0,gesture:null,action:et.action,hasEagerState:et.hasEagerState,eagerState:et.eagerState,next:null}),Et===hr&&(ft=!0);else if((Ja&Q)===Q){et=et.next,Q===hr&&(ft=!0);continue}else Et={lane:0,revertLane:et.revertLane,gesture:null,action:et.action,hasEagerState:et.hasEagerState,eagerState:et.eagerState,next:null},B===null?(w=B=Et,v=f):B=B.next=Et,De.lanes|=Q,Os|=Q;Et=et.action,vr&&a(f,Et),f=et.hasEagerState?et.eagerState:a(f,Et)}else Q={lane:Et,revertLane:et.revertLane,gesture:et.gesture,action:et.action,hasEagerState:et.hasEagerState,eagerState:et.eagerState,next:null},B===null?(w=B=Q,v=f):B=B.next=Q,De.lanes|=Et,Os|=Et;et=et.next}while(et!==null&&et!==n);if(B===null?v=f:B.next=w,!Fi(f,e.memoizedState)&&(Xn=!0,ft&&(a=jr,a!==null)))throw a;e.memoizedState=f,e.baseState=v,e.baseQueue=B,r.lastRenderedState=f}return c===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function Fh(e){var n=Bn(),a=n.queue;if(a===null)throw Error(s(311));a.lastRenderedReducer=e;var r=a.dispatch,c=a.pending,f=n.memoizedState;if(c!==null){a.pending=null;var v=c=c.next;do f=e(f,v.action),v=v.next;while(v!==c);Fi(f,n.memoizedState)||(Xn=!0),n.memoizedState=f,n.baseQueue===null&&(n.baseState=f),a.lastRenderedState=f}return[f,r]}function Eg(e,n,a){var r=De,c=Bn(),f=Ie;if(f){if(a===void 0)throw Error(s(407));a=a()}else a=n();var v=!Fi((mn||c).memoizedState,a);if(v&&(c.memoizedState=a,Xn=!0),c=c.queue,Vh(Ag.bind(null,r,c,e),[e]),e=c.getSnapshot!==n||v||Vn!==null&&(Vn.memoizedState.tag&1)!==0,eo(e?9:8,{destroy:void 0},Tg.bind(null,r,c,a,n),null),e){if(r.flags|=2048,Sn===null)throw Error(s(349));f||(Ja&127)!==0||bg(r,n,a)}return a}function bg(e,n,a){e.flags|=16384,e={getSnapshot:n,value:a},n=De.updateQueue,n===null?(n=Jc(),De.updateQueue=n,n.stores=[e]):(a=n.stores,a===null?n.stores=[e]:a.push(e))}function Tg(e,n,a,r){n.value=a,n.getSnapshot=r,Rg(n)&&wg(e)}function Ag(e,n,a){return a(function(){Rg(n)&&wg(e)})}function Rg(e){var n=e.getSnapshot;e=e.value;try{var a=n();return!Fi(e,a)}catch{return!0}}function wg(e){var n=rr(e,2);n!==null&&Oi(n,e,2)}function Hh(e){var n=Si();if(typeof e=="function"){var a=e;if(e=a(),vr){bt(!0);try{a()}finally{bt(!1)}}}return n.memoizedState=n.baseState=e,n.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:$a,lastRenderedState:e},n}function Cg(e,n,a,r){return e.baseState=a,Bh(e,mn,typeof r=="function"?r:$a)}function qM(e,n,a,r,c){if(iu(e))throw Error(s(485));if(e=n.action,e!==null){var f={payload:c,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(v){f.listeners.push(v)}};wt.T!==null?a(!0):f.isTransition=!1,r(f),a=n.pending,a===null?(f.next=n.pending=f,Ng(n,f)):(f.next=a.next,n.pending=a.next=f)}}function Ng(e,n){var a=n.action,r=n.payload,c=e.state;if(n.isTransition){var f=wt.T,v={};v.types=f!==null?f.types:null,wt.T=v;try{var w=a(c,r),B=wt.S;B!==null&&B(v,w),Dg(e,n,w)}catch(et){Gh(e,n,et)}finally{f!==null&&v.types!==null&&(f.types=v.types),wt.T=f}}else try{f=a(c,r),Dg(e,n,f)}catch(et){Gh(e,n,et)}}function Dg(e,n,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(r){Lg(e,n,r)},function(r){return Gh(e,n,r)}):Lg(e,n,a)}function Lg(e,n,a){n.status="fulfilled",n.value=a,Ug(n),e.state=a,n=e.pending,n!==null&&(a=n.next,a===n?e.pending=null:(a=a.next,n.next=a,Ng(e,a)))}function Gh(e,n,a){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do n.status="rejected",n.reason=a,Ug(n),n=n.next;while(n!==r)}e.action=null}function Ug(e){e=e.listeners;for(var n=0;n<e.length;n++)(0,e[n])()}function Og(e,n){return n}function Pg(e,n){if(Ie){var a=Sn.formState;if(a!==null){t:{var r=De;if(Ie){if(Mn){e:{for(var c=Mn,f=na;c.nodeType!==8;){if(!f){c=null;break e}if(c=aa(c.nextSibling),c===null){c=null;break e}}f=c.data,c=f==="F!"||f==="F"?c:null}if(c){Mn=aa(c.nextSibling),r=c.data==="F!";break t}}Ms(r)}r=!1}r&&(n=a[0])}}return a=Si(),a.memoizedState=a.baseState=n,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Og,lastRenderedState:n},a.queue=r,a=tv.bind(null,De,r),r.dispatch=a,r=Hh(!1),f=Yh.bind(null,De,!1,r.queue),r=Si(),c={state:n,dispatch:null,action:e,pending:null},r.queue=c,a=qM.bind(null,De,c,f,a),c.dispatch=a,r.memoizedState=e,[n,a,!1]}function Ig(e){var n=Bn();return zg(n,mn,e)}function zg(e,n,a){if(n=Bh(e,n,Og)[0],e=tu($a)[0],typeof n=="object"&&n!==null&&typeof n.then=="function")try{var r=Al(n)}catch(v){throw v===Qr?kc:v}else r=n;n=Bn();var c=n.queue,f=c.dispatch;return a!==n.memoizedState&&(De.flags|=2048,eo(9,{destroy:void 0},WM.bind(null,c,a),null)),[r,f,e]}function WM(e,n){e.action=n}function Bg(e){var n=Bn(),a=mn;if(a!==null)return zg(n,a,e);Bn(),n=n.memoizedState,a=Bn();var r=a.queue.dispatch;return a.memoizedState=e,[n,r,!1]}function eo(e,n,a,r){return e={tag:e,create:a,deps:r,inst:n,next:null},n=De.updateQueue,n===null&&(n=Jc(),De.updateQueue=n),a=n.lastEffect,a===null?n.lastEffect=e.next=e:(r=a.next,a.next=e,e.next=r,n.lastEffect=e),e}function Fg(){return Bn().memoizedState}function eu(e,n,a,r){var c=Si();De.flags|=e,c.memoizedState=eo(1|n,{destroy:void 0},a,r===void 0?null:r)}function nu(e,n,a,r){var c=Bn();r=r===void 0?null:r;var f=c.memoizedState.inst;mn!==null&&r!==null&&Lh(r,mn.memoizedState.deps)?c.memoizedState=eo(n,f,a,r):(De.flags|=e,c.memoizedState=eo(1|n,f,a,r))}function Hg(e,n){eu(8390656,8,e,n)}function Vh(e,n){nu(2048,8,e,n)}function YM(e){De.flags|=4;var n=De.updateQueue;if(n===null)n=Jc(),De.updateQueue=n,n.events=[e];else{var a=n.events;a===null?n.events=[e]:a.push(e)}}function Gg(e){var n=Bn().memoizedState;return YM({ref:n,nextImpl:e}),function(){if((an&2)!==0)throw Error(s(440));return n.impl.apply(void 0,arguments)}}function Vg(e,n){return nu(4,2,e,n)}function Xg(e,n){return nu(4,4,e,n)}function kg(e,n){if(typeof n=="function"){e=e();var a=n(e);return function(){typeof a=="function"?a():n(null)}}if(n!=null)return e=e(),n.current=e,function(){n.current=null}}function qg(e,n,a){a=a!=null?a.concat([e]):null,nu(4,4,kg.bind(null,n,e),a)}function Xh(){}function Wg(e,n){var a=Bn();n=n===void 0?null:n;var r=a.memoizedState;return n!==null&&Lh(n,r[1])?r[0]:(a.memoizedState=[e,n],e)}function Yg(e,n){var a=Bn();n=n===void 0?null:n;var r=a.memoizedState;if(n!==null&&Lh(n,r[1]))return r[0];if(r=e(),vr){bt(!0);try{e()}finally{bt(!1)}}return a.memoizedState=[r,n],r}function kh(e,n,a){return a===void 0||(Ja&1073741824)!==0&&(Ke&261930)===0?e.memoizedState=n:(e.memoizedState=a,e=i_(),De.lanes|=e,Os|=e,a)}function Zg(e,n,a,r){return Fi(a,n)?a:ws.current!==null?(e=kh(e,a,r),Fi(e,n)||(Xn=!0),e):(Ja&106)===0||(Ja&1073741824)!==0&&(Ke&261930)===0?(Xn=!0,e.memoizedState=a):(e=i_(),De.lanes|=e,Os|=e,n)}function Kg(e,n,a,r,c){var f=Wt.p;Wt.p=f!==0&&8>f?f:8;var v=wt.T,w={};w.types=v!==null?v.types:null,wt.T=w,Yh(e,!1,n,a);try{var B=c(),et=wt.S;if(et!==null&&et(w,B),B!==null&&typeof B=="object"&&typeof B.then=="function"){var ft=VM(B,r);Rl(e,n,ft,ki(e))}else Rl(e,n,r,ki(e))}catch(Et){Rl(e,n,{then:function(){},status:"rejected",reason:Et},ki())}finally{Wt.p=f,v!==null&&w.types!==null&&(v.types=w.types),wt.T=v}}function ZM(){}function qh(e,n,a,r){if(e.tag!==5)throw Error(s(476));var c=jg(e).queue;Kg(e,c,n,de,a===null?ZM:function(){return Qg(e),a(r)})}function jg(e){var n=e.memoizedState;if(n!==null)return n;n={memoizedState:de,baseState:de,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:$a,lastRenderedState:de},next:null};var a={};return n.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:$a,lastRenderedState:a},next:null},e.memoizedState=n,e=e.alternate,e!==null&&(e.memoizedState=n),n}function Qg(e){var n=jg(e);n.next===null&&(n=e.alternate.memoizedState),Rl(e,n.next.queue,{},ki())}function Wh(){return oi(yo)}function Jg(){return Bn().memoizedState}function $g(){return Bn().memoizedState}function KM(e){for(var n=e.return;n!==null;){switch(n.tag){case 24:case 3:var a=ki();e=As(a);var r=Rs(n,e,a);r!==null&&(Oi(r,n,a),yl(r,n,a)),n={cache:Sh()},e.payload=n;return}n=n.return}}function jM(e,n,a){var r=ki();a={lane:r,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},iu(e)?ev(n,a):(a=fh(e,n,a,r),a!==null&&(Oi(a,e,r),nv(a,n,r)))}function tv(e,n,a){var r=ki();Rl(e,n,a,r)}function Rl(e,n,a,r){var c={lane:r,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(iu(e))ev(n,c);else{var f=e.alternate;if(e.lanes===0&&(f===null||f.lanes===0)&&(f=n.lastRenderedReducer,f!==null))try{var v=n.lastRenderedState,w=f(v,a);if(c.hasEagerState=!0,c.eagerState=w,Fi(w,v))return Oc(e,n,c,0),Sn===null&&Uc(),!1}catch{}if(a=fh(e,n,c,r),a!==null)return Oi(a,e,r),nv(a,n,r),!0}return!1}function Yh(e,n,a,r){if(r={lane:2,revertLane:zd(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},iu(e)){if(n)throw Error(s(479))}else n=fh(e,a,r,2),n!==null&&Oi(n,e,2)}function iu(e){var n=e.alternate;return e===De||n!==null&&n===De}function ev(e,n){$r=jc=!0;var a=e.pending;a===null?n.next=n:(n.next=a.next,a.next=n),e.pending=n}function nv(e,n,a){if((a&4194048)!==0){var r=n.lanes;r&=e.pendingLanes,a|=r,n.lanes=a,ln(e,a)}}var au={readContext:oi,use:$c,useCallback:On,useContext:On,useEffect:On,useImperativeHandle:On,useLayoutEffect:On,useInsertionEffect:On,useMemo:On,useReducer:On,useRef:On,useState:On,useDebugValue:On,useDeferredValue:On,useTransition:On,useSyncExternalStore:On,useId:On,useHostTransitionStatus:On,useFormState:On,useActionState:On,useOptimistic:On,useMemoCache:On,useCacheRefresh:On,useEffectEvent:On},iv={readContext:oi,use:$c,useCallback:function(e,n){return Si().memoizedState=[e,n===void 0?null:n],e},useContext:oi,useEffect:Hg,useImperativeHandle:function(e,n,a){a=a!=null?a.concat([e]):null,eu(4194308,4,kg.bind(null,n,e),a)},useLayoutEffect:function(e,n){return eu(4194308,4,e,n)},useInsertionEffect:function(e,n){eu(4,2,e,n)},useMemo:function(e,n){var a=Si();n=n===void 0?null:n;var r=e();if(vr){bt(!0);try{e()}finally{bt(!1)}}return a.memoizedState=[r,n],r},useReducer:function(e,n,a){var r=Si();if(a!==void 0){var c=a(n);if(vr){bt(!0);try{a(n)}finally{bt(!1)}}}else c=n;return r.memoizedState=r.baseState=c,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:c},r.queue=e,e=e.dispatch=jM.bind(null,De,e),[r.memoizedState,e]},useRef:function(e){var n=Si();return e={current:e},n.memoizedState=e},useState:function(e){e=Hh(e);var n=e.queue,a=tv.bind(null,De,n);return n.dispatch=a,[e.memoizedState,a]},useDebugValue:Xh,useDeferredValue:function(e,n){var a=Si();return kh(a,e,n)},useTransition:function(){var e=Hh(!1);return e=Kg.bind(null,De,e.queue,!0,!1),Si().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,n,a){var r=De,c=Si();if(Ie){if(a===void 0)throw Error(s(407));a=a()}else{if(a=n(),Sn===null)throw Error(s(349));(Ke&127)!==0||bg(r,n,a)}c.memoizedState=a;var f={value:a,getSnapshot:n};return c.queue=f,Hg(Ag.bind(null,r,f,e),[e]),r.flags|=2048,eo(9,{destroy:void 0},Tg.bind(null,r,f,a,n),null),a},useId:function(){var e=Si(),n=Sn.identifierPrefix;if(Ie){var a=wa,r=Ra;a=(r&~(1<<32-Zt(r)-1)).toString(32)+a,n="_"+n+"R_"+a,a=Qc++,0<a&&(n+="H"+a.toString(32)),n+="_"}else a=XM++,n="_"+n+"r_"+a.toString(32)+"_";return e.memoizedState=n},useHostTransitionStatus:Wh,useFormState:Pg,useActionState:Pg,useOptimistic:function(e){var n=Si();n.memoizedState=n.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return n.queue=a,n=Yh.bind(null,De,!0,a),a.dispatch=n,[e,n]},useMemoCache:zh,useCacheRefresh:function(){return Si().memoizedState=KM.bind(null,De)},useEffectEvent:function(e){var n=Si(),a={impl:e};return n.memoizedState=a,function(){if((an&2)!==0)throw Error(s(440));return a.impl.apply(void 0,arguments)}}},av={readContext:oi,use:$c,useCallback:Wg,useContext:oi,useEffect:Vh,useImperativeHandle:qg,useInsertionEffect:Vg,useLayoutEffect:Xg,useMemo:Yg,useReducer:tu,useRef:Fg,useState:function(){return tu($a)},useDebugValue:Xh,useDeferredValue:function(e,n){var a=Bn();return Zg(a,mn.memoizedState,e,n)},useTransition:function(){var e=tu($a)[0],n=Bn().memoizedState;return[typeof e=="boolean"?e:Al(e),n]},useSyncExternalStore:Eg,useId:Jg,useHostTransitionStatus:Wh,useFormState:Ig,useActionState:Ig,useOptimistic:function(e,n){var a=Bn();return Cg(a,mn,e,n)},useMemoCache:zh,useCacheRefresh:$g,useEffectEvent:Gg},QM={readContext:oi,use:$c,useCallback:Wg,useContext:oi,useEffect:Vh,useImperativeHandle:qg,useInsertionEffect:Vg,useLayoutEffect:Xg,useMemo:Yg,useReducer:Fh,useRef:Fg,useState:function(){return Fh($a)},useDebugValue:Xh,useDeferredValue:function(e,n){var a=Bn();return mn===null?kh(a,e,n):Zg(a,mn.memoizedState,e,n)},useTransition:function(){var e=Fh($a)[0],n=Bn().memoizedState;return[typeof e=="boolean"?e:Al(e),n]},useSyncExternalStore:Eg,useId:Jg,useHostTransitionStatus:Wh,useFormState:Bg,useActionState:Bg,useOptimistic:function(e,n){var a=Bn();return mn!==null?Cg(a,mn,e,n):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:zh,useCacheRefresh:$g,useEffectEvent:Gg};function Zh(e,n,a,r){n=e.memoizedState,a=a(r,n),a=a==null?n:E({},n,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Kh={enqueueSetState:function(e,n,a){e=e._reactInternals;var r=ki(),c=As(r);c.payload=n,a!=null&&(c.callback=a),n=Rs(e,c,r),n!==null&&(Oi(n,e,r),yl(n,e,r))},enqueueReplaceState:function(e,n,a){e=e._reactInternals;var r=ki(),c=As(r);c.tag=1,c.payload=n,a!=null&&(c.callback=a),n=Rs(e,c,r),n!==null&&(Oi(n,e,r),yl(n,e,r))},enqueueForceUpdate:function(e,n){e=e._reactInternals;var a=ki(),r=As(a);r.tag=2,n!=null&&(r.callback=n),n=Rs(e,r,a),n!==null&&(Oi(n,e,a),yl(n,e,a))}};function sv(e,n,a,r,c,f,v){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,f,v):n.prototype&&n.prototype.isPureReactComponent?!dl(a,r)||!dl(c,f):!0}function rv(e,n,a,r){e=n.state,typeof n.componentWillReceiveProps=="function"&&n.componentWillReceiveProps(a,r),typeof n.UNSAFE_componentWillReceiveProps=="function"&&n.UNSAFE_componentWillReceiveProps(a,r),n.state!==e&&Kh.enqueueReplaceState(n,n.state,null)}function _r(e,n){var a=n;if("ref"in n){a={};for(var r in n)r!=="ref"&&(a[r]=n[r])}if(e=e.defaultProps){a===n&&(a=E({},a));for(var c in e)a[c]===void 0&&(a[c]=e[c])}return a}function ov(e){Lc(e)}function lv(e){console.error(e)}function cv(e){Lc(e)}function su(e,n){try{var a=e.onUncaughtError;a(n.value,{componentStack:n.stack})}catch(r){setTimeout(function(){throw r})}}function uv(e,n,a){try{var r=e.onCaughtError;r(a.value,{componentStack:a.stack,errorBoundary:n.tag===1?n.stateNode:null})}catch(c){setTimeout(function(){throw c})}}function jh(e,n,a){return a=As(a),a.tag=3,a.payload={element:null},a.callback=function(){su(e,n)},a}function fv(e){return e=As(e),e.tag=3,e}function hv(e,n,a,r){var c=a.type.getDerivedStateFromError;if(typeof c=="function"){var f=r.value;e.payload=function(){return c(f)},e.callback=function(){uv(n,a,r)}}var v=a.stateNode;v!==null&&typeof v.componentDidCatch=="function"&&(e.callback=function(){uv(n,a,r),typeof c!="function"&&(Ps===null?Ps=new Set([this]):Ps.add(this));var w=r.stack;this.componentDidCatch(r.value,{componentStack:w!==null?w:""})})}function JM(e,n,a,r,c){if(a.flags|=32768,r!==null&&typeof r=="object"&&typeof r.then=="function"){if(n=a.alternate,n!==null&&ur(n,a,c,!0),a=li.current,a!==null){switch(a.tag){case 31:case 13:case 19:return mi===null?Au():a.alternate===null&&Pn===0&&(Pn=3),a.flags&=-257,a.flags|=65536,a.lanes=c,r===qc?a.flags|=16384:(n=a.updateQueue,n===null?a.updateQueue=new Set([r]):n.add(r),Od(e,r,c)),!1;case 22:return a.flags|=65536,r===qc?a.flags|=16384:(n=a.updateQueue,n===null?(n={transitions:null,markerInstances:null,retryQueue:new Set([r])},a.updateQueue=n):(a=n.retryQueue,a===null?n.retryQueue=new Set([r]):a.add(r)),Od(e,r,c)),!1}throw Error(s(435,a.tag))}return Od(e,r,c),Au(),!1}if(Ie)return n=li.current,n!==null?((n.flags&65536)===0&&(n.flags|=256),n.flags|=65536,n.lanes=c,r!==gh&&(e=Error(s(422),{cause:r}),gl($i(e,a)))):(r!==gh&&(n=Error(s(423),{cause:r}),gl($i(n,a))),e=e.current.alternate,e.flags|=65536,c&=-c,e.lanes|=c,r=$i(r,a),c=jh(e.stateNode,r,c),Ah(e,c),Pn!==4&&(Pn=2)),!1;var f=Error(s(520),{cause:r});if(f=$i(f,a),Pl===null?Pl=[f]:Pl.push(f),Pn!==4&&(Pn=2),n===null)return!0;r=$i(r,a),a=n;do{switch(a.tag){case 3:return a.flags|=65536,e=c&-c,a.lanes|=e,e=jh(a.stateNode,r,e),Ah(a,e),!1;case 1:if(n=a.type,f=a.stateNode,(a.flags&128)===0&&(typeof n.getDerivedStateFromError=="function"||f!==null&&typeof f.componentDidCatch=="function"&&(Ps===null||!Ps.has(f))))return a.flags|=65536,c&=-c,a.lanes|=c,c=fv(c),hv(c,e,a,r),Ah(a,c),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Qh=Error(s(461)),Xn=!1;function Yn(e,n,a,r){n.child=e===null?gg(n,null,a,r):gr(n,e.child,a,r)}function dv(e,n,a,r,c){a=a.render;var f=n.ref;if("ref"in r){var v={};for(var w in r)w!=="ref"&&(v[w]=r[w])}else v=r;return fr(n),r=Uh(e,n,a,v,f,c),w=Oh(),e!==null&&!Xn?(Ph(e,n,c),ts(e,n,c)):(Ie&&w&&Bc(n),n.flags|=1,Yn(e,n,r,c),n.child)}function pv(e,n,a,r,c){if(e===null){var f=a.type;return typeof f=="function"&&!hh(f)&&f.defaultProps===void 0&&a.compare===null?(n.tag=15,n.type=f,mv(e,n,f,r,c)):(e=Ic(a.type,null,r,n,n.mode,c),e.ref=n.ref,e.return=n,n.child=e)}if(f=e.child,!sd(e,c)){var v=f.memoizedProps;if(a=a.compare,a=a!==null?a:dl,a(v,r)&&e.ref===n.ref)return ts(e,n,c)}return n.flags|=1,e=Za(f,r),e.ref=n.ref,e.return=n,n.child=e}function mv(e,n,a,r,c){if(e!==null){var f=e.memoizedProps;if(dl(f,r)&&e.ref===n.ref)if(Xn=!1,n.pendingProps=r=f,sd(e,c))(e.flags&131072)!==0&&(Xn=!0);else return n.lanes=e.lanes,ts(e,n,c)}return Jh(e,n,a,r,c)}function gv(e,n,a,r){var c=r.children,f=e!==null?e.memoizedState:null;if(e===null&&n.stateNode===null&&(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode==="hidden"){if((n.flags&128)!==0){if(f=f!==null?f.baseLanes|a:a,e!==null){for(r=n.child=e.child,c=0;r!==null;)c=c|r.lanes|r.childLanes,r=r.sibling;r=c&~f}else r=0,n.child=null;return vv(e,n,f,a,r)}if((a&536870912)!==0)n.memoizedState={baseLanes:0,cachePool:null},e!==null&&Xc(n,f!==null?f.cachePool:null),f!==null?xg(n,f):wh(),Sg(n);else return r=n.lanes=536870912,vv(e,n,f!==null?f.baseLanes|a:a,a,r)}else f!==null?(Xc(n,f.cachePool),xg(n,f),Ns(),n.memoizedState=null):(e!==null&&Xc(n,null),wh(),Ns());return Yn(e,n,c,a),n.child}function wl(e,n){return e!==null&&e.tag===22||n.stateNode!==null||(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.sibling}function vv(e,n,a,r,c){var f=Mh();return f=f===null?null:{parent:Gn._currentValue,pool:f},n.memoizedState={baseLanes:a,cachePool:f},e!==null&&Xc(n,null),wh(),Sg(n),e!==null&&ur(e,n,r,!0),n.childLanes=c,null}function ru(e,n){return n=ou({mode:n.mode,children:n.children},e.mode),n.ref=e.ref,e.child=n,n.return=e,n}function _v(e,n,a){return gr(n,e.child,null,a),e=ru(n,n.pendingProps),e.flags|=2,Hi(n),n.memoizedState=null,e}function $M(e,n,a){var r=n.pendingProps,c=(n.flags&128)!==0;if(n.flags&=-129,e===null){if(Ie){if(r.mode==="hidden")return e=ru(n,r),n.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},wl(null,e);if(Nh(n),(e=Mn)?(e=k_(e,na),e=e!==null&&e.data==="&"?e:null,e!==null&&(n.memoizedState={dehydrated:e,treeContext:Ss!==null?{id:Ra,overflow:wa}:null,retryLane:536870912,hydrationErrors:null},a=eg(e),a.return=n,n.child=a,ei=n,Mn=null)):e=null,e===null)throw Ms(n);return n.lanes=536870912,null}return ru(n,r)}var f=e.memoizedState;if(f!==null){var v=f.dehydrated;if(Nh(n),c)if(n.flags&256)n.flags&=-257,n=_v(e,n,a);else if(n.memoizedState!==null)n.child=e.child,n.flags|=128,n=null;else throw Error(s(558));else if(Xn||ur(e,n,a,!1),c=(a&e.childLanes)!==0,Xn||c){if(ws.current===null){if(r=Sn,r!==null&&(v=rn(r,a),v!==0&&v!==f.retryLane))throw f.retryLane=v,rr(e,v),Oi(r,e,v),Qh;Au()}n=_v(e,n,a)}else e=f.treeContext,Mn=aa(v.nextSibling),ei=n,Ie=!0,ys=null,na=!1,e!==null&&ag(n,e),n=ru(n,r),n.flags|=134221824;return n}return e=Za(e.child,{mode:r.mode,children:r.children}),e.ref=n.ref,n.child=e,e.return=n,e}function no(e,n){var a=n.ref;if(a===null)e!==null&&e.ref!==null&&(n.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(s(284));(e===null||e.ref!==a)&&(n.flags|=4194816)}}function Jh(e,n,a,r,c){return fr(n),a=Uh(e,n,a,r,void 0,c),r=Oh(),e!==null&&!Xn?(Ph(e,n,c),ts(e,n,c)):(Ie&&r&&Bc(n),n.flags|=1,Yn(e,n,a,c),n.child)}function xv(e,n,a,r,c,f){return fr(n),n.updateQueue=null,a=Mg(n,r,a,c),yg(e),r=Oh(),e!==null&&!Xn?(Ph(e,n,f),ts(e,n,f)):(Ie&&r&&Bc(n),n.flags|=1,Yn(e,n,a,f),n.child)}function Sv(e,n,a,r,c){if(fr(n),n.stateNode===null){var f=Wr,v=a.contextType;typeof v=="object"&&v!==null&&(f=oi(v)),f=new a(r,f),n.memoizedState=f.state!==null&&f.state!==void 0?f.state:null,f.updater=Kh,n.stateNode=f,f._reactInternals=n,f=n.stateNode,f.props=r,f.state=n.memoizedState,f.refs={},bh(n),v=a.contextType,f.context=typeof v=="object"&&v!==null?oi(v):Wr,f.state=n.memoizedState,v=a.getDerivedStateFromProps,typeof v=="function"&&(Zh(n,a,v,r),f.state=n.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof f.getSnapshotBeforeUpdate=="function"||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(v=f.state,typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount(),v!==f.state&&Kh.enqueueReplaceState(f,f.state,null),El(n,r,f,c),Ml(),f.state=n.memoizedState),typeof f.componentDidMount=="function"&&(n.flags|=4194308),r=!0}else if(e===null){f=n.stateNode;var w=n.memoizedProps,B=_r(a,w);f.props=B;var et=f.context,ft=a.contextType;v=Wr,typeof ft=="object"&&ft!==null&&(v=oi(ft));var Et=a.getDerivedStateFromProps;ft=typeof Et=="function"||typeof f.getSnapshotBeforeUpdate=="function",w=n.pendingProps!==w,ft||typeof f.UNSAFE_componentWillReceiveProps!="function"&&typeof f.componentWillReceiveProps!="function"||(w||et!==v)&&rv(n,f,r,v),Ts=!1;var Q=n.memoizedState;f.state=Q,El(n,r,f,c),Ml(),et=n.memoizedState,w||Q!==et||Ts?(typeof Et=="function"&&(Zh(n,a,Et,r),et=n.memoizedState),(B=Ts||sv(n,a,B,r,Q,et,v))?(ft||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount()),typeof f.componentDidMount=="function"&&(n.flags|=4194308)):(typeof f.componentDidMount=="function"&&(n.flags|=4194308),n.memoizedProps=r,n.memoizedState=et),f.props=r,f.state=et,f.context=v,r=B):(typeof f.componentDidMount=="function"&&(n.flags|=4194308),r=!1)}else{f=n.stateNode,Th(e,n),v=n.memoizedProps,ft=_r(a,v),f.props=ft,Et=n.pendingProps,Q=f.context,et=a.contextType,B=Wr,typeof et=="object"&&et!==null&&(B=oi(et)),w=a.getDerivedStateFromProps,(et=typeof w=="function"||typeof f.getSnapshotBeforeUpdate=="function")||typeof f.UNSAFE_componentWillReceiveProps!="function"&&typeof f.componentWillReceiveProps!="function"||(v!==Et||Q!==B)&&rv(n,f,r,B),Ts=!1,Q=n.memoizedState,f.state=Q,El(n,r,f,c),Ml();var ct=n.memoizedState;v!==Et||Q!==ct||Ts||e!==null&&e.dependencies!==null&&Gc(e.dependencies)?(typeof w=="function"&&(Zh(n,a,w,r),ct=n.memoizedState),(ft=Ts||sv(n,a,ft,r,Q,ct,B)||e!==null&&e.dependencies!==null&&Gc(e.dependencies))?(et||typeof f.UNSAFE_componentWillUpdate!="function"&&typeof f.componentWillUpdate!="function"||(typeof f.componentWillUpdate=="function"&&f.componentWillUpdate(r,ct,B),typeof f.UNSAFE_componentWillUpdate=="function"&&f.UNSAFE_componentWillUpdate(r,ct,B)),typeof f.componentDidUpdate=="function"&&(n.flags|=4),typeof f.getSnapshotBeforeUpdate=="function"&&(n.flags|=1024)):(typeof f.componentDidUpdate!="function"||v===e.memoizedProps&&Q===e.memoizedState||(n.flags|=4),typeof f.getSnapshotBeforeUpdate!="function"||v===e.memoizedProps&&Q===e.memoizedState||(n.flags|=1024),n.memoizedProps=r,n.memoizedState=ct),f.props=r,f.state=ct,f.context=B,r=ft):(typeof f.componentDidUpdate!="function"||v===e.memoizedProps&&Q===e.memoizedState||(n.flags|=4),typeof f.getSnapshotBeforeUpdate!="function"||v===e.memoizedProps&&Q===e.memoizedState||(n.flags|=1024),r=!1)}return f=r,no(e,n),r=(n.flags&128)!==0,f||r?(f=n.stateNode,a=r&&typeof a.getDerivedStateFromError!="function"?null:f.render(),n.flags|=1,e!==null&&r?(n.child=gr(n,e.child,null,c),n.child=gr(n,null,a,c)):Yn(e,n,a,c),n.memoizedState=f.state,e=n.child):e=ts(e,n,c),e}function yv(e,n,a,r){return lr(),n.flags|=256,Yn(e,n,a,r),n.child}var $h={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function td(e){return{baseLanes:e,cachePool:ug()}}function ed(e,n,a){return e=e!==null?e.childLanes&~a:0,n&&(e|=Xi),e}function Mv(e,n,a){var r=n.pendingProps,c=!1,f=(n.flags&128)!==0,v;if((v=f)||(v=e!==null&&e.memoizedState===null?!1:(ci.current&2)!==0),v&&(c=!0,n.flags&=-129),v=(n.flags&32)!==0,n.flags&=-33,e===null){if(Ie){if(c?Cs(n):Ns(),(e=Mn)?(e=k_(e,na),e=e!==null&&e.data!=="&"?e:null,e!==null&&(n.memoizedState={dehydrated:e,treeContext:Ss!==null?{id:Ra,overflow:wa}:null,retryLane:536870912,hydrationErrors:null},a=eg(e),a.return=n,n.child=a,ei=n,Mn=null)):e=null,e===null)throw Ms(n);return tp(e)?n.lanes=32:n.lanes=536870912,null}return f=r.children,r=r.fallback,c?(Ns(),c=n.mode,f=ou({mode:"hidden",children:f},c),r=or(r,c,a,null),f.return=n,r.return=n,f.sibling=r,n.child=f,r=n.child,r.memoizedState=td(a),r.childLanes=ed(e,v,a),n.memoizedState=$h,wl(null,r)):(Cs(n),nd(n,f))}var w=e.memoizedState;if(w!==null){var B=w.dehydrated;if(B!==null)return tE(e,n,f,v,r,B,w,a)}return c?(Ns(),c=r.fallback,f=n.mode,w=e.child,B=w.sibling,r=Za(w,{mode:"hidden",children:r.children}),r.subtreeFlags=w.subtreeFlags&1206910976,B!==null?c=Za(B,c):(c=or(c,f,a,null),c.flags|=2),c.return=n,r.return=n,r.sibling=c,n.child=r,wl(null,r),r=n.child,c=e.child.memoizedState,c===null?c=td(a):(f=c.cachePool,f!==null?(w=Gn._currentValue,f=f.parent!==w?{parent:w,pool:w}:f):f=ug(),c={baseLanes:c.baseLanes|a,cachePool:f}),r.memoizedState=c,r.childLanes=ed(e,v,a),n.memoizedState=$h,wl(e.child,r)):(Cs(n),a=e.child,e=a.sibling,a=Za(a,{mode:"visible",children:r.children}),a.return=n,a.sibling=null,e!==null&&(v=n.deletions,v===null?(n.deletions=[e],n.flags|=16):v.push(e)),n.child=a,n.memoizedState=null,a)}function nd(e,n){return n=ou({mode:"visible",children:n},e.mode),n.return=e,e.child=n}function ou(e,n){return e=Ni(22,e,null,n),e.lanes=0,e}function lu(e,n,a){return gr(n,e.child,null,a),e=nd(n,n.pendingProps.children),e.flags|=2,n.memoizedState=null,e}function tE(e,n,a,r,c,f,v,w){if(a)return n.flags&256?(Cs(n),n.flags&=-257,lu(e,n,w)):n.memoizedState!==null?(Ns(),n.child=e.child,n.flags|=128,null):(Ns(),f=c.fallback,v=n.mode,c=ou({mode:"visible",children:c.children},v),f=or(f,v,w,null),f.flags|=2,c.return=n,f.return=n,c.sibling=f,n.child=c,gr(n,e.child,null,w),c=n.child,c.memoizedState=td(w),c.childLanes=ed(e,r,w),n.memoizedState=$h,wl(null,c));if(Cs(n),tp(f)){if(r=f.nextSibling&&f.nextSibling.dataset,r)var B=r.dgst;return r=B,r!==""&&(c=Error(s(419)),c.stack="",c.digest=r,gl({value:c,source:null,stack:null})),lu(e,n,w)}if(Xn||ur(e,n,w,!1),r=(w&e.childLanes)!==0,Xn||r){if(ws.current!==null)return lu(e,n,w);if(r=Sn,r!==null&&(c=rn(r,w),c!==0&&c!==v.retryLane))throw v.retryLane=c,rr(e,c),Oi(r,e,c),Qh;return $d(f)||Au(),lu(e,n,w)}return $d(f)?(n.flags|=192,n.child=e.child,null):(e=v.treeContext,Mn=aa(f.nextSibling),ei=n,Ie=!0,ys=null,na=!1,e!==null&&ag(n,e),n=nd(n,c.children),n.flags|=134221824,n)}function Ev(e,n,a){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n),Hc(e.return,n,a)}function bv(e){for(var n=null;e!==null;){var a=e.alternate;a!==null&&Kc(a)===null&&(n=e),e=e.sibling}return n}function cu(e,n,a,r,c,f){var v=e.memoizedState;v===null?e.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:r,tail:a,tailMode:c,treeForkCount:f}:(v.isBackwards=n,v.rendering=null,v.renderingStartTime=0,v.last=r,v.tail=a,v.tailMode=c,v.treeForkCount=f)}function id(e){var n=e.child;for(e.child=null;n!==null;){var a=n.sibling;n.sibling=e.child,e.child=n,n=a}}function ad(e,n,a){var r=n.pendingProps,c=r.revealOrder,f=r.tail;r=r.children;var v=ci.current;if(n.flags&128)return bl(n,v),null;var w=(v&2)!==0;if(w?(v=v&1|2,n.flags|=128):v&=1,bl(n,v),c==="backwards"&&e!==null?(id(e),Yn(e,n,r,a),id(e)):Yn(e,n,r,a),r=Ie?ml:0,!w&&e!==null&&(e.flags&128)!==0)t:for(e=n.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Ev(e,a,n);else if(e.tag===19)Ev(e,a,n);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break t;for(;e.sibling===null;){if(e.return===null||e.return===n)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(c){case"backwards":a=bv(n.child),a===null?(c=n.child,n.child=null):(c=a.sibling,a.sibling=null,id(n)),cu(n,!0,c,null,f,r);break;case"unstable_legacy-backwards":for(a=null,c=n.child,n.child=null;c!==null;){if(e=c.alternate,e!==null&&Kc(e)===null){n.child=c;break}e=c.sibling,c.sibling=a,a=c,c=e}cu(n,!0,a,null,f,r);break;case"together":cu(n,!1,null,null,void 0,r);break;case"independent":n.memoizedState=null;break;default:a=bv(n.child),a===null?(c=n.child,n.child=null):(c=a.sibling,a.sibling=null),cu(n,!1,c,a,f,r)}return n.child}function Tv(e,n,a){var r=n.pendingProps;return Es(n,n.type,r.value),Yn(e,n,r.children,a),n.child}function ts(e,n,a){if(e!==null&&(n.dependencies=e.dependencies),Os|=n.lanes,(a&n.childLanes)===0)if(e!==null){if(ur(e,n,a,!1),(a&n.childLanes)===0)return null}else return null;if(e!==null&&n.child!==e.child)throw Error(s(153));if(n.child!==null){for(e=n.child,a=Za(e,e.pendingProps),n.child=a,a.return=n;e.sibling!==null;)e=e.sibling,a=a.sibling=Za(e,e.pendingProps),a.return=n;a.sibling=null}return n.child}function sd(e,n){return(e.lanes&n)!==0?!0:(e=e.dependencies,!!(e!==null&&Gc(e)))}function eE(e,n,a){switch(n.tag){case 3:An(n,n.stateNode.containerInfo),Es(n,Gn,e.memoizedState.cache),lr();break;case 27:case 5:_n(n);break;case 4:An(n,n.stateNode.containerInfo);break;case 10:Es(n,n.type,n.memoizedProps.value);break;case 31:if(n.memoizedState!==null)return n.flags|=128,Nh(n),null;break;case 13:var r=n.memoizedState;if(r!==null){if(r.dehydrated!==null)return Cs(n),n.flags|=128,null;r=ur(e,n,a,!1);var c=n.child.childLanes;return r||(a&c)!==0?Mv(e,n,a):(Cs(n),e=ts(e,n,a),e!==null?e.sibling:null)}Cs(n);break;case 19:if(n.flags&128)return ad(e,n,a);if(c=(e.flags&128)!==0,r=(a&n.childLanes)!==0,r||(ur(e,n,a,!1),r=(a&n.childLanes)!==0),c){if(r)return ad(e,n,a);n.flags|=128}if(c=n.memoizedState,c!==null&&(c.rendering=null,c.tail=null,c.lastEffect=null),bl(n,ci.current),r)break;return null;case 22:return n.lanes=0,gv(e,n,a,n.pendingProps);case 24:Es(n,Gn,e.memoizedState.cache)}return ts(e,n,a)}function Av(e,n,a){if(e!==null)if(e.memoizedProps!==n.pendingProps)Xn=!0;else{if(!sd(e,a)&&(n.flags&128)===0)return Xn=!1,eE(e,n,a);Xn=(e.flags&131072)!==0}else Xn=!1,Ie&&(n.flags&1048576)!==0&&ig(n,ml,n.index);switch(n.lanes=0,n.tag){case 16:t:{var r=n.pendingProps;if(e=pr(n.elementType),n.type=e,typeof e=="function")hh(e)?(r=_r(e,r),n.tag=1,n=Sv(null,n,e,r,a)):(n.tag=0,n=Jh(null,n,e,r,a));else{if(e!=null){var c=e.$$typeof;if(c===k){n.tag=11,n=dv(null,n,e,r,a);break t}else if(c===ot){n.tag=14,n=pv(null,n,e,r,a);break t}else if(c===st){n.tag=10,n.type=e,n=Tv(null,n,a);break t}}throw n=qt(e)||e,Error(s(306,n,""))}}return n;case 0:return Jh(e,n,n.type,n.pendingProps,a);case 1:return r=n.type,c=_r(r,n.pendingProps),Sv(e,n,r,c,a);case 3:t:{if(An(n,n.stateNode.containerInfo),e===null)throw Error(s(387));r=n.pendingProps;var f=n.memoizedState;c=f.element,Th(e,n),El(n,r,null,a);var v=n.memoizedState;if(r=v.cache,Es(n,Gn,r),r!==f.cache&&xh(n,[Gn],a,!0),Ml(),r=v.element,f.isDehydrated)if(f={element:r,isDehydrated:!1,cache:v.cache},n.updateQueue.baseState=f,n.memoizedState=f,n.flags&256){n=yv(e,n,r,a);break t}else if(r!==c){c=$i(Error(s(424)),n),gl(c),n=yv(e,n,r,a);break t}else for(e=n.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Mn=aa(e.firstChild),ei=n,Ie=!0,ys=null,na=!0,a=gg(n,null,r,a),n.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(lr(),r===c){n=ts(e,n,a);break t}Yn(e,n,r,a)}n=n.child}return n;case 26:return no(e,n),e===null?(a=Q_(n.type,null,n.pendingProps,null))?n.memoizedState=a:Ie||(n.stateNode=N_(n.type,n.pendingProps,vn.current,n)):n.memoizedState=Q_(n.type,e.memoizedProps,n.pendingProps,e.memoizedState),null;case 27:return _n(n),e===null&&Ie&&(r=n.stateNode=Y_(n.type,n.pendingProps,vn.current),ei=n,na=!0,c=Mn,Bs(n.type)?(ep=c,Mn=aa(r.firstChild)):Mn=c),Yn(e,n,n.pendingProps.children,a),no(e,n),e===null&&(n.flags|=4194304),n.child;case 5:return e===null&&Ie&&((c=r=Mn)&&(r=KE(r,n.type,n.pendingProps,na),r!==null?(n.stateNode=r,ei=n,Mn=aa(r.firstChild),na=!1,c=!0):c=!1),c||Ms(n)),_n(n),c=n.type,f=n.pendingProps,v=e!==null?e.memoizedProps:null,r=f.children,Wd(c,f)?r=null:v!==null&&Wd(c,v)&&(n.flags|=32),n.memoizedState!==null&&(c=Uh(e,n,kM,null,null,a),yo._currentValue=c),no(e,n),Yn(e,n,r,a),n.child;case 6:return e===null&&Ie&&((e=a=Mn)&&(a=jE(a,n.pendingProps,na),a!==null?(n.stateNode=a,ei=n,Mn=null,e=!0):e=!1),e||Ms(n)),null;case 13:return Mv(e,n,a);case 4:return An(n,n.stateNode.containerInfo),r=n.pendingProps,e===null?n.child=gr(n,null,r,a):Yn(e,n,r,a),n.child;case 11:return dv(e,n,n.type,n.pendingProps,a);case 7:return r=n.pendingProps,no(e,n),Yn(e,n,r,a),n.child;case 8:return Yn(e,n,n.pendingProps.children,a),n.child;case 12:return Yn(e,n,n.pendingProps.children,a),n.child;case 10:return Tv(e,n,a);case 9:return c=n.type._context,r=n.pendingProps.children,fr(n),c=oi(c),r=r(c),n.flags|=1,Yn(e,n,r,a),n.child;case 14:return pv(e,n,n.type,n.pendingProps,a);case 15:return mv(e,n,n.type,n.pendingProps,a);case 19:return ad(e,n,a);case 31:return $M(e,n,a);case 22:return gv(e,n,a,n.pendingProps);case 24:return fr(n),r=oi(Gn),e===null?(c=Mh(),c===null&&(c=Sn,f=Sh(),c.pooledCache=f,f.refCount++,f!==null&&(c.pooledCacheLanes|=a),c=f),n.memoizedState={parent:r,cache:c},bh(n),Es(n,Gn,c)):((e.lanes&a)!==0&&(Th(e,n),El(n,null,null,a),Ml()),c=e.memoizedState,f=n.memoizedState,c.parent!==r?(c={parent:r,cache:r},n.memoizedState=c,n.lanes===0&&(n.memoizedState=n.updateQueue.baseState=c),Es(n,Gn,r)):(r=f.cache,Es(n,Gn,r),r!==c.cache&&xh(n,[Gn],a,!0))),Yn(e,n,n.pendingProps.children,a),n.child;case 30:return n.stateNode===null&&(n.stateNode={autoName:null,paired:null,clones:null,ref:null}),r=n.pendingProps,r.name!=null&&r.name!=="auto"?n.flags|=e===null?18882560:18874368:Ie&&Bc(n),e!==null&&e.memoizedProps.name!==r.name?n.flags|=4194816:no(e,n),Yn(e,n,r.children,a),n.child;case 29:throw n.pendingProps}throw Error(s(156,n.tag))}function es(e){e.flags|=4}function rd(e,n,a,r,c){var f;if((f=(e.mode&32)!==0)&&(f=a===null?ex(n,r):ex(n,r)&&(r.src!==a.src||r.srcSet!==a.srcSet)),f){if(e.flags|=16777216,(c&335544128)===c)if(e.stateNode.complete)e.flags|=8192;else if(o_())e.flags|=8192;else throw mr=qc,Eh}else e.flags&=-16777217}function Rv(e,n){if(n.type!=="stylesheet"||(n.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!nx(n))if(o_())e.flags|=8192;else throw mr=qc,Eh}function uu(e,n){n!==null&&(e.flags|=4),e.flags&16384&&(n=e.tag!==22?zn():536870912,e.lanes|=n,oo|=n)}function Cl(e,n){if(!Ie)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,r=null;a!==null;)a.alternate!==null&&(r=a),a=a.sibling;r===null?n||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null;break;default:for(n=e.tail,a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e.tail=null:a.sibling=null}}function En(e){var n=e.alternate!==null&&e.alternate.child===e.child,a=0,r=0;if(n)for(var c=e.child;c!==null;)a|=c.lanes|c.childLanes,r|=c.subtreeFlags&1206910976,r|=c.flags&1206910976,c.return=e,c=c.sibling;else for(c=e.child;c!==null;)a|=c.lanes|c.childLanes,r|=c.subtreeFlags,r|=c.flags,c.return=e,c=c.sibling;return e.subtreeFlags|=r,e.childLanes=a,n}function nE(e,n,a){var r=n.pendingProps;switch(mh(n),n.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return En(n),null;case 1:return En(n),null;case 3:return a=n.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),n.memoizedState.cache!==r&&(n.flags|=2048),Qa(Gn),j(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Kr(n)?es(n):e===null||e.memoizedState.isDehydrated&&(n.flags&256)===0||(n.flags|=1024,vh())),En(n),null;case 26:var c=n.type,f=n.memoizedState;return e===null?(es(n),f!==null?(En(n),Rv(n,f)):(En(n),rd(n,c,null,r,a))):f?f!==e.memoizedState?(es(n),En(n),Rv(n,f)):(En(n),n.flags&=-16777217):(e=e.memoizedProps,e!==r&&es(n),En(n),rd(n,c,e,r,a)),null;case 27:if(Ye(n),a=vn.current,c=n.type,e!==null&&n.stateNode!=null)e.memoizedProps!==r&&es(n);else{if(!r){if(n.stateNode===null)throw Error(s(166));return En(n),n.subtreeFlags&=-33554433,null}e=gn.current,Kr(n)?sg(n):(e=Y_(c,r,a),n.stateNode=e,es(n))}return En(n),n.subtreeFlags&=-33554433,null;case 5:if(Ye(n),c=n.type,e!==null&&n.stateNode!=null)e.memoizedProps!==r&&es(n);else{if(!r){if(n.stateNode===null)throw Error(s(166));return En(n),n.subtreeFlags&=-33554433,null}if(f=gn.current,Kr(n))sg(n);else{var v=Hl(vn.current);switch(f){case 1:f=v.createElementNS("http://www.w3.org/2000/svg",c);break;case 2:f=v.createElementNS("http://www.w3.org/1998/Math/MathML",c);break;default:switch(c){case"svg":f=v.createElementNS("http://www.w3.org/2000/svg",c);break;case"math":f=v.createElementNS("http://www.w3.org/1998/Math/MathML",c);break;case"script":f=v.createElement("div"),f.innerHTML="<script><\/script>",f=f.removeChild(f.firstChild);break;case"select":f=typeof r.is=="string"?v.createElement("select",{is:r.is}):v.createElement("select"),r.multiple?f.multiple=!0:r.size&&(f.size=r.size);break;default:f=typeof r.is=="string"?v.createElement(c,{is:r.is}):v.createElement(c)}}f[$e]=n,f[Rn]=r;t:for(v=n.child;v!==null;){if(v.tag===5||v.tag===6)f.appendChild(v.stateNode);else if(v.tag!==4&&v.tag!==27&&v.child!==null){v.child.return=v,v=v.child;continue}if(v===n)break t;for(;v.sibling===null;){if(v.return===null||v.return===n)break t;v=v.return}v.sibling.return=v.return,v=v.sibling}n.stateNode=f;t:switch(fi(f,c,r),c){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break t;case"img":r=!0;break t;default:r=!1}r&&es(n)}}return En(n),n.subtreeFlags&=-33554433,rd(n,n.type,e===null?null:e.memoizedProps,n.pendingProps,a),null;case 6:if(e&&n.stateNode!=null)e.memoizedProps!==r&&es(n);else{if(typeof r!="string"&&n.stateNode===null)throw Error(s(166));if(e=vn.current,Kr(n)){if(e=n.stateNode,a=n.memoizedProps,r=null,c=ei,c!==null)switch(c.tag){case 27:case 5:r=c.memoizedProps}e[$e]=n,e=!!(e.nodeValue===a||r!==null&&r.suppressHydrationWarning===!0||A_(e.nodeValue,a)),e||Ms(n,!0)}else e=Hl(e).createTextNode(r),e[$e]=n,n.stateNode=e}return En(n),null;case 31:if(a=n.memoizedState,e===null||e.memoizedState!==null){if(r=Kr(n),a!==null){if(e===null){if(!r)throw Error(s(318));if(e=n.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(557));e[$e]=n}else lr(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;En(n),e=!1}else a=vh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return n.flags&256?(Hi(n),n):(Hi(n),null);if((n.flags&128)!==0)throw Error(s(558))}return En(n),null;case 13:if(r=n.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(c=Kr(n),r!==null&&r.dehydrated!==null){if(e===null){if(!c)throw Error(s(318));if(c=n.memoizedState,c=c!==null?c.dehydrated:null,!c)throw Error(s(317));c[$e]=n}else lr(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;En(n),c=!1}else c=vh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=c),c=!0;if(!c)return n.flags&256?(Hi(n),n):(Hi(n),null)}return Hi(n),(n.flags&128)!==0?(n.lanes=a,n):(a=r!==null,e=e!==null&&e.memoizedState!==null,a&&(r=n.child,c=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(c=r.alternate.memoizedState.cachePool.pool),f=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(f=r.memoizedState.cachePool.pool),f!==c&&(r.flags|=2048)),a!==e&&a&&(n.child.flags|=8192),uu(n,n.updateQueue),En(n),null);case 4:return j(),e===null&&Gd(n.stateNode.containerInfo),n.flags|=67108864,En(n),null;case 10:return Qa(n.type),En(n),null;case 19:if(Dh(n),r=n.memoizedState,r===null)return En(n),null;if(c=(n.flags&128)!==0,f=r.rendering,f===null)if(c)Cl(r,!1);else{if(Pn!==0||e!==null&&(e.flags&128)!==0)for(e=n.child;e!==null;){if(f=Kc(e),f!==null){for(n.flags|=128,Cl(r,!1),e=f.updateQueue,n.updateQueue=e,uu(n,e),n.subtreeFlags=0,e=a,a=n.child;a!==null;)tg(a,e),a=a.sibling;return bl(n,ci.current&1|2),Ie&&Ka(n,r.treeForkCount),n.child}e=e.sibling}r.tail!==null&&mt()>Mu&&(n.flags|=128,c=!0,Cl(r,!1),n.lanes=4194304)}else{if(!c)if(e=Kc(f),e!==null){if(n.flags|=128,c=!0,e=e.updateQueue,n.updateQueue=e,uu(n,e),Cl(r,!0),r.tail===null&&r.tailMode!=="collapsed"&&r.tailMode!=="visible"&&!f.alternate&&!Ie)return En(n),null}else 2*mt()-r.renderingStartTime>Mu&&a!==536870912&&(n.flags|=128,c=!0,Cl(r,!1),n.lanes=4194304);r.isBackwards?(f.sibling=n.child,n.child=f):(e=r.last,e!==null?e.sibling=f:n.child=f,r.last=f)}if(r.tail!==null){e=r.tail;t:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break t}a=a.sibling}a=!0}return r.rendering=e,r.tail=e.sibling,r.renderingStartTime=mt(),e.sibling=null,f=ci.current,f=c?f&1|2:f&1,r.tailMode==="visible"||r.tailMode==="collapsed"||!a||Ie?bl(n,f):(a=f,re(li,n),re(ci,a),mi===null&&(mi=n)),Ie&&Ka(n,r.treeForkCount),e}return En(n),null;case 22:case 23:return Hi(n),Ch(),r=n.memoizedState!==null,e!==null?e.memoizedState!==null!==r&&(n.flags|=8192):r&&(n.flags|=8192),r?(a&536870912)!==0&&(n.flags&128)===0&&(En(n),n.subtreeFlags&6&&(n.flags|=8192)):En(n),a=n.updateQueue,a!==null&&uu(n,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),r=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(r=n.memoizedState.cachePool.pool),r!==a&&(n.flags|=2048),e!==null&&ze(dr),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),n.memoizedState.cache!==a&&(n.flags|=2048),Qa(Gn),En(n),null;case 25:return null;case 30:return n.flags|=33554432,En(n),null}throw Error(s(156,n.tag))}function iE(e,n){switch(mh(n),n.tag){case 1:return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 3:return Qa(Gn),j(),e=n.flags,(e&65536)!==0&&(e&128)===0?(n.flags=e&-65537|128,n):null;case 26:case 27:case 5:return Ye(n),null;case 31:if(n.memoizedState!==null){if(Hi(n),n.alternate===null)throw Error(s(340));lr()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 13:if(Hi(n),e=n.memoizedState,e!==null&&e.dehydrated!==null){if(n.alternate===null)throw Error(s(340));lr()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 19:return Dh(n),e=n.flags,e&65536?(n.flags=e&-65537|128,e=n.memoizedState,e!==null&&(e.rendering=null,e.tail=null),n.flags|=4,n):null;case 4:return j(),null;case 10:return Qa(n.type),null;case 22:case 23:return Hi(n),Ch(),e!==null&&ze(dr),e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 24:return Qa(Gn),null;case 25:return null;default:return null}}function wv(e,n){switch(mh(n),n.tag){case 3:Qa(Gn),j();break;case 26:case 27:case 5:Ye(n);break;case 4:j();break;case 31:n.memoizedState!==null&&Hi(n);break;case 13:Hi(n);break;case 19:Dh(n);break;case 10:Qa(n.type);break;case 22:case 23:Hi(n),Ch(),e!==null&&ze(dr);break;case 24:Qa(Gn)}}function Nl(e,n){try{var a=n.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var c=r.next;a=c;do{if((a.tag&e)===e){r=void 0;var f=a.create,v=a.inst;r=f(),v.destroy=r}a=a.next}while(a!==c)}}catch(w){un(n,n.return,w)}}function Ds(e,n,a){try{var r=n.updateQueue,c=r!==null?r.lastEffect:null;if(c!==null){var f=c.next;r=f;do{if((r.tag&e)===e){var v=r.inst,w=v.destroy;if(w!==void 0){v.destroy=void 0,c=n;var B=a,et=w;try{et()}catch(ft){un(c,B,ft)}}}r=r.next}while(r!==f)}}catch(ft){un(n,n.return,ft)}}function Cv(e){var n=e.updateQueue;if(n!==null){var a=e.stateNode;try{_g(n,a)}catch(r){un(e,e.return,r)}}}function Nv(e,n,a){a.props=_r(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(r){un(e,n,r)}}function Ca(e,n){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:var c=e.stateNode,f=Wa(e.memoizedProps,c);(c.ref===null||c.ref.name!==f)&&(c.ref=z_(f)),r=c.ref;break;case 7:if(e.stateNode===null){var v=new qi(e);g(e.child,!1,YE,v,void 0,void 0),e.stateNode=v}r=e.stateNode;break;default:r=e.stateNode}typeof a=="function"?e.refCleanup=a(r):a.current=r}}catch(w){un(e,n,w)}}function ui(e,n){var a=e.ref,r=e.refCleanup;if(a!==null)if(typeof r=="function")try{r()}catch(c){un(e,n,c)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(c){un(e,n,c)}else a.current=null}function fu(e,n){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&n!==null)for(var a=0;a<n.length;a++)X_(e.stateNode,n[a])}function Dv(e){for(var n=e.return;n!==null&&(ld(n)&&X_(e.stateNode,n.stateNode),!od(n));)n=n.return}function Dl(e){for(var n=e.return;n!==null&&(ld(n)&&ZE(e.stateNode,n.stateNode),!od(n));)n=n.return}function od(e){return e.tag===5||e.tag===3||e.tag===27}function ld(e){return e&&e.tag===7&&e.stateNode!==null}function cd(e){var n=e.type,a=e.memoizedProps,r=e.stateNode;try{t:switch(n){case"button":case"input":case"select":case"textarea":a.autoFocus&&r.focus();break t;case"img":a.src?r.src=a.src:a.srcSet&&(r.srcset=a.srcSet)}}catch(c){un(e,e.return,c)}}function ud(e,n,a){try{var r=e.stateNode;CE(r,e.type,a,n),r[Rn]=n}catch(c){un(e,e.return,c)}}function Lv(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Bs(e.type)||e.tag===4}function fd(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||Lv(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Bs(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function hd(e,n,a,r){var c=e.tag;if(c===5||c===6)c=e.stateNode,n?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(c,n):(n=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,n.appendChild(c),a=a._reactRootContainer,a!=null||n.onclick!==null||(n.onclick=Aa)),fu(e,r),ge=!0;else if(c!==4&&(c===27&&(fu(e,r),r=null,Bs(e.type)&&(a=e.stateNode,n=null)),e=e.child,e!==null))for(hd(e,n,a,r),e=e.sibling;e!==null;)hd(e,n,a,r),e=e.sibling}function hu(e,n,a,r){var c=e.tag;if(c===5||c===6)c=e.stateNode,n?a.insertBefore(c,n):a.appendChild(c),fu(e,r),ge=!0;else if(c!==4&&(c===27&&(fu(e,r),r=null,Bs(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(hu(e,n,a,r),e=e.sibling;e!==null;)hu(e,n,a,r),e=e.sibling}function Uv(e){var n=e.stateNode,a=e.memoizedProps;try{for(var r=e.type,c=n.attributes;c.length;)n.removeAttributeNode(c[0]);fi(n,r,a),n[$e]=e,n[Rn]=a}catch(f){un(e,e.return,f)}}var du=!1,Gi=null;function Ov(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(du=!0)}var Na=null;function Pv(){var e=Na;return Na=null,e}var Di=0;function io(e,n,a,r,c){return Di=0,Iv(e.child,n,a,r,c)}function Iv(e,n,a,r,c){for(var f=!1;e!==null;){if(e.tag===5){var v=e.stateNode;if(r!==null){var w=Kd(v);r.push(w),w.view&&(f=!0)}else f||Kd(v).view&&(f=!0);du=!0,P_(v,Di===0?n:n+"_"+Di,a),Di++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&c||Iv(e.child,n,a,r,c)&&(f=!0));e=e.sibling}return f}function Da(e,n){for(;e!==null;)e.tag===5?I_(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&n||Da(e.child,n)),e=e.sibling}function pu(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(pu(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var n=e.memoizedProps;if(n.name==null||n.name==="auto")throw Error(s(544));var a=n.name;n=Ya(n.default,n.share),n!=="none"&&(io(e,a,n,null,!1)||Da(e.child,!1))}e=e.sibling}}function dd(e,n){if(e.tag===30){var a=e.stateNode,r=e.memoizedProps,c=Wa(r,a),f=Ya(r.default,a.paired?r.share:r.enter);f!=="none"?io(e,c,f,null,!1)?(pu(e),a.paired||n||fo(e,r.onEnter)):Da(e.child,!1):pu(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)dd(e,n),e=e.sibling;else pu(e)}function pd(e){if(Gi!==null&&Gi.size!==0){var n=Gi;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,r=a.name;if(r!=null&&r!=="auto"){var c=n.get(r);if(c!==void 0){var f=Ya(a.default,a.share);if(f!=="none"&&(io(e,r,f,null,!1)?(f=e.stateNode,c.paired=f,f.paired=c,fo(e,a.onShare)):Da(e.child,!1)),n.delete(r),n.size===0)break}}}pd(e)}e=e.sibling}}}function md(e){if(e.tag===30){var n=e.memoizedProps,a=Wa(n,e.stateNode),r=Gi!==null?Gi.get(a):void 0,c=Ya(n.default,r!==void 0?n.share:n.exit);c!=="none"&&(io(e,a,c,null,!1)?r!==void 0?(c=e.stateNode,r.paired=c,c.paired=r,Gi.delete(a),fo(e,n.onShare)):fo(e,n.onExit):Da(e.child,!1)),Gi!==null&&pd(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)md(e),e=e.sibling;else Gi!==null&&pd(e)}function zv(e){for(e=e.child;e!==null;){if(e.tag===30){var n=e.memoizedProps,a=Wa(n,e.stateNode);n=Ya(n.default,n.update),e.flags&=-5,n!=="none"&&io(e,a,n,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&zv(e);e=e.sibling}}function gd(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var n=e.stateNode;n.paired!==null&&(n.paired=null,Da(e.child,!1))}gd(e)}e=e.sibling}}function mu(e){if(e.tag===30)e.stateNode.paired=null,Da(e.child,!1),gd(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)mu(e),e=e.sibling;else gd(e)}function Bv(e){for(e=e.child;e!==null;)e.tag===30?Da(e.child,!1):(e.subtreeFlags&33554432)!==0&&Bv(e),e=e.sibling}function vd(e,n,a,r,c,f,v){for(var w=!1;n!==null;){if(n.tag===5){var B=n.stateNode;if(f!==null&&Di<f.length){var et=f[Di],ft=Kd(B);(et.view||ft.view)&&(w=!0);var Et;if(Et=(e.flags&4)===0)if(ft.clip)Et=!0;else{Et=et.rect;var Q=ft.rect;Et=Et.y!==Q.y||Et.x!==Q.x||Et.height!==Q.height||Et.width!==Q.width}Et&&(e.flags|=4),ft.abs?ft=!et.abs:(et=et.rect,ft=ft.rect,ft=et.height!==ft.height||et.width!==ft.width),ft&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&P_(B,Di===0?a:a+"_"+Di,c),w&&(e.flags&4)!==0||(Na===null&&(Na=[]),Na.push(B,Di===0?r:r+"_"+Di,n.memoizedProps)),Di++}else(n.tag!==22||n.memoizedState===null)&&(n.tag===30&&v?e.flags|=n.flags&32:vd(e,n.child,a,r,c,f,v)&&(w=!0));n=n.sibling}return w}function Fv(e,n){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,r=e.stateNode,c=Wa(a,r),f=Ya(a.default,a.update),v;v=e.memoizedState,e.memoizedState=null,r=e;var w=e.child;Di=0,c=vd(r,w,c,c,f,v,!1),(e.flags&4)!==0&&c&&fo(e,a.onUpdate)}else(e.subtreeFlags&33554432)!==0&&Fv(e);e=e.sibling}}var ni=!1,on=!1,La=!1,_d=!1,Hv=typeof WeakSet=="function"?WeakSet:Set,ii=null,Ua=!1,Ll=!1,gu=!1,xd=!1;function aE(e,n,a){if(e=e.containerInfo,kd=Mo,e=k0(e),sh(e)){if("selectionStart"in e)var r={start:e.selectionStart,end:e.selectionEnd};else t:{r=(r=e.ownerDocument)&&r.defaultView||window;var c=r.getSelection&&r.getSelection();if(c&&c.rangeCount!==0){r=c.anchorNode;var f=c.anchorOffset,v=c.focusNode;c=c.focusOffset;try{r.nodeType,v.nodeType}catch{r=null;break t}var w=0,B=-1,et=-1,ft=0,Et=0,Q=e,ct=null;e:for(;;){for(var Yt;Q!==r||f!==0&&Q.nodeType!==3||(B=w+f),Q!==v||c!==0&&Q.nodeType!==3||(et=w+c),Q.nodeType===3&&(w+=Q.nodeValue.length),(Yt=Q.firstChild)!==null;)ct=Q,Q=Yt;for(;;){if(Q===e)break e;if(ct===r&&++ft===f&&(B=w),ct===v&&++Et===c&&(et=w),(Yt=Q.nextSibling)!==null)break;Q=ct,ct=Q.parentNode}Q=Yt}r=B===-1||et===-1?null:{start:B,end:et}}else r=null}r=r||{start:0,end:0}}else r=null;for(qd={focusedElem:e,selectionRange:r},Mo=!1,a=(a&335544064)===a,ii=n,n=a?9270:1024;ii!==null;){if(e=ii,a&&(r=e.deletions,r!==null))for(f=0;f<r.length;f++)a&&md(r[f]);if(e.alternate===null&&(e.flags&2)!==0)a&&Ov(e),vu(a);else{if(e.tag===22){if(r=e.alternate,e.memoizedState!==null){r!==null&&r.memoizedState===null&&a&&md(r),vu(a);continue}else if(r!==null&&r.memoizedState!==null){a&&Ov(e),vu(a);continue}}r=e.child,(e.subtreeFlags&n)!==0&&r!==null?(r.return=e,ii=r):(a&&zv(e),vu(a))}}Gi=null}function vu(e){for(;ii!==null;){var n=ii,a=e,r=n.alternate,c=n.flags;switch(n.tag){case 0:case 11:case 15:break;case 1:if((c&1024)!==0&&r!==null){a=void 0,c=r.memoizedProps,r=r.memoizedState;var f=n.stateNode;try{var v=_r(n.type,c);a=f.getSnapshotBeforeUpdate(v,r),f.__reactInternalSnapshotBeforeUpdate=a}catch(w){un(n,n.return,w)}}break;case 3:if((c&1024)!==0){if(r=n.stateNode.containerInfo,a=r.nodeType,a===9)Jd(r);else if(a===1)switch(r.nodeName){case"HEAD":case"HTML":case"BODY":Jd(r);break;default:r.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&r!==null&&(a=Wa(r.memoizedProps,r.stateNode),c=n.memoizedProps,c=Ya(c.default,c.update),c!=="none"&&io(r,a,c,r.memoizedState=[],!0));break;default:if((c&1024)!==0)throw Error(s(163))}if(r=n.sibling,r!==null){r.return=n.return,ii=r;break}ii=n.return}}function Gv(e,n,a){var r=a.flags;switch(a.tag){case 0:case 11:case 15:Oa(e,a),r&4&&Nl(5,a);break;case 1:if(Oa(e,a),r&4)if(e=a.stateNode,n===null)try{e.componentDidMount()}catch(v){un(a,a.return,v)}else{var c=_r(a.type,n.memoizedProps);n=n.memoizedState;try{e.componentDidUpdate(c,n,e.__reactInternalSnapshotBeforeUpdate)}catch(v){un(a,a.return,v)}}r&64&&Cv(a),r&512&&Ca(a,a.return);break;case 3:if(Oa(e,a),r&64&&(e=a.updateQueue,e!==null)){if(n=null,a.child!==null)switch(a.child.tag){case 27:case 5:n=a.child.stateNode;break;case 1:n=a.child.stateNode}try{_g(e,n)}catch(v){un(a,a.return,v)}}break;case 27:n===null&&r&4&&Uv(a);case 26:case 5:Oa(e,a),n===null&&r&4&&cd(a),r&512&&Ca(a,a.return);break;case 12:Oa(e,a);break;case 31:Oa(e,a),r&4&&qv(e,a);break;case 13:Oa(e,a),r&4&&Wv(e,a),r&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=gE.bind(null,a),QE(e,a))));break;case 22:if(r=a.memoizedState!==null||ni,!r){var f=n!==null&&n.memoizedState!==null||on;n=ni,c=on,ni=r,(on=f)&&!c?(r=2,(a.subtreeFlags&8772)!==0&&(r|=1),pa(e,a,r)):Oa(e,a),ni=n,on=c}break;case 30:Oa(e,a),r&512&&Ca(a,a.return);break;case 7:r&512&&Ca(a,a.return);default:Oa(e,a)}}function Sd(e,n){for(e=e.child;e!==null;)Vv(e,n),e=e.sibling}function Vv(e,n){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(n){var r=a.style;typeof r.setProperty=="function"?r.setProperty("display","none","important"):r.display="none"}else{var c=e.stateNode,f=e.memoizedProps.style,v=f!=null&&f.hasOwnProperty("display")?f.display:null;c.style.display=v==null||typeof v=="boolean"?"":(""+v).trim()}}catch(B){un(e,e.return,B)}yd(e,n);break;case 6:try{e.stateNode.nodeValue=n?"":e.memoizedProps,ge=!0}catch(B){un(e,e.return,B)}break;case 18:try{var w=e.stateNode;n?O_(w,!0):O_(e.stateNode,!1)}catch(B){un(e,e.return,B)}break;case 22:case 23:e.memoizedState===null&&Sd(e,n);break;default:Sd(e,n)}}function yd(e,n){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){t:{var a=e,r=n;switch(a.tag){case 4:Vv(a,r);break t;case 22:a.memoizedState===null&&yd(a,r);break t;default:yd(a,r)}}e=e.sibling}}function Xv(e){var n=e.alternate;n!==null&&(e.alternate=null,Xv(n)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(n=e.stateNode,n!==null&&It(n)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var wn=null,Li=!1;function ha(e,n,a){for(a=a.child;a!==null;)kv(e,n,a),a=a.sibling}function kv(e,n,a){if(Xt&&typeof Xt.onCommitFiberUnmount=="function")try{Xt.onCommitFiberUnmount(Rt,a)}catch{}switch(a.tag){case 26:on||ui(a,n),ha(e,n,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!on&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:on||ui(a,n),Dl(a);var r=wn,c=Li;Bs(a.type)&&(wn=a.stateNode,Li=!1),ha(e,n,a),Z_(a.stateNode,a.type,a.memoizedProps),wn=r,Li=c;break;case 5:on||ui(a,n),Dl(a);case 6:if(a.tag===6&&Dl(a),r=wn,c=Li,wn=null,ha(e,n,a),wn=r,Li=c,wn!==null)if(Li)try{(wn.nodeType===9?wn.body:wn.nodeName==="HTML"?wn.ownerDocument.body:wn).removeChild(a.stateNode),ge=!0}catch(f){un(a,n,f)}else try{wn.removeChild(a.stateNode),ge=!0}catch(f){un(a,n,f)}break;case 18:wn!==null&&(Li?(e=wn,U_(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),Eo(e)):U_(wn,a.stateNode));break;case 4:r=wn,c=Li,wn=a.stateNode.containerInfo,Li=!0,ha(e,n,a),wn=r,Li=c;break;case 0:case 11:case 14:case 15:Ds(2,a,n),on||Ds(4,a,n),ha(e,n,a);break;case 1:on||(ui(a,n),r=a.stateNode,typeof r.componentWillUnmount=="function"&&Nv(a,n,r)),ha(e,n,a);break;case 21:ha(e,n,a);break;case 22:on=(r=on)||a.memoizedState!==null,ha(e,n,a),on=r;break;case 30:ui(a,n),ha(e,n,a);break;case 7:on||ui(a,n),ha(e,n,a);break;default:ha(e,n,a)}}function qv(e,n){if(n.memoizedState===null&&(e=n.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Eo(e)}catch(a){un(n,n.return,a)}}}function Wv(e,n){if(n.memoizedState===null&&(e=n.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Eo(e)}catch(a){un(n,n.return,a)}}function sE(e){switch(e.tag){case 31:case 13:case 19:var n=e.stateNode;return n===null&&(n=e.stateNode=new Hv),n;case 22:return e=e.stateNode,n=e._retryCache,n===null&&(n=e._retryCache=new Hv),n;default:throw Error(s(435,e.tag))}}function _u(e,n){var a=sE(e);n.forEach(function(r){if(!a.has(r)){a.add(r);var c=vE.bind(null,e,r);r.then(c,c)}})}function yi(e,n,a){var r=n.deletions;if(r!==null)for(var c=0;c<r.length;c++){var f=r[c],v=e,w=n,B=w;t:for(;B!==null;){switch(B.tag){case 27:if(Bs(B.type)){wn=B.stateNode,Li=!1;break t}break;case 5:wn=B.stateNode,Li=!1;break t;case 3:case 4:wn=B.stateNode.containerInfo,Li=!0;break t}B=B.return}if(wn===null)throw Error(s(160));kv(v,w,f),wn=null,Li=!1,v=f.alternate,v!==null&&(v.return=null),f.return=null}if(n.subtreeFlags&13886)for(n=n.child;n!==null;)Yv(n,e,a),n=n.sibling}var da=null;function Yv(e,n,a){var r=e.alternate,c=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(c&4&&(r=e.updateQueue,r=r!==null?r.events:null,r!==null))for(var f=0;f<r.length;f++){var v=r[f];v.ref.impl=v.nextImpl}yi(n,e,a),Mi(e),c&4&&(Ds(3,e,e.return),Nl(3,e),Ds(5,e,e.return));break;case 1:yi(n,e,a),Mi(e),c&512&&(on||r===null||ui(r,r.return)),c&64&&ni&&(e=e.updateQueue,e!==null&&(n=e.callbacks,n!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?n:a.concat(n))));break;case 26:if(f=da,yi(n,e,a),Mi(e),c&512&&(on||r===null||ui(r,r.return)),c&4)if(c=r!==null?r.memoizedState:null,a=e.memoizedState,r===null)if(a===null)if(e.stateNode===null)if(ni)e.stateNode=N_(e.type,e.memoizedProps,n.containerInfo,e);else{t:{n=e.type,a=e.memoizedProps,c=f.ownerDocument||f;e:switch(n){case"title":r=c.getElementsByTagName("title")[0],(!r||r[Ut]||r[$e]||r.namespaceURI==="http://www.w3.org/2000/svg"||r.hasAttribute("itemprop"))&&(r=c.createElement(n),c.head.insertBefore(r,c.querySelector("head > title"))),fi(r,n,a),r[$e]=e,kt(r),n=r;break t;case"link":if(f=tx("link","href",c).get(n+(a.href||""))){for(v=0;v<f.length;v++)if(r=f[v],r.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&r.getAttribute("rel")===(a.rel==null?null:a.rel)&&r.getAttribute("title")===(a.title==null?null:a.title)&&r.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){f.splice(v,1);break e}}r=c.createElement(n),fi(r,n,a),c.head.appendChild(r);break;case"meta":if(f=tx("meta","content",c).get(n+(a.content||""))){for(v=0;v<f.length;v++)if(r=f[v],r.getAttribute("content")===(a.content==null?null:""+a.content)&&r.getAttribute("name")===(a.name==null?null:a.name)&&r.getAttribute("property")===(a.property==null?null:a.property)&&r.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&r.getAttribute("charset")===(a.charSet==null?null:a.charSet)){f.splice(v,1);break e}}r=c.createElement(n),fi(r,n,a),c.head.appendChild(r);break;default:throw Error(s(468,n))}r[$e]=e,kt(r),n=r}e.stateNode=n}else ni||sp(f,e.type,e.stateNode);else e.stateNode=$_(f,a,e.memoizedProps);else c!==a?(c===null?(n=r.stateNode,n===null||on||n.parentNode.removeChild(n)):c.count--,a===null?ni||sp(f,e.type,e.stateNode):$_(f,a,e.memoizedProps)):a===null&&e.stateNode!==null&&ud(e,e.memoizedProps,r.memoizedProps);break;case 27:yi(n,e,a),Mi(e),c&512&&(on||r===null||ui(r,r.return)),r!==null&&c&4&&ud(e,e.memoizedProps,r.memoizedProps);break;case 5:if(f=La,La=!1,yi(n,e,a),La=f,Mi(e),c&512&&(on||r===null||ui(r,r.return)),e.flags&32){n=e.stateNode;try{Tn(n,""),ge=!0}catch(ft){un(e,e.return,ft)}}c&4&&e.stateNode!=null&&(n=e.memoizedProps,ud(e,n,r!==null?r.memoizedProps:n)),c&1024&&(_d=!0);break;case 6:if(yi(n,e,a),Mi(e),c&4){if(e.stateNode===null)throw Error(s(162));n=e.memoizedProps,a=e.stateNode;try{a.nodeValue=n,ge=!0}catch(ft){un(e,e.return,ft)}}break;case 3:if(ge=!1,Uu=null,f=da,da=Gl(n.containerInfo),yi(n,e,a),da=f,Mi(e),c&4&&r!==null&&r.memoizedState.isDehydrated)try{Eo(n.containerInfo)}catch(ft){un(e,e.return,ft)}_d&&(_d=!1,Zv(e)),ge=!1;break;case 4:c=La,La=ni,r=Ta(),f=da,da=Gl(e.stateNode.containerInfo),yi(n,e,a),Mi(e),da=f,ge&&Ll&&(gu=!0),ge=r,La=c;break;case 12:yi(n,e,a),Mi(e);break;case 31:yi(n,e,a),Mi(e),c&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,_u(e,n)));break;case 13:yi(n,e,a),Mi(e),e.child.flags&8192&&e.memoizedState!==null!=(r!==null&&r.memoizedState!==null)&&(yu=mt()),c&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,_u(e,n)));break;case 22:f=e.memoizedState!==null,v=r!==null&&r.memoizedState!==null;var w=ni,B=on,et=La;ni=w||f,La=et||f,on=B||v,yi(n,e,a),on=B,La=et,ni=w,Mi(e),c&8192&&(n=e.stateNode,n._visibility=f?n._visibility&-2:n._visibility|1,!f||r===null||v||ni||on||(n=v||on,a=ni,r=on,ni=f||ni,on=n,Ls(e,2),ni=a,on=r),!f&&La||Sd(e,f)),c&4&&(n=e.updateQueue,n!==null&&(a=n.retryQueue,a!==null&&(n.retryQueue=null,_u(e,a))));break;case 19:yi(n,e,a),Mi(e),c&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,_u(e,n)));break;case 30:c&512&&(on||r===null||ui(r,r.return)),c=Ta(),f=Ll,v=(a&335544064)===a,w=e.memoizedProps,Ll=v&&Ya(w.default,w.update)!=="none",yi(n,e,a),Mi(e),v&&r!==null&&ge&&(e.flags|=4),Ll=f,ge=c;break;case 21:break;case 7:c&512&&(on||r===null||ui(r,r.return)),r&&r.stateNode!==null&&(r.stateNode._fragmentFiber=e);default:yi(n,e,a),Mi(e)}}function Mi(e){var n=e.flags;if(n&2){try{for(var a,r=e.return;r!==null;){if(Lv(r)){a=r;break}r=r.return}r=null;for(var c=e.return;c!==null;){if(ld(c)){var f=c.stateNode;r===null?r=[f]:r.push(f)}if(od(c))break;c=c.return}var v=r;if(a==null)throw Error(s(160));switch(a.tag){case 27:var w=a.stateNode,B=fd(e);hu(e,B,w,v);break;case 5:var et=a.stateNode;a.flags&32&&(Tn(et,""),a.flags&=-33);var ft=fd(e);hu(e,ft,et,v);break;case 3:case 4:var Et=a.stateNode.containerInfo,Q=fd(e);hd(e,Q,Et,v);break;default:throw Error(s(161))}}catch(ct){un(e,e.return,ct)}e.flags&=-3}n&4096&&(e.flags&=-4097)}function Zv(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var n=e;Zv(n),n.tag===5&&n.flags&1024&&(n=n.stateNode,Mo=!0,n.reset(),Mo=!1),e=e.sibling}}function ao(e,n){if(n.subtreeFlags&9270)for(n=n.child;n!==null;)Kv(n,e),n=n.sibling;else Fv(n)}function Kv(e,n){var a=e.alternate;if(a===null)dd(e,!1);else switch(e.tag){case 3:if(xd=Ua=!1,Pv(),ao(n,e),!Ua&&!gu){if(e=Na,e!==null)for(var r=0;r<e.length;r+=3){a=e[r];var c=e[r+1];I_(a,e[r+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+c+")"})}e=n.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),xd=!0}Na=null;break;case 5:ao(n,e);break;case 4:r=Ua,Ua=!1,ao(n,e),Ua&&(gu=!0),Ua=r;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?dd(e,!1):ao(n,e));break;case 30:r=Ua,c=Pv(),Ua=!1,ao(n,e),Ua&&(e.flags|=4);var f=e.memoizedProps,v=e.stateNode;n=Wa(f,v),v=Wa(a.memoizedProps,v);var w=Ya(f.default,f.update);w==="none"?n=!1:(f=a.memoizedState,a.memoizedState=null,a=e.child,Di=0,n=vd(e,a,n,v,w,f,!0),Di!==(f===null?0:f.length)&&(e.flags|=32)),(e.flags&4)!==0&&n?(fo(e,e.memoizedProps.onUpdate),Na=c):c!==null&&(c.push.apply(c,Na),Na=c),Ua=(e.flags&32)!==0?!0:r;break;default:ao(n,e)}}function Oa(e,n){if(n.subtreeFlags&8772)for(n=n.child;n!==null;)Gv(e,n.alternate,n),n=n.sibling}function Ls(e,n){for(e=e.child;e!==null;){var a=e,r=n;switch(a.tag){case 0:case 11:case 14:case 15:Ds(4,a,a.return),Ls(a,r);break;case 1:ui(a,a.return);var c=a.stateNode;typeof c.componentWillUnmount=="function"&&Nv(a,a.return,c),Ls(a,r);break;case 27:(r&2)!==0&&Z_(a.stateNode,a.type,a.memoizedProps);case 5:ui(a,a.return),a.tag!==5&&a.tag!==27||Dl(a),Ls(a,r);break;case 6:Dl(a);break;case 26:ui(a,a.return),c=a.stateNode,a.memoizedState!==null||c===null||on||c.parentNode.removeChild(c),Ls(a,r);break;case 22:a.memoizedState===null&&Ls(a,r);break;case 30:ui(a,a.return),Ls(a,r);break;case 7:ui(a,a.return);default:Ls(a,r)}e=e.sibling}}function pa(e,n,a){for(a=(n.subtreeFlags&8772)!==0?a:a&-2,n=n.child;n!==null;){var r=n.alternate,c=e,f=n,v=f.flags,w=(a&1)!==0;switch(f.tag){case 0:case 11:case 15:pa(c,f,a),Nl(4,f);break;case 1:if(pa(c,f,a),r=f,c=r.stateNode,typeof c.componentDidMount=="function")try{c.componentDidMount()}catch(ft){un(r,r.return,ft)}if(r=f,c=r.updateQueue,c!==null){var B=r.stateNode;try{var et=c.shared.hiddenCallbacks;if(et!==null)for(c.shared.hiddenCallbacks=null,c=0;c<et.length;c++)vg(et[c],B)}catch(ft){un(r,r.return,ft)}}w&&v&64&&Cv(f),Ca(f,f.return);break;case 27:(a&2)!==0&&Uv(f);case 5:f.tag!==5&&f.tag!==27||Dv(f),pa(c,f,a),w&&r===null&&v&4&&cd(f),Ca(f,f.return);break;case 6:Dv(f);break;case 26:B=f.stateNode,f.memoizedState!==null||B===null||ni||sp(Gl(B.ownerDocument),f.type,B),pa(c,f,a),w&&r===null&&v&4&&cd(f),Ca(f,f.return);break;case 12:pa(c,f,a);break;case 31:pa(c,f,a),w&&v&4&&qv(c,f);break;case 13:pa(c,f,a),w&&v&4&&Wv(c,f);break;case 22:f.memoizedState===null&&pa(c,f,a),Ca(f,f.return);break;case 30:pa(c,f,a),Ca(f,f.return);break;case 7:Ca(f,f.return);default:pa(c,f,a)}n=n.sibling}}function Md(e,n){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(e=n.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&vl(a))}function Ed(e,n){e=null,n.alternate!==null&&(e=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==e&&(n.refCount++,e!=null&&vl(e))}function ia(e,n,a,r){var c=(a&335544064)===a;if(n.subtreeFlags&(c?10262:10256))for(n=n.child;n!==null;)jv(e,n,a,r),n=n.sibling;else c&&Bv(n)}function jv(e,n,a,r){var c=(a&335544064)===a;c&&n.alternate===null&&n.return!==null&&n.return.alternate!==null&&mu(n);var f=n.flags;switch(n.tag){case 0:case 11:case 15:ia(e,n,a,r),f&2048&&Nl(9,n);break;case 1:ia(e,n,a,r);break;case 3:ia(e,n,a,r),c&&xd&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),f&2048&&(f=null,n.alternate!==null&&(f=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==f&&(n.refCount++,f!=null&&vl(f)));break;case 12:if(f&2048){ia(e,n,a,r),f=n.stateNode;try{var v=n.memoizedProps,w=v.id,B=v.onPostCommit;typeof B=="function"&&B(w,n.alternate===null?"mount":"update",f.passiveEffectDuration,-0)}catch(et){un(n,n.return,et)}}else ia(e,n,a,r);break;case 31:ia(e,n,a,r);break;case 13:ia(e,n,a,r);break;case 23:break;case 22:v=n.stateNode,w=n.alternate,n.memoizedState!==null?(c&&w!==null&&w.memoizedState===null&&mu(w),v._visibility&2?ia(e,n,a,r):Ul(e,n)):(c&&w!==null&&w.memoizedState!==null&&mu(n),v._visibility&2?ia(e,n,a,r):(v._visibility|=2,so(e,n,a,r,(n.subtreeFlags&10256)!==0||!1))),f&2048&&Md(w,n);break;case 24:ia(e,n,a,r),f&2048&&Ed(n.alternate,n);break;case 30:c&&(f=n.alternate,f!==null&&(Da(f.child,!0),Da(n.child,!0))),ia(e,n,a,r);break;default:ia(e,n,a,r)}}function so(e,n,a,r,c){for(c=c&&((n.subtreeFlags&10256)!==0||!1),n=n.child;n!==null;){var f=e,v=n,w=a,B=r,et=v.flags;switch(v.tag){case 0:case 11:case 15:so(f,v,w,B,c),Nl(8,v);break;case 23:break;case 22:var ft=v.stateNode;v.memoizedState!==null?ft._visibility&2?so(f,v,w,B,c):Ul(f,v):(ft._visibility|=2,so(f,v,w,B,c)),c&&et&2048&&Md(v.alternate,v);break;case 24:so(f,v,w,B,c),c&&et&2048&&Ed(v.alternate,v);break;default:so(f,v,w,B,c)}n=n.sibling}}function Ul(e,n){if(n.subtreeFlags&10256)for(n=n.child;n!==null;){var a=e,r=n,c=r.flags;switch(r.tag){case 22:Ul(a,r),c&2048&&Md(r.alternate,r);break;case 24:Ul(a,r),c&2048&&Ed(r.alternate,r);break;default:Ul(a,r)}n=n.sibling}}var xr=8192;function Sr(e,n,a){if(e.subtreeFlags&xr)for(e=e.child;e!==null;)Qv(e,n,a),e=e.sibling}function Qv(e,n,a){switch(e.tag){case 26:Sr(e,n,a),e.flags&xr&&(e.memoizedState!==null?fb(a,da,e.memoizedState,e.memoizedProps):(e=e.stateNode,(n&335544128)===n&&ax(a,e)));break;case 5:Sr(e,n,a),e.flags&xr&&(e=e.stateNode,(n&335544128)===n&&ax(a,e));break;case 3:case 4:var r=da;da=Gl(e.stateNode.containerInfo),Sr(e,n,a),da=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=xr,xr=16777216,Sr(e,n,a),xr=r):Sr(e,n,a));break;case 30:if((e.flags&xr)!==0&&(r=e.memoizedProps.name,r!=null&&r!=="auto")){var c=e.stateNode;c.paired=null,Gi===null&&(Gi=new Map),Gi.set(r,c)}Sr(e,n,a);break;default:Sr(e,n,a)}}function Jv(e){var n=e.alternate;if(n!==null&&(e=n.child,e!==null)){n.child=null;do n=e.sibling,e.sibling=null,e=n;while(e!==null)}}function Ol(e){var n=e.deletions;if((e.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var r=n[a];ii=r,t_(r,e)}Jv(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)$v(e),e=e.sibling}function $v(e){switch(e.tag){case 0:case 11:case 15:Ol(e),e.flags&2048&&Ds(9,e,e.return);break;case 3:Ol(e);break;case 12:Ol(e);break;case 22:var n=e.stateNode;e.memoizedState!==null&&n._visibility&2&&(e.return===null||e.return.tag!==13)?(n._visibility&=-3,xu(e)):Ol(e);break;default:Ol(e)}}function xu(e){var n=e.deletions;if((e.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var r=n[a];ii=r,t_(r,e)}Jv(e)}for(e=e.child;e!==null;){switch(n=e,n.tag){case 0:case 11:case 15:Ds(8,n,n.return),xu(n);break;case 22:a=n.stateNode,a._visibility&2&&(a._visibility&=-3,xu(n));break;default:xu(n)}e=e.sibling}}function t_(e,n){for(;ii!==null;){var a=ii;switch(a.tag){case 0:case 11:case 15:Ds(8,a,n);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var r=a.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:vl(a.memoizedState.cache)}if(r=a.child,r!==null)r.return=a,ii=r;else t:for(a=e;ii!==null;){r=ii;var c=r.sibling,f=r.return;if(Xv(r),r===a){ii=null;break t}if(c!==null){c.return=f,ii=c;break t}ii=f}}}var rE={getCacheForType:function(e){var n=oi(Gn),a=n.data.get(e);return a===void 0&&(a=e(),n.data.set(e,a)),a},cacheSignal:function(){return oi(Gn).controller.signal}},oE=typeof WeakMap=="function"?WeakMap:Map,an=0,Sn=null,ke=null,Ke=0,cn=0,Vi=null,Us=!1,ro=!1,bd=!1,ns=0,Pn=0,Os=0,yr=0,Su=0,Xi=0,oo=0,Pl=null,Ui=null,Td=!1,yu=0,e_=0,Mu=1/0,Eu=null,Ps=null,Nn=0,ma=null,Mr=null,Pa=0,Ad=0,Rd=null,n_=null,lo=null,co=null,uo=null,Il=0,bu=null;function ki(){return(an&2)!==0&&Ke!==0?Ke&-Ke:wt.T!==null?zd():ba()}function i_(){if(Xi===0)if((Ke&536870912)===0||Ie){var e=Dt;Dt<<=1,(Dt&3932160)===0&&(Dt=262144),Xi=e}else Xi=536870912;return e=li.current,e!==null&&(e.flags|=32),Xi}function fo(e,n){if(n!=null){var a=e.stateNode,r=a.ref;r===null&&(r=a.ref=z_(Wa(e.memoizedProps,a))),co===null&&(co=[]),co.push(n.bind(null,r))}}function Oi(e,n,a){(e===Sn&&(cn===2||cn===9)||e.cancelPendingCommit!==null)&&(ho(e,0),Is(e,Ke,Xi,!1)),jt(e,a),((an&2)===0||e!==Sn)&&(e===Sn&&((an&2)===0&&(yr|=a),Pn===4&&Is(e,Ke,Xi,!1)),Ia(e))}function a_(e,n,a){if((an&6)!==0)throw Error(s(327));var r=!a&&(n&127)===0&&(n&e.expiredLanes)===0||pe(e,n),c=r?uE(e,n):Cd(e,n,!0),f=r;do{if(c===0){ro&&!r&&Is(e,n,0,!1);break}else{if(a=e.current.alternate,f&&!lE(a)){c=Cd(e,n,!1),f=!1;continue}if(c===2){if(f=n,e.errorRecoveryDisabledLanes&f)var v=0;else v=e.pendingLanes&-536870913,v=v!==0?v:v&536870912?536870912:0;if(v!==0){n=v;t:{var w=e;c=Pl;var B=w.current.memoizedState.isDehydrated;if(B&&(ho(w,v).flags|=256),v=Cd(w,v,!1),v!==2&&v!==6){if(bd&&!B){w.errorRecoveryDisabledLanes|=f,yr|=f,c=4;break t}f=Ui,Ui=c,f!==null&&(Ui===null?Ui=f:Ui.push.apply(Ui,f))}c=v}if(f=!1,c!==2)continue}}if(c===1){ho(e,0),Is(e,n,0,!0);break}t:{switch(r=e,f=c,f){case 0:case 1:throw Error(s(345));case 4:if((n&4194048)!==n&&(n&62914560)!==n)break;case 6:Is(r,n,Xi,!Us);break t;case 2:Ui=null;break;case 3:case 5:break;default:throw Error(s(329))}if((n&62914560)===n&&(c=yu+300-mt(),10<c)){if(Is(r,n,Xi,!Us),xe(r,0,!0)!==0)break t;Pa=n,r.timeoutHandle=Zd(s_.bind(null,r,a,Ui,Eu,Td,n,Xi,yr,oo,Us,f,"Throttled",-0,0),c);break t}s_(r,a,Ui,Eu,Td,n,Xi,yr,oo,Us,f,null,-0,0)}}break}while(!0);Ia(e)}function s_(e,n,a,r,c,f,v,w,B,et,ft,Et,Q,ct){e.timeoutHandle=-1;var Yt=n.subtreeFlags,ne=(f&335544064)===f;if(Et=null,(ne||Yt&8192||(Yt&16785408)===16785408)&&(Et={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Aa},Gi=null,Qv(n,f,Et),ne&&(Yt=Et,ne=e.containerInfo,ne=(ne.nodeType===9?ne:ne.ownerDocument).__reactViewTransition,ne!=null&&(Yt.count++,Yt.waitingForViewTransition=!0,Yt=kl.bind(Yt),ne.finished.then(Yt,Yt))),Yt=(f&62914560)===f?yu-mt():(f&4194048)===f?e_-mt():0,Yt=hb(Et,Yt),Yt!==null)){Pa=f,e.cancelPendingCommit=Yt(d_.bind(null,e,n,f,a,r,c,v,w,B,et,ft,Et,null,Q,ct)),Is(e,f,v,!et);return}d_(e,n,f,a,r,c,v,w,B,et,ft,Et)}function lE(e){for(var n=e;;){var a=n.tag;if((a===0||a===11||a===15)&&n.flags&16384&&(a=n.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var r=0;r<a.length;r++){var c=a[r],f=c.getSnapshot;c=c.value;try{if(!Fi(f(),c))return!1}catch{return!1}}if(a=n.child,n.subtreeFlags&16384&&a!==null)a.return=n,n=a;else{if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function Is(e,n,a,r){n=Re(e,n),n&=~Su,n&=~yr,e.suspendedLanes|=n,e.pingedLanes&=~n,r&&(e.warmLanes|=n),r=e.expirationTimes;for(var c=n;0<c;){var f=31-Zt(c),v=1<<f;r[f]=-1,c&=~v}a!==0&&dn(e,a,n)}function Tu(){return(an&6)===0?(zl(0),!1):!0}function wd(){if(ke!==null){if(cn===0)var e=ke.return;else e=ke,ja=cr=null,Ih(e),Jr=null,Sl=0,e=ke;for(;e!==null;)wv(e.alternate,e),e=e.return;ke=null}}function ho(e,n){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,LE(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Pa=0,wd(),Sn=e,ke=a=Za(e.current,null),Ke=n,cn=0,Vi=null,Us=!1,ro=pe(e,n),bd=!1,oo=Xi=Su=yr=Os=Pn=0,Ui=Pl=null,Td=!1,ns=Re(e,n),Uc(),a}function r_(e,n){De=null,wt.H=au,n===Qr||n===kc?(n=dg(),cn=3):n===Eh?(n=dg(),cn=4):cn=n===Qh?8:n!==null&&typeof n=="object"&&typeof n.then=="function"?6:1,Vi=n,ke===null&&(Pn=1,su(e,$i(n,e.current)))}function o_(){var e=li.current;return e===null?!0:(Ke&4194048)===Ke?mi===null:(Ke&62914560)===Ke||(Ke&536870912)!==0?e===mi:!1}function l_(){var e=wt.H;return wt.H=au,e===null?au:e}function c_(){var e=wt.A;return wt.A=rE,e}function Au(){Pn=4,Us||(Ke&4194048)!==Ke&&li.current!==null||(ro=!0),(Os&134217727)===0&&(yr&134217727)===0||Sn===null||Is(Sn,Ke,Xi,!1)}function Cd(e,n,a){var r=an;an|=2;var c=l_(),f=c_();(Sn!==e||Ke!==n)&&(Eu=null,ho(e,n)),n=!1;var v=Pn;t:do try{if(cn!==0&&ke!==null){var w=ke,B=Vi;switch(cn){case 8:wd(),v=6;break t;case 3:case 2:case 9:case 6:li.current===null&&(n=!0);var et=cn;if(cn=0,Vi=null,po(e,w,B,et),a&&ro){v=0;break t}break;default:et=cn,cn=0,Vi=null,po(e,w,B,et)}}cE(),v=Pn;break}catch(ft){r_(e,ft)}while(!0);return n&&e.shellSuspendCounter++,ja=cr=null,an=r,wt.H=c,wt.A=f,ke===null&&(Sn=null,Ke=0,Uc()),v}function cE(){for(;ke!==null;)u_(ke)}function uE(e,n){var a=an;an|=2;var r=l_(),c=c_();Sn!==e||Ke!==n?(Eu=null,Mu=mt()+500,ho(e,n)):ro=pe(e,n);t:do try{if(cn!==0&&ke!==null){n=ke;var f=Vi;e:switch(cn){case 1:cn=0,Vi=null,po(e,n,f,1);break;case 2:case 9:if(fg(f)){cn=0,Vi=null,f_(n);break}n=function(){cn!==2&&cn!==9||Sn!==e||(cn=7),Ia(e)},f.then(n,n);break t;case 3:cn=7;break t;case 4:cn=5;break t;case 7:fg(f)?(cn=0,Vi=null,f_(n)):(cn=0,Vi=null,po(e,n,f,7));break;case 5:var v=null;switch(ke.tag){case 26:v=ke.memoizedState;case 5:case 27:var w=ke;if(v?nx(v):w.stateNode.complete){cn=0,Vi=null;var B=w.sibling;if(B!==null)ke=B;else{var et=w.return;et!==null?(ke=et,Ru(et)):ke=null}break e}}cn=0,Vi=null,po(e,n,f,5);break;case 6:cn=0,Vi=null,po(e,n,f,6);break;case 8:wd(),Pn=6;break t;default:throw Error(s(462))}}fE();break}catch(ft){r_(e,ft)}while(!0);return ja=cr=null,wt.H=r,wt.A=c,an=a,ke!==null?0:(Sn=null,Ke=0,Uc(),Pn)}function fE(){for(;ke!==null&&!zt();)u_(ke)}function u_(e){var n=Av(e.alternate,e,ns);e.memoizedProps=e.pendingProps,n===null?Ru(e):ke=n}function f_(e){var n=e,a=n.alternate;switch(n.tag){case 15:case 0:n=xv(a,n,n.pendingProps,n.type,void 0,Ke);break;case 11:n=xv(a,n,n.pendingProps,n.type.render,n.ref,Ke);break;case 5:Ih(n);var r=n;r===ei&&(Ie?(Fc(r),r.tag===5&&r.stateNode!=null&&(Mn=r.stateNode)):(Fc(r),Ie=!0));default:wv(a,n),n=ke=tg(n,ns),n=Av(a,n,ns)}e.memoizedProps=e.pendingProps,n===null?Ru(e):ke=n}function po(e,n,a,r){ja=cr=null,Ih(n),Jr=null,Sl=0;var c=n.return;try{if(JM(e,c,n,a,Ke)){Pn=1,su(e,$i(a,e.current)),ke=null;return}}catch(f){if(c!==null)throw ke=c,f;Pn=1,su(e,$i(a,e.current)),ke=null;return}n.flags&32768?(Ie||r===1?e=!0:ro||(Ke&536870912)!==0?e=!1:(Us=e=!0,(r===2||r===9||r===3||r===6)&&(r=li.current,r!==null&&r.tag===13&&(r.flags|=16384))),h_(n,e)):Ru(n)}function Ru(e){var n=e;do{if((n.flags&32768)!==0){h_(n,Us);return}e=n.return;var a=nE(n.alternate,n,ns);if(a!==null){ke=a;return}if(n=n.sibling,n!==null){ke=n;return}ke=n=e}while(n!==null);Pn===0&&(Pn=5)}function h_(e,n){do{var a=iE(e.alternate,e);if(a!==null){a.flags&=32767,ke=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!n&&(e=e.sibling,e!==null)){ke=e;return}ke=e=a}while(e!==null);Pn=6,ke=null}function d_(e,n,a,r,c,f,v,w,B,et,ft,Et){e.cancelPendingCommit=null;do wu();while(Nn!==0);if((an&6)!==0)throw Error(s(327));if(n!==null){if(n===e.current)throw Error(s(177));e===Sn&&(ke=Sn=null,Ke=0),Mr=n,ma=e,Pa=a,Rd=c,n_=r,hE(e,n,a,v,w,B,Et)}}function hE(e,n,a,r,c,f,v){var w=n.lanes|n.childLanes;if(Ad=w,w|=uh,we(e,a,w,r,c,f),co=null,(a&335544064)===a?(uo=HM(e),r=10262):(uo=null,r=10256),(n.subtreeFlags&r)!==0||(n.flags&r)!==0?(e.callbackNode=null,e.callbackPriority=0,_E(vt,function(){return Ud(),null})):(e.callbackNode=null,e.callbackPriority=0),du=!1,r=(n.flags&13878)!==0,(n.subtreeFlags&13878)!==0||r){r=wt.T,wt.T=null,c=Wt.p,Wt.p=2,f=an,an|=4;try{aE(e,n,a)}finally{an=f,Wt.p=c,wt.T=r}}Nn=1,du?lo=BE(v,e.containerInfo,uo,Nd,Dd,pE,Ld,Ud,dE):(Nd(),Dd(),Ld())}function dE(e){if(Nn!==0){var n=ma.onRecoverableError;n(e,{componentStack:null})}}function pE(){Nn===3&&(Nn=0,Kv(Mr,ma),Nn=4)}function Nd(){if(Nn===1){Nn=0;var e=ma,n=Mr,a=Pa,r=(n.flags&13878)!==0;if((n.subtreeFlags&13878)!==0||r){r=wt.T,wt.T=null;var c=Wt.p;Wt.p=2;var f=an;an|=4;try{Ll=gu=!1,Yv(n,e,a),a=qd;var v=k0(e.containerInfo),w=a.focusedElem,B=a.selectionRange;if(v!==w&&w&&w.ownerDocument&&X0(w.ownerDocument.documentElement,w)){if(B!==null&&sh(w)){var et=B.start,ft=B.end;if(ft===void 0&&(ft=et),"selectionStart"in w)w.selectionStart=et,w.selectionEnd=Math.min(ft,w.value.length);else{var Et=w.ownerDocument||document,Q=Et&&Et.defaultView||window;if(Q.getSelection){var ct=Q.getSelection(),Yt=w.textContent.length,ne=Math.min(B.start,Yt),Le=B.end===void 0?ne:Math.min(B.end,Yt);!ct.extend&&ne>Le&&(v=Le,Le=ne,ne=v);var tt=V0(w,ne),q=V0(w,Le);if(tt&&q&&(ct.rangeCount!==1||ct.anchorNode!==tt.node||ct.anchorOffset!==tt.offset||ct.focusNode!==q.node||ct.focusOffset!==q.offset)){var rt=Et.createRange();rt.setStart(tt.node,tt.offset),ct.removeAllRanges(),ne>Le?(ct.addRange(rt),ct.extend(q.node,q.offset)):(rt.setEnd(q.node,q.offset),ct.addRange(rt))}}}}for(Et=[],ct=w;ct=ct.parentNode;)ct.nodeType===1&&Et.push({element:ct,left:ct.scrollLeft,top:ct.scrollTop});for(typeof w.focus=="function"&&w.focus(),w=0;w<Et.length;w++){var Mt=Et[w];Mt.element.scrollLeft=Mt.left,Mt.element.scrollTop=Mt.top}}Mo=!!kd,qd=kd=null}finally{an=f,Wt.p=c,wt.T=r}}e.current=n,Nn=2}}function Dd(){if(Nn===2){Nn=0;var e=ma,n=Mr,a=(n.flags&8772)!==0;if((n.subtreeFlags&8772)!==0||a){a=wt.T,wt.T=null;var r=Wt.p;Wt.p=2;var c=an;an|=4;try{Gv(e,n.alternate,n)}finally{an=c,Wt.p=r,wt.T=a}}Nn=3}}function Ld(){if(Nn===4||Nn===3){Nn=0;var e=lo;lo=null,Bt();var n=ma,a=Mr,r=Pa,c=n_,f=(r&335544064)===r?10262:10256;if((a.subtreeFlags&f)!==0||(a.flags&f)!==0?Nn=5:(Nn=0,Mr=ma=null,p_(n,n.pendingLanes)),f=n.pendingLanes,f===0&&(Ps=null),Bi(r),a=a.stateNode,Xt&&typeof Xt.onCommitFiberRoot=="function")try{Xt.onCommitFiberRoot(Rt,a,void 0,(a.current.flags&128)===128)}catch{}if(c!==null){a=wt.T,f=Wt.p,Wt.p=2,wt.T=null;try{for(var v=n.onRecoverableError,w=0;w<c.length;w++){var B=c[w];v(B.value,{componentStack:B.stack})}}finally{wt.T=a,Wt.p=f}}if(c=co,v=uo,uo=null,c!==null&&(co=null,v===null&&(v=[]),e!==null))for(B=0;B<c.length;B++)a=(0,c[B])(v),a!==void 0&&e.finished.finally(a);(Pa&3)!==0&&wu(),Ia(n),f=n.pendingLanes,(r&261930)!==0&&(f&42)!==0?n===bu?Il++:(Il=0,bu=n):(Il=0,bu=null),zl(0)}}function p_(e,n){(e.pooledCacheLanes&=n)===0&&(n=e.pooledCache,n!=null&&(e.pooledCache=null,vl(n)))}function wu(){return lo!==null&&(lo.skipTransition(),lo=null),Nd(),Dd(),Ld(),Ud()}function Ud(){if(Nn!==5)return!1;var e=ma,n=Ad;Ad=0;var a=Bi(Pa),r=wt.T,c=Wt.p;try{Wt.p=32>a?32:a,wt.T=null,a=Rd,Rd=null;var f=ma,v=Pa;if(Nn=0,Mr=ma=null,Pa=0,(an&6)!==0)throw Error(s(331));var w=an;if(an|=4,$v(f.current),jv(f,f.current,v,a),an=w,zl(0,!1),Xt&&typeof Xt.onPostCommitFiberRoot=="function")try{Xt.onPostCommitFiberRoot(Rt,f)}catch{}return!0}finally{Wt.p=c,wt.T=r,p_(e,n)}}function m_(e,n,a){n=$i(a,n),n=jh(e.stateNode,n,2),e=Rs(e,n,2),e!==null&&(jt(e,2),Ia(e))}function un(e,n,a){if(e.tag===3)m_(e,e,a);else for(;n!==null;){if(n.tag===3){m_(n,e,a);break}else if(n.tag===1){var r=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Ps===null||!Ps.has(r))){e=$i(a,e),a=fv(2),r=Rs(n,a,2),r!==null&&(hv(a,r,n,e),jt(r,2),Ia(r));break}}n=n.return}}function Od(e,n,a){var r=e.pingCache;if(r===null){r=e.pingCache=new oE;var c=new Set;r.set(n,c)}else c=r.get(n),c===void 0&&(c=new Set,r.set(n,c));c.has(a)||(bd=!0,c.add(a),e=mE.bind(null,e,n,a),n.then(e,e))}function mE(e,n,a){var r=e.pingCache;r!==null&&r.delete(n),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Sn===e&&(Ke&a)===a&&((Pn===4||Pn===3&&(Ke&62914560)===Ke&&300>mt()-yu)&&(an&2)===0?ho(e,0):Su|=a,oo===Ke&&(oo=0)),Ia(e)}function g_(e,n){n===0&&(n=zn()),e=rr(e,n),e!==null&&(jt(e,n),Ia(e))}function gE(e){var n=e.memoizedState,a=0;n!==null&&(a=n.retryLane),g_(e,a)}function vE(e,n){var a=0;switch(e.tag){case 31:case 13:var r=e.stateNode,c=e.memoizedState;c!==null&&(a=c.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(s(314))}r!==null&&r.delete(n),g_(e,a)}function _E(e,n){return Nt(e,n)}var mo=null,go=null,Pd=!1,Cu=!1,Id=!1,zs=0;function Ia(e){e!==go&&e.next===null&&(go===null?mo=go=e:go=go.next=e),Cu=!0,Pd||(Pd=!0,SE())}function zl(e,n){if(!Id&&Cu){Id=!0;do for(var a=!1,r=mo;r!==null;){if(e!==0){var c=r.pendingLanes;if(c===0)var f=0;else{var v=r.suspendedLanes,w=r.pingedLanes;f=(1<<31-Zt(42|e)+1)-1,f&=c&~(v&~w),f=f&201326741?f&201326741|1:f?f|2:0}f!==0&&(a=!0,S_(r,f))}else f=Ke,f=xe(r,r===Sn?f:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),(f&3)===0||pe(r,f)||(a=!0,S_(r,f));r=r.next}while(a);Id=!1}}function xE(){v_()}function v_(){Cu=Pd=!1;var e=0;zs!==0&&DE()&&(e=zs);for(var n=mt(),a=null,r=mo;r!==null;){var c=r.next,f=__(r,n);f===0?(r.next=null,a===null?mo=c:a.next=c,c===null&&(go=a)):(a=r,(e!==0||(f&3)!==0)&&(Cu=!0)),r=c}Nn!==0&&Nn!==5||zl(e),zs!==0&&(zs=0)}function __(e,n){for(var a=e.suspendedLanes,r=e.pingedLanes,c=e.expirationTimes,f=e.pendingLanes&-62914561;0<f;){var v=31-Zt(f),w=1<<v,B=c[v];B===-1?((w&a)===0||(w&r)!==0)&&(c[v]=nn(w,n)):B<=n&&(e.expiredLanes|=w),f&=~w}if(n=Sn,a=Ke,a=xe(e,e===n?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,a===0||e===n&&(cn===2||cn===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&yt(r),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||pe(e,a)){if(n=a&-a,n===e.callbackPriority)return n;switch(r!==null&&yt(r),Bi(a)){case 2:case 8:a=F;break;case 32:a=vt;break;case 268435456:a=Ft;break;default:a=vt}return r=x_.bind(null,e),a=Nt(a,r),e.callbackPriority=n,e.callbackNode=a,n}return r!==null&&r!==null&&yt(r),e.callbackPriority=2,e.callbackNode=null,2}function x_(e,n){if(Nn!==0&&Nn!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(wu()&&e.callbackNode!==a)return null;var r=Ke;return r=xe(e,e===Sn?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(a_(e,r,n),__(e,mt()),e.callbackNode!=null&&e.callbackNode===a?x_.bind(null,e):null)}function S_(e,n){if(wu())return null;a_(e,n,!0)}function SE(){UE(function(){(an&6)!==0?Nt(Ot,xE):v_()})}function zd(){if(zs===0){var e=hr;e===0&&(e=Lt,Lt<<=1,(Lt&261888)===0&&(Lt=256)),zs=e}return zs}function y_(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Tc(e)}function yE(e,n,a,r,c){if(n==="submit"&&a&&a.stateNode===c){var f=y_((c[Rn]||null).action),v=r.submitter;v&&(n=(n=v[Rn]||null)?y_(n.formAction):v.getAttribute("formAction"),n!==null&&(f=n,v=null));var w=new Cc("action","action",null,r,c);e.push({event:w,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(zs!==0){var B=new FormData(c,v);qh(a,{pending:!0,data:B,method:c.method,action:f},null,B)}}else typeof f=="function"&&(w.preventDefault(),B=new FormData(c,v),qh(a,{pending:!0,data:B,method:c.method,action:f},f,B))},currentTarget:c}]})}}for(var Bd=0;Bd<ch.length;Bd++){var Fd=ch[Bd],ME=Fd.toLowerCase(),EE=Fd[0].toUpperCase()+Fd.slice(1);fa(ME,"on"+EE)}fa(Y0,"onAnimationEnd"),fa(Z0,"onAnimationIteration"),fa(K0,"onAnimationStart"),fa("dblclick","onDoubleClick"),fa("focusin","onFocus"),fa("focusout","onBlur"),fa(LM,"onTransitionRun"),fa(UM,"onTransitionStart"),fa(OM,"onTransitionCancel"),fa(j0,"onTransitionEnd"),bn("onMouseEnter",["mouseout","mouseover"]),bn("onMouseLeave",["mouseout","mouseover"]),bn("onPointerEnter",["pointerout","pointerover"]),bn("onPointerLeave",["pointerout","pointerover"]),Fe("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),Fe("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),Fe("onBeforeInput",["compositionend","keypress","textInput","paste"]),Fe("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),Fe("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),Fe("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Bl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),bE=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Bl));function M_(e,n){n=(n&4)!==0;for(var a=0;a<e.length;a++){var r=e[a],c=r.event;r=r.listeners;t:{var f=void 0;if(n)for(var v=r.length-1;0<=v;v--){var w=r[v],B=w.instance,et=w.currentTarget;if(w=w.listener,B!==f&&c.isPropagationStopped())break t;f=w,c.currentTarget=et;try{f(c)}catch(ft){Lc(ft)}c.currentTarget=null,f=B}else for(v=0;v<r.length;v++){if(w=r[v],B=w.instance,et=w.currentTarget,w=w.listener,B!==f&&c.isPropagationStopped())break t;f=w,c.currentTarget=et;try{f(c)}catch(ft){Lc(ft)}c.currentTarget=null,f=B}}}}function qe(e,n){var a=n[G];a===void 0&&(a=n[G]=new Set);var r=e+"__bubble";a.has(r)||(E_(n,e,2,!1),a.add(r))}function Hd(e,n,a){var r=0;n&&(r|=4),E_(a,e,r,n)}var Nu="_reactListening"+Math.random().toString(36).slice(2);function Gd(e){if(!e[Nu]){e[Nu]=!0,yn.forEach(function(a){a!=="selectionchange"&&(bE.has(a)||Hd(a,!1,e),Hd(a,!0,e))});var n=e.nodeType===9?e:e.ownerDocument;n===null||n[Nu]||(n[Nu]=!0,Hd("selectionchange",!1,n))}}function E_(e,n,a,r){switch(hx(n)){case 2:var c=gb;break;case 8:c=vb;break;default:c=op}a=c.bind(null,n,a,e),c=void 0,!Kf||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(c=!0),r?c!==void 0?e.addEventListener(n,a,{capture:!0,passive:c}):e.addEventListener(n,a,!0):c!==void 0?e.addEventListener(n,a,{passive:c}):e.addEventListener(n,a,!1)}function Vd(e,n,a,r,c){var f=r;if((n&1)===0&&(n&2)===0&&r!==null)t:for(;;){if(r===null)return;var v=r.tag;if(v===3||v===4){var w=r.stateNode.containerInfo;if(w===c)break;if(v===4)for(v=r.return;v!==null;){var B=v.tag;if((B===3||B===4)&&v.stateNode.containerInfo===c)return;v=v.return}for(;w!==null;){if(v=Gt(w),v===null)return;if(B=v.tag,B===5||B===6||B===26||B===27){r=f=v;continue t}w=w.parentNode}}r=r.return}E0(function(){var et=f,ft=Yf(a),Et=[];t:{var Q=Q0.get(e);if(Q!==void 0){var ct=Cc,Yt=e;switch(e){case"keypress":if(Rc(a)===0)break t;case"keydown":case"keyup":ct=lM;break;case"focusin":Yt="focus",ct=$f;break;case"focusout":Yt="blur",ct=$f;break;case"beforeblur":case"afterblur":ct=$f;break;case"click":if(a.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":ct=A0;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":ct=jy;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":ct=dM;break;case Y0:case Z0:case K0:ct=$y;break;case j0:ct=mM;break;case"scroll":case"scrollend":ct=Zy;break;case"wheel":ct=vM;break;case"copy":case"cut":case"paste":ct=eM;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":ct=w0;break;case"submit":ct=fM;break;case"toggle":case"beforetoggle":ct=xM}var ne=(n&4)!==0,Le=!ne&&(e==="scroll"||e==="scrollend"),tt=ne?Q!==null?Q+"Capture":null:Q;ne=[];for(var q=et,rt;q!==null;){var Mt=q;if(rt=Mt.stateNode,Mt=Mt.tag,Mt!==5&&Mt!==26&&Mt!==27||rt===null||tt===null||(Mt=rl(q,tt),Mt!=null&&ne.push(Fl(q,Mt,rt))),Le)break;q=q.return}0<ne.length&&(Q=new ct(Q,Yt,null,a,ft),Et.push({event:Q,listeners:ne}))}}if((n&7)===0){t:{if(ct=e==="mouseover"||e==="pointerover",Q=e==="mouseout"||e==="pointerout",ct&&a!==Wf&&(Yt=a.relatedTarget||a.fromElement)&&(Gt(Yt)||Yt[T]))break t;(Q||ct)&&(Yt=ft.window===ft?ft:(ct=ft.ownerDocument)?ct.defaultView||ct.parentWindow:window,Q?(ct=a.relatedTarget||a.toElement,Q=et,ct=ct?Gt(ct):null,ct!==null&&(Le=u(ct),ne=ct.tag,ct!==Le||ne!==5&&ne!==27&&ne!==6)&&(ct=null)):(Q=null,ct=et),Q!==ct&&(ne=A0,Mt="onMouseLeave",tt="onMouseEnter",q="mouse",(e==="pointerout"||e==="pointerover")&&(ne=w0,Mt="onPointerLeave",tt="onPointerEnter",q="pointer"),Le=Q==null?Yt:me(Q),rt=ct==null?Yt:me(ct),Yt=new ne(Mt,q+"leave",Q,a,ft),Yt.target=Le,Yt.relatedTarget=rt,Mt=null,Gt(ft)===et&&(ne=new ne(tt,q+"enter",ct,a,ft),ne.target=rt,ne.relatedTarget=Le,Mt=ne),Le=Mt,ne=Q&&ct?U(Q,ct,TE):null,Q!==null&&b_(Et,Yt,Q,ne,!1),ct!==null&&Le!==null&&b_(Et,Le,ct,ne,!0)))}t:{if(Q=et?me(et):window,ct=Q.nodeName&&Q.nodeName.toLowerCase(),ct==="select"||ct==="input"&&Q.type==="file")var $t=I0;else if(O0(Q))if(z0)$t=CM;else{$t=RM;var je=AM}else ct=Q.nodeName,!ct||ct.toLowerCase()!=="input"||Q.type!=="checkbox"&&Q.type!=="radio"?et&&zr(et.elementType)&&($t=I0):$t=wM;if($t&&($t=$t(e,et))){P0(Et,$t,a,ft);break t}je&&je(e,Q,et)}switch(je=et?me(et):window,e){case"focusin":(O0(je)||je.contentEditable==="true")&&(Xr=je,rh=et,pl=null);break;case"focusout":pl=rh=Xr=null;break;case"mousedown":oh=!0;break;case"contextmenu":case"mouseup":case"dragend":oh=!1,q0(Et,a,ft);break;case"selectionchange":if(DM)break;case"keydown":case"keyup":q0(Et,a,ft)}var ue;if(eh)t:{switch(e){case"compositionstart":var ve="onCompositionStart";break t;case"compositionend":ve="onCompositionEnd";break t;case"compositionupdate":ve="onCompositionUpdate";break t}ve=void 0}else Vr?L0(e,a)&&(ve="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(ve="onCompositionStart");ve&&(C0&&a.locale!=="ko"&&(Vr||ve!=="onCompositionStart"?ve==="onCompositionEnd"&&Vr&&(ue=b0()):(_s=ft,jf="value"in _s?_s.value:_s.textContent,Vr=!0)),je=Du(et,ve),0<je.length&&(ve=new R0(ve,e,null,a,ft),Et.push({event:ve,listeners:je}),ue?ve.data=ue:(ue=U0(a),ue!==null&&(ve.data=ue)))),(ue=yM?MM(e,a):EM(e,a))&&(ve=Du(et,"onBeforeInput"),0<ve.length&&(je=new R0("onBeforeInput","beforeinput",null,a,ft),Et.push({event:je,listeners:ve}),je.data=ue)),yE(Et,e,et,a,ft)}M_(Et,n)})}function Fl(e,n,a){return{instance:e,listener:n,currentTarget:a}}function Du(e,n){for(var a=n+"Capture",r=[];e!==null;){var c=e,f=c.stateNode;if(c=c.tag,c!==5&&c!==26&&c!==27||f===null||(c=rl(e,a),c!=null&&r.unshift(Fl(e,c,f)),c=rl(e,n),c!=null&&r.push(Fl(e,c,f))),e.tag===3)return r;e=e.return}return[]}function TE(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function b_(e,n,a,r,c){for(var f=n._reactName,v=[];a!==null&&a!==r;){var w=a,B=w.alternate,et=w.stateNode;if(w=w.tag,B!==null&&B===r)break;w!==5&&w!==26&&w!==27||et===null||(B=et,c?(et=rl(a,f),et!=null&&v.unshift(Fl(a,et,B))):c||(et=rl(a,f),et!=null&&v.push(Fl(a,et,B)))),a=a.return}v.length!==0&&e.push({event:n,listeners:v})}var AE=/\r\n?/g,RE=/\u0000|\uFFFD/g;function T_(e){return(typeof e=="string"?e:""+e).replace(AE,`
`).replace(RE,"")}function A_(e,n){return n=T_(n),T_(e)===n}function fn(e,n,a,r,c,f){switch(a){case"children":if(typeof r=="string")n==="body"||n==="textarea"&&r===""||Tn(e,r);else if(typeof r=="number"||typeof r=="bigint")n!=="body"&&Tn(e,""+r);else return;break;case"className":wi(e,"class",r);break;case"tabIndex":wi(e,"tabindex",r);break;case"dir":case"role":case"viewBox":case"width":case"height":wi(e,a,r);break;case"style":Ir(e,r,f);return;case"data":if(n!=="object"){wi(e,"data",r);break}case"src":case"href":if(r===""&&(n!=="a"||a!=="href")){e.removeAttribute(a);break}if(r==null||typeof r=="function"||typeof r=="symbol"||typeof r=="boolean"){e.removeAttribute(a);break}r=Tc(r),e.setAttribute(a,r);break;case"action":case"formAction":if(typeof r=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof f=="function"&&(a==="formAction"?(n!=="input"&&fn(e,n,"name",c.name,c,null),fn(e,n,"formEncType",c.formEncType,c,null),fn(e,n,"formMethod",c.formMethod,c,null),fn(e,n,"formTarget",c.formTarget,c,null)):(fn(e,n,"encType",c.encType,c,null),fn(e,n,"method",c.method,c,null),fn(e,n,"target",c.target,c,null)));if(r==null||typeof r=="symbol"||typeof r=="boolean"){e.removeAttribute(a);break}r=Tc(r),e.setAttribute(a,r);break;case"onClick":r!=null&&(e.onclick=Aa);return;case"onScroll":r!=null&&qe("scroll",e);return;case"onScrollEnd":r!=null&&qe("scrollend",e);return;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(s(61));if(a=r.__html,a!=null){if(c.children!=null)throw Error(s(60));f?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=r&&typeof r!="function"&&typeof r!="symbol";break;case"muted":e.muted=r&&typeof r!="function"&&typeof r!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(r==null||typeof r=="function"||typeof r=="boolean"||typeof r=="symbol"){e.removeAttribute("xlink:href");break}a=Tc(r),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":r!=null&&typeof r!="function"&&typeof r!="symbol"?e.setAttribute(a,r):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":r&&typeof r!="function"&&typeof r!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":r===!0?e.setAttribute(a,""):r!==!1&&r!=null&&typeof r!="function"&&typeof r!="symbol"?e.setAttribute(a,r):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":r!=null&&typeof r!="function"&&typeof r!="symbol"&&!isNaN(r)&&1<=r?e.setAttribute(a,r):e.removeAttribute(a);break;case"rowSpan":case"start":r==null||typeof r=="function"||typeof r=="symbol"||isNaN(r)?e.removeAttribute(a):e.setAttribute(a,r);break;case"popover":qe("beforetoggle",e),qe("toggle",e),$n(e,"popover",r);break;case"xlinkActuate":ye(e,"http://www.w3.org/1999/xlink","xlink:actuate",r);break;case"xlinkArcrole":ye(e,"http://www.w3.org/1999/xlink","xlink:arcrole",r);break;case"xlinkRole":ye(e,"http://www.w3.org/1999/xlink","xlink:role",r);break;case"xlinkShow":ye(e,"http://www.w3.org/1999/xlink","xlink:show",r);break;case"xlinkTitle":ye(e,"http://www.w3.org/1999/xlink","xlink:title",r);break;case"xlinkType":ye(e,"http://www.w3.org/1999/xlink","xlink:type",r);break;case"xmlBase":ye(e,"http://www.w3.org/XML/1998/namespace","xml:base",r);break;case"xmlLang":ye(e,"http://www.w3.org/XML/1998/namespace","xml:lang",r);break;case"xmlSpace":ye(e,"http://www.w3.org/XML/1998/namespace","xml:space",r);break;case"is":$n(e,"is",r);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=Br.get(a)||a,$n(e,a,r);else return}ge=!0}function Xd(e,n,a,r,c,f){switch(a){case"style":Ir(e,r,f);return;case"dangerouslySetInnerHTML":if(r!=null){if(typeof r!="object"||!("__html"in r))throw Error(s(61));if(a=r.__html,a!=null){if(c.children!=null)throw Error(s(60));f?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof r=="string")Tn(e,r);else if(typeof r=="number"||typeof r=="bigint")Tn(e,""+r);else return;break;case"onScroll":r!=null&&qe("scroll",e);return;case"onScrollEnd":r!=null&&qe("scrollend",e);return;case"onClick":r!=null&&(e.onclick=Aa);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Ve.hasOwnProperty(a))t:{if(a[0]==="o"&&a[1]==="n"&&(c=a.endsWith("Capture"),f=a.slice(2,c?a.length-7:void 0),n=e[Rn]||null,n=n!=null?n[a]:null,typeof n=="function"&&e.removeEventListener(f,n,c),typeof r=="function")){typeof n!="function"&&n!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(f,r,c);break t}ge=!0,a in e?e[a]=r:r===!0?e.setAttribute(a,""):$n(e,a,r)}return}ge=!0}function fi(e,n,a){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":qe("error",e),qe("load",e);var r=!1,c=!1,f;for(f in a)if(a.hasOwnProperty(f)){var v=a[f];if(v!=null)switch(f){case"src":r=!0;break;case"srcSet":c=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(s(137,n));default:fn(e,n,f,v,a,null)}}c&&fn(e,n,"srcSet",a.srcSet,a,null),r&&fn(e,n,"src",a.src,a,null);return;case"input":qe("invalid",e);var w=f=v=c=null,B=null,et=null;for(r in a)if(a.hasOwnProperty(r)){var ft=a[r];if(ft!=null)switch(r){case"name":c=ft;break;case"type":v=ft;break;case"checked":B=ft;break;case"defaultChecked":et=ft;break;case"value":f=ft;break;case"defaultValue":w=ft;break;case"children":case"dangerouslySetInnerHTML":if(ft!=null)throw Error(s(137,n));break;default:fn(e,n,r,ft,a,null)}}il(e,f,w,B,et,v,c,!1);return;case"select":qe("invalid",e),r=v=f=null;for(c in a)if(a.hasOwnProperty(c)&&(w=a[c],w!=null))switch(c){case"value":f=w;break;case"defaultValue":v=w;break;case"multiple":r=w;default:fn(e,n,c,w,a,null)}n=f,a=v,e.multiple=!!r,n!=null?ka(e,!!r,n,!1):a!=null&&ka(e,!!r,a,!0);return;case"textarea":qe("invalid",e),f=c=r=null;for(v in a)if(a.hasOwnProperty(v)&&(w=a[v],w!=null))switch(v){case"value":r=w;break;case"defaultValue":c=w;break;case"children":f=w;break;case"dangerouslySetInnerHTML":if(w!=null)throw Error(s(91));break;default:fn(e,n,v,w,a,null)}sl(e,r,c,f);return;case"option":for(B in a)a.hasOwnProperty(B)&&(r=a[B],r!=null)&&(B==="selected"?e.selected=r&&typeof r!="function"&&typeof r!="symbol":fn(e,n,B,r,a,null));return;case"dialog":qe("beforetoggle",e),qe("toggle",e),qe("cancel",e),qe("close",e);break;case"iframe":case"object":qe("load",e);break;case"video":case"audio":for(r=0;r<Bl.length;r++)qe(Bl[r],e);break;case"image":qe("error",e),qe("load",e);break;case"details":qe("toggle",e);break;case"embed":case"source":case"link":qe("error",e),qe("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(et in a)if(a.hasOwnProperty(et)&&(r=a[et],r!=null))switch(et){case"children":case"dangerouslySetInnerHTML":throw Error(s(137,n));default:fn(e,n,et,r,a,null)}return;default:if(zr(n)){for(ft in a)a.hasOwnProperty(ft)&&(r=a[ft],r!==void 0&&Xd(e,n,ft,r,a,void 0));return}}for(w in a)a.hasOwnProperty(w)&&(r=a[w],r!=null&&fn(e,n,w,r,a,null))}var wE={};function CE(e,n,a,r){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var c=null,f=null,v=null,w=null,B=null,et=null,ft=null;for(ct in a){var Et=a[ct];if(a.hasOwnProperty(ct)&&Et!=null)switch(ct){case"checked":break;case"value":break;case"defaultValue":B=Et;default:r.hasOwnProperty(ct)||fn(e,n,ct,null,r,Et)}}for(var Q in r){var ct=r[Q];if(Et=a[Q],r.hasOwnProperty(Q)&&(ct!=null||Et!=null))switch(Q){case"type":ct!==Et&&(ge=!0),f=ct;break;case"name":ct!==Et&&(ge=!0),c=ct;break;case"checked":ct!==Et&&(ge=!0),et=ct;break;case"defaultChecked":ct!==Et&&(ge=!0),ft=ct;break;case"value":ct!==Et&&(ge=!0),v=ct;break;case"defaultValue":ct!==Et&&(ge=!0),w=ct;break;case"children":case"dangerouslySetInnerHTML":if(ct!=null)throw Error(s(137,n));break;default:ct!==Et&&fn(e,n,Q,ct,r,Et)}}nl(e,v,w,B,et,ft,f,c);return;case"select":ct=v=w=Q=null;for(f in a)if(B=a[f],a.hasOwnProperty(f)&&B!=null)switch(f){case"value":break;case"multiple":ct=B;default:r.hasOwnProperty(f)||fn(e,n,f,null,r,B)}for(c in r)if(f=r[c],B=a[c],r.hasOwnProperty(c)&&(f!=null||B!=null))switch(c){case"value":f!==B&&(ge=!0),Q=f;break;case"defaultValue":f!==B&&(ge=!0),w=f;break;case"multiple":f!==B&&(ge=!0),v=f;default:f!==B&&fn(e,n,c,f,r,B)}n=w,a=v,r=ct,Q!=null?ka(e,!!a,Q,!1):!!r!=!!a&&(n!=null?ka(e,!!a,n,!0):ka(e,!!a,a?[]:"",!1));return;case"textarea":ct=Q=null;for(w in a)if(c=a[w],a.hasOwnProperty(w)&&c!=null&&!r.hasOwnProperty(w))switch(w){case"value":break;case"children":break;default:fn(e,n,w,null,r,c)}for(v in r)if(c=r[v],f=a[v],r.hasOwnProperty(v)&&(c!=null||f!=null))switch(v){case"value":c!==f&&(ge=!0),Q=c;break;case"defaultValue":c!==f&&(ge=!0),ct=c;break;case"children":break;case"dangerouslySetInnerHTML":if(c!=null)throw Error(s(91));break;default:c!==f&&fn(e,n,v,c,r,f)}vs(e,Q,ct);return;case"option":for(var Yt in a)Q=a[Yt],a.hasOwnProperty(Yt)&&Q!=null&&!r.hasOwnProperty(Yt)&&(Yt==="selected"?e.selected=!1:fn(e,n,Yt,null,r,Q));for(B in r)Q=r[B],ct=a[B],r.hasOwnProperty(B)&&Q!==ct&&(Q!=null||ct!=null)&&(B==="selected"?(Q!==ct&&(ge=!0),e.selected=Q&&typeof Q!="function"&&typeof Q!="symbol"):fn(e,n,B,Q,r,ct));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var ne in a)Q=a[ne],a.hasOwnProperty(ne)&&Q!=null&&!r.hasOwnProperty(ne)&&fn(e,n,ne,null,r,Q);for(et in r)if(Q=r[et],ct=a[et],r.hasOwnProperty(et)&&Q!==ct&&(Q!=null||ct!=null))switch(et){case"children":case"dangerouslySetInnerHTML":if(Q!=null)throw Error(s(137,n));break;default:fn(e,n,et,Q,r,ct)}return;default:if(zr(n)){for(var Le in a)Q=a[Le],a.hasOwnProperty(Le)&&Q!==void 0&&!r.hasOwnProperty(Le)&&Xd(e,n,Le,void 0,r,Q);for(ft in r)Q=r[ft],ct=a[ft],!r.hasOwnProperty(ft)||Q===ct||Q===void 0&&ct===void 0||Xd(e,n,ft,Q,r,ct);return}}for(var tt in a)Q=a[tt],a.hasOwnProperty(tt)&&Q!=null&&!r.hasOwnProperty(tt)&&fn(e,n,tt,null,r,Q);for(Et in r)Q=r[Et],ct=a[Et],!r.hasOwnProperty(Et)||Q===ct||Q==null&&ct==null||fn(e,n,Et,Q,r,ct)}function R_(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function NE(){if(typeof performance.getEntriesByType=="function"){for(var e=0,n=0,a=performance.getEntriesByType("resource"),r=0;r<a.length;r++){var c=a[r],f=c.transferSize,v=c.initiatorType,w=c.duration;if(f&&w&&R_(v)){for(v=0,w=c.responseEnd,r+=1;r<a.length;r++){var B=a[r],et=B.startTime;if(et>w)break;var ft=B.transferSize,Et=B.initiatorType;ft&&R_(Et)&&(B=B.responseEnd,v+=ft*(B<w?1:(w-et)/(B-et)))}if(--r,n+=8*(f+v)/(c.duration/1e3),e++,10<e)break}}if(0<e)return n/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var kd=null,qd=null;function Hl(e){return e.nodeType===9?e:e.ownerDocument}function w_(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function C_(e,n){if(e===0)switch(n){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&n==="foreignObject"?0:e}function N_(e,n,a,r){return a=Hl(a).createElement(e),a[$e]=r,a[Rn]=n,fi(a,e,n),kt(a),a}function Wd(e,n){return e==="textarea"||e==="noscript"||typeof n.children=="string"||typeof n.children=="number"||typeof n.children=="bigint"||typeof n.dangerouslySetInnerHTML=="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}var Yd=null;function DE(){var e=window.event;return e&&e.type==="popstate"?e===Yd?!1:(Yd=e,!0):(Yd=null,!1)}var Zd=typeof setTimeout=="function"?setTimeout:void 0,LE=typeof clearTimeout=="function"?clearTimeout:void 0,D_=typeof Promise=="function"?Promise:void 0,L_=typeof requestAnimationFrame=="function"?requestAnimationFrame:Zd,UE=typeof queueMicrotask=="function"?queueMicrotask:typeof D_<"u"?function(e){return D_.resolve(null).then(e).catch(OE)}:Zd;function OE(e){setTimeout(function(){throw e})}function Bs(e){return e==="head"}function U_(e,n){var a=n,r=0;do{var c=a.nextSibling;if(e.removeChild(a),c&&c.nodeType===8)if(a=c.data,a==="/$"||a==="/&"){if(r===0){e.removeChild(c),Eo(n);return}r--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")r++;else if(a==="html")np(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,np(a);for(var f=a.firstChild;f;){var v=f.nextSibling,w=f.nodeName;f[Ut]||w==="SCRIPT"||w==="STYLE"||w==="LINK"&&f.rel.toLowerCase()==="stylesheet"||a.removeChild(f),f=v}}else a==="body"&&np(e.ownerDocument.body);a=c}while(a);Eo(n)}function O_(e,n){var a=e;e=0;do{var r=a.nextSibling;if(a.nodeType===1?n?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(n?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),r&&r.nodeType===8)if(a=r.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=r}while(a)}function P_(e,n,a){if(n=CSS.escape(n)!==n?"r-"+btoa(n).replace(/=/g,""):n,e.style.viewTransitionName=n,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(n=e.getClientRects(),n.length===1)var r=1;else for(var c=r=0;c<n.length;c++){var f=n[c];0<f.width&&0<f.height&&r++}r===1&&(e=e.style,e.display=n.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function I_(e,n){e=e.style,n=n.style;var a=n!=null?n.hasOwnProperty("viewTransitionName")?n.viewTransitionName:n.hasOwnProperty("view-transition-name")?n["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=n!=null?n.hasOwnProperty("viewTransitionClass")?n.viewTransitionClass:n.hasOwnProperty("view-transition-class")?n["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(n==null?e.display=e.margin="":(a=n.display,e.display=a==null||typeof a=="boolean"?"":a,a=n.margin,a!=null?e.margin=a:(a=n.hasOwnProperty("marginTop")?n.marginTop:n["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,n=n.hasOwnProperty("marginBottom")?n.marginBottom:n["margin-bottom"],e.marginBottom=n==null||typeof n=="boolean"?"":n)))}function PE(e,n,a){return a=a.ownerDocument.defaultView,{rect:e,abs:n.position==="absolute"||n.position==="fixed",clip:n.clipPath!=="none"||n.overflow!=="visible"||n.filter!=="none"||n.mask!=="none"||n.mask!=="none"||n.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function Kd(e){var n=e.getBoundingClientRect(),a=getComputedStyle(e);return PE(n,a,e)}function IE(e){return e.documentElement.clientHeight}function zE(e){this.addEventListener("load",e),this.addEventListener("error",e)}function BE(e,n,a,r,c,f,v,w,B){var et=n.nodeType===9?n:n.ownerDocument;try{var ft=et.startViewTransition({update:function(){var Q=et.defaultView,ct=Q.navigation&&Q.navigation.transition,Yt=et.fonts.status;r();var ne=[];if(Yt==="loaded"&&(IE(et),et.fonts.status==="loading"&&ne.push(et.fonts.ready)),Yt=ne.length,e!==null)for(var Le=e.suspenseyImages,tt=0,q=0;q<Le.length;q++){var rt=Le[q];if(!rt.complete){var Mt=rt.getBoundingClientRect();if(0<Mt.bottom&&0<Mt.right&&Mt.top<Q.innerHeight&&Mt.left<Q.innerWidth){if(tt+=ix(rt),tt>Ou){ne.length=Yt;break}rt=new Promise(zE.bind(rt)),ne.push(rt)}}}if(0<ne.length)return Q=Promise.race([Promise.all(ne),new Promise(function($t){return setTimeout($t,500)})]).then(c,c),(ct?Promise.allSettled([ct.finished,Q]):Q).then(f,f);if(c(),ct)return ct.finished.then(f,f);f()},types:a});et.__reactViewTransition=ft;var Et=[];return ft.ready.then(function(){for(var Q=et.documentElement.getAnimations({subtree:!0}),ct=0;ct<Q.length;ct++){var Yt=Q[ct],ne=Yt.effect,Le=ne.pseudoElement;if(Le!=null&&Le.startsWith("::view-transition")){Et.push(Yt),Yt=ne.getKeyframes();for(var tt=Le=void 0,q=!0,rt=0;rt<Yt.length;rt++){var Mt=Yt[rt],$t=Mt.width;if(Le===void 0)Le=$t;else if(Le!==$t){q=!1;break}if($t=Mt.height,tt===void 0)tt=$t;else if(tt!==$t){q=!1;break}delete Mt.width,delete Mt.height,Mt.transform==="none"&&delete Mt.transform}q&&Le!==void 0&&tt!==void 0&&(ne.setKeyframes(Yt),q=getComputedStyle(ne.target,ne.pseudoElement),q.width!==Le||q.height!==tt)&&(q=Yt[0],q.width=Le,q.height=tt,q=Yt[Yt.length-1],q.width=Le,q.height=tt,ne.setKeyframes(Yt))}}v()},function(Q){et.__reactViewTransition===ft&&(et.__reactViewTransition=null);try{typeof Q=="object"&&Q!==null&&Q.name==="InvalidStateError"&&(Q.message==="View transition was skipped because document visibility state is hidden."||Q.message==="Skipping view transition because document visibility state has become hidden."||Q.message==="Skipping view transition because viewport size changed."||Q.message==="Transition was aborted because of invalid state")&&(Q=null),Q!==null&&B(Q)}finally{r(),c(),v()}}),ft.finished.finally(function(){for(var Q=0;Q<Et.length;Q++)Et[Q].cancel();et.__reactViewTransition===ft&&(et.__reactViewTransition=null),w()}),ft}catch{return r(),c(),v(),null}}function Er(e,n){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+n+")"}Er.prototype.animate=function(e,n){return n=typeof n=="number"?{duration:n}:E({},n),n.pseudoElement=this._selector,this._scope.animate(e,n)},Er.prototype.getAnimations=function(){for(var e=this._scope,n=this._selector,a=e.getAnimations({subtree:!0}),r=[],c=0;c<a.length;c++){var f=a[c].effect;f!==null&&f.target===e&&f.pseudoElement===n&&r.push(a[c])}return r},Er.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function z_(e){return{name:e,group:new Er("group",e),imagePair:new Er("image-pair",e),old:new Er("old",e),new:new Er("new",e)}}function qi(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}qi.prototype.addEventListener=function(e,n,a){var r=null,c=null;if(!(a!=null&&typeof a!="boolean"&&(r=a.signal||null,r!==null&&r.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var f=this._eventListeners;if(F_(f,e,n,a)===-1){var v=this,w=n;a!=null&&typeof a!="boolean"&&a.once===!0&&(w=function(B){v.removeEventListener(e,n,a),typeof n=="function"?n.call(this,B):n.handleEvent(B)}),r!==null&&(c=v.removeEventListener.bind(v,e,n,a),r.addEventListener("abort",c,{once:!0}),c=r.removeEventListener.bind(r,"abort",c)),r=vo(a),f.push({type:e,listener:n,optionsOrUseCapture:a,attachedListener:w,cleanup:c}),g(this._fragmentFiber.child,!1,FE,e,w,r)}this._eventListeners=f}};function FE(e,n,a,r){return y(e).addEventListener(n,a,r),!1}qi.prototype.removeEventListener=function(e,n,a){var r=this._eventListeners;if(r!==null&&(n=F_(r,e,n,a),n!==-1)){var c=r[n];a=c.attachedListener;var f=c.cleanup;c=vo(c.optionsOrUseCapture),g(this._fragmentFiber.child,!1,HE,e,a,c),r.splice(n,1),f!==null&&f()}};function HE(e,n,a,r){return y(e).removeEventListener(n,a,r),!1}function vo(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function B_(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function F_(e,n,a,r){if(e.length===0)return-1;r=B_(r);for(var c=0;c<e.length;c++){var f=e[c];if(f.type===n&&f.listener===a&&B_(f.optionsOrUseCapture)===r)return c}return-1}qi.prototype.dispatchEvent=function(e){var n=_(this._fragmentFiber);if(n===null)return!0;n=y(n);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var r=n.nodeType===9?n.createComment(""):document.createTextNode("");if(a)for(var c=0;c<a.length;c++){var f=a[c];r.addEventListener(f.type,f.attachedListener,vo(f.optionsOrUseCapture))}if(n.appendChild(r),e=r.dispatchEvent(e),a)for(c=0;c<a.length;c++)f=a[c],r.removeEventListener(f.type,f.attachedListener,vo(f.optionsOrUseCapture));return n.removeChild(r),e}return n.dispatchEvent(e)},qi.prototype.focus=function(e){g(this._fragmentFiber.child,!0,H_,e,void 0,void 0)};function H_(e,n){return e.tag===6?!1:(e=y(e),JE(e,n))}qi.prototype.focusLast=function(e){var n=[];g(this._fragmentFiber.child,!0,jd,n,void 0,void 0);for(var a=n.length-1;0<=a&&!H_(n[a],e);a--);};function jd(e,n){return n.push(e),!1}qi.prototype.blur=function(){var e=_(this._fragmentFiber);e!==null&&(e=y(e),e=Hl(e).activeElement,e!==null&&g(this._fragmentFiber.child,!1,GE,e,void 0,void 0))};function GE(e,n){return e.tag===6?!1:(e=y(e),e===n||e.contains(n)?(n.blur(),!0):!1)}qi.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),g(this._fragmentFiber.child,!1,VE,e,void 0,void 0)};function VE(e,n){return e.tag===6||(e=y(e),n.observe(e)),!1}qi.prototype.unobserveUsing=function(e){var n=this._observers;if(n!==null&&n.has(e)){n.delete(e),g(this._fragmentFiber.child,!1,XE,e,void 0,void 0);for(var a=n=0;a<ga.length;a++){var r=ga[a];r.fragmentInstance===this&&r.observer===e?e.unobserve(r.instance):ga[n++]=r}ga.length=n}};function XE(e,n){return e.tag===6||(e=y(e),n.unobserve(e)),!1}var ga=[],Qd=!1;function kE(e,n,a){ga.push({fragmentInstance:e,observer:n,instance:a}),Qd||(Qd=!0,$E(function(){Qd=!1;var r=ga;ga=[];for(var c=0;c<r.length;c++){var f=r[c];f.observer.unobserve(f.instance)}}))}qi.prototype.getClientRects=function(){var e=[];return g(this._fragmentFiber.child,!1,qE,e,void 0,void 0),e};function qE(e,n){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),n.push.apply(n,a.getClientRects())}else e=y(e),n.push.apply(n,e.getClientRects());return!1}qi.prototype.getRootNode=function(e){var n=_(this._fragmentFiber);return n===null?this:y(n).getRootNode(e)},qi.prototype.compareDocumentPosition=function(e){var n=_(this._fragmentFiber);if(n===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];g(this._fragmentFiber.child,!1,jd,a,void 0,void 0);var r=y(n);if(a.length===0){if(a=r,x(this._fragmentFiber)){t:{for(n=this._fragmentFiber.return;n!==null;){if(n.tag===4){n=n.stateNode.containerInfo;break t}if(n.tag===3||n.tag===5||n.tag===27)break;n=n.return}n=null}n!=null&&(a=n)}n=this._fragmentFiber;var c=r=a.compareDocumentPosition(e);return a===e?c=Node.DOCUMENT_POSITION_CONTAINS:r&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=b(n)[1],a===null?c=Node.DOCUMENT_POSITION_PRECEDING:(e=y(a).compareDocumentPosition(e),c=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),c|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}n=y(a[0]),c=y(a[a.length-1]);var f=x(this._fragmentFiber)?n.parentElement:r;if(f==null)return Node.DOCUMENT_POSITION_DISCONNECTED;r=f.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_CONTAINED_BY,f=f.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_CONTAINED_BY;var v=n.compareDocumentPosition(e),w=c.compareDocumentPosition(e),B=v&Node.DOCUMENT_POSITION_CONTAINED_BY||w&Node.DOCUMENT_POSITION_CONTAINED_BY;return w=r&&f&&v&Node.DOCUMENT_POSITION_FOLLOWING&&w&Node.DOCUMENT_POSITION_PRECEDING,n=r&&n===e||f&&c===e||B||w?Node.DOCUMENT_POSITION_CONTAINED_BY:!r&&n===e||!f&&c===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:v,n&Node.DOCUMENT_POSITION_DISCONNECTED||n&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||WE(n,this._fragmentFiber,a[0],a[a.length-1],e)?n:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function WE(e,n,a,r,c){var f=Gt(c);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!f)t:{for(;f!==null;){if(f.tag===7&&(f===n||f.alternate===n)){a=!0;break t}f=f.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(f===null)return f=c.ownerDocument,c===f||c===f.documentElement||c===f.body;t:{for(f=n,n=_(n);f!==null;){if(!(f.tag!==5&&f.tag!==3&&f.tag!==27||f!==n&&f.alternate!==n)){f=!0;break t}f=f.return}f=!1}return f}return e&Node.DOCUMENT_POSITION_PRECEDING?((n=!!f)&&!(n=f===a)&&(n=U(a,f,I),n===null?n=!1:(g(n,!0,P,f,a),f=M,M=null,n=f!==null)),n):e&Node.DOCUMENT_POSITION_FOLLOWING?((n=!!f)&&!(n=f===r)&&(n=U(r,f,I),n===null?n=!1:(g(n,!0,L,f,r),f=M,N=M=null,n=f!==null)),n):!1}function G_(e,n){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,n?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}qi.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(s(566));var n=[];g(this._fragmentFiber.child,!1,jd,n,void 0,void 0);var a=e!==!1;if(n.length===0){var r=b(this._fragmentFiber);if(r=a?r[1]||r[0]||_(this._fragmentFiber):r[0]||r[1],r===null)return;if(r.tag===6){e=y(r),G_(e,a);return}if(r=y(r),r.nodeType!==9){if(r.nodeType===11){a="host"in r?r.host:null,a!==null&&a.scrollIntoView(e);return}r.scrollIntoView(e)}}for(r=a?n.length-1:0;r!==(a?-1:n.length);){var c=n[r];c.tag===6?(c=y(c),G_(c,a)):y(c).scrollIntoView(e),r+=a?-1:1}};function YE(e,n){return e=y(e),V_(e,n),!1}function V_(e,n){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(n)}function X_(e,n){var a=n._eventListeners;if(a!==null)for(var r=0;r<a.length;r++){var c=a[r];e.addEventListener(c.type,c.attachedListener,vo(c.optionsOrUseCapture))}e.nodeType!==3&&(a=n._observers,a!==null&&a.forEach(function(f){for(var v=0,w=0;w<ga.length;w++){var B=ga[w];(B.fragmentInstance!==n||B.observer!==f||B.instance!==e)&&(ga[v++]=B)}ga.length=v,f.observe(e)}),V_(e,n))}function ZE(e,n){var a=n._eventListeners;if(a!==null)for(var r=0;r<a.length;r++){var c=a[r];e.removeEventListener(c.type,c.attachedListener,vo(c.optionsOrUseCapture))}e.nodeType!==3&&(a=n._observers,a!==null&&a.forEach(function(f){typeof f.rootMargin=="string"?kE(n,f,e):f.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(n))}function Jd(e){var n=e.firstChild;for(n&&n.nodeType===10&&(n=n.nextSibling);n;){var a=n;switch(n=n.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Jd(a),It(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function KE(e,n,a,r){for(;e.nodeType===1;){var c=a;if(e.nodeName.toLowerCase()!==n.toLowerCase()){if(!r&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(r){if(!e[Ut])switch(n){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(f=e.getAttribute("rel"),f==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(f!==c.rel||e.getAttribute("href")!==(c.href==null||c.href===""?null:c.href)||e.getAttribute("crossorigin")!==(c.crossOrigin==null?null:c.crossOrigin)||e.getAttribute("title")!==(c.title==null?null:c.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(f=e.getAttribute("src"),(f!==(c.src==null?null:c.src)||e.getAttribute("type")!==(c.type==null?null:c.type)||e.getAttribute("crossorigin")!==(c.crossOrigin==null?null:c.crossOrigin))&&f&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(n==="input"&&e.type==="hidden"){var f=c.name==null?null:""+c.name;if(c.type==="hidden"&&e.getAttribute("name")===f)return e}else return e;if(e=aa(e.nextSibling),e===null)break}return null}function jE(e,n,a){if(n==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=aa(e.nextSibling),e===null))return null;return e}function k_(e,n){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=aa(e.nextSibling),e===null))return null;return e}function $d(e){return e.data==="$?"||e.data==="$~"}function tp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function QE(e,n){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=n;else if(e.data!=="$?"||a.readyState!=="loading")n();else{var r=function(){n(),a.removeEventListener("DOMContentLoaded",r)};a.addEventListener("DOMContentLoaded",r),e._reactRetry=r}}function aa(e){for(;e!=null;e=e.nextSibling){var n=e.nodeType;if(n===1||n===3)break;if(n===8){if(n=e.data,n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"||n==="F!"||n==="F")break;if(n==="/$"||n==="/&")return null}}return e}var ep=null;function q_(e){e=e.nextSibling;for(var n=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(n===0)return aa(e.nextSibling);n--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||n++}e=e.nextSibling}return null}function W_(e){e=e.previousSibling;for(var n=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(n===0)return e;n--}else a!=="/$"&&a!=="/&"||n++}e=e.previousSibling}return null}function JE(e,n){function a(){r=!0}if(e.ownerDocument.activeElement===e)return!0;var r=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,n)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return r}function $E(e){L_(function(){L_(function(n){return e(n)})})}function Y_(e,n,a){switch(n=Hl(a),e){case"html":if(e=n.documentElement,!e)throw Error(s(452));return e;case"head":if(e=n.head,!e)throw Error(s(453));return e;case"body":if(e=n.body,!e)throw Error(s(454));return e;default:throw Error(s(451))}}function Z_(e,n,a){for(var r in a){var c=a[r];a.hasOwnProperty(r)&&c!=null&&fn(e,n,r,null,wE,c)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===Aa&&(e.onclick=null),It(e)}function np(e){for(var n=e.attributes;n.length;)e.removeAttributeNode(n[0]);It(e)}var sa=new Map,K_=new Set;function Gl(e){if(typeof e.getRootNode=="function"){var n=e.getRootNode();if(n.nodeType===9||n.nodeType===11)return n}return e.nodeType===9?e:e.ownerDocument}var is=Wt.d;Wt.d={f:tb,r:eb,D:nb,C:ib,L:ab,m:sb,X:ob,S:rb,M:lb};function tb(){var e=is.f(),n=Tu();return e||n}function eb(e){var n=Jt(e);n!==null&&n.tag===5&&n.type==="form"?Qg(n):is.r(e)}var _o=typeof document>"u"?null:document;function j_(e,n,a){var r=_o;if(r&&typeof n=="string"&&n){var c=Ci(n);c='link[rel="'+e+'"][href="'+c+'"]',typeof a=="string"&&(c+='[crossorigin="'+a+'"]'),K_.has(c)||(K_.add(c),e={rel:e,crossOrigin:a,href:n},r.querySelector(c)===null&&(n=r.createElement("link"),fi(n,"link",e),kt(n),r.head.appendChild(n)))}}function nb(e){is.D(e),j_("dns-prefetch",e,null)}function ib(e,n){is.C(e,n),j_("preconnect",e,n)}function ab(e,n,a){is.L(e,n,a);var r=_o;if(r&&e&&n){var c='link[rel="preload"][as="'+Ci(n)+'"]';n==="image"&&a&&a.imageSrcSet?(c+='[imagesrcset="'+Ci(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(c+='[imagesizes="'+Ci(a.imageSizes)+'"]')):c+='[href="'+Ci(e)+'"]';var f=c;switch(n){case"style":f=xo(e);break;case"script":f=So(e)}if(!(sa.has(f)||(e=E({rel:"preload",href:n==="image"&&a&&a.imageSrcSet?void 0:e,as:n},a),sa.set(f,e),r.querySelector(c)!==null||n==="style"&&r.querySelector(Vl(f))||n==="script"&&r.querySelector(Xl(f))))){var v=r.createElement("link");fi(v,"link",e),n==="style"&&(v[Qt]=!0,v.onload=v.onerror=function(){Se(v)}),kt(v),r.head.appendChild(v)}}}function sb(e,n){is.m(e,n);var a=_o;if(a&&e){var r=n&&typeof n.as=="string"?n.as:"script",c='link[rel="modulepreload"][as="'+Ci(r)+'"][href="'+Ci(e)+'"]',f=c;switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":f=So(e)}if(!sa.has(f)&&(e=E({rel:"modulepreload",href:e},n),sa.set(f,e),a.querySelector(c)===null)){switch(r){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Xl(f)))return}r=a.createElement("link"),fi(r,"link",e),kt(r),a.head.appendChild(r)}}}function rb(e,n,a){is.S(e,n,a);var r=_o;if(r&&e){var c=Ee(r).hoistableStyles,f=xo(e);n=n||"default";var v=c.get(f);if(!v){var w={loading:0,preload:null};if(v=r.querySelector(Vl(f)))w.loading=5;else{e=E({rel:"stylesheet",href:e,"data-precedence":n},a),(a=sa.get(f))&&ip(e,a);var B=v=r.createElement("link");kt(B),fi(B,"link",e),B._p=new Promise(function(et,ft){B.onload=et,B.onerror=ft}),B.addEventListener("load",function(){w.loading|=1}),B.addEventListener("error",function(){w.loading|=2}),w.loading|=4,Lu(v,n,r)}v={type:"stylesheet",instance:v,count:1,state:w},c.set(f,v)}}}function ob(e,n){is.X(e,n);var a=_o;if(a&&e){var r=Ee(a).hoistableScripts,c=So(e),f=r.get(c);f||(f=a.querySelector(Xl(c)),f||(e=E({src:e,async:!0},n),(n=sa.get(c))&&ap(e,n),f=a.createElement("script"),kt(f),fi(f,"link",e),a.head.appendChild(f)),f={type:"script",instance:f,count:1,state:null},r.set(c,f))}}function lb(e,n){is.M(e,n);var a=_o;if(a&&e){var r=Ee(a).hoistableScripts,c=So(e),f=r.get(c);f||(f=a.querySelector(Xl(c)),f||(e=E({src:e,async:!0,type:"module"},n),(n=sa.get(c))&&ap(e,n),f=a.createElement("script"),kt(f),fi(f,"link",e),a.head.appendChild(f)),f={type:"script",instance:f,count:1,state:null},r.set(c,f))}}function Q_(e,n,a,r){var c=(c=vn.current)?Gl(c):null;if(!c)throw Error(s(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=xo(a.href),n=Ee(c).hoistableStyles,r=n.get(a),r||(r={type:"style",instance:null,count:0,state:null},n.set(a,r)),r):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=xo(a.href);var f=Ee(c).hoistableStyles,v=f.get(e);if(v||(c=c.ownerDocument||c,v={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},f.set(e,v),(f=c.querySelector(Vl(e)))?f._p||(v.instance=f,v.state.loading=5):(f=sa.get(e),f||(f={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},sa.set(e,f)),cb(c,e,f,v.state))),n&&r===null)throw Error(s(528,""));return v}if(n&&r!==null)throw Error(s(529,""));return null;case"script":return n=a.async,a=a.src,typeof a=="string"&&n&&typeof n!="function"&&typeof n!="symbol"?(a=So(a),n=Ee(c).hoistableScripts,r=n.get(a),r||(r={type:"script",instance:null,count:0,state:null},n.set(a,r)),r):{type:"void",instance:null,count:0,state:null};default:throw Error(s(444,e))}}function xo(e){return'href="'+Ci(e)+'"'}function Vl(e){return'link[rel="stylesheet"]['+e+"]"}function J_(e){return E({},e,{"data-precedence":e.precedence,precedence:null})}function cb(e,n,a,r){if(n=e.querySelector('link[rel="preload"][as="style"]['+n+"]")){if(n[Qt]!==!0){r.loading=1;return}}else n=e.createElement("link"),n[Qt]=!0,n.onload=n.onerror=Se.bind(null,n),fi(n,"link",a),kt(n),e.head.appendChild(n);r.preload=n,n.addEventListener("load",function(){return r.loading|=1}),n.addEventListener("error",function(){return r.loading|=2})}function So(e){return'[src="'+Ci(e)+'"]'}function Xl(e){return"script[async]"+e}function $_(e,n,a){if(n.count++,n.instance===null)switch(n.type){case"style":var r=e.querySelector('style[data-href~="'+Ci(a.href)+'"]');if(r)return n.instance=r,kt(r),r;var c=E({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement("style"),kt(r),fi(r,"style",c),Lu(r,a.precedence,e),n.instance=r;case"stylesheet":c=xo(a.href);var f=e.querySelector(Vl(c));if(f)return n.state.loading|=4,n.instance=f,kt(f),f;r=J_(a),(c=sa.get(c))&&ip(r,c),f=(e.ownerDocument||e).createElement("link"),kt(f);var v=f;return v._p=new Promise(function(w,B){v.onload=w,v.onerror=B}),fi(f,"link",r),n.state.loading|=4,Lu(f,a.precedence,e),n.instance=f;case"script":return f=So(a.src),(c=e.querySelector(Xl(f)))?(n.instance=c,kt(c),c):(r=a,(c=sa.get(f))&&(r=E({},a),ap(r,c)),e=e.ownerDocument||e,c=e.createElement("script"),kt(c),fi(c,"link",r),e.head.appendChild(c),n.instance=c);case"void":return null;default:throw Error(s(443,n.type))}else n.type==="stylesheet"&&(n.state.loading&4)===0&&(r=n.instance,n.state.loading|=4,Lu(r,a.precedence,e));return n.instance}function Lu(e,n,a){for(var r=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),c=r.length?r[r.length-1]:null,f=c,v=0;v<r.length;v++){var w=r[v];if(w.dataset.precedence===n)f=w;else if(f!==c)break}f?f.parentNode.insertBefore(e,f.nextSibling):(n=a.nodeType===9?a.head:a,n.insertBefore(e,n.firstChild))}function ip(e,n){e.crossOrigin==null&&(e.crossOrigin=n.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=n.referrerPolicy),e.title==null&&(e.title=n.title)}function ap(e,n){e.crossOrigin==null&&(e.crossOrigin=n.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=n.referrerPolicy),e.integrity==null&&(e.integrity=n.integrity)}var Uu=null;function tx(e,n,a){if(Uu===null){var r=new Map,c=Uu=new Map;c.set(a,r)}else c=Uu,r=c.get(a),r||(r=new Map,c.set(a,r));if(r.has(e))return r;for(r.set(e,null),a=a.getElementsByTagName(e),c=0;c<a.length;c++){var f=a[c];if(!(f[Ut]||f[$e]||e==="link"&&f.getAttribute("rel")==="stylesheet")&&f.namespaceURI!=="http://www.w3.org/2000/svg"){var v=f.getAttribute(n)||"";v=e+v;var w=r.get(v);w?w.push(f):r.set(v,[f])}}return r}function sp(e,n,a){e=e.ownerDocument||e,e.head.insertBefore(a,n==="title"?e.querySelector("head > title"):null)}function ub(e,n,a){if(a===1||n.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof n.precedence!="string"||typeof n.href!="string"||n.href==="")break;return!0;case"link":if(typeof n.rel!="string"||typeof n.href!="string"||n.href===""||n.onLoad||n.onError)break;return n.rel==="stylesheet"?(e=n.disabled,typeof n.precedence=="string"&&e==null):!0;case"script":if(n.async&&typeof n.async!="function"&&typeof n.async!="symbol"&&!n.onLoad&&!n.onError&&n.src&&typeof n.src=="string")return!0}return!1}function ex(e,n){return e==="img"&&n.src!=null&&n.src!==""&&n.onLoad==null&&n.loading!=="lazy"}function nx(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function ix(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function ax(e,n){typeof n.decode=="function"&&(e.imgCount++,n.complete||(e.imgBytes+=ix(n),e.suspenseyImages.push(n)),e=db.bind(e),n.decode().then(e,e))}function fb(e,n,a,r){if(a.type==="stylesheet"&&(typeof r.media!="string"||matchMedia(r.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var c=xo(r.href),f=n.querySelector(Vl(c));if(f){n=f._p,n!==null&&typeof n=="object"&&typeof n.then=="function"&&(e.count++,e=kl.bind(e),n.then(e,e)),a.state.loading|=4,a.instance=f,kt(f);return}f=n.ownerDocument||n,r=J_(r),(c=sa.get(c))&&ip(r,c),f=f.createElement("link"),kt(f);var v=f;v._p=new Promise(function(w,B){v.onload=w,v.onerror=B}),fi(f,"link",r),a.instance=f}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,n),(n=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=kl.bind(e),n.addEventListener("load",a),n.addEventListener("error",a))}}var Ou=0;function hb(e,n){return e.stylesheets&&e.count===0&&Iu(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var r=setTimeout(function(){if(e.stylesheets&&Iu(e,e.stylesheets),e.unsuspend){var f=e.unsuspend;e.unsuspend=null,f()}},6e4+n);0<e.imgBytes&&Ou===0&&(Ou=62500*NE());var c=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Iu(e,e.stylesheets),e.unsuspend)){var f=e.unsuspend;e.unsuspend=null,f()}},(e.imgBytes>Ou?50:800)+n);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(c)}}:null}function sx(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Iu(e,e.stylesheets);else if(e.unsuspend){var n=e.unsuspend;e.unsuspend=null,n()}}}function kl(){this.count--,sx(this)}function db(){this.imgCount--,sx(this)}var Pu=null;function Iu(e,n){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Pu=new Map,n.forEach(pb,e),Pu=null,kl.call(e))}function pb(e,n){if(!(n.state.loading&4)){var a=Pu.get(e);if(a)var r=a.get(null);else{a=new Map,Pu.set(e,a);for(var c=e.querySelectorAll("link[data-precedence],style[data-precedence]"),f=0;f<c.length;f++){var v=c[f];(v.nodeName==="LINK"||v.getAttribute("media")!=="not all")&&(a.set(v.dataset.precedence,v),r=v)}r&&a.set(null,r)}c=n.instance,v=c.getAttribute("data-precedence"),f=a.get(v)||r,f===r&&a.set(null,c),a.set(v,c),this.count++,r=kl.bind(this),c.addEventListener("load",r),c.addEventListener("error",r),f?f.parentNode.insertBefore(c,f.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(c,e.firstChild)),n.state.loading|=4}}var yo={$$typeof:st,Provider:null,Consumer:null,_currentValue:de,_currentValue2:de,_threadCount:0};function mb(e,n,a,r,c,f,v,w,B){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=St(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=St(0),this.hiddenUpdates=St(null),this.identifierPrefix=r,this.onUncaughtError=c,this.onCaughtError=f,this.onRecoverableError=v,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=B,this.transitionTypes=null,this.incompleteTransitions=new Map}function rx(e,n,a,r,c,f,v,w,B,et,ft,Et){return e=new mb(e,n,a,v,B,et,ft,Et,w),n=1,f===!0&&(n|=24),f=Ni(3,null,null,n),e.current=f,f.stateNode=e,n=Sh(),n.refCount++,e.pooledCache=n,n.refCount++,f.memoizedState={element:r,isDehydrated:a,cache:n},bh(f),e}function ox(e){return e?(e=Wr,e):Wr}function lx(e,n,a,r,c,f){c=ox(c),r.context===null?r.context=c:r.pendingContext=c,r=As(n),r.payload={element:a},f=f===void 0?null:f,f!==null&&(r.callback=f),a=Rs(e,r,n),a!==null&&(Oi(a,e,n),yl(a,e,n))}function cx(e,n){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<n?a:n}}function rp(e,n){cx(e,n),(e=e.alternate)&&cx(e,n)}function ux(e){if(e.tag===13||e.tag===31){var n=rr(e,67108864);n!==null&&Oi(n,e,67108864),rp(e,67108864)}}function fx(e){if(e.tag===13||e.tag===31){var n=ki();n=Jn(n);var a=rr(e,n);a!==null&&Oi(a,e,n),rp(e,n)}}var Mo=!0;function gb(e,n,a,r){var c=wt.T;wt.T=null;var f=Wt.p;try{Wt.p=2,op(e,n,a,r)}finally{Wt.p=f,wt.T=c}}function vb(e,n,a,r){var c=wt.T;wt.T=null;var f=Wt.p;try{Wt.p=8,op(e,n,a,r)}finally{Wt.p=f,wt.T=c}}function op(e,n,a,r){if(Mo){var c=lp(r);if(c===null)Vd(e,n,r,zu,a),dx(e,r);else if(xb(c,e,n,a,r))r.stopPropagation();else if(dx(e,r),n&4&&-1<_b.indexOf(e)){for(;c!==null;){var f=Jt(c);if(f!==null)switch(f.tag){case 3:if(f=f.stateNode,f.current.memoizedState.isDehydrated){var v=be(f.pendingLanes);if(v!==0){var w=f;for(w.pendingLanes|=2,w.entangledLanes|=2;v;){var B=1<<31-Zt(v);w.entanglements[1]|=B,v&=~B}Ia(f),(an&6)===0&&(Mu=mt()+500,zl(0))}}break;case 31:case 13:w=rr(f,2),w!==null&&Oi(w,f,2),Tu(),rp(f,2)}if(f=lp(r),f===null&&Vd(e,n,r,zu,a),f===c)break;c=f}c!==null&&r.stopPropagation()}else Vd(e,n,r,null,a)}}function lp(e){return e=Yf(e),cp(e)}var zu=null;function cp(e){if(zu=null,e=Gt(e),e!==null){var n=u(e);if(n===null)e=null;else{var a=n.tag;if(a===13){if(e=h(n),e!==null)return e;e=null}else if(a===31){if(e=d(n),e!==null)return e;e=null}else if(a===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;e=null}else n!==e&&(e=null)}}return zu=e,null}function hx(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(_t()){case Ot:return 2;case F:return 8;case vt:case gt:return 32;case Ft:return 268435456;default:return 32}default:return 32}}var up=!1,Fs=null,Hs=null,Gs=null,ql=new Map,Wl=new Map,Vs=[],_b="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function dx(e,n){switch(e){case"focusin":case"focusout":Fs=null;break;case"dragenter":case"dragleave":Hs=null;break;case"mouseover":case"mouseout":Gs=null;break;case"pointerover":case"pointerout":ql.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":Wl.delete(n.pointerId)}}function Yl(e,n,a,r,c,f){return e===null||e.nativeEvent!==f?(e={blockedOn:n,domEventName:a,eventSystemFlags:r,nativeEvent:f,targetContainers:[c]},n!==null&&(n=Jt(n),n!==null&&ux(n)),e):(e.eventSystemFlags|=r,n=e.targetContainers,c!==null&&n.indexOf(c)===-1&&n.push(c),e)}function xb(e,n,a,r,c){switch(n){case"focusin":return Fs=Yl(Fs,e,n,a,r,c),!0;case"dragenter":return Hs=Yl(Hs,e,n,a,r,c),!0;case"mouseover":return Gs=Yl(Gs,e,n,a,r,c),!0;case"pointerover":var f=c.pointerId;return ql.set(f,Yl(ql.get(f)||null,e,n,a,r,c)),!0;case"gotpointercapture":return f=c.pointerId,Wl.set(f,Yl(Wl.get(f)||null,e,n,a,r,c)),!0}return!1}function px(e){var n=Gt(e.target);if(n!==null){var a=u(n);if(a!==null){if(n=a.tag,n===13){if(n=h(a),n!==null){e.blockedOn=n,Fn(e.priority,function(){fx(a)});return}}else if(n===31){if(n=d(a),n!==null){e.blockedOn=n,Fn(e.priority,function(){fx(a)});return}}else if(n===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Bu(e){if(e.blockedOn!==null)return!1;for(var n=e.targetContainers;0<n.length;){var a=lp(e.nativeEvent);if(a===null){a=e.nativeEvent;var r=new a.constructor(a.type,a);Wf=r,a.target.dispatchEvent(r),Wf=null}else return n=Jt(a),n!==null&&ux(n),e.blockedOn=a,!1;n.shift()}return!0}function mx(e,n,a){Bu(e)&&a.delete(n)}function Sb(){up=!1,Fs!==null&&Bu(Fs)&&(Fs=null),Hs!==null&&Bu(Hs)&&(Hs=null),Gs!==null&&Bu(Gs)&&(Gs=null),ql.forEach(mx),Wl.forEach(mx)}function Fu(e,n){e.blockedOn===n&&(e.blockedOn=null,up||(up=!0,o.unstable_scheduleCallback(o.unstable_NormalPriority,Sb)))}var Hu=null;function gx(e){Hu!==e&&(Hu=e,o.unstable_scheduleCallback(o.unstable_NormalPriority,function(){Hu===e&&(Hu=null);for(var n=0;n<e.length;n+=3){var a=e[n],r=e[n+1],c=e[n+2];if(typeof r!="function"){if(cp(r||a)===null)continue;break}var f=Jt(a);f!==null&&(e.splice(n,3),n-=3,qh(f,{pending:!0,data:c,method:a.method,action:r},r,c))}}))}function Eo(e){function n(B){return Fu(B,e)}Fs!==null&&Fu(Fs,e),Hs!==null&&Fu(Hs,e),Gs!==null&&Fu(Gs,e),ql.forEach(n),Wl.forEach(n);for(var a=0;a<Vs.length;a++){var r=Vs[a];r.blockedOn===e&&(r.blockedOn=null)}for(;0<Vs.length&&(a=Vs[0],a.blockedOn===null);)px(a),a.blockedOn===null&&Vs.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(r=0;r<a.length;r+=3){var c=a[r],f=a[r+1],v=c[Rn]||null;if(typeof f=="function")v||gx(a);else if(v){var w=null;if(f&&f.hasAttribute("formAction")){if(c=f,v=f[Rn]||null)w=v.formAction;else if(cp(c)!==null)continue}else w=v.action;typeof w=="function"?a[r+1]=w:(a.splice(r,3),r-=3),gx(a)}}}function vx(){function e(f){f.canIntercept&&f.info==="react-transition"&&f.intercept({handler:function(){return new Promise(function(v){return c=v})},focusReset:"manual",scroll:"manual"})}function n(){c!==null&&(c(),c=null),r||setTimeout(a,20)}function a(){if(!r&&!navigation.transition){var f=navigation.currentEntry;f&&f.url!=null&&navigation.navigate(f.url,{state:f.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var r=!1,c=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",n),navigation.addEventListener("navigateerror",n),setTimeout(a,100),function(){r=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",n),navigation.removeEventListener("navigateerror",n),c!==null&&(c(),c=null)}}}function fp(e){this._internalRoot=e}Gu.prototype.render=fp.prototype.render=function(e){var n=this._internalRoot;if(n===null)throw Error(s(409));var a=n.current,r=ki();lx(a,r,e,n,null,null)},Gu.prototype.unmount=fp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var n=e.containerInfo;lx(e.current,2,null,e,null,null),Tu(),n[T]=null}};function Gu(e){this._internalRoot=e}Gu.prototype.unstable_scheduleHydration=function(e){if(e){var n=ba();e={blockedOn:null,target:e,priority:n};for(var a=0;a<Vs.length&&n!==0&&n<Vs[a].priority;a++);Vs.splice(a,0,e),a===0&&px(e)}};var _x=t.version;if(_x!=="19.3.1")throw Error(s(527,_x,"19.3.1"));Wt.findDOMNode=function(e){var n=e._reactInternals;if(n===void 0)throw typeof e.render=="function"?Error(s(188)):(e=Object.keys(e).join(","),Error(s(268,e)));return e=p(n),e=e!==null?S(e):null,e=e===null?null:e.stateNode,e};var yb={bundleType:0,version:"19.3.1",rendererPackageName:"react-dom",currentDispatcherRef:wt,reconcilerVersion:"19.3.1"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Vu=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Vu.isDisabled&&Vu.supportsFiber)try{Rt=Vu.inject(yb),Xt=Vu}catch{}}return Kl.createRoot=function(e,n){if(!l(e))throw Error(s(299));var a=!1,r="",c=ov,f=lv,v=cv;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(c=n.onUncaughtError),n.onCaughtError!==void 0&&(f=n.onCaughtError),n.onRecoverableError!==void 0&&(v=n.onRecoverableError)),n=rx(e,1,!1,null,null,a,r,null,c,f,v,vx),e[T]=n.current,Gd(e),new fp(n)},Kl.hydrateRoot=function(e,n,a){if(!l(e))throw Error(s(299));var r=!1,c="",f=ov,v=lv,w=cv,B=null;return a!=null&&(a.unstable_strictMode===!0&&(r=!0),a.identifierPrefix!==void 0&&(c=a.identifierPrefix),a.onUncaughtError!==void 0&&(f=a.onUncaughtError),a.onCaughtError!==void 0&&(v=a.onCaughtError),a.onRecoverableError!==void 0&&(w=a.onRecoverableError),a.formState!==void 0&&(B=a.formState)),n=rx(e,1,!0,n,a??null,r,c,B,f,v,w,vx),n.context=ox(null),a=n.current,r=ki(),r=Jn(r),c=As(r),c.callback=null,Rs(a,c,r),a=r,n.current.lanes=a,jt(n,a),Ia(n),e[T]=n.current,Gd(e),new Gu(n)},Kl.version="19.3.1",Kl}var wx;function Db(){if(wx)return pp.exports;wx=1;function o(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(o)}catch(t){console.error(t)}}return o(),pp.exports=Nb(),pp.exports}var Lb=Db();const Jm="187",Ub=0,Cx=1,Ob=2,yf=1,Pb=2,uc=3,Cr=0,zi=1,Pi=2,qo=0,hc=1,Ki=2,Nx=3,Dx=4,Ib=5,Xo=100,zb=101,Bb=102,Fb=103,Hb=104,Gb=200,Vb=201,Xb=202,kb=203,ZS=204,KS=205,qb=206,Wb=207,Yb=208,Zb=209,Kb=210,jb=211,Qb=212,Jb=213,$b=214,nm=0,im=1,am=2,vc=3,sm=4,rm=5,om=6,lm=7,jS=0,tT=1,eT=2,ds=0,QS=1,JS=2,$S=3,ty=4,ey=5,ny=6,iy=7,ay=300,Zo=301,_c=302,_p=303,xp=304,xc=1e3,hs=1001,cm=1002,pi=1003,nT=1004,Xu=1005,Ii=1006,Sp=1007,$s=1008,ji=1009,sy=1010,ry=1011,Sc=1012,$m=1013,Va=1014,Ma=1015,Xa=1016,t0=1017,e0=1018,Ko=1020,oy=35902,ly=35899,cy=1021,uy=1022,Ha=1023,er=1026,tr=1027,n0=1028,i0=1029,Nr=1030,a0=1031,s0=1033,Mf=33776,Ef=33777,bf=33778,Tf=33779,um=35840,fm=35841,hm=35842,dm=35843,pm=36196,mm=37492,gm=37496,vm=37488,_m=37489,Cf=37490,xm=37491,Sm=37808,ym=37809,Mm=37810,Em=37811,bm=37812,Tm=37813,Am=37814,Rm=37815,wm=37816,Cm=37817,Nm=37818,Dm=37819,Lm=37820,Um=37821,Om=36492,Pm=36494,Im=36495,zm=36283,Bm=36284,Nf=36285,Fm=36286,iT=3200,Hm=0,aT=1,Js="",di="srgb",Df="srgb-linear",Lf="linear",hn="srgb",yp=7680,sT=519,rT=512,oT=513,lT=514,fy=515,cT=516,uT=517,hy=518,dy=519,py=35044,Lx="300 es",Ea=2e3,yc=2001;function fT(o){for(let t=o.length-1;t>=0;--t)if(o[t]>=65535)return!0;return!1}function Uf(o){return document.createElementNS("http://www.w3.org/1999/xhtml",o)}function hT(){const o=Uf("canvas");return o.style.display="block",o}const Ux={};function Of(...o){const t="THREE."+o.shift();console.log(t,...o)}function my(o){const t=o[0];if(typeof t=="string"&&t.startsWith("TSL:")){const i=o[1];i&&i.isStackTrace?o[0]+=" "+i.getLocation():o[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return o}function _e(...o){o=my(o);const t="THREE."+o.shift();{const i=o[0];i&&i.isStackTrace?console.warn(i.getError(t)):console.warn(t,...o)}}function en(...o){o=my(o);const t="THREE."+o.shift();{const i=o[0];i&&i.isStackTrace?console.error(i.getError(t)):console.error(t,...o)}}function Af(...o){const t=o.join(" ");t in Ux||(Ux[t]=!0,_e(...o))}function dT(o,t,i){return new Promise(function(s,l){function u(){switch(o.clientWaitSync(t,o.SYNC_FLUSH_COMMANDS_BIT,0)){case o.WAIT_FAILED:l();break;case o.TIMEOUT_EXPIRED:setTimeout(u,i);break;default:s()}}setTimeout(u,i)})}const pT={[nm]:nm,[am]:om,[sm]:sm,[vc]:rm,[im]:im,[om]:am,[lm]:lm,[rm]:vc};class Lr{addEventListener(t,i){this._listeners===void 0&&(this._listeners={});const s=this._listeners;s[t]===void 0&&(s[t]=[]),s[t].indexOf(i)===-1&&s[t].push(i)}hasEventListener(t,i){const s=this._listeners;return s===void 0?!1:s[t]!==void 0&&s[t].indexOf(i)!==-1}removeEventListener(t,i){const s=this._listeners;if(s===void 0)return;const l=s[t];if(l!==void 0){const u=l.indexOf(i);u!==-1&&l.splice(u,1)}}dispatchEvent(t){const i=this._listeners;if(i===void 0)return;const s=i[t.type];if(s!==void 0){t.target=this;const l=s.slice(0);for(let u=0,h=l.length;u<h;u++)l[u].call(this,t);t.target=null}}}const gi=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Mp=Math.PI/180,Gm=180/Math.PI;function Ur(){const o=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(gi[o&255]+gi[o>>8&255]+gi[o>>16&255]+gi[o>>24&255]+"-"+gi[t&255]+gi[t>>8&255]+"-"+gi[t>>16&15|64]+gi[t>>24&255]+"-"+gi[i&63|128]+gi[i>>8&255]+"-"+gi[i>>16&255]+gi[i>>24&255]+gi[s&255]+gi[s>>8&255]+gi[s>>16&255]+gi[s>>24&255]).toLowerCase()}function He(o,t,i){return Math.max(t,Math.min(i,o))}function mT(o,t){return(o%t+t)%t}function Ep(o,t,i){return(1-i)*o+i*t}function gT(o){return Math.pow(2,Math.floor(Math.log(o)/Math.LN2))}function Vf(o){switch(o.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function gy(o,t){if(t.constructor===Float32Array)return o;const i=Vf(t);if(i===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(o/i,-1)}function vy(o,t){if(t.constructor===Float32Array)return o;const i=Vf(t);if(i===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(o*i)}const _0=class _0{constructor(t=0,i=0){this.x=t,this.y=i}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,i){return this.x=t,this.y=i,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const i=this.x,s=this.y,l=t.elements;return this.x=l[0]*i+l[3]*s+l[6],this.y=l[1]*i+l[4]*s+l[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,i){return this.x=He(this.x,t.x,i.x),this.y=He(this.y,t.y,i.y),this}clampScalar(t,i){return this.x=He(this.x,t,i),this.y=He(this.y,t,i),this}clampLength(t,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(He(s,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;const s=this.dot(t)/i;return Math.acos(He(s,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const i=this.x-t.x,s=this.y-t.y;return i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this}lerpVectors(t,i,s){return this.x=t.x+(i.x-t.x)*s,this.y=t.y+(i.y-t.y)*s,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this}rotateAround(t,i){const s=Math.cos(i),l=Math.sin(i),u=this.x-t.x,h=this.y-t.y;return this.x=u*s-h*l+t.x,this.y=u*l+h*s+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};_0.prototype.isVector2=!0;let te=_0;class tl{constructor(t=0,i=0,s=0,l=1){this.isQuaternion=!0,this._x=t,this._y=i,this._z=s,this._w=l}static slerpFlat(t,i,s,l,u,h,d){let m=s[l+0],p=s[l+1],S=s[l+2],g=s[l+3],_=u[h+0],x=u[h+1],b=u[h+2],A=u[h+3];if(g!==A||m!==_||p!==x||S!==b){let y=m*_+p*x+S*b+g*A;y<0&&(_=-_,x=-x,b=-b,A=-A,y=-y);let M=1-d;if(y<.9995){const N=Math.acos(y),P=Math.sin(N);M=Math.sin(M*N)/P,d=Math.sin(d*N)/P,m=m*M+_*d,p=p*M+x*d,S=S*M+b*d,g=g*M+A*d}else{m=m*M+_*d,p=p*M+x*d,S=S*M+b*d,g=g*M+A*d;const N=1/Math.sqrt(m*m+p*p+S*S+g*g);m*=N,p*=N,S*=N,g*=N}}t[i]=m,t[i+1]=p,t[i+2]=S,t[i+3]=g}static multiplyQuaternionsFlat(t,i,s,l,u,h){const d=s[l],m=s[l+1],p=s[l+2],S=s[l+3],g=u[h],_=u[h+1],x=u[h+2],b=u[h+3];return t[i]=d*b+S*g+m*x-p*_,t[i+1]=m*b+S*_+p*g-d*x,t[i+2]=p*b+S*x+d*_-m*g,t[i+3]=S*b-d*g-m*_-p*x,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,i,s,l){return this._x=t,this._y=i,this._z=s,this._w=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,i=!0){const s=t._x,l=t._y,u=t._z,h=t._order,d=Math.cos,m=Math.sin,p=d(s/2),S=d(l/2),g=d(u/2),_=m(s/2),x=m(l/2),b=m(u/2);switch(h){case"XYZ":this._x=_*S*g+p*x*b,this._y=p*x*g-_*S*b,this._z=p*S*b+_*x*g,this._w=p*S*g-_*x*b;break;case"YXZ":this._x=_*S*g+p*x*b,this._y=p*x*g-_*S*b,this._z=p*S*b-_*x*g,this._w=p*S*g+_*x*b;break;case"ZXY":this._x=_*S*g-p*x*b,this._y=p*x*g+_*S*b,this._z=p*S*b+_*x*g,this._w=p*S*g-_*x*b;break;case"ZYX":this._x=_*S*g-p*x*b,this._y=p*x*g+_*S*b,this._z=p*S*b-_*x*g,this._w=p*S*g+_*x*b;break;case"YZX":this._x=_*S*g+p*x*b,this._y=p*x*g+_*S*b,this._z=p*S*b-_*x*g,this._w=p*S*g-_*x*b;break;case"XZY":this._x=_*S*g-p*x*b,this._y=p*x*g-_*S*b,this._z=p*S*b+_*x*g,this._w=p*S*g+_*x*b;break;default:_e("Quaternion: .setFromEuler() encountered an unknown order: "+h)}return i===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,i){const s=i/2,l=Math.sin(s);return this._x=t.x*l,this._y=t.y*l,this._z=t.z*l,this._w=Math.cos(s),this._onChangeCallback(),this}setFromRotationMatrix(t){const i=t.elements,s=i[0],l=i[4],u=i[8],h=i[1],d=i[5],m=i[9],p=i[2],S=i[6],g=i[10],_=s+d+g;if(_>0){const x=.5/Math.sqrt(_+1);this._w=.25/x,this._x=(S-m)*x,this._y=(u-p)*x,this._z=(h-l)*x}else if(s>d&&s>g){const x=2*Math.sqrt(1+s-d-g);this._w=(S-m)/x,this._x=.25*x,this._y=(l+h)/x,this._z=(u+p)/x}else if(d>g){const x=2*Math.sqrt(1+d-s-g);this._w=(u-p)/x,this._x=(l+h)/x,this._y=.25*x,this._z=(m+S)/x}else{const x=2*Math.sqrt(1+g-s-d);this._w=(h-l)/x,this._x=(u+p)/x,this._y=(m+S)/x,this._z=.25*x}return this._onChangeCallback(),this}setFromUnitVectors(t,i){let s=t.dot(i)+1;return s<1e-8?(s=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=s):(this._x=0,this._y=-t.z,this._z=t.y,this._w=s)):(this._x=t.y*i.z-t.z*i.y,this._y=t.z*i.x-t.x*i.z,this._z=t.x*i.y-t.y*i.x,this._w=s),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(He(this.dot(t),-1,1)))}rotateTowards(t,i){const s=this.angleTo(t);if(s===0)return this;const l=Math.min(1,i/s);return this.slerp(t,l),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,i){const s=t._x,l=t._y,u=t._z,h=t._w,d=i._x,m=i._y,p=i._z,S=i._w;return this._x=s*S+h*d+l*p-u*m,this._y=l*S+h*m+u*d-s*p,this._z=u*S+h*p+s*m-l*d,this._w=h*S-s*d-l*m-u*p,this._onChangeCallback(),this}slerp(t,i){let s=t._x,l=t._y,u=t._z,h=t._w,d=this.dot(t);d<0&&(s=-s,l=-l,u=-u,h=-h,d=-d);let m=1-i;if(d<.9995){const p=Math.acos(d),S=Math.sin(p);m=Math.sin(m*p)/S,i=Math.sin(i*p)/S,this._x=this._x*m+s*i,this._y=this._y*m+l*i,this._z=this._z*m+u*i,this._w=this._w*m+h*i,this._onChangeCallback()}else this._x=this._x*m+s*i,this._y=this._y*m+l*i,this._z=this._z*m+u*i,this._w=this._w*m+h*i,this.normalize();return this}slerpQuaternions(t,i,s){return this.copy(t).slerp(i,s)}random(){const t=2*Math.PI*Math.random(),i=2*Math.PI*Math.random(),s=Math.random(),l=Math.sqrt(1-s),u=Math.sqrt(s);return this.set(l*Math.sin(t),l*Math.cos(t),u*Math.sin(i),u*Math.cos(i))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,i=0){return this._x=t[i],this._y=t[i+1],this._z=t[i+2],this._w=t[i+3],this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._w,t}fromBufferAttribute(t,i){return this._x=t.getX(i),this._y=t.getY(i),this._z=t.getZ(i),this._w=t.getW(i),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const x0=class x0{constructor(t=0,i=0,s=0){this.x=t,this.y=i,this.z=s}set(t,i,s){return s===void 0&&(s=this.z),this.x=t,this.y=i,this.z=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,i){return this.x=t.x*i.x,this.y=t.y*i.y,this.z=t.z*i.z,this}applyEuler(t){return this.applyQuaternion(Ox.setFromEuler(t))}applyAxisAngle(t,i){return this.applyQuaternion(Ox.setFromAxisAngle(t,i))}applyMatrix3(t){const i=this.x,s=this.y,l=this.z,u=t.elements;return this.x=u[0]*i+u[3]*s+u[6]*l,this.y=u[1]*i+u[4]*s+u[7]*l,this.z=u[2]*i+u[5]*s+u[8]*l,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const i=this.x,s=this.y,l=this.z,u=t.elements,h=1/(u[3]*i+u[7]*s+u[11]*l+u[15]);return this.x=(u[0]*i+u[4]*s+u[8]*l+u[12])*h,this.y=(u[1]*i+u[5]*s+u[9]*l+u[13])*h,this.z=(u[2]*i+u[6]*s+u[10]*l+u[14])*h,this}applyQuaternion(t){const i=this.x,s=this.y,l=this.z,u=t.x,h=t.y,d=t.z,m=t.w,p=2*(h*l-d*s),S=2*(d*i-u*l),g=2*(u*s-h*i);return this.x=i+m*p+h*g-d*S,this.y=s+m*S+d*p-u*g,this.z=l+m*g+u*S-h*p,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const i=this.x,s=this.y,l=this.z,u=t.elements;return this.x=u[0]*i+u[4]*s+u[8]*l,this.y=u[1]*i+u[5]*s+u[9]*l,this.z=u[2]*i+u[6]*s+u[10]*l,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,i){return this.x=He(this.x,t.x,i.x),this.y=He(this.y,t.y,i.y),this.z=He(this.z,t.z,i.z),this}clampScalar(t,i){return this.x=He(this.x,t,i),this.y=He(this.y,t,i),this.z=He(this.z,t,i),this}clampLength(t,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(He(s,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this}lerpVectors(t,i,s){return this.x=t.x+(i.x-t.x)*s,this.y=t.y+(i.y-t.y)*s,this.z=t.z+(i.z-t.z)*s,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,i){const s=t.x,l=t.y,u=t.z,h=i.x,d=i.y,m=i.z;return this.x=l*m-u*d,this.y=u*h-s*m,this.z=s*d-l*h,this}projectOnVector(t){const i=t.lengthSq();if(i===0)return this.set(0,0,0);const s=t.dot(this)/i;return this.copy(t).multiplyScalar(s)}projectOnPlane(t){return bp.copy(this).projectOnVector(t),this.sub(bp)}reflect(t){return this.sub(bp.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;const s=this.dot(t)/i;return Math.acos(He(s,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const i=this.x-t.x,s=this.y-t.y,l=this.z-t.z;return i*i+s*s+l*l}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,i,s){const l=Math.sin(i)*t;return this.x=l*Math.sin(s),this.y=Math.cos(i)*t,this.z=l*Math.cos(s),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,i,s){return this.x=t*Math.sin(i),this.y=s,this.z=t*Math.cos(i),this}setFromMatrixPosition(t){const i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this}setFromMatrixScale(t){const i=this.setFromMatrixColumn(t,0).length(),s=this.setFromMatrixColumn(t,1).length(),l=this.setFromMatrixColumn(t,2).length();return this.x=i,this.y=s,this.z=l,this}setFromMatrixColumn(t,i){return this.fromArray(t.elements,i*4)}setFromMatrix3Column(t,i){return this.fromArray(t.elements,i*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,i=Math.random()*2-1,s=Math.sqrt(1-i*i);return this.x=s*Math.cos(t),this.y=i,this.z=s*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};x0.prototype.isVector3=!0;let Z=x0;const bp=new Z,Ox=new tl,S0=class S0{constructor(t,i,s,l,u,h,d,m,p){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,i,s,l,u,h,d,m,p)}set(t,i,s,l,u,h,d,m,p){const S=this.elements;return S[0]=t,S[1]=l,S[2]=d,S[3]=i,S[4]=u,S[5]=m,S[6]=s,S[7]=h,S[8]=p,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const i=this.elements,s=t.elements;return i[0]=s[0],i[1]=s[1],i[2]=s[2],i[3]=s[3],i[4]=s[4],i[5]=s[5],i[6]=s[6],i[7]=s[7],i[8]=s[8],this}extractBasis(t,i,s){return t.setFromMatrix3Column(this,0),i.setFromMatrix3Column(this,1),s.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const i=t.elements;return this.set(i[0],i[4],i[8],i[1],i[5],i[9],i[2],i[6],i[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){const s=t.elements,l=i.elements,u=this.elements,h=s[0],d=s[3],m=s[6],p=s[1],S=s[4],g=s[7],_=s[2],x=s[5],b=s[8],A=l[0],y=l[3],M=l[6],N=l[1],P=l[4],L=l[7],I=l[2],U=l[5],E=l[8];return u[0]=h*A+d*N+m*I,u[3]=h*y+d*P+m*U,u[6]=h*M+d*L+m*E,u[1]=p*A+S*N+g*I,u[4]=p*y+S*P+g*U,u[7]=p*M+S*L+g*E,u[2]=_*A+x*N+b*I,u[5]=_*y+x*P+b*U,u[8]=_*M+x*L+b*E,this}multiplyScalar(t){const i=this.elements;return i[0]*=t,i[3]*=t,i[6]*=t,i[1]*=t,i[4]*=t,i[7]*=t,i[2]*=t,i[5]*=t,i[8]*=t,this}determinant(){const t=this.elements,i=t[0],s=t[1],l=t[2],u=t[3],h=t[4],d=t[5],m=t[6],p=t[7],S=t[8];return i*h*S-i*d*p-s*u*S+s*d*m+l*u*p-l*h*m}invert(){const t=this.elements,i=t[0],s=t[1],l=t[2],u=t[3],h=t[4],d=t[5],m=t[6],p=t[7],S=t[8],g=S*h-d*p,_=d*m-S*u,x=p*u-h*m,b=i*g+s*_+l*x;if(b===0)return this.set(0,0,0,0,0,0,0,0,0);const A=1/b;return t[0]=g*A,t[1]=(l*p-S*s)*A,t[2]=(d*s-l*h)*A,t[3]=_*A,t[4]=(S*i-l*m)*A,t[5]=(l*u-d*i)*A,t[6]=x*A,t[7]=(s*m-p*i)*A,t[8]=(h*i-s*u)*A,this}transpose(){let t;const i=this.elements;return t=i[1],i[1]=i[3],i[3]=t,t=i[2],i[2]=i[6],i[6]=t,t=i[5],i[5]=i[7],i[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const i=this.elements;return t[0]=i[0],t[1]=i[3],t[2]=i[6],t[3]=i[1],t[4]=i[4],t[5]=i[7],t[6]=i[2],t[7]=i[5],t[8]=i[8],this}setUvTransform(t,i,s,l,u,h,d){const m=Math.cos(u),p=Math.sin(u);return this.set(s*m,s*p,-s*(m*h+p*d)+h+t,-l*p,l*m,-l*(-p*h+m*d)+d+i,0,0,1),this}scale(t,i){return Af("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Tp.makeScale(t,i)),this}rotate(t){return Af("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Tp.makeRotation(-t)),this}translate(t,i){return Af("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Tp.makeTranslation(t,i)),this}makeTranslation(t,i){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,i,0,0,1),this}makeRotation(t){const i=Math.cos(t),s=Math.sin(t);return this.set(i,-s,0,s,i,0,0,0,1),this}makeScale(t,i){return this.set(t,0,0,0,i,0,0,0,1),this}equals(t){const i=this.elements,s=t.elements;for(let l=0;l<9;l++)if(i[l]!==s[l])return!1;return!0}fromArray(t,i=0){for(let s=0;s<9;s++)this.elements[s]=t[s+i];return this}toArray(t=[],i=0){const s=this.elements;return t[i]=s[0],t[i+1]=s[1],t[i+2]=s[2],t[i+3]=s[3],t[i+4]=s[4],t[i+5]=s[5],t[i+6]=s[6],t[i+7]=s[7],t[i+8]=s[8],t}clone(){return new this.constructor().fromArray(this.elements)}};S0.prototype.isMatrix3=!0;let Ae=S0;const Tp=new Ae,Px=new Ae().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ix=new Ae().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function vT(){const o={enabled:!0,workingColorSpace:Df,spaces:{},convert:function(l,u,h){return this.enabled===!1||u===h||!u||!h||(this.spaces[u].transfer===hn&&(l.r=ps(l.r),l.g=ps(l.g),l.b=ps(l.b)),this.spaces[u].primaries!==this.spaces[h].primaries&&(l.applyMatrix3(this.spaces[u].toXYZ),l.applyMatrix3(this.spaces[h].fromXYZ)),this.spaces[h].transfer===hn&&(l.r=Wo(l.r),l.g=Wo(l.g),l.b=Wo(l.b))),l},workingToColorSpace:function(l,u){return this.convert(l,this.workingColorSpace,u)},colorSpaceToWorking:function(l,u){return this.convert(l,u,this.workingColorSpace)},getPrimaries:function(l){return this.spaces[l].primaries},getTransfer:function(l){return l===Js?Lf:this.spaces[l].transfer},getToneMappingMode:function(l){return this.spaces[l].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(l,u=this.workingColorSpace){return l.fromArray(this.spaces[u].luminanceCoefficients)},define:function(l){Object.assign(this.spaces,l)},_getMatrix:function(l,u,h){return l.copy(this.spaces[h].fromXYZ).multiply(this.spaces[u].toXYZ)},_getDrawingBufferColorSpace:function(l){return this.spaces[l].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(l=this.workingColorSpace){return this.spaces[l].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],i=[.2126,.7152,.0722],s=[.3127,.329];return o.define({[Df]:{primaries:t,whitePoint:s,transfer:Lf,toXYZ:Px,fromXYZ:Ix,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:di},outputColorSpaceConfig:{drawingBufferColorSpace:di}},[di]:{primaries:t,whitePoint:s,transfer:hn,toXYZ:Px,fromXYZ:Ix,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:di}}}),o}const Qe=vT();function ps(o){return o<.04045?o*.0773993808:Math.pow(o*.9478672986+.0521327014,2.4)}function Wo(o){return o<.0031308?o*12.92:1.055*Math.pow(o,.41666)-.055}let bo;class _T{static getDataURL(t,i="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let s;if(t instanceof HTMLCanvasElement)s=t;else{bo===void 0&&(bo=Uf("canvas")),bo.width=t.width,bo.height=t.height;const l=bo.getContext("2d");t instanceof ImageData?l.putImageData(t,0,0):l.drawImage(t,0,0,t.width,t.height),s=bo}return s.toDataURL(i)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const i=Uf("canvas");i.width=t.width,i.height=t.height;const s=i.getContext("2d");s.drawImage(t,0,0,t.width,t.height);const l=s.getImageData(0,0,t.width,t.height),u=l.data;for(let h=0;h<u.length;h++)u[h]=ps(u[h]/255)*255;return s.putImageData(l,0,0),i}else if(t.data){const i=t.data.slice(0);for(let s=0;s<i.length;s++)i instanceof Uint8Array||i instanceof Uint8ClampedArray?i[s]=Math.floor(ps(i[s]/255)*255):i[s]=ps(i[s]);return{data:i,width:t.width,height:t.height}}else return _e("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let xT=0;class r0{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:xT++}),this.uuid=Ur(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const i=this.data;return typeof HTMLVideoElement<"u"&&i instanceof HTMLVideoElement?t.set(i.videoWidth,i.videoHeight,0):typeof VideoFrame<"u"&&i instanceof VideoFrame?t.set(i.displayWidth,i.displayHeight,0):i!==null?t.set(i.width||0,i.height||0,i.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const i=t===void 0||typeof t=="string";if(!i&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const s={uuid:this.uuid,url:""},l=this.data;if(l!==null){let u;if(Array.isArray(l)){u=[];for(let h=0,d=l.length;h<d;h++)l[h].isDataTexture?u.push(Ap(l[h].image)):u.push(Ap(l[h]))}else u=Ap(l);s.url=u}return i||(t.images[this.uuid]=s),s}}function Ap(o){return typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&o instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&o instanceof ImageBitmap?_T.getDataURL(o):o.data?{data:Array.from(o.data),width:o.width,height:o.height,type:o.data.constructor.name}:(_e("Texture: Unable to serialize Texture."),{})}let ST=0;const Rp=new Z;class _i extends Lr{constructor(t=_i.DEFAULT_IMAGE,i=_i.DEFAULT_MAPPING,s=hs,l=hs,u=Ii,h=$s,d=Ha,m=ji,p=_i.DEFAULT_ANISOTROPY,S=Js){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ST++}),this.uuid=Ur(),this.name="",this.source=new r0(t),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=s,this.wrapT=l,this.magFilter=u,this.minFilter=h,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=m,this.offset=new te(0,0),this.repeat=new te(1,1),this.center=new te(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ae,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=S,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Rp).x}get height(){return this.source.getSize(Rp).y}get depth(){return this.source.getSize(Rp).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const i in t){const s=t[i];if(s===void 0){_e(`Texture.setValues(): parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){_e(`Texture.setValues(): property '${i}' does not exist.`);continue}l&&s&&l.isVector2&&s.isVector2||l&&s&&l.isVector3&&s.isVector3||l&&s&&l.isMatrix3&&s.isMatrix3?l.copy(s):this[i]=s}}toJSON(t){const i=t===void 0||typeof t=="string";if(!i&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const s={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(s.userData=this.userData),i||(t.textures[this.uuid]=s),s}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ay)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case xc:t.x=t.x-Math.floor(t.x);break;case hs:t.x=t.x<0?0:1;break;case cm:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case xc:t.y=t.y-Math.floor(t.y);break;case hs:t.y=t.y<0?0:1;break;case cm:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}_i.DEFAULT_IMAGE=null;_i.DEFAULT_MAPPING=ay;_i.DEFAULT_ANISOTROPY=1;const y0=class y0{constructor(t=0,i=0,s=0,l=1){this.x=t,this.y=i,this.z=s,this.w=l}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,i,s,l){return this.x=t,this.y=i,this.z=s,this.w=l,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;case 3:this.w=i;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this.w=t.w+i.w,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this.w+=t.w*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this.w=t.w-i.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const i=this.x,s=this.y,l=this.z,u=this.w,h=t.elements;return this.x=h[0]*i+h[4]*s+h[8]*l+h[12]*u,this.y=h[1]*i+h[5]*s+h[9]*l+h[13]*u,this.z=h[2]*i+h[6]*s+h[10]*l+h[14]*u,this.w=h[3]*i+h[7]*s+h[11]*l+h[15]*u,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const i=Math.sqrt(1-t.w*t.w);return i<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/i,this.y=t.y/i,this.z=t.z/i),this}setAxisAngleFromRotationMatrix(t){let i,s,l,u;const m=t.elements,p=m[0],S=m[4],g=m[8],_=m[1],x=m[5],b=m[9],A=m[2],y=m[6],M=m[10];if(Math.abs(S-_)<.01&&Math.abs(g-A)<.01&&Math.abs(b-y)<.01){if(Math.abs(S+_)<.1&&Math.abs(g+A)<.1&&Math.abs(b+y)<.1&&Math.abs(p+x+M-3)<.1)return this.set(1,0,0,0),this;i=Math.PI;const P=(p+1)/2,L=(x+1)/2,I=(M+1)/2,U=(S+_)/4,E=(g+A)/4,C=(b+y)/4;return P>L&&P>I?P<.01?(s=0,l=.707106781,u=.707106781):(s=Math.sqrt(P),l=U/s,u=E/s):L>I?L<.01?(s=.707106781,l=0,u=.707106781):(l=Math.sqrt(L),s=U/l,u=C/l):I<.01?(s=.707106781,l=.707106781,u=0):(u=Math.sqrt(I),s=E/u,l=C/u),this.set(s,l,u,i),this}let N=Math.sqrt((y-b)*(y-b)+(g-A)*(g-A)+(_-S)*(_-S));return Math.abs(N)<.001&&(N=1),this.x=(y-b)/N,this.y=(g-A)/N,this.z=(_-S)/N,this.w=Math.acos((p+x+M-1)/2),this}setFromMatrixPosition(t){const i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this.w=i[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,i){return this.x=He(this.x,t.x,i.x),this.y=He(this.y,t.y,i.y),this.z=He(this.z,t.z,i.z),this.w=He(this.w,t.w,i.w),this}clampScalar(t,i){return this.x=He(this.x,t,i),this.y=He(this.y,t,i),this.z=He(this.z,t,i),this.w=He(this.w,t,i),this}clampLength(t,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(He(s,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this.w+=(t.w-this.w)*i,this}lerpVectors(t,i,s){return this.x=t.x+(i.x-t.x)*s,this.y=t.y+(i.y-t.y)*s,this.z=t.z+(i.z-t.z)*s,this.w=t.w+(i.w-t.w)*s,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this.w=t[i+3],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t[i+3]=this.w,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this.w=t.getW(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};y0.prototype.isVector4=!0;let Dn=y0;class yT extends Lr{constructor(t=1,i=1,s={}){super(),s=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ii,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},s),this.isRenderTarget=!0,this.width=t,this.height=i,this.depth=s.depth,this.scissor=new Dn(0,0,t,i),this.scissorTest=!1,this.viewport=new Dn(0,0,t,i),this.textures=[];const l=s.count;for(let u=0;u<l;u++)this.textures[u]=new _i({width:t,height:i,depth:s.depth}),this.textures[u].isRenderTargetTexture=!0,this.textures[u].renderTarget=this;this._setTextureOptions(s),this.depthBuffer=s.depthBuffer,this.stencilBuffer=s.stencilBuffer,this.resolveColorBuffer=s.resolveColorBuffer,this.resolveDepthBuffer=s.resolveDepthBuffer,this.resolveStencilBuffer=s.resolveStencilBuffer,this.storeMultisampledColorBuffer=s.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=s.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=s.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=s.depthTexture,this.samples=s.samples,this.multiview=s.multiview,this.useArrayDepthTexture=s.useArrayDepthTexture}_setTextureOptions(t={}){const i={minFilter:Ii,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(i.mapping=t.mapping),t.wrapS!==void 0&&(i.wrapS=t.wrapS),t.wrapT!==void 0&&(i.wrapT=t.wrapT),t.wrapR!==void 0&&(i.wrapR=t.wrapR),t.magFilter!==void 0&&(i.magFilter=t.magFilter),t.minFilter!==void 0&&(i.minFilter=t.minFilter),t.format!==void 0&&(i.format=t.format),t.type!==void 0&&(i.type=t.type),t.anisotropy!==void 0&&(i.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(i.colorSpace=t.colorSpace),t.flipY!==void 0&&(i.flipY=t.flipY),t.generateMipmaps!==void 0&&(i.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(i.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(i.internalFormat=t.internalFormat);for(let s=0;s<this.textures.length;s++)this.textures[s].setValues(i)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,i,s=1){if(this.width!==t||this.height!==i||this.depth!==s){this.width=t,this.height=i,this.depth=s;for(let l=0,u=this.textures.length;l<u;l++)this.textures[l].image.width=t,this.textures[l].image.height=i,this.textures[l].image.depth=s,this.textures[l].isData3DTexture!==!0&&(this.textures[l].isArrayTexture=this.textures[l].image.depth>1);this.dispose()}this.viewport.set(0,0,t,i),this.scissor.set(0,0,t,i)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let i=0,s=t.textures.length;i<s;i++){this.textures[i]=t.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;const l=Object.assign({},t.textures[i].image);this.textures[i].source=new r0(l)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){const i=t.depthTexture.clone();i.renderTarget=null,this.depthTexture=i}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ga extends yT{constructor(t=1,i=1,s={}){super(t,i,s),this.isWebGLRenderTarget=!0}}class _y extends _i{constructor(t=null,i=1,s=1,l=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:i,height:s,depth:l},this.magFilter=pi,this.minFilter=pi,this.wrapR=hs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class MT extends _i{constructor(t=null,i=1,s=1,l=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:i,height:s,depth:l},this.magFilter=pi,this.minFilter=pi,this.wrapR=hs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}const Gf=class Gf{constructor(t,i,s,l,u,h,d,m,p,S,g,_,x,b,A,y){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,i,s,l,u,h,d,m,p,S,g,_,x,b,A,y)}set(t,i,s,l,u,h,d,m,p,S,g,_,x,b,A,y){const M=this.elements;return M[0]=t,M[4]=i,M[8]=s,M[12]=l,M[1]=u,M[5]=h,M[9]=d,M[13]=m,M[2]=p,M[6]=S,M[10]=g,M[14]=_,M[3]=x,M[7]=b,M[11]=A,M[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Gf().fromArray(this.elements)}copy(t){const i=this.elements,s=t.elements;return i[0]=s[0],i[1]=s[1],i[2]=s[2],i[3]=s[3],i[4]=s[4],i[5]=s[5],i[6]=s[6],i[7]=s[7],i[8]=s[8],i[9]=s[9],i[10]=s[10],i[11]=s[11],i[12]=s[12],i[13]=s[13],i[14]=s[14],i[15]=s[15],this}copyPosition(t){const i=this.elements,s=t.elements;return i[12]=s[12],i[13]=s[13],i[14]=s[14],this}setFromMatrix3(t){const i=t.elements;return this.set(i[0],i[3],i[6],0,i[1],i[4],i[7],0,i[2],i[5],i[8],0,0,0,0,1),this}extractBasis(t,i,s){return this.determinantAffine()===0?(t.set(1,0,0),i.set(0,1,0),s.set(0,0,1),this):(t.setFromMatrixColumn(this,0),i.setFromMatrixColumn(this,1),s.setFromMatrixColumn(this,2),this)}makeBasis(t,i,s){return this.set(t.x,i.x,s.x,0,t.y,i.y,s.y,0,t.z,i.z,s.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const i=this.elements,s=t.elements,l=1/To.setFromMatrixColumn(t,0).length(),u=1/To.setFromMatrixColumn(t,1).length(),h=1/To.setFromMatrixColumn(t,2).length();return i[0]=s[0]*l,i[1]=s[1]*l,i[2]=s[2]*l,i[3]=0,i[4]=s[4]*u,i[5]=s[5]*u,i[6]=s[6]*u,i[7]=0,i[8]=s[8]*h,i[9]=s[9]*h,i[10]=s[10]*h,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromEuler(t){const i=this.elements,s=t.x,l=t.y,u=t.z,h=Math.cos(s),d=Math.sin(s),m=Math.cos(l),p=Math.sin(l),S=Math.cos(u),g=Math.sin(u);if(t.order==="XYZ"){const _=h*S,x=h*g,b=d*S,A=d*g;i[0]=m*S,i[4]=-m*g,i[8]=p,i[1]=x+b*p,i[5]=_-A*p,i[9]=-d*m,i[2]=A-_*p,i[6]=b+x*p,i[10]=h*m}else if(t.order==="YXZ"){const _=m*S,x=m*g,b=p*S,A=p*g;i[0]=_+A*d,i[4]=b*d-x,i[8]=h*p,i[1]=h*g,i[5]=h*S,i[9]=-d,i[2]=x*d-b,i[6]=A+_*d,i[10]=h*m}else if(t.order==="ZXY"){const _=m*S,x=m*g,b=p*S,A=p*g;i[0]=_-A*d,i[4]=-h*g,i[8]=b+x*d,i[1]=x+b*d,i[5]=h*S,i[9]=A-_*d,i[2]=-h*p,i[6]=d,i[10]=h*m}else if(t.order==="ZYX"){const _=h*S,x=h*g,b=d*S,A=d*g;i[0]=m*S,i[4]=b*p-x,i[8]=_*p+A,i[1]=m*g,i[5]=A*p+_,i[9]=x*p-b,i[2]=-p,i[6]=d*m,i[10]=h*m}else if(t.order==="YZX"){const _=h*m,x=h*p,b=d*m,A=d*p;i[0]=m*S,i[4]=A-_*g,i[8]=b*g+x,i[1]=g,i[5]=h*S,i[9]=-d*S,i[2]=-p*S,i[6]=x*g+b,i[10]=_-A*g}else if(t.order==="XZY"){const _=h*m,x=h*p,b=d*m,A=d*p;i[0]=m*S,i[4]=-g,i[8]=p*S,i[1]=_*g+A,i[5]=h*S,i[9]=x*g-b,i[2]=b*g-x,i[6]=d*S,i[10]=A*g+_}return i[3]=0,i[7]=0,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ET,t,bT)}lookAt(t,i,s){const l=this.elements;return Wi.subVectors(t,i),Wi.lengthSq()===0&&(Wi.z=1),Wi.normalize(),ks.crossVectors(s,Wi),ks.lengthSq()===0&&(Math.abs(s.z)===1?Wi.x+=1e-4:Wi.z+=1e-4,Wi.normalize(),ks.crossVectors(s,Wi)),ks.normalize(),ku.crossVectors(Wi,ks),l[0]=ks.x,l[4]=ku.x,l[8]=Wi.x,l[1]=ks.y,l[5]=ku.y,l[9]=Wi.y,l[2]=ks.z,l[6]=ku.z,l[10]=Wi.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){const s=t.elements,l=i.elements,u=this.elements,h=s[0],d=s[4],m=s[8],p=s[12],S=s[1],g=s[5],_=s[9],x=s[13],b=s[2],A=s[6],y=s[10],M=s[14],N=s[3],P=s[7],L=s[11],I=s[15],U=l[0],E=l[4],C=l[8],W=l[12],H=l[1],K=l[5],J=l[9],ut=l[13],V=l[2],st=l[6],k=l[10],Y=l[14],dt=l[3],ot=l[7],ht=l[11],Tt=l[15];return u[0]=h*U+d*H+m*V+p*dt,u[4]=h*E+d*K+m*st+p*ot,u[8]=h*C+d*J+m*k+p*ht,u[12]=h*W+d*ut+m*Y+p*Tt,u[1]=S*U+g*H+_*V+x*dt,u[5]=S*E+g*K+_*st+x*ot,u[9]=S*C+g*J+_*k+x*ht,u[13]=S*W+g*ut+_*Y+x*Tt,u[2]=b*U+A*H+y*V+M*dt,u[6]=b*E+A*K+y*st+M*ot,u[10]=b*C+A*J+y*k+M*ht,u[14]=b*W+A*ut+y*Y+M*Tt,u[3]=N*U+P*H+L*V+I*dt,u[7]=N*E+P*K+L*st+I*ot,u[11]=N*C+P*J+L*k+I*ht,u[15]=N*W+P*ut+L*Y+I*Tt,this}multiplyScalar(t){const i=this.elements;return i[0]*=t,i[4]*=t,i[8]*=t,i[12]*=t,i[1]*=t,i[5]*=t,i[9]*=t,i[13]*=t,i[2]*=t,i[6]*=t,i[10]*=t,i[14]*=t,i[3]*=t,i[7]*=t,i[11]*=t,i[15]*=t,this}determinant(){const t=this.elements,i=t[0],s=t[4],l=t[8],u=t[12],h=t[1],d=t[5],m=t[9],p=t[13],S=t[2],g=t[6],_=t[10],x=t[14],b=t[3],A=t[7],y=t[11],M=t[15],N=m*x-p*_,P=d*x-p*g,L=d*_-m*g,I=h*x-p*S,U=h*_-m*S,E=h*g-d*S;return i*(A*N-y*P+M*L)-s*(b*N-y*I+M*U)+l*(b*P-A*I+M*E)-u*(b*L-A*U+y*E)}determinantAffine(){const t=this.elements,i=t[0],s=t[4],l=t[8],u=t[1],h=t[5],d=t[9],m=t[2],p=t[6],S=t[10];return i*(h*S-d*p)-s*(u*S-d*m)+l*(u*p-h*m)}transpose(){const t=this.elements;let i;return i=t[1],t[1]=t[4],t[4]=i,i=t[2],t[2]=t[8],t[8]=i,i=t[6],t[6]=t[9],t[9]=i,i=t[3],t[3]=t[12],t[12]=i,i=t[7],t[7]=t[13],t[13]=i,i=t[11],t[11]=t[14],t[14]=i,this}setPosition(t,i,s){const l=this.elements;return t.isVector3?(l[12]=t.x,l[13]=t.y,l[14]=t.z):(l[12]=t,l[13]=i,l[14]=s),this}invert(){const t=this.elements,i=t[0],s=t[1],l=t[2],u=t[3],h=t[4],d=t[5],m=t[6],p=t[7],S=t[8],g=t[9],_=t[10],x=t[11],b=t[12],A=t[13],y=t[14],M=t[15],N=i*d-s*h,P=i*m-l*h,L=i*p-u*h,I=s*m-l*d,U=s*p-u*d,E=l*p-u*m,C=S*A-g*b,W=S*y-_*b,H=S*M-x*b,K=g*y-_*A,J=g*M-x*A,ut=_*M-x*y,V=N*ut-P*J+L*K+I*H-U*W+E*C;if(V===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const st=1/V;return t[0]=(d*ut-m*J+p*K)*st,t[1]=(l*J-s*ut-u*K)*st,t[2]=(A*E-y*U+M*I)*st,t[3]=(_*U-g*E-x*I)*st,t[4]=(m*H-h*ut-p*W)*st,t[5]=(i*ut-l*H+u*W)*st,t[6]=(y*L-b*E-M*P)*st,t[7]=(S*E-_*L+x*P)*st,t[8]=(h*J-d*H+p*C)*st,t[9]=(s*H-i*J-u*C)*st,t[10]=(b*U-A*L+M*N)*st,t[11]=(g*L-S*U-x*N)*st,t[12]=(d*W-h*K-m*C)*st,t[13]=(i*K-s*W+l*C)*st,t[14]=(A*P-b*I-y*N)*st,t[15]=(S*I-g*P+_*N)*st,this}scale(t){const i=this.elements,s=t.x,l=t.y,u=t.z;return i[0]*=s,i[4]*=l,i[8]*=u,i[1]*=s,i[5]*=l,i[9]*=u,i[2]*=s,i[6]*=l,i[10]*=u,i[3]*=s,i[7]*=l,i[11]*=u,this}getMaxScaleOnAxis(){const t=this.elements,i=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],s=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],l=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(i,s,l))}makeTranslation(t,i,s){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,i,0,0,1,s,0,0,0,1),this}makeRotationX(t){const i=Math.cos(t),s=Math.sin(t);return this.set(1,0,0,0,0,i,-s,0,0,s,i,0,0,0,0,1),this}makeRotationY(t){const i=Math.cos(t),s=Math.sin(t);return this.set(i,0,s,0,0,1,0,0,-s,0,i,0,0,0,0,1),this}makeRotationZ(t){const i=Math.cos(t),s=Math.sin(t);return this.set(i,-s,0,0,s,i,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,i){const s=Math.cos(i),l=Math.sin(i),u=1-s,h=t.x,d=t.y,m=t.z,p=u*h,S=u*d;return this.set(p*h+s,p*d-l*m,p*m+l*d,0,p*d+l*m,S*d+s,S*m-l*h,0,p*m-l*d,S*m+l*h,u*m*m+s,0,0,0,0,1),this}makeScale(t,i,s){return this.set(t,0,0,0,0,i,0,0,0,0,s,0,0,0,0,1),this}makeShear(t,i,s,l,u,h){return this.set(1,s,u,0,t,1,h,0,i,l,1,0,0,0,0,1),this}compose(t,i,s){const l=this.elements,u=i._x,h=i._y,d=i._z,m=i._w,p=u+u,S=h+h,g=d+d,_=u*p,x=u*S,b=u*g,A=h*S,y=h*g,M=d*g,N=m*p,P=m*S,L=m*g,I=s.x,U=s.y,E=s.z;return l[0]=(1-(A+M))*I,l[1]=(x+L)*I,l[2]=(b-P)*I,l[3]=0,l[4]=(x-L)*U,l[5]=(1-(_+M))*U,l[6]=(y+N)*U,l[7]=0,l[8]=(b+P)*E,l[9]=(y-N)*E,l[10]=(1-(_+A))*E,l[11]=0,l[12]=t.x,l[13]=t.y,l[14]=t.z,l[15]=1,this}decompose(t,i,s){const l=this.elements;t.x=l[12],t.y=l[13],t.z=l[14];const u=this.determinantAffine();if(u===0)return s.set(1,1,1),i.identity(),this;let h=To.set(l[0],l[1],l[2]).length();const d=To.set(l[4],l[5],l[6]).length(),m=To.set(l[8],l[9],l[10]).length();u<0&&(h=-h),va.copy(this);const p=1/h,S=1/d,g=1/m;return va.elements[0]*=p,va.elements[1]*=p,va.elements[2]*=p,va.elements[4]*=S,va.elements[5]*=S,va.elements[6]*=S,va.elements[8]*=g,va.elements[9]*=g,va.elements[10]*=g,i.setFromRotationMatrix(va),s.x=h,s.y=d,s.z=m,this}makePerspective(t,i,s,l,u,h,d=Ea,m=!1){const p=this.elements,S=2*u/(i-t),g=2*u/(s-l),_=(i+t)/(i-t),x=(s+l)/(s-l);let b,A;if(m)b=u/(h-u),A=h*u/(h-u);else if(d===Ea)b=-(h+u)/(h-u),A=-2*h*u/(h-u);else if(d===yc)b=-h/(h-u),A=-h*u/(h-u);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return p[0]=S,p[4]=0,p[8]=_,p[12]=0,p[1]=0,p[5]=g,p[9]=x,p[13]=0,p[2]=0,p[6]=0,p[10]=b,p[14]=A,p[3]=0,p[7]=0,p[11]=-1,p[15]=0,this}makeOrthographic(t,i,s,l,u,h,d=Ea,m=!1){const p=this.elements,S=2/(i-t),g=2/(s-l),_=-(i+t)/(i-t),x=-(s+l)/(s-l);let b,A;if(m)b=1/(h-u),A=h/(h-u);else if(d===Ea)b=-2/(h-u),A=-(h+u)/(h-u);else if(d===yc)b=-1/(h-u),A=-u/(h-u);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return p[0]=S,p[4]=0,p[8]=0,p[12]=_,p[1]=0,p[5]=g,p[9]=0,p[13]=x,p[2]=0,p[6]=0,p[10]=b,p[14]=A,p[3]=0,p[7]=0,p[11]=0,p[15]=1,this}equals(t){const i=this.elements,s=t.elements;for(let l=0;l<16;l++)if(i[l]!==s[l])return!1;return!0}fromArray(t,i=0){for(let s=0;s<16;s++)this.elements[s]=t[s+i];return this}toArray(t=[],i=0){const s=this.elements;return t[i]=s[0],t[i+1]=s[1],t[i+2]=s[2],t[i+3]=s[3],t[i+4]=s[4],t[i+5]=s[5],t[i+6]=s[6],t[i+7]=s[7],t[i+8]=s[8],t[i+9]=s[9],t[i+10]=s[10],t[i+11]=s[11],t[i+12]=s[12],t[i+13]=s[13],t[i+14]=s[14],t[i+15]=s[15],t}};Gf.prototype.isMatrix4=!0;let sn=Gf;const To=new Z,va=new sn,ET=new Z(0,0,0),bT=new Z(1,1,1),ks=new Z,ku=new Z,Wi=new Z,zx=new sn,Bx=new tl;class nr{constructor(t=0,i=0,s=0,l=nr.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=i,this._z=s,this._order=l}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,i,s,l=this._order){return this._x=t,this._y=i,this._z=s,this._order=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,i=this._order,s=!0){const l=t.elements,u=l[0],h=l[4],d=l[8],m=l[1],p=l[5],S=l[9],g=l[2],_=l[6],x=l[10];switch(i){case"XYZ":this._y=Math.asin(He(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-S,x),this._z=Math.atan2(-h,u)):(this._x=Math.atan2(_,p),this._z=0);break;case"YXZ":this._x=Math.asin(-He(S,-1,1)),Math.abs(S)<.9999999?(this._y=Math.atan2(d,x),this._z=Math.atan2(m,p)):(this._y=Math.atan2(-g,u),this._z=0);break;case"ZXY":this._x=Math.asin(He(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(-g,x),this._z=Math.atan2(-h,p)):(this._y=0,this._z=Math.atan2(m,u));break;case"ZYX":this._y=Math.asin(-He(g,-1,1)),Math.abs(g)<.9999999?(this._x=Math.atan2(_,x),this._z=Math.atan2(m,u)):(this._x=0,this._z=Math.atan2(-h,p));break;case"YZX":this._z=Math.asin(He(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(-S,p),this._y=Math.atan2(-g,u)):(this._x=0,this._y=Math.atan2(d,x));break;case"XZY":this._z=Math.asin(-He(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(_,p),this._y=Math.atan2(d,u)):(this._x=Math.atan2(-S,x),this._y=0);break;default:_e("Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,s===!0&&this._onChangeCallback(),this}setFromQuaternion(t,i,s){return zx.makeRotationFromQuaternion(t),this.setFromRotationMatrix(zx,i,s)}setFromVector3(t,i=this._order){return this.set(t.x,t.y,t.z,i)}reorder(t){return Bx.setFromEuler(this),this.setFromQuaternion(Bx,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}nr.DEFAULT_ORDER="XYZ";class o0{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let TT=0;const Fx=new Z,Ao=new tl,as=new sn,qu=new Z,jl=new Z,AT=new Z,RT=new tl,Hx=new Z(1,0,0),Gx=new Z(0,1,0),Vx=new Z(0,0,1),Xx={type:"added"},wT={type:"removed"},Ro={type:"childadded",child:null},wp={type:"childremoved",child:null};class Wn extends Lr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:TT++}),this.uuid=Ur(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Wn.DEFAULT_UP.clone();const t=new Z,i=new nr,s=new tl,l=new Z(1,1,1);function u(){s.setFromEuler(i,!1)}function h(){i.setFromQuaternion(s,void 0,!1)}i._onChange(u),s._onChange(h),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:s},scale:{configurable:!0,enumerable:!0,value:l},modelViewMatrix:{value:new sn},normalMatrix:{value:new Ae}}),this.matrix=new sn,this.matrixWorld=new sn,this.matrixAutoUpdate=Wn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Wn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new o0,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,i){this.quaternion.setFromAxisAngle(t,i)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,i){return Ao.setFromAxisAngle(t,i),this.quaternion.multiply(Ao),this}rotateOnWorldAxis(t,i){return Ao.setFromAxisAngle(t,i),this.quaternion.premultiply(Ao),this}rotateX(t){return this.rotateOnAxis(Hx,t)}rotateY(t){return this.rotateOnAxis(Gx,t)}rotateZ(t){return this.rotateOnAxis(Vx,t)}translateOnAxis(t,i){return Fx.copy(t).applyQuaternion(this.quaternion),this.position.add(Fx.multiplyScalar(i)),this}translateX(t){return this.translateOnAxis(Hx,t)}translateY(t){return this.translateOnAxis(Gx,t)}translateZ(t){return this.translateOnAxis(Vx,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(as.copy(this.matrixWorld).invert())}lookAt(t,i,s){t.isVector3?qu.copy(t):qu.set(t,i,s);const l=this.parent;this.updateWorldMatrix(!0,!1),jl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?as.lookAt(jl,qu,this.up):as.lookAt(qu,jl,this.up),this.quaternion.setFromRotationMatrix(as),l&&(as.extractRotation(l.matrixWorld),Ao.setFromRotationMatrix(as),this.quaternion.premultiply(Ao.invert()))}add(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return t===this?(en("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Xx),Ro.child=t,this.dispatchEvent(Ro),Ro.child=null):en("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let s=0;s<arguments.length;s++)this.remove(arguments[s]);return this}const i=this.children.indexOf(t);return i!==-1&&(t.parent=null,this.children.splice(i,1),t.dispatchEvent(wT),wp.child=t,this.dispatchEvent(wp),wp.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),as.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),as.multiply(t.parent.matrixWorld)),t.applyMatrix4(as),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Xx),Ro.child=t,this.dispatchEvent(Ro),Ro.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,i){if(this[t]===i)return this;for(let s=0,l=this.children.length;s<l;s++){const h=this.children[s].getObjectByProperty(t,i);if(h!==void 0)return h}}getObjectsByProperty(t,i,s=[]){this[t]===i&&s.push(this);const l=this.children;for(let u=0,h=l.length;u<h;u++)l[u].getObjectsByProperty(t,i,s);return s}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(jl,t,AT),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(jl,RT,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const i=this.matrixWorld.elements;return t.set(i[8],i[9],i[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].traverseVisible(t)}traverseAncestors(t){const i=this.parent;i!==null&&(t(i),i.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const i=t.x,s=t.y,l=t.z,u=this.matrix.elements;u[12]+=i-u[0]*i-u[4]*s-u[8]*l,u[13]+=s-u[1]*i-u[5]*s-u[9]*l,u[14]+=l-u[2]*i-u[6]*s-u[10]*l}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].updateMatrixWorld(t)}updateWorldMatrix(t,i,s=!1){const l=this.parent;if(t===!0&&l!==null&&l.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||s)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,s=!0),i===!0){const u=this.children;for(let h=0,d=u.length;h<d;h++)u[h].updateWorldMatrix(!1,!0,s)}}toJSON(t){const i=t===void 0||typeof t=="string",s={};i&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},s.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const l={};l.uuid=this.uuid,l.type=this.type,l.name=this.name,l.castShadow=this.castShadow,l.receiveShadow=this.receiveShadow,l.visible=this.visible,l.frustumCulled=this.frustumCulled,l.renderOrder=this.renderOrder,l.static=this.static,l.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(l.userData=this.userData),l.layers=this.layers.mask,l.matrix=this.matrix.toArray(),l.up=this.up.toArray(),this.pivot!==null&&(l.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(l.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(l.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(l.type="InstancedMesh",l.count=this.count,l.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(l.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(l.type="BatchedMesh",l.perObjectFrustumCulled=this.perObjectFrustumCulled,l.sortObjects=this.sortObjects,l.drawRanges=this._drawRanges,l.reservedRanges=this._reservedRanges,l.geometryInfo=this._geometryInfo.map(d=>({...d,boundingBox:d.boundingBox?d.boundingBox.toJSON():void 0,boundingSphere:d.boundingSphere?d.boundingSphere.toJSON():void 0})),l.instanceInfo=this._instanceInfo.map(d=>({...d})),l.availableInstanceIds=this._availableInstanceIds.slice(),l.availableGeometryIds=this._availableGeometryIds.slice(),l.nextIndexStart=this._nextIndexStart,l.nextVertexStart=this._nextVertexStart,l.geometryCount=this._geometryCount,l.maxInstanceCount=this._maxInstanceCount,l.maxVertexCount=this._maxVertexCount,l.maxIndexCount=this._maxIndexCount,l.geometryInitialized=this._geometryInitialized,l.matricesTexture=this._matricesTexture.toJSON(t),l.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(l.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(l.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(l.boundingBox=this.boundingBox.toJSON()));function u(d,m){return d[m.uuid]===void 0&&(d[m.uuid]=m.toJSON(t)),m.uuid}if(this.isScene)this.background&&(this.background.isColor?l.background=this.background.toJSON():this.background.isTexture&&(l.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(l.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){l.geometry=u(t.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const m=d.shapes;if(Array.isArray(m))for(let p=0,S=m.length;p<S;p++){const g=m[p];u(t.shapes,g)}else u(t.shapes,m)}}if(this.isSkinnedMesh&&(l.bindMode=this.bindMode,l.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(u(t.skeletons,this.skeleton),l.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let m=0,p=this.material.length;m<p;m++)d.push(u(t.materials,this.material[m]));l.material=d}else l.material=u(t.materials,this.material);if(this.children.length>0){l.children=[];for(let d=0;d<this.children.length;d++)l.children.push(this.children[d].toJSON(t).object)}if(this.animations.length>0){l.animations=[];for(let d=0;d<this.animations.length;d++){const m=this.animations[d];l.animations.push(u(t.animations,m))}}if(i){const d=h(t.geometries),m=h(t.materials),p=h(t.textures),S=h(t.images),g=h(t.shapes),_=h(t.skeletons),x=h(t.animations),b=h(t.nodes);d.length>0&&(s.geometries=d),m.length>0&&(s.materials=m),p.length>0&&(s.textures=p),S.length>0&&(s.images=S),g.length>0&&(s.shapes=g),_.length>0&&(s.skeletons=_),x.length>0&&(s.animations=x),b.length>0&&(s.nodes=b)}return s.object=l,s;function h(d){const m=[];for(const p in d){const S=d[p];delete S.metadata,m.push(S)}return m}}clone(t){return new this.constructor().copy(this,t)}copy(t,i=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),i===!0)for(let s=0;s<t.children.length;s++){const l=t.children[s];this.add(l.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Wn.DEFAULT_UP=new Z(0,1,0);Wn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Wn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Sa extends Wn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const CT={type:"move"};class Cp{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Sa,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Sa,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Sa,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Z,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const i=this._hand;if(i)for(const s of t.hand.values())this._getHandJoint(i,s)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,i,s){let l=null,u=null,h=null;const d=this._targetRay,m=this._grip,p=this._hand;if(t&&i.session.visibilityState!=="visible-blurred"){if(p&&t.hand){h=!0;for(const A of t.hand.values()){const y=i.getJointPose(A,s),M=this._getHandJoint(p,A);y!==null&&(M.matrix.fromArray(y.transform.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale),M.matrixWorldNeedsUpdate=!0,M.jointRadius=y.radius),M.visible=y!==null}const S=p.joints["index-finger-tip"],g=p.joints["thumb-tip"],_=S.position.distanceTo(g.position),x=.02,b=.005;p.inputState.pinching&&_>x+b?(p.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!p.inputState.pinching&&_<=x-b&&(p.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else m!==null&&t.gripSpace&&(u=i.getPose(t.gripSpace,s),u!==null&&(m.matrix.fromArray(u.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,u.linearVelocity?(m.hasLinearVelocity=!0,m.linearVelocity.copy(u.linearVelocity)):m.hasLinearVelocity=!1,u.angularVelocity?(m.hasAngularVelocity=!0,m.angularVelocity.copy(u.angularVelocity)):m.hasAngularVelocity=!1,m.eventsEnabled&&m.dispatchEvent({type:"gripUpdated",data:t,target:this})));d!==null&&(l=i.getPose(t.targetRaySpace,s),l===null&&u!==null&&(l=u),l!==null&&(d.matrix.fromArray(l.transform.matrix),d.matrix.decompose(d.position,d.quaternion,d.scale),d.matrixWorldNeedsUpdate=!0,l.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(l.linearVelocity)):d.hasLinearVelocity=!1,l.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(l.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(CT)))}return d!==null&&(d.visible=l!==null),m!==null&&(m.visible=u!==null),p!==null&&(p.visible=h!==null),this}_getHandJoint(t,i){if(t.joints[i.jointName]===void 0){const s=new Sa;s.matrixAutoUpdate=!1,s.visible=!1,t.joints[i.jointName]=s,t.add(s)}return t.joints[i.jointName]}}const xy={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qs={h:0,s:0,l:0},Wu={h:0,s:0,l:0};function Np(o,t,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?o+(t-o)*6*i:i<1/2?t:i<2/3?o+(t-o)*6*(2/3-i):o}class he{constructor(t,i,s){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,i,s)}set(t,i,s){if(i===void 0&&s===void 0){const l=t;l&&l.isColor?this.copy(l):typeof l=="number"?this.setHex(l):typeof l=="string"&&this.setStyle(l)}else this.setRGB(t,i,s);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,i=di){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Qe.colorSpaceToWorking(this,i),this}setRGB(t,i,s,l=Qe.workingColorSpace){return this.r=t,this.g=i,this.b=s,Qe.colorSpaceToWorking(this,l),this}setHSL(t,i,s,l=Qe.workingColorSpace){if(t=mT(t,1),i=He(i,0,1),s=He(s,0,1),i===0)this.r=this.g=this.b=s;else{const u=s<=.5?s*(1+i):s+i-s*i,h=2*s-u;this.r=Np(h,u,t+1/3),this.g=Np(h,u,t),this.b=Np(h,u,t-1/3)}return Qe.colorSpaceToWorking(this,l),this}setStyle(t,i=di){function s(u){u!==void 0&&parseFloat(u)<1&&_e("Color: Alpha component of "+t+" will be ignored.")}let l;if(l=/^(\w+)\(([^\)]*)\)/.exec(t)){let u;const h=l[1],d=l[2];switch(h){case"rgb":case"rgba":if(u=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(d))return s(u[4]),this.setRGB(Math.min(255,parseInt(u[1],10))/255,Math.min(255,parseInt(u[2],10))/255,Math.min(255,parseInt(u[3],10))/255,i);if(u=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(d))return s(u[4]),this.setRGB(Math.min(100,parseFloat(u[1]))/100,Math.min(100,parseFloat(u[2]))/100,Math.min(100,parseFloat(u[3]))/100,i);break;case"hsl":case"hsla":if(u=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(d))return s(u[4]),this.setHSL(parseFloat(u[1])/360,parseFloat(u[2])/100,parseFloat(u[3])/100,i);break;default:_e("Color: Unknown color model "+t)}}else if(l=/^\#([A-Fa-f\d]+)$/.exec(t)){const u=l[1],h=u.length;if(h===3)return this.setRGB(parseInt(u.charAt(0),16)/15,parseInt(u.charAt(1),16)/15,parseInt(u.charAt(2),16)/15,i);if(h===6)return this.setHex(parseInt(u,16),i);_e("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,i);return this}setColorName(t,i=di){const s=xy[t.toLowerCase()];return s!==void 0?this.setHex(s,i):_e("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ps(t.r),this.g=ps(t.g),this.b=ps(t.b),this}copyLinearToSRGB(t){return this.r=Wo(t.r),this.g=Wo(t.g),this.b=Wo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=di){return Qe.workingToColorSpace(vi.copy(this),t),Math.round(He(vi.r*255,0,255))*65536+Math.round(He(vi.g*255,0,255))*256+Math.round(He(vi.b*255,0,255))}getHexString(t=di){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,i=Qe.workingColorSpace){Qe.workingToColorSpace(vi.copy(this),i);const s=vi.r,l=vi.g,u=vi.b,h=Math.max(s,l,u),d=Math.min(s,l,u);let m,p;const S=(d+h)/2;if(d===h)m=0,p=0;else{const g=h-d;switch(p=S<=.5?g/(h+d):g/(2-h-d),h){case s:m=(l-u)/g+(l<u?6:0);break;case l:m=(u-s)/g+2;break;case u:m=(s-l)/g+4;break}m/=6}return t.h=m,t.s=p,t.l=S,t}getRGB(t,i=Qe.workingColorSpace){return Qe.workingToColorSpace(vi.copy(this),i),t.r=vi.r,t.g=vi.g,t.b=vi.b,t}getStyle(t=di){Qe.workingToColorSpace(vi.copy(this),t);const i=vi.r,s=vi.g,l=vi.b;return t!==di?`color(${t} ${i.toFixed(3)} ${s.toFixed(3)} ${l.toFixed(3)})`:`rgb(${Math.round(i*255)},${Math.round(s*255)},${Math.round(l*255)})`}offsetHSL(t,i,s){return this.getHSL(qs),this.setHSL(qs.h+t,qs.s+i,qs.l+s)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,i){return this.r=t.r+i.r,this.g=t.g+i.g,this.b=t.b+i.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,i){return this.r+=(t.r-this.r)*i,this.g+=(t.g-this.g)*i,this.b+=(t.b-this.b)*i,this}lerpColors(t,i,s){return this.r=t.r+(i.r-t.r)*s,this.g=t.g+(i.g-t.g)*s,this.b=t.b+(i.b-t.b)*s,this}lerpHSL(t,i){this.getHSL(qs),t.getHSL(Wu);const s=Ep(qs.h,Wu.h,i),l=Ep(qs.s,Wu.s,i),u=Ep(qs.l,Wu.l,i);return this.setHSL(s,l,u),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const i=this.r,s=this.g,l=this.b,u=t.elements;return this.r=u[0]*i+u[3]*s+u[6]*l,this.g=u[1]*i+u[4]*s+u[7]*l,this.b=u[2]*i+u[5]*s+u[8]*l,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,i=0){return this.r=t[i],this.g=t[i+1],this.b=t[i+2],this}toArray(t=[],i=0){return t[i]=this.r,t[i+1]=this.g,t[i+2]=this.b,t}fromBufferAttribute(t,i){return this.r=t.getX(i),this.g=t.getY(i),this.b=t.getZ(i),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const vi=new he;he.NAMES=xy;class l0{constructor(t,i=25e-5){this.isFogExp2=!0,this.name="",this.color=new he(t),this.density=i}clone(){return new l0(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class NT extends Wn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new nr,this.environmentIntensity=1,this.environmentRotation=new nr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,i){return super.copy(t,i),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const i=super.toJSON(t);return this.fog!==null&&(i.object.fog=this.fog.toJSON()),i.object.backgroundBlurriness=this.backgroundBlurriness,i.object.backgroundIntensity=this.backgroundIntensity,i.object.backgroundRotation=this.backgroundRotation.toArray(),i.object.environmentIntensity=this.environmentIntensity,i.object.environmentRotation=this.environmentRotation.toArray(),i}}const _a=new Z,ss=new Z,Dp=new Z,rs=new Z,wo=new Z,Co=new Z,kx=new Z,Lp=new Z,Up=new Z,Op=new Z,Pp=new Dn,Ip=new Dn,zp=new Dn;class la{constructor(t=new Z,i=new Z,s=new Z){this.a=t,this.b=i,this.c=s}static getNormal(t,i,s,l){l.subVectors(s,i),_a.subVectors(t,i),l.cross(_a);const u=l.lengthSq();return u>0?l.multiplyScalar(1/Math.sqrt(u)):l.set(0,0,0)}static getBarycoord(t,i,s,l,u){_a.subVectors(l,i),ss.subVectors(s,i),Dp.subVectors(t,i);const h=_a.dot(_a),d=_a.dot(ss),m=_a.dot(Dp),p=ss.dot(ss),S=ss.dot(Dp),g=h*p-d*d;if(g===0)return u.set(0,0,0),null;const _=1/g,x=(p*m-d*S)*_,b=(h*S-d*m)*_;return u.set(1-x-b,b,x)}static containsPoint(t,i,s,l){return this.getBarycoord(t,i,s,l,rs)===null?!1:rs.x>=0&&rs.y>=0&&rs.x+rs.y<=1}static getInterpolation(t,i,s,l,u,h,d,m){return this.getBarycoord(t,i,s,l,rs)===null?(m.x=0,m.y=0,"z"in m&&(m.z=0),"w"in m&&(m.w=0),null):(m.setScalar(0),m.addScaledVector(u,rs.x),m.addScaledVector(h,rs.y),m.addScaledVector(d,rs.z),m)}static getInterpolatedAttribute(t,i,s,l,u,h){return Pp.setScalar(0),Ip.setScalar(0),zp.setScalar(0),Pp.fromBufferAttribute(t,i),Ip.fromBufferAttribute(t,s),zp.fromBufferAttribute(t,l),h.setScalar(0),h.addScaledVector(Pp,u.x),h.addScaledVector(Ip,u.y),h.addScaledVector(zp,u.z),h}static isFrontFacing(t,i,s,l){return _a.subVectors(s,i),ss.subVectors(t,i),_a.cross(ss).dot(l)<0}set(t,i,s){return this.a.copy(t),this.b.copy(i),this.c.copy(s),this}setFromPointsAndIndices(t,i,s,l){return this.a.copy(t[i]),this.b.copy(t[s]),this.c.copy(t[l]),this}setFromAttributeAndIndices(t,i,s,l){return this.a.fromBufferAttribute(t,i),this.b.fromBufferAttribute(t,s),this.c.fromBufferAttribute(t,l),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return _a.subVectors(this.c,this.b),ss.subVectors(this.a,this.b),_a.cross(ss).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return la.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,i){return la.getBarycoord(t,this.a,this.b,this.c,i)}getInterpolation(t,i,s,l,u){return la.getInterpolation(t,this.a,this.b,this.c,i,s,l,u)}containsPoint(t){return la.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return la.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,i){const s=this.a,l=this.b,u=this.c;let h,d;wo.subVectors(l,s),Co.subVectors(u,s),Lp.subVectors(t,s);const m=wo.dot(Lp),p=Co.dot(Lp);if(m<=0&&p<=0)return i.copy(s);Up.subVectors(t,l);const S=wo.dot(Up),g=Co.dot(Up);if(S>=0&&g<=S)return i.copy(l);const _=m*g-S*p;if(_<=0&&m>=0&&S<=0&&m-S>0)return h=m/(m-S),i.copy(s).addScaledVector(wo,h);Op.subVectors(t,u);const x=wo.dot(Op),b=Co.dot(Op);if(b>=0&&x<=b)return i.copy(u);const A=x*p-m*b;if(A<=0&&p>=0&&b<=0)return d=p/(p-b),i.copy(s).addScaledVector(Co,d);const y=S*b-x*g;if(y<=0&&g-S>=0&&x-b>=0)return kx.subVectors(u,l),d=(g-S)/(g-S+(x-b)),i.copy(l).addScaledVector(kx,d);const M=1/(y+A+_);return h=A*M,d=_*M,i.copy(s).addScaledVector(wo,h).addScaledVector(Co,d)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class Or{constructor(t=new Z(1/0,1/0,1/0),i=new Z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=i}set(t,i){return this.min.copy(t),this.max.copy(i),this}setFromArray(t){this.makeEmpty();for(let i=0,s=t.length;i<s;i+=3)this.expandByPoint(xa.fromArray(t,i));return this}setFromBufferAttribute(t){this.makeEmpty();for(let i=0,s=t.count;i<s;i++)this.expandByPoint(xa.fromBufferAttribute(t,i));return this}setFromPoints(t){this.makeEmpty();for(let i=0,s=t.length;i<s;i++)this.expandByPoint(t[i]);return this}setFromCenterAndSize(t,i){const s=xa.copy(i).multiplyScalar(.5);return this.min.copy(t).sub(s),this.max.copy(t).add(s),this}setFromObject(t,i=!1){return this.makeEmpty(),this.expandByObject(t,i)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,i=!1){t.updateWorldMatrix(!1,!1);const s=t.geometry;if(s!==void 0){const u=s.getAttribute("position");if(i===!0&&u!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let h=0,d=u.count;h<d;h++)t.isMesh===!0?t.getVertexPosition(h,xa):xa.fromBufferAttribute(u,h),xa.applyMatrix4(t.matrixWorld),this.expandByPoint(xa);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Yu.copy(t.boundingBox)):(s.boundingBox===null&&s.computeBoundingBox(),Yu.copy(s.boundingBox)),Yu.applyMatrix4(t.matrixWorld),this.union(Yu)}const l=t.children;for(let u=0,h=l.length;u<h;u++)this.expandByObject(l[u],i);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,i){return i.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,xa),xa.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let i,s;return t.normal.x>0?(i=t.normal.x*this.min.x,s=t.normal.x*this.max.x):(i=t.normal.x*this.max.x,s=t.normal.x*this.min.x),t.normal.y>0?(i+=t.normal.y*this.min.y,s+=t.normal.y*this.max.y):(i+=t.normal.y*this.max.y,s+=t.normal.y*this.min.y),t.normal.z>0?(i+=t.normal.z*this.min.z,s+=t.normal.z*this.max.z):(i+=t.normal.z*this.max.z,s+=t.normal.z*this.min.z),i<=-t.constant&&s>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ql),Zu.subVectors(this.max,Ql),No.subVectors(t.a,Ql),Do.subVectors(t.b,Ql),Lo.subVectors(t.c,Ql),Ws.subVectors(Do,No),Ys.subVectors(Lo,Do),br.subVectors(No,Lo);let i=[0,-Ws.z,Ws.y,0,-Ys.z,Ys.y,0,-br.z,br.y,Ws.z,0,-Ws.x,Ys.z,0,-Ys.x,br.z,0,-br.x,-Ws.y,Ws.x,0,-Ys.y,Ys.x,0,-br.y,br.x,0];return!Bp(i,No,Do,Lo,Zu)||(i=[1,0,0,0,1,0,0,0,1],!Bp(i,No,Do,Lo,Zu))?!1:(Ku.crossVectors(Ws,Ys),i=[Ku.x,Ku.y,Ku.z],Bp(i,No,Do,Lo,Zu))}clampPoint(t,i){return i.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,xa).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(xa).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(os[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),os[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),os[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),os[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),os[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),os[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),os[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),os[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(os),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const os=[new Z,new Z,new Z,new Z,new Z,new Z,new Z,new Z],xa=new Z,Yu=new Or,No=new Z,Do=new Z,Lo=new Z,Ws=new Z,Ys=new Z,br=new Z,Ql=new Z,Zu=new Z,Ku=new Z,Tr=new Z;function Bp(o,t,i,s,l){for(let u=0,h=o.length-3;u<=h;u+=3){Tr.fromArray(o,u);const d=l.x*Math.abs(Tr.x)+l.y*Math.abs(Tr.y)+l.z*Math.abs(Tr.z),m=t.dot(Tr),p=i.dot(Tr),S=s.dot(Tr);if(Math.max(-Math.max(m,p,S),Math.min(m,p,S))>d)return!1}return!0}const qn=new Z,ju=new te;let DT=0;class ca extends Lr{constructor(t,i,s=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:DT++}),this.name="",this.array=t,this.itemSize=i,this.count=t!==void 0?t.length/i:0,this.normalized=s,this.usage=py,this.updateRanges=[],this.gpuType=Ma,this.version=0,this._normalizationScale=t!==void 0?Vf(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,i,s){t*=this.itemSize,s*=i.itemSize;for(let l=0,u=this.itemSize;l<u;l++)this.array[t+l]=i.array[s+l];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let i=0,s=this.count;i<s;i++)ju.fromBufferAttribute(this,i),ju.applyMatrix3(t),this.setXY(i,ju.x,ju.y);else if(this.itemSize===3)for(let i=0,s=this.count;i<s;i++)qn.fromBufferAttribute(this,i),qn.applyMatrix3(t),this.setXYZ(i,qn.x,qn.y,qn.z);return this}applyMatrix4(t){for(let i=0,s=this.count;i<s;i++)qn.fromBufferAttribute(this,i),qn.applyMatrix4(t),this.setXYZ(i,qn.x,qn.y,qn.z);return this}applyNormalMatrix(t){for(let i=0,s=this.count;i<s;i++)qn.fromBufferAttribute(this,i),qn.applyNormalMatrix(t),this.setXYZ(i,qn.x,qn.y,qn.z);return this}transformDirection(t){for(let i=0,s=this.count;i<s;i++)qn.fromBufferAttribute(this,i),qn.transformDirection(t),this.setXYZ(i,qn.x,qn.y,qn.z);return this}set(t,i=0){return this.array.set(t,i),this}getComponent(t,i){let s=this.array[t*this.itemSize+i];return this.normalized&&(s=this._denormalize(s)),s}setComponent(t,i,s){return this.normalized&&(s=this._normalize(s)),this.array[t*this.itemSize+i]=s,this}getX(t){let i=this.array[t*this.itemSize];return this.normalized&&(i=this._denormalize(i)),i}setX(t,i){return this.normalized&&(i=this._normalize(i)),this.array[t*this.itemSize]=i,this}getY(t){let i=this.array[t*this.itemSize+1];return this.normalized&&(i=this._denormalize(i)),i}setY(t,i){return this.normalized&&(i=this._normalize(i)),this.array[t*this.itemSize+1]=i,this}getZ(t){let i=this.array[t*this.itemSize+2];return this.normalized&&(i=this._denormalize(i)),i}setZ(t,i){return this.normalized&&(i=this._normalize(i)),this.array[t*this.itemSize+2]=i,this}getW(t){let i=this.array[t*this.itemSize+3];return this.normalized&&(i=this._denormalize(i)),i}setW(t,i){return this.normalized&&(i=this._normalize(i)),this.array[t*this.itemSize+3]=i,this}setXY(t,i,s){return t*=this.itemSize,this.normalized&&(i=this._normalize(i),s=this._normalize(s)),this.array[t+0]=i,this.array[t+1]=s,this}setXYZ(t,i,s,l){return t*=this.itemSize,this.normalized&&(i=this._normalize(i),s=this._normalize(s),l=this._normalize(l)),this.array[t+0]=i,this.array[t+1]=s,this.array[t+2]=l,this}setXYZW(t,i,s,l,u){return t*=this.itemSize,this.normalized&&(i=this._normalize(i),s=this._normalize(s),l=this._normalize(l),u=this._normalize(u)),this.array[t+0]=i,this.array[t+1]=s,this.array[t+2]=l,this.array[t+3]=u,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){const i=this._normalizationScale;return i!==void 0?Math.max(t/i,-1):gy(t,this.array)}_normalize(t){const i=this._normalizationScale;return i!==void 0?Math.round(t*i):vy(t,this.array)}}class Sy extends ca{constructor(t,i,s){super(new Uint16Array(t),i,s)}}class yy extends ca{constructor(t,i,s){super(new Uint32Array(t),i,s)}}class We extends ca{constructor(t,i,s){super(new Float32Array(t),i,s)}}const LT=new Or,Jl=new Z,Fp=new Z;class Pr{constructor(t=new Z,i=-1){this.isSphere=!0,this.center=t,this.radius=i}set(t,i){return this.center.copy(t),this.radius=i,this}setFromPoints(t,i){const s=this.center;i!==void 0?s.copy(i):LT.setFromPoints(t).getCenter(s);let l=0;for(let u=0,h=t.length;u<h;u++)l=Math.max(l,s.distanceToSquared(t[u]));return this.radius=Math.sqrt(l),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const i=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=i*i}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,i){const s=this.center.distanceToSquared(t);return i.copy(t),s>this.radius*this.radius&&(i.sub(this.center).normalize(),i.multiplyScalar(this.radius).add(this.center)),i}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Jl.subVectors(t,this.center);const i=Jl.lengthSq();if(i>this.radius*this.radius){const s=Math.sqrt(i),l=(s-this.radius)*.5;this.center.addScaledVector(Jl,l/s),this.radius+=l}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Fp.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Jl.copy(t.center).add(Fp)),this.expandByPoint(Jl.copy(t.center).sub(Fp))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let UT=0;const ra=new sn,Hp=new Wn,Uo=new Z,Yi=new Or,$l=new Or,ai=new Z;class In extends Lr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:UT++}),this.uuid=Ur(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(fT(t)?yy:Sy)(t,1):this.index=t,this}setIndirect(t,i=0){return this.indirect=t,this.indirectOffset=i,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,i){return this.attributes[t]=i,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,i,s=0){this.groups.push({start:t,count:i,materialIndex:s})}clearGroups(){this.groups=[]}setDrawRange(t,i){this.drawRange.start=t,this.drawRange.count=i}applyMatrix4(t){const i=this.attributes.position;i!==void 0&&(i.applyMatrix4(t),i.needsUpdate=!0);const s=this.attributes.normal;if(s!==void 0){const u=new Ae().getNormalMatrix(t);s.applyNormalMatrix(u),s.needsUpdate=!0}const l=this.attributes.tangent;return l!==void 0&&(l.transformDirection(t),l.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return ra.makeRotationFromQuaternion(t),this.applyMatrix4(ra),this}rotateX(t){return ra.makeRotationX(t),this.applyMatrix4(ra),this}rotateY(t){return ra.makeRotationY(t),this.applyMatrix4(ra),this}rotateZ(t){return ra.makeRotationZ(t),this.applyMatrix4(ra),this}translate(t,i,s){return ra.makeTranslation(t,i,s),this.applyMatrix4(ra),this}scale(t,i,s){return ra.makeScale(t,i,s),this.applyMatrix4(ra),this}lookAt(t){return Hp.lookAt(t),Hp.updateMatrix(),this.applyMatrix4(Hp.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Uo).negate(),this.translate(Uo.x,Uo.y,Uo.z),this}setFromPoints(t){const i=this.getAttribute("position");if(i===void 0){const s=[];for(let l=0,u=t.length;l<u;l++){const h=t[l];s.push(h.x,h.y,h.z||0)}this.setAttribute("position",new We(s,3))}else{const s=Math.min(t.length,i.count);for(let l=0;l<s;l++){const u=t[l];i.setXYZ(l,u.x,u.y,u.z||0)}t.length>i.count&&_e("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),i.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Or);const t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){en("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new Z(-1/0,-1/0,-1/0),new Z(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),i)for(let s=0,l=i.length;s<l;s++){const u=i[s];Yi.setFromBufferAttribute(u),this.morphTargetsRelative?(ai.addVectors(this.boundingBox.min,Yi.min),this.boundingBox.expandByPoint(ai),ai.addVectors(this.boundingBox.max,Yi.max),this.boundingBox.expandByPoint(ai)):(this.boundingBox.expandByPoint(Yi.min),this.boundingBox.expandByPoint(Yi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&en('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pr);const t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){en("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new Z,1/0);return}if(t){const s=this.boundingSphere.center;if(Yi.setFromBufferAttribute(t),i)for(let u=0,h=i.length;u<h;u++){const d=i[u];$l.setFromBufferAttribute(d),this.morphTargetsRelative?(ai.addVectors(Yi.min,$l.min),Yi.expandByPoint(ai),ai.addVectors(Yi.max,$l.max),Yi.expandByPoint(ai)):(Yi.expandByPoint($l.min),Yi.expandByPoint($l.max))}Yi.getCenter(s);let l=0;for(let u=0,h=t.count;u<h;u++)ai.fromBufferAttribute(t,u),l=Math.max(l,s.distanceToSquared(ai));if(i)for(let u=0,h=i.length;u<h;u++){const d=i[u],m=this.morphTargetsRelative;for(let p=0,S=d.count;p<S;p++)ai.fromBufferAttribute(d,p),m&&(Uo.fromBufferAttribute(t,p),ai.add(Uo)),l=Math.max(l,s.distanceToSquared(ai))}this.boundingSphere.radius=Math.sqrt(l),isNaN(this.boundingSphere.radius)&&en('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,i=this.attributes;if(t===null||i.position===void 0||i.normal===void 0||i.uv===void 0){en("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const s=i.position,l=i.normal,u=i.uv;let h=this.getAttribute("tangent");(h===void 0||h.count!==s.count)&&(h=new ca(new Float32Array(4*s.count),4),this.setAttribute("tangent",h));const d=[],m=[],p=new Uint8Array(s.count);for(let W=0;W<s.count;W++)d[W]=new Z,m[W]=new Z;const S=new Z,g=new Z,_=new Z,x=new te,b=new te,A=new te,y=new Z,M=new Z;function N(W,H,K){p[W]=p[H]=p[K]=1,S.fromBufferAttribute(s,W),g.fromBufferAttribute(s,H),_.fromBufferAttribute(s,K),x.fromBufferAttribute(u,W),b.fromBufferAttribute(u,H),A.fromBufferAttribute(u,K),g.sub(S),_.sub(S),b.sub(x),A.sub(x);const J=1/(b.x*A.y-A.x*b.y);isFinite(J)&&(y.copy(g).multiplyScalar(A.y).addScaledVector(_,-b.y).multiplyScalar(J),M.copy(_).multiplyScalar(b.x).addScaledVector(g,-A.x).multiplyScalar(J),d[W].add(y),d[H].add(y),d[K].add(y),m[W].add(M),m[H].add(M),m[K].add(M))}let P=this.groups;P.length===0&&(P=[{start:0,count:t.count}]);for(let W=0,H=P.length;W<H;++W){const K=P[W],J=K.start,ut=K.count;for(let V=J,st=J+ut;V<st;V+=3)N(t.getX(V+0),t.getX(V+1),t.getX(V+2))}const L=new Z,I=new Z,U=new Z,E=new Z;function C(W){U.fromBufferAttribute(l,W),E.copy(U);const H=d[W];L.copy(H),L.sub(U.multiplyScalar(U.dot(H))).normalize(),I.crossVectors(E,H);const J=I.dot(m[W])<0?-1:1;h.setXYZW(W,L.x,L.y,L.z,J)}for(let W=0,H=s.count;W<H;++W)p[W]&&C(W);this._transformed=!0}computeVertexNormals(){const t=this.index,i=this.getAttribute("position");if(i!==void 0){let s=this.getAttribute("normal");if(s===void 0||s.count!==i.count)s=new ca(new Float32Array(i.count*3),3),this.setAttribute("normal",s);else for(let _=0,x=s.count;_<x;_++)s.setXYZ(_,0,0,0);const l=new Z,u=new Z,h=new Z,d=new Z,m=new Z,p=new Z,S=new Z,g=new Z;if(t)for(let _=0,x=t.count;_<x;_+=3){const b=t.getX(_+0),A=t.getX(_+1),y=t.getX(_+2);l.fromBufferAttribute(i,b),u.fromBufferAttribute(i,A),h.fromBufferAttribute(i,y),S.subVectors(h,u),g.subVectors(l,u),S.cross(g),d.fromBufferAttribute(s,b),m.fromBufferAttribute(s,A),p.fromBufferAttribute(s,y),d.add(S),m.add(S),p.add(S),s.setXYZ(b,d.x,d.y,d.z),s.setXYZ(A,m.x,m.y,m.z),s.setXYZ(y,p.x,p.y,p.z)}else for(let _=0,x=i.count;_<x;_+=3)l.fromBufferAttribute(i,_+0),u.fromBufferAttribute(i,_+1),h.fromBufferAttribute(i,_+2),S.subVectors(h,u),g.subVectors(l,u),S.cross(g),s.setXYZ(_+0,S.x,S.y,S.z),s.setXYZ(_+1,S.x,S.y,S.z),s.setXYZ(_+2,S.x,S.y,S.z);this.normalizeNormals(),s.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let i=0,s=t.count;i<s;i++)ai.fromBufferAttribute(t,i),ai.normalize(),t.setXYZ(i,ai.x,ai.y,ai.z)}toNonIndexed(){function t(d,m){const p=d.array,S=d.itemSize,g=d.normalized,_=new p.constructor(m.length*S);let x=0,b=0;for(let A=0,y=m.length;A<y;A++){d.isInterleavedBufferAttribute?x=m[A]*d.data.stride+d.offset:x=m[A]*S;for(let M=0;M<S;M++)_[b++]=p[x++]}return new ca(_,S,g)}if(this.index===null)return _e("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const i=new In,s=this.index.array,l=this.attributes;for(const d in l){const m=l[d],p=t(m,s);i.setAttribute(d,p)}const u=this.morphAttributes;for(const d in u){const m=[],p=u[d];for(let S=0,g=p.length;S<g;S++){const _=p[S],x=t(_,s);m.push(x)}i.morphAttributes[d]=m}i.morphTargetsRelative=this.morphTargetsRelative;const h=this.groups;for(let d=0,m=h.length;d<m;d++){const p=h[d];i.addGroup(p.start,p.count,p.materialIndex)}return i}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const m=this.parameters;for(const p in m)m[p]!==void 0&&(t[p]=m[p]);return t}t.data={attributes:{}};const i=this.index;i!==null&&(t.data.index={type:i.array.constructor.name,array:Array.prototype.slice.call(i.array)});const s=this.attributes;for(const m in s){const p=s[m];t.data.attributes[m]=p.toJSON(t.data)}const l={};let u=!1;for(const m in this.morphAttributes){const p=this.morphAttributes[m],S=[];for(let g=0,_=p.length;g<_;g++){const x=p[g];S.push(x.toJSON(t.data))}S.length>0&&(l[m]=S,u=!0)}u&&(t.data.morphAttributes=l,t.data.morphTargetsRelative=this.morphTargetsRelative);const h=this.groups;h.length>0&&(t.data.groups=JSON.parse(JSON.stringify(h)));const d=this.boundingSphere;return d!==null&&(t.data.boundingSphere=d.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const i={};this.name=t.name;const s=t.index;s!==null&&this.setIndex(s.clone());const l=t.attributes;for(const p in l){const S=l[p];this.setAttribute(p,S.clone(i))}const u=t.morphAttributes;for(const p in u){const S=[],g=u[p];for(let _=0,x=g.length;_<x;_++)S.push(g[_].clone(i));this.morphAttributes[p]=S}this.morphTargetsRelative=t.morphTargetsRelative;const h=t.groups;for(let p=0,S=h.length;p<S;p++){const g=h[p];this.addGroup(g.start,g.count,g.materialIndex)}const d=t.boundingBox;d!==null&&(this.boundingBox=d.clone());const m=t.boundingSphere;return m!==null&&(this.boundingSphere=m.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class OT{constructor(t,i){this.isInterleavedBuffer=!0,this.array=t,this.stride=i,this.count=t!==void 0?t.length/i:0,this.usage=py,this.updateRanges=[],this.version=0,this.uuid=Ur()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,i,s){t*=this.stride,s*=i.stride;for(let l=0,u=this.stride;l<u;l++)this.array[t+l]=i.array[s+l];return this}set(t,i=0){return this.array.set(t,i),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={});const i=qx(this.array);t.arrayBuffers[i]===void 0&&(t.arrayBuffers[i]=this.array.slice(0).buffer);const s=new this.array.constructor(t.arrayBuffers[i]),l=new this.constructor(s,this.stride);return l.setUsage(this.usage),l}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={});const i=qx(this.array);t.arrayBuffers[i]===void 0&&(t.arrayBuffers[i]=Array.from(new Uint32Array(this.array.slice(0).buffer)));const s={uuid:this.uuid,buffer:i,type:this.array.constructor.name,stride:this.stride};return s.usage=this.usage,s}}function qx(o){return o.buffer._uuid===void 0&&(o.buffer._uuid=Ur()),o.byteOffset===0&&o.byteLength===o.buffer.byteLength?o.buffer._uuid:o.buffer._uuid+":"+o.byteOffset+":"+o.byteLength}const Ei=new Z;class Pf{constructor(t,i,s,l=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=i,this.offset=s,this.normalized=l,this._normalizationScale=t!==void 0?Vf(t.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let i=0,s=this.data.count;i<s;i++)Ei.fromBufferAttribute(this,i),Ei.applyMatrix4(t),this.setXYZ(i,Ei.x,Ei.y,Ei.z);return this}applyNormalMatrix(t){for(let i=0,s=this.count;i<s;i++)Ei.fromBufferAttribute(this,i),Ei.applyNormalMatrix(t),this.setXYZ(i,Ei.x,Ei.y,Ei.z);return this}transformDirection(t){for(let i=0,s=this.count;i<s;i++)Ei.fromBufferAttribute(this,i),Ei.transformDirection(t),this.setXYZ(i,Ei.x,Ei.y,Ei.z);return this}getComponent(t,i){let s=this.array[t*this.data.stride+this.offset+i];return this.normalized&&(s=this._denormalize(s)),s}setComponent(t,i,s){return this.normalized&&(s=this._normalize(s)),this.data.array[t*this.data.stride+this.offset+i]=s,this}setX(t,i){return this.normalized&&(i=this._normalize(i)),this.data.array[t*this.data.stride+this.offset]=i,this}setY(t,i){return this.normalized&&(i=this._normalize(i)),this.data.array[t*this.data.stride+this.offset+1]=i,this}setZ(t,i){return this.normalized&&(i=this._normalize(i)),this.data.array[t*this.data.stride+this.offset+2]=i,this}setW(t,i){return this.normalized&&(i=this._normalize(i)),this.data.array[t*this.data.stride+this.offset+3]=i,this}getX(t){let i=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(i=this._denormalize(i)),i}getY(t){let i=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(i=this._denormalize(i)),i}getZ(t){let i=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(i=this._denormalize(i)),i}getW(t){let i=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(i=this._denormalize(i)),i}setXY(t,i,s){return t=t*this.data.stride+this.offset,this.normalized&&(i=this._normalize(i),s=this._normalize(s)),this.data.array[t+0]=i,this.data.array[t+1]=s,this}setXYZ(t,i,s,l){return t=t*this.data.stride+this.offset,this.normalized&&(i=this._normalize(i),s=this._normalize(s),l=this._normalize(l)),this.data.array[t+0]=i,this.data.array[t+1]=s,this.data.array[t+2]=l,this}setXYZW(t,i,s,l,u){return t=t*this.data.stride+this.offset,this.normalized&&(i=this._normalize(i),s=this._normalize(s),l=this._normalize(l),u=this._normalize(u)),this.data.array[t+0]=i,this.data.array[t+1]=s,this.data.array[t+2]=l,this.data.array[t+3]=u,this}clone(t){if(t===void 0){Of("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const i=[];for(let s=0;s<this.count;s++){const l=s*this.data.stride+this.offset;for(let u=0;u<this.itemSize;u++)i.push(this.data.array[l+u])}return new ca(new this.array.constructor(i),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Pf(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){Of("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const i=[];for(let s=0;s<this.count;s++){const l=s*this.data.stride+this.offset;for(let u=0;u<this.itemSize;u++)i.push(this.data.array[l+u])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:i,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(t){const i=this._normalizationScale;return i!==void 0?Math.max(t/i,-1):gy(t,this.data.array)}_normalize(t){const i=this._normalizationScale;return i!==void 0?Math.round(t*i):vy(t,this.data.array)}}const Gp=new Z,PT=new Z,IT=new Ae;class Ks{constructor(t=new Z(1,0,0),i=0){this.isPlane=!0,this.normal=t,this.constant=i}set(t,i){return this.normal.copy(t),this.constant=i,this}setComponents(t,i,s,l){return this.normal.set(t,i,s),this.constant=l,this}setFromNormalAndCoplanarPoint(t,i){return this.normal.copy(t),this.constant=-i.dot(this.normal),this}setFromCoplanarPoints(t,i,s){const l=Gp.subVectors(s,i).cross(PT.subVectors(t,i)).normalize();return this.setFromNormalAndCoplanarPoint(l,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,i){return i.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,i,s=!0){const l=t.delta(Gp),u=this.normal.dot(l);if(u===0)return this.distanceToPoint(t.start)===0?i.copy(t.start):null;const h=-(t.start.dot(this.normal)+this.constant)/u;return s===!0&&(h<0||h>1)?null:i.copy(t.start).addScaledVector(l,h)}intersectsLine(t){const i=this.distanceToPoint(t.start),s=this.distanceToPoint(t.end);return i<0&&s>0||s<0&&i>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,i){const s=i||IT.getNormalMatrix(t),l=this.coplanarPoint(Gp).applyMatrix4(t),u=this.normal.applyMatrix3(s).normalize();return this.constant=-l.dot(u),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}let zT=0;class ir extends Lr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:zT++}),this.uuid=Ur(),this.name="",this.type="Material",this.blending=hc,this.side=Cr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ZS,this.blendDst=KS,this.blendEquation=Xo,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new he(0,0,0),this.blendAlpha=0,this.depthFunc=vc,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=sT,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=yp,this.stencilZFail=yp,this.stencilZPass=yp,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const i in t){const s=t[i];if(s===void 0){_e(`Material: parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){_e(`Material: '${i}' is not a property of THREE.${this.type}.`);continue}l&&l.isColor?l.set(s):l&&l.isVector2&&s&&s.isVector2||l&&l.isEuler&&s&&s.isEuler||l&&l.isVector3&&s&&s.isVector3?l.copy(s):this[i]=s}}toJSON(t){const i=t===void 0||typeof t=="string";i&&(t={textures:{},images:{}});const s={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};s.uuid=this.uuid,s.type=this.type,s.blending=this.blending,s.side=this.side,s.shadowSide=this.shadowSide,s.vertexColors=this.vertexColors,s.opacity=this.opacity,s.transparent=this.transparent,s.blendSrc=this.blendSrc,s.blendDst=this.blendDst,s.blendEquation=this.blendEquation,s.blendSrcAlpha=this.blendSrcAlpha,s.blendDstAlpha=this.blendDstAlpha,s.blendEquationAlpha=this.blendEquationAlpha,s.blendColor=this.blendColor.getHex(),s.blendAlpha=this.blendAlpha,s.depthFunc=this.depthFunc,s.depthTest=this.depthTest,s.depthWrite=this.depthWrite,s.colorWrite=this.colorWrite,s.clipIntersection=this.clipIntersection,s.clipShadows=this.clipShadows,s.stencilWriteMask=this.stencilWriteMask,s.stencilFunc=this.stencilFunc,s.stencilRef=this.stencilRef,s.stencilFuncMask=this.stencilFuncMask,s.stencilFail=this.stencilFail,s.stencilZFail=this.stencilZFail,s.stencilZPass=this.stencilZPass,s.stencilWrite=this.stencilWrite,s.polygonOffset=this.polygonOffset,s.polygonOffsetFactor=this.polygonOffsetFactor,s.polygonOffsetUnits=this.polygonOffsetUnits,s.dithering=this.dithering,s.alphaTest=this.alphaTest,s.alphaHash=this.alphaHash,s.alphaToCoverage=this.alphaToCoverage,s.premultipliedAlpha=this.premultipliedAlpha,s.forceSinglePass=this.forceSinglePass,s.allowOverride=this.allowOverride,s.visible=this.visible,s.toneMapped=this.toneMapped,s.name=this.name,this.color&&this.color.isColor&&(s.color=this.color.getHex()),this.roughness!==void 0&&(s.roughness=this.roughness),this.metalness!==void 0&&(s.metalness=this.metalness),this.sheen!==void 0&&(s.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(s.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(s.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(s.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(s.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(s.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(s.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(s.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(s.shininess=this.shininess),this.clearcoat!==void 0&&(s.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(s.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(s.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(s.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(s.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(s.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(s.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,s.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(s.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(s.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(s.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(s.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(s.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(s.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(s.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(s.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(s.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(s.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(s.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(s.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(s.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(s.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(s.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(s.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(s.lightMap=this.lightMap.toJSON(t).uuid,s.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(s.aoMap=this.aoMap.toJSON(t).uuid,s.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(s.bumpMap=this.bumpMap.toJSON(t).uuid,s.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(s.normalMap=this.normalMap.toJSON(t).uuid,s.normalMapType=this.normalMapType,s.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(s.displacementMap=this.displacementMap.toJSON(t).uuid,s.displacementScale=this.displacementScale,s.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(s.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(s.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(s.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(s.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(s.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(s.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(s.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(s.combine=this.combine)),this.envMapRotation!==void 0&&(s.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(s.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(s.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(s.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(s.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(s.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(s.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(s.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(s.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(s.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(s.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(s.size=this.size),this.sizeAttenuation!==void 0&&(s.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(s.clippingPlanes=this.clippingPlanes.map(u=>u.toJSON())),this.rotation!==void 0&&(s.rotation=this.rotation),this.depthPacking!==void 0&&(s.depthPacking=this.depthPacking),this.linewidth!==void 0&&(s.linewidth=this.linewidth),this.linecap!==void 0&&(s.linecap=this.linecap),this.linejoin!==void 0&&(s.linejoin=this.linejoin),this.dashSize!==void 0&&(s.dashSize=this.dashSize),this.gapSize!==void 0&&(s.gapSize=this.gapSize),this.scale!==void 0&&(s.scale=this.scale),this.wireframe!==void 0&&(s.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(s.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(s.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(s.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(s.flatShading=this.flatShading),this.fog!==void 0&&(s.fog=this.fog),Object.keys(this.userData).length>0&&(s.userData=this.userData);function l(u){const h=[];for(const d in u){const m=u[d];delete m.metadata,h.push(m)}return h}if(i){const u=l(t.textures),h=l(t.images);u.length>0&&(s.textures=u),h.length>0&&(s.images=h)}return s}fromJSON(t,i){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new he().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(s=>new Ks().fromJSON(s))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=i[t.map]||null),t.matcap!==void 0&&(this.matcap=i[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=i[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=i[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=i[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let s=t.normalScale;Array.isArray(s)===!1&&(s=[s,s]),this.normalScale=new te().fromArray(s)}return t.displacementMap!==void 0&&(this.displacementMap=i[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=i[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=i[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=i[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=i[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=i[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=i[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=i[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=i[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=i[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=i[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=i[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=i[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=i[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new te().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=i[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=i[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=i[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=i[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=i[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=i[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=i[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=i[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const i=t.clippingPlanes;let s=null;if(i!==null){const l=i.length;s=new Array(l);for(let u=0;u!==l;++u)s[u]=i[u].clone()}return this.clippingPlanes=s,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class fs extends ir{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new he(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Oo;const tc=new Z,Po=new Z,Io=new Z,zo=new te,ec=new te,My=new sn,Qu=new Z,nc=new Z,Ju=new Z,Wx=new te,Vp=new te,Yx=new te;class cs extends Wn{constructor(t=new fs){if(super(),this.isSprite=!0,this.type="Sprite",Oo===void 0){Oo=new In;const i=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),s=new OT(i,5);Oo.setIndex([0,1,2,0,2,3]),Oo.setAttribute("position",new Pf(s,3,0,!1)),Oo.setAttribute("uv",new Pf(s,2,3,!1))}this.geometry=Oo,this.material=t,this.center=new te(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,i){t.camera===null&&en('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Po.setFromMatrixScale(this.matrixWorld),My.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Io.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Po.multiplyScalar(-Io.z);const s=this.material.rotation;let l,u;s!==0&&(u=Math.cos(s),l=Math.sin(s));const h=this.center;$u(Qu.set(-.5,-.5,0),Io,h,Po,l,u),$u(nc.set(.5,-.5,0),Io,h,Po,l,u),$u(Ju.set(.5,.5,0),Io,h,Po,l,u),Wx.set(0,0),Vp.set(1,0),Yx.set(1,1);let d=t.ray.intersectTriangle(Qu,nc,Ju,!1,tc);if(d===null&&($u(nc.set(-.5,.5,0),Io,h,Po,l,u),Vp.set(0,1),d=t.ray.intersectTriangle(Qu,Ju,nc,!1,tc),d===null))return;const m=t.ray.origin.distanceTo(tc);m<t.near||m>t.far||i.push({distance:m,point:tc.clone(),uv:la.getInterpolation(tc,Qu,nc,Ju,Wx,Vp,Yx,new te),face:null,object:this})}copy(t,i){return super.copy(t,i),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}toJSON(t){const i=super.toJSON(t);return i.object.center=this.center.toArray(),i}}function $u(o,t,i,s,l,u){zo.subVectors(o,i).addScalar(.5).multiply(s),l!==void 0?(ec.x=u*zo.x-l*zo.y,ec.y=l*zo.x+u*zo.y):ec.copy(zo),o.copy(t),o.x+=ec.x,o.y+=ec.y,o.applyMatrix4(My)}const ls=new Z,Xp=new Z,tf=new Z,ef=new Z;class Xf{constructor(t=new Z,i=new Z(0,0,-1)){this.origin=t,this.direction=i}set(t,i){return this.origin.copy(t),this.direction.copy(i),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,i){return i.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ls)),this}closestPointToPoint(t,i){i.subVectors(t,this.origin);const s=i.dot(this.direction);return s<0?i.copy(this.origin):i.copy(this.origin).addScaledVector(this.direction,s)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const i=ls.subVectors(t,this.origin).dot(this.direction);return i<0?this.origin.distanceToSquared(t):(ls.copy(this.origin).addScaledVector(this.direction,i),ls.distanceToSquared(t))}distanceSqToSegment(t,i,s,l){Xp.copy(t).add(i).multiplyScalar(.5),tf.copy(i).sub(t).normalize(),ef.copy(this.origin).sub(Xp);const u=t.distanceTo(i)*.5,h=-this.direction.dot(tf),d=ef.dot(this.direction),m=-ef.dot(tf),p=ef.lengthSq(),S=Math.abs(1-h*h);let g,_,x,b;if(S>0)if(g=h*m-d,_=h*d-m,b=u*S,g>=0)if(_>=-b)if(_<=b){const A=1/S;g*=A,_*=A,x=g*(g+h*_+2*d)+_*(h*g+_+2*m)+p}else _=u,g=Math.max(0,-(h*_+d)),x=-g*g+_*(_+2*m)+p;else _=-u,g=Math.max(0,-(h*_+d)),x=-g*g+_*(_+2*m)+p;else _<=-b?(g=Math.max(0,-(-h*u+d)),_=g>0?-u:Math.min(Math.max(-u,-m),u),x=-g*g+_*(_+2*m)+p):_<=b?(g=0,_=Math.min(Math.max(-u,-m),u),x=_*(_+2*m)+p):(g=Math.max(0,-(h*u+d)),_=g>0?u:Math.min(Math.max(-u,-m),u),x=-g*g+_*(_+2*m)+p);else _=h>0?-u:u,g=Math.max(0,-(h*_+d)),x=-g*g+_*(_+2*m)+p;return s&&s.copy(this.origin).addScaledVector(this.direction,g),l&&l.copy(Xp).addScaledVector(tf,_),x}intersectSphere(t,i){if(t.radius<0)return null;ls.subVectors(t.center,this.origin);const s=ls.dot(this.direction),l=ls.dot(ls)-s*s,u=t.radius*t.radius;if(l>u)return null;const h=Math.sqrt(u-l),d=s-h,m=s+h;return m<0?null:d<0?this.at(m,i):this.at(d,i)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const i=t.normal.dot(this.direction);if(i===0)return t.distanceToPoint(this.origin)===0?0:null;const s=-(this.origin.dot(t.normal)+t.constant)/i;return s>=0?s:null}intersectPlane(t,i){const s=this.distanceToPlane(t);return s===null?null:this.at(s,i)}intersectsPlane(t){const i=t.distanceToPoint(this.origin);return i===0||t.normal.dot(this.direction)*i<0}intersectBox(t,i){let s,l,u,h,d,m;const p=1/this.direction.x,S=1/this.direction.y,g=1/this.direction.z,_=this.origin;return p>=0?(s=(t.min.x-_.x)*p,l=(t.max.x-_.x)*p):(s=(t.max.x-_.x)*p,l=(t.min.x-_.x)*p),S>=0?(u=(t.min.y-_.y)*S,h=(t.max.y-_.y)*S):(u=(t.max.y-_.y)*S,h=(t.min.y-_.y)*S),s>h||u>l||((u>s||isNaN(s))&&(s=u),(h<l||isNaN(l))&&(l=h),g>=0?(d=(t.min.z-_.z)*g,m=(t.max.z-_.z)*g):(d=(t.max.z-_.z)*g,m=(t.min.z-_.z)*g),s>m||d>l)||((d>s||s!==s)&&(s=d),(m<l||l!==l)&&(l=m),l<0)?null:this.at(s>=0?s:l,i)}intersectsBox(t){return this.intersectBox(t,ls)!==null}intersectTriangle(t,i,s,l,u){const h=this.origin,d=this.direction,m=d.x,p=d.y,S=d.z,g=t.x-h.x,_=t.y-h.y,x=t.z-h.z,b=i.x-h.x,A=i.y-h.y,y=i.z-h.z,M=s.x-h.x,N=s.y-h.y,P=s.z-h.z,L=Math.abs(m),I=Math.abs(p),U=Math.abs(S);let E,C,W,H,K,J,ut,V,st,k,Y,dt;if(L>=I&&L>=U?(W=m,J=g,st=b,dt=M,m>=0?(E=p,C=S,H=_,K=x,ut=A,V=y,k=N,Y=P):(E=S,C=p,H=x,K=_,ut=y,V=A,k=P,Y=N)):I>=U?(W=p,J=_,st=A,dt=N,p>=0?(E=S,C=m,H=x,K=g,ut=y,V=b,k=P,Y=M):(E=m,C=S,H=g,K=x,ut=b,V=y,k=M,Y=P)):(W=S,J=x,st=y,dt=P,S>=0?(E=m,C=p,H=g,K=_,ut=b,V=A,k=M,Y=N):(E=p,C=m,H=_,K=g,ut=A,V=b,k=N,Y=M)),W===0)return null;const ot=E/W,ht=C/W,Tt=1/W,Vt=H-ot*J,ae=K-ht*J,D=ut-ot*st,$=V-ht*st,xt=k-ot*dt,At=Y-ht*dt,Ct=xt*$-At*D,qt=Vt*At-ae*xt,le=D*ae-$*Vt;if(l){if(Ct<0||qt<0||le<0)return null}else if((Ct<0||qt<0||le<0)&&(Ct>0||qt>0||le>0))return null;const wt=Ct+qt+le;if(wt===0)return null;const Wt=Tt*(Ct*J+qt*st+le*dt);return(wt>0?Wt<0:Wt>0)?null:this.at(Wt/wt,u)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ti extends ir{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new he(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nr,this.combine=jS,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Zx=new sn,Ar=new Xf,nf=new Pr,Kx=new Z,af=new Z,sf=new Z,rf=new Z,kp=new Z,of=new Z,jx=new Z,lf=new Z;class Ce extends Wn{constructor(t=new In,i=new Ti){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,i){return super.copy(t,i),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const i=this.geometry.morphAttributes,s=Object.keys(i);if(s.length>0){const l=i[s[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let u=0,h=l.length;u<h;u++){const d=l[u].name||String(u);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=u}}}}getVertexPosition(t,i){const s=this.geometry,l=s.attributes.position,u=s.morphAttributes.position,h=s.morphTargetsRelative;i.fromBufferAttribute(l,t);const d=this.morphTargetInfluences;if(u&&d){of.set(0,0,0);for(let m=0,p=u.length;m<p;m++){const S=d[m],g=u[m];S!==0&&(kp.fromBufferAttribute(g,t),h?of.addScaledVector(kp,S):of.addScaledVector(kp.sub(i),S))}i.add(of)}return i}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,i){const s=this.geometry,l=this.material,u=this.matrixWorld;l!==void 0&&(s.boundingSphere===null&&s.computeBoundingSphere(),nf.copy(s.boundingSphere),nf.applyMatrix4(u),Ar.copy(t.ray).recast(t.near),!(nf.containsPoint(Ar.origin)===!1&&(Ar.intersectSphere(nf,Kx)===null||Ar.origin.distanceToSquared(Kx)>(t.far-t.near)**2))&&(Zx.copy(u).invert(),Ar.copy(t.ray).applyMatrix4(Zx),!(s.boundingBox!==null&&Ar.intersectsBox(s.boundingBox)===!1)&&this._computeIntersections(t,i,Ar)))}_computeIntersections(t,i,s){let l;const u=this.geometry,h=this.material,d=u.index,m=u.attributes.position,p=u.attributes.uv,S=u.attributes.uv1,g=u.attributes.normal,_=u.groups,x=u.drawRange;if(d!==null)if(Array.isArray(h))for(let b=0,A=_.length;b<A;b++){const y=_[b],M=h[y.materialIndex],N=Math.max(y.start,x.start),P=Math.min(d.count,Math.min(y.start+y.count,x.start+x.count));for(let L=N,I=P;L<I;L+=3){const U=d.getX(L),E=d.getX(L+1),C=d.getX(L+2);l=cf(this,M,t,s,p,S,g,U,E,C),l&&(l.faceIndex=Math.floor(L/3),l.face.materialIndex=y.materialIndex,i.push(l))}}else{const b=Math.max(0,x.start),A=Math.min(d.count,x.start+x.count);for(let y=b,M=A;y<M;y+=3){const N=d.getX(y),P=d.getX(y+1),L=d.getX(y+2);l=cf(this,h,t,s,p,S,g,N,P,L),l&&(l.faceIndex=Math.floor(y/3),i.push(l))}}else if(m!==void 0)if(Array.isArray(h))for(let b=0,A=_.length;b<A;b++){const y=_[b],M=h[y.materialIndex],N=Math.max(y.start,x.start),P=Math.min(m.count,Math.min(y.start+y.count,x.start+x.count));for(let L=N,I=P;L<I;L+=3){const U=L,E=L+1,C=L+2;l=cf(this,M,t,s,p,S,g,U,E,C),l&&(l.faceIndex=Math.floor(L/3),l.face.materialIndex=y.materialIndex,i.push(l))}}else{const b=Math.max(0,x.start),A=Math.min(m.count,x.start+x.count);for(let y=b,M=A;y<M;y+=3){const N=y,P=y+1,L=y+2;l=cf(this,h,t,s,p,S,g,N,P,L),l&&(l.faceIndex=Math.floor(y/3),i.push(l))}}}}function BT(o,t,i,s,l,u,h,d){let m;if(t.side===zi?m=s.intersectTriangle(h,u,l,!0,d):m=s.intersectTriangle(l,u,h,t.side===Cr,d),m===null)return null;lf.copy(d),lf.applyMatrix4(o.matrixWorld);const p=i.ray.origin.distanceTo(lf);return p<i.near||p>i.far?null:{distance:p,point:lf.clone(),object:o}}function cf(o,t,i,s,l,u,h,d,m,p){o.getVertexPosition(d,af),o.getVertexPosition(m,sf),o.getVertexPosition(p,rf);const S=BT(o,t,i,s,af,sf,rf,jx);if(S){const g=new Z;la.getBarycoord(jx,af,sf,rf,g),l&&(S.uv=la.getInterpolatedAttribute(l,d,m,p,g,new te)),u&&(S.uv1=la.getInterpolatedAttribute(u,d,m,p,g,new te)),h&&(S.normal=la.getInterpolatedAttribute(h,d,m,p,g,new Z),S.normal.dot(s.direction)>0&&S.normal.multiplyScalar(-1));const _={a:d,b:m,c:p,normal:new Z,materialIndex:0};la.getNormal(af,sf,rf,_.normal),S.face=_,S.barycoord=g}return S}class Ey extends _i{constructor(t=null,i=1,s=1,l,u,h,d,m,p=pi,S=pi,g,_){super(null,h,d,m,p,S,l,u,g,_),this.isDataTexture=!0,this.image={data:t,width:i,height:s},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Qx extends ca{constructor(t,i,s,l=1){super(t,i,s),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=l}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Bo=new sn,Jx=new sn,uf=[],$x=new Or,FT=new sn,ic=new Ce,ac=new Pr;class HT extends Ce{constructor(t,i,s){super(t,i),this.isInstancedMesh=!0,this.instanceMatrix=new Qx(new Float32Array(s*16),16),this.instanceColor=null,this.morphTexture=null,this.count=s,this.boundingBox=null,this.boundingSphere=null;for(let l=0;l<s;l++)this.setMatrixAt(l,FT)}computeBoundingBox(){const t=this.geometry,i=this.count;this.boundingBox===null&&(this.boundingBox=new Or),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let s=0;s<i;s++)this.getMatrixAt(s,Bo),$x.copy(t.boundingBox).applyMatrix4(Bo),this.boundingBox.union($x)}computeBoundingSphere(){const t=this.geometry,i=this.count;this.boundingSphere===null&&(this.boundingSphere=new Pr),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let s=0;s<i;s++)this.getMatrixAt(s,Bo),ac.copy(t.boundingSphere).applyMatrix4(Bo),this.boundingSphere.union(ac)}copy(t,i){return super.copy(t,i),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,i){return this.instanceColor===null?i.setRGB(1,1,1):i.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,i){return i.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,i){const s=i.morphTargetInfluences,l=this.morphTexture.source.data.data,u=s.length+1,h=t*u+1;for(let d=0;d<s.length;d++)s[d]=l[h+d]}raycast(t,i){const s=this.matrixWorld,l=this.count;if(ic.geometry=this.geometry,ic.material=this.material,ic.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ac.copy(this.boundingSphere),ac.applyMatrix4(s),t.ray.intersectsSphere(ac)!==!1))for(let u=0;u<l;u++){this.getMatrixAt(u,Bo),Jx.multiplyMatrices(s,Bo),ic.matrixWorld=Jx,ic.raycast(t,uf);for(let h=0,d=uf.length;h<d;h++){const m=uf[h];m.instanceId=u,m.object=this,i.push(m)}uf.length=0}}setColorAt(t,i){return this.instanceColor===null&&(this.instanceColor=new Qx(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),i.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,i){return i.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,i){const s=i.morphTargetInfluences,l=s.length+1;this.morphTexture===null&&(this.morphTexture=new Ey(new Float32Array(l*this.count),l,this.count,n0,Ma));const u=this.morphTexture.source.data.data;let h=0;for(let p=0;p<s.length;p++)h+=s[p];const d=this.geometry.morphTargetsRelative?1:1-h,m=l*t;return u[m]=d,u.set(s,m+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Rr=new Pr,GT=new te(.5,.5),ff=new Z;class Mc{constructor(t=new Ks,i=new Ks,s=new Ks,l=new Ks,u=new Ks,h=new Ks){this.planes=[t,i,s,l,u,h]}set(t,i,s,l,u,h){const d=this.planes;return d[0].copy(t),d[1].copy(i),d[2].copy(s),d[3].copy(l),d[4].copy(u),d[5].copy(h),this}copy(t){const i=this.planes;for(let s=0;s<6;s++)i[s].copy(t.planes[s]);return this}setFromProjectionMatrix(t,i=Ea,s=!1){const l=this.planes,u=t.elements,h=u[0],d=u[1],m=u[2],p=u[3],S=u[4],g=u[5],_=u[6],x=u[7],b=u[8],A=u[9],y=u[10],M=u[11],N=u[12],P=u[13],L=u[14],I=u[15];if(l[0].setComponents(p-h,x-S,M-b,I-N).normalize(),l[1].setComponents(p+h,x+S,M+b,I+N).normalize(),l[2].setComponents(p+d,x+g,M+A,I+P).normalize(),l[3].setComponents(p-d,x-g,M-A,I-P).normalize(),s)l[4].setComponents(m,_,y,L).normalize(),l[5].setComponents(p-m,x-_,M-y,I-L).normalize();else if(l[4].setComponents(p-m,x-_,M-y,I-L).normalize(),i===Ea)l[5].setComponents(p+m,x+_,M+y,I+L).normalize();else if(i===yc)l[5].setComponents(m,_,y,L).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+i);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Rr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const i=t.geometry;i.boundingSphere===null&&i.computeBoundingSphere(),Rr.copy(i.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Rr)}intersectsSprite(t){Rr.center.set(0,0,0);const i=GT.distanceTo(t.center);return Rr.radius=.7071067811865476+i,Rr.applyMatrix4(t.matrixWorld),this.intersectsSphere(Rr)}intersectsSphere(t){const i=this.planes,s=t.center,l=-t.radius;for(let u=0;u<6;u++)if(i[u].distanceToPoint(s)<l)return!1;return!0}intersectsBox(t){const i=this.planes;for(let s=0;s<6;s++){const l=i[s];if(ff.x=l.normal.x>0?t.max.x:t.min.x,ff.y=l.normal.y>0?t.max.y:t.min.y,ff.z=l.normal.z>0?t.max.z:t.min.z,l.distanceToPoint(ff)<0)return!1}return!0}containsPoint(t){const i=this.planes;for(let s=0;s<6;s++)if(i[s].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const tS=new sn;class c0{constructor(){this.coordinateSystem=Ea,this._frustums=[],this._count=0}setFromArrayCamera(t){const i=t.cameras,s=this._frustums;for(let l=0;l<i.length;l++){const u=i[l];tS.multiplyMatrices(u.projectionMatrix,u.matrixWorldInverse),s[l]===void 0&&(s[l]=new Mc),s[l].setFromProjectionMatrix(tS,u.coordinateSystem,u.reversedDepth)}return this._count=i.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){const i=this._frustums;for(let s=0;s<this._count;s++)if(i[s].intersectsObject(t))return!0;return!1}intersectsSprite(t){const i=this._frustums;for(let s=0;s<this._count;s++)if(i[s].intersectsSprite(t))return!0;return!1}intersectsSphere(t){const i=this._frustums;for(let s=0;s<this._count;s++)if(i[s].intersectsSphere(t))return!0;return!1}intersectsBox(t){const i=this._frustums;for(let s=0;s<this._count;s++)if(i[s].intersectsBox(t))return!0;return!1}containsPoint(t){const i=this._frustums;for(let s=0;s<this._count;s++)if(i[s].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;const i=this._frustums,s=t._frustums;for(let l=0;l<t._count;l++)i[l]===void 0&&(i[l]=new Mc),i[l].copy(s[l]);return this._count=t._count,this}clone(){return new c0().copy(this)}}class u0 extends ir{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new he(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const If=new Z,zf=new Z,eS=new sn,sc=new Xf,hf=new Pr,qp=new Z,nS=new Z;class Vm extends Wn{constructor(t=new In,i=new u0){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,i){return super.copy(t,i),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const i=t.attributes.position,s=[0];for(let l=1,u=i.count;l<u;l++)If.fromBufferAttribute(i,l-1),zf.fromBufferAttribute(i,l),s[l]=s[l-1],s[l]+=If.distanceTo(zf);t.setAttribute("lineDistance",new We(s,1))}else _e("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,i){const s=this.geometry,l=this.matrixWorld,u=t.params.Line.threshold,h=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),hf.copy(s.boundingSphere),hf.applyMatrix4(l),hf.radius+=u,t.ray.intersectsSphere(hf)===!1)return;eS.copy(l).invert(),sc.copy(t.ray).applyMatrix4(eS);const d=u/((this.scale.x+this.scale.y+this.scale.z)/3),m=d*d,p=this.isLineSegments?2:1,S=s.index,_=s.attributes.position;if(S!==null){const x=Math.max(0,h.start),b=Math.min(S.count,h.start+h.count);for(let A=x,y=b-1;A<y;A+=p){const M=S.getX(A),N=S.getX(A+1),P=df(this,t,sc,m,M,N,A);P&&i.push(P)}if(this.isLineLoop){const A=S.getX(b-1),y=S.getX(x),M=df(this,t,sc,m,A,y,b-1);M&&i.push(M)}}else{const x=Math.max(0,h.start),b=Math.min(_.count,h.start+h.count);for(let A=x,y=b-1;A<y;A+=p){const M=df(this,t,sc,m,A,A+1,A);M&&i.push(M)}if(this.isLineLoop){const A=df(this,t,sc,m,b-1,x,b-1);A&&i.push(A)}}}updateMorphTargets(){const i=this.geometry.morphAttributes,s=Object.keys(i);if(s.length>0){const l=i[s[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let u=0,h=l.length;u<h;u++){const d=l[u].name||String(u);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=u}}}}}function df(o,t,i,s,l,u,h){const d=o.geometry.attributes.position;if(If.fromBufferAttribute(d,l),zf.fromBufferAttribute(d,u),i.distanceSqToSegment(If,zf,qp,nS)>s)return;qp.applyMatrix4(o.matrixWorld);const p=t.ray.origin.distanceTo(qp);if(!(p<t.near||p>t.far))return{distance:p,point:nS.clone().applyMatrix4(o.matrixWorld),index:h,face:null,faceIndex:null,barycoord:null,object:o}}const iS=new Z,aS=new Z;class VT extends Vm{constructor(t,i){super(t,i),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const i=t.attributes.position,s=[];for(let l=0,u=i.count;l<u;l+=2)iS.fromBufferAttribute(i,l),aS.fromBufferAttribute(i,l+1),s[l]=l===0?0:s[l-1],s[l+1]=s[l]+iS.distanceTo(aS);t.setAttribute("lineDistance",new We(s,1))}else _e("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Xm extends ir{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new he(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const sS=new sn,km=new Xf,pf=new Pr,mf=new Z;class Wp extends Wn{constructor(t=new In,i=new Xm){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,i){return super.copy(t,i),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,i){const s=this.geometry,l=this.matrixWorld,u=t.params.Points.threshold,h=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),pf.copy(s.boundingSphere),pf.applyMatrix4(l),pf.radius+=u,t.ray.intersectsSphere(pf)===!1)return;sS.copy(l).invert(),km.copy(t.ray).applyMatrix4(sS);const d=u/((this.scale.x+this.scale.y+this.scale.z)/3),m=d*d,p=s.index,g=s.attributes.position;if(p!==null){const _=Math.max(0,h.start),x=Math.min(p.count,h.start+h.count);for(let b=_,A=x;b<A;b++){const y=p.getX(b);mf.fromBufferAttribute(g,y),rS(mf,y,m,l,t,i,this)}}else{const _=Math.max(0,h.start),x=Math.min(g.count,h.start+h.count);for(let b=_,A=x;b<A;b++)mf.fromBufferAttribute(g,b),rS(mf,b,m,l,t,i,this)}}updateMorphTargets(){const i=this.geometry.morphAttributes,s=Object.keys(i);if(s.length>0){const l=i[s[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let u=0,h=l.length;u<h;u++){const d=l[u].name||String(u);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=u}}}}}function rS(o,t,i,s,l,u,h){const d=km.distanceSqToPoint(o);if(d<i){const m=new Z;km.closestPointToPoint(o,m),m.applyMatrix4(s);const p=l.ray.origin.distanceTo(m);if(p<l.near||p>l.far)return;u.push({distance:p,distanceToRay:Math.sqrt(d),point:m,index:t,face:null,faceIndex:null,barycoord:null,object:h})}}class by extends _i{constructor(t=[],i=Zo,s,l,u,h,d,m,p,S){super(t,i,s,l,u,h,d,m,p,S),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class jo extends _i{constructor(t,i,s,l,u,h,d,m,p){super(t,i,s,l,u,h,d,m,p),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Qo extends _i{constructor(t,i,s=Va,l,u,h,d=pi,m=pi,p,S=er,g=1){if(S!==er&&S!==tr)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const _={width:t,height:i,depth:g};super(_,l,u,h,d,m,S,s,p),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new r0(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const i=super.toJSON(t);return i.compareFunction=this.compareFunction,i}}class Ty extends Qo{constructor(t,i=Va,s=Zo,l,u,h=pi,d=pi,m,p=er){const S={width:t,height:t,depth:1},g=[S,S,S,S,S,S];super(t,t,i,s,l,u,h,d,m,p),this.image=g,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class Ay extends _i{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Ri extends In{constructor(t=1,i=1,s=1,l=1,u=1,h=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:i,depth:s,widthSegments:l,heightSegments:u,depthSegments:h};const d=this;l=Math.floor(l),u=Math.floor(u),h=Math.floor(h);const m=[],p=[],S=[],g=[];let _=0,x=0;b("z","y","x",-1,-1,s,i,t,h,u,0),b("z","y","x",1,-1,s,i,-t,h,u,1),b("x","z","y",1,1,t,s,i,l,h,2),b("x","z","y",1,-1,t,s,-i,l,h,3),b("x","y","z",1,-1,t,i,s,l,u,4),b("x","y","z",-1,-1,t,i,-s,l,u,5),this.setIndex(m),this.setAttribute("position",new We(p,3)),this.setAttribute("normal",new We(S,3)),this.setAttribute("uv",new We(g,2));function b(A,y,M,N,P,L,I,U,E,C,W){const H=L/E,K=I/C,J=L/2,ut=I/2,V=U/2,st=E+1,k=C+1;let Y=0,dt=0;const ot=new Z;for(let ht=0;ht<k;ht++){const Tt=ht*K-ut;for(let Vt=0;Vt<st;Vt++){const ae=Vt*H-J;ot[A]=ae*N,ot[y]=Tt*P,ot[M]=V,p.push(ot.x,ot.y,ot.z),ot[A]=0,ot[y]=0,ot[M]=U>0?1:-1,S.push(ot.x,ot.y,ot.z),g.push(Vt/E),g.push(1-ht/C),Y+=1}}for(let ht=0;ht<C;ht++)for(let Tt=0;Tt<E;Tt++){const Vt=_+Tt+st*ht,ae=_+Tt+st*(ht+1),D=_+(Tt+1)+st*(ht+1),$=_+(Tt+1)+st*ht;m.push(Vt,ae,$),m.push(ae,D,$),dt+=6}d.addGroup(x,dt,W),x+=dt,_+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ri(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class f0 extends In{constructor(t=1,i=1,s=4,l=8,u=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:i,capSegments:s,radialSegments:l,heightSegments:u},i=Math.max(0,i),s=Math.max(1,Math.floor(s)),l=Math.max(3,Math.floor(l)),u=Math.max(1,Math.floor(u));const h=[],d=[],m=[],p=[],S=i/2,g=Math.PI/2*t,_=i,x=2*g+_,b=s*2+u,A=l+1,y=new Z,M=new Z;for(let N=0;N<=b;N++){let P=0,L=0,I=0,U=0;if(N<=s){const W=N/s,H=W*Math.PI/2;L=-S-t*Math.cos(H),I=t*Math.sin(H),U=-t*Math.cos(H),P=W*g}else if(N<=s+u){const W=(N-s)/u;L=-S+W*i,I=t,U=0,P=g+W*_}else{const W=(N-s-u)/s,H=W*Math.PI/2;L=S+t*Math.sin(H),I=t*Math.cos(H),U=t*Math.sin(H),P=g+_+W*g}const E=Math.max(0,Math.min(1,P/x));let C=0;N===0?C=.5/l:N===b&&(C=-.5/l);for(let W=0;W<=l;W++){const H=W/l,K=H*Math.PI*2,J=Math.sin(K),ut=Math.cos(K);M.x=-I*ut,M.y=L,M.z=I*J,d.push(M.x,M.y,M.z),y.set(-I*ut,U,I*J),y.normalize(),m.push(y.x,y.y,y.z),p.push(H+C,E)}if(N>0){const W=(N-1)*A;for(let H=0;H<l;H++){const K=W+H,J=W+H+1,ut=N*A+H,V=N*A+H+1;h.push(K,J,ut),h.push(J,V,ut)}}}this.setIndex(h),this.setAttribute("position",new We(d,3)),this.setAttribute("normal",new We(m,3)),this.setAttribute("uv",new We(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new f0(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}}class h0 extends In{constructor(t=1,i=32,s=0,l=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:i,thetaStart:s,thetaLength:l},i=Math.max(3,i);const u=[],h=[],d=[],m=[],p=new Z,S=new te;h.push(0,0,0),d.push(0,0,1),m.push(.5,.5);for(let g=0,_=3;g<=i;g++,_+=3){const x=s+g/i*l;p.x=t*Math.cos(x),p.y=t*Math.sin(x),h.push(p.x,p.y,p.z),d.push(0,0,1),S.x=(h[_]/t+1)/2,S.y=(h[_+1]/t+1)/2,m.push(S.x,S.y)}for(let g=1;g<=i;g++)u.push(g,g+1,0);this.setIndex(u),this.setAttribute("position",new We(h,3)),this.setAttribute("normal",new We(d,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new h0(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class js extends In{constructor(t=1,i=1,s=1,l=32,u=1,h=!1,d=0,m=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:i,height:s,radialSegments:l,heightSegments:u,openEnded:h,thetaStart:d,thetaLength:m};const p=this;l=Math.floor(l),u=Math.floor(u);const S=[],g=[],_=[],x=[];let b=0;const A=[],y=s/2;let M=0;N(),h===!1&&(t>0&&P(!0),i>0&&P(!1)),this.setIndex(S),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(_,3)),this.setAttribute("uv",new We(x,2));function N(){const L=new Z,I=new Z;let U=0;const E=(i-t)/s;for(let C=0;C<=u;C++){const W=[],H=C/u,K=H*(i-t)+t;for(let J=0;J<=l;J++){const ut=J/l,V=ut*m+d,st=Math.sin(V),k=Math.cos(V);I.x=K*st,I.y=-H*s+y,I.z=K*k,g.push(I.x,I.y,I.z),L.set(st,E,k).normalize(),_.push(L.x,L.y,L.z),x.push(ut,1-H),W.push(b++)}A.push(W)}for(let C=0;C<l;C++)for(let W=0;W<u;W++){const H=A[W][C],K=A[W+1][C],J=A[W+1][C+1],ut=A[W][C+1];(t>0||W!==0)&&(S.push(H,K,ut),U+=3),(i>0||W!==u-1)&&(S.push(K,J,ut),U+=3)}p.addGroup(M,U,0),M+=U}function P(L){const I=b,U=new te,E=new Z;let C=0;const W=L===!0?t:i,H=L===!0?1:-1;for(let J=1;J<=l;J++)g.push(0,y*H,0),_.push(0,H,0),x.push(.5,.5),b++;const K=b;for(let J=0;J<=l;J++){const V=J/l*m+d,st=Math.cos(V),k=Math.sin(V);E.x=W*k,E.y=y*H,E.z=W*st,g.push(E.x,E.y,E.z),_.push(0,H,0),U.x=st*.5+.5,U.y=k*.5*H+.5,x.push(U.x,U.y),b++}for(let J=0;J<l;J++){const ut=I+J,V=K+J;L===!0?S.push(V,V+1,ut):S.push(V+1,V,ut),C+=3}p.addGroup(M,C,L===!0?1:2),M+=C}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new js(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class ms{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){_e("Curve: .getPoint() not implemented.")}getPointAt(t,i){const s=this.getUtoTmapping(t);return this.getPoint(s,i)}getPoints(t=5){const i=[];for(let s=0;s<=t;s++)i.push(this.getPoint(s/t));return i}getSpacedPoints(t=5){const i=[];for(let s=0;s<=t;s++)i.push(this.getPointAt(s/t));return i}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const i=[];let s,l=this.getPoint(0),u=0;i.push(0);for(let h=1;h<=t;h++)s=this.getPoint(h/t),u+=s.distanceTo(l),i.push(u),l=s;return this.cacheArcLengths=i,i}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,i=null){const s=this.getLengths();let l=0;const u=s.length;let h;i?h=i:h=t*s[u-1];let d=0,m=u-1,p;for(;d<=m;)if(l=Math.floor(d+(m-d)/2),p=s[l]-h,p<0)d=l+1;else if(p>0)m=l-1;else{m=l;break}if(l=m,s[l]===h)return l/(u-1);const S=s[l],_=s[l+1]-S,x=(h-S)/_;return(l+x)/(u-1)}getTangent(t,i){let l=t-1e-4,u=t+1e-4;l<0&&(l=0),u>1&&(u=1);const h=this.getPoint(l),d=this.getPoint(u),m=i||(h.isVector2?new te:new Z);return m.copy(d).sub(h).normalize(),m}getTangentAt(t,i){const s=this.getUtoTmapping(t);return this.getTangent(s,i)}computeFrenetFrames(t,i=!1){const s=new Z,l=[],u=[],h=[],d=new Z,m=new sn;for(let x=0;x<=t;x++){const b=x/t;l[x]=this.getTangentAt(b,new Z)}u[0]=new Z,h[0]=new Z;let p=Number.MAX_VALUE;const S=Math.abs(l[0].x),g=Math.abs(l[0].y),_=Math.abs(l[0].z);S<=p&&(p=S,s.set(1,0,0)),g<=p&&(p=g,s.set(0,1,0)),_<=p&&s.set(0,0,1),d.crossVectors(l[0],s).normalize(),u[0].crossVectors(l[0],d),h[0].crossVectors(l[0],u[0]);for(let x=1;x<=t;x++){if(u[x]=u[x-1].clone(),h[x]=h[x-1].clone(),d.crossVectors(l[x-1],l[x]),d.length()>Number.EPSILON){d.normalize();const b=Math.acos(He(l[x-1].dot(l[x]),-1,1));u[x].applyMatrix4(m.makeRotationAxis(d,b))}h[x].crossVectors(l[x],u[x])}if(i===!0){let x=Math.acos(He(u[0].dot(u[t]),-1,1));x/=t,l[0].dot(d.crossVectors(u[0],u[t]))>0&&(x=-x);for(let b=1;b<=t;b++)u[b].applyMatrix4(m.makeRotationAxis(l[b],x*b)),h[b].crossVectors(l[b],u[b])}return{tangents:l,normals:u,binormals:h}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}}class Ry extends ms{constructor(t=0,i=0,s=1,l=1,u=0,h=Math.PI*2,d=!1,m=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=i,this.xRadius=s,this.yRadius=l,this.aStartAngle=u,this.aEndAngle=h,this.aClockwise=d,this.aRotation=m}getPoint(t,i=new te){const s=i,l=Math.PI*2;let u=this.aEndAngle-this.aStartAngle;const h=Math.abs(u)<Number.EPSILON;for(;u<0;)u+=l;for(;u>l;)u-=l;u<Number.EPSILON&&(h?u=0:u=l),this.aClockwise===!0&&!h&&(u===l?u=-l:u=u-l);const d=this.aStartAngle+t*u;let m=this.aX+this.xRadius*Math.cos(d),p=this.aY+this.yRadius*Math.sin(d);if(this.aRotation!==0){const S=Math.cos(this.aRotation),g=Math.sin(this.aRotation),_=m-this.aX,x=p-this.aY;m=_*S-x*g+this.aX,p=_*g+x*S+this.aY}return s.set(m,p)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class XT extends Ry{constructor(t,i,s,l,u,h){super(t,i,s,s,l,u,h),this.isArcCurve=!0,this.type="ArcCurve"}}function d0(){let o=0,t=0,i=0,s=0;function l(u,h,d,m){o=u,t=d,i=-3*u+3*h-2*d-m,s=2*u-2*h+d+m}return{initCatmullRom:function(u,h,d,m,p){l(h,d,p*(d-u),p*(m-h))},initNonuniformCatmullRom:function(u,h,d,m,p,S,g){let _=(h-u)/p-(d-u)/(p+S)+(d-h)/S,x=(d-h)/S-(m-h)/(S+g)+(m-d)/g;_*=S,x*=S,l(h,d,_,x)},calc:function(u){const h=u*u,d=h*u;return o+t*u+i*h+s*d}}}const oS=new Z,lS=new Z,Yp=new d0,Zp=new d0,Kp=new d0;class kT extends ms{constructor(t=[],i=!1,s="centripetal",l=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=i,this.curveType=s,this.tension=l}getPoint(t,i=new Z){const s=i,l=this.points,u=l.length,h=(u-(this.closed?0:1))*t;let d=Math.floor(h),m=h-d;this.closed?d+=d>0?0:(Math.floor(Math.abs(d)/u)+1)*u:m===0&&d===u-1&&(d=u-2,m=1);let p,S;this.closed||d>0?p=l[(d-1)%u]:(lS.subVectors(l[0],l[1]).add(l[0]),p=lS);const g=l[d%u],_=l[(d+1)%u];if(this.closed||d+2<u?S=l[(d+2)%u]:(oS.subVectors(l[u-1],l[u-2]).add(l[u-1]),S=oS),this.curveType==="centripetal"||this.curveType==="chordal"){const x=this.curveType==="chordal"?.5:.25;let b=Math.pow(p.distanceToSquared(g),x),A=Math.pow(g.distanceToSquared(_),x),y=Math.pow(_.distanceToSquared(S),x);A<1e-4&&(A=1),b<1e-4&&(b=A),y<1e-4&&(y=A),Yp.initNonuniformCatmullRom(p.x,g.x,_.x,S.x,b,A,y),Zp.initNonuniformCatmullRom(p.y,g.y,_.y,S.y,b,A,y),Kp.initNonuniformCatmullRom(p.z,g.z,_.z,S.z,b,A,y)}else this.curveType==="catmullrom"&&(Yp.initCatmullRom(p.x,g.x,_.x,S.x,this.tension),Zp.initCatmullRom(p.y,g.y,_.y,S.y,this.tension),Kp.initCatmullRom(p.z,g.z,_.z,S.z,this.tension));return s.set(Yp.calc(m),Zp.calc(m),Kp.calc(m)),s}copy(t){super.copy(t),this.points=[];for(let i=0,s=t.points.length;i<s;i++){const l=t.points[i];this.points.push(l.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let i=0,s=this.points.length;i<s;i++){const l=this.points[i];t.points.push(l.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let i=0,s=t.points.length;i<s;i++){const l=t.points[i];this.points.push(new Z().fromArray(l))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function cS(o,t,i,s,l){const u=(s-t)*.5,h=(l-i)*.5,d=o*o,m=o*d;return(2*i-2*s+u+h)*m+(-3*i+3*s-2*u-h)*d+u*o+i}function qT(o,t){const i=1-o;return i*i*t}function WT(o,t){return 2*(1-o)*o*t}function YT(o,t){return o*o*t}function dc(o,t,i,s){return qT(o,t)+WT(o,i)+YT(o,s)}function ZT(o,t){const i=1-o;return i*i*i*t}function KT(o,t){const i=1-o;return 3*i*i*o*t}function jT(o,t){return 3*(1-o)*o*o*t}function QT(o,t){return o*o*o*t}function pc(o,t,i,s,l){return ZT(o,t)+KT(o,i)+jT(o,s)+QT(o,l)}class JT extends ms{constructor(t=new te,i=new te,s=new te,l=new te){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=i,this.v2=s,this.v3=l}getPoint(t,i=new te){const s=i,l=this.v0,u=this.v1,h=this.v2,d=this.v3;return s.set(pc(t,l.x,u.x,h.x,d.x),pc(t,l.y,u.y,h.y,d.y)),s}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class $T extends ms{constructor(t=new Z,i=new Z,s=new Z,l=new Z){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=i,this.v2=s,this.v3=l}getPoint(t,i=new Z){const s=i,l=this.v0,u=this.v1,h=this.v2,d=this.v3;return s.set(pc(t,l.x,u.x,h.x,d.x),pc(t,l.y,u.y,h.y,d.y),pc(t,l.z,u.z,h.z,d.z)),s}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class t1 extends ms{constructor(t=new te,i=new te){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=i}getPoint(t,i=new te){const s=i;return t===1?s.copy(this.v2):(s.copy(this.v2).sub(this.v1),s.multiplyScalar(t).add(this.v1)),s}getPointAt(t,i){return this.getPoint(t,i)}getTangent(t,i=new te){return i.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,i){return this.getTangent(t,i)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class e1 extends ms{constructor(t=new Z,i=new Z){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=i}getPoint(t,i=new Z){const s=i;return t===1?s.copy(this.v2):(s.copy(this.v2).sub(this.v1),s.multiplyScalar(t).add(this.v1)),s}getPointAt(t,i){return this.getPoint(t,i)}getTangent(t,i=new Z){return i.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,i){return this.getTangent(t,i)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class n1 extends ms{constructor(t=new te,i=new te,s=new te){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=i,this.v2=s}getPoint(t,i=new te){const s=i,l=this.v0,u=this.v1,h=this.v2;return s.set(dc(t,l.x,u.x,h.x),dc(t,l.y,u.y,h.y)),s}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Bf extends ms{constructor(t=new Z,i=new Z,s=new Z){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=i,this.v2=s}getPoint(t,i=new Z){const s=i,l=this.v0,u=this.v1,h=this.v2;return s.set(dc(t,l.x,u.x,h.x),dc(t,l.y,u.y,h.y),dc(t,l.z,u.z,h.z)),s}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class i1 extends ms{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,i=new te){const s=i,l=this.points,u=(l.length-1)*t,h=Math.floor(u),d=u-h,m=l[h===0?h:h-1],p=l[h],S=l[h>l.length-2?l.length-1:h+1],g=l[h>l.length-3?l.length-1:h+2];return s.set(cS(d,m.x,p.x,S.x,g.x),cS(d,m.y,p.y,S.y,g.y)),s}copy(t){super.copy(t),this.points=[];for(let i=0,s=t.points.length;i<s;i++){const l=t.points[i];this.points.push(l.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let i=0,s=this.points.length;i<s;i++){const l=this.points[i];t.points.push(l.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let i=0,s=t.points.length;i<s;i++){const l=t.points[i];this.points.push(new te().fromArray(l))}return this}}var a1=Object.freeze({__proto__:null,ArcCurve:XT,CatmullRomCurve3:kT,CubicBezierCurve:JT,CubicBezierCurve3:$T,EllipseCurve:Ry,LineCurve:t1,LineCurve3:e1,QuadraticBezierCurve:n1,QuadraticBezierCurve3:Bf,SplineCurve:i1});class p0 extends In{constructor(t=[new te(0,-.5),new te(.5,0),new te(0,.5)],i=12,s=0,l=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:i,phiStart:s,phiLength:l},i=Math.floor(i),l=He(l,0,Math.PI*2);const u=[],h=[],d=[],m=[],p=[],S=1/i,g=new Z,_=new te,x=new Z,b=new Z,A=new Z;let y=0,M=0;for(let N=0;N<=t.length-1;N++)switch(N){case 0:y=t[N+1].x-t[N].x,M=t[N+1].y-t[N].y,x.x=M*1,x.y=-y,x.z=M*0,A.copy(x),x.normalize(),m.push(x.x,x.y,x.z);break;case t.length-1:A.normalize(),m.push(A.x,A.y,A.z);break;default:y=t[N+1].x-t[N].x,M=t[N+1].y-t[N].y,x.x=M*1,x.y=-y,x.z=M*0,b.copy(x),x.x+=A.x,x.y+=A.y,x.z+=A.z,x.normalize(),m.push(x.x,x.y,x.z),A.copy(b)}for(let N=0;N<=i;N++){const P=s+N*S*l,L=Math.sin(P),I=Math.cos(P);for(let U=0;U<=t.length-1;U++){g.x=t[U].x*L,g.y=t[U].y,g.z=t[U].x*I,h.push(g.x,g.y,g.z),_.x=N/i,_.y=U/(t.length-1),d.push(_.x,_.y);const E=m[3*U+0]*L,C=m[3*U+1],W=m[3*U+0]*I;p.push(E,C,W)}}for(let N=0;N<i;N++)for(let P=0;P<t.length-1;P++){const L=P+N*t.length,I=L,U=L+t.length,E=L+t.length+1,C=L+1;u.push(I,U,C),u.push(E,C,U)}this.setIndex(u),this.setAttribute("position",new We(h,3)),this.setAttribute("uv",new We(d,2)),this.setAttribute("normal",new We(p,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new p0(t.points,t.segments,t.phiStart,t.phiLength)}}class Jo extends In{constructor(t=1,i=1,s=1,l=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:i,widthSegments:s,heightSegments:l};const u=t/2,h=i/2,d=Math.floor(s),m=Math.floor(l),p=d+1,S=m+1,g=t/d,_=i/m,x=[],b=[],A=[],y=[];for(let M=0;M<S;M++){const N=M*_-h;for(let P=0;P<p;P++){const L=P*g-u;b.push(L,-N,0),A.push(0,0,1),y.push(P/d),y.push(1-M/m)}}for(let M=0;M<m;M++)for(let N=0;N<d;N++){const P=N+p*M,L=N+p*(M+1),I=N+1+p*(M+1),U=N+1+p*M;x.push(P,L,U),x.push(L,I,U)}this.setIndex(x),this.setAttribute("position",new We(b,3)),this.setAttribute("normal",new We(A,3)),this.setAttribute("uv",new We(y,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Jo(t.width,t.height,t.widthSegments,t.heightSegments)}}class mc extends In{constructor(t=.5,i=1,s=32,l=1,u=0,h=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:i,thetaSegments:s,phiSegments:l,thetaStart:u,thetaLength:h},s=Math.max(3,s),l=Math.max(1,l);const d=[],m=[],p=[],S=[];let g=t;const _=(i-t)/l,x=new Z,b=new te;for(let A=0;A<=l;A++){for(let y=0;y<=s;y++){const M=u+y/s*h;x.x=g*Math.cos(M),x.y=g*Math.sin(M),m.push(x.x,x.y,x.z),p.push(0,0,1),b.x=(x.x/i+1)/2,b.y=(x.y/i+1)/2,S.push(b.x,b.y)}g+=_}for(let A=0;A<l;A++){const y=A*(s+1);for(let M=0;M<s;M++){const N=M+y,P=N,L=N+s+1,I=N+s+2,U=N+1;d.push(P,L,U),d.push(L,I,U)}}this.setIndex(d),this.setAttribute("position",new We(m,3)),this.setAttribute("normal",new We(p,3)),this.setAttribute("uv",new We(S,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new mc(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class ko extends In{constructor(t=1,i=32,s=16,l=0,u=Math.PI*2,h=0,d=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:i,heightSegments:s,phiStart:l,phiLength:u,thetaStart:h,thetaLength:d},i=Math.max(3,Math.floor(i)),s=Math.max(2,Math.floor(s));const m=Math.min(h+d,Math.PI);let p=0;const S=[],g=new Z,_=new Z,x=[],b=[],A=[],y=[];for(let M=0;M<=s;M++){const N=[],P=M/s,L=h+P*d,I=t*Math.cos(L),U=Math.sqrt(t*t-I*I);let E=0;M===0&&h===0?E=.5/i:M===s&&m===Math.PI&&(E=-.5/i);for(let C=0;C<=i;C++){const W=C/i,H=l+W*u;g.x=-U*Math.cos(H),g.y=I,g.z=U*Math.sin(H),b.push(g.x,g.y,g.z),_.copy(g).normalize(),A.push(_.x,_.y,_.z),y.push(W+E,1-P),N.push(p++)}S.push(N)}for(let M=0;M<s;M++)for(let N=0;N<i;N++){const P=S[M][N+1],L=S[M][N],I=S[M+1][N],U=S[M+1][N+1];(M!==0||h>0)&&x.push(P,L,U),(M!==s-1||m<Math.PI)&&x.push(L,I,U)}this.setIndex(x),this.setAttribute("position",new We(b,3)),this.setAttribute("normal",new We(A,3)),this.setAttribute("uv",new We(y,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ko(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class gc extends In{constructor(t=1,i=.4,s=12,l=48,u=Math.PI*2,h=0,d=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:i,radialSegments:s,tubularSegments:l,arc:u,thetaStart:h,thetaLength:d},s=Math.floor(s),l=Math.floor(l);const m=[],p=[],S=[],g=[],_=new Z,x=new Z,b=new Z;for(let A=0;A<=s;A++){const y=h+A/s*d;for(let M=0;M<=l;M++){const N=M/l*u;x.x=(t+i*Math.cos(y))*Math.cos(N),x.y=(t+i*Math.cos(y))*Math.sin(N),x.z=i*Math.sin(y),p.push(x.x,x.y,x.z),_.x=t*Math.cos(N),_.y=t*Math.sin(N),b.subVectors(x,_).normalize(),S.push(b.x,b.y,b.z),g.push(M/l),g.push(A/s)}}for(let A=1;A<=s;A++)for(let y=1;y<=l;y++){const M=(l+1)*A+y-1,N=(l+1)*(A-1)+y-1,P=(l+1)*(A-1)+y,L=(l+1)*A+y;m.push(M,N,L),m.push(N,P,L)}this.setIndex(m),this.setAttribute("position",new We(p,3)),this.setAttribute("normal",new We(S,3)),this.setAttribute("uv",new We(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new gc(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}}class Ff extends In{constructor(t=new Bf(new Z(-1,-1,0),new Z(-1,1,0),new Z(1,1,0)),i=64,s=1,l=8,u=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:i,radius:s,radialSegments:l,closed:u};const h=t.computeFrenetFrames(i,u);this.tangents=h.tangents,this.normals=h.normals,this.binormals=h.binormals;const d=new Z,m=new Z,p=new te;let S=new Z;const g=[],_=[],x=[],b=[];A(),this.setIndex(b),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(_,3)),this.setAttribute("uv",new We(x,2));function A(){for(let P=0;P<i;P++)y(P);y(u===!1?i:0),N(),M()}function y(P){S=t.getPointAt(P/i,S);const L=h.normals[P],I=h.binormals[P];for(let U=0;U<=l;U++){const E=U/l*Math.PI*2,C=Math.sin(E),W=-Math.cos(E);m.x=W*L.x+C*I.x,m.y=W*L.y+C*I.y,m.z=W*L.z+C*I.z,m.normalize(),_.push(m.x,m.y,m.z),d.x=S.x+s*m.x,d.y=S.y+s*m.y,d.z=S.z+s*m.z,g.push(d.x,d.y,d.z)}}function M(){for(let P=1;P<=i;P++)for(let L=1;L<=l;L++){const I=(l+1)*(P-1)+(L-1),U=(l+1)*P+(L-1),E=(l+1)*P+L,C=(l+1)*(P-1)+L;b.push(I,U,C),b.push(U,E,C)}}function N(){for(let P=0;P<=i;P++)for(let L=0;L<=l;L++)p.x=P/i,p.y=L/l,x.push(p.x,p.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new Ff(new a1[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}}function $o(o){const t={};for(const i in o){t[i]={};for(const s in o[i]){const l=o[i][s];if(uS(l))l.isRenderTargetTexture?(_e("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[i][s]=null):t[i][s]=l.clone();else if(Array.isArray(l))if(uS(l[0])){const u=[];for(let h=0,d=l.length;h<d;h++)u[h]=l[h].clone();t[i][s]=u}else t[i][s]=l.slice();else t[i][s]=l}}return t}function Ai(o){const t={};for(let i=0;i<o.length;i++){const s=$o(o[i]);for(const l in s)t[l]=s[l]}return t}function uS(o){return o&&(o.isColor||o.isMatrix3||o.isMatrix4||o.isVector2||o.isVector3||o.isVector4||o.isTexture||o.isQuaternion)}function s1(o){const t=[];for(let i=0;i<o.length;i++)t.push(o[i].clone());return t}function wy(o){const t=o.getRenderTarget();return t===null?o.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Qe.workingColorSpace}const r1={clone:$o,merge:Ai};var o1=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,l1=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Dr extends ir{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=o1,this.fragmentShader=l1,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=$o(t.uniforms),this.uniformsGroups=s1(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const i=super.toJSON(t);i.glslVersion=this.glslVersion,i.uniforms={};for(const l in this.uniforms){const h=this.uniforms[l].value;h&&h.isTexture?i.uniforms[l]={type:"t",value:h.toJSON(t).uuid}:h&&h.isColor?i.uniforms[l]={type:"c",value:h.getHex()}:h&&h.isVector2?i.uniforms[l]={type:"v2",value:h.toArray()}:h&&h.isVector3?i.uniforms[l]={type:"v3",value:h.toArray()}:h&&h.isVector4?i.uniforms[l]={type:"v4",value:h.toArray()}:h&&h.isMatrix3?i.uniforms[l]={type:"m3",value:h.toArray()}:h&&h.isMatrix4?i.uniforms[l]={type:"m4",value:h.toArray()}:i.uniforms[l]={value:h}}Object.keys(this.defines).length>0&&(i.defines=this.defines),i.vertexShader=this.vertexShader,i.fragmentShader=this.fragmentShader,i.lights=this.lights,i.clipping=this.clipping;const s={};for(const l in this.extensions)this.extensions[l]===!0&&(s[l]=!0);return Object.keys(s).length>0&&(i.extensions=s),i}fromJSON(t,i){if(super.fromJSON(t,i),t.uniforms!==void 0)for(const s in t.uniforms){const l=t.uniforms[s];switch(this.uniforms[s]={},l.type){case"t":this.uniforms[s].value=i[l.value]||null;break;case"c":this.uniforms[s].value=new he().setHex(l.value);break;case"v2":this.uniforms[s].value=new te().fromArray(l.value);break;case"v3":this.uniforms[s].value=new Z().fromArray(l.value);break;case"v4":this.uniforms[s].value=new Dn().fromArray(l.value);break;case"m3":this.uniforms[s].value=new Ae().fromArray(l.value);break;case"m4":this.uniforms[s].value=new sn().fromArray(l.value);break;default:this.uniforms[s].value=l.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const s in t.extensions)this.extensions[s]=t.extensions[s];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class c1 extends Dr{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Zi extends ir{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new he(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new he(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Hm,this.normalScale=new te(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nr,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class u1 extends ir{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=iT,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class f1 extends ir{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class m0 extends Wn{static registerNode(t){this.prototype._lightNode=t}constructor(t,i=1){super(),this.isLight=!0,this.type="Light",this.color=new he(t),this.intensity=i}copy(t,i){return super.copy(t,i),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const i=super.toJSON(t);return i.object.color=this.color.getHex(),i.object.intensity=this.intensity,i}}const jp=new sn,fS=new Z,hS=new Z;class Cy{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new te(512,512),this.mapType=ji,this.map=null,this.mapPass=null,this.matrix=new sn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Mc,this._frameExtents=new te(1,1),this._viewportCount=1,this._viewports=[new Dn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){const i=this.camera;fS.setFromMatrixPosition(t.matrixWorld),i.position.copy(fS),hS.setFromMatrixPosition(t.target.matrixWorld),i.lookAt(hS),i.updateMatrixWorld(),this._updateMatrix(i,this.matrix,this._frustum)}_updateMatrix(t,i,s,l){jp.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),s.setFromProjectionMatrix(jp,t.coordinateSystem,t.reversedDepth);const u=this._frameExtents,h=l?l.z/u.x:1,d=l?l.w/u.y:1,m=l?l.x/u.x:0,p=l?l.y/u.y:0;t.coordinateSystem===yc||t.reversedDepth?i.set(.5*h,0,0,.5*h+m,0,.5*d,0,.5*d+p,0,0,1,0,0,0,0,1):i.set(.5*h,0,0,.5*h+m,0,.5*d,0,.5*d+p,0,0,.5,.5,0,0,0,1),i.multiply(jp)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const gf=new Z,vf=new tl,za=new Z;class Ny extends Wn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new sn,this.projectionMatrix=new sn,this.projectionMatrixInverse=new sn,this.coordinateSystem=Ea,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,i){return super.copy(t,i),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(gf,vf,za),za.x===1&&za.y===1&&za.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(gf,vf,za.set(1,1,1)).invert()}updateWorldMatrix(t,i,s=!1){super.updateWorldMatrix(t,i,s),this.matrixWorld.decompose(gf,vf,za),za.x===1&&za.y===1&&za.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(gf,vf,za.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Zs=new Z,dS=new te,pS=new te;class oa extends Ny{constructor(t=50,i=1,s=.1,l=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=s,this.far=l,this.focus=10,this.aspect=i,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,i){return super.copy(t,i),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const i=.5*this.getFilmHeight()/t;this.fov=Gm*2*Math.atan(i),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Mp*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Gm*2*Math.atan(Math.tan(Mp*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,i,s){Zs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Zs.x,Zs.y).multiplyScalar(-t/Zs.z),Zs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),s.set(Zs.x,Zs.y).multiplyScalar(-t/Zs.z)}getViewSize(t,i){return this.getViewBounds(t,dS,pS),i.subVectors(pS,dS)}setViewOffset(t,i,s,l,u,h){this.aspect=t/i,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=i,this.view.offsetX=s,this.view.offsetY=l,this.view.width=u,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let i=t*Math.tan(Mp*.5*this.fov)/this.zoom,s=2*i,l=this.aspect*s,u=-.5*l;const h=this.view;if(this.view!==null&&this.view.enabled){const m=h.fullWidth,p=h.fullHeight;u+=h.offsetX*l/m,i-=h.offsetY*s/p,l*=h.width/m,s*=h.height/p}const d=this.filmOffset;d!==0&&(u+=t*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(u,u+l,i,i-s,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const i=super.toJSON(t);return i.object.fov=this.fov,i.object.zoom=this.zoom,i.object.near=this.near,i.object.far=this.far,i.object.focus=this.focus,i.object.aspect=this.aspect,this.view!==null&&(i.object.view=Object.assign({},this.view)),i.object.filmGauge=this.filmGauge,i.object.filmOffset=this.filmOffset,i}}class h1 extends Cy{constructor(){super(new oa(90,1,.5,500)),this.isPointLightShadow=!0}}class mS extends m0{constructor(t,i,s=0,l=2){super(t,i),this.isPointLight=!0,this.type="PointLight",this.distance=s,this.decay=l,this.shadow=new h1}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,i){return super.copy(t,i),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){const i=super.toJSON(t);return i.object.distance=this.distance,i.object.decay=this.decay,i.object.shadow=this.shadow.toJSON(),i}}class Dy extends Ny{constructor(t=-1,i=1,s=1,l=-1,u=.1,h=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=i,this.top=s,this.bottom=l,this.near=u,this.far=h,this.updateProjectionMatrix()}copy(t,i){return super.copy(t,i),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,i,s,l,u,h){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=i,this.view.offsetX=s,this.view.offsetY=l,this.view.width=u,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),i=(this.top-this.bottom)/(2*this.zoom),s=(this.right+this.left)/2,l=(this.top+this.bottom)/2;let u=s-t,h=s+t,d=l+i,m=l-i;if(this.view!==null&&this.view.enabled){const p=(this.right-this.left)/this.view.fullWidth/this.zoom,S=(this.top-this.bottom)/this.view.fullHeight/this.zoom;u+=p*this.view.offsetX,h=u+p*this.view.width,d-=S*this.view.offsetY,m=d-S*this.view.height}this.projectionMatrix.makeOrthographic(u,h,d,m,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const i=super.toJSON(t);return i.object.zoom=this.zoom,i.object.left=this.left,i.object.right=this.right,i.object.top=this.top,i.object.bottom=this.bottom,i.object.near=this.near,i.object.far=this.far,this.view!==null&&(i.object.view=Object.assign({},this.view)),i}}class d1 extends Cy{constructor(){super(new Dy(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class p1 extends m0{constructor(t,i){super(t,i),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Wn.DEFAULT_UP),this.updateMatrix(),this.target=new Wn,this.shadow=new d1}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){const i=super.toJSON(t);return i.object.shadow=this.shadow.toJSON(),i.object.target=this.target.uuid,i}}class m1 extends m0{constructor(t,i){super(t,i),this.isAmbientLight=!0,this.type="AmbientLight"}}const Fo=-90,Ho=1;class qm extends Wn{constructor(t,i,s){super(),this.type="CubeCamera",this.renderTarget=s,this.coordinateSystem=null,this.activeMipmapLevel=0;const l=new oa(Fo,Ho,t,i);l.layers=this.layers,this.add(l);const u=new oa(Fo,Ho,t,i);u.layers=this.layers,this.add(u);const h=new oa(Fo,Ho,t,i);h.layers=this.layers,this.add(h);const d=new oa(Fo,Ho,t,i);d.layers=this.layers,this.add(d);const m=new oa(Fo,Ho,t,i);m.layers=this.layers,this.add(m);const p=new oa(Fo,Ho,t,i);p.layers=this.layers,this.add(p)}updateCoordinateSystem(){const t=this.coordinateSystem,i=this.children.concat(),[s,l,u,h,d,m]=i;for(const p of i)this.remove(p);if(t===Ea)s.up.set(0,1,0),s.lookAt(1,0,0),l.up.set(0,1,0),l.lookAt(-1,0,0),u.up.set(0,0,-1),u.lookAt(0,1,0),h.up.set(0,0,1),h.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),m.up.set(0,1,0),m.lookAt(0,0,-1);else if(t===yc)s.up.set(0,-1,0),s.lookAt(-1,0,0),l.up.set(0,-1,0),l.lookAt(1,0,0),u.up.set(0,0,1),u.lookAt(0,1,0),h.up.set(0,0,-1),h.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),m.up.set(0,-1,0),m.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const p of i)this.add(p),p.updateMatrixWorld()}update(t,i){this.parent===null&&this.updateMatrixWorld();const{renderTarget:s,activeMipmapLevel:l}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[u,h,d,m,p,S]=this.children,g=t.getRenderTarget(),_=t.getActiveCubeFace(),x=t.getActiveMipmapLevel(),b=t.xr.enabled;t.xr.enabled=!1;const A=s.texture.mipmapsAutoUpdate;s.texture.mipmapsAutoUpdate=!1;let y=!1;t.isWebGLRenderer===!0?y=t.state.buffers.depth.getReversed():y=t.reversedDepthBuffer,t.setRenderTarget(s,0,l),y&&t.autoClear===!1&&t.clearDepth(),t.render(i,u),t.setRenderTarget(s,1,l),y&&t.autoClear===!1&&t.clearDepth(),t.render(i,h),t.setRenderTarget(s,2,l),y&&t.autoClear===!1&&t.clearDepth(),t.render(i,d),t.setRenderTarget(s,3,l),y&&t.autoClear===!1&&t.clearDepth(),t.render(i,m),t.setRenderTarget(s,4,l),y&&t.autoClear===!1&&t.clearDepth(),t.render(i,p),s.texture.mipmapsAutoUpdate=A,t.setRenderTarget(s,5,l),y&&t.autoClear===!1&&t.clearDepth(),t.render(i,S),t.setRenderTarget(g,_,x),t.xr.enabled=b,s.texture.needsPMREMUpdate=!0}}class g1 extends oa{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}const gS=new sn;class v1{constructor(t,i,s=0,l=1/0){this.ray=new Xf(t,i),this.near=s,this.far=l,this.camera=null,this.layers=new o0,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,i){this.ray.set(t,i)}setFromCamera(t,i){i.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(i.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(i).sub(this.ray.origin).normalize(),this.camera=i):i.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,i.projectionMatrix.elements[14]).unproject(i),this.ray.direction.set(0,0,-1).transformDirection(i.matrixWorld),this.camera=i):en("Raycaster: Unsupported camera type: "+i.type)}setFromXRController(t){return gS.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(gS),this}intersectObject(t,i=!0,s=[]){return Wm(t,this,s,i),s.sort(vS),s}intersectObjects(t,i=!0,s=[]){for(let l=0,u=t.length;l<u;l++)Wm(t[l],this,s,i);return s.sort(vS),s}}function vS(o,t){return o.distance-t.distance}function Wm(o,t,i,s){let l=!0;if(o.layers.test(t.layers)&&o.raycast(t,i)===!1&&(l=!1),l===!0&&s===!0){const u=o.children;for(let h=0,d=u.length;h<d;h++)Wm(u[h],t,i,!0)}}class _1{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,_e("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const i=performance.now();t=(i-this.oldTime)/1e3,this.oldTime=i,this.elapsedTime+=t}return t}}class x1 extends VT{constructor(t=10,i=10,s=4473924,l=8947848){s=new he(s),l=new he(l);const u=i/2,h=t/i,d=t/2,m=[],p=[];for(let _=0,x=0,b=-d;_<=i;_++,b+=h){m.push(-d,0,b,d,0,b),m.push(b,0,-d,b,0,d);const A=_===u?s:l;A.toArray(p,x),x+=3,A.toArray(p,x),x+=3,A.toArray(p,x),x+=3,A.toArray(p,x),x+=3}const S=new In;S.setAttribute("position",new We(m,3)),S.setAttribute("color",new We(p,3));const g=new u0({vertexColors:!0,toneMapped:!1});super(S,g),this.type="GridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}function _S(o,t,i,s){const l=S1(s);switch(i){case cy:return o*t;case n0:return o*t/l.components*l.byteLength;case i0:return o*t/l.components*l.byteLength;case Nr:return o*t*2/l.components*l.byteLength;case a0:return o*t*2/l.components*l.byteLength;case uy:return o*t*3/l.components*l.byteLength;case Ha:return o*t*4/l.components*l.byteLength;case s0:return o*t*4/l.components*l.byteLength;case Mf:case Ef:return Math.floor((o+3)/4)*Math.floor((t+3)/4)*8;case bf:case Tf:return Math.floor((o+3)/4)*Math.floor((t+3)/4)*16;case fm:case dm:return Math.max(o,16)*Math.max(t,8)/4;case um:case hm:return Math.max(o,8)*Math.max(t,8)/2;case pm:case mm:case vm:case _m:return Math.floor((o+3)/4)*Math.floor((t+3)/4)*8;case gm:case Cf:case xm:return Math.floor((o+3)/4)*Math.floor((t+3)/4)*16;case Sm:return Math.floor((o+3)/4)*Math.floor((t+3)/4)*16;case ym:return Math.floor((o+4)/5)*Math.floor((t+3)/4)*16;case Mm:return Math.floor((o+4)/5)*Math.floor((t+4)/5)*16;case Em:return Math.floor((o+5)/6)*Math.floor((t+4)/5)*16;case bm:return Math.floor((o+5)/6)*Math.floor((t+5)/6)*16;case Tm:return Math.floor((o+7)/8)*Math.floor((t+4)/5)*16;case Am:return Math.floor((o+7)/8)*Math.floor((t+5)/6)*16;case Rm:return Math.floor((o+7)/8)*Math.floor((t+7)/8)*16;case wm:return Math.floor((o+9)/10)*Math.floor((t+4)/5)*16;case Cm:return Math.floor((o+9)/10)*Math.floor((t+5)/6)*16;case Nm:return Math.floor((o+9)/10)*Math.floor((t+7)/8)*16;case Dm:return Math.floor((o+9)/10)*Math.floor((t+9)/10)*16;case Lm:return Math.floor((o+11)/12)*Math.floor((t+9)/10)*16;case Um:return Math.floor((o+11)/12)*Math.floor((t+11)/12)*16;case Om:case Pm:case Im:return Math.ceil(o/4)*Math.ceil(t/4)*16;case zm:case Bm:return Math.ceil(o/4)*Math.ceil(t/4)*8;case Nf:case Fm:return Math.ceil(o/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${i} format.`)}function S1(o){switch(o){case ji:case sy:return{byteLength:1,components:1};case Sc:case ry:case Xa:return{byteLength:2,components:1};case t0:case e0:return{byteLength:2,components:4};case Va:case $m:case Ma:return{byteLength:4,components:1};case oy:case ly:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${o}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Jm}}));typeof window<"u"&&(window.__THREE__?_e("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Jm);function Ly(){let o=null,t=!1,i=null,s=null;function l(u,h){s=o.requestAnimationFrame(l),i(u,h)}return{start:function(){t!==!0&&i!==null&&o!==null&&(s=o.requestAnimationFrame(l),t=!0)},stop:function(){o!==null&&o.cancelAnimationFrame(s),t=!1},setAnimationLoop:function(u){i=u},setContext:function(u){o=u}}}function y1(o){const t=new WeakMap;function i(d,m){const p=d.array,S=d.usage,g=p.byteLength,_=o.createBuffer();o.bindBuffer(m,_),o.bufferData(m,p,S),d.onUploadCallback();let x;if(p instanceof Float32Array)x=o.FLOAT;else if(typeof Float16Array<"u"&&p instanceof Float16Array)x=o.HALF_FLOAT;else if(p instanceof Uint16Array)d.isFloat16BufferAttribute?x=o.HALF_FLOAT:x=o.UNSIGNED_SHORT;else if(p instanceof Int16Array)x=o.SHORT;else if(p instanceof Uint32Array)x=o.UNSIGNED_INT;else if(p instanceof Int32Array)x=o.INT;else if(p instanceof Int8Array)x=o.BYTE;else if(p instanceof Uint8Array)x=o.UNSIGNED_BYTE;else if(p instanceof Uint8ClampedArray)x=o.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+p);return{buffer:_,type:x,bytesPerElement:p.BYTES_PER_ELEMENT,version:d.version,size:g}}function s(d,m,p){const S=m.array,g=m.updateRanges;if(o.bindBuffer(p,d),g.length===0)o.bufferSubData(p,0,S);else{g.sort((x,b)=>x.start-b.start);let _=0;for(let x=1;x<g.length;x++){const b=g[_],A=g[x];A.start<=b.start+b.count+1?b.count=Math.max(b.count,A.start+A.count-b.start):(++_,g[_]=A)}g.length=_+1;for(let x=0,b=g.length;x<b;x++){const A=g[x];o.bufferSubData(p,A.start*S.BYTES_PER_ELEMENT,S,A.start,A.count)}m.clearUpdateRanges()}m.onUploadCallback()}function l(d){return d.isInterleavedBufferAttribute&&(d=d.data),t.get(d)}function u(d){d.isInterleavedBufferAttribute&&(d=d.data);const m=t.get(d);m&&(o.deleteBuffer(m.buffer),t.delete(d))}function h(d,m){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const S=t.get(d);(!S||S.version<d.version)&&t.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const p=t.get(d);if(p===void 0)t.set(d,i(d,m));else if(p.version<d.version){if(p.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(p.buffer,d,m),p.version=d.version}}return{get:l,remove:u,update:h}}var M1=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,E1=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,b1=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,T1=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,A1=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,R1=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,w1=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,C1=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,N1=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,D1=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,L1=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,U1=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,O1=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,P1=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,I1=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,z1=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,B1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,F1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,H1=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,G1=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,V1=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,X1=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,k1=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,q1=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,W1=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Y1=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Z1=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,K1=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,j1=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Q1="gl_FragColor = linearToOutputTexel( gl_FragColor );",J1=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,$1=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,tA=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,eA=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,nA=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,iA=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,aA=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,sA=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,rA=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,oA=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,lA=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,cA=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,uA=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,fA=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,hA=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,dA=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,pA=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,mA=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,gA=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,vA=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,_A=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,xA=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,SA=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,yA=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,MA=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,EA=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,bA=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,TA=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,AA=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,RA=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,wA=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,CA=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,NA=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,DA=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,LA=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,UA=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,OA=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,PA=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,IA=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,zA=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,BA=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,FA=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,HA=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,GA=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,VA=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,XA=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,kA=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,qA=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,WA=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,YA=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ZA=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,KA=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,jA=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,QA=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,JA=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$A=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tR=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,eR=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,nR=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,iR=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,aR=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,sR=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,rR=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,oR=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,lR=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,cR=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,uR=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,fR=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hR=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,dR=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,pR=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,mR=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,gR=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,vR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_R=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,xR=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,SR=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const yR=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,MR=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ER=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bR=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,TR=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,AR=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,RR=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,wR=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,CR=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,NR=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,DR=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,LR=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,UR=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,OR=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,PR=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,IR=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zR=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,BR=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,FR=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,HR=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,GR=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,VR=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,XR=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,kR=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qR=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,WR=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,YR=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ZR=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,KR=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,jR=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,QR=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,JR=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$R=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,tw=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Oe={alphahash_fragment:M1,alphahash_pars_fragment:E1,alphamap_fragment:b1,alphamap_pars_fragment:T1,alphatest_fragment:A1,alphatest_pars_fragment:R1,aomap_fragment:w1,aomap_pars_fragment:C1,batching_pars_vertex:N1,batching_vertex:D1,begin_vertex:L1,beginnormal_vertex:U1,bsdfs:O1,iridescence_fragment:P1,bumpmap_pars_fragment:I1,clipping_planes_fragment:z1,clipping_planes_pars_fragment:B1,clipping_planes_pars_vertex:F1,clipping_planes_vertex:H1,color_fragment:G1,color_pars_fragment:V1,color_pars_vertex:X1,color_vertex:k1,common:q1,defaultnormal_vertex:W1,displacementmap_pars_vertex:Y1,displacementmap_vertex:Z1,emissivemap_fragment:K1,emissivemap_pars_fragment:j1,colorspace_fragment:Q1,colorspace_pars_fragment:J1,envmap_fragment:$1,envmap_common_pars_fragment:tA,envmap_pars_fragment:eA,envmap_pars_vertex:nA,envmap_physical_pars_fragment:dA,envmap_vertex:iA,fog_vertex:aA,fog_pars_vertex:sA,fog_fragment:rA,fog_pars_fragment:oA,gradientmap_pars_fragment:lA,lightmap_pars_fragment:cA,lights_lambert_fragment:uA,lights_lambert_pars_fragment:fA,lights_pars_begin:hA,lights_toon_fragment:pA,lights_toon_pars_fragment:mA,lights_phong_fragment:gA,lights_phong_pars_fragment:vA,lights_physical_fragment:_A,lights_physical_pars_fragment:xA,lights_fragment_begin:SA,lights_fragment_maps:yA,lights_fragment_end:MA,lightprobes_pars_fragment:EA,logdepthbuf_fragment:bA,logdepthbuf_pars_fragment:TA,logdepthbuf_pars_vertex:AA,logdepthbuf_vertex:RA,map_fragment:wA,map_pars_fragment:CA,map_particle_fragment:NA,map_particle_pars_fragment:DA,metalnessmap_fragment:LA,metalnessmap_pars_fragment:UA,morphinstance_vertex:OA,morphcolor_vertex:PA,morphnormal_vertex:IA,morphtarget_pars_vertex:zA,morphtarget_vertex:BA,normal_fragment_begin:FA,normal_fragment_maps:HA,normal_pars_fragment:GA,normal_pars_vertex:VA,normal_vertex:XA,normalmap_pars_fragment:kA,clearcoat_normal_fragment_begin:qA,clearcoat_normal_fragment_maps:WA,clearcoat_pars_fragment:YA,iridescence_pars_fragment:ZA,opaque_fragment:KA,packing:jA,premultiplied_alpha_fragment:QA,project_vertex:JA,dithering_fragment:$A,dithering_pars_fragment:tR,roughnessmap_fragment:eR,roughnessmap_pars_fragment:nR,shadowmap_pars_fragment:iR,shadowmap_pars_vertex:aR,shadowmap_vertex:sR,shadowmask_pars_fragment:rR,skinbase_vertex:oR,skinning_pars_vertex:lR,skinning_vertex:cR,skinnormal_vertex:uR,specularmap_fragment:fR,specularmap_pars_fragment:hR,tonemapping_fragment:dR,tonemapping_pars_fragment:pR,transmission_fragment:mR,transmission_pars_fragment:gR,uv_pars_fragment:vR,uv_pars_vertex:_R,uv_vertex:xR,worldpos_vertex:SR,background_vert:yR,background_frag:MR,backgroundCube_vert:ER,backgroundCube_frag:bR,cube_vert:TR,cube_frag:AR,depth_vert:RR,depth_frag:wR,distance_vert:CR,distance_frag:NR,equirect_vert:DR,equirect_frag:LR,linedashed_vert:UR,linedashed_frag:OR,meshbasic_vert:PR,meshbasic_frag:IR,meshlambert_vert:zR,meshlambert_frag:BR,meshmatcap_vert:FR,meshmatcap_frag:HR,meshnormal_vert:GR,meshnormal_frag:VR,meshphong_vert:XR,meshphong_frag:kR,meshphysical_vert:qR,meshphysical_frag:WR,meshtoon_vert:YR,meshtoon_frag:ZR,points_vert:KR,points_frag:jR,shadow_vert:QR,shadow_frag:JR,sprite_vert:$R,sprite_frag:tw},Kt={common:{diffuse:{value:new he(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ae},alphaMap:{value:null},alphaMapTransform:{value:new Ae},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ae}},envmap:{envMap:{value:null},envMapRotation:{value:new Ae},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ae}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ae}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ae},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ae},normalScale:{value:new te(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ae},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ae}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ae}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ae}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new he(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new he(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ae},alphaTest:{value:0},uvTransform:{value:new Ae}},sprite:{diffuse:{value:new he(16777215)},opacity:{value:1},center:{value:new te(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ae},alphaMap:{value:null},alphaMapTransform:{value:new Ae},alphaTest:{value:0}}},Fa={basic:{uniforms:Ai([Kt.common,Kt.specularmap,Kt.envmap,Kt.aomap,Kt.lightmap,Kt.fog]),vertexShader:Oe.meshbasic_vert,fragmentShader:Oe.meshbasic_frag},lambert:{uniforms:Ai([Kt.common,Kt.specularmap,Kt.envmap,Kt.aomap,Kt.lightmap,Kt.emissivemap,Kt.bumpmap,Kt.normalmap,Kt.displacementmap,Kt.fog,Kt.lights,{emissive:{value:new he(0)},envMapIntensity:{value:1}}]),vertexShader:Oe.meshlambert_vert,fragmentShader:Oe.meshlambert_frag},phong:{uniforms:Ai([Kt.common,Kt.specularmap,Kt.envmap,Kt.aomap,Kt.lightmap,Kt.emissivemap,Kt.bumpmap,Kt.normalmap,Kt.displacementmap,Kt.fog,Kt.lights,{emissive:{value:new he(0)},specular:{value:new he(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Oe.meshphong_vert,fragmentShader:Oe.meshphong_frag},standard:{uniforms:Ai([Kt.common,Kt.envmap,Kt.aomap,Kt.lightmap,Kt.emissivemap,Kt.bumpmap,Kt.normalmap,Kt.displacementmap,Kt.roughnessmap,Kt.metalnessmap,Kt.fog,Kt.lights,{emissive:{value:new he(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag},toon:{uniforms:Ai([Kt.common,Kt.aomap,Kt.lightmap,Kt.emissivemap,Kt.bumpmap,Kt.normalmap,Kt.displacementmap,Kt.gradientmap,Kt.fog,Kt.lights,{emissive:{value:new he(0)}}]),vertexShader:Oe.meshtoon_vert,fragmentShader:Oe.meshtoon_frag},matcap:{uniforms:Ai([Kt.common,Kt.bumpmap,Kt.normalmap,Kt.displacementmap,Kt.fog,{matcap:{value:null}}]),vertexShader:Oe.meshmatcap_vert,fragmentShader:Oe.meshmatcap_frag},points:{uniforms:Ai([Kt.points,Kt.fog]),vertexShader:Oe.points_vert,fragmentShader:Oe.points_frag},dashed:{uniforms:Ai([Kt.common,Kt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Oe.linedashed_vert,fragmentShader:Oe.linedashed_frag},depth:{uniforms:Ai([Kt.common,Kt.displacementmap]),vertexShader:Oe.depth_vert,fragmentShader:Oe.depth_frag},normal:{uniforms:Ai([Kt.common,Kt.bumpmap,Kt.normalmap,Kt.displacementmap,{opacity:{value:1}}]),vertexShader:Oe.meshnormal_vert,fragmentShader:Oe.meshnormal_frag},sprite:{uniforms:Ai([Kt.sprite,Kt.fog]),vertexShader:Oe.sprite_vert,fragmentShader:Oe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ae},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Oe.background_vert,fragmentShader:Oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ae}},vertexShader:Oe.backgroundCube_vert,fragmentShader:Oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Oe.cube_vert,fragmentShader:Oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Oe.equirect_vert,fragmentShader:Oe.equirect_frag},distance:{uniforms:Ai([Kt.common,Kt.displacementmap,{referencePosition:{value:new Z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Oe.distance_vert,fragmentShader:Oe.distance_frag},shadow:{uniforms:Ai([Kt.lights,Kt.fog,{color:{value:new he(0)},opacity:{value:1}}]),vertexShader:Oe.shadow_vert,fragmentShader:Oe.shadow_frag}};Fa.physical={uniforms:Ai([Fa.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ae},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ae},clearcoatNormalScale:{value:new te(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ae},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ae},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ae},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ae},sheen:{value:0},sheenColor:{value:new he(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ae},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ae},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ae},transmissionSamplerSize:{value:new te},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ae},attenuationDistance:{value:0},attenuationColor:{value:new he(0)},specularColor:{value:new he(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ae},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ae},anisotropyVector:{value:new te},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ae}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag};const _f={r:0,b:0,g:0},ew=new sn,Uy=new Ae;Uy.set(-1,0,0,0,1,0,0,0,1);function nw(o,t,i,s,l,u){const h=new he(0);let d=l===!0?0:1,m,p,S=null,g=0,_=null;function x(N){let P=N.isScene===!0?N.background:null;if(P&&P.isTexture){const L=N.backgroundBlurriness>0;P=t.get(P,L)}return P}function b(N){let P=!1;const L=x(N);L===null?y(h,d):L&&L.isColor&&(y(L,1),P=!0);const I=o.xr.getEnvironmentBlendMode();I==="additive"?i.buffers.color.setClear(0,0,0,1,u):I==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,u),(o.autoClear||P)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),o.clear(o.autoClearColor,o.autoClearDepth,o.autoClearStencil))}function A(N,P){const L=x(P);L&&L.isCubeTexture?(p===void 0&&(p=new Ce(new Ri(1,1,1),new Dr({name:"BackgroundCubeMaterial",uniforms:$o(Fa.backgroundCube.uniforms),vertexShader:Fa.backgroundCube.vertexShader,fragmentShader:Fa.backgroundCube.fragmentShader,side:zi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),p.geometry.deleteAttribute("normal"),p.geometry.deleteAttribute("uv"),p.onBeforeRender=function(I,U,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(p.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(p)),p.material.uniforms.envMap.value=L,p.material.uniforms.backgroundBlurriness.value=P.backgroundBlurriness,p.material.uniforms.backgroundIntensity.value=P.backgroundIntensity,p.material.uniforms.backgroundRotation.value.setFromMatrix4(ew.makeRotationFromEuler(P.backgroundRotation)).transpose(),L.isRenderTargetTexture===!1&&p.material.uniforms.backgroundRotation.value.premultiply(Uy),p.material.toneMapped=Qe.getTransfer(L.colorSpace)!==hn,(S!==L||g!==L.version||_!==o.toneMapping)&&(p.material.needsUpdate=!0,S=L,g=L.version,_=o.toneMapping),p.layers.enableAll(),N.unshift(p,p.geometry,p.material,0,0,null)):L&&L.isTexture&&(m===void 0&&(m=new Ce(new Jo(2,2),new Dr({name:"BackgroundMaterial",uniforms:$o(Fa.background.uniforms),vertexShader:Fa.background.vertexShader,fragmentShader:Fa.background.fragmentShader,side:Cr,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(m)),m.material.uniforms.t2D.value=L,m.material.uniforms.backgroundIntensity.value=P.backgroundIntensity,m.material.toneMapped=Qe.getTransfer(L.colorSpace)!==hn,L.matrixAutoUpdate===!0&&L.updateMatrix(),m.material.uniforms.uvTransform.value.copy(L.matrix),(S!==L||g!==L.version||_!==o.toneMapping)&&(m.material.needsUpdate=!0,S=L,g=L.version,_=o.toneMapping),m.layers.enableAll(),N.unshift(m,m.geometry,m.material,0,0,null))}function y(N,P){N.getRGB(_f,wy(o)),i.buffers.color.setClear(_f.r,_f.g,_f.b,P,u)}function M(){p!==void 0&&(p.geometry.dispose(),p.material.dispose(),p=void 0),m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0)}return{getClearColor:function(){return h},setClearColor:function(N,P=1){h.set(N),d=P,y(h,d)},getClearAlpha:function(){return d},setClearAlpha:function(N){d=N,y(h,d)},render:b,addToRenderList:A,dispose:M}}function iw(o,t){const i=o.getParameter(o.MAX_VERTEX_ATTRIBS),s={},l=_(null);let u=l,h=!1;function d(K,J,ut,V,st){let k=!1;const Y=g(K,V,ut,J);u!==Y&&(u=Y,p(u.object)),k=x(K,V,ut,st),k&&b(K,V,ut,st),st!==null&&t.update(st,o.ELEMENT_ARRAY_BUFFER),(k||h)&&(h=!1,L(K,J,ut,V),st!==null&&o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,t.get(st).buffer))}function m(){return o.createVertexArray()}function p(K){return o.bindVertexArray(K)}function S(K){return o.deleteVertexArray(K)}function g(K,J,ut,V){const st=V.wireframe===!0;let k=s[J.id];k===void 0&&(k={},s[J.id]=k);const Y=K.isInstancedMesh===!0?K.id:0;let dt=k[Y];dt===void 0&&(dt={},k[Y]=dt);let ot=dt[ut.id];ot===void 0&&(ot={},dt[ut.id]=ot);let ht=ot[st];return ht===void 0&&(ht=_(m()),ot[st]=ht),ht}function _(K){const J=[],ut=[],V=[];for(let st=0;st<i;st++)J[st]=0,ut[st]=0,V[st]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:J,enabledAttributes:ut,attributeDivisors:V,object:K,attributes:{},index:null}}function x(K,J,ut,V){const st=u.attributes,k=J.attributes;let Y=0;const dt=ut.getAttributes();for(const ot in dt)if(dt[ot].location>=0){const Tt=st[ot];let Vt=k[ot];if(Vt===void 0&&(ot==="instanceMatrix"&&K.instanceMatrix&&(Vt=K.instanceMatrix),ot==="instanceColor"&&K.instanceColor&&(Vt=K.instanceColor)),Tt===void 0||Tt.attribute!==Vt||Vt&&Tt.data!==Vt.data)return!0;Y++}return u.attributesNum!==Y||u.index!==V}function b(K,J,ut,V){const st={},k=J.attributes;let Y=0;const dt=ut.getAttributes();for(const ot in dt)if(dt[ot].location>=0){let Tt=k[ot];Tt===void 0&&(ot==="instanceMatrix"&&K.instanceMatrix&&(Tt=K.instanceMatrix),ot==="instanceColor"&&K.instanceColor&&(Tt=K.instanceColor));const Vt={};Vt.attribute=Tt,Tt&&Tt.data&&(Vt.data=Tt.data),st[ot]=Vt,Y++}u.attributes=st,u.attributesNum=Y,u.index=V}function A(){const K=u.newAttributes;for(let J=0,ut=K.length;J<ut;J++)K[J]=0}function y(K){M(K,0)}function M(K,J){const ut=u.newAttributes,V=u.enabledAttributes,st=u.attributeDivisors;ut[K]=1,V[K]===0&&(o.enableVertexAttribArray(K),V[K]=1),st[K]!==J&&(o.vertexAttribDivisor(K,J),st[K]=J)}function N(){const K=u.newAttributes,J=u.enabledAttributes;for(let ut=0,V=J.length;ut<V;ut++)J[ut]!==K[ut]&&(o.disableVertexAttribArray(ut),J[ut]=0)}function P(K,J,ut,V,st,k,Y){Y===!0?o.vertexAttribIPointer(K,J,ut,st,k):o.vertexAttribPointer(K,J,ut,V,st,k)}function L(K,J,ut,V){A();const st=V.attributes,k=ut.getAttributes(),Y=J.defaultAttributeValues;for(const dt in k){const ot=k[dt];if(ot.location>=0){let ht=st[dt];if(ht===void 0&&(dt==="instanceMatrix"&&K.instanceMatrix&&(ht=K.instanceMatrix),dt==="instanceColor"&&K.instanceColor&&(ht=K.instanceColor)),ht!==void 0){const Tt=ht.normalized,Vt=ht.itemSize,ae=t.get(ht);if(ae===void 0)continue;const D=ae.buffer,$=ae.type,xt=ae.bytesPerElement,At=$===o.INT||$===o.UNSIGNED_INT||ht.gpuType===$m;if(ht.isInterleavedBufferAttribute){const Ct=ht.data,qt=Ct.isInterleavedBuffer===!0?Ct.stride:Ct.itemSize,le=ht.offset;if(Ct.isInstancedInterleavedBuffer||Ct.isInstancedBufferAttribute){for(let wt=0;wt<ot.locationSize;wt++)M(ot.location+wt,Ct.meshPerAttribute);K.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=Ct.meshPerAttribute*Ct.count)}else for(let wt=0;wt<ot.locationSize;wt++)y(ot.location+wt);o.bindBuffer(o.ARRAY_BUFFER,D);for(let wt=0;wt<ot.locationSize;wt++)P(ot.location+wt,Vt/ot.locationSize,$,Tt,qt*xt,(le+Vt/ot.locationSize*wt)*xt,At)}else{if(ht.isInstancedBufferAttribute){for(let Ct=0;Ct<ot.locationSize;Ct++)M(ot.location+Ct,ht.meshPerAttribute);K.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let Ct=0;Ct<ot.locationSize;Ct++)y(ot.location+Ct);o.bindBuffer(o.ARRAY_BUFFER,D);for(let Ct=0;Ct<ot.locationSize;Ct++)P(ot.location+Ct,Vt/ot.locationSize,$,Tt,Vt*xt,Vt/ot.locationSize*Ct*xt,At)}}else if(Y!==void 0){const Tt=Y[dt];if(Tt!==void 0)switch(Tt.length){case 2:o.vertexAttrib2fv(ot.location,Tt);break;case 3:o.vertexAttrib3fv(ot.location,Tt);break;case 4:o.vertexAttrib4fv(ot.location,Tt);break;default:o.vertexAttrib1fv(ot.location,Tt)}}}}N()}function I(){W();for(const K in s){const J=s[K];for(const ut in J){const V=J[ut];for(const st in V){const k=V[st];for(const Y in k)S(k[Y].object),delete k[Y];delete V[st]}}delete s[K]}}function U(K){if(s[K.id]===void 0)return;const J=s[K.id];for(const ut in J){const V=J[ut];for(const st in V){const k=V[st];for(const Y in k)S(k[Y].object),delete k[Y];delete V[st]}}delete s[K.id]}function E(K){for(const J in s){const ut=s[J];for(const V in ut){const st=ut[V];if(st[K.id]===void 0)continue;const k=st[K.id];for(const Y in k)S(k[Y].object),delete k[Y];delete st[K.id]}}}function C(K){for(const J in s){const ut=s[J],V=K.isInstancedMesh===!0?K.id:0,st=ut[V];if(st!==void 0){for(const k in st){const Y=st[k];for(const dt in Y)S(Y[dt].object),delete Y[dt];delete st[k]}delete ut[V],Object.keys(ut).length===0&&delete s[J]}}}function W(){H(),h=!0,u!==l&&(u=l,p(u.object))}function H(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:d,reset:W,resetDefaultState:H,dispose:I,releaseStatesOfGeometry:U,releaseStatesOfObject:C,releaseStatesOfProgram:E,initAttributes:A,enableAttribute:y,disableUnusedAttributes:N}}function aw(o,t,i){let s;function l(m){s=m}function u(m,p){o.drawArrays(s,m,p),i.update(p,s,1)}function h(m,p,S){S!==0&&(o.drawArraysInstanced(s,m,p,S),i.update(p,s,S))}function d(m,p,S){if(S===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s,m,0,p,0,S);let _=0;for(let x=0;x<S;x++)_+=p[x];i.update(_,s,1)}this.setMode=l,this.render=u,this.renderInstances=h,this.renderMultiDraw=d}function sw(o,t,i,s){let l;function u(){if(l!==void 0)return l;if(t.has("EXT_texture_filter_anisotropic")===!0){const E=t.get("EXT_texture_filter_anisotropic");l=o.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else l=0;return l}function h(E){return!(E!==Ha&&s.convert(E)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(E){const C=E===Xa&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==ji&&E!==Ma&&!C&&s.convert(E)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_TYPE))}function m(E){if(E==="highp"){if(o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.HIGH_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.MEDIUM_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let p=i.precision!==void 0?i.precision:"highp";const S=m(p);S!==p&&(_e("WebGLRenderer:",p,"not supported, using",S,"instead."),p=S);const g=i.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),_=i.logarithmicDepthBuffer===!0&&g===!1;i.reversedDepthBuffer===!0&&g===!1&&_e("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),i.logarithmicDepthBuffer===!0&&g===!0&&_e("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const x=o.getParameter(o.MAX_TEXTURE_IMAGE_UNITS),b=o.getParameter(o.MAX_VERTEX_TEXTURE_IMAGE_UNITS),A=o.getParameter(o.MAX_TEXTURE_SIZE),y=o.getParameter(o.MAX_CUBE_MAP_TEXTURE_SIZE),M=o.getParameter(o.MAX_VERTEX_ATTRIBS),N=o.getParameter(o.MAX_VERTEX_UNIFORM_VECTORS),P=o.getParameter(o.MAX_VARYING_VECTORS),L=o.getParameter(o.MAX_FRAGMENT_UNIFORM_VECTORS),I=o.getParameter(o.MAX_SAMPLES),U=o.getParameter(o.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:u,getMaxPrecision:m,textureFormatReadable:h,textureTypeReadable:d,precision:p,logarithmicDepthBuffer:_,reversedDepthBuffer:g,maxTextures:x,maxVertexTextures:b,maxTextureSize:A,maxCubemapSize:y,maxAttributes:M,maxVertexUniforms:N,maxVaryings:P,maxFragmentUniforms:L,maxSamples:I,samples:U}}function rw(o){const t=this;let i=null,s=0,l=!1,u=!1;const h=new Ks,d=new Ae,m={value:null,needsUpdate:!1};this.uniform=m,this.numPlanes=0,this.numIntersection=0,this.init=function(g,_){const x=g.length!==0||_||s!==0||l;return l=_,s=g.length,x},this.beginShadows=function(){u=!0,S(null)},this.endShadows=function(){u=!1},this.setGlobalState=function(g,_){i=S(g,_,0)},this.setState=function(g,_,x){const b=g.clippingPlanes,A=g.clipIntersection,y=g.clipShadows,M=o.get(g);if(!l||b===null||b.length===0||u&&!y)u?S(null):p();else{const N=u?0:s,P=N*4;let L=M.clippingState||null;m.value=L,L=S(b,_,P,x);for(let I=0;I!==P;++I)L[I]=i[I];M.clippingState=L,this.numIntersection=A?this.numPlanes:0,this.numPlanes+=N}};function p(){m.value!==i&&(m.value=i,m.needsUpdate=s>0),t.numPlanes=s,t.numIntersection=0}function S(g,_,x,b){const A=g!==null?g.length:0;let y=null;if(A!==0){if(y=m.value,b!==!0||y===null){const M=x+A*4,N=_.matrixWorldInverse;d.getNormalMatrix(N),(y===null||y.length<M)&&(y=new Float32Array(M));for(let P=0,L=x;P!==A;++P,L+=4)h.copy(g[P]).applyMatrix4(N,d),h.normal.toArray(y,L),y[L+3]=h.constant}m.value=y,m.needsUpdate=!0}return t.numPlanes=A,t.numIntersection=0,y}}class g0 extends Ga{constructor(t=1,i={}){super(t,t,i),this.isWebGLCubeRenderTarget=!0;const s={width:t,height:t,depth:1},l=[s,s,s,s,s,s];this.texture=new by(l),this._setTextureOptions(i),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,i){this.texture.type=i.type,this.texture.colorSpace=i.colorSpace,this.texture.generateMipmaps=i.generateMipmaps,this.texture.minFilter=i.minFilter,this.texture.magFilter=i.magFilter;const s={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},l=new Ri(5,5,5),u=new Dr({name:"CubemapFromEquirect",uniforms:$o(s.uniforms),vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,side:zi,blending:qo});u.uniforms.tEquirect.value=i;const h=new Ce(l,u),d=i.minFilter;return i.minFilter===$s&&(i.minFilter=Ii),new qm(1,10,this).update(t,h),i.minFilter=d,h.geometry.dispose(),h.material.dispose(),this}clear(t,i=!0,s=!0,l=!0){const u=t.getRenderTarget();for(let h=0;h<6;h++)t.setRenderTarget(this,h),t.clear(i,s,l);t.setRenderTarget(u)}}const xS=256,ow=3,lw=20,Oy=256,Py=16,cw=3,uw=new Z,fw=new he;class Hf{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new qm(1,10,null),this._boxMesh=new Ce(new Ri(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,i=0,s=.1,l=100,u={}){const{size:h=256,position:d=uw}=u,m=this._renderer;this._setSize(h);const p=this._allocateTarget(),S=this._getSourceTarget(!0);i>0&&(S.texture.mipmapsAutoUpdate=!1);const g=m.autoClear,_=m.autoClearColor,x=m.autoClearDepth,b=m.autoClearStencil,A=t.background;m.autoClear=!0,m.autoClearColor=!0,m.autoClearDepth=!0,m.autoClearStencil=!0,A===null&&(t.background=m.getClearColor(fw));const y=new qm(s,l,S);return y.position.copy(d),y.update(m,t),m.autoClear=g,m.autoClearColor=_,m.autoClearDepth=x,m.autoClearStencil=b,t.background=A,i>0&&(S.texture.mipmapsAutoUpdate=!0,this._blur(p,i)),this._applyPMREM(p),p}fromEquirectangular(t,i=null){return this._fromTexture(t,i)}fromCubemap(t,i=null){return this._fromTexture(t,i)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=MS(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=yS(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,i){return i>0?1-Math.sqrt(1-t/i):0}_setSize(t){this._cubeSize=Math.max(xS,gT(t))}_fromTexture(t,i){t.mapping===Zo||t.mapping===_c?this._setSize(t.image.length===0?xS:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);const s=i||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(s),s}_allocateTarget(){const t=this._cubeSize,i=SS(t,!1,!1),s=Math.log2(t)-ow;for(let l=0;l<=s;l++)i.texture.mipmaps.push({width:t>>l,height:t>>l});return i.texture.name="PMREM",i.texture.isPMREMTexture=!0,i}_getSourceTarget(t=!1){const i=this._cubeSize,s=this._sourceTarget;return(s===null||s.width!==i||t&&s.depthBuffer===!1)&&(s!==null&&s.dispose(),this._sourceTarget=SS(i,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,i,s){const l=this._boxMesh,u=this._cubeCamera;l.material=s,u.renderTarget=t,u.activeMipmapLevel=i;const h=t.width>>i;t.viewport.set(0,0,h,h),u.update(this._renderer,l),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let i;t.mapping===Zo||t.mapping===_c?(this._cubemapMaterial===null&&(this._cubemapMaterial=MS()),i=this._cubemapMaterial,i.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=yS()),i=this._equirectMaterial),i.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,i)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=hw(),this._integrationMaterial=dw());const i=this._cubeSize,s=t.texture.mipmaps.length-1,l=this._ggxMaterial.uniforms;l.envMap.value=this._sourceTarget.texture;const u=this._integrationMaterial.uniforms;u.envMap.value=this._sourceTarget.texture,u.sourceLod.value=Math.log2(i/Py);for(let h=0;h<=s;h++){const d=Hf.lodToRoughness(h,s);if(h>s-cw)u.roughness.value=d,this._renderCube(t,h,this._integrationMaterial);else{const m=d>0?Math.log2(i)+.5*Math.log2(6/(Oy*Math.pow(d,4)))+.5:0;l.roughness.value=d,l.lodBias.value=m,this._renderCube(t,h,this._ggxMaterial)}}}_blur(t,i){this._blurMaterial===null&&(this._blurMaterial=pw());const s=this._blurMaterial,l=s.uniforms,u=this._sourceTarget;l.sigma.value=Math.min(i,Math.PI)/Math.SQRT2,l.envMap.value=u.texture,this._renderCube(t,0,s),l.envMap.value=t.texture,this._renderCube(u,0,s)}}function SS(o,t,i){return new g0(o,{minFilter:$s,generateMipmaps:t,type:Xa,colorSpace:Df,depthBuffer:i})}function bc(o,t,i){return new Dr({name:o,uniforms:t,vertexShader:Oe.cube_vert,fragmentShader:i,side:zi,blending:qo,depthTest:!1,depthWrite:!1})}function hw(){return bc("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Oy}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function dw(){return bc("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Py}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function pw(){return bc("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${lw}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function yS(){return bc("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function MS(){return bc("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function mw(o){let t=new WeakMap,i=new WeakMap,s=null;function l(_,x=!1){return _==null?null:x?h(_):u(_)}function u(_){if(_&&_.isTexture){const x=_.mapping;if(x===_p||x===xp)if(t.has(_)){const b=t.get(_).texture;return d(b,_.mapping)}else{const b=_.image;if(b&&b.height>0){const A=new g0(b.height);return A.fromEquirectangularTexture(o,_),t.set(_,A),_.addEventListener("dispose",p),d(A.texture,_.mapping)}else return null}}return _}function h(_){if(_&&_.isTexture&&_.isPMREMTexture!==!0){const x=_.mapping,b=x===_p||x===xp,A=x===Zo||x===_c;if(b||A){let y=i.get(_);const M=y!==void 0?y.texture.pmremVersion:0;if(_.isRenderTargetTexture&&_.pmremVersion!==M)return s===null&&(s=new Hf(o)),y=b?s.fromEquirectangular(_,y):s.fromCubemap(_,y),y.texture.pmremVersion=_.pmremVersion,i.set(_,y),y.texture;if(y!==void 0)return y.texture;{const N=_.image;return b&&N&&N.height>0||A&&N&&m(N)?(s===null&&(s=new Hf(o)),y=b?s.fromEquirectangular(_):s.fromCubemap(_),y.texture.pmremVersion=_.pmremVersion,i.set(_,y),_.addEventListener("dispose",S),y.texture):null}}}return _}function d(_,x){return x===_p?_.mapping=Zo:x===xp&&(_.mapping=_c),_}function m(_){let x=0;const b=6;for(let A=0;A<b;A++)_[A]!==void 0&&x++;return x===b}function p(_){const x=_.target;x.removeEventListener("dispose",p);const b=t.get(x);b!==void 0&&(t.delete(x),b.dispose())}function S(_){const x=_.target;x.removeEventListener("dispose",S);const b=i.get(x);b!==void 0&&(i.delete(x),b.dispose())}function g(){t=new WeakMap,i=new WeakMap,s!==null&&(s.dispose(),s=null)}return{get:l,dispose:g}}function gw(o){const t={};function i(s){if(t[s]!==void 0)return t[s];const l=o.getExtension(s);return t[s]=l,l}return{has:function(s){return i(s)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(s){const l=i(s);return l===null&&Af("WebGLRenderer: "+s+" extension not supported."),l}}}function vw(o,t,i,s){const l={},u=new WeakMap,h=new FinalizationRegistry(b=>delete l[b]);function d(b){m(b.target)}function m(b){b.index!==null&&t.remove(b.index);for(const y in b.attributes)t.remove(b.attributes[y]);b.removeEventListener("dispose",d),delete l[b.id],h.unregister(b);const A=u.get(b);A&&(t.remove(A),u.delete(b)),s.releaseStatesOfGeometry(b),b.isInstancedBufferGeometry===!0&&delete b._maxInstanceCount,i.memory.geometries--}function p(b,A){return l[A.id]!==void 0||(A.addEventListener("dispose",d),l[A.id]=new WeakRef(A),h.register(A,A.id,A),i.memory.geometries++),A}function S(b){const A=b.attributes;for(const y in A)t.update(A[y],o.ARRAY_BUFFER)}function g(b){const A=b.index,y=b.attributes.position;let M=0;if(y===void 0)return;const N=A!==null?A.array.length:y.array.length/3-1,P=y.count>=65535?yy:Sy,L=new P(Math.ceil(N/3)*6,1),I=L.array;if(A!==null){const E=A.array;M=A.version;for(let C=0,W=0;C<N;C+=3){const H=E[C+0],K=E[C+1],J=E[C+2];I[W++]=H,I[W++]=K,I[W++]=K,I[W++]=J,I[W++]=J,I[W++]=H}}else{M=y.version;for(let E=0,C=0;E<N;E+=3){const W=E+0,H=E+1,K=E+2;I[C++]=W,I[C++]=H,I[C++]=H,I[C++]=K,I[C++]=K,I[C++]=W}}L.version=M;const U=u.get(b);U&&t.remove(U),u.set(b,L)}function _(b){const A=u.get(b);if(A){const y=b.index;y!==null&&A.version<y.version&&g(b)}else g(b);return u.get(b)}function x(){for(const b in l){const A=l[b].deref();A!==void 0&&m(A)}}return{get:p,update:S,getWireframeAttribute:_,dispose:x}}function _w(o,t,i){let s;function l(g){s=g}let u,h;function d(g){u=g.type,h=g.bytesPerElement}function m(g,_){o.drawElements(s,_,u,g*h),i.update(_,s,1)}function p(g,_,x){x!==0&&(o.drawElementsInstanced(s,_,u,g*h,x),i.update(_,s,x))}function S(g,_,x){if(x===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s,_,0,u,g,0,x);let A=0;for(let y=0;y<x;y++)A+=_[y];i.update(A,s,1)}this.setMode=l,this.setIndex=d,this.render=m,this.renderInstances=p,this.renderMultiDraw=S}function xw(o){const t={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function s(u,h,d){switch(i.calls++,h){case o.TRIANGLES:i.triangles+=d*(u/3);break;case o.LINES:i.lines+=d*(u/2);break;case o.LINE_STRIP:i.lines+=d*(u-1);break;case o.LINE_LOOP:i.lines+=d*u;break;case o.POINTS:i.points+=d*u;break;default:en("WebGLInfo: Unknown draw mode:",h);break}}function l(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:t,render:i,programs:null,autoReset:!0,reset:l,update:s}}function Sw(o,t,i){const s=new WeakMap,l=new Dn;function u(h,d,m){const p=h.morphTargetInfluences,S=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,g=S!==void 0?S.length:0;let _=s.get(d);if(_===void 0||_.count!==g){let H=function(){C.dispose(),s.delete(d),d.removeEventListener("dispose",H)};var x=H;_!==void 0&&_.texture.dispose();const b=d.morphAttributes.position!==void 0,A=d.morphAttributes.normal!==void 0,y=d.morphAttributes.color!==void 0,M=d.morphAttributes.position||[],N=d.morphAttributes.normal||[],P=d.morphAttributes.color||[];let L=0;b===!0&&(L=1),A===!0&&(L=2),y===!0&&(L=3);let I=d.attributes.position.count*L,U=1;I>t.maxTextureSize&&(U=Math.ceil(I/t.maxTextureSize),I=t.maxTextureSize);const E=new Float32Array(I*U*4*g),C=new _y(E,I,U,g);C.type=Ma,C.needsUpdate=!0;const W=L*4;for(let K=0;K<g;K++){const J=M[K],ut=N[K],V=P[K],st=I*U*4*K;for(let k=0;k<J.count;k++){const Y=k*W;b===!0&&(l.fromBufferAttribute(J,k),E[st+Y+0]=l.x,E[st+Y+1]=l.y,E[st+Y+2]=l.z,E[st+Y+3]=0),A===!0&&(l.fromBufferAttribute(ut,k),E[st+Y+4]=l.x,E[st+Y+5]=l.y,E[st+Y+6]=l.z,E[st+Y+7]=0),y===!0&&(l.fromBufferAttribute(V,k),E[st+Y+8]=l.x,E[st+Y+9]=l.y,E[st+Y+10]=l.z,E[st+Y+11]=V.itemSize===4?l.w:1)}}_={count:g,texture:C,size:new te(I,U)},s.set(d,_),d.addEventListener("dispose",H)}if(h.isInstancedMesh===!0&&h.morphTexture!==null)m.getUniforms().setValue(o,"morphTexture",h.morphTexture,i);else{let b=0;for(let y=0;y<p.length;y++)b+=p[y];const A=d.morphTargetsRelative?1:1-b;m.getUniforms().setValue(o,"morphTargetBaseInfluence",A),m.getUniforms().setValue(o,"morphTargetInfluences",p)}m.getUniforms().setValue(o,"morphTargetsTexture",_.texture,i),m.getUniforms().setValue(o,"morphTargetsTextureSize",_.size)}return{update:u}}function yw(o,t,i,s,l){let u=new WeakMap;function h(p){const S=l.render.frame,g=p.geometry,_=t.get(p,g);if(u.get(_)!==S&&(t.update(_),u.set(_,S)),p.isInstancedMesh&&(p.hasEventListener("dispose",m)===!1&&p.addEventListener("dispose",m),u.get(p)!==S&&(i.update(p.instanceMatrix,o.ARRAY_BUFFER),p.instanceColor!==null&&i.update(p.instanceColor,o.ARRAY_BUFFER),u.set(p,S))),p.isSkinnedMesh){const x=p.skeleton;u.get(x)!==S&&(x.update(),u.set(x,S))}return _}function d(){u=new WeakMap}function m(p){const S=p.target;S.removeEventListener("dispose",m),s.releaseStatesOfObject(S),i.remove(S.instanceMatrix),S.instanceColor!==null&&i.remove(S.instanceColor)}return{update:h,dispose:d}}const Mw={[QS]:"LINEAR_TONE_MAPPING",[JS]:"REINHARD_TONE_MAPPING",[$S]:"CINEON_TONE_MAPPING",[ty]:"ACES_FILMIC_TONE_MAPPING",[ny]:"AGX_TONE_MAPPING",[iy]:"NEUTRAL_TONE_MAPPING",[ey]:"CUSTOM_TONE_MAPPING"};function Ew(o,t,i,s,l,u){const h=new Ga(t,i,{type:o,depthBuffer:l,stencilBuffer:u,samples:s?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let d=null,m=null,p=null;const S=new In;S.setAttribute("position",new We([-1,3,0,-1,-1,0,3,-1,0],3)),S.setAttribute("uv",new We([0,2,0,0,2,0],2));const g=new c1({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),_=new Ce(S,g),x=new Dy(-1,1,1,-1,0,1);let b=null,A=null,y=!1,M,N=null,P=[],L=!1;this.setSize=function(I,U){h.setSize(I,U),d!==null&&d.setSize(I,U),m!==null&&m.setSize(I,U);for(let E=0;E<P.length;E++){const C=P[E];C.setSize&&C.setSize(I,U)}},this.setEffects=function(I){P=I,L=P.length>0&&P[0].isRenderPass===!0;const U=h.width,E=h.height;P.length>0&&d===null&&(d=new Ga(U,E,{type:Xa,depthBuffer:!1,stencilBuffer:!1}),m=new Ga(U,E,{type:Xa,depthBuffer:!1,stencilBuffer:!1}));const C=l===!0&&P.some(W=>W.needsDepthTexture===!0);C!==(h.depthTexture!==null)&&(C===!0&&p===null&&(p=new Qo(U,E),u===!0&&(p.format=tr,p.type=Ko)),h.dispose(),h.depthTexture=C?p:null,h.resolveDepthBuffer=C,h.storeMultisampledDepthBuffer=C);for(let W=0;W<P.length;W++){const H=P[W];H.setSize&&H.setSize(U,E),C&&H.needsDepthTexture===!0&&H.setDepthTexture&&H.setDepthTexture(p)}},this.begin=function(I,U){if(y||I.toneMapping===ds&&P.length===0)return!1;if(N=U,U!==null){const E=U.width,C=U.height;(h.width!==E||h.height!==C)&&this.setSize(E,C)}return L===!1&&I.setRenderTarget(h),M=I.toneMapping,I.toneMapping=ds,!0},this.hasRenderPass=function(){return L},this.end=function(I,U){I.toneMapping=M,y=!0;let E=h,C=d;for(let W=0;W<P.length;W++){const H=P[W];H.enabled!==!1&&(H.render(I,C,E,U),H.needsSwap!==!1&&(E=C,C=C===d?m:d))}if(b!==I.outputColorSpace||A!==I.toneMapping){b=I.outputColorSpace,A=I.toneMapping,g.defines={},Qe.getTransfer(b)===hn&&(g.defines.SRGB_TRANSFER="");const W=Mw[A];W&&(g.defines[W]=""),g.needsUpdate=!0}g.uniforms.tDiffuse.value=E.texture,I.setRenderTarget(N),I.render(_,x),N=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){h.dispose(),d!==null&&d.dispose(),m!==null&&m.dispose(),S.dispose(),g.dispose()}}const Iy=new _i,zy=new Qo(1,1),By=new Ty(1),Fy=new _y,Hy=new MT,Gy=new by,ES=[],bS=[],TS=new Float32Array(16),AS=new Float32Array(9),RS=new Float32Array(4);function el(o,t,i){const s=o[0];if(s<=0||s>0)return o;const l=t*i;let u=ES[l];if(u===void 0&&(u=new Float32Array(l),ES[l]=u),t!==0){s.toArray(u,0);for(let h=1,d=0;h!==t;++h)d+=i,o[h].toArray(u,d)}return u}function jn(o,t){if(o.length!==t.length)return!1;for(let i=0,s=o.length;i<s;i++)if(o[i]!==t[i])return!1;return!0}function Qn(o,t){for(let i=0,s=t.length;i<s;i++)o[i]=t[i]}function kf(o,t){let i=bS[t];i===void 0&&(i=new Int32Array(t),bS[t]=i);for(let s=0;s!==t;++s)i[s]=o.allocateTextureUnit();return i}function bw(o,t){const i=this.cache;i[0]!==t&&(o.uniform1f(this.addr,t),i[0]=t)}function Tw(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(o.uniform2f(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(jn(i,t))return;o.uniform2fv(this.addr,t),Qn(i,t)}}function Aw(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(o.uniform3f(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else if(t.r!==void 0)(i[0]!==t.r||i[1]!==t.g||i[2]!==t.b)&&(o.uniform3f(this.addr,t.r,t.g,t.b),i[0]=t.r,i[1]=t.g,i[2]=t.b);else{if(jn(i,t))return;o.uniform3fv(this.addr,t),Qn(i,t)}}function Rw(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(o.uniform4f(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(jn(i,t))return;o.uniform4fv(this.addr,t),Qn(i,t)}}function ww(o,t){const i=this.cache,s=t.elements;if(s===void 0){if(jn(i,t))return;o.uniformMatrix2fv(this.addr,!1,t),Qn(i,t)}else{if(jn(i,s))return;RS.set(s),o.uniformMatrix2fv(this.addr,!1,RS),Qn(i,s)}}function Cw(o,t){const i=this.cache,s=t.elements;if(s===void 0){if(jn(i,t))return;o.uniformMatrix3fv(this.addr,!1,t),Qn(i,t)}else{if(jn(i,s))return;AS.set(s),o.uniformMatrix3fv(this.addr,!1,AS),Qn(i,s)}}function Nw(o,t){const i=this.cache,s=t.elements;if(s===void 0){if(jn(i,t))return;o.uniformMatrix4fv(this.addr,!1,t),Qn(i,t)}else{if(jn(i,s))return;TS.set(s),o.uniformMatrix4fv(this.addr,!1,TS),Qn(i,s)}}function Dw(o,t){const i=this.cache;i[0]!==t&&(o.uniform1i(this.addr,t),i[0]=t)}function Lw(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(o.uniform2i(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(jn(i,t))return;o.uniform2iv(this.addr,t),Qn(i,t)}}function Uw(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(o.uniform3i(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(jn(i,t))return;o.uniform3iv(this.addr,t),Qn(i,t)}}function Ow(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(o.uniform4i(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(jn(i,t))return;o.uniform4iv(this.addr,t),Qn(i,t)}}function Pw(o,t){const i=this.cache;i[0]!==t&&(o.uniform1ui(this.addr,t),i[0]=t)}function Iw(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(o.uniform2ui(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(jn(i,t))return;o.uniform2uiv(this.addr,t),Qn(i,t)}}function zw(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(o.uniform3ui(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(jn(i,t))return;o.uniform3uiv(this.addr,t),Qn(i,t)}}function Bw(o,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(o.uniform4ui(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(jn(i,t))return;o.uniform4uiv(this.addr,t),Qn(i,t)}}function qf(o){return o.version===0&&(o.compareFunction=dy,o.needsUpdate=!0),o}function Fw(o,t,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(o.uniform1i(this.addr,l),s[0]=l);let u;this.type===o.SAMPLER_2D_SHADOW?u=qf(zy):u=Iy,i.setTexture2D(t||u,l)}function Hw(o,t,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(o.uniform1i(this.addr,l),s[0]=l),i.setTexture3D(t||Hy,l)}function Gw(o,t,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(o.uniform1i(this.addr,l),s[0]=l);let u;this.type===o.SAMPLER_CUBE_SHADOW?u=qf(By):u=Gy,i.setTextureCube(t||u,l)}function Vw(o,t,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(o.uniform1i(this.addr,l),s[0]=l),i.setTexture2DArray(t||Fy,l)}function Xw(o){switch(o){case 5126:return bw;case 35664:return Tw;case 35665:return Aw;case 35666:return Rw;case 35674:return ww;case 35675:return Cw;case 35676:return Nw;case 5124:case 35670:return Dw;case 35667:case 35671:return Lw;case 35668:case 35672:return Uw;case 35669:case 35673:return Ow;case 5125:return Pw;case 36294:return Iw;case 36295:return zw;case 36296:return Bw;case 35678:case 36198:case 36298:case 36306:case 35682:return Fw;case 35679:case 36299:case 36307:return Hw;case 35680:case 36300:case 36308:case 36293:return Gw;case 36289:case 36303:case 36311:case 36292:return Vw}}function kw(o,t){o.uniform1fv(this.addr,t)}function qw(o,t){const i=el(t,this.size,2);o.uniform2fv(this.addr,i)}function Ww(o,t){const i=el(t,this.size,3);o.uniform3fv(this.addr,i)}function Yw(o,t){const i=el(t,this.size,4);o.uniform4fv(this.addr,i)}function Zw(o,t){const i=el(t,this.size,4);o.uniformMatrix2fv(this.addr,!1,i)}function Kw(o,t){const i=el(t,this.size,9);o.uniformMatrix3fv(this.addr,!1,i)}function jw(o,t){const i=el(t,this.size,16);o.uniformMatrix4fv(this.addr,!1,i)}function Qw(o,t){o.uniform1iv(this.addr,t)}function Jw(o,t){o.uniform2iv(this.addr,t)}function $w(o,t){o.uniform3iv(this.addr,t)}function tC(o,t){o.uniform4iv(this.addr,t)}function eC(o,t){o.uniform1uiv(this.addr,t)}function nC(o,t){o.uniform2uiv(this.addr,t)}function iC(o,t){o.uniform3uiv(this.addr,t)}function aC(o,t){o.uniform4uiv(this.addr,t)}function sC(o,t,i){const s=this.cache,l=t.length,u=kf(i,l);jn(s,u)||(o.uniform1iv(this.addr,u),Qn(s,u));let h;this.type===o.SAMPLER_2D_SHADOW?h=qf(zy):h=Iy;for(let d=0;d!==l;++d)i.setTexture2D(t[d]||h,u[d])}function rC(o,t,i){const s=this.cache,l=t.length,u=kf(i,l);jn(s,u)||(o.uniform1iv(this.addr,u),Qn(s,u));for(let h=0;h!==l;++h)i.setTexture3D(t[h]||Hy,u[h])}function oC(o,t,i){const s=this.cache,l=t.length,u=kf(i,l);jn(s,u)||(o.uniform1iv(this.addr,u),Qn(s,u));let h;this.type===o.SAMPLER_CUBE_SHADOW?h=qf(By):h=Gy;for(let d=0;d!==l;++d)i.setTextureCube(t[d]||h,u[d])}function lC(o,t,i){const s=this.cache,l=t.length,u=kf(i,l);jn(s,u)||(o.uniform1iv(this.addr,u),Qn(s,u));for(let h=0;h!==l;++h)i.setTexture2DArray(t[h]||Fy,u[h])}function cC(o){switch(o){case 5126:return kw;case 35664:return qw;case 35665:return Ww;case 35666:return Yw;case 35674:return Zw;case 35675:return Kw;case 35676:return jw;case 5124:case 35670:return Qw;case 35667:case 35671:return Jw;case 35668:case 35672:return $w;case 35669:case 35673:return tC;case 5125:return eC;case 36294:return nC;case 36295:return iC;case 36296:return aC;case 35678:case 36198:case 36298:case 36306:case 35682:return sC;case 35679:case 36299:case 36307:return rC;case 35680:case 36300:case 36308:case 36293:return oC;case 36289:case 36303:case 36311:case 36292:return lC}}class uC{constructor(t,i,s){this.id=t,this.addr=s,this.cache=[],this.type=i.type,this.setValue=Xw(i.type)}}class fC{constructor(t,i,s){this.id=t,this.addr=s,this.cache=[],this.type=i.type,this.size=i.size,this.setValue=cC(i.type)}}class hC{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,i,s){const l=this.seq;for(let u=0,h=l.length;u!==h;++u){const d=l[u];d.setValue(t,i[d.id],s)}}}const Qp=/(\w+)(\])?(\[|\.)?/g;function wS(o,t){o.seq.push(t),o.map[t.id]=t}function dC(o,t,i){const s=o.name,l=s.length;for(Qp.lastIndex=0;;){const u=Qp.exec(s),h=Qp.lastIndex;let d=u[1];const m=u[2]==="]",p=u[3];if(m&&(d=d|0),p===void 0||p==="["&&h+2===l){wS(i,p===void 0?new uC(d,o,t):new fC(d,o,t));break}else{let g=i.map[d];g===void 0&&(g=new hC(d),wS(i,g)),i=g}}}class Rf{constructor(t,i){this.seq=[],this.map={};const s=t.getProgramParameter(i,t.ACTIVE_UNIFORMS);for(let h=0;h<s;++h){const d=t.getActiveUniform(i,h),m=t.getUniformLocation(i,d.name);dC(d,m,this)}const l=[],u=[];for(const h of this.seq)h.type===t.SAMPLER_2D_SHADOW||h.type===t.SAMPLER_CUBE_SHADOW||h.type===t.SAMPLER_2D_ARRAY_SHADOW?l.push(h):u.push(h);l.length>0&&(this.seq=l.concat(u))}setValue(t,i,s,l){const u=this.map[i];u!==void 0&&u.setValue(t,s,l)}setOptional(t,i,s){const l=i[s];l!==void 0&&this.setValue(t,s,l)}static upload(t,i,s,l){for(let u=0,h=i.length;u!==h;++u){const d=i[u],m=s[d.id];m.needsUpdate!==!1&&d.setValue(t,m.value,l)}}static seqWithValue(t,i){const s=[];for(let l=0,u=t.length;l!==u;++l){const h=t[l];h.id in i&&s.push(h)}return s}}function CS(o,t,i){const s=o.createShader(t);return o.shaderSource(s,i),o.compileShader(s),s}const pC=37297;let mC=0;function gC(o,t){const i=o.split(`
`),s=[],l=Math.max(t-6,0),u=Math.min(t+6,i.length);for(let h=l;h<u;h++){const d=h+1;s.push(`${d===t?">":" "} ${d}: ${i[h]}`)}return s.join(`
`)}const NS=new Ae;function vC(o){Qe._getMatrix(NS,Qe.workingColorSpace,o);const t=`mat3( ${NS.elements.map(i=>i.toFixed(4))} )`;switch(Qe.getTransfer(o)){case Lf:return[t,"LinearTransferOETF"];case hn:return[t,"sRGBTransferOETF"];default:return _e("WebGLProgram: Unsupported color space: ",o),[t,"LinearTransferOETF"]}}function DS(o,t,i){const s=o.getShaderParameter(t,o.COMPILE_STATUS),u=(o.getShaderInfoLog(t)||"").trim();if(s&&u==="")return"";const h=/ERROR: 0:(\d+)/.exec(u);if(h){const d=parseInt(h[1]);return i.toUpperCase()+`

`+u+`

`+gC(o.getShaderSource(t),d)}else return u}function _C(o,t){const i=vC(t);return[`vec4 ${o}( vec4 value ) {`,`	return ${i[1]}( vec4( ${i[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const xC={[QS]:"Linear",[JS]:"Reinhard",[$S]:"Cineon",[ty]:"ACESFilmic",[ny]:"AgX",[iy]:"Neutral",[ey]:"Custom"};function SC(o,t){const i=xC[t];return i===void 0?(_e("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+o+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+o+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}const xf=new Z;function yC(){Qe.getLuminanceCoefficients(xf);const o=xf.x.toFixed(4),t=xf.y.toFixed(4),i=xf.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${o}, ${t}, ${i} );`,"	return dot( weights, rgb );","}"].join(`
`)}function MC(o){return[o.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",o.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(fc).join(`
`)}function EC(o){const t=[];for(const i in o){const s=o[i];s!==!1&&t.push("#define "+i+" "+s)}return t.join(`
`)}function bC(o,t){const i={},s=o.getProgramParameter(t,o.ACTIVE_ATTRIBUTES);for(let l=0;l<s;l++){const u=o.getActiveAttrib(t,l),h=u.name;let d=1;u.type===o.FLOAT_MAT2&&(d=2),u.type===o.FLOAT_MAT3&&(d=3),u.type===o.FLOAT_MAT4&&(d=4),i[h]={type:u.type,location:o.getAttribLocation(t,h),locationSize:d}}return i}function fc(o){return o!==""}function LS(o,t){const i=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return o.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function US(o,t){return o.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const TC=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ym(o){return o.replace(TC,AC)}function AC(o,t){const i=Oe[t];if(i===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return Ym(i)}const RC=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function OS(o){return o.replace(RC,wC)}function wC(o,t,i,s){let l="";for(let u=parseInt(t);u<parseInt(i);u++)l+=s.replace(/\[\s*i\s*\]/g,"[ "+u+" ]").replace(/UNROLLED_LOOP_INDEX/g,u);return l}function PS(o){let t=`precision ${o.precision} float;
	precision ${o.precision} int;
	precision ${o.precision} sampler2D;
	precision ${o.precision} samplerCube;
	precision ${o.precision} sampler3D;
	precision ${o.precision} sampler2DArray;
	precision ${o.precision} sampler2DShadow;
	precision ${o.precision} samplerCubeShadow;
	precision ${o.precision} sampler2DArrayShadow;
	precision ${o.precision} isampler2D;
	precision ${o.precision} isampler3D;
	precision ${o.precision} isamplerCube;
	precision ${o.precision} isampler2DArray;
	precision ${o.precision} usampler2D;
	precision ${o.precision} usampler3D;
	precision ${o.precision} usamplerCube;
	precision ${o.precision} usampler2DArray;
	`;return o.precision==="highp"?t+=`
#define HIGH_PRECISION`:o.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:o.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}const CC={[yf]:"SHADOWMAP_TYPE_PCF",[uc]:"SHADOWMAP_TYPE_VSM"};function NC(o){return CC[o.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const DC={[_c]:"ENVMAP_MODE_REFRACTION"};function LC(o){return o.envMap===!1?"ENVMAP_MODE_REFLECTION":DC[o.envMapMode]||"ENVMAP_MODE_REFLECTION"}const UC={[jS]:"ENVMAP_BLENDING_MULTIPLY",[tT]:"ENVMAP_BLENDING_MIX",[eT]:"ENVMAP_BLENDING_ADD"};function OC(o){return o.envMap===!1?"ENVMAP_BLENDING_NONE":UC[o.combine]||"ENVMAP_BLENDING_NONE"}function PC(o,t,i,s){const l=o.getContext(),u=i.defines;let h=i.vertexShader,d=i.fragmentShader;const m=NC(i),p=i.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",S=LC(i),g=OC(i),_=MC(i),x=EC(u),b=l.createProgram();let A,y,M=i.glslVersion?"#version "+i.glslVersion+`
`:"";i.isRawShaderMaterial?(A=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,x].filter(fc).join(`
`),A.length>0&&(A+=`
`),y=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,x].filter(fc).join(`
`),y.length>0&&(y+=`
`)):(A=[PS(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,x,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+S:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+i.diffuseRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexNormals?"#define HAS_NORMAL":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+m:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(fc).join(`
`),y=[PS(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,x,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+p:"",i.envMap?"#define "+S:"",i.envMap?"#define "+g:"",i.envMapPMREM?"#define ENVMAP_MAX_LOD "+i.envMapMaxLod+".0":"",i.envMapPMREM?"#define ENVMAP_SIZE "+i.envMapSize+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",i.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.retroreflection?"#define USE_RETROREFLECTION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor?"#define USE_COLOR":"",i.vertexAlphas||i.batchingColor?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+m:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==ds?"#define TONE_MAPPING":"",i.toneMapping!==ds?Oe.tonemapping_pars_fragment:"",i.toneMapping!==ds?SC("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",Oe.colorspace_pars_fragment,_C("linearToOutputTexel",i.outputColorSpace),yC(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(fc).join(`
`)),h=Ym(h),h=LS(h,i),h=US(h,i),d=Ym(d),d=LS(d,i),d=US(d,i),h=OS(h),d=OS(d),i.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,A=[_,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+A,y=["#define varying in",i.glslVersion===Lx?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===Lx?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);const N=M+A+h,P=M+y+d,L=CS(l,l.VERTEX_SHADER,N),I=CS(l,l.FRAGMENT_SHADER,P);l.attachShader(b,L),l.attachShader(b,I),i.index0AttributeName!==void 0?l.bindAttribLocation(b,0,i.index0AttributeName):i.hasPositionAttribute===!0&&l.bindAttribLocation(b,0,"position"),l.linkProgram(b);function U(H){if(o.debug.checkShaderErrors){const K=l.getProgramInfoLog(b)||"",J=l.getShaderInfoLog(L)||"",ut=l.getShaderInfoLog(I)||"",V=K.trim(),st=J.trim(),k=ut.trim();let Y=!0,dt=!0;if(l.getProgramParameter(b,l.LINK_STATUS)===!1)if(Y=!1,typeof o.debug.onShaderError=="function")o.debug.onShaderError(l,b,L,I);else{const ot=DS(l,L,"vertex"),ht=DS(l,I,"fragment");en("WebGLProgram: Shader Error "+l.getError()+" - VALIDATE_STATUS "+l.getProgramParameter(b,l.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+V+`
`+ot+`
`+ht)}else V!==""?_e("WebGLProgram: Program Info Log:",V):(st===""||k==="")&&(dt=!1);dt&&(H.diagnostics={runnable:Y,programLog:V,vertexShader:{log:st,prefix:A},fragmentShader:{log:k,prefix:y}})}l.deleteShader(L),l.deleteShader(I),E=new Rf(l,b),C=bC(l,b)}let E;this.getUniforms=function(){return E===void 0&&U(this),E};let C;this.getAttributes=function(){return C===void 0&&U(this),C};let W=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return W===!1&&(W=l.getProgramParameter(b,pC)),W},this.destroy=function(){s.releaseStatesOfProgram(this),l.deleteProgram(b),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=mC++,this.cacheKey=t,this.usedTimes=1,this.program=b,this.vertexShader=L,this.fragmentShader=I,this}let IC=0;class zC{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,i,s){const l=this._getShaderCacheForMaterial(t);return l.has(i)===!1&&(l.add(i),i.usedTimes++),l.has(s)===!1&&(l.add(s),s.usedTimes++),this}remove(t){const i=this.materialCache.get(t);for(const s of i)s.usedTimes--,s.usedTimes===0&&this.shaderCache.delete(s.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const i=this.materialCache;let s=i.get(t);return s===void 0&&(s=new Set,i.set(t,s)),s}_getShaderStage(t){const i=this.shaderCache;let s=i.get(t);return s===void 0&&(s=new BC(t),i.set(t,s)),s}}class BC{constructor(t){this.id=IC++,this.code=t,this.usedTimes=0}}function FC(o){return o===Nr||o===Cf||o===Nf}function HC(o,t,i,s,l,u){const h=new o0,d=new zC,m=new Set,p=[],S=new Map,g=s.logarithmicDepthBuffer,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(E){return m.add(E),E===0?"uv":`uv${E}`}function b(E,C,W,H,K,J){const ut=H.fog,V=K.geometry,st=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?H.environment:null,k=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap,Y=t.get(E.envMap||st,k),dt=_[E.type];let ot=s.precision;E.precision!==null&&(ot=s.getMaxPrecision(E.precision),ot!==E.precision&&_e("WebGLProgram.getParameters:",E.precision,"not supported, using",ot,"instead."));const ht=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Tt=ht!==void 0?ht.length:0;let Vt=0;V.morphAttributes.position!==void 0&&(Vt=1),V.morphAttributes.normal!==void 0&&(Vt=2),V.morphAttributes.color!==void 0&&(Vt=3);let ae,D,$,xt;if(dt){const Pt=Fa[dt];ae=Pt.vertexShader,D=Pt.fragmentShader}else{ae=E.vertexShader,D=E.fragmentShader;const Pt=d.getVertexShaderStage(E),Ze=d.getFragmentShaderStage(E);d.update(E,Pt,Ze),$=Pt.id,xt=Ze.id}const At=o.getRenderTarget(),Ct=o.state.buffers.depth.getReversed(),qt=K.isInstancedMesh===!0,le=K.isBatchedMesh===!0,wt=!!E.map,Wt=!!E.matcap,de=!!Y,Me=de&&Y.isPMREMTexture===!0,Ge=!!E.aoMap,Pe=!!E.lightMap,ze=!!E.bumpMap&&E.wireframe===!1,re=!!E.normalMap,gn=!!E.displacementMap,Ne=!!E.emissiveMap,vn=!!E.metalnessMap,Cn=!!E.roughnessMap,An=E.anisotropy>0,j=E.clearcoat>0,_n=E.diffuseRoughness>0,Ye=E.dispersion>0,Ue=E.retroreflectivity>0,Ht=E.iridescence>0,Be=E.sheen>0,se=E.transmission>0,ie=An&&!!E.anisotropyMap,O=j&&!!E.clearcoatMap,R=j&&!!E.clearcoatNormalMap,it=j&&!!E.clearcoatRoughnessMap,Nt=_n&&!!E.diffuseRoughnessMap,yt=Ht&&!!E.iridescenceMap,zt=Ht&&!!E.iridescenceThicknessMap,Bt=Be&&!!E.sheenColorMap,mt=Be&&!!E.sheenRoughnessMap,_t=!!E.specularMap,Ot=!!E.specularColorMap,F=!!E.specularIntensityMap,vt=se&&!!E.transmissionMap,gt=se&&!!E.thicknessMap,Ft=!!E.gradientMap,X=!!E.alphaMap,pt=E.alphaTest>0,Rt=!!E.alphaHash,Xt=!!E.extensions;let bt=ds;E.toneMapped&&(At===null||At.isXRRenderTarget===!0)&&(bt=o.toneMapping);const Zt=Me?Y.isCompressedCubeTexture?Y.image[0].mipmaps:Y.mipmaps:null,oe={shaderID:dt,shaderType:E.type,shaderName:E.name,vertexShader:ae,fragmentShader:D,defines:E.defines,customVertexShaderID:$,customFragmentShaderID:xt,isRawShaderMaterial:E.isRawShaderMaterial===!0,glslVersion:E.glslVersion,precision:ot,batching:le,batchingColor:le&&K._colorsTexture!==null,instancing:qt,instancingColor:qt&&K.instanceColor!==null,instancingMorph:qt&&K.morphTexture!==null,outputColorSpace:At===null?o.outputColorSpace:At.isXRRenderTarget===!0?At.texture.colorSpace:Qe.workingColorSpace,alphaToCoverage:!!E.alphaToCoverage,map:wt,matcap:Wt,envMap:de,envMapMode:de&&Y.mapping,envMapPMREM:Me,envMapMaxLod:Me?Zt.length-1:null,envMapSize:Me?Zt[0].width:null,aoMap:Ge,lightMap:Pe,bumpMap:ze,normalMap:re,displacementMap:gn,emissiveMap:Ne,normalMapObjectSpace:re&&E.normalMapType===aT,normalMapTangentSpace:re&&E.normalMapType===Hm,packedNormalMap:re&&E.normalMapType===Hm&&FC(E.normalMap.format),metalnessMap:vn,roughnessMap:Cn,anisotropy:An,anisotropyMap:ie,clearcoat:j,clearcoatMap:O,clearcoatNormalMap:R,clearcoatRoughnessMap:it,diffuseRoughness:_n,diffuseRoughnessMap:Nt,dispersion:Ye,retroreflection:Ue,iridescence:Ht,iridescenceMap:yt,iridescenceThicknessMap:zt,sheen:Be,sheenColorMap:Bt,sheenRoughnessMap:mt,specularMap:_t,specularColorMap:Ot,specularIntensityMap:F,transmission:se,transmissionMap:vt,thicknessMap:gt,gradientMap:Ft,opaque:E.transparent===!1&&E.blending===hc&&E.alphaToCoverage===!1,alphaMap:X,alphaTest:pt,alphaHash:Rt,combine:E.combine,mapUv:wt&&x(E.map.channel),aoMapUv:Ge&&x(E.aoMap.channel),lightMapUv:Pe&&x(E.lightMap.channel),bumpMapUv:ze&&x(E.bumpMap.channel),normalMapUv:re&&x(E.normalMap.channel),displacementMapUv:gn&&x(E.displacementMap.channel),emissiveMapUv:Ne&&x(E.emissiveMap.channel),metalnessMapUv:vn&&x(E.metalnessMap.channel),roughnessMapUv:Cn&&x(E.roughnessMap.channel),anisotropyMapUv:ie&&x(E.anisotropyMap.channel),clearcoatMapUv:O&&x(E.clearcoatMap.channel),clearcoatNormalMapUv:R&&x(E.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:it&&x(E.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:Nt&&x(E.diffuseRoughnessMap.channel),iridescenceMapUv:yt&&x(E.iridescenceMap.channel),iridescenceThicknessMapUv:zt&&x(E.iridescenceThicknessMap.channel),sheenColorMapUv:Bt&&x(E.sheenColorMap.channel),sheenRoughnessMapUv:mt&&x(E.sheenRoughnessMap.channel),specularMapUv:_t&&x(E.specularMap.channel),specularColorMapUv:Ot&&x(E.specularColorMap.channel),specularIntensityMapUv:F&&x(E.specularIntensityMap.channel),transmissionMapUv:vt&&x(E.transmissionMap.channel),thicknessMapUv:gt&&x(E.thicknessMap.channel),alphaMapUv:X&&x(E.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(re||An),vertexNormals:!!V.attributes.normal,vertexColors:E.vertexColors,vertexAlphas:E.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:K.isPoints===!0&&!!V.attributes.uv&&(wt||X),fog:!!ut,useFog:E.fog===!0,fogExp2:!!ut&&ut.isFogExp2,flatShading:E.wireframe===!1&&(E.flatShading===!0||V.attributes.normal===void 0&&re===!1&&(E.isMeshLambertMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isMeshPhysicalMaterial)),sizeAttenuation:E.sizeAttenuation===!0,logarithmicDepthBuffer:g,reversedDepthBuffer:Ct,skinning:K.isSkinnedMesh===!0,hasPositionAttribute:V.attributes.position!==void 0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Tt,morphTextureStride:Vt,numSunLights:C.sun.length,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numSunLightShadows:C.sunShadowMap.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numLightProbeGrids:J.filter(Pt=>Pt.texture!==null).length,numClippingPlanes:u.numPlanes,numClipIntersection:u.numIntersection,dithering:E.dithering,shadowMapEnabled:o.shadowMap.enabled&&W.length>0,shadowMapType:o.shadowMap.type,toneMapping:bt,decodeVideoTexture:wt&&E.map.isVideoTexture===!0&&Qe.getTransfer(E.map.colorSpace)===hn,decodeVideoTextureEmissive:Ne&&E.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(E.emissiveMap.colorSpace)===hn,premultipliedAlpha:E.premultipliedAlpha,doubleSided:E.side===Pi,flipSided:E.side===zi,useDepthPacking:E.depthPacking>=0,depthPacking:E.depthPacking||0,index0AttributeName:E.index0AttributeName,extensionClipCullDistance:Xt&&E.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Xt&&E.extensions.multiDraw===!0||le)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:E.customProgramCacheKey()};return oe.vertexUv1s=m.has(1),oe.vertexUv2s=m.has(2),oe.vertexUv3s=m.has(3),m.clear(),oe}function A(E){const C=[];if(E.shaderID?C.push(E.shaderID):(C.push(E.customVertexShaderID),C.push(E.customFragmentShaderID)),E.defines!==void 0)for(const W in E.defines)C.push(W),C.push(E.defines[W]);return E.isRawShaderMaterial===!1&&(y(C,E),M(C,E),C.push(o.outputColorSpace)),C.push(E.customProgramCacheKey),C.join()}function y(E,C){E.push(C.precision),E.push(C.outputColorSpace),E.push(C.envMapMode),E.push(C.envMapPMREM),E.push(C.envMapMaxLod),E.push(C.envMapSize),E.push(C.mapUv),E.push(C.alphaMapUv),E.push(C.lightMapUv),E.push(C.aoMapUv),E.push(C.bumpMapUv),E.push(C.normalMapUv),E.push(C.displacementMapUv),E.push(C.emissiveMapUv),E.push(C.metalnessMapUv),E.push(C.roughnessMapUv),E.push(C.anisotropyMapUv),E.push(C.clearcoatMapUv),E.push(C.clearcoatNormalMapUv),E.push(C.clearcoatRoughnessMapUv),E.push(C.diffuseRoughnessMapUv),E.push(C.iridescenceMapUv),E.push(C.iridescenceThicknessMapUv),E.push(C.sheenColorMapUv),E.push(C.sheenRoughnessMapUv),E.push(C.specularMapUv),E.push(C.specularColorMapUv),E.push(C.specularIntensityMapUv),E.push(C.transmissionMapUv),E.push(C.thicknessMapUv),E.push(C.combine),E.push(C.fogExp2),E.push(C.sizeAttenuation),E.push(C.morphTargetsCount),E.push(C.numSunLights),E.push(C.numDirLights),E.push(C.numPointLights),E.push(C.numSpotLights),E.push(C.numSpotLightMaps),E.push(C.numHemiLights),E.push(C.numRectAreaLights),E.push(C.numSunLightShadows),E.push(C.numDirLightShadows),E.push(C.numPointLightShadows),E.push(C.numSpotLightShadows),E.push(C.numSpotLightShadowsWithMaps),E.push(C.numLightProbes),E.push(C.numLightProbeGrids),E.push(C.shadowMapType),E.push(C.toneMapping),E.push(C.numClippingPlanes),E.push(C.numClipIntersection),E.push(C.depthPacking)}function M(E,C){h.disableAll(),C.instancing&&h.enable(0),C.instancingColor&&h.enable(1),C.instancingMorph&&h.enable(2),C.matcap&&h.enable(3),C.envMap&&h.enable(4),C.normalMapObjectSpace&&h.enable(5),C.normalMapTangentSpace&&h.enable(6),C.clearcoat&&h.enable(7),C.iridescence&&h.enable(8),C.alphaTest&&h.enable(9),C.vertexColors&&h.enable(10),C.vertexAlphas&&h.enable(11),C.vertexUv1s&&h.enable(12),C.vertexUv2s&&h.enable(13),C.vertexUv3s&&h.enable(14),C.vertexTangents&&h.enable(15),C.anisotropy&&h.enable(16),C.alphaHash&&h.enable(17),C.batching&&h.enable(18),C.dispersion&&h.enable(19),C.retroreflection&&h.enable(24),C.diffuseRoughness&&h.enable(25),C.batchingColor&&h.enable(20),C.gradientMap&&h.enable(21),C.packedNormalMap&&h.enable(22),C.vertexNormals&&h.enable(23),E.push(h.mask),h.disableAll(),C.fog&&h.enable(0),C.useFog&&h.enable(1),C.flatShading&&h.enable(2),C.logarithmicDepthBuffer&&h.enable(3),C.reversedDepthBuffer&&h.enable(4),C.skinning&&h.enable(5),C.morphTargets&&h.enable(6),C.morphNormals&&h.enable(7),C.morphColors&&h.enable(8),C.premultipliedAlpha&&h.enable(9),C.shadowMapEnabled&&h.enable(10),C.doubleSided&&h.enable(11),C.flipSided&&h.enable(12),C.useDepthPacking&&h.enable(13),C.dithering&&h.enable(14),C.transmission&&h.enable(15),C.sheen&&h.enable(16),C.opaque&&h.enable(17),C.pointsUvs&&h.enable(18),C.decodeVideoTexture&&h.enable(19),C.decodeVideoTextureEmissive&&h.enable(20),C.alphaToCoverage&&h.enable(21),C.numLightProbeGrids>0&&h.enable(22),C.hasPositionAttribute&&h.enable(23),E.push(h.mask)}function N(E){const C=_[E.type];let W;if(C){const H=Fa[C];W=r1.clone(H.uniforms)}else W=E.uniforms;return W}function P(E,C){let W=S.get(C);return W!==void 0?++W.usedTimes:(W=new PC(o,C,E,l),p.push(W),S.set(C,W)),W}function L(E){if(--E.usedTimes===0){const C=p.indexOf(E);p[C]=p[p.length-1],p.pop(),S.delete(E.cacheKey),E.destroy()}}function I(E){d.remove(E)}function U(){d.dispose()}return{getParameters:b,getProgramCacheKey:A,getUniforms:N,acquireProgram:P,releaseProgram:L,releaseShaderCache:I,programs:p,dispose:U}}function GC(){let o=new WeakMap;function t(h){return o.has(h)}function i(h){let d=o.get(h);return d===void 0&&(d={},o.set(h,d)),d}function s(h){o.delete(h)}function l(h,d,m){o.get(h)[d]=m}function u(){o=new WeakMap}return{has:t,get:i,remove:s,update:l,dispose:u}}function VC(o,t){return o.groupOrder!==t.groupOrder?o.groupOrder-t.groupOrder:o.renderOrder!==t.renderOrder?o.renderOrder-t.renderOrder:o.material.id!==t.material.id?o.material.id-t.material.id:o.materialVariant!==t.materialVariant?o.materialVariant-t.materialVariant:o.z!==t.z?o.z-t.z:o.id-t.id}function IS(o,t){return o.groupOrder!==t.groupOrder?o.groupOrder-t.groupOrder:o.renderOrder!==t.renderOrder?o.renderOrder-t.renderOrder:o.z!==t.z?t.z-o.z:o.id-t.id}function zS(){const o=[];let t=0;const i=[],s=[],l=[];function u(){t=0,i.length=0,s.length=0,l.length=0}function h(_){let x=0;return _.isInstancedMesh&&(x+=2),_.isSkinnedMesh&&(x+=1),x}function d(_,x,b,A,y,M){let N=o[t];return N===void 0?(N={id:_.id,object:_,geometry:x,material:b,materialVariant:h(_),groupOrder:A,renderOrder:_.renderOrder,z:y,group:M},o[t]=N):(N.id=_.id,N.object=_,N.geometry=x,N.material=b,N.materialVariant=h(_),N.groupOrder=A,N.renderOrder=_.renderOrder,N.z=y,N.group=M),t++,N}function m(_,x,b,A,y,M,N){N.reversedDepth===!0&&(y=-y);const P=d(_,x,b,A,y,M);b.transmission>0?s.push(P):b.transparent===!0?l.push(P):i.push(P)}function p(_,x,b,A,y,M){const N=d(_,x,b,A,y,M);b.transmission>0?s.unshift(N):b.transparent===!0?l.unshift(N):i.unshift(N)}function S(_,x){i.length>1&&i.sort(_||VC),s.length>1&&s.sort(x||IS),l.length>1&&l.sort(x||IS)}function g(){for(let _=t,x=o.length;_<x;_++){const b=o[_];if(b.id===null)break;b.id=null,b.object=null,b.geometry=null,b.material=null,b.group=null}}return{opaque:i,transmissive:s,transparent:l,init:u,push:m,unshift:p,finish:g,sort:S}}function XC(){let o=new WeakMap;function t(s,l){const u=o.get(s);let h;return u===void 0?(h=new zS,o.set(s,[h])):l>=u.length?(h=new zS,u.push(h)):h=u[l],h}function i(){o=new WeakMap}return{get:t,dispose:i}}function kC(){const o={};return{get:function(t){if(o[t.id]!==void 0)return o[t.id];let i;switch(t.type){case"SunLight":case"DirectionalLight":i={direction:new Z,color:new he};break;case"SpotLight":i={position:new Z,direction:new Z,color:new he,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new Z,color:new he,distance:0,decay:0};break;case"HemisphereLight":i={direction:new Z,skyColor:new he,groundColor:new he};break;case"RectAreaLight":i={color:new he,position:new Z,halfWidth:new Z,halfHeight:new Z};break}return o[t.id]=i,i}}}function qC(){const o={};return{get:function(t){if(o[t.id]!==void 0)return o[t.id];let i;switch(t.type){case"SunLight":case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te,shadowCameraNear:1,shadowCameraFar:1e3};break}return o[t.id]=i,i}}}let WC=0;function YC(o,t){return(t.castShadow?2:0)-(o.castShadow?2:0)+(t.map?1:0)-(o.map?1:0)}function ZC(o){const t=new kC,i=qC(),s={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let p=0;p<9;p++)s.probe.push(new Z);const l=new Z,u=new sn,h=new sn;function d(p){let S=0,g=0,_=0;for(let J=0;J<9;J++)s.probe[J].set(0,0,0);let x=0,b=0,A=0,y=0,M=0,N=0,P=0,L=0,I=0,U=0,E=0,C=0,W=0,H=0;p.sort(YC);for(let J=0,ut=p.length;J<ut;J++){const V=p[J],st=V.color,k=V.intensity,Y=V.distance;let dt=null;if(V.shadow&&V.shadow.map&&(V.shadow.map.texture.format===Nr?dt=V.shadow.map.texture:dt=V.shadow.map.depthTexture||V.shadow.map.texture),V.isAmbientLight)S+=st.r*k,g+=st.g*k,_+=st.b*k;else if(V.isLightProbe){for(let ot=0;ot<9;ot++)s.probe[ot].addScaledVector(V.sh.coefficients[ot],k);H++}else if(V.isSunLight){const ot=t.get(V);if(ot.color.copy(V.color).multiplyScalar(V.intensity),V.castShadow){const ht=V.shadow,Tt=i.get(V);Tt.shadowIntensity=ht.intensity,Tt.shadowBias=ht.bias,Tt.shadowNormalBias=ht.normalBias,Tt.shadowRadius=ht.radius,Tt.shadowMapSize.copy(ht.mapSize).multiply(ht.getFrameExtents()),s.sunShadow[b]=Tt,s.sunShadowMap[b]=dt;const Vt=ht.getViewportCount();for(let ae=0;ae<Vt;ae++)s.sunShadowMatrix[A+ae]=ht.getMatrix(ae),s.sunShadowCascade[A+ae]=ht._cascadeData[ae];A+=Vt,b++}s.sun[x]=ot,x++}else if(V.isDirectionalLight){const ot=t.get(V);if(ot.color.copy(V.color).multiplyScalar(V.intensity),V.castShadow){const ht=V.shadow,Tt=i.get(V);Tt.shadowIntensity=ht.intensity,Tt.shadowBias=ht.bias,Tt.shadowNormalBias=ht.normalBias,Tt.shadowRadius=ht.radius,Tt.shadowMapSize=ht.mapSize,s.directionalShadow[y]=Tt,s.directionalShadowMap[y]=dt,s.directionalShadowMatrix[y]=V.shadow.matrix,I++}s.directional[y]=ot,y++}else if(V.isSpotLight){const ot=t.get(V);ot.position.setFromMatrixPosition(V.matrixWorld),ot.color.copy(st).multiplyScalar(k),ot.distance=Y,ot.coneCos=Math.cos(V.angle),ot.penumbraCos=Math.cos(V.angle*(1-V.penumbra)),ot.decay=V.decay,s.spot[N]=ot;const ht=V.shadow;if(V.map&&(s.spotLightMap[C]=V.map,C++,ht.updateMatrices(V),V.castShadow&&W++),s.spotLightMatrix[N]=ht.matrix,V.castShadow){const Tt=i.get(V);Tt.shadowIntensity=ht.intensity,Tt.shadowBias=ht.bias,Tt.shadowNormalBias=ht.normalBias,Tt.shadowRadius=ht.radius,Tt.shadowMapSize=ht.mapSize,s.spotShadow[N]=Tt,s.spotShadowMap[N]=dt,E++}N++}else if(V.isRectAreaLight){const ot=t.get(V);ot.color.copy(st).multiplyScalar(k),ot.halfWidth.set(V.width*.5,0,0),ot.halfHeight.set(0,V.height*.5,0),s.rectArea[P]=ot,P++}else if(V.isPointLight){const ot=t.get(V);if(ot.color.copy(V.color).multiplyScalar(V.intensity),ot.distance=V.distance,ot.decay=V.decay,V.castShadow){const ht=V.shadow,Tt=i.get(V);Tt.shadowIntensity=ht.intensity,Tt.shadowBias=ht.bias,Tt.shadowNormalBias=ht.normalBias,Tt.shadowRadius=ht.radius,Tt.shadowMapSize=ht.mapSize,Tt.shadowCameraNear=ht.camera.near,Tt.shadowCameraFar=ht.camera.far,s.pointShadow[M]=Tt,s.pointShadowMap[M]=dt,s.pointShadowMatrix[M]=V.shadow.matrix,U++}s.point[M]=ot,M++}else if(V.isHemisphereLight){const ot=t.get(V);ot.skyColor.copy(V.color).multiplyScalar(k),ot.groundColor.copy(V.groundColor).multiplyScalar(k),s.hemi[L]=ot,L++}}P>0&&(o.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=Kt.LTC_FLOAT_1,s.rectAreaLTC2=Kt.LTC_FLOAT_2):(s.rectAreaLTC1=Kt.LTC_HALF_1,s.rectAreaLTC2=Kt.LTC_HALF_2)),s.ambient[0]=S,s.ambient[1]=g,s.ambient[2]=_;const K=s.hash;(K.sunLength!==x||K.directionalLength!==y||K.pointLength!==M||K.spotLength!==N||K.rectAreaLength!==P||K.hemiLength!==L||K.numSunShadows!==b||K.numDirectionalShadows!==I||K.numPointShadows!==U||K.numSpotShadows!==E||K.numSpotMaps!==C||K.numLightProbes!==H)&&(s.sun.length=x,s.directional.length=y,s.spot.length=N,s.rectArea.length=P,s.point.length=M,s.hemi.length=L,s.sunShadow.length=b,s.sunShadowMap.length=b,s.sunShadowMatrix.length=A,s.sunShadowCascade.length=A,s.directionalShadow.length=I,s.directionalShadowMap.length=I,s.directionalShadowMatrix.length=I,s.pointShadow.length=U,s.pointShadowMap.length=U,s.pointShadowMatrix.length=U,s.spotShadow.length=E,s.spotShadowMap.length=E,s.spotLightMatrix.length=E+C-W,s.spotLightMap.length=C,s.numSpotLightShadowsWithMaps=W,s.numLightProbes=H,K.sunLength=x,K.directionalLength=y,K.pointLength=M,K.spotLength=N,K.rectAreaLength=P,K.hemiLength=L,K.numSunShadows=b,K.numDirectionalShadows=I,K.numPointShadows=U,K.numSpotShadows=E,K.numSpotMaps=C,K.numLightProbes=H,s.version=WC++)}function m(p,S){let g=0,_=0,x=0,b=0,A=0,y=0;const M=S.matrixWorldInverse;for(let N=0,P=p.length;N<P;N++){const L=p[N];if(L.isSunLight){const I=s.sun[g];I.direction.setFromMatrixPosition(L.matrixWorld),I.direction.transformDirection(M),g++}else if(L.isDirectionalLight){const I=s.directional[_];I.direction.setFromMatrixPosition(L.matrixWorld),l.setFromMatrixPosition(L.target.matrixWorld),I.direction.sub(l),I.direction.transformDirection(M),_++}else if(L.isSpotLight){const I=s.spot[b];I.position.setFromMatrixPosition(L.matrixWorld),I.position.applyMatrix4(M),I.direction.setFromMatrixPosition(L.matrixWorld),l.setFromMatrixPosition(L.target.matrixWorld),I.direction.sub(l),I.direction.transformDirection(M),b++}else if(L.isRectAreaLight){const I=s.rectArea[A];I.position.setFromMatrixPosition(L.matrixWorld),I.position.applyMatrix4(M),h.identity(),u.copy(L.matrixWorld),u.premultiply(M),h.extractRotation(u),I.halfWidth.set(L.width*.5,0,0),I.halfHeight.set(0,L.height*.5,0),I.halfWidth.applyMatrix4(h),I.halfHeight.applyMatrix4(h),A++}else if(L.isPointLight){const I=s.point[x];I.position.setFromMatrixPosition(L.matrixWorld),I.position.applyMatrix4(M),x++}else if(L.isHemisphereLight){const I=s.hemi[y];I.direction.setFromMatrixPosition(L.matrixWorld),I.direction.transformDirection(M),y++}}}return{setup:d,setupView:m,state:s}}function BS(o){const t=new ZC(o),i=[],s=[],l=[];function u(g){S.camera=g,i.length=0,s.length=0,l.length=0}function h(g){g.isLightProbeGrid?l.push(g):i.push(g)}function d(g){s.push(g)}function m(){t.setup(i),l.sort((g,_)=>g.priority-_.priority||g.id-_.id)}function p(g){t.setupView(i,g)}const S={lightsArray:i,shadowsArray:s,lightProbeGridArray:l,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:u,state:S,setupLights:m,setupLightsView:p,pushLight:h,pushShadow:d}}function KC(o){let t=new WeakMap;function i(l,u=0){const h=t.get(l);let d;return h===void 0?(d=new BS(o),t.set(l,[d])):u>=h.length?(d=new BS(o),h.push(d)):d=h[u],d}function s(){t=new WeakMap}return{get:i,dispose:s}}const jC=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,QC=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,JC=[new Z(1,0,0),new Z(-1,0,0),new Z(0,1,0),new Z(0,-1,0),new Z(0,0,1),new Z(0,0,-1)],$C=[new Z(0,-1,0),new Z(0,-1,0),new Z(0,0,1),new Z(0,0,-1),new Z(0,-1,0),new Z(0,-1,0)],FS=new sn,rc=new Z,Jp=new Z;function t3(o,t,i){let s=new Mc;const l=new te,u=new te,h=new Dn,d=new u1,m=new f1,p={},S=i.maxTextureSize,g={[Cr]:zi,[zi]:Cr,[Pi]:Pi},_=new Dr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new te},radius:{value:4}},vertexShader:jC,fragmentShader:QC}),x=_.clone();x.defines.HORIZONTAL_PASS=1;const b=new In;b.setAttribute("position",new ca(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const A=new Ce(b,_),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=yf;let M=this.type;this.render=function(U,E,C){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||U.length===0)return;this.type===Pb&&(_e("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=yf);const W=o.getRenderTarget(),H=o.getActiveCubeFace(),K=o.getActiveMipmapLevel(),J=o.state;J.setBlending(qo),J.buffers.depth.getReversed()===!0?J.buffers.color.setClear(0,0,0,0):J.buffers.color.setClear(1,1,1,1),J.buffers.depth.setTest(!0),J.setScissorTest(!1);const ut=M!==this.type;ut&&E.traverse(function(V){V.material&&(Array.isArray(V.material)?V.material.forEach(st=>st.needsUpdate=!0):V.material.needsUpdate=!0)});for(let V=0,st=U.length;V<st;V++){const k=U[V],Y=k.shadow;if(Y===void 0){_e("WebGLShadowMap:",k,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;l.copy(Y.mapSize);const dt=Y.getFrameExtents();l.multiply(dt),u.copy(Y.mapSize),(l.x>S||l.y>S)&&(l.x>S&&(u.x=Math.floor(S/dt.x),l.x=u.x*dt.x,Y.mapSize.x=u.x),l.y>S&&(u.y=Math.floor(S/dt.y),l.y=u.y*dt.y,Y.mapSize.y=u.y));const ot=o.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=ot,Y.map===null||ut===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===uc){if(k.isPointLight){_e("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new Ga(l.x,l.y,{format:Nr,type:Xa,minFilter:Ii,magFilter:Ii,generateMipmaps:!1}),Y.map.texture.name=k.name+".shadowMap",Y.map.depthTexture=new Qo(l.x,l.y,Ma),Y.map.depthTexture.name=k.name+".shadowMapDepth",Y.map.depthTexture.format=er,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=pi,Y.map.depthTexture.magFilter=pi}else k.isPointLight?(Y.map=new g0(l.x),Y.map.depthTexture=new Ty(l.x,Va)):(Y.map=new Ga(l.x,l.y),Y.map.depthTexture=new Qo(l.x,l.y,Va)),Y.map.depthTexture.name=k.name+".shadowMap",Y.map.depthTexture.format=er,this.type===yf?(Y.map.depthTexture.compareFunction=ot?hy:fy,Y.map.depthTexture.minFilter=Ii,Y.map.depthTexture.magFilter=Ii):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=pi,Y.map.depthTexture.magFilter=pi);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==l.x||Y.map.height!==l.y)&&Y.map.setSize(l.x,l.y);const ht=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();k.isPointLight!==!0&&Y.updateMatrices(k,C);const Tt=(Y.camera.layers.mask&4294967294)!==0?Y.camera.layers:C.layers;for(let Vt=0;Vt<ht;Vt++){const ae=Y.getCamera(Vt);if(k.isPointLight){const D=Y.camera,$=Y.matrix,xt=k.distance||D.far;xt!==D.far&&(D.far=xt,D.updateProjectionMatrix()),rc.setFromMatrixPosition(k.matrixWorld),D.position.copy(rc),Jp.copy(D.position),Jp.add(JC[Vt]),D.up.copy($C[Vt]),D.lookAt(Jp),D.updateMatrixWorld(),$.makeTranslation(-rc.x,-rc.y,-rc.z),FS.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(FS,D.coordinateSystem,D.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)o.setRenderTarget(Y.map,Vt),o.clear();else{Vt===0&&(o.setRenderTarget(Y.map),o.clear());const D=Y.getViewport(Vt);h.set(u.x*D.x,u.y*D.y,u.x*D.z,u.y*D.w),J.viewport(h)}s=Y.getFrustum(Vt),L(E,C,ae,k,Tt,this.type)}Y.isPointLightShadow!==!0&&this.type===uc&&N(Y,C),Y.needsUpdate=!1}M=this.type,y.needsUpdate=!1,o.setRenderTarget(W,H,K)};function N(U,E){const C=t.update(A);_.defines.VSM_SAMPLES!==U.blurSamples&&(_.defines.VSM_SAMPLES=U.blurSamples,x.defines.VSM_SAMPLES=U.blurSamples,_.needsUpdate=!0,x.needsUpdate=!0),U.mapPass===null?U.mapPass=new Ga(l.x,l.y,{format:Nr,type:Xa}):(U.mapPass.width!==U.map.width||U.mapPass.height!==U.map.height)&&U.mapPass.setSize(U.map.width,U.map.height),_.uniforms.shadow_pass.value=U.map.depthTexture,_.uniforms.resolution.value.set(U.map.width,U.map.height),_.uniforms.radius.value=U.radius,o.setRenderTarget(U.mapPass),o.clear(),o.renderBufferDirect(E,null,C,_,A,null),x.uniforms.shadow_pass.value=U.mapPass.texture,x.uniforms.resolution.value.set(U.map.width,U.map.height),x.uniforms.radius.value=U.radius,o.setRenderTarget(U.map),o.clear(),o.renderBufferDirect(E,null,C,x,A,null)}function P(U,E,C,W){let H=null;const K=C.isPointLight===!0?U.customDistanceMaterial:U.customDepthMaterial;if(K!==void 0)H=K;else if(H=C.isPointLight===!0?m:d,o.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){const J=H.uuid,ut=E.uuid;let V=p[J];V===void 0&&(V={},p[J]=V);let st=V[ut];st===void 0&&(st=H.clone(),V[ut]=st,E.addEventListener("dispose",I)),H=st}if(H.visible=E.visible,H.wireframe=E.wireframe,W===uc?H.side=E.shadowSide!==null?E.shadowSide:E.side:H.side=E.shadowSide!==null?E.shadowSide:g[E.side],H.alphaMap=E.alphaMap,H.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,H.map=E.map,H.clipShadows=E.clipShadows,H.clippingPlanes=E.clippingPlanes,H.clipIntersection=E.clipIntersection,H.displacementMap=E.displacementMap,H.displacementScale=E.displacementScale,H.displacementBias=E.displacementBias,H.wireframeLinewidth=E.wireframeLinewidth,H.linewidth=E.linewidth,C.isPointLight===!0&&H.isMeshDistanceMaterial===!0){const J=o.properties.get(H);J.light=C}return H}function L(U,E,C,W,H,K){if(U.visible===!1)return;if(U.layers.test(H)&&(U.isMesh||U.isLine||U.isPoints)&&(U.castShadow||U.receiveShadow&&K===uc)&&(!U.frustumCulled||U.intersectsFrustum(s))){U.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,U.matrixWorld);const V=t.update(U),st=U.material;if(Array.isArray(st)){const k=V.groups;for(let Y=0,dt=k.length;Y<dt;Y++){const ot=k[Y],ht=st[ot.materialIndex];if(ht&&ht.visible){const Tt=P(U,ht,W,K);U.onBeforeShadow(o,U,E,C,V,Tt,ot),o.renderBufferDirect(C,null,V,Tt,U,ot),U.onAfterShadow(o,U,E,C,V,Tt,ot)}}}else if(st.visible){const k=P(U,st,W,K);U.onBeforeShadow(o,U,E,C,V,k,null),o.renderBufferDirect(C,null,V,k,U,null),U.onAfterShadow(o,U,E,C,V,k,null)}}const ut=U.children;for(let V=0,st=ut.length;V<st;V++)L(ut[V],E,C,W,H,K)}function I(U){U.target.removeEventListener("dispose",I);for(const C in p){const W=p[C],H=U.target.uuid;H in W&&(W[H].dispose(),delete W[H])}}}function e3(o,t){function i(){let F=!1;const vt=new Dn;let gt=null;const Ft=new Dn(0,0,0,0);return{setMask:function(X){gt!==X&&!F&&(o.colorMask(X,X,X,X),gt=X)},setLocked:function(X){F=X},setClear:function(X,pt,Rt,Xt,bt){bt===!0&&(X*=Xt,pt*=Xt,Rt*=Xt),vt.set(X,pt,Rt,Xt),Ft.equals(vt)===!1&&(o.clearColor(X,pt,Rt,Xt),Ft.copy(vt))},reset:function(){F=!1,gt=null,Ft.set(-1,0,0,0)}}}function s(){let F=!1,vt=!1,gt=null,Ft=null,X=null;return{setReversed:function(pt){if(vt!==pt){const Rt=t.get("EXT_clip_control");pt?Rt.clipControlEXT(Rt.LOWER_LEFT_EXT,Rt.ZERO_TO_ONE_EXT):Rt.clipControlEXT(Rt.LOWER_LEFT_EXT,Rt.NEGATIVE_ONE_TO_ONE_EXT),vt=pt;const Xt=X;X=null,this.setClear(Xt)}},getReversed:function(){return vt},setTest:function(pt){pt?Ct(o.DEPTH_TEST):qt(o.DEPTH_TEST)},setMask:function(pt){gt!==pt&&!F&&(o.depthMask(pt),gt=pt)},setFunc:function(pt){if(vt&&(pt=pT[pt]),Ft!==pt){switch(pt){case nm:o.depthFunc(o.NEVER);break;case im:o.depthFunc(o.ALWAYS);break;case am:o.depthFunc(o.LESS);break;case vc:o.depthFunc(o.LEQUAL);break;case sm:o.depthFunc(o.EQUAL);break;case rm:o.depthFunc(o.GEQUAL);break;case om:o.depthFunc(o.GREATER);break;case lm:o.depthFunc(o.NOTEQUAL);break;default:o.depthFunc(o.LEQUAL)}Ft=pt}},setLocked:function(pt){F=pt},setClear:function(pt){X!==pt&&(X=pt,vt&&(pt=1-pt),o.clearDepth(pt))},reset:function(){F=!1,gt=null,Ft=null,X=null,vt=!1}}}function l(){let F=!1,vt=null,gt=null,Ft=null,X=null,pt=null,Rt=null,Xt=null,bt=null;return{setTest:function(Zt){F||(Zt?Ct(o.STENCIL_TEST):qt(o.STENCIL_TEST))},setMask:function(Zt){vt!==Zt&&!F&&(o.stencilMask(Zt),vt=Zt)},setFunc:function(Zt,oe,Pt){(gt!==Zt||Ft!==oe||X!==Pt)&&(o.stencilFunc(Zt,oe,Pt),gt=Zt,Ft=oe,X=Pt)},setOp:function(Zt,oe,Pt){(pt!==Zt||Rt!==oe||Xt!==Pt)&&(o.stencilOp(Zt,oe,Pt),pt=Zt,Rt=oe,Xt=Pt)},setLocked:function(Zt){F=Zt},setClear:function(Zt){bt!==Zt&&(o.clearStencil(Zt),bt=Zt)},reset:function(){F=!1,vt=null,gt=null,Ft=null,X=null,pt=null,Rt=null,Xt=null,bt=null}}}const u=new i,h=new s,d=new l;let m={};const p=new WeakMap;let S={},g={},_={},x=new WeakMap,b=[],A=null,y=!1,M=null,N=null,P=null,L=null,I=null,U=null,E=null,C=new he(0,0,0),W=0,H=!1,K=null,J=null,ut=null,V=null,st=null;const k=o.getParameter(o.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,dt=0;const ot=o.getParameter(o.VERSION);ot.indexOf("WebGL")!==-1?(dt=parseFloat(/^WebGL (\d)/.exec(ot)[1]),Y=dt>=1):ot.indexOf("OpenGL ES")!==-1&&(dt=parseFloat(/^OpenGL ES (\d)/.exec(ot)[1]),Y=dt>=2);let ht=null,Tt={};const Vt=o.getParameter(o.SCISSOR_BOX),ae=o.getParameter(o.VIEWPORT),D=new Dn().fromArray(Vt),$=new Dn().fromArray(ae);function xt(F,vt,gt,Ft){const X=new Uint8Array(4),pt=o.createTexture();o.bindTexture(F,pt),o.texParameteri(F,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(F,o.TEXTURE_MAG_FILTER,o.NEAREST);for(let Rt=0;Rt<gt;Rt++)F===o.TEXTURE_3D||F===o.TEXTURE_2D_ARRAY?o.texImage3D(vt,0,o.RGBA,1,1,Ft,0,o.RGBA,o.UNSIGNED_BYTE,X):o.texImage2D(vt+Rt,0,o.RGBA,1,1,0,o.RGBA,o.UNSIGNED_BYTE,X);return pt}const At={};At[o.TEXTURE_2D]=xt(o.TEXTURE_2D,o.TEXTURE_2D,1),At[o.TEXTURE_CUBE_MAP]=xt(o.TEXTURE_CUBE_MAP,o.TEXTURE_CUBE_MAP_POSITIVE_X,6),At[o.TEXTURE_2D_ARRAY]=xt(o.TEXTURE_2D_ARRAY,o.TEXTURE_2D_ARRAY,1,1),At[o.TEXTURE_3D]=xt(o.TEXTURE_3D,o.TEXTURE_3D,1,1),u.setClear(0,0,0,1),h.setClear(1),d.setClear(0),Ct(o.DEPTH_TEST),h.setFunc(vc),ze(!1),re(Cx),Ct(o.CULL_FACE),Ge(qo);function Ct(F){S[F]!==!0&&(o.enable(F),S[F]=!0)}function qt(F){S[F]!==!1&&(o.disable(F),S[F]=!1)}function le(F,vt){return _[F]!==vt?(o.bindFramebuffer(F,vt),_[F]=vt,F===o.DRAW_FRAMEBUFFER&&(_[o.FRAMEBUFFER]=vt),F===o.FRAMEBUFFER&&(_[o.DRAW_FRAMEBUFFER]=vt),!0):!1}function wt(F,vt){let gt=b,Ft=!1;if(F){gt=x.get(vt),gt===void 0&&(gt=[],x.set(vt,gt));const X=F.textures;if(gt.length!==X.length||gt[0]!==o.COLOR_ATTACHMENT0){for(let pt=0,Rt=X.length;pt<Rt;pt++)gt[pt]=o.COLOR_ATTACHMENT0+pt;gt.length=X.length,Ft=!0}}else gt[0]!==o.BACK&&(gt[0]=o.BACK,Ft=!0);Ft&&o.drawBuffers(gt)}function Wt(F){return A!==F?(o.useProgram(F),A=F,!0):!1}const de={[Xo]:o.FUNC_ADD,[zb]:o.FUNC_SUBTRACT,[Bb]:o.FUNC_REVERSE_SUBTRACT};de[Fb]=o.MIN,de[Hb]=o.MAX;const Me={[Gb]:o.ZERO,[Vb]:o.ONE,[Xb]:o.SRC_COLOR,[ZS]:o.SRC_ALPHA,[Kb]:o.SRC_ALPHA_SATURATE,[Yb]:o.DST_COLOR,[qb]:o.DST_ALPHA,[kb]:o.ONE_MINUS_SRC_COLOR,[KS]:o.ONE_MINUS_SRC_ALPHA,[Zb]:o.ONE_MINUS_DST_COLOR,[Wb]:o.ONE_MINUS_DST_ALPHA,[jb]:o.CONSTANT_COLOR,[Qb]:o.ONE_MINUS_CONSTANT_COLOR,[Jb]:o.CONSTANT_ALPHA,[$b]:o.ONE_MINUS_CONSTANT_ALPHA};function Ge(F,vt,gt,Ft,X,pt,Rt,Xt,bt,Zt){if(F===qo){y===!0&&(qt(o.BLEND),y=!1);return}if(y===!1&&(Ct(o.BLEND),y=!0),F!==Ib){if(F!==M||Zt!==H){if((N!==Xo||I!==Xo)&&(o.blendEquation(o.FUNC_ADD),N=Xo,I=Xo),Zt)switch(F){case hc:o.blendFuncSeparate(o.ONE,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case Ki:o.blendFunc(o.ONE,o.ONE);break;case Nx:o.blendFuncSeparate(o.ZERO,o.ONE_MINUS_SRC_COLOR,o.ZERO,o.ONE);break;case Dx:o.blendFuncSeparate(o.DST_COLOR,o.ONE_MINUS_SRC_ALPHA,o.ZERO,o.ONE);break;default:en("WebGLState: Invalid blending: ",F);break}else switch(F){case hc:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case Ki:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE,o.ONE,o.ONE);break;case Nx:en("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Dx:en("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:en("WebGLState: Invalid blending: ",F);break}P=null,L=null,U=null,E=null,C.set(0,0,0),W=0,M=F,H=Zt}return}X=X||vt,pt=pt||gt,Rt=Rt||Ft,(vt!==N||X!==I)&&(o.blendEquationSeparate(de[vt],de[X]),N=vt,I=X),(gt!==P||Ft!==L||pt!==U||Rt!==E)&&(o.blendFuncSeparate(Me[gt],Me[Ft],Me[pt],Me[Rt]),P=gt,L=Ft,U=pt,E=Rt),(Xt.equals(C)===!1||bt!==W)&&(o.blendColor(Xt.r,Xt.g,Xt.b,bt),C.copy(Xt),W=bt),M=F,H=!1}function Pe(F,vt){F.side===Pi?qt(o.CULL_FACE):Ct(o.CULL_FACE);let gt=F.side===zi;vt&&(gt=!gt),ze(gt),F.blending===hc&&F.transparent===!1?Ge(qo):Ge(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),h.setFunc(F.depthFunc),h.setTest(F.depthTest),h.setMask(F.depthWrite),u.setMask(F.colorWrite);const Ft=F.stencilWrite;d.setTest(Ft),Ft&&(d.setMask(F.stencilWriteMask),d.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),d.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Ne(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?Ct(o.SAMPLE_ALPHA_TO_COVERAGE):qt(o.SAMPLE_ALPHA_TO_COVERAGE)}function ze(F){K!==F&&(F?o.frontFace(o.CW):o.frontFace(o.CCW),K=F)}function re(F){F!==Ub?(Ct(o.CULL_FACE),F!==J&&(F===Cx?o.cullFace(o.BACK):F===Ob?o.cullFace(o.FRONT):o.cullFace(o.FRONT_AND_BACK))):qt(o.CULL_FACE),J=F}function gn(F){F!==ut&&(Y&&o.lineWidth(F),ut=F)}function Ne(F,vt,gt){F?(Ct(o.POLYGON_OFFSET_FILL),(V!==vt||st!==gt)&&(V=vt,st=gt,h.getReversed()&&(vt=-vt,gt=-gt),o.polygonOffset(vt,gt))):qt(o.POLYGON_OFFSET_FILL)}function vn(F){F?Ct(o.SCISSOR_TEST):qt(o.SCISSOR_TEST)}function Cn(F){F===void 0&&(F=o.TEXTURE0+k-1),ht!==F&&(o.activeTexture(F),ht=F)}function An(F,vt,gt){gt===void 0&&(ht===null?gt=o.TEXTURE0+k-1:gt=ht);let Ft=Tt[gt];Ft===void 0&&(Ft={type:void 0,texture:void 0},Tt[gt]=Ft),(Ft.type!==F||Ft.texture!==vt)&&(ht!==gt&&(o.activeTexture(gt),ht=gt),o.bindTexture(F,vt||At[F]),Ft.type=F,Ft.texture=vt)}function j(){const F=Tt[ht];F!==void 0&&F.type!==void 0&&(o.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function _n(){try{o.compressedTexImage2D(...arguments)}catch(F){en("WebGLState:",F)}}function Ye(){try{o.compressedTexImage3D(...arguments)}catch(F){en("WebGLState:",F)}}function Ue(){try{o.texSubImage2D(...arguments)}catch(F){en("WebGLState:",F)}}function Ht(){try{o.texSubImage3D(...arguments)}catch(F){en("WebGLState:",F)}}function Be(){try{o.compressedTexSubImage2D(...arguments)}catch(F){en("WebGLState:",F)}}function se(){try{o.compressedTexSubImage3D(...arguments)}catch(F){en("WebGLState:",F)}}function ie(){try{o.texStorage2D(...arguments)}catch(F){en("WebGLState:",F)}}function O(){try{o.texStorage3D(...arguments)}catch(F){en("WebGLState:",F)}}function R(){try{o.texImage2D(...arguments)}catch(F){en("WebGLState:",F)}}function it(){try{o.texImage3D(...arguments)}catch(F){en("WebGLState:",F)}}function Nt(F){return g[F]!==void 0?g[F]:o.getParameter(F)}function yt(F,vt){g[F]!==vt&&(o.pixelStorei(F,vt),g[F]=vt)}function zt(F){D.equals(F)===!1&&(o.scissor(F.x,F.y,F.z,F.w),D.copy(F))}function Bt(F){$.equals(F)===!1&&(o.viewport(F.x,F.y,F.z,F.w),$.copy(F))}function mt(F,vt){let gt=p.get(vt);gt===void 0&&(gt=new WeakMap,p.set(vt,gt));let Ft=gt.get(F);Ft===void 0&&(Ft=o.getUniformBlockIndex(vt,F.name),o.uniformBlockBinding(vt,Ft,Ft),gt.set(F,Ft))}function _t(F,vt,gt){const X=p.get(vt).get(F);m[X]!==gt&&(o.bindBufferBase(o.UNIFORM_BUFFER,X,gt),m[X]=gt)}function Ot(){o.disable(o.BLEND),o.disable(o.CULL_FACE),o.disable(o.DEPTH_TEST),o.disable(o.POLYGON_OFFSET_FILL),o.disable(o.SCISSOR_TEST),o.disable(o.STENCIL_TEST),o.disable(o.SAMPLE_ALPHA_TO_COVERAGE),o.blendEquation(o.FUNC_ADD),o.blendFunc(o.ONE,o.ZERO),o.blendFuncSeparate(o.ONE,o.ZERO,o.ONE,o.ZERO),o.blendColor(0,0,0,0),o.colorMask(!0,!0,!0,!0),o.clearColor(0,0,0,0),o.depthMask(!0),o.depthFunc(o.LESS),h.setReversed(!1),o.clearDepth(1),o.stencilMask(4294967295),o.stencilFunc(o.ALWAYS,0,4294967295),o.stencilOp(o.KEEP,o.KEEP,o.KEEP),o.clearStencil(0),o.cullFace(o.BACK),o.frontFace(o.CCW),o.polygonOffset(0,0),o.activeTexture(o.TEXTURE0),o.bindFramebuffer(o.FRAMEBUFFER,null),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),o.bindFramebuffer(o.READ_FRAMEBUFFER,null),o.useProgram(null),o.lineWidth(1),o.scissor(0,0,o.canvas.width,o.canvas.height),o.viewport(0,0,o.canvas.width,o.canvas.height),o.pixelStorei(o.PACK_ALIGNMENT,4),o.pixelStorei(o.UNPACK_ALIGNMENT,4),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,!1),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,o.BROWSER_DEFAULT_WEBGL),o.pixelStorei(o.PACK_ROW_LENGTH,0),o.pixelStorei(o.PACK_SKIP_PIXELS,0),o.pixelStorei(o.PACK_SKIP_ROWS,0),o.pixelStorei(o.UNPACK_ROW_LENGTH,0),o.pixelStorei(o.UNPACK_IMAGE_HEIGHT,0),o.pixelStorei(o.UNPACK_SKIP_PIXELS,0),o.pixelStorei(o.UNPACK_SKIP_ROWS,0),o.pixelStorei(o.UNPACK_SKIP_IMAGES,0),S={},g={},ht=null,Tt={},_={},m={},x=new WeakMap,b=[],A=null,y=!1,M=null,N=null,P=null,L=null,I=null,U=null,E=null,C=new he(0,0,0),W=0,H=!1,K=null,J=null,ut=null,V=null,st=null,D.set(0,0,o.canvas.width,o.canvas.height),$.set(0,0,o.canvas.width,o.canvas.height),u.reset(),h.reset(),d.reset()}return{buffers:{color:u,depth:h,stencil:d},enable:Ct,disable:qt,bindFramebuffer:le,drawBuffers:wt,useProgram:Wt,setBlending:Ge,setMaterial:Pe,setFlipSided:ze,setCullFace:re,setLineWidth:gn,setPolygonOffset:Ne,setScissorTest:vn,activeTexture:Cn,bindTexture:An,unbindTexture:j,compressedTexImage2D:_n,compressedTexImage3D:Ye,texImage2D:R,texImage3D:it,pixelStorei:yt,getParameter:Nt,updateUBOMapping:mt,uniformBlockBinding:_t,texStorage2D:ie,texStorage3D:O,texSubImage2D:Ue,texSubImage3D:Ht,compressedTexSubImage2D:Be,compressedTexSubImage3D:se,scissor:zt,viewport:Bt,reset:Ot}}function n3(o,t,i,s,l,u,h){const d=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,m=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),p=new te,S=new WeakMap,g=new Set;let _;const x=new WeakMap,b=new Set,A=new FinalizationRegistry(O=>b.delete(O));let y=!1;try{y=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(O,R){return y?new OffscreenCanvas(O,R):Uf("canvas")}function N(O,R,it){let Nt=1;const yt=ie(O);if((yt.width>it||yt.height>it)&&(Nt=it/Math.max(yt.width,yt.height)),Nt<1)if(typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&O instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&O instanceof ImageBitmap||typeof VideoFrame<"u"&&O instanceof VideoFrame){const zt=Math.floor(Nt*yt.width),Bt=Math.floor(Nt*yt.height);_===void 0&&(_=M(zt,Bt));const mt=R?M(zt,Bt):_;return mt.width=zt,mt.height=Bt,mt.getContext("2d").drawImage(O,0,0,zt,Bt),_e("WebGLRenderer: Texture has been resized from ("+yt.width+"x"+yt.height+") to ("+zt+"x"+Bt+")."),mt}else return"data"in O&&_e("WebGLRenderer: Image in DataTexture is too big ("+yt.width+"x"+yt.height+")."),O;return O}function P(O){return O.generateMipmaps}function L(O){o.generateMipmap(O)}function I(O){return O.isWebGLCubeRenderTarget?o.TEXTURE_CUBE_MAP:O.isWebGL3DRenderTarget?o.TEXTURE_3D:O.isWebGLArrayRenderTarget||O.isCompressedArrayTexture?o.TEXTURE_2D_ARRAY:o.TEXTURE_2D}function U(O,R,it,Nt,yt,zt=!1){if(O!==null){if(o[O]!==void 0)return o[O];_e("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+O+"'")}let Bt;Nt&&(Bt=t.get("EXT_texture_norm16"),Bt||_e("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let mt=R;if(R===o.RED&&(it===o.FLOAT&&(mt=o.R32F),it===o.HALF_FLOAT&&(mt=o.R16F),it===o.UNSIGNED_BYTE&&(mt=o.R8),it===o.UNSIGNED_SHORT&&Bt&&(mt=Bt.R16_EXT),it===o.SHORT&&Bt&&(mt=Bt.R16_SNORM_EXT)),R===o.RED_INTEGER&&(it===o.UNSIGNED_BYTE&&(mt=o.R8UI),it===o.UNSIGNED_SHORT&&(mt=o.R16UI),it===o.UNSIGNED_INT&&(mt=o.R32UI),it===o.BYTE&&(mt=o.R8I),it===o.SHORT&&(mt=o.R16I),it===o.INT&&(mt=o.R32I)),R===o.RG&&(it===o.FLOAT&&(mt=o.RG32F),it===o.HALF_FLOAT&&(mt=o.RG16F),it===o.UNSIGNED_BYTE&&(mt=o.RG8),it===o.UNSIGNED_SHORT&&Bt&&(mt=Bt.RG16_EXT),it===o.SHORT&&Bt&&(mt=Bt.RG16_SNORM_EXT)),R===o.RG_INTEGER&&(it===o.UNSIGNED_BYTE&&(mt=o.RG8UI),it===o.UNSIGNED_SHORT&&(mt=o.RG16UI),it===o.UNSIGNED_INT&&(mt=o.RG32UI),it===o.BYTE&&(mt=o.RG8I),it===o.SHORT&&(mt=o.RG16I),it===o.INT&&(mt=o.RG32I)),R===o.RGB_INTEGER&&(it===o.UNSIGNED_BYTE&&(mt=o.RGB8UI),it===o.UNSIGNED_SHORT&&(mt=o.RGB16UI),it===o.UNSIGNED_INT&&(mt=o.RGB32UI),it===o.BYTE&&(mt=o.RGB8I),it===o.SHORT&&(mt=o.RGB16I),it===o.INT&&(mt=o.RGB32I)),R===o.RGBA_INTEGER&&(it===o.UNSIGNED_BYTE&&(mt=o.RGBA8UI),it===o.UNSIGNED_SHORT&&(mt=o.RGBA16UI),it===o.UNSIGNED_INT&&(mt=o.RGBA32UI),it===o.BYTE&&(mt=o.RGBA8I),it===o.SHORT&&(mt=o.RGBA16I),it===o.INT&&(mt=o.RGBA32I)),R===o.RGB&&(it===o.UNSIGNED_SHORT&&Bt&&(mt=Bt.RGB16_EXT),it===o.SHORT&&Bt&&(mt=Bt.RGB16_SNORM_EXT),it===o.UNSIGNED_INT_5_9_9_9_REV&&(mt=o.RGB9_E5),it===o.UNSIGNED_INT_10F_11F_11F_REV&&(mt=o.R11F_G11F_B10F)),R===o.RGBA){const _t=zt?Lf:Qe.getTransfer(yt);it===o.FLOAT&&(mt=o.RGBA32F),it===o.HALF_FLOAT&&(mt=o.RGBA16F),it===o.UNSIGNED_BYTE&&(mt=_t===hn?o.SRGB8_ALPHA8:o.RGBA8),it===o.UNSIGNED_SHORT&&Bt&&(mt=Bt.RGBA16_EXT),it===o.SHORT&&Bt&&(mt=Bt.RGBA16_SNORM_EXT),it===o.UNSIGNED_SHORT_4_4_4_4&&(mt=o.RGBA4),it===o.UNSIGNED_SHORT_5_5_5_1&&(mt=o.RGB5_A1)}return(mt===o.R16F||mt===o.R32F||mt===o.RG16F||mt===o.RG32F||mt===o.RGBA16F||mt===o.RGBA32F)&&t.get("EXT_color_buffer_float"),mt}function E(O,R){let it;return O?R===null||R===Va||R===Ko?it=o.DEPTH24_STENCIL8:R===Ma?it=o.DEPTH32F_STENCIL8:R===Sc&&(it=o.DEPTH24_STENCIL8,_e("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):R===null||R===Va||R===Ko?it=o.DEPTH_COMPONENT24:R===Ma?it=o.DEPTH_COMPONENT32F:R===Sc&&(it=o.DEPTH_COMPONENT16),it}function C(O,R){return P(O)===!0||O.isFramebufferTexture&&O.minFilter!==pi&&O.minFilter!==Ii?Math.log2(Math.max(R.width,R.height))+1:O.mipmaps.length>0?O.mipmaps.length:O.isCompressedTexture&&Array.isArray(O.image)?R.mipmaps.length:1}function W(O){const R=new WeakRef(O);s.get(O).__ref=R,b.add(R),A.register(O,R,R)}function H(O){const R=s.get(O).__ref;R!==void 0&&(b.delete(R),A.unregister(R))}function K(O){ut(O.target)}function J(O){V(O.target)}function ut(O){O.removeEventListener("dispose",K),H(O),k(O),O.isVideoTexture&&S.delete(O),O.isHTMLTexture&&g.delete(O)}function V(O){O.removeEventListener("dispose",J),H(O),dt(O)}function st(){for(const O of b){const R=O.deref();R!==void 0&&(R.isRenderTarget===!0?V(R):ut(R))}b.clear(),g.clear()}function k(O){const R=s.get(O);if(R.__webglInit===void 0)return;const it=O.source,Nt=x.get(it);if(Nt){const yt=Nt[R.__cacheKey];yt.usedTimes--,yt.usedTimes===0&&Y(O),Object.keys(Nt).length===0&&x.delete(it)}s.remove(O)}function Y(O){const R=s.get(O);o.deleteTexture(R.__webglTexture);const it=O.source,Nt=x.get(it);delete Nt[R.__cacheKey],h.memory.textures--}function dt(O){const R=s.get(O);R.__depthDisposeCallback&&R.__depthDisposeCallback();const it=O.depthTexture;if(it&&it.renderTarget===O&&ut(it),O.isWebGLCubeRenderTarget)for(let yt=0;yt<6;yt++){if(Array.isArray(R.__webglFramebuffer[yt]))for(let zt=0;zt<R.__webglFramebuffer[yt].length;zt++)o.deleteFramebuffer(R.__webglFramebuffer[yt][zt]);else o.deleteFramebuffer(R.__webglFramebuffer[yt]);R.__webglDepthbuffer&&o.deleteRenderbuffer(R.__webglDepthbuffer[yt])}else{if(Array.isArray(R.__webglFramebuffer))for(let yt=0;yt<R.__webglFramebuffer.length;yt++)o.deleteFramebuffer(R.__webglFramebuffer[yt]);else o.deleteFramebuffer(R.__webglFramebuffer);if(R.__webglDepthbuffer&&o.deleteRenderbuffer(R.__webglDepthbuffer),R.__webglMultisampledFramebuffer&&o.deleteFramebuffer(R.__webglMultisampledFramebuffer),R.__webglColorRenderbuffer)for(let yt=0;yt<R.__webglColorRenderbuffer.length;yt++)R.__webglColorRenderbuffer[yt]&&o.deleteRenderbuffer(R.__webglColorRenderbuffer[yt]);R.__webglDepthRenderbuffer&&o.deleteRenderbuffer(R.__webglDepthRenderbuffer)}const Nt=O.textures;for(let yt=0,zt=Nt.length;yt<zt;yt++){const Bt=s.get(Nt[yt]);Bt.__webglTexture&&(o.deleteTexture(Bt.__webglTexture),h.memory.textures--),s.remove(Nt[yt])}s.remove(O)}let ot=0;function ht(){ot=0}function Tt(){return ot}function Vt(O){ot=O}function ae(){const O=ot;return O>=l.maxTextures&&_e("WebGLTextures: Trying to use "+(O+1)+" texture units while this GPU supports only "+l.maxTextures),ot+=1,O}function D(O){const R=[];return R.push(O.wrapS),R.push(O.wrapT),R.push(O.wrapR||0),R.push(O.magFilter),R.push(O.minFilter),R.push(O.anisotropy),R.push(O.internalFormat),R.push(O.format),R.push(O.type),R.push(O.generateMipmaps),R.push(O.mipmapsAutoUpdate),R.push(O.premultiplyAlpha),R.push(O.flipY),R.push(O.unpackAlignment),R.push(O.colorSpace),R.join()}function $(O,R){const it=s.get(O);if(O.isVideoTexture&&Be(O),O.isRenderTargetTexture===!1&&O.isExternalTexture!==!0&&O.version>0&&it.__version!==O.version){const Nt=O.image;if(Nt===null)_e("WebGLRenderer: Texture marked for update but no image data found.");else if(Nt.complete===!1)_e("WebGLRenderer: Texture marked for update but image is incomplete");else{Pe(it,O,R);return}}else O.isExternalTexture&&(it.__webglTexture=O.sourceTexture?O.sourceTexture:null);i.bindTexture(o.TEXTURE_2D,it.__webglTexture,o.TEXTURE0+R)}function xt(O,R){const it=s.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&it.__version!==O.version){Pe(it,O,R);return}else O.isExternalTexture&&(it.__webglTexture=O.sourceTexture?O.sourceTexture:null);i.bindTexture(o.TEXTURE_2D_ARRAY,it.__webglTexture,o.TEXTURE0+R)}function At(O,R){const it=s.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&it.__version!==O.version){Pe(it,O,R);return}i.bindTexture(o.TEXTURE_3D,it.__webglTexture,o.TEXTURE0+R)}function Ct(O,R){const it=s.get(O);if(O.version>0&&it.__version!==O.version){ze(it,O,R);return}i.bindTexture(o.TEXTURE_CUBE_MAP,it.__webglTexture,o.TEXTURE0+R)}const qt={[xc]:o.REPEAT,[hs]:o.CLAMP_TO_EDGE,[cm]:o.MIRRORED_REPEAT},le={[pi]:o.NEAREST,[nT]:o.NEAREST_MIPMAP_NEAREST,[Xu]:o.NEAREST_MIPMAP_LINEAR,[Ii]:o.LINEAR,[Sp]:o.LINEAR_MIPMAP_NEAREST,[$s]:o.LINEAR_MIPMAP_LINEAR},wt={[rT]:o.NEVER,[dy]:o.ALWAYS,[oT]:o.LESS,[fy]:o.LEQUAL,[lT]:o.EQUAL,[hy]:o.GEQUAL,[cT]:o.GREATER,[uT]:o.NOTEQUAL};function Wt(O,R){if(R.type===Ma&&t.has("OES_texture_float_linear")===!1&&(R.magFilter===Ii||R.magFilter===Sp||R.magFilter===Xu||R.magFilter===$s||R.minFilter===Ii||R.minFilter===Sp||R.minFilter===Xu||R.minFilter===$s)&&_e("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),o.texParameteri(O,o.TEXTURE_WRAP_S,qt[R.wrapS]),o.texParameteri(O,o.TEXTURE_WRAP_T,qt[R.wrapT]),(O===o.TEXTURE_3D||O===o.TEXTURE_2D_ARRAY)&&o.texParameteri(O,o.TEXTURE_WRAP_R,qt[R.wrapR]),o.texParameteri(O,o.TEXTURE_MAG_FILTER,le[R.magFilter]),o.texParameteri(O,o.TEXTURE_MIN_FILTER,le[R.minFilter]),R.compareFunction&&(o.texParameteri(O,o.TEXTURE_COMPARE_MODE,o.COMPARE_REF_TO_TEXTURE),o.texParameteri(O,o.TEXTURE_COMPARE_FUNC,wt[R.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(R.magFilter===pi||R.minFilter!==Xu&&R.minFilter!==$s||R.type===Ma&&t.has("OES_texture_float_linear")===!1)return;if(R.anisotropy>1||s.get(R).__currentAnisotropy){const it=t.get("EXT_texture_filter_anisotropic");o.texParameterf(O,it.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(R.anisotropy,l.getMaxAnisotropy())),s.get(R).__currentAnisotropy=R.anisotropy}}}function de(O,R){let it=!1;O.__webglInit===void 0&&(O.__webglInit=!0,R.addEventListener("dispose",K),W(R));const Nt=R.source;let yt=x.get(Nt);yt===void 0&&(yt={},x.set(Nt,yt));const zt=D(R);if(zt!==O.__cacheKey){yt[zt]===void 0&&(yt[zt]={texture:o.createTexture(),usedTimes:0},h.memory.textures++,it=!0),yt[zt].usedTimes++;const Bt=yt[O.__cacheKey];Bt!==void 0&&(yt[O.__cacheKey].usedTimes--,Bt.usedTimes===0&&Y(R)),O.__cacheKey=zt,O.__webglTexture=yt[zt].texture}return it}function Me(O,R,it){return Math.floor(Math.floor(O/it)/R)}function Ge(O,R,it,Nt){const zt=O.updateRanges;if(zt.length===0)i.texSubImage2D(o.TEXTURE_2D,0,0,0,R.width,R.height,it,Nt,R.data);else{zt.sort((F,vt)=>F.start-vt.start);let Bt=0;for(let F=1;F<zt.length;F++){const vt=zt[Bt],gt=zt[F],Ft=vt.start+vt.count,X=Me(gt.start,R.width,4),pt=Me(vt.start,R.width,4);gt.start<=Ft+1&&X===pt&&Me(gt.start+gt.count-1,R.width,4)===X?vt.count=Math.max(vt.count,gt.start+gt.count-vt.start):(++Bt,zt[Bt]=gt)}zt.length=Bt+1;const mt=i.getParameter(o.UNPACK_ROW_LENGTH),_t=i.getParameter(o.UNPACK_SKIP_PIXELS),Ot=i.getParameter(o.UNPACK_SKIP_ROWS);i.pixelStorei(o.UNPACK_ROW_LENGTH,R.width);for(let F=0,vt=zt.length;F<vt;F++){const gt=zt[F],Ft=Math.floor(gt.start/4),X=Math.ceil(gt.count/4),pt=Ft%R.width,Rt=Math.floor(Ft/R.width),Xt=X,bt=1;i.pixelStorei(o.UNPACK_SKIP_PIXELS,pt),i.pixelStorei(o.UNPACK_SKIP_ROWS,Rt),i.texSubImage2D(o.TEXTURE_2D,0,pt,Rt,Xt,bt,it,Nt,R.data)}O.clearUpdateRanges(),i.pixelStorei(o.UNPACK_ROW_LENGTH,mt),i.pixelStorei(o.UNPACK_SKIP_PIXELS,_t),i.pixelStorei(o.UNPACK_SKIP_ROWS,Ot)}}function Pe(O,R,it){let Nt=o.TEXTURE_2D;(R.isDataArrayTexture||R.isCompressedArrayTexture)&&(Nt=o.TEXTURE_2D_ARRAY),R.isData3DTexture&&(Nt=o.TEXTURE_3D);const yt=de(O,R),zt=R.source;i.bindTexture(Nt,O.__webglTexture,o.TEXTURE0+it);const Bt=s.get(zt);if(zt.version!==Bt.__version||yt===!0){if(i.activeTexture(o.TEXTURE0+it),(typeof ImageBitmap<"u"&&R.image instanceof ImageBitmap)===!1){const bt=Qe.getPrimaries(Qe.workingColorSpace),Zt=R.colorSpace===Js?null:Qe.getPrimaries(R.colorSpace),oe=R.colorSpace===Js||bt===Zt?o.NONE:o.BROWSER_DEFAULT_WEBGL;i.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,R.flipY),i.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,R.premultiplyAlpha),i.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,oe)}i.pixelStorei(o.UNPACK_ALIGNMENT,R.unpackAlignment);let _t=N(R.image,!1,l.maxTextureSize);_t=se(R,_t);const Ot=u.convert(R.format,R.colorSpace),F=u.convert(R.type);let vt=U(R.internalFormat,Ot,F,R.normalized,R.colorSpace,R.isVideoTexture);Wt(Nt,R);let gt;const Ft=R.mipmaps,X=R.isVideoTexture!==!0,pt=Bt.__version===void 0||yt===!0,Rt=zt.dataReady,Xt=C(R,_t);if(R.isDepthTexture)vt=E(R.format===tr,R.type),pt&&(X?i.texStorage2D(o.TEXTURE_2D,1,vt,_t.width,_t.height):i.texImage2D(o.TEXTURE_2D,0,vt,_t.width,_t.height,0,Ot,F,null));else if(R.isDataTexture)if(Ft.length>0){X&&pt&&i.texStorage2D(o.TEXTURE_2D,Xt,vt,Ft[0].width,Ft[0].height);for(let bt=0,Zt=Ft.length;bt<Zt;bt++)gt=Ft[bt],X?Rt&&i.texSubImage2D(o.TEXTURE_2D,bt,0,0,gt.width,gt.height,Ot,F,gt.data):i.texImage2D(o.TEXTURE_2D,bt,vt,gt.width,gt.height,0,Ot,F,gt.data);R.generateMipmaps=!1}else X?(pt&&i.texStorage2D(o.TEXTURE_2D,Xt,vt,_t.width,_t.height),Rt&&Ge(R,_t,Ot,F)):i.texImage2D(o.TEXTURE_2D,0,vt,_t.width,_t.height,0,Ot,F,_t.data);else if(R.isCompressedTexture)if(R.isCompressedArrayTexture){X&&pt&&i.texStorage3D(o.TEXTURE_2D_ARRAY,Xt,vt,Ft[0].width,Ft[0].height,_t.depth);for(let bt=0,Zt=Ft.length;bt<Zt;bt++)if(gt=Ft[bt],R.format!==Ha)if(Ot!==null)if(X){if(Rt)if(R.layerUpdates.size>0){const oe=_S(gt.width,gt.height,R.format,R.type);for(const Pt of R.layerUpdates){const Ze=gt.data.subarray(Pt*oe/gt.data.BYTES_PER_ELEMENT,(Pt+1)*oe/gt.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,bt,0,0,Pt,gt.width,gt.height,1,Ot,Ze)}}else i.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,bt,0,0,0,gt.width,gt.height,_t.depth,Ot,gt.data)}else i.compressedTexImage3D(o.TEXTURE_2D_ARRAY,bt,vt,gt.width,gt.height,_t.depth,0,gt.data,0,0);else _e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else X?Rt&&i.texSubImage3D(o.TEXTURE_2D_ARRAY,bt,0,0,0,gt.width,gt.height,_t.depth,Ot,F,gt.data):i.texImage3D(o.TEXTURE_2D_ARRAY,bt,vt,gt.width,gt.height,_t.depth,0,Ot,F,gt.data);R.layerUpdates.size>0&&R.clearLayerUpdates()}else{X&&pt&&i.texStorage2D(o.TEXTURE_2D,Xt,vt,Ft[0].width,Ft[0].height);for(let bt=0,Zt=Ft.length;bt<Zt;bt++)gt=Ft[bt],R.format!==Ha?Ot!==null?X?Rt&&i.compressedTexSubImage2D(o.TEXTURE_2D,bt,0,0,gt.width,gt.height,Ot,gt.data):i.compressedTexImage2D(o.TEXTURE_2D,bt,vt,gt.width,gt.height,0,gt.data):_e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):X?Rt&&i.texSubImage2D(o.TEXTURE_2D,bt,0,0,gt.width,gt.height,Ot,F,gt.data):i.texImage2D(o.TEXTURE_2D,bt,vt,gt.width,gt.height,0,Ot,F,gt.data)}else if(R.isDataArrayTexture)if(X){if(pt&&i.texStorage3D(o.TEXTURE_2D_ARRAY,Xt,vt,_t.width,_t.height,_t.depth),Rt)if(R.layerUpdates.size>0){const bt=_S(_t.width,_t.height,R.format,R.type);for(const Zt of R.layerUpdates){const oe=_t.data.subarray(Zt*bt/_t.data.BYTES_PER_ELEMENT,(Zt+1)*bt/_t.data.BYTES_PER_ELEMENT);i.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,Zt,_t.width,_t.height,1,Ot,F,oe)}R.clearLayerUpdates()}else i.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,0,_t.width,_t.height,_t.depth,Ot,F,_t.data)}else i.texImage3D(o.TEXTURE_2D_ARRAY,0,vt,_t.width,_t.height,_t.depth,0,Ot,F,_t.data);else if(R.isData3DTexture)X?(pt&&i.texStorage3D(o.TEXTURE_3D,Xt,vt,_t.width,_t.height,_t.depth),Rt&&i.texSubImage3D(o.TEXTURE_3D,0,0,0,0,_t.width,_t.height,_t.depth,Ot,F,_t.data)):i.texImage3D(o.TEXTURE_3D,0,vt,_t.width,_t.height,_t.depth,0,Ot,F,_t.data);else if(R.isFramebufferTexture){if(pt)if(X)i.texStorage2D(o.TEXTURE_2D,Xt,vt,_t.width,_t.height);else{let bt=_t.width,Zt=_t.height;for(let oe=0;oe<Xt;oe++)i.texImage2D(o.TEXTURE_2D,oe,vt,bt,Zt,0,Ot,F,null),bt>>=1,Zt>>=1}}else if(R.isHTMLTexture){if("texElementImage2D"in o){const bt=o.canvas;if(bt.hasAttribute("layoutsubtree")||bt.setAttribute("layoutsubtree","true"),_t.parentNode!==bt){bt.appendChild(_t),g.add(R),bt.onpaint=Zt=>{const oe=Zt.changedElements;for(const Pt of g)oe.includes(Pt.image)&&(Pt.needsUpdate=!0)},bt.requestPaint();return}if(o.texElementImage2D.length===3)o.texElementImage2D(o.TEXTURE_2D,o.RGBA8,_t);else{const oe=o.RGBA,Pt=o.RGBA,Ze=o.UNSIGNED_BYTE;o.texElementImage2D(o.TEXTURE_2D,0,oe,Pt,Ze,_t)}o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE)}}else if(Ft.length>0){if(X&&pt){const bt=ie(Ft[0]);i.texStorage2D(o.TEXTURE_2D,Xt,vt,bt.width,bt.height)}for(let bt=0,Zt=Ft.length;bt<Zt;bt++)gt=Ft[bt],X?Rt&&i.texSubImage2D(o.TEXTURE_2D,bt,0,0,Ot,F,gt):i.texImage2D(o.TEXTURE_2D,bt,vt,Ot,F,gt);R.generateMipmaps=!1}else if(X){if(pt){const bt=ie(_t);i.texStorage2D(o.TEXTURE_2D,Xt,vt,bt.width,bt.height)}Rt&&i.texSubImage2D(o.TEXTURE_2D,0,0,0,Ot,F,_t)}else i.texImage2D(o.TEXTURE_2D,0,vt,Ot,F,_t);P(R)&&R.mipmapsAutoUpdate===!0&&L(Nt),Bt.__version=zt.version,R.onUpdate&&R.onUpdate(R)}O.__version=R.version}function ze(O,R,it){if(R.image.length!==6)return;const Nt=de(O,R),yt=R.source;i.bindTexture(o.TEXTURE_CUBE_MAP,O.__webglTexture,o.TEXTURE0+it);const zt=s.get(yt);if(yt.version!==zt.__version||Nt===!0){i.activeTexture(o.TEXTURE0+it);const Bt=Qe.getPrimaries(Qe.workingColorSpace),mt=R.colorSpace===Js?null:Qe.getPrimaries(R.colorSpace),_t=R.colorSpace===Js||Bt===mt?o.NONE:o.BROWSER_DEFAULT_WEBGL;i.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,R.flipY),i.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,R.premultiplyAlpha),i.pixelStorei(o.UNPACK_ALIGNMENT,R.unpackAlignment),i.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);const Ot=R.isCompressedTexture||R.image[0].isCompressedTexture,F=R.image[0]&&R.image[0].isDataTexture,vt=[];for(let Pt=0;Pt<6;Pt++)!Ot&&!F?vt[Pt]=N(R.image[Pt],!0,l.maxCubemapSize):vt[Pt]=F?R.image[Pt].image:R.image[Pt],vt[Pt]=se(R,vt[Pt]);const gt=vt[0],Ft=u.convert(R.format,R.colorSpace),X=u.convert(R.type);let pt=U(R.internalFormat,Ft,X,R.normalized,R.colorSpace);const Rt=R.isVideoTexture!==!0,Xt=zt.__version===void 0||Nt===!0,bt=yt.dataReady;let Zt=C(R,gt);Wt(o.TEXTURE_CUBE_MAP,R);let oe;if(R.isDepthTexture){if(pt=E(R.format===tr,R.type),Xt)if(Rt)i.texStorage2D(o.TEXTURE_CUBE_MAP,1,pt,gt.width,gt.height);else for(let Pt=0;Pt<6;Pt++)i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,pt,gt.width,gt.height,0,Ft,X,null)}else if(Ot){Rt&&Xt&&i.texStorage2D(o.TEXTURE_CUBE_MAP,Zt,pt,gt.width,gt.height);for(let Pt=0;Pt<6;Pt++){oe=vt[Pt].mipmaps;for(let Ze=0;Ze<oe.length;Ze++){const Lt=oe[Ze];R.format!==Ha?Ft!==null?Rt?bt&&i.compressedTexSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ze,0,0,Lt.width,Lt.height,Ft,Lt.data):i.compressedTexImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ze,pt,Lt.width,Lt.height,0,Lt.data):_e("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Rt?bt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ze,0,0,Lt.width,Lt.height,Ft,X,Lt.data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ze,pt,Lt.width,Lt.height,0,Ft,X,Lt.data)}}}else{if(oe=R.mipmaps,Rt&&Xt){oe.length>0&&Zt++;const Pt=ie(vt[0]);i.texStorage2D(o.TEXTURE_CUBE_MAP,Zt,pt,Pt.width,Pt.height)}for(let Pt=0;Pt<6;Pt++)if(F){Rt?bt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,0,0,vt[Pt].width,vt[Pt].height,Ft,X,vt[Pt].data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,pt,vt[Pt].width,vt[Pt].height,0,Ft,X,vt[Pt].data);for(let Ze=0;Ze<oe.length;Ze++){const Dt=oe[Ze].image[Pt].image;Rt?bt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ze+1,0,0,Dt.width,Dt.height,Ft,X,Dt.data):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ze+1,pt,Dt.width,Dt.height,0,Ft,X,Dt.data)}}else{Rt?bt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,0,0,Ft,X,vt[Pt]):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,pt,Ft,X,vt[Pt]);for(let Ze=0;Ze<oe.length;Ze++){const Lt=oe[Ze];Rt?bt&&i.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ze+1,0,0,Ft,X,Lt.image[Pt]):i.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ze+1,pt,Ft,X,Lt.image[Pt])}}}P(R)&&R.mipmapsAutoUpdate===!0&&L(o.TEXTURE_CUBE_MAP),zt.__version=yt.version,R.onUpdate&&R.onUpdate(R)}O.__version=R.version}function re(O,R,it,Nt,yt,zt){const Bt=u.convert(it.format,it.colorSpace),mt=u.convert(it.type),_t=U(it.internalFormat,Bt,mt,it.normalized,it.colorSpace),Ot=s.get(R),F=s.get(it);if(F.__renderTarget=R,!Ot.__hasExternalTextures){const vt=Math.max(1,R.width>>zt),gt=Math.max(1,R.height>>zt);yt===o.TEXTURE_3D||yt===o.TEXTURE_2D_ARRAY?i.texImage3D(yt,zt,_t,vt,gt,R.depth,0,Bt,mt,null):i.texImage2D(yt,zt,_t,vt,gt,0,Bt,mt,null)}i.bindFramebuffer(o.FRAMEBUFFER,O),Ht(R)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,Nt,yt,F.__webglTexture,0,Ue(R)):(yt===o.TEXTURE_2D||yt>=o.TEXTURE_CUBE_MAP_POSITIVE_X&&yt<=o.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&o.framebufferTexture2D(o.FRAMEBUFFER,Nt,yt,F.__webglTexture,zt),i.bindFramebuffer(o.FRAMEBUFFER,null)}function gn(O,R,it){if(o.bindRenderbuffer(o.RENDERBUFFER,O),R.depthBuffer){const Nt=R.depthTexture,yt=Nt&&Nt.isDepthTexture?Nt.type:null,zt=E(R.stencilBuffer,yt),Bt=R.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;Ht(R)?d.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,Ue(R),zt,R.width,R.height):it?o.renderbufferStorageMultisample(o.RENDERBUFFER,Ue(R),zt,R.width,R.height):o.renderbufferStorage(o.RENDERBUFFER,zt,R.width,R.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,Bt,o.RENDERBUFFER,O)}else{const Nt=R.textures;for(let yt=0;yt<Nt.length;yt++){const zt=Nt[yt],Bt=u.convert(zt.format,zt.colorSpace),mt=u.convert(zt.type),_t=U(zt.internalFormat,Bt,mt,zt.normalized,zt.colorSpace);Ht(R)?d.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,Ue(R),_t,R.width,R.height):it?o.renderbufferStorageMultisample(o.RENDERBUFFER,Ue(R),_t,R.width,R.height):o.renderbufferStorage(o.RENDERBUFFER,_t,R.width,R.height)}}o.bindRenderbuffer(o.RENDERBUFFER,null)}function Ne(O,R,it){const Nt=R.isWebGLCubeRenderTarget===!0;if(i.bindFramebuffer(o.FRAMEBUFFER,O),!(R.depthTexture&&R.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const yt=s.get(R.depthTexture);yt.__renderTarget=R;const zt=Nt?R.depthTexture.image[0]:R.depthTexture.image;(!yt.__webglTexture||zt.width!==R.width||zt.height!==R.height)&&(zt.width=R.width,zt.height=R.height,R.depthTexture.needsUpdate=!0),Nt?Ct(R.depthTexture,0):$(R.depthTexture,0);const Bt=yt.__webglTexture,mt=Ue(R),_t=Nt?o.TEXTURE_CUBE_MAP_POSITIVE_X+it:o.TEXTURE_2D,Ot=R.depthTexture.format===tr?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;if(R.depthTexture.format===er)Ht(R)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,Ot,_t,Bt,0,mt):o.framebufferTexture2D(o.FRAMEBUFFER,Ot,_t,Bt,0);else if(R.depthTexture.format===tr)Ht(R)?d.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,Ot,_t,Bt,0,mt):o.framebufferTexture2D(o.FRAMEBUFFER,Ot,_t,Bt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function vn(O){const R=s.get(O),it=O.isWebGLCubeRenderTarget===!0;if(R.__boundDepthTexture!==O.depthTexture){const Nt=O.depthTexture;if(R.__depthDisposeCallback&&R.__depthDisposeCallback(),Nt){const yt=()=>{delete R.__boundDepthTexture,delete R.__depthDisposeCallback,Nt.removeEventListener("dispose",yt)};Nt.addEventListener("dispose",yt),R.__depthDisposeCallback=yt}R.__boundDepthTexture=Nt}if(O.depthTexture&&!R.__autoAllocateDepthBuffer)if(it)for(let Nt=0;Nt<6;Nt++)Ne(R.__webglFramebuffer[Nt],O,Nt);else O.texture.mipmaps.length>0?Ne(R.__webglFramebuffer[0],O,0):Ne(R.__webglFramebuffer,O,0);else if(it){R.__webglDepthbuffer=[];for(let Nt=0;Nt<6;Nt++)if(i.bindFramebuffer(o.FRAMEBUFFER,R.__webglFramebuffer[Nt]),R.__webglDepthbuffer[Nt]===void 0)R.__webglDepthbuffer[Nt]=o.createRenderbuffer(),gn(R.__webglDepthbuffer[Nt],O,!1);else{const yt=O.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,zt=R.__webglDepthbuffer[Nt];o.bindRenderbuffer(o.RENDERBUFFER,zt),o.framebufferRenderbuffer(o.FRAMEBUFFER,yt,o.RENDERBUFFER,zt)}}else if(O.texture.mipmaps.length>0?i.bindFramebuffer(o.FRAMEBUFFER,R.__webglFramebuffer[0]):i.bindFramebuffer(o.FRAMEBUFFER,R.__webglFramebuffer),R.__webglDepthbuffer===void 0)R.__webglDepthbuffer=o.createRenderbuffer(),gn(R.__webglDepthbuffer,O,!1);else{const yt=O.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,zt=R.__webglDepthbuffer;o.bindRenderbuffer(o.RENDERBUFFER,zt),o.framebufferRenderbuffer(o.FRAMEBUFFER,yt,o.RENDERBUFFER,zt)}i.bindFramebuffer(o.FRAMEBUFFER,null)}function Cn(O,R,it){const Nt=s.get(O);R!==void 0&&re(Nt.__webglFramebuffer,O,O.texture,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,0),it!==void 0&&vn(O)}function An(O){const R=O.texture,it=s.get(O),Nt=s.get(R);O.addEventListener("dispose",J),W(O);const yt=O.textures,zt=O.isWebGLCubeRenderTarget===!0,Bt=yt.length>1;if(Bt||(Nt.__webglTexture===void 0&&(Nt.__webglTexture=o.createTexture()),Nt.__version=R.version,h.memory.textures++),zt){it.__webglFramebuffer=[];for(let mt=0;mt<6;mt++)if(R.mipmaps.length>0){it.__webglFramebuffer[mt]=[];for(let _t=0;_t<R.mipmaps.length;_t++)it.__webglFramebuffer[mt][_t]=o.createFramebuffer()}else it.__webglFramebuffer[mt]=o.createFramebuffer()}else{if(R.mipmaps.length>0){it.__webglFramebuffer=[];for(let mt=0;mt<R.mipmaps.length;mt++)it.__webglFramebuffer[mt]=o.createFramebuffer()}else it.__webglFramebuffer=o.createFramebuffer();if(Bt)for(let mt=0,_t=yt.length;mt<_t;mt++){const Ot=s.get(yt[mt]);Ot.__webglTexture===void 0&&(Ot.__webglTexture=o.createTexture(),h.memory.textures++)}if(O.samples>0&&Ht(O)===!1){it.__webglMultisampledFramebuffer=o.createFramebuffer(),it.__webglColorRenderbuffer=[],i.bindFramebuffer(o.FRAMEBUFFER,it.__webglMultisampledFramebuffer);for(let mt=0;mt<yt.length;mt++){const _t=yt[mt];it.__webglColorRenderbuffer[mt]=o.createRenderbuffer(),o.bindRenderbuffer(o.RENDERBUFFER,it.__webglColorRenderbuffer[mt]);const Ot=u.convert(_t.format,_t.colorSpace),F=u.convert(_t.type),vt=U(_t.internalFormat,Ot,F,_t.normalized,_t.colorSpace,O.isXRRenderTarget===!0),gt=Ue(O);o.renderbufferStorageMultisample(o.RENDERBUFFER,gt,vt,O.width,O.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+mt,o.RENDERBUFFER,it.__webglColorRenderbuffer[mt])}o.bindRenderbuffer(o.RENDERBUFFER,null),O.depthBuffer&&(it.__webglDepthRenderbuffer=o.createRenderbuffer(),gn(it.__webglDepthRenderbuffer,O,!0)),i.bindFramebuffer(o.FRAMEBUFFER,null)}}if(zt){i.bindTexture(o.TEXTURE_CUBE_MAP,Nt.__webglTexture),Wt(o.TEXTURE_CUBE_MAP,R);for(let mt=0;mt<6;mt++)if(R.mipmaps.length>0)for(let _t=0;_t<R.mipmaps.length;_t++)re(it.__webglFramebuffer[mt][_t],O,R,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,_t);else re(it.__webglFramebuffer[mt],O,R,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0);P(R)?L(o.TEXTURE_CUBE_MAP):R.mipmaps.length>0&&o.texParameteri(o.TEXTURE_CUBE_MAP,o.TEXTURE_MAX_LEVEL,R.mipmaps.length-1),i.unbindTexture()}else if(Bt){for(let mt=0,_t=yt.length;mt<_t;mt++){const Ot=yt[mt],F=s.get(Ot);let vt=o.TEXTURE_2D;(O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(vt=O.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY),i.bindTexture(vt,F.__webglTexture),Wt(vt,Ot),re(it.__webglFramebuffer,O,Ot,o.COLOR_ATTACHMENT0+mt,vt,0),P(Ot)&&L(vt)}i.unbindTexture()}else{let mt=o.TEXTURE_2D;if((O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(mt=O.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY),i.bindTexture(mt,Nt.__webglTexture),Wt(mt,R),R.mipmaps.length>0)for(let _t=0;_t<R.mipmaps.length;_t++)re(it.__webglFramebuffer[_t],O,R,o.COLOR_ATTACHMENT0,mt,_t);else re(it.__webglFramebuffer,O,R,o.COLOR_ATTACHMENT0,mt,0);P(R)?L(mt):R.mipmaps.length>0&&o.texParameteri(mt,o.TEXTURE_MAX_LEVEL,R.mipmaps.length-1),i.unbindTexture()}O.depthBuffer&&vn(O)}function j(O){const R=O.textures;for(let it=0,Nt=R.length;it<Nt;it++){const yt=R[it];if(P(yt)&&yt.mipmapsAutoUpdate===!0){const zt=I(O),Bt=s.get(yt).__webglTexture;i.bindTexture(zt,Bt),L(zt),i.unbindTexture()}}}const _n=[];function Ye(O){if(O.samples>0){if(Ht(O)===!1){const R=O.textures,it=O.width,Nt=O.height;let yt=o.COLOR_BUFFER_BIT;const zt=O.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,Bt=s.get(O),mt=R.length>1;if(mt)for(let Ot=0;Ot<R.length;Ot++)i.bindFramebuffer(o.FRAMEBUFFER,Bt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ot,o.RENDERBUFFER,null),i.bindFramebuffer(o.FRAMEBUFFER,Bt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ot,o.TEXTURE_2D,null,0);i.bindFramebuffer(o.READ_FRAMEBUFFER,Bt.__webglMultisampledFramebuffer),O.texture.mipmaps.length>0?i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Bt.__webglFramebuffer[0]):i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Bt.__webglFramebuffer);for(let Ot=0;Ot<R.length;Ot++){if(O.resolveDepthBuffer&&(O.depthBuffer&&(yt|=o.DEPTH_BUFFER_BIT),O.stencilBuffer&&O.resolveStencilBuffer&&(yt|=o.STENCIL_BUFFER_BIT)),mt){o.framebufferRenderbuffer(o.READ_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.RENDERBUFFER,Bt.__webglColorRenderbuffer[Ot]);const F=s.get(R[Ot]).__webglTexture;o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,F,0)}o.blitFramebuffer(0,0,it,Nt,0,0,it,Nt,yt,o.NEAREST),m===!0&&(_n.length=0,_n.push(o.COLOR_ATTACHMENT0+Ot),O.depthBuffer&&O.storeMultisampledDepthBuffer===!1&&_n.push(zt),o.invalidateFramebuffer(o.READ_FRAMEBUFFER,_n))}if(i.bindFramebuffer(o.READ_FRAMEBUFFER,null),i.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),mt)for(let Ot=0;Ot<R.length;Ot++){i.bindFramebuffer(o.FRAMEBUFFER,Bt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ot,o.RENDERBUFFER,Bt.__webglColorRenderbuffer[Ot]);const F=s.get(R[Ot]).__webglTexture;i.bindFramebuffer(o.FRAMEBUFFER,Bt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+Ot,o.TEXTURE_2D,F,0)}i.bindFramebuffer(o.DRAW_FRAMEBUFFER,Bt.__webglMultisampledFramebuffer)}else if(O.depthBuffer&&O.storeMultisampledDepthBuffer===!1&&m){const R=O.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,[R])}}}function Ue(O){return Math.min(l.maxSamples,O.samples)}function Ht(O){const R=s.get(O);return O.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&R.__useRenderToTexture!==!1}function Be(O){const R=h.render.frame;S.get(O)!==R&&(S.set(O,R),O.update())}function se(O,R){const it=O.colorSpace,Nt=O.format,yt=O.type;return O.isCompressedTexture===!0||O.isVideoTexture===!0||it!==Df&&it!==Js&&(Qe.getTransfer(it)===hn?(Nt!==Ha||yt!==ji)&&_e("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):en("WebGLTextures: Unsupported texture color space:",it)),R}function ie(O){return typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement?(p.width=O.naturalWidth||O.width,p.height=O.naturalHeight||O.height):typeof VideoFrame<"u"&&O instanceof VideoFrame?(p.width=O.displayWidth,p.height=O.displayHeight):(p.width=O.width,p.height=O.height),p}this.allocateTextureUnit=ae,this.resetTextureUnits=ht,this.getTextureUnits=Tt,this.setTextureUnits=Vt,this.setTexture2D=$,this.setTexture2DArray=xt,this.setTexture3D=At,this.setTextureCube=Ct,this.rebindTextures=Cn,this.setupRenderTarget=An,this.updateRenderTargetMipmap=j,this.updateMultisampleRenderTarget=Ye,this.setupDepthRenderbuffer=vn,this.setupFrameBufferTexture=re,this.useMultisampledRTT=Ht,this.dispose=st}function i3(o,t){function i(s,l=Js){let u;const h=Qe.getTransfer(l);if(s===ji)return o.UNSIGNED_BYTE;if(s===t0)return o.UNSIGNED_SHORT_4_4_4_4;if(s===e0)return o.UNSIGNED_SHORT_5_5_5_1;if(s===oy)return o.UNSIGNED_INT_5_9_9_9_REV;if(s===ly)return o.UNSIGNED_INT_10F_11F_11F_REV;if(s===sy)return o.BYTE;if(s===ry)return o.SHORT;if(s===Sc)return o.UNSIGNED_SHORT;if(s===$m)return o.INT;if(s===Va)return o.UNSIGNED_INT;if(s===Ma)return o.FLOAT;if(s===Xa)return o.HALF_FLOAT;if(s===cy)return o.ALPHA;if(s===uy)return o.RGB;if(s===Ha)return o.RGBA;if(s===er)return o.DEPTH_COMPONENT;if(s===tr)return o.DEPTH_STENCIL;if(s===n0)return o.RED;if(s===i0)return o.RED_INTEGER;if(s===Nr)return o.RG;if(s===a0)return o.RG_INTEGER;if(s===s0)return o.RGBA_INTEGER;if(s===Mf||s===Ef||s===bf||s===Tf)if(h===hn)if(u=t.get("WEBGL_compressed_texture_s3tc_srgb"),u!==null){if(s===Mf)return u.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Ef)return u.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===bf)return u.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Tf)return u.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(u=t.get("WEBGL_compressed_texture_s3tc"),u!==null){if(s===Mf)return u.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Ef)return u.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===bf)return u.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Tf)return u.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===um||s===fm||s===hm||s===dm)if(u=t.get("WEBGL_compressed_texture_pvrtc"),u!==null){if(s===um)return u.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===fm)return u.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===hm)return u.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===dm)return u.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===pm||s===mm||s===gm||s===vm||s===_m||s===Cf||s===xm)if(u=t.get("WEBGL_compressed_texture_etc"),u!==null){if(s===pm||s===mm)return h===hn?u.COMPRESSED_SRGB8_ETC2:u.COMPRESSED_RGB8_ETC2;if(s===gm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:u.COMPRESSED_RGBA8_ETC2_EAC;if(s===vm)return u.COMPRESSED_R11_EAC;if(s===_m)return u.COMPRESSED_SIGNED_R11_EAC;if(s===Cf)return u.COMPRESSED_RG11_EAC;if(s===xm)return u.COMPRESSED_SIGNED_RG11_EAC}else return null;if(s===Sm||s===ym||s===Mm||s===Em||s===bm||s===Tm||s===Am||s===Rm||s===wm||s===Cm||s===Nm||s===Dm||s===Lm||s===Um)if(u=t.get("WEBGL_compressed_texture_astc"),u!==null){if(s===Sm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:u.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===ym)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:u.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Mm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:u.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Em)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:u.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===bm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:u.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Tm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:u.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Am)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:u.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Rm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:u.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===wm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:u.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Cm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:u.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Nm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:u.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Dm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:u.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Lm)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:u.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Um)return h===hn?u.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:u.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Om||s===Pm||s===Im)if(u=t.get("EXT_texture_compression_bptc"),u!==null){if(s===Om)return h===hn?u.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:u.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Pm)return u.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Im)return u.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===zm||s===Bm||s===Nf||s===Fm)if(u=t.get("EXT_texture_compression_rgtc"),u!==null){if(s===zm)return u.COMPRESSED_RED_RGTC1_EXT;if(s===Bm)return u.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Nf)return u.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Fm)return u.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Ko?o.UNSIGNED_INT_24_8:o[s]!==void 0?o[s]:null}return{convert:i}}const a3=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,s3=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class r3{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,i){if(this.texture===null){const s=new Ay(t.texture);(t.depthNear!==i.depthNear||t.depthFar!==i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const i=t.cameras[0].viewport,s=new Dr({vertexShader:a3,fragmentShader:s3,uniforms:{depthColor:{value:this.texture},depthWidth:{value:i.z},depthHeight:{value:i.w}}});this.mesh=new Ce(new Jo(20,20),s)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class o3 extends Lr{constructor(t,i){super();const s=this;let l=null,u=1,h=null,d="local-floor",m=1,p=null,S=null,g=null,_=null,x=null,b=null;const A=typeof XRWebGLBinding<"u",y=new r3,M={},N=i.getContextAttributes();let P=null,L=null;const I=[],U=[],E=new te;let C=null,W=null;const H=new oa;H.viewport=new Dn;const K=new oa;K.viewport=new Dn;const J=[H,K],ut=new g1;let V=null,st=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(D){let $=I[D];return $===void 0&&($=new Cp,I[D]=$),$.getTargetRaySpace()},this.getControllerGrip=function(D){let $=I[D];return $===void 0&&($=new Cp,I[D]=$),$.getGripSpace()},this.getHand=function(D){let $=I[D];return $===void 0&&($=new Cp,I[D]=$),$.getHandSpace()};function k(D){const $=U.indexOf(D.inputSource);if($===-1)return;const xt=I[$];xt!==void 0&&(xt.update(D.inputSource,D.frame,p||h),xt.dispatchEvent({type:D.type,data:D.inputSource}))}function Y(){l.removeEventListener("select",k),l.removeEventListener("selectstart",k),l.removeEventListener("selectend",k),l.removeEventListener("squeeze",k),l.removeEventListener("squeezestart",k),l.removeEventListener("squeezeend",k),l.removeEventListener("end",Y),l.removeEventListener("inputsourceschange",dt);for(let D=0;D<I.length;D++){const $=U[D];$!==null&&(U[D]=null,I[D].disconnect($))}V=null,st=null,y.reset();for(const D in M)delete M[D];if(t.setRenderTarget(P),x=null,_=null,g=null,l=null,L=null,ae.stop(),s.isPresenting=!1,t.setPixelRatio(C),t.setSize(E.width,E.height,!1),W!==null){const D=W.camera;D.fov=W.fov,D.zoom=W.zoom,D.updateProjectionMatrix(),W=null}s.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(D){u=D,s.isPresenting===!0&&_e("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(D){d=D,s.isPresenting===!0&&_e("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return p||h},this.setReferenceSpace=function(D){p=D},this.getBaseLayer=function(){return _!==null?_:x},this.getBinding=function(){return g===null&&A&&(g=new XRWebGLBinding(l,i)),g},this.getFrame=function(){return b},this.getSession=function(){return l},this.setSession=async function(D){if(l=D,l!==null){if(P=t.getRenderTarget(),l.addEventListener("select",k),l.addEventListener("selectstart",k),l.addEventListener("selectend",k),l.addEventListener("squeeze",k),l.addEventListener("squeezestart",k),l.addEventListener("squeezeend",k),l.addEventListener("end",Y),l.addEventListener("inputsourceschange",dt),N.xrCompatible!==!0&&await i.makeXRCompatible(),C=t.getPixelRatio(),t.getSize(E),A&&"createProjectionLayer"in XRWebGLBinding.prototype){let xt=null,At=null,Ct=null;N.depth&&(Ct=N.stencil?i.DEPTH24_STENCIL8:i.DEPTH_COMPONENT24,xt=N.stencil?tr:er,At=N.stencil?Ko:Va);const qt={colorFormat:i.RGBA8,depthFormat:Ct,scaleFactor:u};g=this.getBinding(),_=g.createProjectionLayer(qt),l.updateRenderState({layers:[_]}),t.setPixelRatio(1),t.setSize(_.textureWidth,_.textureHeight,!1),L=new Ga(_.textureWidth,_.textureHeight,{format:Ha,type:ji,depthTexture:new Qo(_.textureWidth,_.textureHeight,At,void 0,void 0,void 0,void 0,void 0,void 0,xt),stencilBuffer:N.stencil,colorSpace:t.outputColorSpace,samples:N.antialias?4:0,resolveDepthBuffer:_.ignoreDepthValues===!1,resolveStencilBuffer:_.ignoreDepthValues===!1,storeMultisampledDepthBuffer:_.ignoreDepthValues===!1,storeMultisampledStencilBuffer:_.ignoreDepthValues===!1})}else{const xt={antialias:N.antialias,alpha:!0,depth:N.depth,stencil:N.stencil,framebufferScaleFactor:u};x=new XRWebGLLayer(l,i,xt),l.updateRenderState({baseLayer:x}),t.setPixelRatio(1),t.setSize(x.framebufferWidth,x.framebufferHeight,!1),L=new Ga(x.framebufferWidth,x.framebufferHeight,{format:Ha,type:ji,colorSpace:t.outputColorSpace,stencilBuffer:N.stencil,resolveDepthBuffer:x.ignoreDepthValues===!1,resolveStencilBuffer:x.ignoreDepthValues===!1,storeMultisampledDepthBuffer:x.ignoreDepthValues===!1,storeMultisampledStencilBuffer:x.ignoreDepthValues===!1})}L.isXRRenderTarget=!0,this.setFoveation(m),p=null,h=await l.requestReferenceSpace(d),ae.setContext(l),ae.start(),s.isPresenting=!0,s.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(l!==null)return l.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function dt(D){for(let $=0;$<D.removed.length;$++){const xt=D.removed[$],At=U.indexOf(xt);At>=0&&(U[At]=null,I[At].disconnect(xt))}for(let $=0;$<D.added.length;$++){const xt=D.added[$];let At=U.indexOf(xt);if(At===-1){for(let qt=0;qt<I.length;qt++)if(qt>=U.length){U.push(xt),At=qt;break}else if(U[qt]===null){U[qt]=xt,At=qt;break}if(At===-1)break}const Ct=I[At];Ct&&Ct.connect(xt)}}function ot(D,$){$===null?D.matrixWorld.copy(D.matrix):D.matrixWorld.multiplyMatrices($.matrixWorld,D.matrix),D.matrixWorldInverse.copy(D.matrixWorld).invert()}this.updateCamera=function(D){if(l===null)return;let $=D.near,xt=D.far;y.texture!==null&&(y.depthNear>0&&($=y.depthNear),y.depthFar>0&&(xt=y.depthFar)),ut.near=K.near=H.near=$,ut.far=K.far=H.far=xt,(V!==ut.near||st!==ut.far)&&(l.updateRenderState({depthNear:ut.near,depthFar:ut.far}),V=ut.near,st=ut.far),ut.layers.mask=D.layers.mask|6,H.layers.mask=ut.layers.mask&-5,K.layers.mask=ut.layers.mask&-3;const At=D.parent,Ct=ut.cameras;ot(ut,At);for(let qt=0;qt<Ct.length;qt++)ot(Ct[qt],At);ut.projectionMatrix.copy(H.projectionMatrix),ut.projectionMatrixInverse.copy(H.projectionMatrixInverse),W===null&&D.isPerspectiveCamera&&(W={camera:D,fov:D.fov,zoom:D.zoom}),ht(D,ut,At)};function ht(D,$,xt){xt===null?D.matrix.copy($.matrixWorld):(D.matrix.copy(xt.matrixWorld),D.matrix.invert(),D.matrix.multiply($.matrixWorld)),D.matrix.decompose(D.position,D.quaternion,D.scale),D.updateMatrixWorld(!0),D.projectionMatrix.copy($.projectionMatrix),D.projectionMatrixInverse.copy($.projectionMatrixInverse),D.isPerspectiveCamera&&(D.fov=Gm*2*Math.atan(1/D.projectionMatrix.elements[5]),D.zoom=1)}this.getCamera=function(){return ut},this.getFoveation=function(){if(!(_===null&&x===null))return m},this.setFoveation=function(D){m=D,_!==null&&(_.fixedFoveation=D),x!==null&&x.fixedFoveation!==void 0&&(x.fixedFoveation=D)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(ut)},this.getCameraTexture=function(D){return M[D]};let Tt=null;function Vt(D,$){if(S=$.getViewerPose(p||h),b=$,S!==null){const xt=S.views;x!==null&&(t.setRenderTargetFramebuffer(L,x.framebuffer),t.setRenderTarget(L));let At=!1;xt.length!==ut.cameras.length&&(ut.cameras.length=0,At=!0);for(let wt=0;wt<xt.length;wt++){const Wt=xt[wt];let de=null;if(x!==null)de=x.getViewport(Wt);else{const Ge=g.getViewSubImage(_,Wt);de=Ge.viewport,wt===0&&(t.setRenderTargetTextures(L,Ge.colorTexture,Ge.depthStencilTexture),t.setRenderTarget(L))}let Me=J[wt];Me===void 0&&(Me=new oa,Me.layers.enable(wt),Me.viewport=new Dn,J[wt]=Me),Me.matrix.fromArray(Wt.transform.matrix),Me.matrix.decompose(Me.position,Me.quaternion,Me.scale),Me.projectionMatrix.fromArray(Wt.projectionMatrix),Me.projectionMatrixInverse.copy(Me.projectionMatrix).invert(),Me.viewport.set(de.x,de.y,de.width,de.height),wt===0&&(ut.matrix.copy(Me.matrix),ut.matrix.decompose(ut.position,ut.quaternion,ut.scale)),At===!0&&ut.cameras.push(Me)}const Ct=l.enabledFeatures;if(Ct&&Ct.includes("depth-sensing")&&l.depthUsage=="gpu-optimized"&&A){g=s.getBinding();const wt=g.getDepthInformation(xt[0]);wt&&wt.isValid&&wt.texture&&y.init(wt,l.renderState)}if(Ct&&Ct.includes("camera-access")&&A){t.state.unbindTexture(),g=s.getBinding();for(let wt=0;wt<xt.length;wt++){const Wt=xt[wt].camera;if(Wt){let de=M[Wt];de||(de=new Ay,M[Wt]=de);const Me=g.getCameraImage(Wt);de.sourceTexture=Me}}}}for(let xt=0;xt<I.length;xt++){const At=U[xt],Ct=I[xt];At!==null&&Ct!==void 0&&Ct.update(At,$,p||h)}Tt&&Tt(D,$),$.detectedPlanes&&s.dispatchEvent({type:"planesdetected",data:$}),b=null}const ae=new Ly;ae.setAnimationLoop(Vt),this.setAnimationLoop=function(D){Tt=D},this.dispose=function(){}}}const l3=new sn,Vy=new Ae;Vy.set(-1,0,0,0,1,0,0,0,1);function c3(o,t){function i(y,M){y.matrixAutoUpdate===!0&&y.updateMatrix(),M.value.copy(y.matrix)}function s(y,M){M.color.getRGB(y.fogColor.value,wy(o)),M.isFog?(y.fogNear.value=M.near,y.fogFar.value=M.far):M.isFogExp2&&(y.fogDensity.value=M.density)}function l(y,M,N,P,L){M.isNodeMaterial?M.uniformsNeedUpdate=!1:M.isMeshBasicMaterial?u(y,M):M.isMeshLambertMaterial?(u(y,M),M.envMap&&(y.envMapIntensity.value=M.envMapIntensity)):M.isMeshToonMaterial?(u(y,M),g(y,M)):M.isMeshPhongMaterial?(u(y,M),S(y,M),M.envMap&&(y.envMapIntensity.value=M.envMapIntensity)):M.isMeshStandardMaterial?(u(y,M),_(y,M),M.isMeshPhysicalMaterial&&x(y,M,L)):M.isMeshMatcapMaterial?(u(y,M),b(y,M)):M.isMeshDepthMaterial?u(y,M):M.isMeshDistanceMaterial?(u(y,M),A(y,M)):M.isMeshNormalMaterial?u(y,M):M.isLineBasicMaterial?(h(y,M),M.isLineDashedMaterial&&d(y,M)):M.isPointsMaterial?m(y,M,N,P):M.isSpriteMaterial?p(y,M):M.isShadowMaterial?(y.color.value.copy(M.color),y.opacity.value=M.opacity):M.isShaderMaterial&&(M.uniformsNeedUpdate=!1)}function u(y,M){y.opacity.value=M.opacity,M.color&&y.diffuse.value.copy(M.color),M.emissive&&y.emissive.value.copy(M.emissive).multiplyScalar(M.emissiveIntensity),M.map&&(y.map.value=M.map,i(M.map,y.mapTransform)),M.alphaMap&&(y.alphaMap.value=M.alphaMap,i(M.alphaMap,y.alphaMapTransform)),M.bumpMap&&(y.bumpMap.value=M.bumpMap,i(M.bumpMap,y.bumpMapTransform),y.bumpScale.value=M.bumpScale,M.side===zi&&(y.bumpScale.value*=-1)),M.normalMap&&(y.normalMap.value=M.normalMap,i(M.normalMap,y.normalMapTransform),y.normalScale.value.copy(M.normalScale),M.side===zi&&y.normalScale.value.negate()),M.displacementMap&&(y.displacementMap.value=M.displacementMap,i(M.displacementMap,y.displacementMapTransform),y.displacementScale.value=M.displacementScale,y.displacementBias.value=M.displacementBias),M.emissiveMap&&(y.emissiveMap.value=M.emissiveMap,i(M.emissiveMap,y.emissiveMapTransform)),M.specularMap&&(y.specularMap.value=M.specularMap,i(M.specularMap,y.specularMapTransform)),M.alphaTest>0&&(y.alphaTest.value=M.alphaTest);const N=t.get(M),P=N.envMap,L=N.envMapRotation;P&&(y.envMap.value=P,y.envMapRotation.value.setFromMatrix4(l3.makeRotationFromEuler(L)).transpose(),P.isCubeTexture&&P.isRenderTargetTexture===!1&&y.envMapRotation.value.premultiply(Vy),y.reflectivity.value=M.reflectivity,y.ior.value=M.ior,y.refractionRatio.value=M.refractionRatio),M.lightMap&&(y.lightMap.value=M.lightMap,y.lightMapIntensity.value=M.lightMapIntensity,i(M.lightMap,y.lightMapTransform)),M.aoMap&&(y.aoMap.value=M.aoMap,y.aoMapIntensity.value=M.aoMapIntensity,i(M.aoMap,y.aoMapTransform))}function h(y,M){y.diffuse.value.copy(M.color),y.opacity.value=M.opacity,M.map&&(y.map.value=M.map,i(M.map,y.mapTransform))}function d(y,M){y.dashSize.value=M.dashSize,y.totalSize.value=M.dashSize+M.gapSize,y.scale.value=M.scale}function m(y,M,N,P){y.diffuse.value.copy(M.color),y.opacity.value=M.opacity,y.size.value=M.size*N,y.scale.value=P*.5,M.map&&(y.map.value=M.map,i(M.map,y.uvTransform)),M.alphaMap&&(y.alphaMap.value=M.alphaMap,i(M.alphaMap,y.alphaMapTransform)),M.alphaTest>0&&(y.alphaTest.value=M.alphaTest)}function p(y,M){y.diffuse.value.copy(M.color),y.opacity.value=M.opacity,y.rotation.value=M.rotation,M.map&&(y.map.value=M.map,i(M.map,y.mapTransform)),M.alphaMap&&(y.alphaMap.value=M.alphaMap,i(M.alphaMap,y.alphaMapTransform)),M.alphaTest>0&&(y.alphaTest.value=M.alphaTest)}function S(y,M){y.specular.value.copy(M.specular),y.shininess.value=Math.max(M.shininess,1e-4)}function g(y,M){M.gradientMap&&(y.gradientMap.value=M.gradientMap)}function _(y,M){y.metalness.value=M.metalness,M.metalnessMap&&(y.metalnessMap.value=M.metalnessMap,i(M.metalnessMap,y.metalnessMapTransform)),y.roughness.value=M.roughness,M.roughnessMap&&(y.roughnessMap.value=M.roughnessMap,i(M.roughnessMap,y.roughnessMapTransform)),M.envMap&&(y.envMapIntensity.value=M.envMapIntensity)}function x(y,M,N){y.ior.value=M.ior,M.diffuseRoughness>0&&(y.diffuseRoughness.value=M.diffuseRoughness,M.diffuseRoughnessMap&&(y.diffuseRoughnessMap.value=M.diffuseRoughnessMap,i(M.diffuseRoughnessMap,y.diffuseRoughnessMapTransform))),M.sheen>0&&(y.sheenColor.value.copy(M.sheenColor).multiplyScalar(M.sheen),y.sheenRoughness.value=M.sheenRoughness,M.sheenColorMap&&(y.sheenColorMap.value=M.sheenColorMap,i(M.sheenColorMap,y.sheenColorMapTransform)),M.sheenRoughnessMap&&(y.sheenRoughnessMap.value=M.sheenRoughnessMap,i(M.sheenRoughnessMap,y.sheenRoughnessMapTransform))),M.clearcoat>0&&(y.clearcoat.value=M.clearcoat,y.clearcoatRoughness.value=M.clearcoatRoughness,M.clearcoatMap&&(y.clearcoatMap.value=M.clearcoatMap,i(M.clearcoatMap,y.clearcoatMapTransform)),M.clearcoatRoughnessMap&&(y.clearcoatRoughnessMap.value=M.clearcoatRoughnessMap,i(M.clearcoatRoughnessMap,y.clearcoatRoughnessMapTransform)),M.clearcoatNormalMap&&(y.clearcoatNormalMap.value=M.clearcoatNormalMap,i(M.clearcoatNormalMap,y.clearcoatNormalMapTransform),y.clearcoatNormalScale.value.copy(M.clearcoatNormalScale),M.side===zi&&y.clearcoatNormalScale.value.negate())),M.dispersion>0&&(y.dispersion.value=M.dispersion),M.retroreflectivity>0&&(y.retroreflectivity.value=M.retroreflectivity),M.iridescence>0&&(y.iridescence.value=M.iridescence,y.iridescenceIOR.value=M.iridescenceIOR,y.iridescenceThicknessMinimum.value=M.iridescenceThicknessMinimum,y.iridescenceThicknessMaximum.value=M.iridescenceThicknessMaximum,M.iridescenceMap&&(y.iridescenceMap.value=M.iridescenceMap,i(M.iridescenceMap,y.iridescenceMapTransform)),M.iridescenceThicknessMap&&(y.iridescenceThicknessMap.value=M.iridescenceThicknessMap,i(M.iridescenceThicknessMap,y.iridescenceThicknessMapTransform))),M.transmission>0&&(y.transmission.value=M.transmission,y.transmissionSamplerMap.value=N.texture,y.transmissionSamplerSize.value.set(N.width,N.height),M.transmissionMap&&(y.transmissionMap.value=M.transmissionMap,i(M.transmissionMap,y.transmissionMapTransform)),y.thickness.value=M.thickness,M.thicknessMap&&(y.thicknessMap.value=M.thicknessMap,i(M.thicknessMap,y.thicknessMapTransform)),y.attenuationDistance.value=M.attenuationDistance,y.attenuationColor.value.copy(M.attenuationColor)),M.anisotropy>0&&(y.anisotropyVector.value.set(M.anisotropy*Math.cos(M.anisotropyRotation),M.anisotropy*Math.sin(M.anisotropyRotation)),M.anisotropyMap&&(y.anisotropyMap.value=M.anisotropyMap,i(M.anisotropyMap,y.anisotropyMapTransform))),y.specularIntensity.value=M.specularIntensity,y.specularColor.value.copy(M.specularColor),M.specularColorMap&&(y.specularColorMap.value=M.specularColorMap,i(M.specularColorMap,y.specularColorMapTransform)),M.specularIntensityMap&&(y.specularIntensityMap.value=M.specularIntensityMap,i(M.specularIntensityMap,y.specularIntensityMapTransform))}function b(y,M){M.matcap&&(y.matcap.value=M.matcap)}function A(y,M){const N=t.get(M).light;y.referencePosition.value.setFromMatrixPosition(N.matrixWorld),y.nearDistance.value=N.shadow.camera.near,y.farDistance.value=N.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:l}}function u3(o,t,i,s){let l={},u={};function h(N,P){const L=P.program;s.uniformBlockBinding(N,L,l[N.id])}function d(N,P){let L=l[N.id];L===void 0&&(b(N),L=m(N),l[N.id]=L,N.addEventListener("dispose",y));const I=P.program;s.updateUBOMapping(N,I);const U=t.render.frame;u[N.id]!==U&&(p(N),u[N.id]=U)}function m(N){const P=o.createBuffer(),L=N.__size,I=N.usage;return o.bindBuffer(o.UNIFORM_BUFFER,P),o.bufferData(o.UNIFORM_BUFFER,L,I),o.bindBuffer(o.UNIFORM_BUFFER,null),P}function p(N){const P=l[N.id],L=N.uniforms,I=N.__cache;o.bindBuffer(o.UNIFORM_BUFFER,P);for(let U=0,E=L.length;U<E;U++){const C=L[U];if(Array.isArray(C))for(let W=0,H=C.length;W<H;W++)S(C[W],U,W,I);else S(C,U,0,I)}o.bindBuffer(o.UNIFORM_BUFFER,null)}function S(N,P,L,I){if(_(N,P,L,I)===!0){const U=N.__offset,E=N.value;if(Array.isArray(E)){let C=0;for(let W=0;W<E.length;W++){const H=E[W],K=A(H,!0);g(H,N.__data,C),C+=K.storage/Float32Array.BYTES_PER_ELEMENT}}else g(E,N.__data,0);o.bufferSubData(o.UNIFORM_BUFFER,U,N.__data)}}function g(N,P,L){typeof N=="number"||typeof N=="boolean"?P[L]=N:N.isMatrix3?(P[L]=N.elements[0],P[L+1]=N.elements[1],P[L+2]=N.elements[2],P[L+3]=0,P[L+4]=N.elements[3],P[L+5]=N.elements[4],P[L+6]=N.elements[5],P[L+7]=0,P[L+8]=N.elements[6],P[L+9]=N.elements[7],P[L+10]=N.elements[8],P[L+11]=0):ArrayBuffer.isView(N)?P.set(N.subarray(0,P.length-L),L):N.toArray(P,L)}function _(N,P,L,I){const U=N.value,E=P+"_"+L;if(Array.isArray(U)){I[E]===void 0&&(I[E]=[]);const C=I[E];let W=!1;for(let H=0;H<U.length;H++)x(U[H],C,H)===!0&&(W=!0);return W}return x(U,I,E)}function x(N,P,L){if(P[L]===void 0)return typeof N=="number"||typeof N=="boolean"?P[L]=N:ArrayBuffer.isView(N)?P[L]=N.slice():P[L]=N.clone(),!0;{const I=P[L];if(typeof N=="number"||typeof N=="boolean"){if(I!==N)return P[L]=N,!0}else{if(ArrayBuffer.isView(N))return!0;if(I.equals(N)===!1)return I.copy(N),!0}}return!1}function b(N){const P=N.uniforms;let L=0;const I=16;for(let E=0,C=P.length;E<C;E++){const W=Array.isArray(P[E])?P[E]:[P[E]];for(let H=0,K=W.length;H<K;H++){const J=W[H],ut=Array.isArray(J.value)?J.value:[J.value],V=Array.isArray(P[E])||Array.isArray(J.value);let st=L;for(let Y=0,dt=ut.length;Y<dt;Y++){const ot=ut[Y],ht=A(ot,V),Tt=L%I,Vt=Tt%ht.boundary,ae=Tt+Vt;L+=Vt,ae!==0&&I-ae<ht.storage&&(L+=I-ae),Y===0&&(st=L),L+=ht.storage}const k=J.type==="int"?Int32Array:J.type==="uint"?Uint32Array:Float32Array;J.__data=new k((L-st)/Float32Array.BYTES_PER_ELEMENT),J.__offset=st}}const U=L%I;return U>0&&(L+=I-U),N.__size=L,N.__cache={},this}function A(N,P){const L={boundary:0,storage:0};return typeof N=="number"||typeof N=="boolean"?(L.boundary=4,L.storage=4):N.isVector2?(L.boundary=8,L.storage=8):N.isVector3||N.isColor?(L.boundary=16,L.storage=12):N.isVector4?(L.boundary=16,L.storage=16):N.isMatrix3?(L.boundary=16,L.storage=48):N.isMatrix4?(L.boundary=16,L.storage=64):N.isTexture?_e("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(N)?(L.boundary=16,L.storage=N.byteLength):_e("WebGLRenderer: Unsupported uniform value type.",N),P===!0&&(L.boundary=16,L.storage=Math.ceil(L.storage/16)*16),L}function y(N){const P=N.target;P.removeEventListener("dispose",y),o.deleteBuffer(l[P.id]),delete l[P.id],delete u[P.id]}function M(){for(const N in l)o.deleteBuffer(l[N]);l={},u={}}return{bind:h,update:d,dispose:M}}const f3=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Ba=null;function h3(){return Ba===null&&(Ba=new Ey(f3,16,16,Nr,Xa),Ba.name="DFG_LUT",Ba.minFilter=Ii,Ba.magFilter=Ii,Ba.wrapS=hs,Ba.wrapT=hs,Ba.generateMipmaps=!1,Ba.needsUpdate=!0),Ba}class d3{constructor(t={}){const{canvas:i=hT(),context:s=null,depth:l=!0,stencil:u=!1,alpha:h=!1,antialias:d=!1,premultipliedAlpha:m=!0,preserveDrawingBuffer:p=!1,powerPreference:S="default",failIfMajorPerformanceCaveat:g=!1,reversedDepthBuffer:_=!1,outputBufferType:x=ji}=t;this.isWebGLRenderer=!0;let b;if(s!==null){if(typeof WebGLRenderingContext<"u"&&s instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");b=s.getContextAttributes().alpha}else b=h;const A=x,y=new Set([s0,a0,i0]),M=new Set([ji,Va,Sc,Ko,t0,e0]),N=new Uint32Array(4),P=new Int32Array(4),L={textures:[],min:[],max:[],resolution:[]};let I=null,U=null;const E=[],C=[];let W=null;this.domElement=i,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ds,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const H=this;let K=!1,J=null,ut=null,V=null,st=null;this._outputColorSpace=di;let k=0,Y=0,dt=null,ot=-1,ht=null;const Tt=new Dn,Vt=new Dn;let ae=null;const D=new he(0);let $=0,xt=i.width,At=i.height,Ct=1,qt=null,le=null;const wt=new Dn(0,0,xt,At),Wt=new Dn(0,0,xt,At);let de=!1;const Me=new Mc,Ge=new c0;let Pe=!1,ze=!1;const re=new sn,gn=new Z,Ne=new Dn,vn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Cn=!1;function An(){return dt===null?Ct:1}let j=s;function _n(T,G){return i.getContext(T,G)}let Ye,Ue,Ht,Be,se,ie,O,R,it,Nt,yt,zt,Bt,mt,_t,Ot,F,vt,gt,Ft,X,pt,Rt;try{const T={alpha:!0,depth:l,stencil:u,antialias:d,premultipliedAlpha:m,preserveDrawingBuffer:p,powerPreference:S,failIfMajorPerformanceCaveat:g};if("setAttribute"in i&&i.setAttribute("data-engine",`three.js r${Jm}`),i.addEventListener("webglcontextlost",Zt,!1),i.addEventListener("webglcontextrestored",oe,!1),i.addEventListener("webglcontextcreationerror",Pt,!1),j===null){const G="webgl2";if(j=_n(G,T),j===null)throw _n(G)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Xt()}catch(T){throw i.removeEventListener("webglcontextlost",Zt,!1),i.removeEventListener("webglcontextrestored",oe,!1),i.removeEventListener("webglcontextcreationerror",Pt,!1),en("WebGLRenderer: "+T.message),T}function Xt(){Ye=new gw(j),Ye.init(),X=new i3(j,Ye),Ue=new sw(j,Ye,t,X),Ht=new e3(j,Ye),Ue.reversedDepthBuffer&&_&&Ht.buffers.depth.setReversed(!0),ut=j.createFramebuffer(),V=j.createFramebuffer(),st=j.createFramebuffer(),Be=new xw(j),se=new GC,ie=new n3(j,Ye,Ht,se,Ue,X,Be),O=new mw(H),R=new y1(j),pt=new iw(j,R),it=new vw(j,R,Be,pt),Nt=new yw(j,it,R,pt,Be),vt=new Sw(j,Ue,ie),_t=new rw(se),yt=new HC(H,O,Ye,Ue,pt,_t),zt=new c3(H,se),Bt=new XC,mt=new KC(Ye),F=new nw(H,O,Ht,Nt,b,m),Ot=new t3(H,Nt,Ue),Rt=new u3(j,Be,Ue,Ht),gt=new aw(j,Ye,Be),Ft=new _w(j,Ye,Be),Be.programs=yt.programs,H.capabilities=Ue,H.extensions=Ye,H.properties=se,H.renderLists=Bt,H.shadowMap=Ot,H.state=Ht,H.info=Be}A!==ji&&(W=new Ew(A,i.width,i.height,d,l,u));const bt=new o3(H,j);this.xr=bt,this.getContext=function(){return j},this.getContextAttributes=function(){return j.getContextAttributes()},this.forceContextLoss=function(){const T=Ye.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){const T=Ye.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return Ct},this.setPixelRatio=function(T){T!==void 0&&(Ct=T,this.setSize(xt,At,!1))},this.getSize=function(T){return T.set(xt,At)},this.setSize=function(T,G,lt=!0){if(bt.isPresenting){_e("WebGLRenderer: Can't change size while VR device is presenting.");return}xt=T,At=G,i.width=Math.floor(T*Ct),i.height=Math.floor(G*Ct),lt===!0&&(i.style.width=T+"px",i.style.height=G+"px"),W!==null&&W.setSize(i.width,i.height),this.setViewport(0,0,T,G)},this.getDrawingBufferSize=function(T){return T.set(xt*Ct,At*Ct).floor()},this.setDrawingBufferSize=function(T,G,lt){xt=T,At=G,Ct=lt,i.width=Math.floor(T*lt),i.height=Math.floor(G*lt),this.setViewport(0,0,T,G)},this.setEffects=function(T){if(A===ji){en("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let G=0;G<T.length;G++)if(T[G].isOutputPass===!0){_e("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}W.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(Tt)},this.getViewport=function(T){return T.copy(wt)},this.setViewport=function(T,G,lt,nt){T.isVector4?wt.set(T.x,T.y,T.z,T.w):wt.set(T,G,lt,nt),Ht.viewport(Tt.copy(wt).multiplyScalar(An()).round())},this.getScissor=function(T){return T.copy(Wt)},this.setScissor=function(T,G,lt,nt){T.isVector4?Wt.set(T.x,T.y,T.z,T.w):Wt.set(T,G,lt,nt),Ht.scissor(Vt.copy(Wt).multiplyScalar(An()).round())},this.getScissorTest=function(){return de},this.setScissorTest=function(T){Ht.setScissorTest(de=T)},this.setOpaqueSort=function(T){qt=T},this.setTransparentSort=function(T){le=T},this.getClearColor=function(T){return T.copy(F.getClearColor())},this.setClearColor=function(){F.setClearColor(...arguments)},this.getClearAlpha=function(){return F.getClearAlpha()},this.setClearAlpha=function(){F.setClearAlpha(...arguments)},this.clear=function(T=!0,G=!0,lt=!0){let nt=0;if(T){let at=!1;if(dt!==null){const Ut=dt.texture.format;at=y.has(Ut)}if(at){const Ut=dt.texture.type,Qt=M.has(Ut),It=F.getClearColor(),Gt=F.getClearAlpha(),Jt=It.r,me=It.g,Ee=It.b;Qt?(N[0]=Jt,N[1]=me,N[2]=Ee,N[3]=Gt,j.clearBufferuiv(j.COLOR,0,N)):(P[0]=Jt,P[1]=me,P[2]=Ee,P[3]=Gt,j.clearBufferiv(j.COLOR,0,P))}else nt|=j.COLOR_BUFFER_BIT}G&&(nt|=j.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),lt&&(nt|=j.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),nt!==0&&j.clear(nt)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),J=T},this.dispose=function(){i.removeEventListener("webglcontextlost",Zt,!1),i.removeEventListener("webglcontextrestored",oe,!1),i.removeEventListener("webglcontextcreationerror",Pt,!1),F.dispose(),Bt.dispose(),mt.dispose(),ie.dispose(),se.dispose(),O.dispose(),Nt.dispose(),it.dispose(),pt.dispose(),Rt.dispose(),yt.dispose(),bt.dispose(),bt.removeEventListener("sessionstart",pe),bt.removeEventListener("sessionend",Re),nn.stop()};function Zt(T){T.preventDefault(),Of("WebGLRenderer: Context Lost."),K=!0}function oe(){Of("WebGLRenderer: Context Restored."),K=!1;const T=Be.autoReset,G=Ot.enabled,lt=Ot.autoUpdate,nt=Ot.needsUpdate,at=Ot.type;Xt(),Be.autoReset=T,Ot.enabled=G,Ot.autoUpdate=lt,Ot.needsUpdate=nt,Ot.type=at}function Pt(T){en("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Ze(T){const G=T.target;G.removeEventListener("dispose",Ze),Lt(G)}function Lt(T){Dt(T),se.remove(T)}function Dt(T){const G=se.get(T).programs;G!==void 0&&(G.forEach(function(lt){yt.releaseProgram(lt)}),T.isShaderMaterial&&yt.releaseShaderCache(T))}this.renderBufferDirect=function(T,G,lt,nt,at,Ut){G===null&&(G=vn);const Qt=at.isMesh&&at.matrixWorld.determinantAffine()<0,It=Fn(T,G,lt,nt,at);Ht.setMaterial(nt,Qt);let Gt=lt.index,Jt=1;if(nt.wireframe===!0){if(Gt=it.getWireframeAttribute(lt),Gt===void 0)return;Jt=2}const me=lt.drawRange,Ee=lt.attributes.position;let kt=me.start*Jt,Se=(me.start+me.count)*Jt;Ut!==null&&(kt=Math.max(kt,Ut.start*Jt),Se=Math.min(Se,(Ut.start+Ut.count)*Jt)),Gt!==null?(kt=Math.max(kt,0),Se=Math.min(Se,Gt.count)):Ee!=null&&(kt=Math.max(kt,0),Se=Math.min(Se,Ee.count));const yn=Se-kt;if(yn<0||yn===1/0)return;pt.setup(at,nt,It,lt,Gt);let Ve,Fe=gt;if(Gt!==null&&(Ve=R.get(Gt),Fe=Ft,Fe.setIndex(Ve)),at.isMesh)nt.wireframe===!0?(Ht.setLineWidth(nt.wireframeLinewidth*An()),Fe.setMode(j.LINES)):Fe.setMode(j.TRIANGLES);else if(at.isLine){let bn=nt.linewidth;bn===void 0&&(bn=1),Ht.setLineWidth(bn*An()),at.isLineSegments?Fe.setMode(j.LINES):at.isLineLoop?Fe.setMode(j.LINE_LOOP):Fe.setMode(j.LINE_STRIP)}else at.isPoints?Fe.setMode(j.POINTS):at.isSprite&&Fe.setMode(j.TRIANGLES);if(at.isBatchedMesh)if(Ye.get("WEBGL_multi_draw"))Fe.renderMultiDraw(at._multiDrawStarts,at._multiDrawCounts,at._multiDrawCount);else{const bn=at._multiDrawStarts,ee=at._multiDrawCounts,Un=at._multiDrawCount,Xe=Gt?R.get(Gt).bytesPerElement:1,Qi=se.get(nt).currentProgram.getUniforms();for(let ge=0;ge<Un;ge++)Qi.setValue(j,"_gl_DrawID",ge),Fe.render(bn[ge]/Xe,ee[ge])}else if(at.isInstancedMesh)Fe.renderInstances(kt,yn,at.count);else if(lt.isInstancedBufferGeometry){const bn=lt._maxInstanceCount!==void 0?lt._maxInstanceCount:1/0,ee=Math.min(lt.instanceCount,bn);Fe.renderInstances(kt,yn,ee)}else Fe.render(kt,yn)};function ce(T,G,lt,nt){J!==null&&T.isNodeMaterial&&J.setObject(nt,T),Pe===!0&&_t.setState(T,lt,!1),T.transparent===!0&&T.side===Pi&&T.forceSinglePass===!1?(T.side=zi,T.needsUpdate=!0,rn(T,G,nt),T.side=Cr,T.needsUpdate=!0,rn(T,G,nt),T.side=Pi):rn(T,G,nt)}this.compile=function(T,G,lt=null){lt===null&&(lt=T),J!==null&&J.renderStart(T,G,lt),U=mt.get(lt),U.init(G),C.push(U),lt.traverseVisible(function(at){at.isLight&&at.layers.test(G.layers)&&(U.pushLight(at),at.castShadow&&U.pushShadow(at))}),T!==lt&&T.traverseVisible(function(at){at.isLight&&at.layers.test(G.layers)&&(U.pushLight(at),at.castShadow&&U.pushShadow(at))}),U.setupLights(),J!==null&&J.updateLights(U.state.lightsArray),ze=this.localClippingEnabled,Pe=_t.init(this.clippingPlanes,ze),Pe===!0&&_t.setGlobalState(this.clippingPlanes,G),J!==null&&Ot.render(U.state.shadowsArray,lt,G);const nt=new Set;return T.traverse(function(at){if(!(at.isMesh||at.isPoints||at.isLine||at.isSprite))return;const Ut=at.material;if(Ut)if(Array.isArray(Ut))for(let Qt=0;Qt<Ut.length;Qt++){const It=Ut[Qt];ce(It,lt,G,at),nt.add(It)}else ce(Ut,lt,G,at),nt.add(Ut)}),U=C.pop(),J!==null&&J.renderEnd(),nt},this.compileAsync=function(T,G,lt=null){const nt=this.compile(T,G,lt);return new Promise(at=>{function Ut(){if(nt.forEach(function(Qt){const Gt=se.get(Qt).currentProgram;(Gt===void 0||Gt.isReady())&&nt.delete(Qt)}),nt.size===0){at(T);return}setTimeout(Ut,10)}Ye.get("KHR_parallel_shader_compile")!==null?Ut():setTimeout(Ut,10)})};let be=null;function xe(T){be&&be(T)}function pe(){nn.stop()}function Re(){nn.start()}const nn=new Ly;nn.setAnimationLoop(xe),typeof self<"u"&&nn.setContext(self),this.setAnimationLoop=function(T){be=T,bt.setAnimationLoop(T),T===null?nn.stop():nn.start()},bt.addEventListener("sessionstart",pe),bt.addEventListener("sessionend",Re),this.render=function(T,G){if(G!==void 0&&G.isCamera!==!0){en("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(K===!0)return;J!==null&&J.renderStart(T,G);const lt=bt.enabled===!0&&bt.isPresenting===!0,nt=W!==null&&(dt===null||lt)&&W.begin(H,dt);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),bt.enabled===!0&&bt.isPresenting===!0&&(W===null||W.isCompositing()===!1)&&(bt.cameraAutoUpdate===!0&&bt.updateCamera(G),G=bt.getCamera()),T.isScene===!0&&T.onBeforeRender(H,T,G,dt),U=mt.get(T,C.length),U.init(G),U.state.textureUnits=ie.getTextureUnits(),C.push(U),re.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),G.isArrayCamera?Ge.setFromArrayCamera(G):Me.setFromProjectionMatrix(re,Ea,G.reversedDepth),ze=this.localClippingEnabled,Pe=_t.init(this.clippingPlanes,ze),I=Bt.get(T,E.length),I.init(),E.push(I),this.info.render.frame++,bt.enabled===!0&&bt.isPresenting===!0){const Qt=H.xr.getDepthSensingMesh();Qt!==null&&zn(Qt,G,-1/0,H.sortObjects)}zn(T,G,0,H.sortObjects),I.finish(),J!==null&&J.updateLights(U.state.lightsArray),H.sortObjects===!0&&I.sort(qt,le),Cn=bt.enabled===!1||bt.isPresenting===!1||bt.hasDepthSensing()===!1,Cn&&F.addToRenderList(I,T),this.info.autoReset===!0&&this.info.reset(),Pe===!0&&_t.beginShadows();const at=U.state.shadowsArray;if(Ot.render(at,T,G),Pe===!0&&_t.endShadows(),(nt&&W.hasRenderPass())===!1){const Qt=I.opaque,It=I.transmissive;if(U.setupLights(),G.isArrayCamera){const Gt=G.cameras;if(It.length>0)for(let Jt=0,me=Gt.length;Jt<me;Jt++){const Ee=Gt[Jt];jt(Qt,It,T,Ee)}Cn&&F.render(T);for(let Jt=0,me=Gt.length;Jt<me;Jt++){const Ee=Gt[Jt];St(I,T,Ee,Ee.viewport)}}else It.length>0&&jt(Qt,It,T,G),Cn&&F.render(T),St(I,T,G)}dt!==null&&Y===0&&(ie.updateMultisampleRenderTarget(dt),ie.updateRenderTargetMipmap(dt)),nt&&W.end(H),T.isScene===!0&&T.onAfterRender(H,T,G),pt.resetDefaultState(),ot=-1,ht=null,C.pop(),C.length>0?(U=C[C.length-1],ie.setTextureUnits(U.state.textureUnits),Pe===!0&&_t.setGlobalState(H.clippingPlanes,U.state.camera)):U=null,E.pop(),E.length>0?I=E[E.length-1]:I=null,J!==null&&J.renderEnd()};function zn(T,G,lt,nt){if(T.visible===!1)return;if(T.layers.test(G.layers)){if(T.isGroup)lt=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(G);else if(T.isLight)U.pushLight(T),T.castShadow&&U.pushShadow(T);else if(T.isSprite){const Qt=G.isArrayCamera?Ge:Me;if(!T.frustumCulled||T.intersectsFrustum(Qt)){nt&&Ne.setFromMatrixPosition(T.matrixWorld).applyMatrix4(re);const It=Nt.update(T),Gt=T.material;Gt.visible&&I.push(T,It,Gt,lt,Ne.z,null,G)}}else if(T.isMesh||T.isLine||T.isPoints){const Qt=G.isArrayCamera?Ge:Me;if(!T.frustumCulled||T.intersectsFrustum(Qt)){const It=Nt.update(T),Gt=T.material;if(nt&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Ne.copy(T.boundingSphere.center)):(It.boundingSphere===null&&It.computeBoundingSphere(),Ne.copy(It.boundingSphere.center)),Ne.applyMatrix4(T.matrixWorld).applyMatrix4(re)),Array.isArray(Gt)){const Jt=It.groups;for(let me=0,Ee=Jt.length;me<Ee;me++){const kt=Jt[me],Se=Gt[kt.materialIndex];Se&&Se.visible&&I.push(T,It,Se,lt,Ne.z,kt,G)}}else Gt.visible&&I.push(T,It,Gt,lt,Ne.z,null,G)}}}const Ut=T.children;for(let Qt=0,It=Ut.length;Qt<It;Qt++)zn(Ut[Qt],G,lt,nt)}function St(T,G,lt,nt){const{opaque:at,transmissive:Ut,transparent:Qt}=T;U.setupLightsView(lt),Pe===!0&&_t.setGlobalState(H.clippingPlanes,lt),nt&&Ht.viewport(Tt.copy(nt)),at.length>0&&we(at,G,lt),Ut.length>0&&we(Ut,G,lt),Qt.length>0&&we(Qt,G,lt),Ht.buffers.depth.setTest(!0),Ht.buffers.depth.setMask(!0),Ht.buffers.color.setMask(!0),Ht.setPolygonOffset(!1)}function jt(T,G,lt,nt){if((lt.isScene===!0?lt.overrideMaterial:null)!==null)return;if(U.state.transmissionRenderTarget[nt.id]===void 0){const kt=Ye.has("EXT_color_buffer_half_float")||Ye.has("EXT_color_buffer_float");U.state.transmissionRenderTarget[nt.id]=new Ga(1,1,{generateMipmaps:!0,type:kt?Xa:ji,minFilter:$s,samples:Math.max(4,Ue.samples),stencilBuffer:u,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Qe.workingColorSpace})}const Ut=U.state.transmissionRenderTarget[nt.id],Qt=nt.viewport||Tt;Ut.setSize(Qt.z*H.transmissionResolutionScale,Qt.w*H.transmissionResolutionScale);const It=H.getRenderTarget(),Gt=H.getActiveCubeFace(),Jt=H.getActiveMipmapLevel();H.setRenderTarget(Ut),H.getClearColor(D),$=H.getClearAlpha(),$<1&&H.setClearColor(16777215,.5),H.clear(),Cn&&F.render(lt);const me=H.toneMapping;H.toneMapping=ds;const Ee=nt.viewport;if(nt.viewport!==void 0&&(nt.viewport=void 0),U.setupLightsView(nt),Pe===!0&&_t.setGlobalState(H.clippingPlanes,nt),we(T,lt,nt),ie.updateMultisampleRenderTarget(Ut),ie.updateRenderTargetMipmap(Ut),Ye.has("WEBGL_multisampled_render_to_texture")===!1){let kt=!1;for(let Se=0,yn=G.length;Se<yn;Se++){const Ve=G[Se],{object:Fe,geometry:bn,material:ee,group:Un}=Ve;if(ee.side===Pi&&Fe.layers.test(nt.layers)){const Xe=ee.side;ee.side=zi,ee.needsUpdate=!0,dn(Fe,lt,nt,bn,ee,Un),ee.side=Xe,ee.needsUpdate=!0,kt=!0}}kt===!0&&(ie.updateMultisampleRenderTarget(Ut),ie.updateRenderTargetMipmap(Ut))}H.setRenderTarget(It,Gt,Jt),H.setClearColor(D,$),Ee!==void 0&&(nt.viewport=Ee),H.toneMapping=me}function we(T,G,lt){const nt=G.isScene===!0?G.overrideMaterial:null;for(let at=0,Ut=T.length;at<Ut;at++){const Qt=T[at],{object:It,geometry:Gt,group:Jt}=Qt;let me=Qt.material;me.allowOverride===!0&&nt!==null&&(me=nt),It.layers.test(lt.layers)&&dn(It,G,lt,Gt,me,Jt)}}function dn(T,G,lt,nt,at,Ut){J!==null&&at.isNodeMaterial&&J.setObject(T,at),T.onBeforeRender(H,G,lt,nt,at,Ut),T.modelViewMatrix.multiplyMatrices(lt.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),at.onBeforeRender(H,G,lt,nt,T,Ut),at.transparent===!0&&at.side===Pi&&at.forceSinglePass===!1?(at.side=zi,at.needsUpdate=!0,H.renderBufferDirect(lt,G,nt,at,T,Ut),at.side=Cr,at.needsUpdate=!0,H.renderBufferDirect(lt,G,nt,at,T,Ut),at.side=Pi):H.renderBufferDirect(lt,G,nt,at,T,Ut),T.onAfterRender(H,G,lt,nt,at,Ut)}function ln(T){let G=0;for(const lt of T)lt.texture!==null&&G++;return G}function rn(T,G,lt){G.isScene!==!0&&(G=vn);const nt=se.get(T),at=U.state.lights,Ut=U.state.shadowsArray,Qt=at.state.version,It=yt.getParameters(T,at.state,Ut,G,lt,U.state.lightProbeGridArray),Gt=yt.getProgramCacheKey(It);let Jt=nt.programs;nt.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?G.environment:null,nt.fog=G.fog;const me=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;nt.envMap=O.get(T.envMap||nt.environment,me),nt.envMapRotation=nt.environment!==null&&T.envMap===null?G.environmentRotation:T.envMapRotation,Jt===void 0&&(T.addEventListener("dispose",Ze),Jt=new Map,nt.programs=Jt,nt.programVariants=new Map);let Ee=Jt.get(Gt);if(Ee!==void 0){if(nt.currentProgram===Ee&&nt.lightsStateVersion===Qt)return ba(T,It),Ee}else It.uniforms=yt.getUniforms(T),J!==null&&T.isNodeMaterial&&J.build(T,lt,It),T.onBeforeCompile(It,H),Ee=yt.acquireProgram(It,Gt),Jt.set(Gt,Ee),nt.uniforms=It.uniforms;const kt=nt.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(kt.clippingPlanes=_t.uniform),ba(T,It),nt.needsLights=$e(T),nt.lightsStateVersion=Qt,nt.needsLights&&(kt.ambientLightColor.value=at.state.ambient,kt.lightProbe.value=at.state.probe,kt.sunLights.value=at.state.sun,kt.sunLightShadows.value=at.state.sunShadow,kt.directionalLights.value=at.state.directional,kt.directionalLightShadows.value=at.state.directionalShadow,kt.spotLights.value=at.state.spot,kt.spotLightShadows.value=at.state.spotShadow,kt.rectAreaLights.value=at.state.rectArea,kt.ltc_1.value=at.state.rectAreaLTC1,kt.ltc_2.value=at.state.rectAreaLTC2,kt.pointLights.value=at.state.point,kt.pointLightShadows.value=at.state.pointShadow,kt.hemisphereLights.value=at.state.hemi,kt.sunShadowMatrix.value=at.state.sunShadowMatrix,kt.sunShadowCascade.value=at.state.sunShadowCascade,kt.directionalShadowMatrix.value=at.state.directionalShadowMatrix,kt.spotLightMatrix.value=at.state.spotLightMatrix,kt.spotLightMap.value=at.state.spotLightMap,kt.pointShadowMatrix.value=at.state.pointShadowMatrix),nt.numLightProbeGrids=ln(U.state.lightProbeGridArray),nt.currentProgram=Ee,nt.uniformsList=null,Ee}function Jn(T,G,lt,nt,at){const Ut=se.get(T),Qt=Ut.currentProgram.id+","+nt+","+at;let It=Ut.programVariants.get(Qt);return It===void 0?(It=rn(T,G,lt),Ut.programVariants.set(Qt,It)):(Ut.currentProgram=It,Ut.uniformsList=null,Ut.outputColorSpace=nt,Ut.toneMapping=at),It}function Bi(T){if(T.uniformsList===null){const G=T.currentProgram.getUniforms();T.uniformsList=Rf.seqWithValue(G.seq,T.uniforms)}return T.uniformsList}function ba(T,G){const lt=se.get(T);lt.outputColorSpace=G.outputColorSpace,lt.batching=G.batching,lt.batchingColor=G.batchingColor,lt.instancing=G.instancing,lt.instancingColor=G.instancingColor,lt.instancingMorph=G.instancingMorph,lt.skinning=G.skinning,lt.morphTargets=G.morphTargets,lt.morphNormals=G.morphNormals,lt.morphColors=G.morphColors,lt.morphTargetsCount=G.morphTargetsCount,lt.numClippingPlanes=G.numClippingPlanes,lt.numIntersection=G.numClipIntersection,lt.vertexAlphas=G.vertexAlphas,lt.vertexTangents=G.vertexTangents,lt.toneMapping=G.toneMapping}function Fn(T,G,lt,nt,at){G.isScene!==!0&&(G=vn),ie.resetTextureUnits();const Ut=G.fog,Qt=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial?G.environment:null,It=dt===null?H.outputColorSpace:dt.isXRRenderTarget===!0?dt.texture.colorSpace:Qe.workingColorSpace,Gt=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial&&!nt.envMap||nt.isMeshPhongMaterial&&!nt.envMap,Jt=O.get(nt.envMap||Qt,Gt),me=nt.vertexColors===!0&&!!lt.attributes.color&&lt.attributes.color.itemSize===4,Ee=!!lt.attributes.tangent&&(!!nt.normalMap||nt.anisotropy>0),kt=!!lt.morphAttributes.position,Se=!!lt.morphAttributes.normal,yn=!!lt.morphAttributes.color;let Ve=ds;nt.toneMapped&&(dt===null||dt.isXRRenderTarget===!0)&&(Ve=H.toneMapping);const Fe=lt.morphAttributes.position||lt.morphAttributes.normal||lt.morphAttributes.color,bn=Fe!==void 0?Fe.length:0,ee=se.get(nt),Un=U.state.lights;if(Pe===!0&&(ze===!0||T!==ht)){const pn=T===ht&&nt.id===ot;_t.setState(nt,T,pn)}let Xe=!1,Qi=!1;nt.version===ee.__version?ee.needsLights&&ee.lightsStateVersion!==Un.state.version||at.isBatchedMesh&&ee.batching===!1||!at.isBatchedMesh&&ee.batching===!0||at.isBatchedMesh&&ee.batchingColor===!0&&at._colorsTexture===null||at.isBatchedMesh&&ee.batchingColor===!1&&at._colorsTexture!==null||at.isInstancedMesh&&ee.instancing===!1||!at.isInstancedMesh&&ee.instancing===!0||at.isSkinnedMesh&&ee.skinning===!1||!at.isSkinnedMesh&&ee.skinning===!0||at.isInstancedMesh&&ee.instancingColor===!0&&at.instanceColor===null||at.isInstancedMesh&&ee.instancingColor===!1&&at.instanceColor!==null||at.isInstancedMesh&&ee.instancingMorph===!0&&at.morphTexture===null||at.isInstancedMesh&&ee.instancingMorph===!1&&at.morphTexture!==null||ee.envMap!==Jt||nt.fog===!0&&ee.fog!==Ut||ee.numClippingPlanes!==void 0&&(ee.numClippingPlanes!==_t.numPlanes||ee.numIntersection!==_t.numIntersection)||ee.vertexAlphas!==me||ee.vertexTangents!==Ee||ee.morphTargets!==kt||ee.morphNormals!==Se||ee.morphColors!==yn||ee.morphTargetsCount!==bn||ee.numLightProbeGrids!==ln(U.state.lightProbeGridArray)?Xe=!0:(ee.outputColorSpace!==It||ee.toneMapping!==Ve)&&(Qi=!0):(Xe=!0,ee.__version=nt.version);let ge=ee.currentProgram;(Xe===!0||Qi===!0)&&(ge=Qi===!0?Jn(nt,G,at,It,Ve):rn(nt,G,at),J&&nt.isNodeMaterial&&J.onUpdateProgram(nt,ge,ee));let Ta=!1,$n=!1,wi=!1;const ye=ge.getUniforms(),tn=ee.uniforms;if(Ht.useProgram(ge.program)&&(Ta=!0,$n=!0,wi=!0),nt.id!==ot&&(ot=nt.id,$n=!0),Ta||ht!==T){Ht.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),ye.setValue(j,"projectionMatrix",T.projectionMatrix),ye.setValue(j,"viewMatrix",T.matrixWorldInverse);const xn=ye.map.cameraPosition;xn!==void 0&&xn.setValue(j,gn.setFromMatrixPosition(T.matrixWorld)),Ue.logarithmicDepthBuffer&&ye.setValue(j,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(nt.isMeshPhongMaterial||nt.isMeshToonMaterial||nt.isMeshLambertMaterial||nt.isMeshBasicMaterial||nt.isMeshStandardMaterial||nt.isShaderMaterial)&&ye.setValue(j,"isOrthographic",T.isOrthographicCamera===!0),ht!==T&&(ht=T,$n=!0,wi=!0)}if(ee.needsLights&&(Un.state.sunShadowMap.length>0&&ye.setValue(j,"sunShadowMap",Un.state.sunShadowMap,ie),Un.state.directionalShadowMap.length>0&&ye.setValue(j,"directionalShadowMap",Un.state.directionalShadowMap,ie),Un.state.spotShadowMap.length>0&&ye.setValue(j,"spotShadowMap",Un.state.spotShadowMap,ie),Un.state.pointShadowMap.length>0&&ye.setValue(j,"pointShadowMap",Un.state.pointShadowMap,ie)),at.isSkinnedMesh){ye.setOptional(j,at,"bindMatrix"),ye.setOptional(j,at,"bindMatrixInverse");const pn=at.skeleton;pn&&(pn.boneTexture===null&&pn.computeBoneTexture(),ye.setValue(j,"boneTexture",pn.boneTexture,ie))}at.isBatchedMesh&&(ye.setOptional(j,at,"batchingTexture"),ye.setValue(j,"batchingTexture",at._matricesTexture,ie),ye.setOptional(j,at,"batchingIdTexture"),ye.setValue(j,"batchingIdTexture",at._indirectTexture,ie),ye.setOptional(j,at,"batchingColorTexture"),at._colorsTexture!==null&&ye.setValue(j,"batchingColorTexture",at._colorsTexture,ie));const Hn=lt.morphAttributes;if((Hn.position!==void 0||Hn.normal!==void 0||Hn.color!==void 0)&&vt.update(at,lt,ge),($n||ee.receiveShadow!==at.receiveShadow)&&(ee.receiveShadow=at.receiveShadow,ye.setValue(j,"receiveShadow",at.receiveShadow)),(nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial)&&nt.envMap===null&&G.environment!==null&&(tn.envMapIntensity.value=G.environmentIntensity),tn.dfgLUT!==void 0&&(tn.dfgLUT.value=h3()),$n){if(ye.setValue(j,"toneMappingExposure",H.toneMappingExposure),ee.needsLights&&Ln(tn,wi),Ut&&nt.fog===!0&&zt.refreshFogUniforms(tn,Ut),zt.refreshMaterialUniforms(tn,nt,Ct,At,U.state.transmissionRenderTarget[T.id]),ee.needsLights&&ee.numLightProbeGrids>0){const pn=L;let xn=0;for(const ri of U.state.lightProbeGridArray)ri.texture!==null&&(pn.textures[xn]=ri.texture,pn.min[xn]=ri.boundingBox.min,pn.max[xn]=ri.boundingBox.max,pn.resolution[xn]=ri.resolution,xn++);for(const ri in pn)pn[ri].length=xn;tn.probesSH.value=pn.textures,tn.probesMin.value=pn.min,tn.probesMax.value=pn.max,tn.probesResolution.value=pn.resolution}Rf.upload(j,Bi(ee),tn,ie)}if(nt.isShaderMaterial&&nt.uniformsNeedUpdate===!0&&(Rf.upload(j,Bi(ee),tn,ie),nt.uniformsNeedUpdate=!1),nt.isSpriteMaterial&&ye.setValue(j,"center",at.center),ye.setValue(j,"modelViewMatrix",at.modelViewMatrix),ye.setValue(j,"normalMatrix",at.normalMatrix),ye.setValue(j,"modelMatrix",at.matrixWorld),nt.uniformsGroups!==void 0){const pn=nt.uniformsGroups;for(let xn=0,ri=pn.length;xn<ri;xn++){const gs=pn[xn];Rt.update(gs,ge),Rt.bind(gs,ge)}}return ge}function Ln(T,G){T.ambientLightColor.needsUpdate=G,T.lightProbe.needsUpdate=G,T.sunLights.needsUpdate=G,T.sunLightShadows.needsUpdate=G,T.directionalLights.needsUpdate=G,T.directionalLightShadows.needsUpdate=G,T.pointLights.needsUpdate=G,T.pointLightShadows.needsUpdate=G,T.spotLights.needsUpdate=G,T.spotLightShadows.needsUpdate=G,T.rectAreaLights.needsUpdate=G,T.hemisphereLights.needsUpdate=G}function $e(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return dt},this.setRenderTargetTextures=function(T,G,lt){const nt=se.get(T);nt.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,nt.__autoAllocateDepthBuffer===!1&&(nt.__useRenderToTexture=!1),se.get(T.texture).__webglTexture=G,se.get(T.depthTexture).__webglTexture=nt.__autoAllocateDepthBuffer?void 0:lt,nt.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,G){const lt=se.get(T);lt.__webglFramebuffer=G,lt.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(T,G=0,lt=0){dt=T,k=G,Y=lt;let nt=null,at=!1,Ut=!1;if(T){const It=se.get(T);if(It.__useDefaultFramebuffer!==void 0){Ht.bindFramebuffer(j.FRAMEBUFFER,It.__webglFramebuffer),Tt.copy(T.viewport),Vt.copy(T.scissor),ae=T.scissorTest,Ht.viewport(Tt),Ht.scissor(Vt),Ht.setScissorTest(ae),ot=-1;return}else if(It.__webglFramebuffer===void 0)ie.setupRenderTarget(T);else if(It.__hasExternalTextures)ie.rebindTextures(T,se.get(T.texture).__webglTexture,se.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){const me=T.depthTexture;if(It.__boundDepthTexture!==me){if(me!==null&&se.has(me)&&(T.width!==me.image.width||T.height!==me.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ie.setupDepthRenderbuffer(T)}}const Gt=T.texture;(Gt.isData3DTexture||Gt.isDataArrayTexture||Gt.isCompressedArrayTexture)&&(Ut=!0);const Jt=se.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Jt[G])?nt=Jt[G][lt]:nt=Jt[G],at=!0):T.samples>0&&ie.useMultisampledRTT(T)===!1?nt=se.get(T).__webglMultisampledFramebuffer:Array.isArray(Jt)?nt=Jt[lt]:nt=Jt,Tt.copy(T.viewport),Vt.copy(T.scissor),ae=T.scissorTest}else Tt.copy(wt).multiplyScalar(Ct).floor(),Vt.copy(Wt).multiplyScalar(Ct).floor(),ae=de;if(lt!==0&&(nt=ut),Ht.bindFramebuffer(j.FRAMEBUFFER,nt)&&Ht.drawBuffers(T,nt),Ht.viewport(Tt),Ht.scissor(Vt),Ht.setScissorTest(ae),at){const It=se.get(T.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_CUBE_MAP_POSITIVE_X+G,It.__webglTexture,lt)}else if(Ut){const It=G;for(let Gt=0;Gt<T.textures.length;Gt++){const Jt=se.get(T.textures[Gt]);j.framebufferTextureLayer(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0+Gt,Jt.__webglTexture,lt,It)}}else if(T!==null&&lt!==0){const It=se.get(T.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,It.__webglTexture,lt)}ot=-1};function Rn(T){const G=se.get(T);return(G.__readFormat!==T.format||G.__readType!==T.type)&&(G.__readFormat=T.format,G.__readType=T.type,G.__formatReadable=Ue.textureFormatReadable(T.format),G.__typeReadable=Ue.textureTypeReadable(T.type)),G}this.readRenderTargetPixels=function(T,G,lt,nt,at,Ut,Qt,It=0){if(!(T&&T.isWebGLRenderTarget)){en("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Gt=se.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Qt!==void 0&&(Gt=Gt[Qt],Array.isArray(Gt)&&(Gt=Gt[0])),Gt){Ht.bindFramebuffer(j.FRAMEBUFFER,Gt);try{const Jt=T.textures[It],me=Jt.format,Ee=Jt.type;T.textures.length>1&&j.readBuffer(j.COLOR_ATTACHMENT0+It);const kt=Rn(Jt);if(kt.__formatReadable===!1){en("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(kt.__typeReadable===!1){en("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=T.width-nt&&lt>=0&&lt<=T.height-at&&j.readPixels(G,lt,nt,at,X.convert(me),X.convert(Ee),Ut)}finally{const Jt=dt!==null?se.get(dt).__webglFramebuffer:null;Ht.bindFramebuffer(j.FRAMEBUFFER,Jt)}}},this.readRenderTargetPixelsAsync=async function(T,G,lt,nt,at,Ut,Qt,It=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Gt=se.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Qt!==void 0&&(Gt=Gt[Qt],Array.isArray(Gt)&&(Gt=Gt[0])),Gt)if(G>=0&&G<=T.width-nt&&lt>=0&&lt<=T.height-at){Ht.bindFramebuffer(j.FRAMEBUFFER,Gt);const Jt=T.textures[It],me=Jt.format,Ee=Jt.type;T.textures.length>1&&j.readBuffer(j.COLOR_ATTACHMENT0+It);const kt=Rn(Jt);if(kt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(kt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Se=j.createBuffer();j.bindBuffer(j.PIXEL_PACK_BUFFER,Se),j.bufferData(j.PIXEL_PACK_BUFFER,Ut.byteLength,j.STREAM_READ),j.readPixels(G,lt,nt,at,X.convert(me),X.convert(Ee),0),j.bindBuffer(j.PIXEL_PACK_BUFFER,null);const yn=dt!==null?se.get(dt).__webglFramebuffer:null;Ht.bindFramebuffer(j.FRAMEBUFFER,yn);const Ve=j.fenceSync(j.SYNC_GPU_COMMANDS_COMPLETE,0);return j.flush(),await dT(j,Ve,4),j.bindBuffer(j.PIXEL_PACK_BUFFER,Se),j.getBufferSubData(j.PIXEL_PACK_BUFFER,0,Ut),j.bindBuffer(j.PIXEL_PACK_BUFFER,null),j.deleteBuffer(Se),j.deleteSync(Ve),Ut}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,G=null,lt=0){const nt=Math.pow(2,-lt),at=Math.floor(T.image.width*nt),Ut=Math.floor(T.image.height*nt),Qt=G!==null?G.x:0,It=G!==null?G.y:0;ie.setTexture2D(T,0),j.copyTexSubImage2D(j.TEXTURE_2D,lt,0,0,Qt,It,at,Ut),Ht.unbindTexture()},this.copyTextureToTexture=function(T,G,lt=null,nt=null,at=0,Ut=0){let Qt,It,Gt,Jt,me,Ee,kt,Se,yn;const Ve=T.isCompressedTexture?T.mipmaps[Ut]:T.image;if(lt!==null)Qt=lt.max.x-lt.min.x,It=lt.max.y-lt.min.y,Gt=lt.isBox3?lt.max.z-lt.min.z:1,Jt=lt.min.x,me=lt.min.y,Ee=lt.isBox3?lt.min.z:0;else{const ye=Math.pow(2,-at);Qt=Math.floor(Ve.width*ye),It=Math.floor(Ve.height*ye),T.isDataArrayTexture?Gt=Ve.depth:T.isData3DTexture?Gt=Math.floor(Ve.depth*ye):Gt=1,Jt=0,me=0,Ee=0}nt!==null?(kt=nt.x,Se=nt.y,yn=nt.z):(kt=0,Se=0,yn=0);const Fe=X.convert(G.format),bn=X.convert(G.type);let ee;G.isData3DTexture?(ie.setTexture3D(G,0),ee=j.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(ie.setTexture2DArray(G,0),ee=j.TEXTURE_2D_ARRAY):(ie.setTexture2D(G,0),ee=j.TEXTURE_2D),Ht.activeTexture(j.TEXTURE0),Ht.pixelStorei(j.UNPACK_FLIP_Y_WEBGL,G.flipY),Ht.pixelStorei(j.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),Ht.pixelStorei(j.UNPACK_ALIGNMENT,G.unpackAlignment);const Un=Ht.getParameter(j.UNPACK_ROW_LENGTH),Xe=Ht.getParameter(j.UNPACK_IMAGE_HEIGHT),Qi=Ht.getParameter(j.UNPACK_SKIP_PIXELS),ge=Ht.getParameter(j.UNPACK_SKIP_ROWS),Ta=Ht.getParameter(j.UNPACK_SKIP_IMAGES);Ht.pixelStorei(j.UNPACK_ROW_LENGTH,Ve.width),Ht.pixelStorei(j.UNPACK_IMAGE_HEIGHT,Ve.height),Ht.pixelStorei(j.UNPACK_SKIP_PIXELS,Jt),Ht.pixelStorei(j.UNPACK_SKIP_ROWS,me),Ht.pixelStorei(j.UNPACK_SKIP_IMAGES,Ee);const $n=T.isDataArrayTexture||T.isData3DTexture,wi=G.isDataArrayTexture||G.isData3DTexture;if(T.isDepthTexture){const ye=se.get(T),tn=se.get(G),Hn=se.get(ye.__renderTarget),pn=se.get(tn.__renderTarget);Ht.bindFramebuffer(j.READ_FRAMEBUFFER,Hn.__webglFramebuffer),Ht.bindFramebuffer(j.DRAW_FRAMEBUFFER,pn.__webglFramebuffer);for(let xn=0;xn<Gt;xn++)$n&&(j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,se.get(T).__webglTexture,at,Ee+xn),j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,se.get(G).__webglTexture,Ut,yn+xn)),j.blitFramebuffer(Jt,me,Jt+Qt,me+It,kt,Se,kt+Qt,Se+It,j.DEPTH_BUFFER_BIT,j.NEAREST);Ht.bindFramebuffer(j.READ_FRAMEBUFFER,null),Ht.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else if(at!==0||T.isRenderTargetTexture||se.has(T)){const ye=se.get(T),tn=se.get(G);Ht.bindFramebuffer(j.READ_FRAMEBUFFER,V),Ht.bindFramebuffer(j.DRAW_FRAMEBUFFER,st);for(let Hn=0;Hn<Gt;Hn++)$n?j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,ye.__webglTexture,at,Ee+Hn):j.framebufferTexture2D(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,ye.__webglTexture,at),wi?j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,tn.__webglTexture,Ut,yn+Hn):j.framebufferTexture2D(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,tn.__webglTexture,Ut),at!==0?j.blitFramebuffer(Jt,me,Jt+Qt,me+It,kt,Se,kt+Qt,Se+It,j.COLOR_BUFFER_BIT,j.NEAREST):wi?j.copyTexSubImage3D(ee,Ut,kt,Se,yn+Hn,Jt,me,Qt,It):j.copyTexSubImage2D(ee,Ut,kt,Se,Jt,me,Qt,It);Ht.bindFramebuffer(j.READ_FRAMEBUFFER,null),Ht.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else wi?T.isDataTexture||T.isData3DTexture?j.texSubImage3D(ee,Ut,kt,Se,yn,Qt,It,Gt,Fe,bn,Ve.data):G.isCompressedArrayTexture?j.compressedTexSubImage3D(ee,Ut,kt,Se,yn,Qt,It,Gt,Fe,Ve.data):j.texSubImage3D(ee,Ut,kt,Se,yn,Qt,It,Gt,Fe,bn,Ve):T.isDataTexture?j.texSubImage2D(j.TEXTURE_2D,Ut,kt,Se,Qt,It,Fe,bn,Ve.data):T.isCompressedTexture?j.compressedTexSubImage2D(j.TEXTURE_2D,Ut,kt,Se,Ve.width,Ve.height,Fe,Ve.data):j.texSubImage2D(j.TEXTURE_2D,Ut,kt,Se,Qt,It,Fe,bn,Ve);Ht.pixelStorei(j.UNPACK_ROW_LENGTH,Un),Ht.pixelStorei(j.UNPACK_IMAGE_HEIGHT,Xe),Ht.pixelStorei(j.UNPACK_SKIP_PIXELS,Qi),Ht.pixelStorei(j.UNPACK_SKIP_ROWS,ge),Ht.pixelStorei(j.UNPACK_SKIP_IMAGES,Ta),Ut===0&&G.generateMipmaps===!0&&G.mipmapsAutoUpdate===!0&&j.generateMipmap(ee),Ht.unbindTexture()},this.initRenderTarget=function(T){se.get(T).__webglFramebuffer===void 0&&ie.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?ie.setTextureCube(T,0):T.isData3DTexture?ie.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?ie.setTexture2DArray(T,0):ie.setTexture2D(T,0),Ht.unbindTexture()},this.resetState=function(){k=0,Y=0,dt=null,Ht.reset(),pt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ea}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const i=this.getContext();i.drawingBufferColorSpace=Qe._getDrawingBufferColorSpace(t),i.unpackColorSpace=Qe._getUnpackColorSpace()}}const ya=1e4;function HS(o){return{name:o,equity:ya,realized:0,wins:0,losses:0,closes:0,opens:0,trades:0,curve:[ya],maxDrawdown:0,openPositions:[],recentCloses:[]}}function GS(o,t){const i=new Map;for(const l of o)i.set(l.name,HS(l.name));const s=[...t].reverse();for(const l of s){let u=i.get(l.bot);if(u||(u=HS(l.bot),i.set(l.bot,u)),l.type==="open")u.opens+=1,u.trades+=1,u.openPositions.push({key:`${l.bot}|${l.symbol??"?"}|${l.decision_id??l.ts}`,symbol:l.symbol??"?",side:l.side,qty:l.qty,price:l.price,ts:l.ts});else if(l.type==="close"){u.closes+=1,u.trades+=1;const h=l.pnl??0;u.realized+=h,u.equity=ya+u.realized,h>0?u.wins+=1:h<0&&(u.losses+=1),u.curve.push(u.equity),u.recentCloses.push({ts:Date.parse(l.ts),pnl:h}),u.recentCloses.length>24&&u.recentCloses.shift();const d=u.openPositions.findIndex(m=>m.symbol===l.symbol);d>=0&&u.openPositions.splice(d,1)}}for(const l of i.values()){let u=-1/0,h=0;for(const d of l.curve){d>u&&(u=d);const m=u-d;m>h&&(h=m)}l.maxDrawdown=h,l.realized=Math.round(l.realized*100)/100,l.equity=Math.round(l.equity*100)/100}return i}function p3(o){let t=0,i=0,s=0;for(const l of o)l.type!=="close"||l.pnl===null||(s+=1,l.pnl>0?t+=l.pnl:l.pnl<0&&(i+=-l.pnl));return t=Math.round(t*100)/100,i=Math.round(i*100)/100,{profits:t,losses:i,net:Math.round((t-i)*100)/100,closes:s}}function m3(o,t){let i=0;for(const s of o.recentCloses){const l=Math.max(0,(t-s.ts)/1e3);i+=s.pnl*Math.exp(-l/45)}return Math.tanh(i/120)}function Kn(o,t=!1){return`${o<0?"-":t&&o>0?"+":""}$${Math.abs(o).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`}function wr(o){return new Date(o).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}function g3(o){return new Date(o).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit",second:"2-digit"})}const v3={wesley:"/avatars/wesley.webp",trendia:"/avatars/trendia.webp",snapback:"/avatars/vega.webp",vega:"/avatars/snapback.webp",polycrypt9000:"/avatars/polycrypt9000.webp"};function _3(o){return o?v3[o.toLowerCase()]??null:null}const oc=(o,t)=>({id:`portrait-${o}`,label:t,src:`/avatars/${o}.webp`,group:"Portraits"}),bi=(o,t)=>({id:o,label:t,src:`/avatars/library/${o}.webp`,group:"Robot set"}),Xy=[oc("wesley","Portrait — Wesley"),oc("trendia","Portrait — Trendia"),oc("snapback","Portrait — Snapback"),oc("vega","Portrait — Vega"),oc("polycrypt9000","Portrait — PolyCrypt9000"),bi("astro-1","Astro · Spiky Hair"),bi("astro-2","Astro · Classic"),bi("astro-3","Astro · Navy Antenna"),bi("astro-4","Astro · Royal"),bi("astro-5","Astro · Beanie Mic"),bi("astro-6","Astro · Lombax"),bi("astro-7","Astro · Astronaut"),bi("astro-8","Astro · Racer"),bi("astro-9","Astro · Hooded"),bi("astro-trendia","Astro · Headset"),bi("astro-snapback","Astro · Backwards Cap"),bi("astro-vega","Astro · Star Shades"),bi("astro-wesley","Astro · Bow Tie"),bi("astro-polycrypt","Astro · Gold Antenna"),bi("astro-eth","Astro · Ethereum")],ky=new Map(Xy.map(o=>[o.id,o])),Ec="fleet-avatar-choice",Zm=o=>`fleet-avatar-${o.toLowerCase()}`;function Km(o){if(!o)return null;try{const t=window.localStorage.getItem(Zm(o));return t&&ky.has(t)?t:null}catch{return null}}function VS(o,t){try{t?window.localStorage.setItem(Zm(o),t):window.localStorage.removeItem(Zm(o))}catch{}window.dispatchEvent(new CustomEvent(Ec,{detail:{codename:o}}))}function qy(o){const[t,i]=fe.useState(()=>Km(o));return fe.useEffect(()=>{const s=()=>i(Km(o));return s(),window.addEventListener(Ec,s),window.addEventListener("storage",s),()=>{window.removeEventListener(Ec,s),window.removeEventListener("storage",s)}},[o]),t}function v0(o,t){if(t){const i=ky.get(t);if(i)return i.src}return _3(o)}function Yo({bot:o,name:t,onEdit:i}){const[s,l]=fe.useState(!1),u=qy(o?.codename),h=v0(o?.codename,u);fe.useEffect(()=>l(!1),[h]);const d=h&&!s?z.jsx("img",{className:"mini-disc avatar-img",src:h,alt:"",title:o?.viz.avatar_accessory??t,onError:()=>l(!0)}):z.jsx("span",{className:"mini-disc",style:{backgroundColor:o?.viz.color??"#8b98a9"},title:o?.viz.avatar_accessory??t,children:t.charAt(0)});return i?z.jsxs("span",{className:"avatar-wrap",children:[z.jsx("button",{type:"button",className:"avatar-main",onClick:m=>{m.stopPropagation(),i()},title:`Change ${t}'s avatar`,"aria-label":`Change ${t}'s avatar`,children:d}),z.jsx("button",{type:"button",className:"avatar-edit",onClick:m=>{m.stopPropagation(),i()},"aria-label":`Change ${t}'s avatar`,children:"✎"})]}):d}function x3({bot:o,onClose:t}){const i=qy(o.codename),s=v0(o.codename,i),l=["Portraits","Robot set"];return z.jsx("div",{className:"modal-backdrop",onClick:t,children:z.jsxs("div",{className:"modal picker-modal",role:"dialog","aria-modal":"true","aria-label":`Choose avatar for ${o.name}`,onClick:u=>u.stopPropagation(),children:[z.jsxs("div",{className:"modal-head",children:[z.jsxs("h3",{children:["Avatar for ",o.name]}),z.jsx("button",{className:"modal-close",onClick:t,children:"✕"})]}),l.map(u=>z.jsxs("div",{children:[z.jsx("h4",{className:"picker-group",children:u}),z.jsx("div",{className:"picker-grid",children:Xy.filter(h=>h.group===u).map(h=>z.jsxs("button",{type:"button",className:`picker-item${h.src===s?" selected":""}`,onClick:()=>{VS(o.codename,h.id),t()},title:h.label,children:[z.jsx("img",{src:h.src,alt:"",loading:"lazy"}),z.jsx("span",{children:h.label})]},h.id))})]},u)),z.jsx("div",{className:"picker-actions",children:z.jsx("button",{type:"button",className:"tab small",onClick:()=>{VS(o.codename,null),t()},children:"Reset to default"})}),z.jsxs("p",{className:"hint",children:["Saved in this browser for ",o.name," only — the leaderboard, trade stream, and landscape all update, and the choice survives reloads."]})]})})}const Go=new he("#2fe89a"),lc=new he("#ff4d42"),$p=new he("#22d3ee"),S3=new he(16777215),y3=new he(4737108),M3=new he("#8c1d18"),E3=new he("#14489f"),tm=new he("#57b6ff"),cc=new Z(0,0,-12),si=.35,us=3.9;function b3(o){const t=Math.min(4,Math.max(.15,o/ya));return us*Math.pow(t,.75)}const T3={polycrypt9000:5e3,snapback:9600,trendia:15e3,vega:2e4,wesley:7600};function wf(o,t,i,s,l){let u=s;for(o.font=`${l} ${u}px ui-sans-serif, system-ui, sans-serif`;o.measureText(t).width>i&&u>10;)u-=2,o.font=`${l} ${u}px ui-sans-serif, system-ui, sans-serif`}function jm(o){let t=o>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function A3(o){let t=2166136261;for(let i=0;i<o.length;i++)t^=o.charCodeAt(i),t=Math.imul(t,16777619);return t>>>0}function R3(){const o=document.createElement("canvas");o.width=128,o.height=128;const t=o.getContext("2d"),i=t.createRadialGradient(64,64,2,64,64,64);return i.addColorStop(0,"rgba(255,255,255,1)"),i.addColorStop(.35,"rgba(255,255,255,0.45)"),i.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=i,t.fillRect(0,0,128,128),new jo(o)}function w3(){const o=document.createElement("canvas");o.width=16,o.height=512;const t=o.getContext("2d"),i=t.createLinearGradient(0,0,0,512);i.addColorStop(0,"#150f33"),i.addColorStop(.42,"#2b1e5e"),i.addColorStop(.68,"#50307a"),i.addColorStop(.82,"#2c1a52"),i.addColorStop(1,"#120c2a"),t.fillStyle=i,t.fillRect(0,0,16,512);const s=new jo(o);return s.colorSpace=di,s}const XS=["#9fd8ff","#ffd9a0","#7ef0d4","#c4b5fd","#f0abfc"];function kS(o){const t=jm(o),i=document.createElement("canvas");i.width=256,i.height=512;const s=i.getContext("2d"),l=s.createLinearGradient(0,0,0,512);l.addColorStop(0,"#181c2a"),l.addColorStop(1,"#0e1119"),s.fillStyle=l,s.fillRect(0,0,256,512),s.fillStyle="rgba(255,255,255,0.035)";for(let g=0;g<=256;g+=64)s.fillRect(g,0,1,512);const u=9,h=26,d=228/u,m=484/h,p=new Set;for(;p.size<3;)p.add(Math.floor(t()*h));for(let g=0;g<h;g++)for(let _=0;_<u;_++){const x=14+_*d+(d-15)/2,b=14+g*m+(m-9)/2;!p.has(g)&&t()<.17?(s.globalAlpha=.45+t()*.55,s.fillStyle=XS[Math.floor(t()*XS.length)],s.fillRect(x,b,15,9),s.globalAlpha=1):(s.fillStyle=t()<.5?"#0a0d15":"#11151f",s.fillRect(x,b,15,9))}const S=new jo(i);return S.colorSpace=di,S.wrapS=xc,S.wrapT=xc,S.anisotropy=4,S}const Qs=28,Zn=256;function C3(o,t){o.fillStyle="#05070c",o.fillRect(0,0,Qs,Qs),o.beginPath(),o.arc(14,14,13,0,Math.PI*2),o.fillStyle=t.viz.color,o.fill(),o.fillStyle="#0b0f16",o.textAlign="center",o.textBaseline="middle",o.font="700 15px ui-sans-serif, system-ui, sans-serif",o.fillText(t.name.charAt(0),14,15)}function em(o,t,i,s=!1){const l=document.createElement("canvas");l.width=Qs,l.height=Qs;const u=l.getContext("2d");i?u.drawImage(i,0,0,Qs,Qs):C3(u,t);const h=o.getContext("2d");h.fillStyle="#04060b",h.fillRect(0,0,Zn,Zn);const d=h.createLinearGradient(0,12,0,Zn-12);d.addColorStop(0,"#0a1424"),d.addColorStop(1,"#05080f"),h.fillStyle=d,h.fillRect(12,12,Zn-24,Zn-24),h.imageSmoothingEnabled=!1,h.drawImage(l,0,0,Qs,Qs,14,14,Zn-28,Zn-28),h.fillStyle="rgba(0,0,0,0.10)";for(let m=14;m<Zn-14;m+=4)h.fillRect(14,m,Zn-28,1);s&&(h.fillStyle="rgba(8,2,4,0.52)",h.fillRect(14,14,Zn-28,Zn-28),h.fillStyle="rgba(198,26,32,0.92)",h.fillRect(14,Zn/2-26,Zn-28,52),h.fillStyle="#ffffff",h.textAlign="center",h.textBaseline="middle",h.font="800 34px ui-sans-serif, system-ui, sans-serif",h.fillText("HALTED",Zn/2,Zn/2+1)),h.beginPath(),h.moveTo(14,14),h.lineTo(150,14),h.lineTo(60,120),h.lineTo(14,90),h.closePath(),h.fillStyle="rgba(255,255,255,0.05)",h.fill(),h.strokeStyle="rgba(130,190,255,0.28)",h.lineWidth=2,h.strokeRect(13,13,Zn-26,Zn-26)}function N3(o){const t=document.createElement("canvas");t.width=512,t.height=176;const i=new jo(t);i.colorSpace=di;const s=new cs(new fs({map:i,transparent:!0,depthWrite:!1}));s.scale.set(4.25,1.46,1);const l={sprite:s,canvas:t,texture:i,lastText:""};return Wy(l,o,"",""),l}function Wy(o,t,i,s,l="#8b98a9"){const u=`${i}|${s}|${l}`;if(u===o.lastText)return;o.lastText=u;const h=o.canvas.getContext("2d");h.clearRect(0,0,512,176),h.beginPath(),h.roundRect(6,6,500,164,22),h.fillStyle="rgba(5,10,20,0.62)",h.fill(),h.strokeStyle="rgba(255,255,255,0.16)",h.lineWidth=2,h.stroke(),h.textAlign="center",h.textBaseline="middle",h.fillStyle="#e6edf3",wf(h,t.name,460,52,"700"),h.fillText(t.name,256,44),h.fillStyle="#e6edf3",wf(h,i||" ",460,44,"700"),h.fillText(i||" ",256,100),h.fillStyle=l,wf(h,s||" ",460,30,"500"),h.fillText(s||" ",256,146),o.texture.needsUpdate=!0}function D3({bots:o,statsRef:t,effectsRef:i,haltedRef:s,onUnavailable:l,onInspect:u,inspectAnchorRef:h,inspectControlRef:d}){const m=fe.useRef(null),p=fe.useRef(!1),S=fe.useRef(l);S.current=l;const g=fe.useRef(u);return g.current=u,fe.useEffect(()=>{const _=m.current;if(!_||o.length===0||p.current)return;p.current=!0;let x;try{x=new d3({antialias:!0,powerPreference:"high-performance"})}catch{S.current();return}x.setPixelRatio(Math.min(window.devicePixelRatio,2)),_.appendChild(x.domElement);const b=new URLSearchParams(window.location.search).get("demoheights")==="1",A=new NT;A.background=w3(),A.fog=new l0(2760792,.0145);const y=new oa(50,1,.1,260);y.position.set(0,9.4,17.5),A.add(new m1(9280704,.65));const M=new p1(14542079,1);M.position.set(6,14,8),A.add(M);const N=new mS(11820287,60,90,1.8);N.position.set(-24,10,-6),A.add(N);const P=R3(),L=kS(777),I=new Ce(new h0(60,64),new Zi({color:"#0a0819",roughness:1,metalness:0}));I.rotation.x=-Math.PI/2,I.position.y=-.02,A.add(I);const U=new x1(110,110,4863376,2102858);U.material.transparent=!0,U.material.opacity=.34,U.position.y=.01,A.add(U);{const Dt=new Float32Array(780);for(let xe=0;xe<260;xe++){const pe=70+Math.random()*50,Re=Math.random()*Math.PI*2,nn=16+Math.random()*50;Dt[xe*3]=Math.cos(Re)*pe,Dt[xe*3+1]=nn,Dt[xe*3+2]=Math.sin(Re)*pe-20}const ce=new In;ce.setAttribute("position",new ca(Dt,3));const be=new Wp(ce,new Xm({color:10466536,size:.4,fog:!1,transparent:!0,opacity:.55}));A.add(be)}{const Lt=jm(4242),Dt=120,ce=new Ri(1,1,1);ce.translate(0,.5,0);const be=new Zi({map:L,roughness:.95,metalness:.05}),xe=new HT(ce,be,Dt),pe=new Wn,Re=new he;for(let nn=0;nn<Dt;nn++){const zn=Lt()*Math.PI*2,St=27+Lt()*26,jt=5+Math.pow(Lt(),1.6)*19,we=2.6+Lt()*3.2;pe.position.set(Math.cos(zn)*St,0,Math.sin(zn)*St-8),pe.scale.set(we,jt,we),pe.rotation.y=Lt()*Math.PI,pe.updateMatrix(),xe.setMatrixAt(nn,pe.matrix),Re.setHSL(.74,.32,.42+Lt()*.3),xe.setColorAt(nn,Re)}xe.instanceMatrix.needsUpdate=!0,xe.instanceColor&&(xe.instanceColor.needsUpdate=!0),A.add(xe)}const E=new Sa;E.position.copy(cc),A.add(E);const C=new Ce(new js(4.4,4.9,.45,40),new Zi({color:"#0d1424",roughness:.5,metalness:.45}));C.position.y=.225,E.add(C);const W=new Ti({color:$p,transparent:!0,opacity:.6}),H=new Ce(new gc(4.55,.05,8,56),W);H.rotation.x=Math.PI/2,H.position.y=.46,E.add(H);const K=new Zi({map:L.clone(),roughness:.8,metalness:.2});K.map.repeat.set(2.2,1.1);const J=new Ce(new Ri(4.7,1.7,4.7),K);J.position.y=.45+.85,E.add(J);const ut=new Ce(new js(2.6,3,1.05,32),new Zi({color:"#131a2c",roughness:.55,metalness:.5}));ut.position.y=2.15+.525,E.add(ut);const V=new Zi({color:"#22262f",metalness:.9,roughness:.32,emissive:new he("#1d4ed8"),emissiveIntensity:.1}),st=new Ce(new ko(2.2,40,20,0,Math.PI*2,0,Math.PI/2),V);st.position.y=3.2,E.add(st);const k=new Ti({color:tm.clone()}),Y=new Ce(new gc(2.2,.08,10,48),k);Y.rotation.x=Math.PI/2,Y.position.y=3.26,E.add(Y);const dt=new fs({map:P,color:tm.clone(),transparent:!0,opacity:.4,blending:Ki,depthWrite:!1}),ot=new cs(dt);ot.scale.set(7.6,7.6,1),ot.position.y=4.1,E.add(ot);const ht=new Ce(new js(.04,.06,1.1,8),new Zi({color:"#05070c",roughness:.4,metalness:.6}));ht.position.y=3.2+2.2+.5,E.add(ht);const Tt=new Ti({color:$p}),Vt=new Ce(new ko(.11,10,10),Tt);Vt.position.y=3.2+2.2+1.08,E.add(Vt);const ae=new mS(4033535,30,52,1.6);ae.position.set(cc.x,5.2,cc.z),A.add(ae);const D=[];{const Lt=[{y:12.5,z:-20,speed:1.5,dir:1,color:"#22d3ee",offset:-30},{y:15.5,z:-27,speed:1.05,dir:-1,color:"#f0abfc",offset:18},{y:10.5,z:-15,speed:2,dir:1,color:"#ffd9a0",offset:42}];for(const Dt of Lt){const ce=new Sa,be=new Ce(new f0(.17,1.15,4,10),new Zi({color:"#0b0e1d",roughness:.3,metalness:.75}));be.rotation.z=Math.PI/2,ce.add(be);const xe=new fs({map:P,color:new he(Dt.color),transparent:!0,opacity:.75,blending:Ki,depthWrite:!1}),pe=new cs(xe);pe.scale.set(3.4,.65,1),pe.position.x=-1.5,ce.add(pe),Dt.dir<0&&(ce.rotation.y=Math.PI),ce.position.set(Dt.offset,Dt.y,Dt.z),A.add(ce),D.push({group:ce,speed:Dt.speed,offset:Dt.offset,y:Dt.y,z:Dt.z,dir:Dt.dir})}}const $=[],xt=new Map,At=[],Ct=o.length,qt=_.clientWidth/Math.max(1,_.clientHeight),le=qt<1?1.05:1.7,wt=qt<1?9.5:11.5,Wt=new Zi({color:"#131824",roughness:.45,metalness:.65}),de=new Zi({color:"#05070c",roughness:.4,metalness:.6}),Me=new Zi({color:"#272c38",metalness:.85,roughness:.38,side:Pi});o.forEach((Lt,Dt)=>{const be=(Ct===1?0:Dt/(Ct-1)-.5)*le,xe=new Z(Math.sin(be)*wt,0,-2.5-(1-Math.cos(be))*7),pe=new he(Lt.viz.color),Re=new Sa;Re.position.copy(xe),A.add(Re);const nn=new Ce(new Ri(4,si,4),new Zi({color:"#0d1424",roughness:.5,metalness:.4}));nn.position.y=si/2,Re.add(nn);const zn=new Ce(new Ri(4.18,.05,4.18),new Ti({color:pe,transparent:!0,opacity:.5}));zn.position.y=si-.03,Re.add(zn);const St=new Ti({color:pe.clone(),transparent:!0,opacity:.6,side:Pi}),jt=new Ce(new mc(2.35,2.8,48),St);jt.rotation.x=-Math.PI/2,jt.position.y=.05,Re.add(jt);const we=new Ce(new Jo(1,1),new Ti({map:P,color:pe.clone(),transparent:!0,opacity:.07,blending:Ki,depthWrite:!1}));we.rotation.x=-Math.PI/2,we.position.y=.06,we.userData.noHit=!0,we.scale.set(5.6,5.6,1),Re.add(we);const dn=new Zi({map:kS(1e3+Dt*131),roughness:.85,metalness:.15}),ln=1.7,rn=new Ri(ln,1,ln);rn.translate(0,.5,0);const Jn=new Ce(rn,dn);Jn.position.y=si,Re.add(Jn);const Bi=[],ba=new Ri(.055,1,.055);ba.translate(0,.5,0);const Fn=ln/2;for(const[Tn,ti]of[[-Fn,-Fn],[Fn,-Fn],[-Fn,Fn],[Fn,Fn]]){const ua=new Ce(ba,new Ti({color:pe,transparent:!0,opacity:.4}));ua.position.set(Tn,si,ti),Re.add(ua),Bi.push(ua)}const Ln=[],$e=jm(A3(Lt.codename)+97),Rn=.7+Math.floor($e()*3)*.04,G=($e()<.5?2:3)===2?[.58,.42]:[.44,.33,.23];let lt=Rn,nt=1.38;G.forEach((Tn,ti)=>{const ua=(1-Rn)*Tn,Ir=new Ce(new Ri(nt+.18,.07,nt+.14),de);Ir.position.set(0,si+us*lt,0),Re.add(Ir),Ln.push({mesh:Ir,yFrac:lt,hFrac:0});const zr=new Ri(nt,1,nt*(.88+$e()*.16));zr.translate(0,.5,0);const Br=new Ce(zr,dn);if(Br.position.set(($e()-.5)*.44,si+us*lt,($e()-.5)*.36),ti>0&&$e()<.6&&(Br.rotation.y=($e()-.5)*.4),Re.add(Br),Ln.push({mesh:Br,yFrac:lt,hFrac:ua}),ti===G.length-1&&$e()<.55){const Fr=new Ce(new Ri(.1,1,nt*.55),de);Fr.geometry.translate(0,.5,0),Fr.position.set(nt*.32,si+us*lt,-nt*.18),Re.add(Fr),Ln.push({mesh:Fr,yFrac:lt+ua*.55,hFrac:ua*.75})}lt+=ua,nt=Math.max(.58,nt-.3-$e()*.12)});const at={halted:!1},Ut=new Sa,Qt=new Ce(new Ri(1.58,1.58,.1),de);Ut.add(Qt);const It=document.createElement("canvas");It.width=Zn,It.height=Zn,em(It,Lt,null);const Gt=new jo(It);Gt.colorSpace=di,Gt.anisotropy=4;const Jt=new Ce(new Jo(1.42,1.42),new Ti({map:Gt}));Jt.position.z=.06,Ut.add(Jt);const me=new fs({map:P,color:pe,transparent:!0,opacity:.16,blending:Ki,depthWrite:!1}),Ee=new cs(me);Ee.scale.set(3.1,3.1,1),Ee.position.z=-.15,Ut.add(Ee),Ut.position.set(0,si+us*.7*.55,.88),Re.add(Ut);const kt=()=>{const Tn=v0(Lt.codename,Km(Lt.codename));if(!Tn){em(It,Lt,null,at.halted),Gt.needsUpdate=!0;return}const ti=new Image;ti.onload=()=>{em(It,Lt,ti,at.halted),Gt.needsUpdate=!0},ti.src=Tn};kt();const Se=new Sa;Se.position.y=si+us,Re.add(Se);const yn=new Ce(new js(.1,.16,.5,10),de);yn.position.y=.25,Se.add(yn);const Ve=new Sa;Ve.position.y=.52,Ve.rotation.x=-.5,Se.add(Ve);const Fe=[];for(let Tn=0;Tn<=10;Tn++){const ti=Tn/10*1.02;Fe.push(new te(ti,.4*ti*ti))}const bn=new Ce(new p0(Fe,30),Me);Ve.add(bn);const ee=new Ti({color:new he("#7dd3fc"),transparent:!0,opacity:.28}),Un=new Ce(new gc(1.02,.022,8,40),ee);Un.rotation.x=Math.PI/2,Un.position.y=.4,Ve.add(Un);const Xe=new Ce(new js(.028,.028,.85,6),de);Xe.position.y=.42,Ve.add(Xe);const Qi=new Ce(new ko(.085,10,10),de);Qi.position.y=.85,Ve.add(Qi);const ge=new Ti({color:Go.clone(),transparent:!0,opacity:0,blending:Ki,depthWrite:!1,side:Pi,fog:!1}),Ta=new js(.13,.3,17,12,1,!0);Ta.translate(0,8.5,0);const $n=new Ce(Ta,ge);$n.userData.noHit=!0,$n.position.y=.62,$n.renderOrder=5,Se.add($n);const wi=new fs({map:P,color:Go.clone(),transparent:!0,opacity:0,blending:Ki,depthWrite:!1}),ye=new cs(wi);ye.scale.set(2.6,2.6,1),ye.position.y=.72,Se.add(ye);const tn=new Ti({color:Go.clone(),transparent:!0,opacity:0,side:Pi,blending:Ki,depthWrite:!1}),Hn=new Ce(new mc(.88,1,40),tn);Hn.userData.noHit=!0,Hn.rotation.x=-Math.PI/2,Hn.position.y=.66,Se.add(Hn);const pn=cc.clone().sub(xe).setY(0).normalize(),xn=xe.clone().addScaledVector(pn,1.8);xn.y=.14;const ri=cc.clone().addScaledVector(pn,-4.55);ri.y=.14;const gs=xn.clone().lerp(ri,.5);gs.y=.34;const Ci=new Bf(xn,gs,ri),nl=new Ce(new Ff(Ci,24,.085,7),Wt);A.add(nl);const il=new Bf(xn.clone().add(new Z(0,.13,0)),gs.clone().add(new Z(0,.13,0)),ri.clone().add(new Z(0,.13,0))),al=new Ce(new Ff(il,24,.05,6),new Ti({color:pe,transparent:!0,opacity:.9}));A.add(al);const ka=[];for(let Tn=0;Tn<3;Tn++){const ti=new cs(new fs({map:P,color:pe,transparent:!0,opacity:.95,blending:Ki,depthWrite:!1}));ti.scale.set(1.15,1.15,1),A.add(ti),ka.push(ti)}const vs=N3(Lt);vs.sprite.position.set(xe.x,si+us+3,xe.z),A.add(vs.sprite),Re.traverse(Tn=>{Tn instanceof Ce&&!Tn.userData.noHit&&(Tn.userData.botName=Lt.name,At.push(Tn))}),vs.sprite.userData.botName=Lt.name,At.push(vs.sprite);const sl={bot:Lt,pos:xe,baseColor:pe,ringMat:St,facadeMat:dn,tower:Jn,edges:Bi,shaftFrac:Rn,crown:Ln,topGroup:Se,beamMat:ge,dishGlow:ye,dishRing:Hn,groundGlow:we,screenGroup:Ut,screenCanvas:It,screenTex:Gt,applyScreen:kt,visual:at,conduitCurve:il,flowSprites:ka,label:vs,currentH:us,targetH:us,phase:Math.random()*Math.PI*2,flashColor:null,flashT0:0,flashStrength:0,nodes:new Map};$.push(sl),xt.set(Lt.name,sl)});const Ge=()=>{$.forEach(Lt=>Lt.applyScreen())};window.addEventListener(Ec,Ge);const Pe=250,ze=375,re=new v1,gn=new te,Ne=x.domElement;let vn=0,Cn=0,An=!1,j=!0,_n=null,Ye=0,Ue=null,Ht=!1,Be=0,se=!1,ie=null,O="";function R(Lt,Dt){const ce=Ne.getBoundingClientRect();if(ce.width===0||ce.height===0)return null;gn.set((Lt-ce.left)/ce.width*2-1,-((Dt-ce.top)/ce.height)*2+1),re.setFromCamera(gn,y);const be=re.intersectObjects(At,!1),xe=be.length?be[0].object.userData.botName:null;return typeof xe=="string"?xe:null}function it(Lt,Dt){Ue=Lt,Ht=Dt,_n=null,Be=0,!Lt&&h&&(h.current=null),g.current?.(Lt,Dt)}const Nt=Lt=>{vn=Lt.clientX,Cn=Lt.clientY,j=Lt.pointerType==="mouse",An=!0},yt=Lt=>{vn=Lt.clientX,Cn=Lt.clientY,j=Lt.pointerType==="mouse",An=!0},zt=()=>{An=!1},Bt=Lt=>{const Dt=R(Lt.clientX,Lt.clientY);Dt?Ue===Dt&&Ht?(ie=Dt,it(null,!1)):it(Dt,!0):Ht&&it(null,!1)};Ne.addEventListener("pointermove",Nt),Ne.addEventListener("pointerdown",yt),Ne.addEventListener("pointerleave",zt),Ne.addEventListener("click",Bt),d&&(d.current={holdOpen:()=>{se=!0,Be=0},releaseHold:()=>{se=!1},dismiss:()=>{Ue&&(ie=Ue,it(null,!1))}});function mt(Lt){const Dt=An&&j?R(vn,Cn):null,ce=Dt?"pointer":"";if(ce!==O&&(O=ce,Ne.style.cursor=ce),ie&&Dt!==ie&&(ie=null),Ue?Ht||(se||Dt===Ue?(Be=0,_n=null):Dt&&Dt!==ie?(_n!==Dt?(_n=Dt,Ye=Lt):Lt-Ye>=Pe&&it(Dt,!1),Be=0):(_n=null,Be===0?Be=Lt+ze:Lt>=Be&&it(null,!1))):Dt&&Dt!==ie?_n!==Dt?(_n=Dt,Ye=Lt):Lt-Ye>=Pe&&it(Dt,!1):_n=null,Ue&&h){const be=xt.get(Ue);if(be){y.updateMatrixWorld();const xe=be.label.sprite.position.clone().project(y),pe=Ne.getBoundingClientRect();h.current={name:Ue,x:pe.left+(xe.x*.5+.5)*pe.width,y:pe.top+(-xe.y*.5+.5)*pe.height,visible:xe.z<1}}}}const _t=[],Ot=[],F=[];function vt(Lt,Dt,ce,be){const xe=new Ti({color:Dt,transparent:!0,opacity:.9,side:Pi,blending:Ki,depthWrite:!1}),pe=new Ce(new mc(.92,1,48),xe);pe.rotation.x=-Math.PI/2,pe.position.set(Lt.x,.12,Lt.z),A.add(pe),_t.push({mesh:pe,t0:performance.now(),dur:be,maxScale:ce})}function gt(Lt,Dt,ce,be){const pe=new Float32Array(180),Re=new Float32Array(180);for(let jt=0;jt<60;jt++){pe[jt*3]=Lt.x,pe[jt*3+1]=Dt,pe[jt*3+2]=Lt.z;const we=Math.random()*Math.PI*2,dn=Math.random()*1.4;Re[jt*3]=Math.cos(we)*dn,Re[jt*3+1]=be?2.2+Math.random()*2.6:-(1.2+Math.random()*2.4),Re[jt*3+2]=Math.sin(we)*dn}const nn=new In;nn.setAttribute("position",new ca(pe,3));const zn=new Xm({color:ce,size:.16,transparent:!0,opacity:1,blending:Ki,depthWrite:!1}),St=new Wp(nn,zn);A.add(St),Ot.push({points:St,velocities:Re,t0:performance.now(),life:1500})}function Ft(Lt,Dt){const ce=new fs({map:P,color:lc,transparent:!0,opacity:.95,blending:Ki,depthWrite:!1}),be=new cs(ce);be.position.set(Lt.x,Dt,Lt.z),be.scale.set(1,1,1),A.add(be),F.push({sprite:be,mat:ce,t0:performance.now(),dur:550})}function X(Lt){const Dt=xt.get(Lt.bot);if(!Dt)return;const ce=si+Dt.currentH+1.1;Lt.kind==="win"?(vt(Dt.pos,Go,5.6,1100),vt(Dt.pos,$p,3.8,850),gt(Dt.pos,ce,new he("#3ff5c8"),!0),Dt.flashColor=Go.clone(),Dt.flashStrength=.95,Dt.flashT0=performance.now()):Lt.kind==="loss"?(Ft(Dt.pos,ce),vt(Dt.pos,lc,2.8,800),gt(Dt.pos,ce,new he("#ff6a55"),!1),Dt.flashColor=lc.clone(),Dt.flashStrength=.95,Dt.flashT0=performance.now()):(vt(Dt.pos,Dt.baseColor,2,650),Dt.flashColor=Dt.baseColor.clone(),Dt.flashStrength=.45,Dt.flashT0=performance.now())}function pt(Lt,Dt,ce){const be=new Sa,xe=new Ce(new ko(.15,14,14),new Ti({color:Lt.baseColor}));be.add(xe);const pe=document.createElement("canvas");pe.width=256,pe.height=72;const Re=pe.getContext("2d");Re.textAlign="center",Re.textBaseline="middle",Re.fillStyle="rgba(5,10,20,0.6)",Re.beginPath(),Re.roundRect(28,8,200,56,14),Re.fill(),Re.fillStyle="#e6edf3",wf(Re,ce,185,30,"600"),Re.fillText(ce,128,38);const nn=new jo(pe);nn.colorSpace=di;const zn=new cs(new fs({map:nn,transparent:!0,depthWrite:!1}));zn.scale.set(1.7,.48,1),zn.position.y=.46,be.add(zn),A.add(be);const St=new In;St.setAttribute("position",new ca(new Float32Array(6),3));const jt=new Vm(St,new u0({color:Lt.baseColor,transparent:!0,opacity:.55}));return A.add(jt),{group:be,sphere:xe,line:jt,lineGeo:St,angleOffset:Dt.length*1.37%(Math.PI*2)}}let Rt=1;function Xt(){const Lt=_.clientWidth||1,Dt=_.clientHeight||1;x.setSize(Lt,Dt),Rt=Lt/Dt,y.aspect=Rt,y.fov=Rt<1?76:Rt<1.5?60:52,y.updateProjectionMatrix()}Xt();const bt=new ResizeObserver(Xt);bt.observe(_);let Zt=0;const oe=new _1;let Pt=0;function Ze(){Zt=requestAnimationFrame(Ze);const Lt=Math.min(oe.getDelta(),.1),Dt=oe.elapsedTime,ce=performance.now(),be=Date.now(),xe=Rt<1,pe=xe?13.2:Rt<1.5?20:17.5;for(y.position.x=Math.sin(Dt*.07)*(xe?1.3:2.3),y.position.y=(xe?6.3:9.4)+Math.sin(Dt*.11)*(xe?.35:.55),y.position.z=pe+Math.cos(Dt*.05)*(xe?.5:.9),y.lookAt(0,xe?2.6:2.1,xe?-3:-3.4),mt(ce);i.current.length>0;){const St=i.current.shift();X(St)}let Re=0;for(const St of t.current.values())for(const jt of St.recentCloses)be-jt.ts<1e4&&(Re+=1);const nn=.45+Math.min(1.3,Re*.22)+Math.sin(Dt*2.2)*.06,zn=.5+.5*Math.sin(Dt*2.2);k.color.copy(E3).lerp(tm,.25+zn*.35+Math.min(.4,nn*.22)),dt.opacity=.2+zn*.12+Math.min(.45,nn*.3),V.emissiveIntensity=.06+Math.min(.3,nn*.16),ae.intensity=14+nn*24,W.opacity=.35+Math.min(.55,nn*.3);for(const St of D){let we=(St.offset+Dt*St.speed*St.dir)%110;we>110/2&&(we-=110),we<-110/2&&(we+=110),St.group.position.set(we,St.y+Math.sin(Dt*.6+St.offset)*.35,St.z)}for(const St of $){St.currentH+=(St.targetH-St.currentH)*Math.min(1,Lt*1.6);const jt=St.currentH,we=jt*St.shaftFrac;St.tower.scale.y=we;for(const T of St.edges)T.scale.y=we;for(const T of St.crown)T.mesh.position.y=si+jt*T.yFrac,T.hFrac>0&&(T.mesh.scale.y=jt*T.hFrac);St.topGroup.position.y=si+jt,St.screenGroup.position.y=si+we*.55,St.label.sprite.position.y=si+jt+3;const dn=Math.max(1,Math.round(we/2.4));St.facadeMat.map&&St.facadeMat.map.repeat.y!==dn&&(St.facadeMat.map.repeat.y=dn);const ln=s?.current.has(St.bot.name)??!1;St.visual.halted!==ln&&(St.visual.halted=ln,St.applyScreen(),ln&&(St.flashColor=null)),St.facadeMat.color.lerp(ln?y3:S3,.07);const rn=t.current.get(St.bot.name),Jn=rn?m3(rn,be):0,Bi=ln?lc.clone():St.baseColor.clone();ln||(Jn>0?Bi.lerp(Go,Jn*.9):Jn<0&&Bi.lerp(lc,-Jn*.9)),St.ringMat.color.lerp(Bi,.06);const ba=ln?.9:.5+Math.abs(Jn)*.45;St.ringMat.opacity+=(ba-St.ringMat.opacity)*.08;let Fn=0,Ln=0;if(St.flashColor){const T=ce-St.flashT0,G=1e3;T<G?(Ln=T/G,Fn=(1-Ln)*St.flashStrength):St.flashColor=null}if(St.flashColor&&Fn>0&&!ln){St.beamMat.color.copy(St.flashColor),St.beamMat.opacity=Fn*.8,St.dishGlow.material.color.copy(St.flashColor),St.dishGlow.material.opacity=Fn*.95;const T=2.6+Ln*1.9;St.dishGlow.scale.set(T,T,1),St.dishRing.material.color.copy(St.flashColor),St.dishRing.material.opacity=Fn*.65;const G=.7+Ln*2.6;St.dishRing.scale.set(G,G,1),St.groundGlow.material.color.copy(St.flashColor),St.groundGlow.material.opacity=.1+Fn*.55;const lt=5.6+Ln*2.2;St.groundGlow.scale.set(lt,lt,1)}else St.beamMat.opacity=0,St.dishGlow.material.opacity=0,St.dishRing.material.opacity=0,ln?(St.groundGlow.material.color.lerp(M3,.08),St.groundGlow.material.opacity+=(.17-St.groundGlow.material.opacity)*.08):(St.groundGlow.material.color.lerp(St.baseColor,.08),St.groundGlow.material.opacity+=(.07-St.groundGlow.material.opacity)*.08),St.groundGlow.scale.set(5.6,5.6,1);for(let T=0;T<St.flowSprites.length;T++){const G=(Dt*.16+T/St.flowSprites.length+St.phase)%1,lt=St.conduitCurve.getPoint(G);St.flowSprites[T].position.copy(lt);const nt=.9+Math.sin(G*Math.PI)*.55;St.flowSprites[T].scale.set(nt,nt,1)}const $e=new Map;if(rn)for(const T of rn.openPositions)$e.set(T.key,T.symbol);for(const T of[...St.nodes.keys()])if(!$e.has(T)){const G=St.nodes.get(T);A.remove(G.group),A.remove(G.line),G.lineGeo.dispose(),St.nodes.delete(T)}for(const[T,G]of $e)St.nodes.has(T)||St.nodes.set(T,pt(St,T,G));let Rn=0;for(const T of St.nodes.values()){const G=Dt*.55+T.angleOffset+Rn*1.1,lt=St.pos.x+Math.cos(G)*3,nt=St.pos.z+Math.sin(G)*3,at=si+jt*.55+Math.sin(Dt*1.4+T.angleOffset)*.25;T.group.position.set(lt,at,nt);const Ut=T.lineGeo.getAttribute("position");Ut.setXYZ(0,St.pos.x,si+jt*.85,St.pos.z),Ut.setXYZ(1,lt,at,nt),Ut.needsUpdate=!0,Rn+=1}}if(ce-Pt>250){Pt=ce;for(const St of $){const jt=t.current.get(St.bot.name),we=jt?jt.equity:ya,dn=b?T3[St.bot.codename.toLowerCase()]??we:we;St.targetH=b3(dn);const ln=jt?jt.openPositions.length:0,rn=b?dn-ya:jt?jt.realized:0,Jn=s?.current.has(St.bot.name)??!1;Wy(St.label,St.bot,Kn(dn),Jn?"⛔ HALTED — trading stopped":`${ln} open · ${Kn(rn,!0)} realized`,Jn?"#ff6a55":"#8b98a9")}}for(let St=_t.length-1;St>=0;St--){const jt=_t[St],we=(ce-jt.t0)/jt.dur;if(we>=1)A.remove(jt.mesh),jt.mesh.geometry.dispose(),jt.mesh.material.dispose(),_t.splice(St,1);else{const dn=.4+we*jt.maxScale;jt.mesh.scale.set(dn,dn,1),jt.mesh.material.opacity=.9*(1-we)}}for(let St=Ot.length-1;St>=0;St--){const jt=Ot[St],we=ce-jt.t0;if(we>=jt.life)A.remove(jt.points),jt.points.geometry.dispose(),jt.points.material.dispose(),Ot.splice(St,1);else{const dn=jt.points.geometry.getAttribute("position"),ln=dn.array;for(let rn=0;rn<ln.length;rn+=3)ln[rn]=ln[rn]+jt.velocities[rn]*Lt,ln[rn+1]=ln[rn+1]+jt.velocities[rn+1]*Lt,ln[rn+2]=ln[rn+2]+jt.velocities[rn+2]*Lt;dn.needsUpdate=!0,jt.points.material.opacity=1-we/jt.life}}for(let St=F.length-1;St>=0;St--){const jt=F[St],we=(ce-jt.t0)/jt.dur;if(we>=1)A.remove(jt.sprite),jt.mat.dispose(),F.splice(St,1);else{const dn=1+we*4.2;jt.sprite.scale.set(dn,dn,1),jt.mat.opacity=.95*(1-we)}}x.render(A,y)}return Ze(),()=>{window.removeEventListener(Ec,Ge),Ne.removeEventListener("pointermove",Nt),Ne.removeEventListener("pointerdown",yt),Ne.removeEventListener("pointerleave",zt),Ne.removeEventListener("click",Bt),d&&(d.current=null),h&&(h.current=null),g.current?.(null,!1),cancelAnimationFrame(Zt),bt.disconnect(),A.traverse(Lt=>{if(Lt instanceof Ce||Lt instanceof Wp||Lt instanceof Vm){Lt.geometry?.dispose();const Dt=Lt.material;Array.isArray(Dt)?Dt.forEach(be=>be.dispose()):Dt?.dispose();const ce=Dt?.map;ce&&ce.dispose()}Lt instanceof cs&&(Lt.material.map?.dispose(),Lt.material.dispose())}),A.background?.dispose?.(),P.dispose(),x.dispose(),_.removeChild(x.domElement),p.current=!1}},[o]),z.jsx("div",{ref:m,className:"landscape-canvas","aria-label":"Bot landscape"})}function L3({curve:o,color:t}){const i=fe.useRef(null);return fe.useEffect(()=>{const s=i.current;if(!s)return;const l=s.getContext("2d");if(!l)return;const u=s.width,h=s.height;if(l.clearRect(0,0,u,h),o.length<2){l.strokeStyle="rgba(139,152,169,0.5)",l.beginPath(),l.moveTo(0,h/2),l.lineTo(u,h/2),l.stroke();return}const d=Math.min(...o),p=Math.max(...o)-d||1;l.strokeStyle=t,l.lineWidth=1.6,l.beginPath(),o.forEach((S,g)=>{const _=g/(o.length-1)*(u-4)+2,x=h-3-(S-d)/p*(h-6);g===0?l.moveTo(_,x):l.lineTo(_,x)}),l.stroke()},[o,t]),z.jsx("canvas",{ref:i,width:110,height:30,className:"sparkline"})}function U3({bots:o,stats:t,haltedNames:i}){const[s,l]=fe.useState(null),[u,h]=fe.useState(null),d=new Map(o.map(p=>[p.name,p])),m=[...t.values()].map(p=>({stats:p,bot:d.get(p.name),netPct:(p.equity-ya)/ya*100,winRate:p.closes>0?p.wins/p.closes*100:null,ddPct:p.maxDrawdown/ya*100})).sort((p,S)=>S.netPct-p.netPct);return m.length===0?z.jsx("p",{className:"empty",children:"Waiting for bot data…"}):z.jsxs("div",{className:"leaderboard",children:[z.jsxs("table",{children:[z.jsx("thead",{children:z.jsxs("tr",{children:[z.jsx("th",{children:"#"}),z.jsx("th",{children:"Bot"}),z.jsx("th",{children:"Net PnL"}),z.jsx("th",{children:"Net %"}),z.jsx("th",{children:"Win rate"}),z.jsx("th",{children:"Trades"}),z.jsx("th",{children:"Equity"}),z.jsx("th",{children:"Max DD"}),z.jsx("th",{children:"Equity curve"})]})}),z.jsx("tbody",{children:m.map((p,S)=>{const g=p.stats,_=p.bot?.viz.color??"#8b98a9",x=s===g.name;return[z.jsxs("tr",{className:"lb-row",onClick:()=>l(x?null:g.name),title:"Click for philosophy + open positions",children:[z.jsx("td",{className:"lb-rank",children:S+1}),z.jsx("td",{children:z.jsxs("span",{className:"lb-bot",children:[z.jsx(Yo,{bot:p.bot,name:g.name,onEdit:p.bot?()=>h(p.bot):void 0}),z.jsxs("span",{children:[g.name,i?.has(g.name)&&z.jsx("span",{className:"halted-badge",children:"⛔ HALTED"}),z.jsx("span",{className:"lb-accessory",children:p.bot?.viz.avatar_accessory??""})]})]})}),z.jsx("td",{className:g.realized>=0?"pnl-pos":"pnl-neg",children:Kn(g.realized,!0)}),z.jsxs("td",{className:p.netPct>=0?"pnl-pos":"pnl-neg",children:[p.netPct>=0?"+":"",p.netPct.toFixed(2),"%"]}),z.jsx("td",{children:p.winRate===null?"—":`${p.winRate.toFixed(0)}%`}),z.jsx("td",{children:g.trades}),z.jsxs("td",{children:[Kn(g.equity),z.jsxs("span",{className:"lb-sub",children:["of ",Kn(ya)]})]}),z.jsxs("td",{children:[Kn(-g.maxDrawdown),z.jsxs("span",{className:"lb-sub",children:["-",p.ddPct.toFixed(2),"%"]})]}),z.jsx("td",{children:z.jsx(L3,{curve:g.curve,color:_})})]},g.name),x&&z.jsx("tr",{className:"lb-detail",children:z.jsxs("td",{colSpan:9,children:[z.jsxs("div",{className:"lb-detail-head",children:[z.jsx(Yo,{bot:p.bot,name:g.name,onEdit:p.bot?()=>h(p.bot):void 0}),z.jsx("strong",{children:g.name}),z.jsx("span",{className:"lb-accessory",children:p.bot?.viz.avatar_accessory??""}),z.jsx("span",{className:"hint",children:"Click the avatar (or its ✎) to change it."})]}),z.jsxs("div",{className:"lb-detail-grid",children:[z.jsxs("div",{children:[z.jsx("h4",{children:"Philosophy"}),z.jsx("p",{className:"philosophy",children:p.bot?.philosophy?.trim()?p.bot.philosophy.trim():"No philosophy text in this bot's .md file."})]}),z.jsxs("div",{children:[z.jsxs("h4",{children:["Open positions (",g.openPositions.length,")"]}),g.openPositions.length===0?z.jsx("p",{className:"empty",children:"None open right now."}):z.jsx("ul",{className:"open-list",children:g.openPositions.map(b=>z.jsxs("li",{children:["“",b.symbol,"” — ",b.side??""," ",b.qty??""," @"," ",b.price!==null?Kn(b.price):"?"]},b.key))}),z.jsxs("p",{className:"lb-meta",children:["Strategy: ",p.bot?.strategy??"—"," · Market:"," ",p.bot?.market??"—"," · Mode: ",p.bot?.mode??"—"]})]})]})]})},`${g.name}-detail`)]})})]}),z.jsxs("p",{className:"hint",children:["Ranked by net PnL % — fair because every bot starts with the same"," ",Kn(ya),". Click a bot for its philosophy and open positions. Figures accumulate from when this page connected (no history API yet)."]}),u&&z.jsx(x3,{bot:u,onClose:()=>h(null)})]})}const Sf={sim:"Simulator",paper:"Paper trading",connected:"Live cash account"};function qS(o,t){const i=o.liquidation,s=o.action!=="kill-liquidate"?"":!i||i.status==="pending"?" — liquidating…":` — ${i.closed.length} position${i.closed.length===1?"":"s"} closed`+(i.failed.length>0?` · ${i.failed.length} could not be closed`:"");if(o.scope==="fleet")return o.action==="kill"?"⛔⛔ TEAM KILL — all bots halted":o.action==="resume"?"▶▶ TEAM RESUMED — all bots trading":`⛔⛔ TEAM KILL + LIQUIDATE${s}`;const l=o.target?t(o.target):"Bot";return o.action==="kill"?`⛔ ${l} KILLED — trading halted`:o.action==="resume"?`▶ ${l} resumed`:`⛔ ${l} KILL + LIQUIDATE${s}`}const Vo=`http://${window.location.hostname}:8080`,O3=`ws://${window.location.hostname}:8080/events`,P3=5e3,I3=1e3;function WS(o){let t=0,i=0;const s=[];for(const l of o){if(l.decision_id!==null){if(t>=P3)continue;t+=1}else{if(i>=I3)continue;i+=1}s.push(l)}return s}const YS=new URLSearchParams(window.location.search);function z3(){const[o,t]=fe.useState([]),[i,s]=fe.useState(null),[l,u]=fe.useState(null),[h,d]=fe.useState(null),[m,p]=fe.useState(!1),[S,g]=fe.useState("connecting"),[_,x]=fe.useState([]),[b,A]=fe.useState(YS.get("tab")==="leaderboard"?"leaderboard":"landscape"),[y,M]=fe.useState(YS.get("feed")==="open"),[N,P]=fe.useState("trades"),[L,I]=fe.useState("all"),[U,E]=fe.useState(""),[C,W]=fe.useState(null),[H,K]=fe.useState(null),[J,ut]=fe.useState(!1),[V,st]=fe.useState(null),[k,Y]=fe.useState(null),[dt,ot]=fe.useState([]),[ht,Tt]=fe.useState(!1),[Vt,ae]=fe.useState(!1),[D,$]=fe.useState(null),xt=fe.useRef([]),At=fe.useRef(new Set),Ct=fe.useRef(GS([],[])),qt=fe.useRef(null),le=fe.useRef(null),wt=fe.useRef(new Set);function Wt(){le.current?.dismiss(),st(null)}fe.useEffect(()=>{if(!V)return;const X=pt=>{pt.key==="Escape"&&Wt()};return window.addEventListener("keydown",X),()=>window.removeEventListener("keydown",X)},[V]);const de=fe.useMemo(()=>new Map(o.map(X=>[X.name,X])),[o]),Me=fe.useMemo(()=>new Map(o.map(X=>[X.codename,X])),[o]),Ge=fe.useMemo(()=>GS(o,_),[o,_]),Pe=fe.useMemo(()=>p3(_),[_]),ze=X=>Me.get(X)?.name??X,re=fe.useMemo(()=>{const X=new Set;if(k){for(const[pt,Rt]of Object.entries(k.bots))if(Rt.halted){const Xt=Me.get(pt);Xt&&X.add(Xt.name)}}return X},[k,Me]);fe.useEffect(()=>{wt.current=re},[re]);function gn(X){ot(pt=>{const Rt=pt.findIndex(Xt=>Xt.id===X.id);if(Rt>=0){const Xt=[...pt];return Xt[Rt]=X,Xt}return[X,...pt].slice(0,100)})}async function Ne(X){Tt(!0);try{const Rt=await(await fetch(`${Vo}${X}`,{method:"POST"})).json();Rt.state&&Y(Rt.state),Rt.entry&&gn(Rt.entry)}catch{}finally{Tt(!1)}}const vn=X=>{Vt&&(ae(!1),Ne(`/control/bots/${X}/kill`))},Cn=X=>{Ne(`/control/bots/${X}/resume`)},An=()=>{Vt&&(ae(!1),Ne("/control/fleet/kill"))},j=()=>{Ne("/control/fleet/resume")};function _n(X){if(!Vt)return;const pt=Ge.get(X.name);$({scope:"bot",codename:X.codename,label:X.name,positions:pt?pt.openPositions.length:0})}function Ye(){if(!Vt)return;let X=0;for(const pt of Ge.values())X+=pt.openPositions.length;$({scope:"fleet",label:"ALL BOTS",positions:X})}function Ue(){const X=D;!X||!Vt||($(null),ae(!1),Ne(X.scope==="fleet"?"/control/fleet/kill-liquidate":`/control/bots/${X.codename}/kill-liquidate`))}async function Ht(X){p(!0);try{const Rt=await(await fetch(`${Vo}/mode`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({mode:X})})).json();Rt.state&&u(Rt.state)}catch{}finally{p(!1),d(null)}}function Be(){!h||m||Ht(h)}fe.useEffect(()=>{Ct.current=Ge},[Ge]),fe.useEffect(()=>{let X=!1;return fetch(`${Vo}/mode`).then(pt=>{if(!pt.ok)throw new Error(`HTTP ${pt.status}`);return pt.json()}).then(pt=>{X||u(pt)}).catch(()=>{}),()=>{X=!0}},[]),fe.useEffect(()=>{let X=!1;return fetch(`${Vo}/bots`).then(pt=>{if(!pt.ok)throw new Error(`HTTP ${pt.status}`);return pt.json()}).then(pt=>{X||t(pt)}).catch(pt=>{X||s(pt instanceof Error?pt.message:String(pt))}),()=>{X=!0}},[]),fe.useEffect(()=>{let X=!1;return fetch(`${Vo}/control`).then(pt=>{if(!pt.ok)throw new Error(`HTTP ${pt.status}`);return pt.json()}).then(pt=>{X||(Y(pt),ot([...pt.audit].slice(0,100)))}).catch(()=>{}),()=>{X=!0}},[]),fe.useEffect(()=>{let X=!1;return fetch(`${Vo}/events/history`).then(pt=>{if(!pt.ok)throw new Error(`HTTP ${pt.status}`);return pt.json()}).then(pt=>{if(X)return;const Rt=pt.events.filter(Xt=>typeof Xt.seq!="number"?!0:At.current.has(Xt.seq)?!1:(At.current.add(Xt.seq),!0));Rt.length!==0&&x(Xt=>{const bt=new Set,Zt=[];for(const Pt of Xt){if(typeof Pt.seq=="number"){if(bt.has(Pt.seq))continue;bt.add(Pt.seq)}Zt.push(Pt)}const oe=[...Rt].sort((Pt,Ze)=>(Ze.seq??0)-(Pt.seq??0));for(const Pt of oe){if(typeof Pt.seq=="number"){if(bt.has(Pt.seq))continue;bt.add(Pt.seq)}Zt.push(Pt)}return WS(Zt)})}).catch(()=>{}),()=>{X=!0}},[]),fe.useEffect(()=>{const X=new WebSocket(O3);return X.onopen=()=>g("connected"),X.onclose=()=>g("disconnected"),X.onerror=()=>g("disconnected"),X.onmessage=pt=>{try{const Rt=JSON.parse(String(pt.data));if(Rt.kind==="control"){const bt=Rt;Y(bt.state),bt.entry&&gn(bt.entry);return}if(Rt.kind==="mode"){u(Rt.state);return}const Xt=Rt;if(typeof Xt.seq=="number"){if(At.current.has(Xt.seq))return;At.current.add(Xt.seq)}Xt.type==="close"&&Xt.pnl!==null&&Xt.pnl!==0?xt.current.push({bot:Xt.bot,kind:Xt.pnl>0?"win":"loss",ts:Date.now()}):Xt.type==="open"&&xt.current.push({bot:Xt.bot,kind:"open",ts:Date.now()}),x(bt=>WS([Xt,...bt]))}catch{}},()=>X.close()},[]);const se=L==="all"?_:_.filter(X=>X.bot===L),ie=U.trim().toLowerCase(),O=X=>ie===""||[X.bot,X.symbol??"",X.type,X.reason??""].join(" ").toLowerCase().includes(ie),R=se.filter(O),it=R.filter(X=>X.type==="open"||X.type==="close"),Nt=_[0],yt=ie===""?dt.filter(X=>L==="all"||X.scope==="fleet"||ze(X.target??"")===L):[],zt=[...it.map(X=>({kind:"trade",ts:X.ts,event:X})),...yt.map(X=>({kind:"control",ts:X.ts,entry:X}))].sort((X,pt)=>X.ts<pt.ts?1:X.ts>pt.ts?-1:0),Bt=dt[0],mt=Bt&&(!Nt||Bt.ts>=Nt.ts);function _t(X){W(X),K(X.decision_id)}const Ot=l?.running?.mode??l?.desired??null,F=l?.desired??null,vt=l?.switching??!1,gt=h!==null&&h!==F?h:null,Ft=gt!==null&&gt!=="paper"&&(l?.running?.mode??F)==="paper";return z.jsxs("main",{className:"page",children:[z.jsxs("header",{className:"header",children:[z.jsxs("div",{children:[z.jsx("h1",{children:"Trader Bot Landscape"}),z.jsx("p",{className:"subtitle",children:"Five bots, one valley — live paper-trading visualization."})]}),z.jsxs("div",{className:"header-badges",children:[z.jsxs("div",{className:"header-badges-row",children:[z.jsxs("span",{className:`ws-status ws-${S}`,children:[z.jsx("span",{className:"dot"})," WebSocket: ",S]}),Ot&&z.jsx("span",{className:`mode-badge mode-${Ot}`,role:"status",children:Ot==="sim"?"SIMULATED DATA":Ot==="paper"?"PAPER TRADING":"LIVE — CONNECTED ACCOUNTS"})]}),z.jsxs("div",{className:"mode-switch",children:[z.jsxs("div",{className:"mode-switch-row",children:[z.jsx("label",{className:"mode-switch-label",htmlFor:"fleet-mode-select",children:"Fleet mode"}),z.jsxs("select",{id:"fleet-mode-select",className:"mode-select","aria-label":"Fleet run mode",value:h??F??"sim",disabled:m||vt||l===null,onChange:X=>{const pt=X.target.value;d(pt===F?null:pt)},children:[z.jsx("option",{value:"sim",children:"Simulator"}),z.jsx("option",{value:"paper",children:"Paper trading"}),z.jsx("option",{value:"connected",disabled:!0,children:"Live cash account — not enabled yet"})]})]}),vt&&F&&z.jsxs("p",{className:"mode-note",role:"status",children:["⟳ Restarting the engine into ",Sf[F],"…"]}),gt&&z.jsxs("div",{className:"mode-confirm",role:"alertdialog","aria-label":"Confirm mode switch",children:[z.jsxs("p",{className:"mode-confirm-text",children:["Switch the whole fleet to"," ",z.jsx("strong",{children:Sf[gt]}),"? The engine will restart — the dashboard reconnects in a few seconds.",Ft&&z.jsxs(z.Fragment,{children:[" ","Open ",z.jsx("strong",{children:"paper positions will sit unmanaged"})," ","while the fleet is in ",Sf[gt]," mode."]})]}),z.jsxs("div",{className:"confirm-actions",children:[z.jsx("button",{className:"btn",onClick:()=>d(null),disabled:m,children:"Cancel"}),z.jsx("button",{className:"btn mode-switch-btn",onClick:Be,disabled:m,children:m?"Switching…":`Switch to ${Sf[gt]}`})]})]})]})]})]}),i&&z.jsxs("p",{className:"error",children:["Could not load bots: ",i]}),z.jsxs("section",{className:"totals-bar","aria-label":"Trader bot realized totals",children:[z.jsxs("div",{className:"total",children:[z.jsx("span",{className:"total-label",children:"Realized profits"}),z.jsx("span",{className:"total-value pnl-pos",children:Kn(Pe.profits)})]}),z.jsxs("div",{className:"total",children:[z.jsx("span",{className:"total-label",children:"Realized losses"}),z.jsx("span",{className:"total-value pnl-neg",children:Kn(-Pe.losses)})]}),z.jsxs("div",{className:"total",children:[z.jsx("span",{className:"total-label",children:"Net realized"}),z.jsx("span",{className:`total-value ${Pe.net>=0?"pnl-pos":"pnl-neg"}`,children:Kn(Pe.net,!0)})]}),z.jsxs("div",{className:"total total-meta",children:[z.jsx("span",{className:"total-label",children:"Closed trades seen"}),z.jsx("span",{className:"total-value",children:Pe.closes})]})]}),z.jsxs("section",{className:`control-bar${Vt?" armed":""}`,"aria-label":"Kill switch controls",children:[z.jsxs("div",{className:"control-status",children:[z.jsx("span",{className:"control-title",children:"⛔ Kill switch"}),z.jsx("span",{className:"control-state",children:k===null?"state unavailable":k.allHalted?"ALL BOTS HALTED":k.anyHalted?`${re.size} of ${o.length} bots halted`:"all bots active"})]}),z.jsxs("div",{className:"control-arm",children:[z.jsx("button",{type:"button",role:"switch","aria-checked":Vt,"aria-label":"Arm the kill buttons",className:`arm-switch${Vt?" on":""}`,onClick:()=>ae(X=>!X),children:z.jsx("span",{className:"arm-knob"})}),z.jsx("span",{className:"arm-label",children:Vt?"Kill buttons ARMED — one action, then they lock again":"Kill buttons locked — flip the switch to arm"})]}),z.jsxs("div",{className:"control-actions",children:[k?.anyHalted&&z.jsx("button",{className:"btn resume",onClick:j,disabled:ht,children:"▶ Resume all"}),z.jsx("button",{className:"btn kill",onClick:An,disabled:ht||!k||k.allHalted||!Vt,children:"⛔ Kill all"}),z.jsx("button",{className:"btn kill-liq",onClick:Ye,disabled:ht||!k||!Vt,children:"⛔ Kill + liquidate all"})]})]}),k?.anyHalted&&z.jsxs("div",{className:"halt-banner",role:"alert",children:["⛔"," ",k.allHalted?"ALL BOTS HALTED — no bot is trading.":`Halted: ${[...re].join(", ")}.`," ","Halts persist across restarts until deliberately resumed."]}),z.jsxs("nav",{className:"tabs","aria-label":"Views",children:[z.jsx("button",{className:b==="landscape"?"tab active":"tab",onClick:()=>A("landscape"),children:"Landscape"}),z.jsx("button",{className:b==="leaderboard"?"tab active":"tab",onClick:()=>A("leaderboard"),children:"Leaderboard"})]}),b==="landscape"?z.jsx("section",{className:"landscape-wrap","aria-label":"Landscape",children:J?z.jsx("div",{className:"landscape-fallback",children:z.jsx("p",{children:"The 3D landscape needs WebGL, which this browser/device could not provide. The totals, leaderboard, and trade stream below are fully live without it."})}):o.length===0?z.jsx("div",{className:"landscape-fallback",children:z.jsx("p",{children:"Loading bots…"})}):z.jsx(D3,{bots:o,statsRef:Ct,effectsRef:xt,haltedRef:wt,onUnavailable:()=>ut(!0),onInspect:(X,pt)=>st(X?{name:X,pinned:pt}:null),inspectAnchorRef:qt,inspectControlRef:le})}):z.jsx(U3,{bots:o,stats:Ge,haltedNames:re}),z.jsxs("section",{className:"feed","aria-label":"Trade stream",children:[z.jsxs("button",{className:"feed-bar",onClick:()=>M(X=>!X),"aria-expanded":y,children:[z.jsxs("span",{className:"feed-bar-title",children:["Trade Stream ",z.jsx("span",{className:"feed-count",children:it.length})]}),z.jsx("span",{className:"feed-latest",children:mt?`${qS(Bt,ze)} · ${wr(Bt.ts)}`:Nt?`${Nt.bot} ${Nt.type==="close"?"closed":Nt.type} ${Nt.symbol?`“${Nt.symbol}”`:""} · ${wr(Nt.ts)}`:"Waiting for events…"}),z.jsx("span",{className:"feed-chevron",children:y?"▾":"▸"})]}),y&&z.jsxs("div",{className:"feed-body",children:[z.jsxs("div",{className:"feed-controls",children:[z.jsxs("div",{className:"feed-tabs",children:[z.jsx("button",{className:N==="trades"?"tab small active":"tab small",onClick:()=>P("trades"),children:"Trades"}),z.jsx("button",{className:N==="decisions"?"tab small active":"tab small",onClick:()=>P("decisions"),children:"Decisions"})]}),z.jsxs("div",{className:"feed-filter-group",children:[z.jsx("input",{className:"feed-search",type:"text",placeholder:"Filter… e.g. QQQ",value:U,onChange:X=>E(X.target.value),"aria-label":"Filter the stream by text"}),z.jsxs("label",{className:"feed-filter",children:["Bot"," ",z.jsxs("select",{value:L,onChange:X=>I(X.target.value),children:[z.jsx("option",{value:"all",children:"All bots"}),o.map(X=>z.jsx("option",{value:X.name,children:X.name},X.codename))]})]})]})]}),N==="trades"?z.jsxs(z.Fragment,{children:[zt.length===0&&z.jsx("p",{className:"empty",children:ie?`No trades match “${U.trim()}”.`:"No trades yet — the stream is live."}),z.jsx("ul",{className:"feed-list",children:zt.map((X,pt)=>{if(X.kind==="control"){const oe=X.entry,Pt=oe.target?Me.get(oe.target):void 0;return z.jsxs("li",{className:`event system-row${oe.action==="resume"?" resumed":""}`,children:[Pt?z.jsx(Yo,{bot:Pt,name:Pt.name}):z.jsx("span",{className:"system-icon","aria-hidden":"true",children:oe.action==="resume"?"▶":"⛔"}),z.jsxs("span",{className:"event-main",children:[qS(oe,ze)," ·"," ",wr(oe.ts)]}),oe.liquidation&&oe.liquidation.failed.length>0&&z.jsxs("span",{className:"pnl-neg",children:[oe.liquidation.failed.length," unclosable"]})]},`ctl-${oe.id}`)}const Rt=X.event,Xt=de.get(Rt.bot),bt=Rt.side==="sell"?"sold":Rt.side==="buy"?"bought":Rt.type,Zt=H!==null&&Rt.decision_id===H;return z.jsxs("li",{className:`event${Zt?" highlighted":""}`,children:[z.jsx(Yo,{bot:Xt,name:Rt.bot}),z.jsxs("span",{className:"event-main",children:[z.jsx("strong",{children:Rt.bot})," ",bt," ",Rt.symbol&&z.jsxs(z.Fragment,{children:["“",Rt.symbol,"”"]})," ·"," ",wr(Rt.ts)]}),Rt.type==="close"&&Rt.pnl!==null&&z.jsx("span",{className:Rt.pnl>=0?"pnl-pos":"pnl-neg",children:Kn(Rt.pnl,!0)}),z.jsx("button",{className:"info-btn",onClick:()=>_t(Rt),title:"Decision detail","aria-label":`Decision detail for ${Rt.bot} ${Rt.symbol??""}`,children:"ⓘ"})]},`${Rt.ts}-${Rt.decision_id??""}-${pt}`)})})]}):z.jsxs(z.Fragment,{children:[R.length===0&&z.jsx("p",{className:"empty",children:ie?`No decisions match “${U.trim()}”.`:"No decisions recorded yet."}),z.jsx("ul",{className:"feed-list",children:R.map((X,pt)=>{const Rt=X.type==="open"||X.type==="close";return z.jsxs("li",{className:`event decision-row${Rt?"":" vetoed"}`,onClick:()=>_t(X),title:"Open decision detail",children:[z.jsxs("span",{className:"decision-id",children:["#",X.decision_id??"—"]}),z.jsxs("span",{className:"event-main",children:[z.jsx("strong",{children:X.bot})," — ",X.reason]}),!Rt&&z.jsx("span",{className:"veto-tag",children:X.type}),z.jsx("time",{className:"event-ts",children:wr(X.ts)})]},`d-${X.ts}-${X.decision_id??""}-${pt}`)})}),z.jsx("p",{className:"hint",children:"Every signal becomes a decision row; trades link back by decision id. Risk-Gate vetoes appear here greyed out — Trendia's Phase 1 paper decisions emit them live."})]})]})]}),b==="landscape"&&V&&de.get(V.name)&&Ge.get(V.name)&&z.jsx(B3,{bot:de.get(V.name),stats:Ge.get(V.name),trades:_.filter(X=>X.bot===V.name&&(X.type==="open"||X.type==="close")).slice(0,40),anchorRef:qt,controlRef:le,onClose:Wt,halted:re.has(V.name),controlBusy:ht,killArmed:Vt,onKill:()=>vn(de.get(V.name).codename),onResume:()=>Cn(de.get(V.name).codename),onKillLiquidate:()=>_n(de.get(V.name))}),D&&z.jsx("div",{className:"modal-backdrop",onClick:()=>$(null),children:z.jsxs("div",{className:"modal confirm-modal",role:"alertdialog","aria-modal":"true","aria-label":"Confirm kill and liquidate",onClick:X=>X.stopPropagation(),children:[z.jsxs("div",{className:"modal-head",children:[z.jsxs("h3",{children:["⛔ Kill + liquidate ",D.label,"?"]}),z.jsx("button",{className:"modal-close",onClick:()=>$(null),children:"✕"})]}),z.jsxs("p",{className:"confirm-text",children:["This halts"," ",D.scope==="fleet"?"every bot on the team":D.label," ","and immediately closes"," ",z.jsxs("strong",{children:[D.positions," open position",D.positions===1?"":"s"]})," ","at market prices. Closed positions cannot be reopened, and the halt persists across restarts until deliberately resumed. Any position that cannot be closed will be reported, not dropped."]}),z.jsxs("div",{className:"confirm-actions",children:[z.jsx("button",{className:"btn",onClick:()=>$(null),children:"Cancel"}),z.jsx("button",{className:"btn kill-liq",onClick:Ue,disabled:ht,children:ht?"Liquidating…":"Yes — kill + liquidate"})]})]})}),C&&z.jsx("div",{className:"modal-backdrop",onClick:()=>W(null),children:z.jsxs("div",{className:"modal",role:"dialog","aria-modal":"true","aria-label":"Decision detail",onClick:X=>X.stopPropagation(),children:[z.jsxs("div",{className:"modal-head",children:[z.jsxs("div",{className:"modal-title",children:[z.jsx(Yo,{bot:de.get(C.bot),name:C.bot}),z.jsxs("h3",{children:["Decision #",C.decision_id??"—"," — ",C.bot]})]}),z.jsx("button",{className:"modal-close",onClick:()=>W(null),children:"✕"})]}),z.jsxs("dl",{className:"decision-grid",children:[z.jsx("dt",{children:"Trigger / reason"}),z.jsx("dd",{children:C.reason}),z.jsx("dt",{children:"Action"}),z.jsxs("dd",{children:[C.type,C.side?` · ${C.side}`:""]}),z.jsx("dt",{children:"Instrument"}),z.jsx("dd",{children:C.symbol??"—"}),z.jsx("dt",{children:"Quantity"}),z.jsx("dd",{children:C.qty??"—"}),z.jsx("dt",{children:"Price"}),z.jsx("dd",{children:C.price!==null?Kn(C.price):"—"}),z.jsx("dt",{children:"Realized PnL"}),z.jsx("dd",{className:C.pnl===null?"":C.pnl>=0?"pnl-pos":"pnl-neg",children:C.pnl!==null?Kn(C.pnl,!0):"— (open)"}),z.jsx("dt",{children:"Timestamp"}),z.jsx("dd",{children:g3(C.ts)}),z.jsx("dt",{children:"Bot equity after"}),z.jsx("dd",{children:Ge.get(C.bot)?Kn(Ge.get(C.bot).equity):"—"})]}),z.jsx("p",{className:"hint",children:"Phases 1 + 3 + 4: Trendia's, Vega's and Snapback's decisions carry the full record — trigger, indicator values, params snapshot and the Risk-Gate verdict — in the reason text above (Vega's are labelled SHADOW · while his soak runs). The other bots still run the simulator (SIM ·) until their strategy plugins land."})]})})]})}function B3({bot:o,stats:t,trades:i,anchorRef:s,controlRef:l,onClose:u,halted:h,controlBusy:d,killArmed:m,onKill:p,onResume:S,onKillLiquidate:g}){const _=fe.useRef(null);return fe.useEffect(()=>{const x=performance.now();let b=0;const A=()=>{b=requestAnimationFrame(A);const y=_.current;if(!y)return;const M=s.current;if(!M||M.name!==o.name||!M.visible){performance.now()-x>600&&y.style.opacity!=="1"&&(y.style.transform=`translate(${Math.round(window.innerWidth/2-y.offsetWidth/2)}px, 84px)`,y.style.opacity="1");return}const N=y.offsetWidth,P=y.offsetHeight;let L=M.x-N/2,I=M.y+42;I+P>window.innerHeight-8&&(I=M.y-42-P),L=Math.max(8,Math.min(L,window.innerWidth-N-8)),I=Math.max(8,Math.min(I,Math.max(8,window.innerHeight-P-8))),y.style.transform=`translate(${Math.round(L)}px, ${Math.round(I)}px)`,y.style.opacity="1"};return b=requestAnimationFrame(A),()=>cancelAnimationFrame(b)},[s,o.name]),z.jsxs("div",{ref:_,className:"inspect-dialog",role:"dialog","aria-label":`${o.name} — holdings and today's trades`,onMouseEnter:()=>l.current?.holdOpen(),onMouseLeave:()=>l.current?.releaseHold(),children:[z.jsxs("div",{className:"modal-head",children:[z.jsxs("div",{className:"modal-title",children:[z.jsx(Yo,{bot:o,name:o.name}),z.jsx("h3",{children:o.name}),h&&z.jsx("span",{className:"halted-badge",children:"⛔ HALTED"})]}),z.jsx("button",{className:"modal-close",onClick:u,"aria-label":`Close ${o.name} details`,children:"✕"})]}),z.jsxs("div",{className:"inspect-stats",children:[z.jsxs("span",{children:["Equity ",z.jsx("strong",{children:Kn(t.equity)})]}),z.jsxs("span",{children:["Realized"," ",z.jsx("strong",{className:t.realized>=0?"pnl-pos":"pnl-neg",children:Kn(t.realized,!0)})]}),z.jsxs("span",{children:["Open ",z.jsx("strong",{children:t.openPositions.length})]})]}),z.jsx("div",{className:"inspect-controls",children:h?z.jsxs(z.Fragment,{children:[z.jsx("span",{className:"inspect-halted-note",children:"Kill switch engaged — this bot is not trading."}),z.jsxs("div",{className:"control-actions",children:[z.jsx("button",{className:"btn resume small",onClick:S,disabled:d,children:"▶ Resume"}),z.jsx("button",{className:"btn kill-liq small",onClick:g,disabled:d||!m,children:"⛔ Kill + liquidate"})]}),!m&&z.jsx("span",{className:"inspect-lock-note",children:"🔒 Liquidate is locked — arm the kill switch in the bar above to enable it."})]}):z.jsxs(z.Fragment,{children:[z.jsxs("div",{className:"control-actions",children:[z.jsx("button",{className:"btn kill small",onClick:p,disabled:d||!m,children:"⛔ Kill"}),z.jsx("button",{className:"btn kill-liq small",onClick:g,disabled:d||!m,children:"⛔ Kill + liquidate"})]}),!m&&z.jsx("span",{className:"inspect-lock-note",children:"🔒 Kill buttons are locked — arm the kill switch in the bar above to enable them."})]})}),z.jsx("h4",{className:"picker-group",children:"Current holdings"}),t.openPositions.length===0?z.jsx("p",{className:"empty",children:"No open positions right now."}):z.jsx("ul",{className:"inspect-list",children:t.openPositions.map(x=>z.jsxs("li",{children:[z.jsxs("span",{className:"inspect-item",children:[z.jsxs("strong",{children:["“",x.symbol,"”"]}),(x.qty!==null||x.price!==null)&&z.jsxs(z.Fragment,{children:[" ","— ",x.side??""," ",x.qty??"",x.price!==null?` @ ${Kn(x.price)}`:""]})]}),z.jsxs("span",{className:"event-ts",children:["opened ",wr(x.ts)]})]},x.key))}),z.jsx("h4",{className:"picker-group",children:"Today's trades"}),i.length===0?z.jsx("p",{className:"empty",children:"No trades yet today."}):z.jsx("ul",{className:"inspect-list",children:i.map((x,b)=>{const A=x.side==="sell"?"sold":x.side==="buy"?"bought":x.type;return z.jsxs("li",{children:[z.jsxs("span",{className:"inspect-item",children:[A," ",x.symbol&&z.jsxs(z.Fragment,{children:["“",x.symbol,"”"]})," ·"," ",wr(x.ts)]}),x.type==="close"&&x.pnl!==null&&z.jsx("span",{className:x.pnl>=0?"pnl-pos":"pnl-neg",children:Kn(x.pnl,!0)})]},`${x.ts}-${x.decision_id??""}-${b}`)})})]})}const Yy=document.getElementById("root");if(!Yy)throw new Error("missing #root element");Lb.createRoot(Yy).render(z.jsx(fe.StrictMode,{children:z.jsx(z3,{})}));
