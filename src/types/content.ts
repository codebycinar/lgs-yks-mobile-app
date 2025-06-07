export interface Exam {
  id: number;
  name: string;
  examDate: string;
  targetClassLevels: number[];
  prepClassLevels: number[];
  isActive: boolean;
  description?: string;
}

export interface Class {
  id: number;
  name: string;
  minClassLevel: number;
  maxClassLevel: number;
  examId?: number;
  examName?: string;
  isActive: boolean;
}

export interface Subject {
  id: number;
  name: string;
  orderIndex: number;
  isActive: boolean;
}

export interface Topic {
  id: number;
  name: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  parentId?: number;
  parentName?: string;
  orderIndex: number;
  isActive: boolean;
}

export interface UserTopicProgress {
  userId: number;
  topicId: number;
  status: 'not_started' | 'in_progress' | 'learned' | 'needs_review';
  updatedAt: string;
}

export interface Goal {
  id: number;
  userId: number;
  description: string;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface WeeklyProgram {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  title: string;
  createdAt: string;
  tasks: ProgramTask[];
}

export interface ProgramTask {
  id: number;
  weeklyProgramId: number;
  description: string;
  taskDate: string;
  isCompleted: boolean;
  completedAt?: string;
  topicId?: number;
  topicName?: string;
  createdAt: string;
}