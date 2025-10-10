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

export interface OnboardingProfileResponse {
  profile: {
    id: string;
    primary_goal: string;
    target_date?: string | null;
    exam_type?: string | null;
    motivation?: string | null;
    study_focus_areas?: string[] | null;
    daily_available_minutes?: number | null;
    weekly_available_minutes?: number | null;
    preferred_study_times?: string | null;
    learning_style?: string | null;
    reminder_time?: string | null;
  } | null;
  availability: Array<{
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    intensity?: string | null;
    priority?: string | null;
  }>;
}

class OnboardingService {
  async getProfile(): Promise<OnboardingProfileResponse> {
    const response = await api.get('/onboarding');
    return response.data.data;
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
    return response.data.data;
  }
}

export default new OnboardingService();

