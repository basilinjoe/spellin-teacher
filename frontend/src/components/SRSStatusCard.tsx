import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface SRSStats {
  total_words: number;
  total_due: number;
  level_counts: {
    [key: number]: number;
  };
}

const SRSStatusCard: React.FC = () => {
  const [stats, setStats] = useState<SRSStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await reviewService.getStats();
        setStats(stats);
      } catch (error) {
        console.error('Error fetching SRS stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalWords = stats.total_words || 1; // Prevent division by zero

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex mb-2">
              {[0, 1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className="flex-1 px-0.5"
                >
                  <Progress 
                    value={(stats.level_counts[level] || 0) / totalWords * 100}
                    className="h-3"
                  />
                  <p className="text-xs text-center mt-1">
                    {stats.level_counts[level] || 0}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Words by SRS level (0-5)
            </p>
          </div>

          <div className="text-center space-y-2">
            <div>
              <span className="text-3xl font-bold">{stats.total_due}</span>{' '}
              <span className="text-muted-foreground">words due for review</span>
            </div>
            <Button asChild>
              <Link to="/review">Start Review</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SRSStatusCard;