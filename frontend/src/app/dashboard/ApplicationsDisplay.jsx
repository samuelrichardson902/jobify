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

const ApplicationsDisplay = ({
  applications,
  setApplications,
  onEdit,
  onDelete,
  onStatusChange,
  saveNewOrder,
  view = "grid",
}) => {
  const [expandedId, setExpandedId] = useState(null);

  // Handle clicks outside of expanded list items
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (view === "list" && expandedId) {
        // Check if click is outside of any list item
        const listItems = document.querySelectorAll('[data-list-item="true"]');
        let clickedInside = false;

        listItems.forEach((item) => {
          if (item.contains(event.target)) {
            clickedInside = true;
          }
        });

        if (!clickedInside) {
          setExpandedId(null);
        }
      }
    };

    if (view === "list" && expandedId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedId, view]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = applications.findIndex((item) => item.id === active.id);
      const newIndex = applications.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(applications, oldIndex, newIndex);
      setApplications(newOrder);
      if (saveNewOrder) await saveNewOrder(newOrder);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={applications.map((job) => job.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className={
            view === "list"
              ? "flex flex-col gap-2"
              : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          }
        >
          {applications.map((job) => (
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
  );
};

export default ApplicationsDisplay;
