import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_USER, MOCK_TOPICS, MOCK_HISTORY, generateMockHistory } from '../lib/mockData'
import { format } from 'date-fns'

const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth — isLoading starts true; hydration from localStorage happens before first render
      user: null,
      isPremium: false,
      isLoading: true,
      userReady: false,

      // Topics
      topics: [],
      archivedTopics: [],

      // Check-in state
      todayCheckin: null,
      currentEntries: {}, // topicId -> { status, note }
      dayNote: '',
      checkInSubmitted: false,

      // History
      history: [],
      historyLoaded: false,

      // Intentions (topicId -> text)
      topicIntentions: {},

      // Settings
      reminderTime: null,
      celebrationsEnabled: true,
      celebrationStyle: 'confetti', // 'confetti' | 'message' | 'both' | 'none'
      iconStyle: 'circles', // 'circles' | 'faces' | 'marks'

      // UI
      activeTab: 'checkin',
      onboardingComplete: false,

      // --- AUTH ---
      initAuth: async () => {
        if (!isSupabaseConfigured) {
          set({
            user: MOCK_USER,
            isPremium: false,
            topics: MOCK_TOPICS,
            history: MOCK_HISTORY,
            historyLoaded: true,
            isLoading: false,
            userReady: true,
            onboardingComplete: true,
          })
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await get().loadUserData(session.user)
        } else {
          set({ isLoading: false, userReady: true })
        }
        // Mark as booted so tab switches don't show loading screen
        sessionStorage.setItem('innermark_booted', '1')

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await get().loadUserData(session.user)
          } else if (event === 'SIGNED_OUT') {
            set({
              user: null,
              isPremium: false,
              topics: [],
              history: [],
              historyLoaded: false,
              onboardingComplete: false,
              isLoading: false,
              userReady: true,
            })
          }
        })
      },

      signUp: async (email, password, marketingConsent = false, fullName = null) => {
        if (!isSupabaseConfigured) throw new Error('Supabase not configured')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        })
        if (error) throw error
        if (data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            marketing_consent: marketingConsent,
            marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
            reminders_enabled: true,
          })
        }
        return data
      },

      signIn: async (email, password) => {
        if (!isSupabaseConfigured) {
          set({ user: MOCK_USER, isPremium: false, isLoading: false, onboardingComplete: true, topics: MOCK_TOPICS, history: MOCK_HISTORY, historyLoaded: true })
          return
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
      },

      signOut: async () => {
        if (isSupabaseConfigured) await supabase.auth.signOut()
        set({
          user: null,
          isPremium: false,
          topics: [],
          history: [],
          historyLoaded: false,
          onboardingComplete: false,
          todayCheckin: null,
          currentEntries: {},
          dayNote: '',
          checkInSubmitted: false,
        })
      },

      updateMarketingConsent: async (consent) => {
        const { user } = get()
        if (!user || !isSupabaseConfigured) return
        await supabase.from('profiles').update({
          marketing_consent: consent,
          marketing_consent_at: consent ? new Date().toISOString() : null,
        }).eq('id', user.id)
      },

      deleteAccount: async () => {
        const { user } = get()
        if (!user || !isSupabaseConfigured) return
        // Delete all user data — RLS cascade handles most, profiles handles the rest
        await supabase.from('profiles').delete().eq('id', user.id)
        await supabase.auth.signOut()
        set({
          user: null,
          isPremium: false,
          topics: [],
          history: [],
          historyLoaded: false,
          onboardingComplete: false,
          todayCheckin: null,
          currentEntries: {},
          dayNote: '',
          checkInSubmitted: false,
        })
      },

      // --- USER DATA ---
      loadUserData: async (user) => {
        set({ user, isLoading: true })
        try {
          // Load profile/subscription
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          const isPremium = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'

          // Load topics first so we can correctly determine onboarding state
          const { data: topics } = await supabase
            .from('topics')
            .select('*')
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('position', { ascending: true })

          // Only send to onboarding if DB says incomplete OR they have no topics yet
          const onboardingComplete = (profile?.onboarding_complete === true && (topics?.length > 0)) || false

          // Load today's check-in
          const today = format(new Date(), 'yyyy-MM-dd')
          const { data: todayCheckin } = await supabase
            .from('checkins')
            .select('*, topic_entries(*)')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()

          set({
            user,
            isPremium,
            topics: topics || [],
            todayCheckin: todayCheckin || null,
            checkInSubmitted: !!todayCheckin,
            onboardingComplete,
            isLoading: false,
            userReady: true,
          })

          // Load history and intentions in background
          get().loadHistory()
          get().loadIntentions()

        } catch (err) {
          console.error('Error loading user data:', err)
          set({ isLoading: false, userReady: true })
        }
      },

      completeOnboarding: async () => {
        if (!isSupabaseConfigured) {
          set({ onboardingComplete: true })
          return
        }
        const { user } = get()
        await supabase
          .from('profiles')
          .upsert({ id: user.id, onboarding_complete: true })
        set({ onboardingComplete: true })
      },

      // --- TOPICS ---
      addTopic: async (name, emoji = '⭐') => {
        const { user, topics, isPremium } = get()
        const limit = isPremium ? 25 : 8
        if (topics.length >= limit) {
          throw new Error(isPremium ? 'Maximum 25 topics reached' : 'Free tier allows up to 8 topics')
        }

        const newTopic = {
          id: crypto.randomUUID(),
          user_id: user.id,
          name,
          emoji,
          position: topics.length,
          archived: false,
          created_at: new Date().toISOString(),
        }

        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('topics')
            .insert({ user_id: user.id, name, emoji, position: topics.length, archived: false })
            .select()
            .single()
          if (error) throw error
          set({ topics: [...topics, data] })
          return data
        } else {
          set({ topics: [...topics, newTopic] })
          return newTopic
        }
      },

      updateTopic: async (id, updates) => {
        const { topics } = get()
        const updated = topics.map(t => t.id === id ? { ...t, ...updates } : t)

        if (isSupabaseConfigured) {
          const { error } = await supabase.from('topics').update(updates).eq('id', id)
          if (error) throw error
        }

        set({ topics: updated })
      },

      archiveTopic: async (id) => {
        const { topics } = get()
        const updated = topics.filter(t => t.id !== id)
        const archived = topics.find(t => t.id === id)

        if (isSupabaseConfigured) {
          await supabase.from('topics').update({ archived: true }).eq('id', id)
        }

        set({
          topics: updated,
          archivedTopics: archived ? [...get().archivedTopics, { ...archived, archived: true }] : get().archivedTopics,
        })
      },

      reorderTopics: async (reordered) => {
        const withPositions = reordered.map((t, i) => ({ ...t, position: i }))
        set({ topics: withPositions })

        if (isSupabaseConfigured) {
          await Promise.all(
            withPositions.map(t =>
              supabase.from('topics').update({ position: t.position }).eq('id', t.id)
            )
          )
        }
      },

      // --- CHECK-IN ---
      setEntryStatus: (topicId, status) => {
        set(state => ({
          currentEntries: {
            ...state.currentEntries,
            [topicId]: { ...state.currentEntries[topicId], status },
          }
        }))
      },

      setEntryNote: (topicId, note) => {
        set(state => ({
          currentEntries: {
            ...state.currentEntries,
            [topicId]: { ...state.currentEntries[topicId], note },
          }
        }))
      },

      setDayNote: (note) => set({ dayNote: note }),

      submitCheckin: async () => {
        const { user, topics, currentEntries, dayNote } = get()
        const today = format(new Date(), 'yyyy-MM-dd')

        const topicEntriesData = topics
          .filter(t => currentEntries[t.id]?.status)
          .map(t => ({
            topic_id: t.id,
            status: currentEntries[t.id].status,
            note: currentEntries[t.id].note || null,
          }))

        if (isSupabaseConfigured) {
          const { data: checkin, error } = await supabase
            .from('checkins')
            .upsert({
              user_id: user.id,
              date: today,
              day_note: dayNote || null,
            }, { onConflict: 'user_id,date' })
            .select()
            .single()

          if (error) throw error

          // Upsert topic entries
          if (topicEntriesData.length > 0) {
            const entriesWithCheckinId = topicEntriesData.map(e => ({
              ...e,
              checkin_id: checkin.id,
            }))
            await supabase
              .from('topic_entries')
              .upsert(entriesWithCheckinId, { onConflict: 'checkin_id,topic_id' })
          }

          set({
            todayCheckin: { ...checkin, topic_entries: topicEntriesData },
            checkInSubmitted: true,
          })
          // Refresh history so Trends updates immediately
          get().loadHistory()
        } else {
          // Mock mode
          const mockedCheckin = {
            id: 'mock-today',
            user_id: user.id,
            date: today,
            day_note: dayNote || null,
            topic_entries: topicEntriesData,
            created_at: new Date().toISOString(),
          }
          set({
            todayCheckin: mockedCheckin,
            checkInSubmitted: true,
            history: [mockedCheckin, ...get().history.filter(h => h.date !== today)],
          })
        }
      },

      resetTodayCheckin: () => {
        set({
          todayCheckin: null,
          currentEntries: {},
          dayNote: '',
          checkInSubmitted: false,
        })
      },

      // --- HISTORY ---
      loadHistory: async () => {
        const { user, isPremium } = get()
        if (!isSupabaseConfigured) {
          set({ history: MOCK_HISTORY, historyLoaded: true })
          return
        }

        const limitDate = isPremium
          ? null
          : format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')

        let query = supabase
          .from('checkins')
          .select('*, topic_entries(*)')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(365)

        if (limitDate) {
          query = query.gte('date', limitDate)
        }

        const { data, error } = await query
        if (!error && data) {
          set({ history: data, historyLoaded: true })
        }
      },

      // --- INTENTIONS ---
      loadIntentions: async () => {
        const { user } = get()
        if (!isSupabaseConfigured || !user) return
        const { data } = await supabase
          .from('intentions')
          .select('topic_id, text, type')
          .eq('user_id', user.id)
          .eq('type', 'topic')
          .not('topic_id', 'is', null)
        if (data) {
          const map = {}
          data.forEach(item => { map[item.topic_id] = item.text })
          set({ topicIntentions: map })
        }
      },

      setTopicIntentionLocal: (topicId, text) => {
        set(state => ({
          topicIntentions: { ...state.topicIntentions, [topicId]: text }
        }))
      },

      // --- JOURNAL ---
      updateJournalEntry: async (note, newText) => {
        const { user } = get()
        if (!isSupabaseConfigured || !user) return

        if (note.type === 'day') {
          // Update day_note on the checkin
          const { data: checkin } = await supabase
            .from('checkins')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', note.date)
            .single()
          if (checkin) {
            await supabase.from('checkins').update({ day_note: newText }).eq('id', checkin.id)
          }
        } else {
          // Update topic entry note
          await supabase.from('topic_entries').update({ note: newText }).eq('id', note.rawId)
        }
        await get().loadHistory()
      },

      deleteJournalEntry: async (note) => {
        const { user } = get()
        if (!isSupabaseConfigured || !user) return

        if (note.type === 'day') {
          // Clear day_note (set to null)
          const { data: checkin } = await supabase
            .from('checkins')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', note.date)
            .single()
          if (checkin) {
            await supabase.from('checkins').update({ day_note: null }).eq('id', checkin.id)
          }
        } else {
          // Clear topic note
          await supabase.from('topic_entries').update({ note: null }).eq('id', note.rawId)
        }
        await get().loadHistory()
      },

      saveJournalEntry: async (text, topicId = null) => {
        const { user, history } = get()
        const today = format(new Date(), 'yyyy-MM-dd')

        if (isSupabaseConfigured && user) {
          // Upsert today's checkin (create if doesn't exist)
          const { data: checkin, error: checkinError } = await supabase
            .from('checkins')
            .upsert({ user_id: user.id, date: today }, { onConflict: 'user_id,date' })
            .select()
            .single()

          if (checkinError) throw checkinError

          if (topicId) {
            // Save as topic note
            await supabase.from('topic_entries').upsert({
              checkin_id: checkin.id,
              topic_id: topicId,
              status: 'yellow', // neutral default if no status set
              note: text,
            }, { onConflict: 'checkin_id,topic_id' })
          } else {
            // Save as day note
            await supabase.from('checkins')
              .update({ day_note: text })
              .eq('id', checkin.id)
          }

          // Reload history to reflect new entry
          await get().loadHistory()
        } else {
          // Mock mode — add to local history
          const existingEntry = history.find(h => h.date === today)
          if (existingEntry) {
            const updated = history.map(h => {
              if (h.date !== today) return h
              if (topicId) {
                return { ...h, topic_entries: [...(h.topic_entries || []).filter(te => te.topic_id !== topicId), { topic_id: topicId, note: text, status: 'yellow' }] }
              }
              return { ...h, day_note: text }
            })
            set({ history: updated })
          } else {
            const newEntry = {
              id: `journal-${Date.now()}`,
              user_id: user?.id || 'mock',
              date: today,
              day_note: topicId ? null : text,
              created_at: new Date().toISOString(),
              topic_entries: topicId ? [{ topic_id: topicId, note: text, status: 'yellow' }] : [],
            }
            set({ history: [newEntry, ...history] })
          }
        }
      },

      // --- SETTINGS ---
      setReminderTime: (time) => set({ reminderTime: time }),
      setCelebrationsEnabled: (enabled) => set({ celebrationsEnabled: enabled }),
      setCelebrationStyle: (style) => set({ celebrationStyle: style }),
      setIconStyle: (style) => set({ iconStyle: style }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'innermark-storage',
      partialize: (state) => ({
        reminderTime: state.reminderTime,
        celebrationsEnabled: state.celebrationsEnabled,
        celebrationStyle: state.celebrationStyle,
        iconStyle: state.iconStyle,
        activeTab: state.activeTab,
      }),
    }
  )
)

export default useAppStore
