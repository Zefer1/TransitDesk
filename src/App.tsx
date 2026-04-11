import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeProvider';
import { AppLayout } from './layout/AppLayout';
import { AppHeader } from './layout/AppHeader';
import { AppRoutes } from './layout/AppRoutes';

function App() {
	return (
		<BrowserRouter>
			<ToastProvider>
				<ThemeProvider>
					<AppLayout header={<AppHeader />}>
						<AppRoutes />
					</AppLayout>
				</ThemeProvider>
			</ToastProvider>
		</BrowserRouter>
	);
}

export default App;




