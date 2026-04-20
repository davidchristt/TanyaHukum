"use client";

export default function SubscriptionSelect({
  plans,
  selected,
  setSelected,
  setStep,
  user,
  onClose,
}) {
  return (
    <div className="relative w-full bg-white rounded-3xl shadow-xl p-10">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
      >
        ✕
      </button>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Pilih Paket
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {plans.map((plan) => {
          const isActive = selected === plan.id;

          const isCurrent =
            (user?.tier === "FREE" && plan.id === "basic") ||
            (user?.tier === "PRO" && plan.id === "pro");

          return (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`rounded-2xl border p-6 cursor-pointer transition
              ${
                isActive
                  ? "border-blue-500 shadow-md"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              <h2 className="text-lg font-semibold text-center mb-2">
                {plan.name}
              </h2>

              <p className="text-center text-gray-700 mb-4">
                {plan.price}
              </p>

              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                {plan.benefits.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCurrent && plan.id === "pro") {
                    setStep("summary");
                  }
                }}
                disabled={isCurrent}
                className={`w-full py-2 rounded-lg text-sm font-medium
                ${
                  isCurrent
                    ? "bg-gray-200 text-gray-500"
                    : plan.id === "pro"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isCurrent ? "Paket Saat Ini" : "Pilih"}
              </button>
            </div>
          );
        })}

      </div>
    </div>
  );
}