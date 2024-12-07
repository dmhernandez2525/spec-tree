import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import Section from '@/components/layout/Section';

const ProjectsPage = () => {
  const projects = [
    {
      title: 'Project Title 1',
      description: 'Project description goes here.',
    },
    {
      title: 'Project Title 2',
      description: 'Project description goes here.',
    },
    {
      title: 'Project Title 3',
      description: 'Project description goes here.',
    },
    // Add more projects as needed
  ];

  return (
    <Section className=" mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <Card key={index} className="bg-white shadow-lg rounded-lg">
            <CardHeader className="text-xl font-semibold mb-2">
              {project.title}
            </CardHeader>
            <CardContent className="text-gray-700 mb-4">
              {project.description}
            </CardContent>
            <CardFooter>
              <Button className="bg-blue-500 text-white px-4 py-2 rounded">
                View Project
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default ProjectsPage;
