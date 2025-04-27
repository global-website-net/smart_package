-- Revert the admin user's password to its original value
UPDATE "User"
SET password = NULL
WHERE email = 'admin2@hotmail.com'; 