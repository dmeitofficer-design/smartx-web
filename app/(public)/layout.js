// path: app/(public)/layout.js
import { ScrollToTop } from '../components/ScrollToTop'; // adjust path
import { Breadcrumb } from '../components/Breadcrumb';

export default function PublicGroupLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Breadcrumb />
      {children}
    </>
  );
}