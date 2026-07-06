// Minimal markdown → React renderer for session notes.
// Supports: #/##/### headings, - lists, numbered lists, ``` code
// fences, | tables |, **bold**, *italic*, `inline code`.
// Deliberately dependency-free; swap for a full renderer if notes
// outgrow it.

import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Tokenize bold / italic / inline code
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-b${i}`} className="text-phosphor-300 term-glow">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={`${keyPrefix}-c${i}`}
          className="rounded bg-charcoal-800 px-1 py-0.5 text-cyan-term"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <em key={`${keyPrefix}-i${i}`} className="text-phosphor-muted">
          {token.slice(1, -1)}
        </em>
      );
    }
    last = match.index + token.length;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.split(/\r?\n/);
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    if (line.trim().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      out.push(
        <pre
          key={key++}
          className="my-3 overflow-x-auto rounded border border-phosphor-500/20 bg-charcoal-950 p-3 text-xs text-cyan-term"
        >
          {buf.join("\n")}
        </pre>
      );
      continue;
    }

    // Table
    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
        // Skip separator rows like | --- | --- |
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        <div key={key++} className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {head?.map((c, ci) => (
                  <th
                    key={ci}
                    className="border border-phosphor-500/25 bg-charcoal-800 px-2 py-1 text-left uppercase tracking-wider text-phosphor-300"
                  >
                    {renderInline(c, `t${key}-h${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri}>
                  {row.map((c, ci) => (
                    <td key={ci} className="border border-phosphor-500/15 px-2 py-1">
                      {renderInline(c, `t${key}-r${ri}c${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Lists
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items: string[] = [];
      const ordered = /^\s*\d+\./.test(line);
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
        i++;
      }
      const ListTag = ordered ? "ol" : "ul";
      out.push(
        <ListTag
          key={key++}
          className={`my-2 ml-5 space-y-1 text-sm ${ordered ? "list-decimal" : "list-['▸_']"}`}
        >
          {items.map((item, ii) => (
            <li key={ii} className="pl-1">
              {renderInline(item, `l${key}-${ii}`)}
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    // Headings
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2], `h${key}`);
      if (level === 1) {
        out.push(
          <h1 key={key++} className="term-glow mb-2 mt-1 text-lg font-bold uppercase tracking-widest text-phosphor-300">
            █ {content}
          </h1>
        );
      } else if (level === 2) {
        out.push(
          <h2 key={key++} className="mb-1 mt-4 border-b border-phosphor-500/20 pb-1 text-sm font-bold uppercase tracking-wider text-phosphor-300">
            ▓ {content}
          </h2>
        );
      } else {
        out.push(
          <h3 key={key++} className="mb-1 mt-3 text-sm font-bold text-phosphor-400">
            ▒ {content}
          </h3>
        );
      }
      i++;
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph
    out.push(
      <p key={key++} className="my-2 text-sm leading-relaxed">
        {renderInline(line, `p${key}`)}
      </p>
    );
    i++;
  }

  return out;
}
