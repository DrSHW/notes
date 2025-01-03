## 理解JavaScript函数式编程

### 函数式编程的特点

在JavaScript 中最关键的概念是：**函数是第一类对象（一等公民）**。这意味着函数可被作为**任意其他类型对象**来对待，同时也保留了对象可实现的所有功能，唯一的特殊之处即函数是**可被调用的**，举个例子：

```js
var demo = new Function('a', 'b', 'return a + b');	// 创建一个函数对象，传入函数参数和函数体

function demo() {	}		// 这其实是创建函数对象的语法糖（此处称为函数定义）

var demo = function () {	};	// 将函数对象（此处称为函数表达式）赋值给一个变量，同对象赋值
demo.param = "HW"	// 为函数对象添加属性

function returnFunction() {
    return function () {	};	// 函数对象可作为函数返回值
}

function call(func) {
    func();
}
call(function () {	});		// 作为函数的参数被调用

function outer() {
    function inner() {	// 可在函数中嵌套定义函数，相当于对象某键对应的值为对象
        return "inner";
    }
    return inner();
}
```

> + 函数声明可作为JavaScript 代码中的独立表达式，但它也能够包含在其他函数体内。
> + 对于函数声明来说，函数名是强制性的，而对于函数表达式来说，函数名则完全是可选的。

第一类对象的特点之一即：**能够作为参数传入函数**。该特点至关重要，它可以实现以下几个重要功能：

+ **回调函数**：将函数作为另一个函数的参数，随后通过传参进行调用。可预先定义函数并传入主函数，到一个特定的时间点对其进行调用，一些用户事件、包括promise对象的实现等功能都依赖该特性，举个例子：

  + 用户事件传入回调函数：

    ```js
    document.body.addEventListener("click", function() {	// 传入点击后的执行逻辑回调
        var tag = document.getElementById("tag");
        addMessage(tag, "Event: click")
    })
    ```

  + 最简单的排序算法，传入函数的比较逻辑回调：

    ```js
    var values = [10, 5, 6, 2, 8, 12, -9, 1];
    values.sort(function(value1, value2) {	// 传入比较逻辑，比较时作用于两个元素，返回正数则表名传入值的顺序需要调换
    	return value1 - value2;
    });
    ```

+ **存储函数**：由于可以给函数添加属性的功能，可以让函数能存储上次计算得到的值，从而提高后续调用的性能（**记忆化**）。

  举个例子，如果我们需要一个会被经常调用的，计算`n`以内的所有质数的例子（使用的算法不是最优的），代码如下：

  ```js
  function isPrime(value) {
  	if (!isPrime.answers) {
  		isPrime.answers = {};	// 若缓冲区尚未被创建则创建缓存区，保存“值”是否为“质数”的对象
  	}
  	if (isPrime.answers[value] !== undefined) {		// 若结果在对象中已经存在，则无需计算，直接返回即可
  		return isPrime.answers[value];
  	}
  	var prime = value !== 0 && value !== 1;
  	for (var i = 2; i * i < value; i++) {	// 质数判定
  		if (value % i === 0) {
  			prime = false;
  			break;
  		}
  	}
  	return isPrime.answers[value] = prime;	// 存储计算的值
  }
  
  console.log(isPrime(5));	// true
  console.log(isPrime.answers[5]);	// true，说明值已经被缓存
  ```

  这么做会有非常大的性能提升，而且实现便捷。但会带来一些内存上的牺牲，时间复杂度难以预测，以及耦合度的增加。

+ **闭包**：由于JS对于作用域判定的特性，在函数嵌套定义时，内部函数在定义后可访问外部函数中的同级变量。

  这里先举个例子，具体原理下节详细讲解：

  ```js
  function outer() {
      var myVar = 10;
      function inner(a) {
          return myVar + a;
      }
      return inner;
  }
  console.log(outer()(100))	// 110，即使是在outer函数以外，myVar变量依旧可以被访问
  ```

### 函数定义

最纯粹的函数定义方式其实是实例化一个`Function`对象，而我们常常使用的函数定义方式其实可以看成是一种语法糖：

```js
var demo = new Function('a', 'b', 'return a + b');
/* 与上方函数等价的常用的函数定义方式 */
function demo(a, b) {	// 使用函数定义
    return a + b;
}
var demo = function(a, b) { return a + b; }	// 使用函数表达式
var demo = (a, b) => a + b	// 使用箭头函数
var demo = (a, b) => { return a + b; }	// 使用箭头函数
```

在ES6中，还引入了生成器函数，它是一种可以随时退出并重新进入的函数，使用`function*`定义，这个我们后面再详细介绍：

```js
/* 生成器函数 */
function* myGenerator() { yield 1; }
```

### 立即函数（IIFE）

一些函数表达式可作为一元运算符的参数立即调用，例如：

```js
+function() {	}()
-function() {	}()
!function() {	}()
~function() {	}()
(function() {	})()
```

> 值得注意的是，`function(){}()`这种写法是错误的。若不加运算符，JS解析器在语法分析时会将其解析为函数声明处理，该写法是不合法的函数声明，解析器将报错。因此需要加入一元运算符来“提示”JS 解析引擎，处理的是函数表达式。
>
> 还有一种相对简单的替代方案`(function(){}())`也能达到相同目标（然而这种方案有些奇怪，故不常使用）。

IIFE在**代码模块化**中起到了至关重要的作用，我们在后面的章节中详细将探讨它。

### 函数参数

#### 基本知识

形参、实参、默认参数的概念这里就不再赘述，略总结一下即：

+ 形参是函数定义时列出的变量，而实参是函数调用时传递给函数的值；
+ 函数的形参列表和实参列表长度可以不同；
  + 未赋值的形参求值得到`undefined`；
  + 传入的额外实参不会被赋给任何一个命名形参。
+ 默认参数即：函数调用时，若未传入参数，默认参数可以给函数提供缺省的参数值。

#### 剩余参数

在这里我们先探讨一下**不确定参数个数**的函数情景：若需要实现一个函数`adder`，它会将第一个参数与余下参数中最大的数相加，返回结果。其中余下参数长度可以是任意的。

要实现该业务逻辑，可以强制用户传入一个列表，在函数体内处理列表即可。但是这样会增加用户的使用负担，不够优雅。

最正统的实现方法应当使用**剩余参数**，定义如下：

```js
function adder(first, ...otherParams) {	// 为函数最后一个参数添加省略号(...)前缀，即可定义一个剩余参数（形参）
    								// 它会将传入的多余参数保存在一个数组中，数组名即为剩余参数名
    var max_num = otherParams.sort((a, b) => b - a);
    return first + max_num;
}
console.log(adder(3, 7, 2, 6, 10, 5))	// 13
```

为函数的最后一个命名参数前加上省略号（`...`）前缀，这个参数就变成了一个叫作剩余参数的数组，该数组内包含着传入的剩余的参数，在函数体中发挥作用。

#### 隐式函数参数

除了在函数定义中显式声明的参数之外，函数调用时还会传递两个**隐式**的参数：`arguments`和`this`。这些隐式参数在函数声明中没有明确定义，但会默认传递给函数并且可以在函数内正常访问。我们从稍简单些的`arguments`参数说起。

`arguments`参数代表了传入函数的所有参数的集合，即便部分参数没有和函数的形参关联也无妨。也就是说，通过`arguments`参数**还可获取那些与函数形参不匹配的参数**。

它是一个**类似数组结构的对象**（不是纯数组，例如不支持`sort`），具有`length`属性，代表传入参数的个数。举个例子：

```js
function sum() {	// 完全没有任何显式定义参数的函数，用于接收任意参数并求取它们的和
  var res = 0;
  for (var i = 0; i < arguments.length; i++) {	// 遍历arguments，获取所有参数
    res += arguments[i];
  }
  return res;
}

console.log(sum(1, 2, 3));	// 6
```

在非严格模式下，`arguments`对象是函数参数的别名，**修改`arguments`参数会修改函数实参**。

> 严格模式（strict mode）和非严格模式：
>
> 严格模式是在ES5 中引入的特性，它可以改变JavaScript引擎的默认行为并执行更加严格的语法检查，一些在普通模式下的静默错误会在严格模式下抛出异常。在严格模式下部分语言特性会被改变，甚至完全禁用一些不安全的语言特性（后面会详细介绍），其中`arguments`别名在严格模式下将无法使用。
>
> 加入`"use strict";`语句为其后方的代码引入严格模式。

举个例子：

```js
// "use strict";

function test(a, b, c) {	// 传入三个参数
  console.log(a, b, c);	// oringinal a original b original c
  arguments[0] = "changed a";	// 通过别名修改参数
  arguments[1] = "changed b";
  arguments[2] = "changed c";
  console.log(arguments[0], arguments[1], arguments[2]);	// changed a changed b changed c
  console.log(a, b, c);	// changed a changed b changed c（若开启strict mode，则打印oringinal a original b original c）
}

test("oringinal a", "original b", "original c");	
```

说完了`arguments`参数后，我们来讲`this`参数。`this`参数代表函数调用相关联的对象，被称作**函数上下文**，简单来说就是函数可以访问的变量和函数的集合。

它的值取决于函数的**调用方式**，我们将两者结合起来讲。

### 函数调用

函数调用有四种方式：

+ 作为**纯函数**调用：`func()`；
+ 作为**方法**调用：`obj.func()`；
+ 作为**构造函数**调用：`new Obj()`；
+ 通过`call`与`apply`方法调用：`func.call(obj)`、`func.apply(obj)`。

作为纯函数调用，且在尚未指定函数被调用的对象时，在非严格模式中，`this`的值为全局运行环境（如在浏览器执行中则对应的值为`window`）；在严格模式中则为`undefined`：

```js
function f1() { 
  console.log(this); 
}

function f2() {
  "use strict";
  console.log(this);
}

f1();	// 全局运行环境
f2();	// undefined
```

作为方法调用时，`this`通常会指向**调用之的对象**：

```js
function func() { 
  return this;
}

var obj = {
  "a": 1,
  "b": 2,
  "func": func
};

console.log(obj.func()); // { a: 1, b: 2, func: [Function: func] }
console.log(obj.func() == obj); // true，印证了this指向obj
```

将函数作为构造函数调用是JavaScript中一个强大的特性。当使用关键字`new`调用函数时，会触发以下几个动作：

1. 创建一个新的空对象；
2. 该对象作为`this`参数传递给构造函数，从而成为构造函数的函数上下文；
3. **新构造的对象**作为`new`运算符的返回值（除了我们很快要提到的情况之外）。

具体的过程可见下图：

<img src="https://images.drshw.tech/images/notes/image-20230204203132079.png" alt="image-20230204203132079" style="zoom: 80%;" />

再举个例子：

```js
function Func() {
  this.test = function () {
    return "useless";
  }
  this.a = "a";
}

var obj = new Func();
console.log(obj.test());	// useless
```

如果函数本身有返回值，分两种情况：

+ 如果构造函数返回一个对象，则该对象将作为整个表达式的值返回，而传入构造函数的`this`将被**丢弃**；
+ 如果构造函数返回的是非对象类型，则**忽略返回值**，返回新创建的对象。

在一些情况下，我们需要显示地改变函数的上下文，比如下面的情况：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example</title>
</head>
<body>
  <button id="test">Click Me!</button>
  <script>
    function Button() {
      this.clicked = false;
      this.click = function () {
        this.clicked = true;
        button.clicked ? console.log("Button was clicked!") : console.log("Button was not clicked!");
      };
    }
    var button = new Button();
    var elem = document.getElementById("test");
    elem.addEventListener("click", button.click);
  </script>
</body>
</html>
```

程序的本意是：若从未点击过按钮，则打印`Button was not clicked!`，否则打印`Button was clicked!`，但貌似是哪里出现了问题。

这是因为浏览器的事件处理系统会把调用的上下文定义，作为事件触发的目标元素，`button.click()`上下文将是`<button>`元素对象，而非`button`对象。而函数体只是给`<button>`元素对象添加了`clicked`属性，并未更改`button`对象中的`clicked`属性，因此也就不会生效了。我们可以通过更改`button.click()`的上下文解决问题。

我们可以使用每个函数上都存在的这两种方法：`apply`和`call`，显式地指定任何对象作为函数的上下文。

若想使用`apply`方法调用函数，需要为其传递两个参数：作为函数**上下文的对象**和一个**数组**作为函数调用的参数。`call`方法的使用方式类似，不同点在于是直接以**参数列表**的形式，而不再是作为数组传递。

举个例子：

```js
function juggle() { // 接收任意个数的变量，并将其相加并作为对象的成员
  var res = 0;
  for (var n = 0; n < arguments.length; n++) {
    res += arguments[n];
  }
  this.result = res;
}

var ninja1 = {};   // 创建两个对象
var ninja2 = {};

juggle.apply(ninja1, [1, 2, 3, 4]); // 传入数组
juggle.call(ninja2, 5, 6, 7, 8);  // 传入参数列表

console.log(ninja1.result); // 10
console.log(ninja2.result); // 26
```

<img src="https://images.drshw.tech/images/notes/image-20230204214514105.png" alt="image-20230204214514105" style="zoom:80%;" />

<img src="https://images.drshw.tech/images/notes/image-20230204215334988.png" alt="image-20230204215334988" style="zoom: 80%;" />

使用案例——强制指定回调函数的函数上下文：通过`apply/call`实现一个简化版本的迭代函数（类似于JavaScript引擎支持的`forEach`数组方法）。

+ 迭代函数接收需要遍历的目标对象数组作为第一个参数，回调函数作为第二个参数；
+ 使用`call`方法调用回调函数，将当前遍历到的元素作为第一个参数，循环索引作为第二个参数，使得当前元素作为函数上下文，循环索引作为回调函数的参数。

```js
function forEach(list, callback) {  // 传入数组索引，和对应的处理逻辑
  for (var i = 0; i < list.length; i++) { 
    callback.call(list[i], i);  // 使用call方法，重新指定this的指向
  } 
}

var students = [  // 一个由对象组成的数组
  { name: 'John', age: 15 },
  { name: 'Jane', age: 16 },
  { name: 'Jack', age: 17 }
]

forEach(students, function (id) { // 调用
  console.log(id, this == students[id]);
});
```

### 解决函数上下文的问题

上下文问题是写js时经常遇到的问题，上文已经介绍了一些处理方案，在这里我们看看另外两个选择：箭头函数和`bind`方法，在一些情况下可以更**优雅**地实现相同的效果。

箭头函数作为回调函数有一个很优秀的特性：箭头函数没有单独的`this`值。箭头函数的`this`与**声明所在的上下文的相同**，即：`this`在箭头函数**创建时确定**。

于是，我们回到上面按钮的例子，将出问题的那部分函数该为箭头函数，问题就解决了：

```html
...
  <button id="test">Click Me!</button>
  <script>
    function Button() {
      this.clicked = false;
      this.click = () => {	// 改为箭头函数
        this.clicked = true;
        button.clicked ? console.log("Button was clicked!") : console.log("Button was not clicked!");
      };
    }
    var button = new Button();
    var elem = document.getElementById("test");
    elem.addEventListener("click", button.click);
  </script>
...
```

调用箭头函数时，不会隐式传入`this`参数，而是从定义时的函数继承上下文。于是，箭头函数在构造函数内部，`this`指向新创建的对象本身，因此无论何时调用`click`函数，`this`都将指向新创建的`button`对象。

**注意！如果忘记箭头函数的副作用可能会导致一些bug，需要特别小心！**举个例子：

```js
function start() {
  var user_data = {
    name: "John Doe",
    get_name: () => {
      return this.name;
    }
  }
  return user_data;
}

console.log(start().get_name());	// undefined
```

其中的`get_name`方法中，由于箭头函数会继承`this`，所以这里的`this`指代的依旧是函数中的`this`隐式参数（全局运行环境），其中没有`name`属性。在这种情况下，就需要使用一般函数表达式了。

类似于`call`与`apply`，函数还可访问`bind`方法创建**新函数**。无论使用哪种方法调用，`bind`方法创建的新函数**与原始函数的函数体相同**（被绑定的函数与原始函数具有一致的行为），新函数被**绑定到指定的对象上**。

还是用按钮的那个例子，如果不使用箭头函数，可以使用`bind`函数解决问题：

```js
...
  <button id="test">Click Me!</button>
  <script>
    function Button() {
      this.clicked = false;
      this.click = function () {	// 改为箭头函数
        this.clicked = true;
        button.clicked ? console.log("Button was clicked!") : console.log("Button was not clicked!");
      };
    }
    var button = new Button();
    var elem = document.getElementById("test");
    elem.addEventListener("click", button.click.bind(button));	// 使用bind函数创建新函数，绑定到button对象上
  </script>
...
```

`bind`函数会创建一个上下文为指定对象的全新函数，此处将上下文修正`button`对象，解决了问题。
