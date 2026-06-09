"""
Deploy Supabase Schema Script
This script connects to Supabase PostgreSQL and executes the schema.sql file
"""

import psycopg2
from psycopg2 import sql
import os

# Supabase connection details
SUPABASE_URL = "https://rqpslulmmzlxnfkpphpg.supabase.co"
SUPABASE_DB_URL = "postgresql://postgres.dqpslulmmzlxnfkpphpg:your_password_here@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
# Note: You need the database password, not the service role key

# The service role key provided is for REST API, not direct PostgreSQL connection
# To execute SQL directly, we need either:
# 1. The database password (from Supabase dashboard)
# 2. Use Supabase Management API
# 3. Use psql command line with connection string

print("To deploy the schema, you have these options:")
print("1. Run the SQL manually in Supabase Dashboard -> SQL Editor")
print("2. Use Supabase CLI: supabase db push")
print("3. Use psql: psql -h db.rqpslulmmzlxnfkpphpg.supabase.co -U postgres -d postgres -f schema.sql")
print("\nThe service role key (<SUPABASE_PAT_REDACTED>) is for REST API, not direct SQL execution.")
print("Direct SQL execution requires the database password from Supabase Settings -> Database.")
