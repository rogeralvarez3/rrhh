/* eslint-disable no-console */
import Vue from "vue";
import Vuex from "vuex";
import { ajax } from "jquery";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    //api: "https://localhost:44350/commons.asmx", //visual studio
    //api: "http://coopefacsa.coop:85/commons.asmx", //server
    //api: "http://localhost:81/commons.asmx", //localhost
    api: "/commons.asmx", //production
    user: {},
    fecha: "",
    subordinates: [],
    selected: {
      id: 0,
      nombre: "",
      salidas: [{ "Este empleado no ha salido de vacaciones": "" }],
      saldo: 0,
    },
    meses: [
      { value: 1, text: "enero", cont: 31 },
      { value: 2, text: "febrero", cont: 28 },
      { value: 3, text: "marzo", cont: 31 },
      { value: 4, text: "abril", cont: 30 },
      { value: 5, text: "mayo", cont: 31 },
      { value: 6, text: "junio", cont: 30 },
      { value: 7, text: "julio", cont: 30 },
      { value: 8, text: "agosto", cont: 31 },
      { value: 9, text: "septiembre", cont: 30 },
      { value: 10, text: "octubre", cont: 31 },
      { value: 11, text: "noviembre", cont: 30 },
      { value: 12, text: "diciembre", cont: 31 },
    ],
    feriados: [],
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
      ajax(state.api + "/getData", {
        method: "post",
        xhrFields: { withCredentials: true },
        data: {
          data: JSON.stringify({
            tabla: "rrhh.salidas",
            campos: "*",
            condición: `empleado='${payload.id}'`,
          }),
        },
      }).then((r) => {
        if (r.icon == "success") {
          if (r.data.length > 0) {
            Vue.set(state.selected, "salidas", r.data);
          } else {
            Vue.set(state.selected, "salidas", [
              { "Este empleado no ha salido de vacaciones": "" },
            ]);
          }
        }
      });
      ajax(state.api + "/getData", {
        method: "post",
        xhrFields: { withCredentials: true },
        data: {
          data: JSON.stringify({
            tabla: "rrhh.`saldo anterior`",
            campos: "saldo",
            condición: `idEmpleado='${payload.id}'`,
          }),
        },
      }).then((r) => {
        if (r.icon == "success" && r.data.length > 0) {
          if (r.data[0].saldo) {
            Vue.set(state.selected, "saldo", r.data[0].saldo);
          }
        }
      });
    },
    setDías: (state, payload) => {
      var año = new Date().getFullYear();
      payload.forEach((d) => {
        var miFecha = Date.parse(`${año}-${d.mes}-${d.día}`);
        state.feriados.push(miFecha);
      });
    },
  },
  actions: {
    getHollyDays: function(context) {
      var data = {
        data: JSON.stringify({ tabla: "rrhh.feriados", campos: "*" }),
      };
      ajax(context.state.api + "/getData", {
        method: "post",
        xhrFields: { withCredentials: true },
        data: data,
      }).then((res) => {
        if (res.icon == "success") {
          if (res.data.length > 0) {
            context.commit("setDías", res.data);
          }
        } else {
          // eslint-disable-next-line no-console
          console.log(res);
        }
      });
    },
  },
  modules: {},
});
