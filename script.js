var root_url = " http://comp426.cs.unc.edu:3001/";
var user;
var pass;

$(document).ready(() => {
	//alert("script starting");

  $(document).on('click', '#login_btn', () => {
    alert("attempting login");

		user = $('#login_user').val();
		pass = $('#login_pass').val();

		console.log(user);
		console.log(pass);
		alert("presssed");

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

$(document).on('click', '#submit_flight_search_btn', () => {
	alert("pressing sumbitting flight search button");

	// get location info from text boxes
	user_location_input = $('#location_str').val().toLowerCase().trim();
	user_destination_input = $('#destination_str').val().toLowerCase().trim();

	// for now, will assume locations will be exact city names
	// we can discuss how exactly we want to handle this

	// make sure no empty strings
	if(user_location_input == "" || user_destination_input == "" ){
		alert("Must give input in all textboxes!");
	}
	// otherwise register the user, note that we dont check if the user already exists
	else{
		$.ajax(root_url + 'airports', {
			type: 'GET',
			xhrFields: {withCredentials: true},
			success: (response) => {
				get_flights(user_location_input, user_destination_input, response);
			}
		});
	}
});

function get_flights(user_location, user_destination, airports){
	let location_airports = [];
	let destination_airports = [];
	let valid_flights = [];

  let outputDiv = $("#output_div");
  outputDiv.empty();

	// finding airports in location and destination cities
	for (let i = 0; i < airports.length; i++){
		airport = airports[i];
		if (airport['city'].toLowerCase() == user_location){
			location_airports.push(airport['id']);
		}
		if (airport['city'].toLowerCase() == user_destination){
			destination_airports.push(airport['id']);
		}
	}

	// finding flights one location at a time
	for (let i = 0; i < location_airports.length; i++){
		location_airport = location_airports[i];

		// finding flights that match each location

		$.ajax(root_url + 'flights?filter[departure_id]=' + location_airport, {
			type: 'GET',
			xhrFields: {withCredentials: true},
			success: (flights) => {
				// for each flight that matches the location id, find the flights that end one of the airports in the desination city
				for (let j = 0; j < flights.length; j++){
					flight = flights[j];
          let available_ticket_count =  get_ticket_count(flight['id'], flight['plane_id']);
					if (destination_airports.includes(flight['arrival_id'])){
						valid_flights.push(flight);
            let flightSection = $("<section class=\"flight_section\"><table class=\"flight_table\"></table></section>");
            outputDiv.append(flightSection);
            flightSection.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "flight number:" + "</td>"
                + "<td class=\"flight_value\">" + flight['number'] + "</td></tr>");
            flightSection.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "departure time:" + "</td>"
                + "<td class=\"flight_value\">" + flight['departs_at'] + "</td></tr>");
            flightSection.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "arrival time:" + "</td>"
                + "<td class=\"flight_value\">" + flight['arrives_at'] + "</td></tr>");
            flightSection.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "tickets available:" + "</td>"
                + "<td class=\"flight_value\">" + available_ticket_count + "</td></tr>");
					}
				}
			}
		});
	}
	console.log(valid_flights); // just outputing flights to console for now
}

function get_ticket_count(flight_id, plane_id){ // this method doesn't work


  let flight_seat_count = 0;
  let tickets_sold = 0;

  $.ajax(root_url + 'seats?filter[plane_id]=' + plane_id, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    async: false,
    success: (seats) => {
      flight_seat_count = seats.length;
      console.log('number of seats after ajax call: ' + flight_seat_count);

    }
  });
  console.log('number of seats: ' + flight_seat_count); // not the same as the one above

  $.ajax(root_url + 'instances?filter[flight_id]=' + flight_id, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    async: false,
    success: (instances) => {
      for(let i = 0; i < instances.length; i++){
        instance = instances[i];
        if(!instance['is_canceled']){
          $.ajax(root_url + 'tickets?filter[instance_id]=' + instance['id'], {
            type: 'GET',
            xhrFields: {withCredentials: true},
            async: false,
            success: (tickets) => {
              for(let j = 0; j < tickets.length; j++){
                ticket = tickets[j];
                if(ticket['is_purchased']){
                  tickets_sold++;
                }
              }
            }
          });
        }
      }
    }
  });


  return(flight_seat_count - tickets_sold);

}


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
      '<div id="main_div"></div>');

  let mainDiv = $("#main_div");
  let userInputDiv = $("<div id=\"userInput\"></div>");
  let outputDiv = $("<div id=\"output_div\"></div>");
  mainDiv.append(userInputDiv);
  mainDiv.append(outputDiv);

  userInputDiv.append(`
    <div>
      <input class="location_area" cols="40" rows="1" placeholder="Type location here." id="location_str">
      <ul id = "location_input_box"></ul>
    </div>
   `
  );

  userInputDiv.append(`
    <div>
      <input class="destination_area" cols="40" rows="1" placeholder="Type destination here." id="destination_str">
      <ul id = "destination_input_box"></ul>
    </div>
   `
  );

	userInputDiv.append('<button id="submit_flight_search_btn">Search</button>');

  let airport_cities = [];

  $.ajax(root_url + 'airports', {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (response) => {
      for (let i = 0; i < response.length; i++){
        airport = response[i];
        if(!airport_cities.includes(airport['city'])){
          airport_cities.push(airport['city']);
        }
      }
    }
  });

  $('#location_str').autocomplete({
    source: airport_cities,
    appendTo: "#location_input_box"
  });

  $('#destination_str').autocomplete({
    source: airport_cities,
    appendTo: "#destination_input_box"
  });
}

var update_output = function(valid_flights) {
  for(let k = 0; k < valid_flights.length; k++){
    alert(valid_flights[k]['number']);
  }
}
