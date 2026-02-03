-- Fix Newsletter author foreign key to add cascade delete
ALTER TABLE newsletters DROP CONSTRAINT IF EXISTS newsletters_authorId_fkey;
ALTER TABLE newsletters ADD CONSTRAINT newsletters_authorId_fkey 
  FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
