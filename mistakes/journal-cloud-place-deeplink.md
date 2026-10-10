# 新增日记地点跳转不可被默认地点抢先消费

2026-10-10，验证《心灵搁浅》渡鸦镇链接时，地图 URL 为 journalPlace=raven-town，却选中博德之门。初始 seed 不含新地点，selectPlace 回退为第一处；云端到达后优先沿用 active，且 focused 已被默认地点消费。

修复：只有所请求地点确实存在且日志 ready，才优先选择它并完成首次聚焦。地图先到与日志先到均保留请求；不写存档，更新 map.html 的脚本缓存版本。

回归覆盖：云端专有地点在 ready 前后分别载入，后续 map:restored 仍选对地点，且没有 journal:change 写入。先复现断言失败（baldurs-gate != raven-town），再确认修复后与原日记/档案回归全部通过。
