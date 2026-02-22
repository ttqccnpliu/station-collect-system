const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://qvgzkvtayjnrydzcvuil.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3prdnRheWpucnlkemN2dWlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3MTU3MSwiZXhwIjoyMDg3MTQ3NTcxfQ.service_role_key_here';

const supabase = createClient(supabaseUrl, supabaseKey);

// 使用 RPC 执行 SQL
async function setupDatabase() {
  console.log('🔄 正在设置数据库...\n');

  try {
    // 方法1：尝试直接插入数据，如果表不存在会报错
    console.log('1️⃣ 检查表是否存在...');
    const { data: testData, error: testError } = await supabase
      .from('station_collect')
      .select('count')
      .limit(1);

    if (testError && testError.code === 'PGRST205') {
      console.log('   ❌ 表不存在，需要手动创建');
      console.log('\n📋 请按照以下步骤创建表：\n');
      console.log('1. 登录 Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/qvgzkvtayjnrydzcvuil');
      console.log('\n2. 进入 SQL Editor');
      console.log('\n3. 执行以下 SQL:\n');
      console.log('='.repeat(60));
      console.log(`
-- 创建站点采集表
CREATE TABLE IF NOT EXISTS station_collect (
    collect_id BIGSERIAL PRIMARY KEY,
    collect_no VARCHAR(32) NOT NULL UNIQUE,
    collect_type SMALLINT NOT NULL DEFAULT 1,
    station_name VARCHAR(100) NOT NULL,
    area_code VARCHAR(20) NOT NULL,
    address VARCHAR(200) NOT NULL,
    longitude DECIMAL(10,7),
    latitude DECIMAL(10,7),
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    business_hours VARCHAR(100),
    station_type SMALLINT NOT NULL,
    services TEXT,
    images TEXT,
    collect_remark VARCHAR(500),
    collector_id BIGINT NOT NULL,
    collect_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    audit_status SMALLINT NOT NULL DEFAULT 0,
    auditor_id BIGINT,
    audit_time TIMESTAMP,
    audit_remark VARCHAR(500),
    reward_amount DECIMAL(8,2) DEFAULT 0.00,
    reward_status SMALLINT DEFAULT 0,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_station_collect_collector ON station_collect(collector_id);
CREATE INDEX idx_station_collect_audit_status ON station_collect(audit_status);
CREATE INDEX idx_station_collect_collect_time ON station_collect(collect_time);

-- 启用 RLS
ALTER TABLE station_collect ENABLE ROW LEVEL SECURITY;

-- 创建访问策略
CREATE POLICY "Allow all operations" ON station_collect
    FOR ALL USING (true) WITH CHECK (true);
`);
      console.log('='.repeat(60));
      console.log('\n4. 执行完成后，重新启动后端服务器');
      console.log('\n⚠️  注意：需要使用 Service Role Key 才能通过 API 创建表');
      console.log('   当前使用的是 Anon Key，权限受限\n');
      
      return false;
    } else if (testError) {
      console.log('   ⚠️  检查表时出错:', testError.message);
      return false;
    } else {
      console.log('   ✅ 表已存在！');
      console.log('\n📊 当前数据量:', testData.length > 0 ? '有数据' : '空表');
      return true;
    }

  } catch (error) {
    console.error('❌ 设置数据库时出错:', error.message);
    return false;
  }
}

// 运行设置
setupDatabase().then(success => {
  if (success) {
    console.log('\n✅ 数据库设置完成！');
    process.exit(0);
  } else {
    console.log('\n⚠️  需要手动创建表');
    process.exit(1);
  }
});
