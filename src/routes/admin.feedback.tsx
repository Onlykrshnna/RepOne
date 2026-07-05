import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { feedbackService, GymFeedback } from '../services/feedback.service';
import { classesService } from '../services/classes.service';
import { useAuth } from '../lib/auth-context';
import { DUMMY_FEEDBACK } from '../lib/dummy-data';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  MessageSquare, Star, Send, Trash2, Archive, CheckCircle, 
  User, Award, Dumbbell, ShieldAlert, Sparkles, Filter, Search
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export const Route = createFileRoute('/admin/feedback')({
  component: FeedbackPage,
});

function FeedbackPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('reviews');

  // Member Review form states
  const [targetType, setTargetType] = useState<any>('gym');
  const [targetId, setTargetId] = useState('');
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingCleanliness, setRatingCleanliness] = useState(5);
  const [ratingTrainers, setRatingTrainers] = useState(5);
  const [ratingEquipment, setRatingEquipment] = useState(5);
  const [ratingValue, setRatingValue] = useState(5);
  const [comments, setComments] = useState('');

  // Admin filters
  const [targetFilter, setTargetFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);

  // Admin reply state
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // 1. Queries
  const { data: dbFeedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['feedback', targetFilter, minRatingFilter],
    queryFn: () => feedbackService.getFeedback({
      target_type: targetFilter || undefined,
      minRating: minRatingFilter || undefined,
      is_archived: profile?.role === 'admin' ? undefined : false
    })
  });

  const feedback = dbFeedback && dbFeedback.length > 0 ? dbFeedback : (feedbackLoading ? [] : DUMMY_FEEDBACK as any[]);


  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesService.getClasses({ status: 'active' }),
  });

  const { data: trainers = [] } = useQuery({
    queryKey: ['trainers'],
    queryFn: classesService.getTrainers,
  });

  const { data: metrics } = useQuery({
    queryKey: ['feedback-metrics'],
    queryFn: feedbackService.getFeedbackDashboardMetrics,
    enabled: profile?.role === 'admin'
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('public:feedback')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        queryClient.invalidateQueries({ queryKey: ['feedback'] });
        queryClient.invalidateQueries({ queryKey: ['feedback-metrics'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // 2. Mutations
  const submitMutation = useMutation({
    mutationFn: (data: any) => feedbackService.submitFeedback(data),
    onSuccess: () => {
      toast.success('Thank you! Your feedback has been submitted.');
      setComments('');
      setTargetId('');
      setTargetType('gym');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      setActiveTab('reviews');
    },
    onError: (e: any) => toast.error(e.message || 'Submission failed'),
  });

  const replyMutation = useMutation({
    mutationFn: (data: { id: string; text: string }) => feedbackService.adminReply(data.id, data.text),
    onSuccess: () => {
      toast.success('Reply submitted');
      setReplyText('');
      setActiveReplyId(null);
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to submit reply'),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => feedbackService.resolveFeedback(id),
    onSuccess: () => {
      toast.success('Feedback resolved');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (e: any) => toast.error(e.message || 'Action failed'),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => feedbackService.archiveFeedback(id),
    onSuccess: () => {
      toast.success('Feedback archived');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (e: any) => toast.error(e.message || 'Action failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => feedbackService.deleteFeedback(id),
    onSuccess: () => {
      toast.success('Feedback deleted');
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (e: any) => toast.error(e.message || 'Action failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comments.length > 1000) {
      toast.error('Comments exceed 1000 characters maximum.');
      return;
    }

    submitMutation.mutate({
      member_id: profile!.id,
      target_type: targetType,
      target_id: targetId || null,
      rating_overall: ratingOverall,
      rating_cleanliness: targetType === 'gym' || targetType === 'facilities' ? ratingCleanliness : null,
      rating_trainers: targetType === 'trainer' || targetType === 'class' ? ratingTrainers : null,
      rating_equipment: targetType === 'equipment' ? ratingEquipment : null,
      rating_value: ratingValue,
      comments: comments || null
    });
  };

  const renderStarsSelector = (rating: number, setRating: (r: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star className={`h-6 w-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
        </button>
      ))}
    </div>
  );

  const renderStarsDisplay = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-foreground">Feedback & Reviews</h2>
        <p className="text-muted-foreground">Provide clean insights, review trainers and workouts.</p>
      </div>

      {profile?.role === 'admin' && metrics && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-indigo-600">{metrics.averageRating} ★</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Average Rating</div>
          </Card>
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-emerald-500">{metrics.averageCleanliness} / 5</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Cleanliness</div>
          </Card>
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-amber-500">{metrics.averageEquipment} / 5</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Equipment Rating</div>
          </Card>
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-foreground">{metrics.totalFeedback}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Total Feedbacks</div>
          </Card>
          <Card className="bg-card border-border text-foreground shadow-sm text-center py-4">
            <div className="text-2xl font-black text-slate-950">{metrics.resolvedFeedback}</div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground/75 mt-1">Resolved</div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted border border-border p-1 rounded-lg">
          <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">All Reviews</TabsTrigger>
          {profile?.role === 'member' && (
            <TabsTrigger value="submit" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Leave a Review</TabsTrigger>
          )}
        </TabsList>

        {/* --- ALL REVIEWS TAB --- */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Admin filters */}
          {profile?.role === 'admin' && (
            <div className="flex flex-wrap gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Filter className="h-4 w-4 text-muted-foreground/75" />
                <select
                  value={targetFilter}
                  onChange={(e) => setTargetFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">All Categories</option>
                  <option value="gym">Gym</option>
                  <option value="trainer">Trainers</option>
                  <option value="class">Classes</option>
                  <option value="facilities">Facilities</option>
                  <option value="equipment">Equipment</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Star className="h-4 w-4 text-muted-foreground/75" />
                <select
                  value={minRatingFilter}
                  onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value={0}>Any Rating</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                </select>
              </div>
            </div>
          )}

          {feedbackLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Card key={i} className="h-28 bg-card border-border" />)}
            </div>
          ) : feedback.length === 0 ? (
            <Card className="bg-card border-border text-center p-8">
              <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-foreground/80">No reviews found</div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {feedback.map((review) => {
                const targetLabel = 
                  review.target_type === 'gym' ? 'Gym Experience' :
                  review.target_type === 'facilities' ? 'Facilities' :
                  review.target_type === 'equipment' ? 'Gym Equipment' :
                  review.target_type === 'staff' ? 'Staff Members' :
                  review.target_type === 'class' ? 'Fitness Class' : 'Instructor';

                return (
                  <motion.div key={review.id} layout>
                    <Card className="bg-card border-border text-foreground shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground uppercase text-[9px] font-bold">
                          {targetLabel}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm uppercase">
                            {review.profiles?.first_name?.[0] || 'M'}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{review.profiles?.first_name} {review.profiles?.last_name}</div>
                            <div className="text-[10px] text-muted-foreground/75">{new Date(review.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-4 items-center">
                          {renderStarsDisplay(review.rating_overall)}
                          {review.is_resolved && (
                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-medium">
                              Resolved
                            </Badge>
                          )}
                        </div>

                        {review.comments && (
                          <p className="text-sm text-foreground/80 font-medium italic">"{review.comments}"</p>
                        )}

                        {/* Ratings Categories Breakdowns */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border/50 pt-2 font-medium">
                          {review.rating_cleanliness && <span>Cleanliness: {review.rating_cleanliness}/5</span>}
                          {review.rating_trainers && <span>Trainers: {review.rating_trainers}/5</span>}
                          {review.rating_equipment && <span>Equipment: {review.rating_equipment}/5</span>}
                          <span>Value: {review.rating_value}/5</span>
                        </div>

                        {/* Admin replies render */}
                        {review.admin_reply && (
                          <div className="bg-background p-3 rounded-lg border border-border/50 mt-2 space-y-1">
                            <div className="text-[10px] uppercase font-bold text-indigo-600">Response from Gym Admin</div>
                            <p className="text-xs text-foreground/80 font-semibold">{review.admin_reply}</p>
                          </div>
                        )}

                        {/* Admin Action Rows */}
                        {profile?.role === 'admin' && (
                          <div className="flex flex-wrap gap-2 justify-end border-t border-border/50 pt-3 mt-4">
                            {!review.admin_reply && activeReplyId !== review.id && (
                              <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => setActiveReplyId(review.id)}>
                                <Send className="h-3 w-3 mr-1" /> Reply
                              </Button>
                            )}
                            {!review.is_resolved && (
                              <Button size="sm" variant="outline" className="border-border text-foreground/80 hover:bg-muted/50 bg-card" onClick={() => resolveMutation.mutate(review.id)}>
                                Resolve
                              </Button>
                            )}
                            {!review.is_archived && (
                              <Button size="sm" variant="outline" className="border-border text-foreground/80 hover:bg-muted/50 bg-card" onClick={() => archiveMutation.mutate(review.id)}>
                                Archive
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                              if (confirm('Delete this feedback review?')) {
                                deleteMutation.mutate(review.id);
                              }
                            }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {/* Active reply input box */}
                        {activeReplyId === review.id && (
                          <div className="space-y-2 border-t border-border/50 pt-3">
                            <Label className="text-xs font-semibold">Post Admin Reply</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Type response..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="bg-background border-border text-foreground"
                              />
                              <Button 
                                onClick={() => replyMutation.mutate({ id: review.id, text: replyText })}
                                disabled={replyMutation.isPending || !replyText}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                Submit
                              </Button>
                              <Button variant="ghost" onClick={() => setActiveReplyId(null)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* --- LEAVE A REVIEW TAB (MEMBER ONLY) --- */}
        {profile?.role === 'member' && (
          <TabsContent value="submit">
            <Card className="bg-card border-border text-foreground max-w-xl mx-auto shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" /> Share your Experience
                </CardTitle>
                <CardDescription>Tell us what is working or how we can improve.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="review_target">Feedback Type *</Label>
                      <select
                        id="review_target"
                        value={targetType}
                        onChange={(e) => {
                          setTargetType(e.target.value);
                          setTargetId('');
                        }}
                        className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      >
                        <option value="gym">Gym Operations</option>
                        <option value="facilities">Facilities & Cleanliness</option>
                        <option value="equipment">Workout Equipment</option>
                        <option value="staff">Staff Members</option>
                        <option value="class">Fitness Class</option>
                        <option value="trainer">Trainer</option>
                      </select>
                    </div>

                    {/* Conditional Target IDs selector */}
                    {targetType === 'class' && (
                      <div className="space-y-2">
                        <Label htmlFor="select_class">Select Class *</Label>
                        <select
                          id="select_class"
                          value={targetId}
                          onChange={(e) => setTargetId(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                          required
                        >
                          <option value="">Choose Class...</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                    )}

                    {targetType === 'trainer' && (
                      <div className="space-y-2">
                        <Label htmlFor="select_trainer">Select Trainer *</Label>
                        <select
                          id="select_trainer"
                          value={targetId}
                          onChange={(e) => setTargetId(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                          required
                        >
                          <option value="">Choose Trainer...</option>
                          {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Ratings Star Rows */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-foreground/90 text-sm">Overall Experience *</Label>
                      {renderStarsSelector(ratingOverall, setRatingOverall)}
                    </div>

                    {(targetType === 'gym' || targetType === 'facilities') && (
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-foreground/90 text-sm">Cleanliness & Hygiene</Label>
                        {renderStarsSelector(ratingCleanliness, setRatingCleanliness)}
                      </div>
                    )}

                    {(targetType === 'trainer' || targetType === 'class') && (
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-foreground/90 text-sm">Trainer Performance</Label>
                        {renderStarsSelector(ratingTrainers, setRatingTrainers)}
                      </div>
                    )}

                    {targetType === 'equipment' && (
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-foreground/90 text-sm">Equipment Condition</Label>
                        {renderStarsSelector(ratingEquipment, setRatingEquipment)}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-foreground/90 text-sm">Value for Money</Label>
                      {renderStarsSelector(ratingValue, setRatingValue)}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <Label htmlFor="comments">Detailed Review Comments</Label>
                    <textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Share your thoughts (max 1000 characters)..."
                      maxLength={1000}
                      className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none"
                    />
                    <div className="text-[10px] text-right text-muted-foreground/75">{comments.length}/1000</div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-300"
                  >
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
