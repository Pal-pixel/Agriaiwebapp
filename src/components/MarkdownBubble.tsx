import type { ReactNode } from 'react';

/**
 * Lightweight markdown renderer for chat bubbles. Supports headings,
 * bullet/numbered lists, horizontal rules, and inline **bold** / *italic* /
 * `code`. Ported from the original React Native renderer.
 */

function parseInlineMarkdown(text: string): ReactNode[] {
  const segments: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      segments.push(<strong key={`b${match.index}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      segments.push(<em key={`i${match.index}`}>{match[2]}</em>);
    } else if (match[3] !== undefined) {
      segments.push(<code key={`c${match.index}`} className="md-code">{match[3]}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }
  return segments.length > 0 ? segments : [text];
}

function renderLine(line: string, key: number): ReactNode {
  if (!line.trim()) return <div key={key} className="md-space" />;

  if (/^---+$/.test(line.trim())) return <hr key={key} className="md-hr" />;

  if (/^# /.test(line)) return <h3 key={key} className="md-h1">{line.slice(2).trim()}</h3>;
  if (/^## /.test(line)) return <h4 key={key} className="md-h2">{line.slice(3).trim()}</h4>;
  if (/^### /.test(line)) return <h5 key={key} className="md-h3">{line.slice(4).trim()}</h5>;

  const bulletMatch = line.match(/^[-*•]\s+(.+)/);
  if (bulletMatch) {
    return (
      <div key={key} className="md-li">
        <span className="md-bullet">•</span>
        <span>{parseInlineMarkdown(bulletMatch[1])}</span>
      </div>
    );
  }

  const numMatch = line.match(/^(\d+)\.\s+(.+)/);
  if (numMatch) {
    return (
      <div key={key} className="md-li">
        <span className="md-num">{numMatch[1]}.</span>
        <span>{parseInlineMarkdown(numMatch[2])}</span>
      </div>
    );
  }

  return <p key={key} className="md-p">{parseInlineMarkdown(line)}</p>;
}

export default function MarkdownBubble({ text }: { text: string }) {
  return <div className="md">{text.split('\n').map((line, i) => renderLine(line, i))}</div>;
}
