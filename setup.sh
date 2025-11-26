#!/bin/bash
wget https://raw.githubusercontent.com/vallapuneni6-prog/ansira-routes/main/setup-schema.sql -O /tmp/setup.sql
mysql -h localhost -u root -p srv1_voucher_app_db < /tmp/setup.sql
echo "Schema imported successfully"
pm2 restart ansira
