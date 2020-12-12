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
    dateFormat: 'dd.mm.yyyy',
  },
  data:{ calendar: function(){
alert("hi");
var now = new Date();
var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
var weekLater = new Date().setDate(today.getDate() + 7);
var calendarEvents = app.calendar.create({
    minDate: new Date(),
    inputEl: '#calendar-events-disable',
    dateFormat: 'dd M yyyy',
    events: [
      {
        from: today,
        to: weekLater
      },
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
});}},
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
    },
  },
});