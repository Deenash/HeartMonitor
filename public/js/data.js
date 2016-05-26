/**
 * http://usejsdoc.org/
 */

var dataRequest ;

$(document).ready(function() {

	var table = $('#myTable').DataTable({
		"order" : [ [ 0, "desc" ] ],
		scrollY:        '55vh',
		scrollCollapse: true,
		"createdRow": function ( row, data, index ) {
			$(row).hover(
					function() {
						$(this).children('td').attr("style","background-color:#e0e0e0").css('cursor','pointer');
					}, function() {
						$(this).children('td').removeAttr("style");
					}).children('td').click(function(){
						//var divId = 'msgDiv'+$(this).parent('tr').attr('id');
						$(".overlay").show();
						$("#content").addClass("blur");
//						var msgContent=$("#"+divId).html();
//						$(".popupMessageDiv #msgContent").html(msgContent);
//						var regchart = $('#heartbeat').highcharts();
//						var regData = []
//						for(var i=0;i<25;i++)
//							{
//								regData.push((Math.random() * (160 - 100) + 100));
//							}
//						regchart.series[1].data=regData;
						$("#chartHeader").html("<h4>RECORDED HEART RATE FOR THE USER: UID00"+$(this).parent('tr').attr('pid')+"</h4>");
						$(".popupMessageDiv").show();	
						var chart = $('#heartbeat').highcharts();
						var str = "Live Heart Rate of "+$(this).parent('tr').attr('pid');
						chart.setTitle(str);
						//alert("this will render another page")
					});
			$(row).height("50px");
		}
	});

	dataRequest = function(){$.get( "/dataPage/getdata" )
		.done(function(data){
			$.each(data, function(i, item) {
				var rowId="rowId"+i;
				var row = $("<tr/>").attr("id",rowId).attr("pid",item.u_id).attr("pname",item.u_lname+","+item.u_fname);
				var divId = "msgDiv"+item.u_id;
	
				console.log(item);
				$("#tableData").append(row);
				row.append($("<td>UID00"+item.u_id+ "</td>"));
				row.append($("<td>" + item.u_fname +","+item.u_lname +"</td>"));
				row.append($("<td>" + item.u_history + "</td>"));
				row.append($("<td>" + item.u_phone + "</td>"));
				row.append($("<div id="+divId+" style='display:none'></div>"));
				table.row.add($(row)[0]);
	
			});
			table.draw();
		})
		.fail(function(err){
			console.log(err);
		});
	
		table.draw();
	};
	
	dataRequest();

	 $('#heartbeat').highcharts({
   		 chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
            },
        title: {
                text: 'Live Heart data of Varna Premraj'
            },
       xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
         yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
        series: [{
            data: [70,72,73,71,68,67,72,76,72]
        }]
    });

	 setInterval(function(){
	        var chart = $('#heartbeat').highcharts();
	        var x = (Math.random() * (83 - 79) + 79);
	        chart.series[0].addPoint(x, true, true);
	        
	     }, 15000);
	 

	var chart = $('#heartcontainer').highcharts({
        xAxis: {
            min: 1,
            max: 25
        },
        yAxis: {
            min: 30,
            max: 190
        },
        title: {
            text: 'Heart Rate with regression line for User'
        },
        series: [{
            type: 'line',
            name: 'Regression Line',
            data: [[1, 148], [25, 170]],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'scatter',
            name: 'Heart Rate Sample',
            data: [98, 123, 125, 136, 95, 100, 120, 132, 115, 136, 135, 143, 144, 149, 168, 155, 154, 156, 160, 143, 146, 155, 151, 152, 148],
            marker: {
                radius: 4
            }
        }]
    });
	
	
});


function closeMsgPopDiv()
{
	$(".popupMessageDiv").hide();
	
	$(".overlay").hide();
	$("#content").removeClass("blur");
}


//change password


function changePassword(){
	$(".overlay").show();
	$("#content").addClass("blur");
	$(".changePasswordDiv").show();
}

function saveChangePassword()
{
	$("#chgPwdSubmit").attr("disabled","disabled");
	var newpassword = $("#newPassword").val();
	var confirmPassword = $("#confirmPassword").val();
	var pwdCheck = checkPassword();
	if(pwdCheck ){
		if(newpassword==confirmPassword){
			$.post( "/changePassword",{newpassword:newpassword}, function(data ) {
				if(data=="OK"){
					alert("password has been changed");
					$("#newPassword").val('');
					$("#confirmPassword").val('');
					closeCPMsgPopDiv();
				}
				else{
					alert("password could not be changed");
					$("#newPassword").val('');
					$("#confirmPassword").val('');
					$("#chgPwdSubmit").removeAttr("disabled");
				}
			});
		}else{
			$("#chgPwdSubmit").removeAttr("disabled");
			alert("New Password and Confirm Password didn't match!!");
		}
	}
	else{	
		$("#chgPwdSubmit").removeAttr("disabled");
		alert("New Password must satisfy given conditions!!!");
	}
}
function checkPassword(){
	var newpwd = $("#newPassword").val()
	if(newpwd.length>7 && newpwd.length<21 
			&& newpwd.replace(/[^A-Za-z]/g, "").length > 3 && newpwd.replace(/[^A-Z]/g, "").length > 0
			&& password.match(/\d+/)
			&& password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/))
		return true;
	else
		return false;
}



function closeCPMsgPopDiv()
{
	$(".changePasswordDiv").hide();
	$(".overlay").hide();
	$("#content").removeClass("blur");
}


//adding patient


function showAddPatient(){
	$(".overlay").show();
	$("#content").addClass("blur");
	$(".addPatientDiv").show();
}

function closeAddPatientPopDiv()
{
	$(".addPatientDiv").hide();
	$(".overlay").hide();
	$("#content").removeClass("blur");
}

function addPatient(){

	var inputData = {
			u_fname : $("#fname").val(),
			u_lname :  $("#lname").val(),
			//u_dob : 27
			u_history :  $("#mhistory").val(),
			u_phone :  $("#phone").val(),
			u_email :  $("#email").val(),
			u_emergency_phone :  $("#emergencyPhone").val(),
			u_emergency_name :  $("#emergencyName").val(),
	}
	$("#addPatSubmit").attr("disabled","disabled");
	$("#addPatClose").attr("disabled","disabled");

	$.post( "/dataPage/addPatient",inputData, function(data ) {
		if(data=="OK"){
			$("#addPatientMsg").text('Patient added Successfully');
			$("#fname").val('');
			$("#lname").val('');
			$("#mhistory").val('');
			$("#phone").val('');
			$("#email").val('');
			$("#emergencyPhone").val('');
			$("#emergencyName").val('');
			$("#dob").val('');
			dataRequest();
		}
		else{
			$("#addPatientMsg").text(data);
		}
		$("#addPatSubmit").removeAttr("disabled");
		$("#addPatClose").removeAttr("disabled");
	});

	return true;
}
