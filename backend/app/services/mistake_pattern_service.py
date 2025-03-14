from typing import List, Dict
from difflib import SequenceMatcher
import re
from collections import defaultdict

class MistakePatternService:
    """Service for analyzing spelling mistake patterns"""

    def __init__(self):
        # Common phonetic patterns
        self.phonetic_patterns = {
            'ie/ei': (r'ie|ei', ['ie', 'ei']),
            'silent_e': (r'e$', ''),
            'double_consonants': (r'([a-z])\1', r'\1'),
            'ph/f': (r'ph|f', ['ph', 'f']),
            'ough': (r'ough', ['off', 'uf', 'ow', 'o']),
            'tion/sion': (r'tion|sion', ['tion', 'sion', 'shun', 'zhun']),
            'ck/k/c': (r'ck|k|c(?=[aou])', ['ck', 'k', 'c']),
            'gh': (r'gh(?:t)?', ['t', 'f', '']),
        }
        
        # Common vowel patterns
        self.vowel_patterns = {
            'schwa': ['a', 'e', 'i', 'o', 'u'],  # unstressed vowel sounds
            'long_a': ['a', 'ai', 'ay', 'a_e', 'ei', 'ey'],
            'long_e': ['e', 'ee', 'ea', 'ie', 'y', 'ey'],
            'long_i': ['i', 'i_e', 'y', 'ie', 'igh'],
            'long_o': ['o', 'o_e', 'oa', 'ow', 'oe'],
            'long_u': ['u', 'u_e', 'ue', 'ew'],
        }

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
        
        # Check for phonetic patterns first
        phonetic_pattern = self._check_phonetic_patterns(correct, user_attempt)
        if phonetic_pattern:
            return phonetic_pattern

        # Check for vowel pattern mistakes
        vowel_pattern = self._check_vowel_patterns(correct, user_attempt)
        if vowel_pattern:
            return vowel_pattern
            
        # Get sequence matcher operations for other patterns
        matcher = SequenceMatcher(None, correct, user_attempt)
        ops = matcher.get_opcodes()
        return self._identify_pattern(ops, correct, user_attempt)

    def _check_phonetic_patterns(self, correct: str, attempt: str) -> Dict:
        """Check for common phonetic-based spelling mistakes"""
        for name, (pattern, alternatives) in self.phonetic_patterns.items():
            if re.search(pattern, correct):
                # Find which alternative was used in the attempt
                correct_part = re.search(pattern, correct).group()
                for alt in alternatives:
                    # Replace the pattern with each alternative and check if it matches
                    test_word = re.sub(pattern, alt, correct)
                    if test_word == attempt:
                        return {
                            'pattern_type': 'phonetic',
                            'description': f'{name} confusion: {correct_part} → {alt}',
                            'examples': [attempt]
                        }
        return None

    def _check_vowel_patterns(self, correct: str, attempt: str) -> Dict:
        """Check for vowel-based spelling mistakes"""
        # Extract vowel sequences from both words
        correct_vowels = ''.join(c for c in correct if c in 'aeiou')
        attempt_vowels = ''.join(c for c in attempt if c in 'aeiou')
        
        if correct_vowels != attempt_vowels:
            # Check each vowel pattern group
            for pattern_name, variations in self.vowel_patterns.items():
                # Check if the correct word uses this pattern
                for var in variations:
                    var_pattern = var.replace('_', '[a-z]')
                    if re.search(var_pattern, correct):
                        # See if the attempt used a different variation
                        for alt_var in variations:
                            if alt_var != var:
                                alt_pattern = alt_var.replace('_', '[a-z]')
                                if re.search(alt_pattern, attempt):
                                    return {
                                        'pattern_type': 'vowel',
                                        'description': f'{pattern_name} sound confusion: {var} → {alt_var}',
                                        'examples': [attempt]
                                    }
            
            # If no specific vowel pattern found but vowels differ
            return {
                'pattern_type': 'vowel',
                'description': f'vowel sequence error: {correct_vowels} → {attempt_vowels}',
                'examples': [attempt]
            }
        
        return None

    def _identify_pattern(self, opcodes, correct: str, attempt: str) -> Dict:
        """Identify the specific mistake pattern from the sequence operations"""
        patterns = []
        
        # Track character positions for each operation
        positions = defaultdict(list)
        
        for tag, i1, i2, j1, j2 in opcodes:
            if tag == 'replace':
                old = correct[i1:i2]
                new = attempt[j1:j2]
                
                # Double letter errors
                if len(old) == 2 and old[0] == old[1] and len(new) == 1:
                    patterns.append({
                        'pattern_type': 'doubling',
                        'description': f'double letter {old} omitted',
                        'examples': [attempt]
                    })
                # Single to double letter
                elif len(old) == 1 and len(new) == 2 and new[0] == new[1]:
                    patterns.append({
                        'pattern_type': 'doubling',
                        'description': f'unnecessary letter doubling: {old} → {new}',
                        'examples': [attempt]
                    })
                # Common letter substitutions
                elif len(old) == 1 and len(new) == 1:
                    positions['replace'].append((i1, old, new))
                else:
                    patterns.append({
                        'pattern_type': 'substitution',
                        'description': f'incorrect letter sequence: {old} → {new}',
                        'examples': [attempt]
                    })
                    
            elif tag == 'delete':
                deleted = correct[i1:i2]
                positions['delete'].append((i1, deleted))
                
            elif tag == 'insert':
                inserted = attempt[j1:j2]
                positions['insert'].append((j1, inserted))

        # Analyze position-based patterns
        if positions['replace']:
            # Group adjacent replacements
            grouped = self._group_adjacent_operations(positions['replace'])
            for group in grouped:
                if len(group) > 1:
                    old = ''.join(op[1] for op in group)
                    new = ''.join(op[2] for op in group)
                    patterns.append({
                        'pattern_type': 'sequence',
                        'description': f'letter sequence error: {old} → {new}',
                        'examples': [attempt]
                    })
                else:
                    op = group[0]
                    patterns.append({
                        'pattern_type': 'substitution',
                        'description': f'letter substitution: {op[1]} → {op[2]}',
                        'examples': [attempt]
                    })

        # Check for letter transpositions
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

        # Return the most specific pattern found
        return sorted(patterns, key=lambda x: x['pattern_type'] != 'other')[0]

    def _group_adjacent_operations(self, operations):
        """Group adjacent operations together"""
        if not operations:
            return []
            
        groups = [[operations[0]]]
        for op in operations[1:]:
            if op[0] == groups[-1][-1][0] + 1:
                groups[-1].append(op)
            else:
                groups.append([op])
        return groups

# Create singleton instance
mistake_pattern_service = MistakePatternService()