import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';

const Blog = () => {
  const api = useApi();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('all');
  const [tags, setTags] = useState(['Health', 'Nutrition', 'Workout', 'Motivation', 'Weight Loss']);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const allBlogs = await api.getAllBlogs();
        const featured = await api.getFeaturedBlogs();
        setBlogs(allBlogs);
        setFeaturedBlogs(featured);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleTagClick = async (tag) => {
    setActiveTag(tag);
    setLoading(true);
    
    try {
      let filteredBlogs;
      if (tag === 'all') {
        filteredBlogs = await api.getAllBlogs();
      } else {
        filteredBlogs = await api.getBlogsByTag(tag);
      }
      setBlogs(filteredBlogs);
    } catch (error) {
      console.error('Error filtering blogs by tag:', error);
    } finally {
      setLoading(false);
    }
  };

  // Temporary placeholders if no blogs exist yet
  const dummyFeaturedBlog = {
    _id: 'featured1',
    title: 'The Science of Effective Workouts',
    summary: 'Discover the latest research on how to maximize your workout gains through optimal training frequency, intensity, and recovery.',
    author: 'Dr. Fitness Expert',
    date: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['Workout', 'Science', 'Fitness'],
    externalUrl: 'https://www.localfitseattle.com/blog/the-science-behind-effective-workouts'
  };

  const dummyBlogs = [
    {
      _id: 'blog1',
      title: 'Nutrition Myths Debunked',
      summary: 'We separate fact from fiction with evidence-based analysis of common nutrition myths that might be holding back your fitness progress.',
      author: 'Nutrition Specialist',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      tags: ['Nutrition', 'Health'],
      externalUrl: 'https://www.healthline.com/nutrition/biggest-lies-of-nutrition'
    },
    {
      _id: 'blog2',
      title: 'Building Mental Resilience Through Exercise',
      summary: 'Learn how consistent physical activity can strengthen not just your body but also your mind, helping you overcome challenges in all areas of life.',
      author: 'Wellness Coach',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1499728603263-13726abce5fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      tags: ['Motivation', 'Mental Health'],
      externalUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7874196/'
    },
    {
      _id: 'blog3',
      title: 'The Ultimate Guide to Sustainable Weight Loss',
      summary: 'Forget crash diets and extreme approaches. This comprehensive guide outlines scientifically proven strategies for losing weight and keeping it off long-term.',
      author: 'Weight Management Expert',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1574&q=80',
      tags: ['Weight Loss', 'Health']
    }
  ];

  const displayBlogs = blogs.length > 0 ? blogs : dummyBlogs;
  const displayFeatured = featuredBlogs.length > 0 ? featuredBlogs[0] : dummyFeaturedBlog;

  if (loading && blogs.length === 0 && featuredBlogs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Health & Fitness Blog</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Health & Fitness Blog</h1>
      
      {/* Featured Blog */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Featured Article</h2>
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden text-gray-200">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src={displayFeatured.imageUrl} 
                alt={displayFeatured.title} 
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6">
              <div className="flex flex-wrap mb-2">
                {displayFeatured.tags && displayFeatured.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-900 text-blue-200 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">{displayFeatured.title}</h3>
              <p className="text-gray-300 mb-4">{displayFeatured.summary}</p>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                  By {displayFeatured.author} • {new Date(displayFeatured.date).toLocaleDateString()}
                </div>
              </div>
              {displayFeatured.externalUrl ? (
                <a 
                  href={displayFeatured.externalUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                  Read More
                </a>
              ) : (
                <Link 
                  to={`/blog/${displayFeatured._id}`} 
                  className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                  Read More
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tag Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleTagClick('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeTag === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
          }`}
        >
          All Topics
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      
      {/* Blog List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayBlogs.map((blog) => (
          <div key={blog._id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden text-gray-200">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex flex-wrap mb-2">
                {blog.tags && blog.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-900 text-blue-200 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{blog.title}</h3>
              <p className="text-gray-300 mb-4 line-clamp-3">{blog.summary}</p>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                  By {blog.author}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(blog.date).toLocaleDateString()}
                </div>
              </div>
              {blog.externalUrl ? (
                <a 
                  href={blog.externalUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-400 font-medium hover:text-blue-300 transition"
                >
                  Read More →
                </a>
              ) : (
                <Link 
                  to={`/blog/${blog._id}`} 
                  className="inline-block text-blue-400 font-medium hover:text-blue-300 transition"
                >
                  Read More →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog; 