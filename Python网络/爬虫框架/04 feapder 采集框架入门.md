# `feapder` 采集框架入门

## `feapder` 简介

### 概述

`feapder`是一款上手简单，功能强大的Python爬虫框架，使用方式类似`scrapy`，学过`scrapy`就很好上手了，框架内置3种爬虫：

- `AirSpider`爬虫比较轻量，学习成本低。面对一些数据量较少，无需断点续爬，无需分布式采集的需求，可采用此爬虫。
- `Spider`是一款基于redis的分布式爬虫，适用于海量数据采集，支持断点续爬、爬虫报警、数据自动入库等功能
- `BatchSpider`是一款分布式批次爬虫，对于需要周期性采集的数据，优先考虑使用本爬虫。

`feapder`文档：https://boris-code.gitee.io/feapder，本文主要使用`AirSpider`，结合案例介绍框架的基本使用。

### `feapder`架构

`feapder`的整体架构如下图：

![boris-spider -1-](http://markdown-media.oss-cn-beijing.aliyuncs.com/2020/06/08/borisspider-1.png)

模块说明：

- `spider`： **框架调度核心**；
- `parser`： **数据解析器**；
- `parser_control`： **模版控制器**，负责调度`parser`；
- `collector`： **任务收集器**，负责从任务队里中批量取任务到内存，以减少爬虫对任务队列数据库的访问频率及并发量；
- `start_request`： 初始任务下发函数；
- `item_buffer`： **数据缓冲队列**，批量将数据存储到数据库中；
- `request_buffer`： **请求任务缓冲队列**，批量将请求任务存储到任务队列中；
- `request`： **数据下载器**，封装了`requests`，用于从互联网下载数据；
- `response`： **请求响应**，封装了`response`, 支持`xpath`、`css`、`re`等解析方式，自动处理中文乱码；

流程说明：

1. `spider`调度`start_request`生产任务；
2. `start_request`下发任务到`request_buffer`中；
3. `spider`调度`request_buffer`批量将任务存储到任务队列数据库中；
4. `spider`调度`collector`从任务队列中批量获取任务到内存队列；
5. `spider`调度`parser_control`从`collector`的内存队列中获取任务；
6. `parser_control`调度`request`请求数据；
7. `request`请求与下载数据；
8. `request`将下载后的数据给`response`，进一步封装；
9. 将封装好的`response`返回给`parser_control`（图示为多个`parser_control`，表示多线程 ）；
10. `parser_control`调度对应的`parser`，解析返回的`response`（图示多组`parser`表示不同的网站解析器 ）；
11. `parser_control`将parser解析到的数据item及新产生的request分发到`item_buffer`与`request_buffer`；
12. spider调度`item_buffer`与`request_buffer`将数据批量入库；

## `feapder`基本使用

### 准备工作

安装`feapder`：

```python
pip install feapder
```

### 创建工程

可使用`feapder create`创建一个工程，具体参数：

<img src="https://images.drshw.tech/images/notes/image-20220920210306636.png" alt="image-20220920210306636" style="zoom:50%;" />

我们这里先创建一个名为`demo`的爬虫程序：

```python
feapder create -s demo
```

执行后，会生成一个`demo.py`，其中有一段测试代码（其实是之前推荐过的一个爬虫工具的广告 ）：

<img src="https://images.drshw.tech/images/notes/image-20220920210951120.png" alt="image-20220920210951120" style="zoom:40%;" />

要想启动爬虫，无需像`scrapy`那样输入指令，直接运行该`Python`脚本即可。

运行后发现它是并发运行的：

<img src="https://images.drshw.tech/images/notes/image-20220920214853036.png" alt="image-20220920214853036" style="zoom:40%;" />

默认并发数为32线程，可通过在`Demo()`构造方法中传入`thread_count`参数来编辑并发线程数，传入一个值即可：

```python
if __name__ == "__main__":
    # 并发12条执行
    Demo(thread_count=12).start()
```

### 编写爬虫

#### 请求发起

在该`demo.py`中编写爬虫即可。要想更改请求地址，可修改`Request()`构造方法的参数；

例如，请求长沙晚报网（https://www.icswb.com/channel-list-channel-161.html ），可以这样改：

```python
    def start_requests(self):
        yield feapder.Request("https://www.icswb.com/channel-list-channel-161.html")
```

其中，`Request()`函数不仅可以传入请求地址，还支持传入`callback`参数，用于指明回调函数，默认回调函数为`parse`；也可以传入自定义参数，可以存储在`Request`的对象中，在回调时可以作为参数取出（类似于`meta`参数 ）。

#### 数据提取

在`parse()`方法中可以对网站中的有用信息进行提取，例如提取看板中的标题：

![image-20220920214121934](https://images.drshw.tech/images/notes/image-20220920214121934.png)

可以直接调用`response`对象内置的`re()`、`xpath()`、`css()`方法进行数据提取，用法和返回结果与`scrapy`中的数据解析方法类型，这里以`xpath`为例：

```python
response.xpath("//title/text()").extract_first()
```

其中`extract()`和`extract_first()`方法用于将对象中的数据变为字符串提取出来，同`scrapy`框架。

#### 案例

##### 目标

提取长沙晚报网看板文章标题和文章内容；

##### 步骤

+ 先获取看板中各个预览卡牌的列表，发现列表中有标题信息和内容所在`URL`地址；
+ 将标题和`URL`解析出来，请求提取出来的`URL`，并设置回调函数，用于解析文章内容；

完整代码：

```python
import feapder

class Demo(feapder.AirSpider):
    def start_requests(self):
        yield feapder.Request("https://www.icswb.com/channel-list-channel-161.html")

    def parse(self, request, response):
        # 提取ul列表中的内容
        article_list = response.xpath('//ul[@id="NewsListContainer"]/li')
        for i in article_list[:-1]:
            # 提取标题和URL
            title = i.xpath('./h3/a/text()').extract_first()
            url = i.xpath('./h3/a/@href').extract_first()
            # 返回一个新的请求对象，回调指向parser_detail方法，存入title字段，在回调中一起处理
            yield feapder.Request('https://www.icswb.com' + url, callback=self.parser_detail, title=title)

    def parser_detail(self, request, response):
        # 用于解析文章内容的数据
        title = request.title
        content = response.re('<article class="am-article">(.*?)</article>')[0]
        print(title, content)

if __name__ == "__main__":
    # 并发8线程执行
    Demo(thread_count=8).start()
```

### 数据入库

`feapder`对`pymysql`和`pymongo`做了一些封装，操作更加便捷，这里主要介绍`MySQL`入库（`Mongo`入库过程类似 ）：

文档：

+ https://boris-code.gitee.io/feapder/#/source_code/MysqlDB

#### 通过代码入库

首先需要引入`MysqlDB`类：

```python
from feapder.db.mysqldb import MysqlDB
```

然后通过`MysqlDB`类的构造函数进行数据库连接，传入数据库地址`ip`，端口`port`，连接的数据库`db`，用户名`user_name`，密码`user_pass`：

```python
db = MysqlDB(
    ip="localhost", port=3306, db="spider", user_name="root", user_pass="123456"
)
```

建表和添加数据使用`db`对象的`add()`方法即可，传入`SQL`语句；

例如，要将上面的`title`和`content`进行入库，可以这样改写`parser_detail()`方法：

````python
from feapder.db.mysqldb import MysqlDB
	... 	# 忽略类的定义和其他方法
    
	def parser_detail(self, request, response):
        title = request.title
        content = response.re('<article class="am-article">(.*?)</article>')[0]
        # 连接数据表
        db = MysqlDB(
            ip="localhost", port=3306, db="spiders", user_name="root", user_pass="123456"
        )
        # 创建数据表info_demo
        db.add('CREATE TABLE IF NOT EXISTS info_demo (id INT NOT NULL AUTO_INCREMENT, title VARCHAR(255), content TEXT, PRIMARY KEY (id))')
        # 插入数据
        sql = "INSERT INTO info_demo (title, content) VALUES ('%s', '%s')" % (title, content)
        db.add(sql)
````

`MysqlDB`也支持批量入库操作，和其余删查改，不常用，详情可见文档。

#### 通过配置文件入库

首先创建配置文件：

```bash
feapder create --setting
```

生成配置成功后，在当前目录中会创建`settings.py`文件，即爬虫配置文件。

去掉被注释的`MySQL`字段以激活`MySQL`配置：

```python
# MYSQL
MYSQL_IP = "localhost"
MYSQL_PORT = 3306
MYSQL_DB = "spiders"
MYSQL_USER_NAME = "root"
MYSQL_USER_PASS = "123456"
```

创建`item`文件，命令中传入的参数为数据表名：

```bash
feapder create -i info_demo
```

选择`Item`项：

<img src="https://images.drshw.tech/images/notes/image-20220920231907160.png" alt="image-20220920231907160" style="zoom:45%;" />

即可生成`item`文件，内容：

<img src="https://images.drshw.tech/images/notes/image-20220920232218436.png" alt="image-20220920232218436" style="zoom:40%;" />

一般不需要改，生成时就将数据库的字段对应过来了；由于`id`是自增主键，故这里将其注释了，放开注释则需要在插入数据的同时传入`id`字段值。

在爬虫程序中导入`item`文件中的类，并对指定字段赋值，最后通过`yield`进行返回即可；

```python
from info_demo_item import InfoDemoItem
	... 	# 忽略类的定义和其他方法
    
    def parser_detail(self, request, response):
        title = request.title
        content = response.re('<article class="am-article">(.*?)</article>')[0]
        item = InfoDemoItem()
        item.title = title
        item.content = content
        yield item
```

这么做的入库次数更少，效率更高。

### 自定义中间件

在爬虫程序的`Request()`构造方法中传入`download_midware`参数，可指定一个方法为中间件，即请求之前执行该方法。

示例：

```python
import feapder

class Demo(feapder.AirSpider):
    def start_requests(self):
        for i in range(1, 3):
            yield feapder.Request("http://httpbin.org/get", download_midware=self.mw_test)	# 添加了本类方法mw_test作为中间件

    def mw_test(self, request):
        """
        我是自定义的下载中间件
        :param request:
        :return:
        """
        request.headers = {'User-Agent': "lalala"}	# 添加用户代理 lalala
        return request

    def parse(self, request, response):
        print(response.text)

if __name__ == "__main__":
    Demo(thread_count=1).start()
```

运行后，可见`headers`中携带了数据`"User-Agent": "lalala"`。

我们也可以通过直接重写父类中的`download_midware()`方法，来实现下载中间件，返回`response`即可；

也可重写用于请求结果验证的`validate()`方法，该方法会在请求后自动执行，主要用于核对请求结果；若出现异常情况可手动抛出异常。

对于一些网站，访问多次就会出现滑块，使用`validate()`方法就能方便地做到请求失败时，先破解滑块。

某些网站如`https://www.smartbackgroundchecks.com/`，仅支持`HTTP2.0`协议，即通过`request`库无法正常请求，这种情况就需要将请求库换为`httpx`模块，可以在下载中间件中进行配置：

```python
import feapder, httpx

class Demo1s(feapder.AirSpider):
    def start_requests(self):
        yield feapder.Request("https://www.smartbackgroundchecks.com/")
	
    # 重写download_midware，采用httpx库的http2协议配置请求
    def download_midware(self, request):
        with httpx.Client(http2=True) as client:
            response = client.get(request.url)
            response.status_code = 200
        return request, response

    def parse(self, request, response):
        print(response.text)

    # 定义验证方法
    def validate(self, request, response):
        if response.status_code != 200:
            raise Exception("response code not 200")  # 重试


if __name__ == "__main__":
    Demo1s(thread_count=1).start()
```

### 对接自动化

#### 激活自动化

`feapder`框架也支持自动化爬虫，并对其进行了封装，功能强大。但是内置浏览器渲染目前不支持Edge，仅支持CHROME、PHANTOMJS、FIREFOX。

我们在这里以`Chrome`浏览器渲染为例，需要进行配置，详见主干课中**`selenium`自动化工具**一节中的配置讲解（流程与配置Edge自动化一致 ）。

若要使用自动化配置，在`Request()`构造方法中传入`render`参数，值为`True`即可：

```python
def start_requests(self):
    yield feapder.Request("https://news.qq.com/", render=True)
```

若请求报错，可尝试降低`selenium`的版本：

```python
pip install selenium==3.141.0
```

#### 配置自动化

可在`setting.py`文件中修改浏览器渲染配置，具体字段的意义可见注释：

<img src="https://images.drshw.tech/images/notes/image-20220921145155177.png" alt="image-20220921145155177" style="zoom:40%;" />

其中的`custom_argument`可以用来配置浏览器运行设置；`executable_path`可自定义浏览器驱动的位置（设为`None`即表示使用默认路径 ）；`auto_install_driver` 更是厉害，设为`True`后，即支持在版本不符或驱动不存在的情况下自动下载驱动文件；最为重量级的还是`xhr_url_regexes`参数，它可以用来拦截`XHR`数据，后面单独讲。

除了在`settings.py`中配置，也可在爬虫项目中，通过修改爬虫类的成员变量`__custom_setting__`进行配置更改：

```python
__custom_setting__ = dict(
        WEBDRIVER=dict(
            pool_size=1,  # 浏览器的数量
            load_images=True,  # 是否加载图片
            user_agent=None,  # 字符串 或 无参函数，返回值为user_agent
            proxy=None,  # xxx.xxx.xxx.xxx:xxxx 或 无参函数，返回值为代理地址
            headless=False,  # 是否为无头浏览器
            driver_type="CHROME",  # CHROME、PHANTOMJS、FIREFOX
            timeout=30,  # 请求超时时间
            window_size=(1024, 800),  # 窗口大小
            executable_path='D:\Configure\Anaconda\chromedriver.exe',  # 浏览器路径，默认为默认路径
            render_time=0,  # 渲染时长，即打开网页等待指定时间后再获取源码
            custom_argument=["--ignore-certificate-errors"],  # 自定义浏览器渲染参数
        )
    )
```

#### 基本使用

可以通过 `response.browser` 获取浏览器对象，对其进行操作，方式同`selenium`：

```python
import time
import feapder
from feapder.utils.webdriver import WebDriver
from selenium.webdriver.common.by import By


class Demo(feapder.AirSpider):
    def start_requests(self):
        yield feapder.Request("http://www.baidu.com", render=True)

    def parse(self, request, response):
        browser: WebDriver = response.browser   # 这里做了类型标注WebDriver，方便IDE提示（可删去 ）
        browser.find_element(by=By.ID, value="kw").send_keys("feapder")
        browser.find_element(by=By.ID, value="su").click()
        time.sleep(5)
        # response也是可以正常使用的
        print(response)
        # 若有滚动，可通过如下方式更新response，使其加载滚动后的内容
        response.text = browser.page_source
        print(response.text)


if __name__ == "__main__":
    Demo(thread_count=1).start()
```

#### 拦截`XHR`数据

我们刚刚提到，配置中的`xhr_url_regexes`参数非常厉害，它可以拦截`XHR`请求，使用流程如下：

+ 先在配置`xhr_url_regexes`参数，以列表形式传入，元素为接口路径字符串（支持正则匹配路径 ）；

  例如：

  ```python
  WEBDRIVER = dict(
      ...
      xhr_url_regexes=[
          "/api/post/source1.json",	# 接口1
          "/api/game/*",	# 接口2正则
      ]
  )
  ```

+ 通过浏览器对象的`xhr_text()/xhr_json()`方法可进行响应内容文本的提取：

  ```python
  browser: WebDriver = response.browser
  # 提取文本
  text = browser.xhr_text("/api/game/*")
  # 提取json
  data = browser.xhr_json("/api/game/*")
  ```

+ 也支持直接通过`xhr_response()`方法获取响应对象，通过对象的成员获取数据，示例：

  ````python
  browser: WebDriver = response.browser
  xhr_response = browser.xhr_response("/api/game/*")	# 获取响应对象
  # 提取相应内容
  print("请求接口", xhr_response.request.url)
  print("请求头", xhr_response.request.headers)
  print("请求体", xhr_response.request.data)
  print("返回头", xhr_response.headers)
  print("返回地址", xhr_response.url)
  print("返回内容", xhr_response.content)
  ````

下面以提取腾讯招聘（https://careers.tencent.com/search.html?keyword=python ）数据接口`/api/post/Query`中的`XHR`响应为例，编写代码：

<img src="https://images.drshw.tech/images/notes/image-20220921163220109.png" alt="image-20220921163220109" style="zoom:50%;" />

示例代码：

```python
import time
import feapder
from feapder.utils.webdriver import WebDriver


class Demo(feapder.AirSpider):
    # 配置自动化
    __custom_setting__ = dict(
        WEBDRIVER=dict(
            pool_size=1,  # 浏览器的数量
            load_images=True,  # 是否加载图片
            user_agent=None,  # 字符串 或 无参函数，返回值为user_agent
            proxy=None,  # xxx.xxx.xxx.xxx:xxxx 或 无参函数，返回值为代理地址
            headless=False,  # 是否为无头浏览器
            driver_type="CHROME",  # CHROME、PHANTOMJS、FIREFOX
            timeout=30,  # 请求超时时间
            window_size=(1024, 800),  # 窗口大小
            executable_path=None,  # 浏览器路径，默认为默认路径
            render_time=0,  # 渲染时长，即打开网页等待指定时间后再获取源码
            custom_argument=["--ignore-certificate-errors"],  # 自定义浏览器渲染参数
            xhr_url_regexes=[
                "/api/post/Query",
            ],  # 拦截 https://careers.tencent.com/tencentcareer/api/post/Query 接口
        )
    )

    # 请求
    def start_requests(self):
        yield feapder.Request("https://careers.tencent.com/search.html?keyword=python", render=True)

    # 获取XHR
    def parse(self, request, response):
        browser: WebDriver = response.browser
        time.sleep(1.5)
        xhr_response = browser.xhr_response("/api/post/Query")
        print("请求头", xhr_response.request.headers)
        print("请求体", xhr_response.request.data)
        print("返回内容", xhr_response.content)
        # 关闭浏览器
        response.close_browser(request)


if __name__ == "__main__":
    Demo(thread_count=1).start()
```

## `feapder`项目（Project ）与案例实战

这里结合案例进行讲解：

需求：爬取京东官网（https://search.jd.com/ ）特定商品的数据；这里使用`feapder`自动化抓取数据，应用`MongoDB`存储数据。

### 准备工作

首先使用指令创建一个`feapder`项目：

```
feapder create -p JD_Spider
```

创建后，项目结构如下：

<img src="https://images.drshw.tech/images/notes/image-20220921165023893.png" alt="image-20220921165023893" style="zoom:50%;" />

各模块的意义如下：

- `items`： 文件夹存放与数据库表映射的`item`；
- `spiders`： 文件夹存放爬虫脚本；
- `main.py`： 运行入口；
- `setting.py`： 爬虫配置文件。 

再进入`spiders`文件夹，使用指令创建爬虫程序：

```python
feapder create -s JD_Items
```

### 网站分析

我们发现：

+ 搜索的参数会作为`URL`中的参数`keyword`传入。例如搜索`手机`，即访问：`https://search.jd.com/Search?keyword=手机`；

+ 数据在访问时并不会完全加载，要通过不断下拉滚动条触发数据请求，这个使用自动化可以实现；

  + 可以使用`XPath`对数据进行提取操作，在这里，我们提取名称`name`，价格`price`和店铺`shop`三个字段信息：

  <img src="https://images.drshw.tech/images/notes/image-20220921174159117.png" alt="image-20220921174159117" style="zoom:50%;" />

+ 通过点击下一页按钮即可进行翻页操作，最后一页的按钮`class`中有`disable`字段，根据这个即可判断是否为尾页：

  <img src="https://images.drshw.tech/images/notes/image-20220921173406998.png" alt="image-20220921173406998" style="zoom:50%;" />

### 项目配置

在`settings.py`文件中进行项目配置：

+ 首先配置自动化：

  ```python
  WEBDRIVER = dict(
      pool_size=1,  # 浏览器的数量
      load_images=False,  # 是否加载图片
      user_agent=None,  # 字符串 或 无参函数，返回值为user_agent
      proxy=None,  # xxx.xxx.xxx.xxx:xxxx 或 无参函数，返回值为代理地址
      headless=False,  # 是否为无头浏览器
      driver_type="CHROME",  # CHROME、PHANTOMJS、FIREFOX
      timeout=30,  # 请求超时时间
      window_size=(1024, 800),  # 窗口大小
      executable_path=None,  # 浏览器路径，默认为默认路径
      render_time=0,  # 渲染时长，即打开网页等待指定时间后再获取源码
      custom_argument=[
          "--ignore-certificate-errors",
          "--disable-blink-features=AutomationControlled",
      ],  # 自定义浏览器渲染参数
      xhr_url_regexes=None,
      auto_install_driver=False,  # 自动下载浏览器驱动 支持chrome 和 firefox
      use_stealth_js=True,  # 使用stealth.min.js隐藏浏览器特征
  )
  ```

+ 再配置`MongoDB`数据库，打开`MongoDB`的配置字段：

  ```python
  # MONGODB
  MONGO_IP = "localhost"
  MONGO_PORT = 27017
  MONGO_DB = "spider"
  MONGO_USER_NAME = ""
  MONGO_USER_PASS = ""
  ```

  并打开`ITEM_PIPELINE`字段，配置`MongoDB`存储管道：

  ```python
  ITEM_PIPELINES = [
      # "feapder.pipelines.mysql_pipeline.MysqlPipeline",
      "feapder.pipelines.mongo_pipeline.MongoPipeline",
  ]
  ```

### 业务代码编写

根据上面的分析与配置，完整代码如下：

```python
# jd__items.py

import time
from lxml import etree
import feapder
from feapder.utils.webdriver import WebDriver
from feapder import Item
from selenium.webdriver.common.by import By


class JdItems(feapder.AirSpider):
    def start_requests(self):
        keyword = '手机'
        yield feapder.Request("https://search.jd.com/Search", params={'keyword': keyword}, render=True)

    def parse(self, request, response):
        browser: WebDriver = response.browser
        self.next_page(browser)
        res = browser.page_source

        # 数据提取模块
        html = etree.HTML(res)
        page = ''.join(html.xpath('//span[@class="p-num"]/a[@class="curr"]/text()'))  # 提取当前页面
        print(f'正在采集第{page}个页面')
        goods_names_tag = html.xpath('.//div[@class="p-name p-name-type-2"]/a/em')  # 提取商品标题
        goods_prices = html.xpath('.//div[@class="p-price"]//i')  # 提取商品价格
        goods_stores_tag = html.xpath('.//div[@class="p-shop"]')  # 提取店铺

        goods_names = []
        for goods_name in goods_names_tag:
            goods_names.append(goods_name.xpath('string(.)').strip())
        goods_stores = []
        for goods_store in goods_stores_tag:
            goods_stores.append(goods_store.xpath('string(.)').strip())
        goods_price = []
        for price in goods_prices:
            goods_price.append(price.xpath('string(.)').strip())

        # 数据入库模块
        for i in range(0, len(goods_names)):
            item = Item()
            item.table_name = 'jd_data'     # 指定集合名
            item.name = goods_names[i]
            item.shop = goods_stores[i]
            item.price = goods_price[i]
            yield item

        # 点击翻页，继续抓取，返回当前页面的url，继续采用浏览器渲染
        self.click_page(browser)
        page_url = browser.current_url
        yield feapder.Request(page_url, render=True)

    def next_page(self, browser):
        # 缓慢下拉页面，以加载全部的数据
        for i in range(1, 11):
            time.sleep(0.3)
            js = 'window.scrollTo(0,{})'.format(i * 1000)
            browser.execute_script(js)
        time.sleep(2)

    def click_page(self, browser):
        # 实现点击翻页，使用xpath定位到下一页按钮，然后点击
        try:
            next_btn = browser.find_element(by=By.XPATH, value='.//a[@class="pn-next"]')
            # 若遇到disabled属性，说明已经是最后一页，抛出异常
            if 'disabled' in next_btn.get_attribute('class'):
                print('没有下一页，抓取完成')
                browser.close()
            else:
                next_btn.click()
        except Exception as e:
            print(e)


if __name__ == "__main__":
    JdItems().start()
```

运行该脚本即可抓取数据。

### 入库结果

运行后，MongoDB成功存入数据：

![image-20220921205139372](https://images.drshw.tech/images/notes/image-20220921205139372.png)

