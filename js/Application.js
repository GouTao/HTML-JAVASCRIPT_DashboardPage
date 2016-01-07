$(document).ready(init);
function init(){
	if ($('[data-toggle="switch"]').length) {
      $('[data-toggle="switch"]').bootstrapSwitch();
    }
	$("select").select2({dropdownCssClass: 'dropdown-inverse'});
//	var send=new Object;
//	send.command="getSys";
//	send.machine="test";
//	var str=JSON.stringify(send)
//	$.ajax({
//		type:"post",
//		url:"http://192.168.1.113:12032",
//		async:true,
//		data:{"data":str},
//		dataType:"json",
//		success:function(res){
//			var regstr = res.data.replace(/\r\n/g,"<br />");
//			regstr=regstr.replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
//			$("#cpuInfo").html(regstr)
//		}
//	});
}
