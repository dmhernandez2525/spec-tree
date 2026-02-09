'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupportTickets } from '@/components/dashboard/support/SupportTickets';
import { Documentation } from '@/components/dashboard/support/Documentation';
import { SupportFAQ } from '@/components/dashboard/support/SupportFAQ';
import LiveChat from '@/components/dashboard/support/LiveChat';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('tickets');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8 p-4 md:p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Support</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="tickets" className="flex-1 text-xs sm:text-sm">Tickets</TabsTrigger>
          <TabsTrigger value="docs" className="flex-1 text-xs sm:text-sm">Docs</TabsTrigger>
          <TabsTrigger value="faq" className="flex-1 text-xs sm:text-sm">FAQ</TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 text-xs sm:text-sm">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <motion.div variants={itemVariants}>
            <SupportTickets />
          </motion.div>
        </TabsContent>

        <TabsContent value="docs">
          <motion.div variants={itemVariants}>
            <Documentation />
          </motion.div>
        </TabsContent>

        <TabsContent value="faq">
          <motion.div variants={itemVariants}>
            <SupportFAQ />
          </motion.div>
        </TabsContent>

        <TabsContent value="chat">
          <motion.div variants={itemVariants}>
            <LiveChat />
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
