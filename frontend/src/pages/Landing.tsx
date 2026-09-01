import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  IconWalk,
  IconShield,
  IconZap,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconBed,
  IconBath,
} from '../components/Icons';

interface EstateStep {
  id: number;
  name: string;
  location: string;
  distance: string;
  image: string;
  tag: string;
  title: string;
  price: number;
  beds: number;
  baths: number;
  type: string;
  description: string;
  hotspots: {
    top: string;
    left: string;
    label: string;
    detail: string;
  }[];
}

const ESTATE_STEPS: EstateStep[] = [
  {
    id: 1,
    name: 'Milimani Palms Avenue',
    location: 'Milimani Estate, Kisumu',
    distance: '0 meters · Main Gate',
    image: '/images/estate_street_walk.jpg',
    tag: 'Featured Luxury Villa',
    title: 'Milimani Royal Haven',
    price: 65000,
    beds: 4,
    baths: 4,
    type: 'Executive House',
    description: 'A serene stroll down Milimani Palms Drive brings you to this modern 4-bedroom villa featuring paved brick driveways, lush tropical foliage, solar perimeter lights, and Lake Victoria breezes.',
    hotspots: [
      { top: '35%', left: '22%', label: 'Stone Façade Villa', detail: '4-Bed Ensuite with solar water heating' },
      { top: '65%', left: '48%', label: 'Brick Walkway', detail: 'Paved, clean & well-lit neighborhood walk' },
      { top: '45%', left: '82%', label: 'Palm View Residence', detail: 'Spacious driveway & electric perimeter gate' },
    ],
  },
  {
    id: 2,
    name: 'Riat Sunset Heights Drive',
    location: 'Riat Hills, Kisumu',
    distance: '150 meters · Hillside Crest',
    image: '/images/estate_villa_milimani.jpg',
    tag: 'Panoramic Lake View',
    title: 'Riat Crest Villa & Terrace',
    price: 48000,
    beds: 3,
    baths: 3,
    type: 'Luxury House',
    description: 'Elevated along Riat Hills street, enjoy fresh lake breezes and panoramic sunset views. Secure gated compound with manicured lawn gardens and high-end modern finishes.',
    hotspots: [
      { top: '25%', left: '55%', label: 'Glass Balcony View', detail: 'Direct views of Kisumu City & Lake Victoria' },
      { top: '60%', left: '38%', label: 'Private Lawn', detail: 'Spacious green garden perfect for families' },
      { top: '75%', left: '72%', label: 'Automated Gate', detail: 'Smart intercom & 24/7 security guard post' },
    ],
  },
  {
    id: 3,
    name: 'Estate Avenue Boulevard',
    location: 'Uzima / Riat Avenue, Kisumu',
    distance: '320 meters · Central Court',
    image: '/images/estate_apartment_riat.jpg',
    tag: 'Modern Residence',
    title: 'Avenue Court Apartments',
    price: 32000,
    beds: 2,
    baths: 2,
    type: 'Apartment',
    description: 'Walking further down the avenue reveals modern contemporary apartments framed by royal palm trees. Complete with fibre internet, back-up generator, and designated parking.',
    hotspots: [
      { top: '40%', left: '28%', label: 'Balcony Suites', detail: 'Spacious 2-bedroom units with fitted kitchen' },
      { top: '70%', left: '70%', label: 'Palm Avenue Road', detail: 'Asphalt dual road with street lamps' },
      { top: '80%', left: '45%', label: 'Secure Entrance', detail: 'Controlled keycard access & visitor parking' },
    ],
  },
];

export default function Landing() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoWalking, setIsAutoWalking] = useState(false);

  const step = ESTATE_STEPS[currentStepIndex];

  useEffect(() => {
    if (!isAutoWalking) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % ESTATE_STEPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoWalking]);

  const handleNextStep = () => {
    setIsAutoWalking(false);
    setCurrentStepIndex((prev) => (prev + 1) % ESTATE_STEPS.length);
  };

  const handlePrevStep = () => {
    setIsAutoWalking(false);
    setCurrentStepIndex((prev) => (prev === 0 ? ESTATE_STEPS.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen text-slate-100 font-smooth">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Glassmorphic Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] glass-dark-card p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-1.5 text-xs font-medium text-slate-200 border border-slate-700/80 mb-3 backdrop-blur-md">
                <IconMapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Estate Street Tour · Kisumu, Kenya</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
                Stroll down Kisumu&apos;s finest residential estate.
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 backdrop-blur-md">
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-indigo-600 hover:text-white transition"
              >
                <IconChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setIsAutoWalking(!isAutoWalking)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isAutoWalking ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isAutoWalking ? 'Auto Play: On' : 'Auto Play: Off'}
              </button>
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                <span>Next House</span>
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Frosted Glass Parallax Frame */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 shadow-2xl h-[460px] md:h-[560px] group">
            {ESTATE_STEPS.map((s, idx) => (
              <img
                key={s.id}
                src={s.image}
                alt={s.name}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${
                  idx === currentStepIndex
                    ? 'opacity-100 scale-100 group-hover:scale-105'
                    : 'opacity-0 scale-105 pointer-events-none'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

            {/* Top Glass Marker Badge */}
            <div className="absolute top-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="glass-dark-card rounded-2xl px-5 py-3 text-left">
                <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">{step.location}</p>
                <h2 className="text-xl font-bold text-white mt-0.5">{step.name}</h2>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <IconMapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {step.distance}
                </p>
              </div>

              <div className="glass-dark-card rounded-2xl px-5 py-3 text-right">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  {step.tag}
                </span>
                <p className="text-2xl font-extrabold text-white mt-1">
                  KSh {step.price.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span>
                </p>
              </div>
            </div>



            {/* Bottom Glass Property Overlay */}
            <div className="absolute bottom-6 left-6 right-6 glass-dark-card rounded-3xl p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
                <div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-300 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {step.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconBed className="w-4 h-4 text-slate-400" />
                      {step.beds} Beds
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <IconBath className="w-4 h-4 text-slate-400" />
                      {step.baths} Baths
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">{step.description}</p>
                </div>

                <div className="flex gap-3">
                  <Link
                    to="/search"
                    className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition"
                  >
                    Connect with Landlord
                  </Link>
                </div>
              </div>

              {/* Quiet Step Progress Indicator */}
              <div className="mt-5 flex items-center gap-2">
                {ESTATE_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setIsAutoWalking(false);
                      setCurrentStepIndex(idx);
                    }}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex ? 'bg-indigo-500' : 'bg-slate-700/80 hover:bg-slate-600'
                    }`}
                    title={s.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vector Icon Feature Cards with Glassmorphism */}
        <section className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              Icon: IconWalk,
              title: 'Estate Street Stroll',
              desc: 'Virtually stroll down verified residential streets in Milimani, Riat Hills, Uzima, and Kisumu Central.',
            },
            {
              Icon: IconShield,
              title: 'Verified Connections',
              desc: 'Direct connection requests to verified landlords with zero hidden broker markup fees.',
            },
            {
              Icon: IconZap,
              title: 'Instant Inquiries',
              desc: 'Schedule physical viewings, send direct notes, and track rental status in real-time.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glass-card rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-5">
                <f.Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{f.title}</h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Clean CTA Glass Banner */}
        <section className="mt-16 glass-dark-card rounded-3xl p-10 text-white border border-indigo-500/30 md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">Ready to find your rental in Kisumu?</h2>
            <p className="mt-2 text-slate-300 max-w-xl">
              Compare curated estate homes, view transparent property details, and connect with landlords.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/search"
              className="rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition"
            >
              Search All Rentals
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-7 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              List Property (KSh.250)
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
