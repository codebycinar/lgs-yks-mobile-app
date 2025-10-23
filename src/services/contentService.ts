import api from './api';
import { Class, Subject, Topic } from '../types/content';

class ContentService {
  async getClasses(): Promise<Class[]> {
    const response = await api.get('/classes');
    return response.data.data || [];
  }

  async getSubjects(): Promise<Subject[]> {
    const response = await api.get('/subjects');
    return response.data.data || [];
  }

  async getTopicsForUser(): Promise<Topic[]> {
    const response = await api.get('/users/me/topics');
    const items = response.data.data || [];
    return items.map((item: any) => ({
      id: item.id,
      name: item.name,
      subjectId: item.subject_id ?? item.subjectId,
      subjectName: item.subject_name ?? item.subjectName,
      classId: item.class_id ?? item.classId,
      className: item.class_name ?? item.className,
      parentId: item.parent_id ?? item.parentId ?? null,
      parentName: item.parent_name ?? item.parentName ?? null,
      orderIndex: item.order_index ?? item.orderIndex ?? 0,
      isActive: item.is_active ?? item.isActive ?? true,
    }));
  }

  async markTopicProgress(
    topicId: string,
    status: 'not_started' | 'in_progress' | 'learned' | 'needs_review'
  ): Promise<void> {
    await api.put(`/progress/topic/${topicId}`, {
      status,
    });
  }

  async getUserProgress(): Promise<
    Array<{ topicId: string; status: Topic['status']; updatedAt: string }>
  > {
    const response = await api.get('/progress');
    const items = response.data.data || [];
    return items.map((item: any) => ({
      topicId: item.topic_id ?? item.topicId ?? '',
      status: item.status ?? 'not_started',
      updatedAt: item.progress_updated_at ?? item.updated_at ?? null,
    }));
  }
}

export default new ContentService();
