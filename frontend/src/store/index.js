import Vue from "vue";
import Vuex from "vuex";

const axios = require("axios");
const crypto = require("crypto-js");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    backendAddress: "http://178.21.11.35:80/",
    callbackAddress: "http://autio.website/profile",

    apiKey: "e076b6a0b5466b801b098178b3657419",
    apiSecret: "4b941d066e5e18da1aa3d05d4600a3e9",
    apiSig: "",
    sk: "",
    tokenIsTrue: false,

    ytApiKey: "AIzaSyCaLf3qtGQyVx-pExUjQ46DDDyA5iaIAak",
    videoId: null,

    isLogged: false,
    id: "",
    username: "",
    lastfmName: null,

    unique: false,
    mailFound: false,
    tokenFail: false,

    userInfo: {},
    favoriteTracks: [],
    recentTracks: [],

    topTracks: [],
    tags: [
      "Rock",
      "Electronic",
      "Alternative",
      "Pop",
      "Metal",
      "Jazz",
      "Ambient",
      "Experimental",
      "Folk",
      "Punk",
      "Hip-Hop",
      "Instrumental",
      "dance",
      "80s",
      "90s",
      "Hardcore",
      "Soul",
      "Chillout",
      "Classical",
      "Rap",
      "Industrial",
      "Soundtrack",
      "Acoustic",
      "Metalcore",
      "British",
      "Japanese",
      "German",
      "Indie",
      "trance",
    ],
  },

  mutations: {
    setApiSig: (state, value) => {
      state.apiSig = value;
    },

    setSk: (state, value) => {
      state.sk = value;
    },

    setUserLogged: (state, { id, username, isLogged, lastfmName }) => {
      state.id = id;
      state.username = username;
      state.isLogged = isLogged;
      state.lastfmName = lastfmName;
    },

    setUserInfo: (state, value) => {
      state.userInfo = {
        name: value.user.name,
        url: value.user.url,
        image: value.user.image[3]["#text"],
      };
    },

    clearFavoriteTracks: (state) => {
      state.favoriteTracks = [];
    },

    clearRecentTracks: (state) => {
      state.recentTracks = [];
    },

    clearTopTracks: (state) => {
      state.topTracks = [];
    },

    setTracks: (state, { value, type }) => {
      value.forEach((item) => {
        let artist = item.artist.name;
        if (artist === undefined) {
          artist = item.artist;
        }
        if (item.artist["#text"]) {
          artist = item.artist["#text"];
        }
        if (item.listeners === undefined || item.listeners > 1000) {
          let track = {
            name: item.name,
            artist: artist,
            url: item.url,
            image: item.image[3]["#text"],
            listeners: item.listeners,
            playcount: item.playcount,
          };
          type.push(track);
        }
      });
    },

    setTags: (state, value) => {
      value.toptags.tag.forEach((item) => {
        state.tags.push(item.name);
      });
    },

    setTokenIsTrue: (state, value) => {
      state.tokenIsTrue = value;
    },

    setVideoId: (state, value) => {
      state.videoId = value;
    },

    setUnique: (state, value) => {
      state.unique = value;
    },

    setMailFound: (state, value) => {
      state.mailFound = value;
    },

    setTokenFail: (state, value) => {
      state.tokenFail = value;
    },
  },

  actions: {
    async authGetSession({ commit, state }, { token, linked }) {
      let apiSig = crypto
        .MD5(
          `api_key${state.apiKey}methodauth.getSessiontoken${token}${state.apiSecret}`
        )
        .toString();

      try {
        let resp = await axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${state.apiKey}&token=${token}&api_sig=${apiSig}&format=json`
        );

        commit("setTokenIsTrue", true);
        commit("setApiSig", apiSig);
        commit("setSk", resp.data.session.key);

        if (!linked) {
          try {
            let response = await axios.get(
              `${state.backendAddress}users/edit/${state.id}/${resp.data.session.key}/${resp.data.session.name}`
            );
          } catch (e) {
            console.log(e);
          }
        }

        commit("setUserLogged", {
          id: state.id,
          username: state.username,
          isLogged: true,
          lastfmName: resp.data.session.name,
        });
      } catch (e) {
        console.log(e);
      }
    },

    async userGetInfo({ commit, state }) {
      try {
        let resp = await axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${state.lastfmName}&api_key=${state.apiKey}&format=json`
        );

        commit("setUserInfo", resp.data);
      } catch (e) {
        console.log(e);
      }
    },

    async userGetTopTracks({ commit, state }, page) {
      try {
        let resp = await axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${state.lastfmName}&api_key=${state.apiKey}&page=${page}&format=json`
        );
        commit("clearFavoriteTracks");
        commit("setTracks", {
          value: resp.data.toptracks.track,
          type: state.favoriteTracks,
        });
      } catch (e) {
        console.log(e);
      }
    },

    async userGetRecentTracks({ commit, state }, page) {
      try {
        let resp = await axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${state.lastfmName}&api_key=${state.apiKey}&page=${page}&format=json`
        );
        commit("clearRecentTracks");
        commit("setTracks", {
          value: resp.data.recenttracks.track,
          type: state.recentTracks,
        });
      } catch (e) {
        console.log(e);
      }
    },

    async chartGetTopTracks({ commit, state }, page) {
      try {
        let resp = await axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=chart.getTopTracks&api_key=${state.apiKey}&page=${page}&format=json`
        );

        commit("clearTopTracks");
        commit("setTracks", {
          value: resp.data.tracks.track,
          type: state.topTracks,
        });
      } catch (e) {
        console.log(e);
      }
    },

    tagGetTopTags({ commit, state }) {
      try {
        let resp = axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=tag.getTopTags&api_key=${state.apiKey}&format=json`
        );

        commit("setTags", resp.data);
      } catch (e) {
        console.log(e);
      }
    },

    async tagGetTopTracks({ commit, state }, tag, page) {
      try {
        let resp = await axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${tag}&api_key=${state.apiKey}&page=${page}&format=json`
        );

        commit("clearTopTracks");
        commit("setTracks", {
          value: resp.data.tracks.track,
          type: state.topTracks,
        });
      } catch (e) {
        console.log(e);
      }
    },

    async trackSearch({ commit, state }, value, page) {
      try {
        let resp = await axios.get(
          `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${value}&api_key=${state.apiKey}&page=${page}&format=json`
        );

        commit("clearTopTracks");
        commit("setTracks", {
          value: resp.data.results.trackmatches.track,
          type: state.topTracks,
        });
      } catch (e) {
        console.log(e);
      }
    },

    authLogOut: ({ commit }) => {
      commit("clearFavoriteTracks");
      commit("clearRecentTracks");

      commit("setUserLogged", {
        id: "",
        username: "",
        isLogged: false,
        lastfmName: null,
      });

      commit("setSk", "");
    },

    async findVideo({ commit, state }, { trackName, trackArtist }) {
      try {
        let resp = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?videoDefinition=any&part=snippet&videoEmbeddable=true&q=${trackName}+${trackArtist}&type=video&maxResults=1&key=${state.ytApiKey}`
        );
        commit("setVideoId", resp.data.items[0].id.videoId);
      } catch (e) {
        console.log(e);
      }
    },

    closeVideo({ commit }) {
      commit("setVideoId", null);
    },

    async registration({ commit, state }, { mail, login, password }) {
      try {
        let resp = await axios.post(`${state.backendAddress}users/create`, {
          mail: mail,
          login: login,
          password: password,
        });

        commit("setUnique", resp.data.unique);

        try {
          let response = await axios.get(
            `${state.backendAddress}users/create/get_id`
          );

          if (resp.data.unique) {
            commit("setUserLogged", {
              id: response.data.id,
              username: login,
              isLogged: true,
              lastfmName: null,
            });
          }
        } catch (e) {
          console.log(e);
        }
      } catch (e) {
        console.log(e);
      }
    },

    async authorization({ commit, state }, { login, password }) {
      try {
        let resp = await axios.post(`${state.backendAddress}users/auth`, {
          login: login,
          password: password,
        });

        if (!resp.data.user == "") {
          commit("setUserLogged", {
            id: resp.data.user.id,
            username: resp.data.user.login,
            isLogged: true,
            lastfmName: resp.data.user.lastfm_name,
          });

          if (resp.data.user.lastfm_key != null) {
            commit("setSk", resp.data.user.lastfm_key);
          }
        }
      } catch (e) {
        console.log(e);
      }
    },

    async forgotPassword({ commit, state }, mail) {
      try {
        let resp = await axios.get(
          `${state.backendAddress}users/auth/forgot_password/${mail}`
        );

        if (resp.data.success) {
          commit("setMailFound", true);
        } else {
          commit("setMailFound", false);
        }
      } catch (e) {
        console.log(e);
      }
    },

    async resetPassword({ commit, state }, { token, password }) {
      try {
        let resp = await axios.get(
          `${state.backendAddress}users/edit/reset/${token}/${password}`
        );
      } catch (e) {
        console.log(e);
      }
    },

    async resetPasswordTokenCheck({ commit, state }, token) {
      try {
        let resp = await axios.get(
          `${state.backendAddress}users/token_check/${token}`
        );

        if (resp.data.success) {
          commit("setTokenFail", false);
        } else {
          commit("setTokenFail", true);
        }
      } catch (e) {
        console.log(e);
      }
    },

    async afterRefresh({ commit }, { id, username, isLogged, lastfmName, sk }) {
      if (isLogged == "true") {
        await commit("setUserLogged", {
          id: id,
          username: username,
          isLogged: isLogged,
          lastfmName: lastfmName,
        });
        if (sk !== undefined) {
          commit("setSk", sk);
        }
      }
    },
  },

  getters: {
    getTopTracks: (state) => {
      return state.topTracks;
    },

    getFavoriteTracks: (state) => {
      return state.favoriteTracks;
    },

    getRecentTracks: (state) => {
      return state.recentTracks;
    },

    getLastfmName: (state) => {
      return state.lastfmName;
    },

    getIsLogged: (state) => {
      return state.isLogged;
    },

    getUsername: (state) => {
      return state.username;
    },

    getId: (state) => {
      return state.id;
    },

    getUserInfo: (state) => {
      return state.userInfo;
    },

    getSk: (state) => {
      return state.sk;
    },

    getTokenIsTrue: (state) => {
      return state.tokenIsTrue;
    },

    getApiKey: (state) => {
      return state.apiKey;
    },

    getNowPlayingVideoId: (state) => {
      return state.videoId;
    },

    getTags: (state) => {
      return state.tags;
    },

    getUnique: (state) => {
      return state.unique;
    },

    getMailFound: (state) => {
      return state.mailFound;
    },

    getTokenFail: (state) => {
      return state.tokenFail;
    },
  },
});
