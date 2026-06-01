import scenes from "./data/scenes.json";
import config from "./data/config.json";

function App() {
  const sceneCount = Object.keys(scenes).filter((k) => k !== "metadata").length;

  return (
    <div className="flex h-full items-center justify-center bg-black text-white font-mono">
      <div className="text-center space-y-2">
        <h1 className="text-2xl tracking-widest">TRAIN DUSK</h1>
        <p className="text-xs text-neutral-500">
          {config.game.title} v{config.game.version} — bootstrap ok
        </p>
        <p className="text-xs text-neutral-500">scenes loaded: {sceneCount}</p>
      </div>
    </div>
  );
}

export default App;
