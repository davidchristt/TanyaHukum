export default function StatCard({ title, value, growth }) {
  return (
    <div className="rounded-2xl p-5 text-white shadow-md 
    bg-gradient-to-r from-blue-400 to-blue-500">

      <p className="text-sm opacity-90 mb-1">
        {title}
      </p>

      <h2 className="text-3xl font-semibold">
        {value}
      </h2>

      <p className="text-xs mt-2 opacity-80">
        {growth} from last month
      </p>

    </div>
  );
}