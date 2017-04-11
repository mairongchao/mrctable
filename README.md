# mrctable是一个jquery table控件
其开发思路基本跟easyui的datagrid差不多，依赖jquery1.7以上。<br/>
大致用法参考 [datagrid使用](http://www.jeasyui.net/plugins/183.html)<br/>
控件依赖于外部laypage分布控件，[laypage控件](https://www.layui.com/laypage/)<br/>
控件依赖于样式css/style.css和css/base.css
## 效果图
![](https://github.com/tsmairc/mrctable/effect.png)  
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
var options = {
pageSize : 5,
pagination : true,
singleSelect : false,
param : {},
idField : "test_id",
columns : [
 {field : "test_id", title : "id", width : "13%"},
 {field : "test1", title : "测试1", width : "15%"},
 {field : "test2", title : "测试2", width : "15%"},
 {field : "test3", title : "测试3", width : "10%"},
 {field : "test4", title : "测试4", width : "25%"},
 {field : "control", title : "操作", width : "15%", formatter : function(value, rowData, rowIndex) {
  return "<a href='javascript:void(0)' class='ctrl btn_detail'>详情</a>";
 }}],
 onLoad: function(){}
};
$("#testList").ztable(options);
//为table行赋值,row为后面返回来的json数据
$("#testList").ztable("loadData", rows)
```
## 一些常用功能参数控件内部代码
内部一些代码介绍：<br/>
以下这段代码，主要是区分控件初始化与执行控件内部方法的处理<br/>
```javascript
if(typeof options == "string"){
    if(!_self.data("ztable")){
        //没初始化，不执行
	return null;
    }			
    var method = $.fn.ztable.methods[options];
	if($.isFunction(method)){
	    return method(_self, params);
	}
        return null;
    }
 }
 ```
