#!/bin/bash

# Load .env variables if .env file exists
if [ -f ".env" ]; then
    source .env
fi

# Initialize variables
old_db_new_name=""
rename_choice=""
new_db_choice=""
new_owner="postgres" # Default owner
dump_file="strapi-stg-db.sql"
env_selection=""
suggested_db_name=""
source_db_uri=""
ORIGINAL_OWNER=""

echo "Select the target environment for applying the dump:"
echo "1) Local"
echo "2) Development"
echo "3) Staging"
read -p "Enter choice [1-3]: " env_selection

# Set up environment-specific variables and suggest new DB name based on choice
case $env_selection in
    1) # Local
        DB_HOST=$DATABASE_HOST
        DB_PORT=$DATABASE_PORT
        DB_NAME=$DATABASE_NAME
        DB_USERNAME=$DATABASE_USERNAME
        DB_PASSWORD=$DATABASE_PASSWORD
        suggested_db_name="${DB_NAME}_new"
        echo "Select the new owner for the database objects (default is postgres):"
        echo "1) postgres"
        echo "2) jonathanjohnson"
        echo "3) daniel"
        echo "4) zacharykessler"
        read -p "Enter choice [1-4]: " owner_choice

        case $owner_choice in
            2) new_owner="jonathanjohnson";;
            3) new_owner="daniel";;
            4) new_owner="zacharykessler";;
            *) new_owner="postgres";;
        esac
        ;;
    2) # Development
        DB_HOST=$DEV_DATABASE_HOST
        DB_PORT=$DEV_DATABASE_PORT
        DB_NAME=$DEV_DATABASE_NAME
        DB_USERNAME=$DEV_DATABASE_USERNAME
        DB_PASSWORD=$DEV_DATABASE_PASSWORD
        new_owner=$DEV_DATABASE_USERNAME
        suggested_db_name="${DB_NAME}_new"
        ;;
    3) # Staging
        DB_HOST=$STAGE_DATABASE_HOST
        DB_PORT=$STAGE_DATABASE_PORT
        DB_NAME=$STAGE_DATABASE_NAME
        DB_USERNAME=$STAGE_DATABASE_USERNAME
        DB_PASSWORD=$STAGE_DATABASE_PASSWORD
        new_owner=$STAGE_DATABASE_USERNAME
        suggested_db_name="${DB_NAME}_new"
        ;;
    *)
        echo "Invalid selection. Exiting script."
        exit 1
        ;;
esac

# Prompt for source database URI or list options
echo "Select the source database URI:"
echo "1) Use DEV_DATABASE_URI"
echo "2) Use STAGE_DATABASE_URI"
echo "3) Input custom URI"
read -p "Enter choice [1-3]: " uri_choice

case $uri_choice in
    1)
        source_db_uri=$DEV_DATABASE_URI
        ORIGINAL_OWNER=$DEV_DATABASE_USERNAME
        ;;
    2)
        source_db_uri=$STAGE_DATABASE_URI
        ORIGINAL_OWNER=$STAGE_DATABASE_USERNAME
        ;;
    3)
        read -p "Enter the source database URI: " source_db_uri
        if [[ -z "$source_db_uri" ]]; then
            echo "Source database URI is required. Exiting."
            exit 1
        fi
        read -p "Enter the original owner of the source database: " ORIGINAL_OWNER
        ;;
    *)
        echo "Invalid selection. Exiting script."
        exit 1
        ;;
esac

# Output all available databases on the PostgreSQL instance
echo "Retrieving list of databases on the PostgreSQL instance..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "\l"

# Dump the source database without ownership information
echo "Dumping database from URI: $source_db_uri"
PGPASSWORD=$(echo $source_db_uri | cut -d':' -f3 | cut -d'@' -f1) pg_dump -h $(echo $source_db_uri | cut -d'@' -f2 | cut -d'/' -f1) -U $(echo $source_db_uri | cut -d':' -f2 | cut -d'/' -f3) --no-owner $(echo $source_db_uri | cut -d'/' -f4) > $dump_file
echo "Database dumped successfully to $dump_file."

echo "Checking if target database exists..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | grep -q 1
if [ $? -eq 0 ]; then
    echo "Target database $DB_NAME exists."
    # Disconnect active connections
    echo "Disconnecting all active connections to the database..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"
    
    echo "Options:"
    echo "1) Rename existing database"
    echo "2) Drop existing database"
    echo "3) Create and use a new database"
    read -p "Select an action [1-3]: " new_db_choice

    case $new_db_choice in
        1)
            # Rename existing database
            read -p "Enter a new name for the existing database: " old_db_new_name
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "ALTER DATABASE \"$DB_NAME\" RENAME TO \"$old_db_new_name\";"
            echo "Database renamed to $old_db_new_name."
            # Create a new database with the original name
            PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME "$DB_NAME"
            echo "New database created with the original name: $DB_NAME"
            ;;
        2)
            # Drop existing database
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "DROP DATABASE \"$DB_NAME\";"
            echo "Database $DB_NAME dropped."
            PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME "$DB_NAME"
            echo "New database created with the original name: $DB_NAME"
            ;;
        3)
            # Create and use a new database
            echo "Suggested new database name is $suggested_db_name"
            read -p "Enter new database name (or press Enter to accept suggestion): " new_db_name
            new_db_name=${new_db_name:-$suggested_db_name}
            PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME "$new_db_name"
            DB_NAME=$new_db_name
            echo "New database created: $DB_NAME"
            ;;
        *)
            echo "Invalid option selected. Exiting."
            exit 1
            ;;
    esac
else
    echo "No existing database named $DB_NAME. A new one will be created."
    PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME "$DB_NAME"
fi

# Apply the dump to the target database
echo "Applying dump to the target database: $DB_NAME..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -f $dump_file
echo "Dump applied successfully to the target database."

# Adjust ownership of the objects in the target database
echo "Adjusting ownership of the objects in the target database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "REASSIGN OWNED BY $ORIGINAL_OWNER TO $new_owner;"
echo "Ownership adjustment complete."

echo "Database operation complete. The new owner is $new_owner."
