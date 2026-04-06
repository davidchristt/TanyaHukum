import SubscriptionList from "@/components/features/subscription/SubscriptionList";

export default function SubscriptionPage() {
  // MOCK DATA: Anggap saja ini data hasil balikan dari Backend/Session API nanti
  const mockLoggedInUser = {
    name: "David",
    email: "david@student.unpad.ac.id", // Bebas mau diisi apa aja untuk tes
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#9CB9D8] p-6">
      {/* Oper datanya ke komponen lewat props 'user' */}
      <SubscriptionList user={mockLoggedInUser} />
    </div>
  );
}