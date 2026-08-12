import { Outlet, NavLink } from "react-router";
import {
  Zap,
  FolderTree,
  Settings,
  Cpu,
  GitBranch,
  Play
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export const RootLayout = () => {
  return (
    <TooltipProvider delay={200}>
      {/* App Shell Viewport */}
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col font-sans antialiased select-none">

        {/* 1. App Header / Titlebar */}
        <header className="h-9 min-h-[36px] bg-muted/30 border-b border-border flex items-center justify-between px-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Go SSA Visualizer</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-mono gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Go v1.22
            </Badge>

            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
            </Button>
          </div>
        </header>

        {/* 2. Main Body Container */}
        <div className="flex-1 flex overflow-hidden">

          {/* Activity Rail Navigation */}
          <aside className="w-12 min-w-[48px] bg-muted/20 border-r border-border flex flex-col items-center justify-between py-2">

            {/* Top Navigation Links */}
            <div className="flex flex-col gap-1 items-center">
              <Tooltip>
                <TooltipTrigger className="focus:outline-none">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `h-9 w-9 rounded-md flex items-center justify-center transition-colors ${isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`
                    }
                  >
                    <Zap className="h-4 w-4" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Scratchpad (Ephemeral)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className="focus:outline-none">
                  <NavLink
                    to="/project"
                    className={({ isActive }) =>
                      `h-9 w-9 rounded-md flex items-center justify-center transition-colors ${isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`
                    }
                  >
                    <FolderTree className="h-4 w-4" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Project Explorer</TooltipContent>
              </Tooltip>
            </div>

            {/* Bottom Utility Controls */}
            <div className="flex flex-col gap-1 items-center">
              <Tooltip>
                <TooltipTrigger className="focus:outline-none">
                  <div className="h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
                    <Settings className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </div>
          </aside>

          {/* Main Outlet Workspace */}
          <main className="flex-1 overflow-hidden relative">
            <Outlet />
          </main>
        </div>

        {/* 3. Bottom Status Bar */}
        <footer className="h-6 min-h-[24px] bg-muted/40 border-t border-border px-3 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              main
            </span>
            <span>SSA Pass: ssa/opt (Final)</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Blocks: 8</span>
            <span>Nodes: 34</span>
            <span className="text-emerald-500 font-medium">Ready</span>
          </div>
        </footer>

      </div>
    </TooltipProvider>
  );
};