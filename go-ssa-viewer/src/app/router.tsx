import SSAViewerPage from "@/features/ssa/routes/ssa-viewer-page";
import { RootLayout } from "@/routes/root-layout";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import ProjectPage from "@/features/ssa/routes/project-page";

const queryClient = new QueryClient()


const router = createBrowserRouter([
    {
        path: "/",
        Component: RootLayout,
        children: [
            { index: true, Component: SSAViewerPage },
            {
                path: "/project",
                Component: ProjectPage
            }
        ]
    }
]);

function AppRouterProvider() {


    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    )
}

export default AppRouterProvider