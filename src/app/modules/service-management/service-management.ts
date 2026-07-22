import { activityLog } from "@/app/modules/activity-log/activity-log";

export type Priority = "Low" | "Medium" | "High";

export interface Service {
  id: number;
  name: string;
  description: string;
  expectedDuration: number;
  priority: Priority;
  isOpen: boolean;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  expectedDuration: number;
  priority: Priority;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  expectedDuration?: number;
  priority?: Priority;
  isOpen?: boolean;
}

type Listener = () => void;

// checks service fields and returns a list of validation error messages
function validateServiceData(service: CreateServiceRequest): string[] {
  const errors: string[] = [];

  if (!service.name.trim()) {
    errors.push("Service name is required.");
  }

  if (service.name.length > 100) {
    errors.push("Service name cannot exceed 100 characters.");
  }

  if (!service.description.trim()) {
    errors.push("Description is required.");
  }

  if (service.expectedDuration <= 0) {
    errors.push("Expected duration must be greater than zero.");
  }

  return errors;
}

const DEFAULT_SERVICES: Service[] = [
  {
    id: 1,
    name: "General Account Inquiry",
    description: "General questions regarding trader accounts.",
    expectedDuration: 10,
    priority: "Low",
    isOpen: true,
  },
  {
    id: 2,
    name: "Evaluation Phase Verification",
    description: "Review and verify evaluation phase progress.",
    expectedDuration: 25,
    priority: "Medium",
    isOpen: true,
  },
  {
    id: 3,
    name: "Live Trade / Platform Execution Issue",
    description: "Urgent support for live trading platform issues.",
    expectedDuration: 5,
    priority: "High",
    isOpen: true,
  },
];

const DEFAULT_NEXT_ID = 4;

class ServiceManagement {
  private services: Service[];
  private nextId: number;
  private listeners: Listener[] = [];

  constructor() {
    this.services = [...DEFAULT_SERVICES];
    this.nextId = DEFAULT_NEXT_ID;
  }

  // lets components react to service list changes
  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // runs all subscribed listeners
  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // returns a copy of all services
  getServices(): Service[] {
    return [...this.services];
  }

  // returns only services currently open
  getOpenServices(): Service[] {
    return this.services.filter((service) => service.isOpen);
  }

  // finds a single service by its id
  getServiceById(id: number): Service | undefined {
    return this.services.find((service) => service.id === id);
  }

  // filters services by priority level
  getServicesByPriority(priority: Priority): Service[] {
    return this.services.filter((service) => service.priority === priority);
  }

  // validates and adds a new service, marked open by default
  createService(data: CreateServiceRequest): Service {
    const errors = validateServiceData(data);
    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }

    const newService: Service = {
      id: this.nextId++,
      ...data,
      isOpen: true,
    };

    this.services.push(newService);
    activityLog.log(`New service created: ${newService.name}`);
    this.notify();

    return newService;
  }

  // merges updates into an existing service after validating the result
  updateService(id: number, updates: UpdateServiceRequest): Service | null {
    const service = this.getServiceById(id);
    if (!service) return null;

    const merged: Service = { ...service, ...updates };

    const errors = validateServiceData({
      name: merged.name,
      description: merged.description,
      expectedDuration: merged.expectedDuration,
      priority: merged.priority,
    });

    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }

    Object.assign(service, merged);
    activityLog.log(`Service updated: ${service.name}`);
    this.notify();

    return service;
  }

  // removes a service by id
  deleteService(id: number): boolean {
    const index = this.services.findIndex((service) => service.id === id);
    if (index === -1) return false;

    const [removed] = this.services.splice(index, 1);
    activityLog.log(`Service deleted: ${removed.name}`);
    this.notify();

    return true;
  }

  // flips a service between open and closed
  toggleServiceStatus(id: number): Service | null {
    const service = this.getServiceById(id);
    if (!service) return null;

    service.isOpen = !service.isOpen;
    activityLog.log(`${service.name} marked as ${service.isOpen ? "Open" : "Closed"}`);
    this.notify();

    return service;
  }
}

export const serviceManager = new ServiceManagement();