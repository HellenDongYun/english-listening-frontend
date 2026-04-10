export default function FilterBar() {
  return (
    <div className="flex gap-4 items-center">
      <input
        placeholder="Search exercises..."
        className="flex-1 border rounded-lg px-4 py-2"
      />

      <select className="border rounded-lg px-4 py-2">
        <option>All Levels</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>

      <select className="border rounded-lg px-4 py-2">
        <option>All Categories</option>
        <option>Business</option>
        <option>Daily Life</option>
        <option>Academic</option>
      </select>
    </div>
  );
}
