import SSAViewerPage from "@/features/ssa/routes/ssa-viewer-page";
import { RootLayout } from "@/routes/root-layout";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";


const router = createBrowserRouter([
    {
        path: "/",
        Component: RootLayout,
        children: [
            { index: true, Component: SSAViewerPage }
        ]
    },
]);

function AppRouterProvider() {
    return (
        <RouterProvider router={router} />
    )
}

export default AppRouterProvider