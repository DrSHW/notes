# 2 Django 基本流程

注：从本节开始，每节完整代码将同步到[`git`仓库](https://github.com/DrSHW/django-tutorial)的`main`分支供读者参阅。

在上节中，我们介绍了Django项目的搭建与项目的文件结构。本节中我们将熟悉Django与数据库和浏览器交互的基本流程。

## 模型

在上节中，我们提到了模型`Model`——它是与数据库交互的模块。

目前主流的，由面向对象语言编写Web框架，大部分情况不直接使用原生的SQL语句与数据库交互，而是使用**对象关系映射**（Object Relational Mapping，简称**ORM**）技术与数据库交互，Django也不例外。我们先讲讲ORM。

### Django ORM 概述

ORM用于实现面向对象编程语言里不同类型系统的数据之间的转换，从而间接与数据库进行交互。

ORM 在业务逻辑层和数据库层之间充当了**桥梁**的作用，它通过使用描述对象和数据库之间的映射的元数据，将程序中的**对象**自动持久化到**数据库**中：

<img src="https://images.drshw.tech/images/notes/image-20221024205849495.png" alt="image-20221024205849495" style="zoom:50%;" />

<img src="https://images.drshw.tech/images/notes/image-20221024210637052.png" alt="image-20221024210637052" style="zoom:50%;" />

ORM 解析过程:

1. ORM 会将 Python 代码**转成为 SQL 语句**；
2. SQL 语句通过**数据库引擎**（如`mysqlclient`）传送到数据库服务端；
3. 在数据库中**执行 SQL 语句**并将结果返回。

使用 ORM 的好处：

- 提高开发效率；
- 不同数据库可以平滑切换。

使用 ORM 的缺点：

- ORM 代码转换为 SQL 语句时，需要花费一定的时间，执行效率会有所降低。

### 编写`models.py`

我们需要在`models.py`中编写一些类，作为MySQL数据表的映射，这些类需要**继承`django.db`模块中的`models.Model`类**。

加入我们要定义一个图书数据表，其中的字段声明使用`SQL`语言描述如下：

```sql
CREATE TABLE "book_book"(
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
    "title" varchar(100) NOT NULL, 
    "author" varchar(100) NOT NULL, 
    "price" decimal(5, 2) NOT NULL, 
    "pages" integer NOT NULL, 
    "pubdate" date NOT NULL);
```

对应的类可以这样编写：

```python
from django.db import models

# Create your models here.
class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=5, decimal_places=2)
    pages = models.IntegerField()
    pubdate = models.DateField()
```

其中：

+ Django的ORM会自动填充主键`id`，无需手动编写；
+ 数据字段默认非空；
+ `models.CharField(max_length=n)`对应`varchar(n)`；
+ `models.IntegerField()`对应`integer`；
+ `models.DecimalField(max_digits=m, decimal_places=n)`对应`decimal(n, m)`；
+ `models.DateField()`对应`date`。

限于篇幅，更详细的ORM操作会在下一节讲解，本节只是简单的介绍，熟悉流程即可。

### 模型迁移

编写完`models.py`后，需要将其进行迁移才能生效，需要执行下方指令：

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

执行第一条指令后，会在对应应用文件夹下新建一个文件：

<img src="https://images.drshw.tech/images/notes/image-20221024215749952.png" alt="image-20221024215749952" style="zoom:33%;" />

通过运行`makemigrations`命令，Django 会检测你对模型文件的修改，也就是告诉Django你对模型有改动，并且你想把这些改动保存为一个“`迁移(migration)`”，即上方的文件。

`migrate`命令会对所有还未实施的迁移记录进行操作，本质上就是将你对模型的修改体现到数据库中具体的表中。Django通过一张叫做`django_migrations`的表，记录并跟踪已经实施的`migrate`动作，通过对比获得哪些迁移尚未提交。

迁移的功能非常强大，允许你随时修改你的模型，而不需要删除或者新建你的数据库或数据表，在不丢失数据的同时，实时动态更新数据库。我们将在后面的章节对此进行深入的阐述，但是现在，只需要记住**修改模型时的操作分三步**：

* 在`models.py`中修改模型；
* 运行`python manage.py makemigrations`为改动创建迁移记录文件；
* 运行`python manage.py migrate`，将操作同步到数据库。

之所以要将创建和实施迁移的动作分成两个命令两步走是因为你也许要通过版本控制系统（例如github，svn）提交你的项目代码，如果没有一个中间过程的保存文件（migrations），那么github如何知道以及记录、同步、实施你所进行过的模型修改动作呢？毕竟，github不和数据库直接打交道，也没法和你本地的数据库通信。但是分开之后，你只需要将你的migration文件（例如上面的0001）上传到github，它就会知道一切。

执行第二条指令后，程序将根据`迁移文件`，生成`SQL`语句， 对数据库执行真正的迁移动作。

执行后会创建一个`db.sqlite3`文件，`sqlite`是Django使用的默认数据库。

![image-20221024220408151](https://images.drshw.tech/images/notes/image-20221024220408151.png)

尝试将其导入Navicat：

<img src="https://images.drshw.tech/images/notes/image-20221024220750714.png" alt="image-20221024220750714" style="zoom:35%;" />

连接后发现有一些数据表：

<img src="https://images.drshw.tech/images/notes/image-20221024220714723.png" alt="image-20221024220714723" style="zoom:35%;" />

其中我们定义的数据表为`book_book`（表的默认名称为`应用名_模型名`，欲更改可设置`Meta`内部类，后面会讲），其余的都是Django默认应用中的。再看我们定义的数据表`book_book`：

<img src="https://images.drshw.tech/images/notes/image-20221024220952690.png" alt="image-20221024220952690" style="zoom:40%;" />

字段都是我们指定的，且`id`主键也默认添加了。

## 站点管理
### Django admin

很多时候，我们不光要开发针对客户使用的前端页面，还要给后台管理人员提供相应的管理界面。但是大多数时候为你的团队或客户编写用于增加、修改和删除内容的后台管理站点是一件非常乏味的工作，并且没有多少创造性，需要花不少的时间和精力。

Django最大的优点之一，就是体贴的为你提供了一个基于项目model创建的一个后台管理站点admin。这个界面只给站点管理员使用，并不对大众开放。虽然admin的界面可能不是那么美观，功能不是那么强大，内容不一定符合你的要求，但是它是免费的、现成的，并且还是可定制的，有完善的帮助文档，那么，你还要什么自行车？

（如果你对admin的界面美观有切实需求，可以尝试使用simpleui库，不要用xadmin）

启动服务后，可以通过`域名(ip)[:port]/admin`即可进入：

<img src="https://images.drshw.tech/images/notes/image-20221024221524972.png" alt="image-20221024221524972" style="zoom:45%;" />

使用之前，需要创建一个超级管理员账号，执行：

```bash
python3 manage.py createsuperuser
```

输入账号密码等参数即可：

<img src="https://images.drshw.tech/images/notes/image-20221024222157450.png" alt="image-20221024222157450" style="zoom:90%;" />

注意：Django1.10版本后，超级用户的密码要求具备一定的复杂性，如果密码强度不够，Django会提示你，但是可以强制通过。

启动服务，输入账号密码即可进入`admin`界面：

<img src="https://images.drshw.tech/images/notes/image-20221024223031749.png" alt="image-20221024223031749" style="zoom:45%;" />

### 本地化和数据管理

若要更改界面显示的语言，时区，可以修改`settings.py`中的`LANGUAGE_MODE`和`TIME_ZONE`字段（下例中设置语言为中文，时区为东八区时）：

![image-20221024223540520](https://images.drshw.tech/images/notes/image-20221024223540520.png)

可以在`admin.py`中将自定义模型，注册到`admin`后台管理。

先从模型导入对应的类，再通过`admin.site.register(字段名)`注册需要的字段，例如注册`Book`模型：

![image-20221024224109711](https://images.drshw.tech/images/notes/image-20221024224109711.png)

注册后即可在后台中看到对应模型：

<img src="https://images.drshw.tech/images/notes/image-20221024224545846.png" alt="image-20221024224545846" style="zoom:80%;" />

进入后，点击增加`Book`即可添加数据记录：

![image-20221024224921992](https://images.drshw.tech/images/notes/image-20221024224921992.png)

![image-20221024225159784](https://images.drshw.tech/images/notes/image-20221024225159784.png)

![image-20221024225320349](https://images.drshw.tech/images/notes/image-20221024225320349.png)

此时该数据记录为默认命名；若想让数据 以数据记录中的某字段（例如书名`title`）命名，需要在模型中（即`models.py`中编写的类）定义`__str__()`魔术方法：

![image-20221024224804914](https://images.drshw.tech/images/notes/image-20221024224804914.png)

设置后，显示的数据记录的名称就是书名了：

![image-20221024225831872](https://images.drshw.tech/images/notes/image-20221024225831872.png)

若想给字段赋予别名，需要在模型类定义字段时，加上`verbose_name`参数：

![image-20221024230021909](https://images.drshw.tech/images/notes/image-20221024230021909.png)

效果：

![image-20221024230103469](https://images.drshw.tech/images/notes/image-20221024230103469.png)

若想修改**后台站点显示的**模型名称（如上方的`Book`；此处仅修改后台显示，而非修改数据表名称），需要定义一个内部类`Meta`，其中有`verbose_name`属性和`verbose_name_plural`属性：前者的值代表模型单数形式的别名，后者的值代表模型复数形式的别名（默认为单数形式+s，即英语语法）；若要修改数据表名称，在`Meta`加入并指定`db_table`的值即可：

![image-20221024230427320](https://images.drshw.tech/images/notes/image-20221024230427320.png)

效果：

![image-20221024230507564](https://images.drshw.tech/images/notes/image-20221024230507564.png)

若想修改应用名称的显示，可在`app.py`中的`xxConfig`类中修改（此处以修改`BookConfig`为例），类中添加`verbose_name`成员即可配置别名：

![image-20221024230822221](https://images.drshw.tech/images/notes/image-20221024230822221.png)

效果：

![image-20221024230737980](https://images.drshw.tech/images/notes/image-20221024230737980.png)

### 修改默认数据源

我们知道Django中使用的默认数据源为`sqlite`，我们可以将其修改为稳定性更好、更受欢迎的`MySQL`数据库，在`settings.py`中修改`DATABASES`即可：

![image-20221024231341857](https://images.drshw.tech/images/notes/image-20221024231341857.png)

配置后再次启动，会报错：

![image-20221024231547907](https://images.drshw.tech/images/notes/image-20221024231547907.png)

提示我们还没有安装一个数据库引擎，在这里可以安装`mysqlclient`和`pymysql`（更推荐前者，因为**后者在Django3中不再支持**）：

```bash
pip install mysqlclient
```

安装后，重新进行**模型迁移**即可正常访问。

## 视图和URL

### 处理流程概述

视图View是用于**接收请求，业务处理，返回响应**的模块，以函数的形式定义在`views.py`文件中。

对于Django的设计框架MVT：

+ 用户在URL中请求的是视图；
+ 视图接收请求后进行处理，并将处理的结果返回给请求者。

使用视图时需要进行两步操作：

1. **定义视图**；
2. **配置URLConf**。

### 定义视图

视图函数的第一个参数是`HttpRequest`类型的对象`reqeust`，包含了所有**请求信息**（包括`headers`、`session`、`cookie`）；必须返回`HttpResponse对象`，包含返回给请求者的**响应信息**。

试着在`book`应用文件夹下的`views.py`中定义一个视图如下：

<img src="https://images.drshw.tech/images/notes/image-20221025221904587.png" alt="image-20221025221904587" style="zoom:33%;" />

定义了函数`index`，传入一个参数`request`；导入了`HttpResponse`作为响应，类似的还有`JsonResponse`，我们在以后的小节中会详细介绍。

### 配置URLConf

定义好视图后，浏览器会根据**路由**查找到对应的视图，需要经历以下步骤：

1. 请求者在浏览器地址栏中输入URL, 请求到网站；

2. 网站获取URL信息；

3. 然后与编写好的URLConf逐条匹配；

4. 如果匹配成功则调用对应的视图；

5. 如果所有的URLConf都没有匹配成功，则返回404请求异常报告。

   <img src="https://images.drshw.tech/images/notes/%E6%9F%A5%E6%89%BE%E8%A7%86%E5%9B%BE.png" alt="img" style="zoom:80%;" />

在Django中，URLConf是支持正则匹配的，匹配过程：

<img src="https://images.drshw.tech/images/notes/url_xmind.png" alt="img" style="zoom: 67%;" />

在`settings.py`中，可通过修改`ROOT_URLCONF`字段值来修改**主路由**的配置文件地址：

<img src="https://images.drshw.tech/images/notes/image-20221025222811796.png" alt="image-20221025222811796" style="zoom:33%;" />

URLConf以`urlpatterns`列表的形式表示，列表的每个元素都是一个`path`对象，由`path()`或`re_path()`方法返回。

#### path 方法

`path()`方法可以接收4个参数，其中前2个是必须的：`route`和`view`，以及2个可选的参数：`kwargs`和`name`。

+ `route`

  `route` 是一个匹配 URL 的准则（类似正则表达式）。当 Django 响应一个请求时，它会从 urlpatterns 的第一项path开始，按顺序依次匹配列表中的项，直到找到匹配的项，然后执行该条目映射的视图函数或下级路由，其后的条目将不再继续匹配。因此，url路由执行的是短路机制，`path`的编写顺序非常重要！

  需要注意的是，route不会匹配 GET 和 POST 参数或域名。例如，URLConf 在处理请求 `https://xxx.com/api/ `时，它会尝试匹配 `api/ `。处理请求 `https://www.xxx.com/api/?page=3` 时，也只会尝试匹配 `api/`。

+ `view`

  `view`指的是处理当前url请求的视图函数。当Django匹配到某个路由条目时，自动将封装的`HttpRequest`对象作为第一个参数，被“捕获”的参数以关键字参数的形式，传递给该条目指定的视图`view`。

+ `kwargs`

  可选。任意数量的关键字参数可以作为一个字典传递给目标视图。

+ `name`

  可选。对你的URL进行命名，让你能够在Django的任意处，尤其是模板内显式地引用它。这是一个非常强大的功能，相当于给URL取了个全局变量名，不会将url匹配地址写死。

我们需要在应用（`book`）文件夹下新建一个文件`urls.py`，通过URLConf保存应用的**子路由信息**与视图的映射关系，代码如下：

```python
from django.urls import path
from .views import index	# 导入视图函数index

urlpatterns = [
    path('home/', index),	# 子路由home对应的视图函数index 
]
```

还需要在项目文件夹（`bookmanager`）下的`urls.py`中编写**主路由**信息，通过`django.urls`中的`include`函数即可：

<img src="https://images.drshw.tech/images/notes/image-20221025222044952.png" alt="image-20221025222044952" style="zoom:33%;" />

此时在启动的服务中，在`book/home/`路由下返回了视图作出的响应：

![image-20221025222145038](https://images.drshw.tech/images/notes/image-20221025222145038.png)

#### re_path 方法

传参和匹配过程与`path()`方法基本一致，唯一不同的一点就是支持正则匹配路由。

其`route`属性应当为一个正则表达式串（`^`开头，`$`结尾），例如要匹配手机号对应的路由，在`urlpatterns`中这样定义即可：

```python
re_path(r'^1[3-9]\d{9}$', match_phone)	# 假定视图函数为match_phone，1[3-9]\d{9}为正则匹配规则
```

总而言之，视图的处理过程如下图：

<img src="https://images.drshw.tech/images/notes/url.png" alt="img" style="zoom:80%;" />

## 模板和静态资源配置（了解）

### 简介与配置

在前后端**不分离**的开发模式中，需要使用**模板**渲染HTML页面，与对应的CSS和JS。

在`settings.py`中的`TEMPLATES`中可对其进行配置，其中需要修改`DIRS`字段如下：

<img src="https://images.drshw.tech/images/notes/image-20221025223809876.png" alt="image-20221025223809876" style="zoom: 33%;" />

这代表我们需要将模板文件写在项目根目录中的`templates`文件夹中（需要新建`templates`文件夹）。

由于一个项目通常会包含很多应用，我们需要建立子文件夹，对各应用的模板进行区分，此处就建立`book`文件夹，其中就可以编写HTML代码了。

### 编写模板

在`book`文件夹中新建`index.html`，编写代码如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Manager</title>
</head>
<body>
    <h1 style="color: red">Book Manager</h1>
    <p>Book List:</p>
    <ul>
        <li>轻运维笔记</li>
    </ul>
</body>
</html>
```

再编写路由以及对应的视图：

`book/views.py`：需要使用`django.shortcuts`中的`render`函数，传入请求信息`request`，和文件路径即可。这里的文件路径形式为源文件在`templates`文件夹下的子路径：

<img src="https://images.drshw.tech/images/notes/image-20221025232734960.png" alt="image-20221025232734960" style="zoom: 33%;" />

`book/urls.py`：

<img src="https://images.drshw.tech/images/notes/image-20221025232154564.png" alt="image-20221025232154564" style="zoom:33%;" />

在路由`book/index/`下，视图将返回编写的HTML页面，并由浏览器进行渲染：

![image-20221025232428811](https://images.drshw.tech/images/notes/image-20221025232428811.png)

视图也可以通过`render`函数的`context`属性，向需要返回的模板传值（可以是一个**字典**）；在模板中，可使用双花括号：`{{ 传入值的键名 }}`的形式，渲染键名对应的值，例如:

+ 模板文件更改：

  ```html
  ...
  <body>
      <h1 style="color: red">Book Manager</h1>
      <p>Book List:</p>
      <ul>
          <li>{{ title }}</li>	<!-- 渲染对应键的值 -->
      </ul>
  </body>
  ...
  ```

+ 视图文件更改：

  <img src="https://images.drshw.tech/images/notes/image-20221025234112191.png" alt="image-20221025234112191" style="zoom:33%;" />

渲染效果一致。

当然，它也支持先进的`for`循环，示例：

+ 模板文件更改：

  ```html
  ...
  <body>
      <h1 style="color: red">Book Manager</h1>
      <p>Book List:</p>
      <ul>
          {% for book in books %}
              <li>{{ book }}</li>
          {% endfor %}
      </ul>
  </body>
  ...
  ```

+ 视图文件更改：

  <img src="https://images.drshw.tech/images/notes/image-20221025234525438.png" alt="image-20221025234525438" style="zoom:33%;" />

+ 效果：

  ![image-20221025234553639](https://images.drshw.tech/images/notes/image-20221025234553639.png)

### 静态资源配置

模板通常会依赖一些静态资源文件，如图片，JS等。可在`settings.py`中新增`STATICFILES_DIR`字段，对文件夹路径进行配置：

<img src="https://images.drshw.tech/images/notes/image-20221026002246850.png" alt="image-20221026002246850" style="zoom:33%;" />

上图中的配置代表将项目根路径下的`static`文件夹设为静态资源的根路径（需要新建`static`文件夹）。

我们在`static`文件夹下建立`book`应用文件夹，再在`book`下建立`img`文件夹，用于保存图片（这里以图片为例，其它种类的静态资源也是一样的），并添加一张图片`main.jpg`；此时，通过路由`static/book/imgs/main.jpg`（即静态资源地址）即可访问此图片：

<img src="https://images.drshw.tech/images/notes/image-20221026002345926.png" alt="image-20221026002345926" style="zoom: 45%;" />

也可通过标签属性`src="{% static 静态资源路径 %}"`进行资源的渲染（路径格式为资源在`static`文件夹下的子路径），例如修改模板`index.html`如下：

```html
<!DOCTYPE html>
{% load staticfiles %} <!-- Django 3.x版本及以上应改为 {% load static %} -->
<html lang="en">
...
<body>
    <h1 style="color: red">Book Manager</h1>
    <p>Book List:</p>
    <ul>
        {% for book in books %}
            <li>{{ book }}</li>
        {% endfor %}
    </ul>
    <img src="{% static 'book/imgs/main.jpg' %}" alt=""/>
</body>
...
```

效果：

<img src="https://images.drshw.tech/images/notes/image-20221026002303367.png" alt="image-20221026002303367" style="zoom:50%;" />