import { OnboardingProfilePayload, AvailabilitySlotPayload } from '../services/onboardingService';

export type OnboardingStackParamList = {
  Intro: undefined;
  Availability: {
    profile: OnboardingProfilePayload;
  };
  Summary: {
    profile: OnboardingProfilePayload;
    availability: AvailabilitySlotPayload[];
  };
};

