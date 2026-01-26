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
      className={`
        drop-zone-collapsed
        ${isActive ? "drop-zone-expanded" : ""}
      `}
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
      <div className={`
        transition-all duration-200 ease-out
        ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}>
        <span className="text-primary text-sm font-medium">
          Drop here
        </span>
      </div>
    </div>
  );
}
