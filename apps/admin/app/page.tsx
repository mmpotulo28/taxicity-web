"use client";

import { Card, CardBody, CardHeader, Button, Avatar, Progress } from "@heroui/react";
import { Users, Car, Map as MapIcon, DollarSign, TrendingUp, MoreVertical, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
 {
  title: "Total Drivers",
  value: "1,234",
  change: "+12.5%",
  trend: "up",
  icon: Car,
  className: "bg-blue-500/10 text-blue-500",
 },
 {
  title: "Total Passengers",
  value: "45.2k",
  change: "+5.2%",
  trend: "up",
  icon: Users,
  className: "bg-purple-500/10 text-purple-500",
 },
 {
  title: "Active Trips",
  value: "342",
  change: "+18.2%",
  trend: "up",
  icon: MapIcon,
  className: "bg-success-500/10 text-success-500",
 },
 {
  title: "Total Revenue",
  value: "R 1.2M",
  change: "+8.1%",
  trend: "up",
  icon: DollarSign,
  className: "bg-warning-500/10 text-warning-500",
 },
];

export default function AdminPage() {
 return (
  <div className="space-y-6">
   {/* Page Header */}
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
     <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
     <p className="text-default-500 text-sm">Welcome back, here&apos;s what&apos;s happening with your fleet today.</p>
    </div>
    <div className="flex items-center gap-2">
     <Button color="primary" endContent={<Plus size={16} />}>New Driver</Button>
     <Button variant="flat" isIconOnly><MoreVertical size={20} /></Button>
    </div>
   </div>

   {/* Stats Grid */}
   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {stats.map((stat, index) => (
     <motion.div
      key={stat.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
     >
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
       <CardBody className="gap-4 p-6">
        <div className="flex items-start justify-between">
         <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-default-500">{stat.title}</span>
          <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
         </div>
         <div className={`rounded-xl p-2.5 ${stat.className}`}>
          <stat.icon className="h-5 w-5" />
         </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
         <span className="flex items-center gap-1 font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
          <TrendingUp className="h-3 w-3" />
          {stat.change}
         </span>
         <span className="text-default-400">vs last month</span>
        </div>
       </CardBody>
      </Card>
     </motion.div>
    ))}
   </div>

   {/* Main Content Grid */}
   <div className="grid gap-6 md:grid-cols-7">

    {/* Revenue/Activity Chart Area */}
    <Card className="col-span-4 border-none shadow-sm md:col-span-4 min-h-[400px]">
     <CardHeader className="flex justify-between px-6 pt-6">
      <div>
       <h4 className="font-bold text-lg">Live Fleet Activity</h4>
       <p className="text-small text-default-500">Real-time trips and driver status</p>
      </div>
      <Button size="sm" variant="light" color="primary" endContent={<ArrowRight size={16} />}>View Map</Button>
     </CardHeader>
     <CardBody className="flex items-center justify-center">
      {/* Placeholder for Map or Chart */}
      <div className="flex flex-col items-center gap-4 text-default-300">
       <MapIcon size={48} />
       <p>Interactive Map Component Loading...</p>
      </div>
     </CardBody>
    </Card>

    {/* Top Drivers / Sidebar Content */}
    <Card className="col-span-3 border-none shadow-sm md:col-span-3">
     <CardHeader className="px-6 pt-6 pb-0">
      <h4 className="font-bold text-lg">Top Performing Drivers</h4>
     </CardHeader>
     <CardBody className="px-4 py-4">
      <div className="space-y-4">
       {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="group flex items-center justify-between p-2 rounded-xl hover:bg-default-50 transition-colors cursor-pointer">
         <div className="flex items-center gap-3">
          <Avatar
           src={`https://i.pravatar.cc/150?u=driver${i}`}
           className="transition-transform group-hover:scale-105"
           isBordered
          />
          <div>
           <p className="font-semibold text-sm">Driver {i}</p>
           <div className="flex items-center gap-1">
            <span className="text-warning-500 text-xs">★</span>
            <p className="text-xs text-default-500">4.9 • 156 trips</p>
           </div>
          </div>
         </div>
         <div className="flex flex-col items-end gap-1">
          <p className="font-semibold text-small text-success">R 4,250</p>
          <p className="text-[10px] text-default-400">This week</p>
         </div>
        </div>
       ))}
      </div>
      <Button className="w-full mt-4" variant="flat" size="sm">View All Drivers</Button>
     </CardBody>
    </Card>
   </div>

   {/* Quick Stats Row */}
   <div className="grid gap-4 md:grid-cols-3">
    <Card className="shadow-sm border-none bg-primary text-primary-foreground">
     <CardBody className="p-6">
      <div className="flex justify-between items-start">
       <div className="flex flex-col gap-2">
        <p className="font-medium opacity-90">Pending Approvals</p>
        <h3 className="text-3xl font-bold">12</h3>
        <Button size="sm" className="bg-white/20 backdrop-blur-md text-white border-white/20 w-fit mt-2">Review Now</Button>
       </div>
       <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
        <Users className="h-6 w-6" />
       </div>
      </div>
     </CardBody>
    </Card>

    <Card className="shadow-sm border-none">
     <CardBody className="p-6">
      <div className="flex flex-col gap-4">
       <div className="flex justify-between items-center">
        <p className="font-semibold">Fleet Utilization</p>
        <span className="text-success font-bold">85%</span>
       </div>
       <Progress value={85} color="success" className="h-2" />
       <p className="text-xs text-default-500">42 vehicles currently efficient</p>
      </div>
     </CardBody>
    </Card>

    <Card className="shadow-sm border-none">
     <CardBody className="p-6">
      <div className="flex flex-col gap-4">
       <div className="flex justify-between items-center">
        <p className="font-semibold">Support Tickets</p>
        <span className="text-danger font-bold">5 Open</span>
       </div>
       <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
         <span className="text-default-500">Urgent</span>
         <span className="font-medium">2</span>
        </div>
        <Progress value={40} color="danger" className="h-1" />
       </div>
       <Button size="sm" variant="light" className="self-end h-8">View Support</Button>
      </div>
     </CardBody>
    </Card>
   </div>
  </div>
 );
}
