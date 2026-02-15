import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import {
  fetchTemplates,
  createTemplate,
  deleteTemplate,
} from '@/lib/store/workspace-slice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';

export function TemplateLibrary() {
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector(
    (state) => state.organization.currentOrganization?.id
  );
  const userId = useAppSelector(
    (state) => state.user.user?.documentId
  );
  const templates = useAppSelector((state) => state.workspace.templates);
  const userRole = useAppSelector(
    (state) => state.auth.organizationRole
  ) || 'viewer';

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const canManage = userRole === 'owner' || userRole === 'admin';

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchTemplates(organizationId));
    }
  }, [dispatch, organizationId]);

  const handleCreate = async () => {
    if (!organizationId || !userId || !name.trim()) return;
    await dispatch(
      createTemplate({
        organizationId,
        name: name.trim(),
        description: description.trim(),
        category: category.trim() || 'general',
        template: {},
        createdById: userId,
      })
    );
    setName('');
    setDescription('');
    setCategory('');
    setCreateOpen(false);
  };

  const handleDelete = async () => {
    if (!organizationId || !deleteId) return;
    await dispatch(deleteTemplate({ organizationId, templateId: deleteId }));
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Shared Templates</h3>
        {canManage && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Icons.plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Name</Label>
                  <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-desc">Description</Label>
                  <Textarea
                    id="template-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-category">Category</Label>
                  <Input
                    id="template-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="general"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="w-full"
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            No shared templates yet.
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[500px]">
          <div className="grid gap-3 pr-2 sm:grid-cols-2">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold">{tmpl.name}</p>
                  <Badge variant="secondary">{tmpl.category}</Badge>
                </div>
                {tmpl.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tmpl.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(tmpl.createdAt).toLocaleDateString()}
                  </span>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-destructive"
                      onClick={() => setDeleteId(tmpl.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this template from the workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
