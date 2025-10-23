export interface Exam {
  id: string;
  name: string;
  examDate: string | null;
  targetClassLevels: number[];
  prepClassLevels: number[];
  isActive: boolean;
  description?: string | null;
}

export interface Class {
  id: string;
  name: string;
  minClassLevel: number;
  maxClassLevel: number;
  examId?: string | null;
  examName?: string | null;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  orderIndex: number;
  isActive: boolean;
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  parentId?: string | null;
  parentName?: string | null;
  orderIndex: number;
  isActive: boolean;
  status?: 'not_started' | 'in_progress' | 'learned' | 'needs_review';
  updatedAt?: string | null;
}

export interface UserTopicProgress {
  topicId: string;
  status: 'not_started' | 'in_progress' | 'learned' | 'needs_review';
  updatedAt: string | null;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  isOverdue?: boolean;
  daysRemaining?: number | null;
}

export interface WeeklyProgram {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  isCurrentWeek: boolean;
  tasks: ProgramTask[];
}

export interface ProgramTask {
  id: string;
  weeklyProgramId: string;
  title: string;
  description: string;
  taskDate: string;
  isCompleted: boolean;
  completedAt?: string | null;
  topicId?: string | null;
  topicName?: string | null;
  subjectName?: string | null;
  createdAt: string;
}

