"use client";

import { useEffect, useState } from "react";

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

import { serviceManager, Service } from "@/app/modules/service-management/service-management";
import { queueManager, QueueEntry } from "@/app/modules/queue-management/queue-management";

export default function QueueManagementPage() {

  const [services, setServices] = useState<Service[]>(serviceManager.getServices());
  const [queue, setQueue] = useState<QueueEntry[]>(queueManager.getQueue());
  const [queueOpen, setQueueOpen] = useState(queueManager.isQueueOpen());
  const [currentlyServing, setCurrentlyServing] = useState<QueueEntry | null>(queueManager.getCurrentlyServing());

  // keeps local state synced with the service and queue managers
  useEffect(() => {
    const unsubServices = serviceManager.subscribe(() => {
      setServices(serviceManager.getServices());
    });
    const unsubQueue = queueManager.subscribe(() => {
      setQueue(queueManager.getQueue());
      setQueueOpen(queueManager.isQueueOpen());
      setCurrentlyServing(queueManager.getCurrentlyServing());
    });

    return () => {
      unsubServices();
      unsubQueue();
    };
  }, []);

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
      selectedService === "All" || user.service === selectedService;

    const matchesSearch = user.trader
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesService && matchesSearch;
  });

  const stats = queueManager.getStats();

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
  const addTrader = () => {
    if (!traderName.trim()) {
      setFormError("Trader name is required.");
      return;
    }
    if (!chosenService) {
      setFormError("Please select a service.");
      return;
    }

    const service = services.find((s) => s.name === chosenService);
    if (!service) {
      setFormError("Selected service could not be found.");
      return;
    }

    try {
      queueManager.addTrader({
        trader: traderName,
        service: service.name,
        priority: service.priority,
      });
      setOpen(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // pulls the next waiting trader into "currently serving"
  const serveNext = () => {
    setActionError("");
    try {
      queueManager.serveNext();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // marks the currently served trader as done
  const completeService = () => {
    queueManager.completeService();
  };

  // removes a specific trader from the queue
  const removeUser = (id: number) => {
    queueManager.removeTrader(id);
  };

  // moves a trader one spot earlier in the queue
  const moveUp = (id: number) => {
    queueManager.moveUp(id);
  };

  // moves a trader one spot later in the queue
  const moveDown = (id: number) => {
    queueManager.moveDown(id);
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
            <h2 className="text-2xl font-semibold">{stats.averageWaitMinutes} min</h2>
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
            <Button size="sm" onClick={completeService}>
              <Check className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {currentlyServing ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentlyServing.trader}</p>
                <p className="text-sm text-muted-foreground">{currentlyServing.service}</p>
              </div>
              <Badge
                variant={
                  currentlyServing.priority === "High"
                    ? "destructive"
                    : currentlyServing.priority === "Medium"
                    ? "secondary"
                    : "outline"
                }
              >
                {currentlyServing.priority}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No one is currently being served. Click "Serve Next" to start.
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
                  <SelectItem key={service.id} value={service.name}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* primary action: pulls the next waiting trader into "currently serving" */}
            <Button onClick={serveNext} disabled={!!currentlyServing}>
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
                    <TableCell>{user.trader}</TableCell>
                    <TableCell>{user.service}</TableCell>
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
                      {/* reorder and remove controls for each queue entry */}
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => moveUp(user.id)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => moveDown(user.id)}
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
                  For traders who can't join through their own account — e.g. a phone-in request.
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
                            <SelectItem key={service.id} value={service.name}>
                              {service.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={addTrader}>
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