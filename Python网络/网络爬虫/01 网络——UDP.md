# 网络——UDP

## 网络通信概述

### 网络是什么

#### H2

##### \(^o^)/~

###### 后



* 网络是一种辅助双方或者多方能够连接在一起的工具

### 使用网络的目的

* 实现多台主机之间的通讯与数据交互

### 网络编程

* 使在不同电脑上的软件能够进行数据传递，即进程上的通信
* 以爬虫为例，我们需要向网站发送**请求**，这种请求的动作就可以被称作网络

## IP地址

#### 什么是IP地址

* 用于标记计算机在的网络中的位置

#### 获取IP的指令

在终端中输入以下指令：

##### * 查看或配置网卡信息 ipconfig(Windows) / ifconfig(Linux)

将获取很多ip地址，可根据电脑的**网络连接方式**（无线(无线局域网适配器)/有线(以太网适配器)/虚拟机(VMxx)/代理 ）来辨别主机真实的网络地址。

一般将**IPv4地址**称为地址。192.168打头的一般为局域网。

![image.png](https://images.maiquer.tech/images/wx/image20220813.png)

##### * 测试远程主机连通性 ping

通常用 ```ping + 域名或IP地址``` 来检测网络是否正常：

![image.png](https://images.maiquer.tech/images/wx/image220220813.png)

## 端口

#### 端口和端口号

* 一个程序在操作系统中一旦运行，当前的操作系统就会开始一个**进程**，同时占用一些系统资源。
* 这些系统资源不仅包括内存、CPU和一些其它硬件，也包括一个**端口**。
* 这个端口用于**数据的接收与发送**，且具有一个**唯一的编号**，即**端口号**，用于**定位进程**。
* 一个网络程序在运行的过程中，端口号会唯一标识这个程序。如果其他电脑上的网络程序如果想要向此程序发送数据，向端口号标识的程序发送即可；
* IP地址仅能实现主机间的通讯，而IP地址+端口号可实现主机中程序之间的相互通信。

#### 端口号的范围

* 在一台主机上，端口号的数量是**有限**的。
* IPv4的端口资源有 0~65535 共 65536(2^16) 个，从0开始计数。

#### 常用端口

1. **80端口**：用于网站服务
2. **22端口**：用于远程链接(SSH)
3. **21端口**：用于上传下载文件(FTP)
4. 3306端口：用于数据库交互(MySQL服务器)
5. 443端口：用于https协议

## Socket 简介

### 不同电脑上的进程如何通信

首先要解决的问题是如何唯一标识一个进程，否则通信无从谈起！

在一台电脑上可以通过进程号(pid)来唯一标识一个进程，但这在网络中是行不通的。

在网络中，需要使用IP地址、协议和端口来标识网络进程。

### 常用指令

在 `linux`系统中：

* ```ps``` 指令 可查询所有的PID与其对应的进程名称：

  ![image.png](https://images.maiquer.tech/images/wx/image320220813.png)
  
* ```kill -9 (PID名称)```可强制终止某个进程：
  演示：
  开启另一个终端，使用ping命令开启一个ping进程：
  
  ![image.png](https://images.maiquer.tech/images/wx/image420220813.png)
  
  通过`ps`指令可看出新增了一个`ping`进程，进程号为`116`
  
  ![image.png](https://images.maiquer.tech/images/wx/image520220813.png)
  
  输入`kill -9 116`，再查看进程发现，该进程已消失。
  
  ![image.png](https://images.maiquer.tech/images/wx/image620220813.png)
  
  同时在另一终端中，也会有进程被杀死的提示：
  
  ![image.png](https://images.maiquer.tech/images/wx/image820220813.png)

### 什么是 Socket

Socket(套接字)是进程间的通信方式之一，它与其他进程间通信的一个主要不同是：

* 它能实现不同主机间的**进程间通信**，网络上各种各样的服务大多都是基于Socket来完成通信的

### 创建Socket

在Python中使用`socket`模块的`socket`函数就可以完成：

```python
import socket

socket.socket(AddressFamily, Type)
```

两个参数：

* `AddressFamliy`：可选择`AF_INET`(用于Internet进程间通信)或者`AF_UNIX`(用于一台机器进程间通信)，实际工作中常用`AF_INET`，这也是默认值；
* `Type`：套接字类型，可以是`SOCKET_STREAM`(流式套接字，主要用于**TCP**协议)或者`SOCK_DGRAM`(数据报套接字，主要用于**UDP**协议)，默认为`SOCK_STREAM`。

比如，创建一个 **UDP** socket的代码如下：

```python
import socket

udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
```

创建一个 **TCP** socket的代码如下：

```python
import socket

tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# 全部省略也可以
tcp_socket = socket.socket()
```

可以通过调用套接字的`close()`方法关闭套接字：

```python
udp_socket.close()
```

## UDP 简介

UDP，数据报协议（User Datagram Protocol ），是一种用来实现网络通信的，**面向无连接的**、**不可靠**的传输层通信协议。

所谓面向**无连接**，就是两主机之间无需建立连接线路，直接互相发送数据包，例如发短信。

而面向**连接**的通信协议，两主机间需要建立可靠的通信链路才能开始进行通信，如打电话，先要拨通，才能开始讲话。

由于UDP无连接的特性，其**可靠性较差**（无确定的通信链路，可能会丢包 ），但**传输效率较高**（不需要事先建立可靠连接，随发随收 ）。

鉴于此，我们称UDP提供**无连接不可靠**的服务。（若想详细了解，可以学一下**计算机网络**这门课 ）

在Python中，要想基于UDP协议在主机间传输数据是很容易的，下面作详细介绍。

## UDP网络程序-发送/接收数据

### UDP的通信流程

创建一个基于UDP的网络程序流程很容易，具体步骤如下：

1.   创建客户端套接字
2.   发送/接收数据
3.   关闭套接字

于是，其通信流程如下：

<img src="https://images.maiquer.tech/images/wx/image-20220809020718389.png" alt="image-20220806174825513" style="zoom:50%;" />

客户端（client ）：就是需要被服务的一方；

服务器端（server ）：就是提供服务的一方。

### 发送和接收数据

发送数据可使用`sendto()`方法，格式为：`sendto(二进制数据, 目的地址元组)`；

其中二进制数据由目标字符串编码而来，目的地址元组包括**目的IP**和**端口号**。

接收数据可使用`recvfrom()`方法，格式为：`recvfrom(最大字节数)`；

传入一个最大字节数，代表最多能接收的字节。接收到的数据是一个元组，第一个元素为二进制数据，第二个为目的地址元组。

于是，根据流程图，UDP发送与接收数据的代码如下：

```python
from socket import *

# 1. 创建udp套接字
udp_socket = socket(AF_INET, SOCK_DGRAM)

# 2. 准备接收方的地址和端口号(地址可通过ipconfig/ifconfig获取)
dest_addr = ('192.168.236.129', 8080)

# 3. 从键盘获取数据
send_data = input("请输入要发送的数据:")

# 4. 发送数据到指定的电脑上
udp_socket.sendto(send_data.encode('utf-8'), dest_addr)

# 5. 等待接收对方发送的数据
recv_data = udp_socket.recvfrom(1024)  # 1024表示本次接收的最大字节数

# 6. 显示对方发送的数据
print(recv_data[0].decode('gbk'))
print(recv_data[1])

# 7. 关闭套接字
udp_socket.close()
```

## UDP绑定端口问题

### 绑定端口号的作用

+ 一个UDP网络程序，可以不绑定运行端口，此时操作系统会**随机分配**一个端口，如果重新运行此程序端口**可能会发生变化**；
+ 一个UDP网络程序，也可以绑定信息（IP地址，端口号 ），如果绑定成功，那么操作系统就直接利用该端口号，分辨收到的网络数据是否属于此进程

### UDP绑定信息

 一般情况下，在一台电脑上运行的网络程序有很多，为了不与其他的网络程序占用同一个端口号，往往在编程中，UDP的端口号一般不绑定。但是如果需要做成一个服务器端的程序的话，是需要绑定的，想想看这又是为什么呢？ 

服务器端程序好比一个“警察局”，客户端需要通过不断联系“警察局”获取信息。如果“报警电话”每天都在变，想必世界就会乱了。所以一般**服务性的程序**，往往需要一个固定的端口号，这就是所谓的端口绑定。

我们可以使用`socket`对象的`bind()`方法进行端口绑定，传入一个元组，包括**本机IP**和**要绑定的端口号**，本机IP选取任一个即可，一般直接用空字符串代替，示例：

```python
local_addr = ('', 7788)
udp_socket.bind(local_addr)	# 绑定本机的7788端口
```

## 案例：UDP聊天器

目的：实现一个聊天器，可以实现：

+ 键盘输入对方的IP和端口进行传输；

+ 获取键盘数据，并将数据发送给对方； 

+ 接收数据并显示；
+ 创建两个线程，分别执行以上两个功能。

代码如下：

```python
import socket
import threading


def recv_msg(udp_socket):
    """ 接收数据并显示，参数为套接字 """

    # 接收数据
    while True:
        recv_data = udp_socket.recvfrom(1024)
        print(recv_data)


def send_msg(udp_socket, dest_ip, dest_port):
    """ 发送数据，参数为套接字，目的IP，目的端口 """
    # 发送数据
    while True:
        send_data = input("输入要发送的数据:")
        udp_socket.sendto(send_data.encode("utf-8"), (dest_ip, dest_port))


def main():
    """完成udp聊天器的整体控制"""

    # 1. 创建套接字
    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    # 2. 绑定本地信息
    udp_socket.bind(("", 7890))

    # 3. 获取对方的ip
    dest_ip = input("请输入对方的ip:")
    dest_port = int(input("请输入对方的port:"))

    # 4. 创建2个线程，传入参数，去执行相应的功能
    t_recv = threading.Thread(target=recv_msg, args=(udp_socket,))
    t_send = threading.Thread(target=send_msg, args=(udp_socket, dest_ip, dest_port))

    t_recv.start()
    t_send.start()


if __name__ == "__main__":
    main()
```

在同一局域网下的两台设备下运行这段程序，即可实现。
