"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Star } from "lucide-react"
import { useState, useEffect } from "react"

export function AnalyticsDashboard() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <section id="analytics" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-64"></div>
            <div className="h-6 bg-muted rounded w-96"></div>
          </div>
        </div>
      </section>
    )
  }

  const metrics = [
    {
      label: "Total Revenue",
      value: "$287,450",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: "Occupancy Rate",
      value: "78%",
      change: "+5.2%",
      trend: "up",
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      label: "Avg. Guest Rating",
      value: "4.8",
      change: "+0.3",
      trend: "up",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      label: "Total Bookings",
      value: "342",
      change: "-2.1%",
      trend: "down",
      icon: Users,
      color: "text-purple-500",
    },
  ]

  const performanceData = [
    { month: "Jan", revenue: 22000, occupancy: 72, bookings: 28 },
    { month: "Feb", revenue: 24500, occupancy: 75, bookings: 30 },
    { month: "Mar", revenue: 26800, occupancy: 78, bookings: 32 },
    { month: "Apr", revenue: 23200, occupancy: 70, bookings: 29 },
    { month: "May", revenue: 21500, occupancy: 68, bookings: 27 },
    { month: "Jun", revenue: 19800, occupancy: 62, bookings: 24 },
    { month: "Jul", revenue: 18200, occupancy: 58, bookings: 22 },
    { month: "Aug", revenue: 20100, occupancy: 65, bookings: 25 },
    { month: "Sep", revenue: 23800, occupancy: 73, bookings: 30 },
    { month: "Oct", revenue: 26200, occupancy: 76, bookings: 31 },
    { month: "Nov", revenue: 27900, occupancy: 80, bookings: 33 },
    { month: "Dec", revenue: 29500, occupancy: 85, bookings: 35 },
  ]

  return (
    <section id="analytics" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Performance Analytics</h2>
          <p className="text-xl text-muted-foreground max-w-3xl text-balance">
            Real-time insights into your property's performance across key metrics
          </p>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2 rounded-lg bg-muted", metric.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        metric.trend === "up" ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{metric.label}</h3>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">12-Month Performance</h3>
                <p className="text-muted-foreground">Revenue, occupancy, and booking trends</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">Occupancy</span>
                </div>
              </div>
            </div>

            <div className="relative h-96 w-full">
              <svg className="w-full h-full" viewBox="0 0 900 400">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <line
                    key={i}
                    x1="80"
                    y1={350 - i * 50}
                    x2="850"
                    y2={350 - i * 50}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border opacity-30"
                  />
                ))}

                {/* Y-axis labels */}
                {[0, 5000, 10000, 15000, 20000, 25000, 30000].map((value, i) => (
                  <text
                    key={i}
                    x="70"
                    y={355 - i * 50}
                    className="text-xs fill-current text-muted-foreground"
                    textAnchor="end"
                  >
                    ${value / 1000}k
                  </text>
                ))}

                {/* X-axis labels */}
                {performanceData.map((data, index) => (
                  <text
                    key={data.month}
                    x={100 + index * 60}
                    y="380"
                    className="text-xs fill-current text-muted-foreground"
                    textAnchor="middle"
                  >
                    {data.month}
                  </text>
                ))}

                {/* Revenue line */}
                <path
                  d={(() => {
                    const points = performanceData.map((data, index) => ({
                      x: 100 + index * 60,
                      y: 350 - (data.revenue / 30000) * 300,
                    }))

                    let path = `M ${points[0].x} ${points[0].y}`
                    for (let i = 1; i < points.length; i++) {
                      const prev = points[i - 1]
                      const curr = points[i]
                      const next = points[i + 1] || curr
                      const prevPrev = points[i - 2] || prev

                      const tension = 0.3
                      const cp1x = prev.x + (curr.x - prevPrev.x) * tension
                      const cp1y = prev.y + (curr.y - prevPrev.y) * tension
                      const cp2x = curr.x - (next.x - prev.x) * tension
                      const cp2y = curr.y - (next.y - prev.y) * tension

                      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
                    }
                    return path
                  })()}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />

                {/* Revenue points */}
                {performanceData.map((data, index) => (
                  <circle
                    key={`revenue-${index}`}
                    cx={100 + index * 60}
                    cy={350 - (data.revenue / 30000) * 300}
                    r="5"
                    fill="#3b82f6"
                    className="cursor-pointer hover:r-7 transition-all"
                  />
                ))}

                {/* Axes */}
                <line
                  x1="80"
                  y1="50"
                  x2="80"
                  y2="350"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-foreground"
                />
                <line
                  x1="80"
                  y1="350"
                  x2="850"
                  y2="350"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-foreground"
                />
              </svg>
            </div>
          </Card>
        </motion.div>

        {/* Market Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Market Position</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Your Property</p>
                <p className="text-4xl font-bold text-primary mb-1">$287k</p>
                <p className="text-sm text-green-500 font-medium">Top 15%</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Market Average</p>
                <p className="text-4xl font-bold text-foreground mb-1">$215k</p>
                <p className="text-sm text-muted-foreground font-medium">Baseline</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Top Performer</p>
                <p className="text-4xl font-bold text-foreground mb-1">$342k</p>
                <p className="text-sm text-muted-foreground font-medium">Top 5%</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
