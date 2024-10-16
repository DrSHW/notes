# `scrapy-redis` 分布式

## 分布式爬虫简介

### 概述

实现分布式爬虫即：通过运行一个**共同**的爬虫程序，同时部署到**多台服务器**上运行，以提高爬虫速度。

大型分布式爬虫主要分为三个层级：分布式数据中心、分布式抓取服务器及分布式爬虫程序。

### 分布式爬虫的前提

1. 要保证每一台计算机都能够正常的执行爬虫程序，这是对计算机硬件的最低水平、计算机系统环境和网络等多方面的基本需求，不再赘述；
2. 要保证所有的爬虫程序可以访问同一个队列。

### 分布式思路

分布式的实现主要需要以下三点：

1. 需要建立一个**公共的区域**，让多台电脑去公共区域里面拿任务，这个思想和多线程任务分配很像；
2. 存入数据的时候，我们可以规定一台设备是主机，其它设备都连接主机数据库，在其中存入数据；
3. 在第一点满足的情况下，不存入重复的数据，就可以实现分布式。

我们可以通过一个**公共管理对象**，来约束每一个相互独立的资源或者程序：

<img src="https://images.drshw.tech/images/notes/image-20220921232559559.png" alt="image-20220921232559559" style="zoom:50%;" />

如上图，我们可以在一台服务器上部署`Redis`数据库服务，用于任务调度，称该服务器为`Master`端；在其余服务器上部署爬虫程序，用于请求入库等操作，称这些服务器为`Slaver`端，本文采用的具体配置如下：

+ `Master`(核心服务器) ：使用 `Ubuntu 20.04`系统，部署一个`Redis`数据库服务，不负责爬取，只负责**`URL`指纹判重**、**`Request`的分配**，以及**数据的存储**；
+ `Slaver`(爬虫程序执行端) ：使用 `Windows 11`系统 、和`Ubuntu 20.04`系统，负责**执行爬虫程序**，运行过程中**将新的`Request`提交至`Master`**。

### 必要的配置

要测试分布式，必须要有两台以上的服务器，测试的话可以采用纯本地环境（要配置`WSL`或`VMWare`，不推荐 ）或本地环境和云服务器的组合。

服务器中必须有Python环境，推荐`Python 3.8/3.9`；并安装`scrapy`框架等相关模块，这里不再赘述。

服务器上还需要安装`Redis`服务，安装指令：

```bash
# 更新包管理
sudo apt-get update -y
# 下载redis服务
sudo apt install redis-server
```

安装后，需要修改`redis`中的配置：

```bash
# 进入配置文件
sudo vim /etc/redis/redis.conf
```

需要将`bind 127.0.0.1`所在行注释，将参数`protected-mode`值修改为`no`，更改后如下图：

![image-20220921233918335](https://images.drshw.tech/images/notes/image-20220921233918335.png)

更改配置后，启动`Redis`服务，使用`redis-cli`指令即可进入`Redis`：

```bash
# 启动redis服务
sudo service redis start
# 进入redis数据库命令行
redis-cli
```

进入命令行后，输入`ping`，若输出`PONG`则表示配置成功：

![image-20220921234237878](https://images.drshw.tech/images/notes/image-20220921234237878.png)

还需要配置`SSH`，使主机能连接到服务器端，这里就不赘述了，详见[特菈学姐](https://dustella.net/)的**轻运维笔记**。

## （补充 ）`Redis`的使用

见[**番外————Redis数据库的使用**](https://docs.drshw.tech/pw/extra_2/)。

## `scrapy-redis`简介

### 起源

之前我们已经学习了`scrapy`，它是一个通用的爬虫框架，借助它我们能够快速地编写很多爬虫代码。`scrapy`能做的事情很多，但是要做到大规模的分布式应用时，则捉襟见肘。

于是就出现了`scrapy-redis`，它是`scrapy`的一个组件，它使用了`Redis`数据库做为基础，目的为了更方便地让`scrapy`实现分布式爬取。

`scrapy-redis`改变了`scrapy`的队列调度，将起始的网址从`start_urls`里分离出来，改为从`Redis`读取。多个客户端可以同时读取同一个`Redis`，从而实现了分布式的爬虫。

开源地址： https://github.com/rmax/scrapy-redis.git 。

### `scrapy-redis`架构

`scrapy-redis`在`scrapy`五大模块的架构上，新增了`Redis`模块处理分布式，也改写了以下几个模块：

+ `Scheduler`（调度 ）：

  `scrapy`改造了`python`本来的`collection.deque`(双向队列)形成了自己`scrapy queue`，而`scrapy-redis` 的解决是把这个`scrapy queue`换成`redis`数据库，从同一个`redis-server`存放要爬取的`request`，便能让多个`spider`去同一个数据库里读取。

+  `Duplication Filter`（去重 ）：

  `scrapy-redis`中由`Duplication Filter`组件来实现去重，它通过`redis`的`set`不重复的特性，巧妙的实现了`DuplicationFilter`去重。

+ `Item Pipline`（管道 ）：

  引擎将(Spider返回的)爬取到的Item给`Item Pipeline`，`scrapy-redis` 的`Item Pipeline`将爬取到的 `Item `存⼊`redis`的` items queue`。修改过`Item Pipeline`可以很方便的根据` key `从` items queue `提取`item`，从而实现 `items processes`集群。

+ `Base Spider`（爬虫 ）：

  不再使用`scrapy`原有的`Spider`类，重写的`RedisSpider`继承了`Spider`和`RedisMixin`这两个类，`RedisMixin`是用来从`redis`读取`url`的类。

`scrapy-redis`总体架构如图所示：

<img src="https://images.drshw.tech/images/notes/6591571-0aa3ae1f42aae80d.webp" alt="img" style="zoom:80%;" />

### 工作模式对比

+ 传统模式：执行一个`Spider`程序，直接开始爬虫任务，存数据，直到程序停止；
+ 分布式模式：核心服务器部署一个`Redis`服务，所有的任务主机都会监听上的`Redis`数据一个键值，其中存放任务`URL`，供主机爬取。若队列中数据为空，则所有主机都不工作，进入监听状态。我们不仅需要完成爬虫逻辑的编写，还需要提供`Redis`的任务调度逻辑（通过Python操作`Redis` ）。

## `scrapy-redis`基本使用

### 准备工作

需要安装`scrapy-redis`模块：

```python
pip install scrapy-redis
```

附：`Redis`可视化工具`RDM`，破解版下载地址：https://storage.drshw.tech/d/OneDrive/note-source/RedisDesktopManager.rar 。

### 配置

一般来说，分布式是在普通爬虫框架的前提下通过修改一些依赖和配置实现的。这里推荐结合下面的案例实战，进行配置的学习。

在`scrapy`项目中的`settings.py`中，进行`scrapy-redis`的配置：

#### 一般配置

首先，需要将调度器的类和去重的类替换为`Scrapy-Redis `提供的类，在 `settings.py` 里面添加如下配置即可：

```python
# 调度
SCHEDULER = "scrapy_redis.scheduler.Scheduler"
# 请求指纹去重
DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter"
```

其次需要连接`Redis`数据库，直接在 `settings.py` 里面配置`REDIS_URL`变量即可，值的格式为`redis://[:password]@host:port/db`，例如：

```python
REDIS_URL = 'redis://172.25.197.89:6379/0'
```

#### 调度队列配置

此项配置是可选的，默认使用 `PriorityQueue`。如果想要更改配置，可以配置`SCHEDULER_QUEUE_CLASS`变量，如下所示：

三种队列功能:

+ `PriorityQueue`： 优先队列，会维护一个有序的队列；
+ `FifoQueue`：`First In First Out`，先进先出队列，即栈；
+ `LifoQueue`：`Last In First Out`，后进先出队列，即普通队列。

配置示例：

```python
SCHEDULER_QUEUE_CLASS = 'scrapy_redis.queue.PriorityQueue'  # 使用有序集合来存储
SCHEDULER_QUEUE_CLASS = 'scrapy_redis.queue.FifoQueue'  	# 先进先出
SCHEDULER_QUEUE_CLASS = 'scrapy_redis.queue.LifoQueue'  	# 先进后出、后进先出
```

#### 持久化配置

此配置是可选的，默认是`False`。`scrapy-redis` 默认会在爬取全部完成后清空爬取队列和去重指纹集合。

如果不想自动清空爬取队列和去重指纹集合，可以增加如下配置：

```python
SCHEDULER_PERSIST = True   # 底层 就是监听爬虫信号  触发redis指令 清空数据库
```

#### 配置重爬

此配置是可选的，默认是`False`。如果配置了持久化或者强制中断了爬虫，那么爬取队列和指纹集合不会被清空，爬虫重新启动之后就会接着上次爬取。如果想重新爬取，我们可以配置重爬的选项：

```python
SCHEDULER_FLUSH_ON_START = True  
```

这样将`SCHEDULER_FLUSH_ON_START`设置为`True`之后，爬虫每次启动时，爬取队列和指纹集合都会清空。所以要做分布式爬取，我们必须保证只能清空一次，否则每个爬虫任务在启动时都清空一次，就会把之前的爬取队列清空，势必会影响分布式爬取。

## 项目实战

### 爬虫目标

+  爬取京东官网（http://gz.jumei.com/ ）特定商品（比如香水 ）的数据，使用`scrapy-redis`构建分布式存取框架，数据在`MongoDB`中存储。

### 网站分析

我们发现：

+ 搜索的参数会作为`URL`中的参数`search`传入。例如搜索`香水`，即访问：`http://search.jumei.com/?search=香水`；

+ 可以使用`XPath`对数据进行提取操作，在这里，我们提取名称`name`，价格`price`和连接`link`三个字段信息：

  ![image-20220922174055123](https://images.drshw.tech/images/notes/image-20220922174055123.png)

+ 页码信息可通过`filter`参数传入，需要第`n`页的数据则传入`filter=0-11-n`；页码数可根据下方位置的信息在源代码中通过`XPath`获取。

  <img src="https://images.drshw.tech/images/notes/image-20220922213059111.png" alt="image-20220922213059111" style="zoom:50%;" />

### 准备工作

首先使用指令创建一个`scrapy`项目：

```
scrapy startproject jmyp_proj
```

再进入`spiders`文件夹，使用指令创建爬虫程序：

```python
scrapy genspider perfume_item search.jumei.com/
```

### 实现步骤

#### 基础代码实现

先编写基础的`scrapy`代码，然后通过配置和依赖更改为分布式代码。

先编写数据结构：

```python
# items.py

import scrapy

class JmypProjItem(scrapy.Item):
    # define the fields for your item here like:
    name = scrapy.Field()
    price = scrapy.Field()
    link = scrapy.Field()
```

编写`Spider`，即按分析过程请求网页信息，并提取数据：

```python
# perfume_item.py

import scrapy
from lxml import etree
from jmyp_proj.items import JmypProjItem

class PerfumeItemSpider(scrapy.Spider):
    name = 'perfume_item'
    # allowed_domains = ['search.jumei.com']
    start_urls = ['http://search.jumei.com/?filter=0-11-{}&search={}']
    key = ['香奈儿香水', '宝格丽香水']        # 搜索的关键字

    def start_requests(self):
        for i in self.key:
            print("正在爬取{}的数据".format(i))
            url = self.start_urls[0].format(1, i)
            yield scrapy.Request(url=url, callback=self.parse, meta={'page': 1})

    def parse(self, response):
        html = etree.HTML(response.text)
        good_list = html.xpath('//div[@class="products_wrap"]/ul/li')
        # 数据存储
        for data in good_list:
            items = JmypProjItem()
            items['name'] = ''.join(data.xpath('.//div[@class="s_l_name"]/a//text()')).strip()
            items['price'] = ''.join(data.xpath('.//div[@class="search_list_price"]/span/text()'))
            items['link'] = ''.join(data.xpath('.//div[@class="s_l_pic"]/a/@href'))
            yield items
        tot_page = int(html.xpath('//div[@class="page-nav-wrapper"]/ul/li[last()-1]/a/text()')[0])
        # 继续请求其它页
        if response.meta['page'] <= tot_page:
            print("正在爬取第{}页的数据".format(response.meta['page']))
            page = response.meta['page'] + 1
            url = self.start_urls[0].format(page, self.key[0])
            yield scrapy.Request(url=url, callback=self.parse, meta={'page': page})
```

编写管道，需要在`settings.py`中放开管道：

```python
# pipelines.py

import pymongo

class JmypProjPipeline:
    def open_spider(self, spider):
        self.client = pymongo.MongoClient(host='localhost', port=27017)  # 连接MongoDB服务
        self.db = self.client.spider  # 连接数据库

    def process_item(self, item, spider):
        items = dict(item)
        if isinstance(items, dict):
            self.db['jmyp'].insert_one(items)  # 存储数据
            return item
        else:
            return '数据格式有误'
        return item
```

最后使用`scrapy crawl perfume_item`指令，运行程序验证。执行后可见在`mongo`数据库中添加了如下数据：

![image-20220922225602332](https://images.drshw.tech/images/notes/image-20220922225602332.png)

#### `scrapy-redis`配置

首先创建一个新项目，分布式爬虫项目：

```bash
scrapy genspider perfume_redis search.jumei.com
```

在`settings.py`中添加`Redis`和分布式任务的一些配置：

```python
# 调度设置
SCHEDULER = "scrapy_redis.scheduler.Scheduler"
# 请求指纹去重
DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter"
# 配置Redis数据库
REDIS_URL = 'redis://172.21.53.249:6379/0'     # 地址为redis服务器地址，端口为redis服务器端口
# 调度队列配置，普通队列
SCHEDULER_QUEUE_CLASS = 'scrapy_redis.queue.LifoQueue'
# 爬取结束后是否清空Redis队列
SCHEDULER_FLUSH_ON_START = True
```

放开`Redis`管道：

```python
ITEM_PIPELINES = {
   'jmyp_proj.pipelines.JmypProjPipeline': 300,
   'scrapy_redis.pipelines.RedisPipeline': 400
}
```

需要将`Spider`中继承的类改为`RedisSpider`，并添加`redis_key`的值：

```python
from scrapy_redis.spiders import RedisSpider

class PerfumeRedisSpider(RedisSpider):
    redis_key = 'jmyp_perfume'
```

在这里，`start_project()`也不需要了，直接删去，但这里也无法获取原`Response`中的`meta`参数了，只能通过`XPath`获取总页数：

<img src="https://images.drshw.tech/images/notes/image-20220923001130348.png" alt="image-20220923001130348" style="zoom:90%;" />

于是，分布式化的程序如下：

```python
# perfume_redis.py

import scrapy
from scrapy_redis.spiders import RedisSpider
from jmyp_proj.items import JmypProjItem
from lxml import etree

# 继承类更改
class PerfumeRedisSpider(RedisSpider):
    # 指定存URL的键
    redis_key = 'jmyp_perfume'
    name = 'perfume_redis'
    # allowed_domains = ['search.jumei.com']
    start_urls = ['http://search.jumei.com/?filter=0-11-{}&search={}']
    # 搜索的关键字，通过操作redis数据库中的URL给出

    def parse(self, response):
        html = etree.HTML(response.text)
        good_list = html.xpath('//div[@class="products_wrap"]/ul/li')
        # 数据存储
        for data in good_list:
            items = JmypProjItem()
            items['name'] = ''.join(data.xpath('.//div[@class="s_l_name"]/a//text()')).strip()
            items['price'] = ''.join(data.xpath('.//div[@class="search_list_price"]/span/text()'))
            items['link'] = ''.join(data.xpath('.//div[@class="s_l_pic"]/a/@href'))
            yield items
        tot_page = int(html.xpath('//div[@class="page-nav-wrapper"]/ul/li[last()-1]/a/text()')[0])
        page = int(html.xpath('//li[@class="current"]/span/text()')[0])
        # 继续请求其它页，这里不用meta传递页码了，而是直接在源码中获取
        if page <= tot_page:
            print("正在爬取第{}页的数据".format(page))
            page += 1
            url = self.start_urls[0].format(page, self.key[0])
            yield scrapy.Request(url=url, callback=self.parse)
```

通过指令`scrapy crawl perfume_redis`，启动主机程序，发现其进入了等待任务的状态。此时在`Redis`中指定数据库的指定键中传递任务`URL`，主机监听到后，即会开启任务：

例如，在`Redis`命令行中执行` lpush jmyp_perfume http://search.jumei.com/?filter=0-11-1&search=宝格丽香水`指令，则会开启任务：

<img src="https://images.drshw.tech/images/notes/image-20220923002215181.png" alt="image-20220923002215181" style="zoom:50%;" />

连接服务器`Redis`服务后，`RDB`可视化工具中可以看到进入`Redis`的任务：

![image-20220923004633341](https://images.drshw.tech/images/notes/image-20220923004633341.png)

可通过编写脚本，控制`Redis`数据库：

```python
# redis_controller.py

import redis
conn = redis.Redis('172.21.53.249', db=0)
key = ['香奈儿香水', '宝格丽香水']
for i in key:
    url = 'http://search.jumei.com/?filter=0-11-1&search={}'.format(i)
    conn.lpush('jmyp_perfume', url)
```

同时执行脚本程序和分布式爬虫程序，即可完成数据的入库操作。在多台主机上部署分布式爬虫程序，可大大提升爬虫效率。

### `scrapy-redis`框架执行过程总结：

1. 最后总结一下`scrapy-redis`的总体思路：这套组件通过重写`Scheduler`和`Spider`类，实现了调度、`Spider`启动和`Redis`的交互。
2. 实现新的`dupefilter`和`queue`类，达到了判重和调度容器和`Redis`的交互，因为每个主机上的爬虫进程都访问同一个`Redis`数据库，所以调度和判重都统一进行统一管理，达到了分布式爬虫的目的。
3. 当`Spider`被初始化时，同时会初始化一个对应的`Scheduler`对象，这个调度器对象通过读取`settings.py`，配置好自己的调度容器`queue`和判重工具`dupefilter`。
4. 每当一个`Spider`产出一个`request`的时候，`scrapy`引擎会把这个`reuqest`递交给这个`Spider`对应的`Scheduler`对象进行调度，`Scheduler`对象通过访问`Redis`对`request`进行判重，如果不重复就把他添加进`Redis`中的调度器队列里。当调度条件满足时，`Scheduler`对象就从`Redis`的调度器队列中取出一个`request`发送给`Spider`，让他爬取。
5. 当`Spider`爬取的所有暂时可用`URL`之后，`Scheduler`发现这个`Spider`对应的`Redis`的调度器队列空了，于是触发信号`spider_idle`，`Spider`收到这个信号之后，直接连接`Redis`读取`start_urls`池，拿取新的一批`URL`入口，然后再次重复上边的工作。



