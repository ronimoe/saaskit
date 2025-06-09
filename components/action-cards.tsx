import { Card, CardContent } from "@/components/ui/card"
import { Download, Upload, Star, Heart } from "lucide-react"

export function ActionCards() {
  const actions = [
    {
      icon: Download,
      title: "Download",
      description: "Export your data",
      color: "text-blue-600"
    },
    {
      icon: Upload,
      title: "Upload",
      description: "Import new files",
      color: "text-green-600"
    },
    {
      icon: Star,
      title: "Favorites",
      description: "Saved items",
      color: "text-yellow-600"
    },
    {
      icon: Heart,
      title: "Liked",
      description: "Your preferences",
      color: "text-red-600"
    }
  ]

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.title} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${action.color}`} />
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{action.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
} 