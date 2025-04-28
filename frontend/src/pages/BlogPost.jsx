import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useApi from '../hooks/useApi';

const BlogPost = () => {
  const { id } = useParams();
  const api = useApi();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getBlogById(id);
        setBlog(data);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Could not load the blog post. It may not exist or there might be a connection issue.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // Dummy blog for development/placeholder
  const dummyBlog = {
    title: 'The Science of Effective Workouts',
    content: `
      <h2>Understanding the Science Behind Effective Training</h2>
      <p>When it comes to fitness, understanding the scientific principles that govern how our bodies respond to exercise can make the difference between mediocre and exceptional results.</p>
      
      <p>The body operates on several key principles when adapting to training stimulus:</p>
      
      <h3>Progressive Overload</h3>
      <p>Perhaps the most fundamental principle of exercise science is progressive overload. This principle states that to continue making gains in strength, endurance, or muscle size, you must gradually increase the stress placed on the body during training.</p>
      
      <p>This can be achieved through:</p>
      <ul>
        <li>Increasing the weight lifted</li>
        <li>Increasing the number of repetitions</li>
        <li>Increasing training volume (sets × reps × weight)</li>
        <li>Decreasing rest periods</li>
        <li>Increasing training frequency</li>
      </ul>
      
      <h3>Specificity</h3>
      <p>The principle of specificity states that your body will adapt specifically to the type of demand placed upon it. If you want to improve your running, you need to run. If you want to get stronger at squats, you need to squat.</p>
      
      <h3>Recovery and Supercompensation</h3>
      <p>Exercise breaks down your body. It's during the recovery period that your body rebuilds itself stronger than before – a process known as supercompensation. Without adequate recovery, progress stalls and overtraining can occur.</p>
      
      <h2>Optimal Training Frequency</h2>
      <p>Research has shown that for most people, training each muscle group 2-3 times per week yields better results than the traditional "bro split" of hitting one body part per week.</p>
      
      <h2>The Role of Intensity</h2>
      <p>Training intensity refers to how hard you're working relative to your maximum capacity. For strength development, working at 80-90% of your one-rep max (1RM) is generally optimal. For hypertrophy (muscle growth), a slightly lower intensity of 70-80% 1RM with higher volume tends to work best.</p>
      
      <h2>Nutrition and Recovery</h2>
      <p>No discussion of workout science would be complete without addressing nutrition and recovery. Protein intake of 1.6-2.2g per kg of bodyweight daily has been shown to maximize muscle protein synthesis. Carbohydrates are crucial for high-intensity performance, while adequate fat intake supports hormonal function.</p>
      
      <h2>Conclusion</h2>
      <p>By understanding and applying these scientific principles, you can optimize your training for better results in less time. Remember that consistency is key – the best workout program is the one you can stick with over time.</p>
    `,
    author: 'Dr. Fitness Expert',
    date: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    tags: ['Workout', 'Science', 'Fitness']
  };

  // Use dummy blog if real blog fails to load or for development
  const displayBlog = blog || dummyBlog;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <Link to="/blog" className="text-blue-600 hover:text-blue-800">
          ← Back to all blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/blog" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Back to all blogs
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <img 
          src={displayBlog.imageUrl} 
          alt={displayBlog.title} 
          className="w-full h-64 object-cover"
        />
        
        <div className="p-6">
          <div className="flex flex-wrap mb-4">
            {displayBlog.tags && displayBlog.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{displayBlog.title}</h1>
          
          <div className="flex items-center mb-6">
            <div className="text-gray-600">
              By <span className="font-medium">{displayBlog.author}</span> • {new Date(displayBlog.date).toLocaleDateString()}
            </div>
          </div>
          
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: displayBlog.content }}
          />
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Continue Your Fitness Journey</h2>
        <p className="mb-4">Ready to put this knowledge into action? Check out our personalized workout plans and nutrition guides.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/workouts" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
            Explore Workouts
          </Link>
          <Link to="/meals" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">
            Browse Meal Plans
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost; 