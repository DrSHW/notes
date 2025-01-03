# seleium自动化工具

`selenium`是一个自动化测试工具，利用它可以**驱动浏览器**执行特定的动作，如打开网页，抓取数据等操作，同时还可以获取浏览器当前呈现的页面的源代码，做到**可见即可爬**。对于一些 JavaScript 动态渲染的页面来说，此种抓取方式非常有效

## 有什么用

很多网站数据来源于接口，且对接口做了加密，我们可以使用`selenium`打开浏览器，访问网页时动态数据相当于变成了静态数据，从而绕过绝大部分反爬虫手段。

## 准备工作

本节以 Edge浏览器 为例来讲解 `selenium` 的用法。在开始之前，请确保已经正确安装好了 Edge浏览器 并配置好了 `msedgedriver`。另外，还需要正确安装好 Python 的 `selenium` 库

### Edge 配置

浏览器安装地址：https://www.microsoft.com/zh-cn/edge

首先查看浏览器的版本：

1. 进入浏览器的设置界面，`edge://settings/profiles`

2. 进入`关于 Microsoft Edge`，即可看到Edge的版本：

   ![image-20220824220500135](https://images.drshw.tech/images/notes/image-20220824220500135.png)

3. 进入计算机管理（打开`cmd` 输入` services.msc` ），在服务中停止并禁用`Microsoft Edge Update Service (edgeupdate)`、`Microsoft Edge Update Service (edgeupdatem)`两项服务，停用`Edge`更新：

   ![image-20220824220801587](https://images.drshw.tech/images/notes/image-20220824220801587.png)

   这步是必要的，原因是需要依据浏览器的版本安装对应的驱动，若浏览器进行了更新，原驱动会失效，需要重装新的驱动。

### 安装驱动

对应浏览器的版本安装驱动：

Edge驱动安装地址：https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/

+ 附Chrome驱动安装地址：http://chromedriver.storage.googleapis.com/index.html

安装后，将解压后的`msedgedriver.exe`文件放在Python解释器的根目录下即可。

### 安装seleium

模块安装：`pip install seleium`

## 基本使用

### 声明浏览器对象

`selenium`支持非常多的浏览器，如 Chrome、Firefox、Edge 等，还有 Android、BlackBerry 等手机端的浏览器。另外，也支持无界面浏览器 PhantomJS。

我们可以分别使用如下方式初始化：

```python
from selenium import webdriver

browser = webdriver.Chrome()
browser = webdriver.Firefox()
browser = webdriver.Edge()
browser = webdriver.PhantomJS()
browser = webdriver.Safari()
```

这样就完成了浏览器对象的初始化并将其赋值为 `browser` 对象，唤起了浏览器界面。

接下来，我们要做的就是调用 browser 对象，让其执行各个动作以模拟浏览器操作。

### 加载指定页面并关闭

+ `browser.get(url)`，使浏览器加载指定`url`的页面
+ `browser.current_url`，提取当前请求地址
+ `browser.page_source.encode(解码方式)`，提取当前页面的源代码
+ `browser.get_cookies()`，提取当前的`Cookies`
+ `browser.quit()`，关闭浏览器

```python
from selenium import webdriver
import time
# 打开指定（Edge ）浏览器
browser = webdriver.Edge()
# 指定加载页面
browser.get("https://www.baidu.com/")
# 提取页面
print(browser.page_source.encode('utf-8'))
# 提取cookie
print(browser.get_cookies())
# 提取当前请求地址
print(browser.current_url)
# 设置五秒后执行下一步
time.sleep(5)
# 关闭浏览器
browser.quit()
```

运行代码后发现，会自动弹出一个 Edge 浏览器，再跳转到百度，同时控制台将会打印源代码等信息。

### 查找节点

`selenium` 可以驱动浏览器完成各种操作，比如填充表单、模拟点击等。比如，我们想要完成向某个输入框输入文字的操作或者抓取数据，而 `selenium` 提供了一系列**在当前页面源码中**查找节点的方法，我们可以用这些方法来获取想要的节点，以便下一步执行一些动作或者提取信息。

#### 单个节点

可使用`find_element()`系列：传入筛选的方式和筛选的关键字，用于定位单个的页面元素。

筛选方式有如下几种（首先`from selenium.webdriver.common.by import By` ）：

| 筛选方式          | 解释                     | 示例                                                            |
| ----------------- | ------------------------ | --------------------------------------------------------------- |
| `By.ID`           | 通过标签的`id`属性筛选   | `browser.find_element(By.ID,"su")`                              |
| `By.NAME`         | 通过标签的`name`属性筛选 | `browser.find_element(By.NAME, "login_form")`                   |
| `By.CLASS_NAME`   | 通过类名筛选             | `browser.find_element(By.CLASS_NAME, "elem")`                   |
| `By.TAG_NAME`     | 通过标签名称筛选         | `browser.find_element(By.TAG_NAME, "p")`                        |
| `By.CSS_SELECTOR` | 通过CSS选择器筛选        | `browser.find_element(By.CSS_SELECTOR, "#fruits .tomatoes")`    |
| `By.XPATH`        | 通过`XPath`语句筛选      | `browser.find_element(By.NAME, "//div[@class='sourse']/input")` |

查找后，返回的是`WebElement`类的对象，支持嵌套筛选。

#### 多个节点

如果要查找所有满足条件的节点，需要用 `find_elements()` 方法，传入的参数与单个节点情形一致。

查找后，返回的内容变成了列表类型，列表中的每个节点都是 `WebElement` 类型。

### 节点交互

查找到想要的节点后，`selenium` 可以驱动浏览器来执行一些操作，也就是说可以让浏览器模拟执行一些动作。

比较常见的用法（以下方法均作用于`WebElement`对象 ）：

+ `send_keys()`方法
  + 可在输入框中输入一些数据，传入数据即可；
  + 也可向浏览器传入键盘信号，传入`Keys.键名`(`from selenium.webdriver.common.keys import Keys`)，例如`Keys.Enter`可传递回车信号。
+ `clear()`方法将清除输入框中的数据；
+ `click()`方法会向节点发出点击信号；

例如，打开`bing`（https://cn.bing.com/ ），并在其搜索框中输入一些内容，并进行搜索：

+ 首先定位搜索框的位置：

  ![image-20220825135016738](https://images.drshw.tech/images/notes/image-20220825135016738.png)

+ 发送回车信号即可搜索

+ 对其进行节点节点交互即可

完整代码参考：

```python
from selenium import webdriver
import time
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
# 打开指定（Edge ）浏览器
browser = webdriver.Edge()
# 指定加载页面
browser.get("https://cn.bing.com/")
# 找到搜索框
search_input = browser.find_element(By.ID, "sb_form_q")
# 搜索框输入内容
search_input.send_keys("iPad")
time.sleep(1)
search_input.clear()
time.sleep(1)
search_input.send_keys("iPhone")
# 按下回车键
search_input.send_keys(Keys.ENTER)
print(browser.current_url)
# 5秒后关闭浏览器
time.sleep(5)
browser.quit()
```

通过上面的方法，我们就完成了一些常见节点的动作操作，更多的操作可以参见官方文档的交互动作介绍：

[http://selenium-python.readthedocs.io/api.html#module-selenium.webdriver.remote.webelement](http://selenium-python.readthedocs.io/api.html#module-selenium.webdriver.remote.webelement) 。

### 获取节点信息

我们可以使用 `get_attribute()`方法来获取节点的属性，传入想要获取的属性字段，即可返回字段信息，但是其前提是先选中这个节点。

示例如下：

```python
from selenium import webdriver
url = 'https://pic.netbian.com/4kmeinv/index.html'
browser.get(url)
# 找到所有图片标签
src = browser.find_elements(By.XPATH, '//ul[@class="clearfix"]/li/a/img')
# 打印所有图片的src地址
for i in src:
    url = i.get_attribute('src')
    print(url)
```

## 初始化配置

`selenium`也支持浏览器驱动的一些基础配置：

首先实例化浏览器设置这一对象：

```python
options = webdriver.EdgeOptions()
```

### 运行设置

再进行一些其它设置，常用的如下：

+ 限制图片加载：

  可设置网站最多加载多少张图片，若最多只能加载两张图片，可以这样写：

  ```python
  prefs = {"profile.managed_default_content_settings.images": 2}
  options.add_experimental_option("prefs", prefs)
  ```

+ 切换为“无头模式”，即浏览器不显示，在后台运行：

  ```python
  options.add_argument("-headless")
  ```

+ 设置请求头，例如设置`User-Agent`，可以这样写：

  ```python
  user_agent = 'MQQBrowser/26 Mozilla/5.0 (Linux; U; Android 2.3.7; zh-cn; MB200 Build/GRJ22;CyanogenMod-7) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'
  options.add_argument('User-Agent=%s' % user_agent)
  ```

  设置用户代理，可以这样写：

  ```python
  options.add_argument('proxy-server=' +'192.168.0.28:808')
  ```

+ 隐藏上方的“Edge正在受到自动软件的控制”：

  ```python
  options.add_experimental_option('useAutomationExtension', False)
  options.add_experimental_option('excludeSwitches', ['enable-automation'])
  ```

配置完成后，在启动浏览器时传入`options`关键字实参即可：

```python
browser = webdriver.Edge(options=options)
```

### 绕过检测

有些网站会检测浏览器是否为浏览器驱动（WebDriver ）打开，当他们检测到时，就会进行访问屏蔽。

例如，不作处理，执行`browser.get('https://bot.sannysoft.com/')`，可见`WebDriver`检测未通过：

<img src="https://images.drshw.tech/images/notes/image-20220825162540131.png" alt="image-20220825162540131" style="zoom: 33%;" />

其实我们可以手动设置屏蔽——通过设置运行配置：

```python
options.add_argument('--disable-blink-features=AutomationControlled')
```

即可绕过检测。

代码示例：

```python
from selenium import webdriver

browser = webdriver.Edge()
# 无处理
browser.get('https://bot.sannysoft.com/')
# 设置屏蔽
options = webdriver.EdgeOptions()
options.add_argument('--disable-blink-features=AutomationControlled')
browsers = webdriver.Edge(options=options)
browsers.get('https://bot.sannysoft.com/')
```

### 页面设置

打开浏览器后，也可对其窗口界面进行设置：

+ `browser.maxmize_window()`/`browser.maxmize_window()`最大化 / 最小化窗口；

+ `browser.set_window_size(width, height)`，设置浏览器宽高，传入两整数，单位为`px`；

+ `browser.execute_script()`在浏览器中运行`js`代码，传入代码字符串。

  例如，打开一个新窗口：`browser.execute_script('window.open("https://www.baidu.com");')`

示例：

```python
from selenium import webdriver
options = webdriver.EdgeOptions()
# 禁止图片
prefs = {"profile.managed_default_content_settings.images": 0}
options.add_experimental_option("prefs", prefs)
# 无头模式 在后台运行
# options.add_argument("-headless")
# 设置User-Agent
user_agent = 'MQQBrowser/26 Mozilla/5.0 (Linux; U; Android 2.3.7; zh-cn; MB200 Build/GRJ22;CyanogenMod-7) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'
options.add_argument('User-Agent=%s' % user_agent)
# 隐藏"Edge正在受到自动软件的控制"
options.add_experimental_option('useAutomationExtension', False)
options.add_experimental_option('excludeSwitches', ['enable-automation'])
# 设置代理
# options.add_argument('proxy-server=' +'192.168.0.28:808')
# 引入初始化配置并唤起窗口
browser = webdriver.Edge(options=options)
# 将浏览器最大化显示
browser.maximize_window()
# 设置宽高
browser.set_window_size(480, 800)
# 通过js新打开一个窗口
browser.execute_script('window.open("https://www.baidu.com");')
```

## 选项卡管理

### 基本使用

在访问网页的时候，通常会开启一个个选项卡。在 `selenium` 中，我们也可以对选项卡进行操作。

+ 要想打开一个新窗口，可以借助`js`中的`window.open()`实现：

  `browser.execute_script('window.open()')`

+ 若想切换到第`i`个选项卡，使用`browser.switch_to.window(browser.window_handles[i])`即可，选项卡存放在一个列表中，索引从0开始；

+ `browser.window_handles`可打印当前的选项卡代号列表。

执行以下代码：

```python
import time
from selenium import webdriver

browser = webdriver.Edge()
browser.get('https://www.baidu.com')
browser.execute_script('window.open()')
print(browser.window_handles)
browser.switch_to.window(browser.window_handles[1])
browser.get('https://www.bilibili.com')
time.sleep(1)
browser.switch_to.window(browser.window_handles[0])
time.sleep(5)
browser.quit()
```

控制台输出如下：

```python
['CDwindow-B0CC47C589814D06C22FCA91E77E8340', 'CDwindow-7D6CBFC3906F80EF6B6504DAC1FF1ED1']
```

执行过程：

+ 首先访问了百度，然后调用了 `execute_script()` 方法，传入`window.open()` 开启一个选项卡；
+ 接下来，我们想切换到该选项卡。这里调用 `window_handles` 属性获取当前开启的所有选项卡，返回的是选项卡的代号列表；
+ 要想切换选项卡，只需要调用 `switch_to.window()`语句即可，其中参数是选项卡的代号。这里我们将第二个选项卡代号传入，即跳转到第二个选项卡；
+ 接下来在第二个选项卡下打开一个新页面，然后切换回第一个选项卡重新调用 `switch_to.window()`语句，再执行其他操作即可。

### iframe切换

我们知道网页中有一种节点叫作 `iframe`，其中的内容相当于页面的**子页面**，它的结构和外部网页的结构完全一致。`selenium` 打开页面后，它默认是在父级页面里面操作，而此时如果页面中还有子页面，它是不能获取到子页面里面的节点的。这时就需要使用`switch_to.frame()`方法来切换进入子页面。

以豆瓣网（https://www.douban.com/ ）为例：

+ 可以观察到，其登陆框的`html`代码被写入了`iframe`节点中：

  ![image-20220825151450218](https://images.drshw.tech/images/notes/image-20220825151450218.png)

+ 在父页面中，子页面的内容是无法被获取到的。要想获取，需要先切换进入子页面再进行获取：

获取示例：

```python
import time
from selenium import webdriver
from selenium.webdriver.common.by import By

browser = webdriver.Edge()
browser.get('https://www.douban.com/')
login_iframe = browser.find_element(By.XPATH, '//div[@class="login"]/iframe')
browser.switch_to.frame(login_iframe)
browser.find_element(By.CLASS_NAME, 'account-tab-account').click()
browser.find_element(By.ID, 'username').send_keys('123123123')
```

## 动作链

在上面的实例中，一些交互动作都是针对某个节点执行的。比如，对于输入框，我们就调用它的输入文字和清空文字方法；对于按钮，就调用它的点击方法。其实，还有另外一些操作，它们没有特定的执行对象，比如**鼠标拖拽、键盘按键**等，这些动作用另一种方式来执行，那就是**动作链**。

### 基本使用

首先需要初始化网页中的一个动作链实例，即`actions = webdriver.ActionChains(browser)`；

然后就可以调用它的一些方法，定义一系列浏览器需要做的动作：

+ 如双击操作为`actions.double_click(element)`，拖拽操作为：`actions.drag_and_drop(source, target)`，同时涉及一些参数传递。

+ 更多动作可参考官方文档：https://www.selenium.dev/selenium/docs/api/py/webdriver/selenium.webdriver.common.action_chains.html 。

最后调用`actions.perform()`即可执行规定的动作。

### 拖拽示例

示例网站：https://www.runoob.com/try/try.php?filename=jqueryui-api-droppable 。

比如，现在实现一个节点的拖拽操作，将某个节点从一处拖拽到另外一处，可以这样实现：

+ 定位起点元素和终点元素（`find_element()` ）

  ![image-20220825153441728](https://images.drshw.tech/images/notes/image-20220825153441728.png)

+ 创建网页动作链实例，加入拖拽操作，并执行即可。

完整代码参考：

```python
from selenium import webdriver

browser = webdriver.Edge()
url = 'https://www.runoob.com/try/try.php?filename=jqueryui-api-droppable'
browser.get(url)
browser.switch_to.frame('iframeResult')
source = browser.find_element(By.CSS_SELECTOR,'#draggable')
target = browser.find_element(By.CSS_SELECTOR,'#droppable')
actions = ActionChains(browser)
actions.drag_and_drop(source, target)
actions.perform()
```

## 页面滚动

### 实现

很多情形下，随着浏览器不断的下拉，网站也会相应加载更多的数据。`selenium` API 并没有提供下拉进度条的操作，但我们依旧可以借助`js`轻松地实现这一点。

利用`js`中的`window.scrollTo()`和`window.scrollBy()`就能做到这一点，直接看下面的示例：

```python
# 浏览器滚动到底部 10000位置
document.documentElement.scrollTop=10000
# 滚动到顶部
document.documentElement.scrollTop=0

# 移动到页面最底部  
browser.execute_script("window.scrollTo(0, document.body.scrollHeight)")
 
# 移动到指定的坐标(相对当前的坐标移动)
driver.execute_script("window.scrollBy(0, 700)")
# 结合上面的scrollBy语句，相当于移动到700+800=1600像素位置  
driver.execute_script("window.scrollBy(0, 800)")
 
# 移动到窗口绝对位置坐标，如下移动到纵坐标1600像素位置  
driver.execute_script("window.scrollTo(0, 1600)")
# 结合上面的scrollTo语句，仍然移动到纵坐标1200像素位置  
driver.execute_script("window.scrollTo(0, 1200)")
```

### 案例

实现“慢慢地下拉”，即一小段时间随机下拉一点，直到最底部（控制台中执行`document.body.scrollHeight`可返回滚动条总高度 ）：

```python
from selenium import webdriver

browser = webdriver.Chrome()
browser.get('https://36kr.com/')
# scrollTo  不叠加 200 200    scrollBy 叠加  200 300  500操作
# 慢慢的下拉
for i in range(1,9):
    time.sleep(random.randint(100, 300) / 1000)
    browser.execute_script('window.scrollTo(0,{})'.format(i * 700))
```

有了`execute_script()`方法，尽管有些功能 API 没有提供，但是基本上都可以通过执行`js`代码的方式来实现它们。

## 延时等待

在 Selenium 中，`get()` 方法会在网页框架加载结束后结束执行，此时如果获取 `page_source`，可能并不是浏览器完全加载完成的页面。如果某些页面有额外的 Ajax 请求，我们在网页源代码中也不一定能成功获取到。在这种情形下，需要**延时等待**一定时间，**确保节点已经加载出来**。

### 基本使用

先实例化一个`WebDriverWait`对象，传入浏览器对象和最长超时时间：`wait = WebDriverWait(browser, period)`；

再使用`wait.until()`方法即可进行延时等待，传入等待条件与节点信息，当节点信息被成功找到（即加载完毕 ），就可执行下面的语句；若是过了上方定义的最长超时时间还未加载出来，则抛出异常。

下表记录了一些等待条件及其含义：


| 等待条件                                       | 含义                                                    |
| ---------------------------------------------- | ------------------------------------------------------- |
| `title_is`                                     | 标题是某内容                                            |
| `title_contains`                               | 标题包含某内容                                          |
| `presence_of_element_located`                  | 节点加载出，传入定位元组，如 `(By.ID, 'p')`             |
| `visibility_of_element_located`                | 节点可见，传入定位元组                                  |
| `visibility_of`                                | 可见，传入节点对象                                      |
| `presence_of_all_elements_located`             | 所有节点加载出                                          |
| `text_to_be_present_in_element`                | 某个节点文本包含某文字                                  |
| `text_to_be_present_in_element_value`          | 某个节点值包含某文字                                    |
| `frame_to_be_available_and_switch_to_it frame` | 加载并切换                                              |
| `invisibility_of_element_located`              | 节点不可见                                              |
| `element_to_be_clickable`                      | 节点可点击                                              |
| `staleness_of`                                 | 判断一个节点是否仍在 `DOM`，可判断页面是否已经刷新      |
| `element_to_be_selected`                       | 节点可选择，传节点对象                                  |
| `element_located_to_be_selected`               | 节点可选择，传入定位元组                                |
| `element_selection_state_to_be`                | 传入节点对象以及状态，相等返回 `True`，否则返回 `False` |
| `element_located_selection_state_to_be`        | 传入定位元组以及状态，相等返回 `True`，否则返回 `False` |
| `alert_is_present`                             | 是否出现 `Alert`                                        |

更多用法介绍可以参考官方文档：http://selenium-python.readthedocs.io/api.html#module-selenium.webdriver.support.expected_conditions

### 案例

访问百度主页（https://www.baidu.com/ ），当搜索框和搜索按钮都加载完毕后，打印它们：

+ 先找到两个组件的节点位置，这里就不详细讲了；
+ 对于搜索框，加载出即可，可使用`presence_of_element_located`；
+ 对于按钮，可以更改一下等待条件，比如改为 `element_to_be_clickable`，也就是可点击；如果 10 秒内它是可点击的，也就是成功加载出来了，就返回这个按钮节点；如果超过 10 秒还不可点击，也就是没有加载出来，就抛出异常。

完整代码参考：


```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

browser = webdriver.Edge()
browser.get('https://www.baidu.com/')
wait = WebDriverWait(browser, 10)
input = wait.until(EC.presence_of_element_located((By.ID, 'kw')))
button = wait.until(EC.element_to_be_clickable((By.ID, 'su')))
print(input, button)
```

## selenium异常

在使用 Selenium 的过程中，难免会遇到一些异常，例如超时、节点未找到等错误，一旦出现此类错误，程序便不会继续运行了。

`selenium.common.exceptions`中保存了许多种类的异常，例如超时异常`TimeoutException`，元素找不到异常`NoSuchElementException`。

了解了这些异常后，使用 `try...except...` 语句即可进行捕获。

```python
from selenium import webdriver
from selenium.common.exceptions import TimeoutException, NoSuchElementException
browser = webdriver.Edge()
try:
    browser.get('https://www.baidu.com')
except TimeoutException:
    print('Time Out')
try:
    browser.find_element(By.ID, 'hello')
except NoSuchElementException:
    print('No Element')
finally:
    browser.close()
```

控制台的输出如下：

```python
No Element
```

关于更多的异常类，可以参考官方文档：[http://selenium-python.readthedocs.io/api.html#module-selenium.common.exceptions](http://selenium-python.readthedocs.io/api.html#module-selenium.common.exceptions)。

## selenium 数据爬取案例

 采集义务购商品网站（https://www.yiwugo.com/ ）中饰品的所有信息：

主要流程：

+ 首先做初始化配置，并唤起浏览器；
+ 访问网址，在源码中查找输入框与查找按钮所在位置，并模拟输入和点击（传递回车信号也可以实现 ）；
+ 不断尝试下拉网页界面，使所有数据加载完毕，并找到资源的所在所在位置；
+ 连接`mongo`，将数据入库；
+ 定位翻页所在位置，提取完一页的数据后即进入下一页继续提取，若为最后一页，则会因为`下一页`按钮无法点击而抛出异常，此时需要异常捕获。

完整代码示例：

```python
import random
import time
from selenium import webdriver
from selenium.common import ElementClickInterceptedException
from selenium.webdriver.common.by import By
from pymongo import MongoClient

class YwShop:
    # 设置屏蔽并启动虚拟浏览器
    def __init__(self):
        options = webdriver.EdgeOptions()
        options.add_argument('--disable-blink-features=AutomationControlled')
        self.browser = webdriver.Edge(options=options)

    # 访问网站，并模拟搜索饰品
    def base(self):
        self.browser.get('https://www.yiwugo.com/')
        _input = self.browser.find_element(By.ID, 'inputkey')
        _input.send_keys('饰品')
        self.browser.find_element(By.XPATH, '//div[@class="search-index"]/span[last()]').click()

    # 解析数据，每解析一页爬取一次
    def spider(self):
        self.drop_down()
        li = self.browser.find_elements(By.CLASS_NAME, 'pro_list_product_img2')
        for j in li:
            title = j.find_element(By.XPATH, './/li/a[@class="productloc"]')
            price = j.find_element(By.XPATH, './/li/span[@class="pri-left"]/em')
            info = j.find_elements(By.XPATH, './/li/span[@class="pri-right"]/span')
            address = j.find_element(By.XPATH, './/li[@class="shshopname"]')
            texts = ''
            for i in info:
                texts = i.text
            items = {
                '标题': title.text,
                "价钱": price.text,
                "地址": address.text,
                "信息": texts
            }
            self.save_mongo(items)
        self.page_next()

    # 数据入库
    def save_mongo(self, data):
        print(data)
        client = MongoClient()  # 建立连接
        col = client['python']['xx']
        if isinstance(data, dict):
            res = col.insert_one(data)
            return res
        else:
            return '单条数据必须是这种格式：{"name":"age"}，你传入的是%s' % type(data)

    # 爬取下一页数据
    def page_next(self):
        try:
            _next = self.browser.find_element(By.XPATH, '//ul[@class="right"]/a[@class="page_next_yes"]')
            if _next:
                _next.click()
                self.spider()
            else:
                self.browser.close()
        except ElementClickInterceptedException as e:
            print(e)

    # 随机下拉，促使网站加载更多数据
    def drop_down(self):
        for x in range(1, 10):
            j = x / 10
            js = f"document.documentElement.scrollTop = document.documentElement.scrollHeight * {j}"
            self.browser.execute_script(js)
            time.sleep(random.randint(400, 800) / 1000)


if __name__ == '__main__':
    f = YwShop()
    f.base()

```
