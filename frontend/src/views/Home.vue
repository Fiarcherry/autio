<template>
  <v-container class="pa-0" fluid>
    <v-img height="920" gradient="to top right, rgba(0,0,0,.5), rgba(0,0,0,.5)" src="../assets/background.jpg">
      <v-layout fill-height fill-width justify-center align-center>
        <span class="display-4 white--text">Autio</span>
      </v-layout>
    </v-img>
    
  </v-container>
</template>

<script>
export default {
  name: "Home",
  
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