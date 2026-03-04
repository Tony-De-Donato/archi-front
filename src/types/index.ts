export interface CreateCompanyProfileDto {
  legalName: string;
  industry?: string;
  description?: string;
  siret?: string;
}

export interface RegisterCompanyDto {
  email: string;
  password?: string;
  profile: CreateCompanyProfileDto;
}

export interface CreateStudentProfileDto {
  firstName: string;
  lastName: string;
}

export interface RegisterStudentDto {
  email: string;
  password?: string;
  profile: CreateStudentProfileDto;
}

export interface LoginDto {
  email?: string;
  password?: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
}

export interface User {
  id: number;
  email: string;
  role: 'STUDENT' | 'COMPANY' | 'ADMIN';
}

export interface Offer {
  id: number;
  title: string;
  companyId: number;
  companyName?: string;
  location: string;
  description: string;
  salary?: number | null;
  type?: string; // e.g. "Alternance", "CDI"
  postedAt?: string;
}

export interface Application {
  id: number;
  offerId: number;
  studentId: number;
  status: string;
  appliedAt: string;
  offer?: Offer;
}
