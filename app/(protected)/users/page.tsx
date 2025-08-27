'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';

interface User {
  _id: string;
  name: string;
  createdAt: string;
}

interface FollowStatus {
  [userId: string]: boolean;
}

const UserSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [followStatus, setFollowStatus] = useState<FollowStatus>({});
  const [followingUsers, setFollowingUsers] = useState<{ [userId: string]: boolean }>({});
  
  const { showAlert } = useAlert();
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Check follow status for multiple users
  const checkFollowStatus = async (userIds: string[]) => {
    try {
      const promises = userIds.map(async (userId) => {
        const response = await fetch(`/api/follow?targetUserId=${userId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return { userId, isFollowing: data.isFollowing };
        }
        return { userId, isFollowing: false };
      });

      const results = await Promise.all(promises);
      const statusMap: FollowStatus = {};
      results.forEach(({ userId, isFollowing }) => {
        statusMap[userId] = isFollowing;
      });
      setFollowStatus(statusMap);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const performSearch = async (query: string) => {
    setError('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: query.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedUsers = data.users || [];
        setUsers(fetchedUsers);
        setHasSearched(true);

        if (fetchedUsers.length > 0) {
          const userIds = fetchedUsers.map((user: User) => user._id);
          await checkFollowStatus(userIds);
        }
      } else {
        setError('Failed to search users');
      }
    } catch (err) {
      setError('An error occurred while searching');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string, currentlyFollowing: boolean) => {
    const action = currentlyFollowing ? 'unfollow' : 'follow';
    
    // Optimistic update
    setFollowingUsers(prev => ({ ...prev, [targetUserId]: true }));
    setFollowStatus(prev => ({ ...prev, [targetUserId]: !currentlyFollowing }));

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetUserId, action })
      });

      if (response.ok) {
        const data = await response.json();
        showAlert({ 
          type: 'success', 
          message: data.message 
        });
        setFollowStatus(prev => ({ ...prev, [targetUserId]: data.isFollowing }));
      } else {
        // Revert optimistic update
        console.error('Failed to update follow status:', response.statusText);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: currentlyFollowing }));
        showAlert({ type: 'error', message: 'Failed to update follow status' });
      }
    } catch (error) {
      // Revert optimistic update
      setFollowStatus(prev => ({ ...prev, [targetUserId]: currentlyFollowing }));
      showAlert({ type: 'error', message: 'Error updating follow status' });
      console.error('Follow error:', error);
    } finally {
      setFollowingUsers(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Handle input change with debouncing using useRef
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setLoading(true);
    
    // Clear existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timeout
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 200);
  };

  // Initial load effect to fetch first 20 users
  useEffect(() => {
    setLoading(true);
    performSearch('');
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Users</h1>
        <p className="text-gray-600">Find other users by name</p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            placeholder="Search by name..."
          />
        </div>
        {searchQuery ? (
          <p className="mt-2 text-sm text-gray-500">
            {loading ? 'Searching...' : `Showing results for "${searchQuery}"`}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            {loading && 'Loading users...'}
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <div className="space-y-4">
          {users.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {searchQuery && `Found ${users.length} user${users.length !== 1 ? 's' : ''}`}
                </h2>
                <span className="text-sm text-gray-500">
                  Search results
                </span>
              </div>
              
              <div className="grid gap-4">
                {users.map((user) => {
                  const isFollowing = followStatus[user._id] || false;
                  const isProcessing = followingUsers[user._id] || false;
                  
                  return (
                    <div
                      key={user._id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/users/${user._id}`}>
                            <button className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                              View Profile
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleFollow(user._id, isFollowing)}
                            disabled={isProcessing}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              isFollowing 
                                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                            }`}
                          >
                            {isProcessing ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                              </div>
                            ) : (
                              isFollowing ? 'Unfollow' : 'Follow'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery ? 'No users found' : 'No other users'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery && 'Try searching something else.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchPage;