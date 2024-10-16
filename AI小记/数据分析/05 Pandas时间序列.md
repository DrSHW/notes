# Pandas时间序列

时间序列（time series ）数据是一种重要的结构化数据形式，。在多个时间点观察或测量到的任何时间都可以形成一段时间序列。很多时间， 时间序列是固定频率的， 也就是说， 数据点是根据某种规律定期出现的（比如每15秒。。。。 ）。时间序列也可以是不定期的。时间序列数据的意义取决于具体的应用场景。主要由以下几种：

- 时间戳（timestamp ），特定的时刻。
- 固定时期（period ），如2007年1月或2010年全年。
- 时间间隔（interval ），由起始和结束时间戳表示。时期（period ）可以被看做间隔（interval ）的特例。

## 时间序列概述

### 时间序列的分析

在使用Python进行数据分析时，经常会遇到时间日期格式处理和转换，特别是分析和挖掘与时间相关的数据，比如量化交易就是从历史数据中寻找股价的变化规律。Python中自带的处理时间的模块有`datetime`，numpy库也提供了相应的方法，Pandas作为Python环境下的数据分析库，更是提供了强大的日期数据处理的功能，是处理时间序列的利器

什么是时间序列？

时间序列数据有很多种定义，它们以不同的方式表示相同的含义。一个简单的定义是，时间序列数据是包含序列时间戳的数据点。

- 股票价格随时间变化
- 日、周、月销售额
- 过程中的周期性测量
- 一段时间内的电力或天然气消耗率

时间序列是指多个时间点上形成的数值序列它既可以是定期出现的，也可以是不定期出现的。

![](https://images.maiquer.tech/images/wx/1647498315506.png)

![](https://images.maiquer.tech/images/wx/1647498350425.png)

间序列分析(Time-Series Analysis)是指将原来的销售分解为四部分来看——趋势、周期、时期和不稳定因素， 然后综合这些因素， 提出**销售预测**。强调的是通过对一个区域进行一定时间段内的连续遥感观测，提取图像有关特征，并分析其变化过程与发展规模。当然，首先需要根据检测对象的时相变化特点来确定遥感监测的周期，从而选择合适的遥感数据。

### 时间戳

对于时间序列的数据而言，必然少不了时间戳这一关键元素。Pandas中，时间戳的使用`TimeStamp`对象表示，该对象与`datatime`有高度兼容性，可以直接通过`datetime()`函数将`datetime`转换成`TimeStamp`对象，具体示例如下：

```python
import pandas as pd
import numpy as np
from datetime import datetime
# 以下三种表示方式均可用于时间表示
dt = pd.to_datetime("2022-11-12")
dt = pd.to_datetime("20220112")
dt = pd.to_datetime("23/12/2021")
# 创建series的时间序列
dt = pd.to_datetime(["2022-11-12", "2022-09-13", "2022-08-23"])
data = pd.Series((1,3,5), index=dt)
```
创建`DatetimeIndex`索引：
```python
from datetime import datetime
import pandas as pd
import numpy as np
dates=[
datetime(2020,1,2), datetime(2020,1,5), datetime(2020,1,7),
datetime(2020,1,8), datetime(2020,1,10), datetime(2020,1,12)
]
ts=pd.Series(np.random.randn(6), index=dates)
ts
'''
2020-01-02   -0.531751
2020-01-05   -2.063339
2020-01-07    1.046181
2020-01-08   -0.173291
2020-01-10    0.749081
2020-01-12    1.198436
dtype: float64
'''

ts.index
'''
DatetimeIndex(['2020-01-02', '2020-01-05', '2020-01-07', '2020-01-08',
'2020-01-10', '2020-01-12'],
dtype='datetime64[ns]', freq=None)
'''

ts.index.dtype
'''
dtype('<M8[ns]')
'''
```

## 时间序列的选取

可将符合格式的字符串列表转换为以`DatetimeIndex`为索引的`Series`对象：

```python
# 指定索引为多个日期字符串的列表
date_list = ['2015/05/30', '2017/02/01',
             '2015.6.1', '2016.4.1',
             '2017.6.1', '2018.1.23']
# 将日期字符串转换为DatetimeIndex 
date_index = pd.to_datetime(date_list)
# 创建以DatetimeIndex 为索引的Series对象
date_se = pd.Series(np.arange(6), index=date_index)
date_se
```

根据位置索引获取数据：

```python
time_se[3]

date_time = datetime(2015, 6, 1)
date_se[date_time]

date_se['20150530']
date_se['2018/01/23']
date_se['2015']  # 获取2015年的数据

```

除了使用索引的方式以外，还可以通过truncate()方法截取Series或DataFrame对象，该语法格式如下：

`DataFrame.truncate(before=None, after=None, axis=None, copy=True)[source]`

在某个索引值之前和之后Truncate Series或DataFrame。

参数：

1. `before`：截断此索引值之前的所有行。

2. `after` ：截断此索引值之后的所有行。

3. `axis`：截断的轴，默认为行索引方向。

例如：

```python
# 扔掉2016-1-1之前的数据
sorted_se = date_se.sort_index()
sorted_se.truncate(before='2016-1-1')

# 扔掉2016-7-31之后的数据
sorted_se.truncate(after='2016-7-31')
```

## 时间序列的生成

pandas提供了`data_range()`函数，主要生成一个具有固定的频率的`DatetimeIndex`对象，该函数的语法格式如下：

```python
pandas.date_range(start=None, end=None, periods=None, freq='D', tz=None, normalize=False, name=None, closed=None, **kwargs)
```

该函数主要用于生成一个固定频率的时间索引，在调用构造方法时，必须指定start、end、periods中的两个参数值，否则报错。

主要参数说明：

1. `periods`：固定时期，取值为整数或`None`产生多少个值

2. `freq`：日期偏移量，取值为`string`或`DateOffset`，默认为`D`

3. `normalize`：若参数为`True`表示将`start`、`end`参数值正则化到午夜时间戳

4. `name`：生成时间索引对象的名称，取值为`string`或`None`

5. `closed`：可以理解成在`closed=None`情况下返回的结果中，若`closed='left'`表示在返回的结果基础上，再取左开右闭的结果，若`closed='right'`表示在返回的结果基础上，再取做闭右开的结果

需要注意的是`start, end, periods, freq`这四个参数至少需要三个指定的参数，否则会出现错误。

```python
# 创建DatetimeIndex对象时，只传入开始日期与结束日期
pd.date_range('2018/08/10', '2018/08/20')
```

当调用`date_range()`函数创建`Datetimelndex`对象时，如果只是传入了开始日期(`start`参数)与结束日期(`end`参数)，则默认生成的时间戳是按天计算的，即`freq`参数为`D`。

```python
 创建DatetimeIndex对象时，传入start与periods参数
pd.date_range(start='2018/08/10', periods=5)
```

如果只传入开始的日期或者结束的日期，则需要用`periods`参数指定产生多少个时间戳，示例代码如下：

```python
# 创建DatetimeIndex对象时，传入start与periods参数
pd.date_range(start='2018/08/10', periods=5)
# 创建DatetimeIndex对象时，传入end与periods参数
pd.date_range(end='2018/08/10', periods=5)
```

因此可见，起始日期与结束日期定义了时间序列索引的严格边界。

如果日期中带有与时间相关的信息，且想产生一组被规范化到当天午夜的时间戳，可以将`normalize`参数的值设为`True `。

```python
pd.date_range(start='2018/8/1 12:13:30', periods=5, normalize=True, ..., tz='Asia/Hong Kong')
```

如果希望时间序列中时间戳都是每周固定的星期日，则可以创建`DatetimeIndex`时将`freq`参数设成为`W-SUN`。列如，创建一个`DatetimeIndex`对象，它是从2018年01月01日开始每隔一周连续生成五个星期日，代码如下：

```python
dates_index = pd.date_range('2018-01-01',         # 起始日期
                            periods=5,            # 周期
                            freq='W-SUN')         # 频率
dates_index
```


创建`DatetimeIndex`，并指定开始日期、产生日期个数、默认的频率，以及时区：

```python
pd.date_range(start='2018/8/1 12:13:30', periods=5, 
              tz='Asia/Hong_Kong')
# 规范化时间戳
pd.date_range(start='2018/8/1 12:13:30', periods=5, 
              normalize=True, tz='Asia/Hong_Kong')              
```

测试：

```python
pd.date_range(start='20190101', end='20190110')
pd.date_range(start='20190101', periods=5)
pd.data_range(end='2019-01-01', periods=10)
pd.date_range(start='20190101', periods=5, freq='W-SUM')
```

## 时间序列的偏移量 freq

| 名称                | 偏移量类型          | 说明                                                                                                                    |
| ------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| D                   | Day                 | 每日                                                                                                                    |
| B                   | BusinessDay         | 每工作日                                                                                                                |
| H                   | Hour                | 每小时                                                                                                                  |
| T或min              | Minute              | 每分                                                                                                                    |
| S                   | Second              | 每秒                                                                                                                    |
| L或ms               | Milli               | 每毫秒                                                                                                                  |
| U                   | Micro               | 每微秒                                                                                                                  |
| M                   | MounthEnd           | 每月最后一个日历日                                                                                                      |
| BM                  | BusinessMonthEnd    | 每月最后一个工作日                                                                                                      |
| MS                  | MonthBegin          | 每月每一个工作日                                                                                                        |
| BMS                 | BusinessMonthBegin  | 每月第一个工作日                                                                                                        |
| W-MON、W-TUE...     | Week                | 指定星期几（MON、TUE、WED、THU、FRI、SAT、SUM ）                                                                        |
| WOM-1MON、WMON-2MON | WeekOfMonth         | 产生每月第一、第二、第三或第四周的星期几                                                                                |
| Q-JAN、Q-FEB...     | QuaterEnd           | 对于以指定月份（JAN、FEB、MAR、APR、MAY、JUN、JUL、AUG、SEP、OCT、NOV、DEC ）结束的年度，每季度最后一月的最后一个日历日 |
| BQ-JAN、BQ-FEB...   | BusinessQuaterEnd   | 对于以指定月份结束的年度，每季度最后一月的最后一个工作日                                                                |
| QS-JAN、QS-FEB...   | QuaterBegin         | 对于以指定月份结束的年度，每季度最后一月的第一个日历日                                                                  |
| QS-JAN、QS-FEB...   | BusinessQuaterBegin | 对于指定月份结束的年度，每季度最后一月的第一个工作日                                                                    |
| A-JAN、A-FEB...     | YearEnd             | 每年指定月份的最后一个日历日                                                                                            |
| BA-JAN、BA-FEB      | BusinessYearEnd     | 每年指定月份的最后一个日历日                                                                                            |
| AS-JAN、AS-FEB      | YearBegin           | 每年指定月份的第一个日历日                                                                                              |
| BAS-JAN、BAS-FEB    | BusinessYearBegin   | 每年指定月份的第一个工作日                                                                                              |

例如，每月第3个星期五：

```python
pd.date_range('1/1/2020','9/1/2020',freq='WOM-3FRI')
'''
DatetimeIndex(['2020-01-17', '2020-02-21', '2020-03-20', '2020-04-17',
'2020-05-15', '2020-06-19', '2020-07-17', '2020-08-21'],
dtype='datetime64[ns]', freq='WOM-3FRI')
'''
```

##  时间前移或后移

移动是指沿着时间轴方向将数据进行前移或后移

![](https://images.maiquer.tech/images/wx/1647498380157.png)



Pandas对象中提供了一个`shift()`方法，用来前移或后移数据，但索引保持不变。

`shift()`方法语法格式：`shift(periods=1，freq=None，axis=0)`

**参数：**

1. `periods`：表示移动的幅度，可以为正数，也可以为负数，默认值是1，代表移动一次。
2. `freq`：如果这个参数存在，那么会按照参数值移动时间戳索引，而数据值没有发生变化

接下来，通过一个示例来演示如何使用时间序列的数据发生了前移或后移效果。

首先我们创建一个使用`DatetimeIndex`作为索引的`Series`对象，示例代码如下。

`shift`方法用于执行单纯的前移或后移操作：

```python
ts = pd.Series(np.random.randn(4),
index = pd.date_range('1/1/2020',periods=4,freq='M'))
ts
'''
2020-01-31 0.185458
2020-02-29 0.549704
2020-03-31 0.146584
2020-04-30 0.983613
Freq: M, dtype: float64
'''
```

向后移动一个月：

```python
ts.shift(1,freq='M')
'''
2020-02-29 0.185458
2020-03-31 0.549704
2020-04-30 0.146584
2020-05-31 0.983613
Freq: M, dtype: float64
'''

```

向前移动3天：

```python
ts.shift(-3,freq='D')
'''
2020-01-28 0.185458
2020-02-26 0.549704
2020-03-28 0.146584
2020-04-27 0.983613
dtype: float64
'''

```

通过`Day`或`MonthEnd`移动：

```python
from pandas.tseries.offsets import Day,MonthEnd
now = datetime(2020,1,27)
now + 3*Day()
Timestamp('2020-01-30 00:00:00')
now + MonthEnd()
Timestamp('2020-01-31 00:00:00')
```

## 时区处理

python的时区信息来自第三方库`pytz`，pandas包装了`pytz`的功能
查看所有时区

```python
pytz.common_timezones
```

转换时区- `tz_convert`

```python
rng = pd.date_range('3/9/2020 9:30',periods=6,freq='D',tz='UTC')
ts = pd.Series(np.random.randn(len(rng)),index=rng)
ts
'''
2020-03-09 09:30:00+00:00 -1.779006
2020-03-10 09:30:00+00:00 -0.293860
2020-03-11 09:30:00+00:00 -0.174114
2020-03-12 09:30:00+00:00 0.749316
2020-03-13 09:30:00+00:00 0.342134
2020-03-14 09:30:00+00:00 1.101283
Freq: D, dtype: float64
'''
ts.tz_convert('Asia/Shanghai')
'''
2020-03-09 17:30:00+08:00 -1.779006
2020-03-10 17:30:00+08:00 -0.293860
2020-03-11 17:30:00+08:00 -0.174114
2020-03-12 17:30:00+08:00 0.749316
2020-03-13 17:30:00+08:00 0.342134
2020-03-14 17:30:00+08:00 1.101283
Freq: D, dtype: float64
'''
```

## 时期及算术运算

时期（period ）表示的是时间区间，比如数日、数月、数季、数年等。

下面这个`Period`对象表示从2020年1月1日到2020年12月31日之间的整段时间：

```python
p = pd.Period(2020,freq='A-DEC')
p
'''
Period('2020', 'A-DEC')
'''
```

创建规则的时期范围：

```python
pd.period_range("2019-01", periods=13, freq="Q")	# 季度为Q生成13个时间
# Q代表季度为频率,默认的后缀为DEC代表一年以第1个月为结束【最后一个月为1月份】
pd.period_range("2019-01", periods=13, freq="Q-JAN")
pd.period_range("2019-01", periods=13, freq="Y")	# 以季度Q【年为频率】生成13个时间
pd.period_range("2019-01", periods=13, freq="2m")	# 以季度Q【2个月为频率】生成13个时间
```

`PeriodIndex`类保存了一组`Period`，可以在pandas数据结构中用作轴索引

```python
rng = pd.period_range('1/1/2020','6/30/2020',freq='M')
rng
period = pd.PeriodIndex(['2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06'], dtype='period[M]', freq='M')
pd.Series(np.random.randn(6),rng)
'''
2020-01 -1.050150
2020-02 -0.828435
2020-03 1.648335
2020-04 1.476485
2020-05 0.779732
2020-06 -1.394688
Freq: M, dtype: float64
'''
```

使用字符串创建`PeriodIndex`
Q代表季度为频率,默认的后缀为DEC代表一年以第12个月为结束

```
pd.PeriodIndex(['2020Q3', '2020Q2', '2020Q1'], freq='Q-DEC')
```

`Period`和`PeriodIndex`互转-`asfreq`

```python
p = pd.Period('2020',freq='A-DEC')
p.asfreq('M',how='start')
Period('2020-01', 'M')
p = pd.Period('2020-08',freq='M')
p.asfreq('A-JUN')
Period('2021', 'A-JUN')
```

`to_period`可以将`datetime`转`period`

```python
rng = pd.date_range('1/1/2020',periods=6,freq='D')
ts = pd.Series(np.random.randn(6),index=rng)
ts
'''
2020-01-01 -1.536552
2020-01-02 -0.550879
2020-01-03 0.601546
2020-01-04 -0.103521
2020-01-05 0.445024
2020-01-06 1.127598
Freq: D, dtype: float64
'''

ts.to_period('M')
'''
2020-01 -1.536552
2020-01 -0.550879
2020-01 0.601546
2020-01 -0.103521
2020-01 0.445024
2020-01 1.127598
Freq: M, dtype: float64
'''
```

`to_timespame`可以将`Period`转换为时间戳

```python
ts.to_period('M').to_timestamp()
```

## 频率转换

### 时期的频率转换

 在工作中统计数据时，可能会遇到类似于这样的问题，比如将某年的报告转换为季报告或月报告。为了解决这个问题，Pandas中提供了一个`asfreq()`方法来转换时期的频率，比如把某年转换为某月。 

`asfreq()`方法的语法格式如下：`asfreq(freq, method=None, normalize=False，\ill_value**=**None)`

部分参数的含义如下：

1. `freq`：表示计时单位，可以是`DateOffest`对象或字符串。
2. `how`：仅适用于`PeriodIndex`，可以取值为`start`或end
   + `start`：包含区间开始；
   + `end`：包含区间结束，默认为`end`。
3. `normalize`：布尔值，默认为`False`，表示是否将时间索引重置为午夜。
4. `fill_value`：用于填充缺失值，在升采样期间应用。

```python
period = pd.Period('2017', freq='A-DEC')	# 创建时期对象
period.asfreq('M', how='start')
```

### 重采样

重采样（Resampling ）指的是把时间序列的频度变为另一个频度的过程。把高频度的数据变为低频度叫做**降采样**（downsampling ），把低频度变为高频度叫做**升采样**（upsampling ）

Pandas中的`resample()`是一个对常规时间序列数据重新采样和频率转换的便捷的方法。

在遥感中，重采样是从高分辨率遥感影像中提取出低分辨率影像的过程。如果将高频率数据聚合到低频率，比如将每日采集的数据变成每月采集，则称为降采样，如果将低的频率数据聚合到高频率，比如每个月的采集的数据变成每日采集，则称为升采样。

#### **重采样的方法 resample**

可通过`resample()`进行重采样，其格式为：

````python
resample(rule, axis=0, fill_method=None, closed=None, label=None, convention='start', kind=None, loffset=None, limit=None, base=0)
````

**参数：**

| 参数               | 说明                                                                                                                                      |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `rule`             | 重采样频率字符串或`dataoffset`                                                                                                            |
| `freq`             | 表示重采样频率，例如`'M', '5min', Second(15)`                                                                                             |
| `how='mean'`       | 用于产生聚合值的函数名或数组函数，例如`'mean'、'ohlc'、np.max`等，默认是`mean`，其他常用的值由：`'first', 'last', 'median', 'max', 'min'` |
| `axis=0`           | 默认是纵轴，横轴设置`axis=1`                                                                                                              |
| `fill_method=None` | 升采样时如何插值，比如`'ffill', 'bfill'`等                                                                                                |
| `closed='right'`   | 在**降采样**时，各时间段的哪一段是闭合的，`'right'`或`'left'`，默认`'right'`                                                              |
| `label='right'`    | 在**降采样**时，如何设置聚合值的标签，例如: `9：30-9：35`会被标记成`9：30`还是`9：35`，默认`9：35`                                        |
| `loffset=None`     | 面元标签的时间校正值，比如`'-1s'`或`Second(-1)`用于将聚合标签调早`1`秒                                                                    |
| `limit=None`       | 在向前或向后填充时，允许填充的最大时期数                                                                                                  |
| `kind=None`        | 聚合到时期`('period')`或时间戳`('timestamp')`，默认聚合到时间序列的索引类型                                                               |
| `convention=None`  | 当重采样时期时，将低频率转换到高频率所采用的约定（`start`或`end` ），默认`end`                                                            |

```python
date_index = pd.date_range('2017.7.8', periods=30)
time_ser = pd.Series(np.arange(30), index=date_index)
time_ser

time_ser.resample('W-MON', closed='left').mean()
```

如果重采样时传入closed参数为left，则表示采样的范围是**左闭右开型**的。换句话说位于某范围的时间序列中，开头的时间戳包含在内，结尾的时间戳是不包含在内的。

注意：要进行重采样的对象，必须具有时间相关的索引，比如`DatetimeIndex`，`PeriodIndex`或`TimedetlaIndex`。

#### 降采样

在数位信号处理领域中，降采样，又作减采集，是一种多速率数字信号处理的技术或是降低信号采样率的过程，通常用于降低数据传输速率或者数据大小。 跟插值互补，插值是用来增加取样频率。降采样的过程中会运用滤波器降低混叠造成的失真，因为降采样会有混叠的情形发生，系统中具有降采样功能的部分称为降频器。

降采样时间颗粒会变大，数据量是减少的。为了避免有些时间戳对应的数据闲置，可以利用内置方法聚合数据。

![](https://images.maiquer.tech/images/wx/1647498433468.png)

在金融领域中，股票数据比较常见的是`OHLC`重采样，包括开盘价(open)，最高价，最低价，和收盘价，因此，pandas中专门提供了一个`ohlc()`的方法，示例代码如下。

```python
date_index = pd.date_range('2018/06/01', periods=30)
shares_data = np.random.rand(30)
time_ser = pd.Series(shares_data, index=date_index)
time_ser
time_ser.resample('7D').ohlc()  # OHLC降采样
```

降采样相当于另外—种形式的分组操作，它会按照日期将时间序列进行分组，之后对每个分组应用聚合方法得出一个结果。

上述示例输出了2018年的开盘价，最高价，最低价，收盘价，注意，这些股票数据都是随机数，只共大家学习使用，并不是真实数据。

```python
time_ser.groupby(lambda x : x.week).mean()	# 通过groupby技术实现降采样
```

#### 升采样

升采样的时间颗粒是变小的，数据量会增多，这很有可能导致某些时间戳没有相应的数据。

时间序列的数据在采样的时候，总体的数据量是减少的，只需要从最高频向最低频率转换时，应用聚合函数即可。

![](https://images.maiquer.tech/images/wx/1647498462634.png)

如果里面没有数据的话，遇到这种情况，常用的解决办法就是插值，具体有如下几种方式:

通过`ffill(limit)`(或者)`bfill(limit)`方法，取空前面或后面的值填充, `limit`可以限制填充的个数。值填充, `limit`可以限制填充的个数。

通过`fillna('ffill')`或`fillna('bfill')`进行填充，传入`ffill`则表示用`NaN`前面的值填充，传入`bfill`则表示用后面的值填充。

可使用`interpolate()`方法根据插值算法补全数据。

接下来，我们创建一个时间类型的`DateFrame`对象，示例代码如下：

```python
data_demo = np.array([['101', '210', '150'], ['330', '460', '580']])
date_index = pd.date_range('2018/06/10', periods=2, freq='W-SUN')
time_df = pd.DataFrame(data_demo, index=date_index, columns=['A产品', 'B产品', 'C产品'])
time_df
```

上述样本数据是从2018年6月10日开始采集，每一周统计一次，总共统计了两周，现在有个新的需求，要求重新按天采样，这是需要使用`resample`，和`asfreq()`这两个方法实现。`asfreq()`方法会将数据指定频率，示例代码如下：

```python
time_df.resample('D').asfreq()

time_df.resample('D').ffill()
```
