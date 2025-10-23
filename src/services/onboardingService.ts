import api from './api';

export interface OnboardingProfilePayload {
  profileType?: string;
  primaryGoal: string;
  targetDate?: string | null;
  examType?: string | null;
  motivation?: string | null;
  studyFocusAreas?: string[];
  dailyAvailableMinutes?: number | null;
  weeklyAvailableMinutes?: number | null;
  preferredStudyTimes?: string | null;
  learningStyle?: string | null;
  reminderTime?: string | null;
}

export interface AvailabilitySlotPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  intensity?: string | null;
  priority?: string | null;
}

export interface AiPlanGoal {
  title: string;
  description: string;
  suggestedTimeline?: string | null;
}

export interface AiPlanHabit {
  name: string;
  frequency: string;
  reminderTime?: string | null;
}

export interface AiPlanScheduleItem {
  day: string;
  focus: string;
  durationMinutes?: number | null;
}

export interface AiPlanPayload {
  provider?: string;
  summary: string;
  persona?: string;
  keyFocus?: string[];
  goals?: AiPlanGoal[];
  habits?: AiPlanHabit[];
  schedule?: AiPlanScheduleItem[];
  encouragement?: string;
  generatedAt?: string;
}

export interface OnboardingProfile {
  id: string;
  profileType?: string | null;
  primaryGoal: string;
  targetDate?: string | null;
  examType?: string | null;
  motivation?: string | null;
  studyFocusAreas?: string[] | null;
  dailyAvailableMinutes?: number | null;
  weeklyAvailableMinutes?: number | null;
  preferredStudyTimes?: string | null;
  learningStyle?: string | null;
  reminderTime?: string | null;
  updatedAt?: string | null;
}

export interface OnboardingAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  intensity?: string | null;
  priority?: string | null;
}

export interface OnboardingProfileResponse {
  profile: OnboardingProfile | null;
  availability: OnboardingAvailability[];
  aiPlan?: AiPlanPayload | null;
}

const mapProfile = (raw: any): OnboardingProfile | null => {
  if (!raw) return null;

  return {
    id: raw.id,
    profileType: raw.profile_type ?? raw.profileType ?? null,
    primaryGoal: raw.primary_goal ?? raw.primaryGoal ?? '',
    targetDate: raw.target_date ?? raw.targetDate ?? null,
    examType: raw.exam_type ?? raw.examType ?? null,
    motivation: raw.motivation ?? null,
    studyFocusAreas: raw.study_focus_areas ?? raw.studyFocusAreas ?? null,
    dailyAvailableMinutes: raw.daily_available_minutes ?? raw.dailyAvailableMinutes ?? null,
    weeklyAvailableMinutes: raw.weekly_available_minutes ?? raw.weeklyAvailableMinutes ?? null,
    preferredStudyTimes: raw.preferred_study_times ?? raw.preferredStudyTimes ?? null,
    learningStyle: raw.learning_style ?? raw.learningStyle ?? null,
    reminderTime: raw.reminder_time ?? raw.reminderTime ?? null,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
  };
};

const mapAvailability = (items: any[]): OnboardingAvailability[] =>
  (items || []).map((item) => ({
    id: item.id,
    dayOfWeek: item.day_of_week ?? item.dayOfWeek,
    startTime: item.start_time ?? item.startTime,
    endTime: item.end_time ?? item.endTime,
    intensity: item.intensity ?? null,
    priority: item.priority ?? null,
  }));

const mapAiPlan = (raw: any): AiPlanPayload | null => {
  if (!raw) return null;
  return {
    provider: raw.provider ?? null,
    summary: raw.summary ?? '',
    persona: raw.persona ?? null,
    keyFocus: raw.keyFocus ?? raw.key_focus ?? [],
    goals: raw.goals ?? [],
    habits: raw.habits ?? [],
    schedule: raw.schedule ?? [],
    encouragement: raw.encouragement ?? null,
    generatedAt: raw.generatedAt ?? raw.generated_at ?? null,
  };
};

const mapResponse = (payload: any): OnboardingProfileResponse => ({
  profile: mapProfile(payload.profile),
  availability: mapAvailability(payload.availability || []),
  aiPlan: mapAiPlan(payload.aiPlan || payload.ai_plan),
});

class OnboardingService {
  async getProfile(): Promise<OnboardingProfileResponse> {
    try {
      const response = await api.get('/onboarding');
      return mapResponse(response.data.data || {});
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return { profile: null, availability: [], aiPlan: null };
      }
      throw error;
    }
  }

  async saveProfile(
    profile: OnboardingProfilePayload,
    availability: AvailabilitySlotPayload[],
    replaceAvailability = true,
  ): Promise<OnboardingProfileResponse> {
    const response = await api.post('/onboarding', {
      profile,
      availability,
      replaceAvailability,
    });
    return mapResponse(response.data.data || {});
  }
}

export default new OnboardingService();
