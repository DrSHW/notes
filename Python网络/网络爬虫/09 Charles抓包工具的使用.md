# Charles抓包工具的使用

## 简介和主要功能

 Charles（青花瓷 ）是一款基于Http协议的代理服务器 通过成为代理，截取请求和响应达到分析抓包的目的

Charles 主要的功能和使用场景包括：

1. **截取 HTTP 和 HTTPS 网络封包；**
2. 支持**重发网络请求**，方便后端调试；
3. 支持修改网络请求参数；
4. 支持网络请求的截获并动态修改。

## 什么是抓包

**抓包**（packet capture ）就是将网络传输发送与接收的数据包进行截获、重发、编辑、转存等操作。也用来检测网络安全。抓包也经常被用来进行数据截取等。

## 准备工作

### 软件安装

官方下载：<https://www.charlesproxy.com/latest-release/download.do>

### 软件破解

未破解的情况下一天只能用30分钟，使用以下工具进行破解：

破解工具：https://www.zzzmode.com/mytools/charles/

请确保已经正确安装 Charles 并开启了代理服务。

若要监听手机中的发包，需将手机和 Charles 处于同一个局域网下，设置好 Charles 代理和 CharlesCA 证书，另外需要开启 SSL 监听（设置方法见下文 ）。

## 抓包原理

首先 Charles 运行在自己的 PC 上，Charles 运行的时候会在 PC 的 8888 端口开启一个代理服务，这个服务实际上是一个 HTTP/HTTPS 的代理。

![image](https://images.drshw.tech/images/notes/20200921192339473.png)

主要流程如下：

1. 客户端发请求

2. charles 接收再发送给服务端

3. 服务端返回请求结果给charles

4. 由charles转发给客户端

## 抓包

### 初始界面

初始状态下 Charles 的运行界面如图所示：

<img src="https://images.drshw.tech/images/notes/image-20220807205013735.png" alt="image-20220807205013735" style="zoom:67%;" />

+ Sequence视图是根据时间来进行排序的，如上图所示，可以通过时间节点来找到返回数据；
+ Structure视图可以通过左侧的地址栏，找到你想看的网址的包；
+ Filter 功能，可以输入关键字来快速筛选出 URL 中带指定关键字的网络请求。

### 快捷工具

![image-20220807213910173](https://images.drshw.tech/images/notes/image-20220807213910173.png)

### 界面功能介绍

#### Contents

参数及意义如下图：

![在这里插入图片描述](https://images.drshw.tech/images/notes/20200930143117650.png)

![在这里插入图片描述](https://images.drshw.tech/images/notes/20200930143144436.png)

#### Summary

参数及意义如下图：

![在这里插入图片描述](https://images.drshw.tech/images/notes/20200930144831113.png)

## PC端HTTPS配置

### 端口监听

打开 Charles 软件，在 proxy -> proxy Setting 中，可以看到 HTTP 的默认监听端口是`8888`，建议将其改为`8889`。并且可以看到在第三个页签中是 windows 窗口，用于监听当前 windows 系统的请求抓包，如下图：

<img src="https://images.drshw.tech/images/notes/image-20220807205301198.png" alt="image-20220807205301198" style="zoom:80%;" />

### 添加HTTPS端口监听

按如下图的方式配置即可：

<img src="https://images.drshw.tech/images/notes/image-20220807205407574.png" alt="image-20220807205407574" style="zoom: 80%;" />

### 证书（重要）

想要在 PC 上通过抓包软件，抓取网站请求相关数据包，需要导入相应的 Charles 证书，否则校验不通过会给出安全警告，必须安装 Charles 的证书后才能进行正常访问。

+ 安卓7以下
  + HTTP，直接配置代理。
  + HTTPS，直接安装证书。

下载证书保存到浏览器根目录：

<img src="https://images.drshw.tech/images/notes/12861759-886a4cf6ebbbde2f.png" alt="img" style="zoom:80%;" />

![img](https://images.drshw.tech/images/notes/12861759-15eca07692c21f42.png)

![img](https://images.drshw.tech/images/notes/12861759-49350fae1201d4f7.png)

![img](https://images.drshw.tech/images/notes/12861759-55c8ca710a3d7d1c.png)

![img](https://images.drshw.tech/images/notes/12861759-1fd844d1dc1e2c8f.png)

![img](https://images.drshw.tech/images/notes/12861759-daf807092e03dd77.png)

![img](https://images.drshw.tech/images/notes/12861759-5276527aabe9dbd0.png)

安装证书后，在浏览器的设置中搜索证书，根据向导可在**管理证书**中找到刚刚导入的证书（名为`Charles Proxy CA`）：

![image-20220826193228519](https://images.drshw.tech/images/notes/image-20220826193228519.png)

![image-20220826194956246](https://images.drshw.tech/images/notes/image-20220826194956246.png)

![image-20220826195038843](https://images.drshw.tech/images/notes/image-20220826195038843.png)

若成功查找到了该项，则说明证书导入成功。

## 高级玩法

### 重放攻击

选中一个被截获的数据包，将其重新发送给目的服务器，次数可自定义。

可以使用它，来测试 API 地址对于反爬虫参数的时间效率。

![image-20220807210221763](https://images.drshw.tech/images/notes/image-20220807210221763.png)

参数含义：

迭代`m`：每次发送`m`个数据包。

并发`n`：开`n`条线程，每条线程都会发送`m`个数据包。

### 重定向页面

**作用：** 可以拦截A地址数据，返回B地址数据，也可以修改参数和返回数据参数。

来看一个案例，地址： http://zb.yfb.qianlima.com/yfbsemsite/mesinfo/zbpglist 。

先给当前地址选择断点：

![image-20220807212210755](https://images.drshw.tech/images/notes/image-20220807212210755.png)

添加完成后刷新网站，直接进入包中：

<img src="https://images.drshw.tech/images/notes/image-20220826202622479.png" alt="image-20220826202622479" style="zoom:33%;" />

<img src="https://images.drshw.tech/images/notes/image-20220826203425670.png" alt="image-20220826203425670" style="zoom: 50%;" />

<img src="https://images.drshw.tech/images/notes/image-20220826203645145.png" alt="image-20220826203645145" style="zoom: 33%;" />

即可对请求头、Cookies与`html`源代码进行修改。

### 文件替换

一般用与网站`js`， 比如无限`debugger`或者高度混淆代码替换。

<img src="https://images.drshw.tech/images/notes/image-20220826204450169.png" alt="image-20220826204450169" style="zoom:33%;" />

`Host`一项中填写域名，`Path`即为网站域名后的部分，`Local path`则为要替换文件的地址。

例如，我们想要把网站（还是上面的网址）中的CSS替换为本地的：

![image-20220826205741566](https://images.drshw.tech/images/notes/image-20220826205741566.png)

先在浏览器中查找这个包的信息，找到其服务器资源路径

![image-20220826205436577](https://images.drshw.tech/images/notes/image-20220826205436577.png)

填写信息，注意需要勾选`Case-sensitive`：

<img src="https://images.drshw.tech/images/notes/image-20220826205839060.png" alt="image-20220826205839060" style="zoom:50%;" />

点击OK即可进行替换。（其实在浏览器的`devtools`中也可进行替换，在**`js`逆向**专题中会详细讲解）
