;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};


require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-classes/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-event/index.js", function(exports, require, module){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
});
require.register("component-query/index.js", function(exports, require, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});
require.register("component-delegate/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("component-normalized-upload/index.js", function(exports, require, module){

/**
 * Expose `normalize()`.
 */

module.exports = normalize;

/**
 * Get `type` from `e` on .clipboardData or .dataTransfer.
 *
 * @param {Event} e
 * @param {String} type
 * @return {Array}
 * @api private
 */

function get(e, type) {
  if (e.clipboardData) return e.clipboardData[type] || [];
  if (e.dataTransfer) return e.dataTransfer[type] || [];
  return [];
}

/**
 * Normalize `e` adding the `e.items` array and invoke `fn()`.
 *
 * @param {Event} e
 * @param {Function} fn
 * @api public
 */

	function normalize(e, fn) {
		e.items = [];

		var ignore = [];
		var files = get(e, 'files');
		var items = get(e, 'items');
		normalizeItems(e, items, ignore, function(){
			normalizeFiles(e, files, ignore, function(){
				fn(e)
			});
		});
	}

/**
 * Process `files`.
 *
 * Some browsers (chrome) populate both .items and .files
 * with the same things, so we need to check that the `File`
 * is not already present.
 *
 * @param {Event} e
 * @param {FileList} files
 * @param {Function} fn
 * @api private
 */

function normalizeFiles(e, files, ignore, fn) {
  var pending = files.length;
  if (!pending) return fn();
	
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
	if (!~file.type.indexOf('image')) continue;
    if (~ignore.indexOf(file)) continue;
    if (~e.items.indexOf(file)) continue;
    file.kind = 'file';
    e.items.push(file);
  }
	
  fn();
}

/**
 * Process `items`.
 *
 * @param {Event} e
 * @param {ItemList} items
 * @param {Function} fn
 * @return {Type}
 * @api private
 */

function normalizeItems(e, items, ignore, fn){
  var pending = items.length;

  if (!pending) return fn();
  
  var dir = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
	
	//root dir
	/* if(item.kind == 'file'){
		var paths = item.getAsFile().path.split('\\');
		paths.pop();
		if(dir.length){
			if(paths.length > dir.length){
				paths = paths.slice(0, dir.length);
			}else if(paths.length < dir.length){
				dir = dir.slice(0, paths.length);
			}
			while(dir.length && dir.join('\\')!=paths.join('\\')){
				dir.pop();
				paths.pop();
			}
			e.rootDir = dir.join('\\');
		}else{
			dir = paths;
			e.rootDir = dir.join('\\');
		}
	} */
	if(item.kind == 'file' && !dir.length){
		var paths = item.getAsFile().path.split('\\');
		paths.pop();
		dir = paths;
		e.rootDir = dir.join('\\');
	}
	
    // directories
    if ('file' == item.kind && item.webkitGetAsEntry) {
      var entry = item.webkitGetAsEntry();
      if (entry && entry.isDirectory) {
        ignore.push(item.getAsFile());
        walk(e, entry, function(){
          --pending || fn(e);
        });
        continue;
      }
    }

    // files
    if ('file' == item.kind) {
      var file = item.getAsFile();
	  if(!!~file.type.indexOf('image')){
		file.kind = 'file';
		e.items.push(file);
	  }
      --pending || fn(e);
      continue;
    }

    // others
    (function(){
      var type = item.type;
      var kind = item.kind;
      item.getAsString(function(str){
        e.items.push({
          kind: kind,
          type: type,
          string: str
        });

        --pending || fn(e);
      })
    })()
  }
};

/**
 * Walk `entry`.
 *
 * @param {Event} e
 * @param {FileEntry} entry
 * @param {Function} fn
 * @api private
 */

	function walk(e, entry, fn){
		if (entry.isFile) {
			return entry.file(function(file){
				if(!!~file.type.indexOf('image')){
					file.entry = entry;
					file.kind = 'file';
					e.items.push(file);
				}
				fn();
			})
		}


		if (entry.isDirectory) {
			var dir = entry.createReader();
			dir.readEntries(function(entries){
				entries = filterHidden(entries);
				var pending = entries.length;
				if(!pending){
					fn();
				}
				for (var i = 0; i < entries.length; i++) {
					walk(e, entries[i], function(){
						--pending || fn();
					});
				}
			})
		}
	}

/**
 * Filter hidden entries.
 *
 * @param {Array} entries
 * @return {Array}
 * @api private
 */

function filterHidden(entries) {
  var arr = [];

  for (var i = 0; i < entries.length; i++) {
    if ('.' == entries[i].name[0]) continue;
    arr.push(entries[i]);
  }

  return arr;
}

});
require.register("drop/index.js", function(exports, require, module){
'use strict';

var classes = require('classes');
var emitter = require('emitter');
var events = require('events');
var normalize = require('normalized-upload');

/**
 * Initialize a new `Drop`
 *
 * @api public
 */

function Drop() {
    if (!(this instanceof Drop)) {
        return new Drop();
    }

    this.el = document.createElement('div');
    this.events = events(window, this);
    this.classes = classes(this.el);
    this.classes.add('Drop');
    this.events.bind('drop', 'drop');
    this.events.bind('dragleave', 'hide');
    this.events.bind('dragover', 'over');
    this.events.bind('dragenter', 'show');
    this.first = false;
    this.second = false;
    this.add();
}

/**
 * Mixins
 */

emitter(Drop.prototype);

/**
 * Add element
 *
 * @api public
 */

Drop.prototype.add = function () {
    document.body.appendChild(this.el);
    return this;
};

/**
 * Remove element
 *
 * @api public
 */

Drop.prototype.remove = function () {
    document.body.removeChild(this.el);
    return this;
};

/**
 * Over handler
 *
 * @api public
 */

Drop.prototype.over = function (e) {
    e.preventDefault();
    return this;
};

/**
 * Show handler
 *
 * @api public
 */

Drop.prototype.show = function () {
    if (this.first) {
        this.second = true;
    } else {
        this.first = true;
        this.classes.add('is-over');
    }

    return this;
};

/**
 * Hide handler
 *
 * @api public
 */

Drop.prototype.hide = function () {
    if (this.second) {
        this.second = false;
    } else if (this.first) {
        this.first = false;
    }

    if (!this.first && !this.second) {
        this.classes.add('is-over');
    }

    return this;
};

/**
 * Drop handler
 *
 * @api public
 */

Drop.prototype.drop = function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.classes.remove('is-over');
    normalize(e, function (f) {
        this.emit('drop', f.items, f.rootDir);
    }.bind(this));
};

/**
 * Unbind event handlers
 *
 * @api public
 */

Drop.prototype.unbind = function () {
    this.remove();
    this.events.unbind();
    return this;
};

/**
 * Module exports
 */

module.exports = Drop;

});
require.register("sindresorhus-each-async/each-async.js", function(exports, require, module){
/*!
	each-async
	Async concurrent iterator (async forEach)
	https://github.com/sindresorhus/each-async
	by Sindre Sorhus
	MIT License
*/
(function () {
	'use strict';

	function once(fn) {
		var called = false;

		if (typeof fn !== 'function') {
			throw new TypeError;
		}

		return function () {
			if (called) {
				throw new Error('Callback already called.');
			}
			called = true;
			fn.apply(this, arguments);
		}
	}

	function each(arr, next, cb) {
		var failed = false;
		var count = 0;

		cb = cb || function () {};

		if (!Array.isArray(arr)) {
			throw new TypeError('First argument must be an array');
		}

		if (typeof next !== 'function') {
			throw new TypeError('Second argument must be a function');
		}

		var len = arr.length;

		if (!len) {
			return cb();
		}

		function callback(err) {
			if (failed) {
				return;
			}

			if (err !== undefined && err !== null) {
				failed = true;
				return cb(err);
			}

			if (++count === len) {
				return cb();
			}
		}

		for (var i = 0; i < len; i++) {
			next(arr[i], i, once(callback));
		}
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = each;
	} else {
		window.eachAsync = each;
	}
})();

});
require.register("minify/index.js", function(exports, require, module){
/* global node */
'use strict';

var each = require('each-async');
var fs = node('fs');
var Imagemin = node('imagemin');
var path = node('path');

/**
 * Minify images
 *
 * @param {Array} files
 * @param {Function} cb
 * @api public
 */

module.exports = function (files, destfile, cb) {
    var arr = [];
	
	var date = new Date();
	var time = '' + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
	var redestfile = destfile +'\\optimized'+ time +'\\';

    each(files, function (file, i, next) {
        fs.readFile(file.path, function (err, buf) {
            if (err) {
                return next(err);
            }
			if(!/image/.test(file.type)){
				return next();
			}
			//path.join(path.dirname(file.path), 'optimized', path.basename(file.path))
            var imagemin = new Imagemin()
                .src(buf)
                .dest(file.path.replace(destfile, redestfile))
                .use(Imagemin.gifsicle({interlaced: true}))
                .use(Imagemin.jpegtran({progressive: true}))
                .use(Imagemin.optipng({optimizationLevel: 3}))
                .use(Imagemin.pngquant({speedLevel:1}))
                .use(Imagemin.svgo());

            imagemin.optimize(function (err, data) {
                /* if (err) {
                    return next(err);
                } */
				if(err){
					arr.push({ path: file.path, err: err});
				}else{
					arr.push({ path: file.path, orig: buf.length, dest: data.contents.length});
				}
                next();
            });
        });
    }, function (err) {
        if (err) {
            return cb(err);
        }
        cb(null, arr);
    });
};

});
require.register("visionmedia-debug/debug.js", function(exports, require, module){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

});
require.register("component-props/index.js", function(exports, require, module){
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[$a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

});
require.register("component-to-function/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var expr = require('props');

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val;
  for(var i = 0, prop; prop = props[i]; i++) {
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";
    str = str.replace(new RegExp(prop, 'g'), val);
  }

  return str;
}

});
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("component-each/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type = require('type');
var toFunction = require('to-function');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`
 * in optional context `ctx`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @param {Object} [ctx]
 * @api public
 */

module.exports = function(obj, fn, ctx){
  fn = toFunction(fn);
  ctx = ctx || this;
  switch (type(obj)) {
    case 'array':
      return array(obj, fn, ctx);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn, ctx);
      return object(obj, fn, ctx);
    case 'string':
      return string(obj, fn, ctx);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function string(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function object(obj, fn, ctx) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn.call(ctx, key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function array(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj[i], i);
  }
}

});
require.register("ianstormtaylor-to-no-case/index.js", function(exports, require, module){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
});
require.register("ianstormtaylor-to-space-case/index.js", function(exports, require, module){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
});
require.register("ianstormtaylor-to-camel-case/index.js", function(exports, require, module){

var toSpace = require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
});
require.register("component-within-document/index.js", function(exports, require, module){

/**
 * Check if `el` is within the document.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */

module.exports = function(el) {
  var node = el;
  while (node = node.parentNode) {
    if (node == document) return true;
  }
  return false;
};
});
require.register("component-css/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css');
var set = require('./lib/style');
var get = require('./lib/css');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * Get and set css values
 *
 * @param {Element} el
 * @param {String|Object} prop
 * @param {Mixed} val
 * @return {Element} el
 * @api public
 */

function css(el, prop, val) {
  if (!el) return;

  if (undefined !== val) {
    var obj = {};
    obj[prop] = val;
    debug('setting styles %j', obj);
    return setStyles(el, obj);
  }

  if ('object' == typeof prop) {
    debug('setting styles %j', prop);
    return setStyles(el, prop);
  }

  debug('getting %s', prop);
  return get(el, prop);
}

/**
 * Set the styles on an element
 *
 * @param {Element} el
 * @param {Object} props
 * @return {Element} el
 */

function setStyles(el, props) {
  for (var prop in props) {
    set(el, prop, props[prop]);
  }

  return el;
}

});
require.register("component-css/lib/css.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:css');
var camelcase = require('to-camel-case');
var computed = require('./computed');
var property = require('./prop');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * CSS Normal Transforms
 */

var cssNormalTransform = {
  letterSpacing: 0,
  fontWeight: 400
};

/**
 * Get a CSS value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Array} styles
 * @return {String}
 */

function css(el, prop, extra, styles) {
  var hooks = require('./hooks');
  var orig = camelcase(prop);
  var style = el.style;
  var val;

  prop = property(prop, style);
  var hook = hooks[prop] || hooks[orig];

  // If a hook was provided get the computed value from there
  if (hook && hook.get) {
    debug('get hook provided. use that');
    val = hook.get(el, true, extra);
  }

  // Otherwise, if a way to get the computed value exists, use that
  if (undefined == val) {
    debug('fetch the computed value of %s', prop);
    val = computed(el, prop);
  }

  if ('normal' == val && cssNormalTransform[prop]) {
    val = cssNormalTransform[prop];
    debug('normal => %s', val);
  }

  // Return, converting to number if forced or a qualifier was provided and val looks numeric
  if ('' == extra || extra) {
    debug('converting value: %s into a number', val);
    var num = parseFloat(val);
    return true === extra || isNumeric(num) ? num || 0 : val;
  }

  return val;
}

/**
 * Is Numeric
 *
 * @param {Mixed} obj
 * @return {Boolean}
 */

function isNumeric(obj) {
  return !isNan(parseFloat(obj)) && isFinite(obj);
}

});
require.register("component-css/lib/prop.js", function(exports, require, module){
/**
 * Module dependencies
 */

var debug = require('debug')('css:prop');
var camelcase = require('to-camel-case');
var vendor = require('./vendor');

/**
 * Export `prop`
 */

module.exports = prop;

/**
 * Normalize Properties
 */

var cssProps = {
  'float': 'cssFloat' in document.documentElement.style ? 'cssFloat' : 'styleFloat'
};

/**
 * Get the vendor prefixed property
 *
 * @param {String} prop
 * @param {String} style
 * @return {String} prop
 * @api private
 */

function prop(prop, style) {
  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));
  debug('transform property: %s => %s', prop, style);
  return prop;
}

});
require.register("component-css/lib/swap.js", function(exports, require, module){
/**
 * Export `swap`
 */

module.exports = swap;

/**
 * Initialize `swap`
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Function} fn
 * @param {Array} args
 * @return {Mixed}
 */

function swap(el, options, fn, args) {
  // Remember the old values, and insert the new ones
  for (var key in options) {
    old[key] = el.style[key];
    el.style[key] = options[key];
  }

  ret = fn.apply(el, args || []);

  // Revert the old values
  for (key in options) {
    el.style[key] = old[key];
  }

  return ret;
}

});
require.register("component-css/lib/style.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:style');
var camelcase = require('to-camel-case');
var support = require('./support');
var property = require('./prop');
var hooks = require('./hooks');

/**
 * Expose `style`
 */

module.exports = style;

/**
 * Possibly-unitless properties
 *
 * Don't automatically add 'px' to these properties
 */

var cssNumber = {
  "columnCount": true,
  "fillOpacity": true,
  "fontWeight": true,
  "lineHeight": true,
  "opacity": true,
  "order": true,
  "orphans": true,
  "widows": true,
  "zIndex": true,
  "zoom": true
};

/**
 * Set a css value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} val
 * @param {Mixed} extra
 */

function style(el, prop, val, extra) {
  // Don't set styles on text and comment nodes
  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;

  var orig = camelcase(prop);
  var style = el.style;
  var type = typeof val;

  if (!val) return get(el, prop, orig, extra);

  prop = property(prop, style);

  var hook = hooks[prop] || hooks[orig];

  // If a number was passed in, add 'px' to the (except for certain CSS properties)
  if ('number' == type && !cssNumber[orig]) {
    debug('adding "px" to end of number');
    val += 'px';
  }

  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,
  // but it would mean to define eight (for every problematic property) identical functions
  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {
    debug('set property (%s) value to "inherit"', prop);
    style[prop] = 'inherit';
  }

  // If a hook was provided, use that value, otherwise just set the specified value
  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {
    // Support: Chrome, Safari
    // Setting style to blank string required to delete "style: x !important;"
    debug('set hook defined. setting property (%s) to %s', prop, val);
    style[prop] = '';
    style[prop] = val;
  }

}

/**
 * Get the style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {String} orig
 * @param {Mixed} extra
 * @return {String}
 */

function get(el, prop, orig, extra) {
  var style = el.style;
  var hook = hooks[prop] || hooks[orig];
  var ret;

  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {
    debug('get hook defined, returning: %s', ret);
    return ret;
  }

  ret = style[prop];
  debug('getting %s', ret);
  return ret;
}

});
require.register("component-css/lib/hooks.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var each = require('each');
var css = require('./css');
var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
var rnumnonpx = new RegExp( '^(' + pnum + ')(?!px)[a-z%]+$', 'i');
var rnumsplit = new RegExp( '^(' + pnum + ')(.*)$', 'i');
var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
var styles = require('./styles');
var support = require('./support');
var swap = require('./swap');
var computed = require('./computed');
var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

/**
 * Height & Width
 */

each(['width', 'height'], function(name) {
  exports[name] = {};

  exports[name].get = function(el, compute, extra) {
    if (!compute) return;
    // certain elements can have dimension info if we invisibly show them
    // however, it must have a current display style that would benefit from this
    return 0 == el.offsetWidth && rdisplayswap.test(css(el, 'display'))
      ? swap(el, cssShow, function() { return getWidthOrHeight(el, name, extra); })
      : getWidthOrHeight(el, name, extra);
  }

  exports[name].set = function(el, val, extra) {
    var styles = extra && styles(el);
    return setPositiveNumber(el, val, extra
      ? augmentWidthOrHeight(el, name, extra, 'border-box' == css(el, 'boxSizing', false, styles), styles)
      : 0
    );
  };

});

/**
 * Opacity
 */

exports.opacity = {};
exports.opacity.get = function(el, compute) {
  if (!compute) return;
  var ret = computed(el, 'opacity');
  return '' == ret ? '1' : ret;
}

/**
 * Utility: Set Positive Number
 *
 * @param {Element} el
 * @param {Mixed} val
 * @param {Number} subtract
 * @return {Number}
 */

function setPositiveNumber(el, val, subtract) {
  var matches = rnumsplit.exec(val);
  return matches ?
    // Guard against undefined 'subtract', e.g., when used as in cssHooks
    Math.max(0, matches[1]) + (matches[2] || 'px') :
    val;
}

/**
 * Utility: Get the width or height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @return {String}
 */

function getWidthOrHeight(el, prop, extra) {
  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true;
  var val = prop === 'width' ? el.offsetWidth : el.offsetHeight;
  var styles = computed(el);
  var isBorderBox = support.boxSizing && css(el, 'boxSizing') === 'border-box';

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if (val <= 0 || val == null) {
    // Fall back to computed then uncomputed css if necessary
    val = computed(el, prop, styles);

    if (val < 0 || val == null) {
      val = el.style[prop];
    }

    // Computed unit is not pixels. Stop here and return.
    if (rnumnonpx.test(val)) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable el.style
    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === el.style[prop]);

    // Normalize ', auto, and prepare for extra
    val = parseFloat(val) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  extra = extra || (isBorderBox ? 'border' : 'content');
  val += augmentWidthOrHeight(el, prop, extra, valueIsBorderBox, styles);
  return val + 'px';
}

/**
 * Utility: Augment the width or the height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Boolean} isBorderBox
 * @param {Array} styles
 */

function augmentWidthOrHeight(el, prop, extra, isBorderBox, styles) {
  // If we already have the right measurement, avoid augmentation,
  // Otherwise initialize for horizontal or vertical properties
  var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : 'width' == prop ? 1 : 0;
  var val = 0;

  for (; i < 4; i += 2) {
    // both box models exclude margin, so add it if we want it
    if (extra === 'margin') {
      val += css(el, extra + cssExpand[i], true, styles);
    }

    if (isBorderBox) {
      // border-box includes padding, so remove it if we want content
      if (extra === 'content') {
        val -= css(el, 'padding' + cssExpand[i], true, styles);
      }

      // at this point, extra isn't border nor margin, so remove border
      if (extra !== 'margin') {
        val -= css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += css(el, 'padding' + cssExpand[i], true, styles);

      // at this point, extra isn't content nor padding, so add border
      if (extra !== 'padding') {
        val += css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    }
  }

  return val;
}

});
require.register("component-css/lib/styles.js", function(exports, require, module){
/**
 * Expose `styles`
 */

module.exports = styles;

/**
 * Get all the styles
 *
 * @param {Element} el
 * @return {Array}
 */

function styles(el) {
  if (window.getComputedStyle) {
    return el.ownerDocument.defaultView.getComputedStyle(el, null);
  } else {
    return el.currentStyle;
  }
}

});
require.register("component-css/lib/vendor.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var prefixes = ['Webkit', 'O', 'Moz', 'ms'];

/**
 * Expose `vendor`
 */

module.exports = vendor;

/**
 * Get the vendor prefix for a given property
 *
 * @param {String} prop
 * @param {Object} style
 * @return {String}
 */

function vendor(prop, style) {
  // shortcut for names that are not vendor prefixed
  if (style[prop]) return prop;

  // check for vendor prefixed names
  var capName = prop[0].toUpperCase() + prop.slice(1);
  var original = prop;
  var i = prefixes.length;

  while (i--) {
    prop = prefixes[i] + capName;
    if (prop in style) return prop;
  }

  return original;
}

});
require.register("component-css/lib/support.js", function(exports, require, module){
/**
 * Support values
 */

var reliableMarginRight;
var boxSizingReliableVal;
var pixelPositionVal;
var clearCloneStyle;

/**
 * Container setup
 */

var docElem = document.documentElement;
var container = document.createElement('div');
var div = document.createElement('div');

/**
 * Clear clone style
 */

div.style.backgroundClip = 'content-box';
div.cloneNode(true).style.backgroundClip = '';
exports.clearCloneStyle = div.style.backgroundClip === 'content-box';

container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';
container.appendChild(div);

/**
 * Pixel position
 *
 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
 * getComputedStyle returns percent when specified for top/left/bottom/right
 * rather than make the css module depend on the offset module, we just check for it here
 */

exports.pixelPosition = function() {
  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();
  return pixelPositionVal;
}

/**
 * Reliable box sizing
 */

exports.boxSizingReliable = function() {
  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();
  return boxSizingReliableVal;
}

/**
 * Reliable margin right
 *
 * Support: Android 2.3
 * Check if div with explicit width and no margin-right incorrectly
 * gets computed margin-right based on width of container. (#3333)
 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
 * This support function is only executed once so no memoizing is needed.
 *
 * @return {Boolean}
 */

exports.reliableMarginRight = function() {
  var ret;
  var marginDiv = div.appendChild(document.createElement("div" ));

  marginDiv.style.cssText = div.style.cssText = divReset;
  marginDiv.style.marginRight = marginDiv.style.width = "0";
  div.style.width = "1px";
  docElem.appendChild(container);

  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);

  docElem.removeChild(container);

  // Clean up the div for other support tests.
  div.innerHTML = "";

  return ret;
}

/**
 * Executing both pixelPosition & boxSizingReliable tests require only one layout
 * so they're executed at the same time to save the second computation.
 */

function computePixelPositionAndBoxSizingReliable() {
  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
  div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
    "box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;" +
    "position:absolute;top:1%";
  docElem.appendChild(container);

  var divStyle = window.getComputedStyle(div, null);
  pixelPositionVal = divStyle.top !== "1%";
  boxSizingReliableVal = divStyle.width === "4px";

  docElem.removeChild(container);
}



});
require.register("component-css/lib/computed.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:computed');
var withinDocument = require('within-document');
var styles = require('./styles');

/**
 * Expose `computed`
 */

module.exports = computed;

/**
 * Get the computed style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Array} precomputed (optional)
 * @return {Array}
 * @api private
 */

function computed(el, prop, precomputed) {
  var computed = precomputed || styles(el);
  var ret;
  
  if (!computed) return;

  if (computed.getPropertyValue) {
    ret = computed.getPropertyValue(prop) || computed[prop];
  } else {
    ret = computed[prop];
  }

  if ('' === ret && !withinDocument(el)) {
    debug('element not within document, try finding from style attribute');
    var style = require('./style');
    ret = style(el, prop);
  }

  debug('computed value of %s: %s', prop, ret);

  // Support: IE
  // IE returns zIndex value as an integer.
  return undefined === ret ? ret : ret + '';
}

});
require.register("component-autoscale-canvas/index.js", function(exports, require, module){

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

module.exports = function(canvas){
  var ctx = canvas.getContext('2d');
  var ratio = window.devicePixelRatio || 1;
  if (1 != ratio) {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
  }
  return canvas;
};
});
require.register("component-raf/index.js", function(exports, require, module){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

});
require.register("component-has-canvas/index.js", function(exports, require, module){

/**
 * Export `bool`
 */

module.exports = (function(){
  var el = document.createElement('canvas');
  return !! el.getContext;
})();

});
require.register("matthewp-text/index.js", function(exports, require, module){

var text = 'innerText' in document.createElement('div')
  ? 'innerText'
  : 'textContent'

module.exports = function (el, val) {
  if (val == null) return el[text];
  el[text] = val;
};

});
require.register("component-spinner/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var autoscale = require('autoscale-canvas');
var raf = require('raf');
var text = require('text');
var supported = require('canvas');

/**
 * Expose `Spinner`.
 */

module.exports = Spinner;

/**
 * Initialize a new `Spinner`.
 */

function Spinner() {
  var self = this;
  this.percent = 0;

  if (supported) {
    this.el = document.createElement('canvas');
    this.el.className = 'spinner';
  } else {
    this.el = document.createElement('div');
    this.el.className = 'spinner fallback';
    return;
  }

  this.ctx = this.el.getContext('2d');
  this.size(50);
  this.fontSize(11);
  this.speed(60);
  this.font('helvetica, arial, sans-serif');
  this.stopped = false;

  (function animate() {
    if (self.stopped) return;
    raf(animate);
    self.percent = (self.percent + self._speed / 36) % 100;
    self.draw(self.ctx);
  })();
}

/**
 * Stop the animation.
 *
 * @api public
 */

Spinner.prototype.stop = function(){
  this.stopped = true;
};

/**
 * Set spinner size to `n`.
 *
 * @param {Number} n
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.size = function(n){
  this.el.width = n;
  this.el.height = n;
  if (supported) autoscale(this.el);
  return this;
};

/**
 * Set text to `str`.
 *
 * @param {String} str
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.text = function(str){
  this._text = str;
  if (!supported) text(this.el, str);
  return this;
};

/**
 * Set font size to `n`.
 *
 * @param {Number} n
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.fontSize = function(n){
  this._fontSize = n;
  return this;
};

/**
 * Set font `family`.
 *
 * @param {String} family
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.font = function(family){
  this._font = family;
  return this;
};

/**
 * Set speed to `n` rpm.
 *
 * @param {Number} n
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.speed = function(n) {
  this._speed = n;
  return this;
};

/**
 * Make the spinner light colored.
 *
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.light = function(){
  this._light = true;
  return this;
};

/**
 * Draw on `ctx`.
 *
 * @param {CanvasRenderingContext2d} ctx
 * @return {Spinner}
 * @api private
 */

Spinner.prototype.draw = function(ctx){
  var percent = Math.min(this.percent, 100)
    , ratio = window.devicePixelRatio || 1
    , size = this.el.width / ratio
    , half = size / 2
    , x = half
    , y = half
    , rad = half - 1
    , fontSize = this._fontSize
    , light = this._light;

  ctx.font = fontSize + 'px ' + this._font;

  var angle = Math.PI * 2 * (percent / 100);
  ctx.clearRect(0, 0, size, size);

  // outer circle
  var grad = ctx.createLinearGradient(
    half + Math.sin(Math.PI * 1.5 - angle) * half,
    half + Math.cos(Math.PI * 1.5 - angle) * half,
    half + Math.sin(Math.PI * 0.5 - angle) * half,
    half + Math.cos(Math.PI * 0.5 - angle) * half
  );

  // color
  if (light) {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
  } else {
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
  }

  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, rad, angle - Math.PI, angle, false);
  ctx.stroke();

  // inner circle
  ctx.strokeStyle = light ? 'rgba(255, 255, 255, .4)' : '#eee';
  ctx.beginPath();
  ctx.arc(x, y, rad - 1, 0, Math.PI * 2, true);
  ctx.stroke();

  // text
  var text = this._text || ''
    , w = ctx.measureText(text).width;

  if (light) ctx.fillStyle = 'rgba(255, 255, 255, .9)';
  ctx.fillText(
      text
    , x - w / 2 + 1
    , y + fontSize / 2 - 1);

  return this;
};

});
require.register("component-mutation-observer/index.js", function(exports, require, module){

module.exports = window.MutationObserver
  || window.WebKitMutationObserver
  || window.MozMutationObserver;

});
require.register("component-removed/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Observer = require('mutation-observer');

/**
 * Exports the `MutationObserver` based approach, the
 * `MutationEvent` based approach, or the fallback one
 * depending on UA capabilities.
 */

module.exports = Observer
  ? require('./dom4')
  : document.addEventListener
    ? require('./dom3')
    : require('./fallback');

});
require.register("component-removed/fallback.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var withinDocument = require('within-document');

/**
 * Expose `removed`.
 */

exports = module.exports = removed;

/**
 * Default interval.
 */

exports.interval = 200;

/**
 * Watch for removal and invoke `fn(el)`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

function removed(el, fn){
  interval(el, fn);
}

/**
 * Watch for removal with an interval.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function interval(el, fn) {
  var id = setInterval(function(){
    if (el.parentNode && withinDocument(el)) return;
    clearInterval(id);
    fn(el);
  }, exports.interval);
}

});
require.register("component-removed/dom3.js", function(exports, require, module){

module.exports = removed;

/**
 * Watch for removal with a DOM3 MutationEvent.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function removed(el, fn) {
  function cb(mutationEvent) {
    var target = mutationEvent.target
      , children = [].slice.call(target.getElementsByTagName('*'));

    if (target === el || ~children.indexOf(el)) {
      fn(el);
      document.removeEventListener('DOMNodeRemoved', cb);
    }
  }

  document.addEventListener('DOMNodeRemoved', cb);
}

});
require.register("component-removed/dom4.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var withinDoc = require('within-document')
  , Observer = require('mutation-observer');

/**
 * Expose `removed`.
 */

module.exports = removed;

/**
 * Watched elements.
 *
 * @api private
 */

var watched = [];

/**
 * Set up observer.
 *
* @api private
 */

var observer = new Observer(onchanges);

/**
 * Generic observer callback.
 *
 * @api private
 */

function onchanges(changes){
  // keep track of number of found els
  var found = 0;

  for (var i = 0, l = changes.length; i < l; i++) {
    if (changes[i].removedNodes.length) {
      // allow for manipulation of `watched`
      // from within the callback
      var w = watched.slice();

      for (var i2 = 0, l2 = w.length; i2 < l2; i2++) {
        var el = w[i2][0];

        // check that the element is no longer in the dom
        if (!withinDoc(el)) {
          watched.splice(i2 - found++, 1)[0][1]();

          // abort if nothing else left to watch
          if (!watched.length) observer.disconnect();
        }
      }

      // we only need to loop through watched els once
      break;
    }
  }
}

/**
 * Starts observing the DOM.
 *
 * @api private
 */

function observe(){
  var html = document.documentElement;
  observer.observe(html, {
    subtree: true,
    childList: true
  });
}

/**
 * Watches for the removal of `el` from DOM.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function removed(el, fn){
  // reattach observer if we weren't watching
  if (!watched.length) observe();

  // we add it to the list of elements to check
  watched.push([el, fn]);
}

});
require.register("component-spin/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Spinner = require('spinner')
  , debug = require('debug')('spin')
  , css = require('css')
  , removed = require('removed');

/**
 * Add a spinner to `el`,
 * and adjust size and position
 * based on `el`'s box.
 *
 * Options:
 *
 *    - `delay` milliseconds defaulting to 300
 *    - `size` size defaults to 1/5th the parent dimensions
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Spinner}
 * @api public
 */

module.exports = function(el, options){
  if (!el) throw new Error('element required');

  var appended = false;
  var spin = new Spinner(el);
  options = options || {};
  var ms = options.delay || 300;

  // update size and position
  spin.update = function(){
    debug('update');
    var w = el.offsetWidth;
    var h = el.offsetHeight;

    // size
    var s = options.size || w / 5;
    spin.size(s);
    debug('show %dpx (%dms)', s, ms);

    // position
    css(spin.el, {
      position: 'absolute',
      top: h / 2 - s / 2,
      left: w / 2 - s / 2
    });
  }

  spin.update();

  // remove
  spin.remove = function(){
    debug('remove');
    if (appended) el.removeChild(spin.el);
    spin.stop();
    clearTimeout(timer);
  };

  // append
  var timer = setTimeout(function(){
    debug('append');
    appended = true;
    el.appendChild(spin.el);
  }, ms);

  removed(spin.el, function() {
    appended = false;
  });

  return spin;
};
});
require.register("spin/index.js", function(exports, require, module){
'use strict';

var classes = require('classes');
var spin = require('spin');

/**
 * Initialize a new `Spin`
 *
 * @api public
 */

function Spin() {
    if (!(this instanceof Spin)) {
        return new Spin();
    }

    this.el = document.createElement('div');
    this.classes = classes(this.el);
    this.classes.add('Spin');
    this.add();
}

/**
 * Add element
 *
 * @api public
 */

Spin.prototype.add = function () {
    document.body.appendChild(this.el);
    return this;
};

/**
 * Remove the element
 *
 * @api public
 */

Spin.prototype.remove = function() {
    document.body.removeChild(this.el);
    return this;
};

/**
 * Show spinner
 *
 * @api public
 */

Spin.prototype.show = function () {
    this.classes.add('is-visible');
    this.spin = spin(this.el);
    return this;
};

/**
 * Hide spinner
 *
 * @api public
 */

Spin.prototype.hide = function () {
    this.classes.remove('is-visible');
    return this;
};

/**
 * Module exports
 */

module.exports = Spin;

});
require.register("sindresorhus-pretty-bytes/pretty-bytes.js", function(exports, require, module){
/*!
	pretty-bytes
	Convert bytes to a human readable string: 1337 → 1.34 kB
	https://github.com/sindresorhus/pretty-bytes
	by Sindre Sorhus
	MIT License
*/
(function () {
	'use strict';

	var prettyBytes = function (num) {
		if (typeof num !== 'number' || Number.isNaN(num)) {
			throw new TypeError('Input must be a number');
		}

		var exponent;
		var unit;
		var neg = num < 0;

		if (neg) {
			num = -num;
		}

		if (num === 0) {
			return '0 B';
		}

		exponent = Math.floor(Math.log(num) / Math.log(1000));
		num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
		unit = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][exponent];

		return (neg ? '-' : '') + num + ' ' + unit;
	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = prettyBytes;
	} else {
		window.prettyBytes = prettyBytes;
	}
})();

});
require.register("summary/index.js", function(exports, require, module){
'use strict';

var classes = require('classes');
var prettyBytes = require('pretty-bytes');
var dialog = node('remote').require('dialog');

/**
 * Initialize a new `Summary`
 *
 * @api public
 */

function Summary() {
    if (!(this instanceof Summary)) {
        return new Summary();
    }

    this.el = document.createElement('div');
    this.classes = classes(this.el);
    this.classes.add('Summary');
    this.diff = 0;
	this.orig = 0;
	this.err = [];
}

/**
 * Add element
 *
 * @api public
 */

Summary.prototype.add = function () {
    document.body.appendChild(this.el);
	this.el.addEventListener('click', function(e){
		if(e.target.nodeName == 'A' && this.err.length){
			var detail = '';
			var errs = this.err;
			for(var i=0,l=errs.length;i<l;i++){
				var err = errs[i];
				detail += err.path +' ('+ err.detail +')\r\n';
			}
			dialog.showMessageBox({
				type: 'warning',
				buttons: ['OK'],
				title: 'Error optimizing image',
				message: errs.length +'张图片在优化过程中发生错误：',
				detail: detail
			});
		}
	}.bind(this), false)
    return this;
};

/**
 * Show summary
 *
 * @param {Array} files
 * @api public
 */

Summary.prototype.show = function (files) {
	var succeed = 0,
		failed = 0;

    files.forEach(function (file) {
		if(!file.err){
			succeed++;
			this.diff += file.orig - file.dest;
			this.orig += file.orig;
		}else{
			failed++;
			this.err.push({path: file.path, detail: file.err});
		}
    }.bind(this));

    this.el.innerHTML = '<h1>Optimized ' + succeed + ' ' + (succeed === 1 ? 'file' : 'files') + '</h1>';
    this.el.innerHTML += '<p>saved '+ (this.orig ? parseInt(100 * this.diff / this.orig) : 0) +'%(' + prettyBytes(this.diff) + ')</p>';
	if(failed){
		this.el.innerHTML += '<h2>failed '+ failed +' ' + (failed === 1 ? 'file' : 'files') + ' [<a>More</a>]</h2>';
	}

    this.classes.add('is-visible');
    return this;
};

/**
 * Hide summary
 *
 * @api public
 */

Summary.prototype.hide = function () {
    this.diff = 0;
	this.orig = 0;
	this.err = [];
    this.classes.remove('is-visible');
    return this;
};

/**
 * Module exports
 */

module.exports = Summary;

});
require.register("boot/index.js", function(exports, require, module){
'use strict';

var Drop = require('drop');
var minify = require('minify');
var Spin = require('spin');
var Summary = require('summary');
var sum = new Summary();

/**
 * Init summary
 */

sum.add();

/**
 * Handle files on drop
 */

function run() {
    var drop = new Drop();
    var spin = new Spin();

    drop.on('drop', function (files, destfile) {
        spin.show();
        sum.hide();

        minify(files, destfile, function (err, files) {
            if (err) {
                throw err;
            }

            sum.show(files);
            drop.unbind();
            spin.remove();

            return run();
        });
    });
}

/**
 * Run
 */

run();

});
require.register("imagemin-app/index.js", function(exports, require, module){
'use strict';

module.exports = function () {
    require('boot');
};

});






































require.alias("boot/index.js", "imagemin-app/deps/boot/index.js");
require.alias("boot/index.js", "boot/index.js");


require.alias("drop/index.js", "boot/deps/drop/index.js");
require.alias("component-classes/index.js", "drop/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-emitter/index.js", "drop/deps/emitter/index.js");

require.alias("component-events/index.js", "drop/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-normalized-upload/index.js", "drop/deps/normalized-upload/index.js");
require.alias("component-normalized-upload/index.js", "drop/deps/normalized-upload/index.js");
require.alias("component-normalized-upload/index.js", "component-normalized-upload/index.js");
require.alias("minify/index.js", "boot/deps/minify/index.js");
require.alias("sindresorhus-each-async/each-async.js", "minify/deps/each-async/each-async.js");
require.alias("sindresorhus-each-async/each-async.js", "minify/deps/each-async/index.js");
require.alias("sindresorhus-each-async/each-async.js", "sindresorhus-each-async/index.js");
require.alias("spin/index.js", "boot/deps/spin/index.js");
require.alias("component-classes/index.js", "spin/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-emitter/index.js", "spin/deps/emitter/index.js");

require.alias("component-spin/index.js", "spin/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("summary/index.js", "boot/deps/summary/index.js");
require.alias("component-classes/index.js", "summary/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("sindresorhus-pretty-bytes/pretty-bytes.js", "summary/deps/pretty-bytes/pretty-bytes.js");
require.alias("sindresorhus-pretty-bytes/pretty-bytes.js", "summary/deps/pretty-bytes/index.js");
require.alias("sindresorhus-pretty-bytes/pretty-bytes.js", "sindresorhus-pretty-bytes/index.js");if (typeof exports == "object") {
  module.exports = require("imagemin-app");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("imagemin-app"); });
} else {
  this["imageminApp"] = require("imagemin-app");
}})();