import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface SpellingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SpellingRuleFormData) => Promise<void>;
  initialData?: SpellingRuleFormData;
  mode: 'create' | 'edit';
}

export interface SpellingRuleFormData {
  title: string;
  description: string;
  examples: string[];
  category: string;
}

const CATEGORIES = [
  'vowel_patterns',
  'consonants',
  'silent_letters',
  'suffixes',
  'prefixes',
  'plurals',
  'homophones',
  'compound_words'
];

export const SpellingRuleDialog: React.FC<SpellingRuleDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}) => {
  const [formData, setFormData] = useState<SpellingRuleFormData>({
    title: '',
    description: '',
    examples: [],
    category: 'vowel_patterns'
  });
  const [examplesInput, setExamplesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setExamplesInput(initialData.examples.join(', '));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        examples: examplesInput.split(',').map(ex => ex.trim()).filter(Boolean)
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Spelling Rule' : 'Edit Spelling Rule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter rule title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Explain the spelling rule"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examples">Examples (comma-separated)</Label>
            <Input
              id="examples"
              value={examplesInput}
              onChange={(e) => setExamplesInput(e.target.value)}
              placeholder="e.g., receive, believe, achieve"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? 'Saving...' 
                : mode === 'create' ? 'Create Rule' : 'Update Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};