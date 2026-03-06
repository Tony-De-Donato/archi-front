import { ref } from 'vue';
import { defineStore } from 'pinia';
import { studentControllerGetStudentProfile } from '../openApi';

export interface StudentProfile {
  userId: number;
  firstName: string;
  lastName: string;
  fieldOfStudy?: string;
  currentLevel?: string;
}

export const useStudentStore = defineStore('students', () => {
  const students = ref<Record<number, StudentProfile>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchStudentById(userId: number) {
    if (students.value[userId]) return students.value[userId];

    loading.value = true;
    error.value = null;
    try {
      const { data } = await studentControllerGetStudentProfile({
        path: { userId }
      });
      if (data) {
        students.value[userId] = data as any as StudentProfile;
        return students.value[userId];
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch student profile';
      console.error(`Error fetching student ${userId}:`, err);
    } finally {
      loading.value = false;
    }
    return null;
  }

  function getStudentName(userId: number): string {
    const student = students.value[userId];
    if (!student) return `Candidat #${userId}`;
    return `${student.firstName} ${student.lastName}`;
  }

  return {
    students,
    loading,
    error,
    fetchStudentById,
    getStudentName
  };
});
