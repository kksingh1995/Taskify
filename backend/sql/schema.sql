-- Taskify SQL Server schema
-- Run this once against your target database (create the database first, e.g. CREATE DATABASE Taskify;)

IF OBJECT_ID('dbo.Tasks', 'U') IS NOT NULL DROP TABLE dbo.Tasks;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Organizations', 'U') IS NOT NULL DROP TABLE dbo.Organizations;

CREATE TABLE dbo.Organizations (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(150)   NOT NULL,
    type            NVARCHAR(50)    NULL,            -- School / College / Business / Other
    status          NVARCHAR(20)    NOT NULL DEFAULT 'Active',  -- Active / Suspended
    created_by      INT             NULL,            -- super_admin user id
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.Users (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(100)   NOT NULL,
    email           NVARCHAR(150)   NOT NULL UNIQUE,
    password_hash   NVARCHAR(255)   NOT NULL,
    role            NVARCHAR(20)    NOT NULL,        -- super_admin / org_admin / employee
    phone_number    NVARCHAR(20)    NULL,            -- for WhatsApp share (include country code, e.g. 91XXXXXXXXXX)
    organization_id INT             NULL REFERENCES dbo.Organizations(id),
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.Tasks (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    title           NVARCHAR(200)   NOT NULL,
    description     NVARCHAR(MAX)   NULL,
    priority        NVARCHAR(10)    NOT NULL DEFAULT 'Medium',  -- Low / Medium / High
    due_date        DATE            NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'Pending', -- Pending / In Progress / Completed
    organization_id INT             NOT NULL REFERENCES dbo.Organizations(id),
    assigned_to     INT             NOT NULL REFERENCES dbo.Users(id),
    created_by      INT             NOT NULL REFERENCES dbo.Users(id),
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_Users_Organization ON dbo.Users(organization_id);
CREATE INDEX IX_Tasks_Organization ON dbo.Tasks(organization_id);
CREATE INDEX IX_Tasks_AssignedTo ON dbo.Tasks(assigned_to);
