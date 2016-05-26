$(document).ready(function(){

	$("#forgotPasswordContent").hide();
	$("#resetPasswordDiv").hide();
	
	
	if($("#LoginMessageBox").html() !=undefined){
		$("#logintab").addClass("active");
		$("#signuptab").removeClass("active");
		$("#login").css("display","block");
		$("#signup").css("display","none");
		
	}
		
	  

	$('.form').find('input, textarea').on('focus blur', function (e) {

		var $this = $(this),
		label = $this.prev('label');

		if (e.type === 'focus') {
			label.addClass('active highlight');
		}
		else if (e.type === 'blur') {
			if( $this.val() === '' ) {
				label.removeClass('active highlight'); 
			} else {
				label.removeClass('highlight');   
			}   
		}
	});

	$('.tab a').on('click', function (e) {

		e.preventDefault();

		$(this).parent().addClass('active');
		$(this).parent().siblings().removeClass('active');

		target = $(this).attr('href');

		$('.tab-content > div').not(target).hide();

		$(target).fadeIn(600);

	});

	$("#confirmPassword,#password").change(function(){               //actual validation for password field
		if($("#password").val()!="")
		{
			if($("#pwdChkLength").hasClass("cross") ||
					$("#pwdChkAlpha").hasClass("cross") ||
					$("#pwdChkNum").hasClass("cross") ||
					$("#pwdChkSpl").hasClass("cross") ||
					$("#pwdChkSpc").hasClass("cross")){

				$("#passwordError").text("- All password conditions must be satisfied");
			}
			else{
				$("#passwordError").text('');
			}

		}

		if($("#confirmPassword").val()!="" && $("#password").val()!=$("#confirmPassword").val()){     //checking if pwd & confirm pwd are matching
			$("#confirmPasswordError").text("- Mismatch");
		}
		else{
			$("#confirmPasswordError").text('');
		}

	});

	$("#email").change(function(){       //first type password and then type email to see if email is again checking if it contains password
		if ($("#password").val()!="" && $("#email").val().indexOf($("#password").val())>-1){
			$("#pwdChkSpc").removeClass("tick").addClass("cross");
			$("#passwordError").text(" - All password conditions must be satisfied");

		}
		else{
			$("#pwdChkSpc").removeClass("cross").addClass("tick");
			$("#passwordError").text('');
		}

	});
	
	$("#phone").change(function(){      
		var phone = $("#phone").val();
	
		if (phone.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/))
		{
			$("#ContactError").text("");
		}
		else{
			console.log("eorror");
			$("#ContactError").text("-Invalid format : (xxx)-xxx-xxxx");
		}
	});
	

	$("#password").on('keyup',function(){                     //checking pwd on keyup for for changing tick n cross but not real validation
		var password = $("#password").val();
		if(password!=""){
			if(password.length > 7 && password.length < 20)
				$("#pwdChkLength").removeClass("cross").addClass("tick");
			else
				$("#pwdChkLength").removeClass("tick").addClass("cross");

			if (password.replace(/[^A-Za-z]/g, "").length > 3 && password.replace(/[^A-Z]/g, "").length > 0)
				$("#pwdChkAlpha").removeClass("cross").addClass("tick");
			else
				$("#pwdChkAlpha").removeClass("tick").addClass("cross");

			if (password.match(/\d+/)) 
				$("#pwdChkNum").removeClass("cross").addClass("tick");
			else
				$("#pwdChkNum").removeClass("tick").addClass("cross");

			if (password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/))
				$("#pwdChkSpl").removeClass("cross").addClass("tick");
			else
				$("#pwdChkSpl").removeClass("tick").addClass("cross");

			if ($("#email").val().indexOf(password)<0 && password.indexOf(' ')<0)
				$("#pwdChkSpc").removeClass("cross").addClass("tick");
			else
				$("#pwdChkSpc").removeClass("tick").addClass("cross");
		}
		else
		{
			$("#pwdChkLength").removeClass("tick").addClass("cross");
			$("#pwdChkAlpha").removeClass("tick").addClass("cross");
			$("#pwdChkNum").removeClass("tick").addClass("cross");
			$("#pwdChkSpl").removeClass("tick").addClass("cross");
			$("#pwdChkSpc").removeClass("tick").addClass("cross");
		}
	});

	$("#dob").change(function(){
		if(getAge($("#dob").val()) < 18) {
			$("#dobError").text("- You must be 18 years or older</span>");
		} 
		else
			$("#dobError").text('');
	});
});


function register(){
	if($("#dobError").text()=='' && $("#confirmPasswordError").text()=='' && $("#passwordError").text()=='' && $("#ContactNumber").text()=='')
	{
		$("#registerButton").attr("disabled","disabled");
		return true;
	}
	else{
		alert("Error in your form!!!");
		return false;
	}

}


function getAge(birthDateString) {
	var today = new Date();
	var birthDate = new Date(birthDateString);
	var age = today.getFullYear() - birthDate.getFullYear();
	var m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}

function forgotPassword()
{
	$("#resetEmail").val('');
	$('.slide').slideUp().eq($(this).index()).stop().slideToggle();
}
function backToLogin()
{
	$("#loginPassword").val('');
	$("#loginEmail").val('');
	$('.slide').slideDown().eq($(this).index()).stop().slideToggle();
}

function resetPassword(){
	$("#resetEmailError").text('');
	var email =  $("#resetEmail").val();
	if(email!=""){
		if(isValidEmail(email)){
			$("#resetPasswordButton").attr("disabled","disabled");
			$.post( "/emailTempPassword",{email:email}, function(data ) {
				if(data=="OK"){
					$("#resetPasswordDiv").html("<h1>You got a mail !!</h1><h3>Check your "+email+". We have sent you an email with instruction on how to reset your password.</h3>");
					$("#resetPasswordDiv").show();
					setTimeout(function() {
						$("#resetPasswordDiv").hide();
						$("#resetPasswordButton").removeAttr("disabled","disabled");
					}, 5000);
					$("#resetEmail").val('');
				}
				else{
					$("#resetPasswordDiv").html("<h1>Couldn't Send Temporary password !!</h1><h3>Error in Sending Email. Please  provide a valid email address</h3>");
					$("#resetPasswordDiv").show();
					setTimeout(function() {
						$("#resetPasswordDiv").hide();
						$("#resetPasswordButton").removeAttr("disabled","disabled");
					}, 5000);
					$("#resetEmail").val('');
				}
			});
		}else{
			$("#resetEmailError").text(' - Not a valid email id');
		}
	}
	else
	{
		$("#resetEmailError").text(" - Mandatory");
	}


}

function isValidEmail(email)
{
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return re.test(email);
}


function togglePasswordRulePopUp() {
	$("#passwordRuleDiv").toggle();
}

function togglePasswordRulePopUp() {
	$("#passwordRuleDiv").toggle();
}
