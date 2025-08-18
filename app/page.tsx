import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen">
      <div className="w-[60%] h-full bg-blue-500">Column One</div>
      <div className="w-[40%] h-full bg-green-500">Column Two</div>
    </div>
  );
}
