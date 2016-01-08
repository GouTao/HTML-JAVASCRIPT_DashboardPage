$(document).ready(init);
var theUrl="http://192.168.1.113:12032";
var boardList=[],relayInfo=[],tempBoard,tempRelay;
var machineInfo=[],tempMachine;
var tempState;
var tempController,tempState;
function init(){
	$(".nav").bind("click",function(e){
		$(".nav li").each(function(){
			$(this).removeClass("active");
		})
		$(e.target).parent().addClass("active");
		$(".container").each(function(){
			$(this).css("display","none");
		})
		switch($(e.target).html()){
			case "继电器控制":
				$("#relayContain").css("display","block");
				break;
			case "唤醒/关机":
				$("#machineContain").css("display","block");
				break;
			case "机器状态":
				$("#stateContain").css("display","block");
				break;
		}
	})
	
	/*--------- 加载config -------*/
	loadConfig();
}

function loadConfig(){
	boardList=[];
	var sendObj=new Object;
	sendObj.command="getState";
	var sendMsg=JSON.stringify(sendObj);
	$.ajax({
		type:"post",
		url:"http://192.168.1.113:12032",
		async:false,
		dataType:"json",
		data:{"data":sendMsg},
		timeout:5000,
		success:function(res){
			if(res.result=="success"){
				res.data.relay[1].name="0201";
				createUL(res.data);
			}
		},
		error:function(){
			alert("加载配置文件失败");
		}
	});
	$("select").select2({dropdownCssClass: 'dropdown-inverse'});
}

function createUL(data){
	if(data.relay.length>0){
		for(var i=0;i<data.relay.length;i++){
			var checkBoard=Number(data.relay[i].name.substr(0,2));
			if(boardList[checkBoard-1]==undefined){
				boardList[checkBoard-1]=[];
				boardList[checkBoard-1].push(data.relay[i]);
			}
			else{
				boardList[checkBoard-1].push(data.relay[i]);
			}
		}
		createBoard();
	}
	if(data.machine.length>0){
		machineInfo=data.machine;
		createMachine();
		createState();
	}
	
	
	//全部关闭操作
	$("#shutAll").unbind("click").bind("click",function(){
		var shut=new Object;
		shut.command="relay";
		shut.board=Number(tempBoard)+1;
		shut.relay=28;
		shut.onoff=1;
		var shutMsg=JSON.stringify(shut);
		$.ajax({
			type:"post",
			url:theUrl,
			async:false,
			data:{"data":shutMsg},
			dataType:"json",
			success:function(res){
				if(res.result=="success"){
					for(var i=0;i<boardList[tempBoard].length;i++){
						boardList[tempBoard][i].state="off";
						createRelay();
					}
				}
			},
			error:function(){
				alert("链接失败!");
			}
		});
	})
	//全部开启
	$("#openAll").unbind("click").bind("click",function(){
		var open=new Object;
		open.command="relay";
		open.board=Number(tempBoard)+1;
		open.relay=26;
		open.onoff=1;
		var openMsg=JSON.stringify(open);
		$.ajax({
			type:"post",
			url:theUrl,
			async:false,
			data:{"data":openMsg},
			dataType:"json",
			success:function(res){
				if(res.result=="success"){
					for(var i=0;i<boardList[tempBoard].length;i++){
						boardList[tempBoard][i].state="on";
						createRelay();
					}
				}
			},
			error:function(){
				alert("链接失败!");
			}
		});
	})
	//刷新状态
	$("#refreshBtn").unbind("click").bind("click",function(){
		getMachineState(tempMachine);
	})
}

/*------------------- 创建继电器控制板 -------------------*/
function createBoard(){
	for(var i=0;i<boardList.length;i++){
		var $option=$("<option>继电器控制板"+(i+1)+"</option>");
		$option.attr("value",i);
		$("#boardSelect optgroup").append($option);
		$("#boardSelect").change(function(){
			relayInfo=boardList[Number($("#boardSelect option:checked").val())];
			tempBoard=Number($("#boardSelect option:checked").val())
			createRelay();
		})
	}
	tempBoard=0;
	relayInfo=boardList[0];
	createRelay();
}

/*------------------- 创建继电器开关 -------------------*/
function createRelay(){
	$("#relayUL").empty();
 	for(var i=0;i<relayInfo.length;i++){
 		var $li=$("<li class='list-group-item'></li>");
 		var $div1=$("<div class='controlLabel'><span>继电器</span><span id='"+i+"'>"+relayInfo[i].name+"</span></div>")
 		$li.append($div1);
 		var $div2,$div3;
 		if(relayInfo[i].state=="off"){
 			$div2=$("<div class='controlLabel'><span class='state' style='color:red'>已关闭</span></div>")
 			$div3=$("<div class='controlSwitch'><input type='checkbox' checked data-toggle='switch' name='default-switch' data-on-text='on' data-off-text='off' id='relay"+i+"' /></div>")
 		}
 		else{
 			$div2=$("<div class='controlLabel'><span class='state' style='color:green'>已开启</span></div>")
 			$div3=$("<div class='controlSwitch'><input type='checkbox' data-toggle='switch' name='default-switch' data-on-text='on' data-off-text='off' id='relay"+i+"' /></div>")
 		}
 		$li.append($div2);
 		$li.append($div3);
 		$div3.bind("click",function(e){
 			tempController=$(this);
 			var tempStr=($(this).parent().find("div:first-child").find("span:last-child").html());
 			var boardNum=tempStr.substr(0,2);
 			tempBoard=boardNum;
 			var relayNum=tempStr.substr(2,2);
 			tempRelay=relayNum;
 			//console.log(boardNum+":"+relayNum)
 			var sendObj=new Object;
 			sendObj.command='relay';
 			sendObj.board=Number(boardNum);
 			sendObj.relay=Number(relayNum);
 			if($(this).find("input").bootstrapSwitch("state")==false){
 				tempState="on";
 				sendObj.onoff="1";
 			}
 			else{
 				tempState="off";
 				sendObj.onoff="0";
 			}
 			var sendStr=JSON.stringify(sendObj);
 			$.ajax({
 				type:"post",
 				url:theUrl,
 				async:false,
 				dataType:"json",
 				data:{"data":sendStr},
 				timeout:5000,
 				success:function(res){
 					if(tempState=="on"){
 						tempController.parent().find('.state').html("已开启");
 						tempController.parent().find('.state').css("color","green");
 						boardList[tempBoard-1][tempRelay-1].state="on";
 					}
 					else{
 						tempController.parent().find('.state').html("已关闭");
 						tempController.parent().find('.state').css("color","red");
 						boardList[tempBoard-1][tempRelay-1].state="off";
 					}
 				},
 				error:function(){
 					alert("链接失败!");
 				}
 			});
 		})
 		$("#relayUL").append($li);
 		if ($('[data-toggle="switch"]').length) {
     		$('[data-toggle="switch"]').bootstrapSwitch();
    	}
 	}
}
/*------------------- 创建设备控制板 -------------------*/
function createMachine(){
	$("#machineBoard").empty();
 	for(var i=0;i<machineInfo.length;i++){
 		var $li=$("<li class='list-group-item'></li>");
 		var $div1=$("<div class='controlLabel'><span>设备</span><span id='"+i+"'>"+machineInfo[i].name+"</span></div>")
 		$li.append($div1);
 		var $div2,$div3;
 		if(machineInfo[i].state=="off"){
 			$div2=$("<div class='controlLabel'><span class='state' style='color:red'>已关闭</span></div>")
 			$div3=$("<div class='controlSwitch'><input type='checkbox' checked data-toggle='switch' name='default-switch' data-on-text='on' data-off-text='off' id='relay"+i+"' /></div>")
 		}
 		else{
 			$div2=$("<div class='controlLabel'><span class='state' style='color:green'>已开启</span></div>")
 			$div3=$("<div class='controlSwitch'><input type='checkbox' data-toggle='switch' name='default-switch' data-on-text='唤醒' data-off-text='关闭' id='relay"+i+"' /></div>")
 		}
 		$li.append($div2);
 		$li.append($div3);
 		$div3.bind("click",function(e){
 			tempController=$(this);
 			var tempStr=($(this).parent().find("div:first-child").find("span:last-child").html());
 			var sendObj=new Object;
 			sendObj.machine=tempStr;
 			if($(this).find("input").bootstrapSwitch("state")==false){
 				tempState="on"
 				sendObj.command="wakeup";
 			}
 			else{
 				tempState="off";
 				sendObj.command="shutdown";
 			}
 			var sendStr=JSON.stringify(sendObj);
 			$.ajax({
 				type:"post",
 				url:theUrl,
 				async:false,
 				dataType:"json",
 				data:{"data":sendStr},
 				timeout:5000,
 				success:function(res){
 					if(tempState=="on"){
 						tempController.parent().find('.state').html("已开启");
 						tempController.parent().find('.state').css("color","green");
 					}
 					else{
 						tempController.parent().find('.state').html("已关闭");
 						tempController.parent().find('.state').css("color","red");
 					}
 				},
 				error:function(){
 					alert("链接失败!");
 				}
 			});
 		})
 		$("#machineBoard").append($li);
 		if ($('[data-toggle="switch"]').length) {
     		$('[data-toggle="switch"]').bootstrapSwitch();
    	}
 	}
}

/*------------------- 创建设备状态 -------------------*/
function createState(){
	for(var i=0;i<machineInfo.length;i++){
		var $option=$("<option>"+machineInfo[i].name+"</option>");
		$option.attr("value",machineInfo[i].name);
		$("#machineSelect optgroup").append($option);
	}
	$("#machineSelect").change(function(){
		tempMachine=$("#machineSelect option:checked").val()
		getMachineState(tempMachine);
	})
	tempMachine=machineInfo[0].name
	getMachineState(tempMachine);
}

/*------------------- 获取设备状态 -------------------*/
function getMachineState(machimne){
	var send=new Object;
	send.command="getSys";
	send.machine=machimne;
	var str=JSON.stringify(send)
	$.ajax({
		type:"post",
		url:"http://192.168.1.113:12032",
		async:true,
		data:{"data":str},
		dataType:"json",
		timeout:5000,
		success:function(res){
			if(res.result=="success"){
				var regstr = res.data.replace(/\r\n/g,"<br />");
				regstr=regstr.replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
				$("#cpuInfo").html(regstr)
			}
			else{
				$("#cpuInfo").html(res.msg);
			}
		}
	});
}
