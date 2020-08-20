import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/views/Home";
import TopTracks from "@/views/TopTracks";
import Auth from "@/views/Auth"
import Reg from "@/views/Reg";
import Profile from "@/views/Profile"
import ForgotPassword from "@/views/ForgotPassword"
import ResetPassword from "@/views/ResetPassword"
import About from "@/views/About"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/topTracks",
    name: "TopTracks",
    component: TopTracks,
  },
  {
    path: "/auth",
    name: "Auth",
    component: Auth,
  },
  {
    path: "/auth/forgot_password",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  {
    path: "/auth/reset_password/:token",
    name: "ResetPassword",
    component: ResetPassword,
  },
  {
    path: "/auth/reset_password",
    redirect: '/auth'
  },
  {
    path: "/reg",
    name: "Reg",
    component: Reg,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;