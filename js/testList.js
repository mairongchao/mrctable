(function(scope) {
	var TestList = Base.extend({
		constructor: function(config) {},
		init: function() {
			var me = this;
			me.initTable();
			me.queryTabel();
			me.initEvent();
		},
		//初始化API列表
		initTable : function() {
			var me = this;
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
							return "<a href='javascript:void(0)' class='ctrl btn_detail'>详情</a> " +
									"<a href='javascript:void(0)' class='ctrl btn_del'>删除</a>";
						}}
						],
				onLoad: me.initTableEvent
			};
			$("#testList").mrctable(options);
		},
		queryTabel: function(){
			$("#testList").mrctable("loadData", data);
		},
		initTableEvent: function(){
			$(".btn_detail").bind("click", function(){
				alert("没有，还没做");
			});
			
			$(".btn_del").bind("click", function(){
				var tr = $(this).closest("tr");
				$("#testList").mrctable("delData", tr);
			});
		},
		initEvent: function(){
			$("#btn_new_row").bind("click", function(){
				$("#testList").mrctable("addData", row);
			});
		}
	});
	window.testList = new TestList();
}(window));
$(function() {
	testList.init();
});
