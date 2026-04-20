import type { ElementType } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Heart, Wallet, Clock } from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: ElementType<{ className?: string }>;
  accent?: string;
}

interface ActivityItem {
  title: string;
  time: string;
  status: "success" | "info" | "warning";
}

const statCards: StatCard[] = [
  { title: "Orders", value: "3", description: "This month", icon: Package, accent: "bg-primary/10 text-primary" },
  { title: "Wishlist", value: "12", description: "Items saved", icon: Heart, accent: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-200" },
  { title: "Balance", value: "$0.00", description: "Available credits", icon: Wallet, accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200" },
];

const recentActivities: ActivityItem[] = [
  { title: "Order #1234 delivered", time: "2 days ago", status: "success" },
  { title: "Added keycap set to wishlist", time: "1 week ago", status: "info" },
  { title: "Password updated", time: "2 weeks ago", status: "warning" },
];

export default function AccountDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your account overview.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/account/orders">View orders</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/products">Shop now</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const StatIcon = card.icon;
          return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${card.accent}`}>{StatIcon ? <StatIcon className="h-4 w-4" /> : null}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest account events</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-4 w-4" />
              Updated
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => {
              const dotColor =
                activity.status === "success"
                  ? "bg-emerald-500"
                  : activity.status === "info"
                  ? "bg-blue-500"
                  : "bg-amber-500";
              return (
                <div key={activity.title} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                    <p className="font-medium">{activity.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-5">{activity.time}</p>
                  {index < recentActivities.length - 1 && <Separator className="mt-3" />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/account/addresses">Manage addresses</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/account/profile">Update profile</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/wishlist">View wishlist</Link>
            </Button>
            <Button asChild className="w-full justify-start">
              <Link to="/products">Discover products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
