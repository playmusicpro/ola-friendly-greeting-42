import { useState, useEffect } from 'react';

// SECURITY WARNING: This is a client-side admin check using localStorage
// This is ONLY for demo/development purposes.
// In production, admin roles MUST be verified server-side using a proper
// authentication system with a secure user_roles table.
// See the security instructions for proper implementation with Supabase.

interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  adminEmail: string | null;
}

export const useAdmin = () => {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: true,
    adminEmail: null
  });

  useEffect(() => {
    // Check localStorage for admin status (DEMO ONLY - NOT SECURE)
    const checkAdminStatus = () => {
      try {
        const adminData = localStorage.getItem('playPro_admin');
        if (adminData) {
          const parsed = JSON.parse(adminData);
          setState({
            isAdmin: parsed.isAdmin === true,
            isLoading: false,
            adminEmail: parsed.email || null
          });
        } else {
          setState({
            isAdmin: false,
            isLoading: false,
            adminEmail: null
          });
        }
      } catch {
        setState({
          isAdmin: false,
          isLoading: false,
          adminEmail: null
        });
      }
    };

    checkAdminStatus();
  }, []);

  const setAdminStatus = (email: string, isAdmin: boolean) => {
    localStorage.setItem('playPro_admin', JSON.stringify({ email, isAdmin }));
    setState({
      isAdmin,
      isLoading: false,
      adminEmail: email
    });
  };

  const clearAdminStatus = () => {
    localStorage.removeItem('playPro_admin');
    setState({
      isAdmin: false,
      isLoading: false,
      adminEmail: null
    });
  };

  return {
    ...state,
    setAdminStatus,
    clearAdminStatus
  };
};

// Demo function to enable admin mode for testing
export const enableDemoAdminMode = () => {
  localStorage.setItem('playPro_admin', JSON.stringify({
    email: 'admin@playpro.com',
    isAdmin: true
  }));
  window.location.reload();
};

export const disableDemoAdminMode = () => {
  localStorage.removeItem('playPro_admin');
  window.location.reload();
};
