import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfigurationModal } from "./configuration-modal"
import { Star, ChevronRight, ArrowRight, MessageSquare } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-[#DEB986]/30 bg-[#C0DF85]/80 backdrop-blur supports-[backdrop-filter]:bg-[#C0DF85]/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#ED4D6E]" />
            <span className="text-xl font-bold text-[#DEB986]">MenuBot</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-[#DEB986] hover:text-[#ED4D6E] hover:underline">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-[#DEB986] hover:text-[#ED4D6E] hover:underline">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-[#DEB986] hover:text-[#ED4D6E] hover:underline">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-[#DEB986] hover:text-[#ED4D6E] hover:underline">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="border-[#DEB986] text-[#DEB986] hover:bg-[#DEB986]/10">
              Log In
            </Button>
            <Button size="sm" className="bg-[#ED4D6E] hover:bg-[#ED4D6E]/90 text-white">Sign Up Free</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#DB6C79]/30 to-[#C0DF85]/30 py-20">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-center bg-no-repeat opacity-10"></div>
          <div className="container relative flex flex-col items-center text-center">
            <div className="inline-block rounded-full bg-[#ED4D6E]/10 px-4 py-1.5 text-sm font-medium text-[#ED4D6E] mb-6">
              🚀 Trusted by 500+ Restaurants Worldwide
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#DEB986] mb-6">
              Turn Menu Views into <span className="text-[#ED4D6E]">5-Star Reviews!</span> 🌟
            </h1>
            <p className="max-w-2xl text-xl text-[#DEB986] mb-10">
              Generate up to 100 new Google reviews every month automatically with our WhatsApp menu bot!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <ConfigurationModal />
              <Button variant="outline" size="lg" className="border-[#DEB986] text-[#DEB986] hover:bg-[#DEB986]/10">
                See Demo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 bg-[#DB6C79]/30">
                <h3 className="text-xl font-bold text-[#DEB986] mb-2">How It Works</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#DB6C79]/30 flex items-center justify-center mb-3">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h4 className="font-medium text-[#DEB986]">QR Code Scan</h4>
                  <ArrowRight className="hidden md:block rotate-0 md:rotate-90 lg:rotate-0 mt-4 text-[#DEB986]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C0DF85]/50 flex items-center justify-center mb-3">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h4 className="font-medium text-[#DEB986]">WhatsApp Menu</h4>
                  <ArrowRight className="hidden md:block rotate-0 md:rotate-90 lg:rotate-0 mt-4 text-[#DEB986]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#DB6C79]/30 flex items-center justify-center mb-3">
                    <span className="text-2xl">😋</span>
                  </div>
                  <h4 className="font-medium text-[#DEB986]">Customer Experience</h4>
                  <ArrowRight className="hidden md:block rotate-0 md:rotate-90 lg:rotate-0 mt-4 text-[#DEB986]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C0DF85]/50 flex items-center justify-center mb-3">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h4 className="font-medium text-[#DEB986]">Review Request</h4>
                  <ArrowRight className="hidden md:block rotate-0 md:rotate-90 lg:rotate-0 mt-4 text-[#DEB986]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#DB6C79]/30 flex items-center justify-center mb-3">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h4 className="font-medium text-[#DEB986]">Google Ranking Boost</h4>
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center">
              <div className="text-3xl font-bold mb-2">
                <span className="text-[#ED4D6E]">78</span> new reviews
              </div>
              <p className="text-[#DEB986]">Restaurants using our system average per month</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-[#DB6C79]/20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-[#DEB986]">Why Restaurants Love Us 🍽️</h2>
              <p className="text-xl text-[#DEB986] max-w-2xl mx-auto">
                Our WhatsApp menu bot doesn't just show your menu - it's your secret weapon for Google reviews!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 border-2 border-[#C0DF85] hover:border-[#ED4D6E] transition-all bg-white">
                <div className="mb-4 text-4xl">🌟</div>
                <h3 className="text-xl font-bold mb-2 text-[#DEB986]">Automatic Review Generation</h3>
                <p className="text-[#DEB986]">
                  Turn every menu view into a potential 5-star review with perfectly timed review requests.
                </p>
              </Card>

              <Card className="p-6 border-2 border-[#C0DF85] hover:border-[#ED4D6E] transition-all bg-white">
                <div className="mb-4 text-4xl">📊</div>
                <h3 className="text-xl font-bold mb-2 text-[#DEB986]">Review Analytics</h3>
                <p className="text-[#DEB986]">
                  Track your review growth and see how you're outranking competitors on Google.
                </p>
              </Card>

              <Card className="p-6 border-2 border-[#C0DF85] hover:border-[#ED4D6E] transition-all bg-white">
                <div className="mb-4 text-4xl">🤖</div>
                <h3 className="text-xl font-bold mb-2 text-[#DEB986]">Easy Setup</h3>
                <p className="text-[#DEB986]">
                  Get started in minutes with our friendly configuration wizard - no tech skills needed!
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-[#C0DF85]/40">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-[#DEB986]">Success Stories 🎉</h2>
              <p className="text-xl text-[#DEB986] max-w-2xl mx-auto">
                See how restaurants are boosting their online presence with our review generation system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 bg-white border-[#C0DF85]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#DB6C79]/30 flex items-center justify-center mr-4">
                    <span className="text-xl">🍕</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#DEB986]">Mario's Pizzeria</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#ED4D6E] text-[#ED4D6E]" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[#DEB986]">
                  "We went from 15 reviews to over 200 in just three months! Our restaurant now appears at the top of
                  local searches."
                </p>
              </Card>

              <Card className="p-6 bg-white border-[#C0DF85]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#DB6C79]/30 flex items-center justify-center mr-4">
                    <span className="text-xl">🍣</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#DEB986]">Sakura Sushi</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#ED4D6E] text-[#ED4D6E]" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[#DEB986]">
                  "The WhatsApp menu is convenient for our customers, but the review generation feature is what really
                  changed our business!"
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#ED4D6E] text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Reviews? 🚀</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Join hundreds of restaurants already using our system to climb Google rankings and attract more customers.
            </p>
            <ConfigurationModal />
          </div>
        </section>
      </main>
      <footer className="border-t border-[#DEB986]/30 py-10 bg-[#C0DF85]/20">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <MessageSquare className="h-6 w-6 text-[#ED4D6E]" />
            <span className="text-xl font-bold text-[#DEB986]">MenuBot</span>
          </div>
          <div className="text-center md:text-right text-sm text-[#DEB986]">
            <p>© 2025 MenuBot. All rights reserved.</p>
            <p>Helping restaurants turn menu views into 5-star reviews!</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

