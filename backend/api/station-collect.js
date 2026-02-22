const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端
const supabaseUrl = process.env.SUPABASE_URL || 'https://qvgzkvtayjnrydzcvuil.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3prdnRheWpucnlkemN2dWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzE1NzEsImV4cCI6MjA4NzE0NzU3MX0.58w2sb1SNg-wbZDk2UyOE6vjkI504-jccYagJ_s7OCI';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 创建站点采集记录
 * POST /api/station-collect
 */
router.post('/', async (req, res) => {
  try {
    const {
      collect_no,
      collect_type,
      station_name,
      area_code,
      address,
      longitude,
      latitude,
      contact_name,
      contact_phone,
      business_hours,
      station_type,
      services,
      images,
      collect_remark,
      collector_id,
      collect_time
    } = req.body;

    // 参数验证
    if (!collect_no || !station_name || !area_code || !address) {
      return res.status(400).json({
        success: false,
        message: '缺少必填参数'
      });
    }

    // 构建插入数据
    const insertData = {
      collect_no,
      collect_type: collect_type || 1,
      station_name,
      area_code,
      address,
      longitude: longitude || null,
      latitude: latitude || null,
      contact_name: contact_name || null,
      contact_phone: contact_phone || null,
      business_hours: business_hours || null,
      station_type: station_type || 1,
      services: services ? JSON.stringify(services) : null,
      images: images ? JSON.stringify(images) : null,
      collect_remark: collect_remark || null,
      collector_id: collector_id || 1,
      collect_time: collect_time || new Date().toISOString(),
      audit_status: 0, // 默认待审核
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString()
    };

    // 插入数据到 Supabase
    const { data, error } = await supabase
      .from('station_collect')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase 插入错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库操作失败',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: '站点采集提交成功',
      data: data[0]
    });

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 获取站点采集列表
 * GET /api/station-collect
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      audit_status,
      collector_id,
      keyword,
      start_date,
      end_date
    } = req.query;

    // 构建查询
    let query = supabase
      .from('station_collect')
      .select('*', { count: 'exact' });

    // 添加筛选条件
    if (audit_status !== undefined) {
      query = query.eq('audit_status', audit_status);
    }

    if (collector_id) {
      query = query.eq('collector_id', collector_id);
    }

    if (keyword) {
      query = query.or(`station_name.ilike.%${keyword}%,address.ilike.%${keyword}%,collect_no.ilike.%${keyword}%`);
    }

    if (start_date) {
      query = query.gte('collect_time', start_date);
    }

    if (end_date) {
      query = query.lte('collect_time', end_date);
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('create_time', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase 查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库查询失败',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    });

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 获取单个站点采集详情
 * GET /api/station-collect/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('station_collect')
      .select('*')
      .eq('collect_id', id)
      .single();

    if (error) {
      console.error('Supabase 查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库查询失败',
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: '采集记录不存在'
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 更新站点采集记录
 * PUT /api/station-collect/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      update_time: new Date().toISOString()
    };

    // 不允许修改的字段
    delete updateData.collect_id;
    delete updateData.create_time;

    const { data, error } = await supabase
      .from('station_collect')
      .update(updateData)
      .eq('collect_id', id)
      .select();

    if (error) {
      console.error('Supabase 更新错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库更新失败',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: '更新成功',
      data: data[0]
    });

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 审核站点采集
 * POST /api/station-collect/:id/audit
 */
router.post('/:id/audit', async (req, res) => {
  try {
    const { id } = req.params;
    const { audit_status, audit_remark, auditor_id } = req.body;

    if (![1, 2].includes(audit_status)) {
      return res.status(400).json({
        success: false,
        message: '审核状态无效（1-通过，2-驳回）'
      });
    }

    const updateData = {
      audit_status,
      audit_remark: audit_remark || null,
      auditor_id: auditor_id || null,
      audit_time: new Date().toISOString(),
      update_time: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('station_collect')
      .update(updateData)
      .eq('collect_id', id)
      .select();

    if (error) {
      console.error('Supabase 审核错误:', error);
      return res.status(500).json({
        success: false,
        message: '审核操作失败',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: audit_status === 1 ? '审核通过' : '审核已驳回',
      data: data[0]
    });

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 删除站点采集记录
 * DELETE /api/station-collect/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('station_collect')
      .delete()
      .eq('collect_id', id);

    if (error) {
      console.error('Supabase 删除错误:', error);
      return res.status(500).json({
        success: false,
        message: '删除失败',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

module.exports = router;
