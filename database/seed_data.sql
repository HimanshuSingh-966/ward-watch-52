-- ============================================
-- NURSE LOGGING SYSTEM - COMPLETE SEED DATA
-- ============================================
-- This script clears all existing data and populates the database with comprehensive dummy data

-- ============================================
-- STEP 1: DELETE ALL EXISTING DATA (in correct order to respect FK constraints)
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
-- Note: user_roles should be managed separately for actual users

-- ============================================
-- STEP 2: INSERT DEPARTMENTS
-- ============================================

INSERT INTO departments (department_id, department_name) VALUES
('d1', 'Emergency'),
('d2', 'ICU'),
('d3', 'General Ward'),
('d4', 'Pediatrics'),
('d5', 'Surgery');

-- ============================================
-- STEP 3: INSERT ROUTES OF ADMINISTRATION
-- ============================================

INSERT INTO routes_of_administration (route_id, route_name) VALUES
('r1', 'Oral'),
('r2', 'Intravenous (IV)'),
('r3', 'Intramuscular (IM)'),
('r4', 'Subcutaneous (SC)'),
('r5', 'Topical'),
('r6', 'Inhalation'),
('r7', 'Sublingual');

-- ============================================
-- STEP 4: INSERT MEDICATIONS
-- ============================================

INSERT INTO medications (medication_id, medication_name, dosage, form) VALUES
('m1', 'Paracetamol', '500mg', 'Tablet'),
('m2', 'Ibuprofen', '400mg', 'Tablet'),
('m3', 'Amoxicillin', '500mg', 'Capsule'),
('m4', 'Metformin', '850mg', 'Tablet'),
('m5', 'Insulin', '10 units', 'Injection'),
('m6', 'Aspirin', '75mg', 'Tablet'),
('m7', 'Omeprazole', '20mg', 'Capsule'),
('m8', 'Atorvastatin', '40mg', 'Tablet'),
('m9', 'Morphine', '10mg', 'Injection'),
('m10', 'Salbutamol', '100mcg', 'Inhaler'),
('m11', 'Ceftriaxone', '1g', 'Injection'),
('m12', 'Furosemide', '40mg', 'Tablet');

-- ============================================
-- STEP 5: INSERT INVESTIGATIONS
-- ============================================

INSERT INTO investigations (investigation_id, investigation_name, description, normal_range) VALUES
('i1', 'Complete Blood Count', 'CBC - measures different components of blood', 'WBC: 4-11 K/uL, RBC: 4.5-5.5 M/uL'),
('i2', 'Blood Glucose', 'Fasting blood sugar test', '70-100 mg/dL'),
('i3', 'Liver Function Test', 'Tests for liver enzymes', 'ALT: 7-56 U/L, AST: 10-40 U/L'),
('i4', 'Kidney Function Test', 'Creatinine and BUN', 'Creatinine: 0.7-1.3 mg/dL'),
('i5', 'Chest X-Ray', 'Radiological examination of chest', 'N/A'),
('i6', 'ECG', 'Electrocardiogram', 'HR: 60-100 bpm'),
('i7', 'Urinalysis', 'Urine examination', 'pH: 4.5-8.0'),
('i8', 'HbA1c', 'Glycated hemoglobin test', '< 5.7%');

-- ============================================
-- STEP 6: INSERT PROCEDURES
-- ============================================

INSERT INTO procedures (procedure_id, procedure_name, description, duration) VALUES
('p1', 'Wound Dressing', 'Change and clean wound dressing', '15 mins'),
('p2', 'Catheterization', 'Urinary catheter insertion', '20 mins'),
('p3', 'IV Line Insertion', 'Insert intravenous line', '10 mins'),
('p4', 'Blood Draw', 'Venipuncture for blood sample', '5 mins'),
('p5', 'Nasogastric Tube', 'NG tube insertion', '15 mins'),
('p6', 'Oxygen Therapy', 'Administer oxygen via mask/nasal', '30 mins'),
('p7', 'Nebulization', 'Administer medication via nebulizer', '20 mins'),
('p8', 'Physiotherapy', 'Chest physiotherapy session', '30 mins');

-- ============================================
-- STEP 7: INSERT NURSES
-- ============================================

INSERT INTO nurses (nurse_id, nurse_name, department_id, contact_number, email, shift) VALUES
('n1', 'Sarah Johnson', 'd1', '+1-555-0101', 'sarah.j@hospital.com', 'Morning'),
('n2', 'Michael Chen', 'd2', '+1-555-0102', 'michael.c@hospital.com', 'Evening'),
('n3', 'Emily Rodriguez', 'd3', '+1-555-0103', 'emily.r@hospital.com', 'Morning'),
('n4', 'James Wilson', 'd1', '+1-555-0104', 'james.w@hospital.com', 'Night'),
('n5', 'Priya Patel', 'd4', '+1-555-0105', 'priya.p@hospital.com', 'Morning'),
('n6', 'David Kim', 'd2', '+1-555-0106', 'david.k@hospital.com', 'Evening'),
('n7', 'Lisa Anderson', 'd5', '+1-555-0107', 'lisa.a@hospital.com', 'Morning'),
('n8', 'Ahmed Hassan', 'd3', '+1-555-0108', 'ahmed.h@hospital.com', 'Night');

-- ============================================
-- STEP 8: INSERT PATIENTS
-- ============================================

INSERT INTO patients (patient_id, patient_name, age, gender, admission_date, bed_number, ward, status, diagnosis, ipd_number, contact_number, emergency_contact) VALUES
('p1', 'John Smith', 45, 'Male', '2025-10-25', 'A-101', 'Emergency', 'Critical', 'Acute Myocardial Infarction', 'IPD2025001', '+1-555-1001', '+1-555-1002'),
('p2', 'Maria Garcia', 62, 'Female', '2025-10-26', 'B-205', 'ICU', 'Stable', 'Pneumonia', 'IPD2025002', '+1-555-1003', '+1-555-1004'),
('p3', 'Robert Lee', 34, 'Male', '2025-10-27', 'C-301', 'General Ward', 'Stable', 'Type 2 Diabetes', 'IPD2025003', '+1-555-1005', '+1-555-1006'),
('p4', 'Emma Williams', 8, 'Female', '2025-10-27', 'D-102', 'Pediatrics', 'Recovering', 'Asthma Exacerbation', 'IPD2025004', '+1-555-1007', '+1-555-1008'),
('p5', 'Thomas Brown', 71, 'Male', '2025-10-28', 'B-210', 'ICU', 'Critical', 'Septic Shock', 'IPD2025005', '+1-555-1009', '+1-555-1010'),
('p6', 'Jennifer Davis', 29, 'Female', '2025-10-28', 'E-401', 'Surgery', 'Post-Op', 'Appendectomy', 'IPD2025006', '+1-555-1011', '+1-555-1012'),
('p7', 'Kevin Nguyen', 55, 'Male', '2025-10-29', 'C-305', 'General Ward', 'Stable', 'Hypertension', 'IPD2025007', '+1-555-1013', '+1-555-1014'),
('p8', 'Sophia Martinez', 6, 'Female', '2025-10-29', 'D-105', 'Pediatrics', 'Stable', 'Gastroenteritis', 'IPD2025008', '+1-555-1015', '+1-555-1016');

-- ============================================
-- STEP 9: INSERT MEDICATION SCHEDULES
-- ============================================

INSERT INTO medication_schedules (schedule_id, patient_id, medication_id, route_id, scheduled_time, frequency, start_date, end_date, is_active) VALUES
('s1', 'p1', 'm6', 'r1', '08:00:00', 'Once Daily', '2025-10-25', '2025-11-25', true),
('s2', 'p1', 'm9', 'r2', '12:00:00', 'Every 6 hours', '2025-10-25', NULL, true),
('s3', 'p2', 'm3', 'r1', '09:00:00', 'Three times daily', '2025-10-26', '2025-11-02', true),
('s4', 'p2', 'm11', 'r2', '14:00:00', 'Twice daily', '2025-10-26', '2025-11-01', true),
('s5', 'p3', 'm4', 'r1', '07:00:00', 'Twice daily', '2025-10-27', NULL, true),
('s6', 'p3', 'm5', 'r4', '07:30:00', 'Once Daily', '2025-10-27', NULL, true),
('s7', 'p4', 'm10', 'r6', '08:00:00', 'Four times daily', '2025-10-27', '2025-11-03', true),
('s8', 'p5', 'm11', 'r2', '06:00:00', 'Every 8 hours', '2025-10-28', NULL, true),
('s9', 'p6', 'm1', 'r1', '08:00:00', 'Three times daily', '2025-10-28', '2025-11-04', true),
('s10', 'p7', 'm8', 'r1', '21:00:00', 'Once Daily', '2025-10-29', NULL, true),
('s11', 'p8', 'm7', 'r1', '08:00:00', 'Once Daily', '2025-10-29', '2025-11-05', true);

-- ============================================
-- STEP 10: INSERT TASKS (Central Timeline)
-- ============================================

INSERT INTO tasks (task_id, patient_id, nurse_id, task_type, medication_id, investigation_id, procedure_id, route_id, scheduled_time, status, priority, frequency, notes) VALUES
-- Medication tasks
('t1', 'p1', 'n1', 'medication', 'm6', NULL, NULL, 'r1', '2025-10-29 08:00:00', 'completed', 'high', 'Once Daily', 'Given with breakfast'),
('t2', 'p1', 'n4', 'medication', 'm9', NULL, NULL, 'r2', '2025-10-29 12:00:00', 'pending', 'critical', 'Every 6 hours', 'Pain management - IV'),
('t3', 'p2', 'n3', 'medication', 'm3', NULL, NULL, 'r1', '2025-10-29 09:00:00', 'completed', 'medium', 'Three times daily', 'Antibiotic course day 3'),
('t4', 'p3', 'n3', 'medication', 'm4', NULL, NULL, 'r1', '2025-10-29 07:00:00', 'completed', 'high', 'Twice daily', 'Before meals'),
('t5', 'p3', 'n3', 'medication', 'm5', NULL, NULL, 'r4', '2025-10-29 07:30:00', 'completed', 'critical', 'Once Daily', 'Insulin - subcutaneous'),
('t6', 'p4', 'n5', 'medication', 'm10', NULL, NULL, 'r6', '2025-10-29 08:00:00', 'completed', 'high', 'Four times daily', 'Salbutamol inhaler - 2 puffs'),
('t7', 'p5', 'n6', 'medication', 'm11', NULL, NULL, 'r2', '2025-10-29 14:00:00', 'pending', 'critical', 'Every 8 hours', 'Antibiotic IV - sepsis protocol'),
('t8', 'p7', 'n3', 'medication', 'm8', NULL, NULL, 'r1', '2025-10-29 21:00:00', 'pending', 'medium', 'Once Daily', 'Cholesterol management'),

-- Investigation tasks
('t9', 'p1', 'n1', 'investigation', NULL, 'i2', NULL, NULL, '2025-10-29 06:00:00', 'completed', 'high', NULL, 'Fasting blood glucose done'),
('t10', 'p2', 'n6', 'investigation', NULL, 'i1', NULL, NULL, '2025-10-29 10:00:00', 'pending', 'medium', NULL, 'CBC - check infection markers'),
('t11', 'p3', 'n3', 'investigation', NULL, 'i8', NULL, NULL, '2025-10-29 08:00:00', 'completed', 'medium', NULL, 'HbA1c - diabetes monitoring'),
('t12', 'p5', 'n6', 'investigation', NULL, 'i4', NULL, NULL, '2025-10-29 11:00:00', 'pending', 'critical', NULL, 'Kidney function - sepsis monitoring'),
('t13', 'p7', 'n3', 'investigation', NULL, 'i6', NULL, NULL, '2025-10-29 15:00:00', 'pending', 'high', NULL, 'ECG - cardiac monitoring'),

-- Procedure tasks
('t14', 'p1', 'n1', 'procedure', NULL, NULL, 'p6', NULL, '2025-10-29 09:00:00', 'in-progress', 'critical', NULL, 'Oxygen therapy - maintain O2 sat >95%'),
('t15', 'p2', 'n6', 'procedure', NULL, NULL, 'p7', NULL, '2025-10-29 13:00:00', 'pending', 'high', NULL, 'Nebulization for respiratory support'),
('t16', 'p4', 'n5', 'procedure', NULL, NULL, 'p7', NULL, '2025-10-29 10:00:00', 'completed', 'high', NULL, 'Nebulization completed - good response'),
('t17', 'p5', 'n6', 'procedure', NULL, NULL, 'p3', NULL, '2025-10-29 07:00:00', 'completed', 'critical', NULL, 'Central line inserted'),
('t18', 'p6', 'n7', 'procedure', NULL, NULL, 'p1', NULL, '2025-10-29 16:00:00', 'pending', 'medium', NULL, 'Post-op wound dressing change'),
('t19', 'p8', 'n5', 'procedure', NULL, NULL, 'p3', NULL, '2025-10-29 12:00:00', 'pending', 'medium', NULL, 'IV line for hydration');

-- ============================================
-- STEP 11: INSERT VITAL SIGNS
-- ============================================

INSERT INTO vital_signs (vital_id, patient_id, nurse_id, recorded_time, temperature, blood_pressure, heart_rate, respiratory_rate, oxygen_saturation, remarks) VALUES
('v1', 'p1', 'n1', '2025-10-29 06:00:00', 37.2, '145/95', 88, 18, 96, 'Stable, slight hypertension'),
('v2', 'p1', 'n1', '2025-10-29 10:00:00', 37.0, '140/90', 82, 16, 97, 'Improving'),
('v3', 'p2', 'n6', '2025-10-29 07:00:00', 38.5, '130/80', 95, 22, 92, 'Fever persists, tachypnea'),
('v4', 'p3', 'n3', '2025-10-29 08:00:00', 36.8, '125/82', 72, 16, 99, 'Normal vitals'),
('v5', 'p4', 'n5', '2025-10-29 09:00:00', 37.1, '110/70', 85, 20, 95, 'Mild respiratory distress'),
('v6', 'p5', 'n6', '2025-10-29 06:30:00', 39.2, '90/60', 120, 28, 88, 'Critical - septic, hypotensive'),
('v7', 'p5', 'n6', '2025-10-29 09:00:00', 38.8, '95/65', 115, 26, 90, 'Slight improvement with fluids'),
('v8', 'p6', 'n7', '2025-10-29 08:00:00', 36.6, '118/75', 78, 14, 98, 'Post-op stable'),
('v9', 'p7', 'n3', '2025-10-29 10:00:00', 36.9, '150/95', 76, 15, 98, 'Elevated BP - on meds'),
('v10', 'p8', 'n5', '2025-10-29 11:00:00', 37.3, '100/65', 92, 18, 97, 'Recovering from dehydration');

-- ============================================
-- STEP 12: INSERT NURSE LOGS
-- ============================================

INSERT INTO nurse_logs (log_id, patient_id, nurse_id, medication_id, route_id, administration_time, dosage_given, remarks, status) VALUES
('l1', 'p1', 'n1', 'm6', 'r1', '2025-10-29 08:00:00', '75mg', 'Given with food, patient tolerated well', 'administered'),
('l2', 'p1', 'n1', 'm9', 'r2', '2025-10-29 06:00:00', '10mg', 'IV morphine for chest pain relief', 'administered'),
('l3', 'p2', 'n3', 'm3', 'r1', '2025-10-29 09:00:00', '500mg', 'Antibiotic course day 3, no adverse effects', 'administered'),
('l4', 'p3', 'n3', 'm4', 'r1', '2025-10-29 07:00:00', '850mg', 'Before breakfast as scheduled', 'administered'),
('l5', 'p3', 'n3', 'm5', 'r4', '2025-10-29 07:30:00', '10 units', 'Subcutaneous insulin - abdomen site', 'administered'),
('l6', 'p4', 'n5', 'm10', 'r6', '2025-10-29 08:00:00', '100mcg (2 puffs)', 'Inhaler technique good, breathing improved', 'administered'),
('l7', 'p5', 'n6', 'm11', 'r2', '2025-10-29 06:00:00', '1g', 'IV antibiotic for sepsis protocol', 'administered'),
('l8', 'p6', 'n7', 'm1', 'r1', '2025-10-29 08:00:00', '500mg', 'Post-op pain management', 'administered');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- All tables have been cleared and repopulated with comprehensive dummy data
-- This includes 8 patients, 8 nurses, 12 medications, 8 investigations, 8 procedures,
-- 19 tasks, 10 vital sign records, and 8 nurse logs
