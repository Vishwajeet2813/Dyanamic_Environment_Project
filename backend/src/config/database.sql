-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100),
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(200),
  role        VARCHAR(20) DEFAULT 'developer',
  github_id   VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Environments table
CREATE TABLE IF NOT EXISTS environments (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  name        VARCHAR(100) NOT NULL,
  namespace   VARCHAR(100) UNIQUE NOT NULL,
  url         VARCHAR(200),
  status      VARCHAR(20) DEFAULT 'running',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  lead_id     INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
  team_id     INTEGER REFERENCES teams(id),
  user_id     INTEGER REFERENCES users(id),
  PRIMARY KEY (team_id, user_id)
);