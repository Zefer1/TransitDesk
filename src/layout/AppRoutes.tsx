/** React Router configuration. Maps URL paths to page components for all features. */
import { Navigate, Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from '../constants/routes';
import { DriversListPage } from '../features/drivers/pages/DriversListPage';
import { DriverCreatePage } from '../features/drivers/pages/DriverCreatePage';
import { DriverDetailPage } from '../features/drivers/pages/DriverDetailPage';
import { GuidesListPage } from '../features/guides/pages/GuidesListPage';
import { GuideCreatePage } from '../features/guides/pages/GuideCreatePage';
import { GuideDetailPage } from '../features/guides/pages/GuideDetailPage';
import { CreateServicePage } from '../features/services/pages/CreateServicePage';
import { ServiceDetailPage } from '../features/services/pages/ServiceDetailPage';
import { ServicesListPage } from '../features/services/pages/ServicesListPage';
import { VehiclesListPage } from '../features/vehicles/pages/VehiclesListPage';
import { VehicleCreatePage } from '../features/vehicles/pages/VehicleCreatePage';
import { VehicleDetailPage } from '../features/vehicles/pages/VehicleDetailPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SettingsPage } from '../pages/SettingsPage';

// Route table below defines module entry points and fallback redirects.

export function AppRoutes() {
  return (
    <Routes>
      <Route path={APP_ROUTES.root} element={<Navigate to={APP_ROUTES.services} replace />} />
      <Route path={APP_ROUTES.services} element={<ServicesListPage />} />
      <Route path={APP_ROUTES.serviceDetail} element={<ServiceDetailPage />} />
      <Route path={APP_ROUTES.newService} element={<CreateServicePage />} />

      <Route path={APP_ROUTES.drivers} element={<DriversListPage />} />
      <Route path={APP_ROUTES.newDriver} element={<DriverCreatePage />} />
      <Route path={APP_ROUTES.driverDetail} element={<DriverDetailPage />} />

      <Route path={APP_ROUTES.vehicles} element={<VehiclesListPage />} />
      <Route path={APP_ROUTES.newVehicle} element={<VehicleCreatePage />} />
      <Route path={APP_ROUTES.vehicleDetail} element={<VehicleDetailPage />} />

      <Route path={APP_ROUTES.guides} element={<GuidesListPage />} />
      <Route path={APP_ROUTES.newGuide} element={<GuideCreatePage />} />
      <Route path={APP_ROUTES.guideDetail} element={<GuideDetailPage />} />

      <Route path={APP_ROUTES.settings} element={<SettingsPage />} />

      <Route path={APP_ROUTES.notFound} element={<NotFoundPage />} />
    </Routes>
  );
}



