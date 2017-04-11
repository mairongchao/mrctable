/**
 * 使用html示例
 * <div class="search-list">
 *		<table id="serviceList"></table>
 *	</div>
 *	<div class="search-foot">
 *		<div class="search-pull-right">
 *			<div class="search-page"></div>
 *		</div>
 *	</div>
 */
(function($){
	$.fn.ztable = function(options, params){
		var _self = this;
		//需求table标签
		if (!_self.is("table")){
			return null;
		}
		
		//执行方法
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
		options = options || {};
		
		//$(".class")有多种
		return _self.each(function(){
			//根据属性初始化
			//$(this).html("");
			var data = $(this).data("ztable");
			if(data){
				data.options = $.extend(data.options, options);
			}
			else{
				//覆盖默认属性
				options = $.extend({}, $.fn.ztable.defaults, options);
				$(this).data("ztable", {options: options});
			}
			
			render($(this));
			initEvent($(this));
		});
		
		/**渲染表格*/
		function render(jq){
			var options = $.fn.ztable.methods.options(jq);
			var columns = options.columns;
			
			var html = [];
			html.push("<thead>");
			html.push("    <tr>");
			
			//组装th
			if(options.singleSelect !== true){
				html.push("<th style='width:5%;'>");
				html.push("    <label class='inp-checkbox-label'>");
				html.push("        <em class='inp-checkbox'><input type='checkbox'></em>");
				html.push("    </label>");
				html.push("</th>");
			}
			else {
				html.push("<th style='width:5%;'></th>");
			}
			
			$.each(columns, function(i, column){
				var align = "class='text-left'";
				if(column.align == "right"){
					align = "class='text-right'";
				}
				else if(column.align == "center"){
					align = "class='text-center'";
				}
				
				var width = "";
				if(column.width){
					width = " style='width:"+ column.width +";'";
				}
				
				html.push("<th " + align + " " + width + " field='" + column.field + "'>" + column.title + "</th>");
			});
			
			html.push("    </tr>");
			html.push("</thead>");
			html.push("<tbody></tbody>");
			jq.html(html.join(""));
		}
		
		/**初始化事件*/
		function initEvent(jq){
			jq.delegate("input[type=checkbox]", "click", function(){
				return false;
			});
			
			//行点击事件处理
			jq.delegate("tbody tr", "click", function(){
				if($(this).hasClass("empty-row")){
					return;
				}
				var index, row;
				var options = $.fn.ztable.methods.options(jq);
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
						row = $.fn.ztable.methods.findData(jq, index);
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
						if(checkboxs.size() == $.fn.ztable.methods.getData(jq).length){
							jq.find("thead .inp-checkbox-label").addClass("active");//全选复选框
							jq.find("thead .inp-checkbox-label input[type=checkbox]").prop("checked", true);
						}
					}
					
					//触发选中事件
					if($.isFunction(options.onSelect)){
						index = $(this).index();
						row = $.fn.ztable.methods.findData(jq, index);
						options.onSelect(index, row);
					}
				}
			});
			
			//操作中的更多选项
			jq.delegate(".more-pop-warp", "click", function(){
				$(this).addClass("more-pop-show");
				return false;
			});
			
			jq.delegate("tbody tr", "hover", function(){
				$(this).find(".more-pop-show").removeClass("more-pop-show");
			});
			
			//全选复选框
			jq.find("thead .inp-checkbox-label").click(function(){
				if($(this).hasClass("active")){
					$.fn.ztable.methods.unSelectAll(jq);
				}
				else{
					$.fn.ztable.methods.selectAll(jq);
				}
				
				return false;
			});
		}
	};
	
	$.fn.ztable.methods = {
		options: function(jq){
			return jq.data("ztable").options || {};
		},
		/**跳到某页*/
		gotoPage: function(jq, page){
			var arg = arguments;
			if(page < 1){
				return;
			}
			
			var options = $.fn.ztable.methods.options(jq);
			if(!options.url){
				return;
			}
			
			options.pageNumber = page;
			$.extend(options.param, {page: page, rows: options.pageSize});
			
			//跳转页面时取消全选
			jq.find("thead input[type=checkbox]").closest("label").removeClass("active");
			
			$.ajax({
				url: options.url,
				async: true,
				contentType: "application/json;charset=UTF-8",
				data: params,
				dataType: "text",
				type: "POST",
				dataFilter: function(data, type){
					try{
						data = jQuery.parseJSON(data);
					}
					catch(e){}
					
					return data;
				},
				success: function(data){
					if(!data){
						$.fn.ztable.methods.loadData(jq, []);
					}
					else{
						if(data.rows.length > 0){
							$.fn.ztable.methods.loadData(jq, data);
						}
						else{
							if(options.param.page == 1){
								$.fn.ztable.methods.loadData(jq, data);
							}
							else{
								//当前页没有数据，且不是第一页，递归调用当前函数，跳转到上一页
								arg.callee(jq, page - 1);
							}
						}
					}
				}
			});
			
			
			Invoker.async(action, method, options.param, function(data){
				if(!data){
					$.fn.ztable.methods.loadData(jq, []);
				}
				else{
					if(data.rows.length > 0){
						$.fn.ztable.methods.loadData(jq, data);
					}
					else{
						if(options.param.page == 1){
							$.fn.ztable.methods.loadData(jq, data);
						}
						else{
							//当前页没有数据，且不是第一页，递归调用当前函数，跳转到上一页
							arg.callee(jq, page - 1);
						}
					}
				}
			});
		},
		/**以param为参数加载第一页数据*/
		load: function(jq, param){
			//刷新dataTable数据
			var options = $.fn.ztable.methods.options(jq);
			options.param = param || {};
			$.fn.ztable.methods.gotoPage(jq, 1);
		},
		/**重新加载当前页的数据*/
		reload: function(jq){
			var options = $.fn.ztable.methods.options(jq);
			$.fn.ztable.methods.gotoPage(jq, options.pageNumber);
		},
		/**在表格中渲染数据*/
		loadData: function(jq, data){
			//data格式可以是数组，也可以是{total: n, rows: [{key1: value1, key2: value2}, ...]}
			var options = $.fn.ztable.methods.options(jq);
			
			jq.find("tbody").empty();
			
			var total = 0;
			var rows = [];
			if($.isArray(data)){
				total = data.length;
				rows = data;
			}
			else if(!$.isEmptyObject(data)){
				try{
					total = parseInt(data.total);
				}
				catch(e){}
				
				rows = data.rows;
			}
			
			jq.data("rows", rows);
			
			var html = [];
			if($.isArray(rows) && rows.length > 0){
				$.each(rows, function(i, row){
					var row_id = row[options.idField] || "";
					html.push("<tr id='" + row_id + "'>");
					html.push("    <td>");
					html.push("        <label class='inp-checkbox-label'>");
					html.push("            <em class='inp-checkbox'><input type='checkbox'></em>");
					html.push("        </label>");
					html.push("    </td>");
					
					$.each(options.columns, function(k, column){
						var align = "class='text-left'";
						if(column.align == "right"){
							align = "class='text-right'";
						}
						else if(column.align == "center"){
							align = "class='text-center'";
						}
						
						if($.isFunction(column.formatter)){
							html.push("<td " + align + " field='" + column.field + "'>" + column.formatter(row[column.field], row, i) + "</td>");
						}
						else if(column.code){
							var attrValues = column.attrValues || {};
							
							var attr_value = row[column.field];
							var attr_value_name = attrValues[attr_value] || attr_value;
							
							html.push("<td " + align + " field='" + column.field + "'>" + attr_value_name + "</td>");
						}
						else{
							html.push("<td " + align + " field='" + column.field + "'>" + (row[column.field] || "") + "</td>");
						}
					});
					
					html.push("</tr>");
				});
			}
			else{
				html.push("<tr class='empty-row'><td colspan='" + (options.columns.length + 1) + "' class='text-center'><font>暂无数据，请重新查询！</font></td></tr>");
			}
			
			jq.find("tbody").html(html.join(""));
			
			//分页处理
			var pageNumber = options.pageNumber;
			var pageSize = options.pageSize;
			
			var pageCount;
			if(total % pageSize > 0){
				pageCount = (total / pageSize) + 1;
			}
			else{
				pageCount = total / pageSize;
			}
			
			if(options.pagination === true){
				var footPage = jq.closest(".search-list").next(".search-foot").find(".search-page");
				laypage({
					cont: footPage,
					pages: pageCount,//总页数
					curr: pageNumber,//当前页
					groups: "3",//连续页数
					skip: true,//跳页
					jump: function(obj, first){//触发分页后的回调
						if(!first){//点击跳页触发函数自身，并传递当前页：obj.curr
							$.fn.ztable.methods.gotoPage(jq, obj.curr);
						}
					}
				});
			}
			
			//绑定onLoad事件
			if($.isFunction(options.onLoad)){
				options.onLoad(rows);
			}
		},
		/**获取选中的数据*/
		getSelected: function(jq){
			var results = [];
			var rows = $.fn.ztable.methods.getData(jq);//所有数据
			jq.find("tbody .inp-checkbox-label").each(function(i, object){
				if($(object).hasClass("active")){
					results.push(rows[i]);
				}
			});
			
			return results;
		},
		/**获取所有数据*/
		getData: function(jq){
			return jq.data("rows") || [];
		},
		/**查询指定数据，select可以是行tr、数据id、行索引*/
		findData: function(jq, selector){
			var rows = $.fn.ztable.methods.getData(jq);//所有数据
			var index;
			if((selector instanceof jQuery) && selector.is("tr")){
				//selector是行的tr
				index = selector.index();
				if(index != -1 && rows.length > index){
					return rows[index];
				}
			}
			else if(typeof(selector) === "string"){
				//selector是id
				index = jq.find("tbody tr[id=" + selector + "]").index();
				if(index != -1 && rows.length > index){
					return rows[index];
				}
			}
			else if(typeof(selector) === "number"){
				//selector是行索引
				if(rows.length > selector){
					return rows[selector];
				}
			}
			
			return null;
		},
		/**添加记录*/
		addData: function(jq, row){
			//得到所有行数据
			var rows = $.fn.ztable.methods.getData(jq);//所有数据
			rows.push(row);
			//重新加载列表
			$.fn.ztable.methods.loadData(jq, rows);
		},
		/**删除记录*/
		delData: function(jq, selector){
			var delIndex = -1;
			var index;
			var rows = $.fn.ztable.methods.getData(jq);//所有数据
			if((selector instanceof jQuery) && selector.is("tr")){
				//selector是行的tr
				index = selector.index();
				if(rows.length > index){
					delIndex = index;
				}
			}
			else if(typeof(selector) === "string"){
				//selector是id
				index = jq.find("tbody tr[id=" + selector + "]").index();
				if(rows.length > index){
					delIndex = index;
				}
			}
			else if(typeof(selector) === "number"){
				//selector是行索引
				if(rows.length > selector){
					delIndex = selector;
				}
			}
			
			if(delIndex != -1){
				rows.splice(delIndex, 1);
				$.fn.ztable.methods.loadData(jq, rows);
			}
		},
		/**设置全选*/
		selectAll: function(jq){
			var checkAll = jq.find("thead .inp-checkbox-label");
			
			//全部选中
			checkAll.addClass("active");
			checkAll.find("input[type=checkbox]").prop("checked", true);
			
			jq.find("tbody .inp-checkbox-label").addClass("active");
			jq.find("tbody .inp-checkbox-label input[type=checkbox]").prop("checked", true);
			
			//触发全选事件
			var options = $.fn.ztable.methods.options(jq);
			if($.isFunction(options.onSelectAll)){
				var rows = $.fn.ztable.methods.getData(jq);
				options.onSelectAll(rows);
			}
		},
		/**取消全选*/
		unSelectAll: function(jq){
			var checkAll = jq.find("thead .inp-checkbox-label");
			
			//取消全选
			checkAll.removeClass("active");
			checkAll.find("input[type=checkbox]").prop("checked", false);
			
			jq.find("tbody .inp-checkbox-label").removeClass("active");
			jq.find("tbody .inp-checkbox-label input[type=checkbox]").prop("checked", false);
			
			//触发取消全选事件
			var options = $.fn.ztable.methods.options(jq);
			if($.isFunction(options.onUnSelectAll)){
				var rows = $.fn.ztable.methods.getData(jq);
				options.onUnSelectAll(rows);
			}
		},
		/**获取本地缓存*/
		getItem: function(key){
			if(window.localStorage){
				var value = window.localStorage.getItem(key);
				if(value != null){
					try{
						value = $.parseJSON(value);
					}
					catch(e){

					}
				}
				return value;
			}

			return null;
		},
		/**添加本地缓存*/
		setItem: function(key, value){
			if(window.localStorage){
				if(typeof(value) !== "string"){
					value = JSON.stringify(value);
				}
				window.localStorage.setItem(key, value);
			}
		}
	};
	
	//默认属性
	$.fn.ztable.defaults = $.extend({}, {
		pageNumber: 1,//当前页
		pageSize: 10,//每页多少数据
		columns: [],//定义表头对象{field: "属性名", title: "表头描述", width: "10%", align:"left、center、right", code: "静态数据编码", formatter: function(value, row, index){}}
		singleSelect: true,//是否单选，false则加入选择框checkbox
		pagination: true,//是否分页
		idField: "",//作为每行记录主键id的字段名称
		onSelect: function(index, row){},//选中记录时触发的事件
		onUnSelect: function(index, row){},//选中记录时触发的事件
		onSelectAll: function(rows){},//全选触发的事件
		onUnSelectAll: function(rows){},//取消全选触发的事件
		onLoad: function(data){}//加载数据完毕时触发的事件
	});
 })(jQuery);