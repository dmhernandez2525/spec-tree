'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  project: string;
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Update user interface design',
    priority: 'high',
    completed: false,
    project: 'Website Redesign',
  },
  {
    id: '2',
    title: 'Implement authentication system',
    priority: 'high',
    completed: false,
    project: 'Mobile App Development',
  },
  {
    id: '3',
    title: 'Create social media content',
    priority: 'medium',
    completed: true,
    project: 'Marketing Campaign',
  },
  {
    id: '4',
    title: 'Review pull requests',
    priority: 'low',
    completed: false,
    project: 'Website Redesign',
  },
  {
    id: '5',
    title: 'Write API documentation',
    priority: 'medium',
    completed: false,
    project: 'Mobile App Development',
  },
];

const priorityColors = {
  high: 'text-red-500 border-red-500',
  medium: 'text-yellow-500 border-yellow-500',
  low: 'text-blue-500 border-blue-500',
};

export function TaskSummary() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            {tasks.filter((t) => !t.completed).length} remaining
          </CardDescription>
        </div>
        <Select
          defaultValue="all"
          onValueChange={(value) => setFilter(value as typeof filter)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div>
                    <p
                      className={`font-medium ${
                        task.completed
                          ? 'line-through text-muted-foreground'
                          : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {task.project}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={priorityColors[task.priority]}
                >
                  {task.priority}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
