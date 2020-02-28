<template>
  <v-app>
    <v-navigation-drawer clipped app>
      <v-list>
        <v-list-item
          v-for="sub in $store.state.subordinates"
          :key="sub.id"
          @click="
            $router.push('home');
            $store.commit('select', sub);
          "
        >
          <v-list-item-content>
            <v-list-item-title>{{ sub.nombre }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon
            ><v-icon>mdi-arrow-right-drop-circle</v-icon></v-list-item-icon
          >
        </v-list-item></v-list
      >
      <v-divider></v-divider>
      <v-list-item
        to="/reports"
        v-if="minusc($store.state.user.cargo) == 'jefe de recursos humanos'"
      >
        <v-list-item-content>
          <v-list-item-title><h3>Reporte</h3></v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon><v-icon>mdi-pie-chart</v-icon></v-list-item-icon>
      </v-list-item>
      <v-list-item @click="logout()" v-if="$store.state.user.id > 0">
        <v-list-item-content>
          <v-list-item-title><h3>Salir</h3></v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon><v-icon>mdi-exit-to-app</v-icon></v-list-item-icon>
      </v-list-item>
    </v-navigation-drawer>
    <v-app-bar clipped-left app>
      <v-toolbar-title><h2>Programa de vacaciones</h2></v-toolbar-title>
      <v-spacer></v-spacer>

      <div>Fecha: {{ fecha }}</div>
    </v-app-bar>
    <v-content><router-view></router-view> </v-content>
  </v-app>
</template>

<script>
/* eslint-disable no-console */
import jquery from "jquery";
export default {
  name: "App",

  data: () => ({
    //
  }),
  computed: {
    fecha: function() {
      return this.$store.state.fecha;
    }
  },
  methods: {
    minusc: function(text) {
      if (!text) {
        return "";
      }
      if (text.length > 0) {
        return text.toLowerCase();
      } else {
        return "";
      }
    },
    logout: function() {
      var mv = this;
      jquery
        .ajax(mv.$store.state.api + "/logout", { method: "POST" })
        .then(r => {
          if (r.icon == "success") {
            sessionStorage.removeItem("user");
            var logData = {
              file: "sessions",
              date: new Date().toLocaleDateString(),
              text: `${mv.$store.state.user.nombre} ha cerrado sesión`
            };
            mv.$store.commit("setUser", {});
            mv.$store.commit("setSubordinates", []);
            mv.$store.commit("select", {
              id: 0,
              nombre: "",
              salidas: [{ "Este empleado no ha salido de vacaciones": "" }]
            });
            mv.$router.push("login");

            jquery
              .ajax(`${mv.$store.state.api}/log`, {
                method: "post",
                data: logData,
                xhrFields: { withCredentials: true }
              })
              .then(r => {
                console.log(r);
              });
          } else {
            mv.$swal(r);
          }
        });
    }
  },
  mounted: function() {
    var mv = this;
    jquery
      .ajax(`${mv.$store.state.api}/getDate`, {
        method: "post",
        dataType: "json"
      })
      .then(r => {
        mv.$store.commit("setDate", r.fecha);
      });
  }
};
</script>
<style>
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
</style>
