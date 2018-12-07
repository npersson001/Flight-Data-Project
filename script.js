var root_url = " http://comp426.cs.unc.edu:3001/api/";
var user;
var pass;

$(document).ready(() => {
	alert("script starting");

  $('#login_btn').on('click', () => {

		user = $('#login_user').val();
		pass = $('#login_pass').val();

		console.log(user);
		console.log(pass);
		// alert("presssed");
		
		// ajax call to login
  });  

  $('#register_btn').on('click', () => {
    alert("pressed register button");

    build_register_interface();

    user = $('#login_user').val();
    pass1 = $('#login_pass').val();
    pass2 = $('#login_pass').val();
    
    
    // ajax call to register a new user
  }); 
});

var build_register_interface = function () {
  let body = $('body');

  body.empty();
  body.append('<h1>Register New User</h1>' +
      '<div id="register_div">' +
      'New username: <input type="text" id="reg_user"><br>' +
      'New password: <input type="text" id="reg_pass"><br>' +
      'Confirm password: <input type="text" id="reg_conf"><br>' +
      '<button id="submit_registration_btn">Register</button>' + 
      '</div>');
}

