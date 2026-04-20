---
scenes:
  - backend-debug
  - microservice
  - log-analysis
  - service-restart
paths:
  - "**/package.json"
  - "**/docker-compose.yml"
  - "**/pm2.config.js"
priority: optional
---

# 后端服务调试

## 多服务管理

用 PM2 让 Claude 自主调试多个后端微服务。

## 常用命令

- `pm2 list` — 查看服务状态
- `pm2 logs [service]` — 查看日志
- `pm2 restart [service]` — 重启服务
- `pm2 stop [service]` — 停止服务
- `pm2 monit` — 监控面板

## 调试流程

1. Claude 自己执行 `pm2 logs` 查看日志
2. 自己分析问题
3. 自己重启服务
4. 从"人肉日志搬运工"变成自主调试

## 加载时机

**可选场景**：
- 调试后端服务时
- 查看服务日志时
- 重启或管理微服务时
- 项目包含 package.json 或 docker-compose.yml