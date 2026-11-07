import '../globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const metadata = {
  title: 'SmartX Admin',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return children;
}
