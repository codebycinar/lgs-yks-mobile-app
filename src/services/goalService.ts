import api from './api';
import { Goal } from '../types/content';

const mapGoal = (item: any): Goal => {
  const targetDateRaw = item.target_date ?? item.targetDate ?? null;
  const targetDate = targetDateRaw ? new Date(targetDateRaw).toISOString().split('T')[0] : null;
  const completed = item.is_completed ?? item.isCompleted ?? false;

  let daysRemaining: number | null = null;
  if (targetDate) {
    const diffMs = new Date(targetDate).getTime() - new Date().setHours(0, 0, 0, 0);
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  const derivedIsOverdue = targetDate ? !completed && (daysRemaining ?? 0) < 0 : false;

  return {
    id: item.id,
    title: item.title ?? item.description ?? '',
    description: item.description,
    targetDate,
    isCompleted: completed,
    completedAt: item.completed_at ?? item.completedAt ?? null,
    createdAt: item.created_at ?? item.createdAt,
    isOverdue: item.isOverdue ?? derivedIsOverdue,
    daysRemaining: item.daysRemaining ?? (daysRemaining !== null ? daysRemaining : null),
  };
};

class GoalService {
  async getGoals(status?: 'completed' | 'active'): Promise<Goal[]> {
    const params = status ? { status } : {};
    const response = await api.get('/goals', { params });
    return (response.data.data || []).map(mapGoal);
  }

  async createGoal(description: string, targetDate?: string | null): Promise<Goal> {
    const title = description.trim().slice(0, 120);
    const response = await api.post('/goals', {
      title,
      description,
      targetDate: targetDate ?? null,
    });
    return mapGoal(response.data.data);
  }

  async updateGoal(
    id: string,
    payload: { title?: string; description?: string; targetDate?: string | null }
  ): Promise<Goal> {
    const response = await api.put(`/goals/${id}`, payload);
    return mapGoal(response.data.data);
  }

  async completeGoal(id: string): Promise<Goal> {
    const response = await api.put(`/goals/${id}/complete`);
    return mapGoal(response.data.data);
  }

  async deleteGoal(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  }
}

export default new GoalService();
