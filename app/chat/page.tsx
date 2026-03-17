"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";

interface Agent {
  id: string;
  name: string;
  description: string;
  type: "system" | "marketing" | "design";
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentsCache, setAgentsCache] = useState<Agent[]>([]);

  // Fetch agents once and cache
  const getAgent = useCallback(
    async (id: string): Promise<Agent | null> => {
      let agents = agentsCache;
      if (agents.length === 0) {
        const res = await fetch("/api/agents");
        agents = await res.json();
        setAgentsCache(agents);
      }
      return agents.find((a) => a.id === id) || null;
    },
    [agentsCache]
  );

  async function handleSelectAgent(id: string) {
    const agent = await getAgent(id);
    if (agent) {
      setSelectedAgent(agent);
      setConversationId(null);
      setMessages([]);
    }
  }

  async function handleSelectConversation(id: string, agentId: string) {
    const agent = await getAgent(agentId);
    if (agent) {
      setSelectedAgent(agent);
      setConversationId(id);
      // Load conversation messages
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      setMessages(
        data.messages?.map((m: Message) => ({
          role: m.role,
          content: m.content,
        })) || []
      );
    }
  }

  function handleNewChat() {
    setConversationId(null);
    setMessages([]);
    if (selectedAgent) {
      // Keep selected agent, just clear chat
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        selectedAgent={selectedAgent?.id || null}
        onSelectAgent={handleSelectAgent}
        conversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {selectedAgent ? (
        <ChatInterface
          key={`${selectedAgent.id}-${conversationId}`}
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          agentDescription={selectedAgent.description}
          agentType={selectedAgent.type}
          conversationId={conversationId}
          onConversationCreated={setConversationId}
          messages={messages}
          setMessages={setMessages}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-dark-950">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 animate-glow-pulse"
              style={{
                background: "rgba(254, 49, 132, 0.08)",
                border: "1px solid rgba(254, 49, 132, 0.12)",
                boxShadow: "0 0 60px rgba(254, 49, 132, 0.15)",
              }}
            >
              &#x2728;
            </div>
            <h2 className="font-display text-2xl uppercase text-gradient mb-3">
              SELECT AN AGENT
            </h2>
            <p className="text-sm text-white/40 max-w-sm">
              Choose a marketing or design agent from the sidebar to start a conversation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
