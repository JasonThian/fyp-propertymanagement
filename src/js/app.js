import $$ from 'dom7';
import Framework7 from 'framework7/framework7.esm.bundle.js';

// Import F7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.less';
// Import Cordova APIs
import cordovaApp from './cordova-app.js';
//import FCMPluginNG from 'cordova-plugin-fcm-ng';
// Import Routes
import routes from './routes.js';

//Import Firebase functions

// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";
//import "firebase/messaging";

//Add Firebase configs
//import fb from './firebase.js'

// Import main app component
import App from '../app.f7.html';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is  optional
var firebaseConfig = {
	apiKey: "AIzaSyA57cBRSvRm3U-9mi5aHRts3Z15LslfkPo",
	authDomain: "propertymanagement-88d03.firebaseapp.com",
	databaseURL: "https://propertymanagement-  88d03.firebaseio.com",
	projectId: "propertymanagement-88d03",
	storageBucket: "propertymanagement-88d03.appspot.com",
	messagingSenderId: "429741658289",
	appId: "1:429741658289:web:4d2f4f490fac045e8e5290",
	measurementId: "G-6PBDHNV9RS"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
			
//make auth and firestore references
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();
const storage = firebase.storage();
//const messaging = firebase.messaging();

//console.log("Initializing auth script");
//f7 variables

window.app = new Framework7({
  root: '#app', // App root element
  component: App, // App main component
  id: 'app.framework7.propertymanagement', // App bundle ID
  name: 'd\'Ryx Residence', // App name
  theme: 'auto', // Automatic theme detection,
  calendar: {
    url: 'calendar/',
  },
  data: {
    calendar: function () {
      
    },
    start: function () {
      alert("start");
    },
	close_panel: function(){
		app.panel.close('right');
	},
	toast_center: function(el){
		app.toast.create({
			text: el,
			position: center,
			closeTimeout: 2000,
		});
	},
	online_payment: function(){
		online_payment_function();
	},
	credit_payment: function(){
		credit_payment_function();
	},
	createQrCode: function(){
		createQrCode();
	},
	SelectAnnc: function(id){
		SelectAnnc(id);
	},
	getPayment: function(){
		getUserBilling();
	},
	paymentMethodData: function(){
		getUserBillingPaymentMethod();
	}
  },
  // App routes
  routes: routes,

  // Register service worker
  serviceWorker: Framework7.device.cordova ? {} : {
    path: '/service-worker.js',
  },
  // Input settings
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  on: {
    init: function () {
      var f7 = this;
      if (f7.device.cordova) {
        // Init cordova APIs (see cordova-app.js)
		
        cordovaApp.init(f7);
      }
	  init_script();
    },
  },
});



function set_logout(){
	var logout = document.getElementById('logout');
	logout.addEventListener("click", function(e){
		e.preventDefault();
		auth.signOut().then(() => {
			console.log("user signed out");
			
			var mainView = app.view.main;
			mainView.router.navigate({ name: 'login'});
		});
	})
}

/* Initialize */
async function init_script(){
	/*import jquery and Stripe js */
	var jquery = document.createElement('script');
	var stripe_payment = document.createElement('script');
	set_logout();
	
	jquery.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
	document.head.appendChild(jquery);
	
	stripe_payment.src = "https://js.stripe.com/v3/";
	document.head.appendChild(stripe_payment);
	
	/* SSL Pinning */
	/*try{
		var cordovaHTTP = cordova.plugin.http;
		cordovaHTTP.enableSSLPinning(true, function() {
			console.log('success!');
		}, function() {
			console.log('error :(');
		});
	}catch(err){
		throw err;
	}*/
	
	
	/* Check User Login */
	auth.onAuthStateChanged(async user => {

		var mainView = app.view.main;
		console.log("user logged in");
		if (user) {
			var uid = user.uid;
			set_changepassword();
			
			
			//set announcements
			let querySnapshot = await db.collection("announcement").orderBy("date", "desc").limit(2).get();
			var annc_img = document.getElementsByClassName('announcement-img');
			var annc = 0; 
			querySnapshot.forEach(async (doc) => {
				var imageurl = doc.data().imageurl;
				
				var pathReference = storage.ref("announcement/"+imageurl);
				
				console.log(imageurl);
				let url = await pathReference.getDownloadURL();

				annc_img[annc].src = url;
				
				annc++; 
			});
			
			
			mainView.router.navigate({ name: 'home'});
			homesetup();

			try{
				FCMPlugin.getToken(function(token){
					console.log(token);
				});
				FCMPlugin.subscribeToTopic('announcement');
				
				FCMPlugin.onNotification(function(data){
					
					var notificationFull = app.notification.create({
						icon: '<img src='+data.image+'></img>',
						title: '<b>'+data.title.toUpperCase()+'</b>',
						text: data.body,
						closeTimeout: 3000,
					});
					notificationFull.open();
					
					
					if(data.wasTapped){
						//Notification was received on device tray and tapped by the user.
						console.log( JSON.stringify(data) );
						console.log( "Background notification" );
					}else{
						//Notification was received in foreground. Maybe the user needs to be notified.
						console.log( JSON.stringify(data) );
						console.log( "Foreground notification" );
					}
				});
				
			}catch(err){
				console.log(err);
			}
			
	
			
		}else{
			mainView.router.navigate({ name: 'login'});
		}
	});
	
	/* Get Stripe PaymentIntent */
	try{
		let paymentIntent = parseURLParams(window.location.href);
		if(paymentIntent != undefined){
			console.log("PaymentIntent",paymentIntent);
			if(paymentIntent.redirect_status[0] == "succeeded"){
				/* Display Payment Success Page */
				timed_toast("Payment Succeesful!","center");
			}
			else{
				/* Disply Payment Failed Page */
				
			}
		}
		else
			console.log("Should be undefined",paymentIntent);
	}catch(err){
		console.log(err);
	}
	
	/* Customize Android/iOS hardware back button */
	/* Not Functioning */

	var count = 0;
	document.addEventListener("backbutton", function(e){
		e.preventDefault();
		count++;
		var toast = app.toast.create({
			text: 'Click back button again to exit',
			closeTimeout: 2000,
			position: "center"
		});
		toast.open();
		if(count == 2){
			window.navigator.app.exitApp();
		}
		setTimeout(()=>{
			count = 0;
		},2100);
	}, false);
}

/* Get data from URL - GET Method - All data in Array */
function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

//page handler
$$(document).on('page:init', async function (e, page) {
  var pn = page.name;
	console.log(pn+" Entered");
	
	if(pn == "login"){
		set_login();
	}else if(pn == "home"){
		homesetup();
	}else if(pn == "news"){
		getAnnouncement();
	}else if(pn == "booking_details"){
		getBookingDetails();
	}else if(pn == "payment_history"){
		getPaymentHistory();
	}else if(pn == "payment_reminder"){
		getPaymentReminder();
	}else if(pn == "bookfacility"){
		getFacility();
	}else if(pn == "facilities"){
		set_booking();
	}else if(pn == "tenant_list"){
		getTenants();
	}else if(pn == "edit"){
		getEditPage();
	}
})


//subscribe to topic
function subscribe(token,topic){
	
	$.ajax('https://iid.googleapis.com/iid/v1/'+token+'/rel/topics/'+topic, {
		method: 'POST',
		headers: new Headers({
		'Authorization': 'key='+fcm_server_key
		})
	}).then(response => {
		if (response.status < 200 || response.status >= 400) {
			throw 'Error subscribing to topic: '+response.status + ' - ' + response.text();
		}
		console.log('Subscribed to "'+topic+'"');
	}).catch(error => {
		console.error(error);
	})
}
///////////// HOME SETUP
function homesetup(){
	var uid = auth.currentUser.uid;
	//fields
	var username = document.getElementById("username");
	var user_pic = document.getElementById("user_pic");
	var user_icon = document.getElementById("user_icon");
	console.log(user_icon);

	db.collection('landlord').doc(uid).onSnapshot((doc) => {
				
		var name = doc.data().name;
		var imageurl = doc.data().imageurl;
			
		username.innerHTML = name;
				
		var pathReference = storage.ref(imageurl);
					
		pathReference.getDownloadURL().then(function(url) {
			//console.log(url);
			user_icon.src = url;
			user_pic.src = url;
					
					
		}).catch(function(error) {
			console.log(error);
		});
	})
}
//////// EDIT PAGE
function getEditPage(){
	var user_id = auth.currentUser.uid;
	var docRef = db.collection("landlord").doc(user_id);
	
	//image url
	var blob = "";
	
	//fields
	var edit_username = document.getElementById("edit_username");
	var edit_email = document.getElementById("edit_email");
	var edit_pno = document.getElementById("edit_pno");
	var edit_gender = document.getElementById("edit_gender");
	var edit_unit = document.getElementById("edit_unit");
	var edit_image = document.getElementById("edit_image");
	var change_photo = document.getElementById("change_photo");
	var update_photo = document.getElementById("update_photo");
	var close_img_popup = document.getElementById("close_img_popup");
	
	docRef.get().then(function(doc) {
		var name = doc.data().name;
		var email = doc.data().email;
		var pno = doc.data().contact;
		var gender = doc.data().gender;
		var units = doc.data().unit;
		var imageurl = doc.data().imageurl;
		
		edit_username.placeholder = name;
		edit_email.placeholder = email;
		edit_pno.placeholder = pno;
		edit_gender.placeholder = gender;
		edit_unit.placeholder = units;
		
		var pathReference = storage.ref(imageurl);
		pathReference.getDownloadURL().then(function(url) {
			
			edit_image.src = url;	
			
		}).catch(function(error) {
			console.log(error);
		});
	})

	$("#imgInp").change(function() {
		blob = readURL(this);
		//console.log(blob);
	});
	
	
	update_photo.addEventListener('submit', function(e){
		e.preventDefault();
		var announceref = storage.ref().child(user_id+".png");
			
		announceref.put(blob).then(function(snapshot) {
			console.log('Updated user image');
			close_img_popup.click();
			redirect("home");
			toast("successfully updated photo");
		}).catch(err => {
			console.log('err: '+err);
			toast("failed to update photo");
		});
			
	})
}

/* Toast with Close Button */
function toast(msg){
	var toastWithButton = app.toast.create({
        text: msg,
        closeButton: true,
    });
	
	toastWithButton.open();
}

/* Toast without Close Button - pos: top, center, bottom */
function timed_toast(msg,pos){
	var normal_toast = app.toast.create({
        text: msg,
		closeTimeout: 2000,
		position: pos,
    });
	
	normal_toast.open();
}

function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		var blob = input.files[0];
		reader.onload = function(e) {
			$('#blah').attr('src', e.target.result);
		}
	
		reader.readAsDataURL(input.files[0]); // convert to base64 string
	}
	
	return blob;
}

//tenant lists
async function getTenants(){
	let querySnapshot = await db.collection("landlord").get();
	var tenant_list = document.getElementById('tenant_list');
	var user_id = auth.currentUser.uid;
	
	querySnapshot.forEach((doc) => {
		var type = doc.data().landlords;
		var name = doc.data().name;
		
		if(type == user_id){
			tenant_list.innerHTML = `<div class="card">
        <div class="card-content2 card-content-padding">${name}</div>
      </div>`;
		}
	})
}

//changepassword
function set_changepassword(){
	//ChangePassword
	var change_pass = document.getElementById('changePassword');
	change_pass.addEventListener('click', function(e){
		var cfm_pass = document.getElementById('cnPassword').value.trim();
		var old_pass = document.getElementById('cPassword').value;
		var new_pass = document.getElementById('nPassword').value.trim();
		
		if(cfm_pass == new_pass){
			var user = firebase.auth().currentUser;
			const credential = firebase.auth.EmailAuthProvider.credential(
				user.email, 
				old_pass
			);
			
			// Now you can use that to reauthenticate
			user.reauthenticateWithCredential(credential).then(promise =>{
				user.updatePassword(new_pass).then(function() {
					alert("Password update successful");
				}).catch(function(error) {
					alert("An error has occured");
				});
				
			}).catch(err => {
				alert(err.message);
			});
		}		
	});
}

//anouncement var
var annc_selected;

//login
function set_login(){
	
	var sign_in = document.getElementById("sign_in");
	var login_err = document.getElementById("login_err");
		
	sign_in.addEventListener("click",async function(e){
		var login_username = document.getElementById("login_username").value;
		var login_password = document.getElementById("login_password").value;
		
		auth.signInWithEmailAndPassword(login_username, login_password).then((cred) => {
			console.log("user logged in");
		}).catch(err => {
			console.log(err.message);
			login_err.innerHTML = err.message;
			
		});
	});
}

//////////////BOOKING FEATURE
var facility_chosen = ""
//booking variables
var booking_list = {
	"AV_Room": {},
	"Sauna": {},
	"PingPong": {},
	"BBQ": {},
	"SkyLounge": {} 
	};
 var calendarEvents = "";
 var DEFAULT_LIMIT = 3;
 const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

//initialize calendar
function calendar_init(){
	if(calendarEvents != ""){
		console.log("calendar destroyed");
		calendarEvents.destroy();
	}
	
	//get today
	var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	
	//initialize var for checking disabled dates
	var disabledDates = [];
	console.log(facility_chosen);
	var booked_dates = booking_list[facility_chosen];
	console.log(booked_dates);
	
	//initialize var for time slots
	var time_slots = document.getElementsByClassName("time_slot");
	for(var t = 0; t<time_slots.length;t++){
		time_slots[0].disabled = false;
	}
	//disable dates
	
	for(var date in booked_dates){
		var disable = true;
		
		for(var timeslots in booked_dates[date]){
			var restricted = booked_dates[date]['restriction'];
			if(timeslots != "restriction"){
				var restricted_limit = restricted['limit'];
				var restricted_list = restricted['restricted_time'];
				var restriction = false;
				
				for(var index = 0; index < restricted_list.length; index++){
					//if exist in restricted time, compare with limit
					if(restricted_list[index] === timeslots){
						restriction = true;
						if(booked_dates[date][timeslots] < restricted_limit){
							disable = false;
						}
						
					}
				}
				
				// else, compare with default limit (3)
				if(!restriction && booked_dates[date][timeslots] < DEFAULT_LIMIT){
					disable = false;
				}
				
				
			}
		}
		//disable still true, add into array
		if(disable){
			disabledDates.push(date);
		}
	}
	console.log(disabledDates);
	calendarEvents = app.calendar.create({
		disabled: disabledDates,
		minDate: new Date(),
        inputEl: '#calendar-events-disable',
        dateFormat: 'dd M yyyy',
        events: [
          //- more events this day
          {
            date: today,
            color: '#ff0000'
          },
          {
            date: today,
            color: '#00ff00'
          },
        ]
    });
	
}

function disableTimeSlots(){
	//disable time
	
	var time_slots = document.getElementsByClassName("time_slot");
	var indexes = {
		'08:00': time_slots[0],
		'10:00': time_slots[1],
		'12:00': time_slots[2],
		'14:00': time_slots[3],
		'16:00': time_slots[4],
		'18:00': time_slots[5],
		'20:00': time_slots[6],
		'22:00': time_slots[7]
	}
	
	var booked_dates = booking_list[facility_chosen];

	var date_chosen = document.getElementById('calendar-events-disable').value;
	
	console.log(booked_dates);
	console.log(date_chosen);
	
	if(date_chosen.trim() != ""){
		var date = new Date(date_chosen);
		console.log(date);
		if(booked_dates[date] != undefined){
			
			for(var timeslots in booked_dates[date]){
				var restricted = booked_dates[date]['restriction'];
				if(timeslots != "restriction"){
					var restricted_limit = restricted['limit'];
					var restricted_list = restricted['restricted_time'];
					var restriction = false;
					
					for(var index = 0; index < restricted_list.length; index++){
						//if exist in restricted time, compare with limit
						if(restricted_list[index] === timeslots){
							restriction = true;
							if(booked_dates[date][timeslots] >= restricted_limit){
								indexes[timeslots].disabled = true;
							}
							
						}
					}
					
					// else, compare with default limit (3)
					if(!restriction && booked_dates[date][timeslots] >= DEFAULT_LIMIT){
						indexes[timeslots].disabled = true;
					}
				}
			}
		}
	}
}

async function set_booking(){
	
	//get today
	var now = new Date();
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	
	var book_button = document.getElementById("book-button");
	book_button.disabled = true;
	
	//booking collection
	let querySnapshot = await db.collection("booking").get();
	//reset booking list
	booking_list = {
	"AV_Room": {},
	"Sauna": {},
	"PingPong": {},
	"BBQ": {},
	"SkyLounge": {} 
	};
	
	querySnapshot.forEach((doc) => {
		var status = doc.data().status;
		if(status != "rejected"){
			var booked_date = new Date(doc.data().date);
			var facility_type = doc.data().facility;
			
			var bookings = "";
			//filter booked facilities
			if(facility_type === "AV Room")
				bookings = booking_list.AV_Room;
			else if(facility_type === "Sauna")
				bookings = booking_list.Sauna;
			else if(facility_type === "Sky Lounge")
				bookings = booking_list.SkyLounge;
			else if(facility_type === "BBQ Pit")
				bookings = booking_list.BBQ;
			else if(facility_type === "Ping-Pong Table")
				bookings = booking_list.PingPong;
			
			//if date is in the future or today
			if(booked_date >= today){
				
				var booking_time = doc.data().time;
				
				var facility_bookings = bookings[booked_date];
				//console.log(facility_bookings);

				//create object with date as key and initialize time slots
				if(facility_bookings == null){
					bookings[booked_date] = {};
					bookings[booked_date]['08:00'] = 0;
					bookings[booked_date]['10:00'] = 0;
					bookings[booked_date]['12:00'] = 0;
					bookings[booked_date]['14:00'] = 0;
					bookings[booked_date]['16:00'] = 0;
					bookings[booked_date]['18:00'] = 0;
					bookings[booked_date]['20:00'] = 0;
					bookings[booked_date]['22:00'] = 0;
					
					bookings[booked_date]['restriction'] = {};
			
					bookings[booked_date]['restriction']['restricted_time'] = [];
					bookings[booked_date]['restriction']['limit'] = 3;
				}
				
				//increment time slot booking counter
				if(bookings[booked_date][booking_time] == null){
					bookings[booked_date][booking_time] = 1;
				}else{
					//append time to the booked date
					bookings[booked_date][booking_time] += 1;
				}
					
			}
		}
	});
	
	//disable dates collection
	let disable_dates = await db.collection("disabled_dates").get();
	disable_dates.forEach((doc) => {
		//console.log(doc.data());
		var restricted_date = new Date(doc.data().date);
		var restricted_time = doc.data().disabled_time;
		var limit = doc.data().limit;
		var facility_type = doc.data().facility;
		var bookings = "";
		
		//filter booked facilities
		if(facility_type === "AV Room")
			bookings = booking_list.AV_Room;
		else if(facility_type === "Sauna")
			bookings = booking_list.Sauna;
		else if(facility_type === "Sky Lounge")
			bookings = booking_list.SkyLounge;
		else if(facility_type === "BBQ Pit")
			bookings = booking_list.BBQ;
		else if(facility_type === "Ping-Pong Table")
			bookings = booking_list.PingPong;
		
		if(bookings[restricted_date] == null){
			bookings[restricted_date] = {};
			bookings[restricted_date]['08:00'] = 0;
			bookings[restricted_date]['10:00'] = 0;
			bookings[restricted_date]['12:00'] = 0;
			bookings[restricted_date]['14:00'] = 0;
			bookings[restricted_date]['16:00'] = 0;
			bookings[restricted_date]['18:00'] = 0;
			bookings[restricted_date]['20:00'] = 0;
			bookings[restricted_date]['22:00'] = 0;
			
			bookings[restricted_date]['restriction'] = {};
			
			bookings[restricted_date]['restriction']['restricted_time'] = [];
			bookings[restricted_date]['restriction']['limit'] = 3;
		}
		
		bookings[restricted_date]['restriction'] = {};
			
		bookings[restricted_date]['restriction']['restricted_time'] = restricted_time;
		bookings[restricted_date]['restriction']['limit'] = limit;
		
	});
	
	console.log(booking_list);
	//initialize calendar
	calendar_init();
		
	//disable time_select until a date is chosen
	var time_select = document.getElementById("time_select");
	time_select.disabled = true;
	var date_chosen = document.getElementById('calendar-events-disable');
	date_chosen.addEventListener('change', function(e){
		time_select.disabled = false;
		book_button.disabled = false;
		disableTimeSlots()
	})
		
	//submit button clicked
	
	book_button.addEventListener('click', function(e){
		var user_id = auth.currentUser.uid;
		//var facility_chosen = document.getElementById('facility').value;
		var time_chosen = document.getElementById('time_select').value;
		var date_chosen = document.getElementById('calendar-events-disable').value;
		
		//filter booked facilities
		var facility = "";
		if(facility_chosen === "AV_Room")
			facility = "AV Room";
		else if(facility_chosen === "Sauna")
			facility = "Sauna";
		else if(facility_chosen === "SkyLounge")
			facility = "Sky Lounge";
		else if(facility_chosen === "BBQ")
			facility = "BBQ Pit";
		else if(facility_chosen === "PingPong")
			facility = "Ping-Pong Table";
		
		//format date
		var dateObj = new Date(date_chosen);
		var month = monthNames[dateObj.getMonth()];
		var day = String(dateObj.getDate()).padStart(2, '0');
		var year = dateObj.getFullYear();
		var date = day  + '-'+ month  + '-' + year;
		if(facility_chosen != "" && time_chosen != "" && date_chosen != ""){
			db.collection("booking").add({
				date: date,
				duration: "2 hours",
				facility: facility,
				status: "pending",
				time: time_chosen,
				user_id: user_id
			}).then(()=>{
				var mainView = app.view.main;
				mainView.router.navigate({ name: 'bookingsuccess'});
			})
		}
		
	})
}

function redirect(page){
	var mainView = app.view.main;
	mainView.router.navigate({ name: page});
}

function getFacility(){
	var bbq = document.getElementById('bbq');
	var skylounge = document.getElementById('skylounge');
	var avroom = document.getElementById('avroom');
	var sauna = document.getElementById('sauna');
	var gym = document.getElementById('gym');
	
	
	bbq.addEventListener('click', function(e){
		e.preventDefault();
		facility_chosen = "BBQ";
		console.log(facility_chosen);
		redirect("facilities");
	})
	
	skylounge.addEventListener('click', function(e){
		e.preventDefault();
		facility_chosen = "SkyLounge";		
		console.log(facility_chosen);
		redirect("facilities");
	})
	
	avroom.addEventListener('click', function(e){
		e.preventDefault();
		facility_chosen = "AV_Room";
		console.log(facility_chosen);
		redirect("facilities");
	})
	
	sauna.addEventListener('click', function(e){
		e.preventDefault();
		facility_chosen = "Sauna";	
		console.log(facility_chosen);
		redirect("facilities");
	})
	
	gym.addEventListener('click', function(e){
		e.preventDefault();
		facility_chosen = "PingPong";
		console.log(facility_chosen);		
		redirect("facilities");
	})
}



//////Payment Reminder
//Payment History
function getPaymentReminder(){
	var user_id = auth.currentUser.uid;
	var Payment_list = document.getElementById("reminder_list");
	var elements = "";
	
	db.collection("payment").where("user_id", "==", user_id).orderBy("time", "desc").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			if (doc.exists) {				
				if(status != "Successful"){
					
					var time = doc.data().time;
					var amount = doc.data().amount;
					var bank = doc.data().bank;
					var description = doc.data().description;
					var status = doc.data().status;
					var payment_method = doc.data().payment_method;
					
					var date = new Date(time);
					
					elements = `<ul class="reminder">
              <li class="item-content">
                <div class="item-media">
                  <img src="static/icons/fail.png" width="44" />
                </div>
                <div class="item-inner">
                  <div class="item-title-row">
                    <div class="item-title">${monthNames[date.getMonth()]}</div>
                  </div>
                  <div class="item-price">RM ${amount.toFixed(2)}</div>
                </div>
              </li>
			</ul>`;
					
				}	
			}
			
			Payment_list.innerHTML += elements;
	})});
}

//Payment History
function getPaymentHistory(){
	var user_id = auth.currentUser.uid;
	var Payment_list = document.getElementById("Payment_list");
	var elements = "";
	
	db.collection("payment").where("user_id", "==", user_id).orderBy("time", "desc").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			if (doc.exists) {
				var time = doc.data().time;
				var amount = doc.data().amount;
				var bank = doc.data().bank;
				var description = doc.data().description;
				var status = doc.data().status;
				var payment_method = doc.data().payment_method;
				
				var date = new Date(time);
				
				var url = "";
				if(status == "Successful"){
					url = "static/icons/success.png";
				}else{
					url = "static/icons/fail.png";
				}
				
				elements = `<ul>
          <li>
            <a href="#" class="item-link item-content">
              <div class="item-media"><img src="${url}"/></div>
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title">Fee</div>
                  <div class="item-after">RM${amount.toFixed(2)}</div>
                </div>
                
                <div class="item-text">${date}</div>
              </div>
            </a></li>
		</ul>`;
				
				
			}else{
				elements = `<div class="block block-strong">
					  <p>Sorry</p>
					  <p>You have not made any payments</p>
					</div>`
			}
			
			Payment_list.innerHTML += elements;
	})});
}


//Booking details
function getBookingDetails(){
	var user_id = auth.currentUser.uid;
	var booking_list = document.getElementById("booking_container");
	
	db.collection("booking").where("user_id", "==", user_id).orderBy("date", "desc").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			
			var facility = doc.data().facility;
			var date = doc.data().date;
			var duration = doc.data().duration;
			var status = doc.data().status;
			var time = doc.data().time;
			var src = "";
			
			if(facility === "AV Room")
				src = "static/icons/cinema.png";
			else if(facility === "Sauna")
				src = "static/icons/sauna.svg";
			else if(facility === "Sky Lounge")
				src = "static/icons/lounge.png";
			else if(facility === "BBQ Pit")
				src = "static/icons/bbq.png";
			else if(facility === "Ping-Pong Table")
				src = "static/icons/ball.png";
			
			var elements = `<div class="booking-details">
        <div class="booking-image">
          <img src="${src}" class="booking-icons">
        </div>
        <div class="booking-info">
          <h3 class="facility-name">${facility}</h3>
          <h4 class="booking-time">${date}</h4>
          <h4 class="booking-duration">${duration}</h4>
          <h4 class="booking-status">${status}</h4>
        </div>                  
      </div>`;
			
			booking_list.innerHTML += elements;
	})});
}

//announcements
function SelectAnnc(id){

	console.log(id);

	//console.log(annc.innerHTML);
	
	var docRef = db.collection("announcement").doc(id);

	docRef.get().then(function(doc) {
		var title = doc.data().title;
		var desc = doc.data().description;
		var imageurl = doc.data().imageurl;
			
		var pathReference = storage.ref("announcement/"+imageurl);
			
		pathReference.getDownloadURL().then(function(url) {

			var annc = document.getElementById("annc");
			annc.innerHTML = `<img id="annc_pic" width="100%" src="${url}"/>
							<p id="annc_title">${title}</p>
							<p id="annc_desc">${desc}</p>`;
					
		}).catch(function(error) {
			console.log(error);
		});
		
		
	}).catch(function(error) {
		console.log("Error getting document:", error);
	});
	
}

function getAnnouncement(){
	
	var annc_list = document.getElementById("annc_list");
	var list_ele = "";
	var url_list = [];
	  
	/*db.collection("announcement").orderBy("date","desc").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			
			var title = doc.data().title;
			var desc = doc.data().description;
			var imageurl = doc.data().imageurl;
			
			annc_list.innerHTML += `<tr class="announcement-list-row" onclick="app.data.SelectAnnc('${doc.id}')">
						<td>
							<a href="/announcement/">
								<img class="announcement-small-icon" src="#" id="${doc.id}')"/>
							</a>
						</td>
						<td>
							<a href="/announcement/">
								<h2 class="announcement-small-title">${title}</h2>
								<p class="announcement-small-text">${desc}</p>
							</a>
						</td>
					</tr>`;
					
					
			url_list.push(imageurl);
			console.log(imageurl);
		});
		
		//annc_list.innerHTML = list_ele;	
		
		return url_list;
	}).then((url_list)=>{
		
		var imgset = document.getElementsByClassName('announcement-small-icon');
		
		
		var d = 0;

		setURL(url_list[d],url_list,d,imgset);
	});*/
}

/* Set Announcement List */
async function setURL(url,url_list,d,imgset){
	var pathReference = storage.ref("announcement/"+url_list[d]);
	pathReference.getDownloadURL().then(function(url) {
	//console.log(url_list[d]);
					
		imgset[d].src = url;
		d++;
	}).then(()=>{
		if(d < url_list.length){
			setURL(url,url_list,d,imgset)
		}
	}).catch(function(error) {
		console.log(error);
	});
}

/* Create QR Code */
function createQrCode(){
	function count_time(){
		string = "";
		hours = time/3600;
		minutes = (time/60) % 60;
		seconds = time % 60;
		string = string + ("0" + Math.floor(hours)).slice(-2) + ":" + ("0" + Math.floor(minutes)).slice(-2) + ":" + ("0" + seconds).slice(-2);
		timer.innerHTML = string;
		time--;
	}
	
	//auth.signInWithEmailAndPassword("master2@gmail.com", "master2pass").then((cred) => {
	//	console.log("user logged in");
	//	//location.replace("residents.html");
	//	//err.innerHTML = '';
  	//}).catch(err => {
	//	console.log(err.message);
	//	//err.innerHTML = 'password incorrect or user does not exist';
  	//});
	
	var QRCode = require('qrcode');
	var canvas = document.getElementById("qrcode-canvas");
	var timer = document.getElementById("time-left");
	var time = 7200;
	var hours = 0;
	var minutes = 0;
	var seconds = 0;
	var string = "";
	
	QRCode.toCanvas(canvas, 'sample text', {width: 320}, function (error) {
		if (error) console.error(error)
		console.log('success!');
	});
	
	count_time();
	
	setInterval(function(){
		count_time();
	}, 1000);
}
//payments
var amount = '';
var amountString = '';
var paymentDescrip = '';

/*
temp
sessionStorage.getItem('label')
sessionStorage.setItem('label', 'value')

perm
localStorage.getItem('label')
localStorage.setItem('label', 'value')*/

/* Payment Method Page */
function getUserBillingPaymentMethod(){
	document.getElementById("amount").innerHTML = amountString;
	document.getElementById("payment-description").innerHTML = paymentDescrip;
}

/* Payment Page */
function getUserBilling(){
	var user_id = auth.currentUser.uid;
	db.collection("billing").where("user_id", "==", user_id).orderBy("date", "desc").limit(1).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
		if(doc.data().status != "paid"){
			var time = new Date();
			time.setTime(doc.data().date.seconds * 1000);
			amountString = (doc.data().amount/100).toFixed(2);
			paymentDescrip = doc.data().description;
			document.getElementById("amount-data").innerHTML = amountString;
			document.getElementById("pay-by").value = time.toLocaleDateString("en-US");
			document.getElementById("payment-details").value = paymentDescrip;
			document.getElementById("order-number").value = doc.id;
		}
		else{
			var payNowButton = document.getElementById("pay-now-button");
			payNowButton.disabled = true;
			payNowButton.onclick = function(){
					var toastBottom = app.toast.create({
					text: 'This is default bottom positioned toast',
					closeTimeout: 2000,
				});
			}
		}
	})});
}

/* Online Payment */
function online_payment_function(){
	var stripe = Stripe('pk_test_51HmpphAKsIRleTRbL8qxNUc97rkqnpYJRMpJ8JBry543rJ7PEXsv9vkr0JlqnjIK442Hb6c5IY7lcw7dall9vHs600xi3UqAyZ');
	var jsonString = { "amount": 8000 };
	var clientSecret = "";
	console.log(JSON.stringify(jsonString));
	var form = document.getElementById('payment-form');
	var online = firebase.functions().httpsCallable('Online');
	var elements = stripe.elements();
	var fpxButton = document.getElementById('fpx-button');
	var style = {
		base: {
			padding: '10px 12px',
			color: '#32325d',
			fontSize: '16px',
		},
	};

	var fpxBank = elements.create(
		'fpxBank',
		{
			style: style,
			accountHolderType: 'individual',
		}
	);
	
	fpxBank.mount('#fpx-bank-element');
	
	/*try{
		let stripe_data = sessionStorage.getItem('stripe_client_secret');
		
		try{
			stripe.retrievePaymentIntent(stripe_data).then(function(result) {
				// Handle result.error or result.paymentIntent
				console.log("Result",result);
				console.log("Error",result.error);
				console.log("PaymentIntent",result.paymentIntent);
				sessionStorage.clear();
			});
		}catch(err){
			console.log(err);
		}
	}catch(err){
		console.log(err);*/
		online(JSON.stringify(jsonString)).then((result) => {
			// Read result of the Cloud Function.
			clientSecret = result.data;
			fpxButton.disabled = false;
			fpxButton.setAttribute("data-secret",clientSecret);
			sessionStorage.setItem('stripe_client_secret', clientSecret);
		}).catch((error) => {
			// Getting the Error details.
			var code = error.code;
			var message = error.message;
			var details = error.details;
			// ...
		});
	//}
	
	$("#online-payment-cancel-button").click(()=>{
		window.location.href = "home";
	});

	form.addEventListener('submit', function(event) {
	  event.preventDefault();
	  
	  stripe.confirmFpxPayment(clientSecret, {
		payment_method: {
		  fpx: fpxBank,
		},
		return_url: `${window.location.href}`,
	  }).then((result) => {
		if (result.error) {
		  //var errorElement = document.getElementById('error-message');
		  //errorElement.textContent = result.error.message;
		  alert(result.error.message);
		}
	  });
	});
}

/* Credit Payment */
function credit_payment_function(){
	var stripe = Stripe("pk_test_51HmpphAKsIRleTRbL8qxNUc97rkqnpYJRMpJ8JBry543rJ7PEXsv9vkr0JlqnjIK442Hb6c5IY7lcw7dall9vHs600xi3UqAyZ");
	
	var jsonString = {
	  data: {
		  currency: "myr",
		  amount: 1000
	  }
	};
	
	fetch("https://us-central1-propertymanagement-88d03.cloudfunctions.net/Credit", {
	  method: "POST",
	  headers: {
		"Content-Type": "application/json"
	  },
	  body: JSON.stringify(jsonString)
	})
	  .then((result) => {
		return result.json();
	  })
	  .then(function(data) {
		var elements = stripe.elements();

		var style = {
		  base: {
			color: "#32325d",
			fontFamily: 'Arial, sans-serif',
			fontSmoothing: "antialiased",
			fontSize: "16px",
			"::placeholder": {
			  color: "#32325d"
			}
		  },
		  invalid: {
			fontFamily: 'Arial, sans-serif',
			color: "#fa755a",
			iconColor: "#fa755a"
		  }
		};

		var card = elements.create("card", { style: style });
		card.mount("#card-element");

		card.on("change", function (event) {
		  document.querySelector("button").disabled = event.empty;
		  document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
		});

		var form = document.getElementById("payment-form");
		form.addEventListener("submit", function(event) {
		  event.preventDefault();
		  payWithCard(stripe, card, data.data);
		});
	  });

	var payWithCard = function(stripe, card, clientSecret) {
	  loading(true);
	  
	  stripe
		.confirmCardPayment(clientSecret, {
		  payment_method: {
			card: card
		  }
		})
		.then(function(result) {
		  if (result.error) {
			showError(result.error.message);
		  } else {
			  alert("Complete");
			orderComplete(result.paymentIntent.id);
		  }
		});
	};

	var orderComplete = function(paymentIntentId) {
	  loading(false);
	  document
		.querySelector(".result-message a")
		.setAttribute(
		  "href",
		  "https://dashboard.stripe.com/test/payments/" + paymentIntentId
		);
	  document.querySelector(".result-message").classList.remove("hidden");
	  document.querySelector("button").disabled = true;
	};

	var showError = function(errorMsgText) {
	  loading(false);
	  var errorMsg = document.querySelector("#card-error");
	  errorMsg.textContent = errorMsgText;
	  setTimeout(function() {
		errorMsg.textContent = "";
	  }, 4000);
	};

	var loading = function(isLoading) {
	  if (isLoading) {
		document.querySelector("button").disabled = true;
		document.querySelector("#spinner").classList.remove("hidden");
		document.querySelector("#button-text").classList.add("hidden");
	  } else {
		document.querySelector("button").disabled = false;
		document.querySelector("#spinner").classList.add("hidden");
		document.querySelector("#button-text").classList.remove("hidden");
	  }
	};
	
	$("#credit-payment-cancel-button").click(()=>{
		window.location.href = "home";
	});
}

/* Not using */

/*function credit_payment_function(){
	app.on('pageInit', function (page) {  
		if (page.name === 'payment-credit'){
			$('#payment-credit-redirect-page').html('<iframe style="background:white;padding:0;margin:0;height:100%;width:100%;" src="http://rjproperty.site/client_side/payment/credit_payment.php"></iframe>'); 
		}
	});
}*/

/*function online_payment_function(){
	app.on('pageInit', function (page) {  
		if (page.name === 'payment-online'){
			$('#payment-online-redirect-page').html('<iframe style="background:white;padding:0;margin:0;height:100%;width:100%;" src="http://rjproperty.site/client_side/payment/online_payment.php"></iframe>'); 
		}
	});
}*/