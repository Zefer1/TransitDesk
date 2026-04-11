/** Centralized route path definitions. Prevents hardcoded path strings across the app. */
// Route constants below prevent path-string duplication in links and navigations.

// Feature groupings mirror sidebar/navigation structure for easier discoverability.
export const APP_ROUTES = {
  root: '/',
  services: '/services',
  newService: '/services/new',
  serviceDetail: '/services/:id',
  // Driver routes are grouped so feature navigation and redirects share one source of truth.
  drivers: '/drivers',
  newDriver: '/drivers/new',
  driverDetail: '/drivers/:id',
  editDriver: '/drivers/:id/edit',
  vehicles: '/vehicles',
  newVehicle: '/vehicles/new',
  vehicleDetail: '/vehicles/:id',
  editVehicle: '/vehicles/:id/edit',
  guides: '/guides',
  newGuide: '/guides/new',
  guideDetail: '/guides/:id',
  editGuide: '/guides/:id/edit',
  settings: '/settings',
  notFound: '*',
} as const;



