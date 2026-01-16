import React, { useState } from 'react';
import { format } from 'date-fns';
import { Star, Users, Archive, ChevronRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AppExtended } from '@/types/app';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface AppCardProps {
  app: AppExtended;
  isSelected: boolean;
  viewMode: 'grid' | 'list';
  onSelect: (id: string | null) => void;
  onToggleFavorite: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onArchive: (id: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({
  app,
  isSelected,
  viewMode,
  onSelect,
  onToggleFavorite,
  onToggleExpand,
  onArchive,
}) => {
  // TODO:  Remove this logger.log
  logger.log('onToggleExpand', onToggleExpand);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-500';
    if (health >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <Card
      className={`
        ${viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row items-start'}
        ${isSelected ? 'ring-2 ring-primary' : ''}
        transition-all duration-200 hover:shadow-lg relative overflow-hidden
      `}
    >
      {app.isFavorite && (
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      )}

      <div className={viewMode === 'grid' ? 'flex-1' : 'flex-[0.3]'}>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                {app.applicationInformation}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${getStatusColor(
                    app.status
                  )}`}
                />
                <span className="text-sm text-gray-500 capitalize">
                  {app.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>
              Created {format(app.createdAt || new Date(), 'MMM d, yyyy')}
            </span>
            <span>•</span>
            <span>
              Modified {format(app?.modifiedAt || new Date(), 'MMM d, yyyy')}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start">
              <div
                className={cn(
                  'text-sm text-gray-600 transition-all duration-300',
                  !isDescriptionExpanded && 'line-clamp-2'
                )}
              >
                {app.globalInformation}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6 w-6 p-0 hover:bg-gray-100"
                onClick={toggleDescription}
              >
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isDescriptionExpanded && 'rotate-90'
                  )}
                />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {app?.tags?.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Health</span>
              <span
                className={`text-sm font-medium ${getHealthColor(
                  app?.metrics?.health
                )}`}
              >
                {app?.metrics?.health}%
              </span>
            </div>
            <Progress value={app?.metrics?.health} className="h-2" />
          </div>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <div className="flex -space-x-2">
              {app?.teamMembers?.slice(0, 3).map((member) => (
                <Tooltip key={member.id}>
                  <TooltipTrigger>
                    <Avatar className="h-6 w-6 border-2 border-white">
                      {member.avatar ? (
                        <AvatarImage
                          src={member.avatar.url}
                          alt={member.firstName}
                        />
                      ) : (
                        <AvatarFallback>
                          {member.firstName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{member.firstName}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {app?.teamMembers?.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarFallback>
                    +{app?.teamMembers?.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter
        className={`
          flex items-center justify-between space-x-2 bg-gray-50 border-t
          ${viewMode === 'grid' ? 'flex-row' : 'flex-col items-end flex-[0.1]'}
        `}
      >
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleFavorite(app.id)}
            className="text-yellow-500"
          >
            <Star className={`h-4 w-4 ${app.isFavorite && 'fill-current'}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onArchive(app.id)}
            className="text-gray-500"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant={isSelected ? 'default' : 'outline'}
          onClick={() => onSelect(app.documentId || null)}
          className="w-full"
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppCard;
