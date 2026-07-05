-- ====================================================
-- Classes & Bookings Database Setup
-- Run this in your Supabase SQL Editor
-- ====================================================

-- 1. Extend booking_status enum to support 'waiting' and 'no_show'
-- Note: Enum alterations cannot be run inside a transaction block in some versions of Postgres.
-- Run this block first if it fails, or run without transaction.
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'waiting';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'no_show';

-- 2. Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.class_bookings CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.trainers CASCADE;

-- 3. Create Trainers Table
CREATE TABLE public.trainers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    photo_url TEXT,
    specialization TEXT,
    experience TEXT,
    bio TEXT,
    contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Create Classes Table
CREATE TABLE public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    room TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    booked_count INTEGER DEFAULT 0 NOT NULL,
    waiting_list_count INTEGER DEFAULT 0 NOT NULL,
    duration INTEGER NOT NULL, -- duration in minutes
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner' NOT NULL,
    days TEXT[] NOT NULL, -- e.g. ['Monday', 'Wednesday']
    start_time TIME NOT NULL, -- e.g. '09:00:00'
    end_time TIME NOT NULL, -- e.g. '10:00:00'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')) NOT NULL,
    cover_image TEXT,
    color_label TEXT DEFAULT '#4F46E5' NOT NULL, -- Hex color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Create Class Bookings Table
CREATE TABLE public.class_bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status booking_status DEFAULT 'booked' NOT NULL,
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    attended BOOLEAN DEFAULT false NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    position_in_waiting_list INTEGER, -- Null if booked/cancelled
    UNIQUE(class_id, member_id)
);

-- ====================================================
-- TRIGGERS FOR CAPACITY & WAITING LIST
-- ====================================================

-- Trigger function for BEFORE INSERT on class_bookings
CREATE OR REPLACE FUNCTION public.handle_class_booking_insert()
RETURNS trigger AS $$
DECLARE
    v_capacity INTEGER;
    v_booked_count INTEGER;
BEGIN
    -- Get current capacity and booked count
    SELECT capacity, booked_count INTO v_capacity, v_booked_count
    FROM public.classes WHERE id = NEW.class_id;

    IF NEW.status = 'booked' THEN
        IF v_booked_count >= v_capacity THEN
            -- Class is full, place on waiting list
            NEW.status := 'waiting';
            NEW.position_in_waiting_list := (
                SELECT COALESCE(MAX(position_in_waiting_list), 0) + 1 
                FROM public.class_bookings 
                WHERE class_id = NEW.class_id AND status = 'waiting'
            );
            
            -- Increment waiting list count
            UPDATE public.classes 
            SET waiting_list_count = waiting_list_count + 1 
            WHERE id = NEW.class_id;
        ELSE
            -- Increment booked count
            UPDATE public.classes 
            SET booked_count = booked_count + 1 
            WHERE id = NEW.class_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_class_booking_insert
    BEFORE INSERT ON public.class_bookings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_class_booking_insert();


-- Trigger function for BEFORE UPDATE on class_bookings
CREATE OR REPLACE FUNCTION public.handle_class_booking_update()
RETURNS trigger AS $$
DECLARE
    v_next_waiting_id UUID;
BEGIN
    -- If booking is cancelled or marked no-show, and it was previously 'booked'
    IF (NEW.status = 'cancelled' OR NEW.status = 'no_show') AND OLD.status = 'booked' THEN
        -- Check if someone is on the waiting list
        SELECT id INTO v_next_waiting_id 
        FROM public.class_bookings 
        WHERE class_id = OLD.class_id AND status = 'waiting' 
        ORDER BY position_in_waiting_list ASC 
        LIMIT 1;

        IF v_next_waiting_id IS NOT NULL THEN
            -- Promote the next person
            UPDATE public.class_bookings 
            SET status = 'booked', position_in_waiting_list = NULL 
            WHERE id = v_next_waiting_id;

            -- Decrement waiting list count (the update will trigger update counts below)
            UPDATE public.classes 
            SET waiting_list_count = GREATEST(waiting_list_count - 1, 0)
            WHERE id = OLD.class_id;
            
            -- Note: booked_count doesn't change since the spot was immediately filled
        ELSE
            -- Decrement booked count
            UPDATE public.classes 
            SET booked_count = GREATEST(booked_count - 1, 0) 
            WHERE id = OLD.class_id;
        END IF;
        
        IF NEW.status = 'cancelled' THEN
            NEW.cancelled_at := now();
        END IF;
        NEW.position_in_waiting_list := NULL;
    
    -- If a waiting list booking is cancelled
    ELSIF NEW.status = 'cancelled' AND OLD.status = 'waiting' THEN
        NEW.cancelled_at := now();
        NEW.position_in_waiting_list := NULL;

        -- Shift everyone else in the waiting list up
        UPDATE public.class_bookings
        SET position_in_waiting_list = position_in_waiting_list - 1
        WHERE class_id = OLD.class_id 
          AND status = 'waiting' 
          AND position_in_waiting_list > OLD.position_in_waiting_list;

        -- Decrement waiting list count
        UPDATE public.classes 
        SET waiting_list_count = GREATEST(waiting_list_count - 1, 0)
        WHERE id = OLD.class_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_class_booking_update
    BEFORE UPDATE ON public.class_bookings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_class_booking_update();


-- Trigger function for AFTER DELETE on class_bookings
CREATE OR REPLACE FUNCTION public.handle_class_booking_delete()
RETURNS trigger AS $$
DECLARE
    v_next_waiting_id UUID;
BEGIN
    IF OLD.status = 'booked' THEN
        -- Check if someone is on the waiting list
        SELECT id INTO v_next_waiting_id 
        FROM public.class_bookings 
        WHERE class_id = OLD.class_id AND status = 'waiting' 
        ORDER BY position_in_waiting_list ASC 
        LIMIT 1;

        IF v_next_waiting_id IS NOT NULL THEN
            -- Promote the next person
            UPDATE public.class_bookings 
            SET status = 'booked', position_in_waiting_list = NULL 
            WHERE id = v_next_waiting_id;

            -- Decrement waiting list count
            UPDATE public.classes 
            SET waiting_list_count = GREATEST(waiting_list_count - 1, 0)
            WHERE id = OLD.class_id;
        ELSE
            -- Decrement booked count
            UPDATE public.classes 
            SET booked_count = GREATEST(booked_count - 1, 0) 
            WHERE id = OLD.class_id;
        END IF;
    ELSIF OLD.status = 'waiting' THEN
        -- Shift everyone else up
        UPDATE public.class_bookings
        SET position_in_waiting_list = position_in_waiting_list - 1
        WHERE class_id = OLD.class_id 
          AND status = 'waiting' 
          AND position_in_waiting_list > OLD.position_in_waiting_list;

        -- Decrement waiting list count
        UPDATE public.classes 
        SET waiting_list_count = GREATEST(waiting_list_count - 1, 0)
        WHERE id = OLD.class_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_class_booking_delete
    AFTER DELETE ON public.class_bookings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_class_booking_delete();


-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

-- Enable RLS
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;

-- 1. Trainers
CREATE POLICY "Everyone views trainers" ON public.trainers FOR SELECT USING (true);
CREATE POLICY "Admins manage trainers" ON public.trainers FOR ALL USING (public.is_admin());

-- 2. Classes
CREATE POLICY "Everyone views active classes" ON public.classes FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL USING (public.is_admin());

-- 3. Class Bookings
CREATE POLICY "Users view own bookings" ON public.class_bookings FOR SELECT USING (auth.uid() = member_id OR public.is_admin());
CREATE POLICY "Users insert own bookings" ON public.class_bookings FOR INSERT WITH CHECK (
    auth.uid() = member_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership_status = 'active')
);
CREATE POLICY "Users update own bookings" ON public.class_bookings FOR UPDATE USING (auth.uid() = member_id OR public.is_admin());
CREATE POLICY "Users delete own bookings" ON public.class_bookings FOR DELETE USING (auth.uid() = member_id OR public.is_admin());

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_bookings;
