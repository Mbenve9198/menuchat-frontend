"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  Upload,
  Award,
  TrendingUp,
  ChevronRight,
  Check,
  Smartphone,
  Sparkles,
  Clock,
  BarChart3,
  Smile,
  MessageSquare,
} from "lucide-react"

export function ConfigurationModal() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)
  const totalSteps = 7

  useEffect(() => {
    if (currentStep === 7) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="animate-bounce bg-primary hover:bg-primary/90 text-white">
          Boost Your Reviews Now! 🚀
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white border-[#DEB986]">
        {showConfetti && (
          <div className="confetti-container absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `fall ${Math.random() * 3 + 2}s linear forwards`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
            <style jsx>{`
              @keyframes fall {
                to {
                  transform: translateY(105vh) rotate(${Math.random() * 360}deg);
                }
              }
            `}</style>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-2xl text-[#1F1300]">Setup Your Review Generation System 🌟</DialogTitle>
          <DialogDescription className="text-[#AF9B46]">
            Follow these simple steps to start collecting more Google reviews automatically!
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    i + 1 === currentStep
                      ? "bg-[#ED4D6E] text-white"
                      : i + 1 < currentStep
                        ? "bg-[#ED4D6E]/20 text-[#ED4D6E]"
                        : "bg-[#DB6C79]/50 text-[#DEB986]"
                  }`}
              >
                {i + 1 < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2 bg-[#C0DF85]" />
        </div>

        {/* Step 1: Restaurant Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🏠</div>
              <h3 className="text-xl font-bold text-[#1F1300]">Restaurant Information</h3>
              <p className="text-[#AF9B46]">Let's get to know your restaurant!</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name" className="text-[#1F1300]">Restaurant Name</Label>
                <Input id="restaurant-name" placeholder="e.g., Mario's Pizzeria" className="border-[#AF9B46]/30 focus:border-[#F7B05B] focus:ring-[#F7B05B]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurant-address" className="text-[#1F1300]">Restaurant Address</Label>
                <Input id="restaurant-address" placeholder="Start typing for Google Places suggestions..." className="border-[#AF9B46]/30 focus:border-[#F7B05B] focus:ring-[#F7B05B]" />
              </div>

              <Card className="bg-[#F7CE5B]/20 border-[#F7CE5B]/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#1F1300]">Current Google Presence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-[#F7B05B] fill-[#F7B05B] mr-1" />
                        <Star className="h-4 w-4 text-[#F7B05B] fill-[#F7B05B] mr-1" />
                        <Star className="h-4 w-4 text-[#F7B05B] fill-[#F7B05B] mr-1" />
                        <Star className="h-4 w-4 text-[#F7B05B] fill-[#F7B05B] mr-1" />
                        <Star className="h-4 w-4 text-[#F7B05B]/50 mr-1" />
                        <span className="text-sm text-[#1F1300] ml-1">4.0</span>
                      </div>
                      <div className="text-sm text-[#AF9B46]">Based on 24 reviews</div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="border-[#F7B05B] text-[#F7B05B] hover:bg-[#F7B05B] hover:text-white">
                        View on Google
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={nextStep} className="bg-[#F7B05B] hover:bg-[#F7B05B]/90 text-white">
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Menu Setup */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 animate-bounce-slow">📋</div>
              <h3 className="text-xl font-bold">Menu Setup</h3>
              <p className="text-muted-foreground">Upload your menu or provide a link</p>
            </div>

            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer bg-accent group">
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Drag and drop your menu file</p>
                  <p className="text-sm text-accent-foreground">Or click to browse files</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="group-hover:bg-primary group-hover:text-white transition-colors"
                >
                  Upload Menu
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-xs text-center">
                <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center">
                  <span className="h-px bg-muted flex-1 mr-3"></span>
                  OR
                  <span className="h-px bg-muted flex-1 ml-3"></span>
                </p>
                <Input placeholder="Enter menu URL if you already have one" />
                <div className="mt-2 flex justify-center">
                  <div className="w-8 h-8 text-2xl animate-bounce">👨‍🍳</div>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-4 flex items-start relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">📈</div>
              <div className="mr-3 mt-1 text-xl">💡</div>
              <div className="relative z-10">
                <p className="font-medium">Every menu view = potential new review! 📈</p>
                <p className="text-sm text-secondary-foreground">
                  Customers who view your menu are 3x more likely to leave a review when prompted.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review Request Setup - HIGHLIGHTED */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6 bg-secondary py-6 rounded-lg border-2 border-primary relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=800')] bg-center bg-no-repeat opacity-5"></div>
              <div className="text-5xl mb-3 animate-pulse">⭐</div>
              <h3 className="text-xl font-bold">Review Request Setup</h3>
              <p className="text-primary font-bold text-lg mt-2 animate-pulse">THIS IS WHERE THE MAGIC HAPPENS!</p>
              <div className="absolute top-2 right-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-review-link" className="flex items-center">
                  Your Google Review Link
                  <span className="ml-2 text-xs text-primary">(Critical for success!)</span>
                </Label>
                <div className="relative">
                  <Input id="google-review-link" placeholder="https://g.page/r/..." />
                  <div className="absolute right-2 top-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="inline-block h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Don't have a link?{" "}
                  <a href="#" className="text-primary hover:underline">
                    Learn how to get one
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-secondary-foreground" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-medium">Customer views menu</p>
                    <div className="flex justify-center">
                      <ChevronRight className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <p className="font-medium">Automatic review request sent</p>
                    <div className="flex justify-center">
                      <ChevronRight className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <p className="font-medium">New 5-star review!</p>
                  </div>
                </div>

                <Card className="border-primary/50 overflow-hidden">
                  <CardHeader className="bg-accent pb-2">
                    <CardTitle className="text-base flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Potential Review Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 relative">
                    <div className="h-32 flex items-end justify-between px-2">
                      <div className="w-2 bg-secondary h-[20%] rounded-t-md"></div>
                      <div className="w-2 bg-secondary h-[30%] rounded-t-md"></div>
                      <div className="w-2 bg-secondary h-[25%] rounded-t-md"></div>
                      <div className="w-2 bg-secondary h-[40%] rounded-t-md"></div>
                      <div className="w-2 bg-primary h-[60%] rounded-t-md animate-pulse"></div>
                      <div className="w-2 bg-primary h-[75%] rounded-t-md animate-pulse"></div>
                      <div className="w-2 bg-primary h-[90%] rounded-t-md animate-pulse"></div>
                      <div className="w-2 bg-primary h-[100%] rounded-t-md animate-pulse"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-px bg-muted"></div>
                    <div className="absolute left-0 top-0 h-full w-px bg-muted"></div>
                    <div className="text-center mt-2">
                      <p className="text-sm font-medium">
                        Up to <span className="text-primary">100 new reviews</span> per month
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-secondary rounded-lg p-4 flex items-start relative overflow-hidden border-2 border-primary/20">
                <div className="absolute -right-6 -bottom-6 text-8xl opacity-10">🥇</div>
                <div className="mr-3 mt-1 text-xl">🥇</div>
                <div className="relative z-10">
                  <p className="font-medium">This is how you'll outrank competitors on Google!</p>
                  <p className="text-sm text-secondary-foreground">
                    Restaurants with 100+ reviews rank 25% higher in local search results.
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="flex items-center bg-white px-2 py-1 rounded-md mr-2">
                      <span className="text-xs font-medium mr-1">Your Restaurant</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary mx-1" />
                    <div className="bg-white px-2 py-1 rounded-md flex items-center">
                      <span className="text-xs font-medium mr-1">#1 on Google</span>
                      <BarChart3 className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Welcome Message Configuration */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 animate-bounce-slow">👋</div>
              <h3 className="text-xl font-bold">Welcome Message Configuration</h3>
              <p className="text-muted-foreground">Create a friendly greeting for your customers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea
                    id="welcome-message"
                    placeholder="Welcome to [Restaurant Name]! Type 'menu' to see our delicious options. 😋"
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Smile className="h-4 w-4 mr-2" />
                    Add Emoji 😊
                  </Button>
                  <Button variant="outline" size="sm">
                    Add Variable
                  </Button>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 flex items-start">
                  <div className="mr-2 text-xl">💡</div>
                  <p className="text-sm text-secondary-foreground">
                    <span className="font-medium">Tip:</span> Keep it friendly to ensure customers open your menu!
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-sm text-muted-foreground mb-2">Preview</div>
                <div className="w-[280px] h-[500px] bg-secondary rounded-[36px] p-3 shadow-lg relative">
                  <div className="absolute -top-4 -right-4 text-2xl animate-bounce">📱</div>
                  <div className="w-full h-full bg-white rounded-[32px] flex flex-col overflow-hidden">
                    <div className="bg-green-600 text-white p-3 text-center">
                      <p className="font-medium">WhatsApp</p>
                    </div>
                    <div className="flex-1 bg-[#e5ddd5] p-4 flex flex-col justify-end">
                      <div className="bg-white rounded-lg p-3 mb-2 ml-auto max-w-[80%] shadow-sm">
                        <p className="text-sm">menu</p>
                      </div>
                      <div className="bg-[#dcf8c6] rounded-lg p-3 mr-auto max-w-[80%] shadow-sm">
                        <p className="text-sm">
                          Welcome to Mario's Pizzeria! Type 'menu' to see our delicious options. 😋
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review Request Message Configuration - PROMINENT */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-6 bg-secondary py-6 rounded-lg border-2 border-primary relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=800')] bg-center bg-no-repeat opacity-5"></div>
              <div className="text-5xl mb-3 animate-pulse">🙏</div>
              <h3 className="text-xl font-bold">Review Request Message</h3>
              <p className="text-primary font-bold text-lg mt-2 animate-pulse">
                This message will help you collect up to 100 reviews monthly!
              </p>
              <div className="absolute top-2 right-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Tabs defaultValue="template1">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="template1" className="relative">
                      Template 1
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs px-1 rounded-full">
                        Best
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="template2">Template 2</TabsTrigger>
                    <TabsTrigger value="template3">Template 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="template1">
                    <Textarea
                      rows={6}
                      value="Hi there! Thanks for checking out our menu. We hope you enjoyed your meal! Would you mind taking a moment to share your experience with a quick review? It helps us a lot! [REVIEW_LINK]"
                    />
                    <div className="mt-1 text-xs text-right text-muted-foreground">
                      <span className="font-medium text-primary">93% conversion rate</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="template2">
                    <Textarea
                      rows={6}
                      value="Hello! We noticed you viewed our menu recently. If you visited us, we'd love to hear about your experience! A quick review would mean the world to us: [REVIEW_LINK] Thank you! 🙏"
                    />
                    <div className="mt-1 text-xs text-right text-muted-foreground">
                      <span className="font-medium text-primary">87% conversion rate</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="template3">
                    <Textarea
                      rows={6}
                      value="Thanks for checking out our menu! Did you get a chance to visit us? If so, we'd be grateful if you could leave us a quick review here: [REVIEW_LINK] Your feedback helps us improve! ⭐"
                    />
                    <div className="mt-1 text-xs text-right text-muted-foreground">
                      <span className="font-medium text-primary">82% conversion rate</span>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    When to send the review request
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue={2} className="w-20" />
                    <span className="text-sm text-muted-foreground">hours after menu view</span>
                    <div className="ml-2 text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                      Optimal timing!
                    </div>
                  </div>
                </div>

                <div className="bg-accent rounded-lg p-3 border border-primary/20">
                  <p className="text-sm font-medium flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    Tips for high conversion:
                  </p>
                  <ul className="text-sm text-accent-foreground list-disc pl-5 mt-1 space-y-1">
                    <li>Be friendly and appreciative</li>
                    <li>Keep it short and direct</li>
                    <li>Mention how reviews help your business</li>
                    <li>Include emojis for a personal touch</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-sm text-muted-foreground mb-2 flex items-center">
                  <span className="mr-1">Preview</span>
                  <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">A/B Testing Ready</span>
                </div>
                <div className="w-[280px] h-[500px] bg-secondary rounded-[36px] p-3 shadow-lg relative">
                  <div className="absolute -top-4 -right-4 text-2xl animate-bounce">📱</div>
                  <div className="w-full h-full bg-white rounded-[32px] flex flex-col overflow-hidden">
                    <div className="bg-green-600 text-white p-3 text-center">
                      <p className="font-medium">WhatsApp</p>
                    </div>
                    <div className="flex-1 bg-[#e5ddd5] p-4 flex flex-col justify-end">
                      <div className="bg-[#dcf8c6] rounded-lg p-3 mr-auto max-w-[80%] shadow-sm mb-2">
                        <p className="text-sm">
                          Hi there! Thanks for checking out our menu. We hope you enjoyed your meal! Would you mind
                          taking a moment to share your experience with a quick review? It helps us a lot!
                        </p>
                        <p className="text-sm text-primary underline mt-1">https://g.page/r/...</p>
                      </div>
                      <div className="text-xs text-center text-muted-foreground flex items-center justify-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Sent 2 hours after menu view
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-secondary/50 p-2 rounded-lg text-center w-full">
                  <p className="text-sm font-medium">
                    Expected conversion: <span className="text-primary">32%</span> of customers
                  </p>
                  <p className="text-xs text-muted-foreground">Based on 500+ restaurants' data</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Trigger Setup */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 animate-bounce-slow">🔑</div>
              <h3 className="text-xl font-bold">Trigger Setup</h3>
              <p className="text-muted-foreground">Set up the keyword that activates your menu</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trigger-word">Trigger Word</Label>
                <Input id="trigger-word" placeholder="e.g., menu, food, order" defaultValue="menu" />
                <p className="text-sm text-muted-foreground">This is the word customers will type to see your menu</p>
              </div>

              <div className="flex justify-center py-4">
                <div className="relative">
                  <div className="w-64 h-64 bg-secondary/70 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 bg-secondary rounded-full flex items-center justify-center">
                      <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center animate-pulse">
                        <div className="text-2xl font-bold">menu</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    Customer types
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    Menu appears
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 flex items-center">
                    <div className="bg-white p-1 rounded-full shadow-md">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="w-8 h-1 bg-primary"></div>
                  </div>
                  <div className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 flex items-center">
                    <div className="w-8 h-1 bg-primary"></div>
                    <div className="bg-white p-1 rounded-full shadow-md">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent rounded-lg p-4 flex items-start">
                <div className="mr-3 mt-1 text-xl">💡</div>
                <div>
                  <p className="font-medium">Keep it simple!</p>
                  <p className="text-sm text-accent-foreground">
                    Choose a simple, intuitive word that customers will naturally type when looking for your menu.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div className="bg-white px-2 py-1 rounded-full text-xs font-medium">menu</div>
                    <div className="bg-white px-2 py-1 rounded-full text-xs font-medium">food</div>
                    <div className="bg-white px-2 py-1 rounded-full text-xs font-medium">order</div>
                    <div className="bg-white px-2 py-1 rounded-full text-xs font-medium">eat</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Success/Completion */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 animate-bounce-slow">🎉</div>
              <h3 className="text-xl font-bold">You're All Set!</h3>
              <p className="text-muted-foreground">Your WhatsApp menu bot is ready to generate reviews</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-[url('/placeholder.svg?height=200&width=200')] bg-contain bg-no-repeat bg-center p-4 border-4 border-secondary rounded-lg animate-bounce-slow relative">
                <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
                <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse">✨</div>
              </div>
            </div>

            <Card className="border-primary/50 mb-4 overflow-hidden">
              <CardHeader className="bg-secondary pb-2">
                <CardTitle className="text-base flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Potential Review Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary mb-2 animate-pulse">100+</p>
                  <p className="text-sm text-muted-foreground">New reviews this month</p>
                </div>
                <div className="h-24 w-full mt-4 flex items-end justify-between px-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-4 bg-secondary rounded-t-sm"></div>
                    <p className="text-xs mt-1">Jan</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-4 bg-secondary rounded-t-sm"></div>
                    <p className="text-xs mt-1">Feb</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-4 bg-secondary rounded-t-sm"></div>
                    <p className="text-xs mt-1">Mar</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-20 w-4 bg-primary rounded-t-sm"></div>
                    <p className="text-xs mt-1">Apr</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-4 bg-primary rounded-t-sm animate-pulse"></div>
                    <p className="text-xs mt-1">May</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-32 w-4 bg-primary rounded-t-sm animate-pulse"></div>
                    <p className="text-xs mt-1">Jun</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Your QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-center">
                  <div className="w-full h-32 bg-[url('/placeholder.svg?height=200&width=200')] bg-contain bg-no-repeat bg-center relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></div>
                      <div className="relative inline-flex rounded-full h-12 w-12 bg-primary/20"></div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Google Search Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="border rounded p-3 shadow-sm">
                    <p className="text-blue-600 text-sm font-medium">Mario's Pizzeria - Best Pizza in Town</p>
                    <p className="text-green-700 text-xs">https://maps.google.com/...</p>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Rating: 4.8 · 100+ reviews</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Authentic Italian pizza, pasta, and more. Order online or visit us...
                    </p>
                  </div>
                  <div className="text-right mt-2">
                    <span className="text-xs text-primary font-medium flex items-center justify-end">
                      Future You! 🚀
                      <Sparkles className="h-3 w-3 ml-1 text-primary animate-pulse" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
              >
                Start Collecting Reviews Now!
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep} className="border-[#AF9B46] text-[#AF9B46] hover:bg-[#AF9B46]/10">
              Back
            </Button>
          )}
          {currentStep < totalSteps && (
            <Button onClick={nextStep} className="bg-[#F7B05B] hover:bg-[#F7B05B]/90 text-white">
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === totalSteps && (
            <Button className="bg-[#F7B05B] hover:bg-[#F7B05B]/90 text-white">
              Finish Setup <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

