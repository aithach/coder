import { MyChat } from "@/components/my/mychat";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel */}
        <ResizablePanel defaultSize={40} minSize={20} className="h-full">
          <div className="h-full">
            <MyChat />
          </div>
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle />

        {/* Right Panel */}
        <ResizablePanel defaultSize={60} minSize={20} className="h-full">
          <div className="h-full overflow-auto bg-green-500">
            {/* Content for the right panel */}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
