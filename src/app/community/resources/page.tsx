"use client"

import { useEffect, useState } from "react"
import { BookOpen, ExternalLink } from "lucide-react"

interface Resource {
  id: string
  title: string
  description: string | null
  url: string
  category: string | null
  order: number
}

export default function CommunityResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchResources()
    const interval = setInterval(fetchResources, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/community/resources")
      if (res.ok) {
        const data = await res.json()
        setResources(data)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories
  const categories = Array.from(
    new Set(resources.map((r) => r.category).filter(Boolean))
  ) as string[]

  // Filter resources by category
  const filteredResources = selectedCategory
    ? resources.filter((r) => r.category === selectedCategory)
    : resources

  // Group resources by category
  const groupedResources = filteredResources.reduce(
    (acc, resource) => {
      const category = resource.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(resource)
      return acc
    },
    {} as Record<string, Resource[]>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-600 mt-2">
          Helpful resources and links for the AVFY community
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === null
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === category
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {Object.keys(groupedResources).length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No resources available at this time.</p>
          <p className="text-sm text-gray-500 mt-2">Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedResources).map(([category, categoryResources]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      Visit Resource
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
