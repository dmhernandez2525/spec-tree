import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { setQuota } from '@/lib/store/workspace-slice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function QuotaDisplay() {
  const dispatch = useAppDispatch();
  const currentOrganization = useAppSelector(
    (state) => state.organization.currentOrganization
  );
  const quota = useAppSelector((state) => state.workspace.quota);

  useEffect(() => {
    if (currentOrganization) {
      dispatch(
        setQuota({
          monthlyLimit: currentOrganization.aiGenerationQuota || 500,
          currentUsage: currentOrganization.aiGenerationUsage || 0,
        })
      );
    }
  }, [dispatch, currentOrganization]);

  if (!quota) {
    return null;
  }

  const percentage =
    quota.monthlyLimit > 0
      ? Math.min(100, Math.round((quota.currentUsage / quota.monthlyLimit) * 100))
      : 0;

  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Generation Quota</CardTitle>
          {isAtLimit && <Badge variant="destructive">Limit reached</Badge>}
          {isNearLimit && !isAtLimit && (
            <Badge variant="secondary">Near limit</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {quota.currentUsage} / {quota.monthlyLimit} generations used
            </span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>
        <p className="text-xs text-muted-foreground">
          Usage resets at the beginning of each billing cycle. Contact your
          admin to increase the quota.
        </p>
      </CardContent>
    </Card>
  );
}
