"use client";

import { useEffect, useState } from "react";

import {
  Search,
  ClipboardList,
  Timer,
  TriangleAlert,
  Plus,
} from "lucide-react";
import Image from "next/image";
import SnakeLogo from "@/components/ui/snake-logo.png";
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

import { serviceManager, Service, Priority } from "@/app/modules/service-management/service-management";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(serviceManager.getServices());

  // keeps local state synced with the service manager
  useEffect(() => {
    const unsubscribe = serviceManager.subscribe(() => {
      setServices(serviceManager.getServices());
    });
    return unsubscribe;
  }, []);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [priority, setPriority] = useState<Priority>("Low");

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    duration: "",
    form: "",
  });

  // narrows the service list down by search text
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  // clears the create/edit form fields and errors
  const resetForm = () => {
    setServiceName("");
    setDescription("");
    setDuration("");
    setPriority("Low");
    setEditingId(null);
    setErrors({ name: "", description: "", duration: "", form: "" });
  };

  // resets the form and opens the dialog for a new service
  const openCreateDialog = () => {
    resetForm();
    setOpen(true);
  };

  // preloads the form with an existing service's data for editing
  const openEditDialog = (service: Service) => {
    setEditingId(service.id);
    setServiceName(service.name);
    setDescription(service.description);
    setDuration(service.expectedDuration.toString());
    setPriority(service.priority);
    setErrors({ name: "", description: "", duration: "", form: "" });
    setOpen(true);
  };

  // checks form fields and sets per-field error messages
  const validateForm = () => {
    const newErrors = { name: "", description: "", duration: "", form: "" };

    let valid = true;

    if (!serviceName.trim()) {
      newErrors.name = "Service name is required.";
      valid = false;
    } else if (serviceName.length > 100) {
      newErrors.name = "Maximum length is 100 characters.";
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description is required.";
      valid = false;
    }

    if (!duration) {
      newErrors.duration = "Expected duration is required.";
      valid = false;
    } else if (Number(duration) <= 0) {
      newErrors.duration = "Duration must be greater than zero.";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  // creates a new service or updates the one being edited
  const saveService = () => {
    if (!validateForm()) return;

    const payload = {
      name: serviceName,
      description,
      expectedDuration: Number(duration),
      priority,
    };

    try {
      if (editingId !== null) {
        serviceManager.updateService(editingId, payload);
      } else {
        serviceManager.createService(payload);
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err instanceof Error ? err.message : "Something went wrong.",
      }));
    }
  };

  // removes a service by id
  const deleteService = (id: number) => {
    serviceManager.deleteService(id);
  };

  // flips a service between open and closed
  const toggleStatus = (id: number) => {
    serviceManager.toggleServiceStatus(id);
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
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

      {/* top row summary stats for services */}
      <div className="grid gap-6 md:grid-cols-3">

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-base">Total Services</CardTitle>
            <ClipboardList className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">{services.length}</h2>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-base">High Priority</CardTitle>
            <TriangleAlert className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">
              {services.filter((s) => s.priority === "High").length}
            </h2>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-base">Average Duration</CardTitle>
            <Timer className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">
              {services.length === 0
                ? 0
                : Math.round(
                    services.reduce((sum, s) => sum + s.expectedDuration, 0) /
                      services.length
                  )}{" "}
              min
            </h2>
          </CardContent>
        </Card>

      </div>

      <Card>

        <CardHeader className="flex flex-row justify-between items-center">

          <CardTitle className="text-base">Services</CardTitle>

          {/* dialog for creating or editing a service */}
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) resetForm();
            }}
          >
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>

            <DialogContent>

              <DialogHeader>
                <DialogTitle>
                  {editingId !== null ? "Edit Service" : "Create Service"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">

                {errors.form && (
                  <p className="text-sm text-red-500">{errors.form}</p>
                )}

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
                    onValueChange={(value) => setPriority(value as Priority)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={saveService}>
                  {editingId !== null ? "Update Service" : "Save Service"}
                </Button>

              </div>

            </DialogContent>

          </Dialog>

        </CardHeader>

        <CardContent>

          {/* table listing all services with edit/delete/toggle actions */}
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="max-w-sm">{service.description}</TableCell>
                    <TableCell>{service.expectedDuration} mins</TableCell>
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
                      {/* click to toggle open/closed status */}
                      <Badge
                        variant={service.isOpen ? "outline" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(service.id)}
                      >
                        {service.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(service)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteService(service.id)}
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
        <div className="border-t pt-5 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
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

    </div>
  );
}