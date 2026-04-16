const stats = [
  { label: "Active Learners", value: "10,000+" },
  { label: "Average Rating", value: "4.8/5" },
  { label: "Total Exercises", value: "500+" },
];

export default function Stats() {
  return (
    <div className="flex gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl px-6 py-4 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-200"
        >
          <p className="text-xs text-gray-400">{s.label}</p>
          <p className="text-xl font-semibold text-gray-900">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
