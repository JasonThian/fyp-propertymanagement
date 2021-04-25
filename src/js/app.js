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
	close_panel: function(){
		app.panel.close('right');
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
	Chosen_Facility: function(chosen){
		console.log(chosen.id);
		chosen_facility(chosen.id);
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

/* Check Internet Connection */
function checkConnection() {
    var networkState = navigator.connection.type;

    /*var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';*/

    console.log('Connection type: ' + networkState);//states[networkState]);
	return networkState;
}

function onOffline(){
	document.addEventListener("offline", stopAllExecution(), false);
}

function stopAllExecution(){
	var currentState = checkConnection();
	//if(currentState == Connection.NONE)
		//throw new Error("Something went wrong");
	console.log(currentState);
}

app.preloader.show();

/* Logout */
function set_logout(){
	var logout = document.getElementById('logout');
	logout.addEventListener("click", function(e){
		e.preventDefault();
		
		try{
			var user_id = auth.currentUser.uid;
			FCMPluginNG.unsubscribeFromTopic(user_id);
		}catch(err){
			console.log(err);
		}
		
		auth.signOut().then(() => {
			console.log("user signed out");
			
			var mainView = app.view.main;
			mainView.router.navigate({ name: 'login'});
		});
	})
}

/* Show Preloader */
//app.preloader.show();

/* Hide Preloader */
//app.preloader.hide();

/* Go to page */
//redirect("/");

var USER_DOC = "";

/* Initialize */
async function init_script(){
	app.preloader.show();
	
	/*import jquery and Stripe js */
	var jquery = document.createElement('script');
	var stripe_payment = document.createElement('script');
	set_logout();
	
	jquery.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
	document.head.appendChild(jquery);
	
	stripe_payment.src = "https://js.stripe.com/v3/";
	document.head.appendChild(stripe_payment);
	
	/* SSL Pinning */
	try{
		var cordovaHTTP = cordova.plugin.http;
		cordovaHTTP.enableSSLPinning(true, function() {
			console.log('success!');
		}, function() {
			console.log('error :(');
		});
	}catch(err){
		console.log(err);
	}
	
	document.addEventListener("deviceready", onOffline(), false);
	
	/* Check User Login */
	auth.onAuthStateChanged(async user => {

		var mainView = app.view.main;
		console.log("user logged in");
		if (user) {
			var uid = user.uid;
			set_changepassword();
			
			
			mainView.router.navigate({ name: 'home'});
			homesetup();

			try{
				FCMPlugin.getToken(function(token){
					console.log(token);
				});
				FCMPlugin.subscribeToTopic('announcement');
				console.log("subscribe announcement success");
				FCMPlugin.subscribeToTopic(uid,function(){console.log("success");},function(err){console.log(err);});
				
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
						
						if(data.title == "Your bill is ready")
							redirect("payment");
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
	setTimeout(()=>{
		app.preloader.hide();
		const stripe = Stripe("pk_test_51HmpphAKsIRleTRbL8qxNUc97rkqnpYJRMpJ8JBry543rJ7PEXsv9vkr0JlqnjIK442Hb6c5IY7lcw7dall9vHs600xi3UqAyZ");
		try{
			let paymentIntent = parseURLParams(window.location.href);
			if(paymentIntent != undefined){
				
				console.log(paymentIntent);
				console.log(paymentIntent.redirect_status[0]);
				var stored_payment_intent = "";
				var payment_description = "";
				var facility_doc = "";
				
				/* Get payment intent id */
				try{
					stored_payment_intent = localStorage.getItem("latest-payment-intent");
					payment_description = localStorage.getItem("latest-payment-descrip");
					facility_doc = localStorage.getItem("latest-facility-document");
					console.log("latest-facility-document",facility_doc);
					console.log("latest-payment-descrip",payment_description);
					console.log("latest-payment-intent",stored_payment_intent);
				}catch(err){
					console.log(err);
				}
				
				try{
					stripe.retrievePaymentIntent(localStorage.getItem("latest-payment-secret")).then(function(result) {
						// Handle result.error or result.paymentIntent
						console.log(result);
					});;
				}catch(err){
					console.log(err);
				}
				
				/* Check if payment for facility */
				if(payment_description == "Sauna"){
					if(paymentIntent.payment_intent[0] != stored_payment_intent){
						/* Save payment intent id */
						localStorage.setItem("latest-payment-intent",paymentIntent.payment_intent[0]);
					}
					
					if(paymentIntent.redirect_status[0] == "succeeded"){
						db.collection("booking").doc(facility_doc).get().then((doc) => {
							if(doc.data().status == "pending"){
								console.log("booking is pending");
								db.collection("booking").doc(facility_doc).update({ status: "success" }).then(() => {
									console.log("booking success");
									/* Display Payment Success Page */
									redirect("payment-success");
								});
							}
						}).catch((err) => {
							console.log(err);
						});
					}else{
						db.collection("booking").doc(facility_doc).delete().then(() => {
							console.log("booking failed");
							/* Disply Payment Failed Page */
							redirect("payment-fail");
						}).catch((err) => {
							console.log(err);
						});
					}
				}else{
					if(paymentIntent.payment_intent[0] != stored_payment_intent){
						/* Save payment intent id */
						localStorage.setItem("latest-payment-intent",paymentIntent.payment_intent[0]);
						
						if(paymentIntent.redirect_status[0] == "succeeded"){
							/* Display Payment Success Page */
							redirect("payment-success");
						}
						else{
							/* Disply Payment Failed Page */
							redirect("payment-fail");
						}
					}
				}
			}else{
				if(localStorage.getItem("latest-payment-descrip") == "Sauna")
					db.collection("booking").doc(localStorage.getItem("latest-facility-document")).get().then((doc) => {
						if(doc.exists)
							if(doc.data().status == "pending")
								db.collection("booking").doc(localStorage.getItem("latest-facility-document")).delete();
					}).catch((err) => {
						
					});
			}
		}catch(err){
			console.log(err);
		}
	},2000);
	
	/* Customize Android/iOS hardware back button */
	try{
		var count = 0;
		document.addEventListener("backbutton", function(e, page){
			e.preventDefault();
			
			console.log(e);
			console.log(page);
			console.log(page.name);
			
			var pn = page.name;
			
			if(pn == "home" || pn == "login"){
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
			}else if(pn == "payment-success" || pn == "payment-fail"){
				redirect("home");
			}
		}, false);
	}catch(err){
		console.log(err);
	}
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
	}else if(pn == "payment-success"){
		saveSuccessPaymentDetails();
	}else if(pn == "payment-method"){
		getUserBillingPaymentMethod();
	}else if(pn == "billing"){
		getBilling();
	}else if(pn == "payment"){
		getUserBilling();
	}else if(pn == "qrcode"){
		getQrCode();
	}else if(pn == "issue_report"){
		issueReportPage();
	}else if(pn == "chatbox"){
		chatbox();
	}
	checkConnection();
})

function check_msg_type(doc){
	var chatele=[];
	
	if(doc.user != "user"){
		chatele.push({text: doc.message,type: 'received'});
	}else{
		chatele.push({text: doc.message,type: 'sent'});
	}
	
	return chatele;
}

function check_msg_type2(doc,messages){
	var chatele="";
//	var messages = app.messages.create({
//		el: '.messages'
//	});
	
	if(doc.user == "user"){
		 messages.addMessage({
            text: doc.message,
            type: 'sent'
          });
	}else{
		messages.showTyping({
          header: 'Admin is typing'
        });
		
		setTimeout(function () {
          // Add received dummy message
          messages.addMessage({
            text: doc.message,
            type: 'received'
          });
          // Hide typing indicator
          messages.hideTyping();
        }, 4000);
	}
	
	return chatele;
}

// chatbox
function chatbox(){
	
	var messagebar = app.messagebar.create({
        el: '.messagebar'
    });
	var messages;
	messagebar.clear();
	
	var user_id = auth.currentUser.uid;
	
	var send = document.getElementById("send_msg");
	
	var msg_box = document.getElementById("msg_box");
	
	var chatroomRef = db.collection("landlord").doc(user_id).collection("chatroom");
	var chat_array = [];
	var chatele = "";
	var new_chat = "";
	var start = true;
	
	chatroomRef.orderBy("time", "desc").limit(50).onSnapshot((snapshot) => {
		
        snapshot.docChanges().forEach((change) => {
			
			
			var doc = change.doc.data();
			
			console.log(change);
			var init_msg_box = document.getElementById("msg_box");
			if(init_msg_box.innerHTML.trim() == ""){		
				console.log("old message");
				if(doc.user != "user"){
					chat_array.push({text: doc.message,type: 'received'});
				}else{
					chat_array.push({text: doc.message,type: 'sent'});
				}
			}else{
				if(change.type == "added"){
					console.log("new message");
					//chatele += check_msg_type(change.doc.data());
					
					check_msg_type2(doc,messages);
				}
			}
			
			
        });
		var init_msg_box = document.getElementById("msg_box");
		if(init_msg_box.innerHTML.trim() == ""){		
			//msg_box.innerHTML = chatele;
			messages = app.messages.create({
				el: '.messages',
				messages: chat_array.reverse()
			});
		
		}
		
    }, (error) => {
		console.error(error);
	});
	
	var msg_box = document.getElementById("chatbox_msg");

			
	send.addEventListener("click",function(e){
		e.preventDefault();
		var msg = document.getElementById("chatbox_msg").value;
		if(msg.trim() != ""){
			
			//console.log(USER_DOC);
			chatroomRef.add({
				name: USER_DOC.name,
				message: msg,
				user: "user",
				time: new Date()
			})
			
			db.collection("landlord").doc(user_id).update({
				rmsg : msg,
				dateupdated: new Date()
			})
			
			messagebar.clear();
		}else{
			console.log("empty msg");
		}
	})
}

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

var user_type = "";
///////////// HOME SETUP
async function homesetup(){
	var uid = auth.currentUser.uid;
	//fields
	var username = document.getElementById("username");
	var user_pic = document.getElementById("user_pic");
	
	var user_icon = document.getElementById("user_icon");
	var user_icon_name = document.getElementById("user_icon_name");
	
	console.log(uid);
	//set user details
	db.collection('landlord').doc(uid).get().then((doc) => {
		console.log("getting user data");
		console.log(doc.data())
		
		var landlords = doc.data().landlords;
		var role = doc.data().role;
		
		USER_DOC = doc.data();
		
		if(landlords == ""){
			user_type = "landlord";
		}else{
			user_type = "user";
		}
		
		var name = doc.data().name;
		var imageurl = doc.data().imageurl;
			
		username.innerHTML = "Hi, "+name;
		user_icon_name.innerHTML = name + " | "+role;
		
		var pathReference = storage.ref(imageurl);
					
		pathReference.getDownloadURL().then(function(url) {
			
			//console.log(url);
			user_pic.src = url;
			user_icon.src = url;
			
		}).catch(function(error) {
			console.log(error);
		});
	})
	
	//set announcements
	let querySnapshot = await db.collection("announcement").orderBy("date", "desc").limit(1).get();
	var annc_img = document.getElementsByClassName('announcement-img');
	var annc_title = document.getElementById('annc_title');
	var annc_imgs = document.getElementById('annc_img');
	var annc_ele = "";

	querySnapshot.forEach(async (doc) => {
		var imageurl = doc.data().imageurl;
		var title = doc.data().title;
			
		var pathReference = storage.ref("announcement/"+imageurl);
			
		console.log(imageurl);
		let url = await pathReference.getDownloadURL();
			
		annc_title.innerHTML = title;
		annc_imgs.src = url;
	});
	
	//booking
	var book_ele = "";
	var latest_booking = document.getElementById('latest_booking');
	var today = new Date();
	var today_time = today.getTime();
	db.collection("booking").where("user_id", "==", uid).where("timestamp", ">", today_time).orderBy("timestamp", "asc").limit(1).get().then((querySnapshot) => {
		querySnapshot.forEach(async (doc) => {
			
			//.where("timestamp", ">", today_time).orderBy("timestamp", "asc")
			
			var facility = doc.data().facility;
			var date = doc.data().date;
			var duration = doc.data().duration;
			var status = doc.data().status;
			var time = doc.data().time;
			var src = "";
			
			time = tConvert(time);			
			
			book_ele = `<div class="card-content-padding no-border display-flex flex-direction-column ">
						<div class="block-header color-custom no-padding">Facility Booked</div>
						<div class="block block-strong">
							<p class="amont-due color-gold">${facility}</p>
						</div>

						<div class="block-header color-custom no-padding">Date & Time</div>
						<div class="block block-strong">
							<p class="amont-due no-margin-bottom color-gold">${date}</p>
						</div>
						<div class="block block-strong">
							<p class="amont-due no-margin-top color-gold">${time}</p>
						</div>
					</div>`;
			
			latest_booking.innerHTML = book_ele;
		})
	});
}

function tConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
  }
  return time.join (''); // return adjusted time or original string
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

//////// Issue Reporting PAGE
function issueReportPage(){
	var user_id = auth.currentUser.uid;
	var docRef = db.collection("landlord").doc(user_id);
	
	//image url
	var blob = "";
	
	//fields
	var submit_issue = document.getElementById("submit_issue");
	
	
	$("#report_img").change(function() {
		
		blob = readURL(this,"report_sample");
		//console.log(blob);
	});
	docRef.get().then(function(doc) {
		var user_id = doc.id;
		var name = doc.data().name;
		var email = doc.data().email;
		var pno = doc.data().contact;
		var gender = doc.data().gender;
		var units = doc.data().unit;
		
		
		
		submit_issue.addEventListener('click', function(e){
			if(blob != ""){
				//get values
				var date = new Date();
				var report_desc = document.getElementById("report_desc").value;
				var report_block = document.getElementById("report_block").value;
				if(report_desc.trim() != "" && report_block.trim() != ""){
					var img_id = makeid(10);
				
					var announceref = storage.ref().child("issues/"+img_id+".png");
					
					announceref.put(blob).then(function(snapshot) {
						var issueRef = db.collection("issues");
						console.log('creating issue doc');
						issueRef.add({
							date: date,
							desc: report_desc,
							block: report_block,
							img: img_id+".png",
							reporter: user_id,
							pno: pno,
							email: email,
							name: name
						}).then(function(e) {
							toast("successfully reported this issue");
							redirect("home");
						}).catch(err => {
							console.log('err: '+err);
							toast("failed to reported this issue");
						});
						
					}).catch(err => {
						console.log('err: '+err);
					});
				}else{
					toast("Please fill in all details");
				}
				
			}else{
				toast("Please Select a image");
			}
		})
		
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
	//var update_photo = document.getElementById("update_photo");
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
	
	change_photo.addEventListener('click', function(e){
		if(blob != ""){
			var announceref = storage.ref().child(user_id+".png");
			
			announceref.put(blob).then(function(snapshot) {
				console.log('Updated user image');
				docRef.update({
					imageurl: user_id+".png"
				}).then( promise => {
					close_img_popup.click();
					redirect("home");
					toast("successfully updated photo");
				})
				
			}).catch(err => {
				console.log('err: '+err);
				toast("failed to update photo");
			});
		}else{
			toast("Please Select a image");
		}
	})
	
	$("#imgInp").change(function() {
		blob = readURL(this,'blah');
		//console.log(blob);
	});
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

function readURL(input,id) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		var blob = input.files[0];
		reader.onload = function(e) {
			var imgele = document.getElementById(id);
			console.log(id);
			imgele.src = e.target.result;
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
	"AV Room": {},
	"Sauna": {},
	"Gym": {},
	"BBQ Pit": {},
	"Sky Lounge": {} 
	};
var booking_type = {};
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
			var restricted = booked_dates[date]['restriction'][user_type];
			if(timeslots != "restriction"){
				for(var restricted_limit in restricted){
					var restricted_list = restricted[restricted_limit];
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
				var restricted = booked_dates[date]['restriction'][user_type];
				if(timeslots != "restriction"){
					for(var restricted_limit in restricted){
						var restricted_list = restricted[restricted_limit];
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
							console.log(indexes[timeslots]);
							indexes[timeslots].disabled = true;
						}
					}
					
				}
			}
		}
	}
}

async function set_booking(){
	console.log(facility_chosen);
	//get today
	var now = new Date();
	var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	
	var book_button = document.getElementById("book-button");
	book_button.disabled = true;
	
	/* Popup ask for payment */
	var paymentPopup = app.popup.create({
		el: '.popup-facility-payment',
    });
	
	//booking collection
	let querySnapshot = await db.collection("booking").get();
	//reset booking list
	
	querySnapshot.forEach((doc) => {
		var status = doc.data().status;
		if(status != "rejected"){
			var booked_date = new Date(doc.data().date);
			var facility_type = doc.data().facility;
			
			var bookings = booking_list[facility_type];
			
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
					bookings[booked_date]['restriction']['landlord'] = {};
					bookings[booked_date]['restriction']['user'] = {};
					
					bookings[booked_date]['restriction']['landlord'][3] = [];
					bookings[booked_date]['restriction']['user'][3] = [];
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
		var limited_type = doc.data().users;
		
		var bookings = booking_list[facility_chosen];
		
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
		}
		
		if(bookings[restricted_date]['restriction'] == null){
			bookings[restricted_date]['restriction'] = {};
		}
		
		if(bookings[restricted_date]['restriction']['landlord'] == null){
			bookings[restricted_date]['restriction']['landlord'] = {};
			bookings[restricted_date]['restriction']['user'] = {};
		}
		
		
		if(limited_type == "all"){
			if(bookings[restricted_date]['restriction']['landlord'][limit] == null){
				bookings[restricted_date]['restriction']['landlord'][limit] = [];
			}
			
			if(bookings[restricted_date]['restriction']['user'][limit] == null){
				bookings[restricted_date]['restriction']['user'][limit] = [];
			}
			
			bookings[restricted_date]['restriction']['landlord'][limit] = restricted_time.concat(bookings[restricted_date]['restriction']['landlord'][limit]);
			bookings[restricted_date]['restriction']['user'][limit] = restricted_time.concat(bookings[restricted_date]['restriction']['user'][limit]);
		}else{
			if(bookings[restricted_date]['restriction'][limited_type][limit] == null){
				bookings[restricted_date]['restriction'][limited_type][limit] = [];
			}
			bookings[restricted_date]['restriction'][limited_type][limit] = restricted_time.concat(bookings[restricted_date]['restriction'][limited_type][limit]);
		}
		
		
		
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
		e.preventDefault();
		
		var user_id = auth.currentUser.uid;
		//var facility_chosen = document.getElementById('facility').value;
		var time_chosen = document.getElementById('time_select').value;
		var date_chosen = document.getElementById('calendar-events-disable').value;

		//format date
		var dateObj = new Date(date_chosen);
		var month = dateObj.getMonth()+1;
		var day = String(dateObj.getDate()).padStart(2, '0');
		var year = dateObj.getFullYear();
		var date = day  + '-'+ month  + '-' + year;
		
		//if facility is free
		if(booking_type[facility_chosen] != "Charge" && facility_chosen != "" && time_chosen != "" && date_chosen != ""){
			db.collection("booking").add({
				date: date,
				duration: "2 hours",
				facility: facility_chosen,
				status: "pending",
				time: time_chosen,
				user_id: user_id
			}).then(()=>{
				var toast = app.toast.create({
					text: 'Booking has been sent for verification',
					closeTimeout: 2000,
					position: "center"
				});
				toast.open();
				redirect('bookingsuccess');
			})
		//if facility is pay to use
		}else if(booking_type[facility_chosen] == "Charge" && time_chosen != "" && date_chosen != ""){
			console.log("dsa",localStorage.getItem("facility-payment-dont-show-again"));
			if(localStorage.getItem("facility-payment-dont-show-again") == "set"){
				redirect_payment();
			}else{
				paymentPopup.open();
			}
		}else{
			var toast = app.toast.create({
				text: 'Please fill in the details',
				closeTimeout: 2000,
				position: "center"
			});
			toast.open();
		}
		
		/* prevent duplicate onclick event */
		$("#popup-payment-yes").prop("onclick",null).off("click");
		$("#popup-payment-no").prop("onclick",null).off("click");
		
		$("#popup-payment-yes").click((e) => {
			e.preventDefault();
			
			/* Don't show again */
			var facility_checkbox = document.getElementById("facility-payment-dont-show-again");
			
			if(facility_checkbox.checked){
				localStorage.setItem("facility-payment-dont-show-again","set");
			}
			
			redirect_payment();
		});
		
		$("#popup-payment-no").click((e) => {
			e.preventDefault();
			paymentPopup.close();
		});
		
		function redirect_payment(){
			db.collection("booking").add({
				date: date,
				duration: "2 hours",
				facility: facility_chosen,
				status: "pending",
				time: time_chosen,
				user_id: user_id
			}).then((doc) =>{
				var price = 1000 * 2;
				localStorage.setItem("latest-payment-amount",parseFloat(price).toFixed(0));
				localStorage.setItem("latest-payment-amount-string",parseFloat(parseFloat(price).toFixed(0)/100).toFixed(2));
				localStorage.setItem("latest-payment-descrip",facility_chosen);
				localStorage.setItem("latest-facility-document",doc.id);
				paymentPopup.close();
				redirect("payment-method");
			}).catch((err) => {
				timed_toast("An error has occured","center");
			});
		}
	})
}

function redirect(page){
	var mainView = app.view.main;
	mainView.router.navigate({ name: page});
}

async function getFacility(){
	var facilities = document.getElementById('facility-list');
	console.log(facilities);
	booking_list = {};
	booking_type = {};
	
	var facilityRef = db.collection("config").doc("facilities").collection("facilities_list");
	
	let facilities_list = await facilityRef.orderBy("name", "asc").get();
	
	await facilities_list.forEach(async (doc) => {
		//init vars
		var img_url = doc.data().img;
		var name = doc.data().name;
		var booking_payment_type = doc.data().payment;
		
		//setup obj
		booking_list[name] = {};
		booking_type[name] = booking_payment_type;
		
		var pathReference = storage.ref("facilities/"+img_url);
			
		let url = await pathReference.getDownloadURL();
		facilities.innerHTML += `<div onclick="app.data.Chosen_Facility(this)" id="${name}">
				  <a href="">
					<img src="${url}" width="80" height="80">
					<p class="subtitle">${name}</p>
				  </a>
				</div>`;
				
		console.log(facilities);

	})
}

function chosen_facility(chosen){
	facility_chosen = chosen;
	redirect('facilities');
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
					var amount = doc.data().amount/100;
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
				var amount = doc.data().amount/100;
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
			annc.innerHTML = `<
							<p id="annc_title">${title}</p>
							<img id="annc_pic" width="100%" src="${url}"/>
							
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
			var date = doc.data().date.toDate();
			
			var month = monthNames[date.getMonth()];
			var day = String(date.getDate()).padStart(2, '0');
			var year = date.getFullYear();
			
			// Hours part from the timestamp
			var hours = date.getHours();
			// Minutes part from the timestamp
			var minutes = String(date.getMinutes()).padStart(2, '0');
			// Seconds part from the timestamp
			var seconds = String(date.getSeconds()).padStart(2, '0');
			
			date = day+" "+month+" "+year+" "+hours+":"+minutes;
			
			annc_list.innerHTML += `<a href="#" id="${doc.id}" class="announcement-link">
			<div class="card carder">
				<div class="card-content card-content-padding">
					<div class="date">
						<p class="date-list">${date}</p>
					</div>					
					<div class="announcement-icon-block">
						<img class="announcement-small-icon" src="static/icons/1.png" id="${doc.id}"/>
					</div>
					<div class="announcement-text-block">
						<h2 class="announcement-small-title">${title}</h2>
						<p class="announcement-small-text">${desc}</p>
					</div>			
				</div>	
			</div>
		</a>`;
					
					
			url_list.push(imageurl);
			console.log(imageurl);
		});
		
		//annc_list.innerHTML = list_ele;	
		
		return url_list;
	}).then((url_list)=>{
		
		var imgset = document.getElementsByClassName('announcement-small-icon');
		
		
		var d = 0;

		setURL(url_list[d],url_list,d,imgset);
		
		var announcement_link = document.getElementsByClassName('announcement-link');
		for(var i=0; i< announcement_link.length;i++){
			announcement_link[i].addEventListener("click",function(e){
				e.preventDefault();
				redirect("announcement");
				SelectAnnc(this.id)
			})
		}
	});
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

var loop;

/* QR Code Page */
function getQrCode(){
	app.preloader.show();
	var lastQrCode = localStorage.getItem("latest-qr-code");
	var QRCode = require('qrcode');
	var canvas = document.getElementById("qrcode-canvas");
	var shareButton = document.getElementById("share-button");
	var time = new Date();
	var QrCodeTime = null;
	var QrCodeData = null;
	var QrCodeArray = null;
	
	try{
		QrCodeData = lastQrCode.replaceAll(/[a-zA-Z ]+[:][ ]/g, "");
		console.log(QrCodeData);
		QrCodeArray = QrCodeData.split("\n");
		QrCodeTime = QrCodeArray[4];
	}catch(err){
		console.log(err);
	}
	
	console.log("latest-qr-code",lastQrCode);
	
	if(lastQrCode != null && lastQrCode != undefined && lastQrCode != ""){
		if(QrCodeTime > time.getTime()){
			QRCode.toCanvas(canvas, lastQrCode, {width: 250, height: 250}, function (error) {
				if (error)
					console.error(error);
				else
					console.log('success!');
			});
			
			count_time(QrCodeTime);
		}
		else{
			console.log("QrCodeTime",QrCodeTime);
			console.log("currentTime",time.getTime());
		}
	}
	
	$("#share-button").prop("onclick",null).off("click");
	$("#share-button").click(() => {
		
		lastQrCode = localStorage.getItem("latest-qr-code");
		
		try{
			QrCodeData = lastQrCode.replaceAll(/[a-zA-Z ]+[:][ ]/g, "");
			console.log(QrCodeData);
			QrCodeArray = QrCodeData.split("\n");
			QrCodeTime = QrCodeArray[4];
		}catch(err){
			console.log(err);
		}
		
		if(lastQrCode != null && lastQrCode != undefined && lastQrCode != ""){
			if(QrCodeTime > time.getTime()){
				shareQrCode();
			}
			else
				timed_toast("The Qr Code expired, please generate a new Qr Code.","center");
		}
	});
	
	app.preloader.hide();
}

/* QR Code Set Timer */
function count_time(QRCodeTime){
	
	try{
		clearInterval(loop);
	}catch(err){
		console.log(err);
	}
	loop = setInterval(function(){
		var currentTime = new Date();
		if(QRCodeTime >= currentTime.getTime())
			loop_time(QRCodeTime,loop);
		else
			clearInterval(loop);
	}, 1000);
}

/* QR Code Timer Loop */
function loop_time(QRCodeTime,loop){
	var timer = document.getElementById("time-left");
	var currentTime = new Date();
	var time = parseInt(QRCodeTime/1000) - parseInt(currentTime.getTime()/1000);
	console.log(QRCodeTime);
	console.log(currentTime.getTime());
	console.log(time);
	var hours = time/3600;
	var minutes = (time/60) % 60;
	var seconds = time % 60;
	var string = ("0" + Math.floor(hours)).slice(-2) + ":" + ("0" + Math.floor(minutes)).slice(-2) + ":" + ("0" + seconds).slice(-2);
	try{
		timer.innerHTML = string;
	}catch(err){
		try{
			clearInterval(loop);
		}catch(err){
			console.log(err);
		}
	}
}

/* Create QR Code */
function createQrCode(){

	var user_id = auth.currentUser.uid;
	var QRCode = require('qrcode');
	var canvas = document.getElementById("qrcode-canvas");
	var time = new Date();
	time.setHours( time.getHours() + 2 );
	
	clearInterval(loop);
	
	db.collection("landlord").doc(user_id).get().then((doc) => {
		
		var string = "Owner Contact: " + doc.id +
		"\nUnit: " + doc.data().contact +
		"\nOwner IC: " + doc.data().ic +
		"\nOwner Name: " + doc.data().name +
		"\nExpire time: " + time.getTime();
		
		return string;
	
	}).then((string) => {
		
		localStorage.setItem("latest-qr-code",string);
	
		QRCode.toCanvas(canvas, string, {width: 250, height: 250}, function (error) {
			if (error)
				console.error(error);
			else
				console.log('success!');
		});
		
		count_time(time.getTime());
		
	}).catch((err) => {
		console.log(err);
		timed_toast("Unable to create QR Code, please check your connection","Center");
	});
}

/* Share Button - Not Functioning */
function shareQrCode(){
	var options = {
		files: ['static/icons/img-placeholder.jpg']
	};
	 
	var onSuccess = function(result) {
		console.log("Share completed? " + result.completed);
		console.log("Shared to app: " + result.app);
		timed_toast("Sharing completed", "center");
	};
	 
	var onError = function(msg) {
		console.log("Sharing failed with message: " + msg);
		timed_toast("Sharing failed", "center");
	};
	 
	window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
}

function getPaymentDetails(id){
	localStorage.setItem("latest-payment-id",id);
	redirect("payment");
}

/* Billing Page */
function getBilling(){
	app.preloader.show();
	var paid_container = document.getElementById("paid_billing");
	var unpaid_container = document.getElementById("unpaid_billing");
	var paid_list = document.createElement("ul");
	var unpaid_list = document.createElement("ul");
	var user_id = auth.currentUser.uid;
	var paid_array = [];
	var unpaid_array = [];
	var paid_html = "";
	var unpaid_html = "";
	
	paid_container.innerHTML = "";
	unpaid_container.innerHTML = "";
	
	db.collection("billing").where("user_id","==",user_id).get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			if(doc.data().status == "paid"){
				let object = {
					id: doc.id,
					description: doc.data().description,
					amount: doc.data().amount,
					due_date: doc.data().due_date.toDate().toString(),
					time: doc.data().due_date.toDate().getTime()
				};
				paid_array.push(object);
			}
			else if(doc.data().status == "unpaid"){
				let object = {
					id: doc.id,
					description: doc.data().description,
					amount: doc.data().amount,
					due_date: doc.data().due_date.toDate().toString(),
					time: doc.data().due_date.toDate().getTime()
				};
				unpaid_array.push(object);
			}
		});
	}).then(() => {
		for (let j = 0; j < paid_array.length; j++) {
			for (let i = 0; i+1 < paid_array.length; i++) {
				if(paid_array[i].time < paid_array[i+1].time){
					let array = paid_array[i];
					paid_array[i] = paid_array[i+1];
					paid_array[i+1] = array;
				}
			}
		}
		for (let j = 0; j < unpaid_array.length; j++) {
			for (let i = 0; i+1 < unpaid_array.length; i++) {
				if(unpaid_array[i].time < unpaid_array[i+1].time){
					let array = unpaid_array[i];
					unpaid_array[i] = unpaid_array[i+1];
					unpaid_array[i+1] = array;
				}
			}
		}
	}).then(() => {
		for (let i = 0; i < paid_array.length; i++) {
			let url = "static/icons/success.png";
			paid_html += `
			<li id="${paid_array[i].id}" class="billing-row">
				<a id="${paid_array[i].id}" class="item-link item-content">
					<div class="item-media"><img src="${url}"/></div>
					<div class="item-inner">
						<div class="item-title-row">
							<div class="item-title">${paid_array[i].description}</div>
							<div class="item-after">RM${parseInt(paid_array[i].amount/100).toFixed(2)}</div>
						</div>
						<div class="item-text">${paid_array[i].due_date}</div>
					</div>
				</a>
			</li>`;
		}
		for (let i = 0; i < unpaid_array.length; i++) {
			let url = "static/icons/fail.png";
			unpaid_html += `
			<li id="${unpaid_array[i].id}" class="billing-row">
				<a id="${unpaid_array[i].id}" class="item-link item-content">
					<div class="item-media"><img src="${url}"/></div>
					<div class="item-inner">
						<div class="item-title-row">
							<div class="item-title">${unpaid_array[i].description}</div>
							<div class="item-after">RM${parseInt(unpaid_array[i].amount/100).toFixed(2)}</div>
						</div>
						<div class="item-text">${unpaid_array[i].due_date}</div>
					</div>
				</a>
			</li>`;
		}
	}).then(() => {
		paid_list.innerHTML = paid_html;
		unpaid_list.innerHTML = unpaid_html;
		paid_container.appendChild(paid_list);
		unpaid_container.appendChild(unpaid_list);
		document.getElementById("unpaid_tab").click();
		$(".billing-row").prop("onclick",null).off("click");
		$(".billing-row").click((event) => {
			getPaymentDetails(event.currentTarget.id);
		});
		app.preloader.hide();
	}).catch((err) => {
		console.log(err);
		app.preloader.hide();
	});
}

/*
temp
sessionStorage.getItem('label')
sessionStorage.setItem('label', 'value')

perm
localStorage.getItem('label')
localStorage.setItem('label', 'value')*/


/* Payment Method Page */
function getUserBillingPaymentMethod(){
	document.getElementById("amount").innerHTML = localStorage.getItem('latest-payment-amount-string');
	document.getElementById("payment-description").innerHTML = localStorage.getItem('latest-payment-descrip');
	
	$('#payment-selection').prop('onclick',null).off('click');
	
	$('#payment-selection').click(() => {
		var selection = $("input[type='radio'][name='pMethod']:checked").val();
		console.log(selection);
		if(selection == "online"){
			redirect("payment-online");
		}
		else if(selection == "credit"){
			redirect("payment-credit");
		}
		else{
			alert("Please select a payment type");
		}
	});
}

/* Payment Page */
function getUserBilling(){
	var user_id = auth.currentUser.uid;
	var payNowButton = document.getElementById("pay-now-button");
	
	app.preloader.show();
	payNowButton.disabled = true;
	db.collection("billing").doc(localStorage.getItem("latest-payment-id")).get().then((doc) => {
		$("#pay-now-button").prop("onclick",null).off("click");
		
		var time = new Date();
		var amount = '';
		var amountString = '';
		var paymentDescrip = '';
		
		/* parse data */
		time.setTime(doc.data().date.seconds * 1000);
		amount = doc.data().amount;
		amountString = (doc.data().amount/100).toFixed(2);
		paymentDescrip = doc.data().description;
		
		/* set data */
		document.getElementById("amount-data").innerHTML = amountString;
		document.getElementById("pay-by").value = time.toLocaleDateString("en-US");
		document.getElementById("payment-details").value = paymentDescrip;
		document.getElementById("order-number").value = doc.id;
		
		if(doc.data().status != "paid"){
			
			/* save into storage */
			localStorage.setItem("latest-payment-id",doc.id);
			localStorage.setItem("latest-payment-amount",parseFloat(amount).toFixed(0));
			localStorage.setItem("latest-payment-amount-string",amountString);
			localStorage.setItem("latest-payment-descrip",paymentDescrip);
			
			console.log("latest-payment-id",doc.id);
			console.log("latest-payment-amount",amount);
			console.log("latest-payment-amount-string",amountString);
			console.log("latest-payment-descrip",paymentDescrip);

			$("#pay-now-button").click(() => {
				redirect("payment-method");
			});
		}
		else{
			$("#pay-now-button").click(() => {
				timed_toast("This bill has been paid","center");
			});
		}
	}).then(() => {
		payNowButton.disabled = false;
		app.preloader.hide();
	}).catch((err) => {
		timed_toast(err,"center");
		app.preloader.hide();
	});
}

/* Online Payment */
function online_payment_function(){
	app.preloader.show();
	const stripe = Stripe("pk_test_51HmpphAKsIRleTRbL8qxNUc97rkqnpYJRMpJ8JBry543rJ7PEXsv9vkr0JlqnjIK442Hb6c5IY7lcw7dall9vHs600xi3UqAyZ");
	var jsonString = { "amount": localStorage.getItem('latest-payment-amount') };
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
	
	online(JSON.stringify(jsonString)).then((result) => {
		// Read result of the Cloud Function.
		clientSecret = result.data;
		fpxButton.disabled = false;
		fpxButton.setAttribute("data-secret",clientSecret);
		localStorage.setItem('stripe_client_secret', clientSecret);
		app.preloader.hide();
	}).catch((error) => {
		// Getting the Error details.
		var code = error.code;
		var message = error.message;
		var details = error.details;
		
		timed_toast("An error has occured","center");
		fpxButton.disabled = true;
		// ...
		app.preloader.hide();
	});

	form.addEventListener('submit', function(event) {
	  event.preventDefault();
	  console.log(fpxBank);
	  localStorage.setItem("latest-payment-bank",fpxBank);
	  localStorage.setItem("latest-payment-secret",clientSecret);
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
	
	$('#online-payment-cancel-button').prop('onclick',null).off('click');
	$('#online-payment-cancel-button').click(() => {
		if(localStorage.getItem("latest-payment-descrip") == "Sauna"){
			db.collection("booking").doc(localStorage.getItem("latest-facility-document")).delete().then(() => {
				console.log("booking failed");
				/* Disply Payment Failed Page */
				redirect("payment-fail");
			}).catch((err) => {
				console.log(err);
			});
		}else
			redirect("home");
	});
}

/* Credit Payment */
function credit_payment_function(){
	app.preloader.show();
	const stripe = Stripe("pk_test_51HmpphAKsIRleTRbL8qxNUc97rkqnpYJRMpJ8JBry543rJ7PEXsv9vkr0JlqnjIK442Hb6c5IY7lcw7dall9vHs600xi3UqAyZ");
	
	var jsonString = {
	  data: {
		  currency: "myr",
		  amount: localStorage.getItem('latest-payment-amount')
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
		  document.getElementById("card-submit").disabled = event.empty;
		  document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
		});

		var form = document.getElementById("payment-form");
		form.addEventListener("submit", function(event) {
		  event.preventDefault();
		  payWithCard(stripe, card, data.data);
		});
		app.preloader.hide();
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
		  console.log(result);
		  localStorage.setItem("latest-payment-bank",null);
		  localStorage.setItem("latest-payment-secret",clientSecret);
		  
		  if (result.error) {
			localStorage.setItem("latest-payment-intent",result.error.payment_intent.id);
			showError(result.error.message);
			if(localStorage.getItem("latest-payment-descrip") == "Sauna"){
				db.collection("booking").doc(localStorage.getItem("latest-facility-document")).delete().then(() => {
					console.log("booking failed");
					/* Disply Payment Failed Page */
					redirect("payment-fail");
				}).catch((err) => {
					console.log(err);
				});
			}else{
				redirect("payment-fail");
			}
		  } else {
			alert("Complete");
			localStorage.setItem("latest-payment-intent",result.paymentIntent.id);
			orderComplete(result.paymentIntent.id);
			if(localStorage.getItem("latest-payment-descrip") == "Sauna"){
				db.collection("booking").doc(localStorage.getItem("latest-facility-document")).get().then((doc) => {
					if(doc.data().status == "pending"){
						console.log("booking is pending");
						db.collection("booking").doc(localStorage.getItem("latest-facility-document")).update({ status: "success" }).then(() => {
							console.log("booking success");
							/* Display Payment Success Page */
							redirect("payment-success");
						});
					}
				}).catch((err) => {
					console.log(err);
				});
			}else{
				redirect("payment-success");
			}
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
	  document.getElementById("card-submit").disabled = true;
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
		document.getElementById("card-submit").disabled = true;
		document.querySelector("#spinner").classList.remove("hidden");
		document.querySelector("#button-text").classList.add("hidden");
	  } else {
		document.getElementById("card-submit").disabled = false;
		document.querySelector("#spinner").classList.add("hidden");
		document.querySelector("#button-text").classList.remove("hidden");
	  }
	};
	
	$('#credit-payment-cancel-button').prop('onclick',null).off('click');
	$('#credit-payment-cancel-button').click(() => {
		if(localStorage.getItem("latest-payment-descrip") == "Sauna"){
			db.collection("booking").doc(localStorage.getItem("latest-facility-document")).delete().then(() => {
				console.log("booking failed");
				/* Disply Payment Failed Page */
				redirect("payment-fail");
			}).catch((err) => {
				console.log(err);
			});
		}else
			redirect("home");
	});
}

function saveSuccessPaymentDetails(){
	app.preloader.show();
	var user_id = auth.currentUser.uid;
	var time = new Date();
	time = time.getTime();
	
	db.collection("payment").doc(localStorage.getItem("latest-payment-intent")).set({
		status: "Successful",
		user_id: user_id,
		description: localStorage.getItem("latest-payment-descrip"),
		payment_id: localStorage.getItem("latest-payment-id"),
		amount: localStorage.getItem("latest-payment-amount"),
		time: time,
		bank: localStorage.getItem("latest-payment-bank")
	}).then(() => {
		if(localStorage.getItem("latest-payment-descrip") != "Sauna"){
			db.collection("billing").doc(localStorage.getItem("latest-payment-id")).update({ status: "paid" }).catch((err) => {
				console.log(err);
			});
		}
		app.preloader.hide();
	});
}

function saveFailPaymentDetails(){
	app.preloader.show();
	var user_id = auth.currentUser.uid;
	var time = new Date();
	time = time.getTime();
	
	db.collection("payment").doc(localStorage.getItem("latest-payment-intent")).set({
		status: "Failed",
		user_id: user_id,
		description: localStorage.getItem("latest-payment-descrip"),
		payment_id: localStorage.getItem("latest-payment-id"),
		amount: localStorage.getItem("latest-payment-amount"),
		time: time,
		bank: localStorage.getItem("latest-payment-bank")
	}).then(() => {
		app.preloader.hide();
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


/* Codes to Refer for notification - https://github.com/phonegap-build/PushPlugin/issues/213 */
//************************************  OUTSIDE DEVICE READY
// handle APNS notifications for iOS
/*function onNotificationAPN(e) {
	// storage the e.id value  (the extra value sent in push notification)
	window.localStorage.setItem("push_que", e.id);
	var push_que=e.id;
	// if the push notification is coming inline
	if (e.foreground=="1"){
		// storage the e.numero value  (the extra value sent in push notification)
		window.localStorage.setItem("push_que", e.id);
		var push_que=e.id;
		// some code here to open a message  if a new push is recieved inline
	}
	if ( event.alert ){
		navigator.notification.alert(event.alert);
	}
	if ( event.sound ){
		var snd = new Media(event.sound);
		snd.play();
	}
	if ( event.badge ){
		pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
	}
}

// handle GCM notifications for Android
function onNotificationGCM(e) {
	switch( e.event ){
		if (e.foreground){
			//  if the push is recieved inline
			//  storage the value of  playoad.id,  the extra value sent by push
			window.localStorage.setItem("push_que", e.payload.id);
			var push_que=e.payload.id;
		}
		else{
			// otherwise we were launched because the user touched a notification in the notification tray
			if (e.coldstart){
				//  storage the value of  playoad.numero, the extra value sent by push
				window.localStorage.setItem("push_que", e.payload.id);
			}
			else{
				//  storage the value of  playoad.numero, the extra value sent by push
				window.localStorage.setItem("push_que", e.payload.id);
			}
		}
		break;
		case 'error':
		break;
		default:
		break;
	}
}*/
//********************************** END OUTSIDE DEVICE READY