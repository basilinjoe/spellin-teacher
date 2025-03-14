import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, StatsCard, ReviewDialog } from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { reviewService, practiceService, wordListService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, ListChecks, Target } from 'lucide-react';

interface DashboardStats {
  totalWords: number;
  totalLists: number;
  averageAccuracy: number;
  totalPracticed: number;
  dueTodayCount: number;
  recentMistakes: Array<{
    word: string;
    pattern: string;
    count: number;
  }>;
  srsLevelCounts: Record<number, number>;
}

const DashboardPage = () => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [srsStats, wordLists] = await Promise.all([
          reviewService.getStats(),
          wordListService.getWordLists()
        ]);

        // Get stats for each word list
        const listStatsPromises = wordLists.map(list =>
          practiceService.getPracticeStats(list.id)
        );
        const listsStats = await Promise.all(listStatsPromises);

        // Calculate aggregated stats
        const totalWords = listsStats.reduce((sum, stat) => sum + (stat?.total_words || 0), 0);
        const totalPracticed = listsStats.reduce((sum, stat) => sum + (stat?.practiced_words || 0), 0);
        const weightedAccuracy = listsStats.reduce((sum, stat) => {
          if (!stat?.practiced_words) return sum;
          return sum + (stat.accuracy * stat.practiced_words);
        }, 0);

        const averageAccuracy = totalPracticed ? weightedAccuracy / totalPracticed : 0;

        setStats({
          totalWords,
          totalLists: wordLists.length,
          averageAccuracy,
          totalPracticed,
          dueTodayCount: srsStats.total_due,
          recentMistakes: [], // This would need a new API endpoint
          srsLevelCounts: srsStats.level_counts
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <PageContainer>Loading...</PageContainer>;
  }

  if (!stats) {
    return <PageContainer>Failed to load dashboard</PageContainer>;
  }

  const dueProgress = stats.totalWords > 0 
    ? ((stats.totalWords - stats.dueTodayCount) / stats.totalWords) * 100 
    : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your learning progress"
      />

      <div className="grid gap-6">
        {/* Main stats */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            value={stats.totalWords}
            label="Total Words"
            className="bg-background/50"
          />
          <StatsCard
            value={stats.totalPracticed}
            label="Words Practiced"
            className="bg-background/50"
          />
          <StatsCard
            value={`${(stats.averageAccuracy * 100).toFixed(1)}%`}
            label="Average Accuracy"
            className="bg-background/50"
          />
          <StatsCard
            value={stats.dueTodayCount}
            label="Due for Review"
            className="bg-background/50"
          />
        </div>

        {/* Learning Progress */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* SRS Levels Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                SRS Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div>Overall Progress</div>
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
                              height: `${((stats.srsLevelCounts[level] || 0) / stats.totalWords) * 100}%`,
                              minHeight: '4px'
                            }}
                          />
                        </div>
                        <p className="text-xs text-center mt-1">
                          {stats.srsLevelCounts[level] || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Level {level}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-between"
                onClick={() => navigate('/word-lists')}
              >
                Manage Word Lists ({stats.totalLists})
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                className="w-full justify-between"
                onClick={() => navigate('/mistake-patterns')}
              >
                View Mistake Patterns
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReviewDialog 
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />
    </PageContainer>
  );
};

export default DashboardPage;