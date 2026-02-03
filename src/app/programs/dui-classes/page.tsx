import { db } from "@/lib/db";
import Link from "next/link";

export default async function DUIClassesPage() {
  const classes = await db.dUIClass.findMany({
    where: {
      active: true,
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">DUI Education Classes</h1>
      <p className="text-gray-600 mb-8">
        AVFY offers state-approved DUI education classes. Register online and 
        complete your court-required education with our experienced instructors.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-blue-900 mb-2">What to Expect</h2>
        <ul className="text-blue-800 space-y-1">
          <li>• State-approved curriculum</li>
          <li>• Certificate provided upon completion</li>
          <li>• Professional, judgment-free environment</li>
          <li>• Flexible scheduling options</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mb-6">Upcoming Classes</h2>

      {classes.length === 0 ? (
        <p className="text-gray-500">No classes currently scheduled. Check back soon!</p>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => {
            const spotsLeft = cls.capacity - cls._count.registrations;
            const isFull = spotsLeft <= 0;

            return (
              <div 
                key={cls.id} 
                className="border rounded-lg p-6 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{cls.title}</h3>
                    <p className="text-gray-600 mt-1">{cls.description}</p>
                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      <p>📅 {new Date(cls.date).toLocaleDateString("en-US", { 
                        weekday: "long", 
                        month: "long", 
                        day: "numeric",
                        year: "numeric"
                      })}</p>
                      <p>🕐 {cls.startTime} - {cls.endTime}</p>
                      <p>📍 {cls.location}</p>
                      {cls.instructor && <p>👤 Instructor: {cls.instructor}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${(cls.price / 100).toFixed(2)}</p>
                    <p className={`text-sm ${isFull ? "text-red-600" : "text-green-600"}`}>
                      {isFull ? "Class Full" : `${spotsLeft} spots left`}
                    </p>
                    {!isFull && (
                      <Link
                        href={`/programs/dui-classes/register/${cls.id}`}
                        className="inline-block mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Register Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="font-semibold mb-2">Questions?</h2>
        <p className="text-gray-600">
          Contact us at <a href="mailto:info@avfy.org" className="text-blue-600">info@avfy.org</a> or 
          call <a href="tel:+1234567890" className="text-blue-600">(123) 456-7890</a>
        </p>
      </div>
    </div>
  );
}
