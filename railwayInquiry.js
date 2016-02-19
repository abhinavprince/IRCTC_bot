var XMPP = require('stanza.io');
var http = require('http');

var suffix = "/apikey/taywi1536/";
var API_LINKS = {
  livetrain : "http://api.railwayapi.com/live/train/",
  pnr : "http://api.railwayapi.com/pnr_status/pnr/",
  seat_availability : "http://api.railwayapi.com/check_seat/train/",
  tranbtwn : "http://api.railwayapi.com/between/source/",
  nametonum : "http://api.railwayapi.com/name_number/train/"
}

var options = {
  host: "172.16.116.76",
  port: 3128,
  path: "",
  headers: {
          Host: "www.google.com"
        }
};

prev_input = "";

var client = XMPP.createClient({
    // Email - deploymentbotdrawers@gmail.com to get you username and password.
    jid: '3f537dec-4b4c-44b3-8af8-7c9b613b6a7e@ejabberd.sandwitch.in',
    password: '31e90675-e0fd-453d-9bda-05d5bbce9dd2',
    transport: 'websocket',
    wsURL: 'ws://ejabberd.sandwitch.in:5280/websocket'
});

// Bot logged in.
client.on('session:started', function () {
    client.getRoster();
    client.sendPresence();
    console.log("Session started");
});

//Respond when users sends message to bot
client.on('chat', function (msg) {
    
    console.log("Message received" + msg.from);
    var input = msg.body;

    var fuck = generateReply(input , function callr(output) {
    
    console.log("Final Output:" + output);
    client.sendMessage({
      to: msg.from,
      type: 'chat',
      requestReceipt: true,
      id: client.nextId(),
      body:  output,
      json: 
      {
         subType: 'TEXT', // subtype can be 'TEXT', 'IMAGE', 'VIDEO', 'CONTACT', 'LOCATION', 'FILE'.
         message: output,
         timestamp: Date.now()
      }
    });

   });
    
});



client.connect();

function generateReply(input , callback_end)
 {

      var output = "";

      //When an option is chosen
      if(input == "a" || input == "b" || input == "c" || input == "d") {

          prev_input = input;
          switch(input) {
            case "a":
              output = "Enter train name,station code and date of journey(yyyymmdd), space seperated.";
              break;
            
            case "b":
              output = "Enter PNR number.";
              break;
            
            case "c":
              output = "Enter train number,source station code, destination station code, date(dd-mm-yyyy),class,quota(GN,CK,etc.).";
              break;
            
            case "d":
              output = "Enter source station code, destination station code and date(dd-mm).";
               break;
            
          }

          callback_end(output);

      } else {

        switch(prev_input) {
            case "a":

              console.log("User Input:" + input);
              var a_user_input = input.split(/\s+/);
              var a_api_link = API_LINKS.livetrain;
              var a_partial_name = a_user_input[0];
              var a_code = a_user_input[1];
              var a_doj = a_user_input[2];
              var a_api_link_nametonum = API_LINKS.nametonum;
              a_api_link_nametonum = a_api_link_nametonum.concat(a_partial_name,suffix);
              var a_url = a_api_link_nametonum;
              options.path = a_api_link_nametonum;
              console.log("api_link_nametonum:" + a_api_link_nametonum);
              
              console.log("Variables Declared");

                function get_num(callu) {

                  console.log("Enter get_num");

                    http.get(options.path, function(res) {
                        var body = '';
                        res.on('data', function(chunk) {
                            body += chunk;
                        });

                        res.on('end', function() {
                            var response = JSON.parse(body);
                            
                            var num = response.train.number;
                            a_api_link = a_api_link.concat(num,"/doj/",a_doj,suffix);
                            options.path = a_api_link;
                            console.log(options.path);

                            if (response)
                                callu();
                        });
                    });
                }

                var a_x = get_num(function callback() {

                    
                    console.log("Receive data from get_num");

                    a_get_json(function call(resp) {
                      output = resp["station_"]["name"] + "\n"
                              + "Status: " + resp.status + "\n"
                              + "Scheduled Departure: " + resp.schdep;

                      callback_end(output);
                    });
                });


                function findStation (response,station_code) {

                    console.log("findStation Response:" + response);
                    console.log("Station Code:" + station_code);
                    for(var i in response.route ) {
                        
                        var j = response.route[i]["station"];
                            
                        if(j == station_code){
                            return i;
                        }
                    }
                    return false;
                        
                }

                function a_get_json(callback) {


                    console.log("Calling get_json");

                    http.get(options.path, function(res) {
                        var body = '';
                        res.on('data', function(chunk) {
                            body += chunk;
                        });
                        res.on('end', function() {
                            var response = JSON.parse(body);
                            console.log("get_json Response:" + response);

                            var station_code = a_code;

                            var z = findStation(response,station_code);

                            var station = response.route[z];

                            if (station)
                                callback(station);
                            else
                                callback("Station not found.\n");
                        });
                    });
                }


              break;
            
            case "b":
              
              var b_user_input = input.split(/\s+/);
              var b_pnr_number = b_user_input[0];
              options.path   = API_LINKS.pnr + b_pnr_number + suffix;

              function getPnrStatus(callback) {
                  http.get(options.path, function(res) {
                  var body = '';
                  res.on('data', function(chunk) {
                    body += chunk;
                  });

                  res.on('end', function() {
                    var response = JSON.parse(body);
                  
                     if (response)
                        callback(response);
                      else
                        callback("PNR not found.\n");
                   });
                  });
              }

              var b_mydata = getPnrStatus(function (resp) {
                  
                  console.log(resp);
                  output =  "Train Name: " + resp.train_name + "\n"
                           + "Date of Journey: " + resp.doj + "\n"
                           + "Total Passengers: " + resp.total_passengers + "\n"
                           + "Reservation to: " + resp.reservation_upto["name"] + "\n"
                           + "Class: " + resp.class + "\n"
                           + "Boarding Point: " + resp.boarding_point["name"] + "\n";

                           var passeng = resp.passengers;
                           for(pass in passeng) {

                              output += "Passenger No.: " + passeng[pass].no + "\n"
                                        + "Current Booking Status" + passeng[pass].current_status;
                           }
                           


                  callback_end(output);
              });

              break;

            case "c":

              var c_user_input    = input.split(/\s+/);
              var c_train_number  = c_user_input[0];
              var c_src           = c_user_input[1];
              var c_dest          = c_user_input[2];
              var c_date          = c_user_input[3];
              var c_CC            = c_user_input[4];
              var c_quota         = c_user_input[5];
              options.path      = API_LINKS.seat_availability.concat(c_train_number,"/source/",c_src,"/dest/",c_dest,"/date/",c_date,"/class/",c_CC,"/quota/",c_quota,suffix)


              function c_get_json(callback) {
                  http.get(options.path, function(res) {
                      var body = '';
                      res.on('data', function(chunk) {
                          body += chunk;
                      });

                      res.on('end', function() {
                          var response = JSON.parse(body);
                          
                           if (response)
                              callback(response);
                          else
                              callback("Seat Availability data not found.\n");
                      });
                  });
              }

              var c_mydata = c_get_json(function (resp) {
                  //console.log(resp);
                  output = "Train Name: " + resp.train_name + "\n";
                  //console.log(resp.availability);
                  var avial = resp.availability;
                  for(a in avial) {
                    
                    output += "Date: " + avial[a].date + "\n" 
                             + "Status: " + avial[a].status + "\n\n"
                  }
                  callback_end(output);
              });

              break;

            case "d":

              var d_user_input  = input.split(/\s+/);
              var d_source_code = d_user_input[0];
              var d_dest_code   = d_user_input[1];
              var d_date        = d_user_input[2];
              options.path    = API_LINKS.tranbtwn.concat(d_source_code,"/dest/",d_dest_code,"/date/",d_date,suffix);

              function d_get_json(callback) {
                  http.get(options.path, function(res) {
                      var body = '';
                      res.on('data', function(chunk) {
                          body += chunk;
                      });

                      res.on('end', function() {
                          var response = JSON.parse(body);
                          
                           if (response)
                              callback(response);
                          else
                              callback("Train b/w Stations data not found.\n");
                      });
                  });
              }

              var d_mydata = d_get_json(function (resp) {
                  
                  console.log(resp.train);

                  var trai = resp.train;
                  for(t in trai) {
                    console.log(t);
                    output += "Train Name: " + trai[t].name + "\n" 
                              + "Departure Time: " + trai[t].src_departure_time + "\n"
                              + "Arrival Time: " + trai[t].dest_arrival_time; 
                  }

                  callback_end(output);
              });

              break;
        
         prev_input = "";
      }

 }

}
