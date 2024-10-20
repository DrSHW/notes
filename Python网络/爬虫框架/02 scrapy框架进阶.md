# `scrapy`框架进阶

## `scrapy`数据提取

### 简介

`Scrapy `提供了自己的数据提取方法，即 `Selector`选择器。`Selector `是基于`lxml`来构建的，支持`XPath`选择器、`CSS`选择器以及正则表达式，功能全面，解析速度和准确度非常高。

导入方式：

```python
from scrapy import Selector
```

`Selector` 是一个可以独立使用的模块。我们可以直接利用` Selector `这个类来构建一个选择器对象，然后调用它的相关方法如 `XPath`、`css`等来提取数据。

下面会用到的测试代码：

```html
html = '''
<html>
 <head>
  <base href='http://example.com/' />
  <title>Example website</title>
 </head>
 <body>
  <div id='images'>
   <a href='image1.html'>Name: My image 1 <br /><img src='image1_thumb.jpg' /></a>
   <a href='image2.html'>Name: My image 2 <br /><img src='image2_thumb.jpg' /></a>
   <a href='image3.html'>Name: My image 3 <br /><img src='image3_thumb.jpg' /></a>
   <a href='image4.html'>Name: My image 4 <br /><img src='image4_thumb.jpg' /></a>
   <a href='image5.html'>Name: My image 5 <br /><img src='image5_thumb.jpg' /></a>
  </div>
 </body>
</html>
'''
```

### 基本使用

针对 `HTML`代码，使用前需要先实例化一个处理工厂对象：

```python
sel = Selector(text=html)
```

然后就可以使用下面几种处理方式进行数据处理：

#### `XPath`选择器

使用工厂对象的`xpath()`方法，传入常规的`XPath`表达式，返回含有提取信息的工厂对象，支持链式调用：

```python
res = sel.xpath('//a/@href')	# 提取节点a的href属性
```

可使用`extract()`或是`extract_first()`方法提取对象中的值：

+ `extract()`提取对象中的全部值，返回一个列表；
+ `extract()`返回提取对象的第一个值；

```python
print(res.extract())			
print(res.extract_first())
```

#### 正则匹配

 `Selector`也支持正则匹配，使用工厂对象中的`re`方法进行提取，传入同`re`模块一样的提取参数（括号中的内容即表示需要提取的内容），直接返回一个列表，其中包括所有符合格式要求的值。

若想提取示例代码包含：在所有`a `标签节点的文本中，`Name:`文本后的值，如`Name: My image 1`中的`My image 1`，可以这样写：

```python
res = sel.xpath('//a/text()').re('Name:\s(.*)')	# 支持嵌套提取
print(res)
```

若想提取`a `标签节点的文本中`:`两边的值都想提取，如`Name: My image 1`中的`Name`和`My image 1`，可以这样写：

```python
res = sel.xpath('//a/text()').re('(.*?):\s(.*)')
print(res)
```

#### `CSS`选择器

使用工厂对象的`css()`方法，传入`CSS选择器`，返回含有提取信息的工厂对象，支持链式调用：

若想提取所有`id`为`images`的标签中所有`a`标签的`href`属性，可以这样写：

```python
res = sel.css('#images a::attr(href)')
print(res.extract())
```

## `scrapy`数据存储

这里讲解`MySQL`和`MongoDB`这两种数据库的存储方式。

上节中我们讲过，数据存储需要在管道中定义`PipeLine`类来实现，在`PipeLine`中需要定义两个方法：

+ `open_spider`：用于初始化连接和选择数据库；
+ `process_item`：用于执行数据分类与入库操作；
+ `close_spider`：用于关闭连接。

### MongoDB存储

对于`MongoDB`，操作十分简单。首先准备`pymongo`库，然后在`open_spider`方法中连接MongoDB服务，连接数据库，最后再`process_item`进行入库即可，使用的依然是`pymongo`的指令集，示例：

```python
import pymongo
class DemoPipeline:
    def open_spider(self,spider):
        self.client = pymongo.MongoClient(host='localhost', port=27017)	# 连接MongoDB服务
        self.db = self.client.db	  		    # 连接数据库

    def process_item(self, item, spider):
        # item 提取入库过程
        return item
   
	def close_spider(self, spider):
        self.client.close()	# 关闭NongoDB服务
```

### MySQL存储

准备好`pymysql`库后，需要先在`settings.py`中对`DATA_CONFIG`项的`config`字段进行配置：

```python
DATA_CONFIG = {
   'config': {
      'host': '127.0.0.1',	# 服务所在IP
      'port': 3306,	# 服务所在端口
      'user': 'root',	# 用户名
      'password': '',	# 密码
      'db': 'demo',	# 需要入库的数据库名
      'charset': 'utf8'	# 字符编码
   }
}
```

在`open_spider`直接通过配置，连接数据库，并获取游标，在`process_item`中进行数据入库即可，入库语法同`pymysql`中的语法：

```python
import pymysql
class DemoPipeline:
    def open_spider(self,spider):
        data_config = spider.settings['DATA_CONFIG']
        self.client = pymysql.connect(**data_config['config'])	# 通过配置连接数据库
        self.cursor = self.client.cursor()

    def process_item(self, item, spider):
        # item 提取入库过程
        return item
    
    def close_spider(self, spider):
        self.cursor.close()	# 关闭游标和连接
        self.client.close()
```

具体案例在最后讲解。

## `scrapy`中间件

若去除了`scrapy`的中间件，它封装好的请求就和普通的请求没有区别了。通过这些中间件，爬虫的成功率和效率都会大大提升。

一般情况，`Spider Middleware`不需要手写，直接使用现成的即可，而下载中间件`Download Middleware`通常需要进行配置。

我们主要讲解`Download Middleware`。

### `Download Middleware`参与的总体流程

最开始，`Scheduler `（调度器）会从队列中拿出一个 `Request` 发送给 `Downloader` 执行下载，这个过程会经过 `Downloader Middleware` 的处理。另外，当 `Downloader` 将 `Request `下载完成得到 `Response` 返回给 `Spider` 时会再次经过 `Downloader Middleware` 处理。

也就是说，`Downloader Middleware `在整个架构中起作用的位置是以下两个：

- 在 `Scheduler` 调度出队列的 `Request` 发送给 `Downloader `下载之前，也就是我们可以在 `Request `执行下载之前对其进行修改；
- 在下载后生成的 `Response` 发送给 `Spider` 之前，也就是我们可以在生成 `Resposne `被 `Spider` 解析之前对其进行修改；

`Downloader Middleware` 的功能十分强大，修改 `User-Agent`、处理重定向、设置代理、失败重试、设置 `Cookies` 等功能都需要借助它来实现，它工作的总体过程如下图所示：

![image-20220918000606913](https://images.drshw.tech/images/notes/image-20220918000606913.png)

### 中间件的使用

中间件以类的形式在`middlewares.py`中定义。文件中有一个默认的`DownloaderMiddleware`类，我们也可以自定义中间件，需要先进行激活。

#### 中间件激活

`settings.py`中的`DOWNLOADER_MIDDLEWARES`参数用来设置下载器中间件。

其中，`Key`为中间件路径，`Value`为中间件执行**优先级**，当`Value`为`None`时，表示禁用。

关于优先级，`Value`数值越小的中间件，请求越早处理，但响应越晚处理，举个例子：

我们先激活两个中间件`CustomDownloaderMiddleware1`和`CustomDownloaderMiddleware2`：

```python
DOWNLOADER_MIDDLEWARES = {
    'demo.middlewares.DemoDownloaderMiddleware': 543,	# 默认中间件
    'demo.middlewares.CustomDownloaderMiddleware1': 600,	# 新激活的中间件CustomDownloaderMiddleware1
    'demo.middlewares.CustomDownloaderMiddleware2': 700,	# 新激活的中间件CustomDownloaderMiddleware2
}
```

下一小节会讲，中间件在`process_request()`方法中处理请求，在`process_response()`方法中处理响应内容，我们根据这两点在`middlewares.py`编写中间件，用来测试它们执行的顺序：

```python
class CustomDownloaderMiddleware1:
    def process_request(self, request, spider):
        print(1)

    def process_response(self, request, response, spider):
        print(response.status, 1)
        return response


class CustomDownloaderMiddleware2:
    def process_request(self, request, spider):
        print(2)

    def process_response(self, request, response, spider):
        print(response.status, 2)
        return response
```

执行结果为：

```bash
1
2
200 2
200 1
```

即验证了优先级的问题。

#### 中间件的实现

下载中间件主要由以下五个方法组成：

1. `from_crawler`：类方法，用于初始化中间件，在自定义中间件中一般无需实现；

2. `process_request`：每个`request`通过下载中间件时，都会调用该方法，可以在这个方法中添加请求头。

   先激活一个自定义中间件`CustomDownloaderMiddleware`，使用它给每次请求添加随机的用户代理，可以这样写：

   ```python
   import random
   
   class CustomDownloaderMiddleware():
       def __init__(self):
           self.user_agents = [
               'Mozilla/5.0 (Windows; U; MSIE 9.0; Windows NT 9.0; en-US)',
               'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Chrome/22.0.1216.0 Safari/537.2',
               'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:15.0) Gecko/20100101 Firefox/15.0.1'
           ]
   
       def process_request(self, request, spider):
           request.headers['User-Agent'] = random.choice(self.user_agents)
   ```

3. `process_response`：处理下载器返回的响应内容；

4. `process_exception`：当下载器或者处理请求异常时，调用此方法；

5. `spider_opened`：内置的信号量回调方法。

### 中间件配置`selenium`自动化

首先需要准备`selenium`包，这里以Edge浏览器为例。

配置也是通过`DownloaderMiddleware`实现的，过程如下：

+ 首先在中间件的构造函数中，声明浏览器对象，并对其进行初始化配置；
+ 然后在`process_request`方法中加载指定`URL`，并返回`scrapy.http`中的`HtmlResponse`对象即可，需要传入几个参数：
  + `url`：即请求的地址；
  + `body`：当前网站的源代码，即`browser.page_source`；
  + `request`：即参数中的`request`；
  + `encoding`： 即编码方式；
  + `status`：即状态码。

配置完后，再次发起请求，即可唤起虚拟浏览器进行请求（操作过程和`seleium`一致，不过是在中间件中实现的），配置`SeleniumMiddleware`示例：

```python
from selenium import webdriver
from logging import getLogger
from scrapy.http import HtmlResponse
import random

class SeleniumMiddleware:
    def __init__(self):
        self.logger = getLogger(__name__)	# 配置日志
        self.timeout = random.randint(1, 3)	# 随机等待时间
        # 运行配置
        self.options = webdriver.EdgeOptions()
        self.options.add_argument('--disable-blink-features=AutomationControlled')
        self.browser = webdriver.Edge(options=self.options)
        # 页面设置
        self.browser.set_window_size(1400, 700)
        self.browser.set_page_load_timeout(self.timeout)

    def process_request(self, request, spider):
        self.logger.debug('PhantomJS is Starting')
        self.browser.get(request.url)	# 加载指定URL中的数据
        body = self.browser.page_source
        return HtmlResponse(url=request.url, body=body, request=request, encoding='utf-8',status=200)	# 返回一个HtmlResponse对象

    def __del__(self):
        self.browser.close()
```

激活该中间件后，可通过运行以下`Spider`进行测试：

```python
import scrapy
from scrapy import cmdline, signals

class TestSpider(scrapy.Spider):
    name = 'test'
    start_url = 'https://careers.tencent.com/tencentcareer/api/post/Query?timestamp=1630663331818&countryId=&cityId=&bgIds=&productId=&categoryId=&parentCategoryId=&attrId=&keyword=python&pageIndex={}&pageSize=10&language=zh-cn&area=cn'

    def start_requests(self):
        for i in range(1, 3):
            yield scrapy.Request(url=self.start_url.format(i), callback=self.parse)

    def parse(self, response):
        with open('test.html', 'w', encoding='utf-8') as f:
            f.write(response.text)          # 保存响应数据
        self.logger.info(response.text)     # 记录处理日志


if __name__ == '__main__':
    cmdline.execute('scrapy crawl test'.split())
```

## 实战案例

### 爬虫目标

+ 使用`scrapy`框架提取上海热线（https://hot.online.sh.cn/node/node_65634.htm ）热点新闻中全部页数的内容，存入`MySQL`和`MongoDB`中：

  <img src="https://images.drshw.tech/images/notes/image-20220919105547572.png" alt="image-20220919105547572" style="zoom:50%;" />

+ 由于这些数据是服务端渲染的，这里采用`selenium`自动化技术进行采集。

### 实现步骤

+ 创建一个`Spider`，即`scrapy genspider SHNews https://hot.online.sh.cn/node/node_65634.htm`；

+ 首先需要编写中间件，中间件在上一小节中已经写过了，照搬并激活就行；

+ 编写数据结构，需要采集的三个字段命名为`title`，`date`，`info`：

  ```python
  # items.py
  import scrapy
  
  class SHNewsItem(scrapy.Item):
      # define the fields for your item here like:
      # name = scrapy.Field()
      title = scrapy.Field()
      date = scrapy.Field()
      info = scrapy.Field()
  ```

+ 编写`Spider`中的`parse`，需要筛选的是数据和下一页所在链接的位置：

  ```python
  # SHNews.py
  from urllib.parse import urljoin
  import scrapy
  from scrapy import cmdline
  from demo.items import SHNewsItem
  
  class ShnewsSpider(scrapy.Spider):
      name = 'Shnews'
      start_urls = ['https://hot.online.sh.cn/node/node_65634.htm']
  
      def parse(self, response):
          # 筛选数据
          news_list = response.css('div.list_thread')
          for news in news_list:
              items = SHNewsItem()
              items['title'] = news.xpath('.//h2/a/text()').extract_first()
              items['date'] = news.xpath('.//h3/text()').extract_first()
              items['info']  = news.xpath('.//p/text()').extract_first()
              yield items
  
          # 处理翻页，回调函数设为本身，直到找不到下一页的位置
          next = response.xpath('//center/a[text()="下一页"]/@href').extract_first()
          if next:
              url = 'https://hot.online.sh.cn/node/'
              print(url + next)
              yield scrapy.Request(urljoin(url, next), callback=self.parse)
  
  if __name__ == '__main__':
      cmdline.execute('scrapy crawl Shnews'.split())
  ```

+ 管道文件编写，需要激活并编写两个管道类`NewsPipeline_Mongo`和`NewsPipeline_MySQL`（无关的管道类要注释掉），负责两种入库方式；

  需要注意的是，对于`MySQL`存储，需要先在`settings.py`中做好相关配置：

  ```python
  DATA_CONFIG = {
     'config': {
        'host': '127.0.0.1',	# 服务所在IP
        'port': 3306,	# 服务所在端口
        'user': 'root',	# 用户名
        'password': '123456',	# 密码
        'db': 'spiders',	# 需要入库的数据库名
        'charset': 'utf8'	# 字符编码
     }
  }
  ```
  
  管道文件代码：
  
  ```python
  # pipelines.py
  import pymongo
  
  class NewsPipeline_Mongo:
      def open_spider(self, spider):
          self.client = pymongo.MongoClient(host='localhost', port=27017)     	# 连接MongoDB服务
          self.db = self.client.spider	# 连接数据库
  
      def process_item(self, item, spider):
          items = dict(item)
          if isinstance(items, dict):
              self.db['news'].insert_one(items)       # 存储数据
              return item
          else:
              return '数据格式有误'
  
      def close_spider(self, spider):
          self.client.close()						  # 关闭服务
          
  class NewsPipeline_MySQL:
      def open_spider(self, spider):
          data_config = spider.settings['DATA_CONFIG']
          self.client = pymysql.connect(**data_config['config'])
          self.cursor = self.client.cursor()
  
      def process_item(self, item, spider):
          # 插入数到数据库
          if isinstance(item, items.SHNewsItem):
              try:
                  # 创建数据表news
                  self.cursor.execute('CREATE TABLE IF NOT EXISTS news (title VARCHAR(255), date VARCHAR(255), info VARCHAR(255))')
                  # 插入数据
                  sql = 'insert into news (title, date, info) values (%s,%s,%s)'
                  self.cursor.execute(sql, (
                      item['title'],
                      item['date'],
                      item['info'],
                  ))
                  # 提交
                  self.client.commit()
              except Exception as e:
                  self.client.rollback()
                  print('信息写入错误%s-%s' % (item['url'], e))
  
      def close_spider(self, spider):
          # 关闭游标和连接
          self.cursor.close()
          self.client.close()
  ```

### 执行结果

MongoDB 存储结果：

![image-20220919114753666](https://images.drshw.tech/images/notes/image-20220919114753666.png)

MySQL 存储结果：

![image-20220919141758350](https://images.drshw.tech/images/notes/image-20220919141758350.png)
