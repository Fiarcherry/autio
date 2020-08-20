<template>
  <v-container>
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
                  :disabled="
                    selectedTrackType
                      ? selectedTrack == favoriteTracks.length - 1
                      : selectedTrack == recentTracks.length - 1
                  "
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

    <v-responsive class="d-flex flex-column overflow-y-auto align-center">
      <v-card class="d-flex pa-2" width="600" outlined tile>
        <v-lazy transition="fade-transition">
          <div class="d-flex align-center justify-space-between">
            <v-avatar v-if="sk != ''" class="ma-3" size="121" tile>
              <v-img :src="userInfo.image"></v-img>
            </v-avatar>
            <v-card-title v-text="username"></v-card-title>
            <v-btn
              v-if="sk == ''"
              outlined
              href="http://www.last.fm/api/auth/?api_key=e076b6a0b5466b801b098178b3657419&cb=http://autio.website/profile"
              >Привязать к Last.fm</v-btn
            >
          </div>
        </v-lazy>
      </v-card>
      <v-divider class="my-3"></v-divider>
      <div>
        <v-tabs fixed-tabs>
          <v-tab
            v-if="favoriteTracks.length > 0"
            :ripple="false"
            @click="tabChange"
            >Частые треки</v-tab
          >
          <v-tab-item>
            <!-- favorite tracks -->
            <v-responsive
              class="d-flex flex-column overflow-y-auto align-center"
              max-height="500"
            >
              <v-card
                width="600"
                class="ma-1 white--text"
                :color="
                  selectedTrack == index && selectedTrackType
                    ? 'green darken-3'
                    : 'green lighten-1'
                "
                outlined
                tile
                v-for="(track, index) in favoriteTracks"
                :key="index"
                @click="playAudio(index, favoriteTracks, tab)"
              >
                <v-layout>
                  <v-flex xs1>
                    <v-avatar class="ma-2" size="40" tile>
                      <v-img :src="track.image"></v-img>
                    </v-avatar>
                  </v-flex>
                  <v-flex xs6>
                    <v-layout fill-height justify-center column>
                      <v-card-text
                        class="py-0"
                        v-text="track.artist"
                      ></v-card-text>
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
            </v-responsive>
          </v-tab-item>
          <v-tab
            v-if="recentTracks.length > 0"
            :ripple="false"
            @click="tabChange"
            >Недавние треки</v-tab
          >
          <v-tab-item>
            <!-- recent tracks -->
            <v-responsive
              class="d-flex flex-column overflow-y-auto align-center"
              max-height="500"
            >
              <v-card
                width="600"
                class="ma-1 white--text"
                :color="
                  selectedTrack == index && !selectedTrackType
                    ? 'green darken-3'
                    : 'green lighten-1'
                "
                outlined
                tile
                v-for="(track, index) in recentTracks"
                :key="index"
                @click="playAudio(index, recentTracks, tab)"
              >
                <v-layout>
                  <v-flex xs1>
                    <v-avatar class="ma-2" size="40" tile>
                      <v-img :src="track.image"></v-img>
                    </v-avatar>
                  </v-flex>
                  <v-flex xs6>
                    <v-layout fill-height justify-center column>
                      <v-card-text
                        class="py-0"
                        v-text="track.artist"
                      ></v-card-text>
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
            </v-responsive>
          </v-tab-item>
        </v-tabs>
      </div>
    </v-responsive>
  </v-container>
</template>

<script>
export default {
  name: "Profile",

  data: () => {
    return {
      player: null,

      selectedTrack: null,
      selectedTrackType: true,
      tab: true,

      selectedTrack: null,
      isAudioSelected: false,
      isAudioPlaying: false,

      audioProgress: 0,
      currentTime: "",
      duration: "",

      nowPlayingArtist: "",
      nowPlayingName: "",

      logged: null,
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
    
    if (this.isLogged) {
      if (this.sk == "") {
        if (this.$route.query.token !== undefined) {
          await this.$store.dispatch("authGetSession", {
            token: this.$route.query.token,
            linked: this.sk == "" ? false : true,
          });

          localStorage.setItem("sk", this.sk);
          localStorage.setItem("lastfmName", this.lastfmName);

          if (!this.tokenIsTrue) {
            this.$router.push("/profile");
            return;
          }
        }
      }

      if (this.sk != "") {
        this.$store.dispatch("userGetInfo");
        this.$store.dispatch("userGetTopTracks");
        this.$store.dispatch("userGetRecentTracks");
        this.ytApiLoad();
      }
    } else {
      this.$router.push("/auth");
      return;
    }
  },

  methods: {
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
          this.selectedTrackType
            ? this.selectedTrack != this.favoriteTracks.length - 1
            : this.selectedTrack != this.recentTracks.length - 1
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

    tabChange() {
      this.tab = !this.tab;
    },

    async playAudio(id, tracks, trackType) {
      if (this.selectedTrack != id) {
        this.selectedTrack = id;
        this.selectedTrackType = trackType;
        this.isAudioSelected = true;
        this.audioProgress = 0;

        this.nowPlayingName = tracks[id].name;
        this.nowPlayingArtist = tracks[id].artist;

        await this.$store.dispatch("findVideo", {
          trackName: tracks[id].name,
          trackArtist: tracks[id].artist,
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
      let tracks =
        this.selectedTrackType == true
          ? this.favoriteTracks
          : this.recentTracks;
      this.playAudio(this.selectedTrack - 1, tracks, this.selectedTrackType);
    },

    nextAudio() {
      let tracks =
        this.selectedTrackType == true
          ? this.favoriteTracks
          : this.recentTracks;
      this.playAudio(this.selectedTrack + 1, tracks, this.selectedTrackType);
    },
  },
  computed: {
    username() {
      return this.$store.getters.getUsername;
    },
    userInfo() {
      return this.$store.getters.getUserInfo;
    },
    sk() {
      return this.$store.getters.getSk;
    },
    isLogged() {
      return this.$store.getters.getIsLogged;
    },
    lastfmName() {
      return this.$store.getters.getLastfmName;
    },
    tokenIsTrue() {
      return this.$store.getters.getTokenIsTrue;
    },
    favoriteTracks() {
      return this.$store.getters.getFavoriteTracks;
    },
    recentTracks() {
      return this.$store.getters.getRecentTracks;
    },
    nowPlayingVideoId() {
      return this.$store.getters.getNowPlayingVideoId;
    },
  },
};
</script>