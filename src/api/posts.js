// src/api/posts.js
import axios from "axios";
import offlineStorage from '../utils/offlineStorage';

const PEXELS_API_KEY = "svdq9gkzwzRy7ef6x4oDci6GVeNp0OGceczIcDP0ugMb1pidURt6f6zb";
const PEXELS_API_URL = "https://api.pexels.com/v1";

// Check if we're online
const isOnline = () => navigator.onLine;

export const fetchPosts = async () => {
  try {
    if (isOnline()) {
      // If online, fetch from Pexels API
      try {
        const imagesResponse = await axios.get(`${PEXELS_API_URL}/search`, {
          headers: { Authorization: PEXELS_API_KEY },
          params: { query: "nature", per_page: 10 },
        });
        
        const videosResponse = await axios.get(`${PEXELS_API_URL}/videos/search`, {
          headers: { Authorization: PEXELS_API_KEY },
          params: { query: "nature", per_page: 10 },
        });
        
        const imagePosts = imagesResponse.data.photos.map(photo => ({
          id: photo.id,
          title: "Image Post",
          type: "image",
          mediaUrl: photo.src.medium,
          body: "A beautiful image from Pexels."
        }));
        
        const videoPosts = videosResponse.data.videos.map(video => ({
          id: video.id,
          title: "Video Post",
          type: "video",
          mediaUrl: video.video_files[0]?.link,
          body: "A stunning video from Pexels."
        }));
        
        const posts = [...imagePosts, ...videoPosts];
        
        // Save to IndexedDB for offline use
        await offlineStorage.savePosts(posts);
        
        return posts;
      } catch (apiError) {
        console.error("Error fetching from Pexels API:", apiError);
        throw apiError; // Rethrow to trigger IndexedDB fallback
      }
    } else {
      // If offline, get from IndexedDB
      console.log('Offline: Fetching posts from local storage');
      return await offlineStorage.getAllPosts();
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // Try to get from IndexedDB if fetch fails
    try {
      console.log('Trying to fetch from local storage after API error');
      const localPosts = await offlineStorage.getAllPosts();
      if (localPosts && localPosts.length > 0) {
        return localPosts;
      }
    } catch (localError) {
      console.error('Error fetching from local storage:', localError);
    }
    
    // If both fail, create mock data for demonstration purposes
    console.log('Creating fallback data');
    return generateFallbackPosts();
  }
};

export const fetchPostById = async (id) => {
  try {
    if (isOnline()) {
      // Try to get from IndexedDB first (if we've already fetched this post)
      const cachedPost = await offlineStorage.getPostById(id);
      if (cachedPost) {
        return cachedPost;
      }
      
      // If not in IndexedDB and we're online, we could try to fetch just this post
      // Note: Pexels API doesn't have a direct endpoint for a single media by ID
      // so we would need to modify this logic for a real API
      
      // For now, let's fetch all posts and find the right one
      const allPosts = await fetchPosts();
      const post = allPosts.find(post => post.id.toString() === id.toString());
      
      if (post) {
        return post;
      }
      
      throw new Error("Post not found");
    } else {
      // If offline, get from IndexedDB
      console.log('Offline: Fetching post from local storage');
      const post = await offlineStorage.getPostById(id);
      if (post) {
        return post;
      }
      throw new Error("Post not available offline");
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    
    // Try to get from IndexedDB if fetch fails
    try {
      const localPost = await offlineStorage.getPostById(id);
      if (localPost) {
        return localPost;
      }
    } catch (localError) {
      console.error('Error fetching from local storage:', localError);
    }
    
    throw new Error('Post not available offline');
  }
};

// Generate fallback posts for demonstration or initial state
function generateFallbackPosts() {
  return [
    {
      id: 1,
      title: "Offline Post 1",
      body: "This is a fallback post that appears when you're offline and no cached posts are available.",
      type: "text",
      mediaUrl: null
    },
    {
      id: 2,
      title: "How Offline Support Works",
      body: "We use IndexedDB to store posts you've viewed, so you can access them even without an internet connection.",
      type: "text",
      mediaUrl: null
    },
    {
      id: 3,
      title: "Connection Status",
      body: "You appear to be offline at the moment. When your connection resumes, we'll fetch the latest posts automatically.",
      type: "text",
      mediaUrl: null
    }
  ];
}
