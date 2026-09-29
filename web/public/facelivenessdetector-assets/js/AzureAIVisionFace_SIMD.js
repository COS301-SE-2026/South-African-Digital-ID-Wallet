var a0_0x5889c6 = a0_0x1c46
;(function (_0x39b3b4, _0x1a82a3) {
  var _0x46e8c1 = a0_0x1c46,
    _0x43fee2 = _0x39b3b4()
  while (!![]) {
    try {
      var _0x4b70b4 =
        (-parseInt(_0x46e8c1(0x31b)) / 0x1) *
          (-parseInt(_0x46e8c1(0x33d)) / 0x2) +
        parseInt(_0x46e8c1(0x1da)) / 0x3 +
        (parseInt(_0x46e8c1(0x40b)) / 0x4) *
          (-parseInt(_0x46e8c1(0x1df)) / 0x5) +
        parseInt(_0x46e8c1(0x250)) / 0x6 +
        -parseInt(_0x46e8c1(0x402)) / 0x7 +
        -parseInt(_0x46e8c1(0x237)) / 0x8 +
        (parseInt(_0x46e8c1(0x298)) / 0x9) * (parseInt(_0x46e8c1(0x351)) / 0xa)
      if (_0x4b70b4 === _0x1a82a3) break
      else _0x43fee2['push'](_0x43fee2['shift']())
    } catch (_0x34546c) {
      _0x43fee2['push'](_0x43fee2['shift']())
    }
  }
})(a0_0x3f2e, 0xd8617)
var Module = typeof Module != a0_0x5889c6(0x343) ? Module : {},
  ENVIRONMENT_IS_WEB = typeof window == a0_0x5889c6(0x2c3),
  ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined',
  ENVIRONMENT_IS_NODE =
    typeof process == a0_0x5889c6(0x2c3) &&
    process[a0_0x5889c6(0x192)]?.[a0_0x5889c6(0x2b0)] &&
    process[a0_0x5889c6(0x39a)] != a0_0x5889c6(0x29f),
  ENVIRONMENT_IS_SHELL =
    !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER,
  arguments_ = [],
  thisProgram = './this.program',
  quit_ = (_0xe43be1, _0x3a3b45) => {
    throw _0x3a3b45
  },
  _scriptName =
    typeof document != a0_0x5889c6(0x343)
      ? document['currentScript']?.[a0_0x5889c6(0x219)]
      : undefined
if (typeof __filename != a0_0x5889c6(0x343)) _scriptName = __filename
else
  ENVIRONMENT_IS_WORKER &&
    (_scriptName = self[a0_0x5889c6(0x318)][a0_0x5889c6(0x1de)])
var scriptDirectory = ''
function locateFile(_0x55ac78) {
  var _0x2f140d = a0_0x5889c6
  if (Module[_0x2f140d(0x242)])
    return Module[_0x2f140d(0x242)](_0x55ac78, scriptDirectory)
  return scriptDirectory + _0x55ac78
}
var readAsync, readBinary
if (ENVIRONMENT_IS_NODE) {
  const isNode =
    typeof process == a0_0x5889c6(0x2c3) &&
    process[a0_0x5889c6(0x192)]?.[a0_0x5889c6(0x2b0)] &&
    process['type'] != 'renderer'
  if (!isNode) throw new Error(a0_0x5889c6(0x271))
  var nodeVersion = process[a0_0x5889c6(0x192)][a0_0x5889c6(0x2b0)],
    numericVersion = nodeVersion[a0_0x5889c6(0x393)]('.')[a0_0x5889c6(0x24c)](
      0x0,
      0x3
    )
  numericVersion =
    numericVersion[0x0] * 0x2710 +
    numericVersion[0x1] * 0x64 +
    numericVersion[0x2][a0_0x5889c6(0x393)]('-')[0x0] * 0x1
  if (numericVersion < 0x27100)
    throw new Error(a0_0x5889c6(0x27d) + nodeVersion + ')')
  var fs = require('fs')
  ;((scriptDirectory = __dirname + '/'),
    (readBinary = (_0x2b8a9e) => {
      var _0x5a9c11 = a0_0x5889c6
      _0x2b8a9e = isFileURI(_0x2b8a9e) ? new URL(_0x2b8a9e) : _0x2b8a9e
      var _0x289f94 = fs[_0x5a9c11(0x2c1)](_0x2b8a9e)
      return (assert(Buffer['isBuffer'](_0x289f94)), _0x289f94)
    }),
    (readAsync = async (_0x133faf, _0x941dea = !![]) => {
      var _0x3ed540 = a0_0x5889c6
      _0x133faf = isFileURI(_0x133faf) ? new URL(_0x133faf) : _0x133faf
      var _0x42905c = fs[_0x3ed540(0x2c1)](
        _0x133faf,
        _0x941dea ? undefined : _0x3ed540(0x2a8)
      )
      return (
        assert(
          _0x941dea
            ? Buffer[_0x3ed540(0x2aa)](_0x42905c)
            : typeof _0x42905c == _0x3ed540(0x21f)
        ),
        _0x42905c
      )
    }),
    process[a0_0x5889c6(0x2bf)]['length'] > 0x1 &&
      (thisProgram = process[a0_0x5889c6(0x2bf)][0x1][a0_0x5889c6(0x3e6)](
        /\\/g,
        '/'
      )),
    (arguments_ = process[a0_0x5889c6(0x2bf)][a0_0x5889c6(0x24c)](0x2)),
    typeof module != a0_0x5889c6(0x343) &&
      (module[a0_0x5889c6(0x323)] = Module),
    (quit_ = (_0x5f5350, _0x5b4da7) => {
      process['exitCode'] = _0x5f5350
      throw _0x5b4da7
    }))
} else {
  if (ENVIRONMENT_IS_SHELL) {
    const isNode =
      typeof process == 'object' &&
      process[a0_0x5889c6(0x192)]?.[a0_0x5889c6(0x2b0)] &&
      process[a0_0x5889c6(0x39a)] != 'renderer'
    if (
      isNode ||
      typeof window == a0_0x5889c6(0x2c3) ||
      typeof WorkerGlobalScope != 'undefined'
    )
      throw new Error(a0_0x5889c6(0x271))
  } else {
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      try {
        scriptDirectory = new URL('.', _scriptName)[a0_0x5889c6(0x1de)]
      } catch {}
      if (
        !(
          typeof window == a0_0x5889c6(0x2c3) ||
          typeof WorkerGlobalScope != a0_0x5889c6(0x343)
        )
      )
        throw new Error(
          'not\x20compiled\x20for\x20this\x20environment\x20(did\x20you\x20build\x20to\x20HTML\x20and\x20try\x20to\x20run\x20it\x20not\x20on\x20the\x20web,\x20or\x20set\x20ENVIRONMENT\x20to\x20something\x20-\x20like\x20node\x20-\x20and\x20run\x20it\x20someplace\x20else\x20-\x20like\x20on\x20the\x20web?)'
        )
      {
        ;(ENVIRONMENT_IS_WORKER &&
          (readBinary = (_0xbda322) => {
            var _0x4019a0 = a0_0x5889c6,
              _0x98e5d8 = new XMLHttpRequest()
            return (
              _0x98e5d8[_0x4019a0(0x122)](_0x4019a0(0x3ff), _0xbda322, ![]),
              (_0x98e5d8[_0x4019a0(0x32b)] = _0x4019a0(0x19b)),
              _0x98e5d8[_0x4019a0(0x388)](null),
              new Uint8Array(_0x98e5d8['response'])
            )
          }),
          (readAsync = async (_0x1c8e06) => {
            var _0x1b40f3 = a0_0x5889c6
            if (isFileURI(_0x1c8e06))
              return new Promise((_0x2b0ede, _0x150fac) => {
                var _0x7b766 = a0_0x1c46,
                  _0xc4628f = new XMLHttpRequest()
                ;(_0xc4628f[_0x7b766(0x122)](_0x7b766(0x3ff), _0x1c8e06, !![]),
                  (_0xc4628f['responseType'] = _0x7b766(0x19b)),
                  (_0xc4628f[_0x7b766(0x3cc)] = () => {
                    var _0x5701de = _0x7b766
                    if (
                      _0xc4628f[_0x5701de(0x28d)] == 0xc8 ||
                      (_0xc4628f[_0x5701de(0x28d)] == 0x0 &&
                        _0xc4628f[_0x5701de(0x2b4)])
                    ) {
                      _0x2b0ede(_0xc4628f[_0x5701de(0x2b4)])
                      return
                    }
                    _0x150fac(_0xc4628f[_0x5701de(0x28d)])
                  }),
                  (_0xc4628f[_0x7b766(0x207)] = _0x150fac),
                  _0xc4628f[_0x7b766(0x388)](null))
              })
            var _0x2b18d9 = await fetch(_0x1c8e06, {
              credentials: 'same-origin',
            })
            if (_0x2b18d9['ok']) return _0x2b18d9[_0x1b40f3(0x363)]()
            throw new Error(
              _0x2b18d9[_0x1b40f3(0x28d)] +
                _0x1b40f3(0x12e) +
                _0x2b18d9[_0x1b40f3(0x16c)]
            )
          }))
      }
    } else throw new Error(a0_0x5889c6(0x19c))
  }
}
var out = console['log'][a0_0x5889c6(0x299)](console),
  err = console[a0_0x5889c6(0x2b3)][a0_0x5889c6(0x299)](console)
assert(!ENVIRONMENT_IS_SHELL, a0_0x5889c6(0x285))
var wasmBinary
typeof WebAssembly != a0_0x5889c6(0x2c3) && err(a0_0x5889c6(0x228))
var ABORT = ![],
  EXITSTATUS
function a0_0x1c46(_0x3fdf94, _0x455c48) {
  _0x3fdf94 = _0x3fdf94 - 0x119
  var _0x3f2e1c = a0_0x3f2e()
  var _0x1c46e8 = _0x3f2e1c[_0x3fdf94]
  return _0x1c46e8
}
function assert(_0x5b588e, _0x2ab4f6) {
  var _0x4f50bd = a0_0x5889c6
  !_0x5b588e && abort(_0x4f50bd(0x1bc) + (_0x2ab4f6 ? ':\x20' + _0x2ab4f6 : ''))
}
var isFileURI = (_0x389076) => _0x389076['startsWith'](a0_0x5889c6(0x317))
function writeStackCookie() {
  var _0x4ff0a6 = _emscripten_stack_get_end()
  ;(assert((_0x4ff0a6 & 0x3) == 0x0),
    _0x4ff0a6 == 0x0 && (_0x4ff0a6 += 0x4),
    (HEAPU32[_0x4ff0a6 >> 0x2] = 0x2135467),
    checkInt32(0x2135467),
    (HEAPU32[(_0x4ff0a6 + 0x4) >> 0x2] = 0x89bacdfe),
    checkInt32(0x89bacdfe),
    (HEAPU32[0x0 >> 0x2] = 0x63736d65),
    checkInt32(0x63736d65))
}
function checkStackCookie() {
  var _0x365ce9 = a0_0x5889c6
  if (ABORT) return
  var _0x3ce248 = _emscripten_stack_get_end()
  _0x3ce248 == 0x0 && (_0x3ce248 += 0x4)
  var _0x329f33 = HEAPU32[_0x3ce248 >> 0x2],
    _0x426677 = HEAPU32[(_0x3ce248 + 0x4) >> 0x2]
  ;((_0x329f33 != 0x2135467 || _0x426677 != 0x89bacdfe) &&
    abort(
      'Stack\x20overflow!\x20Stack\x20cookie\x20has\x20been\x20overwritten\x20at\x20' +
        ptrToString(_0x3ce248) +
        _0x365ce9(0x35e) +
        ptrToString(_0x426677) +
        '\x20' +
        ptrToString(_0x329f33)
    ),
    HEAPU32[0x0 >> 0x2] != 0x63736d65 && abort(_0x365ce9(0x1b7)))
}
var runtimeDebug = !![]
function dbg(..._0x5032ff) {
  var _0x59d587 = a0_0x5889c6
  if (!runtimeDebug && typeof runtimeDebug != _0x59d587(0x343)) return
  console['warn'](..._0x5032ff)
}
;(() => {
  var _0x111910 = a0_0x5889c6,
    _0x1dadd4 = new Int16Array(0x1),
    _0x24eead = new Int8Array(_0x1dadd4[_0x111910(0x243)])
  _0x1dadd4[0x0] = 0x6373
  if (_0x24eead[0x0] !== 0x73 || _0x24eead[0x1] !== 0x63) throw _0x111910(0x1f2)
})()
function consumedModuleProp(_0x47fae3) {
  var _0x39b987 = a0_0x5889c6
  !Object[_0x39b987(0x374)](Module, _0x47fae3) &&
    Object[_0x39b987(0x353)](Module, _0x47fae3, {
      configurable: !![],
      set() {
        var _0x533f2d = _0x39b987
        abort(_0x533f2d(0x20e) + _0x47fae3 + _0x533f2d(0x29e))
      },
    })
}
function a0_0x3f2e() {
  var _0x444bd4 = [
    '_emscripten_stack_alloc',
    'function\x20',
    'ptrToString',
    'touchmove',
    '\x20bytes!',
    'Cannot\x20register\x20type\x20\x27',
    'ceil',
    'safeSetTimeout',
    'getInheritedInstance',
    'fillGamepadEventData',
    '\x20-\x20',
    'HEAPF64',
    'padStart',
    'registerDeviceOrientationEventCallback',
    'runEmAsmFunction',
    'toUpperCase',
    'setStatus',
    '__indirect_function_table',
    'SDL',
    'safeRequestAnimationFrame',
    'exitJS',
    'alignment\x20argument\x20is\x20required',
    '):\x20',
    'ptr',
    'setStackLimits',
    'clone',
    'emscriptenWebGLGet',
    'getValue',
    'inetNtop6',
    'typeDependencies',
    'stackTrace',
    'argCount',
    '__derivedClasses',
    'timeout',
    'streaming\x20uses\x20moz-chunked-arraybuffer\x20which\x20is\x20no\x20longer\x20supported;\x20TODO:\x20rewrite\x20using\x20fetch()',
    'assertIntegerRange',
    'no\x20data',
    'growMemory:\x20Attempted\x20to\x20grow\x20heap\x20from\x20',
    'varargs',
    'InvokerFunctions',
    'randomUUID',
    'ontimeout',
    '\x27!\x20Overload\x20resolution\x20is\x20currently\x20only\x20performed\x20using\x20the\x20parameter\x20count,\x20not\x20actual\x20type\x20info!',
    'Invalid\x20UTF-8\x20leading\x20byte\x20',
    'addRunDependency',
    'getMonth',
    'onload',
    'timezone\x20name\x20truncated\x20to\x20fit\x20in\x20TZNAME_MAX\x20(',
    'createPreloadedFile',
    'Cannot\x20pass\x20non-string\x20to\x20std::string',
    'requestFullScreen',
    'optional',
    'pointerType',
    'dependency:\x20',
    'IDBStore',
    'uncaughtExceptionCount',
    'getterReturnType',
    'stack\x20overflow\x20(Attempt\x20to\x20set\x20SP\x20to\x20',
    'init_ClassHandle',
    'checkStackCookie',
    'name',
    '__emscripten_stack_restore',
    'constNoSmartPtrRawPointerToWireType',
    '_currentShadowRoot',
    'Invalid\x20Unicode\x20code\x20point\x20',
    'asyncLoad',
    'Cannot\x20register\x20public\x20name\x20\x27',
    'registerInheritedInstance',
    'i16',
    'addOnPreRun',
    'getElementById',
    'Module.setWindowTitle\x20option\x20was\x20removed\x20(modify\x20emscripten_set_window_title\x20in\x20JS)',
    'replace',
    '\x20bytes,\x20but\x20the\x20limit\x20is\x20',
    'Function\x20\x27',
    'integerReadValueFromPointer',
    'webgl_enable_WEBGL_multi_draw',
    'user\x20callback\x20triggered\x20after\x20runtime\x20exited\x20or\x20application\x20aborted.\x20\x20Ignoring.',
    'registerRestoreOldStyle',
    'constructor',
    'asUintN',
    'null\x20is\x20not\x20a\x20valid\x20',
    '\x27\x20called\x20with\x20an\x20invalid\x20number\x20of\x20arguments\x20(',
    ')\x20into\x20integer\x20heap',
    'convertI32PairToI53',
    'createNamedFunction',
    '___getTypeName',
    'wasmMemory',
    'onsuccess',
    'STACK_SIZE\x20can\x20no\x20longer\x20be\x20set\x20at\x20runtime.\x20\x20Use\x20-sSTACK_SIZE\x20at\x20link\x20time',
    'getUniqueRunDependency',
    'strError',
    'getFunctionArgsName',
    'getExecutableName',
    'forEach',
    'emscriptenWebGLGetUniform',
    'Module.readBinary\x20option\x20was\x20removed\x20(modify\x20readBinary\x20in\x20JS)',
    'GET',
    'join',
    'UTF8ToString',
    '9492560dxlYxz',
    'webgl_enable_OES_vertex_array_object',
    './this.program',
    'SHA-256',
    'invalid\x20type\x20for\x20getValue:\x20',
    'readAsync',
    '\x22\x20as\x20a\x20',
    '.\x20\x20The\x20loaded\x20WebAssembly\x20file\x20is\x20likely\x20out\x20of\x20sync\x20with\x20the\x20generated\x20JavaScript.',
    'init',
    '75560piOnzs',
    'registerGamepadEventCallback',
    'writeArrayToMemory\x20array\x20must\x20have\x20a\x20length\x20(should\x20be\x20an\x20array\x20or\x20typed\x20array)',
    'test',
    'set_destructor',
    'Module.instantiateWasm\x20callback\x20failed\x20with\x20error:\x20',
    'getBoundingClientRect',
    'PATH',
    '\x20with\x20invalid\x20number\x20of\x20parameters\x20(',
    'downcastPointer',
    'embindRepr',
    'hasOwnProperty',
    'stdio\x20streams\x20had\x20content\x20in\x20them\x20that\x20was\x20not\x20flushed.\x20you\x20should\x20set\x20EXIT_RUNTIME\x20to\x201\x20(see\x20the\x20Emscripten\x20FAQ),\x20or\x20make\x20sure\x20to\x20emit\x20a\x20newline\x20when\x20you\x20printf\x20etc.',
    'Use\x20\x27new\x27\x20to\x20construct\x20',
    'emClearImmediate_deps',
    'smartPtrType',
    'HEAPF32',
    'invalid\x20float\x20width\x20(',
    'registerPreMainLoop',
    'keepRuntimeAlive',
    'filePackagePrefixURL',
    'tupleRegistrations',
    'invalid\x20handle:\x20',
    'getTypeName',
    'setCanvasElementSize',
    'registerWebGlEventCallback',
    'warning:\x20run\x20dependency\x20removed\x20without\x20ID',
    'filter',
    'array',
    'Embind\x20found\x20a\x20leaked\x20C++\x20instance\x20',
    'initRandomFill',
    ')\x20-\x20expected\x20(',
    'MONTH_DAYS_LEAP_CUMULATIVE',
    'AzureAIVisionFace_SIMD.wasm',
    'postRun',
    'open',
    'addOnPostCtor',
    'write',
    'set',
    '>.\x0a',
    'whenDependentTypesAreResolved',
    'GLUT',
    '\x22)\x20in\x20readEmAsmArgs!\x20Use\x20only\x20[',
    'stringToUTF8Array\x20expects\x20a\x20string\x20(got\x20',
    '\x20bytes\x20to\x20',
    'instancePrototype',
    'addEventListener',
    '\x20:\x20',
    'webgl_enable_EXT_polygon_offset_clamp',
    'emval_get_global',
    'computeUnpackAlignedImageSize',
    'toValue',
    'native\x20function\x20`',
    'getEnvStrings',
    'pop',
    'exceptionLast',
    'webgl_enable_ANGLE_instanced_arrays',
    'count',
    'ASSERTIONS',
    'registerKeyEventCallback',
    'getSeconds',
    'overrideMimeType',
    'wasm-instantiate',
    'sqrt',
    'clientX',
    'Async\x20bindings\x20are\x20only\x20supported\x20with\x20JSPI.',
    'total',
    'Missing\x20field:\x20\x22',
    'FS_createDataFile',
    'strings',
    'rawConstructor',
    'miniTempWebGLFloatBuffers',
    'still\x20waiting\x20on\x20run\x20dependencies:',
    '__glGetActiveAttribOrUniform',
    'emscriptenWebGLGetTexPixelData',
    'downcast',
    '`\x20called\x20with\x20',
    'getComputedStyle',
    'fields',
    '],\x20and\x20do\x20not\x20specify\x20\x22v\x22\x20for\x20void\x20return\x20argument.',
    'preInit',
    'writeAsciiToMemory',
    'createDataFile',
    'convertPCtoSourceLocation',
    'throwInternalError',
    '.\x20Alternatively,\x20forcing\x20filesystem\x20support\x20(-sFORCE_FILESYSTEM)\x20can\x20export\x20this\x20for\x20you',
    'Please\x20use\x20HEAP8.buffer\x20or\x20wasmMemory.buffer',
    'only\x202-byte\x20and\x204-byte\x20strings\x20are\x20currently\x20supported',
    '\x20called\x20with\x20',
    'unwind',
    'reject',
    'charCodeAt',
    '_free',
    'fd_close\x20called\x20without\x20SYSCALLS_REQUIRE_FILESYSTEM',
    'detachFinalizer',
    'SYSCALLS',
    '_emscripten_stack_get_free',
    'fflush',
    'Aborted(',
    'activeVerificationSubtitle',
    'readEmAsmArgs',
    'readI53FromU64',
    'EmValOptionalType',
    'shown',
    '___set_stack_limits',
    'sharedRegisterType',
    'fillVisibilityChangeEventData',
    'jstoi_s',
    'onAbort',
    'url',
    'shallowCopyInternalPointer',
    'withCredentials',
    'arraySum',
    'HandleAllocator',
    '\x20args\x20but\x20expects\x20',
    'concat',
    'Object\x20already\x20scheduled\x20for\x20deletion',
    'preventDefault',
    'dbInstance',
    'dynCall',
    'Program\x20terminated\x20with\x20exit(',
    'FS_createPreloadedFile',
    'instance',
    'library_fetch_init',
    'fromWireType',
    'Exception\x20thrown,\x20but\x20exception\x20catching\x20is\x20not\x20enabled.\x20Compile\x20with\x20-sNO_DISABLE_EXCEPTION_CATCHING\x20or\x20-sEXCEPTION_CATCHING_ALLOWED=[..]\x20to\x20catch.',
    'maybeCStringToJsString',
    'addOnInit',
    'convertJsFunctionToWasm',
    '\x20encountered\x20when\x20deserializing\x20a\x20UTF-8\x20string\x20in\x20wasm\x20memory\x20to\x20a\x20JS\x20string!',
    'HEAPU8',
    'ERRNO_CODES',
    'Running...',
    'fd_read\x20called\x20without\x20SYSCALLS_REQUIRE_FILESYSTEM',
    'feedbackForFace',
    'detachFinalizer_deps',
    'compiled\x20without\x20a\x20main,\x20but\x20one\x20is\x20present.\x20if\x20you\x20added\x20it\x20from\x20JS,\x20use\x20Module[\x22onRuntimeInitialized\x22]',
    'floatReadValueFromPointer',
    'ccall',
    'contains',
    'getUTCDay',
    'call',
    'getDate',
    'convertU32PairToI53',
    'emval_lookupTypes',
    'STACK_ALIGN',
    ')\x20too\x20small\x20to\x20write\x20as\x20',
    'versions',
    'getTempRet0',
    'jstoi_q',
    'runtimeKeepalivePop',
    'program\x20exited\x20(with\x20status:\x20',
    'alignMemory',
    'INT53_MAX',
    'stringToUTF16(str,\x20outPtr,\x20maxBytesToWrite)\x20is\x20missing\x20the\x20third\x20parameter\x20that\x20specifies\x20the\x20length\x20of\x20the\x20output\x20buffer!',
    'Tried\x20to\x20invoke\x20ctor\x20of\x20',
    'arraybuffer',
    'environment\x20detection\x20error',
    '\x20instead!',
    'instantiateWasm',
    'getSocketFromFD',
    'getYear',
    'makeClassHandle\x20requires\x20ptr\x20and\x20ptrType',
    'failed\x20to\x20asynchronously\x20prepare\x20wasm:\x20',
    'cdInitializerPrefixURL',
    'timers',
    'Passing\x20a\x20number\x20\x22',
    'calledRun',
    'noExitRuntime',
    'setTempRet0',
    'demangle',
    'allocateUTF8OnStack',
    'read',
    'arguments',
    'fillMouseEventData',
    'printErr',
    ')\x20too\x20large\x20to\x20write\x20as\x20',
    'Module.TOTAL_MEMORY\x20has\x20been\x20renamed\x20Module.INITIAL_MEMORY',
    'EGL',
    'stringToUTF8OnStack',
    'destructor',
    'onreadystatechange',
    'style',
    'registerPointerlockChangeEventCallback',
    'Runtime\x20error:\x20The\x20application\x20has\x20corrupted\x20its\x20heap\x20memory\x20area\x20(address\x20zero)!',
    'ENVIRONMENT',
    '_AAI_promises',
    'getHours',
    'url_',
    'Assertion\x20failed',
    'init_RegisteredPointer',
    'web_user',
    '\x22\x20from\x20JS\x20side\x20to\x20C/C++\x20side\x20to\x20an\x20argument\x20of\x20type\x20\x22',
    'UTF32ToString',
    'Cannot\x20pass\x20deleted\x20object\x20as\x20a\x20pointer\x20of\x20type\x20',
    'getPointee',
    'exceptionCaught',
    'touches',
    'enum',
    'brightnessDescription',
    'wheel',
    'Module.read\x20option\x20was\x20removed',
    'getAllResponseHeaders',
    'enumReadValueFromPointer',
    'brightnessCheckboxLabel',
    'dispose',
    'getUserMedia',
    'excPtr',
    'indexOf',
    'put',
    'language',
    '_malloc',
    'stackSave',
    '`\x20called\x20before\x20runtime\x20initialization',
    'call\x20to\x20\x27',
    'setter',
    ']).\x20If\x20you\x20require\x20more\x20stack\x20space\x20build\x20with\x20-sSTACK_SIZE=<bytes>',
    'PATH_FS',
    'register',
    '1965066tAQhah',
    'out',
    'getStringOrSymbol',
    'updateTableMap',
    'href',
    '365qQWKsK',
    'isConst',
    'onRuntimeInitialized',
    'idsToPromises',
    'POINTER_SIZE',
    '\x20due\x20to\x20unbound\x20types',
    'subtle',
    'loaded',
    'webglPrepareUniformLocationsBeforeFirstUse',
    '\x20took\x20',
    'onprogress',
    'activeVerificationButtonCancel',
    'stringToUTF8Array',
    'stringToUTF16',
    'getMinutes',
    'Expected\x2012\x20closure\x20arguments\x20',
    'currentFullscreenStrategy',
    'getPromise',
    'lengthBytesUTF8',
    'Runtime\x20error:\x20expected\x20the\x20system\x20to\x20be\x20little-endian!\x20(Run\x20with\x20-sSUPPORT_BIG_ENDIAN\x20to\x20bypass)',
    '__emscripten_stack_alloc',
    'setterArgumentType',
    'registerWheelEventCallback',
    'FS_createDevice',
    'getRandomValues',
    'Both\x20smartPtrType\x20and\x20smartPtr\x20must\x20be\x20specified',
    'emscripten_stack_get_end',
    'intArrayFromString',
    'registerFocusEventCallback',
    'overloadTable',
    'falling\x20back\x20to\x20ArrayBuffer\x20instantiation',
    'count_emval_handles',
    'writeArrayToMemory',
    'fillDeviceOrientationEventData',
    'EmValType',
    'readBinary',
    'fromCodePoint',
    'max',
    '(end\x20of\x20list)',
    ')\x20=>\x20',
    'onerror',
    'registerType',
    'thisProgram',
    'getTimezoneOffset',
    '\x20to\x20Wasm\x20heap\x20as\x20bytes\x20lo=',
    '`\x20is\x20a\x20library\x20symbol\x20and\x20not\x20included\x20by\x20default;\x20add\x20it\x20to\x20your\x20library.js\x20__deps\x20or\x20to\x20DEFAULT_LIBRARY_FUNCS_TO_INCLUDE\x20on\x20the\x20command\x20line',
    'getHeapMax',
    'Attempt\x20to\x20set\x20`Module.',
    'TOTAL_MEMORY',
    'writeI53ToI64Clamped',
    'createContext',
    'getUTCHours',
    'HEAPU32',
    'Cannot\x20register\x20multiple\x20overloads\x20of\x20a\x20function\x20with\x20the\x20same\x20number\x20of\x20arguments\x20(',
    '\x20to\x20parameter\x20type\x20',
    'rawGetPointee',
    'MONTH_DAYS_LEAP',
    'create',
    'src',
    'webglGetUniformLocation',
    'runAndAbortIfError',
    'captureStackTrace',
    'toWireType',
    'statusText',
    'string',
    ')\x20is\x20not\x20supported\x20in\x20most\x20browsers.\x20See\x20https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing',
    'exposePublicSymbol',
    'stackRestore',
    '\x20to\x20',
    'shift',
    'readSockaddr',
    'registeredTypes',
    'webgl_enable_WEBGL_draw_buffers',
    'no\x20native\x20wasm\x20support\x20detected',
    'makePromise',
    'UnboundTypeError',
    'assign',
    'function',
    'IndexedDB\x20not\x20available!',
    'BindingError',
    'restoreOldWindowedStyle',
    'utf-16le',
    'trim',
    'MONTH_DAYS_REGULAR',
    'mmapAlloc',
    'screenOrientation',
    'float',
    'number',
    '4657832osQneA',
    'warning:\x20',
    'miniTempWebGLIntBuffers',
    'malloc',
    'fetchDeleteCachedData',
    'invalid\x20integer\x20width\x20(',
    'emval_methodCallers',
    'Pointer\x20passed\x20to\x20stringToUTF32\x20must\x20be\x20aligned\x20to\x20four\x20bytes!',
    'checkArgCount',
    '`\x20not\x20included\x20in\x20INCOMING_MODULE_JS_API',
    'DNS',
    'locateFile',
    'buffer',
    'deltaY',
    'rawDestructor',
    'emscripten_stack_get_base',
    'memory',
    'objectStoreNames',
    'target',
    'runDestructors',
    '\x20instance\x20already\x20deleted',
    'slice',
    'both\x20async\x20and\x20sync\x20fetching\x20of\x20the\x20wasm\x20failed',
    'RegisteredPointer_fromWireType',
    'registerOrientationChangeEventCallback',
    '6219576ivcsGy',
    'wasmExports',
    'allocate',
    'sharingPolicy',
    'Module.pthreadMainPrefixURL\x20option\x20was\x20removed,\x20use\x20Module.locateFile\x20instead',
    'get_rethrown',
    'Browser',
    'Cannot\x20use\x20deleted\x20val.\x20handle\x20=\x20',
    'writeI53ToI64()\x20out\x20of\x20range:\x20serialized\x20JS\x20Number\x20',
    'codePointAt',
    'attachFinalizer',
    'runDestructor',
    ',\x20make\x20sure\x20it\x20is\x20exported',
    'getUTCDate',
    'i32',
    'registerMouseEventCallback',
    'convertI32PairToI53Checked',
    '__getTypeName',
    'emval_returnValue',
    '\x20arguments,\x20expected\x20',
    'emscripten_stack_get_free',
    'endsWith',
    'fromCharCode',
    'UTF8ArrayToString',
    'map',
    'fetchLoadCachedData',
    'touchstart',
    'genericPointerToWireType',
    'argTypes\x20array\x20size\x20mismatch!\x20Must\x20at\x20least\x20get\x20return\x20value\x20and\x20\x27this\x27\x20types!',
    'Replacing\x20nonexistent\x20public\x20symbol',
    'registerBatteryEventCallback',
    'floor',
    'registerTouchEventCallback',
    'not\x20compiled\x20for\x20this\x20environment\x20(did\x20you\x20build\x20to\x20HTML\x20and\x20try\x20to\x20run\x20it\x20not\x20on\x20the\x20web,\x20or\x20set\x20ENVIRONMENT\x20to\x20something\x20-\x20like\x20node\x20-\x20and\x20run\x20it\x20someplace\x20else\x20-\x20like\x20on\x20the\x20web?)',
    'isSmartPointer',
    'FILES',
    'repeat',
    'monitorRunDependencies',
    'prototype',
    'it\x20should\x20not\x20be\x20possible\x20to\x20operate\x20on\x20streams\x20when\x20!SYSCALLS_REQUIRE_FILESYSTEM',
    'usesDestructorStack',
    'inetPton6',
    'deleteObjectStore',
    'writeStringToMemory',
    'colorChannelsInGlTextureFormat',
    'This\x20emscripten-generated\x20code\x20requires\x20node\x20v16.0.0\x20(detected\x20v',
    'getFullYear',
    'values',
    'char_9',
    'webglGetLeftBracePos',
    'keys',
    'parentContainer',
    'getActualType',
    'shell\x20environment\x20detected\x20but\x20not\x20enabled\x20at\x20build\x20time.\x20\x20Add\x20`shell`\x20to\x20`-sENVIRONMENT`\x20to\x20enable.',
    'releaseClassHandle',
    'writeStackCookie',
    '\x20const*',
    'freelist',
    'getTime',
    'setValue',
    'wasmTable',
    'status',
    'fontSize',
    'transaction',
    'min',
    'maybeExit',
    'checkWasiClock',
    'boolean',
    'validateThis',
    'requestFullscreen',
    'fillFullscreenChangeEventData',
    'tempFixedLengthArray',
    '9gcsmiq',
    'bind',
    'now',
    'setTime',
    'responseURL',
    'unregister',
    '`\x20after\x20it\x20has\x20already\x20been\x20processed.\x20\x20This\x20can\x20happen,\x20for\x20example,\x20when\x20code\x20is\x20injected\x20via\x20\x27--post-js\x27\x20rather\x20than\x20\x27--pre-js\x27',
    'renderer',
    'xhrs',
    'readyState',
    'set_adjusted_ptr',
    'readwrite',
    'upcast',
    'requestPointerLock',
    '\x22,\x20which\x20is\x20outside\x20the\x20valid\x20range\x20[',
    'MONTH_DAYS_REGULAR_CUMULATIVE',
    'utf8',
    'asm',
    'isBuffer',
    'fetchXHR',
    'JSEvents_requestFullscreen',
    'registerPostMainLoop',
    'growMemory',
    'preservePointerOnDelete',
    'node',
    '\x22\x20to\x20',
    'allocateUTF8',
    'error',
    'response',
    '\x20given.',
    'getUTCMonth',
    'same-origin',
    'ptrType',
    'registerFullscreenChangeEventCallback',
    '\x20(e.g.\x20-sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE=\x27',
    'leakWarning',
    'registerPointerlockErrorEventCallback',
    '(this\x20may\x20also\x20be\x20due\x20to\x20not\x20including\x20full\x20filesystem\x20support\x20-\x20try\x20building\x20with\x20-sFORCE_FILESYSTEM)',
    'throwBindingError',
    'argv',
    'setLetterbox',
    'readFileSync',
    'pureVirtualFunctions',
    'object',
    'includes',
    'Cannot\x20pass\x20\x22',
    'getUTCMinutes',
    'ignoreDuplicateRegistrations',
    'doRequestFullscreen',
    'RegisteredClass',
    'createJsInvokerSignature',
    'setWindowTitle',
    'UTC',
    'pointeeType',
    'getFunctionAddress',
    '`Module.',
    'UNWIND_CACHE',
    'Unsupporting\x20sharing\x20policy',
    'result',
    'handleException',
    'print',
    'registerBeforeUnloadEventCallback',
    'Make\x20sure\x20to\x20invoke\x20.delete()\x20manually\x20once\x20you\x27re\x20done\x20with\x20the\x20instance\x20instead.\x0a',
    'setDelayFunction',
    'BYTES_PER_ELEMENT',
    'Module.ENVIRONMENT\x20has\x20been\x20deprecated.\x20To\x20force\x20the\x20environment,\x20use\x20the\x20ENVIRONMENT\x20compile-time\x20option\x20(for\x20example,\x20-sENVIRONMENT=web\x20or\x20-sENVIRONMENT=node)',
    'RegisteredPointer',
    'writeI53ToU64Clamped',
    'get',
    'emscripten_filesystem',
    'memory\x20not\x20found\x20in\x20wasm\x20exports',
    'Module.filePackagePrefixURL\x20option\x20was\x20removed,\x20use\x20Module.locateFile\x20instead',
    '`\x20not\x20found',
    'Use\x20of\x20`wasmMemory`\x20detected.\x20\x20Use\x20-sIMPORTED_MEMORY\x20to\x20define\x20wasmMemory\x20externally',
    'allocated',
    'getDay',
    '-bit\x20value',
    'baseClass',
    'readonly',
    'lengthBytesUTF32',
    'onupgradeneeded',
    'Pointer\x20passed\x20to\x20stringToUTF16\x20must\x20be\x20aligned\x20to\x20two\x20bytes!',
    'then',
    'toString',
    'objectStore',
    'wasiRightsToMuslOFlags',
    'addOnPostRun',
    'Emval',
    'getterContext',
    'methodCaller<(',
    'getBasestPointer',
    'Cannot\x20call\x20',
    'constructor_body',
    'value',
    'upcastPointer',
    'UTF8ToString\x20expects\x20a\x20number\x20(got\x20',
    'ExitStatus',
    ',\x20got\x20an\x20instance\x20of\x20',
    'runtimeKeepalivePush',
    ',\x20with\x20stack\x20limits\x20[',
    'abs',
    'finalizationRegistry',
    'webgl_enable_WEBGL_polygon_mode',
    'Detected\x20runtime\x20INITIAL_MEMORY\x20setting.\x20\x20Use\x20-sIMPORTED_MEMORY\x20to\x20define\x20wasmMemory\x20dynamically',
    'construct',
    'freeTableIndexes',
    'JavaScript-side\x20Wasm\x20function\x20table\x20mirror\x20is\x20out\x20of\x20date!',
    '\x27\x20twice',
    'inetNtop4',
    'INT53_MIN',
    'setImmediateWrapped',
    'activeVerificationTitle',
    'length',
    ')\x20-\x20expects\x20one\x20of\x20(',
    'setterContext',
    'setRequestHeader',
    '\x27\x20via\x20reference\x20taken\x20before\x20Wasm\x20module\x20initialization',
    'bigintToI53Checked',
    'crypto',
    'abort',
    'UTF8Decoder',
    'null',
    'addOnPreMain',
    'no\x20url\x20specified!',
    'Expected\x2010\x20closure\x20arguments\x20',
    'nonConstNoSmartPtrRawPointerToWireType',
    'writeI53ToI64',
    'file://',
    'location',
    'ptr\x20should\x20not\x20be\x20undefined',
    'Cannot\x20convert\x20\x22',
    '40105kRABZB',
    'Pointer\x20passed\x20to\x20UTF32ToString\x20must\x20be\x20aligned\x20to\x20four\x20bytes!',
    'EM_IDB_DELETE',
    'HEAP8',
    'HEAPU64',
    'subarray',
    'invalid\x20type\x20for\x20setValue:\x20',
    'Cannot\x20convert\x20',
    'exports',
    'apply',
    'wasmBinary',
    'registeredInstances',
    'addFunction',
    'isView',
    'emscripten_stack_init',
    'emscriptenWebGLGetVertexAttrib',
    'responseType',
    'String\x20has\x20UTF-16\x20code\x20units\x20that\x20do\x20not\x20fit\x20in\x208\x20bits',
    'toHandle',
    '_main',
    'unregisterInheritedInstance',
    'ydayFromDate',
    'Expected\x2011\x20closure\x20arguments\x20',
    'Pointer\x20passed\x20to\x20UTF16ToString\x20must\x20be\x20aligned\x20to\x20two\x20bytes!',
    'randomFill',
    'unknown\x20function\x20pointer\x20with\x20signature\x20',
    'err',
    'JSEvents_resizeCanvasForFullscreen',
    'registeredPointers',
    'inetPton4',
    'randomFillSync',
    'rawShare',
    'instantiateStreaming',
    'warning:\x20run\x20dependency\x20added\x20without\x20ID',
    '18kxSzOn',
    'fetchCacheData',
    'fieldName',
    'JS\x20engine\x20does\x20not\x20provide\x20full\x20typed\x20array\x20support',
    'set_type',
    'ALLOC_NORMAL',
    'undefined',
    'writeGLArray',
    'has',
    'craftInvokerFunction',
    'getSocketAddress',
    'Cannot\x20construct\x20',
    'jsStackTrace',
    'set_rethrown',
    'byteLength',
    'ALLOC_STACK',
    '\x20encountered\x20when\x20serializing\x20a\x20JS\x20string\x20to\x20a\x20UTF-8\x20string\x20in\x20wasm\x20memory!\x20(Valid\x20unicode\x20code\x20points\x20should\x20be\x20in\x20range\x200-0x10FFFF).',
    'isInteger',
    'webgl_enable_EXT_clip_control',
    'i64',
    '21510110lSfCsl',
    'zeroMemory',
    'defineProperty',
    'smartPtr',
    'deletionQueue',
    '\x20has\x20unknown\x20type\x20',
    'EM_IDB_STORE',
    'getPrototypeOf',
    'deleteScheduled',
    'throwUnboundTypeError',
    'STACK_SIZE',
    '),\x20but\x20keepRuntimeAlive()\x20is\x20set\x20(counter=',
    'heapObjectForWebGLType',
    ',\x20expected\x20hex\x20dwords\x200x89BACDFE\x20and\x200x2135467,\x20but\x20received\x20',
    'ctrlKey',
    'memoryInitializerPrefixURL',
    'emSetImmediate',
    'getUTCSeconds',
    'arrayBuffer',
    'push',
    'UTF16Decoder',
    'getFunctionName',
    '\x20has\x20no\x20accessible\x20constructor',
    'findEventTarget',
    'InternalError',
    'FS_unlink',
    'warnOnce',
    'splice',
    'awaitingDependencies',
    'Cannot\x20convert\x20argument\x20of\x20type\x20',
    'getEmptyTableSlot',
    'registeredClass',
    'Invalid\x20character\x20',
    'intArrayToString',
    'delete',
    'getOwnPropertyDescriptor',
    'JSEvents',
    'Not\x20Found',
    'flush_NO_FILESYSTEM',
    'stringToUTF8(str,\x20outPtr,\x20maxBytesToWrite)\x20is\x20missing\x20the\x20third\x20parameter\x20that\x20specifies\x20the\x20length\x20of\x20the\x20output\x20buffer!',
    '/home/web_user',
    'registerUiEventCallback',
    'callUserCallback',
    'run',
    'decode',
    'Failed\x20to\x20grow\x20the\x20heap\x20from\x20',
    'isReference',
    'removeRunDependency',
    'FS_createLazyFile',
    'double',
    'restoreHiddenElements',
    'Mismatched\x20type\x20converter\x20count',
    'digest',
    'makeClassHandle',
    'flushPendingDeletes',
    'send',
    'emClearImmediate',
    'addDays',
    'createObjectStore',
    'getUTCFullYear',
    'bigint',
    'structRegistrations',
    'destructorFunction',
    'getDynCaller',
    'Return\x20type\x20should\x20not\x20be\x20\x22array\x22.',
    'isLeapYear',
    'split',
    'RuntimeError',
    'createJsInvoker',
    'emval_freelist',
    'Module.cdInitializerPrefixURL\x20option\x20was\x20removed,\x20use\x20Module.locateFile\x20instead',
    'fillDeviceMotionEventData',
    'We\x27ll\x20free\x20it\x20automatically\x20in\x20this\x20case,\x20but\x20this\x20functionality\x20is\x20not\x20reliable\x20across\x20various\x20environments.\x0a',
    'type',
    'stringToUTF32(str,\x20outPtr,\x20maxBytesToWrite)\x20is\x20missing\x20the\x20third\x20parameter\x20that\x20specifies\x20the\x20length\x20of\x20the\x20output\x20buffer!',
    'free',
    'preRun',
  ]
  a0_0x3f2e = function () {
    return _0x444bd4
  }
  return a0_0x3f2e()
}
function makeInvalidEarlyAccess(_0x1f2d9f) {
  var _0x5d4106 = a0_0x5889c6
  return () => assert(![], _0x5d4106(0x1d5) + _0x1f2d9f + _0x5d4106(0x30c))
}
function ignoredModuleProp(_0x5d0e14) {
  var _0x2b6b74 = a0_0x5889c6
  Object[_0x2b6b74(0x374)](Module, _0x5d0e14) &&
    abort(
      _0x2b6b74(0x2cf) +
        _0x5d0e14 +
        '`\x20was\x20supplied\x20but\x20`' +
        _0x5d0e14 +
        _0x2b6b74(0x240)
    )
}
function isExportedByForceFilesystem(_0xd28eb4) {
  var _0x5009d6 = a0_0x5889c6
  return (
    _0xd28eb4 === 'FS_createPath' ||
    _0xd28eb4 === _0x5009d6(0x143) ||
    _0xd28eb4 === _0x5009d6(0x178) ||
    _0xd28eb4 === _0x5009d6(0x36a) ||
    _0xd28eb4 === _0x5009d6(0x3ca) ||
    _0xd28eb4 === _0x5009d6(0x381) ||
    _0xd28eb4 === _0x5009d6(0x1f6) ||
    _0xd28eb4 === _0x5009d6(0x380)
  )
}
function hookGlobalSymbolAccess(_0x5ef913, _0x940e89) {
  var _0x4e2379 = a0_0x5889c6
  typeof globalThis != _0x4e2379(0x343) &&
    !Object[_0x4e2379(0x374)](globalThis, _0x5ef913) &&
    Object[_0x4e2379(0x353)](globalThis, _0x5ef913, {
      configurable: !![],
      get() {
        return (_0x940e89(), undefined)
      },
    })
}
function missingGlobal(_0x540f19, _0x3aed39) {
  hookGlobalSymbolAccess(_0x540f19, () => {
    warnOnce(
      '`' +
        _0x540f19 +
        '`\x20is\x20not\x20longer\x20defined\x20by\x20emscripten.\x20' +
        _0x3aed39
    )
  })
}
;(missingGlobal(a0_0x5889c6(0x243), a0_0x5889c6(0x155)),
  missingGlobal(a0_0x5889c6(0x2a9), 'Please\x20use\x20wasmExports\x20instead'))
function missingLibrarySymbol(_0x4a77b3) {
  ;(hookGlobalSymbolAccess(_0x4a77b3, () => {
    var _0x126186 = a0_0x1c46,
      _0x4cf6b2 = '`' + _0x4a77b3 + _0x126186(0x20c),
      _0x320562 = _0x4a77b3
    ;(!_0x320562['startsWith']('_') && (_0x320562 = '$' + _0x4a77b3),
      (_0x4cf6b2 += _0x126186(0x2ba) + _0x320562 + '\x27)'),
      isExportedByForceFilesystem(_0x4a77b3) && (_0x4cf6b2 += _0x126186(0x154)),
      warnOnce(_0x4cf6b2))
  }),
    unexportedRuntimeSymbol(_0x4a77b3))
}
function unexportedRuntimeSymbol(_0x3e5b7b) {
  var _0x58cf20 = a0_0x5889c6
  !Object[_0x58cf20(0x374)](Module, _0x3e5b7b) &&
    Object[_0x58cf20(0x353)](Module, _0x3e5b7b, {
      configurable: !![],
      get() {
        var _0x52344d = _0x58cf20,
          _0x22aac2 =
            '\x27' +
            _0x3e5b7b +
            '\x27\x20was\x20not\x20exported.\x20add\x20it\x20to\x20EXPORTED_RUNTIME_METHODS\x20(see\x20the\x20Emscripten\x20FAQ)'
        ;(isExportedByForceFilesystem(_0x3e5b7b) &&
          (_0x22aac2 += _0x52344d(0x154)),
          abort(_0x22aac2))
      },
    })
}
var MAX_UINT8 = 0x2 ** 0x8 - 0x1,
  MAX_UINT16 = 0x2 ** 0x10 - 0x1,
  MAX_UINT32 = 0x2 ** 0x20 - 0x1,
  MAX_UINT53 = 0x2 ** 0x35 - 0x1,
  MAX_UINT64 = 0x2 ** 0x40 - 0x1,
  MIN_INT8 = -(0x2 ** (0x8 - 0x1)),
  MIN_INT16 = -(0x2 ** (0x10 - 0x1)),
  MIN_INT32 = -(0x2 ** (0x20 - 0x1)),
  MIN_INT53 = -(0x2 ** (0x35 - 0x1)),
  MIN_INT64 = -(0x2 ** (0x40 - 0x1))
function checkInt(_0x19b673, _0x583fce, _0x5ca681, _0xee150) {
  var _0x40cbd7 = a0_0x5889c6
  ;(assert(
    Number[_0x40cbd7(0x34e)](Number(_0x19b673)),
    'attempt\x20to\x20write\x20non-integer\x20(' + _0x19b673 + _0x40cbd7(0x3f1)
  ),
    assert(
      _0x19b673 <= _0xee150,
      'value\x20(' + _0x19b673 + _0x40cbd7(0x1af) + _0x583fce + '-bit\x20value'
    ),
    assert(
      _0x19b673 >= _0x5ca681,
      'value\x20(' + _0x19b673 + _0x40cbd7(0x191) + _0x583fce + _0x40cbd7(0x2e4)
    ))
}
var checkInt8 = (_0x5ccf14) => checkInt(_0x5ccf14, 0x8, MIN_INT8, MAX_UINT8),
  checkInt16 = (_0x5d4c2c) => checkInt(_0x5d4c2c, 0x10, MIN_INT16, MAX_UINT16),
  checkInt32 = (_0x408cf8) => checkInt(_0x408cf8, 0x20, MIN_INT32, MAX_UINT32),
  checkInt64 = (_0x3c2b62) => checkInt(_0x3c2b62, 0x40, MIN_INT64, MAX_UINT64),
  wasmMemory,
  HEAP8,
  HEAPU8,
  HEAP16,
  HEAPU16,
  HEAP32,
  HEAPU32,
  HEAPF32,
  HEAPF64,
  HEAP64,
  HEAPU64,
  runtimeInitialized = ![]
function updateMemoryViews() {
  var _0x1c05a1 = a0_0x5889c6,
    _0x1d858f = wasmMemory[_0x1c05a1(0x243)]
  ;((HEAP8 = new Int8Array(_0x1d858f)),
    (HEAP16 = new Int16Array(_0x1d858f)),
    (Module[_0x1c05a1(0x181)] = HEAPU8 = new Uint8Array(_0x1d858f)),
    (HEAPU16 = new Uint16Array(_0x1d858f)),
    (HEAP32 = new Int32Array(_0x1d858f)),
    (HEAPU32 = new Uint32Array(_0x1d858f)),
    (HEAPF32 = new Float32Array(_0x1d858f)),
    (HEAPF64 = new Float64Array(_0x1d858f)),
    (HEAP64 = new BigInt64Array(_0x1d858f)),
    (HEAPU64 = new BigUint64Array(_0x1d858f)))
}
assert(
  typeof Int32Array != a0_0x5889c6(0x343) &&
    typeof Float64Array !== a0_0x5889c6(0x343) &&
    Int32Array[a0_0x5889c6(0x276)][a0_0x5889c6(0x320)] != undefined &&
    Int32Array[a0_0x5889c6(0x276)][a0_0x5889c6(0x125)] != undefined,
  a0_0x5889c6(0x340)
)
function preRun() {
  var _0x2be9e3 = a0_0x5889c6
  if (Module['preRun']) {
    if (typeof Module['preRun'] == _0x2be9e3(0x22c))
      Module['preRun'] = [Module[_0x2be9e3(0x39d)]]
    while (Module[_0x2be9e3(0x39d)][_0x2be9e3(0x308)]) {
      addOnPreRun(Module[_0x2be9e3(0x39d)][_0x2be9e3(0x224)]())
    }
  }
  ;(consumedModuleProp('preRun'), callRuntimeCallbacks(onPreRuns))
}
function initRuntime() {
  ;(assert(!runtimeInitialized),
    (runtimeInitialized = !![]),
    setStackLimits(),
    checkStackCookie(),
    wasmExports['__wasm_call_ctors']())
}
function postRun() {
  var _0x4498b2 = a0_0x5889c6
  checkStackCookie()
  if (Module[_0x4498b2(0x121)]) {
    if (typeof Module[_0x4498b2(0x121)] == 'function')
      Module[_0x4498b2(0x121)] = [Module[_0x4498b2(0x121)]]
    while (Module[_0x4498b2(0x121)][_0x4498b2(0x308)]) {
      addOnPostRun(Module[_0x4498b2(0x121)][_0x4498b2(0x224)]())
    }
  }
  ;(consumedModuleProp(_0x4498b2(0x121)), callRuntimeCallbacks(onPostRuns))
}
var runDependencies = 0x0,
  dependenciesFulfilled = null,
  runDependencyTracking = {},
  runDependencyWatcher = null
function addRunDependency(_0x17a938) {
  var _0x45f253 = a0_0x5889c6
  ;(runDependencies++,
    Module[_0x45f253(0x275)]?.(runDependencies),
    _0x17a938
      ? (assert(!runDependencyTracking[_0x17a938]),
        (runDependencyTracking[_0x17a938] = 0x1),
        runDependencyWatcher === null &&
          typeof setInterval != 'undefined' &&
          (runDependencyWatcher = setInterval(() => {
            var _0x1f43b0 = _0x45f253
            if (ABORT) {
              ;(clearInterval(runDependencyWatcher),
                (runDependencyWatcher = null))
              return
            }
            var _0x18f7c5 = ![]
            for (var _0x55b1b2 in runDependencyTracking) {
              ;(!_0x18f7c5 && ((_0x18f7c5 = !![]), err(_0x1f43b0(0x147))),
                err(_0x1f43b0(0x3d3) + _0x55b1b2))
            }
            _0x18f7c5 && err(_0x1f43b0(0x205))
          }, 0x2710)))
      : err(_0x45f253(0x33c)))
}
function removeRunDependency(_0x59b66f) {
  var _0x47c6cc = a0_0x5889c6
  ;(runDependencies--, Module[_0x47c6cc(0x275)]?.(runDependencies))
  _0x59b66f
    ? (assert(runDependencyTracking[_0x59b66f]),
      delete runDependencyTracking[_0x59b66f])
    : err(_0x47c6cc(0x119))
  if (runDependencies == 0x0) {
    runDependencyWatcher !== null &&
      (clearInterval(runDependencyWatcher), (runDependencyWatcher = null))
    if (dependenciesFulfilled) {
      var _0x5ba108 = dependenciesFulfilled
      ;((dependenciesFulfilled = null), _0x5ba108())
    }
  }
}
function abort(_0x5d2ed7) {
  var _0x5ad543 = a0_0x5889c6
  ;(Module[_0x5ad543(0x16b)]?.(_0x5d2ed7),
    (_0x5d2ed7 = _0x5ad543(0x161) + _0x5d2ed7 + ')'),
    err(_0x5d2ed7),
    (ABORT = !![]))
  var _0x3b81e8 = new WebAssembly[_0x5ad543(0x394)](_0x5d2ed7)
  throw _0x3b81e8
}
var FS = {
  error() {
    abort(
      'Filesystem\x20support\x20(FS)\x20was\x20not\x20included.\x20The\x20problem\x20is\x20that\x20you\x20are\x20using\x20files\x20from\x20JS,\x20but\x20files\x20were\x20not\x20used\x20from\x20C/C++,\x20so\x20filesystem\x20support\x20was\x20not\x20auto-included.\x20You\x20can\x20force-include\x20filesystem\x20support\x20with\x20-sFORCE_FILESYSTEM'
    )
  },
  init() {
    FS['error']()
  },
  createDataFile() {
    FS['error']()
  },
  createPreloadedFile() {
    FS['error']()
  },
  createLazyFile() {
    var _0x5426f4 = a0_0x5889c6
    FS[_0x5426f4(0x2b3)]()
  },
  open() {
    var _0x5b66b1 = a0_0x5889c6
    FS[_0x5b66b1(0x2b3)]()
  },
  mkdev() {
    var _0x278783 = a0_0x5889c6
    FS[_0x278783(0x2b3)]()
  },
  registerDevice() {
    var _0x500f3d = a0_0x5889c6
    FS[_0x500f3d(0x2b3)]()
  },
  analyzePath() {
    FS['error']()
  },
  ErrnoError() {
    FS['error']()
  },
}
function createExportWrapper(_0x23e01b, _0x324252) {
  return (..._0x26c613) => {
    var _0x3e2945 = a0_0x1c46
    assert(runtimeInitialized, _0x3e2945(0x133) + _0x23e01b + _0x3e2945(0x1d4))
    var _0x358ef1 = wasmExports[_0x23e01b]
    return (
      assert(
        _0x358ef1,
        'exported\x20native\x20function\x20`' + _0x23e01b + _0x3e2945(0x2e0)
      ),
      assert(
        _0x26c613[_0x3e2945(0x308)] <= _0x324252,
        _0x3e2945(0x133) +
          _0x23e01b +
          _0x3e2945(0x14b) +
          _0x26c613['length'] +
          _0x3e2945(0x171) +
          _0x324252
      ),
      _0x358ef1(..._0x26c613)
    )
  }
}
var wasmBinaryFile
function findWasmBinary() {
  var _0x2949e6 = a0_0x5889c6
  return locateFile(_0x2949e6(0x120))
}
function getBinarySync(_0x9af8a5) {
  var _0x50712f = a0_0x5889c6
  if (_0x9af8a5 == wasmBinaryFile && wasmBinary)
    return new Uint8Array(wasmBinary)
  if (readBinary) return readBinary(_0x9af8a5)
  throw _0x50712f(0x24d)
}
async function getWasmBinary(_0x4297ec) {
  if (!wasmBinary)
    try {
      var _0x45c480 = await readAsync(_0x4297ec)
      return new Uint8Array(_0x45c480)
    } catch {}
  return getBinarySync(_0x4297ec)
}
async function instantiateArrayBuffer(_0x57e23d, _0x59aa76) {
  var _0x4f7638 = a0_0x5889c6
  try {
    var _0xe8f12 = await getWasmBinary(_0x57e23d),
      _0x2e541b = await WebAssembly['instantiate'](_0xe8f12, _0x59aa76)
    return _0x2e541b
  } catch (_0x52e334) {
    ;(err(_0x4f7638(0x1a2) + _0x52e334),
      isFileURI(wasmBinaryFile) &&
        err(
          'warning:\x20Loading\x20from\x20a\x20file\x20URI\x20(' +
            wasmBinaryFile +
            _0x4f7638(0x220)
        ),
      abort(_0x52e334))
  }
}
async function instantiateAsync(_0x3dc55c, _0x9828f4, _0x10d30d) {
  var _0x58af59 = a0_0x5889c6
  if (
    !_0x3dc55c &&
    typeof WebAssembly['instantiateStreaming'] == _0x58af59(0x22c) &&
    !isFileURI(_0x9828f4) &&
    !ENVIRONMENT_IS_NODE
  )
    try {
      var _0x2cb697 = fetch(_0x9828f4, { credentials: _0x58af59(0x2b7) }),
        _0x25f60e = await WebAssembly[_0x58af59(0x33b)](_0x2cb697, _0x10d30d)
      return _0x25f60e
    } catch (_0x119314) {
      ;(err('wasm\x20streaming\x20compile\x20failed:\x20' + _0x119314),
        err(_0x58af59(0x1fd)))
    }
  return instantiateArrayBuffer(_0x9828f4, _0x10d30d)
}
function getWasmImports() {
  return { env: wasmImports, wasi_snapshot_preview1: wasmImports }
}
async function createWasm() {
  var _0x4ecea1 = a0_0x5889c6
  function _0xcac7c0(_0x46891d, _0x33aedb) {
    var _0x5e42ec = a0_0x1c46
    return (
      (wasmExports = _0x46891d['exports']),
      (wasmMemory = wasmExports[_0x5e42ec(0x247)]),
      (Module['wasmMemory'] = wasmMemory),
      assert(wasmMemory, _0x5e42ec(0x2de)),
      updateMemoryViews(),
      (wasmTable = wasmExports[_0x5e42ec(0x3af)]),
      assert(wasmTable, 'table\x20not\x20found\x20in\x20wasm\x20exports'),
      assignWasmExports(wasmExports),
      removeRunDependency(_0x5e42ec(0x13d)),
      wasmExports
    )
  }
  addRunDependency(_0x4ecea1(0x13d))
  var _0x5a2595 = Module
  function _0x195cf0(_0x37c35b) {
    var _0x2e4443 = _0x4ecea1
    return (
      assert(
        Module === _0x5a2595,
        'the\x20Module\x20object\x20should\x20not\x20be\x20replaced\x20during\x20async\x20compilation\x20-\x20perhaps\x20the\x20order\x20of\x20HTML\x20elements\x20is\x20wrong?'
      ),
      (_0x5a2595 = null),
      _0xcac7c0(_0x37c35b[_0x2e4443(0x179)])
    )
  }
  var _0x410641 = getWasmImports()
  if (Module[_0x4ecea1(0x19e)])
    return new Promise((_0x63accc, _0x4284af) => {
      var _0x1e1958 = _0x4ecea1
      try {
        Module[_0x1e1958(0x19e)](_0x410641, (_0x9295d2, _0x439499) => {
          _0x63accc(_0xcac7c0(_0x9295d2, _0x439499))
        })
      } catch (_0x1216bc) {
        ;(err(_0x1e1958(0x410) + _0x1216bc), _0x4284af(_0x1216bc))
      }
    })
  wasmBinaryFile ??= findWasmBinary()
  var _0x439d2d = await instantiateAsync(wasmBinary, wasmBinaryFile, _0x410641),
    _0x993673 = _0x195cf0(_0x439d2d)
  return _0x993673
}
class ExitStatus {
  [a0_0x5889c6(0x3da)] = a0_0x5889c6(0x2f8)
  constructor(_0x306a00) {
    var _0x18e3a1 = a0_0x5889c6
    ;((this['message'] = _0x18e3a1(0x177) + _0x306a00 + ')'),
      (this['status'] = _0x306a00))
  }
}
var callRuntimeCallbacks = (_0x570a0a) => {
    var _0x3f8a30 = a0_0x5889c6
    while (_0x570a0a[_0x3f8a30(0x308)] > 0x0) {
      _0x570a0a[_0x3f8a30(0x224)]()(Module)
    }
  },
  onPostRuns = [],
  addOnPostRun = (_0x4c6046) => onPostRuns[a0_0x5889c6(0x364)](_0x4c6046),
  onPreRuns = [],
  addOnPreRun = (_0x213a42) => onPreRuns[a0_0x5889c6(0x364)](_0x213a42)
function getValue(_0x56712c, _0x2cc85e = 'i8') {
  var _0x5703a5 = a0_0x5889c6
  if (_0x2cc85e[_0x5703a5(0x265)]('*')) _0x2cc85e = '*'
  switch (_0x2cc85e) {
    case 'i1':
      return HEAP8[_0x56712c]
    case 'i8':
      return HEAP8[_0x56712c]
    case _0x5703a5(0x3e2):
      return HEAP16[_0x56712c >> 0x1]
    case _0x5703a5(0x25e):
      return HEAP32[_0x56712c >> 0x2]
    case 'i64':
      return HEAP64[_0x56712c >> 0x3]
    case _0x5703a5(0x235):
      return HEAPF32[_0x56712c >> 0x2]
    case _0x5703a5(0x382):
      return HEAPF64[_0x56712c >> 0x3]
    case '*':
      return HEAPU32[_0x56712c >> 0x2]
    default:
      abort(_0x5703a5(0x406) + _0x2cc85e)
  }
}
var noExitRuntime = !![],
  ptrToString = (_0xce7584) => {
    var _0x3714c9 = a0_0x5889c6
    return (
      assert(typeof _0xce7584 === _0x3714c9(0x236)),
      (_0xce7584 >>>= 0x0),
      '0x' + _0xce7584[_0x3714c9(0x2eb)](0x10)[_0x3714c9(0x3aa)](0x8, '0')
    )
  },
  setStackLimits = () => {
    var _0x1413a2 = _emscripten_stack_get_base(),
      _0x4fdaf9 = _emscripten_stack_get_end()
    ___set_stack_limits(_0x1413a2, _0x4fdaf9)
  }
function setValue(_0x514970, _0x2bb11d, _0xa7dbf7 = 'i8') {
  var _0xf84282 = a0_0x5889c6
  if (_0xa7dbf7[_0xf84282(0x265)]('*')) _0xa7dbf7 = '*'
  switch (_0xa7dbf7) {
    case 'i1':
      ;((HEAP8[_0x514970] = _0x2bb11d), checkInt8(_0x2bb11d))
      break
    case 'i8':
      ;((HEAP8[_0x514970] = _0x2bb11d), checkInt8(_0x2bb11d))
      break
    case _0xf84282(0x3e2):
      ;((HEAP16[_0x514970 >> 0x1] = _0x2bb11d), checkInt16(_0x2bb11d))
      break
    case _0xf84282(0x25e):
      ;((HEAP32[_0x514970 >> 0x2] = _0x2bb11d), checkInt32(_0x2bb11d))
      break
    case _0xf84282(0x350):
      ;((HEAP64[_0x514970 >> 0x3] = BigInt(_0x2bb11d)), checkInt64(_0x2bb11d))
      break
    case _0xf84282(0x235):
      HEAPF32[_0x514970 >> 0x2] = _0x2bb11d
      break
    case _0xf84282(0x382):
      HEAPF64[_0x514970 >> 0x3] = _0x2bb11d
      break
    case '*':
      HEAPU32[_0x514970 >> 0x2] = _0x2bb11d
      break
    default:
      abort(_0xf84282(0x321) + _0xa7dbf7)
  }
}
var stackRestore = (_0x222e81) => __emscripten_stack_restore(_0x222e81),
  stackSave = () => _emscripten_stack_get_current(),
  warnOnce = (_0x2684f6) => {
    var _0x4c1a05 = a0_0x5889c6
    warnOnce[_0x4c1a05(0x166)] ||= {}
    if (!warnOnce[_0x4c1a05(0x166)][_0x2684f6]) {
      warnOnce['shown'][_0x2684f6] = 0x1
      if (ENVIRONMENT_IS_NODE) _0x2684f6 = _0x4c1a05(0x238) + _0x2684f6
      err(_0x2684f6)
    }
  }
class ExceptionInfo {
  constructor(_0x48cad0) {
    var _0x457fa8 = a0_0x5889c6
    ;((this[_0x457fa8(0x1ce)] = _0x48cad0),
      (this[_0x457fa8(0x3b5)] = _0x48cad0 - 0x18))
  }
  [a0_0x5889c6(0x341)](_0x2abc9c) {
    var _0x313c91 = a0_0x5889c6
    HEAPU32[(this[_0x313c91(0x3b5)] + 0x4) >> 0x2] = _0x2abc9c
  }
  ['get_type']() {
    var _0x9fe807 = a0_0x5889c6
    return HEAPU32[(this[_0x9fe807(0x3b5)] + 0x4) >> 0x2]
  }
  [a0_0x5889c6(0x40f)](_0x142a75) {
    var _0x2710e1 = a0_0x5889c6
    HEAPU32[(this[_0x2710e1(0x3b5)] + 0x8) >> 0x2] = _0x142a75
  }
  ['get_destructor']() {
    var _0x15e6cc = a0_0x5889c6
    return HEAPU32[(this[_0x15e6cc(0x3b5)] + 0x8) >> 0x2]
  }
  ['set_caught'](_0x2ff165) {
    var _0x4ec5c1 = a0_0x5889c6
    ;((_0x2ff165 = _0x2ff165 ? 0x1 : 0x0),
      (HEAP8[this[_0x4ec5c1(0x3b5)] + 0xc] = _0x2ff165),
      checkInt8(_0x2ff165))
  }
  ['get_caught']() {
    var _0x1bf50d = a0_0x5889c6
    return HEAP8[this[_0x1bf50d(0x3b5)] + 0xc] != 0x0
  }
  [a0_0x5889c6(0x34a)](_0x19eb11) {
    ;((_0x19eb11 = _0x19eb11 ? 0x1 : 0x0),
      (HEAP8[this['ptr'] + 0xd] = _0x19eb11),
      checkInt8(_0x19eb11))
  }
  [a0_0x5889c6(0x255)]() {
    return HEAP8[this['ptr'] + 0xd] != 0x0
  }
  [a0_0x5889c6(0x40a)](_0x4f11bc, _0xab01b1) {
    var _0x29597e = a0_0x5889c6
    ;(this[_0x29597e(0x2a2)](0x0),
      this[_0x29597e(0x341)](_0x4f11bc),
      this[_0x29597e(0x40f)](_0xab01b1))
  }
  [a0_0x5889c6(0x2a2)](_0x349a69) {
    var _0x5c6098 = a0_0x5889c6
    HEAPU32[(this[_0x5c6098(0x3b5)] + 0x10) >> 0x2] = _0x349a69
  }
  ['get_adjusted_ptr']() {
    var _0x24181a = a0_0x5889c6
    return HEAPU32[(this[_0x24181a(0x3b5)] + 0x10) >> 0x2]
  }
}
var exceptionLast = 0x0,
  uncaughtExceptionCount = 0x0,
  ___cxa_throw = (_0x191cd8, _0x195878, _0x3a6ecc) => {
    var _0x46b37d = a0_0x5889c6,
      _0x4bb0ac = new ExceptionInfo(_0x191cd8)
    ;(_0x4bb0ac[_0x46b37d(0x40a)](_0x195878, _0x3a6ecc),
      (exceptionLast = _0x191cd8),
      uncaughtExceptionCount++,
      assert(![], _0x46b37d(0x17c)))
  },
  ___handle_stack_overflow = (_0x57094e) => {
    var _0x33aeb7 = a0_0x5889c6,
      _0x4839ef = _emscripten_stack_get_base(),
      _0x3422d6 = _emscripten_stack_get_end()
    abort(
      _0x33aeb7(0x3d7) +
        ptrToString(_0x57094e) +
        (_0x33aeb7(0x2fb) +
          ptrToString(_0x3422d6) +
          _0x33aeb7(0x3a8) +
          ptrToString(_0x4839ef)) +
        _0x33aeb7(0x1d7)
    )
  },
  UTF8Decoder =
    typeof TextDecoder != 'undefined' ? new TextDecoder() : undefined,
  findStringEnd = (_0x3cb7af, _0x5d9ec2, _0x407d4b, _0x3e3160) => {
    var _0x2b839c = _0x5d9ec2 + _0x407d4b
    if (_0x3e3160) return _0x2b839c
    while (_0x3cb7af[_0x5d9ec2] && !(_0x5d9ec2 >= _0x2b839c)) ++_0x5d9ec2
    return _0x5d9ec2
  },
  UTF8ArrayToString = (_0x594c58, _0x2f0ccb = 0x0, _0x4b6e1c, _0x47dfa8) => {
    var _0x12313c = a0_0x5889c6,
      _0x2c8b73 = findStringEnd(_0x594c58, _0x2f0ccb, _0x4b6e1c, _0x47dfa8)
    if (
      _0x2c8b73 - _0x2f0ccb > 0x10 &&
      _0x594c58[_0x12313c(0x243)] &&
      UTF8Decoder
    )
      return UTF8Decoder['decode'](
        _0x594c58[_0x12313c(0x320)](_0x2f0ccb, _0x2c8b73)
      )
    var _0x1605e4 = ''
    while (_0x2f0ccb < _0x2c8b73) {
      var _0x4d586d = _0x594c58[_0x2f0ccb++]
      if (!(_0x4d586d & 0x80)) {
        _0x1605e4 += String[_0x12313c(0x266)](_0x4d586d)
        continue
      }
      var _0x5c73de = _0x594c58[_0x2f0ccb++] & 0x3f
      if ((_0x4d586d & 0xe0) == 0xc0) {
        _0x1605e4 += String[_0x12313c(0x266)](
          ((_0x4d586d & 0x1f) << 0x6) | _0x5c73de
        )
        continue
      }
      var _0x2c62a6 = _0x594c58[_0x2f0ccb++] & 0x3f
      if ((_0x4d586d & 0xf0) == 0xe0)
        _0x4d586d = ((_0x4d586d & 0xf) << 0xc) | (_0x5c73de << 0x6) | _0x2c62a6
      else {
        if ((_0x4d586d & 0xf8) != 0xf0)
          warnOnce(_0x12313c(0x3c9) + ptrToString(_0x4d586d) + _0x12313c(0x180))
        _0x4d586d =
          ((_0x4d586d & 0x7) << 0x12) |
          (_0x5c73de << 0xc) |
          (_0x2c62a6 << 0x6) |
          (_0x594c58[_0x2f0ccb++] & 0x3f)
      }
      if (_0x4d586d < 0x10000) _0x1605e4 += String[_0x12313c(0x266)](_0x4d586d)
      else {
        var _0x423966 = _0x4d586d - 0x10000
        _0x1605e4 += String[_0x12313c(0x266)](
          0xd800 | (_0x423966 >> 0xa),
          0xdc00 | (_0x423966 & 0x3ff)
        )
      }
    }
    return _0x1605e4
  },
  UTF8ToString = (_0x15bee3, _0x57b1cd, _0x840662) => {
    var _0x273ee0 = a0_0x5889c6
    return (
      assert(
        typeof _0x15bee3 == _0x273ee0(0x236),
        _0x273ee0(0x2f7) + typeof _0x15bee3 + ')'
      ),
      _0x15bee3
        ? UTF8ArrayToString(HEAPU8, _0x15bee3, _0x57b1cd, _0x840662)
        : ''
    )
  },
  SYSCALLS = {
    varargs: undefined,
    getStr(_0x283337) {
      var _0x5df414 = UTF8ToString(_0x283337)
      return _0x5df414
    },
  },
  ___syscall_faccessat = (_0x1ffa7a, _0x5031ae, _0x53212a, _0x592eef) => {
    var _0x74c7a9 = a0_0x5889c6
    abort(_0x74c7a9(0x277))
  }
function ___syscall_fcntl64(_0x5b9ddf, _0x33e681, _0x4ecbdb) {
  return ((SYSCALLS['varargs'] = _0x4ecbdb), 0x0)
}
var ___syscall_fstat64 = (_0x1a85d7, _0x596e04) => {
    var _0x2e29be = a0_0x5889c6
    abort(_0x2e29be(0x277))
  },
  ___syscall_getcwd = (_0x28d24b, _0x1bec33) => {
    var _0x551e3b = a0_0x5889c6
    abort(_0x551e3b(0x277))
  },
  ___syscall_getdents64 = (_0x28d912, _0x27e162, _0x10977a) => {
    var _0x2292a1 = a0_0x5889c6
    abort(_0x2292a1(0x277))
  }
function ___syscall_ioctl(_0x4efae8, _0x2325ab, _0x4ff342) {
  var _0x3c4959 = a0_0x5889c6
  return ((SYSCALLS[_0x3c4959(0x3c4)] = _0x4ff342), 0x0)
}
var ___syscall_lstat64 = (_0x4fcfe2, _0x32c5d0) => {
    var _0x3549c6 = a0_0x5889c6
    abort(_0x3549c6(0x277))
  },
  ___syscall_mkdirat = (_0x55ed87, _0x28bada, _0xe56e9) => {
    var _0x1bbeea = a0_0x5889c6
    abort(_0x1bbeea(0x277))
  },
  ___syscall_newfstatat = (_0x3eb5bc, _0x431f2c, _0x2784f1, _0x3ce20f) => {
    var _0x18a767 = a0_0x5889c6
    abort(_0x18a767(0x277))
  }
function ___syscall_openat(_0x38857e, _0x4572bb, _0x36c166, _0x5362f8) {
  ;((SYSCALLS['varargs'] = _0x5362f8),
    abort(
      'it\x20should\x20not\x20be\x20possible\x20to\x20operate\x20on\x20streams\x20when\x20!SYSCALLS_REQUIRE_FILESYSTEM'
    ))
}
var ___syscall_readlinkat = (_0x12d7b8, _0x494f1b, _0x1fac1b, _0x4fcb9e) => {
    abort(
      'it\x20should\x20not\x20be\x20possible\x20to\x20operate\x20on\x20streams\x20when\x20!SYSCALLS_REQUIRE_FILESYSTEM'
    )
  },
  ___syscall_rmdir = (_0x2249fe) => {
    var _0x3018f6 = a0_0x5889c6
    abort(_0x3018f6(0x277))
  },
  ___syscall_stat64 = (_0x9849aa, _0x2c7b21) => {
    var _0x35a049 = a0_0x5889c6
    abort(_0x35a049(0x277))
  },
  ___syscall_unlinkat = (_0x46c02f, _0x39f0dc, _0x5396f1) => {
    abort(
      'it\x20should\x20not\x20be\x20possible\x20to\x20operate\x20on\x20streams\x20when\x20!SYSCALLS_REQUIRE_FILESYSTEM'
    )
  },
  __abort_js = () => abort('native\x20code\x20called\x20abort()'),
  structRegistrations = {},
  runDestructors = (_0x1af9f6) => {
    var _0x4188bd = a0_0x5889c6
    while (_0x1af9f6[_0x4188bd(0x308)]) {
      var _0x4a013c = _0x1af9f6[_0x4188bd(0x135)](),
        _0x40f98a = _0x1af9f6[_0x4188bd(0x135)]()
      _0x40f98a(_0x4a013c)
    }
  }
function readPointer(_0x463281) {
  var _0x5827ab = a0_0x5889c6
  return this[_0x5827ab(0x17b)](HEAPU32[_0x463281 >> 0x2])
}
var awaitingDependencies = {},
  registeredTypes = {},
  typeDependencies = {},
  InternalError = class InternalError extends Error {
    constructor(_0x2b86e8) {
      var _0x1f5e39 = a0_0x5889c6
      ;(super(_0x2b86e8), (this['name'] = _0x1f5e39(0x369)))
    }
  },
  throwInternalError = (_0x190d90) => {
    throw new InternalError(_0x190d90)
  },
  whenDependentTypesAreResolved = (_0xa9fc8d, _0x95c3fc, _0x52a6f4) => {
    var _0x22231b = a0_0x5889c6
    _0xa9fc8d[_0x22231b(0x3fc)](
      (_0x580f3c) => (typeDependencies[_0x580f3c] = _0x95c3fc)
    )
    function _0x566df0(_0x634af2) {
      var _0x567610 = _0x22231b,
        _0x135ee7 = _0x52a6f4(_0x634af2)
      _0x135ee7[_0x567610(0x308)] !== _0xa9fc8d[_0x567610(0x308)] &&
        throwInternalError(_0x567610(0x384))
      for (
        var _0x32d3ae = 0x0;
        _0x32d3ae < _0xa9fc8d[_0x567610(0x308)];
        ++_0x32d3ae
      ) {
        registerType(_0xa9fc8d[_0x32d3ae], _0x135ee7[_0x32d3ae])
      }
    }
    var _0x573c22 = new Array(_0x95c3fc[_0x22231b(0x308)]),
      _0x5cd5ef = [],
      _0x59862e = 0x0
    ;(_0x95c3fc[_0x22231b(0x3fc)]((_0x7b2226, _0x12ac1e) => {
      var _0x51339b = _0x22231b
      registeredTypes[_0x51339b(0x416)](_0x7b2226)
        ? (_0x573c22[_0x12ac1e] = registeredTypes[_0x7b2226])
        : (_0x5cd5ef[_0x51339b(0x364)](_0x7b2226),
          !awaitingDependencies[_0x51339b(0x416)](_0x7b2226) &&
            (awaitingDependencies[_0x7b2226] = []),
          awaitingDependencies[_0x7b2226][_0x51339b(0x364)](() => {
            var _0x3e7408 = _0x51339b
            ;((_0x573c22[_0x12ac1e] = registeredTypes[_0x7b2226]),
              ++_0x59862e,
              _0x59862e === _0x5cd5ef[_0x3e7408(0x308)] && _0x566df0(_0x573c22))
          }))
    }),
      0x0 === _0x5cd5ef[_0x22231b(0x308)] && _0x566df0(_0x573c22))
  },
  __embind_finalize_value_object = (_0xb7ca21) => {
    var _0x38bc95 = a0_0x5889c6,
      _0x2f4897 = structRegistrations[_0xb7ca21]
    delete structRegistrations[_0xb7ca21]
    var _0x2da785 = _0x2f4897[_0x38bc95(0x145)],
      _0xfd716 = _0x2f4897[_0x38bc95(0x245)],
      _0x47d468 = _0x2f4897['fields'],
      _0x2b85ea = _0x47d468[_0x38bc95(0x268)](
        (_0x5be3eb) => _0x5be3eb[_0x38bc95(0x3d6)]
      )[_0x38bc95(0x172)](
        _0x47d468['map']((_0x8b4376) => _0x8b4376[_0x38bc95(0x1f4)])
      )
    whenDependentTypesAreResolved([_0xb7ca21], _0x2b85ea, (_0x5292a4) => {
      var _0x2139c8 = _0x38bc95,
        _0x3c4319 = {}
      return (
        _0x47d468[_0x2139c8(0x3fc)]((_0x127b1d, _0x27ffe5) => {
          var _0x37e219 = _0x2139c8,
            _0x398622 = _0x127b1d[_0x37e219(0x33f)],
            _0xa8c239 = _0x5292a4[_0x27ffe5],
            _0x19ada7 = _0x5292a4[_0x27ffe5][_0x37e219(0x3d1)],
            _0x55b9a9 = _0x127b1d['getter'],
            _0x484dbc = _0x127b1d[_0x37e219(0x2f0)],
            _0x133a75 = _0x5292a4[_0x27ffe5 + _0x47d468[_0x37e219(0x308)]],
            _0x30f059 = _0x127b1d[_0x37e219(0x1d6)],
            _0x4464c2 = _0x127b1d[_0x37e219(0x30a)]
          _0x3c4319[_0x398622] = {
            read: (_0x28573d) =>
              _0xa8c239[_0x37e219(0x17b)](_0x55b9a9(_0x484dbc, _0x28573d)),
            write: (_0x86b75f, _0x179f58) => {
              var _0x527c5c = _0x37e219,
                _0x27ddeb = []
              ;(_0x30f059(
                _0x4464c2,
                _0x86b75f,
                _0x133a75[_0x527c5c(0x21d)](_0x27ddeb, _0x179f58)
              ),
                runDestructors(_0x27ddeb))
            },
            optional: _0x19ada7,
          }
        }),
        [
          {
            name: _0x2f4897[_0x2139c8(0x3da)],
            fromWireType: (_0x1f6b66) => {
              var _0x17f1ad = _0x2139c8,
                _0x2829e2 = {}
              for (var _0x2e8f71 in _0x3c4319) {
                _0x2829e2[_0x2e8f71] =
                  _0x3c4319[_0x2e8f71][_0x17f1ad(0x1ab)](_0x1f6b66)
              }
              return (_0xfd716(_0x1f6b66), _0x2829e2)
            },
            toWireType: (_0x2f2a0b, _0x3f3263) => {
              var _0x3a0e7a = _0x2139c8
              for (var _0x487a89 in _0x3c4319) {
                if (
                  !(_0x487a89 in _0x3f3263) &&
                  !_0x3c4319[_0x487a89][_0x3a0e7a(0x3d1)]
                )
                  throw new TypeError(_0x3a0e7a(0x142) + _0x487a89 + '\x22')
              }
              var _0x82c5fa = _0x2da785()
              for (_0x487a89 in _0x3c4319) {
                _0x3c4319[_0x487a89][_0x3a0e7a(0x124)](
                  _0x82c5fa,
                  _0x3f3263[_0x487a89]
                )
              }
              return (
                _0x2f2a0b !== null &&
                  _0x2f2a0b[_0x3a0e7a(0x364)](_0xfd716, _0x82c5fa),
                _0x82c5fa
              )
            },
            readValueFromPointer: readPointer,
            destructorFunction: _0xfd716,
          },
        ]
      )
    })
  },
  AsciiToString = (_0x42d85d) => {
    var _0xbc572c = a0_0x5889c6,
      _0x151adc = ''
    while (0x1) {
      var _0x29a2e6 = HEAPU8[_0x42d85d++]
      if (!_0x29a2e6) return _0x151adc
      _0x151adc += String[_0xbc572c(0x266)](_0x29a2e6)
    }
  },
  BindingError = class BindingError extends Error {
    constructor(_0xee129f) {
      var _0x38cdf7 = a0_0x5889c6
      ;(super(_0xee129f), (this[_0x38cdf7(0x3da)] = _0x38cdf7(0x22e)))
    }
  },
  throwBindingError = (_0x18a187) => {
    throw new BindingError(_0x18a187)
  }
function sharedRegisterType(_0x3f914a, _0x66f537, _0x24b575 = {}) {
  var _0x1107b3 = a0_0x5889c6,
    _0x3fd5d6 = _0x66f537[_0x1107b3(0x3da)]
  !_0x3f914a &&
    throwBindingError(
      'type\x20\x22' +
        _0x3fd5d6 +
        '\x22\x20must\x20have\x20a\x20positive\x20integer\x20typeid\x20pointer'
    )
  if (registeredTypes[_0x1107b3(0x416)](_0x3f914a)) {
    if (_0x24b575[_0x1107b3(0x2c7)]) return
    else throwBindingError(_0x1107b3(0x3a3) + _0x3fd5d6 + _0x1107b3(0x303))
  }
  ;((registeredTypes[_0x3f914a] = _0x66f537),
    delete typeDependencies[_0x3f914a])
  if (awaitingDependencies['hasOwnProperty'](_0x3f914a)) {
    var _0x28bea3 = awaitingDependencies[_0x3f914a]
    ;(delete awaitingDependencies[_0x3f914a],
      _0x28bea3[_0x1107b3(0x3fc)]((_0x3e0594) => _0x3e0594()))
  }
}
function registerType(_0xbe8006, _0x322fe2, _0x1c59c8 = {}) {
  return sharedRegisterType(_0xbe8006, _0x322fe2, _0x1c59c8)
}
var integerReadValueFromPointer = (_0xcae580, _0x47a71c, _0x25d62a) => {
    var _0xbecdae = a0_0x5889c6
    switch (_0x47a71c) {
      case 0x1:
        return _0x25d62a
          ? (_0x10fd3e) => HEAP8[_0x10fd3e]
          : (_0x15d82f) => HEAPU8[_0x15d82f]
      case 0x2:
        return _0x25d62a
          ? (_0xdd6672) => HEAP16[_0xdd6672 >> 0x1]
          : (_0x36aef0) => HEAPU16[_0x36aef0 >> 0x1]
      case 0x4:
        return _0x25d62a
          ? (_0x17fc0e) => HEAP32[_0x17fc0e >> 0x2]
          : (_0x4a44da) => HEAPU32[_0x4a44da >> 0x2]
      case 0x8:
        return _0x25d62a
          ? (_0x1fe675) => HEAP64[_0x1fe675 >> 0x3]
          : (_0x178190) => HEAPU64[_0x178190 >> 0x3]
      default:
        throw new TypeError(
          _0xbecdae(0x23c) + _0x47a71c + _0xbecdae(0x3b4) + _0xcae580
        )
    }
  },
  embindRepr = (_0x5b4230) => {
    var _0x41788c = a0_0x5889c6
    if (_0x5b4230 === null) return _0x41788c(0x311)
    var _0x24187d = typeof _0x5b4230
    return _0x24187d === _0x41788c(0x2c3) ||
      _0x24187d === _0x41788c(0x11b) ||
      _0x24187d === 'function'
      ? _0x5b4230['toString']()
      : '' + _0x5b4230
  },
  assertIntegerRange = (_0x125f8f, _0x50edff, _0x349425, _0x4ae51a) => {
    var _0x4b1460 = a0_0x5889c6
    if (_0x50edff < _0x349425 || _0x50edff > _0x4ae51a)
      throw new TypeError(
        _0x4b1460(0x1a5) +
          embindRepr(_0x50edff) +
          _0x4b1460(0x1bf) +
          _0x125f8f +
          _0x4b1460(0x2a6) +
          _0x349425 +
          ',\x20' +
          _0x4ae51a +
          ']!'
      )
  },
  __embind_register_bigint = (
    _0x2e39cc,
    _0x41152b,
    _0x4a3d9d,
    _0x159283,
    _0x39bd51
  ) => {
    var _0x50f219 = a0_0x5889c6
    _0x41152b = AsciiToString(_0x41152b)
    const _0x5c596e = _0x159283 === 0x0n
    let _0x2f6b86 = (_0x1e7e2b) => _0x1e7e2b
    if (_0x5c596e) {
      const _0xd9e656 = _0x4a3d9d * 0x8
      ;((_0x2f6b86 = (_0x565f53) =>
        BigInt[_0x50f219(0x3ee)](_0xd9e656, _0x565f53)),
        (_0x39bd51 = _0x2f6b86(_0x39bd51)))
    }
    registerType(_0x2e39cc, {
      name: _0x41152b,
      fromWireType: _0x2f6b86,
      toWireType: (_0x24f704, _0x360cd0) => {
        var _0x3a72a7 = _0x50f219
        if (typeof _0x360cd0 == _0x3a72a7(0x236)) _0x360cd0 = BigInt(_0x360cd0)
        else {
          if (typeof _0x360cd0 != _0x3a72a7(0x38d))
            throw new TypeError(
              _0x3a72a7(0x31a) +
                embindRepr(_0x360cd0) +
                _0x3a72a7(0x2b1) +
                this['name']
            )
        }
        return (
          assertIntegerRange(_0x41152b, _0x360cd0, _0x159283, _0x39bd51),
          _0x360cd0
        )
      },
      readValueFromPointer: integerReadValueFromPointer(
        _0x41152b,
        _0x4a3d9d,
        !_0x5c596e
      ),
      destructorFunction: null,
    })
  },
  __embind_register_bool = (_0x5b2cad, _0x36a0df, _0x5dc04d, _0x5c3638) => {
    ;((_0x36a0df = AsciiToString(_0x36a0df)),
      registerType(_0x5b2cad, {
        name: _0x36a0df,
        fromWireType: function (_0xd20d8c) {
          return !!_0xd20d8c
        },
        toWireType: function (_0x2665b8, _0x4eb9c5) {
          return _0x4eb9c5 ? _0x5dc04d : _0x5c3638
        },
        readValueFromPointer: function (_0x555e52) {
          return this['fromWireType'](HEAPU8[_0x555e52])
        },
        destructorFunction: null,
      }))
  },
  shallowCopyInternalPointer = (_0x540656) => ({
    count: _0x540656[a0_0x5889c6(0x138)],
    deleteScheduled: _0x540656[a0_0x5889c6(0x359)],
    preservePointerOnDelete: _0x540656[a0_0x5889c6(0x2af)],
    ptr: _0x540656[a0_0x5889c6(0x3b5)],
    ptrType: _0x540656['ptrType'],
    smartPtr: _0x540656[a0_0x5889c6(0x354)],
    smartPtrType: _0x540656[a0_0x5889c6(0x41a)],
  }),
  throwInstanceAlreadyDeleted = (_0x122d92) => {
    var _0x29570d = a0_0x5889c6
    function _0x171945(_0x493dfd) {
      var _0x11253d = a0_0x1c46
      return _0x493dfd['$$']['ptrType']['registeredClass'][_0x11253d(0x3da)]
    }
    throwBindingError(_0x171945(_0x122d92) + _0x29570d(0x24b))
  },
  finalizationRegistry = ![],
  detachFinalizer = (_0x9dd02e) => {},
  runDestructor = (_0x2a1d2a) => {
    var _0x187eda = a0_0x5889c6
    _0x2a1d2a[_0x187eda(0x354)]
      ? _0x2a1d2a[_0x187eda(0x41a)][_0x187eda(0x245)](
          _0x2a1d2a[_0x187eda(0x354)]
        )
      : _0x2a1d2a['ptrType'][_0x187eda(0x370)][_0x187eda(0x245)](
          _0x2a1d2a['ptr']
        )
  },
  releaseClassHandle = (_0x5bbddf) => {
    var _0x11837b = a0_0x5889c6
    _0x5bbddf[_0x11837b(0x138)][_0x11837b(0x2f5)] -= 0x1
    var _0x1184b0 = 0x0 === _0x5bbddf[_0x11837b(0x138)][_0x11837b(0x2f5)]
    _0x1184b0 && runDestructor(_0x5bbddf)
  },
  downcastPointer = (_0x1ce7eb, _0x4c2547, _0x3e1700) => {
    var _0xc7cb20 = a0_0x5889c6
    if (_0x4c2547 === _0x3e1700) return _0x1ce7eb
    if (undefined === _0x3e1700[_0xc7cb20(0x2e5)]) return null
    var _0x26e54e = downcastPointer(
      _0x1ce7eb,
      _0x4c2547,
      _0x3e1700[_0xc7cb20(0x2e5)]
    )
    if (_0x26e54e === null) return null
    return _0x3e1700[_0xc7cb20(0x14a)](_0x26e54e)
  },
  registeredPointers = {},
  registeredInstances = {},
  getBasestPointer = (_0x3db35d, _0x5efc18) => {
    var _0x592912 = a0_0x5889c6
    _0x5efc18 === undefined && throwBindingError(_0x592912(0x319))
    while (_0x3db35d[_0x592912(0x2e5)]) {
      ;((_0x5efc18 = _0x3db35d[_0x592912(0x2a4)](_0x5efc18)),
        (_0x3db35d = _0x3db35d[_0x592912(0x2e5)]))
    }
    return _0x5efc18
  },
  getInheritedInstance = (_0xfe883b, _0x4ad8bd) => {
    return (
      (_0x4ad8bd = getBasestPointer(_0xfe883b, _0x4ad8bd)),
      registeredInstances[_0x4ad8bd]
    )
  },
  makeClassHandle = (_0x1c4df4, _0x3e3764) => {
    var _0x2c529e = a0_0x5889c6
    ;(!_0x3e3764[_0x2c529e(0x2b8)] || !_0x3e3764['ptr']) &&
      throwInternalError(_0x2c529e(0x1a1))
    var _0x580e1a = !!_0x3e3764[_0x2c529e(0x41a)],
      _0x2b1115 = !!_0x3e3764[_0x2c529e(0x354)]
    return (
      _0x580e1a !== _0x2b1115 && throwInternalError(_0x2c529e(0x1f8)),
      (_0x3e3764[_0x2c529e(0x138)] = { value: 0x1 }),
      attachFinalizer(
        Object[_0x2c529e(0x218)](_0x1c4df4, {
          $$: { value: _0x3e3764, writable: !![] },
        })
      )
    )
  }
function RegisteredPointer_fromWireType(_0xcc1abe) {
  var _0x2226fa = a0_0x5889c6,
    _0x5e0db3 = this[_0x2226fa(0x1c2)](_0xcc1abe)
  if (!_0x5e0db3) return (this[_0x2226fa(0x1b3)](_0xcc1abe), null)
  var _0x24a3cb = getInheritedInstance(this['registeredClass'], _0x5e0db3)
  if (undefined !== _0x24a3cb) {
    if (0x0 === _0x24a3cb['$$'][_0x2226fa(0x138)]['value'])
      return (
        (_0x24a3cb['$$'][_0x2226fa(0x3b5)] = _0x5e0db3),
        (_0x24a3cb['$$'][_0x2226fa(0x354)] = _0xcc1abe),
        _0x24a3cb[_0x2226fa(0x3b7)]()
      )
    else {
      var _0x108841 = _0x24a3cb[_0x2226fa(0x3b7)]()
      return (this[_0x2226fa(0x1b3)](_0xcc1abe), _0x108841)
    }
  }
  function _0x38ded7() {
    var _0x388305 = _0x2226fa
    return this[_0x388305(0x272)]
      ? makeClassHandle(this[_0x388305(0x370)][_0x388305(0x12c)], {
          ptrType: this['pointeeType'],
          ptr: _0x5e0db3,
          smartPtrType: this,
          smartPtr: _0xcc1abe,
        })
      : makeClassHandle(this[_0x388305(0x370)][_0x388305(0x12c)], {
          ptrType: this,
          ptr: _0xcc1abe,
        })
  }
  var _0x214ce6 = this[_0x2226fa(0x370)][_0x2226fa(0x284)](_0x5e0db3),
    _0x27baaa = registeredPointers[_0x214ce6]
  if (!_0x27baaa) return _0x38ded7[_0x2226fa(0x18c)](this)
  var _0x2a3546
  this['isConst']
    ? (_0x2a3546 = _0x27baaa['constPointerType'])
    : (_0x2a3546 = _0x27baaa[_0x2226fa(0x3d2)])
  var _0x125762 = downcastPointer(
    _0x5e0db3,
    this[_0x2226fa(0x370)],
    _0x2a3546[_0x2226fa(0x370)]
  )
  if (_0x125762 === null) return _0x38ded7['call'](this)
  return this[_0x2226fa(0x272)]
    ? makeClassHandle(_0x2a3546[_0x2226fa(0x370)][_0x2226fa(0x12c)], {
        ptrType: _0x2a3546,
        ptr: _0x125762,
        smartPtrType: this,
        smartPtr: _0xcc1abe,
      })
    : makeClassHandle(_0x2a3546[_0x2226fa(0x370)][_0x2226fa(0x12c)], {
        ptrType: _0x2a3546,
        ptr: _0x125762,
      })
}
var attachFinalizer = (_0x46effc) => {
    var _0x4f7ef1 = a0_0x5889c6
    if (_0x4f7ef1(0x343) === typeof FinalizationRegistry)
      return ((attachFinalizer = (_0x22d70d) => _0x22d70d), _0x46effc)
    return (
      (finalizationRegistry = new FinalizationRegistry((_0xca26f7) => {
        var _0x3d0212 = _0x4f7ef1
        ;(console['warn'](_0xca26f7[_0x3d0212(0x2bb)]),
          releaseClassHandle(_0xca26f7['$$']))
      })),
      (attachFinalizer = (_0x39273a) => {
        var _0x31f610 = _0x4f7ef1,
          _0x41e1e8 = _0x39273a['$$'],
          _0x4fa0ee = !!_0x41e1e8[_0x31f610(0x354)]
        if (_0x4fa0ee) {
          var _0x1073cb = { $$: _0x41e1e8 },
            _0x5091b9 = _0x41e1e8['ptrType'][_0x31f610(0x370)],
            _0x266939 = new Error(
              _0x31f610(0x11c) +
                _0x5091b9['name'] +
                '\x20<' +
                ptrToString(_0x41e1e8[_0x31f610(0x3b5)]) +
                _0x31f610(0x126) +
                _0x31f610(0x399) +
                _0x31f610(0x2d6) +
                'Originally\x20allocated'
            )
          ;(_0x31f610(0x21c) in Error &&
            Error['captureStackTrace'](
              _0x266939,
              RegisteredPointer_fromWireType
            ),
            (_0x1073cb['leakWarning'] = _0x266939['stack'][_0x31f610(0x3e6)](
              /^Error: /,
              ''
            )),
            finalizationRegistry[_0x31f610(0x1d9)](
              _0x39273a,
              _0x1073cb,
              _0x39273a
            ))
        }
        return _0x39273a
      }),
      (detachFinalizer = (_0x41d739) =>
        finalizationRegistry[_0x4f7ef1(0x29d)](_0x41d739)),
      attachFinalizer(_0x46effc)
    )
  },
  deletionQueue = [],
  flushPendingDeletes = () => {
    var _0x225af6 = a0_0x5889c6
    while (deletionQueue['length']) {
      var _0x2d21ce = deletionQueue[_0x225af6(0x135)]()
      ;((_0x2d21ce['$$']['deleteScheduled'] = ![]),
        _0x2d21ce[_0x225af6(0x373)]())
    }
  },
  delayFunction,
  init_ClassHandle = () => {
    var _0x453121 = a0_0x5889c6
    let _0x1247ee = ClassHandle[_0x453121(0x276)]
    Object[_0x453121(0x22b)](_0x1247ee, {
      isAliasOf(_0x437013) {
        var _0x5ebb16 = _0x453121
        if (!(this instanceof ClassHandle)) return ![]
        if (!(_0x437013 instanceof ClassHandle)) return ![]
        var _0x4b2457 = this['$$']['ptrType'][_0x5ebb16(0x370)],
          _0x500c79 = this['$$'][_0x5ebb16(0x3b5)]
        _0x437013['$$'] = _0x437013['$$']
        var _0x1930bc = _0x437013['$$']['ptrType'][_0x5ebb16(0x370)],
          _0x58cf80 = _0x437013['$$'][_0x5ebb16(0x3b5)]
        while (_0x4b2457[_0x5ebb16(0x2e5)]) {
          ;((_0x500c79 = _0x4b2457[_0x5ebb16(0x2a4)](_0x500c79)),
            (_0x4b2457 = _0x4b2457[_0x5ebb16(0x2e5)]))
        }
        while (_0x1930bc[_0x5ebb16(0x2e5)]) {
          ;((_0x58cf80 = _0x1930bc['upcast'](_0x58cf80)),
            (_0x1930bc = _0x1930bc[_0x5ebb16(0x2e5)]))
        }
        return _0x4b2457 === _0x1930bc && _0x500c79 === _0x58cf80
      },
      clone() {
        var _0x4f6ad7 = _0x453121
        !this['$$'][_0x4f6ad7(0x3b5)] && throwInstanceAlreadyDeleted(this)
        if (this['$$'][_0x4f6ad7(0x2af)])
          return ((this['$$'][_0x4f6ad7(0x138)]['value'] += 0x1), this)
        else {
          var _0x126aee = attachFinalizer(
            Object[_0x4f6ad7(0x218)](Object[_0x4f6ad7(0x358)](this), {
              $$: { value: shallowCopyInternalPointer(this['$$']) },
            })
          )
          return (
            (_0x126aee['$$'][_0x4f6ad7(0x138)][_0x4f6ad7(0x2f5)] += 0x1),
            (_0x126aee['$$']['deleteScheduled'] = ![]),
            _0x126aee
          )
        }
      },
      delete() {
        var _0x641007 = _0x453121
        ;(!this['$$'][_0x641007(0x3b5)] && throwInstanceAlreadyDeleted(this),
          this['$$'][_0x641007(0x359)] &&
            !this['$$'][_0x641007(0x2af)] &&
            throwBindingError(_0x641007(0x173)),
          detachFinalizer(this),
          releaseClassHandle(this['$$']),
          !this['$$']['preservePointerOnDelete'] &&
            ((this['$$'][_0x641007(0x354)] = undefined),
            (this['$$'][_0x641007(0x3b5)] = undefined)))
      },
      isDeleted() {
        var _0x4205a4 = _0x453121
        return !this['$$'][_0x4205a4(0x3b5)]
      },
      deleteLater() {
        var _0x288755 = _0x453121
        return (
          !this['$$'][_0x288755(0x3b5)] && throwInstanceAlreadyDeleted(this),
          this['$$'][_0x288755(0x359)] &&
            !this['$$'][_0x288755(0x2af)] &&
            throwBindingError(_0x288755(0x173)),
          deletionQueue[_0x288755(0x364)](this),
          deletionQueue[_0x288755(0x308)] === 0x1 &&
            delayFunction &&
            delayFunction(flushPendingDeletes),
          (this['$$'][_0x288755(0x359)] = !![]),
          this
        )
      },
    })
    const _0x90e0c4 = Symbol[_0x453121(0x1cc)]
    _0x90e0c4 && (_0x1247ee[_0x90e0c4] = _0x1247ee[_0x453121(0x373)])
  }
function ClassHandle() {}
var createNamedFunction = (_0x2d9ed0, _0x1c8c95) =>
    Object[a0_0x5889c6(0x353)](_0x1c8c95, a0_0x5889c6(0x3da), {
      value: _0x2d9ed0,
    }),
  ensureOverloadTable = (_0x1affa1, _0x2cb533, _0x1c6594) => {
    var _0x332bd5 = a0_0x5889c6
    if (undefined === _0x1affa1[_0x2cb533][_0x332bd5(0x1fc)]) {
      var _0x8154f1 = _0x1affa1[_0x2cb533]
      ;((_0x1affa1[_0x2cb533] = function (..._0x3a2e8a) {
        var _0x309f8f = _0x332bd5
        return (
          !_0x1affa1[_0x2cb533][_0x309f8f(0x1fc)][_0x309f8f(0x416)](
            _0x3a2e8a['length']
          ) &&
            throwBindingError(
              _0x309f8f(0x3e8) +
                _0x1c6594 +
                _0x309f8f(0x3f0) +
                _0x3a2e8a[_0x309f8f(0x308)] +
                _0x309f8f(0x309) +
                _0x1affa1[_0x2cb533][_0x309f8f(0x1fc)] +
                ')!'
            ),
          _0x1affa1[_0x2cb533][_0x309f8f(0x1fc)][_0x3a2e8a[_0x309f8f(0x308)]][
            _0x309f8f(0x324)
          ](this, _0x3a2e8a)
        )
      }),
        (_0x1affa1[_0x2cb533]['overloadTable'] = []),
        (_0x1affa1[_0x2cb533][_0x332bd5(0x1fc)][_0x8154f1['argCount']] =
          _0x8154f1))
    }
  },
  exposePublicSymbol = (_0x15f634, _0x468038, _0x46e53d) => {
    var _0x40c3c8 = a0_0x5889c6
    Module['hasOwnProperty'](_0x15f634)
      ? ((undefined === _0x46e53d ||
          (undefined !== Module[_0x15f634][_0x40c3c8(0x1fc)] &&
            undefined !== Module[_0x15f634][_0x40c3c8(0x1fc)][_0x46e53d])) &&
          throwBindingError(_0x40c3c8(0x3e0) + _0x15f634 + _0x40c3c8(0x303)),
        ensureOverloadTable(Module, _0x15f634, _0x15f634),
        Module[_0x15f634][_0x40c3c8(0x1fc)]['hasOwnProperty'](_0x46e53d) &&
          throwBindingError(_0x40c3c8(0x214) + _0x46e53d + ')!'),
        (Module[_0x15f634][_0x40c3c8(0x1fc)][_0x46e53d] = _0x468038))
      : ((Module[_0x15f634] = _0x468038),
        (Module[_0x15f634][_0x40c3c8(0x3bd)] = _0x46e53d))
  },
  char_0 = 0x30,
  char_9 = 0x39,
  makeLegalFunctionName = (_0x2d6aba) => {
    var _0x3aad35 = a0_0x5889c6
    ;(assert(typeof _0x2d6aba === _0x3aad35(0x21f)),
      (_0x2d6aba = _0x2d6aba[_0x3aad35(0x3e6)](/[^a-zA-Z0-9_]/g, '$')))
    var _0x126167 = _0x2d6aba[_0x3aad35(0x15a)](0x0)
    if (_0x126167 >= char_0 && _0x126167 <= char_9) return '_' + _0x2d6aba
    return _0x2d6aba
  }
function RegisteredClass(
  _0x305950,
  _0x4725e3,
  _0x4a9439,
  _0x223234,
  _0x11a4a0,
  _0x237430,
  _0x20287b,
  _0x4df798
) {
  var _0x3ce48c = a0_0x5889c6
  ;((this[_0x3ce48c(0x3da)] = _0x305950),
    (this[_0x3ce48c(0x3ed)] = _0x4725e3),
    (this[_0x3ce48c(0x12c)] = _0x4a9439),
    (this['rawDestructor'] = _0x223234),
    (this[_0x3ce48c(0x2e5)] = _0x11a4a0),
    (this[_0x3ce48c(0x284)] = _0x237430),
    (this[_0x3ce48c(0x2a4)] = _0x20287b),
    (this['downcast'] = _0x4df798),
    (this[_0x3ce48c(0x2c2)] = []))
}
var upcastPointer = (_0x58a2c9, _0x293997, _0x103baa) => {
  var _0x5ded39 = a0_0x5889c6
  while (_0x293997 !== _0x103baa) {
    ;(!_0x293997[_0x5ded39(0x2a4)] &&
      throwBindingError(
        'Expected\x20null\x20or\x20instance\x20of\x20' +
          _0x103baa[_0x5ded39(0x3da)] +
          _0x5ded39(0x2f9) +
          _0x293997[_0x5ded39(0x3da)]
      ),
      (_0x58a2c9 = _0x293997[_0x5ded39(0x2a4)](_0x58a2c9)),
      (_0x293997 = _0x293997['baseClass']))
  }
  return _0x58a2c9
}
function constNoSmartPtrRawPointerToWireType(_0x3aac0c, _0x570e73) {
  var _0x1d73a2 = a0_0x5889c6
  if (_0x570e73 === null)
    return (
      this[_0x1d73a2(0x37f)] &&
        throwBindingError(_0x1d73a2(0x3ef) + this[_0x1d73a2(0x3da)]),
      0x0
    )
  !_0x570e73['$$'] &&
    throwBindingError(
      _0x1d73a2(0x2c5) +
        embindRepr(_0x570e73) +
        _0x1d73a2(0x408) +
        this[_0x1d73a2(0x3da)]
    )
  !_0x570e73['$$'][_0x1d73a2(0x3b5)] &&
    throwBindingError(_0x1d73a2(0x1c1) + this[_0x1d73a2(0x3da)])
  var _0x57b47f = _0x570e73['$$'][_0x1d73a2(0x2b8)][_0x1d73a2(0x370)],
    _0x572b6b = upcastPointer(
      _0x570e73['$$'][_0x1d73a2(0x3b5)],
      _0x57b47f,
      this[_0x1d73a2(0x370)]
    )
  return _0x572b6b
}
function genericPointerToWireType(_0x2d6a9d, _0x2db239) {
  var _0x427fc9 = a0_0x5889c6,
    _0x1a8dde
  if (_0x2db239 === null)
    return (
      this[_0x427fc9(0x37f)] &&
        throwBindingError(
          'null\x20is\x20not\x20a\x20valid\x20' + this[_0x427fc9(0x3da)]
        ),
      this[_0x427fc9(0x272)]
        ? ((_0x1a8dde = this[_0x427fc9(0x145)]()),
          _0x2d6a9d !== null &&
            _0x2d6a9d[_0x427fc9(0x364)](this[_0x427fc9(0x245)], _0x1a8dde),
          _0x1a8dde)
        : 0x0
    )
  ;(!_0x2db239 || !_0x2db239['$$']) &&
    throwBindingError(
      _0x427fc9(0x2c5) +
        embindRepr(_0x2db239) +
        '\x22\x20as\x20a\x20' +
        this['name']
    )
  !_0x2db239['$$'][_0x427fc9(0x3b5)] &&
    throwBindingError(
      'Cannot\x20pass\x20deleted\x20object\x20as\x20a\x20pointer\x20of\x20type\x20' +
        this['name']
    )
  !this[_0x427fc9(0x1e0)] &&
    _0x2db239['$$'][_0x427fc9(0x2b8)][_0x427fc9(0x1e0)] &&
    throwBindingError(
      _0x427fc9(0x36e) +
        (_0x2db239['$$'][_0x427fc9(0x41a)]
          ? _0x2db239['$$']['smartPtrType'][_0x427fc9(0x3da)]
          : _0x2db239['$$']['ptrType'][_0x427fc9(0x3da)]) +
        '\x20to\x20parameter\x20type\x20' +
        this['name']
    )
  var _0x54a7ab = _0x2db239['$$'][_0x427fc9(0x2b8)][_0x427fc9(0x370)]
  _0x1a8dde = upcastPointer(
    _0x2db239['$$']['ptr'],
    _0x54a7ab,
    this[_0x427fc9(0x370)]
  )
  if (this['isSmartPointer']) {
    undefined === _0x2db239['$$']['smartPtr'] &&
      throwBindingError(
        'Passing\x20raw\x20pointer\x20to\x20smart\x20pointer\x20is\x20illegal'
      )
    switch (this[_0x427fc9(0x253)]) {
      case 0x0:
        _0x2db239['$$'][_0x427fc9(0x41a)] === this
          ? (_0x1a8dde = _0x2db239['$$'][_0x427fc9(0x354)])
          : throwBindingError(
              _0x427fc9(0x36e) +
                (_0x2db239['$$']['smartPtrType']
                  ? _0x2db239['$$'][_0x427fc9(0x41a)][_0x427fc9(0x3da)]
                  : _0x2db239['$$'][_0x427fc9(0x2b8)]['name']) +
                _0x427fc9(0x215) +
                this[_0x427fc9(0x3da)]
            )
        break
      case 0x1:
        _0x1a8dde = _0x2db239['$$']['smartPtr']
        break
      case 0x2:
        if (_0x2db239['$$'][_0x427fc9(0x41a)] === this)
          _0x1a8dde = _0x2db239['$$'][_0x427fc9(0x354)]
        else {
          var _0x18dfa0 = _0x2db239[_0x427fc9(0x3b7)]()
          ;((_0x1a8dde = this[_0x427fc9(0x33a)](
            _0x1a8dde,
            Emval[_0x427fc9(0x32d)](() => _0x18dfa0[_0x427fc9(0x373)]())
          )),
            _0x2d6a9d !== null &&
              _0x2d6a9d[_0x427fc9(0x364)](this[_0x427fc9(0x245)], _0x1a8dde))
        }
        break
      default:
        throwBindingError(_0x427fc9(0x2d1))
    }
  }
  return _0x1a8dde
}
function nonConstNoSmartPtrRawPointerToWireType(_0x30f8b6, _0x2726a6) {
  var _0xdeffe7 = a0_0x5889c6
  if (_0x2726a6 === null)
    return (
      this['isReference'] && throwBindingError(_0xdeffe7(0x3ef) + this['name']),
      0x0
    )
  !_0x2726a6['$$'] &&
    throwBindingError(
      _0xdeffe7(0x2c5) +
        embindRepr(_0x2726a6) +
        _0xdeffe7(0x408) +
        this[_0xdeffe7(0x3da)]
    )
  !_0x2726a6['$$']['ptr'] &&
    throwBindingError(_0xdeffe7(0x1c1) + this[_0xdeffe7(0x3da)])
  _0x2726a6['$$'][_0xdeffe7(0x2b8)]['isConst'] &&
    throwBindingError(
      'Cannot\x20convert\x20argument\x20of\x20type\x20' +
        _0x2726a6['$$']['ptrType']['name'] +
        _0xdeffe7(0x215) +
        this[_0xdeffe7(0x3da)]
    )
  var _0x3af987 = _0x2726a6['$$'][_0xdeffe7(0x2b8)][_0xdeffe7(0x370)],
    _0x3c7895 = upcastPointer(
      _0x2726a6['$$']['ptr'],
      _0x3af987,
      this[_0xdeffe7(0x370)]
    )
  return _0x3c7895
}
var init_RegisteredPointer = () => {
  var _0x6d2eae = a0_0x5889c6
  Object['assign'](RegisteredPointer[_0x6d2eae(0x276)], {
    getPointee(_0x3b32e5) {
      var _0x5c5dfc = _0x6d2eae
      return (
        this[_0x5c5dfc(0x216)] &&
          (_0x3b32e5 = this[_0x5c5dfc(0x216)](_0x3b32e5)),
        _0x3b32e5
      )
    },
    destructor(_0x5290e1) {
      this['rawDestructor']?.(_0x5290e1)
    },
    readValueFromPointer: readPointer,
    fromWireType: RegisteredPointer_fromWireType,
  })
}
function RegisteredPointer(
  _0x4109d3,
  _0x3e22d7,
  _0xc5b645,
  _0x200a60,
  _0x1c4b8c,
  _0x34d95f,
  _0x13bbac,
  _0x546ef7,
  _0x47bd42,
  _0x1eb026,
  _0x5e3952
) {
  var _0x4fa214 = a0_0x5889c6
  ;((this[_0x4fa214(0x3da)] = _0x4109d3),
    (this[_0x4fa214(0x370)] = _0x3e22d7),
    (this[_0x4fa214(0x37f)] = _0xc5b645),
    (this[_0x4fa214(0x1e0)] = _0x200a60),
    (this[_0x4fa214(0x272)] = _0x1c4b8c),
    (this[_0x4fa214(0x2cd)] = _0x34d95f),
    (this[_0x4fa214(0x253)] = _0x13bbac),
    (this[_0x4fa214(0x216)] = _0x546ef7),
    (this[_0x4fa214(0x145)] = _0x47bd42),
    (this['rawShare'] = _0x1eb026),
    (this['rawDestructor'] = _0x5e3952),
    !_0x1c4b8c && _0x3e22d7[_0x4fa214(0x2e5)] === undefined
      ? _0x200a60
        ? ((this[_0x4fa214(0x21d)] = constNoSmartPtrRawPointerToWireType),
          (this[_0x4fa214(0x38f)] = null))
        : ((this[_0x4fa214(0x21d)] = nonConstNoSmartPtrRawPointerToWireType),
          (this[_0x4fa214(0x38f)] = null))
      : (this[_0x4fa214(0x21d)] = genericPointerToWireType))
}
var replacePublicSymbol = (_0x53a4ce, _0xa0e521, _0x3789a0) => {
    var _0x13c66e = a0_0x5889c6
    ;(!Module[_0x13c66e(0x416)](_0x53a4ce) &&
      throwInternalError(_0x13c66e(0x26d)),
      undefined !== Module[_0x53a4ce]['overloadTable'] &&
      undefined !== _0x3789a0
        ? (Module[_0x53a4ce][_0x13c66e(0x1fc)][_0x3789a0] = _0xa0e521)
        : ((Module[_0x53a4ce] = _0xa0e521),
          (Module[_0x53a4ce][_0x13c66e(0x3bd)] = _0x3789a0)))
  },
  wasmTableMirror = [],
  wasmTable,
  getWasmTableEntry = (_0x3f0b8c) => {
    var _0x3bde5f = a0_0x5889c6,
      _0x271503 = wasmTableMirror[_0x3f0b8c]
    return (
      !_0x271503 &&
        (wasmTableMirror[_0x3f0b8c] = _0x271503 =
          wasmTable[_0x3bde5f(0x2dc)](_0x3f0b8c)),
      assert(wasmTable['get'](_0x3f0b8c) == _0x271503, _0x3bde5f(0x302)),
      _0x271503
    )
  },
  embind__requireFunction = (_0x5a9f61, _0x370986, _0x499412 = ![]) => {
    var _0x529424 = a0_0x5889c6
    ;(assert(!_0x499412, _0x529424(0x140)),
      (_0x5a9f61 = AsciiToString(_0x5a9f61)))
    function _0x4f4847() {
      var _0x15a38e = getWasmTableEntry(_0x370986)
      return _0x15a38e
    }
    var _0x36e23e = _0x4f4847()
    return (
      typeof _0x36e23e != _0x529424(0x22c) &&
        throwBindingError(_0x529424(0x334) + _0x5a9f61 + ':\x20' + _0x370986),
      _0x36e23e
    )
  }
class UnboundTypeError extends Error {}
var getTypeName = (_0x243d9f) => {
    var _0x385864 = ___getTypeName(_0x243d9f),
      _0x5ded2b = AsciiToString(_0x385864)
    return (_free(_0x385864), _0x5ded2b)
  },
  throwUnboundTypeError = (_0x3f95bb, _0xfd51bf) => {
    var _0x371c5d = a0_0x5889c6,
      _0xfc6c44 = [],
      _0x4686c6 = {}
    function _0x49e27d(_0x441b23) {
      var _0x5200e9 = a0_0x1c46
      if (_0x4686c6[_0x441b23]) return
      if (registeredTypes[_0x441b23]) return
      if (typeDependencies[_0x441b23]) {
        typeDependencies[_0x441b23][_0x5200e9(0x3fc)](_0x49e27d)
        return
      }
      ;(_0xfc6c44[_0x5200e9(0x364)](_0x441b23), (_0x4686c6[_0x441b23] = !![]))
    }
    _0xfd51bf['forEach'](_0x49e27d)
    throw new UnboundTypeError(
      _0x3f95bb +
        ':\x20' +
        _0xfc6c44[_0x371c5d(0x268)](getTypeName)[_0x371c5d(0x400)]([',\x20'])
    )
  },
  __embind_register_class = (
    _0x4d20c0,
    _0xd04e01,
    _0x41ad54,
    _0x3c06c9,
    _0x577963,
    _0x26b8f1,
    _0x248d2c,
    _0x5caeac,
    _0x1b2cc9,
    _0x577ff5,
    _0x3a7f0c,
    _0x382c34,
    _0x567044
  ) => {
    ;((_0x3a7f0c = AsciiToString(_0x3a7f0c)),
      (_0x26b8f1 = embind__requireFunction(_0x577963, _0x26b8f1)),
      (_0x5caeac &&= embind__requireFunction(_0x248d2c, _0x5caeac)),
      (_0x577ff5 &&= embind__requireFunction(_0x1b2cc9, _0x577ff5)),
      (_0x567044 = embind__requireFunction(_0x382c34, _0x567044)))
    var _0x4a24bf = makeLegalFunctionName(_0x3a7f0c)
    ;(exposePublicSymbol(_0x4a24bf, function () {
      var _0xd83c17 = a0_0x1c46
      throwUnboundTypeError(
        _0xd83c17(0x348) + _0x3a7f0c + '\x20due\x20to\x20unbound\x20types',
        [_0x3c06c9]
      )
    }),
      whenDependentTypesAreResolved(
        [_0x4d20c0, _0xd04e01, _0x41ad54],
        _0x3c06c9 ? [_0x3c06c9] : [],
        (_0x23ef75) => {
          var _0x5a241e = a0_0x1c46
          _0x23ef75 = _0x23ef75[0x0]
          var _0x4ab71f, _0x3d2876
          _0x3c06c9
            ? ((_0x4ab71f = _0x23ef75[_0x5a241e(0x370)]),
              (_0x3d2876 = _0x4ab71f['instancePrototype']))
            : (_0x3d2876 = ClassHandle[_0x5a241e(0x276)])
          var _0x592092 = createNamedFunction(
              _0x3a7f0c,
              function (..._0x271a37) {
                var _0x5aaa8b = _0x5a241e
                if (Object[_0x5aaa8b(0x358)](this) !== _0x21891c)
                  throw new BindingError(_0x5aaa8b(0x418) + _0x3a7f0c)
                if (undefined === _0x272159[_0x5aaa8b(0x2f4)])
                  throw new BindingError(_0x3a7f0c + _0x5aaa8b(0x367))
                var _0x1653af = _0x272159[_0x5aaa8b(0x2f4)][_0x271a37['length']]
                if (undefined === _0x1653af)
                  throw new BindingError(
                    _0x5aaa8b(0x19a) +
                      _0x3a7f0c +
                      _0x5aaa8b(0x413) +
                      _0x271a37[_0x5aaa8b(0x308)] +
                      _0x5aaa8b(0x11e) +
                      Object[_0x5aaa8b(0x282)](_0x272159[_0x5aaa8b(0x2f4)])[
                        _0x5aaa8b(0x2eb)
                      ]() +
                      ')\x20parameters\x20instead!'
                  )
                return _0x1653af[_0x5aaa8b(0x324)](this, _0x271a37)
              }
            ),
            _0x21891c = Object[_0x5a241e(0x218)](_0x3d2876, {
              constructor: { value: _0x592092 },
            })
          _0x592092[_0x5a241e(0x276)] = _0x21891c
          var _0x272159 = new RegisteredClass(
            _0x3a7f0c,
            _0x592092,
            _0x21891c,
            _0x567044,
            _0x4ab71f,
            _0x26b8f1,
            _0x5caeac,
            _0x577ff5
          )
          _0x272159[_0x5a241e(0x2e5)] &&
            ((_0x272159['baseClass'][_0x5a241e(0x3be)] ??= []),
            _0x272159[_0x5a241e(0x2e5)][_0x5a241e(0x3be)][_0x5a241e(0x364)](
              _0x272159
            ))
          var _0x58d60f = new RegisteredPointer(
              _0x3a7f0c,
              _0x272159,
              !![],
              ![],
              ![]
            ),
            _0x4db994 = new RegisteredPointer(
              _0x3a7f0c + '*',
              _0x272159,
              ![],
              ![],
              ![]
            ),
            _0x26274b = new RegisteredPointer(
              _0x3a7f0c + _0x5a241e(0x288),
              _0x272159,
              ![],
              !![],
              ![]
            )
          return (
            (registeredPointers[_0x4d20c0] = {
              pointerType: _0x4db994,
              constPointerType: _0x26274b,
            }),
            replacePublicSymbol(_0x4a24bf, _0x592092),
            [_0x58d60f, _0x4db994, _0x26274b]
          )
        }
      ))
  },
  heap32VectorToArray = (_0x25f2fe, _0x862aaa) => {
    var _0x42c966 = a0_0x5889c6,
      _0x2c5e79 = []
    for (var _0x335299 = 0x0; _0x335299 < _0x25f2fe; _0x335299++) {
      _0x2c5e79[_0x42c966(0x364)](HEAPU32[(_0x862aaa + _0x335299 * 0x4) >> 0x2])
    }
    return _0x2c5e79
  }
function usesDestructorStack(_0x520835) {
  var _0x49e44b = a0_0x5889c6
  for (
    var _0x1cb42a = 0x1;
    _0x1cb42a < _0x520835[_0x49e44b(0x308)];
    ++_0x1cb42a
  ) {
    if (
      _0x520835[_0x1cb42a] !== null &&
      _0x520835[_0x1cb42a][_0x49e44b(0x38f)] === undefined
    )
      return !![]
  }
  return ![]
}
var InvokerFunctions = {
  ftf: function anonymous(
    _0x45c817,
    _0x48fd31,
    _0x526aa1,
    _0xae8f27,
    _0x172fca,
    _0x506169,
    _0x2ee3dc,
    _0x15613e,
    _0x3edba4,
    _0x5be4c4
  ) {
    var _0x29a2ad = a0_0x5889c6
    if (arguments[_0x29a2ad(0x308)] !== 0xa)
      throw new Error(
        _0x45c817 +
          _0x29a2ad(0x314) +
          arguments[_0x29a2ad(0x308)] +
          _0x29a2ad(0x2b5)
      )
    return function () {
      var _0x351dde = _0x29a2ad
      _0x15613e(
        arguments[_0x351dde(0x308)],
        _0x3edba4,
        _0x5be4c4,
        _0x45c817,
        _0x48fd31
      )
      var _0x5a491a = _0x526aa1(_0xae8f27),
        _0x50c20e = _0x506169(_0x5a491a)
      return _0x50c20e
    }
  },
  fff: function anonymous(
    _0x1e51a6,
    _0x2db0e1,
    _0x1b4da6,
    _0x5b594f,
    _0x108281,
    _0x5bb2c0,
    _0x28baf3,
    _0x544c70,
    _0x35cf3c,
    _0x496673
  ) {
    var _0x2300e6 = a0_0x5889c6
    if (arguments[_0x2300e6(0x308)] !== 0xa)
      throw new Error(
        _0x1e51a6 +
          'Expected\x2010\x20closure\x20arguments\x20' +
          arguments[_0x2300e6(0x308)] +
          _0x2300e6(0x2b5)
      )
    return function () {
      var _0x3f9821 = _0x2300e6
      ;(_0x544c70(
        arguments[_0x3f9821(0x308)],
        _0x35cf3c,
        _0x496673,
        _0x1e51a6,
        _0x2db0e1
      ),
        _0x1b4da6(_0x5b594f))
    }
  },
  ftfn: function anonymous(
    _0x524580,
    _0x1c90fb,
    _0x128e63,
    _0x18674e,
    _0x278060,
    _0x59f356,
    _0x487720,
    _0x280161,
    _0x41cea3,
    _0x3a894a,
    _0x5a2ba4
  ) {
    var _0x4627e5 = a0_0x5889c6
    if (arguments[_0x4627e5(0x308)] !== 0xb)
      throw new Error(
        _0x524580 + _0x4627e5(0x331) + arguments['length'] + '\x20given.'
      )
    return function (_0x48fcdd) {
      var _0x40da60 = _0x4627e5
      _0x41cea3(
        arguments[_0x40da60(0x308)],
        _0x3a894a,
        _0x5a2ba4,
        _0x524580,
        _0x1c90fb
      )
      var _0x1c663b = _0x280161(null, _0x48fcdd),
        _0x2be6d3 = _0x128e63(_0x18674e, _0x1c663b),
        _0xc5caf9 = _0x59f356(_0x2be6d3)
      return _0xc5caf9
    }
  },
  fffn: function anonymous(
    _0x2a29f6,
    _0x4c07ff,
    _0x3dc258,
    _0x13d0ef,
    _0x5378cd,
    _0x37bc98,
    _0x52812c,
    _0x11d430,
    _0x31edd5,
    _0x3fde25,
    _0x3f1409
  ) {
    var _0x2c58ba = a0_0x5889c6
    if (arguments['length'] !== 0xb)
      throw new Error(
        _0x2a29f6 +
          _0x2c58ba(0x331) +
          arguments[_0x2c58ba(0x308)] +
          '\x20given.'
      )
    return function (_0x32658e) {
      var _0x32cdca = _0x2c58ba
      _0x31edd5(
        arguments[_0x32cdca(0x308)],
        _0x3fde25,
        _0x3f1409,
        _0x2a29f6,
        _0x4c07ff
      )
      var _0x235149 = _0x11d430(null, _0x32658e)
      _0x3dc258(_0x13d0ef, _0x235149)
    }
  },
  fffnn: function anonymous(
    _0x28abbb,
    _0x4a0099,
    _0x18f147,
    _0x15015d,
    _0x399647,
    _0x3992b5,
    _0x14e01a,
    _0x4f9293,
    _0x77ae3d,
    _0x1ebf58,
    _0x2340ee,
    _0x3281b0
  ) {
    var _0x146ad9 = a0_0x5889c6
    if (arguments[_0x146ad9(0x308)] !== 0xc)
      throw new Error(
        _0x28abbb +
          _0x146ad9(0x1ee) +
          arguments[_0x146ad9(0x308)] +
          _0x146ad9(0x2b5)
      )
    return function (_0x531f55, _0x18cc61) {
      var _0x527e52 = _0x146ad9
      _0x1ebf58(
        arguments[_0x527e52(0x308)],
        _0x2340ee,
        _0x3281b0,
        _0x28abbb,
        _0x4a0099
      )
      var _0x4fbd9a = _0x4f9293(null, _0x531f55),
        _0x14e6f1 = _0x77ae3d(null, _0x18cc61)
      _0x18f147(_0x15015d, _0x4fbd9a, _0x14e6f1)
    }
  },
}
function createJsInvokerSignature(_0x55af98, _0x19ee50, _0x229b10, _0x4de17d) {
  var _0x458e43 = a0_0x5889c6
  const _0xe6ead6 = [
    _0x19ee50 ? 't' : 'f',
    _0x229b10 ? 't' : 'f',
    _0x4de17d ? 't' : 'f',
  ]
  for (
    let _0x3c3a82 = _0x19ee50 ? 0x1 : 0x2;
    _0x3c3a82 < _0x55af98[_0x458e43(0x308)];
    ++_0x3c3a82
  ) {
    const _0x2a50bf = _0x55af98[_0x3c3a82]
    let _0x2c4753 = ''
    if (_0x2a50bf['destructorFunction'] === undefined) _0x2c4753 = 'u'
    else
      _0x2a50bf[_0x458e43(0x38f)] === null
        ? (_0x2c4753 = 'n')
        : (_0x2c4753 = 't')
    _0xe6ead6[_0x458e43(0x364)](_0x2c4753)
  }
  return _0xe6ead6['join']('')
}
function getRequiredArgCount(_0xf027a9) {
  var _0x508cbb = a0_0x5889c6,
    _0x27ee80 = _0xf027a9[_0x508cbb(0x308)] - 0x2
  for (
    var _0x3b5a65 = _0xf027a9[_0x508cbb(0x308)] - 0x1;
    _0x3b5a65 >= 0x2;
    --_0x3b5a65
  ) {
    if (!_0xf027a9[_0x3b5a65]['optional']) break
    _0x27ee80--
  }
  return _0x27ee80
}
function checkArgCount(_0x39de54, _0x57f358, _0x434039, _0x2a515e, _0x4585b7) {
  var _0x517d37 = a0_0x5889c6
  if (_0x39de54 < _0x57f358 || _0x39de54 > _0x434039) {
    var _0x57d87c =
      _0x57f358 == _0x434039
        ? _0x57f358
        : _0x57f358 + _0x517d37(0x223) + _0x434039
    _0x4585b7(
      _0x517d37(0x39f) +
        _0x2a515e +
        _0x517d37(0x157) +
        _0x39de54 +
        _0x517d37(0x263) +
        _0x57d87c
    )
  }
}
function craftInvokerFunction(
  _0x18a477,
  _0x52b8a5,
  _0xe8ed94,
  _0xe19668,
  _0x5cd3c6,
  _0x45cb9d
) {
  var _0x5ba009 = a0_0x5889c6,
    _0x4b6df5 = _0x52b8a5[_0x5ba009(0x308)]
  _0x4b6df5 < 0x2 && throwBindingError(_0x5ba009(0x26c))
  assert(!_0x45cb9d, _0x5ba009(0x140))
  var _0x2041cb = _0x52b8a5[0x1] !== null && _0xe8ed94 !== null,
    _0x4e5b38 = usesDestructorStack(_0x52b8a5),
    _0x179831 = !_0x52b8a5[0x0]['isVoid'],
    _0x4e868e = _0x4b6df5 - 0x2,
    _0x4409b4 = getRequiredArgCount(_0x52b8a5),
    _0x3efc1f = _0x52b8a5[0x0],
    _0x362dd6 = _0x52b8a5[0x1],
    _0x175a50 = [
      _0x18a477,
      throwBindingError,
      _0xe19668,
      _0x5cd3c6,
      runDestructors,
      _0x3efc1f[_0x5ba009(0x17b)]['bind'](_0x3efc1f),
      _0x362dd6?.[_0x5ba009(0x21d)]['bind'](_0x362dd6),
    ]
  for (var _0x1cb8de = 0x2; _0x1cb8de < _0x4b6df5; ++_0x1cb8de) {
    var _0x559ed0 = _0x52b8a5[_0x1cb8de]
    _0x175a50[_0x5ba009(0x364)](
      _0x559ed0['toWireType'][_0x5ba009(0x299)](_0x559ed0)
    )
  }
  if (!_0x4e5b38)
    for (
      var _0x1cb8de = _0x2041cb ? 0x1 : 0x2;
      _0x1cb8de < _0x52b8a5[_0x5ba009(0x308)];
      ++_0x1cb8de
    ) {
      _0x52b8a5[_0x1cb8de][_0x5ba009(0x38f)] !== null &&
        _0x175a50[_0x5ba009(0x364)](_0x52b8a5[_0x1cb8de][_0x5ba009(0x38f)])
    }
  _0x175a50[_0x5ba009(0x364)](checkArgCount, _0x4409b4, _0x4e868e)
  var _0x5aca20 = createJsInvokerSignature(
      _0x52b8a5,
      _0x2041cb,
      _0x179831,
      _0x45cb9d
    ),
    _0x411032 = InvokerFunctions[_0x5aca20](..._0x175a50)
  return createNamedFunction(_0x18a477, _0x411032)
}
var __embind_register_class_constructor = (
    _0x11658f,
    _0x2a1419,
    _0x5c09d0,
    _0x450334,
    _0x5815d4,
    _0x513eee
  ) => {
    assert(_0x2a1419 > 0x0)
    var _0x503d14 = heap32VectorToArray(_0x2a1419, _0x5c09d0)
    ;((_0x5815d4 = embind__requireFunction(_0x450334, _0x5815d4)),
      whenDependentTypesAreResolved([], [_0x11658f], (_0x16c780) => {
        var _0x168e65 = a0_0x1c46
        _0x16c780 = _0x16c780[0x0]
        var _0x11634e = 'constructor\x20' + _0x16c780['name']
        undefined === _0x16c780[_0x168e65(0x370)][_0x168e65(0x2f4)] &&
          (_0x16c780['registeredClass'][_0x168e65(0x2f4)] = [])
        if (
          undefined !==
          _0x16c780['registeredClass'][_0x168e65(0x2f4)][_0x2a1419 - 0x1]
        )
          throw new BindingError(
            'Cannot\x20register\x20multiple\x20constructors\x20with\x20identical\x20number\x20of\x20parameters\x20(' +
              (_0x2a1419 - 0x1) +
              ')\x20for\x20class\x20\x27' +
              _0x16c780[_0x168e65(0x3da)] +
              _0x168e65(0x3c8)
          )
        return (
          (_0x16c780[_0x168e65(0x370)][_0x168e65(0x2f4)][_0x2a1419 - 0x1] =
            () => {
              var _0x23d878 = _0x168e65
              throwUnboundTypeError(
                _0x23d878(0x348) +
                  _0x16c780[_0x23d878(0x3da)] +
                  _0x23d878(0x1e4),
                _0x503d14
              )
            }),
          whenDependentTypesAreResolved([], _0x503d14, (_0x41a98f) => {
            var _0x13bcc4 = _0x168e65
            return (
              _0x41a98f[_0x13bcc4(0x36c)](0x1, 0x0, null),
              (_0x16c780[_0x13bcc4(0x370)][_0x13bcc4(0x2f4)][_0x2a1419 - 0x1] =
                craftInvokerFunction(
                  _0x11634e,
                  _0x41a98f,
                  null,
                  _0x5815d4,
                  _0x513eee
                )),
              []
            )
          }),
          []
        )
      }))
  },
  emval_freelist = [],
  emval_handles = [0x0, 0x1, , 0x1, null, 0x1, !![], 0x1, ![], 0x1],
  __emval_decref = (_0x228721) => {
    _0x228721 > 0x9 &&
      0x0 === --emval_handles[_0x228721 + 0x1] &&
      (assert(
        emval_handles[_0x228721] !== undefined,
        'Decref\x20for\x20unallocated\x20handle.'
      ),
      (emval_handles[_0x228721] = undefined),
      emval_freelist['push'](_0x228721))
  },
  Emval = {
    toValue: (_0x50cdcc) => {
      var _0x1ccea6 = a0_0x5889c6
      return (
        !_0x50cdcc && throwBindingError(_0x1ccea6(0x257) + _0x50cdcc),
        assert(
          _0x50cdcc === 0x2 ||
            (emval_handles[_0x50cdcc] !== undefined && _0x50cdcc % 0x2 === 0x0),
          'invalid\x20handle:\x20' + _0x50cdcc
        ),
        emval_handles[_0x50cdcc]
      )
    },
    toHandle: (_0x31bd8b) => {
      var _0x2bdd31 = a0_0x5889c6
      switch (_0x31bd8b) {
        case undefined:
          return 0x2
        case null:
          return 0x4
        case !![]:
          return 0x6
        case ![]:
          return 0x8
        default: {
          const _0x3985b8 =
            emval_freelist[_0x2bdd31(0x135)]() ||
            emval_handles[_0x2bdd31(0x308)]
          return (
            (emval_handles[_0x3985b8] = _0x31bd8b),
            (emval_handles[_0x3985b8 + 0x1] = 0x1),
            _0x3985b8
          )
        }
      }
    },
  },
  EmValType = {
    name: 'emscripten::val',
    fromWireType: (_0x128658) => {
      var _0x1a2c89 = a0_0x5889c6,
        _0x4d142c = Emval[_0x1a2c89(0x132)](_0x128658)
      return (__emval_decref(_0x128658), _0x4d142c)
    },
    toWireType: (_0x3d4e66, _0x552339) => Emval[a0_0x5889c6(0x32d)](_0x552339),
    readValueFromPointer: readPointer,
    destructorFunction: null,
  },
  __embind_register_emval = (_0x25edc4) => registerType(_0x25edc4, EmValType),
  enumReadValueFromPointer = (_0x2b94cb, _0x2bdde2, _0x1f12b6) => {
    var _0x2d3514 = a0_0x5889c6
    switch (_0x2bdde2) {
      case 0x1:
        return _0x1f12b6
          ? function (_0x108ded) {
              return this['fromWireType'](HEAP8[_0x108ded])
            }
          : function (_0xe6ab69) {
              var _0x46b94a = a0_0x1c46
              return this[_0x46b94a(0x17b)](HEAPU8[_0xe6ab69])
            }
      case 0x2:
        return _0x1f12b6
          ? function (_0xbfd315) {
              var _0x4bbf90 = a0_0x1c46
              return this[_0x4bbf90(0x17b)](HEAP16[_0xbfd315 >> 0x1])
            }
          : function (_0x19cdc9) {
              var _0x8a9bd = a0_0x1c46
              return this[_0x8a9bd(0x17b)](HEAPU16[_0x19cdc9 >> 0x1])
            }
      case 0x4:
        return _0x1f12b6
          ? function (_0x3b9712) {
              var _0x2848cb = a0_0x1c46
              return this[_0x2848cb(0x17b)](HEAP32[_0x3b9712 >> 0x2])
            }
          : function (_0x2c2fd4) {
              var _0x22eb24 = a0_0x1c46
              return this[_0x22eb24(0x17b)](HEAPU32[_0x2c2fd4 >> 0x2])
            }
      default:
        throw new TypeError(
          _0x2d3514(0x23c) + _0x2bdde2 + _0x2d3514(0x3b4) + _0x2b94cb
        )
    }
  },
  __embind_register_enum = (_0xe6f528, _0x523a6a, _0x313aa4, _0x310725) => {
    var _0x3a1e77 = a0_0x5889c6
    _0x523a6a = AsciiToString(_0x523a6a)
    function _0x336645() {}
    ;((_0x336645[_0x3a1e77(0x27f)] = {}),
      registerType(_0xe6f528, {
        name: _0x523a6a,
        constructor: _0x336645,
        fromWireType: function (_0x46a135) {
          var _0x122c7c = _0x3a1e77
          return this[_0x122c7c(0x3ed)]['values'][_0x46a135]
        },
        toWireType: (_0x4d09b3, _0x5c529a) => _0x5c529a['value'],
        readValueFromPointer: enumReadValueFromPointer(
          _0x523a6a,
          _0x313aa4,
          _0x310725
        ),
        destructorFunction: null,
      }),
      exposePublicSymbol(_0x523a6a, _0x336645))
  },
  requireRegisteredType = (_0x26df56, _0x421267) => {
    var _0x20885a = a0_0x5889c6,
      _0xfcc572 = registeredTypes[_0x26df56]
    return (
      undefined === _0xfcc572 &&
        throwBindingError(
          _0x421267 + _0x20885a(0x356) + getTypeName(_0x26df56)
        ),
      _0xfcc572
    )
  },
  __embind_register_enum_value = (_0x184a1c, _0x5a9595, _0x4911f1) => {
    var _0x2f6ce1 = a0_0x5889c6,
      _0x7f1816 = requireRegisteredType(_0x184a1c, _0x2f6ce1(0x1c5))
    _0x5a9595 = AsciiToString(_0x5a9595)
    var _0x454b5f = _0x7f1816[_0x2f6ce1(0x3ed)],
      _0x919864 = Object[_0x2f6ce1(0x218)](
        _0x7f1816['constructor'][_0x2f6ce1(0x276)],
        {
          value: { value: _0x4911f1 },
          constructor: {
            value: createNamedFunction(
              _0x7f1816['name'] + '_' + _0x5a9595,
              function () {}
            ),
          },
        }
      )
    ;((_0x454b5f[_0x2f6ce1(0x27f)][_0x4911f1] = _0x919864),
      (_0x454b5f[_0x5a9595] = _0x919864))
  },
  floatReadValueFromPointer = (_0xf8ba03, _0x4faf02) => {
    var _0x5c9f4e = a0_0x5889c6
    switch (_0x4faf02) {
      case 0x4:
        return function (_0x5e3848) {
          var _0x5271a0 = a0_0x1c46
          return this[_0x5271a0(0x17b)](HEAPF32[_0x5e3848 >> 0x2])
        }
      case 0x8:
        return function (_0x1687e1) {
          var _0x2fc628 = a0_0x1c46
          return this[_0x2fc628(0x17b)](HEAPF64[_0x1687e1 >> 0x3])
        }
      default:
        throw new TypeError(
          _0x5c9f4e(0x41c) + _0x4faf02 + _0x5c9f4e(0x3b4) + _0xf8ba03
        )
    }
  },
  __embind_register_float = (_0x71f8ec, _0x546a01, _0x4aa0a8) => {
    ;((_0x546a01 = AsciiToString(_0x546a01)),
      registerType(_0x71f8ec, {
        name: _0x546a01,
        fromWireType: (_0xf3ef79) => _0xf3ef79,
        toWireType: (_0x2dea4d, _0x5be087) => {
          var _0x41bdaa = a0_0x1c46
          if (
            typeof _0x5be087 != _0x41bdaa(0x236) &&
            typeof _0x5be087 != _0x41bdaa(0x293)
          )
            throw new TypeError(
              _0x41bdaa(0x322) +
                embindRepr(_0x5be087) +
                _0x41bdaa(0x223) +
                this['name']
            )
          return _0x5be087
        },
        readValueFromPointer: floatReadValueFromPointer(_0x546a01, _0x4aa0a8),
        destructorFunction: null,
      }))
  },
  getFunctionName = (_0x5246bd) => {
    var _0x2b334f = a0_0x5889c6
    _0x5246bd = _0x5246bd[_0x2b334f(0x231)]()
    const _0x181e77 = _0x5246bd[_0x2b334f(0x1cf)]('(')
    if (_0x181e77 === -0x1) return _0x5246bd
    return (
      assert(
        _0x5246bd[_0x2b334f(0x265)](')'),
        'Parentheses\x20for\x20argument\x20names\x20should\x20match.'
      ),
      _0x5246bd[_0x2b334f(0x24c)](0x0, _0x181e77)
    )
  },
  __embind_register_function = (
    _0x1051d5,
    _0x495c35,
    _0x3eba27,
    _0x141ee1,
    _0x57ab75,
    _0xc2f9d5,
    _0x5abeb8,
    _0x2c1e4d
  ) => {
    var _0x5b1cfe = heap32VectorToArray(_0x495c35, _0x3eba27)
    ;((_0x1051d5 = AsciiToString(_0x1051d5)),
      (_0x1051d5 = getFunctionName(_0x1051d5)),
      (_0x57ab75 = embind__requireFunction(_0x141ee1, _0x57ab75, _0x5abeb8)),
      exposePublicSymbol(
        _0x1051d5,
        function () {
          var _0x2e0425 = a0_0x1c46
          throwUnboundTypeError(
            _0x2e0425(0x2f3) + _0x1051d5 + _0x2e0425(0x1e4),
            _0x5b1cfe
          )
        },
        _0x495c35 - 0x1
      ),
      whenDependentTypesAreResolved([], _0x5b1cfe, (_0x303e46) => {
        var _0x5d53b0 = a0_0x1c46,
          _0x474c5a = [_0x303e46[0x0], null][_0x5d53b0(0x172)](
            _0x303e46[_0x5d53b0(0x24c)](0x1)
          )
        return (
          replacePublicSymbol(
            _0x1051d5,
            craftInvokerFunction(
              _0x1051d5,
              _0x474c5a,
              null,
              _0x57ab75,
              _0xc2f9d5,
              _0x5abeb8
            ),
            _0x495c35 - 0x1
          ),
          []
        )
      }))
  },
  __embind_register_integer = (
    _0x40f695,
    _0x343a6d,
    _0x1c7e34,
    _0x2586bc,
    _0x1ff261
  ) => {
    _0x343a6d = AsciiToString(_0x343a6d)
    const _0x171acf = _0x2586bc === 0x0
    let _0x272587 = (_0xc86682) => _0xc86682
    if (_0x171acf) {
      var _0x3dc17d = 0x20 - 0x8 * _0x1c7e34
      ;((_0x272587 = (_0x56c96c) => (_0x56c96c << _0x3dc17d) >>> _0x3dc17d),
        (_0x1ff261 = _0x272587(_0x1ff261)))
    }
    registerType(_0x40f695, {
      name: _0x343a6d,
      fromWireType: _0x272587,
      toWireType: (_0x2f7fb3, _0x5ee9a0) => {
        var _0x3960b6 = a0_0x1c46
        if (
          typeof _0x5ee9a0 != _0x3960b6(0x236) &&
          typeof _0x5ee9a0 != 'boolean'
        )
          throw new TypeError(
            'Cannot\x20convert\x20\x22' +
              embindRepr(_0x5ee9a0) +
              _0x3960b6(0x2b1) +
              _0x343a6d
          )
        return (
          assertIntegerRange(_0x343a6d, _0x5ee9a0, _0x2586bc, _0x1ff261),
          _0x5ee9a0
        )
      },
      readValueFromPointer: integerReadValueFromPointer(
        _0x343a6d,
        _0x1c7e34,
        _0x2586bc !== 0x0
      ),
      destructorFunction: null,
    })
  },
  __embind_register_memory_view = (_0x3401b6, _0x209307, _0x5a8915) => {
    var _0x4154ad = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        BigInt64Array,
        BigUint64Array,
      ],
      _0x35b8c7 = _0x4154ad[_0x209307]
    function _0x38c8ec(_0x4c1458) {
      var _0x300f20 = a0_0x1c46,
        _0x222644 = HEAPU32[_0x4c1458 >> 0x2],
        _0x54f685 = HEAPU32[(_0x4c1458 + 0x4) >> 0x2]
      return new _0x35b8c7(HEAP8[_0x300f20(0x243)], _0x54f685, _0x222644)
    }
    ;((_0x5a8915 = AsciiToString(_0x5a8915)),
      registerType(
        _0x3401b6,
        {
          name: _0x5a8915,
          fromWireType: _0x38c8ec,
          readValueFromPointer: _0x38c8ec,
        },
        { ignoreDuplicateRegistrations: !![] }
      ))
  },
  __embind_register_smart_ptr = (
    _0x2a2c12,
    _0x5e279c,
    _0x509d3e,
    _0x400111,
    _0x12502c,
    _0x13975e,
    _0x20e364,
    _0x14dd37,
    _0x128eea,
    _0x4c531a,
    _0x52576f,
    _0x5e57cd
  ) => {
    ;((_0x509d3e = AsciiToString(_0x509d3e)),
      (_0x13975e = embind__requireFunction(_0x12502c, _0x13975e)),
      (_0x14dd37 = embind__requireFunction(_0x20e364, _0x14dd37)),
      (_0x4c531a = embind__requireFunction(_0x128eea, _0x4c531a)),
      (_0x5e57cd = embind__requireFunction(_0x52576f, _0x5e57cd)),
      whenDependentTypesAreResolved([_0x2a2c12], [_0x5e279c], (_0x4a8d43) => {
        var _0x451128 = a0_0x1c46
        _0x4a8d43 = _0x4a8d43[0x0]
        var _0x140f97 = new RegisteredPointer(
          _0x509d3e,
          _0x4a8d43[_0x451128(0x370)],
          ![],
          ![],
          !![],
          _0x4a8d43,
          _0x400111,
          _0x13975e,
          _0x14dd37,
          _0x4c531a,
          _0x5e57cd
        )
        return [_0x140f97]
      }))
  },
  stringToUTF8Array = (_0x13a65e, _0x33a864, _0x2ac240, _0x544372) => {
    var _0x14c406 = a0_0x5889c6
    assert(
      typeof _0x13a65e === _0x14c406(0x21f),
      _0x14c406(0x12a) + typeof _0x13a65e + ')'
    )
    if (!(_0x544372 > 0x0)) return 0x0
    var _0x2004d4 = _0x2ac240,
      _0x11c7ab = _0x2ac240 + _0x544372 - 0x1
    for (
      var _0x2e863e = 0x0;
      _0x2e863e < _0x13a65e[_0x14c406(0x308)];
      ++_0x2e863e
    ) {
      var _0x246479 = _0x13a65e[_0x14c406(0x259)](_0x2e863e)
      if (_0x246479 <= 0x7f) {
        if (_0x2ac240 >= _0x11c7ab) break
        _0x33a864[_0x2ac240++] = _0x246479
      } else {
        if (_0x246479 <= 0x7ff) {
          if (_0x2ac240 + 0x1 >= _0x11c7ab) break
          ;((_0x33a864[_0x2ac240++] = 0xc0 | (_0x246479 >> 0x6)),
            (_0x33a864[_0x2ac240++] = 0x80 | (_0x246479 & 0x3f)))
        } else {
          if (_0x246479 <= 0xffff) {
            if (_0x2ac240 + 0x2 >= _0x11c7ab) break
            ;((_0x33a864[_0x2ac240++] = 0xe0 | (_0x246479 >> 0xc)),
              (_0x33a864[_0x2ac240++] = 0x80 | ((_0x246479 >> 0x6) & 0x3f)),
              (_0x33a864[_0x2ac240++] = 0x80 | (_0x246479 & 0x3f)))
          } else {
            if (_0x2ac240 + 0x3 >= _0x11c7ab) break
            if (_0x246479 > 0x10ffff)
              warnOnce(
                _0x14c406(0x3de) + ptrToString(_0x246479) + _0x14c406(0x34d)
              )
            ;((_0x33a864[_0x2ac240++] = 0xf0 | (_0x246479 >> 0x12)),
              (_0x33a864[_0x2ac240++] = 0x80 | ((_0x246479 >> 0xc) & 0x3f)),
              (_0x33a864[_0x2ac240++] = 0x80 | ((_0x246479 >> 0x6) & 0x3f)),
              (_0x33a864[_0x2ac240++] = 0x80 | (_0x246479 & 0x3f)),
              _0x2e863e++)
          }
        }
      }
    }
    return ((_0x33a864[_0x2ac240] = 0x0), _0x2ac240 - _0x2004d4)
  },
  stringToUTF8 = (_0x4bd00e, _0x270df0, _0x433d20) => {
    var _0x14357a = a0_0x5889c6
    return (
      assert(typeof _0x433d20 == _0x14357a(0x236), _0x14357a(0x378)),
      stringToUTF8Array(_0x4bd00e, HEAPU8, _0x270df0, _0x433d20)
    )
  },
  lengthBytesUTF8 = (_0x3f1769) => {
    var _0xa81ba8 = a0_0x5889c6,
      _0x386c35 = 0x0
    for (
      var _0x1c0b02 = 0x0;
      _0x1c0b02 < _0x3f1769[_0xa81ba8(0x308)];
      ++_0x1c0b02
    ) {
      var _0x5bff9c = _0x3f1769['charCodeAt'](_0x1c0b02)
      if (_0x5bff9c <= 0x7f) _0x386c35++
      else {
        if (_0x5bff9c <= 0x7ff) _0x386c35 += 0x2
        else
          _0x5bff9c >= 0xd800 && _0x5bff9c <= 0xdfff
            ? ((_0x386c35 += 0x4), ++_0x1c0b02)
            : (_0x386c35 += 0x3)
      }
    }
    return _0x386c35
  },
  __embind_register_std_string = (_0x39b769, _0x516865) => {
    _0x516865 = AsciiToString(_0x516865)
    var _0x8c1999 = !![]
    registerType(_0x39b769, {
      name: _0x516865,
      fromWireType(_0x442f42) {
        var _0x40537a = a0_0x1c46,
          _0x41e1de = HEAPU32[_0x442f42 >> 0x2],
          _0xddd2e5 = _0x442f42 + 0x4,
          _0x54bfea
        if (_0x8c1999) _0x54bfea = UTF8ToString(_0xddd2e5, _0x41e1de, !![])
        else {
          _0x54bfea = ''
          for (var _0x402858 = 0x0; _0x402858 < _0x41e1de; ++_0x402858) {
            _0x54bfea += String[_0x40537a(0x266)](HEAPU8[_0xddd2e5 + _0x402858])
          }
        }
        return (_free(_0x442f42), _0x54bfea)
      },
      toWireType(_0x41a9f8, _0x380873) {
        var _0x5c5bfe = a0_0x1c46
        _0x380873 instanceof ArrayBuffer &&
          (_0x380873 = new Uint8Array(_0x380873))
        var _0x4917d7,
          _0xe67844 = typeof _0x380873 == _0x5c5bfe(0x21f)
        !(
          _0xe67844 ||
          (ArrayBuffer[_0x5c5bfe(0x328)](_0x380873) &&
            _0x380873[_0x5c5bfe(0x2d8)] == 0x1)
        ) && throwBindingError(_0x5c5bfe(0x3cf))
        _0x8c1999 && _0xe67844
          ? (_0x4917d7 = lengthBytesUTF8(_0x380873))
          : (_0x4917d7 = _0x380873['length'])
        var _0x1c46d5 = _malloc(0x4 + _0x4917d7 + 0x1),
          _0x27b1e5 = _0x1c46d5 + 0x4
        ;((HEAPU32[_0x1c46d5 >> 0x2] = _0x4917d7), checkInt32(_0x4917d7))
        if (_0xe67844) {
          if (_0x8c1999) stringToUTF8(_0x380873, _0x27b1e5, _0x4917d7 + 0x1)
          else
            for (var _0x40b90f = 0x0; _0x40b90f < _0x4917d7; ++_0x40b90f) {
              var _0x386e77 = _0x380873[_0x5c5bfe(0x15a)](_0x40b90f)
              ;(_0x386e77 > 0xff &&
                (_free(_0x1c46d5), throwBindingError(_0x5c5bfe(0x32c))),
                (HEAPU8[_0x27b1e5 + _0x40b90f] = _0x386e77))
            }
        } else HEAPU8[_0x5c5bfe(0x125)](_0x380873, _0x27b1e5)
        return (
          _0x41a9f8 !== null && _0x41a9f8[_0x5c5bfe(0x364)](_free, _0x1c46d5),
          _0x1c46d5
        )
      },
      readValueFromPointer: readPointer,
      destructorFunction(_0x5d8ed5) {
        _free(_0x5d8ed5)
      },
    })
  },
  UTF16Decoder =
    typeof TextDecoder != 'undefined'
      ? new TextDecoder(a0_0x5889c6(0x230))
      : undefined,
  UTF16ToString = (_0x2a6a74, _0xef0073, _0x23efff) => {
    var _0x4403d5 = a0_0x5889c6
    assert(_0x2a6a74 % 0x2 == 0x0, _0x4403d5(0x332))
    var _0x413df8 = _0x2a6a74 >> 0x1,
      _0x268ea4 = findStringEnd(HEAPU16, _0x413df8, _0xef0073 / 0x2, _0x23efff)
    if (_0x268ea4 - _0x413df8 > 0x10 && UTF16Decoder)
      return UTF16Decoder[_0x4403d5(0x37d)](
        HEAPU16['subarray'](_0x413df8, _0x268ea4)
      )
    var _0x1fe29f = ''
    for (var _0xa9f975 = _0x413df8; _0xa9f975 < _0x268ea4; ++_0xa9f975) {
      var _0x377ae0 = HEAPU16[_0xa9f975]
      _0x1fe29f += String[_0x4403d5(0x266)](_0x377ae0)
    }
    return _0x1fe29f
  },
  stringToUTF16 = (_0x14f70f, _0x7f851d, _0x4c2b22) => {
    var _0x3e2486 = a0_0x5889c6
    ;(assert(_0x7f851d % 0x2 == 0x0, _0x3e2486(0x2e9)),
      assert(typeof _0x4c2b22 == _0x3e2486(0x236), _0x3e2486(0x199)),
      (_0x4c2b22 ??= 0x7fffffff))
    if (_0x4c2b22 < 0x2) return 0x0
    _0x4c2b22 -= 0x2
    var _0x59778c = _0x7f851d,
      _0x281d9d =
        _0x4c2b22 < _0x14f70f[_0x3e2486(0x308)] * 0x2
          ? _0x4c2b22 / 0x2
          : _0x14f70f[_0x3e2486(0x308)]
    for (var _0x2855ff = 0x0; _0x2855ff < _0x281d9d; ++_0x2855ff) {
      var _0x377c9f = _0x14f70f['charCodeAt'](_0x2855ff)
      ;((HEAP16[_0x7f851d >> 0x1] = _0x377c9f),
        checkInt16(_0x377c9f),
        (_0x7f851d += 0x2))
    }
    return (
      (HEAP16[_0x7f851d >> 0x1] = 0x0),
      checkInt16(0x0),
      _0x7f851d - _0x59778c
    )
  },
  lengthBytesUTF16 = (_0x12ce5e) => _0x12ce5e[a0_0x5889c6(0x308)] * 0x2,
  UTF32ToString = (_0x5daeee, _0x2f398b, _0x2fb657) => {
    var _0x3e1673 = a0_0x5889c6
    assert(_0x5daeee % 0x4 == 0x0, _0x3e1673(0x31c))
    var _0x42e8d1 = '',
      _0x10d295 = _0x5daeee >> 0x2
    for (var _0x73593d = 0x0; !(_0x73593d >= _0x2f398b / 0x4); _0x73593d++) {
      var _0x369237 = HEAPU32[_0x10d295 + _0x73593d]
      if (!_0x369237 && !_0x2fb657) break
      _0x42e8d1 += String[_0x3e1673(0x203)](_0x369237)
    }
    return _0x42e8d1
  },
  stringToUTF32 = (_0x1c23d2, _0x1740f1, _0x438fce) => {
    var _0x46613b = a0_0x5889c6
    ;(assert(_0x1740f1 % 0x4 == 0x0, _0x46613b(0x23e)),
      assert(typeof _0x438fce == _0x46613b(0x236), _0x46613b(0x39b)),
      (_0x438fce ??= 0x7fffffff))
    if (_0x438fce < 0x4) return 0x0
    var _0x5f1b39 = _0x1740f1,
      _0x41405a = _0x5f1b39 + _0x438fce - 0x4
    for (var _0x502c15 = 0x0; _0x502c15 < _0x1c23d2['length']; ++_0x502c15) {
      var _0x42d046 = _0x1c23d2[_0x46613b(0x259)](_0x502c15)
      _0x42d046 > 0xffff && _0x502c15++
      ;((HEAP32[_0x1740f1 >> 0x2] = _0x42d046),
        checkInt32(_0x42d046),
        (_0x1740f1 += 0x4))
      if (_0x1740f1 + 0x4 > _0x41405a) break
    }
    return (
      (HEAP32[_0x1740f1 >> 0x2] = 0x0),
      checkInt32(0x0),
      _0x1740f1 - _0x5f1b39
    )
  },
  lengthBytesUTF32 = (_0x349e12) => {
    var _0x2ca822 = 0x0
    for (var _0x3b9989 = 0x0; _0x3b9989 < _0x349e12['length']; ++_0x3b9989) {
      var _0x5896fb = _0x349e12['codePointAt'](_0x3b9989)
      ;(_0x5896fb > 0xffff && _0x3b9989++, (_0x2ca822 += 0x4))
    }
    return _0x2ca822
  },
  __embind_register_std_wstring = (_0x890bf0, _0x1f7b1a, _0x1b399d) => {
    var _0x307fb3 = a0_0x5889c6
    _0x1b399d = AsciiToString(_0x1b399d)
    var _0x5c5c1d, _0x12f60d, _0x51facc
    ;(_0x1f7b1a === 0x2
      ? ((_0x5c5c1d = UTF16ToString),
        (_0x12f60d = stringToUTF16),
        (_0x51facc = lengthBytesUTF16))
      : (assert(_0x1f7b1a === 0x4, _0x307fb3(0x156)),
        (_0x5c5c1d = UTF32ToString),
        (_0x12f60d = stringToUTF32),
        (_0x51facc = lengthBytesUTF32)),
      registerType(_0x890bf0, {
        name: _0x1b399d,
        fromWireType: (_0x50b8d5) => {
          var _0x170114 = HEAPU32[_0x50b8d5 >> 0x2],
            _0x37b7e6 = _0x5c5c1d(_0x50b8d5 + 0x4, _0x170114 * _0x1f7b1a, !![])
          return (_free(_0x50b8d5), _0x37b7e6)
        },
        toWireType: (_0x3f60f6, _0x129c66) => {
          var _0x2af26f = _0x307fb3
          !(typeof _0x129c66 == _0x2af26f(0x21f)) &&
            throwBindingError(
              'Cannot\x20pass\x20non-string\x20to\x20C++\x20string\x20type\x20' +
                _0x1b399d
            )
          var _0x53b11d = _0x51facc(_0x129c66),
            _0x47a16f = _malloc(0x4 + _0x53b11d + _0x1f7b1a)
          return (
            (HEAPU32[_0x47a16f >> 0x2] = _0x53b11d / _0x1f7b1a),
            checkInt32(_0x53b11d / _0x1f7b1a),
            _0x12f60d(_0x129c66, _0x47a16f + 0x4, _0x53b11d + _0x1f7b1a),
            _0x3f60f6 !== null && _0x3f60f6[_0x2af26f(0x364)](_free, _0x47a16f),
            _0x47a16f
          )
        },
        readValueFromPointer: readPointer,
        destructorFunction(_0x4ab820) {
          _free(_0x4ab820)
        },
      }))
  },
  __embind_register_value_object = (
    _0xee6be9,
    _0x5e8dd7,
    _0x36764a,
    _0x449251,
    _0x55c135,
    _0x2b1a58
  ) => {
    structRegistrations[_0xee6be9] = {
      name: AsciiToString(_0x5e8dd7),
      rawConstructor: embind__requireFunction(_0x36764a, _0x449251),
      rawDestructor: embind__requireFunction(_0x55c135, _0x2b1a58),
      fields: [],
    }
  },
  __embind_register_value_object_field = (
    _0x26f2d3,
    _0x3a01ec,
    _0x3570c,
    _0x44b751,
    _0x3f77a1,
    _0x396243,
    _0x39d530,
    _0x5e6ed0,
    _0x2944cd,
    _0x17bc8f
  ) => {
    var _0x1f012c = a0_0x5889c6
    structRegistrations[_0x26f2d3][_0x1f012c(0x14d)]['push']({
      fieldName: AsciiToString(_0x3a01ec),
      getterReturnType: _0x3570c,
      getter: embind__requireFunction(_0x44b751, _0x3f77a1),
      getterContext: _0x396243,
      setterArgumentType: _0x39d530,
      setter: embind__requireFunction(_0x5e6ed0, _0x2944cd),
      setterContext: _0x17bc8f,
    })
  },
  __embind_register_void = (_0x27fbac, _0x400d6a) => {
    ;((_0x400d6a = AsciiToString(_0x400d6a)),
      registerType(_0x27fbac, {
        isVoid: !![],
        name: _0x400d6a,
        fromWireType: () => undefined,
        toWireType: (_0x5b49cc, _0xf2c921) => undefined,
      }))
  }
function __emscripten_fetch_get_response_headers(
  _0x411c6f,
  _0x5b38d4,
  _0x443ea6
) {
  var _0x545c9b = a0_0x5889c6,
    _0x5a1ec0 = Fetch[_0x545c9b(0x2a0)]['get'](_0x411c6f)[_0x545c9b(0x1c9)]()
  return stringToUTF8(_0x5a1ec0, _0x5b38d4, _0x443ea6) + 0x1
}
function __emscripten_fetch_get_response_headers_length(_0x176eb2) {
  var _0x450618 = a0_0x5889c6
  return lengthBytesUTF8(
    Fetch['xhrs'][_0x450618(0x2dc)](_0x176eb2)[_0x450618(0x1c9)]()
  )
}
var emval_methodCallers = [],
  emval_addMethodCaller = (_0x1c63e0) => {
    var _0x392c56 = a0_0x5889c6,
      _0xd9c475 = emval_methodCallers[_0x392c56(0x308)]
    return (emval_methodCallers['push'](_0x1c63e0), _0xd9c475)
  },
  emval_lookupTypes = (_0x1f589b, _0x494e9f) => {
    var _0x4d7e59 = new Array(_0x1f589b)
    for (var _0x12309f = 0x0; _0x12309f < _0x1f589b; ++_0x12309f) {
      _0x4d7e59[_0x12309f] = requireRegisteredType(
        HEAPU32[(_0x494e9f + _0x12309f * 0x4) >> 0x2],
        'parameter\x20' + _0x12309f
      )
    }
    return _0x4d7e59
  },
  emval_returnValue = (_0x2b9dc8, _0x3df0ba, _0x4d4f15) => {
    var _0x49468b = a0_0x5889c6,
      _0x46e85c = [],
      _0x50be14 = _0x2b9dc8(_0x46e85c, _0x4d4f15)
    return (
      _0x46e85c[_0x49468b(0x308)] &&
        (HEAPU32[_0x3df0ba >> 0x2] = Emval[_0x49468b(0x32d)](_0x46e85c)),
      _0x50be14
    )
  },
  emval_symbols = {},
  getStringOrSymbol = (_0x53aa1c) => {
    var _0x3d50e8 = emval_symbols[_0x53aa1c]
    if (_0x3d50e8 === undefined) return AsciiToString(_0x53aa1c)
    return _0x3d50e8
  },
  __emval_create_invoker = (_0x368f42, _0x3b57ed, _0x382c87) => {
    var _0x33e42c = a0_0x5889c6,
      _0xa0fd75 = 0x8,
      [_0x147381, ..._0x4c0e3c] = emval_lookupTypes(_0x368f42, _0x3b57ed),
      _0xe599cd = _0x147381[_0x33e42c(0x21d)][_0x33e42c(0x299)](_0x147381),
      _0x1e2592 = _0x4c0e3c['map']((_0x19f039) =>
        _0x19f039['readValueFromPointer']['bind'](_0x19f039)
      )
    _0x368f42--
    var _0x5a60a1 = new Array(_0x368f42),
      _0x28a944 = (_0x301535, _0x25657a, _0x179ee9, _0x4ab43c) => {
        var _0x2695fa = _0x33e42c,
          _0x129552 = 0x0
        for (var _0x3d20a0 = 0x0; _0x3d20a0 < _0x368f42; ++_0x3d20a0) {
          ;((_0x5a60a1[_0x3d20a0] = _0x1e2592[_0x3d20a0](
            _0x4ab43c + _0x129552
          )),
            (_0x129552 += _0xa0fd75))
        }
        var _0x4fc961
        switch (_0x382c87) {
          case 0x0:
            _0x4fc961 = Emval[_0x2695fa(0x132)](_0x301535)['apply'](
              null,
              _0x5a60a1
            )
            break
          case 0x2:
            _0x4fc961 = Reflect[_0x2695fa(0x300)](
              Emval[_0x2695fa(0x132)](_0x301535),
              _0x5a60a1
            )
            break
          case 0x3:
            _0x4fc961 = _0x5a60a1[0x0]
            break
          case 0x1:
            _0x4fc961 = Emval[_0x2695fa(0x132)](_0x301535)[
              getStringOrSymbol(_0x25657a)
            ](..._0x5a60a1)
            break
        }
        return emval_returnValue(_0xe599cd, _0x179ee9, _0x4fc961)
      },
      _0x188203 =
        _0x33e42c(0x2f1) +
        _0x4c0e3c['map']((_0x41641e) => _0x41641e['name']) +
        _0x33e42c(0x206) +
        _0x147381['name'] +
        '>'
    return emval_addMethodCaller(createNamedFunction(_0x188203, _0x28a944))
  },
  __emval_equals = (_0x80d492, _0xe48f7a) => {
    var _0x16eef6 = a0_0x5889c6
    return (
      (_0x80d492 = Emval[_0x16eef6(0x132)](_0x80d492)),
      (_0xe48f7a = Emval[_0x16eef6(0x132)](_0xe48f7a)),
      _0x80d492 == _0xe48f7a
    )
  },
  emval_get_global = () => globalThis,
  __emval_get_global = (_0xdf494f) => {
    var _0x4c8fb3 = a0_0x5889c6
    return _0xdf494f === 0x0
      ? Emval[_0x4c8fb3(0x32d)](emval_get_global())
      : ((_0xdf494f = getStringOrSymbol(_0xdf494f)),
        Emval['toHandle'](emval_get_global()[_0xdf494f]))
  },
  __emval_get_module_property = (_0x10a182) => {
    var _0x17e81e = a0_0x5889c6
    return (
      (_0x10a182 = getStringOrSymbol(_0x10a182)),
      Emval[_0x17e81e(0x32d)](Module[_0x10a182])
    )
  },
  __emval_get_property = (_0x3e6bff, _0x8a2bde) => {
    var _0x250fb5 = a0_0x5889c6
    return (
      (_0x3e6bff = Emval['toValue'](_0x3e6bff)),
      (_0x8a2bde = Emval[_0x250fb5(0x132)](_0x8a2bde)),
      Emval[_0x250fb5(0x32d)](_0x3e6bff[_0x8a2bde])
    )
  },
  __emval_incref = (_0x4d6878) => {
    _0x4d6878 > 0x9 && (emval_handles[_0x4d6878 + 0x1] += 0x1)
  },
  __emval_instanceof = (_0x24d296, _0x1318f0) => {
    var _0x408b04 = a0_0x5889c6
    return (
      (_0x24d296 = Emval[_0x408b04(0x132)](_0x24d296)),
      (_0x1318f0 = Emval[_0x408b04(0x132)](_0x1318f0)),
      _0x24d296 instanceof _0x1318f0
    )
  },
  __emval_invoke = (_0xdc6491, _0x163d33, _0x41142a, _0x59749c, _0x4833c0) =>
    emval_methodCallers[_0xdc6491](_0x163d33, _0x41142a, _0x59749c, _0x4833c0),
  __emval_is_number = (_0x1b9287) => {
    var _0x22debc = a0_0x5889c6
    return (
      (_0x1b9287 = Emval[_0x22debc(0x132)](_0x1b9287)),
      typeof _0x1b9287 == _0x22debc(0x236)
    )
  },
  __emval_new_array = () => Emval['toHandle']([]),
  __emval_new_cstring = (_0x2911a8) =>
    Emval[a0_0x5889c6(0x32d)](getStringOrSymbol(_0x2911a8)),
  __emval_new_object = () => Emval[a0_0x5889c6(0x32d)]({}),
  __emval_run_destructors = (_0x595ac0) => {
    var _0x2aa3d2 = a0_0x5889c6,
      _0x561186 = Emval[_0x2aa3d2(0x132)](_0x595ac0)
    ;(runDestructors(_0x561186), __emval_decref(_0x595ac0))
  },
  __emval_set_property = (_0x302012, _0x59b273, _0x7e0931) => {
    var _0x5382b3 = a0_0x5889c6
    ;((_0x302012 = Emval['toValue'](_0x302012)),
      (_0x59b273 = Emval['toValue'](_0x59b273)),
      (_0x7e0931 = Emval[_0x5382b3(0x132)](_0x7e0931)),
      (_0x302012[_0x59b273] = _0x7e0931))
  },
  __emval_typeof = (_0x52507c) => {
    return (
      (_0x52507c = Emval['toValue'](_0x52507c)),
      Emval['toHandle'](typeof _0x52507c)
    )
  },
  INT53_MAX = 0x20000000000000,
  INT53_MIN = -0x20000000000000,
  bigintToI53Checked = (_0x586ad0) =>
    _0x586ad0 < INT53_MIN || _0x586ad0 > INT53_MAX ? NaN : Number(_0x586ad0)
function __gmtime_js(_0x17df5e, _0x454ee1) {
  var _0x58600f = a0_0x5889c6
  _0x17df5e = bigintToI53Checked(_0x17df5e)
  var _0x24089d = new Date(_0x17df5e * 0x3e8)
  ;((HEAP32[_0x454ee1 >> 0x2] = _0x24089d[_0x58600f(0x362)]()),
    checkInt32(_0x24089d[_0x58600f(0x362)]()),
    (HEAP32[(_0x454ee1 + 0x4) >> 0x2] = _0x24089d[_0x58600f(0x2c6)]()),
    checkInt32(_0x24089d[_0x58600f(0x2c6)]()),
    (HEAP32[(_0x454ee1 + 0x8) >> 0x2] = _0x24089d[_0x58600f(0x212)]()),
    checkInt32(_0x24089d[_0x58600f(0x212)]()),
    (HEAP32[(_0x454ee1 + 0xc) >> 0x2] = _0x24089d[_0x58600f(0x25d)]()),
    checkInt32(_0x24089d['getUTCDate']()),
    (HEAP32[(_0x454ee1 + 0x10) >> 0x2] = _0x24089d[_0x58600f(0x2b6)]()),
    checkInt32(_0x24089d['getUTCMonth']()),
    (HEAP32[(_0x454ee1 + 0x14) >> 0x2] = _0x24089d[_0x58600f(0x38c)]() - 0x76c),
    checkInt32(_0x24089d['getUTCFullYear']() - 0x76c),
    (HEAP32[(_0x454ee1 + 0x18) >> 0x2] = _0x24089d[_0x58600f(0x18b)]()),
    checkInt32(_0x24089d[_0x58600f(0x18b)]()))
  var _0x1b4efd = Date[_0x58600f(0x2cc)](
      _0x24089d[_0x58600f(0x38c)](),
      0x0,
      0x1,
      0x0,
      0x0,
      0x0,
      0x0
    ),
    _0x24b36d =
      ((_0x24089d[_0x58600f(0x28a)]() - _0x1b4efd) /
        (0x3e8 * 0x3c * 0x3c * 0x18)) |
      0x0
  ;((HEAP32[(_0x454ee1 + 0x1c) >> 0x2] = _0x24b36d), checkInt32(_0x24b36d))
}
var isLeapYear = (_0x5c4395) =>
    _0x5c4395 % 0x4 === 0x0 &&
    (_0x5c4395 % 0x64 !== 0x0 || _0x5c4395 % 0x190 === 0x0),
  MONTH_DAYS_LEAP_CUMULATIVE = [
    0x0, 0x1f, 0x3c, 0x5b, 0x79, 0x98, 0xb6, 0xd5, 0xf4, 0x112, 0x131, 0x14f,
  ],
  MONTH_DAYS_REGULAR_CUMULATIVE = [
    0x0, 0x1f, 0x3b, 0x5a, 0x78, 0x97, 0xb5, 0xd4, 0xf3, 0x111, 0x130, 0x14e,
  ],
  ydayFromDate = (_0x2d0afd) => {
    var _0x413662 = a0_0x5889c6,
      _0x494359 = isLeapYear(_0x2d0afd['getFullYear']()),
      _0x49338c = _0x494359
        ? MONTH_DAYS_LEAP_CUMULATIVE
        : MONTH_DAYS_REGULAR_CUMULATIVE,
      _0x5398ad =
        _0x49338c[_0x2d0afd[_0x413662(0x3cb)]()] +
        _0x2d0afd[_0x413662(0x18d)]() -
        0x1
    return _0x5398ad
  }
function __localtime_js(_0x6ec2b1, _0x13902e) {
  var _0x1d95fd = a0_0x5889c6
  _0x6ec2b1 = bigintToI53Checked(_0x6ec2b1)
  var _0x3fe5b8 = new Date(_0x6ec2b1 * 0x3e8)
  ;((HEAP32[_0x13902e >> 0x2] = _0x3fe5b8[_0x1d95fd(0x13b)]()),
    checkInt32(_0x3fe5b8['getSeconds']()),
    (HEAP32[(_0x13902e + 0x4) >> 0x2] = _0x3fe5b8[_0x1d95fd(0x1ed)]()),
    checkInt32(_0x3fe5b8[_0x1d95fd(0x1ed)]()),
    (HEAP32[(_0x13902e + 0x8) >> 0x2] = _0x3fe5b8[_0x1d95fd(0x1ba)]()),
    checkInt32(_0x3fe5b8[_0x1d95fd(0x1ba)]()),
    (HEAP32[(_0x13902e + 0xc) >> 0x2] = _0x3fe5b8[_0x1d95fd(0x18d)]()),
    checkInt32(_0x3fe5b8['getDate']()),
    (HEAP32[(_0x13902e + 0x10) >> 0x2] = _0x3fe5b8[_0x1d95fd(0x3cb)]()),
    checkInt32(_0x3fe5b8[_0x1d95fd(0x3cb)]()),
    (HEAP32[(_0x13902e + 0x14) >> 0x2] = _0x3fe5b8[_0x1d95fd(0x27e)]() - 0x76c),
    checkInt32(_0x3fe5b8[_0x1d95fd(0x27e)]() - 0x76c),
    (HEAP32[(_0x13902e + 0x18) >> 0x2] = _0x3fe5b8[_0x1d95fd(0x2e3)]()),
    checkInt32(_0x3fe5b8['getDay']()))
  var _0x496f8a = ydayFromDate(_0x3fe5b8) | 0x0
  ;((HEAP32[(_0x13902e + 0x1c) >> 0x2] = _0x496f8a),
    checkInt32(_0x496f8a),
    (HEAP32[(_0x13902e + 0x24) >> 0x2] = -(
      _0x3fe5b8[_0x1d95fd(0x20a)]() * 0x3c
    )),
    checkInt32(-(_0x3fe5b8['getTimezoneOffset']() * 0x3c)))
  var _0x411e88 = new Date(_0x3fe5b8[_0x1d95fd(0x27e)](), 0x0, 0x1),
    _0x23070d = new Date(_0x3fe5b8[_0x1d95fd(0x27e)](), 0x6, 0x1)[
      _0x1d95fd(0x20a)
    ](),
    _0x4e7aa7 = _0x411e88[_0x1d95fd(0x20a)](),
    _0x1af1b4 =
      (_0x23070d != _0x4e7aa7 &&
        _0x3fe5b8[_0x1d95fd(0x20a)]() ==
          Math[_0x1d95fd(0x290)](_0x4e7aa7, _0x23070d)) | 0x0
  ;((HEAP32[(_0x13902e + 0x20) >> 0x2] = _0x1af1b4), checkInt32(_0x1af1b4))
}
var __mktime_js = function (_0x594f17) {
  var _0x2bae4f = (() => {
    var _0x156b37 = a0_0x1c46,
      _0x628b91 = new Date(
        HEAP32[(_0x594f17 + 0x14) >> 0x2] + 0x76c,
        HEAP32[(_0x594f17 + 0x10) >> 0x2],
        HEAP32[(_0x594f17 + 0xc) >> 0x2],
        HEAP32[(_0x594f17 + 0x8) >> 0x2],
        HEAP32[(_0x594f17 + 0x4) >> 0x2],
        HEAP32[_0x594f17 >> 0x2],
        0x0
      ),
      _0x4ebf2d = HEAP32[(_0x594f17 + 0x20) >> 0x2],
      _0x40d11d = _0x628b91[_0x156b37(0x20a)](),
      _0x45d4eb = new Date(_0x628b91[_0x156b37(0x27e)](), 0x0, 0x1),
      _0xf3cc0b = new Date(_0x628b91[_0x156b37(0x27e)](), 0x6, 0x1)[
        _0x156b37(0x20a)
      ](),
      _0x189202 = _0x45d4eb[_0x156b37(0x20a)](),
      _0x7db037 = Math[_0x156b37(0x290)](_0x189202, _0xf3cc0b)
    if (_0x4ebf2d < 0x0)
      ((HEAP32[(_0x594f17 + 0x20) >> 0x2] = Number(
        _0xf3cc0b != _0x189202 && _0x7db037 == _0x40d11d
      )),
        checkInt32(Number(_0xf3cc0b != _0x189202 && _0x7db037 == _0x40d11d)))
    else {
      if (_0x4ebf2d > 0x0 != (_0x7db037 == _0x40d11d)) {
        var _0x46671a = Math[_0x156b37(0x204)](_0x189202, _0xf3cc0b),
          _0x3cbbc8 = _0x4ebf2d > 0x0 ? _0x7db037 : _0x46671a
        _0x628b91[_0x156b37(0x29b)](
          _0x628b91['getTime']() + (_0x3cbbc8 - _0x40d11d) * 0xea60
        )
      }
    }
    ;((HEAP32[(_0x594f17 + 0x18) >> 0x2] = _0x628b91[_0x156b37(0x2e3)]()),
      checkInt32(_0x628b91[_0x156b37(0x2e3)]()))
    var _0x103e1a = ydayFromDate(_0x628b91) | 0x0
    ;((HEAP32[(_0x594f17 + 0x1c) >> 0x2] = _0x103e1a),
      checkInt32(_0x103e1a),
      (HEAP32[_0x594f17 >> 0x2] = _0x628b91[_0x156b37(0x13b)]()),
      checkInt32(_0x628b91[_0x156b37(0x13b)]()),
      (HEAP32[(_0x594f17 + 0x4) >> 0x2] = _0x628b91['getMinutes']()),
      checkInt32(_0x628b91[_0x156b37(0x1ed)]()),
      (HEAP32[(_0x594f17 + 0x8) >> 0x2] = _0x628b91[_0x156b37(0x1ba)]()),
      checkInt32(_0x628b91['getHours']()),
      (HEAP32[(_0x594f17 + 0xc) >> 0x2] = _0x628b91[_0x156b37(0x18d)]()),
      checkInt32(_0x628b91[_0x156b37(0x18d)]()),
      (HEAP32[(_0x594f17 + 0x10) >> 0x2] = _0x628b91[_0x156b37(0x3cb)]()),
      checkInt32(_0x628b91[_0x156b37(0x3cb)]()),
      (HEAP32[(_0x594f17 + 0x14) >> 0x2] = _0x628b91['getYear']()),
      checkInt32(_0x628b91[_0x156b37(0x1a0)]()))
    var _0x4c5b80 = _0x628b91[_0x156b37(0x28a)]()
    if (isNaN(_0x4c5b80)) return -0x1
    return _0x4c5b80 / 0x3e8
  })()
  return BigInt(_0x2bae4f)
}
function __mmap_js(
  _0x327dfc,
  _0x594147,
  _0x15b0a1,
  _0x3726f5,
  _0x334dff,
  _0xcb72eb,
  _0x552e16
) {
  return ((_0x334dff = bigintToI53Checked(_0x334dff)), -0x34)
}
function __munmap_js(
  _0x27ef39,
  _0x5de912,
  _0x38e921,
  _0x2a043a,
  _0x330184,
  _0x3c220a
) {
  _0x3c220a = bigintToI53Checked(_0x3c220a)
}
var __tzset_js = (_0x382334, _0x25a289, _0x16a740, _0x4903e5) => {
    var _0x4d2984 = a0_0x5889c6,
      _0x2038df = new Date()[_0x4d2984(0x27e)](),
      _0xf4bc6f = new Date(_0x2038df, 0x0, 0x1),
      _0x479f95 = new Date(_0x2038df, 0x6, 0x1),
      _0x4ad407 = _0xf4bc6f[_0x4d2984(0x20a)](),
      _0x2b58cf = _0x479f95[_0x4d2984(0x20a)](),
      _0x53ff0e = Math[_0x4d2984(0x204)](_0x4ad407, _0x2b58cf)
    ;((HEAPU32[_0x382334 >> 0x2] = _0x53ff0e * 0x3c),
      (HEAP32[_0x25a289 >> 0x2] = Number(_0x4ad407 != _0x2b58cf)),
      checkInt32(Number(_0x4ad407 != _0x2b58cf)))
    var _0x103310 = (_0x32dd63) => {
        var _0x3606e7 = _0x4d2984,
          _0x500b9b = _0x32dd63 >= 0x0 ? '-' : '+',
          _0x420fe8 = Math[_0x3606e7(0x2fc)](_0x32dd63),
          _0x56dc75 = String(Math[_0x3606e7(0x26f)](_0x420fe8 / 0x3c))[
            'padStart'
          ](0x2, '0'),
          _0xe8f3f9 = String(_0x420fe8 % 0x3c)[_0x3606e7(0x3aa)](0x2, '0')
        return _0x3606e7(0x2cc) + _0x500b9b + _0x56dc75 + _0xe8f3f9
      },
      _0x263757 = _0x103310(_0x4ad407),
      _0x166690 = _0x103310(_0x2b58cf)
    ;(assert(_0x263757),
      assert(_0x166690),
      assert(
        lengthBytesUTF8(_0x263757) <= 0x10,
        _0x4d2984(0x3cd) + _0x263757 + ')'
      ),
      assert(
        lengthBytesUTF8(_0x166690) <= 0x10,
        'timezone\x20name\x20truncated\x20to\x20fit\x20in\x20TZNAME_MAX\x20(' +
          _0x166690 +
          ')'
      ),
      _0x2b58cf < _0x4ad407
        ? (stringToUTF8(_0x263757, _0x16a740, 0x11),
          stringToUTF8(_0x166690, _0x4903e5, 0x11))
        : (stringToUTF8(_0x263757, _0x4903e5, 0x11),
          stringToUTF8(_0x166690, _0x16a740, 0x11)))
  },
  _emscripten_get_now = () => performance[a0_0x5889c6(0x29a)](),
  _emscripten_date_now = () => Date[a0_0x5889c6(0x29a)](),
  nowIsMonotonic = 0x1,
  checkWasiClock = (_0xa39c6d) => _0xa39c6d >= 0x0 && _0xa39c6d <= 0x3
function _clock_time_get(_0x4b55f7, _0x120dfb, _0x42e4f3) {
  _0x120dfb = bigintToI53Checked(_0x120dfb)
  if (!checkWasiClock(_0x4b55f7)) return 0x1c
  var _0x6ae12a
  if (_0x4b55f7 === 0x0) _0x6ae12a = _emscripten_date_now()
  else {
    if (nowIsMonotonic) _0x6ae12a = _emscripten_get_now()
    else return 0x34
  }
  var _0x4abbaf = Math['round'](_0x6ae12a * 0x3e8 * 0x3e8)
  return (
    (HEAP64[_0x42e4f3 >> 0x3] = BigInt(_0x4abbaf)),
    checkInt64(_0x4abbaf),
    0x0
  )
}
var readEmAsmArgsArray = [],
  readEmAsmArgs = (_0x56768, _0x1ab47a) => {
    var _0x5dd0ae = a0_0x5889c6
    ;(assert(Array['isArray'](readEmAsmArgsArray)),
      assert(_0x1ab47a % 0x10 == 0x0),
      (readEmAsmArgsArray['length'] = 0x0))
    var _0x23bd1f
    while ((_0x23bd1f = HEAPU8[_0x56768++])) {
      var _0xd2f463 = String[_0x5dd0ae(0x266)](_0x23bd1f),
        _0x455b6a = ['d', 'f', 'i', 'p']
      ;(_0x455b6a[_0x5dd0ae(0x364)]('j'),
        assert(
          _0x455b6a[_0x5dd0ae(0x2c4)](_0xd2f463),
          _0x5dd0ae(0x371) +
            _0x23bd1f +
            '(\x22' +
            _0xd2f463 +
            _0x5dd0ae(0x129) +
            _0x455b6a +
            _0x5dd0ae(0x14e)
        ))
      var _0x29ece0 = _0x23bd1f != 0x69
      ;((_0x29ece0 &= _0x23bd1f != 0x70),
        (_0x1ab47a += _0x29ece0 && _0x1ab47a % 0x8 ? 0x4 : 0x0),
        readEmAsmArgsArray[_0x5dd0ae(0x364)](
          _0x23bd1f == 0x70
            ? HEAPU32[_0x1ab47a >> 0x2]
            : _0x23bd1f == 0x6a
              ? HEAP64[_0x1ab47a >> 0x3]
              : _0x23bd1f == 0x69
                ? HEAP32[_0x1ab47a >> 0x2]
                : HEAPF64[_0x1ab47a >> 0x3]
        ),
        (_0x1ab47a += _0x29ece0 ? 0x8 : 0x4))
    }
    return readEmAsmArgsArray
  },
  runEmAsmFunction = (_0x2aa016, _0x3cd2b0, _0x4a6f83) => {
    var _0x350e0c = a0_0x5889c6,
      _0x1695fd = readEmAsmArgs(_0x3cd2b0, _0x4a6f83)
    return (
      assert(
        ASM_CONSTS[_0x350e0c(0x416)](_0x2aa016),
        'No\x20EM_ASM\x20constant\x20found\x20at\x20address\x20' +
          _0x2aa016 +
          '.\x20\x20The\x20loaded\x20WebAssembly\x20file\x20is\x20likely\x20out\x20of\x20sync\x20with\x20the\x20generated\x20JavaScript.'
      ),
      ASM_CONSTS[_0x2aa016](..._0x1695fd)
    )
  },
  _emscripten_asm_const_double = (_0x5b3663, _0x59eac2, _0x3536d7) =>
    runEmAsmFunction(_0x5b3663, _0x59eac2, _0x3536d7),
  _emscripten_asm_const_int = (_0x34f930, _0x26ab16, _0x2eb43e) =>
    runEmAsmFunction(_0x34f930, _0x26ab16, _0x2eb43e),
  runMainThreadEmAsm = (_0x524e16, _0x639771, _0x63dd98, _0x29010c) => {
    var _0x23743b = a0_0x5889c6,
      _0x2d2996 = readEmAsmArgs(_0x639771, _0x63dd98)
    return (
      assert(
        ASM_CONSTS[_0x23743b(0x416)](_0x524e16),
        'No\x20EM_ASM\x20constant\x20found\x20at\x20address\x20' +
          _0x524e16 +
          _0x23743b(0x409)
      ),
      ASM_CONSTS[_0x524e16](..._0x2d2996)
    )
  },
  _emscripten_asm_const_int_sync_on_main_thread = (
    _0x575a17,
    _0x404683,
    _0x51b189
  ) => runMainThreadEmAsm(_0x575a17, _0x404683, _0x51b189, 0x1),
  _emscripten_asm_const_ptr = (_0x32a586, _0x1c0913, _0x538830) =>
    runEmAsmFunction(_0x32a586, _0x1c0913, _0x538830)
function _emscripten_fetch_free(_0xa86849) {
  var _0x1f3060 = a0_0x5889c6
  if (Fetch[_0x1f3060(0x2a0)][_0x1f3060(0x345)](_0xa86849)) {
    var _0x341d02 = Fetch[_0x1f3060(0x2a0)][_0x1f3060(0x2dc)](_0xa86849)
    ;(Fetch['xhrs'][_0x1f3060(0x39c)](_0xa86849),
      _0x341d02['readyState'] > 0x0 &&
        _0x341d02['readyState'] < 0x4 &&
        _0x341d02['abort']())
  }
}
var getHeapMax = () => 0x80000000,
  _emscripten_get_heap_max = () => getHeapMax(),
  _emscripten_is_main_browser_thread = () => !ENVIRONMENT_IS_WORKER,
  alignMemory = (_0x411c95, _0x3d0875) => {
    var _0x2bb0ef = a0_0x5889c6
    return (
      assert(_0x3d0875, _0x2bb0ef(0x3b3)),
      Math[_0x2bb0ef(0x3a4)](_0x411c95 / _0x3d0875) * _0x3d0875
    )
  },
  growMemory = (_0x144028) => {
    var _0x48362c = a0_0x5889c6,
      _0xa6995 = wasmMemory[_0x48362c(0x243)][_0x48362c(0x34b)],
      _0x5b4f40 = ((_0x144028 - _0xa6995 + 0xffff) / 0x10000) | 0x0
    try {
      return (wasmMemory['grow'](_0x5b4f40), updateMemoryViews(), 0x1)
    } catch (_0x17a687) {
      err(
        _0x48362c(0x3c3) +
          _0xa6995 +
          _0x48362c(0x12b) +
          _0x144028 +
          '\x20bytes,\x20but\x20got\x20error:\x20' +
          _0x17a687
      )
    }
  },
  _emscripten_resize_heap = (_0x5a625e) => {
    var _0x36c93b = a0_0x5889c6,
      _0x5ae540 = HEAPU8[_0x36c93b(0x308)]
    ;((_0x5a625e >>>= 0x0), assert(_0x5a625e > _0x5ae540))
    var _0x27adf5 = getHeapMax()
    if (_0x5a625e > _0x27adf5)
      return (
        err(
          'Cannot\x20enlarge\x20memory,\x20requested\x20' +
            _0x5a625e +
            _0x36c93b(0x3e7) +
            _0x27adf5 +
            _0x36c93b(0x3a2)
        ),
        ![]
      )
    for (var _0x4a0ff6 = 0x1; _0x4a0ff6 <= 0x4; _0x4a0ff6 *= 0x2) {
      var _0x2bd22b = _0x5ae540 * (0x1 + 0.2 / _0x4a0ff6)
      _0x2bd22b = Math[_0x36c93b(0x290)](_0x2bd22b, _0x5a625e + 0x6000000)
      var _0x951adf = Math[_0x36c93b(0x290)](
          _0x27adf5,
          alignMemory(Math['max'](_0x5a625e, _0x2bd22b), 0x10000)
        ),
        _0x4e3bac = _emscripten_get_now(),
        _0x339596 = growMemory(_0x951adf),
        _0x397fa2 = _emscripten_get_now()
      dbg(
        'Heap\x20resize\x20call\x20from\x20' +
          _0x5ae540 +
          _0x36c93b(0x223) +
          _0x951adf +
          _0x36c93b(0x1e8) +
          (_0x397fa2 - _0x4e3bac) +
          '\x20msecs.\x20Success:\x20' +
          !!_0x339596
      )
      if (_0x339596) return !![]
    }
    return (
      err(
        _0x36c93b(0x37e) +
          _0x5ae540 +
          _0x36c93b(0x12b) +
          _0x951adf +
          '\x20bytes,\x20not\x20enough\x20memory!'
      ),
      ![]
    )
  }
class HandleAllocator {
  ['allocated'] = [undefined];
  ['freelist'] = [];
  [a0_0x5889c6(0x2dc)](_0x2c08c5) {
    var _0x4be8df = a0_0x5889c6
    return (
      assert(
        this['allocated'][_0x2c08c5] !== undefined,
        _0x4be8df(0x421) + _0x2c08c5
      ),
      this[_0x4be8df(0x2e2)][_0x2c08c5]
    )
  }
  [a0_0x5889c6(0x345)](_0x1d6b34) {
    var _0x1c5460 = a0_0x5889c6
    return this[_0x1c5460(0x2e2)][_0x1d6b34] !== undefined
  }
  ['allocate'](_0x240338) {
    var _0xa908aa = a0_0x5889c6,
      _0x3b8342 =
        this['freelist'][_0xa908aa(0x135)]() || this['allocated']['length']
    return ((this[_0xa908aa(0x2e2)][_0x3b8342] = _0x240338), _0x3b8342)
  }
  ['free'](_0xc8b528) {
    var _0x43e4a5 = a0_0x5889c6
    ;(assert(this['allocated'][_0xc8b528] !== undefined),
      (this[_0x43e4a5(0x2e2)][_0xc8b528] = undefined),
      this[_0x43e4a5(0x289)]['push'](_0xc8b528))
  }
}
var Fetch = {
  openDatabase(_0x1907d1, _0x24235d, _0x171fbd, _0xfd46b4) {
    var _0x210a87 = a0_0x5889c6
    try {
      var _0x502476 = indexedDB[_0x210a87(0x122)](_0x1907d1, _0x24235d)
    } catch (_0x27f287) {
      return _0xfd46b4(_0x27f287)
    }
    ;((_0x502476[_0x210a87(0x2e8)] = (_0x21adc8) => {
      var _0x5e7a71 = _0x210a87,
        _0x19a16d = _0x21adc8[_0x5e7a71(0x249)][_0x5e7a71(0x2d2)]
      ;(_0x19a16d[_0x5e7a71(0x248)][_0x5e7a71(0x18a)](_0x5e7a71(0x273)) &&
        _0x19a16d[_0x5e7a71(0x27a)](_0x5e7a71(0x273)),
        _0x19a16d[_0x5e7a71(0x38b)]('FILES'))
    }),
      (_0x502476[_0x210a87(0x3f6)] = (_0x5cbd35) =>
        _0x171fbd(_0x5cbd35[_0x210a87(0x249)][_0x210a87(0x2d2)])),
      (_0x502476['onerror'] = _0xfd46b4))
  },
  init() {
    var _0x5ef687 = a0_0x5889c6
    Fetch['xhrs'] = new HandleAllocator()
    var _0x103b97 = (_0x3c22b4) => {
        var _0x5b2723 = a0_0x1c46
        ;((Fetch[_0x5b2723(0x175)] = _0x3c22b4),
          removeRunDependency(_0x5b2723(0x17a)))
      },
      _0x1637b1 = () => {
        var _0x32f0a4 = a0_0x1c46
        ;((Fetch[_0x32f0a4(0x175)] = ![]),
          removeRunDependency('library_fetch_init'))
      }
    ;(addRunDependency('library_fetch_init'),
      Fetch['openDatabase'](_0x5ef687(0x2dd), 0x1, _0x103b97, _0x1637b1))
  },
}
function fetchXHR(_0x20188e, _0x26b972, _0x28b797, _0x58662a, _0x5905c2) {
  var _0x5a14f9 = a0_0x5889c6,
    _0x15f545 = HEAPU32[(_0x20188e + 0x8) >> 0x2]
  if (!_0x15f545) {
    _0x28b797(_0x20188e, 0x0, _0x5a14f9(0x313))
    return
  }
  var _0x203c76 = UTF8ToString(_0x15f545),
    _0x48c4b2 = _0x20188e + 0x6c,
    _0x336795 = UTF8ToString(_0x48c4b2 + 0x0)
  _0x336795 ||= _0x5a14f9(0x3ff)
  var _0x2c3440 = HEAPU32[(_0x48c4b2 + 0x38) >> 0x2],
    _0x5381e0 = HEAPU32[(_0x48c4b2 + 0x44) >> 0x2],
    _0x255163 = HEAPU32[(_0x48c4b2 + 0x48) >> 0x2],
    _0x4b6836 = HEAPU32[(_0x48c4b2 + 0x4c) >> 0x2],
    _0x4cb55b = HEAPU32[(_0x48c4b2 + 0x50) >> 0x2],
    _0x1bbfea = HEAPU32[(_0x48c4b2 + 0x54) >> 0x2],
    _0x599ce1 = HEAPU32[(_0x48c4b2 + 0x58) >> 0x2],
    _0x30b5ac = HEAPU32[(_0x48c4b2 + 0x34) >> 0x2],
    _0x26166b = !!(_0x30b5ac & 0x1),
    _0x46f35e = !!(_0x30b5ac & 0x2),
    _0x4312a9 = !!(_0x30b5ac & 0x40),
    _0xaba961 = _0x5381e0 ? UTF8ToString(_0x5381e0) : undefined,
    _0x5d6c24 = _0x255163 ? UTF8ToString(_0x255163) : undefined,
    _0x37245b = new XMLHttpRequest()
  ;((_0x37245b[_0x5a14f9(0x16e)] = !!HEAPU8[_0x48c4b2 + 0x3c]),
    _0x37245b[_0x5a14f9(0x122)](
      _0x336795,
      _0x203c76,
      !_0x4312a9,
      _0xaba961,
      _0x5d6c24
    ))
  if (!_0x4312a9) _0x37245b[_0x5a14f9(0x3bf)] = _0x2c3440
  ;((_0x37245b[_0x5a14f9(0x1bb)] = _0x203c76),
    assert(!_0x46f35e, _0x5a14f9(0x3c0)),
    (_0x37245b[_0x5a14f9(0x32b)] = 'arraybuffer'))
  if (_0x4cb55b) {
    var _0x1fa4a9 = UTF8ToString(_0x4cb55b)
    _0x37245b[_0x5a14f9(0x13c)](_0x1fa4a9)
  }
  if (_0x4b6836)
    for (;;) {
      var _0x5a835f = HEAPU32[_0x4b6836 >> 0x2]
      if (!_0x5a835f) break
      var _0x2f6213 = HEAPU32[(_0x4b6836 + 0x4) >> 0x2]
      if (!_0x2f6213) break
      _0x4b6836 += 0x8
      var _0x55ed92 = UTF8ToString(_0x5a835f),
        _0x3a0e69 = UTF8ToString(_0x2f6213)
      _0x37245b[_0x5a14f9(0x30b)](_0x55ed92, _0x3a0e69)
    }
  var _0x3c65d7 = Fetch[_0x5a14f9(0x2a0)]['allocate'](_0x37245b)
  ;((HEAPU32[_0x20188e >> 0x2] = _0x3c65d7), checkInt32(_0x3c65d7))
  var _0x1ba3c5 =
    _0x1bbfea && _0x599ce1
      ? HEAPU8['slice'](_0x1bbfea, _0x1bbfea + _0x599ce1)
      : null
  function _0x526068() {
    var _0x477d09 = _0x5a14f9,
      _0x2124f7 = 0x0,
      _0x1cb6df = 0x0
    _0x37245b[_0x477d09(0x2b4)] &&
      _0x26166b &&
      HEAPU32[(_0x20188e + 0xc) >> 0x2] === 0x0 &&
      (_0x1cb6df = _0x37245b[_0x477d09(0x2b4)][_0x477d09(0x34b)])
    _0x1cb6df > 0x0 &&
      ((_0x2124f7 = _malloc(_0x1cb6df)),
      HEAPU8['set'](new Uint8Array(_0x37245b['response']), _0x2124f7))
    ;((HEAPU32[(_0x20188e + 0xc) >> 0x2] = _0x2124f7),
      writeI53ToI64(_0x20188e + 0x10, _0x1cb6df),
      writeI53ToI64(_0x20188e + 0x18, 0x0))
    var _0x59cf59 = _0x37245b['response']
      ? _0x37245b[_0x477d09(0x2b4)]['byteLength']
      : 0x0
    _0x59cf59 && writeI53ToI64(_0x20188e + 0x20, _0x59cf59)
    ;((HEAP16[(_0x20188e + 0x28) >> 0x1] = _0x37245b[_0x477d09(0x2a1)]),
      checkInt16(_0x37245b[_0x477d09(0x2a1)]),
      (HEAP16[(_0x20188e + 0x2a) >> 0x1] = _0x37245b[_0x477d09(0x28d)]),
      checkInt16(_0x37245b[_0x477d09(0x28d)]))
    if (_0x37245b['statusText'])
      stringToUTF8(_0x37245b[_0x477d09(0x21e)], _0x20188e + 0x2c, 0x40)
    if (_0x4312a9) {
      var _0x4f295e = stringToNewUTF8(_0x37245b[_0x477d09(0x29c)])
      HEAPU32[(_0x20188e + 0xc8) >> 0x2] = _0x4f295e
    }
  }
  ;((_0x37245b['onload'] = (_0x4e90cc) => {
    var _0x3560a6 = _0x5a14f9
    if (!Fetch[_0x3560a6(0x2a0)][_0x3560a6(0x345)](_0x3c65d7)) return
    ;(_0x526068(),
      _0x37245b[_0x3560a6(0x28d)] >= 0xc8 && _0x37245b[_0x3560a6(0x28d)] < 0x12c
        ? _0x26b972?.(_0x20188e, _0x37245b, _0x4e90cc)
        : _0x28b797?.(_0x20188e, _0x37245b, _0x4e90cc))
  }),
    (_0x37245b[_0x5a14f9(0x207)] = (_0x38dcf9) => {
      var _0x24921a = _0x5a14f9
      if (!Fetch['xhrs'][_0x24921a(0x345)](_0x3c65d7)) return
      ;(_0x526068(), _0x28b797?.(_0x20188e, _0x37245b, _0x38dcf9))
    }),
    (_0x37245b[_0x5a14f9(0x3c7)] = (_0x3a4070) => {
      var _0x36af33 = _0x5a14f9
      if (!Fetch['xhrs'][_0x36af33(0x345)](_0x3c65d7)) return
      _0x28b797?.(_0x20188e, _0x37245b, _0x3a4070)
    }),
    (_0x37245b[_0x5a14f9(0x1e9)] = (_0x7df6a3) => {
      var _0x201c68 = _0x5a14f9
      if (!Fetch['xhrs'][_0x201c68(0x345)](_0x3c65d7)) return
      var _0x14ff9b =
          _0x26166b && _0x46f35e && _0x37245b['response']
            ? _0x37245b['response'][_0x201c68(0x34b)]
            : 0x0,
        _0x2823b1 = 0x0
      _0x14ff9b > 0x0 &&
        _0x26166b &&
        _0x46f35e &&
        (assert(
          _0x58662a,
          'When\x20doing\x20a\x20streaming\x20fetch,\x20you\x20should\x20have\x20an\x20onprogress\x20handler\x20registered\x20to\x20receive\x20the\x20chunks!'
        ),
        (_0x2823b1 = _malloc(_0x14ff9b)),
        HEAPU8['set'](new Uint8Array(_0x37245b[_0x201c68(0x2b4)]), _0x2823b1))
      ;((HEAPU32[(_0x20188e + 0xc) >> 0x2] = _0x2823b1),
        writeI53ToI64(_0x20188e + 0x10, _0x14ff9b),
        writeI53ToI64(
          _0x20188e + 0x18,
          _0x7df6a3[_0x201c68(0x1e6)] - _0x14ff9b
        ),
        writeI53ToI64(_0x20188e + 0x20, _0x7df6a3[_0x201c68(0x141)]),
        (HEAP16[(_0x20188e + 0x28) >> 0x1] = _0x37245b[_0x201c68(0x2a1)]),
        checkInt16(_0x37245b[_0x201c68(0x2a1)]))
      if (
        _0x37245b[_0x201c68(0x2a1)] >= 0x3 &&
        _0x37245b[_0x201c68(0x28d)] === 0x0 &&
        _0x7df6a3[_0x201c68(0x1e6)] > 0x0
      )
        _0x37245b['status'] = 0xc8
      ;((HEAP16[(_0x20188e + 0x2a) >> 0x1] = _0x37245b[_0x201c68(0x28d)]),
        checkInt16(_0x37245b[_0x201c68(0x28d)]))
      if (_0x37245b[_0x201c68(0x21e)])
        stringToUTF8(_0x37245b['statusText'], _0x20188e + 0x2c, 0x40)
      ;(_0x58662a?.(_0x20188e, _0x37245b, _0x7df6a3), _free(_0x2823b1))
    }),
    (_0x37245b[_0x5a14f9(0x1b4)] = (_0x38e814) => {
      var _0x239d5f = _0x5a14f9
      if (!Fetch[_0x239d5f(0x2a0)][_0x239d5f(0x345)](_0x3c65d7)) return
      ;((HEAP16[(_0x20188e + 0x28) >> 0x1] = _0x37245b[_0x239d5f(0x2a1)]),
        checkInt16(_0x37245b['readyState']))
      _0x37245b[_0x239d5f(0x2a1)] >= 0x2 &&
        ((HEAP16[(_0x20188e + 0x2a) >> 0x1] = _0x37245b[_0x239d5f(0x28d)]),
        checkInt16(_0x37245b[_0x239d5f(0x28d)]))
      if (
        !_0x4312a9 &&
        _0x37245b[_0x239d5f(0x2a1)] === 0x2 &&
        _0x37245b[_0x239d5f(0x29c)][_0x239d5f(0x308)] > 0x0
      ) {
        var _0x17e6b8 = stringToNewUTF8(_0x37245b['responseURL'])
        HEAPU32[(_0x20188e + 0xc8) >> 0x2] = _0x17e6b8
      }
      _0x5905c2?.(_0x20188e, _0x37245b, _0x38e814)
    }))
  try {
    _0x37245b[_0x5a14f9(0x388)](_0x1ba3c5)
  } catch (_0x1e6b1a) {
    _0x28b797?.(_0x20188e, _0x37245b, _0x1e6b1a)
  }
}
var handleException = (_0x25e242) => {
    var _0x5e54a8 = a0_0x5889c6
    if (_0x25e242 instanceof ExitStatus || _0x25e242 == _0x5e54a8(0x158))
      return EXITSTATUS
    ;(checkStackCookie(),
      _0x25e242 instanceof WebAssembly[_0x5e54a8(0x394)] &&
        _emscripten_stack_get_current() <= 0x0 &&
        err(
          'Stack\x20overflow\x20detected.\x20\x20You\x20can\x20try\x20increasing\x20-sSTACK_SIZE\x20(currently\x20set\x20to\x20100000)'
        ),
      quit_(0x1, _0x25e242))
  },
  runtimeKeepaliveCounter = 0x0,
  keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0x0,
  _proc_exit = (_0x33634e) => {
    ;((EXITSTATUS = _0x33634e),
      !keepRuntimeAlive() && (Module['onExit']?.(_0x33634e), (ABORT = !![])),
      quit_(_0x33634e, new ExitStatus(_0x33634e)))
  },
  exitJS = (_0x5092aa, _0xe2e84) => {
    var _0x571820 = a0_0x5889c6
    ;((EXITSTATUS = _0x5092aa), checkUnflushedContent())
    if (keepRuntimeAlive() && !_0xe2e84) {
      var _0x35081e =
        _0x571820(0x196) +
        _0x5092aa +
        _0x571820(0x35c) +
        runtimeKeepaliveCounter +
        ')\x20due\x20to\x20an\x20async\x20operation,\x20so\x20halting\x20execution\x20but\x20not\x20exiting\x20the\x20runtime\x20or\x20preventing\x20further\x20async\x20execution\x20(you\x20can\x20use\x20emscripten_force_exit,\x20if\x20you\x20want\x20to\x20force\x20a\x20true\x20shutdown)'
      err(_0x35081e)
    }
    _proc_exit(_0x5092aa)
  },
  _exit = exitJS,
  maybeExit = () => {
    if (!keepRuntimeAlive())
      try {
        _exit(EXITSTATUS)
      } catch (_0x569901) {
        handleException(_0x569901)
      }
  },
  callUserCallback = (_0x49eaba) => {
    var _0x372b74 = a0_0x5889c6
    if (ABORT) {
      err(_0x372b74(0x3eb))
      return
    }
    try {
      ;(_0x49eaba(), maybeExit())
    } catch (_0x2b17bc) {
      handleException(_0x2b17bc)
    }
  },
  readI53FromI64 = (_0x5cb78d) =>
    HEAPU32[_0x5cb78d >> 0x2] + HEAP32[(_0x5cb78d + 0x4) >> 0x2] * 0x100000000,
  readI53FromU64 = (_0xd5a7cc) =>
    HEAPU32[_0xd5a7cc >> 0x2] + HEAPU32[(_0xd5a7cc + 0x4) >> 0x2] * 0x100000000,
  writeI53ToI64 = (_0x343c62, _0x293802) => {
    var _0x405d85 = a0_0x5889c6
    ;((HEAPU32[_0x343c62 >> 0x2] = _0x293802), checkInt32(_0x293802))
    var _0x16b63e = HEAPU32[_0x343c62 >> 0x2]
    ;((HEAPU32[(_0x343c62 + 0x4) >> 0x2] =
      (_0x293802 - _0x16b63e) / 0x100000000),
      checkInt32((_0x293802 - _0x16b63e) / 0x100000000))
    var _0x249ccb =
        _0x293802 >= 0x0
          ? readI53FromU64(_0x343c62)
          : readI53FromI64(_0x343c62),
      _0x723fd1 = _0x343c62 >> 0x2
    if (_0x249ccb != _0x293802)
      warnOnce(
        _0x405d85(0x258) +
          _0x293802 +
          _0x405d85(0x20b) +
          ptrToString(HEAPU32[_0x723fd1]) +
          ',\x20hi=' +
          ptrToString(HEAPU32[_0x723fd1 + 0x1]) +
          ',\x20which\x20deserializes\x20back\x20to\x20' +
          _0x249ccb +
          _0x405d85(0x19d)
      )
  },
  stringToNewUTF8 = (_0x4e4093) => {
    var _0x1ff6e5 = lengthBytesUTF8(_0x4e4093) + 0x1,
      _0x49c40d = _malloc(_0x1ff6e5)
    if (_0x49c40d) stringToUTF8(_0x4e4093, _0x49c40d, _0x1ff6e5)
    return _0x49c40d
  }
function fetchCacheData(_0x39494d, _0x36052b, _0x153ed5, _0x362159, _0x45f343) {
  var _0x37b2db = a0_0x5889c6
  if (!_0x39494d) {
    _0x45f343(_0x36052b, 0x0, _0x37b2db(0x22d))
    return
  }
  var _0x14ba7f = _0x36052b + 0x6c,
    _0x215ba9 = HEAPU32[(_0x14ba7f + 0x40) >> 0x2]
  _0x215ba9 ||= HEAPU32[(_0x36052b + 0x8) >> 0x2]
  var _0x11e208 = UTF8ToString(_0x215ba9)
  try {
    var _0x2254bb = _0x39494d[_0x37b2db(0x28f)](
        [_0x37b2db(0x273)],
        _0x37b2db(0x2a3)
      ),
      _0x2d6858 = _0x2254bb[_0x37b2db(0x2ec)](_0x37b2db(0x273)),
      _0x11b8af = _0x2d6858[_0x37b2db(0x1d0)](_0x153ed5, _0x11e208)
    ;((_0x11b8af[_0x37b2db(0x3f6)] = (_0x25a638) => {
      ;((HEAP16[(_0x36052b + 0x28) >> 0x1] = 0x4),
        checkInt16(0x4),
        (HEAP16[(_0x36052b + 0x2a) >> 0x1] = 0xc8),
        checkInt16(0xc8),
        stringToUTF8('OK', _0x36052b + 0x2c, 0x40),
        _0x362159(_0x36052b, 0x0, _0x11e208))
    }),
      (_0x11b8af[_0x37b2db(0x207)] = (_0x476e7a) => {
        ;((HEAP16[(_0x36052b + 0x28) >> 0x1] = 0x4),
          checkInt16(0x4),
          (HEAP16[(_0x36052b + 0x2a) >> 0x1] = 0x19d),
          checkInt16(0x19d),
          stringToUTF8('Payload\x20Too\x20Large', _0x36052b + 0x2c, 0x40),
          _0x45f343(_0x36052b, 0x0, _0x476e7a))
      }))
  } catch (_0x5ee564) {
    _0x45f343(_0x36052b, 0x0, _0x5ee564)
  }
}
function fetchLoadCachedData(_0x38cbee, _0x2134b2, _0x4bc196, _0x2eddff) {
  var _0x51d883 = a0_0x5889c6
  if (!_0x38cbee) {
    _0x2eddff(_0x2134b2, 0x0, _0x51d883(0x22d))
    return
  }
  var _0xb111ad = _0x2134b2 + 0x6c,
    _0x361b73 = HEAPU32[(_0xb111ad + 0x40) >> 0x2]
  _0x361b73 ||= HEAPU32[(_0x2134b2 + 0x8) >> 0x2]
  var _0xedd148 = UTF8ToString(_0x361b73)
  try {
    var _0x520e45 = _0x38cbee[_0x51d883(0x28f)](
        [_0x51d883(0x273)],
        _0x51d883(0x2e6)
      ),
      _0xfdf71b = _0x520e45[_0x51d883(0x2ec)](_0x51d883(0x273)),
      _0x3cc310 = _0xfdf71b[_0x51d883(0x2dc)](_0xedd148)
    ;((_0x3cc310[_0x51d883(0x3f6)] = (_0x1a85b9) => {
      var _0x4f1586 = _0x51d883
      if (_0x1a85b9[_0x4f1586(0x249)][_0x4f1586(0x2d2)]) {
        var _0x10d8af = _0x1a85b9[_0x4f1586(0x249)][_0x4f1586(0x2d2)],
          _0x2351e6 =
            _0x10d8af[_0x4f1586(0x34b)] || _0x10d8af[_0x4f1586(0x308)],
          _0x16a5f7 = _malloc(_0x2351e6)
        ;(HEAPU8['set'](new Uint8Array(_0x10d8af), _0x16a5f7),
          (HEAPU32[(_0x2134b2 + 0xc) >> 0x2] = _0x16a5f7),
          writeI53ToI64(_0x2134b2 + 0x10, _0x2351e6),
          writeI53ToI64(_0x2134b2 + 0x18, 0x0),
          writeI53ToI64(_0x2134b2 + 0x20, _0x2351e6),
          (HEAP16[(_0x2134b2 + 0x28) >> 0x1] = 0x4),
          checkInt16(0x4),
          (HEAP16[(_0x2134b2 + 0x2a) >> 0x1] = 0xc8),
          checkInt16(0xc8),
          stringToUTF8('OK', _0x2134b2 + 0x2c, 0x40),
          _0x4bc196(_0x2134b2, 0x0, _0x10d8af))
      } else
        ((HEAP16[(_0x2134b2 + 0x28) >> 0x1] = 0x4),
          checkInt16(0x4),
          (HEAP16[(_0x2134b2 + 0x2a) >> 0x1] = 0x194),
          checkInt16(0x194),
          stringToUTF8(_0x4f1586(0x376), _0x2134b2 + 0x2c, 0x40),
          _0x2eddff(_0x2134b2, 0x0, _0x4f1586(0x3c2)))
    }),
      (_0x3cc310[_0x51d883(0x207)] = (_0x108e19) => {
        ;((HEAP16[(_0x2134b2 + 0x28) >> 0x1] = 0x4),
          checkInt16(0x4),
          (HEAP16[(_0x2134b2 + 0x2a) >> 0x1] = 0x194),
          checkInt16(0x194),
          stringToUTF8('Not\x20Found', _0x2134b2 + 0x2c, 0x40),
          _0x2eddff(_0x2134b2, 0x0, _0x108e19))
      }))
  } catch (_0x2a3080) {
    _0x2eddff(_0x2134b2, 0x0, _0x2a3080)
  }
}
function fetchDeleteCachedData(_0x1ba691, _0x410711, _0x12097f, _0x45f111) {
  var _0x1a104f = a0_0x5889c6
  if (!_0x1ba691) {
    _0x45f111(_0x410711, 0x0, _0x1a104f(0x22d))
    return
  }
  var _0xf610e7 = _0x410711 + 0x6c,
    _0x2a8993 = HEAPU32[(_0xf610e7 + 0x40) >> 0x2]
  _0x2a8993 ||= HEAPU32[(_0x410711 + 0x8) >> 0x2]
  var _0x329da5 = UTF8ToString(_0x2a8993)
  try {
    var _0x5d452d = _0x1ba691[_0x1a104f(0x28f)](['FILES'], _0x1a104f(0x2a3)),
      _0x46b5a6 = _0x5d452d['objectStore'](_0x1a104f(0x273)),
      _0x274659 = _0x46b5a6['delete'](_0x329da5)
    ;((_0x274659[_0x1a104f(0x3f6)] = (_0x18ca53) => {
      var _0x352c51 = _0x1a104f,
        _0x37d892 = _0x18ca53['target'][_0x352c51(0x2d2)]
      ;((HEAPU32[(_0x410711 + 0xc) >> 0x2] = 0x0),
        writeI53ToI64(_0x410711 + 0x10, 0x0),
        writeI53ToI64(_0x410711 + 0x18, 0x0),
        writeI53ToI64(_0x410711 + 0x20, 0x0),
        (HEAP16[(_0x410711 + 0x28) >> 0x1] = 0x4),
        checkInt16(0x4),
        (HEAP16[(_0x410711 + 0x2a) >> 0x1] = 0xc8),
        checkInt16(0xc8),
        stringToUTF8('OK', _0x410711 + 0x2c, 0x40),
        _0x12097f(_0x410711, 0x0, _0x37d892))
    }),
      (_0x274659[_0x1a104f(0x207)] = (_0x1519b3) => {
        ;((HEAP16[(_0x410711 + 0x28) >> 0x1] = 0x4),
          checkInt16(0x4),
          (HEAP16[(_0x410711 + 0x2a) >> 0x1] = 0x194),
          checkInt16(0x194),
          stringToUTF8('Not\x20Found', _0x410711 + 0x2c, 0x40),
          _0x45f111(_0x410711, 0x0, _0x1519b3))
      }))
  } catch (_0x49222e) {
    _0x45f111(_0x410711, 0x0, _0x49222e)
  }
}
function _emscripten_start_fetch(
  _0x43be3a,
  _0x2c0f2f,
  _0x327427,
  _0x9d574a,
  _0xda4acb
) {
  var _0x108a56 = a0_0x5889c6,
    _0x125c4b = _0x43be3a + 0x6c,
    _0x47bfe2 = HEAPU32[(_0x125c4b + 0x24) >> 0x2],
    _0x93bdd9 = HEAPU32[(_0x125c4b + 0x28) >> 0x2],
    _0x143b20 = HEAPU32[(_0x125c4b + 0x2c) >> 0x2],
    _0x592b85 = HEAPU32[(_0x125c4b + 0x30) >> 0x2],
    _0xd8f11a = HEAPU32[(_0x125c4b + 0x34) >> 0x2],
    _0x3762bd = !!(_0xd8f11a & 0x40)
  function _0x6efe8(_0x277821) {
    _0x3762bd ? _0x277821() : callUserCallback(_0x277821)
  }
  var _0x5cadcb = (_0xf226d3, _0x22f86d, _0x9f6663) => {
      _0x6efe8(() => {
        if (_0x47bfe2) getWasmTableEntry(_0x47bfe2)(_0xf226d3)
        else _0x2c0f2f?.(_0xf226d3)
      })
    },
    _0x54fa39 = (_0x522bc9, _0x56256a, _0x238338) => {
      _0x6efe8(() => {
        if (_0x143b20) getWasmTableEntry(_0x143b20)(_0x522bc9)
        else _0x9d574a?.(_0x522bc9)
      })
    },
    _0x37bd76 = (_0x288476, _0x428f1f, _0x343fd4) => {
      _0x6efe8(() => {
        if (_0x93bdd9) getWasmTableEntry(_0x93bdd9)(_0x288476)
        else _0x327427?.(_0x288476)
      })
    },
    _0x36d85d = (_0x52b197, _0x2284d7, _0x37db3) => {
      _0x6efe8(() => {
        if (_0x592b85) getWasmTableEntry(_0x592b85)(_0x52b197)
        else _0xda4acb?.(_0x52b197)
      })
    },
    _0x45086a = (_0x5aa618, _0x5a346e, _0x4b08bc) => {
      fetchXHR(_0x5aa618, _0x5cadcb, _0x37bd76, _0x54fa39, _0x36d85d)
    },
    _0x77ccee = (_0x2223a5, _0x482522, _0x41631c) => {
      var _0x34bae6 = a0_0x1c46,
        _0x496225 = (_0xc67a1d, _0xf0d714, _0x208575) => {
          _0x6efe8(() => {
            if (_0x47bfe2) getWasmTableEntry(_0x47bfe2)(_0xc67a1d)
            else _0x2c0f2f?.(_0xc67a1d)
          })
        },
        _0x3c699e = (_0x10c6b5, _0x462cc5, _0x4af67c) => {
          _0x6efe8(() => {
            if (_0x47bfe2) getWasmTableEntry(_0x47bfe2)(_0x10c6b5)
            else _0x2c0f2f?.(_0x10c6b5)
          })
        }
      fetchCacheData(
        Fetch[_0x34bae6(0x175)],
        _0x2223a5,
        _0x482522[_0x34bae6(0x2b4)],
        _0x496225,
        _0x3c699e
      )
    },
    _0x197bbe = (_0x41433e, _0x3f357f, _0x148b4a) => {
      fetchXHR(_0x41433e, _0x77ccee, _0x37bd76, _0x54fa39, _0x36d85d)
    },
    _0x2e94e3 = UTF8ToString(_0x125c4b + 0x0),
    _0x21ce2a = !!(_0xd8f11a & 0x10),
    _0x3e4b62 = !!(_0xd8f11a & 0x4),
    _0x523d7b = !!(_0xd8f11a & 0x20)
  if (_0x2e94e3 === _0x108a56(0x357)) {
    var _0x3fef2d = HEAPU32[(_0x125c4b + 0x54) >> 0x2],
      _0x47fd8c = HEAPU32[(_0x125c4b + 0x58) >> 0x2]
    fetchCacheData(
      Fetch[_0x108a56(0x175)],
      _0x43be3a,
      HEAPU8[_0x108a56(0x24c)](_0x3fef2d, _0x3fef2d + _0x47fd8c),
      _0x5cadcb,
      _0x37bd76
    )
  } else {
    if (_0x2e94e3 === _0x108a56(0x31d))
      fetchDeleteCachedData(
        Fetch[_0x108a56(0x175)],
        _0x43be3a,
        _0x5cadcb,
        _0x37bd76
      )
    else {
      if (!_0x21ce2a)
        fetchLoadCachedData(
          Fetch['dbInstance'],
          _0x43be3a,
          _0x5cadcb,
          _0x523d7b ? _0x37bd76 : _0x3e4b62 ? _0x197bbe : _0x45086a
        )
      else {
        if (!_0x523d7b)
          fetchXHR(
            _0x43be3a,
            _0x3e4b62 ? _0x77ccee : _0x5cadcb,
            _0x37bd76,
            _0x54fa39,
            _0x36d85d
          )
        else return 0x0
      }
    }
  }
  return _0x43be3a
}
var ENV = {},
  getExecutableName = () => thisProgram || a0_0x5889c6(0x404),
  getEnvStrings = () => {
    var _0x26cc44 = a0_0x5889c6
    if (!getEnvStrings['strings']) {
      var _0xfadc70 =
          ((typeof navigator == _0x26cc44(0x2c3) &&
            navigator[_0x26cc44(0x1d1)]) ||
            'C')[_0x26cc44(0x3e6)]('-', '_') + '.UTF-8',
        _0x5310cb = {
          USER: _0x26cc44(0x1be),
          LOGNAME: _0x26cc44(0x1be),
          PATH: '/',
          PWD: '/',
          HOME: _0x26cc44(0x379),
          LANG: _0xfadc70,
          _: getExecutableName(),
        }
      for (var _0x443916 in ENV) {
        if (ENV[_0x443916] === undefined) delete _0x5310cb[_0x443916]
        else _0x5310cb[_0x443916] = ENV[_0x443916]
      }
      var _0x45b87a = []
      for (var _0x443916 in _0x5310cb) {
        _0x45b87a[_0x26cc44(0x364)](_0x443916 + '=' + _0x5310cb[_0x443916])
      }
      getEnvStrings[_0x26cc44(0x144)] = _0x45b87a
    }
    return getEnvStrings[_0x26cc44(0x144)]
  },
  _environ_get = (_0x416c54, _0x4a28ce) => {
    var _0x1f7f21 = 0x0,
      _0x320e2d = 0x0
    for (var _0x36a14 of getEnvStrings()) {
      var _0xbb9815 = _0x4a28ce + _0x1f7f21
      ;((HEAPU32[(_0x416c54 + _0x320e2d) >> 0x2] = _0xbb9815),
        (_0x1f7f21 += stringToUTF8(_0x36a14, _0xbb9815, Infinity) + 0x1),
        (_0x320e2d += 0x4))
    }
    return 0x0
  },
  _environ_sizes_get = (_0x47c6c3, _0x16793f) => {
    var _0x5c71e3 = a0_0x5889c6,
      _0x43b470 = getEnvStrings()
    ;((HEAPU32[_0x47c6c3 >> 0x2] = _0x43b470[_0x5c71e3(0x308)]),
      checkInt32(_0x43b470[_0x5c71e3(0x308)]))
    var _0x42d6e1 = 0x0
    for (var _0x4ed100 of _0x43b470) {
      _0x42d6e1 += lengthBytesUTF8(_0x4ed100) + 0x1
    }
    return ((HEAPU32[_0x16793f >> 0x2] = _0x42d6e1), checkInt32(_0x42d6e1), 0x0)
  },
  _fd_close = (_0x81d0f6) => {
    var _0x4ae350 = a0_0x5889c6
    abort(_0x4ae350(0x15c))
  },
  _fd_read = (_0x36ab17, _0x29cfe9, _0x26129b, _0xd44f9a) => {
    var _0x95febb = a0_0x5889c6
    abort(_0x95febb(0x184))
  }
function _fd_seek(_0x4b668e, _0x16aac2, _0x5a7f78, _0x5bac33) {
  return ((_0x16aac2 = bigintToI53Checked(_0x16aac2)), 0x46)
}
var printCharBuffers = [null, [], []],
  printChar = (_0xcbfb79, _0x133c3c) => {
    var _0x387ed6 = a0_0x5889c6,
      _0x15593c = printCharBuffers[_0xcbfb79]
    ;(assert(_0x15593c),
      _0x133c3c === 0x0 || _0x133c3c === 0xa
        ? ((_0xcbfb79 === 0x1 ? out : err)(UTF8ArrayToString(_0x15593c)),
          (_0x15593c[_0x387ed6(0x308)] = 0x0))
        : _0x15593c[_0x387ed6(0x364)](_0x133c3c))
  },
  flush_NO_FILESYSTEM = () => {
    var _0x193e61 = a0_0x5889c6
    _fflush(0x0)
    if (printCharBuffers[0x1][_0x193e61(0x308)]) printChar(0x1, 0xa)
    if (printCharBuffers[0x2][_0x193e61(0x308)]) printChar(0x2, 0xa)
  },
  _fd_write = (_0x176540, _0xe86253, _0x2d73ed, _0x41c2a9) => {
    var _0x212cff = 0x0
    for (var _0x565760 = 0x0; _0x565760 < _0x2d73ed; _0x565760++) {
      var _0x3f20b5 = HEAPU32[_0xe86253 >> 0x2],
        _0x4cdf49 = HEAPU32[(_0xe86253 + 0x4) >> 0x2]
      _0xe86253 += 0x8
      for (var _0x187234 = 0x0; _0x187234 < _0x4cdf49; _0x187234++) {
        printChar(_0x176540, HEAPU8[_0x3f20b5 + _0x187234])
      }
      _0x212cff += _0x4cdf49
    }
    return ((HEAPU32[_0x41c2a9 >> 0x2] = _0x212cff), checkInt32(_0x212cff), 0x0)
  },
  initRandomFill = () => {
    var _0x87fe4b = a0_0x5889c6
    if (ENVIRONMENT_IS_NODE) {
      var _0x412a2b = require(_0x87fe4b(0x30e))
      return (_0x553cf7) => _0x412a2b[_0x87fe4b(0x339)](_0x553cf7)
    }
    return (_0x335e89) => crypto[_0x87fe4b(0x1f7)](_0x335e89)
  },
  randomFill = (_0x16f2ca) => {
    ;(randomFill = initRandomFill())(_0x16f2ca)
  },
  _random_get = (_0x489cd8, _0x378ad1) => {
    var _0x286fe4 = a0_0x5889c6
    return (
      randomFill(HEAPU8[_0x286fe4(0x320)](_0x489cd8, _0x489cd8 + _0x378ad1)),
      0x0
    )
  },
  getCFunc = (_0x5bc19a) => {
    var _0x243cff = a0_0x5889c6,
      _0x5b1407 = Module['_' + _0x5bc19a]
    return (
      assert(
        _0x5b1407,
        'Cannot\x20call\x20unknown\x20function\x20' +
          _0x5bc19a +
          _0x243cff(0x25c)
      ),
      _0x5b1407
    )
  },
  writeArrayToMemory = (_0x68143f, _0x4e5983) => {
    var _0x2fb58c = a0_0x5889c6
    ;(assert(_0x68143f['length'] >= 0x0, _0x2fb58c(0x40d)),
      HEAP8[_0x2fb58c(0x125)](_0x68143f, _0x4e5983))
  },
  stackAlloc = (_0x35aeda) => __emscripten_stack_alloc(_0x35aeda),
  stringToUTF8OnStack = (_0x546824) => {
    var _0x8a229a = lengthBytesUTF8(_0x546824) + 0x1,
      _0x5cdff4 = stackAlloc(_0x8a229a)
    return (stringToUTF8(_0x546824, _0x5cdff4, _0x8a229a), _0x5cdff4)
  },
  ccall = (_0x5f116b, _0x254e84, _0x5bdf09, _0x1d33d6, _0xc73ccc) => {
    var _0x161aeb = a0_0x5889c6,
      _0x37ac82 = {
        string: (_0x2e660b) => {
          var _0x492115 = 0x0
          return (
            _0x2e660b !== null &&
              _0x2e660b !== undefined &&
              _0x2e660b !== 0x0 &&
              (_0x492115 = stringToUTF8OnStack(_0x2e660b)),
            _0x492115
          )
        },
        array: (_0xaf84ac) => {
          var _0x532657 = a0_0x1c46,
            _0x1367df = stackAlloc(_0xaf84ac[_0x532657(0x308)])
          return (writeArrayToMemory(_0xaf84ac, _0x1367df), _0x1367df)
        },
      }
    function _0x3f0901(_0x301370) {
      var _0x103f0a = a0_0x1c46
      if (_0x254e84 === _0x103f0a(0x21f)) return UTF8ToString(_0x301370)
      if (_0x254e84 === 'boolean') return Boolean(_0x301370)
      return _0x301370
    }
    var _0x2819f2 = getCFunc(_0x5f116b),
      _0x3887ee = [],
      _0x48e4e5 = 0x0
    assert(_0x254e84 !== _0x161aeb(0x11b), _0x161aeb(0x391))
    if (_0x1d33d6)
      for (
        var _0x136356 = 0x0;
        _0x136356 < _0x1d33d6[_0x161aeb(0x308)];
        _0x136356++
      ) {
        var _0x122e37 = _0x37ac82[_0x5bdf09[_0x136356]]
        if (_0x122e37) {
          if (_0x48e4e5 === 0x0) _0x48e4e5 = stackSave()
          _0x3887ee[_0x136356] = _0x122e37(_0x1d33d6[_0x136356])
        } else _0x3887ee[_0x136356] = _0x1d33d6[_0x136356]
      }
    var _0x1870fc = _0x2819f2(..._0x3887ee)
    function _0x4f22e9(_0x474bd3) {
      if (_0x48e4e5 !== 0x0) stackRestore(_0x48e4e5)
      return _0x3f0901(_0x474bd3)
    }
    return ((_0x1870fc = _0x4f22e9(_0x1870fc)), _0x1870fc)
  },
  cwrap =
    (_0x4b1703, _0x773a2a, _0x5df544, _0x30c64d) =>
    (..._0x58e556) =>
      ccall(_0x4b1703, _0x773a2a, _0x5df544, _0x58e556, _0x30c64d)
;(init_ClassHandle(),
  init_RegisteredPointer(),
  assert(emval_handles[a0_0x5889c6(0x308)] === 0x5 * 0x2),
  Fetch[a0_0x5889c6(0x40a)]())
{
  if (Module[a0_0x5889c6(0x1a7)]) noExitRuntime = Module[a0_0x5889c6(0x1a7)]
  if (Module[a0_0x5889c6(0x2d4)]) out = Module[a0_0x5889c6(0x2d4)]
  if (Module[a0_0x5889c6(0x1ae)]) err = Module[a0_0x5889c6(0x1ae)]
  if (Module[a0_0x5889c6(0x325)]) wasmBinary = Module[a0_0x5889c6(0x325)]
  ;((Module['FS_createDataFile'] = FS[a0_0x5889c6(0x151)]),
    (Module['FS_createPreloadedFile'] = FS[a0_0x5889c6(0x3ce)]),
    checkIncomingModuleAPI())
  if (Module['arguments']) arguments_ = Module[a0_0x5889c6(0x1ac)]
  if (Module['thisProgram']) thisProgram = Module[a0_0x5889c6(0x209)]
  ;(assert(
    typeof Module[a0_0x5889c6(0x360)] == a0_0x5889c6(0x343),
    'Module.memoryInitializerPrefixURL\x20option\x20was\x20removed,\x20use\x20Module.locateFile\x20instead'
  ),
    assert(
      typeof Module['pthreadMainPrefixURL'] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x254)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x1a3)] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x397)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x41f)] == 'undefined',
      a0_0x5889c6(0x2df)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x1ab)] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x1c8)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x407)] == a0_0x5889c6(0x343),
      'Module.readAsync\x20option\x20was\x20removed\x20(modify\x20readAsync\x20in\x20JS)'
    ),
    assert(
      typeof Module[a0_0x5889c6(0x202)] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x3fe)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x2cb)] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x3e5)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x20f)] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x1b0)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x1b8)] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x2d9)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x35b)] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x3f7)
    ),
    assert(
      typeof Module[a0_0x5889c6(0x3f5)] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x2e1)
    ),
    assert(
      typeof Module['INITIAL_MEMORY'] == a0_0x5889c6(0x343),
      a0_0x5889c6(0x2ff)
    ))
}
;((Module[a0_0x5889c6(0x3f5)] = wasmMemory),
  (Module[a0_0x5889c6(0x189)] = ccall),
  (Module['cwrap'] = cwrap),
  (Module[a0_0x5889c6(0x28b)] = setValue),
  (Module[a0_0x5889c6(0x3b9)] = getValue))
var missingLibrarySymbols = [
  a0_0x5889c6(0x210),
  'writeI53ToI64Signaling',
  a0_0x5889c6(0x2db),
  'writeI53ToU64Signaling',
  a0_0x5889c6(0x3f2),
  a0_0x5889c6(0x260),
  a0_0x5889c6(0x18e),
  a0_0x5889c6(0x193),
  a0_0x5889c6(0x1a8),
  a0_0x5889c6(0x352),
  'withStackSave',
  a0_0x5889c6(0x3f9),
  a0_0x5889c6(0x338),
  a0_0x5889c6(0x304),
  a0_0x5889c6(0x279),
  a0_0x5889c6(0x3ba),
  a0_0x5889c6(0x225),
  'writeSockaddr',
  a0_0x5889c6(0x194),
  'autoResumeAudioContext',
  a0_0x5889c6(0x390),
  a0_0x5889c6(0x176),
  a0_0x5889c6(0x2fa),
  a0_0x5889c6(0x195),
  'asmjsMangle',
  a0_0x5889c6(0x3df),
  a0_0x5889c6(0x233),
  'getNativeTypeSize',
  a0_0x5889c6(0x3f8),
  a0_0x5889c6(0x17e),
  a0_0x5889c6(0x123),
  a0_0x5889c6(0x312),
  'addOnExit',
  a0_0x5889c6(0x35b),
  a0_0x5889c6(0x190),
  a0_0x5889c6(0x1e3),
  a0_0x5889c6(0x139),
  a0_0x5889c6(0x17f),
  a0_0x5889c6(0x36f),
  a0_0x5889c6(0x1dd),
  a0_0x5889c6(0x2ce),
  a0_0x5889c6(0x327),
  'removeFunction',
  a0_0x5889c6(0x1fa),
  a0_0x5889c6(0x372),
  'stringToAscii',
  a0_0x5889c6(0x13a),
  a0_0x5889c6(0x17d),
  a0_0x5889c6(0x368),
  a0_0x5889c6(0x411),
  a0_0x5889c6(0x1ad),
  a0_0x5889c6(0x25f),
  a0_0x5889c6(0x1f5),
  a0_0x5889c6(0x37a),
  a0_0x5889c6(0x1fb),
  a0_0x5889c6(0x200),
  a0_0x5889c6(0x3ab),
  a0_0x5889c6(0x398),
  'registerDeviceMotionEventCallback',
  a0_0x5889c6(0x234),
  'fillOrientationChangeEventData',
  a0_0x5889c6(0x24f),
  a0_0x5889c6(0x296),
  a0_0x5889c6(0x2b9),
  a0_0x5889c6(0x2ac),
  a0_0x5889c6(0x336),
  a0_0x5889c6(0x3ec),
  'hideEverythingExceptGivenElement',
  a0_0x5889c6(0x383),
  a0_0x5889c6(0x2c0),
  'softFullscreenResizeWebGLRenderTarget',
  a0_0x5889c6(0x2c8),
  'fillPointerlockChangeEventData',
  a0_0x5889c6(0x1b6),
  a0_0x5889c6(0x2bc),
  a0_0x5889c6(0x2a5),
  a0_0x5889c6(0x169),
  'registerVisibilityChangeEventCallback',
  a0_0x5889c6(0x270),
  a0_0x5889c6(0x3a7),
  a0_0x5889c6(0x40c),
  a0_0x5889c6(0x2d5),
  'fillBatteryEventData',
  a0_0x5889c6(0x26e),
  a0_0x5889c6(0x423),
  'getCanvasElementSize',
  a0_0x5889c6(0x349),
  'getCallstack',
  a0_0x5889c6(0x152),
  a0_0x5889c6(0x2ed),
  'wasiOFlagsToMuslOFlags',
  a0_0x5889c6(0x3a5),
  a0_0x5889c6(0x306),
  a0_0x5889c6(0x3b1),
  'clearImmediateWrapped',
  a0_0x5889c6(0x2ad),
  a0_0x5889c6(0x41d),
  a0_0x5889c6(0x1f0),
  a0_0x5889c6(0x229),
  a0_0x5889c6(0x1e2),
  'makePromiseCallback',
  'findMatchingCatch',
  'Browser_asyncPrepareDataCounter',
  a0_0x5889c6(0x16f),
  a0_0x5889c6(0x38a),
  a0_0x5889c6(0x19f),
  a0_0x5889c6(0x347),
  a0_0x5889c6(0x35d),
  'toTypedArrayIndex',
  a0_0x5889c6(0x137),
  a0_0x5889c6(0x403),
  a0_0x5889c6(0x227),
  a0_0x5889c6(0x3ea),
  a0_0x5889c6(0x12f),
  a0_0x5889c6(0x34f),
  a0_0x5889c6(0x2fe),
  a0_0x5889c6(0x3b8),
  a0_0x5889c6(0x131),
  a0_0x5889c6(0x27c),
  a0_0x5889c6(0x149),
  a0_0x5889c6(0x3fd),
  a0_0x5889c6(0x21a),
  a0_0x5889c6(0x1e7),
  a0_0x5889c6(0x281),
  a0_0x5889c6(0x32a),
  a0_0x5889c6(0x148),
  a0_0x5889c6(0x344),
  a0_0x5889c6(0x424),
  a0_0x5889c6(0x21b),
  a0_0x5889c6(0x342),
  a0_0x5889c6(0x34c),
  a0_0x5889c6(0x252),
  a0_0x5889c6(0x27b),
  a0_0x5889c6(0x150),
  a0_0x5889c6(0x1a9),
  a0_0x5889c6(0x3bc),
  a0_0x5889c6(0x3fa),
  a0_0x5889c6(0x395),
  'PureVirtualError',
  a0_0x5889c6(0x3e1),
  a0_0x5889c6(0x32f),
  'getInheritedInstanceCount',
  'getLiveInheritedInstances',
  a0_0x5889c6(0x2d7),
  a0_0x5889c6(0x294),
  a0_0x5889c6(0x1fe),
]
missingLibrarySymbols[a0_0x5889c6(0x3fc)](missingLibrarySymbol)
var unexportedSymbols = [
  a0_0x5889c6(0x37c),
  'addRunDependency',
  a0_0x5889c6(0x380),
  a0_0x5889c6(0x1db),
  a0_0x5889c6(0x335),
  'callMain',
  a0_0x5889c6(0x30f),
  a0_0x5889c6(0x251),
  a0_0x5889c6(0x41b),
  a0_0x5889c6(0x3a9),
  a0_0x5889c6(0x31e),
  'HEAP16',
  'HEAPU16',
  'HEAP32',
  a0_0x5889c6(0x213),
  'HEAP64',
  a0_0x5889c6(0x31f),
  a0_0x5889c6(0x287),
  a0_0x5889c6(0x3d9),
  a0_0x5889c6(0x316),
  'readI53FromI64',
  a0_0x5889c6(0x164),
  a0_0x5889c6(0x198),
  a0_0x5889c6(0x305),
  a0_0x5889c6(0x30d),
  a0_0x5889c6(0x1d3),
  a0_0x5889c6(0x222),
  'stackAlloc',
  a0_0x5889c6(0x3a0),
  a0_0x5889c6(0x3b2),
  a0_0x5889c6(0x20d),
  a0_0x5889c6(0x2ae),
  'ENV',
  a0_0x5889c6(0x3b6),
  a0_0x5889c6(0x182),
  a0_0x5889c6(0x241),
  'Protocols',
  'Sockets',
  a0_0x5889c6(0x1a4),
  a0_0x5889c6(0x36b),
  'readEmAsmArgsArray',
  a0_0x5889c6(0x163),
  a0_0x5889c6(0x3ac),
  'runMainThreadEmAsm',
  a0_0x5889c6(0x3fb),
  a0_0x5889c6(0x2d3),
  a0_0x5889c6(0x41e),
  a0_0x5889c6(0x37b),
  a0_0x5889c6(0x291),
  a0_0x5889c6(0x197),
  a0_0x5889c6(0x170),
  a0_0x5889c6(0x28c),
  'noExitRuntime',
  a0_0x5889c6(0x3e3),
  a0_0x5889c6(0x2ee),
  a0_0x5889c6(0x301),
  'functionsInTableMap',
  a0_0x5889c6(0x412),
  a0_0x5889c6(0x1d8),
  a0_0x5889c6(0x310),
  a0_0x5889c6(0x267),
  a0_0x5889c6(0x401),
  a0_0x5889c6(0x1eb),
  'stringToUTF8',
  a0_0x5889c6(0x1f1),
  'AsciiToString',
  a0_0x5889c6(0x365),
  'UTF16ToString',
  a0_0x5889c6(0x1ec),
  'lengthBytesUTF16',
  a0_0x5889c6(0x1c0),
  'stringToUTF32',
  a0_0x5889c6(0x2e7),
  a0_0x5889c6(0x1b2),
  a0_0x5889c6(0x1ff),
  a0_0x5889c6(0x375),
  'specialHTMLTargets',
  'findCanvasEventTarget',
  a0_0x5889c6(0x1ef),
  a0_0x5889c6(0x22f),
  a0_0x5889c6(0x2d0),
  a0_0x5889c6(0x2f8),
  a0_0x5889c6(0x134),
  a0_0x5889c6(0x292),
  a0_0x5889c6(0x377),
  a0_0x5889c6(0x11d),
  a0_0x5889c6(0x333),
  a0_0x5889c6(0x361),
  a0_0x5889c6(0x419),
  a0_0x5889c6(0x389),
  'promiseMap',
  a0_0x5889c6(0x3d5),
  a0_0x5889c6(0x136),
  a0_0x5889c6(0x1c3),
  'ExceptionInfo',
  a0_0x5889c6(0x256),
  a0_0x5889c6(0x295),
  a0_0x5889c6(0x3d0),
  'setCanvasSize',
  a0_0x5889c6(0x1cd),
  a0_0x5889c6(0x211),
  'getPreloadedImageData__data',
  'wget',
  a0_0x5889c6(0x232),
  a0_0x5889c6(0x217),
  a0_0x5889c6(0x2a7),
  a0_0x5889c6(0x11f),
  a0_0x5889c6(0x392),
  a0_0x5889c6(0x330),
  a0_0x5889c6(0x15e),
  a0_0x5889c6(0x297),
  a0_0x5889c6(0x146),
  a0_0x5889c6(0x239),
  'GL',
  'AL',
  a0_0x5889c6(0x128),
  a0_0x5889c6(0x1b1),
  'GLEW',
  a0_0x5889c6(0x3d4),
  a0_0x5889c6(0x3b0),
  'SDL_gfx',
  a0_0x5889c6(0x2b2),
  a0_0x5889c6(0x1aa),
  a0_0x5889c6(0x2d4),
  a0_0x5889c6(0x1ae),
  a0_0x5889c6(0x16a),
  'InternalError',
  'BindingError',
  a0_0x5889c6(0x153),
  a0_0x5889c6(0x2be),
  a0_0x5889c6(0x226),
  a0_0x5889c6(0x36d),
  a0_0x5889c6(0x3bb),
  a0_0x5889c6(0x420),
  a0_0x5889c6(0x38e),
  a0_0x5889c6(0x168),
  a0_0x5889c6(0x127),
  a0_0x5889c6(0x422),
  a0_0x5889c6(0x366),
  'heap32VectorToArray',
  'requireRegisteredType',
  a0_0x5889c6(0x278),
  a0_0x5889c6(0x2ca),
  a0_0x5889c6(0x23f),
  'getRequiredArgCount',
  a0_0x5889c6(0x22a),
  a0_0x5889c6(0x3c5),
  a0_0x5889c6(0x201),
  a0_0x5889c6(0x165),
  a0_0x5889c6(0x35a),
  'ensureOverloadTable',
  a0_0x5889c6(0x221),
  'replacePublicSymbol',
  a0_0x5889c6(0x3f3),
  a0_0x5889c6(0x415),
  a0_0x5889c6(0x326),
  a0_0x5889c6(0x2f2),
  a0_0x5889c6(0x3a6),
  a0_0x5889c6(0x337),
  a0_0x5889c6(0x208),
  a0_0x5889c6(0x3e9),
  a0_0x5889c6(0x1ca),
  a0_0x5889c6(0x188),
  a0_0x5889c6(0x3c1),
  'readPointer',
  a0_0x5889c6(0x24a),
  a0_0x5889c6(0x346),
  'embind__requireFunction',
  a0_0x5889c6(0x26b),
  a0_0x5889c6(0x3dc),
  a0_0x5889c6(0x315),
  a0_0x5889c6(0x1bd),
  a0_0x5889c6(0x2da),
  a0_0x5889c6(0x24e),
  a0_0x5889c6(0x25b),
  a0_0x5889c6(0x286),
  a0_0x5889c6(0x2fd),
  a0_0x5889c6(0x186),
  a0_0x5889c6(0x15d),
  a0_0x5889c6(0x25a),
  a0_0x5889c6(0x386),
  a0_0x5889c6(0x3d8),
  'ClassHandle',
  'throwInstanceAlreadyDeleted',
  a0_0x5889c6(0x355),
  a0_0x5889c6(0x387),
  'delayFunction',
  a0_0x5889c6(0x2c9),
  a0_0x5889c6(0x16d),
  a0_0x5889c6(0x414),
  a0_0x5889c6(0x2f6),
  'char_0',
  a0_0x5889c6(0x280),
  'makeLegalFunctionName',
  a0_0x5889c6(0x396),
  'emval_handles',
  'emval_symbols',
  a0_0x5889c6(0x1dc),
  a0_0x5889c6(0x2ef),
  a0_0x5889c6(0x130),
  a0_0x5889c6(0x262),
  a0_0x5889c6(0x18f),
  a0_0x5889c6(0x23d),
  'emval_addMethodCaller',
  'Fetch',
  a0_0x5889c6(0x23b),
  a0_0x5889c6(0x269),
  a0_0x5889c6(0x33e),
  a0_0x5889c6(0x2ab),
]
;(unexportedSymbols[a0_0x5889c6(0x3fc)](unexportedRuntimeSymbol),
  (Module['stringToNewUTF8'] = stringToNewUTF8))
function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings')
}
var ASM_CONSTS = {
  0x1ad4e0: () => {
    var _0x37f1d2 = a0_0x5889c6
    if (
      typeof Module !== _0x37f1d2(0x343) &&
      Module &&
      Module[_0x37f1d2(0x181)]
    )
      return Module[_0x37f1d2(0x181)]['byteLength'] || 0x0
    return 0x0
  },
  0x1ad556: () => {
    var _0x93a75a = navigator['userAgent']
    return stringToNewUTF8(_0x93a75a)
  },
  0x1ad5a0: () => {
    var _0x54330f = a0_0x5889c6
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i[
      _0x54330f(0x40e)
    ](navigator['userAgent'])
      ? 0x0
      : 0x1
  },
  0x1ad623: (_0x1d6844, _0x32b564) => {
    var _0x2a4b94 = a0_0x5889c6
    if (typeof crypto !== _0x2a4b94(0x343) && crypto[_0x2a4b94(0x1f7)]) {
      var _0x397b61 = HEAPU8[_0x2a4b94(0x320)](_0x1d6844, _0x1d6844 + _0x32b564)
      return (crypto[_0x2a4b94(0x1f7)](_0x397b61), 0x1)
    }
    return 0x0
  },
  0x1ad6c3: (_0x46f27f, _0x2cc423) => {
    var _0x39cd9d = a0_0x5889c6
    const _0x590725 = new Uint8Array(
        HEAPU8[_0x39cd9d(0x243)],
        _0x46f27f,
        _0x2cc423
      ),
      _0x4f3d40 = new ArrayBuffer(_0x2cc423),
      _0x35e338 = new Uint8Array(_0x4f3d40)
    _0x35e338[_0x39cd9d(0x125)](_0x590725)
    const _0x1985ea = 0x40,
      _0xfb2435 = stringToNewUTF8('0'[_0x39cd9d(0x274)](_0x1985ea)),
      _0x5d1831 = crypto[_0x39cd9d(0x1e5)]
        [_0x39cd9d(0x385)](_0x39cd9d(0x405), _0x35e338)
        ['then']((_0x5218d4) =>
          Array['from'](new Uint8Array(_0x5218d4))
            [_0x39cd9d(0x268)]((_0x3d3b67) =>
              _0x3d3b67[_0x39cd9d(0x2eb)](0x10)[_0x39cd9d(0x3aa)](0x2, '0')
            )
            [_0x39cd9d(0x400)]('')
            [_0x39cd9d(0x3ad)]()
        )
        ['then']((_0x1c86ec) => stringToUTF8(_0x1c86ec, _0xfb2435, _0xfb2435))
        [_0x39cd9d(0x2ea)]((_0xeef6d1) => {
          var _0x105cff = _0x39cd9d
          if (_0xeef6d1 !== _0x1985ea) return Promise[_0x105cff(0x159)]()
        }),
      _0x1ff3b6 = crypto[_0x39cd9d(0x3c6)]()[_0x39cd9d(0x3e6)](/-/g, '')
    return (
      (globalThis[_0x39cd9d(0x1b9)] = globalThis[_0x39cd9d(0x1b9)] || {}),
      (globalThis[_0x39cd9d(0x1b9)][
        (BigInt(_0xfb2435) ^ BigInt('0x' + _0x1ff3b6))
          [_0x39cd9d(0x2eb)](0x10)
          [_0x39cd9d(0x3aa)](0x20, '0')
      ] = _0x5d1831),
      stringToNewUTF8(
        _0x1ff3b6 + _0xfb2435[_0x39cd9d(0x2eb)](0x10)['padStart'](0x20, '0')
      )
    )
  },
}
function setupPinchZoomImpl() {
  ;(function () {
    var _0x4dc1d6 = a0_0x1c46
    const _0x48dc44 = Module[_0x4dc1d6(0x3dd)],
      _0xc969a1 = [
        _0x48dc44[_0x4dc1d6(0x3e4)](_0x4dc1d6(0x185)),
        _0x48dc44['getElementById']('brightnessText'),
        _0x48dc44['getElementById'](_0x4dc1d6(0x1c6)),
        _0x48dc44['getElementById'](_0x4dc1d6(0x1cb)),
        _0x48dc44[_0x4dc1d6(0x3e4)](_0x4dc1d6(0x307)),
        _0x48dc44[_0x4dc1d6(0x3e4)](_0x4dc1d6(0x162)),
        _0x48dc44[_0x4dc1d6(0x3e4)]('start'),
        _0x48dc44['getElementById']('activeVerificationButtonReady'),
        _0x48dc44[_0x4dc1d6(0x3e4)](_0x4dc1d6(0x1ea)),
      ][_0x4dc1d6(0x11a)]((_0xeb1430) => _0xeb1430),
      _0x7ab060 = new Map()
    _0xc969a1[_0x4dc1d6(0x3fc)]((_0x314b1a) => {
      var _0x3563 = _0x4dc1d6
      const _0x4696c1 = window[_0x3563(0x14c)](_0x314b1a),
        _0x432d77 = parseFloat(_0x4696c1['fontSize'])
      _0x7ab060[_0x3563(0x125)](_0x314b1a, _0x432d77)
    })
    const _0x5335e9 = 0x1,
      _0x2763dc = 0x2
    let _0x361578 = 0x0,
      _0x5d48d4 = 0x1
    function _0x369059(_0x144a09, _0x5559fa) {
      var _0x38cb23 = _0x4dc1d6
      const _0xa227ef =
          _0x5559fa[_0x38cb23(0x13f)] - _0x144a09[_0x38cb23(0x13f)],
        _0x35ca1f = _0x5559fa['clientY'] - _0x144a09['clientY']
      return Math[_0x38cb23(0x13e)](
        _0xa227ef * _0xa227ef + _0x35ca1f * _0x35ca1f
      )
    }
    function _0x5ab1bc() {
      _0xc969a1['forEach']((_0x475637) => {
        var _0x3f837f = a0_0x1c46
        const _0x308fa4 = _0x7ab060[_0x3f837f(0x2dc)](_0x475637)
        _0x475637[_0x3f837f(0x1b5)][_0x3f837f(0x28e)] =
          _0x308fa4 * _0x5d48d4 + 'px'
      })
    }
    function _0x9f2944(_0x4d7079) {
      var _0x11c7e5 = _0x4dc1d6
      _0x4d7079[_0x11c7e5(0x1c4)][_0x11c7e5(0x308)] === 0x2 &&
        (_0x361578 = _0x369059(
          _0x4d7079['touches'][0x0],
          _0x4d7079[_0x11c7e5(0x1c4)][0x1]
        ))
    }
    function _0x370ec0(_0x443b6c) {
      var _0x4a0868 = _0x4dc1d6
      if (_0x443b6c['touches'][_0x4a0868(0x308)] === 0x2) {
        _0x443b6c[_0x4a0868(0x174)]()
        const _0xdebe49 = _0x369059(
          _0x443b6c[_0x4a0868(0x1c4)][0x0],
          _0x443b6c[_0x4a0868(0x1c4)][0x1]
        )
        if (_0x361578 > 0x0) {
          const _0x326084 = _0xdebe49 / _0x361578
          ;((_0x5d48d4 *= _0x326084),
            (_0x5d48d4 = Math[_0x4a0868(0x204)](
              _0x5335e9,
              Math[_0x4a0868(0x290)](_0x2763dc, _0x5d48d4)
            )),
            _0x5ab1bc(),
            (_0x361578 = _0xdebe49))
        }
      }
    }
    function _0x5a0836(_0x4162be) {
      var _0x586d15 = _0x4dc1d6
      _0x4162be['touches'][_0x586d15(0x308)] < 0x2 && (_0x361578 = 0x0)
    }
    function _0x4dede8(_0x1c5fc1) {
      var _0x55a544 = _0x4dc1d6
      if (_0x1c5fc1[_0x55a544(0x35f)]) {
        _0x1c5fc1[_0x55a544(0x174)]()
        const _0x3b335d = -_0x1c5fc1[_0x55a544(0x244)],
          _0x9cd69a = 0x1 + _0x3b335d / 0x3e8
        ;((_0x5d48d4 *= _0x9cd69a),
          (_0x5d48d4 = Math[_0x55a544(0x204)](
            _0x5335e9,
            Math['min'](_0x2763dc, _0x5d48d4)
          )),
          _0x5ab1bc())
      }
    }
    const _0x1a24c4 = _0x48dc44[_0x4dc1d6(0x3e4)](_0x4dc1d6(0x283))
    _0x1a24c4 &&
      (_0x1a24c4[_0x4dc1d6(0x12d)](_0x4dc1d6(0x26a), _0x9f2944, {
        passive: ![],
      }),
      _0x1a24c4[_0x4dc1d6(0x12d)](_0x4dc1d6(0x3a1), _0x370ec0, {
        passive: ![],
      }),
      _0x1a24c4['addEventListener']('touchend', _0x5a0836, { passive: ![] }),
      _0x1a24c4[_0x4dc1d6(0x12d)](_0x4dc1d6(0x1c7), _0x4dede8, {
        passive: ![],
      }))
  })()
}
var _malloc = (Module['_malloc'] = makeInvalidEarlyAccess(a0_0x5889c6(0x1d2))),
  _free = (Module[a0_0x5889c6(0x15b)] = makeInvalidEarlyAccess(
    a0_0x5889c6(0x15b)
  )),
  _fflush = makeInvalidEarlyAccess('_fflush'),
  ___getTypeName = makeInvalidEarlyAccess(a0_0x5889c6(0x3f4)),
  _emscripten_stack_get_end = makeInvalidEarlyAccess(
    '_emscripten_stack_get_end'
  ),
  _emscripten_stack_get_base = makeInvalidEarlyAccess(
    '_emscripten_stack_get_base'
  ),
  _emscripten_stack_init = makeInvalidEarlyAccess('_emscripten_stack_init'),
  _emscripten_stack_get_free = makeInvalidEarlyAccess(a0_0x5889c6(0x15f)),
  __emscripten_stack_restore = makeInvalidEarlyAccess(a0_0x5889c6(0x3db)),
  __emscripten_stack_alloc = makeInvalidEarlyAccess(a0_0x5889c6(0x1f3)),
  _emscripten_stack_get_current = makeInvalidEarlyAccess(
    '_emscripten_stack_get_current'
  ),
  ___set_stack_limits = (Module[a0_0x5889c6(0x167)] = makeInvalidEarlyAccess(
    a0_0x5889c6(0x167)
  ))
function assignWasmExports(_0x248950) {
  var _0x487856 = a0_0x5889c6
  ;((Module['_malloc'] = _malloc = createExportWrapper(_0x487856(0x23a), 0x1)),
    (Module[_0x487856(0x15b)] = _free = createExportWrapper('free', 0x1)),
    (_fflush = createExportWrapper(_0x487856(0x160), 0x1)),
    (___getTypeName = createExportWrapper(_0x487856(0x261), 0x1)),
    (_emscripten_stack_get_end = _0x248950[_0x487856(0x1f9)]),
    (_emscripten_stack_get_base = _0x248950[_0x487856(0x246)]),
    (_emscripten_stack_init = _0x248950[_0x487856(0x329)]),
    (_emscripten_stack_get_free = _0x248950[_0x487856(0x264)]),
    (__emscripten_stack_restore = _0x248950['_emscripten_stack_restore']),
    (__emscripten_stack_alloc = _0x248950[_0x487856(0x39e)]),
    (_emscripten_stack_get_current = _0x248950['emscripten_stack_get_current']),
    (Module['___set_stack_limits'] = ___set_stack_limits =
      createExportWrapper('__set_stack_limits', 0x2)))
}
var wasmImports = {
    __cxa_throw: ___cxa_throw,
    __handle_stack_overflow: ___handle_stack_overflow,
    __syscall_faccessat: ___syscall_faccessat,
    __syscall_fcntl64: ___syscall_fcntl64,
    __syscall_fstat64: ___syscall_fstat64,
    __syscall_getcwd: ___syscall_getcwd,
    __syscall_getdents64: ___syscall_getdents64,
    __syscall_ioctl: ___syscall_ioctl,
    __syscall_lstat64: ___syscall_lstat64,
    __syscall_mkdirat: ___syscall_mkdirat,
    __syscall_newfstatat: ___syscall_newfstatat,
    __syscall_openat: ___syscall_openat,
    __syscall_readlinkat: ___syscall_readlinkat,
    __syscall_rmdir: ___syscall_rmdir,
    __syscall_stat64: ___syscall_stat64,
    __syscall_unlinkat: ___syscall_unlinkat,
    _abort_js: __abort_js,
    _embind_finalize_value_object: __embind_finalize_value_object,
    _embind_register_bigint: __embind_register_bigint,
    _embind_register_bool: __embind_register_bool,
    _embind_register_class: __embind_register_class,
    _embind_register_class_constructor: __embind_register_class_constructor,
    _embind_register_emval: __embind_register_emval,
    _embind_register_enum: __embind_register_enum,
    _embind_register_enum_value: __embind_register_enum_value,
    _embind_register_float: __embind_register_float,
    _embind_register_function: __embind_register_function,
    _embind_register_integer: __embind_register_integer,
    _embind_register_memory_view: __embind_register_memory_view,
    _embind_register_smart_ptr: __embind_register_smart_ptr,
    _embind_register_std_string: __embind_register_std_string,
    _embind_register_std_wstring: __embind_register_std_wstring,
    _embind_register_value_object: __embind_register_value_object,
    _embind_register_value_object_field: __embind_register_value_object_field,
    _embind_register_void: __embind_register_void,
    _emscripten_fetch_get_response_headers:
      __emscripten_fetch_get_response_headers,
    _emscripten_fetch_get_response_headers_length:
      __emscripten_fetch_get_response_headers_length,
    _emval_create_invoker: __emval_create_invoker,
    _emval_decref: __emval_decref,
    _emval_equals: __emval_equals,
    _emval_get_global: __emval_get_global,
    _emval_get_module_property: __emval_get_module_property,
    _emval_get_property: __emval_get_property,
    _emval_incref: __emval_incref,
    _emval_instanceof: __emval_instanceof,
    _emval_invoke: __emval_invoke,
    _emval_is_number: __emval_is_number,
    _emval_new_array: __emval_new_array,
    _emval_new_cstring: __emval_new_cstring,
    _emval_new_object: __emval_new_object,
    _emval_run_destructors: __emval_run_destructors,
    _emval_set_property: __emval_set_property,
    _emval_typeof: __emval_typeof,
    _gmtime_js: __gmtime_js,
    _localtime_js: __localtime_js,
    _mktime_js: __mktime_js,
    _mmap_js: __mmap_js,
    _munmap_js: __munmap_js,
    _tzset_js: __tzset_js,
    clock_time_get: _clock_time_get,
    emscripten_asm_const_double: _emscripten_asm_const_double,
    emscripten_asm_const_int: _emscripten_asm_const_int,
    emscripten_asm_const_int_sync_on_main_thread:
      _emscripten_asm_const_int_sync_on_main_thread,
    emscripten_asm_const_ptr: _emscripten_asm_const_ptr,
    emscripten_date_now: _emscripten_date_now,
    emscripten_fetch_free: _emscripten_fetch_free,
    emscripten_get_heap_max: _emscripten_get_heap_max,
    emscripten_get_now: _emscripten_get_now,
    emscripten_is_main_browser_thread: _emscripten_is_main_browser_thread,
    emscripten_resize_heap: _emscripten_resize_heap,
    emscripten_start_fetch: _emscripten_start_fetch,
    environ_get: _environ_get,
    environ_sizes_get: _environ_sizes_get,
    fd_close: _fd_close,
    fd_read: _fd_read,
    fd_seek: _fd_seek,
    fd_write: _fd_write,
    random_get: _random_get,
    setupPinchZoomImpl: setupPinchZoomImpl,
  },
  wasmExports
createWasm()
var calledRun
function stackCheckInit() {
  ;(_emscripten_stack_init(), writeStackCookie())
}
function run() {
  var _0x19402d = a0_0x5889c6
  if (runDependencies > 0x0) {
    dependenciesFulfilled = run
    return
  }
  ;(stackCheckInit(), preRun())
  if (runDependencies > 0x0) {
    dependenciesFulfilled = run
    return
  }
  function _0x4ab478() {
    var _0xcb758e = a0_0x1c46
    ;(assert(!calledRun), (calledRun = !![]), (Module[_0xcb758e(0x1a6)] = !![]))
    if (ABORT) return
    ;(initRuntime(),
      Module['onRuntimeInitialized']?.(),
      consumedModuleProp(_0xcb758e(0x1e1)),
      assert(!Module[_0xcb758e(0x32e)], _0xcb758e(0x187)),
      postRun())
  }
  ;(Module[_0x19402d(0x3ae)]
    ? (Module[_0x19402d(0x3ae)](_0x19402d(0x183)),
      setTimeout(() => {
        var _0x573ae9 = _0x19402d
        ;(setTimeout(() => Module[_0x573ae9(0x3ae)](''), 0x1), _0x4ab478())
      }, 0x1))
    : _0x4ab478(),
    checkStackCookie())
}
function checkUnflushedContent() {
  var _0x561770 = a0_0x5889c6,
    _0x4433b8 = out,
    _0x4dd946 = err,
    _0x197926 = ![]
  out = err = (_0x3e34ad) => {
    _0x197926 = !![]
  }
  try {
    flush_NO_FILESYSTEM()
  } catch (_0x5c9120) {}
  ;((out = _0x4433b8),
    (err = _0x4dd946),
    _0x197926 && (warnOnce(_0x561770(0x417)), warnOnce(_0x561770(0x2bd))))
}
function preInit() {
  var _0x155ab9 = a0_0x5889c6
  if (Module[_0x155ab9(0x14f)]) {
    if (typeof Module[_0x155ab9(0x14f)] == _0x155ab9(0x22c))
      Module[_0x155ab9(0x14f)] = [Module[_0x155ab9(0x14f)]]
    while (Module[_0x155ab9(0x14f)][_0x155ab9(0x308)] > 0x0) {
      Module[_0x155ab9(0x14f)]['shift']()()
    }
  }
  consumedModuleProp(_0x155ab9(0x14f))
}
;(preInit(), run())
