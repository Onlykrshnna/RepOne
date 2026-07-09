import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dumbbell, Save, Check } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DEFAULT_SPLIT: Record<string, string> = {
  Sunday: '',
  Monday: '',
  Tuesday: '',
  Wednesday: '',
  Thursday: '',
  Friday: '',
  Saturday: '',
};

export function WeeklySplitCard() {
  const { profile } = useAuth();
  const [split, setSplit] = useState<Record<string, string>>(DEFAULT_SPLIT);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      const saved = localStorage.getItem(`weekly_split_${profile.id}`);
      if (saved) {
        try {
          setSplit(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse weekly split');
        }
      }
    }
  }, [profile?.id]);

  const handleSave = () => {
    if (!profile?.id) return;
    setIsSaving(true);
    
    // Simulate network delay
    setTimeout(() => {
      localStorage.setItem(`weekly_split_${profile.id}`, JSON.stringify(split));
      setIsSaving(false);
      setIsEditing(false);
      toast.success('Weekly split saved successfully!');
    }, 400);
  };

  const handleReset = () => {
    setSplit(DEFAULT_SPLIT);
  };

  const currentDay = DAYS_OF_WEEK[new Date().getDay()];

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Dumbbell className="h-5 w-5 text-primary" />
            Weekly Workout Split
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Plan your muscle focus for the week.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-muted-foreground">Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSaving ? 'Saving...' : <><Save className="h-4 w-4 mr-1.5" /> Save</>}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-border text-foreground">
              Edit Split
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day === currentDay;
            return (
              <div 
                key={day} 
                className={`p-3 rounded-lg border ${
                  isToday 
                    ? 'border-primary/40 bg-primary/5' 
                    : 'border-border/50 bg-background'
                } flex flex-col gap-1.5 transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {day.substring(0, 3)}
                  </span>
                  {isToday && <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">TODAY</span>}
                </div>
                
                {isEditing ? (
                  <Input 
                    value={split[day] || ''} 
                    onChange={(e) => setSplit({ ...split, [day]: e.target.value })}
                    className="h-8 text-sm px-2 bg-card border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm"
                    placeholder="e.g. Legs"
                  />
                ) : (
                  <div className={`text-sm font-medium leading-tight ${isToday ? 'text-foreground' : 'text-foreground'}`}>
                    {split[day] || 'Rest'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {isEditing && (
          <div className="mt-4 flex justify-end">
             <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground text-xs h-7">
               Reset to Default
             </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
