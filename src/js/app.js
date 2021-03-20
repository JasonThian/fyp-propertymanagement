import $$ from 'dom7';
import Framework7 from 'framework7/framework7.esm.bundle.js';

// Import F7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.less';
// Import Cordova APIs
import cordovaApp from './cordova-app.js';
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

//import scripts
async function init_script(){
	//jquery
	var jquery = document.createElement('script');
	set_logout();
	
	jquery.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
	document.head.appendChild(jquery);
	console.log(auth);
	
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
	
	auth.onAuthStateChanged(user => {
		var mainView = app.view.main;

		if (user) {
			var uid = user.uid;
			set_changepassword();
			
			console.log("user logged in");
			mainView.router.navigate({ name: 'home'});
			//fields
			var username = document.getElementById("username");
			var user_pic = document.getElementById("user_pic");
			var user_icon = document.getElementById("user_icon");
			console.log(user_icon);
			db.collection('landlord').doc(uid).get().then(function(doc) {
				
				var name = doc.data().name;
				var imageurl = doc.data().imageurl;
				
				username.innerHTML = name;
					
				var pathReference = storage.ref(imageurl);
					
				pathReference.getDownloadURL().then(function(url) {
					console.log(url);
					user_icon.src = url;
					user_pic.src = url;
					
					
				}).catch(function(error) {
					console.log(error);
				});
				
				
			}).catch(function(error) {
				console.log("Error getting document:", error);
			});
			
			
		}else{
			mainView.router.navigate({ name: 'login'});
		}
	})
	
}
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
		console.log(booked_dates[date]);
		if(booked_dates[date].length >= 8){
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

async function set_booking(){
	//get today
	var now = new Date();
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	
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
			//create object with date as key
			if(facility_bookings == null){
				var time_list = [];
			
				time_list.push(booking_time);
				
				bookings[booked_date] = time_list;
			}else{
				//append time to the booked date
				bookings[booked_date].push(booking_time);
			}
		}
	});
	
	//initialize calendar
	calendar_init();
		
	//disable time_select until a date is chosen
	var time_select = document.getElementById("time_select");
	time_select.disabled = true;
	var date_chosen = document.getElementById('calendar-events-disable');
	date_chosen.addEventListener('change', function(e){
		time_select.disabled = false;
		disableTimeSlots()
	})
		
	//submit button clicked
	var book_button = document.getElementById("book-button");
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

//page handler
$$(document).on('page:init', async function (e, page) {
  var pn = page.name;
	console.log(pn+" Entered");
	
	if(pn == "login"){
		set_login();
	}else if(pn == "news"){
		getAnnouncement();
	}else if(pn == "booking_details"){
		getBookingDetails();
	}else if(pn == "payment_history"){
		getPaymentHistory();
	}else if(pn == "bookfacility"){
		getFacility();
	}else if(pn == "facilities"){
		set_booking();
	}
})

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

function disableTimeSlots(){
	//disable time
	var time_slots = document.getElementsByClassName("time_slot");
	var booked_dates = booking_list[facility_chosen];

	var date_chosen = document.getElementById('calendar-events-disable').value;
	
	console.log(booked_dates);
	console.log(date_chosen);
	
	if(date_chosen.trim() != ""){
		var date = new Date(date_chosen);
		console.log(date);
		if(booked_dates[date] != undefined){
			
			for(var i =0; i<booked_dates[date].length; i++){
				console.log(booked_dates[date]);
				if(booked_dates[date][i] == "08:00"){
					time_slots[0].disabled = true;
				}else if(booked_dates[date][i] == "10:00"){
					time_slots[1].disabled = true;
				}else if(booked_dates[date][i] == "12:00"){
					time_slots[2].disabled = true;
				}else if(booked_dates[date][i] == "14:00"){
					time_slots[3].disabled = true;
				}else if(booked_dates[date][i] == "16:00"){
					time_slots[4].disabled = true;
				}else if(booked_dates[date][i] == "18:00"){
					time_slots[5].disabled = true;
				}else if(booked_dates[date][i] == "20:00"){
					time_slots[6].disabled = true;
				}else if(booked_dates[date][i] == "22:00"){
					time_slots[7].disabled = true;
				}
			}
		}
		
	}
	
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
				
				
				elements = `<div class="block block-strong">
					<p>Time: ${time}</p>
					<p>Amount: ${amount}</p>
					<p>Bank: ${bank}</p>
					<p>Description: ${description}</p>
					<p>Status: ${status}</p>
					<p>Payment Method: ${payment_method}</p>
				</div>`;
				
				
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
	  
	db.collection("announcement").orderBy("date","desc").get().then((querySnapshot) => {
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
	});
}

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

function getUserBillingPaymentMethod(){
	document.getElementById("amount").innerHTML = amountString;
	document.getElementById("payment-description").innerHTML = paymentDescrip;
}

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

function online_payment_function(){
	app.on('pageInit', function (page) {  
		if (page.name === 'payment-online'){
			$('#payment-online-redirect-page').html('<iframe style="height:100%;width:100%;" src="http://rjproperty.site/client_side/payment/online_payment.php"></iframe>'); 
		}
	});
}

function credit_payment_function(){
	app.on('pageInit', function (page) {  
		if (page.name === 'payment-credit'){
			$('#payment-credit-redirect-page').html('<iframe style="height:100%;width:100%;" src="http://rjproperty.site/client_side/payment/credit_payment.php"></iframe>'); 
		}
	});
}