import React, { useState, useEffect } from 'react';
import { reviewService } from '../services';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { SRSStats } from '@/services/types';

interface SRSStatusCardProps {
  onReviewClick: () => void;
}

const SRSStatusCard: React.FC<SRSStatusCardProps> = ({ onReviewClick }) => {
  const [stats, setStats] = useState<SRSStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reviewService.getStats();
        setStats(response);
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
            <Skeleton className="h-16 w-[200px] mx-auto" />
            <div className="flex justify-center gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
            <Skeleton className="h-9 w-[120px] mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const dueProgress = stats.total_words > 0 
    ? ((stats.total_words - stats.total_due) / stats.total_words) * 100 
    : 0;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>SRS Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <div>Progress</div>
              <div>{Math.round(dueProgress)}%</div>
            </div>
            <Progress value={dueProgress} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end gap-4">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <div key={level} className="text-center flex-1">
                  <div className="h-20 flex items-end">
                    <div
                      className="bg-primary/10 w-full rounded-sm transition-all duration-500 ease-in-out"
                      style={{
                        height: `${((stats.level_counts[level] || 0) / stats.total_words) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                  </div>
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
            <Button onClick={onReviewClick}>
              Start Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SRSStatusCard;