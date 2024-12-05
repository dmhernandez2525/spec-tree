import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface AcceptanceCriteriaListProps {
  acceptanceCriteria: Array<{ text: string }>;
  add: () => void;
  remove: (index: number) => void;
  update: (index: number, value: string) => void;
}

const AcceptanceCriteriaList: React.FC<AcceptanceCriteriaListProps> = ({
  acceptanceCriteria,
  add,
  remove,
  update,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Acceptance Criteria</Label>
        <Button
          onClick={add}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Criteria
        </Button>
      </div>

      <div className="space-y-4">
        {acceptanceCriteria?.map((criteria, index) => (
          <Card key={`${index}-${criteria.text}`}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Textarea
                    value={criteria.text}
                    onChange={(e) => update(index, e.target.value)}
                    placeholder="Enter acceptance criteria..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="h-10 w-10 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AcceptanceCriteriaList;
