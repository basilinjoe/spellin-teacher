from typing import List, Dict
from difflib import SequenceMatcher

class MistakePatternService:
    """Service for analyzing spelling mistake patterns"""

    def analyze_mistake(self, correct_word: str, attempt: str) -> Dict:
        """
        Analyze the spelling mistake and identify the pattern
        
        Args:
            correct_word: The correct spelling
            attempt: The user's attempted spelling
            
        Returns:
            dict: Dictionary containing pattern type and description
        """
        correct = correct_word.lower()
        user_attempt = attempt.lower()
        
        # Get sequence matcher operations
        matcher = SequenceMatcher(None, correct, user_attempt)
        ops = matcher.get_opcodes()

        # Analyze the operations to determine pattern
        pattern = self._identify_pattern(ops, correct, user_attempt)
        return pattern

    def _identify_pattern(self, opcodes, correct: str, attempt: str) -> Dict:
        """Identify the specific mistake pattern from the sequence operations"""
        patterns = []
        
        for tag, i1, i2, j1, j2 in opcodes:
            if tag == 'replace':
                # Analyze replacements
                old = correct[i1:i2]
                new = attempt[j1:j2]
                
                # Common substitution patterns
                if 'ie' in old and 'ei' in new or 'ei' in old and 'ie' in new:
                    patterns.append({
                        'pattern_type': 'substitution',
                        'description': 'ie/ei confusion',
                        'examples': [attempt]
                    })
                # Double letter handling
                elif len(old) == 2 and old[0] == old[1] and len(new) == 1:
                    patterns.append({
                        'pattern_type': 'omission',
                        'description': f'double letter {old} omitted',
                        'examples': [attempt]
                    })
                # Vowel confusion
                elif len(old) == 1 and len(new) == 1 and old in 'aeiou' and new in 'aeiou':
                    patterns.append({
                        'pattern_type': 'substitution',
                        'description': f'vowel confusion ({old} → {new})',
                        'examples': [attempt]
                    })
                else:
                    patterns.append({
                        'pattern_type': 'substitution',
                        'description': f'incorrect letter(s): {old} → {new}',
                        'examples': [attempt]
                    })
                    
            elif tag == 'delete':
                # Letter was deleted from correct word
                deleted = correct[i1:i2]
                patterns.append({
                    'pattern_type': 'deletion',
                    'description': f'missing letter(s): {deleted}',
                    'examples': [attempt]
                })
                
            elif tag == 'insert':
                # Extra letter was inserted
                inserted = attempt[j1:j2]
                patterns.append({
                    'pattern_type': 'insertion',
                    'description': f'extra letter(s): {inserted}',
                    'examples': [attempt]
                })

        # Check for transposition (adjacent letter swap)
        if len(patterns) == 0 and len(correct) == len(attempt):
            transpositions = []
            for i in range(len(correct)-1):
                if correct[i:i+2] == attempt[i+1] + attempt[i]:
                    transpositions.append(correct[i:i+2])
            if transpositions:
                patterns.append({
                    'pattern_type': 'transposition',
                    'description': f'letter swap: {", ".join(transpositions)}',
                    'examples': [attempt]
                })

        # If no specific pattern found, mark as general error
        if not patterns:
            patterns.append({
                'pattern_type': 'other',
                'description': 'general spelling error',
                'examples': [attempt]
            })

        # Return the first identified pattern
        return patterns[0]

# Create singleton instance
mistake_pattern_service = MistakePatternService()