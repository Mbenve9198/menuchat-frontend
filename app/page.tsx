import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfigurationModal } from "./configuration-modal"
import { Star, ChevronRight, ArrowRight, MessageSquare } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-[#AF9B46]/30 bg-[#DFD6A7]/80 backdrop-blur supports-[backdrop-filter]:bg-[#DFD6A7]/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#F7B05B]" />
            <span className="text-xl font-bold text-[#1F1300]">MenuBot</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-[#1F1300] hover:text-[#F7B05B] hover:underline">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-[#1F1300] hover:text-[#F7B05B] hover:underline">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-[#1F1300] hover:text-[#F7B05B] hover:underline">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-[#1F1300] hover:text-[#F7B05B] hover:underline">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="border-[#AF9B46] text-[#AF9B46] hover:bg-[#AF9B46]/10">
              Log In
            </Button>
            <Button size="sm" className="bg-[#F7B05B] hover:bg-[#F7B05B]/90 text-white">Sign Up Free</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F7CE5B]/30 to-[#DFD6A7]/30 py-20">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-center bg-no-repeat opacity-10"></div>
          <div className="container relative flex flex-col items-center text-center">
            <div className="inline-block rounded-full bg-[#F7B05B]/10 px-4 py-1.5 text-sm font-medium text-[#F7B05B] mb-6">
              🚀 Trusted by 500+ Restaurants Worldwide
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1F1300] mb-6">
              Turn Menu Views into <span className="text-[#F7B05B]">5-Star Reviews!</span> 🌟
            </h1>
            <p className="max-w-2xl text-xl text-[#AF9B46] mb-10">
              Generate up to 100 new Google reviews every month automatically with our WhatsApp menu bot!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <ConfigurationModal />
              <Button variant="outline" size="lg" className="border-[#AF9B46] text-[#AF9B46] hover:bg-[#AF9B46]/10">
                See Demo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 bg-[#F7CE5B]/30">
                <h3 className="text-xl font-bold text-[#1F1300] mb-2">How It Works</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F7CE5B]/30 flex items-center justify-center mb-3">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h4 className="font-medium text-[#1F1300]">QR Code Scan</h4>
                  <ArrowRight className="hidden md:block rotate-0 md:rotate-90 lg:rotate-0 mt-4 text-[#AF9B46]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#DFD6A7]/50 flex items-center justify-center mb-3">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h4 className="font-medium text-[#1F1300]">WhatsApp Menu</h4>
                  <ArrowRight className="hidden md:block rotate-0 md:rotate-90 lg:rotate-0 mt-4 text-[#AF9B46]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F7CE5B]/30 flex items-center justify-center mb-3">
                    <span className="text-2xl">😋</span>
                  </div>
                  <h4 className="font-medium text-[#1F1300]">Customer Experience</h4>
                  <ArrowRight className="hidden md:block rotate-0 md:rotate-90 lg:rotate-0 mt-4 text-[#AF9B46]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#DFD6A7]/50 flex items-center justify-center mb-3">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h4 className="font-medium text-[#1F1300]">Review Request</h4>
                  <ArrowRight className="hidden md:block rotate-0 md:rotate-90 lg:rotate-0 mt-4 text-[#AF9B46]" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F7CE5B]/30 flex items-center justify-center mb-3">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h4 className="font-medium text-[#1F1300]">Google Ranking Boost</h4>
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center">
              <div className="text-3xl font-bold mb-2">
                <span className="text-[#F7B05B]">78</span> new reviews
              </div>
              <p className="text-[#AF9B46]">Restaurants using our system average per month</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-[#F7CE5B]/20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-[#1F1300]">Why Restaurants Love Us 🍽️</h2>
              <p className="text-xl text-[#AF9B46] max-w-2xl mx-auto">
                Our WhatsApp menu bot doesn't just show your menu - it's your secret weapon for Google reviews!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 border-2 border-[#DFD6A7] hover:border-[#F7B05B] transition-all bg-white">
                <div className="mb-4 text-4xl">🌟</div>
                <h3 className="text-xl font-bold mb-2 text-[#1F1300]">Automatic Review Generation</h3>
                <p className="text-[#AF9B46]">
                  Turn every menu view into a potential 5-star review with perfectly timed review requests.
                </p>
              </Card>

              <Card className="p-6 border-2 border-[#DFD6A7] hover:border-[#F7B05B] transition-all bg-white">
                <div className="mb-4 text-4xl">📊</div>
                <h3 className="text-xl font-bold mb-2 text-[#1F1300]">Review Analytics</h3>
                <p className="text-[#AF9B46]">
                  Track your review growth and see how you're outranking competitors on Google.
                </p>
              </Card>

              <Card className="p-6 border-2 border-[#DFD6A7] hover:border-[#F7B05B] transition-all bg-white">
                <div className="mb-4 text-4xl">🤖</div>
                <h3 className="text-xl font-bold mb-2 text-[#1F1300]">Easy Setup</h3>
                <p className="text-[#AF9B46]">
                  Get started in minutes with our friendly configuration wizard - no tech skills needed!
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-[#DFD6A7]/40">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-[#1F1300]">Success Stories 🎉</h2>
              <p className="text-xl text-[#AF9B46] max-w-2xl mx-auto">
                See how restaurants are boosting their online presence with our review generation system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 bg-white border-[#DFD6A7]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#F7CE5B]/30 flex items-center justify-center mr-4">
                    <span className="text-xl">🍕</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1F1300]">Mario's Pizzeria</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#F7B05B] text-[#F7B05B]" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[#AF9B46]">
                  "We went from 15 reviews to over 200 in just three months! Our restaurant now appears at the top of
                  local searches."
                </p>
              </Card>

              <Card className="p-6 bg-white border-[#DFD6A7]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#F7CE5B]/30 flex items-center justify-center mr-4">
                    <span className="text-xl">🍣</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1F1300]">Sakura Sushi</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#F7B05B] text-[#F7B05B]" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[#AF9B46]">
                  "The WhatsApp menu is convenient for our customers, but the review generation feature is what really
                  changed our business!"
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#F7B05B] text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Reviews? 🚀</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Join hundreds of restaurants already using our system to climb Google rankings and attract more customers.
            </p>
            <ConfigurationModal />
          </div>
        </section>
      </main>
      <footer className="border-t border-[#AF9B46]/30 py-10 bg-[#DFD6A7]/20">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <MessageSquare className="h-6 w-6 text-[#F7B05B]" />
            <span className="text-xl font-bold text-[#1F1300]">MenuBot</span>
          </div>
          <div className="text-center md:text-right text-sm text-[#AF9B46]">
            <p>© 2025 MenuBot. All rights reserved.</p>
            <p>Helping restaurants turn menu views into 5-star reviews!</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

