const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://qvgzkvtayjnrydzcvuil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3prdnRheWpucnlkemN2dWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzE1NzEsImV4cCI6MjA4NzE0NzU3MX0.58w2sb1SNg-wbZDk2UyOE6vjkI504-jccYagJ_s7OCI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🧪 测试数据库连接...\n');

  try {
    // 测试1：查询表结构
    console.log('1️⃣ 测试查询表...');
    const { data: tableData, error: tableError } = await supabase
      .from('station_collect')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('   ❌ 查询失败:', tableError.message);
      return false;
    }
    console.log('   ✅ 表查询成功！');
    console.log('   📊 当前数据条数:', tableData.length);

    // 测试2：插入测试数据
    console.log('\n2️⃣ 测试插入数据...');
    const testData = {
      collect_no: 'TEST' + Date.now(),
      collect_type: 1,
      station_name: '测试站点_' + Date.now(),
      area_code: '440300',
      address: '测试地址',
      station_type: 1,
      collector_id: 1,
      collect_time: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('station_collect')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('   ❌ 插入失败:', insertError.message);
      return false;
    }
    console.log('   ✅ 插入成功！');
    console.log('   📝 插入的ID:', insertData[0].collect_id);

    // 测试3：查询刚插入的数据
    console.log('\n3️⃣ 测试查询数据...');
    const { data: queryData, error: queryError } = await supabase
      .from('station_collect')
      .select('*')
      .eq('collect_id', insertData[0].collect_id)
      .single();

    if (queryError) {
      console.log('   ❌ 查询失败:', queryError.message);
      return false;
    }
    console.log('   ✅ 查询成功！');
    console.log('   📋 站点名称:', queryData.station_name);

    // 测试4：删除测试数据
    console.log('\n4️⃣ 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('station_collect')
      .delete()
      .eq('collect_id', insertData[0].collect_id);

    if (deleteError) {
      console.log('   ⚠️  删除失败:', deleteError.message);
    } else {
      console.log('   ✅ 清理完成！');
    }

    return true;

  } catch (error) {
    console.error('❌ 测试出错:', error.message);
    return false;
  }
}

testDatabase().then(success => {
  if (success) {
    console.log('\n✅ 数据库测试全部通过！');
    console.log('🎉 现在可以正常使用站点数据采集功能了！\n');
    process.exit(0);
  } else {
    console.log('\n❌ 数据库测试失败，请检查配置\n');
    process.exit(1);
  }
});
