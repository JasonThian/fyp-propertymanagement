import LoginPage from '../pages/login.f7.html';
import HomePage from '../pages/home.f7.html';
import FormPage from '../pages/form.f7.html';
import NewsPage from '../pages/news.f7.html';
import AnnouncementPage from '../pages/announcement.f7.html';
import FacilitiesPage from '../pages/facilities.f7.html';
import QRCodePage from '../pages/qrcode.f7.html';
import PaymentPage from '../pages/payment.f7.html';
import PaymentMethodPage from '../pages/paymentmethod.f7.html';
import PaymentOnlinePage from '../pages/paymentonline.f7.html';
import PaymentCreditPage from '../pages/paymentcredit.f7.html';
import EditPage from '../pages/edit.f7.html';
import BookingSuccessPage from '../pages/bookingsuccess.f7.html';
import BookingDetailPage from '../pages/bookingdetail.f7.html';
import BookFacilityPage from '../pages/bookfacility.f7.html';
import PaymentHistoryPage from '../pages/paymenthistory.f7.html';
import PaymentReminderPage from '../pages/paymentreminder.f7.html';
import TenantListPage from '../pages/tenantlist.f7.html';



import DynamicRoutePage from '../pages/dynamic-route.f7.html';
import RequestAndLoad from '../pages/request-and-load.f7.html';
import NotFoundPage from '../pages/404.f7.html';

var routes = [
  {
	name: "home",
    path: '/',
    component: HomePage,
  },
  {
    path: '/form/',
    component: FormPage,
  },
  {
    path: '/news/',
    component: NewsPage,
  },
  {
	name: "facilities",
    path: '/facilities/',
    component: FacilitiesPage,
  },
  {
    path: '/bookfacility/',
    component: BookFacilityPage,
  },
  {
    path: '/qrcode/',
    component: QRCodePage,
  },
  {
    path: '/payment/',
    component: PaymentPage,
  },
  {
    path: '/paymentmethod/',
    component: PaymentMethodPage,
  },
  {
    path: '/edit/',
    component: EditPage,
  },
  {
	name: "bookingsuccess",
    path: '/bookingsuccess/',
    component: BookingSuccessPage,
  },
  {
    path: '/announcement/',
    component: AnnouncementPage,
  },
  {
    path: '/paymentonline/',
    component: PaymentOnlinePage,
  },
  {
    path: '/paymentcredit/',
    component: PaymentCreditPage,
  },
  {
	name: "login",
    path: '/login/',
    component: LoginPage,
  },
  {
    path: '/paymentreminder/',
    component: PaymentReminderPage,
  },
  {
    path: '/paymenthistory/',
    component: PaymentHistoryPage,
  },
  {
    path: '/bookingdetail/',
    component: BookingDetailPage,
  },
  {
    path: '/tenantlist/',
    component: TenantListPage,
  },

  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function (routeTo, routeFrom, resolve, reject) {
      // Router instance
      var router = this;

      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = routeTo.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            component: RequestAndLoad,
          },
          {
            context: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;