export default function Hero() {
  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-bold leading-tight">
        <span className="relative inline-block">
          {/* 高亮背景（更高 + 更往上） */}
          <span className="absolute -top-2 -left-2 z-0 h-[85%] w-[110%] rounded-md bg-gradient-to-r from-[#ff909e] to-[#fad0c4] opacity-80 rotate-[-2deg]" />

          {/* 文字（往右移一点） */}
          <span className="relative z-10 ml-2 text-5xl font-extrabold">
            Master English
          </span>
        </span>

        <br />

        <span className="text-4xl font-bold">Through Listening</span>
      </h1>

      <p className="text-gray-600 max-w-2xl">
        Improve your listening comprehension with our curated collection of
        audio exercises spanning daily conversations, business scenarios, and
        academic content.
      </p>
    </section>
  );
}
