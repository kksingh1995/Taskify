-- Creates a dedicated, least-privilege SQL login for the Taskify backend to use
-- (instead of connecting as 'sa'). Run once as a sysadmin.

USE master;
GO
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'taskify_app')
BEGIN
    CREATE LOGIN taskify_app WITH PASSWORD = 'REPLACE_WITH_A_STRONG_PASSWORD', CHECK_POLICY = ON;
END
GO

USE Taskify;
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'taskify_app')
BEGIN
    CREATE USER taskify_app FOR LOGIN taskify_app;
    ALTER ROLE db_datareader ADD MEMBER taskify_app;
    ALTER ROLE db_datawriter ADD MEMBER taskify_app;
END
GO
