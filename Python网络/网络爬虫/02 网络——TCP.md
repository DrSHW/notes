# 网络——TCP

## TCP 简介

### 认识 TCP

TCP协议，传输控制协议（Transmission Control Protocol ），是一种**面向连接的**、**可靠的**传输层通信协议。

在上节中我们提到了面向连接，由于TCP面向连接的特性，在通信开始之前，一定要先建立相关的链接，才能发送数据。

TCP的通信需要经过**创建连接、数据传送、终止连接**三个步骤。

### TCP特点 

1. **面向连接** 

   通信双方必须**先建立连接**才能进行数据的传输，双方都必须为该连接**分配必要的系统内核资源**，以管理连接的状态和连接上的传输。 双方间的数据传输都可以通过这一个连接进行。 完成数据交换后，双方必须**断开此连接**，以释放系统资源。 这种连接是**一对一**的，因此TCP不适用于广播的应用程序，基于广播的应用程序请使用UDP协议。

   （广播即一台计算机发出数据包，使与其在同一广播域中的**所有主机**都接收到该数据包 ）

2. **可靠传输** 

   **1 ）TCP采用发送应答机制**

   ​	    TCP发送的每个报文段都必须得到接收方的应答，才认为这个TCP报文段传输成功。

   **2 ）超时重传** 

   ​	    发送端发出一个报文段之后就启动**定时器**，如果在定时时间内没有收到应答就重新发送这个报文段。 TCP为了保证不发生丢包，就给每个包一个序号，同时序号也保证了传送到接收端实体的包的**按序接收**。然后接收端实体对已成功收到的包发回一个相应的**确认**(ACK)；如果发送端实体在合理的往返时延(RTT)内未收到确认，那么对应的数据包就被假设为已丢失将会被进行**重传**。 

   **3 ）错误校验** 

   ​	    TCP用一个**校验和函数**来检验数据是否有错误；在发送和接收时都要计算校验和。 

   **4 ） 流量控制和阻塞管理** 

   ​	    流量控制用来避免主机发送得过快而使接收方来不及完全收下，即**控制发送速度**。

### TCP与UDP的不同点

+ TCP是**面向连接**的（确认有创建三方交握，连接已创建才作传输。 ）
+ TCP保证有序数据传输
+ TCP会主动**重发丢失**的数据包
+ TCP会主动**舍弃重复**的数据包
+ TCP实现了**无差错**的数据传输
+ TCP能够进行**阻塞/流量控制**

### 补充：TCP的三次握手和四次挥手

（面试题常考，可以学完计算机网络这门课程再来看，也可以暂时直接跳过这部分，**这不是重头戏** ）

**三次握手**（Three-way Handshake ）其实就是指建立一个TCP连接时，需要客户端和服务器总共发送3个数据包。进行三次握手的主要作用就是为了确认双方的接收能力和发送能力是否正常、指定自己的初始化序列号为后面的可靠性传送做准备。实质上其实就是连接服务器指定端口，建立TCP连接，并同步连接双方的序列号和确认号，交换TCP窗口大小信息。

三次握手的过程如下：

+ 第一次握手：客户端给服务端发一个`SYN`报文，并指明客户端的初始化序列号`ISN`。此时客户端处于`SYN_SENT`状态。首部的同步位`SYN=1`，初始序号`seq=x`，`SYN=1`的报文段不能携带数据，但要消耗掉一个序号。

+ 第二次握手：服务器收到客户端的`SYN`报文之后，会以自己的`SYN`报文作为应答，并且也是指定了自己的初始化序列号`ISN(s)`。同时会把客户端的`ISN + 1`作为`ACK`的值，表示自己已经收到了客户端的`SYN`，此时服务器处于`SYN_RCVD`的状态。在确认报文段中`SYN=1`，`ACK=1`，确认号`ack=x+1`，初始序号`seq=y`。

+ 第三次握手：客户端收到`SYN`报文之后，会发送一个`ACK`报文，当然，也是一样把服务器的`ISN + 1`作为`ACK`的值，表示已经收到了服务端的`SYN`报文，此时客户端处于`ESTABLISHED`状态。服务器收到`ACK`报文之后，也处于`ESTABLISHED`状态，此时，双方已建立起了连接。

<img src="https://images.maiquer.tech/images/wx/image-20220809021531080.png" style="zoom:50%;" />

经过了三次握手，TCP的连接就成功建立了。

建立一个连接需要三次握手，而终止一个连接要经过**四次挥手**。这由TCP的半关闭（half-close ）造成的。所谓的半关闭，其实就是TCP提供了连接的一端在结束它的发送后还能接收来自另一端数据的能力。

四次挥手的过程如下：

+ 第一次挥手：客户端发送一个`FIN`报文，报文中会指定一个序列号。此时客户端处于`FIN_WAIT1`状态。即发出连接释放报文段（`FIN=1`，序号`seq=u` ），并停止再发送数据，主动关闭`TCP`连接，进入`FIN_WAIT1`（终止等待1 ）状态，等待服务端的确认。
+ 第二次挥手：服务端收到`FIN`之后，会发送`ACK`报文，且把客户端的序列号值`+1`作为`ACK`报文的序列号值，表明已经收到客户端的报文了，此时服务端处于`CLOSE_WAIT`状态。即服务端收到连接释放报文段后即发出确认报文段（`ACK=1`，确认号`ack=u+1`，序号`seq=v` ），服务端进入`CLOSE_WAIT`（关闭等待 ）状态，此时的TCP处于半关闭状态，客户端到服务端的连接释放。客户端收到服务端的确认后，进入`FIN_WAIT2`（终止等待2 ）状态，等待服务端发出的连接释放报文段。
+ 第三次挥手：如果服务端也想断开连接了，和客户端的第一次挥手一样，发给`FIN`报文，且指定一个序列号。此时服务端处于 `LAST_ACK`的状态。即服务端没有要向客户端发出的数据，服务端发出连接释放报文段（`FIN=1`，`ACK=1`，序号`seq=w`，确认号`ack=u+1` ），服务端进入`LAST_ACK`（最后确认 ）状态，等待客户端的确认。
+ 第四次挥手：客户端收到`FIN`之后，一样发送一个`ACK`报文作为应答，且把服务端的序列号值`+1`作为自己`ACK`报文的序列号值，此时客户端处于`TIME_WAIT`状态。需要过一阵子以确保服务端收到自己的`ACK`报文之后才会进入`CLOSED`状态，服务端收到`ACK`报文之后，就处于关闭连接了，处于`CLOSED`状态。即客户端收到服务端的连接释放报文段后，对此发出确认报文段（`ACK=1`，`seq=u+1`，`ack=w+1` ），客户端进入`TIME_WAIT`（时间等待 ）状态。此时TCP未释放掉，需要经过时间等待计时器设置的时间`2MSL`后，客户端才进入`CLOSED`状态。

<img src="https://images.maiquer.tech/images/wx/image-20220809022347424.png" />

在`socket`编程中，任何一方执行`close()`操作即可产生挥手操作。

经过四次挥手，双方连接将成功关闭。

更详细的介绍见，**番外——TCP三次握手与四次挥手，你想知道的都在这**。

## TCP网络程序

### TCP 的通信流程

创建一个基于TCP的网络程序流程相较于UDP会复杂一些，具体步骤如下：

1.   创建连接
2.   数据传输
3.   终止连接

于是，通信流程如下：

<img src="https://images.maiquer.tech/images/wx/image-20220809020718389.png" alt="image-20220809020718389" style="zoom: 67%;" />

要注意的是，由于TCP面向连接的特性，其客户端和服务器端的实现差异较大，下面实现代码。

### TCP 客户端

TCP的客户端要比服务器端简单很多，如果说服务器端是需要自己买手机、查手机卡、设置铃声、等待别人打电话流程的话。那么客户端就只需要找一个电话亭，拿起电话拨打即可，流程要少很多。

首先创建一个TCP套接字，方式上一节中已经讲过。

然后需要向服务器端发送连接请求（握手 ），使用套接字的`connect()`方法就可以实现，传入服务器的目的地址元组即可。

连接完成后，即可发送与接收数据，分别对应`send()`和`recv()`方法：

+ `send()`，传入要发送的二进制数据；
+ `recv()`，传入接收的最大字节数；

最后使用`close()`方法将套接字关闭即可，客户端实现的代码如下：

```python
from socket import *

# 创建socket
tcp_client_socket = socket(AF_INET, SOCK_STREAM)

# 目的信息
server_ip = input("请输入服务器ip:")
server_port = int(input("请输入服务器port:"))

# 链接服务器
tcp_client_socket.connect((server_ip, server_port))

# 提示用户输入数据
send_data = input("请输入要发送的数据：")

tcp_client_socket.send(send_data.encode("gbk"))

# 接收对方发送过来的数据，最大接收1024个字节
recvData = tcp_client_socket.recv(1024)
print('接收到的数据为:', recvData.decode('utf-8'))

# 关闭套接字
tcp_client_socket.close()
```

### TCP 服务端

首先创建一个TCP套接字，方式上一节中已经讲过。

然后需要**绑定本地端口**，在服务端这一步是不可或缺的。使用`bind()`方法绑定，参数同UDP套接字的`bind()`方法。

其次调用套接字的`listen()`方法，作用是接收客户端的连接请求，传入一个**最大连接数**。`socket`套接字的连接默认为主动，而调用了该方法后，接收就变为**被动**，不会主动请求连接其他主机。若无主机发送连接请求，程序会卡在`listen()`方法处，直到收到连接请求。

连接成功后，调用套接字的`accept()`方法。该方法返回一个**新的套接字**和**客户端目的地址元组**，用于信息传输，而原先的套接字依旧保留，用于与其他的客户端建立连接。

连接建立完成后，就可以用新的套接字与客户端通信。收发数据的方法与客户端一致，都是`send()`和`recv()`方法。、

最后使用`close()`方法将套接字关闭即可，服务端实现的代码如下：

```python
from socket import *

# 创建socket
tcp_server_socket = socket(AF_INET, SOCK_STREAM)

# 本地信息
address = ('', 7788)

# 绑定
tcp_server_socket.bind(address)

# 使用socket创建的套接字默认的属性是主动的，使用listen将其变为被动的，这样就可以接收别人的链接了
tcp_server_socket.listen(128)

# 如果有新的客户端来链接服务器，那么就产生一个新的套接字专门为这个客户端服务
# client_socket用来为这个客户端服务
# tcp_server_socket就可以省下来专门等待其他新客户端的链接
client_socket, clientAddr = tcp_server_socket.accept()

# 接收对方发送过来的数据
recv_data = client_socket.recv(1024)  # 接收1024个字节
print('接收到的数据为:', recv_data.decode('gbk'))

# 发送一些数据到客户端
client_socket.send("thank you !".encode('gbk'))

# 关闭为这个客户端服务的套接字，只要关闭了，就意味着为不能再为这个客户端服务了，如果还需要服务，只能再次重新连接
client_socket.close()
```

在同一局域网下的两台设备下运行先运行服务端，再运行客户端，即可实现主机间信息传输。

## TCP 注意点

1. TCP服务器一般情况下都**需要绑定**，否则客户端找不到这个服务器；
2. TCP客户端一般**不绑定**，因为是主动链接服务器，所以只要确定好服务器的IP、port等信息就好，本地客户端可以随机；
3. TCP服务器中通过`listen`可以将`socket`创建出来的**主动套接字变为被动**的，这是创建TCP服务器时必须要做的；
4. 当客户端需要链接服务器时，就需要使用`connect`进行链接，UDP是不需要链接的而是**直接发送**，但是TCP必须先链接，只有链接成功才能通信；
5. 当一个TCP客户端连接服务器时，服务器端会有1个**新的套接字**，这个套接字用来标记这个客户端，单独为这个客户端服务；
6. `listen`后的套接字是**被动**套接字，用来接收新的客户端的链接请求的，而`accept`返回的新套接字是标记这个新客户端的；
7. 关闭`listen`后的套接字意味着被动套接字关闭了，会**导致新的客户端不能够链接服务器**，但之前已经链接成功的客户端依然可以正常通信；
8. 关闭`accept`返回的套接字意味着这个客户端**已经服务完毕**；
9. 当客户端的套接字调用`close`后，服务器端会`recv`解堵塞，并且返回的长度为0，因此服务器可以通过返回数据的长度来区别客户端是否已经下线。

## 案例——文件下载器

需求：

+ 客户端键盘输入服务端的IP和端口进行连接；
+ 客户端输入服务端的文件路径，告知服务端需要返回什么文件；
+ 若文件路径不存在，捕获异常，打印提示信息；
+ 若文件路径存在，则接收并将其保存。

服务端参考代码如下：

```python
import socket


def send_file_2_client(new_client_socket, client_addr):
    # 1. 接收客户端 需要下载的文件名
    # 接收客户端发送过来的 要下载的文件名
    file_name = new_client_socket.recv(1024).decode("utf-8")
    print("客户端(%s)需要下载文件是：%s" % (str(client_addr), file_name))

    file_content = None
    # 2. 打开这个文件，读取数据
    try:
        f = open(file_name, "rb")
        file_content = f.read()
        f.close()
    except Exception as ret:
        print("没有要下载的文件(%s)" % file_name)

    # 3. 发送文件的数据给客户端
    if file_content:
        # new_client_socket.send("hahahghai-----ok-----".encode("utf-8"))
        new_client_socket.send(file_content)


def main():
    # 1. 创建一个TCP套接字
    tcp_server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # 2. 绑定本地信息
    tcp_server_socket.bind(("", 7890))

    # 3. 让默认的套接字由主动变为被动 listen
    tcp_server_socket.listen(128)

    while True:
        # 4. 等待客户端的链接 accept
        new_client_socket, client_addr = tcp_server_socket.accept()

        # 5. 调用发送文件函数，完成为客户端服务
        send_file_2_client(new_client_socket, client_addr)

        # 6. 关闭套接字
        new_client_socket.close()
    tcp_server_socket.close()


if __name__ == "__main__":
    main()

```

客户端参考代码如下：

```python
import socket


def main():
    # 1. 创建套接字
    tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # 2. 获取服务器的ip port
    dest_ip = input("请输入下载服务器的ip:")
    dest_port = int(input("请输入下载服务器的port:"))

    # 3. 链接服务器
    tcp_socket.connect((dest_ip, dest_port))

    # 4. 获取下载的文件名字
    download_file_name = input("请输入要下载的文件名字：")

    # 5. 将文件名字发送到服务器
    tcp_socket.send(download_file_name.encode("utf-8"))

    # 6. 接收文件中的数据
    recv_data = tcp_socket.recv(1024)  # 1024--->1K  1024*1024--->1k*1024=1M 1024*1024*124--->1G

    if recv_data:
        # 7. 保存接收到的数据到一个文件中
        with open("[新]" + download_file_name, "wb") as f:
            f.write(recv_data)

    # 8. 关闭套接字
    tcp_socket.close()


if __name__ == "__main__":
    main()

```

在同一局域网下的两台设备下运行先运行服务端，再运行客户端，即可实现。
