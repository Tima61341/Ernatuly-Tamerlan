-- QuizMaster Database Initialization Script
-- PostgreSQL

-- Create database (run as superuser)
-- CREATE DATABASE quizmaster;

-- Connect to quizmaster database before running the rest

-- Note: Tables will be auto-created by Hibernate
-- This script provides initial data

-- Insert default topics
INSERT INTO topics (name, description, icon, color, is_active, created_at, updated_at) VALUES
('Математика', 'Арифметика, алгебра, геометрия и другие разделы математики', '🔢', '#3B82F6', true, NOW(), NOW()),
('История', 'Мировая история, история Казахстана и других стран', '📜', '#8B5CF6', true, NOW(), NOW()),
('География', 'Страны, города, природа и климат', '🌍', '#10B981', true, NOW(), NOW()),
('Наука', 'Физика, химия, биология и другие естественные науки', '🔬', '#F59E0B', true, NOW(), NOW()),
('Литература', 'Классическая и современная литература', '📚', '#EF4444', true, NOW(), NOW()),
('Спорт', 'Футбол, баскетбол, олимпийские игры и другие виды спорта', '⚽', '#06B6D4', true, NOW(), NOW()),
('Музыка', 'Классическая музыка, поп, рок и музыкальные инструменты', '🎵', '#EC4899', true, NOW(), NOW()),
('Кино', 'Фильмы, режиссёры, актёры и кинематограф', '🎬', '#F97316', true, NOW(), NOW()),
('Технологии', 'Компьютеры, программирование, интернет', '💻', '#6366F1', true, NOW(), NOW()),
('Искусство', 'Живопись, скульптура, архитектура', '🎨', '#A855F7', true, NOW(), NOW()),
('Қазақстан', 'Қазақстан тарихы, мәдениеті және географиясы', '🇰🇿', '#0EA5E9', true, NOW(), NOW()),
('Жалпы білім', 'Жалпы білім сұрақтары', '📖', '#14B8A6', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Note: First registered user automatically becomes ADMIN
-- Additional users get CREATOR role by default
