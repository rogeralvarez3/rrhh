import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../components/Login.vue";
import Reports from "../views/Reports.vue";
import Config from "../views/config.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "*",
    redirect: "/login"
  },
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    component: Login,
    name: "login"
  },
  {
    path: "/home",
    name: "home",
    component: Home,
    meta: {
      protected: true
    }
  },
  {
    path: "/reports",
    name: "reports",
    component: Reports
  },
  {
    path: "/config",
    name: "config",
    component: Config
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
