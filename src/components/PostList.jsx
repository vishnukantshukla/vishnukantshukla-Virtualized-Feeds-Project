import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchPosts } from "../api/posts";
import { debounce } from "lodash";
import { useNavigate } from "react-router";
import { useTheme } from "../context/ThemeContext";
import offlineStorage from "../utils/offlineStorage";

const PostList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  
  // Reference to the last post element for intersection observer
  const observer = useRef();
  const searchInputRef = useRef(null);
  const lastPostElementRef = useCallback(node => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Network status event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Reload posts when coming back online
      loadInitialPosts();
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial posts loading
  useEffect(() => {
    loadInitialPosts();
    
    // Focus the search input on component mount for better accessibility
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const loadInitialPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchPosts();
      
      // Simulating pagination - in a real app, you'd fetch posts by page from API
      const postsPerPage = 5;
      const initialPosts = data.slice(0, postsPerPage);
      
      setPosts(data); // Store all posts for filtering
      setFilteredPosts(initialPosts); // Show only first page initially
      setHasMore(initialPosts.length < data.length);
      
      // Save posts to IndexedDB for offline access
      if (!isOffline) {
        offlineStorage.savePosts(data);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Unable to load posts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load more posts for infinite scrolling
  const loadMorePosts = () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate API delay for more realistic behavior
    setTimeout(() => {
      const postsPerPage = 5;
      const startIndex = page * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      
      let nextPosts;
      if (searchTerm) {
        // If searching, filter from all posts
        const filtered = posts.filter((post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        nextPosts = filtered.slice(startIndex, endIndex);
        // Check if we've reached the end of filtered results
        setHasMore(endIndex < filtered.length);
      } else {
        // Otherwise, get next page from all posts
        nextPosts = posts.slice(startIndex, endIndex);
        // Check if we've reached the end of all posts
        setHasMore(endIndex < posts.length);
      }
      
      setFilteredPosts(prev => [...prev, ...nextPosts]);
      setPage(prevPage => prevPage + 1);
      setIsLoading(false);
    }, 800); // Simulated delay
  };

  const handleSearch = debounce((query) => {
    setSearchTerm(query);
    setPage(1); // Reset pagination when searching
    
    const filtered = query
      ? posts.filter((post) =>
          post.title.toLowerCase().includes(query.toLowerCase())
        )
      : posts.slice(0, 5); // Reset to first page when search is cleared
    
    setFilteredPosts(filtered);
    setHasMore(filtered.length < posts.length);
  }, 300);

  // Handle keyboard navigation
  const handleKeyDown = (e, postId) => {
    // Enter key navigates to post
    if (e.key === 'Enter') {
      navigate(`/post/${postId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Offline indicator */}
      {isOffline && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg flex items-center" role="status">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>You are currently offline. Some features may be limited.</span>
        </div>
      )}

      {/* Search input */}
      <div className="relative mb-8" role="search">
        <label htmlFor="search-posts" className="sr-only">Search posts</label>
        <input
          id="search-posts"
          ref={searchInputRef}
          type="text"
          className={`w-full p-4 pl-12 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            theme === "dark" 
              ? "bg-gray-800 border-gray-700 text-white" 
              : "bg-white border-gray-300 text-gray-900"
          }`}
          placeholder="Search posts..."
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search posts"
        />
        <svg
          className="absolute top-4 left-4 h-6 w-6 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Error state */}
      {error && (
        <div className={`text-center py-8 border rounded-xl ${
          theme === "dark" ? "bg-gray-800 border-gray-700 text-red-400" : "bg-white border-gray-200 text-red-600"
        }`} role="alert">
          <h3 className="text-xl font-medium mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={loadInitialPosts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            aria-label="Try again"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty search results */}
      {!error && filteredPosts.length === 0 && !isLoading ? (
        <div className={`text-center py-16 border rounded-xl ${
          theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"
        }`} role="status" aria-live="polite">
          <h3 className="text-xl font-medium mb-2">No posts found</h3>
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Try adjusting your search criteria
          </p>
        </div>
      ) : (
        <div role="feed" aria-label="Post feed" className="space-y-8">
          {filteredPosts.map((post, index) => {
            // Determine if this is the last element to observe for infinite scrolling
            const isLastElement = index === filteredPosts.length - 1;
            
            return (
              <article 
                key={post.id}
                ref={isLastElement ? lastPostElementRef : null}
                className={`rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] ${
                  theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
                }`}
                tabIndex="0"
                role="article"
                aria-labelledby={`post-title-${post.id}`}
                onKeyDown={(e) => handleKeyDown(e, post.id)}
                onClick={() => navigate(`/post/${post.id}`)}
              >
                {(post.type === "image" || post.type === "video") && (
                  <div className="w-full h-64 overflow-hidden">
                    {post.type === "image" ? (
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                    ) : (
                      <video
                        src={post.mediaUrl}
                        className="w-full h-full object-cover"
                        controls={false}
                        aria-label={`Video: ${post.title}`}
                      />
                    )}
                  </div>
                )}
                
                <div className="p-6">
                  <h3 
                    id={`post-title-${post.id}`}
                    className="text-xl font-bold mb-3 line-clamp-1"
                  >
                    {post.title}
                  </h3>
                  
                  <p className={`text-base mb-4 line-clamp-3 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {post.body}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      theme === "dark" 
                        ? "bg-gray-700 text-blue-300" 
                        : "bg-blue-50 text-blue-600"
                    }`}>
                      {post.type}
                    </span>
                    
                    <span className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-8" role="status" aria-live="polite">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                aria-label="Loading posts"
              ></div>
            </div>
          )}
          
          {/* End of list indicator */}
          {!hasMore && filteredPosts.length > 0 && (
            <div 
              className={`text-center py-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              role="status"
              aria-live="polite"
            >
              <p>No more posts to load</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostList;