'use client';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {      
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
      });

      if (response.ok) {
        console.log('Logout successful');
        // Redirect to login page
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return(
    <button
      onClick={handleLogout}
      className="text-gray-700 hover:text-gray-900 cursor-pointer"
    >
      Logout
    </button>
  )
};

export default LogoutButton;
