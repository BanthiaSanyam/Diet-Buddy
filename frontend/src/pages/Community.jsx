import { useState, useEffect, useRef } from 'react';
import useApi from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const Community = () => {
  const api = useApi();
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ content: '', images: [] });
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // Default to 'all' posts view
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null); // {postId, commentId}
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    fetchPosts();
  }, [isAuthenticated, activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Get all posts regardless of authentication status
      const data = await api.getAllPosts();
      
      if (isAuthenticated && activeTab === 'my') {
        // If user is logged in and viewing "My Posts", filter for user's posts
        setPosts(data.filter(post => post.user._id === user?._id));
      } else {
        // Otherwise show all posts (for both authenticated and non-authenticated users)
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]); // Set empty array instead of dummy posts to connect to real database
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim() && newPost.images.length === 0) return;

    try {
      setLoading(true);
      const createdPost = await api.createPost(newPost);
      setPosts(prevPosts => [createdPost, ...prevPosts]);
      setNewPost({ content: '', images: [] });
      setPreviewImages([]);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Process and upload each file
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          setUploadingImage(true);
          
          // Add to preview first
          const previewUrl = reader.result;
          setPreviewImages(prev => [...prev, previewUrl]);
          
          // Upload to server
          const response = await api.uploadImage(previewUrl);
          
          // Add the returned image URL to the post
          setNewPost(prev => ({
            ...prev,
            images: [...prev.images, response.imageUrl]
          }));
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the file input
    e.target.value = '';
  };

  const removePreviewImage = (index) => {
    // Remove from preview
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // Remove from post images
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      alert('Please log in to like posts');
      return;
    }
    
    try {
      // Find the post in the state to update optimistically
      const postIndex = posts.findIndex(post => post._id === postId);
      if (postIndex === -1) return;
      
      // Check if user already liked the post
      const post = posts[postIndex];
      const userHasLiked = post.likes?.some(like => like.user === user?._id);
      
      // Update UI optimistically
      const updatedPosts = [...posts];
      if (userHasLiked) {
        // Remove like
        updatedPosts[postIndex].likes = post.likes.filter(like => like.user !== user?._id);
      } else {
        // Add like
        updatedPosts[postIndex].likes = [...(post.likes || []), { user: user?._id, date: new Date() }];
      }
      setPosts(updatedPosts);
      
      // Make API call
      const result = await api.likePost(postId);
      
      // Update with server response to ensure accuracy
      setPosts(prevPosts => prevPosts.map(p => 
        p._id === postId ? { ...p, likes: result.likes } : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      // Refresh posts to ensure accuracy
      fetchPosts();
    }
  };

  const handleCommentSubmit = async (postId, parentCommentId = null) => {
    if (!isAuthenticated) {
      return;
    }
    
    // Get the appropriate content based on whether this is a reply or top-level comment
    const content = parentCommentId ? replyInputs[`${postId}-${parentCommentId}`] : commentInputs[postId];
    
    if (!content || !content.trim()) return;

    try {
      // Use the updated API call with JSON content
      const updatedPost = await api.commentOnPost(postId, { 
        content, 
        parentCommentId 
      });
      
      // Update the post with new comments
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === postId ? updatedPost : post
      ));
      
      // Clear the comment input
      if (parentCommentId) {
        setReplyInputs({
          ...replyInputs,
          [`${postId}-${parentCommentId}`]: ''
        });
        setReplyingTo(null);
      } else {
        setCommentInputs({
          ...commentInputs,
          [postId]: ''
        });
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const startReply = (postId, commentId) => {
    setReplyingTo({ postId, commentId });
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const renderComments = (post) => {
    if (!post.comments || post.comments.length === 0) {
      return null;
    }

    // Group comments by parent-child relationship
    const topLevelComments = post.comments.filter(comment => !comment.parentCommentId);
    const commentReplies = post.comments.filter(comment => comment.parentCommentId);
    
    const getCommentReplies = (commentId) => {
      return commentReplies.filter(reply => reply.parentCommentId === commentId);
    };
    
    return (
      <div className="mb-4 border-b border-[var(--color-dark)] pb-2">
        <h4 className="font-medium mb-2">Comments</h4>
        <div className="space-y-3">
          {topLevelComments.map((comment) => (
            <div key={comment._id} className="border-l-2 border-[var(--color-dark-alt)] pl-2">
              <div className="flex">
                <img 
                  src={comment.user?.profileImage || 'https://via.placeholder.com/30'} 
                  alt={comment.user?.name} 
                  className="w-8 h-8 rounded-full mr-2 mt-1"
                />
                <div className="bg-[var(--color-dark)] rounded-lg p-3 flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{comment.user?.name}</p>
                    <p className="text-[var(--color-light-alt)] text-xs">{new Date(comment.date).toLocaleString()}</p>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                  
                  {isAuthenticated && (
                    <button 
                      onClick={() => startReply(post._id, comment._id)}
                      className="text-[var(--color-accent)] text-xs mt-2 hover:underline"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>
              
              {/* Render replies */}
              {getCommentReplies(comment._id).length > 0 && (
                <div className="pl-8 mt-2 space-y-2">
                  {getCommentReplies(comment._id).map((reply) => (
                    <div key={reply._id} className="flex">
                      <img 
                        src={reply.user?.profileImage || 'https://via.placeholder.com/24'} 
                        alt={reply.user?.name} 
                        className="w-6 h-6 rounded-full mr-2 mt-1"
                      />
                      <div className="bg-[var(--color-dark)] rounded-lg p-2 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-xs">{reply.user?.name}</p>
                          <p className="text-[var(--color-light-alt)] text-xs">{new Date(reply.date).toLocaleString()}</p>
                        </div>
                        <p className="text-xs mt-1">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reply input */}
              {replyingTo && replyingTo.postId === post._id && replyingTo.commentId === comment._id && (
                <div className="pl-8 mt-2 flex">
                  <img 
                    src={user?.profileImage || 'https://via.placeholder.com/24'} 
                    alt={user?.name} 
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <div className="flex-1 flex">
                    <input
                      type="text"
                      value={replyInputs[`${post._id}-${comment._id}`] || ''}
                      onChange={(e) => setReplyInputs({
                        ...replyInputs,
                        [`${post._id}-${comment._id}`]: e.target.value
                      })}
                      placeholder="Reply to this comment..."
                      className="flex-1 border rounded-l-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] bg-[var(--color-dark)] text-[var(--color-light)]"
                    />
                    <div className="flex">
                      <button
                        onClick={() => handleCommentSubmit(post._id, comment._id)}
                        disabled={!replyInputs[`${post._id}-${comment._id}`]?.trim()}
                        className="bg-[var(--color-accent)] text-[var(--color-dark)] px-2 py-1 text-sm hover:bg-[var(--color-accent-light)] transition"
                      >
                        Reply
                      </button>
                      <button
                        onClick={cancelReply}
                        className="bg-[var(--color-dark-alt)] text-[var(--color-light)] px-2 py-1 rounded-r-md text-sm hover:bg-[var(--color-dark)] transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 bg-[var(--color-dark)]">
        <h1 className="text-3xl font-bold mb-6 text-[var(--color-light)]">Community</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20 bg-[var(--color-dark)] text-[var(--color-light)]">
      <h1 className="text-3xl font-bold mb-6">Community</h1>
      
      {!isAuthenticated && (
        <div className="bg-[var(--color-primary)] bg-opacity-20 border-l-4 border-[var(--color-primary)] text-[var(--color-light)] p-4 mb-6 rounded">
          <p>Please <a href="/login" className="font-bold underline text-[var(--color-accent)]">log in</a> to interact with the community.</p>
        </div>
      )}
      
      {isAuthenticated && (
        <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Share Your Journey</h2>
          <form onSubmit={handlePostSubmit}>
            <div className="mb-4">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-[var(--color-dark)] text-[var(--color-light)]"
                placeholder="What's on your fitness mind?"
                rows="3"
              ></textarea>
            </div>
            
            {/* Image preview area */}
            {previewImages.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {previewImages.map((url, index) => (
                  <div key={index} className="relative inline-block">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removePreviewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingImage}
                  className="text-[var(--color-accent)] hover:text-[var(--color-accent-light)] flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploadingImage ? 'Uploading...' : 'Add Photo'}
                </button>
              </div>
              <button
                type="submit"
                className="bg-[var(--color-accent)] text-[var(--color-dark)] py-2 px-4 rounded-md hover:bg-[var(--color-accent-light)] transition"
                disabled={(!newPost.content.trim() && newPost.images.length === 0) || uploadingImage}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
      
      {isAuthenticated && (
        <div className="mb-6 flex border-b border-[var(--color-dark-alt)]">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 font-medium ${
              activeTab === 'all'
                ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
                : 'text-[var(--color-light-alt)] hover:text-[var(--color-light)]'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`py-2 px-4 font-medium ${
              activeTab === 'my'
                ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
                : 'text-[var(--color-light-alt)] hover:text-[var(--color-light)]'
            }`}
          >
            My Posts
          </button>
        </div>
      )}
      
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="bg-[var(--color-dark-alt)] rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={post.user.profileImage || 'https://via.placeholder.com/40'} 
                    alt={post.user.name} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-medium">{post.user.name}</h3>
                    <p className="text-[var(--color-light-alt)] text-sm">{new Date(post.date).toLocaleString()}</p>
                  </div>
                </div>
                
                <p className="mb-4">{post.content}</p>
                
                {post.images && post.images.length > 0 && (
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.images.map((image, index) => (
                      <div key={index} className="overflow-hidden rounded-lg">
                        <img 
                          src={`http://localhost:5007${image}`}
                          alt="Post attachment" 
                          className="w-full h-auto max-h-96 object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center space-x-4 mb-4 border-t border-b border-[var(--color-dark)] py-2">
                  <button 
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-1 ${
                      isAuthenticated && post.likes?.some(like => like.user === user?._id)
                        ? 'text-[var(--color-accent)]' 
                        : 'text-[var(--color-light-alt)] hover:text-[var(--color-accent)]'
                    }`}
                    disabled={!isAuthenticated}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isAuthenticated && post.likes?.some(like => like.user === user?._id) ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  
                  <button 
                    className="flex items-center space-x-1 text-[var(--color-light-alt)] hover:text-[var(--color-accent)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments ? post.comments.length : 0}</span>
                  </button>
                </div>
                
                {/* Comments section */}
                {renderComments(post)}
                
                {/* Add comment section */}
                {isAuthenticated && (
                  <div className="flex mt-4">
                    <img 
                      src={user?.profileImage || 'https://via.placeholder.com/30'} 
                      alt={user?.name} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div className="flex-1 flex">
                      <input
                        type="text"
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({
                          ...commentInputs,
                          [post._id]: e.target.value
                        })}
                        placeholder="Add a comment..."
                        className="flex-1 border rounded-l-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] bg-[var(--color-dark)] text-[var(--color-light)]"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post._id)}
                        disabled={!commentInputs[post._id]?.trim()}
                        className="bg-[var(--color-accent)] text-[var(--color-dark)] px-3 py-1 rounded-r-md hover:bg-[var(--color-accent-light)] transition"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[var(--color-dark-alt)] rounded-lg shadow-md p-8 text-center">
            <p className="text-[var(--color-light-alt)] mb-4">
              {activeTab === 'my' 
                ? "You haven't created any posts yet. Share your fitness journey!" 
                : "No posts yet. Be the first to share your fitness journey!"}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (activeTab === 'my') setActiveTab('all');
                }}
                className="bg-[var(--color-accent)] text-[var(--color-dark)] py-2 px-4 rounded-md hover:bg-[var(--color-accent-light)] transition"
              >
                {activeTab === 'my' ? 'View All Posts' : 'Create Post'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community; 