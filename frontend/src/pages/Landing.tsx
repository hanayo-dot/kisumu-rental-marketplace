import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="motion-safe:animate-fade-in">
            <p className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700 mb-4">
              Built for Kisumu renters and landlords
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find your next rental home or list a property in Kisumu with ease.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Search verified rental homes, book viewings, and manage landlord listings all in one polished marketplace.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/search"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
              >
                Start Searching
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                List as Landlord
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/80 shadow-xl p-8 ring-1 ring-slate-200 backdrop-blur motion-safe:animate-fade-in">
            <div className="grid gap-4">
              <div
                className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg motion-safe:animate-pop-in"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=1200&q=80')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-slate-900/35"></div>
                <div className="relative">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-100">Featured neighbourhood</p>
                  <h2 className="mt-4 text-3xl font-semibold">Milimani</h2>
                  <p className="mt-2 text-slate-200">Modern apartments and secure family homes near schools, shopping and the lakefront.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Fast search</p>
                  <p className="mt-2 text-sm text-slate-600">Filter by area, price, type and availability.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Smooth landlord flow</p>
                  <p className="mt-2 text-sm text-slate-600">Upload photos and manage property listings from one dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-3">
          {[
            {
              title: 'Find your ideal rental',
              description: 'Browse curated homes with transparent details, price, and availability.',
            },
            {
              title: 'List your property fast',
              description: 'Landlords can upload photos, share descriptions, and manage inquiries instantly.',
            },
            {
              title: 'Schedule viewings',
              description: 'Stay organized with tenant connections, viewing updates and verified status.',
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl motion-safe:animate-pop-in">
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 rounded-3xl bg-indigo-600 px-8 py-12 text-white shadow-2xl">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Ready to discover the best rentals in Kisumu?</h2>
              <p className="mt-3 max-w-2xl text-slate-100">
                Use the marketplace to compare homes, connect with verified landlords, and move faster.
              </p>
            </div>
            <div className="mt-8 flex gap-3 sm:mt-0">
              <Link
                to="/search"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-500/20 hover:bg-slate-100"
              >
                Search now
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Join as landlord
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
