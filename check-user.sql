-- Check auth.users table
SELECT id, email, email_confirmed_at, last_sign_in_at, raw_user_meta_data
FROM auth.users
WHERE email = 'admin1@hotmail.com';

-- Check User table
SELECT *
FROM "User"
WHERE email = 'admin1@hotmail.com'; 