"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Toaster } from "@/components/ui/sonner"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ActionCards } from "@/components/action-cards"
import { toast } from "sonner"
import { 
  Bell, 
  Settings, 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2
} from "lucide-react"

export default function ShadcnDemo() {
  const [progress, setProgress] = useState(33)
  const [switchState, setSwitchState] = useState(false)
  const [checkboxState, setCheckboxState] = useState(false)

  const handleToast = () => {
    toast.success("Woohoo! This is a toast notification!", {
      description: "Your action was completed successfully.",
    })
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="container mx-auto max-w-6xl">
          <SiteHeader />

          {/* Component Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            
            {/* Buttons & Actions Card */}
            <Card className="h-fit">
                             <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Bell className="w-5 h-5" />
                   Buttons & Actions
                 </CardTitle>
                <CardDescription>
                  Various button styles and interactive elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button onClick={handleToast}>
                    <Bell className="w-4 h-4 mr-2" />
                    Show Toast
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Authentication
                </CardTitle>
                <CardDescription>
                  Login and signup functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="default" className="w-full" asChild>
                    <a href="/login">Login</a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/login">Sign Up</a>
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email authentication
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Secure login system
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forms & Inputs Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Forms & Inputs
                </CardTitle>
                <CardDescription>
                  Input fields and form controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Enter your name" />
                <Textarea placeholder="Tell us about yourself..." />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue</SelectItem>
                    <SelectItem value="angular">Angular</SelectItem>
                    <SelectItem value="svelte">Svelte</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={checkboxState}
                    onCheckedChange={(checked) => setCheckboxState(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm">
                    Accept terms and conditions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notifications"
                    checked={switchState}
                    onCheckedChange={setSwitchState}
                  />
                  <label htmlFor="notifications" className="text-sm">
                    Enable notifications
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Progress & Status Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Progress & Status
                </CardTitle>
                <CardDescription>
                  Progress indicators and status displays
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setProgress(Math.min(100, progress + 10))}
                    >
                      +10%
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setProgress(Math.max(0, progress - 10))}
                    >
                      -10%
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Status Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Error</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dialogs & Overlays Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Dialogs & Overlays
                </CardTitle>
                <CardDescription>
                  Modal dialogs and overlay components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Open Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                                                 Make changes to your profile here. Click save when you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input placeholder="Your name" />
                      <Textarea placeholder="Bio" />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Open Sheet
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Navigation Menu</SheetTitle>
                      <SheetDescription>
                        Quick access to important features
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-2">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Options Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>

            {/* Navigation & Content Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Navigation & Content
                </CardTitle>
                <CardDescription>
                  Tabs, accordions, and content organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>
                                     <TabsContent value="overview" className="space-y-2">
                     <h4 className="text-sm font-medium">Overview</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-300">
                       Dashboard overview with key metrics and insights.
                     </p>
                   </TabsContent>
                   <TabsContent value="analytics" className="space-y-2">
                     <h4 className="text-sm font-medium">Analytics</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-300">
                       Detailed analytics and performance data.
                     </p>
                   </TabsContent>
                   <TabsContent value="reports" className="space-y-2">
                     <h4 className="text-sm font-medium">Reports</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-300">
                       Generate and download comprehensive reports.
                     </p>
                   </TabsContent>
                </Tabs>

                <Separator className="my-4" />

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Getting Started</AccordionTrigger>
                    <AccordionContent>
                      Learn the basics of using our platform with step-by-step guides.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Advanced Features</AccordionTrigger>
                    <AccordionContent>
                      Explore powerful features for advanced users and teams.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Integrations</AccordionTrigger>
                    <AccordionContent>
                      Connect with your favorite tools and services.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

                    <ActionCards />
          <SiteFooter />
        </div>
      </div>
      <Toaster />
    </>
  )
}
