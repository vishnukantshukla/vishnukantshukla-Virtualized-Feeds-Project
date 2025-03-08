import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostById } from "../api/posts";
import { useTheme } from "../context/ThemeContext";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { theme } = useTheme();

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPostById(parseInt(id));
        setPost(data);
        setError(null);
      } catch (error) {
        console.error("Error loading post:", error);
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPost();
    
    // Set up event listeners for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={`text-center py-16 border rounded-xl max-w-3xl mx-auto ${
        theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"
      }`}>
        <h3 className="text-2xl font-medium mb-4">Post not found</h3>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-6`}>
          {error || "The post you're looking for doesn't exist or has been removed"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-3xl mx-auto px-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
      {!isOnline && (
        <div className={`mb-6 p-4 rounded-lg ${
          theme === "dark" 
            ? "bg-yellow-900/30 text-yellow-200" 
            : "bg-yellow-100 text-yellow-800"
        }`}>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>You are currently offline. Showing cached content.</span>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className={`mb-8 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
          theme === "dark"
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back
      </button>

      <div className={`rounded-xl overflow-hidden shadow-lg ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        {post.type === "image" && post.mediaUrl && (
          <div className="w-full h-96 overflow-hidden">
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {post.type === "video" && post.mediaUrl && (
          <div className="w-full">
            <video
              src={post.mediaUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-auto max-h-[500px]"
            />
          </div>
        )}
        
        {(!post.mediaUrl || (post.type !== "image" && post.type !== "video")) && (
          <div className="h-48 flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
            <span className="text-white font-bold text-xl">{post.title}</span>
          </div>
        )}

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center mb-6">
            <span className={`text-sm px-3 py-1 rounded-full ${
              theme === "dark" 
                ? "bg-gray-700 text-blue-300" 
                : "bg-blue-50 text-blue-600"
            }`}>
              {post.type}
            </span>
            <span className={`ml-3 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="mt-6">
            <p className={`text-lg leading-relaxed ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              {post.body}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate("/")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Back to All Posts
        </button>
        
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-blue-300"
                : "bg-blue-50 hover:bg-blue-100 text-blue-600"
            }`}
            disabled={!isOnline}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
            Share
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-blue-300"
                : "bg-blue-50 hover:bg-blue-100 text-blue-600"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
