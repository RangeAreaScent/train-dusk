import { useState } from "react";
import { initialState } from "./engine/state";
import { SceneView } from "./ui/SceneView";

function App() {
  const [state, setState] = useState(initialState);
  return <SceneView state={state} setState={setState} />;
}

export default App;
