<template>
  <v-row justify="center">
    <v-col cols="6" sm="5" md="4" lg="3">
      <v-card ref="form">
        <v-card-title class="d-flex justify-center">Регистрация</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form class="width-l" v-model="valid">
            <v-text-field
              v-model="mail"
              :rules="[rules.fieldRequired, rules.mail]"
              maxlength="50"
              label="Почта"
              outlined
            ></v-text-field>
            <v-text-field
              v-model="login"
              :rules="[
                rules.fieldRequired,
                rules.withoutSymbols,
                rules.minLength,
              ]"
              counter
              maxlength="30"
              label="Логин"
              outlined
            ></v-text-field>
            <v-text-field
              v-model="password"
              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[rules.fieldRequired, rules.minLength]"
              :type="show1 ? 'text' : 'password'"
              counter
              maxlength="30"
              label="Пароль"
              outlined
              @click:append="show1 = !show1"
            ></v-text-field>
            <v-text-field
              v-model="passwordConfirmation"
              :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[rules.fieldRequired, rules.passwordMatch]"
              :type="show2 ? 'text' : 'password'"
              label="Повторите пароль"
              outlined
              @click:append="show2 = !show2"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="primary" text :disabled="!valid" @click="registration">
            Зарегистрироваться
          </v-btn>
          <v-progress-circular
            v-if="uniqueCheck"
            indeterminate
            color="primary"
          ></v-progress-circular>
          <v-snackbar v-model="uniqueFail" color="error" :timeout="6000">
            Пользователь с такой почтой или логином уже зарегистрирован
            <v-btn dark text @click="uniqueFail = false">
              <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
          </v-snackbar>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
export default {
  name: "Reg",

  data: function() {
    return {
      valid: true,

      show1: false,
      show2: false,

      uniqueFail: false,
      uniqueCheck: false,

      mail: "",
      login: "",
      password: "",
      passwordConfirmation: "",

      rules: {
        fieldRequired: (v) => !!v || "Поле обязательно",
        minLength: (v) => v.length >= 6 || "Минимум 6 символов",
        mail: (v) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(v) || "Почта должна быть правильной";
        },
        withoutSymbols: (v) => {
          const pattern = /^[a-zA-Z0-9]+$/;
          return pattern.test(v) || "Не должен содержать специальные символы";
        },
        passwordMatch: (v) =>
          (!!v && v) === this.password || "Пароли должны совпадать",
      },
    };
  },

  computed: {
    unique() {
      return this.$store.getters.getUnique;
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
  },

  methods: {
    async registration() {
      this.uniqueCheck = true;

      await this.$store.dispatch("registration", {
        mail: this.mail,
        login: this.login,
        password: this.password,
      });

      this.uniqueCheck = false;

      if (!this.unique) {
        this.uniqueFail = true;
      } else {
        localStorage.setItem("id", this.id);
        localStorage.setItem("username", this.username);
        localStorage.setItem("isLogged", this.isLogged);
        localStorage.setItem("lastfmName", this.lastfmName);

        this.$router.push("/profile");
      }
    },
  },
};
</script>