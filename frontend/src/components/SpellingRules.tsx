import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { SpellingRuleDialog, SpellingRuleFormData } from './SpellingRuleDialog';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'sonner';
import { spellingRuleService } from '@/services';

interface SpellingRule {
  id: number;
  title: string;
  description: string;
  examples: string[];
  category: string;
  created_at: string;
  updated_at: string | null;
  related_words: Array<{
    id: number;
    word: string;
    meaning?: string;
  }>;
}

const SpellingRules: React.FC = () => {
  const [rules, setRules] = useState<SpellingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<SpellingRule | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await spellingRuleService.getSpellingRules();
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = () => {
    setSelectedRule(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEditRule = (rule: SpellingRule) => {
    setSelectedRule(rule);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDeleteRule = (rule: SpellingRule) => {
    setSelectedRule(rule);
    setDeleteModalOpen(true);
  };

  const handleSubmitRule = async (data: SpellingRuleFormData) => {
    try {
      if (dialogMode === 'create') {
        await spellingRuleService.createSpellingRule(data);
        toast.success('Spelling rule created successfully');
      } else if (selectedRule) {
        await spellingRuleService.updateSpellingRule(selectedRule.id, data);
        toast.success('Spelling rule updated successfully');
      }
      await fetchRules();
    } catch (err) {
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRule) return;
    
    try {
      await spellingRuleService.deleteSpellingRule(selectedRule.id);
      toast.success('Spelling rule deleted successfully');
      await fetchRules();
      setDeleteModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  };

  if (loading) return <div>Loading spelling rules...</div>;
  if (error) return <div>Error: {error}</div>;

  // Group rules by category
  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, SpellingRule[]>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>English Spelling Rules</CardTitle>
              <CardDescription>Learn and manage English spelling rules</CardDescription>
            </div>
            <Button onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {Object.entries(rulesByCategory).map(([category, categoryRules]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold mb-4 capitalize">
                  {category.split('_').join(' ')}
                  <Badge variant="secondary" className="ml-2">
                    {categoryRules.length}
                  </Badge>
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {categoryRules.map((rule) => (
                    <AccordionItem key={rule.id} value={rule.id.toString()}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span>{rule.title}</span>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRule(rule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRule(rule)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                          {rule.examples.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Examples:</h4>
                              <div className="flex flex-wrap gap-2">
                                {rule.examples.map((example, index) => (
                                  <Badge key={index} variant="outline">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {rule.related_words.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Related Words:</h4>
                              <div className="flex flex-wrap gap-2">
                                {rule.related_words.map((word) => (
                                  <Badge key={word.id} variant="secondary">
                                    {word.word}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <SpellingRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitRule}
        initialData={selectedRule ? {
          title: selectedRule.title,
          description: selectedRule.description,
          examples: selectedRule.examples,
          category: selectedRule.category,
        } : undefined}
        mode={dialogMode}
      />

      <ConfirmationModal
        show={deleteModalOpen}
        onHide={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Spelling Rule"
        message="Are you sure you want to delete this spelling rule? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default SpellingRules;