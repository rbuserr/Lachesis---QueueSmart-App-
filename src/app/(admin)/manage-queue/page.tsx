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
  Check,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import SnakeLogo from "@/components/ui/snake-logo.png";
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

import { useQueue } from "@/hooks/use-queue";
import { useServices } from "@/hooks/use-services";
import { api } from "@/lib/api-client";

export default function QueueManagementPage() {
  const { services, error: servicesError } = useServices();
  const {
    snapshot,
    error: queueError,
    refresh: refreshQueue,
  } = useQueue();
  const queue = snapshot.entries;
  const queueOpen = snapshot.isOpen;
  const currentlyServing = snapshot.currentlyServing;

  const openServices = services.filter((s) => s.isOpen);

  const [selectedService, setSelectedService] = useState("All");
  const [search, setSearch] = useState("");

  // Manual add-trader dialog state (edge case: phone-in / can't self-join)
  const [open, setOpen] = useState(false);
  const [traderName, setTraderName] = useState("");
  const [chosenService, setChosenService] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");

  // narrows the queue list down by selected service and search text
  const filteredQueue = queue.filter((user) => {
    const matchesService =
      selectedService === "All" ||
      user.serviceId === Number(selectedService);

    const matchesSearch = user.traderName
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesService && matchesSearch;
  });

  const stats = snapshot.stats;
  const serviceName = (serviceId: number) =>
    services.find((service) => service.id === serviceId)?.name ??
    "Unknown service";

  // clears the add-trader form fields and error
  const resetForm = () => {
    setTraderName("");
    setChosenService("");
    setFormError("");
  };

  // resets the form and opens the manual add-trader dialog
  const openAddDialog = () => {
    resetForm();
    setOpen(true);
  };

  // validates form input and adds the trader to the queue
  const addTrader = async () => {
    if (!traderName.trim()) {
      setFormError("Trader name is required.");
      return;
    }
    if (!chosenService) {
      setFormError("Please select a service.");
      return;
    }

    const service = services.find((s) => s.id === Number(chosenService));
    if (!service) {
      setFormError("Selected service could not be found.");
      return;
    }

    try {
      await api.queue.join({
        traderName,
        serviceId: service.id,
      });
      await refreshQueue();
      setOpen(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // pulls the next waiting trader into "currently serving"
  const serveNext = async () => {
    setActionError("");
    try {
      await api.queue.serveNext();
      await refreshQueue();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // marks the currently served trader as done
  const completeService = async () => {
    await api.queue.complete();
    await refreshQueue();
  };

  // removes a specific trader from the queue
  const removeUser = async (id: number) => {
    await api.queue.leave(id);
    await refreshQueue();
  };

  // moves a trader one spot earlier in the queue
  const moveUp = async (id: number) => {
    await api.queue.move(id, "up");
    await refreshQueue();
  };

  // moves a trader one spot later in the queue
  const moveDown = async (id: number) => {
    await api.queue.move(id, "down");
    await refreshQueue();
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Queue Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage traders waiting for support.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Queue is currently{" "}
            <span className={queueOpen ? "text-emerald-500" : "text-red-500"}>
              {queueOpen ? "Open" : "Closed"}
            </span>
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

      {(servicesError || queueError) && (
        <p className="text-sm text-red-500">
          {servicesError || queueError}
        </p>
      )}

      {/* top row summary stats for the queue */}
      <div className="grid gap-6 md:grid-cols-3">

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-base">Waiting Traders</CardTitle>
            <Users className="h-5 w-5 text-primary"/>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">{stats.waiting}</h2>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-base">Average Wait</CardTitle>
            <Clock3 className="h-5 w-5 text-primary"/>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">
              {stats.averageEstimatedWaitMinutes} min
            </h2>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-base">High Priority</CardTitle>
            <CircleAlert className="h-5 w-5 text-red-500"/>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">{stats.highPriority}</h2>
          </CardContent>
        </Card>

      </div>

      {/* shows who's actively being helped right now, separate from the waiting list */}
      <Card className={currentlyServing ? "border-primary" : ""}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base">Currently Serving</CardTitle>
          {currentlyServing && (
            <Button size="sm" onClick={() => void completeService()}>
              <Check className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {currentlyServing ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentlyServing.traderName}</p>
                <p className="text-sm text-muted-foreground">
                  {serviceName(currentlyServing.serviceId)}
                </p>
              </div>
              <Badge
                variant={
                  currentlyServing.priority === "high"
                    ? "destructive"
                    : currentlyServing.priority === "medium"
                    ? "secondary"
                    : "outline"
                }
              >
                {currentlyServing.priority[0].toUpperCase() +
                  currentlyServing.priority.slice(1)}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No one is currently being served. Click &quot;Serve Next&quot; to
              start.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>

        <CardHeader className="flex flex-row justify-between items-center">

          <CardTitle className="text-base">Active Queue</CardTitle>

          <div className="flex items-center gap-3">

            {/* filters the table by service */}
            <Select
              value={selectedService}
              onValueChange={setSelectedService}
            >
              <SelectTrigger className="w-72">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* primary action: pulls the next waiting trader into "currently serving" */}
            <Button
              onClick={() => void serveNext()}
              disabled={!!currentlyServing || queue.length === 0}
            >
              <Play className="mr-2 h-4 w-4"/>
              Serve Next
            </Button>

          </div>

        </CardHeader>

        <CardContent>

          {actionError && (
            <p className="text-sm text-red-500 mb-4">{actionError}</p>
          )}

          {/* table of traders currently in the queue */}
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
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{user.traderName}</TableCell>
                    <TableCell>{serviceName(user.serviceId)}</TableCell>
                    <TableCell>
                      {new Date(user.joinedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Waiting</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.priority === "high"
                            ? "destructive"
                            : user.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {user.priority[0].toUpperCase() +
                          user.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* reorder and remove controls for each queue entry */}
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => void moveUp(user.id)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => void moveDown(user.id)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => void removeUser(user.id)}
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

          {/* tucked-away fallback for edge cases (phone-in, can't self-join) — deliberately not a prominent action */}
          <div className="mt-4 flex justify-end">
            <Dialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) resetForm();
              }}
            >
              <button
                onClick={openAddDialog}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Log a trader manually
              </button>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Trader Manually</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground -mt-2">
                  For traders who can&apos;t join through their own account — e.g. a phone-in request.
                </p>

                <div className="space-y-5">
                  {formError && (
                    <p className="text-sm text-red-500">{formError}</p>
                  )}

                  <div>
                    <label className="text-sm font-medium">Trader Name *</label>
                    <Input
                      value={traderName}
                      onChange={(e) => setTraderName(e.target.value)}
                      placeholder="Enter trader name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Service *</label>
                    <Select value={chosenService} onValueChange={setChosenService}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {openServices.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No open services available
                          </div>
                        ) : (
                          openServices.map((service) => (
                            <SelectItem
                              key={service.id}
                              value={service.id.toString()}
                            >
                              {service.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={() => void addTrader()}>
                    Add to Queue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

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