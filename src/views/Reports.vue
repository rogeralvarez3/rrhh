<template>
  <v-app>
    <v-container
      v-if="minusc($store.state.user.cargo) == 'jefe de recursos humanos'"
    >
      <v-card width="900">
        <v-card-title class="blue-grey lighten-5 pt-0 pb-0">
          <v-flex row pa-2 pb-0
            ><div class="mt-0 mb-0">Resumen de vacaciones</div>
            <v-spacer></v-spacer
            ><v-text-field
              v-model="search"
              label="Buscar..."
              prepend-inner-icon="mdi-magnify"
              dense
              outlined
            ></v-text-field>

            <download-excel
              :data="xlsItems"
              workSheet="Hoja1"
              name="resumen_de_vacaciones.xls"
              :title="`Resumen de vacaciones al ${$store.state.fecha}`"
            >
              <v-btn small icon
                ><v-icon color="green">mdi-file-excel</v-icon></v-btn
              > </download-excel
            >&nbsp;
            <v-btn icon small @click="$router.push('home')" class="mt-1"
              ><v-icon color="red">mdi-close-circle</v-icon></v-btn
            >
          </v-flex>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-simple-table dense class="elevation-1">
            <template v-slot:default>
              <thead>
                <tr style="background-color:#eee">
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Sucursal</th>
                  <th style="text-align:right">Pendiente</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in xlsItems" :key="i">
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.cargo }}</td>
                  <td>{{ item.sucursal }}</td>
                  <td style="text-align:right">
                    {{ item.pendiente }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-container>
    <v-container pa-5 v-else>
      <v-card width="500">
        <v-card-title
          >No tiene acceso a esta función<v-spacer></v-spacer
          ><v-btn small icon @click="$router.push('login')"
            ><v-icon color="red">mdi-close-circle</v-icon></v-btn
          ></v-card-title
        >
        <v-card-text>
          <v-icon large color="orange">mdi-information</v-icon>Esta función solo
          le está permitida al jefe de recursos humanos.
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>
<script>
import { ajax } from "jquery";

export default {
  data() {
    return {
      headers: ["Nombre", "Cargo", "Sucursal", "Pendiente"],
      items: [],
      search: ""
    };
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
    getResumen: function() {
      var mv = this;
      var data = {
        data: JSON.stringify({
          tabla: "rrhh.view_resumen",
          campos: "*",
          opciones: "order by sucursal,nombre"
        })
      };
      ajax(mv.$store.state.api + "/getData", {
        method: "post",
        xhrFields: { withCredentials: true },
        data: data
      }).then(r => {
        if (r.icon == "success") {
          mv.items = r.data;
        } else {
          mv.$swal(r);
        }
      });
    }
  },
  computed: {
    xlsItems: function() {
      var mv = this;
      var result = [];
      mv.items.forEach(item => {
        var newItem = {};
        Object.keys(item).forEach(k => {
          if (k != "saldo" && k != "salidas" && k != "id") {
            newItem[k] = item[k];
          }
        });
        newItem.pendiente =
          item.saldo -
          item.salidas +
          (parseInt(mv.$store.state.fecha.split("/")[1]) - 1) * 2.5;

        result.push(newItem);
      });
      result = result.filter(item => {
        return (
          (
            item.cargo +
            " " +
            item.nombre +
            " " +
            item.sucursal +
            " " +
            item.pendiente
          )
            .toString()
            .toLowerCase()
            .indexOf(mv.search.toString().toLowerCase()) >= 0
        );
      });
      return result;
    }
  },
  mounted: function() {
    if (this.$store.state.user.id == 0) {
      this.$router.push("login");
    }
    this.getResumen();
  }
};
</script>
