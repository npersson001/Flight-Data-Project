var root_url = " http://comp426.cs.unc.edu:3001/";
var user;
var pass;

$(document).ready(() => {
	alert("script starting");

  $(document).on('click', '#login_btn', () => {
    alert("attempting login");

		user = $('#login_user').val();
		pass = $('#login_pass').val();

		console.log(user);
		console.log(pass);
		// alert("presssed");
		
		$.ajax(root_url + 'sessions', {
      type: 'POST',
      dataType: 'json',
      // contentType: 'application/json',
      xhrFields: {withCredentials: true},
      data: {
        'user': {
          'username': user,
          'password': pass
        }
      },
      success: (response) => {
        build_flight_interface(); // consider returning to the login screen here
      },
      error: () => {
        alert('Login failed!');
      }
    });
  });  

  $('#register_btn').on('click', () => {
    alert("pressed register button");
    build_register_interface();
  }); 

  $(document).on('click', '#submit_registration_btn', () => {
    alert("pressing sumbitting registration button");

    // get user info from text boxes
    user = $('#reg_user').val();
    pass1 = $('#reg_pass').val();
    pass2 = $('#reg_conf').val();

    // make sure no empty strings and that the passwords match
    if(user == "" || pass1 == "" || pass2 == ""){
      alert("Must give input in all textboxes!");
    }
    else if(pass1 != pass2){
      alert("Passwords do not match, try again!")
    }
    // otherwise register the user, note that we dont check if the user already exists
    else{
      $.ajax(root_url + 'users', {
        type: 'POST',
        dataType: 'json',
        // xhrFields: {withCredentials: true},
        data: {
          'user': {
            'username': user,
            'password': pass
          }
        },
        success: (response) => {
          build_flight_interface(); // consider returning to the login screen here
        },
        error: () => {
          alert('Registering user failed!');
        }
      });
    }
  });

});

var build_register_interface = function () {
  let body = $('body');

  body.empty();
  body.append('<div id="title_div"><h1>Register New User</h1></div>' +
      '<div id="register_div">' +
      'Username: <input type="text" id="reg_user"><br>' +
      'Password: <input type="text" id="reg_pass"><br>' +
      'Confirm password: <input type="text" id="reg_conf"><br>' +
      '<button id="submit_registration_btn">Register</button>' + 
      '</div>');
}

var build_flight_interface = function () {
  alert("building flight interface");

  let body = $('body');

  body.empty();
  body.append('<div id="title_div"><h1>Flight Information</h1></div>' +
      '<div id="info_div"></div>');
}
