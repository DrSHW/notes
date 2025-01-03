## 第 3 章 Go 汇编语言

*能跑就行，不行加机器。——rfyiamcool & 爱学习的孙老板*

*跟对人，做对事。——Rhichy*

Go 语言中很多设计思想和工具都是传承自 Plan9 操作系统，Go 汇编语言也是基于 Plan9 汇编演化而来。根据 Rob Pike 的介绍，大神 Ken Thompson 在 1986 年为 Plan9 系统编写的 C 语言编译器输出的汇编伪代码就是 Plan9 汇编的前身。所谓的 Plan9 汇编语言只是便于以手工方式书写该 C 语言编译器输出的汇编伪代码而已。

无论高级语言如何发展，作为最接近 CPU 的汇编语言的地位依然是无法彻底被替代的。只有通过汇编语言才能彻底挖掘 CPU 芯片的全部功能，因此操作系统的引导过程必须要依赖汇编语言的帮助。只有通过汇编语言才能彻底榨干 CPU 芯片的性能，因此很多底层的加密解密等对性能敏感的算法会考虑通过汇编语言进行性能优化。

对于每一个严肃的 Gopher，Go 汇编语言都是一个不可忽视的技术。因为哪怕只懂一点点汇编，也便于更好地理解计算机原理，也更容易理解 Go 语言中动态栈、接口等高级特性的实现原理。而且掌握了 Go 汇编语言之后，你将重新站在编程语言鄙视链的顶端，不用担心再被任何其它所谓的高级编程语言用户鄙视。

本章我们将以 AMD64 为主要开发环境，简单地探讨 Go 汇编语言的基础用法。

