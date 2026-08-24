import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { TenantProvider } from '@/features/tenant/';
import { AuthProvider } from '@/features/auth';
import { ProfileProvider } from '@/features/profile';

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <ProfileProvider>
            {children}

            <Toaster position="top-right" />
          </ProfileProvider>
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}
