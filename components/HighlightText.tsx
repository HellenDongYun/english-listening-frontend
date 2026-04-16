type HighlightTextProps = {
  text: string;
  keyword: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightText({ text, keyword }: HighlightTextProps) {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${escapeRegExp(trimmedKeyword)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === trimmedKeyword.toLowerCase();

        return isMatch ? (
          <mark
            key={`${part}-${index}`}
            className="bg-blue-300 text-inherit rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </>
  );
}
