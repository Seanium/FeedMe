#!/bin/bash

# Set the working directory to the script's directory
cd "$(dirname "$0")/.."

LOG_FILE="/var/log/cron.log"
PORT=3000
TEMP_DIR="/tmp/feedme-build"
OUTPUT_DIR="/app/out"

echo "----------------------------------------" >> $LOG_FILE
echo "$(date): Starting update and serve process..." >> $LOG_FILE

# Create temp directory for build
mkdir -p $TEMP_DIR
echo "Created temporary build directory: $TEMP_DIR" >> $LOG_FILE

# Update RSS feeds data in temporary directory
echo "Updating RSS feeds..." >> $LOG_FILE
cd /app
ORIGINAL_DATA_DIR="/app/data"
TEMP_DATA_DIR="$TEMP_DIR/data"

# Create temporary data directory
mkdir -p $TEMP_DATA_DIR

# Copy existing data for backup/reference
if [ -d "$ORIGINAL_DATA_DIR" ]; then
    cp -r $ORIGINAL_DATA_DIR/* $TEMP_DATA_DIR/ 2>/dev/null || true
    echo "Copied existing data to temporary location" >> $LOG_FILE
fi

# Update RSS feeds in temporary directory
DATA_DIR=$TEMP_DATA_DIR /usr/local/bin/pnpm update-feeds 2>&1 >> $LOG_FILE
if [ $? -ne 0 ]; then
    echo "$(date): ERROR: Failed to update RSS feeds." | tee -a $LOG_FILE
    rm -rf $TEMP_DIR
    exit 1
fi
echo "RSS feeds updated successfully in temporary directory." >> $LOG_FILE

# Build the project
echo "Building the project..." >> $LOG_FILE
cd /app
/usr/local/bin/pnpm build 2>&1 >> $LOG_FILE
if [ $? -ne 0 ]; then
    echo "$(date): ERROR: Failed to build the project." | tee -a $LOG_FILE
    rm -rf $TEMP_DIR
    exit 1
fi
echo "Project built successfully." >> $LOG_FILE

# Now we have successfully updated data and built the project
# Time to switch with minimal downtime

# Find and kill the previous serve process
echo "Stopping previous serve process on port $PORT..." >> $LOG_FILE
pkill -f "serve out -l $PORT" || true
echo "Previous serve process stopped." >> $LOG_FILE

# Update the real data directory with our updated data
echo "Updating production data directory..." >> $LOG_FILE
if [ -d "$TEMP_DATA_DIR" ]; then
    mkdir -p $ORIGINAL_DATA_DIR
    cp -r $TEMP_DATA_DIR/* $ORIGINAL_DATA_DIR/
    echo "Data directory updated." >> $LOG_FILE
fi

# Start the serve process with the new build
echo "Starting new serve process on port $PORT..." >> $LOG_FILE
cd /app
nohup /usr/local/bin/npx serve out -l $PORT >> $LOG_FILE 2>&1 &
if [ $? -ne 0 ]; then
    echo "$(date): ERROR: Failed to start serve process." | tee -a $LOG_FILE
    rm -rf $TEMP_DIR
    exit 1
fi

# Clean up temp directory
rm -rf $TEMP_DIR
echo "Temporary build directory removed." >> $LOG_FILE

echo "$(date): Serve process started successfully in the background." >> $LOG_FILE
echo "$(date): Update and serve process finished." >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE

exit 0 