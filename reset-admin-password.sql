-- Reset password for admin user in auth.users
SELECT auth.users.email, auth.users.id
FROM auth.users
WHERE email = 'admin1@hotmail.com';

-- After confirming the user exists, use this function to update the password
SELECT auth.change_user_password(
  '52a14e88-2267-406f-a716-32e6ffcd1591', -- use the auth user ID
  'Admin123!' -- new password, change this to what you want
); 