"use client"

import { useState } from "react"
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
import { Star, Upload, Award, TrendingUp, ChevronRight, Check, Smartphone } from "lucide-react"

export function ConfigurationModal() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

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
        <Button size="lg" className="animate-bounce">
          Boost Your Reviews Now! 🚀
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Setup Your Review Generation System 🌟</DialogTitle>
          <DialogDescription>
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
                      ? "bg-primary text-primary-foreground"
                      : i + 1 < currentStep
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-secondary-foreground"
                  }`}
              >
                {i + 1 < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step 1: Restaurant Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🏠</div>
              <h3 className="text-xl font-bold">Restaurant Information</h3>
              <p className="text-muted-foreground">Let's get to know your restaurant!</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input id="restaurant-name" placeholder="e.g., Mario's Pizzeria" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurant-address">Restaurant Address</Label>
                <Input id="restaurant-address" placeholder="Start typing for Google Places suggestions..." />
              </div>

              <Card className="bg-secondary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Current Google Presence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[...Array(3)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                          {[...Array(2)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                        <span className="text-sm font-medium">3.0</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Based on 12 reviews</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">Let's boost this! 📈</p>
                      <p className="text-xs text-muted-foreground">Potential: 4.8 ⭐ with 100+ reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Menu Setup */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="text-xl font-bold">Menu Setup</h3>
              <p className="text-muted-foreground">Upload your menu or provide a link</p>
            </div>

            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer bg-accent">
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                <Upload className="h-10 w-10 text-accent-foreground" />
                <div className="text-center">
                  <p className="font-medium">Drag and drop your menu file</p>
                  <p className="text-sm text-accent-foreground">Or click to browse files</p>
                </div>
                <Button variant="outline" size="sm">
                  Upload Menu
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-xs text-center">
                <p className="text-sm text-muted-foreground mb-2">OR</p>
                <Input placeholder="Enter menu URL if you already have one" />
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-4 flex items-start">
              <div className="mr-3 mt-1 text-xl">💡</div>
              <div>
                <p className="font-medium">Every menu view = potential new review! 📈</p>
                <p className="text-sm text-secondary-foreground">
                  Customers who view your menu are 3x more likely to leave a review when prompted.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review Request Setup */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6 bg-secondary py-4 rounded-lg">
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="text-xl font-bold">Review Request Setup</h3>
              <p className="text-primary font-medium">THIS IS WHERE THE MAGIC HAPPENS!</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-review-link">Your Google Review Link</Label>
                <div className="relative">
                  <Input id="google-review-link" placeholder="https://g.page/r/..." />
                  <div className="absolute right-2 top-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="inline-block h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" />
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

              <Card className="border-primary/50">
                <CardHeader className="bg-accent pb-2">
                  <CardTitle className="text-base flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Potential Review Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-32 w-full bg-[url('/placeholder.svg?height=200&width=600')] bg-contain bg-no-repeat bg-center"></div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium">
                      Up to <span className="text-primary">100 new reviews</span> per month
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-secondary rounded-lg p-4 flex items-start">
                <div className="mr-3 mt-1 text-xl">🥇</div>
                <div>
                  <p className="font-medium">This is how you'll outrank competitors on Google!</p>
                  <p className="text-sm text-secondary-foreground">
                    Restaurants with 100+ reviews rank 25% higher in local search results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Welcome Message Configuration */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">👋</div>
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
                  <Button variant="outline" size="sm">
                    Add Emoji 😊
                  </Button>
                  <Button variant="outline" size="sm">
                    Add Variable
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tip: Keep it friendly to ensure customers open your menu!
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-sm text-muted-foreground mb-2">Preview</div>
                <div className="w-[280px] h-[500px] bg-secondary rounded-[36px] p-3 shadow-lg">
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

        {/* Step 5: Review Request Message Configuration */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-6 bg-secondary py-4 rounded-lg">
              <div className="text-4xl mb-2">🙏</div>
              <h3 className="text-xl font-bold">Review Request Message</h3>
              <p className="text-primary font-medium">This message will help you collect up to 100 reviews monthly!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Tabs defaultValue="template1">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="template1">Template 1</TabsTrigger>
                    <TabsTrigger value="template2">Template 2</TabsTrigger>
                    <TabsTrigger value="template3">Template 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="template1">
                    <Textarea
                      rows={6}
                      value="Hi there! Thanks for checking out our menu. We hope you enjoyed your meal! Would you mind taking a moment to share your experience with a quick review? It helps us a lot! [REVIEW_LINK]"
                    />
                  </TabsContent>
                  <TabsContent value="template2">
                    <Textarea
                      rows={6}
                      value="Hello! We noticed you viewed our menu recently. If you visited us, we'd love to hear about your experience! A quick review would mean the world to us: [REVIEW_LINK] Thank you! 🙏"
                    />
                  </TabsContent>
                  <TabsContent value="template3">
                    <Textarea
                      rows={6}
                      value="Thanks for checking out our menu! Did you get a chance to visit us? If so, we'd be grateful if you could leave us a quick review here: [REVIEW_LINK] Your feedback helps us improve! ⭐"
                    />
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label>When to send the review request</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue={2} className="w-20" />
                    <span className="text-sm text-muted-foreground">hours after menu view</span>
                  </div>
                </div>

                <div className="bg-accent rounded-lg p-3">
                  <p className="text-sm font-medium">Tips for high conversion:</p>
                  <ul className="text-sm text-accent-foreground list-disc pl-5 mt-1 space-y-1">
                    <li>Be friendly and appreciative</li>
                    <li>Keep it short and direct</li>
                    <li>Mention how reviews help your business</li>
                    <li>Include emojis for a personal touch</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-sm text-muted-foreground mb-2">Preview</div>
                <div className="w-[280px] h-[500px] bg-secondary rounded-[36px] p-3 shadow-lg">
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
                      <div className="text-xs text-center text-muted-foreground">Sent 2 hours after menu view</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Trigger Setup */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🔑</div>
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
                      <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center">
                        <div className="text-2xl font-bold">menu</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full text-sm font-medium">
                    Customer types
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-3 py-1 rounded-full text-sm font-medium">
                    Menu appears
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Success/Completion */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold">You're All Set!</h3>
              <p className="text-muted-foreground">Your WhatsApp menu bot is ready to generate reviews</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-[url('/placeholder.svg?height=200&width=200')] bg-contain bg-no-repeat bg-center p-4 border-4 border-secondary rounded-lg animate-bounce-slow"></div>
            </div>

            <Card className="border-primary/50 mb-4">
              <CardHeader className="bg-secondary pb-2">
                <CardTitle className="text-base">Potential Review Growth</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary mb-2">100+</p>
                  <p className="text-sm text-muted-foreground">New reviews this month</p>
                </div>
                <div className="h-24 w-full bg-[url('/placeholder.svg?height=150&width=600')] bg-contain bg-no-repeat bg-center mt-4"></div>
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
                  <div className="w-full h-32 bg-[url('/placeholder.svg?height=200&width=200')] bg-contain bg-no-repeat bg-center"></div>
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
                  <div className="border rounded p-3">
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
                    <span className="text-xs text-primary font-medium">Future You! 🚀</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-6">
              <Button size="lg" className="w-full md:w-auto">
                Start Collecting Reviews Now!
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setOpen(false)}>Finish</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

