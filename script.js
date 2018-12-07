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

    user = $('#login_user').val();
    pass = $('#login_pass').val();

    console.log(user);
    console.log(pass);
    // alert("presssed");
    
    // ajax call to register a new user
  }); 
});

