-- ============================================================
-- Mentr V1 — Seed Data Script
-- All users use password: Test1234!
-- ============================================================

-- BCrypt hash for "Test1234!"
-- $2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq

BEGIN;

-- ─── Clean existing data (order matters for FK constraints) ───
DELETE FROM reviews;
DELETE FROM notes;
DELETE FROM session_extensions;
DELETE FROM sessions;
DELETE FROM payments;
DELETE FROM bookings;
DELETE FROM availability_slots;
DELETE FROM mentor_short_video;
DELETE FROM mentor_tags;
DELETE FROM mentor_languages;
DELETE FROM mentor_profile;
DELETE FROM mentor_presence;
DELETE FROM chat_conversations;
DELETE FROM transactions;
DELETE FROM wallets;
DELETE FROM mentors;
DELETE FROM learners;
DELETE FROM user_roles;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE mentors_mentor_id_seq RESTART WITH 1;
ALTER SEQUENCE learners_learner_id_seq RESTART WITH 1;
ALTER SEQUENCE wallets_id_seq RESTART WITH 1;
ALTER SEQUENCE mentor_presence_id_seq RESTART WITH 1;
ALTER SEQUENCE bookings_id_seq RESTART WITH 1;
ALTER SEQUENCE sessions_session_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE availability_slots_id_seq RESTART WITH 1;

-- ─── USERS ───────────────────────────────────────────────────
-- Password for ALL users: Test1234!
INSERT INTO users (user_id, username, username_edit_count, name, pronouns, email, password_hash, bio, profile_pic, phone_verified, email_verified, auth_provider, created_at, updated_at) VALUES
  (1, 'arjun_mentor',   0, 'Arjun Sharma',    'HE_HIM',   'arjun@mentr.dev',    '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Staff Engineer at Google. 10+ years in distributed systems, Java, and cloud architecture.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '90 days', NOW()),
  (2, 'priya_mentor',   0, 'Priya Patel',     'SHE_HER',  'priya@mentr.dev',    '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Senior SDE at Amazon. Passionate about backend engineering, system design, and mentoring.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '85 days', NOW()),
  (3, 'rahul_mentor',   0, 'Rahul Verma',     'HE_HIM',   'rahul@mentr.dev',    '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Engineering Manager at Microsoft. Expert in microservices, DevOps, and team leadership.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '80 days', NOW()),
  (4, 'sneha_mentor',   0, 'Sneha Iyer',      'SHE_HER',  'sneha@mentr.dev',    '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Full Stack Developer at Flipkart. React, Spring Boot, and PostgreSQL specialist.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '75 days', NOW()),
  (5, 'vikram_mentor',  0, 'Vikram Desai',    'HE_HIM',   'vikram@mentr.dev',   '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Principal Engineer at Netflix. Expert in scalable systems and data-intensive applications.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '70 days', NOW()),
  (6, 'ananya_learner', 0, 'Ananya Gupta',    'SHE_HER',  'ananya@mentr.dev',   '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'CS undergrad preparing for SDE interviews.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '60 days', NOW()),
  (7, 'rohan_learner',  0, 'Rohan Mehra',     'HE_HIM',   'rohan@mentr.dev',    '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Junior developer learning microservices and cloud.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '55 days', NOW()),
  (8, 'divya_learner',  0, 'Divya Nair',      'SHE_HER',  'divya@mentr.dev',    '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Career switcher moving into tech from finance.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '45 days', NOW()),
  (9, 'admin_user',     0, 'Admin Mentr',     'THEY_THEM', 'admin@mentr.dev',    '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Platform administrator.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '100 days', NOW()),
  (10, 'atul_mentor',   0, 'Atul Mathur',    'HE_HIM',   'mentor@atulmathur.dev', '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Full-stack engineer and mentor. Building cool things with Java, Spring Boot, and React.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '40 days', NOW()),
  (11, 'atul_learner',  0, 'Atul Mathur',    'HE_HIM',   'learner@atulmathur.dev','$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Always learning. Exploring system design and cloud architecture.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '35 days', NOW()),
  (12, 'atul_admin',    0, 'Atul Mathur',    'HE_HIM',   'admin@atulmathur.dev', '$2a$10$pEHMI8k2AvL7/F2NWteqO.QQSA0Ik6UwomteqWV/4dHHdv8LSpAUq', 'Platform administrator.', NULL, false, true, 'LOCAL', NOW() - INTERVAL '100 days', NOW());

SELECT setval('users_user_id_seq', 12);

-- ─── USER ROLES ──────────────────────────────────────────────
-- Mentors: 1-5,  Learners: 6-8,  Admin: 9
INSERT INTO user_roles (user_id, role_id) VALUES
  (1, (SELECT role_id FROM roles WHERE name = 'ROLE_MENTOR')),
  (2, (SELECT role_id FROM roles WHERE name = 'ROLE_MENTOR')),
  (3, (SELECT role_id FROM roles WHERE name = 'ROLE_MENTOR')),
  (4, (SELECT role_id FROM roles WHERE name = 'ROLE_MENTOR')),
  (5, (SELECT role_id FROM roles WHERE name = 'ROLE_MENTOR')),
  (6, (SELECT role_id FROM roles WHERE name = 'ROLE_LEARNER')),
  (7, (SELECT role_id FROM roles WHERE name = 'ROLE_LEARNER')),
  (8, (SELECT role_id FROM roles WHERE name = 'ROLE_LEARNER')),
  (9, (SELECT role_id FROM roles WHERE name = 'ROLE_ADMIN')),
  (10, (SELECT role_id FROM roles WHERE name = 'ROLE_MENTOR')),
  (11, (SELECT role_id FROM roles WHERE name = 'ROLE_LEARNER')),
  (12, (SELECT role_id FROM roles WHERE name = 'ROLE_ADMIN'));

-- ─── MENTORS ─────────────────────────────────────────────────
INSERT INTO mentors (mentor_id, user_id, expertise, call_price, meeting_price, subscription_price, bookings_count, long_call_threshold_minutes) VALUES
  (1, 1, 'Java, System Design, Cloud Architecture, Distributed Systems',    499.00, 999.00, 2999.00, 47, 60),
  (2, 2, 'Backend Engineering, Spring Boot, REST API, Databases',           399.00, 799.00, 1999.00, 32, 60),
  (3, 3, 'Microservices, DevOps, Docker, Kubernetes, Team Leadership',      599.00, 1199.00, 3499.00, 28, 60),
  (4, 4, 'Full Stack, React, Spring Boot, PostgreSQL',                      349.00, 699.00, 1499.00, 19, 60),
  (5, 5, 'Scalable Systems, Data Engineering, System Design',              699.00, 1399.00, 3999.00, 53, 60),
  (6, 10, 'Full Stack, Java, Spring Boot, React, System Design',             449.00, 899.00, 2499.00, 12, 60);

SELECT setval('mentors_mentor_id_seq', 6);

-- ─── LEARNERS ────────────────────────────────────────────────
INSERT INTO learners (learner_id, user_id, signup_date, preferences) VALUES
  (1, 6, NOW() - INTERVAL '60 days', 'DSA, Interview Prep, Java'),
  (2, 7, NOW() - INTERVAL '55 days', 'Microservices, Cloud, DevOps'),
  (3, 8, NOW() - INTERVAL '45 days', 'Full Stack, React, Backend'),
  (4, 11, NOW() - INTERVAL '35 days', 'System Design, Cloud, Full Stack');

SELECT setval('learners_learner_id_seq', 4);

-- ─── WALLETS ─────────────────────────────────────────────────
INSERT INTO wallets (id, user_id, balance, currency, is_active, created_at, last_updated, lifetime_earnings, lifetime_spent) VALUES
  (1, 1, 15200.00, 'INR', true, NOW(), NOW(), 23500.00, 0.00),
  (2, 2, 8400.00,  'INR', true, NOW(), NOW(), 12300.00, 0.00),
  (3, 3, 22100.00, 'INR', true, NOW(), NOW(), 28700.00, 0.00),
  (4, 4, 5600.00,  'INR', true, NOW(), NOW(), 7400.00,  0.00),
  (5, 5, 31000.00, 'INR', true, NOW(), NOW(), 42000.00, 0.00),
  (6, 6, 2000.00,  'INR', true, NOW(), NOW(), 0.00,     5096.00),
  (7, 7, 1500.00,  'INR', true, NOW(), NOW(), 0.00,     4346.00),
  (8, 8, 3000.00,  'INR', true, NOW(), NOW(), 0.00,     3546.00),
  (9, 9, 0.00,     'INR', true, NOW(), NOW(), 0.00,     0.00),
  (10, 10, 18500.00, 'INR', true, NOW(), NOW(), 24000.00, 0.00),
  (11, 11, 5000.00,  'INR', true, NOW(), NOW(), 0.00,     3500.00),
  (12, 12, 0.00,     'INR', true, NOW(), NOW(), 0.00,     0.00);

SELECT setval('wallets_id_seq', 12);

-- ─── MENTOR PROFILES ────────────────────────────────────────
INSERT INTO mentor_profile (user_id, version, location_country, experience_years, short_bio, full_bio_story, show_category, category_id, youtube_url, instagram_url, linkedin_url, languages_cache, tags_cache, created_at, updated_at) VALUES
  (1, 0, 'India', 12,
   'Staff Engineer at Google specializing in distributed systems and cloud architecture.',
   'I''ve spent over 12 years building large-scale distributed systems at Google, Amazon, and two startups. I''ve designed systems that serve 100M+ users and led teams of 15+ engineers. My passion is helping the next generation of engineers think in systems — not just code. Whether you''re preparing for system design interviews or building your first microservice, I can help you level up.',
   true, 'engineering', NULL, NULL, 'https://linkedin.com/in/arjunsharma',
   ARRAY['English', 'Hindi'], ARRAY['Java', 'System Design', 'Docker', 'Kubernetes'],
   NOW(), NOW()),

  (2, 0, 'India', 8,
   'Senior SDE at Amazon building backend systems at scale.',
   'With 8 years of experience in backend engineering, I''ve built payment systems, order pipelines, and real-time data services at Amazon. I specialize in Spring Boot, REST API design, and database optimization. I love breaking down complex concepts into simple, actionable advice. My mentees have landed roles at FAANG companies, unicorn startups, and top product companies.',
   true, 'engineering', NULL, NULL, 'https://linkedin.com/in/priyapatel',
   ARRAY['English', 'Hindi', 'French'], ARRAY['Spring Boot', 'REST API', 'PostgreSQL', 'Microservices'],
   NOW(), NOW()),

  (3, 0, 'India', 15,
   'Engineering Manager at Microsoft. Expert in DevOps and microservices.',
   'I manage a team of 20 engineers at Microsoft working on Azure infrastructure. Before this, I was a principal engineer at Uber where I built ride-matching microservices processing 14M rides/day. I mentor on system design, DevOps practices, career growth from IC to management, and engineering leadership. If you want to build systems that scale or grow into a tech lead role, let''s talk.',
   true, 'engineering', NULL, NULL, 'https://linkedin.com/in/rahulverma',
   ARRAY['English', 'Hindi', 'German'], ARRAY['Microservices', 'Docker', 'Kubernetes', 'System Design'],
   NOW(), NOW()),

  (4, 0, 'India', 6,
   'Full Stack Developer at Flipkart. React + Spring Boot specialist.',
   'I''ve been doing full-stack development for 6 years, currently at Flipkart building seller-facing tools. I''m deeply experienced with React, TypeScript, Spring Boot, and PostgreSQL. I contribute to open source and have spoken at 3 conferences. I''m especially good at helping beginners go from zero to their first production app and guiding career switchers into tech.',
   true, 'engineering', NULL, NULL, 'https://linkedin.com/in/snehaiyer',
   ARRAY['English', 'Hindi', 'Japanese'], ARRAY['Spring Boot', 'REST API', 'Java', 'PostgreSQL'],
   NOW(), NOW()),

  (5, 0, 'India', 18,
   'Principal Engineer at Netflix. Building data-intensive systems at global scale.',
   'With 18 years in the industry, I''ve architected streaming pipelines at Netflix that handle 250M+ subscribers, built ML feature stores at LinkedIn, and co-founded a data startup (acquired). I specialize in system design for data-heavy applications, distributed computing, and engineering strategy. I only take a handful of mentees but give each one my full attention.',
   true, 'engineering', NULL, NULL, 'https://linkedin.com/in/vikramdesai',
   ARRAY['English', 'Spanish', 'Korean'], ARRAY['System Design', 'Java', 'Microservices', 'DSA'],
   NOW(), NOW()),

  (10, 0, 'India', 5,
   'Full-stack engineer building Mentr. Java, Spring Boot, React enthusiast.',
   'I''m a full-stack developer with 5 years of experience building products end-to-end. Currently building Mentr — a mentorship platform connecting learners with industry experts. I specialize in Java, Spring Boot, React, and PostgreSQL. I love helping developers level up their skills through hands-on mentoring and real-world project guidance.',
   true, 'engineering', NULL, NULL, 'https://linkedin.com/in/atulmathur',
   ARRAY['English', 'Hindi'], ARRAY['Java', 'Spring Boot', 'React', 'System Design'],
   NOW(), NOW());

-- ─── MENTOR LANGUAGES (junction table) ──────────────────────
INSERT INTO mentor_languages (user_id, language_id) VALUES
  -- Arjun: English, Hindi
  (1, 1), (1, 2),
  -- Priya: English, Hindi, French
  (2, 1), (2, 2), (2, 25),
  -- Rahul: English, Hindi, German
  (3, 1), (3, 2), (3, 29),
  -- Sneha: English, Hindi, Japanese
  (4, 1), (4, 2), (4, 48),
  -- Vikram: English, Spanish, Korean
  (5, 1), (5, 26), (5, 49),
  -- Atul: English, Hindi
  (10, 1), (10, 2);

-- ─── MENTOR TAGS (junction table) ───────────────────────────
INSERT INTO mentor_tags (user_id, tag_id) VALUES
  -- Arjun: Java, System Design, Docker, Kubernetes
  (1, 4), (1, 9), (1, 7), (1, 8),
  -- Priya: Spring Boot, REST API, PostgreSQL, Microservices
  (2, 1), (2, 5), (2, 6), (2, 2),
  -- Rahul: Microservices, Docker, Kubernetes, System Design
  (3, 2), (3, 7), (3, 8), (3, 9),
  -- Sneha: Spring Boot, REST API, Java, PostgreSQL
  (4, 1), (4, 5), (4, 4), (4, 6),
  -- Vikram: System Design, Java, Microservices, DSA
  (5, 9), (5, 4), (5, 2), (5, 10),
  -- Atul: Java, Spring Boot, System Design, React
  (10, 4), (10, 1), (10, 9), (10, 3);

-- ─── MENTOR PRESENCE ────────────────────────────────────────
INSERT INTO mentor_presence (id, mentor_id, status, last_heartbeat_at, created_at, updated_at) VALUES
  (1, 1, 'OFFLINE', NOW(), NOW(), NOW()),
  (2, 2, 'OFFLINE', NOW(), NOW(), NOW()),
  (3, 3, 'OFFLINE', NOW(), NOW(), NOW()),
  (4, 4, 'OFFLINE', NOW(), NOW(), NOW()),
  (5, 5, 'OFFLINE', NOW(), NOW(), NOW()),
  (6, 6, 'OFFLINE', NOW(), NOW(), NOW());

SELECT setval('mentor_presence_id_seq', 6);

-- ─── AVAILABILITY SLOTS (next 7 days) ──────────────────────
-- Each mentor gets morning + evening slots for the next 7 days
INSERT INTO availability_slots (mentor_id, start_time, end_time, is_blocked, created_at, updated_at)
SELECT m.mentor_id,
       (CURRENT_DATE + d.day_offset) + t.start_hour * INTERVAL '1 hour',
       (CURRENT_DATE + d.day_offset) + t.end_hour * INTERVAL '1 hour',
       false, NOW(), NOW()
FROM mentors m
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6),(7)) AS d(day_offset)
CROSS JOIN (VALUES (9, 12), (17, 21)) AS t(start_hour, end_hour);

-- ─── BOOKINGS (completed sessions for reviews) ─────────────
-- Learner 6 (Ananya) with Mentor 1 (Arjun)
INSERT INTO bookings (id, learner_id, mentor_id, booking_time, start_time, end_time, status, booking_type, duration_minutes, created_at, updated_at, amount, currency) VALUES
  (1, 6, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '30 min', 'COMPLETED', 'BOOK_LATER', 30, NOW() - INTERVAL '31 days', NOW() - INTERVAL '30 days', 499.00, 'INR'),
  (2, 7, 1, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '60 min', 'COMPLETED', 'BOOK_LATER', 60, NOW() - INTERVAL '26 days', NOW() - INTERVAL '25 days', 999.00, 'INR'),
  (3, 8, 2, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '30 min', 'COMPLETED', 'BOOK_LATER', 30, NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days', 399.00, 'INR'),
  (4, 6, 2, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '30 min', 'COMPLETED', 'BOOK_LATER', 30, NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days', 399.00, 'INR'),
  (5, 7, 3, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '60 min', 'COMPLETED', 'BOOK_LATER', 60, NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days', 1199.00, 'INR'),
  (6, 8, 4, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '30 min', 'COMPLETED', 'BOOK_LATER', 30, NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days', 349.00, 'INR'),
  (7, 6, 5, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '30 min', 'COMPLETED', 'BOOK_LATER', 30, NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', 699.00, 'INR'),
  (8, 7, 4, NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days'  + INTERVAL '30 min', 'COMPLETED', 'BOOK_LATER', 30, NOW() - INTERVAL '9 days',  NOW() - INTERVAL '8 days',  349.00, 'INR'),
  (9, 8, 5, NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'  + INTERVAL '60 min', 'COMPLETED', 'BOOK_LATER', 60, NOW() - INTERVAL '6 days',  NOW() - INTERVAL '5 days',  1399.00, 'INR'),
  -- Upcoming confirmed bookings
  (10, 6, 1, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '9 hours', NOW() + INTERVAL '2 days' + INTERVAL '9 hours' + INTERVAL '30 min', 'CONFIRMED', 'BOOK_LATER', 30, NOW(), NOW(), 499.00, 'INR'),
  (11, 7, 2, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '17 hours', NOW() + INTERVAL '3 days' + INTERVAL '17 hours' + INTERVAL '60 min', 'CONFIRMED', 'BOOK_LATER', 60, NOW(), NOW(), 799.00, 'INR'),
  (12, 8, 3, NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '10 hours', NOW() + INTERVAL '4 days' + INTERVAL '10 hours' + INTERVAL '30 min', 'CONFIRMED', 'BOOK_LATER', 30, NOW(), NOW(), 599.00, 'INR');

SELECT setval('bookings_id_seq', 12);

-- ─── PAYMENTS (for completed bookings) ──────────────────────
INSERT INTO payments (id, booking_id, payer_user_id, amount, currency, status, created_at, updated_at, payment_date) VALUES
  (1, 1, 6, 499.00,  'INR', 'SUCCEEDED', NOW() - INTERVAL '31 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (2, 2, 7, 999.00,  'INR', 'SUCCEEDED', NOW() - INTERVAL '26 days', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  (3, 3, 8, 399.00,  'INR', 'SUCCEEDED', NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (4, 4, 6, 399.00,  'INR', 'SUCCEEDED', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (5, 5, 7, 1199.00, 'INR', 'SUCCEEDED', NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  (6, 6, 8, 349.00,  'INR', 'SUCCEEDED', NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  (7, 7, 6, 699.00,  'INR', 'SUCCEEDED', NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (8, 8, 7, 349.00,  'INR', 'SUCCEEDED', NOW() - INTERVAL '9 days',  NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days'),
  (9, 9, 8, 1399.00, 'INR', 'SUCCEEDED', NOW() - INTERVAL '6 days',  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'),
  (10, 10, 6, 499.00, 'INR', 'SUCCEEDED', NOW(), NOW(), NOW()),
  (11, 11, 7, 799.00, 'INR', 'SUCCEEDED', NOW(), NOW(), NOW()),
  (12, 12, 8, 599.00, 'INR', 'SUCCEEDED', NOW(), NOW(), NOW());

SELECT setval('payments_id_seq', 12);

-- ─── SESSIONS (for completed bookings) ──────────────────────
INSERT INTO sessions (session_id, booking_id, mentor_id, learner_id, start_time, end_time, status, created_at, updated_at) VALUES
  (1, 1, 1, 6, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '30 min', 'COMPLETED', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (2, 2, 1, 7, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '60 min', 'COMPLETED', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  (3, 3, 2, 8, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '30 min', 'COMPLETED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (4, 4, 2, 6, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '30 min', 'COMPLETED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (5, 5, 3, 7, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '60 min', 'COMPLETED', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  (6, 6, 4, 8, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '30 min', 'COMPLETED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  (7, 7, 5, 6, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '30 min', 'COMPLETED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (8, 8, 4, 7, NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days'  + INTERVAL '30 min', 'COMPLETED', NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days'),
  (9, 9, 5, 8, NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'  + INTERVAL '60 min', 'COMPLETED', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'),
  -- Upcoming sessions
  (10, 10, 1, 6, NOW() + INTERVAL '2 days' + INTERVAL '9 hours', NOW() + INTERVAL '2 days' + INTERVAL '9 hours' + INTERVAL '30 min', 'CONFIRMED', NOW(), NOW()),
  (11, 11, 2, 7, NOW() + INTERVAL '3 days' + INTERVAL '17 hours', NOW() + INTERVAL '3 days' + INTERVAL '17 hours' + INTERVAL '60 min', 'CONFIRMED', NOW(), NOW()),
  (12, 12, 3, 8, NOW() + INTERVAL '4 days' + INTERVAL '10 hours', NOW() + INTERVAL '4 days' + INTERVAL '10 hours' + INTERVAL '30 min', 'CONFIRMED', NOW(), NOW());

SELECT setval('sessions_session_id_seq', 12);

-- ─── REVIEWS ────────────────────────────────────────────────
INSERT INTO reviews (id, session_id, learner_id, mentor_id, rating, comment, created_at) VALUES
  -- Arjun's reviews (mentor_id=1)
  (1, 1, 6, 1, 5, 'Arjun''s system design session was mind-blowing. He explained CAP theorem and consistent hashing in a way that finally clicked. Definitely booking again!', NOW() - INTERVAL '29 days'),
  (2, 2, 7, 1, 5, 'Incredible depth of knowledge. Arjun walked me through designing a URL shortener end-to-end. Best investment I''ve made in my career.', NOW() - INTERVAL '24 days'),

  -- Priya's reviews (mentor_id=2)
  (3, 3, 8, 2, 4, 'Priya is very patient and thorough. She helped me debug a complex Spring Boot configuration issue in 20 minutes that I''d been stuck on for 2 days.', NOW() - INTERVAL '19 days'),
  (4, 4, 6, 2, 5, 'Amazing mentor! Priya''s REST API design principles completely changed how I think about building services. Highly recommended.', NOW() - INTERVAL '14 days'),

  -- Rahul's reviews (mentor_id=3)
  (5, 5, 7, 3, 4, 'Rahul gave me a solid roadmap for learning Docker and Kubernetes. Very practical advice from someone who uses these tools at massive scale every day.', NOW() - INTERVAL '17 days'),

  -- Sneha's reviews (mentor_id=4)
  (6, 6, 8, 4, 5, 'Sneha is the perfect mentor for beginners. She helped me set up my first full-stack project and explained every decision clearly. 10/10!', NOW() - INTERVAL '11 days'),
  (7, 8, 7, 4, 4, 'Great session on React + Spring Boot integration. Sneha showed me patterns I wouldn''t have found on my own. Very practical.', NOW() - INTERVAL '7 days'),

  -- Vikram's reviews (mentor_id=5)
  (8, 7, 6, 5, 5, 'Vikram is a legend. His system design whiteboard session was better than any course I''ve taken. He thinks at a completely different level.', NOW() - INTERVAL '9 days'),
  (9, 9, 8, 5, 5, 'Worth every rupee. Vikram helped me understand data pipelines and streaming architecture. Got a job offer within 2 weeks of our session!', NOW() - INTERVAL '4 days');

SELECT setval('reviews_id_seq', 9);

COMMIT;
