-- 修复 RLS 策略，允许匿名用户进行所有操作
-- 在 Supabase SQL Editor 中执行

-- 删除现有策略
DROP POLICY IF EXISTS "Allow all operations" ON station_collect;
DROP POLICY IF EXISTS "Allow read access for all users" ON station_collect;
DROP POLICY IF EXISTS "Allow insert access for all users" ON station_collect;
DROP POLICY IF EXISTS "Allow update access for all users" ON station_collect;
DROP POLICY IF EXISTS "Allow delete access for all users" ON station_collect;

-- 创建新的宽松策略（允许所有用户进行所有操作）
CREATE POLICY "Enable all access" ON station_collect
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 验证策略
SELECT * FROM pg_policies WHERE tablename = 'station_collect';
