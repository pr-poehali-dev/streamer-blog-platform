-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    vk_id BIGINT UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы розыгрышей
CREATE TABLE IF NOT EXISTS giveaways (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    prize VARCHAR(255) NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы участников розыгрышей
CREATE TABLE IF NOT EXISTS giveaway_participants (
    id SERIAL PRIMARY KEY,
    giveaway_id INTEGER REFERENCES giveaways(id),
    user_id INTEGER REFERENCES users(id),
    participated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(giveaway_id, user_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_vk_id ON users(vk_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_participants_giveaway_id ON giveaway_participants(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_participants_user_id ON giveaway_participants(user_id);

-- Добавление текущих розыгрышей
INSERT INTO giveaways (title, prize, end_date) VALUES
('Скины Valorant', 'VP 2000', '2025-11-15'),
('Набор CS2', 'Нож Karambit', '2025-11-20'),
('Battle Pass Dota 2', 'Arcana', '2025-11-25')
ON CONFLICT DO NOTHING;