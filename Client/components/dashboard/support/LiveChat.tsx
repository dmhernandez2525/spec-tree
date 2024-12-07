'use client';
import Chat from '@/components/chat/Chat';
import Section from '@/components/layout/Section';

const LiveChat: React.FC = () => {
  return (
    <Section className=" mx-auto p-6">
      <Chat />
    </Section>
  );
};

export default LiveChat;
