import Link from "next/link";
import {
  Sprout,
  ArrowRight,
  Brain,
  ShoppingCart,
  CreditCard,
  BarChart3,
  CheckCircle2,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-green-700" />
            <span className="text-xl font-bold text-gray-900">
              Agri<span className="text-green-700">Bridge</span> AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard?demo=true"
              className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors flex items-center gap-2"
            >
              Try Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6">
            <Sprout className="h-4 w-4" />
            Razorpay Buildathon — Track 5
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Turn your harvest into
            <br />
            <span className="text-green-700">smarter commerce</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI-powered commerce agent that helps farmers compare buyers, make
            better selling decisions, and complete payments securely.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard?demo=true"
              className="px-8 py-4 bg-green-700 text-white rounded-xl font-semibold text-lg hover:bg-green-800 transition-all hover:shadow-lg hover:shadow-green-700/20 flex items-center gap-2"
            >
              Try Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Sell smarter. Buy better. Get paid faster.
          </p>
        </div>
      </section>

      {/* ── Problem ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            The Problem
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Farmers often know what they grow, but not always who to sell to, at
            what price, or how quickly they&apos;ll get paid. Turning produce into the
            best transaction involves multiple decisions—who should I sell to,
            what price should I accept, will they take my full quantity, and how
            do I actually complete the transaction?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: Users,
                title: "Multiple buyers",
                desc: "Hard to compare offers across different buyers",
              },
              {
                icon: TrendingUp,
                title: "Price uncertainty",
                desc: "Difficult to know if the offered price is fair",
              },
              {
                icon: Clock,
                title: "Slow payments",
                desc: "Delayed payments create financial pressure",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-white rounded-xl border border-gray-100"
              >
                <item.icon className="h-8 w-8 text-green-700 mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            From listing to payment in one AI-assisted workflow
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: "1", icon: ShoppingCart, title: "List your produce", desc: "Add crop, quantity, quality, and price" },
              { step: "2", icon: Brain, title: "AI finds buyers", desc: "Matching engine scores all buyers" },
              { step: "3", icon: CheckCircle2, title: "Review recommendation", desc: "See scores, reasoning, comparison" },
              { step: "4", icon: Users, title: "Approve the order", desc: "You decide — AI never auto-transacts" },
              { step: "5", icon: CreditCard, title: "Pay with Razorpay", desc: "Secure test-mode payment flow" },
              { step: "6", icon: BarChart3, title: "Track everything", desc: "Orders, payments, analytics" },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 transition-colors">
                  <item.icon className="h-7 w-7 text-green-700" />
                </div>
                <div className="text-xs font-bold text-green-700 mb-1">
                  STEP {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Section ──────────────────────────────── */}
      <section className="py-20 bg-green-800 text-white px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Not just advice. AI that helps you act.
          </h2>
          <p className="text-green-200 text-lg mb-12 max-w-2xl mx-auto">
            AgriBridge AI doesn&apos;t stop at recommendations. It helps move
            the farmer from decision to transaction.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
            {["Analyze", "Recommend", "Confirm", "Transact"].map(
              (step, idx) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                      {idx === 0 && <Brain className="h-7 w-7" />}
                      {idx === 1 && <Zap className="h-7 w-7" />}
                      {idx === 2 && <CheckCircle2 className="h-7 w-7" />}
                      {idx === 3 && <CreditCard className="h-7 w-7" />}
                    </div>
                    <span className="text-sm font-medium mt-2">{step}</span>
                  </div>
                  {idx < 3 && (
                    <ArrowRight className="h-5 w-5 text-green-300 hidden sm:block" />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Impact Metrics ──────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            Demo Metrics
          </h2>
          <p className="text-gray-500 text-center mb-12 text-sm">
            Sample values from demo marketplace data
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "₹1.93L", label: "Example transaction", sub: "Demo value" },
              { value: "8", label: "Buyer matches", sub: "Test marketplace" },
              { value: "95/100", label: "Best match score", sub: "AgriBridge score" },
              { value: "24 hrs", label: "Payment window", sub: "Fastest buyer" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-6 text-center bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="text-3xl sm:text-4xl font-bold text-green-700 mb-1">
                  {item.value}
                </div>
                <div className="text-sm font-medium text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-400 mt-1">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ────────────────────────────────── */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-10 w-10 text-green-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Secure Payments with Razorpay
          </h3>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            All payments are processed through Razorpay&apos;s secure payment
            infrastructure. This demo uses Razorpay Test Mode — no real money is
            charged.
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to see it in action?
          </h2>
          <p className="text-gray-500 mb-8">
            Experience the full farmer-to-payment workflow with demo data.
          </p>
          <Link
            href="/dashboard?demo=true"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-700 text-white rounded-xl font-semibold text-lg hover:bg-green-800 transition-all hover:shadow-lg hover:shadow-green-700/20"
          >
            Try Demo Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Sprout className="h-5 w-5" />
            <span className="text-sm">
              AgriBridge AI — Razorpay Buildathon 2026
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Demo marketplace data. Not real companies or live offers.
          </p>
        </div>
      </footer>
    </div>
  );
}
