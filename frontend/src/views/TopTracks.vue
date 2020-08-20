<template>
  <v-container class="d-flex flex-column align-center">
    <!-- video player -->
    <div
      id="divVideo"
      style="position: fixed; right: 20px; bottom: 135px; top: auto;"
      aria-hidden="false"
      hidden
    >
      <div style="position: relative">
        <v-btn
          icon
          style="display: block; position: absolute; top: -36px; right: 0;"
          @click="closeAudio"
        >
          <v-icon>mdi-close-circle-outline</v-icon>
        </v-btn>
        <div id="video"></div>
      </div>
    </div>

    <!-- audio player controller -->
    <div class="text-center">
      <v-bottom-sheet
        inset
        hide-overlay
        persistent
        no-click-animation
        v-model="isAudioSelected"
      >
        <v-card tile>
          <v-btn
            class="pa-0"
            x-small
            block
            depressed
            tile
            :ripple="false"
            @click="updatePlayerTime"
          >
            <v-progress-linear v-model="audioProgress" class="y-0" height="20">
            </v-progress-linear>
          </v-btn>

          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  {{ nowPlayingArtist }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ nowPlayingName }}
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-content>
                <v-list-item-title v-text="currentTime"></v-list-item-title>
                <v-list-item-subtitle v-text="duration"></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-icon>
                <v-btn
                  :disabled="selectedTrack == 0"
                  icon
                  @click="previousAudio"
                >
                  <v-icon>mdi-rewind</v-icon>
                </v-btn>
              </v-list-item-icon>

              <v-list-item-icon
                :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }"
              >
                <v-btn icon @click="pauseAudio">
                  <v-icon v-if="isAudioPlaying">mdi-pause</v-icon>
                  <v-icon v-else>mdi-play</v-icon>
                </v-btn>
              </v-list-item-icon>

              <v-list-item-icon
                class="ml-0"
                :class="{ 'mr-3': $vuetify.breakpoint.mdAndUp }"
              >
                <v-btn
                  :disabled="selectedTrack == tracks.length - 1"
                  icon
                  @click="nextAudio"
                >
                  <v-icon>mdi-fast-forward</v-icon>
                </v-btn>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </v-card>
      </v-bottom-sheet>
    </div>

    <div>
      <v-tabs fixed-tabs>
        <v-tab :ripple="false">Жанры</v-tab>

        <!-- Genres -->
        <v-tab-item>
          <v-card class="mx-auto my-2" width="850">
            <v-card-text class="d-flex flex-column">
              <div class="mx-3 d-flex justify-space-between"></div>
              <v-chip-group :value="tags" column>
                <v-chip
                  v-for="tag in tags"
                  :key="tag"
                  outlined
                  :ripple="false"
                  filter
                  @click="tagClick(tag)"
                >
                  {{ tag }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab :ripple="false">Поиск</v-tab>

        <!-- Search -->
        <v-tab-item>
          <div style="width: 850px" class="mb-3">
            <v-text-field
              v-model="searchValue"
              label="Поиск"
              hide-details="auto"
              clearable
              @change="searchChange"
            ></v-text-field>
          </div>
        </v-tab-item>
      </v-tabs>
    </div>

    <!-- songs -->
    <v-responsive
      class="d-flex flex-column overflow-y-auto align-center"
      max-height="520"
    >
      <div class="mt-2" v-if="searchNotFound">
        Ничего не найдено
      </div>
      <div v-else>
        <v-card
          width="600"
          class="ma-1 white--text"
          :color="selectedTrack == index ? 'green darken-3' : 'green lighten-1'"
          outlined
          tile
          v-for="(track, index) in tracks"
          :key="index"
          @click="playAudio(index)"
        >
          <v-layout>
            <v-flex xs1>
              <v-avatar class="ma-2" size="40" tile>
                <v-img :src="track.image"></v-img>
              </v-avatar>
            </v-flex>
            <v-flex xs6>
              <v-layout fill-height justify-center column>
                <v-card-text class="py-0" v-text="track.artist"></v-card-text>
                <v-card-title
                  class="py-0 subtitle-2"
                  v-text="track.name"
                ></v-card-title>
              </v-layout>
            </v-flex>
            <v-flex>
              <v-layout fill-height justify-center column>
                <v-card-text
                  v-if="track.playcount !== undefined"
                  class="py-0 caption"
                  v-text="'Кол-во прослушиваний: ' + track.playcount"
                ></v-card-text>
                <v-card-text
                  v-if="track.listeners !== undefined"
                  class="py-0 caption"
                  v-text="'Кол-во слушателей: ' + track.listeners"
                ></v-card-text>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card>
      </div>
    </v-responsive>
    <div v-if="!searchNotFound && searchValue == null" class="text-center mt-4">
      <v-pagination
        v-model="page"
        :length="20"
        :total-visible="7"
        @input="pageChange"
      ></v-pagination>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "TopTracks",

  data: function() {
    return {
      player: null,

      selectedTag: null,

      searchValue: null,
      searchNotFound: false,

      pageFor: "top",
      page: 1,

      selectedTrack: null,
      isAudioSelected: false,
      isAudioPlaying: false,

      audioProgress: 0,
      currentTime: "",
      duration: "",

      nowPlayingArtist: "",
      nowPlayingName: "",
    };
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
    }

    this.ytApiLoad();

    await this.$store.dispatch("chartGetTopTracks", 1);
  },

  methods: {
    async pageChange() {
      if (this.pageFor == "top") {
        await this.$store.dispatch("chartGetTopTracks", this.page);
      } else if (this.pageFor == "tag") {
        await this.$store.dispatch("tagGetTopTracks", this.page);
      } else {
        await this.$store.dispatch("trackSearch", this.page);
      }
    },

    async searchChange() {
      this.searchNotFound = false;
      if (this.searchValue != null) {
        await this.$store.dispatch("trackSearch", this.searchValue, 1);
        this.pageFor = "search";
        if (this.tracks == "") {
          this.searchNotFound = true;
        }
      } else {
        await this.$store.dispatch("chartGetTopTracks", 1);
        this.pageFor = "top";
      }
      this.selectedTrack = null;
    },

    async tagClick(tag) {
      this.searchValue = null;
      if (this.selectedTag == null || this.selectedTag != tag) {
        this.selectedTag = tag;
        await this.$store.dispatch("tagGetTopTracks", tag, 1);
        this.pageFor = "tag";
      } else {
        this.selectedTag = null;
        await this.$store.dispatch("chartGetTopTracks", 1);
        this.pageFor = "top";
      }
      this.selectedTrack = null;
    },

    ytApiLoad() {
      let script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";

      let firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(script, firstScriptTag);

      script.onerror = function() {
        console.warn("Ошибка при загрузке	" + script.src);
      };

      script.onload = () => {
        console.info(script.src + "	успешно загружен");
        this.waitForYtLoad(script);
      };
    },

    waitForYtLoad(script) {
      if (typeof YT.Player === "function") {
        this.onYouTubeIframeAPIReady();
      } else {
        let body = document.getElementsByTagName("body")[0];
        body.removeChild(script);
        this.ytApiLoad();
      }
    },

    onYouTubeIframeAPIReady() {
      this.player = new YT.Player("video", {
        height: "281",
        width: "500",
        playerVars: {
          style:
            "margin-top: -281px; width: 500px; height: 281px; position: static; bottom: auto; left: auto; display: block;",
          autoplay: "1",
          enablejsapi: "1",
          origin: "http://autio.website",
          iv_load_policy: "3",
          rel: "0",
          controls: "0",
          disablekb: "1",
        },
        events: {
          onReady: this.onPlayerReady,
          onStateChange: this.onPlayerStateChange,
        },
      });
    },

    onPlayerReady(event) {
      let update = setInterval(() => {
        this.updateTimerDisplay();
        this.updateProgressBar();
      }, 1000);
    },

    onPlayerStateChange(event) {
      if (event.data == YT.PlayerState.PLAYING) {
        this.isAudioPlaying = true;
      } else {
        this.isAudioPlaying = false;
      }

      if (event.data == YT.PlayerState.ENDED) {
        if (
          this.selectedTrackType != this.tracks.length - 1
        ) {
          this.nextAudio();
        } else {
          this.stopVideo();
        }
      }
    },

    stopVideo() {
      this.player.stopVideo();
      this.$store.dispatch("closeVideo");
    },

    updateTimerDisplay() {
      this.currentTime = this.formatTime(this.player.getCurrentTime());
      this.duration = this.formatTime(this.player.getDuration());
    },

    formatTime(time) {
      time = Math.floor(time);
      let minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      return minutes + ":" + seconds;
    },

    updateProgressBar() {
      this.audioProgress =
        (this.player.getCurrentTime() / this.player.getDuration()) * 100;
    },

    updatePlayerTime() {
      let newTime = (this.player.getDuration() * this.audioProgress) / 100;
      this.player.seekTo(newTime);
      this.updateTimerDisplay();
      this.updateProgressBar();
    },

    async playAudio(id) {
      if (this.selectedTrack != id) {
        this.selectedTrack = id;
        this.isAudioSelected = true;
        this.audioProgress = 0;

        this.nowPlayingName = this.tracks[id].name;
        this.nowPlayingArtist = this.tracks[id].artist;

        await this.$store.dispatch("findVideo", {
          trackName: this.tracks[id].name,
          trackArtist: this.tracks[id].artist,
        });

        this.player.loadVideoById(this.nowPlayingVideoId);

        let divVideo = document.getElementById("divVideo");
        divVideo.removeAttribute("hidden");
      }
    },

    closeAudio() {
      let divVideo = document.getElementById("divVideo");
      divVideo.setAttribute("hidden", true);

      this.stopVideo();

      this.selectedTrack = null;
      this.isAudioSelected = false;
    },

    pauseAudio() {
      if (this.isAudioPlaying) {
        this.player.pauseVideo();
      } else {
        this.player.playVideo();
      }
    },

    previousAudio() {
      this.playAudio(this.selectedTrack - 1);
    },

    nextAudio() {
      this.playAudio(this.selectedTrack + 1);
    },
  },

  computed: {
    tracks() {
      return this.$store.getters.getTopTracks;
    },
    nowPlayingVideoId() {
        return this.$store.getters.getNowPlayingVideoId;
    },
    tags() {
      return this.$store.getters.getTags;
    },
  },
};
</script>