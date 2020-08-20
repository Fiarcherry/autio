<template>
  <v-app>
    <v-app-bar app color="primary" dark hide-on-scroll>
      <div style="width:100%" class="d-flex flex-no-wrap justify-space-between">
        <div>
          <v-btn to="/" text>
            Главная страница
          </v-btn>
          <v-btn to="/about" text>
            О нас
          </v-btn>
          <v-btn to="/topTracks" text>
            Популярные треки
          </v-btn>
        </div>
        <div class="d-flex align-center">
          <template v-if="!isLogged">
            <v-btn to="/auth" text>
              Авторизация
            </v-btn>
            <v-btn to="/reg" text>
              Регистрация
            </v-btn>
          </template>
          <template v-if="isLogged">
            <v-btn to="/profile" text>
              {{ username }}
            </v-btn>
            <v-btn @click="logOut" to="/auth" text>
              Выход
            </v-btn>
          </template>

          <v-switch
            v-model="$vuetify.theme.dark"
            hide-details
            label="Тёмная тема"
            color="black"
          ></v-switch>
        </div>
      </div>
    </v-app-bar>

    <v-slide-y-transition mode="out-in">
      <router-view style="padding-top: 70px; padding-bottom: 140px">
      </router-view>
    </v-slide-y-transition>

    <v-footer absolute>
      <v-row justify="center" no-gutters>
        <div>
          <v-btn to="/" text class="my-2">
            Главная страница
          </v-btn>
          <v-btn to="/about" text class="my-2">
            О нас
          </v-btn>
          <v-btn to="/topTracks" text class="my-2">
            Популярные треки
          </v-btn>
        </div>
        <div class="d-flex align-center">
          <template v-if="!isLogged">
            <v-btn to="/auth" text class="my-2">
              Авторизация
            </v-btn>
            <v-btn to="/reg" text class="my-2">
              Регистрация
            </v-btn>
          </template>
          <template v-if="isLogged">
            <v-btn to="/profile" text class="my-2">
              {{ username }}
            </v-btn>
            <v-btn @click="logOut" to="/auth" text>
              Выход
            </v-btn>
          </template>
        </div>
        <v-col class="py-4 text-center" cols="12">
          Autio - Copyright © {{ new Date().getFullYear() }}
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
const axios = require("axios");

export default {
  name: "App",

  computed: {
    isLogged() {
      return this.$store.getters.getIsLogged;
    },
    username() {
      return this.$store.getters.getUsername;
    },
  },

  methods: {
    logOut() {
      localStorage.removeItem("id");
      localStorage.removeItem("username");
      localStorage.removeItem("isLogged");
      localStorage.removeItem("lastfmName");
      localStorage.removeItem("sk");
      this.$store.dispatch("authLogOut");
    },
  },
};
</script>