interface DropZoneProps {
  position: number;
  isActive: boolean;
  onDrop: (position: number) => void;
  onDragOver: (position: number) => void;
  onDragLeave: () => void;
}

export function DropZone({
  position,
  isActive,
  onDrop,
  onDragOver,
  onDragLeave,
}: DropZoneProps) {
  return (
    <div
      className={`drop-zone ${isActive ? "drop-zone-active" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(position);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(position);
      }}
    >
      <span className="text-muted-foreground text-sm font-medium">
        {isActive ? "Drop here" : ""}
      </span>
    </div>
  );
}
