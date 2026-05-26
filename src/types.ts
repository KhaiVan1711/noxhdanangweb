export interface Project {
  id: string;
  name: string;
  location: string;
  investor: string;
  status: string;
  price: string;
  priceRaw: number;
  progress: number;
  image: string;
  tag: "receiving" | "coming_soon" | "completed";
  coordinates: { x: number; y: number };
  lat?: number;
  lng?: number;
  districts: string;
  scale: string;
  types: string;
  deadline: string;
  hotline: string;
  requirements: string[];
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface EligibilityCriteria {
  targetGroup: string; // 'state_worker' | 'low_income' | 'industrial_worker' | 'other'
  housingStatus: string; // 'no_house' | 'insufficient_space' | 'has_house'
  residenceStatus: string; // 'permanent_resident' | 'temporary_resident_over_1yr' | 'temporary_resident_under_1yr'
  incomeStatus: string; // 'none_taxpayer' | 'taxpayer'
}

export interface TrackingProfile {
  id: string;
  fullName: string;
  projectName: string;
  status: "submitting" | "reviewing" | "approved" | "rejected" | "signed_contract";
  progressPercent: number;
  updateDate: string;
  note: string;
}
