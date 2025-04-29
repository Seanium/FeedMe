#!/bin/bash

# Export all environment variables to a file that will be sourced by cron
env > /etc/environment

# Set up crontab from our configuration file
crontab /etc/crontabs/root

# Start crond with log level information
crond -L 8

echo "$(date): 定时任务设置完成，守护进程已启动。" >> /var/log/cron.log 