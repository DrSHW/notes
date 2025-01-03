# numpy库介绍

`numpy`是一个功能强大的`Python`库，主要用于对多维数组执行计算。`numpy`这个词来源于两个单词-- `Numerical`和`Python`。`numpy`提供了大量的库函数和操作，可以帮助程序员轻松地进行数值计算。在数据分析和机器学习领域被广泛使用。他有以下几个特点：

1. `numpy`内置了并行运算功能，当系统有多个核心时，做某种计算时，`numpy`会自动做并行计算。
2. `numpy`底层使用C语言编写，内部解除了`GIL`（全局解释器锁 ），其对数组的操作速度不受Python解释器的限制，**效率远高于纯Python代码**。
3. 有一个强大的N维数组对象`Array`（一种类似于列表的东西 ）。
4. 实用的线性代数、傅里叶变换和随机数生成函数。

总而言之，他是一个非常高效的用于处理**数值型运算**的包。

## 安装

通过`pip install numpy`即可安装。

## 教程地址

1. 官网：<https://docs.scipy.org/doc/numpy/user/quickstart.html>。
2. 中文文档：<https://www.numpy.org.cn/user_guide/quickstart_tutorial/index.html>。

## numpy数组和Python列表性能对比

比如我们想要对一个numpy数组和Python列表中的每个素进行求平方。那么代码如下：

```python
# Python列表的方式
t1 = time.time()
a = []
for x in range(100000):
    a.append(x**2)
t2 = time.time()
t = t2 - t1
print(t)
```

花费的时间大约是`0.07180`左右。而如果使用`numpy`的数组来做，那速度就要快很多了：

```python
import numpy as np

t3 = time.time()
b = np.arange(100000)**2
t4 = time.time()
print(t4-t3)
```

# numpy数组基本用法

1. `numpy`是`Python`科学计算库，用于快速处理任意维度的数组。
2. `numpy`提供一个**N维数组类型ndarray**，它描述了**相同类型**的“items”的集合。
3. `numpy.ndarray`支持向量化运算。
4. `numpy`使用c语言写的，底部解除了`GIL`，其对数组的操作速度不在受`python`解释器限制。

## numpy中的数组

`numpy`中的数组的使用跟`Python`中的列表非常类似。他们之间的区别如下：

1. 一个列表中可以存储多种数据类型。比如`a = [1,'a']`是允许的，而数组只能存储同种数据类型。
2. 数组可以是多维的，当多维数组中所有的数据都是数值类型的时候，相当于线性代数中的矩阵，是可以进行相互间的运算的。

## 创建数组（np.ndarray对象 ）

#### ndarray对象

`numpy`中最重要的一个特点就是N维数组对象，即`Ndarray`的全称是（`N-Dimension Arrary ）`，表明了一个`ndarray`对象就是一个`N`维数组。但要注意的是，`ndarray`是同质的。同质的意思就是说`N`维数组里的所有元素必须是属于同一种数据类型的。

`numpy`中最重要的一个特点就是其N维数组对象,即`ndarray` (别名`array`)对象，该对象可以执行一些科学计算。

![](https://images.maiquer.tech/images/wx/1647499290297.png)

`numpy`经常和数组打交道，因此首先第一步是要学会创建数组。在`numpy`中的数组的数据类型叫做`ndarray`。以下是两种创建的方式：

1. 根据`Python`中的列表生成：

   ```python
   import numpy as np
   a1 = np.array([1, 2, 3, 4])
   print(a1)	# [1 2 3 4]
   print(type(a1))	# <class 'numpy.ndarray'>
   ```

2. 使用`np.arange`生成，`np.arange`的用法类似于`Python`中的`range`：

   ```python
   import numpy as np
   a2 = np.arange(2, 21, 2)
   print(a2)	# [ 2  4  6  8 10 12 14 16 18 20]
   ```

3. 通过`arange()`函数可以创建一个等差数组，它的功能类似于`range()`，只不过`arange()`函数返回的功能类似于`range()`，只不过`arange()`函数返回的是数组，而不是列表。

4. 使用`np.random`生成随机数的数组：

   ```python
   a1 = np.random.random((2, 2)) 	# 生成2行2列的0~1之间的随机数（浮点数 ）的数组
   a2 = np.random.randint(0, 10, size=(3, 3)) 	# 元素是从0-10之间随机的3行3列的数组
   ```

5. 使用函数生成特殊的数组：

   ```python
   import numpy as np
   a1 = np.zeros((2,2)) 	# 生成一个所有元素都是0的2行2列的数组
   a2 = np.ones((3,2))	# 生成一个所有元素都是1的3行2列的数组
   a3 = np.full((2,2),8) 	# 生成一个所有元素都是8的2行2列的数组
   a4 = np.eye(3) 	# 生成一个在斜方形上元素为1，其他元素都为0的3x3的矩阵
   ```

## ndarray常用属性

### ndarray.dtype

因为数组中只能存储同一种数据类型，因此可以通过`dtype`获取数组中的元素的数据类型。以下是`ndarray.dtype`的常用的数据类型：

`ndarray`对象中定义了一些重要的属性，具体如下：

| 属性               | 具体说明                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ndarray.ndim`     | 维度个数，也就是数组轴的个数，比如上一维，二维，三维等                                                                                |
| `ndarray.shape`    | 数组的维度，这就是一个整数的元组，表示每个维度上数组的大小。列如，一个`n`行`m`列的数组，它的`shape`属性为`(n,m)`                      |
| `ndarray.size`     | 数组的元素的总个数，等于shape属性中元组的元素的乘积                                                                                   |
| `ndarray.dtype`    | 描述数组中的元素类型的对象，既可以使用标准的python类型创建或指定，也可以使用numpy特有的数据来指定，比如`numpy.int32`，`numpy.float64` |
| `ndarray.itemsize` | 数组中的每个元素的字节大小，列如，元素类型为`float64`的数组有8（64/8 ）个字节，这相当与`ndarray.dtype.itemsize`                       |

值得一提的是，`ndarray`对象中存储的元素的类型必须是相同的

```python
data = np.arange(12).reshape(3, 4)  # 创建一个3行4列的数组
print(data)
print(type(data))	# numpy.ndarray
print(data.ndim)        	# 数组维度的个数，输出结果2，表示二维数组
print(data.shape)        	# 数组的维度，输出结果（3，4 ），表示3行4列
print(data.size)         	# 数组元素的个数，输出结果12，表示总共有12个元素
print(data.dtype)		 	# 数组元素的类型，输出结果dtype('int64'),表示元素类型都是int64
```

 另外，我们还可以通过`ndarray.reshape`来重新修改数组的维数。示例代码如下：

```python
a1 = np.arange(12) 	# 生成一个有12个数据的一维数组
print(a1) 
a2 = a1.reshape((3, 4)) 	# 变成一个2维数组，是3行4列的
print(a2)
a3 = a1.reshape((2, 3, 2)) 	# 变成一个3维数组，总共有2块，每一块是2行2列的
print(a3)
a4 = a2.reshape((12,)) 	# 将a2的二维数组重新变成一个12列的1维数组
print(a4)
a5 = a2.flatten() 	# 不管a2是几维数组，都将他变成一个一维数组
print(a5)
```

注意，`reshape`并不会修改原来数组本身，而是会将修改后的结果返回。如果想要直接修改数组本身，那么可以使用`resize`来替代`reshape`。

### ndarray.itemsize

数组中每个元素占的大小，单位是字节。比如以下代码：

```python
a1 = np.array([1, 2, 3], dtype=np.int32)
print(a1.itemsize)	# 打印4，因为每个字节是8位，32位/8=4个字节
```

# numpy数组操作

## 计算

### 数组与数的计算

在`Python`列表中，想要对列表中所有的元素都加一个数，要么采用`map`函数，要么循环整个列表进行操作。但是`numpy`中的数组可以直接在数组上进行操作。示例代码如下：

```python
import numpy as np
a1 = np.random.random((3, 4))
print(a1)
# 如果想要在a1数组上所有元素都乘以10，那么可以通过以下来实现
a2 = a1 * 10
print(a2)
# 也可以使用round让所有的元素只保留2位小数
a3 = a2.round(2)
```

以上例子是相乘，其实相加、相减、相除也都是类似的。

### 数组与数组的计算

1. 结构相同的数组之间的运算：

   ```python
   a1 = np.arange(0, 24).reshape((3, 8))
   a2 = np.random.randint(1, 10, size=(3, 8))
   a3 = a1 + a2 	# 相减/相除/相乘都是可以的
   print(a1)
   print(a2)
   print(a3)
   ```

2. 与行数相同并且只有1列的数组之间的运算：

   ```python
   a1 = np.random.randint(10, 20, size=(3, 8)) 	# 3行8列
   a2 = np.random.randint(1, 10, size=(3, 1)) 	# 3行1列
   a3 = a1 - a2 	# 行数相同，且a2只有1列，能互相运算
   print(a3)
   ```

3. 与列数相同并且只有1行的数组之间的运算：

   ```python
   a1 = np.random.randint(10, 20, size=(3, 8)) # 3行8列
   a2 = np.random.randint(1, 10, size=(1, 8))
   a3 = a1 - a2	# 列数相同，且a2只有1行，能互相运算
   print(a3)
   ```

### 广播原则

如果两个数组的后缘维度（trailing dimension，即从末尾开始算起的维度 ）的轴长度相符或其中一方的长度为1，则认为他们是**广播兼容**的。广播会在缺失和（或 ）长度为1的维度上进行。

![](https://images.maiquer.tech/images/wx/1647499369666.png)

```python
import numpy as np
arr1 = np.array([[0], [1], [2], [3]])
arr2 = np.array([1, 2, 3])
print(arr1 + arr2)
```

广播机制主要为了解决不同形状的数组之间进行计算，数组的shape从元组的最后一个元素对齐，并且如下任意一个条件即可:

1. 两个数组的`shape`对应的维度等长；

2. 其中一个数组对应`shape`为`1`；

看以下案例分析：

```python
a1 = np.random.randint(10,20,size=(3,8,2)) # 3行8列
```

1. `shape`为`(3,8,2)`的数组能和`(8,3)`的数组进行运算吗？
   分析：不能，因为按照广播原则，从后面往前面数，`(3,8,2)`和`(8,3)`中的`2`和`3`不相等，所以不能进行运算。
2. `shape`为`(3,8,2)`的数组能和`(8,1)`的数组进行运算吗？
   分析：能，因为按照广播原则，从后面往前面数，`(3,8,2)`和`(8,1)`中的`2`和`1`虽然不相等，但是因为有一方的长度为`1`，所以能参与运算。
3. `shape`为`(3,1,8)`的数组能和`(8,1)`的数组进行运算吗？
   分析：能，因为按照广播原则，从后面往前面数，`(3,1,4)`和`(8,1)`中的`4`和`1`虽然不相等且`1`和`8`不相等，但是因为这两项中有一方的长度为`1`，所以能参与运算。

![](https://images.maiquer.tech/images/wx/1647499429175.png)

```python
import numpy as np
arr1 = np.array([[0], [1], [2], [3]])
print(arr1.shape)	# (4, 1)

arr2 = np.array([1, 2, 3])
print(arr2.shape)	# (3,)
print(arr1 + arr2)
```

数组与标量间的运算

![](https://images.maiquer.tech/images/wx/1647499456277.png)

大小相等的数组的任何算术都会运算到元素级，同样，数组与标量的算术运算也会将那个标量值传播到各个元素。当数组进行相加，相减，乘以或者除以一个数字时，这些称为标量运算。标量运算会产生一个与数组具有相同数量的行和列的新矩阵，其中原始矩阵每个元素数据被相加，相减，相乘或者相除。

## ndarray的索引和切片

`ndarray`对象支持索引和切片操作，况且提供了常规Python更多的索引功能，除了使用整数进行索引以外，还使用了整数数组和布尔数组进行索引。

![](https://images.maiquer.tech/images/wx/1647499482597.png)

对于多维数组来说，索引与切片的使用方式与列表就大不一样了，不如二维数组的索引方式如下：

![](https://images.maiquer.tech/images/wx/1647499515502.png)

![](https://images.maiquer.tech/images/wx/1647499541507.png)

如果想获取二维数组的单个元素，则需要通过形如`arr[x, y]`的索引来实现，其中`x`表示行号，`y`表示列号。

![](https://images.maiquer.tech/images/wx/1647499567106.png)

多维数组的切片是沿着行或列的方向选取元素的,我们可以传入一个切片，也可以传入多个切片还可以将切片与整数索引混合使用。

![](https://images.maiquer.tech/images/wx/1647499604746.png)

`ndarray`对象的元素通过索引和切片来访问和修改，`ndarray`元素的索引从`0`开始。`ndarray`的切片方式与`python`的`list`的遍历方式也极为相似，掌握了诀窍之后就很简单。

举个例子，假设想要将下图中紫色部分切片出来，就需要确定行的范围和列的范围。由于紫色部分行的范围是`0`到`2`，所以切片时行的索引范围是`0:3`(索引范围是左闭右开);又由于紫色部分列的范围也是`0`到`2`，所以切片时列的索引范围也是`0:3`(索引范围是左闭右开)。最后把行和列的索引范围整合起来就是`[0:3, 0:3]`(`,`左边是行的索引范围)。当然有时为了方便，`0`可以省略，也就是`[:3, :3]`。

![](https://images.maiquer.tech/images/wx/1647499633147.png)

 代码如下：

```python
import numpy as np
a = np.array([[1,10,11,20,21],[2,9,12,19,22],[3,8,13,18,23],[4,7,14,17,24],[5,6,15,16,25]])
print(a)
print(a[:3, :3])
```

不过，对于多维数组来说，索引和切片的使用与列表就大不一样了。

在二维数组中，每个索引位置上的元素把在是一个标量，而是一个一维数组，代码如下：

```python
import numpy as np
arr2d =np.array([[1, 2, 3],[4, 5, 6],[7, 8, 9]]) 	# 创建二维数组
print(arr2d)
print(arr2d[1])        	# [4, 5, 6] 获取索引为1的元素
```

此时，如果我们想通过索引的方式来获取二维数组的单个元素，就需要通过形如`arr[x,y]`，以逗号分隔的索引来实现。其中，`x`表示行，`y`表示列号。

接下来我们来通过看图描述数组`arr2d`的索引方式，我们可以看出，`aar2d`是一个3行3列的数组，如果我们想获取2数组的单个元素个数，我们可以通过`arr2d[1,1]`来实现。

相比一维数组，多维数组的切片方式花样更多，多维数组的切片是沿着行或列的方向选取元素，我们可以通过传入一个切片，还可以将切片与整数索引混合使用。

## 数组（矩阵 ）转置和轴对换

`numpy`中的数组其实就是线性代数中的矩阵。矩阵是可以进行转置的。`ndarray`有一个`T`属性，可以返回这个数组的转置的结果。

示例代码如下：

```python
a1 = np.arange(0,24).reshape((4,6))
a2 = a1.T
print(a2)
```

另外还有一个方法叫做`transpose`，这个方法返回的是一个View，也即修改返回值，会影响到原来数组。示例代码如下：

```python
a1 = np.arange(0,24).reshape((4,6))
a2 = a1.transpose()
```

为什么要进行矩阵转置呢，有时候在做一些计算的时候需要用到。比如做矩阵的内积的时候。就必须将矩阵进行转置后再乘以之前的矩阵：

```python
a1 = np.arange(0,24).reshape((4,6))
a2 = a1.T
print(a1.dot(a2))
```

`transpose`方法不仅仅可以进行矩阵转置，也可以进行坐标轴变换，在多维矩阵上使用广泛。

`transpose`在不接收参数的情况下，默认计算矩阵的转置。

`transpose`规定，数字0代表x轴，数字1代表y轴，每多一维，新轴对应的数字加1。

依据矩阵的维度，`transpose`可以传入多个参数，n维矩阵需要传递n个参数，代表改变后坐标轴的位置。

对一个n维矩阵，若要让`transpose`什么都不做，传入`(0, 1, ..., n - 1)`即可。

二维数组转置的默认值为`transpose(1, 0)`，表示x轴与y轴进行交换（原先顺序`(0, 1)`->目标顺序`(1, 0)`，x轴与y轴发生交换 ）。

同理，若一个三维数组传入`(0, 2, 1)`，代表其y轴和z轴发生交换（原先顺序`(0, 1, 2)`->目标顺序`(0, 2, 1)`，y轴与z轴发生交换 ）。

### 数组的转置

![](https://images.maiquer.tech/images/wx/1647499666177.png)

![](https://images.maiquer.tech/images/wx/1647499748533.png)

![](https://images.maiquer.tech/images/wx/1647499772869.png)

## 数组的拼接

有许多拼接方法，这里挑一个最常用的讲：

`np.concatenate((arr1, arr2), axis=0)`

将`arr1`拼接在`arr2`后，默认`axis=0`竖直拼接。通过修改`axis`可修改拼接轴：

```python
a = np.array([[0, 1, 2],
             [3, 4, 5],
             [6, 7, 8]])
b = np.array([[0, 2, 4],
             [6, 8, 10],
             [12, 14, 16]])
print(np.concatenate((a, b)))
print(np.concatenate((a, b), axis=1))
'''
[[ 0  1  2]
 [ 3  4  5]
 [ 6  7  8]
 [ 0  2  4]
 [ 6  8 10]
 [12 14 16]]
[[ 0  1  2  0  2  4]
 [ 3  4  5  6  8 10]
 [ 6  7  8 12 14 16]]
'''
```

# 布尔索引



![](https://images.maiquer.tech/images/wx/1647499810914.png)

需要注意得是，布尔索引数组的长度和被索引的轴长度一致。

因此，我们还可以把布尔索引数组跟切片混合使用。

布尔运算也是矢量的，比如以下代码：

```python
a1 = np.arange(0,24).reshape((4,6))
print(a1 < 10) 	# 会返回一个新的数组，这个数组中的值全部都是bool类型
'''
[[ True  True  True  True  True  True]
 [ True  True  True  True False False]
 [False False False False False False]
 [False False False False False False]]
'''
```

这样看上去没有什么用，假如我现在要实现一个需求，要将`a1`数组中所有小于10的数据全部都提取出来。那么可以使用以下方式实现：

```python
a1 = np.arange(0,24).reshape((4,6))
a2 = a1 < 10
print(a1[a2]) 	# 这样就会在a1中把a2中为True的元素对应的位置的值提取出来
```

其中布尔运算可以有`!=`、`==`、`>`、`<`、`>=`、`<=`以及`&(与)`和`|(或)`。示例代码如下：

```python
a1 = np.arange(0,24).reshape((4,6))
a2 = a1[(a1 < 5) | (a1 > 10)]
print(a2)
```

#  深拷贝和浅拷贝

在操作数组的时候，它们的数据有时候拷贝进一个新的数组，有时候又不是。这经常是初学者感到困惑。下面有三种情况：

### 不拷贝

如果只是简单的赋值，那么不会进行拷贝。示例代码如下：

```python
a = np.arange(12)
b = a 	# 这种情况不会进行拷贝
print(b is a) 	# 返回True，说明b和a是相同的
```

### View或者浅拷贝

有些情况，会进行变量的拷贝，但是他们所指向的内存空间都是一样的，那么这种情况叫做浅拷贝，或者叫做`View(视图)`。比如以下代码：

```python
a = np.arange(12)
c = a.view()
print(c is a) 	# 返回False，说明c和a是两个不同的变量
c[0] = 100
print(a[0])   	# 100，说明对c上的改变，会影响a上面的值，说明他们指向的内存空间还是一样的，这种叫做浅拷贝，或者说是view
```

### 深拷贝

将之前数据完完整整的拷贝一份放到另外一块内存空间中，这样就是两个完全不同的值了。示例代码如下：

```python
a = np.arange(12)
d = a.copy()
print(d is a) 	# 返回False，说明d和a是两个不同的变量
d[0] = 100
print(a[0]) 	# 打印0，说明d和a指向的内存空间完全不同了。
```

# NAN和INF值处理

首先我们要知道这两个英文单词代表的什么意思：

1. `NAN`：`Not A number`，不是一个数字的意思，但是他是属于浮点类型的，所以想要进行数据操作的时候需要注意他的类型。
2. `INF`：`Infinity`，代表的是无穷大的意思，也是属于浮点类型。`np.inf`表示正无穷大，`-np.inf`表示负无穷大，一般在出现除数为0的时候为无穷大。比如`2/0`。

## NAN一些特点

1. `NAN`和`NAN`不相等。比如`np.NAN != np.NAN`这个条件是成立的。
2. `NAN`和任何值做运算，结果都是`NAN`。

有些时候，特别是从文件中读取数据的时候，经常会出现一些缺失值。缺失值的出现会影响数据的处理。因此我们在做数据分析之前，先要对缺失值进行一些处理。处理的方式有多种，需要根据实际情况来做。一般有两种处理方式：删除缺失值，用其他值进行填充。

## 删除缺失值

有时候，我们想要将数组中的`NAN`删掉，那么我们可以换一种思路，就是只提取不为`NAN`的值。示例代码如下：

```python
# 1. 删除所有NAN的值，因为删除了值后数组将不知道该怎么变化，所以会被变成一维数组
data = np.random.randint(0,10,size=(3,5)).astype(np.float64)
data[0,1] = np.nan
data = data[~np.isnan(data)] # 此时的data会没有nan，并且变成一个1维数组
# 2. 删除NAN所在的行
data = np.random.randint(0,10,size=(3,5)).astype(np.float)
# 将第(0,1)和(1,2)两个值设置为NAN
data[[0,1],[1,2]] = np.NAN
# 获取哪些行有NAN
lines = np.where(np.isnan(data))[0]
# 使用delete方法删除指定的行,axis=0表示删除行，lines表示删除的行号
data1 = np.delete(data,lines,axis=0)
```

# np.random模块

`np.random`为我们提供了许多获取随机数的函数。这里统一来学习一下。

## np.random.seed

用于指定随机数生成时所用算法开始的整数值，如果使用相同的`seed()`值，则每次生成的随机数都相同，如果不设置这个值，则系统根据时间来自己选择这个值，此时每次生成的随机数因时间差异而不同。一般没有特殊要求不用设置。以下代码：

```python
np.random.seed(1)
print(np.random.rand()) 	# 必定打印0.417022004702574
print(np.random.rand()) 	# 打印其他的值，因为随机数种子只对下一次随机数的产生会有影响。
```

## np.random.rand

生成一个值为`[0,1)`之间的数组，形状由参数指定，如果没有参数，那么将返回一个随机值。示例代码如下：

```python
data1 = np.random.rand(2,3,4) 	 	# 生成大小2x3x4的数组，值从0-1之间
data2 = np.random.rand() 	# 生成一个0-1之间的随机数
```

## np.random.randn

生成均值(`μ`)为`0`，标准差(`σ`)为`1`的标准正态分布的值。示例代码如下：

```python
data = np.random.randn(2,3) 	# 生成一个2行3列的数组，数组中的值都满足标准正态分布
```

## np.random.randint

生成指定范围内的随机数，并且可以通过`size`参数指定维度。示例代码如下：

```python
data1 = np.random.randint(10,size=(3,5)) 	# 生成值在0-10之间，3行5列的数组
data2 = np.random.randint(1,20,size=(3,6)) 	# 生成值在1-20之间，3行6列的数组
```

## np.random.choice

从一个列表或者数组中，随机进行采样。或者是从指定的区间中进行采样，采样个数可以通过参数指定：

```python
data = [4,65,6,3,5,73,23,5,6]
result1 = np.random.choice(data,size=(2,3)) 	# 从data中随机采样，生成2行3列的数组
result2 = np.random.choice(data,3) 	# 从data中随机采样3个数据形成一个一维数组
result3 = np.random.choice(10,3) 	# 从0-10之间随机取3个值
```

## np.random.shuffle

把原来数组的元素的位置打乱。示例代码如下：

```python
a = np.arange(10)
np.random.shuffle(a) 	# 将a的元素的位置都会进行随机更换
```

# 通用函数

## 一元函数

| 函数                                              | 描述                                                          |
| ------------------------------------------------- | ------------------------------------------------------------- |
| np.abs                                            | 绝对值                                                        |
| np.sqrt                                           | 开根                                                          |
| np.square                                         | 平方                                                          |
| np.exp                                            | 计算指数(e^x)                                                 |
| np.log，np.log10，np.log2，np.log1p               | 求以e为底，以10为低，以2为低，以(1+x)为底的对数               |
| np.sign                                           | 将数组中的值标签化，大于0的变成1，等于0的变成0，小于0的变成-1 |
| np.ceil                                           | 朝着无穷大的方向取整，比如5.1会变成6，-6.3会变成-6            |
| np.floor                                          | 朝着负无穷大方向取证，比如5.1会变成5，-6.3会变成-7            |
| np.rint，np.round                                 | 返回四舍五入后的值                                            |
| np.modf                                           | 将整数和小数分隔开来形成两个数组                              |
| np.isnan                                          | 判断是否是nan                                                 |
| np.isinf                                          | 判断是否是inf                                                 |
| np.cos，np.cosh，np.sin，np.sinh，np.tan，np.tanh | 三角函数                                                      |
| np.arccos，np.arcsin，np.arctan                   | 反三角函数                                                    |

## 二元函数

| 函数                                                  | 描述                              |              |
| ----------------------------------------------------- | --------------------------------- | ------------ |
| np.add                                                | 加法运算（即1+1=2 ），相当于+     |              |
| np.subtract                                           | 减法运算（即3-2=1 ），相当于-     |              |
| np.negative                                           | 负数运算（即-2 ），相当于加个负号 |              |
| np.multiply                                           | 乘法运算（即2*3=6 ），相当于*     |              |
| np.divide                                             | 除法运算（即3/2=1.5 ），相当于/   |              |
| np.floor_divide                                       | 取整运算，相当于//                |              |
| np.mod                                                | 取余运算，相当于%                 |              |
| greater,greater_equal,less,less_equal,equal,not_equal | >,>=,<,<=,=,!=的函数表达式        |              |
| logical_and                                           | &的函数表达式                     |              |
| logical_or                                            | \                                 | 的函数表达式 |

### 聚合函数

| 函数名称  | NAN安全版本  | 描述             |
| --------- | ------------ | ---------------- |
| np.sum    | np.nansum    | 计算元素的和     |
| np.prod   | np.nanprod   | 计算元素的积     |
| np.mean   | np.nanmean   | 计算元素的平均值 |
| np.std    | np.nanstd    | 计算元素的标准差 |
| np.var    | np.nanvar    | 计算元素的方差   |
| np.min    | np.nanmin    | 计算元素的最小值 |
| np.max    | np.nanmax    | 计算元素的最大值 |
| np.argmin | np.nanargmin | 找出最小值的索引 |
| np.argmax | np.nanargmax | 找出最大值的索引 |
| np.median | np.nanmedian | 计算元素的中位数 |

使用`np.sum`或者是`a.sum`即可实现。并且在使用的时候，可以指定具体哪个轴。同样`Python`中也内置了`sum`函数，但是Python内置的`sum`函数执行效率没有`np.sum`那么高，可以通过以下代码测试了解到：

```python
a = np.random.rand(1000000)
%timeit sum(a) 	# 使用Python内置的sum函数求总和，看下所花费的时间
%timeit np.sum(a) 	# 使用numpy的sum函数求和，看下所花费的时间
```

![](https://images.maiquer.tech/images/wx/image-20220712144555133.png)

### 布尔数组的函数

| 函数名称 | 描述                     |
| -------- | ------------------------ |
| np.any   | 验证任何一个元素是否为真 |
| np.all   | 验证所有元素是否为真     |

比如想看下数组中是不是所有元素都为0，那么可以通过以下代码来实现：

```python
np.all(a==0) 
# 或者是
(a==0).all()
```

比如我们想要看数组中是否有等于0的数，那么可以通过以下代码来实现：

```python
np.any(a==0)
# 或者是
(a==0).any()
```

### 排序

1. `np.sort`：指定轴进行排序。默认是使用数组的最后一个轴进行排序。

   ```python
    a = np.random.randint(0,10,size=(3,5))
    b = np.sort(a) 	# 按照行进行排序，因为最后一个轴是1，那么就是将最里面的元素进行排序。
    c = np.sort(a,axis=0) 	# 按照列进行排序，因为指定了axis=0
   ```

   还有`ndarray.sort()`，这个方法会直接影响到原来的数组，而不是返回一个新的排序后的数组。

2. `np.argsort`：返回排序后的下标值。示例代码如下：

   ```python
    np.argsort(a) 	# 默认也是使用最后的一个轴来进行排序。
   ```

3. 降序排序：`np.sort`默认会采用升序排序。如果我们想采用降序排序。那么可以采用以下方案来实现：

   ```python
    # 1. 使用负号
    -np.sort(-a)
   
    # 2. 使用sort和argsort以及take
    indexes = np.argsort(-a) 	#排序后的结果就是降序的
    np.take(a,indexes) #从a中根据下标提取相应的元素
   ```

# 函数和方法`method`总览

这是个`numpy`函数和方法分类排列目录。这些名字链接到`numpy`示例，你可以看到这些函数起作用：

### 创建数组

```
arange, array, copy, empty, empty_like, eye, fromfile, fromfunction, identity,   
linspace, logspace, mgrid, ogrid, ones, ones_like, r, zeros, zeros_like
```

### 转化

```
astype, atleast 1d, atleast 2d, atleast 3d, mat
```

### 操作

```
array split, column stack, concatenate, diagonal, dsplit, dstack, hsplit, hstack, item,   
newaxis, ravel, repeat, reshape, resize, squeeze, swapaxes, take, transpose, vsplit, vstack
```

### 询问

```
all, any, nonzero, where
```

### 排序

```
argmax, argmin, argsort, max, min, ptp, searchsorted, sort
```

### 运算

```
choose, compress, cumprod, cumsum, inner, fill, imag, prod, put, putmask, real, sum
```

### 基本统计

```
cov, mean, std, var
```

### 基本线性代数

```
cross, dot, outer, svd, vdot
```
