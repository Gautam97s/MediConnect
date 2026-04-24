import '../styles/globals.css';
import { AuthProvider } from '../features/auth/context/AuthContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
