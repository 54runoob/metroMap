var cityListData = {
		"citylist": [],

};	
function initCityListData() {
	var dataroot = "/metroMap/data/cityList.json";
	console.log("初始化城市列表时获取json路径"+dataroot);
	$.ajaxSettings.async = false;//要设置成同步，不然gz_subwaydata不能被成功赋值
	$.getJSON(dataroot, function(data) {
		cityListData.citylist = data.citylist;
		var city = new Array();
		for(var i=0;i<data.citylist.length;i++){
			city.push(data.citylist[i]);
		}
		//console.log(city);
		for(var i = 0;i<cityListData.citylist.length;i++){
			$("#citylist").append("<li class='cityitem' adcode='"+city[i].adcode+"' spell='"+city[i].spell+"'><a href='javascript:void(0)'>"+city[i].cityname+"</a></li>");
			var city_name = $(".city_name").html();
			console.log(city_name);
			$(".cityitem")[i].addEventListener("click",function(){
				$("#header").css("display","block");
				console.log(this.innerText);
				$(".city_name").html(this.innerText);
				$("#citypage").css("display","none");
				$(".cityitem").remove();//选择完城市后要进行移除，不然城市列表会出现重复的城市

				//地铁图初始化
				console.log("被选中的城市的编号："+this.getAttribute("adcode"));
				console.log("被选中的城市的拼音："+this.getAttribute("spell"));
				if(init_adcode!=""){
					init_adcode = this.getAttribute("adcode");
				}
				spell = this.getAttribute("spell");
					
				//init_adcode= 4401;
				//开启easy模式, 直接完成地铁图基本功能, 无需自己写交互
				window.cbk(init_adcode);
				//选择起点站事件
					
				init_SubwayData(init_adcode,spell);
			},false);
		}	
	});
};

function init_SubwayData(city_adcode,city_spell) {
	var city_subwaydata = {
			adcode : "",//地铁城市编号
			line : []
	//地铁线路
	};
	var url1 = "https://54runoob.github.io/metroMap";
	console.log("当前路径"+url1);
	var dataroot = url1+"/data/"+city_adcode+"_drw_"+city_spell+".json";
	console.log("初始化地铁图时获取json路径："+dataroot);
	$.ajaxSettings.async = false;//要设置成同步，不然gz_subwaydata不能被成功赋值
	$.getJSON(dataroot, function(data) {
		console.log("从json读取的data.i:"+data.i);
		city_subwaydata.adcode = data.i;
		city_subwaydata.line = data.l;
		
		var x_arr = new Array();//因为json文件已经有一个属性将线路排序起来了
		for(var i=0;i<city_subwaydata.line.length; i++) {
			x_arr.push(parseInt(city_subwaydata.line[i].x));//关键，要把json数据里的字符串类型强转为int类型，以便于快速排序，同时循环push操作	
		}
		//快速排序算法开始
		var quickSort = function(arr) {//定义一个quickSort函数，它的参数是一个数组。
			if (arr.length <= 1) {//检查数组的元素个数，如果小于等于1，就返回
				return arr;
			}
			//选择"基准"（pivot），并将其与原数组分离，再定义两个空数组，用来存放一左一右的两个子集
			var pivotIndex = Math.floor(arr.length / 2);
			var pivot = arr.splice(pivotIndex, 1)[0];
			var left = [];
			var right = [];
			for ( var i = 0; i < arr.length; i++) {//开始遍历数组，小于"基准"的元素放入左边的子集，大于基准的元素放入右边的子集
				if (arr[i] < pivot) {
					left.push(arr[i]);
				} else {
					right.push(arr[i]);
				}
			}
			return quickSort(left).concat([ pivot ], quickSort(right));//使用递归不断重复这个过程，就可以得到排序后的数组。
		};//快速排序算法结束
		var new_x_arr = quickSort(x_arr);//把排序后的数组保存起来
		console.log(quickSort(x_arr));
		var line_arr = [];
		for ( var i = 0; i < new_x_arr.length; i++) {
			//console.log(new_x_arr[i]);
			for(var j =0;j<city_subwaydata.line.length;j++){
				if(new_x_arr[i]==city_subwaydata.line[j].x)//编号进行对比
					line_arr.push(city_subwaydata.line[j]);
			}
		}
		for(var i=0;i<line_arr.length;i++){
			console.log("经快速排序后的线路对象："+line_arr[i].ln);
		} 
		for ( var i = 0; i < line_arr.length; i++) {
			var span_bg_color = "#" + line_arr[i].cl;//拼接颜色值
			var span_color = "<span class='line_color' style='background:"+span_bg_color+"'></span>";//构造节点
			$(".fliter_detail").append(
					"<li class='fliter_item' id='caption-"+line_arr[i].ls+"' lineid='"+line_arr[i].ls+"'>" + span_color
					+ "<span class='line_name'>" + line_arr[i].ln
					+ "</span></li>");
		}
		
		

		console.log($(".fliter_item"));
		var fliter_item = $(".fliter_item");
		for(var i=0;i<fliter_item.length;i++){//循环绑定“显示地铁线路”的事件
			fliter_item[i].addEventListener("click",function(){
				mysubway.showLine(this.innerText);
				var $select_obj = document.getElementById('g-select');
				$(".light_box").css("display","none");
				$(".filter_content").css("display","none");
				mysubway.setFitView($select_obj);
				var center = mysubway.getSelectedLineCenter();
				mysubway.setCenter(center);
		
			},false);
		}
		
	});	
}
		
init_SubwayData("4401","guangzhou");


init_adcode= 4401;
var mysubway;
//开启easy模式, 直接完成地铁图基本功能, 无需自己写交互
window.cbk = function() {

	console.log("初始化地铁图的编号："+init_adcode);
	mysubway = subway("mysubway", {
		easy : 1,
		adcode : init_adcode
	});

	//选择起点站事件
	mysubway.event.on("startStation.touch", function(t, e) {
		console.log("起始站id："+e.id);
		var startStationName = $("#name-"+ e.id).html();
		
		$(".route_start").removeClass("route_placeholder");
		$(".route_start").text(startStationName);
		
		console.log("起始站：" + startStationName);
	});
	//选择终点站事件 
	mysubway.event.on("endStation.touch", function(t, e) {
		console.log("终点站id："+e.id);
		var endStationName = $("#name-" + e.id).html();
		$(".route_end").removeClass("route_placeholder");
		$(".route_end").text(endStationName);
		console.log("终点站:" + endStationName);
	});
	//	路径规划完毕后触发此事件
	mysubway.event.on("subway.routeComplete",function(){
		
		var ajax = $.ajax({
			type: 'GET',// 这是请求的方式 可以是GET方式也可以是POST方式, 默认是GET
			url: 'https://webapi.amap.com/subway/service/navigation/busExt',// 这是请求的连接地址 一般情况下这个地址是后台给前端的一个连接，直接写就可以
			dataType: 'json',// 这是后台返回的数据类型 一般情况下都是一个json数据， 前端遍历一下就OK
			async: true, // 默认为true，默认为true时，所有请求均为异步请求，如果需要发送同步请求，需设置为false,
			timeout: 8000, // 设置请求超时时间（毫秒）。此设置将覆盖全局设置
			data: {// 要传递的参数
				'poiid1' : '',
				'poiid2' : '',
				'type' : 6,
				'Ver' : 3,
			},
			beforeSend:function (){// 在发送请求前就开始执行 （一般用来显示loading图）
				$(".loading-bg").css("dispaly","block");
			},
			/*success:function (data) {// 发送请求成功后开始执行，data是请求成功后，返回的数据
				console.log(data);
				console.log("单程票价格为："+data.buslist[0].expense);
				console.log(Math.ceil(data.buslist[0].expensetime/60)>=60);
				var time = Math.ceil(data.buslist[0].expensetime/60);//转化为以分钟为单位
				var hours = Math.floor(Math.ceil(data.buslist[0].expensetime/60)/60)+"小时"+Math.ceil(data.buslist[0].expensetime/60)%60+"分钟";
				var mins = Math.ceil(data.buslist[0].expensetime/60)+"分钟";
				//console.log(Math.floor(Math.ceil(data.buslist[0].expensetime/60)/60)+"小时"+Math.ceil(data.buslist[0].expensetime/60)%60+"分钟");
				console.log(time+"   "+hours+"  "+mins);
				console.log(time>=60);
				console.log(time>=60? hours:mins);
			},*/
			complete: function () {//当请求完成后开始执行，无论成功或是失败都会执行 （一般用来隐藏loading图）
				$(".loading-bg").css("dispaly","none");
			},
			error: function (xhr, textStatus, errorThrown) {//  请求失败后就开始执行，请求超时后，在这里执行请求超时后要执行的函数
			}
		});
		
		var route_start = $(".route_start").text();//获取用户在地铁图选择的起点站站名
		var route_end = $(".route_end").text();////获取用户在地铁图选择的终点站站名
		$("#startPoint").val(route_start);//把选择的起点站赋予给隐藏表单
		$("#endPoint").val(route_end);////把选择的终点站赋予给隐藏表单
		console.log(route_start+"   "+route_end);
		/*var ajax2 = $.ajax({
			
			type: 'POST',// 这是请求的方式 可以是GET方式也可以是POST方式, 默认是GET
			url: 'queryRoute.do',// 这是请求的连接地址 一般情况下这个地址是后台给前端的一个连接，直接写就可以
			//dataType: 'json',// 这是后台返回的数据类型 一般情况下都是一个json数据， 前端遍历一下就OK
			async: true, // 默认为true，默认为true时，所有请求均为异步请求，如果需要发送同步请求，需设置为false,
			timeout: 8000, // 设置请求超时时间（毫秒）。此设置将覆盖全局设置
			data: {// 要传递的参数
				'startPoint' : route_start,
				'endPoint' : route_end,
			},
			beforeSend:function (){// 在发送请求前就开始执行 （一般用来显示loading图）
				$(".loading-bg").css("dispaly","block");
			},
			success:function (data) {// 发送请求成功后开始执行，data是请求成功后，返回的数据
				console.log(data);
			},
			complete: function () {//当请求完成后开始执行，无论成功或是失败都会执行 （一般用来隐藏loading图）
				$(".loading-bg").css("dispaly","none");
			},
			error: function (xhr, textStatus, errorThrown) {//  请求失败后就开始执行，请求超时后，在这里执行请求超时后要执行的函数
			}
		});*/
		/*$(".filter_btn").css("display","none");
		$(".filter_content").css("display","none");*/
		var route_close_btn = $(".route_close_btn");
		route_close_btn[0].addEventListener("touchend",function(){//这里事件要用touchstart或touchend，touch执行顺序比这两种都慢，因为比封装好的绑定的事件的执行之后的话，该绑定会失效
			//alert("666");
			$(".route_start").addClass("route_placeholder");
			$(".route_end").addClass("route_placeholder");
			$(".route_start").text("起点站");
			$(".route_end").text("终点站");
		},false);
	});

	console.log($(".fliter_item"));
	var fliter_item = $(".fliter_item");
	for(var i=0;i<fliter_item.length;i++){//循环绑定“显示地铁线路”的事件
		fliter_item[i].addEventListener("click",function(){
			mysubway.showLine(this.innerText);
			var $select_obj = document.getElementById('g-select');
			$(".light_box").css("display","none");
			$(".filter_content").css("display","none");
			mysubway.setFitView($select_obj);
			var center = mysubway.getSelectedLineCenter();
			mysubway.setCenter(center);
		},false);
	}				
};



