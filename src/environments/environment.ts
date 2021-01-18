// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  cartLS: 'cart',
  accessToken: 'token',
  picturesUrl: '//api.columnis.com/uploads/065/images/thumbs',
  ordersUrl: '//api.columnis.com/065/ecommerce/orders',
  meUrl: '//api.columnis.com/065/columnis/me',
  addressesUrl: '//api.columnis.com/065/columnis/user/addresses',
  cardsUrl: '//api.columnis.com/065/ecommerce/1/users-cards'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
