<template>
  <v-layout pa-10>
    <v-dialog v-model="dlg" width="800">
      <v-card>
        <v-card-title class="blue-grey lighten-5">
          Registrar salida de vacaciones<v-spacer></v-spacer>
          <v-menu open-on-hover offset-y left>
            <template v-slot:activator="{ on }">
              <v-btn color="success" dark v-on="on" fab small class="mr-2">
                <v-icon>mdi-help</v-icon>
              </v-btn>
            </template>
            <div style="padding:5px;background-color:black;color:white;">
              <p>
                <v-icon dark>mdi-information</v-icon>&nbsp;Seleccione una fecha
                inicial y una fecha final en el calendario
              </p>

              <p style="font-size:12px;font-style:italic;padding-left:20px">
                Nota: Si planea solicitar solo un día, haga click dos veces en
                la fecha deseada.
              </p>
            </div>
          </v-menu>
          <v-btn fab dark top right small color="error" @click="dlg = false"
            ><v-icon>mdi-close</v-icon></v-btn
          ></v-card-title
        >
        <v-divider></v-divider>
        <v-card-text
          ><v-layout row pa-3>
            <v-date-picker
              v-model="dtpick"
              reactive
              range
              locale="es-ni"
              no-title
            ></v-date-picker>
            <table class="detalle" height="380">
              <tr>
                <td>Días acumulados:</td>
                <td>{{ acumulados }}</td>
              </tr>
              <tr>
                <td>Días consumidos:</td>
                <td>{{ consumidos }}</td>
              </tr>
              <tr>
                <td>Días disponibles:</td>
                <td>{{ acumulados - consumidos }}</td>
              </tr>
              <tr>
                <td>Días solicitados:</td>
                <td>{{ solicitados }}</td>
              </tr>
              <tr>
                <td>Fecha de salida:</td>
                <td>
                  {{ fechaEspañol(new Date(salida)) }}
                </td>
              </tr>
              <tr>
                <td>Detalle de días:</td>
                <td>{{ detalle }}</td>
              </tr>
              <tr>
                <td>Observación:</td>
                <td>
                  <textarea
                    v-model="observación"
                    placeholder="Opcional"
                  ></textarea>
                </td>
              </tr></table
          ></v-layout>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="blue-grey lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" fab dark @click="save()" v-if="validar"
            ><v-icon large>mdi-content-save</v-icon></v-btn
          >
          <v-btn v-else fab dark color="grey"
            ><v-icon large>mdi-content-save</v-icon></v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions> </v-card
    ></v-dialog>
    <v-card width="800" v-if="$store.state.selected.id > 0">
      <v-card-title>
        {{ $store.state.selected.nombre }}
        <v-layout top right>
          <v-spacer></v-spacer>
          <v-btn fab dark small color="success" @click="dlg = true"
            ><v-icon>mdi-plus</v-icon></v-btn
          ><v-btn
            fab
            dark
            small
            color="error"
            class="ml-2"
            @click="$store.state.selected.id = 0"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </v-layout>
      </v-card-title>
      <v-card-text
        ><v-simple-table height="400" dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th v-for="col in items" :key="col">
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in $store.state.selected.salidas" :key="f.id">
                <td v-for="cell in items" :key="cell">
                  {{
                    f[cell].toString().indexOf("Date(") >= 0
                      ? new Date(
                          parseInt(
                            f[cell].replace(")/", "").replace("/Date(", "")
                          )
                        ).toLocaleDateString()
                      : f[cell]
                  }}
                </td>
                <td>
                  <v-btn small icon @click="borrar(f.id)" v-if="f.id > 0"
                    ><v-icon small color="red">mdi-close-circle</v-icon></v-btn
                  >
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
    <v-dialog width="800" v-model="dlgPdf">
      <v-card>
        <v-card-title>
          <v-layout row
            >Vista previa<v-spacer></v-spacer
            ><v-btn fab @click="dlgPdf = false"
              ><v-icon>mdi-close</v-icon></v-btn
            ></v-layout
          >
        </v-card-title>
        <v-card-text>
          <iframe :src="pdf" frameborder="1" width="100%" height="600"></iframe>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import jsPDF from "jspdf";
import { ajax } from "jquery";
export default {
  name: "home",
  data() {
    return {
      registros: [],
      observación: "",
      dlg: false,
      dlgPdf: false,
      pdf: "",
      dtpick: [],
      intervalos: [],
      días: [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado"
      ],
      meses: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
      ]
    };
  },
  methods: {
    save: function() {
      var mv = this;
      var data = {
        data: JSON.stringify({
          tabla: "rrhh.salidas",
          data: {
            días: mv.solicitados,
            empleado: mv.$store.state.selected.id,
            fecha: mv.salida,
            detalle: mv.detalle,
            observación: mv.observación,
            saldo: (mv.acumulados - mv.consumidos - mv.solicitados).toString()
          }
        })
      };

      ajax(mv.$store.state.api + "/saveData", {
        method: "POST",
        data: data,
        xhrFields: { withCredentials: true },
        dataType: "json"
      }).then(r => {
        if (r.icon == "success") {
          mv.$store.commit("select", mv.$store.state.selected);
          mv.showPDF();
          mv.dtpick = [];
          mv.intervalos = [];
          mv.observación = "";
          mv.dlg = false;
        }

        mv.$swal(r);
      });
    },
    showPDF: function() {
      var mv = this;
      var doc = new jsPDF("p", "pt", "letter");
      doc.setFontSize(12);
      var imgHeader = `iVBORw0KGgoAAAANSUhEUgAAA7AAAADvCAYAAADLjTh9AAABN2lDQ1BBZG9iZSBSR0IgKDE5OTgpAAAokZWPv0rDUBSHvxtFxaFWCOLgcCdRUGzVwYxJW4ogWKtDkq1JQ5ViEm6uf/oQjm4dXNx9AidHwUHxCXwDxamDQ4QMBYvf9J3fORzOAaNi152GUYbzWKt205Gu58vZF2aYAoBOmKV2q3UAECdxxBjf7wiA10277jTG+38yH6ZKAyNguxtlIYgK0L/SqQYxBMygn2oQD4CpTto1EE9AqZf7G1AKcv8ASsr1fBBfgNlzPR+MOcAMcl8BTB1da4Bakg7UWe9Uy6plWdLuJkEkjweZjs4zuR+HiUoT1dFRF8jvA2AxH2w3HblWtay99X/+PRHX82Vun0cIQCw9F1lBeKEuf1UYO5PrYsdwGQ7vYXpUZLs3cLcBC7dFtlqF8hY8Dn8AwMZP/fNTP8gAAAAJcEhZcwAADsQAAA7EAZUrDhsAAATzaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDItMTJUMDk6NTg6MjUtMDY6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTAyLTEyVDEwOjAwOjQ2LTA2OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTAyLTEyVDEwOjAwOjQ2LTA2OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowN2UwYTc1MC01YTBlLWUyNDQtOGYwNC1kYjI0MDg3MjY5OGIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDdlMGE3NTAtNWEwZS1lMjQ0LThmMDQtZGIyNDA4NzI2OThiIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MDdlMGE3NTAtNWEwZS1lMjQ0LThmMDQtZGIyNDA4NzI2OThiIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowN2UwYTc1MC01YTBlLWUyNDQtOGYwNC1kYjI0MDg3MjY5OGIiIHN0RXZ0OndoZW49IjIwMjAtMDItMTJUMDk6NTg6MjUtMDY6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4m0m0eAACaUklEQVR4nOydeXgUVbr/v6eqt+x0mk120ywiagDDogYVRkwM6Mz8XBLQcbgDCsG5zoyOoKDXcSEaHPWOo4SozGUclYRFQSESUFETkCUgUValw74mnQ7Z091V7++PThXVnU7SHToJ6Pk8z8lT6ao6dc6p7Xzrfc97GBGBw+FwOBwOh8PhcDicSx2hswvA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`;
      var línea = 210;
      var ml = 60;
      doc.addImage(imgHeader, 10, 30, 550, 150);
      doc.text(`Nombre completo:`, ml, 210);
      doc.text(mv.$store.state.selected.nombre, ml + 215, línea);
      línea += 20;
      doc.text(`Cargo:`, ml, línea);
      doc.text(mv.$store.state.selected.cargo, ml + 215, línea);
      línea += 20;
      doc.text(`Fecha de salida:`, ml, línea);
      doc.text(
        mv.salida
          .split("-")
          .reverse()
          .join("/"),
        ml + 215,
        línea
      );
      línea += 20;
      doc.text(`Días autorizados:`, ml, línea);
      doc.text(mv.solicitados.toString(), ml + 215, línea);
      línea += 20;
      doc.text(`Período que corresponde al:`, ml, línea);
      var year = mv.$store.state.fecha.split("/")[2];
      doc.text(mv.período + " del " + year, ml + 215, línea);
      var fecha = mv.fechaEspañol();
      línea += 40;
      doc.text(`Nueva Guinea, ${fecha}`, ml, línea);
      línea += 40;
      doc.text("_______________________", ml, línea);
      doc.text("_______________________", ml + 265, línea);
      línea += 20;
      doc.text("Firma del interesado", ml, línea);
      doc.text("Firma del jefe inmediato", ml + 265, línea);
      línea += 40;
      doc.text("_______________________", ml, línea);
      línea += 20;
      doc.text("Gerencia general", ml, línea);
      línea += 20;
      doc.text(
        "______________________________________________________________________________________",
        ml,
        línea
      );
      línea += 40;
      doc.setFontType("bold");
      doc.text("PARA USO ADMINISTRATIVO", ml, línea);
      doc.setFontType("normal");
      línea += 20;
      var diasAcum = mv.acumulados - mv.consumidos;
      doc.text(`Días acumulados: ${diasAcum}`, ml, línea);
      línea += 20;
      var diasPend = mv.acumulados - mv.consumidos - mv.solicitados;
      doc.text(`Días pendientes: ${diasPend}`, ml, línea);

      var base64 = doc.output("dataurlstring");
      mv.pdf = base64;
      mv.dlgPdf = true;
    },
    fechaEspañol: function(fecha) {
      var mv = this;

      var miFecha = new Date();
      if (fecha) {
        miFecha = fecha;
      }

      var día = miFecha.getDate();
      var mes = miFecha.getMonth();
      var año = miFecha.getFullYear();
      var nomDía = miFecha.getDay();
      var result =
        mv.días[nomDía] +
        " " +
        día +
        " de " +
        mv.meses[mes] +
        " del año " +
        año;
      if (result.toString().indexOf("undefined") >= 0) {
        result = "";
      }
      return result;
    },
    borrar: function(id) {
      var mv = this;
      mv.$swal({
        icon: "question",
        text: "Haga click en aceptar para proceder.",
        title: "¿Quiere borrar registro?",
        showCancelButton: true
      }).then(r => {
        if (r.value) {
          ajax(mv.$store.state.api + "/delete", {
            method: "post",
            data: {
              data: JSON.stringify({
                tabla: "rrhh.salidas",
                id: id
              })
            },
            xhrFields: { withCredentials: true }
          }).then(r => {
            if (r.icon == "success") {
              mv.$store.commit("select", mv.$store.state.selected);
            }
            mv.$swal(r);
          });
        }
      });
    }
  },
  computed: {
    items: function() {
      return Object.keys(this.$store.state.selected.salidas[0]).filter(it => {
        return it != "empleado" && it != "id" && it != "timestamp";
      });
    },
    acumulados: function() {
      var mv = this;
      var mes = mv.$store.state.fecha.split("/")[1];
      return (mes - 1) * 2.5 + mv.$store.state.selected.saldo;
    },
    consumidos: function() {
      var consumidos = 0;
      this.$store.state.selected.salidas.forEach(it => {
        if (it.días) {
          consumidos += it.días;
        }
      });
      return consumidos;
    },
    período: function() {
      var mv = this;
      if (mv.consumidos - mv.$store.state.selected.saldo > 15) {
        return "2do semestre";
      } else if (
        mv.consumidos - mv.$store.state.selected.saldo + mv.solicitados <=
        15
      ) {
        return "1er semestre";
      } else {
        return (
          15 -
          mv.consumidos +
          " días del 1er semestre y " +
          (mv.solicitados + mv.consumidos - 15) +
          " días del 2do semestre"
        );
      }
    },
    solicitados: function() {
      var mv = this;
      var result = 0;
      if (mv.dtpick.length > 1) {
        mv.dtpick = mv.dtpick.sort();
        mv.intervalos = Object.assign([], mv.dtpick);

        var dif =
          (Date.parse(mv.intervalos[1]) - Date.parse(mv.intervalos[0])) /
          60 /
          60 /
          24 /
          1000;
        for (var i = 1; i < dif; i++) {
          var newD = mv.intervalos[0].split("-");
          newD[2] = (parseInt(newD[2]) + i).toString().padStart(2, "0");
          newD = newD.join("-");
          mv.intervalos.push(newD);
        }
        mv.intervalos = mv.intervalos.sort();
        mv.intervalos.forEach(d => {
          var myD = new Date(d);
          if (dif + 1 >= 7) {
            if (myD.getDay() != 5) {
              result += 1;
            } else {
              result += 0.5;
            }
          } else {
            if (myD.getDay() != 6) {
              if (myD.getDay() != 5) {
                result += 1;
              } else {
                result += 0.5;
              }
            }
          }
        });
        if (
          new Date(mv.intervalos[0]).getDay() == 6 ||
          new Date(mv.intervalos[mv.intervalos.length]).getDay() == 6
        ) {
          result -= 1;
        }
      }

      if (mv.dtpick.length == 2 && mv.dtpick[0] == mv.dtpick[1]) {
        if (new Date(mv.dtpick[0]).getDay() == 5) {
          result = 0.5;
        } else if (new Date(mv.dtpick[0]).getDay() == 6) {
          result = 0;
        } else {
          result = 1;
        }
      }
      return result.toString();
    },
    salida: function() {
      var mv = this;

      var result = "";
      if (mv.dtpick.length > 0) {
        var fechas = Object.assign([], mv.dtpick);
        fechas = fechas.sort();
        result = new Date(fechas[0]);
        result.setDate(result.getDate() + 1);
        if (result.getDay() == 0) {
          result.setDate(result.getDate() + 1);
        }
        result = new Date(result).toLocaleDateString();
      }
      return result
        .split("/")
        .reverse()
        .join("-");
    },
    detalle: function() {
      var result = "";
      var mv = this;
      var fechas = Object.assign([], mv.intervalos);
      fechas = fechas.sort();
      if (fechas.length < 7) {
        var domingo = fechas.findIndex(f => {
          var myF = new Date(f);
          myF = myF.setDate(myF.getDate());
          return new Date(myF).getDay() == 6;
        });
        if (domingo >= 0) {
          fechas.splice(domingo, 1);
        }
      }

      if (new Date(fechas[0]).getDay() == 6) {
        fechas.shift();
      }
      if (new Date(fechas[fechas.length - 1]).getDay() == 6) {
        fechas.pop();
      }
      fechas.forEach(int => {
        var myD = new Date(int);
        myD.setDate(myD.getDate() + 1);
        result +=
          mv.días[parseInt(myD.getDay())] +
          " " +
          parseInt(myD.getDate()) +
          ", ";
      });
      result = result.substr(0, result.length - 2);
      var spl = result.split(", ");
      if (spl.length == 2) {
        if (spl[0] == spl[1]) {
          result = spl[0];
        }
      }
      return result;
    },
    validar: function() {
      var mv = this;
      var result = true;
      if (mv.solicitados <= 0 || mv.salida == "" || mv.detalle == "") {
        result = false;
      }

      return result;
    }
  },
  mounted: function() {
    if (Object.keys(this.$store.state.user).length == 0) {
      this.$router.push("login");
      return;
    }
  }
};
</script>
<style>
.detalle {
  margin-left: 10px;
  border-radius: 3px;
  box-shadow: 0 1px 3px #aaa;
  padding: 5px;
}

.detalle tr td {
  border: none;

  vertical-align: top;
  padding: 5px;
}
.detalle tr td textarea {
  width: 260px;
  overflow: auto;
  font-style: italic;
}
.detalle tr td:first-child {
  font-weight: bold;
}
.detalle tr td:last-child {
  width: 260px;
  overflow: auto;
}
.detalle tr td {
  border-bottom: 1px solid #ddd;
}
</style>
