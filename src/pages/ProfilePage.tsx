import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, Clock, Trophy, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStats } from '@/contexts/StatsContext';
import { useBook } from '@/contexts/BookContext';

const ProfilePage: React.FC = () => {
  const { userStats } = useStats();
  const { books } = useBook();
  const [readingStreak, setReadingStreak] = useState(0);
  const [favoriteGenre, setFavoriteGenre] = useState('');

  // Calculate user statistics
  useEffect(() => {
    // Calculate reading streak (simplified - in real app would track daily activity)
    const lastActivity = userStats.lastActiveDate;
    if (lastActivity) {
      const daysSinceLastActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
      setReadingStreak(Math.max(0, 7 - daysSinceLastActivity)); // Simple streak calculation
    }

    // Find favorite genre
    const genreCount: Record<string, number> = {};
    books.forEach(book => {
      book.tags.forEach(tag => {
        genreCount[tag] = (genreCount[tag] || 0) + 1;
      });
    });
    
    const topGenre = Object.entries(genreCount).reduce((a, b) => 
      genreCount[a[0]] > genreCount[b[0]] ? a : b, ['', 0]
    );
    
    setFavoriteGenre(topGenre[0] || 'No preference yet');
  }, [userStats, books]);

  const completedBooks = books.filter(book => book.progress >= 100);
  const inProgressBooks = books.filter(book => book.progress > 0 && book.progress < 100);
  const averageRating = books.length > 0 
    ? books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.length 
    : 0;

  const readingGoal = 50; // Books per year
  const progressTowardsGoal = (completedBooks.length / readingGoal) * 100;

  const achievements = [
    { id: 1, name: 'First Book', description: 'Complete your first book', earned: completedBooks.length >= 1 },
    { id: 2, name: 'Speed Reader', description: 'Read 5 books', earned: completedBooks.length >= 5 },
    { id: 3, name: 'Bookworm', description: 'Read 10 books', earned: completedBooks.length >= 10 },
    { id: 4, name: 'Consistent Reader', description: 'Read for 7 days straight', earned: readingStreak >= 7 },
    { id: 5, name: 'Audio Enthusiast', description: 'Listen to an audiobook', earned: books.some(book => book.isAudiobook && book.progress > 0) },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Link to="/" className="text-muted-foreground hover:text-primary flex items-center gap-1.5 mb-6">
        <ChevronLeft className="h-5 w-5" />
        Back to Library
      </Link>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Reader Profile</h1>
          <p className="text-muted-foreground">Your reading journey at a glance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Read</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBooks.length}</div>
            <p className="text-xs text-muted-foreground">
              {inProgressBooks.length} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(userStats.totalMinutesRead || 0)}m</div>
            <p className="text-xs text-muted-foreground">
              Total time reading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reading Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Reading Goal 2024
            </CardTitle>
            <CardDescription>
              Track your progress towards reading {readingGoal} books this year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{completedBooks.length} books</span>
                <span>{readingGoal} goal</span>
              </div>
              <Progress value={progressTowardsGoal} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {Math.max(0, readingGoal - completedBooks.length)} books remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reading Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Preferences</CardTitle>
            <CardDescription>
              Your reading habits and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Favorite Genre</Label>
              <Badge variant="secondary" className="ml-2 capitalize">
                {favoriteGenre}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Library Size</Label>
              <p className="text-sm text-muted-foreground">{books.length} books total</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Audio vs Text</Label>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">
                  {books.filter(b => !b.isAudiobook).length} Text books
                </Badge>
                <Badge variant="outline">
                  {books.filter(b => b.isAudiobook).length} Audiobooks
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            {earnedAchievements.length} of {achievements.length} achievements unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.earned
                    ? 'bg-primary/5 border-primary/20 text-primary'
                    : 'bg-muted/30 border-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.earned
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{achievement.name}</h3>
                    <p className="text-xs">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add Label component if not already imported
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

export default ProfilePage; 