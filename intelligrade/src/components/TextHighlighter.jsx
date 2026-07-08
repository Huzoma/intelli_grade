"use client";

export default function TextHighlighter({ paragraphText, paraIndex, highlights, onHighlightClick }) {
  if (!paragraphText) return null;
  if (!highlights || highlights.length === 0) {
    return <>{paragraphText}</>;
  }

  let matches = [];
  highlights.forEach((hl) => {
    if (!hl.text) return;
    let index = -1;
    while ((index = paragraphText.indexOf(hl.text, index + 1)) !== -1) {
      matches.push({
        start: index,
        end: index + hl.text.length,
        highlight: hl,
      });
    }
  });

  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  let activeMatches = [];
  let lastEnd = 0;
  for (let match of matches) {
    if (match.start >= lastEnd) {
      activeMatches.push(match);
      lastEnd = match.end;
    }
  }

  let result = [];
  let lastIdx = 0;
  activeMatches.forEach((match, idx) => {
    if (match.start > lastIdx) {
      result.push(paragraphText.substring(lastIdx, match.start));
    }
    const hl = match.highlight;
    result.push(
      <mark
        key={`${paraIndex}-${idx}`}
        id={hl.id}
        onClick={(e) => {
          e.stopPropagation();
          if (onHighlightClick) {
            onHighlightClick(e, hl);
          }
        }}
        className={`${hl.color} font-normal text-inherit px-0.5 rounded cursor-pointer transition-all hover:brightness-110 active:scale-95`}
        title={hl.type === "viva" ? "Click to view Viva Question" : "Click to view comment"}
      >
        {paragraphText.substring(match.start, match.end)}
      </mark>
    );
    lastIdx = match.end;
  });

  if (lastIdx < paragraphText.length) {
    result.push(paragraphText.substring(lastIdx));
  }

  return <>{result.length > 0 ? result : paragraphText}</>;
}
