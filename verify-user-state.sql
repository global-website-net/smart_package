-- Check auth.users table
SELECT id as auth_id, 
       email as auth_email, 
       email_confirmed_at,
       last_sign_in_at,
       raw_user_meta_data
FROM auth.users 
WHERE email = 'admin1@hotmail.com';

-- Check User table
SELECT id as user_id,
       email as user_email,
       role,
       "fullName",
       governorate,
       town,
       "phonePrefix",
       "phoneNumber"
FROM "User"
WHERE email = 'admin1@hotmail.com';

-- Check if IDs match
SELECT 
    a.id as auth_id,
    a.email as auth_email,
    u.id as user_id,
    u.email as user_email,
    CASE 
        WHEN a.id = u.id THEN 'IDs Match ✓'
        ELSE 'IDs DO NOT Match ✗'
    END as id_status
FROM auth.users a
FULL OUTER JOIN "User" u ON u.email = a.email
WHERE a.email = 'admin1@hotmail.com' OR u.email = 'admin1@hotmail.com'; 