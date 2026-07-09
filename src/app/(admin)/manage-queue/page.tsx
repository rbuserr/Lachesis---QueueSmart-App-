"use client";

import { useState } from "react";

import {
  Search,
  Users,
  Clock3,
  CircleAlert,
  ArrowUp,
  ArrowDown,
  Trash2,
  Play,
} from "lucide-react";
  import Image from "next/image";
  import SnakeLogo from "@/components/ui/snake-logo.png";
import AdminNavbar from "@/components/admin/admin-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type QueueUser = {
  id: number;
  trader: string;
  service: string;
  joined: string;
  priority: "Low" | "Medium" | "High";
};

export default function QueueManagementPage() {

  const [selectedService, setSelectedService] = useState("All");
  const [search, setSearch] = useState("");

  const [queue, setQueue] = useState<QueueUser[]>([
    {
      id: 1,
      trader: "Alex Morgan",
      service: "General Account Inquiry",
      joined: "9:10 AM",
      priority: "Low",
    },
    {
      id: 2,
      trader: "Sarah Chen",
      service: "Evaluation Phase Verification",
      joined: "9:18 AM",
      priority: "Medium",
    },
    {
      id: 3,
      trader: "David Kim",
      service: "Live Trade / Platform Execution Issue",
      joined: "9:20 AM",
      priority: "High",
    },
    {
      id: 4,
      trader: "Emma Rodriguez",
      service: "Evaluation Phase Verification",
      joined: "9:27 AM",
      priority: "Medium",
    },
  ]);

  const filteredQueue = queue.filter((user) => {

    const matchesService =
      selectedService === "All" ||
      user.service === selectedService;

    const matchesSearch =
      user.trader.toLowerCase().includes(search.toLowerCase());

    return matchesService && matchesSearch;

  });

  const serveNext = () => {
    if (queue.length === 0) return;
    setQueue(queue.slice(1));
  };

  const removeUser = (id: number) => {
    setQueue(queue.filter((user) => user.id !== id));
  };

  const moveUp = (index: number) => {

    if (index === 0) return;

    const updated = [...queue];

    [updated[index], updated[index - 1]] =
      [updated[index - 1], updated[index]];

    setQueue(updated);

  };

  const moveDown = (index: number) => {

    if (index === queue.length - 1) return;

    const updated = [...queue];

    [updated[index], updated[index + 1]] =
      [updated[index + 1], updated[index]];

    setQueue(updated);

  };

  return (
    <>
     <AdminNavbar />
     <main className="min-h-screen bg-background p-8">
  
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

        <div>

          <h1 className="text-4xl font-bold">
            Queue Management
          </h1>

          <p className="text-muted-foreground mt-2">
            Monitor and manage traders waiting for support.
          </p>

        </div>

        <div className="relative">

          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>

          <Input
            placeholder="Search trader..."
            className="pl-10 w-72"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-3">

        <Card className="hover:shadow-lg transition-all">

          <CardHeader className="flex flex-row justify-between">

            <CardTitle>Waiting Traders</CardTitle>

            <Users className="h-5 w-5 text-primary"/>

          </CardHeader>

          <CardContent>

            <h2 className="text-4xl font-bold">
              {queue.length}
            </h2>

          </CardContent>

        </Card>

        <Card className="hover:shadow-lg transition-all">

          <CardHeader className="flex flex-row justify-between">

            <CardTitle>Average Wait</CardTitle>

            <Clock3 className="h-5 w-5 text-primary"/>

          </CardHeader>

          <CardContent>

            <h2 className="text-4xl font-bold">
              13 min
            </h2>

          </CardContent>

        </Card>

        <Card className="hover:shadow-lg transition-all">

          <CardHeader className="flex flex-row justify-between">

            <CardTitle>High Priority</CardTitle>

            <CircleAlert className="h-5 w-5 text-red-500"/>

          </CardHeader>

          <CardContent>

            <h2 className="text-4xl font-bold">

              {
                queue.filter(
                  (q)=>q.priority==="High"
                ).length
              }

            </h2>

          </CardContent>

        </Card>

      </div>

      <Card>

        <CardHeader className="flex flex-row justify-between items-center">

          <CardTitle>
            Active Queue
          </CardTitle>

          <div className="flex gap-3">

            <Select
              value={selectedService}
              onValueChange={setSelectedService}
            >

              <SelectTrigger className="w-72">

                <SelectValue/>

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="All">
                  All Services
                </SelectItem>

                <SelectItem value="General Account Inquiry">
                  General Account Inquiry
                </SelectItem>

                <SelectItem value="Evaluation Phase Verification">
                  Evaluation Phase Verification
                </SelectItem>

                <SelectItem value="Live Trade / Platform Execution Issue">
                  Live Trade / Platform Execution Issue
                </SelectItem>

              </SelectContent>

            </Select>

            <Button onClick={serveNext}>

              <Play className="mr-2 h-4 w-4"/>

              Serve Next

            </Button>

          </div>

        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>#</TableHead>

                <TableHead>Trader</TableHead>

                <TableHead>Service</TableHead>

                <TableHead>Joined</TableHead>

                <TableHead>Status</TableHead>

                <TableHead>Priority</TableHead>

                <TableHead>Actions</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>
                        {filteredQueue.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No traders are currently waiting in this queue.
                </TableCell>

              </TableRow>

            ) : (

              filteredQueue.map((user, index) => (

                <TableRow
                  key={user.id}
                  className="hover:bg-muted/40 transition-colors"
                >

                  <TableCell className="font-medium">
                    #{index + 1}
                  </TableCell>

                  <TableCell>
                    {user.trader}
                  </TableCell>

                  <TableCell>
                    {user.service}
                  </TableCell>

                  <TableCell>
                    {user.joined}
                  </TableCell>

                  <TableCell>

                    <Badge variant="outline">
                      Waiting
                    </Badge>

                  </TableCell>

                  <TableCell>

                    <Badge
                      variant={
                        user.priority === "High"
                          ? "destructive"
                          : user.priority === "Medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.priority}
                    </Badge>

                  </TableCell>

                  <TableCell>

                    <div className="flex gap-2">

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => moveUp(index)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => moveDown(index)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => removeUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </div>

                  </TableCell>

                </TableRow>

              ))

            )}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

      <footer>

          <div className="mt-10 border-t pt-5 text-center text-1xl font-bold text-muted-foreground flex items-center justify-center gap-2">
            QueueSmart Administrator Portal • Version 1.0

            <Image
              src={SnakeLogo}
              alt="QueueSmart Logo"
              width={40}
              height={40}
              className="object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>
        </footer>

    </main>
    </>
  );
}