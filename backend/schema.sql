-- ============================================
-- ScoreWin — Database Schema
-- TiDB Cloud (MySQL Compatible)
-- Run this file on TiDB Cloud SQL Editor
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS scorewin;
USE scorewin;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id          INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role        ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_users_email (email)
);

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id          INT             PRIMARY KEY AUTO_INCREMENT,
    user_id     INT             NOT NULL,
    plan        ENUM('monthly', 'yearly') NOT NULL,
    status      ENUM('active', 'inactive', 'cancelled') NOT NULL DEFAULT 'active',
    amount      FLOAT           NOT NULL,
    start_date  DATETIME        DEFAULT CURRENT_TIMESTAMP,
    end_date    DATETIME        NOT NULL,
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_subscriptions_user (user_id),
    INDEX idx_subscriptions_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 3. SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scores (
    id          INT             PRIMARY KEY AUTO_INCREMENT,
    user_id     INT             NOT NULL,
    score       INT             NOT NULL,
    date        DATE            NOT NULL,
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_scores_user (user_id),
    UNIQUE INDEX uq_user_score_date (user_id, date),
    CONSTRAINT ck_score_range CHECK (score >= 1 AND score <= 45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 4. DRAWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS draws (
    id              INT             PRIMARY KEY AUTO_INCREMENT,
    month           VARCHAR(7)      NOT NULL,          -- Format: YYYY-MM
    numbers         TEXT            NOT NULL,           -- JSON array of 5 numbers
    draw_type       ENUM('random', 'algorithm') NOT NULL,
    status          ENUM('simulated', 'published') NOT NULL DEFAULT 'simulated',
    prize_pool      FLOAT           DEFAULT 0.0,
    jackpot_rollover FLOAT          DEFAULT 0.0,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_draws_month (month),
    INDEX idx_draws_status (status)
);

-- ============================================
-- 5. WINNERS TABLE
-- proof_url stores the Cloudinary image URL
-- ============================================
CREATE TABLE IF NOT EXISTS winners (
    id          INT             PRIMARY KEY AUTO_INCREMENT,
    user_id     INT             NOT NULL,
    draw_id     INT             NOT NULL,
    match_type  INT             NOT NULL,              -- 3, 4, or 5
    amount      FLOAT           DEFAULT 0.0,
    status      ENUM('pending', 'approved', 'rejected', 'paid') NOT NULL DEFAULT 'pending',
    proof_url   VARCHAR(500)    NULL,                  -- Cloudinary image URL
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_winners_user (user_id),
    INDEX idx_winners_draw (draw_id),
    INDEX idx_winners_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE
);

-- ============================================
-- 6. CHARITIES TABLE
-- image_url stores charity image (can be Cloudinary or any URL)
-- ============================================
CREATE TABLE IF NOT EXISTS charities (
    id          INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(200)    NOT NULL,
    description TEXT            NULL,
    image_url   VARCHAR(500)    NULL,                  -- Charity image URL
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. USER_CHARITY TABLE
-- Links a user to their chosen charity + contribution %
-- ============================================
CREATE TABLE IF NOT EXISTS user_charity (
    id          INT             PRIMARY KEY AUTO_INCREMENT,
    user_id     INT             NOT NULL,
    charity_id  INT             NOT NULL,
    percentage  FLOAT           NOT NULL DEFAULT 10.0,

    UNIQUE INDEX uq_user_charity (user_id),
    INDEX idx_user_charity_charity (charity_id),
    CONSTRAINT ck_min_charity_pct CHECK (percentage >= 10),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE
);

-- ============================================
-- DONE! 7 tables created.
--
-- Just run the backend and it will auto-seed:
--   uvicorn app.main:app --reload --port 8000
--
-- Admin (auto-created on first start):
--   admin@scorewin.com / Admin@123
-- ============================================


