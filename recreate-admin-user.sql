-- First, delete the user from both tables
DELETE FROM "User" WHERE email = 'admin1@hotmail.com';
DELETE FROM auth.users WHERE email = 'admin1@hotmail.com';

-- Then create the user in auth.users
SELECT auth.create_user(
  uid := gen_random_uuid()::text,
  email := 'admin1@hotmail.com',
  email_confirmed := true,
  password := 'Admin123!',
  data := jsonb_build_object(
    'email_confirmed', true
  )
);

-- Get the newly created auth user's ID
DO $$
DECLARE
    auth_user_id uuid;
BEGIN
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'admin1@hotmail.com';

    -- Insert into User table with the same ID
    INSERT INTO "User" (
        "id",
        "email",
        "password",
        "fullName",
        "role",
        "governorate",
        "town",
        "phonePrefix",
        "phoneNumber",
        "created_at",
        "updated_at"
    ) VALUES (
        auth_user_id,
        'admin1@hotmail.com',
        NULL,
        'Admin1',
        'ADMIN',
        'Default Governorate',
        'Default Town',
        '+962',
        '7777777777',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
END $$; 