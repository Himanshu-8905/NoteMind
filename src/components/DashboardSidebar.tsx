"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  FileTextIcon,
  GithubIcon,
  LayoutDashboard,
  YoutubeIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
  const pathName = usePathname();
  return (
    <Sidebar className="mt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    className={`text-gray-700 dark:text-gray-50 ${pathName.includes("/search") && "bg-gray-200 dark:bg-gray-700"}`}
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`}
                  >
                    <LayoutDashboard />
                    <span> Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    className={`text-gray-700 dark:text-gray-50 ${pathName.includes("/documents") && "bg-gray-200 dark:bg-gray-700"}`}
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/documents`}
                  >
                    <FileTextIcon />
                    <span>My Documents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    className={`text-gray-700 dark:text-gray-50 ${pathName.includes("/projects") && "bg-gray-200 dark:bg-gray-700"}`}
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/projects`}
                  >
                    <GithubIcon />
                    <span>My Repos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    className={`text-gray-700 dark:text-gray-50 ${pathName.includes("/videos") && "bg-gray-200 dark:bg-gray-700"}`}
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/videos`}
                  >
                    <YoutubeIcon />
                    <span>My YouTube Videos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
