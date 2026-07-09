"use client";

import { useState } from "react";

import {
  Search,
  ClipboardList,
  Timer,
  TriangleAlert,
  Plus,
} from "lucide-react";
  import Image from "next/image";
  import SnakeLogo from "@/components/ui/snake-logo.png";
import AdminNavbar from "@/components/admin/admin-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

type Service = {
  id: number;
  name: string;
  description: string;
  duration: number;
  priority: "Low" | "Medium" | "High";
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "General Account Inquiry",
      description: "General questions regarding trader accounts.",
      duration: 10,
      priority: "Low",
    },
    {
      id: 2,
      name: "Evaluation Phase Verification",
      description: "Review and verify evaluation phase progress.",
      duration: 25,
      priority: "Medium",
    },
    {
      id: 3,
      name: "Live Trade / Platform Execution Issue",
      description: "Urgent support for live platform issues.",
      duration: 5,
      priority: "High",
    },
  ]);

  const [search, setSearch] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [priority, setPriority] =
    useState<"Low" | "Medium" | "High">("Low");

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    duration: "",
  });

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      duration: "",
    };

    let valid = true;

    if (!serviceName.trim()) {
      newErrors.name = "Service name is required.";
      valid = false;
    } else if (serviceName.length > 100) {
      newErrors.name =
        "Maximum length is 100 characters.";
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description =
        "Description is required.";
      valid = false;
    }

    if (!duration) {
      newErrors.duration =
        "Expected duration is required.";
      valid = false;
    } else if (Number(duration) <= 0) {
      newErrors.duration =
        "Duration must be greater than zero.";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const addService = () => {
    if (!validateForm()) return;

    setServices([
      ...services,
      {
        id: Date.now(),
        name: serviceName,
        description,
        duration: Number(duration),
        priority,
      },
    ]);

    setServiceName("");
    setDescription("");
    setDuration("");
    setPriority("Low");

    setErrors({
      name: "",
      description: "",
      duration: "",
    });
  };

  return (
    <>
      <AdminNavbar />
      <main className="min-h-screen bg-background p-8">
  

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

        <div>

          <h1 className="text-4xl font-bold">
            Service Management
          </h1>

          <p className="text-muted-foreground mt-2">
            Create and manage QueueSmart support services.
          </p>

        </div>

        <div className="relative">

          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search services..."
            className="pl-10 w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>


      <div className="grid gap-6 md:grid-cols-3">

        <Card className="hover:shadow-lg transition-all">

          <CardHeader className="flex flex-row justify-between items-center">

            <CardTitle>Total Services</CardTitle>

            <ClipboardList className="h-5 w-5 text-primary" />

          </CardHeader>

          <CardContent>

            <h2 className="text-4xl font-bold">
              {services.length}
            </h2>

          </CardContent>

        </Card>

        <Card className="hover:shadow-lg transition-all">

          <CardHeader className="flex flex-row justify-between items-center">

            <CardTitle>High Priority</CardTitle>

            <TriangleAlert className="h-5 w-5 text-red-500" />

          </CardHeader>

          <CardContent>

            <h2 className="text-4xl font-bold">
              {
                services.filter(
                  (s) => s.priority === "High"
                ).length
              }
            </h2>

          </CardContent>

        </Card>

        <Card className="hover:shadow-lg transition-all">

          <CardHeader className="flex flex-row justify-between items-center">

            <CardTitle>Average Duration</CardTitle>

            <Timer className="h-5 w-5 text-primary" />

          </CardHeader>

          <CardContent>

            <h2 className="text-4xl font-bold">
              {Math.round(
                services.reduce(
                  (sum, s) => sum + s.duration,
                  0
                ) / services.length
              )} min
            </h2>

          </CardContent>

        </Card>

      </div>

      <Card>

        <CardHeader className="flex flex-row justify-between items-center">

          <CardTitle>
            Services
          </CardTitle>

          <Dialog>

            <DialogTrigger asChild>

              <Button>

                <Plus className="mr-2 h-4 w-4" />

                Add Service

              </Button>

            </DialogTrigger>

            <DialogContent>

              <DialogHeader>

                <DialogTitle>
                  Create Service
                </DialogTitle>

              </DialogHeader>

              <div className="space-y-5">
                              <div>

                  <label className="text-sm font-medium">
                    Service Name *
                  </label>

                  <Input
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    maxLength={100}
                    placeholder="Enter service name"
                    className="mt-2"
                  />

                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">

                    <span>{errors.name}</span>

                    <span>{serviceName.length} / 100</span>

                  </div>

                </div>

                <div>

                  <label className="text-sm font-medium">
                    Description *
                  </label>

                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter service description"
                    className="mt-2"
                  />

                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description}
                    </p>
                  )}

                </div>

                <div>

                  <label className="text-sm font-medium">
                    Expected Duration (minutes) *
                  </label>

                  <Input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="10"
                    className="mt-2"
                  />

                  {errors.duration && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.duration}
                    </p>
                  )}

                </div>

                <div>

                  <label className="text-sm font-medium">
                    Priority *
                  </label>

                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setPriority(
                        value as "Low" | "Medium" | "High"
                      )
                    }
                  >

                    <SelectTrigger className="mt-2">

                      <SelectValue />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="Low">
                        Low
                      </SelectItem>

                      <SelectItem value="Medium">
                        Medium
                      </SelectItem>

                      <SelectItem value="High">
                        High
                      </SelectItem>

                    </SelectContent>

                  </Select>

                </div>

                <Button
                  className="w-full"
                  onClick={addService}
                >
                  Save Service
                </Button>

              </div>

            </DialogContent>

          </Dialog>

        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Service</TableHead>

                <TableHead>Description</TableHead>

                <TableHead>Duration</TableHead>

                <TableHead>Priority</TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>
                        {filteredServices.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  No services found.
                </TableCell>

              </TableRow>

            ) : (

              filteredServices.map((service) => (

                <TableRow
                  key={service.id}
                  className="hover:bg-muted/40 transition-colors"
                >

                  <TableCell className="font-medium">
                    {service.name}
                  </TableCell>

                  <TableCell className="max-w-sm">
                    {service.description}
                  </TableCell>

                  <TableCell>
                    {service.duration} mins
                  </TableCell>

                  <TableCell>

                    <Badge
                      variant={
                        service.priority === "High"
                          ? "destructive"
                          : service.priority === "Medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {service.priority}
                    </Badge>

                  </TableCell>

                  <TableCell>

                    <div className="flex justify-end gap-2">

                      <Button
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setServices(
                            services.filter(
                              (s) => s.id !== service.id
                            )
                          )
                        }
                      >
                        Delete
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