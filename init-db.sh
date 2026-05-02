#!/bin/bash
# סקריפט ליצירת שתי מסדי הנתונים בהפעלה ראשונה של PostgreSQL
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE fraud_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fraud_db')\gexec
    SELECT 'CREATE DATABASE victim_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'victim_db')\gexec
EOSQL

echo "✅ Databases fraud_db and victim_db created successfully."
