// Route constants below prevent path-string duplication in links and navigations.
export const APP_ROUTES = {
  root: '/',
  services: '/services',
  newService: '/services/new',
  serviceDetail: '/services/:id',
  drivers: '/drivers',
  newDriver: '/drivers/new',
  driverDetail: '/drivers/:id',
  vehicles: '/vehicles',
  newVehicle: '/vehicles/new',
  vehicleDetail: '/vehicles/:id',
  guides: '/guides',
  newGuide: '/guides/new',
  guideDetail: '/guides/:id',
  settings: '/settings',
  login: '/login',
  notFound: '*',
} as const;
