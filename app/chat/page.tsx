"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const agentFromQuery = params.get("agent");

    if (agentFromQuery) {
      void handleSelectAgent(agentFromQuery);
    }
  }, [getAgent]);

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
          <div className="max-w-3xl px-8">
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
              Pick The Right Agent
            </h2>
            <p className="text-sm text-white/40 max-w-xl mx-auto leading-relaxed">
              Choose a specialist from the sidebar, or start with the orchestrator if you want the portal to route the work for you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
              {[
                {
                  title: "Need direction",
                  body: "Use the orchestrator when you are not sure which agent or workflow is right.",
                  href: "/chat?agent=orchestrator",
                },
                {
                  title: "Need copy fast",
                  body: "Go straight to Direct Response Copy for pages, sponsor pitches, and emails.",
                  href: "/chat?agent=direct-response-copy",
                },
                {
                  title: "Need a finished file",
                  body: "Generate the output in chat, then save it to Resources and export MD, DOC, or PDF.",
                  href: "/resources",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left hover:border-brand-pink/30 transition-colors"
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-2">
                    {item.title}
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
