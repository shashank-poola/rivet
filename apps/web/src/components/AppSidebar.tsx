import { useState } from "react";
import { User, Folder, FileText, BookOpen } from "lucide-react";
import rivetLogo from "@/assets/rivet-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { ProjectDialog } from "@/components/ProjectDialog";

const profileImages = [
  "/assets/profile1.png",
  "/assets/profile2.jpg",
  "/assets/profile3.jpg",
  "/assets/profile4.jpg",
];

// Get a random profile based on session (persists during the session)
const getRandomProfile = () => {
  const storedIndex = sessionStorage.getItem('userProfileIndex');
  if (storedIndex !== null) {
    return profileImages[parseInt(storedIndex)];
  }
  const randomIndex = Math.floor(Math.random() * profileImages.length);
  sessionStorage.setItem('userProfileIndex', randomIndex.toString());
  return profileImages[randomIndex];
};

interface Project {
  id: string;
  name: string;
}

const mainItems = [
  { title: "Personal", url: "/personal", icon: User },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Documentation", url: "/documentation", icon: BookOpen },
];

export function AppSidebar() {
  const userName = "Shashank";
  const userProfile = getRandomProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
    };
    setProjects([...projects, newProject]);
  };

  return (
    <>
      <Sidebar className="border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <a href="/" className="flex items-center gap-2">
            <img src={rivetLogo} alt="Rivet" className="h-6 w-auto" />
          </a>
        </div>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/projects/${project.id}`} 
                        className="hover:bg-sidebar-accent" 
                        activeClassName="bg-sidebar-accent text-sidebar-primary"
                      >
                        <Folder className="h-4 w-4" />
                        <span>{project.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className="hover:bg-sidebar-accent cursor-pointer"
                    onClick={() => setShowProjectDialog(true)}
                  >
                    <Folder className="h-4 w-4" />
                    <span>+ Add project</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <img 
              src={userProfile} 
              alt="Profile" 
              className="w-9 h-9 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">{userName}</div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <ProjectDialog 
        open={showProjectDialog} 
        onOpenChange={setShowProjectDialog}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}
