---
layout: post
---
#{{ page.title }}


###一、	DEMON

<a href="http://www.git-way.com/demon/pull/pullmod1.html">1.顶部下拉刷新,底部上拉加载</a>

<a href="http://www.git-way.com/demon/pull/pullmod2.html">2.顶部下拉刷新,底部自动加载更多</a>
###二、	兼容性测试
 
根据友盟统计的前十机型做了兼容测试
结论是：

ios 和安卓4.0以上机型可以流畅体验
安卓2.x机型会存在卡顿现象,需要额外代码的适配。

###三、	实现方式
在网页中模拟原生的拉动加载或刷新，都需要一个技术: 页面局部滚动。

当下的移动web技术，主要使用下面两种方式实现局部区域的滚动：

__基于IScroll组件，该组件内置了PullToRefresh 功能__

__使用浏览器原生支持overflow: scroll，(安卓3+支持,2.x需要Js模拟)，在iOS下使用-webkit-overflow-scrolling: touch;实现惯性滚动。__

###DEMON使用IScroll来实现
__优点：__
1.	该组件的兼容性好

iPhone/Ipod touch >=3.1.1,
iPad >=3.2,
Android >=1.6
2.	额外弥补了position:fixed;在移动端的缺陷

__缺点:__

已知存在一些问题：
1.	做上拉加载更多内容的时候，如果列表涉及复杂的布局和图片，这时有时会出现闪动，需要额外配置解决
2.	过长的滚动内容，会导致卡顿，iscroll是用js+css3实现，对浏览器的消耗肯定是可观的，要避免无限制的内容加载
3.	滚动区域的页面结构过于复杂，会导致卡顿
4.	安卓2.x老旧机型可能出现卡顿

###四、	使用场景
对比现在各个电商移动端的应用来看，
原生实现的下拉刷新和滚动到底加载功能都已普遍使用

__A.	淘宝__
安卓客户端的微淘页面
 
滑动动到页面底部显示“正在加载”后加载新内容

__B.	京东__
安卓客户端首页：
 
主题页面 ：滑动动到底部显示“正在加载”后加载新内容

__C.	亚马逊__
安卓客户端：
虽然并没有使用上拉刷新，
但在检索结果列表页底部显示“正在加载”，后加载新内容


