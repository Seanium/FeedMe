#!/bin/bash

# Create log file and set permissions
touch /var/log/cron.log
chmod 666 /var/log/cron.log

echo "$(date): 容器启动中，执行初始更新和服务..." | tee -a /var/log/cron.log

# Run the update and serve script immediately on container start
/app/scripts/update_and_serve.sh

if [ $? -ne 0 ]; then
    echo "$(date): 错误：初始更新和服务失败。请检查日志。" | tee -a /var/log/cron.log
    exit 1
fi

echo "$(date): 初始更新和服务完成。设置定时任务..." | tee -a /var/log/cron.log

# Make the setup-cron.sh script executable
chmod +x /app/scripts/setup-cron.sh

# Run the cron setup script
/app/scripts/setup-cron.sh

echo "$(date): 容器启动完成。正在监控日志..." | tee -a /var/log/cron.log

# Keep container alive and show logs
tail -f /var/log/cron.log 