# `Scrapy`采集框架入门

## `scrapy`简介

`Scrapy`是用`Python`实现一个为了爬取网站数据、提取结构性数据而编写的异步应用框架，用途非常广泛，多用于企业级项目中。用户只需要定制开发几个模块就可以轻松的实现一个爬虫，用来抓取网页内容以及各种图片，非常之方便。

### 朴素爬虫程序架构

在我们之前编写爬虫程序时，除去全局配置，主要需要五个模块：

+ 任务池维护，即维护需要爬取的`url`队列；
+ 网络请求模块，即对任务池中的`url`发送请求；
+ 数据解析模块，即提取目标数据；
+ 数据保存模块，即将目标数据入库；
+ 调度模块，即控制以上几个模块的执行。

我们可以将其抽象成一个`Spider`类：

```python
class Spider(object):
    def __init__(self):
        # 负责全局配置
        pass

    def url_list(self):
        # 负责任务池维护
        pass

    def request(self):
        # 负责网络请求模块
        pass

    def parse(self):
        # 负责解析数据模块
        pass

    def save(self):
        # 负责数据存储
        pass

    def run(self):
        # 负责模块调度
        pass
```

### `scrapy`架构

`scrapy`的架构分为五个模块：

+ `Scheduler`：类似于上面的`url_list`模块，是任务池维护模块，维护任务`url`队列；

+ `Downloader`：类似于上面的`request`模块，用于发送请求爬取数据；

+ `Item Pipeline`：类似于上面的`save`模块，用于将目标数据入库，需要我们自己实现；

+ `Spiders`：类似于上面的`parse`模块，是数据解析模块，在数据解析时也会经常解析出新的请求地址（如翻页信息等 ）；

  它会将数据传送给`Item Pipeline`模块，将新的请求地址传送给`Scheduler`模块，需要我们自己实现；

+ `Scrapy Engine`：类似于上面的`run`模块，是总指挥的角色，模块间的通信都要经过它，负责数据和信号在模块间的传递。

总体架构如图所示：

<img src="https://img-blog.csdnimg.cn/20191118181419940.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3o0MzQ4OTA=,size_16,color_FFFFFF,t_70" style="zoom:80%;" />

图中名词解析：

<img src="https://img-blog.csdnimg.cn/20191118181449833.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3o0MzQ4OTA=,size_16,color_FFFFFF,t_70" alt="在这里插入图片描述" style="zoom:80%;" />

如果用群聊的形式展现`scrapy`程序的运行流程，应该是这样的：

<img src="https://images.drshw.tech/images/notes/image-20220922181932037.png" alt="image-20220922181932037" style="zoom:85%;" />

## `scrapy`基本使用

### `scrapy shell`调试

首先安装`scrapy`框架：

```bash
pip install scrapy
```

`scrapy`也可以执行类似`cmd`终端的`curl`指令，即直接对地址发起请求（默认`get` ），可用于调试。

可在终端通过`scrapy shell url`指令进入Python控制台，并对网站发起请求，返回响应结果`response`，可以直接在控制台打印；

例如，请求抽屉新热榜（https://dig.chouti.com/ ）主页的信息，执行：

```python
scrapy shell https://dig.chouti.com/
```

进入控制台后，可以打印`response`的一些信息：

![image-20220915221829511](https://images.drshw.tech/images/notes/image-20220915221829511.png)

可以用`XPath`提取我们想要的数据：

![image-20220915222057275](https://images.drshw.tech/images/notes/image-20220915222057275.png)

执行如下指令即可：

```python
datas = response.xpath('//div[@class="link-con"]/div')
for i in datas:
   print(i.xpath('.//a[@class="link-title link-statistics"]/text()').extract_first())
```

![image-20220915222407204](https://images.drshw.tech/images/notes/image-20220915222407204.png)

不是很常用，了解即可。

###  项目建设流程

#### 创建项目

在终端输入以下指令以创建名为`demo`的`scrapy`项目：

```bash
scrapy startproject demo
```

创建后，会生成`demo`文件夹，`demo`文件夹中包含以下文件：

<img src="https://images.drshw.tech/images/notes/image-20220915161549094.png" alt="image-20220915161549094" style="zoom:40%;" />

它们的作用如下：

+ `scrapy.cfg`：它是 `scrapy` 项目的配置文件，其内定义了项目的配置文件路径、部署相关信息等内容，基本上不需要修改；
+ `items.py`：它定义 `item` 数据结构，所有的 `item` 的定义都可以放这里；
+ `pipelines.py`：它定义 `Item Pipeline` 的实现，所有的 `Item Pipeline` 的实现都可以放这里；
+ `settings.py`：它定义项目的全局配置，下面有详细说明；
+ `middlewares.py`：它定义 `Spider Middlewares` 和 `Downloader Middlewares` 的实现；
+ `spiders`：其内包含一个个 `Spider`（爬虫程序 ）的实现，每个 `Spider` 都有一个文件。

配置文件`settings.py`简介：

```python
# Scrapy settings for ScrapyDemo project

# 自动生成的配置，无需关注，不用修改
BOT_NAME = 'demo'
SPIDER_MODULES = ['demo.spiders']
NEWSPIDER_MODULE = 'demo.spiders'

# 设置UA，但不常用，一般都是在MiddleWare中添加
USER_AGENT = USER_AGENT = 'demo (+http://www.yourdomain.com)'

# 是否遵循网站服务器中robots.txt中的爬虫规则
# 我们并不是在做搜索引擎，而且在某些情况下我们想要获取的内容恰恰是被 robots.txt 所禁止访问的
# 我们需要将此配置项设置为 False ，拒绝遵守 Robot协议
ROBOTSTXT_OBEY = True	# False

# 对网站并发请求总数，默认16
CONCURRENT_REQUESTS = 32

# 相同网站两个请求之间的间隔时间，默认是0s。相当于time.sleep()
DOWNLOAD_DELAY = 3
# 下面两个配置二选一，但其值不能大于CONCURRENT_REQUESTS，默认启用PER_DOMAIN
# 对网站每个域名的最大并发请求，默认8
CONCURRENT_REQUESTS_PER_DOMAIN = 16
# 默认0，对网站每个IP的最大并发请求，会覆盖上面PER_DOMAIN配置，
# 同时DOWNLOAD_DELAY也成了相同IP两个请求间的间隔了
CONCURRENT_REQUESTS_PER_IP = 16

# 禁用cookie，默认是True，启用
COOKIES_ENABLED = False

# 请求头设置，这里基本上不用
DEFAULT_REQUEST_HEADERS = {
#   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
#   'Accept-Language': 'en',
}

# 配置启用Spider MiddleWares，Key是class，Value是优先级
SPIDER_MIDDLEWARES = {
    'demo.middlewares.DemoSpiderMiddleware': 543,
}

# 配置启用Downloader MiddleWares

DOWNLOADER_MIDDLEWARES = {
    'demo.middlewares.DemoDownloaderMiddleware': 543,
}

# 配置并启用扩展，主要是一些状态监控
EXTENSIONS = {
    'scrapy.extensions.telnet.TelnetConsole': None,
}

# 配置启用Pipeline用来持久化数据
ITEM_PIPELINES = {
   'demo.pipelines.DemoPipeline': 300,
}
```

#### 创建`Spider`

`Spider` 是自己定义的类，`Scrapy` 用它来从网页里抓取内容，并解析抓取的结果。不过这个类必须继承 `Scrapy` 提供的 `Spider` 类 `scrapy.Spider`，还要定义 `Spider` 的名称和起始请求，以及怎样处理爬取后的结果的方法。

先`cd`到项目文件夹，再执行下面的指令：

```python
scrapy genspider 爬虫名称 目标地址
```

爬虫名称可以随便取，目标地址就是这个`Spider`需要爬取站点的根路由，例如需要创建一个爬取百度（`www.baidu.com` ）的`Spider`，执行：

```bash
scrapy genspider baidu www.baidu.com
```

执行后即会在`Spider`文件夹中创建一个新`Python`文件`baidu.py`：

<img src="https://images.drshw.tech/images/notes/image-20220915165354282.png" alt="image-20220915165354282" style="zoom:50%;" />

其中有一个`BaiduSpider`类，继承了`scrapy`模块中的`Spider`类。

这里的`allow_domains`列表中存放了允许访问的域名，若要请求的域名不在该列表中，则会过滤掉~~，可以直接注释掉~~。

#### 编写`Spider`

启动爬虫程序后，会执行默认的`start_requests()`方法。它其实是一个生成器——由于`scrapy`是一个异步框架，它无法自动处理阻塞，所以需要生成器主动调度，这个特性也表示它执行的操作是无序的。

<img src="https://images.drshw.tech/images/notes/image-20220916225448746.png" alt="image-20220916225448746" style="zoom:50%;" />

生成器返回一个`Request()`函数的返回值，`Request()`函数会向地址发送`GET`请求。

若想要使用`POST`请求，则需要重写`start_requests()`方法：

仿照原函数写即可，但是需要添加携带的数据，且应当使用`FormRequest()`函数进行返回，它进行的是`POST`请求，这里给出一个例子：

爬取巨潮资讯最新公告（http://www.cninfo.com.cn/new/commonUrl?url=disclosure/list/notice#regulator ）中的数据：

先找到数据包地址（http://www.cninfo.com.cn/new/disclosure ）：

<img src="https://images.drshw.tech/images/notes/image-20220916231100613.png" alt="image-20220916231100613" style="zoom:40%;" />

<img src="https://images.drshw.tech/images/notes/image-20220916232137993.png" alt="image-20220916232137993" style="zoom:40%;" />

创建一个新的`Spider`：`scrapy genspider jc www.cninfo.com.cn`；

向它发出`POST`请求（只抓取一页的信息 ），可以这样写（下一小节就会讲程序执行，即可进行调试 ）：

```python
class JcSpider(scrapy.Spider):
    name = 'jc'
    allowed_domains = ['www.cninfo.com.cn']
    # start_urls = ['http://www.cninfo.com.cn/']

    def start_requests(self):
        url = 'http://www.cninfo.com.cn/new/disclosure'
        form_data = {
            "column": "regulator_latest",
            "pageNum": str(1),
            "pageSize": "30",
            "sortName": "",
            "sortType": "",
            "clusterFlag": "true"
        }
        yield scrapy.FormRequest(url=url, formdata=form_data)

    def parse(self, response):
        print(response.text)
```

`FormRequest`也可携带`callback`参数，默认值为`parse`，为请求后的回调函数，一般不去更改。

顺便附一下完整请求多页，且修改回调函数名的代码：

```python
class JcSpider(scrapy.Spider):
    name = 'jc'
    allowed_domains = ['www.cninfo.com.cn']
    # start_urls = ['http://www.cninfo.com.cn/']

    def start_requests(self):
        url = 'http://www.cninfo.com.cn/new/disclosure'
        for i in range(1, 3):
            form_data = {
                "column": "regulator_latest",
                "pageNum": str(i),
                "pageSize": "30",
                "sortName": "",
                "sortType": "",
                "clusterFlag": "true"
            }
            yield scrapy.FormRequest(url=url, formdata=form_data, meta={'page': form_data['pageNum']}, callback=self.test)

    def test(self, response):
        print(f'正在采集第{response.meta.get("page")}页')
```

`meta`参数可以在`response`对象中设置键值对数据，回调函数可提取。

若使用默认`callback`，请求完成后将自动执行`parse()`，会将`response`参数传入，表示的是请求响应的结果。该函数用于数据解析，一般也会将其写为一个**生成器**，便于管道调用之。

还有一点值得提，不论是`FormRequest`还是`Request`，它们都可以传递一个参数`dont_filter`，设为`True`则会重复请求相同的地址，设为`False`表示会自动过滤重复的请求，这里给出一段测试代码：

创建一个新的`Spider`：`scrapy genspider huya hy.com`；

```python
import scrapy
import json

class HuyaSpider(scrapy.Spider):
    name = 'huya'
    # allowed_domains = ['hy.com']

    def start_requests(self):
        url = ['https://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&gameId=1663&tagAll=0&page=2',
               'https://www.huya.com/cache.php?m=LiveList&do=getLiveListByPage&gameId=1663&tagAll=0&page=2']
        for i in url:
            # dont_filter=False，代表框架会默认对地址进行了去重
            yield scrapy.Request(url=i, dont_filter=False)

    def parse(self, response):
        items = json.loads(response.text)
        data = items.get('data').get('datas')
        print(len(data))	# 只打印了一遍
```

### 执行程序

#### `scrapy`指令运行爬虫

先`cd`到项目文件夹，再执行下面的指令，即可运行对应的爬虫：

```python
scrapy crawl 爬虫名称
```

在这种运行方式下，

例如，先在`parse()`方法中打印`response.text`进行调试，再执行：

```bash
scrapy crawl baidu
```

会打印很多日志：

![image-20220915170920008](https://images.drshw.tech/images/notes/image-20220915170920008.png)

在日志中成功打印了响应数据。（注意**一定要把`settings.py`中的`ROBOTSTXT_OBEY`字段改为`False`，否则会爬取失败！** ）

若不想打印日志，执行：

```bash
scrapy crawl baidu --nolog
```

日志输出也可以在`settings.py`的`LOG_LEVEL`和`LOG_FILE`两个参数中进行配置；

`LOG_LEVEL`参数有以下几种配置：

+ `'DEBUG'`：用于调试信息（最低严重性 ）

+ `'INFO'`：用于信息消息

+ `'WARNING'`：用于警告消息

+ `'ERROR'`：用于正则错误

+ `'CRITICAL'`：用于严重错误（最高严重性 ）

`LOG_FILE`字段则为一个文件地址，所有符合`LOG_LEVEL`条件的日志信息都会存入该文件中。

#### 直接执行Python脚本

可使用`scrapy`模块中的`cmdline`对象的`execute`方法，传入指令字段构成的列表，可以直接将指令注入终端执行：

例如，想通过直接运行`baidu.py`直接启动爬虫任务，可以这样写：

```python
from scrapy import cmdline

... # baidu.py 的其余代码

cmdline.execute("scrapy crawl baidu".split())	
cmdline.execute(["scrapy","crawl","baidu"])	# 与上方的写法等价
```

也可以加上`--nolog`，不打印日志。

运行可能出现以下的报错情况：

```
ImportError: cannot import name 'HTTPClientFactory' from 'twisted.web.client' (unknown location)
```

可以通过降低`Twisted`模块的版本解决：

```python
pip install Twisted==20.3.0
```

### 数据保存

请求数据后，我们就需要管道`PipeLine`存放数据。

#### 定义数据结构

首先需要在`items.py`中定义数据结构，即我们需要提取的字段名，格式为`字段名 = scrapy.Field()`；

以学生信息为例，加入需要提取入库的信息为标题`title`、简介`description`两个字段，可以在文件中这样写：

```python
class DemoItem(scrapy.Item):	# 类名取决于项目名称
    # define the fields for your item here like:
    # name = scrapy.Field()
    title = scrapy.Field()
    description = scrapy.Field()
```

定义完数据结构后，需要在`Spider`文件夹下的相应模块中进行导包，并进行数据结构对象的实例化，即：

```python
from demo.items import DemoItem

item = DemoItem()
```

实例化后，即可将解析出的数据字段按字典的方式填入对象中：

```python
item['title'] = title_data
item['description'] = description_data
```

该数据类型也可以通过`dict()`函数强制转换为字典，便于存储在如`MongoDB`的数据库中。

#### 编写管道

下面需要将这些数据放入管道中，首先要在`settings.py`中进行配置`ITEM_PIPELINES`字段的信息；

默认只有一个`pipeline`，即添加`'demo.pipelines.DemoPipeline': 300,`，代表激活了名为`DemoPipeLine`的管道，该名称与`pipelines.py`中定义的类名一致。

若有多个管道，如`DemoPipeline_MySQL`、`DemoPipeline_MongoDB`、`DemoPipeline_CSV`，可以这样配置：

```python
ITEM_PIPELINES = {
   'demo.pipelines.DemoPipeline_MySQL': 300,
   'demo.pipelines.DemoPipeline_MongoDB': 400,
   'demo.pipelines.DemoPipeline_CSV': 500,
}
```

后面的值一般设置在`0-1000`之间，是用来调整它们执行的优先级的（数字越小，越先执行 ）。若只有一个管道，随意设置即可。

管道类存放在`pipelines.py`中，其中的`process_item()`方法需要传入两个参数，其中`item`参数就是生成器`parse`每次返回的数据条目。激活后会自动执行。

具体操作，我们放在下面案例中讲。

## 入门案例

### 爬虫目标

+ 使用`scrapy`框架，爬取豆瓣读书（https://book.douban.com/top250 ）中的书籍信息，并将其存入MySQL数据库中：

### 实现步骤

#### 定义数据结构

先在`items.py`中定义我们需要爬取数据的字段信息，我们需要爬取标题`title`、作者`author`、摘要`abstract`三个字段，依次添加即可：

```python
# items.py
import scrapy

class DoubanItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    title = scrapy.Field()
    author = scrapy.Field()
    abstract = scrapy.Field()
```

#### 创建爬虫任务

先创建`Spider`：

```bash
scrapy genspider douban book.douban.com/top250 
```

在`douban.py`的`parse`新增打印函数`print(response.text)`，再使用指令执行，测试：

```bash
scrapy crawl douban
```

成功打印相关信息：

![image-20220915231348565](https://images.drshw.tech/images/notes/image-20220915231348565.png)

和普通爬虫一样，如果遇到爬不下来的情况，可以通过在`settings.py`中的`DEFAULT_REQUEST_HEADERS`字段添加用户代理的方法解决。

请求成功后，引入`items`模块中的数据结构；使用`BeautifulSoup`进行数据提取，每次实例化一个数据结构对象，并给相应字段赋值即可，这里就不细讲了。

要注意的是最后要以**生成器**的形式返回，返回的内容为一条数据所有字段的信息（可以是字典或是数据结构对象 ）。

`Spider`结构代码如下，直接运行该`Python`脚本即可：

```python
# douban.py

import scrapy
from bs4 import BeautifulSoup
from scrapy import cmdline
from demo.items import DoubanItem

class DoubanSpider(scrapy.Spider):
    name = 'douban'
    allowed_domains = ['book.douban.com']
    start_urls = ['http://book.douban.com/']

    def parse(self, response):
        bs = BeautifulSoup(response.text, 'html.parser')
        ul_data = bs.select("ul[class='list-col list-col5 list-express slide-item']")
        for ul in ul_data:
            datas = ul.select('li')
            for data in datas:
                item = DoubanItem()
                item['title'] = data.select('a')[1].text
                item['author'] = data.select('span[class="author"]')[0].text.replace(' ', '')
                item['abstract'] = data.select('p[class="abstract"]')[0].text.replace(' ', '')
                yield item
```

执行结果：

![image-20220916001502382](https://images.drshw.tech/images/notes/image-20220916001502382.png)

#### 定义管道存储

首先在`settings.py`中激活管道：

```python
ITEM_PIPELINES = {
   'douban.pipelines.DoubanPipeline': 300,
}
```

获取参数中的`item`，连接数据库，将数据填入对应字段的数据表中：

```python
# pipelines.py

from itemadapter import ItemAdapter
import pymysql

class DoubanPipeline:
    def process_item(self, item, spider):
        item = dict(item)   # 将item转换成字典，可省略（兼容mongo ）
        pymysql.install_as_MySQLdb()
        db = pymysql.connect(host='localhost', user='root', password='123456', port=3306)   # 连接数据库
        cursor = db.cursor()
        cursor.execute('CREATE DATABASE IF NOT EXISTS douban_data DEFAULT CHARACTER SET utf8')   # 创建数据库
        db.select_db('douban_data')  # 选择数据库
        init_table = "CREATE TABLE IF NOT EXISTS douban_book (title VARCHAR(255), author VARCHAR(255), abstract VARCHAR(255))"  # 创建数据
        cursor.execute(init_table)
        sql = "insert into douban_book(title,author,abstract) values(%s,%s,%s)"
        cursor.execute(sql, (item['title'], item['author'], item['abstract']))
        db.commit()
        return item
```

**注：其实有更好的写法，在下一节`scrapy`框架进阶中会讲解。**

#### 配置日志

在`setting.py`中配置日志设置，配置日志为警告级别，如果有数据是警告级别那么将记录到文件：

```python
LOG_LEVEL = 'WARNING'
LOG_FILE = './log.log'
```

#### 运行程序

最后启动爬虫程序，即可将数据存入数据库中：

```bash
scrapy crawl douban
```

执行结果：

![image-20220916222623158](https://images.drshw.tech/images/notes/image-20220916222623158.png)











