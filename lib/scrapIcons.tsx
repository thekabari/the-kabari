import {
  DocumentTextIcon, CubeIcon, WrenchScrewdriverIcon, CpuChipIcon,
  BeakerIcon, ArchiveBoxIcon, ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ComponentType, SVGProps } from "react";

export const SCRAP_ICON: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Paper: DocumentTextIcon,
  Plastic: CubeIcon,
  Metal: WrenchScrewdriverIcon,
  Electronics: CpuChipIcon,
  Glass: BeakerIcon,
  Cardboard: ArchiveBoxIcon,
};

export function ScrapIcon({ type, className }: { type: string; className?: string }) {
  const Icon = SCRAP_ICON[type] || ArrowPathIcon;
  return <Icon className={className} />;
}
