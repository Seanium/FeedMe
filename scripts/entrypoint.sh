#!/bin/bash

# Create log file and set permissions
touch /var/log/cron.log
chmod 666 /var/log/cron.log

echo "$(date): Container starting, performing initial update and serve..." | tee -a /var/log/cron.log

# Run the update and serve script immediately on container start
/app/scripts/update_and_serve.sh

if [ $? -ne 0 ]; then
    echo "$(date): ERROR: Initial update and serve failed. Check logs." | tee -a /var/log/cron.log
    exit 1
fi

echo "$(date): Initial update and serve complete. Setting up cron daemon..." | tee -a /var/log/cron.log

# Make the setup-cron.sh script executable
chmod +x /app/scripts/setup-cron.sh

# Run the cron setup script
/app/scripts/setup-cron.sh

echo "$(date): Container startup complete. Tailing log to keep container running..." | tee -a /var/log/cron.log

# Keep container alive and show logs
tail -f /var/log/cron.log 