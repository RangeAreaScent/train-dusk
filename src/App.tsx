import { useState } from "react";
import { initStateFromPrefs, loadMeta } from "./engine/state";
import { SceneView } from "./ui/SceneView";
import { getEndingFromURL } from "./platform/share";

function bootState() {
  const base = initStateFromPrefs();
  const fromURL = getEndingFromURL();
  if (fromURL) {
    const meta = loadMeta();
    return {
      ...base,
      currentScene: `end${fromURL.ending}_card`,
      runCount: fromURL.run,
      endingsReached: meta.endingsReached.length
        ? meta.endingsReached
        : [fromURL.ending],
      flags: { ...base.flags, viewingShared: true },
    };
  }
  return base;
}

function App() {
  const [state, setState] = useState(bootState);
  return <SceneView state={state} setState={setState} />;
}

export default App;
