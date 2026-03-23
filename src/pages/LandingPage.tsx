import { Link } from 'react-router-dom';
import { ShieldAlert, MapPin, Phone, Users, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'motion/react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-16 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.50),white)]" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-8">
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold leading-6 text-emerald-600 ring-1 ring-inset ring-emerald-600/10">
                  Emergency Resource Locator System
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
                Quick Access to Life-Saving Resources
              </h1>
              <p className="mt-6 text-lg leading-8 text-zinc-600">
                Find hospitals, police stations, and emergency services near you. Stay connected with your emergency contacts and report incidents instantly.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-zinc-900">
                  Log in <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-emerald-600">Faster Response</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Everything you need in an emergency
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900">
                  <MapPin className="h-5 w-5 flex-none text-emerald-600" />
                  Resource Locator
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">Instantly find the nearest hospitals, police stations, and fire departments based on your city.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900">
                  <ShieldAlert className="h-5 w-5 flex-none text-emerald-600" />
                  SOS Alert
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">One-tap SOS button to alert emergency services and save your location for immediate help.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-zinc-900">
                  <Users className="h-5 w-5 flex-none text-emerald-600" />
                  Emergency Contacts
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                  <p className="flex-auto">Manage your trusted contacts who should be notified in case of an emergency.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-zinc-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <p className="text-sm leading-5 text-zinc-500">
            &copy; 2026 Emergency Resource Locator System. Built for College Mini Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
