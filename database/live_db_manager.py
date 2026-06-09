"""
Live Database Manager for Astraventa FB Sniper
Execute SQL changes on Supabase via REST API
"""

import requests
import json

# Supabase Configuration
SUPABASE_URL = "https://rqpslulmmzlxnfkpphpg.supabase.co"
SERVICE_ROLE_KEY = "<SUPABASE_PAT_REDACTED>"

# Headers for Supabase REST API
HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}


def execute_sql(query: str) -> dict:
    """
    Execute raw SQL on Supabase via RPC
    Note: Supabase REST API doesn't support direct SQL execution.
    This function uses the rpc endpoint to call SQL functions.
    
    For DDL operations (CREATE, ALTER, DROP), use the Supabase Dashboard SQL Editor.
    """
    # For DML operations (SELECT, INSERT, UPDATE, DELETE), use table endpoints
    # For DDL operations, manual execution in Dashboard is required
    
    print("⚠️  Direct SQL execution via REST API is not supported by Supabase.")
    print("📝 For DDL operations (CREATE TABLE, ALTER, etc.), use:")
    print("   https://supabase.com/dashboard/project/rqpslulmmzlxnfkpphpg/sql/new")
    print("\n📝 For DML operations (INSERT, UPDATE, DELETE), use the table REST API:")
    print("   POST/PUT/PATCH https://rqpslulmmzlxnfkpphpg.supabase.co/rest/v1/{table_name}")
    
    return {"status": "error", "message": "Direct SQL not supported via REST API"}


def insert_data(table: str, data: dict) -> dict:
    """
    Insert data into a table via REST API
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    response = requests.post(url, headers=HEADERS, json=data)
    return response.json()


def update_data(table: str, data: dict, filter_field: str, filter_value: str) -> dict:
    """
    Update data in a table via REST API
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}?{filter_field}=eq.{filter_value}"
    response = requests.patch(url, headers=HEADERS, json=data)
    return response.json()


def delete_data(table: str, filter_field: str, filter_value: str) -> dict:
    """
    Delete data from a table via REST API
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}?{filter_field}=eq.{filter_value}"
    response = requests.delete(url, headers=HEADERS)
    return {"status": "deleted" if response.status_code == 204 else "error"}


def call_rpc(function_name: str, params: dict) -> dict:
    """
    Call a PostgreSQL function via RPC
    """
    url = f"{SUPABASE_URL}/rest/v1/rpc/{function_name}"
    response = requests.post(url, headers=HEADERS, json=params)
    return response.json()


# Example usage functions
def test_connection():
    """Test connection to Supabase"""
    try:
        # Try to call a simple function to test connection
        result = call_rpc("has_active_meta_token", {"p_user_id": "00000000-0000-0000-0000-000000000000"})
        print("✅ Connection successful")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


if __name__ == "__main__":
    print("=== Astraventa FB Sniper - Live Database Manager ===\n")
    print("This script manages database operations via Supabase REST API.\n")
    print("For schema changes (DDL), use the Supabase Dashboard SQL Editor:")
    print("https://supabase.com/dashboard/project/rqpslulmmzlxnfkpphpg/sql/new\n")
    print("For data operations (DML), use the functions in this script.\n")
    
    # Test connection
    test_connection()
