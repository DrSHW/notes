# JS-RPC

## 简介

`RPC`（Remote Procedure Call ），远程过程调用，简单的理解是一个节点请求另一个节点提供的服务。

`RPC` 技术是非常复杂的，对于我们搞爬虫、逆向的来说，不需要完全了解，只需要知道这项技术如何在逆向中应用就行了。

简单来说，`RPC` 在逆向中就是将**本地和浏览器**，看做是**服务端和客户端**；二者之间通过 `WebSocket` 协议进行 `RPC` 通信，在浏览器中将加密函数暴露出来，在本地**直接调用**浏览器中对应的加密函数，从而得到加密结果，不必去在意函数具体的执行逻辑，也省去了扣代码、补环境等操作，可以省去大量的逆向调试时间（是真正的核武器 ）。

但是较于一般的逆向，使用`RPC`逆向也有一些缺点——由于多做了浏览器向本地的转发操作，程序运行效率会收到一定影响。

## Sekiro-RPC  

使用原理：将`SekiroClient `客户端注入到浏览器环境，然后通过`SekiroClient `和 本地`Sekiro `服务器通信，即可直接在本地调用浏览器内部方法。

### 准备工作

先下载`rpc`服务程序，下载地址https://storage.drshw.tech/OneDrive/note-source/sk-rpc.zip ：

还需要配置本地Java环境，这里只提供JDK安装地址，https://storage.drshw.tech/OneDrive/note-source/jdk-8u221.zip 。

### 开启服务

使用`bin`目录下的脚本文件以开启服务：

![image-20220908204618476](https://images.drshw.tech/images/notes/image-20220908204618476.png)

启动后，会在本地的`5620`端口开启一个监听服务。

### `SekiroClient`客户端搭建

先引入客户端RPC环境，导入JS地址：https://sekiro.virjar.com/sekiro-doc/assets/sekiro_web_client.js。

官方提供的` SekiroClient`JS代码样例如下：

```js
// 生成唯一标记uuid编号
function guid() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
// 连接服务端，ws 相当于 http，wss 相当于 https
var client = new SekiroClient("ws://127.0.0.1:5620/business-demo/register?group=ws-group&clientId="+guid());
// 业务接口
client.registerAction("登陆",function(request, resolve, reject){
    // 若客户端来请求，则返回当前时间的字符串
    resolve("" + new Date());
})
```

官方提供了一个免费的接口`business-demo`包含了大部分爬虫需求的功能，更多功能需要使用付费接口`business`。

一些参数及其意义如下：

+ **`group`**：业务类型（接口组 ），每个业务一个 `group`，`group` 下面可以注册多个终端（`SekiroClient` ），同时`group` 可以挂载多个 `Action`，`Action`可表示各加密点的位置。如某爬虫程序需要登陆，签名认证两处加密，即可以在一个`group`中挂载两个`Action`；

+ **`clientId`**：指代设备，多个设备使用多个机器提供 `API` 服务，提供群控能力和负载均衡能力；

+ **`SekiroClient`**：服务提供者客户端，主要场景为手机/浏览器等。最终 `Sekiro`服务端的调用会转发到 `SekiroClient`。每个` client` 需要有一个唯一的 `clientId`；

+ **`registerAction`**：接口，同一个 `group` 下面可以有多个接口，分别做不同的功能；
+ **`resolve()`**：将内容传回本地的方法；

+ **`request()`**：本地发的请求，如果请求里有多个参数，可以以键值对的方式从里面提取参数然后再做处理。

### 连接测试

打开服务端，在浏览器中打开以下`html`文件：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>

<body>

    <script src="https://sekiro.virjar.com/sekiro-doc/assets/sekiro_web_client.js"></script>
    <script>
        // 随机生成clientId，这是不会变的
        function guid() {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        }
	    // 连接本地服务端
        var client = new SekiroClient("ws://127.0.0.1:5620/business-demo/register?group=rpc-test&clientId=" + guid());
	    // 注册名为get_cookie_v的Action事件
        client.registerAction("clientTime", function (request, resolve, reject) {
            // 若本地对该接口进行请求，则返回当前时间的字符串
            resolve("" + new Date());
        })

    </script>
</body>

</html>
```

可见后端请求了我们需要注入的JS文件：

![image-20220908232316633](https://images.drshw.tech/images/notes/image-20220908232316633.png)

当控制台打印如下字段时，即表示连接成功：

![image-20220908232413547](https://images.drshw.tech/images/notes/image-20220908232413547.png)

这个`clientTime`就是我们在`group`中挂载的一个`Action`的名称。

### 状态及请求测试

`Sekiro` 为我们提供了一些测试用的API接口：

+ 查看分组列表接口：http://127.0.0.1:5620/business-demo/groupList

+ 查看队列状态接口：http://127.0.0.1:5620/business-demo/clientQueue?group=test

+ 调用转发测试接口：http://127.0.0.1:5620/business-demo/invoke?group=test&action=clientTime&param=testparm

  该接口可进行请求测试，还是上面的`html`页面，我们请求地址：http://127.0.0.1:5620/business-demo/invoke?group=rpc-test&action=test&param=testparm，返回结果如下：

  ![image-20220908233650268](https://images.drshw.tech/images/notes/image-20220908233650268.png)

对于调用转发测试，我们也可以使用Python请求测试：

```python
import requests
data = {"group": "rpc-test",
        "action": "clientTime",
        }
res = requests.get("http://127.0.0.1:5620/business-demo/invoke",params=data )
print(res.text)
```

请求后，可以在打印结果或控制台中看见响应结果：

![image-20220908233945497](https://images.drshw.tech/images/notes/image-20220908233945497.png)

## 注入方式

这里我们将结合案例，讲解JS的三种注入方式：

### 控制台注入

在本章主干**Cookie反爬**一节中，已经讲过通过完整抓取JS代码的方式，破解同花顺官网http://q.10jqka.com.cn/中的Cookie反爬。

在这里，我们尝试使用控制台注入RPC的手段对其进行破解。

老规矩，先使用`hook`抓取Cookie的生成位置：

```js
(function () {
  Object.defineProperty(document, 'cookie', {
    set: function (val) {
      if (val.indexOf('v') != -1) {
        debugger;
      }
      console.log('Hook捕获到cookie设置->', val);
      return val;
    }
  });
})();
```

点击下一页，跟栈调试到`D`函数处。我们之前讲过这里的`D`函数就是加密函数，用变量将其导出：

![image-20220909142115270](https://images.drshw.tech/images/notes/image-20220909142115270.png)

接收后跳出`debugger`，即可在控制台上截获加密函数。由于Cookie更新十分频繁，为了放止定义过的变量被刷掉，动作一定要快。若未得到加密函数（显示`undefined` ），需要多尝试几次（在**无痕模式**操作肯定没问题 ）。

<img src="https://images.drshw.tech/images/notes/image-20220909145907288.png" alt="image-20220909145907288" style="zoom:50%;" />

获取函数`_get__cookie`后，一定要先跳出`debugger`，再注入客户端环境JS代码——也就是在控制台执行https://sekiro.virjar.com/sekiro-doc/assets/sekiro_web_client.js中的所有代码。

<img src="https://images.drshw.tech/images/notes/image-20220909144014425.png" alt="image-20220909144014425" style="zoom:50%;" />

接着按传参规范将客户端环境补齐，代码如下：

```js
// 随机生成clientId，这是不会变的
function guid() {
    function S4() {
          return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
// 连接服务端，group的值为rpc-test
var client = new SekiroClient("ws://127.0.0.1:5620/business-demo/register?group=rpc-test&clientId=" + guid());
// 注册名为get_cookie_v的Action事件
client.registerAction("get_cookie_v", function(request, resolve, reject){
    // 调用刚刚抓取的_global__cookie()，并提供接口将结果传回本地
    resolve(_global__cookie());
})
```

![image-20220909144128527](https://images.drshw.tech/images/notes/image-20220909144128527.png)

再使用本地Python请求客户端开放的接口，注意传参中`group`和`action`的值要与客户端接口中的两个参数相对应：

![image-20220909144404479](https://images.drshw.tech/images/notes/image-20220909144404479.png)

可见成功传回了一个Cookie字段`v`的串，直接省去了我们对JS溯源，补变量环境和调试的时间。

### 油猴注入形式

#### 油猴是什么

[油猴`Tampermonkey`](https://links.jianshu.com/go?to=https%3A%2F%2Ftampermonkey.net%2F)是一款免费的浏览器扩展和最为流行的用户脚本管理器，适用于Chrome，Microsoft Edge，Safari，Opera Next和 Firefox。它允许用户自行在浏览器中添加脚本，并在开启对应页面时应用。如果你了解**脚本注入**，你可以把它认为是给自己注入脚本的工具之一。

#### 使用方式

在浏览器插件市场下载油猴插件，进入管理面板，点击右上栏中的加号，即可创建自定义脚本：

![image-20220909152453178](https://images.drshw.tech/images/notes/image-20220909152453178.png)

首先是最上方的一排注释，它们都有特定的含义，如下表：

| 选项           | 含义                                                                                                                                                                                                                                                                                      |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@name`        | 脚本的名称；                                                                                                                                                                                                                                                                              |
| `@namespace`   | 命名空间，用来区分相同名称的脚本，一般写作者名字或者网址就可以；                                                                                                                                                                                                                          |
| `@version`     | 脚本版本，油猴脚本的更新会读取这个版本号；                                                                                                                                                                                                                                                |
| `@description` | 描述这个脚本是干什么用的；                                                                                                                                                                                                                                                                |
| `@author`      | 编写这个脚本的作者的名字；                                                                                                                                                                                                                                                                |
| **`@match`**   | 从字符串的起始位置匹配正则表达式，只有匹配的网址才会执行对应的脚本，例如 `*` 匹配所有，`https://www.baidu.com/*` 匹配百度等，可以参考 Python `re` 模块里面的 `re.match()` 方法，允许多个实例；                                                                                            |
| **`@include`** | 和 @match 类似，只有匹配的网址才会执行对应的脚本，但是 @include 不会从字符串起始位置匹配，例如 `*://*baidu.com/*` 匹配百度；                                                                                                                                                              |
| `@icon`        | 脚本的 `icon` 图标；                                                                                                                                                                                                                                                                      |
| `@grant`       | 指定脚本运行所需权限，如果脚本拥有相应的权限，就可以调用油猴扩展提供的 API 与浏览器进行交互。如果设置为 `none` 的话，则不使用沙箱环境，脚本会直接运行在网页的环境中，这时候无法使用大部分油猴扩展的 API。如果不指定的话，油猴会默认添加几个最常用的 API；                                 |
| `@require`     | 如果脚本依赖其他 JS 库的话，可以使用 `require` 指令导入，在运行脚本之前先加载其它库；                                                                                                                                                                                                     |
| **`@run-at`**  | 脚本注入时机，该选项是能不能 `hook` 到的关键，有五个值可选：`document-start`：网页开始时；`document-body`：body出现时；`document-end`：载入时或者之后执行；`document-idle`：载入完成后执行，默认选项；`context-menu`：在浏览器上下文菜单中单击该脚本时，一般将其设置为 `document-start`。 |

这些注释中，若有些字段不存在或已经有替代（如`@icon`，`@require`，`@match/include` ），就可以不用写了。

接下来直接写JS执行逻辑即可。

#### 案例

##### 逆向目标

+ 爬取今日头条主页（https://www.toutiao.com/ ）中的数据。

+ 定位目标数据包并进行抓包，请求地址为：https://www.toutiao.com/api/pc/list/feed?channel_id=0&max_behot_time=1662700245&category=pc_profile_recommend&aid=24&app_name=toutiao_web&_signature=_02B4Z6wo00501ZWpyDQAAIDBFasydcUD1ImVjcyAAAZxa0MSGc6ZXISWkOKhwRZMoLUSM8mug2DcIEyUw4e.uOghEIiGdqeoX1on23PX9GkYOYwlPBsMLE.LiDqaI0ub.Ny.1wj6q6uwZrp0bb

  在URL和请求参数中存在一个`_signature`反爬字段，需要将其进行逆向：

  ![image-20220909154148803](https://images.drshw.tech/images/notes/image-20220909154148803.png)

##### 定位加密

全局搜索关键字`_signature`，下断点刷新：

![image-20220909155735064](https://images.drshw.tech/images/notes/image-20220909155735064.png)

发现关键字`n`与签名的格式极为相似，而`n`又是由`u`函数返回的，我们暂不管参数（因为不一定要用到 ），直接进入`u`函数内部，并下断点刷新：

![image-20220909161047935](https://images.drshw.tech/images/notes/image-20220909161047935.png)

发现返回结果为一个很长的表达式，完整将其打印也是类似签名的一个串。由于该表达式有许多冗余的分支，我们可以通过打印调试的方式截取真正执行的部分：

最后发现`a.call(n, o)`打印的结果即为我们要的结果：

![image-20220909161421572](https://images.drshw.tech/images/notes/image-20220909161421572.png)

继续还原，根据上下文可知，`n`被赋值为`window.byted_acrawler`，`a`应为`n.sign`，即`window.byted_acrawler.sign`（通过控制台打印不断调试 ），`a.call(n, o)`等价于`window.byted_acrawler.sign(o)`；

而`o`参数即为请求数据接口除去`_signature`的URL。

退出所有断点，发现`window.byted_acrawler.sign`是在全局定义的，可以直接调用，传入URL即可。

##### 编写油猴注入

需要依赖JS环境，注意添加`@require`注解。油猴JS代码如下：

```js
// ==UserScript==
// @name         今日头条_signature反爬
// @namespace    https://www.toutiao.com/
// @version      0.1
// @description  hook 今日头条中的_signiture字段
// @author       xialuo
// @match        https://www.toutiao.com/*
// @grant        none
// @require      https://sekiro.virjar.com/sekiro-doc/assets/sekiro_web_client.js
// ==/UserScript==

(function () {
    'use strict';
    function guid() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
var client = new SekiroClient("ws://127.0.0.1:5620/business-demo/register?group=tt-test&clientId=" + guid());
    /* 自定义函数 */
    client.registerAction("get_signature", function (request, resolve, reject) {
        var url = request['url'];
        if (!url){
            reject("url 不能为空")
        }
        resolve({"signature": window.byted_acrawler.sign({url}), "cookie": document.cookie})
    })
})();
```

自定义函数中，使用`request`参数接收`url`，调用网站中的函数，并将结果通过`resolve`返回本地。

启用油猴脚本后，再次进入控制台，即可发现已经注入成功：

![image-20220909165838409](https://images.drshw.tech/images/notes/image-20220909165838409.png)

##### 使用Python调试

```python
import requests
import urllib3

urllib3.disable_warnings()
base_url = 'https://www.toutiao.com/api/pc/list/feed?channel_id=0&max_behot_time=1662700245&category=pc_profile_recommend&aid=24&app_name=toutiao_web'
req_data = {
    "app_name": "toutiao_web",
   }

def get_sign(url):
    data = {
        "group": "tt-test",
        "action": "get_signature",
        "url": url
    }
    resp = requests.post(url="http://127.0.0.1:5620/business-demo/invoke", data=data, verify=False)
    json_resp = resp.json()
    req_data["signature"] = json_resp["signature"]
    if "?" in url:
        url += "&_signature={}".format(json_resp['signature'])
    else:
        url += "?_signature={}".format(json_resp['signature'])
    return url


data_url = get_sign(base_url)

session = requests.session()
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"
}

res = session.get(data_url, headers=headers, data=req_data)
print(res.text)
print(res.json().get('message'))

if res.status_code == 200:
    if res.json().get('message') == 'success':
        items = res.json().get('data')
        for i in items:
            title = i.get('title')
            print(title)
```

执行后，成功获取了数据：

<img src="https://images.drshw.tech/images/notes/image-20220909171353410.png" alt="image-20220909171353410" style="zoom:50%;" />

### JS注入动态传参

所谓注入动态传参，其原理就是通过本地与网页中JS的映射修改JS（其实就是之前讲的替换 ），直接在加密点处添加JS代码，以达到效果。

#### 逆向目标

+ 爬取巨量星图热榜（https://www.xingtu.cn/sup/creator/hot ）中的数据；

+ 先注册登录，再进入星图热榜抓包，请求数据的地址根URL为：https://www.xingtu.cn/h/api/gateway/handler_get/，URL中有两个可疑参数`tag`和`sign`，经调试只需传递`sign`参数即可；

  ![image-20220909204153370](https://images.drshw.tech/images/notes/image-20220909204153370.png)

+ 找到`sign`生成的位置即可。

#### 逆向分析

+ 使用XHR断点调试：

  <img src="https://images.drshw.tech/images/notes/image-20220909214040262.png" alt="image-20220909214040262" style="zoom:50%;" />

+ 继续进行跟栈调试，寻找`sign`参数的加密位置：

  <img src="https://images.drshw.tech/images/notes/image-20220909220025105.png" alt="image-20220909220025105" style="zoom:50%;" />

+ 找到了类似`sign`构造的串，而该串由`w`函数返回，参数有些复杂，那我们直接观察`w`函数：

  ![image-20220909222056785](https://images.drshw.tech/images/notes/image-20220909222056785.png)

  我们发现它返回了`v`函数和两个参数`a`和`y`；其中`a`很明显，是除`sign`外的请求参数拼接在一起构成的字符串，而`y`乍一看是一个加密串，观察上下文发现是使用`const`关键字写死的，直接照抄即可。

+ 于是，我们找到了加密参数。按照以前的做法，还需要补充环境依赖。但是在这里我们只需要进行RPC注入即可。

#### RPC注入

+ 先将源文件进行替换，然后再`return`执行之前进行代码注入，截获加密串：
+ 先引入环境JS代码，这里的做法是创建一个`script`标签，并添加`src`属性；
+ 再进行服务端连接，老套路；
+ 再挂载一个`Action`，接收一个本地传递的参数，即上面的`a`，请求参数拼接而成的字符串，返回加密的`sign`。

完整代码如下：

```js
(function() {
  // 导入环境
  var newElement = document.createElement('script')
  newElement.setAttribute('type', 'text/javascript')
  newElement.setAttribute('src', 'https://sekiro.virjar.com/sekiro-doc/assets/sekiro_web_client.js')
  document.body.appendChild(newElement)
  function guid() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
  }
  function startSekiro() {
    var client = new SekiroClient('ws://127.0.0.1:5620/business-demo/register?group=rpc-sign&clientId=' + guid())
    // 挂载Action
    client.registerAction('get_sign', function(request, resolve, reject) {
      // 接收本地服务传递的参数
      var enc_data = request['data']
      var res = enc_data
      // 返回加密参数的执行结果，即sign的值
      resolve(v()(res + y))
    })
  }
  // 等待环境JS加载
  setTimeout(startSekiro, 1000)
}
)()
```

注入并保存：

![image-20220909230421343](https://images.drshw.tech/images/notes/image-20220909230421343.png)

跳出断点后，连接成功：

![image-20220909224259111](https://images.drshw.tech/images/notes/image-20220909224259111.png)

#### 接口调用

+ 使用Python程序来进行调用

```python
import requests

def get_sign():
    data = {
        "group": "rpc-sign",
        "action": "get_sign",
        "data": 'hot_list_id0service_methodGetHotListDataservice_nameauthor.AdStarAuthorServicesign_strict1tag61e54c924fe6649d1b271220'
    }
    res = requests.get("http://127.0.0.1:5620/business-demo/invoke", params=data)
    return res.json().get('data')

def get_data():
    url = 'https://www.xingtu.cn/h/api/gateway/handler_get/'
    params = {
        "hot_list_id": "0",
        "tag": "61e54c924fe6649d1b271220",
        "service_name": "author.AdStarAuthorService",
        "service_method": "GetHotListData",
        "sign_strict": "1",
    }
    sign = get_sign()
    params['sign'] = sign
    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "cookie": "passport_csrf_token=716a6ee6bb6ae9fe54c4def566579821; passport_csrf_token_default=716a6ee6bb6ae9fe54c4def566579821; csrftoken=2WxhAKTfiTIfrZMDDGEefFi; tt_webid=7125341076596196878; gfpart_1.0.1.3839_220078=0; gfpart_1.0.1.3880_220078=1; csrf_session_id=989c7a1f558481addafc6a4445352540; ttcid=0891c26ee93b4f99a10e9617e05bfd6521; MONITOR_WEB_ID=a3ed951f-2a8d-4227-af45-fd8d6ab1c558; tt_scid=6YpBFdUP4y4viKPpF7.VwWymz5HfHwEji21sTogt2orWNJWqFx2mvEqK2F-FTP1j3e36; s_v_web_id=verify_l7eigj3o_JgIGTLCk_XV4L_4rbD_AN3O_OGR9TFMOjind; _tea_utm_cache_2018=undefined; passport_auth_status=fb7ee123cc0428b8c547fdea31241cb5%2C335b6426aae826682b6e84c8e827def4; passport_auth_status_ss=fb7ee123cc0428b8c547fdea31241cb5%2C335b6426aae826682b6e84c8e827def4; sid_guard=b0bdf59ccd1bee257f53107a3ce0b50a%7C1661762541%7C5183999%7CFri%2C+28-Oct-2022+08%3A42%3A20+GMT; uid_tt=6c1566658a3baed6a71c342a0769603d; uid_tt_ss=6c1566658a3baed6a71c342a0769603d; sid_tt=b0bdf59ccd1bee257f53107a3ce0b50a; sessionid=b0bdf59ccd1bee257f53107a3ce0b50a; sessionid_ss=b0bdf59ccd1bee257f53107a3ce0b50a; sid_ucp_v1=1.0.0-KDczYzBmOGY4MDYyMjlmOTZjNTNiZTQ2NGY0M2Y4YzA1MzEzOTdhZTAKFgjIk8Dk7I3-ARDt97GYBhimDDgIQCYaAmxmIiBiMGJkZjU5Y2NkMWJlZTI1N2Y1MzEwN2EzY2UwYjUwYQ; ssid_ucp_v1=1.0.0-KDczYzBmOGY4MDYyMjlmOTZjNTNiZTQ2NGY0M2Y4YzA1MzEzOTdhZTAKFgjIk8Dk7I3-ARDt97GYBhimDDgIQCYaAmxmIiBiMGJkZjU5Y2NkMWJlZTI1N2Y1MzEwN2EzY2UwYjUwYQ; star_sessionid=b0bdf59ccd1bee257f53107a3ce0b50a; gftoken=YjBiZGY1OWNjZHwxNjYxNzYyNjE0OTF8fDAGBgYGBgY; pay_sessionid=sOmyHbM1VmFN1cplmbaj9btodVx2M5E7uB1z9v2XpuqnBWyjEFef8RmPmYBMFnv8",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
    }
    res = requests.get(url, params=params, headers=headers)
    print(res.url)      # 得到数据地址URL
    print(res.text)     # 得到数据


get_data()
```

执行后，成功打印数据：

![image-20220909230332492](https://images.drshw.tech/images/notes/image-20220909230332492.png)

