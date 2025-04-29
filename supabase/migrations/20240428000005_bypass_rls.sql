-- Temporarily disable RLS
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to the anon role
GRANT SELECT ON "User" TO anon;
GRANT SELECT ON "User" TO authenticated;

-- Create a function to authenticate users
CREATE OR REPLACE FUNCTION authenticate_user(p_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  password TEXT,
  "fullName" TEXT,
  role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.password,
    u."fullName",
    u.role
  FROM "User" u
  WHERE LOWER(u.email) = LOWER(p_email);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT) TO authenticated; 