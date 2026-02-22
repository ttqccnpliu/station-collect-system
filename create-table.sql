-- 站点采集表创建脚本
-- 在 Supabase SQL Editor 中执行此脚本

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
CREATE INDEX IF NOT EXISTS idx_station_collect_collector ON station_collect(collector_id);
CREATE INDEX IF NOT EXISTS idx_station_collect_audit_status ON station_collect(audit_status);
CREATE INDEX IF NOT EXISTS idx_station_collect_collect_time ON station_collect(collect_time);

-- 添加表注释
COMMENT ON TABLE station_collect IS '站点信息采集表';
COMMENT ON COLUMN station_collect.collect_id IS '采集ID，主键';
COMMENT ON COLUMN station_collect.collect_no IS '采集编号，唯一';
COMMENT ON COLUMN station_collect.collect_type IS '采集类型：1-新站点 2-信息更新 3-纠错 4-补充';
COMMENT ON COLUMN station_collect.station_name IS '站点名称';
COMMENT ON COLUMN station_collect.area_code IS '区域编码';
COMMENT ON COLUMN station_collect.address IS '详细地址';
COMMENT ON COLUMN station_collect.longitude IS '经度';
COMMENT ON COLUMN station_collect.latitude IS '纬度';
COMMENT ON COLUMN station_collect.contact_name IS '联系人';
COMMENT ON COLUMN station_collect.contact_phone IS '联系电话';
COMMENT ON COLUMN station_collect.business_hours IS '营业时间';
COMMENT ON COLUMN station_collect.station_type IS '站点类型：1-综合检测站 2-环保检测站 3-安检站';
COMMENT ON COLUMN station_collect.services IS '服务项目，JSON格式';
COMMENT ON COLUMN station_collect.images IS '现场图片，JSON数组';
COMMENT ON COLUMN station_collect.collect_remark IS '采集备注';
COMMENT ON COLUMN station_collect.collector_id IS '采集人ID';
COMMENT ON COLUMN station_collect.collect_time IS '采集时间';
COMMENT ON COLUMN station_collect.audit_status IS '审核状态：0-待审核 1-已通过 2-已驳回';
COMMENT ON COLUMN station_collect.auditor_id IS '审核人ID';
COMMENT ON COLUMN station_collect.audit_time IS '审核时间';
COMMENT ON COLUMN station_collect.audit_remark IS '审核备注';
COMMENT ON COLUMN station_collect.reward_amount IS '奖励金额';
COMMENT ON COLUMN station_collect.reward_status IS '奖励状态：0-未发放 1-已发放';
COMMENT ON COLUMN station_collect.create_time IS '创建时间';
COMMENT ON COLUMN station_collect.update_time IS '更新时间';

-- 启用 RLS (Row Level Security)
ALTER TABLE station_collect ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有用户读取
CREATE POLICY "Allow read access for all users" ON station_collect
    FOR SELECT USING (true);

-- 创建策略：允许所有用户插入
CREATE POLICY "Allow insert access for all users" ON station_collect
    FOR INSERT WITH CHECK (true);

-- 创建策略：允许所有用户更新
CREATE POLICY "Allow update access for all users" ON station_collect
    FOR UPDATE USING (true);

-- 创建策略：允许所有用户删除
CREATE POLICY "Allow delete access for all users" ON station_collect
    FOR DELETE USING (true);

-- 插入测试数据
INSERT INTO station_collect (
    collect_no, collect_type, station_name, area_code, address, 
    longitude, latitude, contact_name, contact_phone, business_hours,
    station_type, services, collect_remark, collector_id, audit_status
) VALUES (
    'CJ202402220001', 1, '测试检测站', '440300', '深圳市南山区测试路1号',
    114.0578680, 22.5430990, '张三', '13800138000', '周一至周五 08:30-17:30',
    1, '["机动车安全技术检验", "机动车环保检测"]', '测试数据', 1, 0
) ON CONFLICT (collect_no) DO NOTHING;

-- 验证数据
SELECT * FROM station_collect LIMIT 5;
