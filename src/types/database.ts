export type Department = {
  department_id: string;
  department_name: string;
  created_at: string;
  updated_at: string;
};

export type Nurse = {
  nurse_id: string;
  nurse_name: string;
  department_id: string;
  contact_number: string;
  email: string;
  shift: string;
  created_at: string;
  updated_at: string;
};

export type Patient = {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  discharge_date: string | null;
  bed_number: string;
  contact_number: string;
  emergency_contact: string;
  created_at: string;
  updated_at: string;
};

export type Medication = {
  medication_id: string;
  medication_name: string;
  dosage: string;
  form: string;
  created_at: string;
  updated_at: string;
};

export type RouteOfAdministration = {
  route_id: string;
  route_name: string;
  created_at: string;
};

export type NurseLog = {
  log_id: string;
  patient_id: string;
  nurse_id: string;
  medication_id: string;
  route_id: string;
  administration_time: string;
  dosage_given: string;
  remarks: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type MedicationSchedule = {
  schedule_id: string;
  patient_id: string;
  medication_id: string;
  route_id: string;
  scheduled_time: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type VitalSign = {
  vital_id: string;
  patient_id: string;
  nurse_id: string;
  recorded_time: string;
  temperature: number;
  blood_pressure: string;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  remarks: string;
  created_at: string;
};

export type AppRole = 'admin' | 'nurse';

export type UserRole = {
  id: string;
  user_id: string;
  role: AppRole;
};
