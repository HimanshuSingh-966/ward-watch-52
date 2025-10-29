-- ============================================
-- NURSE LOGGING SYSTEM - SIMPLIFIED SEED DATA
-- ============================================
-- This is a simplified version without complex foreign key relationships for tasks, vital signs, and nurse logs
-- Use this if the complex version with JOINs doesn't work

-- ============================================
-- STEP 1: DELETE ALL EXISTING DATA
-- ============================================

DELETE FROM vital_signs;
DELETE FROM nurse_logs;
DELETE FROM tasks;
DELETE FROM medication_schedules;
DELETE FROM nurses;
DELETE FROM patients;
DELETE FROM procedures;
DELETE FROM investigations;
DELETE FROM medications;
DELETE FROM routes_of_administration;
DELETE FROM departments;

-- ============================================
-- STEP 2-8: INSERT BASIC DATA
-- ============================================

INSERT INTO departments (department_name) VALUES
('Emergency'),
('ICU'),
('General Ward'),
('Pediatrics'),
('Surgery');

INSERT INTO routes_of_administration (route_name) VALUES
('Oral'),
('Intravenous (IV)'),
('Intramuscular (IM)'),
('Subcutaneous (SC)'),
('Topical'),
('Inhalation'),
('Sublingual');

INSERT INTO medications (medication_name, dosage, form) VALUES
('Paracetamol', '500mg', 'Tablet'),
('Ibuprofen', '400mg', 'Tablet'),
('Amoxicillin', '500mg', 'Capsule'),
('Metformin', '850mg', 'Tablet'),
('Insulin', '10 units', 'Injection'),
('Aspirin', '75mg', 'Tablet'),
('Omeprazole', '20mg', 'Capsule'),
('Atorvastatin', '40mg', 'Tablet'),
('Morphine', '10mg', 'Injection'),
('Salbutamol', '100mcg', 'Inhaler'),
('Ceftriaxone', '1g', 'Injection'),
('Furosemide', '40mg', 'Tablet');

INSERT INTO investigations (investigation_name, description, normal_range) VALUES
('Complete Blood Count', 'CBC - measures different components of blood', 'WBC: 4-11 K/uL, RBC: 4.5-5.5 M/uL'),
('Blood Glucose', 'Fasting blood sugar test', '70-100 mg/dL'),
('Liver Function Test', 'Tests for liver enzymes', 'ALT: 7-56 U/L, AST: 10-40 U/L'),
('Kidney Function Test', 'Creatinine and BUN', 'Creatinine: 0.7-1.3 mg/dL'),
('Chest X-Ray', 'Radiological examination of chest', 'N/A'),
('ECG', 'Electrocardiogram', 'HR: 60-100 bpm'),
('Urinalysis', 'Urine examination', 'pH: 4.5-8.0'),
('HbA1c', 'Glycated hemoglobin test', '< 5.7%');

INSERT INTO procedures (procedure_name, description, duration) VALUES
('Wound Dressing', 'Change and clean wound dressing', '15 mins'),
('Catheterization', 'Urinary catheter insertion', '20 mins'),
('IV Line Insertion', 'Insert intravenous line', '10 mins'),
('Blood Draw', 'Venipuncture for blood sample', '5 mins'),
('Nasogastric Tube', 'NG tube insertion', '15 mins'),
('Oxygen Therapy', 'Administer oxygen via mask/nasal', '30 mins'),
('Nebulization', 'Administer medication via nebulizer', '20 mins'),
('Physiotherapy', 'Chest physiotherapy session', '30 mins');

-- Insert nurses with department relationships
INSERT INTO nurses (nurse_name, department_id, contact_number, email, shift) 
SELECT 'Sarah Johnson', department_id, '+1-555-0101', 'sarah.j@hospital.com', 'Morning' FROM departments WHERE department_name = 'Emergency'
UNION ALL SELECT 'Michael Chen', department_id, '+1-555-0102', 'michael.c@hospital.com', 'Evening' FROM departments WHERE department_name = 'ICU'
UNION ALL SELECT 'Emily Rodriguez', department_id, '+1-555-0103', 'emily.r@hospital.com', 'Morning' FROM departments WHERE department_name = 'General Ward'
UNION ALL SELECT 'James Wilson', department_id, '+1-555-0104', 'james.w@hospital.com', 'Night' FROM departments WHERE department_name = 'Emergency'
UNION ALL SELECT 'Priya Patel', department_id, '+1-555-0105', 'priya.p@hospital.com', 'Morning' FROM departments WHERE department_name = 'Pediatrics'
UNION ALL SELECT 'David Kim', department_id, '+1-555-0106', 'david.k@hospital.com', 'Evening' FROM departments WHERE department_name = 'ICU'
UNION ALL SELECT 'Lisa Anderson', department_id, '+1-555-0107', 'lisa.a@hospital.com', 'Morning' FROM departments WHERE department_name = 'Surgery'
UNION ALL SELECT 'Ahmed Hassan', department_id, '+1-555-0108', 'ahmed.h@hospital.com', 'Night' FROM departments WHERE department_name = 'General Ward';

INSERT INTO patients (patient_name, age, gender, admission_date, bed_number, ward, status, diagnosis, ipd_number, contact_number, emergency_contact) VALUES
('John Smith', 45, 'Male', '2025-10-25', 'A-101', 'Emergency', 'Critical', 'Acute Myocardial Infarction', 'IPD2025001', '+1-555-1001', '+1-555-1002'),
('Maria Garcia', 62, 'Female', '2025-10-26', 'B-205', 'ICU', 'Stable', 'Pneumonia', 'IPD2025002', '+1-555-1003', '+1-555-1004'),
('Robert Lee', 34, 'Male', '2025-10-27', 'C-301', 'General Ward', 'Stable', 'Type 2 Diabetes', 'IPD2025003', '+1-555-1005', '+1-555-1006'),
('Emma Williams', 8, 'Female', '2025-10-27', 'D-102', 'Pediatrics', 'Recovering', 'Asthma Exacerbation', 'IPD2025004', '+1-555-1007', '+1-555-1008'),
('Thomas Brown', 71, 'Male', '2025-10-28', 'B-210', 'ICU', 'Critical', 'Septic Shock', 'IPD2025005', '+1-555-1009', '+1-555-1010'),
('Jennifer Davis', 29, 'Female', '2025-10-28', 'E-401', 'Surgery', 'Post-Op', 'Appendectomy', 'IPD2025006', '+1-555-1011', '+1-555-1012'),
('Kevin Nguyen', 55, 'Male', '2025-10-29', 'C-305', 'General Ward', 'Stable', 'Hypertension', 'IPD2025007', '+1-555-1013', '+1-555-1014'),
('Sophia Martinez', 6, 'Female', '2025-10-29', 'D-105', 'Pediatrics', 'Stable', 'Gastroenteritis', 'IPD2025008', '+1-555-1015', '+1-555-1016');

-- Insert medication schedules with proper relationships
WITH 
  p AS (SELECT patient_id, patient_name FROM patients),
  m AS (SELECT medication_id, medication_name FROM medications),
  r AS (SELECT route_id, route_name FROM routes_of_administration)
INSERT INTO medication_schedules (patient_id, medication_id, route_id, scheduled_time, frequency, start_date, end_date, is_active)
SELECT p.patient_id, m.medication_id, r.route_id, scheduled_time, frequency, start_date, end_date, is_active FROM (VALUES
  ('John Smith', 'Aspirin', 'Oral', '08:00:00', 'Once Daily', '2025-10-25', '2025-11-25', true),
  ('John Smith', 'Morphine', 'Intravenous (IV)', '12:00:00', 'Every 6 hours', '2025-10-25', NULL, true),
  ('Maria Garcia', 'Amoxicillin', 'Oral', '09:00:00', 'Three times daily', '2025-10-26', '2025-11-02', true),
  ('Maria Garcia', 'Ceftriaxone', 'Intravenous (IV)', '14:00:00', 'Twice daily', '2025-10-26', '2025-11-01', true),
  ('Robert Lee', 'Metformin', 'Oral', '07:00:00', 'Twice daily', '2025-10-27', NULL, true),
  ('Robert Lee', 'Insulin', 'Subcutaneous (SC)', '07:30:00', 'Once Daily', '2025-10-27', NULL, true),
  ('Emma Williams', 'Salbutamol', 'Inhalation', '08:00:00', 'Four times daily', '2025-10-27', '2025-11-03', true),
  ('Thomas Brown', 'Ceftriaxone', 'Intravenous (IV)', '06:00:00', 'Every 8 hours', '2025-10-28', NULL, true),
  ('Jennifer Davis', 'Paracetamol', 'Oral', '08:00:00', 'Three times daily', '2025-10-28', '2025-11-04', true),
  ('Kevin Nguyen', 'Atorvastatin', 'Oral', '21:00:00', 'Once Daily', '2025-10-29', NULL, true),
  ('Sophia Martinez', 'Omeprazole', 'Oral', '08:00:00', 'Once Daily', '2025-10-29', '2025-11-05', true)
) AS v(patient_name, medication_name, route_name, scheduled_time, frequency, start_date, end_date, is_active)
JOIN p ON p.patient_name = v.patient_name
JOIN m ON m.medication_name = v.medication_name
JOIN r ON r.route_name = v.route_name;

-- ============================================
-- NOTE: Tasks, vital_signs, and nurse_logs
-- ============================================
-- You'll need to manually add these after running this script
-- because they require the auto-generated UUIDs from the above inserts.
-- Use the Lovable Cloud interface to get the actual IDs and then insert them.
