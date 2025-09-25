import { useEffect } from 'react';
import AppRouter from './routes';
import { useAuthStore } from './store/authStore';
import './App.css';

function App() {
  // const { user, token } = useAuthStore();

  useEffect(() => {
    // Khởi tạo auth từ localStorage khi load app
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser && storedToken) {
      useAuthStore.setState({
        user: JSON.parse(storedUser),
        token: storedToken,
      });
    }
  }, []);

  return <AppRouter />;
}

export default App;
