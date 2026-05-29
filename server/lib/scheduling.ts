import type { Service } from "@prisma/client";
import prisma from "./prisma.js";

const ACTIVE_STATUSES = ["scheduled", "ongoing"] as const;

export type ResourceKind = "vehicle" | "driver" | "guide";

export interface ResourceIds {
    vehicleId?: number;
    driverId?: number;
    guideId?: number;
}

export interface Conflict {
    resource: ResourceKind;
    service: Service;
}

export function snapshotId(snapshot: unknown): number | undefined {
    if (snapshot && typeof snapshot === "object" && "id" in snapshot) {
        const id = (snapshot as { id: unknown }).id;
        return typeof id === "number" ? id : undefined;
    }
    return undefined;
}

interface Interval {
    start: number;
    end: number;
}

export function serviceInterval(scheduledAt: Date, durationMin: number | null): Interval {
    const start = scheduledAt.getTime();
    const end = durationMin ? start + durationMin * 60_000 : start;
    return { start, end };
}

export function intervalsConflict(a: Interval, b: Interval): boolean {
    return a.start === b.start || (a.start < b.end && b.start < a.end);
}

function resourceMatches(service: Service, ids: ResourceIds): ResourceKind | null {
    if (ids.vehicleId !== undefined && snapshotId(service.vehicleSnapshot) === ids.vehicleId) {
        return "vehicle";
    }
    if (ids.driverId !== undefined && snapshotId(service.driverSnapshot) === ids.driverId) {
        return "driver";
    }
    if (ids.guideId !== undefined && snapshotId(service.guideSnapshot) === ids.guideId) {
        return "guide";
    }
    return null;
}

interface OverlapQuery extends ResourceIds {
    excludeId?: number;
    scheduledAt: Date;
    durationMin: number | null;
}

export async function findOverlapConflicts(query: OverlapQuery): Promise<Conflict[]> {
    const candidates = await prisma.service.findMany({
        where: { status: { in: [...ACTIVE_STATUSES] } },
    });

    const target = serviceInterval(query.scheduledAt, query.durationMin);
    const conflicts: Conflict[] = [];

    for (const service of candidates) {
        if (service.id === query.excludeId) {
            continue;
        }
        const resource = resourceMatches(service, query);
        if (!resource) {
            continue;
        }
        const other = serviceInterval(service.scheduledAt, service.estimatedDurationMin);
        if (intervalsConflict(target, other)) {
            conflicts.push({ resource, service });
        }
    }

    return conflicts;
}

interface OngoingQuery extends ResourceIds {
    excludeId?: number;
}

export async function findOngoingConflicts(query: OngoingQuery): Promise<Conflict[]> {
    const candidates = await prisma.service.findMany({
        where: { status: "ongoing" },
    });

    const conflicts: Conflict[] = [];
    for (const service of candidates) {
        if (service.id === query.excludeId) {
            continue;
        }
        const resource = resourceMatches(service, query);
        if (resource) {
            conflicts.push({ resource, service });
        }
    }
    return conflicts;
}

function formatWhen(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function resourceLabel(service: Service, resource: ResourceKind): string {
    if (resource === "vehicle") {
        const plate = (service.vehicleSnapshot as { licensePlate?: string })?.licensePlate;
        return plate ? `${plate} (vehicle)` : "This vehicle";
    }
    if (resource === "driver") {
        const name = (service.driverSnapshot as { name?: string })?.name;
        return name ? `${name} (driver)` : "This driver";
    }
    const name = (service.guideSnapshot as { name?: string } | null)?.name;
    return name ? `${name} (guide)` : "This guide";
}

export function overlapMessage(conflicts: Conflict[]): string {
    return conflicts
        .map(
            ({ resource, service }) =>
                `${resourceLabel(service, resource)} is already booked for service #${service.id} at ${formatWhen(service.scheduledAt)}.`,
        )
        .join(" ");
}

export function ongoingMessage(conflicts: Conflict[]): string {
    return conflicts
        .map(
            ({ resource, service }) =>
                `Cannot start: ${resourceLabel(service, resource)} is already on an ongoing service (#${service.id}). Complete or cancel it first.`,
        )
        .join(" ");
}
