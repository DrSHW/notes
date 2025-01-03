# 1 初识 Django

## 引言

我们都知道，Django是基于Python的Web开发框架。

那么，什么是Web开发？

Web开发指的是开发基于B/S架构，通过前后端的配合，将后台服务器的数据在浏览器上展现给前台用户的应用。比如将电子购物网站的商品数据在浏览器上展示给客户，在基于浏览器的学校系统管理平台上管理学生的数据，监控机房服务器的状态并将结果以图形化的形式展现出来等等。

### Web应用的发展

在早期，没有Web框架的时候，我们是如何创建Web应用的呢？ 以使用Python CGI脚本显示数据库中最新添加的10件商品为例：


```python
import pymysql

print("Content-Type: text/html\n")
print("<html><head><title>products</title></head>")
print("<body>")
print("<h1>products</h1>")
print("<ul>")

connection = pymysql.connect(user='user', passwd='pwd', db='product_db')
cursor = connection.cursor()
cursor.execute("SELECT name FROM products ORDER BY create_date DESC LIMIT 10")

for row in cursor.fetchall():
    print("<li>%s</li>" % row[0])

print("</ul>")
print("<p>https://www.liujiangblog.com</p>")
print("</body></html>")

connection.close()
```

首先，打印`Content-Type`行等一些HTML的起始标签，然后连接数据库并执行一些查询操作，获取最新的十件商品的相关数据。在遍历这些商品的同时，生成一个商品的HTML列表项，然后输出HTML的结束标签并且关闭数据库连接。将生成的HTML代码保存到一个`.cgi`文件中，然后上传到网络服务器上，用户通过浏览器即可访问。

这个代码看起来不错，简单易懂，但实际有很多问题和不方便的地方，比如：

* 网络应用底层的协议、线程、进程如何处理？
* 如果应用中有多处需要连接数据库会怎样呢？我们会有很多CGI脚本，每个脚本都写一遍链接数据库的代码？ 
* 前端、后端工程师以及数据库管理员集于一身，无法分工配合。设想一个前端设计师，完全没有Python开发经验，但是又需要编写SQL语句的话，会发生什么呢？
* 如果代码被重用到一个复杂的环境中会发生什么？
* 直接将数据库的密码写在代码里吗？
* 今天是取十个商品，明天我要删除十个商品怎么办？

以上的问题是显而易见的，聪明的程序员在不断地遇到问题和解决问题，探索方案和实践方案中，重复了下面的过程：

1. 开始编写第一个Web应用，经过大量地摸索和踩坑，完成了工作；
2. 开始编写新的Web应用；
3. 从第一步中总结经验（找出其中通用的代码），并运用在第二步中；
4. 重构代码使得能在第二个应用中使用第一个程序中的通用代码；
5. 重复2-4步若干次；
6. 发明了一个Web框架。

最初的Web开发框架就是这么来的！

### Web应用程序处理流程

Web框架致力于解决一些共同的问题，为Web应用提供通用的架构，让用户专注于网站应用业务逻辑的开发，而无须处理网络应用底层的协议、线程、进程等方面的问题，从而大大提高开发者的效率和Web应用程序的质量。

一般Web框架的架构是这样的：

<img src="https://images.drshw.tech/images/notes/web.png" alt="img" style="zoom: 33%;" />

![84-1.png](https://images.drshw.tech/images/notes/84-1.png)



大多数基于Python的Web框架，如Django、Tornado、Flask、Webpy都是在这个范围内进行增删裁剪。例如Tornado用的是自己的异步非阻塞“WSGI”网关接口，Flask则只提供了最精简和基本的框架，Django则是直接使用了现成的WSGI，并实现了大部分功能，提供了大量的应用工具。

### Web应用程序的应用模式

除了本栏目主要讲解的Django和Flask框架以外，目前较为流行的Web程序框架还有：基于Java的SpringBoot、基于PHP的Lavarel、基于Golang的Gin等。

Web应用程序可分为前后端不分离与前后端分离两种应用模式：

#### 前后端不分离

在前后端不分离的应用模式中，前端页面看到的效果都是由后端控制，由后端渲染页面或重定向，也就是后端需要控制前端的展示，前端与后端的**耦合度很高**。

这种应用模式比较适合纯网页应用，但是当后端对接App时，App可能并不需要后端返回一个HTML网页，而仅仅是数据本身，所以后端原本返回网页的接口不再适用于前端App应用，为了对接App后端还需再开发一套接口。

对应的数据交互如下图：

<img src="https://images.drshw.tech/images/notes/1394466-20180916231510365-285933655.png" alt="img" style="zoom:40%;" />

#### 前后端分离

前后端分离是目前较为流行的开发模式。在这种应用模式中，后端仅返回前端所需的数据，不再渲染HTML页面，不再控制前端的效果。至于前端用户看到什么效果，从后端请求的数据如何加载到前端中，都由前端自己决定，网页有网页的处理方式，App有App的处理方式，但无论哪种前端，所需的数据基本相同，后端仅需开发一套逻辑对外提供数据即可。

在前后端分离的应用模式中 ，前端与后端的**耦合度相对较低**。

在前后端分离的应用模式中，我们通常将后端开发的每个视图都称为一个接口，或者API，前端通过访问接口来对数据进行增删改查。

对应的数据交互如下图：

<img src="https://images.drshw.tech/images/notes/1394466-20180916231716242-1862208927.png" alt="img" style="zoom:40%;" />

## Django 简介

![84-2.png](https://images.drshw.tech/images/notes/84-2.png)


Django是一个由Python编写的具有完整架站能力的开源Web框架。使用Django，只要很少的代码，开发人员就可以轻松地完成一个正式网站所需要的大部分内容，并进一步开发出全功能的Web服务。

Django本身基于`MVC`架构，即Model（模型）+View（视图）+ Controller（控制器）设计模式，因此天然具有MVC的出色基因：开发快捷、部署方便、可重用性高、维护成本低等优点。

Django诞生于2003年，2006年加入了BSD许可证，成为开源的Web框架。Django这一词语是根据比利时的爵士音乐家`Django Reinhardt`命名的，含有希望Django能够优雅地演奏（开发）各种乐曲（Web应用）的美好含义，和著名的电影《姜戈的解放》无关。

Django是由美国堪萨斯（Kansas）州Lawrence城中的一个新闻开发小组开发出来的。当时`Lawrence Journal-World`报纸的程序员`Adrian Holovaty`和`Simon Willison`在用 Python 编写Web新闻网站，他们的 `World Online`小组制作并维护了当地的几个新闻站点。新闻界独有的特点是迭代迅速，从开发到上线，通常只有几天或几个小时的时间。为了能在截止时间前完成工作，Adrian和Simon不得不开发一种通用的高效的网络应用开发框架，也就是Django。

2005年的夏天，当这个框架开发完成时，它已经用来制作了很多个`World Online`的站点。不久，小组中的`Jacob Kaplan-Moss`决定把这个框架发布为一个开源软件。短短数年，Django项目就有了数以万计的用户和贡献者，在世界范围内广泛传播。 原来的`World Online`的两个开发者（Adrian and Jacob）仍然掌握着Django，但是其发展方向受社区团队的影响更大。

### Django 的特征

Django具有以下特点：

* Django是一个全栈Web框架。所谓全栈框架，是指除了封装网络和线程操作，还提供HTTP请求和响应、数据库读写管理、HTML模板渲染等一系列功能的框架。你可以不太准确地理解为全栈工程师包办了前后端和数据库访问的所有开发工作，整个网站都是一个人搭建的。
* 功能完善、要素齐全。该有的、可以没有的都有，常用的、不常用的工具都提供。Django提供了大量的特性和工具，无须你自己定义、组合、增删及修改。但是，在有些人眼里这被认为是臃肿不够灵活，发挥不了程序员的能动性。（一体机和DIY你更喜欢哪个？^-^）
* 完善的文档。经过长期的发展和完善，Django有广泛的实践经验和完善的在线文档。开发者遇到问题时可以搜索在线文档寻求解决方案。
* 强大的数据库访问API。Django的Model层自带数据库ORM组件，开发者无须学习其他数据库访问技术（例如SQLALchemy）。当然你也可以使用SQLALchemy，甚至不使用ORM组件。
* 灵活的路由系统。Django具备路由转发、正则表达式、命名空间、URL反向解析等功能。
* 丰富的Template模板功能：Django自带类似jinjia的模板语言，不但原生功能丰富，还可以自定义模板标签和过滤器。并且以类似Python的调用机制和视图默契配合。
* 自带后台管理应用admin：只需要通过简单的几行配置和代码就可以实现一个完整的后台数据管理控制平台。这是Django最受欢迎的功能。
* 完整的错误信息提示：在开发调试过程中如果出现运行错误或者异常，Django可以提供非常完整的错误信息帮助定位问题。


## MVC及MTV设计模式

在目前基于Python语言的几十个Web开发框架中，几乎所有的全栈框架都强制或引导开发者使用MVC设计模式。

### MVC模式说明

**MVC**的核心思想是**分工、解耦**，让不同的代码块之间降低耦合，增强代码的**可扩展性和可移植性**，实现**向后兼容**。

> MVC的全拼为**Model-View-Controller**，最早由TrygveReenskaug在1978年提出，是施乐帕罗奥多研究中心(Xerox PARC)在20世纪80年代为程序语言Smalltalk发明的一种软件设计模式，是为了将传统的输入（input）、处理（processing）、输出（output）任务运用到图形化用户交互模型中而设计的。
>
> 随着标准输入输出设备的出现，开发人员只需要将精力集中在业务逻辑的分析与实现上。后来被推荐为Oracle旗下Sun公司Java EE平台的设计模式，并且受到越来越多的使用ColdFusion和PHP的开发者的欢迎。现在虽然不再使用原来的分工方式，但是这种分工的思想被沿用下来，广泛应用于软件工程中，是一种典型并且应用广泛的软件架构模式。后来，MVC的思想被应用在了Ｗeb开发方面，被称为Ｗeb MVC框架。

处理流程如下图：

<img src="https://images.drshw.tech/images/notes/mvc.png" alt="img" style="zoom:85%;" />

- M全拼为**Model（模型）**，主要封装对数据库层的访问，对数据库中的数据进行增、删、改、查操作；
- V全拼为**View（视图）**，用于封装结果，生成页面展示的HTML内容；
- C全拼为**Controller（控制器）**，用于接收请求，处理业务逻辑，与Model和View交互，返回结果。

这三个部分互相独立，但又相互联系，使得改进和升级界面及用户交互流程，在Web开发过程任务分配时，不需要重写业务逻辑及数据访问代码。

MVC在Python之外的语言中也有广泛应用，例如VC++的MFC，Java的Structs及Spring、C#的.NET开发框架，都非常有名。

### MTV模式说明

MTV和MVC本质上是一样的。

Django对传统的MVC设计模式进行了修改，将视图分成View模块和Template模块两部分，将动态的逻辑处理页面展示分离开。而Model采用了ORM技术，将关系型数据库表抽象成面向对象的Python类，将数据库的表操作转换成Python的类操作，避免了编写复杂的SQL语句。

Django的MTV模型组织可参考下图所示：

![image](https://images.drshw.tech/images/notes/84-3.png)

<img src="https://images.drshw.tech/images/notes/mvt.png" alt="img" style="zoom:85%;" />

- M全拼为Model，与MVC中的M功能相同，负责和数据库交互，进行数据处理；
- V全拼为View，与MVC中的C功能相同，接收请求，进行业务处理，返回应答；
- T全拼为Template，与MVC中的V功能相同，负责封装构造要返回的HTML；
- 与MVC的差异就在于**黑线黑箭头**标识出来的部分。

### 官方文档和资料

- [官方网站](https://www.djangoproject.com/)
- [Github源码](https://github.com/django/django)
- [英文文档](https://docs.djangoproject.com/en/3.1/)
- [中文文档](https://docs.djangoproject.com/zh-hans/2.2/)

## 搭建Django项目

在使用Flask框架时，项目工程目录的组织与创建是需要我们自己手动创建完成的。

在Django中，项目工程目录可以借助Django提供的命令帮助我们创建。

### 创建项目

首先需要安装Django包（暂时先以2.2.6版本为准）：

```bash
pip install django==2.2.6
```

创建工程的命令为：

```bash
django-admin startproject 工程名称
```

例如：想要在桌面的code目录中创建一个名为`bookmanager`的项目工程，可执行如下命令：

```bash
cd ~/Desktop/Code
django-admin startproject bookmanager
```

执行后，会多出一个新目录名为`bookmanager`，此即为新创建的工程目录。

<img src="https://images.drshw.tech/images/notes/CEE6A4797B6D6A57B69E791F9CC655B9.png" alt="img" style="zoom:60%;" />

### 工程目录说明

查看创建的工程目录，结构如下：

<img src="https://images.drshw.tech/images/notes/BFAAB391EB85D5422003CFE5CE5030B4.png" alt="img" style="zoom:50%;" />

- 与项目同名的目录，此处为`bookmanager`；
- `settings.py`是项目的整体配置文件；
- `urls.py`是项目的URL配置文件；
- `wsgi.py`是项目与WSGI兼容的Web服务器入口；
- `manage.py`是项目管理文件，通过它管理项目。

### 运行开发服务器

在开发阶段，为了能够快速预览到开发的效果，Django提供了一个纯Python编写的轻量级Web服务器，仅在开发阶段使用。

**注意**：若要在服务器端运行，需要在`settings.py`中的`ALLOW_HOSTS`中添加服务器IP地址（若是在生产环境部署，则必须指定`ALLOW_HOSTS`）：

<img src="https://images.drshw.tech/images/notes/06E961EE40E24A1F9831DBC83DD1A8DD.png" alt="img" style="zoom:50%;" />

配置后，运行服务器命令如下：

```py
python manage.py runserver [ip:port]
```

默认`ip`是`127.0.0.1`，默认端口为`8000`，一般执行`python manage.py runserver 0:8000`即可。`0` 是 `0.0.0.0` 的简写，Django将运行在`0.0.0.0:8000`上，即整个局域网内都将可以访问站点，而不只是是本机（这其中可能还需要做一些配置和网络测试）。

启动后可见如下信息：

<img src="https://images.drshw.tech/images/notes/FA5EAE6CAEC01B738C11E430E2F7F994.png" alt="img" style="zoom:50%;" />

在浏览器中输入`对应服务器ip:8000`便可看到效果：

<img src="https://images.drshw.tech/images/notes/image-20221022225938899.png" alt="image-20221022225938899" style="zoom:48%;" />

注意：

- Django默认工作在`debug`调试模式下，如果增加、修改、删除文件，服务器会自动重启；

  在`debug`模式下，若发生运行错误，会在页面中显示错误的位置；

  在生产环境部署时，需要退出`debug`模式，即在`settings.py`中将`DEBUG`字段设置为`False`：

  <img src="https://images.drshw.tech/images/notes/image-20221025231001977.png" alt="image-20221025231001977" style="zoom:33%;" />

- 按`Ctrl + C`停止服务器；

- 为了方便调试，后续代码都在**本地编写**，最后同步到服务器即可。

### Django 子应用

在Web应用中，通常有一些业务功能模块是在不同的项目中都可以**复用**的，故在开发中通常将工程项目拆分为不同的子功能模块，各功能模块间可以保持相对的**独立**。在其他工程项目中需要用到某个特定功能模块时，可以将该模块代码整体复制过去，达到复用。

app应用与project项目的区别：

* 一个app实现某个具体功能，比如博客、公共档案数据库或者简单的投票系统；
* 一个project是配置文件和多个app的集合，这些app组合成整个站点；
* 一个project可以包含多个app；
* 一个app可以属于多个project！

在Flask框架中也有类似子功能应用模块的概念，即蓝图`Blueprint`。

Django的视图编写是放在**子应用**中的。

#### 创建

在Django中，创建子应用模块目录仍然可以通过命令来操作，即：

```bash
python3 manage.py startapp 子应用名称
```

`manage.py`为上述创建工程时自动生成的管理文件。

例如，在刚才创建的`bookmanager`工程中，想要创建一个用户`book`子应用模块，可执行：

```bash
cd dj2_poj/bookmanager
python3 manage.py startapp book
```

执行后，可以看到工程目录中多出了一个名为`book`的子目录：

<img src="https://images.drshw.tech/images/notes/image-20221023000623398.png" alt="image-20221023000623398" style="zoom:40%;" />

#### 子应用目录说明

查看此时的工程目录，结构如下：

<img src="https://images.drshw.tech/images/notes/image-20221023000714157.png" alt="image-20221023000714157" style="zoom:40%;" />

- `admin.py`：文件跟网站的后台管理站点配置相关。
- `apps.py`：文件用于配置当前子应用的相关信息。
- `migrations`：目录用于存放数据库迁移历史文件。
- `models.py`：文件用户保存数据库模型类。
- `tests.py`：文件用于开发测试用例，编写单元测试。
- `views.py`：文件用于编写Web应用视图。

#### 注册安装子应用

创建出来的子应用目录文件虽然被放到了工程项目目录中，但是Django工程并不能立即直接使用该子应用，需要注册安装后才能使用。

在工程配置文件`settings.py`中，`INSTALLED_APPS`项保存了工程中已经注册安装的子应用，初始工程中的`INSTALLED_APPS`如下：

<img src="https://images.drshw.tech/images/notes/image-20221023001036726.png" alt="image-20221023001036726" style="zoom:35%;" />

前六个已经写好的应用为Django自动生成的默认子应用：

* `django.contrib.admin`：`admin`管理后台站点；
* `django.contrib.auth`：身份认证系统；
* `django.contrib.contenttypes`：内容类型框架；
* `django.contrib.sessions`：会话框架；
* `django.contrib.messages`：消息框架；
* `django.contrib.staticfiles`：静态文件管理框架。

注册安装一个子应用的方法，即是将子应用的配置信息文件`apps.py`中的 **`Config`类添加到`INSTALLED_APPS`列表** 中。

例如，将刚创建的`book`子应用添加到工程中，可在`INSTALLED_APPS`列表中添加`'book.apps.BookConfig'`：

<img src="https://images.drshw.tech/images/notes/image-20221023001455208.png" alt="image-20221023001455208" style="zoom:35%;" />

即可配置完成。

