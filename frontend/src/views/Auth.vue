<template>
  <v-row justify="center">
    <v-col cols="6" sm="5" md="4" lg="3">
      <v-card ref="form">
        <v-card-title class="d-flex justify-center">Авторизация</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form class="width-l" v-model="valid">
            <v-text-field
              v-model="login"
              :rules="[rules.fieldRequired]"
              label="Логин"
              outlined
            ></v-text-field>
            <v-text-field
              v-model="password"
              :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[rules.fieldRequired]"
              :type="show ? 'text' : 'password'"
              label="Пароль"
              outlined
              @click:append="show = !show"
            ></v-text-field>
            <v-btn small color="primary" to="/auth/forgot_password" text
              >Восстановить пароль</v-btn
            >
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="primary" text :disabled="!valid" @click="authorization">
            Авторизоваться
          </v-btn>
          <v-progress-circular
            v-if="dataCheck"
            indeterminate
            color="primary"
          ></v-progress-circular>
          <v-snackbar v-model="dataFail" color="error" :timeout="6000">
            Неверный логин и/или пароль
            <v-btn dark text @click="dataFail = false">
              <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
          </v-snackbar>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
const axios = require("axios");

export default {
  name: "Auth",

  data: function() {
    return {
      valid: true,

      show: false,

      dataFail: false,
      dataCheck: false,

      login: "",
      password: "",

      rules: {
        fieldRequired: (v) => !!v || "Поле обязательно",
      },
    };
  },

  computed: {
    isLogged() {
      return this.$store.getters.getIsLogged;
    },
    id() {
      return this.$store.getters.getId;
    },
    username() {
      return this.$store.getters.getUsername;
    },
    isLogged() {
      return this.$store.getters.getIsLogged;
    },
    lastfmName() {
      return this.$store.getters.getLastfmName;
    },
    sk() {
      return this.$store.getters.getSk;
    },
  },

  methods: {
    async authorization() {
      this.dataCheck = true;

      await this.$store.dispatch("authorization", {
        login: this.login,
        password: this.password,
      });

      this.dataCheck = false;

      if (this.isLogged) {
        localStorage.setItem("id", this.id);
        localStorage.setItem("username", this.username);
        localStorage.setItem("isLogged", this.isLogged);

        if (this.sk != "") {
          localStorage.setItem("sk", this.sk);
          localStorage.setItem("lastfmName", this.lastfmName);
        }

        this.$router.push("/profile");
        return;
      } else {
        this.dataFail = true;
      }
    },
  },
};
</script>