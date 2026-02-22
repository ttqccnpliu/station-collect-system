-- 完整的数据库修复脚本
-- 先删除已存在的对象，再重新创建

-- ========================================
-- 1. 删除已存在的索引（如果存在）
-- ========================================
DROP INDEX IF EXISTS idx_station_collect_collector;
DROP INDEX IF EXISTS idx_station_collect_audit_status;
DROP INDEX IF EXISTS idx_station_collect_collect_time;

-- ========================================
-- 2. 删除已存在的策略（如果存在）
-- ========================================
DROP POLICY IF EXISTS "Allow all operations" ON station_collect;
DROP POLICY IF EXISTS "Allow read access for all users" ON station_collect;
DROP POLICY IF EXISTS "Allow insert access for all users" ON station_collect;
DROP POLICY IF EXISTS "Allow update access for all users" ON station_collect;
DROP POLICY IF EXISTS "Allow delete access for all users" ON station_collect;
DROP POLICY IF EXISTS "Enable all access" ON station_collect;

-- ========================================
-- 3. 重新创建索引
-- ========================================
CREATE INDEX idx_station_collect_collector ON station_collect(collector_id);
CREATE INDEX idx_station_collect_audit_status ON station_collect(audit_status);
CREATE INDEX idx_station_collect_collect_time ON station_collect(collect_time);

-- ========================================
-- 4. 修复 RLS 策略
-- ========================================

-- 确保 RLS 已启用
ALTER TABLE station_collect ENABLE ROW LEVEL SECURITY;

-- 创建新的宽松策略
CREATE POLICY "Enable all access for anon" ON station_collect
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated" ON station_collect
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 5. 验证配置
-- ========================================
SELECT '索引列表:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'station_collect';

SELECT 'RLS 策略列表:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'station_collect';

SELECT 'RLS 状态:' as info;
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'station_collect';

-- ========================================
-- 6. 测试插入
-- ========================================
INSERT INTO station_collect (
    collect_no, 
    collect_type, 
    station_name, 
    area_code, 
    address, 
    station_type, 
    collector_id
) VALUES (
    'TEST_INIT_' || extract(epoch from now())::bigint,
    1,
    '初始化测试站点',
    '440300',
    '测试地址',
    1,
    1
) RETURNING collect_id, station_name, collect_no;
