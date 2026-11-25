/* Petit moteur d'affichage des pages animées du site CHT Production
   (accueil, réalisations, contact). Il lit le modèle de la page
   (<template id="dc-tpl">) et la logique (<script type="text/x-dc">),
   puis affiche la page avec React. */
(function () {
  'use strict';
  var R = window.React, RD = window.ReactDOM, h = R.createElement;

  var EVENTS = {};
  ['Click', 'DoubleClick', 'MouseEnter', 'MouseLeave', 'MouseOver', 'MouseOut', 'MouseDown', 'MouseUp', 'MouseMove',
    'Change', 'Input', 'Submit', 'Focus', 'Blur', 'KeyDown', 'KeyUp', 'KeyPress', 'Scroll', 'Wheel',
    'TouchStart', 'TouchEnd', 'TouchMove', 'PointerDown', 'PointerUp', 'PointerEnter', 'PointerLeave', 'PointerMove',
    'Load', 'Error', 'Ended', 'Play', 'Pause', 'TimeUpdate', 'LoadedData', 'CanPlay', 'AnimationEnd', 'TransitionEnd']
    .forEach(function (e) { EVENTS['on' + e.toLowerCase()] = 'on' + e; });
  EVENTS.ondblclick = 'onDoubleClick';

  var ATTRS = {
    'class': 'className', 'for': 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
    autoplay: 'autoPlay', playsinline: 'playsInline', crossorigin: 'crossOrigin', srcset: 'srcSet',
    colspan: 'colSpan', rowspan: 'rowSpan', autocomplete: 'autoComplete', autofocus: 'autoFocus',
    enctype: 'encType', novalidate: 'noValidate', contenteditable: 'contentEditable', spellcheck: 'spellCheck',
    viewbox: 'viewBox', 'xlink:href': 'xlinkHref', 'clip-path': 'clipPath', 'clip-rule': 'clipRule', 'fill-rule': 'fillRule',
    'fill-opacity': 'fillOpacity', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin', 'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset',
    'stroke-opacity': 'strokeOpacity', 'stroke-miterlimit': 'strokeMiterlimit', 'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity', 'font-size': 'fontSize', 'font-family': 'fontFamily', 'font-weight': 'fontWeight',
    'text-anchor': 'textAnchor', 'dominant-baseline': 'dominantBaseline', 'letter-spacing': 'letterSpacing',
    'transform-origin': 'transformOrigin', 'vector-effect': 'vectorEffect', 'shape-rendering': 'shapeRendering',
    preserveaspectratio: 'preserveAspectRatio', gradientunits: 'gradientUnits', gradienttransform: 'gradientTransform',
    clippathunits: 'clipPathUnits', patternunits: 'patternUnits'
  };
  var BOOLS = { autoPlay: 1, muted: 1, loop: 1, playsInline: 1, controls: 1, disabled: 1, checked: 1, hidden: 1, required: 1, selected: 1, multiple: 1, readOnly: 1, autoFocus: 1, open: 1, noValidate: 1, defer: 1, async: 1 };
  var HOLE = /\{\{\s*([^}]*?)\s*\}\}/g, WHOLE = /^\s*\{\{\s*([^}]*?)\s*\}\}\s*$/;

  function lookup(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (path === 'undefined' || path === '') return undefined;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var q = path.match(/^(['"])(.*)\1$/);
    if (q) return q[2];
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = lookup(p, scope); return v == null ? '' : String(v); });
  }
  function styleObj(s) {
    var o = {};
    s.split(';').forEach(function (d) {
      var i = d.indexOf(':');
      if (i < 0) return;
      var k = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if (!k) return;
      if (k.indexOf('--') !== 0) {
        k = k.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
      }
      o[k] = v;
    });
    return o;
  }
  function childScope(scope, extra) { var s = Object.create(scope); for (var k in extra) s[k] = extra[k]; return s; }

  function convertChildren(nodes, scope, keyBase) {
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var r = convert(nodes[i], scope, keyBase + '.' + i);
      if (r == null) continue;
      if (Array.isArray(r)) out.push.apply(out, r); else out.push(r);
    }
    return out;
  }

  function convert(node, scope, key) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (t.indexOf('{{') < 0) return t;
      var parts = [], last = 0, m;
      HOLE.lastIndex = 0;
      while ((m = HOLE.exec(t))) {
        if (m.index > last) parts.push(t.slice(last, m.index));
        var v = lookup(m[1], scope);
        parts.push(v == null || v === false ? '' : (typeof v === 'object' ? String(v) : v));
        last = m.index + m[0].length;
      }
      if (last < t.length) parts.push(t.slice(last));
      return parts.join('');
    }
    if (node.nodeType !== 1) return null;
    var tag = node.tagName.toLowerCase();
    var kids = node.content ? node.content.childNodes : node.childNodes;
    if (tag === 'sc-if') {
      var a = node.getAttribute('value') || '', w = a.match(WHOLE);
      var ok = w ? lookup(w[1], scope) : a;
      if (Array.isArray(ok)) ok = ok.length > 0;
      return ok ? h(R.Fragment, { key: key }, convertChildren(kids, scope, key)) : null;
    }
    if (tag === 'sc-for') {
      var la = node.getAttribute('list') || '', lw = la.match(WHOLE);
      var list = lw ? lookup(lw[1], scope) : null, as = node.getAttribute('as') || 'item';
      if (!list || !list.length) return null;
      return Array.prototype.map.call(list, function (it, idx) {
        var ex = { $index: idx }; ex[as] = it;
        return h(R.Fragment, { key: key + ':' + idx }, convertChildren(kids, childScope(scope, ex), key + ':' + idx));
      });
    }
    var props = { key: key };
    var isSvg = node.namespaceURI === 'http://www.w3.org/2000/svg';
    for (var j = 0; j < node.attributes.length; j++) {
      var at = node.attributes[j], name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) continue;
      var lname = name.toLowerCase(), pname;
      if (EVENTS[lname]) pname = EVENTS[lname];
      else if (ATTRS[lname]) pname = ATTRS[lname];
      else pname = isSvg ? name : (lname.indexOf('data-') === 0 || lname.indexOf('aria-') === 0 ? lname : lname);
      var whole = val.match(WHOLE), value;
      if (whole) value = lookup(whole[1], scope);
      else if (val.indexOf('{{') >= 0) value = interp(val, scope);
      else value = val;
      if (pname === 'style') { props.style = typeof value === 'string' ? styleObj(value) : value; continue; }
      if (BOOLS[pname] && value === '') value = true;
      if ((tag === 'input' || tag === 'select' || tag === 'textarea') && pname === 'value' && !whole) { props.defaultValue = value; continue; }
      if (pname === 'checked' && !whole) { props.defaultChecked = value; continue; }
      if (pname === 'selected' && tag === 'option') continue;
      props[pname] = value;
    }
    if (tag === 'textarea') {
      var tv = node.textContent;
      if (tv) props.defaultValue = tv;
      return h('textarea', props);
    }
    if (tag === 'style' || tag === 'script') {
      props.dangerouslySetInnerHTML = { __html: node.textContent };
      return h(tag, props);
    }
    var ch = convertChildren(kids, scope, key);
    return h.apply(null, [isSvg ? node.tagName : tag, props].concat(ch.length ? ch : []));
  }

  function DCLogic(props) { R.Component.call(this, props); }
  DCLogic.prototype = Object.create(R.Component.prototype);
  DCLogic.prototype.constructor = DCLogic;
  DCLogic.prototype.renderVals = function () { return {}; };
  DCLogic.prototype.render = function () {
    var vals = this.renderVals() || {};
    return h(R.Fragment, null, convertChildren(this.__tpl, vals, 'r'));
  };
  window.DCLogic = DCLogic;

  function start() {
    var tpl = document.getElementById('dc-tpl'), root = document.getElementById('dc-root');
    var src = document.querySelector('script[type="text/x-dc"]');
    if (!tpl || !root) return;
    var Comp;
    try {
      Comp = new Function('DCLogic', (src ? src.textContent : 'class Component extends DCLogic {}') + '\n;return Component;')(DCLogic);
    } catch (e) { console.error(e); return; }
    var nodes = Array.prototype.slice.call(tpl.content.childNodes);
    var Wrapped = class extends Comp { constructor(p) { super(p); this.__tpl = nodes; } };
    var r = RD.createRoot(root);
    root.innerHTML = '';
    RD.flushSync(function () { r.render(h(Wrapped, {})); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
