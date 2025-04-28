import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Workout categories with positions for proper ordering in the grid
const workoutCategories = [
  { 
    name: 'Weight Loss', 
    position: 1, // Top left
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  { 
    name: 'Muscle Building', 
    position: 2, // Top right
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  { 
    name: 'Calisthenics', 
    position: 3, // Bottom left
    image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80'
  },
  { 
    name: 'HIIT', 
    position: 4, // Bottom right
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  }
];

const mealCategories = [
  { 
    name: 'Vegetarian', 
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    description: 'Plant-based meals rich in nutrients and flavor'
  },
  { 
    name: 'Non-Vegetarian', 
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    description: 'Protein-packed dishes for maximum muscle growth'
  }
];

const Home = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--color-primary)] opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[var(--color-secondary)] opacity-10 blur-3xl"></div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-[var(--color-light)] mb-6 relative"
        >
          Your <span className="text-[var(--color-primary)]">Personal</span> Fitness Journey Starts Here
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-[var(--color-light-alt)] mb-8 max-w-2xl mx-auto"
        >
          Get personalized workout and meal plans to achieve your fitness goals
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/register"
            className="btn-primary text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform transition hover:-translate-y-1"
          >
            Start Your Journey
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[var(--color-dark-alt)] bg-opacity-30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--color-light)] mb-12 text-center">
            What <span className="text-[var(--color-primary)]">DietBuddy</span> Offers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: '🔍', 
                title: 'Personalized Plans', 
                description: 'Custom nutrition and workout plans tailored to your specific goals and needs'
              },
              { 
                icon: '📊', 
                title: 'Progress Tracking', 
                description: 'Monitor your health journey with detailed statistics and visualizations'
              },
              { 
                icon: '👥', 
                title: 'Community Support', 
                description: 'Access to a community of like-minded individuals to support and motivate you'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="premium-card flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[var(--color-light)] mb-2">{feature.title}</h3>
                <p className="text-[var(--color-light-alt)]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meal Categories - Moved before Workout Categories for better visibility */}
      <section className="py-16 px-4 relative">
        {/* Decorative background element for meal section */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-secondary)] to-transparent opacity-5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-[var(--color-light)] mb-3 text-center">
            <span className="text-[var(--color-secondary)]">Healthy</span> Meal Ideas
          </h2>
          <p className="text-[var(--color-light-alt)] text-center max-w-2xl mx-auto mb-10">
            Discover nutritious and delicious meal options that complement your workout routine
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {mealCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/meals?category=${category.name}`}
                  className="block relative rounded-xl overflow-hidden group h-80 shadow-lg border border-[var(--color-secondary)] border-opacity-20"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-2xl font-bold text-[var(--color-light)] mb-2">
                      {category.name}
                    </h3>
                    <p className="text-[var(--color-light-alt)] group-hover:opacity-100 transition-opacity duration-300">
                      {category.description}
                    </p>
                    <button className="mt-4 bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-secondary-dark)] transition-colors shadow-lg w-fit">
                      View Meals
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workout Categories */}
      <section className="py-16 px-4 bg-[var(--color-dark-alt)] bg-opacity-30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-light)] mb-3 text-center">
            <span className="text-[var(--color-primary)]">Workout</span> Categories
          </h2>
          <p className="text-[var(--color-light-alt)] text-center max-w-2xl mx-auto mb-10">
            Explore diverse workout styles designed to help you reach your fitness goals
          </p>
          
          {/* 2x2 Grid for workout categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[...workoutCategories]
              .sort((a, b) => a.position - b.position)
              .map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/workouts?category=${encodeURIComponent(category.name)}`}
                    className="block rounded-xl overflow-hidden shadow-lg relative transition-all duration-300 hover:-translate-y-1 h-48"
                  >
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover absolute"
                    />
                    <div className="p-8 flex flex-col h-full items-center justify-center relative z-10 bg-black bg-opacity-60">
                      <h3 className="text-2xl font-semibold text-white">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-light)] mb-3 text-center">
            <span className="text-[var(--color-primary)]">Featured</span> Articles
          </h2>
          <p className="text-[var(--color-light-alt)] text-center max-w-2xl mx-auto mb-10">
            Explore our collection of expert-written articles on fitness, nutrition, and wellness
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Blog 1 - Science Behind Effective Workouts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="premium-card overflow-hidden flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden rounded-t-lg relative">
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Workout Science" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] to-transparent opacity-60"></div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-[var(--color-light)] mb-3">The Science Behind Effective Workouts</h3>
                <p className="text-[var(--color-light-alt)] mb-4 flex-grow">
                  Understand the muscle physiology, metabolism, and recovery principles that make your workouts more effective.
                </p>
                <a 
                  href="https://www.localfitseattle.com/blog/the-science-behind-effective-workouts" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary text-sm px-4 py-2 rounded-lg self-start hover:bg-[var(--color-primary-dark)] transition-colors duration-300"
                >
                  Read More
                </a>
              </div>
            </motion.div>
            
            {/* Blog 2 - Nutrition Myths Debunked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="premium-card overflow-hidden flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden rounded-t-lg relative">
                <img 
                  src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Nutrition Myths" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] to-transparent opacity-60"></div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-[var(--color-light)] mb-3">Nutrition Myths Debunked</h3>
                <p className="text-[var(--color-light-alt)] mb-4 flex-grow">
                  Discover the truth behind common nutrition misconceptions and learn evidence-based approaches to healthy eating.
                </p>
                <a 
                  href="https://www.healthline.com/nutrition/biggest-lies-of-nutrition" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm px-4 py-2 rounded-lg self-start hover:bg-[var(--color-secondary-dark)] transition-colors duration-300"
                >
                  Read More
                </a>
              </div>
            </motion.div>
            
            {/* Blog 3 - Exercise and Mental Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="premium-card overflow-hidden flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden rounded-t-lg relative">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Mental Health" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] to-transparent opacity-60"></div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-[var(--color-light)] mb-3">Exercise and Mental Wellbeing</h3>
                <p className="text-[var(--color-light-alt)] mb-4 flex-grow">
                  Explore the profound connection between physical activity and mental health backed by scientific research.
                </p>
                <a 
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7874196/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-accent text-sm px-4 py-2 rounded-lg self-start hover:bg-[var(--color-accent-dark)] transition-colors duration-300 text-[var(--color-dark)]"
                >
                  Read More
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="premium-card p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)] opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[var(--color-light)] mb-4 text-center"
            >
              Upgrade to <span className="text-[var(--color-accent)]">Premium</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-[var(--color-light-alt)] mb-8 text-center max-w-2xl mx-auto"
            >
              Get personalized workout and meal plans, track your progress, and
              achieve your fitness goals faster with expert guidance
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link
                to="/membership"
                className="btn-accent inline-block text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform transition hover:-translate-y-1"
              >
                View Plans
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 