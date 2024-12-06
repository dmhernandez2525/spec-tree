#!/bin/bash

# Output file
output_file="contents.txt"

# Clear or create the output file
> "$output_file"

# Function to check if path contains excluded directories
is_excluded() {
    local path="$1"
    
    # Convert path to lowercase for case-insensitive matching
    local lowercase_path=$(echo "$path" | tr '[:upper:]' '[:lower:]')
    
    # Check for specific files to exclude
    if [[ "$lowercase_path" == "package-lock.json" ]] || \
       [[ "$lowercase_path" == "./package-lock.json" ]]; then
        return 0
    fi
    
    # Check for directories and patterns to exclude
    if [[ "$lowercase_path" == "node_modules" ]] || \
       [[ "$lowercase_path" == "./node_modules" ]] || \
       [[ "$lowercase_path" == */node_modules/* ]] || \
       [[ "$lowercase_path" == */.next/* ]] || \
       [[ "$lowercase_path" == */.env ]]; then
        return 0
    fi
    
    return 1
}

# Function to process a file
process_file() {
    local file="$1"
    local relative_path="${file#./}"
    
    # Debug output - uncomment to see which files are being processed
    # echo "Processing file: $relative_path"
    
    # Skip the output file itself
    if [ "$relative_path" = "$output_file" ]; then
        return
    fi
    
    # Skip hidden files and excluded paths
    if [[ "$relative_path" == .* ]] || is_excluded "$relative_path"; then
        # Debug output - uncomment to see which files are being skipped
        # echo "Skipping: $relative_path"
        return
    fi

    # If it's a regular file, process it
    if [ -f "$file" ]; then
        # Add the file path as a header
        echo -e "\n/$(pwd)/$relative_path\n===\n" >> "$output_file"
        
        # Add the file contents
        cat "$file" >> "$output_file"
        
        # Add a separator
        echo -e "\n===\n" >> "$output_file"
    fi
}

# Function to process directories recursively
process_directory() {
    local dir="$1"
    
    # Skip processing if the directory is node_modules or .next
    if [[ "$dir" == *"node_modules"* ]] || [[ "$dir" == *".next"* ]]; then
        return
    fi
    
    # Process all files in the current directory
    for entry in "$dir"/*; do
        # Skip if the entry doesn't exist (handles empty directories)
        [ -e "$entry" ] || continue
        
        if [ -d "$entry" ]; then
            if ! is_excluded "$entry"; then
                process_directory "$entry"
            fi
        elif [ -f "$entry" ]; then
            process_file "$entry"
        fi
    done
}

# Start processing from the current directory
process_directory "."

echo "File processing complete. Results saved to $output_file"