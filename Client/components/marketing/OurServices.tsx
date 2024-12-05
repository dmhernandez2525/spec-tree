// components/marketing/OurServices.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ColorHeader } from '@/components/shared/ColorHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

interface ServiceListItem {
  id: number;
  listEntry: string;
}

interface ServiceData {
  Service: string;
  ServiceDescription: string;
  serviceList: ServiceListItem[];
  ServiceTitle: string;
  ListTitle: string;
}

interface OurServicesProps {
  serviceData: ServiceData[];
  serviceHeader: {
    Header: string;
    HeaderColor: string;
  };
}

export function OurServices({ serviceData, serviceHeader }: OurServicesProps) {
  const [activeService, setActiveService] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <div className="p-4 sm:p-8">
        <ColorHeader
          header={serviceHeader.Header}
          headerColor={serviceHeader.HeaderColor}
          textColor="#717d96"
          style={{ marginBottom: '2rem' }}
        />
        <Accordion type="single" collapsible>
          {serviceData.map((service, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{service.Service}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-4">
                  <p className="text-muted-foreground">
                    {service.ServiceDescription}
                  </p>
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{service.ListTitle}</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {service.serviceList.map((item) => (
                        <li key={item.id}>{item.listEntry}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-16">
      <ColorHeader
        header={serviceHeader.Header}
        headerColor={serviceHeader.HeaderColor}
        textColor="#717d96"
        style={{ marginBottom: '2rem' }}
      />
      <Tabs
        defaultValue="0"
        onValueChange={(value) => setActiveService(parseInt(value))}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full">
          {serviceData.map((service, index) => (
            <TabsTrigger
              key={index}
              value={index.toString()}
              className="text-lg py-6"
            >
              {service.Service}
            </TabsTrigger>
          ))}
        </TabsList>
        {serviceData.map((service, index) => (
          <TabsContent key={index} value={index.toString()}>
            <Card>
              <CardContent className="grid md:grid-cols-3 gap-8 p-6">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold mb-4">
                    {service.ServiceTitle}
                  </h3>
                  <p className="text-muted-foreground">
                    {service.ServiceDescription}
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-6">
                  <h4 className="font-semibold mb-4">{service.ListTitle}</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {service.serviceList.map((item) => (
                      <li key={item.id}>{item.listEntry}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
