import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { WelcomeFeatureCard } from '../components';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const auth = useContext(AuthContext);
  const currentUser = auth?.currentUser;

  const features = [
    {
      icon: 'fas fa-upload',
      title: 'Upload Lists',
      description: 'Create custom word lists by uploading CSV files with words, meanings, and example sentences.'
    },
    {
      icon: 'fas fa-volume-up',
      title: 'Audio Practice',
      description: 'Listen to word pronunciations and practice spelling them correctly. Perfect your spelling through audio-based learning.'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Smart Review',
      description: 'Our spaced repetition system helps you review words at optimal intervals to maximize learning efficiency and retention.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed statistics and progress tracking for each word and list.'
    }
  ];

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Spelling Teacher</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Improve your spelling through interactive practice with audio pronunciation
          </p>
          {!currentUser && (
            <div className="flex gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <WelcomeFeatureCard key={index} {...feature} />
        ))}
      </div>

      {currentUser && (
        <div className="text-center">
          <div className="flex gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/word-lists">Go to Word Lists</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/review">Start Review</Link>
            </Button>
          </div>
        </div>
      )}

      <footer className="text-center mt-12">
        <p className="text-muted-foreground">
          Start improving your spelling today with our interactive audio-based
          learning system powered by spaced repetition technology.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;