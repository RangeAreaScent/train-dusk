import { useState } from "react";
import { initStateFromPrefs } from "./engine/state";
import { SceneView } from "./ui/SceneView";

function App() {
  const [state, setState] = useState(initStateFromPrefs);
  return <SceneView state={state} setState={setState} />;
}

export default App;
