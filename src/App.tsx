import Background from "./components/Background";
import ControlDeck from "./components/ControlDeck";
import Header from "./components/Header";
import Readout from "./components/Readout";
import Ribbon from "./components/Ribbon";
import StartOverlay from "./components/StartOverlay";
import { useInstrumentController } from "./hooks/useInstrumentController";

export default function App() {
  const controller = useInstrumentController();

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      <Background />

      <Header
        accent={controller.accent}
        mode={controller.mode}
        selectMode={controller.selectMode}
      />

      <Readout
        currentCell={controller.currentCell}
        accent={controller.accent}
        intensity={controller.intensity}
      />

      <Ribbon
        mode={controller.mode}
        drone={controller.drone}
        latched={controller.latched}
        activeKeys={controller.activeKeys}
        keyForCell={controller.keyForCell}
        ribbonRef={controller.ribbonRef}
        onPointerDown={controller.onRibbonPointerDown}
        onPointerMove={controller.onRibbonPointerMove}
        onPointerEnd={controller.endPointer}
      />

      <ControlDeck
        settings={controller.settings}
        updateSetting={controller.updateSetting}
        mode={controller.mode}
        drone={controller.drone}
        toggleDrone={controller.toggleDrone}
        arp={controller.arp}
        toggleArp={controller.toggleArp}
        arpRate={controller.arpRate}
        setArpRate={controller.setArpRate}
        accent={controller.accent}
        panic={controller.panic}
      />

      {!controller.started && <StartOverlay onStart={controller.start} />}
    </div>
  );
}
