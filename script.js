var root_url = " http://comp426.cs.unc.edu:3001/";
var user;
var pass;

$(document).ready(() => {
  $(document).on('click', '#login_btn', () => {
		user = $('#login_user').val();
		pass = $('#login_pass').val();

		console.log(user);
		console.log(pass);

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

  $(document).on('click', '#register_btn', () => {
    build_register_interface();
  });

  $(document).on('click', '#submit_registration_btn', () => {

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

$(document).on('click', '.confirm_purchase_btn', () => {
  let button_clicked = $(document.activeElement);
  let instance_id = button_clicked.attr('id');

  $.ajax(root_url + 'instances/' + instance_id, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (instance) => {
      let fname = $('#purchase_fname').val();
      let lname = $('#purchase_lname').val();
      let age = $('#purchase_age').val();
      let gender = $('#purchase_gender').val();
      let number = parseInt($('#purchase_number').val());

      if (number <= 0){
        alert("cannot enter a number less than 1");
      }
      else if (number == 1){
        $.ajax(root_url + 'tickets', {
          type: 'POST',
          data: {
            "ticket": {
              "first_name":   fname,
              "last_name":    lname,
              "age":          age,
              "gender":       gender,
              "is_purchased": 1.0,
              "instance_id":  instance['id'],
              // "seat_id":      21
            }
          },
          xhrFields: {withCredentials: true},
          success: (response) => {
            let userInput = $("#userInput");
            userInput.empty();
            userInput.append('<section class="successful_section">Purchase Successful!</section>');
          }
        });
      }
      else {
        insert_itinerary(fname, lname, age, gender, number, instance['id']);
      }

    }
  });

});

$(document).on('click', '.purchase_btn', () => {
  let button_clicked = $(document.activeElement);
  let instance_id = button_clicked.attr('id');

  let outputDiv = $('#output_div');
  outputDiv.empty();

  let userInput = $("#userInput");
  let purchase_section = $('<section class="purchase_section"><div id="title_div"><h1>Customer Information</h1></div>' + 
      'First Name: <input type="text" id="purchase_fname"><br>' +
      'Last Name: <input type="text" id="purchase_lname"><br>' +
      'Age: <input type="text" id="purchase_age"><br>' +
      'Gender: <input type="text" id="purchase_gender"><br>' +
      'Number of Tickets: <input type="text" id="purchase_number"><br>' +
      '<br><button class="button confirm_purchase_btn" id="' + instance_id + '">Confirm Purchase</button><br><br>' +
      '</section>');
  userInput.append(purchase_section);
});

$(document).on('click', '#submit_flight_search_btn', () => {

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

// back button clicked from register
$(document).on('click', '#navbar-back-register', () => {
  build_login_interface();
});

// back button clicked from flight
$(document).on('click', '#navbar-back-flight', () => {
  build_flight_interface();
});

// logout button clicked, reset login page
$(document).on('click', '#navbar-logout', () => {
  build_login_interface();
});

// pull up more detailed information for specific flight
$(document).on('click', '.select_instance_btn', () => {
  let navbar = $('#navbar');
  navbar.empty();
  navbar.append('<input type="button" class="navbar-item button" value="Back" id="navbar-back-flight">');
  let button_clicked = $(document.activeElement);
  let instance_flight_id = button_clicked.parent().attr('id');
  let instance_id = instance_flight_id.split(":")[0];
  let flight_id = instance_flight_id.split(":")[1];
  let instance_date = instance_flight_id.split(":")[2];

  build_information_interface(instance_id, flight_id, instance_date);
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
					if (destination_airports.includes(flight['arrival_id'])){
            valid_flights.push(flight);
            find_all_instances(flight);
					}
				}
			}
		});
	}
	console.log(valid_flights); // just outputing flights to console for now
}

var build_register_interface = function () {
  let body = $('body');

  body.empty();
  let navbar = $('#navbar');
  navbar.empty();
  body.append('<nav id="navbar"><input type="button" class="navbar-item button" value="Back" id="navbar-back-register"></nav>');
  body.append('<section id = "login_info"><div id="title_div"><h1>Register New User</h1></div>' +
      '<div id="register_div">' +
      'Username: <input type="text" id="reg_user"><br>' +
      'Password: <input type="text" id="reg_pass"><br>' +
      'Confirm password: <input type="text" id="reg_conf"><br><br>' +
      '<button class="button" id="submit_registration_btn">Register</button>' +
      '<br><br></div></section>');
}

var build_login_interface = function () {
  let body = $('body');
  body.empty();
  body.append('<section id = "login_info"><div id="title_div">' +
      '<h1>Login</h1></div>' +
      '<div id="login_div">' +
      'Username: <input type="text" id="login_user"><br>' +
      'Password: <input type="text" id="login_pass"><br><br>' +
      '<button class="button" id="login_btn">Login</button>' +
      '<button class="button" id="register_btn">Register</button>' +
      '<br><br></div></section>');
}

var build_flight_interface = function () {
  let body = $('body');

  body.empty();
  body.append('<nav id="navbar"><input type="button" class="navbar-item button" value="Logout" id="navbar-logout"></nav>');
  body.append('<div id="main_div"></div>');

  let mainDiv = $("#main_div");
  let userInputDiv = $("<div id=\"userInput\"></div>");
  let outputDiv = $("<div id=\"output_div\"></div>");
  mainDiv.append(userInputDiv);
  mainDiv.append(outputDiv);

  let locationInputs = $("<section class = \"container\"></section>");

  locationInputs.append('<div id="title_div"><h1>Start Your Adventure Today!</h1></div>');

  locationInputs.append(`
    <div class = "location_area_div">
      <input class="location_area" cols="40" rows="1" placeholder="Type location here." id="location_str">
      <ul id = "location_input_box"></ul>
    </div>
   `
  );

  locationInputs.append(`
    <div class = "destionation_area_div">
      <input class="destination_area" cols="40" rows="1" placeholder="Type destination here." id="destination_str">
      <ul id = "destination_input_box"></ul>
    </div>
   `
  );

  locationInputs.append('<br><br><div class = "submit_search_button_div"><button id="submit_flight_search_btn">Search</button><br><br></div>');

  userInputDiv.append(locationInputs);

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
    source: airport_cities
  });

  $('#destination_str').autocomplete({
    source: airport_cities
  });
}

var update_output = function(valid_flights) {
  for(let k = 0; k < valid_flights.length; k++){
    alert(valid_flights[k]['number']);
  }
}

var set_arriving_airport = function(aid) {
  $.ajax(root_url + 'airports/' + aid, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (response) => {
      $("#arriving_airport").html(response['name']);
      initialize(response['latitude'], response['longitude']);
    }
  });
}

var set_departing_airport = function(aid){
  $.ajax(root_url + 'airports/' + aid, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (response) => {
      $("#departing_airport").html(response['name']);
    }
  });
}

var set_airline = function(air_id) {
  $.ajax(root_url + 'airlines/' + air_id, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (response) => {
      $('#airline').html(response['name']);
    }
  });
}

var map;
var initialize = function(input_lat, input_lng) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: parseInt(input_lat), lng: parseInt(input_lng)},
    zoom: 8
  });
}

var insert_itinerary = function(fname, lname, age, gender, number, instance_id){
  let info = lname+String(number);
  $.ajax(root_url + 'itineraries', {
    type: 'POST',
    data: {
      "itinerary": {
        "info": info,
      }
    },
    xhrFields: {withCredentials: true},
    success: (response) => {
      let itinerary_id = response['id'];
      for(let i = 0; i < number; i++){
        $.ajax(root_url + 'tickets', {
          type: 'POST',
          data: {
            "ticket": {
              "first_name":   fname,
              "last_name":    lname,
              "age":          age,
              "gender":       gender,
              "is_purchased": 1.0,
              "instance_id":  instance_id,
              "itinerary_id": itinerary_id
            }
          },
          xhrFields: {withCredentials: true},
          success: (response) => {
            let userInput = $("#userInput");
            userInput.empty();
            userInput.append('<section class="successful_section">Purchase Successful!</section>');
          }
        });
      }
    }
  });
}

var build_information_interface = function(instance_id, flight_id, instance_date) {

  $.ajax(root_url + 'flights?filter[number]=' + flight_id, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (flight) => {
      let userInput = $("#userInput");
      userInput.empty();
      let outputDiv = $("#output_div");
      outputDiv.empty();

      let flight_section = $('<section class="selected_flight_section"><div id="title_div"><h1>Flight Information</h1></div></section>');
      outputDiv.append(flight_section);
      let table_section = $("<table class=\"information_class\"></table>");
      flight_section.append(table_section);

      table_section.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "Flight number:" + "</td>"
          + "<td class=\"flight_value\">" + flight[0]['number'] + "</td></tr>");
      table_section.append("<tr class=\"\"><td>" + "Airline:" + "</td><td id=\"airline\"></td></tr>");
      table_section.append("<tr class=\"\"><td>" + "Date:" + "</td><td id=\"date\">" + instance_date + "</td></tr>");
      table_section.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "Departure time:" + "</td>"
          + "<td class=\"flight_value\">" + flight[0]['departs_at'] + "</td></tr>");
      table_section.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "Arrival time:" + "</td>"
          + "<td class=\"flight_value\">" + flight[0]['arrives_at'] + "</td></tr>");

      // new info to add with ajax calls
      table_section.append("<tr class=\"\"><td>" + "Departing airport:" + "</td><td id=\"departing_airport\"></td></tr>");
      table_section.append("<tr class=\"\"><td>" + "Arriving airport:" + "</td><td id=\"arriving_airport\"></td></tr>");

      flight_section.append('<br><button class="purchase_btn button" id="' + instance_id + '">Purchase Ticket</button><br><br>');

      outputDiv.append('<div id="map"></div>');

      let depart_id = flight[0]['departure_id'];
      let arrive_id = flight[0]['arrival_id'];
      let airline_id = flight[0]['airline_id'];

      set_departing_airport(depart_id);
      set_arriving_airport(arrive_id); // map call inside this function
      set_airline(airline_id);

    }
  });

}

var get_ticket_count = function(plane_id, instance_id, ticket_td, flightSection){ 

  $.ajax(root_url + 'seats?filter[plane_id]=' + plane_id, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (seats) => {
      calculate_ticket_count(plane_id, instance_id, ticket_td, flightSection, seats.length);
    }
  });
}

var calculate_ticket_count = function(plane_id, instance_id, ticket_td, flightSection, num_seats){
  $.ajax(root_url + 'tickets?filter[instance_id]=' + instance_id, {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (tickets) => {
      let tickets_sold = 0;
      for(let j = 0; j < tickets.length; j++){
        ticket = tickets[j];
        if(ticket['is_purchased']){
          tickets_sold++;
        }
      }
      let available_seats = num_seats - tickets_sold
      ticket_td.append(available_seats);
      if(available_seats  > 0){
        flightSection.append('<button class="select_instance_btn button">Select Flight</button>');
      }
    }
  });
}

var find_all_instances = function(flight){
  // finding all instances for that flight
  $.ajax(root_url + 'instances?filter[flight_id]=' + flight['id'], {
    type: 'GET',
    xhrFields: {withCredentials: true},
    success: (instances) => {
      let outputDiv = $("#output_div");
      for(let i = 0; i < instances.length; i++){
        instance = instances[i];
        if(!instance['is_canceled']){
          let flightSection = $("<section id=\"" + instance['id'] + ":" + flight['number'] + ":" + instance['date'] + "\" class=\"flight_section\"></section>");
          let tableSection = $("<table class=\"flight_class\"></table>");
          flightSection.append(tableSection);
          outputDiv.append(flightSection);
          tableSection.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "Date:" + "</td>"
              + "<td class=\"flight_value\">" + instance['date'] + "</td></tr>");
          tableSection.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "Departure time:" + "</td>"
              + "<td class=\"flight_value\">" + flight['departs_at'] + "</td></tr>");
          tableSection.append("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "Arrival time:" + "</td>"
              + "<td class=\"flight_value\">" + flight['arrives_at'] + "</td></tr>");
          let ticket_td = $("<td class=\"flight_value\"></td>");
          let ticket_tr = $("<tr class=\"flight_tr\"><td class=\"flight_key\">" + "Tickets available:" + "</td>"
              + "</tr>");
          ticket_tr.append(ticket_td);
          tableSection.append(ticket_tr);

          get_ticket_count(flight['plane_id'], instance['id'], ticket_td, flightSection);
        }
      }
    }
  });
}
