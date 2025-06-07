import api from './api';
import { Class, Subject, Topic } from '../types/content';

class ContentService {
  // Sınıfları getir
  async getClasses(): Promise<Class[]> {
    const response = await api.get('/classes');
    return response.data.data;
  }

  // Dersleri getir
  async getSubjects(): Promise<Subject[]> {
    const response = await api.get('/subjects');
    return response.data.data;
  }

  // Konuları getir (sınıfa göre filtrelenebilir)
  async getTopics(classId?: number): Promise<Topic[]> {
    const params = classId ? { classId } : {};
    const response = await api.get('/topics', { params });
    return response.data.data;
  }

  // Kullanıcının sınıfına göre konuları getir
  async getTopicsForUser(): Promise<Topic[]> {
    const response = await api.get('/users/me/topics');
    return response.data.data;
  }

  // Konu öğrenme durumunu işaretle
  async markTopicProgress(
    topicId: number,
    status: 'not_started' | 'in_progress' | 'learned' | 'needs_review'
  ): Promise<void> {
    await api.post('/progress/topic', {
      topicId,
      status,
    });
  }

  // Kullanıcının konu ilerlemesini getir
  async getUserProgress(): Promise<any> {
    const response = await api.get('/users/me/progress');
    return response.data.data;
  }
}

export default new ContentService();