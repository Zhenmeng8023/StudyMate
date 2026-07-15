import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
  type RouterHistory
} from "vue-router";
import AdminRouteWorkspacePage from "../pages/AdminRouteWorkspacePage.vue";
import { adminRoutes, defaultAdminRouteKey, getAdminRoutePath } from ".";

export const adminAppRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: getAdminRoutePath(defaultAdminRouteKey)
  },
  {
    path: "/admin",
    redirect: getAdminRoutePath(defaultAdminRouteKey)
  },
  ...adminRoutes.map((route) => ({
    path: route.path,
    component: AdminRouteWorkspacePage,
    props: {
      routeView: route.key
    }
  })),
  {
    path: "/:pathMatch(.*)*",
    redirect: getAdminRoutePath(defaultAdminRouteKey)
  }
];

export function createAdminAppRouter(
  history: RouterHistory = createWebHistory()
): Router {
  return createRouter({
    history,
    routes: adminAppRoutes
  });
}
