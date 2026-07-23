-- Taskify PostgreSQL schema (run once against your Neon/Postgres database)

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;

CREATE TABLE organizations (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    type            VARCHAR(50),                          -- School / College / Business / Other
    logo_url        TEXT,                                  -- data URI or hosted image URL
    status          VARCHAR(20)   NOT NULL DEFAULT 'Active',  -- Active / Suspended
    created_by      INTEGER,                               -- super_admin user id
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  UNIQUE,                  -- optional, not used for login
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL,                -- super_admin / org_admin / employee
    phone_number    VARCHAR(20)   NOT NULL UNIQUE,          -- login id + WhatsApp share (include country code, e.g. 91XXXXXXXXXX)
    organization_id INTEGER       REFERENCES organizations(id),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200)  NOT NULL,
    description     TEXT,
    priority        VARCHAR(10)   NOT NULL DEFAULT 'Medium',  -- Low / Medium / High
    due_date        DATE,
    status          VARCHAR(20)   NOT NULL DEFAULT 'Pending', -- Pending / In Progress / Completed
    organization_id INTEGER       NOT NULL REFERENCES organizations(id),
    assigned_to     INTEGER       NOT NULL REFERENCES users(id),
    created_by      INTEGER       NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
