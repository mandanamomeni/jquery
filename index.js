var token;
var current_topic = 0;
var current_user = "";

function create_topic() {
   var topic_name = $("#new_topic").val();
   $.ajax({
       "type": "PUT",
       "url": "https://storage.hungarianrobot.hu/nextstepserver/forum/topics",
       "headers": {
           "Authorization": "Token " + token,
       },
       "data": {
           "name": topic_name
       },
       "success": function (server_data) {
           fill_topics();
           $("#new_topic").val("");
       }
   });
}

function show_topic(topic_id) {
   if (current_topic > 0) {
       $("#topic_span" + current_topic).css("background-color", "#ffffff");
       $("#topic" + current_topic).html("");
   }
   $.ajax({
       "type": "GET",
       "url": "https://storage.hungarianrobot.hu/nextstepserver/forum/topics/" + topic_id + "/entries",
       "headers": {
           "Authorization": "Token " + token,
       },
       "success": function (server_data) {
           // server_data is an array of objects each containing id, topic, entry_text, and username.
           var i;
           var render = "";
           render += 'New line: <input id="new_line" /><br />';
           render += '<a href="#" onClick="javascript:create_line();">Say</a><br />';
           for (i = 0; i < server_data.length; i++) {
               if (server_data[i].entry_text.startsWith("/me ")) {
                   render += "<b> " + "* " + current_user + " " + server_data[i].entry_text.substring(3) + "</b>" + "<br/>";
               } else {
                   if (server_data[i].username == current_user) {
                       render += "<b>" + server_data[i].username + "</b>";
                   } else {
                       render += server_data[i].username;
                   }
                   render += ": " + server_data[i].entry_text.replace(current_user, "<i>" + current_user + "</i>") + "<br/>";
               }
           }
           $("#topic" + topic_id).html(render);
           current_topic = topic_id;
           $("#topic_span" + topic_id).css("background-color", "#cccccc");
       }
   });
}

function create_line() {
   var new_line = $("#new_line").val();
   $.ajax({
       "type": "POST",
       "url": "https://storage.hungarianrobot.hu/nextstepserver/forum/topics/" + current_topic + "/entries",
       "headers": {
           "Authorization": "Token " + token,
       },
       "data": {
           "entry_text": new_line,
       },
       "success": function (server_data) {
           console.log(server_data);
           show_topic(current_topic);
       }
   });

}

function fill_topics() {
   $.ajax({
       "type": "GET",
       "url": "https://storage.hungarianrobot.hu/nextstepserver/forum/topics",
       "headers": {
           "Authorization": "Token " + token,
       },
       "success": function (server_data) {
           // an array of topics containing id and name.
           var render = "";
           var i;
           for (i = 0; i < server_data.length; i++) {
               render += "<span id='topic_span" + server_data[i].id + "'>";
               render += "<a href='#' onClick='javascript:show_topic(" + server_data[i].id + ");'>" + server_data[i].name + "</a>";
               render += "<div id='topic" + server_data[i].id + "'></div>";
               render += "<br/>";
               render += "</span>";
           }
           $("#topics").html(render);
       }

   });
}

function do_login() {
   var username = $("#login_username").val();
   var password = $("#login_password").val();
   $.ajax({
       "type": "GET",
       "url": "https://storage.hungarianrobot.hu/nextstepserver/forum/login",
       "data": {
           "username": username,
           "password": password,
       },
       "success": function (server_data) {
           token = server_data.token;
           alert("Login successful!");
           $("#before_login").hide();
           $("#after_login").show();
           fill_topics();
           current_user = username;
       }
   });

}

function register() {
   var username = $("#reg_username").val();
   var password = $("#reg_password1").val();
   var first_name = $("#reg_first_name").val();
   var last_name = $("#reg_last_name").val();
   $.ajax({
       "type": "POST",
       "url": "https://storage.hungarianrobot.hu/nextstepserver/forum/login",
       "data": {
           "username": username,
           "password": password,
           "first_name": first_name,
           "last_name": last_name,
       },
       "success": function (server_data) {
           if (server_data.result == "OK") {
               alert("Registration successful!");
           } else {
               alert("Registration failed, error: " + server_data.result);
           }
       }
   });
}

function check_passwords() {
   var password1 = $("#reg_password1").val();
   var password2 = $("#reg_password2").val();
   if (password1 == password2) {
       $("#check_result").html("OK!");
   } else {
       $("#check_result").html("Mismatch!");
   }
}

$(document).ready(function () {
   $("#after_login").hide();
   $("#reg_password1").on("keyup", check_passwords);
   $("#reg_password2").on("keyup", check_passwords);
});
