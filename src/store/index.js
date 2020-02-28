import Vue from "vue";
import Vuex from "vuex";
import jquery from "jquery";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    api: "http://coopefacsa.coop:85/commons.asmx",
    //api: "http://localhost:81/commons.asmx",
    user: {},
    fecha: "",
    subordinates: [],
    selected: {
      id: 0,
      nombre: "",
      salidas: [{ "Este empleado no ha salido de vacaciones": "" }],
      saldo: 0
    }
  },
  mutations: {
    setUser: (state, payload) => {
      state.user = payload;
      sessionStorage.setItem("user", JSON.stringify(payload));
    },
    setDate: (state, payload) => {
      Vue.set(state, "fecha", payload);
    },
    setSubordinates: (state, payload) => {
      state.subordinates = payload;
    },
    select: (state, payload) => {
      Vue.set(state.selected, "id", payload.id);
      Vue.set(state.selected, "nombre", payload.nombre);
      Vue.set(state.selected, "cargo", payload.cargo);
      jquery
        .ajax(state.api + "/getData", {
          method: "post",
          xhrFields: { withCredentials: true },
          data: {
            data: JSON.stringify({
              tabla: "rrhh.salidas",
              campos: "*",
              condición: `empleado='${payload.id}'`
            })
          }
        })
        .then(r => {
          if (r.icon == "success") {
            if (r.data.length > 0) {
              Vue.set(state.selected, "salidas", r.data);
            } else {
              Vue.set(state.selected, "salidas", [
                { "Este empleado no ha salido de vacaciones": "" }
              ]);
            }
          }
        });
      jquery
        .ajax(state.api + "/getData", {
          method: "post",
          xhrFields: { withCredentials: true },
          data: {
            data: JSON.stringify({
              tabla: "rrhh.`saldo anterior`",
              campos: "saldo",
              condición: `idEmpleado='${payload.id}'`
            })
          }
        })
        .then(r => {
          if (r.icon == "success" && r.data.length > 0) {
            if (r.data[0].saldo) {
              Vue.set(state.selected, "saldo", r.data[0].saldo);
            }
          }
        });
    }
  },
  actions: {},
  modules: {}
});
