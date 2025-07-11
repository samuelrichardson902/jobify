import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AppCard from "./AppCard";
import AppListCard from "./AppListCard";

function SortableAppCard({ job, view, expandedId, setExpandedId, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const dragHandle = (
    <div
      {...attributes}
      {...listeners}
      className="drag-handle cursor-grab active:cursor-grabbing p-1 text-base-content/60 hover:text-base-content/80"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="9" cy="19" r="2" />
        <circle cx="15" cy="5" r="2" />
        <circle cx="15" cy="12" r="2" />
        <circle cx="15" cy="19" r="2" />
      </svg>
    </div>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {view === "list" ? (
        <AppListCard
          job={job}
          {...props}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          dragHandle={dragHandle}
        />
      ) : (
        <AppCard jobObj={job} {...props} dragHandle={dragHandle} />
      )}
    </div>
  );
}

const Section = ({
  title,
  jobs,
  setJobs,
  onEdit,
  onDelete,
  onStatusChange,
  saveNewOrder,
  view,
  defaultCollapsed = false,
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = jobs.findIndex((item) => item.id === active.id);
    const newIndex = jobs.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(jobs, oldIndex, newIndex);
    setJobs(newOrder);
    if (saveNewOrder) await saveNewOrder(newOrder);
  };

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between py-2 px-1 cursor-pointer select-none group"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-base-content">
            {title}
            <span className="text-xs text-base-content/50 ml-1 align-middle">
              ({jobs.length})
            </span>
          </h3>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${
            isCollapsed ? "rotate-0" : "rotate-180"
          } text-base-content/60 group-hover:text-base-content`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {!isCollapsed && (
        <div className="mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={jobs.map((job) => job.id)}
              strategy={rectSortingStrategy}
            >
              <div
                className={
                  view === "list"
                    ? "flex flex-col gap-2"
                    : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                }
              >
                {jobs.map((job) => (
                  <SortableAppCard
                    key={job.id}
                    job={job}
                    view={view}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

const ApplicationsDisplay = ({
  urgentApps = [],
  rejectedApps = [],
  otherApps = [],
  offerApps = [],
  setApplications,
  onEdit,
  onDelete,
  onStatusChange,
  saveNewOrder,
  view = "grid",
}) => {
  const [urgent, setUrgent] = useState(urgentApps);
  const [rejected, setRejected] = useState(rejectedApps);
  const [other, setOther] = useState(otherApps);
  const [offer, setOffer] = useState(offerApps);

  // Keep local state in sync with props
  useEffect(() => {
    setUrgent(urgentApps);
  }, [urgentApps]);
  useEffect(() => {
    setRejected(rejectedApps);
  }, [rejectedApps]);
  useEffect(() => {
    setOther(otherApps);
  }, [otherApps]);
  useEffect(() => {
    setOffer(offerApps);
  }, [offerApps]);

  return (
    <div>
      {urgent.length > 0 && (
        <Section
          title="Urgent"
          jobs={urgent}
          setJobs={setUrgent}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          saveNewOrder={saveNewOrder}
          view={view}
          defaultCollapsed={false}
        />
      )}
      {other.length > 0 && (
        <Section
          title="Applications"
          jobs={other}
          setJobs={setOther}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          saveNewOrder={saveNewOrder}
          view={view}
          defaultCollapsed={false}
        />
      )}
      {offer.length > 0 && (
        <Section
          title="Offers"
          jobs={offer}
          setJobs={setOffer}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          saveNewOrder={saveNewOrder}
          view={view}
          defaultCollapsed={false}
        />
      )}
      {rejected.length > 0 && (
        <Section
          title="Rejected"
          jobs={rejected}
          setJobs={setRejected}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          saveNewOrder={saveNewOrder}
          view={view}
          defaultCollapsed={true}
        />
      )}
    </div>
  );
};

export default ApplicationsDisplay;
