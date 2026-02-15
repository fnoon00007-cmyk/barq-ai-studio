import { useState } from "react";

interface ExpandableMessageProps {
  content: string;
  maxLength?: number;
}

export function ExpandableMessage({ content, maxLength = 300 }: ExpandableMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > maxLength;

  if (!isLong) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return (
    <span className="whitespace-pre-wrap">
      {expanded ? content : content.slice(0, maxLength) + "..."}
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-block mr-1 text-primary hover:underline font-bold text-xs"
      >
        {expanded ? "اقرأ أقل ↑" : "اقرأ المزيد ↓"}
      </button>
    </span>
  );
}
