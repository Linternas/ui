"use client";
import * as React from "react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button, TextField, Select } from "./system/base";
import { useControllable } from "./shared";
import { experimentalMotion as limits } from "./system/motion-tokens";
export interface SpatialNode {
  id: string;
  title: string;
  x: number;
  y: number;
}
export interface SpatialEdge {
  id: string;
  from: string;
  to: string;
}
export interface SpatialBoardProps {
  nodes?: readonly SpatialNode[];
  defaultNodes?: readonly SpatialNode[];
  onNodesChange?: (nodes: readonly SpatialNode[]) => void;
  edges?: readonly SpatialEdge[];
  defaultEdges?: readonly SpatialEdge[];
  onEdgesChange?: (edges: readonly SpatialEdge[]) => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
}
const initialNodes: readonly SpatialNode[] = [
  { id: "start", title: "A small idea", x: 50, y: 100 },
  { id: "shape", title: "Give it a shape", x: 350, y: 240 },
  { id: "share", title: "Let it out", x: 650, y: 100 },
];
const initialEdges: readonly SpatialEdge[] = [
  { id: "start-shape", from: "start", to: "shape" },
  { id: "shape-share", from: "shape", to: "share" },
];
const clamp = (n: number, max: number) =>
  Math.max(0, Math.min(max, Number.isFinite(n) ? n : 0));
export function SpatialBoard({
  nodes,
  defaultNodes = initialNodes,
  onNodesChange,
  edges,
  defaultEdges = initialEdges,
  onEdgesChange,
  label = "Spatial board",
  className = "",
  style,
}: SpatialBoardProps) {
  const [items, change] = useControllable(nodes, defaultNodes, onNodesChange),
    [links, connect] = useControllable(edges, defaultEdges, onEdgesChange),
    [view, setView] = useState({ x: 0, y: 0, zoom: 1 }),
    [source, setSource] = useState<string | null>(null),
    [panning, setPanning] = useState(false),
    [message, setMessage] = useState("Move a note. Connect two ideas.");
  const stage = useRef<HTMLDivElement>(null),
    add = useRef<HTMLButtonElement>(null),
    serial = useRef(0),
    dirty = useRef(false),
    live = useRef({ items, links, view });
  live.current = { items, links, view };
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    node?: string;
    originX: number;
    originY: number;
    zoom: number;
  } | null>(null);
  const shown = items.slice(0, limits.nodeLimit).map((node) => ({
    ...node,
    x: clamp(node.x, limits.boardWidth - limits.nodeWidth),
    y: clamp(node.y, limits.boardHeight - limits.nodeHeight),
  }));
  const fit = (list: readonly SpatialNode[] = live.current.items) => {
    const el = stage.current;
    if (!el) return;
    const points = list
        .slice(0, limits.nodeLimit)
        .map((n) => ({
          ...n,
          x: clamp(n.x, limits.boardWidth - limits.nodeWidth),
          y: clamp(n.y, limits.boardHeight - limits.nodeHeight),
        })),
      minX = Math.min(...points.map((n) => n.x), 0),
      minY = Math.min(...points.map((n) => n.y), 0),
      maxX = Math.max(...points.map((n) => n.x + limits.nodeWidth), 400),
      maxY = Math.max(...points.map((n) => n.y + limits.nodeHeight), 300);
    const zoom = Math.max(
      limits.minZoom,
      Math.min(
        1,
        (el.clientWidth - 48) / Math.max(1, maxX - minX),
        (el.clientHeight - 48) / Math.max(1, maxY - minY),
      ),
    );
    setView({
      zoom,
      x: (el.clientWidth - (maxX - minX) * zoom) / 2 - minX * zoom,
      y: (el.clientHeight - (maxY - minY) * zoom) / 2 - minY * zoom,
    });
  };
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (!dirty.current) fit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const zoom = (amount: number, point?: { x: number; y: number }) => {
    dirty.current = true;
    setView((previous) => {
      const next = Math.max(
          limits.minZoom,
          Math.min(limits.maxZoom, previous.zoom * amount),
        ),
        x = point?.x ?? (stage.current?.clientWidth ?? 0) / 2,
        y = point?.y ?? (stage.current?.clientHeight ?? 0) / 2;
      return {
        zoom: next,
        x: x - ((x - previous.x) * next) / previous.zoom,
        y: y - ((y - previous.y) * next) / previous.zoom,
      };
    });
  };
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const box = el.getBoundingClientRect();
      zoom(Math.exp(-event.deltaY * 0.002), {
        x: event.clientX - box.left,
        y: event.clientY - box.top,
      });
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);
  const update = (id: string, x: number, y: number) => {
    change(
      live.current.items.map((n) =>
        n.id === id
          ? {
              ...n,
              x: clamp(x, limits.boardWidth - limits.nodeWidth),
              y: clamp(y, limits.boardHeight - limits.nodeHeight),
            }
          : n,
      ),
    );
  };
  const join = (id: string) => {
    if (!source) {
      setSource(id);
      setMessage("Choose another note to connect.");
      return;
    }
    if (source === id) {
      setSource(null);
      setMessage("Connection canceled.");
      return;
    }
    if (
      !live.current.links.some(
        (e) =>
          (e.from === source && e.to === id) ||
          (e.from === id && e.to === source),
      )
    ) {
      connect([
        ...live.current.links,
        { id: `${source}:${id}`, from: source, to: id },
      ]);
      setMessage("Ideas connected.");
    } else setMessage("These notes are already connected.");
    setSource(null);
  };
  return (
    <div
      className={`mingu-spatial-board ${className}`}
      role="group"
      aria-label={label}
      style={style}
    >
      <div className="mingu-experiment-buttons">
        <Button
          ref={add}
          variant="secondary"
          disabled={shown.length >= limits.nodeLimit}
          onClick={() => {
            let id: string;
            do {
              id = `note-${++serial.current}`;
            } while (live.current.items.some((n) => n.id === id));
            const list = [
              ...live.current.items,
              {
                id,
                title: "New thought",
                x: 140 + (serial.current % 4) * 210,
                y: 100 + (Math.floor(serial.current / 4) % 3) * 190,
              },
            ];
            change(list);
            dirty.current = false;
            fit(list);
            setMessage("Note added.");
          }}
        >
          Add note
        </Button>
        <Button
          variant="ghost"
          aria-label="Zoom out"
          onClick={() => zoom(1 / 1.2)}
        >
          −
        </Button>
        <output aria-label="Board zoom">{Math.round(view.zoom * 100)}%</output>
        <Button variant="ghost" aria-label="Zoom in" onClick={() => zoom(1.2)}>
          +
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            dirty.current = false;
            fit();
          }}
        >
          Fit board
        </Button>
        <Select
          aria-label="Focus note"
          value=""
          onChange={(event) => {
            const node = shown.find((n) => n.id === event.currentTarget.value),
              el = stage.current;
            if (!node || !el) return;
            dirty.current = true;
            setView({
              zoom: 1,
              x: (el.clientWidth - limits.nodeWidth) / 2 - node.x,
              y: (el.clientHeight - limits.nodeHeight) / 2 - node.y,
            });
          }}
        >
          <option value="">Focus a note</option>
          {shown.map((node) => (
            <option key={node.id} value={node.id}>
              {node.title || "Untitled note"}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          aria-pressed={panning}
          onClick={() => setPanning(!panning)}
        >
          Move canvas
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            change(defaultNodes);
            connect(defaultEdges);
            setSource(null);
            dirty.current = false;
            fit(defaultNodes);
            setMessage("Board reset.");
          }}
        >
          Reset board
        </Button>
      </div>
      <div
        ref={stage}
        className="mingu-spatial-stage"
        role="region"
        aria-label="Board canvas"
        tabIndex={0}
        style={{ touchAction: panning ? "none" : "pan-y pinch-zoom" }}
        data-panning={panning || undefined}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setSource(null);
            gesture.current = null;
            setMessage("Connection canceled.");
          }
          if (
            event.target === event.currentTarget &&
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
              event.key,
            )
          ) {
            event.preventDefault();
            dirty.current = true;
            const step = event.shiftKey ? 80 : 30;
            setView((v) => ({
              ...v,
              x:
                v.x +
                (event.key === "ArrowLeft"
                  ? step
                  : event.key === "ArrowRight"
                    ? -step
                    : 0),
              y:
                v.y +
                (event.key === "ArrowUp"
                  ? step
                  : event.key === "ArrowDown"
                    ? -step
                    : 0),
            }));
          }
        }}
        onPointerDown={(event) => {
          if (
            !event.isPrimary ||
            event.button !== 0 ||
            (event.target as Element).closest(
              "button,input,a,textarea,[data-board-node]",
            )
          )
            return;
          if (event.pointerType === "touch" && !panning) return;
          dirty.current = true;
          gesture.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            originX: view.x,
            originY: view.y,
            zoom: view.zoom,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const start = gesture.current;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x,
            dy = event.clientY - start.y;
          if (start.node)
            update(
              start.node,
              start.originX + dx / start.zoom,
              start.originY + dy / start.zoom,
            );
          else
            setView((v) => ({
              ...v,
              x: start.originX + dx,
              y: start.originY + dy,
            }));
        }}
        onPointerUp={(event) => {
          gesture.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
        onLostPointerCapture={() => {
          gesture.current = null;
        }}
      >
        <div
          className="mingu-spatial-world"
          style={{
            width: limits.boardWidth,
            height: limits.boardHeight,
            transform: `translate(${view.x}px,${view.y}px) scale(${view.zoom})`,
          }}
        >
          <svg
            className="mingu-spatial-edges"
            width={limits.boardWidth}
            height={limits.boardHeight}
            aria-hidden="true"
          >
            {links.map((edge) => {
              const a = shown.find((n) => n.id === edge.from),
                b = shown.find((n) => n.id === edge.to);
              if (!a || !b) return null;
              const x = a.x + limits.nodeWidth / 2,
                y = a.y + limits.nodeHeight / 2,
                toX = b.x + limits.nodeWidth / 2,
                toY = b.y + limits.nodeHeight / 2;
              return (
                <path
                  key={edge.id}
                  d={`M${x},${y} C${x + (toX - x) * 0.5},${y} ${x + (toX - x) * 0.5},${toY} ${toX},${toY}`}
                />
              );
            })}
          </svg>
          {shown.map((node, i) => (
            <div
              className="mingu-spatial-node"
              key={node.id}
              data-board-node={node.id}
              style={{
                left: node.x,
                top: node.y,
                width: limits.nodeWidth,
                height: limits.nodeHeight,
              }}
              data-connecting={source === node.id || undefined}
            >
              <div className="mingu-spatial-node-tools">
                <button
                  type="button"
                  className="mingu-spatial-grip"
                  aria-label={`Move ${node.title}`}
                  onPointerDown={(event) => {
                    if (!event.isPrimary || event.button !== 0) return;
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.focus({ preventScroll: true });
                    dirty.current = true;
                    gesture.current = {
                      id: event.pointerId,
                      x: event.clientX,
                      y: event.clientY,
                      node: node.id,
                      originX: node.x,
                      originY: node.y,
                      zoom: view.zoom,
                    };
                    stage.current?.setPointerCapture(event.pointerId);
                  }}
                  onKeyDown={(event) => {
                    if (
                      ![
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowDown",
                      ].includes(event.key)
                    )
                      return;
                    event.preventDefault();
                    event.stopPropagation();
                    dirty.current = true;
                    const step = event.shiftKey ? 25 : 5;
                    update(
                      node.id,
                      node.x +
                        (event.key === "ArrowLeft"
                          ? -step
                          : event.key === "ArrowRight"
                            ? step
                            : 0),
                      node.y +
                        (event.key === "ArrowUp"
                          ? -step
                          : event.key === "ArrowDown"
                            ? step
                            : 0),
                    );
                  }}
                >
                  <span aria-hidden="true">⠿</span>
                  <span>NOTE {String(i + 1).padStart(2, "0")}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${node.title}`}
                  onClick={() => {
                    change(live.current.items.filter((n) => n.id !== node.id));
                    connect(
                      live.current.links.filter(
                        (e) => e.from !== node.id && e.to !== node.id,
                      ),
                    );
                    if (source === node.id) setSource(null);
                    setMessage("Note removed.");
                    add.current?.focus();
                  }}
                >
                  ×
                </button>
              </div>
              <TextField
                label={`Note ${i + 1} title`}
                value={node.title}
                maxLength={40}
                onChange={(event) =>
                  change(
                    live.current.items.map((n) =>
                      n.id === node.id
                        ? { ...n, title: event.currentTarget.value }
                        : n,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="mingu-spatial-connect"
                aria-label={`Connect ${node.title}`}
                aria-pressed={source === node.id}
                onClick={() => join(node.id)}
              >
                <i aria-hidden="true" />
                {source === node.id ? "Choose a destination" : "Connect idea"}
              </button>
            </div>
          ))}
        </div>
        {!shown.length && (
          <p className="mingu-spatial-empty">
            An empty canvas. Add your first note.
          </p>
        )}
      </div>
      <div className="mingu-spatial-footer">
        <p className="mingu-experiment-status" role="status">
          {message}
        </p>
        <details>
          <summary>
            {
              links.filter(
                (e) =>
                  shown.some((n) => n.id === e.from) &&
                  shown.some((n) => n.id === e.to),
              ).length
            }{" "}
            connections
          </summary>
          <div>
            {links
              .filter(
                (e) =>
                  shown.some((n) => n.id === e.from) &&
                  shown.some((n) => n.id === e.to),
              )
              .map((edge) => (
                <Button
                  key={edge.id}
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    connect(live.current.links.filter((e) => e.id !== edge.id))
                  }
                  aria-label={`Remove connection ${edge.from} to ${edge.to}`}
                >
                  {shown.find((n) => n.id === edge.from)?.title} →{" "}
                  {shown.find((n) => n.id === edge.to)?.title} ×
                </Button>
              ))}
          </div>
        </details>
      </div>
    </div>
  );
}
