import React from 'react';

// Simple markdown renderer component
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const renderMarkdown = (text) => {
    // Split text into lines for processing
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let listType = null;

    const flushList = () => {
      if (currentList.length > 0) {
        const ListTag = listType === 'ordered' ? 'ol' : 'ul';
        elements.push(
          <ListTag key={elements.length} className="list-disc list-inside mb-4 space-y-2 ml-4">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-gray-300 leading-relaxed">
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Headers
      if (trimmedLine.startsWith('###')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-blue-300 mb-3 mt-6 first:mt-0">
            {trimmedLine.replace(/^###\s*/, '')}
          </h3>
        );
      } else if (trimmedLine.startsWith('##')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-bold text-blue-300 mb-4 mt-6 first:mt-0">
            {trimmedLine.replace(/^##\s*/, '')}
          </h2>
        );
      } else if (trimmedLine.startsWith('#')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-blue-300 mb-4 mt-6 first:mt-0">
            {trimmedLine.replace(/^#\s*/, '')}
          </h1>
        );
      }
      // Bullet lists (-, *, •)
      else if (/^[-*•]\s/.test(trimmedLine)) {
        if (listType !== 'unordered') {
          flushList();
          listType = 'unordered';
        }
        currentList.push(trimmedLine.replace(/^[-*•]\s*/, ''));
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (listType !== 'ordered') {
          flushList();
          listType = 'ordered';
        }
        currentList.push(trimmedLine.replace(/^\d+\.\s*/, ''));
      }
      // Special sections (CHANCE:, FEEDBACK:, etc.)
      else if (/^[A-Z][A-Z\s]*:\s*.+/.test(trimmedLine)) {
        flushList();
        const [label, ...contentParts] = trimmedLine.split(':');
        const content = contentParts.join(':').trim();
        elements.push(
          <div key={index} className="mb-4">
            <span className="font-semibold text-green-400">{label}:</span>
            <span className="ml-2 text-gray-300">{renderInlineMarkdown(content)}</span>
          </div>
        );
      }
      // Regular paragraphs
      else {
        flushList();
        elements.push(
          <p key={index} className="text-gray-300 leading-relaxed mb-4">
            {renderInlineMarkdown(trimmedLine)}
          </p>
        );
      }
    });

    flushList(); // Flush any remaining list items
    return elements;
  };

  const renderInlineMarkdown = (text) => {
    // Bold text (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong class="font-semibold text-white">$1</strong>');
    
    // Italic text (*text* or _text_)
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-blue-200">$1</em>');
    text = text.replace(/_(.*?)_/g, '<em class="italic text-blue-200">$1</em>');
    
    // Code text (`text`)
    text = text.replace(/`(.*?)`/g, '<code class="bg-slate-700 text-green-300 px-1 py-0.5 rounded text-sm">$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="prose prose-invert max-w-none">
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;