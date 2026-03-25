import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Image,
  LogOut,
  Megaphone,
  MessageCircle,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import AnnouncementsTab from "./AnnouncementsTab";
import ChatTab from "./ChatTab";
import GalleryTab from "./GalleryTab";
import MembersTab from "./MembersTab";
import VideoCall from "./VideoCall";

export default function MainApp() {
  const [activeTab, setActiveTab] = useState("chat");
  const { clear } = useInternetIdentity();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "oklch(0.95 0.025 75)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{
          backgroundColor: "oklch(0.22 0.05 213)",
          borderColor: "oklch(0.28 0.05 213)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
            >
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="font-display font-bold text-base"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              Family Chat
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            data-ocid="app.secondary_button"
            className="text-xs gap-1.5"
            style={{ color: "oklch(0.75 0.04 213)" }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-2 sm:px-4 py-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList
            className="grid grid-cols-5 rounded-2xl p-1 mb-4"
            style={{
              backgroundColor: "white",
              boxShadow: "0 1px 4px oklch(0 0 0 / 0.08)",
            }}
          >
            <TabsTrigger
              value="chat"
              data-ocid="app.tab"
              className="rounded-xl flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-white"
              style={
                {
                  "--tw-data-active-bg": "oklch(0.22 0.05 213)",
                } as React.CSSProperties
              }
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              data-ocid="app.tab"
              className="rounded-xl flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-white"
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Photos</span>
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              data-ocid="app.tab"
              className="rounded-xl flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-white"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Updates</span>
            </TabsTrigger>
            <TabsTrigger
              value="members"
              data-ocid="app.tab"
              className="rounded-xl flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger
              value="video"
              data-ocid="video.tab"
              className="rounded-xl flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-white"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
          </TabsList>

          <div
            className="flex-1 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "white",
              boxShadow: "0 1px 4px oklch(0 0 0 / 0.08)",
              minHeight: "calc(100vh - 180px)",
            }}
          >
            <TabsContent
              value="chat"
              className="m-0 h-full"
              style={{ height: "calc(100vh - 180px)" }}
            >
              <ChatTab />
            </TabsContent>
            <TabsContent
              value="gallery"
              className="m-0 h-full"
              style={{ height: "calc(100vh - 180px)" }}
            >
              <GalleryTab />
            </TabsContent>
            <TabsContent
              value="announcements"
              className="m-0 h-full"
              style={{ height: "calc(100vh - 180px)" }}
            >
              <AnnouncementsTab />
            </TabsContent>
            <TabsContent
              value="members"
              className="m-0 h-full"
              style={{ height: "calc(100vh - 180px)" }}
            >
              <MembersTab />
            </TabsContent>
            <TabsContent
              value="video"
              className="m-0 h-full"
              style={{ height: "calc(100vh - 180px)" }}
            >
              <VideoCall />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
