#!/bin/bash

# Export all environment variables to a file that will be sourced by cron
env > /etc/environment

# Set up crontab from our configuration file
crontab /etc/crontabs/root

# Start crond with log level information
crond -L 8

echo "$(date): Cron setup completed and daemon started." 