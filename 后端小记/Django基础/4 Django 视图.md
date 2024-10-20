# Django 视图

## 回顾

在第二节中，我们对视图`view`有了一定的了解：

- 视图就是`应用`中`views.py`文件中的**函数**；
- 视图的第一个参数必须为`HttpRequest对象`，还可能包含下参数如：
  - 通过正则表达式组获取的位置参数；
  - 通过正则表达式组获得的关键字参数；
- 视图必须返回一个`HttpResponse对象`或其`子对象`作为响应，其子对象包括：`JsonResponse`和`HttpResponseRedirect`，他们都在`django.http`包中；
- 视图负责接受Web请求`HttpRequest`，进行逻辑处理，返回Web响应`HttpResponse`给请求者，响应内容可以是`HTML内容`，`404错误`，`重定向`，`json数据`...
- [视图的处理过程](https://docs.drshw.tech/sf/1/2/#%E9%85%8D%E7%BD%AEurlconf)；
- 使用视图时需要进行两步操作，两步操作不分先后：
  1. 配置`URLconf`，编写总路由和子路由；
  2. 在`应用/views.py`中定义视图。

## 后端调试工具——ApiFox

教程中对视图接口的调试，全部使用ApiFox进行。（~~明确一下这里不是打广告~~）

首先需要下载软件：[下载地址](https://www.apifox.cn/?utm_source=baidu_sem3&bd_vid=10842120705104648038)。

首先需要新建团队：

<img src="https://images.drshw.tech/images/notes/image-20221103225040343.png" alt="image-20221103225040343" style="zoom:33%;" />

团队名称随意：

<img src="https://images.drshw.tech/images/notes/image-20221103224709607.png" alt="image-20221103224709607" style="zoom: 33%;" />

然后在团队中创建项目，点击新建项目：

<img src="https://images.drshw.tech/images/notes/image-20221103225329236.png" alt="image-20221103225329236" style="zoom:33%;" />

填写项目名称等信息：

<img src="https://images.drshw.tech/images/notes/image-20221103225418634.png" alt="image-20221103225418634" style="zoom:33%;" />

点击进入项目，即可在项目中请求接口并使用：

<img src="https://images.drshw.tech/images/notes/image-20221103225615258.png" alt="image-20221103225615258" style="zoom:33%;" />

官方教程：[教程地址](https://www.bilibili.com/video/BV1ae4y1y7bf/?spm_id_from=333.337.search-card.all.click&vd_source=d44ff75405f848c5cef48f6223bdf721)。

## HttpRequest 对象

我们在[Python网络编程]()中，已经了解了一般利用HTTP协议向服务器传参的四种途径：

1. 提取URL的特定部分，如`/weather/beijing/2018`，可以在服务器端的路由中用正则表达式截取；
2. 查询字符串（query string），形如`https://xxx/xxx?...key1=value1&key2=value2`；
3. 请求体（body）中发送的数据，比如表单数据、json、xml；
4. 在HTTP报文的头（Header）中。

下面讲解Django如何解析上面四种方式传递的参数。

### URL 路径参数与转换器

例如，本地通过URL`http://127.0.0.1:8000/book/category/name/`访问资源（应用的根路由为`/book`），其中`catagory`与`name`可变，需要获取`category`和`name`参数的值。

可以在子应用`urls.py`中使用`<变量名>`的形式（正则表达式写法）接收，即在`urlpatterns`中添加元素：

```python
path('<cat_id>/<goods_id>/', query_book)
```

<img src="https://images.drshw.tech/images/notes/image-20221102223745060.png" alt="image-20221102223745060" style="zoom:40%;" />

则该资源对应的视图函数定义如下（传参的**顺序不能出错**，且**参数名必须与URLConf中定义的一致**）：

```python
from django.http import JsonResponse

def query_book(request, catagory_id, name_id):
    return JsonResponse({'category_id':cat_id,'name_id':name_id})	# JsonResponse 用于返回一段json数据
```

<img src="https://images.drshw.tech/images/notes/image-20221102224242986.png" alt="image-20221102224242986" style="zoom:40%;" />

启动服务后，访问对应的URL，即可看到返回的`json`中我们需要的参数：

<img src="https://images.drshw.tech/images/notes/image-20221102224547383.png" alt="image-20221102224547383" style="zoom:40%;" />

若要限定传参的类型，可以通过**转换器（Converter）**，即`<转换器类型:变量名>`的形式实现，系统为我们提供了一些路由转换器，位于`django.urls.converters.py`：

```py
DEFAULT_CONVERTERS = {
    'int': IntConverter(),		# 匹配正整数，包含0
    'path': PathConverter(),	# 匹配任何非空字符串，包含了路径分隔符
    'slug': SlugConverter(),	# 匹配字母、数字以及横杠、下划线组成的字符串
    'str': StringConverter(),	# 匹配除了路径分隔符（/）之外的非空字符串，这是默认的形式
    'uuid': UUIDConverter(),	# 匹配格式化的uuid，如 075194d3-6885-417e-a8a8-6c931e272f00
}
```

例如：将子路由配置改为：

```python
path('<int:cat_id>/<int:goods_id>/', query_book)
```

<img src="https://images.drshw.tech/images/notes/image-20221102225105955.png" alt="image-20221102225105955" style="zoom:40%;" />

则传入的值必须为整数，否则将匹配失败：

<img src="https://images.drshw.tech/images/notes/image-20221102225042872.png" alt="image-20221102225042872" style="zoom:40%;" />

Django也支持自定义转换器，我们在[后面的小节](https://docs.drshw.tech/sf/1/4/#%E8%87%AA%E5%AE%9A%E4%B9%89%E8%BD%AC%E6%8D%A2%E5%99%A8)讲解。

### 查询字符串 Query String

例如，本地通过URL`http://127.0.0.1:8000/book/query/?cat_id=1&name_id=1`访问资源（应用的根路由为`/book`），需要获取查询字符串中`cat_id`和`name_id`参数的值。

先在子应用`urls.py`的`urlpatterns`中添加规则：

```python
path('query', query_book)
```

<img src="https://images.drshw.tech/images/notes/image-20221102231530229.png" alt="image-20221102231530229" style="zoom:40%;" />

通过视图中默认参数`request.请求方法`获取所有Query String中携带的参数（请求方法需要大写），返回一个`QueryDict`对象，它是一个特殊的“字典”，示例：

```python
def query_book(request):
    qobj = request.GET
    return HttpResponse('Success')
```

<img src="https://images.drshw.tech/images/notes/image-20221102233632973.png" style="zoom:40%;" />

访问URL时，会打印查询结果：

<img src="https://images.drshw.tech/images/notes/image-20221102233836436.png" style="zoom:40%;" />

#### QueryDict 对象及其操作

若想获取`QueryDict`对象`qobj`中某一字段的值，可通过以下方法获取：

1. 使用`qobj.get()`方法获取，传入字段名称字符串即可，注意点：
   + 如果一个字段同时拥有多个值，将获取**最后一个**值；
   + 如果字段不存在则返回`None`值，可以设置默认值进行后续处理，即`get('字段名', 默认值)`。

2. 使用索引形式`qobj['字段名']`获取数据：
   + 如果一个字段同时拥有多个值，将获取**最后一个**值；
   + 若字段不存在，则报错。
3. 使用`qobj.getlist()`方法获取，传入字段名称字符串：
   + 值以列表形式返回，可以获取指定字段的所有值；
   + 如果字段不存在则返回空列表[]，可以设置默认值进行后续处理，即`getlist('字段名', 默认值)`。

修改视图函数以便于测试：

```python
def query_book(request):
    qobj = request.GET
    print(1, qobj)
    print(2, qobj.get('cat_id'))    # 通过get方法获取cat_id的值
    print(3, qobj.get('sort_by'))    # 同一字段有多个值，获取最后一个
    print(4, qobj.get('comment', 'default'))    # 不存在时返回默认值，不设置默认值时返回None
    print(5, qobj['sort_by'])    # 通过索引获取cat_id的值
    # print(6, qobj['comment'])    # 不存在时报错
    print(7, qobj.getlist('sort_by'))    # 获取sort_by字段的所有值，以列表返回
    return HttpResponse('Success')
```

访问URL：`http://127.0.0.1:8000/book/query/?cat_id=1&name_id=1&sort_by=read_num&sort_by=comment_num`，打印结果：

<img src="https://images.drshw.tech/images/notes/image-20221102235509855.png" alt="image-20221102235509855" style="zoom:40%;" />

**查询字符串不区分请求方式，即假使客户端进行`POST`方式的请求，依然可以通过`request.GET`获取请求中的查询字符串数据。**

### 请求体传参

请求体数据格式不固定，可以是表单类型字符串，可以是JSON字符串，可以是XML字符串，应区别对待。

可以发送请求体数据的请求方式有`POST`、`PUT`、`PATCH`、`DELETE`。

**Django默认开启了CSRF防护**，会对上述请求方式进行CSRF防护验证，若验证失败将返回`403 Forbidden`异常：

<img src="https://images.drshw.tech/images/notes/image-20221104202711031.png" alt="image-20221104202711031" style="zoom:33%;" />

在测试时可以关闭CSRF防护机制，方法为在`settings.py`中的`MIDDLEWARE`字段处注释掉CSRF中间件（也可以进行CSRF认证，详见番外篇[通过CSRF中间件验证](https://docs.drshw.tech/sf/extra_2/)）：

<img src="https://images.drshw.tech/images/notes/image-20221103230947078.png" alt="image-20221103230947078" style="zoom:33%;" />

例如，在注册用户的场景中，若需要对URL`http://127.0.0.1:8000/book/register/`发起`POST`请求（应用的根路由为`/book`），请求体中包含字段`username`和`password`，需要接收请求体中的数据。

先在子应用`urls.py`的`urlpatterns`中添加规则：

```python
path('register/', register)
```

<img src="https://images.drshw.tech/images/notes/image-20221103232205100.png" alt="image-20221103232205100" style="zoom:33%;" />

#### 表单类型（form-data）

若请求体中的数据为表单类型，可通过`request.POST`获取参数，返回一个`QueryDict`对象，视图定义示例：

```python
# 通过表单提交数据
def register(request):
    qobj = request.POST
    print(1, qobj)
    print(2, qobj.get('username'))
    print(3, qobj.get('password'))
    return HttpResponse('Success')
```

设计请求数据，注意POST请求，且请求数据是请求体（`Body`）中的`form-data`类型：

<img src="https://images.drshw.tech/images/notes/image-20221104203016053.png" alt="image-20221104203016053" style="zoom: 25%;" />

核对请求地址信息，启动服务后点击发送进行测试：

<img src="https://images.drshw.tech/images/notes/image-20221104203041132.png" alt="image-20221104203041132" style="zoom: 25%;" />

请求成功，且打印数据：

<img src="https://images.drshw.tech/images/notes/image-20221104201348263.png" alt="image-20221104201348263" style="zoom:33%;" />

<img src="https://images.drshw.tech/images/notes/image-20221104203136652.png" alt="image-20221104203136652" style="zoom:40%;" />

#### 非表单类型 non-form-data

非表单类型的请求体数据，Django无法自动解析，可以通过`request.body`属性获取最原始的请求体数据，自己按照请求体格式（JSON、XML等）进行解析。`request.body`**返回`bytes`类型**。

例如要获取的数据为`json`形式，即：

```json
{
	"username": "DrSHW",
    "password": "123456"
}
```

视图定义示例：

```python
# views.py
import json
...

def register(request):
    json_str = request.body
    # json_str = json_str.decode()	# python3.6 以下需要执行此步骤
    req_data = json.loads(json_str)
    print(req_data['username'])
    print(req_data['password'])
    return HttpResponse('Success')
```

测试：

<img src="https://images.drshw.tech/images/notes/image-20221104212706811.png" alt="image-20221104212706811" style="zoom:33%;" />

发送请求后成功打印了数据：

<img src="https://images.drshw.tech/images/notes/image-20221104212750612.png" alt="image-20221104212750612" style="zoom:40%;" />

### 请求头传参

可以通过`request.META`属性获取请求头`Headers`中的数据，`request.META`为**字典**类型，[常见的请求头类型](https://docs.drshw.tech/pw/spider/03/#%E8%AF%B7%E6%B1%82%E5%A4%B4)。

若是在请求头中自定义参数字段，获取时需要大写，且需要加上`HTTP_`前缀。

若在请求头中加入`sign`字段，想要获取`sign`的值，定义路由和视图如下：

```python
# urls.py
...

urlpatterns = [
    ...
    path('getsign/', get_sign),
]
```

```python
# views.py
...

def get_sign(request):
	print(request.META['HTTP_SIGN'])	# 大写，加前缀
	return HttpResponse('Success')
```

测试：

<img src="https://images.drshw.tech/images/notes/image-20221104215228683.png" alt="image-20221104215228683" style="zoom:33%;" />

发送请求后成功打印了数据：

<img src="https://images.drshw.tech/images/notes/image-20221104215257670.png" alt="image-20221104215257670" style="zoom:40%;" />

### 自定义转换器

我们已经了解了Django内置转换器的用法。若要在`path()`中传入一些更加复杂的匹配规则（如电话号码等），需要**自定义转换器**，其中包括自定义的[**正则**](https://docs.drshw.tech/pw/spider/05/#%E6%AD%A3%E5%88%99)匹配规则。

在任意可以被导入的Python文件中，都可以定义路由转换器，它以类的形式被定义，由三个模块组成：

1. 定义`regex`字符串，表示正则匹配规则；
2. 定义`to_python()`方法，将匹配结果传递到**视图内部**时使用，传入URL中源数据，返回经过处理后的数据；
3. 定义`to_url()`方法，将匹配结果用于**反向解析传值**时使用，即通过`IP`解析到域名时的匹配规则，暂时用不到。

后两个方法可省略，即不对数据进行处理，直接传入。

例如，要定义一个匹配`+86`手机号码的转换器，先新建`Converters/mobile_phone+86.py`文件：

<img src="https://images.drshw.tech/images/notes/image-20221104225806641.png" alt="image-20221104225806641" style="zoom:40%;" />

定义转换器：

```python
# mobile_phone.py
class MobileConverter:
    # 匹配手机号码的正则
    regex = '1[3-9]\d{9}'

    def to_python(self, value):
        # 将匹配结果传递到视图内部时使用
        return int(value)

    def to_url(self, value):
        # 将匹配结果用于反向解析传值时使用
        return str(value)
```

定义后，在需要用到该解析器的路由配置文件`urls.py`中进行注册，通过`django.urls`中的`register_converter`函数注册，传入自定义解析器类和别名；并使用解析器创建一个新的路由进行测试：

```python
# book/urls.py
from django.urls import register_converter
from .Converters.mobile_phone import MobileConverter
# 注册自定义路由转换器
# register_converter(自定义路由转换器, '别名')
register_converter(MobileConverter, 'mobile')

urlpatterns = [
    ...
    path('<mobile:phone>/', get_phone)
]
```

视图定义如下：

```python
# book/views.py
...

def get_phone(request, phone):
	print(phone)
	return HttpResponse('Success')
```

访问路由`http://127.0.0.1:8000/book/15114514020/`测试，访问成功：

<img src="https://images.drshw.tech/images/notes/image-20221104230758722.png" alt="image-20221104230758722" style="zoom:40%;" />

注：匹配复杂规则也可以通过[`re_path()`方法](https://docs.drshw.tech/sf/1/2/#re_path-%E6%96%B9%E6%B3%95)进行。

### 其他常用HttpRequest对象属性

`HttpRequest`对象中还包含如下属性：

- `method`：一个字符串，表示请求使用的**HTTP方法**，常用值包括：`GET`、`POST`；
- `user`：请求的**用户对象**；
- `path`：一个字符串，表示请求的页面的**完整路径**，不包含域名和参数部分；
- `encoding`：一个字符串，表示提交的数据的**编码方式**；
  - 如果为`None`则表示使用浏览器的默认设置，一般为UTF-8；
  - 这个属性是可写的，可以通过修改它来修改访问表单数据使用的编码，接下来对属性的任何访问将使用新的Encoding值；
- `FILES`：一个类似于字典的对象，包含所有的**上传文件**。

## HttpResponse对象

视图在接收请求并处理后，必须返回`HttpResponse`对象或子对象。`HttpRequest`对象由Django创建，`HttpResponse`对象由开发人员创建。

### HttpResponse

可以使用`django.http.HttpResponse`函数来构造响应对象，已经使用过很多次了，可以接收下面这些形参：

`HttpResponse(content=响应体, content_type=响应体数据类型, status=状态码)`。

- `content`：表示返回的内容；

- `content_type`：响应体数据类型，例如表单、`json`；

- `status`：返回的HTTP响应状态码，不能超过599：

  <img src="https://images.drshw.tech/images/notes/image-20221104234345666.png" alt="image-20221104234345666" style="zoom:40%;" />

响应头可以直接将`HttpResponse`对象当做字典进行**响应头键值对**的设置：

```python
response = HttpResponse()
response['sign'] = '123456'	# 自定义响应头sign, 值为123456
```

示例：

```py
from django.http import HttpResponse

def response(request):
	response = HttpResponse('Success')
	response.status_code = 400
	response['sign'] = '123456'
	return response
	# 或者
	# return HttpResponse('Success', status=400)
```

访问`http://127.0.0.1:8000/book/response/`进行测试（路由配置：`path('response/', response)`）：

<img src="https://images.drshw.tech/images/notes/image-20221104234649843.png" alt="image-20221104234649843" style="zoom:40%;" />

### HttpResponse子类

#### 状态码子类

Django提供了一系列`HttpResponse`的子类，可以**快速设置状态码**：

- `HttpResponseRedirect`对应状态码`301`；
- `HttpResponsePermanentRedirect`对应状态码`302`；
- `HttpResponseNotModified`对应状态码`304`；
- `HttpResponseBadRequest`对应状态码`400`；
- `HttpResponseNotFound`对应状态码`404`；
- `HttpResponseForbidden`对应状态码`403`；
- `HttpResponseNotAllowed`对应状态码`405`；
- `HttpResponseGone`对应状态码`410`；
- `HttpResponseServerError`对应状态码`500`。

#### JsonResponse

`JsonResponse`也是`HttpResponse`的子类之一，在**前后端分离**架构模式下使用非常广泛，它可以：

- 返回一条数据，并帮助我们将数据转换为`json`字符串；
- 设置响应头`Content-Type`为`application/json`；

可以接收下面这些形参：

+ `data`：即需要返回的数据，以字典形式传入；
+ `encoder`：解析器，一般不传；
+ `safe`：一个布尔值，默认为`True`，若传入`False`，则支持`data`传入一个字典列表。

示例：

```py
def get_json(request):
	info1 = {
		'title': '红楼梦',
		'author': '曹雪芹',
	}
	info2 = {
		'title': '三国演义',
		'author': '罗贯中',
	}
	# return JsonResponse(info1)
	return JsonResponse([info1, info2], safe=False)
```

访问`http://127.0.0.1:8000/book/getjson/`进行测试（路由配置：`path('getjson/', get_json)`）：

<img src="https://images.drshw.tech/images/notes/image-20221105170151726.png" alt="image-20221105170151726" style="zoom:40%;" />

#### redirect 重定向函数

重定向（Redirect），即通过各种方法，将各种网络请求重新定个方向，转到其它位置。简单点说就是访问一个URL时，设置跳转至另一个URL的位置的过程。

可通过`django.shortcuts`中的`redirect`函数实现，需要传入重定向的路由字符串，它会返回一个`HttpResponsePermanentRedirect`或`HttpResponseRedirect`对象——它们都是`HttpResponse`的子类对象。

若要实现登陆成功（`/login`）跳转到首页（`/index`），则跳转的逻辑可以这样实现：

定义视图：

```python
# views.py
...
from django.shortcuts import redirect

def login(request):
	return redirect('index/')	# 传入当前路由或完整路由均可
```

配置路由测试会发现跳转成功，这里就不演示了。

## 状态保持

我们在网络编程一章中详细介绍过[状态保持](https://docs.drshw.tech/pw/spider/03/#%E7%8A%B6%E6%80%81%E4%BF%9D%E6%8C%81)的概念，总结一下就是：

- 浏览器请求服务器是**无状态**的。
- **无状态**：指一次用户请求时，浏览器、服务器无法知道之前这个用户做过什么，每次请求都是一次新的请求。
- **无状态原因**：浏览器与服务器是使用Socket套接字进行通信的，服务器将请求结果返回给浏览器之后，会关闭当前的Socket连接，而且服务器也会在处理页面完毕之后销毁页面对象。
- 有时需要保持下来用户浏览的状态，比如用户是否登录过，浏览过哪些商品等
- 实现状态保持主要有两种方式：
  - 在客户端存储信息使用`Cookie`；
  - 在服务器端存储信息使用`Session`。

### Cookie

[Cookie介绍](https://docs.drshw.tech/pw/spider/03/#cookie)，用的不多。

#### 设置Cookie

可以通过`HttpResponse`对象中的`set_cookie`方法来设置Cookie，依次传入：

+ `key`：键名字符串；
+ `value`：键对应的值，默认为空字符串；
+ `max_age`：Cookie有效期，传入一个整型变量代表秒数，，默认为`None`，即临时Cookie（Django中默认到期时间是浏览器会话结束时）。

示例，定义视图：

```py
# views.py
...

def set_cookie(request):
	response = HttpResponse('Success')
	response.set_cookie('username', 'admin')
	response.set_cookie('password', '123456', max_age=3600)
	return response
```

访问`http://127.0.0.1:8000/book/setcookie/`进行测试（路由配置：`path('setcookie/', set_cookie)`）：

<img src="https://images.drshw.tech/images/notes/image-20221105233307579.png" alt="image-20221105233307579" style="zoom:33%;" />

可见Cookie设置成功。

#### 读取Cookie

可以通过`HttpRequest`对象的`COOKIES`属性来读取本次请求携带的Cookie值，为**字典**类型。

若要获取刚刚定义的Cookie，视图应当定义如下：

```python
# views.py
...

def get_cookie(request):
	cookies = request.COOKIES
	print(cookies)
	print(cookies.get('username'))
	return HttpResponse('Success')
```

访问`http://127.0.0.1:8000/book/getcookie/`进行测试（路由配置：`path('getcookie/', get_cookie)`）：

<img src="https://images.drshw.tech/images/notes/image-20221105233833246.png" alt="image-20221105233833246" style="zoom:40%;" />

#### 删除Cookie

可以通过`HttpResponse`对象中的`delete_cookie`方法来删除Cookie项。

示例，定义视图：

```python
# views.py
...

def del_cookie(request):
	response = HttpResponse('Success')
	response.delete_cookie('username')
	return response
```

配置路由测试会发现Cookie中的`username`字段被删除，这里就不演示了。

### Session

[Session介绍](https://docs.drshw.tech/pw/spider/03/#session-%E4%BC%9A%E8%AF%9D)。

#### 启用Session

Django项目默认启用Session服务中间件，可在`settings.py`中的`MIDDLEWARE`字段中查看：

<img src="https://images.drshw.tech/images/notes/image-20221105234432717.png" alt="image-20221105234432717" style="zoom:40%;" />

如需禁用Session，将上图中的Session中间件注释掉即可。

#### 存储方式配置

在`settings.py`中，可以设置Session数据的存储方式，可以保存在数据库、本地缓存等载体中。

##### 数据库存储

Django会默认将数据存储在数据库中，存储位置由`settings.py`中的`SESSION_ENGINE`字段决定，默认为：

```python
SESSION_ENGINE = 'django.contrib.sessions.backends.db'	# 该字段在settings.py中未定义
```

如果存储在数据库中，需要在`INSTALLED_APPS`字段中加入Session应用：

<img src="https://images.drshw.tech/images/notes/image-20221105234948387.png" alt="image-20221105234948387" style="zoom:40%;" />

也可以在数据库中查询到该表中的字段信息：

<img src="https://images.drshw.tech/images/notes/image-20221105235338414.png" alt="image-20221105235338414" style="zoom:40%;" /><img src="https://images.drshw.tech/images/notes/image-20221105235240408.png" alt="image-20221105235240408" style="zoom:40%;" />

由表结构可知，操作Session包括三个数据：键`session_key`，值`session_data`，过期时间`expire_time`。

##### 本地缓存

存储在本机内存中，如果**丢失则不能找回**，比数据库的方式读写更快，配置字段：

```py
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
```

##### 混合存储

优先从本机内存中存取，如果没有则从数据库中存取，配置字段：

```py
SESSION_ENGINE='django.contrib.sessions.backends.cached_db'
```

##### Redis 存储

[`Redis`使用教程](https://docs.drshw.tech/pw/extra_2/)。

出于Redis的数据过期机制和强大的读取性能，一般选择将Session存储于Redis数据库中。

需要一个`redis`数据库引擎，可引入第三方模块`django-redis`来解决：

```bash
pip install django-redis
```

在`settings.py`中做如下设置：

```py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',	# 这里需要配置数据库地址，数据库块号
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

若Redis服务需要密码，可在`OPTIONS`中加入`PASSWORD`字段（键值对），值即为对应的密码。

注意：

如果Redis的IP地址不是本地回环`127.0.0.1`，而是其他地址，访问Django时，可能出现Redis连接错误，如下：

<img src="https://images.drshw.tech/images/notes/redis_error.png" alt="img" style="zoom:80%;" />

解决方法：

修改Redis的配置文件，添加特定IP地址。

打开Redis的配置文件：

```bash
sudo vim /etc/redis/redis.conf
```

在如下配置项进行修改（如要添加`10.211.55.5`地址）：

<img src="https://images.drshw.tech/images/notes/redis_bind.png" alt="img" style="zoom:67%;" />

重新启动Redis服务：

```bash
sudo service redis-server restart
```

#### Session 操作

`HttpRequest`对象的`session`属性是一个字典，可以通过它进行会话的读写操作：

1. 以键值对的格式写Session：

   ```python
   request.session['键'] = 值
   ```

2. 根据键读取值：

   ```python
   request.session.get('键', 默认值)
   ```

3. 清除所有Session，在存储中删除值部分：

   ```python
   request.session.clear()
   ```

4. 清除Session数据，在存储中删除Session的整条数据：

   ```python
   request.session.flush()
   ```

5. 删除session中的指定键及值，在存储中只删除某个键及对应的值：

   ```python
   del request.session['键']
   ```

6. 设置Session的有效期：

   ```python
   request.session.set_expiry(value)
   ```

注意：

- 如果`value`是一个整数，Session将在`value`秒没有活动后过期；
- 如果`value`为`0`，那么用户Session的Cookie将在用户的浏览器关闭时过期；
- 如果`value`为`None`，那么Session有效期将采用系统默认值， **默认为两周**，可以通过在`settings.py`中设置`SESSION_COOKIE_AGE`字段来设置全局默认值。

## 类视图

以函数的方式定义的视图称为**函数视图**，函数视图便于理解。但是遇到一个视图对应的路径提供了多种不同HTTP请求方式的支持时，便需要在一个函数中编写不同的业务逻辑，代码可读性与复用性都不佳。

例如需要编写一个用于注册的视图：

<img src="https://images.drshw.tech/images/notes/image-20221107210244910.png" alt="image-20221107210244910" style="zoom:90%;" />

使用函数视图会这样写：

```python
def register(request):
    """处理注册"""

    # 获取请求方法，判断是GET/POST请求
    if request.method == 'GET':
        # 处理GET请求，返回注册页面
        return render(request, 'index.html')
    else:
        # 处理POST请求，实现注册逻辑
        return HttpResponse('这里实现注册逻辑')
```

对于需要处理多种逻辑的视图，我们可以使用**类视图**实现。

### 类视图的使用

类视图，顾名思义，即使用类定义一个视图。

定义类视图需要继承自Django提供的父类`View`，可使用`from django.views.generic import View`或者`from django.views.generic.base import View`导入。

使用类视图可以将视图对应的不同请求方式以类中的不同方法来区别定义，方法名必须为**小写**的请求方法（如`get`、`post`等），其余格式与视图函数格式一致，示例：

```python
from django.views.generic import View	# 导入基类

class cls_view(View):	# 需要继承View
	def method1(self, request):
        ''' 定义请求方法1的处理逻辑 '''
        pass
       
	def method2(self, request):
        ''' 定义请求方法2的处理逻辑 '''
        pass
    
    ...
```

上方用函数视图写的注册逻辑，用类视图可改写为：

```python
from django.views.generic import View

class RegisterView(View):
    """类视图：处理注册"""

    def get(self, request):
        """处理GET请求，返回注册页面"""
        return render(request, 'index.html')

    def post(self, request):
        """处理POST请求，实现注册逻辑"""
        return HttpResponse('这里实现注册逻辑')
```

类视图的好处：

- 代码**可读性强**；
- 类视图相对于函数视图**复用性更高** ：如果其他地方需要用到某个类视图的某个特定逻辑，直接**继承**该类视图即可。

配置路由时，使用类视图的**`as_view()`**方法来添加：

```py
urlpatterns = [
    # 视图函数：注册
    # path('register/', views.register),
    # 类视图：注册
    path('register/', views.RegisterView.as_view()),
]
```

### 类视图的处理逻辑

类视图中`as_view()`方法的处理过程：

找到`as_view()`源码（不同版本的Django会有些许出入），如下：

```python
@classonlymethod
def as_view(cls, **initkwargs):
    """Main entry point for a request-response process."""
    for key in initkwargs:
        if key in cls.http_method_names:
            raise TypeError(
                "The method name %s is not accepted as a keyword argument "
                "to %s()." % (key, cls.__name__)
            )
        if not hasattr(cls, key):
            raise TypeError(
                "%s() received an invalid keyword %r. as_view "
                "only accepts arguments that are already "
                "attributes of the class." % (cls.__name__, key)
            )

    def view(request, *args, **kwargs):
        self = cls(**initkwargs)	# 初始化一个本类对象
        '''
        setup方法：
        	若该类中实现了get方法而未实现head方法，用定义的get方法覆盖head方法；
        	并将本类参数赋值给新的对象。
        '''
        self.setup(request, *args, **kwargs)	
        # 检查方法是否都有request形参，否则抛出异常
        if not hasattr(self, "request"):
            raise AttributeError(
                "%s instance has no 'request' attribute. Did you override "
                "setup() and forget to call super()?" % cls.__name__
            )
        return self.dispatch(request, *args, **kwargs)

    view.view_class = cls
    view.view_initkwargs = initkwargs

    # __name__ and __qualname__ are intentionally left unchanged as
    # view_class should be used to robustly determine the name of the view
    # instead.
    view.__doc__ = cls.__doc__
    view.__module__ = cls.__module__
    view.__annotations__ = cls.dispatch.__annotations__
    # Copy possible attributes set by decorators, e.g. @csrf_exempt, from
    # the dispatch method.
    view.__dict__.update(cls.dispatch.__dict__)

    # Mark the callback if the view class is async.
    if cls.view_is_async:
        view._is_coroutine = asyncio.coroutines._is_coroutine

    return view
```

类`View`中的`as_view`方法被`classonlymethod`装饰器修饰：

<img src="https://images.drshw.tech/images/notes/image-20221107223146466.png" alt="image-20221107223146466" style="zoom:40%;" />

该装饰器的作用类似于[类装饰器`classmethod`](https://docs.drshw.tech/pb/senior/1/#%E7%BB%91%E5%AE%9A%E7%B1%BB%E6%96%B9%E6%B3%95)，即可以被类和对象调用的方法；而被`classonlymethod`装饰器修饰的方法，只允许类调用，而不允许对象调用。传入的`cls`形参即为调用`as_view`方法的类。

`as_view`方法中嵌套了函数`view`，且返回了`view`函数，其中：

1. 初始化了一个本类对象；

2. 若该类中实现了`get`方法而未实现`head`方法，用定义的`get`方法覆盖`head`方法；并将本类参数赋值给新的对象，即`self.setup()`执行的功能：

   <img src="https://images.drshw.tech/images/notes/image-20221107225132670.png" alt="image-20221107225132670" style="zoom:40%;" />

3. 检查方法是否都有`request`形参，否则抛出异常；

4. 执行`self.dispatch`方法：

   ```python
   http_method_names = [
       "get",
       "post",
       "put",
       "patch",
       "delete",
       "head",
       "options",
       "trace",
   ]
   
   ...
   
   def dispatch(self, request, *args, **kwargs):
       # Try to dispatch to the right method; if a method doesn't exist,
       # defer to the error handler. Also defer to the error handler if the
       # request method isn't on the approved list.
       if request.method.lower() in self.http_method_names:	# 判断浏览器发送的请求是否合法
           handler = getattr(
               self, request.method.lower(), self.http_method_not_allowed
           )
       else:
           handler = self.http_method_not_allowed
       return handler(request, *args, **kwargs)
   ```

   在该方法中：

   + 将所有浏览器请求类型名称变为视作小写；

   + 判断浏览器发来的请求类型是否合法，若不合法即抛出`405`状态异常相应：

     <img src="https://images.drshw.tech/images/notes/image-20221107230629622.png" alt="image-20221107230629622" style="zoom:40%;" />

   + 若浏览器发来的请求类型合法，但是在类方法中未找到以该请求类型为名称（且小写）的方法，也抛出`405`状态异常响应；

   + 若浏览器发来的请求类型合法，且在类中存在对应方法，则执行对应方法。

类视图的整体处理过程如下图：

<img src="https://images.drshw.tech/images/notes/%E8%B7%AF%E7%94%B1%E5%8C%B9%E9%85%8D%E7%B1%BB%E8%A7%86%E5%9B%BE%E9%80%BB%E8%BE%91.png" alt="img" style="zoom:70%;" />

### 类视图的多继承重写

若有这样一个场景：

+ 访问一个页面时，若用户已经登陆，则可以直接进入页面；否则渲染用户登陆页面。

若使用类视图，可以这样写：

```python
class showIndex(View):
    def __init__(self):
        self.islogin = False
        
    def get(self, request):
        if self.islogin:
            return HttpResponse("请先登录账号")
        # 处理逻辑...
        return HttpResponse("get请求：该页面必须为登陆状态")
        
    def post(self, request):
        if self.islogin:
            return HttpResponse("请先登录账号")
        # 处理逻辑...
        return HttpResponse("post请求：该页面必须为登陆状态")
```

在每次请求时，我们都定义了一遍登陆状态的判断逻辑，这是极为冗余的。使用多继承重写可解决代码的冗余问题。

这里我们使用Django支持的原生用户系统，演示类视图的多继承重写。

首先需要导入`django.contrib.auth.mixins`中的`LoginRequiredMixin`类，再用自定义的类视图继承之（`LoginRequiredMixin`需要写在`View`前面）：

```python
class orderView(LoginRequiredMixin, View):
    ''' LoginRequiredMixin 中实现了判断用户是否登录的逻辑，如果未登录则跳转到登录页面 '''
    def get(self, request):
        """处理GET请求，返回注册页面"""
        return render(request, 'book/index.html')

    def post(self, request):
        """处理POST请求，进行注册处理"""
        return HttpResponse('Success')
```

配置URLConf（`path('/mixin'), orderView.as_view()`），并访问URL：`http://127.0.0.1:8000/book/mixin/`：

+ 在未登陆`admin`的情况下，将重定向到默认路由`accounts/login/`（重定向路由可自定义）；

  <img src="https://images.drshw.tech/images/notes/image-20221107234412489.png" alt="image-20221107234412489" style="zoom:80%;" />

+ 登陆`admin`的情况下，则进入`get`请求对应的逻辑；

即实现了“判断用户状态进行跳转”的功能；那么，`LoginRequiredMixin`类到底做了哪些事情呢，我们来看它的源码：

```python
class LoginRequiredMixin(AccessMixin):
    """Verify that the current user is authenticated."""

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)
```

其中定义了`dispatch`方法，即通过`request.user.is_authenticated`返回浏览器当前的用户是否有admin权限，若无权限则执行跳转逻辑。由于需要调用`as_view`方法，`as_view`方法又需要调用`dispatch`，所以该`dispatch`方法是**默认调用执行**的，即在执行视图逻辑之前先进行判断。

而`View`中也含有`dispatch`方法——由于[Python多继承的`MRO`规则](https://docs.drshw.tech/pb/senior/2/#%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%B1%9E%E6%80%A7%E6%9F%A5%E6%89%BE%E9%A1%BA%E5%BA%8F)，若将继承列表的`View`写在`LoginRequiredMixin`之前，此时`View`中的`dispatch`方法将覆盖`LoginRequiredMixin`中的方法，使其失效。这就是为什么在继承列表中，`LoginRequiredMixin`需要定义在`View`前面。

## 中间件

Django中的中间件是一个轻量级、底层的**插件系统**，可以介入Django的请求和响应处理过程，修改Django的输入或输出。中间件的设计为开发者提供了一种无侵入式的开发方式，增强了Django框架的健壮性。

中间件一般以**类**的形式被定义。我们可以使用中间件，在Django处理视图的不同阶段对输入或输出进行干预，例如提前判断用户登陆状态等场景。

Django中间件文档：[地址](https://docs.djangoproject.com/en/1.11/topics/http/middleware/)。

### 中间件的方法与执行时机

Django在中间件中预置了六个方法，这六个方法会**在不同的阶段自动执行**，对输入或输出进行干预：

1. **初始化方法**：

   ```python
   def __init__(self, get_response=None):
   	pass
   ```

   该方法在启动Django程序，初始化中间件时，自动调用一次，用于确定是否启用当前中间件；



2. **处理请求前的方法**：在处理每个请求前，自动调用，返回`None`或`HttpResponse`对象：

   ```python
   def process_request(self, request):
   	pass
   ```

   在处理每个请求前，自动调用，返回`None`或`HttpResponse`对象；



3. 处理视图前的方法：

   ```python
   def process_view(self, request, view_func, view_args, view_kwargs):
     pass
   ```

   在处理每个视图前，自动调用，返回`None`或`HttpResponse`对象；

   

4. 处理模板响应前的方法：

   ```python
   def process_template_response(self, request, response):
     pass
   ```

   在处理每个模板响应前，自动调用，返回实现了`render`方法的响应对象；



5. **处理响应后的方法**：

   ```python
   def process_response(self, request, response):
     pass
   ```

   在每个响应返回给客户端之前，自动调用，返回`HttpResponse`对象；



6. 异常处理：

   ```python
   def process_exception(self, request,exception):
     pass
   ```

   当视图抛出异常时，自动调用，返回一个`HttpResponse`对象。



自定义中间件即手动实现上面的六种方法（用不到则无需实现），需要继承`django.utils.deprecation`中的中间件父类`MiddlewareMixin`，示例（若中间件编写在`book/my_middleware.py`中）：

```py
# my_middleware.py
# 导入中间件的父类
from django.utils.deprecation import MiddlewareMixin


class TestMiddleware(MiddlewareMixin):
    """自定义中间件"""
    def process_request(self, request):
        """处理请求前自动调用"""
        print('process_request1 被调用')

    def process_view(self, request, view_func, view_args, view_kwargs):
        # 处理视图前自动调用
        print('process_view1 被调用')

    def process_response(self, request, response):
        """在每个响应返回给客户端之前自动调用"""
        print('process_response1 被调用')
        return response
```

定义好中间件后，需要在`settings.py`的`MIDDLEWARE`中添加注册中间件：

```py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'book.my_middleware.TestMiddleware',  # 添加中间件
]
```

定义一个视图进行测试：

```py
# views.py
def middleware(request):
    print('view 视图被调用')
    return HttpResponse('OK')
```

配置路由：`path('middleware/', middleware)`，并访问`http://127.0.0.1:8000/book/middleware/`，控制台打印信息如下：

<img src="https://images.drshw.tech/images/notes/image-20221108200331300.png" alt="image-20221108200331300" style="zoom:45%;" />

### 多个中间件的执行顺序

`settings.py`的`MIDDLEWARE`列表中：

- 在请求视图被处理**前**，中间件**由上至下**依次执行；
- 在请求视图被处理**后**，中间件**由下至上**依次执行：

<img src="https://images.drshw.tech/images/notes/image-20221108201718751.png" alt="image-20221108201718751" style="zoom:100%;" />

示例，定义两个中间件：

```python
# my_middleware.py
from django.utils.deprecation import MiddlewareMixin

...

class TestMiddleware1(MiddlewareMixin):
    """自定义中间件"""
    def process_request(self, request):
        """处理请求前自动调用"""
        print('process_request1 被调用')

    def process_view(self, request, view_func, view_args, view_kwargs):
        # 处理视图前自动调用
        print('process_view1 被调用')

    def process_response(self, request, response):
        """在每个响应返回给客户端之前自动调用"""
        print('process_response1 被调用')
        return response


class TestMiddleware2(MiddlewareMixin):
    """自定义中间件"""
    def process_request(self, request):
        """处理请求前自动调用"""
        print('process_request2 被调用')

    def process_view(self, request, view_func, view_args, view_kwargs):
        # 处理视图前自动调用
        print('process_view2 被调用')

    def process_response(self, request, response):
        """在每个响应返回给客户端之前自动调用"""
        print('process_response2 被调用')
        return response
```

注册添加两个中间件：

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'book.my_middleware.TestMiddleware',
    'book.my_middleware.TestMiddleware1',  # 添加
    'book.my_middleware.TestMiddleware2',  # 添加
]
```

视图函数`middleware`和路由配置不变，访问`http://127.0.0.1:8000/book/middleware/`，控制台打印信息如下：

<img src="https://images.drshw.tech/images/notes/image-20221108202027125.png" alt="image-20221108202027125" style="zoom:100%;" />

即表明了各个中间件的执行顺序。
