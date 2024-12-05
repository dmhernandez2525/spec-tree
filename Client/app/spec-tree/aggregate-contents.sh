#!/bin/bash

# Output file
output_file="contents.txt"

# Clear or create the output file
> "$output_file"

# Function to process a file
process_file() {
    local file="$1"
    local relative_path="${file#./}"
    
    # Skip the output file itself
    if [ "$relative_path" = "$output_file" ]; then
        return
    fi
    
    # Skip hidden files and directories
    if [[ "$relative_path" == .* ]]; then
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
    
    # Process all files in the current directory
    for entry in "$dir"/*; do
        if [ -f "$entry" ]; then
            process_file "$entry"
        elif [ -d "$entry" ]; then
            # Recursively process subdirectories
            process_directory "$entry"
        fi
    done
}

# Start processing from the current directory
process_directory "."

echo "File processing complete. Results saved to $output_file"