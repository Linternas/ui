"use client";
import * as React from "react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Dialog } from "./system/base";
import { useControllable } from "./shared";
import { workspaceMotion } from "./system/motion-tokens";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
  caption?: string;
}
export interface ImageLightboxProps {
  images: readonly GalleryImage[];
  label?: string;
  className?: string;
}
export function ImageLightbox({
  images,
  label = "Image gallery",
  className = "",
}: ImageLightboxProps) {
  const [index, setIndex] = useState(0),
    [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1),
    [pan, setPan] = useState({ x: 0, y: 0 });
  const [failed, setFailed] = useState(false);
  const origin = useRef<HTMLButtonElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({
    distance: 0,
    zoom: 1,
    startX: 0,
  });
  const reduced = useReducedMotion();
  const image = images[Math.min(index, images.length - 1)];
  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    pointers.current.clear();
  };
  const change = (next: number) => {
    setIndex((next + images.length) % images.length);
    setFailed(false);
    reset();
  };
  useEffect(() => {
    if (!open) reset();
  }, [open]);
  const adjustZoom = (next: number) => {
    setZoom(Math.max(1, Math.min(workspaceMotion.maxZoom, next)));
    setPan({ x: 0, y: 0 });
  };
  const points = () => Array.from(pointers.current.values());
  const distance = () => {
    const p = points();
    return p.length < 2 ? 0 : Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  };
  return (
    <div className={`mingu-lightbox ${className}`}>
      <div
        className="mingu-lightbox-thumbnails"
        role="group"
        aria-label={label}
      >
        {images.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Open ${item.alt}`}
            onClick={(event) => {
              origin.current = event.currentTarget;
              change(i);
              setOpen(true);
            }}
          >
            <img
              src={item.thumbnail ?? item.src}
              alt={item.alt}
              loading="lazy"
            />
          </button>
        ))}
        {!images.length && <p className="mingu-muted">No images</p>}
      </div>
      <Dialog
        open={open && !!image}
        onOpenChange={setOpen}
        title={image?.alt ?? label}
        className="mingu-lightbox-dialog"
        motionOrigin={origin}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLInputElement) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            change(index + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
      >
        {image && (
          <div>
            <div
              className="mingu-lightbox-stage"
              ref={stage}
              tabIndex={0}
              role="group"
              aria-label="Image: drag to pan, pinch or use zoom buttons"
              data-zoomed={zoom > 1 || undefined}
              onDoubleClick={() => adjustZoom(zoom > 1 ? 1 : 2)}
              onPointerDown={(event) => {
                if (event.button !== 0 && event.pointerType === "mouse") return;
                event.currentTarget.setPointerCapture(event.pointerId);
                pointers.current.set(event.pointerId, {
                  x: event.clientX,
                  y: event.clientY,
                });
                gesture.current = {
                  distance: distance(),
                  zoom,
                  startX: event.clientX,
                };
              }}
              onPointerMove={(event) => {
                if (!pointers.current.has(event.pointerId)) return;
                const previous = pointers.current.get(event.pointerId)!;
                pointers.current.set(event.pointerId, {
                  x: event.clientX,
                  y: event.clientY,
                });
                if (pointers.current.size > 1) {
                  if (gesture.current.distance)
                    setZoom(
                      Math.max(
                        1,
                        Math.min(
                          workspaceMotion.maxZoom,
                          (gesture.current.zoom * distance()) /
                            gesture.current.distance,
                        ),
                      ),
                    );
                  setPan({ x: 0, y: 0 });
                } else if (zoom > 1) {
                  const box = stage.current!.getBoundingClientRect();
                  setPan((p) => ({
                    x: Math.max(
                      (-box.width * (zoom - 1)) / 2,
                      Math.min(
                        (box.width * (zoom - 1)) / 2,
                        p.x + event.clientX - previous.x,
                      ),
                    ),
                    y: Math.max(
                      (-box.height * (zoom - 1)) / 2,
                      Math.min(
                        (box.height * (zoom - 1)) / 2,
                        p.y + event.clientY - previous.y,
                      ),
                    ),
                  }));
                }
              }}
              onPointerUp={(event) => {
                if (!pointers.current.has(event.pointerId)) return;
                const single = pointers.current.size === 1;
                pointers.current.delete(event.pointerId);
                if (
                  single &&
                  zoom === 1 &&
                  Math.abs(event.clientX - gesture.current.startX) >
                    workspaceMotion.swipeDistance
                )
                  change(
                    index + (event.clientX < gesture.current.startX ? 1 : -1),
                  );
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onPointerCancel={() => pointers.current.clear()}
              onLostPointerCapture={(event) =>
                pointers.current.delete(event.pointerId)
              }
            >
              {failed ? (
                <p role="status">Image could not be loaded.</p>
              ) : (
                <motion.img
                  key={image.id}
                  src={image.src}
                  alt={image.alt}
                  draggable={false}
                  onError={() => setFailed(true)}
                  animate={{ scale: zoom, x: pan.x, y: pan.y }}
                  transition={reduced ? { duration: 0 } : { duration: 0.12 }}
                />
              )}
            </div>
            <div className="mingu-lightbox-controls">
              <Button
                variant="ghost"
                disabled={images.length < 2}
                onClick={() => change(index - 1)}
                aria-label="Previous image"
              >
                ←
              </Button>
              <span role="status">
                {Math.min(index + 1, images.length)} / {images.length}
              </span>
              <Button
                variant="ghost"
                disabled={images.length < 2}
                onClick={() => change(index + 1)}
                aria-label="Next image"
              >
                →
              </Button>
              <Button
                variant="outline"
                onClick={() => adjustZoom(zoom - 0.5)}
                disabled={zoom <= 1}
                aria-label="Zoom out"
              >
                −
              </Button>
              <Button
                variant="outline"
                onClick={() => adjustZoom(zoom + 0.5)}
                disabled={zoom >= workspaceMotion.maxZoom}
                aria-label="Zoom in"
              >
                +
              </Button>
              <Button variant="ghost" onClick={reset} aria-label="Reset zoom">
                {Math.round(zoom * 100)}%
              </Button>
            </div>
            {image.caption && <p className="mingu-muted">{image.caption}</p>}
          </div>
        )}
      </Dialog>
    </div>
  );
}
export interface ExpandableCardProps {
  title: string;
  description?: string;
  image?: { src: string; alt: string };
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
}
export function ExpandableCard({
  title,
  description,
  image,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
  className = "",
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useControllable(
    open,
    defaultOpen,
    onOpenChange,
  );
  const origin = useRef<HTMLButtonElement>(null);
  return (
    <div className={`mingu-expandable ${className}`}>
      <button
        ref={origin}
        type="button"
        className="mingu-expandable-trigger"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        onClick={() => setExpanded(true)}
      >
        {image && <img src={image.src} alt={image.alt} loading="lazy" />}
        <span>
          <strong>{title}</strong>
          {description && <span>{description}</span>}
          <span className="mingu-expandable-arrow" aria-hidden="true">
            ↗
          </span>
        </span>
      </button>
      <Dialog
        open={expanded}
        onOpenChange={setExpanded}
        title={title}
        description={description}
        motionOrigin={origin}
        className="mingu-expandable-dialog"
      >
        {image && (
          <img
            className="mingu-expandable-image"
            src={image.src}
            alt={image.alt}
          />
        )}
        {children}
      </Dialog>
    </div>
  );
}
