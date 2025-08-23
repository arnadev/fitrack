'use client';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
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
    <button onClick={handleLogout}
    className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition duration-200 absolute bottom-4 right-4"
    >
    Logout
    </button>
  )
};

export default LogoutButton;
