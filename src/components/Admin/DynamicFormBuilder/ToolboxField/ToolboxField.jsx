export default function ToolboxField({ type, icon, onDragStart }) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="border px-3 py-1 bg-white shadow cursor-move text-sm rounded hover:bg-gray-100 flex items-center gap-2"
        >
            <span>{icon}</span>
            <span>{type}</span>
        </div>
    );
}
