interface Props {
  visualKey?: string;
  popup?: string;
}

export function VisualArea({ visualKey, popup }: Props) {
  return (
    <div className="relative h-full w-full bg-neutral-900 flex items-center justify-center overflow-hidden">
      <div className="text-neutral-500 text-xs font-mono tracking-wider">
        {visualKey ?? "—"}
      </div>
      {popup && (
        <div className="absolute top-3 right-3 border border-neutral-600 px-2 py-1 text-[10px] text-neutral-400 font-mono">
          {popup}
        </div>
      )}
    </div>
  );
}
