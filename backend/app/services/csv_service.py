import pandas as pd
import os
from typing import List, Dict, Any
import uuid
import tempfile
from fastapi import UploadFile, HTTPException
from io import StringIO
import csv

from app.services.dictionary_service import dictionary_service


class CSVService:
    """Service for handling CSV file uploads and processing"""
    
    def __init__(self, upload_dir="static/uploads"):
        """Initialize the CSV service with the directory to store uploaded files"""
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)
    
    REQUIRED_COLUMNS = ['word']
    OPTIONAL_COLUMNS = ['meaning', 'example']
    MAX_WORDS = 4000  # Maximum number of words per list
    
    async def process_csv_file(self, file: UploadFile) -> Dict[str, List[Dict[str, str]]]:
        """
        Process an uploaded CSV file containing words
        
        Args:
            file: The uploaded CSV file object
            
        Returns:
            dict: Dictionary containing the processed words and their details
            
        Raises:
            HTTPException: If the file is invalid or improperly formatted
        """
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="File must be a CSV file"
            )
        
        try:
            # Read the file content
            content = await file.read()
            text = content.decode('utf-8-sig')  # Handle BOM if present
            
            # Parse CSV
            reader = csv.DictReader(StringIO(text))
            
            # Validate headers
            headers = reader.fieldnames if reader.fieldnames else []
            if not headers or 'word' not in headers:
                raise HTTPException(
                    status_code=400,
                    detail="CSV must have a 'word' column"
                )
            
            # Process rows
            words = []
            word_count = 0
            
            for row in reader:
                if word_count >= self.MAX_WORDS:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Maximum of {self.MAX_WORDS} words allowed per list"
                    )
                
                # Clean and validate word
                word = row.get('word', '').strip()
                if not word:
                    continue
                
                # Create word entry
                word_entry = {
                    'word': word,
                    'meaning': row.get('meaning', '').strip(),
                    'example': row.get('example', '').strip()
                }
                
                words.append(word_entry)
                word_count += 1
            
            if not words:
                raise HTTPException(
                    status_code=400,
                    detail="No valid words found in CSV file"
                )
            
            return {'words': words}
            
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="File must be encoded in UTF-8"
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing CSV file: {str(e)}"
            )
            
    def cleanup_old_files(self, max_age_hours=24):
        """Delete uploaded files older than the specified age"""
        # Implementation would remove files older than max_age_hours
        pass


# Create singleton instance
csv_service = CSVService()