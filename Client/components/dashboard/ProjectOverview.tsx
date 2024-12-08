'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  dueDate: string;
  team: string[];
}

const projects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    status: 'active',
    progress: 68,
    dueDate: '2024-04-15',
    team: ['John D.', 'Sarah M.', 'Mike R.'],
  },
  {
    id: '2',
    name: 'Mobile App Development',
    status: 'active',
    progress: 32,
    dueDate: '2024-05-20',
    team: ['Alice K.', 'Bob L.'],
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    status: 'on-hold',
    progress: 45,
    dueDate: '2024-04-30',
    team: ['Emma S.', 'Chris P.'],
  },
];

const statusColors = {
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  'on-hold': 'bg-yellow-500',
};

export function ProjectOverview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Overview</CardTitle>
        <Button variant="outline" size="sm">
          <Link href="/user-dashboard/spec-tree"> Add Project</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Team</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project, index) => (
              <motion.tr
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[project.status]}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="w-[60px]" />
                    <span className="text-sm">{project.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(project.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {project.team.map((member, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium"
                        title={member}
                      >
                        {member.split(' ')[0][0]}
                        {member.split(' ')[1][0]}
                      </div>
                    ))}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
