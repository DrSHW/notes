# 池与`concurrent`模块

## 池的概念

在[**多任务——进程**](https://docs.drshw.tech/pb/senior/7/)一节中，我们已经介绍过进程池的概念。

**池**的概念与其相似，池分为进程池和线程池。顾名思义，进程池开启的是进程，线程池开启的是线程。

池能够预先开启**固定个数**的线程/进程数，当任务来临的时候，直接提交给已经开好的线程/进程，让它们去执行就可以了。它节省了进程/线程的**开启、关闭和切换**所需的时间，同时减轻了操作系统调度的负担。

## `concurrent`模块

### 模块简介

尽管在Python的`multiprocessing`模块中，有进程池`Pool`的封装，但`threading`模块中，并未提供线程池的实现。

在Python 3.4版本，推出了`concurrent`模块，它基于`threading`和`multiprocessing`两个模块实现，并对二者进行了很好的封装和集成，使其拥有更加简洁易用的接口函数，无需再考虑`start()`、`join()`、`lock()`等问题。

无需下载该内置模块，导入方式如下：

```python
from concurrent.futures import *
```

### `concurrent` 进程池

即`concurrent.futures.ProcessPoolExecutor`，使用方式与原理类似于`multiprocessing.Pool`，简单介绍一下。

#### 内置方法

+ 构造方法：`ProcessPoolExecutor(num)`，`num`为最大进程数，与`Pool`一致。

+ `Pool`中的`apply_async(func, args, kwds)`方法对标`ProcessPoolExecutor`的`submit(self, fn, *args, **kwargs)`方法，它们都是异步非阻塞方法，不同点：

  + 不需要传入元组，它使用`*args`自动接收位置实参；

  + 返回一个`Future`对象`ret`，这里的`Future`与`asyncio`中的`Future`不一样，但有些许联系，在后面讲。

    通过调用其`result()`方法，即可得到`func()`函数返回值，`result()`方法也是同步阻塞方法；

  + 没有`callback`关键字实参，而是通过`ret.add_done_callback()`方法，传入函数名。

    例如`ret.add_done_callback(func)`，执行结束后会将**整个`Future`对象**传入`func` ，实现回调；

+ `shutdown()`方法，类似于`Pool`中的`close()`方法和`join()`方法的结合体。执行该方法时，进程池关闭，不再接收新任务；且阻塞主进程，等待子进程执行完毕后才能退出阻塞。

+ `map()`方法，对标`Pool`中的`map()`方法，功能和参数几乎一致，不同的是它不会阻塞主进程了，需要`shutdown()`方法帮忙。

示例：

```python
from concurrent.futures import ProcessPoolExecutor
import os, time, random

def worker(msg):
    t_start = time.time()
    print("%s开始执行,进程号为%d" % (msg, os.getpid()))
    time.sleep(random.random() * 2)
    t_stop = time.time()
    return str(msg) + "执行完毕，耗时%0.2f" % (t_stop - t_start)

def finished(res):
    print(res.result())

if __name__ == '__main__':
    # 获取cpu核心数，依据此数量开启进程池
    cpu_count = os.cpu_count()
    print("cpu核心数为%d" % cpu_count)
    print("----start----")
    pp = ProcessPoolExecutor(cpu_count)
    # 使用map可以直接搞定
    # ret_list = pp.map(worker, range(0, cpu_count))
    # pp.shutdown()
    # print("-----end-----")
    # print("-----res-----")
    # for ret in ret_list:
    #     print(ret)

    # 或者使用朴素做法如下
    ret_list = []
    for i in range(0, cpu_count):
        # 往进程池中添加任务
        ret = pp.submit(worker, "任务%d" % i)  # 这里不需要传入元组了，内部使用*args接收参数
        ret.add_done_callback(finished)	# 添加回调
        ret_list.append(ret)	# 演示返回值处理
    pp.shutdown()  # 关闭进程池，不再接受新的进程；阻塞，直到所有任务执行完毕
    print("-----end-----")
    print("-----res-----")
    for ret in ret_list:
        print(ret.result())
```

执行结果：

```python
cpu核心数为16
----start----
任务0开始执行,进程号为22800
任务1开始执行,进程号为20888
任务2开始执行,进程号为1536
任务3开始执行,进程号为40944
任务4开始执行,进程号为38904
任务5开始执行,进程号为38364
任务5 执行完毕，耗时0.04
任务6开始执行,进程号为38364
任务7开始执行,进程号为27032
任务8开始执行,进程号为32396
任务9开始执行,进程号为7596
任务10开始执行,进程号为25760
任务11开始执行,进程号为18484
任务12开始执行,进程号为29212
任务0 执行完毕，耗时0.17
任务13开始执行,进程号为22800
任务14开始执行,进程号为25992
任务15开始执行,进程号为27992
任务13 执行完毕，耗时0.10
任务8 执行完毕，耗时0.17
任务1 执行完毕，耗时0.32
任务12 执行完毕，耗时0.41
任务11 执行完毕，耗时0.45
任务9 执行完毕，耗时0.49
任务15 执行完毕，耗时0.59
任务4 执行完毕，耗时0.99
任务10 执行完毕，耗时0.91
任务7 执行完毕，耗时1.30
任务6 执行完毕，耗时1.40
任务14 执行完毕，耗时1.77
任务2 执行完毕，耗时2.00
任务3 执行完毕，耗时1.99
-----end-----
-----res-----
22800
20888
1536
40944
38904
38364
38364
27032
32396
7596
25760
18484
29212
22800
25992
27992
```

同时，`ProcessPoolExecutor`中也实现了`__enter__`和`__exit__`，支持`with`语法。在`with`结束时，`__exit__`方法中会执行`shutdown()`方法，无需手动`shutdown`了：

```python
print("----start----")
ret_list = []
with ProcessPoolExecutor(cpu_count) as pp:      # 无需关闭进程池
	for i in range(cpu_count):
		ret = pp.submit(worker, "任务%d" % i)
		ret.add_done_callback(finished)
		ret_list.append(ret)
print("-----end-----")
```

进程池已经能很大程度上提升程序性能了，但是它还有一些缺点：

+ 开销大；
+ 并发数过于依赖`CPU`核数，而池中任务个数限制了我们程序的并发个数（无法达到成百上千的并发量）。

因此，我们需要介绍**线程池**。

### 线程池

即`concurrent.futures.ThreadPoolExecutor`我们知道线程是比进程粒度更小的存在，故我们可以在线程池内预先分配更多数量的线程，个数大概为`CPU核数*4~5`。

它的使用方式几乎与进程池`ProcessingPoolExecutor`一模一样，各种功能对应的方法，除构造方法外，也是完全一致，值得一提的是它们都继承自父类`Executor`。

这里直接给示例：

```python
from concurrent.futures import ThreadPoolExecutor	# 引入线程池模块
import os, time, random

def worker(msg):
    t_start = time.time()
    print("%s开始执行,进程号为%d" % (msg, os.getpid()))
    time.sleep(random.random() * 2)
    t_stop = time.time()
    return str(msg) + "执行完毕，耗时%0.2f" % (t_stop - t_start)

def finished(res):
    print(res.result())

if __name__ == '__main__':
    ret_list = []
    # 获取cpu核心数，依据此数量开启线程池
    cpu_count = os.cpu_count()
    print("cpu核心数为%d" % cpu_count * 4)	# 线程可以开很多
    print("----start----")
    tp = ThreadPoolExecutor(cpu_count * 4)
    # 使用map可以直接搞定
    # ret_list = tp.map(worker, range(0, cpu_count * 4))
    # tp.shutdown()
    # print("-----end-----")
    # print("-----res-----")
    # for ret in ret_list:
    #     print(ret)
    
    # 或者使用朴素做法如下
    for i in range(0, cpu_count * 4):
        # 往线程池中添加任务
        ret = tp.submit(worker, "任务%d" % i)     # 使用方法同进程池
        ret.add_done_callback(finished)	# 添加回调
        ret_list.append(ret)	# 演示返回值处理
    tp.shutdown()  # 关闭线程池，不再接受新的进程；阻塞，直到所有任务执行完毕
    print("-----end-----")
    print("-----res-----")
    for ret in ret_list:
        print(ret.result())
```

同样支持`with`语法：

```python
print("----start----")
ret_list = []
with ThreadPoolExecutor(cpu_count * 4) as tp:      # 无需关闭线程池
	for i in range(cpu_count * 4):
		ret = tp.submit(worker, "任务%d" % i)
		ret.add_done_callback(finished)
		ret_list.append(ret)
print("-----end-----")
```

## `concurrent.futures.Future`对象

经过上面的使用，我们知道这个`Future`对象是由池分配任务时产生的，执行结束后会将执行结果赋给对应的`Future`对象。

`asyncio.Future`是在基于**协程**实现的异步赋值时使用的，而`concurrent.futures.Future`是基于池中**线程和进程**实现的异步赋值时使用的，它们都是用来**等待结果**的。

遇到模块版本兼容性问题时（例如某模块不支持`asyncio`异步），我们可能会把两种对象交叉使用，此时就要将这个`Future`对象转换为`asyncio.Future`对象，一般会使用`asyncio`中时间循环对象中的`run_in_executor(pool, func)`方法实现。

在`run_in_executor(pool, func)`方法内部，先调用池对象的`submit`方法申请一个线程去执行`func`，并返回一个`concurrent.futures.Future`对象；再调用`asyncio.wrap_future()`函数将`concurrent.futures.Future`对象包装为`asyncio.Future`对象。

封装示例：

```python
import time
import asyncio
import concurrent.futures

def func():
    time.sleep(2)       # 某个耗时操作，但它不是asyncio支持的可等待的对象
    return "func"

# 进程池转换为协程异步
async def processingPoolToAsync():
    loop = asyncio.get_running_loop()
    with concurrent.futures.ProcessPoolExecutor(4) as tp:
        for i in range(0, 4):
            fut = loop.run_in_executor(tp, func)    # 传入池对象和函数，在内部进行分配线程和封装
            result = await fut      # 封装后的函数返回的是一个可等待对象，所以可以使用await
            print(result)

# 线程池转换为协程异步
async def threadPoolToAsync():
    loop = asyncio.get_running_loop()
    with concurrent.futures.ThreadPoolExecutor(8) as pp:
        for i in range(0, 8):
            fut = loop.run_in_executor(pp, func)
            result = await fut
            print(result)

# 测试
asyncio.run(processingPoolToAsync())
asyncio.run(threadPoolToAsync())
```

可见，封装后的`Future`对象就可以被`await`了。

当然，还有很多类似的不支持异步的耗时模块（如`requests`），也可以使用这样的形式封装，到时候我们再讲解。

## 总结

+ Python自带`concurrent`模块实现了对多线程`threading`模块和多进程`multiprocessing`模块的高度封装和集成，使用极为方便；

+ `ThreadPoolExecutor`类和`ProcessPoolExecutor`类均继承自`Executor`父类，二者初始化方式略有区别，但调度并发任务和获取执行结果方式几乎一致；

+ 两种调度并发任务的方式：`submit`和`map`——`submit`相比`map`而言，具有更丰富的任务定制方法，支持指定回调和参数；
+ 可使用`loop.run_in_executor(pool, func)`方法其它不支持异步的耗时操作替换为基于`asyncio`协程异步的`Future`对象。



