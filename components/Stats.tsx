const stats = [
  { label: "Active Learners", value: "10,000+" },
  { label: "Average Rating", value: "4.8/5" },
  { label: "Total Exercises", value: "500+" },
];

export default function Stats() {
  return (
    <div className="flex gap-4">
      {stats.map((s) => (
        <div key={s.label} className="border rounded-lg px-6 py-4 bg-white">
          <p className="text-sm text-gray-500">{s.label}</p>
          <p className="text-lg font-semibold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
