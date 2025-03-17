import nltk
from nltk.corpus import wordnet
import asyncio
from typing import Tuple, Optional, List
import requests


class DictionaryService:
    """Service for fetching word definitions and examples using NLTK/WordNet"""
    
    def __init__(self):
        """Initialize the dictionary service and download required NLTK data"""
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')
    
    async def get_word_details(self, word: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Get the meaning, example, and phonetic representation for a word
        
        Args:
            word (str): The word to look up
            
        Returns:
            tuple: (meaning, example, phonetic) where all are optional strings
        """
        # Run WordNet lookup in a thread pool since it's blocking
        loop = asyncio.get_event_loop()
        meaning, example = await loop.run_in_executor(None, self._get_word_details_sync, word)
        phonetic = await loop.run_in_executor(None, self._get_phonetic_sync, word)
        return meaning, example, phonetic

    def _get_word_details_sync(self, word: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Synchronous implementation of word details lookup
        """
        synsets = wordnet.synsets(word)
        
        if not synsets:
            return None, None
        
        # Get the most common synset
        synset = synsets[0]
        
        # Get the definition
        meaning = synset.definition()
        
        # Get an example if available
        examples = synset.examples()
        example = ', '.join(examples) if examples else None
        
        return meaning, example

    def _get_phonetic_sync(self, word: str) -> Optional[str]:
        """
        Get the IPA (International Phonetic Alphabet) representation of a word
        using the FreeDictionary API
        """
        try:
            # FreeDictionary API endpoint
            url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if data and isinstance(data, list) and len(data) > 0:
                    # Get phonetics from the first result
                    for phonetic_data in data[0].get('phonetics', []):
                        if 'text' in phonetic_data:
                            return phonetic_data['text']
            return None
        except Exception as e:
            print(f"Error getting phonetic representation: {e}")
            return None

    async def get_similar_words(self, word: str, max_words: int = 10) -> List[str]:
        """
        Get a list of similar words using WordNet synonyms, hypernyms, and hyponyms
        
        Args:
            word (str): The word to find similar words for
            max_words (int): Maximum number of similar words to return
            
        Returns:
            list: List of similar words
        """
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, self._get_similar_words_sync, word, max_words)
        return result
    
    def _get_similar_words_sync(self, word: str, max_words: int = 10) -> List[str]:
        """
        Synchronous implementation of similar words lookup
        """
        similar_words = set()
        
        # Get all synsets for the word
        synsets = wordnet.synsets(word)
        
        for synset in synsets:
            # Add lemma names (synonyms)
            for lemma in synset.lemmas():
                if lemma.name() != word:
                    similar_words.add(lemma.name().replace('_', ' '))
            
            # Add hypernyms (more general words)
            for hypernym in synset.hypernyms():
                for lemma in hypernym.lemmas():
                    similar_words.add(lemma.name().replace('_', ' '))
            
            # Add hyponyms (more specific words)
            for hyponym in synset.hyponyms():
                for lemma in hyponym.lemmas():
                    similar_words.add(lemma.name().replace('_', ' '))
            
            if len(similar_words) >= max_words:
                break
        
        return list(similar_words)[:max_words]


# Create singleton instance
dictionary_service = DictionaryService()