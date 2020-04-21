<template>
  <v-container>
    <v-card width="600">
      <v-card-title class="blue-grey lighten-5">
        Días feriados
        <v-spacer></v-spacer>
        <v-btn
          fab
          dark
          small
          color="success"
          class="mr-2"
          @click="
            mode = 'Agregar';
            id='';
            mes='';
            día='';
            descripción='';
            dlg = true;"
        >
          <v-icon small>mdi-plus</v-icon>
        </v-btn>
        <v-btn fab dark small color="error" @click="$router.push('home')">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-simple-table dense>
          <template>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Día</th>
                <th>Descripción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in días" :key="d.fecha">
                <td>{{ $store.state.meses.filter(m=>{return m.value==d.mes})[0].text }}</td>
                <td>{{ d.día }}</td>
                <td>{{ d.descripción }}</td>
                <td>
                  <v-layout row>
                    <v-btn icon dark small color="red" @click="borrar(d.id)">
                      <v-icon small>mdi-close</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      dark
                      small
                      color="primary"
                      @click="
                        mode = 'Editar';
                        id = d.id;
                        día=d.día
                        mes=d.mes;
                        descripción=d.descripción;
                        dlg = true;"
                    >
                      <v-icon small>mdi-pencil</v-icon>
                    </v-btn>
                  </v-layout>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
    <v-dialog width="500" v-model="dlg">
      <v-card>
        <v-card-title class="grey lighten-4">
          {{ mode }}
          <v-spacer></v-spacer>
          <v-btn
            fab
            small
            dark
            color="red"
            @click="
              dlg = false;
              modo = null;"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-layout>
            <v-select label="Mes:" v-model="mes" :items="$store.state.meses"></v-select>
            <v-select label="Día:" v-model="día" :items="díasDelMes"></v-select>
            <span style="width:200px"></span>
          </v-layout>

          <v-text-field type="text" label="Descripción:" v-model="descripción"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn fab dark small color="primary" @click="guardar()">
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ajax } from "jquery";
export default {
  data() {
    return {
      mode: "Agregar",
      id: "",
      día: null,
      mes: null,
      descripción: "",
      dlg: false
    };
  },
  methods: {
    guardar: function() {
      var mv = this;
      var data = {
        data: JSON.stringify({
          tabla: "rrhh.feriados",
          data: {
            id: mv.id.toString(),
            día: mv.día.toString(),
            mes: mv.mes.toString(),
            descripción: mv.descripción
          }
        })
      };
      ajax(mv.$store.state.api + "/saveData", {
        method: "POST",
        data: data,
        xhrFields: { withCredentials: true },
        dataType: "json"
      }).then(res => {
        if (res.icon == "success") {
          mv.$store.commit("setDías", [
            {
              id: res.data.id,
              día: mv.día,
              mes: mv.mes,
              descripción: mv.descripción
            }
          ]);
        }
        mv.$swal(res);
        mv.dlg = false;
      });
    },
    borrar: function(id) {
      var mv = this;
      mv.$swal({
        icon: "question",
        showCancelButton: true,
        text: "Click en OK para proceder",
        title: "Se borrará el registro"
      }).then(r => {
        if (r.value) {
          var data = {
            data: JSON.stringify({ tabla: "rrhh.feriados", id: id })
          };
          ajax(mv.$store.state.api + "/delete", {
            method: "post",
            data: data,
            xhrFields: { withCredentials: true }
          }).then(res => {
            mv.getDays();
            mv.$swal(res);
          });
        }
      });
    }
  },
  computed: {
    díasDelMes: function() {
      var mv = this;
      var result = [];
      var mes = mv.$store.state.meses.filter(m => {
        return m.value == mv.mes;
      });
      if (mes.length > 0) {
        for (var i = 1; i <= mes[0].cont; i++) {
          result.push({ value: i, text: i.toString().padStart(2, "0") });
        }
      } else {
        result = [];
      }

      return result;
    },
    días: function() {
      return this.$store.state.feriados;
    }
  },
  mounted: function() {}
};
</script>

<style></style>
