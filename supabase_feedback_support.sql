-- ====================================================
-- Feedback & Support Database Setup
-- Run this in your Supabase SQL Editor
-- ====================================================

-- 1. Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.ticket_replies CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;

-- 2. Create Feedback Table
CREATE TABLE public.feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_type TEXT CHECK (target_type IN ('gym', 'trainer', 'class', 'facilities', 'equipment', 'staff')) DEFAULT 'gym' NOT NULL,
    target_id UUID, -- Nullable, e.g. class_id or trainer_id
    rating_overall INTEGER CHECK (rating_overall >= 1 AND rating_overall <= 5) NOT NULL,
    rating_cleanliness INTEGER CHECK (rating_cleanliness >= 1 AND rating_cleanliness <= 5),
    rating_trainers INTEGER CHECK (rating_trainers >= 1 AND rating_trainers <= 5),
    rating_equipment INTEGER CHECK (rating_equipment >= 1 AND rating_equipment <= 5),
    rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),
    comments TEXT CHECK (char_length(comments) <= 1000),
    admin_reply TEXT,
    is_resolved BOOLEAN DEFAULT false NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Create Support Tickets Table
CREATE TABLE public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN ('General Inquiry', 'Billing Issue', 'Membership Issue', 'Technical Issue', 'Complaint', 'Suggestion')) NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('Open', 'Pending', 'Resolved', 'Closed')) DEFAULT 'Open' NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Create Ticket Replies Table
CREATE TABLE public.ticket_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- 1. Feedback Policies
CREATE POLICY "Anyone can view resolved feedback" ON public.feedback 
    FOR SELECT USING (is_resolved = true OR member_id = auth.uid() OR public.is_admin());

CREATE POLICY "Members can submit feedback" ON public.feedback 
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admins manage all feedback" ON public.feedback 
    FOR ALL USING (public.is_admin());

-- 2. Support Tickets Policies
CREATE POLICY "Users view own support tickets" ON public.support_tickets 
    FOR SELECT USING (member_id = auth.uid() OR public.is_admin());

CREATE POLICY "Members insert own tickets" ON public.support_tickets 
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users update own support tickets" ON public.support_tickets 
    FOR UPDATE USING (member_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins delete support tickets" ON public.support_tickets 
    FOR DELETE USING (public.is_admin());

-- 3. Ticket Replies Policies
CREATE POLICY "Users view replies of own tickets" ON public.ticket_replies 
    FOR SELECT USING (
        sender_id = auth.uid() OR 
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE id = ticket_id AND member_id = auth.uid()
        )
    );

CREATE POLICY "Users insert replies to own tickets" ON public.ticket_replies 
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND (
            public.is_admin() OR 
            EXISTS (
                SELECT 1 FROM public.support_tickets 
                WHERE id = ticket_id AND member_id = auth.uid()
            )
        )
    );

-- ====================================================
-- STORAGE BUCKET FOR ATTACHMENTS
-- ====================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public select of attachments" ON storage.objects 
    FOR SELECT USING (bucket_id = 'support-attachments');

CREATE POLICY "Allow logged-in upload of attachments" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'support-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Allow owner update of attachments" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'support-attachments' AND auth.uid() = owner);

CREATE POLICY "Allow owner delete of attachments" ON storage.objects 
    FOR DELETE USING (bucket_id = 'support-attachments' AND auth.uid() = owner);

-- ====================================================
-- ENABLE REALTIME
-- ====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_replies;
