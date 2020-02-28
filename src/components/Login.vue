<template>
  <v-layout row wrap class="justify-center" pa-5>
    <form @submit.prevent="login()">
      <v-card width="450">
        <v-card-title class="blue-grey lighten-5">
          Identifícate
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="Usuario o correo:"
            v-model="user"
            prepend-inner-icon="mdi-account"
            autocomplete="username"
          ></v-text-field>
          <v-text-field
            label="Contraseña:"
            v-model="pass"
            prepend-inner-icon="mdi-key"
            :append-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="showPass = !showPass"
            :type="!showPass ? 'password' : 'text'"
            autocomplete="current-password"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">Entrar</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </form>
  </v-layout>
</template>

<script>
/* eslint-disable no-console */
//import Axios from "axios";
import jquery from "jquery";
export default {
  data() {
    return {
      user: "",
      pass: "",
      showPass: false
    };
  },
  methods: {
    login: function() {
      var mv = this;
      const url = `${mv.$store.state.api}/login`;
      const params = {
        user: mv.user,
        password: mv.pass
      };
      jquery
        .ajax(url, {
          method: "POST",
          data: params,
          xhrFields: { withCredentials: true }
        })
        .then(r => {
          console.log(r);
          if (r.icon == "success") {
            mv.$store.commit("setUser", r.data);
            var logData = {
              file: "sessions",
              date: new Date().toLocaleDateString(),
              text: `${r.data.nombre} ha iniciado sesión`
            };
            jquery
              .ajax(`${mv.$store.state.api}/log`, {
                method: "post",
                data: logData,
                xhrFields: { withCredentials: true }
              })
              .then(r => {
                console.log(r);
              });
            mv.getSubordinates();
          } else {
            mv.$swal(r);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    getSubordinates: function() {
      var mv = this;
      var userId = mv.$store.state.user.id;
      var params = {
        data: JSON.stringify({
          condición: `jefe_inmediato=${userId}`,
          tabla: "usuarios.usuarios",
          campos: "id,nombre,cargo"
        })
      };
      jquery
        .ajax(`${mv.$store.state.api}/getData`, {
          method: "POST",
          data: params,
          xhrFields: { withCredentials: true }
        })
        .then(r => {
          if (r.icon == "success") {
            if (r.data.length > 0) {
              mv.$store.commit("setSubordinates", r.data);
              mv.$router.push("home");
            } else {
              sessionStorage.removeItem("user");
              mv.$store.commit("setUser", {});
              this.$swal({
                icon: "warning",
                title: "Acceso denegado",
                text: "Usted no tiene subordinados a su cargo"
              });
            }
          } else {
            console.log(r);
          }
        });
    }
  },
  mounted: function() {
    var mv = this;
    jquery
      .ajax(`${mv.$store.state.api}/isLogged`, {
        method: "POST",
        xhrFields: { withCredentials: true },
        dataType: "json"
      })
      .then(r => {
        var user = JSON.parse(sessionStorage.getItem("user"));
        if (r.logged && Object.keys(user).length > 0) {
          mv.$store.commit("setUser", user);
          mv.getSubordinates();
        }
      });
  }
};
</script>

<style></style>
