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
	//get today
	var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	
	//initialize var for checking disabled dates
	var disabledDates = [];
	var facility_chosen = document.getElementById('facility').value;
	var booked_dates = booking_list[facility_chosen];
	console.log(booked_dates);
	
	//initialize var for time slots
	var time_slots = document.getElementsByClassName("time_slot");
	for(var t = 0; t<time_slots.length;t++){
		time_slots[0].disabled = false;
	}
	//disable dates
	for(var date in booked_dates){
		if(booked_dates[date].length == 8){
			disabledDates.push(date);
		}
	}
	
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

//import scripts
function init_script(){
	//stripe
	var stripe = document.createElement('script');
	stripe.src = "https://js.stripe.com/v3/";
	document.head.appendChild(stripe);
	console.log(auth);
	auth.signInWithEmailAndPassword("100086673@students.swinburne.edu.my", "123456").then((cred) => {
		console.log("user logged in");
  	}).catch(err => {
		console.log(err.message);
  	});
	
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
	
	/**/
	
}

var annc_selected;

//page handler
$$(document).on('page:init', async function (e, page) {
  var pn = page.name;
	console.log(pn);
	
	if(pn == "news"){
		getAnnouncement();
	}else if(pn == "booking_details"){
		getBookingDetails()
	}else if(pn == "payment_history"){
		getPaymentHistory()
	}else if(pn == "facilities"){
		
		
		//get today
		var now = new Date();
		var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		
		let querySnapshot = await db.collection("booking").get();
		
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
		
		//update calendar and available dates on change
		var facility_button = document.getElementById("facility");
		facility_button.addEventListener('change', function(e){
			//update calendar
			calendarEvents.destroy();
			calendar_init();
			disableTimeSlots()
		})
		
		//submit button clicked
		var book_button = document.getElementById("book-button");
		book_button.addEventListener('click', function(e){
			var user_id = auth.currentUser.uid;
			var facility_chosen = document.getElementById('facility').value;
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
					//window.location.href = "/bookingsuccess/";
					var mainView = app.view.main;
					mainView.router.navigate({ name: 'bookingsuccess'});
						//,path:"/bookingsuccess/" 
					
				})
			}
			
		})
	}
})

function disableTimeSlots(){
	//disable time
	var time_slots = document.getElementsByClassName("time_slot");
	var facility_chosen = document.getElementById('facility').value;
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
			
			
			var elements = `<div class="block block-strong">
				<img src='static/icons/favicon.png'>
				<p>${facility}</p>
				<p>${date}</p>
				<p>${time}</p>
				<p>${duration}</p>
				<p>${status}</p>
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
			annc.innerHTML = `<img id="annc_pic" src="${url}"/>
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
	
	QRCode.toCanvas(canvas, 'sample text', {width: 500}, function (error) {
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
	var jsonString = { "amount": 8000 };
	console.log(JSON.stringify(jsonString));
	var online = firebase.functions().httpsCallable('Online');
online(JSON.stringify(jsonString))
  .then((result) => {
    // Read result of the Cloud Function.
    var sanitizedMessage = result.data.text;
	console.log(sanitizedMessage);
  })
  .catch((error) => {
    // Getting the Error details.
    var code = error.code;
    var message = error.message;
    var details = error.details;
    // ...
  });
	var stripe = Stripe('pk_test_51HmpphAKsIRleTRbL8qxNUc97rkqnpYJRMpJ8JBry543rJ7PEXsv9vkr0JlqnjIK442Hb6c5IY7lcw7dall9vHs600xi3UqAyZ');
	var elements = stripe.elements();
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
	var form = document.getElementById('payment-form');

	form.addEventListener('submit', function(event) {
	  event.preventDefault();

	  var fpxButton = document.getElementById('fpx-button');
	  var clientSecret = fpxButton.dataset.secret;
	  stripe.confirmFpxPayment(clientSecret, {
		payment_method: {
		  fpx: fpxBank,
		},
		return_url: `${window.location.href}`,
	  }).then((result) => {
		if (result.error) {
		  var errorElement = document.getElementById('error-message');
		  errorElement.textContent = result.error.message;
		}
	  });
	});
}

function credit_payment_function(){
	var stripe = Stripe("pk_test_51HmpphAKsIRleTRbL8qxNUc97rkqnpYJRMpJ8JBry543rJ7PEXsv9vkr0JlqnjIK442Hb6c5IY7lcw7dall9vHs600xi3UqAyZ");

	var purchase = {
	  "amount":"8000",
	  "currency":"myr"
	};

	document.querySelector("button").disabled = true;
	fetch("/create-payment-intent", {
	  method: "POST",
	  headers: {
		"Content-Type": "application/json"
	  },
	  body: JSON.stringify(purchase)
	})
	  .then(function(result) {
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
		  payWithCard(stripe, card, data.clientSecret);
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
}