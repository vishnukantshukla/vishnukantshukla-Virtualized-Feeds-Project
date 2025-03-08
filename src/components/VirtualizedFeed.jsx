import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const VirtualizedFeed = ({ 
  initialPosts = [], 
  fetchNextPage, 
  hasNextPage = true,
  isLoading,
  scrollPosition, 
  setScrollPosition 
}) => {
  const parentRef = useRef(null);
  const [posts, setPosts] = useState(initialPosts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  
  // Update posts when initialPosts changes
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Restore scroll position
  useEffect(() => {
    if (scrollPosition && parentRef.current) {
      parentRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Set up virtualizer
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? posts.length + 1 : posts.length, // +1 for loading row
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      // Different sizes for different post types
      if (index >= posts.length) return 80; // Loading row size
      const post = posts[index];
      
      switch (post.type) {
        case 'image': return 280;
        case 'video': return 320;
        default: return 200;
      }
    },
    overscan: 5, // Pre-render additional items for smoother scrolling
  });

  // Infinite scroll logic
  const loadMoreItems = useCallback(async () => {
    if (!hasNextPage || loadingMore || isLoading) return;
    
    try {
      setLoadingMore(true);
      setError(null);
      const newPosts = await fetchNextPage();
      setPosts(prev => [...prev, ...newPosts]);
    } catch (err) {
      console.error('Failed to fetch more posts:', err);
      setError('Failed to load more posts. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  }, [fetchNextPage, hasNextPage, loadingMore, isLoading]);

  // Check if we need to load more items
  const lastVirtualItem = rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1];
  
  useEffect(() => {
    if (!lastVirtualItem) return;
    
    // If we're getting close to the end of the list, load more
    const isLastItem = lastVirtualItem.index >= posts.length - 3;
    if (isLastItem && hasNextPage && !loadingMore && !isLoading) {
      loadMoreItems();
    }
  }, [lastVirtualItem, posts.length, hasNextPage, loadingMore, isLoading, loadMoreItems]);

  // Track scroll position
  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollTop);
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className={`flex justify-center items-center h-screen ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`h-screen overflow-auto ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          // If this is the loading row
          if (virtualRow.index >= posts.length) {
            return (
              <div
                key="loading-more"
                className={`absolute w-full flex justify-center items-center px-4 py-6 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {hasNextPage && (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      Loading more posts...
                    </p>
                  </div>
                )}
                {!hasNextPage && (
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    You've reached the end of the feed 🎉
                  </p>
                )}
                {error && (
                  <div className="text-center">
                    <p className="text-red-500 mb-2">{error}</p>
                    <button
                      onClick={loadMoreItems}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            );
          }

          const post = posts[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              className={`absolute top-0 left-0 w-full transform transition-transform duration-200 ${
                theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <Link
                to={`/post/${post.id}`}
                state={{ post }}
                className={`block h-full no-underline ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}
              >
                <article className={`h-full p-4 border-b ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}>
                  {post.type === 'text' && <TextPost post={post} theme={theme} />}
                  {post.type === 'image' && <ImagePost post={post} theme={theme} />}
                  {post.type === 'video' && <VideoPost post={post} theme={theme} />}
                </article>
              </Link>
            </div>
          );
        })}
      </div>
      
      {/* Error notification - shown outside of virtualized area for persistent visibility */}
      {error && posts.length === 0 && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <p>{error}</p>
          <button 
            onClick={loadMoreItems}
            className="mt-2 bg-white text-red-500 px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

// Post components with improved styling
const TextPost = ({ post, theme }) => (
  <div className="h-full flex flex-col">
    <h3 className="text-lg font-bold mb-2">{post.title}</h3>
    <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} line-clamp-3`}>
      {post.content}
    </p>
    <div className="mt-auto pt-2 flex justify-between items-center">
      <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        {new Date(post.timestamp || Date.now()).toLocaleString()}
      </span>
      <span className={`px-2 py-1 text-xs rounded ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      }`}>
        Text
      </span>
    </div>
  </div>
);

const ImagePost = ({ post, theme }) => (
  <div className="h-full flex flex-col">
    <h3 className="text-lg font-bold mb-2">{post.title}</h3>
    <div className="relative overflow-hidden rounded-lg flex-grow mb-2">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <img 
          src={post.url} 
          alt={post.title} 
          className="object-cover w-full h-full" 
          loading="lazy" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x225?text=Image+Not+Available';
          }}
        />
      </div>
    </div>
    <div className="mt-auto pt-2 flex justify-between items-center">
      <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        {new Date(post.timestamp || Date.now()).toLocaleString()}
      </span>
      <span className={`px-2 py-1 text-xs rounded ${
        theme === "dark" ? "bg-indigo-700 text-indigo-100" : "bg-indigo-100 text-indigo-800"
      }`}>
        Image
      </span>
    </div>
  </div>
);

const VideoPost = ({ post, theme }) => (
  <div className="h-full flex flex-col">
    <h3 className="text-lg font-bold mb-2">{post.title}</h3>
    <div className="relative overflow-hidden rounded-lg flex-grow mb-2">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <video 
          src={post.url} 
          className="object-cover w-full h-full" 
          preload="metadata"
          poster={post.thumbnail || 'https://via.placeholder.com/400x225?text=Video'}
          onError={(e) => {
            e.target.onerror = null;
            e.target.parentNode.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-800"><p class="text-white">Video unavailable</p></div>';
          }}
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            theme === "dark" ? "bg-gray-800 bg-opacity-70" : "bg-white bg-opacity-70"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
              className={`w-8 h-8 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-auto pt-2 flex justify-between items-center">
      <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        {new Date(post.timestamp || Date.now()).toLocaleString()}
      </span>
      <span className={`px-2 py-1 text-xs rounded ${
        theme === "dark" ? "bg-red-700 text-red-100" : "bg-red-100 text-red-800"
      }`}>
        Video
      </span>
    </div>
  </div>
);

export default VirtualizedFeed;