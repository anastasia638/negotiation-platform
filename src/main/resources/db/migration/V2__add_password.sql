-- V2 - Ajout du champ password hashé sur les utilisateurs
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'CHANGE_ME';
