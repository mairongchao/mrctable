# mrctable是一个jquery table控件
其开发思路基本跟easyui的datagrid差不多，依赖jquery1.7以上。<br/>
大致用法参考 [datagrid使用](http://www.jeasyui.net/plugins/183.html)<br/>
控件依赖于外部laypage分布控件，[laypage控件](https://www.layui.com/laypage/)<br/>
控件依赖于样式css/style.css和css/base.css
## 具体用法
* 具体的html代码
```html
<div class="search-list">
 <table id="testList"></table>
</div>
<div class="search-foot">
 <div class="search-pull-right">
  <div class="search-page"></div>
 </div>
</div>
```
* 具体的javascript代码
```javascript
  //初始化table控件,描绘table的th
  $("#testList").ztable();
  //为table行赋值,row为后面返回来的json数据
  $("#testList").ztable("loadData", rows)
```
## 一些常用功能参数控件内部代码
