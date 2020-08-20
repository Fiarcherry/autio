<template>
  <v-row justify="center">
    <v-col cols="6" sm="5" md="4" lg="3">
      <v-card ref="form">
        <v-card-title class="d-flex justify-center"
          >Восстановить пароль</v-card-title
        >
        <v-divider></v-divider>
        <v-card-text>
          <v-form class="width-l" v-model="valid">
            <v-text-field
              v-model="mail"
              :rules="[rules.fieldRequired, rules.mail]"
              label="Почта"
              outlined
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex justify-center">
          <v-btn
            color="primary"
            text
            :disabled="!valid"
            @click="forgotPassword"
          >
            Восстановить пароль
          </v-btn>
        </v-card-actions>
        <v-snackbar v-model="mailFoundFail" color="error" :timeout="6000">
          Пользователь с такой почтой не зарегистрирован
          <v-btn dark text @click="mailFoundFail = false">
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-btn>
        </v-snackbar>
        <v-snackbar v-model="sent" color="success" :timeout="6000">
          Сообщение было отправлено
          <v-btn dark text @click="sent = false">
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-btn>
        </v-snackbar>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "ForgotPassword",

  data: function() {
    return {
      valid: true,

      mail: "",
      mailFoundFail: false,

      sent: false,

      rules: {
        fieldRequired: (v) => !!v || "Поле обязательно",

        mail: (v) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(v) || "Почта должна быть правильной";
        },
      },
    };
  },

  computed: {
    mailFound() {
      return this.$store.getters.getMailFound;
    },
  },

  async created() {
    if (localStorage.isLogged) {
      await this.$store.dispatch("afterRefresh", {
        id: localStorage.id,
        username: localStorage.username,
        isLogged: localStorage.isLogged,
        lastfmName: localStorage.lastfmName,
        sk: localStorage.sk,
      });

      this.$router.push("/");
      return;
    }
  },

  methods: {
    async forgotPassword() {
      await this.$store.dispatch("forgotPassword", this.mail);

      if (this.mailFound) {
        this.sent = true;
      } else {
        this.mailFoundFail = true;
      }
    },
  },
};
</script>