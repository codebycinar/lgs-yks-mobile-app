import api from './api';

export interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface AISummaryPayload {
  summary: string;
  tips: string[];
  statistics: {
    completedGoals: number;
    pendingGoals: number;
    goalCompletionRate: number;
    completedTasks: number;
    pendingTasks: number;
  };
  upcomingTasks: Array<{
    id: string;
    title: string;
    description: string;
    task_date: string;
    program_title: string;
  }>;
}

class AIService {
  async listInsights(limit = 10): Promise<AIInsight[]> {
    const response = await api.get('/ai/insights', { params: { limit } });
    return response.data.data;
  }

  async generateSummary(): Promise<AISummaryPayload> {
    const response = await api.post('/ai/insights/generate');
    return response.data.data;
  }

  async markInsightRead(id: string): Promise<void> {
    await api.patch(`/ai/insights/${id}/read`);
  }
}

export default new AIService();

