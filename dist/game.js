"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/scheduler/cjs/scheduler.production.js
  var require_scheduler_production = __commonJS({
    "node_modules/scheduler/cjs/scheduler.production.js"(exports) {
      "use strict";
      function push(heap, node) {
        var index = heap.length;
        heap.push(node);
        a: for (; 0 < index; ) {
          var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
          if (0 < compare(parent, node))
            heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
          else break a;
        }
      }
      function peek(heap) {
        return 0 === heap.length ? null : heap[0];
      }
      function pop(heap) {
        if (0 === heap.length) return null;
        var first = heap[0], last = heap.pop();
        if (last !== first) {
          heap[0] = last;
          a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength; ) {
            var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
            if (0 > compare(left, last))
              rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
            else if (rightIndex < length && 0 > compare(right, last))
              heap[index] = right, heap[rightIndex] = last, index = rightIndex;
            else break a;
          }
        }
        return first;
      }
      function compare(a, b) {
        var diff = a.sortIndex - b.sortIndex;
        return 0 !== diff ? diff : a.id - b.id;
      }
      exports.unstable_now = void 0;
      if ("object" === typeof performance && "function" === typeof performance.now) {
        localPerformance = performance;
        exports.unstable_now = function() {
          return localPerformance.now();
        };
      } else {
        localDate = Date, initialTime = localDate.now();
        exports.unstable_now = function() {
          return localDate.now() - initialTime;
        };
      }
      var localPerformance;
      var localDate;
      var initialTime;
      var taskQueue = [];
      var timerQueue = [];
      var taskIdCounter = 1;
      var currentTask = null;
      var currentPriorityLevel = 3;
      var isPerformingWork = false;
      var isHostCallbackScheduled = false;
      var isHostTimeoutScheduled = false;
      var needsPaint = false;
      var localSetTimeout = "function" === typeof setTimeout ? setTimeout : null;
      var localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null;
      var localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
      function advanceTimers(currentTime) {
        for (var timer = peek(timerQueue); null !== timer; ) {
          if (null === timer.callback) pop(timerQueue);
          else if (timer.startTime <= currentTime)
            pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
          else break;
          timer = peek(timerQueue);
        }
      }
      function handleTimeout(currentTime) {
        isHostTimeoutScheduled = false;
        advanceTimers(currentTime);
        if (!isHostCallbackScheduled)
          if (null !== peek(taskQueue))
            isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
          else {
            var firstTimer = peek(timerQueue);
            null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
          }
      }
      var isMessageLoopRunning = false;
      var taskTimeoutID = -1;
      var frameInterval = 5;
      var startTime = -1;
      function shouldYieldToHost() {
        return needsPaint ? true : exports.unstable_now() - startTime < frameInterval ? false : true;
      }
      function performWorkUntilDeadline() {
        needsPaint = false;
        if (isMessageLoopRunning) {
          var currentTime = exports.unstable_now();
          startTime = currentTime;
          var hasMoreWork = true;
          try {
            a: {
              isHostCallbackScheduled = false;
              isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
              isPerformingWork = true;
              var previousPriorityLevel = currentPriorityLevel;
              try {
                b: {
                  advanceTimers(currentTime);
                  for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
                    var callback = currentTask.callback;
                    if ("function" === typeof callback) {
                      currentTask.callback = null;
                      currentPriorityLevel = currentTask.priorityLevel;
                      var continuationCallback = callback(
                        currentTask.expirationTime <= currentTime
                      );
                      currentTime = exports.unstable_now();
                      if ("function" === typeof continuationCallback) {
                        currentTask.callback = continuationCallback;
                        advanceTimers(currentTime);
                        hasMoreWork = true;
                        break b;
                      }
                      currentTask === peek(taskQueue) && pop(taskQueue);
                      advanceTimers(currentTime);
                    } else pop(taskQueue);
                    currentTask = peek(taskQueue);
                  }
                  if (null !== currentTask) hasMoreWork = true;
                  else {
                    var firstTimer = peek(timerQueue);
                    null !== firstTimer && requestHostTimeout(
                      handleTimeout,
                      firstTimer.startTime - currentTime
                    );
                    hasMoreWork = false;
                  }
                }
                break a;
              } finally {
                currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
              }
              hasMoreWork = void 0;
            }
          } finally {
            hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
          }
        }
      }
      var schedulePerformWorkUntilDeadline;
      if ("function" === typeof localSetImmediate)
        schedulePerformWorkUntilDeadline = function() {
          localSetImmediate(performWorkUntilDeadline);
        };
      else if ("undefined" !== typeof MessageChannel) {
        channel = new MessageChannel(), port = channel.port2;
        channel.port1.onmessage = performWorkUntilDeadline;
        schedulePerformWorkUntilDeadline = function() {
          port.postMessage(null);
        };
      } else
        schedulePerformWorkUntilDeadline = function() {
          localSetTimeout(performWorkUntilDeadline, 0);
        };
      var channel;
      var port;
      function requestHostTimeout(callback, ms) {
        taskTimeoutID = localSetTimeout(function() {
          callback(exports.unstable_now());
        }, ms);
      }
      exports.unstable_IdlePriority = 5;
      exports.unstable_ImmediatePriority = 1;
      exports.unstable_LowPriority = 4;
      exports.unstable_NormalPriority = 3;
      exports.unstable_Profiling = null;
      exports.unstable_UserBlockingPriority = 2;
      exports.unstable_cancelCallback = function(task) {
        task.callback = null;
      };
      exports.unstable_forceFrameRate = function(fps) {
        0 > fps || 125 < fps ? console.error(
          "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
        ) : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
      };
      exports.unstable_getCurrentPriorityLevel = function() {
        return currentPriorityLevel;
      };
      exports.unstable_next = function(eventHandler) {
        switch (currentPriorityLevel) {
          case 1:
          case 2:
          case 3:
            var priorityLevel = 3;
            break;
          default:
            priorityLevel = currentPriorityLevel;
        }
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = priorityLevel;
        try {
          return eventHandler();
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
      exports.unstable_requestPaint = function() {
        needsPaint = true;
      };
      exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
        switch (priorityLevel) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            priorityLevel = 3;
        }
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = priorityLevel;
        try {
          return eventHandler();
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
      exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
        var currentTime = exports.unstable_now();
        "object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
        switch (priorityLevel) {
          case 1:
            var timeout = -1;
            break;
          case 2:
            timeout = 250;
            break;
          case 5:
            timeout = 1073741823;
            break;
          case 4:
            timeout = 1e4;
            break;
          default:
            timeout = 5e3;
        }
        timeout = options + timeout;
        priorityLevel = {
          id: taskIdCounter++,
          callback,
          priorityLevel,
          startTime: options,
          expirationTime: timeout,
          sortIndex: -1
        };
        options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline())));
        return priorityLevel;
      };
      exports.unstable_shouldYield = shouldYieldToHost;
      exports.unstable_wrapCallback = function(callback) {
        var parentPriorityLevel = currentPriorityLevel;
        return function() {
          var previousPriorityLevel = currentPriorityLevel;
          currentPriorityLevel = parentPriorityLevel;
          try {
            return callback.apply(this, arguments);
          } finally {
            currentPriorityLevel = previousPriorityLevel;
          }
        };
      };
    }
  });

  // node_modules/scheduler/index.js
  var require_scheduler = __commonJS({
    "node_modules/scheduler/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_scheduler_production();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react/cjs/react.production.js
  var require_react_production = __commonJS({
    "node_modules/react/cjs/react.production.js"(exports) {
      "use strict";
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
      var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
      var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      var ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function() {
        },
        enqueueReplaceState: function() {
        },
        enqueueSetState: function() {
        }
      };
      var assign = Object.assign;
      var emptyObject = {};
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      function ComponentDummy() {
      }
      ComponentDummy.prototype = Component.prototype;
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
      pureComponentPrototype.constructor = PureComponent;
      assign(pureComponentPrototype, Component.prototype);
      pureComponentPrototype.isPureReactComponent = true;
      var isArrayImpl = Array.isArray;
      function noop() {
      }
      var ReactSharedInternals = { H: null, A: null, T: null, S: null };
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      function ReactElement(type, key, props) {
        var refProp = props.ref;
        return {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          ref: void 0 !== refProp ? refProp : null,
          props
        };
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        return ReactElement(oldElement.type, newKey, oldElement.props);
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      var userProvidedKeyEscapeRegex = /\/+/g;
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback)
          return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + invokeCallback
          )), array.push(callback)), 1;
        invokeCallback = 0;
        var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ctor = payload._result, thenable = ctor();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status)
                payload._status = 1, payload._result = moduleObject, void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status)
                payload._status = 2, payload._result = error, void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          );
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status) return payload._result.default;
        throw payload._result;
      }
      var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      };
      function startTransition(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition.types = null !== prevTransition ? prevTransition.types : null;
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      }
      function addTransitionType(type) {
        var transition = ReactSharedInternals.T;
        if (null !== transition) {
          var transitionTypes = transition.types;
          null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
        } else startTransition(addTransitionType.bind(null, type));
      }
      var Children = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = Children;
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function(size) {
          return ReactSharedInternals.H.useMemoCache(size);
        }
      };
      exports.addTransitionType = addTransitionType;
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key;
        if (null != config)
          for (propName in void 0 !== config.key && (key = "" + config.key), config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          for (var childArray = Array(propName), i = 0; i < propName; i++)
            childArray[i] = arguments[i + 2];
          props.children = childArray;
        }
        return ReactElement(element.type, key, props);
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        var propName, props = {}, key = null;
        if (null != config)
          for (propName in void 0 !== config.key && (key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) props.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
            childArray[i] = arguments[i + 2];
          props.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === props[propName] && (props[propName] = childrenLength[propName]);
        return ReactElement(type, key, props);
      };
      exports.createRef = function() {
        return { current: null };
      };
      exports.forwardRef = function(render) {
        return { $$typeof: REACT_FORWARD_REF_TYPE, render };
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        return {
          $$typeof: REACT_LAZY_TYPE,
          _payload: { _status: -1, _result: ctor },
          _init: lazyInitializer
        };
      };
      exports.memo = function(type, compare) {
        return {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
      };
      exports.startTransition = startTransition;
      exports.unstable_useCacheRefresh = function() {
        return ReactSharedInternals.H.useCacheRefresh();
      };
      exports.use = function(usable) {
        return ReactSharedInternals.H.use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return ReactSharedInternals.H.useActionState(action, initialState, permalink);
      };
      exports.useCallback = function(callback, deps) {
        return ReactSharedInternals.H.useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        return ReactSharedInternals.H.useContext(Context);
      };
      exports.useDebugValue = function() {
      };
      exports.useDeferredValue = function(value, initialValue) {
        return ReactSharedInternals.H.useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, deps) {
        return ReactSharedInternals.H.useEffect(create, deps);
      };
      exports.useEffectEvent = function(callback) {
        return ReactSharedInternals.H.useEffectEvent(callback);
      };
      exports.useId = function() {
        return ReactSharedInternals.H.useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        return ReactSharedInternals.H.useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        return ReactSharedInternals.H.useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return ReactSharedInternals.H.useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return ReactSharedInternals.H.useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return ReactSharedInternals.H.useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return ReactSharedInternals.H.useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return ReactSharedInternals.H.useTransition();
      };
      exports.version = "19.3.1";
    }
  });

  // node_modules/react/index.js
  var require_react = __commonJS({
    "node_modules/react/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_production();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/cjs/react-dom.production.js
  var require_react_dom_production = __commonJS({
    "node_modules/react-dom/cjs/react-dom.production.js"(exports) {
      "use strict";
      var React = require_react();
      function formatProdErrorMessage(code) {
        var url = "https://react.dev/errors/" + code;
        if (1 < arguments.length) {
          url += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var i = 2; i < arguments.length; i++)
            url += "&args[]=" + encodeURIComponent(arguments[i]);
        }
        return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      function noop() {
      }
      var Internals = {
        d: {
          f: noop,
          r: function() {
            throw Error(formatProdErrorMessage(522));
          },
          D: noop,
          C: noop,
          L: noop,
          m: noop,
          X: noop,
          S: noop,
          M: noop
        },
        p: 0,
        findDOMNode: null
      };
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
      var REACT_OPTIMISTIC_KEY = Symbol.for("react.optimistic_key");
      function createPortal$1(children, containerInfo, implementation) {
        var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        return {
          $$typeof: REACT_PORTAL_TYPE,
          key: null == key ? null : key === REACT_OPTIMISTIC_KEY ? REACT_OPTIMISTIC_KEY : "" + key,
          children,
          containerInfo,
          implementation
        };
      }
      var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      function getCrossOriginStringAs(as, input) {
        if ("font" === as) return "";
        if ("string" === typeof input)
          return "use-credentials" === input ? input : "";
      }
      exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
      exports.browser = function(reason) {
        return { $$typeof: REACT_RECOVERABLE_TYPE, _reason: reason };
      };
      exports.createPortal = function(children, container2) {
        var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        if (!container2 || 1 !== container2.nodeType && 9 !== container2.nodeType && 11 !== container2.nodeType)
          throw Error(formatProdErrorMessage(299));
        return createPortal$1(children, container2, null, key);
      };
      exports.flushSync = function(fn) {
        var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
        try {
          if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
        } finally {
          ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
        }
      };
      exports.preconnect = function(href, options) {
        "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
      };
      exports.prefetchDNS = function(href) {
        "string" === typeof href && Internals.d.D(href);
      };
      exports.preinit = function(href, options) {
        if ("string" === typeof href && options && "string" === typeof options.as) {
          var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
          "style" === as ? Internals.d.S(
            href,
            "string" === typeof options.precedence ? options.precedence : void 0,
            {
              crossOrigin,
              integrity,
              fetchPriority
            }
          ) : "script" === as && Internals.d.X(href, {
            crossOrigin,
            integrity,
            fetchPriority,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      };
      exports.preinitModule = function(href, options) {
        if ("string" === typeof href)
          if ("object" === typeof options && null !== options) {
            if (null == options.as || "script" === options.as) {
              var crossOrigin = getCrossOriginStringAs(
                options.as,
                options.crossOrigin
              );
              Internals.d.M(href, {
                crossOrigin,
                integrity: "string" === typeof options.integrity ? options.integrity : void 0,
                nonce: "string" === typeof options.nonce ? options.nonce : void 0,
                fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
              });
            }
          } else null == options && Internals.d.M(href);
      };
      exports.preload = function(href, options) {
        if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
          var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
          Internals.d.L(href, as, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
            type: "string" === typeof options.type ? options.type : void 0,
            fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
            referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
            imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
            imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
            media: "string" === typeof options.media ? options.media : void 0
          });
        }
      };
      exports.preloadModule = function(href, options) {
        if ("string" === typeof href)
          if (options) {
            var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
            Internals.d.m(href, {
              as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
              crossOrigin,
              integrity: "string" === typeof options.integrity ? options.integrity : void 0,
              nonce: "string" === typeof options.nonce ? options.nonce : void 0,
              fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
            });
          } else Internals.d.m(href);
      };
      exports.requestFormReset = function(form) {
        Internals.d.r(form);
      };
      exports.unstable_batchedUpdates = function(fn, a) {
        return fn(a);
      };
      exports.useFormState = function(action, initialState, permalink) {
        return ReactSharedInternals.H.useFormState(action, initialState, permalink);
      };
      exports.useFormStatus = function() {
        return ReactSharedInternals.H.useHostTransitionStatus();
      };
      exports.version = "19.3.1";
    }
  });

  // node_modules/react-dom/index.js
  var require_react_dom = __commonJS({
    "node_modules/react-dom/index.js"(exports, module) {
      "use strict";
      function checkDCE() {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
          return;
        }
        if (false) {
          throw new Error("^_^");
        }
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
        } catch (err) {
          console.error(err);
        }
      }
      if (true) {
        checkDCE();
        module.exports = require_react_dom_production();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/cjs/react-dom-client.production.js
  var require_react_dom_client_production = __commonJS({
    "node_modules/react-dom/cjs/react-dom-client.production.js"(exports) {
      "use strict";
      var Scheduler = require_scheduler();
      var React = require_react();
      var ReactDOM = require_react_dom();
      function formatProdErrorMessage(code) {
        var url = "https://react.dev/errors/" + code;
        if (1 < arguments.length) {
          url += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var i = 2; i < arguments.length; i++)
            url += "&args[]=" + encodeURIComponent(arguments[i]);
        }
        return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      function isValidContainer(node) {
        return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
      }
      function getNearestMountedFiber(fiber) {
        for (var node = fiber, nextNode = node; nextNode && !nextNode.alternate; )
          node = nextNode, 0 !== (node.flags & 4098) && (fiber = node.return), nextNode = node.return;
        for (; node.return; ) node = node.return;
        return 3 === node.tag ? fiber : null;
      }
      function getSuspenseInstanceFromFiber(fiber) {
        if (13 === fiber.tag) {
          var suspenseState = fiber.memoizedState;
          null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
          if (null !== suspenseState) return suspenseState.dehydrated;
        }
        return null;
      }
      function getActivityInstanceFromFiber(fiber) {
        if (31 === fiber.tag) {
          var activityState = fiber.memoizedState;
          null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
          if (null !== activityState) return activityState.dehydrated;
        }
        return null;
      }
      function assertIsMounted(fiber) {
        if (getNearestMountedFiber(fiber) !== fiber)
          throw Error(formatProdErrorMessage(188));
      }
      function findCurrentFiberUsingSlowPath(fiber) {
        var alternate = fiber.alternate;
        if (!alternate) {
          alternate = getNearestMountedFiber(fiber);
          if (null === alternate) throw Error(formatProdErrorMessage(188));
          return alternate !== fiber ? null : fiber;
        }
        for (var a = fiber, b = alternate; ; ) {
          var parentA = a.return;
          if (null === parentA) break;
          var parentB = parentA.alternate;
          if (null === parentB) {
            b = parentA.return;
            if (null !== b) {
              a = b;
              continue;
            }
            break;
          }
          if (parentA.child === parentB.child) {
            for (parentB = parentA.child; parentB; ) {
              if (parentB === a) return assertIsMounted(parentA), fiber;
              if (parentB === b) return assertIsMounted(parentA), alternate;
              parentB = parentB.sibling;
            }
            throw Error(formatProdErrorMessage(188));
          }
          if (a.return !== b.return) a = parentA, b = parentB;
          else {
            for (var didFindChild = false, child$0 = parentA.child; child$0; ) {
              if (child$0 === a) {
                didFindChild = true;
                a = parentA;
                b = parentB;
                break;
              }
              if (child$0 === b) {
                didFindChild = true;
                b = parentA;
                a = parentB;
                break;
              }
              child$0 = child$0.sibling;
            }
            if (!didFindChild) {
              for (child$0 = parentB.child; child$0; ) {
                if (child$0 === a) {
                  didFindChild = true;
                  a = parentB;
                  b = parentA;
                  break;
                }
                if (child$0 === b) {
                  didFindChild = true;
                  b = parentB;
                  a = parentA;
                  break;
                }
                child$0 = child$0.sibling;
              }
              if (!didFindChild) throw Error(formatProdErrorMessage(189));
            }
          }
          if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
        }
        if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
        return a.stateNode.current === a ? fiber : alternate;
      }
      function findCurrentHostFiberImpl(node) {
        var tag = node.tag;
        if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
        for (node = node.child; null !== node; ) {
          tag = findCurrentHostFiberImpl(node);
          if (null !== tag) return tag;
          node = node.sibling;
        }
        return null;
      }
      function traverseVisibleInstancesAndTextInstances(child, searchWithinHosts, fn, a, b, c) {
        for (; null !== child; ) {
          if ((5 === child.tag || 27 === child.tag || 6 === child.tag) && fn(child, a, b, c) || (22 !== child.tag || null === child.memoizedState) && (searchWithinHosts || 5 !== child.tag && 27 !== child.tag) && traverseVisibleInstancesAndTextInstances(
            child.child,
            searchWithinHosts,
            fn,
            a,
            b,
            c
          ))
            return true;
          child = child.sibling;
        }
        return false;
      }
      function getFragmentParentInstanceOrContainerFiber(fiber) {
        for (fiber = fiber.return; null !== fiber; ) {
          if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) return fiber;
          fiber = fiber.return;
        }
        return null;
      }
      function fiberIsPortaledIntoHost(fiber) {
        var foundPortalParent = false;
        for (fiber = fiber.return; null !== fiber; ) {
          4 === fiber.tag && (foundPortalParent = true);
          if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) break;
          fiber = fiber.return;
        }
        return foundPortalParent;
      }
      function getFragmentInstanceOrTextInstanceSiblings(fiber) {
        var result = [null, null], parentHostFiber = getFragmentParentInstanceOrContainerFiber(fiber);
        if (null === parentHostFiber) return result;
        findFragmentInstanceOrTextInstanceSiblings(
          result,
          fiber,
          parentHostFiber.child,
          { foundSelf: false }
        );
        return result;
      }
      function findFragmentInstanceOrTextInstanceSiblings(result, self, child, state) {
        for (; null !== child; ) {
          if (child === self) state.foundSelf = true;
          else if (5 === child.tag || 27 === child.tag || 6 === child.tag) {
            if (state.foundSelf) return result[1] = child, true;
            result[0] = child;
          } else if ((22 !== child.tag || null === child.memoizedState) && findFragmentInstanceOrTextInstanceSiblings(
            result,
            self,
            child.child,
            state
          ))
            return true;
          child = child.sibling;
        }
        return false;
      }
      function getInstanceFromHostFiber(fiber) {
        switch (fiber.tag) {
          case 5:
          case 27:
          case 6:
            return fiber.stateNode;
          case 3:
            return fiber.stateNode.containerInfo;
          default:
            throw Error(formatProdErrorMessage(559));
        }
      }
      var searchTarget = null;
      var searchBoundary = null;
      function isFiberPrecedingCheck(child, target, boundary) {
        return child === boundary ? true : child === target ? (searchTarget = child, true) : false;
      }
      function isFiberFollowingCheck(child, target, boundary) {
        return child === boundary ? (searchBoundary = child, false) : child === target ? (null !== searchBoundary && (searchTarget = child), true) : false;
      }
      function getParentForFragmentAncestors(inst) {
        if (null === inst) return null;
        do
          inst = null === inst ? null : inst.return;
        while (inst && 5 !== inst.tag && 27 !== inst.tag && 3 !== inst.tag);
        return inst ? inst : null;
      }
      function getLowestCommonAncestor(instA, instB, getParent2) {
        for (var depthA = 0, tempA = instA; tempA; tempA = getParent2(tempA)) depthA++;
        tempA = 0;
        for (var tempB = instB; tempB; tempB = getParent2(tempB)) tempA++;
        for (; 0 < depthA - tempA; ) instA = getParent2(instA), depthA--;
        for (; 0 < tempA - depthA; ) instB = getParent2(instB), tempA--;
        for (; depthA--; ) {
          if (instA === instB || null !== instB && instA === instB.alternate)
            return instA;
          instA = getParent2(instA);
          instB = getParent2(instB);
        }
        return null;
      }
      var assign = Object.assign;
      var REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element");
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      Symbol.for("react.scope");
      var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
      var REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden");
      Symbol.for("react.tracing_marker");
      var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
      var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
      var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
      var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
          case REACT_VIEW_TRANSITION_TYPE:
            return "ViewTransition";
        }
        if ("object" === typeof type)
          switch (type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      var isArrayImpl = Array.isArray;
      var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      var sharedNotPendingObject = {
        pending: false,
        data: null,
        method: null,
        action: null
      };
      var valueStack = [];
      var index = -1;
      function createCursor(defaultValue) {
        return { current: defaultValue };
      }
      function pop(cursor) {
        0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
      }
      function push(cursor, value) {
        index++;
        valueStack[index] = cursor.current;
        cursor.current = value;
      }
      var contextStackCursor = createCursor(null);
      var contextFiberStackCursor = createCursor(null);
      var rootInstanceStackCursor = createCursor(null);
      var hostTransitionProviderCursor = createCursor(null);
      function pushHostContainer(fiber, nextRootInstance) {
        push(rootInstanceStackCursor, nextRootInstance);
        push(contextFiberStackCursor, fiber);
        push(contextStackCursor, null);
        switch (nextRootInstance.nodeType) {
          case 9:
          case 11:
            fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
            break;
          default:
            if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI)
              nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
            else
              switch (fiber) {
                case "svg":
                  fiber = 1;
                  break;
                case "math":
                  fiber = 2;
                  break;
                default:
                  fiber = 0;
              }
        }
        pop(contextStackCursor);
        push(contextStackCursor, fiber);
      }
      function popHostContainer() {
        pop(contextStackCursor);
        pop(contextFiberStackCursor);
        pop(rootInstanceStackCursor);
      }
      function pushHostContext(fiber) {
        var stateHook = fiber.memoizedState;
        null !== stateHook && (HostTransitionContext._currentValue = stateHook.memoizedState, push(hostTransitionProviderCursor, fiber));
        stateHook = contextStackCursor.current;
        var JSCompiler_inline_result = getChildHostContextProd(stateHook, fiber.type);
        stateHook !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
      }
      function popHostContext(fiber) {
        contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
        hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
      }
      var prefix;
      var suffix;
      function describeBuiltInComponentFrame(name) {
        if (void 0 === prefix)
          try {
            throw Error();
          } catch (x) {
            var match = x.stack.trim().match(/\n( *(at )?)/);
            prefix = match && match[1] || "";
            suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
          }
        return "\n" + prefix + name + suffix;
      }
      var reentry = false;
      function describeNativeComponentFrame(fn, construct) {
        if (!fn || reentry) return "";
        reentry = true;
        var previousPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
          var RunInRootFrame = {
            DetermineComponentFrameRoot: function() {
              try {
                if (construct) {
                  var Fake = function() {
                    throw Error();
                  };
                  Object.defineProperty(Fake.prototype, "props", {
                    set: function() {
                      throw Error();
                    }
                  });
                  if ("object" === typeof Reflect && Reflect.construct) {
                    try {
                      Reflect.construct(Fake, []);
                    } catch (x) {
                      var control = x;
                    }
                    Reflect.construct(fn, [], Fake);
                  } else {
                    try {
                      Fake.call();
                    } catch (x$1) {
                      control = x$1;
                    }
                    Fake = false;
                    try {
                      var prevProps = Object.getOwnPropertyDescriptor(
                        fn.prototype,
                        "props"
                      );
                      Object.defineProperty(fn.prototype, "props", {
                        configurable: true,
                        set: function() {
                          throw Error();
                        }
                      });
                      Fake = true;
                      new fn();
                    } finally {
                      Fake && (void 0 !== prevProps ? Object.defineProperty(fn.prototype, "props", prevProps) : delete fn.prototype.props);
                    }
                  }
                } else {
                  try {
                    throw Error();
                  } catch (x$2) {
                    control = x$2;
                  }
                  (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {
                  });
                }
              } catch (sample) {
                if (sample && control && "string" === typeof sample.stack)
                  return [sample.stack, control.stack];
              }
              return [null, null];
            }
          };
          RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
          var namePropDescriptor = Object.getOwnPropertyDescriptor(
            RunInRootFrame.DetermineComponentFrameRoot,
            "name"
          );
          namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(
            RunInRootFrame.DetermineComponentFrameRoot,
            "name",
            { value: "DetermineComponentFrameRoot" }
          );
          var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
          if (sampleStack && controlStack) {
            var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
            for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
              RunInRootFrame++;
            for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes(
              "DetermineComponentFrameRoot"
            ); )
              namePropDescriptor++;
            if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
              for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
                namePropDescriptor--;
            for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
              if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
                  do
                    if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                      var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                      fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                      return frame;
                    }
                  while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
                }
                break;
              }
          }
        } finally {
          reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
        }
        return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
      }
      function describeFiber(fiber, childFiber) {
        switch (fiber.tag) {
          case 26:
          case 27:
          case 5:
            return describeBuiltInComponentFrame(fiber.type);
          case 16:
            return describeBuiltInComponentFrame("Lazy");
          case 13:
            return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
          case 19:
            return describeBuiltInComponentFrame("SuspenseList");
          case 0:
          case 15:
            return describeNativeComponentFrame(fiber.type, false);
          case 11:
            return describeNativeComponentFrame(fiber.type.render, false);
          case 1:
            return describeNativeComponentFrame(fiber.type, true);
          case 31:
            return describeBuiltInComponentFrame("Activity");
          case 30:
            return describeBuiltInComponentFrame("ViewTransition");
          default:
            return "";
        }
      }
      function getStackByFiberInDevAndProd(workInProgress2) {
        try {
          var info = "", previous = null;
          do
            info += describeFiber(workInProgress2, previous), previous = workInProgress2, workInProgress2 = workInProgress2.return;
          while (workInProgress2);
          return info;
        } catch (x) {
          return "\nError generating stack: " + x.message + "\n" + x.stack;
        }
      }
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var scheduleCallback$3 = Scheduler.unstable_scheduleCallback;
      var cancelCallback$1 = Scheduler.unstable_cancelCallback;
      var shouldYield = Scheduler.unstable_shouldYield;
      var requestPaint = Scheduler.unstable_requestPaint;
      var now = Scheduler.unstable_now;
      var getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
      var ImmediatePriority = Scheduler.unstable_ImmediatePriority;
      var UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
      var NormalPriority$1 = Scheduler.unstable_NormalPriority;
      var LowPriority = Scheduler.unstable_LowPriority;
      var IdlePriority = Scheduler.unstable_IdlePriority;
      var log$1 = Scheduler.log;
      var unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
      var rendererID = null;
      var injectedHook = null;
      function setIsStrictModeForDevtools(newIsStrictMode) {
        "function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
        if (injectedHook && "function" === typeof injectedHook.setStrictMode)
          try {
            injectedHook.setStrictMode(rendererID, newIsStrictMode);
          } catch (err) {
          }
      }
      var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
      var log = Math.log;
      var LN2 = Math.LN2;
      function clz32Fallback(x) {
        x >>>= 0;
        return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
      }
      var nextTransitionUpdateLane = 256;
      var nextTransitionDeferredLane = 262144;
      var nextRetryLane = 4194304;
      function getHighestPriorityLanes(lanes) {
        var pendingSyncLanes = lanes & 42;
        if (0 !== pendingSyncLanes) return pendingSyncLanes;
        switch (lanes & -lanes) {
          case 1:
            return 1;
          case 2:
            return 2;
          case 4:
            return 4;
          case 8:
            return 8;
          case 16:
            return 16;
          case 32:
            return 32;
          case 64:
            return 64;
          case 128:
            return 128;
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
            return lanes & -lanes;
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return lanes & 3932160;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
            return lanes & 62914560;
          case 67108864:
            return 67108864;
          case 134217728:
            return 134217728;
          case 268435456:
            return 268435456;
          case 536870912:
            return 536870912;
          case 1073741824:
            return 0;
          default:
            return lanes;
        }
      }
      function getNextLanes(root2, wipLanes, rootHasPendingCommit) {
        var pendingLanes = root2.pendingLanes;
        if (0 === pendingLanes) return 0;
        var nextLanes = 0, suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes;
        root2 = root2.warmLanes;
        var nonIdlePendingLanes = pendingLanes & 134217727;
        0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
        return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
      }
      function checkIfRootIsPrerendering(root2, renderLanes2) {
        return 0 === (root2.pendingLanes & ~(root2.suspendedLanes & ~root2.pingedLanes) & renderLanes2);
      }
      function getEntangledLanes(root2, renderLanes2) {
        0 !== (renderLanes2 & 8) && (renderLanes2 |= renderLanes2 & 32);
        var allEntangledLanes = root2.entangledLanes;
        if (0 !== allEntangledLanes)
          for (root2 = root2.entanglements, allEntangledLanes &= renderLanes2; 0 < allEntangledLanes; ) {
            var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
            renderLanes2 |= root2[index$4];
            allEntangledLanes &= ~lane;
          }
        return renderLanes2;
      }
      function computeExpirationTime(lane, currentTime) {
        switch (lane) {
          case 1:
          case 2:
          case 4:
          case 8:
          case 64:
            return currentTime + 250;
          case 16:
          case 32:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return currentTime + 5e3;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
            return -1;
          case 67108864:
          case 134217728:
          case 268435456:
          case 536870912:
          case 1073741824:
            return -1;
          default:
            return -1;
        }
      }
      function claimNextRetryLane() {
        var lane = nextRetryLane;
        nextRetryLane <<= 1;
        0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
        return lane;
      }
      function createLaneMap(initial) {
        for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
        return laneMap;
      }
      function markRootUpdated$1(root2, updateLane) {
        root2.pendingLanes |= updateLane;
        268435456 !== updateLane && (root2.suspendedLanes = 0, root2.pingedLanes = 0, root2.warmLanes = 0);
      }
      function markRootFinished(root2, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
        var previouslyPendingLanes = root2.pendingLanes;
        root2.pendingLanes = remainingLanes;
        root2.suspendedLanes = 0;
        root2.pingedLanes = 0;
        root2.warmLanes = 0;
        root2.expiredLanes &= remainingLanes;
        root2.entangledLanes &= remainingLanes;
        root2.errorRecoveryDisabledLanes &= remainingLanes;
        root2.shellSuspendCounter = 0;
        var entanglements = root2.entanglements, expirationTimes = root2.expirationTimes, hiddenUpdates = root2.hiddenUpdates;
        for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes; ) {
          var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
          entanglements[index$7] = 0;
          expirationTimes[index$7] = -1;
          var hiddenUpdatesForLane = hiddenUpdates[index$7];
          if (null !== hiddenUpdatesForLane)
            for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
              var update = hiddenUpdatesForLane[index$7];
              null !== update && (update.lane &= -536870913);
            }
          remainingLanes &= ~lane;
        }
        0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, 0);
        0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root2.tag && (root2.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
      }
      function markSpawnedDeferredLane(root2, spawnedLane, entangledLanes) {
        root2.pendingLanes |= spawnedLane;
        root2.suspendedLanes &= ~spawnedLane;
        var spawnedLaneIndex = 31 - clz32(spawnedLane);
        root2.entangledLanes |= spawnedLane;
        root2.entanglements[spawnedLaneIndex] = root2.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
      }
      function markRootEntangled(root2, entangledLanes) {
        var rootEntangledLanes = root2.entangledLanes |= entangledLanes;
        for (root2 = root2.entanglements; rootEntangledLanes; ) {
          var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
          lane & entangledLanes | root2[index$8] & entangledLanes && (root2[index$8] |= entangledLanes);
          rootEntangledLanes &= ~lane;
        }
      }
      function getBumpedLaneForHydration(root2, renderLanes2) {
        var renderLane = renderLanes2 & -renderLanes2;
        renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
        return 0 !== (renderLane & (root2.suspendedLanes | renderLanes2)) ? 0 : renderLane;
      }
      function getBumpedLaneForHydrationByLane(lane) {
        switch (lane) {
          case 2:
            lane = 1;
            break;
          case 8:
            lane = 4;
            break;
          case 32:
            lane = 16;
            break;
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
            lane = 128;
            break;
          case 268435456:
            lane = 134217728;
            break;
          default:
            lane = 0;
        }
        return lane;
      }
      function lanesToEventPriority(lanes) {
        lanes &= -lanes;
        return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
      }
      function resolveUpdatePriority() {
        var updatePriority = ReactDOMSharedInternals.p;
        if (0 !== updatePriority) return updatePriority;
        updatePriority = window.event;
        return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
      }
      function runWithPriority(priority, fn) {
        var previousPriority = ReactDOMSharedInternals.p;
        try {
          return ReactDOMSharedInternals.p = priority, fn();
        } finally {
          ReactDOMSharedInternals.p = previousPriority;
        }
      }
      var randomKey = Math.random().toString(36).slice(2);
      var internalInstanceKey = "__reactFiber$" + randomKey;
      var internalPropsKey = "__reactProps$" + randomKey;
      var internalContainerInstanceKey = "__reactContainer$" + randomKey;
      var internalEventHandlersKey = "__reactEvents$" + randomKey;
      var internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
      var internalEventHandlesSetKey = "__reactHandles$" + randomKey;
      var internalRootNodeResourcesKey = "__reactResources$" + randomKey;
      var internalHoistableMarker = "__reactMarker$" + randomKey;
      var internalLoadPendingKey = "__reactLoad$" + randomKey;
      function detachDeletedInstance(node) {
        delete node[internalInstanceKey];
        delete node[internalPropsKey];
        delete node[internalEventHandlerListenersKey];
        delete node[internalEventHandlesSetKey];
      }
      function getClosestInstanceFromNode(targetNode) {
        var targetInst;
        if (targetInst = targetNode[internalInstanceKey]) return targetInst;
        for (var parentNode = targetNode.parentNode; parentNode; ) {
          if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
            parentNode = targetInst.alternate;
            if (null !== targetInst.child || null !== parentNode && null !== parentNode.child)
              for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode; ) {
                if (parentNode = targetNode[internalInstanceKey]) return parentNode;
                targetNode = getParentHydrationBoundary(targetNode);
              }
            return targetInst;
          }
          targetNode = parentNode;
          parentNode = targetNode.parentNode;
        }
        return null;
      }
      function getInstanceFromNode(node) {
        if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
          var tag = node.tag;
          if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag)
            return node;
        }
        return null;
      }
      function getNodeFromInstance(inst) {
        var tag = inst.tag;
        if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
        throw Error(formatProdErrorMessage(33));
      }
      function getResourcesFromRoot(root2) {
        var resources = root2[internalRootNodeResourcesKey];
        resources || (resources = root2[internalRootNodeResourcesKey] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() });
        return resources;
      }
      function markNodeAsHoistable(node) {
        node[internalHoistableMarker] = true;
      }
      function clearPendingLoadOnNode(node) {
        node[internalLoadPendingKey] = void 0;
      }
      var allNativeEvents = /* @__PURE__ */ new Set();
      var registrationNameDependencies = {};
      function registerTwoPhaseEvent(registrationName, dependencies) {
        registerDirectEvent(registrationName, dependencies);
        registerDirectEvent(registrationName + "Capture", dependencies);
      }
      function registerDirectEvent(registrationName, dependencies) {
        registrationNameDependencies[registrationName] = dependencies;
        for (registrationName = 0; registrationName < dependencies.length; registrationName++)
          allNativeEvents.add(dependencies[registrationName]);
      }
      var VALID_ATTRIBUTE_NAME_REGEX = RegExp(
        "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
      );
      var illegalAttributeNameCache = {};
      var validatedAttributeNameCache = {};
      function isAttributeNameSafe(attributeName) {
        if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
          return true;
        if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return false;
        if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
          return validatedAttributeNameCache[attributeName] = true;
        illegalAttributeNameCache[attributeName] = true;
        return false;
      }
      var viewTransitionMutationContext = false;
      function pushMutationContext() {
        var prev = viewTransitionMutationContext;
        viewTransitionMutationContext = false;
        return prev;
      }
      function setValueForAttribute(node, name, value) {
        if (isAttributeNameSafe(name))
          if (null === value) node.removeAttribute(name);
          else {
            switch (typeof value) {
              case "undefined":
              case "function":
              case "symbol":
                node.removeAttribute(name);
                return;
              case "boolean":
                var prefix$10 = name.toLowerCase().slice(0, 5);
                if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
                  node.removeAttribute(name);
                  return;
                }
            }
            node.setAttribute(name, value);
          }
      }
      function setValueForKnownAttribute(node, name, value) {
        if (null === value) node.removeAttribute(name);
        else {
          switch (typeof value) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
              node.removeAttribute(name);
              return;
          }
          node.setAttribute(name, value);
        }
      }
      function setValueForNamespacedAttribute(node, namespace, name, value) {
        if (null === value) node.removeAttribute(name);
        else {
          switch (typeof value) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
              node.removeAttribute(name);
              return;
          }
          node.setAttributeNS(namespace, name, value);
        }
      }
      function getToStringValue(value) {
        switch (typeof value) {
          case "bigint":
          case "boolean":
          case "number":
          case "string":
          case "undefined":
            return value;
          case "object":
            return value;
          default:
            return "";
        }
      }
      function isCheckable(elem) {
        var type = elem.type;
        return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
      }
      function trackValueOnNode(node, valueField, currentValue) {
        var descriptor = Object.getOwnPropertyDescriptor(
          node.constructor.prototype,
          valueField
        );
        if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
          var get = descriptor.get, set = descriptor.set;
          Object.defineProperty(node, valueField, {
            configurable: true,
            get: function() {
              return get.call(this);
            },
            set: function(value) {
              currentValue = "" + value;
              set.call(this, value);
            }
          });
          Object.defineProperty(node, valueField, {
            enumerable: descriptor.enumerable
          });
          return {
            getValue: function() {
              return currentValue;
            },
            setValue: function(value) {
              currentValue = "" + value;
            },
            stopTracking: function() {
              node._valueTracker = null;
              delete node[valueField];
            }
          };
        }
      }
      function track(node) {
        if (!node._valueTracker) {
          var valueField = isCheckable(node) ? "checked" : "value";
          node._valueTracker = trackValueOnNode(
            node,
            valueField,
            "" + node[valueField]
          );
        }
      }
      function updateValueIfChanged(node) {
        if (!node) return false;
        var tracker = node._valueTracker;
        if (!tracker) return true;
        var lastValue = tracker.getValue();
        var value = "";
        node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
        node = value;
        return node !== lastValue ? (tracker.setValue(node), true) : false;
      }
      var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
      function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
        return value.replace(
          escapeSelectorAttributeValueInsideDoubleQuotesRegex,
          function(ch) {
            return "\\" + ch.charCodeAt(0).toString(16) + " ";
          }
        );
      }
      function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
        element.name = "";
        null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
        if (null != value)
          if ("number" === type) {
            if (0 === value && "" === element.value || element.value != value)
              element.value = "" + getToStringValue(value);
          } else
            element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
        else
          "submit" !== type && "reset" !== type || element.removeAttribute("value");
        null != value ? "number" === type && element.value == value ? setDefaultValue(element, getToStringValue(element.value)) : setDefaultValue(element, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
        null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
        null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
        null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
      }
      function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating2) {
        null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
        if (null != value || null != defaultValue) {
          if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
            track(element);
            return;
          }
          defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
          value = null != value ? "" + getToStringValue(value) : defaultValue;
          isHydrating2 || value === element.value || (element.value = value);
          element.defaultValue = value;
        }
        checked = null != checked ? checked : defaultChecked;
        checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
        element.checked = isHydrating2 ? element.checked : !!checked;
        element.defaultChecked = !!checked;
        null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
        track(element);
      }
      function setDefaultValue(node, value) {
        node.defaultValue !== "" + value && (node.defaultValue = "" + value);
      }
      function updateOptions(node, multiple, propValue, setDefaultSelected) {
        node = node.options;
        if (multiple) {
          multiple = {};
          for (var i = 0; i < propValue.length; i++)
            multiple["$" + propValue[i]] = true;
          for (propValue = 0; propValue < node.length; propValue++)
            i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = true);
        } else {
          propValue = "" + getToStringValue(propValue);
          multiple = null;
          for (i = 0; i < node.length; i++) {
            if (node[i].value === propValue) {
              node[i].selected = true;
              setDefaultSelected && (node[i].defaultSelected = true);
              return;
            }
            null !== multiple || node[i].disabled || (multiple = node[i]);
          }
          null !== multiple && (multiple.selected = true);
        }
      }
      function updateTextarea(element, value, defaultValue) {
        if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
          element.defaultValue !== value && (element.defaultValue = value);
          return;
        }
        element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
      }
      function initTextarea(element, value, defaultValue, children) {
        if (null == value) {
          if (null != children) {
            if (null != defaultValue) throw Error(formatProdErrorMessage(92));
            if (isArrayImpl(children)) {
              if (1 < children.length) throw Error(formatProdErrorMessage(93));
              children = children[0];
            }
            defaultValue = children;
          }
          null == defaultValue && (defaultValue = "");
          value = defaultValue;
        }
        defaultValue = getToStringValue(value);
        element.defaultValue = defaultValue;
        children = element.textContent;
        children === defaultValue && "" !== children && null !== children && (element.value = children);
        track(element);
      }
      function setTextContent(node, text) {
        if (text) {
          var firstChild = node.firstChild;
          if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
            firstChild.nodeValue = text;
            return;
          }
        }
        node.textContent = text;
      }
      var unitlessNumbers = new Set(
        "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
          " "
        )
      );
      function setValueForStyle(style2, styleName, value) {
        var isCustomProperty = 0 === styleName.indexOf("--");
        null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style2.setProperty(styleName, "") : "float" === styleName ? style2.cssFloat = "" : style2[styleName] = "" : isCustomProperty ? style2.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style2.cssFloat = value : style2[styleName] = ("" + value).trim() : style2[styleName] = value + "px";
      }
      function setValueForStyles(node, styles, prevStyles) {
        if (null != styles && "object" !== typeof styles)
          throw Error(formatProdErrorMessage(62));
        node = node.style;
        if (null != prevStyles) {
          for (var styleName in prevStyles)
            !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "", viewTransitionMutationContext = true);
          for (var styleName$16 in styles)
            styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && (setValueForStyle(node, styleName$16, styleName), viewTransitionMutationContext = true);
        } else
          for (var styleName$17 in styles)
            styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
      }
      function isCustomElement(tagName) {
        if (-1 === tagName.indexOf("-")) return false;
        switch (tagName) {
          case "annotation-xml":
          case "color-profile":
          case "font-face":
          case "font-face-src":
          case "font-face-uri":
          case "font-face-format":
          case "font-face-name":
          case "missing-glyph":
            return false;
          default:
            return true;
        }
      }
      var aliases = /* @__PURE__ */ new Map([
        ["acceptCharset", "accept-charset"],
        ["htmlFor", "for"],
        ["httpEquiv", "http-equiv"],
        ["crossOrigin", "crossorigin"],
        ["accentHeight", "accent-height"],
        ["alignmentBaseline", "alignment-baseline"],
        ["arabicForm", "arabic-form"],
        ["baselineShift", "baseline-shift"],
        ["capHeight", "cap-height"],
        ["clipPath", "clip-path"],
        ["clipRule", "clip-rule"],
        ["colorInterpolation", "color-interpolation"],
        ["colorInterpolationFilters", "color-interpolation-filters"],
        ["colorProfile", "color-profile"],
        ["colorRendering", "color-rendering"],
        ["dominantBaseline", "dominant-baseline"],
        ["enableBackground", "enable-background"],
        ["fillOpacity", "fill-opacity"],
        ["fillRule", "fill-rule"],
        ["floodColor", "flood-color"],
        ["floodOpacity", "flood-opacity"],
        ["fontFamily", "font-family"],
        ["fontSize", "font-size"],
        ["fontSizeAdjust", "font-size-adjust"],
        ["fontStretch", "font-stretch"],
        ["fontStyle", "font-style"],
        ["fontVariant", "font-variant"],
        ["fontWeight", "font-weight"],
        ["glyphName", "glyph-name"],
        ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
        ["glyphOrientationVertical", "glyph-orientation-vertical"],
        ["horizAdvX", "horiz-adv-x"],
        ["horizOriginX", "horiz-origin-x"],
        ["imageRendering", "image-rendering"],
        ["letterSpacing", "letter-spacing"],
        ["lightingColor", "lighting-color"],
        ["markerEnd", "marker-end"],
        ["markerMid", "marker-mid"],
        ["markerStart", "marker-start"],
        ["maskType", "mask-type"],
        ["overlinePosition", "overline-position"],
        ["overlineThickness", "overline-thickness"],
        ["paintOrder", "paint-order"],
        ["panose-1", "panose-1"],
        ["pointerEvents", "pointer-events"],
        ["renderingIntent", "rendering-intent"],
        ["shapeRendering", "shape-rendering"],
        ["stopColor", "stop-color"],
        ["stopOpacity", "stop-opacity"],
        ["strikethroughPosition", "strikethrough-position"],
        ["strikethroughThickness", "strikethrough-thickness"],
        ["strokeDasharray", "stroke-dasharray"],
        ["strokeDashoffset", "stroke-dashoffset"],
        ["strokeLinecap", "stroke-linecap"],
        ["strokeLinejoin", "stroke-linejoin"],
        ["strokeMiterlimit", "stroke-miterlimit"],
        ["strokeOpacity", "stroke-opacity"],
        ["strokeWidth", "stroke-width"],
        ["textAnchor", "text-anchor"],
        ["textDecoration", "text-decoration"],
        ["textRendering", "text-rendering"],
        ["transformOrigin", "transform-origin"],
        ["underlinePosition", "underline-position"],
        ["underlineThickness", "underline-thickness"],
        ["unicodeBidi", "unicode-bidi"],
        ["unicodeRange", "unicode-range"],
        ["unitsPerEm", "units-per-em"],
        ["vAlphabetic", "v-alphabetic"],
        ["vHanging", "v-hanging"],
        ["vIdeographic", "v-ideographic"],
        ["vMathematical", "v-mathematical"],
        ["vectorEffect", "vector-effect"],
        ["vertAdvY", "vert-adv-y"],
        ["vertOriginX", "vert-origin-x"],
        ["vertOriginY", "vert-origin-y"],
        ["wordSpacing", "word-spacing"],
        ["writingMode", "writing-mode"],
        ["xmlnsXlink", "xmlns:xlink"],
        ["xHeight", "x-height"]
      ]);
      var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
      function sanitizeURL(url) {
        return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
      }
      function noop$1() {
      }
      var currentReplayingEvent = null;
      function getEventTarget(nativeEvent) {
        nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
        nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
        return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
      }
      var restoreTarget = null;
      var restoreQueue = null;
      function restoreStateOfTarget(target) {
        var internalInstance = getInstanceFromNode(target);
        if (internalInstance && (target = internalInstance.stateNode)) {
          var props = target[internalPropsKey] || null;
          a: switch (target = internalInstance.stateNode, internalInstance.type) {
            case "input":
              updateInput(
                target,
                props.value,
                props.defaultValue,
                props.defaultValue,
                props.checked,
                props.defaultChecked,
                props.type,
                props.name
              );
              internalInstance = props.name;
              if ("radio" === props.type && null != internalInstance) {
                for (props = target; props.parentNode; ) props = props.parentNode;
                props = props.querySelectorAll(
                  'input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes(
                    "" + internalInstance
                  ) + '"][type="radio"]'
                );
                for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
                  var otherNode = props[internalInstance];
                  if (otherNode !== target && otherNode.form === target.form) {
                    var otherProps = otherNode[internalPropsKey] || null;
                    if (!otherProps) throw Error(formatProdErrorMessage(90));
                    updateInput(
                      otherNode,
                      otherProps.value,
                      otherProps.defaultValue,
                      otherProps.defaultValue,
                      otherProps.checked,
                      otherProps.defaultChecked,
                      otherProps.type,
                      otherProps.name
                    );
                  }
                }
                for (internalInstance = 0; internalInstance < props.length; internalInstance++)
                  otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
              }
              break a;
            case "textarea":
              updateTextarea(target, props.value, props.defaultValue);
              break a;
            case "select":
              internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, false);
          }
        }
      }
      var isInsideEventHandler = false;
      function batchedUpdates$1(fn, a, b) {
        if (isInsideEventHandler) return fn(a, b);
        isInsideEventHandler = true;
        try {
          var JSCompiler_inline_result = fn(a);
          return JSCompiler_inline_result;
        } finally {
          if (isInsideEventHandler = false, null !== restoreTarget || null !== restoreQueue) {
            if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn))
              for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
          }
        }
      }
      function getListener(inst, registrationName) {
        var stateNode = inst.stateNode;
        if (null === stateNode) return null;
        var props = stateNode[internalPropsKey] || null;
        if (null === props) return null;
        stateNode = props[registrationName];
        a: switch (registrationName) {
          case "onClick":
          case "onClickCapture":
          case "onDoubleClick":
          case "onDoubleClickCapture":
          case "onMouseDown":
          case "onMouseDownCapture":
          case "onMouseMove":
          case "onMouseMoveCapture":
          case "onMouseUp":
          case "onMouseUpCapture":
          case "onMouseEnter":
            (props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
            inst = !props;
            break a;
          default:
            inst = false;
        }
        if (inst) return null;
        if (stateNode && "function" !== typeof stateNode)
          throw Error(
            formatProdErrorMessage(231, registrationName, typeof stateNode)
          );
        return stateNode;
      }
      var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
      var passiveBrowserEventsSupported = false;
      if (canUseDOM)
        try {
          options = {};
          Object.defineProperty(options, "passive", {
            get: function() {
              passiveBrowserEventsSupported = true;
            }
          });
          window.addEventListener("test", options, options);
          window.removeEventListener("test", options, options);
        } catch (e) {
          passiveBrowserEventsSupported = false;
        }
      var options;
      var root = null;
      var startText = null;
      var fallbackText = null;
      function getData() {
        if (fallbackText) return fallbackText;
        var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
        for (start = 0; start < startLength && startValue[start] === endValue[start]; start++) ;
        var minEnd = startLength - start;
        for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++) ;
        return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
      }
      function getEventCharCode(nativeEvent) {
        var keyCode = nativeEvent.keyCode;
        "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
        10 === nativeEvent && (nativeEvent = 13);
        return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
      }
      function functionThatReturnsTrue() {
        return true;
      }
      function functionThatReturnsFalse() {
        return false;
      }
      function createSyntheticEvent(Interface) {
        function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
          this._reactName = reactName;
          this._targetInst = targetInst;
          this.type = reactEventType;
          this.nativeEvent = nativeEvent;
          this.target = nativeEventTarget;
          this.currentTarget = null;
          for (var propName in Interface)
            Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
          this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : false === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
          this.isPropagationStopped = functionThatReturnsFalse;
          return this;
        }
        assign(SyntheticBaseEvent.prototype, {
          preventDefault: function() {
            this.defaultPrevented = true;
            var event = this.nativeEvent;
            event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
          },
          stopPropagation: function() {
            var event = this.nativeEvent;
            event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
          },
          persist: function() {
          },
          isPersistent: functionThatReturnsTrue
        });
        return SyntheticBaseEvent;
      }
      var EventInterface = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function(event) {
          return event.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0
      };
      var SyntheticEvent = createSyntheticEvent(EventInterface);
      var UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 });
      var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
      var lastMovementX;
      var lastMovementY;
      var lastMouseEvent;
      var MouseEventInterface = assign({}, UIEventInterface, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: getEventModifierState,
        button: 0,
        buttons: 0,
        relatedTarget: function(event) {
          return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
        },
        movementX: function(event) {
          if ("movementX" in event) return event.movementX;
          event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
          return lastMovementX;
        },
        movementY: function(event) {
          return "movementY" in event ? event.movementY : lastMovementY;
        }
      });
      var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
      var DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 });
      var SyntheticDragEvent = createSyntheticEvent(DragEventInterface);
      var FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 });
      var SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface);
      var AnimationEventInterface = assign({}, EventInterface, {
        animationName: 0,
        elapsedTime: 0,
        pseudoElement: 0
      });
      var SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface);
      var ClipboardEventInterface = assign({}, EventInterface, {
        clipboardData: function(event) {
          return "clipboardData" in event ? event.clipboardData : window.clipboardData;
        }
      });
      var SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface);
      var CompositionEventInterface = assign({}, EventInterface, { data: 0 });
      var SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface);
      var normalizeKey = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
      };
      var translateToKey = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
      };
      var modifierKeyToProp = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey"
      };
      function modifierStateGetter(keyArg) {
        var nativeEvent = this.nativeEvent;
        return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
      }
      function getEventModifierState() {
        return modifierStateGetter;
      }
      var KeyboardEventInterface = assign({}, UIEventInterface, {
        key: function(nativeEvent) {
          if (nativeEvent.key) {
            var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
            if ("Unidentified" !== key) return key;
          }
          return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: getEventModifierState,
        charCode: function(event) {
          return "keypress" === event.type ? getEventCharCode(event) : 0;
        },
        keyCode: function(event) {
          return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
        },
        which: function(event) {
          return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
        }
      });
      var SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
      var PointerEventInterface = assign({}, MouseEventInterface, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0
      });
      var SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);
      var SubmitEventInterface = assign({}, EventInterface, { submitter: 0 });
      var SyntheticSubmitEvent = createSyntheticEvent(SubmitEventInterface);
      var TouchEventInterface = assign({}, UIEventInterface, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: getEventModifierState
      });
      var SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface);
      var TransitionEventInterface = assign({}, EventInterface, {
        propertyName: 0,
        elapsedTime: 0,
        pseudoElement: 0
      });
      var SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface);
      var WheelEventInterface = assign({}, MouseEventInterface, {
        deltaX: function(event) {
          return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
        },
        deltaY: function(event) {
          return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
        },
        deltaZ: 0,
        deltaMode: 0
      });
      var SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface);
      var ToggleEventInterface = assign({}, EventInterface, {
        newState: 0,
        oldState: 0,
        source: 0
      });
      var SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface);
      var END_KEYCODES = [9, 13, 27, 32];
      var canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
      var documentMode = null;
      canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
      var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
      var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode);
      var SPACEBAR_CHAR = String.fromCharCode(32);
      var hasSpaceKeypress = false;
      function isFallbackCompositionEnd(domEventName, nativeEvent) {
        switch (domEventName) {
          case "keyup":
            return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
          case "keydown":
            return 229 !== nativeEvent.keyCode;
          case "keypress":
          case "mousedown":
          case "focusout":
            return true;
          default:
            return false;
        }
      }
      function getDataFromCustomEvent(nativeEvent) {
        nativeEvent = nativeEvent.detail;
        return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
      }
      var isComposing = false;
      function getNativeBeforeInputChars(domEventName, nativeEvent) {
        switch (domEventName) {
          case "compositionend":
            return getDataFromCustomEvent(nativeEvent);
          case "keypress":
            if (32 !== nativeEvent.which) return null;
            hasSpaceKeypress = true;
            return SPACEBAR_CHAR;
          case "textInput":
            return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
          default:
            return null;
        }
      }
      function getFallbackBeforeInputChars(domEventName, nativeEvent) {
        if (isComposing)
          return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = false, domEventName) : null;
        switch (domEventName) {
          case "paste":
            return null;
          case "keypress":
            if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
              if (nativeEvent.char && 1 < nativeEvent.char.length)
                return nativeEvent.char;
              if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
            }
            return null;
          case "compositionend":
            return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
          default:
            return null;
        }
      }
      var supportedInputTypes = {
        color: true,
        date: true,
        datetime: true,
        "datetime-local": true,
        email: true,
        month: true,
        number: true,
        password: true,
        range: true,
        search: true,
        tel: true,
        text: true,
        time: true,
        url: true,
        week: true
      };
      function isTextInputElement(elem) {
        var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
        return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? true : false;
      }
      function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
        restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
        inst = accumulateTwoPhaseListeners(inst, "onChange");
        0 < inst.length && (nativeEvent = new SyntheticEvent(
          "onChange",
          "change",
          null,
          nativeEvent,
          target
        ), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
      }
      var activeElement$1 = null;
      var activeElementInst$1 = null;
      function runEventInBatch(dispatchQueue) {
        processDispatchQueue(dispatchQueue, 0);
      }
      function getInstIfValueChanged(targetInst) {
        var targetNode = getNodeFromInstance(targetInst);
        if (updateValueIfChanged(targetNode)) return targetInst;
      }
      function getTargetInstForChangeEvent(domEventName, targetInst) {
        if ("change" === domEventName) return targetInst;
      }
      var isInputEventSupported = false;
      if (canUseDOM) {
        if (canUseDOM) {
          isSupported$jscomp$inline_474 = "oninput" in document;
          if (!isSupported$jscomp$inline_474) {
            element$jscomp$inline_475 = document.createElement("div");
            element$jscomp$inline_475.setAttribute("oninput", "return;");
            isSupported$jscomp$inline_474 = "function" === typeof element$jscomp$inline_475.oninput;
          }
          JSCompiler_inline_result$jscomp$318 = isSupported$jscomp$inline_474;
        } else JSCompiler_inline_result$jscomp$318 = false;
        isInputEventSupported = JSCompiler_inline_result$jscomp$318 && (!document.documentMode || 9 < document.documentMode);
      }
      var JSCompiler_inline_result$jscomp$318;
      var isSupported$jscomp$inline_474;
      var element$jscomp$inline_475;
      function stopWatchingForValueChange() {
        activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
      }
      function handlePropertyChange(nativeEvent) {
        if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
          var dispatchQueue = [];
          createAndAccumulateChangeEvent(
            dispatchQueue,
            activeElementInst$1,
            nativeEvent,
            getEventTarget(nativeEvent)
          );
          batchedUpdates$1(runEventInBatch, dispatchQueue);
        }
      }
      function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
        "focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
      }
      function getTargetInstForInputEventPolyfill(domEventName) {
        if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName)
          return getInstIfValueChanged(activeElementInst$1);
      }
      function getTargetInstForClickEvent(domEventName, targetInst) {
        if ("click" === domEventName) return getInstIfValueChanged(targetInst);
      }
      function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
        if ("input" === domEventName || "change" === domEventName)
          return getInstIfValueChanged(targetInst);
      }
      function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
      }
      var objectIs = "function" === typeof Object.is ? Object.is : is;
      function shallowEqual(objA, objB) {
        if (objectIs(objA, objB)) return true;
        if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB)
          return false;
        var keysA = Object.keys(objA), keysB = Object.keys(objB);
        if (keysA.length !== keysB.length) return false;
        for (keysB = 0; keysB < keysA.length; keysB++) {
          var currentKey = keysA[keysB];
          if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
            return false;
        }
        return true;
      }
      function getActiveElement(doc) {
        doc = doc || ("undefined" !== typeof document ? document : void 0);
        if ("undefined" === typeof doc) return null;
        try {
          return doc.activeElement || doc.body;
        } catch (e$20) {
          return doc.body;
        }
      }
      function getLeafNode(node) {
        for (; node && node.firstChild; ) node = node.firstChild;
        return node;
      }
      function getNodeForCharacterOffset(root2, offset) {
        var node = getLeafNode(root2);
        root2 = 0;
        for (var nodeEnd; node; ) {
          if (3 === node.nodeType) {
            nodeEnd = root2 + node.textContent.length;
            if (root2 <= offset && nodeEnd >= offset)
              return { node, offset: offset - root2 };
            root2 = nodeEnd;
          }
          a: {
            for (; node; ) {
              if (node.nextSibling) {
                node = node.nextSibling;
                break a;
              }
              node = node.parentNode;
            }
            node = void 0;
          }
          node = getLeafNode(node);
        }
      }
      function containsNode(outerNode, innerNode) {
        return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && 3 === outerNode.nodeType ? false : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
      }
      function getActiveElementDeep(containerInfo) {
        containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
        for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement; ) {
          try {
            var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
          } catch (err) {
            JSCompiler_inline_result = false;
          }
          if (JSCompiler_inline_result) containerInfo = element.contentWindow;
          else break;
          element = getActiveElement(containerInfo.document);
        }
        return element;
      }
      function hasSelectionCapabilities(elem) {
        var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
        return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
      }
      var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode;
      var activeElement = null;
      var activeElementInst = null;
      var lastSelection = null;
      var mouseDown = false;
      function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
        var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
        mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
          anchorNode: doc.anchorNode,
          anchorOffset: doc.anchorOffset,
          focusNode: doc.focusNode,
          focusOffset: doc.focusOffset
        }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent(
          "onSelect",
          "select",
          null,
          nativeEvent,
          nativeEventTarget
        ), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
      }
      function makePrefixMap(styleProp, eventName) {
        var prefixes = {};
        prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
        prefixes["Webkit" + styleProp] = "webkit" + eventName;
        prefixes["Moz" + styleProp] = "moz" + eventName;
        return prefixes;
      }
      var vendorPrefixes = {
        animationend: makePrefixMap("Animation", "AnimationEnd"),
        animationiteration: makePrefixMap("Animation", "AnimationIteration"),
        animationstart: makePrefixMap("Animation", "AnimationStart"),
        transitionrun: makePrefixMap("Transition", "TransitionRun"),
        transitionstart: makePrefixMap("Transition", "TransitionStart"),
        transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
        transitionend: makePrefixMap("Transition", "TransitionEnd")
      };
      var prefixedEventNames = {};
      var style = {};
      canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
      function getVendorPrefixedEventName(eventName) {
        if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
        if (!vendorPrefixes[eventName]) return eventName;
        var prefixMap = vendorPrefixes[eventName], styleProp;
        for (styleProp in prefixMap)
          if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
            return prefixedEventNames[eventName] = prefixMap[styleProp];
        return eventName;
      }
      var ANIMATION_END = getVendorPrefixedEventName("animationend");
      var ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
      var ANIMATION_START = getVendorPrefixedEventName("animationstart");
      var TRANSITION_RUN = getVendorPrefixedEventName("transitionrun");
      var TRANSITION_START = getVendorPrefixedEventName("transitionstart");
      var TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel");
      var TRANSITION_END = getVendorPrefixedEventName("transitionend");
      var topLevelEventsToReactNames = /* @__PURE__ */ new Map();
      var simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " "
      );
      simpleEventPluginEvents.push("scrollEnd");
      function registerSimpleEvent(domEventName, reactName) {
        topLevelEventsToReactNames.set(domEventName, reactName);
        registerTwoPhaseEvent(reactName, [domEventName]);
      }
      var globalClientIdCounter$1 = 0;
      function getViewTransitionName(props, instance) {
        if (null != props.name && "auto" !== props.name) return props.name;
        if (null !== instance.autoName) return instance.autoName;
        props = pendingEffectsRoot.identifierPrefix;
        var globalClientId = globalClientIdCounter$1++;
        props = "_" + props + "t_" + globalClientId.toString(32) + "_";
        return instance.autoName = props;
      }
      function getClassNameByType(classByType) {
        if (null == classByType || "string" === typeof classByType)
          return classByType;
        var className = null, activeTypes = pendingTransitionTypes;
        if (null !== activeTypes)
          for (var i = 0; i < activeTypes.length; i++) {
            var match = classByType[activeTypes[i]];
            if (null != match) {
              if ("none" === match) return "none";
              className = null == className ? match : className + (" " + match);
            }
          }
        return null == className ? classByType.default : className;
      }
      function getViewTransitionClassName(defaultClass, eventClass) {
        defaultClass = getClassNameByType(defaultClass);
        eventClass = getClassNameByType(eventClass);
        return null == eventClass ? "auto" === defaultClass ? null : defaultClass : "auto" === eventClass ? null : eventClass;
      }
      var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      };
      var concurrentQueues = [];
      var concurrentQueuesIndex = 0;
      var concurrentlyUpdatedLanes = 0;
      function finishQueueingConcurrentUpdates() {
        for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex; ) {
          var fiber = concurrentQueues[i];
          concurrentQueues[i++] = null;
          var queue = concurrentQueues[i];
          concurrentQueues[i++] = null;
          var update = concurrentQueues[i];
          concurrentQueues[i++] = null;
          var lane = concurrentQueues[i];
          concurrentQueues[i++] = null;
          if (null !== queue && null !== update) {
            var pending = queue.pending;
            null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
            queue.pending = update;
          }
          0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
        }
      }
      function enqueueUpdate$1(fiber, queue, update, lane) {
        concurrentQueues[concurrentQueuesIndex++] = fiber;
        concurrentQueues[concurrentQueuesIndex++] = queue;
        concurrentQueues[concurrentQueuesIndex++] = update;
        concurrentQueues[concurrentQueuesIndex++] = lane;
        concurrentlyUpdatedLanes |= lane;
        fiber.lanes |= lane;
        fiber = fiber.alternate;
        null !== fiber && (fiber.lanes |= lane);
      }
      function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
        enqueueUpdate$1(fiber, queue, update, lane);
        return getRootForUpdatedFiber(fiber);
      }
      function enqueueConcurrentRenderForLane(fiber, lane) {
        enqueueUpdate$1(fiber, null, null, lane);
        return getRootForUpdatedFiber(fiber);
      }
      function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
        sourceFiber.lanes |= lane;
        var alternate = sourceFiber.alternate;
        null !== alternate && (alternate.lanes |= lane);
        for (var isHidden = false, parent = sourceFiber.return; null !== parent; )
          parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
        return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
      }
      function getRootForUpdatedFiber(sourceFiber) {
        if (50 < nestedUpdateCount)
          throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
        for (var parent = sourceFiber.return; null !== parent; )
          sourceFiber = parent, parent = sourceFiber.return;
        return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
      }
      var emptyContextObject = {};
      function FiberNode(tag, pendingProps, key, mode) {
        this.tag = tag;
        this.key = key;
        this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
        this.index = 0;
        this.refCleanup = this.ref = null;
        this.pendingProps = pendingProps;
        this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
        this.mode = mode;
        this.subtreeFlags = this.flags = 0;
        this.deletions = null;
        this.childLanes = this.lanes = 0;
        this.alternate = null;
      }
      function createFiberImplClass(tag, pendingProps, key, mode) {
        return new FiberNode(tag, pendingProps, key, mode);
      }
      function shouldConstruct(Component) {
        Component = Component.prototype;
        return !(!Component || !Component.isReactComponent);
      }
      function createWorkInProgress(current, pendingProps) {
        var workInProgress2 = current.alternate;
        null === workInProgress2 ? (workInProgress2 = createFiberImplClass(
          current.tag,
          pendingProps,
          current.key,
          current.mode
        ), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
        workInProgress2.flags = current.flags & 1206910976;
        workInProgress2.childLanes = current.childLanes;
        workInProgress2.lanes = current.lanes;
        workInProgress2.child = current.child;
        workInProgress2.memoizedProps = current.memoizedProps;
        workInProgress2.memoizedState = current.memoizedState;
        workInProgress2.updateQueue = current.updateQueue;
        pendingProps = current.dependencies;
        workInProgress2.dependencies = null === pendingProps ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
        workInProgress2.sibling = current.sibling;
        workInProgress2.index = current.index;
        workInProgress2.ref = current.ref;
        workInProgress2.refCleanup = current.refCleanup;
        return workInProgress2;
      }
      function resetWorkInProgress(workInProgress2, renderLanes2) {
        workInProgress2.flags &= 1206910978;
        var current = workInProgress2.alternate;
        null === current ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies = null === renderLanes2 ? null : {
          lanes: renderLanes2.lanes,
          firstContext: renderLanes2.firstContext
        });
        return workInProgress2;
      }
      function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
        var fiberTag = 0;
        owner = type;
        if ("function" === typeof owner) shouldConstruct(owner) && (fiberTag = 1);
        else if ("string" === typeof owner)
          fiberTag = isHostHoistableType(
            type,
            pendingProps,
            contextStackCursor.current
          ) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
        else
          a: switch (owner) {
            case REACT_ACTIVITY_TYPE:
              return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
            case REACT_FRAGMENT_TYPE:
              return createFiberFromFragment(pendingProps.children, mode, lanes, key);
            case REACT_STRICT_MODE_TYPE:
              fiberTag = 8;
              mode |= 24;
              break;
            case REACT_PROFILER_TYPE:
              return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
            case REACT_SUSPENSE_TYPE:
              return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
            case REACT_SUSPENSE_LIST_TYPE:
              return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
            case REACT_LEGACY_HIDDEN_TYPE:
            case REACT_VIEW_TRANSITION_TYPE:
              return type = mode | 32, type = createFiberImplClass(30, pendingProps, key, type), type.elementType = REACT_VIEW_TRANSITION_TYPE, type.lanes = lanes, type.stateNode = {
                autoName: null,
                paired: null,
                clones: null,
                ref: null
              }, type;
            default:
              if ("object" === typeof owner && null !== owner)
                switch (owner.$$typeof) {
                  case REACT_CONTEXT_TYPE:
                    fiberTag = 10;
                    break a;
                  case REACT_CONSUMER_TYPE:
                    fiberTag = 9;
                    break a;
                  case REACT_FORWARD_REF_TYPE:
                    fiberTag = 11;
                    break a;
                  case REACT_MEMO_TYPE:
                    fiberTag = 14;
                    break a;
                  case REACT_LAZY_TYPE:
                    fiberTag = 16;
                    owner = null;
                    break a;
                }
              fiberTag = 29;
              pendingProps = Error(
                formatProdErrorMessage(130, null === type ? "null" : typeof type, "")
              );
              owner = null;
          }
        key = createFiberImplClass(fiberTag, pendingProps, key, mode);
        key.elementType = type;
        key.type = owner;
        key.lanes = lanes;
        return key;
      }
      function createFiberFromFragment(elements, mode, lanes, key) {
        elements = createFiberImplClass(7, elements, key, mode);
        elements.lanes = lanes;
        return elements;
      }
      function createFiberFromText(content, mode, lanes) {
        content = createFiberImplClass(6, content, null, mode);
        content.lanes = lanes;
        return content;
      }
      function createFiberFromDehydratedFragment(dehydratedNode) {
        var fiber = createFiberImplClass(18, null, null, 0);
        fiber.stateNode = dehydratedNode;
        return fiber;
      }
      function createFiberFromPortal(portal, mode, lanes) {
        mode = createFiberImplClass(
          4,
          null !== portal.children ? portal.children : [],
          portal.key,
          mode
        );
        mode.lanes = lanes;
        mode.stateNode = {
          containerInfo: portal.containerInfo,
          pendingChildren: null,
          implementation: portal.implementation
        };
        return mode;
      }
      var CapturedStacks = /* @__PURE__ */ new WeakMap();
      function createCapturedValueAtFiber(value, source) {
        if ("object" === typeof value && null !== value) {
          var existing = CapturedStacks.get(value);
          if (void 0 !== existing) return existing;
          source = {
            value,
            source,
            stack: getStackByFiberInDevAndProd(source)
          };
          CapturedStacks.set(value, source);
          return source;
        }
        return {
          value,
          source,
          stack: getStackByFiberInDevAndProd(source)
        };
      }
      var forkStack = [];
      var forkStackIndex = 0;
      var treeForkProvider = null;
      var treeForkCount = 0;
      var idStack = [];
      var idStackIndex = 0;
      var treeContextProvider = null;
      var treeContextId = 1;
      var treeContextOverflow = "";
      function pushTreeFork(workInProgress2, totalChildren) {
        forkStack[forkStackIndex++] = treeForkCount;
        forkStack[forkStackIndex++] = treeForkProvider;
        treeForkProvider = workInProgress2;
        treeForkCount = totalChildren;
      }
      function pushTreeId(workInProgress2, totalChildren, index2) {
        idStack[idStackIndex++] = treeContextId;
        idStack[idStackIndex++] = treeContextOverflow;
        idStack[idStackIndex++] = treeContextProvider;
        treeContextProvider = workInProgress2;
        var baseIdWithLeadingBit = treeContextId;
        workInProgress2 = treeContextOverflow;
        var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
        baseIdWithLeadingBit &= ~(1 << baseLength);
        index2 += 1;
        var length = 32 - clz32(totalChildren) + baseLength;
        if (30 < length) {
          var numberOfOverflowBits = baseLength - baseLength % 5;
          length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
          baseIdWithLeadingBit >>= numberOfOverflowBits;
          baseLength -= numberOfOverflowBits;
          treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index2 << baseLength | baseIdWithLeadingBit;
          treeContextOverflow = length + workInProgress2;
        } else
          treeContextId = 1 << length | index2 << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
      }
      function pushMaterializedTreeId(workInProgress2) {
        null !== workInProgress2.return && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
      }
      function popTreeContext(workInProgress2) {
        for (; workInProgress2 === treeForkProvider; )
          treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
        for (; workInProgress2 === treeContextProvider; )
          treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
      }
      function restoreSuspendedTreeContext(workInProgress2, suspendedContext) {
        idStack[idStackIndex++] = treeContextId;
        idStack[idStackIndex++] = treeContextOverflow;
        idStack[idStackIndex++] = treeContextProvider;
        treeContextId = suspendedContext.id;
        treeContextOverflow = suspendedContext.overflow;
        treeContextProvider = workInProgress2;
      }
      var hydrationParentFiber = null;
      var nextHydratableInstance = null;
      var isHydrating = false;
      var hydrationErrors = null;
      var rootOrSingletonContext = false;
      var HydrationMismatchException = Error(formatProdErrorMessage(519));
      function throwOnHydrationMismatch(fiber) {
        var error = Error(
          formatProdErrorMessage(
            418,
            1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML",
            ""
          )
        );
        queueHydrationError(createCapturedValueAtFiber(error, fiber));
        throw HydrationMismatchException;
      }
      function prepareToHydrateHostInstance(fiber) {
        var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
        instance[internalInstanceKey] = fiber;
        instance[internalPropsKey] = props;
        switch (type) {
          case "dialog":
            listenToNonDelegatedEvent("cancel", instance);
            listenToNonDelegatedEvent("close", instance);
            break;
          case "iframe":
          case "object":
          case "embed":
            listenToNonDelegatedEvent("load", instance);
            break;
          case "video":
          case "audio":
            for (type = 0; type < mediaEventTypes.length; type++)
              listenToNonDelegatedEvent(mediaEventTypes[type], instance);
            break;
          case "source":
            listenToNonDelegatedEvent("error", instance);
            break;
          case "img":
          case "image":
          case "link":
            listenToNonDelegatedEvent("error", instance);
            listenToNonDelegatedEvent("load", instance);
            break;
          case "details":
            listenToNonDelegatedEvent("toggle", instance);
            break;
          case "input":
            listenToNonDelegatedEvent("invalid", instance);
            initInput(
              instance,
              props.value,
              props.defaultValue,
              props.checked,
              props.defaultChecked,
              props.type,
              props.name,
              true
            );
            break;
          case "select":
            listenToNonDelegatedEvent("invalid", instance);
            break;
          case "textarea":
            listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
        }
        type = props.children;
        "string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || true === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = true) : instance = false;
        instance || throwOnHydrationMismatch(fiber, true);
      }
      function popToNextHostParent(fiber) {
        for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
          switch (hydrationParentFiber.tag) {
            case 5:
            case 31:
            case 13:
              rootOrSingletonContext = false;
              return;
            case 27:
            case 3:
              rootOrSingletonContext = true;
              return;
            default:
              hydrationParentFiber = hydrationParentFiber.return;
          }
      }
      function popHydrationState(fiber) {
        if (fiber !== hydrationParentFiber) return false;
        if (!isHydrating) return popToNextHostParent(fiber), isHydrating = true, false;
        var tag = fiber.tag, JSCompiler_temp;
        if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
          if (JSCompiler_temp = 5 === tag)
            JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
          JSCompiler_temp = !JSCompiler_temp;
        }
        JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
        popToNextHostParent(fiber);
        if (13 === tag) {
          fiber = fiber.memoizedState;
          fiber = null !== fiber ? fiber.dehydrated : null;
          if (!fiber) throw Error(formatProdErrorMessage(317));
          nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
        } else if (31 === tag) {
          fiber = fiber.memoizedState;
          fiber = null !== fiber ? fiber.dehydrated : null;
          if (!fiber) throw Error(formatProdErrorMessage(317));
          nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
        } else
          27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
        return true;
      }
      function resetHydrationState() {
        nextHydratableInstance = hydrationParentFiber = null;
        isHydrating = false;
      }
      function upgradeHydrationErrorsToRecoverable() {
        var queuedErrors = hydrationErrors;
        null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(
          workInProgressRootRecoverableErrors,
          queuedErrors
        ), hydrationErrors = null);
        return queuedErrors;
      }
      function queueHydrationError(error) {
        null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
      }
      var valueCursor = createCursor(null);
      var currentlyRenderingFiber$1 = null;
      var lastContextDependency = null;
      function pushProvider(providerFiber, context, nextValue) {
        push(valueCursor, context._currentValue);
        context._currentValue = nextValue;
      }
      function popProvider(context) {
        context._currentValue = valueCursor.current;
        pop(valueCursor);
      }
      function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
        for (; null !== parent; ) {
          var alternate = parent.alternate;
          (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, null !== alternate && (alternate.childLanes |= renderLanes2)) : null !== alternate && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
          if (parent === propagationRoot) break;
          parent = parent.return;
        }
      }
      function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
        var fiber = workInProgress2.child;
        null !== fiber && (fiber.return = workInProgress2);
        for (; null !== fiber; ) {
          var list = fiber.dependencies;
          if (null !== list) {
            var nextFiber = fiber.child;
            list = list.firstContext;
            a: for (; null !== list; ) {
              var dependency = list;
              list = fiber;
              for (var i = 0; i < contexts.length; i++)
                if (dependency.context === contexts[i]) {
                  list.lanes |= renderLanes2;
                  dependency = list.alternate;
                  null !== dependency && (dependency.lanes |= renderLanes2);
                  scheduleContextWorkOnParentPath(
                    list.return,
                    renderLanes2,
                    workInProgress2
                  );
                  forcePropagateEntireTree || (nextFiber = null);
                  break a;
                }
              list = dependency.next;
            }
          } else if (18 === fiber.tag) {
            nextFiber = fiber.return;
            if (null === nextFiber) throw Error(formatProdErrorMessage(341));
            nextFiber.lanes |= renderLanes2;
            list = nextFiber.alternate;
            null !== list && (list.lanes |= renderLanes2);
            scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
            nextFiber = null;
          } else
            13 === fiber.tag && null !== fiber.memoizedState && null === fiber.memoizedState.dehydrated ? (fiber.lanes |= renderLanes2, nextFiber = fiber.alternate, null !== nextFiber && (nextFiber.lanes |= renderLanes2), scheduleContextWorkOnParentPath(
              fiber.return,
              renderLanes2,
              workInProgress2
            ), nextFiber = fiber.child, nextFiber = null !== nextFiber ? nextFiber.sibling : null) : nextFiber = fiber.child;
          if (null !== nextFiber) nextFiber.return = fiber;
          else
            for (nextFiber = fiber; null !== nextFiber; ) {
              if (nextFiber === workInProgress2) {
                nextFiber = null;
                break;
              }
              fiber = nextFiber.sibling;
              if (null !== fiber) {
                fiber.return = nextFiber.return;
                nextFiber = fiber;
                break;
              }
              nextFiber = nextFiber.return;
            }
          fiber = nextFiber;
        }
      }
      function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
        current = null;
        for (var parent = workInProgress2, isInsidePropagationBailout = false; null !== parent; ) {
          if (!isInsidePropagationBailout) {
            if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = true;
            else if (0 !== (parent.flags & 262144)) break;
          }
          if (10 === parent.tag) {
            var currentParent = parent.alternate;
            if (null === currentParent) throw Error(formatProdErrorMessage(387));
            currentParent = currentParent.memoizedProps;
            if (null !== currentParent) {
              var context = parent.type;
              objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
            }
          } else if (parent === hostTransitionProviderCursor.current) {
            currentParent = parent.alternate;
            if (null === currentParent) throw Error(formatProdErrorMessage(387));
            currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
          }
          parent = parent.return;
        }
        null !== current && propagateContextChanges(
          workInProgress2,
          current,
          renderLanes2,
          forcePropagateEntireTree
        );
        workInProgress2.flags |= 262144;
        return null !== current;
      }
      function checkIfContextChanged(currentDependencies) {
        for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies; ) {
          if (!objectIs(
            currentDependencies.context._currentValue,
            currentDependencies.memoizedValue
          ))
            return true;
          currentDependencies = currentDependencies.next;
        }
        return false;
      }
      function prepareToReadContext(workInProgress2) {
        currentlyRenderingFiber$1 = workInProgress2;
        lastContextDependency = null;
        workInProgress2 = workInProgress2.dependencies;
        null !== workInProgress2 && (workInProgress2.firstContext = null);
      }
      function readContext(context) {
        return readContextForConsumer(currentlyRenderingFiber$1, context);
      }
      function readContextDuringReconciliation(consumer, context) {
        null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
        return readContextForConsumer(consumer, context);
      }
      function readContextForConsumer(consumer, context) {
        var value = context._currentValue;
        context = { context, memoizedValue: value, next: null };
        if (null === lastContextDependency) {
          if (null === consumer) throw Error(formatProdErrorMessage(308));
          lastContextDependency = context;
          consumer.dependencies = { lanes: 0, firstContext: context };
          consumer.flags |= 524288;
        } else lastContextDependency = lastContextDependency.next = context;
        return value;
      }
      var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
        var listeners = [], signal = this.signal = {
          aborted: false,
          addEventListener: function(type, listener) {
            listeners.push(listener);
          }
        };
        this.abort = function() {
          signal.aborted = true;
          listeners.forEach(function(listener) {
            return listener();
          });
        };
      };
      var scheduleCallback$2 = Scheduler.unstable_scheduleCallback;
      var NormalPriority = Scheduler.unstable_NormalPriority;
      var CacheContext = {
        $$typeof: REACT_CONTEXT_TYPE,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0
      };
      function createCache() {
        return {
          controller: new AbortControllerLocal(),
          data: /* @__PURE__ */ new Map(),
          refCount: 0
        };
      }
      function releaseCache(cache) {
        cache.refCount--;
        0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
          cache.controller.abort();
        });
      }
      function queueTransitionTypes(root2, transitionTypes) {
        if (0 !== (root2.pendingLanes & 4194048)) {
          var queued = root2.transitionTypes;
          null === queued && (queued = root2.transitionTypes = []);
          for (root2 = 0; root2 < transitionTypes.length; root2++) {
            var transitionType = transitionTypes[root2];
            -1 === queued.indexOf(transitionType) && queued.push(transitionType);
          }
        }
      }
      var entangledTransitionTypes = null;
      function claimQueuedTransitionTypes(root2) {
        var claimed = root2.transitionTypes;
        root2.transitionTypes = null;
        return claimed;
      }
      var currentEntangledListeners = null;
      var currentEntangledPendingCount = 0;
      var currentEntangledLane = 0;
      var currentEntangledActionThenable = null;
      function entangleAsyncAction(transition, thenable) {
        if (null === currentEntangledListeners) {
          var entangledListeners = currentEntangledListeners = [];
          currentEntangledPendingCount = 0;
          currentEntangledLane = requestTransitionLane();
          currentEntangledActionThenable = {
            status: "pending",
            value: void 0,
            then: function(resolve) {
              entangledListeners.push(resolve);
            }
          };
        }
        currentEntangledPendingCount++;
        thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
        return thenable;
      }
      function pingEngtangledActionScope() {
        if (0 === --currentEntangledPendingCount && (entangledTransitionTypes = null, null !== currentEntangledListeners)) {
          null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
          var listeners = currentEntangledListeners;
          currentEntangledListeners = null;
          currentEntangledLane = 0;
          currentEntangledActionThenable = null;
          for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
        }
      }
      function chainThenableValue(thenable, result) {
        var listeners = [], thenableWithOverride = {
          status: "pending",
          value: null,
          reason: null,
          then: function(resolve) {
            listeners.push(resolve);
          }
        };
        thenable.then(
          function() {
            thenableWithOverride.status = "fulfilled";
            thenableWithOverride.value = result;
            for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
          },
          function(error) {
            thenableWithOverride.status = "rejected";
            thenableWithOverride.reason = error;
            for (error = 0; error < listeners.length; error++)
              (0, listeners[error])(void 0);
          }
        );
        return thenableWithOverride;
      }
      var prevOnStartTransitionFinish = ReactSharedInternals.S;
      ReactSharedInternals.S = function(transition, returnValue) {
        globalMostRecentTransitionTime = now();
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
        if (null !== entangledTransitionTypes)
          for (var root$28 = firstScheduledRoot; null !== root$28; )
            queueTransitionTypes(root$28, entangledTransitionTypes), root$28 = root$28.next;
        root$28 = transition.types;
        if (null !== root$28) {
          for (var root$29 = firstScheduledRoot; null !== root$29; )
            queueTransitionTypes(root$29, root$28), root$29 = root$29.next;
          if (0 !== currentEntangledLane) {
            root$29 = entangledTransitionTypes;
            null === root$29 && (root$29 = entangledTransitionTypes = []);
            for (var i = 0; i < root$28.length; i++) {
              var transitionType = root$28[i];
              -1 === root$29.indexOf(transitionType) && root$29.push(transitionType);
            }
          }
        }
        null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
      };
      var resumedCache = createCursor(null);
      function peekCacheFromPool() {
        var cacheResumedFromPreviousRender = resumedCache.current;
        return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
      }
      function pushTransition(offscreenWorkInProgress, prevCachePool) {
        null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
      }
      function getSuspendedCache() {
        var cacheFromPool = peekCacheFromPool();
        return null === cacheFromPool ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
      }
      var SuspenseException = Error(formatProdErrorMessage(460));
      var SuspenseyCommitException = Error(formatProdErrorMessage(474));
      var SuspenseActionException = Error(formatProdErrorMessage(542));
      var noopSuspenseyCommitThenable = { then: function() {
      } };
      function isThenableResolved(thenable) {
        thenable = thenable.status;
        return "fulfilled" === thenable || "rejected" === thenable;
      }
      function trackUsedThenable(thenableState2, thenable, index2) {
        index2 = thenableState2[index2];
        void 0 === index2 ? thenableState2.push(thenable) : index2 !== thenable && (thenable.then(noop$1, noop$1), thenable = index2);
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            thenableState2 = thenable.reason;
            checkIfUseWrappedInAsyncCatch(thenableState2);
            if (void 0 === thenableState2 && !("reason" in thenable))
              throw Error(formatProdErrorMessage(600));
            throw thenableState2;
          default:
            if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
            else {
              thenableState2 = workInProgressRoot;
              if (null !== thenableState2 && 100 < thenableState2.shellSuspendCounter)
                throw Error(formatProdErrorMessage(482));
              thenableState2 = thenable;
              thenableState2.status = "pending";
              thenableState2.then(
                function(fulfilledValue) {
                  if ("pending" === thenable.status) {
                    var fulfilledThenable = thenable;
                    fulfilledThenable.status = "fulfilled";
                    fulfilledThenable.value = fulfilledValue;
                  }
                },
                function(error) {
                  if ("pending" === thenable.status) {
                    var rejectedThenable = thenable;
                    rejectedThenable.status = "rejected";
                    rejectedThenable.reason = error;
                  }
                }
              );
            }
            switch (thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
            }
            suspendedThenable = thenable;
            throw SuspenseException;
        }
      }
      function resolveLazy(lazyType) {
        try {
          var init = lazyType._init;
          return init(lazyType._payload);
        } catch (x) {
          if (null !== x && "object" === typeof x && "function" === typeof x.then)
            throw suspendedThenable = x, SuspenseException;
          throw x;
        }
      }
      var suspendedThenable = null;
      function getSuspendedThenable() {
        if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
        var thenable = suspendedThenable;
        suspendedThenable = null;
        return thenable;
      }
      function checkIfUseWrappedInAsyncCatch(rejectedReason) {
        if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
          throw Error(formatProdErrorMessage(483));
      }
      var thenableState$1 = null;
      var thenableIndexCounter$1 = 0;
      function unwrapThenable(thenable) {
        var index2 = thenableIndexCounter$1;
        thenableIndexCounter$1 += 1;
        null === thenableState$1 && (thenableState$1 = []);
        return trackUsedThenable(thenableState$1, thenable, index2);
      }
      function coerceRef(workInProgress2, element) {
        element = element.props.ref;
        workInProgress2.ref = void 0 !== element ? element : null;
      }
      function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
        if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
          throw Error(formatProdErrorMessage(525));
        returnFiber = Object.prototype.toString.call(newChild);
        throw Error(
          formatProdErrorMessage(
            31,
            "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber
          )
        );
      }
      function createChildReconciler(shouldTrackSideEffects) {
        function deleteChild(returnFiber, childToDelete) {
          if (shouldTrackSideEffects) {
            var deletions = returnFiber.deletions;
            null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
          }
        }
        function deleteRemainingChildren(returnFiber, currentFirstChild) {
          if (!shouldTrackSideEffects) return null;
          for (; null !== currentFirstChild; )
            deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
          return null;
        }
        function mapRemainingChildren(currentFirstChild) {
          for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild; )
            null === currentFirstChild.key ? existingChildren.set(currentFirstChild.index, currentFirstChild) : existingChildren.set(currentFirstChild.key, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
          return existingChildren;
        }
        function useFiber(fiber, pendingProps) {
          fiber = createWorkInProgress(fiber, pendingProps);
          fiber.index = 0;
          fiber.sibling = null;
          return fiber;
        }
        function placeChild(newFiber, lastPlacedIndex, newIndex) {
          newFiber.index = newIndex;
          if (!shouldTrackSideEffects)
            return newFiber.flags |= 1048576, lastPlacedIndex;
          newIndex = newFiber.alternate;
          if (null !== newIndex)
            return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 2, lastPlacedIndex) : newIndex;
          newFiber.flags |= 134217730;
          return lastPlacedIndex;
        }
        function placeSingleChild(newFiber) {
          shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 134217730);
          return newFiber;
        }
        function updateTextNode(returnFiber, current, textContent, lanes) {
          if (null === current || 6 !== current.tag)
            return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
          current = useFiber(current, textContent);
          current.return = returnFiber;
          return current;
        }
        function updateElement(returnFiber, current, element, lanes) {
          var elementType = element.type;
          if (elementType === REACT_FRAGMENT_TYPE)
            return returnFiber = updateFragment(
              returnFiber,
              current,
              element.props.children,
              lanes,
              element.key
            ), coerceRef(returnFiber, element), returnFiber;
          if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
            return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
          current = createFiberFromTypeAndProps(
            element.type,
            element.key,
            element.props,
            null,
            returnFiber.mode,
            lanes
          );
          coerceRef(current, element);
          current.return = returnFiber;
          return current;
        }
        function updatePortal(returnFiber, current, portal, lanes) {
          if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
            return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
          current = useFiber(current, portal.children || []);
          current.return = returnFiber;
          return current;
        }
        function updateFragment(returnFiber, current, fragment, lanes, key) {
          if (null === current || 7 !== current.tag)
            return current = createFiberFromFragment(
              fragment,
              returnFiber.mode,
              lanes,
              key
            ), current.return = returnFiber, current;
          current = useFiber(current, fragment);
          current.return = returnFiber;
          return current;
        }
        function createChild(returnFiber, newChild, lanes) {
          if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
            return newChild = createFiberFromText(
              "" + newChild,
              returnFiber.mode,
              lanes
            ), newChild.return = returnFiber, newChild;
          if ("object" === typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return lanes = createFiberFromTypeAndProps(
                  newChild.type,
                  newChild.key,
                  newChild.props,
                  null,
                  returnFiber.mode,
                  lanes
                ), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
              case REACT_PORTAL_TYPE:
                return newChild = createFiberFromPortal(
                  newChild,
                  returnFiber.mode,
                  lanes
                ), newChild.return = returnFiber, newChild;
              case REACT_LAZY_TYPE:
                return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
            }
            if (isArrayImpl(newChild) || getIteratorFn(newChild))
              return newChild = createFiberFromFragment(
                newChild,
                returnFiber.mode,
                lanes,
                null
              ), newChild.return = returnFiber, newChild;
            if ("function" === typeof newChild.then)
              return createChild(returnFiber, unwrapThenable(newChild), lanes);
            if (newChild.$$typeof === REACT_CONTEXT_TYPE)
              return createChild(
                returnFiber,
                readContextDuringReconciliation(returnFiber, newChild),
                lanes
              );
            throwOnInvalidObjectTypeImpl(returnFiber, newChild);
          }
          return null;
        }
        function updateSlot(returnFiber, oldFiber, newChild, lanes) {
          var key = null !== oldFiber ? oldFiber.key : null;
          if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
            return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
          if ("object" === typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
              case REACT_PORTAL_TYPE:
                return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
              case REACT_LAZY_TYPE:
                return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
            }
            if (isArrayImpl(newChild) || getIteratorFn(newChild))
              return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
            if ("function" === typeof newChild.then)
              return updateSlot(
                returnFiber,
                oldFiber,
                unwrapThenable(newChild),
                lanes
              );
            if (newChild.$$typeof === REACT_CONTEXT_TYPE)
              return updateSlot(
                returnFiber,
                oldFiber,
                readContextDuringReconciliation(returnFiber, newChild),
                lanes
              );
            throwOnInvalidObjectTypeImpl(returnFiber, newChild);
          }
          return null;
        }
        function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
          if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
            return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
          if ("object" === typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                return existingChildren = existingChildren.get(
                  null === newChild.key ? newIdx : newChild.key
                ) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
              case REACT_PORTAL_TYPE:
                return existingChildren = existingChildren.get(
                  null === newChild.key ? newIdx : newChild.key
                ) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
              case REACT_LAZY_TYPE:
                return newChild = resolveLazy(newChild), updateFromMap(
                  existingChildren,
                  returnFiber,
                  newIdx,
                  newChild,
                  lanes
                );
            }
            if (isArrayImpl(newChild) || getIteratorFn(newChild))
              return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
            if ("function" === typeof newChild.then)
              return updateFromMap(
                existingChildren,
                returnFiber,
                newIdx,
                unwrapThenable(newChild),
                lanes
              );
            if (newChild.$$typeof === REACT_CONTEXT_TYPE)
              return updateFromMap(
                existingChildren,
                returnFiber,
                newIdx,
                readContextDuringReconciliation(returnFiber, newChild),
                lanes
              );
            throwOnInvalidObjectTypeImpl(returnFiber, newChild);
          }
          return null;
        }
        function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
          for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
            oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
            var newFiber = updateSlot(
              returnFiber,
              oldFiber,
              newChildren[newIdx],
              lanes
            );
            if (null === newFiber) {
              null === oldFiber && (oldFiber = nextOldFiber);
              break;
            }
            shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
            currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
            null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
          }
          if (newIdx === newChildren.length)
            return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
          if (null === oldFiber) {
            for (; newIdx < newChildren.length; newIdx++)
              oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(
                oldFiber,
                currentFirstChild,
                newIdx
              ), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
            isHydrating && pushTreeFork(returnFiber, newIdx);
            return resultingFirstChild;
          }
          for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++)
            nextOldFiber = updateFromMap(
              oldFiber,
              returnFiber,
              newIdx,
              newChildren[newIdx],
              lanes
            ), null !== nextOldFiber && (shouldTrackSideEffects && (newFiber = nextOldFiber.alternate, null !== newFiber && oldFiber.delete(null === newFiber.key ? newIdx : newFiber.key)), currentFirstChild = placeChild(
              nextOldFiber,
              currentFirstChild,
              newIdx
            ), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
          shouldTrackSideEffects && oldFiber.forEach(function(child) {
            return deleteChild(returnFiber, child);
          });
          isHydrating && pushTreeFork(returnFiber, newIdx);
          return resultingFirstChild;
        }
        function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
          if (null == newChildren) throw Error(formatProdErrorMessage(151));
          for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
            oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
            var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
            if (null === newFiber) {
              null === oldFiber && (oldFiber = nextOldFiber);
              break;
            }
            shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
            currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
            null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
          }
          if (step.done)
            return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
          if (null === oldFiber) {
            for (; !step.done; newIdx++, step = newChildren.next())
              step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
            isHydrating && pushTreeFork(returnFiber, newIdx);
            return resultingFirstChild;
          }
          for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next())
            step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && (nextOldFiber = step.alternate, null !== nextOldFiber && oldFiber.delete(
              null === nextOldFiber.key ? newIdx : nextOldFiber.key
            )), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
          shouldTrackSideEffects && oldFiber.forEach(function(child) {
            return deleteChild(returnFiber, child);
          });
          isHydrating && pushTreeFork(returnFiber, newIdx);
          return resultingFirstChild;
        }
        function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
          "object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && void 0 === newChild.props.ref && (newChild = newChild.props.children);
          if ("object" === typeof newChild && null !== newChild) {
            switch (newChild.$$typeof) {
              case REACT_ELEMENT_TYPE:
                a: {
                  for (var key = newChild.key; null !== currentFirstChild; ) {
                    if (currentFirstChild.key === key) {
                      key = newChild.type;
                      if (key === REACT_FRAGMENT_TYPE) {
                        if (7 === currentFirstChild.tag) {
                          deleteRemainingChildren(
                            returnFiber,
                            currentFirstChild.sibling
                          );
                          lanes = useFiber(
                            currentFirstChild,
                            newChild.props.children
                          );
                          coerceRef(lanes, newChild);
                          lanes.return = returnFiber;
                          returnFiber = lanes;
                          break a;
                        }
                      } else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
                        deleteRemainingChildren(
                          returnFiber,
                          currentFirstChild.sibling
                        );
                        lanes = useFiber(currentFirstChild, newChild.props);
                        coerceRef(lanes, newChild);
                        lanes.return = returnFiber;
                        returnFiber = lanes;
                        break a;
                      }
                      deleteRemainingChildren(returnFiber, currentFirstChild);
                      break;
                    } else deleteChild(returnFiber, currentFirstChild);
                    currentFirstChild = currentFirstChild.sibling;
                  }
                  newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(
                    newChild.props.children,
                    returnFiber.mode,
                    lanes,
                    newChild.key
                  ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(
                    newChild.type,
                    newChild.key,
                    newChild.props,
                    null,
                    returnFiber.mode,
                    lanes
                  ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
                }
                return placeSingleChild(returnFiber);
              case REACT_PORTAL_TYPE:
                a: {
                  for (key = newChild.key; null !== currentFirstChild; ) {
                    if (currentFirstChild.key === key)
                      if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                        deleteRemainingChildren(
                          returnFiber,
                          currentFirstChild.sibling
                        );
                        lanes = useFiber(currentFirstChild, newChild.children || []);
                        lanes.return = returnFiber;
                        returnFiber = lanes;
                        break a;
                      } else {
                        deleteRemainingChildren(returnFiber, currentFirstChild);
                        break;
                      }
                    else deleteChild(returnFiber, currentFirstChild);
                    currentFirstChild = currentFirstChild.sibling;
                  }
                  lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
                  lanes.return = returnFiber;
                  returnFiber = lanes;
                }
                return placeSingleChild(returnFiber);
              case REACT_LAZY_TYPE:
                return newChild = resolveLazy(newChild), reconcileChildFibersImpl(
                  returnFiber,
                  currentFirstChild,
                  newChild,
                  lanes
                );
            }
            if (isArrayImpl(newChild))
              return reconcileChildrenArray(
                returnFiber,
                currentFirstChild,
                newChild,
                lanes
              );
            if (getIteratorFn(newChild)) {
              key = getIteratorFn(newChild);
              if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
              newChild = key.call(newChild);
              return reconcileChildrenIterator(
                returnFiber,
                currentFirstChild,
                newChild,
                lanes
              );
            }
            if ("function" === typeof newChild.then)
              return reconcileChildFibersImpl(
                returnFiber,
                currentFirstChild,
                unwrapThenable(newChild),
                lanes
              );
            if (newChild.$$typeof === REACT_CONTEXT_TYPE)
              return reconcileChildFibersImpl(
                returnFiber,
                currentFirstChild,
                readContextDuringReconciliation(returnFiber, newChild),
                lanes
              );
            throwOnInvalidObjectTypeImpl(returnFiber, newChild);
          }
          return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
        }
        return function(returnFiber, currentFirstChild, newChild, lanes) {
          try {
            thenableIndexCounter$1 = 0;
            var firstChildFiber = reconcileChildFibersImpl(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            );
            thenableState$1 = null;
            return firstChildFiber;
          } catch (x) {
            if (x === SuspenseException || x === SuspenseActionException) throw x;
            var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
            fiber.lanes = lanes;
            fiber.return = returnFiber;
            return fiber;
          } finally {
          }
        };
      }
      var reconcileChildFibers = createChildReconciler(true);
      var mountChildFibers = createChildReconciler(false);
      var hasForceUpdate = false;
      function initializeUpdateQueue(fiber) {
        fiber.updateQueue = {
          baseState: fiber.memoizedState,
          firstBaseUpdate: null,
          lastBaseUpdate: null,
          shared: { pending: null, lanes: 0, hiddenCallbacks: null },
          callbacks: null
        };
      }
      function cloneUpdateQueue(current, workInProgress2) {
        current = current.updateQueue;
        workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
          baseState: current.baseState,
          firstBaseUpdate: current.firstBaseUpdate,
          lastBaseUpdate: current.lastBaseUpdate,
          shared: current.shared,
          callbacks: null
        });
      }
      function createUpdate(lane) {
        return { lane, tag: 0, payload: null, callback: null, next: null };
      }
      function enqueueUpdate(fiber, update, lane) {
        var updateQueue = fiber.updateQueue;
        if (null === updateQueue) return null;
        updateQueue = updateQueue.shared;
        if (0 !== (executionContext & 2)) {
          var pending = updateQueue.pending;
          null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
          updateQueue.pending = update;
          update = getRootForUpdatedFiber(fiber);
          markUpdateLaneFromFiberToRoot(fiber, null, lane);
          return update;
        }
        enqueueUpdate$1(fiber, updateQueue, update, lane);
        return getRootForUpdatedFiber(fiber);
      }
      function entangleTransitions(root2, fiber, lane) {
        fiber = fiber.updateQueue;
        if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
          var queueLanes = fiber.lanes;
          queueLanes &= root2.pendingLanes;
          lane |= queueLanes;
          fiber.lanes = lane;
          markRootEntangled(root2, lane);
        }
      }
      function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
        var queue = workInProgress2.updateQueue, current = workInProgress2.alternate;
        if (null !== current && (current = current.updateQueue, queue === current)) {
          var newFirst = null, newLast = null;
          queue = queue.firstBaseUpdate;
          if (null !== queue) {
            do {
              var clone = {
                lane: queue.lane,
                tag: queue.tag,
                payload: queue.payload,
                callback: null,
                next: null
              };
              null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
              queue = queue.next;
            } while (null !== queue);
            null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
          } else newFirst = newLast = capturedUpdate;
          queue = {
            baseState: current.baseState,
            firstBaseUpdate: newFirst,
            lastBaseUpdate: newLast,
            shared: current.shared,
            callbacks: current.callbacks
          };
          workInProgress2.updateQueue = queue;
          return;
        }
        workInProgress2 = queue.lastBaseUpdate;
        null === workInProgress2 ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
        queue.lastBaseUpdate = capturedUpdate;
      }
      var didReadFromEntangledAsyncAction = false;
      function suspendIfUpdateReadFromEntangledAsyncAction() {
        if (didReadFromEntangledAsyncAction) {
          var entangledActionThenable = currentEntangledActionThenable;
          if (null !== entangledActionThenable) throw entangledActionThenable;
        }
      }
      function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
        didReadFromEntangledAsyncAction = false;
        var queue = workInProgress$jscomp$0.updateQueue;
        hasForceUpdate = false;
        var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
        if (null !== pendingQueue) {
          queue.shared.pending = null;
          var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
          lastPendingUpdate.next = null;
          null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
          lastBaseUpdate = lastPendingUpdate;
          var current = workInProgress$jscomp$0.alternate;
          null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
        }
        if (null !== firstBaseUpdate) {
          var newState = queue.baseState;
          lastBaseUpdate = 0;
          current = firstPendingUpdate = lastPendingUpdate = null;
          pendingQueue = firstBaseUpdate;
          do {
            var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
            if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
              0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
              null !== current && (current = current.next = {
                lane: 0,
                tag: pendingQueue.tag,
                payload: pendingQueue.payload,
                callback: null,
                next: null
              });
              a: {
                var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
                updateLane = props;
                var instance = instance$jscomp$0;
                switch (update.tag) {
                  case 1:
                    workInProgress2 = update.payload;
                    if ("function" === typeof workInProgress2) {
                      newState = workInProgress2.call(instance, newState, updateLane);
                      break a;
                    }
                    newState = workInProgress2;
                    break a;
                  case 3:
                    workInProgress2.flags = workInProgress2.flags & -65537 | 128;
                  case 0:
                    workInProgress2 = update.payload;
                    updateLane = "function" === typeof workInProgress2 ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
                    if (null === updateLane || void 0 === updateLane) break a;
                    newState = assign({}, newState, updateLane);
                    break a;
                  case 2:
                    hasForceUpdate = true;
                }
              }
              updateLane = pendingQueue.callback;
              null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
            } else
              isHiddenUpdate = {
                lane: updateLane,
                tag: pendingQueue.tag,
                payload: pendingQueue.payload,
                callback: pendingQueue.callback,
                next: null
              }, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
            pendingQueue = pendingQueue.next;
            if (null === pendingQueue)
              if (pendingQueue = queue.shared.pending, null === pendingQueue)
                break;
              else
                isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
          } while (1);
          null === current && (lastPendingUpdate = newState);
          queue.baseState = lastPendingUpdate;
          queue.firstBaseUpdate = firstPendingUpdate;
          queue.lastBaseUpdate = current;
          null === firstBaseUpdate && (queue.shared.lanes = 0);
          workInProgressRootSkippedLanes |= lastBaseUpdate;
          workInProgress$jscomp$0.lanes = lastBaseUpdate;
          workInProgress$jscomp$0.memoizedState = newState;
        }
      }
      function callCallback(callback, context) {
        if ("function" !== typeof callback)
          throw Error(formatProdErrorMessage(191, callback));
        callback.call(context);
      }
      function commitCallbacks(updateQueue, context) {
        var callbacks = updateQueue.callbacks;
        if (null !== callbacks)
          for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++)
            callCallback(callbacks[updateQueue], context);
      }
      var currentTreeHiddenStackCursor = createCursor(null);
      var prevEntangledRenderLanesCursor = createCursor(0);
      function pushHiddenContext(fiber, context) {
        fiber = entangledRenderLanes;
        push(prevEntangledRenderLanesCursor, fiber);
        push(currentTreeHiddenStackCursor, context);
        entangledRenderLanes = fiber | context.baseLanes;
      }
      function reuseHiddenContextOnStack() {
        push(prevEntangledRenderLanesCursor, entangledRenderLanes);
        push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
      }
      function popHiddenContext() {
        entangledRenderLanes = prevEntangledRenderLanesCursor.current;
        pop(currentTreeHiddenStackCursor);
        pop(prevEntangledRenderLanesCursor);
      }
      var suspenseHandlerStackCursor = createCursor(null);
      var shellBoundary = null;
      function pushPrimaryTreeSuspenseHandler(handler) {
        var current = handler.alternate;
        push(suspenseStackCursor, suspenseStackCursor.current & 1);
        push(suspenseHandlerStackCursor, handler);
        null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
      }
      function pushDehydratedActivitySuspenseHandler(fiber) {
        push(suspenseStackCursor, suspenseStackCursor.current);
        push(suspenseHandlerStackCursor, fiber);
        null === shellBoundary && (shellBoundary = fiber);
      }
      function pushOffscreenSuspenseHandler(fiber) {
        22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
      }
      function reuseSuspenseHandlerOnStack() {
        push(suspenseStackCursor, suspenseStackCursor.current);
        push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
      }
      function popSuspenseHandler(fiber) {
        pop(suspenseHandlerStackCursor);
        shellBoundary === fiber && (shellBoundary = null);
        pop(suspenseStackCursor);
      }
      var suspenseStackCursor = createCursor(0);
      function pushSuspenseListContext(fiber, newContext) {
        push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
        push(suspenseStackCursor, newContext);
      }
      function popSuspenseListContext(fiber) {
        pop(suspenseStackCursor);
        pop(suspenseHandlerStackCursor);
        shellBoundary === fiber && (shellBoundary = null);
      }
      function findFirstSuspended(row) {
        for (var node = row; null !== node; ) {
          if (13 === node.tag) {
            var state = node.memoizedState;
            if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state)))
              return node;
          } else if (19 === node.tag && "independent" !== node.memoizedProps.revealOrder) {
            if (0 !== (node.flags & 128)) return node;
          } else if (null !== node.child) {
            node.child.return = node;
            node = node.child;
            continue;
          }
          if (node === row) break;
          for (; null === node.sibling; ) {
            if (null === node.return || node.return === row) return null;
            node = node.return;
          }
          node.sibling.return = node.return;
          node = node.sibling;
        }
        return null;
      }
      var renderLanes = 0;
      var currentlyRenderingFiber = null;
      var currentHook = null;
      var workInProgressHook = null;
      var didScheduleRenderPhaseUpdate = false;
      var didScheduleRenderPhaseUpdateDuringThisPass = false;
      var shouldDoubleInvokeUserFnsInHooksDEV = false;
      var localIdCounter = 0;
      var thenableIndexCounter = 0;
      var thenableState = null;
      var globalClientIdCounter = 0;
      function throwInvalidHookError() {
        throw Error(formatProdErrorMessage(321));
      }
      function areHookInputsEqual(nextDeps, prevDeps) {
        if (null === prevDeps) return false;
        for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
          if (!objectIs(nextDeps[i], prevDeps[i])) return false;
        return true;
      }
      function renderWithHooks(current, workInProgress2, Component, props, secondArg, nextRenderLanes) {
        renderLanes = nextRenderLanes;
        currentlyRenderingFiber = workInProgress2;
        workInProgress2.memoizedState = null;
        workInProgress2.updateQueue = null;
        workInProgress2.lanes = 0;
        ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
        shouldDoubleInvokeUserFnsInHooksDEV = false;
        nextRenderLanes = Component(props, secondArg);
        shouldDoubleInvokeUserFnsInHooksDEV = false;
        didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(
          workInProgress2,
          Component,
          props,
          secondArg
        ));
        finishRenderingHooks(current);
        return nextRenderLanes;
      }
      function finishRenderingHooks(current) {
        ReactSharedInternals.H = ContextOnlyDispatcher;
        var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
        renderLanes = 0;
        workInProgressHook = currentHook = currentlyRenderingFiber = null;
        didScheduleRenderPhaseUpdate = false;
        thenableIndexCounter = 0;
        thenableState = null;
        if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
        null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = true));
      }
      function renderWithHooksAgain(workInProgress2, Component, props, secondArg) {
        currentlyRenderingFiber = workInProgress2;
        var numberOfReRenders = 0;
        do {
          didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
          thenableIndexCounter = 0;
          didScheduleRenderPhaseUpdateDuringThisPass = false;
          if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
          numberOfReRenders += 1;
          workInProgressHook = currentHook = null;
          if (null != workInProgress2.updateQueue) {
            var children = workInProgress2.updateQueue;
            children.lastEffect = null;
            children.events = null;
            children.stores = null;
            null != children.memoCache && (children.memoCache.index = 0);
          }
          ReactSharedInternals.H = HooksDispatcherOnRerender;
          children = Component(props, secondArg);
        } while (didScheduleRenderPhaseUpdateDuringThisPass);
        return children;
      }
      function TransitionAwareHostComponent() {
        var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
        maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
        dispatcher = dispatcher.useState()[0];
        (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
        return maybeThenable;
      }
      function checkDidRenderIdHook() {
        var didRenderIdHook = 0 !== localIdCounter;
        localIdCounter = 0;
        return didRenderIdHook;
      }
      function bailoutHooks(current, workInProgress2, lanes) {
        workInProgress2.updateQueue = current.updateQueue;
        workInProgress2.flags &= -2053;
        current.lanes &= ~lanes;
      }
      function resetHooksOnUnwind(workInProgress2) {
        if (didScheduleRenderPhaseUpdate) {
          for (workInProgress2 = workInProgress2.memoizedState; null !== workInProgress2; ) {
            var queue = workInProgress2.queue;
            null !== queue && (queue.pending = null);
            workInProgress2 = workInProgress2.next;
          }
          didScheduleRenderPhaseUpdate = false;
        }
        renderLanes = 0;
        workInProgressHook = currentHook = currentlyRenderingFiber = null;
        didScheduleRenderPhaseUpdateDuringThisPass = false;
        thenableIndexCounter = localIdCounter = 0;
        thenableState = null;
      }
      function mountWorkInProgressHook() {
        var hook = {
          memoizedState: null,
          baseState: null,
          baseQueue: null,
          queue: null,
          next: null
        };
        null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
        return workInProgressHook;
      }
      function updateWorkInProgressHook() {
        if (null === currentHook) {
          var nextCurrentHook = currentlyRenderingFiber.alternate;
          nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
        } else nextCurrentHook = currentHook.next;
        var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
        if (null !== nextWorkInProgressHook)
          workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
        else {
          if (null === nextCurrentHook) {
            if (null === currentlyRenderingFiber.alternate)
              throw Error(formatProdErrorMessage(467));
            throw Error(formatProdErrorMessage(310));
          }
          currentHook = nextCurrentHook;
          nextCurrentHook = {
            memoizedState: currentHook.memoizedState,
            baseState: currentHook.baseState,
            baseQueue: currentHook.baseQueue,
            queue: currentHook.queue,
            next: null
          };
          null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
        }
        return workInProgressHook;
      }
      function createFunctionComponentUpdateQueue() {
        return { lastEffect: null, events: null, stores: null, memoCache: null };
      }
      function useThenable(thenable) {
        var index2 = thenableIndexCounter;
        thenableIndexCounter += 1;
        null === thenableState && (thenableState = []);
        thenable = trackUsedThenable(thenableState, thenable, index2);
        index2 = currentlyRenderingFiber;
        null === (null === workInProgressHook ? index2.memoizedState : workInProgressHook.next) && (index2 = index2.alternate, ReactSharedInternals.H = null === index2 || null === index2.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
        return thenable;
      }
      function use(usable) {
        if (null !== usable && "object" === typeof usable) {
          if ("function" === typeof usable.then) return useThenable(usable);
          if (usable.$$typeof === REACT_RECOVERABLE_TYPE) return;
          if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
        }
        throw Error(formatProdErrorMessage(438, String(usable)));
      }
      function useMemoCache(size) {
        var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
        null !== updateQueue && (memoCache = updateQueue.memoCache);
        if (null == memoCache) {
          var current = currentlyRenderingFiber.alternate;
          null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
            data: current.data.map(function(array) {
              return array.slice();
            }),
            index: 0
          })));
        }
        null == memoCache && (memoCache = { data: [], index: 0 });
        null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
        updateQueue.memoCache = memoCache;
        updateQueue = memoCache.data[memoCache.index];
        if (void 0 === updateQueue)
          for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++)
            updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
        memoCache.index++;
        return updateQueue;
      }
      function basicStateReducer(state, action) {
        return "function" === typeof action ? action(state) : action;
      }
      function updateReducer(reducer) {
        var hook = updateWorkInProgressHook();
        return updateReducerImpl(hook, currentHook, reducer);
      }
      function updateReducerImpl(hook, current, reducer) {
        var queue = hook.queue;
        if (null === queue) throw Error(formatProdErrorMessage(311));
        queue.lastRenderedReducer = reducer;
        var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
        if (null !== pendingQueue) {
          if (null !== baseQueue) {
            var baseFirst = baseQueue.next;
            baseQueue.next = pendingQueue.next;
            pendingQueue.next = baseFirst;
          }
          current.baseQueue = baseQueue = pendingQueue;
          queue.pending = null;
        }
        pendingQueue = hook.baseState;
        if (null === baseQueue) hook.memoizedState = pendingQueue;
        else {
          current = baseQueue.next;
          var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$64 = false;
          do {
            var updateLane = update.lane & -536870913;
            if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
              var revertLane = update.revertLane;
              if (0 === revertLane)
                null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
                  lane: 0,
                  revertLane: 0,
                  gesture: null,
                  action: update.action,
                  hasEagerState: update.hasEagerState,
                  eagerState: update.eagerState,
                  next: null
                }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = true);
              else if ((renderLanes & revertLane) === revertLane) {
                update = update.next;
                revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = true);
                continue;
              } else
                updateLane = {
                  lane: 0,
                  revertLane: update.revertLane,
                  gesture: null,
                  action: update.action,
                  hasEagerState: update.hasEagerState,
                  eagerState: update.eagerState,
                  next: null
                }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
              updateLane = update.action;
              shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
              pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
            } else
              revertLane = {
                lane: updateLane,
                revertLane: update.revertLane,
                gesture: update.gesture,
                action: update.action,
                hasEagerState: update.hasEagerState,
                eagerState: update.eagerState,
                next: null
              }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
            update = update.next;
          } while (null !== update && update !== current);
          null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
          if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$64 && (reducer = currentEntangledActionThenable, null !== reducer)))
            throw reducer;
          hook.memoizedState = pendingQueue;
          hook.baseState = baseFirst;
          hook.baseQueue = newBaseQueueLast;
          queue.lastRenderedState = pendingQueue;
        }
        null === baseQueue && (queue.lanes = 0);
        return [hook.memoizedState, queue.dispatch];
      }
      function rerenderReducer(reducer) {
        var hook = updateWorkInProgressHook(), queue = hook.queue;
        if (null === queue) throw Error(formatProdErrorMessage(311));
        queue.lastRenderedReducer = reducer;
        var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
        if (null !== lastRenderPhaseUpdate) {
          queue.pending = null;
          var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
          do
            newState = reducer(newState, update.action), update = update.next;
          while (update !== lastRenderPhaseUpdate);
          objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
          hook.memoizedState = newState;
          null === hook.baseQueue && (hook.baseState = newState);
          queue.lastRenderedState = newState;
        }
        return [newState, dispatch];
      }
      function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
        var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
        if (isHydrating$jscomp$0) {
          if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
          getServerSnapshot = getServerSnapshot();
        } else getServerSnapshot = getSnapshot();
        var snapshotChanged = !objectIs(
          (currentHook || hook).memoizedState,
          getServerSnapshot
        );
        snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
        hook = hook.queue;
        updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
          subscribe
        ]);
        subscribe = hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && 0 !== (workInProgressHook.memoizedState.tag & 1);
        pushSimpleEffect(
          subscribe ? 9 : 8,
          { destroy: void 0 },
          updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot),
          null
        );
        if (subscribe) {
          fiber.flags |= 2048;
          if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
          isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
        }
        return getServerSnapshot;
      }
      function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
        fiber.flags |= 16384;
        fiber = { getSnapshot, value: renderedSnapshot };
        getSnapshot = currentlyRenderingFiber.updateQueue;
        null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
      }
      function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
        inst.value = nextSnapshot;
        inst.getSnapshot = getSnapshot;
        checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
      }
      function subscribeToStore(fiber, inst, subscribe) {
        return subscribe(function() {
          checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
        });
      }
      function checkIfSnapshotChanged(inst) {
        var latestGetSnapshot = inst.getSnapshot;
        inst = inst.value;
        try {
          var nextValue = latestGetSnapshot();
          return !objectIs(inst, nextValue);
        } catch (error) {
          return true;
        }
      }
      function forceStoreRerender(fiber) {
        var root2 = enqueueConcurrentRenderForLane(fiber, 2);
        null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2);
      }
      function mountStateImpl(initialState) {
        var hook = mountWorkInProgressHook();
        if ("function" === typeof initialState) {
          var initialStateInitializer = initialState;
          initialState = initialStateInitializer();
          if (shouldDoubleInvokeUserFnsInHooksDEV) {
            setIsStrictModeForDevtools(true);
            try {
              initialStateInitializer();
            } finally {
              setIsStrictModeForDevtools(false);
            }
          }
        }
        hook.memoizedState = hook.baseState = initialState;
        hook.queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: basicStateReducer,
          lastRenderedState: initialState
        };
        return hook;
      }
      function updateOptimisticImpl(hook, current, passthrough, reducer) {
        hook.baseState = passthrough;
        return updateReducerImpl(
          hook,
          currentHook,
          "function" === typeof reducer ? reducer : basicStateReducer
        );
      }
      function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
        if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
        fiber = actionQueue.action;
        if (null !== fiber) {
          var actionNode = {
            payload,
            action: fiber,
            next: null,
            isTransition: true,
            status: "pending",
            value: null,
            reason: null,
            listeners: [],
            then: function(listener) {
              actionNode.listeners.push(listener);
            }
          };
          null !== ReactSharedInternals.T ? setPendingState(true) : actionNode.isTransition = false;
          setState(actionNode);
          setPendingState = actionQueue.pending;
          null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
        }
      }
      function runActionStateAction(actionQueue, node) {
        var action = node.action, payload = node.payload, prevState = actionQueue.state;
        if (node.isTransition) {
          var prevTransition = ReactSharedInternals.T, currentTransition = {};
          currentTransition.types = null !== prevTransition ? prevTransition.types : null;
          ReactSharedInternals.T = currentTransition;
          try {
            var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
            null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
            handleActionReturnValue(actionQueue, node, returnValue);
          } catch (error) {
            onActionError(actionQueue, node, error);
          } finally {
            null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
          }
        } else
          try {
            prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
          } catch (error$70) {
            onActionError(actionQueue, node, error$70);
          }
      }
      function handleActionReturnValue(actionQueue, node, returnValue) {
        null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(
          function(nextState) {
            onActionSuccess(actionQueue, node, nextState);
          },
          function(error) {
            return onActionError(actionQueue, node, error);
          }
        ) : onActionSuccess(actionQueue, node, returnValue);
      }
      function onActionSuccess(actionQueue, actionNode, nextState) {
        actionNode.status = "fulfilled";
        actionNode.value = nextState;
        notifyActionListeners(actionNode);
        actionQueue.state = nextState;
        actionNode = actionQueue.pending;
        null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
      }
      function onActionError(actionQueue, actionNode, error) {
        var last = actionQueue.pending;
        actionQueue.pending = null;
        if (null !== last) {
          last = last.next;
          do
            actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
          while (actionNode !== last);
        }
        actionQueue.action = null;
      }
      function notifyActionListeners(actionNode) {
        actionNode = actionNode.listeners;
        for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
      }
      function actionStateReducer(oldState, newState) {
        return newState;
      }
      function mountActionState(action, initialStateProp) {
        if (isHydrating) {
          var ssrFormState = workInProgressRoot.formState;
          if (null !== ssrFormState) {
            a: {
              var JSCompiler_inline_result = currentlyRenderingFiber;
              if (isHydrating) {
                if (nextHydratableInstance) {
                  b: {
                    var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
                    for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType; ) {
                      if (!inRootOrSingleton) {
                        JSCompiler_inline_result$jscomp$0 = null;
                        break b;
                      }
                      JSCompiler_inline_result$jscomp$0 = getNextHydratable(
                        JSCompiler_inline_result$jscomp$0.nextSibling
                      );
                      if (null === JSCompiler_inline_result$jscomp$0) {
                        JSCompiler_inline_result$jscomp$0 = null;
                        break b;
                      }
                    }
                    inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
                    JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
                  }
                  if (JSCompiler_inline_result$jscomp$0) {
                    nextHydratableInstance = getNextHydratable(
                      JSCompiler_inline_result$jscomp$0.nextSibling
                    );
                    JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
                    break a;
                  }
                }
                throwOnHydrationMismatch(JSCompiler_inline_result);
              }
              JSCompiler_inline_result = false;
            }
            JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
          }
        }
        ssrFormState = mountWorkInProgressHook();
        ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
        JSCompiler_inline_result = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: actionStateReducer,
          lastRenderedState: initialStateProp
        };
        ssrFormState.queue = JSCompiler_inline_result;
        ssrFormState = dispatchSetState.bind(
          null,
          currentlyRenderingFiber,
          JSCompiler_inline_result
        );
        JSCompiler_inline_result.dispatch = ssrFormState;
        JSCompiler_inline_result = mountStateImpl(false);
        inRootOrSingleton = dispatchOptimisticSetState.bind(
          null,
          currentlyRenderingFiber,
          false,
          JSCompiler_inline_result.queue
        );
        JSCompiler_inline_result = mountWorkInProgressHook();
        JSCompiler_inline_result$jscomp$0 = {
          state: initialStateProp,
          dispatch: null,
          action,
          pending: null
        };
        JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
        ssrFormState = dispatchActionState.bind(
          null,
          currentlyRenderingFiber,
          JSCompiler_inline_result$jscomp$0,
          inRootOrSingleton,
          ssrFormState
        );
        JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
        JSCompiler_inline_result.memoizedState = action;
        return [initialStateProp, ssrFormState, false];
      }
      function updateActionState(action) {
        var stateHook = updateWorkInProgressHook();
        return updateActionStateImpl(stateHook, currentHook, action);
      }
      function updateActionStateImpl(stateHook, currentStateHook, action) {
        currentStateHook = updateReducerImpl(
          stateHook,
          currentStateHook,
          actionStateReducer
        )[0];
        stateHook = updateReducer(basicStateReducer)[0];
        if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then)
          try {
            var state = useThenable(currentStateHook);
          } catch (x) {
            if (x === SuspenseException) throw SuspenseActionException;
            throw x;
          }
        else state = currentStateHook;
        currentStateHook = updateWorkInProgressHook();
        var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
        action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(
          9,
          { destroy: void 0 },
          actionStateActionEffect.bind(null, actionQueue, action),
          null
        ));
        return [state, dispatch, stateHook];
      }
      function actionStateActionEffect(actionQueue, action) {
        actionQueue.action = action;
      }
      function rerenderActionState(action) {
        var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
        if (null !== currentStateHook)
          return updateActionStateImpl(stateHook, currentStateHook, action);
        updateWorkInProgressHook();
        stateHook = stateHook.memoizedState;
        currentStateHook = updateWorkInProgressHook();
        var dispatch = currentStateHook.queue.dispatch;
        currentStateHook.memoizedState = action;
        return [stateHook, dispatch, false];
      }
      function pushSimpleEffect(tag, inst, create, deps) {
        tag = { tag, create, deps, inst, next: null };
        inst = currentlyRenderingFiber.updateQueue;
        null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
        create = inst.lastEffect;
        null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
        return tag;
      }
      function updateRef() {
        return updateWorkInProgressHook().memoizedState;
      }
      function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
        var hook = mountWorkInProgressHook();
        currentlyRenderingFiber.flags |= fiberFlags;
        hook.memoizedState = pushSimpleEffect(
          1 | hookFlags,
          { destroy: void 0 },
          create,
          void 0 === deps ? null : deps
        );
      }
      function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
        var hook = updateWorkInProgressHook();
        deps = void 0 === deps ? null : deps;
        var inst = hook.memoizedState.inst;
        null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(
          1 | hookFlags,
          inst,
          create,
          deps
        ));
      }
      function mountEffect(create, deps) {
        mountEffectImpl(8390656, 8, create, deps);
      }
      function updateEffect(create, deps) {
        updateEffectImpl(2048, 8, create, deps);
      }
      function useEffectEventImpl(payload) {
        currentlyRenderingFiber.flags |= 4;
        var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
        if (null === componentUpdateQueue)
          componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
        else {
          var events = componentUpdateQueue.events;
          null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
        }
      }
      function updateEvent(callback) {
        var ref = updateWorkInProgressHook().memoizedState;
        useEffectEventImpl({ ref, nextImpl: callback });
        return function() {
          if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
          return ref.impl.apply(void 0, arguments);
        };
      }
      function updateInsertionEffect(create, deps) {
        return updateEffectImpl(4, 2, create, deps);
      }
      function updateLayoutEffect(create, deps) {
        return updateEffectImpl(4, 4, create, deps);
      }
      function imperativeHandleEffect(create, ref) {
        if ("function" === typeof ref) {
          create = create();
          var refCleanup = ref(create);
          return function() {
            "function" === typeof refCleanup ? refCleanup() : ref(null);
          };
        }
        if (null !== ref && void 0 !== ref)
          return create = create(), ref.current = create, function() {
            ref.current = null;
          };
      }
      function updateImperativeHandle(ref, create, deps) {
        deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
        updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
      }
      function mountDebugValue() {
      }
      function updateCallback(callback, deps) {
        var hook = updateWorkInProgressHook();
        deps = void 0 === deps ? null : deps;
        var prevState = hook.memoizedState;
        if (null !== deps && areHookInputsEqual(deps, prevState[1]))
          return prevState[0];
        hook.memoizedState = [callback, deps];
        return callback;
      }
      function updateMemo(nextCreate, deps) {
        var hook = updateWorkInProgressHook();
        deps = void 0 === deps ? null : deps;
        var prevState = hook.memoizedState;
        if (null !== deps && areHookInputsEqual(deps, prevState[1]))
          return prevState[0];
        prevState = nextCreate();
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            nextCreate();
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
        hook.memoizedState = [prevState, deps];
        return prevState;
      }
      function mountDeferredValueImpl(hook, value, initialValue) {
        if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
          return hook.memoizedState = value;
        hook.memoizedState = initialValue;
        hook = requestDeferredLane();
        currentlyRenderingFiber.lanes |= hook;
        workInProgressRootSkippedLanes |= hook;
        return initialValue;
      }
      function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
        if (objectIs(value, prevValue)) return value;
        if (null !== currentTreeHiddenStackCursor.current)
          return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
        if (0 === (renderLanes & 106) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
          return didReceiveUpdate = true, hook.memoizedState = value;
        hook = requestDeferredLane();
        currentlyRenderingFiber.lanes |= hook;
        workInProgressRootSkippedLanes |= hook;
        return prevValue;
      }
      function startTransition(fiber, queue, pendingState, finishedState, callback) {
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition.types = null !== prevTransition ? prevTransition.types : null;
        ReactSharedInternals.T = currentTransition;
        dispatchOptimisticSetState(fiber, false, queue, pendingState);
        try {
          var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) {
            var thenableForFinishedState = chainThenableValue(
              returnValue,
              finishedState
            );
            dispatchSetStateInternal(
              fiber,
              queue,
              thenableForFinishedState,
              requestUpdateLane(fiber)
            );
          } else
            dispatchSetStateInternal(
              fiber,
              queue,
              finishedState,
              requestUpdateLane(fiber)
            );
        } catch (error) {
          dispatchSetStateInternal(
            fiber,
            queue,
            { then: function() {
            }, status: "rejected", reason: error },
            requestUpdateLane()
          );
        } finally {
          ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      }
      function noop() {
      }
      function startHostTransition(formFiber, pendingState, action, formData) {
        if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
        var queue = ensureFormComponentIsStateful(formFiber).queue;
        startTransition(
          formFiber,
          queue,
          pendingState,
          sharedNotPendingObject,
          null === action ? noop : function() {
            requestFormReset$1(formFiber);
            return action(formData);
          }
        );
      }
      function ensureFormComponentIsStateful(formFiber) {
        var existingStateHook = formFiber.memoizedState;
        if (null !== existingStateHook) return existingStateHook;
        existingStateHook = {
          memoizedState: sharedNotPendingObject,
          baseState: sharedNotPendingObject,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: basicStateReducer,
            lastRenderedState: sharedNotPendingObject
          },
          next: null
        };
        var initialResetState = {};
        existingStateHook.next = {
          memoizedState: initialResetState,
          baseState: initialResetState,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: basicStateReducer,
            lastRenderedState: initialResetState
          },
          next: null
        };
        formFiber.memoizedState = existingStateHook;
        formFiber = formFiber.alternate;
        null !== formFiber && (formFiber.memoizedState = existingStateHook);
        return existingStateHook;
      }
      function requestFormReset$1(formFiber) {
        var stateHook = ensureFormComponentIsStateful(formFiber);
        null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
        dispatchSetStateInternal(
          formFiber,
          stateHook.next.queue,
          {},
          requestUpdateLane()
        );
      }
      function useHostTransitionStatus() {
        return readContext(HostTransitionContext);
      }
      function updateId() {
        return updateWorkInProgressHook().memoizedState;
      }
      function updateRefresh() {
        return updateWorkInProgressHook().memoizedState;
      }
      function refreshCache(fiber) {
        for (var provider = fiber.return; null !== provider; ) {
          switch (provider.tag) {
            case 24:
            case 3:
              var lane = requestUpdateLane();
              fiber = createUpdate(lane);
              var root$73 = enqueueUpdate(provider, fiber, lane);
              null !== root$73 && (scheduleUpdateOnFiber(root$73, provider, lane), entangleTransitions(root$73, provider, lane));
              provider = { cache: createCache() };
              fiber.payload = provider;
              return;
          }
          provider = provider.return;
        }
      }
      function dispatchReducerAction(fiber, queue, action) {
        var lane = requestUpdateLane();
        action = {
          lane,
          revertLane: 0,
          gesture: null,
          action,
          hasEagerState: false,
          eagerState: null,
          next: null
        };
        isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
      }
      function dispatchSetState(fiber, queue, action) {
        var lane = requestUpdateLane();
        dispatchSetStateInternal(fiber, queue, action, lane);
      }
      function dispatchSetStateInternal(fiber, queue, action, lane) {
        var update = {
          lane,
          revertLane: 0,
          gesture: null,
          action,
          hasEagerState: false,
          eagerState: null,
          next: null
        };
        if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
        else {
          var alternate = fiber.alternate;
          if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate))
            try {
              var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
              update.hasEagerState = true;
              update.eagerState = eagerState;
              if (objectIs(eagerState, currentState))
                return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), false;
            } catch (error) {
            } finally {
            }
          action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
          if (null !== action)
            return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
        }
        return false;
      }
      function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
        action = {
          lane: 2,
          revertLane: requestTransitionLane(),
          gesture: null,
          action,
          hasEagerState: false,
          eagerState: null,
          next: null
        };
        if (isRenderPhaseUpdate(fiber)) {
          if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
        } else
          throwIfDuringRender = enqueueConcurrentHookUpdate(
            fiber,
            queue,
            action,
            2
          ), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
      }
      function isRenderPhaseUpdate(fiber) {
        var alternate = fiber.alternate;
        return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
      }
      function enqueueRenderPhaseUpdate(queue, update) {
        didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
        var pending = queue.pending;
        null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
        queue.pending = update;
      }
      function entangleTransitionUpdate(root2, queue, lane) {
        if (0 !== (lane & 4194048)) {
          var queueLanes = queue.lanes;
          queueLanes &= root2.pendingLanes;
          lane |= queueLanes;
          queue.lanes = lane;
          markRootEntangled(root2, lane);
        }
      }
      var ContextOnlyDispatcher = {
        readContext,
        use,
        useCallback: throwInvalidHookError,
        useContext: throwInvalidHookError,
        useEffect: throwInvalidHookError,
        useImperativeHandle: throwInvalidHookError,
        useLayoutEffect: throwInvalidHookError,
        useInsertionEffect: throwInvalidHookError,
        useMemo: throwInvalidHookError,
        useReducer: throwInvalidHookError,
        useRef: throwInvalidHookError,
        useState: throwInvalidHookError,
        useDebugValue: throwInvalidHookError,
        useDeferredValue: throwInvalidHookError,
        useTransition: throwInvalidHookError,
        useSyncExternalStore: throwInvalidHookError,
        useId: throwInvalidHookError,
        useHostTransitionStatus: throwInvalidHookError,
        useFormState: throwInvalidHookError,
        useActionState: throwInvalidHookError,
        useOptimistic: throwInvalidHookError,
        useMemoCache: throwInvalidHookError,
        useCacheRefresh: throwInvalidHookError,
        useEffectEvent: throwInvalidHookError
      };
      var HooksDispatcherOnMount = {
        readContext,
        use,
        useCallback: function(callback, deps) {
          mountWorkInProgressHook().memoizedState = [
            callback,
            void 0 === deps ? null : deps
          ];
          return callback;
        },
        useContext: readContext,
        useEffect: mountEffect,
        useImperativeHandle: function(ref, create, deps) {
          deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
          mountEffectImpl(
            4194308,
            4,
            imperativeHandleEffect.bind(null, create, ref),
            deps
          );
        },
        useLayoutEffect: function(create, deps) {
          return mountEffectImpl(4194308, 4, create, deps);
        },
        useInsertionEffect: function(create, deps) {
          mountEffectImpl(4, 2, create, deps);
        },
        useMemo: function(nextCreate, deps) {
          var hook = mountWorkInProgressHook();
          deps = void 0 === deps ? null : deps;
          var nextValue = nextCreate();
          if (shouldDoubleInvokeUserFnsInHooksDEV) {
            setIsStrictModeForDevtools(true);
            try {
              nextCreate();
            } finally {
              setIsStrictModeForDevtools(false);
            }
          }
          hook.memoizedState = [nextValue, deps];
          return nextValue;
        },
        useReducer: function(reducer, initialArg, init) {
          var hook = mountWorkInProgressHook();
          if (void 0 !== init) {
            var initialState = init(initialArg);
            if (shouldDoubleInvokeUserFnsInHooksDEV) {
              setIsStrictModeForDevtools(true);
              try {
                init(initialArg);
              } finally {
                setIsStrictModeForDevtools(false);
              }
            }
          } else initialState = initialArg;
          hook.memoizedState = hook.baseState = initialState;
          reducer = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: reducer,
            lastRenderedState: initialState
          };
          hook.queue = reducer;
          reducer = reducer.dispatch = dispatchReducerAction.bind(
            null,
            currentlyRenderingFiber,
            reducer
          );
          return [hook.memoizedState, reducer];
        },
        useRef: function(initialValue) {
          var hook = mountWorkInProgressHook();
          initialValue = { current: initialValue };
          return hook.memoizedState = initialValue;
        },
        useState: function(initialState) {
          initialState = mountStateImpl(initialState);
          var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
          queue.dispatch = dispatch;
          return [initialState.memoizedState, dispatch];
        },
        useDebugValue: mountDebugValue,
        useDeferredValue: function(value, initialValue) {
          var hook = mountWorkInProgressHook();
          return mountDeferredValueImpl(hook, value, initialValue);
        },
        useTransition: function() {
          var stateHook = mountStateImpl(false);
          stateHook = startTransition.bind(
            null,
            currentlyRenderingFiber,
            stateHook.queue,
            true,
            false
          );
          mountWorkInProgressHook().memoizedState = stateHook;
          return [false, stateHook];
        },
        useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
          var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
          if (isHydrating) {
            if (void 0 === getServerSnapshot)
              throw Error(formatProdErrorMessage(407));
            getServerSnapshot = getServerSnapshot();
          } else {
            getServerSnapshot = getSnapshot();
            if (null === workInProgressRoot)
              throw Error(formatProdErrorMessage(349));
            0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
          }
          hook.memoizedState = getServerSnapshot;
          var inst = { value: getServerSnapshot, getSnapshot };
          hook.queue = inst;
          mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
            subscribe
          ]);
          fiber.flags |= 2048;
          pushSimpleEffect(
            9,
            { destroy: void 0 },
            updateStoreInstance.bind(
              null,
              fiber,
              inst,
              getServerSnapshot,
              getSnapshot
            ),
            null
          );
          return getServerSnapshot;
        },
        useId: function() {
          var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
          if (isHydrating) {
            var JSCompiler_inline_result = treeContextOverflow;
            var idWithLeadingBit = treeContextId;
            JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
            identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
            JSCompiler_inline_result = localIdCounter++;
            0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
            identifierPrefix += "_";
          } else
            JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
          return hook.memoizedState = identifierPrefix;
        },
        useHostTransitionStatus,
        useFormState: mountActionState,
        useActionState: mountActionState,
        useOptimistic: function(passthrough) {
          var hook = mountWorkInProgressHook();
          hook.memoizedState = hook.baseState = passthrough;
          var queue = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: null,
            lastRenderedState: null
          };
          hook.queue = queue;
          hook = dispatchOptimisticSetState.bind(
            null,
            currentlyRenderingFiber,
            true,
            queue
          );
          queue.dispatch = hook;
          return [passthrough, hook];
        },
        useMemoCache,
        useCacheRefresh: function() {
          return mountWorkInProgressHook().memoizedState = refreshCache.bind(
            null,
            currentlyRenderingFiber
          );
        },
        useEffectEvent: function(callback) {
          var hook = mountWorkInProgressHook(), ref = { impl: callback };
          hook.memoizedState = ref;
          return function() {
            if (0 !== (executionContext & 2))
              throw Error(formatProdErrorMessage(440));
            return ref.impl.apply(void 0, arguments);
          };
        }
      };
      var HooksDispatcherOnUpdate = {
        readContext,
        use,
        useCallback: updateCallback,
        useContext: readContext,
        useEffect: updateEffect,
        useImperativeHandle: updateImperativeHandle,
        useInsertionEffect: updateInsertionEffect,
        useLayoutEffect: updateLayoutEffect,
        useMemo: updateMemo,
        useReducer: updateReducer,
        useRef: updateRef,
        useState: function() {
          return updateReducer(basicStateReducer);
        },
        useDebugValue: mountDebugValue,
        useDeferredValue: function(value, initialValue) {
          var hook = updateWorkInProgressHook();
          return updateDeferredValueImpl(
            hook,
            currentHook.memoizedState,
            value,
            initialValue
          );
        },
        useTransition: function() {
          var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
          return [
            "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
            start
          ];
        },
        useSyncExternalStore: updateSyncExternalStore,
        useId: updateId,
        useHostTransitionStatus,
        useFormState: updateActionState,
        useActionState: updateActionState,
        useOptimistic: function(passthrough, reducer) {
          var hook = updateWorkInProgressHook();
          return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
        },
        useMemoCache,
        useCacheRefresh: updateRefresh,
        useEffectEvent: updateEvent
      };
      var HooksDispatcherOnRerender = {
        readContext,
        use,
        useCallback: updateCallback,
        useContext: readContext,
        useEffect: updateEffect,
        useImperativeHandle: updateImperativeHandle,
        useInsertionEffect: updateInsertionEffect,
        useLayoutEffect: updateLayoutEffect,
        useMemo: updateMemo,
        useReducer: rerenderReducer,
        useRef: updateRef,
        useState: function() {
          return rerenderReducer(basicStateReducer);
        },
        useDebugValue: mountDebugValue,
        useDeferredValue: function(value, initialValue) {
          var hook = updateWorkInProgressHook();
          return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(
            hook,
            currentHook.memoizedState,
            value,
            initialValue
          );
        },
        useTransition: function() {
          var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
          return [
            "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
            start
          ];
        },
        useSyncExternalStore: updateSyncExternalStore,
        useId: updateId,
        useHostTransitionStatus,
        useFormState: rerenderActionState,
        useActionState: rerenderActionState,
        useOptimistic: function(passthrough, reducer) {
          var hook = updateWorkInProgressHook();
          if (null !== currentHook)
            return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
          hook.baseState = passthrough;
          return [passthrough, hook.queue.dispatch];
        },
        useMemoCache,
        useCacheRefresh: updateRefresh,
        useEffectEvent: updateEvent
      };
      function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
        ctor = workInProgress2.memoizedState;
        getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
        getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
        workInProgress2.memoizedState = getDerivedStateFromProps;
        0 === workInProgress2.lanes && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
      }
      var classComponentUpdater = {
        enqueueSetState: function(inst, payload, callback) {
          inst = inst._reactInternals;
          var lane = requestUpdateLane(), update = createUpdate(lane);
          update.payload = payload;
          void 0 !== callback && null !== callback && (update.callback = callback);
          payload = enqueueUpdate(inst, update, lane);
          null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
        },
        enqueueReplaceState: function(inst, payload, callback) {
          inst = inst._reactInternals;
          var lane = requestUpdateLane(), update = createUpdate(lane);
          update.tag = 1;
          update.payload = payload;
          void 0 !== callback && null !== callback && (update.callback = callback);
          payload = enqueueUpdate(inst, update, lane);
          null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
        },
        enqueueForceUpdate: function(inst, callback) {
          inst = inst._reactInternals;
          var lane = requestUpdateLane(), update = createUpdate(lane);
          update.tag = 2;
          void 0 !== callback && null !== callback && (update.callback = callback);
          callback = enqueueUpdate(inst, update, lane);
          null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
        }
      };
      function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
        workInProgress2 = workInProgress2.stateNode;
        return "function" === typeof workInProgress2.shouldComponentUpdate ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
      }
      function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
        workInProgress2 = instance.state;
        "function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
        "function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
        instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
      }
      function resolveClassComponentProps(Component, baseProps) {
        var newProps = baseProps;
        if ("ref" in baseProps) {
          newProps = {};
          for (var propName in baseProps)
            "ref" !== propName && (newProps[propName] = baseProps[propName]);
        }
        if (Component = Component.defaultProps) {
          newProps === baseProps && (newProps = assign({}, newProps));
          for (var propName$77 in Component)
            void 0 === newProps[propName$77] && (newProps[propName$77] = Component[propName$77]);
        }
        return newProps;
      }
      function defaultOnUncaughtError(error) {
        reportGlobalError(error);
      }
      function defaultOnCaughtError(error) {
        console.error(error);
      }
      function defaultOnRecoverableError(error) {
        reportGlobalError(error);
      }
      function logUncaughtError(root2, errorInfo) {
        try {
          var onUncaughtError = root2.onUncaughtError;
          onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
        } catch (e$78) {
          setTimeout(function() {
            throw e$78;
          });
        }
      }
      function logCaughtError(root2, boundary, errorInfo) {
        try {
          var onCaughtError = root2.onCaughtError;
          onCaughtError(errorInfo.value, {
            componentStack: errorInfo.stack,
            errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
          });
        } catch (e$79) {
          setTimeout(function() {
            throw e$79;
          });
        }
      }
      function createRootErrorUpdate(root2, errorInfo, lane) {
        lane = createUpdate(lane);
        lane.tag = 3;
        lane.payload = { element: null };
        lane.callback = function() {
          logUncaughtError(root2, errorInfo);
        };
        return lane;
      }
      function createClassErrorUpdate(lane) {
        lane = createUpdate(lane);
        lane.tag = 3;
        return lane;
      }
      function initializeClassErrorUpdate(update, root2, fiber, errorInfo) {
        var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
        if ("function" === typeof getDerivedStateFromError) {
          var error = errorInfo.value;
          update.payload = function() {
            return getDerivedStateFromError(error);
          };
          update.callback = function() {
            logCaughtError(root2, fiber, errorInfo);
          };
        }
        var inst = fiber.stateNode;
        null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
          logCaughtError(root2, fiber, errorInfo);
          "function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
          var stack = errorInfo.stack;
          this.componentDidCatch(errorInfo.value, {
            componentStack: null !== stack ? stack : ""
          });
        });
      }
      function throwException(root2, returnFiber, sourceFiber, value, rootRenderLanes) {
        sourceFiber.flags |= 32768;
        if (null !== value && "object" === typeof value && "function" === typeof value.then) {
          returnFiber = sourceFiber.alternate;
          null !== returnFiber && propagateParentContextChanges(
            returnFiber,
            sourceFiber,
            rootRenderLanes,
            true
          );
          sourceFiber = suspenseHandlerStackCursor.current;
          if (null !== sourceFiber) {
            switch (sourceFiber.tag) {
              case 31:
              case 13:
              case 19:
                return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root2, value, rootRenderLanes)), false;
              case 22:
                return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
                  transitions: null,
                  markerInstances: null,
                  retryQueue: /* @__PURE__ */ new Set([value])
                }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root2, value, rootRenderLanes)), false;
            }
            throw Error(formatProdErrorMessage(435, sourceFiber.tag));
          }
          attachPingListener(root2, value, rootRenderLanes);
          renderDidSuspendDelayIfPossible();
          return false;
        }
        if (isHydrating)
          return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root2 = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root2, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
            cause: value
          }), queueHydrationError(
            createCapturedValueAtFiber(returnFiber, sourceFiber)
          )), root2 = root2.current.alternate, root2.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root2.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(
            root2.stateNode,
            value,
            rootRenderLanes
          ), enqueueCapturedUpdate(root2, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), false;
        var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
        wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
        null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
        4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
        if (null === returnFiber) return true;
        value = createCapturedValueAtFiber(value, sourceFiber);
        sourceFiber = returnFiber;
        do {
          switch (sourceFiber.tag) {
            case 3:
              return sourceFiber.flags |= 65536, root2 = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root2, root2 = createRootErrorUpdate(sourceFiber.stateNode, value, root2), enqueueCapturedUpdate(sourceFiber, root2), false;
            case 1:
              returnFiber = sourceFiber.type;
              wrapperError = sourceFiber.stateNode;
              if (0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
                return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(
                  rootRenderLanes,
                  root2,
                  sourceFiber,
                  value
                ), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
              break;
            case 22:
              if (null !== sourceFiber.memoizedState)
                return sourceFiber.flags |= 65536, false;
          }
          sourceFiber = sourceFiber.return;
        } while (null !== sourceFiber);
        return false;
      }
      var SelectiveHydrationException = Error(formatProdErrorMessage(461));
      var didReceiveUpdate = false;
      function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
        workInProgress2.child = null === current ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(
          workInProgress2,
          current.child,
          nextChildren,
          renderLanes2
        );
      }
      function updateForwardRef(current, workInProgress2, Component, nextProps, renderLanes2) {
        Component = Component.render;
        var ref = workInProgress2.ref;
        if ("ref" in nextProps) {
          var propsWithoutRef = {};
          for (var key in nextProps)
            "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
        } else propsWithoutRef = nextProps;
        prepareToReadContext(workInProgress2);
        nextProps = renderWithHooks(
          current,
          workInProgress2,
          Component,
          propsWithoutRef,
          ref,
          renderLanes2
        );
        key = checkDidRenderIdHook();
        if (null !== current && !didReceiveUpdate)
          return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        isHydrating && key && pushMaterializedTreeId(workInProgress2);
        workInProgress2.flags |= 1;
        reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
        return workInProgress2.child;
      }
      function updateMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
        if (null === current) {
          var type = Component.type;
          if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare)
            return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(
              current,
              workInProgress2,
              type,
              nextProps,
              renderLanes2
            );
          current = createFiberFromTypeAndProps(
            Component.type,
            null,
            nextProps,
            workInProgress2,
            workInProgress2.mode,
            renderLanes2
          );
          current.ref = workInProgress2.ref;
          current.return = workInProgress2;
          return workInProgress2.child = current;
        }
        type = current.child;
        if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
          var prevProps = type.memoizedProps;
          Component = Component.compare;
          Component = null !== Component ? Component : shallowEqual;
          if (Component(prevProps, nextProps) && current.ref === workInProgress2.ref)
            return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        }
        workInProgress2.flags |= 1;
        current = createWorkInProgress(type, nextProps);
        current.ref = workInProgress2.ref;
        current.return = workInProgress2;
        return workInProgress2.child = current;
      }
      function updateSimpleMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
        if (null !== current) {
          var prevProps = current.memoizedProps;
          if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
            if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
              0 !== (current.flags & 131072) && (didReceiveUpdate = true);
            else
              return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        }
        return updateFunctionComponent(
          current,
          workInProgress2,
          Component,
          nextProps,
          renderLanes2
        );
      }
      function updateOffscreenComponent(current, workInProgress2, renderLanes2, nextProps) {
        var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
        null === current && null === workInProgress2.stateNode && (workInProgress2.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null
        });
        if ("hidden" === nextProps.mode) {
          if (0 !== (workInProgress2.flags & 128)) {
            prevState = null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2;
            if (null !== current) {
              nextProps = workInProgress2.child = current.child;
              for (nextChildren = 0; null !== nextProps; )
                nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
              nextProps = nextChildren & ~prevState;
            } else nextProps = 0, workInProgress2.child = null;
            return deferHiddenOffscreenComponent(
              current,
              workInProgress2,
              prevState,
              renderLanes2,
              nextProps
            );
          }
          if (0 !== (renderLanes2 & 536870912))
            workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, null !== current && pushTransition(
              workInProgress2,
              null !== prevState ? prevState.cachePool : null
            ), null !== prevState ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
          else
            return nextProps = workInProgress2.lanes = 536870912, deferHiddenOffscreenComponent(
              current,
              workInProgress2,
              null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2,
              renderLanes2,
              nextProps
            );
        } else
          null !== prevState ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(), workInProgress2.memoizedState = null) : (null !== current && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
        reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
        return workInProgress2.child;
      }
      function bailoutOffscreenComponent(current, workInProgress2) {
        null !== current && 22 === current.tag || null !== workInProgress2.stateNode || (workInProgress2.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null
        });
        return workInProgress2.sibling;
      }
      function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2, remainingChildLanes) {
        var JSCompiler_inline_result = peekCacheFromPool();
        JSCompiler_inline_result = null === JSCompiler_inline_result ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
        workInProgress2.memoizedState = {
          baseLanes: nextBaseLanes,
          cachePool: JSCompiler_inline_result
        };
        null !== current && pushTransition(workInProgress2, null);
        reuseHiddenContextOnStack();
        pushOffscreenSuspenseHandler(workInProgress2);
        null !== current && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
        workInProgress2.childLanes = remainingChildLanes;
        return null;
      }
      function mountActivityChildren(workInProgress2, nextProps) {
        nextProps = mountWorkInProgressOffscreenFiber(
          { mode: nextProps.mode, children: nextProps.children },
          workInProgress2.mode
        );
        nextProps.ref = workInProgress2.ref;
        workInProgress2.child = nextProps;
        nextProps.return = workInProgress2;
        return nextProps;
      }
      function retryActivityComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
        reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
        current = mountActivityChildren(workInProgress2, workInProgress2.pendingProps);
        current.flags |= 2;
        popSuspenseHandler(workInProgress2);
        workInProgress2.memoizedState = null;
        return current;
      }
      function updateActivityComponent(current, workInProgress2, renderLanes2) {
        var nextProps = workInProgress2.pendingProps, didSuspend = 0 !== (workInProgress2.flags & 128);
        workInProgress2.flags &= -129;
        if (null === current) {
          if (isHydrating) {
            if ("hidden" === nextProps.mode)
              return current = mountActivityChildren(workInProgress2, nextProps), workInProgress2.lanes = 536870912, current.memoizedState = { baseLanes: 0, cachePool: null }, bailoutOffscreenComponent(null, current);
            pushDehydratedActivitySuspenseHandler(workInProgress2);
            (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
              current,
              rootOrSingletonContext
            ), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
              dehydrated: current,
              treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
              retryLane: 536870912,
              hydrationErrors: null
            }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
            if (null === current) throw throwOnHydrationMismatch(workInProgress2);
            workInProgress2.lanes = 536870912;
            return null;
          }
          return mountActivityChildren(workInProgress2, nextProps);
        }
        var prevState = current.memoizedState;
        if (null !== prevState) {
          var dehydrated = prevState.dehydrated;
          pushDehydratedActivitySuspenseHandler(workInProgress2);
          if (didSuspend)
            if (workInProgress2.flags & 256)
              workInProgress2.flags &= -257, workInProgress2 = retryActivityComponentWithoutHydrating(
                current,
                workInProgress2,
                renderLanes2
              );
            else if (null !== workInProgress2.memoizedState)
              workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null;
            else throw Error(formatProdErrorMessage(558));
          else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), didSuspend = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || didSuspend) {
            if (null === currentTreeHiddenStackCursor.current) {
              nextProps = workInProgressRoot;
              if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes2), 0 !== dehydrated && dehydrated !== prevState.retryLane))
                throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
              renderDidSuspendDelayIfPossible();
            }
            workInProgress2 = retryActivityComponentWithoutHydrating(
              current,
              workInProgress2,
              renderLanes2
            );
          } else
            current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current), workInProgress2 = mountActivityChildren(workInProgress2, nextProps), workInProgress2.flags |= 134221824;
          return workInProgress2;
        }
        current = createWorkInProgress(current.child, {
          mode: nextProps.mode,
          children: nextProps.children
        });
        current.ref = workInProgress2.ref;
        workInProgress2.child = current;
        current.return = workInProgress2;
        return current;
      }
      function markRef(current, workInProgress2) {
        var ref = workInProgress2.ref;
        if (null === ref)
          null !== current && null !== current.ref && (workInProgress2.flags |= 4194816);
        else {
          if ("function" !== typeof ref && "object" !== typeof ref)
            throw Error(formatProdErrorMessage(284));
          if (null === current || current.ref !== ref)
            workInProgress2.flags |= 4194816;
        }
      }
      function updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
        prepareToReadContext(workInProgress2);
        Component = renderWithHooks(
          current,
          workInProgress2,
          Component,
          nextProps,
          void 0,
          renderLanes2
        );
        nextProps = checkDidRenderIdHook();
        if (null !== current && !didReceiveUpdate)
          return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
        workInProgress2.flags |= 1;
        reconcileChildren(current, workInProgress2, Component, renderLanes2);
        return workInProgress2.child;
      }
      function replayFunctionComponent(current, workInProgress2, nextProps, Component, secondArg, renderLanes2) {
        prepareToReadContext(workInProgress2);
        workInProgress2.updateQueue = null;
        nextProps = renderWithHooksAgain(
          workInProgress2,
          Component,
          nextProps,
          secondArg
        );
        finishRenderingHooks(current);
        Component = checkDidRenderIdHook();
        if (null !== current && !didReceiveUpdate)
          return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
        isHydrating && Component && pushMaterializedTreeId(workInProgress2);
        workInProgress2.flags |= 1;
        reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
        return workInProgress2.child;
      }
      function updateClassComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
        prepareToReadContext(workInProgress2);
        if (null === workInProgress2.stateNode) {
          var context = emptyContextObject, contextType = Component.contextType;
          "object" === typeof contextType && null !== contextType && (context = readContext(contextType));
          context = new Component(nextProps, context);
          workInProgress2.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
          context.updater = classComponentUpdater;
          workInProgress2.stateNode = context;
          context._reactInternals = workInProgress2;
          context = workInProgress2.stateNode;
          context.props = nextProps;
          context.state = workInProgress2.memoizedState;
          context.refs = {};
          initializeUpdateQueue(workInProgress2);
          contextType = Component.contextType;
          context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
          context.state = workInProgress2.memoizedState;
          contextType = Component.getDerivedStateFromProps;
          "function" === typeof contextType && (applyDerivedStateFromProps(
            workInProgress2,
            Component,
            contextType,
            nextProps
          ), context.state = workInProgress2.memoizedState);
          "function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
          "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308);
          nextProps = true;
        } else if (null === current) {
          context = workInProgress2.stateNode;
          var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
          context.props = oldProps;
          var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
          contextType = emptyContextObject;
          "object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
          var getDerivedStateFromProps = Component.getDerivedStateFromProps;
          contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
          unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
          contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(
            workInProgress2,
            context,
            nextProps,
            contextType
          );
          hasForceUpdate = false;
          var oldState = workInProgress2.memoizedState;
          context.state = oldState;
          processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
          suspendIfUpdateReadFromEntangledAsyncAction();
          oldContext = workInProgress2.memoizedState;
          unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(
            workInProgress2,
            Component,
            getDerivedStateFromProps,
            nextProps
          ), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(
            workInProgress2,
            Component,
            oldProps,
            nextProps,
            oldState,
            oldContext,
            contextType
          )) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), nextProps = false);
        } else {
          context = workInProgress2.stateNode;
          cloneUpdateQueue(current, workInProgress2);
          contextType = workInProgress2.memoizedProps;
          contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
          context.props = contextType$jscomp$0;
          getDerivedStateFromProps = workInProgress2.pendingProps;
          oldState = context.context;
          oldContext = Component.contextType;
          oldProps = emptyContextObject;
          "object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
          unresolvedOldProps = Component.getDerivedStateFromProps;
          (oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(
            workInProgress2,
            context,
            nextProps,
            oldProps
          );
          hasForceUpdate = false;
          oldState = workInProgress2.memoizedState;
          context.state = oldState;
          processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
          suspendIfUpdateReadFromEntangledAsyncAction();
          var newState = workInProgress2.memoizedState;
          contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(
            workInProgress2,
            Component,
            unresolvedOldProps,
            nextProps
          ), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(
            workInProgress2,
            Component,
            contextType$jscomp$0,
            nextProps,
            oldState,
            newState,
            oldProps
          ) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(
            nextProps,
            newState,
            oldProps
          )), "function" === typeof context.componentDidUpdate && (workInProgress2.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress2.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
        }
        context = nextProps;
        markRef(current, workInProgress2);
        nextProps = 0 !== (workInProgress2.flags & 128);
        context || nextProps ? (context = workInProgress2.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress2.flags |= 1, null !== current && nextProps ? (workInProgress2.child = reconcileChildFibers(
          workInProgress2,
          current.child,
          null,
          renderLanes2
        ), workInProgress2.child = reconcileChildFibers(
          workInProgress2,
          null,
          Component,
          renderLanes2
        )) : reconcileChildren(current, workInProgress2, Component, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(
          current,
          workInProgress2,
          renderLanes2
        );
        return current;
      }
      function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
        resetHydrationState();
        workInProgress2.flags |= 256;
        reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
        return workInProgress2.child;
      }
      var SUSPENDED_MARKER = {
        dehydrated: null,
        treeContext: null,
        retryLane: 0,
        hydrationErrors: null
      };
      function mountSuspenseOffscreenState(renderLanes2) {
        return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
      }
      function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
        current = null !== current ? current.childLanes & ~renderLanes2 : 0;
        primaryTreeDidDefer && (current |= workInProgressDeferredLane);
        return current;
      }
      function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
        var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = 0 !== (workInProgress2.flags & 128), JSCompiler_temp;
        (JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? false : 0 !== (suspenseStackCursor.current & 2));
        JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
        JSCompiler_temp = 0 !== (workInProgress2.flags & 32);
        workInProgress2.flags &= -33;
        if (null === current) {
          if (isHydrating) {
            showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack();
            (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
              current,
              rootOrSingletonContext
            ), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
              dehydrated: current,
              treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
              retryLane: 536870912,
              hydrationErrors: null
            }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
            if (null === current) throw throwOnHydrationMismatch(workInProgress2);
            isSuspenseInstanceFallback(current) ? workInProgress2.lanes = 32 : workInProgress2.lanes = 536870912;
            return null;
          }
          didSuspend = nextProps.children;
          nextProps = nextProps.fallback;
          if (showFallback)
            return reuseSuspenseHandlerOnStack(), showFallback = workInProgress2.mode, didSuspend = mountWorkInProgressOffscreenFiber(
              { mode: "hidden", children: didSuspend },
              showFallback
            ), nextProps = createFiberFromFragment(
              nextProps,
              showFallback,
              renderLanes2,
              null
            ), didSuspend.return = workInProgress2, nextProps.return = workInProgress2, didSuspend.sibling = nextProps, workInProgress2.child = didSuspend, nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
              current,
              JSCompiler_temp,
              renderLanes2
            ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
          pushPrimaryTreeSuspenseHandler(workInProgress2);
          return mountSuspensePrimaryChildren(workInProgress2, didSuspend);
        }
        var prevState = current.memoizedState;
        if (null !== prevState) {
          var dehydrated$96 = prevState.dehydrated;
          if (null !== dehydrated$96)
            return updateDehydratedSuspenseComponent(
              current,
              workInProgress2,
              didSuspend,
              JSCompiler_temp,
              nextProps,
              dehydrated$96,
              prevState,
              renderLanes2
            );
        }
        if (showFallback)
          return reuseSuspenseHandlerOnStack(), showFallback = nextProps.fallback, didSuspend = workInProgress2.mode, prevState = current.child, dehydrated$96 = prevState.sibling, nextProps = createWorkInProgress(prevState, {
            mode: "hidden",
            children: nextProps.children
          }), nextProps.subtreeFlags = prevState.subtreeFlags & 1206910976, null !== dehydrated$96 ? showFallback = createWorkInProgress(dehydrated$96, showFallback) : (showFallback = createFiberFromFragment(
            showFallback,
            didSuspend,
            renderLanes2,
            null
          ), showFallback.flags |= 2), showFallback.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = showFallback, workInProgress2.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress2.child, showFallback = current.child.memoizedState, null === showFallback ? showFallback = mountSuspenseOffscreenState(renderLanes2) : (didSuspend = showFallback.cachePool, null !== didSuspend ? (prevState = CacheContext._currentValue, didSuspend = didSuspend.parent !== prevState ? { parent: prevState, pool: prevState } : didSuspend) : didSuspend = getSuspendedCache(), showFallback = {
            baseLanes: showFallback.baseLanes | renderLanes2,
            cachePool: didSuspend
          }), nextProps.memoizedState = showFallback, nextProps.childLanes = getRemainingWorkInPrimaryTree(
            current,
            JSCompiler_temp,
            renderLanes2
          ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        renderLanes2 = current.child;
        current = renderLanes2.sibling;
        renderLanes2 = createWorkInProgress(renderLanes2, {
          mode: "visible",
          children: nextProps.children
        });
        renderLanes2.return = workInProgress2;
        renderLanes2.sibling = null;
        null !== current && (JSCompiler_temp = workInProgress2.deletions, null === JSCompiler_temp ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
        workInProgress2.child = renderLanes2;
        workInProgress2.memoizedState = null;
        return renderLanes2;
      }
      function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
        primaryChildren = mountWorkInProgressOffscreenFiber(
          { mode: "visible", children: primaryChildren },
          workInProgress2.mode
        );
        primaryChildren.return = workInProgress2;
        return workInProgress2.child = primaryChildren;
      }
      function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
        offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
        offscreenProps.lanes = 0;
        return offscreenProps;
      }
      function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
        reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
        current = mountSuspensePrimaryChildren(
          workInProgress2,
          workInProgress2.pendingProps.children
        );
        current.flags |= 2;
        workInProgress2.memoizedState = null;
        return current;
      }
      function updateDehydratedSuspenseComponent(current, workInProgress2, didSuspend, didPrimaryChildrenDefer, nextProps, suspenseInstance, suspenseState, renderLanes2) {
        if (didSuspend) {
          if (workInProgress2.flags & 256)
            return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, retrySuspenseComponentWithoutHydrating(
              current,
              workInProgress2,
              renderLanes2
            );
          if (null !== workInProgress2.memoizedState)
            return reuseSuspenseHandlerOnStack(), workInProgress2.child = current.child, workInProgress2.flags |= 128, null;
          reuseSuspenseHandlerOnStack();
          suspenseInstance = nextProps.fallback;
          suspenseState = workInProgress2.mode;
          nextProps = mountWorkInProgressOffscreenFiber(
            { mode: "visible", children: nextProps.children },
            suspenseState
          );
          suspenseInstance = createFiberFromFragment(
            suspenseInstance,
            suspenseState,
            renderLanes2,
            null
          );
          suspenseInstance.flags |= 2;
          nextProps.return = workInProgress2;
          suspenseInstance.return = workInProgress2;
          nextProps.sibling = suspenseInstance;
          workInProgress2.child = nextProps;
          reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
          nextProps = workInProgress2.child;
          nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2);
          nextProps.childLanes = getRemainingWorkInPrimaryTree(
            current,
            didPrimaryChildrenDefer,
            renderLanes2
          );
          workInProgress2.memoizedState = SUSPENDED_MARKER;
          return bailoutOffscreenComponent(null, nextProps);
        }
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        if (isSuspenseInstanceFallback(suspenseInstance)) {
          didPrimaryChildrenDefer = suspenseInstance.nextSibling && suspenseInstance.nextSibling.dataset;
          if (didPrimaryChildrenDefer) var digest = didPrimaryChildrenDefer.dgst;
          didPrimaryChildrenDefer = digest;
          "" !== didPrimaryChildrenDefer && (nextProps = Error(formatProdErrorMessage(419)), nextProps.stack = "", nextProps.digest = didPrimaryChildrenDefer, queueHydrationError({ value: nextProps, source: null, stack: null }));
          return retrySuspenseComponentWithoutHydrating(
            current,
            workInProgress2,
            renderLanes2
          );
        }
        didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false);
        didPrimaryChildrenDefer = 0 !== (renderLanes2 & current.childLanes);
        if (didReceiveUpdate || didPrimaryChildrenDefer) {
          if (null !== currentTreeHiddenStackCursor.current)
            return retrySuspenseComponentWithoutHydrating(
              current,
              workInProgress2,
              renderLanes2
            );
          didPrimaryChildrenDefer = workInProgressRoot;
          if (null !== didPrimaryChildrenDefer && (nextProps = getBumpedLaneForHydration(
            didPrimaryChildrenDefer,
            renderLanes2
          ), 0 !== nextProps && nextProps !== suspenseState.retryLane))
            throw suspenseState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(didPrimaryChildrenDefer, current, nextProps), SelectiveHydrationException;
          isSuspenseInstancePending(suspenseInstance) || renderDidSuspendDelayIfPossible();
          return retrySuspenseComponentWithoutHydrating(
            current,
            workInProgress2,
            renderLanes2
          );
        }
        if (isSuspenseInstancePending(suspenseInstance))
          return workInProgress2.flags |= 192, workInProgress2.child = current.child, null;
        current = suspenseState.treeContext;
        nextHydratableInstance = getNextHydratable(suspenseInstance.nextSibling);
        hydrationParentFiber = workInProgress2;
        isHydrating = true;
        hydrationErrors = null;
        rootOrSingletonContext = false;
        null !== current && restoreSuspendedTreeContext(workInProgress2, current);
        workInProgress2 = mountSuspensePrimaryChildren(
          workInProgress2,
          nextProps.children
        );
        workInProgress2.flags |= 134221824;
        return workInProgress2;
      }
      function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
        fiber.lanes |= renderLanes2;
        var alternate = fiber.alternate;
        null !== alternate && (alternate.lanes |= renderLanes2);
        scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
      }
      function findLastContentRow(firstChild) {
        for (var lastContentRow = null; null !== firstChild; ) {
          var currentRow = firstChild.alternate;
          null !== currentRow && null === findFirstSuspended(currentRow) && (lastContentRow = firstChild);
          firstChild = firstChild.sibling;
        }
        return lastContentRow;
      }
      function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode, treeForkCount2) {
        var renderState = workInProgress2.memoizedState;
        null === renderState ? workInProgress2.memoizedState = {
          isBackwards,
          rendering: null,
          renderingStartTime: 0,
          last: lastContentRow,
          tail,
          tailMode,
          treeForkCount: treeForkCount2
        } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount2);
      }
      function reverseChildren(fiber) {
        var row = fiber.child;
        for (fiber.child = null; null !== row; ) {
          var nextRow = row.sibling;
          row.sibling = fiber.child;
          fiber.child = row;
          row = nextRow;
        }
      }
      function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
        var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
        nextProps = nextProps.children;
        var suspenseContext = suspenseStackCursor.current;
        if (workInProgress2.flags & 128)
          return pushSuspenseListContext(workInProgress2, suspenseContext), null;
        var shouldForceFallback = 0 !== (suspenseContext & 2);
        shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress2.flags |= 128) : suspenseContext &= 1;
        pushSuspenseListContext(workInProgress2, suspenseContext);
        "backwards" === revealOrder && null !== current ? (reverseChildren(current), reconcileChildren(current, workInProgress2, nextProps, renderLanes2), reverseChildren(current)) : reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
        nextProps = isHydrating ? treeForkCount : 0;
        if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128))
          a: for (current = workInProgress2.child; null !== current; ) {
            if (13 === current.tag)
              null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
            else if (19 === current.tag)
              scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
            else if (null !== current.child) {
              current.child.return = current;
              current = current.child;
              continue;
            }
            if (current === workInProgress2) break a;
            for (; null === current.sibling; ) {
              if (null === current.return || current.return === workInProgress2)
                break a;
              current = current.return;
            }
            current.sibling.return = current.return;
            current = current.sibling;
          }
        switch (revealOrder) {
          case "backwards":
            renderLanes2 = findLastContentRow(workInProgress2.child);
            null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null, reverseChildren(workInProgress2));
            initSuspenseListRenderState(
              workInProgress2,
              true,
              revealOrder,
              null,
              tailMode,
              nextProps
            );
            break;
          case "unstable_legacy-backwards":
            renderLanes2 = null;
            revealOrder = workInProgress2.child;
            for (workInProgress2.child = null; null !== revealOrder; ) {
              current = revealOrder.alternate;
              if (null !== current && null === findFirstSuspended(current)) {
                workInProgress2.child = revealOrder;
                break;
              }
              current = revealOrder.sibling;
              revealOrder.sibling = renderLanes2;
              renderLanes2 = revealOrder;
              revealOrder = current;
            }
            initSuspenseListRenderState(
              workInProgress2,
              true,
              renderLanes2,
              null,
              tailMode,
              nextProps
            );
            break;
          case "together":
            initSuspenseListRenderState(
              workInProgress2,
              false,
              null,
              null,
              void 0,
              nextProps
            );
            break;
          case "independent":
            workInProgress2.memoizedState = null;
            break;
          default:
            renderLanes2 = findLastContentRow(workInProgress2.child), null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null), initSuspenseListRenderState(
              workInProgress2,
              false,
              revealOrder,
              renderLanes2,
              tailMode,
              nextProps
            );
        }
        return workInProgress2.child;
      }
      function updateContextProvider(current, workInProgress2, renderLanes2) {
        var newProps = workInProgress2.pendingProps;
        pushProvider(workInProgress2, workInProgress2.type, newProps.value);
        reconcileChildren(current, workInProgress2, newProps.children, renderLanes2);
        return workInProgress2.child;
      }
      function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
        null !== current && (workInProgress2.dependencies = current.dependencies);
        workInProgressRootSkippedLanes |= workInProgress2.lanes;
        if (0 === (renderLanes2 & workInProgress2.childLanes))
          if (null !== current) {
            if (propagateParentContextChanges(
              current,
              workInProgress2,
              renderLanes2,
              false
            ), 0 === (renderLanes2 & workInProgress2.childLanes))
              return null;
          } else return null;
        if (null !== current && workInProgress2.child !== current.child)
          throw Error(formatProdErrorMessage(153));
        if (null !== workInProgress2.child) {
          current = workInProgress2.child;
          renderLanes2 = createWorkInProgress(current, current.pendingProps);
          workInProgress2.child = renderLanes2;
          for (renderLanes2.return = workInProgress2; null !== current.sibling; )
            current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
          renderLanes2.sibling = null;
        }
        return workInProgress2.child;
      }
      function checkScheduledUpdateOrContext(current, renderLanes2) {
        if (0 !== (current.lanes & renderLanes2)) return true;
        current = current.dependencies;
        return null !== current && checkIfContextChanged(current) ? true : false;
      }
      function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
        switch (workInProgress2.tag) {
          case 3:
            pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
            pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
            resetHydrationState();
            break;
          case 27:
          case 5:
            pushHostContext(workInProgress2);
            break;
          case 4:
            pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
            break;
          case 10:
            pushProvider(
              workInProgress2,
              workInProgress2.type,
              workInProgress2.memoizedProps.value
            );
            break;
          case 31:
            if (null !== workInProgress2.memoizedState)
              return workInProgress2.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress2), null;
            break;
          case 13:
            var state$108 = workInProgress2.memoizedState;
            if (null !== state$108) {
              if (null !== state$108.dehydrated)
                return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
              state$108 = propagateParentContextChanges(
                current,
                workInProgress2,
                renderLanes2,
                false
              );
              var primaryChildLanes = workInProgress2.child.childLanes;
              if (state$108 || 0 !== (renderLanes2 & primaryChildLanes))
                return updateSuspenseComponent(current, workInProgress2, renderLanes2);
              pushPrimaryTreeSuspenseHandler(workInProgress2);
              current = bailoutOnAlreadyFinishedWork(
                current,
                workInProgress2,
                renderLanes2
              );
              return null !== current ? current.sibling : null;
            }
            pushPrimaryTreeSuspenseHandler(workInProgress2);
            break;
          case 19:
            if (workInProgress2.flags & 128)
              return updateSuspenseListComponent(
                current,
                workInProgress2,
                renderLanes2
              );
            primaryChildLanes = 0 !== (current.flags & 128);
            state$108 = 0 !== (renderLanes2 & workInProgress2.childLanes);
            state$108 || (propagateParentContextChanges(
              current,
              workInProgress2,
              renderLanes2,
              false
            ), state$108 = 0 !== (renderLanes2 & workInProgress2.childLanes));
            if (primaryChildLanes) {
              if (state$108)
                return updateSuspenseListComponent(
                  current,
                  workInProgress2,
                  renderLanes2
                );
              workInProgress2.flags |= 128;
            }
            primaryChildLanes = workInProgress2.memoizedState;
            null !== primaryChildLanes && (primaryChildLanes.rendering = null, primaryChildLanes.tail = null, primaryChildLanes.lastEffect = null);
            pushSuspenseListContext(workInProgress2, suspenseStackCursor.current);
            if (state$108) break;
            else return null;
          case 22:
            return workInProgress2.lanes = 0, updateOffscreenComponent(
              current,
              workInProgress2,
              renderLanes2,
              workInProgress2.pendingProps
            );
          case 24:
            pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
        }
        return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
      }
      function beginWork(current, workInProgress2, renderLanes2) {
        if (null !== current)
          if (current.memoizedProps !== workInProgress2.pendingProps)
            didReceiveUpdate = true;
          else {
            if (!checkScheduledUpdateOrContext(current, renderLanes2) && 0 === (workInProgress2.flags & 128))
              return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(
                current,
                workInProgress2,
                renderLanes2
              );
            didReceiveUpdate = 0 !== (current.flags & 131072) ? true : false;
          }
        else
          didReceiveUpdate = false, isHydrating && 0 !== (workInProgress2.flags & 1048576) && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
        workInProgress2.lanes = 0;
        switch (workInProgress2.tag) {
          case 16:
            a: {
              var props = workInProgress2.pendingProps;
              current = resolveLazy(workInProgress2.elementType);
              workInProgress2.type = current;
              if ("function" === typeof current)
                shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(
                  null,
                  workInProgress2,
                  current,
                  props,
                  renderLanes2
                )) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(
                  null,
                  workInProgress2,
                  current,
                  props,
                  renderLanes2
                ));
              else {
                if (void 0 !== current && null !== current) {
                  var $$typeof = current.$$typeof;
                  if ($$typeof === REACT_FORWARD_REF_TYPE) {
                    workInProgress2.tag = 11;
                    workInProgress2 = updateForwardRef(
                      null,
                      workInProgress2,
                      current,
                      props,
                      renderLanes2
                    );
                    break a;
                  } else if ($$typeof === REACT_MEMO_TYPE) {
                    workInProgress2.tag = 14;
                    workInProgress2 = updateMemoComponent(
                      null,
                      workInProgress2,
                      current,
                      props,
                      renderLanes2
                    );
                    break a;
                  } else if ($$typeof === REACT_CONTEXT_TYPE) {
                    workInProgress2.tag = 10;
                    workInProgress2.type = current;
                    workInProgress2 = updateContextProvider(
                      null,
                      workInProgress2,
                      renderLanes2
                    );
                    break a;
                  }
                }
                workInProgress2 = getComponentNameFromType(current) || current;
                throw Error(formatProdErrorMessage(306, workInProgress2, ""));
              }
            }
            return workInProgress2;
          case 0:
            return updateFunctionComponent(
              current,
              workInProgress2,
              workInProgress2.type,
              workInProgress2.pendingProps,
              renderLanes2
            );
          case 1:
            return props = workInProgress2.type, $$typeof = resolveClassComponentProps(
              props,
              workInProgress2.pendingProps
            ), updateClassComponent(
              current,
              workInProgress2,
              props,
              $$typeof,
              renderLanes2
            );
          case 3:
            a: {
              pushHostContainer(
                workInProgress2,
                workInProgress2.stateNode.containerInfo
              );
              if (null === current) throw Error(formatProdErrorMessage(387));
              props = workInProgress2.pendingProps;
              var prevState = workInProgress2.memoizedState;
              $$typeof = prevState.element;
              cloneUpdateQueue(current, workInProgress2);
              processUpdateQueue(workInProgress2, props, null, renderLanes2);
              var nextState = workInProgress2.memoizedState;
              props = nextState.cache;
              pushProvider(workInProgress2, CacheContext, props);
              props !== prevState.cache && propagateContextChanges(
                workInProgress2,
                [CacheContext],
                renderLanes2,
                true
              );
              suspendIfUpdateReadFromEntangledAsyncAction();
              props = nextState.element;
              if (prevState.isDehydrated)
                if (prevState = {
                  element: props,
                  isDehydrated: false,
                  cache: nextState.cache
                }, workInProgress2.updateQueue.baseState = prevState, workInProgress2.memoizedState = prevState, workInProgress2.flags & 256) {
                  workInProgress2 = mountHostRootWithoutHydrating(
                    current,
                    workInProgress2,
                    props,
                    renderLanes2
                  );
                  break a;
                } else if (props !== $$typeof) {
                  $$typeof = createCapturedValueAtFiber(
                    Error(formatProdErrorMessage(424)),
                    workInProgress2
                  );
                  queueHydrationError($$typeof);
                  workInProgress2 = mountHostRootWithoutHydrating(
                    current,
                    workInProgress2,
                    props,
                    renderLanes2
                  );
                  break a;
                } else {
                  current = workInProgress2.stateNode.containerInfo;
                  switch (current.nodeType) {
                    case 9:
                      current = current.body;
                      break;
                    default:
                      current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
                  }
                  nextHydratableInstance = getNextHydratable(current.firstChild);
                  hydrationParentFiber = workInProgress2;
                  isHydrating = true;
                  hydrationErrors = null;
                  rootOrSingletonContext = true;
                  renderLanes2 = mountChildFibers(
                    workInProgress2,
                    null,
                    props,
                    renderLanes2
                  );
                  for (workInProgress2.child = renderLanes2; renderLanes2; )
                    renderLanes2.flags = renderLanes2.flags & -3 | 134221824, renderLanes2 = renderLanes2.sibling;
                }
              else {
                resetHydrationState();
                if (props === $$typeof) {
                  workInProgress2 = bailoutOnAlreadyFinishedWork(
                    current,
                    workInProgress2,
                    renderLanes2
                  );
                  break a;
                }
                reconcileChildren(current, workInProgress2, props, renderLanes2);
              }
              workInProgress2 = workInProgress2.child;
            }
            return workInProgress2;
          case 26:
            return markRef(current, workInProgress2), null === current ? (renderLanes2 = getResource(
              workInProgress2.type,
              null,
              workInProgress2.pendingProps,
              null
            )) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (workInProgress2.stateNode = createHoistableInstance(
              workInProgress2.type,
              workInProgress2.pendingProps,
              rootInstanceStackCursor.current,
              workInProgress2
            )) : workInProgress2.memoizedState = getResource(
              workInProgress2.type,
              current.memoizedProps,
              workInProgress2.pendingProps,
              current.memoizedState
            ), null;
          case 27:
            return pushHostContext(workInProgress2), null === current && isHydrating && (props = workInProgress2.stateNode = resolveSingletonInstance(
              workInProgress2.type,
              workInProgress2.pendingProps,
              rootInstanceStackCursor.current
            ), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress2.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(
              current,
              workInProgress2,
              workInProgress2.pendingProps.children,
              renderLanes2
            ), markRef(current, workInProgress2), null === current && (workInProgress2.flags |= 4194304), workInProgress2.child;
          case 5:
            if (null === current && isHydrating) {
              if ($$typeof = props = nextHydratableInstance)
                props = canHydrateInstance(
                  props,
                  workInProgress2.type,
                  workInProgress2.pendingProps,
                  rootOrSingletonContext
                ), null !== props ? (workInProgress2.stateNode = props, hydrationParentFiber = workInProgress2, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = false, $$typeof = true) : $$typeof = false;
              $$typeof || throwOnHydrationMismatch(workInProgress2);
            }
            pushHostContext(workInProgress2);
            $$typeof = workInProgress2.type;
            prevState = workInProgress2.pendingProps;
            nextState = null !== current ? current.memoizedProps : null;
            props = prevState.children;
            shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress2.flags |= 32);
            null !== workInProgress2.memoizedState && ($$typeof = renderWithHooks(
              current,
              workInProgress2,
              TransitionAwareHostComponent,
              null,
              null,
              renderLanes2
            ), HostTransitionContext._currentValue = $$typeof);
            markRef(current, workInProgress2);
            reconcileChildren(current, workInProgress2, props, renderLanes2);
            return workInProgress2.child;
          case 6:
            if (null === current && isHydrating) {
              if (current = renderLanes2 = nextHydratableInstance)
                renderLanes2 = canHydrateTextInstance(
                  renderLanes2,
                  workInProgress2.pendingProps,
                  rootOrSingletonContext
                ), null !== renderLanes2 ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
              current || throwOnHydrationMismatch(workInProgress2);
            }
            return null;
          case 13:
            return updateSuspenseComponent(current, workInProgress2, renderLanes2);
          case 4:
            return pushHostContainer(
              workInProgress2,
              workInProgress2.stateNode.containerInfo
            ), props = workInProgress2.pendingProps, null === current ? workInProgress2.child = reconcileChildFibers(
              workInProgress2,
              null,
              props,
              renderLanes2
            ) : reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
          case 11:
            return updateForwardRef(
              current,
              workInProgress2,
              workInProgress2.type,
              workInProgress2.pendingProps,
              renderLanes2
            );
          case 7:
            return props = workInProgress2.pendingProps, markRef(current, workInProgress2), reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
          case 8:
            return reconcileChildren(
              current,
              workInProgress2,
              workInProgress2.pendingProps.children,
              renderLanes2
            ), workInProgress2.child;
          case 12:
            return reconcileChildren(
              current,
              workInProgress2,
              workInProgress2.pendingProps.children,
              renderLanes2
            ), workInProgress2.child;
          case 10:
            return updateContextProvider(current, workInProgress2, renderLanes2);
          case 9:
            return $$typeof = workInProgress2.type._context, props = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
          case 14:
            return updateMemoComponent(
              current,
              workInProgress2,
              workInProgress2.type,
              workInProgress2.pendingProps,
              renderLanes2
            );
          case 15:
            return updateSimpleMemoComponent(
              current,
              workInProgress2,
              workInProgress2.type,
              workInProgress2.pendingProps,
              renderLanes2
            );
          case 19:
            return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
          case 31:
            return updateActivityComponent(current, workInProgress2, renderLanes2);
          case 22:
            return updateOffscreenComponent(
              current,
              workInProgress2,
              renderLanes2,
              workInProgress2.pendingProps
            );
          case 24:
            return prepareToReadContext(workInProgress2), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes2), $$typeof = prevState), workInProgress2.memoizedState = { parent: props, cache: $$typeof }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes2) && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress2.memoizedState, $$typeof.parent !== props ? ($$typeof = { parent: props, cache: props }, workInProgress2.memoizedState = $$typeof, 0 === workInProgress2.lanes && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = $$typeof), pushProvider(workInProgress2, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress2, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(
              workInProgress2,
              [CacheContext],
              renderLanes2,
              true
            ))), reconcileChildren(
              current,
              workInProgress2,
              workInProgress2.pendingProps.children,
              renderLanes2
            ), workInProgress2.child;
          case 30:
            return null === workInProgress2.stateNode && (workInProgress2.stateNode = {
              autoName: null,
              paired: null,
              clones: null,
              ref: null
            }), props = workInProgress2.pendingProps, null != props.name && "auto" !== props.name ? workInProgress2.flags |= null === current ? 18882560 : 18874368 : isHydrating && pushMaterializedTreeId(workInProgress2), null !== current && current.memoizedProps.name !== props.name ? workInProgress2.flags |= 4194816 : markRef(current, workInProgress2), reconcileChildren(current, workInProgress2, props.children, renderLanes2), workInProgress2.child;
          case 29:
            throw workInProgress2.pendingProps;
        }
        throw Error(formatProdErrorMessage(156, workInProgress2.tag));
      }
      function markUpdate(workInProgress2) {
        workInProgress2.flags |= 4;
      }
      function preloadInstanceAndSuspendIfNeeded(workInProgress2, type, oldProps, newProps, renderLanes2) {
        var JSCompiler_temp;
        if (JSCompiler_temp = 0 !== (workInProgress2.mode & 32))
          JSCompiler_temp = null === oldProps ? maySuspendCommit(type, newProps) : maySuspendCommit(type, newProps) && (newProps.src !== oldProps.src || newProps.srcSet !== oldProps.srcSet);
        if (JSCompiler_temp) {
          if (workInProgress2.flags |= 16777216, (renderLanes2 & 335544128) === renderLanes2)
            if (workInProgress2.stateNode.complete) workInProgress2.flags |= 8192;
            else if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
            else
              throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
        } else workInProgress2.flags &= -16777217;
      }
      function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
        if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4))
          workInProgress2.flags &= -16777217;
        else if (workInProgress2.flags |= 16777216, !preloadResource(resource))
          if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
          else
            throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
      }
      function scheduleRetryEffect(workInProgress2, retryQueue) {
        null !== retryQueue && (workInProgress2.flags |= 4);
        workInProgress2.flags & 16384 && (retryQueue = 22 !== workInProgress2.tag ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
      }
      function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
        if (!isHydrating)
          switch (renderState.tailMode) {
            case "visible":
              break;
            case "collapsed":
              for (var tailNode = renderState.tail, lastTailNode = null; null !== tailNode; )
                null !== tailNode.alternate && (lastTailNode = tailNode), tailNode = tailNode.sibling;
              null === lastTailNode ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode.sibling = null;
              break;
            default:
              hasRenderedATailFallback = renderState.tail;
              for (tailNode = null; null !== hasRenderedATailFallback; )
                null !== hasRenderedATailFallback.alternate && (tailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
              null === tailNode ? renderState.tail = null : tailNode.sibling = null;
          }
      }
      function bubbleProperties(completedWork) {
        var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
        if (didBailout)
          for (var child$113 = completedWork.child; null !== child$113; )
            newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags & 1206910976, subtreeFlags |= child$113.flags & 1206910976, child$113.return = completedWork, child$113 = child$113.sibling;
        else
          for (child$113 = completedWork.child; null !== child$113; )
            newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags, subtreeFlags |= child$113.flags, child$113.return = completedWork, child$113 = child$113.sibling;
        completedWork.subtreeFlags |= subtreeFlags;
        completedWork.childLanes = newChildLanes;
        return didBailout;
      }
      function completeWork(current, workInProgress2, renderLanes2) {
        var newProps = workInProgress2.pendingProps;
        popTreeContext(workInProgress2);
        switch (workInProgress2.tag) {
          case 16:
          case 15:
          case 0:
          case 11:
          case 7:
          case 8:
          case 12:
          case 9:
          case 14:
            return bubbleProperties(workInProgress2), null;
          case 1:
            return bubbleProperties(workInProgress2), null;
          case 3:
            renderLanes2 = workInProgress2.stateNode;
            newProps = null;
            null !== current && (newProps = current.memoizedState.cache);
            workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
            popProvider(CacheContext);
            popHostContainer();
            renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
            if (null === current || null === current.child)
              popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress2.flags & 256) || (workInProgress2.flags |= 1024, upgradeHydrationErrorsToRecoverable());
            bubbleProperties(workInProgress2);
            return null;
          case 26:
            var type = workInProgress2.type, nextResource = workInProgress2.memoizedState;
            null === current ? (markUpdate(workInProgress2), null !== nextResource ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
              workInProgress2,
              type,
              null,
              newProps,
              renderLanes2
            ))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
              workInProgress2,
              type,
              current,
              newProps,
              renderLanes2
            ));
            return null;
          case 27:
            popHostContext(workInProgress2);
            renderLanes2 = rootInstanceStackCursor.current;
            type = workInProgress2.type;
            if (null !== current && null != workInProgress2.stateNode)
              current.memoizedProps !== newProps && markUpdate(workInProgress2);
            else {
              if (!newProps) {
                if (null === workInProgress2.stateNode)
                  throw Error(formatProdErrorMessage(166));
                bubbleProperties(workInProgress2);
                workInProgress2.subtreeFlags &= -33554433;
                return null;
              }
              current = contextStackCursor.current;
              popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2, current) : (current = resolveSingletonInstance(type, newProps, renderLanes2), workInProgress2.stateNode = current, markUpdate(workInProgress2));
            }
            bubbleProperties(workInProgress2);
            workInProgress2.subtreeFlags &= -33554433;
            return null;
          case 5:
            popHostContext(workInProgress2);
            type = workInProgress2.type;
            if (null !== current && null != workInProgress2.stateNode)
              current.memoizedProps !== newProps && markUpdate(workInProgress2);
            else {
              if (!newProps) {
                if (null === workInProgress2.stateNode)
                  throw Error(formatProdErrorMessage(166));
                bubbleProperties(workInProgress2);
                workInProgress2.subtreeFlags &= -33554433;
                return null;
              }
              nextResource = contextStackCursor.current;
              if (popHydrationState(workInProgress2))
                prepareToHydrateHostInstance(workInProgress2, nextResource);
              else {
                var ownerDocument = getOwnerDocumentFromRootContainer(
                  rootInstanceStackCursor.current
                );
                switch (nextResource) {
                  case 1:
                    nextResource = ownerDocument.createElementNS(
                      "http://www.w3.org/2000/svg",
                      type
                    );
                    break;
                  case 2:
                    nextResource = ownerDocument.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      type
                    );
                    break;
                  default:
                    switch (type) {
                      case "svg":
                        nextResource = ownerDocument.createElementNS(
                          "http://www.w3.org/2000/svg",
                          type
                        );
                        break;
                      case "math":
                        nextResource = ownerDocument.createElementNS(
                          "http://www.w3.org/1998/Math/MathML",
                          type
                        );
                        break;
                      case "script":
                        nextResource = ownerDocument.createElement("div");
                        nextResource.innerHTML = "<script><\/script>";
                        nextResource = nextResource.removeChild(
                          nextResource.firstChild
                        );
                        break;
                      case "select":
                        nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", {
                          is: newProps.is
                        }) : ownerDocument.createElement("select");
                        newProps.multiple ? nextResource.multiple = true : newProps.size && (nextResource.size = newProps.size);
                        break;
                      default:
                        nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
                    }
                }
                nextResource[internalInstanceKey] = workInProgress2;
                nextResource[internalPropsKey] = newProps;
                a: for (ownerDocument = workInProgress2.child; null !== ownerDocument; ) {
                  if (5 === ownerDocument.tag || 6 === ownerDocument.tag)
                    nextResource.appendChild(ownerDocument.stateNode);
                  else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
                    ownerDocument.child.return = ownerDocument;
                    ownerDocument = ownerDocument.child;
                    continue;
                  }
                  if (ownerDocument === workInProgress2) break a;
                  for (; null === ownerDocument.sibling; ) {
                    if (null === ownerDocument.return || ownerDocument.return === workInProgress2)
                      break a;
                    ownerDocument = ownerDocument.return;
                  }
                  ownerDocument.sibling.return = ownerDocument.return;
                  ownerDocument = ownerDocument.sibling;
                }
                workInProgress2.stateNode = nextResource;
                a: switch (setInitialProperties(nextResource, type, newProps), type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    newProps = !!newProps.autoFocus;
                    break a;
                  case "img":
                    newProps = true;
                    break a;
                  default:
                    newProps = false;
                }
                newProps && markUpdate(workInProgress2);
              }
            }
            bubbleProperties(workInProgress2);
            workInProgress2.subtreeFlags &= -33554433;
            preloadInstanceAndSuspendIfNeeded(
              workInProgress2,
              workInProgress2.type,
              null === current ? null : current.memoizedProps,
              workInProgress2.pendingProps,
              renderLanes2
            );
            return null;
          case 6:
            if (current && null != workInProgress2.stateNode)
              current.memoizedProps !== newProps && markUpdate(workInProgress2);
            else {
              if ("string" !== typeof newProps && null === workInProgress2.stateNode)
                throw Error(formatProdErrorMessage(166));
              current = rootInstanceStackCursor.current;
              if (popHydrationState(workInProgress2)) {
                current = workInProgress2.stateNode;
                renderLanes2 = workInProgress2.memoizedProps;
                newProps = null;
                type = hydrationParentFiber;
                if (null !== type)
                  switch (type.tag) {
                    case 27:
                    case 5:
                      newProps = type.memoizedProps;
                  }
                current[internalInstanceKey] = workInProgress2;
                current = current.nodeValue === renderLanes2 || null !== newProps && true === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes2) ? true : false;
                current || throwOnHydrationMismatch(workInProgress2, true);
              } else
                current = getOwnerDocumentFromRootContainer(current).createTextNode(
                  newProps
                ), current[internalInstanceKey] = workInProgress2, workInProgress2.stateNode = current;
            }
            bubbleProperties(workInProgress2);
            return null;
          case 31:
            renderLanes2 = workInProgress2.memoizedState;
            if (null === current || null !== current.memoizedState) {
              newProps = popHydrationState(workInProgress2);
              if (null !== renderLanes2) {
                if (null === current) {
                  if (!newProps) throw Error(formatProdErrorMessage(318));
                  current = workInProgress2.memoizedState;
                  current = null !== current ? current.dehydrated : null;
                  if (!current) throw Error(formatProdErrorMessage(557));
                  current[internalInstanceKey] = workInProgress2;
                } else
                  resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
                bubbleProperties(workInProgress2);
                current = false;
              } else
                renderLanes2 = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes2), current = true;
              if (!current) {
                if (workInProgress2.flags & 256)
                  return popSuspenseHandler(workInProgress2), workInProgress2;
                popSuspenseHandler(workInProgress2);
                return null;
              }
              if (0 !== (workInProgress2.flags & 128))
                throw Error(formatProdErrorMessage(558));
            }
            bubbleProperties(workInProgress2);
            return null;
          case 13:
            newProps = workInProgress2.memoizedState;
            if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
              type = popHydrationState(workInProgress2);
              if (null !== newProps && null !== newProps.dehydrated) {
                if (null === current) {
                  if (!type) throw Error(formatProdErrorMessage(318));
                  type = workInProgress2.memoizedState;
                  type = null !== type ? type.dehydrated : null;
                  if (!type) throw Error(formatProdErrorMessage(317));
                  type[internalInstanceKey] = workInProgress2;
                } else
                  resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
                bubbleProperties(workInProgress2);
                type = false;
              } else
                type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = true;
              if (!type) {
                if (workInProgress2.flags & 256)
                  return popSuspenseHandler(workInProgress2), workInProgress2;
                popSuspenseHandler(workInProgress2);
                return null;
              }
            }
            popSuspenseHandler(workInProgress2);
            if (0 !== (workInProgress2.flags & 128))
              return workInProgress2.lanes = renderLanes2, workInProgress2;
            renderLanes2 = null !== newProps;
            current = null !== current && null !== current.memoizedState;
            renderLanes2 && (newProps = workInProgress2.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
            renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
            scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
            bubbleProperties(workInProgress2);
            return null;
          case 4:
            return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress2.stateNode.containerInfo), workInProgress2.flags |= 67108864, bubbleProperties(workInProgress2), null;
          case 10:
            return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
          case 19:
            popSuspenseListContext(workInProgress2);
            newProps = workInProgress2.memoizedState;
            if (null === newProps) return bubbleProperties(workInProgress2), null;
            type = 0 !== (workInProgress2.flags & 128);
            nextResource = newProps.rendering;
            if (null === nextResource)
              if (type) cutOffTailIfNeeded(newProps, false);
              else {
                if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128))
                  for (current = workInProgress2.child; null !== current; ) {
                    nextResource = findFirstSuspended(current);
                    if (null !== nextResource) {
                      workInProgress2.flags |= 128;
                      cutOffTailIfNeeded(newProps, false);
                      current = nextResource.updateQueue;
                      workInProgress2.updateQueue = current;
                      scheduleRetryEffect(workInProgress2, current);
                      workInProgress2.subtreeFlags = 0;
                      current = renderLanes2;
                      for (renderLanes2 = workInProgress2.child; null !== renderLanes2; )
                        resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
                      pushSuspenseListContext(
                        workInProgress2,
                        suspenseStackCursor.current & 1 | 2
                      );
                      isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount);
                      return workInProgress2.child;
                    }
                    current = current.sibling;
                  }
                null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
              }
            else {
              if (!type)
                if (current = findFirstSuspended(nextResource), null !== current) {
                  if (workInProgress2.flags |= 128, type = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(newProps, true), null === newProps.tail && "collapsed" !== newProps.tailMode && "visible" !== newProps.tailMode && !nextResource.alternate && !isHydrating)
                    return bubbleProperties(workInProgress2), null;
                } else
                  2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes2 && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
              newProps.isBackwards ? (nextResource.sibling = workInProgress2.child, workInProgress2.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress2.child = nextResource, newProps.last = nextResource);
            }
            if (null !== newProps.tail) {
              current = newProps.tail;
              a: {
                for (renderLanes2 = current; null !== renderLanes2; ) {
                  if (null !== renderLanes2.alternate) {
                    renderLanes2 = false;
                    break a;
                  }
                  renderLanes2 = renderLanes2.sibling;
                }
                renderLanes2 = true;
              }
              newProps.rendering = current;
              newProps.tail = current.sibling;
              newProps.renderingStartTime = now();
              current.sibling = null;
              nextResource = suspenseStackCursor.current;
              nextResource = type ? nextResource & 1 | 2 : nextResource & 1;
              "visible" === newProps.tailMode || "collapsed" === newProps.tailMode || !renderLanes2 || isHydrating ? pushSuspenseListContext(workInProgress2, nextResource) : (renderLanes2 = nextResource, push(suspenseHandlerStackCursor, workInProgress2), push(suspenseStackCursor, renderLanes2), null === shellBoundary && (shellBoundary = workInProgress2));
              isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount);
              return current;
            }
            bubbleProperties(workInProgress2);
            return null;
          case 22:
          case 23:
            return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = null !== workInProgress2.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? 0 !== (renderLanes2 & 536870912) && 0 === (workInProgress2.flags & 128) && (bubbleProperties(workInProgress2), workInProgress2.subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, null !== renderLanes2 && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes2 = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress2.memoizedState && null !== workInProgress2.memoizedState.cachePool && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), null !== current && pop(resumedCache), null;
          case 24:
            return renderLanes2 = null, null !== current && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
          case 25:
            return null;
          case 30:
            return workInProgress2.flags |= 33554432, bubbleProperties(workInProgress2), null;
        }
        throw Error(formatProdErrorMessage(156, workInProgress2.tag));
      }
      function unwindWork(current, workInProgress2) {
        popTreeContext(workInProgress2);
        switch (workInProgress2.tag) {
          case 1:
            return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 3:
            return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 26:
          case 27:
          case 5:
            return popHostContext(workInProgress2), null;
          case 31:
            if (null !== workInProgress2.memoizedState) {
              popSuspenseHandler(workInProgress2);
              if (null === workInProgress2.alternate)
                throw Error(formatProdErrorMessage(340));
              resetHydrationState();
            }
            current = workInProgress2.flags;
            return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 13:
            popSuspenseHandler(workInProgress2);
            current = workInProgress2.memoizedState;
            if (null !== current && null !== current.dehydrated) {
              if (null === workInProgress2.alternate)
                throw Error(formatProdErrorMessage(340));
              resetHydrationState();
            }
            current = workInProgress2.flags;
            return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 19:
            return popSuspenseListContext(workInProgress2), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, current = workInProgress2.memoizedState, null !== current && (current.rendering = null, current.tail = null), workInProgress2.flags |= 4, workInProgress2) : null;
          case 4:
            return popHostContainer(), null;
          case 10:
            return popProvider(workInProgress2.type), null;
          case 22:
          case 23:
            return popSuspenseHandler(workInProgress2), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
          case 24:
            return popProvider(CacheContext), null;
          case 25:
            return null;
          default:
            return null;
        }
      }
      function unwindInterruptedWork(current, interruptedWork) {
        popTreeContext(interruptedWork);
        switch (interruptedWork.tag) {
          case 3:
            popProvider(CacheContext);
            popHostContainer();
            break;
          case 26:
          case 27:
          case 5:
            popHostContext(interruptedWork);
            break;
          case 4:
            popHostContainer();
            break;
          case 31:
            null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
            break;
          case 13:
            popSuspenseHandler(interruptedWork);
            break;
          case 19:
            popSuspenseListContext(interruptedWork);
            break;
          case 10:
            popProvider(interruptedWork.type);
            break;
          case 22:
          case 23:
            popSuspenseHandler(interruptedWork);
            popHiddenContext();
            null !== current && pop(resumedCache);
            break;
          case 24:
            popProvider(CacheContext);
        }
      }
      function commitHookEffectListMount(flags, finishedWork) {
        try {
          var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
          if (null !== lastEffect) {
            var firstEffect = lastEffect.next;
            updateQueue = firstEffect;
            do {
              if ((updateQueue.tag & flags) === flags) {
                lastEffect = void 0;
                var create = updateQueue.create, inst = updateQueue.inst;
                lastEffect = create();
                inst.destroy = lastEffect;
              }
              updateQueue = updateQueue.next;
            } while (updateQueue !== firstEffect);
          }
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
        try {
          var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
          if (null !== lastEffect) {
            var firstEffect = lastEffect.next;
            updateQueue = firstEffect;
            do {
              if ((updateQueue.tag & flags) === flags) {
                var inst = updateQueue.inst, destroy = inst.destroy;
                if (void 0 !== destroy) {
                  inst.destroy = void 0;
                  lastEffect = finishedWork;
                  var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
                  try {
                    destroy_();
                  } catch (error) {
                    captureCommitPhaseError(
                      lastEffect,
                      nearestMountedAncestor,
                      error
                    );
                  }
                }
              }
              updateQueue = updateQueue.next;
            } while (updateQueue !== firstEffect);
          }
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      function commitClassCallbacks(finishedWork) {
        var updateQueue = finishedWork.updateQueue;
        if (null !== updateQueue) {
          var instance = finishedWork.stateNode;
          try {
            commitCallbacks(updateQueue, instance);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
      }
      function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
        instance.props = resolveClassComponentProps(
          current.type,
          current.memoizedProps
        );
        instance.state = current.memoizedState;
        try {
          instance.componentWillUnmount();
        } catch (error) {
          captureCommitPhaseError(current, nearestMountedAncestor, error);
        }
      }
      function safelyAttachRef(current, nearestMountedAncestor) {
        try {
          var ref = current.ref;
          if (null !== ref) {
            switch (current.tag) {
              case 26:
              case 27:
              case 5:
                var instanceToUse = current.stateNode;
                break;
              case 30:
                var instance = current.stateNode, name = getViewTransitionName(current.memoizedProps, instance);
                if (null === instance.ref || instance.ref.name !== name)
                  instance.ref = createViewTransitionInstance(name);
                instanceToUse = instance.ref;
                break;
              case 7:
                if (null === current.stateNode) {
                  var fragmentInstance = new FragmentInstance(current);
                  traverseVisibleInstancesAndTextInstances(
                    current.child,
                    false,
                    addFragmentHandleToFiber,
                    fragmentInstance,
                    void 0,
                    void 0
                  );
                  current.stateNode = fragmentInstance;
                }
                instanceToUse = current.stateNode;
                break;
              default:
                instanceToUse = current.stateNode;
            }
            "function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
          }
        } catch (error) {
          captureCommitPhaseError(current, nearestMountedAncestor, error);
        }
      }
      function safelyDetachRef(current, nearestMountedAncestor) {
        var ref = current.ref, refCleanup = current.refCleanup;
        if (null !== ref)
          if ("function" === typeof refCleanup)
            try {
              refCleanup();
            } catch (error) {
              captureCommitPhaseError(current, nearestMountedAncestor, error);
            } finally {
              current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
            }
          else if ("function" === typeof ref)
            try {
              ref(null);
            } catch (error$148) {
              captureCommitPhaseError(current, nearestMountedAncestor, error$148);
            }
          else ref.current = null;
      }
      function commitNewChildToFragmentInstances(fiber, parentFragmentInstances) {
        if ((5 === fiber.tag || 27 === fiber.tag || 6 === fiber.tag) && null === fiber.alternate && null !== parentFragmentInstances)
          for (var i = 0; i < parentFragmentInstances.length; i++)
            commitNewChildToFragmentInstance(
              fiber.stateNode,
              parentFragmentInstances[i]
            );
      }
      function commitFragmentInstanceInsertionEffects(fiber) {
        for (var parent = fiber.return; null !== parent; ) {
          isFragmentInstanceParent(parent) && commitNewChildToFragmentInstance(fiber.stateNode, parent.stateNode);
          if (isFragmentInstanceHostBoundary(parent)) break;
          parent = parent.return;
        }
      }
      function commitFragmentInstanceDeletionEffects(fiber) {
        for (var parent = fiber.return; null !== parent; ) {
          isFragmentInstanceParent(parent) && deleteChildFromFragmentInstance(fiber.stateNode, parent.stateNode);
          if (isFragmentInstanceHostBoundary(parent)) break;
          parent = parent.return;
        }
      }
      function isFragmentInstanceHostBoundary(fiber) {
        return 5 === fiber.tag || 3 === fiber.tag || 27 === fiber.tag;
      }
      function isFragmentInstanceParent(fiber) {
        return fiber && 7 === fiber.tag && null !== fiber.stateNode;
      }
      function commitHostMount(finishedWork) {
        var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
        try {
          a: switch (type) {
            case "button":
            case "input":
            case "select":
            case "textarea":
              props.autoFocus && instance.focus();
              break a;
            case "img":
              props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
          }
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      function commitHostUpdate(finishedWork, newProps, oldProps) {
        try {
          var domElement = finishedWork.stateNode;
          updateProperties(domElement, finishedWork.type, oldProps, newProps);
          domElement[internalPropsKey] = newProps;
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      function isHostParent(fiber) {
        return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
      }
      function getHostSibling(fiber) {
        a: for (; ; ) {
          for (; null === fiber.sibling; ) {
            if (null === fiber.return || isHostParent(fiber.return)) return null;
            fiber = fiber.return;
          }
          fiber.sibling.return = fiber.return;
          for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag; ) {
            if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
            if (fiber.flags & 2) continue a;
            if (null === fiber.child || 4 === fiber.tag) continue a;
            else fiber.child.return = fiber, fiber = fiber.child;
          }
          if (!(fiber.flags & 2)) return fiber.stateNode;
        }
      }
      function insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances) {
        var tag = node.tag;
        if (5 === tag || 6 === tag)
          tag = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(tag, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(tag), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1)), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = true;
        else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode, before = null)), node = node.child, null !== node))
          for (insertOrAppendPlacementNodeIntoContainer(
            node,
            before,
            parent,
            parentFragmentInstances
          ), node = node.sibling; null !== node; )
            insertOrAppendPlacementNodeIntoContainer(
              node,
              before,
              parent,
              parentFragmentInstances
            ), node = node.sibling;
      }
      function insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances) {
        var tag = node.tag;
        if (5 === tag || 6 === tag)
          tag = node.stateNode, before ? parent.insertBefore(tag, before) : parent.appendChild(tag), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = true;
        else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode)), node = node.child, null !== node))
          for (insertOrAppendPlacementNode(
            node,
            before,
            parent,
            parentFragmentInstances
          ), node = node.sibling; null !== node; )
            insertOrAppendPlacementNode(
              node,
              before,
              parent,
              parentFragmentInstances
            ), node = node.sibling;
      }
      function commitHostSingletonAcquisition(finishedWork) {
        var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
        try {
          for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length; )
            singleton.removeAttributeNode(attributes[0]);
          setInitialProperties(singleton, type, props);
          singleton[internalInstanceKey] = finishedWork;
          singleton[internalPropsKey] = props;
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      var shouldStartViewTransition = false;
      var appearingViewTransitions = null;
      function trackEnterViewTransitions(placement) {
        if (30 === placement.tag || 0 !== (placement.subtreeFlags & 33554432))
          shouldStartViewTransition = true;
      }
      var viewTransitionCancelableChildren = null;
      function pushViewTransitionCancelableScope() {
        var prevChildren = viewTransitionCancelableChildren;
        viewTransitionCancelableChildren = null;
        return prevChildren;
      }
      var viewTransitionHostInstanceIdx = 0;
      function applyViewTransitionToHostInstances(fiber, name, className, collectMeasurements, stopAtNestedViewTransitions) {
        viewTransitionHostInstanceIdx = 0;
        return applyViewTransitionToHostInstancesRecursive(
          fiber.child,
          name,
          className,
          collectMeasurements,
          stopAtNestedViewTransitions
        );
      }
      function applyViewTransitionToHostInstancesRecursive(child, name, className, collectMeasurements, stopAtNestedViewTransitions) {
        for (var inViewport = false; null !== child; ) {
          if (5 === child.tag) {
            var instance = child.stateNode;
            if (null !== collectMeasurements) {
              var measurement = measureInstance(instance);
              collectMeasurements.push(measurement);
              measurement.view && (inViewport = true);
            } else
              inViewport || measureInstance(instance).view && (inViewport = true);
            shouldStartViewTransition = true;
            applyViewTransitionName(
              instance,
              0 === viewTransitionHostInstanceIdx ? name : name + "_" + viewTransitionHostInstanceIdx,
              className
            );
            viewTransitionHostInstanceIdx++;
          } else if (22 !== child.tag || null === child.memoizedState)
            30 === child.tag && stopAtNestedViewTransitions || applyViewTransitionToHostInstancesRecursive(
              child.child,
              name,
              className,
              collectMeasurements,
              stopAtNestedViewTransitions
            ) && (inViewport = true);
          child = child.sibling;
        }
        return inViewport;
      }
      function restoreViewTransitionOnHostInstances(child, stopAtNestedViewTransitions) {
        for (; null !== child; ) {
          if (5 === child.tag)
            restoreViewTransitionName(child.stateNode, child.memoizedProps);
          else if (22 !== child.tag || null === child.memoizedState)
            30 === child.tag && stopAtNestedViewTransitions || restoreViewTransitionOnHostInstances(
              child.child,
              stopAtNestedViewTransitions
            );
          child = child.sibling;
        }
      }
      function commitAppearingPairViewTransitions(placement) {
        if (0 !== (placement.subtreeFlags & 18874368))
          for (placement = placement.child; null !== placement; ) {
            if (22 !== placement.tag || null === placement.memoizedState) {
              if (commitAppearingPairViewTransitions(placement), 30 === placement.tag && 0 !== (placement.flags & 18874368) && placement.stateNode.paired) {
                var props = placement.memoizedProps;
                if (null == props.name || "auto" === props.name)
                  throw Error(formatProdErrorMessage(544));
                var name = props.name;
                props = getViewTransitionClassName(props.default, props.share);
                "none" !== props && (applyViewTransitionToHostInstances(
                  placement,
                  name,
                  props,
                  null,
                  false
                ) || restoreViewTransitionOnHostInstances(placement.child, false));
              }
            }
            placement = placement.sibling;
          }
      }
      function commitEnterViewTransitions(placement, gesture) {
        if (30 === placement.tag) {
          var state = placement.stateNode, props = placement.memoizedProps, name = getViewTransitionName(props, state), className = getViewTransitionClassName(
            props.default,
            state.paired ? props.share : props.enter
          );
          "none" !== className ? applyViewTransitionToHostInstances(placement, name, className, null, false) ? (commitAppearingPairViewTransitions(placement), state.paired || gesture || scheduleViewTransitionEvent(placement, props.onEnter)) : restoreViewTransitionOnHostInstances(placement.child, false) : commitAppearingPairViewTransitions(placement);
        } else if (0 !== (placement.subtreeFlags & 33554432))
          for (placement = placement.child; null !== placement; )
            commitEnterViewTransitions(placement, gesture), placement = placement.sibling;
        else commitAppearingPairViewTransitions(placement);
      }
      function commitDeletedPairViewTransitions(deletion) {
        if (null !== appearingViewTransitions && 0 !== appearingViewTransitions.size) {
          var pairs = appearingViewTransitions;
          if (0 !== (deletion.subtreeFlags & 18874368))
            for (deletion = deletion.child; null !== deletion; ) {
              if (22 !== deletion.tag || null === deletion.memoizedState) {
                if (30 === deletion.tag && 0 !== (deletion.flags & 18874368)) {
                  var props = deletion.memoizedProps, name = props.name;
                  if (null != name && "auto" !== name) {
                    var pair = pairs.get(name);
                    if (void 0 !== pair) {
                      var className = getViewTransitionClassName(
                        props.default,
                        props.share
                      );
                      "none" !== className && (applyViewTransitionToHostInstances(
                        deletion,
                        name,
                        className,
                        null,
                        false
                      ) ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, scheduleViewTransitionEvent(deletion, props.onShare)) : restoreViewTransitionOnHostInstances(deletion.child, false));
                      pairs.delete(name);
                      if (0 === pairs.size) break;
                    }
                  }
                }
                commitDeletedPairViewTransitions(deletion);
              }
              deletion = deletion.sibling;
            }
        }
      }
      function commitExitViewTransitions(deletion) {
        if (30 === deletion.tag) {
          var props = deletion.memoizedProps, name = getViewTransitionName(props, deletion.stateNode), pair = null !== appearingViewTransitions ? appearingViewTransitions.get(name) : void 0, className = getViewTransitionClassName(
            props.default,
            void 0 !== pair ? props.share : props.exit
          );
          "none" !== className && (applyViewTransitionToHostInstances(deletion, name, className, null, false) ? void 0 !== pair ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, appearingViewTransitions.delete(name), scheduleViewTransitionEvent(deletion, props.onShare)) : scheduleViewTransitionEvent(deletion, props.onExit) : restoreViewTransitionOnHostInstances(deletion.child, false));
          null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
        } else if (0 !== (deletion.subtreeFlags & 33554432))
          for (deletion = deletion.child; null !== deletion; )
            commitExitViewTransitions(deletion), deletion = deletion.sibling;
        else
          null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
      }
      function commitNestedViewTransitions(changedParent) {
        for (changedParent = changedParent.child; null !== changedParent; ) {
          if (30 === changedParent.tag) {
            var props = changedParent.memoizedProps, name = getViewTransitionName(props, changedParent.stateNode);
            props = getViewTransitionClassName(props.default, props.update);
            changedParent.flags &= -5;
            "none" !== props && applyViewTransitionToHostInstances(
              changedParent,
              name,
              props,
              changedParent.memoizedState = [],
              false
            );
          } else
            0 !== (changedParent.subtreeFlags & 33554432) && commitNestedViewTransitions(changedParent);
          changedParent = changedParent.sibling;
        }
      }
      function restorePairedViewTransitions(parent) {
        if (0 !== (parent.subtreeFlags & 18874368))
          for (parent = parent.child; null !== parent; ) {
            if (22 !== parent.tag || null === parent.memoizedState) {
              if (30 === parent.tag && 0 !== (parent.flags & 18874368)) {
                var instance = parent.stateNode;
                null !== instance.paired && (instance.paired = null, restoreViewTransitionOnHostInstances(parent.child, false));
              }
              restorePairedViewTransitions(parent);
            }
            parent = parent.sibling;
          }
      }
      function restoreEnterOrExitViewTransitions(fiber) {
        if (30 === fiber.tag)
          fiber.stateNode.paired = null, restoreViewTransitionOnHostInstances(fiber.child, false), restorePairedViewTransitions(fiber);
        else if (0 !== (fiber.subtreeFlags & 33554432))
          for (fiber = fiber.child; null !== fiber; )
            restoreEnterOrExitViewTransitions(fiber), fiber = fiber.sibling;
        else restorePairedViewTransitions(fiber);
      }
      function restoreNestedViewTransitions(changedParent) {
        for (changedParent = changedParent.child; null !== changedParent; )
          30 === changedParent.tag ? restoreViewTransitionOnHostInstances(changedParent.child, false) : 0 !== (changedParent.subtreeFlags & 33554432) && restoreNestedViewTransitions(changedParent), changedParent = changedParent.sibling;
      }
      function measureViewTransitionHostInstancesRecursive(parentViewTransition, child, newName, oldName, className, previousMeasurements, stopAtNestedViewTransitions) {
        for (var inViewport = false; null !== child; ) {
          if (5 === child.tag) {
            var instance = child.stateNode;
            if (null !== previousMeasurements && viewTransitionHostInstanceIdx < previousMeasurements.length) {
              var previousMeasurement = previousMeasurements[viewTransitionHostInstanceIdx], nextMeasurement = measureInstance(instance);
              if (previousMeasurement.view || nextMeasurement.view) inViewport = true;
              var JSCompiler_temp;
              if (JSCompiler_temp = 0 === (parentViewTransition.flags & 4))
                if (nextMeasurement.clip) JSCompiler_temp = true;
                else {
                  JSCompiler_temp = previousMeasurement.rect;
                  var newRect = nextMeasurement.rect;
                  JSCompiler_temp = JSCompiler_temp.y !== newRect.y || JSCompiler_temp.x !== newRect.x || JSCompiler_temp.height !== newRect.height || JSCompiler_temp.width !== newRect.width;
                }
              JSCompiler_temp && (parentViewTransition.flags |= 4);
              nextMeasurement.abs ? nextMeasurement = !previousMeasurement.abs : (previousMeasurement = previousMeasurement.rect, nextMeasurement = nextMeasurement.rect, nextMeasurement = previousMeasurement.height !== nextMeasurement.height || previousMeasurement.width !== nextMeasurement.width);
              nextMeasurement && (parentViewTransition.flags |= 32);
            } else parentViewTransition.flags |= 32;
            0 !== (parentViewTransition.flags & 4) && applyViewTransitionName(
              instance,
              0 === viewTransitionHostInstanceIdx ? newName : newName + "_" + viewTransitionHostInstanceIdx,
              className
            );
            inViewport && 0 !== (parentViewTransition.flags & 4) || (null === viewTransitionCancelableChildren && (viewTransitionCancelableChildren = []), viewTransitionCancelableChildren.push(
              instance,
              0 === viewTransitionHostInstanceIdx ? oldName : oldName + "_" + viewTransitionHostInstanceIdx,
              child.memoizedProps
            ));
            viewTransitionHostInstanceIdx++;
          } else if (22 !== child.tag || null === child.memoizedState)
            30 === child.tag && stopAtNestedViewTransitions ? parentViewTransition.flags |= child.flags & 32 : measureViewTransitionHostInstancesRecursive(
              parentViewTransition,
              child.child,
              newName,
              oldName,
              className,
              previousMeasurements,
              stopAtNestedViewTransitions
            ) && (inViewport = true);
          child = child.sibling;
        }
        return inViewport;
      }
      function measureNestedViewTransitions(changedParent, gesture) {
        for (changedParent = changedParent.child; null !== changedParent; ) {
          if (30 === changedParent.tag) {
            var props = changedParent.memoizedProps, state = changedParent.stateNode, name = getViewTransitionName(props, state), className = getViewTransitionClassName(props.default, props.update);
            if (gesture) {
              state = state.clones;
              var previousMeasurements = null === state ? null : state.map(measureClonedInstance);
            } else
              previousMeasurements = changedParent.memoizedState, changedParent.memoizedState = null;
            state = changedParent;
            var child = changedParent.child;
            viewTransitionHostInstanceIdx = 0;
            name = measureViewTransitionHostInstancesRecursive(
              state,
              child,
              name,
              name,
              className,
              previousMeasurements,
              false
            );
            0 !== (changedParent.flags & 4) && name && (gesture || scheduleViewTransitionEvent(changedParent, props.onUpdate));
          } else
            0 !== (changedParent.subtreeFlags & 33554432) && measureNestedViewTransitions(changedParent, gesture);
          changedParent = changedParent.sibling;
        }
      }
      var offscreenSubtreeIsHidden = false;
      var offscreenSubtreeWasHidden = false;
      var offscreenDirectParentIsHidden = false;
      var needsFormReset = false;
      var PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set;
      var nextEffect = null;
      var viewTransitionContextChanged = false;
      var inUpdateViewTransition = false;
      var rootViewTransitionAffected = false;
      var rootViewTransitionNameCanceled = false;
      function commitBeforeMutationEffects(root2, firstChild, committedLanes) {
        root2 = root2.containerInfo;
        eventsEnabled = _enabled;
        root2 = getActiveElementDeep(root2);
        if (hasSelectionCapabilities(root2)) {
          if ("selectionStart" in root2)
            var JSCompiler_temp = {
              start: root2.selectionStart,
              end: root2.selectionEnd
            };
          else
            a: {
              JSCompiler_temp = (JSCompiler_temp = root2.ownerDocument) && JSCompiler_temp.defaultView || window;
              var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
              if (selection && 0 !== selection.rangeCount) {
                JSCompiler_temp = selection.anchorNode;
                var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
                selection = selection.focusOffset;
                try {
                  JSCompiler_temp.nodeType, focusNode.nodeType;
                } catch (e$21) {
                  JSCompiler_temp = null;
                  break a;
                }
                var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root2, parentNode = null;
                b: for (; ; ) {
                  for (var next; ; ) {
                    node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
                    node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
                    3 === node.nodeType && (length += node.nodeValue.length);
                    if (null === (next = node.firstChild)) break;
                    parentNode = node;
                    node = next;
                  }
                  for (; ; ) {
                    if (node === root2) break b;
                    parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
                    parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
                    if (null !== (next = node.nextSibling)) break;
                    node = parentNode;
                    parentNode = node.parentNode;
                  }
                  node = next;
                }
                JSCompiler_temp = -1 === start || -1 === end ? null : { start, end };
              } else JSCompiler_temp = null;
            }
          JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
        } else JSCompiler_temp = null;
        selectionInformation = { focusedElem: root2, selectionRange: JSCompiler_temp };
        _enabled = false;
        committedLanes = (committedLanes & 335544064) === committedLanes;
        nextEffect = firstChild;
        for (firstChild = committedLanes ? 9270 : 1024; null !== nextEffect; ) {
          root2 = nextEffect;
          if (committedLanes && (JSCompiler_temp = root2.deletions, null !== JSCompiler_temp))
            for (anchorOffset = 0; anchorOffset < JSCompiler_temp.length; anchorOffset++)
              committedLanes && commitExitViewTransitions(JSCompiler_temp[anchorOffset]);
          if (null === root2.alternate && 0 !== (root2.flags & 2))
            committedLanes && trackEnterViewTransitions(root2), commitBeforeMutationEffects_complete(committedLanes);
          else {
            if (22 === root2.tag) {
              if (JSCompiler_temp = root2.alternate, null !== root2.memoizedState) {
                null !== JSCompiler_temp && null === JSCompiler_temp.memoizedState && committedLanes && commitExitViewTransitions(JSCompiler_temp);
                commitBeforeMutationEffects_complete(committedLanes);
                continue;
              } else if (null !== JSCompiler_temp && null !== JSCompiler_temp.memoizedState) {
                committedLanes && trackEnterViewTransitions(root2);
                commitBeforeMutationEffects_complete(committedLanes);
                continue;
              }
            }
            JSCompiler_temp = root2.child;
            0 !== (root2.subtreeFlags & firstChild) && null !== JSCompiler_temp ? (JSCompiler_temp.return = root2, nextEffect = JSCompiler_temp) : (committedLanes && commitNestedViewTransitions(root2), commitBeforeMutationEffects_complete(committedLanes));
          }
        }
        appearingViewTransitions = null;
      }
      function commitBeforeMutationEffects_complete(isViewTransitionEligible$jscomp$0) {
        for (; null !== nextEffect; ) {
          var fiber = nextEffect, isViewTransitionEligible = isViewTransitionEligible$jscomp$0, current = fiber.alternate, flags = fiber.flags;
          switch (fiber.tag) {
            case 0:
            case 11:
            case 15:
              break;
            case 1:
              if (0 !== (flags & 1024) && null !== current) {
                isViewTransitionEligible = void 0;
                flags = current.memoizedProps;
                current = current.memoizedState;
                var instance = fiber.stateNode;
                try {
                  var resolvedPrevProps = resolveClassComponentProps(
                    fiber.type,
                    flags
                  );
                  isViewTransitionEligible = instance.getSnapshotBeforeUpdate(
                    resolvedPrevProps,
                    current
                  );
                  instance.__reactInternalSnapshotBeforeUpdate = isViewTransitionEligible;
                } catch (error) {
                  captureCommitPhaseError(fiber, fiber.return, error);
                }
              }
              break;
            case 3:
              if (0 !== (flags & 1024)) {
                if (current = fiber.stateNode.containerInfo, isViewTransitionEligible = current.nodeType, 9 === isViewTransitionEligible)
                  clearContainerSparingly(current);
                else if (1 === isViewTransitionEligible)
                  switch (current.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      clearContainerSparingly(current);
                      break;
                    default:
                      current.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            case 30:
              isViewTransitionEligible && null !== current && (isViewTransitionEligible = getViewTransitionName(
                current.memoizedProps,
                current.stateNode
              ), flags = fiber.memoizedProps, flags = getViewTransitionClassName(flags.default, flags.update), "none" !== flags && applyViewTransitionToHostInstances(
                current,
                isViewTransitionEligible,
                flags,
                current.memoizedState = [],
                true
              ));
              break;
            default:
              if (0 !== (flags & 1024)) throw Error(formatProdErrorMessage(163));
          }
          current = fiber.sibling;
          if (null !== current) {
            current.return = fiber.return;
            nextEffect = current;
            break;
          }
          nextEffect = fiber.return;
        }
      }
      function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
        var flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 15:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            flags & 4 && commitHookEffectListMount(5, finishedWork);
            break;
          case 1:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            if (flags & 4)
              if (finishedRoot = finishedWork.stateNode, null === current)
                try {
                  finishedRoot.componentDidMount();
                } catch (error) {
                  captureCommitPhaseError(finishedWork, finishedWork.return, error);
                }
              else {
                var prevProps = resolveClassComponentProps(
                  finishedWork.type,
                  current.memoizedProps
                );
                current = current.memoizedState;
                try {
                  finishedRoot.componentDidUpdate(
                    prevProps,
                    current,
                    finishedRoot.__reactInternalSnapshotBeforeUpdate
                  );
                } catch (error$146) {
                  captureCommitPhaseError(
                    finishedWork,
                    finishedWork.return,
                    error$146
                  );
                }
              }
            flags & 64 && commitClassCallbacks(finishedWork);
            flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 3:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
              current = null;
              if (null !== finishedWork.child)
                switch (finishedWork.child.tag) {
                  case 27:
                  case 5:
                    current = finishedWork.child.stateNode;
                    break;
                  case 1:
                    current = finishedWork.child.stateNode;
                }
              try {
                commitCallbacks(finishedRoot, current);
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            }
            break;
          case 27:
            null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
          case 26:
          case 5:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            null === current && flags & 4 && commitHostMount(finishedWork);
            flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 12:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            break;
          case 31:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
            break;
          case 13:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
            flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(
              null,
              finishedWork
            ), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
            break;
          case 22:
            flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
            if (!flags) {
              var newOffscreenSubtreeWasHidden = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
              current = offscreenSubtreeIsHidden;
              prevProps = offscreenSubtreeWasHidden;
              offscreenSubtreeIsHidden = flags;
              (offscreenSubtreeWasHidden = newOffscreenSubtreeWasHidden) && !prevProps ? (flags = 2, 0 !== (finishedWork.subtreeFlags & 8772) && (flags |= 1), recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                flags
              )) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
              offscreenSubtreeIsHidden = current;
              offscreenSubtreeWasHidden = prevProps;
            }
            break;
          case 30:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
            flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
            break;
          case 7:
            flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
          default:
            recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        }
      }
      function hideOrUnhideAllChildren(parentFiber, isHidden) {
        for (parentFiber = parentFiber.child; null !== parentFiber; )
          hideOrUnhideAllChildrenOnFiber(parentFiber, isHidden), parentFiber = parentFiber.sibling;
      }
      function hideOrUnhideAllChildrenOnFiber(fiber, isHidden) {
        switch (fiber.tag) {
          case 5:
          case 26:
            try {
              var instance = fiber.stateNode;
              if (isHidden) {
                var style2 = instance.style;
                "function" === typeof style2.setProperty ? style2.setProperty("display", "none", "important") : style2.display = "none";
              } else {
                var instance$jscomp$0 = fiber.stateNode, styleProp = fiber.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
                instance$jscomp$0.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
              }
            } catch (error) {
              captureCommitPhaseError(fiber, fiber.return, error);
            }
            hideOrUnhideNearestPortals(fiber, isHidden);
            break;
          case 6:
            try {
              fiber.stateNode.nodeValue = isHidden ? "" : fiber.memoizedProps, viewTransitionMutationContext = true;
            } catch (error) {
              captureCommitPhaseError(fiber, fiber.return, error);
            }
            break;
          case 18:
            try {
              var instance$jscomp$1 = fiber.stateNode;
              isHidden ? hideOrUnhideDehydratedBoundary(instance$jscomp$1, true) : hideOrUnhideDehydratedBoundary(fiber.stateNode, false);
            } catch (error) {
              captureCommitPhaseError(fiber, fiber.return, error);
            }
            break;
          case 22:
          case 23:
            null === fiber.memoizedState && hideOrUnhideAllChildren(fiber, isHidden);
            break;
          default:
            hideOrUnhideAllChildren(fiber, isHidden);
        }
      }
      function hideOrUnhideNearestPortals(parentFiber, isHidden$jscomp$0) {
        if (parentFiber.subtreeFlags & 67108864)
          for (parentFiber = parentFiber.child; null !== parentFiber; ) {
            a: {
              var fiber = parentFiber, isHidden = isHidden$jscomp$0;
              switch (fiber.tag) {
                case 4:
                  hideOrUnhideAllChildrenOnFiber(fiber, isHidden);
                  break a;
                case 22:
                  null === fiber.memoizedState && hideOrUnhideNearestPortals(fiber, isHidden);
                  break a;
                default:
                  hideOrUnhideNearestPortals(fiber, isHidden);
              }
            }
            parentFiber = parentFiber.sibling;
          }
      }
      function detachFiberAfterEffects(fiber) {
        var alternate = fiber.alternate;
        null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
        fiber.child = null;
        fiber.deletions = null;
        fiber.sibling = null;
        5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
        fiber.stateNode = null;
        fiber.return = null;
        fiber.dependencies = null;
        fiber.memoizedProps = null;
        fiber.memoizedState = null;
        fiber.pendingProps = null;
        fiber.stateNode = null;
        fiber.updateQueue = null;
      }
      var hostParent = null;
      var hostParentIsContainer = false;
      function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
        for (parent = parent.child; null !== parent; )
          commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
      }
      function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
        if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
          try {
            injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
          } catch (err) {
          }
        switch (deletedFiber.tag) {
          case 26:
            offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && !offscreenSubtreeWasHidden && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
            break;
          case 27:
            offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
            commitFragmentInstanceDeletionEffects(deletedFiber);
            var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
            isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            releaseSingletonInstance(
              deletedFiber.stateNode,
              deletedFiber.type,
              deletedFiber.memoizedProps
            );
            hostParent = prevHostParent;
            hostParentIsContainer = prevHostParentIsContainer;
            break;
          case 5:
            offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor), commitFragmentInstanceDeletionEffects(deletedFiber);
          case 6:
            6 === deletedFiber.tag && commitFragmentInstanceDeletionEffects(deletedFiber);
            prevHostParent = hostParent;
            prevHostParentIsContainer = hostParentIsContainer;
            hostParent = null;
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            hostParent = prevHostParent;
            hostParentIsContainer = prevHostParentIsContainer;
            if (null !== hostParent)
              if (hostParentIsContainer)
                try {
                  (9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode), viewTransitionMutationContext = true;
                } catch (error) {
                  captureCommitPhaseError(
                    deletedFiber,
                    nearestMountedAncestor,
                    error
                  );
                }
              else
                try {
                  hostParent.removeChild(deletedFiber.stateNode), viewTransitionMutationContext = true;
                } catch (error) {
                  captureCommitPhaseError(
                    deletedFiber,
                    nearestMountedAncestor,
                    error
                  );
                }
            break;
          case 18:
            null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(
              9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot,
              deletedFiber.stateNode
            ), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
            break;
          case 4:
            prevHostParent = hostParent;
            prevHostParentIsContainer = hostParentIsContainer;
            hostParent = deletedFiber.stateNode.containerInfo;
            hostParentIsContainer = true;
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            hostParent = prevHostParent;
            hostParentIsContainer = prevHostParentIsContainer;
            break;
          case 0:
          case 11:
          case 14:
          case 15:
            commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
            offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            break;
          case 1:
            offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(
              deletedFiber,
              nearestMountedAncestor,
              prevHostParent
            ));
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            break;
          case 21:
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            break;
          case 22:
            offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            offscreenSubtreeWasHidden = prevHostParent;
            break;
          case 30:
            safelyDetachRef(deletedFiber, nearestMountedAncestor);
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            break;
          case 7:
            offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
            break;
          default:
            recursivelyTraverseDeletionEffects(
              finishedRoot,
              nearestMountedAncestor,
              deletedFiber
            );
        }
      }
      function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
        if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
          finishedRoot = finishedRoot.dehydrated;
          try {
            retryIfBlockedOn(finishedRoot);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
      }
      function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
        if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot))))
          try {
            retryIfBlockedOn(finishedRoot);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
      }
      function getRetryCache(finishedWork) {
        switch (finishedWork.tag) {
          case 31:
          case 13:
          case 19:
            var retryCache = finishedWork.stateNode;
            null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
            return retryCache;
          case 22:
            return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
          default:
            throw Error(formatProdErrorMessage(435, finishedWork.tag));
        }
      }
      function attachSuspenseRetryListeners(finishedWork, wakeables) {
        var retryCache = getRetryCache(finishedWork);
        wakeables.forEach(function(wakeable) {
          if (!retryCache.has(wakeable)) {
            retryCache.add(wakeable);
            var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
            wakeable.then(retry, retry);
          }
        });
      }
      function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber, lanes) {
        var deletions = parentFiber.deletions;
        if (null !== deletions)
          for (var i = 0; i < deletions.length; i++) {
            var childToDelete = deletions[i], root2 = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
            a: for (; null !== parent; ) {
              switch (parent.tag) {
                case 27:
                  if (isSingletonScope(parent.type)) {
                    hostParent = parent.stateNode;
                    hostParentIsContainer = false;
                    break a;
                  }
                  break;
                case 5:
                  hostParent = parent.stateNode;
                  hostParentIsContainer = false;
                  break a;
                case 3:
                case 4:
                  hostParent = parent.stateNode.containerInfo;
                  hostParentIsContainer = true;
                  break a;
              }
              parent = parent.return;
            }
            if (null === hostParent) throw Error(formatProdErrorMessage(160));
            commitDeletionEffectsOnFiber(root2, returnFiber, childToDelete);
            hostParent = null;
            hostParentIsContainer = false;
            root2 = childToDelete.alternate;
            null !== root2 && (root2.return = null);
            childToDelete.return = null;
          }
        if (parentFiber.subtreeFlags & 13886)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitMutationEffectsOnFiber(parentFiber, root$jscomp$0, lanes), parentFiber = parentFiber.sibling;
      }
      var currentHoistableRoot = null;
      function commitMutationEffectsOnFiber(finishedWork, root2, lanes) {
        var current = finishedWork.alternate, flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            if (flags & 4 && (current = finishedWork.updateQueue, current = null !== current ? current.events : null, null !== current))
              for (var ii = 0; ii < current.length; ii++) {
                var _eventPayloads$ii2 = current[ii];
                _eventPayloads$ii2.ref.impl = _eventPayloads$ii2.nextImpl;
              }
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
            break;
          case 1:
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (root2 = finishedWork.callbacks, null !== root2 && (lanes = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === lanes ? root2 : lanes.concat(root2))));
            break;
          case 26:
            ii = currentHoistableRoot;
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            if (flags & 4)
              if (flags = null !== current ? current.memoizedState : null, lanes = finishedWork.memoizedState, null === current)
                if (null === lanes)
                  if (null === finishedWork.stateNode)
                    if (offscreenSubtreeIsHidden)
                      finishedWork.stateNode = createHoistableInstance(
                        finishedWork.type,
                        finishedWork.memoizedProps,
                        root2.containerInfo,
                        finishedWork
                      );
                    else {
                      a: {
                        root2 = finishedWork.type;
                        lanes = finishedWork.memoizedProps;
                        flags = ii.ownerDocument || ii;
                        b: switch (root2) {
                          case "title":
                            current = flags.getElementsByTagName("title")[0];
                            if (!current || current[internalHoistableMarker] || current[internalInstanceKey] || "http://www.w3.org/2000/svg" === current.namespaceURI || current.hasAttribute("itemprop"))
                              current = flags.createElement(root2), flags.head.insertBefore(
                                current,
                                flags.querySelector("head > title")
                              );
                            setInitialProperties(current, root2, lanes);
                            current[internalInstanceKey] = finishedWork;
                            markNodeAsHoistable(current);
                            root2 = current;
                            break a;
                          case "link":
                            if (ii = getHydratableHoistableCache(
                              "link",
                              "href",
                              flags
                            ).get(root2 + (lanes.href || ""))) {
                              for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++)
                                if (current = ii[_eventPayloads$ii2], current.getAttribute("href") === (null == lanes.href || "" === lanes.href ? null : lanes.href) && current.getAttribute("rel") === (null == lanes.rel ? null : lanes.rel) && current.getAttribute("title") === (null == lanes.title ? null : lanes.title) && current.getAttribute("crossorigin") === (null == lanes.crossOrigin ? null : lanes.crossOrigin)) {
                                  ii.splice(_eventPayloads$ii2, 1);
                                  break b;
                                }
                            }
                            current = flags.createElement(root2);
                            setInitialProperties(current, root2, lanes);
                            flags.head.appendChild(current);
                            break;
                          case "meta":
                            if (ii = getHydratableHoistableCache(
                              "meta",
                              "content",
                              flags
                            ).get(root2 + (lanes.content || ""))) {
                              for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++)
                                if (current = ii[_eventPayloads$ii2], current.getAttribute("content") === (null == lanes.content ? null : "" + lanes.content) && current.getAttribute("name") === (null == lanes.name ? null : lanes.name) && current.getAttribute("property") === (null == lanes.property ? null : lanes.property) && current.getAttribute("http-equiv") === (null == lanes.httpEquiv ? null : lanes.httpEquiv) && current.getAttribute("charset") === (null == lanes.charSet ? null : lanes.charSet)) {
                                  ii.splice(_eventPayloads$ii2, 1);
                                  break b;
                                }
                            }
                            current = flags.createElement(root2);
                            setInitialProperties(current, root2, lanes);
                            flags.head.appendChild(current);
                            break;
                          default:
                            throw Error(formatProdErrorMessage(468, root2));
                        }
                        current[internalInstanceKey] = finishedWork;
                        markNodeAsHoistable(current);
                        root2 = current;
                      }
                      finishedWork.stateNode = root2;
                    }
                  else
                    offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode);
                else
                  finishedWork.stateNode = acquireResource(
                    ii,
                    lanes,
                    finishedWork.memoizedProps
                  );
              else
                flags !== lanes ? (null === flags ? (root2 = current.stateNode, null === root2 || offscreenSubtreeWasHidden || root2.parentNode.removeChild(root2)) : flags.count--, null === lanes ? offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode) : acquireResource(ii, lanes, finishedWork.memoizedProps)) : null === lanes && null !== finishedWork.stateNode && commitHostUpdate(
                  finishedWork,
                  finishedWork.memoizedProps,
                  current.memoizedProps
                );
            break;
          case 27:
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            null !== current && flags & 4 && commitHostUpdate(
              finishedWork,
              finishedWork.memoizedProps,
              current.memoizedProps
            );
            break;
          case 5:
            ii = offscreenDirectParentIsHidden;
            offscreenDirectParentIsHidden = false;
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            offscreenDirectParentIsHidden = ii;
            commitReconciliationEffects(finishedWork);
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            if (finishedWork.flags & 32) {
              root2 = finishedWork.stateNode;
              try {
                setTextContent(root2, ""), viewTransitionMutationContext = true;
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            }
            flags & 4 && null != finishedWork.stateNode && (root2 = finishedWork.memoizedProps, commitHostUpdate(
              finishedWork,
              root2,
              null !== current ? current.memoizedProps : root2
            ));
            flags & 1024 && (needsFormReset = true);
            break;
          case 6:
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            if (flags & 4) {
              if (null === finishedWork.stateNode)
                throw Error(formatProdErrorMessage(162));
              root2 = finishedWork.memoizedProps;
              lanes = finishedWork.stateNode;
              try {
                lanes.nodeValue = root2, viewTransitionMutationContext = true;
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            }
            break;
          case 3:
            viewTransitionMutationContext = false;
            tagCaches = null;
            ii = currentHoistableRoot;
            currentHoistableRoot = getHoistableRoot(root2.containerInfo);
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            currentHoistableRoot = ii;
            commitReconciliationEffects(finishedWork);
            if (flags & 4 && null !== current && current.memoizedState.isDehydrated)
              try {
                retryIfBlockedOn(root2.containerInfo);
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
            viewTransitionMutationContext = false;
            break;
          case 4:
            flags = offscreenDirectParentIsHidden;
            offscreenDirectParentIsHidden = offscreenSubtreeIsHidden;
            current = pushMutationContext();
            ii = currentHoistableRoot;
            currentHoistableRoot = getHoistableRoot(
              finishedWork.stateNode.containerInfo
            );
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            currentHoistableRoot = ii;
            viewTransitionMutationContext && inUpdateViewTransition && (rootViewTransitionAffected = true);
            viewTransitionMutationContext = current;
            offscreenDirectParentIsHidden = flags;
            break;
          case 12:
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            break;
          case 31:
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            flags & 4 && (root2 = finishedWork.updateQueue, null !== root2 && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root2)));
            break;
          case 13:
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
            flags & 4 && (root2 = finishedWork.updateQueue, null !== root2 && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root2)));
            break;
          case 22:
            ii = null !== finishedWork.memoizedState;
            _eventPayloads$ii2 = null !== current && null !== current.memoizedState;
            var prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden, prevOffscreenDirectParentIsHidden$166 = offscreenDirectParentIsHidden;
            offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || ii;
            offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166 || ii;
            offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || _eventPayloads$ii2;
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
            offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166;
            offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
            commitReconciliationEffects(finishedWork);
            flags & 8192 && (root2 = finishedWork.stateNode, root2._visibility = ii ? root2._visibility & -2 : root2._visibility | 1, !ii || null === current || _eventPayloads$ii2 || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || (root2 = _eventPayloads$ii2 || offscreenSubtreeWasHidden, lanes = offscreenSubtreeIsHidden, current = offscreenSubtreeWasHidden, offscreenSubtreeIsHidden = ii || offscreenSubtreeIsHidden, offscreenSubtreeWasHidden = root2, recursivelyTraverseDisappearLayoutEffects(finishedWork, 2), offscreenSubtreeIsHidden = lanes, offscreenSubtreeWasHidden = current), !ii && offscreenDirectParentIsHidden || hideOrUnhideAllChildren(finishedWork, ii));
            flags & 4 && (root2 = finishedWork.updateQueue, null !== root2 && (lanes = root2.retryQueue, null !== lanes && (root2.retryQueue = null, attachSuspenseRetryListeners(finishedWork, lanes))));
            break;
          case 19:
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            flags & 4 && (root2 = finishedWork.updateQueue, null !== root2 && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root2)));
            break;
          case 30:
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
            flags = pushMutationContext();
            ii = inUpdateViewTransition;
            _eventPayloads$ii2 = (lanes & 335544064) === lanes;
            prevOffscreenSubtreeIsHidden = finishedWork.memoizedProps;
            inUpdateViewTransition = _eventPayloads$ii2 && "none" !== getViewTransitionClassName(
              prevOffscreenSubtreeIsHidden.default,
              prevOffscreenSubtreeIsHidden.update
            );
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes);
            commitReconciliationEffects(finishedWork);
            _eventPayloads$ii2 && null !== current && viewTransitionMutationContext && (finishedWork.flags |= 4);
            inUpdateViewTransition = ii;
            viewTransitionMutationContext = flags;
            break;
          case 21:
            break;
          case 7:
            flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return)), current && null !== current.stateNode && (current.stateNode._fragmentFiber = finishedWork);
          default:
            recursivelyTraverseMutationEffects(root2, finishedWork, lanes), commitReconciliationEffects(finishedWork);
        }
      }
      function commitReconciliationEffects(finishedWork) {
        var flags = finishedWork.flags;
        if (flags & 2) {
          try {
            for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber; ) {
              if (isHostParent(parentFiber)) {
                hostParentFiber = parentFiber;
                break;
              }
              parentFiber = parentFiber.return;
            }
            parentFiber = null;
            for (var parent = finishedWork.return; null !== parent; ) {
              if (isFragmentInstanceParent(parent)) {
                var fragmentInstance = parent.stateNode;
                null === parentFiber ? parentFiber = [fragmentInstance] : parentFiber.push(fragmentInstance);
              }
              if (isFragmentInstanceHostBoundary(parent)) break;
              parent = parent.return;
            }
            var JSCompiler_inline_result = parentFiber;
            if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
            switch (hostParentFiber.tag) {
              case 27:
                var parent$jscomp$0 = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
                insertOrAppendPlacementNode(
                  finishedWork,
                  before,
                  parent$jscomp$0,
                  JSCompiler_inline_result
                );
                break;
              case 5:
                var parent$149 = hostParentFiber.stateNode;
                hostParentFiber.flags & 32 && (setTextContent(parent$149, ""), hostParentFiber.flags &= -33);
                var before$150 = getHostSibling(finishedWork);
                insertOrAppendPlacementNode(
                  finishedWork,
                  before$150,
                  parent$149,
                  JSCompiler_inline_result
                );
                break;
              case 3:
              case 4:
                var parent$151 = hostParentFiber.stateNode.containerInfo, before$152 = getHostSibling(finishedWork);
                insertOrAppendPlacementNodeIntoContainer(
                  finishedWork,
                  before$152,
                  parent$151,
                  JSCompiler_inline_result
                );
                break;
              default:
                throw Error(formatProdErrorMessage(161));
            }
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
          finishedWork.flags &= -3;
        }
        flags & 4096 && (finishedWork.flags &= -4097);
      }
      function recursivelyResetForms(parentFiber) {
        if (parentFiber.subtreeFlags & 1024)
          for (parentFiber = parentFiber.child; null !== parentFiber; ) {
            var fiber = parentFiber;
            recursivelyResetForms(fiber);
            5 === fiber.tag && fiber.flags & 1024 && (fiber = fiber.stateNode, _enabled = true, fiber.reset(), _enabled = false);
            parentFiber = parentFiber.sibling;
          }
      }
      function recursivelyTraverseAfterMutationEffects(root2, parentFiber) {
        if (parentFiber.subtreeFlags & 9270)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitAfterMutationEffectsOnFiber(parentFiber, root2), parentFiber = parentFiber.sibling;
        else measureNestedViewTransitions(parentFiber, false);
      }
      function commitAfterMutationEffectsOnFiber(finishedWork, root2) {
        var current = finishedWork.alternate;
        if (null === current) commitEnterViewTransitions(finishedWork, false);
        else
          switch (finishedWork.tag) {
            case 3:
              rootViewTransitionNameCanceled = viewTransitionContextChanged = false;
              pushViewTransitionCancelableScope();
              recursivelyTraverseAfterMutationEffects(root2, finishedWork);
              if (!viewTransitionContextChanged && !rootViewTransitionAffected) {
                finishedWork = viewTransitionCancelableChildren;
                if (null !== finishedWork)
                  for (var i = 0; i < finishedWork.length; i += 3) {
                    current = finishedWork[i];
                    var oldName = finishedWork[i + 1];
                    restoreViewTransitionName(current, finishedWork[i + 2]);
                    current = current.ownerDocument.documentElement;
                    null !== current && current.animate(
                      { opacity: [0, 0], pointerEvents: ["none", "none"] },
                      {
                        duration: 0,
                        fill: "forwards",
                        pseudoElement: "::view-transition-group(" + oldName + ")"
                      }
                    );
                  }
                finishedWork = root2.containerInfo;
                finishedWork = 9 === finishedWork.nodeType ? finishedWork.documentElement : finishedWork.ownerDocument.documentElement;
                null !== finishedWork && "" === finishedWork.style.viewTransitionName && (finishedWork.style.viewTransitionName = "none", finishedWork.animate(
                  { opacity: [0, 0], pointerEvents: ["none", "none"] },
                  {
                    duration: 0,
                    fill: "forwards",
                    pseudoElement: "::view-transition-group(root)"
                  }
                ), finishedWork.animate(
                  { width: [0, 0], height: [0, 0] },
                  {
                    duration: 0,
                    fill: "forwards",
                    pseudoElement: "::view-transition"
                  }
                ));
                rootViewTransitionNameCanceled = true;
              }
              viewTransitionCancelableChildren = null;
              break;
            case 5:
              recursivelyTraverseAfterMutationEffects(root2, finishedWork);
              break;
            case 4:
              i = viewTransitionContextChanged;
              viewTransitionContextChanged = false;
              recursivelyTraverseAfterMutationEffects(root2, finishedWork);
              viewTransitionContextChanged && (rootViewTransitionAffected = true);
              viewTransitionContextChanged = i;
              break;
            case 22:
              null === finishedWork.memoizedState && (null !== current.memoizedState ? commitEnterViewTransitions(finishedWork, false) : recursivelyTraverseAfterMutationEffects(root2, finishedWork));
              break;
            case 30:
              i = viewTransitionContextChanged;
              oldName = pushViewTransitionCancelableScope();
              viewTransitionContextChanged = false;
              recursivelyTraverseAfterMutationEffects(root2, finishedWork);
              viewTransitionContextChanged && (finishedWork.flags |= 4);
              var props = finishedWork.memoizedProps, state = finishedWork.stateNode;
              root2 = getViewTransitionName(props, state);
              state = getViewTransitionName(current.memoizedProps, state);
              var className = getViewTransitionClassName(props.default, props.update);
              "none" === className ? root2 = false : (props = current.memoizedState, current.memoizedState = null, current = finishedWork.child, viewTransitionHostInstanceIdx = 0, root2 = measureViewTransitionHostInstancesRecursive(
                finishedWork,
                current,
                root2,
                state,
                className,
                props,
                true
              ), viewTransitionHostInstanceIdx !== (null === props ? 0 : props.length) && (finishedWork.flags |= 32));
              0 !== (finishedWork.flags & 4) && root2 ? (scheduleViewTransitionEvent(
                finishedWork,
                finishedWork.memoizedProps.onUpdate
              ), viewTransitionCancelableChildren = oldName) : null !== oldName && (oldName.push.apply(oldName, viewTransitionCancelableChildren), viewTransitionCancelableChildren = oldName);
              viewTransitionContextChanged = 0 !== (finishedWork.flags & 32) ? true : i;
              break;
            default:
              recursivelyTraverseAfterMutationEffects(root2, finishedWork);
          }
      }
      function recursivelyTraverseLayoutEffects(root2, parentFiber) {
        if (parentFiber.subtreeFlags & 8772)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitLayoutEffectOnFiber(root2, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
      }
      function recursivelyTraverseDisappearLayoutEffects(parentFiber, layoutEffectTraversalFlags$jscomp$0) {
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          var finishedWork = parentFiber, layoutEffectTraversalFlags = layoutEffectTraversalFlags$jscomp$0;
          switch (finishedWork.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
              commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
              recursivelyTraverseDisappearLayoutEffects(
                finishedWork,
                layoutEffectTraversalFlags
              );
              break;
            case 1:
              safelyDetachRef(finishedWork, finishedWork.return);
              var instance = finishedWork.stateNode;
              "function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(
                finishedWork,
                finishedWork.return,
                instance
              );
              recursivelyTraverseDisappearLayoutEffects(
                finishedWork,
                layoutEffectTraversalFlags
              );
              break;
            case 27:
              0 !== (layoutEffectTraversalFlags & 2) && releaseSingletonInstance(
                finishedWork.stateNode,
                finishedWork.type,
                finishedWork.memoizedProps
              );
            case 5:
              safelyDetachRef(finishedWork, finishedWork.return);
              5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceDeletionEffects(finishedWork);
              recursivelyTraverseDisappearLayoutEffects(
                finishedWork,
                layoutEffectTraversalFlags
              );
              break;
            case 6:
              commitFragmentInstanceDeletionEffects(finishedWork);
              break;
            case 26:
              safelyDetachRef(finishedWork, finishedWork.return);
              instance = finishedWork.stateNode;
              null !== finishedWork.memoizedState || null === instance || offscreenSubtreeWasHidden || instance.parentNode.removeChild(instance);
              recursivelyTraverseDisappearLayoutEffects(
                finishedWork,
                layoutEffectTraversalFlags
              );
              break;
            case 22:
              null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(
                finishedWork,
                layoutEffectTraversalFlags
              );
              break;
            case 30:
              safelyDetachRef(finishedWork, finishedWork.return);
              recursivelyTraverseDisappearLayoutEffects(
                finishedWork,
                layoutEffectTraversalFlags
              );
              break;
            case 7:
              safelyDetachRef(finishedWork, finishedWork.return);
            default:
              recursivelyTraverseDisappearLayoutEffects(
                finishedWork,
                layoutEffectTraversalFlags
              );
          }
          parentFiber = parentFiber.sibling;
        }
      }
      function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, layoutEffectTraversalFlags) {
        layoutEffectTraversalFlags = 0 !== (parentFiber.subtreeFlags & 8772) ? layoutEffectTraversalFlags : layoutEffectTraversalFlags & -2;
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags, includeWorkInProgressEffects = 0 !== (layoutEffectTraversalFlags & 1);
          switch (finishedWork.tag) {
            case 0:
            case 11:
            case 15:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              commitHookEffectListMount(4, finishedWork);
              break;
            case 1:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              current = finishedWork;
              finishedRoot = current.stateNode;
              if ("function" === typeof finishedRoot.componentDidMount)
                try {
                  finishedRoot.componentDidMount();
                } catch (error) {
                  captureCommitPhaseError(current, current.return, error);
                }
              current = finishedWork;
              finishedRoot = current.updateQueue;
              if (null !== finishedRoot) {
                var instance = current.stateNode;
                try {
                  var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
                  if (null !== hiddenCallbacks)
                    for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++)
                      callCallback(hiddenCallbacks[finishedRoot], instance);
                } catch (error) {
                  captureCommitPhaseError(current, current.return, error);
                }
              }
              includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
              safelyAttachRef(finishedWork, finishedWork.return);
              break;
            case 27:
              0 !== (layoutEffectTraversalFlags & 2) && commitHostSingletonAcquisition(finishedWork);
            case 5:
              5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceInsertionEffects(finishedWork);
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
              safelyAttachRef(finishedWork, finishedWork.return);
              break;
            case 6:
              commitFragmentInstanceInsertionEffects(finishedWork);
              break;
            case 26:
              instance = finishedWork.stateNode;
              null !== finishedWork.memoizedState || null === instance || offscreenSubtreeIsHidden || mountHoistable(
                getHoistableRoot(instance.ownerDocument),
                finishedWork.type,
                instance
              );
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
              safelyAttachRef(finishedWork, finishedWork.return);
              break;
            case 12:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              break;
            case 31:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
              break;
            case 13:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
              break;
            case 22:
              null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              safelyAttachRef(finishedWork, finishedWork.return);
              break;
            case 30:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
              safelyAttachRef(finishedWork, finishedWork.return);
              break;
            case 7:
              safelyAttachRef(finishedWork, finishedWork.return);
            default:
              recursivelyTraverseReappearLayoutEffects(
                finishedRoot,
                finishedWork,
                layoutEffectTraversalFlags
              );
          }
          parentFiber = parentFiber.sibling;
        }
      }
      function commitOffscreenPassiveMountEffects(current, finishedWork) {
        var previousCache = null;
        null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
        current = null;
        null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
        current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
      }
      function commitCachePassiveMountEffect(current, finishedWork) {
        current = null;
        null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
        finishedWork = finishedWork.memoizedState.cache;
        finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
      }
      function recursivelyTraversePassiveMountEffects(root2, parentFiber, committedLanes, committedTransitions) {
        var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
        if (parentFiber.subtreeFlags & (isViewTransitionEligible ? 10262 : 10256))
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitPassiveMountOnFiber(
              root2,
              parentFiber,
              committedLanes,
              committedTransitions
            ), parentFiber = parentFiber.sibling;
        else isViewTransitionEligible && restoreNestedViewTransitions(parentFiber);
      }
      function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
        var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
        isViewTransitionEligible && null === finishedWork.alternate && null !== finishedWork.return && null !== finishedWork.return.alternate && restoreEnterOrExitViewTransitions(finishedWork);
        var flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 15:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            flags & 2048 && commitHookEffectListMount(9, finishedWork);
            break;
          case 1:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            break;
          case 3:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            isViewTransitionEligible && rootViewTransitionNameCanceled && (finishedRoot = finishedRoot.containerInfo, finishedRoot = 9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, "root" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""), finishedRoot = finishedRoot.ownerDocument.documentElement, null !== finishedRoot && "none" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""));
            flags & 2048 && (flags = null, null !== finishedWork.alternate && (flags = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== flags && (finishedWork.refCount++, null != flags && releaseCache(flags)));
            break;
          case 12:
            if (flags & 2048) {
              recursivelyTraversePassiveMountEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions
              );
              flags = finishedWork.stateNode;
              try {
                var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
                "function" === typeof onPostCommit && onPostCommit(
                  id,
                  null === finishedWork.alternate ? "mount" : "update",
                  flags.passiveEffectDuration,
                  -0
                );
              } catch (error) {
                captureCommitPhaseError(finishedWork, finishedWork.return, error);
              }
            } else
              recursivelyTraversePassiveMountEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions
              );
            break;
          case 31:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            break;
          case 13:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            break;
          case 23:
            break;
          case 22:
            _finishedWork$memoize2 = finishedWork.stateNode;
            id = finishedWork.alternate;
            null !== finishedWork.memoizedState ? (isViewTransitionEligible && null !== id && null === id.memoizedState && restoreEnterOrExitViewTransitions(id), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            ) : recursivelyTraverseAtomicPassiveEffects(
              finishedRoot,
              finishedWork
            )) : (isViewTransitionEligible && null !== id && null !== id.memoizedState && restoreEnterOrExitViewTransitions(finishedWork), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            ) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              0 !== (finishedWork.subtreeFlags & 10256) || false
            )));
            flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
            break;
          case 24:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
            break;
          case 30:
            isViewTransitionEligible && (flags = finishedWork.alternate, null !== flags && (restoreViewTransitionOnHostInstances(flags.child, true), restoreViewTransitionOnHostInstances(finishedWork.child, true)));
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
            break;
          default:
            recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            );
        }
      }
      function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
        includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || false);
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
          switch (finishedWork.tag) {
            case 0:
            case 11:
            case 15:
              recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              );
              commitHookEffectListMount(8, finishedWork);
              break;
            case 23:
              break;
            case 22:
              var instance = finishedWork.stateNode;
              null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              ) : recursivelyTraverseAtomicPassiveEffects(
                finishedRoot,
                finishedWork
              ) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              ));
              includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(
                finishedWork.alternate,
                finishedWork
              );
              break;
            case 24:
              recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              );
              includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
              break;
            default:
              recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              );
          }
          parentFiber = parentFiber.sibling;
        }
      }
      function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
        if (parentFiber.subtreeFlags & 10256)
          for (parentFiber = parentFiber.child; null !== parentFiber; ) {
            var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
            switch (finishedWork.tag) {
              case 22:
                recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
                flags & 2048 && commitOffscreenPassiveMountEffects(
                  finishedWork.alternate,
                  finishedWork
                );
                break;
              case 24:
                recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
                flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
                break;
              default:
                recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            }
            parentFiber = parentFiber.sibling;
          }
      }
      var suspenseyCommitFlag = 8192;
      function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
        if (parentFiber.subtreeFlags & suspenseyCommitFlag)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            accumulateSuspenseyCommitOnFiber(
              parentFiber,
              committedLanes,
              suspendedState
            ), parentFiber = parentFiber.sibling;
      }
      function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
        switch (fiber.tag) {
          case 26:
            recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            );
            fiber.flags & suspenseyCommitFlag && (null !== fiber.memoizedState ? suspendResource(
              suspendedState,
              currentHoistableRoot,
              fiber.memoizedState,
              fiber.memoizedProps
            ) : (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber)));
            break;
          case 5:
            recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            );
            fiber.flags & suspenseyCommitFlag && (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber));
            break;
          case 3:
          case 4:
            var previousHoistableRoot = currentHoistableRoot;
            currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
            recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            );
            currentHoistableRoot = previousHoistableRoot;
            break;
          case 22:
            null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            ), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            ));
            break;
          case 30:
            if (0 !== (fiber.flags & suspenseyCommitFlag) && (previousHoistableRoot = fiber.memoizedProps.name, null != previousHoistableRoot && "auto" !== previousHoistableRoot)) {
              var state = fiber.stateNode;
              state.paired = null;
              null === appearingViewTransitions && (appearingViewTransitions = /* @__PURE__ */ new Map());
              appearingViewTransitions.set(previousHoistableRoot, state);
            }
            recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            );
            break;
          default:
            recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            );
        }
      }
      function detachAlternateSiblings(parentFiber) {
        var previousFiber = parentFiber.alternate;
        if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
          previousFiber.child = null;
          do
            previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
          while (null !== parentFiber);
        }
      }
      function recursivelyTraversePassiveUnmountEffects(parentFiber) {
        var deletions = parentFiber.deletions;
        if (0 !== (parentFiber.flags & 16)) {
          if (null !== deletions)
            for (var i = 0; i < deletions.length; i++) {
              var childToDelete = deletions[i];
              nextEffect = childToDelete;
              commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
                childToDelete,
                parentFiber
              );
            }
          detachAlternateSiblings(parentFiber);
        }
        if (parentFiber.subtreeFlags & 10256)
          for (parentFiber = parentFiber.child; null !== parentFiber; )
            commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
      }
      function commitPassiveUnmountOnFiber(finishedWork) {
        switch (finishedWork.tag) {
          case 0:
          case 11:
          case 15:
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
            break;
          case 3:
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            break;
          case 12:
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            break;
          case 22:
            var instance = finishedWork.stateNode;
            null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
            break;
          default:
            recursivelyTraversePassiveUnmountEffects(finishedWork);
        }
      }
      function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
        var deletions = parentFiber.deletions;
        if (0 !== (parentFiber.flags & 16)) {
          if (null !== deletions)
            for (var i = 0; i < deletions.length; i++) {
              var childToDelete = deletions[i];
              nextEffect = childToDelete;
              commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
                childToDelete,
                parentFiber
              );
            }
          detachAlternateSiblings(parentFiber);
        }
        for (parentFiber = parentFiber.child; null !== parentFiber; ) {
          deletions = parentFiber;
          switch (deletions.tag) {
            case 0:
            case 11:
            case 15:
              commitHookEffectListUnmount(8, deletions, deletions.return);
              recursivelyTraverseDisconnectPassiveEffects(deletions);
              break;
            case 22:
              i = deletions.stateNode;
              i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
              break;
            default:
              recursivelyTraverseDisconnectPassiveEffects(deletions);
          }
          parentFiber = parentFiber.sibling;
        }
      }
      function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
        for (; null !== nextEffect; ) {
          var fiber = nextEffect;
          switch (fiber.tag) {
            case 0:
            case 11:
            case 15:
              commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
              break;
            case 23:
            case 22:
              if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
                var cache = fiber.memoizedState.cachePool.pool;
                null != cache && cache.refCount++;
              }
              break;
            case 24:
              releaseCache(fiber.memoizedState.cache);
          }
          cache = fiber.child;
          if (null !== cache) cache.return = fiber, nextEffect = cache;
          else
            a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
              cache = nextEffect;
              var sibling = cache.sibling, returnFiber = cache.return;
              detachFiberAfterEffects(cache);
              if (cache === fiber) {
                nextEffect = null;
                break a;
              }
              if (null !== sibling) {
                sibling.return = returnFiber;
                nextEffect = sibling;
                break a;
              }
              nextEffect = returnFiber;
            }
        }
      }
      var DefaultAsyncDispatcher = {
        getCacheForType: function(resourceType) {
          var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
          void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
          return cacheForType;
        },
        cacheSignal: function() {
          return readContext(CacheContext).controller.signal;
        }
      };
      var PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map;
      var executionContext = 0;
      var workInProgressRoot = null;
      var workInProgress = null;
      var workInProgressRootRenderLanes = 0;
      var workInProgressSuspendedReason = 0;
      var workInProgressThrownValue = null;
      var workInProgressRootDidSkipSuspendedSiblings = false;
      var workInProgressRootIsPrerendering = false;
      var workInProgressRootDidAttachPingListener = false;
      var entangledRenderLanes = 0;
      var workInProgressRootExitStatus = 0;
      var workInProgressRootSkippedLanes = 0;
      var workInProgressRootInterleavedUpdatedLanes = 0;
      var workInProgressRootPingedLanes = 0;
      var workInProgressDeferredLane = 0;
      var workInProgressSuspendedRetryLanes = 0;
      var workInProgressRootConcurrentErrors = null;
      var workInProgressRootRecoverableErrors = null;
      var workInProgressRootDidIncludeRecursiveRenderUpdate = false;
      var globalMostRecentFallbackTime = 0;
      var globalMostRecentTransitionTime = 0;
      var workInProgressRootRenderTargetTime = Infinity;
      var workInProgressTransitions = null;
      var legacyErrorBoundariesThatAlreadyFailed = null;
      var pendingEffectsStatus = 0;
      var pendingEffectsRoot = null;
      var pendingFinishedWork = null;
      var pendingEffectsLanes = 0;
      var pendingEffectsRemainingLanes = 0;
      var pendingPassiveTransitions = null;
      var pendingRecoverableErrors = null;
      var pendingViewTransition = null;
      var pendingViewTransitionEvents = null;
      var pendingTransitionTypes = null;
      var nestedUpdateCount = 0;
      var rootWithNestedUpdates = null;
      function requestUpdateLane() {
        return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
      }
      function requestDeferredLane() {
        if (0 === workInProgressDeferredLane)
          if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
            var lane = nextTransitionDeferredLane;
            nextTransitionDeferredLane <<= 1;
            0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
            workInProgressDeferredLane = lane;
          } else workInProgressDeferredLane = 536870912;
        lane = suspenseHandlerStackCursor.current;
        null !== lane && (lane.flags |= 32);
        return workInProgressDeferredLane;
      }
      function scheduleViewTransitionEvent(fiber, callback) {
        if (null != callback) {
          var state = fiber.stateNode, instance = state.ref;
          null === instance && (instance = state.ref = createViewTransitionInstance(
            getViewTransitionName(fiber.memoizedProps, state)
          ));
          null === pendingViewTransitionEvents && (pendingViewTransitionEvents = []);
          pendingViewTransitionEvents.push(callback.bind(null, instance));
        }
      }
      function scheduleUpdateOnFiber(root2, fiber, lane) {
        if (root2 === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
          prepareFreshStack(root2, 0), markRootSuspended(
            root2,
            workInProgressRootRenderLanes,
            workInProgressDeferredLane,
            false
          );
        markRootUpdated$1(root2, lane);
        if (0 === (executionContext & 2) || root2 !== workInProgressRoot)
          root2 === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(
            root2,
            workInProgressRootRenderLanes,
            workInProgressDeferredLane,
            false
          )), ensureRootIsScheduled(root2);
      }
      function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
        if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
        var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
        do {
          if (0 === exitStatus) {
            workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
            break;
          } else {
            forceSync = root$jscomp$0.current.alternate;
            if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
              exitStatus = renderRootSync(root$jscomp$0, lanes, false);
              renderWasConcurrent = false;
              continue;
            }
            if (2 === exitStatus) {
              renderWasConcurrent = lanes;
              if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
                var JSCompiler_inline_result = 0;
              else
                JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
              if (0 !== JSCompiler_inline_result) {
                lanes = JSCompiler_inline_result;
                a: {
                  var root2 = root$jscomp$0;
                  exitStatus = workInProgressRootConcurrentErrors;
                  var wasRootDehydrated = root2.current.memoizedState.isDehydrated;
                  wasRootDehydrated && (prepareFreshStack(root2, JSCompiler_inline_result).flags |= 256);
                  JSCompiler_inline_result = renderRootSync(
                    root2,
                    JSCompiler_inline_result,
                    false
                  );
                  if (2 !== JSCompiler_inline_result && 6 !== JSCompiler_inline_result) {
                    if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                      root2.errorRecoveryDisabledLanes |= renderWasConcurrent;
                      workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                      exitStatus = 4;
                      break a;
                    }
                    renderWasConcurrent = workInProgressRootRecoverableErrors;
                    workInProgressRootRecoverableErrors = exitStatus;
                    null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(
                      workInProgressRootRecoverableErrors,
                      renderWasConcurrent
                    ));
                  }
                  exitStatus = JSCompiler_inline_result;
                }
                renderWasConcurrent = false;
                if (2 !== exitStatus) continue;
              }
            }
            if (1 === exitStatus) {
              prepareFreshStack(root$jscomp$0, 0);
              markRootSuspended(root$jscomp$0, lanes, 0, true);
              break;
            }
            a: {
              shouldTimeSlice = root$jscomp$0;
              renderWasConcurrent = exitStatus;
              switch (renderWasConcurrent) {
                case 0:
                case 1:
                  throw Error(formatProdErrorMessage(345));
                case 4:
                  if ((lanes & 4194048) !== lanes && (lanes & 62914560) !== lanes)
                    break;
                case 6:
                  markRootSuspended(
                    shouldTimeSlice,
                    lanes,
                    workInProgressDeferredLane,
                    !workInProgressRootDidSkipSuspendedSiblings
                  );
                  break a;
                case 2:
                  workInProgressRootRecoverableErrors = null;
                  break;
                case 3:
                case 5:
                  break;
                default:
                  throw Error(formatProdErrorMessage(329));
              }
              if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
                markRootSuspended(
                  shouldTimeSlice,
                  lanes,
                  workInProgressDeferredLane,
                  !workInProgressRootDidSkipSuspendedSiblings
                );
                if (0 !== getNextLanes(shouldTimeSlice, 0, true)) break a;
                pendingEffectsLanes = lanes;
                shouldTimeSlice.timeoutHandle = scheduleTimeout(
                  completeRootWhenReady.bind(
                    null,
                    shouldTimeSlice,
                    forceSync,
                    workInProgressRootRecoverableErrors,
                    workInProgressTransitions,
                    workInProgressRootDidIncludeRecursiveRenderUpdate,
                    lanes,
                    workInProgressDeferredLane,
                    workInProgressRootInterleavedUpdatedLanes,
                    workInProgressSuspendedRetryLanes,
                    workInProgressRootDidSkipSuspendedSiblings,
                    renderWasConcurrent,
                    "Throttled",
                    -0,
                    0
                  ),
                  exitStatus
                );
                break a;
              }
              completeRootWhenReady(
                shouldTimeSlice,
                forceSync,
                workInProgressRootRecoverableErrors,
                workInProgressTransitions,
                workInProgressRootDidIncludeRecursiveRenderUpdate,
                lanes,
                workInProgressDeferredLane,
                workInProgressRootInterleavedUpdatedLanes,
                workInProgressSuspendedRetryLanes,
                workInProgressRootDidSkipSuspendedSiblings,
                renderWasConcurrent,
                null,
                -0,
                0
              );
            }
          }
          break;
        } while (1);
        ensureRootIsScheduled(root$jscomp$0);
      }
      function completeRootWhenReady(root2, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
        root2.timeoutHandle = -1;
        var subtreeFlags = finishedWork.subtreeFlags, isViewTransitionEligible = (lanes & 335544064) === lanes;
        suspendedCommitReason = null;
        if (isViewTransitionEligible || subtreeFlags & 8192 || 16785408 === (subtreeFlags & 16785408)) {
          if (suspendedCommitReason = {
            stylesheets: null,
            count: 0,
            imgCount: 0,
            imgBytes: 0,
            suspenseyImages: [],
            waitingForImages: true,
            waitingForViewTransition: false,
            unsuspend: noop$1
          }, appearingViewTransitions = null, accumulateSuspenseyCommitOnFiber(
            finishedWork,
            lanes,
            suspendedCommitReason
          ), isViewTransitionEligible && (subtreeFlags = suspendedCommitReason, isViewTransitionEligible = root2.containerInfo, isViewTransitionEligible = (9 === isViewTransitionEligible.nodeType ? isViewTransitionEligible : isViewTransitionEligible.ownerDocument).__reactViewTransition, null != isViewTransitionEligible && (subtreeFlags.count++, subtreeFlags.waitingForViewTransition = true, subtreeFlags = onUnsuspend.bind(subtreeFlags), isViewTransitionEligible.finished.then(subtreeFlags, subtreeFlags))), subtreeFlags = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0, subtreeFlags = waitForCommitToBeReady(
            suspendedCommitReason,
            subtreeFlags
          ), null !== subtreeFlags) {
            pendingEffectsLanes = lanes;
            root2.cancelPendingCommit = subtreeFlags(
              completeRoot.bind(
                null,
                root2,
                finishedWork,
                lanes,
                recoverableErrors,
                transitions,
                didIncludeRenderPhaseUpdate,
                spawnedLane,
                updatedLanes,
                suspendedRetryLanes,
                didSkipSuspendedSiblings,
                exitStatus,
                suspendedCommitReason,
                null,
                completedRenderStartTime,
                completedRenderEndTime
              )
            );
            markRootSuspended(root2, lanes, spawnedLane, !didSkipSuspendedSiblings);
            return;
          }
        }
        completeRoot(
          root2,
          finishedWork,
          lanes,
          recoverableErrors,
          transitions,
          didIncludeRenderPhaseUpdate,
          spawnedLane,
          updatedLanes,
          suspendedRetryLanes,
          didSkipSuspendedSiblings,
          exitStatus,
          suspendedCommitReason
        );
      }
      function isRenderConsistentWithExternalStores(finishedWork) {
        for (var node = finishedWork; ; ) {
          var tag = node.tag;
          if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag)))
            for (var i = 0; i < tag.length; i++) {
              var check = tag[i], getSnapshot = check.getSnapshot;
              check = check.value;
              try {
                if (!objectIs(getSnapshot(), check)) return false;
              } catch (error) {
                return false;
              }
            }
          tag = node.child;
          if (node.subtreeFlags & 16384 && null !== tag)
            tag.return = node, node = tag;
          else {
            if (node === finishedWork) break;
            for (; null === node.sibling; ) {
              if (null === node.return || node.return === finishedWork) return true;
              node = node.return;
            }
            node.sibling.return = node.return;
            node = node.sibling;
          }
        }
        return true;
      }
      function markRootSuspended(root2, suspendedLanes, spawnedLane, didAttemptEntireTree) {
        suspendedLanes = getEntangledLanes(root2, suspendedLanes);
        suspendedLanes &= ~workInProgressRootPingedLanes;
        suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
        root2.suspendedLanes |= suspendedLanes;
        root2.pingedLanes &= ~suspendedLanes;
        didAttemptEntireTree && (root2.warmLanes |= suspendedLanes);
        didAttemptEntireTree = root2.expirationTimes;
        for (var lanes = suspendedLanes; 0 < lanes; ) {
          var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
          didAttemptEntireTree[index$6] = -1;
          lanes &= ~lane;
        }
        0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, suspendedLanes);
      }
      function flushSyncWork$1() {
        return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0, false), false) : true;
      }
      function resetWorkInProgressStack() {
        if (null !== workInProgress) {
          if (0 === workInProgressSuspendedReason)
            var interruptedWork = workInProgress.return;
          else
            interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
          for (; null !== interruptedWork; )
            unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
          workInProgress = null;
        }
      }
      function prepareFreshStack(root2, lanes) {
        var timeoutHandle = root2.timeoutHandle;
        -1 !== timeoutHandle && (root2.timeoutHandle = -1, cancelTimeout(timeoutHandle));
        timeoutHandle = root2.cancelPendingCommit;
        null !== timeoutHandle && (root2.cancelPendingCommit = null, timeoutHandle());
        pendingEffectsLanes = 0;
        resetWorkInProgressStack();
        workInProgressRoot = root2;
        workInProgress = timeoutHandle = createWorkInProgress(root2.current, null);
        workInProgressRootRenderLanes = lanes;
        workInProgressSuspendedReason = 0;
        workInProgressThrownValue = null;
        workInProgressRootDidSkipSuspendedSiblings = false;
        workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root2, lanes);
        workInProgressRootDidAttachPingListener = false;
        workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
        workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
        workInProgressRootDidIncludeRecursiveRenderUpdate = false;
        entangledRenderLanes = getEntangledLanes(root2, lanes);
        finishQueueingConcurrentUpdates();
        return timeoutHandle;
      }
      function handleThrow(root2, thrownValue) {
        currentlyRenderingFiber = null;
        ReactSharedInternals.H = ContextOnlyDispatcher;
        thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
        workInProgressThrownValue = thrownValue;
        null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(
          root2,
          createCapturedValueAtFiber(thrownValue, root2.current)
        ));
      }
      function shouldRemainOnPreviousScreen() {
        var handler = suspenseHandlerStackCursor.current;
        return null === handler ? true : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? true : false : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : false;
      }
      function pushDispatcher() {
        var prevDispatcher = ReactSharedInternals.H;
        ReactSharedInternals.H = ContextOnlyDispatcher;
        return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
      }
      function pushAsyncDispatcher() {
        var prevAsyncDispatcher = ReactSharedInternals.A;
        ReactSharedInternals.A = DefaultAsyncDispatcher;
        return prevAsyncDispatcher;
      }
      function renderDidSuspendDelayIfPossible() {
        workInProgressRootExitStatus = 4;
        workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = true);
        0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(
          workInProgressRoot,
          workInProgressRootRenderLanes,
          workInProgressDeferredLane,
          false
        );
      }
      function renderRootSync(root2, lanes, shouldYieldForPrerendering) {
        var prevExecutionContext = executionContext;
        executionContext |= 2;
        var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
        if (workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes)
          workInProgressTransitions = null, prepareFreshStack(root2, lanes);
        lanes = false;
        var exitStatus = workInProgressRootExitStatus;
        a: do
          try {
            if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
              var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
              switch (workInProgressSuspendedReason) {
                case 8:
                  resetWorkInProgressStack();
                  exitStatus = 6;
                  break a;
                case 3:
                case 2:
                case 9:
                case 6:
                  null === suspenseHandlerStackCursor.current && (lanes = true);
                  var reason = workInProgressSuspendedReason;
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
                  if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
                    exitStatus = 0;
                    break a;
                  }
                  break;
                default:
                  reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
              }
            }
            workLoopSync();
            exitStatus = workInProgressRootExitStatus;
            break;
          } catch (thrownValue$184) {
            handleThrow(root2, thrownValue$184);
          }
        while (1);
        lanes && root2.shellSuspendCounter++;
        lastContextDependency = currentlyRenderingFiber$1 = null;
        executionContext = prevExecutionContext;
        ReactSharedInternals.H = prevDispatcher;
        ReactSharedInternals.A = prevAsyncDispatcher;
        null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
        return exitStatus;
      }
      function workLoopSync() {
        for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
      }
      function renderRootConcurrent(root2, lanes) {
        var prevExecutionContext = executionContext;
        executionContext |= 2;
        var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
        workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root2, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
          root2,
          lanes
        );
        a: do
          try {
            if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
              lanes = workInProgress;
              var thrownValue = workInProgressThrownValue;
              b: switch (workInProgressSuspendedReason) {
                case 1:
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root2, lanes, thrownValue, 1);
                  break;
                case 2:
                case 9:
                  if (isThenableResolved(thrownValue)) {
                    workInProgressSuspendedReason = 0;
                    workInProgressThrownValue = null;
                    replaySuspendedUnitOfWork(lanes);
                    break;
                  }
                  lanes = function() {
                    2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root2 || (workInProgressSuspendedReason = 7);
                    ensureRootIsScheduled(root2);
                  };
                  thrownValue.then(lanes, lanes);
                  break a;
                case 3:
                  workInProgressSuspendedReason = 7;
                  break a;
                case 4:
                  workInProgressSuspendedReason = 5;
                  break a;
                case 7:
                  isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, lanes, thrownValue, 7));
                  break;
                case 5:
                  var resource = null;
                  switch (workInProgress.tag) {
                    case 26:
                      resource = workInProgress.memoizedState;
                    case 5:
                    case 27:
                      var hostFiber = workInProgress;
                      if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
                        workInProgressSuspendedReason = 0;
                        workInProgressThrownValue = null;
                        var sibling = hostFiber.sibling;
                        if (null !== sibling) workInProgress = sibling;
                        else {
                          var returnFiber = hostFiber.return;
                          null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                        }
                        break b;
                      }
                  }
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root2, lanes, thrownValue, 5);
                  break;
                case 6:
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root2, lanes, thrownValue, 6);
                  break;
                case 8:
                  resetWorkInProgressStack();
                  workInProgressRootExitStatus = 6;
                  break a;
                default:
                  throw Error(formatProdErrorMessage(462));
              }
            }
            workLoopConcurrentByScheduler();
            break;
          } catch (thrownValue$186) {
            handleThrow(root2, thrownValue$186);
          }
        while (1);
        lastContextDependency = currentlyRenderingFiber$1 = null;
        ReactSharedInternals.H = prevDispatcher;
        ReactSharedInternals.A = prevAsyncDispatcher;
        executionContext = prevExecutionContext;
        if (null !== workInProgress) return 0;
        workInProgressRoot = null;
        workInProgressRootRenderLanes = 0;
        finishQueueingConcurrentUpdates();
        return workInProgressRootExitStatus;
      }
      function workLoopConcurrentByScheduler() {
        for (; null !== workInProgress && !shouldYield(); )
          performUnitOfWork(workInProgress);
      }
      function performUnitOfWork(unitOfWork) {
        var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
        unitOfWork.memoizedProps = unitOfWork.pendingProps;
        null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
      }
      function replaySuspendedUnitOfWork(unitOfWork) {
        var next = unitOfWork;
        var current = next.alternate;
        switch (next.tag) {
          case 15:
          case 0:
            next = replayFunctionComponent(
              current,
              next,
              next.pendingProps,
              next.type,
              void 0,
              workInProgressRootRenderLanes
            );
            break;
          case 11:
            next = replayFunctionComponent(
              current,
              next,
              next.pendingProps,
              next.type.render,
              next.ref,
              workInProgressRootRenderLanes
            );
            break;
          case 5:
            resetHooksOnUnwind(next);
            var fiber = next;
            fiber === hydrationParentFiber && (isHydrating ? (popToNextHostParent(fiber), 5 === fiber.tag && null != fiber.stateNode && (nextHydratableInstance = fiber.stateNode)) : (popToNextHostParent(fiber), isHydrating = true));
          default:
            unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
        }
        unitOfWork.memoizedProps = unitOfWork.pendingProps;
        null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
      }
      function throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, suspendedReason) {
        lastContextDependency = currentlyRenderingFiber$1 = null;
        resetHooksOnUnwind(unitOfWork);
        thenableState$1 = null;
        thenableIndexCounter$1 = 0;
        var returnFiber = unitOfWork.return;
        try {
          if (throwException(
            root2,
            returnFiber,
            unitOfWork,
            thrownValue,
            workInProgressRootRenderLanes
          )) {
            workInProgressRootExitStatus = 1;
            logUncaughtError(
              root2,
              createCapturedValueAtFiber(thrownValue, root2.current)
            );
            workInProgress = null;
            return;
          }
        } catch (error) {
          if (null !== returnFiber) throw workInProgress = returnFiber, error;
          workInProgressRootExitStatus = 1;
          logUncaughtError(
            root2,
            createCapturedValueAtFiber(thrownValue, root2.current)
          );
          workInProgress = null;
          return;
        }
        if (unitOfWork.flags & 32768) {
          if (isHydrating || 1 === suspendedReason) root2 = true;
          else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912))
            root2 = false;
          else if (workInProgressRootDidSkipSuspendedSiblings = root2 = true, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason)
            suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
          unwindUnitOfWork(unitOfWork, root2);
        } else completeUnitOfWork(unitOfWork);
      }
      function completeUnitOfWork(unitOfWork) {
        var completedWork = unitOfWork;
        do {
          if (0 !== (completedWork.flags & 32768)) {
            unwindUnitOfWork(
              completedWork,
              workInProgressRootDidSkipSuspendedSiblings
            );
            return;
          }
          unitOfWork = completedWork.return;
          var next = completeWork(
            completedWork.alternate,
            completedWork,
            entangledRenderLanes
          );
          if (null !== next) {
            workInProgress = next;
            return;
          }
          completedWork = completedWork.sibling;
          if (null !== completedWork) {
            workInProgress = completedWork;
            return;
          }
          workInProgress = completedWork = unitOfWork;
        } while (null !== completedWork);
        0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
      }
      function unwindUnitOfWork(unitOfWork, skipSiblings) {
        do {
          var next = unwindWork(unitOfWork.alternate, unitOfWork);
          if (null !== next) {
            next.flags &= 32767;
            workInProgress = next;
            return;
          }
          next = unitOfWork.return;
          null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
          if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
            workInProgress = unitOfWork;
            return;
          }
          workInProgress = unitOfWork = next;
        } while (null !== unitOfWork);
        workInProgressRootExitStatus = 6;
        workInProgress = null;
      }
      function completeRoot(root2, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedState) {
        root2.cancelPendingCommit = null;
        do
          flushPendingEffects();
        while (0 !== pendingEffectsStatus);
        if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
        if (null !== finishedWork) {
          if (finishedWork === root2.current) throw Error(formatProdErrorMessage(177));
          root2 === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
          pendingFinishedWork = finishedWork;
          pendingEffectsRoot = root2;
          pendingEffectsLanes = lanes;
          pendingPassiveTransitions = transitions;
          pendingRecoverableErrors = recoverableErrors;
          commitRoot(
            root2,
            finishedWork,
            lanes,
            spawnedLane,
            updatedLanes,
            suspendedRetryLanes,
            suspendedState
          );
        }
      }
      function commitRoot(root2, finishedWork, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedState) {
        var remainingLanes = finishedWork.lanes | finishedWork.childLanes;
        pendingEffectsRemainingLanes = remainingLanes;
        remainingLanes |= concurrentlyUpdatedLanes;
        markRootFinished(
          root2,
          lanes,
          remainingLanes,
          spawnedLane,
          updatedLanes,
          suspendedRetryLanes
        );
        pendingViewTransitionEvents = null;
        (lanes & 335544064) === lanes ? (pendingTransitionTypes = claimQueuedTransitionTypes(root2), spawnedLane = 10262) : (pendingTransitionTypes = null, spawnedLane = 10256);
        0 !== (finishedWork.subtreeFlags & spawnedLane) || 0 !== (finishedWork.flags & spawnedLane) ? (root2.callbackNode = null, root2.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
          flushPassiveEffects();
          return null;
        })) : (root2.callbackNode = null, root2.callbackPriority = 0);
        shouldStartViewTransition = false;
        spawnedLane = 0 !== (finishedWork.flags & 13878);
        if (0 !== (finishedWork.subtreeFlags & 13878) || spawnedLane) {
          spawnedLane = ReactSharedInternals.T;
          ReactSharedInternals.T = null;
          updatedLanes = ReactDOMSharedInternals.p;
          ReactDOMSharedInternals.p = 2;
          suspendedRetryLanes = executionContext;
          executionContext |= 4;
          try {
            commitBeforeMutationEffects(root2, finishedWork, lanes);
          } finally {
            executionContext = suspendedRetryLanes, ReactDOMSharedInternals.p = updatedLanes, ReactSharedInternals.T = spawnedLane;
          }
        }
        pendingEffectsStatus = 1;
        shouldStartViewTransition ? pendingViewTransition = startViewTransition(
          suspendedState,
          root2.containerInfo,
          pendingTransitionTypes,
          flushMutationEffects,
          flushLayoutEffects,
          flushAfterMutationEffects,
          flushSpawnedWork,
          flushPassiveEffects,
          reportViewTransitionError,
          null,
          null
        ) : (flushMutationEffects(), flushLayoutEffects(), flushSpawnedWork());
      }
      function reportViewTransitionError(error) {
        if (0 !== pendingEffectsStatus) {
          var onRecoverableError = pendingEffectsRoot.onRecoverableError;
          onRecoverableError(error, { componentStack: null });
        }
      }
      function flushAfterMutationEffects() {
        3 === pendingEffectsStatus && (pendingEffectsStatus = 0, commitAfterMutationEffectsOnFiber(pendingFinishedWork, pendingEffectsRoot), pendingEffectsStatus = 4);
      }
      function flushMutationEffects() {
        if (1 === pendingEffectsStatus) {
          pendingEffectsStatus = 0;
          var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
          if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
            rootMutationHasEffect = ReactSharedInternals.T;
            ReactSharedInternals.T = null;
            var previousPriority = ReactDOMSharedInternals.p;
            ReactDOMSharedInternals.p = 2;
            var prevExecutionContext = executionContext;
            executionContext |= 4;
            try {
              inUpdateViewTransition = rootViewTransitionAffected = false;
              commitMutationEffectsOnFiber(finishedWork, root2, lanes);
              lanes = selectionInformation;
              var curFocusedElem = getActiveElementDeep(root2.containerInfo), priorFocusedElem = lanes.focusedElem, priorSelectionRange = lanes.selectionRange;
              if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(
                priorFocusedElem.ownerDocument.documentElement,
                priorFocusedElem
              )) {
                if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
                  var start = priorSelectionRange.start, end = priorSelectionRange.end;
                  void 0 === end && (end = start);
                  if ("selectionStart" in priorFocusedElem)
                    priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(
                      end,
                      priorFocusedElem.value.length
                    );
                  else {
                    var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
                    if (win.getSelection) {
                      var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
                      !selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
                      var startMarker = getNodeForCharacterOffset(
                        priorFocusedElem,
                        start$jscomp$0
                      ), endMarker = getNodeForCharacterOffset(
                        priorFocusedElem,
                        end$jscomp$0
                      );
                      if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
                        var range = doc.createRange();
                        range.setStart(startMarker.node, startMarker.offset);
                        selection.removeAllRanges();
                        start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
                      }
                    }
                  }
                }
                doc = [];
                for (selection = priorFocusedElem; selection = selection.parentNode; )
                  1 === selection.nodeType && doc.push({
                    element: selection,
                    left: selection.scrollLeft,
                    top: selection.scrollTop
                  });
                "function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
                for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
                  var info = doc[priorFocusedElem];
                  info.element.scrollLeft = info.left;
                  info.element.scrollTop = info.top;
                }
              }
              _enabled = !!eventsEnabled;
              selectionInformation = eventsEnabled = null;
            } finally {
              executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
            }
          }
          root2.current = finishedWork;
          pendingEffectsStatus = 2;
        }
      }
      function flushLayoutEffects() {
        if (2 === pendingEffectsStatus) {
          pendingEffectsStatus = 0;
          var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
          if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
            rootHasLayoutEffect = ReactSharedInternals.T;
            ReactSharedInternals.T = null;
            var previousPriority = ReactDOMSharedInternals.p;
            ReactDOMSharedInternals.p = 2;
            var prevExecutionContext = executionContext;
            executionContext |= 4;
            try {
              commitLayoutEffectOnFiber(root2, finishedWork.alternate, finishedWork);
            } finally {
              executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
            }
          }
          pendingEffectsStatus = 3;
        }
      }
      function flushSpawnedWork() {
        if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
          pendingEffectsStatus = 0;
          var committedViewTransition = pendingViewTransition;
          pendingViewTransition = null;
          requestPaint();
          var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors, passiveSubtreeMask = (lanes & 335544064) === lanes ? 10262 : 10256;
          0 !== (finishedWork.subtreeFlags & passiveSubtreeMask) || 0 !== (finishedWork.flags & passiveSubtreeMask) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root2, root2.pendingLanes));
          passiveSubtreeMask = root2.pendingLanes;
          0 === passiveSubtreeMask && (legacyErrorBoundariesThatAlreadyFailed = null);
          lanesToEventPriority(lanes);
          finishedWork = finishedWork.stateNode;
          if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
            try {
              injectedHook.onCommitFiberRoot(
                rendererID,
                finishedWork,
                void 0,
                128 === (finishedWork.current.flags & 128)
              );
            } catch (err) {
            }
          if (null !== recoverableErrors) {
            finishedWork = ReactSharedInternals.T;
            passiveSubtreeMask = ReactDOMSharedInternals.p;
            ReactDOMSharedInternals.p = 2;
            ReactSharedInternals.T = null;
            try {
              for (var onRecoverableError = root2.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
                var recoverableError = recoverableErrors[i];
                onRecoverableError(recoverableError.value, {
                  componentStack: recoverableError.stack
                });
              }
            } finally {
              ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = passiveSubtreeMask;
            }
          }
          recoverableErrors = pendingViewTransitionEvents;
          onRecoverableError = pendingTransitionTypes;
          pendingTransitionTypes = null;
          if (null !== recoverableErrors && (pendingViewTransitionEvents = null, null === onRecoverableError && (onRecoverableError = []), null !== committedViewTransition))
            for (recoverableError = 0; recoverableError < recoverableErrors.length; recoverableError++)
              finishedWork = (0, recoverableErrors[recoverableError])(
                onRecoverableError
              ), void 0 !== finishedWork && committedViewTransition.finished.finally(finishedWork);
          0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
          ensureRootIsScheduled(root2);
          passiveSubtreeMask = root2.pendingLanes;
          0 !== (lanes & 261930) && 0 !== (passiveSubtreeMask & 42) ? root2 === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root2) : (nestedUpdateCount = 0, rootWithNestedUpdates = null);
          flushSyncWorkAcrossRoots_impl(0, false);
        }
      }
      function releaseRootPooledCache(root2, remainingLanes) {
        0 === (root2.pooledCacheLanes &= remainingLanes) && (remainingLanes = root2.pooledCache, null != remainingLanes && (root2.pooledCache = null, releaseCache(remainingLanes)));
      }
      function flushPendingEffects() {
        null !== pendingViewTransition && (pendingViewTransition.skipTransition(), pendingViewTransition = null);
        flushMutationEffects();
        flushLayoutEffects();
        flushSpawnedWork();
        return flushPassiveEffects();
      }
      function flushPassiveEffects() {
        if (5 !== pendingEffectsStatus) return false;
        var root2 = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
        pendingEffectsRemainingLanes = 0;
        var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
        try {
          ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
          ReactSharedInternals.T = null;
          renderPriority = pendingPassiveTransitions;
          pendingPassiveTransitions = null;
          var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
          pendingEffectsStatus = 0;
          pendingFinishedWork = pendingEffectsRoot = null;
          pendingEffectsLanes = 0;
          if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
          var prevExecutionContext = executionContext;
          executionContext |= 4;
          commitPassiveUnmountOnFiber(root$jscomp$0.current);
          commitPassiveMountOnFiber(
            root$jscomp$0,
            root$jscomp$0.current,
            lanes,
            renderPriority
          );
          executionContext = prevExecutionContext;
          flushSyncWorkAcrossRoots_impl(0, false);
          if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot)
            try {
              injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
            } catch (err) {
            }
          return true;
        } finally {
          ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root2, remainingLanes);
        }
      }
      function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
        sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
        sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
        rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
        null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
      }
      function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
        if (3 === sourceFiber.tag)
          captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
        else
          for (; null !== nearestMountedAncestor; ) {
            if (3 === nearestMountedAncestor.tag) {
              captureCommitPhaseErrorOnRoot(
                nearestMountedAncestor,
                sourceFiber,
                error
              );
              break;
            } else if (1 === nearestMountedAncestor.tag) {
              var instance = nearestMountedAncestor.stateNode;
              if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
                sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
                error = createClassErrorUpdate(2);
                instance = enqueueUpdate(nearestMountedAncestor, error, 2);
                null !== instance && (initializeClassErrorUpdate(
                  error,
                  instance,
                  nearestMountedAncestor,
                  sourceFiber
                ), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
                break;
              }
            }
            nearestMountedAncestor = nearestMountedAncestor.return;
          }
      }
      function attachPingListener(root2, wakeable, lanes) {
        var pingCache = root2.pingCache;
        if (null === pingCache) {
          pingCache = root2.pingCache = new PossiblyWeakMap();
          var threadIDs = /* @__PURE__ */ new Set();
          pingCache.set(wakeable, threadIDs);
        } else
          threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
        threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root2 = pingSuspendedRoot.bind(null, root2, wakeable, lanes), wakeable.then(root2, root2));
      }
      function pingSuspendedRoot(root2, wakeable, pingedLanes) {
        var pingCache = root2.pingCache;
        null !== pingCache && pingCache.delete(wakeable);
        root2.pingedLanes |= root2.suspendedLanes & pingedLanes;
        root2.warmLanes &= ~pingedLanes;
        workInProgressRoot === root2 && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) ? prepareFreshStack(root2, 0) : workInProgressRootPingedLanes |= pingedLanes : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
        ensureRootIsScheduled(root2);
      }
      function retryTimedOutBoundary(boundaryFiber, retryLane) {
        0 === retryLane && (retryLane = claimNextRetryLane());
        boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
        null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
      }
      function retryDehydratedSuspenseBoundary(boundaryFiber) {
        var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
        null !== suspenseState && (retryLane = suspenseState.retryLane);
        retryTimedOutBoundary(boundaryFiber, retryLane);
      }
      function resolveRetryWakeable(boundaryFiber, wakeable) {
        var retryLane = 0;
        switch (boundaryFiber.tag) {
          case 31:
          case 13:
            var retryCache = boundaryFiber.stateNode;
            var suspenseState = boundaryFiber.memoizedState;
            null !== suspenseState && (retryLane = suspenseState.retryLane);
            break;
          case 19:
            retryCache = boundaryFiber.stateNode;
            break;
          case 22:
            retryCache = boundaryFiber.stateNode._retryCache;
            break;
          default:
            throw Error(formatProdErrorMessage(314));
        }
        null !== retryCache && retryCache.delete(wakeable);
        retryTimedOutBoundary(boundaryFiber, retryLane);
      }
      function scheduleCallback$1(priorityLevel, callback) {
        return scheduleCallback$3(priorityLevel, callback);
      }
      var firstScheduledRoot = null;
      var lastScheduledRoot = null;
      var didScheduleMicrotask = false;
      var mightHavePendingSyncWork = false;
      var isFlushingWork = false;
      var currentEventTransitionLane = 0;
      function ensureRootIsScheduled(root2) {
        root2 !== lastScheduledRoot && null === root2.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root2 : lastScheduledRoot = lastScheduledRoot.next = root2);
        mightHavePendingSyncWork = true;
        didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
      }
      function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
        if (!isFlushingWork && mightHavePendingSyncWork) {
          isFlushingWork = true;
          do {
            var didPerformSomeWork = false;
            for (var root$190 = firstScheduledRoot; null !== root$190; ) {
              if (!onlyLegacy)
                if (0 !== syncTransitionLanes) {
                  var pendingLanes = root$190.pendingLanes;
                  if (0 === pendingLanes) var JSCompiler_inline_result = 0;
                  else {
                    var suspendedLanes = root$190.suspendedLanes, pingedLanes = root$190.pingedLanes;
                    JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
                    JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
                    JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
                  }
                  0 !== JSCompiler_inline_result && (didPerformSomeWork = true, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
                } else
                  JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(
                    root$190,
                    root$190 === workInProgressRoot ? JSCompiler_inline_result : 0,
                    null !== root$190.cancelPendingCommit || -1 !== root$190.timeoutHandle
                  ), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$190, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
              root$190 = root$190.next;
            }
          } while (didPerformSomeWork);
          isFlushingWork = false;
        }
      }
      function processRootScheduleInImmediateTask() {
        processRootScheduleInMicrotask();
      }
      function processRootScheduleInMicrotask() {
        mightHavePendingSyncWork = didScheduleMicrotask = false;
        var syncTransitionLanes = 0;
        0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
        for (var currentTime = now(), prev = null, root2 = firstScheduledRoot; null !== root2; ) {
          var next = root2.next, nextLanes = scheduleTaskForRootDuringMicrotask(root2, currentTime);
          if (0 === nextLanes)
            root2.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
          else if (prev = root2, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
            mightHavePendingSyncWork = true;
          root2 = next;
        }
        0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes, false);
        0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
      }
      function scheduleTaskForRootDuringMicrotask(root2, currentTime) {
        for (var suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes, expirationTimes = root2.expirationTimes, lanes = root2.pendingLanes & -62914561; 0 < lanes; ) {
          var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
          if (-1 === expirationTime) {
            if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
              expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
          } else expirationTime <= currentTime && (root2.expiredLanes |= lane);
          lanes &= ~lane;
        }
        currentTime = workInProgressRoot;
        suspendedLanes = workInProgressRootRenderLanes;
        suspendedLanes = getNextLanes(
          root2,
          root2 === currentTime ? suspendedLanes : 0,
          null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
        );
        pingedLanes = root2.callbackNode;
        if (0 === suspendedLanes || root2 === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
          return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root2.callbackNode = null, root2.callbackPriority = 0;
        if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root2, suspendedLanes)) {
          currentTime = suspendedLanes & -suspendedLanes;
          if (currentTime === root2.callbackPriority) return currentTime;
          null !== pingedLanes && cancelCallback$1(pingedLanes);
          switch (lanesToEventPriority(suspendedLanes)) {
            case 2:
            case 8:
              suspendedLanes = UserBlockingPriority;
              break;
            case 32:
              suspendedLanes = NormalPriority$1;
              break;
            case 268435456:
              suspendedLanes = IdlePriority;
              break;
            default:
              suspendedLanes = NormalPriority$1;
          }
          pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root2);
          suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
          root2.callbackPriority = currentTime;
          root2.callbackNode = suspendedLanes;
          return currentTime;
        }
        null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
        root2.callbackPriority = 2;
        root2.callbackNode = null;
        return 2;
      }
      function performWorkOnRootViaSchedulerTask(root2, didTimeout) {
        if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus)
          return root2.callbackNode = null, root2.callbackPriority = 0, null;
        var originalCallbackNode = root2.callbackNode;
        if (flushPendingEffects() && root2.callbackNode !== originalCallbackNode)
          return null;
        var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
        workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
          root2,
          root2 === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0,
          null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
        );
        if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
        performWorkOnRoot(root2, workInProgressRootRenderLanes$jscomp$0, didTimeout);
        scheduleTaskForRootDuringMicrotask(root2, now());
        return null != root2.callbackNode && root2.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root2) : null;
      }
      function performSyncWorkOnRoot(root2, lanes) {
        if (flushPendingEffects()) return null;
        performWorkOnRoot(root2, lanes, true);
      }
      function scheduleImmediateRootScheduleTask() {
        scheduleMicrotask(function() {
          0 !== (executionContext & 6) ? scheduleCallback$3(
            ImmediatePriority,
            processRootScheduleInImmediateTask
          ) : processRootScheduleInMicrotask();
        });
      }
      function requestTransitionLane() {
        if (0 === currentEventTransitionLane) {
          var actionScopeLane = currentEntangledLane;
          0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
          currentEventTransitionLane = actionScopeLane;
        }
        return currentEventTransitionLane;
      }
      function coerceFormActionProp(actionProp) {
        return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL(actionProp);
      }
      function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
        if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
          var action = coerceFormActionProp(
            (nativeEventTarget[internalPropsKey] || null).action
          ), submitter = nativeEvent.submitter;
          submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
          var event = new SyntheticEvent(
            "action",
            "action",
            null,
            nativeEvent,
            nativeEventTarget
          );
          dispatchQueue.push({
            event,
            listeners: [
              {
                instance: null,
                listener: function() {
                  if (nativeEvent.defaultPrevented) {
                    if (0 !== currentEventTransitionLane) {
                      var formData = new FormData(nativeEventTarget, submitter);
                      startHostTransition(
                        maybeTargetInst,
                        {
                          pending: true,
                          data: formData,
                          method: nativeEventTarget.method,
                          action
                        },
                        null,
                        formData
                      );
                    }
                  } else
                    "function" === typeof action && (event.preventDefault(), formData = new FormData(nativeEventTarget, submitter), startHostTransition(
                      maybeTargetInst,
                      {
                        pending: true,
                        data: formData,
                        method: nativeEventTarget.method,
                        action
                      },
                      action,
                      formData
                    ));
                },
                currentTarget: nativeEventTarget
              }
            ]
          });
        }
      }
      for (i$jscomp$inline_1667 = 0; i$jscomp$inline_1667 < simpleEventPluginEvents.length; i$jscomp$inline_1667++) {
        eventName$jscomp$inline_1668 = simpleEventPluginEvents[i$jscomp$inline_1667], domEventName$jscomp$inline_1669 = eventName$jscomp$inline_1668.toLowerCase(), capitalizedEvent$jscomp$inline_1670 = eventName$jscomp$inline_1668[0].toUpperCase() + eventName$jscomp$inline_1668.slice(1);
        registerSimpleEvent(
          domEventName$jscomp$inline_1669,
          "on" + capitalizedEvent$jscomp$inline_1670
        );
      }
      var eventName$jscomp$inline_1668;
      var domEventName$jscomp$inline_1669;
      var capitalizedEvent$jscomp$inline_1670;
      var i$jscomp$inline_1667;
      registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
      registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
      registerSimpleEvent(ANIMATION_START, "onAnimationStart");
      registerSimpleEvent("dblclick", "onDoubleClick");
      registerSimpleEvent("focusin", "onFocus");
      registerSimpleEvent("focusout", "onBlur");
      registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
      registerSimpleEvent(TRANSITION_START, "onTransitionStart");
      registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
      registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
      registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
      registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
      registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
      registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
      registerTwoPhaseEvent(
        "onChange",
        "change click focusin focusout input keydown keyup selectionchange".split(" ")
      );
      registerTwoPhaseEvent(
        "onSelect",
        "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
          " "
        )
      );
      registerTwoPhaseEvent("onBeforeInput", [
        "compositionend",
        "keypress",
        "textInput",
        "paste"
      ]);
      registerTwoPhaseEvent(
        "onCompositionEnd",
        "compositionend focusout keydown keypress keyup mousedown".split(" ")
      );
      registerTwoPhaseEvent(
        "onCompositionStart",
        "compositionstart focusout keydown keypress keyup mousedown".split(" ")
      );
      registerTwoPhaseEvent(
        "onCompositionUpdate",
        "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
      );
      var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " "
      );
      var nonDelegatedEvents = new Set(
        "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes)
      );
      function processDispatchQueue(dispatchQueue, eventSystemFlags) {
        eventSystemFlags = 0 !== (eventSystemFlags & 4);
        for (var i = 0; i < dispatchQueue.length; i++) {
          var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
          _dispatchQueue$i = _dispatchQueue$i.listeners;
          a: {
            var previousInstance = void 0;
            if (eventSystemFlags)
              for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
                var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
                _dispatchListeners$i = _dispatchListeners$i.listener;
                if (instance !== previousInstance && event.isPropagationStopped())
                  break a;
                previousInstance = _dispatchListeners$i;
                event.currentTarget = currentTarget;
                try {
                  previousInstance(event);
                } catch (error) {
                  reportGlobalError(error);
                }
                event.currentTarget = null;
                previousInstance = instance;
              }
            else
              for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
                _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
                instance = _dispatchListeners$i.instance;
                currentTarget = _dispatchListeners$i.currentTarget;
                _dispatchListeners$i = _dispatchListeners$i.listener;
                if (instance !== previousInstance && event.isPropagationStopped())
                  break a;
                previousInstance = _dispatchListeners$i;
                event.currentTarget = currentTarget;
                try {
                  previousInstance(event);
                } catch (error) {
                  reportGlobalError(error);
                }
                event.currentTarget = null;
                previousInstance = instance;
              }
          }
        }
      }
      function listenToNonDelegatedEvent(domEventName, targetElement) {
        var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
        void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
        var listenerSetKey = domEventName + "__bubble";
        JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
      }
      function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
        var eventSystemFlags = 0;
        isCapturePhaseListener && (eventSystemFlags |= 4);
        addTrappedEventListener(
          target,
          domEventName,
          eventSystemFlags,
          isCapturePhaseListener
        );
      }
      var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
      function listenToAllSupportedEvents(rootContainerElement) {
        if (!rootContainerElement[listeningMarker]) {
          rootContainerElement[listeningMarker] = true;
          allNativeEvents.forEach(function(domEventName) {
            "selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
          });
          var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
          null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
        }
      }
      function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
        switch (getEventPriority(domEventName)) {
          case 2:
            var listenerWrapper = dispatchDiscreteEvent;
            break;
          case 8:
            listenerWrapper = dispatchContinuousEvent;
            break;
          default:
            listenerWrapper = dispatchEvent;
        }
        eventSystemFlags = listenerWrapper.bind(
          null,
          domEventName,
          eventSystemFlags,
          targetContainer
        );
        listenerWrapper = void 0;
        !passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = true);
        isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
          capture: true,
          passive: listenerWrapper
        }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
          passive: listenerWrapper
        }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
      }
      function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
        var ancestorInst = targetInst$jscomp$0;
        if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0)
          a: for (; ; ) {
            if (null === targetInst$jscomp$0) return;
            var nodeTag = targetInst$jscomp$0.tag;
            if (3 === nodeTag || 4 === nodeTag) {
              var container2 = targetInst$jscomp$0.stateNode.containerInfo;
              if (container2 === targetContainer) break;
              if (4 === nodeTag)
                for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag; ) {
                  var grandTag = nodeTag.tag;
                  if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer)
                    return;
                  nodeTag = nodeTag.return;
                }
              for (; null !== container2; ) {
                nodeTag = getClosestInstanceFromNode(container2);
                if (null === nodeTag) return;
                grandTag = nodeTag.tag;
                if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
                  targetInst$jscomp$0 = ancestorInst = nodeTag;
                  continue a;
                }
                container2 = container2.parentNode;
              }
            }
            targetInst$jscomp$0 = targetInst$jscomp$0.return;
          }
        batchedUpdates$1(function() {
          var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
          a: {
            var reactName = topLevelEventsToReactNames.get(domEventName);
            if (void 0 !== reactName) {
              var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
              switch (domEventName) {
                case "keypress":
                  if (0 === getEventCharCode(nativeEvent)) break a;
                case "keydown":
                case "keyup":
                  SyntheticEventCtor = SyntheticKeyboardEvent;
                  break;
                case "focusin":
                  reactEventType = "focus";
                  SyntheticEventCtor = SyntheticFocusEvent;
                  break;
                case "focusout":
                  reactEventType = "blur";
                  SyntheticEventCtor = SyntheticFocusEvent;
                  break;
                case "beforeblur":
                case "afterblur":
                  SyntheticEventCtor = SyntheticFocusEvent;
                  break;
                case "click":
                  if (2 === nativeEvent.button) break a;
                case "auxclick":
                case "dblclick":
                case "mousedown":
                case "mousemove":
                case "mouseup":
                case "mouseout":
                case "mouseover":
                case "contextmenu":
                  SyntheticEventCtor = SyntheticMouseEvent;
                  break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                  SyntheticEventCtor = SyntheticDragEvent;
                  break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                  SyntheticEventCtor = SyntheticTouchEvent;
                  break;
                case ANIMATION_END:
                case ANIMATION_ITERATION:
                case ANIMATION_START:
                  SyntheticEventCtor = SyntheticAnimationEvent;
                  break;
                case TRANSITION_END:
                  SyntheticEventCtor = SyntheticTransitionEvent;
                  break;
                case "scroll":
                case "scrollend":
                  SyntheticEventCtor = SyntheticUIEvent;
                  break;
                case "wheel":
                  SyntheticEventCtor = SyntheticWheelEvent;
                  break;
                case "copy":
                case "cut":
                case "paste":
                  SyntheticEventCtor = SyntheticClipboardEvent;
                  break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                  SyntheticEventCtor = SyntheticPointerEvent;
                  break;
                case "submit":
                  SyntheticEventCtor = SyntheticSubmitEvent;
                  break;
                case "toggle":
                case "beforetoggle":
                  SyntheticEventCtor = SyntheticToggleEvent;
              }
              var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
              inCapturePhase = [];
              for (var instance = targetInst, lastHostComponent; null !== instance; ) {
                var _instance = instance;
                lastHostComponent = _instance.stateNode;
                _instance = _instance.tag;
                5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(
                  createDispatchListener(instance, _instance, lastHostComponent)
                ));
                if (accumulateTargetOnly) break;
                instance = instance.return;
              }
              0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(
                reactName,
                reactEventType,
                null,
                nativeEvent,
                nativeEventTarget
              ), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
            }
          }
          if (0 === (eventSystemFlags & 7)) {
            a: {
              SyntheticEventCtor = "mouseover" === domEventName || "pointerover" === domEventName;
              reactName = "mouseout" === domEventName || "pointerout" === domEventName;
              if (SyntheticEventCtor && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
                break a;
              if (reactName || SyntheticEventCtor) {
                reactEventType = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (SyntheticEventCtor = nativeEventTarget.ownerDocument) ? SyntheticEventCtor.defaultView || SyntheticEventCtor.parentWindow : window;
                if (reactName) {
                  if (SyntheticEventCtor = nativeEvent.relatedTarget || nativeEvent.toElement, reactName = targetInst, SyntheticEventCtor = SyntheticEventCtor ? getClosestInstanceFromNode(SyntheticEventCtor) : null, null !== SyntheticEventCtor && (accumulateTargetOnly = getNearestMountedFiber(SyntheticEventCtor), inCapturePhase = SyntheticEventCtor.tag, SyntheticEventCtor !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase))
                    SyntheticEventCtor = null;
                } else reactName = null, SyntheticEventCtor = targetInst;
                if (reactName !== SyntheticEventCtor) {
                  inCapturePhase = SyntheticMouseEvent;
                  _instance = "onMouseLeave";
                  reactEventName = "onMouseEnter";
                  instance = "mouse";
                  if ("pointerout" === domEventName || "pointerover" === domEventName)
                    inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
                  accumulateTargetOnly = null == reactName ? reactEventType : getNodeFromInstance(reactName);
                  lastHostComponent = null == SyntheticEventCtor ? reactEventType : getNodeFromInstance(SyntheticEventCtor);
                  reactEventType = new inCapturePhase(
                    _instance,
                    instance + "leave",
                    reactName,
                    nativeEvent,
                    nativeEventTarget
                  );
                  reactEventType.target = accumulateTargetOnly;
                  reactEventType.relatedTarget = lastHostComponent;
                  _instance = null;
                  getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(
                    reactEventName,
                    instance + "enter",
                    SyntheticEventCtor,
                    nativeEvent,
                    nativeEventTarget
                  ), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
                  accumulateTargetOnly = _instance;
                  inCapturePhase = reactName && SyntheticEventCtor ? getLowestCommonAncestor(
                    reactName,
                    SyntheticEventCtor,
                    getParent
                  ) : null;
                  null !== reactName && accumulateEnterLeaveListenersForEvent(
                    dispatchQueue,
                    reactEventType,
                    reactName,
                    inCapturePhase,
                    false
                  );
                  null !== SyntheticEventCtor && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(
                    dispatchQueue,
                    accumulateTargetOnly,
                    SyntheticEventCtor,
                    inCapturePhase,
                    true
                  );
                }
              }
            }
            a: {
              reactName = targetInst ? getNodeFromInstance(targetInst) : window;
              SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
              if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type)
                var getTargetInstFunc = getTargetInstForChangeEvent;
              else if (isTextInputElement(reactName))
                if (isInputEventSupported)
                  getTargetInstFunc = getTargetInstForInputOrChangeEvent;
                else {
                  getTargetInstFunc = getTargetInstForInputEventPolyfill;
                  var handleEventFunc = handleEventsForInputEventPolyfill;
                }
              else
                SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
              if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
                createAndAccumulateChangeEvent(
                  dispatchQueue,
                  getTargetInstFunc,
                  nativeEvent,
                  nativeEventTarget
                );
                break a;
              }
              handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
            }
            handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
            switch (domEventName) {
              case "focusin":
                if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable)
                  activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
                break;
              case "focusout":
                lastSelection = activeElementInst = activeElement = null;
                break;
              case "mousedown":
                mouseDown = true;
                break;
              case "contextmenu":
              case "mouseup":
              case "dragend":
                mouseDown = false;
                constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
                break;
              case "selectionchange":
                if (skipSelectionChangeEvent) break;
              case "keydown":
              case "keyup":
                constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
            }
            var fallbackData;
            if (canUseCompositionEvent)
              b: {
                switch (domEventName) {
                  case "compositionstart":
                    var eventType = "onCompositionStart";
                    break b;
                  case "compositionend":
                    eventType = "onCompositionEnd";
                    break b;
                  case "compositionupdate":
                    eventType = "onCompositionUpdate";
                    break b;
                }
                eventType = void 0;
              }
            else
              isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
            eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(
              eventType,
              domEventName,
              null,
              nativeEvent,
              nativeEventTarget
            ), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
            if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
              eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent(
                "onBeforeInput",
                "beforeinput",
                null,
                nativeEvent,
                nativeEventTarget
              ), dispatchQueue.push({
                event: handleEventFunc,
                listeners: eventType
              }), handleEventFunc.data = fallbackData);
            extractEvents$1(
              dispatchQueue,
              domEventName,
              targetInst,
              nativeEvent,
              nativeEventTarget
            );
          }
          processDispatchQueue(dispatchQueue, eventSystemFlags);
        });
      }
      function createDispatchListener(instance, listener, currentTarget) {
        return {
          instance,
          listener,
          currentTarget
        };
      }
      function accumulateTwoPhaseListeners(targetFiber, reactName) {
        for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber; ) {
          var _instance2 = targetFiber, stateNode = _instance2.stateNode;
          _instance2 = _instance2.tag;
          5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(
            createDispatchListener(targetFiber, _instance2, stateNode)
          ), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(
            createDispatchListener(targetFiber, _instance2, stateNode)
          ));
          if (3 === targetFiber.tag) return listeners;
          targetFiber = targetFiber.return;
        }
        return [];
      }
      function getParent(inst) {
        if (null === inst) return null;
        do
          inst = inst.return;
        while (inst && 5 !== inst.tag && 27 !== inst.tag);
        return inst ? inst : null;
      }
      function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
        for (var registrationName = event._reactName, listeners = []; null !== target && target !== common; ) {
          var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
          _instance3 = _instance3.tag;
          if (null !== alternate && alternate === common) break;
          5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(
            createDispatchListener(target, stateNode, alternate)
          )) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(
            createDispatchListener(target, stateNode, alternate)
          )));
          target = target.return;
        }
        0 !== listeners.length && dispatchQueue.push({ event, listeners });
      }
      var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
      var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
      function normalizeMarkupForTextOrAttribute(markup) {
        return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
      }
      function checkForUnmatchedText(serverText, clientText) {
        clientText = normalizeMarkupForTextOrAttribute(clientText);
        return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
      }
      function setProp(domElement, tag, key, value, props, prevValue) {
        switch (key) {
          case "children":
            if ("string" === typeof value)
              "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value);
            else if ("number" === typeof value || "bigint" === typeof value)
              "body" !== tag && setTextContent(domElement, "" + value);
            else return;
            break;
          case "className":
            setValueForKnownAttribute(domElement, "class", value);
            break;
          case "tabIndex":
            setValueForKnownAttribute(domElement, "tabindex", value);
            break;
          case "dir":
          case "role":
          case "viewBox":
          case "width":
          case "height":
            setValueForKnownAttribute(domElement, key, value);
            break;
          case "style":
            setValueForStyles(domElement, value, prevValue);
            return;
          case "data":
            if ("object" !== tag) {
              setValueForKnownAttribute(domElement, "data", value);
              break;
            }
          case "src":
          case "href":
            if ("" === value && ("a" !== tag || "href" !== key)) {
              domElement.removeAttribute(key);
              break;
            }
            if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
              domElement.removeAttribute(key);
              break;
            }
            value = sanitizeURL(value);
            domElement.setAttribute(key, value);
            break;
          case "action":
          case "formAction":
            if ("function" === typeof value) {
              domElement.setAttribute(
                key,
                "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
              );
              break;
            } else
              "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(
                domElement,
                tag,
                "formEncType",
                props.formEncType,
                props,
                null
              ), setProp(
                domElement,
                tag,
                "formMethod",
                props.formMethod,
                props,
                null
              ), setProp(
                domElement,
                tag,
                "formTarget",
                props.formTarget,
                props,
                null
              )) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
            if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
              domElement.removeAttribute(key);
              break;
            }
            value = sanitizeURL(value);
            domElement.setAttribute(key, value);
            break;
          case "onClick":
            null != value && (domElement.onclick = noop$1);
            return;
          case "onScroll":
            null != value && listenToNonDelegatedEvent("scroll", domElement);
            return;
          case "onScrollEnd":
            null != value && listenToNonDelegatedEvent("scrollend", domElement);
            return;
          case "dangerouslySetInnerHTML":
            if (null != value) {
              if ("object" !== typeof value || !("__html" in value))
                throw Error(formatProdErrorMessage(61));
              key = value.__html;
              if (null != key) {
                if (null != props.children) throw Error(formatProdErrorMessage(60));
                (null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
              }
            }
            break;
          case "multiple":
            domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
            break;
          case "muted":
            domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
            break;
          case "suppressContentEditableWarning":
          case "suppressHydrationWarning":
          case "defaultValue":
          case "defaultChecked":
          case "innerHTML":
          case "ref":
            break;
          case "autoFocus":
            break;
          case "xlinkHref":
            if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
              domElement.removeAttribute("xlink:href");
              break;
            }
            key = sanitizeURL(value);
            domElement.setAttributeNS(
              "http://www.w3.org/1999/xlink",
              "xlink:href",
              key
            );
            break;
          case "contentEditable":
          case "spellCheck":
          case "draggable":
          case "value":
          case "autoReverse":
          case "externalResourcesRequired":
          case "focusable":
          case "preserveAlpha":
            null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
            break;
          case "inert":
          case "allowFullScreen":
          case "async":
          case "autoPlay":
          case "controls":
          case "credentialless":
          case "default":
          case "defer":
          case "disabled":
          case "disablePictureInPicture":
          case "disableRemotePlayback":
          case "formNoValidate":
          case "hidden":
          case "loop":
          case "noModule":
          case "noValidate":
          case "open":
          case "playsInline":
          case "readOnly":
          case "required":
          case "reversed":
          case "scoped":
          case "seamless":
          case "itemScope":
            value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
            break;
          case "capture":
          case "download":
            true === value ? domElement.setAttribute(key, "") : false !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
            break;
          case "cols":
          case "rows":
          case "size":
          case "span":
            null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
            break;
          case "rowSpan":
          case "start":
            null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
            break;
          case "popover":
            listenToNonDelegatedEvent("beforetoggle", domElement);
            listenToNonDelegatedEvent("toggle", domElement);
            setValueForAttribute(domElement, "popover", value);
            break;
          case "xlinkActuate":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:actuate",
              value
            );
            break;
          case "xlinkArcrole":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:arcrole",
              value
            );
            break;
          case "xlinkRole":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:role",
              value
            );
            break;
          case "xlinkShow":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:show",
              value
            );
            break;
          case "xlinkTitle":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:title",
              value
            );
            break;
          case "xlinkType":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/1999/xlink",
              "xlink:type",
              value
            );
            break;
          case "xmlBase":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/XML/1998/namespace",
              "xml:base",
              value
            );
            break;
          case "xmlLang":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/XML/1998/namespace",
              "xml:lang",
              value
            );
            break;
          case "xmlSpace":
            setValueForNamespacedAttribute(
              domElement,
              "http://www.w3.org/XML/1998/namespace",
              "xml:space",
              value
            );
            break;
          case "is":
            setValueForAttribute(domElement, "is", value);
            break;
          case "innerText":
          case "textContent":
            return;
          default:
            if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1])
              key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
            else return;
        }
        viewTransitionMutationContext = true;
      }
      function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
        switch (key) {
          case "style":
            setValueForStyles(domElement, value, prevValue);
            return;
          case "dangerouslySetInnerHTML":
            if (null != value) {
              if ("object" !== typeof value || !("__html" in value))
                throw Error(formatProdErrorMessage(61));
              key = value.__html;
              if (null != key) {
                if (null != props.children) throw Error(formatProdErrorMessage(60));
                (null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
              }
            }
            break;
          case "children":
            if ("string" === typeof value) setTextContent(domElement, value);
            else if ("number" === typeof value || "bigint" === typeof value)
              setTextContent(domElement, "" + value);
            else return;
            break;
          case "onScroll":
            null != value && listenToNonDelegatedEvent("scroll", domElement);
            return;
          case "onScrollEnd":
            null != value && listenToNonDelegatedEvent("scrollend", domElement);
            return;
          case "onClick":
            null != value && (domElement.onclick = noop$1);
            return;
          case "suppressContentEditableWarning":
          case "suppressHydrationWarning":
          case "innerHTML":
          case "ref":
            return;
          case "innerText":
          case "textContent":
            return;
          default:
            if (!registrationNameDependencies.hasOwnProperty(key))
              a: {
                if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), prevValue = key.slice(2, props ? key.length - 7 : void 0), tag = domElement[internalPropsKey] || null, tag = null != tag ? tag[key] : null, "function" === typeof tag && domElement.removeEventListener(prevValue, tag, props), "function" === typeof value)) {
                  "function" !== typeof tag && null !== tag && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
                  domElement.addEventListener(prevValue, value, props);
                  break a;
                }
                viewTransitionMutationContext = true;
                key in domElement ? domElement[key] = value : true === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
              }
            return;
        }
        viewTransitionMutationContext = true;
      }
      function setInitialProperties(domElement, tag, props) {
        switch (tag) {
          case "div":
          case "span":
          case "svg":
          case "path":
          case "a":
          case "g":
          case "p":
          case "li":
            break;
          case "img":
            listenToNonDelegatedEvent("error", domElement);
            listenToNonDelegatedEvent("load", domElement);
            var hasSrc = false, hasSrcSet = false, propKey;
            for (propKey in props)
              if (props.hasOwnProperty(propKey)) {
                var propValue = props[propKey];
                if (null != propValue)
                  switch (propKey) {
                    case "src":
                      hasSrc = true;
                      break;
                    case "srcSet":
                      hasSrcSet = true;
                      break;
                    case "children":
                    case "dangerouslySetInnerHTML":
                      throw Error(formatProdErrorMessage(137, tag));
                    default:
                      setProp(domElement, tag, propKey, propValue, props, null);
                  }
              }
            hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
            hasSrc && setProp(domElement, tag, "src", props.src, props, null);
            return;
          case "input":
            listenToNonDelegatedEvent("invalid", domElement);
            var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
            for (hasSrc in props)
              if (props.hasOwnProperty(hasSrc)) {
                var propValue$204 = props[hasSrc];
                if (null != propValue$204)
                  switch (hasSrc) {
                    case "name":
                      hasSrcSet = propValue$204;
                      break;
                    case "type":
                      propValue = propValue$204;
                      break;
                    case "checked":
                      checked = propValue$204;
                      break;
                    case "defaultChecked":
                      defaultChecked = propValue$204;
                      break;
                    case "value":
                      propKey = propValue$204;
                      break;
                    case "defaultValue":
                      defaultValue = propValue$204;
                      break;
                    case "children":
                    case "dangerouslySetInnerHTML":
                      if (null != propValue$204)
                        throw Error(formatProdErrorMessage(137, tag));
                      break;
                    default:
                      setProp(domElement, tag, hasSrc, propValue$204, props, null);
                  }
              }
            initInput(
              domElement,
              propKey,
              defaultValue,
              checked,
              defaultChecked,
              propValue,
              hasSrcSet,
              false
            );
            return;
          case "select":
            listenToNonDelegatedEvent("invalid", domElement);
            hasSrc = propValue = propKey = null;
            for (hasSrcSet in props)
              if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue))
                switch (hasSrcSet) {
                  case "value":
                    propKey = defaultValue;
                    break;
                  case "defaultValue":
                    propValue = defaultValue;
                    break;
                  case "multiple":
                    hasSrc = defaultValue;
                  default:
                    setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
                }
            tag = propKey;
            props = propValue;
            domElement.multiple = !!hasSrc;
            null != tag ? updateOptions(domElement, !!hasSrc, tag, false) : null != props && updateOptions(domElement, !!hasSrc, props, true);
            return;
          case "textarea":
            listenToNonDelegatedEvent("invalid", domElement);
            propKey = hasSrcSet = hasSrc = null;
            for (propValue in props)
              if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue))
                switch (propValue) {
                  case "value":
                    hasSrc = defaultValue;
                    break;
                  case "defaultValue":
                    hasSrcSet = defaultValue;
                    break;
                  case "children":
                    propKey = defaultValue;
                    break;
                  case "dangerouslySetInnerHTML":
                    if (null != defaultValue) throw Error(formatProdErrorMessage(91));
                    break;
                  default:
                    setProp(domElement, tag, propValue, defaultValue, props, null);
                }
            initTextarea(domElement, hasSrc, hasSrcSet, propKey);
            return;
          case "option":
            for (checked in props)
              if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc))
                switch (checked) {
                  case "selected":
                    domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
                    break;
                  default:
                    setProp(domElement, tag, checked, hasSrc, props, null);
                }
            return;
          case "dialog":
            listenToNonDelegatedEvent("beforetoggle", domElement);
            listenToNonDelegatedEvent("toggle", domElement);
            listenToNonDelegatedEvent("cancel", domElement);
            listenToNonDelegatedEvent("close", domElement);
            break;
          case "iframe":
          case "object":
            listenToNonDelegatedEvent("load", domElement);
            break;
          case "video":
          case "audio":
            for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++)
              listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
            break;
          case "image":
            listenToNonDelegatedEvent("error", domElement);
            listenToNonDelegatedEvent("load", domElement);
            break;
          case "details":
            listenToNonDelegatedEvent("toggle", domElement);
            break;
          case "embed":
          case "source":
          case "link":
            listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
          case "area":
          case "base":
          case "br":
          case "col":
          case "hr":
          case "keygen":
          case "meta":
          case "param":
          case "track":
          case "wbr":
          case "menuitem":
            for (defaultChecked in props)
              if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc))
                switch (defaultChecked) {
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(formatProdErrorMessage(137, tag));
                  default:
                    setProp(domElement, tag, defaultChecked, hasSrc, props, null);
                }
            return;
          default:
            if (isCustomElement(tag)) {
              for (propValue$204 in props)
                props.hasOwnProperty(propValue$204) && (hasSrc = props[propValue$204], void 0 !== hasSrc && setPropOnCustomElement(
                  domElement,
                  tag,
                  propValue$204,
                  hasSrc,
                  props,
                  void 0
                ));
              return;
            }
        }
        for (defaultValue in props)
          props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
      }
      var emptyProps = {};
      function updateProperties(domElement, tag, lastProps, nextProps) {
        switch (tag) {
          case "div":
          case "span":
          case "svg":
          case "path":
          case "a":
          case "g":
          case "p":
          case "li":
            break;
          case "input":
            var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
            for (propKey in lastProps) {
              var lastProp = lastProps[propKey];
              if (lastProps.hasOwnProperty(propKey) && null != lastProp)
                switch (propKey) {
                  case "checked":
                    break;
                  case "value":
                    break;
                  case "defaultValue":
                    lastDefaultValue = lastProp;
                  default:
                    nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
                }
            }
            for (var propKey$221 in nextProps) {
              var propKey = nextProps[propKey$221];
              lastProp = lastProps[propKey$221];
              if (nextProps.hasOwnProperty(propKey$221) && (null != propKey || null != lastProp))
                switch (propKey$221) {
                  case "type":
                    propKey !== lastProp && (viewTransitionMutationContext = true);
                    type = propKey;
                    break;
                  case "name":
                    propKey !== lastProp && (viewTransitionMutationContext = true);
                    name = propKey;
                    break;
                  case "checked":
                    propKey !== lastProp && (viewTransitionMutationContext = true);
                    checked = propKey;
                    break;
                  case "defaultChecked":
                    propKey !== lastProp && (viewTransitionMutationContext = true);
                    defaultChecked = propKey;
                    break;
                  case "value":
                    propKey !== lastProp && (viewTransitionMutationContext = true);
                    value = propKey;
                    break;
                  case "defaultValue":
                    propKey !== lastProp && (viewTransitionMutationContext = true);
                    defaultValue = propKey;
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (null != propKey)
                      throw Error(formatProdErrorMessage(137, tag));
                    break;
                  default:
                    propKey !== lastProp && setProp(
                      domElement,
                      tag,
                      propKey$221,
                      propKey,
                      nextProps,
                      lastProp
                    );
                }
            }
            updateInput(
              domElement,
              value,
              defaultValue,
              lastDefaultValue,
              checked,
              defaultChecked,
              type,
              name
            );
            return;
          case "select":
            propKey = value = defaultValue = propKey$221 = null;
            for (type in lastProps)
              if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue)
                switch (type) {
                  case "value":
                    break;
                  case "multiple":
                    propKey = lastDefaultValue;
                  default:
                    nextProps.hasOwnProperty(type) || setProp(
                      domElement,
                      tag,
                      type,
                      null,
                      nextProps,
                      lastDefaultValue
                    );
                }
            for (name in nextProps)
              if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue))
                switch (name) {
                  case "value":
                    type !== lastDefaultValue && (viewTransitionMutationContext = true);
                    propKey$221 = type;
                    break;
                  case "defaultValue":
                    type !== lastDefaultValue && (viewTransitionMutationContext = true);
                    defaultValue = type;
                    break;
                  case "multiple":
                    type !== lastDefaultValue && (viewTransitionMutationContext = true), value = type;
                  default:
                    type !== lastDefaultValue && setProp(
                      domElement,
                      tag,
                      name,
                      type,
                      nextProps,
                      lastDefaultValue
                    );
                }
            tag = defaultValue;
            lastProps = value;
            nextProps = propKey;
            null != propKey$221 ? updateOptions(domElement, !!lastProps, propKey$221, false) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
            return;
          case "textarea":
            propKey = propKey$221 = null;
            for (defaultValue in lastProps)
              if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue))
                switch (defaultValue) {
                  case "value":
                    break;
                  case "children":
                    break;
                  default:
                    setProp(domElement, tag, defaultValue, null, nextProps, name);
                }
            for (value in nextProps)
              if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type))
                switch (value) {
                  case "value":
                    name !== type && (viewTransitionMutationContext = true);
                    propKey$221 = name;
                    break;
                  case "defaultValue":
                    name !== type && (viewTransitionMutationContext = true);
                    propKey = name;
                    break;
                  case "children":
                    break;
                  case "dangerouslySetInnerHTML":
                    if (null != name) throw Error(formatProdErrorMessage(91));
                    break;
                  default:
                    name !== type && setProp(domElement, tag, value, name, nextProps, type);
                }
            updateTextarea(domElement, propKey$221, propKey);
            return;
          case "option":
            for (var propKey$237 in lastProps)
              if (propKey$221 = lastProps[propKey$237], lastProps.hasOwnProperty(propKey$237) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$237))
                switch (propKey$237) {
                  case "selected":
                    domElement.selected = false;
                    break;
                  default:
                    setProp(
                      domElement,
                      tag,
                      propKey$237,
                      null,
                      nextProps,
                      propKey$221
                    );
                }
            for (lastDefaultValue in nextProps)
              if (propKey$221 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$221 !== propKey && (null != propKey$221 || null != propKey))
                switch (lastDefaultValue) {
                  case "selected":
                    propKey$221 !== propKey && (viewTransitionMutationContext = true);
                    domElement.selected = propKey$221 && "function" !== typeof propKey$221 && "symbol" !== typeof propKey$221;
                    break;
                  default:
                    setProp(
                      domElement,
                      tag,
                      lastDefaultValue,
                      propKey$221,
                      nextProps,
                      propKey
                    );
                }
            return;
          case "img":
          case "link":
          case "area":
          case "base":
          case "br":
          case "col":
          case "embed":
          case "hr":
          case "keygen":
          case "meta":
          case "param":
          case "source":
          case "track":
          case "wbr":
          case "menuitem":
            for (var propKey$242 in lastProps)
              propKey$221 = lastProps[propKey$242], lastProps.hasOwnProperty(propKey$242) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$242) && setProp(domElement, tag, propKey$242, null, nextProps, propKey$221);
            for (checked in nextProps)
              if (propKey$221 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$221 !== propKey && (null != propKey$221 || null != propKey))
                switch (checked) {
                  case "children":
                  case "dangerouslySetInnerHTML":
                    if (null != propKey$221)
                      throw Error(formatProdErrorMessage(137, tag));
                    break;
                  default:
                    setProp(
                      domElement,
                      tag,
                      checked,
                      propKey$221,
                      nextProps,
                      propKey
                    );
                }
            return;
          default:
            if (isCustomElement(tag)) {
              for (var propKey$247 in lastProps)
                propKey$221 = lastProps[propKey$247], lastProps.hasOwnProperty(propKey$247) && void 0 !== propKey$221 && !nextProps.hasOwnProperty(propKey$247) && setPropOnCustomElement(
                  domElement,
                  tag,
                  propKey$247,
                  void 0,
                  nextProps,
                  propKey$221
                );
              for (defaultChecked in nextProps)
                propKey$221 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$221 === propKey || void 0 === propKey$221 && void 0 === propKey || setPropOnCustomElement(
                  domElement,
                  tag,
                  defaultChecked,
                  propKey$221,
                  nextProps,
                  propKey
                );
              return;
            }
        }
        for (var propKey$252 in lastProps)
          propKey$221 = lastProps[propKey$252], lastProps.hasOwnProperty(propKey$252) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$252) && setProp(domElement, tag, propKey$252, null, nextProps, propKey$221);
        for (lastProp in nextProps)
          propKey$221 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$221 === propKey || null == propKey$221 && null == propKey || setProp(domElement, tag, lastProp, propKey$221, nextProps, propKey);
      }
      function isLikelyStaticResource(initiatorType) {
        switch (initiatorType) {
          case "css":
          case "script":
          case "font":
          case "img":
          case "image":
          case "input":
          case "link":
            return true;
          default:
            return false;
        }
      }
      function estimateBandwidth() {
        if ("function" === typeof performance.getEntriesByType) {
          for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
            var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
            if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
              initiatorType = 0;
              duration = entry.responseEnd;
              for (i += 1; i < resourceEntries.length; i++) {
                var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
                if (overlapStartTime > duration) break;
                var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
                overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
              }
              --i;
              bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
              count++;
              if (10 < count) break;
            }
          }
          if (0 < count) return bits / count / 1e6;
        }
        return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
      }
      var eventsEnabled = null;
      var selectionInformation = null;
      function getOwnerDocumentFromRootContainer(rootContainerElement) {
        return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
      }
      function getOwnHostContext(namespaceURI) {
        switch (namespaceURI) {
          case "http://www.w3.org/2000/svg":
            return 1;
          case "http://www.w3.org/1998/Math/MathML":
            return 2;
          default:
            return 0;
        }
      }
      function getChildHostContextProd(parentNamespace, type) {
        if (0 === parentNamespace)
          switch (type) {
            case "svg":
              return 1;
            case "math":
              return 2;
            default:
              return 0;
          }
        return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
      }
      function createHoistableInstance(type, props, rootContainerInstance, internalInstanceHandle) {
        rootContainerInstance = getOwnerDocumentFromRootContainer(
          rootContainerInstance
        ).createElement(type);
        rootContainerInstance[internalInstanceKey] = internalInstanceHandle;
        rootContainerInstance[internalPropsKey] = props;
        setInitialProperties(rootContainerInstance, type, props);
        markNodeAsHoistable(rootContainerInstance);
        return rootContainerInstance;
      }
      function shouldSetTextContent(type, props) {
        return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
      }
      var currentPopstateTransitionEvent = null;
      function shouldAttemptEagerTransition() {
        var event = window.event;
        if (event && "popstate" === event.type) {
          if (event === currentPopstateTransitionEvent) return false;
          currentPopstateTransitionEvent = event;
          return true;
        }
        currentPopstateTransitionEvent = null;
        return false;
      }
      var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0;
      var cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0;
      var localPromise = "function" === typeof Promise ? Promise : void 0;
      var localRequestAnimationFrame = "function" === typeof requestAnimationFrame ? requestAnimationFrame : scheduleTimeout;
      var scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
        return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
      } : scheduleTimeout;
      function handleErrorInNextTick(error) {
        setTimeout(function() {
          throw error;
        });
      }
      function isSingletonScope(type) {
        return "head" === type;
      }
      function clearHydrationBoundary(parentInstance, hydrationInstance) {
        var node = hydrationInstance, depth = 0;
        do {
          var nextNode = node.nextSibling;
          parentInstance.removeChild(node);
          if (nextNode && 8 === nextNode.nodeType)
            if (node = nextNode.data, "/$" === node || "/&" === node) {
              if (0 === depth) {
                parentInstance.removeChild(nextNode);
                retryIfBlockedOn(hydrationInstance);
                return;
              }
              depth--;
            } else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node)
              depth++;
            else if ("html" === node)
              clearSingletonPreambleContribution(
                parentInstance.ownerDocument.documentElement
              );
            else if ("head" === node) {
              node = parentInstance.ownerDocument.head;
              clearSingletonPreambleContribution(node);
              for (var node$jscomp$0 = node.firstChild; node$jscomp$0; ) {
                var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
                node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
                node$jscomp$0 = nextNode$jscomp$0;
              }
            } else
              "body" === node && clearSingletonPreambleContribution(parentInstance.ownerDocument.body);
          node = nextNode;
        } while (node);
        retryIfBlockedOn(hydrationInstance);
      }
      function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
        var node = suspenseInstance;
        suspenseInstance = 0;
        do {
          var nextNode = node.nextSibling;
          1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
          if (nextNode && 8 === nextNode.nodeType)
            if (node = nextNode.data, "/$" === node)
              if (0 === suspenseInstance) break;
              else suspenseInstance--;
            else
              "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
          node = nextNode;
        } while (node);
      }
      function applyViewTransitionName(instance, name, className) {
        name = CSS.escape(name) !== name ? "r-" + btoa(name).replace(/=/g, "") : name;
        instance.style.viewTransitionName = name;
        null != className && (instance.style.viewTransitionClass = className);
        className = getComputedStyle(instance);
        if ("inline" === className.display) {
          name = instance.getClientRects();
          if (1 === name.length) var JSCompiler_inline_result = 1;
          else
            for (var i = JSCompiler_inline_result = 0; i < name.length; i++) {
              var rect = name[i];
              0 < rect.width && 0 < rect.height && JSCompiler_inline_result++;
            }
          1 === JSCompiler_inline_result && (instance = instance.style, instance.display = 1 === name.length ? "inline-block" : "block", instance.marginTop = "-" + className.paddingTop, instance.marginBottom = "-" + className.paddingBottom);
        }
      }
      function restoreViewTransitionName(instance, props) {
        instance = instance.style;
        props = props.style;
        var viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionName") ? props.viewTransitionName : props.hasOwnProperty("view-transition-name") ? props["view-transition-name"] : null : null;
        instance.viewTransitionName = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
        viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionClass") ? props.viewTransitionClass : props.hasOwnProperty("view-transition-class") ? props["view-transition-class"] : null : null;
        instance.viewTransitionClass = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
        "inline-block" === instance.display && (null == props ? instance.display = instance.margin = "" : (viewTransitionName = props.display, instance.display = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, viewTransitionName = props.margin, null != viewTransitionName ? instance.margin = viewTransitionName : (viewTransitionName = props.hasOwnProperty("marginTop") ? props.marginTop : props["margin-top"], instance.marginTop = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, props = props.hasOwnProperty("marginBottom") ? props.marginBottom : props["margin-bottom"], instance.marginBottom = null == props || "boolean" === typeof props ? "" : props)));
      }
      function createMeasurement(rect, computedStyle, element) {
        element = element.ownerDocument.defaultView;
        return {
          rect,
          abs: "absolute" === computedStyle.position || "fixed" === computedStyle.position,
          clip: "none" !== computedStyle.clipPath || "visible" !== computedStyle.overflow || "none" !== computedStyle.filter || "none" !== computedStyle.mask || "none" !== computedStyle.mask || "0px" !== computedStyle.borderRadius,
          view: 0 <= rect.bottom && 0 <= rect.right && rect.top <= element.innerHeight && rect.left <= element.innerWidth
        };
      }
      function measureInstance(instance) {
        var rect = instance.getBoundingClientRect(), computedStyle = getComputedStyle(instance);
        return createMeasurement(rect, computedStyle, instance);
      }
      function measureClonedInstance(instance) {
        var measuredRect = instance.getBoundingClientRect();
        measuredRect = new DOMRect(
          measuredRect.x + 2e4,
          measuredRect.y + 2e4,
          measuredRect.width,
          measuredRect.height
        );
        var computedStyle = getComputedStyle(instance);
        return createMeasurement(measuredRect, computedStyle, instance);
      }
      function forceLayout(ownerDocument) {
        return ownerDocument.documentElement.clientHeight;
      }
      function waitForImageToLoad(resolve) {
        this.addEventListener("load", resolve);
        this.addEventListener("error", resolve);
      }
      function startViewTransition(suspendedState, rootContainer, transitionTypes, mutationCallback, layoutCallback, afterMutationCallback, spawnedWorkCallback, passiveCallback, errorCallback) {
        var ownerDocument = 9 === rootContainer.nodeType ? rootContainer : rootContainer.ownerDocument;
        try {
          var transition = ownerDocument.startViewTransition({
            update: function() {
              var ownerWindow = ownerDocument.defaultView, pendingNavigation = ownerWindow.navigation && ownerWindow.navigation.transition, previousFontLoadingStatus = ownerDocument.fonts.status;
              mutationCallback();
              var blockingPromises = [];
              "loaded" === previousFontLoadingStatus && (forceLayout(ownerDocument), "loading" === ownerDocument.fonts.status && blockingPromises.push(ownerDocument.fonts.ready));
              previousFontLoadingStatus = blockingPromises.length;
              if (null !== suspendedState)
                for (var suspenseyImages = suspendedState.suspenseyImages, imgBytes = 0, i = 0; i < suspenseyImages.length; i++) {
                  var suspenseyImage = suspenseyImages[i];
                  if (!suspenseyImage.complete) {
                    var rect = suspenseyImage.getBoundingClientRect();
                    if (0 < rect.bottom && 0 < rect.right && rect.top < ownerWindow.innerHeight && rect.left < ownerWindow.innerWidth) {
                      imgBytes += estimateImageBytes(suspenseyImage);
                      if (imgBytes > estimatedBytesWithinLimit) {
                        blockingPromises.length = previousFontLoadingStatus;
                        break;
                      }
                      suspenseyImage = new Promise(
                        waitForImageToLoad.bind(suspenseyImage)
                      );
                      blockingPromises.push(suspenseyImage);
                    }
                  }
                }
              if (0 < blockingPromises.length)
                return ownerWindow = Promise.race([
                  Promise.all(blockingPromises),
                  new Promise(function(resolve) {
                    return setTimeout(resolve, 500);
                  })
                ]).then(layoutCallback, layoutCallback), (pendingNavigation ? Promise.allSettled([pendingNavigation.finished, ownerWindow]) : ownerWindow).then(afterMutationCallback, afterMutationCallback);
              layoutCallback();
              if (pendingNavigation)
                return pendingNavigation.finished.then(
                  afterMutationCallback,
                  afterMutationCallback
                );
              afterMutationCallback();
            },
            types: transitionTypes
          });
          ownerDocument.__reactViewTransition = transition;
          var viewTransitionAnimations = [];
          transition.ready.then(
            function() {
              for (var animations = ownerDocument.documentElement.getAnimations({
                subtree: true
              }), i = 0; i < animations.length; i++) {
                var animation = animations[i], effect = animation.effect, pseudoElement = effect.pseudoElement;
                if (null != pseudoElement && pseudoElement.startsWith("::view-transition")) {
                  viewTransitionAnimations.push(animation);
                  animation = effect.getKeyframes();
                  for (var height = pseudoElement = void 0, unchangedDimensions = true, j = 0; j < animation.length; j++) {
                    var keyframe = animation[j], w = keyframe.width;
                    if (void 0 === pseudoElement) pseudoElement = w;
                    else if (pseudoElement !== w) {
                      unchangedDimensions = false;
                      break;
                    }
                    w = keyframe.height;
                    if (void 0 === height) height = w;
                    else if (height !== w) {
                      unchangedDimensions = false;
                      break;
                    }
                    delete keyframe.width;
                    delete keyframe.height;
                    "none" === keyframe.transform && delete keyframe.transform;
                  }
                  unchangedDimensions && void 0 !== pseudoElement && void 0 !== height && (effect.setKeyframes(animation), unchangedDimensions = getComputedStyle(
                    effect.target,
                    effect.pseudoElement
                  ), unchangedDimensions.width !== pseudoElement || unchangedDimensions.height !== height) && (unchangedDimensions = animation[0], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, unchangedDimensions = animation[animation.length - 1], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, effect.setKeyframes(animation));
                }
              }
              spawnedWorkCallback();
            },
            function(error) {
              ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
              try {
                if ("object" === typeof error && null !== error)
                  switch (error.name) {
                    case "InvalidStateError":
                      if ("View transition was skipped because document visibility state is hidden." === error.message || "Skipping view transition because document visibility state has become hidden." === error.message || "Skipping view transition because viewport size changed." === error.message || "Transition was aborted because of invalid state" === error.message)
                        error = null;
                  }
                null !== error && errorCallback(error);
              } finally {
                mutationCallback(), layoutCallback(), spawnedWorkCallback();
              }
            }
          );
          transition.finished.finally(function() {
            for (var i = 0; i < viewTransitionAnimations.length; i++)
              viewTransitionAnimations[i].cancel();
            ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
            passiveCallback();
          });
          return transition;
        } catch (x) {
          return mutationCallback(), layoutCallback(), spawnedWorkCallback(), null;
        }
      }
      function ViewTransitionPseudoElement(pseudo, name) {
        this._scope = document.documentElement;
        this._selector = "::view-transition-" + pseudo + "(" + name + ")";
      }
      ViewTransitionPseudoElement.prototype.animate = function(keyframes, options2) {
        options2 = "number" === typeof options2 ? { duration: options2 } : assign({}, options2);
        options2.pseudoElement = this._selector;
        return this._scope.animate(keyframes, options2);
      };
      ViewTransitionPseudoElement.prototype.getAnimations = function() {
        for (var scope = this._scope, selector = this._selector, animations = scope.getAnimations({ subtree: true }), result = [], i = 0; i < animations.length; i++) {
          var effect = animations[i].effect;
          null !== effect && effect.target === scope && effect.pseudoElement === selector && result.push(animations[i]);
        }
        return result;
      };
      ViewTransitionPseudoElement.prototype.getComputedStyle = function() {
        return getComputedStyle(this._scope, this._selector);
      };
      function createViewTransitionInstance(name) {
        return {
          name,
          group: new ViewTransitionPseudoElement("group", name),
          imagePair: new ViewTransitionPseudoElement("image-pair", name),
          old: new ViewTransitionPseudoElement("old", name),
          new: new ViewTransitionPseudoElement("new", name)
        };
      }
      function FragmentInstance(fragmentFiber) {
        this._fragmentFiber = fragmentFiber;
        this._observers = this._eventListeners = null;
      }
      FragmentInstance.prototype.addEventListener = function(type, listener, optionsOrUseCapture) {
        var signal = null, cleanup = null;
        if (null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && (signal = optionsOrUseCapture.signal || null, null !== signal && signal.aborted))
          return;
        null === this._eventListeners && (this._eventListeners = []);
        var listeners = this._eventListeners;
        if (-1 === indexOfEventListener(listeners, type, listener, optionsOrUseCapture)) {
          var fragmentInstance = this, attachedListener = listener;
          null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && true === optionsOrUseCapture.once && (attachedListener = function(event) {
            fragmentInstance.removeEventListener(
              type,
              listener,
              optionsOrUseCapture
            );
            "function" === typeof listener ? listener.call(this, event) : listener.handleEvent(event);
          });
          null !== signal && (cleanup = fragmentInstance.removeEventListener.bind(
            fragmentInstance,
            type,
            listener,
            optionsOrUseCapture
          ), signal.addEventListener("abort", cleanup, { once: true }), cleanup = signal.removeEventListener.bind(signal, "abort", cleanup));
          signal = getAttachOptions(optionsOrUseCapture);
          listeners.push({
            type,
            listener,
            optionsOrUseCapture,
            attachedListener,
            cleanup
          });
          traverseVisibleInstancesAndTextInstances(
            this._fragmentFiber.child,
            false,
            addEventListenerToChild,
            type,
            attachedListener,
            signal
          );
        }
        this._eventListeners = listeners;
      };
      function addEventListenerToChild(child, type, listener, optionsOrUseCapture) {
        getInstanceFromHostFiber(child).addEventListener(
          type,
          listener,
          optionsOrUseCapture
        );
        return false;
      }
      FragmentInstance.prototype.removeEventListener = function(type, listener, optionsOrUseCapture) {
        var listeners = this._eventListeners;
        if (null !== listeners && (listener = indexOfEventListener(
          listeners,
          type,
          listener,
          optionsOrUseCapture
        ), -1 !== listener)) {
          var _listeners$index = listeners[listener];
          optionsOrUseCapture = _listeners$index.attachedListener;
          var cleanup = _listeners$index.cleanup;
          _listeners$index = getAttachOptions(_listeners$index.optionsOrUseCapture);
          traverseVisibleInstancesAndTextInstances(
            this._fragmentFiber.child,
            false,
            removeEventListenerFromChild,
            type,
            optionsOrUseCapture,
            _listeners$index
          );
          listeners.splice(listener, 1);
          null !== cleanup && cleanup();
        }
      };
      function removeEventListenerFromChild(child, type, listener, optionsOrUseCapture) {
        getInstanceFromHostFiber(child).removeEventListener(
          type,
          listener,
          optionsOrUseCapture
        );
        return false;
      }
      function getAttachOptions(opts) {
        return null != opts && "boolean" !== typeof opts && (true === opts.once || opts.signal instanceof AbortSignal) ? { capture: opts.capture, passive: opts.passive } : opts;
      }
      function normalizeListenerOptions(opts) {
        return null == opts ? "c=0" : "boolean" === typeof opts ? "c=" + (opts ? "1" : "0") : "c=" + (opts.capture ? "1" : "0");
      }
      function indexOfEventListener(eventListeners, type, listener, optionsOrUseCapture) {
        if (0 === eventListeners.length) return -1;
        optionsOrUseCapture = normalizeListenerOptions(optionsOrUseCapture);
        for (var i = 0; i < eventListeners.length; i++) {
          var item = eventListeners[i];
          if (item.type === type && item.listener === listener && normalizeListenerOptions(item.optionsOrUseCapture) === optionsOrUseCapture)
            return i;
        }
        return -1;
      }
      FragmentInstance.prototype.dispatchEvent = function(event) {
        var parentHostFiber = getFragmentParentInstanceOrContainerFiber(
          this._fragmentFiber
        );
        if (null === parentHostFiber) return true;
        parentHostFiber = getInstanceFromHostFiber(parentHostFiber);
        var eventListeners = this._eventListeners;
        if (null !== eventListeners && 0 < eventListeners.length || !event.bubbles) {
          var temp = 9 === parentHostFiber.nodeType ? parentHostFiber.createComment("") : document.createTextNode("");
          if (eventListeners)
            for (var i = 0; i < eventListeners.length; i++) {
              var _eventListeners$i = eventListeners[i];
              temp.addEventListener(
                _eventListeners$i.type,
                _eventListeners$i.attachedListener,
                getAttachOptions(_eventListeners$i.optionsOrUseCapture)
              );
            }
          parentHostFiber.appendChild(temp);
          event = temp.dispatchEvent(event);
          if (eventListeners)
            for (i = 0; i < eventListeners.length; i++)
              _eventListeners$i = eventListeners[i], temp.removeEventListener(
                _eventListeners$i.type,
                _eventListeners$i.attachedListener,
                getAttachOptions(_eventListeners$i.optionsOrUseCapture)
              );
          parentHostFiber.removeChild(temp);
          return event;
        }
        return parentHostFiber.dispatchEvent(event);
      };
      FragmentInstance.prototype.focus = function(focusOptions) {
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          true,
          setFocusOnFiberIfFocusable,
          focusOptions,
          void 0,
          void 0
        );
      };
      function setFocusOnFiberIfFocusable(fiber, focusOptions) {
        if (6 === fiber.tag) return false;
        fiber = getInstanceFromHostFiber(fiber);
        return setFocusIfFocusable(fiber, focusOptions);
      }
      FragmentInstance.prototype.focusLast = function(focusOptions) {
        var children = [];
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          true,
          collectChildren,
          children,
          void 0,
          void 0
        );
        for (var i = children.length - 1; 0 <= i && !setFocusOnFiberIfFocusable(children[i], focusOptions); i--) ;
      };
      function collectChildren(child, collection) {
        collection.push(child);
        return false;
      }
      FragmentInstance.prototype.blur = function() {
        var parentHostFiber = getFragmentParentInstanceOrContainerFiber(
          this._fragmentFiber
        );
        null !== parentHostFiber && (parentHostFiber = getInstanceFromHostFiber(parentHostFiber), parentHostFiber = getOwnerDocumentFromRootContainer(parentHostFiber).activeElement, null !== parentHostFiber && traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          false,
          blurActiveElementWithinFragment,
          parentHostFiber,
          void 0,
          void 0
        ));
      };
      function blurActiveElementWithinFragment(child, activeElement2) {
        if (6 === child.tag) return false;
        child = getInstanceFromHostFiber(child);
        return child === activeElement2 || child.contains(activeElement2) ? (activeElement2.blur(), true) : false;
      }
      FragmentInstance.prototype.observeUsing = function(observer) {
        null === this._observers && (this._observers = /* @__PURE__ */ new Set());
        this._observers.add(observer);
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          false,
          observeChild,
          observer,
          void 0,
          void 0
        );
      };
      function observeChild(child, observer) {
        if (6 === child.tag) return false;
        child = getInstanceFromHostFiber(child);
        observer.observe(child);
        return false;
      }
      FragmentInstance.prototype.unobserveUsing = function(observer) {
        var observers = this._observers;
        if (null !== observers && observers.has(observer)) {
          observers.delete(observer);
          traverseVisibleInstancesAndTextInstances(
            this._fragmentFiber.child,
            false,
            unobserveChild,
            observer,
            void 0,
            void 0
          );
          for (var i = observers = 0; i < pendingIntersectionUnobserves.length; i++) {
            var pending = pendingIntersectionUnobserves[i];
            pending.fragmentInstance === this && pending.observer === observer ? observer.unobserve(pending.instance) : pendingIntersectionUnobserves[observers++] = pending;
          }
          pendingIntersectionUnobserves.length = observers;
        }
      };
      function unobserveChild(child, observer) {
        if (6 === child.tag) return false;
        child = getInstanceFromHostFiber(child);
        observer.unobserve(child);
        return false;
      }
      var pendingIntersectionUnobserves = [];
      var intersectionUnobserveScheduled = false;
      function schedulePendingIntersectionUnobserve(fragmentInstance, observer, instance) {
        pendingIntersectionUnobserves.push({
          fragmentInstance,
          observer,
          instance
        });
        intersectionUnobserveScheduled || (intersectionUnobserveScheduled = true, requestPostPaintCallback(function() {
          intersectionUnobserveScheduled = false;
          var pending = pendingIntersectionUnobserves;
          pendingIntersectionUnobserves = [];
          for (var i = 0; i < pending.length; i++) {
            var item = pending[i];
            item.observer.unobserve(item.instance);
          }
        }));
      }
      FragmentInstance.prototype.getClientRects = function() {
        var rects = [];
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          false,
          collectClientRects,
          rects,
          void 0,
          void 0
        );
        return rects;
      };
      function collectClientRects(child, rects) {
        if (6 === child.tag) {
          child = child.stateNode;
          var range = child.ownerDocument.createRange();
          range.selectNodeContents(child);
          rects.push.apply(rects, range.getClientRects());
        } else
          child = getInstanceFromHostFiber(child), rects.push.apply(rects, child.getClientRects());
        return false;
      }
      FragmentInstance.prototype.getRootNode = function(getRootNodeOptions) {
        var parentHostFiber = getFragmentParentInstanceOrContainerFiber(
          this._fragmentFiber
        );
        return null === parentHostFiber ? this : getInstanceFromHostFiber(parentHostFiber).getRootNode(getRootNodeOptions);
      };
      FragmentInstance.prototype.compareDocumentPosition = function(otherNode) {
        var parentHostFiber = getFragmentParentInstanceOrContainerFiber(
          this._fragmentFiber
        );
        if (null === parentHostFiber) return Node.DOCUMENT_POSITION_DISCONNECTED;
        var children = [];
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          false,
          collectChildren,
          children,
          void 0,
          void 0
        );
        var parentHostInstance = getInstanceFromHostFiber(parentHostFiber);
        if (0 === children.length) {
          children = parentHostInstance;
          if (fiberIsPortaledIntoHost(this._fragmentFiber)) {
            a: {
              for (parentHostFiber = this._fragmentFiber.return; null !== parentHostFiber; ) {
                if (4 === parentHostFiber.tag) {
                  parentHostFiber = parentHostFiber.stateNode.containerInfo;
                  break a;
                }
                if (3 === parentHostFiber.tag || 5 === parentHostFiber.tag || 27 === parentHostFiber.tag)
                  break;
                parentHostFiber = parentHostFiber.return;
              }
              parentHostFiber = null;
            }
            null != parentHostFiber && (children = parentHostFiber);
          }
          parentHostFiber = this._fragmentFiber;
          var result = parentHostInstance = children.compareDocumentPosition(otherNode);
          children === otherNode ? result = Node.DOCUMENT_POSITION_CONTAINS : parentHostInstance & Node.DOCUMENT_POSITION_CONTAINED_BY && (children = getFragmentInstanceOrTextInstanceSiblings(parentHostFiber)[1], null === children ? result = Node.DOCUMENT_POSITION_PRECEDING : (otherNode = getInstanceFromHostFiber(children).compareDocumentPosition(
            otherNode
          ), result = 0 === otherNode || otherNode & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING));
          return result |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
        }
        parentHostFiber = getInstanceFromHostFiber(children[0]);
        result = getInstanceFromHostFiber(children[children.length - 1]);
        var parentHostInstanceFromDOM = fiberIsPortaledIntoHost(this._fragmentFiber) ? parentHostFiber.parentElement : parentHostInstance;
        if (null == parentHostInstanceFromDOM)
          return Node.DOCUMENT_POSITION_DISCONNECTED;
        parentHostInstance = parentHostInstanceFromDOM.compareDocumentPosition(parentHostFiber) & Node.DOCUMENT_POSITION_CONTAINED_BY;
        parentHostInstanceFromDOM = parentHostInstanceFromDOM.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_CONTAINED_BY;
        var firstResult = parentHostFiber.compareDocumentPosition(otherNode), lastResult = result.compareDocumentPosition(otherNode), otherNodeIsWithinFirstOrLastChild = firstResult & Node.DOCUMENT_POSITION_CONTAINED_BY || lastResult & Node.DOCUMENT_POSITION_CONTAINED_BY;
        lastResult = parentHostInstance && parentHostInstanceFromDOM && firstResult & Node.DOCUMENT_POSITION_FOLLOWING && lastResult & Node.DOCUMENT_POSITION_PRECEDING;
        parentHostFiber = parentHostInstance && parentHostFiber === otherNode || parentHostInstanceFromDOM && result === otherNode || otherNodeIsWithinFirstOrLastChild || lastResult ? Node.DOCUMENT_POSITION_CONTAINED_BY : !parentHostInstance && parentHostFiber === otherNode || !parentHostInstanceFromDOM && result === otherNode ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : firstResult;
        return parentHostFiber & Node.DOCUMENT_POSITION_DISCONNECTED || parentHostFiber & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || validateDocumentPositionWithFiberTree(
          parentHostFiber,
          this._fragmentFiber,
          children[0],
          children[children.length - 1],
          otherNode
        ) ? parentHostFiber : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
      };
      function validateDocumentPositionWithFiberTree(documentPosition, fragmentFiber, precedingBoundaryFiber, followingBoundaryFiber, otherNode) {
        var otherFiber = getClosestInstanceFromNode(otherNode);
        if (documentPosition & Node.DOCUMENT_POSITION_CONTAINED_BY) {
          if (precedingBoundaryFiber = !!otherFiber)
            a: {
              for (; null !== otherFiber; ) {
                if (7 === otherFiber.tag && (otherFiber === fragmentFiber || otherFiber.alternate === fragmentFiber)) {
                  precedingBoundaryFiber = true;
                  break a;
                }
                otherFiber = otherFiber.return;
              }
              precedingBoundaryFiber = false;
            }
          return precedingBoundaryFiber;
        }
        if (documentPosition & Node.DOCUMENT_POSITION_CONTAINS) {
          if (null === otherFiber)
            return otherFiber = otherNode.ownerDocument, otherNode === otherFiber || otherNode === otherFiber.documentElement || otherNode === otherFiber.body;
          a: {
            otherFiber = fragmentFiber;
            for (fragmentFiber = getFragmentParentInstanceOrContainerFiber(fragmentFiber); null !== otherFiber; ) {
              if (!(5 !== otherFiber.tag && 3 !== otherFiber.tag && 27 !== otherFiber.tag || otherFiber !== fragmentFiber && otherFiber.alternate !== fragmentFiber)) {
                otherFiber = true;
                break a;
              }
              otherFiber = otherFiber.return;
            }
            otherFiber = false;
          }
          return otherFiber;
        }
        return documentPosition & Node.DOCUMENT_POSITION_PRECEDING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === precedingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(
          precedingBoundaryFiber,
          otherFiber,
          getParentForFragmentAncestors
        ), null === fragmentFiber ? fragmentFiber = false : (traverseVisibleInstancesAndTextInstances(
          fragmentFiber,
          true,
          isFiberPrecedingCheck,
          otherFiber,
          precedingBoundaryFiber
        ), otherFiber = searchTarget, searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === followingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(
          followingBoundaryFiber,
          otherFiber,
          getParentForFragmentAncestors
        ), null === fragmentFiber ? fragmentFiber = false : (traverseVisibleInstancesAndTextInstances(
          fragmentFiber,
          true,
          isFiberFollowingCheck,
          otherFiber,
          followingBoundaryFiber
        ), otherFiber = searchTarget, searchBoundary = searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : false;
      }
      function scrollTextNodeIntoView(textNode, resolvedAlignToTop) {
        var range = textNode.ownerDocument.createRange();
        range.selectNodeContents(textNode);
        textNode = range.getBoundingClientRect();
        window.scrollTo(
          window.scrollX + textNode.left,
          resolvedAlignToTop ? window.scrollY + textNode.top : window.scrollY + textNode.bottom - window.innerHeight
        );
      }
      FragmentInstance.prototype.scrollIntoView = function(alignToTop) {
        if ("object" === typeof alignToTop) throw Error(formatProdErrorMessage(566));
        var children = [];
        traverseVisibleInstancesAndTextInstances(
          this._fragmentFiber.child,
          false,
          collectChildren,
          children,
          void 0,
          void 0
        );
        var resolvedAlignToTop = false !== alignToTop;
        if (0 === children.length) {
          var hostSiblings = getFragmentInstanceOrTextInstanceSiblings(
            this._fragmentFiber
          );
          hostSiblings = resolvedAlignToTop ? hostSiblings[1] || hostSiblings[0] || getFragmentParentInstanceOrContainerFiber(this._fragmentFiber) : hostSiblings[0] || hostSiblings[1];
          if (null === hostSiblings) return;
          if (6 === hostSiblings.tag) {
            alignToTop = getInstanceFromHostFiber(hostSiblings);
            scrollTextNodeIntoView(alignToTop, resolvedAlignToTop);
            return;
          }
          hostSiblings = getInstanceFromHostFiber(hostSiblings);
          if (9 !== hostSiblings.nodeType) {
            if (11 === hostSiblings.nodeType) {
              resolvedAlignToTop = "host" in hostSiblings ? hostSiblings.host : null;
              null !== resolvedAlignToTop && resolvedAlignToTop.scrollIntoView(alignToTop);
              return;
            }
            hostSiblings.scrollIntoView(alignToTop);
          }
        }
        for (hostSiblings = resolvedAlignToTop ? children.length - 1 : 0; hostSiblings !== (resolvedAlignToTop ? -1 : children.length); ) {
          var child = children[hostSiblings];
          6 === child.tag ? (child = getInstanceFromHostFiber(child), scrollTextNodeIntoView(child, resolvedAlignToTop)) : getInstanceFromHostFiber(child).scrollIntoView(alignToTop);
          hostSiblings += resolvedAlignToTop ? -1 : 1;
        }
      };
      function addFragmentHandleToFiber(child, fragmentInstance) {
        child = getInstanceFromHostFiber(child);
        addFragmentHandleToInstance(child, fragmentInstance);
        return false;
      }
      function addFragmentHandleToInstance(instance, fragmentInstance) {
        null == instance.reactFragments && (instance.reactFragments = /* @__PURE__ */ new Set());
        instance.reactFragments.add(fragmentInstance);
      }
      function commitNewChildToFragmentInstance(childInstance, fragmentInstance) {
        var eventListeners = fragmentInstance._eventListeners;
        if (null !== eventListeners)
          for (var i$jscomp$0 = 0; i$jscomp$0 < eventListeners.length; i$jscomp$0++) {
            var _eventListeners$i3 = eventListeners[i$jscomp$0];
            childInstance.addEventListener(
              _eventListeners$i3.type,
              _eventListeners$i3.attachedListener,
              getAttachOptions(_eventListeners$i3.optionsOrUseCapture)
            );
          }
        3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
          for (var writeIdx = 0, i = 0; i < pendingIntersectionUnobserves.length; i++) {
            var pending = pendingIntersectionUnobserves[i];
            if (pending.fragmentInstance !== fragmentInstance || pending.observer !== observer || pending.instance !== childInstance)
              pendingIntersectionUnobserves[writeIdx++] = pending;
          }
          pendingIntersectionUnobserves.length = writeIdx;
          observer.observe(childInstance);
        }), addFragmentHandleToInstance(childInstance, fragmentInstance));
      }
      function deleteChildFromFragmentInstance(childInstance, fragmentInstance) {
        var eventListeners = fragmentInstance._eventListeners;
        if (null !== eventListeners)
          for (var i = 0; i < eventListeners.length; i++) {
            var _eventListeners$i4 = eventListeners[i];
            childInstance.removeEventListener(
              _eventListeners$i4.type,
              _eventListeners$i4.attachedListener,
              getAttachOptions(_eventListeners$i4.optionsOrUseCapture)
            );
          }
        3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
          "string" === typeof observer.rootMargin ? schedulePendingIntersectionUnobserve(
            fragmentInstance,
            observer,
            childInstance
          ) : observer.unobserve(childInstance);
        }), null != childInstance.reactFragments && childInstance.reactFragments.delete(fragmentInstance));
      }
      function clearContainerSparingly(container2) {
        var nextNode = container2.firstChild;
        nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
        for (; nextNode; ) {
          var node = nextNode;
          nextNode = nextNode.nextSibling;
          switch (node.nodeName) {
            case "HTML":
            case "HEAD":
            case "BODY":
              clearContainerSparingly(node);
              detachDeletedInstance(node);
              continue;
            case "SCRIPT":
            case "STYLE":
              continue;
            case "LINK":
              if ("stylesheet" === node.rel.toLowerCase()) continue;
          }
          container2.removeChild(node);
        }
      }
      function canHydrateInstance(instance, type, props, inRootOrSingleton) {
        for (; 1 === instance.nodeType; ) {
          var anyProps = props;
          if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
            if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type))
              break;
          } else if (!inRootOrSingleton)
            if ("input" === type && "hidden" === instance.type) {
              var name = null == anyProps.name ? null : "" + anyProps.name;
              if ("hidden" === anyProps.type && instance.getAttribute("name") === name)
                return instance;
            } else return instance;
          else if (!instance[internalHoistableMarker])
            switch (type) {
              case "meta":
                if (!instance.hasAttribute("itemprop")) break;
                return instance;
              case "link":
                name = instance.getAttribute("rel");
                if ("stylesheet" === name && instance.hasAttribute("data-precedence"))
                  break;
                else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title))
                  break;
                return instance;
              case "style":
                if (instance.hasAttribute("data-precedence")) break;
                return instance;
              case "script":
                name = instance.getAttribute("src");
                if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
                  break;
                return instance;
              default:
                return instance;
            }
          instance = getNextHydratable(instance.nextSibling);
          if (null === instance) break;
        }
        return null;
      }
      function canHydrateTextInstance(instance, text, inRootOrSingleton) {
        if ("" === text) return null;
        for (; 3 !== instance.nodeType; ) {
          if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
            return null;
          instance = getNextHydratable(instance.nextSibling);
          if (null === instance) return null;
        }
        return instance;
      }
      function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
        for (; 8 !== instance.nodeType; ) {
          if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
            return null;
          instance = getNextHydratable(instance.nextSibling);
          if (null === instance) return null;
        }
        return instance;
      }
      function isSuspenseInstancePending(instance) {
        return "$?" === instance.data || "$~" === instance.data;
      }
      function isSuspenseInstanceFallback(instance) {
        return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
      }
      function registerSuspenseInstanceRetry(instance, callback) {
        var ownerDocument = instance.ownerDocument;
        if ("$~" === instance.data) instance._reactRetry = callback;
        else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState)
          callback();
        else {
          var listener = function() {
            callback();
            ownerDocument.removeEventListener("DOMContentLoaded", listener);
          };
          ownerDocument.addEventListener("DOMContentLoaded", listener);
          instance._reactRetry = listener;
        }
      }
      function getNextHydratable(node) {
        for (; null != node; node = node.nextSibling) {
          var nodeType = node.nodeType;
          if (1 === nodeType || 3 === nodeType) break;
          if (8 === nodeType) {
            nodeType = node.data;
            if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType)
              break;
            if ("/$" === nodeType || "/&" === nodeType) return null;
          }
        }
        return node;
      }
      var previousHydratableOnEnteringScopedSingleton = null;
      function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
        hydrationInstance = hydrationInstance.nextSibling;
        for (var depth = 0; hydrationInstance; ) {
          if (8 === hydrationInstance.nodeType) {
            var data = hydrationInstance.data;
            if ("/$" === data || "/&" === data) {
              if (0 === depth)
                return getNextHydratable(hydrationInstance.nextSibling);
              depth--;
            } else
              "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
          }
          hydrationInstance = hydrationInstance.nextSibling;
        }
        return null;
      }
      function getParentHydrationBoundary(targetInstance) {
        targetInstance = targetInstance.previousSibling;
        for (var depth = 0; targetInstance; ) {
          if (8 === targetInstance.nodeType) {
            var data = targetInstance.data;
            if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
              if (0 === depth) return targetInstance;
              depth--;
            } else "/$" !== data && "/&" !== data || depth++;
          }
          targetInstance = targetInstance.previousSibling;
        }
        return null;
      }
      function setFocusIfFocusable(node, focusOptions) {
        function handleFocus() {
          didFocus = true;
        }
        if (node.ownerDocument.activeElement === node) return true;
        var didFocus = false;
        try {
          node.ownerDocument.addEventListener("focus", handleFocus, true), (node.focus || HTMLElement.prototype.focus).call(node, focusOptions);
        } finally {
          node.ownerDocument.removeEventListener("focus", handleFocus, true);
        }
        return didFocus;
      }
      function requestPostPaintCallback(callback) {
        localRequestAnimationFrame(function() {
          localRequestAnimationFrame(function(time) {
            return callback(time);
          });
        });
      }
      function resolveSingletonInstance(type, props, rootContainerInstance) {
        props = getOwnerDocumentFromRootContainer(rootContainerInstance);
        switch (type) {
          case "html":
            type = props.documentElement;
            if (!type) throw Error(formatProdErrorMessage(452));
            return type;
          case "head":
            type = props.head;
            if (!type) throw Error(formatProdErrorMessage(453));
            return type;
          case "body":
            type = props.body;
            if (!type) throw Error(formatProdErrorMessage(454));
            return type;
          default:
            throw Error(formatProdErrorMessage(451));
        }
      }
      function releaseSingletonInstance(instance, type, props) {
        for (var propKey in props) {
          var propValue = props[propKey];
          props.hasOwnProperty(propKey) && null != propValue && setProp(instance, type, propKey, null, emptyProps, propValue);
        }
        null != props.dangerouslySetInnerHTML && (instance.textContent = "");
        instance.onclick === noop$1 && (instance.onclick = null);
        detachDeletedInstance(instance);
      }
      function clearSingletonPreambleContribution(instance) {
        for (var attributes = instance.attributes; attributes.length; )
          instance.removeAttributeNode(attributes[0]);
        detachDeletedInstance(instance);
      }
      var preloadPropsMap = /* @__PURE__ */ new Map();
      var preconnectsSet = /* @__PURE__ */ new Set();
      function getHoistableRoot(container2) {
        if ("function" === typeof container2.getRootNode) {
          var rootNode = container2.getRootNode();
          if (9 === rootNode.nodeType || 11 === rootNode.nodeType) return rootNode;
        }
        return 9 === container2.nodeType ? container2 : container2.ownerDocument;
      }
      var previousDispatcher = ReactDOMSharedInternals.d;
      ReactDOMSharedInternals.d = {
        f: flushSyncWork,
        r: requestFormReset,
        D: prefetchDNS,
        C: preconnect,
        L: preload,
        m: preloadModule,
        X: preinitScript,
        S: preinitStyle,
        M: preinitModuleScript
      };
      function flushSyncWork() {
        var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
        return previousWasRendering || wasRendering;
      }
      function requestFormReset(form) {
        var formInst = getInstanceFromNode(form);
        null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
      }
      var globalDocument = "undefined" === typeof document ? null : document;
      function preconnectAs(rel, href, crossOrigin) {
        var ownerDocument = globalDocument;
        if (ownerDocument && "string" === typeof href && href) {
          var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
          limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
          "string" === typeof crossOrigin && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
          preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
        }
      }
      function prefetchDNS(href) {
        previousDispatcher.D(href);
        preconnectAs("dns-prefetch", href, null);
      }
      function preconnect(href, crossOrigin) {
        previousDispatcher.C(href, crossOrigin);
        preconnectAs("preconnect", href, crossOrigin);
      }
      function preload(href, as, options2) {
        previousDispatcher.L(href, as, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && href && as) {
          var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
          "image" === as ? options2 && options2.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(
            options2.imageSrcSet
          ) + '"]', "string" === typeof options2.imageSizes && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(
            options2.imageSizes
          ) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
          var key = preloadSelector;
          switch (as) {
            case "style":
              key = getStyleKey(href);
              break;
            case "script":
              key = getScriptKey(href);
          }
          if (!(preloadPropsMap.has(key) || (href = assign(
            {
              rel: "preload",
              href: "image" === as && options2 && options2.imageSrcSet ? void 0 : href,
              as
            },
            options2
          ), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key))))) {
            var instance = ownerDocument.createElement("link");
            setInitialProperties(instance, "link", href);
            "style" === as && (instance[internalLoadPendingKey] = true, instance.onload = instance.onerror = function() {
              clearPendingLoadOnNode(instance);
            });
            markNodeAsHoistable(instance);
            ownerDocument.head.appendChild(instance);
          }
        }
      }
      function preloadModule(href, options2) {
        previousDispatcher.m(href, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && href) {
          var as = options2 && "string" === typeof options2.as ? options2.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
          switch (as) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
              key = getScriptKey(href);
          }
          if (!preloadPropsMap.has(key) && (href = assign({ rel: "modulepreload", href }, options2), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
            switch (as) {
              case "audioworklet":
              case "paintworklet":
              case "serviceworker":
              case "sharedworker":
              case "worker":
              case "script":
                if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
                  return;
            }
            as = ownerDocument.createElement("link");
            setInitialProperties(as, "link", href);
            markNodeAsHoistable(as);
            ownerDocument.head.appendChild(as);
          }
        }
      }
      function preinitStyle(href, precedence, options2) {
        previousDispatcher.S(href, precedence, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && href) {
          var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
          precedence = precedence || "default";
          var resource = styles.get(key);
          if (!resource) {
            var state = { loading: 0, preload: null };
            if (resource = ownerDocument.querySelector(
              getStylesheetSelectorFromKey(key)
            ))
              state.loading = 5;
            else {
              href = assign(
                { rel: "stylesheet", href, "data-precedence": precedence },
                options2
              );
              (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options2);
              var link = resource = ownerDocument.createElement("link");
              markNodeAsHoistable(link);
              setInitialProperties(link, "link", href);
              link._p = new Promise(function(resolve, reject) {
                link.onload = resolve;
                link.onerror = reject;
              });
              link.addEventListener("load", function() {
                state.loading |= 1;
              });
              link.addEventListener("error", function() {
                state.loading |= 2;
              });
              state.loading |= 4;
              insertStylesheet(resource, precedence, ownerDocument);
            }
            resource = {
              type: "stylesheet",
              instance: resource,
              count: 1,
              state
            };
            styles.set(key, resource);
          }
        }
      }
      function preinitScript(src, options2) {
        previousDispatcher.X(src, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && src) {
          var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
          resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
            type: "script",
            instance: resource,
            count: 1,
            state: null
          }, scripts.set(key, resource));
        }
      }
      function preinitModuleScript(src, options2) {
        previousDispatcher.M(src, options2);
        var ownerDocument = globalDocument;
        if (ownerDocument && src) {
          var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
          resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true, type: "module" }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
            type: "script",
            instance: resource,
            count: 1,
            state: null
          }, scripts.set(key, resource));
        }
      }
      function getResource(type, currentProps, pendingProps, currentResource) {
        var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
        if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
        switch (type) {
          case "meta":
          case "title":
            return null;
          case "style":
            return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (pendingProps = getStyleKey(pendingProps.href), currentProps = getResourcesFromRoot(
              JSCompiler_inline_result
            ).hoistableStyles, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
              type: "style",
              instance: null,
              count: 0,
              state: null
            }, currentProps.set(pendingProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
          case "link":
            if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
              type = getStyleKey(pendingProps.href);
              var styles$268 = getResourcesFromRoot(
                JSCompiler_inline_result
              ).hoistableStyles, resource$269 = styles$268.get(type);
              resource$269 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$269 = {
                type: "stylesheet",
                instance: null,
                count: 0,
                state: { loading: 0, preload: null }
              }, styles$268.set(type, resource$269), (styles$268 = JSCompiler_inline_result.querySelector(
                getStylesheetSelectorFromKey(type)
              )) ? styles$268._p || (resource$269.instance = styles$268, resource$269.state.loading = 5) : (styles$268 = preloadPropsMap.get(type), styles$268 || (styles$268 = {
                rel: "preload",
                as: "style",
                href: pendingProps.href,
                crossOrigin: pendingProps.crossOrigin,
                integrity: pendingProps.integrity,
                media: pendingProps.media,
                hrefLang: pendingProps.hrefLang,
                referrerPolicy: pendingProps.referrerPolicy
              }, preloadPropsMap.set(type, styles$268)), preloadStylesheet(
                JSCompiler_inline_result,
                type,
                styles$268,
                resource$269.state
              )));
              if (currentProps && null === currentResource)
                throw Error(formatProdErrorMessage(528, ""));
              return resource$269;
            }
            if (currentProps && null !== currentResource)
              throw Error(formatProdErrorMessage(529, ""));
            return null;
          case "script":
            return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (pendingProps = getScriptKey(pendingProps), currentProps = getResourcesFromRoot(
              JSCompiler_inline_result
            ).hoistableScripts, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
              type: "script",
              instance: null,
              count: 0,
              state: null
            }, currentProps.set(pendingProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
          default:
            throw Error(formatProdErrorMessage(444, type));
        }
      }
      function getStyleKey(href) {
        return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
      }
      function getStylesheetSelectorFromKey(key) {
        return 'link[rel="stylesheet"][' + key + "]";
      }
      function stylesheetPropsFromRawProps(rawProps) {
        return assign({}, rawProps, {
          "data-precedence": rawProps.precedence,
          precedence: null
        });
      }
      function preloadStylesheet(ownerDocument, key, preloadProps, state) {
        if (key = ownerDocument.querySelector(
          'link[rel="preload"][as="style"][' + key + "]"
        )) {
          if (true !== key[internalLoadPendingKey]) {
            state.loading = 1;
            return;
          }
        } else
          key = ownerDocument.createElement("link"), key[internalLoadPendingKey] = true, key.onload = key.onerror = clearPendingLoadOnNode.bind(null, key), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key);
        state.preload = key;
        key.addEventListener("load", function() {
          return state.loading |= 1;
        });
        key.addEventListener("error", function() {
          return state.loading |= 2;
        });
      }
      function getScriptKey(src) {
        return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
      }
      function getScriptSelectorFromKey(key) {
        return "script[async]" + key;
      }
      function acquireResource(hoistableRoot, resource, props) {
        resource.count++;
        if (null === resource.instance)
          switch (resource.type) {
            case "style":
              var instance = hoistableRoot.querySelector(
                'style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]'
              );
              if (instance)
                return resource.instance = instance, markNodeAsHoistable(instance), instance;
              var styleProps = assign({}, props, {
                "data-href": props.href,
                "data-precedence": props.precedence,
                href: null,
                precedence: null
              });
              instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement(
                "style"
              );
              markNodeAsHoistable(instance);
              setInitialProperties(instance, "style", styleProps);
              insertStylesheet(instance, props.precedence, hoistableRoot);
              return resource.instance = instance;
            case "stylesheet":
              styleProps = getStyleKey(props.href);
              var instance$274 = hoistableRoot.querySelector(
                getStylesheetSelectorFromKey(styleProps)
              );
              if (instance$274)
                return resource.state.loading |= 4, resource.instance = instance$274, markNodeAsHoistable(instance$274), instance$274;
              instance = stylesheetPropsFromRawProps(props);
              (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
              instance$274 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
              markNodeAsHoistable(instance$274);
              var linkInstance = instance$274;
              linkInstance._p = new Promise(function(resolve, reject) {
                linkInstance.onload = resolve;
                linkInstance.onerror = reject;
              });
              setInitialProperties(instance$274, "link", instance);
              resource.state.loading |= 4;
              insertStylesheet(instance$274, props.precedence, hoistableRoot);
              return resource.instance = instance$274;
            case "script":
              instance$274 = getScriptKey(props.src);
              if (styleProps = hoistableRoot.querySelector(
                getScriptSelectorFromKey(instance$274)
              ))
                return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
              instance = props;
              if (styleProps = preloadPropsMap.get(instance$274))
                instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
              hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
              styleProps = hoistableRoot.createElement("script");
              markNodeAsHoistable(styleProps);
              setInitialProperties(styleProps, "link", instance);
              hoistableRoot.head.appendChild(styleProps);
              return resource.instance = styleProps;
            case "void":
              return null;
            default:
              throw Error(formatProdErrorMessage(443, resource.type));
          }
        else
          "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
        return resource.instance;
      }
      function insertStylesheet(instance, precedence, root2) {
        for (var nodes = root2.querySelectorAll(
          'link[rel="stylesheet"][data-precedence],style[data-precedence]'
        ), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (node.dataset.precedence === precedence) prior = node;
          else if (prior !== last) break;
        }
        prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root2.nodeType ? root2.head : root2, precedence.insertBefore(instance, precedence.firstChild));
      }
      function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
        null == stylesheetProps.crossOrigin && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
        null == stylesheetProps.referrerPolicy && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
        null == stylesheetProps.title && (stylesheetProps.title = preloadProps.title);
      }
      function adoptPreloadPropsForScript(scriptProps, preloadProps) {
        null == scriptProps.crossOrigin && (scriptProps.crossOrigin = preloadProps.crossOrigin);
        null == scriptProps.referrerPolicy && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
        null == scriptProps.integrity && (scriptProps.integrity = preloadProps.integrity);
      }
      var tagCaches = null;
      function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
        if (null === tagCaches) {
          var cache = /* @__PURE__ */ new Map();
          var caches = tagCaches = /* @__PURE__ */ new Map();
          caches.set(ownerDocument, cache);
        } else
          caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
        if (cache.has(type)) return cache;
        cache.set(type, null);
        ownerDocument = ownerDocument.getElementsByTagName(type);
        for (caches = 0; caches < ownerDocument.length; caches++) {
          var node = ownerDocument[caches];
          if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
            var nodeKey = node.getAttribute(keyAttribute) || "";
            nodeKey = type + nodeKey;
            var existing = cache.get(nodeKey);
            existing ? existing.push(node) : cache.set(nodeKey, [node]);
          }
        }
        return cache;
      }
      function mountHoistable(hoistableRoot, type, instance) {
        hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
        hoistableRoot.head.insertBefore(
          instance,
          "title" === type ? hoistableRoot.querySelector("head > title") : null
        );
      }
      function isHostHoistableType(type, props, hostContext) {
        if (1 === hostContext || null != props.itemProp) return false;
        switch (type) {
          case "meta":
          case "title":
            return true;
          case "style":
            if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href)
              break;
            return true;
          case "link":
            if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError)
              break;
            switch (props.rel) {
              case "stylesheet":
                return type = props.disabled, "string" === typeof props.precedence && null == type;
              default:
                return true;
            }
          case "script":
            if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src)
              return true;
        }
        return false;
      }
      function maySuspendCommit(type, props) {
        return "img" === type && null != props.src && "" !== props.src && null == props.onLoad && "lazy" !== props.loading;
      }
      function preloadResource(resource) {
        return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? false : true;
      }
      function estimateImageBytes(instance) {
        return (instance.width || 100) * (instance.height || 100) * ("number" === typeof devicePixelRatio ? devicePixelRatio : 1) * 0.25;
      }
      function suspendInstance(state, instance) {
        "function" === typeof instance.decode && (state.imgCount++, instance.complete || (state.imgBytes += estimateImageBytes(instance), state.suspenseyImages.push(instance)), state = onUnsuspendImg.bind(state), instance.decode().then(state, state));
      }
      function suspendResource(state, hoistableRoot, resource, props) {
        if ("stylesheet" === resource.type && ("string" !== typeof props.media || false !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
          if (null === resource.instance) {
            var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(
              getStylesheetSelectorFromKey(key)
            );
            if (instance) {
              hoistableRoot = instance._p;
              null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
              resource.state.loading |= 4;
              resource.instance = instance;
              markNodeAsHoistable(instance);
              return;
            }
            instance = hoistableRoot.ownerDocument || hoistableRoot;
            props = stylesheetPropsFromRawProps(props);
            (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
            instance = instance.createElement("link");
            markNodeAsHoistable(instance);
            var linkInstance = instance;
            linkInstance._p = new Promise(function(resolve, reject) {
              linkInstance.onload = resolve;
              linkInstance.onerror = reject;
            });
            setInitialProperties(instance, "link", props);
            resource.instance = instance;
          }
          null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
          state.stylesheets.set(resource, hoistableRoot);
          (hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
        }
      }
      var estimatedBytesWithinLimit = 0;
      function waitForCommitToBeReady(state, timeoutOffset) {
        state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
        return 0 < state.count || 0 < state.imgCount ? function(commit) {
          var stylesheetTimer = setTimeout(function() {
            state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
            if (state.unsuspend) {
              var unsuspend = state.unsuspend;
              state.unsuspend = null;
              unsuspend();
            }
          }, 6e4 + timeoutOffset);
          0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
          var imgTimer = setTimeout(
            function() {
              state.waitingForImages = false;
              if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
                var unsuspend = state.unsuspend;
                state.unsuspend = null;
                unsuspend();
              }
            },
            (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset
          );
          state.unsuspend = commit;
          return function() {
            state.unsuspend = null;
            clearTimeout(stylesheetTimer);
            clearTimeout(imgTimer);
          };
        } : null;
      }
      function checkIfFullyUnsuspended(state) {
        if (0 === state.count && (0 === state.imgCount || !state.waitingForImages)) {
          if (state.stylesheets) insertSuspendedStylesheets(state, state.stylesheets);
          else if (state.unsuspend) {
            var unsuspend = state.unsuspend;
            state.unsuspend = null;
            unsuspend();
          }
        }
      }
      function onUnsuspend() {
        this.count--;
        checkIfFullyUnsuspended(this);
      }
      function onUnsuspendImg() {
        this.imgCount--;
        checkIfFullyUnsuspended(this);
      }
      var precedencesByRoot = null;
      function insertSuspendedStylesheets(state, resources) {
        state.stylesheets = null;
        null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
      }
      function insertStylesheetIntoRoot(root2, resource) {
        if (!(resource.state.loading & 4)) {
          var precedences = precedencesByRoot.get(root2);
          if (precedences) var last = precedences.get(null);
          else {
            precedences = /* @__PURE__ */ new Map();
            precedencesByRoot.set(root2, precedences);
            for (var nodes = root2.querySelectorAll(
              "link[data-precedence],style[data-precedence]"
            ), i = 0; i < nodes.length; i++) {
              var node = nodes[i];
              if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media"))
                precedences.set(node.dataset.precedence, node), last = node;
            }
            last && precedences.set(null, last);
          }
          nodes = resource.instance;
          node = nodes.getAttribute("data-precedence");
          i = precedences.get(node) || last;
          i === last && precedences.set(null, nodes);
          precedences.set(node, nodes);
          this.count++;
          last = onUnsuspend.bind(this);
          nodes.addEventListener("load", last);
          nodes.addEventListener("error", last);
          i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root2 = 9 === root2.nodeType ? root2.head : root2, root2.insertBefore(nodes, root2.firstChild));
          resource.state.loading |= 4;
        }
      }
      var HostTransitionContext = {
        $$typeof: REACT_CONTEXT_TYPE,
        Provider: null,
        Consumer: null,
        _currentValue: sharedNotPendingObject,
        _currentValue2: sharedNotPendingObject,
        _threadCount: 0
      };
      function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
        this.tag = 1;
        this.containerInfo = containerInfo;
        this.pingCache = this.current = this.pendingChildren = null;
        this.timeoutHandle = -1;
        this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
        this.callbackPriority = 0;
        this.expirationTimes = createLaneMap(-1);
        this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
        this.entanglements = createLaneMap(0);
        this.hiddenUpdates = createLaneMap(null);
        this.identifierPrefix = identifierPrefix;
        this.onUncaughtError = onUncaughtError;
        this.onCaughtError = onCaughtError;
        this.onRecoverableError = onRecoverableError;
        this.pooledCache = null;
        this.pooledCacheLanes = 0;
        this.formState = formState;
        this.transitionTypes = null;
        this.incompleteTransitions = /* @__PURE__ */ new Map();
      }
      function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
        containerInfo = new FiberRootNode(
          containerInfo,
          tag,
          hydrate,
          identifierPrefix,
          onUncaughtError,
          onCaughtError,
          onRecoverableError,
          onDefaultTransitionIndicator,
          formState
        );
        tag = 1;
        true === isStrictMode && (tag |= 24);
        isStrictMode = createFiberImplClass(3, null, null, tag);
        containerInfo.current = isStrictMode;
        isStrictMode.stateNode = containerInfo;
        tag = createCache();
        tag.refCount++;
        containerInfo.pooledCache = tag;
        tag.refCount++;
        isStrictMode.memoizedState = {
          element: initialChildren,
          isDehydrated: hydrate,
          cache: tag
        };
        initializeUpdateQueue(isStrictMode);
        return containerInfo;
      }
      function getContextForSubtree(parentComponent) {
        if (!parentComponent) return emptyContextObject;
        parentComponent = emptyContextObject;
        return parentComponent;
      }
      function updateContainerImpl(rootFiber, lane, element, container2, parentComponent, callback) {
        parentComponent = getContextForSubtree(parentComponent);
        null === container2.context ? container2.context = parentComponent : container2.pendingContext = parentComponent;
        container2 = createUpdate(lane);
        container2.payload = { element };
        callback = void 0 === callback ? null : callback;
        null !== callback && (container2.callback = callback);
        element = enqueueUpdate(rootFiber, container2, lane);
        null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
      }
      function markRetryLaneImpl(fiber, retryLane) {
        fiber = fiber.memoizedState;
        if (null !== fiber && null !== fiber.dehydrated) {
          var a = fiber.retryLane;
          fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
        }
      }
      function markRetryLaneIfNotHydrated(fiber, retryLane) {
        markRetryLaneImpl(fiber, retryLane);
        (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
      }
      function attemptContinuousHydration(fiber) {
        if (13 === fiber.tag || 31 === fiber.tag) {
          var root2 = enqueueConcurrentRenderForLane(fiber, 67108864);
          null !== root2 && scheduleUpdateOnFiber(root2, fiber, 67108864);
          markRetryLaneIfNotHydrated(fiber, 67108864);
        }
      }
      function attemptHydrationAtCurrentPriority(fiber) {
        if (13 === fiber.tag || 31 === fiber.tag) {
          var lane = requestUpdateLane();
          lane = getBumpedLaneForHydrationByLane(lane);
          var root2 = enqueueConcurrentRenderForLane(fiber, lane);
          null !== root2 && scheduleUpdateOnFiber(root2, fiber, lane);
          markRetryLaneIfNotHydrated(fiber, lane);
        }
      }
      var _enabled = true;
      function dispatchDiscreteEvent(domEventName, eventSystemFlags, container2, nativeEvent) {
        var prevTransition = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        try {
          ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container2, nativeEvent);
        } finally {
          ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
        }
      }
      function dispatchContinuousEvent(domEventName, eventSystemFlags, container2, nativeEvent) {
        var prevTransition = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        try {
          ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container2, nativeEvent);
        } finally {
          ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
        }
      }
      function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        if (_enabled) {
          var blockedOn = findInstanceBlockingEvent(nativeEvent);
          if (null === blockedOn)
            dispatchEventForPluginEventSystem(
              domEventName,
              eventSystemFlags,
              nativeEvent,
              return_targetInst,
              targetContainer
            ), clearIfContinuousEvent(domEventName, nativeEvent);
          else if (queueIfContinuousEvent(
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          ))
            nativeEvent.stopPropagation();
          else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
            for (; null !== blockedOn; ) {
              var fiber = getInstanceFromNode(blockedOn);
              if (null !== fiber)
                switch (fiber.tag) {
                  case 3:
                    fiber = fiber.stateNode;
                    if (fiber.current.memoizedState.isDehydrated) {
                      var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                      if (0 !== lanes) {
                        var root2 = fiber;
                        root2.pendingLanes |= 2;
                        for (root2.entangledLanes |= 2; lanes; ) {
                          var lane = 1 << 31 - clz32(lanes);
                          root2.entanglements[1] |= lane;
                          lanes &= ~lane;
                        }
                        ensureRootIsScheduled(fiber);
                        0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, false));
                      }
                    }
                    break;
                  case 31:
                  case 13:
                    root2 = enqueueConcurrentRenderForLane(fiber, 2), null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
                }
              fiber = findInstanceBlockingEvent(nativeEvent);
              null === fiber && dispatchEventForPluginEventSystem(
                domEventName,
                eventSystemFlags,
                nativeEvent,
                return_targetInst,
                targetContainer
              );
              if (fiber === blockedOn) break;
              blockedOn = fiber;
            }
            null !== blockedOn && nativeEvent.stopPropagation();
          } else
            dispatchEventForPluginEventSystem(
              domEventName,
              eventSystemFlags,
              nativeEvent,
              null,
              targetContainer
            );
        }
      }
      function findInstanceBlockingEvent(nativeEvent) {
        nativeEvent = getEventTarget(nativeEvent);
        return findInstanceBlockingTarget(nativeEvent);
      }
      var return_targetInst = null;
      function findInstanceBlockingTarget(targetNode) {
        return_targetInst = null;
        targetNode = getClosestInstanceFromNode(targetNode);
        if (null !== targetNode) {
          var nearestMounted = getNearestMountedFiber(targetNode);
          if (null === nearestMounted) targetNode = null;
          else {
            var tag = nearestMounted.tag;
            if (13 === tag) {
              targetNode = getSuspenseInstanceFromFiber(nearestMounted);
              if (null !== targetNode) return targetNode;
              targetNode = null;
            } else if (31 === tag) {
              targetNode = getActivityInstanceFromFiber(nearestMounted);
              if (null !== targetNode) return targetNode;
              targetNode = null;
            } else if (3 === tag) {
              if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
                return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
              targetNode = null;
            } else nearestMounted !== targetNode && (targetNode = null);
          }
        }
        return_targetInst = targetNode;
        return null;
      }
      function getEventPriority(domEventName) {
        switch (domEventName) {
          case "beforetoggle":
          case "cancel":
          case "click":
          case "close":
          case "contextmenu":
          case "copy":
          case "cut":
          case "auxclick":
          case "dblclick":
          case "dragend":
          case "dragstart":
          case "drop":
          case "focusin":
          case "focusout":
          case "input":
          case "invalid":
          case "keydown":
          case "keypress":
          case "keyup":
          case "mousedown":
          case "mouseup":
          case "paste":
          case "pause":
          case "play":
          case "pointercancel":
          case "pointerdown":
          case "pointerup":
          case "ratechange":
          case "reset":
          case "seeked":
          case "submit":
          case "toggle":
          case "touchcancel":
          case "touchend":
          case "touchstart":
          case "volumechange":
          case "change":
          case "selectionchange":
          case "textInput":
          case "compositionstart":
          case "compositionend":
          case "compositionupdate":
          case "beforeblur":
          case "afterblur":
          case "beforeinput":
          case "blur":
          case "fullscreenchange":
          case "fullscreenerror":
          case "focus":
          case "hashchange":
          case "popstate":
          case "select":
          case "selectstart":
            return 2;
          case "drag":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "mousemove":
          case "mouseout":
          case "mouseover":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "resize":
          case "scroll":
          case "touchmove":
          case "wheel":
          case "mouseenter":
          case "mouseleave":
          case "pointerenter":
          case "pointerleave":
            return 8;
          case "message":
            switch (getCurrentPriorityLevel()) {
              case ImmediatePriority:
                return 2;
              case UserBlockingPriority:
                return 8;
              case NormalPriority$1:
              case LowPriority:
                return 32;
              case IdlePriority:
                return 268435456;
              default:
                return 32;
            }
          default:
            return 32;
        }
      }
      var hasScheduledReplayAttempt = false;
      var queuedFocus = null;
      var queuedDrag = null;
      var queuedMouse = null;
      var queuedPointers = /* @__PURE__ */ new Map();
      var queuedPointerCaptures = /* @__PURE__ */ new Map();
      var queuedExplicitHydrationTargets = [];
      var discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
        " "
      );
      function clearIfContinuousEvent(domEventName, nativeEvent) {
        switch (domEventName) {
          case "focusin":
          case "focusout":
            queuedFocus = null;
            break;
          case "dragenter":
          case "dragleave":
            queuedDrag = null;
            break;
          case "mouseover":
          case "mouseout":
            queuedMouse = null;
            break;
          case "pointerover":
          case "pointerout":
            queuedPointers.delete(nativeEvent.pointerId);
            break;
          case "gotpointercapture":
          case "lostpointercapture":
            queuedPointerCaptures.delete(nativeEvent.pointerId);
        }
      }
      function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent)
          return existingQueuedEvent = {
            blockedOn,
            domEventName,
            eventSystemFlags,
            nativeEvent,
            targetContainers: [targetContainer]
          }, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
        existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
        blockedOn = existingQueuedEvent.targetContainers;
        null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
        return existingQueuedEvent;
      }
      function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
        switch (domEventName) {
          case "focusin":
            return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(
              queuedFocus,
              blockedOn,
              domEventName,
              eventSystemFlags,
              targetContainer,
              nativeEvent
            ), true;
          case "dragenter":
            return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(
              queuedDrag,
              blockedOn,
              domEventName,
              eventSystemFlags,
              targetContainer,
              nativeEvent
            ), true;
          case "mouseover":
            return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(
              queuedMouse,
              blockedOn,
              domEventName,
              eventSystemFlags,
              targetContainer,
              nativeEvent
            ), true;
          case "pointerover":
            var pointerId = nativeEvent.pointerId;
            queuedPointers.set(
              pointerId,
              accumulateOrCreateContinuousQueuedReplayableEvent(
                queuedPointers.get(pointerId) || null,
                blockedOn,
                domEventName,
                eventSystemFlags,
                targetContainer,
                nativeEvent
              )
            );
            return true;
          case "gotpointercapture":
            return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(
              pointerId,
              accumulateOrCreateContinuousQueuedReplayableEvent(
                queuedPointerCaptures.get(pointerId) || null,
                blockedOn,
                domEventName,
                eventSystemFlags,
                targetContainer,
                nativeEvent
              )
            ), true;
        }
        return false;
      }
      function attemptExplicitHydrationTarget(queuedTarget) {
        var targetInst = getClosestInstanceFromNode(queuedTarget.target);
        if (null !== targetInst) {
          var nearestMounted = getNearestMountedFiber(targetInst);
          if (null !== nearestMounted) {
            if (targetInst = nearestMounted.tag, 13 === targetInst) {
              if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
                queuedTarget.blockedOn = targetInst;
                runWithPriority(queuedTarget.priority, function() {
                  attemptHydrationAtCurrentPriority(nearestMounted);
                });
                return;
              }
            } else if (31 === targetInst) {
              if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
                queuedTarget.blockedOn = targetInst;
                runWithPriority(queuedTarget.priority, function() {
                  attemptHydrationAtCurrentPriority(nearestMounted);
                });
                return;
              }
            } else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
              queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
              return;
            }
          }
        }
        queuedTarget.blockedOn = null;
      }
      function attemptReplayContinuousQueuedEvent(queuedEvent) {
        if (null !== queuedEvent.blockedOn) return false;
        for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length; ) {
          var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
          if (null === nextBlockedOn) {
            nextBlockedOn = queuedEvent.nativeEvent;
            var nativeEventClone = new nextBlockedOn.constructor(
              nextBlockedOn.type,
              nextBlockedOn
            );
            currentReplayingEvent = nativeEventClone;
            nextBlockedOn.target.dispatchEvent(nativeEventClone);
            currentReplayingEvent = null;
          } else
            return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
          targetContainers.shift();
        }
        return true;
      }
      function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
        attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
      }
      function replayUnblockedEvents() {
        hasScheduledReplayAttempt = false;
        null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
        null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
        null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
        queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
        queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
      }
      function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
        queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(
          Scheduler.unstable_NormalPriority,
          replayUnblockedEvents
        )));
      }
      var lastScheduledReplayQueue = null;
      function scheduleReplayQueueIfNeeded(formReplayingQueue) {
        lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(
          Scheduler.unstable_NormalPriority,
          function() {
            lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
            for (var i = 0; i < formReplayingQueue.length; i += 3) {
              var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
              if ("function" !== typeof submitterOrAction)
                if (null === findInstanceBlockingTarget(submitterOrAction || form))
                  continue;
                else break;
              var formInst = getInstanceFromNode(form);
              null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(
                formInst,
                {
                  pending: true,
                  data: formData,
                  method: form.method,
                  action: submitterOrAction
                },
                submitterOrAction,
                formData
              ));
            }
          }
        ));
      }
      function retryIfBlockedOn(unblocked) {
        function unblock(queuedEvent) {
          return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
        }
        null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
        null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
        null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
        queuedPointers.forEach(unblock);
        queuedPointerCaptures.forEach(unblock);
        for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
          var queuedTarget = queuedExplicitHydrationTargets[i];
          queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
        }
        for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn); )
          attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
        i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
        if (null != i)
          for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
            var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
            if ("function" === typeof submitterOrAction)
              formProps || scheduleReplayQueueIfNeeded(i);
            else if (formProps) {
              var action = null;
              if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
                if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
                  action = formProps.formAction;
                else {
                  if (null !== findInstanceBlockingTarget(form)) continue;
                }
              else action = formProps.action;
              "function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
              scheduleReplayQueueIfNeeded(i);
            }
          }
      }
      function defaultOnDefaultTransitionIndicator() {
        function handleNavigate(event) {
          event.canIntercept && "react-transition" === event.info && event.intercept({
            handler: function() {
              return new Promise(function(resolve) {
                return pendingResolve = resolve;
              });
            },
            focusReset: "manual",
            scroll: "manual"
          });
        }
        function handleNavigateComplete() {
          null !== pendingResolve && (pendingResolve(), pendingResolve = null);
          isCancelled || setTimeout(startFakeNavigation, 20);
        }
        function startFakeNavigation() {
          if (!isCancelled && !navigation.transition) {
            var currentEntry = navigation.currentEntry;
            currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
              state: currentEntry.getState(),
              info: "react-transition",
              history: "replace"
            });
          }
        }
        if ("object" === typeof navigation) {
          var isCancelled = false, pendingResolve = null;
          navigation.addEventListener("navigate", handleNavigate);
          navigation.addEventListener("navigatesuccess", handleNavigateComplete);
          navigation.addEventListener("navigateerror", handleNavigateComplete);
          setTimeout(startFakeNavigation, 100);
          return function() {
            isCancelled = true;
            navigation.removeEventListener("navigate", handleNavigate);
            navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
            navigation.removeEventListener("navigateerror", handleNavigateComplete);
            null !== pendingResolve && (pendingResolve(), pendingResolve = null);
          };
        }
      }
      function ReactDOMRoot(internalRoot) {
        this._internalRoot = internalRoot;
      }
      ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
        var root2 = this._internalRoot;
        if (null === root2) throw Error(formatProdErrorMessage(409));
        var current = root2.current, lane = requestUpdateLane();
        updateContainerImpl(current, lane, children, root2, null, null);
      };
      ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
        var root2 = this._internalRoot;
        if (null !== root2) {
          this._internalRoot = null;
          var container2 = root2.containerInfo;
          updateContainerImpl(root2.current, 2, null, root2, null, null);
          flushSyncWork$1();
          container2[internalContainerInstanceKey] = null;
        }
      };
      function ReactDOMHydrationRoot(internalRoot) {
        this._internalRoot = internalRoot;
      }
      ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
        if (target) {
          var updatePriority = resolveUpdatePriority();
          target = { blockedOn: null, target, priority: updatePriority };
          for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++) ;
          queuedExplicitHydrationTargets.splice(i, 0, target);
          0 === i && attemptExplicitHydrationTarget(target);
        }
      };
      var isomorphicReactPackageVersion$jscomp$inline_2043 = React.version;
      if ("19.3.1" !== isomorphicReactPackageVersion$jscomp$inline_2043)
        throw Error(
          formatProdErrorMessage(
            527,
            isomorphicReactPackageVersion$jscomp$inline_2043,
            "19.3.1"
          )
        );
      ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
        var fiber = componentOrElement._reactInternals;
        if (void 0 === fiber) {
          if ("function" === typeof componentOrElement.render)
            throw Error(formatProdErrorMessage(188));
          componentOrElement = Object.keys(componentOrElement).join(",");
          throw Error(formatProdErrorMessage(268, componentOrElement));
        }
        componentOrElement = findCurrentFiberUsingSlowPath(fiber);
        componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
        componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
        return componentOrElement;
      };
      var internals$jscomp$inline_2586 = {
        bundleType: 0,
        version: "19.3.1",
        rendererPackageName: "react-dom",
        currentDispatcherRef: ReactSharedInternals,
        reconcilerVersion: "19.3.1"
      };
      if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
        hook$jscomp$inline_2587 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!hook$jscomp$inline_2587.isDisabled && hook$jscomp$inline_2587.supportsFiber)
          try {
            rendererID = hook$jscomp$inline_2587.inject(
              internals$jscomp$inline_2586
            ), injectedHook = hook$jscomp$inline_2587;
          } catch (err) {
          }
      }
      var hook$jscomp$inline_2587;
      exports.createRoot = function(container2, options2) {
        if (!isValidContainer(container2)) throw Error(formatProdErrorMessage(299));
        var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
        null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError));
        options2 = createFiberRoot(
          container2,
          1,
          false,
          null,
          null,
          isStrictMode,
          identifierPrefix,
          null,
          onUncaughtError,
          onCaughtError,
          onRecoverableError,
          defaultOnDefaultTransitionIndicator
        );
        container2[internalContainerInstanceKey] = options2.current;
        listenToAllSupportedEvents(container2);
        return new ReactDOMRoot(options2);
      };
      exports.hydrateRoot = function(container2, initialChildren, options2) {
        if (!isValidContainer(container2)) throw Error(formatProdErrorMessage(299));
        var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, formState = null;
        null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError), void 0 !== options2.formState && (formState = options2.formState));
        initialChildren = createFiberRoot(
          container2,
          1,
          true,
          initialChildren,
          null != options2 ? options2 : null,
          isStrictMode,
          identifierPrefix,
          formState,
          onUncaughtError,
          onCaughtError,
          onRecoverableError,
          defaultOnDefaultTransitionIndicator
        );
        initialChildren.context = getContextForSubtree(null);
        options2 = initialChildren.current;
        isStrictMode = requestUpdateLane();
        isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
        identifierPrefix = createUpdate(isStrictMode);
        identifierPrefix.callback = null;
        enqueueUpdate(options2, identifierPrefix, isStrictMode);
        options2 = isStrictMode;
        initialChildren.current.lanes = options2;
        markRootUpdated$1(initialChildren, options2);
        ensureRootIsScheduled(initialChildren);
        container2[internalContainerInstanceKey] = initialChildren.current;
        listenToAllSupportedEvents(container2);
        return new ReactDOMHydrationRoot(initialChildren);
      };
      exports.version = "19.3.1";
    }
  });

  // node_modules/react-dom/client.js
  var require_client = __commonJS({
    "node_modules/react-dom/client.js"(exports, module) {
      "use strict";
      function checkDCE() {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
          return;
        }
        if (false) {
          throw new Error("^_^");
        }
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
        } catch (err) {
          console.error(err);
        }
      }
      if (true) {
        checkDCE();
        module.exports = require_react_dom_client_production();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react/cjs/react-jsx-runtime.production.js
  var require_react_jsx_runtime_production = __commonJS({
    "node_modules/react/cjs/react-jsx-runtime.production.js"(exports) {
      "use strict";
      var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      function jsxProd(type, config, maybeKey) {
        var key = null;
        void 0 !== maybeKey && (key = "" + maybeKey);
        void 0 !== config.key && (key = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        config = maybeKey.ref;
        return {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          ref: void 0 !== config ? config : null,
          props: maybeKey
        };
      }
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.jsx = jsxProd;
      exports.jsxs = jsxProd;
    }
  });

  // node_modules/react/jsx-runtime.js
  var require_jsx_runtime = __commonJS({
    "node_modules/react/jsx-runtime.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_jsx_runtime_production();
      } else {
        module.exports = null;
      }
    }
  });

  // src/ui/main.tsx
  var import_client = __toESM(require_client());

  // src/ui/App.tsx
  var import_react3 = __toESM(require_react());

  // src/engine/clock.ts
  var GameClock = class {
    fixedStep;
    maxStepsPerFrame;
    maxFrameDelta;
    /** 已模拟的游戏时间（秒）。暂停期间不增长。 */
    elapsed = 0;
    /** 最近一帧执行了多少逻辑步（调试/性能面板用）。 */
    lastSteps = 0;
    /** 累计丢弃的时间（秒），用于诊断掉帧。 */
    droppedTime = 0;
    accumulator = 0;
    constructor(options = {}) {
      this.fixedStep = options.fixedStep ?? 1 / 60;
      this.maxStepsPerFrame = options.maxStepsPerFrame ?? 5;
      this.maxFrameDelta = options.maxFrameDelta ?? 0.25;
    }
    /** 暂停/恢复时调用：清空累加器，保证恢复后不会“补播”暂停期间的时间。 */
    resetAccumulator() {
      this.accumulator = 0;
    }
    /**
     * 推进时钟。deltaSeconds 为真实帧间隔。
     * 返回本帧执行的逻辑步数。
     */
    advance(deltaSeconds, tick) {
      let delta = deltaSeconds;
      if (!Number.isFinite(delta) || delta <= 0) {
        this.lastSteps = 0;
        return 0;
      }
      if (delta > this.maxFrameDelta) {
        this.droppedTime += delta - this.maxFrameDelta;
        delta = this.maxFrameDelta;
      }
      this.accumulator += delta;
      let steps = 0;
      while (this.accumulator >= this.fixedStep && steps < this.maxStepsPerFrame) {
        this.accumulator -= this.fixedStep;
        this.elapsed += this.fixedStep;
        tick(this.fixedStep);
        steps++;
      }
      if (steps === this.maxStepsPerFrame && this.accumulator > this.fixedStep) {
        this.droppedTime += this.accumulator - this.fixedStep;
        this.accumulator = this.fixedStep;
      }
      this.lastSteps = steps;
      return steps;
    }
    reset() {
      this.accumulator = 0;
      this.elapsed = 0;
      this.lastSteps = 0;
      this.droppedTime = 0;
    }
  };

  // src/platform/activity.ts
  function observeActivity(onInactive, onActive, target = window) {
    const doc = target.document;
    const onVisibility = () => {
      if (doc.hidden) onInactive();
      else onActive();
    };
    const onBlur = () => onInactive();
    const onFocus = () => onActive();
    const onPageHide = () => onInactive();
    doc.addEventListener("visibilitychange", onVisibility);
    target.addEventListener("blur", onBlur);
    target.addEventListener("focus", onFocus);
    target.addEventListener("pagehide", onPageHide);
    return {
      dispose() {
        doc.removeEventListener("visibilitychange", onVisibility);
        target.removeEventListener("blur", onBlur);
        target.removeEventListener("focus", onFocus);
        target.removeEventListener("pagehide", onPageHide);
      }
    };
  }

  // src/platform/audio.ts
  var TONES = {
    swing: { type: "square", from: 620, to: 280, duration: 0.09, gain: 0.05 },
    hit: { type: "square", from: 320, to: 140, duration: 0.09, gain: 0.09 },
    crit: { type: "square", from: 520, to: 180, duration: 0.16, gain: 0.12 },
    spin: { type: "sawtooth", from: 240, to: 640, duration: 0.24, gain: 0.07 },
    dash: { type: "triangle", from: 180, to: 780, duration: 0.2, gain: 0.08 },
    heal: { type: "sine", from: 420, to: 880, duration: 0.36, gain: 0.1 },
    hurt: { type: "sawtooth", from: 300, to: 90, duration: 0.22, gain: 0.12 },
    kill: { type: "square", from: 200, to: 60, duration: 0.2, gain: 0.1 },
    jump: { type: "square", from: 320, to: 620, duration: 0.09, gain: 0.045 },
    telegraph: { type: "square", from: 700, to: 700, duration: 0.07, gain: 0.06 },
    levelUp: { type: "square", from: 520, to: 1180, duration: 0.4, gain: 0.11 },
    waveStart: { type: "square", from: 200, to: 420, duration: 0.34, gain: 0.1 },
    waveClear: { type: "square", from: 700, to: 300, duration: 0.32, gain: 0.1 },
    death: { type: "sawtooth", from: 300, to: 60, duration: 0.9, gain: 0.13 },
    ui: { type: "square", from: 640, to: 640, duration: 0.05, gain: 0.05 }
  };
  var SynthAudio = class {
    context = null;
    master = null;
    muted = false;
    get available() {
      return typeof globalThis.AudioContext !== "undefined" || typeof globalThis.webkitAudioContext !== "undefined";
    }
    unlock() {
      if (this.context) {
        if (this.context.state === "suspended") void this.context.resume();
        return;
      }
      try {
        const Ctor = globalThis.AudioContext ?? globalThis.webkitAudioContext;
        if (!Ctor) return;
        const ctx = new Ctor();
        const master = ctx.createGain();
        master.gain.value = this.muted ? 0 : 0.6;
        master.connect(ctx.destination);
        this.context = ctx;
        this.master = master;
      } catch {
        this.context = null;
        this.master = null;
      }
    }
    play(id) {
      const ctx = this.context;
      const master = this.master;
      if (!ctx || !master || this.muted) return;
      const spec = TONES[id];
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = spec.type;
        osc.frequency.setValueAtTime(spec.from, now);
        osc.frequency.linearRampToValueAtTime(Math.max(40, spec.to), now + spec.duration);
        gain.gain.setValueAtTime(1e-4, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(2e-4, spec.gain), now + 0.012);
        gain.gain.exponentialRampToValueAtTime(1e-4, now + spec.duration);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + spec.duration + 0.05);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      } catch {
      }
    }
    setMuted(muted) {
      this.muted = muted;
      if (this.master && this.context) {
        this.master.gain.setValueAtTime(muted ? 0 : 0.6, this.context.currentTime);
      }
    }
    dispose() {
      try {
        void this.context?.close();
      } catch {
      }
      this.context = null;
      this.master = null;
    }
  };
  function createAudioBus() {
    return new SynthAudio();
  }

  // src/platform/keyboard.ts
  var DEFAULT_BINDINGS = {
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
    ArrowUp: "jump",
    KeyW: "jump",
    Space: "jump",
    KeyJ: "attack",
    KeyZ: "attack",
    KeyK: "spin",
    Digit1: "spin",
    KeyL: "dash",
    Digit2: "dash",
    KeyH: "heal",
    Digit3: "heal",
    KeyP: "pause",
    Escape: "pause",
    Enter: "confirm"
  };
  var CONFIRM_KEYS = /* @__PURE__ */ new Set(["Enter"]);
  var KeyboardInput = class {
    held = /* @__PURE__ */ new Set();
    pressed = [];
    disposers = [];
    attach(target = window) {
      const onKeyDown = (event) => {
        const action = DEFAULT_BINDINGS[event.code];
        if (!action) return;
        if (event.repeat) {
          event.preventDefault();
          return;
        }
        this.press(action);
        if (action === "jump" || action === "pause" || CONFIRM_KEYS.has(event.code)) event.preventDefault();
      };
      const onKeyUp = (event) => {
        const action = DEFAULT_BINDINGS[event.code];
        if (!action) return;
        this.release(action);
        if (action === "jump") event.preventDefault();
      };
      const onBlur = () => this.clear();
      target.addEventListener("keydown", onKeyDown, { passive: false });
      target.addEventListener("keyup", onKeyUp, { passive: false });
      target.addEventListener("blur", onBlur);
      this.disposers.push(
        () => target.removeEventListener("keydown", onKeyDown),
        () => target.removeEventListener("keyup", onKeyUp),
        () => target.removeEventListener("blur", onBlur)
      );
    }
    /** 供鼠标点击 / 屏幕按钮注入动作。 */
    press(action) {
      if (this.held.has(action)) return;
      this.held.add(action);
      this.pressed.push(action);
    }
    release(action) {
      this.held.delete(action);
    }
    isDown(action) {
      return this.held.has(action);
    }
    drainPressed(out) {
      let count = 0;
      for (let i = 0; i < this.pressed.length; i++) {
        const action = this.pressed[i];
        if (action !== void 0) out[count++] = action;
      }
      this.pressed.length = 0;
      return count;
    }
    /** 清空所有状态（切窗口、暂停时调用，避免恢复后一次性触发一堆动作）。 */
    clear() {
      this.held.clear();
      this.pressed.length = 0;
    }
    /** 只丢弃"待处理的按下事件"，保留按住状态（冻结期间用）。 */
    clearPressed() {
      this.pressed.length = 0;
    }
    dispose() {
      for (let i = 0; i < this.disposers.length; i++) this.disposers[i]();
      this.disposers.length = 0;
      this.clear();
    }
  };

  // src/platform/storage.ts
  var MemoryStorage = class {
    data = /* @__PURE__ */ new Map();
    getItem(key) {
      return this.data.has(key) ? this.data.get(key) : null;
    }
    setItem(key, value) {
      this.data.set(key, value);
    }
    removeItem(key) {
      this.data.delete(key);
    }
  };
  function createStorage() {
    try {
      const probe = globalThis.localStorage;
      if (!probe) throw new Error("localStorage unavailable");
      const testKey = "__pixel_warden_probe__";
      probe.setItem(testKey, "1");
      probe.removeItem(testKey);
      return { storage: probe, available: true, reason: "" };
    } catch {
      return {
        storage: new MemoryStorage(),
        available: false,
        reason: "当前浏览器禁用了本地存储，进度只能保存在这次会话里。"
      };
    }
  }

  // src/engine/math.ts
  var TAU = Math.PI * 2;
  var DEG = Math.PI / 180;
  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function damp(current, target, lambda, dt) {
    return lerp(current, target, 1 - Math.exp(-lambda * dt));
  }
  function approach(current, target, maxDelta) {
    const d = target - current;
    if (Math.abs(d) <= maxDelta) return target;
    return current + (d > 0 ? maxDelta : -maxDelta);
  }
  function circleTouchesBox(cx, cy, radius, b) {
    const nearestX = clamp(cx, b.x - b.w * 0.5, b.x + b.w * 0.5);
    const nearestY = clamp(cy, b.y, b.y + b.h);
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  // src/game/config.ts
  var ARENA = {
    /** 可站立的水平范围（墙在范围之外）。 */
    minX: -34,
    maxX: 34,
    /** 地面高度（脚底 y）。 */
    floorY: 0,
    /** 场景前后深度的一半（纯 3D 表现，玩法仍在一条线上）。 */
    depth: 9
  };
  var GRAVITY = -52;
  var FIXED_STEP = 1 / 60;
  var PLAYER_BASE = {
    w: 1.15,
    h: 2.35,
    speed: 9.8,
    accel: 85,
    airAccel: 52,
    friction: 70,
    jumpVelocity: 18,
    airJumpMul: 0.96,
    maxJumpCount: 2,
    coyoteTime: 0.1,
    jumpBufferTime: 0.13,
    maxFallSpeed: 40,
    atk: 12,
    maxHp: 100,
    hitInvuln: 0.7,
    maxHpPerLevel: 14,
    atkPerLevel: 2,
    hurtKnockback: 6.5
  };
  function xpNeededForLevel(level) {
    return Math.round(48 * Math.pow(1.27, level - 1));
  }
  var CAMERA = {
    /** 相机在目标后上方的偏移。 */
    offsetY: 6.2,
    offsetZ: 17.5,
    /** 注视点在玩家上方的高度。 */
    lookAtY: 2.9,
    /** 水平跟随的朝向预判量。 */
    lookAhead: 3.4,
    followLambda: 7.5,
    /** 垂直跟随更慢，跳跃时画面不会晃太厉害。 */
    verticalLambda: 3.4,
    fovDeg: 38,
    near: 1.5
  };
  var WAVE = {
    intermissionSeconds: 4.2,
    spawnTickInterval: 0.55,
    /** 场上同时存在的怪物上限（性能与体验双重考虑）。 */
    maxAliveBase: 7,
    maxAlivePerWave: 0.6,
    maxAliveCap: 14,
    /** 刷怪点与玩家的最小距离。 */
    minSpawnDistance: 11,
    /** 怪物包围盒之间要求保留的最小空气间隙（防止叠在一起）。 */
    minMonsterSpacing: 0.35
  };
  var FX = {
    hitStopPerHit: 0.045,
    hitStopMax: 0.11,
    shakeOnHit: 0.16,
    shakeOnPlayerHit: 0.5,
    shakeDecay: 6.5,
    maxParticles: 420,
    maxTexts: 48,
    maxMonsters: 28
  };
  var RENDER = {
    baseWidth: 400,
    baseHeight: 225,
    minWidth: 288,
    minHeight: 162,
    maxFaces: 3200,
    lightDir: [-0.42, 0.82, 0.39],
    lightAmbient: 0.62,
    /** 3/4 视角俯角，营造像素 3D 的体积感。 */
    pitch: 11 * DEG
  };

  // src/render/camera.ts
  var Camera3D = class {
    x = 0;
    y = 0;
    z = 0;
    width = 400;
    height = 225;
    fov = 38 * DEG;
    near = 1.2;
    focalLength = 300;
    shakeX = 0;
    shakeY = 0;
    /** 相机基向量（世界空间，公开只读，光栅化器直接读取以避免临时对象）。 */
    right = { x: 1, y: 0, z: 0 };
    up = { x: 0, y: 1, z: 0 };
    forward = { x: 0, y: 0, z: -1 };
    setViewport(width, height) {
      this.width = width;
      this.height = height;
      this.focalLength = height * 0.5 / Math.tan(this.fov * 0.5);
    }
    lookAt(fromX, fromY, fromZ, toX, toY, toZ) {
      this.x = fromX;
      this.y = fromY;
      this.z = fromZ;
      let fx = toX - fromX;
      let fy = toY - fromY;
      let fz = toZ - fromZ;
      const flen = Math.hypot(fx, fy, fz) || 1;
      fx /= flen;
      fy /= flen;
      fz /= flen;
      let rx = fy * 0 - fz * 1;
      let ry = fz * 0 - fx * 0;
      let rz = fx * 1 - fy * 0;
      const rlen = Math.hypot(rx, ry, rz) || 1;
      rx /= rlen;
      ry /= rlen;
      rz /= rlen;
      const ux = ry * fz - rz * fy;
      const uy = rz * fx - rx * fz;
      const uz = rx * fy - ry * fx;
      this.right.x = rx;
      this.right.y = ry;
      this.right.z = rz;
      this.up.x = ux;
      this.up.y = uy;
      this.up.z = uz;
      this.forward.x = fx;
      this.forward.y = fy;
      this.forward.z = fz;
    }
    /** 投影一个世界坐标点，返回是否在相机前方。 */
    project(wx, wy, wz, out) {
      const dx = wx - this.x;
      const dy = wy - this.y;
      const dz = wz - this.z;
      const depth = dx * this.forward.x + dy * this.forward.y + dz * this.forward.z;
      if (depth <= this.near) return false;
      const cx = dx * this.right.x + dy * this.right.y + dz * this.right.z;
      const cy = dx * this.up.x + dy * this.up.y + dz * this.up.z;
      const scale = this.focalLength / depth;
      out.x = this.width * 0.5 + cx * scale + this.shakeX;
      out.y = this.height * 0.5 - cy * scale + this.shakeY;
      out.depth = depth;
      return true;
    }
    /** 只求深度（用于排序与剔除）。 */
    depthOf(wx, wy, wz) {
      return (wx - this.x) * this.forward.x + (wy - this.y) * this.forward.y + (wz - this.z) * this.forward.z;
    }
  };

  // src/render/palette.ts
  function pack(r, g, b) {
    return (clampByte(r) << 16 | clampByte(g) << 8 | clampByte(b)) >>> 0;
  }
  function packRgb(rgb) {
    return pack(rgb[0], rgb[1], rgb[2]);
  }
  function clampByte(v) {
    return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
  }
  function shadeColor(packed, mul) {
    const r = (packed >> 16 & 255) * mul;
    const g = (packed >> 8 & 255) * mul;
    const b = (packed & 255) * mul;
    return pack(r, g, b);
  }
  function mixColor(a, b, t) {
    const it = 1 - t;
    const r = (a >> 16 & 255) * it + (b >> 16 & 255) * t;
    const g = (a >> 8 & 255) * it + (b >> 8 & 255) * t;
    const bl = (a & 255) * it + (b & 255) * t;
    return pack(r, g, bl);
  }
  var SHADE_LEVELS = [0.58, 0.74, 0.9, 1.06, 1.22];
  var SHADE_LEVEL_COUNT = SHADE_LEVELS.length;
  function quantizeShade(value) {
    const index = Math.round((value - SHADE_LEVELS[0]) / (SHADE_LEVELS[1] - SHADE_LEVELS[0]));
    const clamped = index < 0 ? 0 : index >= SHADE_LEVELS.length ? SHADE_LEVELS.length - 1 : index;
    return SHADE_LEVELS[clamped];
  }
  var BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function bayer(x, y) {
    const ix = x & 3;
    const iy = y & 3;
    return BAYER_4[iy * 4 + ix];
  }
  function ditherTo(color, toward, t, x, y) {
    if (t <= 0) return color;
    if (t >= 1) return toward;
    const threshold = (bayer(x, y) + 0.5) / 16;
    return t > threshold ? toward : color;
  }
  var cssCache = /* @__PURE__ */ new Map();
  function cssColor(packed) {
    let value = cssCache.get(packed);
    if (value !== void 0) return value;
    if (cssCache.size > 4096) cssCache.clear();
    value = `rgb(${packed >> 16 & 255},${packed >> 8 & 255},${packed & 255})`;
    cssCache.set(packed, value);
    return value;
  }
  function outlineOf(packed) {
    return shadeColor(mixColor(packed, 1052696, 0.45), 0.62);
  }

  // src/render/faces.ts
  var VERTS_PER_FACE = 8;
  var FaceBatch = class {
    constructor(capacity) {
      this.capacity = capacity;
      this.verts = new Int16Array(capacity * VERTS_PER_FACE);
      this.colors = new Int32Array(capacity);
      this.depth = new Float32Array(capacity);
      this.outline = new Uint8Array(capacity);
      this.order = new Array(capacity);
    }
    count = 0;
    verts;
    colors;
    depth;
    outline;
    order;
    reset() {
      this.count = 0;
    }
    push(x0, y0, x1, y1, x2, y2, x3, y3, color, depth, outline) {
      if (this.count >= this.capacity) return;
      const index = this.count++;
      const base = index * VERTS_PER_FACE;
      const verts = this.verts;
      verts[base] = x0;
      verts[base + 1] = y0;
      verts[base + 2] = x1;
      verts[base + 3] = y1;
      verts[base + 4] = x2;
      verts[base + 5] = y2;
      verts[base + 6] = x3;
      verts[base + 7] = y3;
      this.colors[index] = color;
      this.depth[index] = depth;
      this.outline[index] = outline ? 1 : 0;
    }
  };
  var byDepthDescending = (a, b) => depthRef[b] - depthRef[a];
  var depthRef = new Float32Array(0);
  function flushFaces(ctx, batch) {
    const count = batch.count;
    if (count === 0) return;
    depthRef = batch.depth;
    const order = batch.order;
    order.length = count;
    for (let i = 0; i < count; i++) order[i] = i;
    order.sort(byDepthDescending);
    const verts = batch.verts;
    for (let k = 0; k < count; k++) {
      const index = order[k];
      const base = index * VERTS_PER_FACE;
      ctx.beginPath();
      ctx.moveTo(verts[base], verts[base + 1]);
      ctx.lineTo(verts[base + 2], verts[base + 3]);
      ctx.lineTo(verts[base + 4], verts[base + 5]);
      ctx.lineTo(verts[base + 6], verts[base + 7]);
      ctx.closePath();
      const color = batch.colors[index];
      ctx.fillStyle = cssColor(color);
      ctx.fill();
      if (batch.outline[index] === 1) {
        ctx.strokeStyle = cssColor(outlineOf(color));
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // src/render/rasterizer.ts
  var FACES = [
    [0, 1, 3, 7, 5],
    [1, 0, 2, 6, 4],
    [2, 2, 3, 7, 6],
    [3, 0, 1, 5, 4],
    [4, 4, 5, 7, 6],
    [5, 0, 1, 3, 2]
  ];
  var VoxelRasterizer = class {
    constructor(camera, faces) {
      this.camera = camera;
      this.faces = faces;
    }
    style = {
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      pivotX: 0,
      pivotY: 0,
      pivotZ: 0,
      outline: false,
      fog: 0,
      alpha: 1,
      flat: 0
    };
    /** 光照方向（世界空间，已归一化）。 */
    lx = -0.42;
    ly = 0.82;
    lz = 0.39;
    fogColor = 4210778;
    ambient = 0.62;
    sx = new Float32Array(8);
    sy = new Float32Array(8);
    sd = new Float32Array(8);
    wx = new Float32Array(8);
    wy = new Float32Array(8);
    wz = new Float32Array(8);
    nx = new Float32Array(3);
    ny = new Float32Array(3);
    nz = new Float32Array(3);
    setFogColor(color) {
      this.fogColor = color;
    }
    setLight(x, y, z, ambient) {
      const len = Math.hypot(x, y, z) || 1;
      this.lx = x / len;
      this.ly = y / len;
      this.lz = z / len;
      this.ambient = ambient;
    }
    resetStyle() {
      const s = this.style;
      s.rotX = 0;
      s.rotY = 0;
      s.rotZ = 0;
      s.pivotX = 0;
      s.pivotY = 0;
      s.pivotZ = 0;
      s.outline = false;
      s.fog = 0;
      s.alpha = 1;
      s.flat = 0;
    }
    box(x, y, z, w, h, d, color) {
      const s = this.style;
      const cam = this.camera;
      let m00 = 1;
      let m01 = 0;
      let m02 = 0;
      let m10 = 0;
      let m11 = 1;
      let m12 = 0;
      let m20 = 0;
      let m21 = 0;
      let m22 = 1;
      if (s.rotX !== 0 || s.rotY !== 0 || s.rotZ !== 0) {
        const cx = Math.cos(s.rotX);
        const sxr = Math.sin(s.rotX);
        const cy = Math.cos(s.rotY);
        const syr = Math.sin(s.rotY);
        const cz = Math.cos(s.rotZ);
        const szr = Math.sin(s.rotZ);
        const rx00 = 1;
        const rx01 = 0;
        const rx02 = 0;
        const rx10 = 0;
        const rx11 = cx;
        const rx12 = -sxr;
        const rx20 = 0;
        const rx21 = sxr;
        const rx22 = cx;
        const ry00 = cy * rx00 + syr * rx20;
        const ry01 = cy * rx01 + syr * rx21;
        const ry02 = cy * rx02 + syr * rx22;
        const ry10 = rx10;
        const ry11 = rx11;
        const ry12 = rx12;
        const ry20 = -syr * rx00 + cy * rx20;
        const ry21 = -syr * rx01 + cy * rx21;
        const ry22 = -syr * rx02 + cy * rx22;
        m00 = cz * ry00 - szr * ry10;
        m01 = cz * ry01 - szr * ry11;
        m02 = cz * ry02 - szr * ry12;
        m10 = szr * ry00 + cz * ry10;
        m11 = szr * ry01 + cz * ry11;
        m12 = szr * ry02 + cz * ry12;
        m20 = ry20;
        m21 = ry21;
        m22 = ry22;
      }
      const centerX = x;
      const centerY = y + h * 0.5;
      const centerZ = z;
      const pivotX = centerX + s.pivotX;
      const pivotY = centerY + s.pivotY;
      const pivotZ = centerZ + s.pivotZ;
      const hw = w * 0.5;
      const hh = h * 0.5;
      const hd = d * 0.5;
      for (let i = 0; i < 8; i++) {
        const lx = (i & 1) === 0 ? -hw : hw;
        const lz = (i & 2) === 0 ? -hd : hd;
        const ly = (i & 4) === 0 ? -hh : hh;
        const ox = lx - s.pivotX;
        const oy = ly - s.pivotY;
        const oz = lz - s.pivotZ;
        const rx = m00 * ox + m01 * oy + m02 * oz;
        const ry = m10 * ox + m11 * oy + m12 * oz;
        const rz = m20 * ox + m21 * oy + m22 * oz;
        const worldX = pivotX + rx;
        const worldY = pivotY + ry;
        const worldZ = pivotZ + rz;
        this.wx[i] = worldX;
        this.wy[i] = worldY;
        this.wz[i] = worldZ;
        const depth = cam.depthOf(worldX, worldY, worldZ);
        if (depth <= cam.near) {
          this.sd[i] = -1;
          continue;
        }
        const cxv = (worldX - cam.x) * cam.right.x + (worldY - cam.y) * cam.right.y + (worldZ - cam.z) * cam.right.z;
        const cyv = (worldX - cam.x) * cam.up.x + (worldY - cam.y) * cam.up.y + (worldZ - cam.z) * cam.up.z;
        const scale = cam.focalLength / depth;
        this.sx[i] = cam.width * 0.5 + cxv * scale + cam.shakeX;
        this.sy[i] = cam.height * 0.5 - cyv * scale + cam.shakeY;
        this.sd[i] = depth;
      }
      this.nx[0] = m00;
      this.ny[0] = m10;
      this.nz[0] = m20;
      this.nx[1] = m01;
      this.ny[1] = m11;
      this.nz[1] = m21;
      this.nx[2] = m02;
      this.ny[2] = m12;
      this.nz[2] = m22;
      const fog = s.fog <= 0 ? 0 : s.fog >= 1 ? 1 : s.fog;
      const alpha = s.alpha >= 1 ? 1 : s.alpha <= 0 ? 0 : s.alpha;
      if (alpha <= 0) {
        this.resetStyle();
        return;
      }
      for (let f = 0; f < 6; f++) {
        const face = FACES[f];
        const axis = face[0] % 3;
        const sign = face[0] < 3 ? 1 : -1;
        const nx0 = this.nx[axis] * sign;
        const ny0 = this.ny[axis] * sign;
        const nz0 = this.nz[axis] * sign;
        const a = face[1];
        const b = face[2];
        const c = face[3];
        const dd = face[4];
        if (this.sd[a] < 0 || this.sd[b] < 0 || this.sd[c] < 0 || this.sd[dd] < 0) continue;
        const fcx = (this.wx[a] + this.wx[b] + this.wx[c] + this.wx[dd]) * 0.25;
        const fcy = (this.wy[a] + this.wy[b] + this.wy[c] + this.wy[dd]) * 0.25;
        const fcz = (this.wz[a] + this.wz[b] + this.wz[c] + this.wz[dd]) * 0.25;
        if (nx0 * (cam.x - fcx) + ny0 * (cam.y - fcy) + nz0 * (cam.z - fcz) <= 0) continue;
        let shadeValue = s.flat > 0 ? s.flat : this.ambient + (1 - this.ambient) * 1.05 * Math.max(0, nx0 * this.lx + ny0 * this.ly + nz0 * this.lz);
        shadeValue = quantizeShade(shadeValue);
        let faceColor = shadeColor(color, shadeValue);
        if (fog > 0) faceColor = mixColor(faceColor, this.fogColor, fog);
        const centerSX = (this.sx[a] + this.sx[b] + this.sx[c] + this.sx[dd]) * 0.25;
        const centerSY = (this.sy[a] + this.sy[b] + this.sy[c] + this.sy[dd]) * 0.25;
        if (alpha < 1) faceColor = ditherTo(faceColor, this.fogColor, 1 - alpha, Math.round(centerSX), Math.round(centerSY));
        const depth = (this.sd[a] + this.sd[b] + this.sd[c] + this.sd[dd]) * 0.25;
        this.faces.push(
          Math.round(this.sx[a]),
          Math.round(this.sy[a]),
          Math.round(this.sx[b]),
          Math.round(this.sy[b]),
          Math.round(this.sx[c]),
          Math.round(this.sy[c]),
          Math.round(this.sx[dd]),
          Math.round(this.sy[dd]),
          faceColor,
          depth,
          s.outline
        );
      }
      this.resetStyle();
    }
  };

  // src/game/content/monsters.ts
  var MONSTER_DEFS = {
    grunt: {
      kind: "grunt",
      name: "游荡者",
      en: "Grunt",
      blurb: "普通的杂兵，会追着你打。",
      hp: 28,
      damage: 8,
      speed: 3.9,
      xp: 12,
      w: 1.2,
      h: 2.1,
      body: [110, 143, 74],
      accent: [56, 78, 40],
      eye: [255, 210, 74],
      windup: 0.28,
      active: 0.12,
      recover: 0.34,
      cooldown: 1.5,
      attackRange: 1.6,
      lungeSpeed: 4.2,
      superArmor: false,
      spawnTime: 0.5,
      knockbackResist: 0,
      mass: 1.15,
      uiColor: "#8fbb5e"
    },
    assassin: {
      kind: "assassin",
      name: "刺影",
      en: "Assassin",
      blurb: "很脆，但一爪很疼。出手前会先蓄力，看准了躲开。",
      hp: 16,
      damage: 20,
      speed: 5.4,
      xp: 18,
      w: 0.95,
      h: 2.05,
      body: [196, 58, 74],
      accent: [104, 22, 42],
      eye: [255, 122, 138],
      windup: 0.58,
      active: 0.14,
      recover: 0.5,
      cooldown: 1.9,
      attackRange: 3,
      lungeSpeed: 16,
      superArmor: false,
      spawnTime: 0.34,
      knockbackResist: 0.35,
      mass: 0.95,
      uiColor: "#e2566d"
    },
    brute: {
      kind: "brute",
      name: "石魔",
      en: "Brute",
      blurb: "又胖又肉，走得慢，打你不疼，但非常难砍死。",
      hp: 130,
      damage: 4,
      speed: 1.85,
      xp: 40,
      w: 2.45,
      h: 2.9,
      body: [124, 112, 142],
      accent: [58, 50, 72],
      eye: [143, 224, 255],
      windup: 0.62,
      active: 0.2,
      recover: 0.85,
      cooldown: 2.4,
      attackRange: 2.4,
      lungeSpeed: 2.6,
      superArmor: true,
      spawnTime: 0.85,
      knockbackResist: 0.82,
      mass: 2.3,
      uiColor: "#a99cc4"
    }
  };

  // src/render/font.ts
  var GLYPHS = {
    "0": [".##.", "#..#", "#..#", "#..#", "#..#", ".##."],
    "1": ["..#.", ".##.", "..#.", "..#.", "..#.", ".###"],
    "2": [".##.", "#..#", "...#", "..#.", ".#..", "####"],
    "3": ["###.", "...#", ".##.", "...#", "#..#", ".##."],
    "4": ["..#.", ".##.", "#.#.", "####", "..#.", "..#."],
    "5": ["####", "#...", "###.", "...#", "#..#", "###."],
    "6": [".##.", "#...", "###.", "#..#", "#..#", ".##."],
    "7": ["####", "...#", "..#.", ".#..", ".#..", ".#.."],
    "8": [".##.", "#..#", ".##.", "#..#", "#..#", ".##."],
    "9": [".##.", "#..#", "#..#", ".###", "...#", ".##."],
    "+": ["....", ".#..", "###.", ".#..", "....", "...."],
    "-": ["....", "....", "####", "....", "....", "...."],
    "!": [".#..", ".#..", ".#..", ".#..", "....", ".#.."],
    "x": ["....", "#..#", ".##.", ".##.", "#..#", "...."],
    " ": ["....", "....", "....", "....", "....", "...."]
  };
  var GLYPH_W = 4;
  var GLYPH_H = 6;
  function textWidth(text, scale, spacing = 1) {
    return text.length * (GLYPH_W + spacing) * scale;
  }
  function drawPixelText(ctx, text, x, y, color, scale = 1) {
    ctx.fillStyle = color;
    let cursor = Math.round(x);
    const top = Math.round(y);
    for (let i = 0; i < text.length; i++) {
      const glyph = GLYPHS[text[i]] ?? GLYPHS[" "];
      for (let row = 0; row < GLYPH_H; row++) {
        const line = glyph[row];
        for (let col = 0; col < GLYPH_W; col++) {
          if (line.charCodeAt(col) !== 35) continue;
          ctx.fillRect(cursor + col * scale, top + row * scale, scale, scale);
        }
      }
      cursor += (GLYPH_W + 1) * scale;
    }
  }

  // src/render/models.ts
  var P_ARMOR = pack(88, 126, 190);
  var P_ARMOR_DARK = pack(52, 80, 132);
  var P_TRIM = pack(240, 198, 96);
  var P_SKIN = pack(238, 196, 154);
  var P_BOOT = pack(72, 54, 44);
  var P_BLADE = pack(208, 230, 255);
  var P_HILT = pack(148, 108, 64);
  var P_CAPE = pack(198, 68, 82);
  var WHITE = pack(255, 255, 255);
  var GOLD = pack(255, 208, 108);
  var bodyCX = 0;
  var bodyCY = 0;
  var bodySpin = 0;
  var modelAlpha = 1;
  var modelOutline = true;
  var modelFog = 0;
  var modelFlat = 0;
  var tintColor = 0;
  var tintAmount = 0;
  function beginModel(centerX, centerY, spin, fog, alpha, outline) {
    bodyCX = centerX;
    bodyCY = centerY;
    bodySpin = spin;
    modelFog = fog;
    modelAlpha = alpha;
    modelOutline = outline;
    modelFlat = 0;
    tintAmount = 0;
  }
  function setTint(color, amount) {
    tintColor = color;
    tintAmount = amount;
  }
  function setFlatShade(value) {
    modelFlat = value;
  }
  function emitBox(sink, x, y, z, w, h, d, color, rotZ = 0, pivotY = 0, pivotX = 0) {
    const s = sink.style;
    s.outline = modelOutline;
    s.alpha = modelAlpha;
    s.fog = modelFog;
    s.flat = modelFlat;
    s.rotZ = rotZ;
    if (bodySpin !== 0) {
      s.rotY = bodySpin;
      s.pivotX = bodyCX - x;
      s.pivotY = bodyCY - (y + h * 0.5);
      s.pivotZ = -z;
    } else {
      s.rotY = 0;
      s.pivotX = pivotX;
      s.pivotY = pivotY;
      s.pivotZ = 0;
    }
    const shaded = tintAmount > 0 ? mixColor(color, tintColor, tintAmount) : color;
    sink.box(x, y, z, w, h, d, shaded);
  }
  function drawPlayer(sink, p, time) {
    const air = !p.onGround;
    const spin = p.state === "spin" ? p.spinAngle : 0;
    const blink = p.invuln > 0 && p.state !== "dash" && Math.floor(time * 16) % 2 === 0;
    const dashGhost = p.state === "dash";
    beginModel(p.x, p.y + p.h * 0.5, spin, 0, dashGhost ? 0.72 : blink ? 0.42 : 1, true);
    setTint(WHITE, p.hurtTimer > 0 ? 0.35 : 0);
    const walk = Math.sin(p.walkAnim);
    const squash = p.landingSquash;
    const crouch = squash * 0.14;
    const lean = p.state === "dash" ? 0.5 : p.state === "attack" ? 0.05 + p.attackSwing * 0.12 : 0;
    const leanZ = -lean * p.facing;
    const bob = air ? 0.08 : Math.abs(walk) * 0.05;
    const baseY = p.y + bob;
    const legTop = 0.92 - crouch;
    const torsoY = baseY + legTop;
    const headY = torsoY + 0.8;
    const f = p.facing;
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = air ? side === f ? -0.35 : 0.42 : walk * side * 0.5;
      const legX = p.x + side * 0.25;
      const rotZ = spin !== 0 ? 0 : swing;
      const pivotY = legTop * 0.5;
      emitBox(sink, legX, baseY, 0, 0.36, legTop, 0.42, P_ARMOR_DARK, rotZ, pivotY);
      emitBox(sink, legX + (air ? side * 0.12 : 0), baseY, 0.06, 0.42, 0.22, 0.48, P_BOOT, rotZ, pivotY);
    }
    emitBox(sink, p.x, torsoY, 0, 0.98, 0.8 - crouch, 0.6, P_ARMOR, leanZ, -(0.4 - crouch * 0.5));
    emitBox(sink, p.x, torsoY + 0.06, 0, 1.04, 0.16, 0.64, P_TRIM, leanZ, -(0.4 - crouch * 0.5));
    emitBox(sink, p.x - f * 0.34, torsoY - 0.1, -0.34, 0.42, 0.9, 0.12, P_CAPE, spin !== 0 ? 0 : -f * 0.1);
    emitBox(sink, p.x - f * 0.58, torsoY + 0.52, 0, 0.3, 0.28, 0.62, P_TRIM, leanZ, 0);
    emitBox(sink, p.x + f * 0.58, torsoY + 0.52, 0, 0.3, 0.28, 0.62, P_TRIM, leanZ, 0);
    emitBox(sink, p.x, headY, 0, 0.64, 0.6, 0.58, P_SKIN, leanZ * 0.5, -0.3);
    emitBox(sink, p.x, headY + 0.24, 0.3, 0.5, 0.14, 0.06, P_ARMOR_DARK, leanZ * 0.5, 0, 0);
    emitBox(sink, p.x, headY + 0.6, -0.04, 0.16, 0.3, 0.16, P_CAPE, leanZ * 0.5, -0.15);
    const attackAngle = attackSwordAngle(p);
    const shoulderX = p.x + f * 0.5;
    const shoulderY = torsoY + 0.52;
    const handDistance = 0.72;
    const handX = shoulderX + f * Math.cos(attackAngle) * handDistance;
    const handY = shoulderY - 0.1 + Math.sin(attackAngle) * handDistance * 0.7;
    emitBox(sink, (shoulderX + handX) * 0.5, (shoulderY + handY) * 0.5 - 0.16, 0, 0.24, 0.34, 0.24, P_ARMOR_DARK, -attackAngle * f * 0.5);
    const bladeX = handX + f * Math.cos(attackAngle) * 0.85;
    const bladeY = handY + Math.sin(attackAngle) * 0.85 * 0.7;
    const bladeRotZ = -attackAngle * f;
    emitBox(sink, bladeX, bladeY - 0.1, 0.06, 0.12, 1.5, 0.2, P_BLADE, bladeRotZ, 0);
    emitBox(sink, handX + f * 0.1, handY - 0.06, 0.06, 0.16, 0.3, 0.22, P_HILT, bladeRotZ, 0);
  }
  function attackSwordAngle(p) {
    if (p.state !== "attack") {
      return p.state === "dash" ? 0.9 : 0.25;
    }
    const t = p.attackSwing;
    const windEnd = 0.35;
    if (t < windEnd) return 1.2 * (t / windEnd);
    const k = (t - windEnd) / 0.65;
    return 1.2 - 2.3 * Math.min(1, k);
  }
  function drawMonster(sink, m, time) {
    const def = MONSTER_DEFS[m.kind];
    const body = pack(def.body[0], def.body[1], def.body[2]);
    const accent = pack(def.accent[0], def.accent[1], def.accent[2]);
    const eye = pack(def.eye[0], def.eye[1], def.eye[2]);
    const spawnProgress = m.state === "spawn" ? 1 - Math.max(0, m.spawnTimer / Math.max(0.01, def.spawnTime)) : 1;
    const rise = m.state === "spawn" ? (1 - spawnProgress) * (m.h + 0.6) : 0;
    const dead = m.state === "dead";
    const deadSquash = dead ? 1 - Math.min(1, 1 - m.deadTimer / 0.42) * 0.75 : 1;
    const baseY = m.y - rise + (dead ? -0.2 : 0);
    const facing = m.facing;
    beginModel(m.x, baseY + m.h * 0.5, 0, 0, dead ? Math.max(0.15, deadSquash) : 1, true);
    setTint(WHITE, m.hitFlash * 0.85);
    if (m.elite) setTint(GOLD, 0.18);
    const bob = m.state === "chase" ? Math.abs(Math.sin(m.animPhase)) * 0.07 : 0;
    const telegraph = m.state === "windup" ? Math.min(1, m.stateTime / Math.max(0.01, def.windup)) : 0;
    const lunge = m.state === "attack" ? 1 : 0;
    const leanBack = telegraph * -0.42 * facing;
    const leanForward = lunge * 0.3 * facing;
    const rotZ = -(leanBack + leanForward);
    const w = m.w;
    const h = m.h;
    if (m.kind === "grunt") {
      const legTop = h * 0.32;
      for (let i = 0; i < 2; i++) {
        const side = i === 0 ? -1 : 1;
        const swing = Math.sin(m.animPhase * 1.6 + (side > 0 ? 0 : Math.PI)) * 0.3;
        emitBox(sink, m.x + side * w * 0.22, baseY + bob, 0, w * 0.3, legTop, 0.36, accent, swing, legTop * 0.5);
      }
      emitBox(sink, m.x, baseY + bob + legTop, 0, w, h * 0.42, 0.72, body, rotZ, -h * 0.21);
      emitBox(sink, m.x, baseY + bob + legTop + h * 0.42, 0, w * 0.8, h * 0.3, 0.7, body, rotZ, -h * 0.15);
      emitBox(sink, m.x, baseY + bob + legTop + h * 0.16, 0.36, w * 0.42, h * 0.1, 0.1, accent, 0, 0);
      emitBox(sink, m.x - facing * w * 0.5, baseY + bob + legTop + h * 0.16, 0, w * 0.24, h * 0.26, 0.3, accent, rotZ, 0);
      emitBox(sink, m.x + facing * w * 0.5, baseY + bob + legTop + h * 0.16, 0, w * 0.24, h * 0.26, 0.3, accent, rotZ, 0);
      const eyeZ = 0.36;
      emitBox(sink, m.x + w * 0.2, baseY + bob + legTop + h * 0.44, eyeZ, 0.14, 0.12, 0.06, eye, 0, 0);
      emitBox(sink, m.x - w * 0.2, baseY + bob + legTop + h * 0.44, eyeZ, 0.14, 0.12, 0.06, eye, 0, 0);
    } else if (m.kind === "assassin") {
      const legTop = h * 0.44;
      for (let i = 0; i < 2; i++) {
        const side = i === 0 ? -1 : 1;
        const swing = Math.sin(m.animPhase * 2 + (side > 0 ? 0 : Math.PI)) * 0.45;
        emitBox(sink, m.x + side * w * 0.2, baseY, 0, w * 0.22, legTop, 0.28, accent, swing, legTop * 0.5);
      }
      emitBox(sink, m.x, baseY + legTop, 0, w * 0.78, h * 0.34, 0.5, body, rotZ, -h * 0.17);
      emitBox(sink, m.x, baseY + legTop + h * 0.34, 0.02, w * 0.52, h * 0.16, 0.46, accent, rotZ, -h * 0.08);
      emitBox(sink, m.x - facing * w * 0.62, baseY + legTop + h * 0.1, 0.1, w * 0.3, h * 0.16, 0.22, accent, rotZ, 0);
      emitBox(sink, m.x + facing * w * 0.66, baseY + legTop + h * 0.14, 0.1, w * 0.34, h * 0.18, 0.22, accent, rotZ, 0);
      const eyeZ = 0.24;
      emitBox(sink, m.x + w * 0.16, baseY + legTop + h * 0.38, eyeZ, 0.12, 0.1, 0.06, eye, 0, 0);
      emitBox(sink, m.x - w * 0.16, baseY + legTop + h * 0.38, eyeZ, 0.12, 0.1, 0.06, eye, 0, 0);
      for (let i = 0; i < 3; i++) {
        const spike = 0.16 - i * 0.03;
        emitBox(sink, m.x + (i - 1) * 0.16, baseY + legTop + h * 0.5, -0.1, 0.1, spike + 0.2, 0.1, body, 0, 0);
      }
    } else {
      const legTop = h * 0.24;
      const stomp = Math.abs(Math.sin(m.animPhase * 0.9)) * 0.12;
      for (let i = 0; i < 2; i++) {
        const side = i === 0 ? -1 : 1;
        emitBox(sink, m.x + side * w * 0.24, baseY + stomp * (side > 0 ? 1 : 0.4), 0, w * 0.32, legTop, 0.5, accent, 0, legTop * 0.5);
      }
      emitBox(sink, m.x, baseY + legTop + stomp, 0, w, h * 0.46, 0.9, body, rotZ, -h * 0.23);
      emitBox(sink, m.x, baseY + legTop + h * 0.46 + stomp, 0, w * 0.86, h * 0.18, 0.86, accent, rotZ, -h * 0.09);
      emitBox(sink, m.x, baseY + legTop + h * 0.64 + stomp, 0, w * 0.46, h * 0.2, 0.66, body, rotZ, -h * 0.1);
      emitBox(sink, m.x, baseY + legTop + h * 0.6 + stomp, -0.5, w * 0.7, h * 0.3, 0.2, accent, 0, 0);
      for (let i = 0; i < 2; i++) {
        const side = i === 0 ? -1 : 1;
        emitBox(sink, m.x + side * w * 0.62, baseY + legTop + h * 0.2 + stomp, 0.05, w * 0.34, h * 0.36, 0.5, body, rotZ * 0.4, 0);
        emitBox(sink, m.x + side * w * 0.66, baseY + legTop + stomp, 0.05, w * 0.4, h * 0.16, 0.56, accent, 0, 0);
      }
      const eyeZ = 0.36;
      emitBox(sink, m.x, baseY + legTop + h * 0.68 + stomp, eyeZ, w * 0.3, 0.12, 0.06, eye, 0, 0);
    }
    if (m.elite) {
      setFlatShade(1.22);
      emitBox(sink, m.x, baseY + h, 0, 0.3, 0.22, 0.3, GOLD, 0, 0);
      setFlatShade(0);
    }
    setTint(WHITE, 0);
  }
  function drawProp(sink, prop) {
    const color = pack(prop.color[0], prop.color[1], prop.color[2]);
    const dark = mixColor(color, 1052696, 0.4);
    beginModel(prop.x, prop.y, 0, 0, 1, true);
    setTint(WHITE, 0);
    const s = prop.scale;
    switch (prop.kind) {
      case "pillar": {
        emitBox(sink, prop.x, prop.y, prop.z, 1.1 * s, 7 * s, 1.1 * s, color, 0, 0, prop.rotY);
        emitBox(sink, prop.x, prop.y + 7 * s, prop.z, 1.5 * s, 0.6 * s, 1.5 * s, dark);
        emitBox(sink, prop.x, prop.y, prop.z, 1.5 * s, 0.5 * s, 1.5 * s, dark);
        break;
      }
      case "torch": {
        emitBox(sink, prop.x, prop.y, prop.z, 0.2 * s, 2.6 * s, 0.2 * s, dark);
        setFlatShade(1.25);
        emitBox(sink, prop.x, prop.y + 2.5 * s, prop.z, 0.5 * s, 0.6 * s, 0.5 * s, pack(255, 176, 92));
        emitBox(sink, prop.x, prop.y + 2.9 * s, prop.z, 0.3 * s, 0.4 * s, 0.3 * s, pack(255, 232, 156));
        setFlatShade(0);
        break;
      }
      case "banner": {
        emitBox(sink, prop.x, prop.y, prop.z, 0.16 * s, 3.4 * s, 0.16 * s, dark);
        emitBox(sink, prop.x, prop.y + 1.6 * s, prop.z, 1.5 * s, 1.8 * s, 0.12 * s, color);
        break;
      }
      case "crate": {
        emitBox(sink, prop.x, prop.y, prop.z, 1.2 * s, 1.2 * s, 1.2 * s, color);
        emitBox(sink, prop.x, prop.y + 0.55 * s, prop.z, 1.3 * s, 0.14 * s, 1.3 * s, dark);
        break;
      }
      case "bone": {
        emitBox(sink, prop.x - 0.3 * s, prop.y, prop.z, 0.9 * s, 0.16 * s, 0.16 * s, pack(224, 220, 200));
        emitBox(sink, prop.x + 0.3 * s, prop.y, prop.z + 0.2, 0.7 * s, 0.14 * s, 0.14 * s, pack(200, 196, 180));
        break;
      }
      case "rubble": {
        emitBox(sink, prop.x, prop.y, prop.z, 1 * s, 0.5 * s, 1 * s, color);
        emitBox(sink, prop.x + 0.5 * s, prop.y, prop.z + 0.3 * s, 0.6 * s, 0.3 * s, 0.6 * s, dark);
        break;
      }
    }
  }

  // src/render/scene.ts
  var projected = { x: 0, y: 0, depth: 0 };
  var triA = { x: 0, y: 0, depth: 0 };
  var triB = { x: 0, y: 0, depth: 0 };
  var triC = { x: 0, y: 0, depth: 0 };
  function box(raster, x, y, z, w, h, d, color, fog, alpha) {
    const style = raster.style;
    style.fog = fog;
    style.alpha = alpha;
    style.outline = false;
    style.rotX = 0;
    style.rotY = 0;
    style.rotZ = 0;
    raster.box(x, y, z, w, h, d, color);
  }
  function renderScene(scene) {
    const { world, raster, ctx } = scene;
    ctx.imageSmoothingEnabled = false;
    drawSky(scene);
    drawDistantLandscape(scene);
    const level = world.level;
    raster.setFogColor(packRgb(level.fog));
    drawFloor(scene, level);
    drawPlatforms(scene, level);
    const props = level.props;
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (Math.abs(prop.x - world.fx.cameraX) > 26) continue;
      drawProp(raster, prop);
    }
    for (let i = 0; i < world.monsters.count; i++) drawShadow(scene, world.monsters.items[i]);
    drawShadow(scene, world.player);
    for (let i = 0; i < world.monsters.count; i++) {
      const m = world.monsters.items[i];
      if (Math.abs(m.x - world.fx.cameraX) > 24) continue;
      drawMonster(raster, m, scene.time);
    }
    drawPlayer(raster, world.player, scene.time);
    for (let i = 0; i < world.particles.count; i++) {
      const p = world.particles.items[i];
      if (!p.voxel) continue;
      box(
        raster,
        p.x,
        p.y,
        p.z,
        p.size,
        p.size,
        p.size,
        pack(p.r, p.g, p.b),
        0,
        clamp(p.life / p.maxLife * 1.6, 0.15, 1)
      );
    }
    flushFaces(ctx, scene.faces);
    scene.faces.reset();
    drawScreenParticles(scene);
    drawFloatingTexts(scene);
    drawMonsterOverlays(scene);
    drawFlash(scene);
  }
  function drawSky(scene) {
    const { ctx, width, height, world } = scene;
    const top = packRgb(world.level.skyTop);
    const bottom = packRgb(world.level.skyBottom);
    const bands = 12;
    const bandHeight = Math.ceil(height / bands);
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      ctx.fillStyle = cssColor(mixColor(top, bottom, t * t));
      ctx.fillRect(0, i * bandHeight, width, bandHeight);
    }
    ctx.fillStyle = cssColor(shadeColor(mixColor(top, 16777215, 0.55), 0.9));
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(hash01(i * 7 + 3) * width);
      const y = Math.floor(hash01(i * 13 + 11) * height * 0.45);
      const twinkle = Math.sin(scene.time * 1.8 + i) * 0.5 + 0.5;
      if (twinkle < 0.4) continue;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  function drawDistantLandscape(scene) {
    const { world, camera, ctx } = scene;
    const fog = packRgb(world.level.fog);
    const moonX = world.fx.cameraX * 0.55 + 26;
    if (camera.project(moonX, 14, -52, projected)) {
      const size = 13;
      const x = Math.round(projected.x - size * 0.5);
      const y = Math.round(projected.y - size * 0.5);
      ctx.fillStyle = cssColor(mixColor(pack(255, 244, 214), fog, 0.25));
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = cssColor(mixColor(pack(255, 255, 240), fog, 0.1));
      ctx.fillRect(x + 3, y + 2, size - 6, size - 6);
      ctx.fillStyle = cssColor(mixColor(pack(214, 206, 190), fog, 0.3));
      ctx.fillRect(x + 4, y + 8, 3, 2);
      ctx.fillRect(x + 8, y + 4, 2, 2);
    }
    const camX = world.fx.cameraX;
    for (let layer = 0; layer < 2; layer++) {
      const z = layer === 0 ? -46 : -30;
      const spacing = layer === 0 ? 22 : 17;
      const maxHeight = layer === 0 ? 13 : 9;
      const baseColor = layer === 0 ? pack(46, 44, 74) : pack(62, 56, 88);
      const start = Math.floor((camX - 60) / spacing) * spacing;
      for (let x = start; x <= camX + 60; x += spacing) {
        const seed = Math.round(x / spacing) + layer * 31;
        const h = maxHeight * (0.45 + hash01(seed) * 0.75);
        const halfWidth = spacing * (0.5 + hash01(seed + 5) * 0.4);
        const apex = x + (hash01(seed + 9) - 0.5) * spacing * 0.5;
        pushWorldTriangle(
          scene,
          x - halfWidth,
          0,
          z,
          x + halfWidth,
          0,
          z,
          apex,
          h,
          z,
          mixColor(baseColor, fog, layer === 0 ? 0.45 : 0.28)
        );
      }
    }
  }
  function pushWorldTriangle(scene, x0, y0, z0, x1, y1, z1, x2, y2, z2, color) {
    const { camera, faces } = scene;
    if (!camera.project(x0, y0, z0, triA)) return;
    if (!camera.project(x1, y1, z1, triB)) return;
    if (!camera.project(x2, y2, z2, triC)) return;
    faces.push(
      Math.round(triA.x),
      Math.round(triA.y),
      Math.round(triB.x),
      Math.round(triB.y),
      Math.round(triC.x),
      Math.round(triC.y),
      Math.round(triC.x),
      Math.round(triC.y),
      color,
      (triA.depth + triB.depth + triC.depth) / 3 + 200,
      false
    );
  }
  function drawFloor(scene, level) {
    const { world, camera, raster } = scene;
    const tileW = 4;
    const tileD = 3;
    const camX = world.fx.cameraX;
    const startX = Math.floor((camX - 26) / tileW) * tileW;
    const endX = camX + 26;
    const groundA = packRgb(level.groundA);
    const groundB = packRgb(level.groundB);
    const edge = packRgb(level.groundEdge);
    for (let x = startX; x <= endX; x += tileW) {
      for (let z = -ARENA.depth + 1; z < ARENA.depth; z += tileD) {
        const checker = (Math.round((x + ARENA.depth) / tileW) + Math.round((z + ARENA.depth) / tileD)) % 2 === 0;
        const depth = camera.depthOf(x, 0, z);
        const fog = clamp((depth - 14) / 34, 0, 1);
        const alpha = fog > 0.62 ? clamp(1 - (fog - 0.62) * 2.2, 0.16, 1) : 1;
        box(raster, x, -1.3, z, tileW, 1.3, tileD, checker ? groundA : groundB, Math.min(0.72, fog), alpha);
        box(raster, x - tileW * 0.5, -0.12, z, 0.24, 0.12, tileD, edge, Math.min(0.8, fog + 0.08), alpha);
        box(raster, x, -0.12, z - tileD * 0.5, tileW, 0.12, 0.24, edge, Math.min(0.8, fog + 0.08), alpha);
      }
    }
    box(
      raster,
      camX,
      0,
      -ARENA.depth - 1.4,
      74,
      9,
      1.2,
      shadeColor(packRgb(level.groundEdge), 0.92),
      0.5,
      1
    );
  }
  function drawPlatforms(scene, level) {
    const { raster, world } = scene;
    const solids = level.solids;
    const stone = mixColor(packRgb(level.groundEdge), packRgb(level.groundA), 0.55);
    const stoneTop = mixColor(stone, pack(255, 255, 255), 0.3);
    const camX = world.fx.cameraX;
    for (let i = 0; i < solids.length; i++) {
      const solid = solids[i];
      const top = solid.bottom + solid.h;
      if (top <= ARENA.floorY + 0.02) continue;
      const centerX = solid.left + solid.w * 0.5;
      if (Math.abs(centerX - camX) > 34) continue;
      const depth = 2;
      const z = -1.6;
      box(raster, centerX, solid.bottom, z, solid.w, solid.h, depth, stone, 0.06, 1);
      box(raster, centerX, top - 0.18, z, solid.w, 0.18, depth + 0.3, stoneTop, 0.04, 1);
    }
  }
  function drawShadow(scene, entity) {
    const heightAboveGround = Math.max(0, entity.y - ARENA.floorY);
    const spread = clamp(1 - heightAboveGround * 0.06, 0.45, 1);
    const alpha = clamp(0.5 - heightAboveGround * 0.03, 0.1, 0.5);
    box(
      scene.raster,
      entity.x,
      ARENA.floorY + 0.01,
      0,
      entity.w * 1.2 * spread,
      0.02,
      1.6 * spread,
      1381661,
      0,
      alpha
    );
  }
  function drawScreenParticles(scene) {
    const { world, ctx, camera } = scene;
    const fogColor = packRgb(world.level.fog);
    for (let i = 0; i < world.particles.count; i++) {
      const p = world.particles.items[i];
      if (p.voxel) continue;
      if (!camera.project(p.x, p.y, p.z, projected)) continue;
      const life = clamp(p.life / p.maxLife, 0, 1);
      const color = pack(p.r, p.g, p.b);
      if (p.kind === "ring") {
        drawPixelRing(ctx, projected.x, projected.y, p.size, color, life);
        continue;
      }
      const size = p.kind === "ember" ? 1 : p.size > 1.2 ? 2 : 1;
      const x = Math.round(projected.x);
      const y = Math.round(projected.y);
      ctx.fillStyle = cssColor(ditherTo(color, fogColor, clamp(1 - life * 1.5, 0, 1), x, y));
      ctx.fillRect(x, y, size, size);
    }
  }
  function drawPixelRing(ctx, cx, cy, radius, color, life) {
    const steps = 14;
    ctx.fillStyle = cssColor(shadeColor(color, 0.75 + life * 0.7));
    for (let i = 0; i < steps; i++) {
      const angle = i / steps * Math.PI * 2;
      ctx.fillRect(Math.round(cx + Math.cos(angle) * radius), Math.round(cy + Math.sin(angle) * radius * 0.42), 1, 1);
    }
  }
  function drawFloatingTexts(scene) {
    const { world, ctx, camera } = scene;
    const fogColor = packRgb(world.level.fog);
    for (let i = 0; i < world.texts.count; i++) {
      const t = world.texts.items[i];
      if (!camera.project(t.x, t.y, t.z, projected)) continue;
      const life = clamp(t.life / t.maxLife, 0, 1);
      const scale = t.big ? 2 : 1;
      const x = Math.round(projected.x - textWidth(t.text, scale) * 0.5);
      const y = Math.round(projected.y);
      drawPixelText(ctx, t.text, x + 1, y + 1, "rgb(0,0,0)", scale);
      const faded = ditherTo(pack(t.r, t.g, t.b), fogColor, clamp(1 - life * 1.3, 0, 1), x, y);
      drawPixelText(ctx, t.text, x, y, cssColor(faded), scale);
    }
  }
  function drawMonsterOverlays(scene) {
    const { world, ctx, camera } = scene;
    for (let i = 0; i < world.monsters.count; i++) {
      const m = world.monsters.items[i];
      if (m.state === "dead") continue;
      if (Math.abs(m.x - world.fx.cameraX) > 22) continue;
      const def = MONSTER_DEFS[m.kind];
      if (!camera.project(m.x, m.y + m.h + 0.45, 0, projected)) continue;
      const x = Math.round(projected.x);
      const y = Math.round(projected.y);
      if (m.state === "spawn") {
        if (camera.project(m.x, m.y + m.h * 0.2, 0, triA)) {
          const bottomY = Math.round(triA.y) + 2;
          ctx.fillStyle = "rgb(14,14,24)";
          ctx.fillRect(x - 2, y, 5, Math.max(2, bottomY - y));
          ctx.fillStyle = cssColor(m.elite ? pack(255, 208, 108) : pack(120, 190, 255));
          for (let s = y; s < bottomY; s += 4) ctx.fillRect(x, s, 1, 2);
        }
        continue;
      }
      const barWidth = m.kind === "brute" ? 30 : 22;
      const hpRatio = clamp(m.hp / m.maxHp, 0, 1);
      const barX = x - barWidth / 2;
      ctx.fillStyle = "rgb(11,11,18)";
      ctx.fillRect(barX - 1, y - 1, barWidth + 2, 5);
      ctx.fillStyle = m.hitFlash > 0.4 ? "rgb(255,255,255)" : m.elite ? cssColor(pack(255, 208, 108)) : cssColor(packRgb(def.body));
      ctx.fillRect(barX, y, Math.max(1, Math.round(barWidth * hpRatio)), 3);
      if (m.state === "windup") {
        const progress = clamp(m.stateTime / Math.max(0.01, def.windup), 0, 1);
        if (Math.sin(scene.time * (10 + progress * 30)) > -0.2) {
          const color = m.kind === "assassin" ? pack(255, 90, 90) : m.kind === "brute" ? pack(255, 190, 90) : pack(255, 240, 150);
          const size = m.kind === "assassin" ? 2 : 1;
          drawPixelText(ctx, "!", x - 2 * size + 1, y - 13 * size + 1, "rgb(0,0,0)", size);
          drawPixelText(ctx, "!", x - 2 * size, y - 13 * size, cssColor(color), size);
        }
      }
    }
  }
  function drawFlash(scene) {
    const { ctx, width, height, world } = scene;
    if (world.fx.flash <= 0.01) return;
    ctx.fillStyle = `rgba(255,120,120,${Math.min(0.5, world.fx.flash * 0.6).toFixed(3)})`;
    ctx.fillRect(0, 0, width, height);
  }
  function hash01(n) {
    let x = Math.imul(n ^ 2654435769, 2246822507) >>> 0;
    x ^= x >>> 13;
    x = Math.imul(x, 3266489909) >>> 0;
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }

  // src/render/renderer.ts
  var QUALITY_WIDTHS = [RENDER.baseWidth, 352, 320, RENDER.minWidth];
  var PixelRenderer = class {
    constructor(canvas) {
      this.canvas = canvas;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("无法获取 2D 画布上下文");
      this.ctx = ctx;
      this.raster = new VoxelRasterizer(this.camera, this.faces);
      this.raster.setLight(RENDER.lightDir[0], RENDER.lightDir[1], RENDER.lightDir[2], RENDER.lightAmbient);
      this.applyQuality(0);
    }
    ctx;
    camera = new Camera3D();
    faces = new FaceBatch(RENDER.maxFaces);
    raster;
    frameTimes = new Float32Array(120);
    frameIndex = 0;
    frameCount = 0;
    qualityIndex = 0;
    qualityCooldown = 2;
    time = 0;
    width = RENDER.baseWidth;
    height = RENDER.baseHeight;
    get resolution() {
      return { width: this.width, height: this.height };
    }
    /** 平均帧耗时（毫秒），用于调试面板。 */
    get averageFrameMs() {
      if (this.frameCount === 0) return 0;
      let total = 0;
      for (let i = 0; i < this.frameCount; i++) total += this.frameTimes[i];
      return total / this.frameCount;
    }
    render(world, realDt) {
      this.time += realDt;
      this.trackPerformance(realDt);
      const width = this.width;
      const height = this.height;
      this.camera.setViewport(width, height);
      const shake = world.fx.shake;
      this.camera.shakeX = shake > 0 ? Math.round(Math.sin(this.time * 61) * shake * 3.4) : 0;
      this.camera.shakeY = shake > 0 ? Math.round(Math.cos(this.time * 47) * shake * 2.6) : 0;
      const fx = world.fx;
      this.camera.lookAt(
        fx.cameraX,
        CAMERA.offsetY + fx.cameraY * 0.5,
        CAMERA.offsetZ,
        fx.cameraX,
        CAMERA.lookAtY + fx.cameraY,
        0
      );
      this.faces.reset();
      renderScene({
        world,
        camera: this.camera,
        raster: this.raster,
        faces: this.faces,
        ctx: this.ctx,
        width,
        height,
        time: this.time
      });
    }
    applyQuality(index) {
      this.qualityIndex = index;
      this.width = QUALITY_WIDTHS[index];
      this.height = Math.round(this.width * 9 / 16);
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    /** 采样最近 2 秒的帧时间：慢就降档，快就回升。 */
    trackPerformance(realDt) {
      this.frameTimes[this.frameIndex] = realDt * 1e3;
      this.frameIndex = (this.frameIndex + 1) % this.frameTimes.length;
      if (this.frameCount < this.frameTimes.length) this.frameCount++;
      this.qualityCooldown -= realDt;
      if (this.qualityCooldown > 0 || this.frameCount < 60) return;
      const average = this.averageFrameMs;
      if (average > 21 && this.qualityIndex < QUALITY_WIDTHS.length - 1) {
        this.applyQuality(this.qualityIndex + 1);
        this.qualityCooldown = 4;
      } else if (average < 12.5 && this.qualityIndex > 0) {
        this.applyQuality(this.qualityIndex - 1);
        this.qualityCooldown = 6;
      } else {
        this.qualityCooldown = 2;
      }
    }
  };

  // src/game/content/skills.ts
  var SKILLS = {
    attack: {
      id: "attack",
      kind: "melee",
      name: "斩击",
      en: "Slash",
      keys: ["J", "Z", "鼠标左键"],
      keyLabel: "J",
      desc: "向前挥剑，三段连击第三段更重。",
      color: [214, 232, 255],
      icon: [
        "........+",
        ".......+#",
        "......+#.",
        ".....+#..",
        "+...+#...",
        ".+..##...",
        "..++#....",
        "...##....",
        "..#......"
      ],
      cooldown: 0.34,
      windup: 0.05,
      active: 0.09,
      recover: 0.14,
      radius: 0,
      reach: 2.5,
      damageMul: 1,
      duration: 0,
      speed: 0,
      healPct: 0,
      knockback: 3.2
    },
    spin: {
      id: "spin",
      kind: "area",
      name: "旋风斩",
      en: "Whirlwind",
      keys: ["K", "1"],
      keyLabel: "K",
      desc: "原地旋转一圈，砍到身边所有怪。",
      color: [255, 203, 92],
      icon: [
        "...+....",
        ".######.",
        ".#....#.",
        "##....##",
        ".#....#.",
        ".######.",
        "...+....",
        "...++...",
        "........"
      ],
      cooldown: 5.5,
      windup: 0.12,
      active: 0.3,
      recover: 0.2,
      radius: 3.6,
      reach: 0,
      damageMul: 1.7,
      duration: 0,
      speed: 0,
      healPct: 0,
      knockback: 4.5
    },
    dash: {
      id: "dash",
      kind: "dash",
      name: "影袭",
      en: "Dash",
      keys: ["L", "2"],
      keyLabel: "L",
      desc: "向前猛冲一段，冲刺期间不会被打到。",
      color: [124, 224, 255],
      icon: [
        "........",
        "+.......",
        "++..#...",
        "+++.##..",
        "++++###.",
        "+++.##..",
        "++..#...",
        "+.......",
        "........"
      ],
      cooldown: 6.5,
      windup: 0.03,
      active: 0.24,
      recover: 0.16,
      radius: 0,
      reach: 1.3,
      damageMul: 1.35,
      duration: 0.27,
      speed: 30,
      healPct: 0,
      knockback: 5
    },
    heal: {
      id: "heal",
      kind: "heal",
      name: "生命回复",
      en: "Mend",
      keys: ["H", "3"],
      keyLabel: "H",
      desc: "立刻回复 35% 最大生命。",
      color: [110, 236, 148],
      icon: [
        "........",
        "..##....",
        ".####...",
        ".####...",
        "..##..#.",
        "......##",
        ".....###",
        "......##",
        ".......#"
      ],
      cooldown: 15,
      windup: 0.2,
      active: 0.1,
      recover: 0.25,
      radius: 2.6,
      reach: 0,
      damageMul: 0,
      duration: 0,
      speed: 0,
      healPct: 0.35,
      knockback: 0
    }
  };
  var SKILL_ORDER = ["attack", "spin", "dash", "heal"];
  var COMBO_MULTIPLIERS = [1, 1, 1.5];
  var COMBO_WINDOW = 0.55;

  // src/game/content/upgrades.ts
  var TIER_WEIGHT = {
    common: 62,
    rare: 30,
    epic: 8
  };
  var TIER_COLOR = {
    common: "#9fb6d4",
    rare: "#7cc9ff",
    epic: "#ffcf5c"
  };
  var UPGRADES = [
    {
      id: "sharp",
      name: "锋锐",
      en: "Keen Edge",
      desc: "攻击力 +15%",
      tier: "common",
      apply: (mods) => {
        mods.atkMul *= 1.15;
      }
    },
    {
      id: "swift",
      name: "疾风步",
      en: "Swift Boots",
      desc: "移动速度 +12%",
      tier: "common",
      apply: (mods) => {
        mods.speedMul *= 1.12;
      }
    },
    {
      id: "tough",
      name: "铁骨",
      en: "Iron Bones",
      desc: "最大生命 +25，并立刻回复等量生命",
      tier: "common",
      apply: (mods, player) => {
        mods.maxHpBonus += 25;
        player.maxHp += 25;
        player.hp = Math.min(player.maxHp, player.hp + 25);
      }
    },
    {
      id: "meditate",
      name: "冥想",
      en: "Meditation",
      desc: "所有技能冷却 -10%",
      tier: "common",
      apply: (mods) => {
        mods.cdMul *= 0.9;
      }
    },
    {
      id: "bounce",
      name: "弹跳靴",
      en: "Spring Heels",
      desc: "跳跃高度 +9%",
      tier: "common",
      apply: (mods) => {
        mods.jumpMul *= 1.09;
      }
    },
    {
      id: "hunter",
      name: "猎人直觉",
      en: "Hunter Instinct",
      desc: "获得经验 +20%",
      tier: "common",
      apply: (mods) => {
        mods.xpMul *= 1.2;
      }
    },
    {
      id: "heavy",
      name: "重击",
      en: "Heavy Blow",
      desc: "击退效果 +40%",
      tier: "common",
      apply: (mods) => {
        mods.knockbackMul *= 1.4;
      }
    },
    {
      id: "giant_blade",
      name: "巨刃回旋",
      en: "Giant Blade",
      desc: "旋风斩范围 +25%、伤害 +20%",
      tier: "rare",
      apply: (mods) => {
        mods.spinRadiusMul *= 1.25;
        mods.spinDamageMul *= 1.2;
      }
    },
    {
      id: "void_dash",
      name: "破空",
      en: "Void Step",
      desc: "冲刺伤害 +50%，冲刺后无敌延长 0.15 秒",
      tier: "rare",
      apply: (mods) => {
        mods.dashDamageMul *= 1.5;
        mods.dashInvulnBonus += 0.15;
      }
    },
    {
      id: "blood_spring",
      name: "血之泉",
      en: "Blood Spring",
      desc: "治疗效果 +45%，立刻回复 20% 生命",
      tier: "rare",
      apply: (mods, player) => {
        mods.healMul *= 1.45;
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.2);
      }
    },
    {
      id: "crit_rate",
      name: "致命节奏",
      en: "Lethal Rhythm",
      desc: "暴击率 +12%",
      tier: "rare",
      apply: (mods) => {
        mods.critChance += 0.12;
      }
    },
    {
      id: "crit_power",
      name: "战意",
      en: "Battle Spirit",
      desc: "暴击伤害 +50%",
      tier: "rare",
      apply: (mods) => {
        mods.critMul += 0.5;
      }
    },
    {
      id: "soul_eater",
      name: "噬魂",
      en: "Soul Eater",
      desc: "每次击杀回复 6 点生命",
      tier: "rare",
      apply: (mods) => {
        mods.killHeal += 6;
      }
    },
    {
      id: "thorns",
      name: "荆棘护甲",
      en: "Thorn Mail",
      desc: "受到近战伤害时反弹 50% 伤害",
      tier: "rare",
      apply: (mods) => {
        mods.thornsMul += 0.5;
      }
    },
    {
      id: "aerial",
      name: "空中猎手",
      en: "Aerial Hunter",
      desc: "空中攻击伤害 +35%",
      tier: "rare",
      apply: (mods) => {
        mods.airAttackMul += 0.35;
      }
    },
    {
      id: "execute",
      name: "处决",
      en: "Executioner",
      desc: "对生命低于 30% 的敌人伤害 +60%",
      tier: "epic",
      apply: (mods) => {
        mods.executeMul += 0.6;
      }
    },
    {
      id: "tempest",
      name: "暴风",
      en: "Tempest",
      desc: "攻击力 +40%，移速 +5%，最大生命 +15",
      tier: "epic",
      apply: (mods, player) => {
        mods.atkMul *= 1.4;
        mods.speedMul *= 1.05;
        mods.maxHpBonus += 15;
        player.maxHp += 15;
        player.hp = Math.min(player.maxHp, player.hp + 15);
      }
    },
    {
      id: "eternal",
      name: "永动",
      en: "Perpetual",
      desc: "所有技能冷却 -25%",
      tier: "epic",
      apply: (mods) => {
        mods.cdMul *= 0.75;
      }
    }
  ];
  function rollUpgrades(rng, count) {
    const pool = UPGRADES.slice();
    const picked = [];
    for (let n = 0; n < count && pool.length > 0; n++) {
      let total = 0;
      for (let i = 0; i < pool.length; i++) total += TIER_WEIGHT[pool[i].tier];
      let roll = rng.range(0, total);
      let index = 0;
      for (let i = 0; i < pool.length; i++) {
        roll -= TIER_WEIGHT[pool[i].tier];
        if (roll <= 0) {
          index = i;
          break;
        }
      }
      picked.push(pool[index]);
      pool[index] = pool[pool.length - 1];
      pool.pop();
    }
    return picked;
  }

  // src/game/persistence.ts
  var SAVE_VERSION = 1;
  var SAVE_KEY = "pixel-warden.save.v1";
  function createSaveFile() {
    return {
      version: SAVE_VERSION,
      savedAt: 0,
      run: null,
      best: { level: 1, wave: 1, kills: 0 },
      settings: { sound: true }
    };
  }
  function toInt(value, fallback, min, max) {
    const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
    return Math.min(max, Math.max(min, n));
  }
  function toFloat(value, fallback, min, max) {
    const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
    return Math.min(max, Math.max(min, n));
  }
  function normalizeSave(raw) {
    const file = createSaveFile();
    if (!raw || typeof raw !== "object") return file;
    const source = raw;
    file.version = toInt(source.version, SAVE_VERSION, 1, SAVE_VERSION);
    file.savedAt = toInt(source.savedAt, 0, 0, Number.MAX_SAFE_INTEGER);
    const best = source.best;
    if (best && typeof best === "object") {
      file.best.level = toInt(best.level, 1, 1, 999);
      file.best.wave = toInt(best.wave, 1, 1, 9999);
      file.best.kills = toInt(best.kills, 0, 0, 9999999);
    }
    const settings = source.settings;
    if (settings && typeof settings === "object") {
      file.settings.sound = settings.sound !== false;
    }
    const run = source.run;
    if (run && typeof run === "object" && run.seed !== void 0) {
      file.run = {
        seed: toInt(run.seed, 1, 1, 4294967295),
        level: toInt(run.level, 1, 1, 999),
        xp: toFloat(run.xp, 0, 0, 1e9),
        hp: toFloat(run.hp, 1, 1, 1e6),
        wave: toInt(run.wave, 1, 1, 9999),
        kills: toInt(run.kills, 0, 0, 9999999),
        playTimeMs: toFloat(run.playTimeMs, 0, 0, 1e12),
        upgrades: Array.isArray(run.upgrades) ? run.upgrades.filter((id) => typeof id === "string").slice(0, 400) : []
      };
    }
    return file;
  }
  function loadSave(storage) {
    try {
      const raw = storage.getItem(SAVE_KEY);
      if (!raw) return createSaveFile();
      return normalizeSave(JSON.parse(raw));
    } catch {
      return createSaveFile();
    }
  }
  function writeSave(storage, file) {
    try {
      file.version = SAVE_VERSION;
      file.savedAt = Date.now();
      storage.setItem(SAVE_KEY, JSON.stringify(file));
      return true;
    } catch {
      return false;
    }
  }
  function clearStoredSave(storage) {
    try {
      storage.removeItem(SAVE_KEY);
    } catch {
    }
  }

  // src/engine/events.ts
  var Emitter = class {
    handlers = /* @__PURE__ */ new Map();
    on(type, fn) {
      let list = this.handlers.get(type);
      if (!list) {
        list = [];
        this.handlers.set(type, list);
      }
      list.push(fn);
      return () => this.off(type, fn);
    }
    off(type, fn) {
      const list = this.handlers.get(type);
      if (!list) return;
      const index = list.indexOf(fn);
      if (index >= 0) list.splice(index, 1);
    }
    emit(type, payload) {
      const list = this.handlers.get(type);
      if (!list || list.length === 0) return;
      for (let i = 0; i < list.length; i++) {
        const fn = list[i];
        if (fn) fn(payload);
      }
    }
    clear() {
      this.handlers.clear();
    }
  };

  // src/engine/spatial.ts
  var CELL_HASH_X = 73856093;
  var CELL_HASH_Y = 19349663;
  var SpatialGrid = class {
    constructor(cellSize) {
      this.cellSize = cellSize;
    }
    cells = /* @__PURE__ */ new Map();
    scratch = { ids: [] };
    clear() {
      this.cells.forEach((cell) => {
        cell.ids.length = 0;
      });
    }
    keyFor(cx, cy) {
      return Math.imul(cx, CELL_HASH_X) ^ Math.imul(cy, CELL_HASH_Y) | 0;
    }
    cellAt(cx, cy) {
      const key = this.keyFor(cx, cy);
      let cell = this.cells.get(key);
      if (!cell) {
        cell = { ids: [] };
        this.cells.set(key, cell);
      }
      return cell;
    }
    insert(id, centerX, centerY, halfW, halfH) {
      const size = this.cellSize;
      const minX = Math.floor((centerX - halfW) / size);
      const maxX = Math.floor((centerX + halfW) / size);
      const minY = Math.floor((centerY - halfH) / size);
      const maxY = Math.floor((centerY + halfH) / size);
      for (let cy = minY; cy <= maxY; cy++) {
        for (let cx = minX; cx <= maxX; cx++) {
          const cell = this.cellAt(cx, cy);
          if (cell.ids.length < 64) cell.ids.push(id);
        }
      }
    }
    /** 查询矩形范围内的 id，写入调用方提供的复用数组，返回数量。 */
    query(minX, minY, maxX, maxY, out) {
      const size = this.cellSize;
      let count = 0;
      const cellMinX = Math.floor(minX / size);
      const cellMaxX = Math.floor(maxX / size);
      const cellMinY = Math.floor(minY / size);
      const cellMaxY = Math.floor(maxY / size);
      for (let cy = cellMinY; cy <= cellMaxY; cy++) {
        for (let cx = cellMinX; cx <= cellMaxX; cx++) {
          const cell = this.cells.get(this.keyFor(cx, cy));
          if (!cell) continue;
          const ids = cell.ids;
          for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let duplicate = false;
            for (let j = 0; j < count; j++) {
              if (out[j] === id) {
                duplicate = true;
                break;
              }
            }
            if (!duplicate) out[count++] = id;
          }
        }
      }
      out.length = Math.max(out.length, count);
      return count;
    }
    queryCircle(cx, cy, radius, out) {
      return this.query(cx - radius, cy - radius, cx + radius, cy + radius, out);
    }
    get cellCount() {
      return this.cells.size;
    }
    /** 长时间运行后地图会稳定下来；这里仅在极端情况（如切关卡）时清理。 */
    reset() {
      this.cells.clear();
    }
    /** 预留接口：确保 scratch 不会被 tree-shaking 掉（调试用）。 */
    get debugScratch() {
      return this.scratch;
    }
  };

  // src/engine/rng.ts
  var Rng = class _Rng {
    state;
    constructor(seed) {
      this.state = seed >>> 0 || 2654435769;
    }
    get seed() {
      return this.state >>> 0;
    }
    set seed(value) {
      this.state = value >>> 0 || 2654435769;
    }
    /** [0, 1) */
    next() {
      this.state = this.state + 1831565813 >>> 0;
      let t = this.state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    range(min, max) {
      return min + this.next() * (max - min);
    }
    int(min, maxExclusive) {
      if (maxExclusive <= min) return min;
      return min + Math.floor(this.next() * (maxExclusive - min));
    }
    chance(p) {
      return this.next() < p;
    }
    pick(items) {
      return items[Math.min(items.length - 1, Math.floor(this.next() * items.length))];
    }
    /** 原地洗牌（Fisher-Yates）。 */
    shuffle(items) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(this.next() * (i + 1));
        const tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
      }
      return items;
    }
    /** 派生一个互不干扰的子随机源（不同用途不会互相串味）。 */
    fork(salt) {
      return new _Rng((Math.imul(this.state ^ salt, 2246822507) ^ salt << 7) >>> 0);
    }
  };

  // src/game/types.ts
  function createDefaultMods() {
    return {
      atkMul: 1,
      speedMul: 1,
      maxHpBonus: 0,
      cdMul: 1,
      spinRadiusMul: 1,
      spinDamageMul: 1,
      dashDamageMul: 1,
      dashInvulnBonus: 0,
      healMul: 1,
      critChance: 0.05,
      critMul: 2,
      killHeal: 0,
      thornsMul: 0,
      jumpMul: 1,
      xpMul: 1,
      knockbackMul: 1,
      executeMul: 0,
      airAttackMul: 0
    };
  }
  function createCooldowns() {
    return { attack: 0, spin: 0, dash: 0, heal: 0 };
  }

  // src/game/entities/player.ts
  function createPlayer() {
    return {
      x: 0,
      y: ARENA.floorY,
      vx: 0,
      vy: 0,
      w: PLAYER_BASE.w,
      h: PLAYER_BASE.h,
      facing: 1,
      hp: PLAYER_BASE.maxHp,
      maxHp: PLAYER_BASE.maxHp,
      atk: PLAYER_BASE.atk,
      level: 1,
      xp: 0,
      xpNeed: xpNeededForLevel(1),
      onGround: true,
      jumpsLeft: PLAYER_BASE.maxJumpCount,
      coyote: 0,
      jumpBuffer: 0,
      landingSquash: 0,
      state: "idle",
      stateTime: 0,
      attackWindup: 0,
      attackActive: 0,
      attackRecover: 0,
      comboIndex: 0,
      comboWindow: 0,
      swingHitIds: new Int32Array(64),
      swingHitCount: 0,
      invuln: 0,
      hurtTimer: 0,
      dashId: 0,
      dashHits: 0,
      cooldowns: createCooldowns(),
      walkAnim: 0,
      spinAngle: 0,
      bodyRoll: 0,
      attackSwing: 0,
      mods: createDefaultMods(),
      alive: true,
      kills: 0,
      damageDealt: 0,
      damageTaken: 0
    };
  }
  function resetPlayer(player, x) {
    player.x = x;
    player.y = ARENA.floorY;
    player.vx = 0;
    player.vy = 0;
    player.facing = 1;
    player.hp = PLAYER_BASE.maxHp;
    player.maxHp = PLAYER_BASE.maxHp;
    player.atk = PLAYER_BASE.atk;
    player.level = 1;
    player.xp = 0;
    player.xpNeed = xpNeededForLevel(1);
    player.onGround = true;
    player.jumpsLeft = PLAYER_BASE.maxJumpCount;
    player.coyote = 0;
    player.jumpBuffer = 0;
    player.landingSquash = 0;
    player.state = "idle";
    player.stateTime = 0;
    player.attackWindup = 0;
    player.attackActive = 0;
    player.attackRecover = 0;
    player.comboIndex = 0;
    player.comboWindow = 0;
    player.swingHitCount = 0;
    player.invuln = 0;
    player.hurtTimer = 0;
    player.dashId = 0;
    player.dashHits = 0;
    player.cooldowns.attack = 0;
    player.cooldowns.spin = 0;
    player.cooldowns.dash = 0;
    player.cooldowns.heal = 0;
    player.walkAnim = 0;
    player.spinAngle = 0;
    player.bodyRoll = 0;
    player.attackSwing = 0;
    player.mods = createDefaultMods();
    player.alive = true;
    player.kills = 0;
    player.damageDealt = 0;
    player.damageTaken = 0;
  }

  // src/game/level.ts
  var THEMES = [
    {
      skyTop: [26, 28, 62],
      skyBottom: [86, 62, 104],
      fog: [70, 60, 96],
      groundA: [104, 94, 120],
      groundB: [88, 78, 104],
      groundEdge: [58, 50, 74]
    },
    {
      skyTop: [16, 38, 54],
      skyBottom: [58, 92, 96],
      fog: [52, 82, 92],
      groundA: [84, 118, 118],
      groundB: [70, 100, 100],
      groundEdge: [44, 66, 70]
    },
    {
      skyTop: [46, 20, 34],
      skyBottom: [126, 62, 52],
      fog: [110, 66, 66],
      groundA: [128, 96, 92],
      groundB: [108, 80, 78],
      groundEdge: [70, 48, 52]
    }
  ];
  var PLATFORM_LAYOUTS = [
    [
      { x: -16, y: 3.7, w: 8 },
      { x: 14, y: 3.7, w: 8 },
      { x: -1, y: 6.6, w: 7 }
    ],
    [
      { x: -22, y: 3.8, w: 7 },
      { x: 0, y: 3.8, w: 9 },
      { x: 22, y: 3.8, w: 7 }
    ],
    [
      { x: -10, y: 3.7, w: 6 },
      { x: 8, y: 3.7, w: 6 },
      { x: -1, y: 6.6, w: 9 },
      { x: 26, y: 6.6, w: 5 }
    ]
  ];
  function createLevel(seed, stage, rng) {
    const theme = THEMES[(stage - 1) % THEMES.length];
    const layout = PLATFORM_LAYOUTS[Math.abs(seed) % PLATFORM_LAYOUTS.length];
    const solids = [
      // 地面
      {
        left: ARENA.minX - 10,
        bottom: ARENA.floorY - 1.2,
        w: ARENA.maxX - ARENA.minX + 20,
        h: 1.2
      },
      // 两端看不到底的高墙（同时作为刷怪的禁区）
      { left: ARENA.minX - 2, bottom: ARENA.floorY, w: 2, h: 16 },
      { left: ARENA.maxX, bottom: ARENA.floorY, w: 2, h: 16 }
    ];
    for (let i = 0; i < layout.length; i++) {
      const p = layout[i];
      solids.push({ left: p.x - p.w * 0.5, bottom: p.y, w: p.w, h: 0.7 });
    }
    const props = [];
    const palette = [
      [70, 62, 88],
      [96, 84, 112],
      [56, 52, 74]
    ];
    for (let i = 0; i < 9; i++) {
      const x = -38 + i * 9.6 + rng.range(-1.4, 1.4);
      props.push({
        kind: "pillar",
        x,
        y: 0,
        z: rng.range(-7.5, -3.5),
        scale: rng.range(0.85, 1.6),
        rotY: rng.range(-0.25, 0.25),
        color: palette[i % palette.length]
      });
    }
    const decoKinds = ["torch", "banner", "rubble", "bone"];
    for (let i = 0; i < 16; i++) {
      const kind = decoKinds[i % decoKinds.length];
      const near = kind === "torch" || kind === "banner";
      props.push({
        kind,
        x: rng.range(ARENA.minX + 2, ARENA.maxX - 2),
        y: ARENA.floorY,
        z: near ? rng.range(-6, -1) : rng.range(-8, 6),
        scale: rng.range(0.8, 1.35),
        rotY: rng.range(-0.5, 0.5),
        color: kind === "torch" ? [255, 176, 92] : palette[(i + 1) % palette.length]
      });
    }
    return {
      stage,
      solids,
      props,
      skyTop: theme.skyTop,
      skyBottom: theme.skyBottom,
      fog: theme.fog,
      groundA: theme.groundA,
      groundB: theme.groundB,
      groundEdge: theme.groundEdge
    };
  }

  // src/engine/collections.ts
  var ActiveList = class {
    constructor(capacity, create) {
      this.capacity = capacity;
      this.items = new Array(capacity);
      for (let i = 0; i < capacity; i++) {
        const item = create(i);
        item.active = false;
        this.items[i] = item;
      }
    }
    items;
    count = 0;
    get full() {
      return this.count >= this.capacity;
    }
    /** 申请一个槽位；达到上限时返回 null（调用方直接丢弃，不做扩容）。 */
    spawn() {
      if (this.count >= this.capacity) return null;
      const item = this.items[this.count];
      this.count++;
      item.active = true;
      return item;
    }
    /** 回收 index 处的对象（与最后一个活跃对象交换）。 */
    releaseAt(index) {
      const last = this.count - 1;
      this.items[index].active = false;
      if (index !== last) {
        const tmp = this.items[index];
        this.items[index] = this.items[last];
        this.items[last] = tmp;
      }
      this.count = last;
    }
    forEach(fn) {
      for (let i = 0; i < this.count; i++) fn(this.items[i], i);
    }
    clear() {
      for (let i = 0; i < this.count; i++) this.items[i].active = false;
      this.count = 0;
    }
  };

  // src/game/systems/effects.ts
  function createParticle() {
    return {
      active: false,
      kind: "spark",
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0,
      size: 1,
      drag: 0,
      gravity: 0,
      r: 255,
      g: 255,
      b: 255,
      voxel: false,
      spin: 0
    };
  }
  function createText() {
    return {
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      text: "",
      r: 255,
      g: 255,
      b: 255,
      big: false
    };
  }
  function createParticleList(capacity) {
    return new ActiveList(capacity, createParticle);
  }
  function createTextList(capacity) {
    return new ActiveList(capacity, createText);
  }
  function burst(world, x, y, z, options) {
    const rng = world.fxRng;
    const particles = world.particles;
    for (let i = 0; i < options.count; i++) {
      const p = particles.spawn();
      if (!p) return;
      const angle = rng.range(0, Math.PI * 2);
      const speed = options.speed * rng.range(0.45, 1.25);
      p.kind = options.kind;
      p.x = x + rng.range(-0.25, 0.25);
      p.y = y + rng.range(-0.25, 0.25);
      p.z = z + rng.range(-0.2, 0.2);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.abs(Math.sin(angle)) * speed * (options.spreadY ?? 1) + (options.lift ?? 0);
      p.vz = rng.range(-0.4, 0.4) * speed * 0.2;
      p.life = options.life * rng.range(0.7, 1.2);
      p.maxLife = p.life;
      p.size = options.size * rng.range(0.7, 1.3);
      p.drag = options.drag ?? 1.6;
      p.gravity = options.gravity;
      p.voxel = options.voxel;
      p.spin = rng.range(-6, 6);
      const shade = rng.range(0.82, 1.18);
      p.r = Math.min(255, options.color[0] * shade);
      p.g = Math.min(255, options.color[1] * shade);
      p.b = Math.min(255, options.color[2] * shade);
    }
  }
  function spawnHitSparks(world, x, y, z, color, heavy) {
    burst(world, x, y, z, {
      count: heavy ? 12 : 6,
      color,
      speed: heavy ? 11 : 7,
      gravity: -26,
      life: heavy ? 0.42 : 0.3,
      size: heavy ? 1.4 : 1,
      voxel: false,
      kind: "spark"
    });
  }
  function spawnDeathChunks(world, x, y, z, color, count) {
    burst(world, x, y + 0.6, z, {
      count,
      color,
      speed: 6,
      gravity: -30,
      life: 0.75,
      size: 0.34,
      voxel: true,
      kind: "chunk",
      lift: 4
    });
  }
  function spawnDust(world, x, y, z, color, count) {
    burst(world, x, y, z, {
      count,
      color,
      speed: 3.2,
      spreadY: 0.35,
      gravity: -2,
      drag: 3.2,
      life: 0.5,
      size: 1.2,
      voxel: false,
      kind: "dust"
    });
  }
  function spawnAirJumpRing(world, x, y, z, color) {
    const p = world.particles.spawn();
    if (!p) return;
    p.kind = "ring";
    p.x = x;
    p.y = y;
    p.z = z;
    p.vx = 0;
    p.vy = 0;
    p.vz = 0;
    p.life = 0.34;
    p.maxLife = p.life;
    p.size = 1.2;
    p.drag = 0;
    p.gravity = 0;
    p.voxel = false;
    p.r = color[0];
    p.g = color[1];
    p.b = color[2];
  }
  function spawnSpinRing(world, x, y, z, radius, color) {
    const p = world.particles.spawn();
    if (!p) return;
    p.kind = "ring";
    p.x = x;
    p.y = y;
    p.z = z;
    p.life = 0.3;
    p.maxLife = p.life;
    p.size = radius;
    p.gravity = 0;
    p.drag = 0;
    p.r = color[0];
    p.g = color[1];
    p.b = color[2];
  }
  function spawnHealBurst(world, x, y, z, color) {
    burst(world, x, y + 1, z, {
      count: 14,
      color,
      speed: 3.4,
      spreadY: 1.6,
      gravity: -6,
      drag: 1.2,
      life: 0.85,
      size: 1,
      voxel: false,
      kind: "spark"
    });
    spawnSpinRing(world, x, y + 1, z, 2.2, color);
  }
  function spawnEmber(world, x, y, z, color) {
    burst(world, x, y, z, {
      count: 1,
      color,
      speed: 0.6,
      spreadY: 1,
      gravity: 1.4,
      drag: 0.3,
      life: 2.4,
      size: 0.9,
      voxel: false,
      kind: "ember",
      lift: 1.6
    });
  }
  function spawnDamageText(world, x, y, z, text, color, big) {
    const item = world.texts.spawn();
    if (!item) return;
    item.x = x;
    item.y = y;
    item.z = z;
    item.vy = big ? 4.6 : 3.6;
    item.life = big ? 0.95 : 0.75;
    item.maxLife = item.life;
    item.text = text;
    item.r = color[0];
    item.g = color[1];
    item.b = color[2];
    item.big = big;
  }
  function updateEffects(world, dt) {
    const particles = world.particles;
    for (let i = 0; i < particles.count; i++) {
      const p = particles.items[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.releaseAt(i);
        i--;
        continue;
      }
      if (p.kind === "ring") {
        p.size += dt * 14;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy += p.gravity * dt;
      const damp2 = 1 - p.drag * dt;
      if (damp2 > 0) {
        p.vx *= damp2;
        p.vy *= damp2;
        p.vz *= damp2;
      } else {
        p.vx = 0;
        p.vy = 0;
        p.vz = 0;
      }
      if (p.voxel && p.y < 0.2) {
        p.y = 0.2;
        p.vy = Math.abs(p.vy) * 0.35;
        p.vx *= 0.6;
      }
    }
    const texts = world.texts;
    for (let i = 0; i < texts.count; i++) {
      const t = texts.items[i];
      t.life -= dt;
      if (t.life <= 0) {
        texts.releaseAt(i);
        i--;
        continue;
      }
      t.y += t.vy * dt;
      t.vy = Math.max(1.1, t.vy - dt * 6.5);
    }
  }
  function updateAmbient(world, dt) {
    world.ambientTimer -= dt;
    if (world.ambientTimer <= 0) {
      world.ambientTimer = world.fxRng.range(0.18, 0.5);
      spawnEmber(
        world,
        world.fx.cameraX + world.fxRng.range(-18, 18),
        world.fxRng.range(0.4, 2.4),
        world.fxRng.range(-8, 2),
        world.fxRng.chance(0.35) ? [255, 168, 84] : [255, 226, 156]
      );
    }
  }

  // src/engine/physics.ts
  var EPSILON = 5e-4;
  function solidOverlapsMover(solid, mover, x, y) {
    return x - mover.w * 0.5 < solid.left + solid.w - EPSILON && x + mover.w * 0.5 > solid.left + EPSILON && y < solid.bottom + solid.h - EPSILON && y + mover.h > solid.bottom + EPSILON;
  }
  function moveAndCollide(mover, dx, dy, solids, out) {
    out.hitWall = false;
    out.hitCeiling = false;
    out.landed = false;
    if (dx !== 0) {
      mover.x += dx;
      for (let i = 0; i < solids.length; i++) {
        const solid = solids[i];
        if (!solidOverlapsMover(solid, mover, mover.x, mover.y)) continue;
        if (dx > 0) {
          mover.x = solid.left - mover.w * 0.5;
        } else {
          mover.x = solid.left + solid.w + mover.w * 0.5;
        }
        mover.vx = 0;
        out.hitWall = true;
      }
    }
    if (dy !== 0) {
      mover.y += dy;
      for (let i = 0; i < solids.length; i++) {
        const solid = solids[i];
        if (!solidOverlapsMover(solid, mover, mover.x, mover.y)) continue;
        if (dy <= 0) {
          mover.y = solid.bottom + solid.h;
          out.landed = true;
        } else {
          mover.y = solid.bottom - mover.h;
          out.hitCeiling = true;
        }
        mover.vy = 0;
      }
    }
  }

  // src/game/content/waves.ts
  function waveScaling(wave) {
    const t = wave - 1;
    return {
      hp: 1 + 0.17 * t,
      damage: 1 + 0.075 * t,
      speed: Math.min(1.35, 1 + 0.022 * t),
      xp: 1 + 0.06 * t,
      elite: wave >= 5 && wave % 5 === 0
    };
  }
  var TOTAL_CAP = 22;
  function buildWave(wave, rng) {
    const counts = {
      grunt: 3 + Math.floor(wave * 0.85),
      assassin: wave >= 2 ? Math.min(6, Math.floor(1 + (wave - 2) * 0.7)) : 0,
      brute: wave >= 3 ? Math.min(4, Math.floor((wave - 1) / 2)) : 0
    };
    let total = counts.grunt + counts.assassin + counts.brute;
    while (total > TOTAL_CAP && counts.grunt > 1) {
      counts.grunt--;
      total--;
    }
    const kinds = [];
    for (const kind of ["grunt", "assassin", "brute"]) {
      for (let i = 0; i < counts[kind]; i++) kinds.push(kind);
    }
    rng.shuffle(kinds);
    const scaling = waveScaling(wave);
    const spawns = [];
    let time = 0;
    let baseXp = 0;
    for (let i = 0; i < kinds.length; i++) {
      if (i === 0) {
        time = 0;
      } else if (i < 3) {
        time += rng.range(0.3, 0.7);
      } else {
        time += rng.range(0.75, 1.7);
      }
      const kind = kinds[i];
      const elite = scaling.elite && i < 2;
      spawns.push({ kind, time, elite });
      baseXp += (kind === "grunt" ? 12 : kind === "assassin" ? 18 : 40) * (elite ? 2.5 : 1) * scaling.xp;
    }
    return { wave, spawns, total: spawns.length, baseXp: Math.round(baseXp) };
  }
  function maxAliveForWave(wave, base, perWave, cap) {
    return Math.min(cap, Math.floor(base + wave * perWave));
  }

  // src/game/systems/progression.ts
  function rememberPhase(world) {
    if (world.phase === "playing" || world.phase === "waveClear") {
      world.phaseBeforeModal = world.phase;
    }
  }
  function addXp(world, rawAmount) {
    const player = world.player;
    const amount = rawAmount * player.mods.xpMul;
    player.xp += amount;
    let leveled = 0;
    while (player.xp >= player.xpNeed) {
      player.xp -= player.xpNeed;
      levelUp(world);
      leveled++;
    }
    return amount;
  }
  function levelUp(world) {
    const player = world.player;
    player.level++;
    player.maxHp += PLAYER_BASE.maxHpPerLevel;
    player.atk += PLAYER_BASE.atkPerLevel;
    player.hp = player.maxHp;
    player.xpNeed = xpNeededForLevel(player.level);
    world.pendingLevelUps++;
  }
  function openUpgradeChoice(world) {
    rememberPhase(world);
    world.upgradeChoices = rollUpgrades(world.upgradeRng, 3);
    world.phase = "levelUp";
  }
  function chooseUpgrade(world, id) {
    if (world.phase !== "levelUp") return false;
    let picked = null;
    for (let i = 0; i < world.upgradeChoices.length; i++) {
      if (world.upgradeChoices[i].id === id) {
        picked = world.upgradeChoices[i];
        break;
      }
    }
    if (!picked) return false;
    picked.apply(world.player.mods, world.player);
    world.upgradeIds.push(picked.id);
    world.upgradeStacks.set(picked.id, (world.upgradeStacks.get(picked.id) ?? 0) + 1);
    if (world.pendingLevelUps > 0) world.pendingLevelUps--;
    if (world.pendingLevelUps > 0) {
      world.upgradeChoices = rollUpgrades(world.upgradeRng, 3);
    } else {
      world.upgradeChoices = [];
      const back = world.phaseBeforeModal === "waveClear" ? "waveClear" : "playing";
      world.phase = back;
    }
    world.events.emit("upgradeChosen", { id: picked.id, name: picked.name });
    return true;
  }
  function replayUpgrades(world, ids) {
    const player = world.player;
    player.mods = createDefaultMods();
    for (let i = 0; i < ids.length; i++) {
      const def = findUpgrade(ids[i]);
      if (!def) continue;
      def.apply(player.mods, player);
      world.upgradeIds.push(def.id);
      world.upgradeStacks.set(def.id, (world.upgradeStacks.get(def.id) ?? 0) + 1);
    }
  }
  function findUpgrade(id) {
    for (let i = 0; i < UPGRADES.length; i++) {
      if (UPGRADES[i].id === id) return UPGRADES[i];
    }
    return null;
  }

  // src/game/systems/combat.ts
  function isMonsterHittable(monster) {
    return monster.state !== "dead" && monster.state !== "spawn";
  }
  function monsterOverlapsCircle(monster, cx, cy, radius) {
    return circleTouchesBox(cx, cy, radius, monster);
  }
  function monsterOverlapsBox(monster, left, bottom, right, top) {
    return monster.x - monster.w * 0.5 < right && monster.x + monster.w * 0.5 > left && monster.y < top && monster.y + monster.h > bottom;
  }
  function damageMonster(world, monster, rawDamage, options) {
    if (!isMonsterHittable(monster)) return 0;
    const def = MONSTER_DEFS[monster.kind];
    const player = world.player;
    let amount = rawDamage;
    let crit = false;
    if (options.canCrit !== false && player.mods.critChance > 0 && world.combatRng.next() < player.mods.critChance) {
      crit = true;
      amount *= player.mods.critMul;
    }
    if (player.mods.executeMul > 0 && monster.hp / monster.maxHp < 0.3) {
      amount *= 1 + player.mods.executeMul;
    }
    amount = Math.max(1, Math.round(amount));
    monster.hp -= amount;
    monster.hitFlash = 1;
    const knockPower = (options.knockPower ?? 3) * player.mods.knockbackMul * (1 - def.knockbackResist) * (monster.elite ? 0.55 : 1);
    if (options.knockX) monster.vx += options.knockX * knockPower;
    if (def.superArmor) {
      monster.vx *= 0.86;
    } else {
      monitorInterrupt(monster);
    }
    player.damageDealt += amount;
    const impactY = monster.y + Math.min(monster.h - 0.2, monster.h * 0.62);
    const heavy = Boolean(options.heavy) || crit;
    spawnHitSparks(world, monster.x, impactY, 0, crit ? [255, 236, 150] : [255, 255, 230], heavy);
    spawnDamageText(
      world,
      monster.x,
      monster.y + monster.h + 0.35,
      0,
      crit ? `${amount}!` : `${amount}`,
      crit ? [255, 214, 92] : [255, 255, 255],
      heavy
    );
    world.fx.shake = Math.max(world.fx.shake, FX.shakeOnHit + (crit ? 0.14 : 0));
    world.fx.hitStop = Math.min(FX.hitStopMax, world.fx.hitStop + FX.hitStopPerHit * (crit ? 1.6 : 1));
    world.events.emit("hit", {
      x: monster.x,
      y: impactY,
      amount,
      crit,
      heavy,
      target: "monster"
    });
    if (monster.hp <= 0) killMonster(world, monster);
    return amount;
  }
  function monitorInterrupt(monster) {
    monster.state = "hurt";
    monster.stateTime = 0;
    monster.staggerTimer = 0.16;
  }
  function killMonster(world, monster) {
    if (monster.state === "dead") return;
    const def = MONSTER_DEFS[monster.kind];
    const player = world.player;
    monster.hp = 0;
    monster.state = "dead";
    monster.deadTimer = 0.42;
    monster.vx = 0;
    const xpRaw = def.xp * (monster.elite ? 2.5 : 1) * waveScaling(world.wave).xp;
    const gained = addXp(world, xpRaw);
    world.kills++;
    world.killsThisWave++;
    world.xpThisWave += gained;
    if (player.mods.killHeal > 0 && player.alive) {
      const before = player.hp;
      player.hp = Math.min(player.maxHp, player.hp + player.mods.killHeal);
      const healed = player.hp - before;
      if (healed >= 1) {
        spawnDamageText(world, player.x, player.y + player.h + 0.3, 0, `+${Math.round(healed)}`, [126, 240, 158], false);
      }
    }
    spawnDeathChunks(world, monster.x, monster.y + monster.h * 0.5, 0, def.body, monster.elite ? 22 : 12);
    spawnDust(world, monster.x, monster.y, 0, [150, 148, 160], 6);
    world.fx.shake = Math.max(world.fx.shake, monster.kind === "brute" ? 0.55 : 0.32);
    world.events.emit("monsterKilled", {
      kind: monster.kind,
      x: monster.x,
      y: monster.y,
      xp: Math.round(gained),
      elite: monster.elite
    });
  }
  function damagePlayer(world, rawDamage, sourceX, attacker) {
    const player = world.player;
    if (!player.alive) return 0;
    if (world.phase !== "playing") return 0;
    if (player.state === "dash" || player.invuln > 0) return 0;
    const amount = Math.max(1, Math.round(rawDamage));
    player.hp -= amount;
    player.damageTaken += amount;
    world.damageTakenThisWave += amount;
    player.invuln = PLAYER_BASE.hitInvuln;
    player.hurtTimer = 0.24;
    player.state = "hurt";
    player.stateTime = 0;
    player.attackWindup = 0;
    player.attackActive = 0;
    player.attackRecover = 0;
    player.spinAngle = 0;
    const dir = sourceX === player.x ? -player.facing : player.x < sourceX ? -1 : 1;
    player.vx = dir * PLAYER_BASE.hurtKnockback;
    player.vy = Math.max(player.vy, 5.2);
    world.fx.shake = Math.max(world.fx.shake, FX.shakeOnPlayerHit);
    world.fx.flash = 0.4;
    world.fx.hitStop = Math.min(FX.hitStopMax, world.fx.hitStop + 0.05);
    spawnHitSparks(world, player.x, player.y + player.h * 0.6, 0, [255, 118, 118], true);
    spawnDamageText(world, player.x, player.y + player.h + 0.45, 0, `-${amount}`, [255, 104, 104], true);
    if (attacker && player.mods.thornsMul > 0) {
      const reflected = amount * player.mods.thornsMul;
      spawnDamageText(
        world,
        attacker.x,
        attacker.y + attacker.h + 0.3,
        0,
        `-${Math.round(reflected)}`,
        [180, 240, 255],
        false
      );
      damageMonster(world, attacker, reflected, { knockX: 0, knockPower: 0, canCrit: false, source: "thorns" });
    }
    if (player.hp <= 0) {
      player.hp = 0;
      player.alive = false;
      player.state = "dead";
    }
    world.events.emit("playerDamaged", { amount, hp: player.hp, killed: !player.alive });
    return amount;
  }

  // src/game/systems/monsters.ts
  function createMonster() {
    return {
      active: false,
      id: 0,
      kind: "grunt",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      w: 1,
      h: 1,
      facing: 1,
      hp: 1,
      maxHp: 1,
      damage: 1,
      speed: 1,
      xpValue: 0,
      mass: 1,
      state: "spawn",
      stateTime: 0,
      onGround: true,
      attackCooldown: 0,
      hitFlash: 0,
      staggerTimer: 0,
      aliveTime: 0,
      animPhase: 0,
      scale: 1,
      elite: false,
      lastDashHitId: -1,
      hasHitPlayer: false,
      spawnTimer: 0,
      deadTimer: 0
    };
  }
  function createMonsterList(capacity) {
    return new ActiveList(capacity, createMonster);
  }
  function spawnMonsterAt(world, kind, elite, x, scaling) {
    const monster = world.monsters.spawn();
    if (!monster) return null;
    const def = MONSTER_DEFS[kind];
    const sizeMul = elite ? 1.28 : 1;
    monster.id = world.nextMonsterId++;
    monster.kind = kind;
    monster.x = x;
    monster.y = ARENA.floorY;
    monster.vx = 0;
    monster.vy = 0;
    monster.w = def.w * sizeMul;
    monster.h = def.h * sizeMul;
    monster.facing = world.player.x >= x ? 1 : -1;
    monster.maxHp = Math.round(def.hp * scaling.hp * (elite ? 2.3 : 1));
    monster.hp = monster.maxHp;
    monster.damage = def.damage * scaling.damage * (elite ? 1.3 : 1);
    monster.speed = def.speed * scaling.speed;
    monster.xpValue = def.xp * scaling.xp * (elite ? 2.5 : 1);
    monster.mass = def.mass * sizeMul;
    monster.state = "spawn";
    monster.stateTime = 0;
    monster.onGround = true;
    monster.attackCooldown = 0.4;
    monster.hitFlash = 0;
    monster.staggerTimer = 0;
    monster.aliveTime = 0;
    monster.animPhase = world.fxRng.range(0, 6.28);
    monster.scale = sizeMul;
    monster.elite = elite;
    monster.lastDashHitId = -1;
    monster.hasHitPlayer = false;
    monster.spawnTimer = def.spawnTime;
    monster.deadTimer = 0;
    spawnDust(world, x, ARENA.floorY, 0, elite ? [255, 214, 120] : [140, 140, 160], elite ? 14 : 8);
    world.events.emit("monsterSpawned", { kind, x, y: ARENA.floorY, elite });
    return monster;
  }
  function updateMonsters(world, dt) {
    const monsters = world.monsters;
    const player = world.player;
    const result = world.moveResult;
    for (let i = 0; i < monsters.count; i++) {
      const m = monsters.items[i];
      const def = MONSTER_DEFS[m.kind];
      m.stateTime += dt;
      m.aliveTime += dt;
      m.animPhase += dt * (m.state === "chase" ? m.speed * 1.6 : 3.4);
      if (m.hitFlash > 0) m.hitFlash = Math.max(0, m.hitFlash - dt * 5);
      if (m.attackCooldown > 0) m.attackCooldown = Math.max(0, m.attackCooldown - dt);
      switch (m.state) {
        case "spawn": {
          m.spawnTimer -= dt;
          m.vx = 0;
          if (m.spawnTimer <= 0) {
            m.state = "chase";
            m.stateTime = 0;
            spawnDust(world, m.x, m.y, 0, [170, 170, 190], 6);
          }
          break;
        }
        case "dead": {
          m.deadTimer -= dt;
          if (m.deadTimer <= 0) {
            monsters.releaseAt(i);
            i--;
            continue;
          }
          break;
        }
        case "hurt": {
          m.staggerTimer -= dt;
          m.vx *= 1 - Math.min(1, dt * 6);
          if (m.staggerTimer <= 0) {
            m.state = "chase";
            m.stateTime = 0;
          }
          break;
        }
        case "chase": {
          const dx = player.x - m.x;
          const dy = player.y - m.y;
          const dir = dx >= 0 ? 1 : -1;
          m.facing = dir;
          const inRange = Math.abs(dx) <= def.attackRange && dy > -1.6 && dy < m.h + 0.8;
          if (inRange) {
            m.vx *= 1 - Math.min(1, dt * 10);
            if (m.attackCooldown <= 0 && player.alive) {
              m.state = "windup";
              m.stateTime = 0;
              m.hasHitPlayer = false;
              m.vx = 0;
              world.events.emit("monsterTelegraph", { kind: m.kind, x: m.x, y: m.y });
            }
          } else {
            const target = dir * m.speed;
            const accel = def.speed * 9;
            m.vx += clamp(target - m.vx, -accel * dt, accel * dt);
          }
          break;
        }
        case "windup": {
          m.vx *= 1 - Math.min(1, dt * 12);
          if (m.stateTime >= def.windup) {
            m.state = "attack";
            m.stateTime = 0;
            m.hasHitPlayer = false;
          }
          break;
        }
        case "attack": {
          if (m.kind === "brute") m.vx *= 1 - Math.min(1, dt * 12);
          else m.vx = m.facing * def.lungeSpeed;
          if (!m.hasHitPlayer && m.stateTime <= def.active + 0.02) {
            const reach = def.attackRange * 0.92;
            const left = m.facing > 0 ? m.x : m.x - reach;
            const right = m.facing > 0 ? m.x + reach : m.x;
            const bottom = m.y + 0.1;
            const top = m.y + m.h;
            if (player.x - player.w * 0.5 < right && player.x + player.w * 0.5 > left && player.y < top && player.y + player.h > bottom) {
              m.hasHitPlayer = true;
              damagePlayer(world, m.damage, m.x, m);
            }
          }
          if (m.stateTime >= def.active) {
            m.state = "recover";
            m.stateTime = 0;
            m.attackCooldown = def.cooldown;
          }
          break;
        }
        case "recover": {
          m.vx *= 1 - Math.min(1, dt * 8);
          if (m.stateTime >= def.recover) {
            m.state = "chase";
            m.stateTime = 0;
          }
          break;
        }
      }
      m.vy += GRAVITY * dt;
      if (m.vy < -PLAYER_BASE.maxFallSpeed) m.vy = -PLAYER_BASE.maxFallSpeed;
      moveAndCollide(m, m.vx * dt, m.vy * dt, world.level.solids, result);
      m.onGround = result.landed;
      if (result.landed) m.vy = 0;
      if (result.hitWall) m.vx = 0;
      const halfW = m.w * 0.5;
      if (m.x < ARENA.minX + halfW) {
        m.x = ARENA.minX + halfW;
        m.vx = 0;
      } else if (m.x > ARENA.maxX - halfW) {
        m.x = ARENA.maxX - halfW;
        m.vx = 0;
      }
      if (m.y < ARENA.floorY - 12) {
        m.y = ARENA.floorY;
        m.vy = 0;
      }
    }
  }
  function applyMonsterSeparation(world) {
    const monsters = world.monsters;
    const grid = world.grid;
    grid.clear();
    for (let i = 0; i < monsters.count; i++) {
      const m = monsters.items[i];
      if (m.state === "dead" || m.state === "spawn") continue;
      grid.insert(i, m.x, m.y + m.h * 0.5, m.w * 0.5, m.h * 0.5);
    }
    const out = world.queryIds;
    for (let i = 0; i < monsters.count; i++) {
      const a = monsters.items[i];
      if (a.state === "dead" || a.state === "spawn") continue;
      const count = grid.query(a.x - a.w - 2, a.y, a.x + a.w + 2, a.y + a.h, out);
      for (let k = 0; k < count; k++) {
        const j = out[k];
        if (j <= i || j >= monsters.count) continue;
        const b = monsters.items[j];
        if (b.state === "dead" || b.state === "spawn") continue;
        const dx = b.x - a.x;
        const dist = Math.abs(dx);
        const required = (a.w + b.w) * 0.5 + WAVE.minMonsterSpacing;
        if (dist >= required) continue;
        const dir = dx === 0 ? i % 2 === 0 ? 1 : -1 : dx > 0 ? 1 : -1;
        const push = (required - dist) * 0.55;
        const total = a.mass + b.mass;
        displace(world, a, -dir * push * (b.mass / total * 2));
        displace(world, b, dir * push * (a.mass / total * 2));
      }
    }
    const player = world.player;
    for (let i = 0; i < monsters.count; i++) {
      const m = monsters.items[i];
      if (m.state === "dead" || m.state === "spawn") continue;
      const dx = m.x - player.x;
      const dist = Math.abs(dx);
      const required = (m.w + player.w) * 0.5 * 0.85;
      if (dist >= required) continue;
      const dir = dx === 0 ? m.id % 2 === 0 ? 1 : -1 : dx > 0 ? 1 : -1;
      displace(world, m, dir * (required - dist) * 0.75);
    }
  }
  function displace(world, monster, dx) {
    if (dx === 0) return;
    const before = monster.x;
    monster.x += dx;
    const halfW = monster.w * 0.5;
    const minX = ARENA.minX + halfW;
    const maxX = ARENA.maxX - halfW;
    if (monster.x < minX) monster.x = minX;
    if (monster.x > maxX) monster.x = maxX;
    const solids = world.level.solids;
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      const overlapping = monster.x - halfW < s.left + s.w && monster.x + halfW > s.left && monster.y < s.bottom + s.h && monster.y + monster.h > s.bottom;
      if (overlapping) {
        monster.x = before;
        break;
      }
    }
  }

  // src/engine/input.ts
  function wasActionPressed(list, count, action) {
    for (let i = 0; i < count; i++) {
      if (list[i] === action) return true;
    }
    return false;
  }

  // src/game/systems/movement.ts
  var DUST_COLOR = [150, 142, 160];
  function updatePlayerMovement(world, dt, input) {
    const p = world.player;
    if (!p.alive) return;
    const result = world.moveResult;
    const speed = PLAYER_BASE.speed * p.mods.speedMul;
    if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);
    if (p.landingSquash > 0) p.landingSquash = Math.max(0, p.landingSquash - dt * 4);
    const locked = p.state === "attack" || p.state === "spin" || p.state === "heal" || p.hurtTimer > 0;
    let moveDir = 0;
    if (!locked && p.state !== "dash") {
      if (input.isDown("left") && !input.isDown("right")) moveDir = -1;
      else if (input.isDown("right") && !input.isDown("left")) moveDir = 1;
    }
    if (p.state === "dash") {
    } else if (p.hurtTimer > 0) {
      p.hurtTimer = Math.max(0, p.hurtTimer - dt);
      p.vx = approach(p.vx, 0, 24 * dt);
      if (p.hurtTimer <= 0 && p.state === "hurt") {
        p.state = p.onGround ? "idle" : "air";
        p.stateTime = 0;
      }
    } else if (locked) {
      p.vx = approach(p.vx, 0, (p.onGround ? 34 : 12) * dt);
    } else if (moveDir !== 0) {
      const accel = p.onGround ? PLAYER_BASE.accel : PLAYER_BASE.airAccel;
      p.vx = approach(p.vx, moveDir * speed, accel * dt);
      p.facing = moveDir > 0 ? 1 : -1;
      if (p.onGround) p.walkAnim += dt * (Math.abs(p.vx) / Math.max(1, speed)) * 9;
    } else {
      const friction = p.onGround ? PLAYER_BASE.friction : PLAYER_BASE.friction * 0.3;
      p.vx = approach(p.vx, 0, friction * dt);
    }
    if (wasActionPressed(world.pressedActions, world.pressedCount, "jump") || wasActionPressed(world.pressedActions, world.pressedCount, "up")) {
      p.jumpBuffer = PLAYER_BASE.jumpBufferTime;
    } else if (p.jumpBuffer > 0) {
      p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    }
    const canGroundJump = p.onGround || p.coyote > 0;
    const wantJump = p.jumpBuffer > 0 && !locked && p.state !== "dash";
    if (wantJump && (canGroundJump || p.jumpsLeft > 0)) {
      const airJump = !canGroundJump;
      const power = PLAYER_BASE.jumpVelocity * p.mods.jumpMul * (airJump ? PLAYER_BASE.airJumpMul : 1);
      p.vy = power;
      p.onGround = false;
      p.coyote = 0;
      p.jumpBuffer = 0;
      p.state = "air";
      p.stateTime = 0;
      if (airJump) {
        p.jumpsLeft = Math.max(0, p.jumpsLeft - 1);
        spawnAirJumpRing(world, p.x, p.y + 0.25, 0, [168, 232, 255]);
        spawnDust(world, p.x, p.y + 0.15, 0, DUST_COLOR, 5);
      } else {
        p.jumpsLeft = Math.max(0, PLAYER_BASE.maxJumpCount - 1);
        spawnDust(world, p.x, p.y, 0, DUST_COLOR, 6);
      }
      world.events.emit("jump", { air: airJump });
    }
    p.vy += GRAVITY * dt;
    if (p.vy < -PLAYER_BASE.maxFallSpeed) p.vy = -PLAYER_BASE.maxFallSpeed;
    const wasOnGround = p.onGround;
    moveAndCollide(p, p.vx * dt, p.vy * dt, world.level.solids, result);
    p.onGround = result.landed;
    if (result.hitCeiling && p.vy > 0) p.vy = 0;
    if (result.hitWall) p.vx = 0;
    if (result.landed) {
      p.vy = 0;
      p.jumpsLeft = Math.max(0, PLAYER_BASE.maxJumpCount - 1);
      if (!wasOnGround) {
        p.landingSquash = 1;
        spawnDust(world, p.x, p.y, 0, DUST_COLOR, 6);
        if (p.state === "air") {
          p.state = "idle";
          p.stateTime = 0;
        }
      }
    }
    if (p.onGround) p.coyote = PLAYER_BASE.coyoteTime;
    else p.coyote = Math.max(0, p.coyote - dt);
    const halfW = p.w * 0.5;
    if (p.x < ARENA.minX + halfW) {
      p.x = ARENA.minX + halfW;
      p.vx = 0;
    } else if (p.x > ARENA.maxX - halfW) {
      p.x = ARENA.maxX - halfW;
      p.vx = 0;
    }
    if (p.y < ARENA.floorY - 14) {
      p.y = ARENA.floorY;
      p.vy = 0;
    }
    if (!locked && p.state !== "dash" && p.state !== "dead") {
      if (!p.onGround) p.state = "air";
      else p.state = Math.abs(p.vx) > 0.4 ? "run" : "idle";
    }
    if (p.onGround && Math.abs(p.vx) > speed * 0.75) {
      world.footstepTimer -= dt;
      if (world.footstepTimer <= 0) {
        world.footstepTimer = 0.16;
        spawnDust(world, p.x - Math.sign(p.vx) * 0.4, p.y, 0, DUST_COLOR, 2);
      }
    }
    p.bodyRoll = clamp(-p.vx / Math.max(1, speed) * 0.12, -0.16, 0.16);
  }

  // src/game/systems/skills.ts
  function tickCooldowns(cd, dt) {
    if (cd.attack > 0) cd.attack = Math.max(0, cd.attack - dt);
    if (cd.spin > 0) cd.spin = Math.max(0, cd.spin - dt);
    if (cd.dash > 0) cd.dash = Math.max(0, cd.dash - dt);
    if (cd.heal > 0) cd.heal = Math.max(0, cd.heal - dt);
  }
  function attackPower(world) {
    return world.player.atk * world.player.mods.atkMul;
  }
  function finishAction(world) {
    const p = world.player;
    p.state = p.onGround ? "idle" : "air";
    p.stateTime = 0;
    p.attackWindup = 0;
    p.attackActive = 0;
    p.attackRecover = 0;
  }
  function hasHit(dedupe, count, id) {
    const limit = Math.min(count, dedupe.length);
    for (let i = 0; i < limit; i++) {
      if (dedupe[i] === id) return true;
    }
    return false;
  }
  function markHit(player, id) {
    player.swingHitIds[player.swingHitCount % player.swingHitIds.length] = id;
    player.swingHitCount++;
  }
  function updatePlayerSkills(world, dt, allowNewActions) {
    const p = world.player;
    tickCooldowns(p.cooldowns, dt);
    if (p.comboWindow > 0) p.comboWindow = Math.max(0, p.comboWindow - dt);
    switch (p.state) {
      case "attack":
        advanceAttack(world, dt);
        break;
      case "spin":
        advanceSpin(world, dt);
        break;
      case "dash":
        advanceDash(world, dt);
        break;
      case "heal":
        advanceHeal(world, dt);
        break;
      default:
        break;
    }
    if (!allowNewActions || !p.alive) return;
    const pressed = world.pressedActions;
    const count = world.pressedCount;
    if (wasActionPressed(pressed, count, "attack")) tryAttack(world);
    if (wasActionPressed(pressed, count, "spin")) trySpin(world);
    if (wasActionPressed(pressed, count, "dash")) tryDash(world);
    if (wasActionPressed(pressed, count, "heal")) tryHeal(world);
  }
  function tryAttack(world) {
    const p = world.player;
    const def = SKILLS.attack;
    if (p.cooldowns.attack > 0 || p.state === "dash" || p.hurtTimer > 0) return false;
    if (p.state === "attack" && p.attackWindup > 0) return false;
    const combo = p.state === "attack" && p.comboWindow > 0 ? (p.comboIndex + 1) % 3 : 0;
    p.state = "attack";
    p.stateTime = 0;
    p.attackWindup = def.windup;
    p.attackActive = def.active;
    p.attackRecover = def.recover;
    p.swingHitCount = 0;
    p.attackSwing = 0;
    p.comboIndex = combo;
    p.comboWindow = 0;
    p.cooldowns.attack = def.cooldown * p.mods.cdMul;
    p.vx *= 0.35;
    world.events.emit("skillUsed", { id: "attack", combo });
    return true;
  }
  function advanceAttack(world, dt) {
    const p = world.player;
    const def = SKILLS.attack;
    const total = def.windup + def.active + def.recover;
    p.stateTime += dt;
    p.attackSwing = Math.min(1, p.stateTime / total);
    if (p.attackWindup > 0) {
      p.attackWindup -= dt;
      return;
    }
    if (p.attackActive > 0) {
      p.attackActive -= dt;
      resolveMelee(world, def);
      return;
    }
    if (p.attackRecover > 0) {
      p.attackRecover -= dt;
      if (p.attackRecover <= 0) {
        finishAction(world);
        p.comboWindow = COMBO_WINDOW;
      }
    }
  }
  function resolveMelee(world, def) {
    const p = world.player;
    const mul = COMBO_MULTIPLIERS[p.comboIndex] ?? 1;
    let damage = attackPower(world) * def.damageMul * mul;
    if (!p.onGround) damage *= 1 + p.mods.airAttackMul;
    const heavy = p.comboIndex === 2;
    const reach = def.reach;
    const left = p.facing > 0 ? p.x + 0.1 : p.x - reach;
    const right = p.facing > 0 ? p.x + reach : p.x - 0.1;
    const bottom = p.y;
    const top = p.y + p.h + 0.4;
    for (let i = 0; i < world.monsters.count; i++) {
      const m = world.monsters.items[i];
      if (!isMonsterHittable(m)) continue;
      if (hasHit(p.swingHitIds, p.swingHitCount, m.id)) continue;
      if (!monsterOverlapsBox(m, left, bottom, right, top)) continue;
      markHit(p, m.id);
      damageMonster(world, m, damage, {
        knockX: p.facing,
        knockPower: def.knockback * (heavy ? 1.6 : 1),
        heavy,
        source: "attack"
      });
    }
  }
  function trySpin(world) {
    const p = world.player;
    const def = SKILLS.spin;
    if (p.cooldowns.spin > 0 || p.state === "dash" || p.hurtTimer > 0) return false;
    p.state = "spin";
    p.stateTime = 0;
    p.spinAngle = 0;
    p.swingHitCount = 0;
    p.cooldowns.spin = def.cooldown * p.mods.cdMul;
    p.vx *= 0.2;
    spawnSpinRing(world, p.x, p.y + p.h * 0.45, 0, def.radius * p.mods.spinRadiusMul * 0.6, def.color);
    world.events.emit("skillUsed", { id: "spin", combo: 0 });
    return true;
  }
  function advanceSpin(world, dt) {
    const p = world.player;
    const def = SKILLS.spin;
    const total = def.windup + def.active + def.recover;
    p.stateTime += dt;
    const progress = Math.min(1, p.stateTime / total);
    p.spinAngle = progress * Math.PI * 2;
    p.vx *= 1 - Math.min(1, dt * 6);
    const activeStart = def.windup;
    const activeEnd = def.windup + def.active;
    if (p.stateTime >= activeStart && p.stateTime <= activeEnd) {
      const radius = def.radius * p.mods.spinRadiusMul;
      const damage = attackPower(world) * def.damageMul * p.mods.spinDamageMul;
      const cy = p.y + p.h * 0.45;
      for (let i = 0; i < world.monsters.count; i++) {
        const m = world.monsters.items[i];
        if (!isMonsterHittable(m)) continue;
        if (hasHit(p.swingHitIds, p.swingHitCount, m.id)) continue;
        if (!monsterOverlapsCircle(m, p.x, cy, radius)) continue;
        markHit(p, m.id);
        const dir = m.x >= p.x ? 1 : -1;
        damageMonster(world, m, damage, { knockX: dir, knockPower: def.knockback, heavy: true, source: "spin" });
      }
    }
    if (p.stateTime >= total) {
      p.spinAngle = 0;
      finishAction(world);
    }
  }
  function tryDash(world) {
    const p = world.player;
    const def = SKILLS.dash;
    if (p.cooldowns.dash > 0 || p.state === "dash" || p.hurtTimer > 0) return false;
    p.state = "dash";
    p.stateTime = 0;
    p.dashId = world.nextDashId++;
    p.dashHits = 0;
    p.swingHitCount = 0;
    p.cooldowns.dash = def.cooldown * p.mods.cdMul;
    p.invuln = Math.max(p.invuln, def.duration + 0.05 + p.mods.dashInvulnBonus);
    p.vy = 0;
    spawnDust(world, p.x, p.y + 0.1, 0, [124, 224, 255], 8);
    world.events.emit("skillUsed", { id: "dash", combo: 0 });
    return true;
  }
  function advanceDash(world, dt) {
    const p = world.player;
    const def = SKILLS.dash;
    p.stateTime += dt;
    p.vx = p.facing * def.speed * (1 + (p.mods.speedMul - 1) * 0.4);
    p.vy = 0;
    p.invuln = Math.max(p.invuln, dt + p.mods.dashInvulnBonus);
    const damage = attackPower(world) * def.damageMul * p.mods.dashDamageMul;
    for (let i = 0; i < world.monsters.count; i++) {
      const m = world.monsters.items[i];
      if (!isMonsterHittable(m)) continue;
      if (m.lastDashHitId === p.dashId) continue;
      if (!monsterOverlapsBox(m, p.x - p.w * 0.5 - def.reach, p.y - 0.2, p.x + p.w * 0.5 + def.reach, p.y + p.h + 0.2)) {
        continue;
      }
      m.lastDashHitId = p.dashId;
      p.dashHits++;
      damageMonster(world, m, damage, { knockX: p.facing, knockPower: def.knockback, heavy: true, source: "dash" });
      spawnHitSparks(world, m.x, m.y + m.h * 0.5, 0, [160, 240, 255], true);
    }
    world.dashTrailTimer -= dt;
    if (world.dashTrailTimer <= 0) {
      world.dashTrailTimer = 0.035;
      spawnDust(world, p.x - p.facing * 0.5, p.y + 0.2, 0, [124, 224, 255], 3);
    }
    if (p.stateTime >= def.duration) {
      finishAction(world);
      p.vx = p.facing * def.speed * 0.35;
    }
  }
  function tryHeal(world) {
    const p = world.player;
    const def = SKILLS.heal;
    if (p.cooldowns.heal > 0 || p.state === "dash" || p.hurtTimer > 0) return false;
    if (p.hp >= p.maxHp) return false;
    const amount = Math.round(p.maxHp * def.healPct * p.mods.healMul);
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + amount);
    const healed = Math.round(p.hp - before);
    p.state = "heal";
    p.stateTime = 0;
    p.cooldowns.heal = def.cooldown * p.mods.cdMul;
    p.vx *= 0.2;
    spawnHealBurst(world, p.x, p.y, 0, def.color);
    if (healed > 0) {
      spawnDamageText(world, p.x, p.y + p.h + 0.5, 0, `+${healed}`, [126, 240, 158], true);
    }
    world.events.emit("skillUsed", { id: "heal", combo: 0 });
    return true;
  }
  function advanceHeal(world, dt) {
    const p = world.player;
    const def = SKILLS.heal;
    p.stateTime += dt;
    p.vx *= 1 - Math.min(1, dt * 8);
    if (p.stateTime >= def.windup + def.active + def.recover) finishAction(world);
  }

  // src/game/systems/waves.ts
  function stageForWave(wave) {
    return Math.floor((wave - 1) / 5) + 1;
  }
  function startWave(world, wave) {
    const stage = stageForWave(wave);
    world.wave = wave;
    if (world.level.stage !== stage) world.rebuildLevel(stage);
    world.waveRng.seed = (world.seed ^ Math.imul(wave, 2654435761)) >>> 0;
    const plan = buildWave(wave, world.waveRng);
    world.plan = plan;
    world.spawnCursor = 0;
    world.waveElapsed = 0;
    world.spawnTimer = 0;
    world.killsThisWave = 0;
    world.xpThisWave = 0;
    world.damageTakenThisWave = 0;
    world.phase = "playing";
    world.events.emit("waveStarted", { wave, total: plan.total, elite: waveScaling(wave).elite });
  }
  function updateWaveDirector(world, dt) {
    const plan = world.plan;
    if (!plan) return;
    if (world.phase === "waveClear") {
      world.intermission.remaining = Math.max(0, world.intermission.remaining - dt);
      if (world.intermission.remaining <= 0) startWave(world, world.wave + 1);
      return;
    }
    if (world.phase !== "playing") return;
    world.waveElapsed += dt;
    world.spawnTimer -= dt;
    const maxAlive = maxAliveForWave(world.wave, WAVE.maxAliveBase, WAVE.maxAlivePerWave, WAVE.maxAliveCap);
    if (world.spawnTimer <= 0) {
      world.spawnTimer = WAVE.spawnTickInterval;
      while (world.spawnCursor < plan.spawns.length && world.monsters.count < maxAlive) {
        const entry = plan.spawns[world.spawnCursor];
        if (entry.time > world.waveElapsed) break;
        if (!trySpawnMonster(world, entry.kind, entry.elite)) break;
        world.spawnCursor++;
      }
    }
    if (world.spawnCursor >= plan.spawns.length && world.monsters.count === 0) {
      beginWaveClear(world);
    }
  }
  function beginWaveClear(world) {
    world.phase = "waveClear";
    world.intermission.wave = world.wave;
    world.intermission.kills = world.killsThisWave;
    world.intermission.xp = Math.round(world.xpThisWave);
    world.intermission.seconds = world.waveElapsed;
    world.intermission.damageTaken = Math.round(world.damageTakenThisWave);
    world.intermission.remaining = WAVE.intermissionSeconds;
    world.events.emit("waveCleared", {
      wave: world.wave,
      kills: world.killsThisWave,
      xp: Math.round(world.xpThisWave),
      seconds: world.waveElapsed
    });
  }
  function bodyBlocked(solids, x, y, w, h) {
    const left = x - w * 0.5;
    const right = x + w * 0.5;
    const bottom = y + 0.06;
    const top = y + h;
    for (let i = 0; i < solids.length; i++) {
      const s = solids[i];
      if (right > s.left && left < s.left + s.w && top > s.bottom && bottom < s.bottom + s.h) return true;
    }
    return false;
  }
  function tooCloseToMonsters(world, x, w) {
    const monsters = world.monsters;
    for (let i = 0; i < monsters.count; i++) {
      const m = monsters.items[i];
      if (m.state === "dead") continue;
      const required = (m.w + w) * 0.5 + 1.5;
      if (Math.abs(m.x - x) < required) return true;
    }
    return false;
  }
  function trySpawnMonster(world, kind, elite) {
    const def = MONSTER_DEFS[kind];
    const sizeMul = elite ? 1.28 : 1;
    const w = def.w * sizeMul;
    const h = def.h * sizeMul;
    const rng = world.waveRng;
    const player = world.player;
    const scaling = waveScaling(world.wave);
    const minX = ARENA.minX + w * 0.5 + 0.5;
    const maxX = ARENA.maxX - w * 0.5 - 0.5;
    const bias = rng.chance(0.5) ? 1 : -1;
    for (let attempt = 0; attempt < 24; attempt++) {
      const side = attempt % 2 === 0 ? bias : -bias;
      const distance = WAVE.minSpawnDistance + rng.range(0, 9);
      let x = player.x + side * distance;
      if (x < minX || x > maxX) x = player.x - side * distance;
      x = clamp(x, minX, maxX);
      if (Math.abs(x - player.x) < WAVE.minSpawnDistance * 0.62) continue;
      if (bodyBlocked(world.level.solids, x, ARENA.floorY, w, h)) continue;
      if (tooCloseToMonsters(world, x, w)) continue;
      return spawnMonsterAt(world, kind, elite, x, scaling) !== null;
    }
    const scanStep = 1.5;
    const startX = Math.abs(player.x - minX) > Math.abs(player.x - maxX) ? minX : maxX;
    const dir = startX === minX ? 1 : -1;
    let fallback = startX;
    let fallbackDistance = -1;
    for (let x = startX; dir > 0 ? x <= maxX : x >= minX; x += dir * scanStep) {
      if (Math.abs(x - player.x) < WAVE.minSpawnDistance * 0.62) continue;
      if (bodyBlocked(world.level.solids, x, ARENA.floorY, w, h)) continue;
      if (tooCloseToMonsters(world, x, w)) {
        const distance = Math.abs(x - player.x);
        if (distance > fallbackDistance) {
          fallbackDistance = distance;
          fallback = x;
        }
        continue;
      }
      return spawnMonsterAt(world, kind, elite, x, scaling) !== null;
    }
    if (world.monsters.count === 0 && fallbackDistance > 0) {
      return spawnMonsterAt(world, kind, elite, fallback, scaling) !== null;
    }
    return false;
  }

  // src/game/world.ts
  var World = class {
    events = new Emitter();
    player = createPlayer();
    monsters = createMonsterList(FX.maxMonsters);
    particles = createParticleList(FX.maxParticles);
    texts = createTextList(FX.maxTexts);
    fx = {
      shake: 0,
      shakeSeed: 0.37,
      hitStop: 0,
      flash: 0,
      cameraX: 0,
      cameraY: 0,
      zoom: 1,
      runTime: 0
    };
    fxRng = new Rng(1);
    combatRng = new Rng(2);
    upgradeRng = new Rng(3);
    waveRng = new Rng(4);
    levelRng = new Rng(5);
    pressedActions = [];
    pressedCount = 0;
    grid = new SpatialGrid(4);
    queryIds = [];
    moveResult = { hitWall: false, hitCeiling: false, landed: false };
    intermission = {
      wave: 1,
      kills: 0,
      xp: 0,
      seconds: 0,
      damageTaken: 0,
      remaining: 0
    };
    level;
    phase = "playing";
    pausedFrom = "playing";
    phaseBeforeModal = "playing";
    seed = 1;
    stage = 1;
    wave = 0;
    plan = null;
    spawnCursor = 0;
    waveElapsed = 0;
    spawnTimer = 0;
    kills = 0;
    killsThisWave = 0;
    xpThisWave = 0;
    damageTakenThisWave = 0;
    pendingLevelUps = 0;
    upgradeChoices = [];
    upgradeIds = [];
    upgradeStacks = /* @__PURE__ */ new Map();
    playTimeMs = 0;
    runActive = false;
    ambientTimer = 0;
    footstepTimer = 0;
    dashTrailTimer = 0;
    nextMonsterId = 1;
    nextDashId = 1;
    constructor(seed = 1) {
      this.seed = seed >>> 0 || 1;
      this.reseed();
      this.level = createLevel(this.seed, 1, this.levelRng);
      this.fx.cameraX = this.player.x;
      this.fx.cameraY = this.player.y;
    }
    get aliveCount() {
      return this.monsters.count;
    }
    get remainingInWave() {
      if (!this.plan) return 0;
      return Math.max(0, this.plan.total - this.spawnCursor) + this.monsters.count;
    }
    get isPaused() {
      return this.phase === "paused";
    }
    reseed() {
      this.fxRng.seed = (this.seed ^ 2654435769) >>> 0;
      this.combatRng.seed = (this.seed ^ 2246822507) >>> 0;
      this.upgradeRng.seed = (this.seed ^ 3266489909) >>> 0;
      this.waveRng.seed = (this.seed ^ 668265263) >>> 0;
      this.levelRng.seed = (this.seed ^ 374761393) >>> 0;
    }
    /** 开始全新的一局。 */
    newRun(seed) {
      this.seed = (seed ?? Math.floor(Math.random() * 4294967295)) >>> 0 || 1;
      this.reseed();
      this.resetWorldState();
      resetPlayer(this.player, 0);
      this.level = createLevel(this.seed, 1, this.levelRng);
      this.stage = 1;
      this.runActive = true;
      this.fx.cameraX = this.player.x;
      this.fx.cameraY = this.player.y;
      startWave(this, 1);
    }
    /** 从存档恢复（存档只保留波次开头的状态）。 */
    loadRun(run) {
      this.seed = run.seed >>> 0 || 1;
      this.reseed();
      this.resetWorldState();
      resetPlayer(this.player, 0);
      this.player.level = Math.max(1, Math.round(run.level));
      this.player.xpNeed = xpNeededForLevel(this.player.level);
      this.player.xp = clamp(run.xp, 0, this.player.xpNeed);
      this.player.maxHp = PLAYER_BASE.maxHp + (this.player.level - 1) * PLAYER_BASE.maxHpPerLevel;
      this.player.atk = PLAYER_BASE.atk + (this.player.level - 1) * PLAYER_BASE.atkPerLevel;
      replayUpgrades(this, run.upgrades);
      this.player.hp = clamp(run.hp, 1, this.player.maxHp);
      this.kills = Math.max(0, Math.round(run.kills));
      this.playTimeMs = Math.max(0, run.playTimeMs);
      this.stage = stageForWave(Math.max(1, run.wave));
      this.level = createLevel(this.seed, this.stage, this.levelRng);
      this.runActive = true;
      this.fx.cameraX = this.player.x;
      this.fx.cameraY = this.player.y;
      startWave(this, Math.max(1, Math.round(run.wave)));
    }
    resetWorldState() {
      this.monsters.clear();
      this.particles.clear();
      this.texts.clear();
      this.kills = 0;
      this.killsThisWave = 0;
      this.xpThisWave = 0;
      this.damageTakenThisWave = 0;
      this.pendingLevelUps = 0;
      this.upgradeChoices = [];
      this.upgradeIds.length = 0;
      this.upgradeStacks.clear();
      this.playTimeMs = 0;
      this.plan = null;
      this.spawnCursor = 0;
      this.waveElapsed = 0;
      this.spawnTimer = 0;
      this.wave = 0;
      this.phase = "playing";
      this.pausedFrom = "playing";
      this.phaseBeforeModal = "playing";
      this.fx.shake = 0;
      this.fx.flash = 0;
      this.fx.hitStop = 0;
      this.fx.runTime = 0;
      this.nextMonsterId = 1;
      this.nextDashId = 1;
    }
    /** 换关卡（每 5 波换一次场景主题）。 */
    rebuildLevel(stage) {
      this.stage = stage;
      this.level = createLevel(this.seed, stage, this.levelRng);
      this.player.y = ARENA.floorY + 0.2;
      this.player.vy = 0;
    }
    /** 固定步长推进。paused / levelUp / gameOver 期间完全冻结（时间不前进）。 */
    update(dt, input) {
      this.fx.runTime += dt;
      if (this.phase === "paused" || this.phase === "levelUp" || this.phase === "gameOver") return;
      if (this.fx.hitStop > 0) {
        this.fx.hitStop = Math.max(0, this.fx.hitStop - dt);
        updateEffects(this, dt);
        this.updateCamera(dt);
        this.decayFx(dt);
        return;
      }
      this.pressedCount = input.drainPressed(this.pressedActions);
      const allowNewActions = this.phase === "playing";
      updatePlayerMovement(this, dt, input);
      updatePlayerSkills(this, dt, allowNewActions);
      if (this.phase === "playing") {
        updateMonsters(this, dt);
        applyMonsterSeparation(this);
      }
      updateWaveDirector(this, dt);
      updateEffects(this, dt);
      updateAmbient(this, dt);
      this.playTimeMs += dt * 1e3;
      this.updateCamera(dt);
      this.decayFx(dt);
      if (this.pendingLevelUps > 0 && (this.phase === "playing" || this.phase === "waveClear")) {
        openUpgradeChoice(this);
        this.events.emit("levelUp", { level: this.player.level });
      }
      if (!this.player.alive) this.endRun();
    }
    /** 菜单背景：只推进氛围粒子与镜头，不推进任何玩法逻辑。 */
    updateBackdrop(dt) {
      updateEffects(this, dt);
      updateAmbient(this, dt);
      this.updateCamera(dt);
      this.decayFx(dt);
    }
    pause() {
      if (this.phase !== "playing" && this.phase !== "waveClear") return false;
      this.pausedFrom = this.phase;
      this.phase = "paused";
      return true;
    }
    resume() {
      if (this.phase !== "paused") return false;
      this.phase = this.pausedFrom === "waveClear" ? "waveClear" : "playing";
      return true;
    }
    chooseUpgrade(id) {
      return chooseUpgrade(this, id);
    }
    serializeRun() {
      if (!this.runActive || this.phase === "gameOver" || !this.player.alive) return null;
      return {
        seed: this.seed,
        level: this.player.level,
        xp: Math.round(this.player.xp * 100) / 100,
        hp: Math.round(this.player.hp * 100) / 100,
        wave: Math.max(1, this.wave),
        kills: this.kills,
        playTimeMs: Math.round(this.playTimeMs),
        upgrades: this.upgradeIds.slice()
      };
    }
    endRun() {
      this.phase = "gameOver";
      this.runActive = false;
      this.events.emit("playerDied", { level: this.player.level, wave: this.wave, kills: this.kills });
    }
    updateCamera(dt) {
      const p = this.player;
      const lookAhead = CAMERA.lookAhead * p.facing * 0.45 + (p.state === "dash" ? p.facing * 1.6 : 0);
      const targetX = p.x + lookAhead;
      const targetY = clamp(p.y * 0.4, 0, 3.2);
      this.fx.cameraX = damp(this.fx.cameraX, targetX, CAMERA.followLambda, dt);
      this.fx.cameraY = damp(this.fx.cameraY, targetY, CAMERA.verticalLambda, dt);
    }
    decayFx(dt) {
      this.fx.shake = Math.max(0, this.fx.shake - this.fx.shake * FX.shakeDecay * dt - dt * 0.05);
      this.fx.flash = Math.max(0, this.fx.flash - dt * 2.4);
    }
  };

  // src/game/session.ts
  var RESUME_COUNTDOWN_SECONDS = 3;
  var AUTOSAVE_INTERVAL = 5;
  var PUBLISH_INTERVAL = 0.06;
  var GameSession = class {
    world;
    canvas;
    renderer;
    clock = new GameClock({ fixedStep: FIXED_STEP, maxStepsPerFrame: 5, maxFrameDelta: 0.2 });
    input = new KeyboardInput();
    audio;
    storageHandle;
    host;
    requestFrame;
    cancelFrame;
    activity = null;
    resumeCountdown;
    disposers = [];
    listeners = /* @__PURE__ */ new Set();
    save;
    status = "menu";
    snapshot;
    rafId = null;
    lastFrameTime = 0;
    publishTimer = 0;
    saveTimer = AUTOSAVE_INTERVAL;
    toastTimer = 0;
    toastSeq = 0;
    toast = null;
    fps = 60;
    hidden = false;
    autoPaused = false;
    resumeIn = null;
    lastDeath = null;
    runFinished = false;
    destroyed = false;
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.host = options.host ?? (globalThis.window ?? null);
      this.requestFrame = options.requestFrame ?? ((callback) => {
        if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
        return setTimeout(() => callback(Date.now()), 16);
      });
      this.cancelFrame = options.cancelFrame ?? ((handle) => {
        if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(handle);
        else clearTimeout(handle);
      });
      this.storageHandle = options.storage ? { storage: options.storage, available: true, reason: "" } : createStorage();
      this.audio = options.audio ?? createAudioBus();
      this.resumeCountdown = options.resumeCountdownSeconds ?? RESUME_COUNTDOWN_SECONDS;
      this.renderer = new PixelRenderer(canvas);
      this.save = loadSave(this.storageHandle.storage);
      this.world = new World(Math.random() * 4294967295 >>> 0 || 1);
      this.audio.setMuted(!this.save.settings.sound);
      this.snapshot = this.buildSnapshot();
    }
    // ───────────────────────────── 生命周期 ─────────────────────────────
    start() {
      if (this.rafId !== null || this.destroyed) return;
      if (this.host) {
        this.input.attach(this.host);
        this.activity = observeActivity(this.handleInactive, this.handleActive, this.host);
      }
      this.bindWorldEvents();
      this.bindDom();
      this.lastFrameTime = 0;
      this.rafId = this.requestFrame(this.frame);
    }
    subscribe(listener) {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }
    getSnapshot() {
      return this.snapshot;
    }
    destroy() {
      if (this.destroyed) return;
      this.persistRun();
      this.destroyed = true;
      if (this.rafId !== null) this.cancelFrame(this.rafId);
      this.rafId = null;
      for (let i = 0; i < this.disposers.length; i++) this.disposers[i]();
      this.disposers.length = 0;
      this.input.dispose();
      this.activity?.dispose();
      this.activity = null;
      this.audio.dispose();
      this.listeners.clear();
    }
    // ───────────────────────────── 菜单 / 局内操作 ─────────────────────────────
    newGame(seed) {
      this.audio.unlock();
      this.save.run = null;
      this.lastDeath = null;
      this.runFinished = false;
      this.world.newRun(seed);
      this.status = "running";
      this.resetRuntimeFlags();
      this.persistRun();
      this.pushToast("第 1 波 来了！", "info");
      this.publish(true);
    }
    continueGame() {
      const run = this.save.run;
      if (!run) {
        this.newGame();
        return;
      }
      this.audio.unlock();
      this.lastDeath = null;
      this.runFinished = false;
      this.world.loadRun(run);
      this.status = "running";
      this.resetRuntimeFlags();
      this.pushToast(`继续第 ${run.wave} 波`, "info");
      this.publish(true);
    }
    restart() {
      this.audio.unlock();
      this.save.run = null;
      this.lastDeath = null;
      this.runFinished = false;
      this.world.newRun();
      this.status = "running";
      this.resetRuntimeFlags();
      this.persistRun();
      this.pushToast("重新开始，第 1 波！", "info");
      this.publish(true);
    }
    pause(manual = true) {
      if (this.status !== "running") return;
      if (!this.world.pause()) return;
      if (manual) this.autoPaused = false;
      this.resumeIn = null;
      this.input.clear();
      this.clock.resetAccumulator();
      this.persistRun();
      this.pushToast(manual ? "已暂停" : "窗口失去焦点，已自动暂停", "info");
      this.publish(true);
    }
    resume() {
      if (this.status !== "running") return;
      if (this.world.phase !== "paused") return;
      this.resumeIn = null;
      this.autoPaused = false;
      this.world.resume();
      this.input.clear();
      this.clock.resetAccumulator();
      this.audio.unlock();
      this.publish(true);
    }
    togglePause() {
      if (this.status !== "running") return;
      if (this.world.phase === "paused") this.resume();
      else this.pause(true);
    }
    chooseUpgrade(id) {
      if (this.world.chooseUpgrade(id)) {
        this.audio.play("ui");
        this.persistRun();
        this.publish(true);
      }
    }
    setSound(enabled) {
      this.save.settings.sound = enabled;
      this.audio.setMuted(!enabled);
      if (enabled) this.audio.unlock();
      this.persistRun();
      this.publish(true);
    }
    eraseSave() {
      clearStoredSave(this.storageHandle.storage);
      this.save = createSaveFile();
      this.audio.setMuted(!this.save.settings.sound);
      this.lastDeath = null;
      this.pushToast("存档已清空", "warn");
      this.publish(true);
    }
    backToMenu() {
      this.save.run = this.world.serializeRun();
      this.persistRun();
      this.status = "menu";
      this.resumeIn = null;
      this.autoPaused = false;
      this.publish(true);
    }
    // ───────────────────────────── 主循环 ─────────────────────────────
    frame = (timestamp) => {
      if (this.destroyed) return;
      this.rafId = this.requestFrame(this.frame);
      const seconds = timestamp / 1e3;
      let dt = this.lastFrameTime === 0 ? FIXED_STEP : seconds - this.lastFrameTime;
      this.lastFrameTime = seconds;
      if (!Number.isFinite(dt) || dt <= 0) dt = FIXED_STEP;
      if (dt > 0.25) dt = 0.25;
      this.fps = this.fps * 0.92 + 1 / Math.max(dt, 1 / 240) * 0.08;
      if (this.resumeIn !== null) {
        this.resumeIn = Math.max(0, this.resumeIn - dt);
        if (this.resumeIn <= 0) {
          this.resumeIn = null;
          this.autoPaused = false;
          this.world.resume();
          this.input.clear();
          this.clock.resetAccumulator();
          this.pushToast("继续战斗！", "good");
          this.publish(true);
        }
      }
      const frozen = this.world.phase === "paused" || this.world.phase === "levelUp" || this.world.phase === "gameOver" || this.resumeIn !== null;
      if (this.status === "running") {
        if (!frozen && !this.hidden) {
          this.clock.advance(dt, (step) => {
            this.world.update(step, this.input);
          });
        } else {
          this.input.clearPressed();
        }
        if (!frozen) {
          this.saveTimer -= dt;
          if (this.saveTimer <= 0) {
            this.saveTimer = AUTOSAVE_INTERVAL;
            this.persistRun();
          }
        }
      } else {
        this.clock.advance(dt, (step) => {
          this.world.updateBackdrop(step);
        });
      }
      if (this.toast) {
        this.toastTimer -= dt;
        if (this.toastTimer <= 0) {
          this.toast = null;
          this.publish(true);
        }
      }
      this.renderer.render(this.world, dt);
      this.publishTimer -= dt;
      if (this.publishTimer <= 0) {
        this.publishTimer = PUBLISH_INTERVAL;
        this.publish();
      }
    };
    resetRuntimeFlags() {
      this.autoPaused = false;
      this.resumeIn = null;
      this.toastTimer = 0;
      this.saveTimer = AUTOSAVE_INTERVAL;
      this.clock.reset();
      this.input.clear();
    }
    // ───────────────────────────── 事件绑定 ─────────────────────────────
    bindWorldEvents() {
      const events = this.world.events;
      this.disposers.push(
        events.on("skillUsed", (payload) => {
          this.audio.play(payload.id === "attack" ? "swing" : payload.id);
        }),
        events.on("hit", (payload) => {
          this.audio.play(payload.crit || payload.heavy ? "crit" : "hit");
        }),
        events.on("monsterKilled", () => {
          this.audio.play("kill");
        }),
        events.on("monsterTelegraph", (payload) => {
          if (payload.kind !== "grunt") this.audio.play("telegraph");
        }),
        events.on("playerDamaged", () => {
          this.audio.play("hurt");
        }),
        events.on("jump", () => {
          this.audio.play("jump");
        }),
        events.on("waveStarted", (payload) => {
          this.audio.play("waveStart");
          this.pushToast(`第 ${payload.wave} 波 · 共 ${payload.total} 只${payload.elite ? " · 精英波次" : ""}`, "info");
          this.persistRun();
          this.publish(true);
        }),
        events.on("waveCleared", (payload) => {
          this.audio.play("waveClear");
          this.pushToast(`第 ${payload.wave} 波清空！`, "good");
          this.persistRun();
          this.publish(true);
        }),
        events.on("levelUp", (payload) => {
          this.audio.play("levelUp");
          this.pushToast(`升级！Lv.${payload.level} 选择一项强化`, "good");
          this.persistRun();
          this.publish(true);
        }),
        events.on("upgradeChosen", () => {
          this.publish(true);
        }),
        events.on("playerDied", (payload) => {
          this.audio.play("death");
          this.lastDeath = { wave: payload.wave, level: payload.level, kills: payload.kills };
          const best = this.save.best;
          best.wave = Math.max(best.wave, payload.wave);
          best.level = Math.max(best.level, payload.level);
          best.kills = Math.max(best.kills, payload.kills);
          this.runFinished = true;
          this.save.run = null;
          this.persistRun();
          this.publish(true);
        })
      );
    }
    bindDom() {
      const host = this.host;
      if (!host) return;
      const onBeforeUnload = () => {
        this.persistRun();
      };
      const onKeyDown = (event) => {
        this.audio.unlock();
        if (event.code === "Escape" || event.code === "KeyP") {
          if (this.status === "running") {
            event.preventDefault();
            this.togglePause();
          }
          return;
        }
        if (event.code === "KeyM") {
          this.setSound(!this.save.settings.sound);
          return;
        }
        if (this.world.phase === "levelUp") {
          const index = event.code === "Digit1" ? 0 : event.code === "Digit2" ? 1 : event.code === "Digit3" ? 2 : -1;
          if (index >= 0 && index < this.world.upgradeChoices.length) {
            event.preventDefault();
            this.chooseUpgrade(this.world.upgradeChoices[index].id);
          }
        }
      };
      const onPointerDown = (event) => {
        this.audio.unlock();
        const pointer = event;
        if (pointer.button !== 0) return;
        if (this.status !== "running" || this.world.phase !== "playing") return;
        this.input.press("attack");
        this.input.release("attack");
      };
      host.addEventListener("beforeunload", onBeforeUnload);
      host.addEventListener("keydown", onKeyDown);
      const target = this.canvas;
      const supportsEvents = typeof target.addEventListener === "function";
      if (supportsEvents) target.addEventListener("pointerdown", onPointerDown);
      this.disposers.push(
        () => host.removeEventListener("beforeunload", onBeforeUnload),
        () => host.removeEventListener("keydown", onKeyDown),
        () => {
          if (supportsEvents) target.removeEventListener("pointerdown", onPointerDown);
        }
      );
    }
    handleInactive = () => {
      this.hidden = true;
      this.input.clear();
      if (this.status !== "running") return;
      if (this.world.phase === "playing" || this.world.phase === "waveClear") {
        this.world.pause();
        this.autoPaused = true;
        this.resumeIn = null;
        this.clock.resetAccumulator();
        this.persistRun();
        this.publish(true);
      }
    };
    handleActive = () => {
      this.hidden = false;
      this.lastFrameTime = 0;
      if (this.status === "running" && this.autoPaused && this.world.phase === "paused") {
        this.resumeIn = this.resumeCountdown;
        this.publish(true);
      }
    };
    // ───────────────────────────── 存档 ─────────────────────────────
    persistRun() {
      if (!this.runFinished) {
        const run = this.world.serializeRun();
        if (run) this.save.run = run;
      }
      const ok = writeSave(this.storageHandle.storage, this.save);
      if (!ok && this.storageHandle.available) this.pushToast("存档写入失败（存储可能已满）", "warn");
    }
    pushToast(text, tone) {
      this.toastSeq++;
      this.toast = { id: this.toastSeq, text, tone };
      this.toastTimer = 2.1;
    }
    publish(force = false) {
      this.snapshot = this.buildSnapshot();
      if (force) this.publishTimer = PUBLISH_INTERVAL;
      this.listeners.forEach((listener) => listener());
    }
    buildSnapshot() {
      const world = this.world;
      const player = world.player;
      const skills = [];
      for (let i = 0; i < SKILL_ORDER.length; i++) {
        const def = SKILLS[SKILL_ORDER[i]];
        const remaining = player.cooldowns[def.id];
        const total = def.cooldown * player.mods.cdMul;
        const full = def.id === "heal" && player.hp >= player.maxHp;
        skills.push({
          id: def.id,
          name: def.name,
          en: def.en,
          keyLabel: def.keyLabel,
          keys: def.keys,
          desc: def.desc,
          icon: def.icon,
          color: `rgb(${def.color[0]},${def.color[1]},${def.color[2]})`,
          cooldown: remaining,
          cooldownTotal: total,
          ready: remaining <= 0 && !full,
          usable: !full
        });
      }
      const upgradeChoices = [];
      for (let i = 0; i < world.upgradeChoices.length; i++) {
        const def = world.upgradeChoices[i];
        upgradeChoices.push({
          id: def.id,
          name: def.name,
          en: def.en,
          desc: def.desc,
          tier: def.tier,
          color: TIER_COLOR[def.tier],
          stacks: world.upgradeStacks.get(def.id) ?? 0
        });
      }
      const summary = world.phase === "waveClear" ? {
        wave: world.intermission.wave,
        kills: world.intermission.kills,
        xp: world.intermission.xp,
        seconds: world.intermission.seconds,
        damageTaken: world.intermission.damageTaken,
        remaining: world.intermission.remaining
      } : null;
      const paused = world.phase === "paused";
      const pauseReason = !paused ? "none" : this.resumeIn !== null ? "resuming" : this.autoPaused ? "auto" : "manual";
      const resolution = this.renderer.resolution;
      return {
        status: this.status,
        phase: world.phase,
        pauseReason,
        hp: Math.max(0, Math.round(player.hp)),
        maxHp: Math.round(player.maxHp),
        level: player.level,
        xp: Math.round(player.xp),
        xpNeed: Math.round(player.xpNeed),
        atk: Math.round(player.atk * player.mods.atkMul * 10) / 10,
        wave: world.wave,
        kills: world.kills,
        runSeconds: Math.round(world.playTimeMs / 1e3),
        monstersAlive: world.monsters.count,
        monstersRemaining: world.remainingInWave,
        skills,
        upgradeChoices,
        pendingLevelUps: world.pendingLevelUps,
        waveSummary: summary,
        resumeIn: this.resumeIn,
        best: { ...this.save.best },
        hasSave: this.save.run !== null,
        savedRun: this.save.run ? { wave: this.save.run.wave, level: this.save.run.level } : null,
        soundOn: this.save.settings.sound,
        storageOk: this.storageHandle.available,
        storageNote: this.storageHandle.reason,
        fps: Math.round(this.fps),
        resolution: `${resolution.width}x${resolution.height}`,
        toast: this.toast,
        lastDeath: this.lastDeath
      };
    }
  };

  // src/ui/hooks/useSession.ts
  var import_react = __toESM(require_react());
  function useSessionSnapshot(session) {
    const subscribe = (0, import_react.useCallback)(
      (listener) => {
        if (!session) return () => {
        };
        return session.subscribe(listener);
      },
      [session]
    );
    const getSnapshot = (0, import_react.useCallback)(() => session ? session.getSnapshot() : null, [session]);
    return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
  }

  // src/ui/components/GameOverOverlay.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime());
  function GameOverOverlay({ snapshot, session }) {
    const death = snapshot.lastDeath;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overlay overlay-dim overlay-danger", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "modal modal-over", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "modal-title", children: "你倒下了" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "waveclear-grid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "坚持到" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          "第 ",
          death?.wave ?? snapshot.wave,
          " 波"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "等级" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          "Lv.",
          death?.level ?? snapshot.level
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "击杀" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: death?.kills ?? snapshot.kills })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "modal-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "btn btn-primary", onClick: () => session.restart(), children: "再来一局" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "btn", onClick: () => session.backToMenu(), children: "返回主菜单" })
      ] })
    ] }) });
  }

  // src/ui/components/Hud.tsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime());
  function Hud({ snapshot }) {
    const hpPercent = snapshot.maxHp > 0 ? Math.max(0, Math.min(100, snapshot.hp / snapshot.maxHp * 100)) : 0;
    const xpPercent = snapshot.xpNeed > 0 ? Math.max(0, Math.min(100, snapshot.xp / snapshot.xpNeed * 100)) : 0;
    const lowHp = hpPercent <= 30;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "hud", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "panel panel-left", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "row row-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "badge", children: [
            "Lv.",
            snapshot.level
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "stat", children: [
            "攻 ",
            snapshot.atk
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bar bar-hp", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: `bar-fill ${lowHp ? "bar-fill-danger" : ""}`, style: { width: `${hpPercent}%` } }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bar-label", children: [
            snapshot.hp,
            " / ",
            snapshot.maxHp
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bar bar-xp", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bar-fill bar-fill-xp", style: { width: `${xpPercent}%` } }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "bar-label small", children: [
            "经验 ",
            snapshot.xp,
            " / ",
            snapshot.xpNeed
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "panel panel-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "wave-title", children: [
          "第 ",
          snapshot.wave,
          " 波"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "wave-sub", children: [
          "场内 ",
          snapshot.monstersAlive,
          " · 剩余 ",
          snapshot.monstersRemaining
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "panel panel-right", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "row row-between small", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            "击杀 ",
            snapshot.kills
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: formatTime(snapshot.runSeconds) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "row row-between small dim", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            snapshot.fps,
            " FPS · ",
            snapshot.resolution
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            "最佳 第",
            snapshot.best.wave,
            "波"
          ] })
        ] })
      ] })
    ] });
  }
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // src/ui/components/PauseOverlay.tsx
  var import_jsx_runtime3 = __toESM(require_jsx_runtime());
  function PauseOverlay({ snapshot, session }) {
    const auto = snapshot.pauseReason === "auto";
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "overlay overlay-dim", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "modal modal-pause", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "modal-title", children: "已暂停" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "modal-sub", children: auto ? "窗口失去焦点，游戏已自动停下（时间不会前进）" : "暂停期间时间不会前进，怪也不会动" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "modal-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn btn-primary", onClick: () => session.resume(), children: "继续游戏" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn", onClick: () => session.restart(), children: "重新开始" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn", onClick: () => session.backToMenu(), children: "返回主菜单" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn btn-danger", onClick: () => session.eraseSave(), children: "清空存档" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "modal-hint", children: "按 P 或 Esc 也可以继续" })
    ] }) });
  }

  // src/ui/components/ResumeCountdown.tsx
  var import_jsx_runtime4 = __toESM(require_jsx_runtime());
  function ResumeCountdown({ snapshot }) {
    if (snapshot.resumeIn === null) return null;
    const seconds = Math.max(1, Math.ceil(snapshot.resumeIn));
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "overlay overlay-countdown", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "countdown", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "countdown-number", children: seconds }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "countdown-text", children: "准备…" })
    ] }) });
  }

  // src/ui/components/PixelIcon.tsx
  var import_react2 = __toESM(require_react());
  var import_jsx_runtime5 = __toESM(require_jsx_runtime());
  function PixelIcon({
    pixels,
    color,
    accentColor = "#ffffff",
    size = 3,
    className,
    title
  }) {
    const { shadow, width, height } = (0, import_react2.useMemo)(() => {
      const parts = [];
      let cols = 0;
      for (let y = 0; y < pixels.length; y++) {
        const row = pixels[y];
        if (row.length > cols) cols = row.length;
        for (let x = 0; x < row.length; x++) {
          const ch = row[x];
          if (ch === "." || ch === " ") continue;
          parts.push(`${x * size}px ${y * size}px 0 0 ${ch === "+" ? accentColor : color}`);
        }
      }
      return { shadow: parts.join(","), width: cols * size, height: pixels.length * size };
    }, [pixels, color, accentColor, size]);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "span",
      {
        className,
        title,
        "aria-hidden": title ? void 0 : true,
        style: {
          display: "inline-block",
          width: size,
          height: size,
          marginRight: width - size,
          marginBottom: height - size,
          boxShadow: shadow,
          background: "transparent"
        }
      }
    );
  }

  // src/ui/components/SkillBar.tsx
  var import_jsx_runtime6 = __toESM(require_jsx_runtime());
  function SkillBar({ snapshot }) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "skillbar", children: snapshot.skills.map((skill, index) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SkillSlot, { skill, index }, skill.id)) });
  }
  function SkillSlot({ skill, index }) {
    const total = Math.max(1e-3, skill.cooldownTotal);
    const ratio = Math.max(0, Math.min(1, skill.cooldown / total));
    const cooling = skill.cooldown > 0.05;
    const dimmed = !skill.ready;
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
      "div",
      {
        className: `skill-slot ${cooling ? "is-cooling" : ""} ${skill.usable ? "" : "is-unusable"}`,
        title: `${skill.name} ${skill.en}（${skill.keys.join(" / ")}）
${skill.desc}
冷却 ${total.toFixed(1)} 秒`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "skill-index", children: index + 1 }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "skill-icon", style: { opacity: dimmed ? 0.45 : 1, color: skill.color }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(PixelIcon, { pixels: skill.icon, color: skill.color, accentColor: "#ffffff", size: 3 }) }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "skill-key", children: skill.keyLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "skill-name", children: skill.name }),
          cooling && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "skill-cooldown", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "skill-cooldown-mask", style: { height: `${ratio * 100}%` } }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "skill-cooldown-text", children: skill.cooldown.toFixed(1) })
          ] }),
          !skill.usable && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "skill-full", children: "满血" })
        ]
      }
    );
  }

  // src/ui/components/ControlsHelp.tsx
  var import_jsx_runtime7 = __toESM(require_jsx_runtime());
  var CONTROLS = [
    ["← → / A D", "左右走动"],
    ["空格 / ↑", "跳跃（空中可再跳一次）"],
    ["J / Z / 鼠标左键", "挥剑斩击（三段连击）"],
    ["K / 1", "旋风斩：原地转一圈砍周围"],
    ["L / 2", "影袭冲刺：冲刺期间不会被打到"],
    ["H / 3", "生命回复"],
    ["P / Esc", "暂停 / 继续"],
    ["M", "音效开关"]
  ];
  function ControlsHelp() {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "controls", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "controls-title", children: "操作" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("ul", { children: CONTROLS.map(([keys, desc]) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("kbd", { children: keys }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: desc })
      ] }, keys)) })
    ] });
  }

  // src/ui/components/StartScreen.tsx
  var import_jsx_runtime8 = __toESM(require_jsx_runtime());
  function StartScreen({ snapshot, session }) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "overlay overlay-start", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "start-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h1", { className: "game-title", children: [
        "像素守卫 ",
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "game-title-en", children: "PIXEL WARDEN" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "game-sub", children: "横版打怪升级 · 一波接一波 · 越砍越强" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "start-actions", children: [
        snapshot.hasSave && snapshot.savedRun && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          "button",
          {
            className: "btn btn-primary",
            onClick: () => session.continueGame(),
            title: "读取存档，从上次的波次继续",
            children: [
              "继续进度（第 ",
              snapshot.savedRun.wave,
              " 波 · Lv.",
              snapshot.savedRun.level,
              "）"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: `btn ${snapshot.hasSave ? "" : "btn-primary"}`, onClick: () => session.newGame(), children: "开始新游戏" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "start-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
          "最佳波次 ",
          snapshot.best.wave
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
          "最高等级 ",
          snapshot.best.level
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
          "最多击杀 ",
          snapshot.best.kills
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ControlsHelp, {}),
      !snapshot.storageOk && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("p", { className: "warn-text", children: [
        "⚠ ",
        snapshot.storageNote
      ] })
    ] }) });
  }

  // src/ui/components/Toast.tsx
  var import_jsx_runtime9 = __toESM(require_jsx_runtime());
  function Toast({ toast }) {
    if (!toast) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `toast toast-${toast.tone}`, children: toast.text }, toast.id);
  }

  // src/ui/components/TopBar.tsx
  var import_jsx_runtime10 = __toESM(require_jsx_runtime());
  function TopBar({ snapshot, session }) {
    const paused = snapshot.phase === "paused";
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "topbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "button",
        {
          className: "icon-btn",
          title: snapshot.soundOn ? "关闭音效 (M)" : "开启音效 (M)",
          onClick: () => session.setSound(!snapshot.soundOn),
          children: snapshot.soundOn ? "♪" : "♪̸"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        "button",
        {
          className: "icon-btn",
          title: paused ? "继续 (P / Esc)" : "暂停 (P / Esc)",
          onClick: () => session.togglePause(),
          children: paused ? "▶" : "❚❚"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { className: "icon-btn", title: "重新开始本局", onClick: () => session.restart(), children: "↻" })
    ] });
  }

  // src/ui/components/UpgradeModal.tsx
  var import_jsx_runtime11 = __toESM(require_jsx_runtime());
  function UpgradeModal({ snapshot, session }) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "overlay overlay-dim", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "modal modal-upgrade", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("h2", { className: "modal-title", children: [
        "升级！Lv.",
        snapshot.level,
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "modal-sub", children: "生命与攻击提升，并回满血量 · 选择一项强化" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "cards", children: snapshot.upgradeChoices.map((choice, index) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
        "button",
        {
          className: `card card-${choice.tier}`,
          onClick: () => session.chooseUpgrade(choice.id),
          style: { borderColor: choice.color },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "card-index", children: index + 1 }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "card-tier", style: { color: choice.color }, children: choice.tier === "epic" ? "史诗" : choice.tier === "rare" ? "稀有" : "普通" }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "card-name", children: choice.name }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "card-en", children: choice.en }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "card-desc", children: choice.desc }),
            choice.stacks > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "card-stack", children: [
              "已叠加 ×",
              choice.stacks
            ] })
          ]
        },
        choice.id
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "modal-hint", children: "也可以直接按数字键 1 / 2 / 3 选择" }),
      snapshot.pendingLevelUps > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("p", { className: "modal-hint", children: [
        "还有 ",
        snapshot.pendingLevelUps,
        " 次升级待选"
      ] })
    ] }) });
  }

  // src/ui/components/WaveClearPanel.tsx
  var import_jsx_runtime12 = __toESM(require_jsx_runtime());
  function WaveClearPanel({ snapshot }) {
    const summary = snapshot.waveSummary;
    if (!summary) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "waveclear", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "waveclear-title", children: [
        "第 ",
        summary.wave,
        " 波 清空！"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "waveclear-grid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: "击杀" }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: summary.kills }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: "获得经验" }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: summary.xp }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: "用时" }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { children: [
          summary.seconds.toFixed(1),
          " 秒"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: "受到伤害" }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: summary.damageTaken })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "waveclear-next", children: [
        "下一波 ",
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("b", { children: Math.max(0, Math.ceil(summary.remaining)) }),
        " 秒后开始"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "waveclear-hint", children: "结算中无法攻击，先喘口气" })
    ] });
  }

  // src/ui/App.tsx
  var import_jsx_runtime13 = __toESM(require_jsx_runtime());
  function App() {
    const canvasRef = (0, import_react3.useRef)(null);
    const [session, setSession] = (0, import_react3.useState)(null);
    const [error, setError] = (0, import_react3.useState)(null);
    (0, import_react3.useEffect)(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      let created = null;
      try {
        created = new GameSession(canvas);
        created.start();
        setSession(created);
        window.__PIXEL_WARDEN_BOOTED__ = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      return () => {
        created?.destroy();
      };
    }, []);
    const snapshot = useSessionSnapshot(session);
    const inMenu = snapshot ? snapshot.status === "menu" : true;
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "app", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "stage", children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("canvas", { ref: canvasRef, className: "game-canvas" }),
        error && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "overlay overlay-dim", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "modal", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("h2", { className: "modal-title", children: "启动失败" }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "modal-sub", children: error })
        ] }) }),
        snapshot && !inMenu && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Hud, { snapshot }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(TopBar, { snapshot, session }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(SkillBar, { snapshot })
        ] }),
        snapshot && inMenu && session && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StartScreen, { snapshot, session }),
        snapshot && snapshot.status === "running" && snapshot.phase === "waveClear" && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(WaveClearPanel, { snapshot }),
        snapshot && snapshot.status === "running" && snapshot.phase === "levelUp" && session && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(UpgradeModal, { snapshot, session }),
        snapshot && snapshot.status === "running" && snapshot.phase === "paused" && (snapshot.resumeIn !== null ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ResumeCountdown, { snapshot }) : session && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(PauseOverlay, { snapshot, session })),
        snapshot && snapshot.status === "running" && snapshot.phase === "gameOver" && session && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(GameOverOverlay, { snapshot, session }),
        snapshot && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Toast, { toast: snapshot.toast })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("footer", { className: "footer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: "TypeScript + React + Canvas · 像素 3D 渲染" }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "dim", children: "进度自动保存在浏览器本地" })
      ] })
    ] });
  }

  // src/ui/main.tsx
  var import_jsx_runtime14 = __toESM(require_jsx_runtime());
  var container = document.getElementById("root");
  if (container) {
    (0, import_client.createRoot)(container).render(/* @__PURE__ */ (0, import_jsx_runtime14.jsx)(App, {}));
  }
})();
