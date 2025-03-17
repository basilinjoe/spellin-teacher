from typing import List, Dict
import openai
from app.core.config import settings

class LLMService:
    """Service for LLM-based analysis and suggestions"""
    
    def __init__(self):
        openai.api_key = settings.openai_api_key
        
    async def analyze_mistake_patterns(self, patterns: List[Dict]) -> Dict:
        """
        Analyze mistake patterns using LLM and provide personalized improvement suggestions
        
        Args:
            patterns: List of mistake patterns with their frequencies and examples
            
        Returns:
            Dict containing analysis and suggestions
        """
        # Prepare the context for the LLM
        context = self._format_patterns_for_prompt(patterns)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a spelling expert helping students improve their spelling skills."},
                    {"role": "user", "content": f"""
                    Based on these spelling mistake patterns:
                    {context}
                    
                    Please provide:
                    1. A brief analysis of the underlying causes
                    2. 2-3 specific practice suggestions
                    3. A relevant spelling rule or mnemonic device if applicable
                    
                    Format the response as JSON with keys: 'analysis', 'suggestions', 'rule'
                    Keep each field concise (max 2-3 sentences).
                    """}
                ]
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error calling LLM API: {str(e)}")
            return {
                "analysis": "Unable to generate analysis at this time.",
                "suggestions": [],
                "rule": None
            }
    
    def _format_patterns_for_prompt(self, patterns: List[Dict]) -> str:
        """Format mistake patterns into a clear text representation for the prompt"""
        formatted = []
        for pattern in patterns:
            pattern_str = (
                f"Type: {pattern['pattern_type']}\n"
                f"Description: {pattern['description']}\n"
                f"Frequency: {pattern['frequency']}\n"
                f"Examples: {', '.join(pattern['examples'])}\n"
            )
            formatted.append(pattern_str)
        
        return "\n".join(formatted)

# Create singleton instance
llm_service = LLMService()