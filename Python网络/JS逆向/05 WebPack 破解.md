# `WebPack `破解

## Webpack简介

### 概述

 `Webpack`是 `JavaScript` 应用程序的模块打包器。它把一切都视作模块，即可以把开发中的所有资源（图片、`js`文件、`css`文件等 ）都看成模块，通过`loader`（加载器 ）和`plugins`（插件 ）对资源进行处理，打包成符合生产环境部署的前端资源。所有的资源都是通过`JavaScript`渲染出来的。

如果一个页面大部分是`script`标签构成，80%以上是`Webpack`打包，举个例子（财联社官网：http://cls.cn/telegraph ）：

<img src="https://images.drshw.tech/images/notes/image-20220903130725202.png" alt="image-20220903130725202" style="zoom: 50%;" />

### 加载函数

在`Webpack`中，所有模块都会经过一个自执行函数加载后执行，该函数分为三部分：形参，加载器和模块，一般格式为：

`!function(形参){加载器}(模块)`，模块可以是数组或对象，其中每个元素（或值 ）都是函数，通过在加载器中传入索引进行加载执行。

**示例1：**数组形式模块

+ 给需要处理业务的模块进行打包，通过下标取值：

```js
!(function(e) {
  var t = {}
  // 加载器，所有的模块都是从这个函数加载并执行
  function n(r) {
    if (t[r]) { return t[r].exports }
    var o = t[r] = {
      i: r,
      l: false,
      exports: {}
    }
    return e[r].call(o.exports, o, o.exports, n),
    o.l = true,
    o.exports
  }
  // 调用模块，传入模块的索引（从0开始 ）
  n(0)
}([
  // 模块由可由数组组成，数组的每一项都是一个函数
  function() {
    console.log('123456')
  },
  function() {
    console.log('模块2')
  }
]))
```

**示例二：**对象形式模块

+ 给需要处理业务的模块进行打包，通过`key`取值：

```js
!(function(e) {
  var t = {}
  // 加载器，所有的模块都是从这个函数加载并执行
  function n(r) {
    if (t[r]) { return t[r].exports }
    var o = t[r] = {
      i: r,
      l: false,
      exports: {}
    }
    return e[r].call(o.exports, o, o.exports, n),
    o.l = true,
    o.exports
  }
  // 调用模块，传入模块的 key
  n('login')
}({
  // 模块由可由对象组成，对象的每一个key对应的value都是一个函数
  login: function() {
    console.log('login')
  },
  req: function() {
    console.log('req')
  },
  render: function() {
    console.log('render')
  }
}
))
```

### 多个`JS`打包

如果模块比较多，就会将模块打包成JS文件，先定义一个全局变量 `window["webpackJsonp"] = []`，用于存储需要动态导入的模块，然后重写 `window["webpackJsonp"]` 数组的 `push()` 方法，为 `webpackJsonpCallback()`，即 `window["webpackJsonp"].push()` 其实执行的是 `webpackJsonpCallback()`。

`window["webpackJsonp"].push()`接收三个参数，第一个是模块的索引；第二个是一个数组或者对象，里面定义大量的函数；第三个是要调用的函数(可选)。

### 应用场景

说的有些抽象，这里以网站36氪(https://36kr.com)，点击登录 -> 账号密码登录，在`devtool`中搜索`password:`，忽略CSS文件，找到一处加密点，打断点：

<img src="https://images.drshw.tech/images/notes/image-20220903164838098.png" alt="image-20220903164838098" style="zoom:50%;" />

再次点击登录，成功断住。这次我们的重点不放在逆向上，我们来观察该网站`Webpack`的写法：

这里的`i.b`是一个加密函数，我们点进去以后，发现上下文中有很多类似`function(e, t, n){}`的函数，搜索后发现竟有一千多处：

<img src="https://images.drshw.tech/images/notes/image-20220903165106525.png" alt="image-20220903165106525" style="zoom:50%;" />

一般来说，要从这么多函数中，找一个函数，就相当麻烦了。其实，这个函数中的`e, t, n`就是我们刚刚提到`window["webpackJsonp"].push()`接收的三个参数。

在网站的最上方，我们可以看到`window.webpackJsonp`这样的代码：

<img src="https://images.drshw.tech/images/notes/image-20220903165445803.png" alt="image-20220903165445803" style="zoom:50%;" />

这段其实就是为了处理对多个JS的调用，`n(609)`即表示选择模块索引`609`的函数，我们再来找找他的加载器位置，在任意调用`n()`函数处下断点：

<img src="https://images.drshw.tech/images/notes/image-20220903204829170.png" alt="image-20220903204829170" style="zoom:50%;" />

进入`n`函数，即可看到它就是一个加载器，包含`call()`函数和`exports`，与样例一致：

<img src="https://images.drshw.tech/images/notes/image-20220903205108635.png" alt="image-20220903205108635" style="zoom:50%;" />

它的整体也是一个自执行函数，符合样例的形式：

<img src="https://images.drshw.tech/images/notes/image-20220903205203344.png" alt="image-20220903205203344" style="zoom:50%;" />

## 实战案例

`Webpack`中JS逆向主要分为以下步骤：

1. 找到**加载器**；
2. 找到**调用模块**；
3. 构造一个**自执行方法**；
4. **导出**加密方法；
5. 编写自定义方法，并按照流程加密。

从这开始，由于请求过程大同小异，就不给出Python代码了，以讲解JS逆向为主。代码只给出完整JS处理逻辑。

### 案例一

#### 逆向目标

+ 模拟咪咕音乐主页（https://www.kuwo.cn/ ）的登录：

+ 点击登录，快捷登录，会发一个包，请求参数包含了一个`reqId`，且每次请求结果都会不一样：

  <img src="https://images.drshw.tech/images/notes/image-20220903212915132.png" alt="image-20220903212915132" style="zoom:50%;" />

  需要将其逆向。

#### 逆向分析

+ 使用搜索大法，全局搜索`reqId`，得到一条结果，点进去，格式化后再次搜索，下断点并再次登录：

  ![image-20220903213402984](https://images.drshw.tech/images/notes/image-20220903213402984.png)

+ 我们发现参数`n`的密文形式非常像我们的逆向参数，它是由`c()()`函数得来的，我们跟踪之，发现它所在的网站有很明显的`Webpack`打包特征，下断点：

  ![image-20220903215150524](https://images.drshw.tech/images/notes/image-20220903215150524.png)

+ 经过比对发现其中的`e || c(b)`就是需要逆向的加密串，这里应该就加密点。


#### 代码处理

+ 先将模块中定位到的解密函数拷到本地，通过调试工具可以看到三个参数的值分别为`{}, undefined, undefined`，可以直接写死在函数里而非当作参数；

+ 运行后会出现参数未定义的情况，需要按照网站中的参数值进行补足。其中`d`为0，`h`为时间戳，参数`r`、`o`在多次不同的情形下值都一样，暂定可以直接写死；

  最后还缺少一个`c`函数，对其进行定位，把它直接复制到本地：

  <img src="https://images.drshw.tech/images/notes/image-20220903221532109.png" alt="image-20220903221532109" style="zoom:50%;" />

  `c`中缺少一个`n`，追踪之发现它是一个数组，保存的是`00~ff`共256个十六进制数：

  <img src="https://images.drshw.tech/images/notes/image-20220903221943977.png" alt="image-20220903221943977" style="zoom:50%;" />

  可以直接用循环搞定；

补充了一大堆东西后，完整的JS代码如下：

```js
function encryptPassword() {
  var t = {}; var e = undefined; var n = undefined // 参数写死
  var r = [75, 251, 14, 105, 240, 84]; var o = 10653; var d = 0; var h = (new Date()).getTime()// 补足参数r
  var i = e && n || 0
  var b = e || []
  var f = (t = t || {}).node || r
  var v = void 0 !== t.clockseq ? t.clockseq : o
  if (f == null || v == null) {
    var m = l()
    f == null && (f = r = [1 | m[0], m[1], m[2], m[3], m[4], m[5]]),
    v == null && (v = o = 16383 & (m[6] << 8 | m[7]))
  }
  var y = void 0 !== t.msecs ? t.msecs : (new Date()).getTime()
  var w = void 0 !== t.nsecs ? t.nsecs : d + 1
  var dt = y - h + (w - d) / 1e4
  if (dt < 0 && void 0 === t.clockseq && (v = v + 1 & 16383),
  (dt < 0 || y > h) && void 0 === t.nsecs && (w = 0),
  w >= 1e4) { throw new Error("uuid.v1(): Can't create more than 10M uuids/sec") }
  h = y,
  d = w,
  o = v
  var x = (1e4 * (268435455 & (y += 122192928e5)) + w) % 4294967296
  b[i++] = x >>> 24 & 255,
  b[i++] = x >>> 16 & 255,
  b[i++] = x >>> 8 & 255,
  b[i++] = 255 & x
  var _ = y / 4294967296 * 1e4 & 268435455
  b[i++] = _ >>> 8 & 255,
  b[i++] = 255 & _,
  b[i++] = _ >>> 24 & 15 | 16,
  b[i++] = _ >>> 16 & 255,
  b[i++] = v >>> 8 | 128,
  b[i++] = 255 & v
  for (var A = 0; A < 6; ++A) { b[i + A] = f[A] }
  return e || c(b)
}

function c(t, e) {
  for (var n = [], i = 0; i < 256; ++i) {
    n[i] = (i + 256).toString(16).substr(1)
  }
  var i = e || 0
  var r = n
  return [r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], '-', r[t[i++]], r[t[i++]], '-', r[t[i++]], r[t[i++]], '-', r[t[i++]], r[t[i++]], '-', r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]]].join('')
}

let res = encryptPassword()
console.log(res)
```

### 案例二

#### 逆向目标

+ 模拟乐居二手房主页（https://agent.leju.com/ucenter/passportlogin/ ）的登录：

+ 点击使用旧版账号登录，提交数据抓包，发现请求参数`password`被加密：

  <img src="https://images.drshw.tech/images/notes/image-20220903223336181.png" alt="image-20220903223336181" style="zoom:50%;" />

  需要将其逆向。

#### 逆向分析

+ 使用搜索大法，全局搜索`password:`，有个叫做`loginNewxxx`的文件，很可能里面有我们想要的东西，点进去下断点（多下几个总没问题 ），再点击发包：

  <img src="https://images.drshw.tech/images/notes/image-20220903224821176.png" alt="image-20220903224821176" style="zoom:50%;" />

+ 上面有个`encryptedString()`函数，看看是什么东西：

  <img src="https://images.drshw.tech/images/notes/image-20220903224925238.png" alt="image-20220903224925238" style="zoom:50%;" />

  跳转后发现它的加密函数类似于自定义加密，没有办法直接调库解决，尽管提到了`RSAKeyPair`，此处的`RSA`算法也是被修改过的，不方便模拟。

  由于方法开头是`function(t, e, i ,s)`，我们再去文件开头看看它是不是`Webpack`：

  <img src="https://images.drshw.tech/images/notes/image-20220903225211282.png" alt="image-20220903225211282" style="zoom:50%;" />

  很明显这就是个加载器，`Webpack`是坐实了。

+ 由于JS文件很大，想在原本的JS中调试就需要进行**替换**：选择本地文件夹，将源文件保存并覆盖即可修改源代码：

  先在文件开头定义一个变量用于接收要导出的函数，再在模块入口处接收需要的函数：
  
  <img src="https://images.drshw.tech/images/notes/image-20220903230839866.png" alt="image-20220903230839866" style="zoom:50%;" /><img src="https://images.drshw.tech/images/notes/image-20220903230952013.png" alt="image-20220903230952013" style="zoom:50%;" />
  
  再次发包，即可接收到加密函数`_para`，根据程序上下文我们得知`_para.m`可以获取所有函数的编号列表，也可以通过索引获取函数：
  
  ![image-20220903231613769](https://images.drshw.tech/images/notes/image-20220903231613769.png)
  
  下面就是筛选代码的问题。

#### 代码处理

+ 先将加载器拷到本地，这是整个逻辑的核心；

+ 找出对应负责模块，编号应当为305：

  <img src="https://images.drshw.tech/images/notes/image-20220903232500875.png" alt="image-20220903232500875" style="zoom:50%;" />

+ 搬过去后，需要将默认的赋值定位函数调用删去，在这里应当将此行删去：

  <img src="https://images.drshw.tech/images/notes/image-20220903233729440.png" alt="image-20220903233729440" style="zoom:50%;" />

+ 通过`_para(305)`启动函数，会遇到如下错误：

  ![image-20220903233152505](https://images.drshw.tech/images/notes/image-20220903233152505.png)

  这种情况非常常见，一个巧妙的解决方法是在加载器位置打印函数索引`n`，这样的话我们就知道需要调用哪一索引对应的函数了：

  <img src="https://images.drshw.tech/images/notes/image-20220903233424340.png" alt="image-20220903233424340" style="zoom:50%;" />

  再次执行后会打印出一个编号，将对应函数加入模块对象即可，在此处它打印了228，补充后又打印了306，呀嘞呀嘞。

+ 不报错了以后，按原JS逻辑进行调用即可，照抄调用代码，若进行了方法调用，就看该方法属于哪个模块。比如这里的`a`就是调用了编号为228的函数（直接点进去看就行 ），`r`就是调用了编号为228的函数：

  <img src="https://images.drshw.tech/images/notes/image-20220903234754517.png" alt="image-20220903234754517" style="zoom:50%;" />

  `$("#pubkey").val()`是一个写死的字符串，打印照抄即可。

搞定了这些，完整的JS加密逻辑就有了：

```js
var _para = {}
!(function(t) {
  var e = {}
  function i(n) {
    if (e[n]) { return e[n].exports }
    var s = e[n] = {
      i: n,
      l: !1,
      exports: {}
    }
    console.log(n)
    return t[n].call(s.exports, s, s.exports, i),
    s.l = !0,
    s.exports
  }
  i.m = t,
  i.c = e,
  i.d = function(t, e, n) {
    i.o(t, e) || Object.defineProperty(t, e, {
      enumerable: !0,
      get: n
    })
  }
  ,
  i.r = function(t) {
    typeof Symbol !== 'undefined' && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
      value: 'Module'
    }),
    Object.defineProperty(t, '__esModule', {
      value: !0
    })
  }
  ,
  i.t = function(t, e) {
    if (1 & e && (t = i(t)),
    8 & e) { return t }
    if (4 & e && typeof t === 'object' && t && t.__esModule) { return t }
    var n = Object.create(null)
    if (i.r(n),
    Object.defineProperty(n, 'default', {
      enumerable: !0,
      value: t
    }),
    2 & e && typeof t !== 'string') {
      for (var s in t) {
        i.d(n, s, function(e) {
          return t[e]
        }
          .bind(null, s))
      }
    }
    return n
  }
  ,
  i.n = function(t) {
    var e = t && t.__esModule ? function() {
      return t.default
    }
      : function() {
        return t
      }

    return i.d(e, 'a', e),
    e
  }
  ,
  i.o = function(t, e) {
    return Object.prototype.hasOwnProperty.call(t, e)
  }
  ,
  i.p = '//esfres.leju.com/agent_www_new/dist/',
  _para = i
}({
  305: function(t, e, i) {
    'use strict'
    Object.defineProperty(e, '__esModule', {
      value: !0
    }),
    e.encryptedString = e.RSAKeyPair = void 0
    var n = i(228)
    var s = i(306)
    var o = {}
    o.NoPadding = 'NoPadding',
    o.PKCS1Padding = 'PKCS1Padding',
    o.RawEncoding = 'RawEncoding',
    o.NumericEncoding = 'NumericEncoding',
    e.RSAKeyPair = function(t, e, i, o) {
      this.e = (0,
      n.biFromHex)(t),
      this.d = (0,
      n.biFromHex)(e),
      this.m = (0,
      n.biFromHex)(i),
      this.chunkSize = typeof o !== 'number' ? 2 * (0,
      n.biHighIndex)(this.m) : o / 8,
      this.radix = 16,
      this.barrett = new s.BarrettMu(this.m)
    }
    ,
    e.encryptedString = function(t, e, i, s) {
      var a; var r; var l; var c; var u; var d; var p; var h; var f; var g = new Array(); var m = e.length; var y = ''
      for (c = typeof i === 'string' ? i == o.NoPadding ? 1 : i == o.PKCS1Padding ? 2 : 0 : 0,
      u = typeof s === 'string' && s == o.RawEncoding ? 1 : 0,
      c == 1 ? m > t.chunkSize && (m = t.chunkSize) : c == 2 && m > t.chunkSize - 11 && (m = t.chunkSize - 11),
      a = 0,
      r = c == 2 ? m - 1 : t.chunkSize - 1; a < m;) {
        c ? g[r] = e.charCodeAt(a) : g[a] = e.charCodeAt(a),
        a++,
        r--
      }
      for (c == 1 && (a = 0),
      r = t.chunkSize - m % t.chunkSize; r > 0;) {
        if (c == 2) {
          for (d = Math.floor(256 * Math.random()); !d;) { d = Math.floor(256 * Math.random()) }
          g[a] = d
        } else { g[a] = 0 }
        a++,
        r--
      }
      for (c == 2 && (g[m] = 0,
      g[t.chunkSize - 2] = 2,
      g[t.chunkSize - 1] = 0),
      p = g.length,
      a = 0; a < p; a += t.chunkSize) {
        for (h = new n.BigInt(),
        r = 0,
        l = a; l < a + t.chunkSize; ++r) {
          h.digits[r] = g[l++],
          h.digits[r] += g[l++] << 8
        }
        f = t.barrett.powMod(h, t.e),
        y += u == 1 ? biToBytes(f) : t.radix == 16 ? (0,
        n.biToHex)(f) : biToString(f, t.radix)
      }
      return y
    }
  },
  228: function(t, e, i) {
    'use strict'
    Object.defineProperty(e, '__esModule', {
      value: !0
    })
    var n, s
    function o(t) {
      n = new Array(t)
      for (var e = 0; e < n.length; e++) { n[e] = 0 }
      new a(),
      (s = new a()).digits[0] = 1
    }
    o(20)
    l(1e15)
    function a(t) {
      this.digits = typeof t == 'boolean' && t == 1 ? null : n.slice(0),
      this.isNeg = !1
    }
    function r(t) {
      var e = new a(!0)
      return e.digits = t.digits.slice(0),
      e.isNeg = t.isNeg,
      e
    }
    function l(t) {
      var e = new a()
      e.isNeg = t < 0,
      t = Math.abs(t)
      for (var i = 0; t > 0;) {
        e.digits[i++] = 65535 & t,
        t >>= 16
      }
      return e
    }
    function c(t) {
      for (var e = '', i = t.length - 1; i > -1; --i) { e += t.charAt(i) }
      return e
    }
    new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z')
    var u = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f')
    function d(t) {
      for (var e = '', i = 0; i < 4; ++i) {
        e += u[15 & t],
        t >>>= 4
      }
      return c(e)
    }
    function p(t) {
      return t >= 48 && t <= 57 ? t - 48 : t >= 65 && t <= 90 ? 10 + t - 65 : t >= 97 && t <= 122 ? 10 + t - 97 : 0
    }
    function h(t) {
      for (var e = 0, i = Math.min(t.length, 4), n = 0; n < i; ++n) {
        e <<= 4,
        e |= p(t.charCodeAt(n))
      }
      return e
    }
    function f(t, e) {
      var i
      if (t.isNeg != e.isNeg) {
        e.isNeg = !e.isNeg,
        i = g(t, e),
        e.isNeg = !e.isNeg
      } else {
        i = new a()
        for (var n, s = 0, o = 0; o < t.digits.length; ++o) {
          n = t.digits[o] + e.digits[o] + s,
          i.digits[o] = 65535 & n,
          s = Number(n >= 65536)
        }
        i.isNeg = t.isNeg
      }
      return i
    }
    function g(t, e) {
      var i
      if (t.isNeg != e.isNeg) {
        e.isNeg = !e.isNeg,
        i = f(t, e),
        e.isNeg = !e.isNeg
      } else {
        var n, s
        i = new a(),
        s = 0
        for (var o = 0; o < t.digits.length; ++o) {
          n = t.digits[o] - e.digits[o] + s,
          i.digits[o] = 65535 & n,
          i.digits[o] < 0 && (i.digits[o] += 65536),
          s = 0 - Number(n < 0)
        }
        if (s == -1) {
          s = 0
          for (o = 0; o < t.digits.length; ++o) {
            n = 0 - i.digits[o] + s,
            i.digits[o] = 65535 & n,
            i.digits[o] < 0 && (i.digits[o] += 65536),
            s = 0 - Number(n < 0)
          }
          i.isNeg = !t.isNeg
        } else { i.isNeg = t.isNeg }
      }
      return i
    }
    function m(t) {
      for (var e = t.digits.length - 1; e > 0 && t.digits[e] == 0;) { --e }
      return e
    }
    function y(t) {
      var e; var i = m(t); var n = t.digits[i]; var s = 16 * (i + 1)
      for (e = s; e > s - 16 && (32768 & n) == 0; --e) { n <<= 1 }
      return e
    }
    function v(t, e) {
      for (var i, n, s, o = new a(), r = m(t), l = m(e), c = 0; c <= l; ++c) {
        i = 0,
        s = c
        for (var u = 0; u <= r; ++u,
        ++s) {
          n = o.digits[s] + t.digits[u] * e.digits[c] + i,
          o.digits[s] = 65535 & n,
          i = n >>> 16
        }
        o.digits[c + r + 1] = i
      }
      return o.isNeg = t.isNeg != e.isNeg,
      o
    }
    function b(t, e) {
      var i; var n; var s; var o = new a()
      i = m(t),
      n = 0
      for (var r = 0; r <= i; ++r) {
        s = o.digits[r] + t.digits[r] * e + n,
        o.digits[r] = 65535 & s,
        n = s >>> 16
      }
      return o.digits[1 + i] = n,
      o
    }
    function w(t, e, i, n, s) {
      for (var o = Math.min(e + s, t.length), a = e, r = n; a < o; ++a,
      ++r) { i[r] = t[a] }
    }
    var k = new Array(0, 32768, 49152, 57344, 61440, 63488, 64512, 65024, 65280, 65408, 65472, 65504, 65520, 65528, 65532, 65534, 65535)
    function C(t, e) {
      var i = Math.floor(e / 16)
      var n = new a()
      w(t.digits, 0, n.digits, i, n.digits.length - i)
      for (var s = e % 16, o = 16 - s, r = n.digits.length - 1, l = r - 1; r > 0; --r,
      --l) { n.digits[r] = n.digits[r] << s & 65535 | (n.digits[l] & k[s]) >>> o }
      return n.digits[0] = n.digits[r] << s & 65535,
      n.isNeg = t.isNeg,
      n
    }
    var x = new Array(0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535)
    function _(t, e) {
      var i = Math.floor(e / 16)
      var n = new a()
      w(t.digits, i, n.digits, 0, t.digits.length - i)
      for (var s = e % 16, o = 16 - s, r = 0, l = r + 1; r < n.digits.length - 1; ++r,
      ++l) { n.digits[r] = n.digits[r] >>> s | (n.digits[l] & x[s]) << o }
      return n.digits[n.digits.length - 1] >>>= s,
      n.isNeg = t.isNeg,
      n
    }
    function $(t, e) {
      var i = new a()
      return w(t.digits, 0, i.digits, e, i.digits.length - e),
      i
    }
    function S(t, e) {
      if (t.isNeg != e.isNeg) { return 1 - 2 * Number(t.isNeg) }
      for (var i = t.digits.length - 1; i >= 0; --i) {
        if (t.digits[i] != e.digits[i]) { return t.isNeg ? 1 - 2 * Number(t.digits[i] > e.digits[i]) : 1 - 2 * Number(t.digits[i] < e.digits[i]) }
      }
      return 0
    }
    function j(t, e) {
      var i; var n; var o = y(t); var l = y(e); var c = e.isNeg
      if (o < l) {
        return t.isNeg ? ((i = r(s)).isNeg = !e.isNeg,
        t.isNeg = !1,
        e.isNeg = !1,
        n = g(e, t),
        t.isNeg = !0,
        e.isNeg = c) : (i = new a(),
        n = r(t)),
        new Array(i, n)
      }
      i = new a(),
      n = t
      for (var u = Math.ceil(l / 16) - 1, d = 0; e.digits[u] < 32768;) {
        e = C(e, 1),
        ++d,
        ++l,
        u = Math.ceil(l / 16) - 1
      }
      n = C(n, d),
      o += d
      for (var p = Math.ceil(o / 16) - 1, h = $(e, p - u); S(n, h) != -1;) {
        ++i.digits[p - u],
        n = g(n, h)
      }
      for (var v = p; v > u; --v) {
        var w = v >= n.digits.length ? 0 : n.digits[v]
        var k = v - 1 >= n.digits.length ? 0 : n.digits[v - 1]
        var x = v - 2 >= n.digits.length ? 0 : n.digits[v - 2]
        var j = u >= e.digits.length ? 0 : e.digits[u]
        var A = u - 1 >= e.digits.length ? 0 : e.digits[u - 1]
        i.digits[v - u - 1] = w == j ? 65535 : Math.floor((65536 * w + k) / j)
        for (var T = i.digits[v - u - 1] * (65536 * j + A), q = 4294967296 * w + (65536 * k + x); T > q;) {
          --i.digits[v - u - 1],
          T = i.digits[v - u - 1] * (65536 * j | A),
          q = 65536 * w * 65536 + (65536 * k + x)
        }
        (n = g(n, b(h = $(e, v - u - 1), i.digits[v - u - 1]))).isNeg && (n = f(n, h),
        --i.digits[v - u - 1])
      }
      return n = _(n, d),
      i.isNeg = t.isNeg != c,
      t.isNeg && (i = c ? f(i, s) : g(i, s),
      n = g(e = _(e, d), n)),
      n.digits[0] == 0 && m(n) == 0 && (n.isNeg = !1),
      new Array(i, n)
    }
    e.setMaxDigits = o,
    e.biFromHex = function(t) {
      for (var e = new a(), i = t.length, n = 0; i > 0; i -= 4,
      ++n) { e.digits[n] = h(t.substr(Math.max(i - 4, 0), Math.min(i, 4))) }
      return e
    }
    ,
    e.biHighIndex = m,
    e.biCopy = r,
    e.BigInt = a,
    e.biDivide = function(t, e) {
      return j(t, e)[0]
    }
    ,
    e.biMultiply = v,
    e.biDivideByRadixPower = function(t, e) {
      var i = new a()
      return w(t.digits, e, i.digits, 0, i.digits.length - e),
      i
    }
    ,
    e.biModuloByRadixPower = function(t, e) {
      var i = new a()
      return w(t.digits, 0, i.digits, 0, e),
      i
    }
    ,
    e.biSubtract = g,
    e.biCompare = S,
    e.biShiftRight = _,
    e.biToHex = function(t) {
      for (var e = '', i = (m(t),
      m(t)); i > -1; --i) { e += d(t.digits[i]) }
      return e
    }
  },
  306: function(t, e, i) {
    'use strict'
    Object.defineProperty(e, '__esModule', {
      value: !0
    }),
    e.BarrettMu_powMod = e.BarrettMu_multiplyMod = e.BarrettMu_modulo = e.BarrettMu = void 0
    var n = i(228)
    function s(t) {
      var e = (0,
      n.biDivideByRadixPower)(t, this.k - 1)
      var i = (0,
      n.biMultiply)(e, this.mu)
      var s = (0,
      n.biDivideByRadixPower)(i, this.k + 1)
      var o = (0,
      n.biModuloByRadixPower)(t, this.k + 1)
      var a = (0,
      n.biMultiply)(s, this.modulus)
      var r = (0,
      n.biModuloByRadixPower)(a, this.k + 1)
      var l = (0,
      n.biSubtract)(o, r)
      l.isNeg && (l = biAdd(l, this.bkplus1))
      for (var c = (0,
      n.biCompare)(l, this.modulus) >= 0; c;) {
        l = (0,
        n.biSubtract)(l, this.modulus),
        c = (0,
        n.biCompare)(l, this.modulus) >= 0
      }
      return l
    }
    function o(t, e) {
      var i = (0,
      n.biMultiply)(t, e)
      return this.modulo(i)
    }
    function a(t, e) {
      var i = new n.BigInt()
      i.digits[0] = 1
      for (var s = t, o = e; (1 & o.digits[0]) != 0 && (i = this.multiplyMod(i, s)),
      (o = (0,
      n.biShiftRight)(o, 1)).digits[0] != 0 || (0,
      n.biHighIndex)(o) != 0;) { s = this.multiplyMod(s, s) }
      return i
    }
    e.BarrettMu = function(t) {
      this.modulus = (0,
      n.biCopy)(t),
      this.k = (0,
      n.biHighIndex)(this.modulus) + 1
      var e = new n.BigInt()
      e.digits[2 * this.k] = 1,
      this.mu = (0,
      n.biDivide)(e, this.modulus),
      this.bkplus1 = new n.BigInt(),
      this.bkplus1.digits[this.k + 1] = 1,
      this.modulo = s,
      this.multiplyMod = o,
      this.powMod = a
    }
    ,
    e.BarrettMu_modulo = s,
    e.BarrettMu_multiplyMod = o,
    e.BarrettMu_powMod = a
  }
}))
function get_pwd(pwd) {
  var a = _para(228);
  (0, a.setMaxDigits)(129)
  var r = _para(305)
  var n = new r.RSAKeyPair('10001', '', 'BC087C7C00848CE8A349C9072C3229E0D595F817EDDE9ABF6FC72B41942A759E97956CE9CB7D1F2E99399EADBACC0531F16EAE8EFCB68553DE0E125B2231ED955ADBF5208E65DC804237C93EB23C83E7ECDA0B586ECF31839038EE6B640E0EEC5FF17D219FDEA33E730F287F0D384C74A53DFE1F91ACC63C7C92039A43AC6E97')
  var s = (0, r.encryptedString)(n, pwd)
  return s
}

console.log(get_pwd('DrSHW'))
```

### 案例三

#### 逆向目标

+ 抓取美食优惠聚合（https://static.waitwaitpay.com/web/sd_se/index.html ）中指定关键字对应的数据包。

+ 搜索关键字，如炸鸡，找到我们要的数据包并进行抓包：

  <img src="https://images.drshw.tech/images/notes/image-20220904135321080.png" alt="image-20220904135321080" style="zoom:40%;" />

  <img src="https://images.drshw.tech/images/notes/image-20220904135355508.png" alt="image-20220904135355508" style="zoom:40%;" />

  数据地址：https://api.waitwaitpay.com/api/vendors/nearby，请求参数中`request_id`是日志编号，仅用于请求最新数据（而不是从缓存中取数据 ），不影响爬虫。**响应数据**需要逆向。

#### 逆向分析

+ 我们注意到启动器中有许多关键字，以`react`开头，这是一个前端框架，类似的前端框架还有`vue`、`angular`等。看到这些前端框架就尽量少使用`XHR`断点，原因是其业务逻辑复杂，难以准确定位加密点。

  <img src="https://images.drshw.tech/images/notes/image-20220904140016838.png" alt="image-20220904140016838" style="zoom:50%;" />

+ 由于从后台返回的数据解密后要转换为对象才能进行渲染，我们直接全局搜索转换函数`JSON.parse`，结果有很多，我们将可疑的地方打上断点，刷新：

  <img src="https://images.drshw.tech/images/notes/image-20220904142333694.png" alt="image-20220904142333694" style="zoom:50%;" />

+ 打印`f(e)`后会发现，这里的`f`函数应该就是解密函数，再看文件的最上方，是一个加载器（前端框架搭建的网站一般都是`Webpack` ）：

  <img src="https://images.drshw.tech/images/notes/image-20220904142941785.png" alt="image-20220904142941785" style="zoom:50%;" />

+ 我们当然可以只把`f`函数取走，然后补充参数和环境；这里演示一种更暴力的做法，直接把整个JS文件搬到本地（六万多行全部取走 ）：

#### 代码处理

与案例二一致，我们在开头声明两个变量`_para`和`_dec`，`_para`用于导出加载器，接收所需的函数；`dec`用于导出解密函数；

在模块入口处删去默认入口，使用`_para`捕获加载器函数：

<img src="https://images.drshw.tech/images/notes/image-20220904151520501.png" alt="image-20220904151520501" style="zoom:40%;" />

由于已经把整个JS 搬过来了，此处的打印追踪可省略。

再定位到`f`函数下使用`_dec`变量捕获之：

<img src="https://images.drshw.tech/images/notes/image-20220904150151906.png" alt="image-20220904150151906" style="zoom:50%;" />

最后对函数进行调用测试，需要调用的模块就是，`f`函数所对应的函数，在模块中的下标，在这里是`29`：

<img src="https://images.drshw.tech/images/notes/image-20220904152017136.png" alt="image-20220904152017136" style="zoom:40%;" />

+ 执行后发现报了`navigator`中`User-Agent`未定义的错，需要补环境，即在开头位置添加：

  ![image-20220904151943822](https://images.drshw.tech/images/notes/image-20220904151943822.png)

+ 补充环境后执行，成功完成对数据的解密（那个报错可以忽略，目的已经达到了 ）：

  <img src="https://images.drshw.tech/images/notes/image-20220904152403563.png" alt="image-20220904152403563" style="zoom:40%;" />

+ 完整代码太长了，就不贴在这了，下载地址https://storage.drshw.tech/OneDrive/note-source/%E7%BE%8E%E9%A3%9F%E7%BD%91code.js 。







