$(document).ready(function() { 
	
	$("#submit").click(function(){

		var form_inputs = serialize_form();

		if(is_email(form_inputs.email)){
			$("#input").fadeOut('slow', function(){
				$("#output").fadeIn('slow');	
			});

			$.post('subscribe', 
				form_inputs, 
				function(data) {
					if(data.error){
						$("#output_message").addClass("error");
						$("#output_message").html(data.error);	
					} else{
						$("#output_message").html(data.output);	
					}
				}
			);
		} else{
			var $email = $("form #email");
			$email.attr("placeholder", "insert a valid email");	
			$email.val("");	
		}

		return false;
	});
});

function is_email(email) {
  var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function serialize_form(){

	var $inputs = $('form :input');

	var values = {};
    $inputs.each(function() {
        values[this.name] = $(this).val();
    });

    return values;
}