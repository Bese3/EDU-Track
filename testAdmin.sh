#!/usr/bin/env bash
mongo="mongosh"
db="edu-track"
value="{name: 'testAdmin', email: 'testEmail', password: '\$2b\$10\$PgI2PHlmtdRCE3zZiQk0kOsxWh0Lw1hUPHNFhWo9Z6vfPLihQX3gO', age: 34, phone: '345623456', type: 'admin'}"
echo "use $db" | $monbo $db
echo "db.admins.insertOne($value)" | $mongo $db
