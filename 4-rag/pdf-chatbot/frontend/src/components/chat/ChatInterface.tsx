import React, { useState, useRef, useEffect } from 'react';
import {
  Loader2,
  ExternalLink,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { EmptyChatState } from './EmptyChatState';
import { ChatInput } from './ChatInput';
import { PdfViewerModal } from '../documents/PdfViewerModal';
import { api } from '../../services/api';
import type {
  ActiveTab,
  ChatMessage,
  DocumentMetadata,
  SourceCitationData,
} from '../../types';

interface ChatInterfaceProps {
  activeDocument: DocumentMetadata | null;
  onSelectDocument: (doc: DocumentMetadata | null) => void;
  onNavigate: (tab: ActiveTab) => void;
  documents: DocumentMetadata[];
  backendOnline: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeDocument,
  onSelectDocument,
  onNavigate,
  documents,
  backendOnline,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topK, setTopK] = useState(5);

  // PDF inspection modal state from citations
  const [inspectDoc, setInspectDoc] = useState<DocumentMetadata | null>(null);
  const [inspectPage, setInspectPage] = useState<number | string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.chat({
        question,
        document_id: activeDocument?.document_id || null,
        top_k: topK,
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        retrieved_chunks: response.retrieved_chunks,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Error: ${(err as Error)?.message || 'Failed to retrieve answer from backend.'}`,
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleInspectSource = (source: SourceCitationData) => {
    // Find matching document in library by filename or active doc
    const matchedDoc = documents.find((d) => d.filename === source.filename) || activeDocument;
    if (matchedDoc) {
      setInspectDoc(matchedDoc);
      setInspectPage(source.page_number);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6.5rem)] md:h-[calc(100vh-6rem)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="h-16 px-4 md:px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {activeDocument ? activeDocument.filename : 'All Indexed Documents'}
              </h2>
              {activeDocument && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  {activeDocument.total_pages} pages
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>RAG Verified Grounding</span>
              </span>
              <span>•</span>
              <span>{messages.length} messages</span>
            </div>
          </div>
        </div>

        {/* Document Context Selector Dropdown */}
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <select
              value={activeDocument?.document_id || ''}
              onChange={(e) => {
                const docId = e.target.value;
                const doc = documents.find((d) => d.document_id === docId) || null;
                onSelectDocument(doc);
              }}
              className="hidden sm:block text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-500 cursor-pointer max-w-[200px] truncate"
            >
              <option value="">All Documents (Global)</option>
              {documents.map((doc) => (
                <option key={doc.document_id} value={doc.document_id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          )}

          {activeDocument && (
            <button
              onClick={() => {
                setInspectDoc(activeDocument);
                setInspectPage(1);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Inspect Original PDF"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50/40">
        {messages.length === 0 ? (
          <EmptyChatState
            activeDocument={activeDocument}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            onOpenUpload={() => onNavigate('upload')}
          />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={handleRetryLast}
              onInspectSource={handleInspectSource}
            />
          ))
        )}

        {/* Loading Indicator Bubble */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-brand-500 border border-brand-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span>Searching vector space & generating grounded response...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={() => handleSendMessage()}
        isLoading={isLoading}
        onClear={() => setMessages([])}
        hasMessages={messages.length > 0}
        topK={topK}
        setTopK={setTopK}
        disabled={!backendOnline}
      />

      {/* PDF Inspection Modal from citations */}
      <PdfViewerModal
        document={inspectDoc}
        isOpen={!!inspectDoc}
        onClose={() => {
          setInspectDoc(null);
          setInspectPage(null);
        }}
        targetPage={inspectPage}
      />
    </div>
  );
};
