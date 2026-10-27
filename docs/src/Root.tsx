import { InteractionProvider } from "../../src/motion-policy";
import App from "./App";

/** The public catalog demonstrates full motion; library consumers default to system. */
export default function Root() {
  return (
    <InteractionProvider motion="full">
      <App />
    </InteractionProvider>
  );
}
