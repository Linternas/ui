"use client";
import * as React from "react";
import { useRef, useState } from "react";
import { Avatar } from "./system/display";
import { Button, Dialog } from "./system/base";
export interface ClusterPerson {
  id: string;
  name: string;
  src?: string;
  role?: string;
  bio?: string;
  href?: string;
  disabled?: boolean;
}
export interface AvatarClusterProps {
  people: readonly ClusterPerson[];
  label: string;
  className?: string;
}
export function AvatarCluster({
  people,
  label,
  className = "",
}: AvatarClusterProps) {
  const [active, setActive] = useState<ClusterPerson | null>(null),
    [open, setOpen] = useState(false),
    trigger = useRef<HTMLElement>(null);
  return (
    <div
      className={`mingu-avatar-cluster ${className}`}
      role="group"
      aria-label={label}
    >
      <div className="mingu-avatar-row">
        {people.map((person) => (
          <button
            type="button"
            key={person.id}
            className="mingu-avatar-person"
            disabled={person.disabled}
            aria-label={`View ${person.name}`}
            aria-haspopup="dialog"
            onClick={(event) => {
              trigger.current = event.currentTarget;
              setActive(person);
              setOpen(true);
            }}
          >
            <Avatar name={person.name} src={person.src} size="lg" />
            <span className="mingu-avatar-tooltip" aria-hidden="true">
              {person.name}
            </span>
          </button>
        ))}
      </div>
      <span className="mingu-muted">{people.length} people</span>
      <Dialog
        className="mingu-profile-dialog"
        open={open}
        onOpenChange={setOpen}
        title={active?.name ?? "Profile"}
        description={active?.role}
        motionOrigin={trigger}
        motion="scale"
      >
        {active && (
          <div className="mingu-profile-card">
            <Avatar name={active.name} src={active.src} size="lg" />
            {active.bio && <p>{active.bio}</p>}
            {active.href && (
              <a className="mingu-profile-link" href={active.href}>
                View profile ↗
              </a>
            )}
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close profile
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
