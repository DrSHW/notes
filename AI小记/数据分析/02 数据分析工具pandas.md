# 数据分析工具pandas

## 为什么要学习pandas?

**那么问题来了**：

numpy已经能够帮助我们处理数据，能够结合matplotlib解决我们数据分析的问题，那么pandas学习的目的在什么地方呢？

numpy能够帮我们处理处理数值型数据，但是这还不够， 很多时候，我们的数据除了数值之外，还有字符串，还有时间序列等

> 比如：我们通过爬虫获取到了存储在数据库中的数据

所以，pandas出现了。

## 什么是Pandas?

> Pandas的名称来自于面板数据（panel data ）

Pandas是一个强大的分析结构化数据的工具集，基于NumPy构建，提供了**高级数据结构**和**数据操作工具**，它是使Python成为强大而高效的数据分析环境的重要因素之一。

- 一个强大的分析和操作大型结构化数据集所需的工具集
- 基础是NumPy，提供了高性能矩阵的运算
- 提供了大量能够快速便捷地处理数据的函数和方法
- 应用于数据挖掘，数据分析
- 提供数据清洗功能

## 官网：

<http://pandas.pydata.org/>

## Pandas的数据结构分析

### pandas模块简介

首先，使用pandas相应的操作之前都需要导入pandas模块

```python
import pandas as pd
import numpy as np  	# 导入pandas和numpy模块
```

1、pandas中具有两种常见的数据结构

![](https://images.maiquer.tech/images/wx/1647499916237.png)
#### Series
它是指一维列表或者数组(列向量)，和numpy中的array比较类似，可以储存很多不同类型的数据类型；

比如我们说的整数，字符串，浮点数，主要由一组数据于之相关两部分构成。接下来通过一张图来描述Series的结构，具体如下

![](https://images.maiquer.tech/images/wx/1647499987540.png)

```python
pandas.Series(data=None,index=None,dtype=None,name=None,copy=False,fastpath=False)
```

上述构造方法中常用参数的含义如下：

+ **data**：传入的数据，可以是`ndarray`，`list`等。

+ **index**：索引，必须唯一，且与数据的长度相同。如果没有传入索引参数，则默认自动创建一个索引从0-N的整数索引。

+ **dtype**：数据的类型

+ **copy**：是否复制数据，默认为False

```python
import pandas as pd
ser_obj = pd.Series(data=[1,2,3,4,5])
print(ser_obj)
```

指定索引

```python
ser_obj = pd.Series(data=[1,2,3,4,5], index=['a','b','c','d','e'])
print(ser_obj)
```

通过使用列表构建Series类对象外，还可以使用`dict`进行构建，具体代码如下

```python
year_data = {2018:17.8, 2019:20.1, 2020:16.5}
ser_obj2 = pd.Series(data=year_data)
print(ser_obj2)
```

```python
info = {"name":"zhangsan", "title":"teacher"}
data = pd.Series(data=info)
print(data)
print(data.index)	# Index(['name', 'title'], dtype='object')
print(data.values)	# ['zhangsan' 'teacher']
print(data[1])	# teacher
print(data + "ha")
```

为了方便地操作Series对象中的索引和数据，所以该对象提供了两个属性`index`和`values`分别针对这个类型获取。列如，获取刚刚创建的`ser_obj`对象的索引和数据

#### DataFrame

DataFrame：一个表格型的数据结构，包含有一组有序的列，每列可以是不同的值类型(数值、字符串、布尔型等)，DataFrame即有行索引也有列索引，可以被看做是由Series组成的字典。

![](https://images.maiquer.tech/images/wx/1647500023267.png)

pandas的DataFrame类对象可以使用以下方法进行构建

```python
pandas.DataFrame(data=None,index=None,columns=None,dtype=None,copy=False)
```

构造方法的常用参数所表示的含义如下：

（1 ）**index**：行标签。如果没有传入索引参数，则默认会自动创建一个0-N的整数索引。

（2 ）**columns**: 列标签。如果没有传入索引参数，则默认会自动创建一个0-N的整数索引。

为了能够要读者更好的了解下面是是代码

```python
import numpy as np
import pandas as pd
demo_arr = np.array([['a','b','c'], ['d','e','f']])
df_obj = pd.DataFrame(demo_arr)
print(df_obj)
```

在上面我们创建了一个2行3列的数组`demo_arr`, 然后通过`demo_arr`构建一个DataFrame对象的`df_obj`。输出结果来看都是自动从0开始的。

如果创建dataframe时，为其指定了列索引，则Dataframe的列会按照指定索引进行顺序排序，代码如下

```python
# 创建DataFrame对象，指定列索引
df_obj = pd.DataFrame(demo_arr, columns=['No1', 'No2', 'No3'])
print(df_obj)
```

为了方便获取数据每列的数据，我们可以使用列的索引的方式进行获取，也可以通过属性的方式获取列数据，返回的是一个Series

对象，该对象对原有的Dataframe有相同的行索引。

列如：获取的列索引为“No2”的一列数据，具体代码如下。

```python
element = df_obj['No2']  # 通过列索引的方式获取一列数据，更推荐使用这种方式
print(element)
```

下面使用相同的属性方式，获取为No2的一列数据，具体代码如下。

```python
element = df_obj.No2  	# 通过属性获取列数据
print(element)
```

注意：在获取DataFrame的一列数据时，推荐使用列索引的方式完成，主要是因为在实际应用中，列索引的名称中可能带有一些特殊字符（如空格 ），这时使用“点字符”访问就显得太合适了

要想在DataFrame增加一列数据，则可以通过给列索引或者列名称赋值得方式实现，类似于给字典增加健值对得操作。不过，新增列得长度于其他列得长度保持一致，否则会出现valueError异常。代码如下：

```python
df_obj['No4'] = ['g', 'h']
print(df_obj)
```

如果想删除某一列数据，则可以使用del语句实现，代码示例如下：

```python
del df_obj['No3']
print(df_obj)
```
举个例子：
```python
df = pd.DataFrame(data=[[80,75,90],[68,96,85]],index=["小明","小户"],columns=["语文","数学","英语"])
print(df)
print(df.数学)
print(type(df.数学))			  	# <class 'pandas.core.series.Series'>
print(df["数学"])				
print(df.index)					 # Index(['小明', '小户'], dtype='object')
print(df.values)
```

增加/删除一列索引:

```python
df["历史"] = [90, 68]
del df["英语"]
print(df)
```

## Pandas索引操作以及高级索引

在pandas中的索引都是index类对象，又称为索引对象，该对象是不可以进行修改的，以保障数据的安全。

Pandas还提供了很多Index的子类，常见的有如下几种:
(1) Int64Index: 针对整数的特殊Index对象。

(2) MultiIndex: 层次化索引，表示单个轴上的多层索引。
(3) DatetimeIndex: 存储纳秒级时间戳。

##### 索引对象

在之前介绍的Series和DataFrame结构中，我们已经接触到了索引对象，它是pandas的重要组成部分。pandas定义了**index**类来表示基本索引对象，想要获取数据的索引对象，只需调用数据的index属性即可`index=df.index`。

列如创建一个Series类对象，为其指定索引，然后再对索引重新赋值会提示“索引不支持不可变操作”的错误信息代码如下：

```python
import pandas as pd
ser_obj = pd.Series(range(5), index=['a','b','c','d','e'])
ser_index = ser_obj.index
print(ser_index) 	# Index(['a', 'b', 'c', 'd', 'e'], dtype='object')
# ser_index['2'] = 'cc'  	# 报错，修改/重置索引只能使用reindex方法
```

##### 重置索引

在pandas中，经常对数据进行处理 而导致数据索引顺序混乱，从而影响数据读取、插入等。

`reindex()`是pandas对象的一个重要方法，其作用是创建一个新索引的新对象，对于DataFrame对象，`reindex`能修改行索引和列索引。

Pandas中提供了一个重要的方法是`reindex()`,该方法的作用是对原索引和新索引进行匹配，也就是说，新索引含有原索引的数据，而原索引数据按照新索引排序

如果新索引中没有原索引数据，那么程序不仅不会报错，而且会添加新的索引，并将值填充为NaN或者使用`fill_values()`填充其他值。

应用背景：

1、当你的数据量过大，而你的索引最初创建的分片数量不足，导致数据入库较慢的情况，此时需要扩大分片的数量，此时可以尝试使用`reindex`。

2、当数据的mapping需要修改，但是大量的数据已经导入到索引中了，重新导入数据到新的索引太耗时；但是在ES中，一个字段的mapping在定义并且导入数据之后是不能再修改的，

所以这种情况下也可以考虑尝试使用`reindex`。

```python
DataFrame.reindex(labels=None,index=None,colums=None,axis=None,method=None,copy=True,level=None,fill_value=nan,limit=None,tolerance=None)
```

+ **index**: 用作索引的新序列。

+ **method**: 插值填充方式。

+ **fill_value**: 引入缺失值时使用的替代值

+ **limit**: 前向或者后向填充时最大填充量

小笔总结了以下几种重置索引的方法：

```python
import pandas as pd
ser_obj = pd.Series([1, 2, 3, 4, 5], index=['c', 'd', 'a', 'b', 'e'])
print(ser_obj)

# 重新索引
ser_obj2 = ser_obj.reindex(['a', 'b', 'c', 'd', 'e', 'f'])
print(ser_obj2)
df.rename(columns={'score':'popularity'}, inplace = True)
# 重新索引时指定填充的缺失值
ser_obj2 = ser_obj.reindex(['a', 'b', 'c', 'd', 'e', 'f'], fill_value = 6)
print(ser_obj2)

# 创建Series对象，并为其指定索引
ser_obj3 = pd.Series([1, 3, 5, 7], index=[0, 2, 4, 6])
print(ser_obj3)

ser_obj4 = ser_obj3.reindex(range(6), method = 'ffill')   # 重新索引，前向填充值(若该数据为Nan或None,取前一个值)
print(ser_obj4)
ser_obj4 = ser_obj3.reindex(range(6), method = 'bfill')	  # 重新索引，后向填充值(若该数据为Nan或None,取后一个值)
print(ser_obj4)
```

##### 索引操作

Series类对象属于一维结构，它只有行索引，而DataFrame类的对象属于二维结构，它同时有行索引于列索引。由于他们的结构有所不同，所以他们索引操作也会有所不同，接下来，为大家介绍一下，series与DataFrame索引操作。

1. Series的索引操作

   Series有关索引用法类似于Numpy的数组索引，只不过Series的索引值不只是整数，如果我们希望获取一个数据，就需要通过索引的位置来获取，也可以通过索引名来获取，列如：

   ```python
   import pandas as pd
   ser_obj = pd.Series([1, 2, 3, 4, 5], index=['a', 'b', 'c', 'd', 'e'])
   print(ser_obj[2])       # 3，使用索引位置获取数据 
   print(ser_obj['c'])	# 3，使用索引名称获取数据 
   ```

   当然，Series也可以通过切片来获取数据。不过，如果使用的位置索引来切片，则切片的结果和list类似，既包含起始位置但不包含结束位置；如果使用索引名称进行切片，则切片结果是包含结束的位置的，列如：

   ```python
   print(ser_obj['c'])   	 	# 3 使用索引名称获取数据
   print(ser_obj[2: 4])     	# 使用位置索引进行切片
   '''
   c    3
   d    4
   dtype: int64
   '''
   print(ser_obj['c': 'e'])        # 使用索引名称进行切片，此时最末尾的元素也会包含
   '''
   c    3
   d    4
   e    5
   dtype: int64
   '''
   ```

   如果希望获取的不连续的数据，则可以通过不连续索引来实现

   ```python
   print(ser_obj[[0, 2, 4]])          	# 通过不连续位置索引获取数据集
   '''
   a    1
   c    3
   e    5
   dtype: int64
   '''
   print(ser_obj[['a', 'c', 'd']])   	# 通过不连续索引名称获取数据集
   '''
   a    1
   c    3
   d    4
   dtype: int64
   '''
   ```

   布尔型同样适合用于Pandas，具体用法是跟数组的用法一样，将布尔型的数组索引作为模板选数据，返回于模板中Ture位置对应的元素，具体代码如下。

   ```python
   ser_bool = ser_obj > 2         	# 创建布尔型Series对象
   print(ser_bool)
   '''
   a    False
   b    False
   c     True
   d     True
   e     True
   dtype: bool
   '''
   print(ser_obj[ser_bool])          	# 获取结果为True的数据
   '''
   c    3
   d    4
   e    5
   dtype: int64
   '''
   ```


2. DataFrame的索引操作

   ![](https://images.maiquer.tech/images/wx/1647500055003.png)

   

   下面我们创建有一个3行4列的DataFrame对象，并且获取其中的1列数据，具体代码如下

   ```python
   arr = np.arange(12).reshape(3, 4)
   df_obj = pd.DataFrame(arr, columns=['a', 'b', 'c', 'd'])
   print(df_obj)
   print(df_obj['b'])
   ```

   如果从DataFrame中获取多个不连续Series对象，则同样可以使用不连续索引进行实践实现，具体代码如下：

   ```python
   print(df_obj[['b', 'd']])        # 获取不连续的Series对象
   print(df_obj[:2])                # 使用切片获取第0~1行的数据
   # 使用多个切片先通过行索引获取第0~2行的数据，再通过不连续列索引获取第b、d列的数据
   print(df_obj[:3][['b', 'd']])
   ```


##### 多学一招

虽然DataFrame操作索引能够满足基本数据查看请求，但是仍然不够灵活。为次pandas库提供了操作索引的方法来访问数据，具体包括：

**loc**：基于标签索引（索引名称，如a，b，等 ）用于按标签选取数据，当执行切片操作时，既包含起始索引，也包含结束索引。

**iloc**：基于位置索引（整数索引，从0到length-1 ），用于按位置选取数据。当你执行切片操作时，只包含起始索引，不包含结束索引。**（左开右闭 ）**

`iloc`方法主要使用整数来索引数据，而不能使用字符标签来索引数据。而`loc`方法则相反，它只能使用字符标签来索引数据，而不能使用整数来索引数据。不过，当DataFrame对象行索引或列索引使用的是整数时，则其就可以使用整数来索引。

假设，现在有一个DataFrame对象，具体代码如下：

```python
arr = np.arange(16).reshape(4, 4)
dataframe_obj = pd.DataFrame(arr, columns=['a', 'b', 'c', 'd'])
print(dataframe_obj)
# 如果希望能够完成行后列的索引方式
print(dataframe_obj.loc[:, ["c", "a"]])
```

## 算术运算与数据对齐

pandas执行算术运算时，会先按照索引对齐，对对齐以后在进行相应的运算，没有对齐的位置会使用Nan进行补齐，其中，series是按行索引对齐的。

![](https://images.maiquer.tech/images/wx/1647500162627.png)

假设有两个series对象，创建代码如下：

```python
obj_one = pd.Series(range(10, 13), index=range(3)) 
print(obj_one)

obj_two = pd.Series(range(20, 25), index=range(5))
print(obj_two)
```

如果对`obj_one+obj_two`进行加法运算时，则会将他们按照索引先进行行对齐，对齐的位置进行加法运算，没有对齐的位置使用NAN值进行填充，具体代码如下。

```python
print(obj_one + obj_two)
```

如果不希望使用NAN填充缺少数据，则可以使用在调用`add`方法时提供`fill_value`参数的值，`fill_value`将对象中存在的数据进行补充，具体代码如下：

```python
print(obj_one.add(obj_two, fill_value=0))   	# 先补充缺失值，再执行加法运算
```

## 数据排序

数据排序是按一定顺序将数据排列，以便于研究者通过浏览数据发现一些明显的特征趋势或解决问题的线索，除此之外，排序还有助于对数据检查纠错，以及为重新归类分组等提供依据。在某些场合，排序本身就是分析的目的之一。

##### 按照索引排序

Pandas使用`sort_index()`方法，该方法可以进行行索引或者列索引进行排序，`sort_index()`方法的语法格式如下：

具体参数如下：

```python
sort_index(axis=0, level=None, ascending=True, inplace=False, kind=‘quicksort’, na_position=‘last’, sort_remaining=True, by=None)
```

+ **axis**：0按照行名排序；1按照列名排序
+ **level**：默认None，否则按照给定的`level`顺序排列—貌似并不是，文档
+ **ascending**：默认True升序排列；False降序排列
+ **inplace**：默认False，否则排序之后的数据直接替换原来的数据框
+ **kind**：排序方法，`{‘quicksort’, ‘mergesort’, ‘heapsort’}`, 默认为 `‘quicksort’`。似乎不用太关心。
+ **na_position**：缺失值默认排在最后`{“first”,“last”}`
+ **by**：按照某一列或几列数据进行排序

默认情况下，pandas对象是按照升序排列，当然也可以通过`ascending=False`进行降序，接下来，通过一些简单示例来掩饰如何按索引对

Series和DataFrame分别进行排序代码如下。

```python
import pandas as pd
ser_obj = pd.Series(range(10, 15), index=[5, 3, 1, 3, 2])
print(ser_obj)
```

```python
print(ser_obj.sort_index())       	# 按索引进行升序排列
print(ser_obj.sort_index(ascending = False))  	# 按索引进行降序排列
```

对DataFrame的索引进行排序，示例代码如下。

```python
import pandas as pd
import numpy as np
df_obj = pd.DataFrame(np.arange(9).reshape(3, 3), index=[4, 3, 5])
print(df_obj)

print(df_obj.sort_index())                     	# 按索引升序排列

print(df_obj.sort_index(ascending=False))     	# 按索引降序排列
```

需要注意的是，当对DataFrame进行排序操作时，要注意轴的方向。

如果没有指定`axis`参数的值，则默认会按照行索引进行排序；如果指定`axis=1`，则会按照列索引进行排序。

##### 按值排序

Pandas中用来按照值排序的方法为`sort_values`,该方法的语法格式如下：

```python
DataFrame.sort_values(by, axis=0, ascending=True, inplace=False, kind='quicksort', na_position='last')  
```

##### 参数说明   

**axis**: `{0 or ‘index’, 1 or ‘columns’}`, 默认为 `0`，默认按照索引排序，即纵向排序，如果为1，则是横向排序   
**by**: `str or list of str`；如果`axis=0`，那么`by="列名"`；如果`axis=1`，那么`by="行名"`；  
**ascending**: 布尔型，True则升序，可以是`[True,False]`，即第一字段升序，第二个降序  
**inplace**: 布尔型，是否用排序后的数据框替换现有的数据框  
**kind**: 排序方法，`{‘quicksort’, ‘mergesort’, ‘heapsort’}`, 默认为`‘quicksort’`。似乎不用太关心  
**na_position** : `{‘first’, ‘last’}`, 默认为 `‘last’`，代表默认缺失值排在最后面  

按值得大小对Series进行排序的示例代码如下。

```python
ser_obj = pd.Series([4, np.nan, 6, np.nan, -3, 2])
print(ser_obj)
print(ser_obj.sort_values())   	# 按值升序排列
```

在DataFrame中，`sort_values()`方法可以根据一个多个列中的值进行排序，但是需要在排序时将一个或者多个列的索引传递给`by`参数才行，示例代码如下：

```python
import pandas as pd
import numpy as np
df_obj = pd.DataFrame([[0.4, -0.1, -0.3, 0.0],
                       [0.2, 0.6, -0.1, -0.7],
                       [0.8, 0.6, -0.5, 0.1]])
print(df_obj)

print(df_obj.sort_values(by=2))  	# 对列索引值为2的数据进行排序
print(df_obj.sort_values(by=[1,2]))
```

## 统计计算与描述

pandas提供了许多跟数学和统计相关的方法，其中大部分都属于汇总统计，用来从Series中获取某个值（如`max`或`min` ），或者从DataFrame的列中提取出来，接下来我们就来详细介绍一下。

##### 常用的统计计算

Pandas为我们提供了非常多的描述统计分析方法，比如**总和，均值，最小值，最大值**等，接下来，通过一张表来具体说明：

| 函数名称       | 说明                 | 函数名称       | 说明                              |
| :------------- | -------------------- | -------------- | --------------------------------- |
| sum            | 计算和               | std            | 样本值得标准差                    |
| mean           | 计算平均值           | skew           | 样本值得偏度                      |
| median         | 获取中位数           | kurt           | 样本值得峰度                      |
| max，min       | 获取最大值和最小值   | cumsum         | 样本值得的累积和                  |
| idxmax，idxmin | 获取最大和最小索引值 | cummin，cummax | 样本值的累积和最小值和最大值      |
| count          | 计算非NaN值的个数    | cumprod        | 样本值的累计值                    |
| head           | 获取前N个值          | describe       | 对Series和DataFrame列计算汇总统计 |
| var            | 样本值得方差         |                |                                   |

下面通过一些示例来演示上述部分方法的使用。列如，创建一个三行四列的DataFrame对象，它的列索引为a，b，c，d，具体代码如下：

```python
df_obj = pd.DataFrame(np.arange(12).reshape(3, 4), columns=['a', 'b', 'c', 'd'])
print(df_obj)

print(df_obj.sum())          	# 计算每列元素的和

print(df_obj.max())         	# 获取每列的最大值

print(df_obj.min(axis=1))   	# 沿着横向轴，获取每行的最小值
```

##### 统计描述

如果希望一次性输出多个统计指标，比如平均值，最大值，求和等，则我们可以通用`describe()`方法实现，而不用单独地调用相应的统计方法。`describle()`方法如下：

```
describe(precentiles=None,include=None,exclude=None)
```

percentiles:输出中包含的百分数，位于[0,1]之间。如果不设置该参数，则默认为[0.25,0.5,0.75]，返回25%，50%，75%分位数。

```python
df_obj = pd.DataFrame(np.arange(12).reshape(3, 4), columns=['a', 'b', 'c', 'd'])
print(df_obj)
print(df_obj.sum())          	# 计算每列元素的和默认按照列求和
print(df_obj.max())         	# 获取每列的最大值
print(df_obj.min(axis=1))  	 	# 沿着横向轴，获取每行的最小值
```

```python
df_obj = pd.DataFrame([[12, 6, -11, 19], 
                       [-1, 7, 50, 36],
                       [5, 9, 23, 28]])
print(df_obj)
print(df_obj.describe())	# 打印大部分重要信息，describe方法很常用！
```

## 层次化索引

层次化索引是Pandas的一项重要功能，它使你能在一个轴上拥有多个（两个以上 ）索引级别。

前面所涉及的Pandas对象都只有一层索引结构，又称为单层索引，层次化索引可以理解为单层索引的延伸，即在一个轴方向上具有多层索引。

![](https://images.maiquer.tech/images/wx/1647500192076.png)

创建一个**Series**，并用一个由列表或数组组成的列表作为索引。

第一个是外层次索引，第二个是内层索引。

```python
import pandas as pd
mulitindex_series = pd.Series([15848,13472,12073.8,7813,7446,6444,15230,8269],
                              index=[['河北省','河北省','河北省','河北省',
                                      '河南省','河南省','河南省','河南省'],
                                     ['石家庄市','唐山市','邯郸市','秦皇岛市',
                                      '郑州市','开封市','洛阳市','新乡市']])
print(mulitindex_series)
```

```python
import pandas as pd
from pandas import DataFrame,Series
# 占地面积为增加的列索引
mulitindex_df = DataFrame({'占地面积':[15848,13472,12073.8,7813,
                                   7446,6444,15230,8269]},
                          index=[['河北省','河北省','河北省','河北省',
                                  '河南省','河南省','河南省','河南省'],
                                 ['石家庄市','唐山市','邯郸市','秦皇岛市',
                                  '郑州市','开封市','洛阳市','新乡市']])
print(mulitindex_df)
```

这就是带`MultiIndex`索引的Series的格式化输出形式。索引之间的“间隔”表示“直接使用上面的标签”。

+ `Multilndex.from_tuples()`: 将元组列表转换为`Multilndex`。
+ `MultiIndex.from_arrays()`: 将数组列表转换为`MultiIndex`。
+ `Multilndex.from_product()`: 从多个集合的笛卡尔乘积中创建一个`MultiIndex`。

对于一个**层次化索引**的对象，**选取数据子集**的操作很简单：

**from_tuples()**: 可以将包含若干个元组的列表转换为`Multilndex`对象，其中元组的第一个元素作为外层索引，元组的第二个元素作为内层索引。

```python
from pandas import MultiIndex
# 创建包含多个元组的列表
list_tuples = [('A','A1'), ('A','A2'), ('B','B1'),
               ('B','B2'), ('B','B3')]
# 根据元组列表创建一个MultiIndex对象
multi_index = MultiIndex.from_tuples(tuples=list_tuples, 
                                     names=[ '外层索引', '内层索引'])
print(multi_index)
```

**from_arrays():** 将数组列表转换为`Multilndex`对象，其中嵌套的第一个列表将作为外层索引，嵌套的第二个列表将作为内层索引。

```python
from pandas import MultiIndex
# 根据列表创建一个MultiIndex对象
multi_array = MultiIndex.from_arrays(arrays =[['A', 'B', 'A', 'B', 'B'], 
                                              ['A1', 'A2', 'B1', 'B2', 'B3']],
                                     names=['外层索引','内层索引'])
print(multi_array)
```

```python
# 导入所需要的包
import pandas as pd
import numpy as np
values = np.array([[1, 2, 3], [8, 5, 7], [4, 7, 7],
                   [5, 5, 4], [4, 9, 9]])
multi_array = pd.MultiIndex.from_arrays(arrays =[['A', 'B', 'A', 'B', 'B'], 
                                              ['A1', 'A2', 'B1', 'B2', 'B3']],
                                     names=['外层索引','内层索引'])
df_array = pd.DataFrame(data=values, index=multi_array)
print(df_array)
```

**from_product()**: 从多个集合的笛卡尔乘积中创建一个`MultiIndex`

```python
# 创建MultiIndex对象
import pandas as pd
numbers = [0, 1, 2]
colors = ['green', 'purple']
multi_product = pd.MultiIndex.from_product([numbers, colors], names=['number', 'color'])
print(multi_product)
```

```python
# 导入所需要的包
import pandas as pd
import numpy as np
# 使用变量values接收DataFrame对象的值
values = np.array([[7, 5], [6, 6], [3, 1], [5, 5], [4, 5], [5, 3]])
numbers = [0, 1, 2]
colors = ['green', 'purple']
multi_product = pd.MultiIndex.from_product([numbers, colors], names=['number', 'color'])
df_product = pd.DataFrame(data=values, index=multi_product)
print(df_product)
```

##### 层次化索引操作

假设某商城在3月份统计了书籍的销售情况,并记录在下表中。

![](https://images.maiquer.tech/images/wx/1647500220956.png)

从左边数第1列的数据表示书籍的类别，第2列的数据表示书籍的名称，第3列的数据表示书籍的销售数量。其中，第1列作为外层索引使用，第2列作为内层索引使用。

```python
import pandas as pd
ser_obj = pd.Series([50, 60, 40, 94, 63, 101, 200, 56, 45],
                 index=[['小说', '小说', '小说',
                         '散文随笔', '散文随笔', '散文随笔',
                         '传记', '传记', '传记'],
                        ['高山上的小邮局', '失踪的总统', '绿毛水怪',
                         '皮囊', '浮生六记', '自在独行',
                         '梅西', '老舍自传', '库里传']])
print(ser_obj)
```

如果商城管理员需要统计小说销售的情况，则可以从表中筛选出外层索引标签为小说的数据。

交换分层顺序是指交换外层索引和内层索引的位置

![](https://images.maiquer.tech/images/wx/1647500246516.png)

  在`pandas`中，交换分层顺序的操作可以使用`swaplevel()`

要想按照分层索引对数据排序，则可以通过`sort_index()`方法实现。

![](https://images.maiquer.tech/images/wx/1647500278257.png)

`sort_index()`方法格式如下：

```python
sort_index(axis=0, level=None, ascending=True, inplace=False, kind='quicksort', na_position='last', sort_remaining=True, by=None)
```

**axis**：0按照行名排序；1按照列名排序
**level**：默认None，否则按照给定的level顺序排列---貌似并不是，文档
**ascending**：默认True升序排列；False降序排列
**inplace**：默认False，否则排序之后的数据直接替换原来的数据框
**kind**：排序方法，`{‘quicksort’, ‘mergesort’, ‘heapsort’}`, 默认为 `‘quicksort’`。似乎不用太关心
**na_position**：缺失值位置`{"first","last"}`，默认为`last`，代表排在最后
**by**：按照某一列或几列数据进行排序，但是`by`参数不建议使用

```python
# 接上
print(ser_obj['小说'])     	# 获取所有外层索引为“小说”的数据
'''
高山上的小邮局    50
失踪的总统      60
绿毛水怪       40
dtype: int64
'''
print(ser_obj[:,'自在独行'])       		  # 获取内层索引对应的数据
'''
散文随笔    101
dtype: int64
'''
print(ser_obj.swaplevel())               # 交换外层索引与内层索引位置
'''
高山上的小邮局  小说       50
失踪的总统    小说       60
绿毛水怪     小说       40
皮囊       散文随笔     94
浮生六记     散文随笔     63
自在独行     散文随笔    101
梅西       传记      200
老舍自传     传记       56
库里传      传记       45
dtype: int64
'''
```

```python
from pandas import DataFrame, Series
df_obj = DataFrame({'str':['a','b','d','e','f','k','d','s','l'],
                    'num':[1, 2, 4, 5, 3, 2, 6, 2, 3]},
                   index=[['A', 'A', 'A', 'C', 'C', 'C', 'B', 'B', 'B'],
                          [1, 3, 2, 3, 1, 2, 4, 5, 8]])
print(df_obj.sort_index())
print(df_obj.sort_values(by="num", ascending=False))
```



## 读写数据操作

对数据进行分析时，通常不会将需要的数据直接写入到程序中，这样不仅造成数据臃肿，而且可利用率低。常用的方法是将需要的分析数据储存到本地中，之后在对储存的数据进行读取，针对不同文件的储存文件，Pandas读取数据方式是不同的。接下来，本章节针对不同存储文件格式的读写介绍。

##### 读写文本文件

CSV文件是一种纯文本文件，可以使用任何文本编辑器进行编辑，它支持追加模式，节省内存开销。因为csv文件具有诸多的优点，所以在许多时候会将数据保存到csv文件中。

###### to_csv()方法

这个方法可以传递一些参数:

```python
DataFrame.to_csv(path_or_buf=None, sep=', ', columns=None, header=True, index=True, index_label=None, mode='w', encoding=None)
```

- **path_or_buf** :文件保存的路径;

- **sep** :默认是以 , 进行分割 , 也可以自己制定;

- **columns** : 保存索引列和指定列;

- **index**:是否写进行索引 0或者1;

- **header**: `bool or list of string`, 默认为 `True`;

  下面通过代码更好地理解to_csv的方法：

  ```python
  import pandas as pd
  df = pd.DataFrame({'one_name':[1,2,3], 'two_name':[4,5,6]})
  # 将df对象写入到csv格式的文件中
  df.to_csv(r'./itcast.csv',index=False)
  # 写入完毕
  ```


###### read_csv()

接下来我们使用`read_csv()`读取当前目录下的`itcast.csv`的文件代码如下：

```python
import pandas as pd
file = open(r"./itcast.csv")
# 读取指定目录下的csv格式的文件
file_data = pd.read_csv(file)
print(file_data)
```

##### 读写excel文件

Excel文件也是比较常见的用于储存数据的方式，它里面的数据均是以二维表格的形式显示的，可以对数据进行统计，分析等操作。Excel的文件扩展名有.xls和.xlsx两种。

###### to_excel()方法

to_excel()的方法功能是将DataFrame对象写入Excel工作表中，该方法的语法格式如下：

```python
to_excel(excel_writer, sheet_name='sheet1', na_rep=' ', float_format=None, columns=None, header=True, index=True, index_label=None, startrow=0, startcol=0, engine=None, merge_cells=True, encoding=None, inf_rep='inf', verbose=True, freeze_panes=None)
```

上述方法中常用参数的含义有以下几个：

+ **excel_writer**：表示读取得文件路径
+ **sheet_name**：表示工作表的名称，可以接受字符串，默认为“sheet1”
+ **na_rep**: 表示缺失数据，不写默认为空
+ **index**：表示是否写行索引，默认为True

```python
import pandas as pd
df1 = pd.DataFrame({'name': ['DrSHW', 'Dustella'], 'age': [20, 20]})
df1.to_excel(r'./itcast.xlsx', 'pythonvip班')
# 写入完毕
```

###### read _excel()函数

read_excel()函数的作用是将Excel文件中的数据读取出来，并转换成DataFrame对象，其语法格式如下：

```python
pd.read_excel(io, sheetname=0,header=0,skiprows=None,index_col=None,names=None,
                arse_cols=None,date_parser=None,na_values=None,thousands=None, 
                convert_float=True,has_index_names=None,converters=None,dtype=None,
                true_values=None,false_values=None,engine=None,squeeze=False,**kwds)
```

上述函数的中常用参数的表示含义如下：

- **io** ：excel 路径；
- **sheetname**：默认是sheetname为0，返回多表使用sheetname=[0,1]，若sheetname=None是返回全表 。注意：int/string返回的是dataframe，而none和list返回的是dict of dataframe。
- **header** ：指定作为列名的行，默认0，即取第一行，数据为列名行以下的数据；若数据不含列名，则设定 header = None；
- **skiprows**：省略指定行数的数据
- **skip_footer**：省略从尾部数的行数据
- **index_col** ：指定列为索引列，也可以使用 u’string’
- **names**：指定列的名字，传入一个list数据

接下来，通过`read_excel()`函数将`itcast.xlsx`文件中的数据全部取出来，代码如下。

```python
import pandas as pd
excel_path =r'./itcast.xlsx'
data = pd.read_excel(excel_path)
print(data)
```

##### 读取html的表格数据

###### read_html()

在我们阅读网页数据时，有些数据是通常在html以网页中以表格的形式显示出来，对于部分数据我们可以使用pandas中的read_html()函数进行读取，并返回一个包含多个Dataframe对象的列表。read_html()函数语法格式如下：

```python
pandas.read_html(io, match='.+', flavor=None, header=None, index_col=None, skiprows=None, attrs=None, parse_dates=False, tupleize_cols=None, thousands=', ', encoding=None, decimal='.', converters=None, na_values=None, keep_default_na=True, displayed_only=True)
```

常用的参数：

+ **io**: 可以是url、html文本、本地文件等；
+ **flavor**：解析器；
+ **header**：标题行；
+ **skiprows**：跳过的行；
+ **attrs**：属性，比如 `attrs = {'id': 'table'}`；
+ **parse_dates**：解析日期；

注意：返回的结果是**DataFrame**组成的**list**。

接下来，我们通过一个示例来演示任何使用`read_html()`函数读取HTML表格中的数据，具体代码如下：

```python
import pandas as pd
import requests
html_data = requests.get('http://kaoshi.edu.sina.com.cn/college/majorlist/')
html_table_data = pd.read_html(html_data.content,encoding='utf-8')
html_table_data[1]
```

##### 读写数据库

在大多数情况下，海量的数据是使用数据库进行储存的，这主要是依赖于数据库的数据结构化，数据共享性，独立性等特点，因此，在实际生产环境中，绝大数数据库都是以存储在数据库中。pandas支持mysql，Oracle，SQLite等主流数据库读写操作。

为了高效地对数据库中的数据进行读取，这里主要引入`SQLALchemy`。`SQLAlchemy`是python的一个数据库ORM工具，提供了强大的对象模型间的转换，可以满足绝大多数数据库操作的需求，并且支持多种数据库引擎（sqlite，mysql，postgres, mongodb等 ）。

pandas的`io.sql`模块中使用了常用的读写数据库函数，具体如下：

| 函数             | 说明                                                  |
| ---------------- | ----------------------------------------------------- |
| read_sql_table() | 将读取的整张数据表中的数据转换成DataFrame对象         |
| read_sql_query() | 将sql语句读取的结果转成DataFrame对象                  |
| read_sql()       | 上述两个函数的结合，既可以读取数据表也可以读取sql语句 |
| to_sql()         | 将数据写入到sql数据库中。                             |

在表列中列举了各个函数的具体的功能，注意，在连接mysql数据库时，这里使用的是`mysqlconnector`驱动，如果当前的python环境中没有该模块，则需要使用`pip install mysql -connector`

###### read_sql()函数

`read_sql()`函数既可以读取整张表的数据表，也可以执行SQL语句，其语法格式如下：

`````python
pandas.read_sql(sql, con, index_col=None, coerce_float=True, params = None)
`````

返回与查询字符串的结果集相对应的`DataFrame`。

（可选 ）提供`index_col`参数以将列之一用作索引。否则将为`0到len - 1`。

| 参数         | 说明                                                                                                      |
| :----------- | :-------------------------------------------------------------------------------------------------------- |
| sql          | 字符串，要执行的SQL查询。                                                                                 |
| con          | DB连接对象，可选。                                                                                        |
| index_col    | 字符串，可选用于返回的DataFrame对象的列名称。                                                             |
| coerce_float | 布尔值，默认为True。尝试将值转换为非字符串，非数字对象（如`decimal.Decimal` ）为浮点，对SQL结果集很有用。 |
| params       | 列表或元组，可选，传递给执行方法的参数列表。                                                              |

如果发现数据中存在空值，则会使用NaN进行补全。

接下来，通过一个示例演示如何使用`read_sql()`函数读取数据库中数据表`Person_info`,代码如下。

```python
import pandas as pd
from pandas import DataFrame,Series
from sqlalchemy import create_engine
# mysql账号为root  密码为123456 数据名：info
# 数据表名称：person_info
# 创建数据库引擎
# mysql + pymysql 表示使用Mysql数据库的pymysql驱动
engine = create_engine('mysql+mysqlconnector://root:123456@127.0.0.1/info')
sql = 'select * from person_info where id >3;'
pd.read_sql(sql,engine)
```

上述示例中，首先导入`sqlalchemy`模块，通过`create_engine()`函数创建连接数据库的信息，如何在调用`read-sql`函数读取数据库中的`Person_info`数据表，并转换成`DataFrame`对象。

注意：在使用`create_engine()`函数创建连接时，其格式如下：

```
数据库类型+数据库驱动名称：//用户名：密码@机器地址：端口号/数据库
```

`read_sql()`函数还可以执行一个`sql`语句，列如，从`person`数据表筛选出id值大于3的全部数据，具体的sql语句如下：

```sql
select * from person_info where id >3
```

根据上述sql语句读取数据库里面的数据，并将执行的结果换成`DataFrame`对象，代码如下：

```python
import pandas as pd
from pandas import DataFrame,Series
from sqlalchemy import create_engine
# mysql账号为root  密码为123456 数据名：info
# 数据表名称：person_info
# 创建数据库引擎
# mysql+pymysql 表示使用Mysql数据库的pymysql驱动
engine = create_engine('mysql+mysqlconnector://root@127.0.0.1/info')
sql = 'select * from person_info where id >3;'
pd.read_sql(sql,engine)
```

需强调的是，sql语句对其他的增删改查的数据操作都是可以的。

###### to_sql()方法

`to_sql()`的方法功能是将Series或DataFrame对象以数据表的形式写入到数据库中，其语法格式如下：

```python
DataFrame.to_sql(name, con, schema=None, 
if_exists='fail', index=True, index_label=None, 
chunksize=None, dtype=None, method=None)
```

首先创建一个名叫为`students_info`的数据库，具体代码如下：

```sql
create database student_info charest=utf-8;
```

接着，调用`to_sql`函数将`DataFrame`对象写入到`students`的数据表中，具体代码如下：

```python
from pandas import DataFrame,Series
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.types import *
df = DataFrame({"班级":["一年级","二年级","三年级","四年级"],
                              "男生人数":[25,23,27,30],
                              "女生人数":[19,17,20,20]})
# 创建数据库引擎
# mysql+pymysql 表示使用Mysql数据库的pymysql驱动
# 账号：root 密码：123456 数据库名：studnets_info
# 数据表的名称： students
engine = create_engine('mysql+mysqlconnector://root@127.0.0.1/info')
df.to_sql('students',engine)
```
