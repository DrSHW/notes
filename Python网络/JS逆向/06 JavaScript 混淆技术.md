# JavaScript 混淆技术

## JS混淆简介

### 什么是混淆

JavaScript 混淆完全是在 JavaScript 上面进行的处理，它的目的就是使得 JavaScript 变得难以阅读和分析，大大降低代码可读性，是一种很实用的 JavaScript 保护方案。

JS混淆可分为**代码压缩、代码混淆、代码加密**三大部分：

+ 代码压缩：即去除` JavaScript` 代码中的不必要的空格、换行等内容，使源码都压缩为几行内容，降低代码可读性，当然同时也能提高网站的加载速度。

+ 代码混淆：使用变量替换、字符串阵列化、控制流平坦化、多态变异、僵尸函数、调试保护等手段，使代码变得难以阅读和分析，达到最终保护的目的。但这不影响代码原有功能。是理想、实用的` JavaScript `保护方案

+ 代码加密：可以通过某种手段将 JavaScript 代码进行加密，转成人无法阅读或者解析的代码，如将代码完全抽象化加密，如 eval 加密。另外还有更强大的加密技术，可以直接将 `JavaScript` 代码用 C/C++ 实现，`JavaScript` 调用其编译后形成的文件来执行相应的功能，如` Emscripten` 还有 `WebAssembly`。

### 常见的JS混淆技术

+ **变量混淆**
  将带有含意的变量名、方法名、常量名随机变为无意义的类乱码字符串，降低代码可读性，如转成单个字符或十六进制字符串。

+ **字符串混淆**
  将字符串阵列化集中放置、并可进行 MD5 或 Base64 加密存储，使代码中不出现明文字符串，这样可以避免使用全局搜索字符串的方式定位到入口点。

+ **属性加密**
  针对 JavaScript 对象的属性进行加密转化，隐藏代码之间的调用关系。

+ **控制流平坦化**
  打乱函数原有代码执行流程及函数调用关系，使代码逻变得混乱无序。

+ **僵尸代码**
  随机在代码中插入无用的僵尸代码、僵尸函数，进一步使代码混乱。

+ **调试保护**
  基于调试器特性，对当前运行环境进行检验，加入一些强制调试 debugger 语句，使其在调试模式下难以顺利执行 JavaScript 代码。

+ **多态变异**
  使 JavaScript 代码每次被调用时，将代码自身即立刻自动发生变异，变化为与之前完全不同的代码，即功能完全不变，只是代码形式变异，以此杜绝代码被动态分析调试。

+ **锁定域名**
  使 JavaScript 代码只能在指定域名下执行。

+ **反格式化**
  如果对 JavaScript 代码进行格式化，则无法执行，导致浏览器假死。

+ **特殊编码**
  将 JavaScript 完全编码为人不可读的代码，如表情符号、特殊表示内容等等。

总之，以上方案都是 JavaScript 混淆的实现方式，可以在不同程度上保护 JavaScript 代码。

推荐一个常用的JS工具：https://www.sojson.com/ 。

### 使用`javascript-obfuscator`进行混淆

#### 准备工作

需要先安装`javascript-obfuscator `库：

```bash
npm install javascript-obfuscator --save
```

局部导入：`const obfuscator = require('javascript-obfuscator')`

混淆前需要定义一个设置`options`对象，再使用`obfuscator.obfuscate(code, options).getObfuscatedCode()`获取混淆后的代码，传入原代码`code`和`options`。

#### 代码压缩

` javascript-obfuscator `提供了代码压缩的功能，将`option`中参数`compact `置为`true`（默认是`true` ）即可完成对JS代码的压缩，输出为一行内容；如果定义为 `false`，则混淆后的代码会分行显示，示例：

```js
// 原代码
var code = `
let x = '1' + 1
console.log('x', x)
	`
// 设置对象
const options = {
  compact: true // 代码压缩配置
}

// 引入javascript-obfuscator库
const obfuscator = require('javascript-obfuscator')

// 传入code和options
function obfuscate(code, options) {
  return obfuscator.obfuscate(code, options).getObfuscatedCode()
}

// 打印混淆后的代码
console.log(obfuscate(code, options))
```

打印结果：

![image-20220904162754990](https://images.drshw.tech/images/notes/image-20220904162754990.png)

显然变成了不是给人看的东西。

#### 变量名混淆

变量名混淆可以通过`options`中的` identifierNamesGenerator` 参数实现，通过这个参数我们可以控制变量名混淆的方式，如` hexadecimal `会将原字符串替换为 16 进制形式的字符串，在这里我们可以设定如下值：

+ `hexadecimal`：将变量名替换为 16 进制形式的字符串，如 `0xabc123`。
+ `mangled`：将变量名替换为普通的简写字符，如 a、b、c 等。
  该参数默认为` hexadecimal`。

我们将该参数修改为 `mangled` 来试一下：

```js
const code = `
let hello = '1' + 1
console.log('hello', hello)
`

const options = {
  compact: true,
  identifierNamesGenerator: 'mangled'
}

```

#### 字符串混淆

字符串混淆，即将一个字符串声明放到一个数组里面，使之无法被直接搜索到。我们可以通过控制`options`中的 `stringArray` 参数来控制，默认为`true`。

```js
const code = `
var a = 'hello world'
`;

const options = {
  compact: false,
  unicodeEscapeSequence: true  //对字符串进行 Unicode 转码
};
// 以下代码同上
```

## OB混淆

这是目前大多数网站做反爬时用到的混淆方式，在这节中我们重点讲解其破解方式：

### 历史

`OB` 混淆全称 Obfuscator，Obfuscator 其实就是混淆的意思，官网：[https://obfuscator.io/](https://links.jianshu.com/go?to=https%3A%2F%2Fobfuscator.io%2F) ，其作者是一位叫 Timofey Kachalov 的俄罗斯` JavaScript `开发工程师，早在 2016 年就发布了第一个版本。

### 基本特征

其基本特征如下：

1. 一般由一个大数组或者含有大数组的函数、一个自执行函数、解密函数和加密后的函数四部分组成；

2. 函数名和变量名通常以 `_0x` 或者 `0x` 开头，后接 1~6 位数字或字母组合；

3. 自执行函数，进行移位操作，有明显的 `push`、`shift` 关键字；

例如在上面的例子中，`_0x3f26()`（1行 ）方法就定义了一个大数组，自执行函数里有 `push`、`shift`（14，16行 ） 关键字，主要是对大数组进行移位操作，`_0x1fe9()` （27行 ）就是解密函数，`hi()`（30行 ）就是加密后的函数。

![image-20220822141218145](images\image-20220822141218145.png)

## 实战案例

### 案例一

#### 逆向目标

+ 注册登录考古加首页（https://www.kaogujia.com/ ）爬取其中的商品一栏内容中，指定关键字对应的数据包；

+ 抓包，一开始就被一个`debugger`卡住了，添加条件断点将其绕过：

  <img src="https://images.drshw.tech/images/notes/image-20220904200221073.png" alt="image-20220904200221073" style="zoom:50%;" />

+ 在搜索框中搜索想要爬取的商品信息，如`饮料`：

  请求头中无反爬信息（`authorization`为登录信息，复制即可 ）请求数据地址为https://service.kaogujia.com/api/sku/search，响应数据`data`字段中`result`的属性需要逆向：

  ![image-20220904201311175](https://images.drshw.tech/images/notes/image-20220904201311175.png)

#### 逆向分析

+ 添加XHR断点，再次搜索饮料，程序断住：

  <img src="https://images.drshw.tech/images/notes/image-20220904203810982.png" alt="image-20220904203810982" style="zoom:50%;" />

  可见它对所有的关键字都进行了混淆（卡的要死是正常的 ），由于数据均来源于`ajax`，找到被混淆的`.then`方法就可找到后台返回的响应数据，便于我们进行追踪。它一般在方法栈中提示线`Promise.then（异步 ）`附近：

  ![image-20220904204349301](https://images.drshw.tech/images/notes/image-20220904204349301.png)

+ 找到`.then`方法后就定位了后台响应的位置，可对返回结果进行打印，确实是响应数据：

  ![image-20220904205042031](https://images.drshw.tech/images/notes/image-20220904205042031.png)

  不断进行单步调试，遇到可疑的地方就控制台打印试试看，现在的目标是找到解密点，找到如下位置，发现解密点：

  ![image-20220904205743789](https://images.drshw.tech/images/notes/image-20220904205743789.png)

  此处的变量`_0x3540f6`为解密后的数据，而该变量又是`Object(_0x266782['d'])`得来的，因此解密函数应该就是它。

  源码中把`JSON.parse()`写成了`JSON['parse']`，按道理来讲这个`parse`也应该加密，不知道为什么它这里写了明文。不过这一步一定是将字符串转为对象，也能猜到是`parse`。

+ 我们再来观察传入的两个参数，将其打印：

  <img src="https://images.drshw.tech/images/notes/image-20220904210742993.png" alt="image-20220904210742993" style="zoom:50%;" />

  第一个参数为请求参数的路由，是确定的；第二个参数是加密数据。

+ 进入加密函数，在函数中下断点并跳转。可见其接收两个参数：

  ![image-20220904211147514](https://images.drshw.tech/images/notes/image-20220904211147514.png)
  
  在函数末尾也下了断点，观察其是否成功解密。
  
  ![image-20220904220901444](https://images.drshw.tech/images/notes/image-20220904220901444.png)
  
  经验证该函数就是解密点。

#### 代码分析

+ 先将函数搬到本地，我们发现其中包含着三个我们很熟悉的参数`iv`、`mode`、`padding`，与**对称加密算法**很相似；

+ 有许多参数需要补充，从简单的看起；我们发现所有类似`_0x3f7c04(0xbc7)`的东西都是字符串，用控制台打印就能看到它们的真值，全部替换；

  这样的话`var _0x3f7c04 = a0_0xb1a9`，就可以删掉了；

+ 接下来就是其余参数的还原：

  这两个一个是函数，直接搬过来，一个是JS包；

  ![image-20220904212929942](https://images.drshw.tech/images/notes/image-20220904212929942.png)

  将其替换即可。

完整解密JS代码如下：

```js
/* eslint-disable no-unused-vars */
var _0x23a991 = require('crypto-js')

function _0x4e53d5(_0x71f6) {
  var _0x3696d0 = encodeURI(_0x71f6)
  var _0x59521e = btoa(_0x3696d0)
  return _0x59521e
}

var _0x35918e = function(_0x4191f2, _0x27a8bd) {
  if (typeof _0x4191f2 === 'string') {
    var _0x30630f = _0x4e53d5(_0x4191f2)['repeat'](0x3)
    var _0x200ac4 = _0x30630f['slice'](0x0, 0x10)
    var _0x1e9543 = _0x30630f['slice'](0xc, 0x1c)
    var _0x5b02a2 = _0x23a991['enc']['Utf8']['parse'](_0x200ac4)
    var _0x15ea8c = _0x23a991['enc']['Utf8']['parse'](_0x1e9543)
    var _0x5e6fe2 = _0x23a991['AES']['decrypt'](_0x27a8bd, _0x5b02a2, {
      'iv': _0x15ea8c,
      'mode': _0x23a991['mode']['CBC'],
      'padding': _0x23a991['pad']['Pkcs7']
    })
    return _0x5e6fe2['toString'](_0x23a991['enc']['Utf8'])
  }
}

var arg1 = '/api/sku/search'
function decrypt_data(arg1, data) {
  return _0x35918e(arg1, data)
}
```

### 案例二

#### 逆向目标

+ 抓取极简壁纸首页（https://bz.zzzmh.cn/index ）的图片数据；

+ 一开始就有个无限`debugger`，也是源源不断地来，查找其来源为构造函数产生：

  <img src="https://images.drshw.tech/images/notes/image-20220905110355855.png" alt="image-20220905110355855" style="zoom:50%;" />

  使用第一节中给出的代码即可破解：

  ```js
  Function.prototype.__constructor_back = Function.prototype.constructor;
  Function.prototype.constructor = function() {
      if(arguments && typeof arguments[0]==='string'){
          if("debugger" === arguments[0]){
              return
          }
      }
     return Function.prototype.__constructor_back.apply(this,arguments);
  }
  ```

+ 再次刷新，抓包。找到请求地址：https://api.zzzmh.cn/bz/v3/getData，其请求头和请求参数中无反爬点，但是请求数据需要解密：

  <img src="https://images.drshw.tech/images/notes/image-20220905110811788.png" alt="image-20220905110811788" style="zoom:50%;" />

#### 逆向分析

+ 使用`XHR`断点调试，点击下一页，按调用堆栈调试，调试时注意关键字`result`（可能需要很多步 ）：

![image-20220905144317405](https://images.drshw.tech/images/notes/image-20220905144317405.png)

+ 找到后打上断点，打印`JSON['parse'](_0x30f682['a']['decipher'](_0x27ca92['data']['result']))`发现是解密后的数据，而`_0x27ca92['data']['result']`是密文，这就说明解密函数就是`_0x3042ee['a']['decipher']`，成功找到解密点。

#### 代码分析

+ 进入函数并断点调试：

  ![image-20220905145339901](https://images.drshw.tech/images/notes/image-20220905145339901.png)

  可见该函数接收的参数就是密文，而且将其传给了另一个函数，处理过程总共经过三个函数；

+ 离数据最近的函数就在上方，直接搬过来；其余两个函数直接点进去，搬过来即可；

+ 测试函数，会发现报错`window is not defined`，补充一个`windows`，并按控制台打印结果把缺失的字符串补齐（`window['atob']`即为浏览器中原始的`base64`编码函数，这里直接换成`node`支持的`atob`函数即可 ）：

  <img src="https://images.drshw.tech/images/notes/image-20220905150920358.png" alt="image-20220905150920358" style="zoom:50%;" />

+ 测试后成功运行，再套一层`JSON.parse()`即可转为解密后的对象。

完整JS解密代码如下：

```js
var window = { }

function _0x3037fc(_0x54bf6c) {
  for (var _0x37302d = atob(_0x54bf6c), _0x313df9 = new Int8Array(_0x37302d['length']), _0x13f2ff = 0x0; _0x13f2ff < _0x37302d['length']; _0x13f2ff++) { _0x313df9[_0x13f2ff] = _0x37302d['charCodeAt'](_0x13f2ff) }
  return _0x313df9
}

function _0x29dc0b(_0x54bf6c) {
  for (var _0x37302d, _0x313df9, _0x13f2ff = '', _0x3884d1 = 0x0; _0x3884d1 < _0x54bf6c['length'];) {
    _0x37302d = _0x54bf6c[_0x3884d1],
    _0x313df9 = 0x0,
    _0x37302d >>> 0x7 === 0x0 ? (_0x13f2ff += String['fromCharCode'](_0x54bf6c[_0x3884d1]),
    _0x3884d1 += 0x1) : (0xfc & _0x37302d) === 0xfc ? (_0x313df9 = (0x3 & _0x54bf6c[_0x3884d1]) << 0x1e,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x1]) << 0x18,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x2]) << 0x12,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x3]) << 0xc,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x4]) << 0x6,
    _0x313df9 |= 0x3f & _0x54bf6c[_0x3884d1 + 0x5],
    _0x13f2ff += String['fromCharCode'](_0x313df9),
    _0x3884d1 += 0x6) : (0xf8 & _0x37302d) === 0xf8 ? (_0x313df9 = (0x7 & _0x54bf6c[_0x3884d1]) << 0x18,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x1]) << 0x12,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x2]) << 0xc,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x3]) << 0x6,
    _0x313df9 |= 0x3f & _0x54bf6c[_0x3884d1 + 0x4],
    _0x13f2ff += String['fromCharCode'](_0x313df9),
    _0x3884d1 += 0x5) : (0xf0 & _0x37302d) === 0xf0 ? (_0x313df9 = (0xf & _0x54bf6c[_0x3884d1]) << 0x12,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x1]) << 0xc,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x2]) << 0x6,
    _0x313df9 |= 0x3f & _0x54bf6c[_0x3884d1 + 0x3],
    _0x13f2ff += String['fromCharCode'](_0x313df9),
    _0x3884d1 += 0x4) : (0xe0 & _0x37302d) === 0xe0 ? (_0x313df9 = (0x1f & _0x54bf6c[_0x3884d1]) << 0xc,
    _0x313df9 |= (0x3f & _0x54bf6c[_0x3884d1 + 0x1]) << 0x6,
    _0x313df9 |= 0x3f & _0x54bf6c[_0x3884d1 + 0x2],
    _0x13f2ff += String['fromCharCode'](_0x313df9),
    _0x3884d1 += 0x3) : (0xc0 & _0x37302d) === 0xc0 ? (_0x313df9 = (0x3f & _0x54bf6c[_0x3884d1]) << 0x6,
    _0x313df9 |= 0x3f & _0x54bf6c[_0x3884d1 + 0x1],
    _0x13f2ff += String['fromCharCode'](_0x313df9),
    _0x3884d1 += 0x2) : (_0x13f2ff += String['fromCharCode'](_0x54bf6c[_0x3884d1]),
    _0x3884d1 += 0x1)
  }
  return _0x13f2ff
}

function _0x61f252(_0x54bf6c) {
  for (var _0x37302d = [-0x6f, 0x34, 0x5b, 0x41, -0x41, 0x74, 0x77, 0x6a, -0x79, -0x52, -0x5, 0x50, 0x33, 0x61, 0x44, -0x53, -0x70, -0x33, 0x17, -0x2e, -0x22, -0x72, -0x37, -0xb, -0x7f, 0x5a, 0x21, 0x16, -0x1f, 0x32, -0x11, 0x14, -0x2c, 0xf, -0x5e, -0x7b, 0x76, -0x17, -0x3d, 0x72, 0x47, -0x68, -0x7e, -0x75, -0x51, -0x36, -0x12, -0x6e, -0x4, -0x5f, -0x5b, 0x5e, -0x50, -0xe, 0x78, 0x69, 0x55, 0x68, -0x56, -0x6c, 0x43, 0x19, 0x65, 0x6c, 0x10, -0x69, 0x6f, -0xa, 0x75, -0x49, 0x4d, 0x59, -0x1d, -0x62, -0x44, 0x70, 0x6b, -0x1, 0x56, 0x79, 0x58, -0x65, -0x7c, 0x45, -0x1e, -0x8, -0x71, -0x4a, -0x76, 0x39, -0x19, 0xc, -0x73, -0x6a, 0x5f, 0x7f, 0x54, 0x7c, -0x66, -0x1c, 0x49, 0x2b, -0x3c, 0x1c, 0x2e, 0x73, 0x1e, 0x7a, -0x4b, 0x7d, -0x43, -0x4d, 0x3, -0x7, -0x35, -0xd, 0x35, 0x4e, -0x48, 0x1, 0xb, -0x47, -0x27, -0x4f, -0x3, 0x13, 0x29, 0x7e, -0x2b, -0x7d, -0x1b, 0x22, 0x3f, 0x8, 0x48, -0x23, -0x29, -0x3f, 0x3c, -0x18, 0x66, 0x2f, -0x77, -0x67, -0x16, 0x2d, 0x3b, 0x40, -0x60, 0x31, 0x53, -0x6b, -0x78, -0x39, -0x46, 0x0, -0x26, -0x54, -0x28, 0x18, 0xe, 0x30, 0x1d, 0x2c, -0x24, -0x2f, 0x38, -0x5c, 0x26, 0x25, 0x4, -0x32, 0x67, 0xa, -0x59, 0x37, 0x71, -0x1a, 0x6e, 0x36, 0x24, -0x14, -0x4e, -0xc, -0x74, 0x46, -0x25, 0x5, -0x3e, -0x4c, -0x30, -0x40, 0x4f, 0x64, 0x28, 0x6, -0x3a, -0x5a, -0x13, -0x9, 0x27, 0x5d, -0x63, 0x15, 0x7, 0x1a, -0x2, 0x1b, -0x2d, 0x51, 0x3a, -0x7a, 0x4c, -0x42, 0x2, 0x5c, -0x2a, 0x62, -0x10, 0x9, 0x3d, 0x3e, -0xf, 0x63, -0x15, 0x1f, -0x38, 0x57, 0x11, -0x34, -0x45, -0x21, -0x3b, -0x55, 0x42, 0x4a, 0x12, -0x5d, -0x80, -0x57, -0x20, 0x2a, 0x20, -0x58, 0x6d, 0x60, 0xd, -0x6, 0x4b, -0x64, -0x31, 0x23, -0x61, 0x52, -0x6d, 0x7b], _0x313df9 = 0x0, _0x13f2ff = 0x0, _0x3884d1 = 0x0, _0x57675d = new Array(), _0x4044db = 0x0; _0x4044db < _0x54bf6c['length']; _0x4044db++) {
    _0x313df9 = _0x313df9 + 0x1 & 0xff,
    _0x13f2ff = (0xff & _0x37302d[_0x313df9]) + _0x13f2ff & 0xff
    var _0x61f252 = _0x37302d[_0x313df9]
    _0x37302d[_0x313df9] = _0x37302d[_0x13f2ff],
    _0x37302d[_0x13f2ff] = _0x61f252,
    _0x3884d1 = (0xff & _0x37302d[_0x313df9]) + (0xff & _0x37302d[_0x13f2ff]) & 0xff,
    _0x57675d['push'](_0x54bf6c[_0x4044db] ^ _0x37302d[_0x3884d1])
  }
  return _0x57675d
}

function _0x4467ed(_0x54bf6c) {
  return JSON.parse(_0x29dc0b(_0x61f252(_0x3037fc(_0x54bf6c))))
}

var data = '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'

console.log(_0x4467ed(data))
```



