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

// Import main app component
import App from '../app.f7.html';

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
      calendar_init();
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

//initialize calendar
function calendar_init(){
	var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var calendarEvents = app.calendar.create({
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
	var stripe = document.createElement('script');
	stripe.src = "https://js.stripe.com/v3/";
	document.head.appendChild(stripe);
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

function online_payment_function(){
	var stripe = Stripe('pk_test_51HYjjzF4IJ8BHvcZASjHh7DzctvdHJn2u9kQma9CnPvTbLPoqKm2LeonLfIaoZ7crChlTVsqtADSXslC60JkH9i100nXYkuYni');
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
	var stripe = Stripe("pk_test_51HYjjzF4IJ8BHvcZASjHh7DzctvdHJn2u9kQma9CnPvTbLPoqKm2LeonLfIaoZ7crChlTVsqtADSXslC60JkH9i100nXYkuYni");

	var purchase = {
	  items: [{ id: "Bill" }]
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