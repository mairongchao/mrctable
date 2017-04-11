# mrctable是一个jquery table控件
其开发思路基本跟easyui的datagrid差不多，依赖jquery1.7以上。<br/>
大致用法参考 [datagrid使用](http://www.jeasyui.net/plugins/183.html)<br/>
控件依赖于外部laypage分布控件，[laypage控件](https://www.layui.com/laypage/)<br/>
控件依赖于样式css/style.css和css/base.css
## 效果图
![](https://github.com/tsmairc/mrctable/blob/master/effected.png)  
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
$("#testList").mrctable(options);
//为table行赋值,row为后面返回来的json数据
$("#testList").mrctable("loadData", rows)
```
## 一些常用功能参数控件内部代码
控件的实始化的流程是1.根据传进options初始化表头2.利用冒泡去绑定行事件<br/>
内部一些代码介绍：<br/>
以下这段代码，主要是区分控件初始化与执行控件内部方法的处理<br/>
```javascript
//判断第一个参数是否为字符串，如不是则去执行控件内部的方法
if(typeof options == "string"){
    if(!_self.data("mrctable")){
        //没初始化，不执行
	return null;
    }			
    var method = $.fn.mrctable.methods[options];
	if($.isFunction(method)){
	    return method(_self, params);
	}
        return null;
    }
 }
 ```
 下面介绍利用冒泡绑定行事件<br/>
 ```javascript
 //行点击事件处理
jq.delegate("tbody tr", "click", function(){
    //如果当前行是显示没有数据的行时，不处理
    if($(this).hasClass("empty-row")){
        return;
    }
    var index, row;
    var options = $.fn.mrctable.methods.options(jq);
    if($(this).find(".inp-checkbox-label").hasClass("active")){
        //已经选中，取消
        $(this).find(".inp-checkbox-label").removeClass("active");
		$(this).find(".inp-checkbox-label input[type=checkbox]").prop("checked", false);
		$(this).css({"background-color": ""});

		if(!options.singleSelect){
			//取消全选
			jq.find("thead .inp-checkbox-label").removeClass("active");
			jq.find("thead .inp-checkbox-label input[type=checkbox]").prop("checked", false);
		}

		//触发取消选中事件
		if($.isFunction(options.onUnSelect)){
			index = $(this).index();
			row = $.fn.mrctable.methods.findData(jq, index);
			options.onUnSelect(index, row);
		}
	}
	else{
		if(options.singleSelect){
			//如果是单选，先取消其他选中
			jq.find(".inp-checkbox-label").removeClass("active");
			jq.find(".inp-checkbox-label input[type=checkbox]").prop("checked", false);
			jq.find("tbody tr").css({"background-color": ""});
		}

		//选中当前
		$(this).find(".inp-checkbox-label").addClass("active");
		$(this).find(".inp-checkbox-label input[type=checkbox]").prop("checked", true);
		$(this).css({"background-color": "#f5f5f5"});

		if(!options.singleSelect){
			//如果是多选，全部选中后设置全选
			var checkboxs = jq.find("tbody .inp-checkbox-label.active");
			if(checkboxs.size() == $.fn.mrctable.methods.getData(jq).length){
				jq.find("thead .inp-checkbox-label").addClass("active");//全选复选框
				jq.find("thead .inp-checkbox-label input[type=checkbox]").prop("checked", true);
			}
		}

		//触发选中事件
		if($.isFunction(options.onSelect)){
			index = $(this).index();
			row = $.fn.mrctable.methods.findData(jq, index);
			options.onSelect(index, row);
		}
	}
});
 ```
 下面介绍跳页方法gotoPage的片段：<br/>
 这里主要对有时候停留在其它页，而没有数据的处理，利用递归向前翻页
 ```javascript
if(!data){
    $.fn.mrctable.methods.loadData(jq, []);
}
else{
    if(data.rows.length > 0){
        $.fn.mrctable.methods.loadData(jq, data);
    }
    else{
        if(options.param.page == 1){
            $.fn.mrctable.methods.loadData(jq, data);
        }
        else{
	    //当前页没有数据，且不是第一页，递归调用当前函数，跳转到上一页
            arg.callee(jq, page - 1);
        }
    }
}
 ```
 下面介绍loadData方法思路<br/>
 这里的思路主要是首先清空当前的tbody，然后利用jquery的data方法，向当前的控件节点加上要显示的数据,<br/>
 然后遍历当前rows，向tbody加上数据行，再进行分页处理。<br/>
 下面介绍getSelected方法，该方法主要获取选中行数据
 ```javascript
 /**获取选中的数据*/
 //jq为当前行tr的jquery对象
getSelected: function(jq){
    var results = [];
    var rows = $.fn.mrctable.methods.getData(jq);//获取当前页所有数据
    //遍历tbody所有的tr节点，当根据当前选中行的下标去从rows中拿数据，选中tr会有一个active的class
    jq.find("tbody .inp-checkbox-label").each(function(i, object){
        if($(object).hasClass("active")){
	    results.push(rows[i]);
	}
    });
    return results;
}
 ```
 
 
