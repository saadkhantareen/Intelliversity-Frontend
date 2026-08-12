import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { TenantProvider } from '@/features/tenant/context/TenantContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProfileProvider } from '@/features/profile/context/ProfileContext';

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