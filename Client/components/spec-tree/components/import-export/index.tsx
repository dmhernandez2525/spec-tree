'use client';

import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import {
  exportToJSON,
  exportToCSV,
  exportToMarkdown,
  downloadFile,
  parseJSONImport,
  parseCSVImport,
} from '../../lib/utils/import-export';
import { addEpics, addFeatures, addUserStories, addTasks } from '@/lib/store/sow-slice';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Upload, FileJson, FileSpreadsheet, FileText } from 'lucide-react';

interface ImportExportProps {
  appId: string | null;
}

export default function ImportExport({ appId }: ImportExportProps) {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportDialog, setShowImportDialog] = React.useState(false);
  const [importPreview, setImportPreview] = React.useState<{
    epics: number;
    features: number;
    userStories: number;
    tasks: number;
    data: ReturnType<typeof parseJSONImport> | ReturnType<typeof parseCSVImport>;
    type: 'json' | 'csv';
  } | null>(null);

  const handleExportJSON = () => {
    try {
      const json = exportToJSON(state);
      const filename = `spec-tree-${appId || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(json, filename, 'application/json');
      toast.success('Exported to JSON successfully');
    } catch (error) {
      toast.error('Failed to export to JSON');
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    try {
      const csv = exportToCSV(state);
      const filename = `spec-tree-${appId || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename, 'text/csv');
      toast.success('Exported to CSV successfully');
    } catch (error) {
      toast.error('Failed to export to CSV');
      console.error(error);
    }
  };

  const handleExportMarkdown = () => {
    try {
      const md = exportToMarkdown(state);
      const filename = `spec-tree-${appId || 'export'}-${new Date().toISOString().split('T')[0]}.md`;
      downloadFile(md, filename, 'text/markdown');
      toast.success('Exported to Markdown successfully');
    } catch (error) {
      toast.error('Failed to export to Markdown');
      console.error(error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const isJson = file.name.endsWith('.json');

      if (isJson) {
        const data = parseJSONImport(content);
        if (data) {
          setImportPreview({
            epics: data.epics.length,
            features: data.features.length,
            userStories: data.userStories.length,
            tasks: data.tasks.length,
            data,
            type: 'json',
          });
          setShowImportDialog(true);
        } else {
          toast.error('Invalid JSON file format');
        }
      } else {
        const data = parseCSVImport(content);
        if (data) {
          setImportPreview({
            epics: data.epics.length,
            features: data.features.length,
            userStories: data.userStories.length,
            tasks: data.tasks.length,
            data,
            type: 'csv',
          });
          setShowImportDialog(true);
        } else {
          toast.error('Invalid CSV file format');
        }
      }
    } catch (error) {
      toast.error('Failed to read file');
      console.error(error);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importPreview || !importPreview.data) return;

    try {
      if (importPreview.type === 'json') {
        const data = importPreview.data as NonNullable<ReturnType<typeof parseJSONImport>>;

        // Import epics
        data.epics.forEach((epic) => {
          dispatch(addEpics({ ...epic, parentAppId: appId }));
        });

        // Import features
        data.features.forEach((feature) => {
          dispatch(addFeatures(feature));
        });

        // Import user stories
        data.userStories.forEach((story) => {
          dispatch(addUserStories(story));
        });

        // Import tasks
        data.tasks.forEach((task) => {
          dispatch(addTasks(task));
        });
      } else {
        const data = importPreview.data as NonNullable<ReturnType<typeof parseCSVImport>>;

        // Import epics
        data.epics.forEach((epic) => {
          dispatch(addEpics({ ...epic, parentAppId: appId } as Parameters<typeof addEpics>[0]));
        });

        // Import features
        data.features.forEach((feature) => {
          dispatch(addFeatures(feature as Parameters<typeof addFeatures>[0]));
        });

        // Import user stories
        data.userStories.forEach((story) => {
          dispatch(addUserStories(story as Parameters<typeof addUserStories>[0]));
        });

        // Import tasks
        data.tasks.forEach((task) => {
          dispatch(addTasks(task as Parameters<typeof addTasks>[0]));
        });
      }

      toast.success('Import completed successfully');
      setShowImportDialog(false);
      setImportPreview(null);
    } catch (error) {
      toast.error('Failed to import data');
      console.error(error);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleExportJSON}>
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportMarkdown}>
            <FileText className="h-4 w-4 mr-2" />
            Export as Markdown
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Import</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleImportClick}>
            <Upload className="h-4 w-4 mr-2" />
            Import from File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Import</DialogTitle>
            <DialogDescription>
              You are about to import the following items:
            </DialogDescription>
          </DialogHeader>

          {importPreview && (
            <div className="space-y-2 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="font-medium">Epics:</span> {importPreview.epics}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Features:</span> {importPreview.features}
                </div>
                <div className="text-sm">
                  <span className="font-medium">User Stories:</span> {importPreview.userStories}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Tasks:</span> {importPreview.tasks}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This will add these items to your current project. Existing items will not be affected.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmImport}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
