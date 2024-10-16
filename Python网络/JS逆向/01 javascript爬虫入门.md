# javascript爬虫入门

## devtools 功能补充

### 元素/Element

主视窗如下，显示的是网站的源代码，也可对源代码进行修改：

![image-20220827203641137](https://images.drshw.tech/images/notes/image-20220827203641137.png)

侧栏中的**样式**和**计算样式**即网站的CSS和动态样式，**布局**即网站的盒子模型。在爬虫中，我们不会过多关注这些部分。

![image-20220827204141470](https://images.drshw.tech/images/notes/image-20220827204141470.png)

**事件监听器**非常重要，会收集网站上所有的 JS 事件，并将他们按事件类型进行分类，可进行编辑。

**DOM断点**近年来已经不常使用，**属性**即网站的一些属性，**无障碍功能**无需关注。（这三项都很少用 ）

### 控制台/Console

可以写一些JS代码，对网站进行调试。

### 源代码/Sources

**网页/page** ： 所有资源文件

**文件系统/filesystem**： 关联本地文件

**替换/overrides**（重要 ）：  可以做文件替换，比如替换JS，例如：

在桌面新建一个文件夹`demo`，文件夹中新建JS文件：`demo.js`：`console.log("替换js成功")`；

选择替换：

<img src="https://images.drshw.tech/images/notes/image-20220829160546082.png" alt="image-20220829160546082" style="zoom: 50%;" />

选择刚刚新建的文件夹，点击允许：

![image-20220829160721097](https://images.drshw.tech/images/notes/image-20220829160721097.png)

我们就可以看到刚刚的JS文件了：

![image-20220829160819214](https://images.drshw.tech/images/notes/image-20220829160819214.png)

示例：Boss直聘(https://www.zhipin.com/web/geek/job?query=%E5%89%8D%E7%AB%AF&city=101190100)，随便点一个岗位。

该网站详情页有Cookie反爬虫，首先找到搜索：

![image-20220829162147781](https://images.drshw.tech/images/notes/image-20220829162147781.png)

搜索`__zp_stoken___`：

![image-20220829162303367](https://images.drshw.tech/images/notes/image-20220829162303367.png)

进入对应的JS文件，并对其格式化：

<img src="https://images.drshw.tech/images/notes/image-20220829162453734.png" alt="image-20220829162453734" style="zoom: 67%;" />

定位到`__zp_stoken__`所在位置：

![image-20220829162614867](https://images.drshw.tech/images/notes/image-20220829162614867.png)

往下翻，可以找到`setGatewayCookie()`函数，点击行号打上断点：

![image-20220829162925467](https://images.drshw.tech/images/notes/image-20220829162925467.png)

打上断点后刷新网站，点击单步调试到如下图位置，将参数进行输出：

![image-20220829163312463](https://images.drshw.tech/images/notes/image-20220829163312463.png)

选中刚刚的`demo`文件夹，右击`main.js`文件（注意不是格式化后的文件 ），点击保存并覆盖：

![image-20220829163635988](https://images.drshw.tech/images/notes/image-20220829163635988.png)

点击后，`main.js`文件旁边会带有一个紫色的小圆点，代表该文件已经保存到本地（`demo` ）文件夹：

![image-20220829164217839](https://images.drshw.tech/images/notes/image-20220829164217839.png)

替换成功后，即可对该JS进行**修改**与`debugger`调试。在原先下断点的地方，我们写入一个`debugger`：

![image-20220829165417633](https://images.drshw.tech/images/notes/image-20220829165417633.png)

保存并刷新，就可以直接到达`debugger`断点，点击单步调试至修改处，可见控制台输出：

![image-20220829170014617](https://images.drshw.tech/images/notes/image-20220829170014617.png)

由于函数对参数进行加密后赋值给了变量`n`，我们便可以通过这种方法直接修改`n`的值，这里暂时只演示替换，其余步骤以后详细讲。

**内容脚本**：即当前的浏览器插件。

**代码段**：可以编写一些JS脚本，即将一些常用的JS保存在浏览器中（可长期保存 ），执行效果与在控制台中执行时一样的。

![image-20220829173523518](https://images.drshw.tech/images/notes/image-20220829173523518.png)

点击增加新代码段，即可进行编写：

![image-20220829173642353](https://images.drshw.tech/images/notes/image-20220829173642353.png)

右键代码段或输入`Ctrl+Enter`，即可在控制台执行。

**代码段**：可以编写脚本，影响页面,代码记录

### 网络/Network

先看顶部的两个按钮：

![image-20220829174409298](https://images.drshw.tech/images/notes/image-20220829174409298.png)

**保留日志**：勾选后会将之前的所有请求记录保留，不清除之前的数据；

**停用缓存**：若不勾选，会将磁盘中的浏览器请求缓存也进行显示，在大小一栏可以看到有些请求为`disk cache`：

![image-20220829174809763](https://images.drshw.tech/images/notes/image-20220829174809763.png)

勾选后则不显示这些请求，显示的均为后端服务器的请求与响应。一般情况下需要勾选。

再来看下一栏：

![image-20220829174956216](https://images.drshw.tech/images/notes/image-20220829174956216.png)

一般用来对请求文件的类型进行筛选，这里我们已经很熟悉了。

主面板我们也很熟悉：

![image-20220829175202339](https://images.drshw.tech/images/notes/image-20220829175202339.png)

值得注意的是**启动器**一栏，若请求经过了某JS文件，它会将对应JS文件也显示出来，若没有经过JS，则会显示资源网站。

也可以在请求的详情信息中看到启动器：

![image-20220829175555427](https://images.drshw.tech/images/notes/image-20220829175555427.png)

顺便来看看请求详情页中的一些功能：

![image-20220829175744468](https://images.drshw.tech/images/notes/image-20220829175744468.png)

这些我们在做基础爬虫的时候就已经接触到了：

**标头**：即请求头/响应头内容；

**载荷**：即请求/响应时需要携带的数据(`data`)；

**预览**：即一些静态数据的预览，比如`html`和图片等；

**响应**：即响应体中的信息；

启动器上面已经提过了。

### 应用/Application

在这一栏，可以查看`localstorage`（本地存储空间 ）、`session`（会话存储空间 ）、`cookie`（Cookie ）和数据库（DB/SQL ）中的一些信息：

![image-20220829180953830](https://images.drshw.tech/images/notes/image-20220829180953830.png)

对于`localstorage`，点击上方按钮即可清除所有记录：

![image-20220829181627542](https://images.drshw.tech/images/notes/image-20220829181627542.png)

对于`Cookie`，要删除所有数据也是一样：

![image-20220829181722509](https://images.drshw.tech/images/notes/image-20220829181722509.png)

对于一些`Cookie`反爬虫，我们需要获取最新的`Cookie`数据，而清除后再进行获取的信息一定是最新的（否则可能是缓存里的 ）。

## JS调试

示例网站：https://oauth.d.cn/auth/goLogin.html

我们希望能够定位JS中存放输入框中密码变量的位置，搜索`pwd:`，找到后进行断点：

![image-20220829203814218](https://images.drshw.tech/images/notes/image-20220829203814218.png)

填入数据点击登录，被下断点的JS代码段将执行。执行至断点处时，网站便会停止加载，即可进行调试和参数更改：

下面结合这个例子进行JS调试的讲解：

![image-20220829212918209](https://images.drshw.tech/images/notes/image-20220829212918209.png)

调试JS时`devtool`右侧会有这几个标识，从左到右看：

第一个按钮：一直执行，直至文件结束或遇到下一个断点；

第二个按钮：跳过当前函数调用执行，即遇到函数时，直接执行完函数，然后到下一行；

第三个按钮：进入当前执行函数内部调试，跳到所在函数的第一行；

第四个按钮：跳出当前函数调用，在函数中时，会全部直接执行完毕，然后跳到调用处。

第五个按钮：单步调试，即遇到函数时，会进入函数中，一步步调试，直至函数执行完毕后，才会跳出函数回到调用处；

最后两个分别是屏蔽断点和遇到异常时停止调试，很好理解。

了解了这些后，我们直接跳到`rsa()`函数加密处：

![image-20220829211658150](https://images.drshw.tech/images/notes/image-20220829211658150.png)

此时在控制台中就可获取`rsa()`函数和输入框中被`rsa()`加密的值`rsaPwd`，我们可以在控制台使用`rsa()`函数，甚至可以修改`rsaPwd`的值：

<img src="https://images.drshw.tech/images/notes/image-20220829214726318.png" alt="image-20220829214726318" style="zoom: 40%;" />

下一步就是将数据发送给后端服务器了，应当会有一个网络请求，包括了被加密的密码，且被加密的密码已经被我们修改。找到该请求，果然如此：

<img src="https://images.drshw.tech/images/notes/image-20220829215032580.png" alt="image-20220829215032580" style="zoom:50%;" />

但是返回结果出错，应该是因为后端没办法对更改的字符串进行解密。

## 寻找断点

### 网站运行时间轴

```
加载Hmtl - 加载JS - 运行JS初始化 - 用户触发某个事件 - 调用某段JS - 加密函数 - 给服务器发信息（XHR-SEND ） - 接收到服务器数据 - 解密函数 - 刷新网页渲染
```

寻找时我们不仅可以使用搜索大法，还可以在时间轴上设置不同种类的断点。断点作用：找到对关键和值数据，并对它们进行监听与分析。

还是举上面的网站作为示例：

### DOM断点

通过网站中DOM元素绑定的事件，确定对应JS的位置再下断点：

我先找到登陆按钮所在源代码中的位置，再查看其绑定的事件监听器，即可找到登陆逻辑的位置：

![image-20220829213745957](https://images.drshw.tech/images/notes/image-20220829213745957.png)

在目标JS中设置断点即可。

### XHR断点

即通过请求发包的地址，定位JS逻辑的位置，过程举例：

先找到登陆请求参数包：

<img src="https://images.drshw.tech/images/notes/image-20220829223642455.png" alt="image-20220829223642455" style="zoom:40%;" />

找到请求地址，复制其URL去除参数的部分，在源代码中的XHR提取断点中，添加断点，将地址复制进去：

<img src="https://images.drshw.tech/images/notes/image-20220829224114925.png" alt="image-20220829224114925" style="zoom:50%;" />

将添加的断点打钩，即可在XHR包中存在该地址时停止加载，并跳转至相关的JS代码：

<img src="https://images.drshw.tech/images/notes/image-20220829224406671.png" alt="image-20220829224406671" style="zoom:50%;" />

格式化后：

<img src="https://images.drshw.tech/images/notes/image-20220829224427917.png" alt="image-20220829224427917" style="zoom:50%;" />

按照调用堆栈跳过函数调试四次，也会进入看到用户名和密码等信息：

<img src="https://images.drshw.tech/images/notes/image-20220829225712750.png" alt="image-20220829225712750" style="zoom: 40%;" />

<img src="https://images.drshw.tech/images/notes/image-20220829224932398.png" alt="image-20220829224932398" style="zoom:50%;" />

找到`c`参数的意义即可，继续跳过函数调试：

<img src="https://images.drshw.tech/images/notes/image-20220829225406960.png" alt="image-20220829225406960" style="zoom:50%;" />

往上寻找，即找到了加密位置。

由此，我们总结：

+ DOM事件断点，执行的比较靠前，距离加密函数比较远（从点击事件找，从前向后 ）；
+ XHR断点，执行比较靠后 距离加密函数相对较近，可以根据调用堆栈快速定位（从发包请求开始找，由内到外 ）。

## 方法栈

调用栈是解析器的一种机制，可以在脚本调用多个函数时，跟踪每个函数在完成执行时应该返回控制的点。

- 当脚本要调用一个函数时，解析器把该函数添加到栈中并且执行这个函数；
- 任何被这个函数调用的函数会进一步添加到调用栈中，并且运行到它们被上个程序调用的位置；
- 当函数运行结束后，解释器将它从堆栈中取出，并在主代码列表中继续执行代码。

![image-20220810155355179](https://images.maiquer.tech/images/wx/image-20220810155355179.png)

## debug原理

### 什么是无限debugger

无限`debugger`是网站为了干扰JS调试而设置的“加密”技术，例如网站：中国及多国专利审查信息查询（http://cpquery.cnipa.gov.cn/ ）（瑞数加密 ）。

无限`debugger`不会真正的死循环，而是有规律得执行逻辑，一般会采用定时器进行操作：

```js
Function("debugger;").call()
```

无限`debugger`示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>

<h1 id="box"></h1>

<body>

<script>
    var ss = document.getElementById('box')
    function ff() {
        debugger;
    }
    setInterval(ff,100);

    ss.innerHTML = "大家晚上好";
</script>
</body>
</html>
```

### 一般绕过方式

对于类似的这种情况，有几种可行的处理方式：

+ 直接对其进行文件替换（暴力 ），删除所有`debugger`
+ 下一个断点，在执行前将无限`debugger`函数置空：

<img src="https://images.drshw.tech/images/notes/image-20220830124726131.png" alt="image-20220830124726131" style="zoom:50%;" />

（在13行下断点，到达断点后将内置的`setInterval()`置空 ）

+ 添加条件断点：右击行号，添加条件断点即可：

  <img src="https://images.drshw.tech/images/notes/image-20220830125550383.png" alt="image-20220830125550383" style="zoom:50%;" />

  点击后会让我们输入一个表达式，若表达式成立，则设置断点，否则移除断点。我们只需输入`false`即可使程序跳过该行断处，跳出无限`debugger`。

  其实这个操作等价于 “一律不在此处暂停” 选项。

### 过ob混淆debugger

示例站点：极简壁纸（https://bz.zzzmh.cn/index ）。

它的`debugger`来源于被**ob混淆**的字符串拼接，ob混淆是一种令人抓狂的JS混淆技术，后面会讲：

找到调用堆栈中`debugger`的来源，看到带有`_0x`这种字符串开头的变量就知道是ob混淆了：

![image-20220830131451328](https://images.drshw.tech/images/notes/image-20220830131451328.png)

在控制台中执行以下代码即可通过无限`debugger`，适用于所有对于构造函数生成无限`debugger`的情形，原理即为检测构造函数的内容：

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

##  Hook技术

### 什么是Hook

`Hook` 是一种钩子技术，在系统没有调用函数之前，钩子程序就先得到控制权，这时钩子函数既可以加工处理（改变 ）该函数的执行行为，也可以强制结束消息的传递。简单来说，修改原有的 JS 代码就是 `Hook`。

**Hook 技术之所以能够实现有两个条件：**

- 客户端拥有 JS 的最高解释权，可以决定在任何时候注入 JS，而服务器无法阻止或干预。服务端只能通过检测和混淆的手段，另 `Hook` 难度加大，但是无法直接阻止。
- 除了上面的必要条件之外，还有一个条件。就是 JS 是一种弱类型语言，同一个变量可以多次定义、根据需要进行不同的赋值，而这种情况如果在其他强类型语言中则可能会报错，导致代码无法执行。js 的这种特性，为我们 `Hook` 代码提供了便利。

**注意：**JS 变量是有作用域的，只有当被 `hook` 函数和 `debugger` 断点在同一个作用域的时候，才能 `hook` 成功。

最常用的`hook`方法为：`Object.defineProperty `，它可以为对象的属性赋值，从而替换对象属性：

基本语法：`Object.defineProperty(obj, prop, descriptor)`，它的作用就是直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，接收的三个参数含义如下：

+ `obj`：需要定义属性的当前对象；

+ `prop`：当前需要定义的属性名；

+ `descriptor`：传入一个对象，`属性名:修改后的值`，属性名也包括方法名。

示例：

```js
var user = {name: 'DrSHW'};

Object.defineProperty(user, "name", {
  value: 'Dustella',
});

console.log(user.name); // 'Dustella'，属性在 defineProperty 中被修改

var count = 20;
Object.defineProperty(user, "age", {
  get: function () {    // 属性被获取时触发
    console.log("这个人来获取值了！！");
    return count;
  },

  set: function (newVal) {  // 属性被修改时触发
    console.log("这个人来设置值了！！");
    count = newVal + 1;
  }
});
console.log(user.age);  // 20
user.age = 20;
console.log(user.age);  // 21
```

最常用的是`hook cookie` —— `cookie`为`document`对象的属性，故通过`defineProperty(document, 'cookie')`即可在获取和更改`cookie`时将其`hook`住。

附：WebAPI地址：https://developer.mozilla.org/zh-CN/docs/Web/API 。

### Hook 步骤与示例

1. 寻找hook的点；

2. 编写hook逻辑；

3. 调试。

`hook cookie`示例：同花顺行情中心官网（http://q.10jqka.com.cn/ ）：

该网站使用了`cookie`反爬——`cookie`中含有参数`v`，若没有它则无法正常请求：

<img src="https://images.drshw.tech/images/notes/image-20220830140404180.png" alt="image-20220830140404180" style="zoom:50%;" />

`cookie` 钩子用于定位 `cookie` 中关键参数生成位置，以下代码演示了当 `cookie` 中匹配到了 `v`， 则插入断点：

```js
(function () {
  var cookieTemp = '';
  Object.defineProperty(document, 'cookie', {
    set: function (val) {
      if (val.indexOf('v') != -1) {		// 若在val(cookie列表)中找到了v(index为-1代表未找到)
        debugger;		// 插入断点，找到v
      }
      console.log('Hook捕获到cookie设置->', val);
      cookieTemp = val;
      return val;
    },
    get: function () {
      return cookieTemp;
    },
  });
})();
```

总体流程：

先**清空`cookie`**（重要！ ）；在控制台注入以上代码；再点击下一页使其加载`cookie`即可成功断住，这里就是`cookie`的生成位置；继续跟踪方法栈找，即可找到加密位置（一步步分析 ）。

### Hook 方法

我们知道在 JavaScript 中 `JSON.stringify()` 方法用于将 JavaScript 对象或值转换为 JSON 字符串，`JSON.parse()` 方法用于将一个 JSON 字符串转换为 JavaScript 对象，某些站点在向 web 服务器传输用户名密码时，会用到这两个方法。

示例网站：https://www.wcbchina.com/login/login.html 。

首先定义一个变量 `stringify` 保留原始 `JSON.stringify` 方法，然后重写 `JSON.stringify` 方法；遇到 `JSON.stringify` 方法就会执行 debugger 语句，会立即断住；最后将接收到的参数返回给原始的 `JSON.stringify` 方法进行处理，确保数据正常传输：

```js
(function () {
  var stringify = JSON.stringify;
  JSON.stringify = function (params) {
    console.log("Hook JSON.stringify ——> ", params);
    debugger;
    return stringify(params);
  }
})();
```

### Hook  XHR请求

类似于浏览器的XHR断点，示例网站：https://www.qimai.cn/rank/index/brand/free/device/ipad/country/cn/genre/36 。

该网站每一个请求都会带上一个签名数据`analysis`，每次请求都会重新生成：

<img src="https://images.drshw.tech/images/notes/image-20220830143256226.png" alt="image-20220830143256226" style="zoom:50%;" />

只要我们能获取这个参数的生成，即可正常请求。

最简单的方式当然是采用XHR断点，找到我们要的包（根据预览中的数据即可找到 ），将请求URL不变的部分`https://api.qimai.cn/rank/index`加入XHR断点，即可定位发包的位置；找到后进行单步调试，可以找到`.then`方法，进入方法走到响应位置，向上找到请求位置，查看请求参数的生成逻辑即可进行模拟。

我们也可以使用控制台注入的方式找到发包位置：

首先定义一个变量 `open` 保留原始 `XMLHttpRequest.open` 方法，然后重写 `XMLHttpRequest.open` 方法，判断如果 rnd 字符串值在 URL 里首次出现的位置不为 -1，即 URL 里包含 `analysis`字符串，则执行 `debugger` 语句，会立刻断住：

```js
(function () {
    var open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url, async) {
        if (url.indexOf("analysis") != 1) {
            debugger;
        }
        return open.apply(this, arguments);
    };
})();
```

## Python执行JS的方式

### PyExecJS简介

github 地址：https://github.com/doloopwhile/PyExecJS

要想在Python中运行JS代码，PyExecJS 是使用最多的一种方式，底层实现方式是：在本地 JS 环境下运行 JS 代码。

### 准备工作

首先进行安装：

```bash
pip install PyExecJS
```

导入方式：

```python
import execjs
```

### 基本使用

可使用`eval()`方法，计算并返回一个JS表达式的值：

```python
import execjs

print(execjs.eval('Date.now()'))	# 1661843907178，按js的逻辑返回了一个时间戳
```

使用`execjs.compile()`方法**编译加载**传入的 JS 字符串，返回一个上下文对象，可用于函数调用；

调用上下文对象的`call()` 方法执行 JS 函数，并返回对应的值（无法控制台打印 ）：`context.call(函数名字符串, 参数1, 参数2, ...)`；

示例：

先编写一个`demo.js`，存放了一个函数，我们希望使用Python调用之：

```js
/* demo.js */
const adder = (a, b, c) => {
    return a + b + c
}
```

读取JS代码，编译加载，并调用函数：

```python
# demo.py
import execjs

print(execjs.eval('Date.now()'))

with open('demo.js', 'rt', encoding='UTF-8') as f:
    res = f.read()
    context = execjs.compile(res)       # 编译加载demo.js
    print(context.call('adder', 1, 2, 3))        # 调用demo方法
```

需要注意的，由于 PyExecJS 运行在本地 JS 环境下，使用之前会启动 JS 环境，最终导致**运行速度会偏慢**。而且它**无法获取到浏览器的内置对象**（如`window`、`document`、`navigator`等 ），这就需要我们对其进行环境补充。

### JS环境补充

#### 一般补充

将缺失的浏览器内置对象补充回去，各个环境的完整配置详见：https://www.runoob.com/jsref/obj-window.html 。

补充示例：

```js
// init_env.js
document = {
  cookie: 'uuid_tt_dd=10_29360271920-1658044222535-945484; __gads=ID=5b925b796ab29466-22740a5938d50041:T=1658044224:RT=1658044224:S=ALNI_MYZZ3qnATdjgh4YHRlZaBk3TnwTFw; p_uid=U010000',
  location: {
    href: 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=87135040_oem_dg&wd=eval%20JS%20&fenlei=256&oq=eval&rsv_pq=e1b3f2520003297e&rsv_t=7e58%2ByqRgVEysyNAVRctyGmKUct9An%2B6da7wzdVJDXgo7qaAS1DKyn86mLazGA1IqBPpY359&rqlang=cn&rsv_dl=tb&rsv_enter=1&rsv_btype=t&inputT=860&rsv_sug3=56&rsv_sug1=35&rsv_sug7=100&rsv_sug2=0&rsv_sug4=1037'
  }
}
navigator = {userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'}

window = {
  document: document,
  navigator: navigator
}
console.log(document.location.href);
document.getElementsByTagName = function(){};
```

在Python中提前执行`init_env.js`即可，缺啥补啥就行。

#### 使用jsdom

##### 什么是jsdom

有时候要补充的参数实在太多了，可以使用`jsdom`解决这个问题

`jsdom`是一个纯粹由 `javascript` 实现的一系列 web标准，特别是 WHATWG 组织制定的DOM]和HTML标准，用于在` nodejs `中使用。

大体上来说，该项目的目标是模拟足够的Web浏览器子集，以便用于测试和挖掘真实世界的Web应用程序，简单的说其中包含了大部分Web浏览器环境。

中文文档：https://github.com/jsdom/jsdom/wiki/jsdom

##### 准备工作

需要下载`jsdom`包：
```bash
npm install jsdom --save
```

局部导入方式：

```js
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
```

##### 基本使用

先创建一个`jsdom`实例对象（工厂 ）：`const dom = new JSDOM(dom字符串);`，传入一个`dom`字符串，即`html`代码；

该对象中可以调用Web浏览器提供的方法，示例：

```js
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM(`<!DOCTYPE html><p>DrSHW</p>`)
window = dom.window
console.log(window.document) // Document { location: [Getter/Setter] }
console.log(window.navigator.userAgent) // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/16.4.0
var title = dom.window.document.querySelector('p').textContent
console.log(title) // DrSHW
```

要补环境的话，使用`jsdom`提供的环境即可：

```js
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`)
window = dom.window
document = window.document
navigator = window.navigator
```

这样JS中就有`window`等浏览器环境变量了，能解决大部分问题。（极少数使用安全产品反爬的网站可能还需补充环境 ）
