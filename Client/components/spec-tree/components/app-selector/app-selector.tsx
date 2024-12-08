import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { setSow } from '../../../../lib/store/sow-slice';
import { App } from '../../lib/types/work-items';
import Section from '@/components/layout/Section';

interface AppSelectorProps {
  apps: App[];
  setSelectedApp: (id: string | null) => void;
  selectedApp: string | null;
  onAppCreated: () => Promise<void>;
}

const AppSelector: React.FC<AppSelectorProps> = ({
  apps,
  setSelectedApp,
  selectedApp,
}) => {
  const dispatch = useDispatch();

  const handleSelectApp = (id: string | null) => {
    setSelectedApp(id);
    dispatch(setSow({ id }));
  };

  return (
    <Section className="w-full p-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {apps.map((app) => {
          const isSelected = selectedApp === app.documentId;
          return (
            <Card
              key={app.id}
              className={`border border-gray-200 rounded-md shadow-sm transition-transform duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectApp(app.documentId || null)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {app.applactionInformation}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {app.globalInformation}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4">
                <Button
                  variant={isSelected ? 'secondary' : 'outline'}
                  className={`w-full ${
                    isSelected
                      ? 'border-transparent bg-primary text-white hover:bg-primary/90'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors rounded-md`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </Section>
  );
};

export default AppSelector;
