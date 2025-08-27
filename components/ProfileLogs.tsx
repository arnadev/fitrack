'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';

interface LogEntry {
  entry: string;
  timeStamp: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const ProfileLogs = ({ userId, isOwner = false }: { userId: string; isOwner?: boolean }) => {
  const router = useRouter();
  const { showConfirm, showAlert } = useAlert();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const [newEntry, setNewEntry] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async (page = 1, append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await fetch(`/api/logs?userId=${userId}&page=${page}&limit=${pagination.limit}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (append) {
          setLogs(prev => [...prev, ...data.logs]);
        } else {
          setLogs(data.logs);
        }
        
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      if (!append) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const loadMoreLogs = () => {
    if (pagination.hasMore && !isLoadingMore) {
      fetchLogs(pagination.page + 1, true);
    }
  };

  const handleAddLog = async () => {
    if (!newEntry.trim()) {
      showAlert({ type: 'warning', message: 'Log entry cannot be empty' });
      return;
    }

    if (newEntry.trim().length > 1000) {
      showAlert({ type: 'warning', message: 'Log entry must be 1000 characters or less' });
      return;
    }

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          entry: newEntry.trim()
        }),
      });

      if (response.ok) {
        setNewEntry('');
        showAlert({ type: 'success', message: 'Log added successfully' });
        router.refresh();
        // Reset to first page after adding new log
        fetchLogs(1, false);
      } else {
        showAlert({ type: 'error', message: 'Failed to add log' });
      }
    } catch (error) {
      console.error('Error adding log:', error);
      showAlert({ type: 'error', message: 'Error adding log' });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddLog();
    }
  };

  const handleEditKeyPress = (e: KeyboardEvent<HTMLInputElement>, timeStamp: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(timeStamp);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const startEdit = (index: number, currentEntry: string) => {
    setEditingIndex(index);
    setEditingValue(currentEntry);
  };

  const handleSaveEdit = async (timeStamp: string) => {
    if (!editingValue.trim()) {
      showAlert({ type: 'warning', message: 'Log entry cannot be empty' });
      return;
    }

    if (editingValue.trim().length > 1000) {
      showAlert({ type: 'warning', message: 'Log entry must be 1000 characters or less' });
      return;
    }

    try {
      const response = await fetch('/api/logs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          timeStamp,
          newEntry: editingValue.trim()
        }),
      });

      if (response.ok) {
        setEditingIndex(null);
        setEditingValue('');
        showAlert({ type: 'success', message: 'Log updated successfully' });
        router.refresh();
        // Refresh current page after editing
        fetchLogs(pagination.page, false);
      } else {
        showAlert({ type: 'error', message: 'Failed to update log' });
      }
    } catch (error) {
      console.error('Error updating log:', error);
      showAlert({ type: 'error', message: 'Error updating log' });
    }
  };

  const handleDelete = async (timeStamp: string) => {
    showConfirm(
      'Are you sure you want to delete this log?',
      async () => {
        try {
          const response = await fetch('/api/logs', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              timeStamp
            }),
          });

          if (response.ok) {
            showAlert({ type: 'success', message: 'Log deleted successfully' });
            router.refresh();
            // Check if we need to go back a page if current page becomes empty
            const currentPageWillBeEmpty = logs.length === 1 && pagination.page > 1;
            const targetPage = currentPageWillBeEmpty ? pagination.page - 1 : pagination.page;
            fetchLogs(targetPage, false);
          } else {
            showAlert({ type: 'error', message: 'Failed to delete log' });
          }
        } catch (error) {
          console.error('Error deleting log:', error);
          showAlert({ type: 'error', message: 'Error deleting log' });
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Format the time once (no seconds, 12-hour with AM/PM)
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffDays === 1) {
      return `Today | ${timeString}`;
    } else if (diffDays === 2) {
      return `Yesterday | ${timeString}`;
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago | ${timeString}`;
    } else {
      return (
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        }) + ` | ${timeString}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Fitness Logs</h2>
          </div>
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Fitness Logs</h2>
          
          {/* Add New Log Input */}
          {isOwner && (
            <div className="flex items-center space-x-3">
              <input
                ref={inputRef}
                type="text"
                maxLength={1000}
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your fitness log and press Enter..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleAddLog}
                disabled={!newEntry.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Add Log
              </button>
            </div>
          )}
        </div>

        {/* Logs List */}
        <div className="p-6">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logs yet</h3>
              <p className="text-gray-500">{isOwner ? `Start by adding your first fitness log above!` : `No fitness logs available.`}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div
                  key={`${log.timeStamp}-${index}`}
                  className="group flex items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 mr-2 sm:mr-4">
                    {isOwner && editingIndex === index ? (
                      <input
                        type="text"
                        maxLength={1000}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => handleEditKeyPress(e, log.timeStamp)}
                        onBlur={() => handleSaveEdit(log.timeStamp)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-gray-900 flex-1 pr-2">{log.entry}</p>
                        <div className="text-xs text-gray-500 whitespace-nowrap flex flex-col sm:text-sm lg:text-right">
                          <span>{formatDate(log.timeStamp).split(' | ')[0]}</span>
                          <span className="text-gray-400">{formatDate(log.timeStamp).split(' | ')[1]}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons*/}
                  {isOwner && (
                    <div className="flex items-start space-x-1 sm:space-x-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity mt-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEdit(index, log.entry);
                        }}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        title="Edit log"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(log.timeStamp);
                        }}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        title="Delete log"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Load More Button and Pagination Info */}
          {logs.length > 0 && (
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500 mb-4">
                Showing {logs.length} of {pagination.total} logs
              </div>
              
              {pagination.hasMore && (
                <button
                  onClick={loadMoreLogs}
                  disabled={isLoadingMore}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Load More Logs
                    </>
                  )}
                </button>
              )}
              
              {!pagination.hasMore && pagination.total > pagination.limit && (
                <div className="text-sm text-gray-400">
                  All logs loaded
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLogs;
