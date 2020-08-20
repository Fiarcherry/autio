<template>
  <v-row justify="center">
    <v-btn
      v-if="tokenFail"
      class="mt-12"
      to="/auth/forgot_password"
      color="primary"
      text
    >
      Ссылка на восстановление пороля неверна, повторите попытку
    </v-btn>
    <v-col v-else cols="6" sm="5" md="4" lg="3">
      <v-card ref="form">
        <v-card-title class="d-flex justify-center"
          >Установить новый пароль</v-card-title
        >
        <v-divider></v-divider>
        <v-card-text>
          <v-form class="width-l" v-model="valid">
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
          <v-btn color="primary" text :disabled="!valid" @click="resetPassword">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "ResetPassword",

  data: function() {
    return {
      valid: true,

      show1: false,
      show2: false,

      password: "",
      passwordConfirmation: "",

      rules: {
        fieldRequired: (v) => !!v || "Поле обязательно",
        minLength: (v) => v.length >= 6 || "Минимум 6 символов",
        passwordMatch: (v) =>
          (!!v && v) === this.password || "Пароли должны совпадать",
      },
    };
  },

  computed: {
    tokenFail() {
      return this.$store.getters.getTokenFail;
    },
  },

  async created() {
    await this.$store.dispatch("afterRefresh", {
        id: localStorage.id,
        username: localStorage.username,
        isLogged: localStorage.isLogged,
        lastfmName: localStorage.lastfmName,
        sk: localStorage.sk,
      });

    if (localStorage.isLogged) {
      this.$router.push("/");
      return;
    }

    await this.$store.dispatch(
      "resetPasswordTokenCheck",
      this.$route.params.token
    );
  },

  methods: {
    async resetPassword() {
      this.$router.push("/auth");
      return;
    },
  },
};
</script>