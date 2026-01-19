import Link from "next/link";

export default function DUISuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-bold mb-4">Registration Complete!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for registering. You'll receive a confirmation email shortly 
        with all the details for your class.
      </p>
      
      <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
        <h2 className="font-semibold mb-2">What's Next?</h2>
        <ul className="text-gray-700 space-y-2">
          <li>✓ Check your email for confirmation</li>
          <li>✓ Add the class date to your calendar</li>
          <li>✓ Arrive 15 minutes early on class day</li>
          <li>✓ Bring a valid ID</li>
        </ul>
      </div>

      <Link 
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
