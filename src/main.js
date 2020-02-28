import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import swal from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import JsonExcel from "vue-json-excel";

import router from "./router";

Vue.config.productionTip = false;
Vue.use(Vuex);
Vue.use(swal);
Vue.component("downloadExcel", JsonExcel);
import store from "./store";
new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount("#app");
