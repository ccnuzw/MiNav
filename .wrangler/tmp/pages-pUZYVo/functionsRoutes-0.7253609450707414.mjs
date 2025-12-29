import { onRequestDelete as __api_admin_categories__id__js_onRequestDelete } from "/Users/mac/Progame/MiNav/functions/api/admin/categories/[id].js"
import { onRequestPut as __api_admin_categories__id__js_onRequestPut } from "/Users/mac/Progame/MiNav/functions/api/admin/categories/[id].js"
import { onRequestDelete as __api_admin_items__id__js_onRequestDelete } from "/Users/mac/Progame/MiNav/functions/api/admin/items/[id].js"
import { onRequestPut as __api_admin_items__id__js_onRequestPut } from "/Users/mac/Progame/MiNav/functions/api/admin/items/[id].js"
import { onRequestGet as __api_admin_categories_js_onRequestGet } from "/Users/mac/Progame/MiNav/functions/api/admin/categories.js"
import { onRequestPost as __api_admin_categories_js_onRequestPost } from "/Users/mac/Progame/MiNav/functions/api/admin/categories.js"
import { onRequestGet as __api_admin_items_js_onRequestGet } from "/Users/mac/Progame/MiNav/functions/api/admin/items.js"
import { onRequestPost as __api_admin_items_js_onRequestPost } from "/Users/mac/Progame/MiNav/functions/api/admin/items.js"
import { onRequestPost as __api_auth_login_js_onRequestPost } from "/Users/mac/Progame/MiNav/functions/api/auth/login.js"
import { onRequestGet as __api_public_data_js_onRequestGet } from "/Users/mac/Progame/MiNav/functions/api/public/data.js"
import { onRequestPost as __api_public_submit_js_onRequestPost } from "/Users/mac/Progame/MiNav/functions/api/public/submit.js"
import { onRequestGet as __api_setup_js_onRequestGet } from "/Users/mac/Progame/MiNav/functions/api/setup.js"
import { onRequest as ___middleware_js_onRequest } from "/Users/mac/Progame/MiNav/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/admin/categories/:id",
      mountPath: "/api/admin/categories",
      method: "DELETE",
      middlewares: [],
      modules: [__api_admin_categories__id__js_onRequestDelete],
    },
  {
      routePath: "/api/admin/categories/:id",
      mountPath: "/api/admin/categories",
      method: "PUT",
      middlewares: [],
      modules: [__api_admin_categories__id__js_onRequestPut],
    },
  {
      routePath: "/api/admin/items/:id",
      mountPath: "/api/admin/items",
      method: "DELETE",
      middlewares: [],
      modules: [__api_admin_items__id__js_onRequestDelete],
    },
  {
      routePath: "/api/admin/items/:id",
      mountPath: "/api/admin/items",
      method: "PUT",
      middlewares: [],
      modules: [__api_admin_items__id__js_onRequestPut],
    },
  {
      routePath: "/api/admin/categories",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_categories_js_onRequestGet],
    },
  {
      routePath: "/api/admin/categories",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_categories_js_onRequestPost],
    },
  {
      routePath: "/api/admin/items",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_items_js_onRequestGet],
    },
  {
      routePath: "/api/admin/items",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_items_js_onRequestPost],
    },
  {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/public/data",
      mountPath: "/api/public",
      method: "GET",
      middlewares: [],
      modules: [__api_public_data_js_onRequestGet],
    },
  {
      routePath: "/api/public/submit",
      mountPath: "/api/public",
      method: "POST",
      middlewares: [],
      modules: [__api_public_submit_js_onRequestPost],
    },
  {
      routePath: "/api/setup",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_setup_js_onRequestGet],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]