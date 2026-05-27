import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeProvider';
import { AppRoutes } from './layout/AppRoutes';

function App() {
	return (
		<BrowserRouter>
			<ToastProvider>
				<ThemeProvider>
					<AppRoutes />
				</ThemeProvider>
			</ToastProvider>
		</BrowserRouter>
	);
}

export default App;




