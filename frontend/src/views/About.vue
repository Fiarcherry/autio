<template>
  <div class="d-flex justify-center">
    <div style="margin-top: 40px; width: 600px">
      <p class="display-1 text-center">О нас</p>
      <div v-for="item in items" :key="item.id">
        <v-card class="px-3">
          <v-card-text class="headline text-justify">
            {{ item.text }}
          </v-card-text>
        </v-card>
        <v-divider class="my-2"></v-divider>
      </div>
    </div>
  </div>
</template>

<script>
const items = [
  {
    id: 1,
    text: `На протяжении нескольких десятилетий два неделимых понятия: музыка и
        компьютер основательно вошли в нашу жизнь как что-то обыденное и само
        собой разумеющееся.`,
  },
  {
    id: 2,
    text: `Большинство из нас прослушивают музыку во время работы с документами, на
        фоне игры или просто «под настроение». Некоторые занимаются ею
        профессионально, создавая собственные композиции.`,
  },
  {
    id: 3,
    text: `Данное WEB-приложение позволяет прослушивать музыку во время занятия
        работой или же во время отдыха для поднятия уровня досуга.`,
  },
];

export default {
  name: "About",
  
  data: () => ({
    items,
  }),

  async created() {
    if (localStorage.isLogged) {
      await this.$store.dispatch("afterRefresh", {
        id: localStorage.id,
        username: localStorage.username,
        isLogged: localStorage.isLogged,
        lastfmName: localStorage.lastfmName,
        sk: localStorage.sk,
      });
    }
  },
};
</script>