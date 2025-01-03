# Cookie反爬虫

## Cookie反爬简介 

### 概述

Cookie 反爬虫指的是服务器端通过校验请求头中的 Cookie 值来区分正常用户和爬虫程序的手段，这种手段被广泛应用在 Web 应用中。

其加密原理如下：

<img src="https://images.drshw.tech/images/notes/image-20220905221849276.png" alt="image-20220905221849276" style="zoom:50%;" />

由于Cookie参数的值过期时间非常短，所以反爬时要**实时**获取Cookie的值，而非直接搬浏览器的Cookie值。

### 判断是否为Cookie反爬的方式

观察包中Cookie字段的`HttpOnly`字段是否打上勾，若有打上勾的参数，则存在与后端返回值有关（不一定就是，可能是关键参数 ）的Cookie反爬，举例（其实就是下面的案例一 ）：

![image-20220905233106742](https://images.drshw.tech/images/notes/image-20220905233106742.png)

该包中的两个参数`XSRF-TOKEN`和`szxx_session`两个参数的`HttpOnly`字段打上了勾，即请求时请求头中的`Cookie`参数中必须包含这两个参数，否则视为攻击或无效请求。（`XSRF-TOKEN`设置的目的是为了防范`XSRF`攻击，一般由服务端中间件实现，很多网站都会设置 ）

有时候`HttpOnly`字段并未打上勾，但不传Cookie也会请求失败，这种Cookie就不是后端返回的，而是JS中生成的，需要通过JS`hook`技术截获之，找到来源后进行逆向。

## 实战案例

### 案例一

#### 逆向目标

+ 爬取某政府网站主页（http://www.zjmazhang.gov.cn/hdjlpt/published?via=pc ）的数据；

+ 刷新抓包，可见数据请求地址为：http://www.zjmazhang.gov.cn/hdjlpt/letter/pubList（不是那个`redirect_url`，这个是第一次请求重定向用的 ），请求头中有`Cookie`参数，上面也提到了这个网站有`Cookie`反爬，需要传两个参数；请求头中还有`X-CSRF-TOKEN`参数，这是一个特殊参数，也是为了防范`CSRF`攻击的，一般在**网站的源代码**中就能找到：

  ![image-20220905235219267](https://images.drshw.tech/images/notes/image-20220905235219267.png)

  处理Cookie反爬即可。

#### 逆向分析

+ 找Cookie：直接`响应对象.cookies`即可获取，之前讲过；

+ 找`X-CSRF-TOKEN`字段信息：在源码中先将其定位：

  ![image-20220905235814471](https://images.drshw.tech/images/notes/image-20220905235814471.png)

  获取网站源码，再使用正则即可获取。

#### 逆向结果

按分析流程，完整代码如下：

```python
import re

import requests

# 获取cookies中的XSRF-TOKEN和szxx_session，和header中的X-CSRF-TOKEN
def get_tokens():
    url = 'http://www.zjmazhang.gov.cn/hdjlpt/published?via=pc'
    response = requests.get(url)
    # 提取cookies中的两个参数
    XSRF_TOKEN = response.cookies['XSRF-TOKEN']
    szxx_session = response.cookies['szxx_session']
    # 使用正则匹配
    X_CSRF_TOKEN = re.findall(r"var _CSRF = '(.*?)';", response.text)[0]
    return XSRF_TOKEN, szxx_session, X_CSRF_TOKEN

# 请求头拼接
def create_header(XSRF_TOKEN, szxx_session, X_CSRF_TOKEN):
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Content-Length": "32",
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": 'XSRF-TOKEN={};szxx_session={}'.format(XSRF_TOKEN, szxx_session),
        "Host": "www.zjmazhang.gov.cn",
        "Origin": "http://www.zjmazhang.gov.cn",
        "Pragma": "no-cache",
        "Referer": "http://www.zjmazhang.gov.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
        "X-CSRF-TOKEN": X_CSRF_TOKEN,
    }
    return headers

# 调用以上模块，进行数据请求
def get_data():
    # 请求地址
    url = 'http://www.zjmazhang.gov.cn/hdjlpt/letter/pubList'
    # 模块调用
    XSRF_TOKEN, szxx_session, X_CSRF_TOKEN = get_tokens()
    headers = create_header(XSRF_TOKEN, szxx_session, X_CSRF_TOKEN)
    # 请求参数
    data = {
        "offset": "0",
        "limit": "20",
        "site_id": "759010",
    }
    # 发送请求
    response = requests.post(url, headers=headers, data=data)
    if response.status_code == 200:
        print(response.text)
    else:
        print('请求失败')

if __name__ == '__main__':
    get_data()
```

这个案例还是很容易的，算是个开胃菜，可以体验一下Cookie反爬的基本破解方式。

下面两个案例，推荐先学习一些JS逆向的内容再回来学习，难度有些高。

### 案例二

#### 逆向目标

+ 爬取同花顺主页（https://q.10jqka.com.cn/ ）中的数据；

  + 抓包，其请求地址为：http://q.10jqka.com.cn/index/index/board/all/field/zdf/order/desc/page/2/ajax/1/ ，发现请求头中包含一个`Cookie`和`hexin-v`字段：

  ![image-20220907145221177](https://images.drshw.tech/images/notes/image-20220907145221177.png)

  其中`Cookie`字段中只包含一个参数`v`，且其值与`hexin-v`的值一样。

+ 若不在请求头中加入这两个参数，尝试请求该`url`，返回的结果中不包含任何数据，结果异常：

  ![image-20220907144418745](https://images.drshw.tech/images/notes/image-20220907144418745.png)

  但加入这两个参数后请求，结果就会包含数据；说明存在Cookie反爬。

+ 再看包中Cookie的值，发现其中的`v`字段的`HttpOnly`一项未打上勾，说明该Cookie值在JS中生成：

  ![image-20220907145146950](https://images.drshw.tech/images/notes/image-20220907145146950.png)

  破解该Cookie反爬即可。

#### 逆向分析

+ 先清空所有Cookie，注入下方`hook`代码（监听`document`的`cookie`属性改变 ），再点击下一页进行截获，确认Cookie生成位置：

```js
(function () {
  Object.defineProperty(document, 'cookie', {
    set: function (val) {
      if (val.indexOf('v') != -1) {		// 若Cookie中存在属性v，则设置断点
        debugger;
      }
      console.log('Hook捕获到cookie设置->', val);
      return val;
    }
  });
})();
```

<img src="https://images.drshw.tech/images/notes/image-20220907152558759.png" alt="image-20220907152558759" style="zoom:50%;" />

+ 跟栈调试，追踪Cookie生成的位置：

  <img src="https://images.drshw.tech/images/notes/image-20220907152915452.png" alt="image-20220907152915452" style="zoom:50%;" />

  这边的值`n`由`update()`函数生成，我们跟踪`update`函数：

  <img src="https://images.drshw.tech/images/notes/image-20220907153307791.png" alt="image-20220907153307791" style="zoom:50%;" />

  追踪到`D`函数，`D`函数又调用了上方的`O`函数，可见`O`函数就是`Cookie`的生成函数。

+ 这个文件就一千多行代码，我们可以将其全复制到本地。

  但要注意的是，这些JS代码中包含了许多浏览器API中的方法，如`getMouseMove()`等，可以使用`jsdom`补充缺失环境。

#### 代码分析

有许多环境缺失，先使用`jsdom`补充环境，在代码开头插入如下代码以补充：

```js
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`)
window = dom.window
document = window.document
navigator = window.navigator
```

再使用一个参数接收目标函数`D`，在开头声明变量`var _para`，再在`D`函数下接收该函数：

<img src="https://images.drshw.tech/images/notes/image-20220907201913547.png" alt="image-20220907201913547" style="zoom:50%;" />

再在最后封装函数并输出调试：

```js
function generate_cookie() {
  return _para()
}
console.log(generate_cookie())
```

运行，发现报了`S`中属性未定义的错误：

<img src="https://images.drshw.tech/images/notes/image-20220907202148049.png" alt="image-20220907202148049" style="zoom:50%;" />

观察代码，发现在函数`P`中对`S`进行了初始化，所以我们在执行`O`函数之前先调用`P`函数进行初始化：

<img src="https://images.drshw.tech/images/notes/image-20220907202644349.png" alt="image-20220907202644349" style="zoom:45%;" />

这步做完还会报错，原因是会调用`M`函数，而`M`函数中的`getCookie()`函数会与`jsdom`中的函数其内部冲突：

![image-20220907203045018](https://images.drshw.tech/images/notes/image-20220907203045018.png)

观察`M`函数，发现它对生成Cookie信息的主要功能只有最后一段`S[l] = Jn.random()`（即操作变量`S` ），其余部分为声明变量和条件判断，可直接删去，于是代码改为：

<img src="https://images.drshw.tech/images/notes/image-20220907202952079.png" alt="image-20220907202952079" style="zoom:40%;" />

再次运行，成功打印出了结果：

![image-20220907203148411](https://images.drshw.tech/images/notes/image-20220907203148411.png)

于是完整的JS就得到了，使用Python调用JS中的`generate_cookie()`函数即可获取Cookie中的`v`字段，装入请求头即可正常请求数据。

完整请求代码如下：

```python
import execjs
import requests

# 读取js文件
with open('demo.js', encoding='utf-8') as f:
    x = f.read()

# 调用js函数
v = execjs.compile(x).call('generate_cookie')

# 构造请求头并发送请求
def get_data():
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,"
                  "application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive",
        "Cookie": "v={}".format(v),
        "Host": "q.10jqka.com.cn",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/100.0.4896.60 Safari/537.36 "
    }
    url = 'http://q.10jqka.com.cn/index/index/board/all/field/zdf/order/desc/page/3/ajax/1/'
    res = requests.get(url, headers=headers)
    return res.text


if __name__ == '__main__':
    print(get_data())
```

### 案例三

#### 逆向目标

+ 抓取诸葛找房首页（https://sh.esfxiaoqu.zhuge.com/page2/ ）中的数据包；

+ 找数据包，发现有两个包，请求地址为：https://sh.esfxiaoqu.zhuge.com/page2/ ，不同的是一个有数据，一个无数据：

  <img src="https://images.drshw.tech/images/notes/image-20220907211204262.png" alt="image-20220907211204262" style="zoom:50%;" />

  这种情况一般是网站做了重定向，第一次发包携带了一些信息，供第二次传参用。

+ 请求头中有Cookie信息，经Python请求调试发现存在Cookie反爬；
+ 再看Cookie信息，发现`acw_tc`中`HttpOnly`打钩了，说明它应该是后端返回而来的，且经过调试，`acw_sc__v2`参数也需要传递，需要找到两个参数的来源。

***注**：有很多网站都会使用这种反爬方式（即携带名为`acw_sc__v2`的Cookie ），破解难度有些大。但它们反爬的方式都是一样的，一旦学会破解一个，其余网站直接照搬破解方式即可，比如下面的案例。

#### 逆向分析

+ 使用搜索大法，居然搜索不到`acw_sc__v2`。那先清空Cookie，再刷新，发现有一个`debugger`断点。在断住的同时，多了一些即时生成的JS文件（以`VM`文件名开头 ），说不定生成逻辑就在这。

+ 再次搜索这个关键字，成功定位：

  ![image-20220907212919501](https://images.drshw.tech/images/notes/image-20220907212919501.png)

  在控制台打印`x`，发现`x`就是Cookie的值，现在只需要反推`x`的值即可：

  ![image-20220907213046255](https://images.drshw.tech/images/notes/image-20220907213046255.png)

  生成过程应该就在这个文件中，搜索`reload`关键字，但搜不到，是因为上面的代码中的字符串被以字节码的形式（类似`\x43` ）混淆过了。这种混淆可以使用解混淆工具还原，例如：https://www.sojson.com/jsjiemi.html，将JS代码扔进去即可。

  解混淆后的代码可能会报错，这是很可能是因为引号匹配的问题。将报错点的`'`改为`` `即可：

  <img src="https://images.drshw.tech/images/notes/image-20220907214643005.png" alt="image-20220907214643005" style="zoom:50%;" />

  现在再次搜索，就可找到`reload`的调用点：

  ![image-20220907214731245](https://images.drshw.tech/images/notes/image-20220907214731245.png)

+ 在浏览器中该位置下断点，发现`arg2`就是加密后的数据。目前可以确定解密函数就在以下代码段内：

  ![image-20220907220212962](https://images.drshw.tech/images/notes/image-20220907220212962.png)

  通过断点和控制台打印，我们发现关键参数就是在上面两个构造函数中返回的，此时可以将它们保存到本地，然后将一些混淆参数进行替换（控制台打印 ）：

  替换后该部分代码如下：

  ```js
  var l = function() {
    while (window['_phantom'] || window['__phantomas']) {}
    var _0x5e8b26 = '3000176000856006061501533003690027800375'
    String['prototype']['hexXor'] = function(_0x4e08d8) {
      var _0x5a5d3b = ''
      for (var _0xe89588 = 0x0; _0xe89588 < this['length'] && _0xe89588 < _0x4e08d8['length']; _0xe89588 += 0x2) {
        var _0x401af1 = parseInt(this['slice'](_0xe89588, _0xe89588 + 0x2), 0x10)
        var _0x105f59 = parseInt(_0x4e08d8['slice'](_0xe89588, _0xe89588 + 0x2), 0x10)
        var _0x189e2c = (_0x401af1 ^ _0x105f59)['toString'](0x10)
        if (_0x189e2c['length'] == 0x1) {
          _0x189e2c = '0' + _0x189e2c
        }
        _0x5a5d3b += _0x189e2c
      }
      return _0x5a5d3b
    }
  
    String['prototype']['unsbox'] = function() {
      var _0x4b082b = [0xf, 0x23, 0x1d, 0x18, 0x21, 0x10, 0x1, 0x26, 0xa, 0x9, 0x13, 0x1f, 0x28, 0x1b, 0x16, 0x17, 0x19, 0xd, 0x6, 0xb, 0x27, 0x12, 0x14, 0x8, 0xe, 0x15, 0x20, 0x1a, 0x2, 0x1e, 0x7, 0x4, 0x11, 0x5, 0x3, 0x1c, 0x22, 0x25, 0xc, 0x24]
      var _0x4da0dc = []
      var _0x12605e = ''
      for (var _0x20a7bf = 0x0; _0x20a7bf < this['length']; _0x20a7bf++) {
        var _0x385ee3 = this[_0x20a7bf]
        for (var _0x217721 = 0x0; _0x217721 < _0x4b082b['length']; _0x217721++) {
          if (_0x4b082b[_0x217721] == _0x20a7bf + 0x1) {
            _0x4da0dc[_0x217721] = _0x385ee3
          }
        }
      }
      _0x12605e = _0x4da0dc['join']('')
      return _0x12605e
    }
  
    var _0x23a392 = arg1['unsbox']()
    arg2 = _0x23a392['hexXor'](_0x5e8b26)
    setTimeout('reload(arg2)', 0x2)
  }
  ```

+ 通过调试，发现Cookie字段`acw_sc__v2`的值即为`hexXor`返回。而该函数需要传递另一个函数`unsbox`返回的参数。

#### 代码分析

+ 得到关键代码后，下面进行补充参数和调用了。先删去冗余代码，再补充参数`arg1`。这个参数每次都在变化，作为测试可以先让它不变。

  修改后代码如下：

  ```js
  var arg1 = 'EBE956954277345CA84E5F6809B61EF4803F573F'
  var token
  
  var l = function(arg1) {
    // while (window['_phantom'] || window['__phantomas']) {}
    var _0x5e8b26 = '3000176000856006061501533003690027800375'
    String['prototype']['hexXor'] = function(_0x4e08d8) {
      var _0x5a5d3b = ''
      for (var _0xe89588 = 0x0; _0xe89588 < this['length'] && _0xe89588 < _0x4e08d8['length']; _0xe89588 += 0x2) {
        var _0x401af1 = parseInt(this['slice'](_0xe89588, _0xe89588 + 0x2), 0x10)
        var _0x105f59 = parseInt(_0x4e08d8['slice'](_0xe89588, _0xe89588 + 0x2), 0x10)
        var _0x189e2c = (_0x401af1 ^ _0x105f59)['toString'](0x10)
        if (_0x189e2c['length'] == 0x1) {
          _0x189e2c = '0' + _0x189e2c
        }
        _0x5a5d3b += _0x189e2c
      }
      token = _0x5a5d3b
      return _0x5a5d3b
    }
  
    String['prototype']['unsbox'] = function() {
      var _0x4b082b = [0xf, 0x23, 0x1d, 0x18, 0x21, 0x10, 0x1, 0x26, 0xa, 0x9, 0x13, 0x1f, 0x28, 0x1b, 0x16, 0x17, 0x19, 0xd, 0x6, 0xb, 0x27, 0x12, 0x14, 0x8, 0xe, 0x15, 0x20, 0x1a, 0x2, 0x1e, 0x7, 0x4, 0x11, 0x5, 0x3, 0x1c, 0x22, 0x25, 0xc, 0x24]
      var _0x4da0dc = []
      var _0x12605e = ''
      for (var _0x20a7bf = 0x0; _0x20a7bf < this['length']; _0x20a7bf++) {
        var _0x385ee3 = this[_0x20a7bf]
        for (var _0x217721 = 0x0; _0x217721 < _0x4b082b['length']; _0x217721++) {
          if (_0x4b082b[_0x217721] == _0x20a7bf + 0x1) {
            _0x4da0dc[_0x217721] = _0x385ee3
          }
        }
      }
      _0x12605e = _0x4da0dc['join']('')
      return _0x12605e
    }
  
    var _0x23a392 = arg1['unsbox']() // 这里是方法调用，不能删
    arg2 = _0x23a392['hexXor'](_0x5e8b26)
    // setTimeout('reload(arg2)', 0x2)
  }
  
  function get_cookies(arg1) {
    l(arg1)
    return token
  }
  
  console.log(get_cookies(arg1))
  ```

  成功运行：

  <img src="https://images.drshw.tech/images/notes/image-20220907231857872.png" alt="image-20220907231857872" style="zoom:50%;" />

+ `arg1`参数很好获取，不带参数直接请求该网站即可：

  ![image-20220907223606722](https://images.drshw.tech/images/notes/image-20220907223606722.png)

  使用正则提取数据即可。

+ 还有一个参数`acw_tc`，则需要携带含`acw_sc__v2`字段的Cookie进行再次请求，此时会返回完整的Cookie，带着这个Cookie即可完成请求。

+ 这样，所有问题就全都解决了，可以进行Python还原：

请求数据过程的完整代码如下：

```python
import re
import execjs
import requests

# 请求路径
data_url = 'https://sh.esfxiaoqu.zhuge.com/page2/'
headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Host": "sh.esfxiaoqu.zhuge.com",
    "Pragma": "no-cache",
    "Referer": "https://sh.esfxiaoqu.zhuge.com/page2/",
    "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
}

# 获取所有Cookie
def get_complete_cookie():
    complete_cookie = {}
    # 第一次不带参数访问首页，获取 acw_tc 和 acw_sc__v2
    response = requests.get(url=data_url, headers=headers)
    complete_cookie.update(response.cookies.get_dict())
    arg1 = re.findall("arg1='(.*?)'", response.text)[0]
    with open('demo.js', 'r', encoding='utf-8') as f:
        js_file = f.read()
    acw_sc__v2 = execjs.compile(js_file).call('get_cookies', arg1)
    complete_cookie.update({"acw_sc__v2": acw_sc__v2})
    # 第二次访问首页，获取其他 cookies
    response2 = requests.get(url=data_url, headers=headers, cookies=complete_cookie)
    complete_cookie.update(response2.cookies.get_dict())
    return complete_cookie

# 进行请求
def get_data():
    complete_cookie = get_complete_cookie()
    # 在请求头中加入字段
    headers['Cookie'] = '; '.join([f'{k}={v}' for k, v in complete_cookie.items()])
    # 请求
    response = requests.get(url=data_url, headers=headers, cookies=complete_cookie)
    return response.text

if __name__ == '__main__':
    print(get_data())

```

难度比较大，不过其实`acw_sc__v2`的应用场景很广泛（类似一种加密产品 ），再遇到使用它进行的反爬，破解方法与之大同小异。

