-- FitAdapt Database Schema
-- SIH 2026 Problem Statement SIH26196

CREATE DATABASE IF NOT EXISTS fitadapt;
USE fitadapt;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Condition profiles table
CREATE TABLE IF NOT EXISTS condition_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  condition_type ENUM('asthma','joint','pcos','postnatal','anxiety_fatigue','other') NOT NULL,
  severity ENUM('mild','moderate','significant') DEFAULT 'mild',
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Daily checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  checkin_date DATE NOT NULL,
  energy_level TINYINT NOT NULL, -- 1 (very low) to 5 (high)
  pain_level TINYINT NOT NULL, -- 0 (none) to 5 (severe)
  breathlessness TINYINT NOT NULL, -- 0 (none) to 5 (severe)
  flare_flag BOOLEAN DEFAULT FALSE, -- user marks an active flare-up
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_checkin_date (user_id, checkin_date)
);

-- 4. Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  video_url VARCHAR(255),
  intensity ENUM('low','moderate','high') NOT NULL,
  safe_for_asthma BOOLEAN DEFAULT FALSE,
  safe_for_joint BOOLEAN DEFAULT FALSE,
  safe_for_pcos BOOLEAN DEFAULT FALSE,
  safe_for_postnatal BOOLEAN DEFAULT FALSE,
  safe_for_anxiety_fatigue BOOLEAN DEFAULT FALSE,
  target_muscle VARCHAR(100) DEFAULT 'Full Body'
);

-- 5. Session logs table
CREATE TABLE IF NOT EXISTS session_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  checkin_id INT NOT NULL,
  exercise_ids VARCHAR(255), -- comma-separated exercise IDs assigned that day
  completed BOOLEAN DEFAULT FALSE,
  session_date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE
);
