import api from './api';
import { WeeklyProgram, ProgramTask } from '../types/content';

const mapProgramSummary = (item: any): WeeklyProgram => {
  const totalTasks = Number(item.total_tasks ?? item.totalTasks ?? 0);
  const completedTasks = Number(item.completed_tasks ?? item.completedTasks ?? 0);
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    id: item.id,
    title: item.title,
    startDate: item.start_date ?? item.startDate,
    endDate: item.end_date ?? item.endDate,
    createdAt: item.created_at ?? item.createdAt,
    totalTasks,
    completedTasks,
    completionPercentage,
    isCurrentWeek: Boolean(item.isCurrentWeek),
    tasks: [],
  };
};

const mapProgramTask = (item: any): ProgramTask => ({
  id: item.id,
  weeklyProgramId: item.weekly_program_id,
  title: item.title ?? item.description ?? '',
  description: item.description ?? '',
  taskDate: item.task_date,
  isCompleted: item.is_completed ?? false,
  completedAt: item.completed_at ?? null,
  topicId: item.topic_id ?? null,
  topicName: item.topic_name ?? null,
  subjectName: item.subject_name ?? null,
  createdAt: item.created_at ?? item.createdAt,
});

const mapProgramDetail = (item: any): WeeklyProgram => {
  const totalTasks = Number(item.totalTasks ?? item.total_tasks ?? 0);
  const completedTasks = Number(item.completedTasks ?? item.completed_tasks ?? 0);
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    id: item.id,
    title: item.title,
    startDate: item.start_date ?? item.startDate,
    endDate: item.end_date ?? item.endDate,
    createdAt: item.created_at ?? item.createdAt,
    totalTasks,
    completedTasks,
    completionPercentage,
    isCurrentWeek: Boolean(item.isCurrentWeek),
    tasks: (item.tasks || []).map(mapProgramTask),
  };
};

class ProgramService {
  async getPrograms(): Promise<WeeklyProgram[]> {
    const response = await api.get('/programs');
    return (response.data.data || []).map(mapProgramSummary);
  }

  async createProgram(title: string, startDate: string, endDate: string): Promise<WeeklyProgram> {
    const response = await api.post('/programs', { title, startDate, endDate });
    return mapProgramDetail({ ...response.data.data, tasks: [] });
  }

  async deleteProgram(id: string): Promise<void> {
    await api.delete(`/programs/${id}`);
  }

  async getProgramById(id: string): Promise<WeeklyProgram> {
    const response = await api.get(`/programs/${id}`);
    return mapProgramDetail(response.data.data);
  }

  async addTask(
    programId: string,
    payload: { title: string; description: string; taskDate: string; topicId?: string | null }
  ): Promise<ProgramTask> {
    const response = await api.post(`/programs/${programId}/tasks`, {
      title: payload.title,
      description: payload.description,
      taskDate: payload.taskDate,
      topicId: payload.topicId ?? null,
    });
    return mapProgramTask(response.data.data);
  }

  async updateTask(
    programId: string,
    taskId: string,
    payload: { title?: string; description?: string; taskDate?: string; topicId?: string | null }
  ): Promise<ProgramTask> {
    const response = await api.put(`/programs/${programId}/tasks/${taskId}`, {
      title: payload.title,
      description: payload.description,
      taskDate: payload.taskDate,
      topicId: payload.topicId ?? null,
    });
    return mapProgramTask(response.data.data);
  }

  async completeTask(programId: string, taskId: string): Promise<ProgramTask> {
    const response = await api.put(`/programs/${programId}/tasks/${taskId}/complete`);
    return mapProgramTask(response.data.data);
  }

  async deleteTask(programId: string, taskId: string): Promise<void> {
    await api.delete(`/programs/${programId}/tasks/${taskId}`);
  }
}

export default new ProgramService();
