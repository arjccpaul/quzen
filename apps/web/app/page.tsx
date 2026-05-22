import Link from 'next/link';
import { Navbar } from '@/components/navbar';

const SECTORS = [
  { key: 'DIAGNOSTIC', label: 'Diagnostic Centers', icon: '🔬', desc: 'Blood tests, X-Ray, MRI' },
  { key: 'HOSPITAL', label: 'Hospitals & Clinics', icon: '🏥', desc: 'OPD, Specialist, Follow-up' },
  { key: 'BANK', label: 'Banks', icon: '🏦', desc: 'KYC, Loans, Cash, Accounts' },
  { key: 'RESTAURANT', label: 'Restaurants', icon: '🍽️', desc: 'Table booking, Takeaway' },
  { key: 'SALON', label: 'Salons & Parlours', icon: '✂️', desc: 'Haircut, Spa, Facial' },
  { key: 'VEHICLE_SERVICE', label: 'Vehicle Service', icon: '🚗', desc: 'Bike, Car, Repair' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-indigo-600 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Wait from anywhere,<br />not from the line.
        </h1>
        <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8">
          Join queues remotely. Get real-time wait estimates powered by the community.
          Show up only when it&apos;s your turn.
        </p>
        <Link
          href="/businesses"
          className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition text-lg"
        >
          Find a Queue
        </Link>
      </section>

      {/* Sectors */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">Browse by Sector</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SECTORS.map((s) => (
            <Link
              key={s.key}
              href={`/businesses?sector=${s.key}`}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-300 hover:shadow-md transition group"
            >
              <div className="text-4xl mb-3">{s.icon}</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                {s.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { step: '1', title: 'Join Queue', desc: 'Select a service and get your token number remotely.' },
              { step: '2', title: 'Wait Anywhere', desc: 'Track live position and ETA from home, office, or café.' },
              { step: '3', title: 'Get Notified', desc: "Receive alert when it's almost your turn to arrive." },
              { step: '4', title: 'Help Others', desc: 'Confirm completion to improve predictions for everyone.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-400 py-6">
        © 2026 Quzen. All rights reserved.
      </footer>
    </div>
  );
}
