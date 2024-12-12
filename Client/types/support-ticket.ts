export interface SupportTicket {
  id: string;
  title: string;
  ticketStatus: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  updatedAt: string;
  description: string;
}
